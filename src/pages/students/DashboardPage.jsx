import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationRecords, progressState, studentProfile } from '../../services/mocks/mockData';
import { FileText, CheckCircle2, Clock, Briefcase, ArrowRight, Star } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isSmallMobile = useMediaQuery('(max-width: 640px)');
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredApp, setHoveredApp] = useState(null);
  const [hoveredShortcut, setHoveredShortcut] = useState(null);
  const [hoveredTip, setHoveredTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { 
      title: 'Applications', 
      value: applicationRecords.length, 
      icon: <FileText size={24} />, 
      color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' 
    },
    { 
      title: 'Approved', 
      value: applicationRecords.filter(a => a.status === 'Approved').length, 
      icon: <CheckCircle2 size={24} />, 
      color: 'linear-gradient(135deg, #10B981, #047857)' 
    },
    { 
      title: 'Hours Rendered', 
      value: `${progressState.hoursCompleted}h`, 
      icon: <Clock size={24} />, 
      color: 'linear-gradient(135deg, #F59E0B, #B45309)' 
    },
    { 
      title: 'Shortlisted', 
      value: 1, 
      icon: <Star size={24} />, 
      color: 'linear-gradient(135deg, #8B5CF6, #5B21B6)' 
    }
  ];

  const hoursPercent = Math.round((progressState.hoursCompleted / progressState.hoursTotal) * 100);

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
      backgroundImage: `radial-gradient(at 0% 0%, rgba(255,255,255,0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255,255,255,0.05) 0px, transparent 50%), ${theme.gradients.primary}`,
      color: theme.colors.white,
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(30, 64, 175, 0.4)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isSmallMobile ? 'flex-start' : 'center',
      position: 'relative',
      overflow: 'hidden',
      flexDirection: isSmallMobile ? 'column' : 'row',
      gap: isSmallMobile ? '16px' : '0',
    },
    welcomeText: {
      h1: {
        fontSize: '24px',
        margin: '0 0 4px 0',
        color: theme.colors.white,
      },
      p: {
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.9)',
        margin: 0,
      }
    },
    courseTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      backdropFilter: 'blur(4px)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallMobile ? '1fr' : (isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
      gap: '20px',
    },
    statCard: (index, isHovered) => ({
      backgroundColor: theme.colors.bgPrimary,
      padding: '24px',
      borderRadius: '16px',
      boxShadow: isHovered ? '0 12px 20px -5px rgba(0, 0, 0, 0.08)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: `1px solid ${isHovered ? 'rgba(96, 165, 250, 0.3)' : theme.colors.glassBorder}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'none',
      opacity: isVisible ? 1 : 0,
      animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${0.05 + index * 0.05}s`,
    }),
    statIconWrapper: (color, isHovered) => ({
      width: '52px',
      height: '52px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.colors.white,
      background: color,
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'scale(1.1) rotate(3deg)' : 'none',
    }),
    layout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
      gap: '24px',
      alignItems: 'start',
    },
    dashCard: {
      backgroundColor: theme.colors.bgPrimary,
      padding: '20px',
      borderRadius: '16px',
      border: `1px solid ${theme.colors.glassBorder}`,
      boxShadow: theme.shadows.sm,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '24px',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #F1F5F9',
      paddingBottom: '12px',
      h3: {
        fontSize: '16px',
        color: theme.colors.textMain,
        margin: 0,
      }
    },
    placementBrief: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      padding: '16px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.5)',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    },
    miniAppItem: (isHovered) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      borderRadius: '10px',
      backgroundColor: isHovered ? theme.colors.white : theme.colors.bgSecondary,
      border: `1px solid ${isHovered ? theme.colors.glassBorder : 'transparent'}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
    }),
    miniStatus: (status) => {
      const colors = {
        approved: { bg: '#D1FAE5', color: '#059669' },
        pending: { bg: '#FEF3C7', color: '#D97706' },
        rejected: { bg: '#FEE2E2', color: '#DC2626' }
      };
      const color = colors[status.toLowerCase()] || { bg: '#f3f4f6', color: '#374151' };
      return {
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontWeight: 500,
        backgroundColor: color.bg,
        color: color.color
      };
    },
    shortcutBtn: (isHovered) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '20px 16px',
      backgroundColor: theme.colors.white,
      border: `1px solid ${isHovered ? 'rgba(96, 165, 250, 0.4)' : '#E2E8F0'}`,
      borderRadius: '16px',
      cursor: 'pointer',
      color: theme.colors.textDark,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isHovered ? '0 10px 20px -5px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
      transform: isHovered ? 'translateY(-2px)' : 'none',
    }),
    tipItem: (isHovered) => ({
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.white,
      padding: '14px',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      border: `1px solid ${isHovered ? 'rgba(59, 130, 246, 0.2)' : 'rgba(226, 232, 240, 0.6)'}`,
      transition: 'transform 0.2s ease',
      transform: isHovered ? 'translateX(4px)' : 'none',
    })
  };

  return (
    <div style={styles.container}>
      {/* Dynamic Keyframes for simple animations */}
      <style>
        {`
          @keyframes wave {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
        `}
      </style>

      <div style={styles.welcomeBanner}>
        <div style={styles.welcomeText}>
          <h1 style={styles.welcomeText.h1}>
            Welcome back, {studentProfile.name.split(' ')[0]}! 
            <span style={{ display: 'inline-block', animation: 'wave 2.5s infinite', transformOrigin: '70% 70%' }}>👋</span>
          </h1>
          <p style={styles.welcomeText.p}>Here's an overview of your internship progress and applications.</p>
        </div>
        <div>
          <span style={styles.courseTag}>{studentProfile.course}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            style={styles.statCard(index, hoveredStat === index)}
            onMouseEnter={() => setHoveredStat(index)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div style={styles.statIconWrapper(stat.color, hoveredStat === index)}>
              {stat.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: theme.colors.textMuted }}>{stat.title}</label>
              <h3 style={{ fontSize: '24px', color: theme.colors.textMain, margin: '2px 0 0 0' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.layout}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Progress Card */}
          <div style={styles.dashCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeader.h3}>Active Placement</h3>
              <button 
                onClick={() => navigate('/progress')} 
                style={{ ...commonStyles.dashboardBtn, backgroundColor: 'transparent', color: theme.colors.primary, fontSize: '13px', fontWeight: 600 }}
              >
                View Progress <ArrowRight size={16} />
              </button>
            </div>
            <div style={styles.placementBrief}>
              <div>
                <h4 style={{ fontSize: '15px', color: theme.colors.textMain, margin: 0 }}>{progressState.company}</h4>
                <p style={{ fontSize: '13px', color: theme.colors.textMuted, margin: '4px 0 0 0' }}>Supervisor: {progressState.supervisor}</p>
              </div>
              <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle stroke={theme.colors.bgSecondary} strokeWidth="6" fill="transparent" r="30" cx="36" cy="36"/>
                  <circle 
                    stroke={theme.colors.primary} 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    fill="transparent" 
                    r="30" 
                    cx="36" 
                    cy="36" 
                    style={{ 
                      strokeDasharray: 188.49, 
                      strokeDashoffset: 188.49 - (188.49 * hoursPercent) / 100,
                      transition: 'stroke-dashoffset 1.5s ease-in-out'
                    }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.textMain }}>{hoursPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div style={styles.dashCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeader.h3}>Recent Applications</h3>
              <button 
                onClick={() => navigate('/applications')} 
                style={{ ...commonStyles.dashboardBtn, backgroundColor: 'transparent', color: theme.colors.primary, fontSize: '13px', fontWeight: 600 }}
              >
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applicationRecords.slice(0, 3).map(app => (
                <div 
                  key={app.id} 
                  style={styles.miniAppItem(hoveredApp === app.id)}
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: theme.colors.bgPrimary, border: `1px solid ${theme.colors.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: theme.colors.primary, borderRadius: '8px', fontSize: '14px' }}>
                      {app.company.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textMain, display: 'block' }}>{app.position}</span>
                      <span style={{ fontSize: '12px', color: theme.colors.textMuted, display: 'block' }}>{app.company}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={styles.miniStatus(app.status)}>
                      {app.status}
                    </span>
                    <ArrowRight 
                      size={16} 
                      style={{ 
                        color: theme.colors.primary, 
                        opacity: hoveredApp === app.id ? 1 : 0, 
                        transform: hoveredApp === app.id ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'all 0.2s ease'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={styles.dashCard}>
            <h3 style={styles.cardHeader.h3}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => navigate('/internships')} 
                style={styles.shortcutBtn(hoveredShortcut === 'find')}
                onMouseEnter={() => setHoveredShortcut('find')}
                onMouseLeave={() => setHoveredShortcut(null)}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', color: '#2563eb', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: hoveredShortcut === 'find' ? 'scale(1.1)' : 'none' }}>
                  <Briefcase size={20} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMain }}>Find Internships</span>
              </button>
              <button 
                onClick={() => navigate('/profile')} 
                style={styles.shortcutBtn(hoveredShortcut === 'profile')}
                onMouseEnter={() => setHoveredShortcut('profile')}
                onMouseLeave={() => setHoveredShortcut(null)}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf5ff', color: '#9333ea', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: hoveredShortcut === 'profile' ? 'scale(1.1)' : 'none' }}>
                  <FileText size={20} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMain }}>Update Resume</span>
              </button>
            </div>
          </div>

          <div style={{ ...styles.dashCard, background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
            <h3 style={styles.cardHeader.h3}>System Guidance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                "Complete 100% of your <strong>skills manager profile</strong> to increase matching accuracy.",
                "Don't forget to submit your weekly log hours every Friday afternoon."
              ].map((tip, idx) => (
                <div 
                  key={idx} 
                  style={styles.tipItem(hoveredTip === idx)}
                  onMouseEnter={() => setHoveredTip(idx)}
                  onMouseLeave={() => setHoveredTip(null)}
                >
                  <div style={{ width: '8px', height: '8px', backgroundColor: theme.colors.primary, borderRadius: '50%', marginTop: '5px', flexShrink: 0, animation: 'pulse 2s infinite' }}></div>
                  <p style={{ fontSize: '13px', color: theme.colors.textDark, lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: tip }}></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
