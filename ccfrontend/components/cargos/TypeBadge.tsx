import React from 'react';

export interface TypeBadgeProps {
  type: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  className?: string;
}

const typeConfig = {
  administration: {
    label: 'Administración',
    className: 'charge-type administration'
  },
  maintenance: {
    label: 'Mantenimiento',
    className: 'charge-type maintenance'
  },
  service: {
    label: 'Servicios',
    className: 'charge-type service'
  },
  insurance: {
    label: 'Seguros',
    className: 'charge-type insurance'
  },
  other: {
    label: 'Otros',
    className: 'charge-type other'
  }
};

export default function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <span className={`${config.className} ${className}`}>
      {config.label}
    </span>
  );
}