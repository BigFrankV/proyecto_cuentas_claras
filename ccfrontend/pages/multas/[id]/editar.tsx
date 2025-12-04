import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/layout/Layout';
import api from '@/lib/api';
import multasService from '@/lib/multasService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { ProtectedPage, Permission } from '@/lib/usePermissions';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface Multa {
  id: number;
  numero: string;
  comunidad_id: number;
  comunidad_nombre: string;
  unidad_id: number;
  unidad_numero: string;
  torre_nombre?: string;
  edificio_nombre?: string;
  persona_id?: number;
  propietario_nombre?: string;
  propietario_email?: string;
  tipo_infraccion: string;
  motivo: string;
  descripcion?: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'apelada' | 'anulada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_infraccion: string;
  fecha: string;
  fecha_vencimiento: string;
  fecha_pago?: string;
  created_at: string;
  updated_at: string;
}

interface Unidad {
  id: number;
  numero: string;
  torre_nombre?: string;
  edificio_nombre?: string;
  comunidad_nombre?: string;
}

interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
}

interface FormData {
  unidad_id: number;
  persona_id: number | null;
  tipo_infraccion: string;
  descripcion: string;
  monto: string;
  fecha_infraccion: string;
  fecha_vencimiento: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
}

interface ValidationErrors {
  tipo_infraccion?: string;
  monto?: string;
  fecha_infraccion?: string;
  fecha_vencimiento?: string;
}

// ============================================
// CONSTANTES
// ============================================

const TIPOS_INFRACCION = [
  {
    value: 'Ruidos molestos fuera de horario',
    icon: 'volume_up',
    color: '#ff9800',
    descripcion: 'Ruidos que perturban la tranquilidad después de las 22:00',
  },
  {
    value: 'Mal uso de áreas comunes',
    icon: 'people',
    color: '#2196f3',
    descripcion: 'Uso inadecuado de espacios compartidos',
  },
  {
    value: 'Mascotas sin correa',
    icon: 'pets',
    color: '#4caf50',
    descripcion: 'Mascotas circulando sin correa en áreas comunes',
  },
  {
    value: 'Basura fuera del horario',
    icon: 'delete',
    color: '#f44336',
    descripcion: 'Depósito de basura fuera del horario establecido',
  },
  {
    value: 'Daño a la propiedad común',
    icon: 'warning',
    color: '#ff5722',
    descripcion: 'Daños causados a instalaciones compartidas',
  },
  {
    value: 'Incumplimiento de reglamento',
    icon: 'gavel',
    color: '#9c27b0',
    descripcion: 'Violación de normas del reglamento interno',
  },
  {
    value: 'Otro',
    icon: 'more_horiz',
    color: '#607d8b',
    descripcion: 'Otra infracción no especificada',
  },
];

const PRIORIDADES = [
  {
    value: 'baja' as const,
    label: 'Baja',
    icon: 'flag',
    color: '#4caf50',
    descripcion: 'Situación menor, no urgente',
  },
  {
    value: 'media' as const,
    label: 'Media',
    icon: 'flag',
    color: '#ff9800',
    descripcion: 'Requiere atención moderada',
  },
  {
    value: 'alta' as const,
    label: 'Alta',
    icon: 'flag',
    color: '#ff5722',
    descripcion: 'Situación importante, requiere pronta resolución',
  },
  {
    value: 'critica' as const,
    label: 'Crítica',
    icon: 'priority_high',
    color: '#f44336',
    descripcion: 'Situación grave, requiere acción inmediata',
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function EditarMulta() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Estados principales
  const [multa, setMulta] = useState<Multa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados de datos
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [searchUnidad, setSearchUnidad] = useState('');
  const [searchPersona, setSearchPersona] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    unidad_id: 0,
    persona_id: null,
    tipo_infraccion: '',
    descripcion: '',
    monto: '',
    fecha_infraccion: '',
    fecha_vencimiento: '',
    prioridad: 'media',
  });

  // Estados auxiliares que faltaban
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<Unidad | null>(
    null,
  );
  const [personaSeleccionada, setPersonaSeleccionada] =
    useState<Persona | null>(null);
  const [showUnidadModal, setShowUnidadModal] = useState<boolean>(false);
  const [showPersonaModal, setShowPersonaModal] = useState<boolean>(false);

  // Handler de cancelar / volver
  const handleCancel = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/multas');
    }
  };

  // ============================================
  // VALIDACIONES (validar sólo campos modificados)
  // ============================================
  const getChangedFields = (): Partial<FormData> => {
    if (!multa) {
      return {};
    }
    const changes: Partial<FormData> = {};
    if (Number(formData.unidad_id) !== Number(multa.unidad_id)) {
      changes.unidad_id = formData.unidad_id;
    }
    if ((formData.persona_id ?? null) !== (multa.persona_id ?? null)) {
      changes.persona_id = formData.persona_id ?? null;
    }
    if (
      (formData.tipo_infraccion ?? '') !==
      String(multa.tipo_infraccion ?? multa.motivo ?? '')
    ) {
      changes.tipo_infraccion = formData.tipo_infraccion;
    }
    if ((formData.descripcion ?? '') !== String(multa.descripcion ?? '')) {
      changes.descripcion = formData.descripcion;
    }
    if (String(formData.monto) !== String(multa.monto)) {
      changes.monto = formData.monto;
    }
    if (
      (formData.fecha_infraccion ?? '') !==
      String(multa.fecha_infraccion ?? multa.fecha ?? '')
    ) {
      changes.fecha_infraccion = formData.fecha_infraccion;
    }
    if (
      (formData.fecha_vencimiento ?? '') !==
      String(multa.fecha_vencimiento ?? '')
    ) {
      changes.fecha_vencimiento = formData.fecha_vencimiento;
    }
    if ((formData.prioridad ?? '') !== String(multa.prioridad ?? '')) {
      changes.prioridad = formData.prioridad;
    }
    return changes;
  };

  const validateChanges = (
    changes: Partial<FormData>,
  ): { valid: boolean; errors: ValidationErrors } => {
    const newErrors: ValidationErrors = {};

    if ('monto' in changes) {
      const montoNum = parseFloat(String(changes.monto ?? '0'));
      if (Number.isNaN(montoNum) || montoNum <= 0) {
        newErrors.monto = 'El monto debe ser mayor a 0';
      }
    }

    if ('fecha_infraccion' in changes && changes.fecha_infraccion) {
      const fechaInfraccion = new Date(String(changes.fecha_infraccion));
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaInfraccion > hoy) {
        newErrors.fecha_infraccion = 'La fecha no puede ser futura';
      }
    }

    if ('fecha_vencimiento' in changes && changes.fecha_vencimiento) {
      const fechaVenc = new Date(String(changes.fecha_vencimiento));
      const fechaInf = changes.fecha_infraccion
        ? new Date(String(changes.fecha_infraccion))
        : multa?.fecha_infraccion
          ? new Date(multa.fecha_infraccion)
          : null;
      if (fechaInf && fechaVenc <= fechaInf) {
        newErrors.fecha_vencimiento =
          'La fecha de vencimiento debe ser posterior a la fecha de infracción';
      }
    }

    return { valid: Object.keys(newErrors).length === 0, errors: newErrors };
  };
  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    if (id) {
      loadMulta();
      // loadUnidades ya se llamará automáticamente cuando loadMulta setee comunidadId
    }
  }, [id]);

  useEffect(() => {
    if (formData.unidad_id && formData.unidad_id !== multa?.unidad_id) {
      loadPersonasUnidad(formData.unidad_id);
    }
  }, [formData.unidad_id]);

  // Evitar acceso directo a `user` en SSR:
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const loadMulta = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line no-console
      console.log(`🔍 Cargando multa ${id}...`);

      const response = await multasService.getMulta(Number(id));

      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.log('✅ Multa cargada:', response);
      setMulta(response);

      // Determinar comunidadId desde la propia multa (evita depender de `user` en SSR)
      setComunidadId(
        response?.comunidad_id ? Number(response.comunidad_id) : null,
      );

      // Verificar si se puede editar
      if (['pagado', 'anulada'].includes(response.estado)) {
        toast.error('Esta multa no se puede editar');
        setTimeout(() => router.push(`/multas/${id}`), 2000);
        return;
      }

      // Precargar formulario
      setFormData({
        unidad_id: response.unidad_id,
        persona_id: response.persona_id || null,
        tipo_infraccion: response.tipo_infraccion || response.motivo,
        descripcion: response.descripcion || '',
        monto: response.monto.toString(),
        fecha_infraccion: response.fecha_infraccion || response.fecha,
        fecha_vencimiento: response.fecha_vencimiento,
        prioridad: response.prioridad,
      });

      // Cargar unidad seleccionada
      setUnidadSeleccionada({
        id: response.unidad_id,
        numero: response.unidad_numero,
        torre_nombre: response.torre_nombre,
        edificio_nombre: response.edificio_nombre,
        comunidad_nombre: response.comunidad_nombre,
      });

      // Cargar persona si existe
      if (response.persona_id && response.propietario_nombre) {
        setPersonaSeleccionada({
          id: response.persona_id,
          nombres: response.propietario_nombre.split(' ')[0] || '',
          apellidos:
            response.propietario_nombre.split(' ').slice(1).join(' ') || '',
          email: response.propietario_email || '',
        });
      }

      // Cargar personas de la unidad
      await loadPersonasUnidad(response.unidad_id);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('❌ Error cargando multa:', error);
      toast.error(error.message || 'Error al cargar la multa');
      setTimeout(() => router.push('/multas'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadUnidades = async (cid?: number | null) => {
    const idToUse = cid ?? comunidadId;
    if (!idToUse) {
      setUnidades([]);
      return;
    }
    const res = await api.get(`/unidades/comunidad/${idToUse}`);
    setUnidades(res.data?.data ?? res.data ?? []);
  };

  const loadPersonasUnidad = async unidadId => {
    if (!unidadId) {
      return setPersonas([]);
    }
    const res = await api.get(`/unidades/${unidadId}/residentes`);
    setPersonas(res.data?.data ?? res.data ?? []);
  };

  // cargar unidades cuando comunidadId esté disponible (se setea desde la multa)
  useEffect(() => {
    if (comunidadId) {
      loadUnidades(comunidadId);
    } else {
      setUnidades([]);
    }
  }, [comunidadId]);

  // ============================================
  // VALIDACIONES
  // ============================================

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.tipo_infraccion) {
      newErrors.tipo_infraccion = 'El tipo de infracción es requerido';
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    // Fechas opcionales: validar sólo si se ingresan
    if (formData.fecha_infraccion) {
      const fechaInfraccion = new Date(formData.fecha_infraccion);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaInfraccion > hoy) {
        newErrors.fecha_infraccion = 'La fecha no puede ser futura';
      }
    }

    if (formData.fecha_vencimiento) {
      if (formData.fecha_infraccion) {
        const fechaInfraccion = new Date(formData.fecha_infraccion);
        const fechaVencimiento = new Date(formData.fecha_vencimiento);
        if (fechaVencimiento <= fechaInfraccion) {
          newErrors.fecha_vencimiento =
            'Debe ser posterior a la fecha de infracción';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // MANEJO DEL FORMULARIO
  // ============================================

  const handleSelectUnidad = (unidad: Unidad) => {
    setFormData(prev => ({
      ...prev,
      unidad_id: unidad.id,
      persona_id: null,
    }));
    setUnidadSeleccionada(unidad);
    setPersonaSeleccionada(null);
    setShowUnidadModal(false);
  };

  const handleSelectPersona = (persona: Persona) => {
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    setPersonaSeleccionada(persona);
    setShowPersonaModal(false);
  };

  const handleSelectTipoInfraccion = (tipo: string) => {
    setFormData(prev => ({ ...prev, tipo_infraccion: tipo }));

    // Si es "Otro", no establecer descripción por defecto
    if (tipo !== 'Otro') {
      const tipoObj = TIPOS_INFRACCION.find(t => t.value === tipo);
      if (tipoObj && !formData.descripcion) {
        setFormData(prev => ({ ...prev, descripcion: tipoObj.descripcion }));
      }
    }

    // Limpiar error
    if (errors.tipo_infraccion) {
      setErrors(prev => ({ ...prev, tipo_infraccion: undefined }));
    }
  };

  const handleSelectPrioridad = (prioridad: FormData['prioridad']) => {
    setFormData(prev => ({ ...prev, prioridad }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ============================================
  // SUBMIT (enviar sólo campos cambiados)
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!multa) {
      toast.error('Multa no cargada');
      return;
    }

    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      toast('No hay cambios para guardar', { icon: 'ℹ️' });
      return;
    }

    const { valid, errors: validationErrors } = validateChanges(changes);
    setErrors(validationErrors);
    if (!valid) {
      toast.error('Corrige los campos marcados');
      return;
    }

    setSaving(true);
    try {
      const payload: any = { ...changes };
      if ('monto' in payload) {
        payload.monto = parseFloat(String(payload.monto));
      }

      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.log('📝 Actualizando multa (solo campos modificados):', payload);

      const response = await multasService.updateMulta(Number(id), payload);

      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.log('✅ Multa actualizada:', response);
      toast.success('Multa actualizada exitosamente');

      router.push(`/multas/${id}`);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('❌ Error actualizando multa:', error);
      toast.error(error.message || 'Error al actualizar la multa');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // FILTROS DE BÚSQUEDA
  // ============================================

  const unidadesFiltradas = (unidades || []).filter((u: any) => {
    const search = String(searchUnidad || '')
      .toLowerCase()
      .trim();
    const numero = String(u?.numero ?? '').toLowerCase();
    const torre = String(u?.torre_nombre ?? '').toLowerCase();
    const edificio = String(u?.edificio_nombre ?? '').toLowerCase();

    return (
      numero.includes(search) ||
      torre.includes(search) ||
      edificio.includes(search)
    );
  });

  const personasFiltradas = (personas || []).filter((p: any) => {
    const search = String(searchPersona || '')
      .toLowerCase()
      .trim();
    const nombres = String(p?.nombres ?? '').toLowerCase();
    const apellidos = String(p?.apellidos ?? '').toLowerCase();
    const email = String(p?.email ?? '').toLowerCase();

    return (
      nombres.includes(search) ||
      apellidos.includes(search) ||
      email.includes(search)
    );
  });

  // ============================================
  // RENDER - LOADING
  // ============================================

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div className='container-fluid p-4'>
            <div className='text-center py-5'>
              <div
                className='spinner-border text-primary'
                role='status'
                style={{ width: '3rem', height: '3rem' }}
              >
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-3 text-muted'>Cargando multa...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!multa) {
    return (
      <ProtectedRoute>
        <Layout title='Multa no encontrada'>
          <div className='container-fluid p-4'>
            <div className='text-center py-5'>
              <i
                className='material-icons text-muted'
                style={{ fontSize: '64px' }}
              >
                error_outline
              </i>
              <h3 className='mt-3'>Multa no encontrada</h3>
              <button
                className='btn btn-primary mt-3'
                onClick={() => router.push('/multas')}
              >
                <i className='material-icons me-2'>arrow_back</i>
                Volver al listado
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // ============================================
  // RENDER - FORMULARIO
  // ============================================

  return (
    <ProtectedRoute>
      <ProtectedPage permission={Permission.EDIT_MULTA}>
      <Head>
        <title>Editar Multa {multa.numero} — Cuentas Claras</title>
      </Head>

      <Layout title={`Editar Multa ${multa.numero}`}>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h3 mb-1'>Editar Multa {multa.numero}</h1>
              <p className='text-muted mb-0'>
                Modifica los detalles de la multa
              </p>
            </div>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={handleCancel}
                disabled={saving}
              >
                <i className='material-icons me-2'>close</i>
                Cancelar
              </button>
            </div>
          </div>

          {/* Alerta de estado */}
          {multa.estado === 'vencido' && (
            <div className='alert alert-warning mb-4'>
              <i className='material-icons me-2'>warning</i>
              <strong>Multa vencida:</strong> Los cambios no afectarán el estado
              de vencimiento.
            </div>
          )}

          {multa.estado === 'apelada' && (
            <div className='alert alert-info mb-4'>
              <i className='material-icons me-2'>gavel</i>
              <strong>Multa apelada:</strong> Existe una apelación pendiente
              para esta multa.
            </div>
          )}

          <div className='row'>
            <div className='col-lg-8'>
              <form onSubmit={handleSubmit}>
                {/* Unidad */}
                <div className='card mb-4'>
                  <div className='card-header bg-white'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>apartment</i>
                      Unidad
                    </h5>
                  </div>
                  <div className='card-body'>
                    {unidadSeleccionada && (
                      <div className='selected-item'>
                        <div className='selected-info'>
                          <i className='material-icons'>apartment</i>
                          <div>
                            <strong>Unidad {unidadSeleccionada.numero}</strong>
                            {unidadSeleccionada.torre_nombre && (
                              <div className='text-muted small'>
                                Torre {unidadSeleccionada.torre_nombre}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type='button'
                          className='btn btn-sm btn-outline-primary'
                          onClick={() => setShowUnidadModal(true)}
                        >
                          <i className='material-icons'>edit</i>
                        </button>
                      </div>
                    )}

                    {/* Persona responsable */}
                    <div className='mt-3'>
                      <label className='form-label'>
                        <i className='material-icons me-2'>person</i>
                        Persona Responsable (Opcional)
                      </label>

                      {personaSeleccionada ? (
                        <div className='selected-item'>
                          <div className='selected-info'>
                            <i className='material-icons'>person</i>
                            <div>
                              <strong>
                                {personaSeleccionada.nombres}{' '}
                                {personaSeleccionada.apellidos}
                              </strong>
                              <div className='text-muted small'>
                                {personaSeleccionada.email}
                              </div>
                            </div>
                          </div>
                          <div className='d-flex gap-2'>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-primary'
                              onClick={() => setShowPersonaModal(true)}
                            >
                              <i className='material-icons'>edit</i>
                            </button>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-danger'
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  persona_id: null,
                                }));
                                setPersonaSeleccionada(null);
                              }}
                            >
                              <i className='material-icons'>close</i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type='button'
                          className='btn btn-outline-secondary w-100'
                          onClick={() => setShowPersonaModal(true)}
                        >
                          <i className='material-icons me-2'>add</i>
                          Seleccionar Persona
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tipo de Infracción */}
                <div className='card mb-4'>
                  <div className='card-header bg-white'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>warning</i>
                      Tipo de Infracción
                    </h5>
                  </div>
                  <div className='card-body'>
                    <div className='infraction-grid mb-3'>
                      {TIPOS_INFRACCION.map(tipo => (
                        <div
                          key={tipo.value}
                          className={`infraction-card ${
                            formData.tipo_infraccion === tipo.value
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => handleSelectTipoInfraccion(tipo.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectTipoInfraccion(tipo.value);
                            }
                          }}
                          role='button'
                          tabIndex={0}
                        >
                          <div
                            className='infraction-icon'
                            style={{ color: tipo.color }}
                          >
                            <i className='material-icons'>{tipo.icon}</i>
                          </div>
                          <div className='infraction-title'>{tipo.value}</div>
                          {formData.tipo_infraccion === tipo.value && (
                            <div className='infraction-check'>
                              <i className='material-icons'>check_circle</i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {errors.tipo_infraccion && (
                      <div className='alert alert-danger'>
                        <i className='material-icons me-2'>error</i>
                        {errors.tipo_infraccion}
                      </div>
                    )}

                    <div>
                      <label htmlFor='descripcion' className='form-label'>
                        Descripción adicional (Opcional)
                      </label>
                      <textarea
                        id='descripcion'
                        className='form-control'
                        rows={4}
                        value={formData.descripcion}
                        onChange={e =>
                          handleInputChange('descripcion', e.target.value)
                        }
                        placeholder='Agrega detalles adicionales sobre la infracción...'
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className='card mb-4'>
                  <div className='card-header bg-white'>
                    <h5 className='mb-0'>
                      <i className='material-icons me-2'>edit</i>
                      Detalles
                    </h5>
                  </div>
                  <div className='card-body'>
                    {/* Monto */}
                    <div className='mb-4'>
                      <label htmlFor='monto' className='form-label'>
                        Monto de la Multa *
                      </label>
                      <div className='input-group input-group-lg'>
                        <span className='input-group-text'>$</span>
                        <input
                          type='number'
                          id='monto'
                          className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
                          value={formData.monto}
                          onChange={e =>
                            handleInputChange('monto', e.target.value)
                          }
                          placeholder='0'
                          step='0.01'
                          min='0'
                        />
                      </div>
                      {errors.monto && (
                        <div className='invalid-feedback d-block'>
                          {errors.monto}
                        </div>
                      )}
                    </div>

                    {/* Prioridad */}
                    <div className='mb-4'>
                      <label className='form-label'>Prioridad *</label>
                      <div className='priority-grid'>
                        {PRIORIDADES.map(prioridad => (
                          <div
                            key={prioridad.value}
                            className={`priority-card ${
                              formData.prioridad === prioridad.value
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleSelectPrioridad(prioridad.value)
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectPrioridad(prioridad.value);
                              }
                            }}
                            role='button'
                            tabIndex={0}
                            style={{ borderColor: prioridad.color }}
                          >
                            <div
                              className='priority-icon'
                              style={{ color: prioridad.color }}
                            >
                              <i className='material-icons'>{prioridad.icon}</i>
                            </div>
                            <div className='priority-label'>
                              {prioridad.label}
                            </div>
                            {formData.prioridad === prioridad.value && (
                              <div
                                className='priority-check'
                                style={{ color: prioridad.color }}
                              >
                                <i className='material-icons'>check_circle</i>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label
                          htmlFor='fecha_infraccion'
                          className='form-label'
                        >
                          Fecha de Infracción *
                        </label>
                        <input
                          type='date'
                          id='fecha_infraccion'
                          className={`form-control ${errors.fecha_infraccion ? 'is-invalid' : ''}`}
                          value={formData.fecha_infraccion}
                          onChange={e =>
                            handleInputChange(
                              'fecha_infraccion',
                              e.target.value,
                            )
                          }
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {errors.fecha_infraccion && (
                          <div className='invalid-feedback'>
                            {errors.fecha_infraccion}
                          </div>
                        )}
                      </div>

                      <div className='col-md-6 mb-3'>
                        <label
                          htmlFor='fecha_vencimiento'
                          className='form-label'
                        >
                          Fecha de Vencimiento *
                        </label>
                        <input
                          type='date'
                          id='fecha_vencimiento'
                          className={`form-control ${errors.fecha_vencimiento ? 'is-invalid' : ''}`}
                          value={formData.fecha_vencimiento}
                          onChange={e =>
                            handleInputChange(
                              'fecha_vencimiento',
                              e.target.value,
                            )
                          }
                          min={formData.fecha_infraccion}
                        />
                        {errors.fecha_vencimiento && (
                          <div className='invalid-feedback'>
                            {errors.fecha_vencimiento}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='d-flex justify-content-end gap-2'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <i className='material-icons me-2'>close</i>
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2'></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className='material-icons me-2'>save</i>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className='col-lg-4'>
              <div className='card sticky-top' style={{ top: '1rem' }}>
                <div className='card-header bg-white'>
                  <h6 className='mb-0'>
                    <i className='material-icons me-2'>info</i>
                    Información Original
                  </h6>
                </div>
                <div className='card-body'>
                  <div className='d-flex flex-column gap-3'>
                    <div>
                      <div className='text-muted small mb-1'>Número</div>
                      <div className='fw-bold'>{multa.numero}</div>
                    </div>

                    <div>
                      <div className='text-muted small mb-1'>Estado</div>
                      <span className={`badge badge-${multa.estado}`}>
                        {multa.estado}
                      </span>
                    </div>

                    <div>
                      <div className='text-muted small mb-1'>Creada</div>
                      <div>
                        {new Date(multa.created_at).toLocaleString('es-CL')}
                      </div>
                    </div>

                    <div>
                      <div className='text-muted small mb-1'>
                        Última actualización
                      </div>
                      <div>
                        {new Date(multa.updated_at).toLocaleString('es-CL')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODALES */}

        {/* Modal: Cambiar Unidad */}
        {showUnidadModal && (
          <div
            className='modal show d-block'
            tabIndex={-1}
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog modal-dialog-centered modal-lg'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    <i className='material-icons me-2'>apartment</i>
                    Cambiar Unidad
                  </h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowUnidadModal(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  <div className='search-box mb-3'>
                    <i className='material-icons'>search</i>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar unidad...'
                      value={searchUnidad}
                      onChange={e => setSearchUnidad(e.target.value)}
                    />
                  </div>

                  <div className='items-grid'>
                    {unidadesFiltradas.map(unidad => (
                      <div
                        key={unidad.id}
                        className='selectable-card'
                        onClick={() => handleSelectUnidad(unidad)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectUnidad(unidad);
                          }
                        }}
                        role='button'
                        tabIndex={0}
                      >
                        <div className='card-icon'>
                          <i className='material-icons'>apartment</i>
                        </div>
                        <div className='card-content'>
                          <div className='card-title'>
                            Unidad {unidad.numero}
                          </div>
                          {unidad.torre_nombre && (
                            <div className='card-subtitle'>
                              Torre {unidad.torre_nombre}
                            </div>
                          )}
                        </div>
                        <i className='material-icons card-arrow'>
                          chevron_right
                        </i>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Cambiar Persona */}
        {showPersonaModal && (
          <div
            className='modal show d-block'
            tabIndex={-1}
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog modal-dialog-centered'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>
                    <i className='material-icons me-2'>person</i>
                    Seleccionar Persona
                  </h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowPersonaModal(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  <div className='search-box mb-3'>
                    <i className='material-icons'>search</i>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar persona...'
                      value={searchPersona}
                      onChange={e => setSearchPersona(e.target.value)}
                    />
                  </div>

                  <div className='items-list'>
                    {personasFiltradas.length === 0 ? (
                      <div className='text-center py-3 text-muted'>
                        No se encontraron personas
                      </div>
                    ) : (
                      personasFiltradas.map(persona => (
                        <div
                          key={persona.id}
                          className='list-item'
                          onClick={() => handleSelectPersona(persona)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectPersona(persona);
                            }
                          }}
                          role='button'
                          tabIndex={0}
                        >
                          <i className='material-icons'>person</i>
                          <div className='list-item-content'>
                            <div className='list-item-title'>
                              {persona.nombres} {persona.apellidos}
                            </div>
                            <div className='list-item-subtitle'>
                              {persona.email}
                            </div>
                          </div>
                          <i className='material-icons'>chevron_right</i>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .selected-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f8f9fa;
            border: 2px solid #007bff;
            border-radius: 8px;
          }

          .selected-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .selected-info i {
            color: #007bff;
          }

          .infraction-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }

          .infraction-card {
            position: relative;
            padding: 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
          }

          .infraction-card:hover {
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .infraction-card.selected {
            border-color: #007bff;
            background: #f8f9fa;
          }

          .infraction-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .infraction-title {
            font-size: 0.75rem;
            font-weight: 600;
          }

          .infraction-check {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            color: #007bff;
          }

          .priority-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1rem;
          }

          .priority-card {
            position: relative;
            padding: 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
          }

          .priority-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .priority-card.selected {
            background: #f8f9fa;
          }

          .priority-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .priority-label {
            font-weight: 600;
          }

          .priority-check {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
          }

          .search-box {
            position: relative;
          }

          .search-box i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
          }

          .search-box input {
            padding-left: 40px;
          }

          .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            max-height: 400px;
            overflow-y: auto;
          }

          .selectable-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .selectable-card:hover {
            border-color: #007bff;
            background: #f8f9fa;
            transform: translateY(-2px);
          }

          .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: #e7f3ff;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #007bff;
          }

          .card-content {
            flex: 1;
          }

          .card-title {
            font-weight: 600;
          }

          .card-subtitle {
            font-size: 0.875rem;
            color: #6c757d;
          }

          .card-arrow {
            color: #6c757d;
          }

          .items-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #e9ecef;
            border-radius: 8px;
          }

          .list-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid #e9ecef;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .list-item:last-child {
            border-bottom: none;
          }

          .list-item:hover {
            background: #f8f9fa;
          }

          .list-item-content {
            flex: 1;
          }

          .list-item-title {
            font-weight: 500;
          }

          .list-item-subtitle {
            font-size: 0.875rem;
            color: #6c757d;
          }

          .badge-pendiente {
            background: #fff3cd;
            color: #856404;
          }

          .badge-pagado {
            background: #d4edda;
            color: #155724;
          }

          .badge-vencido {
            background: #f8d7da;
            color: #721c24;
          }

          .badge-apelada {
            background: #d1ecf1;
            color: #0c5460;
          }

          .badge-anulada {
            background: #e2e3e5;
            color: #383d41;
          }
        `}</style>
      </Layout>
    </ProtectedPage>
  </ProtectedRoute>
  );
}
