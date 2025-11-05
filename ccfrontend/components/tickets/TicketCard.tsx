import Link from 'next/link';
import React from 'react';

import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

export interface TicketCardData {
  id: string;
  number: string;
  subject: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  requester: {
    name: string;
    email: string;
    type: 'resident' | 'admin';
    unit?: string;
  };
  assignee?: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
  commentsCount?: number;
  attachmentsCount?: number;
}

interface TicketCardProps {
  ticket: TicketCardData;
  selected?: boolean;
  onSelect?: (ticketId: string) => void;
  showActions?: boolean;
  className?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  selected = false,
  onSelect,
  showActions = true,
  className = '',
}) => {
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
    // Only handle selection if clicking on the card itself, not on action buttons
    if (onSelect && e.target === e.currentTarget) {
      onSelect(ticket.id);
    }
  };

  return (
    <div
      className={`ticket-card ${className}`}
      style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        boxShadow: 'var(--shadow-sm)',
        border: selected
          ? '2px solid var(--color-primary)'
          : '1px solid #e9ecef',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
      }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className='ticket-card-header d-flex justify-content-between align-items-start mb-3'>
        <Link
          href={`/tickets/${ticket.id}`}
          className='ticket-number fw-bold text-primary text-decoration-none'
          onClick={e => e.stopPropagation()}
        >
          {ticket.number}
        </Link>
        {onSelect && (
          <div className='form-check' onClick={e => e.stopPropagation()}>
            <input
              className='form-check-input'
              type='checkbox'
              checked={selected}
              onChange={() => onSelect(ticket.id)}
            />
          </div>
        )}
      </div>

      {/* Subject */}
      <h6
        className='ticket-subject mb-2'
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          lineHeight: '1.4',
          color: '#212529',
        }}
      >
        {ticket.subject}
      </h6>

      {/* Description Preview */}
      {ticket.description && (
        <p
          className='ticket-description text-muted mb-3'
          style={{
            fontSize: '0.875rem',
            lineHeight: '1.5',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {ticket.description}
        </p>
      )}

      {/* Meta Information */}
      <div className='ticket-meta mb-3'>
        <div className='ticket-meta-item d-flex align-items-center mb-1'>
          <i
            className='material-icons me-1'
            style={{ fontSize: '16px', color: '#6c757d' }}
          >
            person
          </i>
          <span className='small text-muted'>{ticket.requester.name}</span>
        </div>
        {ticket.requester.unit && (
          <div className='ticket-meta-item d-flex align-items-center mb-1'>
            <i
              className='material-icons me-1'
              style={{ fontSize: '16px', color: '#6c757d' }}
            >
              home
            </i>
            <span className='small text-muted'>{ticket.requester.unit}</span>
          </div>
        )}
        <div className='ticket-meta-item d-flex align-items-center'>
          <i
            className='material-icons me-1'
            style={{ fontSize: '16px', color: '#6c757d' }}
          >
            schedule
          </i>
          <span className='small text-muted'>
            {formatDate(ticket.createdAt)}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className='ticket-badges d-flex flex-wrap gap-2 mb-3'>
        <StatusBadge status={ticket.status} size='sm' />
        <PriorityBadge priority={ticket.priority} size='sm' />
        <CategoryBadge category={ticket.category} size='sm' />
      </div>

      {/* Tags */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className='ticket-tags mb-3'>
          <div className='d-flex flex-wrap gap-1'>
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className='badge bg-light text-dark'
                style={{ fontSize: '0.688rem' }}
              >
                {tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span
                className='badge bg-light text-muted'
                style={{ fontSize: '0.688rem' }}
              >
                +{ticket.tags.length - 3} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Assignee */}
      {ticket.assignee && (
        <div className='ticket-assignee d-flex align-items-center mb-3'>
          <div
            className='assignee-avatar me-2'
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            {ticket.assignee.avatar}
          </div>
          <div>
            <div className='small fw-semibold'>{ticket.assignee.name}</div>
            <div className='small text-muted'>Asignado</div>
          </div>
        </div>
      )}

      {/* Stats */}
      {(ticket.commentsCount !== undefined ||
        ticket.attachmentsCount !== undefined) && (
        <div className='ticket-stats d-flex align-items-center gap-3 mb-3 text-muted'>
          {ticket.commentsCount !== undefined && (
            <div className='d-flex align-items-center'>
              <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                comment
              </i>
              <span className='small'>{ticket.commentsCount}</span>
            </div>
          )}
          {ticket.attachmentsCount !== undefined && (
            <div className='d-flex align-items-center'>
              <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                attach_file
              </i>
              <span className='small'>{ticket.attachmentsCount}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className='ticket-actions d-flex gap-2'>
          <Link
            href={`/tickets/${ticket.id}`}
            className='btn btn-outline-primary btn-sm flex-fill'
            onClick={e => e.stopPropagation()}
          >
            Ver detalle
          </Link>
          <div className='dropdown' onClick={e => e.stopPropagation()}>
            <button
              className='btn btn-outline-secondary btn-sm dropdown-toggle'
              type='button'
              data-bs-toggle='dropdown'
            >
              <i className='material-icons'>more_vert</i>
            </button>
            <ul className='dropdown-menu'>
              <li>
                <a className='dropdown-item' href='#'>
                  <i className='material-icons me-2'>edit</i>
                  Editar
                </a>
              </li>
              <li>
                <a className='dropdown-item' href='#'>
                  <i className='material-icons me-2'>assignment_ind</i>
                  Asignar
                </a>
              </li>
              <li>
                <hr className='dropdown-divider' />
              </li>
              <li>
                <a className='dropdown-item text-success' href='#'>
                  <i className='material-icons me-2'>check_circle</i>
                  Resolver
                </a>
              </li>
              <li>
                <a className='dropdown-item text-secondary' href='#'>
                  <i className='material-icons me-2'>close</i>
                  Cerrar
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketCard;

