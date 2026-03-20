import React from 'react';
import '../../assets/css/students/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} InternLink. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
