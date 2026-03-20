import React, { useState } from 'react';
import '../Login/Login.css'; // Reusing shared styles
import Modal from '../../components/Modal/Modal';
const Register = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="auth-split">
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          onNavigate('login'); // Switch to login screen on close
        }} 
        title="Registration Successful" 
        message="Your account has been created! You can now login using your credentials." 
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
            <h2>Create Account</h2>
            <p>Step {step} of 3: {step === 1 ? 'Choose Role' : step === 2 ? 'Account Info' : 'Details'}</p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
            <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-high">
            {step === 1 && (
              <div className="form-step">
                <div className="form-group-high">
                  <label>I am registering as a:</label>
                  <div className="role-selector">
                    <button 
                      type="button" 
                      className={`btn-role ${role === 'student' ? 'active' : ''}`}
                      onClick={() => setRole('student')}
                    >
                      <i className="fa-solid fa-user-graduate"></i> Student
                    </button>
                    <button 
                      type="button" 
                      className={`btn-role ${role === 'employer' ? 'active' : ''}`}
                      onClick={() => setRole('employer')}
                    >
                      <i className="fa-solid fa-building"></i> Employer
                    </button>
                  </div>
                </div>
                <button type="button" className="btn-login-high" onClick={nextStep}>
                  Next <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <div className="form-row">
                  <div className="form-group-high">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-with-icon">
                      <input type="text" id="firstName" placeholder="John" required />
                      <i className="fa-regular fa-user"></i>
                    </div>
                  </div>
                  <div className="form-group-high">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-with-icon">
                      <input type="text" id="lastName" placeholder="Doe" required />
                      <i className="fa-regular fa-user"></i>
                    </div>
                  </div>
                </div>

                <div className="form-group-high">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-with-icon">
                    <input type="tel" id="phone" placeholder="+63 912 345 6789" required />
                    <i className="fa-solid fa-phone"></i>
                  </div>
                </div>

                <div className="form-group-high">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <input type="email" id="email" placeholder="you@example.com" required />
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn-secondary" onClick={prevStep}>Back</button>
                  <button type="button" className="btn-login-high" onClick={nextStep}>Next</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <div className="form-group-high">
                  <label htmlFor="password">Create Password</label>
                  <div className="input-with-icon">
                    <input type="password" id="password" placeholder="••••••••••••" required />
                    <i className="fa-regular fa-eye-slash"></i>
                  </div>
                </div>

                <div className="form-group-high">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <input type="password" id="confirmPassword" placeholder="••••••••••••" required />
                    <i className="fa-regular fa-eye-slash"></i>
                  </div>
                </div>

                <div className="confirmation-card">
                  <h4>Account Summary</h4>
                  <p><strong>Role Selection:</strong> {role === 'student' ? '🎓 Student' : '🏢 Employer'}</p>
                  <p>You can configure your complete profile, add detailed skills, or define company structures once registered successfully.</p>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="btn-secondary" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn-login-high">Register</button>
                </div>
              </div>
            )}
          </form>

          <p className="auth-switch-footer">
            Already have an account? <span onClick={() => onNavigate('login')}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
