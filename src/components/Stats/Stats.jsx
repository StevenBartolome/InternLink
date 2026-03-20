import React from 'react';
import '../../assets/css/students/Stats.css';

const Stats = () => {
  return (
    <section className="stats-banner" id="impact">
      <div className="stats-grid">
        <div className="stat-item">
          <h3>1.2K+</h3>
          <p>Students Placed</p>
        </div>
        <div className="stat-item">
          <h3>350+</h3>
          <p>Active Companies</p>
        </div>
        <div className="stat-item">
          <h3>95%</h3>
          <p>Success Match Rate</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
