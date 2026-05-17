import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, 
  Calendar, GraduationCap, Building2,
  CheckCircle2, Clock, FileText,
  Award, Star, ExternalLink, Github,
  Loader2, Briefcase, Globe, Info
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar/ProgressBar';
import { supabase } from '../../services/supabaseClient';
import PageLoader from '../../components/common/PageLoader';

const StudentProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { showToast } = useOutletContext() || {};
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Section Editing State
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [savingSection, setSavingSection] = useState(false);

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, first_name, last_name,
          student_profiles (
            *,
            programs ( id, name, code, required_hours ),
            program_sections ( id, name )
          ),
          student_internships!student_id (
            *,
            companies ( id, name, address, industry )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      let userEmail = 'Not Provided';
      try {
        const emailRes = await fetch(`/api/admin/user-email/${id}`);
        if (emailRes.ok) {
          const emailData = await emailRes.json();
          userEmail = emailData.email || 'Not Provided';
        }
      } catch (err) {
        console.error('Failed to fetch email:', err);
      }

      const user = data || {};
      const profile = data.student_profiles?.[0] || data.student_profiles || {};
      const programs = profile.programs || {};
      const internship = data.student_internships?.[0] || data.student_internships || {};
      const company = internship.companies || {};
      const section = profile.program_sections || {};

      setStudent({
        uuid: data.id,
        studentId: profile.student_id || 'Not Set',
        name: `${user.first_name} ${user.last_name}`,
        email: userEmail,
        firstName: user.first_name,
        lastName: user.last_name,
        course: programs.name || 'Not Assigned',
        courseCode: programs.code || 'Not Assigned',
        yearLevel: profile.year_level || 'Not Set',
        academicYear: profile.academic_year || 'Not Set',
        semester: profile.semester || 'Not Set',
        ojtSubject: profile.ojt_subject_name || 'Not Set',
        status: internship.current_stage || 'PRE_INTERNSHIP',
        hoursRendered: internship.rendered_hours || 0,
        hoursRequired: programs.required_hours || 486,
        sectionId: profile.section_id,
        sectionName: section.name || 'Not Assigned',
        programId: programs.id,
        
        // Placement Info
        companyName: company.name || null,
        companyAddress: company.address || null,
        industry: company.industry || null,
        position: internship.position || 'Not Assigned',
        department: internship.department || 'Not Assigned',
        supervisor: internship.supervisor_name || 'Not Assigned',
        supervisorEmail: internship.supervisor_email || 'Not Provided',
        supervisorPhone: internship.supervisor_phone || 'Not Provided',
        startDate: internship.start_date ? new Date(internship.start_date).toLocaleDateString() : 'Not Set',
        estimatedEndDate: internship.estimated_end_date ? new Date(internship.estimated_end_date).toLocaleDateString() : 'Not Set',
        
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=random&size=128`
      });
    } catch (err) {
      console.error('Error fetching student profile:', err);
      if (showToast) showToast('Failed to load student profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  const fetchAvailableSections = useCallback(async (programId) => {
    if (!programId) return;
    try {
      const { data, error } = await supabase
        .from('program_sections')
        .select('*')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      setAvailableSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  }, []);

  const handleUpdateSection = async (newSectionId) => {
    try {
      setSavingSection(true);
      const { error } = await supabase
        .from('student_profiles')
        .update({ section_id: newSectionId })
        .eq('id', id);

      if (error) throw error;
      
      showToast('Section updated successfully');
      setIsEditingSection(false);
      fetchStudentData(); // Refresh
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingSection(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  useEffect(() => {
    if (student?.programId) {
      fetchAvailableSections(student.programId);
    }
  }, [student?.programId, fetchAvailableSections]);

  if (loading) return <PageLoader message="Loading student profile..." />;

  if (!student) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px', border: `1px solid ${theme.colors.border}` }}>
        <Info size={48} color={theme.colors.textMuted} style={{ marginBottom: '16px' }} />
        <h2 style={{ margin: '0 0 8px 0' }}>Student not found</h2>
        <p style={{ color: theme.colors.textMuted, marginBottom: '24px' }}>We couldn't find a student with the ID: {id}</p>
        <button onClick={() => navigate(-1)} style={commonStyles.dashboardBtn}>Go Back to Directory</button>
      </div>
    );
  }

  const styles = {
    container: { display: 'flex', flexDirection: 'column', gap: '24px' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' },
    backBtn: {
      display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none',
      color: theme.colors.textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
      padding: '8px 0', transition: 'color 0.2s'
    },
    profileCard: {
      ...commonStyles.dashboardCard,
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center', gap: '32px', padding: '32px',
    },
    avatar: {
      width: '120px', height: '120px', borderRadius: '30px',
      objectFit: 'cover', border: `4px solid ${theme.colors.bgAccent}`,
    },
    tabBar: {
      display: 'flex', gap: '24px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '2px',
    },
    tab: (isActive) => ({
      padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600,
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      borderBottom: `2px solid ${isActive ? theme.colors.primary : 'transparent'}`,
      cursor: 'pointer', transition: 'all 0.2s',
    }),
    grid: {
      display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px',
    },
    sectionCard: { ...commonStyles.dashboardCard, padding: '24px', height: '100%' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    iconBox: {
      width: '36px', height: '36px', borderRadius: '8px',
      backgroundColor: theme.colors.bgSecondary, color: theme.colors.primary,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    label: { fontSize: '0.75rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' },
    value: { fontSize: '0.95rem', fontWeight: 500, color: theme.colors.textMain },
  };

  return (
    <div style={styles.container}>
      <div>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back to Directory
        </button>
      </div>

      {/* Main Profile Header */}
      <div style={styles.profileCard}>
        <img src={student.avatar} alt={student.name} style={styles.avatar} />
        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{student.name}</h2>
            <StatusBadge status={student.status} />
          </div>
          <p style={{ color: theme.colors.textMuted, fontSize: '1rem', margin: '0 0 16px 0' }}>
            {student.studentId} • {student.courseCode} ({student.yearLevel}) • <span style={{ color: theme.colors.primary, fontWeight: 700 }}>{student.sectionName}</span>
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
              onClick={() => showToast && showToast(`Opening ${student.name}'s resume...`, 'info')}
            >
              <FileText size={16} /> Resume
            </button>
            <button 
              style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
              onClick={() => window.location.href = `mailto:${student.supervisorEmail}`}
            >
              <Mail size={16} /> Contact Student
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabBar}>
        <div style={styles.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Profile Overview</div>
        <div style={styles.tab(activeTab === 'internship')} onClick={() => setActiveTab('internship')}>Internship Progress</div>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Combined Info Card */}
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={20} color={theme.colors.primary} /> Academic & Contact Information
            </h3>
            
            <div style={styles.grid}>
              <div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Info size={18} /></div>
                  <div>
                    <div style={styles.label}>Official Student ID</div>
                    <div style={styles.value}>{student.studentId}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><GraduationCap size={18} /></div>
                  <div>
                    <div style={styles.label}>Current Year Level</div>
                    <div style={styles.value}>{student.yearLevel}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Globe size={18} /></div>
                  <div>
                    <div style={styles.label}>Full Program</div>
                    <div style={styles.value}>{student.course} ({student.courseCode})</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Star size={18} /></div>
                  <div>
                    <div style={styles.label}>Assigned Section</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isEditingSection ? (
                        <select 
                          style={{ ...commonStyles.input, padding: '4px 8px', fontSize: '0.85rem' }}
                          value={student.sectionId || ''}
                          onChange={(e) => handleUpdateSection(e.target.value)}
                          disabled={savingSection}
                        >
                          <option value="">Select Section...</option>
                          {availableSections.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <div style={{ ...styles.value, color: theme.colors.primary }}>{student.sectionName}</div>
                          <button 
                            onClick={() => setIsEditingSection(true)}
                            style={{ background: 'none', border: 'none', color: theme.colors.primary, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Calendar size={18} /></div>
                  <div>
                    <div style={styles.label}>Academic Period</div>
                    <div style={styles.value}>AY {student.academicYear} • {student.semester}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><FileText size={18} /></div>
                  <div>
                    <div style={styles.label}>OJT Subject</div>
                    <div style={styles.value}>{student.ojtSubject}</div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.iconBox}><Mail size={18} /></div>
                  <div>
                    <div style={styles.label}>Email Address</div>
                    <div style={styles.value}>{student.email || 'Not Provided'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'internship' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Progress Overview */}
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0' }}>OJT Hours Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={styles.value}>{student.hoursRendered} of {student.hoursRequired} Hours Completed</span>
              <span style={{ ...styles.value, color: theme.colors.primary }}>
                {Math.round((student.hoursRendered / student.hoursRequired) * 100)}%
              </span>
            </div>
            <ProgressBar value={student.hoursRendered} max={student.hoursRequired} size="lg" />
          </div>

          {/* Placement Details */}
          <div style={styles.grid}>
            <div style={styles.sectionCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color={theme.colors.primary} /> Company Information
              </h3>
              {student.companyName ? (
                <>
                  <div style={styles.infoItem}>
                    <div style={styles.iconBox}><Building2 size={18} /></div>
                    <div>
                      <div style={styles.label}>Company Name</div>
                      <div style={styles.value}>{student.companyName}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.iconBox}><MapPin size={18} /></div>
                    <div>
                      <div style={styles.label}>Address</div>
                      <div style={{ ...styles.value, fontSize: '0.85rem' }}>{student.companyAddress}</div>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.iconBox}><Globe size={18} /></div>
                    <div>
                      <div style={styles.label}>Industry</div>
                      <div style={styles.value}>{student.industry || 'Not Specified'}</div>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: theme.colors.textMuted, textAlign: 'center', padding: '20px' }}>Not yet placed in a company.</p>
              )}
            </div>

            <div style={styles.sectionCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color={theme.colors.primary} /> Placement Details
              </h3>
              <div style={styles.infoItem}>
                <div style={styles.iconBox}><Award size={18} /></div>
                <div>
                  <div style={styles.label}>Supervisor</div>
                  <div style={styles.value}>{student.supervisor}</div>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.iconBox}><Briefcase size={18} /></div>
                <div>
                  <div style={styles.label}>Position / Role</div>
                  <div style={styles.value}>{student.position}</div>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.iconBox}><Mail size={18} /></div>
                <div>
                  <div style={styles.label}>Supervisor Contact</div>
                  <div style={styles.value}>{student.supervisorEmail}</div>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '24px 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color={theme.colors.primary} /> Internship Duration
              </h3>
              <div style={styles.infoItem}>
                <div style={styles.iconBox}><Calendar size={18} /></div>
                <div>
                  <div style={styles.label}>Start Date</div>
                  <div style={styles.value}>{student.startDate}</div>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.iconBox}><Calendar size={18} /></div>
                <div>
                  <div style={styles.label}>Estimated End Date</div>
                  <div style={styles.value}>{student.estimatedEndDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
