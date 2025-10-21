interface StatusBadgeProps {
  status: 'sent' | 'draft' | 'scheduled' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig = {
  sent: { 
    label: 'Enviada', 
    color: '#2E7D32', 
    bg: '#E8F5E9', 
    border: '#4CAF50',
    icon: 'send'
  },
  draft: { 
    label: 'Borrador', 
    color: '#757575', 
    bg: '#F5F5F5', 
    border: '#9E9E9E',
    icon: 'draft'
  },
  scheduled: { 
    label: 'Programada', 
    color: '#1565C0', 
    bg: '#E3F2FD', 
    border: '#2196F3',
    icon: 'schedule'
  },
  failed: { 
    label: 'Fallida', 
    color: '#C62828', 
    bg: '#FFEBEE', 
    border: '#F44336',
    icon: 'error'
  }
};

const sizeConfig = {
  sm: {
    padding: '0.125rem 0.5rem',
    fontSize: '0.7rem',
    iconSize: '12px'
  },
  md: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    iconSize: '14px'
  },
  lg: {
    padding: '0.375rem 1rem',
    fontSize: '0.875rem',
    iconSize: '16px'
  }
};

export default function StatusBadge({ 
  status, 
  size = 'md',
  showIcon = true 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizing = sizeConfig[size];

  return (
    <span
      className={`status-badge ${status} ${size}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        padding: sizing.padding,
        borderRadius: '1rem',
        fontSize: sizing.fontSize,
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        whiteSpace: 'nowrap'
      }}
    >
      {showIcon && (
        <i className='material-icons' style={{ fontSize: sizing.iconSize }}>
          {config.icon}
        </i>
      )}
      {config.label}
    </span>
  );
}