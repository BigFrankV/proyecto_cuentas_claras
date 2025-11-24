import React from 'react';

export interface TypeBadgeProps {
  type: string;
  className?: string;
}

const typeConfig: Record<string, { label: string; className: string }> = {
  administration: {
    label: 'Administración',
    className: 'charge-type administration',
  },
  maintenance: {
    label: 'Mantenimiento',
    className: 'charge-type maintenance',
  },
  service: {
    label: 'Servicios',
    className: 'charge-type service',
  },
  insurance: {
    label: 'Seguros',
    className: 'charge-type insurance',
  },
  gastos_comunes: {
    label: 'Gastos Comunes',
    className: 'charge-type administration',
  },
  fondo_reserva: {
    label: 'Fondo de Reserva',
    className: 'charge-type insurance',
  },
  cuota_extraordinaria: {
    label: 'Cuota Extraordinaria',
    className: 'charge-type maintenance',
  },
  other: {
    label: 'Otros',
    className: 'charge-type other',
  },
};

export default function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.other;

  return (
    <span className={`${config.className} ${className}`}>{config.label}</span>
  );
}
