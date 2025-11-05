import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

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

const statusConfig = {
  sent: {
    label: 'Enviada',
    color: '#2E7D32',
    bg: '#E8F5E9',
    border: '#4CAF50',
    icon: 'send',
  },
  draft: {
    label: 'Borrador',
    color: '#757575',
    bg: '#F5F5F5',
    border: '#9E9E9E',
    icon: 'draft',
  },
  scheduled: {
    label: 'Programada',
    color: '#1565C0',
    bg: '#E3F2FD',
    border: '#2196F3',
    icon: 'schedule',
  },
  failed: {
    label: 'Fallida',
    color: '#C62828',
    bg: '#FFEBEE',
    border: '#F44336',
    icon: 'error',
  },
};

const typeConfig = {
  system: {
    label: 'Sistema',
    color: '#1565C0',
    bg: '#E3F2FD',
    icon: 'settings',
  },
  announcement: {
    label: 'Anuncio',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    icon: 'campaign',
  },
  reminder: {
    label: 'Recordatorio',
    color: '#F57F17',
    bg: '#FFF8E1',
    icon: 'alarm',
  },
  alert: {
    label: 'Alerta',
    color: '#C62828',
    bg: '#FFEBEE',
    icon: 'warning',
  },
  maintenance: {
    label: 'Mantenimiento',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'build',
  },
};

const channelConfig = {
  email: {
    label: 'Email',
    color: '#1565C0',
    bg: '#E3F2FD',
    icon: 'email',
  },
  sms: {
    label: 'SMS',
    color: '#2E7D32',
    bg: '#E8F5E9',
    icon: 'sms',
  },
  push: {
    label: 'Push',
    color: '#F57F17',
    bg: '#FFF8E1',
    icon: 'notifications',
  },
  app: {
    label: 'App',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    icon: 'phone_android',
  },
};

export default function NotificacionesListado() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    NotificationData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    channel: '',
    dateRange: '',
  });

  useEffect(() => {
    // Mock data - reemplazar con API call
    setTimeout(() => {
      const mockNotifications: NotificationData[] = [
        {
          id: '1',
          subject: 'Mantenimiento de ascensores programado',
          message:
            'Se realizará mantenimiento preventivo de los ascensores el próximo sábado de 8:00 AM a 12:00 PM. Durante este período, los ascensores no estarán disponibles.',
          type: 'maintenance',
          status: 'sent',
          channels: ['email', 'sms', 'app'],
          audience: {
            type: 'all',
            count: 245,
            description: 'Todos los residentes',
          },
          author: {
            name: 'Administración',
            avatar: 'AD',
          },
          createdAt: '2024-01-15T10:30:00Z',
          sentAt: '2024-01-15T14:00:00Z',
          deliveryStats: {
            sent: 245,
            delivered: 240,
            opened: 180,
            clicked: 45,
          },
          isRead: true,
        },
        {
          id: '2',
          subject: 'Reunión de propietarios - Enero 2024',
          message:
            'Se convoca a todos los propietarios a la reunión ordinaria que se realizará el 25 de enero a las 19:00 horas en el salón de eventos.',
          type: 'announcement',
          status: 'scheduled',
          channels: ['email', 'app'],
          audience: {
            type: 'custom',
            count: 89,
            description: 'Solo propietarios',
          },
          author: {
            name: 'Patricia Contreras',
            avatar: 'PC',
          },
          createdAt: '2024-01-14T16:20:00Z',
          scheduledFor: '2024-01-20T09:00:00Z',
        },
        {
          id: '3',
          subject: 'Recordatorio: Pago de gastos comunes',
          message:
            'Te recordamos que el vencimiento para el pago de gastos comunes de enero es el 31 de enero. Puedes pagar a través de la app o en nuestras oficinas.',
          type: 'reminder',
          status: 'draft',
          channels: ['email', 'sms'],
          audience: {
            type: 'building',
            count: 120,
            description: 'Edificio A',
          },
          author: {
            name: 'Sistema Automático',
            avatar: 'SA',
          },
          createdAt: '2024-01-13T11:15:00Z',
        },
        {
          id: '4',
          subject: 'Alerta: Corte de agua programado',
          message:
            'Informamos que habrá un corte de agua el día miércoles de 10:00 AM a 2:00 PM por trabajos de mantención en la red.',
          type: 'alert',
          status: 'failed',
          channels: ['email', 'sms', 'push'],
          audience: {
            type: 'all',
            count: 245,
            description: 'Todos los residentes',
          },
          author: {
            name: 'Administración',
            avatar: 'AD',
          },
          createdAt: '2024-01-12T08:45:00Z',
          sentAt: '2024-01-12T09:00:00Z',
        },
      ];
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(
        notification =>
          notification.subject
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          notification.message
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          notification.author.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        notification => notification.status === filters.status,
      );
    }

    if (filters.type) {
      filtered = filtered.filter(
        notification => notification.type === filters.type,
      );
    }

    if (filters.channel) {
      filtered = filtered.filter(notification =>
        notification.channels.includes(
          filters.channel as 'email' | 'sms' | 'push' | 'app',
        ),
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filters]);

  const getStats = () => {
    const sent = notifications.filter(n => n.status === 'sent').length;
    const draft = notifications.filter(n => n.status === 'draft').length;
    const scheduled = notifications.filter(
      n => n.status === 'scheduled',
    ).length;
    const failed = notifications.filter(n => n.status === 'failed').length;

    return { sent, draft, scheduled, failed };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleNotificationSelect = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId],
    );
  };

  const handleNotificationAction = async (
    action: string,
    notificationId: string,
  ) => {
    switch (action) {
      case 'view':
        router.push(`/notificaciones/${notificationId}`);
        break;
      case 'duplicate':
        // Crear una copia de la notificación
        const notificationToDuplicate = notifications.find(
          n => n.id === notificationId,
        );
        if (notificationToDuplicate) {
          const duplicatedNotification: NotificationData = {
            ...notificationToDuplicate,
            id: `${Date.now()}`,
            subject: `Copia de ${notificationToDuplicate.subject}`,
            status: 'draft',
            createdAt: new Date().toISOString(),
          };
          // Remove optional properties that should be undefined for drafts
          delete (duplicatedNotification as any).sentAt;
          delete (duplicatedNotification as any).scheduledFor;
          delete (duplicatedNotification as any).deliveryStats;
          setNotifications(prev => [duplicatedNotification, ...prev]);
          alert('Notificación duplicada como borrador');
        }
        break;
      case 'resend':
        if (
          confirm('¿Estás seguro de que quieres reenviar esta notificación?')
        ) {
          try {
            // Simular API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Notificación reenviada exitosamente');
            // Actualizar stats de la notificación
            setNotifications(prev =>
              prev.map(n =>
                n.id === notificationId
                  ? { ...n, sentAt: new Date().toISOString() }
                  : n,
              ),
            );
          } catch (error) {
            alert('Error al reenviar la notificación');
          }
        }
        break;
      case 'delete':
        if (
          confirm(
            '¿Estás seguro de que quieres eliminar esta notificación? Esta acción no se puede deshacer.',
          )
        ) {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
          setSelectedNotifications(prev =>
            prev.filter(id => id !== notificationId),
          );
          alert('Notificación eliminada');
        }
        break;
      default:
        console.log('Acción no implementada:', action);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedNotifications.length === 0) {
      alert('Por favor selecciona al menos una notificación');
      return;
    }

    switch (action) {
      case 'resend':
        if (
          confirm(
            `¿Estás seguro de que quieres reenviar ${selectedNotifications.length} notificación(es)?`,
          )
        ) {
          try {
            // Simular API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(
              `${selectedNotifications.length} notificación(es) reenviada(s) exitosamente`,
            );
            // Actualizar las notificaciones seleccionadas
            setNotifications(prev =>
              prev.map(n =>
                selectedNotifications.includes(n.id)
                  ? {
                      ...n,
                      sentAt: new Date().toISOString(),
                      status: 'sent' as const,
                    }
                  : n,
              ),
            );
            setSelectedNotifications([]);
          } catch (error) {
            alert('Error al reenviar las notificaciones');
          }
        }
        break;
      case 'archive':
        if (
          confirm(
            `¿Estás seguro de que quieres archivar ${selectedNotifications.length} notificación(es)?`,
          )
        ) {
          alert('Funcionalidad de archivo no implementada aún');
          setSelectedNotifications([]);
        }
        break;
      case 'delete':
        if (
          confirm(
            `¿Estás seguro de que quieres eliminar ${selectedNotifications.length} notificación(es)? Esta acción no se puede deshacer.`,
          )
        ) {
          setNotifications(prev =>
            prev.filter(n => !selectedNotifications.includes(n.id)),
          );
          setSelectedNotifications([]);
          alert(
            `${selectedNotifications.length} notificación(es) eliminada(s)`,
          );
        }
        break;
      case 'export':
        const selectedNotificationData = notifications.filter(n =>
          selectedNotifications.includes(n.id),
        );
        const csvContent =
          'data:text/csv;charset=utf-8,' +
          `ID,Asunto,Tipo,Estado,Autor,Fecha\n${ 
          selectedNotificationData
            .map(
              n =>
                `${n.id},"${n.subject}",${n.type},${n.status},${n.author.name},${n.createdAt}`,
            )
            .join('\n')}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
          'download',
          `notificaciones_${new Date().toISOString().split('T')[0]}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSelectedNotifications([]);
        alert('Notificaciones exportadas exitosamente');
        break;
      default:
        console.log('Acción masiva no implementada:', action);
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Notificaciones'>
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

  return (
    <ProtectedRoute>
      <Head>
        <title>Notificaciones — Cuentas Claras</title>
      </Head>

      <Layout title='Notificaciones'>
        <div className='container-fluid py-3'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-1'>Notificaciones</h1>
              <p className='text-muted mb-0'>
                Gestión de comunicaciones masivas
              </p>
            </div>
            <Link href='/notificaciones/nueva' className='btn btn-primary'>
              <i className='material-icons me-2'>add</i>
              Nueva Notificación
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className='row mb-4'>
            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #28a745',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon success me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#28a745',
                    }}
                  >
                    <i className='material-icons'>send</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.sent}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Enviadas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #6c757d',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon secondary me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#6c757d',
                    }}
                  >
                    <i className='material-icons'>draft</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.draft}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Borradores
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #2196f3',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon info me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#2196f3',
                    }}
                  >
                    <i className='material-icons'>schedule</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.scheduled}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Programadas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-6 col-md-3 mb-3'>
              <div
                className='stats-card'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: '4px solid #dc3545',
                  height: '100%',
                }}
              >
                <div className='d-flex align-items-center'>
                  <div
                    className='stats-icon danger me-3'
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'white',
                      backgroundColor: '#dc3545',
                    }}
                  >
                    <i className='material-icons'>error</i>
                  </div>
                  <div>
                    <div
                      className='stats-number'
                      style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#212529',
                      }}
                    >
                      {stats.failed}
                    </div>
                    <div
                      className='stats-label'
                      style={{ color: '#6c757d', fontSize: '0.875rem' }}
                    >
                      Fallidas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            className='filters-card mb-4'
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #e9ecef',
            }}
          >
            <div className='row g-3'>
              <div className='col-md-3'>
                <label className='form-label'>Buscar</label>
                <div className='search-box position-relative'>
                  <i
                    className='material-icons position-absolute'
                    style={{
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6c757d',
                      fontSize: '20px',
                    }}
                  >
                    search
                  </i>
                  <input
                    type='text'
                    className='form-control ps-5'
                    placeholder='Buscar notificaciones...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Estado</label>
                <select
                  className='form-select'
                  value={filters.status}
                  onChange={e =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  <option value='sent'>Enviada</option>
                  <option value='draft'>Borrador</option>
                  <option value='scheduled'>Programada</option>
                  <option value='failed'>Fallida</option>
                </select>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Tipo</label>
                <select
                  className='form-select'
                  value={filters.type}
                  onChange={e =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  <option value='system'>Sistema</option>
                  <option value='announcement'>Anuncio</option>
                  <option value='reminder'>Recordatorio</option>
                  <option value='alert'>Alerta</option>
                  <option value='maintenance'>Mantenimiento</option>
                </select>
              </div>

              <div className='col-md-2'>
                <label className='form-label'>Canal</label>
                <select
                  className='form-select'
                  value={filters.channel}
                  onChange={e =>
                    setFilters({ ...filters, channel: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  <option value='email'>Email</option>
                  <option value='sms'>SMS</option>
                  <option value='push'>Push</option>
                  <option value='app'>App</option>
                </select>
              </div>

              <div className='col-md-3 d-flex align-items-end gap-2'>
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      status: '',
                      type: '',
                      channel: '',
                      dateRange: '',
                    });
                  }}
                >
                  Limpiar
                </button>
                <div className='btn-group' role='group'>
                  <button
                    type='button'
                    className={`btn btn-outline-primary ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <i className='material-icons'>table_rows</i>
                  </button>
                  <button
                    type='button'
                    className={`btn btn-outline-primary ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    <i className='material-icons'>view_module</i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div
              className='bulk-actions mb-3'
              style={{
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: 'var(--radius)',
                padding: '1rem',
              }}
            >
              <div className='d-flex justify-content-between align-items-center'>
                <span>
                  {selectedNotifications.length} notificación(es)
                  seleccionada(s)
                </span>
                <div className='d-flex gap-2'>
                  <button
                    className='btn btn-sm btn-outline-success'
                    onClick={() => handleBulkAction('resend')}
                  >
                    Reenviar
                  </button>
                  <button
                    className='btn btn-sm btn-outline-secondary'
                    onClick={() => handleBulkAction('archive')}
                  >
                    Archivar
                  </button>
                  <button
                    className='btn btn-sm btn-outline-danger'
                    onClick={() => handleBulkAction('delete')}
                  >
                    Eliminar
                  </button>
                  <button
                    className='btn btn-sm btn-outline-info'
                    onClick={() => handleBulkAction('export')}
                  >
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Table/Cards */}
          <div
            className='notification-table'
            style={{
              backgroundColor: '#fff',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #e9ecef',
            }}
          >
            <div
              className='notification-header'
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e9ecef',
              }}
            >
              <div className='d-flex justify-content-between align-items-center'>
                <h6 className='notification-title mb-0'>
                  Notificaciones ({filteredNotifications.length})
                </h6>
                <div className='notification-actions d-flex gap-2'>
                  <button
                    className='btn btn-sm btn-outline-secondary'
                    onClick={() => {
                      // Exportar todas las notificaciones
                      const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        `ID,Asunto,Tipo,Estado,Autor,Fecha\n${ 
                        filteredNotifications
                          .map(
                            n =>
                              `${n.id},"${n.subject}",${n.type},${n.status},${n.author.name},${n.createdAt}`,
                          )
                          .join('\n')}`;

                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute(
                        'download',
                        `todas_notificaciones_${new Date().toISOString().split('T')[0]}.csv`,
                      );
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      alert('Todas las notificaciones exportadas exitosamente');
                    }}
                  >
                    <i className='material-icons me-1'>file_download</i>
                    Exportar
                  </button>
                  <button
                    className='btn btn-sm btn-outline-primary'
                    onClick={() => {
                      setLoading(true);
                      // Simular recarga de datos
                      setTimeout(() => {
                        setLoading(false);
                        alert('Datos actualizados');
                      }, 1000);
                    }}
                  >
                    <i className='material-icons me-1'>refresh</i>
                    Actualizar
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className='table-responsive d-none d-md-block'>
                <table className='table table-hover mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            checked={
                              selectedNotifications.length ===
                              filteredNotifications.length
                            }
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th>Asunto</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Canales</th>
                      <th>Audiencia</th>
                      <th>Autor</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotifications.map(notification => (
                      <tr key={notification.id}>
                        <td>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              checked={selectedNotifications.includes(
                                notification.id,
                              )}
                              onChange={() =>
                                handleNotificationSelect(notification.id)
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className='notification-subject fw-semibold'>
                            {notification.subject}
                          </div>
                          <div
                            className='small text-muted text-truncate'
                            style={{ maxWidth: '300px' }}
                          >
                            {notification.message}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`type-badge ${notification.type}`}
                            style={{
                              backgroundColor: typeConfig[notification.type].bg,
                              color: typeConfig[notification.type].color,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '14px' }}
                            >
                              {typeConfig[notification.type].icon}
                            </i>
                            {typeConfig[notification.type].label}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`notification-status ${notification.status}`}
                            style={{
                              backgroundColor:
                                statusConfig[notification.status].bg,
                              color: statusConfig[notification.status].color,
                              border: `1px solid ${statusConfig[notification.status].border}`,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '14px' }}
                            >
                              {statusConfig[notification.status].icon}
                            </i>
                            {statusConfig[notification.status].label}
                          </span>
                        </td>
                        <td>
                          <div className='notification-channels d-flex flex-wrap gap-1'>
                            {notification.channels.map(channel => (
                              <span
                                key={channel}
                                className={`channel-badge ${channel}`}
                                style={{
                                  backgroundColor: channelConfig[channel].bg,
                                  color: channelConfig[channel].color,
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <i
                                  className='material-icons me-1'
                                  style={{ fontSize: '12px' }}
                                >
                                  {channelConfig[channel].icon}
                                </i>
                                {channelConfig[channel].label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div>{notification.audience.count} personas</div>
                          <div className='small text-muted'>
                            {notification.audience.description}
                          </div>
                        </td>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div
                              className='author-avatar me-2'
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              {notification.author.avatar}
                            </div>
                            <span className='small'>
                              {notification.author.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className='small'>
                            {notification.sentAt
                              ? formatDate(notification.sentAt)
                              : notification.scheduledFor
                                ? `Prog: ${formatDate(notification.scheduledFor)}`
                                : formatDate(notification.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className='dropdown'>
                            <button
                              className='btn btn-sm btn-outline-secondary dropdown-toggle'
                              type='button'
                              data-bs-toggle='dropdown'
                            >
                              <i className='material-icons'>more_vert</i>
                            </button>
                            <ul className='dropdown-menu'>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleNotificationAction(
                                      'view',
                                      notification.id,
                                    )
                                  }
                                >
                                  <i className='material-icons me-2'>
                                    visibility
                                  </i>
                                  Ver detalle
                                </button>
                              </li>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleNotificationAction(
                                      'duplicate',
                                      notification.id,
                                    )
                                  }
                                >
                                  <i className='material-icons me-2'>
                                    content_copy
                                  </i>
                                  Duplicar
                                </button>
                              </li>
                              {notification.status === 'sent' && (
                                <li>
                                  <button
                                    className='dropdown-item'
                                    onClick={() =>
                                      handleNotificationAction(
                                        'resend',
                                        notification.id,
                                      )
                                    }
                                  >
                                    <i className='material-icons me-2'>send</i>
                                    Reenviar
                                  </button>
                                </li>
                              )}
                              <li>
                                <hr className='dropdown-divider' />
                              </li>
                              <li>
                                <button
                                  className='dropdown-item text-danger'
                                  onClick={() =>
                                    handleNotificationAction(
                                      'delete',
                                      notification.id,
                                    )
                                  }
                                >
                                  <i className='material-icons me-2'>delete</i>
                                  Eliminar
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* Cards View for Mobile and Desktop Cards Mode */}
            {viewMode === 'cards' || true ? (
              <div className={`p-3 ${viewMode === 'table' ? 'd-md-none' : ''}`}>
                <div className='row'>
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className='col-12 col-md-6 col-lg-4 mb-3'
                    >
                      <div
                        className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
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
                        }}
                      >
                        {/* Read Indicator */}
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

                        <div className='notification-card-header d-flex justify-content-between align-items-start mb-2'>
                          <div className='d-flex gap-2'>
                            <span
                              className={`notification-status ${notification.status}`}
                              style={{
                                backgroundColor:
                                  statusConfig[notification.status].bg,
                                color: statusConfig[notification.status].color,
                                border: `1px solid ${statusConfig[notification.status].border}`,
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <i
                                className='material-icons me-1'
                                style={{ fontSize: '12px' }}
                              >
                                {statusConfig[notification.status].icon}
                              </i>
                              {statusConfig[notification.status].label}
                            </span>
                          </div>
                          <div className='form-check'>
                            <input
                              className='form-check-input notification-checkbox'
                              type='checkbox'
                              checked={selectedNotifications.includes(
                                notification.id,
                              )}
                              onChange={() =>
                                handleNotificationSelect(notification.id)
                              }
                            />
                          </div>
                        </div>

                        <h6 className='notification-subject mb-2'>
                          {notification.subject}
                        </h6>

                        <p
                          className='notification-excerpt text-muted mb-3'
                          style={{
                            fontSize: '0.875rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {notification.message}
                        </p>

                        <div className='notification-meta mb-3'>
                          <div className='notification-meta-item d-flex align-items-center mb-1'>
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '16px', color: '#6c757d' }}
                            >
                              people
                            </i>
                            <span className='small text-muted'>
                              {notification.audience.count} personas
                            </span>
                          </div>
                          <div className='notification-meta-item d-flex align-items-center mb-1'>
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '16px', color: '#6c757d' }}
                            >
                              person
                            </i>
                            <span className='small text-muted'>
                              {notification.author.name}
                            </span>
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

                        <div className='notification-badges d-flex flex-wrap gap-2 mb-3'>
                          <span
                            className={`type-badge ${notification.type}`}
                            style={{
                              backgroundColor: typeConfig[notification.type].bg,
                              color: typeConfig[notification.type].color,
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <i
                              className='material-icons me-1'
                              style={{ fontSize: '12px' }}
                            >
                              {typeConfig[notification.type].icon}
                            </i>
                            {typeConfig[notification.type].label}
                          </span>
                        </div>

                        <div className='notification-channels d-flex flex-wrap gap-1 mb-3'>
                          {notification.channels.map(channel => (
                            <span
                              key={channel}
                              className={`channel-badge ${channel}`}
                              style={{
                                backgroundColor: channelConfig[channel].bg,
                                color: channelConfig[channel].color,
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <i
                                className='material-icons me-1'
                                style={{ fontSize: '12px' }}
                              >
                                {channelConfig[channel].icon}
                              </i>
                              {channelConfig[channel].label}
                            </span>
                          ))}
                        </div>

                        <div className='d-flex gap-2'>
                          <button
                            className='btn btn-outline-primary btn-sm flex-fill'
                            onClick={() =>
                              handleNotificationAction('view', notification.id)
                            }
                          >
                            Ver detalle
                          </button>
                          <div className='dropdown'>
                            <button
                              className='btn btn-outline-secondary btn-sm dropdown-toggle'
                              type='button'
                              data-bs-toggle='dropdown'
                            >
                              <i className='material-icons'>more_vert</i>
                            </button>
                            <ul className='dropdown-menu'>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleNotificationAction(
                                      'duplicate',
                                      notification.id,
                                    )
                                  }
                                >
                                  <i className='material-icons me-2'>
                                    content_copy
                                  </i>
                                  Duplicar
                                </button>
                              </li>
                              {notification.status === 'sent' && (
                                <li>
                                  <button
                                    className='dropdown-item'
                                    onClick={() =>
                                      handleNotificationAction(
                                        'resend',
                                        notification.id,
                                      )
                                    }
                                  >
                                    <i className='material-icons me-2'>send</i>
                                    Reenviar
                                  </button>
                                </li>
                              )}
                              <li>
                                <hr className='dropdown-divider' />
                              </li>
                              <li>
                                <button
                                  className='dropdown-item text-danger'
                                  onClick={() =>
                                    handleNotificationAction(
                                      'delete',
                                      notification.id,
                                    )
                                  }
                                >
                                  <i className='material-icons me-2'>delete</i>
                                  Eliminar
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Pagination */}
          <div className='d-flex justify-content-between align-items-center mt-4'>
            <div className='text-muted small'>
              Mostrando {filteredNotifications.length} de {notifications.length}{' '}
              notificaciones
            </div>
            <nav>
              <ul className='pagination mb-0'>
                <li className='page-item disabled'>
                  <a className='page-link' href='#'>
                    Anterior
                  </a>
                </li>
                <li className='page-item active'>
                  <a className='page-link' href='#'>
                    1
                  </a>
                </li>
                <li className='page-item'>
                  <a className='page-link' href='#'>
                    2
                  </a>
                </li>
                <li className='page-item'>
                  <a className='page-link' href='#'>
                    3
                  </a>
                </li>
                <li className='page-item'>
                  <a className='page-link' href='#'>
                    Siguiente
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
