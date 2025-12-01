import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';


import Layout from '@/components/layout/Layout';
import { cargosApi } from '@/lib/api/cargos';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { Permission, usePermissions } from '@/lib/usePermissions';
import { CargoFormData } from '@/types/cargos';

// Interfaces
interface Charge {
  concept: string;
  type: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  unit: string;
  description?: string;
}

export default function NuevoCargoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const { comunidadSeleccionada } = useComunidad();

  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [comunidadId, setComunidadId] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Form data (declarado antes de cualquier return para evitar hooks condicionales)
  const [formData, setFormData] = useState<CargoFormData>({
    concepto: '',
    tipo: 'administration',
    monto: 0,
    fecha_vencimiento: '',
    unidad: '',
    descripcion: '',
  });

  // Limpiar errores de API si cambia la comunidad seleccionada
  useEffect(() => {
    if (apiError) {setApiError(null);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadSeleccionada]);

  // Determinar comunidadId efectivo
  useEffect(() => {
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      setComunidadId(Number(comunidadSeleccionada.id));
      return;
    }
    if (user) {
      setComunidadId(user.comunidad_id || (user.memberships?.[0]?.comunidadId) || null);
    }
  }, [comunidadSeleccionada, user]);

  // Verificar permiso de creación
  useEffect(() => {
    const allowed = hasPermission(Permission.CREATE_CARGO, comunidadId ?? null);
    setAccessDenied(!allowed);
  }, [hasPermission, comunidadId]);

  if (accessDenied) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Acceso denegado — Nuevo Cargo</title>
        </Head>
        <Layout title='Nuevo Cargo'>
          <div className='container-fluid py-5'>
            <div className='row justify-content-center'>
              <div className='col-md-8 col-lg-6'>
                <div className='card shadow-sm'>
                  <div className='card-body text-center py-5'>
                    <div className='mb-4'>
                      <i className='material-icons text-warning' style={{ fontSize: '64px' }}>lock</i>
                    </div>
                    <h3 className='mb-3'>Acceso Restringido</h3>
                    <p className='text-muted mb-4'>No tienes permiso para crear cargos en la comunidad seleccionada.</p>
                    <div className='d-flex gap-3 justify-content-center'>
                      <button className='btn btn-primary' onClick={() => router.push('/cargos')}>Volver a Cargos</button>
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

  

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.concepto.trim()) {
      newErrors.concepto = 'El concepto es obligatorio';
    }

    if (!formData.unidad.trim()) {
      newErrors.unidad = 'La unidad es obligatoria';
    }

    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setApiError(null);

    try {
      // eslint-disable-next-line no-console
      console.log('📝 Creando cargo con datos:', formData);

      // Crear el cargo usando la API
      const newCharge = await cargosApi.create(formData);

      // eslint-disable-next-line no-console
      console.log('✅ Cargo creado exitosamente:', newCharge);

      // Redirigir de vuelta a la lista
      router.push('/cargos');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error al crear cargo:', error);
      setApiError(
        error instanceof Error
          ? error.message
          : 'Error desconocido al crear el cargo',
      );
    } finally {
      setSaving(false);
    }
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      administration: 'Administración',
      maintenance: 'Mantenimiento',
      service: 'Servicio',
      insurance: 'Seguro',
      other: 'Otro',
    };
    return typeMap[type] || type;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nuevo Cargo — Cuentas Claras</title>
      </Head>

      <Layout title='Nuevo Cargo'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <button
                  className='btn btn-link p-0 text-decoration-none'
                  onClick={() => router.push('/cargos')}
                >
                  Cargos
                </button>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Nuevo Cargo
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className='charges-header mb-4'>
            <h1 className='charges-title'>➕ Nuevo Cargo</h1>
            <p className='charges-subtitle'>
              Crea un nuevo cargo para una unidad
            </p>
          </div>

          {/* Formulario */}
          <div className='row'>
            <div className='col-lg-8'>
              <div className='card'>
                <div className='card-header'>
                  <h5 className='card-title mb-0'>Información del Cargo</h5>
                </div>
                <div className='card-body'>
                  {apiError && (
                    <div className='alert alert-danger' role='alert'>
                      <i className='material-icons me-2'>error</i>
                      {apiError}
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label htmlFor='concepto' className='form-label'>
                          Concepto <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control ${errors.concepto ? 'is-invalid' : ''}`}
                          id='concepto'
                          value={formData.concepto}
                          onChange={e =>
                            handleInputChange('concepto', e.target.value)
                          }
                          placeholder='Ej: Administración Febrero 2024'
                        />
                        {errors.concepto && (
                          <div className='invalid-feedback'>
                            {errors.concepto}
                          </div>
                        )}
                      </div>

                      <div className='col-md-6 mb-3'>
                        <label htmlFor='unidad' className='form-label'>
                          Unidad <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control ${errors.unidad ? 'is-invalid' : ''}`}
                          id='unidad'
                          value={formData.unidad}
                          onChange={e =>
                            handleInputChange('unidad', e.target.value)
                          }
                          placeholder='Ej: APT-101'
                        />
                        {errors.unidad && (
                          <div className='invalid-feedback'>{errors.unidad}</div>
                        )}
                      </div>

                      <div className='col-md-6 mb-3'>
                        <label htmlFor='tipo' className='form-label'>
                          Tipo
                        </label>
                        <select
                          className='form-select'
                          id='tipo'
                          value={formData.tipo}
                          onChange={e =>
                            handleInputChange('tipo', e.target.value)
                          }
                        >
                          <option value='administration'>Administración</option>
                          <option value='maintenance'>Mantenimiento</option>
                          <option value='service'>Servicio</option>
                          <option value='insurance'>Seguro</option>
                          <option value='other'>Otro</option>
                        </select>
                      </div>

                      <div className='col-md-6 mb-3'>
                        <label htmlFor='monto' className='form-label'>
                          Monto <span className='text-danger'>*</span>
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>$</span>
                          <input
                            type='number'
                            className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
                            id='monto'
                            value={formData.monto}
                            onChange={e =>
                              handleInputChange(
                                'monto',
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            min='0'
                            step='1000'
                          />
                          {errors.monto && (
                            <div className='invalid-feedback'>
                              {errors.monto}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='col-md-6 mb-3'>
                        <label htmlFor='fecha_vencimiento' className='form-label'>
                          Fecha de Vencimiento{' '}
                          <span className='text-danger'>*</span>
                        </label>
                        <input
                          type='date'
                          className={`form-control ${errors.fecha_vencimiento ? 'is-invalid' : ''}`}
                          id='fecha_vencimiento'
                          value={formData.fecha_vencimiento}
                          onChange={e =>
                            handleInputChange('fecha_vencimiento', e.target.value)
                          }
                        />
                        {errors.fecha_vencimiento && (
                          <div className='invalid-feedback'>
                            {errors.fecha_vencimiento}
                          </div>
                        )}
                      </div>

                      <div className='col-12 mb-3'>
                        <label htmlFor='descripcion' className='form-label'>
                          Descripción
                        </label>
                        <textarea
                          className='form-control'
                          id='descripcion'
                          rows={3}
                          value={formData.descripcion || ''}
                          onChange={e =>
                            handleInputChange('descripcion', e.target.value)
                          }
                          placeholder='Descripción adicional del cargo (opcional)'
                        />
                      </div>
                    </div>

                    <div className='d-flex gap-2'>
                      <button
                        type='submit'
                        className='btn btn-success'
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span
                              className='spinner-border spinner-border-sm me-2'
                              role='status'
                            >
                              <span className='visually-hidden'>
                                Creando...
                              </span>
                            </span>
                            Creando...
                          </>
                        ) : (
                          <>➕ Crear Cargo</>
                        )}
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline-secondary'
                        onClick={() => router.push('/cargos')}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Panel de ayuda */}
            <div className='col-lg-4'>
              <div className='card'>
                <div className='card-header'>
                  <h5 className='card-title mb-0'>💡 Ayuda</h5>
                </div>
                <div className='card-body'>
                  <h6>Tipos de Cargo:</h6>
                  <ul className='list-unstyled'>
                    <li>
                      <span className='charge-type administration'>
                        Administración
                      </span>{' '}
                      - Cuotas mensuales
                    </li>
                    <li>
                      <span className='charge-type maintenance'>
                        Mantenimiento
                      </span>{' '}
                      - Reparaciones
                    </li>
                    <li>
                      <span className='charge-type service'>Servicio</span> -
                      Servicios adicionales
                    </li>
                    <li>
                      <span className='charge-type insurance'>Seguro</span> -
                      Pólizas de seguro
                    </li>
                    <li>
                      <span className='charge-type other'>Otro</span> - Cargos
                      especiales
                    </li>
                  </ul>

                  <hr />

                  <h6>Estados:</h6>
                  <ul className='list-unstyled'>
                    <li>
                      <span className='status-badge pending'>Pendiente</span> -
                      Por aprobar
                    </li>
                    <li>
                      <span className='status-badge approved'>Aprobado</span> -
                      Listo para cobro
                    </li>
                    <li>
                      <span className='status-badge paid'>Pagado</span> -
                      Completamente pagado
                    </li>
                    <li>
                      <span className='status-badge partial'>Parcial</span> -
                      Pago parcial
                    </li>
                    <li>
                      <span className='status-badge rejected'>Rechazado</span> -
                      No aprobado
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
