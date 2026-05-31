import React, { useState, useEffect } from 'react';
import { useRealtimeSubscription } from '../../../hooks/useRealtimeSubscription';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  CheckCircle, 
  Edit3,
  Mail,
  User,
  Trash2,
  Plus,
  Loader2,
  Briefcase,
  Layers,
  Globe,
  Calendar,
  Clock,
  Activity,
  Phone
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import PageLoader from '../../../components/common/PageLoader';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import CompanyInfoForm from '../../../components/student/CompanyInfoForm';
import Toast from '../../../components/common/Toast';
import ConfirmModal from '../../../components/common/ConfirmModal';

const CompanyInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

  const fetchInternship = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_internships')
        .select('*, companies(*)')
        .eq('student_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.companies) {
        // Flatten the company data for easier access in the UI
        setInternship({
          ...data,
          company_name: data.companies.name,
          company_address: data.companies.address,
          company_latitude: data.companies.latitude,
          company_longitude: data.companies.longitude,
          industry: data.companies.industry
        });
      } else {
        setInternship(data);
      }
    } catch (err) {
      console.error('Error fetching internship:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternship();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeSubscription(
    ['student_internships', 'companies'],
    () => { if (user?.id) fetchInternship(); }
  );

  const handleRemove = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Company Details',
      message: 'Are you sure you want to remove your company information? This will clear all hired details.',
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          setLoading(true);
          const { error } = await supabase
            .from('student_internships')
            .update({
              company_id: null,
              position: null,
              department: null,
              supervisor_name: null,
              supervisor_email: null,
              supervisor_phone: null,
              updated_at: new Date().toISOString()
            })
            .eq('student_id', user.id);

          if (error) throw error;
          
          setInternship(prev => ({ 
            ...prev, 
            company_id: null,
            company_name: null, 
            company_address: null,
            position: null,
            department: null,
            supervisor_name: null,
            supervisor_email: null,
            supervisor_phone: null,
            industry: null
          }));
          setToast({ message: 'Company information removed successfully.', type: 'success' });
        } catch (err) {
          console.error('Error removing company info:', err);
          setToast({ message: 'Failed to remove company information.', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const formatShiftTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const [hrs, mins] = timeStr.split(':');
    const h = parseInt(hrs);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dispHrs = h % 12 === 0 ? 12 : h % 12;
    return `${dispHrs.toString().padStart(2, '0')}:${mins} ${ampm}`;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Not Configured';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const hasCompany = !!internship?.company_name;

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
    },
    button: {
      padding: '8px 16px',
      borderRadius: '10px',
      backgroundColor: 'transparent',
      fontWeight: studentDesign.typography.weights.medium,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      transition: 'all 0.2s',
    },
    editButton: {
      color: studentDesign.colors.primary,
      border: `1px solid ${studentDesign.colors.primary}30`,
      backgroundColor: `${studentDesign.colors.primary}05`
    },
    removeButton: {
      color: '#ef4444',
      border: '1px solid #fee2e2',
      backgroundColor: '#fff5f5'
    },
    mainCard: {
      ...studentDesign.card,
      position: 'relative',
      overflow: 'hidden',
      padding: '32px'
    },
    emptyState: {
      ...studentDesign.card,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 40px',
      textAlign: 'center',
      gap: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      border: `2px dashed ${studentDesign.colors.border}`,
    },
    companyHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '24px',
    },
    companyLogo: {
      width: '64px',
      height: '64px',
      borderRadius: '18px',
      backgroundColor: studentDesign.colors.primaryLight,
      color: studentDesign.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
    },
    companyName: {
      fontSize: '24px',
      fontWeight: studentDesign.typography.weights.bold,
      color: studentDesign.colors.textMain,
      margin: 0,
    },
    location: {
      fontSize: '14px',
      color: studentDesign.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '4px',
    },
    verifiedBadge: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      backgroundColor: '#F0FDF4',
      color: '#166534',
      fontSize: '12px',
      fontWeight: studentDesign.typography.weights.semibold,
      border: '1px solid #BBF7D0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px',
      paddingTop: '24px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    fullRow: {
      gridColumn: '1 / span 2'
    },
    fieldLabel: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      color: studentDesign.colors.textMuted,
      fontWeight: studentDesign.typography.weights.semibold,
    },
    fieldValue: {
      fontSize: '15px',
      color: studentDesign.colors.textDark,
      fontWeight: studentDesign.typography.weights.semibold,
    },
    setupBadge: (type) => ({
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
      backgroundColor: type === 'F2F' ? '#F0FDF4' : (type === 'WFH' ? '#EFF6FF' : '#F5F3FF'),
      color: type === 'F2F' ? '#166534' : (type === 'WFH' ? '#1E40AF' : '#5B21B6'),
      border: `1.5px solid ${type === 'F2F' ? '#BBF7D0' : (type === 'WFH' ? '#BFDBFE' : '#DDD6FE')}`
    }),
    reminderBadge: (enabled) => ({
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
      backgroundColor: enabled ? '#EFF6FF' : '#F1F5F9',
      color: enabled ? '#1E40AF' : '#64748B',
      border: `1.5px solid ${enabled ? '#BFDBFE' : '#E2E8F0'}`
    }),
    dayPill: (active) => ({
      padding: '6px 12px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: active ? `${studentDesign.colors.primary}12` : '#F8FAFC',
      color: active ? studentDesign.colors.primary : '#94A3B8',
      border: `1.5px solid ${active ? studentDesign.colors.primary : '#E2E8F0'}`,
      transition: 'all 0.2s',
      userSelect: 'none'
    }),
    addButton: {
      padding: '12px 24px',
      borderRadius: '12px',
      backgroundColor: studentDesign.colors.primary,
      color: '#fff',
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    }
  };

  if (loading && !internship) return <PageLoader message="Loading company details..." />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      <div style={styles.header}>
        <h2 style={{ fontSize: '18px', fontWeight: studentDesign.typography.weights.semibold }}>Company & Schedule Information</h2>
        {hasCompany && (
          <div style={styles.actionButtons}>
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#EFF6FF' }}
              style={{ ...styles.button, ...styles.editButton }}
              onClick={() => setShowForm(true)}
            >
              <Edit3 size={16} /> Edit Profile & Schedule
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#fef2f2' }}
              style={{ ...styles.button, ...styles.removeButton }}
              onClick={handleRemove}
            >
              <Trash2 size={16} /> Remove
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!hasCompany ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={styles.emptyState}
          >
            <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '50%', color: studentDesign.colors.primary }}>
              <Building2 size={48} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700 }}>Hired? Tell us about it!</h3>
              <p style={{ margin: 0, color: studentDesign.colors.textMuted, maxWidth: '400px' }}>
                Fill in your company details & OJT everyday schedule to update your internship status and allow your OJT Adviser to track your progress.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.addButton}
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} /> Add Company Information
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="data"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={styles.mainCard}
          >
            {/* Header info */}
            <div style={styles.companyHeader}>
              <div style={styles.companyLogo}>
                <Building2 size={32} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={styles.companyName}>{internship.company_name}</h1>
                <div style={styles.location}>
                  <MapPin size={14} /> {internship.company_address || 'Address not set'}
                </div>
              </div>
              <div style={styles.verifiedBadge}>
                <CheckCircle size={14} /> Hired & Verified
              </div>
            </div>

            {/* Part 1: Company details */}
            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={12} /> Position / Role</span>
                <span style={styles.fieldValue}>{internship.position || 'Not Assigned'}</span>
              </div>
              <div style={styles.field}>
                <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={12} /> Department</span>
                <span style={styles.fieldValue}>{internship.department || 'Not Assigned'}</span>
              </div>
              
              <div style={styles.field}>
                <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> Supervisor Name</span>
                <span style={styles.fieldValue}>{internship.supervisor_name || 'Not Assigned'}</span>
              </div>
              <div style={styles.field}>
                <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> Supervisor Email</span>
                <span style={styles.fieldValue}>{internship.supervisor_email || 'Not Provided'}</span>
              </div>

              {internship.supervisor_phone && (
                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> Supervisor Phone</span>
                  <span style={styles.fieldValue}>{internship.supervisor_phone}</span>
                </div>
              )}
              {internship.industry && (
                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={12} /> Industry</span>
                  <span style={styles.fieldValue}>{internship.industry}</span>
                </div>
              )}

              {/* Recommendation recipient details */}
              {user?.user_metadata?.recipient_name && (
                <>
                  <div style={styles.field}>
                    <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={12} /> HTE Recipient Name</span>
                    <span style={styles.fieldValue}>{user.user_metadata.recipient_name}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={12} /> Recipient Position</span>
                    <span style={styles.fieldValue}>{user.user_metadata.recipient_title || 'Not Assigned'}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={12} /> Recipient Company</span>
                    <span style={styles.fieldValue}>{user.user_metadata.recipient_company || internship?.company_name || 'Not Configured'}</span>
                  </div>
                  {user.user_metadata.salutation && (
                    <div style={styles.field}>
                      <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> Salutation</span>
                      <span style={styles.fieldValue}>{user.user_metadata.salutation}</span>
                    </div>
                  )}
                  {user.user_metadata.recipient_address && (
                    <div style={{ ...styles.field, ...styles.fullRow }}>
                      <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12} /> Recipient Address</span>
                      <span style={styles.fieldValue}>{user.user_metadata.recipient_address}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ margin: '32px 0 24px 0', borderTop: `1px solid ${studentDesign.colors.border}` }} />

            {/* Part 2: OJT Schedule Details */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                <Clock size={16} style={{ color: studentDesign.colors.primary }} />
                OJT Schedule & Shift Settings
              </h3>
              
              <div style={styles.grid}>
                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={12} /> Setup Type</span>
                  <span style={styles.fieldValue}>
                    <span style={styles.setupBadge(user?.user_metadata?.ojt_setup)}>
                      {user?.user_metadata?.ojt_setup === 'F2F' ? '📍 Face-to-Face (F2F)' : 
                       user?.user_metadata?.ojt_setup === 'WFH' ? '🏠 Work From Home (WFH)' : 
                       user?.user_metadata?.ojt_setup === 'Hybrid' ? '🔄 Hybrid (F2F & WFH)' : 
                       '📍 Face-to-Face (F2F)'}
                    </span>
                  </span>
                </div>

                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> Standard Shift Duration</span>
                  <span style={styles.fieldValue}>
                    {user?.user_metadata?.usual_time_in ? formatShiftTime(user.user_metadata.usual_time_in) : '08:00 AM'} - {user?.user_metadata?.usual_time_out ? formatShiftTime(user.user_metadata.usual_time_out) : '05:00 PM'}
                  </span>
                </div>

                <div style={{ ...styles.field, ...styles.fullRow }}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> Work Days Active</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const isWorkDay = user?.user_metadata?.work_days?.includes(day);
                      return (
                        <span key={day} style={styles.dayPill(isWorkDay)}>
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> Shift Attendance Reminders</span>
                  <span style={styles.fieldValue}>
                    <span style={styles.reminderBadge(user?.user_metadata?.reminders_enabled)}>
                      {user?.user_metadata?.reminders_enabled ? '🔔 Enabled' : '🔕 Disabled'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ margin: '32px 0 24px 0', borderTop: `1px solid ${studentDesign.colors.border}` }} />

            {/* Part 3: Student Profile & Parent Details (Consent Defaults) */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                <User size={16} style={{ color: studentDesign.colors.primary }} />
                Student OJT Profile & Parent Defaults
              </h3>
              
              <div style={styles.grid}>
                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> Pronouns</span>
                  <span style={styles.fieldValue}>
                    {user?.user_metadata?.pronoun_subject === 'him' ? 'Male (him/he)' : 'Female (her/she)'}
                  </span>
                </div>

                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> Parent / Guardian</span>
                  <span style={styles.fieldValue}>
                    {user?.user_metadata?.parent_name || 'Not Configured'} {user?.user_metadata?.parent_relationship ? `(${user.user_metadata.parent_relationship})` : ''}
                  </span>
                </div>

                {user?.user_metadata?.parent_contact && (
                  <div style={styles.field}>
                    <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> Parent Contact No.</span>
                    <span style={styles.fieldValue}>{user.user_metadata.parent_contact}</span>
                  </div>
                )}

                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> Name of Witness</span>
                  <span style={styles.fieldValue}>{user?.user_metadata?.witness_name || 'Prof. Steven Bartolome'}</span>
                </div>

                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> OJT Start Date</span>
                  <span style={styles.fieldValue}>
                    {formatDisplayDate(user?.user_metadata?.start_date || '2026-02-01')}
                  </span>
                </div>

                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> OJT End Date</span>
                  <span style={styles.fieldValue}>
                    {formatDisplayDate(user?.user_metadata?.end_date || '2026-05-30')}
                  </span>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {showForm && (
        <CompanyInfoForm 
          userId={user.id}
          initialData={internship}
          onClose={() => setShowForm(false)}
          onSave={(newData) => setInternship(prev => ({ ...prev, ...newData }))}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </motion.div>
  );
};

export default CompanyInfo;
