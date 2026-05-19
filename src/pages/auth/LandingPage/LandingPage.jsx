// src/pages/auth/LandingPage/LandingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Hero from '../../../components/features/auth/Hero';
import Features from '../../../components/features/auth/Features';
import HowItWorks from '../../../components/features/auth/HowItWorks';
import Stats from '../../../components/features/auth/Stats';
import Testimonials from '../../../components/features/auth/Testimonials';
import CTASection from '../../../components/features/auth/CTASection';
import Footer from '../../../components/layout/Footer/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const userSession = localStorage.getItem('internlink_session');

  useEffect(() => {
    if (userSession) {
      navigate(userSession);
    }
  }, [userSession, navigate]);

  const styles = {
    landingPage: {
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      scrollBehavior: 'smooth',
    }
  };

  return (
    <div style={styles.landingPage}>
      <Navbar onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;


