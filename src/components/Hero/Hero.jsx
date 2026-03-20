import React from 'react';
import '../../assets/css/students/Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">
          <i className="fa-solid fa-bolt"></i>
          Skill-Based Internship Matching
        </div>
        <h1>
          InternLink – A School-Based Internship <br />
          <span className="text-gradient">Matching and Monitoring System</span>
        </h1>
        <p>
          InternLink connects students with employers based on skills and interests. simple, automated, and effective.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary">Find Internships</button>
          <button className="btn btn-ghost">Post Opportunities</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
