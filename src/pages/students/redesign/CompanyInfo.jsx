import React, { useState, useEffect } from 'react';
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
  Globe
} from 'lucide-react';
import { studentDesign } from '../../../styles/StudentDesign';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../services/supabaseClient';
import CompanyInfoForm from '../../../components/student/CompanyInfoForm';

const CompanyInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
  }, [user?.id]);

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your company information? This will clear all hired details.')) return;
    
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
    } catch (err) {
      console.error('Error removing company info:', err);
      alert('Failed to remove company information.');
    } finally {
      setLoading(false);
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
      color: studentDesign.colors.textMuted,
      border: `1px solid ${studentDesign.colors.border}`,
    },
    removeButton: {
      color: '#ef4444',
      border: '1px solid #fee2e2',
    },
    mainCard: {
      ...studentDesign.card,
      position: 'relative',
      overflow: 'hidden',
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
      borderRadius: '16px',
      backgroundColor: studentDesign.colors.primaryLight,
      color: studentDesign.colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
      padding: '6px 12px',
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
      gap: '32px',
      paddingTop: '24px',
      borderTop: `1px solid ${studentDesign.colors.border}`,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    fieldLabel: {
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: studentDesign.colors.textMuted,
      fontWeight: studentDesign.typography.weights.semibold,
    },
    fieldValue: {
      fontSize: '15px',
      color: studentDesign.colors.textDark,
      fontWeight: studentDesign.typography.weights.medium,
    },
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

  if (loading && !internship) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 className="animate-spin" size={40} color={studentDesign.colors.primary} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      <div style={styles.header}>
        <h2 style={{ fontSize: '18px', fontWeight: studentDesign.typography.weights.semibold }}>Company Information</h2>
        {hasCompany && (
          <div style={styles.actionButtons}>
            <motion.button 
              whileHover={{ backgroundColor: '#F8FAFC' }}
              style={{ ...styles.button, ...styles.editButton }}
              onClick={() => setShowForm(true)}
            >
              <Edit3 size={16} /> Edit Info
            </motion.button>
            <motion.button 
              whileHover={{ backgroundColor: '#fef2f2' }}
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
                Fill in your company details to update your internship status and allow your OJT Adviser to track your progress.
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

            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={12} /> Position / Role</span>
                <span style={styles.fieldValue}>{internship.position || 'Not Assigned'}</span>
              </div>
              <div style={styles.field}>
                <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={12} /> Department</span>
                <span style={styles.fieldValue}>{internship.department || 'Not Assigned'}</span>
              </div>
              {internship.is_deployed && (
                <>
                  <div style={styles.field}>
                    <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> Supervisor Name</span>
                    <span style={styles.fieldValue}>{internship.supervisor_name || 'Not Assigned'}</span>
                  </div>
                  <div style={styles.field}>
                    <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> Supervisor Email</span>
                    <span style={styles.fieldValue}>{internship.supervisor_email || 'Not Provided'}</span>
                  </div>
                </>
              )}
              {internship.industry && (
                <div style={styles.field}>
                  <span style={{ ...styles.fieldLabel, display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={12} /> Industry</span>
                  <span style={styles.fieldValue}>{internship.industry}</span>
                </div>
              )}
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
    </motion.div>
  );
};

export default CompanyInfo;
