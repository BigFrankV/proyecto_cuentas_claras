import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  useState,
  useEffect,
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react';

import Layout from '@/components/layout/Layout';
import { ticketsApi } from '@/lib/api/tickets';
import { ProtectedRoute } from '@/lib/useAuth';
import type { TicketDetalle as TicketDetailType } from '@/types/tickets';

const statusConfig = {
  abierto: {
    label: 'Abierto',
    class: 'open',
    color: '#1565C0',
    bg: '#E3F2FD',
    border: '#2196F3',
  },
  en_progreso: {
    label: 'En Progreso',
    class: 'in-progress',
    color: '#F57F17',
    bg: '#FFF8E1',
    border: '#FFEB3B',
  },
  resuelto: {
    label: 'Resuelto',
    class: 'resolved',
    color: '#2E7D32',
    bg: '#E8F5E9',
    border: '#4CAF50',
  },
  cerrado: {
    label: 'Cerrado',
    class: 'closed',
    color: '#757575',
    bg: '#F5F5F5',
    border: '#9E9E9E',
  },
};

const priorityConfig = {
  baja: { label: 'Baja', class: 'low', color: '#2E7D32', bg: '#E8F5E9' },
  media: { label: 'Media', class: 'medium', color: '#F57F17', bg: '#FFF8E1' },
  alta: { label: 'Alta', class: 'high', color: '#C62828', bg: '#FFEBEE' },
};

export default function TicketDetalle() {
  const router = useRouter();
  const { id } = router.query;

  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showInternalComments, setShowInternalComments] = useState(true);

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const ticketData = await ticketsApi.getById(Number(id));
      setTicket(ticketData);
    } catch (err) {
// eslint-disable-next-line no-console
      console.error('Error loading ticket:', err);
      setError(
        err instanceof Error ? err.message : 'Error al cargar el ticket',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {return;}

    setIsAddingComment(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const comment = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          name: 'Usuario Actual',
          avatar: 'UC',
          type: 'admin' as const,
        },
        createdAt: new Date().toISOString(),
        isInternal: false,
      };

      setTicket(prev =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, comment],
            }
          : null,
      );

      setNewComment('');
    } catch (error) {
// eslint-disable-next-line no-console
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'created':
        return 'add_circle';
      case 'assigned':
        return 'assignment_ind';
      case 'status_change':
        return 'swap_horiz';
      case 'comment':
        return 'comment';
      case 'attachment':
        return 'attach_file';
      default:
        return 'circle';
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'created':
        return '#28a745';
      case 'assigned':
        return '#007bff';
      case 'status_change':
        return '#ffc107';
      case 'comment':
        return '#17a2b8';
      case 'attachment':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <Layout title='Ticket no encontrado'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <h3>Ticket no encontrado</h3>
              <p className='text-muted'>
                El ticket solicitado no existe o no tienes permisos para verlo.
              </p>
              <Link href='/tickets' className='btn btn-primary'>
                Volver al listado
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>
          {ticket.numero} — {ticket.titulo} — Cuentas Claras
        </title>
      </Head>

      <Layout title={`Ticket ${ticket.numero}`}>
        <div className='container-fluid py-3'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-start mb-4'>
            <div>
              <div className='d-flex align-items-center mb-2'>
                <Link
                  href='/tickets'
                  className='btn btn-outline-secondary btn-sm me-3'
                >
                  <i className='material-icons me-1'>arrow_back</i>
                  Volver
                </Link>
                <h1 className='h4 mb-0'>{ticket.numero}</h1>
              </div>
              <h2 className='h5 text-muted mb-1'>{ticket.titulo}</h2>
              <div className='d-flex align-items-center gap-2'>
                <span
                  className={`status-badge ${statusConfig[ticket.estado].class}`}
                  style={{
                    backgroundColor: statusConfig[ticket.estado].bg,
                    color: statusConfig[ticket.estado].color,
                    border: `1px solid ${statusConfig[ticket.estado].border}`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}
                >
                  {statusConfig[ticket.estado].label}
                </span>
                <span
                  className={`priority-badge ${priorityConfig[ticket.prioridad].class}`}
                  style={{
                    backgroundColor: priorityConfig[ticket.prioridad].bg,
                    color: priorityConfig[ticket.prioridad].color,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}
                >
                  {priorityConfig[ticket.prioridad].label}
                </span>
                <span className='badge bg-secondary'>{ticket.categoria}</span>
              </div>
            </div>
            <div className='d-flex gap-2'>
              <div className='dropdown'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  data-bs-toggle='dropdown'
                >
                  <i className='material-icons me-1'>swap_horiz</i>
                  Cambiar Estado
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button className='dropdown-item' type='button'>
                      En Progreso
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' type='button'>
                      Resuelto
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' type='button'>
                      Cerrado
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' type='button'>
                      Escalado
                    </button>
                  </li>
                </ul>
              </div>
              <button className='btn btn-outline-primary'>
                <i className='material-icons me-1'>assignment_ind</i>
                Reasignar
              </button>
              <button className='btn btn-outline-success'>
                <i className='material-icons me-1'>check_circle</i>
                Resolver
              </button>
            </div>
          </div>

          <div className='row'>
            {/* Main Content */}
            <div className='col-lg-8 mb-4'>
              {/* Description */}
              <div className='card mb-4'>
                <div className='card-header'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>description</i>
                    Descripción
                  </h5>
                </div>
                <div className='card-body'>
                  <p className='mb-0'>{ticket.descripcion}</p>
                </div>
              </div>

              {/* Comments */}
              <div className='card mb-4'>
                <div className='card-header d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>forum</i>
                    Comentarios (
                    {
                      ticket.comments.filter(
                        (c: { isInternal: any }) =>
                          !c.isInternal || showInternalComments,
                      ).length
                    }
                    )
                  </h5>
                  <div className='form-check form-switch'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      checked={showInternalComments}
                      onChange={e => setShowInternalComments(e.target.checked)}
                    />
                    <label className='form-check-label'>
                      Mostrar comentarios internos
                    </label>
                  </div>
                </div>
                <div className='card-body'>
                  {/* Comments List */}
                  <div className='comments-list mb-4'>
                    {ticket.comments
                      .filter(
                        (comment: { isInternal: any }) =>
                          !comment.isInternal || showInternalComments,
                      )
                      .map(
                        (comment: {
                          id: Key | null | undefined;
                          isInternal: any;
                          author: {
                            type: string;
                            avatar:
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactElement<
                                  any,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | ReactPortal
                              | Promise<AwaitedReactNode>
                              | null
                              | undefined;
                            name:
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactElement<
                                  any,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | ReactPortal
                              | Promise<AwaitedReactNode>
                              | null
                              | undefined;
                          };
                          createdAt: string;
                          content:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined;
                        }) => (
                          <div
                            key={comment.id}
                            className='comment mb-3'
                            style={{
                              backgroundColor: comment.isInternal
                                ? '#fff3cd'
                                : '#f8f9fa',
                              border: comment.isInternal
                                ? '1px solid #ffeaa7'
                                : '1px solid #e9ecef',
                              borderRadius: 'var(--radius)',
                              padding: '1rem',
                            }}
                          >
                            <div className='d-flex align-items-start'>
                              <div
                                className='comment-avatar me-3'
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor:
                                    comment.author.type === 'admin'
                                      ? 'var(--color-primary)'
                                      : '#6c757d',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  flexShrink: 0,
                                }}
                              >
                                {comment.author.avatar}
                              </div>
                              <div className='flex-grow-1'>
                                <div className='d-flex justify-content-between align-items-start mb-2'>
                                  <div>
                                    <h6 className='mb-0'>
                                      {comment.author.name}
                                      {comment.isInternal && (
                                        <span className='badge bg-warning ms-2'>
                                          Interno
                                        </span>
                                      )}
                                    </h6>
                                    <small className='text-muted'>
                                      {formatDate(comment.createdAt)}
                                    </small>
                                  </div>
                                </div>
                                <p className='mb-0'>{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                  </div>

                  {/* Add Comment */}
                  <div className='add-comment'>
                    <h6 className='mb-3'>Agregar Comentario</h6>
                    <div className='mb-3'>
                      <textarea
                        className='form-control'
                        rows={3}
                        placeholder='Escribe tu comentario...'
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                      />
                    </div>
                    <div className='d-flex justify-content-between'>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id='internalComment'
                        />
                        <label
                          className='form-check-label'
                          htmlFor='internalComment'
                        >
                          Comentario interno
                        </label>
                      </div>
                      <button
                        className='btn btn-primary'
                        onClick={handleAddComment}
                        disabled={isAddingComment || !newComment.trim()}
                      >
                        {isAddingComment ? (
                          <>
                            <span
                              className='spinner-border spinner-border-sm me-2'
                              role='status'
                            ></span>
                            Agregando...
                          </>
                        ) : (
                          <>
                            <i className='material-icons me-2'>send</i>
                            Agregar Comentario
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className='card'>
                <div className='card-header'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>timeline</i>
                    Historial de Actividades
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='timeline'>
                    {ticket.timeline.map(
                      (
                        item: {
                          id: Key | null | undefined;
                          type: string;
                          content:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined;
                          timestamp: string;
                          user: {
                            name:
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactElement<
                                  any,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | ReactPortal
                              | Promise<AwaitedReactNode>
                              | null
                              | undefined;
                          };
                        },
                        index: number,
                      ) => (
                        <div
                          key={item.id}
                          className='timeline-item d-flex'
                          style={{
                            paddingBottom:
                              index === ticket.timeline.length - 1
                                ? '0'
                                : '1.5rem',
                            position: 'relative',
                          }}
                        >
                          {index !== ticket.timeline.length - 1 && (
                            <div
                              className='timeline-line'
                              style={{
                                position: 'absolute',
                                left: '20px',
                                top: '40px',
                                bottom: '-1.5rem',
                                width: '2px',
                                backgroundColor: '#e9ecef',
                              }}
                            />
                          )}
                          <div
                            className='timeline-icon me-3'
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: getTimelineColor(item.type),
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              zIndex: 1,
                              flexShrink: 0,
                            }}
                          >
                            <i className='material-icons'>
                              {getTimelineIcon(item.type)}
                            </i>
                          </div>
                          <div className='timeline-content flex-grow-1'>
                            <div className='d-flex justify-content-between align-items-start mb-1'>
                              <h6 className='mb-0'>{item.content}</h6>
                              <small className='text-muted'>
                                {formatDate(item.timestamp)}
                              </small>
                            </div>
                            <p className='text-muted mb-0'>
                              por {item.user.name}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='col-lg-4'>
              {/* Ticket Info */}
              <div className='card mb-4'>
                <div className='card-header'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>info</i>
                    Información del Ticket
                  </h5>
                </div>
                <div className='card-body'>
                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>
                      Número de Ticket
                    </label>
                    <div className='fw-semibold'>{ticket.numero}</div>
                  </div>

                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>
                      Fecha de Creación
                    </label>
                    <div>
                      {new Date(ticket.fecha_creacion).toLocaleDateString(
                        'es-ES',
                      )}
                    </div>
                  </div>

                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>
                      Última Actualización
                    </label>
                    <div>
                      {new Date(ticket.fecha_actualizacion).toLocaleDateString(
                        'es-ES',
                      )}
                    </div>
                  </div>

                  {ticket.fecha_vencimiento && (
                    <div className='info-item mb-3'>
                      <label className='form-label text-muted'>
                        Fecha Límite
                      </label>
                      <div className='text-warning fw-semibold'>
                        {new Date(ticket.fecha_vencimiento).toLocaleDateString(
                          'es-ES',
                        )}
                      </div>
                    </div>
                  )}

                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>Etiquetas</label>
                    <div className='d-flex flex-wrap gap-1'>
                      {ticket.tags.map(
                        (
                          tag:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined,
                          index: Key | null | undefined,
                        ) => (
                          <span
                            key={index}
                            className='badge bg-light text-dark'
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requester */}
              {ticket.requester && (
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>person</i>
                      Solicitante
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='d-flex align-items-center mb-3'>
                      <div
                        className='user-avatar me-3'
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: '600',
                        }}
                      >
                        {ticket.requester.avatar}
                      </div>
                      <div>
                        <h6 className='mb-1'>{ticket.requester.name}</h6>
                        <p className='text-muted mb-0'>
                          {ticket.requester.email}
                        </p>
                      </div>
                    </div>

                    {ticket.requester.unit && (
                      <div className='info-item'>
                        <label className='form-label text-muted'>Unidad</label>
                        <div>{ticket.requester.unit}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assignee */}
              {ticket.assignee && (
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>assignment_ind</i>
                      Asignado a
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div
                        className='user-avatar me-3'
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          fontWeight: '600',
                        }}
                      >
                        {ticket.assignee.avatar}
                      </div>
                      <div>
                        <h6 className='mb-1'>{ticket.assignee.name}</h6>
                        <p className='text-muted mb-0'>
                          {ticket.assignee.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div className='card'>
                <div className='card-header'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>attach_file</i>
                    Archivos Adjuntos ({ticket.attachments.length})
                  </h5>
                </div>
                <div className='card-body'>
                  {ticket.attachments.length === 0 ? (
                    <p className='text-muted mb-0'>No hay archivos adjuntos</p>
                  ) : (
                    <div className='attachments-list'>
                      {ticket.attachments.map(
                        (attachment: {
                          id: Key | null | undefined;
                          type: string;
                          name:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined;
                          size: number;
                          uploadedBy:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined;
                        }) => (
                          <div
                            key={attachment.id}
                            className='attachment-item d-flex align-items-center p-2 border rounded mb-2'
                          >
                            <div className='attachment-icon me-3'>
                              <i className='material-icons text-primary'>
                                {attachment.type.startsWith('image/')
                                  ? 'image'
                                  : 'description'}
                              </i>
                            </div>
                            <div className='flex-grow-1'>
                              <div className='fw-semibold'>
                                {attachment.name}
                              </div>
                              <small className='text-muted'>
                                {formatFileSize(attachment.size)} • por{' '}
                                {attachment.uploadedBy}
                              </small>
                            </div>
                            <div className='attachment-actions'>
                              <button className='btn btn-sm btn-outline-primary me-1'>
                                <i className='material-icons'>download</i>
                              </button>
                              <button className='btn btn-sm btn-outline-secondary'>
                                <i className='material-icons'>visibility</i>
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <div className='mt-3'>
                    <button className='btn btn-outline-primary btn-sm w-100'>
                      <i className='material-icons me-2'>add</i>
                      Agregar Archivo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
