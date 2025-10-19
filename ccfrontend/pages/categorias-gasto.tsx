import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Form, Badge, Table, Modal } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import { useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';
import { listCategorias } from '@/lib/categoriasGastoService';
import { CategoriaGasto } from '@/types/categoriasGasto';

interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  community: string;
  status: 'active' | 'inactive';
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriasGastoListado() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, currentRole } = usePermissions();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoriaGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    community: '',
    status: ''
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });

  // Obtener comunidadId dinámicamente (igual que en gastos)
  const resolvedComunidadId = useMemo(() => {
    // Siempre usar endpoint global /categorias-gasto - el backend filtra
    return undefined;
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCategories();
    }
  }, [authLoading, isAuthenticated]);

  const loadCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await listCategorias(resolvedComunidadId);
      console.log('API Response:', response); // <-- añadir
      console.log('Response data:', response.data); // <-- añadir
      setCategories(response.data);
      setPagination(response.pagination);
      console.log('Categories set:', response.data); // <-- añadir
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge bg="success">Activa</Badge>
    ) : (
      <Badge bg="secondary">Inactiva</Badge>
    );
  };

  const handleEditCategory = (categoryId: number) => {
    router.push(`/categorias-gasto/editar/${categoryId}`);
  };

  const handleDeleteCategory = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      alert('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  // Cambiar filteredCategories para usar categories del estado
  const filteredCategories = categories.filter(category => {
    // Aplicar filtros locales si es necesario
    return true; // Por ahora, filtros en backend
  });

  // Paginación
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: categories.length,
    active: categories.filter(cat => cat.status === 'active').length,
    recent: categories.filter(cat => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 30);
      return new Date(cat.createdAt) > weekAgo;
    }).length
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Categorías de Gasto — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className="categories-container">
          {/* Header */}
          <div className="categories-header">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h1 className="categories-title">
                  <span className="material-icons me-2">category</span>
                  Categorías de Gasto
                </h1>
                <p className="categories-subtitle">
                  Gestiona las categorías para clasificar los gastos de la comunidad
                </p>
              </div>
              <Button 
                variant="light" 
                onClick={() => router.push('/categorias-gasto/nueva')}
              >
                <span className="material-icons me-2">add</span>
                Nueva Categoría
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="filters-panel">
            <div className="row g-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Buscar categoría</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre de la categoría..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
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
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <Button variant="outline-primary" className="w-100">
                  <span className="material-icons me-1">filter_list</span>
                  Filtrar
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Total Categorías</h6>
                      <h3 className="mt-2 mb-0">{stats.total}</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                      <span className="material-icons">category</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Categorías Activas</h6>
                      <h3 className="mt-2 mb-0">{stats.active}</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}>
                      <span className="material-icons">check_circle</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="info-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Último Mes</h6>
                      <h3 className="mt-2 mb-0">+{stats.recent}</h3>
                    </div>
                    <div className="icon-box" style={{ backgroundColor: '#e1f5fe', color: '#0288d1' }}>
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
                  {filteredCategories.length} categorías encontradas
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
            <div className="categories-table">
              <div className="table-header">
                <h5 className="table-title">
                  <span className="material-icons">category</span>
                  Categorías de Gasto
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
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Comunidad</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.map((category) => (
                      <tr key={category.id} className="data-row">
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="fw-medium">{category.nombre}</span>
                          </div>
                        </td>
                        <td>{category.nombre}</td> {/* Descripción como nombre por ahora */}
                        <td>{category.comunidad}</td>
                        <td>{getStatusBadge(category.status)}</td>
                        <td className="text-end">
                          <div className="d-flex gap-1 justify-content-end">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="action-button"
                              onClick={() => handleEditCategory(category.id)}
                            >
                              <span className="material-icons">edit</span>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="action-button"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <span className="material-icons">delete</span>
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

          {/* Vista de tarjetas */}
          {viewMode === 'grid' && (
            <div className="row">
              {paginatedCategories.map((category) => (
                <div key={category.id} className="col-lg-6 col-xl-4 mb-3">
                  <div className="data-card">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          className="category-icon me-3"
                          style={{ 
                            backgroundColor: category.color,
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: '24px' }}>
                            {category.icon}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="data-card-title mb-0">{category.name}</h6>
                          <small className="text-muted">{category.community}</small>
                        </div>
                      </div>
                      
                      <p className="data-card-subtitle mb-3">{category.description}</p>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        {getStatusBadge(category.status)}
                        <div className="data-card-actions">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditCategory(category.id)}
                          >
                            <span className="material-icons">edit</span>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <span className="material-icons">delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCategories.length)} de {filteredCategories.length} categorías
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
              Eliminar Categoría
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCategory && (
              <>
                <div className="alert alert-danger">
                  <span className="material-icons me-2">warning</span>
                  Esta acción no se puede deshacer. La categoría será eliminada permanentemente.
                </div>
                <p>¿Estás seguro de que deseas eliminar la categoría <strong>"{selectedCategory.name}"</strong>?</p>
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
