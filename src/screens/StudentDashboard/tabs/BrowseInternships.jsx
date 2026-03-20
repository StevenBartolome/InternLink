import React, { useState } from 'react';

const BrowseInternships = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const internships = [
    { id: 1, title: 'Frontend Developer Intern', company: 'TechCorp Solutions', location: 'Remote', stipend: '$500/mo', duration: '3 Months', tags: ['React', 'CSS', 'JavaScript'] },
    { id: 2, title: 'UX/UI Design Intern', company: 'CreativeMinds', location: 'Manila, PH', stipend: '$400/mo', duration: '6 Months', tags: ['Figma', 'Prototyping'] },
    { id: 3, title: 'Data Analyst Intern', company: 'BigData Inc.', location: 'Hybrid', stipend: '$600/mo', duration: '4 Months', tags: ['Python', 'SQL', 'Tableau'] },
    { id: 4, title: 'Software Engineering Trainee', company: 'GlobalDev', location: 'Remote', stipend: 'Unpaid (Academic Credit)', duration: '3 Months', tags: ['Java', 'Spring Boot'] },
  ];

  const filteredInternships = internships.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="browse-tab">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search internships, companies, or skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filter-tags">
        <button className="filter-tag active">All</button>
        <button className="filter-tag">Remote</button>
        <button className="filter-tag">On-site</button>
        <button className="filter-tag">Paid</button>
      </div>

      <div className="internships-grid">
        {filteredInternships.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <div className="company-logo">{job.company[0]}</div>
              <div>
                <h3>{job.title}</h3>
                <p className="company-name">{job.company}</p>
              </div>
            </div>
            
            <div className="job-details">
              <div className="detail-item">📍 {job.location}</div>
              <div className="detail-item">💰 {job.stipend}</div>
              <div className="detail-item">⏳ {job.duration}</div>
            </div>

            <div className="job-tags">
              {job.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>

            <button className="apply-btn">Apply Now</button>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .browse-tab {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-bar-container {
          width: 100%;
          max-width: 600px;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          gap: 0.75rem;
          transition: border-color 0.2s;
          box-shadow: var(--shadow-sm);
        }

        .search-input-wrapper:focus-within {
          border-color: var(--primary-color);
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .filter-tags {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
        }

        .filter-tag {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 0.5rem 1.25rem;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
        }

        .filter-tag:hover {
          background: var(--bg-secondary);
          color: var(--text-main);
        }

        .filter-tag.active {
          background: var(--bg-accent);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .internships-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .job-card {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: transform 0.3s ease, border-color 0.3s ease;
          box-shadow: var(--shadow-sm);
        }

        .job-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary-color);
        }

        .job-header {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .company-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .job-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .company-name {
          margin: 0.25rem 0 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .job-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-dark);
        }

        .job-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          background: var(--bg-accent);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--primary-color);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .apply-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary-color);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: auto;
        }

        .apply-btn:hover {
          background: var(--primary-hover);
        }
      `}</style>

    </div>
  );
};

export default BrowseInternships;
