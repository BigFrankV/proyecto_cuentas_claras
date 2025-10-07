import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import multasService from '@/lib/multasService';
import { toast } from 'react-hot-toast';

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
  propietario_telefono?: string;
  tipo_infraccion: string;
  motivo: string; // Alias de tipo_infraccion
  descripcion?: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'apelada' | 'anulada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_infraccion: string;
  fecha: string; // Alias de fecha_infraccion
  fecha_vencimiento: string;
  fecha_pago?: string;
  fecha_anulacion?: string;
  motivo_anulacion?: string;
  anulado_por?: number;
  anulado_por_username?: string;
  created_at: string;
  updated_at: string;
}

interface HistorialItem {
  id: number;
  multa_id: number;
  usuario_id: number;
  username: string;
  usuario_nombre?: string;
  accion: string;
  estado_anterior?: string;
  estado_nuevo?: string;
  campo_modificado?: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  descripcion?: string;
  ip_address?: string;
  fecha: string;
}

interface Apelacion {
  id: number;
  multa_id: number;
  usuario_id: number;
  motivo: string;
  documentos_json?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuesta?: string;
  respondido_por?: number;
  fecha_respuesta?: string;
  created_at: string;
}

// ============================================
// CONSTANTES
// ============================================

const ESTADO_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    color: '#ffc107',
    bgColor: '#fff3cd',
    icon: 'schedule',
    textColor: '#856404'
  },
  pagado: {
    label: 'Pagado',
    color: '#28a745',
    bgColor: '#d4edda',
    icon: 'check_circle',
    textColor: '#155724'
  },
  vencido: {
    label: 'Vencido',
    color: '#dc3545',
    bgColor: '#f8d7da',
    icon: 'error',
    textColor: '#721c24'
  },
  apelada: {
    label: 'Apelada',
    color: '#17a2b8',
    bgColor: '#d1ecf1',
    icon: 'gavel',
    textColor: '#0c5460'
  },
  anulada: {
    label: 'Anulada',
    color: '#6c757d',
    bgColor: '#e2e3e5',
    icon: 'block',
    textColor: '#383d41'
  }
};

const PRIORIDAD_CONFIG = {
  baja: {
    label: 'Baja',
    color: '#28a745',
    icon: 'flag',
    textColor: '#fff'
  },
  media: {
    label: 'Media',
    color: '#ffc107',
    icon: 'flag',
    textColor: '#212529'
  },
  alta: {
    label: 'Alta',
    color: '#ff5722',
    icon: 'flag',
    textColor: '#fff'
  },
  critica: {
    label: 'Crítica',
    color: '#dc3545',
    icon: 'priority_high',
    textColor: '#fff'
  }
};

const ACCION_LABELS: Record<string, string> = {
  creada: 'Multa creada',
  editada: 'Multa editada',
  pago_registrado: 'Pago registrado',
  anulada: 'Multa anulada',
  apelada: 'Apelación presentada',
  apelacion_aprobada: 'Apelación aprobada',
  apelacion_rechazada: 'Apelación rechazada',
  eliminada: 'Multa eliminada'
};

const ACCION_ICONS: Record<string, string> = {
  creada: 'add_circle',
  editada: 'edit',
  pago_registrado: 'payment',
  anulada: 'block',
  apelada: 'gavel',
  apelacion_aprobada: 'thumb_up',
  apelacion_rechazada: 'thumb_down',
  eliminada: 'delete'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MultaDetalle() {
  const router = useRouter();
  const { id } = router.query;

  // Estados principales
  const [multa, setMulta] = useState<Multa | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'historial'>('info');

  // Estados de modales
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [showApelacionModal, setShowApelacionModal] = useState(false);

  // Estados de formularios
  const [pagoData, setPagoData] = useState({
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: '',
    referencia: ''
  });

  const [anularData, setAnularData] = useState({
    motivo_anulacion: ''
  });

  const [apelacionData, setApelacionData] = useState({
    motivo: '',
    documentos_json: []
  });

  // Estados de acciones
  const [procesando, setProcesando] = useState(false);

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    if (id) {
      loadMulta();
      loadHistorial();
    }
  }, [id]);

  // ============================================
  // FUNCIONES DE CARGA
  // ============================================

  const loadMulta = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await multasService.getMulta(Number(id));
      // multasService ya devuelve la multa adaptada (fecha y fecha_infraccion sincronizadas)
      setMulta(data);
    } catch (err) {
      console.error('Error cargando multa', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorial = async () => {
    try {
      console.log(`📜 Cargando historial de multa ${id}...`);

      const rows = await multasService.obtenerHistorial(Number(id));
      console.log('✅ Historial cargado:', rows);
      setHistorial(Array.isArray(rows) ? rows : (rows?.data ?? []));

    } catch (error: any) {
      console.error('❌ Error cargando historial:', error);
      // No mostrar error al usuario, el historial es opcional
    }
  };

  // ============================================
  // ACCIONES
  // ============================================

  const handleRegistrarPago = async () => {
    if (!pagoData.fecha_pago) {
      toast.error('La fecha de pago es requerida');
      return;
    }

    setProcesando(true);

    try {
      console.log('💰 Registrando pago:', pagoData);

      await multasService.registrarPago(Number(id), pagoData);

      toast.success('Pago registrado exitosamente');

      setShowPagoModal(false);
      setPagoData({
        fecha_pago: new Date().toISOString().split('T')[0],
        metodo_pago: '',
        referencia: ''
      });

      // Recargar datos
      await loadMulta();
      await loadHistorial();

    } catch (error: any) {
      console.error('❌ Error registrando pago:', error);
      toast.error(error.message || 'Error al registrar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const handleAnular = async () => {
    if (!anularData.motivo_anulacion || anularData.motivo_anulacion.length < 10) {
      toast.error('El motivo de anulación debe tener al menos 10 caracteres');
      return;
    }

    setProcesando(true);

    try {
      console.log('🚫 Anulando multa:', anularData);

      await multasService.anularMulta(Number(id), anularData);

      toast.success('Multa anulada exitosamente');

      setShowAnularModal(false);
      setAnularData({ motivo_anulacion: '' });

      // Recargar datos
      await loadMulta();
      await loadHistorial();

    } catch (error: any) {
      console.error('❌ Error anulando multa:', error);
      toast.error(error.message || 'Error al anular la multa');
    } finally {
      setProcesando(false);
    }
  };

  const handleCrearApelacion = async () => {
    if (!apelacionData.motivo || apelacionData.motivo.length < 20) {
      toast.error('El motivo de apelación debe tener al menos 20 caracteres');
      return;
    }

    setProcesando(true);

    try {
      console.log('⚖️ Creando apelación:', apelacionData);

      await multasService.crearApelacion(Number(id), apelacionData);

      toast.success('Apelación creada exitosamente');

      setShowApelacionModal(false);
      setApelacionData({ motivo: '', documentos_json: [] });

      // Recargar datos
      await loadMulta();
      await loadHistorial();

    } catch (error: any) {
      console.error('❌ Error creando apelación:', error);
      toast.error(error.message || 'Error al crear la apelación');
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar esta multa? Esta acción no se puede deshacer.')) {
      return;
    }

    setProcesando(true);

    try {
      console.log('🗑️ Eliminando multa...');

      await multasService.eliminarMulta(Number(id));

      toast.success('Multa eliminada exitosamente');

      // Redirigir al listado
      setTimeout(() => router.push('/multas'), 1500);

    } catch (error: any) {
      console.error('❌ Error eliminando multa:', error);
      toast.error(error.message || 'Error al eliminar la multa');
    } finally {
      setProcesando(false);
    }
  };

  const handleEditar = () => {
    router.push(`/multas/${id}/editar`);
  };

  const handleVolver = () => {
    router.push('/multas');
  };

  // ============================================
  // HELPERS
  // ============================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiasVencimiento = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ============================================
  // RENDER - LOADING
  // ============================================

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="container-fluid p-4">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Cargando multa...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!multa) {
    return (
      <ProtectedRoute>
        <Layout title="Multa no encontrada">
          <div className="container-fluid p-4">
            <div className="text-center py-5">
              <i className="material-icons text-muted" style={{ fontSize: '64px' }}>error_outline</i>
              <h3 className="mt-3">Multa no encontrada</h3>
              <p className="text-muted">La multa que buscas no existe o no tienes permisos para verla.</p>
              <button className="btn btn-primary mt-3" onClick={handleVolver}>
                <i className="material-icons me-2">arrow_back</i>
                Volver al listado
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // ============================================
  // RENDER - DATOS DE LA MULTA
  // ============================================

  const estadoConfig = ESTADO_CONFIG[multa.estado];
  const prioridadConfig = PRIORIDAD_CONFIG[multa.prioridad];
  const diasVencimiento = getDiasVencimiento(multa.fecha_vencimiento);

  // Permisos de acciones según estado
  const puedePagar = ['pendiente', 'vencido'].includes(multa.estado);
  const puedeAnular = !['pagado', 'anulada'].includes(multa.estado);
  const puedeEditar = !['pagado', 'anulada'].includes(multa.estado);
  const puedeApelar = !['pagado', 'anulada', 'apelada'].includes(multa.estado);
  const puedeEliminar = multa.estado !== 'pagado';

  return (
    <ProtectedRoute>
      <Head>
        <title>Multa {multa.numero} — Cuentas Claras</title>
      </Head>

      <Layout title={`Multa ${multa.numero}`}>
        <div className="container-fluid p-4">

          {/* Header */}
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h3 mb-0">Multa {multa.numero}</h1>
                <span
                  className="badge d-inline-flex align-items-center gap-1"
                  style={{
                    background: estadoConfig.bgColor,
                    color: estadoConfig.textColor,
                    border: `2px solid ${estadoConfig.color}`
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '18px' }}>
                    {estadoConfig.icon}
                  </i>
                  {estadoConfig.label}
                </span>
                <span
                  className="badge d-inline-flex align-items-center gap-1"
                  style={{
                    background: prioridadConfig.color,
                    color: prioridadConfig.textColor
                  }}
                >
                  <i className="material-icons" style={{ fontSize: '18px' }}>
                    {prioridadConfig.icon}
                  </i>
                  {prioridadConfig.label}
                </span>
              </div>
              <p className="text-muted mb-0">
                {multa.comunidad_nombre}
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {puedePagar && (
                <button
                  className="btn btn-success"
                  onClick={() => setShowPagoModal(true)}
                  disabled={procesando}
                >
                  <i className="material-icons me-2">payment</i>
                  Registrar Pago
                </button>
              )}

              {puedeEditar && (
                <button
                  className="btn btn-primary"
                  onClick={handleEditar}
                  disabled={procesando}
                >
                  <i className="material-icons me-2">edit</i>
                  Editar
                </button>
              )}

              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  disabled={procesando}
                >
                  <i className="material-icons me-2">more_vert</i>
                  Más acciones
                </button>
                <ul className="dropdown-menu">
                  {puedeApelar && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setShowApelacionModal(true)}
                      >
                        <i className="material-icons me-2">gavel</i>
                        Crear Apelación
                      </button>
                    </li>
                  )}
                  {puedeAnular && (
                    <li>
                      <button
                        className="dropdown-item text-warning"
                        onClick={() => setShowAnularModal(true)}
                      >
                        <i className="material-icons me-2">block</i>
                        Anular Multa
                      </button>
                    </li>
                  )}
                  {puedeEliminar && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={handleEliminar}
                        >
                          <i className="material-icons me-2">delete</i>
                          Eliminar Multa
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <button
                className="btn btn-secondary"
                onClick={handleVolver}
                disabled={procesando}
              >
                <i className="material-icons me-2">arrow_back</i>
                Volver
              </button>
            </div>
          </div>

          {/* Alert de vencimiento */}
          {multa.estado === 'pendiente' && diasVencimiento <= 7 && diasVencimiento > 0 && (
            <div className="alert alert-warning d-flex align-items-center mb-4">
              <i className="material-icons me-3">warning</i>
              <div>
                <strong>¡Atención!</strong> Esta multa vence en {diasVencimiento} {diasVencimiento === 1 ? 'día' : 'días'}.
              </div>
            </div>
          )}

          {multa.estado === 'vencido' && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="material-icons me-3">error</i>
              <div>
                <strong>¡Multa vencida!</strong> Esta multa venció el {formatDate(multa.fecha_vencimiento)}.
              </div>
            </div>
          )}

          {multa.estado === 'anulada' && (
            <div className="alert alert-secondary d-flex align-items-start mb-4">
              <i className="material-icons me-3">block</i>
              <div>
                <strong>Multa anulada</strong>
                {multa.motivo_anulacion && (
                  <div className="mt-2 small">
                    <strong>Motivo:</strong> {multa.motivo_anulacion}
                  </div>
                )}
                {multa.anulado_por_username && (
                  <div className="small text-muted">
                    Anulada por: {multa.anulado_por_username} el {formatDate(multa.fecha_anulacion!)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <i className="material-icons me-2">info</i>
                Información
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'historial' ? 'active' : ''}`}
                onClick={() => setActiveTab('historial')}
              >
                <i className="material-icons me-2">history</i>
                Historial
                {historial.length > 0 && (
                  <span className="badge bg-secondary ms-2">{historial.length}</span>
                )}
              </button>
            </li>
          </ul>

          {/* Contenido de tabs */}
          <div className="row">

            {/* Tab: Información */}
            {activeTab === 'info' && (
              <>
                {/* Columna principal */}
                <div className="col-lg-8">

                  {/* Detalles de la multa */}
                  <div className="card mb-4">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="material-icons me-2">description</i>
                        Detalles de la Multa
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">

                        {/* Tipo de infracción */}
                        <div className="col-md-12">
                          <label className="form-label text-muted small">Tipo de Infracción</label>
                          <div className="d-flex align-items-center gap-2">
                            <i className="material-icons text-warning">warning</i>
                            <strong className="fs-5">{multa.tipo_infraccion || multa.motivo}</strong>
                          </div>
                        </div>

                        {/* Descripción */}
                        {multa.descripcion && (
                          <div className="col-md-12">
                            <label className="form-label text-muted small">Descripción</label>
                            <p className="mb-0">{multa.descripcion}</p>
                          </div>
                        )}

                        {/* Monto */}
                        <div className="col-md-6">
                          <label className="form-label text-muted small">Monto</label>
                          <div className="d-flex align-items-center gap-2">
                            <i className="material-icons text-success">payments</i>
                            <strong className="fs-4 text-success">
                              {formatCurrency(multa.monto)}
                            </strong>
                          </div>
                        </div>

                        {/* Prioridad */}
                        <div className="col-md-6">
                          <label className="form-label text-muted small">Prioridad</label>
                          <div>
                            <span
                              className="badge d-inline-flex align-items-center gap-1 fs-6"
                              style={{
                                background: prioridadConfig.color,
                                color: prioridadConfig.textColor
                              }}
                            >
                              <i className="material-icons" style={{ fontSize: '20px' }}>
                                {prioridadConfig.icon}
                              </i>
                              {prioridadConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* Fecha de infracción */}
                        <div className="col-md-6">
                          <label className="form-label text-muted small">Fecha de Infracción</label>
                          <div className="d-flex align-items-center gap-2">
                            <i className="material-icons text-primary">event</i>
                            <span>{formatDate(multa.fecha_infraccion || multa.fecha)}</span>
                          </div>
                        </div>

                        {/* Fecha de vencimiento */}
                        <div className="col-md-6">
                          <label className="form-label text-muted small">Fecha de Vencimiento</label>
                          <div className="d-flex align-items-center gap-2">
                            <i className="material-icons text-danger">event</i>
                            <span>{formatDate(multa.fecha_vencimiento)}</span>
                            {diasVencimiento > 0 && multa.estado === 'pendiente' && (
                              <span className="badge bg-warning text-dark">
                                {diasVencimiento} {diasVencimiento === 1 ? 'día' : 'días'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Fecha de pago */}
                        {multa.fecha_pago && (
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Fecha de Pago</label>
                            <div className="d-flex align-items-center gap-2">
                              <i className="material-icons text-success">check_circle</i>
                              <span>{formatDate(multa.fecha_pago)}</span>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Información de unidad */}
                  <div className="card mb-4">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="material-icons me-2">apartment</i>
                        Información de la Unidad
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">

                        {/* Unidad */}
                        <div className="col-md-6">
                          <label className="form-label text-muted small">Unidad</label>
                          <div className="d-flex align-items-center gap-2">
                            <i className="material-icons text-primary">home</i>
                            <strong>Unidad {multa.unidad_numero}</strong>
                          </div>
                        </div>

                        {/* Torre */}
                        {multa.torre_nombre && (
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Torre</label>
                            <div className="d-flex align-items-center gap-2">
                              <i className="material-icons text-primary">business</i>
                              <span>{multa.torre_nombre}</span>
                            </div>
                          </div>
                        )}

                        {/* Edificio */}
                        {multa.edificio_nombre && (
                          <div className="col-md-6">
                            <label className="form-label text-muted small">Edificio</label>
                            <div className="d-flex align-items-center gap-2">
                              <i className="material-icons text-primary">domain</i>
                              <span>{multa.edificio_nombre}</span>
                            </div>
                          </div>
                        )}

                        {/* Propietario */}
                        {multa.propietario_nombre && (
                          <>
                            <div className="col-md-12">
                              <label className="form-label text-muted small">Responsable</label>
                              <div className="d-flex align-items-center gap-2">
                                <i className="material-icons text-secondary">person</i>
                                <strong>{multa.propietario_nombre}</strong>
                              </div>
                            </div>

                            {multa.propietario_email && (
                              <div className="col-md-6">
                                <label className="form-label text-muted small">Email</label>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="material-icons text-secondary">email</i>
                                  <a href={`mailto:${multa.propietario_email}`}>
                                    {multa.propietario_email}
                                  </a>
                                </div>
                              </div>
                            )}

                            {multa.propietario_telefono && (
                              <div className="col-md-6">
                                <label className="form-label text-muted small">Teléfono</label>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="material-icons text-secondary">phone</i>
                                  <a href={`tel:${multa.propietario_telefono}`}>
                                    {multa.propietario_telefono}
                                  </a>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  </div>

                </div>

                {/* Sidebar */}
                <div className="col-lg-4">

                  {/* Resumen */}
                  <div className="card mb-4">
                    <div className="card-header bg-white">
                      <h6 className="mb-0">
                        <i className="material-icons me-2">summarize</i>
                        Resumen
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-column gap-3">

                        <div>
                          <div className="text-muted small mb-1">Estado</div>
                          <span
                            className="badge d-inline-flex align-items-center gap-1"
                            style={{
                              background: estadoConfig.bgColor,
                              color: estadoConfig.textColor,
                              border: `2px solid ${estadoConfig.color}`
                            }}
                          >
                            <i className="material-icons" style={{ fontSize: '16px' }}>
                              {estadoConfig.icon}
                            </i>
                            {estadoConfig.label}
                          </span>
                        </div>

                        <div>
                          <div className="text-muted small mb-1">Monto</div>
                          <div className="fs-4 fw-bold text-success">
                            {formatCurrency(multa.monto)}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted small mb-1">Creada</div>
                          <div>{formatDateTime(multa.created_at)}</div>
                        </div>

                        <div>
                          <div className="text-muted small mb-1">Última actualización</div>
                          <div>{formatDateTime(multa.updated_at)}</div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="card">
                    <div className="card-header bg-white">
                      <h6 className="mb-0">
                        <i className="material-icons me-2">flash_on</i>
                        Acciones Rápidas
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-grid gap-2">

                        {puedePagar && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setShowPagoModal(true)}
                          >
                            <i className="material-icons me-2">payment</i>
                            Registrar Pago
                          </button>
                        )}

                        {puedeEditar && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleEditar}
                          >
                            <i className="material-icons me-2">edit</i>
                            Editar Multa
                          </button>
                        )}

                        {puedeApelar && (
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => setShowApelacionModal(true)}
                          >
                            <i className="material-icons me-2">gavel</i>
                            Crear Apelación
                          </button>
                        )}

                        {puedeAnular && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => setShowAnularModal(true)}
                          >
                            <i className="material-icons me-2">block</i>
                            Anular Multa
                          </button>
                        )}

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => window.print()}
                        >
                          <i className="material-icons me-2">print</i>
                          Imprimir
                        </button>

                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* Tab: Historial */}
            {activeTab === 'historial' && (
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">
                      <i className="material-icons me-2">history</i>
                      Historial de Cambios
                    </h5>
                  </div>
                  <div className="card-body">
                    {historial.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="material-icons" style={{ fontSize: '64px' }}>history</i>
                        <p className="mt-3">No hay registros en el historial</p>
                      </div>
                    ) : (
                      <div className="timeline">
                        {historial.map((item, index) => (
                          <div key={item.id} className="timeline-item">
                            <div className="timeline-marker">
                              <i className="material-icons">
                                {ACCION_ICONS[item.accion] || 'circle'}
                              </i>
                            </div>
                            <div className="timeline-content">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <strong>{ACCION_LABELS[item.accion] || item.accion}</strong>
                                  <div className="text-muted small">
                                    por {item.usuario_nombre || item.username}
                                  </div>
                                </div>
                                <span className="text-muted small">
                                  {formatDateTime(item.fecha)}
                                </span>
                              </div>

                              {item.descripcion && (
                                <p className="mb-2 small">{item.descripcion}</p>
                              )}

                              {item.estado_anterior && item.estado_nuevo && (
                                <div className="small">
                                  <span className="badge bg-secondary me-2">
                                    {ESTADO_CONFIG[item.estado_anterior as keyof typeof ESTADO_CONFIG]?.label || item.estado_anterior}
                                  </span>
                                  <i className="material-icons small">arrow_forward</i>
                                  <span className="badge bg-primary ms-2">
                                    {ESTADO_CONFIG[item.estado_nuevo as keyof typeof ESTADO_CONFIG]?.label || item.estado_nuevo}
                                  </span>
                                </div>
                              )}
                            </div>
                            {index < historial.length - 1 && <div className="timeline-line"></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* MODALES */}

        {/* Modal: Registrar Pago */}
        {showPagoModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="material-icons me-2">payment</i>
                    Registrar Pago
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPagoModal(false)}
                    disabled={procesando}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Fecha de Pago *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={pagoData.fecha_pago}
                      onChange={(e) => setPagoData({ ...pagoData, fecha_pago: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Método de Pago</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Transferencia, Efectivo, Tarjeta"
                      value={pagoData.metodo_pago}
                      onChange={(e) => setPagoData({ ...pagoData, metodo_pago: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Referencia</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Número de operación o comprobante"
                      value={pagoData.referencia}
                      onChange={(e) => setPagoData({ ...pagoData, referencia: e.target.value })}
                    />
                  </div>

                  <div className="alert alert-info">
                    <i className="material-icons me-2">info</i>
                    Monto a pagar: <strong>{formatCurrency(multa.monto)}</strong>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPagoModal(false)}
                    disabled={procesando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleRegistrarPago}
                    disabled={procesando}
                  >
                    {procesando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="material-icons me-2">check</i>
                        Registrar Pago
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Anular Multa */}
        {showAnularModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title">
                    <i className="material-icons me-2">block</i>
                    Anular Multa
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAnularModal(false)}
                    disabled={procesando}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="material-icons me-2">warning</i>
                    Esta acción anulará la multa. Debes proporcionar un motivo válido.
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Motivo de Anulación *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Describe el motivo de la anulación (mínimo 10 caracteres)"
                      value={anularData.motivo_anulacion}
                      onChange={(e) => setAnularData({ motivo_anulacion: e.target.value })}
                    />
                    <div className="form-text">
                      {anularData.motivo_anulacion.length} / 10 caracteres mínimos
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAnularModal(false)}
                    disabled={procesando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleAnular}
                    disabled={procesando || anularData.motivo_anulacion.length < 10}
                  >
                    {procesando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Anulando...
                      </>
                    ) : (
                      <>
                        <i className="material-icons me-2">block</i>
                        Anular Multa
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Crear Apelación */}
        {showApelacionModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    <i className="material-icons me-2">gavel</i>
                    Crear Apelación
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowApelacionModal(false)}
                    disabled={procesando}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="material-icons me-2">info</i>
                    Una apelación permite cuestionar la validez de la multa. Debes proporcionar argumentos sólidos.
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Motivo de Apelación *</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      placeholder="Describe detalladamente por qué consideras que esta multa no es válida (mínimo 20 caracteres)"
                      value={apelacionData.motivo}
                      onChange={(e) => setApelacionData({ ...apelacionData, motivo: e.target.value })}
                    />
                    <div className="form-text">
                      {apelacionData.motivo.length} / 20 caracteres mínimos
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApelacionModal(false)}
                    disabled={procesando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={handleCrearApelacion}
                    disabled={procesando || apelacionData.motivo.length < 20}
                  >
                    {procesando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creando...
                      </>
                    ) : (
                      <>
                        <i className="material-icons me-2">send</i>
                        Enviar Apelación
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .timeline {
            position: relative;
            padding: 0;
          }

          .timeline-item {
            position: relative;
            padding-left: 50px;
            padding-bottom: 30px;
          }

          .timeline-marker {
            position: absolute;
            left: 0;
            top: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #007bff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
          }

          .timeline-line {
            position: absolute;
            left: 19px;
            top: 40px;
            bottom: -30px;
            width: 2px;
            background: #e9ecef;
            z-index: 1;
          }

          .timeline-content {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border-left: 3px solid #007bff;
          }

          @media print {
            .btn, .nav-tabs, .dropdown, .modal {
              display: none !important;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}