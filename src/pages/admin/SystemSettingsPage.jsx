import React, { useState } from 'react';
import { 
  Settings, Globe, Lock, 
  Bell, Database, Save,
  RotateCcw, Server, Info
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { systemSettings } from '../../data/adminMockData';

const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Configuration</h1>
        <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary }}>
          <Save size={18} /> Save Config
        </button>
      </header>

      <div style={styles.mainLayout}>
        <aside style={styles.nav}>
          <div style={styles.navItem(activeTab === 'general')} onClick={() => setActiveTab('general')}>
            <Globe size={18} /> General
          </div>
          <div style={styles.navItem(activeTab === 'database')} onClick={() => setActiveTab('database')}>
            <Database size={18} /> Maintenance
          </div>
        </aside>

        <main>
          {activeTab === 'general' && (
            <div style={styles.formCard}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 700 }}>Academic Terms</h3>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Academic Year</label>
                <input style={styles.input} defaultValue={systemSettings.academicYear} />
              </div>
              <div style={styles.formGroup}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Semester Status</label>
                <select style={styles.input}>
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
              <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, width: '100%', justifyContent: 'flex-start', marginBottom: '12px' }}>
                <Server size={18} /> Perform System Backup
              </button>
              <button style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary, width: '100%', justifyContent: 'flex-start', color: theme.colors.danger }}>
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
