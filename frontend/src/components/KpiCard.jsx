import React from 'react';

const KpiCard = ({ title, value, subtext, icon: Icon, color = 'cyan', warning = false }) => {
  return (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-info">
        <span className="kpi-label">{title}</span>
        <span className="kpi-value">{value}</span>
        {subtext && (
          <span className={`kpi-subtext ${warning ? 'warning' : ''}`}>
            {subtext}
          </span>
        )}
      </div>
      {Icon && (
        <div className={`kpi-icon-box ${color}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default KpiCard;
