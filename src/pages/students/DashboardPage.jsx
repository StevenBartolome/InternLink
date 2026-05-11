import React, { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import PreInternship from '../../components/student/stages/PreInternship';
import DuringInternship from '../../components/student/stages/DuringInternship';
import PostInternship from '../../components/student/stages/PostInternship';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [isVisible, setIsVisible] = useState(false);
  
  // Use real stage from user profile, fallback to PRE_INTERNSHIP
  const [currentStage, setCurrentStage] = useState(user?.current_stage || 'PRE_INTERNSHIP');

  useEffect(() => {
    setIsVisible(true);
    if (user?.current_stage) {
      setCurrentStage(user.current_stage);
    }
  }, [user]);

  const handleDeploy = () => {
    setCurrentStage('DURING_INTERNSHIP');
  };

  const handleComplete = () => {
    setCurrentStage('POST_INTERNSHIP');
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    },
    welcomeBanner: {
      background: theme.gradients.primary,
      color: theme.colors.white,
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(30, 64, 175, 0.4)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stageIndicatorContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: '16px',
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.glassBorder}`,
      marginBottom: '16px'
    },
    stageStep: (isActive, isPast) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      flex: 1,
      opacity: isActive || isPast ? 1 : 0.5,
      position: 'relative'
    }),
    stepCircle: (isActive, isPast) => ({
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: isActive ? theme.colors.primary : (isPast ? theme.colors.success : theme.colors.bgSecondary),
      color: isActive || isPast ? theme.colors.white : theme.colors.textMuted,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      zIndex: 2,
    }),
    stepLine: (isPast) => ({
      position: 'absolute',
      top: '20px',
      left: '50%',
      width: '100%',
      height: '4px',
      backgroundColor: isPast ? theme.colors.success : theme.colors.bgSecondary,
      zIndex: 1,
    })
  };

  const stages = [
    { id: 'PRE_INTERNSHIP', title: 'Pre-Internship' },
    { id: 'DURING_INTERNSHIP', title: 'During Internship' },
    { id: 'POST_INTERNSHIP', title: 'Post-Internship' }
  ];

  const getStageIndex = (stageId) => stages.findIndex(s => s.id === stageId);
  const currentIndex = getStageIndex(currentStage);

  return (
    <div style={styles.container}>
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Welcome back, {user?.first_name}!</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Track and manage your internship journey through the 3 stages.</p>
        </div>
      </div>

      <div style={styles.stageIndicatorContainer}>
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          
          return (
            <div key={stage.id} style={styles.stageStep(isActive, isPast)}>
              {index < stages.length - 1 && <div style={styles.stepLine(isPast)} />}
              <div style={styles.stepCircle(isActive, isPast)}>
                {isPast ? '✓' : index + 1}
              </div>
              <span style={{ fontWeight: isActive ? 700 : 500, color: theme.colors.textMain }}>
                {stage.title}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px' }}>
        {currentStage === 'PRE_INTERNSHIP' && <PreInternship onDeploy={handleDeploy} />}
        {currentStage === 'DURING_INTERNSHIP' && <DuringInternship onComplete={handleComplete} />}
        {currentStage === 'POST_INTERNSHIP' && <PostInternship />}
      </div>
    </div>
  );
}
