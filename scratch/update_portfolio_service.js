const fs = require('fs');

const path = './src/services/portfolioService.js';
let content = fs.readFileSync(path, 'utf8');

const buildPdfIdx = content.indexOf('  // ─── PDF BUILDER');
if (buildPdfIdx === -1) {
  console.error("Could not find PDF BUILDER section.");
  process.exit(1);
}

content = content.slice(0, buildPdfIdx);

const newLogic = `  // ─── COMPILE PORTFOLIO ────────────────────────────────────────────────────
  
  async compilePortfolio(user, internship, company, weeklyReports, attendance, reflection, uploadedDocs = {}) {
    console.log('[Portfolio] Fetching attachments to determine page counts...');
    const attachments = {};
    for (const key of Object.keys(uploadedDocs)) {
      if (!uploadedDocs[key] || !uploadedDocs[key].url) continue;
      try {
        const response = await fetch(uploadedDocs[key].url);
        if (!response.ok) continue;
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || '';
        const urlLower = uploadedDocs[key].url.toLowerCase();
        
        if (contentType.includes('pdf') || urlLower.includes('.pdf')) {
          const pdf = await PDFDocument.load(buffer);
          attachments[key] = { count: pdf.getPageCount(), pdf, type: 'pdf' };
        } else if (contentType.includes('image') || urlLower.match(/\\.(png|jpg|jpeg)$/)) {
          attachments[key] = { count: 1, buffer, type: 'image', contentType, urlLower };
        }
      } catch (err) {
        console.error(\`[Portfolio] Failed to fetch attachment \${key}:\`, err);
      }
    }

    // Now call the builder with attachments to get the jsPDF document and the layout recipe
    const { jsPdfDoc, layoutRecipe } = this._buildJsPdfWithRecipe(user, internship, company, weeklyReports, attendance, reflection, attachments);
    const jsPdfBuffer = jsPdfDoc.output('arraybuffer');

    // Merge using pdf-lib according to the strict sequence defined in the layoutRecipe
    const mainPdf = await PDFDocument.create();
    const generatedPdf = await PDFDocument.load(jsPdfBuffer);
    const copiedGeneratedPages = await mainPdf.copyPages(generatedPdf, generatedPdf.getPageIndices());

    let jsPdfIndex = 0;

    for (const step of layoutRecipe) {
      if (step.type === 'generated') {
        for (let i = 0; i < step.count; i++) {
          mainPdf.addPage(copiedGeneratedPages[jsPdfIndex]);
          jsPdfIndex++;
        }
      } else if (step.type === 'attachment') {
        const att = attachments[step.key];
        if (!att) continue;
        if (att.type === 'pdf') {
          const copiedPages = await mainPdf.copyPages(att.pdf, att.pdf.getPageIndices());
          copiedPages.forEach(p => mainPdf.addPage(p));
        } else if (att.type === 'image') {
          let image;
          if (att.contentType.includes('png') || att.urlLower.includes('.png')) {
            image = await mainPdf.embedPng(att.buffer);
          } else {
            image = await mainPdf.embedJpg(att.buffer);
          }
          const page = mainPdf.addPage([595.28, 841.89]);
          const { width, height } = image.scaleToFit(595.28 - 80, 841.89 - 80);
          page.drawImage(image, {
            x: page.getWidth() / 2 - width / 2,
            y: page.getHeight() / 2 - height / 2,
            width,
            height,
          });
        }
      }
    }

    return await mainPdf.save();
  },

  // ─── INTERNAL PDF BUILDER ─────────────────────────────────────────────────

  _buildJsPdfWithRecipe(user, internship, company, weeklyReports, attendance, reflection, attachments) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let pageNum = 0; // Represents the printed page number
    let currentPage = 1; // Represents the absolute physical page number

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

    const writeText = (str, x, y, maxW, opts = {}) => {
      const { bold = false, fontSize = 11, color = [0, 0, 0], align = 'left' } = opts;
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      
      let cleanStr = String(str || '').replace(/(?:\\b[a-zA-Z0-9] )+[a-zA-Z0-9]\\b/g, m => m.replace(/ /g, ''));
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

    const layoutRecipe = [];
    const tocRows = [];

    // ── TITLE PAGE ──────────────────────────────────────────────────────────
    pageNum = currentPage - 1; // 0
    addPageNumber(); // prints 1
    const titleStartJsPdf = doc.internal.getNumberOfPages();
    
    const fullName = \`\${user.first_name || ''} \${user.last_name || ''}\`.trim();
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
    doc.text(\`\${user.semester || ''}   |   AY \${user.academic_year || ''}\`, PW / 2, mid + 10, { align: 'center' });
    doc.text(companyName, PW / 2, mid + 20, { align: 'center' });

    // ── TABLE OF CONTENTS ───────────────────────────────────────────────────
    doc.addPage();
    currentPage++; // now 2
    pageNum = currentPage - 1; // 1
    addPageNumber(); // prints 2
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('TABLE OF CONTENTS', ML, MT + 10);
    hLine(MT + 16, 0, 0, 0);

    // Title & TOC take 2 generated pages
    layoutRecipe.push({ type: 'generated', count: 2 });
    tocRows.push(['Title Page', '1']);
    tocRows.push(['Table of Contents', '2']);
    
    currentPage++; // now 3

    // Helper for attachments
    const pushAttachment = (key, label) => {
      if (attachments[key]) {
        tocRows.push([label, currentPage.toString()]);
        layoutRecipe.push({ type: 'attachment', key });
        currentPage += attachments[key].count;
      } else {
        tocRows.push([label, '—']);
      }
    };

    // Resume
    pushAttachment('resume', 'Resume');

    // ── PERSONAL REFLECTION ─────────────────────────────────────────────────
    doc.addPage();
    pageNum = currentPage - 1; 
    const reflectionStartJsPdf = doc.internal.getNumberOfPages();
    
    let ry = sectionHeading('PERSONAL REFLECTION', MT + 10);
    hLine(ry - 2, 0, 0, 0);
    ry += 4;
    doc.setTextColor(0, 0, 0);

    const parts = reflection.split(/\\*\\*([^*]+)\\*\\*/);
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
        const paragraphs = trimmed.split(/\\n{2,}/);
        paragraphs.forEach(para => {
          const cleaned = para.replace(/\\n/g, ' ').trim();
          if (!cleaned) return;
          ry = writeText(cleaned, ML, ry, CW, { fontSize: 11, align: 'justify' });
          ry += LH * 0.4;
        });
      }
    });

    const reflectionPages = doc.internal.getNumberOfPages() - reflectionStartJsPdf + 1;
    tocRows.push(['Personal Reflection', currentPage.toString()]);
    layoutRecipe.push({ type: 'generated', count: reflectionPages });
    currentPage += reflectionPages;

    // Certificate
    pushAttachment('certificate_completion', 'Certificate of Completion');

    // ── COMPANY PROFILE ─────────────────────────────────────────────────────
    doc.addPage();
    pageNum = currentPage - 1;
    const companyStartJsPdf = doc.internal.getNumberOfPages();

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
      doc.text(\`\${label}:\`, ML, cy);
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

    const companyPages = doc.internal.getNumberOfPages() - companyStartJsPdf + 1;
    tocRows.push(['Company Profile', currentPage.toString()]);
    layoutRecipe.push({ type: 'generated', count: companyPages });
    currentPage += companyPages;

    // Agreements
    pushAttachment('internship_agreement', 'Internship Agreement');
    pushAttachment('internship_plan', 'Internship Plan');

    // ── WEEKLY ACTIVITY REPORTS ─────────────────────────────────────────────
    doc.addPage();
    pageNum = currentPage - 1;
    const warStartJsPdf = doc.internal.getNumberOfPages();

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
        const weekTitle = \`Week \${r.week_number}\${r.week_label ? \`  —  \${r.week_label}\` : ''}\`;
        doc.text(weekTitle, ML, wy);
        wy += LH;
        doc.setTextColor(0, 0, 0);

        if (r.summary) {
          wy = writeText('Summary:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.summary.replace(/\\n/g, ' '), ML + 4, wy, CW - 4, { fontSize: 11, align: 'justify' });
          wy += 2;
        }
        if (r.skills_learned) {
          wy = writeText('Skills Learned:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.skills_learned.replace(/\\n/g, ' '), ML + 4, wy, CW - 4, { fontSize: 11, align: 'justify' });
          wy += 2;
        }
        if (r.challenges) {
          wy = writeText('Challenges:', ML, wy, CW, { bold: true, fontSize: 11 });
          wy = writeText(r.challenges.replace(/\\n/g, ' '), ML + 4, wy, CW - 4, { fontSize: 11, align: 'justify' });
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

    const warPages = doc.internal.getNumberOfPages() - warStartJsPdf + 1;
    tocRows.push(['Weekly Activity Reports', currentPage.toString()]);
    layoutRecipe.push({ type: 'generated', count: warPages });
    currentPage += warPages;

    // ── ATTENDANCE REPORT ────────────────────────────────────────────────────
    doc.addPage();
    pageNum = currentPage - 1;
    const attStartJsPdf = doc.internal.getNumberOfPages();

    let ay = sectionHeading('ATTENDANCE REPORT / DAILY TIME RECORD', MT + 10);
    hLine(ay - 2, 0, 0, 0);
    ay += 4;
    const COL = { date: ML, in: ML + 44, out: ML + 84, hrs: ML + 124, status: ML + 144 };
    const drawAttHeader = (y) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      ['Date', 'Time In', 'Time Out', 'Hours', 'Status'].forEach((h, i) => { doc.text(h, Object.values(COL)[i], y); });
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
    doc.text(\`Total Hours Rendered: \${totalHours.toFixed(2)} hrs\`, ML, ay);

    const attPages = doc.internal.getNumberOfPages() - attStartJsPdf + 1;
    tocRows.push(['Attendance Reports / Daily Time Record', currentPage.toString()]);
    layoutRecipe.push({ type: 'generated', count: attPages });
    currentPage += attPages;

    // Evidence
    pushAttachment('evidence_achievements', 'Evidence of Achievements or Activities');

    // Other Docs
    const handledKeys = ['resume', 'certificate_completion', 'internship_agreement', 'internship_plan', 'evidence_achievements'];
    const otherKeys = Object.keys(attachments).filter(k => !handledKeys.includes(k));
    if (otherKeys.length > 0) {
      tocRows.push(['Other Documents', currentPage.toString()]);
      for (const k of otherKeys) {
        layoutRecipe.push({ type: 'attachment', key: k });
        currentPage += attachments[k].count;
      }
    } else {
      tocRows.push(['Other Documents', '—']);
    }

    // ── DRAW TOC ────────────────────────────────────────────────────────────
    doc.setPage(2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let ty = MT + 28;
    tocRows.forEach(([label, pg]) => {
      doc.text(label, ML, ty);
      doc.text(pg, PW - MR, ty, { align: 'right' });
      ty += LH + 1;
    });

    return { jsPdfDoc: doc, layoutRecipe };
  }
};
\n`;

fs.writeFileSync(path, content + newLogic);
console.log("Successfully updated portfolioService.js");
