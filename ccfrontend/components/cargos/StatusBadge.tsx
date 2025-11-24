import React from 'react';

export interface StatusBadgeProps {
  status: 'pending' | 'pendiente' | 'approved' | 'rejected' | 'paid' | 'pagado' | 'partial' | 'parcial' | 'vencido';
  className?: string;
}

const statusConfig: Record<string, { label: string; icon: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    icon: 'schedule',
    className: 'status-badge pending',
  },
  pendiente: {
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
  pagado: {
    label: 'Pagado',
    icon: 'paid',
    className: 'status-badge paid',
  },
  partial: {
    label: 'Parcial',
    icon: 'schedule',
    className: 'status-badge partial',
  },
  parcial: {
    label: 'Parcial',
    icon: 'schedule',
    className: 'status-badge partial',
  },
  vencido: {
    label: 'Vencido',
    icon: 'error',
    className: 'status-badge rejected',
  },
};

export default function StatusBadge({
  status,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`${config.className} ${className}`}>
      <i className='material-icons'>{config.icon}</i>
      {config.label}
    </span>
  );
}
