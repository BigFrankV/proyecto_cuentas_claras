import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Row, Col, Tab, Tabs, Badge, Table, Form, Modal } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

interface Meter {
  id: number;
  code: string;
  serialNumber: string;
  type: 'electric' | 'water' | 'gas';
  status: 'active' | 'inactive' | 'maintenance';
  brand: string;
  model: string;
  location: {
    building: string;
    floor: string;
    unit: string;
    position: string;
    coordinates?: string;
  };
  community: {
    id: number;
    name: string;
    address: string;
  };
  installation: {
    date: string;
    technician: string;
    company: string;
    warranty: string;
    certificate: string;
  };
  lastReading: {
    value: number;
    date: string;
    consumption: number;
    period: string;
  };
  specifications: {
    capacity: string;
    precision: string;
    certification: string;
    operatingTemp: string;
    maxPressure?: string;
    communicationType: string;
  };
  maintenance: {
    lastService: string;
    nextService: string;
    frequency: string;
    serviceCompany: string;
    notes?: string;
  };
  alerts: {
    hasAlerts: boolean;
    count: number;
    severity: 'low' | 'medium' | 'high';
    lastAlert?: string;
  };
  configuration: {
    readingFrequency: string;
    alertThresholds: {
      consumption: number;
      pressure?: number;
      temperature?: number;
    };
    autoReading: boolean;
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface Reading {
  id: number;
  date: string;
  value: number;
  consumption: number;
  reader: string;
  method: 'manual' | 'automatic';
  status: 'valid' | 'estimated' | 'error';
  notes?: string;
}

interface MaintenanceRecord {
  id: number;
  date: string;
  type: 'preventive' | 'corrective' | 'calibration';
  technician: string;
  company: string;
  description: string;
  cost: number;
  parts?: string[];
  nextService?: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function MeterDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [meter, setMeter] = useState<Meter | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState({
    readingFrequency: 'monthly',
    autoReading: true,
    notifications: true,
    consumptionThreshold: 0,
    pressureThreshold: 0,
    temperatureThreshold: 0
  });

  useEffect(() => {
    if (id) {
      loadMeterData();
    }
  }, [id]);

  const loadMeterData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMeter: Meter = {
        id: parseInt(id as string),
        code: `MED-ELC-${String(id).padStart(3, '0')}`,
        serialNumber: `SE2024${String(id).padStart(3, '0')}`,
        type: 'electric',
        status: 'active',
        brand: 'Schneider Electric',
        model: 'iEM3155',
        location: {
          building: 'Torre A',
          floor: '5',
          unit: 'Apto 502',
          position: 'Tablero Principal',
          coordinates: '-33.4489, -70.6693'
        },
        community: {
          id: 1,
          name: 'Condominio Las Condes',
          address: 'Av. Las Condes 12345, Las Condes, Santiago'
        },
        installation: {
          date: '2024-01-15',
          technician: 'Carlos Morales Electricista',
          company: 'Instalaciones Eléctricas Las Condes SpA',
          warranty: '2027-01-15',
          certificate: 'SEC-2024-001234'
        },
        lastReading: {
          value: 15847,
          date: '2024-09-20',
          consumption: 245,
          period: 'Septiembre 2024'
        },
        specifications: {
          capacity: '100 A',
          precision: 'Clase 1 (±1%)',
          certification: 'SEC Aprobado - IEC 62053-21',
          operatingTemp: '-25°C a +55°C',
          maxPressure: 'N/A',
          communicationType: 'RS485 / Modbus RTU'
        },
        maintenance: {
          lastService: '2024-06-15',
          nextService: '2024-12-15',
          frequency: 'Semestral',
          serviceCompany: 'Servicios Técnicos Schneider Chile',
          notes: 'Medidor en excelente estado. Calibración dentro de parámetros.'
        },
        alerts: {
          hasAlerts: false,
          count: 0,
          severity: 'low'
        },
        configuration: {
          readingFrequency: 'monthly',
          alertThresholds: {
            consumption: 500,
            temperature: 60
          },
          autoReading: true,
          notifications: true
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-09-20T14:30:00Z'
      };

      const mockReadings: Reading[] = [
        {
          id: 1,
          date: '2024-09-20',
          value: 15847,
          consumption: 245,
          reader: 'Sistema Automático',
          method: 'automatic',
          status: 'valid',
          notes: 'Lectura automática mensual'
        },
        {
          id: 2,
          date: '2024-08-20',
          value: 15602,
          consumption: 238,
          reader: 'María González',
          method: 'manual',
          status: 'valid',
          notes: 'Lectura manual verificada'
        },
        {
          id: 3,
          date: '2024-07-20',
          value: 15364,
          consumption: 252,
          reader: 'Sistema Automático',
          method: 'automatic',
          status: 'valid'
        },
        {
          id: 4,
          date: '2024-06-20',
          value: 15112,
          consumption: 189,
          reader: 'José Martínez',
          method: 'manual',
          status: 'estimated',
          notes: 'Lectura estimada por acceso restringido'
        }
      ];

      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: 1,
          date: '2024-06-15',
          type: 'preventive',
          technician: 'Roberto Silva',
          company: 'Servicios Técnicos Schneider Chile',
          description: 'Mantenimiento preventivo semestral. Limpieza, calibración y verificación de conexiones.',
          cost: 85000,
          parts: ['Kit limpieza contactos', 'Grasa dieléctrica'],
          nextService: '2024-12-15',
          status: 'completed'
        },
        {
          id: 2,
          date: '2024-01-20',
          type: 'corrective',
          technician: 'Andrea López',
          company: 'Enel Distribución Chile',
          description: 'Reemplazo de display digital defectuoso. Actualización de firmware.',
          cost: 125000,
          parts: ['Display LCD', 'Módulo comunicación'],
          status: 'completed'
        }
      ];

      setMeter(mockMeter);
      setReadings(mockReadings);
      setMaintenanceHistory(mockMaintenance);
      
      // Configurar valores iniciales del formulario
      setConfig({
        readingFrequency: mockMeter.configuration.readingFrequency,
        autoReading: mockMeter.configuration.autoReading,
        notifications: mockMeter.configuration.notifications,
        consumptionThreshold: mockMeter.configuration.alertThresholds.consumption,
        pressureThreshold: mockMeter.configuration.alertThresholds.pressure || 0,
        temperatureThreshold: mockMeter.configuration.alertThresholds.temperature || 0
      });
      
    } catch (error) {
      console.error('Error loading meter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Activo', variant: 'success' },
      inactive: { text: 'Inactivo', variant: 'danger' },
      maintenance: { text: 'Mantenimiento', variant: 'warning' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.active;
    return <Badge bg={badge.variant}>{badge.text}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      electric: { text: 'Eléctrico', icon: 'electrical_services', color: '#ffc107' },
      water: { text: 'Agua', icon: 'water_drop', color: '#007bff' },
      gas: { text: 'Gas', icon: 'local_fire_department', color: '#dc3545' }
    };
    
    const badge = badges[type as keyof typeof badges];
    return (
      <div className="d-flex align-items-center">
        <span className="material-icons me-2" style={{ color: badge.color }}>{badge.icon}</span>
        <strong>{badge.text}</strong>
      </div>
    );
  };

  const getReadingStatusBadge = (status: string) => {
    const badges = {
      valid: { text: 'Válida', variant: 'success' },
      estimated: { text: 'Estimada', variant: 'warning' },
      error: { text: 'Error', variant: 'danger' }
    };
    
    const badge = badges[status as keyof typeof badges];
    return <Badge bg={badge.variant} className="text-white">{badge.text}</Badge>;
  };

  const handleSaveConfiguration = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowConfigModal(false);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error al guardar la configuración');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted">Cargando información del medidor...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!meter) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container-fluid p-4">
            <div className="alert alert-danger">
              <span className="material-icons me-2">error</span>
              No se pudo cargar la información del medidor.
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Medidor {meter.code} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className="medidores-container">
          <div className="container-fluid px-4">
            {/* Header del medidor */}
            <div className="meter-header">
              <div className="meter-info-section">
                <Row className="align-items-start">
                  <Col md={8}>
                    <div className="d-flex align-items-center mb-3">
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="me-3"
                      >
                        <span className="material-icons">arrow_back</span>
                      </Button>
                      <div>
                        <h1 className="meter-title">
                          {getTypeBadge(meter.type)} {meter.code}
                        </h1>
                        <p className="meter-subtitle">
                          S/N: {meter.serialNumber} • {meter.brand} {meter.model}
                        </p>
                      </div>
                    </div>

                    <Row className="g-4">
                      <Col sm={6}>
                        <div>
                          <h6 className="text-muted mb-2">Estado actual</h6>
                          <div className="d-flex align-items-center gap-2">
                            {getStatusBadge(meter.status)}
                            {meter.alerts.hasAlerts && (
                              <Badge bg="warning">{meter.alerts.count} alertas</Badge>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div>
                          <h6 className="text-muted mb-2">Ubicación</h6>
                          <div>
                            <div className="fw-medium">{meter.location.building} - {meter.location.unit}</div>
                            <small className="text-muted">{meter.location.position}</small>
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div>
                          <h6 className="text-muted mb-2">Última lectura</h6>
                          <div>
                            <div className="fw-medium fs-5">{meter.lastReading.value.toLocaleString()}</div>
                            <small className="text-muted">
                              {new Date(meter.lastReading.date).toLocaleDateString()} • 
                              {meter.lastReading.consumption} kWh consumidos
                            </small>
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div>
                          <h6 className="text-muted mb-2">Próximo mantenimiento</h6>
                          <div>
                            <div className="fw-medium">{new Date(meter.maintenance.nextService).toLocaleDateString()}</div>
                            <small className="text-muted">{meter.maintenance.frequency}</small>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col md={4}>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        onClick={() => router.push(`/medidores/${meter.id}/consumos`)}
                      >
                        <span className="material-icons me-2">analytics</span>
                        Ver Consumos
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => router.push(`/medidores/${meter.id}/lecturas`)}
                      >
                        <span className="material-icons me-2">visibility</span>
                        Gestionar Lecturas
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setShowConfigModal(true)}
                      >
                        <span className="material-icons me-2">settings</span>
                        Configuración
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Tabs de navegación */}
              <div className="meter-tabs">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k || 'overview')}
                  className="mb-0"
                >
                  <Tab eventKey="overview" title="Información General" />
                  <Tab eventKey="readings" title="Lecturas Recientes" />
                  <Tab eventKey="maintenance" title="Mantenimiento" />
                  <Tab eventKey="specifications" title="Especificaciones" />
                </Tabs>
              </div>
            </div>

            {/* Contenido de los tabs */}
            <div className="mt-4">
              {activeTab === 'overview' && (
                <Row className="g-4">
                  <Col lg={6}>
                    <div className="info-card">
                      <h5 className="info-card-title">
                        <span className="material-icons">info</span>
                        Información del Medidor
                      </h5>
                      <div className="info-item">
                        <span className="info-label">Código</span>
                        <span className="info-value">{meter.code}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Número de Serie</span>
                        <span className="info-value">{meter.serialNumber}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Marca y Modelo</span>
                        <span className="info-value">{meter.brand} {meter.model}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Tipo de Medidor</span>
                        <span className="info-value">{meter.type === 'electric' ? 'Eléctrico' : meter.type === 'water' ? 'Agua' : 'Gas'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Estado</span>
                        <span className="info-value">{getStatusBadge(meter.status)}</span>
                      </div>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="info-card">
                      <h5 className="info-card-title">
                        <span className="material-icons">location_on</span>
                        Ubicación e Instalación
                      </h5>
                      <div className="info-item">
                        <span className="info-label">Comunidad</span>
                        <span className="info-value">{meter.community.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Edificio</span>
                        <span className="info-value">{meter.location.building}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Unidad</span>
                        <span className="info-value">{meter.location.unit} - Piso {meter.location.floor}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Posición</span>
                        <span className="info-value">{meter.location.position}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Fecha de Instalación</span>
                        <span className="info-value">{new Date(meter.installation.date).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Técnico Instalador</span>
                        <span className="info-value">{meter.installation.technician}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Empresa Instaladora</span>
                        <span className="info-value">{meter.installation.company}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}

              {activeTab === 'readings' && (
                <div className="readings-table">
                  <div className="table-header">
                    <h5 className="table-title">
                      <span className="material-icons">visibility</span>
                      Últimas Lecturas
                    </h5>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => router.push(`/medidores/${meter.id}/lecturas`)}
                    >
                      <span className="material-icons me-1">add</span>
                      Nueva Lectura
                    </Button>
                  </div>
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Lectura</th>
                        <th>Consumo</th>
                        <th>Método</th>
                        <th>Estado</th>
                        <th>Responsable</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map((reading) => (
                        <tr key={reading.id}>
                          <td>{new Date(reading.date).toLocaleDateString()}</td>
                          <td className="fw-medium">{reading.value.toLocaleString()}</td>
                          <td>
                            <span className="fw-medium">{reading.consumption}</span>
                            <small className="text-muted ms-1">kWh</small>
                          </td>
                          <td>
                            <span className={`badge ${reading.method === 'automatic' ? 'bg-info' : 'bg-secondary'}`}>
                              {reading.method === 'automatic' ? 'Automático' : 'Manual'}
                            </span>
                          </td>
                          <td>{getReadingStatusBadge(reading.status)}</td>
                          <td>{reading.reader}</td>
                          <td>
                            <small className="text-muted">{reading.notes || '-'}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <Row className="g-4">
                  <Col lg={4}>
                    <div className="info-card">
                      <h5 className="info-card-title">
                        <span className="material-icons">build</span>
                        Estado de Mantenimiento
                      </h5>
                      <div className="info-item">
                        <span className="info-label">Último Servicio</span>
                        <span className="info-value">{new Date(meter.maintenance.lastService).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Próximo Servicio</span>
                        <span className="info-value">{new Date(meter.maintenance.nextService).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Frecuencia</span>
                        <span className="info-value">{meter.maintenance.frequency}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Empresa de Servicio</span>
                        <span className="info-value">{meter.maintenance.serviceCompany}</span>
                      </div>
                      {meter.maintenance.notes && (
                        <div className="info-item">
                          <span className="info-label">Notas</span>
                          <span className="info-value">
                            <small className="text-muted">{meter.maintenance.notes}</small>
                          </span>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col lg={8}>
                    <div className="info-card">
                      <h5 className="info-card-title">
                        <span className="material-icons">history</span>
                        Historial de Mantenimiento
                      </h5>
                      <div className="table-responsive">
                        <Table className="mb-0">
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
                            {maintenanceHistory.map((record) => (
                              <tr key={record.id}>
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge ${
                                    record.type === 'preventive' ? 'bg-success' :
                                    record.type === 'corrective' ? 'bg-warning' : 'bg-info'
                                  }`}>
                                    {record.type === 'preventive' ? 'Preventivo' :
                                     record.type === 'corrective' ? 'Correctivo' : 'Calibración'}
                                  </span>
                                </td>
                                <td>
                                  <div>{record.technician}</div>
                                  <small className="text-muted">{record.company}</small>
                                </td>
                                <td>
                                  <div>{record.description}</div>
                                  {record.parts && record.parts.length > 0 && (
                                    <small className="text-muted">
                                      Repuestos: {record.parts.join(', ')}
                                    </small>
                                  )}
                                </td>
                                <td className="fw-medium">${record.cost.toLocaleString()}</td>
                                <td>
                                  <span className={`badge ${record.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                    {record.status === 'completed' ? 'Completado' : 'Pendiente'}
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
                <Row className="g-4">
                  <Col lg={6}>
                    <div className="info-card">
                      <h5 className="info-card-title">
                        <span className="material-icons">engineering</span>
                        Especificaciones Técnicas
                      </h5>
                      <div className="info-item">
                        <span className="info-label">Capacidad</span>
                        <span className="info-value">{meter.specifications.capacity}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Precisión</span>
                        <span className="info-value">{meter.specifications.precision}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Certificación</span>
                        <span className="info-value">{meter.specifications.certification}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Temperatura Operación</span>
                        <span className="info-value">{meter.specifications.operatingTemp}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Comunicación</span>
                        <span className="info-value">{meter.specifications.communicationType}</span>
                      </div>
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="info-card">
                      <h5 className="info-card-title">
                        <span className="material-icons">verified</span>
                        Certificación y Garantía
                      </h5>
                      <div className="info-item">
                        <span className="info-label">Certificado de Instalación</span>
                        <span className="info-value">{meter.installation.certificate}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Garantía hasta</span>
                        <span className="info-value">{new Date(meter.installation.warranty).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Fecha de Creación</span>
                        <span className="info-value">{new Date(meter.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Última Actualización</span>
                        <span className="info-value">{new Date(meter.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          </div>

          {/* Modal de configuración */}
          <Modal show={showConfigModal} onHide={() => setShowConfigModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>
                <span className="material-icons me-2">settings</span>
                Configuración del Medidor
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Frecuencia de Lectura</Form.Label>
                      <Form.Select
                        value={config.readingFrequency}
                        onChange={(e) => setConfig({...config, readingFrequency: e.target.value})}
                      >
                        <option value="daily">Diaria</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Umbral de Consumo (kWh)</Form.Label>
                      <Form.Control
                        type="number"
                        value={config.consumptionThreshold}
                        onChange={(e) => setConfig({...config, consumptionThreshold: parseInt(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="autoReading"
                      label="Lectura Automática"
                      checked={config.autoReading}
                      onChange={(e) => setConfig({...config, autoReading: e.target.checked})}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="notifications"
                      label="Notificaciones de Alertas"
                      checked={config.notifications}
                      onChange={(e) => setConfig({...config, notifications: e.target.checked})}
                    />
                  </Col>
                  {meter.type === 'water' && (
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Umbral de Presión (bar)</Form.Label>
                        <Form.Control
                          type="number"
                          value={config.pressureThreshold}
                          onChange={(e) => setConfig({...config, pressureThreshold: parseInt(e.target.value)})}
                        />
                      </Form.Group>
                    </Col>
                  )}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Umbral de Temperatura (°C)</Form.Label>
                      <Form.Control
                        type="number"
                        value={config.temperatureThreshold}
                        onChange={(e) => setConfig({...config, temperatureThreshold: parseInt(e.target.value)})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setShowConfigModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveConfiguration}>
                <span className="material-icons me-2">save</span>
                Guardar Configuración
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}