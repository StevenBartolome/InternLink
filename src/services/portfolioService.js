import { supabase } from './supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = apiKey && apiKey !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(apiKey)
  : null;

// A4 layout constants (mm). Font: Helvetica (nearest to Arial in jsPDF)
const PW = 210; const PH = 297;
const ML = 31.75; const MR = 25.4; const MT = 25.4; const MB = 25.4;
const CW = PW - ML - MR;
const LH = 7.2; // ~1.5 line-spacing for 11pt

export const portfolioService = {

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  async fetchAllData(internshipId) {
    const [intRes, rptRes, actRes, attRes] = await Promise.all([
      supabase.from('student_internships').select('*, companies(*)').eq('id', internshipId).maybeSingle(),
      supabase.from('weekly_activity_reports').select('*').eq('internship_id', internshipId).order('week_number'),
      supabase.from('daily_activities').select('id, log_date, description').eq('internship_id', internshipId).order('log_date'),
      supabase.from('attendance_logs').select('*').eq('internship_id', internshipId).in('status', ['LOGGED', 'DEDUCTED']).order('log_date'),
    ]);

    const internship = intRes.data || {};
    const weeklyReports = (rptRes.data || []).map(r => {
      let summary = r.summary || '';
      if (summary.includes('---ACTIVITIES_JSON---')) {
        summary = summary.split('---ACTIVITIES_JSON---')[0].trim();
      }
      return { ...r, summary };
    });

    return {
      internship,
      company: internship.companies || {},
      weeklyReports,
      activities: actRes.data || [],
      attendance: attRes.data || [],
    };
  },

  // ─── AI REFLECTION GENERATION ─────────────────────────────────────────────

  _buildReflectionPrompt(student, data) {
    const { weeklyReports, internship, company } = data;
    const companyName = company?.name || internship?.company_name || 'the company';
    const position = internship?.position || 'intern';
    const totalHours = internship?.rendered_hours || 0;

    const reportsText = weeklyReports.length
      ? weeklyReports.map(r => {
          let t = `Week ${r.week_number}${r.week_label ? ` (${r.week_label})` : ''}`;
          if (r.summary) t += `\nSummary: ${r.summary}`;
          if (r.skills_learned) t += `\nSkills: ${r.skills_learned}`;
          if (r.challenges) t += `\nChallenges: ${r.challenges}`;
          return t;
        }).join('\n\n')
      : 'No weekly reports available.';

    return `You are an academic writing assistant. Write a formal 5-page Personal Reflection for a student's internship portfolio.

Student: ${student.first_name || ''} ${student.last_name || ''}
Program: ${student.course_code || 'BSIT'}
Company: ${companyName}
Position: ${position}
Total Hours Completed: ${totalHours}

Weekly Activity Reports:
${reportsText}

Requirements:
- Approximately 2,500–3,000 words
- Write in first person
- Formal academic tone
- No bullet points in body text (prose paragraphs only)
- Use **HEADING** format for exactly these 6 section headings:
  **INTRODUCTION**
  **DESCRIPTION OF INTERNSHIP EXPERIENCE**
  **COURSES MOST RELEVANT TO THE INTERNSHIP**
  **PERSONAL AND PROFESSIONAL GROWTH**
  **ACHIEVEMENTS AND CONTRIBUTIONS TO THE COMPANY**
  **RECOMMENDATIONS FOR THE INTERNSHIP PROGRAM**
- Each section: 3–5 paragraphs
- Return ONLY the reflection text with the bold headings. No extra commentary.`;
  },

  async generateReflection(student, data) {
    const prompt = this._buildReflectionPrompt(student, data);

    // ── Try Gemini first ──────────────────────────────────────────────────
    if (genAI) {
      try {
        console.log('[Portfolio] Generating reflection with Gemini 2.5 Flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        console.log('[Portfolio] Gemini succeeded.');
        return text;
      } catch (geminiErr) {
        console.warn('[Portfolio] Gemini failed, falling back to Claude:', geminiErr.message);
      }
    } else {
      console.warn('[Portfolio] Gemini not configured. Trying Claude...');
    }

    // ── Fallback: Claude via server proxy ─────────────────────────────────
    try {
      console.log('[Portfolio] Generating reflection with Claude (claude-sonnet-4-6)...');
      const response = await fetch('/api/claude/generate-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      // Guard: server may return HTML (e.g. 502 if server not running)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const raw = await response.text();
        throw new Error(
          response.ok
            ? 'Server returned non-JSON response.'
            : `Server error ${response.status} — make sure the backend server is running (npm run server).`
        );
      }

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Claude API failed');
      console.log('[Portfolio] Claude succeeded.');
      return result.text;
    } catch (claudeErr) {
      throw new Error(`Claude fallback failed: ${claudeErr.message}`);
    }
  },

  // ─── DOCUMENT UPLOAD ──────────────────────────────────────────────────────

  async uploadPortfolioDoc(internshipId, docType, docLabel, file) {
    const ext = file.name.split('.').pop();
    const path = `portfolio/${internshipId}/${docType}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('documents')
      .upload(path, file, { upsert: true });
    if (upErr) throw upErr;

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

    // Best-effort metadata save (table may not exist yet)
    try {
      await supabase.from('portfolio_documents').upsert(
        { internship_id: internshipId, doc_type: docType, document_name: docLabel, file_url: publicUrl, submitted_at: new Date().toISOString() },
        { onConflict: 'internship_id,doc_type' }
      );
    } catch (_) {}

    return publicUrl;
  },

  async loadPortfolioDocs(internshipId) {
    try {
      const { data } = await supabase
        .from('portfolio_documents')
        .select('*')
        .eq('internship_id', internshipId);
      const map = {};
      (data || []).forEach(d => { map[d.doc_type] = { url: d.file_url, name: d.document_name, source: 'upload' }; });
      return map;
    } catch (_) {
      return {};
    }
  },

  // Maps a pre-internship document name to a portfolio doc slot ID via keyword matching.
  // Returns null if no match found.
  _matchDocToSlot(docName) {
    const n = docName.toLowerCase();
    const rules = [
      { id: 'resume',                  keywords: ['resume', 'curriculum vitae', ' cv'] },
      { id: 'certificate_completion',  keywords: ['certificate of completion'] },
      { id: 'medical_certificate',     keywords: ['medical certificate', 'medical cert'] },
      { id: 'parent_consent',          keywords: ['parent consent', 'guardian consent', 'parental consent', 'parent/guardian'] },
      { id: 'recommendation_letter',   keywords: ['recommendation letter', 'letter of recommendation'] },
      { id: 'ccit_orientation_cert',   keywords: ['ccit orientation', 'orientation certificate', 'orientation cert'] },
      { id: 'student_evaluation',      keywords: ['student evaluation', 'internship evaluation', 'evaluation of the internship', 'evaluation form'] },
      { id: 'evidence_achievements',   keywords: ['evidence of achievement', 'certificate of recognition', 'certificate of award'] },
      { id: 'cert_attendance_seminar', keywords: ['certificate of attendance', 'seminar', 'workshop for interns'] },
    ];
    for (const rule of rules) {
      if (rule.keywords.some(kw => n.includes(kw))) return rule.id;
    }
    return null;
  },

  // Fetches all documents uploaded in pre-internship and during-internship stages
  // and returns a map keyed by portfolio doc slot ID.
  // Only includes documents that have a file_url (i.e., actually uploaded).
  async fetchPreStageFiles(internshipId) {
    const map = {};

    try {
      // 1. Pre-internship required documents
      const [preRes, addRes] = await Promise.all([
        supabase.from('pre_internship_documents').select('document_name, file_url, status').eq('internship_id', internshipId),
        supabase.from('additional_requirements').select('document_name, file_url, status').eq('internship_id', internshipId),
      ]);

      const allDocs = [
        ...(preRes.data || []),
        ...(addRes.data || []),
      ].filter(d => d.file_url); // only uploaded docs

      allDocs.forEach(doc => {
        const slotId = this._matchDocToSlot(doc.document_name);
        if (slotId && !map[slotId]) {
          // Extract a friendly file name from the URL
          const urlParts = doc.file_url.split('/');
          const rawName = decodeURIComponent(urlParts[urlParts.length - 1]) || doc.document_name;
          map[slotId] = {
            url: doc.file_url,
            name: doc.document_name,   // use the document label as the display name
            source: 'pre-internship',  // marks this as auto-populated
          };
        }
      });
    } catch (err) {
      console.warn('[Portfolio] fetchPreStageFiles error (non-fatal):', err.message);
    }

    return map;
  },

  // ─── PDF FILE NAME ────────────────────────────────────────────────────────

  getFilename(user, internship, company) {
    const prog = user.course_code || 'BSIT';
    const sem = user.semester || internship?.semester || '';
    const termMap = [['1st', 'T1'], ['First', 'T1'], ['2nd', 'T2'], ['Second', 'T2'], ['3rd', 'T3'], ['Summer', 'T4']];
    const term = (termMap.find(([k]) => sem.includes(k)) || ['', 'T1'])[1];
    const rawAY = user.academic_year || internship?.academic_year || '2025-2026';
    const ay = rawAY.replace(/20(\d\d)-20(\d\d)/, 'AY$1-$2').replace(/20(\d\d)-(\d\d)/, 'AY$1-$2');
    const ln = (user.last_name || '').trim();
    const fi = (user.first_name || '')[0]?.toUpperCase() || '';
    const mi = (user.middle_name || user.user_metadata?.middle_name || '')[0]?.toUpperCase() || '';
    const co = (company?.name || internship?.company_name || 'Company').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    return `${prog} ${term}${ay} ${ln} ${fi}${mi} ${co}`;
  },

  // ─── PDF BUILDER ──────────────────────────────────────────────────────────

  buildPDF(user, internship, company, weeklyReports, attendance, reflection) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let pageNum = 0;

    const addPageNumber = () => {
      pageNum++;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(String(pageNum), PW - MR, PH - 8, { align: 'right' });
    };

    const newPage = () => {
      addPageNumber();
      doc.addPage();
    };

    // Writes text with manual line-break / page-break handling.
    // Returns the new Y cursor.
    const writeText = (str, x, y, maxW, opts = {}) => {
      const { bold = false, fontSize = 11, color = [0, 0, 0] } = opts;
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(str || ''), maxW);
      let cy = y;
      for (const line of lines) {
        if (cy > PH - MB - LH) { newPage(); cy = MT; }
        doc.text(line, x, cy);
        cy += LH;
      }
      return cy;
    };

    const sectionHeading = (title, y) => {
      if (y > PH - MB - LH * 4) { newPage(); y = MT; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(title, ML, y);
      return y + LH + 2;
    };

    const hLine = (y, r = 180, g = 180, b = 180) => {
      doc.setDrawColor(r, g, b);
      doc.line(ML, y, PW - MR, y);
    };

    // ── TITLE PAGE ──────────────────────────────────────────────────────────
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const companyName = company?.name || internship?.company_name || '';
    const mid = PH / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(30, 64, 175);
    doc.text('INTERNSHIP PORTFOLIO', PW / 2, mid - 36, { align: 'center' });

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(ML, mid - 28, PW - MR, mid - 28);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(fullName, PW / 2, mid - 12, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(user.course_code || 'BSIT', PW / 2, mid, { align: 'center' });
    doc.text(`${user.semester || ''}   |   AY ${user.academic_year || ''}`, PW / 2, mid + 10, { align: 'center' });
    doc.text(companyName, PW / 2, mid + 20, { align: 'center' });

    // ── TABLE OF CONTENTS ───────────────────────────────────────────────────
    newPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('TABLE OF CONTENTS', ML, MT + 10);
    hLine(MT + 16, 0, 0, 0);

    const tocRows = [
      ['Title Page', '1'],
      ['Table of Contents', '2'],
      ['Resume', '—'],
      ['Personal Reflection', '3'],
      ['Certificate of Completion', '—'],
      ['Company Profile', '—'],
      ['Internship Agreement', '—'],
      ['Internship Plan', '—'],
      ['Weekly Activity Reports', '—'],
      ['Attendance Reports / Daily Time Record', '—'],
      ['Evidence of Achievements or Activities', '—'],
      ['Other Documents', '—'],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    let ty = MT + 28;
    tocRows.forEach(([label, pg]) => {
      doc.text(label, ML, ty);
      doc.text(pg, PW - MR, ty, { align: 'right' });
      ty += LH + 1;
    });

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Note: Items marked "—" are compiled from uploaded documents and pre-internship records.', ML, ty + 8);

    // ── PERSONAL REFLECTION ─────────────────────────────────────────────────
    newPage();

    let ry = sectionHeading('PERSONAL REFLECTION', MT + 10);
    hLine(ry - 2, 0, 0, 0);
    ry += 4;

    doc.setTextColor(0, 0, 0);

    // Parse **HEADING** markers: split produces alternating [plain, heading, plain, ...]
    const parts = reflection.split(/\*\*([^*]+)\*\*/);
    parts.forEach((part, idx) => {
      const isHeading = idx % 2 === 1;
      const trimmed = part.trim();
      if (!trimmed) return;

      if (isHeading) {
        ry += 4;
        if (ry > PH - MB - LH * 3) { newPage(); ry = MT; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        doc.text(trimmed, ML, ry);
        ry += LH + 1;
        doc.setTextColor(0, 0, 0);
      } else {
        // Body paragraphs — split on double newline to preserve paragraph breaks
        const paragraphs = trimmed.split(/\n{2,}/);
        paragraphs.forEach(para => {
          const cleaned = para.replace(/\n/g, ' ').trim();
          if (!cleaned) return;
          ry = writeText(cleaned, ML, ry, CW, { fontSize: 11 });
          ry += LH * 0.4; // paragraph spacing
        });
      }
    });

    // ── COMPANY PROFILE ─────────────────────────────────────────────────────
    newPage();

    let cy = sectionHeading('COMPANY PROFILE', MT + 10);
    hLine(cy - 2, 0, 0, 0);
    cy += 6;

    const cpFields = [
      ['Company Name', companyName || 'N/A'],
      ['Address / Location', company?.address || internship?.company_address || 'N/A'],
      ['Industry / Nature of Business', company?.industry || internship?.industry || 'N/A'],
      ['Position / Role', internship?.position || 'N/A'],
      ['Department', internship?.department || 'N/A'],
      ['Supervisor Name', internship?.supervisor_name || 'N/A'],
      ['Supervisor Email', internship?.supervisor_email || 'N/A'],
    ];

    const labelW = 58;
    cpFields.forEach(([label, value]) => {
      if (cy > PH - MB - LH * 2) { newPage(); cy = MT; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`${label}:`, ML, cy);
      const valLines = doc.splitTextToSize(String(value), CW - labelW);
      doc.setFont('helvetica', 'normal');
      valLines.forEach((vl, vi) => {
        if (vi > 0 && cy > PH - MB - LH) { newPage(); cy = MT; }
        doc.text(vl, ML + labelW, cy);
        if (vi < valLines.length - 1) cy += LH;
      });
      cy += LH + 2;
    });

    // ── WEEKLY ACTIVITY REPORTS ─────────────────────────────────────────────
    newPage();

    let wy = sectionHeading('WEEKLY ACTIVITY REPORTS', MT + 10);
    hLine(wy - 2, 0, 0, 0);
    wy += 6;

    if (!weeklyReports.length) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(120, 120, 120);
      doc.text('No weekly activity reports have been submitted.', ML, wy);
    } else {
      weeklyReports.forEach((r, i) => {
        if (wy > PH - MB - 40) { newPage(); wy = MT; }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        const weekTitle = `Week ${r.week_number}${r.week_label ? `  —  ${r.week_label}` : ''}`;
        doc.text(weekTitle, ML, wy);
        wy += LH;
        doc.setTextColor(0, 0, 0);

        if (r.summary) {
          wy = writeText('Summary:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.summary, ML + 4, wy, CW - 4, { fontSize: 11 });
          wy += 2;
        }
        if (r.skills_learned) {
          wy = writeText('Skills Learned:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.skills_learned, ML + 4, wy, CW - 4, { fontSize: 11 });
          wy += 2;
        }
        if (r.challenges) {
          wy = writeText('Challenges:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.challenges, ML + 4, wy, CW - 4, { fontSize: 11 });
          wy += 2;
        }

        if (i < weeklyReports.length - 1) {
          wy += 2;
          if (wy > PH - MB - 10) { newPage(); wy = MT; } else {
            hLine(wy, 200, 200, 200);
            wy += LH;
          }
        }
      });
    }

    // ── ATTENDANCE REPORT ────────────────────────────────────────────────────
    newPage();

    let ay = sectionHeading('ATTENDANCE REPORT / DAILY TIME RECORD', MT + 10);
    hLine(ay - 2, 0, 0, 0);
    ay += 4;

    const COL = { date: ML, in: ML + 44, out: ML + 84, hrs: ML + 124, status: ML + 144 };

    const drawAttHeader = (y) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      ['Date', 'Time In', 'Time Out', 'Hours', 'Status'].forEach((h, i) => {
        doc.text(h, Object.values(COL)[i], y);
      });
      hLine(y + 2, 0, 0, 0);
      return y + LH;
    };

    ay = drawAttHeader(ay);

    const fmtTime = (iso) => {
      if (!iso) return '--';
      try { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
      catch { return '--'; }
    };

    let totalHours = 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    attendance.forEach(log => {
      if (ay > PH - MB - 16) {
        newPage();
        ay = MT;
        ay = drawAttHeader(ay);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      }
      const hrs = log.hours_rendered != null ? parseFloat(log.hours_rendered).toFixed(2) : '--';
      totalHours += log.hours_rendered || 0;
      doc.setTextColor(0, 0, 0);
      doc.text(String(log.log_date || '--'), COL.date, ay);
      doc.text(fmtTime(log.time_in), COL.in, ay);
      doc.text(fmtTime(log.time_out), COL.out, ay);
      doc.text(String(hrs), COL.hrs, ay);
      doc.text(String(log.status || '--'), COL.status, ay);
      ay += LH - 1;
    });

    if (!attendance.length) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('No attendance records found.', ML, ay);
      ay += LH;
    }

    ay += 2;
    hLine(ay, 0, 0, 0);
    ay += LH;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Hours Rendered: ${totalHours.toFixed(2)} hrs`, ML, ay);

    // Final page number
    addPageNumber();

    return doc;
  },
};
