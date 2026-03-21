// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Briefcase } from 'lucide-react';
import '../../assets/css/admin/AdminLoginPage.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '123') {
      // Simulate auth success
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <Briefcase size={32} className="logo-icon" />
            <span className="logo-text">InternLink <span className="logo-role">Admin</span></span>
          </div>
          <h2>System Administrator Access</h2>
          <p className="login-sub">Enter your credentials to manage the OJT program.</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="admin@gmail.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="123" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            Log In to Console
          </button>
        </form>

        <div className="login-footer">
          <p>Protected System. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
