import React, { useState } from 'react';
import { 
  Settings, Globe,
  Save, RotateCcw, Server, Database
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { systemSettings } from '../../data/adminMockData';
import Toast from '../../components/coordinator/Toast';

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [academicYear, setAcademicYear] = useState(systemSettings.academicYear);
  const [semesterStatus, setSemesterStatus] = useState('Active');
  const [toast, setToast] = useState(null);
  const [isBacking, setIsBacking] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleSaveConfig = () => {
    showToast(`Configuration saved — Academic Year: ${academicYear}, Semester: ${semesterStatus}.`, 'success');
  };

  const handleBackup = () => {
    setIsBacking(true);
    showToast('System backup initiated. This may take a few moments.', 'info');
    setTimeout(() => {
      setIsBacking(false);
      showToast('System backup completed successfully.', 'success');
    }, 2500);
  };

  const handleHardReset = () => {
    const confirmed = window.confirm('Are you sure you want to perform a hard reset? This cannot be undone.');
    if (confirmed) {
      showToast('Hard reset executed. App state has been cleared.', 'warning');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '1000px',
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '240px 1fr',
      gap: '32px',
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    navItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isActive ? theme.colors.bgAccent : 'transparent',
      color: isActive ? theme.colors.primary : theme.colors.textMuted,
      border: 'none',
    }),
    formCard: {
      ...commonStyles.dashboardCard,
      padding: '32px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '24px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '0.9rem',
      outline: 'none',
    }
  };

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Configuration</h1>
        <button
          style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}
          onClick={handleSaveConfig}
        >
          <Save size={18} /> Save Config
        </button>
      </header>

      <div style={styles.mainLayout}>
        <aside style={styles.nav}>
          <button style={styles.navItem(activeTab === 'general')} onClick={() => setActiveTab('general')}>
            <Globe size={18} /> General
          </button>
          <button style={styles.navItem(activeTab === 'database')} onClick={() => setActiveTab('database')}>
            <Database size={18} /> Maintenance
          </button>
        </aside>

        <main>
          {activeTab === 'general' && (
            <div style={styles.formCard}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 700 }}>Academic Terms</h3>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Academic Year</label>
                <input
                  style={styles.input}
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Semester Status</label>
                <select style={styles.input} value={semesterStatus} onChange={e => setSemesterStatus(e.target.value)}>
                  <option>Active</option>
                  <option>Closed</option>
                  <option>Maintenance</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div style={styles.formCard}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Maintenance Protocols</h3>
              <button
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, width: '100%', justifyContent: 'flex-start', marginBottom: '12px' }}
                onClick={handleBackup}
                disabled={isBacking}
              >
                <Server size={18} /> {isBacking ? 'Backing up...' : 'Perform System Backup'}
              </button>
              <button
                style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, width: '100%', justifyContent: 'flex-start', color: theme.colors.danger }}
                onClick={handleHardReset}
              >
                <RotateCcw size={18} /> Hard Reset App State
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
