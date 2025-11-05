import React from 'react';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined';
}

const categoryConfig: Record<string, { color: string; icon: string }> = {
  mantenimiento: { color: '#6f42c1', icon: 'build' },
  seguridad: { color: '#dc3545', icon: 'security' },
  convivencia: { color: '#17a2b8', icon: 'people' },
  servicios: { color: '#28a745', icon: 'home_repair_service' },
  administracion: { color: '#fd7e14', icon: 'admin_panel_settings' },
  otros: { color: '#6c757d', icon: 'help_outline' },
  default: { color: '#007bff', icon: 'category' },
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

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  variant = 'default',
}) => {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
  const config = categoryConfig[normalizedCategory] || categoryConfig.default;
  const sizeStyle = sizeConfig[size];

  if (!config) {
    return null;
  }

  const baseStyle = {
    borderRadius: '0.375rem',
    fontSize: sizeStyle.fontSize,
    fontWeight: '500' as const,
    padding: sizeStyle.padding,
    gap: '0.25rem',
    whiteSpace: 'nowrap' as const,
    textTransform: 'capitalize' as const,
  };

  const variantStyle =
    variant === 'outlined'
      ? {
          backgroundColor: 'transparent',
          color: config.color,
          border: `1px solid ${config.color}`,
        }
      : {
          backgroundColor: `${config.color}15`,
          color: config.color,
          border: `1px solid ${config.color}30`,
        };

  return (
    <span
      className={`category-badge category-${normalizedCategory} d-inline-flex align-items-center`}
      style={{
        ...baseStyle,
        ...variantStyle,
      }}
    >
      <i className='material-icons' style={{ fontSize: sizeStyle.iconSize }}>
        {config.icon}
      </i>
      {category}
    </span>
  );
};

export default CategoryBadge;

