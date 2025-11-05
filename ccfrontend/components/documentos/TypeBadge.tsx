interface TypeBadgeProps {
  type: 'invoice' | 'receipt' | 'quote' | 'order';
  size?: 'sm' | 'md';
}

export default function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const getTypeConfig = (docType: TypeBadgeProps['type']) => {
    const configs = {
      invoice: {
        text: 'Factura',
        bgColor: 'rgba(40, 167, 69, 0.1)',
        textColor: '#28a745',
      },
      receipt: {
        text: 'Boleta',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        textColor: '#2196F3',
      },
      quote: {
        text: 'Cotización',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        textColor: '#FF9800',
      },
      order: {
        text: 'Orden',
        bgColor: 'rgba(156, 39, 176, 0.1)',
        textColor: '#9C27B0',
      },
    };
    return configs[docType];
  };

  const config = getTypeConfig(type);

  return (
    <span
      className={`doc-type-badge doc-type-${type}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
        fontWeight: '500',
      }}
    >
      {config.text}
    </span>
  );
}
