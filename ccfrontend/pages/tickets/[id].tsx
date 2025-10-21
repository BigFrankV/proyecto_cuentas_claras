import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface TicketDetail {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  requester: {
    name: string;
    email: string;
    type: 'resident' | 'admin';
    unit?: string;
    avatar: string;
  };
  assignee?: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
    uploadedBy: string;
  }[];
  timeline: {
    id: string;
    type: 'created' | 'updated' | 'comment' | 'status_change' | 'assigned' | 'attachment';
    timestamp: string;
    user: {
      name: string;
      avatar: string;
    };
    content?: string;
    details?: any;
  }[];
  comments: {
    id: string;
    content: string;
    author: {
      name: string;
      avatar: string;
      type: 'admin' | 'resident';
    };
    createdAt: string;
    isInternal: boolean;
  }[];
}

const statusConfig = {
  open: { label: 'Abierto', class: 'open', color: '#1565C0', bg: '#E3F2FD', border: '#2196F3' },
  'in-progress': { label: 'En Progreso', class: 'in-progress', color: '#F57F17', bg: '#FFF8E1', border: '#FFEB3B' },
  resolved: { label: 'Resuelto', class: 'resolved', color: '#2E7D32', bg: '#E8F5E9', border: '#4CAF50' },
  closed: { label: 'Cerrado', class: 'closed', color: '#757575', bg: '#F5F5F5', border: '#9E9E9E' },
  escalated: { label: 'Escalado', class: 'escalated', color: '#C62828', bg: '#FFEBEE', border: '#F44336' }
};

const priorityConfig = {
  low: { label: 'Baja', class: 'low', color: '#2E7D32', bg: '#E8F5E9' },
  medium: { label: 'Media', class: 'medium', color: '#F57F17', bg: '#FFF8E1' },
  high: { label: 'Alta', class: 'high', color: '#C62828', bg: '#FFEBEE' },
  urgent: { label: 'Urgente', class: 'urgent', color: '#FFFFFF', bg: '#7B1FA2' }
};

export default function TicketDetalle() {
  const router = useRouter();
  const { id } = router.query;
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showInternalComments, setShowInternalComments] = useState(true);

  useEffect(() => {
    if (id) {
      // Mock data - replace with API call
      setTimeout(() => {
        const mockTicket: TicketDetail = {
          id: id as string,
          number: 'T-2024-089',
          subject: 'Problema con ascensor principal',
          description: 'El ascensor principal no funciona desde esta mañana. Los residentes no pueden subir a los pisos superiores y esto está causando muchas molestias, especialmente para personas mayores y personas con movilidad reducida. He notado que el ascensor hace un ruido extraño antes de detenerse completamente.',
          status: 'in-progress',
          priority: 'high',
          category: 'Mantenimiento',
          requester: {
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            type: 'resident',
            unit: 'Edificio A - Depto 301',
            avatar: 'MG'
          },
          assignee: {
            name: 'Carlos Técnico',
            email: 'carlos@mantenimiento.com',
            avatar: 'CT'
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
          dueDate: '2024-01-16T18:00:00Z',
          tags: ['urgente', 'ascensor', 'mantenimiento'],
          attachments: [
            {
              id: '1',
              name: 'foto_ascensor_error.jpg',
              size: 2048576,
              type: 'image/jpeg',
              uploadedAt: '2024-01-15T10:35:00Z',
              uploadedBy: 'María González'
            },
            {
              id: '2',
              name: 'reporte_tecnico.pdf',
              size: 1024000,
              type: 'application/pdf',
              uploadedAt: '2024-01-15T13:20:00Z',
              uploadedBy: 'Carlos Técnico'
            }
          ],
          timeline: [
            {
              id: '1',
              type: 'created',
              timestamp: '2024-01-15T10:30:00Z',
              user: { name: 'María González', avatar: 'MG' },
              content: 'Ticket creado'
            },
            {
              id: '2',
              type: 'assigned',
              timestamp: '2024-01-15T11:15:00Z',
              user: { name: 'Admin Sistema', avatar: 'AS' },
              content: 'Ticket asignado a Carlos Técnico'
            },
            {
              id: '3',
              type: 'status_change',
              timestamp: '2024-01-15T11:16:00Z',
              user: { name: 'Carlos Técnico', avatar: 'CT' },
              content: 'Estado cambiado a En Progreso',
              details: { from: 'open', to: 'in-progress' }
            },
            {
              id: '4',
              type: 'comment',
              timestamp: '2024-01-15T13:20:00Z',
              user: { name: 'Carlos Técnico', avatar: 'CT' },
              content: 'He revisado el ascensor y efectivamente hay un problema con el motor. He solicitado las piezas de repuesto.'
            },
            {
              id: '5',
              type: 'attachment',
              timestamp: '2024-01-15T13:21:00Z',
              user: { name: 'Carlos Técnico', avatar: 'CT' },
              content: 'Archivo adjuntado: reporte_tecnico.pdf'
            }
          ],
          comments: [
            {
              id: '1',
              content: 'Gracias por reportar este problema. Voy a revisar el ascensor inmediatamente.',
              author: {
                name: 'Carlos Técnico',
                avatar: 'CT',
                type: 'admin'
              },
              createdAt: '2024-01-15T11:20:00Z',
              isInternal: false
            },
            {
              id: '2',
              content: 'He revisado el ascensor y efectivamente hay un problema con el motor. He solicitado las piezas de repuesto y deberían llegar mañana por la mañana.',
              author: {
                name: 'Carlos Técnico',
                avatar: 'CT',
                type: 'admin'
              },
              createdAt: '2024-01-15T13:20:00Z',
              isInternal: false
            },
            {
              id: '3',
              content: 'Nota interna: Contactar proveedor para acelerar entrega de piezas.',
              author: {
                name: 'Admin Sistema',
                avatar: 'AS',
                type: 'admin'
              },
              createdAt: '2024-01-15T14:00:00Z',
              isInternal: true
            }
          ]
        };
        setTicket(mockTicket);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

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
          type: 'admin' as const
        },
        createdAt: new Date().toISOString(),
        isInternal: false
      };

      setTicket(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);

      setNewComment('');
    } catch (error) {
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
              <p className='text-muted'>El ticket solicitado no existe o no tienes permisos para verlo.</p>
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
        <title>{ticket.number} — {ticket.subject} — Cuentas Claras</title>
      </Head>

      <Layout title={`Ticket ${ticket.number}`}>
        <div className='container-fluid py-3'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-start mb-4'>
            <div>
              <div className='d-flex align-items-center mb-2'>
                <Link href='/tickets' className='btn btn-outline-secondary btn-sm me-3'>
                  <i className='material-icons me-1'>arrow_back</i>
                  Volver
                </Link>
                <h1 className='h4 mb-0'>{ticket.number}</h1>
              </div>
              <h2 className='h5 text-muted mb-1'>{ticket.subject}</h2>
              <div className='d-flex align-items-center gap-2'>
                <span
                  className={`status-badge ${statusConfig[ticket.status].class}`}
                  style={{
                    backgroundColor: statusConfig[ticket.status].bg,
                    color: statusConfig[ticket.status].color,
                    border: `1px solid ${statusConfig[ticket.status].border}`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {statusConfig[ticket.status].label}
                </span>
                <span
                  className={`priority-badge ${priorityConfig[ticket.priority].class}`}
                  style={{
                    backgroundColor: priorityConfig[ticket.priority].bg,
                    color: priorityConfig[ticket.priority].color,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {priorityConfig[ticket.priority].label}
                </span>
                <span className='badge bg-secondary'>{ticket.category}</span>
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
                  <li><a className='dropdown-item' href='#'>En Progreso</a></li>
                  <li><a className='dropdown-item' href='#'>Resuelto</a></li>
                  <li><a className='dropdown-item' href='#'>Cerrado</a></li>
                  <li><a className='dropdown-item' href='#'>Escalado</a></li>
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
                  <p className='mb-0'>{ticket.description}</p>
                </div>
              </div>

              {/* Comments */}
              <div className='card mb-4'>
                <div className='card-header d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>
                    <i className='material-icons me-2'>forum</i>
                    Comentarios ({ticket.comments.filter(c => !c.isInternal || showInternalComments).length})
                  </h5>
                  <div className='form-check form-switch'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      checked={showInternalComments}
                      onChange={(e) => setShowInternalComments(e.target.checked)}
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
                      .filter(comment => !comment.isInternal || showInternalComments)
                      .map((comment) => (
                        <div key={comment.id} className='comment mb-3' style={{
                          backgroundColor: comment.isInternal ? '#fff3cd' : '#f8f9fa',
                          border: comment.isInternal ? '1px solid #ffeaa7' : '1px solid #e9ecef',
                          borderRadius: 'var(--radius)',
                          padding: '1rem'
                        }}>
                          <div className='d-flex align-items-start'>
                            <div
                              className='comment-avatar me-3'
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: comment.author.type === 'admin' ? 'var(--color-primary)' : '#6c757d',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                flexShrink: 0
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
                                      <span className='badge bg-warning ms-2'>Interno</span>
                                    )}
                                  </h6>
                                  <small className='text-muted'>{formatDate(comment.createdAt)}</small>
                                </div>
                              </div>
                              <p className='mb-0'>{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
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
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </div>
                    <div className='d-flex justify-content-between'>
                      <div className='form-check'>
                        <input className='form-check-input' type='checkbox' id='internalComment' />
                        <label className='form-check-label' htmlFor='internalComment'>
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
                            <span className='spinner-border spinner-border-sm me-2' role='status'></span>
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
                    {ticket.timeline.map((item, index) => (
                      <div key={item.id} className='timeline-item d-flex' style={{
                        paddingBottom: index === ticket.timeline.length - 1 ? '0' : '1.5rem',
                        position: 'relative'
                      }}>
                        {index !== ticket.timeline.length - 1 && (
                          <div
                            className='timeline-line'
                            style={{
                              position: 'absolute',
                              left: '20px',
                              top: '40px',
                              bottom: '-1.5rem',
                              width: '2px',
                              backgroundColor: '#e9ecef'
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
                            flexShrink: 0
                          }}
                        >
                          <i className='material-icons'>{getTimelineIcon(item.type)}</i>
                        </div>
                        <div className='timeline-content flex-grow-1'>
                          <div className='d-flex justify-content-between align-items-start mb-1'>
                            <h6 className='mb-0'>{item.content}</h6>
                            <small className='text-muted'>{formatDate(item.timestamp)}</small>
                          </div>
                          <p className='text-muted mb-0'>
                            por {item.user.name}
                          </p>
                        </div>
                      </div>
                    ))}
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
                    <label className='form-label text-muted'>Número de Ticket</label>
                    <div className='fw-semibold'>{ticket.number}</div>
                  </div>
                  
                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>Fecha de Creación</label>
                    <div>{formatDate(ticket.createdAt)}</div>
                  </div>

                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>Última Actualización</label>
                    <div>{formatDate(ticket.updatedAt)}</div>
                  </div>

                  {ticket.dueDate && (
                    <div className='info-item mb-3'>
                      <label className='form-label text-muted'>Fecha Límite</label>
                      <div className='text-warning fw-semibold'>{formatDate(ticket.dueDate)}</div>
                    </div>
                  )}

                  <div className='info-item mb-3'>
                    <label className='form-label text-muted'>Etiquetas</label>
                    <div className='d-flex flex-wrap gap-1'>
                      {ticket.tags.map((tag, index) => (
                        <span key={index} className='badge bg-light text-dark'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requester */}
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
                        fontWeight: '600'
                      }}
                    >
                      {ticket.requester.avatar}
                    </div>
                    <div>
                      <h6 className='mb-1'>{ticket.requester.name}</h6>
                      <p className='text-muted mb-0'>{ticket.requester.email}</p>
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
                          fontWeight: '600'
                        }}
                      >
                        {ticket.assignee.avatar}
                      </div>
                      <div>
                        <h6 className='mb-1'>{ticket.assignee.name}</h6>
                        <p className='text-muted mb-0'>{ticket.assignee.email}</p>
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
                      {ticket.attachments.map((attachment) => (
                        <div key={attachment.id} className='attachment-item d-flex align-items-center p-2 border rounded mb-2'>
                          <div className='attachment-icon me-3'>
                            <i className='material-icons text-primary'>
                              {attachment.type.startsWith('image/') ? 'image' : 'description'}
                            </i>
                          </div>
                          <div className='flex-grow-1'>
                            <div className='fw-semibold'>{attachment.name}</div>
                            <small className='text-muted'>
                              {formatFileSize(attachment.size)} • por {attachment.uploadedBy}
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
                      ))}
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