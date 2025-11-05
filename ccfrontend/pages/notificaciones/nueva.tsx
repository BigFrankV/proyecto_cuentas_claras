import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

type NotificationType =
  | 'system'
  | 'announcement'
  | 'reminder'
  | 'alert'
  | 'maintenance';
type NotificationChannel = 'email' | 'sms' | 'push' | 'app';
type AudienceType = 'all' | 'building' | 'unit' | 'custom';

interface NotificationForm {
  type: NotificationType;
  subject: string;
  message: string;
  channels: NotificationChannel[];
  audience: {
    type: AudienceType;
    buildingIds?: string[];
    unitIds?: string[];
    userIds?: string[];
  };
  scheduling: {
    type: 'now' | 'later';
    scheduledFor?: Date;
  };
  options: {
    priority: 'low' | 'normal' | 'high';
    attachments: File[];
    requireConfirmation: boolean;
    trackOpening: boolean;
  };
}

const notificationTypes = [
  {
    id: 'system' as NotificationType,
    title: 'Sistema',
    description: 'Notificaciones automáticas del sistema',
    icon: 'settings',
    color: '#1565C0',
    bg: '#E3F2FD',
    examples: 'Actualizaciones, mantenimiento técnico',
  },
  {
    id: 'announcement' as NotificationType,
    title: 'Anuncio',
    description: 'Comunicados y anuncios importantes',
    icon: 'campaign',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    examples: 'Reuniones, eventos, noticias',
  },
  {
    id: 'reminder' as NotificationType,
    title: 'Recordatorio',
    description: 'Recordatorios y fechas importantes',
    icon: 'alarm',
    color: '#F57C00',
    bg: '#FFF8E1',
    examples: 'Pagos, vencimientos, citas',
  },
  {
    id: 'alert' as NotificationType,
    title: 'Alerta',
    description: 'Alertas urgentes que requieren atención',
    icon: 'warning',
    color: '#C62828',
    bg: '#FFEBEE',
    examples: 'Emergencias, problemas críticos',
  },
  {
    id: 'maintenance' as NotificationType,
    title: 'Mantenimiento',
    description: 'Avisos de mantenimiento y trabajos',
    icon: 'build',
    color: '#2E7D32',
    bg: '#E8F5E9',
    examples: 'Trabajos programados, reparaciones',
  },
];

const channels = [
  {
    id: 'email' as NotificationChannel,
    title: 'Email',
    description: 'Correo electrónico',
    icon: 'email',
    color: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    id: 'sms' as NotificationChannel,
    title: 'SMS',
    description: 'Mensaje de texto',
    icon: 'sms',
    color: '#2E7D32',
    bg: '#E8F5E9',
  },
  {
    id: 'push' as NotificationChannel,
    title: 'Push',
    description: 'Notificación push',
    icon: 'notifications',
    color: '#F57C00',
    bg: '#FFF8E1',
  },
  {
    id: 'app' as NotificationChannel,
    title: 'App',
    description: 'Notificación en la app',
    icon: 'phone_android',
    color: '#7B1FA2',
    bg: '#F3E5F5',
  },
];

export default function NuevaNotificacion() {
  const router = useRouter();
  const [formData, setFormData] = useState<NotificationForm>({
    type: 'announcement',
    subject: '',
    message: '',
    channels: ['email'],
    audience: {
      type: 'all',
    },
    scheduling: {
      type: 'now',
    },
    options: {
      priority: 'normal',
      attachments: [],
      requireConfirmation: false,
      trackOpening: true,
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleTypeSelect = (type: NotificationType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSave = async (action: 'draft' | 'send' | 'schedule') => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect based on action
      if (action === 'draft') {
        router.push('/notificaciones?message=draft-saved');
      } else if (action === 'send') {
        router.push('/notificaciones?message=sent');
      } else {
        router.push('/notificaciones?message=scheduled');
      }
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error saving notification:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedType = notificationTypes.find(t => t.id === formData.type);

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Notificación — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Notificación'>
        <div className='container-fluid py-3'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <nav aria-label='breadcrumb'>
                <ol className='breadcrumb mb-1'>
                  <li className='breadcrumb-item'>
                    <Link
                      href='/notificaciones'
                      className='text-decoration-none'
                    >
                      Notificaciones
                    </Link>
                  </li>
                  <li className='breadcrumb-item active' aria-current='page'>
                    Nueva Notificación
                  </li>
                </ol>
              </nav>
              <h1 className='h3 mb-0'>Nueva Notificación</h1>
            </div>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => setShowPreview(!showPreview)}
              >
                <i className='material-icons me-2'>preview</i>
                {showPreview ? 'Ocultar' : 'Vista previa'}
              </button>
              <Link
                href='/notificaciones'
                className='btn btn-outline-secondary'
              >
                Cancelar
              </Link>
            </div>
          </div>

          <div className='row'>
            <div className={showPreview ? 'col-lg-8' : 'col-12'}>
              {/* Progress Steps */}
              <div
                className='steps-indicator mb-4'
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 'var(--radius)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #e9ecef',
                }}
              >
                <div className='row'>
                  <div className='col-3'>
                    <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                      <div
                        className='step-icon'
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor:
                            currentStep >= 1
                              ? 'var(--color-primary)'
                              : '#e9ecef',
                          color: currentStep >= 1 ? 'white' : '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem',
                        }}
                      >
                        <i className='material-icons'>category</i>
                      </div>
                      <div className='step-label text-center'>
                        <div className='fw-semibold'>Tipo</div>
                        <div className='small text-muted'>Seleccionar tipo</div>
                      </div>
                    </div>
                  </div>
                  <div className='col-3'>
                    <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                      <div
                        className='step-icon'
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor:
                            currentStep >= 2
                              ? 'var(--color-primary)'
                              : '#e9ecef',
                          color: currentStep >= 2 ? 'white' : '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem',
                        }}
                      >
                        <i className='material-icons'>edit</i>
                      </div>
                      <div className='step-label text-center'>
                        <div className='fw-semibold'>Contenido</div>
                        <div className='small text-muted'>Redactar mensaje</div>
                      </div>
                    </div>
                  </div>
                  <div className='col-3'>
                    <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                      <div
                        className='step-icon'
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor:
                            currentStep >= 3
                              ? 'var(--color-primary)'
                              : '#e9ecef',
                          color: currentStep >= 3 ? 'white' : '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem',
                        }}
                      >
                        <i className='material-icons'>send</i>
                      </div>
                      <div className='step-label text-center'>
                        <div className='fw-semibold'>Envío</div>
                        <div className='small text-muted'>
                          Canales y audiencia
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-3'>
                    <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                      <div
                        className='step-icon'
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor:
                            currentStep >= 4
                              ? 'var(--color-primary)'
                              : '#e9ecef',
                          color: currentStep >= 4 ? 'white' : '#6c757d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 0.5rem',
                        }}
                      >
                        <i className='material-icons'>schedule</i>
                      </div>
                      <div className='step-label text-center'>
                        <div className='fw-semibold'>Programación</div>
                        <div className='small text-muted'>Cuándo enviar</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1: Type Selection */}
              {currentStep === 1 && (
                <div
                  className='step-content'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <h5 className='mb-3'>Selecciona el tipo de notificación</h5>
                  <p className='text-muted mb-4'>
                    Elige el tipo que mejor describa tu notificación. Esto
                    ayudará a los destinatarios a entender la importancia y
                    urgencia del mensaje.
                  </p>

                  <div className='row g-3'>
                    {notificationTypes.map(type => (
                      <div key={type.id} className='col-md-6 col-lg-4'>
                        <div
                          className={`type-card ${formData.type === type.id ? 'selected' : ''}`}
                          style={{
                            backgroundColor:
                              formData.type === type.id ? type.bg : '#fff',
                            border:
                              formData.type === type.id
                                ? `2px solid ${type.color}`
                                : '1px solid #e9ecef',
                            borderRadius: 'var(--radius)',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            height: '100%',
                          }}
                          onClick={() => handleTypeSelect(type.id)}
                        >
                          <div
                            className='type-icon mb-3'
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: type.color,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.5rem',
                            }}
                          >
                            <i className='material-icons'>{type.icon}</i>
                          </div>
                          <h6 className='type-title mb-2'>{type.title}</h6>
                          <p
                            className='type-description text-muted mb-2'
                            style={{ fontSize: '0.875rem' }}
                          >
                            {type.description}
                          </p>
                          <div
                            className='type-examples'
                            style={{ fontSize: '0.75rem', color: type.color }}
                          >
                            Ej: {type.examples}
                          </div>
                          {formData.type === type.id && (
                            <div className='selected-indicator mt-2'>
                              <i
                                className='material-icons'
                                style={{ color: type.color }}
                              >
                                check_circle
                              </i>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='d-flex justify-content-end mt-4'>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={() => setCurrentStep(2)}
                      disabled={!formData.type}
                    >
                      Continuar
                      <i className='material-icons ms-2'>arrow_forward</i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Content */}
              {currentStep === 2 && (
                <div
                  className='step-content'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <div className='d-flex align-items-center mb-3'>
                    <div
                      className='selected-type-indicator me-3'
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: selectedType?.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>{selectedType?.icon}</i>
                    </div>
                    <div>
                      <h5 className='mb-0'>Redactar {selectedType?.title}</h5>
                      <small className='text-muted'>
                        {selectedType?.description}
                      </small>
                    </div>
                  </div>

                  <div className='row'>
                    <div className='col-12'>
                      <div className='mb-3'>
                        <label htmlFor='subject' className='form-label'>
                          Asunto <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='subject'
                          placeholder='Escribe el asunto de la notificación'
                          value={formData.subject}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          maxLength={100}
                        />
                        <div className='form-text'>
                          {formData.subject.length}/100 caracteres
                        </div>
                      </div>

                      <div className='mb-3'>
                        <label htmlFor='message' className='form-label'>
                          Mensaje <span className='text-danger'>*</span>
                        </label>
                        <div
                          className='rich-editor-container'
                          style={{
                            border: '1px solid #ced4da',
                            borderRadius: 'var(--radius)',
                            minHeight: '200px',
                          }}
                        >
                          {/* Toolbar */}
                          <div
                            className='editor-toolbar'
                            style={{
                              borderBottom: '1px solid #e9ecef',
                              padding: '0.5rem',
                            }}
                          >
                            <div
                              className='btn-group btn-group-sm me-2'
                              role='group'
                            >
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>format_bold</i>
                              </button>
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>format_italic</i>
                              </button>
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>
                                  format_underlined
                                </i>
                              </button>
                            </div>
                            <div
                              className='btn-group btn-group-sm me-2'
                              role='group'
                            >
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>
                                  format_list_bulleted
                                </i>
                              </button>
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>
                                  format_list_numbered
                                </i>
                              </button>
                            </div>
                            <div
                              className='btn-group btn-group-sm me-2'
                              role='group'
                            >
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>link</i>
                              </button>
                              <button
                                type='button'
                                className='btn btn-outline-secondary'
                              >
                                <i className='material-icons'>
                                  insert_emoticon
                                </i>
                              </button>
                            </div>
                          </div>

                          {/* Content Area */}
                          <textarea
                            className='form-control border-0'
                            id='message'
                            rows={8}
                            placeholder='Escribe el contenido de tu notificación aquí...'
                            value={formData.message}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                message: e.target.value,
                              }))
                            }
                            style={{
                              resize: 'none',
                              fontSize: '1rem',
                              lineHeight: '1.5',
                            }}
                          />
                        </div>
                        <div className='form-text'>
                          {formData.message.length} caracteres
                        </div>
                      </div>

                      {/* Variables dinámicas */}
                      <div className='mb-3'>
                        <label className='form-label'>
                          Variables disponibles
                        </label>
                        <div className='variable-chips d-flex flex-wrap gap-2'>
                          {[
                            '{{nombre_usuario}}',
                            '{{numero_unidad}}',
                            '{{nombre_edificio}}',
                            '{{fecha_actual}}',
                            '{{administrador}}',
                          ].map(variable => (
                            <span
                              key={variable}
                              className='badge bg-light text-dark border'
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const newMessage = formData.message + variable;
                                setFormData(prev => ({
                                  ...prev,
                                  message: newMessage,
                                }));
                              }}
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                        <div className='form-text'>
                          Haz clic en una variable para agregarla al mensaje
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='d-flex justify-content-between mt-4'>
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => setCurrentStep(1)}
                    >
                      <i className='material-icons me-2'>arrow_back</i>
                      Anterior
                    </button>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.subject || !formData.message}
                    >
                      Continuar
                      <i className='material-icons ms-2'>arrow_forward</i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Channels and Audience */}
              {currentStep === 3 && (
                <div
                  className='step-content'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <h5 className='mb-4'>Canales de envío y audiencia</h5>

                  {/* Channels */}
                  <div className='mb-4'>
                    <label className='form-label'>
                      Canales de comunicación{' '}
                      <span className='text-danger'>*</span>
                    </label>
                    <p className='text-muted small mb-3'>
                      Selecciona los canales por los cuales se enviará la
                      notificación
                    </p>
                    <div className='row g-2'>
                      {channels.map(channel => (
                        <div key={channel.id} className='col-6 col-md-3'>
                          <div
                            className={`channel-card ${formData.channels.includes(channel.id) ? 'selected' : ''}`}
                            style={{
                              backgroundColor: formData.channels.includes(
                                channel.id,
                              )
                                ? channel.bg
                                : '#fff',
                              border: formData.channels.includes(channel.id)
                                ? `2px solid ${channel.color}`
                                : '1px solid #e9ecef',
                              borderRadius: 'var(--radius)',
                              padding: '1rem',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            onClick={() => handleChannelToggle(channel.id)}
                          >
                            <div
                              className='channel-icon mb-2'
                              style={{
                                color: formData.channels.includes(channel.id)
                                  ? channel.color
                                  : '#6c757d',
                              }}
                            >
                              <i
                                className='material-icons'
                                style={{ fontSize: '2rem' }}
                              >
                                {channel.icon}
                              </i>
                            </div>
                            <div className='channel-title fw-semibold'>
                              {channel.title}
                            </div>
                            <div className='channel-description small text-muted'>
                              {channel.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audience */}
                  <div className='mb-4'>
                    <label className='form-label'>
                      Audiencia <span className='text-danger'>*</span>
                    </label>
                    <p className='text-muted small mb-3'>
                      Define quién recibirá esta notificación
                    </p>

                    <div className='audience-options'>
                      <div className='form-check mb-3'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='audience'
                          id='audience-all'
                          checked={formData.audience.type === 'all'}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              audience: { type: 'all' },
                            }))
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='audience-all'
                        >
                          <div className='fw-semibold'>
                            Todos los residentes
                          </div>
                          <div className='small text-muted'>
                            Enviar a todas las unidades y residentes
                          </div>
                          <div className='small text-info'>~245 personas</div>
                        </label>
                      </div>

                      <div className='form-check mb-3'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='audience'
                          id='audience-building'
                          checked={formData.audience.type === 'building'}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              audience: { type: 'building' },
                            }))
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='audience-building'
                        >
                          <div className='fw-semibold'>Por edificio</div>
                          <div className='small text-muted'>
                            Seleccionar edificios específicos
                          </div>
                        </label>
                      </div>

                      <div className='form-check mb-3'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='audience'
                          id='audience-unit'
                          checked={formData.audience.type === 'unit'}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              audience: { type: 'unit' },
                            }))
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='audience-unit'
                        >
                          <div className='fw-semibold'>Por unidad</div>
                          <div className='small text-muted'>
                            Seleccionar unidades específicas
                          </div>
                        </label>
                      </div>

                      <div className='form-check mb-3'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='audience'
                          id='audience-custom'
                          checked={formData.audience.type === 'custom'}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              audience: { type: 'custom' },
                            }))
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='audience-custom'
                        >
                          <div className='fw-semibold'>
                            Audiencia personalizada
                          </div>
                          <div className='small text-muted'>
                            Seleccionar usuarios específicos o grupos
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Building/Unit/Custom selectors */}
                    {formData.audience.type === 'building' && (
                      <div className='mt-3'>
                        <select className='form-select' multiple>
                          <option value='building-a'>Edificio A</option>
                          <option value='building-b'>Edificio B</option>
                          <option value='building-c'>Edificio C</option>
                        </select>
                        <div className='form-text'>
                          Mantén Ctrl/Cmd para seleccionar múltiples edificios
                        </div>
                      </div>
                    )}

                    {formData.audience.type === 'unit' && (
                      <div className='mt-3'>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Buscar unidades por número...'
                        />
                        <div className='form-text'>
                          Escribe los números de unidad separados por comas
                        </div>
                      </div>
                    )}

                    {formData.audience.type === 'custom' && (
                      <div className='mt-3'>
                        <div className='custom-audience-builder'>
                          <div className='row g-2'>
                            <div className='col-md-4'>
                              <select className='form-select'>
                                <option>Propietarios</option>
                                <option>Inquilinos</option>
                                <option>Administradores</option>
                                <option>Consejo</option>
                              </select>
                            </div>
                            <div className='col-md-4'>
                              <select className='form-select'>
                                <option>Todos</option>
                                <option>Con deuda</option>
                                <option>Al día</option>
                                <option>Morosos</option>
                              </select>
                            </div>
                            <div className='col-md-4'>
                              <button className='btn btn-outline-primary w-100'>
                                <i className='material-icons me-2'>add</i>
                                Agregar filtro
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='d-flex justify-content-between mt-4'>
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => setCurrentStep(2)}
                    >
                      <i className='material-icons me-2'>arrow_back</i>
                      Anterior
                    </button>
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={() => setCurrentStep(4)}
                      disabled={formData.channels.length === 0}
                    >
                      Continuar
                      <i className='material-icons ms-2'>arrow_forward</i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Scheduling */}
              {currentStep === 4 && (
                <div
                  className='step-content'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <h5 className='mb-4'>Programación y opciones</h5>

                  {/* Scheduling */}
                  <div className='mb-4'>
                    <label className='form-label'>¿Cuándo enviar?</label>

                    <div className='scheduling-options'>
                      <div className='form-check mb-3'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='scheduling'
                          id='schedule-now'
                          checked={formData.scheduling.type === 'now'}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              scheduling: { type: 'now' },
                            }))
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='schedule-now'
                        >
                          <div className='fw-semibold'>Enviar ahora</div>
                          <div className='small text-muted'>
                            La notificación se enviará inmediatamente
                          </div>
                        </label>
                      </div>

                      <div className='form-check mb-3'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='scheduling'
                          id='schedule-later'
                          checked={formData.scheduling.type === 'later'}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              scheduling: { type: 'later' },
                            }))
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='schedule-later'
                        >
                          <div className='fw-semibold'>
                            Programar para más tarde
                          </div>
                          <div className='small text-muted'>
                            Selecciona fecha y hora específica
                          </div>
                        </label>
                      </div>
                    </div>

                    {formData.scheduling.type === 'later' && (
                      <div className='mt-3'>
                        <div className='row g-3'>
                          <div className='col-md-6'>
                            <label
                              htmlFor='scheduled-date'
                              className='form-label'
                            >
                              Fecha
                            </label>
                            <input
                              type='date'
                              className='form-control'
                              id='scheduled-date'
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className='col-md-6'>
                            <label
                              htmlFor='scheduled-time'
                              className='form-label'
                            >
                              Hora
                            </label>
                            <input
                              type='time'
                              className='form-control'
                              id='scheduled-time'
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div className='mb-4'>
                    <label className='form-label'>Prioridad</label>
                    <select
                      className='form-select'
                      value={formData.options.priority}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          options: {
                            ...prev.options,
                            priority: e.target.value as
                              | 'low'
                              | 'normal'
                              | 'high',
                          },
                        }))
                      }
                    >
                      <option value='low'>Baja - Información general</option>
                      <option value='normal'>
                        Normal - Comunicación estándar
                      </option>
                      <option value='high'>
                        Alta - Requiere atención inmediata
                      </option>
                    </select>
                  </div>

                  {/* Advanced Options */}
                  <div className='mb-4'>
                    <label className='form-label'>Opciones avanzadas</label>

                    <div className='form-check mb-2'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='track-opening'
                        checked={formData.options.trackOpening}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            options: {
                              ...prev.options,
                              trackOpening: e.target.checked,
                            },
                          }))
                        }
                      />
                      <label
                        className='form-check-label'
                        htmlFor='track-opening'
                      >
                        <div className='fw-semibold'>Rastrear apertura</div>
                        <div className='small text-muted'>
                          Saber cuándo los destinatarios leen la notificación
                        </div>
                      </label>
                    </div>

                    <div className='form-check mb-2'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='require-confirmation'
                        checked={formData.options.requireConfirmation}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            options: {
                              ...prev.options,
                              requireConfirmation: e.target.checked,
                            },
                          }))
                        }
                      />
                      <label
                        className='form-check-label'
                        htmlFor='require-confirmation'
                      >
                        <div className='fw-semibold'>Requerir confirmación</div>
                        <div className='small text-muted'>
                          Los destinatarios deben confirmar que leyeron el
                          mensaje
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='d-flex justify-content-between mt-4'>
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => setCurrentStep(3)}
                    >
                      <i className='material-icons me-2'>arrow_back</i>
                      Anterior
                    </button>

                    <div className='d-flex gap-2'>
                      <button
                        type='button'
                        className='btn btn-outline-secondary'
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                      >
                        {saving ? (
                          <div className='spinner-border spinner-border-sm me-2' />
                        ) : (
                          <i className='material-icons me-2'>save</i>
                        )}
                        Guardar como borrador
                      </button>

                      {formData.scheduling.type === 'now' ? (
                        <button
                          type='button'
                          className='btn btn-success'
                          onClick={() => handleSave('send')}
                          disabled={saving}
                        >
                          {saving ? (
                            <div className='spinner-border spinner-border-sm me-2' />
                          ) : (
                            <i className='material-icons me-2'>send</i>
                          )}
                          Enviar ahora
                        </button>
                      ) : (
                        <button
                          type='button'
                          className='btn btn-primary'
                          onClick={() => handleSave('schedule')}
                          disabled={saving}
                        >
                          {saving ? (
                            <div className='spinner-border spinner-border-sm me-2' />
                          ) : (
                            <i className='material-icons me-2'>schedule</i>
                          )}
                          Programar envío
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className='col-lg-4'>
                <div
                  className='preview-panel sticky-top'
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #e9ecef',
                    top: '20px',
                  }}
                >
                  <h6 className='mb-3'>Vista previa</h6>

                  <div
                    className='preview-notification'
                    style={{
                      border: '1px solid #e9ecef',
                      borderRadius: 'var(--radius)',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <div className='preview-header d-flex align-items-center mb-2'>
                      <div
                        className='preview-type-icon me-2'
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: selectedType?.color,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                        }}
                      >
                        <i
                          className='material-icons'
                          style={{ fontSize: '14px' }}
                        >
                          {selectedType?.icon}
                        </i>
                      </div>
                      <span className='small fw-semibold'>
                        {selectedType?.title}
                      </span>
                    </div>

                    <div className='preview-subject fw-semibold mb-2'>
                      {formData.subject || 'Asunto de la notificación'}
                    </div>

                    <div className='preview-message small mb-3'>
                      {formData.message ||
                        'El contenido de la notificación aparecerá aquí...'}
                    </div>

                    <div className='preview-channels mb-2'>
                      <div className='small text-muted mb-1'>Canales:</div>
                      <div className='d-flex flex-wrap gap-1'>
                        {formData.channels.map(channel => {
                          const channelConfig = channels.find(
                            c => c.id === channel,
                          );
                          return (
                            <span
                              key={channel}
                              className='badge'
                              style={{
                                backgroundColor: channelConfig?.bg,
                                color: channelConfig?.color,
                                fontSize: '0.7rem',
                              }}
                            >
                              {channelConfig?.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className='preview-audience'>
                      <div className='small text-muted mb-1'>Audiencia:</div>
                      <div className='small'>
                        {formData.audience.type === 'all' &&
                          'Todos los residentes'}
                        {formData.audience.type === 'building' &&
                          'Por edificio'}
                        {formData.audience.type === 'unit' && 'Por unidad'}
                        {formData.audience.type === 'custom' &&
                          'Audiencia personalizada'}
                      </div>
                    </div>
                  </div>

                  <div className='preview-stats mt-3'>
                    <div className='small text-muted'>
                      Estadísticas estimadas:
                    </div>
                    <div className='small'>
                      • Destinatarios: ~245 personas
                      <br />
                      • Costo estimado: $0 (canales gratuitos)
                      <br />• Tiempo de envío: ~2-5 minutos
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

