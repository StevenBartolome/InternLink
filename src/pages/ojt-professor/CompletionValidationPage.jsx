// src/pages/ojt-professor/CompletionValidationPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, Clock, Unlock, User, FileCheck } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { mockCompletionQueue } from '../../services/mocks/ojtProfessorMockData';
import Toast from '../../components/common/Toast';

export default function CompletionValidationPage() {
  const { showToast } = useOutletContext() || {};
  const [queue, setQueue] = useState(mockCompletionQueue);
  const [localToast, setLocalToast] = useState(null);

  const notify = (msg, type) => {
    if (showToast) showToast(msg, type);
    else setLocalToast({ message: msg, type });
  };

  const handleValidate = (studentId, studentName) => {
    setQueue(prev => prev.map(s => s.studentId !== studentId ? s : { ...s, stage3Unlocked: true }));
    notify(`✅ ${studentName}'s completion validated! Stage 3 (Post-Internship) is now unlocked.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {localToast && <Toast message={localToast.message} type={localToast.type} onClose={() => setLocalToast(null)} />}

      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: theme.colors.textMain }}>Completion Validation</h1>
        <p style={{ margin: '4px 0 0', color: theme.colors.textMuted, fontSize: '0.875rem' }}>Validate students who have completed all OJT hours and uploaded their completion documents to unlock Stage 3.</p>
      </div>

      {queue.length === 0 ? (
        <div style={{ ...commonStyles.dashboardCard, padding: '48px', textAlign: 'center', color: theme.colors.textMuted }}>
          <CheckCircle size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No students pending completion validation.</p>
        </div>
      ) : (
        queue.map(student => (
          <div key={student.studentId} style={{ ...commonStyles.dashboardCard, padding: '24px', border: student.stage3Unlocked ? '1px solid #bbf7d0' : `1px solid ${theme.colors.border}`, backgroundColor: student.stage3Unlocked ? '#f0fdf4' : '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <img src={student.avatar} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%' }} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: theme.colors.textMain }}>{student.studentName}</div>
                <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted, marginBottom: '14px' }}>{student.company}</div>

                {/* Hours check */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <div style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: student.renderedHours >= student.requiredHours ? '#dcfce7' : '#fef9c3', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color={student.renderedHours >= student.requiredHours ? '#16a34a' : '#d97706'} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: student.renderedHours >= student.requiredHours ? '#15803d' : '#92400e' }}>
                      {student.renderedHours}/{student.requiredHours} hrs {student.renderedHours >= student.requiredHours ? '✓' : ''}
                    </span>
                  </div>
                  <div style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: student.certificateUploaded ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck size={16} color={student.certificateUploaded ? '#16a34a' : '#dc2626'} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: student.certificateUploaded ? '#15803d' : '#991b1b' }}>
                      Certificate of Completion {student.certificateUploaded ? '✓' : '✗'}
                    </span>
                  </div>
                  <div style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: student.supervisorEvalUploaded ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck size={16} color={student.supervisorEvalUploaded ? '#16a34a' : '#dc2626'} />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: student.supervisorEvalUploaded ? '#15803d' : '#991b1b' }}>
                      Supervisor Evaluation {student.supervisorEvalUploaded ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {student.stage3Unlocked ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                    <CheckCircle size={18} /> Stage 3 Unlocked — Portfolio submission enabled
                  </div>
                ) : (
                  <button
                    onClick={() => handleValidate(student.studentId, student.studentName)}
                    disabled={!student.certificateUploaded || !student.supervisorEvalUploaded || student.renderedHours < student.requiredHours}
                    style={{ ...commonStyles.dashboardBtn, ...commonStyles.dashboardBtnPrimary, gap: '8px',
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                      opacity: (!student.certificateUploaded || !student.supervisorEvalUploaded) ? 0.5 : 1 }}>
                    <Unlock size={16} /> Validate & Unlock Stage 3
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
