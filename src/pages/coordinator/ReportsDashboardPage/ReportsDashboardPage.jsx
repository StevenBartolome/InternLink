import React, { useState } from 'react';
import { BarChart2, Download, TrendingUp, Users, Award, BookOpen } from 'lucide-react';
import ProgressBar from '../../../components/coordinator/ProgressBar';
import { mockReportsData } from '../../../data/coordinatorMockData';
import '../../../assets/css/coordinator/ReportsDashboardPage.css';

const ReportsDashboardPage = () => {
  const [term, setTerm] = useState('1st Sem 2024-2025');
  const data = mockReportsData;

  const handleExport = () => {
    alert('Exporting Report... (UI functionality only)');
  };

  return (
    <div className="reports-dashboard-page">
      {/* Header with Filters */}
      <div className="page-header-actions">
        <div className="filter-item">
          <label>Academic Term:</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="1st Sem 2024-2025">1st Sem 2024-2025</option>
            <option value="2nd Sem 2024-2025">2nd Sem 2024-2025</option>
            <option value="Summer 2025">Summer 2025</option>
          </select>
        </div>
        <button className="coordinator-btn coordinator-btn-primary" onClick={handleExport}>
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Summary Stats cards */}
      <div className="reports-stats-grid">
        <div className="report-stat-card coordinator-card">
          <Users size={24} className="stat-icon text-primary" />
          <div>
            <span className="stat-label">Total Enrolled</span>
            <h3 className="stat-value">{data.summary.totalEnrolled}</h3>
          </div>
        </div>
        <div className="report-stat-card coordinator-card">
          <TrendingUp size={24} className="stat-icon text-success" />
          <div>
            <span className="stat-label">Total Placed</span>
            <h3 className="stat-value">{data.summary.totalPlaced}</h3>
          </div>
        </div>
        <div className="report-stat-card coordinator-card">
          <Award size={24} className="stat-icon text-info" />
          <div>
            <span className="stat-label">Total Completed</span>
            <h3 className="stat-value">{data.summary.totalCompleted}</h3>
          </div>
        </div>
        <div className="report-stat-card coordinator-card">
          <BookOpen size={24} className="stat-icon text-warning" />
          <div>
            <span className="stat-label">Avg Final Grade</span>
            <h3 className="stat-value">{data.summary.averageGrade}</h3>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        {/* Placement Rate Card */}
        <div className="coordinator-card">
          <div className="card-header">
            <h4>Placement Rate</h4>
            <span className="large-percentage">{data.placementRate.overall}%</span>
          </div>
          <div className="breakdown-list">
            <h5>Breakdown by Course</h5>
            {data.placementRate.breakdown.map((item, index) => (
              <div key={index} className="breakdown-item">
                <div className="breakdown-info">
                  <span>{item.course}</span>
                  <span>{item.placed}/{item.total} Students</span>
                </div>
                <ProgressBar value={item.rate} max={100} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="coordinator-card">
          <div className="card-header">
            <h4>Completion Rate</h4>
            <span className="large-percentage">{data.completionRate.overall}%</span>
          </div>
          <p className="card-description">Percentage of students who have completed all required internship hours.</p>
          <ProgressBar value={data.completionRate.overall} max={100} size="lg" />
        </div>
      </div>

      <div className="reports-grid">
        {/* Grade Distribution */}
        <div className="coordinator-card">
          <div className="card-header">
            <h4>Grade Distribution</h4>
          </div>
          <div className="coordinator-table-container">
            <table className="coordinator-table">
              <thead>
                <tr>
                  <th>Grade Range</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.gradeDistribution.map((item, index) => (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td><strong>{item.count}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Employer Partners */}
        <div className="coordinator-card">
          <div className="card-header">
            <h4>Top Employer Partners</h4>
          </div>
          <div className="coordinator-table-container">
            <table className="coordinator-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Interns</th>
                  <th>Avg Eval</th>
                </tr>
              </thead>
              <tbody>
                {data.topEmployers.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.company}</strong></td>
                    <td>{item.interns}</td>
                    <td><span className="rating-badge">{item.avgEvaluation}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboardPage;
