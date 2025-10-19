// ActivityBadge component
interface ActivityBadgeProps {
  type: 'system' | 'user' | 'security' | 'maintenance' | 'admin' | 'financial';
  size?: 'sm' | 'md' | 'lg';
}

export function ActivityBadge({ type, size = 'md' }: ActivityBadgeProps) {
  const getConfig = (activityType: string) => {
    const configs = {
      system: {
        label: 'Sistema',
        bgColor: '#17a2b8',
        textColor: '#fff',
        icon: 'settings',
      },
      user: {
        label: 'Usuario',
        bgColor: '#28a745',
        textColor: '#fff',
        icon: 'person',
      },
      security: {
        label: 'Seguridad',
        bgColor: '#dc3545',
        textColor: '#fff',
        icon: 'security',
      },
      maintenance: {
        label: 'Mantenimiento',
        bgColor: '#ffc107',
        textColor: '#212529',
        icon: 'build',
      },
      admin: {
        label: 'Administración',
        bgColor: '#6f42c1',
        textColor: '#fff',
        icon: 'admin_panel_settings',
      },
      financial: {
        label: 'Financiero',
        bgColor: '#fd7e14',
        textColor: '#fff',
        icon: 'attach_money',
      },
    };
    return configs[activityType as keyof typeof configs] || configs.system;
  };

  const config = getConfig(type);

  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1',
    lg: 'px-3 py-2',
  };

  const textSizes = {
    sm: 'small',
    md: '',
    lg: 'fs-6',
  };

  return (
    <span
      className={`activity-badge badge d-inline-flex align-items-center gap-1 ${sizeClasses[size]} ${textSizes[size]}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        fontSize:
          size === 'sm' ? '0.75rem' : size === 'lg' ? '0.875rem' : '0.8rem',
      }}
    >
      <i
        className='material-icons'
        style={{ fontSize: size === 'sm' ? '14px' : '16px' }}
      >
        {config.icon}
      </i>
      {config.label}
    </span>
  );
}

// PriorityBadge component
interface PriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const getConfig = (priorityLevel: string) => {
    const configs = {
      low: {
        label: 'Baja',
        bgColor: '#28a745',
        textColor: '#fff',
        icon: 'keyboard_arrow_down',
      },
      normal: {
        label: 'Normal',
        bgColor: '#17a2b8',
        textColor: '#fff',
        icon: 'remove',
      },
      high: {
        label: 'Alta',
        bgColor: '#ffc107',
        textColor: '#212529',
        icon: 'keyboard_arrow_up',
      },
      critical: {
        label: 'Crítica',
        bgColor: '#dc3545',
        textColor: '#fff',
        icon: 'priority_high',
      },
    };
    return configs[priorityLevel as keyof typeof configs] || configs.normal;
  };

  const config = getConfig(priority);

  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1',
    lg: 'px-3 py-2',
  };

  const textSizes = {
    sm: 'small',
    md: '',
    lg: 'fs-6',
  };

  return (
    <span
      className={`priority-badge badge d-inline-flex align-items-center gap-1 ${sizeClasses[size]} ${textSizes[size]}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        fontSize:
          size === 'sm' ? '0.75rem' : size === 'lg' ? '0.875rem' : '0.8rem',
      }}
    >
      <i
        className='material-icons'
        style={{ fontSize: size === 'sm' ? '14px' : '16px' }}
      >
        {config.icon}
      </i>
      {config.label}
    </span>
  );
}

// FileIcon component for bitacora
interface FileIconProps {
  fileName: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FileIcon({ fileName, size = 'md' }: FileIconProps) {
  const getFileType = (name: string) => {
    const extension = name.split('.').pop()?.toLowerCase();

    if (['pdf'].includes(extension || '')) {
      return 'pdf';
    }
    if (['doc', 'docx'].includes(extension || '')) {
      return 'doc';
    }
    if (['xls', 'xlsx'].includes(extension || '')) {
      return 'xlsx';
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    }
    return 'default';
  };

  const getFileConfig = (type: string) => {
    const configs = {
      pdf: {
        icon: 'picture_as_pdf',
        bgColor: '#dc3545',
        textColor: '#fff',
      },
      doc: {
        icon: 'description',
        bgColor: '#2b579a',
        textColor: '#fff',
      },
      xlsx: {
        icon: 'table_chart',
        bgColor: '#107c41',
        textColor: '#fff',
      },
      image: {
        icon: 'image',
        bgColor: '#7b1fa2',
        textColor: '#fff',
      },
      default: {
        icon: 'insert_drive_file',
        bgColor: '#6c757d',
        textColor: '#fff',
      },
    };
    return configs[type as keyof typeof configs] || configs.default;
  };

  const fileType = getFileType(fileName);
  const config = getFileConfig(fileType);

  const sizeStyles = {
    sm: { width: '20px', height: '20px', fontSize: '12px' },
    md: { width: '24px', height: '24px', fontSize: '14px' },
    lg: { width: '32px', height: '32px', fontSize: '18px' },
  };

  return (
    <div
      className={`file-icon file-icon-${fileType}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.25rem',
        flexShrink: 0,
        ...sizeStyles[size],
      }}
    >
      <i
        className='material-icons'
        style={{ fontSize: sizeStyles[size].fontSize }}
      >
        {config.icon}
      </i>
    </div>
  );
}
