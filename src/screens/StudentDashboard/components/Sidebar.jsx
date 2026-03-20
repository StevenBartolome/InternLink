import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'internships', label: 'Browse Internships', icon: '🔍' },
    { id: 'applications', label: 'My Applications', icon: '📝' },
  ];


  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🔗</div>
        <span className="logo-text">InternLink</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>



      <style jsx="true">{`
        .sidebar {
          width: var(--sidebar-width);
          background: #ffffff;
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          box-shadow: var(--shadow-sm);
        }

        .sidebar-logo {
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.25rem;
          background: var(--bg-accent);
          color: var(--primary);
          border-bottom: 1px solid var(--glass-border);
        }

        .logo-icon {
          font-size: 1.5rem;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .nav-item.active {
          background: var(--primary-color);
          color: white;
          box-shadow: var(--shadow-md);
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--glass-border);
        }

        .nav-item.logout {
          width: 100%;
          color: #ef4444;
        }

        .nav-item.logout:hover {
          background: #fef2f2;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            flex-direction: row;
            justify-content: space-between;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
          }
          .sidebar-logo, .sidebar-footer {
            padding: 1rem;
          }
        }
      `}</style>

    </div>
  );
};

export default Sidebar;
