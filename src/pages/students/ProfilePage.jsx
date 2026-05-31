import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, Calendar, Edit, ShieldCheck,
  ExternalLink, Github, FileText, Award, Star,
  Save, X, Plus, Eye, Upload, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentDesign } from '../../styles/StudentDesign';
import { supabase } from '../../services/supabaseClient';
import Toast from '../../components/common/Toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    contact: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        contact: user.contact_number || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save first_name + last_name to users table
      const { error: nameError } = await updateUser({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
      });
      if (nameError) throw nameError;

      // 2. Save contact_number to student_profiles
      if (form.contact !== (user.contact_number || '')) {
        const { error: contactError } = await supabase
          .from('student_profiles')
          .update({ contact_number: form.contact.trim() })
          .eq('id', user.id);
        if (contactError) throw contactError;
      }

      setToast({ message: 'Profile updated successfully.', type: 'success' });
      setIsEditing(false);
    } catch (err) {
      console.error('Profile save error:', err);
      setToast({ message: err.message || 'Failed to save profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (first, last) =>
    ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();

  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Student';

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
      alignItems: 'flex-start',
      gap: '32px',
      padding: '40px',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
      flexWrap: 'wrap',
    },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '28px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '36px',
      fontWeight: studentDesign.typography.weights.bold,
      boxShadow: '0 16px 24px -4px rgba(30, 64, 175, 0.2)',
      flexShrink: 0,
    },
    badge: {
      padding: '5px 12px',
      borderRadius: '20px',
      backgroundColor: '#EFF6FF',
      color: studentDesign.colors.primary,
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.semibold,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
    },
    section: {
      ...studentDesign.card,
      height: '100%',
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '28px',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 0',
      borderBottom: `1px solid ${studentDesign.colors.border}`,
    },
    label: {
      fontSize: '12px',
      color: studentDesign.colors.textMuted,
      minWidth: '110px',
    },
    value: {
      fontSize: '14px',
      color: studentDesign.colors.textDark,
      fontWeight: studentDesign.typography.weights.medium,
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '10px',
      border: `1.5px solid ${studentDesign.colors.primary}`,
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#F8FAFF',
      color: studentDesign.colors.textDark,
    },
    primaryButton: {
      padding: '9px 20px',
      borderRadius: '10px',
      backgroundColor: studentDesign.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      fontSize: '14px',
    },
    secondaryButton: {
      padding: '9px 20px',
      borderRadius: '10px',
      backgroundColor: 'transparent',
      color: studentDesign.colors.textDark,
      border: `1px solid ${studentDesign.colors.border}`,
      fontWeight: studentDesign.typography.weights.semibold,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      fontSize: '14px',
    },
    skillBadge: {
      padding: '7px 14px',
      borderRadius: '10px',
      backgroundColor: '#F1F5F9',
      color: studentDesign.colors.textDark,
      fontSize: '13px',
      fontWeight: studentDesign.typography.weights.medium,
      margin: '0 8px 8px 0',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.avatar}>
          {getInitials(user?.first_name, user?.last_name)}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>{displayName}</h1>
            <div style={styles.badge}><ShieldCheck size={13} /> Verified Student</div>
          </div>
          <p style={{ color: studentDesign.colors.textMuted, fontSize: '15px', margin: '0 0 20px 0' }}>
            {user?.course_code || user?.course_name || 'Student'}
            {user?.student_id ? ` • ${user.student_id}` : ''}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                style={styles.primaryButton}
              >
                <Edit size={15} /> Edit Profile
              </motion.button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  style={{ ...styles.primaryButton, opacity: isSaving ? 0.7 : 1 }}
                  disabled={isSaving}
                >
                  {isSaving ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
                <button onClick={() => { setIsEditing(false); setForm({ firstName: user?.first_name || '', lastName: user?.last_name || '', contact: user?.contact_number || '' }); }} style={styles.secondaryButton}>
                  <X size={15} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Contact Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Mail size={16} color={studentDesign.colors.primary} /> Contact Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* First Name */}
            <div style={styles.infoRow}>
              <span style={styles.label}>First Name</span>
              {isEditing
                ? <input style={styles.input} name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
                : <span style={styles.value}>{user?.first_name || '—'}</span>
              }
            </div>
            {/* Last Name */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Last Name</span>
              {isEditing
                ? <input style={styles.input} name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                : <span style={styles.value}>{user?.last_name || '—'}</span>
              }
            </div>
            {/* Email (read-only) */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Email</span>
              <span style={styles.value}>{user?.email || '—'}</span>
            </div>
            {/* Contact Number */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Phone</span>
              {isEditing
                ? <input style={styles.input} name="contact" value={form.contact} onChange={handleChange} placeholder="e.g. 09123456789" />
                : <span style={styles.value}>{user?.contact_number || '—'}</span>
              }
            </div>
            {/* Student ID (read-only) */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Student ID</span>
              <span style={styles.value}>{user?.student_id || '—'}</span>
            </div>
            {/* Year Level (read-only) */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Year Level</span>
              <span style={styles.value}>{user?.year_level || '—'}</span>
            </div>
          </div>
        </div>

        {/* Internship Info (read-only) */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Calendar size={16} color={studentDesign.colors.primary} /> Internship Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Program</span>
              <span style={styles.value}>{user?.course_name || user?.course_code || '—'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Stage</span>
              <span style={styles.value}>{
                user?.current_stage === 'PRE_INTERNSHIP' ? 'Pre-Internship'
                : user?.current_stage === 'DURING_INTERNSHIP' ? 'During Internship'
                : user?.current_stage === 'POST_INTERNSHIP' ? 'Post-Internship'
                : user?.current_stage === 'COMPLETED' ? 'Completed'
                : '—'
              }</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Company</span>
              <span style={styles.value}>{user?.company_name || '—'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Supervisor</span>
              <span style={styles.value}>{user?.supervisor_name || '—'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Hours Done</span>
              <span style={styles.value}>
                {user?.rendered_hours != null ? `${user.rendered_hours} / ${user?.required_hours || 486} hrs` : '—'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Academic Year</span>
              <span style={styles.value}>{user?.academic_year || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
