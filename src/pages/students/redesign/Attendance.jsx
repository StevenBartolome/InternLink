import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Hourglass,
  ArrowUpRight,
  Play,
  Square,
  AlertTriangle,
  Loader2,
  FileText,
  XCircle,
  Pencil,
  Check
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import { studentService } from '../../../services/studentService';
import { scanOJTAttendanceReportWithGemini } from '../../../services/geminiCORScanner';
import Toast from '../../../components/common/Toast';
import PageLoader from '../../../components/common/PageLoader';

const Attendance = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [reportHours, setReportHours] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [scanningReport, setScanningReport] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activitiesInput, setActivitiesInput] = useState('');
  const [toast, setToast] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [missedLog, setMissedLog] = useState(null);       // stale IN_PROGRESS from a past day
  const [missedClockOut, setMissedClockOut] = useState('17:00'); // default retroactive time
  const [editingLog, setEditingLog] = useState(null);      // id of row currently being edited
  const [editForm, setEditForm] = useState({});            // { timeIn, timeOut, activities }
  
  const [usualTimeIn, setUsualTimeIn] = useState('08:00');
  const [usualTimeOut, setUsualTimeOut] = useState('17:00');
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  // Attendance PDF Export Settings
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('weekly');
  const [dailyDate, setDailyDate] = useState(new Date().toLocaleDateString('en-CA'));
  
  // Default weekly: Monday of current week to today
  const getDefaultWeeklyDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return {
      start: monday.toLocaleDateString('en-CA'),
      end: new Date().toLocaleDateString('en-CA')
    };
  };

  const defaultWeek = getDefaultWeeklyDates();
  const [weeklyStart, setWeeklyStart] = useState(defaultWeek.start);
  const [weeklyEnd, setWeeklyEnd] = useState(defaultWeek.end);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'

  const handleExportPDF = (type, options) => {
    let filtered = [];
    let periodLabel = '';

    if (type === 'daily') {
      filtered = logs.filter(l => l.log_date === options.dailyDate && l.status === 'LOGGED');
      periodLabel = new Date(options.dailyDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (type === 'weekly') {
      filtered = logs.filter(l => l.log_date >= options.weeklyStart && l.log_date <= options.weeklyEnd && l.status === 'LOGGED');
      const startF = new Date(options.weeklyStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endF = new Date(options.weeklyEnd + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      periodLabel = `${startF} - ${endF}`;
    } else if (type === 'monthly') {
      const [year, month] = options.monthlyMonth.split('-');
      filtered = logs.filter(l => {
        if (l.status !== 'LOGGED') return false;
        const [lYear, lMonth] = l.log_date.split('-');
        return lYear === year && lMonth === month;
      });
      const monthDate = new Date(year, parseInt(month) - 1, 1);
      periodLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    if (filtered.length === 0) {
      setToast({ message: '⚠️ No logged attendance entries found for the selected period.', type: 'error' });
      return;
    }

    // Sort chronologically
    filtered.sort((a, b) => new Date(a.log_date + 'T00:00:00') - new Date(b.log_date + 'T00:00:00'));

    const formatHoursAndMins = (decimalHours) => {
      if (!decimalHours || decimalHours <= 0) return '0 mins';
      const hours = Math.floor(decimalHours);
      const minutes = Math.round((decimalHours - hours) * 60);
      if (hours === 0) return `${minutes} mins`;
      if (minutes === 0) return `${hours} hrs`;
      return `${hours} hrs ${minutes} mins`;
    };

    const totalHoursPeriod = filtered.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);

    // Calculate previous hours (all logs prior to this range)
    let firstFilteredDate = filtered[0].log_date;
    const previousLogs = logs.filter(l => l.log_date < firstFilteredDate && l.status === 'LOGGED');
    const previousTotal = previousLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
    const grandTotal = previousTotal + totalHoursPeriod;

    // Create printer iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.write(`
      <html>
        <head>
          <title>CCIT-FO-017 Attendance Report</title>
          <style>
            @media print {
              @page { size: letter portrait; margin: 15mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { 
              font-family: 'Arial', 'Helvetica', sans-serif; 
              color: #1e293b; 
              margin: 0; 
              padding: 0; 
              font-size: 13px;
              line-height: 1.4;
            }
            .header-container {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 5px;
            }
            .logo-placeholder {
              width: 55px;
              height: 55px;
              background-color: #1D2D5B;
              color: #fff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 16px;
              border: 2px solid #F1B82D;
            }
            .header-text {
              flex: 1;
            }
            .header-title-nu {
              font-size: 18px;
              font-weight: 900;
              color: #1D2D5B;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-subtitle {
              font-size: 12px;
              color: #475569;
              margin: 2px 0 0 0;
              font-weight: bold;
            }
            .gold-divider {
              height: 4px;
              background-color: #F1B82D;
              border: none;
              margin: 8px 0 15px 0;
            }
            .report-title {
              text-align: center;
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 15px 0;
              letter-spacing: 0.5px;
              text-decoration: underline;
            }
            .metadata-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            .metadata-table td {
              padding: 6px 8px;
              vertical-align: middle;
              border: 1px solid #cbd5e1;
            }
            .metadata-label {
              font-weight: bold;
              font-style: italic;
              color: #334155;
              width: 150px;
              background-color: #f8fafc;
            }
            .note-box {
              background-color: #FFFDF5;
              border: 1px solid #FBE1A0;
              padding: 10px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              color: #78350f;
              margin-bottom: 20px;
              line-height: 1.5;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .data-table th {
              background-color: #1D2D5B;
              color: #ffffff;
              font-weight: bold;
              text-align: left;
              padding: 8px 12px;
              font-size: 12px;
              text-transform: uppercase;
              border: 1px solid #1D2D5B;
            }
            .data-table td {
              padding: 8px 12px;
              border: 1px solid #cbd5e1;
            }
            .data-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .totals-section {
              margin-top: 15px;
              margin-bottom: 30px;
              background-color: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 12px 16px;
            }
            .totals-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .total-item {
              display: flex;
              flex-direction: column;
            }
            .total-label {
              font-size: 11px;
              color: #475569;
              font-weight: bold;
              text-transform: uppercase;
            }
            .total-value {
              font-size: 13px;
              font-weight: 800;
              color: #1D2D5B;
              margin-top: 4px;
            }
            .verification-text {
              text-align: center;
              font-style: italic;
              font-size: 12px;
              color: #475569;
              margin: 40px 0 25px 0;
              line-height: 1.6;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 40px;
              margin-top: 30px;
            }
            .signature-block {
              display: flex;
              flex-direction: column;
            }
            .sig-line {
              border-top: 1px solid #475569;
              margin-top: 40px;
              margin-bottom: 4px;
            }
            .sig-title {
              font-weight: bold;
              font-size: 12px;
              color: #1e293b;
            }
            .sig-subtitle {
              font-size: 11px;
              color: #64748b;
            }
            .footer-section {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-placeholder">NU</div>
            <div class="header-text">
              <h1 class="header-title-nu">National University</h1>
              <p class="header-subtitle">School of Engineering and Technology</p>
            </div>
          </div>
          
          <hr class="gold-divider" />
          
          <h2 class="report-title">DAILY ATTENDANCE REPORT</h2>
          
          <table class="metadata-table">
            <tr>
              <td class="metadata-label">STUDENT NAME:</td>
              <td style="font-weight: bold; text-transform: uppercase;">${user?.first_name || ''} ${user?.last_name || ''}</td>
            </tr>
            <tr>
              <td class="metadata-label">COMPANY (HTE):</td>
              <td style="font-weight: bold;">${user?.company_name || 'N/A'}</td>
            </tr>
            <tr>
              <td class="metadata-label">PERIOD COVERED:</td>
              <td style="font-weight: bold; color: #1D2D5B;">${periodLabel}</td>
            </tr>
          </table>
          
          <div class="note-box">
            NOTE: To be filled-up by the intern and signed by the Internship Supervisor/immediate supervisor. This must be submitted to the Internship Coordinator along with the weekly activity report.
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 20%">Date</th>
                <th style="width: 25%">Time-In</th>
                <th style="width: 25%">Time-Out</th>
                <th style="width: 30%">Hours Rendered</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(l => `
                <tr>
                  <td>${new Date(l.log_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                  <td>${l.time_in ? new Date(l.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                  <td>${l.time_out ? new Date(l.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                  <td style="font-weight: bold;">${l.hours_rendered ? `${l.hours_rendered.toFixed(2)} hrs (${formatHoursAndMins(l.hours_rendered)})` : '0.00 hrs (0 mins)'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals-section">
            <div class="totals-grid">
              <div class="total-item">
                <span class="total-label">Previous Hours Total</span>
                <span class="total-value">${previousTotal.toFixed(2)} hrs (${formatHoursAndMins(previousTotal)})</span>
              </div>
              <div class="total-item" style="border-left: 1px solid #cbd5e1; padding-left: 15px;">
                <span class="total-label">Hours this Period</span>
                <span class="total-value">${totalHoursPeriod.toFixed(2)} hrs (${formatHoursAndMins(totalHoursPeriod)})</span>
              </div>
              <div class="total-item" style="border-left: 1px solid #cbd5e1; padding-left: 15px;">
                <span class="total-label">Grand Total Served</span>
                <span class="total-value" style="color: #16a34a; font-size: 14px;">${grandTotal.toFixed(2)} hrs (${formatHoursAndMins(grandTotal)})</span>
              </div>
            </div>
          </div>
          
          <p class="verification-text">
            I verify that the above information is correct and that the intern was in attendance on the above days at the times indicated.
          </p>
          
          <div class="signatures-grid">
            <div class="signature-block">
              <div class="sig-line"></div>
              <span class="sig-title">${user?.first_name || ''} ${user?.last_name || ''}</span>
              <span class="sig-subtitle">Student Intern Signature</span>
            </div>
            <div class="signature-block">
              <div class="sig-line"></div>
              <span class="sig-title">${user?.supervisor_name || 'Immediate Supervisor'}</span>
              <span class="sig-subtitle">OJT Supervisor Signature</span>
            </div>
          </div>
          
          <div class="footer-section">
            <span>CCIT-FO-017</span>
            <span>Page 1 of 1</span>
          </div>
        </body>
      </html>
    `);
    doc.close();

    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 500);
  };

  const internshipId = user?.internship_id;
  const requiredHours = user?.required_hours || 486;
  const isDeployed = user?.is_deployed;

  // Sync settings when user metadata is loaded
  useEffect(() => {
    if (user?.user_metadata) {
      setUsualTimeIn(user.user_metadata.usual_time_in || '08:00');
      setUsualTimeOut(user.user_metadata.usual_time_out || '17:00');
      setRemindersEnabled(user.user_metadata.reminders_enabled || false);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      setActionLoading(true);
      const { supabase } = await import('../../../services/supabaseClient');
      
      const { error } = await supabase.auth.updateUser({
        data: {
          usual_time_in: usualTimeIn,
          usual_time_out: usualTimeOut,
          reminders_enabled: remindersEnabled
        }
      });

      if (error) throw error;
      setToast({ message: '✨ Shift and email reminder settings saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Error saving shift settings:', err);
      setToast({ message: 'Failed to save settings: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Fetch Logs on Load — depend only on stable primitive values, NOT the whole user object
  useEffect(() => {
    if (!internshipId) return; // user not loaded yet, wait
    if (isDeployed) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [internshipId, isDeployed]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const allLogs = await attendanceService.getAttendanceLogs(internshipId);
      setLogs(allLogs);

      const today = await attendanceService.getTodayLog(internshipId);
      setTodayLog(today);
      if (today && today.status === 'IN_PROGRESS') {
        setActivitiesInput(today.activities || '');
      }

      // Detect stale IN_PROGRESS log from a PREVIOUS day (forgot to clock out)
      const todayStr = new Date().toLocaleDateString('en-CA');
      const staleLog = allLogs.find(
        l => l.status === 'IN_PROGRESS' && l.log_date !== todayStr
      );
      setMissedLog(staleLog || null);

      try {
        const docs = await studentService.getPreInternshipDocuments(internshipId);
        setDocuments(docs);
      } catch (docErr) {
        console.error('Error fetching docs in attendance page:', docErr);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setToast({ message: 'Failed to load attendance logs.', type: 'error' });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 2. Ticker Hook for Clock-In Time
  useEffect(() => {
    if (!todayLog || todayLog.status !== 'IN_PROGRESS') return;

    const updateTicker = () => {
      const diffMs = new Date() - new Date(todayLog.time_in);
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
      const hrs = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      setElapsedTime(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [todayLog]);

  // 3. Handle Clock In
  const handleClockIn = async () => {
    if (!internshipId) return;
    try {
      setActionLoading(true);
      const newEntry = await attendanceService.clockIn(internshipId);
      setTodayLog(newEntry);
      setToast({ message: '📅 Clocked in successfully! Keep up the great work today!', type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      console.error('Clock in error:', err);
      setToast({ message: 'Failed to clock in: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Handle Clock Out
  const handleClockOut = async () => {
    if (!todayLog || !internshipId) return;
    try {
      setActionLoading(true);
      const res = await attendanceService.clockOut(
        todayLog.id,
        internshipId,
        todayLog.time_in
      );
      setTodayLog(res.log);
      setToast({ message: `🔒 Clocked out! ${res.log.hours_rendered} hrs saved. Use Resume if you clocked out by mistake.`, type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      console.error('Clock out error:', err);
      setToast({ message: 'Failed to clock out: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 4b. (Removed — accidental clock-out now handled by clocking in again as a new session)

  // 5. Handle Missed / Retroactive Clock-Out
  const handleMissedClockOut = async () => {
    if (!missedLog || !internshipId) return;
    try {
      setActionLoading(true);
      // Build a retroactive time_out ISO string on the missed date
      const retroTimeOut = new Date(`${missedLog.log_date}T${missedClockOut}:00`).toISOString();
      const diffMs = new Date(retroTimeOut) - new Date(missedLog.time_in);
      const hoursRendered = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

      const { supabase } = await import('../../../services/supabaseClient');
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          time_out: retroTimeOut,
          hours_rendered: hoursRendered,
          status: 'LOGGED',
          updated_at: new Date().toISOString()
        })
        .eq('id', missedLog.id);

      if (updateError) throw updateError;

      // Re-sum all hours and update student_internships
      const { data: allLogs, error: fetchError } = await supabase
        .from('attendance_logs')
        .select('hours_rendered')
        .eq('internship_id', internshipId)
        .eq('status', 'LOGGED');

      if (fetchError) throw fetchError;

      const totalHours = allLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
      await supabase
        .from('student_internships')
        .update({ rendered_hours: Math.round(totalHours), updated_at: new Date().toISOString() })
        .eq('id', internshipId);

      setMissedLog(null);
      setToast({ message: `✅ Missed clock-out resolved! ${hoursRendered} hours saved for ${missedLog.log_date}.`, type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      console.error('Retroactive clock-out error:', err);
      setToast({ message: 'Failed to resolve missed clock-out: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Handle inline log edit save
  const handleEditSave = async (log) => {
    try {
      setActionLoading(true);
      const startIso = new Date(`${log.log_date}T${editForm.timeIn}:00`).toISOString();
      const endIso   = new Date(`${log.log_date}T${editForm.timeOut}:00`).toISOString();
      const diffMs   = new Date(endIso) - new Date(startIso);
      const hrs      = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

      const { supabase } = await import('../../../services/supabaseClient');
      const { error } = await supabase
        .from('attendance_logs')
        .update({
          time_in: startIso,
          time_out: endIso,
          hours_rendered: hrs,
          activities: editForm.activities,
          updated_at: new Date().toISOString()
        })
        .eq('id', log.id);

      if (error) throw error;

      // Re-sum total hours
      const { data: allLogs } = await supabase
        .from('attendance_logs')
        .select('hours_rendered')
        .eq('internship_id', internshipId)
        .eq('status', 'LOGGED');

      const total = (allLogs || []).reduce((s, l) => s + (l.hours_rendered || 0), 0);
      await supabase
        .from('student_internships')
        .update({ rendered_hours: Math.round(total), updated_at: new Date().toISOString() })
        .eq('id', internshipId);

      setEditingLog(null);
      setToast({ message: `✏️ Log updated — ${hrs.toFixed(2)} hrs recorded.`, type: 'success' });
      await fetchLogs(true);
    } catch (err) {
      setToast({ message: 'Failed to save edit: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Handle CSV Export
  const handleExportCSV = () => {
    if (logs.length === 0) {
      setToast({ message: 'No logs available to export.', type: 'warning' });
      return;
    }

    const headers = ['Date', 'Time In', 'Time Out', 'Hours Rendered', 'Status', 'Tasks / Activities'];
    const rows = logs.map(l => [
      l.log_date,
      l.time_in ? new Date(l.time_in).toLocaleTimeString() : '--',
      l.time_out ? new Date(l.time_out).toLocaleTimeString() : '--',
      l.hours_rendered.toFixed(2),
      l.status,
      `"${(l.activities || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OJT_Attendance_Logs_${user?.student_id || 'Student'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Handle Signed Attendance Report Upload and Scanning
  const handleReportFileChange = async (file) => {
    if (!file) return;
    setReportFile(file);
    setScanningReport(true);
    setReportHours(''); // Clear previous parsed hours during scanning
    setToast({ message: '🔍 AI is scanning your report for total rendered hours...', type: 'info' });

    try {
      const res = await scanOJTAttendanceReportWithGemini(file);
      if (res.success) {
        setReportHours(res.grandTotalHours.toString());
        setToast({ 
          message: `✨ Gemini scanned successfully! Detected ${res.grandTotalHours} OJT hours rendered.`, 
          type: 'success' 
        });
      } else {
        setReportHours('40.0'); // default fallback if scanner returned success:false
        setToast({ 
          message: `⚠️ Gemini scan failed: ${res.error || 'fallback default 40.0 hrs set.'}`, 
          type: 'warning' 
        });
      }
    } catch (err) {
      console.error('Scan error:', err);
      setReportHours('40.0');
      setToast({ message: '⚠️ Scanning failed. Defaulted to 40.0 OJT hours.', type: 'error' });
    } finally {
      setScanningReport(false);
    }
  };

  const handleUploadReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile) {
      setToast({ message: '⚠️ Please select a signed report file.', type: 'error' });
      return;
    }
    if (!reportHours || isNaN(parseFloat(reportHours)) || parseFloat(reportHours) <= 0) {
      setToast({ message: '⚠️ Please enter a valid number of hours.', type: 'error' });
      return;
    }

    try {
      setReportUploading(true);
      const { supabase } = await import('../../../services/supabaseClient');
      
      const fileExt = reportFile.name.split('.').pop();
      const filePath = `pre-internship/signed-attendance-${internshipId}-${Date.now()}.${fileExt}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, reportFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Call backend POST to save document
      const response = await fetch('/api/student/upload-signed-attendance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId,
          fileUrl: publicUrl,
          hours: parseFloat(reportHours)
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        
        throw new Error(resData.error || 'Failed to submit report');
      }

      setToast({ message: '✨ Signed attendance report uploaded and hours deducted successfully!', type: 'success' });
      setShowUploadReportModal(false);
      setReportHours('');
      setReportFile(null);
      
      // Refresh documents list
      await fetchLogs(true);
    } catch (err) {
      console.error('Error uploading signed report:', err);
      setToast({ message: 'Upload failed: ' + err.message, type: 'error' });
    } finally {
      setReportUploading(false);
    }
  };

  // 8. Compute Metrics
  const loggedLogs = logs.filter(l => l.status === 'LOGGED');
  const totalRendered = loggedLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
  const uniqueDates = new Set(loggedLogs.map(l => l.log_date));
  const daysPresent = uniqueDates.size;

  const parseReportHours = (doc) => {
    if (!doc || !doc.comment) return 0;
    const match = doc.comment.match(/\[HOURS:([0-9.]+)\]/);
    return match ? parseFloat(match[1]) : 0;
  };

  const uploadedReportHours = documents
    .filter(d => d.name && d.name.startsWith('Signed Attendance Report'))
    .reduce((sum, d) => sum + parseReportHours(d), 0);

  const remainingHours = Math.max(0, requiredHours - uploadedReportHours);

  // Format decimal hours → "8h 30m"
  const fmtHours = (decHours) => {
    const h = Math.floor(decHours);
    const m = Math.round((decHours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const metrics = [
    { label: 'Total hours rendered', value: fmtHours(totalRendered), icon: Clock, color: studentDesign.colors.primary },
    { label: 'Days present', value: `${daysPresent} days`, icon: Calendar, color: studentDesign.colors.success },
    { label: 'Remaining hours', value: fmtHours(remainingHours), icon: Hourglass, color: studentDesign.colors.warning },
  ];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
    },
    metricCard: {
      ...studentDesign.card,
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    iconBox: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    tableCard: {
      ...studentDesign.card,
      padding: '0',
    },
    tableHeader: {
      padding: '24px',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '16px 24px',
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.semibold,
      color: studentDesign.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    td: {
      padding: '16px 24px',
      fontSize: '14px',
      color: studentDesign.colors.textDark,
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    badge: (status) => {
      let colors = studentDesign.colors.status.neutral;
      if (status === 'LOGGED') colors = studentDesign.colors.status.done;
      if (status === 'IN_PROGRESS') colors = studentDesign.colors.status.active;
      if (status === 'MISSED') colors = studentDesign.colors.status.error;
      
      return {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: studentDesign.typography.weights.medium,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      };
    },
    clockPanel: {
      ...studentDesign.card,
      background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
      color: '#fff',
      padding: '32px',
      borderRadius: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(30, 58, 138, 0.25)',
    }
  };

  // Locked State for Un-deployed Students
  if (!user?.is_deployed) {
    return (
      <div style={{ ...studentDesign.card, textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '600px' }}>
        <AlertTriangle size={48} color={studentDesign.colors.warning} style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: studentDesign.colors.textMain }}>Attendance Tracker Locked</h3>
        <p style={{ color: studentDesign.colors.textMuted, maxWidth: '440px', margin: '8px auto 0', fontSize: '14px', lineHeight: 1.5 }}>
          You must be approved for deployment (Stage 2) by your OJT Adviser to begin logging your daily attendance hours.
        </p>
      </div>
    );
  }

  if (loading) return <PageLoader message="Loading your attendance records..." />;

  const isClockedIn = todayLog && todayLog.status === 'IN_PROGRESS';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={styles.container}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Missed Clock-Out Warning Banner ── */}
      {missedLog && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px solid #FDBA74',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.10)',
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: '#FED7AA', border: '1px solid #FB923C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#EA580C', flexShrink: 0
          }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#9A3412' }}>
              Missed Clock-Out Detected!
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#C2410C', lineHeight: 1.5 }}>
              You forgot to clock out on <strong>{new Date(missedLog.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>.
              Enter your actual clock-out time below to save your hours.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clock-out time</label>
                <input
                  type="time"
                  value={missedClockOut}
                  onChange={e => setMissedClockOut(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: '8px',
                    border: '1px solid #FDBA74', backgroundColor: '#fff',
                    fontSize: '14px', fontWeight: 600, color: '#7C2D12',
                    outline: 'none', cursor: 'pointer'
                  }}
                />
              </div>
              <button
                disabled={actionLoading}
                onClick={handleMissedClockOut}
                style={{
                  marginTop: '16px', padding: '10px 18px', borderRadius: '10px',
                  backgroundColor: '#EA580C', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#C2410C'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EA580C'}
              >
                {actionLoading ? <Loader2 size={14} /> : <XCircle size={14} />}
                Save & Close Missed Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Clock In/Out Panel */}
      <div style={styles.clockPanel}>
        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.05, color: '#fff' }}>
          <Clock size={240} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', zIndex: 2 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>OJT Time Tracker</h2>
            <p style={{ margin: '4px 0 0', color: '#93c5fd', fontSize: '14px' }}>
              {isClockedIn
                ? '🔴 Attendance is active. Your hours are currently ticking!'
                : '👋 Ready to start your shift? Click Clock In to begin. You can clock in multiple times per day.'}
            </p>
          </div>

          {isClockedIn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '14px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>
                {elapsedTime}
              </span>
            </div>
          )}
        </div>


        <div style={{ zIndex: 2, display: 'flex', gap: '12px' }}>
          {isClockedIn ? (
            <button
              disabled={actionLoading}
              onClick={handleClockOut}
              style={{
                backgroundColor: '#ef4444', color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Square size={18} fill="#fff" />}
              Clock Out &amp; Save Shift
            </button>
          ) : (
            <button
              disabled={actionLoading}
              onClick={handleClockIn}
              style={{
                backgroundColor: '#3b82f6', color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="#fff" />}
              Clock In Shift
            </button>
          )}
        </div>
      </div>

      {/* Shift & Reminder Settings Panel */}
      <div style={{
        ...studentDesign.card,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '1px solid #E2E8F0',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: studentDesign.shadows.premium,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            backgroundColor: `${studentDesign.colors.primary}15`,
            color: studentDesign.colors.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: studentDesign.colors.textMain }}>Shift & Reminder Settings</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: studentDesign.colors.textMuted }}>
              Set your usual OJT work hours and enable automated email alerts to prevent clocking errors.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #F1F5F9'
        }}>
          {/* Shift Start Time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: studentDesign.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Shift Start Time
            </label>
            <input
              type="time"
              value={usualTimeIn}
              onChange={e => setUsualTimeIn(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #CBD5E1', backgroundColor: '#fff',
                fontSize: '14px', fontWeight: 600, color: '#1E293B',
                outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Shift End Time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: studentDesign.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Shift End Time
            </label>
            <input
              type="time"
              value={usualTimeOut}
              onChange={e => setUsualTimeOut(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #CBD5E1', backgroundColor: '#fff',
                fontSize: '14px', fontWeight: 600, color: '#1E293B',
                outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Toggle Reminders Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              style={{
                width: '50px',
                height: '26px',
                borderRadius: '13px',
                backgroundColor: remindersEnabled ? studentDesign.colors.primary : '#CBD5E1',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
                padding: 0
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                position: 'absolute',
                top: '3px',
                left: remindersEnabled ? '27px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                Email Shift Reminders
              </span>
              <span style={{ fontSize: '11px', color: studentDesign.colors.textMuted }}>
                Sends a reminder email if you forget to clock in/out.
              </span>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleSaveSettings}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              backgroundColor: studentDesign.colors.primary,
              color: '#fff', border: 'none',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
              transition: 'all 0.2s', alignSelf: 'flex-end',
              display: 'flex', alignItems: 'center', gap: '8px',
              minWidth: '150px', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E3A8A'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = studentDesign.colors.primary}
          >
            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            Save Shift Settings
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        {metrics.map((m, idx) => (
          <div key={idx} style={styles.metricCard}>
            <div style={styles.iconBox(m.color)}>
              <m.icon size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: studentDesign.colors.textMuted }}>{m.label}</span>
              <span style={{ fontSize: '20px', fontWeight: studentDesign.typography.weights.semibold }}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Signed Attendance Reports Section ── */}
      <div style={{
        ...studentDesign.card,
        padding: '24px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        boxShadow: studentDesign.shadows.premium,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: '#dcfce7',
              color: studentDesign.colors.success,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: studentDesign.colors.textMain }}>Signed Attendance Reports</h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: studentDesign.colors.textMuted }}>
                Upload your officially signed CCIT-FO-017 report here. Approved hours will be deducted from your remaining required hours.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowUploadReportModal(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: studentDesign.colors.success,
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#15803d'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = studentDesign.colors.success}
          >
            <Play size={12} fill="#fff" /> Upload Signed Report
          </button>
        </div>

        {/* List of Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {documents.filter(d => d.name && d.name.startsWith('Signed Attendance Report')).length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px dashed #E2E8F0', color: studentDesign.colors.textMuted, fontSize: '13px' }}>
              No signed attendance reports uploaded yet. Click "Upload Signed Report" to submit your first report!
            </div>
          ) : (
            documents.filter(d => d.name && d.name.startsWith('Signed Attendance Report')).map((doc, idx) => {
              const hrs = parseReportHours(doc);
              return (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={18} style={{ color: studentDesign.colors.success }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                        {doc.name}
                      </span>
                      <span style={{ fontSize: '11px', color: studentDesign.colors.textMuted }}>
                        Submitted on {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: studentDesign.colors.success }}>
                      +{hrs.toFixed(2)} hrs deducted
                    </span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        color: studentDesign.colors.primary,
                        backgroundColor: `${studentDesign.colors.primary}10`,
                        border: `1px solid ${studentDesign.colors.primary}20`,
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Daily Logs History Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: studentDesign.colors.textMain }}>Daily Log History</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={handleExportCSV}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: studentDesign.colors.primary, 
                fontWeight: studentDesign.typography.weights.semibold, 
                fontSize: '14px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}
            >
              Export CSV <ArrowUpRight size={16} />
            </button>
            <button 
              onClick={() => setShowExportModal(true)}
              style={{ 
                backgroundColor: `${studentDesign.colors.primary}10`, 
                border: `1px solid ${studentDesign.colors.primary}30`, 
                borderRadius: '8px',
                padding: '6px 12px',
                color: studentDesign.colors.primary, 
                fontWeight: studentDesign.typography.weights.semibold, 
                fontSize: '13px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = studentDesign.colors.primary;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = `${studentDesign.colors.primary}10`;
                e.currentTarget.style.color = studentDesign.colors.primary;
              }}
            >
              Export Official PDF <FileText size={14} />
            </button>
          </div>
        </div>
        {logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: studentDesign.colors.textMuted }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.15 }} />
            <p style={{ fontWeight: 600, fontSize: '15px', margin: 0 }}>No shift attendance logs recorded yet.</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0' }}>Your completed shift hours will appear here after you clock out.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time in</th>
                <th style={styles.th}>Time out</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => {
                const isEditing = editingLog === log.id;
                return (
                  <tr key={idx} style={{ backgroundColor: log.status === 'IN_PROGRESS' ? '#F8FAFC' : (isEditing ? '#EFF6FF' : 'transparent') }}>
                    {/* Date */}
                    <td style={styles.td}>
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    {/* Time In */}
                    <td style={styles.td}>
                      {isEditing ? (
                        <input type="time" value={editForm.timeIn}
                          onChange={e => setEditForm(f => ({ ...f, timeIn: e.target.value }))}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${studentDesign.colors.border}`, fontSize: '13px' }} />
                      ) : (
                        log.time_in ? new Date(log.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'
                      )}
                    </td>
                    {/* Time Out */}
                    <td style={styles.td}>
                      {isEditing ? (
                        <input type="time" value={editForm.timeOut}
                          onChange={e => setEditForm(f => ({ ...f, timeOut: e.target.value }))}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: `1px solid ${studentDesign.colors.border}`, fontSize: '13px' }} />
                      ) : (
                        log.time_out ? new Date(log.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'
                      )}
                    </td>
                    {/* Duration */}
                    <td style={styles.td}>
                      {log.status === 'IN_PROGRESS' ? '--' : fmtHours(log.hours_rendered || 0)}
                    </td>
                    {/* Status */}
                    <td style={styles.td}>
                      <span style={styles.badge(log.status)}>
                        {log.status === 'IN_PROGRESS' ? 'In progress' : 'Logged'}
                      </span>
                    </td>
                    {/* Edit */}
                    <td style={styles.td}>
                      {log.status === 'LOGGED' && (
                        isEditing ? (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleEditSave(log)}
                            title="Save changes"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '4px' }}
                          >
                            {actionLoading ? <Loader2 size={16} /> : <Check size={16} />}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingLog(log.id);
                              setEditForm({
                                timeIn:  log.time_in  ? new Date(log.time_in).toTimeString().slice(0,5)  : '08:00',
                                timeOut: log.time_out ? new Date(log.time_out).toTimeString().slice(0,5) : '17:00',
                                activities: log.activities || ''
                              });
                            }}
                            title="Edit this log"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: studentDesign.colors.textMuted, padding: '4px' }}
                          >
                            <Pencil size={15} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {/* ── Upload Report Modal ── */}
      {showUploadReportModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: studentDesign.colors.textMain }}>
                  Upload Signed Attendance Report
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: studentDesign.colors.textMuted }}>
                  Submit supervisor-signed logs to deduct OJT hours.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUploadReportModal(false);
                  setReportFile(null);
                  setReportHours('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUploadReportSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* File Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: studentDesign.colors.textMain }}>
                  Signed PDF or Image Sheet
                </label>
                <div style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onClick={() => document.getElementById('report-file-input').click()}
                >
                  <input
                    type="file"
                    id="report-file-input"
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                    style={{ display: 'none' }}
                    onChange={e => handleReportFileChange(e.target.files[0])}
                  />
                  <FileText size={28} style={{ color: studentDesign.colors.textMuted, margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: studentDesign.colors.textMain, display: 'block' }}>
                    {reportFile ? reportFile.name : 'Select or drop signed file'}
                  </span>
                  <span style={{ fontSize: '11px', color: studentDesign.colors.textMuted, display: 'block', marginTop: '4px' }}>
                    {reportFile ? `${(reportFile.size / 1024).toFixed(1)} KB` : 'Accepts PDF or Image up to 10MB'}
                  </span>
                </div>
              </div>

              {/* AI Hour Detection Status Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {scanningReport ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '16px',
                    backgroundColor: '#EFF6FF',
                    borderRadius: '12px',
                    border: '1px solid #BFDBFE',
                    color: '#1E40AF',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Analyzing document with Gemini AI... Please wait...</span>
                  </div>
                ) : reportHours ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '16px',
                    backgroundColor: '#EFFDF4',
                    borderRadius: '12px',
                    border: '1px solid #BBF7D0',
                    color: '#15803D',
                    boxShadow: '0 4px 6px -1px rgba(240, 253, 244, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px' }}>
                      <span>✨ AI Detected Rendered Hours:</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#DCFCE7',
                        fontSize: '15px',
                        color: '#166534',
                        fontWeight: 900
                      }}>
                        {parseFloat(reportHours).toFixed(2)} hrs
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#166534', marginTop: '4px', opacity: 0.8 }}>
                      Successfully parsed cumulative total from your uploaded sheet. Press "Deduct Hours" to complete the request.
                    </span>
                  </div>
                ) : (
                  <div style={{
                    padding: '14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    color: studentDesign.colors.textMuted,
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    Select a signed report sheet above. Gemini AI will automatically read your PDF/Image and extract the hours completed.
                  </div>
                )}
              </div>

              {/* Modal Footer / Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadReportModal(false);
                    setReportFile(null);
                    setReportHours('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: studentDesign.colors.textMain,
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportUploading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: studentDesign.colors.success,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {reportUploading ? <Loader2 size={16} className="animate-spin" /> : 'Deduct Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Official PDF Export Configuration Modal ── */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1D2D5B 0%, #1E40AF 100%)',
              padding: '24px',
              color: '#FFFFFF',
              position: 'relative'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Export Attendance Report
              </h3>
              <p style={{ margin: '4px 0 0', color: '#93C5FD', fontSize: '13px' }}>
                Generate official CCIT-FO-017 PDF for submission
              </p>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Type Selection Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Select Reporting Interval
                </span>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  backgroundColor: '#F1F5F9',
                  padding: '4px',
                  borderRadius: '12px'
                }}>
                  {['daily', 'weekly', 'monthly'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setExportType(type)}
                      style={{
                        padding: '10px 0',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: exportType === type ? '#FFFFFF' : 'transparent',
                        color: exportType === type ? '#1D2D5B' : '#64748B',
                        boxShadow: exportType === type ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Inputs Container */}
              <div style={{
                backgroundColor: '#F8FAFC',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                minHeight: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {exportType === 'daily' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      SPECIFIC DATE
                    </label>
                    <input
                      type="date"
                      value={dailyDate}
                      onChange={e => setDailyDate(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        color: '#1E293B',
                        outline: 'none',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                )}

                {exportType === 'weekly' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                        START DATE
                      </label>
                      <input
                        type="date"
                        value={weeklyStart}
                        onChange={e => setWeeklyStart(e.target.value)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '14px',
                          color: '#1E293B',
                          outline: 'none',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                        END DATE
                      </label>
                      <input
                        type="date"
                        value={weeklyEnd}
                        onChange={e => setWeeklyEnd(e.target.value)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '14px',
                          color: '#1E293B',
                          outline: 'none',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                )}

                {exportType === 'monthly' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      SELECT MONTH
                    </label>
                    <input
                      type="month"
                      value={monthlyMonth}
                      onChange={e => setMonthlyMonth(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        color: '#1E293B',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportPDF(exportType, { dailyDate, weeklyStart, weeklyEnd, monthlyMonth });
                    setShowExportModal(false);
                  }}
                  style={{
                    flex: 1.5,
                    padding: '12px 0',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#1D2D5B',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(29, 45, 91, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E40AF'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1D2D5B'}
                >
                  Generate Official PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Dynamic Keyframe Injection for Glowing Red Pulsing Dot */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </motion.div>
  );
};

export default Attendance;
