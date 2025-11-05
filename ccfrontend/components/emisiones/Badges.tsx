// Tipos de estado para las emisiones
export type EmissionStatus =
  | 'draft'
  | 'ready'
  | 'sent'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'cancelled';

// Badge de estado de emisión
interface EmissionStatusBadgeProps {
  status: EmissionStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function EmissionStatusBadge({
  status,
  size = 'md',
}: EmissionStatusBadgeProps) {
  const getStatusConfig = (status: EmissionStatus) => {
    switch (status) {
      case 'draft':
        return {
          icon: 'edit',
          label: 'Borrador',
          className: 'status-badge draft',
        };
      case 'ready':
        return {
          icon: 'check_circle',
          label: 'Lista',
          className: 'status-badge ready',
        };
      case 'sent':
        return {
          icon: 'send',
          label: 'Enviada',
          className: 'status-badge sent',
        };
      case 'paid':
        return {
          icon: 'paid',
          label: 'Pagada',
          className: 'status-badge paid',
        };
      case 'partial':
        return {
          icon: 'schedule',
          label: 'Parcial',
          className: 'status-badge partial',
        };
      case 'overdue':
        return {
          icon: 'warning',
          label: 'Vencida',
          className: 'status-badge overdue',
        };
      case 'cancelled':
        return {
          icon: 'cancel',
          label: 'Cancelada',
          className: 'status-badge cancelled',
        };
      default:
        return {
          icon: 'help',
          label: 'Desconocido',
          className: 'status-badge unknown',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`${config.className} ${size}`}>
      <i className='material-icons'>{config.icon}</i>
      <span>{config.label}</span>

      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-badge.sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .status-badge.lg {
          padding: 0.5rem 1rem;
          font-size: 1rem;
        }

        .status-badge .material-icons {
          font-size: 16px;
        }

        .status-badge.sm .material-icons {
          font-size: 14px;
        }

        .status-badge.lg .material-icons {
          font-size: 18px;
        }

        .status-badge.draft {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
          border: 1px solid rgba(108, 117, 125, 0.2);
        }

        .status-badge.ready {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          border: 1px solid rgba(13, 110, 253, 0.2);
        }

        .status-badge.sent {
          background: rgba(102, 16, 242, 0.1);
          color: #6610f2;
          border: 1px solid rgba(102, 16, 242, 0.2);
        }

        .status-badge.paid {
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
          border: 1px solid rgba(25, 135, 84, 0.2);
        }

        .status-badge.partial {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.2);
        }

        .status-badge.overdue {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.2);
        }

        .status-badge.cancelled {
          background: rgba(52, 58, 64, 0.1);
          color: #343a40;
          border: 1px solid rgba(52, 58, 64, 0.2);
        }

        .status-badge.unknown {
          background: rgba(173, 181, 189, 0.1);
          color: #adb5bd;
          border: 1px solid rgba(173, 181, 189, 0.2);
        }
      `}</style>
    </span>
  );
}

// Badge de tipo de emisión
interface EmissionTypeBadgeProps {
  type: 'gastos_comunes' | 'extraordinaria' | 'multa' | 'interes';
  size?: 'sm' | 'md' | 'lg';
}

export function EmissionTypeBadge({
  type,
  size = 'md',
}: EmissionTypeBadgeProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'gastos_comunes':
        return {
          icon: 'home',
          label: 'Gastos Comunes',
          className: 'type-badge common',
        };
      case 'extraordinaria':
        return {
          icon: 'star',
          label: 'Extraordinaria',
          className: 'type-badge extraordinary',
        };
      case 'multa':
        return {
          icon: 'gavel',
          label: 'Multa',
          className: 'type-badge fine',
        };
      case 'interes':
        return {
          icon: 'trending_up',
          label: 'Interés',
          className: 'type-badge interest',
        };
      default:
        return {
          icon: 'receipt',
          label: 'Emisión',
          className: 'type-badge default',
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <span className={`${config.className} ${size}`}>
      <i className='material-icons'>{config.icon}</i>
      <span>{config.label}</span>

      <style jsx>{`
        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .type-badge.sm {
          padding: 0.125rem 0.375rem;
          font-size: 0.6875rem;
        }

        .type-badge.lg {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .type-badge .material-icons {
          font-size: 14px;
        }

        .type-badge.sm .material-icons {
          font-size: 12px;
        }

        .type-badge.lg .material-icons {
          font-size: 16px;
        }

        .type-badge.common {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
        }

        .type-badge.extraordinary {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }

        .type-badge.fine {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .type-badge.interest {
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
        }

        .type-badge.default {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }
      `}</style>
    </span>
  );
}

// Badge de prioridad
interface PriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return {
          icon: 'keyboard_arrow_down',
          label: 'Baja',
          className: 'priority-badge low',
        };
      case 'normal':
        return {
          icon: 'remove',
          label: 'Normal',
          className: 'priority-badge normal',
        };
      case 'high':
        return {
          icon: 'keyboard_arrow_up',
          label: 'Alta',
          className: 'priority-badge high',
        };
      case 'urgent':
        return {
          icon: 'priority_high',
          label: 'Urgente',
          className: 'priority-badge urgent',
        };
      default:
        return {
          icon: 'help',
          label: 'Normal',
          className: 'priority-badge normal',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span className={`${config.className} ${size}`}>
      <i className='material-icons'>{config.icon}</i>
      <span>{config.label}</span>

      <style jsx>{`
        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .priority-badge.sm {
          padding: 0.125rem 0.375rem;
          font-size: 0.6875rem;
        }

        .priority-badge.lg {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .priority-badge .material-icons {
          font-size: 14px;
        }

        .priority-badge.sm .material-icons {
          font-size: 12px;
        }

        .priority-badge.lg .material-icons {
          font-size: 16px;
        }

        .priority-badge.low {
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
        }

        .priority-badge.normal {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }

        .priority-badge.high {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }

        .priority-badge.urgent {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
      `}</style>
    </span>
  );
}

