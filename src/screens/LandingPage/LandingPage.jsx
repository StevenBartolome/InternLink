import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import Features from '../../components/Features/Features';
import Stats from '../../components/Stats/Stats';
import Footer from '../../components/Footer/Footer';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      <Navbar onLogin={() => onNavigate('login')} onRegister={() => onNavigate('register')} />
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
};

export default LandingPage;
