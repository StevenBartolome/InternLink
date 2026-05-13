import React, { useState, useEffect } from 'react';
import { Building2, GraduationCap, Plus, Edit2, Trash2, Save, X, ChevronRight, ChevronDown } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { supabase } from '../../services/supabaseClient';
import Toast from '../../components/common/Toast';

const DepartmentProgramPage = () => {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedDept, setExpandedDept] = useState(null);
  
  // Modals / Editing state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', department_id: '', required_hours: 486 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: depts, error: deptsError } = await supabase.from('departments').select('*').order('name');
      const { data: progs, error: progsError } = await supabase.from('programs').select('*').order('name');
      
      if (deptsError) throw deptsError;
      if (progsError) throw progsError;
      
      setDepartments(depts);
      setPrograms(progs);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSaveDepartment = async () => {
    try {
      if (!formData.name || !formData.code) return showToast('Please fill all fields', 'error');
      
      if (editingItem) {
        const { error } = await supabase.from('departments').update({ name: formData.name, code: formData.code }).eq('id', editingItem.id);
        if (error) throw error;
        showToast('Department updated successfully');
      } else {
        const { error } = await supabase.from('departments').insert([{ name: formData.name, code: formData.code }]);
        if (error) throw error;
        showToast('Department added successfully');
      }
      
      setIsDeptModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', code: '' });
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure? This will also delete all programs under this department.')) return;
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      showToast('Department deleted');
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleSaveProgram = async () => {
    try {
      if (!formData.name || !formData.code || !formData.department_id) return showToast('Please fill all fields', 'error');
      
      const payload = {
        name: formData.name,
        code: formData.code,
        department_id: formData.department_id,
        required_hours: parseInt(formData.required_hours)
      };

      if (editingItem) {
        const { error } = await supabase.from('programs').update(payload).eq('id', editingItem.id);
        if (error) throw error;
        showToast('Program updated successfully');
      } else {
        const { error } = await supabase.from('programs').insert([payload]);
        if (error) throw error;
        showToast('Program added successfully');
      }
      
      setIsProgModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', code: '', department_id: '', required_hours: 486 });
      fetchData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

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
    card: {
      ...commonStyles.dashboardCard,
      padding: '0',
      overflow: 'hidden',
    },
    deptHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: isOpen ? theme.colors.bgSecondary : '#fff',
      cursor: 'pointer',
      borderBottom: isOpen ? `1px solid ${theme.colors.border}` : 'none',
      transition: 'background-color 0.2s',
    }),
    programRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 24px 12px 64px',
      borderBottom: `1px solid ${theme.colors.bgSecondary}`,
      backgroundColor: '#fff',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '32px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: theme.shadows.lg,
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Departments & Programs</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Manage the academic structure of the institution.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => { setEditingItem(null); setFormData({ name: '', code: '' }); setIsDeptModalOpen(true); }}
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
          >
            <Building2 size={18} /> Add Department
          </button>
          <button 
            onClick={() => { setEditingItem(null); setFormData({ name: '', code: '', department_id: '', required_hours: 486 }); setIsProgModalOpen(true); }}
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
          >
            <GraduationCap size={18} /> Add Program
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.colors.textMuted }}>Loading academic structure...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {departments.map(dept => {
            const isOpen = expandedDept === dept.id;
            const deptPrograms = programs.filter(p => p.department_id === dept.id);
            
            return (
              <div key={dept.id} style={styles.card}>
                <div style={styles.deptHeader(isOpen)} onClick={() => setExpandedDept(isOpen ? null : dept.id)}>
                  <div style={{ marginRight: '16px', color: theme.colors.textMuted }}>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: theme.colors.textMain }}>{dept.name}</div>
                    <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Code: {dept.code} • {deptPrograms.length} Programs</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingItem(dept); setFormData({ name: dept.name, code: dept.code }); setIsDeptModalOpen(true); }}
                      style={{ background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', padding: '8px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dept.id); }}
                      style={{ background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer', padding: '8px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div>
                    {deptPrograms.length === 0 ? (
                      <div style={{ padding: '24px 64px', color: theme.colors.textMuted, fontSize: '0.875rem', fontStyle: 'italic' }}>
                        No programs added to this department yet.
                      </div>
                    ) : (
                      deptPrograms.map(prog => (
                        <div key={prog.id} style={styles.programRow}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: theme.colors.textMain }}>{prog.name}</div>
                            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{prog.code} • {prog.required_hours} Required Hours</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => { setEditingItem(prog); setFormData({ ...prog }); setIsProgModalOpen(true); }}
                              style={{ background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', padding: '6px' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={async () => {
                                if (!window.confirm('Delete this program?')) return;
                                try {
                                  await supabase.from('programs').delete().eq('id', prog.id);
                                  showToast('Program deleted');
                                  fetchData();
                                } catch (error) {
                                  showToast(error.message, 'error');
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer', padding: '6px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{editingItem ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setIsDeptModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Department Name</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. School of Engineering"
                  style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Department Code</label>
                <input 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. SET"
                  style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <button onClick={handleSaveDepartment} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, marginTop: '12px' }}>
                <Save size={18} /> {editingItem ? 'Update Department' : 'Save Department'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal */}
      {isProgModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{editingItem ? 'Edit Program' : 'Add Program'}</h2>
              <button onClick={() => setIsProgModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Department</label>
                <select 
                  value={formData.department_id}
                  onChange={e => setFormData({...formData, department_id: e.target.value})}
                  style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Program Name</label>
                <input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. BS Information Technology"
                  style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Code</label>
                  <input 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g. BSIT"
                    style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Required Hours</label>
                  <input 
                    type="number"
                    value={formData.required_hours} 
                    onChange={e => setFormData({...formData, required_hours: e.target.value})}
                    style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <button onClick={handleSaveProgram} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, marginTop: '12px' }}>
                <Save size={18} /> {editingItem ? 'Update Program' : 'Save Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentProgramPage;
