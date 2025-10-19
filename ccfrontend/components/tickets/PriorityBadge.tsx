import React from 'react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const priorityConfig = {
  low: {
    label: 'Baja',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'arrow_downward',
  },
  medium: {
    label: 'Media',
    color: '#F57F17',
    bg: '#FFF8E1',
    icon: 'remove',
  },
  high: {
    label: 'Alta',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: 'arrow_upward',
  },
  urgent: {
    label: 'Urgente',
    color: '#FFFFFF',
    bg: '#7B1FA2',
    icon: 'priority_high',
  },
};

const sizeConfig = {
  sm: {
    fontSize: '0.688rem',
    padding: '0.125rem 0.5rem',
    iconSize: '14px',
  },
  md: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    iconSize: '16px',
  },
  lg: {
    fontSize: '0.875rem',
    padding: '0.375rem 1rem',
    iconSize: '18px',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const config = priorityConfig[priority];
  const sizeStyle = sizeConfig[size];

  return (
    <span
      className={`priority-badge priority-${priority} d-inline-flex align-items-center`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: '0.375rem',
        fontSize: sizeStyle.fontSize,
        fontWeight: '500',
        padding: sizeStyle.padding,
        gap: '0.25rem',
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && (
        <i className='material-icons' style={{ fontSize: sizeStyle.iconSize }}>
          {config.icon}
        </i>
      )}
      {config.label}
    </span>
  );
};

export default PriorityBadge;
