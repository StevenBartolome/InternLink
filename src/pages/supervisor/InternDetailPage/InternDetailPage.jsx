// src/pages/supervisor/InternDetailPage/InternDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, GraduationCap, Calendar, 
  CheckSquare, FileSignature, Clock 
} from 'lucide-react';
import { internsData } from '../../../data/supervisorMockData';
import StatusBadge from '../../../components/supervisor/StatusBadge';
import ProgressBar from '../../../components/supervisor/ProgressBar';
import '../../../assets/css/supervisor/InternDetailPage.css';

const InternDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const intern = internsData.find(i => i.id === parseInt(id));

  if (!intern) {
    return (
      <div className="supervisor-page-container flex-center">
        <div className="error-view">
          <h2>Intern Not Found</h2>
          <button className="back-btn" onClick={() => navigate('/supervisor/interns')}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-page-container">
      {/* Header with Back Button */}
      <div className="detail-header">
        <button className="back-link-btn" onClick={() => navigate('/supervisor/interns')}>
          <ArrowLeft size={18} /> Back to Interns
        </button>
      </div>

      <div className="detail-grid">
        {/* Left Column: Profile & Hours */}
        <div className="detail-left">
          {/* Profile Card */}
          <div className="profile-card card-supervisor">
            <div className="profile-header">
              <img src={intern.photo} alt={intern.name} className="profile-photo" />
              <div className="profile-title">
                <h2>{intern.name}</h2>
                <span className="profile-course">{intern.course}</span>
              </div>
              <div className="profile-status">
                <StatusBadge status={intern.todayStatus} />
              </div>
            </div>
            
            <div className="profile-body">
              <div className="info-row">
                <GraduationCap size={18} />
                <div className="info-content">
                  <span className="info-label">School</span>
                  <span className="info-value">{intern.school}</span>
                </div>
              </div>
              <div className="info-row">
                <Phone size={18} />
                <div className="info-content">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{intern.contact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Progress Card */}
          <div className="hours-card card-supervisor">
            <h3 className="section-title">OJT Hours Summary</h3>
            <div className="large-progress">
              <ProgressBar rendered={intern.renderedHours} required={intern.requiredHours} />
            </div>
            <div className="hours-stats">
              <div className="hours-stat-box">
                <span className="stat-num">{intern.requiredHours}</span>
                <span className="stat-lbl">Required</span>
              </div>
              <div className="hours-stat-box primary-bg">
                <span className="stat-num">{intern.renderedHours}</span>
                <span className="stat-lbl">Rendered</span>
              </div>
              <div className="hours-stat-box warning-bg">
                <span className="stat-num">{intern.requiredHours - intern.renderedHours}</span>
                <span className="stat-lbl">Remaining</span>
              </div>
            </div>
          </div>

          {/* Evaluation Status Card */}
          <div className="evaluation-status-card card-supervisor">
            <h3 className="section-title">Evaluation Status</h3>
            <div className="eval-status-row">
              <StatusBadge status={intern.evaluationStatus} />
              {intern.evaluationStatus === 'Evaluated' && (
                <div className="eval-score">
                  <span>Score:</span>
                  <span className="score-val">{intern.evaluation?.overallScore}</span>
                </div>
              )}
            </div>
            <div className="eval-actions">
              {intern.evaluationStatus === 'Evaluated' ? (
                <button className="action-link-btn read-only">
                  View Evaluation (Read-only)
                </button>
              ) : (
                <button className="action-link-btn highlight" onClick={() => navigate('/supervisor/evaluation')}>
                  <FileSignature size={16} /> Evaluate Intern Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance & Tasks */}
        <div className="detail-right">
          {/* Recent Attendance */}
          <div className="attendance-section card-supervisor">
            <div className="section-header-row">
              <h3 className="section-title"><Clock size={18} /> Recent Attendance Log</h3>
              <button className="text-btn" onClick={() => navigate('/supervisor/attendance')}>
                Manage
              </button>
            </div>
            <div className="table-wrapper">
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {intern.attendanceLogs.slice(0, 4).map((log, idx) => (
                    <tr key={idx}>
                      <td>{new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td>{log.timeIn}</td>
                      <td>{log.timeOut}</td>
                      <td>{log.totalHours} hr</td>
                      <td><StatusBadge status={log.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Tasks */}
          <div className="tasks-section card-supervisor">
            <div className="section-header-row">
              <h3 className="section-title"><CheckSquare size={18} /> Assigned Tasks</h3>
              <button className="text-btn" onClick={() => navigate('/supervisor/tasks')}>
                Manage
              </button>
            </div>
            <div className="task-list">
              {intern.tasks.map((task) => (
                <div key={task.id} className="task-detail-item">
                  <div className="task-main">
                    <span className="task-name">{task.name}</span>
                    <span className="task-desc">{task.description}</span>
                  </div>
                  <div className="task-meta">
                    <span className="task-due">Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDetailPage;
