// src/screens/LandingPage/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import Stats from '../../components/Stats/Stats';
import Footer from '../../components/Footer/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    landingPage: {
      display: 'flex',
      flexDirection: 'column',
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
