import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Badge,
  Table,
  Form,
  Modal,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import {
  createLectura,
  deleteMedidor,
  getConsumos,
  getMedidor,
  listLecturas,
} from '@/lib/medidoresService';
import { useAuth, ProtectedRoute } from '@/lib/useAuth';
import type { Medidor, Reading } from '@/types/medidores';

export default function MedidorDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [lecturas, setLecturas] = useState<Reading[]>([]);
  const [consumos, setConsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState({ fecha: '', lectura: '', periodo: '' });

  // modal/configuracion/historial (maqueteado por ahora)
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState({
    readingFrequency: 'monthly',
    consumptionThreshold: 100,
    autoReading: false,
    notifications: true,
  });
  const [maintenanceHistory, setMaintenanceHistory] = useState([
    {
      id: 1,
      fecha: '2023-10-01',
      tipo: 'preventivo',
      tecnico: 'Juan Pérez',
      empresa: 'Servicio Técnico SA',
      descripcion: 'Revisión anual del medidor',
      costo: 15000,
      estado: 'completado',
      repuestos: ['Filtro', 'Sellos'],
    },
  ]);

  const getStatusBadge = (estado: string | undefined) => {
    switch (estado) {
      case 'activo':
        return <Badge bg="success">Activo</Badge>;
      case 'inactivo':
        return <Badge bg="danger">Inactivo</Badge>;
      case 'mantenimiento':
        return <Badge bg="warning">Mantenimiento</Badge>;
      default:
        return <Badge bg="secondary">Desconocido</Badge>;
    }
  };

  useEffect(() => {
    if (!id) {
      return undefined;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMedidor(Number(id));
        if (!mounted) {
          return;
        }
        setMedidor(data);
        const lecResp = await listLecturas(Number(id), { limit: 24 });
        setLecturas(Array.isArray(lecResp) ? lecResp : (lecResp?.data ?? []));
        const consResp = await getConsumos(Number(id));
        setConsumos(consResp.data ?? []);
        // mantenimiento permanece maqueteado (maintenanceHistory)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('load medidor err', err);
        alert('Error cargando medidor');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const canManage = () => {
    if (!user) {
      return false;
    }
    if (user.is_superadmin) {
      return true;
    }
    return !!user.memberships?.find(
      (m: any) =>
        m.comunidad_id === medidor?.comunidad_id &&
        (m.rol === 'admin' || m.rol === 'gestor'),
    );
  };

  const submitLectura = async (e: any) => {
    e.preventDefault();
    if (!id) {
      return;
    }
    if (!form.fecha || form.lectura === '' || !form.periodo) {
      alert('Completa fecha, lectura y periodo');
      return;
    }
    setLoading(true);
    try {
      await createLectura(Number(id), {
        fecha: form.fecha,
        lectura: Number(form.lectura),
        periodo: form.periodo,
      });
      alert('Lectura creada');
      const lecResp = await listLecturas(Number(id), { limit: 24 });
      setLecturas(Array.isArray(lecResp) ? lecResp : (lecResp?.data ?? []));
      const data = await getMedidor(Number(id));
      setMedidor(data);
      setForm({ fecha: '', lectura: '', periodo: '' });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('create lectura err', err);
      if (err?.response?.status === 409) {
        alert('Ya existe una lectura para ese periodo');
      } else if (err?.response?.status === 403) {
        alert('No autorizado');
      } else {
        alert('Error al crear lectura');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!medidor) { return; }
    if (!confirm('Eliminar medidor? (si tiene lecturas, será desactivado)')) { return; }
    setLoading(true);
    try {
      const resp = await deleteMedidor(medidor.id);
      if (resp?.softDeleted) {
        alert('Medidor desactivado (soft-delete)');
      } else {
        alert('Medidor eliminado');
      }
      router.push('/medidores');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('delete medidor err', err);
      alert('Error al eliminar medidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    // Por ahora maqueta: cierra modal y actualiza medidor local.
    // Si luego quieres persistir, llamar al endpoint PUT /medidores/:id/config
    setShowConfigModal(false);
    alert('Configuración guardada (maquetada)');
  };

  if (!id) { return <div>Cargando id...</div>; }
  if (loading && !medidor) { return <div>Cargando...</div>; }

  return (
    <ProtectedRoute>
      <Head>
        <title>Medidor {medidor?.medidor_codigo} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className="medidores-container">
          <div className="container-fluid py-4">
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/medidores">Medidores</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{medidor?.medidor_codigo}</li>
              </ol>
            </nav>

            <div className="medidor-cover mb-4">
              <div className="medidor-cover-overlay">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="text-white mb-1">{medidor?.tipo} {medidor?.medidor_codigo}</h2>
                    <div className="text-white-50">{medidor?.marca} {medidor?.modelo} • S/N: {medidor?.numero_serie || '-'}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-light" size="sm" onClick={() => router.back()}><span className="material-icons">arrow_back</span></Button>
                    <Button variant="light" size="sm" onClick={() => router.push(`/medidores/${medidor?.id}/consumos`)}>Ver Consumos</Button>
                    <Button variant="outline-light" size="sm" onClick={() => router.push('/lecturas')}>Gestionar Lecturas</Button>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="cover-status">
                    {getStatusBadge(medidor?.estado)}
                  </div>
                  <div className="cover-stats">
                    <div className="cover-stat"><small>Última lectura</small><div className="fw-bold">{medidor?.ultima_lectura ?? '-'}</div></div>
                    <div className="cover-stat"><small>Consumo (últ.)</small><div className="fw-bold">{medidor?.ultimo_consumo ?? '-'}</div></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex border-bottom">
                <button className={`tab-medidor ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                  <span className="material-icons me-2">info</span>Información General
                </button>
                <button className={`tab-medidor ${activeTab === 'readings' ? 'active' : ''}`} onClick={() => setActiveTab('readings')}>
                  <span className="material-icons me-2">visibility</span>Lecturas Recientes
                </button>
                <button className={`tab-medidor ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>
                  <span className="material-icons me-2">build</span>Mantenimiento
                </button>
                <button className={`tab-medidor ${activeTab === 'specifications' ? 'active' : ''}`} onClick={() => setActiveTab('specifications')}>
                  <span className="material-icons me-2">engineering</span>Especificaciones
                </button>
              </div>
            </div>

            <div className="mt-4">
              {activeTab === 'overview' && (
                <Row className="g-4">
                  <Col lg={3}>
                    <div className="stat-card">
                      <div className="stat-icon"><span className="material-icons">bolt</span></div>
                      <div className="stat-value">{medidor?.ultima_lectura ?? '-'}</div>
                      <div className="stat-label">Última Lectura</div>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="stat-card">
                      <div className="stat-icon bg-success"><span className="material-icons">analytics</span></div>
                      <div className="stat-value">{medidor?.ultimo_consumo ?? '-'}</div>
                      <div className="stat-label">Consumo</div>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="stat-card">
                      <div className="stat-icon bg-warning"><span className="material-icons">schedule</span></div>
                      <div className="stat-value">{medidor?.proximo_mantenimiento ? new Date(medidor.proximo_mantenimiento).toLocaleDateString() : '-'}</div>
                      <div className="stat-label">Próximo Mantenimiento</div>
                    </div>
                  </Col>
                  <Col lg={3}>
                    <div className="stat-card">
                      <div className="stat-icon bg-info"><span className="material-icons">check_circle</span></div>
                      <div className="stat-value">{lecturas.length}</div>
                      <div className="stat-label">Lecturas</div>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="content-section">
                      <div className="content-section-header">
                        <h5 className="mb-0"><span className="material-icons me-2">info</span>Información del Medidor</h5>
                        {canManage() && <small className="text-muted">Acceso de gestión</small>}
                      </div>
                      <div className="content-section-body">
                        <div className="info-item"><span className="info-label">Código</span><span className="info-value">{medidor?.medidor_codigo}</span></div>
                        <div className="info-item"><span className="info-label">Número de Serie</span><span className="info-value">{medidor?.numero_serie}</span></div>
                        <div className="info-item"><span className="info-label">Marca y Modelo</span><span className="info-value">{medidor?.marca} {medidor?.modelo}</span></div>
                        <div className="info-item"><span className="info-label">Tipo</span><span className="info-value">{medidor?.tipo}</span></div>
                      </div>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="content-section">
                      <div className="content-section-header">
                        <h5 className="mb-0"><span className="material-icons me-2">location_on</span>Ubicación</h5>
                      </div>
                      <div className="content-section-body">
                        <div className="info-item"><span className="info-label">Comunidad</span><span className="info-value">{medidor?.comunidad_nombre}</span></div>
                        <div className="info-item"><span className="info-label">Edificio</span><span className="info-value">{medidor?.edificio}</span></div>
                        <div className="info-item"><span className="info-label">Unidad</span><span className="info-value">{medidor?.unidad}</span></div>
                        <div className="info-item"><span className="info-label">Posición</span><span className="info-value">{medidor?.posicion}</span></div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {activeTab === 'readings' && (
                <div className="content-section">
                  <div className="content-section-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"><span className="material-icons me-2">visibility</span>Últimas Lecturas</h5>
                    <Button variant="primary" size="sm" onClick={() => router.push(`/lecturas?medidor_id=${medidor?.id}`)}>Nueva Lectura</Button>
                  </div>
                  <div className="content-section-body p-0">
                    <Table hover className="mb-0">
                      <thead><tr><th>Fecha</th><th>Periodo</th><th>Lectura</th></tr></thead>
                      <tbody>
                        {lecturas.map(r => (
                          <tr key={r.id}>
                            <td>{new Date(r.fecha).toLocaleDateString()}</td>
                            <td>{r.periodo}</td>
                            <td className="fw-medium">{r.lectura.toLocaleString()}</td>
                            
                          </tr>
                        ))}
                        {lecturas.length === 0 && (<tr><td colSpan={4}>Sin lecturas</td></tr>)}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <Row className="g-4">
                  <Col lg={4}>
                    <div className="content-section">
                      <div className="content-section-header"><h6 className="mb-0"><span className="material-icons me-2">build</span>Estado de Mantenimiento</h6></div>
                      <div className="content-section-body">
                        <div className="info-item"><span className="info-label">Último Servicio</span><span className="info-value">{medidor?.ultimo_servicio ? new Date(medidor.ultimo_servicio).toLocaleDateString() : '-'}</span></div>
                        <div className="info-item"><span className="info-label">Próximo Servicio</span><span className="info-value">{medidor?.proximo_servicio ? new Date(medidor.proximo_servicio).toLocaleDateString() : '-'}</span></div>
                        <div className="info-item"><span className="info-label">Frecuencia</span><span className="info-value">{medidor?.frecuencia_mantenimiento}</span></div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={8}>
                    <div className="content-section">
                      <div className="content-section-header"><h6 className="mb-0"><span className="material-icons me-2">history</span>Historial de Mantenimiento</h6></div>
                      <div className="content-section-body p-0">
                        <Table className="mb-0">
                          <thead><tr><th>Fecha</th><th>Tipo</th><th>Técnico</th><th>Descripción</th><th>Costo</th><th>Estado</th></tr></thead>
                          <tbody>
                            {maintenanceHistory.map(rec => (
                              <tr key={rec.id}>
                                <td>{new Date(rec.fecha).toLocaleDateString()}</td>
                                <td>{rec.tipo}</td>
                                <td>{rec.tecnico}</td>
                                <td>{rec.descripcion}</td>
                                <td>${rec.costo.toLocaleString()}</td>
                                <td><span className={`badge ${rec.estado === 'completado' ? 'bg-success' : 'bg-warning'}`}>{rec.estado === 'completado' ? 'Completado' : 'Pendiente'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {activeTab === 'specifications' && (
                <div className="content-section">
                  <div className="content-section-header"><h5 className="mb-0"><span className="material-icons me-2">engineering</span>Especificaciones Técnicas</h5></div>
                  <div className="content-section-body">
                    <div className="info-item"><span className="info-label">Capacidad</span><span className="info-value">{medidor?.capacidad}</span></div>
                    <div className="info-item"><span className="info-label">Precisión</span><span className="info-value">{medidor?.precision}</span></div>
                    <div className="info-item"><span className="info-label">Comunicación</span><span className="info-value">{medidor?.tipo_comunicacion}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de configuración */}
        <Modal show={showConfigModal} onHide={() => setShowConfigModal(false)} size="lg" centered>
          <Modal.Header closeButton><Modal.Title>Configuración del Medidor</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group><Form.Label>Frecuencia</Form.Label>
                    <Form.Select value={config.readingFrequency} onChange={e => setConfig({ ...config, readingFrequency: e.target.value })}>
                      <option value="daily">Diaria</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group><Form.Label>Umbral consumo</Form.Label>
                    <Form.Control type="number" value={config.consumptionThreshold} onChange={e => setConfig({ ...config, consumptionThreshold: Number(e.target.value) })} />
                  </Form.Group>
                </Col>
                <Col md={6}><Form.Check type="switch" id="autoReading" label="Lectura automática" checked={config.autoReading} onChange={e => setConfig({ ...config, autoReading: e.target.checked })} /></Col>
                <Col md={6}><Form.Check type="switch" id="notifications" label="Notificaciones" checked={config.notifications} onChange={e => setConfig({ ...config, notifications: e.target.checked })} /></Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfigModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveConfiguration}>Guardar</Button>
          </Modal.Footer>
        </Modal>

      </Layout>
    </ProtectedRoute>
  );
}
