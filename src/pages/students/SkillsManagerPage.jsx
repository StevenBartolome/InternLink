import React, { useState } from 'react';
import { 
  Star, Plus, Trash2, 
  CheckCircle, Zap, ShieldCheck,
  Search, Info, Trophy, Layout
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
// import { studentProfile } from '../../services/mocks/mockData';

const SkillsManagerPage = () => {
  const [skills, setSkills] = useState([]); // Real skills will be loaded from profile
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    skillBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '20px',
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      fontWeight: 600,
      fontSize: '0.9rem',
      border: `1px solid ${theme.colors.glassBorder}`,
      transition: 'all 0.2s ease',
      ':hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows.sm }
    },
    inputGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '32px',
    },
    input: {
      flex: 1,
      padding: '12px 20px',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '1rem',
      outline: 'none',
      ':focus': { borderColor: theme.colors.primary }
    }
  };

  return (
    <div style={styles.container}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Skills Portfolio</h1>
        <p style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Highlight your technical expertise to improve AI matching with internships.</p>
      </header>

      <div style={commonStyles.dashboardCard}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color={theme.colors.warning} fill={theme.colors.warning} />
          Add Your Skills
        </h3>
        <div style={styles.inputGroup}>
          <input 
            style={styles.input} 
            placeholder="e.g., Python, UI Design, Project Management..." 
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
          />
          <button 
            style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, padding: '0 24px' }}
            onClick={addSkill}
          >
            Add Skill
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {skills.map((skill, index) => (
            <div key={index} style={styles.skillBadge}>
              {skill}
              <button 
                style={{ background: 'none', border: 'none', color: theme.colors.textMuted, cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                onClick={() => removeSkill(skill)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ ...commonStyles.dashboardCard, backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
          <Trophy size={24} color="#0284C7" style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0369A1' }}>Top Skill Badge</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#075985' }}>You are in the top 10% of candidates for React.js roles based on your verified skills.</p>
        </div>
        <div style={{ ...commonStyles.dashboardCard, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <ShieldCheck size={24} color="#16A34A" style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 700, color: '#15803D' }}>Verified Status</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>All mentioned skills are verified through your uploaded projects and certifications.</p>
        </div>
      </div>
    </div>
  );
};

export default SkillsManagerPage;
