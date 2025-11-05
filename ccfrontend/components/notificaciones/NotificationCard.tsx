import ChannelBadge from './ChannelBadge';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';

interface NotificationData {
  id: string;
  subject: string;
  message: string;
  type: 'system' | 'announcement' | 'reminder' | 'alert' | 'maintenance';
  status: 'sent' | 'draft' | 'scheduled' | 'failed';
  channels: ('email' | 'sms' | 'push' | 'app')[];
  audience: {
    type: 'all' | 'building' | 'unit' | 'custom';
    count: number;
    description: string;
  };
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  sentAt?: string;
  scheduledFor?: string;
  deliveryStats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  isRead?: boolean;
}

interface NotificationCardProps {
  notification: NotificationData;
  onSelect?: (notificationId: string) => void;
  onAction?: (action: string, notificationId: string) => void;
  selected?: boolean;
  className?: string;
}

export default function NotificationCard({
  notification,
  onSelect,
  onAction,
  selected = false,
  className = '',
}: NotificationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('.form-check-input, .dropdown, .btn')) {
      return;
    }

    if (onAction) {
      onAction('view', notification.id);
    }
  };

  return (
    <div
      className={`notification-card ${!notification.isRead ? 'unread' : ''} ${className}`}
      style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        boxShadow: 'var(--shadow-sm)',
        border: !notification.isRead
          ? '1px solid var(--color-primary)'
          : '1px solid #e9ecef',
        borderLeft: !notification.isRead
          ? '4px solid var(--color-primary)'
          : '1px solid #e9ecef',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onClick={handleCardClick}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div
          className='read-indicator'
          style={{
            position: 'absolute',
            top: '1rem',
            left: '0.5rem',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
          }}
        />
      )}

      {/* Header */}
      <div className='notification-card-header d-flex justify-content-between align-items-start mb-2'>
        <div className='d-flex gap-2'>
          <StatusBadge status={notification.status} size='sm' />
        </div>
        <div className='form-check' onClick={e => e.stopPropagation()}>
          <input
            className='form-check-input notification-checkbox'
            type='checkbox'
            checked={selected}
            onChange={() => onSelect?.(notification.id)}
          />
        </div>
      </div>

      {/* Subject */}
      <h6
        className='notification-subject mb-2'
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          lineHeight: '1.3',
          margin: '0 0 0.5rem 0',
        }}
      >
        {notification.subject}
      </h6>

      {/* Message Preview */}
      <p
        className='notification-excerpt text-muted mb-3'
        style={{
          fontSize: '0.875rem',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: '0 0 1rem 0',
        }}
      >
        {notification.message}
      </p>

      {/* Meta Information */}
      <div className='notification-meta mb-3'>
        <div className='notification-meta-item d-flex align-items-center mb-1'>
          <i
            className='material-icons me-1'
            style={{ fontSize: '16px', color: '#6c757d' }}
          >
            people
          </i>
          <span className='small text-muted'>
            {notification.audience.count} personas •{' '}
            {notification.audience.description}
          </span>
        </div>

        <div className='notification-meta-item d-flex align-items-center mb-1'>
          <i
            className='material-icons me-1'
            style={{ fontSize: '16px', color: '#6c757d' }}
          >
            person
          </i>
          <span className='small text-muted'>{notification.author.name}</span>
        </div>

        <div className='notification-meta-item d-flex align-items-center'>
          <i
            className='material-icons me-1'
            style={{ fontSize: '16px', color: '#6c757d' }}
          >
            schedule
          </i>
          <span className='small text-muted'>
            {notification.sentAt
              ? formatDate(notification.sentAt)
              : notification.scheduledFor
                ? `Prog: ${formatDate(notification.scheduledFor)}`
                : formatDate(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className='notification-badges d-flex flex-wrap gap-2 mb-3'>
        <TypeBadge type={notification.type} size='sm' />
      </div>

      {/* Channels */}
      <div className='notification-channels d-flex flex-wrap gap-1 mb-3'>
        {notification.channels.map(channel => (
          <ChannelBadge key={channel} channel={channel} size='sm' />
        ))}
      </div>

      {/* Delivery Stats (for sent notifications) */}
      {notification.status === 'sent' && notification.deliveryStats && (
        <div
          className='delivery-stats mb-3'
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            fontSize: '0.75rem',
          }}
        >
          <div className='row text-center'>
            <div className='col-3'>
              <div className='fw-semibold text-primary'>
                {notification.deliveryStats.delivered}
              </div>
              <div className='text-muted'>Entregados</div>
            </div>
            <div className='col-3'>
              <div className='fw-semibold text-success'>
                {notification.deliveryStats.opened}
              </div>
              <div className='text-muted'>Abiertos</div>
            </div>
            <div className='col-3'>
              <div className='fw-semibold text-info'>
                {notification.deliveryStats.clicked}
              </div>
              <div className='text-muted'>Clicks</div>
            </div>
            <div className='col-3'>
              <div className='fw-semibold text-warning'>
                {Math.round(
                  (notification.deliveryStats.opened /
                    notification.deliveryStats.delivered) *
                    100,
                )}
                %
              </div>
              <div className='text-muted'>Tasa</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className='d-flex gap-2'>
        <button
          className='btn btn-outline-primary btn-sm flex-fill'
          onClick={e => {
            e.stopPropagation();
            onAction?.('view', notification.id);
          }}
        >
          Ver detalle
        </button>

        <div className='dropdown' onClick={e => e.stopPropagation()}>
          <button
            className='btn btn-outline-secondary btn-sm dropdown-toggle'
            type='button'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            <i className='material-icons'>more_vert</i>
          </button>
          <ul className='dropdown-menu'>
            <li>
              <button
                className='dropdown-item'
                onClick={() => onAction?.('duplicate', notification.id)}
              >
                <i className='material-icons me-2'>content_copy</i>
                Duplicar
              </button>
            </li>
            <li>
              <button
                className='dropdown-item'
                onClick={() => onAction?.('edit', notification.id)}
              >
                <i className='material-icons me-2'>edit</i>
                Editar
              </button>
            </li>
            {notification.status === 'sent' && (
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onAction?.('resend', notification.id)}
                >
                  <i className='material-icons me-2'>send</i>
                  Reenviar
                </button>
              </li>
            )}
            {notification.status === 'draft' && (
              <li>
                <button
                  className='dropdown-item'
                  onClick={() => onAction?.('send', notification.id)}
                >
                  <i className='material-icons me-2'>send</i>
                  Enviar ahora
                </button>
              </li>
            )}
            <li>
              <hr className='dropdown-divider' />
            </li>
            <li>
              <button
                className='dropdown-item text-danger'
                onClick={() => onAction?.('delete', notification.id)}
              >
                <i className='material-icons me-2'>delete</i>
                Eliminar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

