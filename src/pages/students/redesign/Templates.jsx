import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Wand2, 
  Printer, 
  XCircle, 
  AlertCircle,
  Clock,
  Upload,
  Code,
  Sparkles
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import Toast from '../../../components/common/Toast';

const Templates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [internship, setInternship] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [generatorModal, setGeneratorModal] = React.useState({
    isOpen: false,
    type: '', // 'consent' | 'recommendation'
    formData: {
      studentName: '',
      program: '',
      hours: '',
      companyName: '',
      companyAddress: '',
      position: '',
      parentName: '',
      parentContact: '',
      parentRelationship: 'Mother',
      witnessName: 'Prof. Steven Bartolome',
      dateSigned: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      recipientName: '',
      recipientTitle: '',
      recipientCompany: '',
      recipientAddress: '',
      salutation: '',
      adviserName: 'KATHERINE S. DERLA',
      adviserEmail: 'ksderla@nu-baliwag.edu.ph',
      adviserPhone: '+632 87121900 loc 1456',
      programCode: 'BSIT Program',
      pronounSubject: 'her',
      pronounPossessive: 'her'
    }
  });

  const [previewModal, setPreviewModal] = React.useState({
    isOpen: false,
    htmlContent: '',
    type: ''
  });
  const iframeRef = React.useRef(null);

  const handlePrintPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const fetchInternship = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_internships')
        .select('*, companies(*)')
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.companies) {
        setInternship({
          ...data,
          company_name: data.companies.name,
          company_address: data.companies.address,
        });
      } else {
        setInternship(data);
      }
    } catch (err) {
      console.error('Error fetching internship details:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInternship();
  }, [user?.id]);

  const openGenerator = (type, defaultStyle) => {
    const hasInternship = internship && internship.company_name;

    const studentName = (user?.first_name ? `${user.first_name} ${user.last_name}` : '') || user?.name || 'Vanessa Jen G. Ortiz';
    const program = user?.program_name || user?.profile?.program?.name || 'Information Technology';
    const hours = internship?.required_hours || user?.required_hours || 400;

    let initialData = {};

    if (type === 'consent') {
      initialData = {
        studentName: studentName,
        program: program,
        hours: hours,
        companyName: internship?.company_name || 'National Irrigation Administration Region III',
        companyAddress: internship?.company_address || 'San Rafael Municipal Road, San Rafael, Bulacan',
        position: internship?.position || 'IT Intern',
        parentName: hasInternship ? '' : 'Maria Clara G. Ortiz',
        parentContact: hasInternship ? '' : '09171234567',
        parentRelationship: 'Mother',
        witnessName: 'Prof. Steven Bartolome',
        dateSigned: new Date().toISOString().split('T')[0],
        startDate: internship?.start_date || '2026-02-01',
        endDate: internship?.end_date || '2026-05-30',
        pronounSubject: 'her',
        pronounPossessive: 'her',
        letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        recipientName: '',
        recipientTitle: '',
        recipientCompany: '',
        recipientAddress: '',
        salutation: '',
        adviserName: 'KATHERINE S. DERLA',
        adviserEmail: 'ksderla@nu-baliwag.edu.ph',
        adviserPhone: '+632 87121900 loc 1456',
        programCode: 'BSIT Program'
      };
    } else if (type === 'recommendation') {
      initialData = {
        studentName: studentName,
        program: program,
        hours: hours,
        companyName: internship?.company_name || 'National Irrigation Administration Region III',
        companyAddress: internship?.company_address || 'San Rafael Municipal Road, San Rafael, Bulacan',
        position: internship?.position || 'IT Intern',
        parentName: '',
        parentContact: '',
        parentRelationship: 'Mother',
        witnessName: '',
        dateSigned: '',
        startDate: '',
        endDate: '',
        letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        recipientName: hasInternship ? '' : 'ENGR. JOSEPHINE B. SALAZAR',
        recipientTitle: hasInternship ? '' : 'Regional Manager',
        recipientCompany: internship?.company_name || 'National Irrigation Administration Region III',
        recipientAddress: internship?.company_address || 'San Rafael Municipal Road, San Rafael, Bulacan',
        salutation: hasInternship ? '' : 'Dear Mrs. De Guia:',
        adviserName: 'KATHERINE S. DERLA',
        adviserEmail: 'ksderla@nu-baliwag.edu.ph',
        adviserPhone: '+632 87121900 loc 1456',
        programCode: 'BSIT Program',
        pronounSubject: 'her',
        pronounPossessive: 'her'
      };
    } else if (type === 'resume') {
      initialData = {
        studentName: studentName,
        program: program,
        hours: hours,
        companyName: internship?.company_name || '',
        companyAddress: internship?.company_address || '',
        position: internship?.position || 'IT Intern',
        phone: user?.phone || '+63 917 123 4567',
        address: user?.address || 'Baliuag, Bulacan, Philippines',
        linkedin: 'linkedin.com/in/' + studentName.toLowerCase().replace(/\s+/g, ''),
        objective: 'A highly motivated and detail-oriented ' + program + ' student seeking a challenging internship to leverage skills in software development, modern programming methodologies, and system design.',
        skills: 'React.js, JavaScript (ES6+), HTML5 & CSS3, Node.js, SQL, Supabase, Git, Team Collaboration, Agile Development',
        projects: [
          {
            title: 'InternLink Web Portal',
            desc: 'Developed an interactive web application for OJT placement tracking and pre-internship document automation using React, Supabase, and Framer Motion.',
            year: '2026'
          }
        ],
        educationDetails: "Dean's Lister, Active Member of the NU Baliwag IT Society",
        letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        resumeStyle: defaultStyle || 'classic',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        pronounSubject: 'her',
        pronounPossessive: 'her'
      };
    }

    setGeneratorModal({
      isOpen: true,
      type: type,
      formData: initialData
    });
  };

  const handleGeneratePrintWindow = (e) => {
    e.preventDefault();
    const data = generatorModal.formData;
    
    // Validate required fields based on document type
    if (generatorModal.type === 'consent') {
      if (!data.parentName || !data.parentContact || !data.startDate || !data.endDate) {
        setToast({ message: 'Please fill in all parent consent details.', type: 'error' });
        return;
      }
    } else if (generatorModal.type === 'recommendation') {
      if (!data.recipientName || !data.recipientTitle || !data.letterDate) {
        setToast({ message: 'Please fill in all recommendation letter details.', type: 'error' });
        return;
      }
    } else if (generatorModal.type === 'resume') {
      if (!data.phone || !data.address || !data.objective || !data.skills) {
        setToast({ message: 'Please fill in all essential resume details.', type: 'error' });
        return;
      }
      if (data.projects && data.projects.some(p => !p.title || !p.desc || !p.year)) {
        setToast({ message: 'Please complete all project details (title, year, and description).', type: 'error' });
        return;
      }
    }

    setGeneratorModal(prev => ({ ...prev, isOpen: false }));

    const formatDateSafe = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const getLastName = (fullName) => {
      if (!fullName) return '';
      const parts = fullName.trim().split(/\s+/);
      return parts[parts.length - 1];
    };

    const lastName = getLastName(data.studentName);
    const titleAndLastName = data.pronounSubject === 'her' ? `Ms. ${lastName}` : `Mr. ${lastName}`;

    let htmlContent = '';

    if (generatorModal.type === 'consent') {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>CCIT-FO-014 Parental Consent Form - ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      line-height: 1.6;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      background-color: #FFFFFF;
      padding: 20px 40px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-header {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 25px;
      font-family: Arial, sans-serif;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .print-btn {
      background-color: #1D2D5B;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 8px;
      font-size: 13px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .print-btn:hover {
      background-color: #152042;
    }
    @media print {
      .print-header {
        display: none;
      }
      body {
        padding: 15mm;
        height: 99%;
        overflow: hidden;
      }
    }
    
    /* Header layout */
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .header-text {
      display: flex;
      flex-direction: column;
    }
    .logo-title {
      font-family: 'Arial Black', Gadget, sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #1D2D5B;
      line-height: 1.1;
    }
    .logo-subtitle {
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #1D2D5B;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .doc-code {
      font-family: Arial, sans-serif;
      font-size: 11px;
      font-weight: bold;
      color: #000000;
      align-self: flex-start;
      margin-top: 5px;
    }
    .header-gold-line {
      height: 4px;
      background-color: #FDC82F;
      margin-top: 10px;
      margin-bottom: 30px;
    }
    
    .document-title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 30px 0;
      color: #000000;
    }
    
    .document-content {
      font-size: 14px;
      text-align: justify;
      color: #000000;
    }
    .document-content p {
      margin-bottom: 24px;
      text-indent: 0px;
    }
    
    /* Sign-off grid */
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 40px;
      column-gap: 50px;
      margin-top: 50px;
      margin-bottom: 50px;
    }
    .sig-cell {
      display: flex;
      flex-direction: column;
    }
    .sig-line-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      height: 35px;
      justify-content: flex-end;
    }
    .intern-info-text {
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      color: #000000;
      text-align: center;
      padding-bottom: 2px;
    }
    .sig-underline {
      width: 100%;
      border-top: 1.5px solid #000000;
    }
    .sig-label {
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      margin-top: 8px;
      color: #000000;
    }
    
    /* Footer layout */
    .footer-container {
      margin-top: auto;
      position: relative;
      padding-top: 15px;
      padding-bottom: 10px;
    }
    .footer-gold-line {
      height: 4px;
      background-color: #FDC82F;
      margin-bottom: 10px;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left {
      flex: 1;
    }
    .iso-badges {
      display: flex;
      gap: 10px;
    }
    .footer-center {
      flex: 2;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 10px;
      line-height: 1.3;
      color: #475569;
    }
    .footer-right {
      flex: 1;
      text-align: right;
      font-family: 'Georgia', 'Times New Roman', serif;
      font-style: italic;
      font-size: 16px;
      color: #1D2D5B;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="document-header" style="align-items: flex-end;">
    <div class="logo-area">
      <img src="${window.location.origin}/nu-logo.png" alt="NU Logo" style="height: 85px; width: auto; display: block;" />
    </div>
    <div class="doc-code" style="margin-bottom: 5px;">CCIT-FO-014</div>
  </div>
  <div class="header-gold-line"></div>
  
  <div class="document-title">LETTER OF CONSENT FROM PARENT/GUARDIAN</div>
  
  <div class="document-content">
    <p>
      As the parent/guardian of <strong>${data.studentName}</strong>, I hereby give permission for <strong>${data.pronounSubject}</strong> to participate in the Internship Program which is part of the <strong>${data.program}</strong> curriculum and is a required component for <strong>${data.pronounPossessive === 'her' ? 'her' : 'his'}</strong> graduation eligibility. I understand that the program will cover <strong>${data.hours} hours</strong> and will be conducted in <strong>${data.companyName}</strong>, with business address <strong>${data.companyAddress}</strong> from <strong>${formatDateSafe(data.startDate)}</strong> to <strong>${formatDateSafe(data.endDate)}</strong>.
    </p>
    
    <p>
      We understand that policies and guidelines are in place for the conduct of the program and that <strong>${data.studentName}</strong> is fully aware of and will abide by these as well as with the policies set by the partner company.
    </p>
    
    <p>
      In the event of any untoward incident beyond the control of the involved parties, we agree to waive any responsibility on the part of National University, the partner company and any of their respective officers, employers or representatives.
    </p>
  </div>
  
  <div class="signature-grid">
    <div class="sig-cell">
      <div class="sig-line-container">
        <span class="intern-info-text">${data.parentName}</span>
        <div class="sig-underline"></div>
      </div>
      <div class="sig-label">Name and Signature of Parent/Guardian</div>
    </div>
    <div class="sig-cell">
      <div class="sig-line-container">
        <span class="intern-info-text">${data.parentRelationship}</span>
        <div class="sig-underline"></div>
      </div>
      <div class="sig-label">Relationship of Signatory to Intern</div>
    </div>
    <div class="sig-cell">
      <div class="sig-line-container">
        <span class="intern-info-text">${formatDateSafe(data.dateSigned)}</span>
        <div class="sig-underline"></div>
      </div>
      <div class="sig-label">Date Signed</div>
    </div>
    <div class="sig-cell">
      <div class="sig-line-container">
        <span class="intern-info-text">${data.witnessName}</span>
        <div class="sig-underline"></div>
      </div>
      <div class="sig-label">Name and Signature of Witness</div>
    </div>
  </div>
  
  <div class="footer-container">
    <div class="footer-gold-line"></div>
    <div class="footer-content">
      <div class="footer-left">
        <div class="iso-badges">
          <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <circle cx="50" cy="50" r="45" stroke="#1D2D5B" stroke-width="4" fill="#FFFFFF"/>
            <path d="M30 45 L45 60 L70 35" stroke="#FDC82F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="50" y="82" font-family="Arial" font-size="10" font-weight="bold" fill="#1D2D5B" text-anchor="middle">ISO 9001</text>
          </svg>
          <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <circle cx="50" cy="50" r="45" stroke="#1D2D5B" stroke-width="4" fill="#FFFFFF"/>
            <text x="50" y="42" font-family="Arial" font-size="18" font-weight="900" fill="#1D2D5B" text-anchor="middle">★★★</text>
            <text x="50" y="65" font-family="Arial" font-size="10" font-weight="bold" fill="#1D2D5B" text-anchor="middle">NU STARS</text>
          </svg>
        </div>
      </div>
      <div class="footer-center">
        SM Baliwag Complex, Doña Remedios<br/>
        Trinidad Highway, Brgy. Pagala,<br/>
        Baliuag, Bulacan.<br/>
        +639190814635 or +63927533034<br/>
        www.national-u.edu.ph/nu-baliwag
      </div>
      <div class="footer-right">
        Education that works.
      </div>
    </div>
  </div>
</body>
</html>
      `;
    } else if (generatorModal.type === 'recommendation') {
      // CCIT-FO-013 Recommendation Letter
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>CCIT-FO-013 Internship Recommendation Letter - ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, Georgia, serif;
      color: #000000;
      line-height: 1.4;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      background-color: #FFFFFF;
      padding: 20px 40px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-header {
      background-color: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 25px;
      font-family: Arial, sans-serif;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .print-btn {
      background-color: #1D2D5B;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 8px;
      font-size: 13px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .print-btn:hover {
      background-color: #152042;
    }
    @media print {
      .print-header {
        display: none;
      }
      body {
        padding: 15mm;
        height: 99%;
        overflow: hidden;
      }
    }
    
    /* Header layout */
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .header-text {
      display: flex;
      flex-direction: column;
    }
    .logo-title {
      font-family: 'Arial Black', Gadget, sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #1D2D5B;
      line-height: 1.1;
    }
    .logo-subtitle {
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #1D2D5B;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .doc-code {
      font-family: Arial, sans-serif;
      font-size: 11px;
      font-weight: bold;
      color: #000000;
      align-self: flex-start;
      margin-top: 5px;
    }
    .header-gold-line {
      height: 4px;
      background-color: #FDC82F;
      margin-top: 8px;
      margin-bottom: 18px;
    }
    
    .date-line {
      margin-bottom: 15px;
      font-family: 'Times New Roman', Times, serif;
    }
    
    .recipient-address {
      margin-bottom: 15px;
      line-height: 1.35;
      font-family: 'Times New Roman', Times, serif;
    }
    
    .salutation-line {
      margin-bottom: 15px;
      font-family: 'Times New Roman', Times, serif;
    }
    
    .document-content {
      text-align: justify;
      font-family: 'Times New Roman', Times, serif;
    }
    .document-content p {
      margin-bottom: 12px;
      text-indent: 0px;
    }
    
    .recommendation-sign-off {
      margin-top: 20px;
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.35;
    }
    
    /* Footer layout */
    .footer-container {
      margin-top: auto;
      position: relative;
      padding-top: 15px;
      padding-bottom: 10px;
    }
    .footer-gold-line {
      height: 4px;
      background-color: #FDC82F;
      margin-bottom: 10px;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left {
      flex: 1;
    }
    .iso-badges {
      display: flex;
      gap: 10px;
    }
    .footer-center {
      flex: 2;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 10px;
      line-height: 1.3;
      color: #475569;
    }
    .footer-right {
      flex: 1;
      text-align: right;
      font-family: 'Georgia', 'Times New Roman', serif;
      font-style: italic;
      font-size: 16px;
      color: #1D2D5B;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="document-header" style="align-items: flex-end;">
    <div class="logo-area">
      <img src="${window.location.origin}/nu-logo.png" alt="NU Logo" style="height: 85px; width: auto; display: block;" />
    </div>
    <div class="doc-code" style="margin-bottom: 5px;">CCIT-FO-013</div>
  </div>
  <div class="header-gold-line"></div>
  
  <div class="date-line">${data.letterDate}</div>
  
  <div class="recipient-address">
    <strong>${data.recipientName}</strong><br/>
    ${data.recipientTitle}<br/>
    <strong>${data.recipientCompany}</strong><br/>
    ${data.recipientAddress}
  </div>
  
  <div class="salutation-line">${data.salutation}</div>
  
  <div class="document-content">
    <p>
      As a requirement of ${data.programCode || 'BSIT Program'} at National University, students must undergo internship for 400 hours per term for two (2) terms. The main objective of the internship program is to expose students to actual scenarios and real-life applications of the principles and concepts learned inside the classroom.
    </p>
    
    <p>
      In this regard, we would like to recommend <strong>${data.studentName}</strong>, a ${data.program} student, for internship with your company. ${titleAndLastName} has completed at least 90% of the required academic units and is expected to graduate within the academic year. The opportunity for ${titleAndLastName} to continue working with you will allow ${data.pronounSubject === 'her' ? 'her' : 'him'} to apply what ${data.pronounSubject === 'her' ? 'she' : 'he'} has learned and will expose ${data.pronounSubject === 'her' ? 'her' : 'him'} to the actual workplace environment. ${titleAndLastName} has already completed the first 400 hours of ${data.pronounPossessive === 'her' ? 'her' : 'his'} internship requirement last term and only needs to complete the remaining 400 hour.
    </p>
    
    <p>
      Should you have any questions, please feel free to contact us through our landline, ${data.adviserPhone}, or through email, ${data.adviserEmail}.
    </p>
    
    <p>
      We are looking forward to being your partner in producing graduates who can make positive contributions to the industry.
    </p>
    
    <p>
      Thank you.
    </p>
  </div>
  
  <div class="recommendation-sign-off">
    Very truly yours,<br/><br/><br/>
    
    <strong>${data.adviserName}</strong><br/>
    Internship Adviser<br/>
    ${data.programCode}
  </div>
  
  <div class="footer-container">
    <div class="footer-gold-line"></div>
    <div class="footer-content">
      <div class="footer-left">
        <div class="iso-badges">
          <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <circle cx="50" cy="50" r="45" stroke="#1D2D5B" stroke-width="4" fill="#FFFFFF"/>
            <path d="M30 45 L45 60 L70 35" stroke="#FDC82F" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="50" y="82" font-family="Arial" font-size="10" font-weight="bold" fill="#1D2D5B" text-anchor="middle">ISO 9001</text>
          </svg>
          <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
            <circle cx="50" cy="50" r="45" stroke="#1D2D5B" stroke-width="4" fill="#FFFFFF"/>
            <text x="50" y="42" font-family="Arial" font-size="18" font-weight="900" fill="#1D2D5B" text-anchor="middle">★★★</text>
            <text x="50" y="65" font-family="Arial" font-size="10" font-weight="bold" fill="#1D2D5B" text-anchor="middle">NU STARS</text>
          </svg>
        </div>
      </div>
      <div class="footer-center">
        SM Baliwag Complex, Do#xF1;a Remedios<br/>
        Trinidad Highway, Brgy. Pagala,<br/>
        Baliuag, Bulacan.<br/>
        +639190814635 or +63927533034<br/>
        www.national-u.edu.ph/nu-baliwag
      </div>
      <div class="footer-right">
        Education that works.
      </div>
    </div>
  </div>
</body>
</html>
      `;
    } else if (generatorModal.type === 'resume') {
      const resumeStyle = data.resumeStyle || 'classic';
      
      if (resumeStyle === 'modern') {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Professional Resume - ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1e293b;
      line-height: 1.4;
      font-size: 11.5px;
      background-color: #FFFFFF;
      display: flex;
      height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body {
        height: 100%;
        overflow: hidden;
      }
    }
    
    .sidebar {
      width: 33%;
      background-color: #1D2D5B;
      color: #ffffff;
      padding: 20px 15px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .main-content {
      width: 67%;
      padding: 25px 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .profile-img-container {
      text-align: center;
      margin-bottom: 10px;
    }
    .profile-img {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid #FDC82F;
      object-fit: cover;
      display: inline-block;
      background-color: #f1f5f9;
    }
    
    .sidebar-section-title {
      font-size: 11px;
      font-weight: 700;
      color: #FDC82F;
      border-bottom: 1.5px solid #FDC82F;
      padding-bottom: 3px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sidebar-text {
      font-size: 10.5px;
      color: #e2e8f0;
      margin-bottom: 6px;
      line-height: 1.4;
      word-break: break-word;
    }
    .sidebar-text strong {
      color: #ffffff;
    }
    
    .sidebar-skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .sidebar-skill-badge {
      background-color: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
    }
    
    .name-block {
      border-bottom: 2px solid #1D2D5B;
      padding-bottom: 10px;
    }
    .name {
      font-size: 24px;
      font-weight: 800;
      color: #1D2D5B;
      margin: 0 0 3px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 12px;
      font-weight: 600;
      color: #b45309;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .section-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #1D2D5B;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 3px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .item-title {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
    .item-subtitle {
      font-size: 11px;
      font-style: italic;
      color: #475569;
      margin-bottom: 2px;
    }
    .item-date {
      font-size: 10.5px;
      color: #64748b;
      font-weight: 600;
    }
    .item-description {
      font-size: 11px;
      color: #334155;
      margin: 0;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <!-- Left Sidebar -->
  <div class="sidebar">
    <!-- Image -->
    ${data.photoUrl ? `
    <div class="profile-img-container">
      <img src="${data.photoUrl}" class="profile-img" alt="Student Photo" />
    </div>
    ` : ''}
    
    <!-- Contact Info -->
    <div>
      <div class="sidebar-section-title">Contact Info</div>
      <div class="sidebar-text"><strong>Phone:</strong><br/>${data.phone}</div>
      <div class="sidebar-text"><strong>Email:</strong><br/>${user?.email || 'student@nu-baliwag.edu.ph'}</div>
      <div class="sidebar-text"><strong>Address:</strong><br/>${data.address}</div>
      <div class="sidebar-text"><strong>LinkedIn:</strong><br/>${data.linkedin}</div>
    </div>
    
    <!-- Skills -->
    <div>
      <div class="sidebar-section-title">Skills</div>
      <div class="sidebar-skills-container">
        ${data.skills.split(',').map(skill => `<span class="sidebar-skill-badge">${skill.trim()}</span>`).join('')}
      </div>
    </div>
    
    <!-- Honors -->
    <div>
      <div class="sidebar-section-title">Achievements</div>
      <div class="sidebar-text">${data.educationDetails}</div>
    </div>
  </div>
  
  <!-- Right Content -->
  <div class="main-content">
    <!-- Name Title -->
    <div class="name-block">
      <div class="name">${data.studentName}</div>
      <div class="title">Aspiring ${data.programCode || 'BSIT'} Professional</div>
    </div>
    
    <!-- Professional Summary -->
    <div>
      <div class="section-title">Professional Summary</div>
      <p class="item-description" style="line-height: 1.55;">
        ${data.objective}
      </p>
    </div>
    
    <!-- Education -->
    <div>
      <div class="section-title">Education</div>
      <div class="item-header">
        <div class="item-title">National University Baliwag</div>
        <div class="item-date">2022 - Present</div>
      </div>
      <div class="item-subtitle">${data.program}</div>
    </div>
    
    <!-- Experience -->
    ${data.companyName ? `
    <div>
      <div class="section-title">OJT Internship Experience</div>
      <div class="item-header">
        <div class="item-title">${data.companyName}</div>
        <div class="item-date">OJT Placement, 2026</div>
      </div>
      <div class="item-subtitle">${data.position || 'IT Intern'} (${data.hours} hours required)</div>
      <p class="item-description">
        Undergoing professional internship deployment at <strong>${data.companyAddress}</strong>. Actively participating in workplace training, systems administration, and applying academic concepts to real industry operations.
      </p>
    </div>
    ` : ''}
    
    <!-- Projects -->
    <div>
      <div class="section-title">Academic Projects</div>
      ${(data.projects || []).map(project => `
      <div style="margin-bottom: 8px;">
        <div class="item-header">
          <div class="item-title">${project.title || 'Academic Project'}</div>
          <div class="item-date">${project.year || '2026'}</div>
        </div>
        <p class="item-description">
          ${project.desc || ''}
        </p>
      </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
        `;
      } else if (resumeStyle === 'developer') {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Developer Resume - ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1e293b;
      line-height: 1.4;
      font-size: 11.2px;
      background-color: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-bar {
      background-color: #1D2D5B;
      color: #ffffff;
      padding: 22px 20mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #FDC82F;
    }
    .header-info {
      flex: 1;
    }
    .header-title-name {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-subtitle-tag {
      font-size: 12px;
      font-weight: 700;
      color: #FDC82F;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header-contact-row {
      font-size: 10.5px;
      color: #cbd5e1;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .header-photo {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      object-fit: cover;
      background-color: #ffffff;
      margin-left: 20px;
    }
    .dev-body {
      padding: 16px 20mm;
    }
    .dev-section {
      margin-bottom: 14px;
    }
    .dev-section-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #1D2D5B;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dev-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .dev-item-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .dev-item-subtitle {
      font-size: 11px;
      font-style: italic;
      color: #475569;
    }
    .dev-item-date {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
    }
    .dev-desc {
      font-size: 11px;
      color: #334155;
      margin: 0 0 6px 0;
      line-height: 1.45;
    }
    .dev-badge-container {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 4px;
    }
    .dev-badge {
      background-color: #f1f5f9;
      color: #1D2D5B;
      border: 1px solid #cbd5e1;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 600;
    }
    .dev-project-box {
      background-color: #f8fafc;
      border-left: 3px solid #1D2D5B;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-info">
      <h1 class="header-title-name">${data.studentName}</h1>
      <div class="header-subtitle-tag">Tech & Software Engineer | ${data.programCode || 'BSIT'}</div>
      <div class="header-contact-row">
        <span class="header-contact-item">📧 ${user?.email || 'student@nu-baliwag.edu.ph'}</span>
        <span>•</span>
        <span class="header-contact-item">📞 ${data.phone}</span>
        <span>•</span>
        <span class="header-contact-item">📍 ${data.address}</span>
        <span>•</span>
        <span class="header-contact-item">🔗 ${data.linkedin}</span>
      </div>
    </div>
    ${data.photoUrl ? `<img src="${data.photoUrl}" class="header-photo" alt="Photo" />` : ''}
  </div>

  <div class="dev-body">
    <!-- Objective -->
    <div class="dev-section">
      <div class="dev-section-title">Career Focus</div>
      <p class="dev-desc" style="line-height: 1.55;">
        ${data.objective}
      </p>
    </div>

    <!-- Education -->
    <div class="dev-section">
      <div class="dev-section-title">Education</div>
      <div class="dev-item-header">
        <span class="dev-item-title">National University Baliwag</span>
        <span class="dev-item-date">2022 - Present</span>
      </div>
      <div class="dev-item-subtitle">${data.program}</div>
      <p class="dev-desc" style="color: #475569; margin-top: 2px;">
        <strong>Academic Record:</strong> ${data.educationDetails}
      </p>
    </div>

    <!-- Experience -->
    ${data.companyName ? `
    <div class="dev-section">
      <div class="dev-section-title">Technical Experience</div>
      <div class="dev-item-header">
        <span class="dev-item-title">${data.companyName}</span>
        <span class="dev-item-date">OJT Deployment, 2026</span>
      </div>
      <div class="dev-item-subtitle">${data.position || 'IT Intern'} (${data.hours} hours required)</div>
      <p class="dev-desc" style="margin-top: 4px;">
        Applying engineering principles, workflow automation, and technical administration skills during professional placement at <strong>${data.companyAddress}</strong>.
      </p>
    </div>
    ` : ''}

    <!-- Projects -->
    <div class="dev-section">
      <div class="dev-section-title">Academic & Technical Projects</div>
      ${(data.projects || []).map(project => `
      <div class="dev-project-box">
        <div class="dev-item-header">
          <span class="dev-item-title" style="color: #1D2D5B;">${project.title || 'Technical Project'}</span>
          <span class="dev-item-date">${project.year || '2026'}</span>
        </div>
        <p class="dev-desc" style="margin: 4px 0 0 0;">
          ${project.desc || ''}
        </p>
      </div>
      `).join('')}
    </div>

    <!-- Skills -->
    <div class="dev-section" style="margin-bottom: 0;">
      <div class="dev-section-title">Technical Expertise</div>
      <div class="dev-badge-container">
        ${data.skills.split(',').map(skill => `<span class="dev-badge">${skill.trim()}</span>`).join('')}
      </div>
    </div>
  </div>
</body>
</html>
        `;
      } else if (resumeStyle === 'creative') {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Creative Resume - ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1e293b;
      line-height: 1.45;
      font-size: 11px;
      background-color: #FFFFFF;
      padding: 16mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body {
        padding: 12mm;
        overflow: hidden;
      }
    }
    .creative-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 16px;
    }
    .creative-meta {
      flex: 1;
    }
    .creative-name {
      font-size: 28px;
      font-weight: 800;
      color: #1D2D5B;
      margin: 0 0 2px 0;
      letter-spacing: -0.5px;
    }
    .creative-tagline {
      font-size: 12px;
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 10px 0;
    }
    .creative-contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      font-size: 10px;
      color: #475569;
    }
    .creative-photo-box {
      margin-left: 20px;
      position: relative;
    }
    .creative-img {
      width: 75px;
      height: 75px;
      border-radius: 8px;
      border: 2px solid #FDC82F;
      box-shadow: 4px 4px 0px #1D2D5B;
      object-fit: cover;
      background-color: #f8fafc;
    }
    .creative-section {
      margin-bottom: 16px;
    }
    .creative-sec-title {
      font-size: 12px;
      font-weight: 800;
      color: #1D2D5B;
      text-transform: uppercase;
      letter-spacing: 0.75px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .creative-sec-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background-color: #cbd5e1;
    }
    .creative-timeline-container {
      border-left: 2.5px solid #FDC82F;
      padding-left: 12px;
      margin-left: 6px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .creative-timeline-node {
      position: relative;
    }
    .creative-timeline-node::before {
      content: '';
      position: absolute;
      left: -17.5px;
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #1D2D5B;
      border: 2px solid #ffffff;
    }
    .creative-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .creative-item-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f172a;
    }
    .creative-item-date {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      background-color: #f1f5f9;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .creative-item-subtitle {
      font-size: 10.5px;
      font-style: italic;
      color: #475569;
      margin-bottom: 2px;
    }
    .creative-desc {
      font-size: 11px;
      color: #334155;
      margin: 0;
      line-height: 1.4;
    }
    .creative-badge-container {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .creative-badge {
      background-color: rgba(253, 200, 47, 0.15);
      color: #1D2D5B;
      border: 1px solid rgba(253, 200, 47, 0.35);
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 9.5px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="creative-header">
    <div class="creative-meta">
      <h1 class="creative-name">${data.studentName}</h1>
      <div class="creative-tagline">Designer & Innovative Tech Professional</div>
      <div class="creative-contact-grid">
        <div>📧 ${user?.email || 'student@nu-baliwag.edu.ph'}</div>
        <div>📞 ${data.phone}</div>
        <div>📍 ${data.address}</div>
        <div>🔗 ${data.linkedin}</div>
      </div>
    </div>
    ${data.photoUrl ? `
    <div class="creative-photo-box">
      <img src="${data.photoUrl}" class="creative-img" alt="Creative Photo" />
    </div>
    ` : ''}
  </div>

  <!-- Objective -->
  <div class="creative-section">
    <div class="creative-sec-title">Career Objective</div>
    <p class="creative-desc" style="line-height: 1.5; padding-left: 6px;">
      ${data.objective}
    </p>
  </div>

  <!-- Education -->
  <div class="creative-section">
    <div class="creative-sec-title">Academic Background</div>
    <div class="creative-timeline-container" style="gap: 4px;">
      <div class="creative-timeline-node">
        <div class="creative-item-header">
          <span class="creative-item-title">National University Baliwag</span>
          <span class="creative-item-date">2022 - Present</span>
        </div>
        <div class="creative-item-subtitle">${data.program}</div>
        <p class="creative-desc" style="color: #64748b;">
          <strong>Accomplishments:</strong> ${data.educationDetails}
        </p>
      </div>
    </div>
  </div>

  <!-- Experience -->
  ${data.companyName ? `
  <div class="creative-section">
    <div class="creative-sec-title">OJT Placement Deployment</div>
    <div class="creative-timeline-container" style="gap: 4px;">
      <div class="creative-timeline-node">
        <div class="creative-item-header">
          <span class="creative-item-title">${data.companyName}</span>
          <span class="creative-item-date">Internship</span>
        </div>
        <div class="creative-item-subtitle">${data.position || 'IT Intern'} (${data.hours} hours required)</div>
        <p class="creative-desc">
          Deployed at <strong>${data.companyAddress}</strong>, undergoing structured technical training and operations experience.
        </p>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Projects -->
  <div class="creative-section">
    <div class="creative-sec-title">Innovative Projects</div>
    <div class="creative-timeline-container">
      ${(data.projects || []).map(project => `
      <div class="creative-timeline-node">
        <div class="creative-item-header">
          <span class="creative-item-title" style="color: #1D2D5B;">${project.title || 'Innovative Project'}</span>
          <span class="creative-item-date">${project.year || '2026'}</span>
        </div>
        <p class="creative-desc">
          ${project.desc || ''}
        </p>
      </div>
      `).join('')}
    </div>
  </div>

  <!-- Skills -->
  <div class="creative-section" style="margin-bottom: 0;">
    <div class="creative-sec-title">Expertise & Technologies</div>
    <div class="creative-badge-container" style="padding-left: 6px; margin-top: 4px;">
      ${data.skills.split(',').map(skill => `<span class="creative-badge">${skill.trim()}</span>`).join('')}
    </div>
  </div>
</body>
</html>
        `;
      } else {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Professional Resume - ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1e293b;
      line-height: 1.4;
      font-size: 12px;
      background-color: #FFFFFF;
      padding: 20mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body {
        padding: 15mm;
        height: 99%;
        overflow: hidden;
      }
    }
    
    /* Resume Layout Styles */
    .resume-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .header-text-block {
      flex: 1;
    }
    .header-photo-block {
      margin-left: 20px;
    }
    .header-img {
      width: 75px;
      height: 75px;
      border-radius: 8px;
      border: 2px solid #1D2D5B;
      object-fit: cover;
      background-color: #f8fafc;
    }
    .resume-name {
      font-size: 24px;
      font-weight: 800;
      color: #1D2D5B; /* National University Blue */
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .resume-title {
      font-size: 13px;
      font-weight: 600;
      color: #b45309; /* Deep Gold accent */
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .resume-contact-info {
      font-size: 11px;
      color: #64748b;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .resume-divider {
      height: 2px;
      background-color: #1D2D5B;
      margin-top: 10px;
      margin-bottom: 16px;
    }
    
    .resume-section {
      margin-bottom: 16px;
    }
    .resume-section-title {
      font-size: 12px;
      font-weight: 700;
      color: #1D2D5B;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .resume-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 3px;
    }
    .resume-item-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #1e293b;
    }
    .resume-item-subtitle {
      font-size: 11.5px;
      font-style: italic;
      color: #475569;
      margin-bottom: 3px;
    }
    .resume-item-date {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    
    .resume-item-description {
      font-size: 11.5px;
      color: #334155;
      margin: 0;
      line-height: 1.5;
    }
    
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .resume-skill-badge {
      background-color: #f1f5f9;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      padding: 3px 8px;
      border-radius: 5px;
      font-size: 10.5px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="resume-header">
    <div class="header-text-block">
      <div class="resume-name">${data.studentName}</div>
      <div class="resume-title">Aspiring ${data.programCode || 'BSIT'} Professional</div>
      <div class="resume-contact-info">
        <span>Email: ${user?.email || 'student@nu-baliwag.edu.ph'}</span>
        <span>|</span>
        <span>Phone: ${data.phone}</span>
        <span>|</span>
        <span>Address: ${data.address}</span>
        <span>|</span>
        <span>LinkedIn: ${data.linkedin}</span>
      </div>
    </div>
    ${data.photoUrl ? `
    <div class="header-photo-block">
      <img src="${data.photoUrl}" class="header-img" alt="Student Photo" />
    </div>
    ` : ''}
  </div>
  <div class="resume-divider"></div>
  
  <!-- Career Objective -->
  <div class="resume-section">
    <div class="resume-section-title">Professional Summary</div>
    <p class="resume-item-description" style="line-height: 1.55;">
      ${data.objective}
    </p>
  </div>
  
  <!-- Education -->
  <div class="resume-section">
    <div class="resume-section-title">Education</div>
    <div class="resume-item-header">
      <div class="resume-item-title">National University Baliwag</div>
      <div class="resume-item-date">2022 - Present</div>
    </div>
    <div class="resume-item-subtitle">${data.program}</div>
    <p class="resume-item-description" style="color: #475569;">
      <strong>Academic Standings:</strong> ${data.educationDetails}
    </p>
  </div>

  <!-- Professional Experience / Internship Placement (If Registered) -->
  ${data.companyName ? `
  <div class="resume-section">
    <div class="resume-section-title">OJT Internship Experience</div>
    <div class="resume-item-header">
      <div class="resume-item-title">${data.companyName}</div>
      <div class="resume-item-date">OJT Placement, 2026</div>
    </div>
    <div class="resume-item-subtitle">${data.position || 'IT Intern'} (${data.hours} hours required)</div>
    <p class="resume-item-description">
      Undergoing professional internship deployment at <strong>${data.companyAddress}</strong>. Actively participating in workplace training, software/systems administration duties, and applying academic principles to real industry operations.
    </p>
  </div>
  ` : ''}
  
  <!-- Academic & Development Projects -->
  <div class="resume-section">
    <div class="resume-section-title">Academic Projects</div>
    ${(data.projects || []).map(project => `
    <div style="margin-bottom: 8px;">
      <div class="resume-item-header">
        <div class="resume-item-title">${project.title || 'Academic Project'}</div>
        <div class="resume-item-date">${project.year || '2026'}</div>
      </div>
      <p class="resume-item-description">
        ${project.desc || ''}
      </p>
    </div>
    `).join('')}
  </div>
  
  <!-- Skills -->
  <div class="resume-section" style="margin-bottom: 0;">
    <div class="resume-section-title">Technical & Core Skills</div>
    <div class="skills-container">
      ${data.skills.split(',').map(skill => `<span class="resume-skill-badge">${skill.trim()}</span>`).join('')}
    </div>
  </div>
</body>
</html>
        `;
      }
    }

    setPreviewModal({
      isOpen: true,
      htmlContent: htmlContent,
      type: generatorModal.type
    });
    setToast({ message: 'Template generated successfully! Preview ready.', type: 'success' });
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
    },
    card: {
      ...studentDesign.card,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden'
    },
    badge: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 'bold',
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: studentDesign.typography.weights.semibold, color: studentDesign.colors.textMain, margin: '0 0 4px 0' }}>
            Docs Generator & Compiler
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: studentDesign.colors.textMuted }}>
            Build custom pre-filled internship documents instantly based on your registered Host Training Establishment info.
          </p>
        </div>
      </div>

      {/* Central Smart Generator Card */}
      <div style={{ width: '100%' }}>
        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #ffffff 0%, #fcfdfd 100%)', minHeight: '300px', padding: '32px', boxSizing: 'border-box' }}>
          <div>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Wand2 size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: studentDesign.typography.weights.semibold, color: studentDesign.colors.textMain }}>
              Smart Document Generator
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: studentDesign.colors.textMuted, lineHeight: 1.6 }}>
              Use your registered OJT placement and profile details to instantly assemble custom, print-ready, formatted files in seconds. Select a document template below to begin.
            </p>
          </div>

          <div>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Clock size={20} className="animate-spin" color={studentDesign.colors.primary} />
              </div>
            ) : internship?.company_id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: studentDesign.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.75px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Available Formats & Layout Styles
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Card 1: Parental Consent */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('consent')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = studentDesign.colors.primary;
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(29, 45, 91, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: studentDesign.colors.primary }}>
                          <FileText size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                          Official
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Parental Consent Form
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        CCIT-FO-014
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        Official University form for parent/guardian consent. Auto-fills HTE company placement, program, coordinator, and witness signatures.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: studentDesign.colors.primary,
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Use Consent Template
                    </button>
                  </div>

                  {/* Card 2: Recommendation Letter */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('recommendation')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = studentDesign.colors.primary;
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(29, 45, 91, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: studentDesign.colors.primary }}>
                          <FileText size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                          Official
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Recommendation Letter
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        CCIT-FO-013
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        Official Dean-signed recommendation letter for HTE internship acceptance. Auto-fills advisor, program code, and company recipient details.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: studentDesign.colors.primary,
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Use Letter Template
                    </button>
                  </div>

                  {/* Card 3: Classic Resume */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'classic')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                          <Wand2 size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Classic CV
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Executive Resume Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        A4 Centered Layout
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A prestigious, centered layout with traditional executive styling, elegant borders, and rectangular photo placement. Excellent for corporate and formal placements.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Classic Style
                    </button>
                  </div>

                  {/* Card 4: Modern Resume */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'modern')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7' }}>
                          <Wand2 size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Sleek Sidebar
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Modern Minimalist Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Two-Column Sidebar Layout
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A beautiful left-sidebar layout featuring a circular photo with a vibrant gold border, high-contrast skills capsules, and right-aligned main text flow. Best for modern tech roles.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Modern Style
                    </button>
                  </div>

                  {/* Card 5: Tech Developer */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'developer')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7' }}>
                          <Code size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Developer Accent
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Tech Developer Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Accent Header Bar & Code Styling
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A clean, single-column technical template featuring a bold dark navy header bar, circular avatar, inline contact chips, and bordered project block backdrops. Optimized for IT and software engineer applications.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Developer Style
                    </button>
                  </div>

                  {/* Card 6: Creative Showcase */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'creative')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7' }}>
                          <Sparkles size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Creative Timeline
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Creative Showcase Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Typography & Gold Timeline
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A beautiful asymmetric designer resume layout. Highlights objectives with custom typography, frames the profile picture inside a modern gold box, and tracks experience via an elegant timeline.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Creative Style
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '20px', border: '1.5px dashed #f59e0b', borderRadius: '16px', backgroundColor: '#fffbeb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} /> Setup Required for CCIT Forms
                  </span>
                  <span style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                    You must complete your company details first! Go to the <strong>Company Info</strong> page to register your Host Training Establishment (HTE) so we can pre-fill your Parent Consent and Recommendation Letter accurately.
                  </span>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 700, color: studentDesign.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.75px', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Available Formats & Layout Styles
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Card 1: Classic Resume */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'classic')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                          <Wand2 size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Classic CV
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Executive Resume Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        A4 Centered Layout
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A prestigious, centered layout with traditional executive styling, elegant borders, and rectangular photo placement. Excellent for corporate and formal placements.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Classic Style
                    </button>
                  </div>

                  {/* Card 2: Modern Resume */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'modern')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7' }}>
                          <Wand2 size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Sleek Sidebar
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Modern Minimalist Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Two-Column Sidebar Layout
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A beautiful left-sidebar layout featuring a circular photo with a vibrant gold border, high-contrast skills capsules, and right-aligned main text flow. Best for modern tech roles.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Modern Style
                    </button>
                  </div>

                  {/* Card 3: Tech Developer */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'developer')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7' }}>
                          <Code size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Developer Accent
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Tech Developer Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Accent Header Bar & Code Styling
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A clean, single-column technical template featuring a bold dark navy header bar, circular avatar, inline contact chips, and bordered project block backdrops. Optimized for IT and software engineer applications.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Developer Style
                    </button>
                  </div>

                  {/* Card 4: Creative Showcase */}
                  <div style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }} 
                  onClick={() => openGenerator('resume', 'creative')}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(2, 132, 199, 0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justify: 'center', color: '#0284c7' }}>
                          <Sparkles size={20} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          Creative Timeline
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        Creative Showcase Style
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Typography & Gold Timeline
                      </span>
                      <p style={{ margin: 0, fontSize: '12px', color: studentDesign.colors.textMuted, lineHeight: 1.4 }}>
                        A beautiful asymmetric designer resume layout. Highlights objectives with custom typography, frames the profile picture inside a modern gold box, and tracks experience via an elegant timeline.
                      </p>
                    </div>
                    <button style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      Select Creative Style
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Dynamic Document Generator Modal */}
      {generatorModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }} onClick={() => setGeneratorModal(prev => ({ ...prev, isOpen: false }))}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'modalFadeIn 0.3s ease-out',
            boxSizing: 'border-box'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wand2 size={20} color={studentDesign.colors.primary} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: studentDesign.typography.weights.semibold, color: studentDesign.colors.textMain }}>
                  {generatorModal.type === 'consent' ? 'Parent Consent Form (CCIT-FO-014)' : generatorModal.type === 'recommendation' ? 'Recommendation Letter (CCIT-FO-013)' : 'Professional Resume Generator'}
                </h3>
              </div>
              <button 
                onClick={() => setGeneratorModal(prev => ({ ...prev, isOpen: false }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleGeneratePrintWindow} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Common Pre-filled Information */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: studentDesign.typography.weights.semibold, color: studentDesign.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Student & Company Details (Auto-filled)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div><strong>Student Name:</strong> {generatorModal.formData.studentName}</div>
                  <div><strong>Program:</strong> {generatorModal.formData.program}</div>
                  <div><strong>Hours:</strong> {generatorModal.formData.hours} hrs</div>
                  <div><strong>Company:</strong> {generatorModal.formData.companyName || 'Not Placed Yet'}</div>
                </div>
              </div>

              {/* Conditional Inputs */}
              {generatorModal.type === 'consent' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Parent / Guardian Name</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. Maria Clara G. Ortiz"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.parentName}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, parentName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Relationship to Intern</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. Mother / Father"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.parentRelationship}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, parentRelationship: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Parent Contact No.</label>
                      <input 
                        required 
                        type="tel"
                        placeholder="e.g. 09171234567"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.parentContact}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, parentContact: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Name of Witness</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. Prof. Steven Bartolome"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.witnessName}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, witnessName: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>OJT Start Date</label>
                      <input 
                        required 
                        type="date"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.startDate}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, startDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>OJT End Date</label>
                      <input 
                        required 
                        type="date"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.endDate}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, endDate: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Pronouns (Subject)</label>
                      <select 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          backgroundColor: '#ffffff'
                        }}
                        value={generatorModal.formData.pronounSubject}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { 
                            ...prev.formData, 
                            pronounSubject: e.target.value,
                            pronounPossessive: e.target.value === 'her' ? 'her' : 'his'
                          }
                        }))}
                      >
                        <option value="her">Female (her/she)</option>
                        <option value="him">Male (him/he)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Date Signed</label>
                      <input 
                        required 
                        type="date"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.dateSigned}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, dateSigned: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </>
              ) : generatorModal.type === 'recommendation' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Recipient Name</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. ENGR. JOSEPHINE B. SALAZAR"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.recipientName}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, recipientName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Recipient Position</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. Regional Manager"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.recipientTitle}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, recipientTitle: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Recipient Company</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. National Irrigation Administration"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.recipientCompany}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, recipientCompany: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Salutation</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. Dear Mrs. De Guia:"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.salutation}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, salutation: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Recipient Address</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. San Rafael Municipal Road, San Rafael, Bulacan"
                      style={{ 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1',
                        fontSize: '13px'
                      }}
                      value={generatorModal.formData.recipientAddress}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, recipientAddress: e.target.value }
                      }))}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Letter Date</label>
                      <input 
                        required 
                        type="text"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.letterDate}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, letterDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Pronouns (Subject)</label>
                      <select 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          backgroundColor: '#ffffff'
                        }}
                        value={generatorModal.formData.pronounSubject}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { 
                            ...prev.formData, 
                            pronounSubject: e.target.value,
                            pronounPossessive: e.target.value === 'her' ? 'her' : 'his'
                          }
                        }))}
                      >
                        <option value="her">Female (her/she)</option>
                        <option value="him">Male (him/he)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>OJT Coordinator</label>
                      <input 
                        required 
                        type="text"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.adviserName}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, adviserName: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Program Code</label>
                      <input 
                        required 
                        type="text"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.programCode}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, programCode: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Adviser Email</label>
                      <input 
                        required 
                        type="email"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.adviserEmail}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, adviserEmail: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Adviser Phone</label>
                      <input 
                        required 
                        type="text"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.adviserPhone}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, adviserPhone: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {generatorModal.type === 'resume' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '4px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Resume Layout Style</label>
                      <select 
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          backgroundColor: '#ffffff'
                        }}
                        value={generatorModal.formData.resumeStyle || 'classic'}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, resumeStyle: e.target.value }
                        }))}
                      >
                        <option value="classic">Classic Executive (Centered Header)</option>
                        <option value="modern">Modern Minimalist (Elegant Sidebar)</option>
                        <option value="developer">Tech Developer (Accent Header Bar)</option>
                        <option value="creative">Creative Showcase (Timeline Typography)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Profile Photo</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {generatorModal.formData.photoUrl && (
                          <img 
                            src={generatorModal.formData.photoUrl} 
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #1D2D5B' }} 
                            alt="Preview" 
                          />
                        )}
                        <label style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1.5px dashed #cbd5e1',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#475569'
                        }}>
                          <Upload size={14} /> Upload Picture
                          <input 
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setGeneratorModal(prev => ({
                                    ...prev,
                                    formData: { ...prev.formData, photoUrl: reader.result }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Contact Phone</label>
                      <input 
                        required 
                        type="tel"
                        placeholder="e.g. +63 917 123 4567"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.phone || ''}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, phone: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>LinkedIn Link</label>
                      <input 
                        required 
                        type="text"
                        placeholder="e.g. linkedin.com/in/username"
                        style={{ 
                          width: '100%', 
                          boxSizing: 'border-box', 
                          padding: '10px 14px', 
                          borderRadius: '10px', 
                          border: '1px solid #cbd5e1',
                          fontSize: '13px'
                        }}
                        value={generatorModal.formData.linkedin || ''}
                        onChange={e => setGeneratorModal(prev => ({
                          ...prev,
                          formData: { ...prev.formData, linkedin: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Residence Address</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. Baliuag, Bulacan, Philippines"
                      style={{ 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1',
                        fontSize: '13px'
                      }}
                      value={generatorModal.formData.address || ''}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, address: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Career Objective</label>
                    <textarea 
                      required 
                      rows={3}
                      placeholder="A highly motivated IT student seeking a challenging internship..."
                      style={{ 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      value={generatorModal.formData.objective || ''}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, objective: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Technical Skills (Comma separated)</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. React.js, JavaScript, HTML5, CSS3, SQL, Git"
                      style={{ 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1',
                        fontSize: '13px'
                      }}
                      value={generatorModal.formData.skills || ''}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, skills: e.target.value }
                      }))}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: studentDesign.typography.weights.semibold, color: studentDesign.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Academic Projects
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentProjects = generatorModal.formData.projects || [];
                          setGeneratorModal(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              projects: [
                                ...currentProjects,
                                { title: '', desc: '', year: new Date().getFullYear().toString() }
                              ]
                            }
                          }));
                        }}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: studentDesign.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        + Add Project
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(generatorModal.formData.projects || []).map((project, index) => (
                        <div key={index} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', position: 'relative' }}>
                          {(generatorModal.formData.projects || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setGeneratorModal(prev => {
                                  const updatedProjects = [...prev.formData.projects];
                                  updatedProjects.splice(index, 1);
                                  return {
                                    ...prev,
                                    formData: {
                                      ...prev.formData,
                                      projects: updatedProjects
                                    }
                                  };
                                });
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                            >
                              Remove
                            </button>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px', marginBottom: '8px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '11px', color: studentDesign.colors.textDark }}>Project Title</label>
                              <input 
                                required 
                                type="text"
                                placeholder="e.g. InternLink Web Portal"
                                style={{ 
                                  width: '100%', 
                                  boxSizing: 'border-box', 
                                  padding: '6px 10px', 
                                  borderRadius: '6px', 
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px'
                                }}
                                value={project.title}
                                onChange={e => {
                                  const val = e.target.value;
                                  setGeneratorModal(prev => {
                                    const updatedProjects = [...prev.formData.projects];
                                    updatedProjects[index].title = val;
                                    return {
                                      ...prev,
                                      formData: { ...prev.formData, projects: updatedProjects }
                                    };
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '11px', color: studentDesign.colors.textDark }}>Year</label>
                              <input 
                                required 
                                type="text"
                                placeholder="e.g. 2026"
                                style={{ 
                                  width: '100%', 
                                  boxSizing: 'border-box', 
                                  padding: '6px 10px', 
                                  borderRadius: '6px', 
                                  border: '1px solid #cbd5e1',
                                  fontSize: '12px'
                                }}
                                value={project.year}
                                onChange={e => {
                                  const val = e.target.value;
                                  setGeneratorModal(prev => {
                                    const updatedProjects = [...prev.formData.projects];
                                    updatedProjects[index].year = val;
                                    return {
                                      ...prev,
                                      formData: { ...prev.formData, projects: updatedProjects }
                                    };
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '11px', color: studentDesign.colors.textDark }}>Project Description</label>
                            <textarea 
                              required 
                              rows={2}
                              placeholder="Describe what was built, technologies used, and key achievements..."
                              style={{ 
                                width: '100%', 
                                boxSizing: 'border-box', 
                                padding: '6px 10px', 
                                borderRadius: '6px', 
                                border: '1px solid #cbd5e1',
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                              value={project.desc}
                              onChange={e => {
                                const val = e.target.value;
                                setGeneratorModal(prev => {
                                  const updatedProjects = [...prev.formData.projects];
                                  updatedProjects[index].desc = val;
                                  return {
                                    ...prev,
                                    formData: { ...prev.formData, projects: updatedProjects }
                                  };
                                });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textDark }}>Academic Details / Certifications</label>
                    <input 
                      required 
                      type="text"
                      placeholder="e.g. Dean's Lister, Nu Baliwag IT Society Officer"
                      style={{ 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        padding: '10px 14px', 
                        borderRadius: '10px', 
                        border: '1px solid #cbd5e1',
                        fontSize: '13px'
                      }}
                      value={generatorModal.formData.educationDetails || ''}
                      onChange={e => setGeneratorModal(prev => ({
                        ...prev,
                        formData: { ...prev.formData, educationDetails: e.target.value }
                      }))}
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setGeneratorModal(prev => ({ ...prev, isOpen: false }))}
                  style={{ 
                    flex: 1, 
                    backgroundColor: '#ffffff', 
                    color: studentDesign.colors.textMain, 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '10px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: studentDesign.typography.weights.semibold
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ 
                    flex: 1, 
                    backgroundColor: studentDesign.colors.primary, 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '10px',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: studentDesign.typography.weights.semibold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Printer size={16} /> Generate & Print
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Premium Document Preview Modal */}
      {previewModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2100,
          padding: '20px'
        }} onClick={() => setPreviewModal({ isOpen: false, htmlContent: '', type: '' })}>
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '920px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            maxHeight: '95vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            animation: 'modalFadeIn 0.3s ease-out',
            boxSizing: 'border-box'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: studentDesign.typography.weights.semibold, color: studentDesign.colors.textMain }}>
                    {previewModal.type === 'consent' 
                      ? 'CCIT-FO-014 Parental Consent Form - Live Preview' 
                      : previewModal.type === 'recommendation' 
                      ? 'CCIT-FO-013 Recommendation Letter - Live Preview' 
                      : 'Professional A4 Resume - Live Preview'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: studentDesign.colors.textMuted }}>
                    Verify details before downloading or printing your document.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewModal({ isOpen: false, htmlContent: '', type: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Document IFrame Sheet */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <iframe 
                ref={iframeRef} 
                srcDoc={previewModal.htmlContent} 
                style={{ 
                  width: '100%', 
                  height: '62vh', 
                  border: 'none',
                  display: 'block'
                }} 
                title="Document Live Preview" 
              />
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button 
                onClick={() => setPreviewModal({ isOpen: false, htmlContent: '', type: '' })}
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: studentDesign.colors.textMain, 
                  border: '1.5px solid #cbd5e1', 
                  borderRadius: '12px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: studentDesign.typography.weights.semibold
                }}
              >
                Close Preview
              </button>
              <button 
                onClick={handlePrintPreview}
                style={{ 
                  backgroundColor: studentDesign.colors.primary, 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '12px',
                  padding: '10px 22px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: studentDesign.typography.weights.semibold,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(29, 45, 91, 0.2)'
                }}
              >
                <Printer size={16} /> Print / Save as PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Templates;
