// src/screens/LandingPage/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar/Navbar';
import Hero from '../../../components/features/auth/Hero';
import Features from '../../../components/features/auth/Features';
import Stats from '../../../components/features/auth/Stats';
import Footer from '../../../components/layout/Footer/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    landingPage: {
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
    }
  };

  return (
    <div style={styles.landingPage}>
      <Navbar onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} />
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
};

export default LandingPage;

