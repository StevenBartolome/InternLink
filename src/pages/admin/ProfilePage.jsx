import React, { useState, useEffect } from 'react';
import { 
  Shield, Edit2, ShieldCheck, Save, X, 
  Terminal, Activity, Database, Users, 
  Settings, Cpu, Globe
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const AdminProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
  });
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [systemStats, setSystemStats] = useState({
    activeUsers: 0,
    totalPlacements: 0,
    linkedDatabases: 1, // Static for now
    uptime: '99.9%'
  });

  // Mock Admin-Specific Statistics
  const adminStats = [
    { label: 'Total Placements', value: systemStats.totalPlacements, icon: Globe, color: theme.colors.primary },
    { label: 'System Uptime', value: systemStats.uptime, icon: Activity, color: theme.colors.success },
    { label: 'Active Users', value: systemStats.activeUsers, icon: Users, color: theme.colors.warning },
    { label: 'Linked Databases', value: systemStats.linkedDatabases, icon: Database, color: theme.colors.info },
  ];

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        // Count active users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        // Count internships (placements)
        const { count: placementCount } = await supabase
          .from('student_internships')
          .select('*', { count: 'exact', head: true });

        setSystemStats(prev => ({
          ...prev,
          activeUsers: userCount || 0,
          totalPlacements: placementCount || 0
        }));
      } catch (err) {
        console.error('Error fetching system stats:', err);
      }
    };

    fetchSystemStats();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
      });
    }
    setIsEditing(prev => !prev);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await updateUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (error) throw error;

      setIsEditing(false);
      showToast('Admin profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1000px',
      margin: '0 auto',
      animation: 'fadeIn 0.5s ease-out',
    },
    hero: {
      ...commonStyles.dashboardCard,
      padding: '40px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      border: 'none',
    },
    avatarWrapper: {
      position: 'relative',
      zIndex: 2,
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '30px',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid rgba(59, 130, 246, 0.4)',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
    },
    statusBadge: {
      position: 'absolute',
      bottom: '-8px',
      right: '-8px',
      backgroundColor: theme.colors.success,
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: 800,
      color: '#fff',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    statsRow: {
       display: 'grid',
       gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
       gap: '20px',
    },
    statCard: {
      ...commonStyles.dashboardCard,
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'transform 0.2s',
      ':hover': { transform: 'translateY(-4px)' }
    },
    statIcon: (color) => ({
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      backgroundColor: `${color}15`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: '24px',
    },
    section: {
      ...commonStyles.dashboardCard,
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      paddingBottom: '20px',
      borderBottom: `1px solid ${theme.colors.bgSecondary}`,
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      display: 'block',
      marginBottom: '4px',
    },
    value: {
      fontSize: '1rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    },
    input: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '10px',
      border: `2px solid ${theme.colors.border}`,
      fontSize: '0.95rem',
      outline: 'none',
      backgroundColor: '#f8fafc',
      transition: 'border-color 0.2s',
      ':focus': { borderColor: theme.colors.primary }
    },
    permissionBox: {
      padding: '12px 16px',
      borderRadius: '10px',
      backgroundColor: theme.colors.bgSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.85rem',
      fontWeight: 600,
      color: theme.colors.textMain,
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* System Hero Header */}
      <div style={styles.hero}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            <Shield size={56} />
          </div>
        </div>
        
        <div style={{ zIndex: 2, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  style={{ ...styles.input, fontSize: '1.75rem', fontWeight: 900, width: '200px', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  value={formData.firstName}
                  onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))}
                />
                <input
                  style={{ ...styles.input, fontSize: '1.75rem', fontWeight: 900, width: '200px', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  value={formData.lastName}
                  onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            ) : (
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{user?.name}</h1>
            )}
            <ShieldCheck size={28} color={theme.colors.success} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: 0 }}>System Administrator • System Engineering & Management</p>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button 
              style={{ 
                ...commonStyles.dashboardBtn, 
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={handleEditToggle}
            >
              {isEditing ? <><X size={18} /> Discard Changes</> : <><Edit2 size={18} /> Modify Admin Record</>}
            </button>
            {isEditing && (
              <button
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={18} /> {isSaving ? 'Processing...' : 'Deploy Updates'}
              </button>
            )}
          </div>
        </div>

        {/* Decorative Circuit Background */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', bottom: -50, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 1 }}></div>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsRow}>
        {adminStats.map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statIcon(stat.color)}>
              <stat.icon size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.colors.textMain }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.mainGrid}>
        {/* Core Credentials Section */}
        <div style={styles.section}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={20} /> System Credentials
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={styles.infoRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Admin Identifier (Email)</label>
                {isEditing ? (
                  <input
                    style={styles.input}
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  />
                ) : (
                  <div style={styles.value}>{user?.email}</div>
                )}
              </div>
            </div>

            <div style={{ ...styles.infoRow, marginTop: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Account ID (Internal)</label>
                <div style={styles.value}>{user?.id}</div>
              </div>
            </div>

            <div style={{ ...styles.infoRow, marginTop: '20px', borderBottom: 'none' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Instance Status</label>
                <div style={{ ...styles.value, color: theme.colors.success, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={16} /> Highly Available - Active Cluster 04
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Modules Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.section}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: theme.colors.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={20} /> Verified Modules
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {['System Integrity Oversight', 'Multi-tenant Audit', 'Database Matching Engine', 'Global Notifications Platform'].map(mod => (
                <div key={mod} style={styles.permissionBox}>
                  <ShieldCheck size={16} color={theme.colors.primary} />
                  {mod}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...styles.section, background: theme.colors.bgSecondary, border: `1px dashed ${theme.colors.border}`, display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Settings size={32} color={theme.colors.textMuted} style={{ marginBottom: '12px' }} />
            <p style={{ color: theme.colors.textMuted, fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Administrator accounts have full oversight authority for all verification tiers and can manage core application logic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
