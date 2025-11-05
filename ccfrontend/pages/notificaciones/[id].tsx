import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import {
  StatusBadge,
  TypeBadge,
  ChannelBadge,
} from '@/components/notificaciones';
import { ProtectedRoute } from '@/lib/useAuth';

interface NotificationDetail {
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
    details?: string[];
  };
  author: {
    name: string;
    avatar: string;
    email: string;
  };
  createdAt: string;
  sentAt?: string;
  scheduledFor?: string;
  priority: 'low' | 'normal' | 'high';
  deliveryStats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  options: {
    trackOpening: boolean;
    requireConfirmation: boolean;
  };
  content: {
    html: string;
    plain: string;
  };
}

export default function NotificacionDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [notification, setNotification] = useState<NotificationDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (!id) {
      return;
    }

    // Mock data - replace with API call
    setTimeout(() => {
      const mockNotification: NotificationDetail = {
        id: id as string,
        subject: 'Mantenimiento de ascensores programado',
        message:
          'Se realizará mantenimiento preventivo de los ascensores el próximo sábado de 8:00 AM a 12:00 PM. Durante este período, los ascensores no estarán disponibles. Se recomienda a todos los residentes planificar sus actividades considerando esta interrupción temporal del servicio.\n\nEn caso de emergencia, el personal de seguridad estará disponible para asistir a personas con movilidad reducida.\n\nGracias por su comprensión.',
        type: 'maintenance',
        status: 'sent',
        channels: ['email', 'sms', 'app'],
        audience: {
          type: 'all',
          count: 245,
          description: 'Todos los residentes',
          details: [
            'Edificio A: 120 personas',
            'Edificio B: 89 personas',
            'Edificio C: 36 personas',
          ],
        },
        author: {
          name: 'Administración',
          avatar: 'AD',
          email: 'admin@cuentasclaras.com',
        },
        createdAt: '2024-01-15T10:30:00Z',
        sentAt: '2024-01-15T14:00:00Z',
        priority: 'high',
        deliveryStats: {
          sent: 245,
          delivered: 240,
          opened: 180,
          clicked: 45,
          failed: 5,
        },
        options: {
          trackOpening: true,
          requireConfirmation: false,
        },
        content: {
          html: `<h3>Mantenimiento de Ascensores Programado</h3>
          <p>Estimados residentes,</p>
          <p>Se realizará <strong>mantenimiento preventivo</strong> de los ascensores el próximo <em>sábado de 8:00 AM a 12:00 PM</em>.</p>
          <p>Durante este período, los ascensores no estarán disponibles.</p>
          <ul>
            <li>Se recomienda planificar actividades considerando esta interrupción</li>
            <li>Personal de seguridad disponible para emergencias</li>
            <li>Duración estimada: 4 horas</li>
          </ul>
          <p>Gracias por su comprensión.</p>
          <p><strong>Administración</strong></p>`,
          plain:
            'Se realizará mantenimiento preventivo de los ascensores el próximo sábado de 8:00 AM a 12:00 PM. Durante este período, los ascensores no estarán disponibles.',
        },
      };
      setNotification(mockNotification);
      setLoading(false);
    }, 800);
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDuplicate = () => {
    if (!notification) {
      return;
    }

    // Redirect to new notification page with pre-filled data
    const duplicateData = {
      subject: `Copia de: ${notification.subject}`,
      message: notification.message,
      type: notification.type,
      channels: notification.channels,
      audience: notification.audience,
      priority: notification.priority,
      options: notification.options,
    };

    // Store in sessionStorage to pre-fill the form
    sessionStorage.setItem(
      'duplicateNotification',
      JSON.stringify(duplicateData)
    );
    router.push('/notificaciones/nueva?duplicate=true');
  };

  const handleSendNow = () => {
    if (!notification) {
      return;
    }

    if (
      confirm('¿Estás seguro de que deseas enviar esta notificación ahora?')
    ) {
      // Update notification status
      setNotification(prev =>
        prev
          ? {
              ...prev,
              status: 'sent',
              sentAt: new Date().toISOString(),
            }
          : null
      );

      alert('Notificación enviada exitosamente');
    }
  };

  const handleResend = () => {
    if (!notification) {
      return;
    }

    if (
      confirm(
        '¿Estás seguro de que deseas reenviar esta notificación a todos los destinatarios?'
      )
    ) {
      // Update sent timestamp
      setNotification(prev =>
        prev
          ? {
              ...prev,
              sentAt: new Date().toISOString(),
            }
          : null
      );

      alert('Notificación reenviada exitosamente');
    }
  };

  const handleEdit = () => {
    if (!notification) {
      return;
    }

    // Only drafts can be edited
    if (notification.status !== 'draft') {
      alert('Solo se pueden editar notificaciones en borrador');
      return;
    }

    router.push(`/notificaciones/${notification.id}/editar`);
  };

  const handleExport = () => {
    if (!notification) {
      return;
    }

    // Create export data
    const exportData = {
      id: notification.id,
      subject: notification.subject,
      type: notification.type,
      status: notification.status,
      author: notification.author.name,
      createdAt: formatDate(notification.createdAt),
      sentAt: notification.sentAt
        ? formatDate(notification.sentAt)
        : 'No enviada',
      audience: notification.audience.description,
      audienceCount: notification.audience.count,
      channels: notification.channels.join(', '),
      deliveryStats: notification.deliveryStats,
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notificacion-${notification.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (!notification) {
      return;
    }

    if (
      confirm(
        '¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer.'
      )
    ) {
      // In a real app, this would make an API call
      alert('Notificación eliminada exitosamente');
      router.push('/notificaciones');
    }
  };

  const getDeliveryRate = () => {
    if (!notification?.deliveryStats) {
      return 0;
    }
    const { delivered, sent } = notification.deliveryStats;
    return Math.round((delivered / sent) * 100);
  };

  const getOpenRate = () => {
    if (!notification?.deliveryStats) {
      return 0;
    }
    const { opened, delivered } = notification.deliveryStats;
    return Math.round((opened / delivered) * 100);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!notification) {
    return (
      <ProtectedRoute>
        <Layout title='Notificación no encontrada'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <h3>Notificación no encontrada</h3>
              <p className='text-muted'>
                La notificación que buscas no existe o ha sido eliminada.
              </p>
              <Link href='/notificaciones' className='btn btn-primary'>
                Volver a Notificaciones
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
        <title>{notification.subject} — Notificaciones — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Notificación'>
        <div className='container-fluid py-3'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/notificaciones' className='text-decoration-none'>
                  Notificaciones
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                {notification.subject}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className='d-flex justify-content-between align-items-start mb-4'>
            <div className='flex-grow-1 me-3'>
              <div className='d-flex align-items-center gap-2 mb-2'>
                <StatusBadge status={notification.status} />
                <TypeBadge type={notification.type} />
                {notification.priority === 'high' && (
                  <span className='badge bg-danger'>
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '12px' }}
                    >
                      priority_high
                    </i>
                    Alta Prioridad
                  </span>
                )}
              </div>
              <h1 className='h3 mb-2'>{notification.subject}</h1>
              <div className='text-muted'>
                <span className='me-3'>
                  <i
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    person
                  </i>
                  {notification.author.name}
                </span>
                <span className='me-3'>
                  <i
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    schedule
                  </i>
                  {notification.sentAt
                    ? `Enviada: ${formatDate(notification.sentAt)}`
                    : notification.scheduledFor
                      ? `Programada: ${formatDate(notification.scheduledFor)}`
                      : `Creada: ${formatDate(notification.createdAt)}`}
                </span>
                <span>
                  <i
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    people
                  </i>
                  {notification.audience.count} destinatarios
                </span>
              </div>
            </div>

            <div className='d-flex gap-2'>
              <button
                className='btn btn-outline-secondary'
                onClick={handleDuplicate}
              >
                <i className='material-icons me-2'>content_copy</i>
                Duplicar
              </button>
              {notification.status === 'draft' && (
                <button className='btn btn-primary' onClick={handleSendNow}>
                  <i className='material-icons me-2'>send</i>
                  Enviar ahora
                </button>
              )}
              {notification.status === 'sent' && (
                <button
                  className='btn btn-outline-primary'
                  onClick={handleResend}
                >
                  <i className='material-icons me-2'>send</i>
                  Reenviar
                </button>
              )}
              <div className='dropdown'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  data-bs-toggle='dropdown'
                >
                  <i className='material-icons'>more_vert</i>
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button className='dropdown-item' onClick={handleEdit}>
                      <i className='material-icons me-2'>edit</i>
                      Editar
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item' onClick={handleExport}>
                      <i className='material-icons me-2'>file_download</i>
                      Exportar
                    </button>
                  </li>
                  <li>
                    <hr className='dropdown-divider' />
                  </li>
                  <li>
                    <button
                      className='dropdown-item text-danger'
                      onClick={handleDelete}
                    >
                      <i className='material-icons me-2'>delete</i>
                      Eliminar
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8'>
              {/* Tabs */}
              <div className='tabs-container mb-4'>
                <ul
                  className='nav nav-tabs'
                  id='notificationTabs'
                  role='tablist'
                >
                  <li className='nav-item' role='presentation'>
                    <button
                      className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                      onClick={() => setActiveTab('content')}
                    >
                      <i className='material-icons me-2'>article</i>
                      Contenido
                    </button>
                  </li>
                  <li className='nav-item' role='presentation'>
                    <button
                      className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`}
                      onClick={() => setActiveTab('delivery')}
                    >
                      <i className='material-icons me-2'>analytics</i>
                      Estadísticas
                    </button>
                  </li>
                  <li className='nav-item' role='presentation'>
                    <button
                      className={`nav-link ${activeTab === 'recipients' ? 'active' : ''}`}
                      onClick={() => setActiveTab('recipients')}
                    >
                      <i className='material-icons me-2'>people</i>
                      Destinatarios
                    </button>
                  </li>
                </ul>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className='content-tab'>
                  <div className='card mb-4'>
                    <div className='card-header'>
                      <h5 className='mb-0'>Contenido del Mensaje</h5>
                    </div>
                    <div className='card-body'>
                      <div
                        className='message-content'
                        dangerouslySetInnerHTML={{
                          __html: notification.content.html,
                        }}
                      />
                    </div>
                  </div>

                  <div className='card'>
                    <div className='card-header'>
                      <h5 className='mb-0'>Configuración de Envío</h5>
                    </div>
                    <div className='card-body'>
                      <div className='row'>
                        <div className='col-md-6'>
                          <h6>Canales utilizados</h6>
                          <div className='d-flex flex-wrap gap-2 mb-3'>
                            {notification.channels.map(channel => (
                              <ChannelBadge key={channel} channel={channel} />
                            ))}
                          </div>
                        </div>
                        <div className='col-md-6'>
                          <h6>Opciones</h6>
                          <ul className='list-unstyled'>
                            <li>
                              <i
                                className={`material-icons me-2 ${notification.options.trackOpening ? 'text-success' : 'text-muted'}`}
                              >
                                {notification.options.trackOpening
                                  ? 'check_circle'
                                  : 'radio_button_unchecked'}
                              </i>
                              Rastreo de apertura
                            </li>
                            <li>
                              <i
                                className={`material-icons me-2 ${notification.options.requireConfirmation ? 'text-success' : 'text-muted'}`}
                              >
                                {notification.options.requireConfirmation
                                  ? 'check_circle'
                                  : 'radio_button_unchecked'}
                              </i>
                              Confirmación requerida
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Tab */}
              {activeTab === 'delivery' && notification.deliveryStats && (
                <div className='delivery-tab'>
                  <div className='row mb-4'>
                    <div className='col-md-3 mb-3'>
                      <div
                        className='stats-card text-center'
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 'var(--radius)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-sm)',
                          borderLeft: '4px solid #2196f3',
                        }}
                      >
                        <div className='stats-number h3 mb-1'>
                          {notification.deliveryStats.sent}
                        </div>
                        <div className='stats-label text-muted'>Enviadas</div>
                      </div>
                    </div>
                    <div className='col-md-3 mb-3'>
                      <div
                        className='stats-card text-center'
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 'var(--radius)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-sm)',
                          borderLeft: '4px solid #4caf50',
                        }}
                      >
                        <div className='stats-number h3 mb-1'>
                          {notification.deliveryStats.delivered}
                        </div>
                        <div className='stats-label text-muted'>Entregadas</div>
                        <div className='stats-rate small text-success'>
                          {getDeliveryRate()}%
                        </div>
                      </div>
                    </div>
                    <div className='col-md-3 mb-3'>
                      <div
                        className='stats-card text-center'
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 'var(--radius)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-sm)',
                          borderLeft: '4px solid #ff9800',
                        }}
                      >
                        <div className='stats-number h3 mb-1'>
                          {notification.deliveryStats.opened}
                        </div>
                        <div className='stats-label text-muted'>Abiertas</div>
                        <div className='stats-rate small text-warning'>
                          {getOpenRate()}%
                        </div>
                      </div>
                    </div>
                    <div className='col-md-3 mb-3'>
                      <div
                        className='stats-card text-center'
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 'var(--radius)',
                          padding: '1.5rem',
                          boxShadow: 'var(--shadow-sm)',
                          borderLeft: '4px solid #f44336',
                        }}
                      >
                        <div className='stats-number h3 mb-1'>
                          {notification.deliveryStats.failed}
                        </div>
                        <div className='stats-label text-muted'>Fallidas</div>
                      </div>
                    </div>
                  </div>

                  <div className='card mb-4'>
                    <div className='card-header'>
                      <h5 className='mb-0'>Rendimiento por Canal</h5>
                    </div>
                    <div className='card-body'>
                      <div className='table-responsive'>
                        <table className='table table-hover'>
                          <thead>
                            <tr>
                              <th>Canal</th>
                              <th>Enviadas</th>
                              <th>Entregadas</th>
                              <th>Abiertas</th>
                              <th>Tasa de Entrega</th>
                              <th>Tasa de Apertura</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <ChannelBadge channel='email' />
                              </td>
                              <td>245</td>
                              <td>240</td>
                              <td>156</td>
                              <td>
                                <span className='text-success'>98%</span>
                              </td>
                              <td>
                                <span className='text-warning'>65%</span>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <ChannelBadge channel='sms' />
                              </td>
                              <td>245</td>
                              <td>235</td>
                              <td>89</td>
                              <td>
                                <span className='text-success'>96%</span>
                              </td>
                              <td>
                                <span className='text-warning'>38%</span>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <ChannelBadge channel='app' />
                              </td>
                              <td>180</td>
                              <td>175</td>
                              <td>134</td>
                              <td>
                                <span className='text-success'>97%</span>
                              </td>
                              <td>
                                <span className='text-success'>77%</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipients Tab */}
              {activeTab === 'recipients' && (
                <div className='recipients-tab'>
                  <div className='card'>
                    <div className='card-header'>
                      <h5 className='mb-0'>Audiencia Seleccionada</h5>
                    </div>
                    <div className='card-body'>
                      <div className='audience-summary mb-4'>
                        <div className='d-flex align-items-center mb-3'>
                          <i
                            className='material-icons me-2 text-primary'
                            style={{ fontSize: '2rem' }}
                          >
                            people
                          </i>
                          <div>
                            <h6 className='mb-0'>
                              {notification.audience.description}
                            </h6>
                            <p className='text-muted mb-0'>
                              {notification.audience.count} destinatarios
                            </p>
                          </div>
                        </div>

                        {notification.audience.details && (
                          <div className='audience-breakdown'>
                            <h6>Desglose por edificio:</h6>
                            <ul className='list-unstyled'>
                              {notification.audience.details.map(
                                (detail, index) => (
                                  <li key={index} className='mb-1'>
                                    <i
                                      className='material-icons me-2 text-muted'
                                      style={{ fontSize: '16px' }}
                                    >
                                      business
                                    </i>
                                    {detail}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className='col-lg-4'>
              <div className='notification-sidebar'>
                {/* Quick Actions */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h6 className='mb-0'>Acciones Rápidas</h6>
                  </div>
                  <div className='card-body'>
                    <div className='d-grid gap-2'>
                      <button className='btn btn-outline-primary btn-sm'>
                        <i className='material-icons me-2'>content_copy</i>
                        Duplicar notificación
                      </button>
                      <button className='btn btn-outline-success btn-sm'>
                        <i className='material-icons me-2'>send</i>
                        Reenviar a nuevos destinatarios
                      </button>
                      <button className='btn btn-outline-info btn-sm'>
                        <i className='material-icons me-2'>file_download</i>
                        Exportar estadísticas
                      </button>
                    </div>
                  </div>
                </div>

                {/* Author Info */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h6 className='mb-0'>Información del Autor</h6>
                  </div>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div
                        className='author-avatar me-3'
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: '600',
                        }}
                      >
                        {notification.author.avatar}
                      </div>
                      <div>
                        <div className='fw-semibold'>
                          {notification.author.name}
                        </div>
                        <div className='small text-muted'>
                          {notification.author.email}
                        </div>
                        <div className='small text-muted'>
                          Creada: {formatDate(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Notifications */}
                <div className='card'>
                  <div className='card-header'>
                    <h6 className='mb-0'>Notificaciones Relacionadas</h6>
                  </div>
                  <div className='card-body'>
                    <div className='related-notifications'>
                      <div className='related-item mb-3 pb-3 border-bottom'>
                        <div className='d-flex align-items-start'>
                          <TypeBadge
                            type='maintenance'
                            size='sm'
                            showIcon={false}
                          />
                          <div className='ms-2 flex-grow-1'>
                            <div className='fw-semibold small'>
                              Finalización de mantenimiento
                            </div>
                            <div className='text-muted small'>Hace 2 días</div>
                          </div>
                        </div>
                      </div>
                      <div className='related-item mb-3 pb-3 border-bottom'>
                        <div className='d-flex align-items-start'>
                          <TypeBadge
                            type='announcement'
                            size='sm'
                            showIcon={false}
                          />
                          <div className='ms-2 flex-grow-1'>
                            <div className='fw-semibold small'>
                              Aviso de trabajo en ascensores
                            </div>
                            <div className='text-muted small'>
                              Hace 1 semana
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='related-item'>
                        <div className='d-flex align-items-start'>
                          <TypeBadge type='system' size='sm' showIcon={false} />
                          <div className='ms-2 flex-grow-1'>
                            <div className='fw-semibold small'>
                              Actualización del sistema
                            </div>
                            <div className='text-muted small'>
                              Hace 2 semanas
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
