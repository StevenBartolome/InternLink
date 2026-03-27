// src/pages/supervisor/EvaluationPage.jsx
import React, { useState, useEffect } from 'react';
import { Star, FileSignature, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { internsData } from '../../data/supervisorMockData';
import StatusBadge from '../../components/supervisor/StatusBadge';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const EvaluationPage = () => {
  const isMobile = useMediaQuery('(max-width: 992px)');
  const [selectedInternId, setSelectedInternId] = useState(internsData[0].id);
  const [scores, setScores] = useState({
    attendance: 5,
    attitude: 5,
    workQuality: 5,
    punctuality: 5,
    teamwork: 5
  });
  const [remarks, setRemarks] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedIntern = internsData.find(i => i.id === parseInt(selectedInternId));

  useEffect(() => {
    if (selectedIntern && selectedIntern.evaluationStatus === 'Evaluated') {
      setScores({
        attendance: selectedIntern.evaluation.attendance,
        attitude: selectedIntern.evaluation.attitude,
        workQuality: selectedIntern.evaluation.workQuality,
        punctuality: selectedIntern.evaluation.punctuality,
        teamwork: selectedIntern.evaluation.teamwork
      });
      setRemarks(selectedIntern.evaluation.remarks);
      setIsSubmitted(false);
    } else {
      setScores({ attendance: 5, attitude: 5, workQuality: 5, punctuality: 5, teamwork: 5 });
      setRemarks('');
      setIsSubmitted(false);
    }
  }, [selectedInternId, selectedIntern]);

  const handleScoreChange = (criteria, value) => {
    if (selectedIntern.evaluationStatus === 'Evaluated') return;
    setScores({ ...scores, [criteria]: parseInt(value) });
  };

  const calculateOverall = () => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return (total / 5).toFixed(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    alert('Evaluation submitted successfully for ' + selectedIntern.name);
  };

  const criteriaList = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'attitude', label: 'Attitude' },
    { key: 'workQuality', label: 'Work Quality' },
    { key: 'punctuality', label: 'Punctuality' },
    { key: 'teamwork', label: 'Teamwork' }
  ];

  const styles = {
    container: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
      gap: '24px',
    },
    sidebar: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      padding: '24px',
      height: 'fit-content',
    },
    internList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '16px',
    },
    internItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '16px',
      backgroundColor: isActive ? '#f0f9ff' : 'transparent',
      border: `2px solid ${isActive ? theme.colors.primary : 'transparent'}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      objectFit: 'cover',
    },
    formContainer: {
      flex: 1,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: '24px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.sm,
      padding: '32px',
    },
    formHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '32px',
      borderBottom: `1px solid ${theme.colors.border}`,
      paddingBottom: '24px',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 800,
      color: theme.colors.textMain,
      margin: '0 0 4px 0',
    },
    sectionSubtitle: {
      fontSize: '14px',
      color: theme.colors.textMuted,
      margin: 0,
    },
    readOnlyBadge: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      fontSize: '12px',
      fontWeight: 700,
      padding: '6px 12px',
      borderRadius: '8px',
      textTransform: 'uppercase',
    },
    criteriaSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      marginBottom: '32px',
    },
    criteriaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    criteriaInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    criteriaLabel: {
      fontSize: '15px',
      fontWeight: 700,
      color: theme.colors.textMain,
    },
    criteriaValue: {
      fontSize: '16px',
      fontWeight: 800,
      color: theme.colors.primary,
    },
    slider: {
      width: '100%',
      height: '6px',
      backgroundColor: '#e2e8f0',
      borderRadius: '3px',
      cursor: 'pointer',
    },
    overallSummary: {
      backgroundColor: '#f8fafc',
      padding: '24px',
      borderRadius: '20px',
      marginBottom: '32px',
      border: `1px solid ${theme.colors.border}`,
    },
    overallScoreBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    overallLabel: {
      fontSize: '13px',
      fontWeight: 700,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: '8px',
    },
    overallVal: {
      fontSize: '48px',
      fontWeight: 900,
      color: theme.colors.textMain,
      lineHeight: 1,
    },
    textarea: {
      width: '100%',
      padding: '16px',
      borderRadius: '16px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.bgSecondary,
      resize: 'vertical',
      fontWeight: 500,
    },
    submitBtn: {
      ...commonStyles.buttonPrimary,
      width: '100%',
      padding: '16px',
      borderRadius: '16px',
      fontSize: '15px',
      fontWeight: 800,
      marginTop: '24px',
    },
    successCard: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.layout}>
        {/* Sidebar */}
        {!isMobile && (
          <div style={styles.sidebar}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Interns List</h3>
            <div style={styles.internList}>
              {internsData.map(intern => (
                <div 
                  key={intern.id} 
                  style={styles.internItem(selectedInternId === intern.id)}
                  onClick={() => setSelectedInternId(intern.id)}
                >
                  <img src={intern.photo} alt={intern.name} style={styles.avatar} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.textMain }}>{intern.name}</div>
                    <StatusBadge status={intern.evaluationStatus} />
                  </div>
                  {selectedInternId === intern.id && <ChevronRight size={18} color={theme.colors.primary} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Form */}
        <div style={styles.formContainer}>
          {isSubmitted ? (
            <div style={{ ...styles.card, ...styles.successCard }}>
              <div style={{ padding: '24px', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#16a34a' }}>
                <CheckCircle2 size={64} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Evaluation Submitted!</h2>
              <p style={{ color: theme.colors.textMuted }}>Feedback for <strong>{selectedIntern.name}</strong> has been recorded.</p>
              <div style={{ padding: '16px 32px', backgroundColor: '#f8fafc', borderRadius: '16px', border: `1px solid ${theme.colors.border}` }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Overall Score</span>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>{calculateOverall()} / 10</div>
              </div>
              <button style={commonStyles.buttonSecondary} onClick={() => setIsSubmitted(false)}>
                Return to Form
              </button>
            </div>
          ) : (
            <div style={styles.card}>
              <div style={styles.formHeader}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <FileSignature size={32} color={theme.colors.primary} />
                  <div>
                    <h1 style={styles.sectionTitle}>Performance Evaluation</h1>
                    <p style={styles.sectionSubtitle}>Reviewing: <strong>{selectedIntern.name}</strong> ({selectedIntern.course})</p>
                  </div>
                </div>
                {selectedIntern.evaluationStatus === 'Evaluated' && (
                  <span style={styles.readOnlyBadge}>Read-Only Archive</span>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={styles.criteriaSection}>
                  {criteriaList.map((item) => (
                    <div key={item.key} style={styles.criteriaItem}>
                      <div style={styles.criteriaInfo}>
                        <span style={styles.criteriaLabel}>{item.label}</span>
                        <span style={styles.criteriaValue}>{scores[item.key]} / 10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={scores[item.key]} 
                        onChange={(e) => handleScoreChange(item.key, e.target.value)}
                        disabled={selectedIntern.evaluationStatus === 'Evaluated'}
                        style={styles.slider}
                      />
                    </div>
                  ))}
                </div>

                <div style={styles.overallSummary}>
                  <div style={styles.overallScoreBox}>
                    <span style={styles.overallLabel}>Overall Computed Score</span>
                    <span style={styles.overallVal}>{calculateOverall()}</span>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star 
                          key={starIdx} 
                          size={24} 
                          fill={starIdx <= Math.round(calculateOverall() / 2) ? theme.colors.warning : "none"}
                          color={theme.colors.warning} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={styles.criteriaLabel}>Additional Remarks</label>
                  <textarea 
                    placeholder="Provide constructive feedback..."
                    value={remarks}
                    onChange={(e) => selectedIntern.evaluationStatus !== 'Evaluated' && setRemarks(e.target.value)}
                    disabled={selectedIntern.evaluationStatus === 'Evaluated'}
                    rows="4"
                    required
                    style={styles.textarea}
                  ></textarea>
                </div>

                {selectedIntern.evaluationStatus !== 'Evaluated' && (
                  <button type="submit" style={styles.submitBtn}>
                    Complete & Submit Evaluation
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationPage;
