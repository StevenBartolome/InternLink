import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentProfile } from '../../data/mockData';
import { UploadCloud, FileText, Trash2, Link, Plus, Globe, ArrowLeft, CheckCircle } from 'lucide-react';
import '../../assets/css/students/ResumeUploadPage.css';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([...studentProfile.resumeFiles]);
  const [links, setLinks] = useState([...studentProfile.portfolioLinks]);
  const [newLink, setNewLink] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  // Resume deletion (UI only)
  const handleRemoveResume = (id) => {
    setResumes(resumes.filter(file => file.id !== id));
  };

  // Link Handlers
  const handleAddLink = (e) => {
    e.preventDefault();
    if (newLink.trim()) {
      let formattedLink = newLink.trim();
      if (!formattedLink.startsWith('http')) {
        formattedLink = 'https://' + formattedLink;
      }
      setLinks([...links, { id: Date.now(), url: formattedLink }]);
      setNewLink('');
    }
  };

  const handleRemoveLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="resume-container">
      {showToast && (
        <div className="toast success">
          <CheckCircle size={20} />
          <span>Resume & Portfolio saved successfully!</span>
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
        <h1>Resume & Portfolio</h1>
        <p>Keep your documents updated for employers to view.</p>
      </div>

      <div className="resume-grid">
        {/* Left: Upload Documents */}
        <div className="resume-card">
          <div className="card-header">
            <h3>Uploaded Documents</h3>
            <span className="count-badge">{resumes.length} Files</span>
          </div>

          {/* Drag & Drop Styled Area */}
          <div className="drop-zone">
            <UploadCloud size={40} className="upload-icon" />
            <p className="main-text">Drag and drop your resume here</p>
            <p className="sub-text">Supported formats: PDF, DOCX (Max 5MB)</p>
            <button type="button" className="browse-btn">Browse Files</button>
            <input type="file" className="file-input-hidden" disabled />
          </div>

          {/* File List */}
          <div className="file-list">
            {resumes.map(file => (
              <div key={file.id} className="file-item">
                <div className="file-left">
                  <div className="file-icon">
                    <FileText size={20} className="icon-doc" />
                  </div>
                  <div className="file-info">
                    <h5>{file.filename}</h5>
                    <span>Uploaded on {file.date}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="delete-file-btn"
                  onClick={() => handleRemoveResume(file.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Portfolio Links */}
        <div className="resume-card">
          <div className="card-header">
            <h3>Portfolio & Links</h3>
            <span className="count-badge">{links.length} Links</span>
          </div>

          <form onSubmit={handleAddLink} className="add-link-form">
            <div className="input-with-icon">
              <Globe size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Add website URL (e.g., github.com/username)" 
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="add-link-btn">
              <Plus size={18} /> Add
            </button>
          </form>

          <div className="links-list">
            {links.length === 0 ? (
              <p className="empty-state">No links added yet.</p>
            ) : (
              links.map(link => (
                <div key={link.id} className="link-item">
                  <div className="link-left">
                    <Link size={18} className="icon-link" />
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                  <button 
                    type="button" 
                    className="delete-link-btn"
                    onClick={() => handleRemoveLink(link.id)}
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
