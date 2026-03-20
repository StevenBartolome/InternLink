import React, { useState } from 'react';

const ProfileDashboard = () => {
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Node.js', 'Figma', 'Python']);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="profile-tab">
      <div className="profile-grid">
        {/* Left Column - Info & Resume */}
        <div className="profile-left">
          <div className="profile-card basic-info">
            <div className="avatar-large">JD</div>
            <h2>Juan Dela Cruz</h2>
            <p className="subtitle">BS Computer Science Student</p>
            <p className="bio">Passionate software engineer building modern web applications. Looking for summer internship opportunities.</p>
            <button className="edit-btn">Edit Profile</button>
          </div>

          <div className="profile-card documents">
            <h3>Documents</h3>
            <div className="upload-box">
              <span className="upload-icon">📄</span>
              <p>Upload Resume / Portfolio</p>
              <span className="file-types">PDF, DOCX up to 5MB</span>
              <input type="file" id="resumeUpload" style={{ display: 'none' }} />
              <button className="upload-btn" onClick={() => document.getElementById('resumeUpload').click()}>
                Select File
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Skills */}
        <div className="profile-right">
          <div className="profile-card skills-section">
            <h3>My Skills</h3>
            <p className="section-desc">Add or update your technical skills to improve matches.</p>
            
            <form onSubmit={handleAddSkill} className="add-skill-form">
              <input 
                type="text" 
                placeholder="Add a skill (e.g., Vue.js)" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="skill-input"
              />
              <button type="submit" className="add-btn">Add</button>
            </form>

            <div className="skills-list">
              {skills.map((skill, idx) => (
                <div key={idx} className="skill-item">
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(skill)} className="remove-skill">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .profile-tab {
          display: flex;
          flex-direction: column;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-card {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .basic-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          box-shadow: var(--shadow-md);
        }

        .basic-info h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-main);
        }

        .subtitle {
          margin: 0.25rem 0 0.75rem;
          color: var(--primary-color);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .bio {
          font-size: 0.9rem;
          color: var(--text-dark);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .edit-btn {
          background: #ffffff;
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
          transition: background 0.2s;
        }

        .edit-btn:hover {
          background: var(--bg-secondary);
        }

        .upload-box {
          border: 2px dashed var(--glass-border);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-secondary);
        }

        .upload-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .file-types {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .upload-btn {
          margin-top: 1rem;
          background: var(--primary-color);
          border: none;
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .section-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .add-skill-form {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .skill-input {
          flex: 1;
          background: #ffffff;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
          box-shadow: var(--shadow-sm);
        }

        .add-btn {
          background: var(--primary-color);
          border: none;
          color: white;
          padding: 0 1rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skill-item {
          background: var(--bg-accent);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: var(--primary-color);
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .remove-skill {
          background: transparent;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          font-weight: bold;
        }
      `}</style>

    </div>
  );
};

export default ProfileDashboard;
