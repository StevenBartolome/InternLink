import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit,
  ShieldCheck, 
  ExternalLink, 
  Github,
  FileText, 
  Award, 
  Star, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentDesign } from '../../styles/StudentDesign';

const ProfilePage = () => {
  const { user } = useAuth();
  
  const initialData = {
    firstName: user?.first_name || 'Juan',
    lastName: user?.last_name || 'Dela Cruz',
    email: user?.email || 'juan.delacruz@example.com',
    course: user?.course_code || 'BS Information Technology',
    contact: user?.contact_number || '09123456789',
    studentId: user?.student_id || '2021-12345',
    address: '123 Sampaguita St., Quezon City',
    avatar: null,
    skills: ['React', 'JavaScript', 'UI Design', 'Problem Solving'],
    certifications: [
      { id: 1, title: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Dec 2025' },
      { id: 2, title: 'Google UX Design Professional', issuer: 'Coursera', date: 'Oct 2025' }
    ],
    portfolioLinks: [
      { id: 1, url: 'github.com/juandelacruz' },
      { id: 2, url: 'juandelacruz.dev' }
    ],
    resumeFiles: [
      { id: 1, filename: 'Juan_Dela_Cruz_Resume.pdf', date: 'May 10, 2026' }
    ]
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialData);
  const [tempProfile, setTempProfile] = useState(initialData);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        firstName: user.first_name || prev.firstName,
        lastName: user.last_name || prev.lastName,
        email: user.email || prev.email,
        course: user.course || prev.course,
        studentId: user.student_id || prev.studentId,
      }));
    }
  }, [user]);

  const handleSave = () => {
    setIsSaving(true);
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

  const getInitials = (first, last) => {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      fontFamily: studentDesign.typography.fontFamily,
    },
    headerCard: {
      ...studentDesign.card,
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '40px',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '32px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '40px',
      fontWeight: studentDesign.typography.weights.bold,
      boxShadow: '0 20px 25px -5px rgba(30, 64, 175, 0.2)',
    },
    badge: {
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: '#EFF6FF',
      color: studentDesign.colors.primary,
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.semibold,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    section: {
      ...studentDesign.card,
      height: '100%',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '24px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '32px',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    infoLabel: {
      fontSize: '12px',
      color: studentDesign.colors.textMuted,
      width: '100px',
    },
    infoValue: {
      fontSize: '14px',
      color: studentDesign.colors.textDark,
      fontWeight: studentDesign.typography.weights.medium,
    },
    skillBadge: {
      padding: '8px 16px',
      borderRadius: '12px',
      backgroundColor: '#F1F5F9',
      color: studentDesign.colors.textDark,
      fontSize: '13px',
      fontWeight: studentDesign.typography.weights.medium,
      margin: '0 8px 8px 0',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${studentDesign.colors.border}`,
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      backgroundColor: '#F8FAFC',
    },
    primaryButton: {
      padding: '10px 24px',
      borderRadius: '12px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    },
    secondaryButton: {
      padding: '10px 24px',
      borderRadius: '12px',
      backgroundColor: 'transparent',
      color: studentDesign.colors.textDark,
      border: `1px solid ${studentDesign.colors.border}`,
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.avatar}>
          {getInitials(profile.firstName, profile.lastName)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
            <div style={styles.badge}>
              <ShieldCheck size={14} /> Verified Student
            </div>
          </div>
          <p style={{ color: studentDesign.colors.textMuted, fontSize: '16px', margin: '0 0 24px 0' }}>{profile.course}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTempProfile({...profile});
                  setIsEditing(true);
                }}
                style={styles.primaryButton}
              >
                <Edit size={16} /> Edit Profile
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleSave} 
                  style={{ ...styles.primaryButton, opacity: isSaving ? 0.7 : 1 }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  style={styles.secondaryButton}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
            <button style={styles.secondaryButton}>
              <ExternalLink size={16} /> Public Portfolio
            </button>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><Mail size={18} color={studentDesign.colors.primary} /> Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{profile.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>{profile.contact}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Address</span>
                <span style={styles.infoValue}>{profile.address}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Student ID</span>
                <span style={styles.infoValue}>{profile.studentId}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><Github size={18} color={studentDesign.colors.primary} /> Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.portfolioLinks.map(link => (
                <a key={link.id} href={`https://${link.url}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: studentDesign.colors.textDark, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                    <ExternalLink size={14} style={{ margin: 'auto' }} />
                  </div>
                  {link.url}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><Star size={18} color={studentDesign.colors.primary} /> Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {profile.skills.map((skill, i) => (
                <span key={i} style={styles.skillBadge}>{skill}</span>
              ))}
              <button style={{ ...styles.skillBadge, backgroundColor: 'transparent', border: `1px dashed ${studentDesign.colors.border}`, color: studentDesign.colors.textMuted }}>
                <Plus size={14} /> Add Skill
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><Award size={18} color={studentDesign.colors.primary} /> Certifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profile.certifications.map(cert => (
                <div key={cert.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: studentDesign.colors.primaryLight, color: studentDesign.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{cert.title}</div>
                    <div style={{ fontSize: '12px', color: studentDesign.colors.textMuted }}>{cert.issuer} • {cert.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}><FileText size={18} color={studentDesign.colors.primary} /> Resumes</h3>
              <button style={{ ...styles.secondaryButton, padding: '6px 12px', fontSize: '12px' }}>
                <Upload size={14} /> Upload New
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {profile.resumeFiles.map(file => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: `1px solid ${studentDesign.colors.border}`, flex: 1, minWidth: '240px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: studentDesign.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{file.filename}</div>
                    <div style={{ fontSize: '11px', color: studentDesign.colors.textMuted }}>Uploaded {file.date}</div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: studentDesign.colors.textMuted, cursor: 'pointer' }}>
                    <Eye size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
