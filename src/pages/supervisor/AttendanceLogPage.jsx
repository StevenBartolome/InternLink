// src/pages/supervisor/AttendanceLogPage/AttendanceLogPage.jsx
import React, { useState } from 'react';
import { Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { internsData } from '../../data/supervisorMockData';
import StatusBadge from '../../components/supervisor/StatusBadge';
import '../../assets/css/supervisor/AttendanceLogPage.css';

const AttendanceLogPage = () => {
  const [selectedInternId, setSelectedInternId] = useState(internsData[0].id);
  const [isTimedIn, setIsTimedIn] = useState(false);
  const [todayLog, setTodayLog] = useState({ timeIn: '---', timeOut: '---', totalHours: 0 });
  const [manualLog, setManualLog] = useState({ date: '', timeIn: '', timeOut: '' });

  const selectedIntern = internsData.find(i => i.id === parseInt(selectedInternId));

  const handleTimeToggle = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (!isTimedIn) {
      setTodayLog({ ...todayLog, timeIn: timeStr });
      setIsTimedIn(true);
    } else {
      setTodayLog({ ...todayLog, timeOut: timeStr, totalHours: 8 }); // Mock 8 hours for demo
      setIsTimedIn(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    alert(`Manual log saved for ${selectedIntern.name} on ${manualLog.date}`);
    setManualLog({ date: '', timeIn: '', timeOut: '' });
  };

  return (
    <div className="supervisor-page-container">
      {/* Top Selector Container */}
      <div className="card-supervisor selector-card">
        <div className="selector-group">
          <label htmlFor="intern-select">Select Intern:</label>
          <select 
            id="intern-select" 
            value={selectedInternId} 
            onChange={(e) => setSelectedInternId(e.target.value)}
            className="styled-select"
          >
            {internsData.map(intern => (
              <option key={intern.id} value={intern.id}>{intern.name} ({intern.school})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="attendance-grid">
        {/* Left: Time Clock & Manual Entry */}
        <div className="attendance-left">
          {/* Time Clock Card */}
          <div className="card-supervisor clock-card">
            <h3 className="section-title"><Clock size={18} /> Today's Tracker</h3>
            <div className="clock-display">
              <span className="current-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            
            <div className="log-summary">
              <div className="log-box">
                <span className="log-label">Time In</span>
                <span className="log-time">{todayLog.timeIn}</span>
              </div>
              <div className="log-box">
                <span className="log-label">Time Out</span>
                <span className="log-time">{todayLog.timeOut}</span>
              </div>
            </div>

            <button 
              className={`toggle-btn ${isTimedIn ? 'timed-in' : 'timed-out'}`}
              onClick={handleTimeToggle}
            >
              {isTimedIn ? 'Time Out' : 'Time In'}
            </button>
          </div>

          {/* Manual Entry Form */}
          <div className="card-supervisor manual-log-card">
            <h3 className="section-title">Manual Log Correction</h3>
            <form onSubmit={handleManualSubmit} className="manual-form">
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={manualLog.date} 
                  onChange={(e) => setManualLog({ ...manualLog, date: e.target.value })}
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time In</label>
                  <input 
                    type="time" 
                    value={manualLog.timeIn} 
                    onChange={(e) => setManualLog({ ...manualLog, timeIn: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Time Out</label>
                  <input 
                    type="time" 
                    value={manualLog.timeOut} 
                    onChange={(e) => setManualLog({ ...manualLog, timeOut: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn primary">Save Correction</button>
            </form>
          </div>
        </div>

        {/* Right: Monthly Log Table */}
        <div className="attendance-right">
          <div className="card-supervisor log-table-card">
            <div className="section-header-row">
              <h3 className="section-title"><Calendar size={18} /> Monthly Logs</h3>
              <div className="rendered-total">
                <span className="total-label">Total Rendered:</span>
                <span className="total-val">{selectedIntern.renderedHours} hrs</span>
              </div>
            </div>
            
            <div className="table-wrapper">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedIntern.attendanceLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td>{log.timeIn}</td>
                      <td>{log.timeOut}</td>
                      <td>{log.totalHours > 0 ? `${log.totalHours} hr` : '---'}</td>
                      <td><StatusBadge status={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogPage;
