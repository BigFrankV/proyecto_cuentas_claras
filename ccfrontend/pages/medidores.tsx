import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Form,
  Badge,
  Table,
  Modal,
  Dropdown,
  Row,
  Col,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

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
  };
  community: {
    id: number;
    name: string;
  };
  installation: {
    date: string;
    technician: string;
    company: string;
  };
  lastReading: {
    value: number;
    date: string;
    consumption: number;
  };
  specifications: {
    capacity: string;
    precision: string;
    certification: string;
  };
  maintenance: {
    lastService: string;
    nextService: string;
    frequency: string;
  };
  alerts: {
    hasAlerts: boolean;
    count: number;
    severity: 'low' | 'medium' | 'high';
  };
  createdAt: string;
  updatedAt: string;
}

export default function MedidoresListado() {
  const router = useRouter();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMeters, setSelectedMeters] = useState<number[]>([]);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    building: '',
    community: '',
    brand: '',
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    loadMeters();
  }, []);

  const loadMeters = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMeters: Meter[] = [
        {
          id: 1,
          code: 'MED-ELC-001',
          serialNumber: 'SE2024001',
          type: 'electric',
          status: 'active',
          brand: 'Schneider Electric',
          model: 'iEM3155',
          location: {
            building: 'Torre A',
            floor: '1',
            unit: 'Apto 101',
            position: 'Tablero Principal',
          },
          community: {
            id: 1,
            name: 'Condominio Las Condes',
          },
          installation: {
            date: '2024-01-15',
            technician: 'Carlos Morales',
            company: 'Instalaciones Eléctricas SpA',
          },
          lastReading: {
            value: 15847,
            date: '2024-09-20',
            consumption: 245,
          },
          specifications: {
            capacity: '100 A',
            precision: 'Clase 1',
            certification: 'SEC Aprobado',
          },
          maintenance: {
            lastService: '2024-06-15',
            nextService: '2024-12-15',
            frequency: 'Semestral',
          },
          alerts: {
            hasAlerts: false,
            count: 0,
            severity: 'low',
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-09-20T14:30:00Z',
        },
        {
          id: 2,
          code: 'MED-AGU-002',
          serialNumber: 'AG2024015',
          type: 'water',
          status: 'active',
          brand: 'Elster Honeywell',
          model: 'V200H',
          location: {
            building: 'Torre A',
            floor: '2',
            unit: 'Apto 205',
            position: 'Medidor Individual',
          },
          community: {
            id: 1,
            name: 'Condominio Las Condes',
          },
          installation: {
            date: '2024-02-10',
            technician: 'Roberto Silva',
            company: 'Aguas Andinas Medidores',
          },
          lastReading: {
            value: 3247,
            date: '2024-09-18',
            consumption: 85,
          },
          specifications: {
            capacity: '15 mm',
            precision: 'R160',
            certification: 'SISS Certificado',
          },
          maintenance: {
            lastService: '2024-08-10',
            nextService: '2025-02-10',
            frequency: 'Anual',
          },
          alerts: {
            hasAlerts: true,
            count: 1,
            severity: 'medium',
          },
          createdAt: '2024-02-10T09:15:00Z',
          updatedAt: '2024-09-18T11:45:00Z',
        },
        {
          id: 3,
          code: 'MED-GAS-003',
          serialNumber: 'GS2024008',
          type: 'gas',
          status: 'maintenance',
          brand: 'Elster Instromet',
          model: 'BK-G4',
          location: {
            building: 'Torre B',
            floor: '3',
            unit: 'Apto 312',
            position: 'Medidor Gas Natural',
          },
          community: {
            id: 2,
            name: 'Residencial Vitacura',
          },
          installation: {
            date: '2023-11-20',
            technician: 'Miguel Espinoza',
            company: 'Metrogas Instalaciones',
          },
          lastReading: {
            value: 892,
            date: '2024-09-15',
            consumption: 45,
          },
          specifications: {
            capacity: '6 m³/h',
            precision: 'Clase 1.5',
            certification: 'CNE Aprobado',
          },
          maintenance: {
            lastService: '2024-09-10',
            nextService: '2024-09-25',
            frequency: 'Trimestral',
          },
          alerts: {
            hasAlerts: true,
            count: 2,
            severity: 'high',
          },
          createdAt: '2023-11-20T16:30:00Z',
          updatedAt: '2024-09-15T13:20:00Z',
        },
        {
          id: 4,
          code: 'MED-ELC-004',
          serialNumber: 'SE2024045',
          type: 'electric',
          status: 'active',
          brand: 'Landis+Gyr',
          model: 'E350',
          location: {
            building: 'Torre C',
            floor: '5',
            unit: 'Apto 508',
            position: 'Tablero Departamento',
          },
          community: {
            id: 3,
            name: 'Edificio Lo Barnechea',
          },
          installation: {
            date: '2024-03-05',
            technician: 'Andrea González',
            company: 'Enel Distribución',
          },
          lastReading: {
            value: 8234,
            date: '2024-09-22',
            consumption: 312,
          },
          specifications: {
            capacity: '80 A',
            precision: 'Clase 1',
            certification: 'SEC Homologado',
          },
          maintenance: {
            lastService: '2024-09-05',
            nextService: '2025-03-05',
            frequency: 'Anual',
          },
          alerts: {
            hasAlerts: false,
            count: 0,
            severity: 'low',
          },
          createdAt: '2024-03-05T12:00:00Z',
          updatedAt: '2024-09-22T16:15:00Z',
        },
        {
          id: 5,
          code: 'MED-AGU-005',
          serialNumber: 'AG2024032',
          type: 'water',
          status: 'inactive',
          brand: 'Sensus',
          model: 'iPERL',
          location: {
            building: 'Torre D',
            floor: '1',
            unit: 'Local 102',
            position: 'Medidor Comercial',
          },
          community: {
            id: 4,
            name: 'Centro Comercial Maipú',
          },
          installation: {
            date: '2023-08-15',
            technician: 'Francisco Torres',
            company: 'Servicios Hidráulicos Ltda.',
          },
          lastReading: {
            value: 12456,
            date: '2024-08-30',
            consumption: 0,
          },
          specifications: {
            capacity: '20 mm',
            precision: 'R250',
            certification: 'SISS Aprobado',
          },
          maintenance: {
            lastService: '2024-08-30',
            nextService: '2024-10-30',
            frequency: 'Bimestral',
          },
          alerts: {
            hasAlerts: true,
            count: 3,
            severity: 'high',
          },
          createdAt: '2023-08-15T14:45:00Z',
          updatedAt: '2024-08-30T10:30:00Z',
        },
      ];

      setMeters(mockMeters);
    } catch (error) {
      console.error('Error loading meters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Activo', class: 'status-active' },
      inactive: { text: 'Inactivo', class: 'status-inactive' },
      maintenance: { text: 'Mantenimiento', class: 'status-maintenance' },
    };

    const badge = badges[status as keyof typeof badges];
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      electric: {
        text: 'Eléctrico',
        class: 'type-electric',
        icon: 'electrical_services',
      },
      water: { text: 'Agua', class: 'type-water', icon: 'water_drop' },
      gas: { text: 'Gas', class: 'type-gas', icon: 'local_fire_department' },
    };

    const badge = badges[type as keyof typeof badges];
    return (
      <span className={`type-badge ${badge.class}`}>
        <span className='material-icons me-1' style={{ fontSize: '14px' }}>
          {badge.icon}
        </span>
        {badge.text}
      </span>
    );
  };

  const handleViewMeter = (meterId: number) => {
    router.push(`/medidores/${meterId}`);
  };

  const handleEditMeter = (meterId: number) => {
    router.push(`/medidores/editar/${meterId}`);
  };

  const handleDeleteMeter = (meter: Meter) => {
    setSelectedMeter(meter);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMeter) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMeters(prev => prev.filter(m => m.id !== selectedMeter.id));
      setShowDeleteModal(false);
      setSelectedMeter(null);
      alert('Medidor eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting meter:', error);
      alert('Error al eliminar el medidor');
    }
  };

  const filteredMeters = meters.filter(meter => {
    return (
      (meter.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        meter.serialNumber
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        meter.location.unit
          .toLowerCase()
          .includes(filters.search.toLowerCase())) &&
      (filters.type === '' || meter.type === filters.type) &&
      (filters.status === '' || meter.status === filters.status) &&
      (filters.building === '' ||
        meter.location.building
          .toLowerCase()
          .includes(filters.building.toLowerCase())) &&
      (filters.community === '' ||
        meter.community.name
          .toLowerCase()
          .includes(filters.community.toLowerCase())) &&
      (filters.brand === '' ||
        meter.brand.toLowerCase().includes(filters.brand.toLowerCase()))
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredMeters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMeters = filteredMeters.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const stats = {
    total: meters.length,
    active: meters.filter(m => m.status === 'active').length,
    inactive: meters.filter(m => m.status === 'inactive').length,
    maintenance: meters.filter(m => m.status === 'maintenance').length,
    withAlerts: meters.filter(m => m.alerts.hasAlerts).length,
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '60vh' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='text-muted'>Cargando medidores...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Medidores — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='medidores-container'>
          {/* Header */}
          <div className='page-header'>
            <div className='container-fluid'>
              <Row className='align-items-center'>
                <Col>
                  <h1 className='page-title'>
                    <span
                      className='material-icons me-3'
                      style={{ fontSize: '2.5rem' }}
                    >
                      speed
                    </span>
                    Gestión de Medidores
                  </h1>
                  <p className='page-subtitle'>
                    Control y monitoreo integral de medidores de servicios
                    básicos
                  </p>
                </Col>
                <Col xs='auto'>
                  <Button
                    variant='light'
                    size='lg'
                    onClick={() => router.push('/medidores/nuevo')}
                    className='btn-primary-custom'
                  >
                    <span className='material-icons me-2'>add</span>
                    Nuevo Medidor
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          <div className='container-fluid px-4'>
            {/* Stats Cards */}
            <Row className='stats-row g-3 mb-4'>
              <Col md={6} lg={3}>
                <Card className='stat-card total'>
                  <Card.Body>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>{stats.total}</div>
                        <div className='stat-label'>Total Medidores</div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                      >
                        <span className='material-icons'>speed</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} lg={3}>
                <Card className='stat-card active'>
                  <Card.Body>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>{stats.active}</div>
                        <div className='stat-label'>Activos</div>
                        <div className='stat-change positive'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '14px' }}
                          >
                            trending_up
                          </span>
                          +2% vs mes anterior
                        </div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#d4edda', color: '#155724' }}
                      >
                        <span className='material-icons'>check_circle</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} lg={3}>
                <Card className='stat-card maintenance'>
                  <Card.Body>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>{stats.maintenance}</div>
                        <div className='stat-label'>En mantenimiento</div>
                        <div className='stat-change'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '14px' }}
                          >
                            schedule
                          </span>
                          {stats.maintenance} pendientes
                        </div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#fff3cd', color: '#856404' }}
                      >
                        <span className='material-icons'>build</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} lg={3}>
                <Card className='stat-card inactive'>
                  <Card.Body>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>{stats.withAlerts}</div>
                        <div className='stat-label'>Con Alertas</div>
                        <div className='stat-change negative'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '14px' }}
                          >
                            warning
                          </span>
                          Requieren atención
                        </div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#f8d7da', color: '#721c24' }}
                      >
                        <span className='material-icons'>
                          notification_important
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filtros */}
            <div className='filters-panel'>
              <div className='filters-header'>
                <h6 className='mb-0'>
                  <span className='material-icons me-2'>filter_list</span>
                  Filtros de Búsqueda
                </h6>
              </div>
              <Row className='g-3'>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Buscar medidor</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Código, serie o ubicación...'
                      value={filters.search}
                      onChange={e =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                      value={filters.type}
                      onChange={e =>
                        setFilters({ ...filters, type: e.target.value })
                      }
                    >
                      <option value=''>Todos</option>
                      <option value='electric'>Eléctrico</option>
                      <option value='water'>Agua</option>
                      <option value='gas'>Gas</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={e =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value=''>Todos</option>
                      <option value='active'>Activo</option>
                      <option value='inactive'>Inactivo</option>
                      <option value='maintenance'>Mantenimiento</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Edificio</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Torre, edificio...'
                      value={filters.building}
                      onChange={e =>
                        setFilters({ ...filters, building: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Marca</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Schneider, Elster...'
                      value={filters.brand}
                      onChange={e =>
                        setFilters({ ...filters, brand: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Controles de vista */}
            <div className='view-controls'>
              <div className='d-flex align-items-center gap-3'>
                <span className='text-muted'>
                  {filteredMeters.length} medidores encontrados
                </span>
                {selectedMeters.length > 0 && (
                  <div className='d-flex align-items-center gap-2'>
                    <span className='text-primary-custom'>
                      {selectedMeters.length} seleccionados
                    </span>
                    <Dropdown>
                      <Dropdown.Toggle variant='outline-primary' size='sm'>
                        Acciones
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>
                          <span className='material-icons me-2'>build</span>
                          Programar mantenimiento
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <span className='material-icons me-2'>
                            visibility
                          </span>
                          Generar lecturas
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>
                          <span className='material-icons me-2'>
                            file_download
                          </span>
                          Exportar seleccionados
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}
              </div>
              <div className='d-flex align-items-center gap-2'>
                <span className='text-muted small'>Vista:</span>
                <div className='btn-group' role='group'>
                  <Button
                    variant={
                      viewMode === 'table' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    onClick={() => setViewMode('table')}
                  >
                    <span className='material-icons'>view_list</span>
                  </Button>
                  <Button
                    variant={
                      viewMode === 'grid' ? 'primary' : 'outline-primary'
                    }
                    size='sm'
                    onClick={() => setViewMode('grid')}
                  >
                    <span className='material-icons'>grid_view</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Vista de tabla */}
            {viewMode === 'table' && (
              <div className='medidores-table'>
                <div className='table-header'>
                  <h5 className='table-title'>
                    <span className='material-icons'>speed</span>
                    Medidores
                  </h5>
                  <Button variant='outline-secondary' size='sm'>
                    <span className='material-icons me-1'>file_download</span>
                    Exportar
                  </Button>
                </div>
                <div className='table-responsive'>
                  <Table hover className='custom-table mb-0'>
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Ubicación</th>
                        <th>Marca/Modelo</th>
                        <th>Última Lectura</th>
                        <th>Mantenimiento</th>
                        <th>Alertas</th>
                        <th className='text-end'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMeters.map(meter => (
                        <tr key={meter.id} className='data-row'>
                          <td>
                            <div className='fw-medium'>{meter.code}</div>
                            <small className='text-muted'>
                              S/N: {meter.serialNumber}
                            </small>
                          </td>
                          <td>{getTypeBadge(meter.type)}</td>
                          <td>{getStatusBadge(meter.status)}</td>
                          <td>
                            <div className='fw-medium'>
                              {meter.location.building}
                            </div>
                            <small className='text-muted'>
                              {meter.location.unit} - {meter.location.position}
                            </small>
                          </td>
                          <td>
                            <div className='fw-medium'>{meter.brand}</div>
                            <small className='text-muted'>{meter.model}</small>
                          </td>
                          <td>
                            <div className='fw-medium'>
                              {meter.lastReading.value.toLocaleString()}
                            </div>
                            <small className='text-muted'>
                              {new Date(
                                meter.lastReading.date,
                              ).toLocaleDateString()}{' '}
                              • {meter.lastReading.consumption} kWh
                            </small>
                          </td>
                          <td>
                            <small className='text-muted'>
                              Próximo:{' '}
                              {new Date(
                                meter.maintenance.nextService,
                              ).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            {meter.alerts.hasAlerts ? (
                              <span
                                className={`alert-indicator alert-${meter.alerts.severity === 'high' ? 'danger' : meter.alerts.severity === 'medium' ? 'warning' : 'success'}`}
                              ></span>
                            ) : (
                              <span className='alert-indicator alert-success'></span>
                            )}
                            {meter.alerts.count > 0 && (
                              <small className='text-muted'>
                                {meter.alerts.count}
                              </small>
                            )}
                          </td>
                          <td className='text-end'>
                            <div className='d-flex gap-1 justify-content-end'>
                              <Button
                                variant='outline-info'
                                size='sm'
                                className='action-button'
                                onClick={() => handleViewMeter(meter.id)}
                              >
                                <span className='material-icons'>
                                  visibility
                                </span>
                              </Button>
                              <Button
                                variant='outline-primary'
                                size='sm'
                                className='action-button'
                                onClick={() =>
                                  router.push(`/medidores/${meter.id}/consumos`)
                                }
                              >
                                <span className='material-icons'>
                                  analytics
                                </span>
                              </Button>
                              <Button
                                variant='outline-success'
                                size='sm'
                                className='action-button'
                                onClick={() =>
                                  router.push(`/medidores/${meter.id}/lecturas`)
                                }
                              >
                                <span className='material-icons'>
                                  visibility
                                </span>
                              </Button>
                              <Button
                                variant='outline-danger'
                                size='sm'
                                className='action-button'
                                onClick={() => handleDeleteMeter(meter)}
                              >
                                <span className='material-icons'>delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            {/* Vista Grid */}
            {viewMode === 'grid' && (
              <Row className='g-3 mb-4'>
                {paginatedMeters.map(meter => (
                  <Col key={meter.id} lg={6} xl={4}>
                    <div className={`meter-card type-${meter.type}`}>
                      <div className='card-header'>
                        <div>
                          <h6 className='card-title'>{meter.code}</h6>
                          <small className='card-subtitle'>
                            S/N: {meter.serialNumber}
                          </small>
                        </div>
                        <div className='text-end'>
                          {getStatusBadge(meter.status)}
                        </div>
                      </div>

                      <div className='d-flex gap-2 mb-3'>
                        {getTypeBadge(meter.type)}
                        {meter.alerts.hasAlerts && (
                          <Badge
                            bg={
                              meter.alerts.severity === 'high'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {meter.alerts.count} alerta
                            {meter.alerts.count > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      <div className='meter-info'>
                        <div className='meter-info-item'>
                          <span className='material-icons'>location_on</span>
                          <span>
                            {meter.location.building} - {meter.location.unit}
                          </span>
                        </div>
                        <div className='meter-info-item'>
                          <span className='material-icons'>business</span>
                          <span>
                            {meter.brand} {meter.model}
                          </span>
                        </div>
                        <div className='meter-info-item'>
                          <span className='material-icons'>schedule</span>
                          <span>
                            Próximo servicio:{' '}
                            {new Date(
                              meter.maintenance.nextService,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className='meter-stats'>
                        <Row>
                          <Col xs={6}>
                            <div className='stat-value'>
                              {meter.lastReading.value.toLocaleString()}
                            </div>
                            <div className='stat-label'>Última lectura</div>
                          </Col>
                          <Col xs={6}>
                            <div className='stat-value'>
                              {meter.lastReading.consumption}
                            </div>
                            <div className='stat-label'>Consumo (kWh)</div>
                          </Col>
                        </Row>
                      </div>

                      <div className='card-actions'>
                        <Button
                          variant='outline-info'
                          size='sm'
                          onClick={() => handleViewMeter(meter.id)}
                        >
                          <span className='material-icons'>visibility</span>
                        </Button>
                        <Button
                          variant='outline-primary'
                          size='sm'
                          onClick={() =>
                            router.push(`/medidores/${meter.id}/consumos`)
                          }
                        >
                          <span className='material-icons'>analytics</span>
                        </Button>
                        <Button
                          variant='outline-success'
                          size='sm'
                          onClick={() =>
                            router.push(`/medidores/${meter.id}/lecturas`)
                          }
                        >
                          <span className='material-icons'>visibility</span>
                        </Button>
                        <Button
                          variant='outline-danger'
                          size='sm'
                          onClick={() => handleDeleteMeter(meter)}
                        >
                          <span className='material-icons'>delete</span>
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className='d-flex justify-content-between align-items-center mt-4'>
                <span className='text-muted'>
                  Mostrando {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredMeters.length)}{' '}
                  de {filteredMeters.length} medidores
                </span>
                <nav>
                  <ul className='pagination'>
                    <li
                      className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <span className='material-icons'>chevron_left</span>
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button
                          className='page-link'
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <span className='material-icons'>chevron_right</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>

          {/* Modal de eliminación */}
          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title className='text-danger'>
                <span className='material-icons me-2'>delete</span>
                Eliminar Medidor
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedMeter && (
                <>
                  <div className='alert alert-danger'>
                    <span className='material-icons me-2'>warning</span>
                    Esta acción no se puede deshacer. El medidor será eliminado
                    permanentemente.
                  </div>
                  <p>
                    ¿Estás seguro de que deseas eliminar el medidor{' '}
                    <strong>"{selectedMeter.code}"</strong>?
                  </p>
                  <p className='text-muted'>
                    Esto también eliminará todo el historial de lecturas y
                    consumos asociados.
                  </p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='outline-secondary'
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button variant='danger' onClick={confirmDelete}>
                <span className='material-icons me-2'>delete</span>
                Eliminar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
