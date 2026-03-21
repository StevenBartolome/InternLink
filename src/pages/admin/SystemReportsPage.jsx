// src/pages/admin/SystemReportsPage.jsx
import React, { useState } from 'react';
import { BarChart, PieChart, TrendingUp, Award, Users, CheckCircle, Download } from 'lucide-react';
import { reportsData } from '../../data/adminMockData';
import StatCard from '../../components/StatCard';
import '../../assets/css/admin/SystemReportsPage.css';

const SystemReportsPage = () => {
  const [term, setTerm] = useState(reportsData.academicTerm);

  const { 
    totalEnrolled, totalPlaced, totalCompleted, avgFinalGrade, 
    placementRate, completionRate, courseBreakdown, gradeDistribution, topEmployers 
  } = reportsData;

  return (
    <div className="reports-page">
      {/* Page Header with Term Filter */}
      <div className="reports-header-control">
        <div className="term-selector">
          <label>Academic Term:</label>
          <select value={term} onChange={e => setTerm(e.target.value)}>
            <option value="1st Sem 2026–2027">1st Sem 2026–2027</option>
            <option value="2nd Sem 2025–2026">2nd Sem 2025–2026</option>
          </select>
        </div>
        <button className="export-btn">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <StatCard title="Total Enrolled for OJT" value={totalEnrolled} icon={Users} color="primary" />
        <StatCard title="Total Placed" value={totalPlaced} icon={CheckCircle} color="success" />
        <StatCard title="Total Completed" value={totalCompleted} icon={Award} color="purple" />
        <StatCard title="Average Final Grade" value={avgFinalGrade} icon={TrendingUp} color="warning" />
      </div>

      {/* Analytics Grid */}
      <div className="analytics-grid">
        {/* Placement & Completion Rate Rates */}
        <div className="analytics-card rate-card">
          <div className="card-header">
            <h3>Key Performance Indices</h3>
          </div>
          <div className="card-content rate-content">
            <div className="progress-circle-item">
              <div className="percentage-circle placement">
                <span className="pct-val">{placementRate}%</span>
                <span className="pct-label">Placement Rate</span>
              </div>
            </div>
            <div className="progress-circle-item">
              <div className="percentage-circle completion">
                <span className="pct-val">{completionRate}%</span>
                <span className="pct-label">Completion Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="analytics-card grade-dist">
          <div className="card-header">
            <h3>Grade Distribution</h3>
          </div>
          <div className="card-content">
            <div className="bar-list">
              {Object.entries(gradeDistribution).map(([key, data]) => (
                <div key={key} className="bar-item">
                  <div className="bar-label">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="bar-val">{data.count} ({data.pct}%)</span>
                  </div>
                  <div className="bar-track">
                    <div className={`bar-fill ${key}`} style={{ width: `${data.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-grid secondary-grid">
        {/* Course Breakdown */}
        <div className="analytics-card">
          <div className="card-header">
            <h3>Placement by Course</h3>
          </div>
          <div className="card-content">
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students Enrolled</th>
                    <th>Students Placed</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {courseBreakdown.map((row, index) => (
                    <tr key={index}>
                      <td className="text-bold">{row.course}</td>
                      <td>{row.enrolled}</td>
                      <td>{row.placed}</td>
                      <td>
                        <div className="progress-bar">
                          <div className="bar-fill" style={{ width: `${(row.placed / row.enrolled) * 100}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Employers */}
        <div className="analytics-card">
          <div className="card-header">
            <h3>Top Employer Partners</h3>
          </div>
          <div className="card-content">
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Interns Accepted</th>
                    <th>Avg Evaluation</th>
                    <th>Completion %</th>
                  </tr>
                </thead>
                <tbody>
                  {topEmployers.map((emp, index) => (
                    <tr key={index}>
                      <td className="text-bold">{emp.company}</td>
                      <td>{emp.interns}</td>
                      <td>⭐ {emp.score}</td>
                      <td>{emp.rate}%</td>
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

export default SystemReportsPage;
