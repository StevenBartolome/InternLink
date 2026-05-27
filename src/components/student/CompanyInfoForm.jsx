import React, { useState } from 'react';
import { 
  X, Building2, Briefcase, User, Mail, Phone, MapPin, Loader2, Save, 
  Calendar, Clock, ChevronRight, ChevronLeft, AlertCircle, BellRing,
  HeartHandshake, Landmark, FileSignature, Sparkles
} from 'lucide-react';
import { studentDesign } from '../../styles/StudentDesign';
import GoogleMapPicker from '../common/GoogleMapPicker';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import Toast from '../common/Toast';

const CompanyInfoForm = ({ initialData, onClose, onSave, userId }) => {
  const { user } = useAuth();
  const currentStage = user?.current_stage || 'PRE_INTERNSHIP';
  const isDeployed = initialData?.is_deployed || user?.is_deployed || false;
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Part 1: Company details
    company_name: initialData?.company_name || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    industry: initialData?.industry || '',
    company_address: initialData?.company_address || '',
    company_latitude: initialData?.company_latitude || null,
    company_longitude: initialData?.company_longitude || null,

    // Part 1: HTE Recipient fields (for Recommendation Letter)
    recipient_name: user?.user_metadata?.recipient_name || '',
    recipient_title: user?.user_metadata?.recipient_title || '',
    recipient_company: user?.user_metadata?.recipient_company || '',
    recipient_address: user?.user_metadata?.recipient_address || '',
    salutation: user?.user_metadata?.salutation || '',

    // Part 2: Supervisor details
    supervisor_name: initialData?.supervisor_name || '',
    supervisor_email: initialData?.supervisor_email || '',
    supervisor_phone: initialData?.supervisor_phone || '',

    // Part 2: Work Schedule details
    ojt_setup: user?.user_metadata?.ojt_setup || 'F2F',
    work_days: user?.user_metadata?.work_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    usual_time_in: user?.user_metadata?.usual_time_in || '08:00',
    usual_time_out: user?.user_metadata?.usual_time_out || '17:00',
    reminders_enabled: user?.user_metadata?.reminders_enabled !== undefined ? user?.user_metadata?.reminders_enabled : false,

    // Part 2: Student Profile & Parent details (for Consent Form)
    pronoun_subject: user?.user_metadata?.pronoun_subject || 'her',
    parent_name: user?.user_metadata?.parent_name || '',
    parent_relationship: user?.user_metadata?.parent_relationship || 'Mother',
    parent_contact: user?.user_metadata?.parent_contact || '',
    witness_name: user?.user_metadata?.witness_name || 'Prof. Steven Bartolome',
    start_date: user?.user_metadata?.start_date || '',
    end_date: user?.user_metadata?.end_date || '',
    date_signed: user?.user_metadata?.date_signed || new Date().toISOString().split('T')[0]
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const current = prev.work_days || [];
      if (current.includes(day)) {
        return { ...prev, work_days: current.filter(d => d !== day) };
      } else {
        return { ...prev, work_days: [...current, day] };
      }
    });
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({
      ...prev,
      company_address: loc.address,
      company_latitude: loc.lat,
      company_longitude: loc.lng,
      // Auto-prefill recipient address if empty
      recipient_address: prev.recipient_address || loc.address
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      setToast({ message: '⚠️ Please enter the Company Name.', type: 'warning' });
      return;
    }
    if (!formData.position) {
      setToast({ message: '⚠️ Please enter your Position/Role.', type: 'warning' });
      return;
    }
    if (!formData.company_address) {
      setToast({ message: '⚠️ Please set the Company Address.', type: 'warning' });
      return;
    }
    setStep(2);
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

      if (!isDeployed) {
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
      }

      // 2. Update Student Internship record with placement & supervisor info
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

      // 3. Update Auth User Metadata with schedule and document defaults
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          // Schedule configuration
          ojt_setup: formData.ojt_setup,
          work_days: formData.work_days,
          usual_time_in: formData.usual_time_in,
          usual_time_out: formData.usual_time_out,
          reminders_enabled: formData.reminders_enabled,

          // Document generation default fields (Student profile specific)
          pronoun_subject: formData.pronoun_subject,
          parent_name: formData.parent_name,
          parent_relationship: formData.parent_relationship,
          parent_contact: formData.parent_contact,
          witness_name: formData.witness_name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          date_signed: formData.date_signed,

          // Document generation default fields (HTE Recipient specific)
          recipient_name: formData.recipient_name,
          recipient_title: formData.recipient_title,
          recipient_company: formData.recipient_company,
          recipient_address: formData.recipient_address,
          salutation: formData.salutation
        }
      });

      if (metadataError) throw metadataError;

      onSave({ 
        ...formData, 
        company_id: companyId 
      });
      
      setToast({ message: '✨ Internship profile & document defaults updated successfully!', type: 'success' });
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Error saving profile settings & document defaults:', err);
      setToast({ message: 'Failed to save information: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px'
    },
    modal: {
      backgroundColor: '#fff', borderRadius: '24px',
      width: '100%', maxWidth: '780px',
      maxHeight: '92vh', overflowY: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      position: 'relative',
      display: 'flex', flexDirection: 'column'
    },
    header: {
      padding: '24px 28px', borderBottom: '1px solid #f1f5f9',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10
    },
    titleSection: {
      display: 'flex', flexDirection: 'column', gap: '4px'
    },
    modalTitle: {
      fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0
    },
    modalSubtitle: {
      fontSize: '13px', color: '#64748b', margin: 0
    },
    closeBtn: {
      background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b',
      width: '36px', height: '36px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
      transition: 'all 0.2s'
    },
    progressBarContainer: {
      padding: '0 28px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9'
    },
    progressBar: {
      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0'
    },
    stepDot: (active, done) => ({
      width: '28px', height: '28px', borderRadius: '50%',
      backgroundColor: active ? studentDesign.colors.primary : (done ? `${studentDesign.colors.primary}20` : '#f1f5f9'),
      color: active ? '#fff' : (done ? studentDesign.colors.primary : '#94a3b8'),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 700, transition: 'all 0.3s'
    }),
    stepLabel: (active) => ({
      fontSize: '13px', fontWeight: active ? 700 : 500,
      color: active ? '#0f172a' : '#64748b'
    }),
    stepConnector: (done) => ({
      flex: 1, height: '3px',
      backgroundColor: done ? studentDesign.colors.primary : '#f1f5f9',
      transition: 'all 0.3s'
    }),
    content: { padding: '28px', flex: 1 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    formGroup: { marginBottom: '6px' },
    fullRow: { gridColumn: '1 / span 2' },
    sectionTitle: {
      fontSize: '13px', fontWeight: 800, color: studentDesign.colors.primary,
      textTransform: 'uppercase', letterSpacing: '0.75px', margin: '12px 0 6px 0',
      gridColumn: '1 / span 2', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '6px',
      display: 'flex', alignItems: 'center', gap: '8px'
    },
    label: { 
      display: 'block', fontSize: '13px', fontWeight: 650, 
      color: '#334155', marginBottom: '8px' 
    },
    input: {
      width: '100%', padding: '13px 18px', borderRadius: '14px',
      border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
      color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box',
      backgroundColor: '#f8fafc'
    },
    inputActive: {
      border: `1.5px solid ${studentDesign.colors.primary}`,
      backgroundColor: '#fff',
      boxShadow: `0 0 0 4px ${studentDesign.colors.primary}10`
    },
    inputDisabled: {
      backgroundColor: '#f1f5f9',
      color: '#64748B',
      cursor: 'not-allowed',
      borderColor: '#e2e8f0'
    },
    setupSelect: {
      width: '100%', padding: '13px 18px', borderRadius: '14px',
      border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none',
      backgroundColor: '#fff', color: '#0f172a', cursor: 'pointer'
    },
    dayBadgesGrid: {
      display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px'
    },
    dayBadge: (isSelected) => ({
      padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s',
      border: `1.5px solid ${isSelected ? studentDesign.colors.primary : '#e2e8f0'}`,
      backgroundColor: isSelected ? `${studentDesign.colors.primary}10` : '#fff',
      color: isSelected ? studentDesign.colors.primary : '#475569',
      boxShadow: isSelected ? `0 2px 8px ${studentDesign.colors.primary}15` : 'none'
    }),
    toggleContainer: {
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '16px', borderRadius: '16px', backgroundColor: '#f8fafc',
      border: '1.5px solid #e2e8f0', cursor: 'pointer', marginTop: '4px'
    },
    warningCallout: {
      backgroundColor: '#fef3c7', borderLeft: '4px solid #d97706',
      borderRadius: '12px', padding: '14px 18px', display: 'flex',
      gap: '12px', alignItems: 'flex-start', margin: '12px 0 24px 0'
    },
    warningText: {
      fontSize: '12.5px', color: '#92400e', margin: 0, lineHeight: 1.5
    },
    footer: {
      padding: '24px 28px', borderTop: '1px solid #f1f5f9',
      display: 'flex', justifyContent: 'flex-end', gap: '14px',
      position: 'sticky', bottom: 0, backgroundColor: '#fff', zIndex: 10
    },
    btnPrimary: {
      padding: '13px 26px', borderRadius: '14px',
      backgroundColor: studentDesign.colors.primary, color: '#fff',
      border: 'none', fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
      transition: 'all 0.2s'
    },
    btnSecondary: {
      padding: '13px 26px', borderRadius: '14px',
      backgroundColor: '#fff', color: '#334155',
      border: '1.5px solid #e2e8f0', fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h2 style={styles.modalTitle}>Configure Internship Profile</h2>
            <p style={styles.modalSubtitle}>Step {step} of 2 — Set up your HTE placement and OJT schedule</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} className="hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Progress Step Bar */}
        <div style={styles.progressBarContainer}>
          <div style={styles.progressBar}>
            <div style={styles.stepDot(step === 1, step > 1)}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span style={styles.stepLabel(step === 1)}>Placement Details</span>
            
            <div style={styles.stepConnector(step > 1)} />
            
            <div style={styles.stepDot(step === 2, false)}>2</div>
            <span style={styles.stepLabel(step === 2)}>Schedule & Supervisor</span>
          </div>
        </div>

        <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
          <div style={styles.content}>
            
            {/* STEP 1: Company Placement & HTE Recipient Details */}
            {step === 1 && (
              <div style={styles.grid}>
                
                <div style={styles.sectionTitle}>
                  <Building2 size={16} /> Placement Information
                </div>

                <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                  <label style={styles.label}>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      name="company_name" 
                      required 
                      value={formData.company_name} 
                      onChange={handleChange}
                      placeholder="e.g. TechNova Solutions Inc." 
                      style={{ 
                        ...styles.input, 
                        paddingLeft: '48px', 
                        ...(isDeployed ? styles.inputDisabled : {}),
                        ...(!isDeployed && formData.company_name ? styles.inputActive : {}) 
                      }} 
                      disabled={isDeployed}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Position / Role <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      name="position" 
                      required 
                      value={formData.position} 
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer Intern" 
                      style={{ 
                        ...styles.input, 
                        paddingLeft: '48px', 
                        ...(isDeployed ? styles.inputDisabled : {}),
                        ...(!isDeployed && formData.position ? styles.inputActive : {}) 
                      }} 
                      disabled={isDeployed}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Department</label>
                  <input 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange}
                    placeholder="e.g. Product Engineering" 
                    style={{ 
                      ...styles.input, 
                      ...(isDeployed ? styles.inputDisabled : {}),
                      ...(!isDeployed && formData.department ? styles.inputActive : {}) 
                    }} 
                    disabled={isDeployed}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Industry</label>
                  <input 
                    name="industry" 
                    value={formData.industry} 
                    onChange={handleChange}
                    placeholder="e.g. Information Technology" 
                    style={{ 
                      ...styles.input, 
                      ...(isDeployed ? styles.inputDisabled : {}),
                      ...(!isDeployed && formData.industry ? styles.inputActive : {}) 
                    }} 
                    disabled={isDeployed}
                  />
                </div>

                <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                  <label style={styles.label}>Company Address & Map Pin Location <span style={{ color: '#ef4444' }}>*</span></label>
                  {isDeployed ? (
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                      <input 
                        disabled 
                        value={formData.company_address || 'No Address Set'} 
                        style={{ ...styles.input, ...styles.inputDisabled, paddingLeft: '48px' }} 
                      />
                    </div>
                  ) : (
                    <GoogleMapPicker 
                      initialLocation={formData.company_latitude ? { lat: formData.company_latitude, lng: formData.company_longitude } : null}
                      onLocationSelect={handleLocationSelect}
                    />
                  )}
                </div>

                <div style={styles.sectionTitle}>
                  <Landmark size={16} /> HTE Recipient Details (Recommendation Letter Defaults)
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Name</label>
                  <input 
                    name="recipient_name" 
                    value={formData.recipient_name} 
                    onChange={handleChange}
                    placeholder="e.g. ENGR. JOSEPHINE B. SALAZAR" 
                    style={{ ...styles.input, ...(formData.recipient_name ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Position</label>
                  <input 
                    name="recipient_title" 
                    value={formData.recipient_title} 
                    onChange={handleChange}
                    placeholder="e.g. Regional Manager / HR Lead" 
                    style={{ ...styles.input, ...(formData.recipient_title ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Company</label>
                  <input 
                    name="recipient_company" 
                    value={formData.recipient_company} 
                    onChange={handleChange}
                    placeholder="Defaults to Company Name if left empty" 
                    style={{ ...styles.input, ...(formData.recipient_company ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Salutation</label>
                  <input 
                    name="salutation" 
                    value={formData.salutation} 
                    onChange={handleChange}
                    placeholder="e.g. Dear Mrs. De Guia: / Sir:" 
                    style={{ ...styles.input, ...(formData.salutation ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Address</label>
                  <input 
                    name="recipient_address" 
                    value={formData.recipient_address} 
                    onChange={handleChange}
                    placeholder="Defaults to HTE address if left empty" 
                    style={{ ...styles.input, ...(formData.recipient_address ? styles.inputActive : {}) }} 
                  />
                </div>

              </div>
            )}

            {/* STEP 2: Supervisor, Schedule & Student Profile details */}
            {step === 2 && (
              <div style={styles.grid}>
                
                <div style={styles.sectionTitle}>
                  <User size={16} /> Supervisor Contact Info
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Supervisor Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      name="supervisor_name" 
                      value={formData.supervisor_name} 
                      onChange={handleChange}
                      placeholder="e.g. Engr. John Doe" 
                      style={{ ...styles.input, paddingLeft: '48px', ...(formData.supervisor_name ? styles.inputActive : {}) }} 
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Supervisor Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      type="email" 
                      name="supervisor_email" 
                      value={formData.supervisor_email} 
                      onChange={handleChange}
                      placeholder="johndoe@company.com" 
                      style={{ ...styles.input, paddingLeft: '48px', ...(formData.supervisor_email ? styles.inputActive : {}) }} 
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Supervisor Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      name="supervisor_phone" 
                      value={formData.supervisor_phone} 
                      onChange={handleChange}
                      placeholder="+63 912 345 6789" 
                      style={{ ...styles.input, paddingLeft: '48px', ...(formData.supervisor_phone ? styles.inputActive : {}) }} 
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>OJT Setup Setup Type</label>
                  <select 
                    name="ojt_setup"
                    value={formData.ojt_setup}
                    onChange={handleChange}
                    style={styles.setupSelect}
                  >
                    <option value="F2F">Face-to-Face (F2F)</option>
                    <option value="WFH">Work From Home (WFH)</option>
                    <option value="Hybrid">Hybrid (F2F & WFH)</option>
                  </select>
                </div>

                {/* Everyday Schedule */}
                <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                  <label style={styles.label}>Everyday Work Schedule (Days Active)</label>
                  <div style={styles.dayBadgesGrid}>
                    {daysOfWeek.map(day => {
                      const isSelected = formData.work_days.includes(day);
                      return (
                        <div 
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          style={styles.dayBadge(isSelected)}
                          className="hover:scale-105"
                        >
                          {day.slice(0, 3)}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Standard Shift Times */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Standard Shift Time In</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      type="time" 
                      name="usual_time_in" 
                      value={formData.usual_time_in} 
                      onChange={handleChange}
                      style={{ ...styles.input, paddingLeft: '48px', ...styles.inputActive }} 
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Standard Shift Time Out</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
                    <input 
                      type="time" 
                      name="usual_time_out" 
                      value={formData.usual_time_out} 
                      onChange={handleChange}
                      style={{ ...styles.input, paddingLeft: '48px', ...styles.inputActive }} 
                    />
                  </div>
                </div>

                {/* Reminders Toggle */}
                <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                  <div 
                    style={styles.toggleContainer}
                    onClick={() => setFormData(prev => ({ ...prev, reminders_enabled: !prev.reminders_enabled }))}
                  >
                    <BellRing size={20} style={{ color: formData.reminders_enabled ? studentDesign.colors.primary : '#64748b' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Email Reminders</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Remind me to clock in and clock out on my work days</p>
                    </div>
                    <input 
                      type="checkbox" 
                      name="reminders_enabled"
                      checked={formData.reminders_enabled}
                      onChange={handleChange}
                      onClick={e => e.stopPropagation()}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={styles.sectionTitle}>
                  <FileSignature size={16} /> Student OJT Profile & Parent Details (Consent Defaults)
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Pronouns (Subject)</label>
                  <select 
                    name="pronoun_subject"
                    value={formData.pronoun_subject}
                    onChange={handleChange}
                    style={styles.setupSelect}
                  >
                    <option value="her">Female (her/she)</option>
                    <option value="him">Male (him/he)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Parent / Guardian Name</label>
                  <input 
                    name="parent_name" 
                    value={formData.parent_name} 
                    onChange={handleChange}
                    placeholder="e.g. Maria Clara G. Ortiz" 
                    style={{ ...styles.input, ...(formData.parent_name ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Relationship to Intern</label>
                  <input 
                    name="parent_relationship" 
                    value={formData.parent_relationship} 
                    onChange={handleChange}
                    placeholder="e.g. Mother / Father" 
                    style={{ ...styles.input, ...(formData.parent_relationship ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Parent Contact No.</label>
                  <input 
                    name="parent_contact" 
                    value={formData.parent_contact} 
                    onChange={handleChange}
                    placeholder="e.g. 09171234567" 
                    style={{ ...styles.input, ...(formData.parent_contact ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Name of Witness</label>
                  <input 
                    name="witness_name" 
                    value={formData.witness_name} 
                    onChange={handleChange}
                    placeholder="e.g. Prof. Steven Bartolome" 
                    style={{ ...styles.input, ...(formData.witness_name ? styles.inputActive : {}) }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>OJT Start Date</label>
                  <input 
                    type="date"
                    name="start_date" 
                    value={formData.start_date} 
                    onChange={handleChange}
                    style={{ ...styles.input, ...styles.inputActive }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>OJT End Date</label>
                  <input 
                    type="date"
                    name="end_date" 
                    value={formData.end_date} 
                    onChange={handleChange}
                    style={{ ...styles.input, ...styles.inputActive }} 
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Date Signed</label>
                  <input 
                    type="date"
                    name="date_signed" 
                    value={formData.date_signed} 
                    onChange={handleChange}
                    style={{ ...styles.input, ...styles.inputActive }} 
                  />
                </div>

                {/* Overtime Policy Info */}
                <div style={{ ...styles.formGroup, ...styles.fullRow }}>
                  <div style={styles.warningCallout}>
                    <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                    <div style={styles.warningText}>
                      <strong>OJT Overtime Policy:</strong> Standard daily overtime is capped at a maximum of <strong>2 hours</strong>. 
                      Furthermore, in compliance with university rules, no hours rendered after <strong>7:00 PM (19:00)</strong> will be credited under any circumstances.
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer Navigation Buttons */}
          <div style={styles.footer}>
            {step === 2 && (
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={styles.btnSecondary}
                disabled={loading}
              >
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            
            <button 
              type="button" 
              onClick={onClose} 
              style={{ ...styles.btnSecondary, display: step === 1 ? 'flex' : 'none' }}
            >
              Cancel
            </button>

            {step === 1 ? (
              <button type="submit" style={styles.btnPrimary}>
                Next Step
                <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" disabled={loading} style={styles.btnPrimary}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save and Complete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInfoForm;
