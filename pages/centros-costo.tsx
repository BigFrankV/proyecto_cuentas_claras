import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Form, Badge, Table, Modal, Dropdown } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

interface CostCenter {
  id: number;
  name: string;
  description: string;
  department: 'operations' | 'administration' | 'marketing' | 'maintenance' | 'security';
  manager: string;
  budget: number;
  spent: number;
  community: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  responsibilities: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CentrosCostoListado() {
  const router = useRouter();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCenter, setSelectedCenter] = useState<CostCenter | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    community: '',
    status: ''
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadCostCenters();
  }, []);

  const loadCostCenters = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCostCenters: CostCenter[] = [
        {
          id: 1,
          name: 'Mantenimiento Edificio A',
          description: 'Centro de costo para mantenimiento general del edificio A',
          department: 'maintenance',
          manager: 'Carlos Rodriguez',
          budget: 50000,
          spent: 32500,
          community: 'Comunidad Parque Real',
          icon: 'build',
          color: '#2196F3',
          status: 'active',
          responsibilities: ['Reparaciones', 'Pintura', 'Plomería', 'Electricidad'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-03-20T14:25:00Z'
        },
        {
          id: 2,
          name: 'Seguridad y Vigilancia',
          description: 'Gastos relacionados con seguridad de toda la comunidad',
          department: 'security',
          manager: 'Ana García',
          budget: 80000,
          spent: 71200,
          community: 'Todas',
          icon: 'security',
          color: '#F44336',
          status: 'active',
          responsibilities: ['Vigilancia 24/7', 'Cámaras CCTV', 'Control de acceso', 'Guardias'],
          createdAt: '2024-01-20T09:15:00Z',
          updatedAt: '2024-03-18T16:45:00Z'
        },
        {
          id: 3,
          name: 'Administración General',
          description: 'Gastos administrativos y de gestión',
          department: 'administration',
          manager: 'Patricia Contreras',
          budget: 30000,
          spent: 18750,
          community: 'Todas',
          icon: 'business',
          color: '#4CAF50',
          status: 'active',
          responsibilities: ['Contabilidad', 'Recursos Humanos', 'Gestión documental', 'Legal'],
          createdAt: '2024-02-01T11:20:00Z',
          updatedAt: '2024-03-15T13:30:00Z'
        },
        {
          id: 4,
          name: 'Operaciones Torre B',
          description: 'Operaciones y servicios específicos de la Torre B',
          department: 'operations',
          manager: 'Miguel Torres',
          budget: 40000,
          spent: 35600,
          community: 'Edificio Central',
          icon: 'apartment',
          color: '#FF9800',
          status: 'active',
          responsibilities: ['Limpieza', 'Conserjería', 'Mantenimiento menor', 'Servicios'],
          createdAt: '2024-02-10T14:45:00Z',
          updatedAt: '2024-03-22T10:15:00Z'
        },
        {
          id: 5,
          name: 'Marketing y Comunicaciones',
          description: 'Promoción y comunicación interna/externa',
          department: 'marketing',
          manager: 'Laura Mendoza',
          budget: 15000,
          spent: 8900,
          community: 'Todas',
          icon: 'campaign',
          color: '#9C27B0',
          status: 'active',
          responsibilities: ['Publicidad', 'Eventos', 'Newsletter', 'Redes sociales'],
          createdAt: '2024-02-15T16:30:00Z',
          updatedAt: '2024-03-19T12:20:00Z'
        },
        {
          id: 6,
          name: 'Jardinería y Áreas Verdes',
          description: 'Mantenimiento de jardines y espacios verdes',
          department: 'maintenance',
          manager: 'Roberto Silva',
          budget: 25000,
          spent: 22300,
          community: 'Comunidad Parque Real',
          icon: 'park',
          color: '#009688',
          status: 'active',
          responsibilities: ['Poda', 'Riego', 'Abono', 'Diseño paisajístico'],
          createdAt: '2024-02-20T08:45:00Z',
          updatedAt: '2024-03-17T15:10:00Z'
        },
        {
          id: 7,
          name: 'Piscina y Recreación',
          description: 'Mantenimiento de áreas recreativas',
          department: 'operations',
          manager: 'Carmen López',
          budget: 20000,
          spent: 14500,
          community: 'Comunidad Parque Real',
          icon: 'pool',
          color: '#03A9F4',
          status: 'active',
          responsibilities: ['Limpieza piscina', 'Químicos', 'Equipos', 'Salvavidas'],
          createdAt: '2024-03-01T10:00:00Z',
          updatedAt: '2024-03-21T14:35:00Z'
        },
        {
          id: 8,
          name: 'Servicios Básicos',
          description: 'Gestión de servicios básicos (agua, luz, gas)',
          department: 'operations',
          manager: 'Diego Ramírez',
          budget: 60000,
          spent: 51200,
          community: 'Todas',
          icon: 'electrical_services',
          color: '#FF5722',
          status: 'active',
          responsibilities: ['Electricidad', 'Agua', 'Gas', 'Internet'],
          createdAt: '2024-01-25T12:15:00Z',
          updatedAt: '2024-03-16T09:40:00Z'
        },
        {
          id: 9,
          name: 'Emergencias y Contingencias',
          description: 'Fondo para situaciones de emergencia',
          department: 'administration',
          manager: 'Isabel Morales',
          budget: 35000,
          spent: 12400,
          community: 'Todas',
          icon: 'emergency',
          color: '#E91E63',
          status: 'active',
          responsibilities: ['Reparaciones urgentes', 'Contingencias', 'Seguros', 'Emergencias'],
          createdAt: '2024-01-30T15:20:00Z',
          updatedAt: '2024-03-14T11:55:00Z'
        },
        {
          id: 10,
          name: 'Tecnología y Sistemas',
          description: 'Infraestructura tecnológica y sistemas',
          department: 'administration',
          manager: 'Fernando Castro',
          budget: 22000,
          spent: 16800,
          community: 'Todas',
          icon: 'computer',
          color: '#673AB7',
          status: 'inactive',
          responsibilities: ['Software', 'Hardware', 'Redes', 'Soporte técnico'],
          createdAt: '2024-02-05T13:40:00Z',
          updatedAt: '2024-03-12T17:25:00Z'
        }
      ];
      
      setCostCenters(mockCostCenters);
    } catch (error) {
      console.error('Error loading cost centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentBadge = (department: string) => {
    const badges = {
      operations: { bg: 'success', text: 'Operaciones' },
      administration: { bg: 'primary', text: 'Administración' },
      marketing: { bg: 'warning', text: 'Marketing' },
      maintenance: { bg: 'secondary', text: 'Mantenimiento' },
      security: { bg: 'danger', text: 'Seguridad' }
    };
    
    const badge = badges[department as keyof typeof badges];
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  const getBudgetStatus = (budget: number, spent: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 90) return { badge: 'over', text: 'Sobrepresupuesto', color: '#C62828' };
    if (percentage > 75) return { badge: 'on-target', text: 'En objetivo', color: '#1565C0' };
    return { badge: 'under', text: 'Bajo presupuesto', color: '#2E7D32' };
  };

  const handleEditCenter = (centerId: number) => {
    router.push(`/centros-costo/editar/${centerId}`);
  };

  const handleViewCenter = (centerId: number) => {
    router.push(`/centros-costo/${centerId}`);
  };

  const handleDeleteCenter = (center: CostCenter) => {
    setSelectedCenter(center);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCenter) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCostCenters(prev => prev.filter(center => center.id !== selectedCenter.id));
      setShowDeleteModal(false);
      setSelectedCenter(null);
      alert('Centro de costo eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting cost center:', error);
      alert('Error al eliminar el centro de costo');
    }
  };

  const filteredCenters = costCenters.filter(center => {
    return (
      center.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.department === '' || center.department === filters.department) &&
      (filters.community === '' || center.community === filters.community) &&
      (filters.status === '' || center.status === filters.status)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCenters = filteredCenters.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: costCenters.length,
    active: costCenters.filter(c => c.status === 'active').length,
    totalBudget: costCenters.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: costCenters.reduce((sum, c) => sum + c.spent, 0)
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Centros de Costo — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className="cost-centers-container">
          {/* Header */}
          <div className="cost-centers-header">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h1 className="cost-centers-title">
                  <span className="material-icons me-2">account_balance</span>
                  Centros de Costo
                </h1>
                <p className="cost-centers-subtitle">
                  Gestiona los centros de costo para el control presupuestario
                </p>
              </div>
              <Button 
                variant="light" 
                onClick={() => router.push('/centros-costo/nuevo')}
              >
                <span className="material-icons me-2">add</span>
                Nuevo Centro de Costo
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="filters-panel">
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Buscar centro</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del centro..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Departamento</Form.Label>
                  <Form.Select
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                  >
                    <option value="">Todos los departamentos</option>
                    <option value="operations">Operaciones</option>
                    <option value="administration">Administración</option>
                    <option value="marketing">Marketing</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="security">Seguridad</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Comunidad</Form.Label>
                  <Form.Select
                    value={filters.community}
                    onChange={(e) => setFilters({...filters, community: e.target.value})}
                  >
                    <option value="">Todas las comunidades</option>
                    <option value="Todas">Todas</option>
                    <option value="Comunidad Parque Real">Comunidad Parque Real</option>
                    <option value="Edificio Central">Edificio Central</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Total Centros</h6>
                      <h3 className="mt-2 mb-0">{stats.total}</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                      <span className="material-icons">account_balance</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Centros Activos</h6>
                      <h3 className="mt-2 mb-0">{stats.active}</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}>
                      <span className="material-icons">check_circle</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Presupuesto Total</h6>
                      <h3 className="mt-2 mb-0">${(stats.totalBudget / 1000).toFixed(0)}K</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                      <span className="material-icons">account_balance_wallet</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Ejecutado</h6>
                      <h3 className="mt-2 mb-0">${(stats.totalSpent / 1000).toFixed(0)}K</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
                      <span className="material-icons">trending_up</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* View Options */}
          <div className="view-options">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="text-muted">
                  {filteredCenters.length} centros de costo encontrados
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="btn-group" role="group">
                  <Button 
                    variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <span className="material-icons">view_list</span>
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <span className="material-icons">grid_view</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Vista de tabla */}
          {viewMode === 'table' && (
            <div className="cost-centers-table">
              <div className="table-header">
                <h5 className="table-title">
                  <span className="material-icons">account_balance</span>
                  Centros de Costo
                </h5>
                <Button variant="outline-secondary" size="sm">
                  <span className="material-icons me-1">file_download</span>
                  Exportar
                </Button>
              </div>
              <div className="table-responsive">
                <Table hover className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Centro</th>
                      <th>Departamento</th>
                      <th>Responsable</th>
                      <th>Presupuesto</th>
                      <th>Ejecutado</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCenters.map((center) => {
                      const budgetStatus = getBudgetStatus(center.budget, center.spent);
                      const percentage = (center.spent / center.budget) * 100;
                      
                      return (
                        <tr key={center.id} className="data-row">
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="center-icon me-3"
                                style={{ 
                                  backgroundColor: center.color,
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white'
                                }}
                              >
                                <span className="material-icons" style={{ fontSize: '18px' }}>
                                  {center.icon}
                                </span>
                              </div>
                              <div>
                                <div className="fw-medium">{center.name}</div>
                                <small className="text-muted">{center.community}</small>
                              </div>
                            </div>
                          </td>
                          <td>{getDepartmentBadge(center.department)}</td>
                          <td>{center.manager}</td>
                          <td>
                            <div className="fw-medium">${center.budget.toLocaleString()}</div>
                          </td>
                          <td>
                            <div className="fw-medium">${center.spent.toLocaleString()}</div>
                            <div className="progress mt-1" style={{ height: '4px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${Math.min(percentage, 100)}%`,
                                  backgroundColor: budgetStatus.color
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">{percentage.toFixed(1)}%</small>
                          </td>
                          <td>
                            <Badge bg={center.status === 'active' ? 'success' : 'secondary'}>
                              {center.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <Button 
                                variant="outline-info" 
                                size="sm" 
                                className="action-button"
                                onClick={() => handleViewCenter(center.id)}
                              >
                                <span className="material-icons">visibility</span>
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="action-button"
                                onClick={() => handleEditCenter(center.id)}
                              >
                                <span className="material-icons">edit</span>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="action-button"
                                onClick={() => handleDeleteCenter(center)}
                              >
                                <span className="material-icons">delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {viewMode === 'grid' && (
            <div className="row">
              {paginatedCenters.map((center) => {
                const budgetStatus = getBudgetStatus(center.budget, center.spent);
                const percentage = (center.spent / center.budget) * 100;
                
                return (
                  <div key={center.id} className="col-lg-6 col-xl-4 mb-3">
                    <div className="data-card">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div 
                            className="center-icon me-3"
                            style={{ 
                              backgroundColor: center.color,
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '24px' }}>
                              {center.icon}
                            </span>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="data-card-title mb-0">{center.name}</h6>
                            <small className="text-muted">{center.community}</small>
                          </div>
                          <Badge bg={center.status === 'active' ? 'success' : 'secondary'}>
                            {center.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          {getDepartmentBadge(center.department)}
                          <small className="text-muted d-block mt-1">
                            Responsable: {center.manager}
                          </small>
                        </div>
                        
                        <div className="budget-info mb-3">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Presupuesto</span>
                            <span className="fw-medium">${center.budget.toLocaleString()}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Ejecutado</span>
                            <span className="fw-medium">${center.spent.toLocaleString()}</span>
                          </div>
                          <div className="progress mb-2" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: budgetStatus.color
                              }}
                            ></div>
                          </div>
                          <small style={{ color: budgetStatus.color }}>
                            {percentage.toFixed(1)}% ejecutado
                          </small>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {center.responsibilities.length} responsabilidades
                          </small>
                          <div className="data-card-actions">
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={() => handleViewCenter(center.id)}
                            >
                              <span className="material-icons">visibility</span>
                            </Button>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleEditCenter(center.id)}
                            >
                              <span className="material-icons">edit</span>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteCenter(center)}
                            >
                              <span className="material-icons">delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCenters.length)} de {filteredCenters.length} centros
              </span>
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="material-icons">chevron_left</span>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="material-icons">chevron_right</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>

        {/* Modal de eliminación */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <span className="material-icons me-2">delete</span>
              Eliminar Centro de Costo
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCenter && (
              <>
                <div className="alert alert-danger">
                  <span className="material-icons me-2">warning</span>
                  Esta acción no se puede deshacer. El centro de costo será eliminado permanentemente.
                </div>
                <p>¿Estás seguro de que deseas eliminar el centro de costo <strong>"{selectedCenter.name}"</strong>?</p>
                <p className="text-muted">
                  Esto también eliminará toda la información relacionada con este centro, incluyendo su historial de gastos.
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="outline-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger"
              onClick={confirmDelete}
            >
              <span className="material-icons me-2">delete</span>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
