import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, 
  Building, GraduationCap, Award, 
  Key, Shield, Camera, Save, X, Edit,
  Users, CheckCircle2, AlertCircle, Briefcase
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';


const ProfilePage = () => {
  const { showToast } = useOutletContext() || {};
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    role: user?.role === 'ojt_head' ? 'Coordinator' : user?.role || '',
    department: user?.course_code || '',
    phone: '',
    office: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [managedCount, setManagedCount] = useState(0);

  // Fetch real-time stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count } = await supabase
          .from('student_internships')
          .select('*', { count: 'exact', head: true })
          .eq('ojt_head_id', user.id);
        
        setManagedCount(count || 0);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    if (user?.id) fetchStats();
  }, [user]);

  // Mock stats for the coordinator (mixed with real managed count)
  const stats = [
    { label: 'Managed Students', value: managedCount, icon: Users, color: theme.colors.primary },
    { label: 'Active Internships', value: Math.floor(managedCount * 0.7), icon: Briefcase, color: theme.colors.success },
    { label: 'Pending Approvals', value: '0', icon: AlertCircle, color: theme.colors.warning },
    { label: 'Placements Done', value: '0', icon: CheckCircle2, color: theme.colors.info },
  ];

  const toggleEdit = () => {
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      role: user?.role === 'ojt_head' ? 'Coordinator' : user?.role || '',
      department: user?.course_code || '',
      phone: '',
      office: '',
    });
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await updateUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (error) throw error;
      
      setIsEditing(false);
      if (showToast) showToast('Profile updated successfully!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    heroCard: {
      ...commonStyles.dashboardCard,
      padding: '40px',
      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #1e40af 100%)`,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      border: 'none',
      boxShadow: '0 10px 25px rgba(30, 64, 175, 0.15)',
    },
    avatarWrapper: {
      position: 'relative',
      zIndex: 2,
    },
    avatar: {
      width: '140px',
      height: '140px',
      borderRadius: '40px',
      border: '6px solid rgba(255, 255, 255, 0.2)',
      objectFit: 'cover',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    cameraBtn: {
      position: 'absolute',
      bottom: '-6px',
      right: '-6px',
      backgroundColor: '#fff',
      color: theme.colors.primary,
      padding: '10px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      cursor: 'pointer',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s',
      ':hover': { transform: 'scale(1.1)' }
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
    },
    statCard: {
      ...commonStyles.dashboardCard,
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'transform 0.2s',
      ':hover': { transform: 'translateY(-4px)' }
    },
    statIcon: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '14px',
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
    sectionCard: {
      ...commonStyles.dashboardCard,
      padding: '28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    iconBox: {
      width: '42px',
      height: '42px',
      borderRadius: '12px',
      backgroundColor: theme.colors.bgSecondary,
      color: theme.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
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
      padding: '12px 16px',
      borderRadius: '12px',
      border: `2px solid ${theme.colors.border}`,
      fontSize: '0.95rem',
      outline: 'none',
      backgroundColor: '#f8fafc',
      transition: 'border-color 0.2s',
      ':focus': { borderColor: theme.colors.primary }
    },
    saveActions: {
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      padding: '20px',
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Header */}
      <div style={styles.heroCard}>
        <div style={styles.avatarWrapper}>
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Profile" style={styles.avatar} />
          <button 
            style={styles.cameraBtn}
            onClick={() => showToast && showToast('Image upload coming soon', 'info')}
          >
            <Camera size={20} />
          </button>
        </div>
        
        <div style={{ zIndex: 2, flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  style={{ ...styles.input, fontSize: '1.5rem', fontWeight: 800, color: '#333', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <input 
                  style={{ ...styles.input, fontSize: '1.5rem', fontWeight: 800, color: '#333', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  style={{ ...styles.input, fontSize: '0.9rem', color: '#444', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Role"
                />
                <input 
                  style={{ ...styles.input, fontSize: '0.9rem', color: '#444', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{user?.name}</h1>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Verified OJT Head</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={20} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user?.role === 'ojt_head' ? 'Coordinator' : user?.role}</span>
                </div>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.5 }}></div>
                <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user?.course_code} Department</span>
              </div>
            </>
          )}
        </div>

        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', bottom: -50, left: '20%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 1 }}></div>
      </div>

      {/* Stats Quick View */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statIcon(stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.colors.textMuted }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.mainGrid}>
        {/* Profile Details */}
        <div style={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: theme.colors.textMain }}>Personal Information</h3>
            {!isEditing && (
              <button 
                onClick={toggleEdit}
                style={{ 
                  ...commonStyles.dashboardBtn, 
                  backgroundColor: theme.colors.bgSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  padding: '8px 16px', 
                  fontSize: '0.8rem' 
                }}
              >
                <Edit size={16} /> Edit Info
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={styles.detailItem}>
              <div style={styles.iconBox}><Mail size={22} /></div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Email Address</label>
                {isEditing ? (
                  <input style={styles.input} name="email" value={formData.email} onChange={handleChange} disabled />
                ) : (
                  <div style={styles.value}>{user?.email}</div>
                )}
              </div>
            </div>

            <div style={styles.detailItem}>
              <div style={styles.iconBox}><Building size={22} /></div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Institution</label>
                {isEditing ? (
                  <input style={styles.input} name="school" value={formData.school || 'National University Baliwag'} onChange={handleChange} />
                ) : (
                  <div style={styles.value}>National University Baliwag</div>
                )}
              </div>
            </div>

            <div style={styles.detailItem}>
              <div style={styles.iconBox}><Phone size={22} /></div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Contact Number</label>
                {isEditing ? (
                  <input style={styles.input} name="phone" value={formData.phone} onChange={handleChange} placeholder="+63 9xx xxx xxxx" />
                ) : (
                  <div style={styles.value}>{formData.phone || 'Not set'}</div>
                )}
              </div>
            </div>

            <div style={styles.detailItem}>
              <div style={styles.iconBox}><MapPin size={22} /></div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Office Location</label>
                {isEditing ? (
                  <input style={styles.input} name="office" value={formData.office} onChange={handleChange} placeholder="Room / Building" />
                ) : (
                  <div style={styles.value}>{formData.office || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div style={styles.saveActions}>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, padding: '12px 32px' }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving Changes...' : <><Save size={18} /> Save Profile</>}
              </button>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, padding: '12px 32px' }}
                onClick={cancelEdit}
              >
                <X size={18} /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Security / Sidebar Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: theme.colors.textMain }}>Account Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, justifyContent: 'flex-start', padding: '14px' }}
                onClick={() => showToast && showToast('Security code sent to your email.', 'success')}
              >
                <Key size={18} /> Change Password
              </button>
              <button 
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, justifyContent: 'flex-start', padding: '14px' }}
                onClick={() => showToast && showToast('Proceeding to 2FA setup...', 'info')}
              >
                <Shield size={18} /> Two-Factor Login
              </button>
            </div>
          </div>

          <div style={{ ...styles.sectionCard, backgroundColor: theme.colors.bgSecondary, border: `1px dashed ${theme.colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: theme.colors.textMuted }}>
              <Award size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Coordinator Verification</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: theme.colors.textMuted, margin: 0 }}>
              Your account is verified by the National University Baliwag Academic Affairs office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
