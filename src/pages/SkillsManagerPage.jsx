import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentProfile } from '../data/mockData';
import { Plus, X, Award, PlusCircle, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import './SkillsManagerPage.css';

export default function SkillsManagerPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([...studentProfile.skills]);
  const [certs, setCerts] = useState([...studentProfile.certifications]);
  
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState({ title: '', issuer: '', date: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Skills Handlers
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Certifications Handlers
  const handleAddCert = (e) => {
    e.preventDefault();
    if (newCert.title && newCert.issuer && newCert.date) {
      setCerts([...certs, { id: Date.now(), ...newCert }]);
      setNewCert({ title: '', issuer: '', date: '' });
    }
  };

  const handleRemoveCert = (id) => {
    setCerts(certs.filter(cert => cert.id !== id));
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="skills-manager-container">
      {showToast && (
        <div className="toast success">
          <CheckCircle size={20} />
          <span>Skills & Certifications saved successfully!</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-actions">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={16} /> Back to Profile
          </button>
          <button className="save-changes-btn" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <h1>Skills & Certifications Manager</h1>
        <p>Manage your technical profile to match internship requirements.</p>
      </div>

      <div className="skills-grid">
        {/* Left: Skills Manager */}
        <div className="manager-card">
          <div className="card-header">
            <h3>My Core Skills</h3>
            <span className="count-badge">{skills.length} Skills</span>
          </div>

          <form onSubmit={handleAddSkill} className="add-item-form">
            <input 
              type="text" 
              placeholder="Add a new skill (e.g. Python, SQL)" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button type="submit" className="add-btn">
              <Plus size={20} /> Add
            </button>
          </form>

          <div className="skills-chip-container">
            {skills.map((skill, index) => (
              <div key={index} className="interactive-skill-chip">
                <span>{skill}</span>
                <button 
                  type="button" 
                  className="remove-skill-btn"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Certifications Manager */}
        <div className="manager-card">
          <div className="card-header">
            <h3>Certifications</h3>
            <span className="count-badge">{certs.length} Earned</span>
          </div>

          <form onSubmit={handleAddCert} className="add-cert-form">
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Certification Title" 
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input 
                type="text" 
                placeholder="Issuer" 
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                required
              />
              <input 
                type="text" 
                placeholder="Date (e.g., Jan 2026)" 
                value={newCert.date}
                onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="add-cert-btn">
              <PlusCircle size={18} /> Add Certification
            </button>
          </form>

          <div className="certifications-list">
            {certs.length === 0 ? (
              <p className="empty-state">No certifications added yet.</p>
            ) : (
              certs.map((cert) => (
                <div key={cert.id} className="interactive-cert-item">
                  <div className="cert-left">
                    <div className="cert-icon">
                      <Award size={22} className="icon-award" />
                    </div>
                    <div className="cert-info">
                      <h5>{cert.title}</h5>
                      <span className="issuer">{cert.issuer}</span>
                      <span className="date">{cert.date}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="delete-cert-btn"
                    onClick={() => handleRemoveCert(cert.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
