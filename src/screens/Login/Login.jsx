import React, { useState } from 'react';
import './Login.css';
import Modal from '../../components/Modal/Modal';

const Login = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <div className="auth-split">
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          onNavigate('studentDashboard'); // Redirect to dashboard
        }} 
        title="Login Successful" 
        message="Welcome back to InternLink! Redirecting you to your dashboard mock shortly." 
      />
      {/* Left Brand Side */}
      <div className="auth-brand-side">
        <div className="brand-header">
          <div className="brand-logo">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <span>InternLink</span>
        </div>
        
        <div className="brand-content">
          <h1>
            Building your <br />
            <span className="text-yellow">professional career</span> <br />
            together.
          </h1>
          <p>
            Access your profile, track applications, and manage your 
            internships securely through our unified portal.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="back-bar">
          <button className="btn-back-link" onClick={() => onNavigate('landing')}>
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-high">
            <div className="form-group-high">
              <label htmlFor="email">Email or Username</label>
              <div className="input-with-icon">
                <input type="email" id="email" placeholder="name@example.com or username" required />
                <i className="fa-regular fa-envelope"></i>
              </div>
            </div>

            <div className="form-group-high">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input type="password" id="password" placeholder="••••••••••••" required />
                <i className="fa-regular fa-eye-slash"></i>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Keep me logged in
              </label>
              <span className="forgot-link">Forgot password?</span>
            </div>

            <button type="submit" className="btn-login-high">
              Log In <i className="fa-solid fa-arrow-right-to-bracket"></i>
            </button>
          </form>

          <p className="auth-switch-footer">
            Don't have an account? <span onClick={() => onNavigate('register')}>Register here</span>
          </p>

          <div className="info-banner">
            <i className="fa-solid fa-circle-info"></i>
            <div>
              <h4>Student & Employer Login</h4>
              <p>The system automatically detects your account type and redirects you to the appropriate dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
