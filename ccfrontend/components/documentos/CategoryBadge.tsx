interface CategoryBadgeProps {
  category:
    | 'legal'
    | 'financial'
    | 'technical'
    | 'administrative'
    | 'maintenance'
    | 'meeting';
  size?: 'sm' | 'md';
}

export default function CategoryBadge({
  category,
  size = 'md',
}: CategoryBadgeProps) {
  const getCategoryConfig = (cat: CategoryBadgeProps['category']) => {
    const configs = {
      legal: {
        text: 'Legal',
        icon: 'gavel',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        textColor: '#2196F3',
      },
      financial: {
        text: 'Financiero',
        icon: 'attach_money',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        textColor: '#4CAF50',
      },
      technical: {
        text: 'Técnico',
        icon: 'build',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        textColor: '#FF9800',
      },
      administrative: {
        text: 'Administrativo',
        icon: 'business',
        bgColor: 'rgba(156, 39, 176, 0.1)',
        textColor: '#9C27B0',
      },
      maintenance: {
        text: 'Mantenimiento',
        icon: 'handyman',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        textColor: '#F44336',
      },
      meeting: {
        text: 'Reuniones',
        icon: 'groups',
        bgColor: 'rgba(0, 150, 136, 0.1)',
        textColor: '#009688',
      },
    };
    return configs[cat];
  };

  const config = getCategoryConfig(category);
  const sizeClass = size === 'sm' ? 'category-badge-sm' : 'category-badge-md';

  return (
    <span
      className={`category-badge ${sizeClass}`}
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

