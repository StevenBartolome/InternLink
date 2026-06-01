import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DatabaseBackup, RotateCcw, Trash2, Download, RefreshCw, Upload,
  CheckCircle, AlertTriangle, Loader2, Clock, Shield, HardDrive
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import PageLoader from '../../components/common/PageLoader';

const fmt = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const BackupRestorePage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [restoringFile, setRestoringFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

  const notify = (message, type = 'success') => setToast({ message, type });

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/backup/list');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBackups(data.backups || []);
    } catch (err) {
      notify('Failed to load backups: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBackups(); }, [fetchBackups]);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/backup/create', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(`Backup created: ${data.fileName}`, 'success');
      await fetchBackups();
    } catch (err) {
      notify('Backup failed: ' + err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/backup/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload backup');
      
      notify('Backup uploaded successfully', 'success');
      await fetchBackups();
    } catch (err) {
      notify('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRestore = (fileName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Restore from Backup',
      message: `This will overwrite current data with the backup from "${fileName}". This cannot be undone. Continue?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setRestoringFile(fileName);
        try {
          const res = await fetch('/api/admin/backup/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          const erroredTables = Object.entries(data.results || {})
            .filter(([, v]) => v.error).map(([t]) => t);
          if (erroredTables.length > 0) {
            notify(`Restored with warnings on: ${erroredTables.join(', ')}`, 'error');
          } else {
            notify(`Successfully restored from ${fileName}`, 'success');
          }
        } catch (err) {
          notify('Restore failed: ' + err.message, 'error');
        } finally {
          setRestoringFile(null);
        }
      }
    });
  };

  const handleDelete = (fileName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Backup',
      message: `Permanently delete backup "${fileName}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setDeletingFile(fileName);
        try {
          const res = await fetch('/api/admin/backup/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          notify('Backup deleted.', 'success');
          setBackups(prev => prev.filter(b => b.name !== fileName));
        } catch (err) {
          notify('Delete failed: ' + err.message, 'error');
        } finally {
          setDeletingFile(null);
        }
      }
    });
  };

  if (loading) return <PageLoader message="Loading backups..." />;

  const sc = {
    primary: '#1E40AF', primaryLight: '#EFF6FF',
    textMain: '#1E293B', textMuted: '#64748B', border: '#E2E8F0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: sc.textMain }}>Backup & Restore</h1>
          <p style={{ margin: '4px 0 0', color: sc.textMuted, fontSize: '0.875rem' }}>
            Automatic backup runs every day at 12:00 AM (Manila Time)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchBackups}
            style={{ ...commonStyles.dashboardBtn, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: `1px solid ${sc.border}`, borderRadius: '10px', background: '#fff', color: sc.textMain, cursor: 'pointer', fontSize: '14px' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleUploadClick}
            disabled={uploading || creating}
            style={{ ...commonStyles.dashboardBtn, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: `1px solid ${sc.border}`, borderRadius: '10px', background: '#F8FAFC', color: sc.textMain, cursor: (uploading || creating) ? 'not-allowed' : 'pointer', opacity: (uploading || creating) ? 0.7 : 1, fontSize: '14px' }}
          >
            {uploading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
              : <><Upload size={15} /> Upload Backup</>
            }
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            onClick={handleCreateBackup}
            disabled={creating || uploading}
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', cursor: (creating || uploading) ? 'not-allowed' : 'pointer', opacity: (creating || uploading) ? 0.7 : 1 }}
          >
            {creating
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</>
              : <><DatabaseBackup size={15} /> Create Backup Now</>
            }
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { icon: <DatabaseBackup size={22} />, label: 'Total Backups', value: backups.length, color: sc.primary, bg: sc.primaryLight },
          { icon: <Clock size={22} />, label: 'Last Backup', value: backups[0] ? fmtDate(backups[0].created_at) : 'No backups yet', color: '#16a34a', bg: '#dcfce7' },
          { icon: <Shield size={22} />, label: 'Auto Schedule', value: 'Daily at 12:00 AM', color: '#d97706', bg: '#fef9c3' },
          { icon: <HardDrive size={22} />, label: 'Total Size', value: fmt(backups.reduce((sum, b) => sum + (b.size || 0), 0)), color: '#7c3aed', bg: '#f3e8ff' },
        ].map((s, i) => (
          <div key={i} style={{ ...commonStyles.dashboardCard, padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: sc.textMuted, marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: sc.textMain, wordBreak: 'break-word' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Backup List */}
      <div style={{ ...commonStyles.dashboardCard, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${sc.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DatabaseBackup size={18} color={sc.primary} />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: sc.textMain }}>Available Backups</h2>
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: sc.textMuted }}>{backups.length} file{backups.length !== 1 ? 's' : ''}</span>
        </div>

        {backups.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: sc.textMuted }}>
            <DatabaseBackup size={40} style={{ margin: '0 auto 12px', opacity: 0.25 }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No backups found. Create your first backup now.</p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '12px', padding: '12px 24px', backgroundColor: '#F8FAFC', borderBottom: `1px solid ${sc.border}`, fontSize: '12px', fontWeight: 600, color: sc.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>File Name</span>
              <span>Created</span>
              <span>Size</span>
              <span>Actions</span>
            </div>

            {backups.map((backup, i) => {
              const isRestoring = restoringFile === backup.name;
              const isDeleting = deletingFile === backup.name;
              const isLatest = i === 0;

              return (
                <div
                  key={backup.name}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto',
                    gap: '12px', padding: '14px 24px', alignItems: 'center',
                    borderBottom: i < backups.length - 1 ? `1px solid ${sc.border}` : 'none',
                    backgroundColor: isLatest ? '#F0F9FF' : 'white',
                    transition: 'background-color 0.15s',
                  }}
                >
                  {/* Filename */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <HardDrive size={16} color={isLatest ? sc.primary : sc.textMuted} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: sc.textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {backup.name}
                      </div>
                      {isLatest && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: sc.primary, backgroundColor: sc.primaryLight, padding: '2px 8px', borderRadius: '20px' }}>
                          Latest
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <span style={{ fontSize: '13px', color: sc.textMuted }}>
                    {fmtDate(backup.created_at)}
                  </span>

                  {/* Size */}
                  <span style={{ fontSize: '13px', color: sc.textMuted }}>{fmt(backup.size)}</span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleRestore(backup.name)}
                      disabled={!!restoringFile || !!deletingFile}
                      title="Restore from this backup"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: isRestoring ? '#dcfce7' : '#EFF6FF',
                        color: isRestoring ? '#16a34a' : sc.primary,
                        border: `1px solid ${isRestoring ? '#bbf7d0' : '#bfdbfe'}`,
                        cursor: (restoringFile || deletingFile) ? 'not-allowed' : 'pointer',
                        opacity: (restoringFile && !isRestoring) ? 0.5 : 1,
                      }}
                    >
                      {isRestoring
                        ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Restoring...</>
                        : <><RotateCcw size={12} /> Restore</>
                      }
                    </button>

                    <a
                      href={`/api/admin/backup/download/${backup.name}`}
                      title="Download this backup"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        color: sc.textMuted,
                        border: `1px solid ${sc.border}`,
                        textDecoration: 'none',
                        cursor: (restoringFile || deletingFile) ? 'not-allowed' : 'pointer',
                        opacity: (restoringFile || deletingFile) ? 0.5 : 1,
                        pointerEvents: (restoringFile || deletingFile) ? 'none' : 'auto',
                      }}
                    >
                      <Download size={13} />
                    </a>

                    <button
                      onClick={() => handleDelete(backup.name)}
                      disabled={!!restoringFile || !!deletingFile}
                      title="Delete this backup"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '30px', height: '30px', borderRadius: '8px',
                        backgroundColor: isDeleting ? '#fee2e2' : '#F8FAFC',
                        color: isDeleting ? '#dc2626' : sc.textMuted,
                        border: `1px solid ${sc.border}`,
                        cursor: (restoringFile || deletingFile) ? 'not-allowed' : 'pointer',
                        opacity: (deletingFile && !isDeleting) ? 0.5 : 1,
                      }}
                    >
                      {isDeleting
                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertTriangle size={18} color='#d97706' style={{ flexShrink: 0, marginTop: '1px' }} />
        <div style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.6' }}>
          <strong>About Restore:</strong> Restoring overwrites existing records in the database with the backup data using upsert. User accounts and authentication records are preserved. It is recommended to create a new backup before restoring to avoid data loss.
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage;
