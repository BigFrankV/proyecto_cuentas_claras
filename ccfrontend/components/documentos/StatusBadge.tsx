interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = (st: StatusBadgeProps['status']) => {
    const configs = {
      draft: {
        text: 'Borrador',
        bgColor: '#ffc107',
        textColor: '#000',
      },
      pending: {
        text: 'Pendiente',
        bgColor: '#17a2b8',
        textColor: '#fff',
      },
      approved: {
        text: 'Aprobado',
        bgColor: '#28a745',
        textColor: '#fff',
      },
      rejected: {
        text: 'Rechazado',
        bgColor: '#dc3545',
        textColor: '#fff',
      },
      paid: {
        text: 'Pagado',
        bgColor: '#6c757d',
        textColor: '#fff',
      },
    };
    return configs[st];
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`status-badge status-${status}`}
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
      <span
        className={`doc-status status-${status}`}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: config.textColor,
          opacity: 0.7,
        }}
      />
      {config.text}
    </span>
  );
}
