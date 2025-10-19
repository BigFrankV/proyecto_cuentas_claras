interface FileIconProps {
  fileName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FileIcon({ fileName, size = 'md' }: FileIconProps) {
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
    sm: { width: '24px', height: '24px', fontSize: '14px' },
    md: { width: '32px', height: '32px', fontSize: '18px' },
    lg: { width: '48px', height: '48px', fontSize: '24px' },
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
        borderRadius: '0.375rem',
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
