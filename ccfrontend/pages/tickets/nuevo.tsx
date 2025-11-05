import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';

import Layout from '@/components/layout/Layout';
import { ticketsApi } from '@/lib/api/tickets';
import { ProtectedRoute } from '@/lib/useAuth';
import { TicketFormData } from '@/types/tickets';

interface TicketForm {
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  unidad_id?: number;
  unit: string;
  requesterName: string;
  requesterEmail: string;
  requesterType: 'resident' | 'admin';
  files: File[];
  tags: string[];
}

const priorityOptions = [
  {
    value: 'baja',
    label: 'Baja',
    description: 'Problema menor que no afecta el funcionamiento normal',
    color: '#28a745',
    icon: 'arrow_downward',
  },
  {
    value: 'media',
    label: 'Media',
    description: 'Problema moderado que requiere atención',
    color: '#ffc107',
    icon: 'remove',
  },
  {
    value: 'alta',
    label: 'Alta',
    description: 'Problema importante que afecta el funcionamiento',
    color: '#fd7e14',
    icon: 'arrow_upward',
  },
];

const categoryOptions = [
  {
    value: 'mantenimiento',
    label: 'Mantenimiento',
    description: 'Reparaciones y mantenimiento general',
    icon: 'build',
    color: '#6f42c1',
  },
  {
    value: 'seguridad',
    label: 'Seguridad',
    description: 'Temas relacionados con seguridad',
    icon: 'security',
    color: '#dc3545',
  },
  {
    value: 'convivencia',
    label: 'Convivencia',
    description: 'Problemas entre residentes',
    icon: 'people',
    color: '#17a2b8',
  },
  {
    value: 'servicios',
    label: 'Servicios',
    description: 'Servicios básicos y utilidades',
    icon: 'home_repair_service',
    color: '#28a745',
  },
  {
    value: 'administracion',
    label: 'Administración',
    description: 'Temas administrativos y financieros',
    icon: 'admin_panel_settings',
    color: '#fd7e14',
  },
  {
    value: 'otros',
    label: 'Otros',
    description: 'Otros temas no clasificados',
    icon: 'help_outline',
    color: '#6c757d',
  },
];

export default function NuevoTicket() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TicketForm>({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    categoria: '',
    unit: '',
    requesterName: '',
    requesterEmail: '',
    requesterType: 'resident',
    files: [],
    tags: [],
  });

  const [errors, setErrors] = useState<Partial<TicketForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // Mock units data
  const units = [
    'Edificio A - Depto 101',
    'Edificio A - Depto 102',
    'Edificio A - Depto 201',
    'Edificio A - Depto 202',
    'Edificio A - Depto 301',
    'Edificio B - Depto 101',
    'Edificio B - Depto 102',
    'Edificio B - Depto 201',
    'Edificio B - Depto 202',
    'Edificio B - Depto 301',
  ];

  const filteredUnits = units.filter(unit =>
    unit.toLowerCase().includes(unitSearchTerm.toLowerCase()),
  );

  const handleInputChange = (field: keyof TicketForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketForm> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El asunto es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad es requerida';
    }

    if (!formData.requesterName.trim()) {
      newErrors.requesterName = 'El nombre del solicitante es requerido';
    }

    if (!formData.requesterEmail.trim()) {
      newErrors.requesterEmail = 'El email del solicitante es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.requesterEmail)) {
      newErrors.requesterEmail = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener el ID de la comunidad del localStorage o contexto
      const comunidadId = 1; // TODO: Obtener del contexto de usuario/comunidad actual

      // Preparar los datos para la API
      const ticketData: TicketFormData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad: formData.prioridad,
        categoria: formData.categoria,
        // TODO: Agregar unidad_id cuando esté disponible
      };

      await ticketsApi.create(comunidadId, ticketData);

      // Success - redirect to tickets list
      router.push('/tickets');
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error creating ticket:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Ticket — Cuentas Claras</title>
      </Head>

      <Layout title='Nuevo Ticket'>
        <div className='container-fluid py-3'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-1'>Nuevo Ticket de Soporte</h1>
              <p className='text-muted mb-0'>
                Complete la información para crear un nuevo ticket
              </p>
            </div>
            <Link href='/tickets' className='btn btn-outline-secondary'>
              <i className='material-icons me-2'>arrow_back</i>
              Volver al listado
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='row'>
              {/* Main Form */}
              <div className='col-lg-8'>
                {/* Basic Information */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>info</i>
                      Información Básica
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='row'>
                      <div className='col-12 mb-3'>
                        <label className='form-label'>
                          Asunto <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                          placeholder='Describe brevemente el problema o solicitud'
                          value={formData.titulo}
                          onChange={e =>
                            handleInputChange('titulo', e.target.value)
                          }
                        />
                        {errors.titulo && (
                          <div className='invalid-feedback'>
                            {errors.titulo}
                          </div>
                        )}
                      </div>

                      <div className='col-12 mb-3'>
                        <label className='form-label'>
                          Descripción <span className='text-danger'>*</span>
                        </label>
                        <textarea
                          className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                          rows={4}
                          placeholder='Proporciona todos los detalles relevantes sobre el problema o solicitud'
                          value={formData.descripcion}
                          onChange={e =>
                            handleInputChange('descripcion', e.target.value)
                          }
                        />
                        {errors.descripcion && (
                          <div className='invalid-feedback'>
                            {errors.descripcion}
                          </div>
                        )}
                        <div className='form-text'>
                          Incluye detalles como cuándo ocurrió el problema, qué
                          estabas haciendo, etc.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority Selection */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>priority_high</i>
                      Prioridad del Ticket
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='row'>
                      {priorityOptions.map(priority => (
                        <div
                          key={priority.value}
                          className='col-6 col-lg-3 mb-3'
                        >
                          <div
                            className={`priority-card ${formData.prioridad === priority.value ? 'selected' : ''}`}
                            style={{
                              border:
                                formData.prioridad === priority.value
                                  ? `2px solid ${priority.color}`
                                  : '2px solid #e9ecef',
                              borderRadius: 'var(--radius)',
                              padding: '1rem',
                              cursor: 'pointer',
                              backgroundColor:
                                formData.prioridad === priority.value
                                  ? `${priority.color}10`
                                  : '#fff',
                              transition: 'all 0.2s ease',
                            }}
                            onClick={() =>
                              handleInputChange('prioridad', priority.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleInputChange('prioridad', priority.value);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className='text-center'>
                              <div
                                className='priority-icon mb-2'
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  backgroundColor: priority.color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '24px',
                                  margin: '0 auto',
                                }}
                              >
                                <i className='material-icons'>
                                  {priority.icon}
                                </i>
                              </div>
                              <h6 className='mb-1'>{priority.label}</h6>
                              <p className='small text-muted mb-0'>
                                {priority.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>category</i>
                      Categoría
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='row'>
                      {categoryOptions.map(category => (
                        <div
                          key={category.value}
                          className='col-6 col-lg-4 mb-3'
                        >
                          <div
                            className={`category-card ${formData.categoria === category.value ? 'selected' : ''}`}
                            style={{
                              border:
                                formData.categoria === category.value
                                  ? `2px solid ${category.color}`
                                  : '2px solid #e9ecef',
                              borderRadius: 'var(--radius)',
                              padding: '1rem',
                              cursor: 'pointer',
                              backgroundColor:
                                formData.categoria === category.value
                                  ? `${category.color}10`
                                  : '#fff',
                              transition: 'all 0.2s ease',
                            }}
                            onClick={() =>
                              handleInputChange('categoria', category.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleInputChange('categoria', category.value);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className='d-flex align-items-center'>
                              <div
                                className='category-icon me-3'
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: category.color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '20px',
                                }}
                              >
                                <i className='material-icons'>
                                  {category.icon}
                                </i>
                              </div>
                              <div>
                                <h6 className='mb-1'>{category.label}</h6>
                                <p className='small text-muted mb-0'>
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.categoria && (
                      <div className='text-danger small mt-2'>
                        {errors.categoria}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>attach_file</i>
                      Archivos Adjuntos
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div
                      className='file-upload-zone'
                      style={{
                        border: '2px dashed #dee2e6',
                        borderRadius: 'var(--radius)',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa',
                      }}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={handleFileSelect}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleFileSelect();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Haz clic o arrastra archivos para subir"
                    >
                      <i
                        className='material-icons mb-2'
                        style={{ fontSize: '48px', color: '#6c757d' }}
                      >
                        cloud_upload
                      </i>
                      <h6>
                        Arrastra archivos aquí o haz clic para seleccionar
                      </h6>
                      <p className='text-muted mb-0'>
                        Formatos soportados: PDF, JPG, PNG, DOC, DOCX (Max. 10MB
                        por archivo)
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                    />

                    {formData.files.length > 0 && (
                      <div className='mt-3'>
                        <h6 className='mb-2'>Archivos seleccionados:</h6>
                        {formData.files.map((file, index) => (
                          <div
                            key={index}
                            className='d-flex align-items-center justify-content-between p-2 border rounded mb-2'
                          >
                            <div className='d-flex align-items-center'>
                              <i className='material-icons me-2 text-primary'>
                                description
                              </i>
                              <div>
                                <div className='fw-semibold'>{file.name}</div>
                                <small className='text-muted'>
                                  {formatFileSize(file.size)}
                                </small>
                              </div>
                            </div>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-danger'
                              onClick={() => removeFile(index)}
                            >
                              <i className='material-icons'>delete</i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className='col-lg-4'>
                {/* Requester Information */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>person</i>
                      Información del Solicitante
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='mb-3'>
                      <label className='form-label'>Tipo de Solicitante</label>
                      <div className='btn-group w-100' role='group'>
                        <input
                          type='radio'
                          className='btn-check'
                          name='requesterType'
                          id='resident'
                          checked={formData.requesterType === 'resident'}
                          onChange={() =>
                            handleInputChange('requesterType', 'resident')
                          }
                        />
                        <label
                          className='btn btn-outline-primary'
                          htmlFor='resident'
                        >
                          <i className='material-icons me-1'>home</i>
                          Residente
                        </label>

                        <input
                          type='radio'
                          className='btn-check'
                          name='requesterType'
                          id='admin'
                          checked={formData.requesterType === 'admin'}
                          onChange={() =>
                            handleInputChange('requesterType', 'admin')
                          }
                        />
                        <label
                          className='btn btn-outline-primary'
                          htmlFor='admin'
                        >
                          <i className='material-icons me-1'>
                            admin_panel_settings
                          </i>
                          Admin
                        </label>
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>
                        Unidad <span className='text-danger'>*</span>
                      </label>
                      <div className='position-relative'>
                        <input
                          type='text'
                          className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
                          placeholder='Buscar unidad...'
                          value={unitSearchTerm}
                          onChange={e => {
                            setUnitSearchTerm(e.target.value);
                            setShowUnitDropdown(true);
                            handleInputChange('unit', e.target.value);
                          }}
                          onFocus={() => setShowUnitDropdown(true)}
                        />
                        {showUnitDropdown && filteredUnits.length > 0 && (
                          <div
                            className='dropdown-menu show w-100'
                            style={{
                              position: 'absolute',
                              top: '100%',
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto',
                            }}
                          >
                            {filteredUnits.map((unit, index) => (
                              <button
                                key={index}
                                type='button'
                                className='dropdown-item'
                                onClick={() => {
                                  setUnitSearchTerm(unit);
                                  handleInputChange('unit', unit);
                                  setShowUnitDropdown(false);
                                }}
                              >
                                {unit}
                              </button>
                            ))}
                          </div>
                        )}
                        {errors.unit && (
                          <div className='invalid-feedback'>{errors.unit}</div>
                        )}
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>
                        Nombre Completo <span className='text-danger'>*</span>
                      </label>
                      <input
                        type='text'
                        className={`form-control ${errors.requesterName ? 'is-invalid' : ''}`}
                        placeholder='Juan Pérez'
                        value={formData.requesterName}
                        onChange={e =>
                          handleInputChange('requesterName', e.target.value)
                        }
                      />
                      {errors.requesterName && (
                        <div className='invalid-feedback'>
                          {errors.requesterName}
                        </div>
                      )}
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>
                        Email <span className='text-danger'>*</span>
                      </label>
                      <input
                        type='email'
                        className={`form-control ${errors.requesterEmail ? 'is-invalid' : ''}`}
                        placeholder='juan.perez@email.com'
                        value={formData.requesterEmail}
                        onChange={e =>
                          handleInputChange('requesterEmail', e.target.value)
                        }
                      />
                      {errors.requesterEmail && (
                        <div className='invalid-feedback'>
                          {errors.requesterEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className='card mb-4'>
                  <div className='card-header'>
                    <h5 className='card-title mb-0'>
                      <i className='material-icons me-2'>summarize</i>
                      Resumen del Ticket
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='summary-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Prioridad:</span>
                      <span className='fw-semibold'>
                        {priorityOptions.find(
                          p => p.value === formData.prioridad,
                        )?.label || 'No seleccionada'}
                      </span>
                    </div>
                    <div className='summary-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Categoría:</span>
                      <span className='fw-semibold'>
                        {categoryOptions.find(
                          c => c.value === formData.categoria,
                        )?.label || 'No seleccionada'}
                      </span>
                    </div>
                    <div className='summary-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Unidad:</span>
                      <span className='fw-semibold'>
                        {formData.unit || 'No especificada'}
                      </span>
                    </div>
                    <div className='summary-item d-flex justify-content-between mb-2'>
                      <span className='text-muted'>Archivos:</span>
                      <span className='fw-semibold'>
                        {formData.files.length} archivo(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='d-grid gap-2'>
                  <button
                    type='submit'
                    className='btn btn-primary btn-lg'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className='spinner-border spinner-border-sm me-2'
                          role='status'
                        ></span>
                        Creando Ticket...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-2'>send</i>
                        Crear Ticket
                      </>
                    )}
                  </button>
                  <Link href='/tickets' className='btn btn-outline-secondary'>
                    Cancelar
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

