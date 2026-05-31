import { supabase } from './supabaseClient';
import { openRouterService } from './openRouterService';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';

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

    // ── Try OpenRouter first ──────────────────────────────────────────────────
    try {
      if (openRouterService.isConfigured()) {
        try {
          console.log('[Portfolio] Generating reflection with OpenRouter...');
          const text = await openRouterService.generateContent(prompt);
          console.log('[Portfolio] OpenRouter succeeded.');
          return text;
        } catch (openRouterErr) {
          console.warn('[Portfolio] OpenRouter failed, falling back to Claude:', openRouterErr.message);
          throw openRouterErr;
        }
      } else {
        throw new Error('OpenRouter not configured');
      }
    } catch (primaryErr) {
      // ── Fallback: Claude via server proxy ─────────────────────────────────
      console.log('[Portfolio] Trying Claude via backend proxy...');
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

    // Save document metadata to the database (required for persistence across sessions)
    const { error: dbErr } = await supabase.from('portfolio_documents').upsert(
      {
        internship_id: internshipId,
        doc_type: docType,
        document_name: docLabel,
        file_url: publicUrl,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'internship_id,doc_type' }
    );
    if (dbErr) throw new Error(`File uploaded but failed to save record: ${dbErr.message}`);

    return publicUrl;
  },

  async loadPortfolioDocs(internshipId) {
    try {
      const { data, error } = await supabase
        .from('portfolio_documents')
        .select('*')
        .eq('internship_id', internshipId);
      if (error) {
        console.error('[Portfolio] Failed to load portfolio_documents:', error.message);
        return {};
      }
      const map = {};
      (data || []).forEach(d => { map[d.doc_type] = { url: d.file_url, name: d.document_name, source: 'upload' }; });
      return map;
    } catch (err) {
      console.error('[Portfolio] Unexpected error loading portfolio_documents:', err);
      return {};
    }
  },

  // Maps a pre-internship document name to a portfolio doc slot ID via keyword matching.
  // Returns null if no match found.
  _matchDocToSlot(docName) {
    const n = docName.toLowerCase();
    const rules = [
      { id: 'resume', keywords: ['resume', 'curriculum vitae', ' cv'] },
      { id: 'certificate_completion', keywords: ['certificate of completion'] },
      { id: 'medical_certificate', keywords: ['medical certificate', 'medical cert'] },
      { id: 'parent_consent', keywords: ['parent consent', 'guardian consent', 'parental consent', 'parent/guardian'] },
      { id: 'recommendation_letter', keywords: ['recommendation letter', 'letter of recommendation'] },
      { id: 'ccit_orientation_cert', keywords: ['ccit orientation', 'orientation certificate', 'orientation cert'] },
      { id: 'student_evaluation', keywords: ['student evaluation', 'internship evaluation', 'evaluation of the internship', 'evaluation form'] },
      { id: 'evidence_achievements', keywords: ['evidence of achievement', 'certificate of recognition', 'certificate of award'] },
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

  // Upserts pre-stage files (from previous internship stages) into portfolio_documents
  // for any slots that the student has NOT already uploaded their own file to.
  // This ensures pre-populated docs persist across sessions in the DB.
  async syncPreStageDocsToPortfolio(internshipId, preStageMap, savedPortfolioMap) {
    // Only sync slots that aren't already covered by a proper portfolio upload
    const slotsToSync = Object.entries(preStageMap).filter(
      ([slotId]) => !savedPortfolioMap[slotId]
    );

    if (slotsToSync.length === 0) return;

    const rows = slotsToSync.map(([slotId, doc]) => ({
      internship_id: internshipId,
      doc_type: slotId,
      document_name: doc.name,
      file_url: doc.url,
      submitted_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('portfolio_documents')
      .upsert(rows, { onConflict: 'internship_id,doc_type' });

    if (error) {
      console.warn('[Portfolio] Failed to sync pre-stage docs to portfolio_documents:', error.message);
    } else {
      console.log(`[Portfolio] Synced ${rows.length} pre-stage doc(s) to portfolio_documents.`);
    }
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

  buildPDF(user, internship, company, weeklyReports, attendance, reflection, uploadedDocs = {}) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let pageNum = 0;

    let companyProfileStartPage = null;
    let weeklyReportsStartPage = null;
    let attendanceReportStartPage = null;

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
      const { bold = false, fontSize = 11, color = [0, 0, 0], align = 'left' } = opts;
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      
      // Clean up accidentally spaced-out text (e.g. copied from a justified PDF)
      let cleanStr = String(str || '').replace(/(?:\b[a-zA-Z0-9] )+[a-zA-Z0-9]\b/g, m => m.replace(/ /g, ''));
      
      const lines = doc.splitTextToSize(cleanStr, maxW);
      let cy = y;
      for (let i = 0; i < lines.length; i++) {
        if (cy > PH - MB - LH) {
          newPage();
          cy = MT;
          doc.setFont('helvetica', bold ? 'bold' : 'normal');
          doc.setFontSize(fontSize);
          doc.setTextColor(...color);
        }
        
        const line = lines[i].trim();
        // Justify text if requested, except for the last line of a paragraph
        if (align === 'justify' && i < lines.length - 1 && line.length > 20) {
          doc.text(line, x, cy, { maxWidth: maxW, align: 'justify' });
        } else {
          doc.text(line, x, cy);
        }
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

    // Dynamic TOC rows will be filled in at page 2 at the very end of PDF generation.

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
          ry = writeText(cleaned, ML, ry, CW, { fontSize: 11, align: 'justify' });
          ry += LH * 0.4; // paragraph spacing
        });
      }
    });

    // ── COMPANY PROFILE ─────────────────────────────────────────────────────
    newPage();
    companyProfileStartPage = pageNum + 1;

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
        if (vi > 0 && cy > PH - MB - LH) {
          newPage();
          cy = MT;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
        }
        doc.text(vl, ML + labelW, cy);
        if (vi < valLines.length - 1) cy += LH;
      });
      cy += LH + 2;
    });

    // ── WEEKLY ACTIVITY REPORTS ─────────────────────────────────────────────
    newPage();
    weeklyReportsStartPage = pageNum + 1;

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
          wy = writeText(r.summary.replace(/\n/g, ' '), ML + 4, wy, CW - 4, { fontSize: 11, align: 'justify' });
          wy += 2;
        }
        if (r.skills_learned) {
          wy = writeText('Skills Learned:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.skills_learned.replace(/\n/g, ' '), ML + 4, wy, CW - 4, { fontSize: 11, align: 'justify' });
          wy += 2;
        }
        if (r.challenges) {
          wy = writeText('Challenges:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.challenges.replace(/\n/g, ' '), ML + 4, wy, CW - 4, { fontSize: 11, align: 'justify' });
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
    attendanceReportStartPage = pageNum + 1;

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

    // ── DYNAMIC TABLE OF CONTENTS GENERATION (Page 2) ────────────────────────
    doc.setPage(2);

    const hasAgreement = uploadedDocs['internship_agreement'] || Object.keys(uploadedDocs).some(k => k.toLowerCase().includes('agreement'));
    const hasPlan = uploadedDocs['internship_plan'] || Object.keys(uploadedDocs).some(k => k.toLowerCase().includes('plan'));

    const otherKeys = ['cert_attendance_seminar', 'student_evaluation', 'recommendation_letter', 'medical_certificate', 'parent_consent', 'ccit_orientation_cert'];
    const hasOther = otherKeys.some(k => uploadedDocs[k]);

    const tocRows = [
      ['Title Page', '1'],
      ['Table of Contents', '2'],
      ['Resume', uploadedDocs['resume'] ? 'Attached' : '—'],
      ['Personal Reflection', '3'],
      ['Certificate of Completion', uploadedDocs['certificate_completion'] ? 'Attached' : '—'],
      ['Company Profile', companyProfileStartPage ? String(companyProfileStartPage) : '—'],
      ['Internship Agreement', hasAgreement ? 'Attached' : '—'],
      ['Internship Plan', hasPlan ? 'Attached' : '—'],
      ['Weekly Activity Reports', weeklyReportsStartPage ? String(weeklyReportsStartPage) : '—'],
      ['Attendance Reports / Daily Time Record', attendanceReportStartPage ? String(attendanceReportStartPage) : '—'],
      ['Evidence of Achievements or Activities', uploadedDocs['evidence_achievements'] ? 'Attached' : '—'],
      ['Other Documents', hasOther ? 'Attached' : '—'],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let ty = MT + 28;
    tocRows.forEach(([label, pg]) => {
      doc.text(label, ML, ty);
      doc.text(pg, PW - MR, ty, { align: 'right' });
      ty += LH + 1;
    });

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Note: Items marked "—" are compiled from uploaded documents and pre-internship records.', ML, ty + 8);

    return doc;
  },

  // ─── ATTACHMENT MERGING ───────────────────────────────────────────────────

  async mergeAttachments(generatedPdfArrayBuffer, uploadedDocs) {
    const mainPdf = await PDFDocument.load(generatedPdfArrayBuffer);
    
    // We want to add the attachments in a logical order, preferably matching TOC.
    const orderedKeys = [
      'resume',
      'certificate_completion',
      'internship_agreement',
      'internship_plan',
      'evidence_achievements',
      'cert_attendance_seminar',
      'student_evaluation',
      'recommendation_letter',
      'medical_certificate',
      'parent_consent',
      'ccit_orientation_cert'
    ];
    
    const allKeys = Object.keys(uploadedDocs);
    const extraKeys = allKeys.filter(k => !orderedKeys.includes(k));
    const finalKeys = [...orderedKeys, ...extraKeys];
    
    for (const key of finalKeys) {
      if (!uploadedDocs[key] || !uploadedDocs[key].url) continue;
      
      try {
        console.log(`[Portfolio] Fetching attachment: ${key} from ${uploadedDocs[key].url}`);
        const response = await fetch(uploadedDocs[key].url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        
        const contentType = response.headers.get('content-type') || '';
        const urlLower = uploadedDocs[key].url.toLowerCase();
        
        if (contentType.includes('pdf') || urlLower.includes('.pdf')) {
          const attachPdf = await PDFDocument.load(buffer);
          const copiedPages = await mainPdf.copyPages(attachPdf, attachPdf.getPageIndices());
          copiedPages.forEach(page => mainPdf.addPage(page));
        } else if (contentType.includes('image') || urlLower.match(/\.(png|jpg|jpeg)$/)) {
          let image;
          if (contentType.includes('png') || urlLower.includes('.png')) {
            image = await mainPdf.embedPng(buffer);
          } else {
            image = await mainPdf.embedJpg(buffer);
          }
          // Create an A4 page
          const page = mainPdf.addPage([595.28, 841.89]);
          // Scale image to fit within A4 margins (padding of 40 on all sides)
          const { width, height } = image.scaleToFit(595.28 - 80, 841.89 - 80);
          page.drawImage(image, {
            x: page.getWidth() / 2 - width / 2,
            y: page.getHeight() / 2 - height / 2,
            width,
            height,
          });
        } else {
          console.warn(`[Portfolio] Unsupported file type for ${key}: ${contentType}`);
        }
      } catch (err) {
        console.error(`[Portfolio] Failed to merge attachment ${key}:`, err);
      }
    }
    
    return await mainPdf.save();
  }
};
