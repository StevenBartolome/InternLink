import React, { useState, useEffect } from 'react';
import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  Hourglass,
  Play,
  Square,
  AlertTriangle,
  Loader2,
  FileText,
  XCircle,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { attendanceService } from '../../../services/attendanceService';
import { studentService } from '../../../services/studentService';
import { scanOJTAttendanceReportWithGemini } from '../../../services/geminiCORScanner';
import Toast from '../../../components/common/Toast';
import PageLoader from '../../../components/common/PageLoader';

const Attendance = () => {
  const { user, forceRefreshProfile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [reportHours, setReportHours] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [scanningReport, setScanningReport] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportLoggedDates, setReportLoggedDates] = useState([]);
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

  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // Logs table controls
  const [currentPage, setCurrentPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState('all'); // 'all' or 'YYYY-MM'
  const [sortOrder, setSortOrder] = useState('desc');    // 'desc' or 'asc'

  // Logs Filtering and Pagination Logic
  const filteredAndSortedLogs = React.useMemo(() => {
    let result = [...logs];
    
    // 1. Filter by month
    if (monthFilter !== 'all') {
      const [year, month] = monthFilter.split('-');
      result = result.filter(log => {
        if (!log.log_date) return false;
        const [lYear, lMonth] = log.log_date.split('-');
        return lYear === year && lMonth === month;
      });
    }

    // 2. Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.log_date + 'T00:00:00').getTime();
      const dateB = new Date(b.log_date + 'T00:00:00').getTime();
      if (sortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return result;
  }, [logs, monthFilter, sortOrder]);

  const logsPerPage = 10;
  const totalPages = Math.ceil(filteredAndSortedLogs.length / logsPerPage) || 1;
  const paginatedLogs = filteredAndSortedLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  // Generate unique months for the filter dropdown
  const availableMonths = React.useMemo(() => {
    const months = new Set();
    logs.forEach(log => {
      if (log.log_date) {
        const [year, month] = log.log_date.split('-');
        months.add(`${year}-${month}`);
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [logs]);

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [monthFilter, sortOrder]);

  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatMonthYear = (dateObj) => {
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getViewedMonthDays = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ isPadding: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isPadding: false
      });
    }
    return days;
  };

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

  const [exportWeekNo, setExportWeekNo] = useState('');

  // Auto-calculate Week Number based on start date
  useEffect(() => {
    const ojtStartDate = user?.start_date || (logs.length > 0 ? [...logs].sort((a, b) => new Date(a.log_date + 'T00:00:00') - new Date(b.log_date + 'T00:00:00'))[0].log_date : null);
    
    if (!ojtStartDate) {
      setExportWeekNo('');
      return;
    }

    let referenceDate = '';
    if (exportType === 'daily') {
      referenceDate = dailyDate;
    } else if (exportType === 'weekly') {
      referenceDate = weeklyStart;
    }

    if (ojtStartDate && referenceDate) {
      const start = new Date(ojtStartDate + 'T00:00:00');
      const ref = new Date(referenceDate + 'T00:00:00');
      const diffTime = ref - start;
      if (diffTime < 0) {
        setExportWeekNo('Week 1');
      } else {
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNum = Math.floor(diffDays / 7) + 1;
        setExportWeekNo(`Week ${weekNum}`);
      }
    } else {
      setExportWeekNo('');
    }
  }, [exportType, dailyDate, weeklyStart, user?.start_date, logs]);

  const handleExportPDF = (type, options) => {
    let filtered = [];
    let dynamicDateValue = '';

    if (type === 'daily') {
      filtered = logs.filter(l => l.log_date === options.dailyDate && l.status === 'LOGGED');
      const dailyDate = new Date(options.dailyDate + 'T00:00:00');
      dynamicDateValue = dailyDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (type === 'weekly') {
      filtered = logs.filter(l => l.log_date >= options.weeklyStart && l.log_date <= options.weeklyEnd && l.status === 'LOGGED');
      const start = new Date(options.weeklyStart + 'T00:00:00');
      const end = new Date(options.weeklyEnd + 'T00:00:00');
      const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
      const startDay = start.getDate();
      const startYear = start.getFullYear();
      
      const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
      const endDay = end.getDate();
      const endYear = end.getFullYear();
      
      if (startYear !== endYear) {
        dynamicDateValue = `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      } else if (startMonth !== endMonth) {
        dynamicDateValue = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
      } else {
        dynamicDateValue = `${startMonth} ${startDay}-${endDay}, ${startYear}`;
      }
    }

    if (filtered.length === 0) {
      setToast({ message: '⚠️ No logged attendance entries found for the selected period.', type: 'error' });
      return;
    }

    // Sort chronologically
    filtered.sort((a, b) => new Date(a.log_date + 'T00:00:00') - new Date(b.log_date + 'T00:00:00'));

    const totalHoursPeriod = filtered.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);

    // Calculate previous hours
    // DEDUCTED logs represent periods already uploaded and must be counted as prior rendered hours
    // to avoid showing incorrect cumulative totals on the PDF
    const rangeStart = type === 'daily' ? options.dailyDate : options.weeklyStart;
    const rangeEnd = type === 'daily' ? options.dailyDate : options.weeklyEnd;
    const previousLogs = logs.filter(l => {
      if (l.status !== 'LOGGED' && l.status !== 'DEDUCTED') return false;
      if (l.log_date < rangeStart) return true;
      if (l.log_date >= rangeStart && l.log_date <= rangeEnd && l.status === 'DEDUCTED') return true;
      return false;
    });
    const previousTotal = previousLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
    const grandTotal = previousTotal + totalHoursPeriod;

    // Pad with empty rows to minimum of 15 rows for layout structure
    const maxRows = 15;
    const displayRows = [...filtered];
    while (displayRows.length < maxRows) {
      displayRows.push({ isPadding: true });
    }

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
              color: #000; 
              margin: 0; 
              padding: 0; 
              font-size: 11px;
              line-height: 1.3;
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
            .header-text {
              flex: 1;
            }
            .header-title-nu {
              font-size: 24px;
              font-weight: bold;
              color: #1D2D5B;
              margin: 0;
              line-height: 1.1;
            }
            .header-subtitle {
              font-size: 13px;
              color: #1D2D5B;
              margin: 2px 0 0 0;
              font-weight: 500;
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
            .note-box {
              border: 1px solid #000;
              padding: 8px 10px;
              font-size: 10px;
              margin-bottom: 10px;
              line-height: 1.4;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
            }
            .data-table th {
              background-color: #ffffff;
              color: #000;
              font-weight: bold;
              text-align: center;
              padding: 6px;
              font-size: 11px;
              border: 1px solid #000;
            }
            .data-table td {
              padding: 5px;
              border: 1px solid #000;
              font-size: 11px;
            }
            .totals-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: -1px;
            }
            .totals-table td {
              border: 1px solid #000;
              padding: 4px 8px;
              font-size: 11px;
              vertical-align: middle;
            }
            .totals-label {
              font-weight: bold;
              text-align: left;
            }
            .totals-value {
              font-weight: bold;
              text-align: center;
            }
            .signatures-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
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
            .verification-text {
              border: 1px solid #000;
              padding: 6px 10px;
              font-style: italic;
              font-size: 10px;
              line-height: 1.4;
            }
            .footer-section {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-family: Arial, sans-serif;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <img class="header-logo" src="${window.location.origin}/nu-logo.png" alt="NU Logo" />
          </div>
          
          <hr class="gold-divider" />
          
          <h2 class="report-title">DAILY ATTENDANCE REPORT</h2>
          
          <table class="metadata-table">
            <tr>
              <td class="metadata-label">Name:</td>
              <td style="text-transform: uppercase; font-weight: bold;">${user?.first_name || ''} ${user?.last_name || ''}</td>
            </tr>
            <tr>
              <td class="metadata-label">Company:</td>
              <td style="font-weight: bold;">${user?.company_name || 'N/A'}</td>
            </tr>
            <tr>
              <td class="metadata-label">Date:</td>
              <td style="font-weight: bold;">${dynamicDateValue}</td>
            </tr>
          </table>
          
          <div class="note-box">
            <strong>NOTE:</strong> To be filled-up by the intern and signed by the Internship Supervisor/immediate supervisor. This must be submitted to the Internship Coordinator along with the weekly activity report.
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 25%">Date</th>
                <th style="width: 25%">Time-In</th>
                <th style="width: 25%">Time-Out</th>
                <th style="width: 25%">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              ${displayRows.map(l => {
                if (l.isPadding) {
                  return `
                    <tr style="height: 25px;">
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                  `;
                }
                return `
                  <tr style="height: 25px;">
                    <td style="text-align: center;">${new Date(l.log_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                    <td style="text-align: center;">${l.time_in ? new Date(l.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                    <td style="text-align: center;">${l.time_out ? new Date(l.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                    <td style="text-align: center; font-weight: bold;">${l.hours_rendered ? l.hours_rendered.toFixed(2) : '0.00'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <table class="totals-table">
            <tr>
              <td class="totals-label" style="width: 15%;">Previous<br>Total:</td>
              <td class="totals-value" style="width: 15%;">${previousTotal.toFixed(2)}</td>
              <td class="totals-label" style="width: 15%;">Total this<br>Period:</td>
              <td class="totals-value" style="width: 15%;">${totalHoursPeriod.toFixed(2)}</td>
              <td class="totals-label" style="width: 28%; text-align: center; line-height: 1.2;">
                Total Hours Served:<br>
                <span style="font-weight: normal; font-style: italic; font-size: 9px;">(Previous Total + Total this Period)</span>
              </td>
              <td class="totals-value" style="width: 12%; font-size: 12px;">${grandTotal.toFixed(2)}</td>
            </tr>
          </table>
          
          <table class="signatures-table">
            <tr>
              <td class="sig-label">Intern Signature</td>
              <td style="width: 55%;"><!-- empty space for signature --></td>
              <td class="sig-date">
                <div class="sig-date-label">Date</div>
              </td>
            </tr>
            <tr>
              <td colspan="3" class="verification-text">
                I verify that the above information is correct and that the intern was in attendance on the above days at the times indicated.
              </td>
            </tr>
            <tr>
              <td class="sig-label">Supervisor<br>Signature</td>
              <td style="width: 55%;"><!-- empty space for signature --></td>
              <td class="sig-date">
                <div class="sig-date-label">Date</div>
              </td>
            </tr>
          </table>
          
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
      
      // Force refresh the user profile in AuthContext to apply settings instantly
      await forceRefreshProfile();

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

  useRealtimeSubscription(
    ['attendance_logs', 'student_internships', 'pre_internship_documents'],
    () => { if (internshipId && isDeployed) fetchLogs(true); }
  );

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

  // Helper function to apply the daily OJT overtime (max 2 hours) and absolute 7:00 PM cutoff caps
  const applyOvertimeCap = (logDate, timeInIso, timeOutIso, usualTimeOut = '17:00') => {
    const timeInDate = new Date(timeInIso);
    const timeOutDate = new Date(timeOutIso);
    
    // Extract date parts
    const year = timeInDate.getFullYear();
    const month = timeInDate.getMonth();
    const date = timeInDate.getDate();

    // 1. Parse standard usualTimeOut (HH:mm)
    const [outHrs, outMins] = (usualTimeOut || '17:00').split(':').map(Number);
    const shiftEndTime = new Date(year, month, date, outHrs, outMins, 0);

    // 2. Maximum overtime is 2 hours
    const maxOtEndTime = new Date(shiftEndTime.getTime() + 2 * 60 * 60 * 1000);

    // 3. Absolute cap is 7:00 PM (19:00) on that shift day
    const absoluteCapTime = new Date(year, month, date, 19, 0, 0);

    // 4. Maximum allowed credited end time is the smaller of shiftEndTime+2h or 7 PM
    const allowedEndTime = new Date(Math.min(maxOtEndTime.getTime(), absoluteCapTime.getTime()));

    let finalTimeOut = timeOutDate;
    let wasCapped = false;
    let capReason = '';

    if (timeOutDate > allowedEndTime) {
      finalTimeOut = allowedEndTime;
      wasCapped = true;
      if (maxOtEndTime.getTime() < absoluteCapTime.getTime()) {
        capReason = 'daily overtime limit (maximum 2 hours)';
      } else {
        capReason = 'absolute 7:00 PM cutoff rule';
      }
    }

    const diffMs = finalTimeOut - timeInDate;
    const hoursRendered = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

    return {
      timeOutIso: finalTimeOut.toISOString(),
      hoursRendered,
      wasCapped,
      capReason
    };
  };

  // 4. Handle Clock Out
  const handleClockOut = async () => {
    if (!todayLog || !internshipId) return;
    try {
      setActionLoading(true);
      const usualTimeOut = user?.user_metadata?.usual_time_out || '17:00';
      const res = await attendanceService.clockOut(
        todayLog.id,
        internshipId,
        todayLog.time_in,
        usualTimeOut
      );
      setTodayLog(res.log);
      
      if (res.wasCapped) {
        setToast({ 
          message: `🔒 Clocked out! Hours capped at ${res.log.hours_rendered} hrs due to ${res.capReason}.`, 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: `🔒 Clocked out! ${res.log.hours_rendered} hrs saved. Keep up the great work!`, 
          type: 'success' 
        });
      }
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
      const usualTimeOut = user?.user_metadata?.usual_time_out || '17:00';
      
      // Build actual retroactive time_out ISO string on the missed date
      const retroTimeOutStr = new Date(`${missedLog.log_date}T${missedClockOut}:00`).toISOString();
      
      // Apply capping
      const capResult = applyOvertimeCap(missedLog.log_date, missedLog.time_in, retroTimeOutStr, usualTimeOut);

      const { supabase } = await import('../../../services/supabaseClient');
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          time_out: capResult.timeOutIso,
          hours_rendered: capResult.hoursRendered,
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
        .in('status', ['LOGGED', 'DEDUCTED']);

      if (fetchError) throw fetchError;

      const totalHours = allLogs.reduce((sum, l) => sum + (l.hours_rendered || 0), 0);
      const roundedHours = Math.round(totalHours);
      
      const updatePayload = { rendered_hours: roundedHours, updated_at: new Date().toISOString() };
      if (roundedHours >= requiredHours && user?.current_stage === 'DURING_INTERNSHIP') {
        updatePayload.current_stage = 'POST_INTERNSHIP';
      }

      await supabase
        .from('student_internships')
        .update(updatePayload)
        .eq('id', internshipId);

      setMissedLog(null);
      
      if (capResult.wasCapped) {
        setToast({ 
          message: `⚠️ Missed clock-out resolved! Hours capped at ${capResult.hoursRendered} hrs due to ${capResult.capReason}.`, 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: `✅ Missed clock-out resolved! ${capResult.hoursRendered} hours saved for ${missedLog.log_date}.`, 
          type: 'success' 
        });
      }
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
      const usualTimeOut = user?.user_metadata?.usual_time_out || '17:00';
      
      const startIso = new Date(`${log.log_date}T${editForm.timeIn}:00`).toISOString();
      const endIso   = new Date(`${log.log_date}T${editForm.timeOut}:00`).toISOString();
      
      // Apply capping
      const capResult = applyOvertimeCap(log.log_date, startIso, endIso, usualTimeOut);

      const { supabase } = await import('../../../services/supabaseClient');
      const { error } = await supabase
        .from('attendance_logs')
        .update({
          time_in: startIso,
          time_out: capResult.timeOutIso,
          hours_rendered: capResult.hoursRendered,
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
        .in('status', ['LOGGED', 'DEDUCTED']);

      const total = (allLogs || []).reduce((s, l) => s + (l.hours_rendered || 0), 0);
      const roundedTotal = Math.round(total);

      const updatePayload = { rendered_hours: roundedTotal, updated_at: new Date().toISOString() };
      if (roundedTotal >= requiredHours && user?.current_stage === 'DURING_INTERNSHIP') {
        updatePayload.current_stage = 'POST_INTERNSHIP';
      }

      await supabase
        .from('student_internships')
        .update(updatePayload)
        .eq('id', internshipId);

      setEditingLog(null);
      
      if (capResult.wasCapped) {
        setToast({ 
          message: `⚠️ Log updated! Hours capped at ${capResult.hoursRendered.toFixed(2)} hrs due to ${capResult.capReason}.`, 
          type: 'warning' 
        });
      } else {
        setToast({ 
          message: `✏️ Log updated — ${capResult.hoursRendered.toFixed(2)} hrs recorded.`, 
          type: 'success' 
        });
      }
      await fetchLogs(true);
    } catch (err) {
      setToast({ message: 'Failed to save edit: ' + err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };



  // 7. Handle Signed Attendance Report Upload and Scanning
  const handleReportFileChange = async (file) => {
    if (!file) return;

    // Check if the selected file name matches any already uploaded file in documents
    const isSameName = (documents || []).some(doc => {
      if (doc.name && doc.name.startsWith('Signed Attendance Report')) {
        if (doc.comment && doc.comment.includes(`(File: ${file.name})`)) {
          return true;
        }
      }
      return false;
    });

    if (isSameName) {
      setToast({
        message: `⚠️ You have already uploaded this exact file (${file.name}). Please select a different report.`,
        type: 'error'
      });
      setReportFile(null);
      const fileInput = document.getElementById('report-file-input');
      if (fileInput) fileInput.value = '';
      return;
    }

    // 2. Check if the selected file name matches the storage URL filename (instant check)
    const isSameStorageName = (documents || []).some(doc => {
      if (doc.name && doc.name.startsWith('Signed Attendance Report') && doc.fileUrl) {
        const urlParts = doc.fileUrl.split('/');
        const urlFileName = urlParts[urlParts.length - 1];
        // Match exact name, or if one contains the other (e.g. downloaded files with prepended path/UUIDs)
        if (urlFileName === file.name || urlFileName.includes(file.name) || file.name.includes(urlFileName)) {
          return true;
        }
      }
      return false;
    });

    if (isSameStorageName) {
      setToast({
        message: `⚠️ You have already uploaded this exact file. Please select a different report.`,
        type: 'error'
      });
      setReportFile(null);
      const fileInput = document.getElementById('report-file-input');
      if (fileInput) fileInput.value = '';
      return;
    }

    // 3. Check by file size in parallel using GET (to catch renamed copies and bypass CORS HEAD request limits)
    try {
      const targetDocs = (documents || []).filter(doc => doc.name && doc.name.startsWith('Signed Attendance Report') && doc.fileUrl);
      if (targetDocs.length > 0) {
        const sizeChecks = await Promise.all(
          targetDocs.map(async (doc) => {
            try {
              // Using GET instead of HEAD as some CORS setups block HEAD by default
              const res = await fetch(doc.fileUrl, { method: 'GET' });
              if (res.ok) {
                const blob = await res.blob();
                if (blob && blob.size === file.size) {
                  return true;
                }
              }
            } catch (err) {
              console.warn('Error checking file size for document:', doc.name, err);
            }
            return false;
          })
        );
        if (sizeChecks.some(matched => matched)) {
          setToast({
            message: `⚠️ You have already uploaded this exact file. Please select a different report.`,
            type: 'error'
          });
          setReportFile(null);
          const fileInput = document.getElementById('report-file-input');
          if (fileInput) fileInput.value = '';
          return;
        }
      }
    } catch (err) {
      console.warn('Error performing duplicate size check:', err);
    }

    setReportFile(file);
    setScanningReport(true);
    setReportHours(''); // Clear previous parsed hours during scanning
    setReportStartDate('');
    setReportEndDate('');
    setReportLoggedDates([]);
    setToast({ message: '🔍 AI is scanning your report for total rendered hours and dates... (may retry if model is busy)', type: 'info' });

    try {
      const res = await scanOJTAttendanceReportWithGemini(file);
      if (res.success) {
        
        // 4. Validate Student Name
        if (res.studentName && res.studentName.trim().length > 0 && !['null', 'n/a', 'not found', 'none'].includes(res.studentName.toLowerCase())) {
          const foundName = res.studentName.toLowerCase();
          const firstName = (user?.first_name || '').toLowerCase();
          const lastName = (user?.last_name || '').toLowerCase();
          
          const nameParts = [...firstName.split(' '), ...lastName.split(' ')].filter(p => p.length > 2);
          const hasMatch = nameParts.some(part => foundName.includes(part));
          
          if (!hasMatch && nameParts.length > 0) {
            setToast({
              message: `⚠️ Name mismatch: The report belongs to "${res.studentName}", but your account is "${user?.first_name} ${user?.last_name}". Upload rejected.`,
              type: 'error'
            });
            setReportFile(null);
            const fileInput = document.getElementById('report-file-input');
            if (fileInput) fileInput.value = '';
            return;
          }
        }

        const dates = Array.isArray(res.loggedDates) && res.loggedDates.length > 0
          ? [...res.loggedDates].sort()
          : [];

        // Derive start/end from logged dates (more reliable than header text parsing)
        const derivedStart = dates.length > 0 ? dates[0] : (res.startDate || '');
        const derivedEnd   = dates.length > 0 ? dates[dates.length - 1] : (res.endDate || '');

        // Check if there is already an approved report with the exact same date range
        const isSameDateRange = (documents || []).some(doc => {
          if (doc.name && doc.name.startsWith('Signed Attendance Report')) {
            const match = doc.name.match(/\[([0-9-]+)\s+to\s+([0-9-]+)\]/);
            if (match) {
              const [_, existingStart, existingEnd] = match;
              if (existingStart === derivedStart && existingEnd === derivedEnd) {
                return true;
              }
            }
          }
          return false;
        });

        if (isSameDateRange) {
          setToast({
            message: `⚠️ A report for the period ${derivedStart} to ${derivedEnd} has already been uploaded.`,
            type: 'error'
          });
          setReportFile(null);
          const fileInput = document.getElementById('report-file-input');
          if (fileInput) fileInput.value = '';
          return;
        }

        setReportHours(res.grandTotalHours.toString());

        if (derivedStart) setReportStartDate(derivedStart);
        if (derivedEnd)   setReportEndDate(derivedEnd);
        if (dates.length > 0) setReportLoggedDates(dates);

        setToast({
          message: `✨ Scan successful! Detected ${res.grandTotalHours} OJT hours${derivedStart && derivedEnd ? ` from ${derivedStart} to ${derivedEnd}` : ''}.`,
          type: 'success'
        });
      } else {
        setReportHours('40.0'); // default fallback if scanner returned success:false
        setToast({ 
          message: `⚠️ Scan failed: ${res.error || 'fallback default 40.0 hrs set.'}`, 
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

    if (!reportStartDate || !reportEndDate) {
      setToast({ message: '⚠️ Start and end dates are missing. Please re-upload the PDF or fill them manually.', type: 'error' });
      return;
    }

    try {
      setReportUploading(true);
      console.log('[Upload] Submitting report:', { internshipId, reportStartDate, reportEndDate, loggedDates: reportLoggedDates });
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
          hours: parseFloat(reportHours),
          startDate: reportStartDate,
          endDate: reportEndDate,
          loggedDates: reportLoggedDates,
          originalFileName: reportFile.name
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        
        throw new Error(resData.error || 'Failed to submit report');
      }

      setToast({ 
        message: `✨ Signed attendance report uploaded! ${resData.updatedCount > 0 ? `Deducted ${resData.updatedCount} log${resData.updatedCount > 1 ? 's' : ''}.` : 'No matching LOGGED logs were found to deduct.'}`, 
        type: 'success' 
      });
      setShowUploadReportModal(false);
      setReportHours('');
      setReportFile(null);
      setReportStartDate('');
      setReportEndDate('');
      setReportLoggedDates([]);
      
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
  const loggedLogs = logs.filter(l => l.status === 'LOGGED' || l.status === 'DEDUCTED');
  // We no longer calculate this from raw logs or `user.rendered_hours`.
  // The correct official total matches what is in the Dashboard: `uploadedReportHours`
  const uniqueDates = new Set(loggedLogs.map(l => l.log_date));
  const daysPresent = uniqueDates.size;

  const parseReportHours = (doc) => {
    if (!doc || !doc.comment) return 0;
    const match = doc.comment.match(/\[HOURS:([0-9.]+)\]/);
    return match ? parseFloat(match[1]) : 0;
  };

  const uploadedReportHours = documents
    .filter(d => d.name && d.name.startsWith('Signed Attendance Report') && d.status !== 'Not submitted')
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
    { label: 'Total hours rendered', value: fmtHours(uploadedReportHours), icon: Clock, color: studentDesign.colors.primary },
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
      if (status === 'DEDUCTED') colors = { bg: '#ECFDF5', text: '#047857', border: '#D1FAE5' }; // Green for Deducted
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
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      gap: '24px',
    },
    calendarCard: {
      ...studentDesign.card,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '24px',
      borderRadius: '20px',
      boxShadow: studentDesign.shadows.premium,
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      border: '1px solid #E2E8F0',
      minHeight: '340px'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    calendarTitle: {
      fontSize: '16px',
      fontWeight: 800,
      color: studentDesign.colors.textMain,
      margin: 0
    },
    navBtn: {
      border: '1px solid #E2E8F0',
      background: '#fff',
      color: studentDesign.colors.textMain,
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      outline: 'none'
    },
    calendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      textAlign: 'center'
    },
    weekHeader: {
      fontSize: '11px',
      fontWeight: 700,
      color: studentDesign.colors.textMuted,
      textTransform: 'uppercase',
      paddingBottom: '4px'
    },
    dayCell: (isToday, hasLog, isLogged, isScheduled, isPadding) => {
      let bg = 'transparent';
      let color = studentDesign.colors.textDark;
      let border = '1px solid transparent';
      let shadow = 'none';
      let fontWeight = '500';

      if (isPadding) {
        return { visibility: 'hidden' };
      }

      if (hasLog) {
        bg = isLogged ? '#DCFCE7' : '#EFF6FF'; // green for logged, blue for active
        color = isLogged ? '#15803D' : studentDesign.colors.primary;
        border = `1.5px solid ${isLogged ? '#BBF7D0' : '#BFDBFE'}`;
        fontWeight = '700';
      } else if (isScheduled) {
        border = `1.5px dashed #CBD5E1`;
        color = '#475569';
      }

      if (isToday) {
        border = `2.5px solid ${studentDesign.colors.primary}`;
        fontWeight = '800';
        shadow = `0 4px 12px ${studentDesign.colors.primary}20`;
        if (!hasLog) {
          color = studentDesign.colors.primary;
        }
      }

      return {
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight,
        backgroundColor: bg,
        color,
        border,
        boxShadow: shadow,
        cursor: 'default',
        position: 'relative',
        transition: 'all 0.2s'
      };
    },
    todayDot: {
      width: '5px',
      height: '5px',
      borderRadius: '50%',
      backgroundColor: studentDesign.colors.primary,
      position: 'absolute',
      bottom: '3px'
    },
    legend: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '11.5px',
      color: studentDesign.colors.textMuted,
      borderTop: '1px solid #F1F5F9',
      paddingTop: '12px',
      marginTop: 'auto',
      flexWrap: 'wrap',
      gap: '8px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    legendDot: (color, border = 'none') => ({
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: color,
      border
    })
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

      {/* Top Section: Dashboard side-by-side Grid */}
      <div style={styles.dashboardGrid}>
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

          <div style={{ zIndex: 2, display: 'flex', gap: '12px', marginTop: 'auto' }}>
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

        {/* Attendance Calendar Card */}
        <div style={styles.calendarCard}>
          <div style={styles.calendarHeader}>
            <h3 style={styles.calendarTitle}>
              {formatMonthYear(currentViewDate)}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handlePrevMonth} style={styles.navBtn} className="hover:bg-slate-100">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={handleNextMonth} style={styles.navBtn} className="hover:bg-slate-100">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={styles.calendarGrid}>
            {/* Weekday headers */}
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={styles.weekHeader}>
                {day}
              </div>
            ))}

            {/* Days in Month */}
            {getViewedMonthDays().map((day, idx) => {
              if (day.isPadding) {
                return <div key={`pad-${idx}`} style={styles.dayCell(false, false, false, false, true)} />;
              }

              const todayCAStr = new Date().toLocaleDateString('en-CA');
              const isToday = day.dateStr === todayCAStr;
              
              // Find log for this date
              const dayLog = logs.find(l => l.log_date === day.dateStr);
              const hasLog = !!dayLog;
              const isLogged = dayLog?.status === 'LOGGED' || dayLog?.status === 'DEDUCTED';

              // Check if scheduled shift workday
              const dayDateObj = new Date(day.dateStr + 'T00:00:00');
              const dayOfWeekName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dayDateObj);
              const isScheduled = user?.user_metadata?.work_days?.includes(dayOfWeekName);

              return (
                <div 
                  key={day.dateStr} 
                  style={styles.dayCell(isToday, hasLog, isLogged, isScheduled, false)}
                  title={isToday ? 'Today' : (hasLog ? `Logged OJT Shift: ${dayLog.hours_rendered} hrs` : (isScheduled ? 'Scheduled OJT Shift' : ''))}
                >
                  {day.dayNum}
                  {isToday && <div style={styles.todayDot} />}
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={styles.legendDot(studentDesign.colors.primary, 'none')} />
              <span>Today</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendDot('#DCFCE7', '1px solid #BBF7D0')} />
              <span style={{ color: '#15803D', fontWeight: 650 }}>Logged</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendDot('transparent', '1.5px dashed #CBD5E1')} />
              <span>Scheduled Shift</span>
            </div>
          </div>
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
            {logs.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Filter size={14} style={{ position: 'absolute', left: '10px', color: studentDesign.colors.textMuted, pointerEvents: 'none' }} />
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    style={{
                      padding: '8px 28px 8px 32px',
                      borderRadius: '10px',
                      border: `1px solid ${studentDesign.colors.border}`,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: studentDesign.colors.textMain,
                      backgroundColor: '#fff',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = studentDesign.colors.primary}
                    onMouseLeave={e => e.currentTarget.style.borderColor = studentDesign.colors.border}
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map(m => {
                      const [year, month] = m.split('-');
                      const date = new Date(year, parseInt(month) - 1, 1);
                      return (
                        <option key={m} value={m}>
                          {date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', color: studentDesign.colors.textMuted, pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpDown size={14} style={{ position: 'absolute', left: '10px', color: studentDesign.colors.textMuted, pointerEvents: 'none' }} />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{
                      padding: '8px 28px 8px 32px',
                      borderRadius: '10px',
                      border: `1px solid ${studentDesign.colors.border}`,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: studentDesign.colors.textMain,
                      backgroundColor: '#fff',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = studentDesign.colors.primary}
                    onMouseLeave={e => e.currentTarget.style.borderColor = studentDesign.colors.border}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', color: studentDesign.colors.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>
            )}

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
          <>
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
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: studentDesign.colors.textMuted, fontSize: '14px' }}>
                    No logs match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
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
                        {log.status === 'IN_PROGRESS' ? 'In progress' : (log.status === 'DEDUCTED' ? 'Deducted' : 'Logged')}
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
              }))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: `1px solid ${studentDesign.colors.border}` }}>
              <span style={{ fontSize: '13px', color: studentDesign.colors.textMuted }}>
                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredAndSortedLogs.length)} of {filteredAndSortedLogs.length} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${studentDesign.colors.border}`,
                    backgroundColor: currentPage === 1 ? '#F8FAFC' : '#fff',
                    color: currentPage === 1 ? '#94A3B8' : studentDesign.colors.textMain,
                    fontSize: '13px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${studentDesign.colors.border}`,
                    backgroundColor: currentPage === totalPages ? '#F8FAFC' : '#fff',
                    color: currentPage === totalPages ? '#94A3B8' : studentDesign.colors.textMain,
                    fontSize: '13px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          </>
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
              {/* Log Date Range covered by this report */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                    LOGS START DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={reportStartDate}
                    onChange={e => setReportStartDate(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#1E293B',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                    LOGS END DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={reportEndDate}
                    onChange={e => setReportEndDate(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#1E293B',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

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
                <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                  * Duplicate uploads (same file name or same date range) are not allowed.
                </span>
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
                    <span>Analyzing document... Please wait...</span>
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
                    Select a signed report sheet above. AI will automatically read your PDF/Image and extract the hours completed.
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
                  disabled={reportUploading || !reportFile || !reportHours || scanningReport}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: (reportUploading || !reportFile || !reportHours || scanningReport)
                      ? '#E2E8F0'
                      : studentDesign.colors.success,
                    color: (reportUploading || !reportFile || !reportHours || scanningReport)
                      ? '#94A3B8'
                      : '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: (reportUploading || !reportFile || !reportHours || scanningReport) ? 'not-allowed' : 'pointer',
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
                onClick={() => {
                  setShowExportModal(false);
                  setExportWeekNo('');
                }}
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
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  backgroundColor: '#F1F5F9',
                  padding: '4px',
                  borderRadius: '12px'
                }}>
                  {['daily', 'weekly'].map(type => (
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

              {/* Week Number Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Week Number (Optional)
                </span>
                <input
                  type="text"
                  placeholder="e.g. Week 1"
                  value={exportWeekNo}
                  onChange={e => setExportWeekNo(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#1E293B',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s'
                  }}
                />
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


              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportModal(false);
                    setExportWeekNo('');
                  }}
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
                    handleExportPDF(exportType, { dailyDate, weeklyStart, weeklyEnd, weekNo: exportWeekNo });
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
