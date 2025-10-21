interface ChannelBadgeProps {
  channel: 'email' | 'sms' | 'push' | 'app';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const channelConfig = {
  email: { 
    label: 'Email', 
    color: '#1565C0', 
    bg: '#E3F2FD',
    icon: 'email'
  },
  sms: { 
    label: 'SMS', 
    color: '#2E7D32', 
    bg: '#E8F5E9',
    icon: 'sms'
  },
  push: { 
    label: 'Push', 
    color: '#F57C00', 
    bg: '#FFF8E1',
    icon: 'notifications'
  },
  app: { 
    label: 'App', 
    color: '#7B1FA2', 
    bg: '#F3E5F5',
    icon: 'phone_android'
  }
};

const sizeConfig = {
  sm: {
    padding: '0.125rem 0.375rem',
    fontSize: '0.7rem',
    iconSize: '12px'
  },
  md: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    iconSize: '14px'
  },
  lg: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    iconSize: '16px'
  }
};

export default function ChannelBadge({ 
  channel, 
  size = 'md',
  showIcon = true 
}: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const sizing = sizeConfig[size];

  return (
    <span
      className={`channel-badge ${channel} ${size}`}
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