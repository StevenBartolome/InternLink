import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Save } from 'lucide-react';
import './PostInternshipPage.css';

const PostInternshipPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editListing = location.state?.listing;

  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    industry: '',
    location: '',
    duration: '',
    slotsAvailable: '',
    description: '',
    responsibilities: '',
    requirements: ''
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (editListing) {
      setFormData({
        jobTitle: editListing.jobTitle || '',
        department: editListing.department || '',
        industry: editListing.industry || '',
        location: editListing.location || '',
        duration: editListing.duration || '',
        slotsAvailable: editListing.slotsAvailable || '',
        description: editListing.description || '',
        responsibilities: editListing.responsibilities ? editListing.responsibilities.join('\n') : '',
        requirements: editListing.requirements ? editListing.requirements.join('\n') : ''
      });
      setSkills(editListing.skills || []);
    }
  }, [editListing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Mock save
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/employer/listings');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="post-container">
      {showSuccess && (
        <div className="alert alert-success">
          Internship {editListing ? 'updated' : 'published'} successfully! Redirecting...
        </div>
      )}

      <div className="form-card">
        <h2>{editListing ? 'Edit Internship Listing' : 'Post a New Internship'}</h2>
        <p className="subtitle">Fill in the details to attract the best candidates.</p>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer Intern" required />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" required />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. IT / Tech" required />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Mandaluyong / Remote" required />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 Months" required />
            </div>

            <div className="form-group">
              <label>Slots Available</label>
              <input type="number" name="slotsAvailable" value={formData.slotsAvailable} onChange={handleChange} placeholder="e.g. 5" required />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Skills & Tags</label>
            <div className="skills-input-wrapper">
              <input 
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)} 
                placeholder="Type a skill and press Enter or Click Add"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
              />
              <button type="button" onClick={handleAddSkill} className="btn-add-skill">
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="chips-container">
              {skills.map((skill, index) => (
                <div key={index} className="chip">
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Brief overview of the role..." required />
          </div>

          <div className="form-group full-width">
            <label>Responsibilities (One per line)</label>
            <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows="4" placeholder="- Assist in dev&#10;- Code reviews" />
          </div>

          <div className="form-group full-width">
            <label>Requirements (One per line)</label>
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" placeholder="- BS CS student&#10;- React knowledge" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/employer/listings')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              <Save size={18} /> {isSaving ? 'Saving...' : editListing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostInternshipPage;
