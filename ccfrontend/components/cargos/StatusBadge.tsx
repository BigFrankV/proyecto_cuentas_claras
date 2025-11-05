import React from 'react';

export interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: 'schedule',
    className: 'status-badge pending',
  },
  approved: {
    label: 'Aprobado',
    icon: 'check_circle',
    className: 'status-badge approved',
  },
  rejected: {
    label: 'Rechazado',
    icon: 'cancel',
    className: 'status-badge rejected',
  },
  paid: {
    label: 'Pagado',
    icon: 'paid',
    className: 'status-badge paid',
  },
  partial: {
    label: 'Parcial',
    icon: 'schedule',
    className: 'status-badge partial',
  },
};

export default function StatusBadge({
  status,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`${config.className} ${className}`}>
      <i className='material-icons'>{config.icon}</i>
      {config.label}
    </span>
  );
}
