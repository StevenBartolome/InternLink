// src/pages/admin/UserManagementPage.jsx
import React, { useState } from 'react';
import { Users, Search, UserPlus, ShieldAlert, Edit, X, Save, Check, GraduationCap, BookOpen } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { internshipConfig } from '../../services/mocks/adminMockData';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Toast from '../../components/common/Toast';
import { supabase } from '../../services/supabaseClient';
import { Loader2 } from 'lucide-react';

const STAGE_COLORS = {
  PRE_INTERNSHIP:    { bg: '#dbeafe', color: '#1d4ed8' },
  DURING_INTERNSHIP: { bg: '#dcfce7', color: '#15803d' },
  POST_INTERNSHIP:   { bg: '#fef9c3', color: '#92400e' },
  COMPLETED:         { bg: '#f3e8ff', color: '#7e22ce' },
};

export default function UserManagementPage() {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [tab, setTab] = useState('students'); // 'students' | 'ojtHeads'
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [heads, setHeads] = useState([]);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newHead, setNewHead] = useState({ firstName: '', lastName: '', email: '', assignedCourse: 'BSIT' });
  const [isFetching, setIsFetching] = useState(true);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleToggleStudent = async (id, name, status) => {
    const next = status === 'Active' ? false : true;
    try {
      const { error } = await supabase.from('users').update({ is_active: next }).eq('id', id);
      if (error) throw error;
      setStudents(p => p.map(s => s.id === id ? { ...s, status: next ? 'Active' : 'Inactive' } : s));
      showToast(`${name} has been ${next ? 'reactivated' : 'deactivated'}.`, next ? 'success' : 'warning');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleHead = async (id, name, status) => {
    const next = status === 'Active' ? false : true;
    try {
      const { error } = await supabase.from('users').update({ is_active: next }).eq('id', id);
      if (error) throw error;
      setHeads(p => p.map(h => h.id === id ? { ...h, status: next ? 'Active' : 'Inactive' } : h));
      showToast(`${name} has been ${next ? 'reactivated' : 'deactivated'}.`, next ? 'success' : 'warning');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddOJTHead = async () => {
    if (!newHead.firstName.trim() || !newHead.lastName.trim() || !newHead.email.trim()) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/create-ojt-head', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHead)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create OJT Adviser');

      showToast(`Invitation sent to ${newHead.email}!`, 'success');
      setNewHead({ firstName: '', lastName: '', email: '', assignedCourse: 'BSIT' });
      setShowAddModal(false);
      // Refresh list
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsFetching(true);
      // Fetch students
      const { data: studentData, error: studentError } = await supabase
        .from('users')
        .select(`
          id, first_name, last_name, is_active,
          student_profiles ( student_id, year_level, program_id, programs ( code ) ),
          student_internships!student_internships_student_id_fkey (
            current_stage, ojt_head_id,
            users!student_internships_ojt_head_id_fkey ( first_name, last_name )
          )
        `)
        .eq('role', 'student');

      if (studentError) throw studentError;

      // Fetch emails from the backend endpoint
      let emailsMap = {};
      try {
        const emailsResponse = await fetch('/api/admin/users-emails');
        if (emailsResponse.ok) {
          const emailsData = await emailsResponse.json();
          emailsMap = emailsData.emails || {};
        } else {
          console.error('Failed to fetch emails');
        }
      } catch (e) {
        console.error('Error fetching emails:', e);
      }

      const formattedStudents = (studentData || []).map(s => {
        const profile = (Array.isArray(s.student_profiles) ? s.student_profiles[0] : s.student_profiles) || {};
        const internship = (Array.isArray(s.student_internships) ? s.student_internships[0] : s.student_internships) || {};
        const adviser = internship.users || {};
        
        return {
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          email: emailsMap[s.id] || 'N/A', // Pulled from backend endpoint
          studentId: profile.student_id || 'N/A',
          course: profile.programs?.code || 'N/A',
          currentStage: internship.current_stage || 'PRE_INTERNSHIP',
          status: s.is_active ? 'Active' : 'Inactive',
          adviserName: adviser.first_name ? `${adviser.first_name} ${adviser.last_name}` : 'Not Assigned'
        };
      });

      // Fetch OJT Advisers (role = 'ojt_head')
      const { data: headData, error: headError } = await supabase
        .from('users')
        .select(`
          id, first_name, last_name, is_active, created_at,
          programs ( code )
        `)
        .eq('role', 'ojt_head');

      if (headError) throw headError;

      // We might want to count students per head, but for now we will just put N/A or calculate if we fetched all students
      const formattedHeads = (headData || []).map(h => {
        const studentsCount = formattedStudents.filter(st => {
          // find the internship record for this student and see if it matches this head
          const rawStudent = studentData.find(rs => rs.id === st.id);
          const intern = rawStudent?.student_internships || [];
          const internRecord = Array.isArray(intern) ? intern[0] : intern;
          return internRecord?.ojt_head_id === h.id;
        }).length;

        return {
          id: h.id,
          name: `${h.first_name} ${h.last_name}`,
          email: emailsMap[h.id] || 'N/A',
          assignedCourse: h.programs?.code || 'N/A',
          studentsCount: studentsCount,
          dateCreated: new Date(h.created_at).toLocaleDateString(),
          status: h.is_active ? 'Active' : 'Inactive'
        };
      });

      setStudents(formattedStudents);
      setHeads(formattedHeads);
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Failed to fetch users', 'error');
    } finally {
      setIsFetching(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.includes(searchTerm)
  );

  const filteredHeads = heads.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.assignedCourse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courses = internshipConfig.map(c => c.course);

  const s = {
    th: { ...commonStyles.dashboardTableTh },
    td: { ...commonStyles.dashboardTableTd },
    badge: (bg, color) => ({ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: bg, color }),
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', borderRadius: '16px', padding: '32px', width: '460px', maxWidth: '95vw', boxShadow: theme.shadows.md, display: 'flex', flexDirection: 'column', gap: '16px' },
    input: { padding: '10px 14px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Add OJT Adviser Modal */}
      {showAddModal && (
        <div style={s.overlay} onClick={() => setShowAddModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: theme.colors.textMain }}>Create OJT Adviser Account</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', fontSize: '0.82rem', color: '#1d4ed8' }}>
              ℹ️ The OJT Adviser will be prompted to change their temporary password on first login.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '4px' }}>First Name</label>
                  <input style={s.input} placeholder="e.g. Maria Clara" value={newHead.firstName} onChange={e => setNewHead(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '4px' }}>Last Name</label>
                  <input style={s.input} placeholder="e.g. Santos" value={newHead.lastName} onChange={e => setNewHead(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '4px' }}>Email Address</label>
                <input type="email" style={s.input} placeholder="e.g. mcsantos@school.edu" value={newHead.email} onChange={e => setNewHead(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '4px' }}>Assigned Course</label>
                <select style={s.input} value={newHead.assignedCourse} onChange={e => setNewHead(p => ({ ...p, assignedCourse: e.target.value }))}>
                  {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button disabled={loading} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button disabled={loading} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, flex: 1 }} onClick={handleAddOJTHead}>
                <UserPlus size={15} /> {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>User Management</h1>
        {tab === 'ojtHeads' && (
          <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }} onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add OJT Adviser
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: theme.colors.bgSecondary, padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {[{ id: 'students', label: 'Students', icon: <GraduationCap size={15} /> }, { id: 'ojtHeads', label: 'OJT Advisers', icon: <BookOpen size={15} /> }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSearchTerm(''); }}
            style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? theme.colors.primary : theme.colors.textMuted,
              boxShadow: tab === t.id ? '0 2px 4px rgba(0,0,0,0.06)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ ...commonStyles.dashboardCard, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={18} color={theme.colors.textMuted} />
        <input placeholder={tab === 'students' ? 'Search by name, email, or student ID...' : 'Search by name, email, or course...'}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', backgroundColor: 'transparent' }}
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Students Table */}
      {tab === 'students' && (
        <div style={{ ...commonStyles.dashboardTableContainer }}>
          <table style={{ ...commonStyles.dashboardTable }}>
            <thead>
              <tr>
                <th style={s.th}>Student</th>
                <th style={s.th}>ID</th>
                <th style={s.th}>Course</th>
                <th style={s.th}>Adviser</th>
                <th style={s.th}>Stage</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader2 className="animate-spin mx-auto" size={24} color={theme.colors.primary} />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textMuted }}>
                    No students found.
                  </td>
                </tr>
              ) : filteredStudents.map(student => {
                const sc = STAGE_COLORS[student.currentStage] || {};
                return (
                  <tr key={student.id}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{student.email}</div>
                    </td>
                    <td style={s.td}><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{student.studentId}</span></td>
                    <td style={s.td}><span style={{ fontWeight: 600 }}>{student.course}</span></td>
                    <td style={s.td}><span style={{ color: theme.colors.textSecondary }}>{student.adviserName}</span></td>
                    <td style={s.td}>
                      <span style={s.badge(sc.bg, sc.color)}>{student.currentStage?.replace('_', ' ')}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.badge(student.status === 'Active' ? '#dcfce7' : '#fee2e2', student.status === 'Active' ? '#15803d' : '#dc2626')}>{student.status}</span>
                    </td>
                    <td style={s.td}>
                      <button title={student.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                        style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.danger }}
                        onClick={() => handleToggleStudent(student.id, student.name, student.status)}>
                        <ShieldAlert size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* OJT Advisers Table */}
      {tab === 'ojtHeads' && (
        <div style={{ ...commonStyles.dashboardTableContainer }}>
          <table style={{ ...commonStyles.dashboardTable }}>
            <thead>
              <tr>
                <th style={s.th}>OJT Adviser</th>
                <th style={s.th}>Assigned Course</th>
                <th style={s.th}>Students</th>
                <th style={s.th}>Created</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader2 className="animate-spin mx-auto" size={24} color={theme.colors.primary} />
                  </td>
                </tr>
              ) : filteredHeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textMuted }}>
                    No OJT Advisers found.
                  </td>
                </tr>
              ) : filteredHeads.map(head => (
                <tr key={head.id}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{head.name}</div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{head.email}</div>
                  </td>
                  <td style={s.td}>
                    <span style={s.badge('#dbeafe', '#1d4ed8')}>{head.assignedCourse}</span>
                  </td>
                  <td style={s.td}><span style={{ fontWeight: 700 }}>{head.studentsCount}</span></td>
                  <td style={s.td}>{head.dateCreated}</td>
                  <td style={s.td}>
                    <span style={s.badge(head.status === 'Active' ? '#dcfce7' : '#fee2e2', head.status === 'Active' ? '#15803d' : '#dc2626')}>{head.status}</span>
                  </td>
                  <td style={s.td}>
                    <button title={head.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                      style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.danger }}
                      onClick={() => handleToggleHead(head.id, head.name, head.status)}>
                      <ShieldAlert size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
