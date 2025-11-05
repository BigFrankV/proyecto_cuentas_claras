interface TypeBadgeProps {
  type: 'system' | 'announcement' | 'reminder' | 'alert' | 'maintenance';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const typeConfig = {
  system: {
    label: 'Sistema',
    color: '#1565C0',
    bg: '#E3F2FD',
    icon: 'settings',
  },
  announcement: {
    label: 'Anuncio',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    icon: 'campaign',
  },
  reminder: {
    label: 'Recordatorio',
    color: '#F57F17',
    bg: '#FFF8E1',
    icon: 'alarm',
  },
  alert: {
    label: 'Alerta',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: 'warning',
  },
  maintenance: {
    label: 'Mantenimiento',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'build',
  },
};

const sizeConfig = {
  sm: {
    padding: '0.125rem 0.375rem',
    fontSize: '0.7rem',
    iconSize: '12px',
  },
  md: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    iconSize: '14px',
  },
  lg: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    iconSize: '16px',
  },
};

export default function TypeBadge({
  type,
  size = 'md',
  showIcon = true,
}: TypeBadgeProps) {
  const config = typeConfig[type];
  const sizing = sizeConfig[size];

  return (
    <span
      className={`type-badge ${type} ${size}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: sizing.padding,
        borderRadius: '0.375rem',
        fontSize: sizing.fontSize,
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        whiteSpace: 'nowrap',
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

