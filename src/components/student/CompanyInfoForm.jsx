import React, { useState } from 'react';
import { X, Building2, Briefcase, User, Mail, Phone, MapPin, Loader2, Save } from 'lucide-react';
import { studentDesign } from '../../styles/StudentDesign';
import GoogleMapPicker from '../common/GoogleMapPicker';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const CompanyInfoForm = ({ initialData, onClose, onSave, userId }) => {
  const { user } = useAuth();
  const currentStage = user?.current_stage || 'PRE_INTERNSHIP';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: initialData?.company_name || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    industry: initialData?.industry || '',
    supervisor_name: initialData?.supervisor_name || '',
    supervisor_email: initialData?.supervisor_email || '',
    supervisor_phone: initialData?.supervisor_phone || '',
    company_address: initialData?.company_address || '',
    company_latitude: initialData?.company_latitude || null,
    company_longitude: initialData?.company_longitude || null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({
      ...prev,
      company_address: loc.address,
      company_latitude: loc.lat,
      company_longitude: loc.lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Handle Company record
      let companyId = initialData?.company_id;

      const companyPayload = {
        name: formData.company_name,
        address: formData.company_address,
        latitude: formData.company_latitude,
        longitude: formData.company_longitude,
        industry: formData.industry
      };

      if (companyId) {
        // Update existing company details
        const { error: updateCompErr } = await supabase
          .from('companies')
          .update(companyPayload)
          .eq('id', companyId);
        if (updateCompErr) throw updateCompErr;
      } else {
        // Create new company entry
        const { data: newComp, error: insertCompErr } = await supabase
          .from('companies')
          .insert(companyPayload)
          .select()
          .single();
        
        if (insertCompErr) throw insertCompErr;
        companyId = newComp.id;
      }

      // 2. Update Student Internship record with the link and specific placement details
      const { error: internError } = await supabase
        .from('student_internships')
        .update({
          company_id: companyId,
          position: formData.position,
          department: formData.department,
          supervisor_name: formData.supervisor_name,
          supervisor_email: formData.supervisor_email,
          supervisor_phone: formData.supervisor_phone,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', userId);

      if (internError) throw internError;

      onSave({ ...formData, company_id: companyId });
      onClose();
    } catch (err) {
      console.error('Error saving company info:', err);
      alert('Failed to save company information: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px'
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '20px',
      width: '100%', maxWidth: '700px',
      maxHeight: '90vh', overflowY: 'auto',
      boxShadow: studentDesign.shadows.premium,
      position: 'relative',
    },
    header: {
      padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10
    },
    content: { padding: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    formGroup: { marginBottom: '20px' },
    fullRow: { gridColumn: '1 / span 2' },
    label: { 
      display: 'block', fontSize: '13px', fontWeight: 600, 
      color: studentDesign.colors.textSecondary, marginBottom: '8px' 
    },
    input: {
      width: '100%', padding: '12px 16px', borderRadius: '12px',
      border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
      transition: 'border-color 0.2s', boxSizing: 'border-box'
    },
    footer: {
      padding: '20px 24px', borderTop: '1px solid #f1f5f9',
      display: 'flex', justifyContent: 'flex-end', gap: '12px',
      position: 'sticky', bottom: 0, backgroundColor: '#fff', zIndex: 10
    },
    btnPrimary: {
      padding: '12px 24px', borderRadius: '12px',
      backgroundColor: studentDesign.colors.primary, color: '#fff',
      border: 'none', fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px'
    },
    btnSecondary: {
      padding: '12px 24px', borderRadius: '12px',
      backgroundColor: '#f8fafc', color: studentDesign.colors.textMain,
      border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Company Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.content}>
            <div style={styles.grid}>
              <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                <label style={styles.label}>Company Name</label>
                <input 
                  name="company_name" required value={formData.company_name} onChange={handleChange}
                  placeholder="e.g. TechNova Solutions Inc." style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Position / Role</label>
                <input 
                  name="position" required value={formData.position} onChange={handleChange}
                  placeholder="e.g. Software Engineer Intern" style={styles.input} 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input 
                  name="department" value={formData.department} onChange={handleChange}
                  placeholder="e.g. Product Development" style={styles.input} 
                />
              </div>

              {currentStage !== 'PRE_INTERNSHIP' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Supervisor Name</label>
                    <input 
                      name="supervisor_name" value={formData.supervisor_name} onChange={handleChange}
                      placeholder="e.g. Engr. John Doe" style={styles.input} 
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Supervisor Email</label>
                    <input 
                      type="email" name="supervisor_email" value={formData.supervisor_email} onChange={handleChange}
                      placeholder="johndoe@company.com" style={styles.input} 
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Supervisor Phone (Optional)</label>
                    <input 
                      name="supervisor_phone" value={formData.supervisor_phone} onChange={handleChange}
                      placeholder="+63 912 345 6789" style={styles.input} 
                    />
                  </div>
                </>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Industry</label>
                <input 
                  name="industry" value={formData.industry} onChange={handleChange}
                  placeholder="e.g. Information Technology" style={styles.input} 
                />
              </div>

              <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                <label style={styles.label}>Company Address & Location</label>
                <GoogleMapPicker 
                  initialLocation={formData.company_latitude ? { lat: formData.company_latitude, lng: formData.company_longitude } : null}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={loading} style={styles.btnPrimary}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoForm;
