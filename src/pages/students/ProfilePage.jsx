import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, 
  Calendar, Edit,
  ShieldCheck, ExternalLink, Github,
  FileText, Award, Star, Save, X, Plus, Trash2, Eye, Upload
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../context/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useOutletContext() || {};
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  // Default structure for student profile, merged with real auth user
  const initialData = {
    name: user?.name || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    course: user?.course || '',
    contact: user?.contact_number || '',
    studentId: user?.student_id || '',
    address: 'Not provided', // Placeholder for data not yet in DB
    avatar: `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=random`,
    skills: ['Communication', 'Teamwork'],
    certifications: [],
    portfolioLinks: [],
    resumeFiles: []
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialData);
  const [tempProfile, setTempProfile] = useState(initialData);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Sync profile state when user data changes
  React.useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        course: user.course,
        contact: user.contact_number,
        studentId: user.student_id
      }));
    }
  }, [user]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (showToast) showToast(`Uploading ${file.name}...`, 'info');
      setTimeout(() => {
        const fileUrl = URL.createObjectURL(file);
        const newFile = {
          id: Date.now(),
          filename: file.name,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          url: fileUrl
        };
        setProfile(prev => ({
          ...prev,
          resumeFiles: [newFile, ...prev.resumeFiles]
        }));
        if (showToast) showToast('Resume uploaded successfully!', 'success');
      }, 1000);
    }
  };

  const toggleEdit = () => {
    setTempProfile({...profile});
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Mock saving delay
    setTimeout(() => {
      setProfile({...tempProfile});
      setIsSaving(false);
      setIsEditing(false);
    }, 800);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !tempProfile.skills.includes(skillInput.trim())) {
      setTempProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setTempProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    headerCard: {
      ...commonStyles.dashboardCard,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      gap: '32px',
      padding: isMobile ? '24px' : '40px',
      position: 'relative',
    },
    avatar: {
      width: isMobile ? '100px' : '120px',
      height: isMobile ? '100px' : '120px',
      borderRadius: '50%',
      border: `4px solid ${theme.colors.bgAccent}`,
      boxShadow: theme.shadows.md,
      objectFit: 'cover',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      gap: '24px',
    },
    section: {
      ...commonStyles.dashboardCard,
      padding: '24px',
      height: '100%',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.colors.bgSecondary}`,
    },
    badge: {
      ...commonStyles.dashboardBadge,
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      margin: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '0.9rem',
      outline: 'none',
      backgroundColor: '#f8fafc',
      marginTop: '4px',
    },
    label: {
      fontSize: '0.8rem',
      fontWeight: 700,
      color: theme.colors.textMuted,
      display: 'block',
    },
    editActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '12px',
    },
    resumeSection: {
      ...commonStyles.dashboardCard,
      padding: '24px',
      gridColumn: isMobile ? 'span 1' : 'span 2',
      maxWidth: '1000px',
      width: '100%',
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Card */}
      <div style={styles.headerCard}>
        <img src={profile.avatar} alt={profile.name} style={styles.avatar} />
        
        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input 
                  style={styles.input} 
                  name="name" 
                  value={tempProfile.name} 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label style={styles.label}>Course & Major</label>
                <input 
                  style={styles.input} 
                  name="course" 
                  value={tempProfile.course} 
                  onChange={handleChange} 
                />
              </div>
              <div style={styles.editActions}>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
                <button 
                  onClick={cancelEdit} 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{profile.name}</h1>
                <ShieldCheck size={20} color={theme.colors.success} />
              </div>
              <p style={{ color: theme.colors.textMuted, fontSize: '1rem', margin: '4px 0 16px 0' }}>{profile.course}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <button 
                  onClick={toggleEdit}
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
                >
                  <Edit size={16} /> Edit Profile
                </button>
                <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}>
                  <ExternalLink size={16} /> View Public Link
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Column: Contact & Social */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color={theme.colors.primary} /> Contact Information
            </h3>
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Email Address</label>
                  <input style={styles.input} name="email" value={tempProfile.email} onChange={handleChange} />
                </div>
                <div>
                  <label style={styles.label}>Contact Number</label>
                  <input style={styles.input} name="contact" value={tempProfile.contact} onChange={handleChange} />
                </div>
                <div>
                  <label style={styles.label}>Address</label>
                  <input style={styles.input} name="address" value={tempProfile.address} onChange={handleChange} />
                </div>
              </div>
            ) : (
              <>
                <div style={styles.infoItem}><Mail size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>{profile.email}</span></div>
                <div style={styles.infoItem}><Phone size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>{profile.contact}</span></div>
                <div style={styles.infoItem}><MapPin size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>{profile.address}</span></div>
                <div style={styles.infoItem}><Calendar size={18} color={theme.colors.textMuted}/> <span style={{ fontSize: '0.9rem' }}>Joined March 2024</span></div>
              </>
            )}
          </div>

          <div style={styles.section}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github size={18} color={theme.colors.primary} /> Social & Portfolio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(isEditing ? tempProfile : profile).portfolioLinks.map(link => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {isEditing ? (
                    <input 
                      style={styles.input} 
                      value={link.url} 
                      onChange={(e) => {
                        const newLinks = tempProfile.portfolioLinks.map(l => l.id === link.id ? {...l, url: e.target.value} : l);
                        setTempProfile({...tempProfile, portfolioLinks: newLinks});
                      }}
                    />
                  ) : (
                    <a href={link.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.primary, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                      {link.url.includes('github') ? <Github size={18} /> : <ExternalLink size={18} />}
                      {link.url.replace('https://', '')}
                    </a>
                  )}
                </div>
              ))}
              {isEditing && (
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, fontSize: '0.8rem', padding: '8px' }}
                  onClick={() => setTempProfile({...tempProfile, portfolioLinks: [...tempProfile.portfolioLinks, {id: Date.now(), url: ''}]})}
                >
                  <Plus size={14} /> Add Link
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Certifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color={theme.colors.primary} /> Technical Skills
            </h3>
            {isEditing && (
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  style={styles.input} 
                  placeholder="Add a skill..." 
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button type="submit" style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, padding: '0 16px' }}>
                  <Plus size={18} />
                </button>
              </form>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {(isEditing ? tempProfile : profile).skills.map((skill, i) => (
                <span key={i} style={styles.badge}>
                  {skill}
                  {isEditing && (
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color={theme.colors.primary} /> Certifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(isEditing ? tempProfile : profile).certifications.map(cert => (
                <div key={cert.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: theme.colors.bgAccent, padding: '10px', borderRadius: '10px', color: theme.colors.primary }}>
                    <Award size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                          style={styles.input} 
                          value={cert.title} 
                          onChange={(e) => {
                            const newCerts = tempProfile.certifications.map(c => c.id === cert.id ? {...c, title: e.target.value} : c);
                            setTempProfile({...tempProfile, certifications: newCerts});
                          }}
                        />
                        <input 
                          style={styles.input} 
                          value={cert.issuer} 
                          onChange={(e) => {
                            const newCerts = tempProfile.certifications.map(c => c.id === cert.id ? {...c, issuer: e.target.value} : c);
                            setTempProfile({...tempProfile, certifications: newCerts});
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cert.title}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{cert.issuer} • {cert.date}</div>
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <Trash2 
                      size={18} 
                      color={theme.colors.danger} 
                      style={{ cursor: 'pointer', marginTop: '10px' }} 
                      onClick={() => setTempProfile({...tempProfile, certifications: tempProfile.certifications.filter(c => c.id !== cert.id)})}
                    />
                  )}
                </div>
              ))}
              {isEditing && (
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, fontSize: '0.8rem' }}
                  onClick={() => setTempProfile({...tempProfile, certifications: [...tempProfile.certifications, {id: Date.now(), title: 'New Certification', issuer: 'Issuer', date: 'Date'}]})}
                >
                  <Plus size={14} /> Add Certification
                </button>
              )}
            </div>
          </div>
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color={theme.colors.primary} /> Resume & Documents
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, fontSize: '0.85rem' }}
                  onClick={() => showToast && showToast('Opening Resume Builder...', 'info')}
                >
                  <Plus size={16} /> Create
                </button>
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, fontSize: '0.85rem' }}
                  onClick={handleUploadClick}
                >
                  <Upload size={16} /> Upload
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {profile.resumeFiles.length === 0 ? (
                <div style={{ width: '100%', padding: '32px', textAlign: 'center', color: theme.colors.textMuted, border: `2px dashed ${theme.colors.border}`, borderRadius: '12px' }}>
                  <FileText size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No resumes uploaded yet.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Upload a file or create a new resume to get started.</p>
                </div>
              ) : (
                profile.resumeFiles.map(file => (
                  <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', border: `1px solid ${theme.colors.bgSecondary}`, borderRadius: '12px', width: 'fit-content' }}>
                    <div style={{ backgroundColor: '#EEF2FF', padding: '10px', borderRadius: '8px', color: '#4F46E5' }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ paddingRight: '24px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{file.filename}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Uploaded {file.date}</div>
                    </div>
                    <button 
                      onClick={() => {
                        if (file.url) {
                          window.open(file.url, '_blank');
                        } else {
                          showToast && showToast('Viewing system resume sample...', 'info');
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', padding: '4px' }}
                      title="View Resume"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
