import React from 'react';

const Overview = () => {
  const stats = [
    { title: 'Total Applications', value: 12, icon: '📝', color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { title: 'Shortlisted', value: 3, icon: '🎯', color: 'linear-gradient(135deg, #10b981, #047857)' },
    { title: 'Pending Reviews', value: 7, icon: '⏳', color: 'linear-gradient(135deg, #f59e0b, #b45309)' },
    { title: 'Declined', value: 2, icon: '❌', color: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  ];

  const recentActivities = [
    { id: 1, title: 'Applied to Software Engineer Intern', company: 'TechCorp', date: '2 hours ago', status: 'Applied' },
    { id: 2, title: 'Interview Scheduled', company: 'DataSoft', date: 'Yesterday', status: 'Action' },
    { id: 3, title: 'Resume Viewed', company: 'InnoSystems', date: '2 days ago', status: 'Update' },
  ];

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ background: stat.color }}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="grid-card activities">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="act-dot"></div>
                <div className="act-details">
                  <span className="act-title">{act.title}</span>
                  <span className="act-company">{act.company}</span>
                </div>
                <span className="act-date">{act.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-card announcements">
          <h2>Quick Tips</h2>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-number">01</span>
              <p>Complete your profile description with strong verbs to attract top recruiters.</p>
            </div>
            <div className="tip-item">
              <span className="tip-number">02</span>
              <p>Search for keywords like "Frontend", "Data Analyst", or "Design".</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .overview-tab {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: var(--bg-secondary);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          box-shadow: var(--shadow-sm);
          color: white;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-value {
          margin: 0.25rem 0 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .grid-card {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .grid-card h2 {
          margin: 0 0 1.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .act-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-color);
          box-shadow: 0 0 8px var(--primary-color);
        }

        .act-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .act-title {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .act-company {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .act-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .tip-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .tip-number {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--primary-color);
          background: var(--bg-accent);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .tip-item p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-dark);
        }
      `}</style>

    </div>
  );
};

export default Overview;
