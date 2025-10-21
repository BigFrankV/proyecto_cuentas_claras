import React from 'react';

interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  open: { 
    label: 'Abierto', 
    color: '#1565C0', 
    bg: '#E3F2FD', 
    border: '#2196F3',
    icon: 'radio_button_unchecked'
  },
  'in-progress': { 
    label: 'En Progreso', 
    color: '#F57F17', 
    bg: '#FFF8E1', 
    border: '#FFEB3B',
    icon: 'schedule'
  },
  resolved: { 
    label: 'Resuelto', 
    color: '#2E7D32', 
    bg: '#E8F5E9', 
    border: '#4CAF50',
    icon: 'check_circle'
  },
  closed: { 
    label: 'Cerrado', 
    color: '#757575', 
    bg: '#F5F5F5', 
    border: '#9E9E9E',
    icon: 'cancel'
  },
  escalated: { 
    label: 'Escalado', 
    color: '#C62828', 
    bg: '#FFEBEE', 
    border: '#F44336',
    icon: 'priority_high'
  }
};

const sizeConfig = {
  sm: {
    fontSize: '0.688rem',
    padding: '0.125rem 0.5rem',
    iconSize: '14px'
  },
  md: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    iconSize: '16px'
  },
  lg: {
    fontSize: '0.875rem',
    padding: '0.375rem 1rem',
    iconSize: '18px'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  return (
    <span
      className={`status-badge status-${status} d-inline-flex align-items-center`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '1rem',
        fontSize: sizeStyle.fontSize,
        fontWeight: '500',
        padding: sizeStyle.padding,
        gap: '0.25rem',
        whiteSpace: 'nowrap'
      }}
    >
      <i className='material-icons' style={{ fontSize: sizeStyle.iconSize }}>
        {config.icon}
      </i>
      {config.label}
    </span>
  );
};

export default StatusBadge;