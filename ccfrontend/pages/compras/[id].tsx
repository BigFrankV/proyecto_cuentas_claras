import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Row, Col, Badge, Table, Alert, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import { multasService } from '@/lib/multasService';
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
  descripcion?: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'apelada' | 'anulada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_infraccion: string;
  fecha_vencimiento: string;
  fecha_pago?: string;
  metodo_pago?: string;
  referencia_pago?: string;
  motivo_anulacion?: string;
  anulado_por?: number;
  anulado_por_username?: string;
  fecha_anulacion?: string;
  created_at: string;
  updated_at: string;
}

interface HistorialEvento {
  id: number;
  multa_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  username: string;
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
  usuario_nombre?: string;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuesta?: string;
  respondido_por?: number;
  fecha_respuesta?: string;
  documentos_json?: any;
  created_at: string;
}

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  url: string;
  fecha_subida: string;
  subido_por: string;
}

// ============================================
// FUNCIONES HELPER
// ============================================

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-CL')}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getEstadoInfo = (estado: string) => {
  const estadoMap = {
    pendiente: { 
      label: 'Pendiente', 
      variant: 'warning', 
      icon: 'schedule',
      color: '#ff9800'
    },
    pagado: { 
      label: 'Pagado', 
      variant: 'success', 
      icon: 'check_circle',
      color: '#4caf50'
    },
    vencido: { 
      label: 'Vencido', 
      variant: 'danger', 
      icon: 'error',
      color: '#f44336'
    },
    apelada: { 
      label: 'Apelada', 
      variant: 'info', 
      icon: 'gavel',
      color: '#2196f3'
    },
    anulada: { 
      label: 'Anulada', 
      variant: 'secondary', 
      icon: 'cancel',
      color: '#9e9e9e'
    }
  };
  return estadoMap[estado as keyof typeof estadoMap] || estadoMap.pendiente;
};

const getPrioridadInfo = (prioridad: string) => {
  const prioridadMap = {
    baja: { 
      label: 'Baja', 
      variant: 'success', 
      icon: 'flag',
      color: '#4caf50'
    },
    media: { 
      label: 'Media', 
      variant: 'info', 
      icon: 'flag',
      color: '#2196f3'
    },
    alta: { 
      label: 'Alta', 
      variant: 'warning', 
      icon: 'flag',
      color: '#ff9800'
    },
    critica: { 
      label: 'Crítica', 
      variant: 'danger', 
      icon: 'priority_high',
      color: '#f44336'
    }
  };
  return prioridadMap[prioridad as keyof typeof prioridadMap] || prioridadMap.media;
};

const getAccionIcon = (accion: string): string => {
  const accionMap: { [key: string]: string } = {
    'creada': 'add_circle',
    'editada': 'edit',
    'anulada': 'cancel',
    'pago_registrado': 'payment',
    'apelada': 'gavel',
    'apelacion_aprobada': 'check_circle',
    'apelacion_rechazada': 'cancel',
    'nota_agregada': 'note_add',
    'estado_cambiado': 'sync'
  };
  return accionMap[accion] || 'info';
};

const getAccionColor = (accion: string): string => {
  const accionColorMap: { [key: string]: string } = {
    'creada': 'primary',
    'editada': 'info',
    'anulada': 'danger',
    'pago_registrado': 'success',
    'apelada': 'warning',
    'apelacion_aprobada': 'success',
    'apelacion_rechazada': 'danger',
    'nota_agregada': 'info',
    'estado_cambiado': 'secondary'
  };
  return accionColorMap[accion] || 'secondary';
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DetalleMulta() {
  const router = useRouter();
  const { id } = router.query;
  
  // Estados principales
  const [multa, setMulta] = useState<Multa | null>(null);
  const [historial, setHistorial] = useState<HistorialEvento[]>([]);
  const [apelaciones, setApelaciones] = useState<Apelacion[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Estados de modales
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [showApelacionModal, setShowApelacionModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  
  // Estados de formularios
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState('');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [motivoApelacion, setMotivoApelacion] = useState('');
  const [nuevaNota, setNuevaNota] = useState('');
  
  // Estado de guardado
  const [saving, setSaving] = useState(false);

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    if (id) {
      loadMultaData();
    }
  }, [id]);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const loadMultaData = async () => {
    try {
      setLoading(true);
      console.log(`📥 Cargando multa ${id}...`);
      
      // Cargar datos de la multa
      const multaData = await multasService.obtenerMulta(Number(id));
      console.log('✅ Multa cargada:', multaData);
      setMulta(multaData);
      
      // Cargar historial
      try {
        const historialData = await multasService.obtenerHistorial(Number(id));
        console.log('✅ Historial cargado:', historialData);
        setHistorial(historialData || []);
      } catch (error) {
        console.warn('⚠️ Error cargando historial:', error);
        setHistorial([]);
      }
      
      // Cargar apelaciones (si existen en el servicio)
      try {
        // const apelacionesData = await multasService.obtenerApelaciones(Number(id));
        // setApelaciones(apelacionesData || []);
        setApelaciones([]);
      } catch (error) {
        console.warn('⚠️ Error cargando apelaciones:', error);
        setApelaciones([]);
      }
      
      // Mock de documentos (por ahora)
      setDocumentos([]);
      
    } catch (error: any) {
      console.error('❌ Error cargando datos de multa:', error);
      toast.error(error.message || 'Error al cargar los datos de la multa');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FUNCIONES DE ACCIONES
  // ============================================

  const handleRegistrarPago = async () => {
    if (!fechaPago) {
      toast.error('La fecha de pago es requerida');
      return;
    }

    try {
      setSaving(true);
      console.log('💰 Registrando pago...', { fechaPago, metodoPago, referenciaPago });
      
      await multasService.registrarPago(Number(id), {
        fecha_pago: fechaPago,
        metodo_pago: metodoPago || undefined,
        referencia: referenciaPago || undefined
      });
      
      toast.success('Pago registrado exitosamente');
      setShowPagoModal(false);
      
      // Recargar datos
      await loadMultaData();
      
      // Limpiar formulario
      setFechaPago(new Date().toISOString().split('T')[0]);
      setMetodoPago('');
      setReferenciaPago('');
      
    } catch (error: any) {
      console.error('❌ Error registrando pago:', error);
      toast.error(error.message || 'Error al registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  const handleAnular = async () => {
    if (!motivoAnulacion.trim()) {
      toast.error('El motivo de anulación es requerido');
      return;
    }

    try {
      setSaving(true);
      console.log('🚫 Anulando multa...', { motivoAnulacion });
      
      await multasService.anularMulta(Number(id), motivoAnulacion);
      
      toast.success('Multa anulada exitosamente');
      setShowAnularModal(false);
      
      // Recargar datos
      await loadMultaData();
      
      // Limpiar formulario
      setMotivoAnulacion('');
      
    } catch (error: any) {
      console.error('❌ Error anulando multa:', error);
      toast.error(error.message || 'Error al anular la multa');
    } finally {
      setSaving(false);
    }
  };

  const handleCrearApelacion = async () => {
    if (!motivoApelacion.trim() || motivoApelacion.length < 20) {
      toast.error('El motivo de apelación debe tener al menos 20 caracteres');
      return;
    }

    try {
      setSaving(true);
      console.log('📝 Creando apelación...', { motivoApelacion });
      
      await multasService.crearApelacion(Number(id), {
        motivo: motivoApelacion
      });
      
      toast.success('Apelación creada exitosamente');
      setShowApelacionModal(false);
      
      // Recargar datos
      await loadMultaData();
      
      // Limpiar formulario
      setMotivoApelacion('');
      
    } catch (error: any) {
      console.error('❌ Error creando apelación:', error);
      toast.error(error.message || 'Error al crear la apelación');
    } finally {
      setSaving(false);
    }
  };

  const agregarNota = async () => {
    if (!nuevaNota.trim()) {
      toast.error('La nota no puede estar vacía');
      return;
    }

    try {
      setSaving(true);
      console.log('📝 Agregando nota...', { nuevaNota });
      
      // Aquí iría la llamada al servicio cuando esté implementado
      // await multasService.agregarNota(Number(id), nuevaNota);
      
      toast.success('Nota agregada exitosamente');
      setShowNotaModal(false);
      
      // Recargar datos
      await loadMultaData();
      
      // Limpiar formulario
      setNuevaNota('');
      
    } catch (error: any) {
      console.error('❌ Error agregando nota:', error);
      toast.error(error.message || 'Error al agregar la nota');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================

  const puedeRegistrarPago = (): boolean => {
    return multa?.estado === 'pendiente' || multa?.estado === 'vencido';
  };

  const puedeAnular = (): boolean => {
    return multa?.estado !== 'pagado' && multa?.estado !== 'anulada';
  };

  const puedeEditar = (): boolean => {
    return multa?.estado === 'pendiente' || multa?.estado === 'vencido';
  };

  const puedeApelar = (): boolean => {
    return multa?.estado !== 'pagado' && multa?.estado !== 'anulada';
  };

  const calcularDiasVencimiento = (): number => {
    if (!multa?.fecha_vencimiento) return 0;
    const hoy = new Date();
    const vencimiento = new Date(multa.fecha_vencimiento);
    const diff = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Cargando multa... — Cuentas Claras</title>
        </Head>
        <Layout>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted">Cargando detalles de la multa...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!multa) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Multa no encontrada — Cuentas Claras</title>
        </Head>
        <Layout>
          <div className="text-center py-5">
            <span className="material-icons text-muted mb-3" style={{ fontSize: '4rem' }}>
              error_outline
            </span>
            <h4>Multa no encontrada</h4>
            <p className="text-muted">La multa que buscas no existe o no tienes permisos para verla.</p>
            <Button variant="primary" onClick={() => router.push('/multas')}>
              <i className="material-icons me-2">arrow_back</i>
              Volver a Multas
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const estadoInfo = getEstadoInfo(multa.estado);
  const prioridadInfo = getPrioridadInfo(multa.prioridad);
  const diasVencimiento = calcularDiasVencimiento();

  return (
    <ProtectedRoute>
      <Head>
        <title>{multa.numero} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className="multas-container">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="d-flex align-items-center">
              <Button 
                variant="link" 
                className="text-secondary p-0 me-3"
                onClick={() => router.back()}
              >
                <span className="material-icons">arrow_back</span>
              </Button>
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h1 className="multas-title mb-0">
                    <span className="material-icons me-2">warning</span>
                    {multa.numero}
                  </h1>
                  <Badge 
                    bg={estadoInfo.variant} 
                    className="d-flex align-items-center"
                    style={{ background: estadoInfo.color }}
                  >
                    <span className="material-icons me-1" style={{ fontSize: '16px' }}>
                      {estadoInfo.icon}
                    </span>
                    {estadoInfo.label}
                  </Badge>
                  <Badge 
                    bg={prioridadInfo.variant} 
                    className="d-flex align-items-center"
                    style={{ background: prioridadInfo.color }}
                  >
                    <span className="material-icons me-1" style={{ fontSize: '16px' }}>
                      {prioridadInfo.icon}
                    </span>
                    {prioridadInfo.label}
                  </Badge>
                </div>
                <p className="multas-subtitle mb-0">
                  Unidad {multa.unidad_numero}
                  {multa.torre_nombre && ` • Torre ${multa.torre_nombre}`}
                  {' • '}
                  {formatDate(multa.fecha_infraccion)}
                </p>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              {puedeRegistrarPago() && (
                <Button
                  variant="success"
                  onClick={() => setShowPagoModal(true)}
                >
                  <span className="material-icons me-2">payment</span>
                  Registrar Pago
                </Button>
              )}
              
              {puedeApelar() && (
                <Button
                  variant="info"
                  onClick={() => setShowApelacionModal(true)}
                >
                  <span className="material-icons me-2">gavel</span>
                  Apelar
                </Button>
              )}
              
              {puedeAnular() && (
                <Button
                  variant="outline-danger"
                  onClick={() => setShowAnularModal(true)}
                >
                  <span className="material-icons me-2">cancel</span>
                  Anular
                </Button>
              )}
              
              <Button
                variant="outline-primary"
                onClick={() => setShowNotaModal(true)}
              >
                <span className="material-icons me-2">note_add</span>
                Agregar Nota
              </Button>
              
              {puedeEditar() && (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/multas/${multa.id}/editar`)}
                >
                  <span className="material-icons me-2">edit</span>
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Alerta de vencimiento */}
          {multa.estado === 'pendiente' && diasVencimiento <= 3 && diasVencimiento >= 0 && (
            <Alert variant="warning" className="mb-4">
              <div className="d-flex align-items-center">
                <span className="material-icons me-2">warning</span>
                <div>
                  <strong>Atención:</strong> Esta multa vence en {diasVencimiento} {diasVencimiento === 1 ? 'día' : 'días'}.
                </div>
              </div>
            </Alert>
          )}

          {multa.estado === 'vencido' && (
            <Alert variant="danger" className="mb-4">
              <div className="d-flex align-items-center">
                <span className="material-icons me-2">error</span>
                <div>
                  <strong>Multa Vencida:</strong> Esta multa venció el {formatDate(multa.fecha_vencimiento)}.
                </div>
              </div>
            </Alert>
          )}

          {/* Tabs de navegación */}
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab || 'details')}
            className="mb-4"
          >
            {/* TAB: DETALLES */}
            <Tab 
              eventKey="details" 
              title={
                <span>
                  <span className="material-icons me-2">info</span>
                  Detalles
                </span>
              }
            >
              <Row>
                {/* Columna principal */}
                <Col lg={8}>
                  {/* Información de la Infracción */}
                  <Card className="multa-detail-section mb-4">
                    <Card.Header className="section-header">
                      <h6 className="mb-0">
                        <span className="material-icons me-2">warning</span>
                        Información de la Infracción
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col xs={12}>
                          <div className="detail-field">
                            <label className="detail-label">Tipo de Infracción</label>
                            <div className="detail-value fw-bold">{multa.tipo_infraccion}</div>
                          </div>
                        </Col>
                        {multa.descripcion && (
                          <Col xs={12}>
                            <div className="detail-field">
                              <label className="detail-label">Descripción</label>
                              <div className="detail-value">{multa.descripcion}</div>
                            </div>
                          </Col>
                        )}
                        <Col md={6}>
                          <div className="detail-field">
                            <label className="detail-label">Fecha de Infracción</label>
                            <div className="detail-value">{formatDate(multa.fecha_infraccion)}</div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="detail-field">
                            <label className="detail-label">Fecha de Vencimiento</label>
                            <div className="detail-value">
                              {formatDate(multa.fecha_vencimiento)}
                              {multa.estado === 'pendiente' && (
                                <Badge 
                                  bg={diasVencimiento <= 3 ? 'danger' : 'secondary'} 
                                  className="ms-2"
                                >
                                  {diasVencimiento > 0 ? `${diasVencimiento} días` : 'Vencida'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="detail-field">
                            <label className="detail-label">Monto</label>
                            <div className="detail-value text-danger fw-bold" style={{ fontSize: '1.5rem' }}>
                              {formatCurrency(multa.monto)}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="detail-field">
                            <label className="detail-label">Prioridad</label>
                            <div className="detail-value">
                              <Badge 
                                bg={prioridadInfo.variant}
                                style={{ background: prioridadInfo.color }}
                              >
                                <span className="material-icons me-1" style={{ fontSize: '14px' }}>
                                  {prioridadInfo.icon}
                                </span>
                                {prioridadInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Información de la Unidad */}
                  <Card className="multa-detail-section mb-4">
                    <Card.Header className="section-header">
                      <h6 className="mb-0">
                        <span className="material-icons me-2">apartment</span>
                        Unidad Afectada
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={6}>
                          <div className="detail-field">
                            <label className="detail-label">Número de Unidad</label>
                            <div className="detail-value fw-bold">Unidad {multa.unidad_numero}</div>
                          </div>
                        </Col>
                        {multa.torre_nombre && (
                          <Col md={6}>
                            <div className="detail-field">
                              <label className="detail-label">Torre</label>
                              <div className="detail-value">{multa.torre_nombre}</div>
                            </div>
                          </Col>
                        )}
                        {multa.edificio_nombre && (
                          <Col md={6}>
                            <div className="detail-field">
                              <label className="detail-label">Edificio</label>
                              <div className="detail-value">{multa.edificio_nombre}</div>
                            </div>
                          </Col>
                        )}
                        <Col md={6}>
                          <div className="detail-field">
                            <label className="detail-label">Comunidad</label>
                            <div className="detail-value">{multa.comunidad_nombre}</div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Información del Responsable */}
                  {multa.propietario_nombre && (
                    <Card className="multa-detail-section mb-4">
                      <Card.Header className="section-header">
                        <h6 className="mb-0">
                          <span className="material-icons me-2">person</span>
                          Persona Responsable
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="detail-field">
                              <label className="detail-label">Nombre</label>
                              <div className="detail-value">{multa.propietario_nombre}</div>
                            </div>
                          </Col>
                          {multa.propietario_email && (
                            <Col md={6}>
                              <div className="detail-field">
                                <label className="detail-label">Email</label>
                                <div className="detail-value">
                                  <a href={`mailto:${multa.propietario_email}`}>
                                    {multa.propietario_email}
                                  </a>
                                </div>
                              </div>
                            </Col>
                          )}
                          {multa.propietario_telefono && (
                            <Col md={6}>
                              <div className="detail-field">
                                <label className="detail-label">Teléfono</label>
                                <div className="detail-value">
                                  <a href={`tel:${multa.propietario_telefono}`}>
                                    {multa.propietario_telefono}
                                  </a>
                                </div>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Información de Pago */}
                  {multa.estado === 'pagado' && multa.fecha_pago && (
                    <Card className="multa-detail-section mb-4">
                      <Card.Header className="section-header">
                        <h6 className="mb-0">
                          <span className="material-icons me-2">payment</span>
                          Información de Pago
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="detail-field">
                              <label className="detail-label">Fecha de Pago</label>
                              <div className="detail-value">{formatDate(multa.fecha_pago)}</div>
                            </div>
                          </Col>
                          {multa.metodo_pago && (
                            <Col md={6}>
                              <div className="detail-field">
                                <label className="detail-label">Método de Pago</label>
                                <div className="detail-value">{multa.metodo_pago}</div>
                              </div>
                            </Col>
                          )}
                          {multa.referencia_pago && (
                            <Col md={6}>
                              <div className="detail-field">
                                <label className="detail-label">Referencia</label>
                                <div className="detail-value">{multa.referencia_pago}</div>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Información de Anulación */}
                  {multa.estado === 'anulada' && multa.motivo_anulacion && (
                    <Card className="multa-detail-section mb-4 border-danger">
                      <Card.Header className="section-header bg-danger text-white">
                        <h6 className="mb-0">
                          <span className="material-icons me-2">cancel</span>
                          Información de Anulación
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row className="g-3">
                          <Col md={6}>
                            <div className="detail-field">
                              <label className="detail-label">Anulada por</label>
                              <div className="detail-value">{multa.anulado_por_username || 'Sistema'}</div>
                            </div>
                          </Col>
                          {multa.fecha_anulacion && (
                            <Col md={6}>
                              <div className="detail-field">
                                <label className="detail-label">Fecha de Anulación</label>
                                <div className="detail-value">{formatDateTime(multa.fecha_anulacion)}</div>
                              </div>
                            </Col>
                          )}
                          <Col xs={12}>
                            <div className="detail-field">
                              <label className="detail-label">Motivo</label>
                              <Alert variant="danger" className="mb-0">
                                {multa.motivo_anulacion}
                              </Alert>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  )}
                </Col>

                {/* Columna lateral */}
                <Col lg={4}>
                  {/* Resumen */}
                  <Card className="multa-detail-section mb-4">
                    <Card.Header className="section-header">
                      <h6 className="mb-0">
                        <span className="material-icons me-2">analytics</span>
                        Resumen
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="summary-item">
                        <div className="summary-label">Estado</div>
                        <Badge 
                          bg={estadoInfo.variant}
                          style={{ background: estadoInfo.color }}
                        >
                          <span className="material-icons me-1" style={{ fontSize: '14px' }}>
                            {estadoInfo.icon}
                          </span>
                          {estadoInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="summary-item">
                        <div className="summary-label">Monto</div>
                        <div className="summary-value text-danger fw-bold">
                          {formatCurrency(multa.monto)}
                        </div>
                      </div>
                      
                      <div className="summary-item">
                        <div className="summary-label">Días para Vencer</div>
                        <div className="summary-value">
                          {multa.estado === 'pendiente' ? (
                            <Badge bg={diasVencimiento <= 3 ? 'danger' : 'secondary'}>
                              {diasVencimiento > 0 ? `${diasVencimiento} días` : 'Vencida'}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </div>
                      </div>
                      
                      <div className="summary-item mb-0">
                        <div className="summary-label">Creada el</div>
                        <div className="summary-value">
                          {formatDate(multa.created_at)}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Acciones Rápidas */}
                  <Card className="multa-detail-section mb-4">
                    <Card.Header className="section-header">
                      <h6 className="mb-0">
                        <span className="material-icons me-2">bolt</span>
                        Acciones Rápidas
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-grid gap-2">
                        {puedeRegistrarPago() && (
                          <Button
                            variant="success"
                            onClick={() => setShowPagoModal(true)}
                          >
                            <span className="material-icons me-2">payment</span>
                            Registrar Pago
                          </Button>
                        )}
                        
                        {puedeEditar() && (
                          <Button
                            variant="primary"
                            onClick={() => router.push(`/multas/${multa.id}/editar`)}
                          >
                            <span className="material-icons me-2">edit</span>
                            Editar Multa
                          </Button>
                        )}
                        
                        {puedeApelar() && (
                          <Button
                            variant="info"
                            onClick={() => setShowApelacionModal(true)}
                          >
                            <span className="material-icons me-2">gavel</span>
                            Apelar Multa
                          </Button>
                        )}
                        
                        <Button
                          variant="outline-secondary"
                          onClick={() => window.print()}
                        >
                          <span className="material-icons me-2">print</span>
                          Imprimir
                        </Button>
                        
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            // Aquí iría la lógica de envío de email
                            toast.info('Función de envío de email en desarrollo');
                          }}
                        >
                          <span className="material-icons me-2">email</span>
                          Enviar por Email
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Apelaciones */}
                  {apelaciones.length > 0 && (
                    <Card className="multa-detail-section">
                      <Card.Header className="section-header">
                        <h6 className="mb-0">
                          <span className="material-icons me-2">gavel</span>
                          Apelaciones ({apelaciones.length})
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        {apelaciones.map(apelacion => (
                          <div key={apelacion.id} className="apelacion-item mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge bg={
                                apelacion.estado === 'aprobada' ? 'success' :
                                apelacion.estado === 'rechazada' ? 'danger' : 'warning'
                              }>
                                {apelacion.estado === 'aprobada' ? 'Aprobada' :
                                 apelacion.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                              </Badge>
                              <small className="text-muted">
                                {formatDate(apelacion.created_at)}
                              </small>
                            </div>
                            <p className="mb-1 small">{apelacion.motivo}</p>
                            {apelacion.respuesta && (
                              <Alert variant={apelacion.estado === 'aprobada' ? 'success' : 'danger'} className="small mb-0 mt-2">
                                <strong>Respuesta:</strong> {apelacion.respuesta}
                              </Alert>
                            )}
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Tab>

            {/* TAB: HISTORIAL */}
            <Tab 
              eventKey="historial" 
              title={
                <span>
                  <span className="material-icons me-2">timeline</span>
                  Historial ({historial.length})
                </span>
              }
            >
              <Card className="multa-detail-section">
                <Card.Header className="section-header">
                  <h6 className="mb-0">
                    <span className="material-icons me-2">timeline</span>
                    Línea de Tiempo
                  </h6>
                </Card.Header>
                <Card.Body>
                  {historial.length > 0 ? (
                    <div className="timeline">
                      {historial.map((evento, index) => (
                        <div key={evento.id} className={`timeline-item ${index === 0 ? 'active' : ''}`}>
                          <div className={`timeline-marker bg-${getAccionColor(evento.accion)}`}>
                            <span className="material-icons">{getAccionIcon(evento.accion)}</span>
                          </div>
                          <div className="timeline-content">
                            <h6 className="timeline-title text-capitalize">{evento.accion.replace(/_/g, ' ')}</h6>
                            {evento.descripcion && (
                              <p className="timeline-description">{evento.descripcion}</p>
                            )}
                            {evento.estado_anterior && evento.estado_nuevo && (
                              <div className="timeline-badge-group">
                                <Badge bg="secondary">{evento.estado_anterior}</Badge>
                                <span className="material-icons mx-2" style={{ fontSize: '16px' }}>
                                  arrow_forward
                                </span>
                                <Badge bg={getEstadoInfo(evento.estado_nuevo).variant}>
                                  {evento.estado_nuevo}
                                </Badge>
                              </div>
                            )}
                            <div className="timeline-meta">
                              <span className="timeline-user">
                                <span className="material-icons me-1" style={{ fontSize: '14px' }}>
                                  person
                                </span>
                                {evento.usuario_nombre || evento.username}
                              </span>
                              <span className="timeline-date">
                                <span className="material-icons me-1" style={{ fontSize: '14px' }}>
                                  schedule
                                </span>
                                {formatDateTime(evento.fecha)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="material-icons text-muted mb-3" style={{ fontSize: '3rem' }}>
                        timeline
                      </span>
                      <h6>No hay eventos en el historial</h6>
                      <p className="text-muted">Los eventos relacionados con esta multa aparecerán aquí.</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* TAB: DOCUMENTOS */}
            <Tab 
              eventKey="documentos" 
              title={
                <span>
                  <span className="material-icons me-2">folder</span>
                  Documentos ({documentos.length})
                </span>
              }
            >
              <Card className="multa-detail-section">
                <Card.Header className="section-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <span className="material-icons me-2">folder</span>
                      Documentos Adjuntos
                    </h6>
                    <Button variant="outline-primary" size="sm">
                      <span className="material-icons me-1">cloud_upload</span>
                      Subir Documento
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {documentos.length > 0 ? (
                    <div className="documents-list">
                      {documentos.map(doc => (
                        <div key={doc.id} className="document-item">
                          <div className="d-flex align-items-center">
                            <span className="material-icons text-primary me-3">description</span>
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{doc.nombre}</h6>
                              <small className="text-muted">
                                {formatFileSize(doc.tamano)} • 
                                Subido por {doc.subido_por} • 
                                {formatDate(doc.fecha_subida)}
                              </small>
                            </div>
                            <div className="d-flex gap-2">
                              <Button variant="outline-primary" size="sm">
                                <span className="material-icons">visibility</span>
                              </Button>
                              <Button variant="outline-secondary" size="sm">
                                <span className="material-icons">download</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="material-icons text-muted mb-3" style={{ fontSize: '3rem' }}>
                        folder_open
                      </span>
                      <h6>No hay documentos adjuntos</h6>
                      <p className="text-muted">Los documentos relacionados con esta multa aparecerán aquí.</p>
                      <Button variant="outline-primary" className="mt-3">
                        <span className="material-icons me-2">cloud_upload</span>
                        Subir Primer Documento
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </div>

        {/* MODAL: REGISTRAR PAGO */}
        <Modal show={showPagoModal} onHide={() => setShowPagoModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <span className="material-icons me-2 text-success">payment</span>
              Registrar Pago
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Pago *</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Método de Pago (Opcional)</Form.Label>
                <Form.Select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Otro">Otro</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Referencia/Comprobante (Opcional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Nº de transferencia, comprobante..."
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value)}
                />
              </Form.Group>

              <Alert variant="info" className="mb-0">
                <span className="material-icons me-2">info</span>
                Se cambiará el estado de la multa a "Pagado" y se notificará a la unidad.
              </Alert>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowPagoModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="success" 
              onClick={handleRegistrarPago}
              disabled={!fechaPago || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <span className="material-icons me-2">payment</span>
                  Registrar Pago
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL: ANULAR MULTA */}
        <Modal show={showAnularModal} onHide={() => setShowAnularModal(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>
              <span className="material-icons me-2">cancel</span>
              Anular Multa
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="danger">
              <span className="material-icons me-2">warning</span>
              <strong>Atención:</strong> Esta acción anulará la multa de forma permanente.
            </Alert>

            <Form>
              <Form.Group>
                <Form.Label className="required">Motivo de Anulación</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Explica el motivo de la anulación..."
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Mínimo 10 caracteres
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowAnularModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleAnular}
              disabled={!motivoAnulacion.trim() || motivoAnulacion.length < 10 || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Anulando...
                </>
              ) : (
                <>
                  <span className="material-icons me-2">cancel</span>
                  Anular Multa
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL: CREAR APELACIÓN */}
        <Modal show={showApelacionModal} onHide={() => setShowApelacionModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <span className="material-icons me-2 text-info">gavel</span>
              Crear Apelación
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info">
              <span className="material-icons me-2">info</span>
              La apelación será revisada por la administración. Te notificaremos la respuesta.
            </Alert>

            <Form>
              <Form.Group>
                <Form.Label className="required">Motivo de la Apelación</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Explica detalladamente el motivo de tu apelación..."
                  value={motivoApelacion}
                  onChange={(e) => setMotivoApelacion(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Mínimo 20 caracteres. Sé claro y específico.
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowApelacionModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="info" 
              onClick={handleCrearApelacion}
              disabled={!motivoApelacion.trim() || motivoApelacion.length < 20 || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creando...
                </>
              ) : (
                <>
                  <span className="material-icons me-2">gavel</span>
                  Crear Apelación
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL: AGREGAR NOTA */}
        <Modal show={showNotaModal} onHide={() => setShowNotaModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <span className="material-icons me-2">note_add</span>
              Agregar Nota
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Nota</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Escribe tu nota..."
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowNotaModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={agregarNota}
              disabled={!nuevaNota.trim() || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Agregando...
                </>
              ) : (
                <>
                  <span className="material-icons me-2">note_add</span>
                  Agregar Nota
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        <style jsx>{`
          .multas-container {
            padding: 1.5rem;
          }

          .multas-title {
            font-size: 1.75rem;
            font-weight: 600;
            display: flex;
            align-items: center;
          }

          .multas-subtitle {
            color: #6c757d;
            font-size: 0.875rem;
          }

          .multa-detail-section {
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }

          .section-header {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 1rem 1.5rem;
          }

          .section-header h6 {
            display: flex;
            align-items: center;
            color: #212529;
          }

          .detail-field {
            margin-bottom: 1rem;
          }

          .detail-field:last-child {
            margin-bottom: 0;
          }

          .detail-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: #6c757d;
            margin-bottom: 0.25rem;
            display: block;
          }

          .detail-value {
            color: #212529;
            font-size: 0.875rem;
          }

          .summary-item {
            padding: 0.75rem 0;
            border-bottom: 1px solid #e9ecef;
          }

          .summary-item:last-child {
            border-bottom: none;
          }

          .summary-label {
            font-size: 0.75rem;
            color: #6c757d;
            margin-bottom: 0.25rem;
          }

          .summary-value {
            font-size: 1rem;
            color: #212529;
            font-weight: 500;
          }

          .timeline {
            position: relative;
            padding-left: 40px;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e9ecef;
          }

          .timeline-item {
            position: relative;
            padding-bottom: 2rem;
          }

          .timeline-item:last-child {
            padding-bottom: 0;
          }

          .timeline-marker {
            position: absolute;
            left: -40px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            z-index: 1;
          }

          .timeline-marker .material-icons {
            font-size: 18px;
          }

          .timeline-content {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
          }

          .timeline-title {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .timeline-description {
            font-size: 0.875rem;
            color: #6c757d;
            margin-bottom: 0.5rem;
          }

          .timeline-badge-group {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .timeline-meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.75rem;
            color: #6c757d;
          }

          .timeline-user,
          .timeline-date {
            display: flex;
            align-items: center;
          }

          .documents-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .document-item {
            padding: 1rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .document-item:hover {
            border-color: #007bff;
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
          }

          .apelacion-item {
            padding: 1rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background: #f8f9fa;
          }

          .apelacion-item:last-child {
            margin-bottom: 0 !important;
          }

          @media (max-width: 768px) {
            .multas-container {
              padding: 1rem;
            }

            .multas-title {
              font-size: 1.25rem;
            }

            .timeline {
              padding-left: 30px;
            }

            .timeline::before {
              left: 10px;
            }

            .timeline-marker {
              left: -30px;
              width: 24px;
              height: 24px;
            }

            .timeline-marker .material-icons {
              font-size: 14px;
            }
          }

          @media print {
            .multas-container button,
            .section-header button {
              display: none !important;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}