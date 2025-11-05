interface AccessBadgeProps {
  access: 'public' | 'residents' | 'owners' | 'admin';
  size?: 'sm' | 'md';
}

export default function AccessBadge({ access, size = 'md' }: AccessBadgeProps) {
  const getAccessConfig = (level: AccessBadgeProps['access']) => {
    const configs = {
      public: {
        text: 'Público',
        icon: 'public',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        textColor: '#4CAF50',
      },
      residents: {
        text: 'Residentes',
        icon: 'home',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        textColor: '#2196F3',
      },
      owners: {
        text: 'Propietarios',
        icon: 'vpn_key',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        textColor: '#FF9800',
      },
      admin: {
        text: 'Administración',
        icon: 'admin_panel_settings',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        textColor: '#F44336',
      },
    };
    return configs[level];
  };

  const config = getAccessConfig(access);
  const sizeClass = size === 'sm' ? 'access-badge-sm' : 'access-badge-md';

  return (
    <span
      className={`access-badge ${sizeClass}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
        fontWeight: '500',
        gap: '0.25rem',
      }}
    >
      <i
        className='material-icons'
        style={{ fontSize: size === 'sm' ? '14px' : '16px' }}
      >
        {config.icon}
      </i>
      {config.text}
    </span>
  );
}

