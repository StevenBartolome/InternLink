import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ClipboardCheck, Star, User, 
  MessageCircle, Send, CheckCircle2,
  AlertCircle, ChevronRight, Search
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockStudents } from '../../services/mocks/coordinatorMockData';

const StudentEvaluationPage = () => {
  const { showToast } = useOutletContext() || {};
  const [selectedStudent, setSelectedStudent] = useState(null);

  const studentsForEvaluation = mockStudents.filter(s => s.status === 'Placed');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px',
      alignItems: 'start',
    },
    sidebar: {
      ...commonStyles.dashboardCard,
      padding: '20px',
      maxHeight: 'calc(100vh - 150px)',
      overflowY: 'auto',
    },
    studentItem: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isSelected ? theme.colors.bgAccent : 'transparent',
      border: `1px solid ${isSelected ? theme.colors.primary : 'transparent'}`,
    }),
    formCard: {
      ...commonStyles.dashboardCard,
      padding: '32px',
    },
    ratingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      margin: '24px 0',
    },
    criteria: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Student Performance Evaluation</h1>
      
      <div style={styles.mainLayout}>
        <div style={styles.sidebar}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.colors.textMuted }} />
            <input 
              placeholder="Search students..." 
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: `1px solid ${theme.colors.border}`, fontSize: '0.875rem' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {studentsForEvaluation.map(student => (
              <div 
                key={student.id} 
                style={styles.studentItem(selectedStudent?.id === student.id)}
                onClick={() => setSelectedStudent(student)}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: theme.colors.bgSecondary, display: 'flex', alignItems: 'center', justifySelf: 'center', fontWeight: 'bold', color: theme.colors.primary, fontSize: '12px' }}>
                  {student.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.colors.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</div>
                  <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{student.company}</div>
                </div>
                <ChevronRight size={16} style={{ color: theme.colors.textMuted }} />
              </div>
            ))}
          </div>
        </div>

        <div>
          {selectedStudent ? (
            <div style={styles.formCard}>
              <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={selectedStudent.avatar} alt="Student" style={{ width: '64px', height: '64px', borderRadius: '16px' }} />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{selectedStudent.name}</h2>
                    <span style={{ fontSize: '0.875rem', color: theme.colors.textMuted }}>{selectedStudent.id} • {selectedStudent.course}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ ...commonStyles.dashboardBadge, ...commonStyles.badgeInfo }}>Midterm Evaluation</span>
                </div>
              </header>

              <p style={{ color: theme.colors.textMuted, fontSize: '0.94rem' }}>
                Please evaluate the student based on their performance at <strong>{selectedStudent.company}</strong>. 
                Your feedback will account for 40% of their final grade.
              </p>

              <div style={styles.ratingGrid}>
                {[
                  { label: 'Technical Proficiency', val: 5 },
                  { label: 'Professionalism', val: 5 },
                  { label: 'Communication Skills', val: 4 },
                  { label: 'Punctuality', val: 5 }
                ].map((item, idx) => (
                  <div key={idx} style={styles.criteria}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={18} fill={star <= item.val ? theme.colors.warning : 'none'} color={star <= item.val ? theme.colors.warning : theme.colors.border} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Coordinator Remarks</label>
                <textarea 
                  placeholder="Enter detailed feedback..." 
                  style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, outline: 'none', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnSecondary }}
                  onClick={() => showToast && showToast('Draft saved successfully', 'success')}
                >
                  Save Draft
                </button>
                <button 
                  style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, padding: '12px 32px' }}
                  onClick={() => {
                    showToast && showToast('Evaluation submitted for review', 'success');
                    setSelectedStudent(null);
                  }}
                >
                  <Send size={18} />
                  Submit Evaluation
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...commonStyles.dashboardCard, padding: '80px', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ marginBottom: '16px', color: theme.colors.textMuted }}><ClipboardCheck size={64} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Select a student to begin evaluation</h3>
              <p style={{ fontSize: '0.875rem' }}>Evaluation forms will be enabled once the student completes 50% of their OJT hours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentEvaluationPage;
