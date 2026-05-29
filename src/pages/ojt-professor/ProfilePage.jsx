import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Edit, ShieldCheck, Save, X, Building,
  Users, CheckCircle2, AlertCircle, Briefcase, Key, Shield,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  const initialData = {
    firstName: user?.first_name || 'Coordinator',
    lastName: user?.last_name || 'Name',
    email: user?.email || 'coordinator@example.com',
    role: user?.role === 'ojt_head' ? 'Coordinator' : user?.role || 'Adviser',
    department: user?.course_code || 'Information Technology',
    phone: '+63 912 345 6789',
    office: 'Room 302, Main Building',
    links: [
      { id: 1, url: 'nu-baliwag.edu.ph' }
    ]
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialData);
  const [tempProfile, setTempProfile] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [managedCount, setManagedCount] = useState(0);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        firstName: user.first_name || prev.firstName,
        lastName: user.last_name || prev.lastName,
        email: user.email || prev.email,
        role: user.role === 'ojt_head' ? 'Coordinator' : user.role || prev.role,
        department: user.course_code || prev.department,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user?.id) return;
        const { count } = await supabase
          .from('student_internships')
          .select('*', { count: 'exact', head: true })
          .eq('ojt_head_id', user.id);
        
        setManagedCount(count || 0);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (updateUser) {
        await updateUser({
          first_name: tempProfile.firstName,
          last_name: tempProfile.lastName,
        });
      }
      setProfile({...tempProfile});
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({ ...prev, [name]: value }));
  };

  const getInitials = (first, last) => {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  };

  // Using Student Design Theme colors for exact matching
  const sc = {
    primary: '#1E40AF',
    primaryLight: '#EFF6FF',
    textMain: '#1E293B',
    textDark: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      fontFamily: "'Inter', sans-serif",
    },
    headerCard: {
      borderRadius: '24px',
      border: `1px solid ${sc.border}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
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
      backgroundColor: sc.primary,
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '40px',
      fontWeight: 700,
      boxShadow: '0 20px 25px -5px rgba(30, 64, 175, 0.2)',
    },
    badge: {
      padding: '6px 12px',
      borderRadius: '20px',
      backgroundColor: sc.primaryLight,
      color: sc.primary,
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    section: {
      backgroundColor: '#FFFFFF',
      borderRadius: '24px',
      border: `1px solid ${sc.border}`,
      padding: '32px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '100%',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 700,
      color: sc.textMain,
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
      borderBottom: `1px solid ${sc.border}`,
    },
    infoLabel: {
      fontSize: '12px',
      color: sc.textMuted,
      width: '100px',
    },
    infoValue: {
      fontSize: '14px',
      color: sc.textDark,
      fontWeight: 500,
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1px solid ${sc.border}`,
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      backgroundColor: '#F8FAFC',
    },
    primaryButton: {
      padding: '10px 24px',
      borderRadius: '12px',
      backgroundColor: sc.primary,
      color: '#FFFFFF',
      border: 'none',
      fontWeight: 600,
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
      color: sc.textDark,
      border: `1px solid ${sc.border}`,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    },
    statBadge: {
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: '#F8FAFC',
      border: `1px solid ${sc.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flex: 1
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.container}>
      {/* Header */}
      <div style={styles.headerCard}>
        <div style={styles.avatar}>
          {getInitials(profile.firstName, profile.lastName)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input style={{...styles.input, width: '200px'}} name="firstName" value={tempProfile.firstName} onChange={handleChange} />
                <input style={{...styles.input, width: '200px'}} name="lastName" value={tempProfile.lastName} onChange={handleChange} />
              </div>
            ) : (
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
            )}
            <div style={styles.badge}>
              <ShieldCheck size={14} /> Verified {profile.role}
            </div>
          </div>
          <p style={{ color: sc.textMuted, fontSize: '16px', margin: '0 0 24px 0' }}>{profile.department} Department</p>
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
                <button onClick={handleSave} style={{ ...styles.primaryButton, opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
                  {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
                <button onClick={() => setIsEditing(false)} style={styles.secondaryButton}>
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><Mail size={18} color={sc.primary} /> Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{profile.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phone</span>
                {isEditing ? (
                  <input style={{...styles.input, padding: '4px 8px'}} name="phone" value={tempProfile.phone} onChange={handleChange} />
                ) : (
                  <span style={styles.infoValue}>{profile.phone}</span>
                )}
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Office</span>
                {isEditing ? (
                  <input style={{...styles.input, padding: '4px 8px'}} name="office" value={tempProfile.office} onChange={handleChange} />
                ) : (
                  <span style={styles.infoValue}>{profile.office}</span>
                )}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><ExternalLink size={18} color={sc.primary} /> Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.links.map(link => (
                <a key={link.id} href={`https://${link.url}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: sc.textDark, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={14} style={{ margin: 'auto' }} />
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
            <h3 style={styles.sectionTitle}><Users size={18} color={sc.primary} /> Advisory Overview</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={styles.statBadge}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: sc.primaryLight, color: sc.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>{managedCount}</div>
                  <div style={{ fontSize: '12px', color: sc.textMuted }}>Managed Students</div>
                </div>
              </div>
              <div style={styles.statBadge}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>{Math.floor(managedCount * 0.7)}</div>
                  <div style={{ fontSize: '12px', color: sc.textMuted }}>Active Placements</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}><Shield size={18} color={sc.primary} /> Account Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: `1px solid ${sc.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: sc.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Key size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Password</div>
                  <div style={{ fontSize: '12px', color: sc.textMuted }}>Last changed 3 months ago</div>
                </div>
                <button style={{ ...styles.secondaryButton, padding: '6px 12px', fontSize: '12px' }}>Update</button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: `1px solid ${sc.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FFFFFF', color: sc.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <ShieldCheck size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '12px', color: sc.textMuted }}>Add an extra layer of security</div>
                </div>
                <button style={{ ...styles.secondaryButton, padding: '6px 12px', fontSize: '12px' }}>Enable</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
