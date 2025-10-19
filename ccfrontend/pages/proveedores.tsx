import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Form,
  Table,
  Modal,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface Provider {
  id: number;
  name: string;
  businessName: string;
  category: 'supplies' | 'services' | 'construction' | 'others';
  rif: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  logo?: string;
  totalContracts: number;
  totalAmount: number;
  lastContract: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProveedoresListado() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProviders: Provider[] = [
        {
          id: 1,
          name: 'Constructora ABC',
          businessName: 'ABC Construcciones C.A.',
          category: 'construction',
          rif: 'J-12345678-9',
          phone: '+58 212 555-0123',
          email: 'contacto@abcconstrucciones.com',
          address: 'Av. Principal, Torre Centro, Piso 15, Caracas',
          status: 'active',
          rating: 4.5,
          logo: '',
          totalContracts: 15,
          totalAmount: 2500000,
          lastContract: '2024-03-15T10:30:00Z',
          createdAt: '2023-06-15T10:30:00Z',
          updatedAt: '2024-03-20T14:25:00Z',
        },
        {
          id: 2,
          name: 'Servicios Limpieza Total',
          businessName: 'Limpieza Total Services C.A.',
          category: 'services',
          rif: 'J-98765432-1',
          phone: '+58 212 555-0456',
          email: 'admin@limpiezatotal.com',
          address: 'Calle 2, Edificio Comercial, Local 5, Valencia',
          status: 'active',
          rating: 4.8,
          logo: '',
          totalContracts: 32,
          totalAmount: 850000,
          lastContract: '2024-03-22T16:45:00Z',
          createdAt: '2023-04-20T09:15:00Z',
          updatedAt: '2024-03-22T16:45:00Z',
        },
        {
          id: 3,
          name: 'Suministros El Progreso',
          businessName: 'Distribuidora El Progreso S.R.L.',
          category: 'supplies',
          rif: 'J-56789012-3',
          phone: '+58 212 555-0789',
          email: 'ventas@elprogreso.com',
          address: 'Zona Industrial Los Ruices, Galpón 12, Caracas',
          status: 'active',
          rating: 4.2,
          logo: '',
          totalContracts: 28,
          totalAmount: 1200000,
          lastContract: '2024-03-18T11:20:00Z',
          createdAt: '2023-08-10T14:30:00Z',
          updatedAt: '2024-03-18T11:20:00Z',
        },
        {
          id: 4,
          name: 'Mantenimiento Integral Pro',
          businessName: 'Pro Maintenance Solutions C.A.',
          category: 'services',
          rif: 'J-34567890-1',
          phone: '+58 212 555-0321',
          email: 'info@promantenimiento.com',
          address: 'Av. Libertador, Centro Profesional, Torre B, Piso 8',
          status: 'active',
          rating: 4.6,
          logo: '',
          totalContracts: 45,
          totalAmount: 1800000,
          lastContract: '2024-03-20T09:30:00Z',
          createdAt: '2023-02-28T16:45:00Z',
          updatedAt: '2024-03-20T09:30:00Z',
        },
        {
          id: 5,
          name: 'Seguridad Privada Elite',
          businessName: 'Elite Security Services C.A.',
          category: 'services',
          rif: 'J-78901234-5',
          phone: '+58 212 555-0654',
          email: 'contacto@elitesecurity.com',
          address: 'Urb. Las Mercedes, Edificio Corporativo, Piso 12',
          status: 'active',
          rating: 4.9,
          logo: '',
          totalContracts: 8,
          totalAmount: 3200000,
          lastContract: '2024-03-10T15:15:00Z',
          createdAt: '2023-11-15T10:00:00Z',
          updatedAt: '2024-03-10T15:15:00Z',
        },
        {
          id: 6,
          name: 'Jardinería Paisajes Verdes',
          businessName: 'Paisajes Verdes Jardinería C.A.',
          category: 'services',
          rif: 'J-23456789-0',
          phone: '+58 212 555-0987',
          email: 'jardines@paisajesverdes.com',
          address: 'Carretera Nacional, Km 15, Vivero Central',
          status: 'active',
          rating: 4.3,
          logo: '',
          totalContracts: 22,
          totalAmount: 650000,
          lastContract: '2024-03-14T12:45:00Z',
          createdAt: '2023-07-05T08:30:00Z',
          updatedAt: '2024-03-14T12:45:00Z',
        },
        {
          id: 7,
          name: 'Electricidad Moderna',
          businessName: 'Instalaciones Eléctricas Moderna C.A.',
          category: 'services',
          rif: 'J-67890123-4',
          phone: '+58 212 555-0147',
          email: 'servicios@electricidadmoderna.com',
          address: 'Calle Industrial, Zona Este, Galpón 25',
          status: 'pending',
          rating: 0,
          logo: '',
          totalContracts: 0,
          totalAmount: 0,
          lastContract: '',
          createdAt: '2024-03-01T14:20:00Z',
          updatedAt: '2024-03-01T14:20:00Z',
        },
        {
          id: 8,
          name: 'Pinturas y Acabados Finos',
          businessName: 'Acabados Finos Pintura S.R.L.',
          category: 'construction',
          rif: 'J-45678901-2',
          phone: '+58 212 555-0258',
          email: 'presupuestos@acabadosfinos.com',
          address: 'Av. San Martín, Local Comercial 15-A',
          status: 'active',
          rating: 4.4,
          logo: '',
          totalContracts: 18,
          totalAmount: 950000,
          lastContract: '2024-03-12T10:15:00Z',
          createdAt: '2023-09-20T11:45:00Z',
          updatedAt: '2024-03-12T10:15:00Z',
        },
        {
          id: 9,
          name: 'Tecnología e Informática Global',
          businessName: 'Global Tech Solutions C.A.',
          category: 'others',
          rif: 'J-89012345-6',
          phone: '+58 212 555-0369',
          email: 'soporte@globaltech.com',
          address: 'Centro Empresarial, Torre Tecnológica, Piso 20',
          status: 'active',
          rating: 4.7,
          logo: '',
          totalContracts: 12,
          totalAmount: 1400000,
          lastContract: '2024-03-25T13:30:00Z',
          createdAt: '2023-05-12T09:00:00Z',
          updatedAt: '2024-03-25T13:30:00Z',
        },
        {
          id: 10,
          name: 'Ferretería Industrial Mayor',
          businessName: 'Distribuidora Ferretera Mayor C.A.',
          category: 'supplies',
          rif: 'J-01234567-8',
          phone: '+58 212 555-0741',
          email: 'ventas@ferreteriamayor.com',
          address: 'Autopista Regional, Km 8, Depósito Industrial',
          status: 'inactive',
          rating: 3.8,
          logo: '',
          totalContracts: 6,
          totalAmount: 320000,
          lastContract: '2024-01-15T16:20:00Z',
          createdAt: '2023-03-08T15:30:00Z',
          updatedAt: '2024-01-15T16:20:00Z',
        },
      ];

      setProviders(mockProviders);
    } catch {
      // Error loading providers
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      supplies: {
        bg: 'success',
        text: 'Suministros',
        class: 'category-supplies',
      },
      services: {
        bg: 'primary',
        text: 'Servicios',
        class: 'category-services',
      },
      construction: {
        bg: 'warning',
        text: 'Construcción',
        class: 'category-construction',
      },
      others: { bg: 'secondary', text: 'Otros', class: 'category-others' },
    };

    const badge = badges[category as keyof typeof badges];
    return (
      <span className={`provider-badge ${badge.class}`}>{badge.text}</span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Activo', class: 'status-active' },
      inactive: { text: 'Inactivo', class: 'status-inactive' },
      pending: { text: 'Pendiente', class: 'status-pending' },
    };

    const badge = badges[status as keyof typeof badges];
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className='material-icons'
          style={{
            color: i <= rating ? '#FFB300' : '#e0e0e0',
            fontSize: '16px',
          }}
        >
          star
        </span>,
      );
    }
    return <div className='rating'>{stars}</div>;
  };

  const handleEditProvider = (providerId: number) => {
    router.push(`/proveedores/editar/${providerId}`);
  };

  const handleViewProvider = (providerId: number) => {
    router.push(`/proveedores/${providerId}`);
  };

  const handleDeleteProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProvider) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProviders(prev => prev.filter(p => p.id !== selectedProvider.id));
      setShowDeleteModal(false);
      setSelectedProvider(null);
      alert('Proveedor eliminado exitosamente');
    } catch {
      // Error deleting provider
      alert('Error al eliminar el proveedor');
    }
  };

  const filteredProviders = providers.filter(provider => {
    return (
      provider.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.category === '' || provider.category === filters.category) &&
      (filters.status === '' || provider.status === filters.status)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProviders = filteredProviders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.status === 'active').length,
    totalContracts: providers.reduce((sum, p) => sum + p.totalContracts, 0),
    avgRating:
      providers
        .filter(p => p.rating > 0)
        .reduce((sum, p) => sum + p.rating, 0) /
        providers.filter(p => p.rating > 0).length || 0,
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Proveedores — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='providers-container'>
          {/* Header */}
          <div className='providers-header'>
            <div className='d-flex justify-content-between align-items-start mb-4'>
              <div>
                <h1 className='providers-title'>
                  <span className='material-icons me-2'>business</span>
                  Lista de Proveedores
                </h1>
                <p className='providers-subtitle'>
                  Gestiona y administra todos los proveedores de la comunidad
                </p>
              </div>
              <Button
                variant='light'
                onClick={() => router.push('/proveedores/nuevo')}
              >
                <span className='material-icons me-2'>add</span>
                Nuevo Proveedor
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='row g-3 mb-4'>
            <div className='col-md-3'>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Total Proveedores</h6>
                      <h3 className='mt-2 mb-0'>{stats.total}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                    >
                      <span className='material-icons'>business</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className='col-md-3'>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Proveedores Activos</h6>
                      <h3 className='mt-2 mb-0'>{stats.active}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}
                    >
                      <span className='material-icons'>check_circle</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className='col-md-3'>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Total Contratos</h6>
                      <h3 className='mt-2 mb-0'>{stats.totalContracts}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}
                    >
                      <span className='material-icons'>description</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className='col-md-3'>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Rating Promedio</h6>
                      <h3 className='mt-2 mb-0'>
                        {stats.avgRating.toFixed(1)}
                      </h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}
                    >
                      <span className='material-icons'>star</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Filtros */}
          <div className='filter-section'>
            <div className='filter-header'>
              <h6 className='mb-0'>
                <span className='material-icons me-2'>filter_list</span>
                Filtros de Búsqueda
              </h6>
            </div>
            <div className='filter-body'>
              <div className='row g-3'>
                <div className='col-md-4'>
                  <Form.Group>
                    <Form.Label>Buscar proveedor</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Nombre del proveedor...'
                      value={filters.search}
                      onChange={e =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </Form.Group>
                </div>
                <div className='col-md-4'>
                  <Form.Group>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select
                      value={filters.category}
                      onChange={e =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                    >
                      <option value=''>Todas las categorías</option>
                      <option value='supplies'>Suministros</option>
                      <option value='services'>Servicios</option>
                      <option value='construction'>Construcción</option>
                      <option value='others'>Otros</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className='col-md-4'>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={e =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value=''>Todos los estados</option>
                      <option value='active'>Activo</option>
                      <option value='inactive'>Inactivo</option>
                      <option value='pending'>Pendiente</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
            </div>
          </div>

          {/* View Controls */}
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <span className='text-muted'>
              {filteredProviders.length} proveedores encontrados
            </span>
            <div className='d-flex align-items-center gap-2'>
              <span className='text-muted small'>Vista:</span>
              <div className='btn-group' role='group'>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='view-toggle-btn'
                >
                  <span className='material-icons'>grid_view</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  size='sm'
                  onClick={() => setViewMode('list')}
                  className='view-toggle-btn'
                >
                  <span className='material-icons'>view_list</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Vista Grid */}
          {viewMode === 'grid' && (
            <div className='row g-3 mb-4'>
              {paginatedProviders.map(provider => (
                <div key={provider.id} className='col-lg-6 col-xl-4'>
                  <div className='provider-card'>
                    <div className='card-body'>
                      <div className='d-flex align-items-start mb-3'>
                        <div className='provider-logo me-3'>
                          {provider.logo ? (
                            <Image src={provider.logo} alt={provider.name} width={50} height={50} />
                          ) : (
                            provider.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className='flex-grow-1'>
                          <h6 className='card-title mb-1'>{provider.name}</h6>
                          <small className='text-muted'>
                            {provider.businessName}
                          </small>
                          <div className='mt-1'>
                            {getCategoryBadge(provider.category)}
                          </div>
                        </div>
                        <div className='text-end'>
                          {getStatusBadge(provider.status)}
                        </div>
                      </div>

                      <div className='provider-info mb-3'>
                        <div className='d-flex align-items-center mb-1'>
                          <span
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            phone
                          </span>
                          <small>{provider.phone}</small>
                        </div>
                        <div className='d-flex align-items-center mb-1'>
                          <span
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            email
                          </span>
                          <small>{provider.email}</small>
                        </div>
                        <div className='d-flex align-items-center'>
                          <span
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            badge
                          </span>
                          <small>{provider.rif}</small>
                        </div>
                      </div>

                      <div className='provider-stats mb-3'>
                        <div className='row text-center'>
                          <div className='col-4'>
                            <div className='fw-bold'>
                              {provider.totalContracts}
                            </div>
                            <small className='text-muted'>Contratos</small>
                          </div>
                          <div className='col-4'>
                            <div className='fw-bold'>
                              ${(provider.totalAmount / 1000).toFixed(0)}K
                            </div>
                            <small className='text-muted'>Total</small>
                          </div>
                          <div className='col-4'>
                            <div className='fw-bold'>
                              {provider.rating || 'N/A'}
                            </div>
                            <small className='text-muted'>Rating</small>
                          </div>
                        </div>
                      </div>

                      {provider.rating > 0 && (
                        <div className='d-flex justify-content-center mb-3'>
                          {renderRating(provider.rating)}
                        </div>
                      )}

                      <div className='d-flex justify-content-between align-items-center'>
                        <Button
                          variant='outline-info'
                          size='sm'
                          onClick={() => handleViewProvider(provider.id)}
                        >
                          <span className='material-icons'>visibility</span>
                        </Button>
                        <div className='d-flex gap-1'>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() => handleEditProvider(provider.id)}
                          >
                            <span className='material-icons'>edit</span>
                          </Button>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => handleDeleteProvider(provider)}
                          >
                            <span className='material-icons'>delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <div className='providers-table'>
              <div className='table-header'>
                <h5 className='table-title'>
                  <span className='material-icons'>business</span>
                  Proveedores
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
                      <th>Proveedor</th>
                      <th>Categoría</th>
                      <th>Contacto</th>
                      <th>Contratos</th>
                      <th>Rating</th>
                      <th>Estado</th>
                      <th className='text-end'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProviders.map(provider => (
                      <tr key={provider.id} className='data-row'>
                        <td>
                          <div className='d-flex align-items-center'>
                            <div
                              className='provider-logo me-3'
                              style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '14px',
                              }}
                            >
                              {provider.logo ? (
                                <Image
                                  src={provider.logo}
                                  alt={provider.name}
                                  width={40}
                                  height={40}
                                />
                              ) : (
                                provider.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className='fw-medium'>{provider.name}</div>
                              <small className='text-muted'>
                                {provider.businessName}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{getCategoryBadge(provider.category)}</td>
                        <td>
                          <div>{provider.phone}</div>
                          <small className='text-muted'>{provider.email}</small>
                        </td>
                        <td>
                          <div className='fw-medium'>
                            {provider.totalContracts}
                          </div>
                          <small className='text-muted'>
                            ${provider.totalAmount.toLocaleString()}
                          </small>
                        </td>
                        <td>
                          {provider.rating > 0
                            ? renderRating(provider.rating)
                            : 'N/A'}
                        </td>
                        <td>{getStatusBadge(provider.status)}</td>
                        <td className='text-end'>
                          <div className='d-flex gap-1 justify-content-end'>
                            <Button
                              variant='outline-info'
                              size='sm'
                              className='action-button'
                              onClick={() => handleViewProvider(provider.id)}
                            >
                              <span className='material-icons'>visibility</span>
                            </Button>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              className='action-button'
                              onClick={() => handleEditProvider(provider.id)}
                            >
                              <span className='material-icons'>edit</span>
                            </Button>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              className='action-button'
                              onClick={() => handleDeleteProvider(provider)}
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className='d-flex justify-content-between align-items-center mt-4'>
              <span className='text-muted'>
                Mostrando {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredProviders.length)}{' '}
                de {filteredProviders.length} proveedores
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
              Eliminar Proveedor
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProvider && (
              <>
                <div className='alert alert-danger'>
                  <span className='material-icons me-2'>warning</span>
                  Esta acción no se puede deshacer. El proveedor será eliminado
                  permanentemente.
                </div>
                <p>
                  ¿Estás seguro de que deseas eliminar el proveedor{' '}
                  <strong>&ldquo;{selectedProvider.name}&rdquo;</strong>?
                </p>
                <p className='text-muted'>
                  Esto también eliminará toda la información relacionada,
                  incluyendo contratos y evaluaciones.
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
      </Layout>
    </ProtectedRoute>
  );
}
