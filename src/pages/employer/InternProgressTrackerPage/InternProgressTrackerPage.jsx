import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';
import { activeInterns } from '../../../data/employerMockData';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import '../../../assets/css/employer/InternProgressTrackerPage.css';

const InternProgressTrackerPage = () => {
  const [expandedInternId, setExpandedInternId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedInternId(expandedInternId === id ? null : id);
  };

  return (
    <div className="tracker-container">
      <div className="tracker-header">
        <h1>Intern Progress Tracker</h1>
        <p className="subtitle">Monitor hours and tasks of your active interns.</p>
      </div>

      <div className="intern-list">
        {activeInterns.map(intern => {
          const isExpanded = expandedInternId === intern.id;
          const percentage = (intern.hoursCompleted / intern.totalHours) * 100;

          return (
            <div key={intern.id} className={`intern-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="card-summary" onClick={() => toggleExpand(intern.id)}>
                <div className="intern-main-info">
                  <div className="avatar-mini">
                    {intern.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4>{intern.studentName}</h4>
                    <p className="sub-text">{intern.position}</p>
                  </div>
                </div>

                <div className="intern-stats">
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>{intern.startDate} - {intern.endDate}</span>
                  </div>
                  <div className="stat-item">
                    <Clock size={16} />
                    <span>{intern.hoursCompleted} / {intern.totalHours} hrs</span>
                  </div>
                </div>

                <div className="progress-section">
                  <ProgressBar percentage={percentage} />
                  <span className="percentage-text">{Math.round(percentage)}%</span>
                </div>

                <button className="btn-expand">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {isExpanded && (
                <div className="card-details">
                  <div className="details-grid">
                    {/* Tasks */}
                    <div className="details-section">
                      <h5>Task List</h5>
                      <div className="task-list">
                        {intern.tasks.map(task => (
                          <div key={task.id} className="task-item">
                            {task.status === 'Completed' ? (
                              <CheckCircle2 size={18} className="text-success" />
                            ) : (
                              <Circle size={18} className="text-muted" />
                            )}
                            <span className={task.status === 'Completed' ? 'completed' : ''}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Logs */}
                    <div className="details-section">
                      <h5>Weekly Logs</h5>
                      <div className="log-list">
                        {intern.weeklyLogs.map((log, index) => (
                          <div key={index} className="log-item">
                            <div className="log-header">
                              <span className="font-semibold">Week {log.week}</span>
                              <span className="hours-badge">{log.hours} hrs</span>
                            </div>
                            <p className="log-text">{log.log}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InternProgressTrackerPage;
