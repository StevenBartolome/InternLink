import React, { useState, useEffect } from 'react';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { Building2, GraduationCap, Plus, Edit2, Trash2, Save, X, ChevronRight, ChevronDown } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { supabase } from '../../services/supabaseClient';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const DepartmentProgramPage = () => {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  const [expandedDept, setExpandedDept] = useState(null);
  
  // Modals / Editing state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', department_id: '', required_hours: 486 });
  
  // Section management state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedProg, setSelectedProg] = useState(null);
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeSubscription(
    ['departments', 'programs', 'program_sections'],
    fetchData
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: depts, error: deptsError } = await supabase.from('departments').select('*').order('name');
      const { data: progs, error: progsError } = await supabase.from('programs').select('*').order('name');
      const { data: sects, error: sectsError } = await supabase.from('program_sections').select('*').order('name');
      
      if (deptsError) throw deptsError;
      if (progsError) throw progsError;
      if (sectsError) throw sectsError;
      
      setDepartments(depts);
      setPrograms(progs);
      setSections(sects);
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

  const handleDeleteDepartment = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Department',
      message: 'Are you sure? This will also delete all programs under this department.',
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          const { error } = await supabase.from('departments').delete().eq('id', id);
          if (error) throw error;
          showToast('Department deleted');
          fetchData();
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    });
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

  const handleAddSection = async () => {
    if (!newSectionName.trim() || !selectedProg) return;
    try {
      const { error } = await supabase.from('program_sections').insert([
        { name: newSectionName.trim(), program_id: selectedProg.id }
      ]);
      if (error) throw error;
      setNewSectionName('');
      fetchData();
      showToast('Section added successfully');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const toggleSectionStatus = async (section) => {
    try {
      const { error } = await supabase.from('program_sections').update({ is_active: !section.is_active }).eq('id', section.id);
      if (error) throw error;
      fetchData();
      showToast(`Section ${!section.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteSection = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section?',
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          const { error } = await supabase.from('program_sections').delete().eq('id', id);
          if (error) throw error;
          fetchData();
          showToast('Section deleted');
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    });
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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '100px 20px',
          width: '100%'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${theme.colors.primary}20`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin-loader 0.8s linear infinite',
            marginBottom: '12px'
          }} />
          <style>{`
            @keyframes spin-loader {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted }}>Loading academic structure...</span>
        </div>
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
                            <button 
                              onClick={() => { setSelectedProg(prog); setIsSectionModalOpen(true); }}
                              style={{ ...commonStyles.dashboardBtnSecondary, padding: '4px 10px', fontSize: '0.75rem', height: 'fit-content' }}
                            >
                              Sections ({sections.filter(s => s.program_id === prog.id).length})
                            </button>
                            <button 
                              onClick={() => { setEditingItem(prog); setFormData({ ...prog }); setIsProgModalOpen(true); }}
                              style={{ background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', padding: '6px' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Delete Program',
                                  message: 'Are you sure you want to delete this program?',
                                  onConfirm: async () => {
                                    setConfirmModal(p => ({ ...p, isOpen: false }));
                                    try {
                                      const { error } = await supabase.from('programs').delete().eq('id', prog.id);
                                      if (error) throw error;
                                      showToast('Program deleted');
                                      fetchData();
                                    } catch (error) {
                                      showToast(error.message, 'error');
                                    }
                                  }
                                });
                              }}
                              style={{ background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer', padding: '6px' }}
                            >
                              <Trash2 size={14} />
                            </button>
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
      {/* Section Management Modal */}
      {isSectionModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Manage Sections</h2>
                <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.85rem' }}>{selectedProg?.name} ({selectedProg?.code})</p>
              </div>
              <button onClick={() => setIsSectionModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                placeholder="Section name (e.g. ITE231)"
                style={{ ...commonStyles.input, flex: 1 }}
                onKeyPress={e => e.key === 'Enter' && handleAddSection()}
              />
              <button onClick={handleAddSection} style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
                <Plus size={18} /> Add
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ ...commonStyles.dashboardTable, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ ...commonStyles.dashboardTableTh, padding: '10px' }}>Section Name</th>
                    <th style={{ ...commonStyles.dashboardTableTh, padding: '10px' }}>Status</th>
                    <th style={{ ...commonStyles.dashboardTableTh, padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.filter(s => s.program_id === selectedProg?.id).length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: theme.colors.textMuted }}>No sections defined yet.</td>
                    </tr>
                  ) : (
                    sections.filter(s => s.program_id === selectedProg?.id).map(section => (
                      <tr key={section.id}>
                        <td style={{ ...commonStyles.dashboardTableTd, padding: '10px', fontWeight: 600 }}>{section.name}</td>
                        <td style={{ ...commonStyles.dashboardTableTd, padding: '10px' }}>
                          <button 
                            onClick={() => toggleSectionStatus(section)}
                            style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backgroundColor: section.is_active ? '#dcfce7' : '#fee2e2',
                              color: section.is_active ? '#15803d' : '#dc2626'
                            }}
                          >
                            {section.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ ...commonStyles.dashboardTableTd, padding: '10px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteSection(section.id)}
                            style={{ background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};

export default DepartmentProgramPage;
