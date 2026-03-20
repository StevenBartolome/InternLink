import React from 'react';

const Applications = () => {
  const applications = [
    { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp Solutions', appliedDate: 'Oct 12, 2026', status: 'Shortlisted', badgeColor: '#10b981' },
    { id: 2, title: 'UX/UI Design Intern', company: 'CreativeMinds', appliedDate: 'Oct 08, 2026', status: 'Under Review', badgeColor: '#3b82f6' },
    { id: 3, title: 'Data Analyst Intern', company: 'BigData Inc.', appliedDate: 'Oct 05, 2026', status: 'Pending', badgeColor: '#f59e0b' },
    { id: 4, title: 'Software Engineering Trainee', company: 'GlobalDev', appliedDate: 'Sep 25, 2026', status: 'Rejected', badgeColor: '#ef4444' },
  ];

  return (
    <div className="applications-tab">
      <div className="table-header">
        <h2>My Applications</h2>
        <p>Track the status of your internship applications in real-time.</p>
      </div>

      <div className="table-container">
        <table className="apps-table">
          <thead>
            <tr>
              <th>Role / Company</th>
              <th>Date Applied</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="app-role-cell">
                    <span className="app-title">{app.title}</span>
                    <span className="app-company">{app.company}</span>
                  </div>
                </td>
                <td>{app.appliedDate}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: `${app.badgeColor}20`, color: app.badgeColor, border: `1px solid ${app.badgeColor}40` }}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <button className="view-details-btn">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx="true">{`
        .applications-tab {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .table-header {
          margin-bottom: 2rem;
        }

        .table-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .table-header p {
          margin: 0.25rem 0 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .apps-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
        }

        .apps-table th {
          padding: 1rem;
          color: var(--text-muted);
          font-weight: 500;
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.85rem;
        }

        .apps-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--bg-secondary);
          vertical-align: middle;
          color: var(--text-dark);
        }

        .app-role-cell {
          display: flex;
          flex-direction: column;
        }

        .app-title {
          font-weight: 600;
          color: var(--text-main);
        }

        .app-company {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .view-details-btn {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background 0.2s;
          box-shadow: var(--shadow-sm);
        }

        .view-details-btn:hover {
          background: var(--bg-secondary);
        }

        @media (max-width: 600px) {
          .apps-table th:nth-child(2), .apps-table td:nth-child(2) {
            display: none;
          }
        }
      `}</style>

    </div>
  );
};

export default Applications;
