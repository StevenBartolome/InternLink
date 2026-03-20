import React from 'react';
import '../../assets/css/students/SystemFlow.css';

const SystemFlow = () => {
  const steps = [
    { number: '1', title: 'Company Registration', desc: 'Admin adds partner companies to the platform.', icon: 'fa-building' },
    { number: '2', title: 'Internship Posting', desc: 'Companies post internship openings with skill requirements.', icon: 'fa-file-signature' },
    { number: '3', title: 'Student Application', desc: 'Students browse matched opportunities and apply.', icon: 'fa-paper-plane' },
    { number: '4', title: 'Approval', desc: 'OJT Head approves the internship placement.', icon: 'fa-signature' },
    { number: '5', title: 'Internship Monitoring', desc: 'Students submit weekly reports; OJT Head monitors progress.', icon: 'fa-chart-line' },
    { number: '6', title: 'Evaluation', desc: 'Employers evaluate students; OJT Head assigns final grades.', icon: 'fa-star' }
  ];

  return (
    <section className="section-flow" id="flow">
      <div className="section-header">
        <h2>Recommended System Flow</h2>
        <p>A complete lifecycle for internship management, matching, and monitoring.</p>
      </div>

      <div className="flow-timeline">
        {steps.map((step, index) => (
          <div className="flow-item" key={index}>
            <div className="flow-number">{step.number}</div>
            <div className="flow-content glass-effect">
              <div className="flow-icon">
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
            {index < steps.length - 1 && <div className="flow-connector"></div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SystemFlow;
