import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Send,
  Loader2,
  FileText,
  Info,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { weeklyReportService } from '../../../services/weeklyReportService';
import { supabase } from '../../../services/supabaseClient';
import PageLoader from '../../../components/common/PageLoader';
import Toast from '../../../components/common/Toast';

const WeeklyReports = () => {
  const { user } = useAuth();
  const internshipId = user?.internship_id;
  const isDeployed = user?.is_deployed;

  const [reports, setReports] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal & Generation States
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedActIds, setSelectedActIds] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');

  // Form Fields for New/Edit Report
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekLabel, setWeekLabel] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsLearned, setSkillsLearned] = useState('');
  const [challenges, setChallenges] = useState('');
  
  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Accordion State
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedDates, setExpandedDates] = useState({});

  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Active / Selected Report for View details
  const [selectedReport, setSelectedReport] = useState(null);

  const getOjtStartDate = useCallback(() => {
    if (user?.start_date) return user.start_date;
    if (activities && activities.length > 0) {
      const sortedActs = [...activities].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
      if (sortedActs[0]?.log_date) return sortedActs[0].log_date;
    }
    if (reports && reports.length > 0) {
      const sortedR = [...reports].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
      if (sortedR[0]?.submitted_at) return sortedR[0].submitted_at.slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  }, [user?.start_date, activities, reports]);

  // Group activities by Week and Date
  const groupedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return {};
    
    const startDateStr = getOjtStartDate();
    const grouped = {};

    activities.forEach(act => {
      const d1 = new Date(act.log_date + 'T00:00:00Z');
      const d2 = new Date(startDateStr + 'T00:00:00Z');
      const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
      const weekNum = diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 1;

      const weekKey = `Week ${weekNum}`;
      if (!grouped[weekKey]) grouped[weekKey] = {};
      
      const dateKey = new Date(act.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!grouped[weekKey][dateKey]) grouped[weekKey][dateKey] = [];
      
      grouped[weekKey][dateKey].push(act);
    });

    return grouped;
  }, [activities, getOjtStartDate]);

  const fetchReports = useCallback(async (silent = false) => {
    if (!internshipId) return;
    try {
      if (!silent) setLoading(true);
      const data = await weeklyReportService.getWeeklyReports(internshipId);
      setReports(data);
      
      const acts = await weeklyReportService.getDailyActivitiesForSelection(internshipId);
      setActivities(acts);

      // Set default week number to next logical week
      if (data && data.length > 0) {
        const maxWeek = Math.max(...data.map(r => r.week_number));
        setWeekNumber(maxWeek + 1);
        setWeekLabel(`Week ${maxWeek + 1}`);
      } else {
        setWeekNumber(1);
        setWeekLabel('Week 1');
      }
      return data;
    } catch (err) {
      console.error('Error fetching weekly reports:', err);
      setToast({ message: 'Failed to load weekly reports.', type: 'error' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    if (isDeployed) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [isDeployed, fetchReports]);

  useRealtimeSubscription(
    ['weekly_activity_reports', 'daily_activities'],
    () => { if (isDeployed) fetchReports(true); }
  );

  // Handle auto-generation of WAR with Gemini AI
  const handleGenerateWithAI = async () => {
    const selectedActs = activities.filter(a => selectedActIds.includes(a.id));
    if (selectedActs.length === 0) {
      setToast({ message: 'Please select at least one daily activity to generate report.', type: 'warning' });
      return;
    }

    try {
      setGenerating(true);
      const generated = await weeklyReportService.generateWARWithAI(selectedActs);
      setSummary(generated.summary || '');
      setSkillsLearned(generated.skills_learned || '');
      setChallenges(generated.challenges || '');
      setToast({ message: '✨ AI has successfully generated your draft!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to generate report with AI.', type: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  // Handle iterative refinement from Gemini AI
  const handleRefineWithAI = async () => {
    if (!refinementPrompt.trim()) return;
    if (!summary || !skillsLearned) {
      setToast({ message: 'Generate or write a draft first before refining.', type: 'warning' });
      return;
    }

    try {
      setRefining(true);
      const refined = await weeklyReportService.refineWARWithAI(
        { summary, skills_learned: skillsLearned, challenges },
        refinementPrompt
      );
      setSummary(refined.summary || '');
      setSkillsLearned(refined.skills_learned || '');
      setChallenges(refined.challenges || '');
      setRefinementPrompt('');
      setToast({ message: '✨ AI refined your report!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to refine report.', type: 'error' });
    } finally {
      setRefining(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSignedWAR = async () => {
    if (!uploadFile) {
      setToast({ message: 'Please select a signed report file (PDF or Image) to upload.', type: 'warning' });
      return;
    }
    if (!selectedReport) return;

    try {
      setUploading(true);
      const updatedReport = await weeklyReportService.submitWeeklyReport({
        internship_id: internshipId,
        week_number: selectedReport.week_number,
        week_label: selectedReport.week_label || `Week ${selectedReport.week_number}`,
        summary: selectedReport.summary,
        skills_learned: selectedReport.skills_learned,
        challenges: selectedReport.challenges,
        status: 'PENDING'
      }, uploadFile);

      setToast({ message: '✅ Signed Weekly Activity Report uploaded and submitted to your OJT Adviser!', type: 'success' });
      setUploadFile(null);
      const freshData = await fetchReports(true);
      const freshReport = freshData?.find(r => r.id === updatedReport.id) || updatedReport;
      setSelectedReport(freshReport);
    } catch (err) {
      setToast({ message: 'Failed to upload signed report: ' + err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Handle saving the draft report to the database
  const handleSubmitReport = async () => {
    if (!summary.trim()) {
      setToast({ message: 'Summary is required to submit report.', type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);

      // Compile selected activities for non-week-based layout persistence
      const selectedActs = activities.filter(a => selectedActIds.includes(a.id));
      const seenDates = new Set();
      const serializedActs = [];
      const sortedSelected = [...selectedActs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
      
      sortedSelected.forEach(act => {
        if (!seenDates.has(act.log_date)) {
          seenDates.add(act.log_date);
          const d = new Date(act.log_date + 'T00:00:00');
          const allDescs = sortedSelected
            .filter(x => x.log_date === act.log_date)
            .map(x => x.description)
            .filter(Boolean)
            .join('\n');
          serializedActs.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            day: d.toLocaleDateString('en-US', { weekday: 'long' }),
            description: allDescs
          });
        }
      });
      const summaryWithMeta = summary.trim() + "\n\n---ACTIVITIES_JSON---\n" + JSON.stringify(serializedActs);

      const newReport = await weeklyReportService.submitWeeklyReport({
        internship_id: internshipId,
        week_number: parseInt(weekNumber),
        week_label: weekLabel || `Week ${weekNumber}`,
        summary: summaryWithMeta,
        skills_learned: skillsLearned,
        challenges,
        status: 'DRAFT'
      });

      setToast({ message: `✅ Week ${weekNumber} Weekly Report generated successfully! Export it to PDF to get signatures.`, type: 'success' });
      setShowGenModal(false);
      
      // Clear fields
      setSummary('');
      setSkillsLearned('');
      setChallenges('');
      setSelectedActIds([]);
      
      // Automatically select the newly created draft so it loads in the preview panel instantly
      const freshData = await fetchReports(true);
      const freshReport = freshData?.find(r => r.week_number === parseInt(weekNumber)) || newReport;
      setSelectedReport(freshReport);
    } catch (err) {
      setToast({ message: 'Failed to save weekly report: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const ojtStartDateStr = getOjtStartDate();

    const startOfWeek = new Date(ojtStartDateStr + 'T00:00:00');
    startOfWeek.setDate(startOfWeek.getDate() + (previewData.weekNumber - 1) * 7);

    const endOfWeek = new Date(ojtStartDateStr + 'T00:00:00');
    endOfWeek.setDate(endOfWeek.getDate() + previewData.weekNumber * 7 - 1);

    const optionsFormat = { month: 'short', day: '2-digit', year: 'numeric' };
    const datesCoveredLabel = `${startOfWeek.toLocaleDateString('en-US', optionsFormat)} - ${endOfWeek.toLocaleDateString('en-US', optionsFormat)}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>CCIT-FO-016 (001) Weekly Activity Report</title>
          <style>
            @page { size: letter portrait; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
            }
            body { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              color: #000;
              font-size: 11px;
              line-height: 1.3;
              display: flex;
              flex-direction: column;
              min-height: 100vh;
              padding: 15mm;
              box-sizing: border-box;
            }
            .page-content {
              flex: 1;
            }
            .header-container {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 5px;
            }
            .header-logo {
              height: 60px;
              width: auto;
            }
            .gold-divider {
              height: 5px;
              background-color: #F1B82D;
              border: none;
              margin: 5px 0 10px 0;
            }
            .report-title {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              color: #000;
              margin: 10px 0 10px 0;
              letter-spacing: 0.5px;
            }
            .metadata-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .metadata-table td {
              padding: 6px 10px;
              border: 1px solid #000;
              font-size: 11px;
            }
            .metadata-label {
              font-weight: bold;
              width: 15%;
            }
            .day-box {
              border: 1px solid #000;
              margin-bottom: 10px;
            }
            .day-header {
              display: flex;
              border-bottom: 1px solid #000;
              font-size: 11px;
            }
            .day-header-item {
              padding: 6px;
              width: 50%;
              font-weight: bold;
            }
            .day-header-item:first-child {
              border-right: 1px solid #000;
            }
            .day-content {
              padding: 10px;
              font-size: 11px;
              line-height: 1.6;
            }
            .day-content-field {
              margin-bottom: 6px;
            }
            .signatures-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: auto;
            }
            .signatures-table td {
              border: 1px solid #000;
              padding: 10px;
              font-size: 11px;
              vertical-align: middle;
            }
            .sig-label {
              font-weight: bold;
              width: 20%;
            }
            .sig-date {
              width: 25%;
              vertical-align: top !important;
              height: 40px;
              padding: 4px 8px !important;
            }
            .sig-date-label {
              font-size: 9px;
              font-weight: bold;
            }
            .footer-section {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-family: Arial, sans-serif;
              margin-top: 10px;
              padding-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="page-content">
          <div class="header-container">
            <img class="header-logo" src="${window.location.origin}/nu-logo.png" alt="NU Logo" />
          </div>
          
          <hr class="gold-divider" />
          
          <h2 class="report-title">WEEKLY ACTIVITY REPORT</h2>
          
          <table class="metadata-table">
            <tr>
              <td class="metadata-label">Name:</td>
              <td style="text-transform: uppercase; font-weight: bold;">${previewData.studentName}</td>
            </tr>
            <tr>
              <td class="metadata-label">Company:</td>
              <td style="font-weight: bold;">${user?.company_name || 'N/A'}</td>
            </tr>
            <tr>
              <td class="metadata-label">Week No:</td>
              <td style="font-weight: bold;">${previewData.weekNumber}</td>
            </tr>
            <tr>
              <td class="metadata-label">Dates Covered:</td>
              <td style="font-weight: bold;">${datesCoveredLabel}</td>
            </tr>
          </table>
          
          ${(() => {
            const printDayLogs = previewData.selectedActivities || (() => {
              const seenDates = new Set();
              return activities
                .filter(a => {
                  const d1 = new Date(a.log_date + 'T00:00:00Z');
                  const d2 = new Date(ojtStartDateStr + 'T00:00:00Z');
                  const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
                  const weekNum = diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 1;
                  return weekNum === previewData.weekNumber;
                })
                .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
                .reduce((acc, act) => {
                  if (!seenDates.has(act.log_date)) {
                    seenDates.add(act.log_date);
                    const d = new Date(act.log_date + 'T00:00:00');
                    const allDescs = activities
                      .filter(x => x.log_date === act.log_date)
                      .map(x => x.description)
                      .filter(Boolean)
                      .join('\\n');
                    acc.push({
                      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                      day: d.toLocaleDateString('en-US', { weekday: 'long' }),
                      description: allDescs
                    });
                  }
                  return acc;
                }, []);
            })();

            if (printDayLogs.length === 0) {
              return '<div style="border:1px solid #ccc;padding:12px;font-size:11px;color:#666;text-align:center;margin-bottom:10px;">No activities found for this week.</div>';
            }

            return printDayLogs.map(function(dayLog) {
              var actField = dayLog.description
                ? '<div class="day-content-field"><strong>Activities:</strong> ' + dayLog.description.replace(/\n/g, '<br/>') + '</div>'
                : '';
              var sumField = previewData.summary
                ? '<div class="day-content-field"><strong>Summary:</strong> ' + previewData.summary + '</div>'
                : '';
              var skillsField = previewData.skillsLearned
                ? '<div class="day-content-field"><strong>Skills Learned:</strong> ' + previewData.skillsLearned + '</div>'
                : '';
              var challengesField = previewData.challenges
                ? '<div class="day-content-field"><strong>Challenges &amp; Solutions:</strong> ' + previewData.challenges + '</div>'
                : '';
              return (
                '<div class="day-box">' +
                  '<div class="day-header">' +
                    '<div class="day-header-item">Date: <span style="font-weight:normal;">' + dayLog.date + '</span></div>' +
                    '<div class="day-header-item">Day: <span style="font-weight:normal;">' + dayLog.day + '</span></div>' +
                  '</div>' +
                  '<div class="day-content">' +
                    actField + sumField + skillsField + challengesField +
                  '</div>' +
                '</div>'
              );
            }).join('');
          })()}
          </div>
          
          <table class="signatures-table">
            <tr>
              <td class="sig-label">Intern Signature</td>
              <td style="width: 55%;"></td>
              <td class="sig-date">
                <div class="sig-date-label">Date</div>
              </td>
            </tr>
            <tr>
              <td class="sig-label">Supervisor Signature</td>
              <td style="width: 55%;"></td>
              <td class="sig-date">
                <div class="sig-date-label">Date</div>
              </td>
            </tr>
          </table>
          
          <div class="footer-section">
            <span>CCIT-FO-016 (001)</span>
            <span>Page 1 of 1</span>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusStyle = (status) => {
    if (status === 'APPROVED') return studentDesign.colors.status.done;
    if (status === 'PENDING') return studentDesign.colors.status.active;
    if (status === 'REJECTED') return studentDesign.colors.status.error;
    if (status === 'DRAFT') return studentDesign.colors.status.neutral;
    return studentDesign.colors.status.neutral;
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 size={16} color={studentDesign.colors.success} />;
    if (status === 'PENDING') return <Clock size={16} color={studentDesign.colors.primary} />;
    if (status === 'REJECTED') return <XCircle size={16} color={studentDesign.colors.danger} />;
    if (status === 'DRAFT') return <FileText size={16} color="#64748B" />;
    return null;
  };


  // Guard: Not Deployed
  if (!isDeployed) {
    return (
      <div style={{ ...studentDesign.card, textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '600px' }}>
        <AlertTriangle size={48} color={studentDesign.colors.warning} style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: studentDesign.colors.textMain }}>Weekly Reports Locked</h3>
        <p style={{ color: studentDesign.colors.textMuted, maxWidth: '440px', margin: '8px auto 0', fontSize: '14px', lineHeight: 1.5 }}>
          You must be approved for deployment (Stage 2) to view and submit your Weekly Activity Reports (WAR).
        </p>
      </div>
    );
  }

  if (loading) return <PageLoader message="Loading weekly reports..." />;


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: studentDesign.colors.textMain, margin: 0, letterSpacing: '-0.5px' }}>
            Weekly Activity Reports
          </h2>
          <p style={{ margin: '4px 0 0', color: studentDesign.colors.textMuted, fontSize: '14px' }}>
            Generate, review, and submit your Weekly Activity Reports (WAR) for academic validation.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Auto-check next logical week
            const nextWeek = reports.length > 0 ? Math.max(...reports.map(r => r.week_number)) + 1 : 1;
            setWeekNumber(nextWeek);
            setWeekLabel(`Week ${nextWeek}`);
            setShowGenModal(true);
          }}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            backgroundColor: studentDesign.colors.primary,
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            boxShadow: `0 4px 12px ${studentDesign.colors.primary}20`
          }}
        >
          <Sparkles size={16} /> Generate WAR with AI
        </motion.button>
      </div>

      {/* Reminder Alert */}
      {reports.filter(r => r.status === 'PENDING').length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#FFFBEB',
          border: '1px solid #FEF3C7',
          color: '#92400E',
        }}>
          <Info size={18} />
          <div style={{ fontSize: '14px' }}>
            <strong>Weekly Progress:</strong> You have submitted <strong>{reports.length}</strong> reports. Keep logging your daily activities to auto-generate reports easily.
          </div>
        </div>
      )}

      {/* Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: reports.length > 0 ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Reports List */}
        <div style={{ ...studentDesign.card, padding: '16px 24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: studentDesign.colors.textMain }}>
            Submission History
          </h3>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: studentDesign.colors.textMuted }}>
              <ClipboardList size={40} style={{ margin: '0 auto 12px', opacity: 0.15 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No reports submitted yet.</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Click the button above to generate your first Weekly Report.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reports.map((report, idx) => {
                const colors = getStatusStyle(report.status);
                const isSelected = selectedReport?.id === report.id;
                return (
                  <div 
                    key={report.id} 
                    onClick={() => setSelectedReport(report)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '16px 0', 
                      cursor: 'pointer',
                      borderBottom: idx === reports.length - 1 ? 'none' : `1px solid ${studentDesign.colors.border}`,
                      backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                      margin: '0 -24px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#DBEAFE' : studentDesign.colors.bgSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {getStatusIcon(report.status)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: studentDesign.colors.textMain,
                        }}>{report.week_label || `Week ${report.week_number}`}</span>
                        <span style={{
                          fontSize: '12px',
                          color: studentDesign.colors.textMuted,
                          marginTop: '2px',
                        }}>Submitted on {new Date(report.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}>
                        {report.status}
                      </span>
                      <ChevronRight size={16} color={studentDesign.colors.textMuted} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Report details Card */}
        {selectedReport ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ ...studentDesign.card, padding: '24px', border: `1px solid ${studentDesign.colors.border}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#DBEAFE',
                  color: studentDesign.colors.primary,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>Week {selectedReport.week_number} Details</span>
                <h4 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: 800, color: studentDesign.colors.textMain }}>
                  {selectedReport.week_label}
                </h4>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: getStatusStyle(selectedReport.status).bg,
                color: getStatusStyle(selectedReport.status).text,
                border: `1px solid ${getStatusStyle(selectedReport.status).border}`,
              }}>
                {selectedReport.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: studentDesign.colors.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Weekly Summary
                </label>
                <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.7, color: studentDesign.colors.textMain, backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: `1px solid ${studentDesign.colors.border}40`, whiteSpace: 'pre-wrap' }}>
                  {selectedReport.summary}
                </p>
              </div>

              {selectedReport.skills_learned && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: studentDesign.colors.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Skills Acquired
                  </label>
                  <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.7, color: studentDesign.colors.textMain, backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: `1px solid ${studentDesign.colors.border}40`, whiteSpace: 'pre-wrap' }}>
                    {selectedReport.skills_learned}
                  </p>
                </div>
              )}

              {selectedReport.challenges && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: studentDesign.colors.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Challenges & Solutions
                  </label>
                  <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.7, color: studentDesign.colors.textMain, backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: `1px solid ${studentDesign.colors.border}40`, whiteSpace: 'pre-wrap' }}>
                    {selectedReport.challenges}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => {
                    setPreviewData({
                      studentName: `${user?.first_name} ${user?.last_name}`,
                      programName: user?.program_code || user?.program_id || 'Academic Internship Program',
                      weekNumber: selectedReport.week_number,
                      weekLabel: selectedReport.week_label || `Week ${selectedReport.week_number}`,
                      summary: selectedReport.summary,
                      skillsLearned: selectedReport.skills_learned,
                      challenges: selectedReport.challenges,
                      selectedActivities: selectedReport.selected_activities
                    });
                    setShowPdfPreview(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: `1.5px solid ${studentDesign.colors.primary}30`,
                    backgroundColor: '#FFFFFF',
                    color: studentDesign.colors.primary,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  👁️ Preview & Export PDF
                </button>

                {selectedReport.file_url && (
                  <button
                    onClick={() => window.open(selectedReport.file_url, '_blank')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border: `1.5px solid ${studentDesign.colors.primary}40`,
                      backgroundColor: `${studentDesign.colors.primary}05`,
                      color: studentDesign.colors.primary,
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FileText size={16} /> View Uploaded Signed WAR (PDF/Image)
                  </button>
                )}

              {(selectedReport.status === 'DRAFT' || selectedReport.status === 'REJECTED') && (
                <div style={{
                  border: `2px dashed ${studentDesign.colors.primary}40`,
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: `${studentDesign.colors.primary}02`,
                  textAlign: 'center',
                  marginTop: '10px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={32} color={studentDesign.colors.primary} style={{ opacity: 0.8 }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                      Upload Signed Weekly Activity Report
                    </span>
                    <span style={{ fontSize: '12px', color: studentDesign.colors.textMuted, maxWidth: '300px', lineHeight: 1.4 }}>
                      Export the PDF, get signatures from you and your Industry Supervisor, then upload the signed copy to submit.
                    </span>
                    
                    <input 
                      type="file" 
                      id="signed-war-upload" 
                      accept=".pdf,image/*" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    
                    <label 
                      htmlFor="signed-war-upload"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: `1.5px solid ${studentDesign.colors.primary}`,
                        backgroundColor: '#FFFFFF',
                        color: studentDesign.colors.primary,
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '8px',
                        display: 'inline-block'
                      }}
                    >
                      {uploadFile ? `Selected: ${uploadFile.name}` : 'Select PDF or Image'}
                    </label>

                    {uploadFile && (
                      <button
                        onClick={handleUploadSignedWAR}
                        disabled={uploading}
                        style={{
                          marginTop: '12px',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: studentDesign.colors.primary,
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: `0 4px 10px ${studentDesign.colors.primary}20`
                        }}
                      >
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Submit Signed Report
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>

              {selectedReport.reviewer_comment && (
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: selectedReport.status === 'APPROVED' ? '#F0FDF4' : '#FEF2F2',
                  borderLeft: `4px solid ${selectedReport.status === 'APPROVED' ? studentDesign.colors.success : studentDesign.colors.danger}`
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: selectedReport.status === 'APPROVED' ? '#15803d' : '#B91C1C', marginBottom: '4px' }}>
                    Coordinator Feedback:
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: selectedReport.status === 'APPROVED' ? '#166534' : '#991B1B' }}>
                    {selectedReport.reviewer_comment}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          reports.length > 0 && (
            <div style={{ ...studentDesign.card, padding: '40px', textAlign: 'center', color: studentDesign.colors.textMuted, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.15 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Select a report to view details</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Choose a report from the submission history list to review content and feedback.</p>
            </div>
          )
        )}
      </div>

      {/* Beautiful Multi-Step Gemini AI WAR Generator Modal */}
      <AnimatePresence>
        {showGenModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: '100%', maxWidth: '850px', maxHeight: '85vh',
                backgroundColor: '#FFFFFF', borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px', borderBottom: `1px solid ${studentDesign.colors.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles color={studentDesign.colors.primary} size={20} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: studentDesign.colors.textMain }}>
                      AI-Powered Weekly Activity Report
                    </h3>
                    <span style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>
                      Automatically compile daily logs into a highly professional weekly draft using AI.
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGenModal(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '20px', color: studentDesign.colors.textMuted,
                    fontWeight: 'bold'
                  }}
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Step 1: Select Activities */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                    Step 1: Select Daily Activities to Compile
                  </h4>
                  {activities.length === 0 ? (
                    <div style={{ padding: '20px', borderRadius: '8px', border: `1px dashed ${studentDesign.colors.border}`, textAlign: 'center', color: studentDesign.colors.textMuted }}>
                      No daily activities logged. Go to the Activities tab to log tasks first.
                    </div>
                  ) : (
                    <div style={{
                      maxHeight: '300px', 
                      overflowY: 'scroll', 
                      padding: '12px',
                      borderRadius: '10px', 
                      border: `1px solid ${studentDesign.colors.border}`,
                      backgroundColor: '#F8FAFC', 
                      display: 'block', 
                      overscrollBehavior: 'contain',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      {Object.entries(groupedActivities).map(([week, dates]) => (
                        <div key={week} style={{
                          backgroundColor: '#FFFFFF', borderRadius: '8px', 
                          border: `1px solid ${studentDesign.colors.border}`, overflow: 'hidden',
                          marginBottom: '8px'
                        }}>
                          <div 
                            onClick={() => setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }))}
                            style={{
                              padding: '10px 14px', display: 'flex', justifyContent: 'space-between',
                              alignItems: 'center', cursor: 'pointer', backgroundColor: expandedWeeks[week] ? '#F1F5F9' : '#FFFFFF',
                              fontWeight: 700, fontSize: '14px', color: studentDesign.colors.textMain, transition: 'all 0.2s'
                            }}
                          >
                            <span>{week}</span>
                            {expandedWeeks[week] ? <ChevronUp size={16} color={studentDesign.colors.textMuted} /> : <ChevronDown size={16} color={studentDesign.colors.textMuted} />}
                          </div>
                          
                          <AnimatePresence>
                            {expandedWeeks[week] && (
                              <div style={{ overflow: 'visible' }}>
                                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#F8FAFC' }}>
                                  {Object.entries(dates).map(([date, dateActs]) => {
                                    const dateKey = `${week}-${date}`;
                                    const isDateExpanded = expandedDates[dateKey];
                                    return (
                                      <div key={dateKey} style={{
                                        backgroundColor: '#FFFFFF', borderRadius: '6px',
                                        border: `1px solid ${studentDesign.colors.border}`, overflow: 'hidden'
                                      }}>
                                        <div 
                                          onClick={() => setExpandedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }))}
                                          style={{
                                            padding: '8px 12px', display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', cursor: 'pointer',
                                            fontWeight: 600, fontSize: '13px', color: studentDesign.colors.textMain,
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={14} color={studentDesign.colors.primary} />
                                            <span>{date}</span>
                                          </div>
                                          {isDateExpanded ? <ChevronUp size={14} color={studentDesign.colors.textMuted} /> : <ChevronDown size={14} color={studentDesign.colors.textMuted} />}
                                        </div>
                                        
                                        <AnimatePresence>
                                          {isDateExpanded && (
                                            <div style={{ overflow: 'visible' }}>
                                              <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: `1px solid ${studentDesign.colors.border}40` }}>
                                                {dateActs.map(act => {
                                                  const checked = selectedActIds.includes(act.id);
                                                  return (
                                                    <div 
                                                      key={act.id}
                                                      onClick={() => {
                                                        if (checked) {
                                                          setSelectedActIds(prev => prev.filter(id => id !== act.id));
                                                        } else {
                                                          setSelectedActIds(prev => [...prev, act.id]);
                                                        }
                                                      }}
                                                      style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                                                        backgroundColor: checked ? '#EFF6FF' : '#FFFFFF',
                                                        border: `1px solid ${checked ? studentDesign.colors.primary + '30' : 'transparent'}`,
                                                        transition: 'all 0.15s'
                                                      }}
                                                    >
                                                      <div style={{
                                                        width: '16px', height: '16px', borderRadius: '4px',
                                                        border: `2px solid ${checked ? studentDesign.colors.primary : '#94A3B8'}`,
                                                        backgroundColor: checked ? studentDesign.colors.primary : 'transparent',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontSize: '10px', flexShrink: 0
                                                      }}>
                                                        {checked && <Check size={10} strokeWidth={3} />}
                                                      </div>
                                                      <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ margin: 0, fontSize: '13px', color: studentDesign.colors.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                          {act.description}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>
                      {selectedActIds.length} of {activities.length} days selected
                    </span>
                    <button 
                      onClick={handleGenerateWithAI}
                      disabled={selectedActIds.length === 0 || generating}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none',
                        backgroundColor: selectedActIds.length > 0 ? studentDesign.colors.primary : '#E2E8F0',
                        color: selectedActIds.length > 0 ? '#fff' : studentDesign.colors.textMuted,
                        fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        boxShadow: selectedActIds.length > 0 ? `0 4px 10px ${studentDesign.colors.primary}15` : 'none'
                      }}
                    >
                      {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      {generating ? 'Generating...' : 'Generate AI Draft'}
                    </button>
                  </div>
                </div>

                {/* Step 2: Edit Generated Drafts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                    Step 2: Review and Modify Draft
                  </h4>
                  
                  {/* Summary */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: studentDesign.colors.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Weekly Summary
                    </label>
                    <textarea 
                      placeholder="AI summary will appear here. You can manually edit this text."
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${studentDesign.colors.border}`,
                        fontSize: '14px', lineHeight: 1.5, resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box', color: studentDesign.colors.textMain,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Skills Learned */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: studentDesign.colors.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Skills Learned
                    </label>
                    <textarea 
                      placeholder="AI skills learned will appear here. You can manually edit this text."
                      value={skillsLearned}
                      onChange={e => setSkillsLearned(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${studentDesign.colors.border}`,
                        fontSize: '14px', lineHeight: 1.5, resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box', color: studentDesign.colors.textMain,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Challenges */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: studentDesign.colors.textMuted, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Challenges Faced & Solutions
                    </label>
                    <textarea 
                      placeholder="AI challenges faced will appear here. You can manually edit this text."
                      value={challenges}
                      onChange={e => setChallenges(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${studentDesign.colors.border}`,
                        fontSize: '14px', lineHeight: 1.5, resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box', color: studentDesign.colors.textMain,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>

                {/* Step 3: Interactive Refinement */}
                <div style={{
                  padding: '16px', borderRadius: '12px',
                  backgroundColor: '#F5F3FF', border: '1px solid #EDE9FE'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Sparkles size={16} color="#7C3AED" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#6D28D9' }}>
                      ✨ Prompt AI to Modify Report
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text"
                      placeholder="e.g., 'Make it sound more formal', 'Highlight my backend skills', 'Describe challenge with SQL'."
                      value={refinementPrompt}
                      onChange={e => setRefinementPrompt(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRefineWithAI(); }}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: '8px',
                        border: '1px solid #DDD6FE', fontSize: '13px', outline: 'none',
                        color: studentDesign.colors.textMain
                      }}
                    />
                    <button 
                      onClick={handleRefineWithAI}
                      disabled={refining || !refinementPrompt.trim()}
                      style={{
                        padding: '10px 16px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#7C3AED', color: '#fff', fontWeight: 700,
                        fontSize: '13px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '6px'
                      }}
                    >
                      {refining ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      Refine
                    </button>
                  </div>
                </div>

                {/* Step 4: Details & Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: studentDesign.colors.textMuted, marginBottom: '4px' }}>
                      Week Number
                    </label>
                    <select 
                      value={weekNumber}
                      onChange={e => {
                        setWeekNumber(e.target.value);
                        setWeekLabel(`Week ${e.target.value}`);
                      }}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${studentDesign.colors.border}`,
                        fontSize: '14px', color: studentDesign.colors.textMain, outline: 'none'
                      }}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Week {num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: studentDesign.colors.textMuted, marginBottom: '4px' }}>
                      Week Date Range / Label
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g., May 18 - May 22" 
                      value={weekLabel}
                      onChange={e => setWeekLabel(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                        border: `1px solid ${studentDesign.colors.border}`,
                        fontSize: '14px', color: studentDesign.colors.textMain, outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                </div>

              </div>
            </div>

            {/* Modal Footer */}
              <div style={{
                padding: '16px 24px', borderTop: `1px solid ${studentDesign.colors.border}`,
                display: 'flex', justifyContent: 'flex-end', gap: '12px',
                backgroundColor: '#F8FAFC'
              }}>
                <button 
                  onClick={() => setShowGenModal(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: `1px solid ${studentDesign.colors.border}`,
                    backgroundColor: '#FFFFFF', color: studentDesign.colors.textMuted,
                    fontWeight: 600, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                
                <button 
                  onClick={() => {
                    const selectedActs = activities.filter(a => selectedActIds.includes(a.id));
                    const seenDates = new Set();
                    const serializedActs = [];
                    const sortedSelected = [...selectedActs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
                    
                    sortedSelected.forEach(act => {
                      if (!seenDates.has(act.log_date)) {
                        seenDates.add(act.log_date);
                        const d = new Date(act.log_date + 'T00:00:00');
                        const allDescs = sortedSelected
                          .filter(x => x.log_date === act.log_date)
                          .map(x => x.description)
                          .filter(Boolean)
                          .join('\n');
                        serializedActs.push({
                          date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                          day: d.toLocaleDateString('en-US', { weekday: 'long' }),
                          description: allDescs
                        });
                      }
                    });

                    setPreviewData({
                      studentName: `${user?.first_name} ${user?.last_name}`,
                      programName: user?.program_code || user?.program_id || 'Academic Internship Program',
                      weekNumber: weekNumber,
                      weekLabel: weekLabel || `Week ${weekNumber}`,
                      summary: summary,
                      skillsLearned: skillsLearned,
                      challenges: challenges,
                      selectedActivities: serializedActs
                    });
                    setShowPdfPreview(true);
                  }}
                  disabled={!summary.trim()}
                  style={{
                    padding: '10px 20px', borderRadius: '10px',
                    border: `1.5px solid ${studentDesign.colors.primary}30`,
                    backgroundColor: `${studentDesign.colors.primary}08`,
                    color: studentDesign.colors.primary,
                    fontWeight: 700, fontSize: '13px', cursor: summary.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  👁️ Preview PDF
                </button>

                <button 
                  onClick={handleSubmitReport}
                  disabled={submitting || !summary.trim()}
                  style={{
                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                    backgroundColor: summary.trim() ? studentDesign.colors.primary : '#E2E8F0',
                    color: summary.trim() ? '#fff' : studentDesign.colors.textMuted,
                    fontWeight: 700, fontSize: '13px', cursor: summary.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Draft Report
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF PREVIEW MODAL */}
      <AnimatePresence>
        {showPdfPreview && previewData && (() => {
          // Compute week date range for preview
          const ojtStartDateStr = getOjtStartDate();

          const startOfWeek = new Date(ojtStartDateStr + 'T00:00:00');
          startOfWeek.setDate(startOfWeek.getDate() + (previewData.weekNumber - 1) * 7);

          const endOfWeek = new Date(ojtStartDateStr + 'T00:00:00');
          endOfWeek.setDate(endOfWeek.getDate() + previewData.weekNumber * 7 - 1);

          const optFmt = { month: 'short', day: '2-digit', year: 'numeric' };
          const datesCoveredLabel = `${startOfWeek.toLocaleDateString('en-US', optFmt)} - ${endOfWeek.toLocaleDateString('en-US', optFmt)}`;

          // Build day-log entries from selected activities metadata, or fallback to date-based calculation
          const previewDayLogs = previewData.selectedActivities || (() => {
            const seenDates = new Set();
            return activities
              .filter(a => {
                const d1 = new Date(a.log_date + 'T00:00:00Z');
                const d2 = new Date(ojtStartDateStr + 'T00:00:00Z');
                const diffDays = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
                const weekNum = diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 1;
                return weekNum === previewData.weekNumber;
              })
              .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
              .reduce((acc, act) => {
                if (!seenDates.has(act.log_date)) {
                  seenDates.add(act.log_date);
                  const d = new Date(act.log_date + 'T00:00:00');
                  // Collect all descriptions logged on this date
                  const allDescs = activities
                    .filter(a => a.log_date === act.log_date)
                    .map(a => a.description)
                    .filter(Boolean)
                    .join('\n');
                  acc.push({
                    date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    day: d.toLocaleDateString('en-US', { weekday: 'long' }),
                    description: allDescs
                  });
                }
                return acc;
              }, []);
          })();

          return (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
              padding: '20px', overflowY: 'auto'
            }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  width: '100%', maxWidth: '860px',
                  backgroundColor: '#f1f5f9', borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden'
                }}
              >
                {/* Preview Header Actions */}
                <div style={{
                  padding: '14px 24px', borderBottom: `1px solid ${studentDesign.colors.border}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  backgroundColor: '#ffffff'
                }}>
                  <span style={{ fontWeight: 800, color: studentDesign.colors.textMain, fontSize: '15px' }}>
                    📄 Official Document Preview — CCIT-FO-016 (001)
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handlePrintPDF}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        backgroundColor: studentDesign.colors.primary, color: '#fff',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      🖨&nbsp; Export / Print PDF
                    </button>
                    <button
                      onClick={() => setShowPdfPreview(false)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px',
                        border: `1px solid ${studentDesign.colors.border}`,
                        backgroundColor: '#FFFFFF', color: studentDesign.colors.textMuted,
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Document Sheet Container */}
                <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                  {/* NU Official A4 Sheet */}
                  <div style={{
                    width: '100%', maxWidth: '794px',
                    backgroundColor: '#ffffff', padding: '40px 48px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    fontFamily: "'Arial', 'Helvetica', sans-serif",
                    fontSize: '11px', color: '#000',
                    boxSizing: 'border-box', lineHeight: 1.3
                  }}>

                    {/* NU Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
                      <img
                        src={`${window.location.origin}/nu-logo.png`}
                        alt="NU Logo"
                        style={{ height: '60px', width: 'auto' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    {/* Gold Divider */}
                    <hr style={{ height: '5px', backgroundColor: '#F1B82D', border: 'none', margin: '5px 0 10px 0' }} />

                    {/* Report Title */}
                    <h2 style={{
                      textAlign: 'center', fontSize: '14px', fontWeight: 'bold',
                      color: '#000', margin: '10px 0', letterSpacing: '0.5px'
                    }}>
                      WEEKLY ACTIVITY REPORT
                    </h2>

                    {/* Metadata Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', width: '18%', fontSize: '11px' }}>Name:</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px' }}>{previewData.studentName}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', fontSize: '11px' }}>Company:</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', fontSize: '11px' }}>{user?.company_name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', fontSize: '11px' }}>Week No:</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', fontSize: '11px' }}>{previewData.weekNumber}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', fontSize: '11px' }}>Dates Covered:</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #000', fontWeight: 'bold', fontSize: '11px' }}>{datesCoveredLabel}</td>
                        </tr>
                      </tbody>
                    </table>



                    {/* Daily Report Boxes — only for dates with logged activities */}
                    {previewDayLogs.length === 0 ? (
                      <div style={{ border: '1px solid #ccc', padding: '12px', fontSize: '11px', color: '#666', textAlign: 'center', marginBottom: '10px' }}>
                        No activities found for this week.
                      </div>
                    ) : (
                      previewDayLogs.map((dayLog, idx) => (
                        <div key={idx} style={{ border: '1px solid #000', marginBottom: '10px' }}>
                          {/* Day Header */}
                          <div style={{ display: 'flex', borderBottom: '1px solid #000', fontSize: '11px' }}>
                            <div style={{ padding: '6px', width: '50%', fontWeight: 'bold', borderRight: '1px solid #000' }}>
                              Date: <span style={{ fontWeight: 'normal' }}>{dayLog.date}</span>
                            </div>
                            <div style={{ padding: '6px', width: '50%', fontWeight: 'bold' }}>
                              Day: <span style={{ fontWeight: 'normal' }}>{dayLog.day}</span>
                            </div>
                          </div>
                          {/* Day Content — activities + AI-generated report fields */}
                          <div style={{ padding: '10px', fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {dayLog.description && (
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Activities:</strong>{' '}{dayLog.description}
                              </div>
                            )}
                            {previewData.summary && (
                              <div style={{ marginBottom: '6px' }}>
                                <strong>Summary:</strong>{' '}{previewData.summary}
                              </div>
                            )}
                            {previewData.skillsLearned && (
                              <div style={{ marginBottom: '6px' }}>
                                <strong>Skills Learned:</strong>{' '}{previewData.skillsLearned}
                              </div>
                            )}
                            {previewData.challenges && (
                              <div>
                                <strong>Challenges &amp; Solutions:</strong>{' '}{previewData.challenges}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Signatures Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '10px', fontSize: '11px', fontWeight: 'bold', width: '20%' }}>Intern Signature</td>
                          <td style={{ border: '1px solid #000', padding: '10px', fontSize: '11px', width: '55%' }}></td>
                          <td style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '11px', width: '25%', verticalAlign: 'top', height: '40px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 'bold' }}>Date</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #000', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Supervisor Signature</td>
                          <td style={{ border: '1px solid #000', padding: '10px', fontSize: '11px' }}></td>
                          <td style={{ border: '1px solid #000', padding: '4px 8px', fontSize: '11px', verticalAlign: 'top', height: '40px' }}>
                            <div style={{ fontSize: '9px', fontWeight: 'bold' }}>Date</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '15px' }}>
                      <span>CCIT-FO-016 (001)</span>
                      <span>Page 1 of 1</span>
                    </div>

                  </div>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </motion.div>
  );
};

export default WeeklyReports;
