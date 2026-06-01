// src/pages/admin/InternshipConfigPage.jsx
import React, { useState, useEffect } from 'react';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { 
  Settings, 
  Clock, 
  FileText, 
  Calendar, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square,
  LayoutGrid,
  FileCheck,
  X,
  Users,
  FilePlus2,
  Edit2
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { adminService } from '../../services/adminService';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

const Modal = ({ title, onClose, onConfirm, confirmText = "Done", children }) => (
  <div style={{
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
    backdropFilter: 'blur(4px)'
  }}>
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ padding: '24px', overflowY: 'auto' }}>
        {children}
      </div>
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button 
          onClick={onClose}
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default function InternshipConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });
  
  // Modal states
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [assigningDoc, setAssigningDoc] = useState(null);
  const [tempSelectedPrograms, setTempSelectedPrograms] = useState([]);
  const [editingDoc, setEditingDoc] = useState(null);
  
  // Form states for new/edit doc
  const [newDocForm, setNewDocForm] = useState({ name: '', selectedPrograms: [] });
  const [editDocForm, setEditDocForm] = useState({ name: '' });
  
  // Track custom/added/deleted documents in the session so they do not instantly vanish when unassigned
  const [addedDocuments, setAddedDocuments] = useState([]);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [defaultDocs, setDefaultDocs] = useState([]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProgramConfigs();
      setConfigs(data);
    } catch (err) {
      console.error('Error fetching configs:', err);
      setToast({ message: 'Failed to load configurations.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimeSubscription(
    ['programs', 'program_required_documents'],
    fetchConfigs
  );



  const globalDocuments = Array.from(new Set([
    ...defaultDocs,
    ...configs.flatMap(c => c.requiredDocuments.map(d => d.name)),
    ...addedDocuments
  ]))
    .filter(name => !deletedDocuments.includes(name))
    .sort();



  const handleCreateDoc = async () => {
    if (!newDocForm.name.trim()) {
      setToast({ message: 'Please enter a document name.', type: 'warning' });
      return;
    }
    if (newDocForm.selectedPrograms.length === 0) {
      setToast({ message: 'Please select at least one program.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      // Sequentially or batch add requirements
      // For simplicity using our existing toggle method in a loop
      for (const programId of newDocForm.selectedPrograms) {
        await adminService.toggleProgramDocument(programId, newDocForm.name.trim(), true);
      }
      
      setAddedDocuments(prev => [...prev, newDocForm.name.trim()]);
      // Remove from deleted list if it was previously deleted in this session
      setDeletedDocuments(prev => prev.filter(name => name !== newDocForm.name.trim()));
      
      await fetchConfigs();
      setIsAddingDoc(false);
      setNewDocForm({ name: '', selectedPrograms: [] });
      setToast({ message: `"${newDocForm.name}" created and assigned.`, type: 'success' });
    } catch (err) {
      console.error('Create failed:', err);
      setToast({ message: 'Failed to create document requirement.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGlobalDoc = (docName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Global Document',
      message: `Are you sure you want to remove "${docName}" from ALL programs?`,
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, isOpen: false }));
        try {
          await adminService.deleteGlobalDocument(docName);
          setConfigs(prev => prev.map(c => ({
            ...c,
            requiredDocuments: c.requiredDocuments.filter(d => d.name !== docName)
          })));
          setDeletedDocuments(prev => [...prev, docName]);
          setAddedDocuments(prev => prev.filter(name => name !== docName));
          setToast({ message: `"${docName}" deleted.`, type: 'success' });
        } catch (err) {
          console.error('Delete failed:', err);
          setToast({ message: 'Delete failed.', type: 'error' });
        }
      }
    });
  };

  const handleRenameDoc = async () => {
    if (!editDocForm.name.trim()) {
      setToast({ message: 'Please enter a document name.', type: 'warning' });
      return;
    }
    if (editDocForm.name.trim() === editingDoc) {
      setEditingDoc(null);
      return;
    }

    try {
      setLoading(true);
      await adminService.renameGlobalDocument(editingDoc, editDocForm.name.trim());
      
      // Update local configs state to reflect the new document name
      setConfigs(prev => prev.map(c => ({
        ...c,
        requiredDocuments: c.requiredDocuments.map(d => 
          d.name === editingDoc ? { ...d, name: editDocForm.name.trim() } : d
        )
      })));

      // Update local session arrays
      setAddedDocuments(prev => prev.map(name => name === editingDoc ? editDocForm.name.trim() : name));
      setDefaultDocs(prev => prev.map(name => name === editingDoc ? editDocForm.name.trim() : name));
      
      setEditingDoc(null);
      setToast({ message: `Document renamed to "${editDocForm.name.trim()}".`, type: 'success' });
    } catch (err) {
      console.error('Rename failed:', err);
      setToast({ message: 'Failed to rename document requirement.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignments = async () => {
    if (!assigningDoc) return;

    // Get the original list of program IDs for this document
    const originalProgramIds = configs
      .filter(c => c.requiredDocuments.some(d => d.name === assigningDoc))
      .map(c => c.id);

    // Determine which ones to add and which ones to remove
    const toAdd = tempSelectedPrograms.filter(id => !originalProgramIds.includes(id));
    const toRemove = originalProgramIds.filter(id => !tempSelectedPrograms.includes(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      setAssigningDoc(null);
      return;
    }

    try {
      setLoading(true);

      // 1. Perform database updates
      for (const programId of toAdd) {
        await adminService.toggleProgramDocument(programId, assigningDoc, true);
      }
      for (const programId of toRemove) {
        await adminService.toggleProgramDocument(programId, assigningDoc, false);
      }

      // 2. Update local state
      setConfigs(prev => prev.map(c => {
        const shouldBeRequired = tempSelectedPrograms.includes(c.id);
        const isCurrentlyRequired = c.requiredDocuments.some(d => d.name === assigningDoc);

        if (shouldBeRequired && !isCurrentlyRequired) {
          return {
            ...c,
            requiredDocuments: [...c.requiredDocuments, { id: Date.now() + Math.random(), name: assigningDoc }]
          };
        } else if (!shouldBeRequired && isCurrentlyRequired) {
          return {
            ...c,
            requiredDocuments: c.requiredDocuments.filter(d => d.name !== assigningDoc)
          };
        }
        return c;
      }));

      setAssigningDoc(null);
      setToast({ message: 'Assignments updated successfully.', type: 'success' });
    } catch (err) {
      console.error('Failed to save assignments:', err);
      setToast({ message: 'Failed to save document assignments.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async (program) => {
    try {
      await adminService.updateProgramConfig(program.id, program);
      setToast({ message: `Settings for ${program.course} saved.`, type: 'success' });
      setExpanded(null);
    } catch (err) {
      setToast({ message: 'Save failed.', type: 'error' });
    }
  };

  const styles = {
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      backgroundColor: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      border: `1px solid ${theme.colors.border}`
    },
    th: {
      padding: '16px 24px',
      textAlign: 'left',
      fontSize: '0.8rem',
      fontWeight: 800,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: theme.colors.bgSecondary,
      borderBottom: `1px solid ${theme.colors.border}`
    },
    td: {
      padding: '16px 24px',
      borderBottom: `1px solid ${theme.colors.border}`,
      fontSize: '0.9rem',
      color: theme.colors.textMain
    },
    programCard: (active) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: '12px',
      backgroundColor: active ? theme.colors.bgAccent : '#fff',
      border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s'
    })
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* MODAL: Assign Programs to Existing Doc */}
      {assigningDoc && (() => {
        const allSelected = tempSelectedPrograms.length === configs.length;
        return (
          <Modal 
            title={`Assign "${assigningDoc}" to Programs`} 
            onClose={() => setAssigningDoc(null)}
            onConfirm={handleSaveAssignments}
            confirmText="Done"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingBottom: '10px', 
                borderBottom: `1px solid ${theme.colors.border}`,
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase' }}>Select/Deselect All Programs</span>
                <button 
                  type="button"
                  onClick={() => setTempSelectedPrograms(allSelected ? [] : configs.map(c => c.id))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: theme.colors.bgAccent,
                    transition: 'all 0.2s'
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {configs.map(program => {
                const isSelected = tempSelectedPrograms.includes(program.id);
                return (
                  <div 
                    key={program.id} 
                    style={styles.programCard(isSelected)} 
                    onClick={() => {
                      setTempSelectedPrograms(prev => 
                        isSelected 
                          ? prev.filter(id => id !== program.id)
                          : [...prev, program.id]
                      );
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? theme.colors.primary : theme.colors.textMain }}>{program.course}</div>
                    {isSelected ? <CheckSquare size={18} color={theme.colors.primary} /> : <Square size={18} color={theme.colors.border} />}
                  </div>
                );
              })}
            </div>
          </Modal>
        );
      })()}

      {/* MODAL: Add New Document Type */}
      {isAddingDoc && (
        <Modal 
          title="Add New Document Requirement" 
          onClose={() => setIsAddingDoc(false)}
          onConfirm={handleCreateDoc}
          confirmText="Create & Assign"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Document Name</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. NBI Clearance, Insurance..." 
                value={newDocForm.name}
                onChange={e => setNewDocForm(p => ({ ...p, name: e.target.value }))}
                style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: theme.colors.textMuted, textTransform: 'uppercase', margin: 0 }}>Assign to Programs</label>
                <button 
                  type="button"
                  onClick={() => {
                    const allSelected = newDocForm.selectedPrograms.length === configs.length;
                    setNewDocForm(p => ({
                      ...p,
                      selectedPrograms: allSelected ? [] : configs.map(c => c.id)
                    }));
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.primary,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: theme.colors.bgAccent
                  }}
                >
                  {newDocForm.selectedPrograms.length === configs.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {configs.map(program => {
                  const isSelected = newDocForm.selectedPrograms.includes(program.id);
                  return (
                    <div 
                      key={program.id} 
                      style={styles.programCard(isSelected)} 
                      onClick={() => {
                        setNewDocForm(p => ({
                          ...p,
                          selectedPrograms: isSelected 
                            ? p.selectedPrograms.filter(id => id !== program.id)
                            : [...p.selectedPrograms, program.id]
                        }));
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? theme.colors.primary : theme.colors.textMain }}>{program.course}</div>
                      {isSelected ? <CheckSquare size={18} color={theme.colors.primary} /> : <Square size={18} color={theme.colors.border} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Edit/Rename Document Type */}
      {editingDoc && (
        <Modal 
          title="Edit Document Name" 
          onClose={() => setEditingDoc(null)}
          onConfirm={handleRenameDoc}
          confirmText="Save Rename"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: theme.colors.textMuted, marginBottom: '8px', textTransform: 'uppercase' }}>Document Name</label>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Parental Consent..." 
                value={editDocForm.name}
                onChange={e => setEditDocForm({ name: e.target.value })}
                style={{ ...commonStyles.input, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Internship Configuration</h1>
          <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Configure document templates and program settings.</p>
        </div>
        
        <div style={{ display: 'flex', backgroundColor: theme.colors.bgSecondary, padding: '4px', borderRadius: '12px', gap: '4px' }}>
          {[
            { id: 'documents', label: 'Document Requirements', icon: <FileCheck size={16} /> },
            { id: 'programs', label: 'Program Settings', icon: <LayoutGrid size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? theme.colors.primary : theme.colors.textMuted,
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !isAddingDoc ? (
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
          <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted }}>Loading configurations...</span>
        </div>
      ) : activeTab === 'documents' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setIsAddingDoc(true)}
              style={{ 
                ...commonStyles.dashboardBtn, 
                ...commonStyles.dashboardBtnPrimary,
                padding: '12px 24px',
                boxShadow: '0 4px 15px rgba(30, 64, 175, 0.2)' 
              }}
            >
              <FilePlus2 size={18} /> Add New Document Type
            </button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Document Name</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Requirement Count</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {globalDocuments.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>No documents defined yet.</td>
                </tr>
              ) : globalDocuments.map(docName => {
                const requiredBy = configs.filter(c => c.requiredDocuments.some(d => d.name === docName));
                return (
                  <tr key={docName} style={{ transition: 'background-color 0.2s' }}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: theme.colors.bgAccent, color: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{docName}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        backgroundColor: requiredBy.length > 0 ? '#dcfce7' : '#f1f5f9', 
                        color: requiredBy.length > 0 ? '#16a34a' : '#64748b', 
                        fontSize: '0.75rem', 
                        fontWeight: 700 
                      }}>
                        {requiredBy.length > 0 ? 'Active' : 'Not Assigned'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textMuted }}>
                        <Users size={14} /> {requiredBy.length} Programs
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => {
                            setAssigningDoc(docName);
                            const currentProgramIds = configs
                              .filter(c => c.requiredDocuments.some(d => d.name === docName))
                              .map(c => c.id);
                            setTempSelectedPrograms(currentProgramIds);
                          }}
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          Assign Programs
                        </button>
                        <button 
                          onClick={() => {
                            setEditingDoc(docName);
                            setEditDocForm({ name: docName });
                          }}
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, padding: '6px', color: theme.colors.textMuted }}
                          onMouseEnter={e => e.currentTarget.style.color = theme.colors.primary}
                          onMouseLeave={e => e.currentTarget.style.color = theme.colors.textMuted}
                          title="Rename Document"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteGlobalDoc(docName)}
                          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, padding: '6px', color: theme.colors.textMuted }}
                          onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                          onMouseLeave={e => e.currentTarget.style.color = theme.colors.textMuted}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Program Settings View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {configs.map(config => {
            const isOpen = expanded === config.id;
            return (
              <div key={config.id} style={{ ...commonStyles.dashboardCard, padding: 0, overflow: 'hidden' }}>
                <div 
                  onClick={() => setExpanded(isOpen ? null : config.id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '16px 24px', 
                    cursor: 'pointer',
                    backgroundColor: isOpen ? theme.colors.bgSecondary : '#fff'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: theme.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {config.course[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: theme.colors.textMain }}>{config.course}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{config.courseFullName}</div>
                  </div>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {isOpen && (
                  <div style={{ padding: '24px', borderTop: `1px solid ${theme.colors.border}`, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>
                          <Clock size={13} style={{ marginRight: '4px' }} /> Required OJT Hours
                        </label>
                        <input 
                          type="number" 
                          value={config.requiredHours}
                          onChange={e => setConfigs(prev => prev.map(c => c.id !== config.id ? c : { ...c, requiredHours: parseInt(e.target.value) }))}
                          style={{ ...commonStyles.input, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>OJT Subject Code</label>
                        <input 
                          type="text" 
                          value={config.ojtSubjectCode}
                          onChange={e => setConfigs(prev => prev.map(c => c.id !== config.id ? c : { ...c, ojtSubjectCode: e.target.value }))}
                          style={{ ...commonStyles.input, width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>
                          <Calendar size={13} style={{ marginRight: '4px' }} /> Doc Submission Deadline
                        </label>
                        <input 
                          type="date" 
                          value={config.deadlines.docSubmission}
                          onChange={e => setConfigs(prev => prev.map(c => c.id !== config.id ? c : { 
                            ...c, deadlines: { ...c.deadlines, docSubmission: e.target.value }
                          }))}
                          style={{ ...commonStyles.input, width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.colors.textMuted, marginBottom: '6px' }}>
                          <Calendar size={13} style={{ marginRight: '4px' }} /> Portfolio Deadline
                        </label>
                        <input 
                          type="date" 
                          value={config.deadlines.portfolioSubmission}
                          onChange={e => setConfigs(prev => prev.map(c => c.id !== config.id ? c : { 
                            ...c, deadlines: { ...c.deadlines, portfolioSubmission: e.target.value }
                          }))}
                          style={{ ...commonStyles.input, width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleSaveProgram(config)}
                        style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, padding: '10px 24px' }}
                      >
                        <Save size={16} /> Save Program Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
}
