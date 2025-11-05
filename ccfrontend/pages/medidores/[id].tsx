import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Tab,
  Tabs,
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
import { useAuth } from '@/lib/useAuth';
import { ProtectedRoute } from '@/lib/useAuth';
import type { Medidor, Reading } from '@/types/medidores';

export default function MedidorDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [lecturas, setLecturas] = useState<Reading[]>([]);
  const [consumos, setConsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fecha: '', lectura: '', periodo: '' });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState({
    alertThreshold: '',
    maintenanceInterval: '',
    autoReadings: false,
    readingFrequency: 'monthly',
    consumptionThreshold: 0,
    autoReading: false,
    notifications: true,
    pressureThreshold: 0,
    temperatureThreshold: 0,
  });

  // Historial de mantenimiento de ejemplo
  const maintenanceHistory = [
    {
      id: 1,
      date: '2024-01-15',
      fecha: '2024-01-15',
      type: 'preventivo',
      tipo: 'preventivo',
      description: 'Mantenimiento preventivo',
      descripcion: 'Mantenimiento preventivo',
      tecnico: 'Juan Pérez',
      empresa: 'ServicTech',
      repuestos: [],
      costo: 25000,
      estado: 'completado',
    },
    {
      id: 2,
      date: '2024-06-10',
      fecha: '2024-06-10',
      type: 'correctivo',
      tipo: 'correctivo',
      description: 'Ajuste de calibración',
      descripcion: 'Ajuste de calibración',
      tecnico: 'María González',
      empresa: 'MeterCare',
      repuestos: ['Sensor de presión'],
      costo: 45000,
      estado: 'completado',
    },
  ];

  // Función para obtener el badge de estado
  const getStatusBadge = (estado?: string) => {
    switch (estado) {
      case 'activo':
        return <Badge bg='success'>Activo</Badge>;
      case 'inactivo':
        return <Badge bg='danger'>Inactivo</Badge>;
      case 'mantenimiento':
        return <Badge bg='warning'>Mantenimiento</Badge>;
      default:
        return <Badge bg='secondary'>Desconocido</Badge>;
    }
  };

  // Función para guardar la configuración
  const handleSaveConfiguration = async () => {
    try {
      // TODO: Implementar guardado de configuración
      // eslint-disable-next-line no-console
      console.log('Guardando configuración:', config);
      setShowConfigModal(false);
      alert('Configuración guardada exitosamente');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error guardando configuración:', err);
      alert('Error al guardar la configuración');
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
        setConsumos(Array.isArray(consResp) ? consResp : (consResp?.data ?? []));
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
      // refrescar lecturas y medidor
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
    if (!medidor) {
      return;
    }
    if (!confirm('Eliminar medidor? (si tiene lecturas, será desactivado)')) {
      return;
    }
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

  if (!id) {
    return <div>Cargando id...</div>;
  }
  if (loading && !medidor) {
    return <div>Cargando...</div>;
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Medidor {medidor?.medidor_codigo} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='medidores-container'>
          <div className='container-fluid px-4'>
            {/* Header del medidor */}
            <div className='meter-header'>
              <div className='meter-info-section'>
                <Row className='align-items-start'>
                  <Col md={8}>
                    <div className='d-flex align-items-center mb-3'>
                      <Button
                        variant='outline-secondary'
                        size='sm'
                        onClick={() => router.back()}
                        className='me-3'
                      >
                        <span className='material-icons'>arrow_back</span>
                      </Button>
                      <div>
                        <h1 className='meter-title'>
                          {medidor?.tipo} {medidor?.medidor_codigo}
                        </h1>
                        <p className='meter-subtitle'>
                          S/N: {medidor?.numero_serie} • {medidor?.marca}{' '}
                          {medidor?.modelo}
                        </p>
                      </div>
                    </div>

                    <Row className='g-4'>
                      <Col sm={6}>
                        <div>
                          <h6 className='text-muted mb-2'>Estado actual</h6>
                          <div className='d-flex align-items-center gap-2'>
                            {medidor?.estado === 'activo' && (
                              <Badge bg='success'>Activo</Badge>
                            )}
                            {medidor?.estado === 'inactivo' && (
                              <Badge bg='danger'>Inactivo</Badge>
                            )}
                            {medidor?.estado === 'mantenimiento' && (
                              <Badge bg='warning'>Mantenimiento</Badge>
                            )}
                            {medidor?.alertas && medidor.alertas.length > 0 && (
                              <Badge bg='warning'>
                                {medidor.alertas.length} alertas
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div>
                          <h6 className='text-muted mb-2'>Ubicación</h6>
                          <div>
                            <div className='fw-medium'>
                              {medidor?.edificio} - {medidor?.unidad}
                            </div>
                            <small className='text-muted'>
                              {medidor?.posicion}
                            </small>
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div>
                          <h6 className='text-muted mb-2'>Última lectura</h6>
                          <div>
                            <div className='fw-medium fs-5'>
                              {medidor?.ultima_lectura
                                ? medidor.ultima_lectura
                                : '-'}
                            </div>
                            <small className='text-muted'>
                              {medidor?.ultimo_consumo
                                ? `• ${medidor.ultimo_consumo} kWh consumidos`
                                : ''}
                            </small>
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div>
                          <h6 className='text-muted mb-2'>
                            Próximo mantenimiento
                          </h6>
                          <div>
                            <div className='fw-medium'>
                              {medidor?.proximo_mantenimiento
                                ? medidor.proximo_mantenimiento
                                : '-'}
                            </div>
                            <small className='text-muted'>
                              {medidor?.frecuencia_mantenimiento}
                            </small>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col md={4}>
                    <div className='d-grid gap-2'>
                      <Button
                        variant='primary'
                        onClick={() =>
                          router.push(`/medidores/${medidor.id}/consumos`)
                        }
                      >
                        <span className='material-icons me-2'>analytics</span>
                        Ver Consumos
                      </Button>
                      <Button
                        variant='outline-primary'
                        onClick={() =>
                          router.push(`/medidores/${medidor.id}/lecturas`)
                        }
                      >
                        <span className='material-icons me-2'>visibility</span>
                        Gestionar Lecturas
                      </Button>
                      <Button
                        variant='outline-secondary'
                        onClick={() => setShowConfigModal(true)}
                      >
                        <span className='material-icons me-2'>settings</span>
                        Configuración
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Tabs de navegación */}
              <div className='meter-tabs'>
                <Tabs
                  activeKey={activeTab}
                  onSelect={k => setActiveTab(k || 'overview')}
                  className='mb-0'
                >
                  <Tab eventKey='overview' title='Información General' />
                  <Tab eventKey='readings' title='Lecturas Recientes' />
                  <Tab eventKey='maintenance' title='Mantenimiento' />
                  <Tab eventKey='specifications' title='Especificaciones' />
                </Tabs>
              </div>
            </div>

            {/* Contenido de los tabs */}
            <div className='mt-4'>
              {activeTab === 'overview' && (
                <Row className='g-4'>
                  <Col lg={6}>
                    <div className='info-card'>
                      <h5 className='info-card-title'>
                        <span className='material-icons'>info</span>
                        Información del Medidor
                      </h5>
                      <div className='info-item'>
                        <span className='info-label'>Código</span>
                        <span className='info-value'>
                          {medidor?.medidor_codigo}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Número de Serie</span>
                        <span className='info-value'>
                          {medidor?.numero_serie}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Marca y Modelo</span>
                        <span className='info-value'>
                          {medidor?.marca} {medidor?.modelo}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Tipo de Medidor</span>
                        <span className='info-value'>
                          {medidor?.tipo === 'electrico'
                            ? 'Eléctrico'
                            : medidor?.tipo === 'agua'
                              ? 'Agua'
                              : 'Gas'}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Estado</span>
                        <span className='info-value'>
                          {getStatusBadge(medidor?.estado)}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className='info-card'>
                      <h5 className='info-card-title'>
                        <span className='material-icons'>location_on</span>
                        Ubicación e Instalación
                      </h5>
                      <div className='info-item'>
                        <span className='info-label'>Comunidad</span>
                        <span className='info-value'>
                          {medidor?.comunidad_nombre}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Edificio</span>
                        <span className='info-value'>{medidor?.edificio}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Unidad</span>
                        <span className='info-value'>
                          {medidor?.unidad} - Piso {medidor?.piso}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Posición</span>
                        <span className='info-value'>{medidor?.posicion}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Fecha de Instalación</span>
                        <span className='info-value'>
                          {new Date(
                            medidor?.fecha_instalacion,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Técnico Instalador</span>
                        <span className='info-value'>
                          {medidor?.tecnico_instalador}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Empresa Instaladora</span>
                        <span className='info-value'>
                          {medidor?.empresa_instaladora}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {activeTab === 'readings' && (
                <div className='readings-table'>
                  <div className='table-header'>
                    <h5 className='table-title'>
                      <span className='material-icons'>visibility</span>
                      Últimas Lecturas
                    </h5>
                    <Button
                      variant='primary'
                      size='sm'
                      onClick={() =>
                        router.push(`/medidores/${medidor.id}/lecturas`)
                      }
                    >
                      <span className='material-icons me-1'>add</span>
                      Nueva Lectura
                    </Button>
                  </div>
                  <Table hover className='mb-0'>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Periodo</th>
                        <th>Lectura</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lecturas.map(reading => (
                        <tr key={reading.id}>
                          <td>
                            {new Date(reading.fecha).toLocaleDateString()}
                          </td>
                          <td>{reading.periodo}</td>
                          <td className='fw-medium'>
                            {reading.lectura.toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                reading.status === 'valida'
                                  ? 'bg-success'
                                  : reading.status === 'estimada'
                                    ? 'bg-warning'
                                    : 'bg-danger'
                              }`}
                            >
                              {reading.status === 'valida'
                                ? 'Válida'
                                : reading.status === 'estimada'
                                  ? 'Estimada'
                                  : 'Error'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {lecturas.length === 0 && (
                        <tr>
                          <td colSpan={4}>Sin lecturas</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <Row className='g-4'>
                  <Col lg={4}>
                    <div className='info-card'>
                      <h5 className='info-card-title'>
                        <span className='material-icons'>build</span>
                        Estado de Mantenimiento
                      </h5>
                      <div className='info-item'>
                        <span className='info-label'>Último Servicio</span>
                        <span className='info-value'>
                          {new Date(
                            medidor?.ultimo_servicio,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Próximo Servicio</span>
                        <span className='info-value'>
                          {new Date(
                            medidor?.proximo_servicio,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Frecuencia</span>
                        <span className='info-value'>
                          {medidor?.frecuencia_mantenimiento}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Empresa de Servicio</span>
                        <span className='info-value'>
                          {medidor?.empresa_servicio}
                        </span>
                      </div>
                      {medidor?.notas_servicio && (
                        <div className='info-item'>
                          <span className='info-label'>Notas</span>
                          <span className='info-value'>
                            <small className='text-muted'>
                              {medidor.notas_servicio}
                            </small>
                          </span>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={8}>
                    <div className='info-card'>
                      <h5 className='info-card-title'>
                        <span className='material-icons'>history</span>
                        Historial de Mantenimiento
                      </h5>
                      <div className='table-responsive'>
                        <Table className='mb-0'>
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Tipo</th>
                              <th>Técnico</th>
                              <th>Descripción</th>
                              <th>Costo</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {maintenanceHistory.map(record => (
                              <tr key={record.id}>
                                <td>
                                  {new Date(record.fecha).toLocaleDateString()}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      record.tipo === 'preventivo'
                                        ? 'bg-success'
                                        : record.tipo === 'correctivo'
                                          ? 'bg-warning'
                                          : 'bg-info'
                                    }`}
                                  >
                                    {record.tipo === 'preventivo'
                                      ? 'Preventivo'
                                      : record.tipo === 'correctivo'
                                        ? 'Correctivo'
                                        : 'Calibración'}
                                  </span>
                                </td>
                                <td>
                                  <div>{record.tecnico}</div>
                                  <small className='text-muted'>
                                    {record.empresa}
                                  </small>
                                </td>
                                <td>
                                  <div>{record.descripcion}</div>
                                  {record.repuestos &&
                                    record.repuestos.length > 0 && (
                                      <small className='text-muted'>
                                        Repuestos: {record.repuestos.join(', ')}
                                      </small>
                                    )}
                                </td>
                                <td className='fw-medium'>
                                  ${record.costo.toLocaleString()}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      record.estado === 'completado'
                                        ? 'bg-success'
                                        : 'bg-warning'
                                    }`}
                                  >
                                    {record.estado === 'completado'
                                      ? 'Completado'
                                      : 'Pendiente'}
                                  </span>
                                </td>
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
                <Row className='g-4'>
                  <Col lg={6}>
                    <div className='info-card'>
                      <h5 className='info-card-title'>
                        <span className='material-icons'>engineering</span>
                        Especificaciones Técnicas
                      </h5>
                      <div className='info-item'>
                        <span className='info-label'>Capacidad</span>
                        <span className='info-value'>{medidor?.capacidad}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Precisión</span>
                        <span className='info-value'>{medidor?.precision}</span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Certificación</span>
                        <span className='info-value'>
                          {medidor?.certificacion}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>
                          Temperatura Operación
                        </span>
                        <span className='info-value'>
                          {medidor?.temperatura_operacion}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Comunicación</span>
                        <span className='info-value'>
                          {medidor?.tipo_comunicacion}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className='info-card'>
                      <h5 className='info-card-title'>
                        <span className='material-icons'>verified</span>
                        Certificación y Garantía
                      </h5>
                      <div className='info-item'>
                        <span className='info-label'>
                          Certificado de Instalación
                        </span>
                        <span className='info-value'>
                          {medidor?.certificado_instalacion}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Garantía hasta</span>
                        <span className='info-value'>
                          {new Date(
                            medidor?.garantia_hasta,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Fecha de Creación</span>
                        <span className='info-value'>
                          {new Date(
                            medidor?.fecha_creacion,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='info-item'>
                        <span className='info-label'>Última Actualización</span>
                        <span className='info-value'>
                          {new Date(
                            medidor?.ultima_actualizacion,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          </div>

          {/* Modal de configuración */}
          <Modal
            show={showConfigModal}
            onHide={() => setShowConfigModal(false)}
            size='lg'
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <span className='material-icons me-2'>settings</span>
                Configuración del Medidor
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row className='g-3'>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Frecuencia de Lectura</Form.Label>
                      <Form.Select
                        value={config.readingFrequency}
                        onChange={e =>
                          setConfig({
                            ...config,
                            readingFrequency: e.target.value,
                          })
                        }
                      >
                        <option value='daily'>Diaria</option>
                        <option value='weekly'>Semanal</option>
                        <option value='monthly'>Mensual</option>
                        <option value='quarterly'>Trimestral</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Umbral de Consumo (kWh)</Form.Label>
                      <Form.Control
                        type='number'
                        value={config.consumptionThreshold}
                        onChange={e =>
                          setConfig({
                            ...config,
                            consumptionThreshold: parseInt(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type='switch'
                      id='autoReading'
                      label='Lectura Automática'
                      checked={config.autoReading}
                      onChange={e =>
                        setConfig({ ...config, autoReading: e.target.checked })
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type='switch'
                      id='notifications'
                      label='Notificaciones de Alertas'
                      checked={config.notifications}
                      onChange={e =>
                        setConfig({
                          ...config,
                          notifications: e.target.checked,
                        })
                      }
                    />
                  </Col>
                  {medidor?.tipo === 'agua' && (
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Umbral de Presión (bar)</Form.Label>
                        <Form.Control
                          type='number'
                          value={config.pressureThreshold}
                          onChange={e =>
                            setConfig({
                              ...config,
                              pressureThreshold: parseInt(e.target.value),
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  )}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Umbral de Temperatura (°C)</Form.Label>
                      <Form.Control
                        type='number'
                        value={config.temperatureThreshold}
                        onChange={e =>
                          setConfig({
                            ...config,
                            temperatureThreshold: parseInt(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='outline-secondary'
                onClick={() => setShowConfigModal(false)}
              >
                Cancelar
              </Button>
              <Button variant='primary' onClick={handleSaveConfiguration}>
                <span className='material-icons me-2'>save</span>
                Guardar Configuración
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
