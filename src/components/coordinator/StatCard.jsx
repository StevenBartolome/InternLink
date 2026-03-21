import React from 'react';
import '../../assets/css/coordinator/StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon-wrapper">
        {Icon && <Icon size={24} className="stat-card-icon" />}
      </div>
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <h3 className="stat-value">{value}</h3>
        {trend && (
          <span className={`stat-trend ${trend.type}`}>
            {trend.type === 'up' ? '↑' : '↓'} {trend.value} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
