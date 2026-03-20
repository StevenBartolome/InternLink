import React, { useState } from 'react';
import { progressState } from '../data/mockData';
import { Calendar, User, Clock, CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import './InternshipProgressPage.css';

export default function InternshipProgressPage() {
  const [tasks, setTasks] = useState([...progressState.tasks]);

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const nextStatus = task.status === 'Done' ? 'In Progress' : task.status === 'In Progress' ? 'Not Started' : 'Done';
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Done': return <CheckCircle2 size={18} className="task-icon done" />;
      case 'In Progress': return <Circle size={18} className="task-icon in-progress" />;
      default: return <Circle size={18} className="task-icon not-started" style={{opacity: 0.5}} />;
    }
  };

  const hoursPercent = Math.round((progressState.hoursCompleted / progressState.hoursTotal) * 100);

  return (
    <div className="progress-container">
      <div className="page-header">
        <h1>Internship Progress</h1>
        <p>Monitor your hours and task logs for your active placement.</p>
      </div>

      {/* Progress Dashboard Header */}
      <div className="progress-header-grid">
        <div className="progress-card active-company-card">
          <span className="live-tag">Active Placement</span>
          <h2>{progressState.company}</h2>
          <div className="supervisor-info">
            <User size={16} />
            <span>Supervisor: <strong>{progressState.supervisor}</strong></span>
          </div>
          <div className="timeline-info">
            <Calendar size={16} />
            <span>{progressState.startDate} - {progressState.endDate}</span>
          </div>
        </div>

        <div className="progress-card hours-tracker-card">
          <div className="hours-stats">
            <div>
              <label>Hours Completed</label>
              <h3>{progressState.hoursCompleted} hr<span>/ {progressState.hoursTotal} hr</span></h3>
            </div>
            <Clock size={32} className="hours-icon" />
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${hoursPercent}%` }}></div>
            </div>
            <span className="percent-text">{hoursPercent}% Completed</span>
          </div>
        </div>
      </div>

      <div className="logs-grid">
        {/* Task List (Left) */}
        <div className="progress-card tasks-card">
          <h3>Daily Tasks & Activities</h3>
          <p className="sub-text">Click an icon to toggle status (Cycle: Done → In Progress → Not Started)</p>
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item" onClick={() => toggleTaskStatus(task.id)}>
                {getStatusIcon(task.status)}
                <span className={`task-title ${task.status === 'Done' ? 'crossed' : ''}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Logs (Right) */}
        <div className="progress-card logs-card">
          <h3>Weekly Logs History</h3>
          <div className="table-responsive">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Hours</th>
                  <th>Core Activities</th>
                  <th>Supervisor</th>
                </tr>
              </thead>
              <tbody>
                {progressState.weeklyLogs.map((log, i) => (
                  <tr key={i}>
                    <td>Week {log.week}</td>
                    <td>{log.hours}h</td>
                    <td className="logs-activities">{log.activities}</td>
                    <td>
                      <span className={`sign-badge ${log.supervisorSign.toLowerCase()}`}>
                        {log.supervisorSign}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
