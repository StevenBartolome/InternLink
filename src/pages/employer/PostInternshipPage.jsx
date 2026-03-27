// src/pages/employer/PostInternshipPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Save, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const PostInternshipPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editListing = location.state?.listing;
  const isMobile = useMediaQuery('(max-width: 768px)');

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
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

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

  const styles = {
    container: {
      padding: isMobile ? '0 1.5rem 1.5rem 1.5rem' : '0 2rem 2rem 2rem', // Removed top padding
      maxWidth: '1000px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    },
    successAlert: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      color: '#16a34a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontWeight: 600,
      fontSize: '1rem',
      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.12)',
      animation: 'slideIn 0.3s ease-out',
    },
    formCard: {
      backgroundColor: theme.colors.white,
      padding: isMobile ? '1.5rem' : '2.5rem',
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md,
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.75rem',
      fontWeight: 800,
      color: theme.colors.textMain,
    },
    subtitle: {
      margin: '0.5rem 0 2rem',
      color: theme.colors.textMuted,
      fontSize: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '1.5rem',
    },
    formGroup: (fullWidth) => ({
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      gridColumn: fullWidth && !isMobile ? '1 / span 2' : 'span 1',
    }),
    label: {
      fontSize: '0.875rem',
      fontWeight: 700,
      color: theme.colors.textMain,
      marginLeft: '4px',
    },
    input: (isFocused) => ({
      padding: '0.875rem 1.125rem',
      borderRadius: '14px',
      border: `1.5px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
      fontSize: '0.95rem',
      color: theme.colors.textMain,
      backgroundColor: isFocused ? '#fff' : '#f8fafc',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isFocused ? `0 0 0 4px ${theme.colors.primary}15` : 'none',
    }),
    textarea: (isFocused) => ({
      padding: '1rem 1.125rem',
      borderRadius: '16px',
      border: `1.5px solid ${isFocused ? theme.colors.primary : theme.colors.border}`,
      fontSize: '0.95rem',
      color: theme.colors.textMain,
      backgroundColor: isFocused ? '#fff' : '#f8fafc',
      outline: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      minHeight: '120px',
      resize: 'vertical',
      boxShadow: isFocused ? `0 0 0 4px ${theme.colors.primary}15` : 'none',
    }),
    skillInputWrapper: {
      display: 'flex',
      gap: '0.75rem',
    },
    addBtn: (isHovered) => ({
      ...commonStyles.buttonSecondary,
      padding: '0 1.25rem',
      borderRadius: '12px',
      backgroundColor: isHovered ? theme.colors.bgSecondary : theme.colors.white,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }),
    chipsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      marginTop: '0.5rem',
    },
    chip: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#f1f5f9',
      color: theme.colors.primary,
      padding: '0.5rem 0.875rem',
      borderRadius: '10px',
      fontSize: '0.875rem',
      fontWeight: 700,
      border: '1px solid #e2e8f0',
    },
    removeChip: {
      background: 'none',
      border: 'none',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      color: theme.colors.textMuted,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1.25rem',
      marginTop: '1rem',
      paddingTop: '2rem',
      borderTop: `1px solid ${theme.colors.border}`,
    },
    cancelBtn: (isHovered) => ({
      ...commonStyles.buttonSecondary,
      padding: '0.875rem 1.75rem',
      borderRadius: '14px',
      backgroundColor: isHovered ? '#f1f5f9' : 'transparent',
      borderColor: theme.colors.border,
      color: theme.colors.textMuted,
    }),
    submitBtn: (isHovered, disabled) => ({
      ...commonStyles.buttonPrimary,
      padding: '0.875rem 2rem',
      borderRadius: '14px',
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: isHovered && !disabled ? theme.colors.primaryDark : theme.colors.primary,
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
    })
  };

  return (
    <div style={styles.container}>
      {showSuccess && (
        <div style={styles.successAlert}>
          <CheckCircle2 size={24} />
          <span>Internship {editListing ? 'updated' : 'published'} successfully! Redirecting...</span>
        </div>
      )}

      <div style={styles.formCard}>
        <h2 style={styles.headerTitle}>{editListing ? 'Edit Internship Listing' : 'Post a New Internship'}</h2>
        <p style={styles.subtitle}>Fill in the details to attract the best candidates.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.formGroup(false)}>
              <label style={styles.label}>Job Title</label>
              <input 
                style={styles.input(focusedField === 'jobTitle')}
                type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer Intern" required 
                onFocus={() => setFocusedField('jobTitle')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={styles.formGroup(false)}>
              <label style={styles.label}>Department</label>
              <input 
                style={styles.input(focusedField === 'department')}
                type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" required 
                onFocus={() => setFocusedField('department')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={styles.formGroup(false)}>
              <label style={styles.label}>Industry</label>
              <input 
                style={styles.input(focusedField === 'industry')}
                type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. IT / Tech" required 
                onFocus={() => setFocusedField('industry')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={styles.formGroup(false)}>
              <label style={styles.label}>Location</label>
              <input 
                style={styles.input(focusedField === 'location')}
                type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Mandaluyong / Remote" required 
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={styles.formGroup(false)}>
              <label style={styles.label}>Duration</label>
              <input 
                style={styles.input(focusedField === 'duration')}
                type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 Months" required 
                onFocus={() => setFocusedField('duration')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={styles.formGroup(false)}>
              <label style={styles.label}>Slots Available</label>
              <input 
                style={styles.input(focusedField === 'slotsAvailable')}
                type="number" name="slotsAvailable" value={formData.slotsAvailable} onChange={handleChange} placeholder="e.g. 5" required 
                onFocus={() => setFocusedField('slotsAvailable')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div style={styles.formGroup(true)}>
            <label style={styles.label}>Skills & Tags</label>
            <div style={styles.skillInputWrapper}>
              <input 
                style={{ ...styles.input(focusedField === 'skillInput'), flex: 1 }}
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)} 
                placeholder="Type a skill and press Enter"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                onFocus={() => setFocusedField('skillInput')}
                onBlur={() => setFocusedField(null)}
              />
              <button 
                type="button" 
                onClick={handleAddSkill} 
                style={styles.addBtn(hoveredBtn === 'addSkill')}
                onMouseEnter={() => setHoveredBtn('addSkill')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <Plus size={18} /> Add
              </button>
            </div>
            <div style={styles.chipsContainer}>
              {skills.map((skill, index) => (
                <div key={index} style={styles.chip}>
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} style={styles.removeChip}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formGroup(true)}>
            <label style={styles.label}>Description</label>
            <textarea 
              style={styles.textarea(focusedField === 'description')}
              name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Brief overview of the role..." required 
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div style={styles.formGroup(true)}>
            <label style={styles.label}>Responsibilities (One per line)</label>
            <textarea 
              style={styles.textarea(focusedField === 'responsibilities')}
              name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows="4" placeholder="• Assist in dev&#10;• Code reviews" 
              onFocus={() => setFocusedField('responsibilities')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div style={styles.formGroup(true)}>
            <label style={styles.label}>Requirements (One per line)</label>
            <textarea 
              style={styles.textarea(focusedField === 'requirements')}
              name="requirements" value={formData.requirements} onChange={handleChange} rows="4" placeholder="• BS CS student&#10;• React knowledge" 
              onFocus={() => setFocusedField('requirements')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div style={styles.formActions}>
            <button 
              type="button" 
              style={styles.cancelBtn(hoveredBtn === 'cancel')} 
              onMouseEnter={() => setHoveredBtn('cancel')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => navigate('/employer/listings')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={styles.submitBtn(hoveredBtn === 'submit', isSaving)} 
              onMouseEnter={() => setHoveredBtn('submit')}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={isSaving}
            >
              {isSaving ? <Clock size={20} className="spin" /> : <Save size={20} />}
              {isSaving ? 'Saving...' : editListing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostInternshipPage;
