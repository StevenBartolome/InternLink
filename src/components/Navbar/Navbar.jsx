import React from 'react';
import '../../assets/css/students/Navbar.css';

const Navbar = ({ onLogin, onRegister }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <i className="fa-solid fa-graduation-cap"></i>
        <span>InternLink</span>
      </div>
      <div className="nav-links">
        <a href="#flow" className="nav-link">Process</a>
        <a href="#features" className="nav-link">Features</a>
        <a href="#impact" className="nav-link">Impact</a>
      </div>
      <div className="nav-buttons">
        <button className="btn btn-ghost" onClick={onLogin}>Login</button>
        <button className="btn btn-primary" onClick={onRegister}>Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;
