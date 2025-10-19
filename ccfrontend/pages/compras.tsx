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

interface Purchase {
  id: number;
  number: string;
  type: 'order' | 'service' | 'maintenance' | 'supplies';
  status:
    | 'draft'
    | 'pending'
    | 'approved'
    | 'in-progress'
    | 'delivered'
    | 'completed'
    | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  provider: {
    id: number;
    name: string;
    category: string;
    rating: number;
  };
  costCenter: {
    id: number;
    name: string;
    department: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
  };
  description: string;
  totalAmount: number;
  currency: 'clp' | 'usd';
  requestedBy: string;
  requestDate: string;
  requiredDate: string;
  approvedBy?: string;
  approvedDate?: string;
  deliveryDate?: string;
  completedDate?: string;
  items: PurchaseItem[];
  documents: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export default function ComprasListado() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([]);

  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    priority: '',
    provider: '',
    costCenter: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: '',
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPurchases: Purchase[] = [
        {
          id: 1,
          number: 'ORD-2024-001',
          type: 'supplies',
          status: 'pending',
          priority: 'medium',
          provider: {
            id: 1,
            name: 'Materiales San Fernando Ltda.',
            category: 'supplies',
            rating: 4.2,
          },
          costCenter: {
            id: 1,
            name: 'Mantenimiento General',
            department: 'maintenance',
          },
          category: {
            id: 1,
            name: 'Materiales de Construcción',
            color: '#ff9800',
          },
          description:
            'Materiales para reparación de fachada principal del edificio',
          totalAmount: 850000,
          currency: 'clp',
          requestedBy: 'María González',
          requestDate: '2024-03-25T10:30:00Z',
          requiredDate: '2024-04-05T00:00:00Z',
          items: [
            {
              id: 1,
              description: 'Cemento Portland 42.5 kg Melón',
              quantity: 15,
              unit: 'sacos',
              unitPrice: 12500,
              totalPrice: 187500,
              category: 'Cemento',
            },
            {
              id: 2,
              description: 'Arena lavada m³',
              quantity: 4,
              unit: 'm³',
              unitPrice: 28000,
              totalPrice: 112000,
              category: 'Agregados',
            },
            {
              id: 3,
              description: 'Pintura acrílica exterior Sherwin Williams 20L',
              quantity: 8,
              unit: 'tarros',
              unitPrice: 68750,
              totalPrice: 550000,
              category: 'Pintura',
            },
          ],
          documents: 3,
          notes: 'Urgente para inicio de trabajos la próxima semana',
          createdAt: '2024-03-25T10:30:00Z',
          updatedAt: '2024-03-25T10:30:00Z',
        },
        {
          id: 2,
          number: 'SRV-2024-002',
          type: 'service',
          status: 'approved',
          priority: 'high',
          provider: {
            id: 2,
            name: 'Limpiezas Profesionales Vitacura Ltda.',
            category: 'services',
            rating: 4.8,
          },
          costCenter: {
            id: 2,
            name: 'Servicios Generales',
            department: 'operations',
          },
          category: {
            id: 2,
            name: 'Servicios de Limpieza',
            color: '#2196f3',
          },
          description:
            'Servicio de limpieza profunda áreas comunes del condominio',
          totalAmount: 320000,
          currency: 'clp',
          requestedBy: 'Carlos Rodríguez',
          requestDate: '2024-03-20T14:15:00Z',
          requiredDate: '2024-03-30T00:00:00Z',
          approvedBy: 'Patricia Contreras',
          approvedDate: '2024-03-22T09:00:00Z',
          items: [
            {
              id: 1,
              description: 'Limpieza profunda lobby y pasillos',
              quantity: 1,
              unit: 'servicio',
              unitPrice: 150000,
              totalPrice: 150000,
              category: 'Limpieza Interior',
            },
            {
              id: 2,
              description: 'Limpieza cristales fachada completa',
              quantity: 1,
              unit: 'servicio',
              unitPrice: 120000,
              totalPrice: 120000,
              category: 'Limpieza Exterior',
            },
            {
              id: 3,
              description: 'Encerado y cristalizado pisos mármol',
              quantity: 1,
              unit: 'servicio',
              unitPrice: 50000,
              totalPrice: 50000,
              category: 'Tratamiento Pisos',
            },
          ],
          documents: 2,
          createdAt: '2024-03-20T14:15:00Z',
          updatedAt: '2024-03-22T09:00:00Z',
        },
        {
          id: 3,
          number: 'MNT-2024-003',
          type: 'maintenance',
          status: 'in-progress',
          priority: 'urgent',
          provider: {
            id: 3,
            name: 'Servicios Eléctricos Las Condes SpA',
            category: 'services',
            rating: 4.6,
          },
          costCenter: {
            id: 3,
            name: 'Mantenimiento Preventivo',
            department: 'maintenance',
          },
          category: {
            id: 3,
            name: 'Mantenimiento Eléctrico',
            color: '#f44336',
          },
          description:
            'Reparación urgente sistema eléctrico Torre A - Falla generalizada',
          totalAmount: 780000,
          currency: 'clp',
          requestedBy: 'José Martínez',
          requestDate: '2024-03-18T08:00:00Z',
          requiredDate: '2024-03-25T00:00:00Z',
          approvedBy: 'Patricia Contreras',
          approvedDate: '2024-03-18T10:30:00Z',
          items: [
            {
              id: 1,
              description: 'Diagnóstico completo tablero principal SEC',
              quantity: 1,
              unit: 'servicio',
              unitPrice: 180000,
              totalPrice: 180000,
              category: 'Diagnóstico',
            },
            {
              id: 2,
              description: 'Interruptores automáticos 32A Schneider',
              quantity: 6,
              unit: 'unidades',
              unitPrice: 45000,
              totalPrice: 270000,
              category: 'Materiales',
            },
            {
              id: 3,
              description: 'Cable THHN 12 AWG Procobre',
              quantity: 150,
              unit: 'metros',
              unitPrice: 2200,
              totalPrice: 330000,
              category: 'Materiales',
            },
          ],
          documents: 5,
          notes: 'Trabajo en progreso, estimado finalización mañana con SEC',
          createdAt: '2024-03-18T08:00:00Z',
          updatedAt: '2024-03-26T16:20:00Z',
        },
        {
          id: 4,
          number: 'ORD-2024-004',
          type: 'order',
          status: 'completed',
          priority: 'low',
          provider: {
            id: 4,
            name: 'Vivero y Paisajismo Lo Barnechea Ltda.',
            category: 'services',
            rating: 4.3,
          },
          costCenter: {
            id: 4,
            name: 'Jardinería y Paisajismo',
            department: 'operations',
          },
          category: {
            id: 4,
            name: 'Jardinería',
            color: '#4caf50',
          },
          description:
            'Renovación completa de jardines y áreas verdes del condominio',
          totalAmount: 450000,
          currency: 'clp',
          requestedBy: 'Ana López',
          requestDate: '2024-03-10T11:00:00Z',
          requiredDate: '2024-03-20T00:00:00Z',
          approvedBy: 'Carlos Rodríguez',
          approvedDate: '2024-03-12T09:15:00Z',
          deliveryDate: '2024-03-18T14:30:00Z',
          completedDate: '2024-03-20T16:45:00Z',
          items: [
            {
              id: 1,
              description:
                'Plantas ornamentales chilenas (lavanda, romero, copihue)',
              quantity: 25,
              unit: 'unidades',
              unitPrice: 8500,
              totalPrice: 212500,
              category: 'Plantas',
            },
            {
              id: 2,
              description: 'Compost orgánico premium',
              quantity: 15,
              unit: 'sacos 50kg',
              unitPrice: 7500,
              totalPrice: 112500,
              category: 'Sustratos',
            },
            {
              id: 3,
              description:
                'Servicio diseño paisajístico y mantención trimestral',
              quantity: 1,
              unit: 'servicio',
              unitPrice: 125000,
              totalPrice: 125000,
              category: 'Servicios',
            },
          ],
          documents: 4,
          createdAt: '2024-03-10T11:00:00Z',
          updatedAt: '2024-03-20T16:45:00Z',
        },
        {
          id: 5,
          number: 'SRV-2024-005',
          type: 'service',
          status: 'cancelled',
          priority: 'medium',
          provider: {
            id: 5,
            name: 'Soluciones TI Chile SpA',
            category: 'others',
            rating: 4.7,
          },
          costCenter: {
            id: 5,
            name: 'Administración',
            department: 'administration',
          },
          category: {
            id: 5,
            name: 'Tecnología',
            color: '#9c27b0',
          },
          description:
            'Actualización sistema administración condominial y portería digital',
          totalAmount: 1250000,
          currency: 'clp',
          requestedBy: 'Patricia Contreras',
          requestDate: '2024-03-05T13:20:00Z',
          requiredDate: '2024-03-25T00:00:00Z',
          items: [
            {
              id: 1,
              description: 'Licencia software gestión condominios Nexo Pro',
              quantity: 1,
              unit: 'licencia anual',
              unitPrice: 850000,
              totalPrice: 850000,
              category: 'Software',
            },
            {
              id: 2,
              description: 'Implementación y capacitación personal',
              quantity: 20,
              unit: 'horas',
              unitPrice: 20000,
              totalPrice: 400000,
              category: 'Consultoría',
            },
          ],
          documents: 2,
          notes: 'Cancelado - Se optó por proveedor nacional con mejor soporte',
          createdAt: '2024-03-05T13:20:00Z',
          updatedAt: '2024-03-15T10:00:00Z',
        },
      ];

      setPurchases(mockPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'secondary', text: 'Borrador', class: 'status-draft' },
      pending: { bg: 'warning', text: 'Pendiente', class: 'status-pending' },
      approved: { bg: 'info', text: 'Aprobado', class: 'status-approved' },
      'in-progress': {
        bg: 'primary',
        text: 'En Proceso',
        class: 'status-in-progress',
      },
      delivered: {
        bg: 'success',
        text: 'Entregado',
        class: 'status-delivered',
      },
      completed: {
        bg: 'success',
        text: 'Completado',
        class: 'status-completed',
      },
      cancelled: { bg: 'danger', text: 'Cancelado', class: 'status-cancelled' },
    };

    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`purchase-status-badge ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { text: 'Baja', class: 'priority-low' },
      medium: { text: 'Media', class: 'priority-medium' },
      high: { text: 'Alta', class: 'priority-high' },
      urgent: { text: 'Urgente', class: 'priority-urgent' },
    };

    const badge = badges[priority as keyof typeof badges];
    return (
      <span className={`purchase-priority-badge ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      order: { text: 'Orden', class: 'type-order', icon: 'shopping_cart' },
      service: { text: 'Servicio', class: 'type-service', icon: 'build' },
      maintenance: {
        text: 'Mantenimiento',
        class: 'type-maintenance',
        icon: 'construction',
      },
      supplies: {
        text: 'Suministros',
        class: 'type-supplies',
        icon: 'inventory',
      },
    };

    const badge = badges[type as keyof typeof badges];
    return (
      <span className={`purchase-type-badge ${badge.class}`}>
        <span className='material-icons me-1'>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'clp') => {
    if (currency === 'clp') {
      return `$${amount.toLocaleString('es-CL')}`;
    } else if (currency === 'usd') {
      return `US$${amount.toLocaleString('en-US')}`;
    }
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  };

  const handleViewPurchase = (purchaseId: number) => {
    router.push(`/compras/${purchaseId}`);
  };

  const handleEditPurchase = (purchaseId: number) => {
    router.push(`/compras/editar/${purchaseId}`);
  };

  const handleDeletePurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPurchase) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPurchases(prev => prev.filter(p => p.id !== selectedPurchase.id));
      setShowDeleteModal(false);
      setSelectedPurchase(null);
      alert('Compra eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Error al eliminar la compra');
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on purchases:`, selectedPurchases);
    // Implementar acciones masivas
  };

  const togglePurchaseSelection = (purchaseId: number) => {
    setSelectedPurchases(prev =>
      prev.includes(purchaseId)
        ? prev.filter(id => id !== purchaseId)
        : [...prev, purchaseId],
    );
  };

  const toggleAllSelection = () => {
    setSelectedPurchases(prev =>
      prev.length === paginatedPurchases.length
        ? []
        : paginatedPurchases.map(p => p.id),
    );
  };

  const filteredPurchases = purchases.filter(purchase => {
    return (
      purchase.description
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (filters.type === '' || purchase.type === filters.type) &&
      (filters.status === '' || purchase.status === filters.status) &&
      (filters.priority === '' || purchase.priority === filters.priority) &&
      (filters.provider === '' ||
        purchase.provider.name
          .toLowerCase()
          .includes(filters.provider.toLowerCase())) &&
      (filters.costCenter === '' ||
        purchase.costCenter.name
          .toLowerCase()
          .includes(filters.costCenter.toLowerCase()))
    );
  });

  // Paginación
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = filteredPurchases.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const stats = {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    approved: purchases.filter(p => p.status === 'approved').length,
    inProgress: purchases.filter(p => p.status === 'in-progress').length,
    completed: purchases.filter(p => p.status === 'completed').length,
    totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Compras — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='purchases-container'>
          {/* Header */}
          {/* Hero Section */}
          <div className='purchases-hero'>
            <div className='hero-background'>
              <div className='hero-pattern'></div>
              <div className='hero-gradient'></div>
            </div>

            <div className='hero-content'>
              <Row className='align-items-center'>
                <Col lg={8}>
                  <div className='hero-text'>
                    <div className='hero-badge'>
                      <span className='material-icons'>inventory</span>
                      <span>Sistema de Compras</span>
                    </div>

                    <h1 className='hero-title'>
                      Gestión Inteligente de
                      <span className='hero-highlight'> Compras</span>
                    </h1>

                    <p className='hero-description'>
                      Centraliza y optimiza todos tus procesos de adquisición.
                      Desde órdenes de compra hasta servicios especializados,
                      mantén el control total de tu presupuesto y proveedores.
                    </p>

                    <div className='hero-features'>
                      <div className='feature-item'>
                        <span className='material-icons'>check_circle</span>
                        <span>Gestión de Proveedores</span>
                      </div>
                      <div className='feature-item'>
                        <span className='material-icons'>check_circle</span>
                        <span>Control de Presupuesto</span>
                      </div>
                      <div className='feature-item'>
                        <span className='material-icons'>check_circle</span>
                        <span>Flujo de Aprobaciones</span>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col lg={4}>
                  <div className='hero-actions'>
                    <div className='action-card'>
                      <div className='action-header'>
                        <span className='material-icons'>
                          add_shopping_cart
                        </span>
                        <h4>¿Listo para empezar?</h4>
                      </div>
                      <p>
                        Crea una nueva solicitud de compra y optimiza tus
                        procesos
                      </p>
                      <Button
                        variant='primary'
                        size='lg'
                        className='hero-cta'
                        onClick={() => router.push('/compras/nuevo')}
                      >
                        <span className='material-icons me-2'>add</span>
                        Nueva Compra
                      </Button>

                      <div className='quick-stats'>
                        <div className='quick-stat'>
                          <span className='stat-number'>
                            {purchases.length}
                          </span>
                          <span className='stat-label'>Compras Activas</span>
                        </div>
                        <div className='quick-stat'>
                          <span className='stat-number'>
                            {
                              purchases.filter(p => p.status === 'pending')
                                .length
                            }
                          </span>
                          <span className='stat-label'>Pendientes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className='g-3 mb-4'>
            <Col md={2}>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Total</h6>
                      <h3 className='mt-2 mb-0'>{stats.total}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                    >
                      <span className='material-icons'>inventory</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Pendientes</h6>
                      <h3 className='mt-2 mb-0'>{stats.pending}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}
                    >
                      <span className='material-icons'>schedule</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Aprobadas</h6>
                      <h3 className='mt-2 mb-0'>{stats.approved}</h3>
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
            </Col>
            <Col md={2}>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>En Proceso</h6>
                      <h3 className='mt-2 mb-0'>{stats.inProgress}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#e1f5fe', color: '#0288d1' }}
                    >
                      <span className='material-icons'>sync</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Completadas</h6>
                      <h3 className='mt-2 mb-0'>{stats.completed}</h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#e8f5e8', color: '#388e3c' }}
                    >
                      <span className='material-icons'>task_alt</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className='card-stat'>
                <Card.Body>
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <h6 className='text-muted mb-0'>Total CLP</h6>
                      <h3 className='mt-2 mb-0'>
                        ${(stats.totalAmount / 1000000).toFixed(1)}M
                      </h3>
                    </div>
                    <div
                      className='stat-icon'
                      style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}
                    >
                      <span className='material-icons'>attach_money</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtros */}
          <div className='filter-section'>
            <div className='filter-header'>
              <h6 className='mb-0'>
                <span className='material-icons me-2'>filter_list</span>
                Filtros de Búsqueda
              </h6>
            </div>
            <div className='filter-body'>
              <Row className='g-3'>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Buscar compra</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Descripción o número...'
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
                      <option value='order'>Orden</option>
                      <option value='service'>Servicio</option>
                      <option value='maintenance'>Mantenimiento</option>
                      <option value='supplies'>Suministros</option>
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
                      <option value='draft'>Borrador</option>
                      <option value='pending'>Pendiente</option>
                      <option value='approved'>Aprobado</option>
                      <option value='in-progress'>En Proceso</option>
                      <option value='delivered'>Entregado</option>
                      <option value='completed'>Completado</option>
                      <option value='cancelled'>Cancelado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Prioridad</Form.Label>
                    <Form.Select
                      value={filters.priority}
                      onChange={e =>
                        setFilters({ ...filters, priority: e.target.value })
                      }
                    >
                      <option value=''>Todas</option>
                      <option value='low'>Baja</option>
                      <option value='medium'>Media</option>
                      <option value='high'>Alta</option>
                      <option value='urgent'>Urgente</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Nombre del proveedor...'
                      value={filters.provider}
                      onChange={e =>
                        setFilters({ ...filters, provider: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </div>

          {/* Controles de vista */}
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <div className='d-flex align-items-center gap-3'>
              <span className='text-muted'>
                {filteredPurchases.length} compras encontradas
              </span>
              {selectedPurchases.length > 0 && (
                <div className='d-flex align-items-center gap-2'>
                  <span className='text-primary'>
                    {selectedPurchases.length} seleccionadas
                  </span>
                  <Dropdown>
                    <Dropdown.Toggle variant='outline-primary' size='sm'>
                      Acciones
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => handleBulkAction('approve')}
                      >
                        <span className='material-icons me-2'>check</span>
                        Aprobar seleccionadas
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleBulkAction('cancel')}>
                        <span className='material-icons me-2'>cancel</span>
                        Cancelar seleccionadas
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => handleBulkAction('export')}>
                        <span className='material-icons me-2'>
                          file_download
                        </span>
                        Exportar seleccionadas
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
                  variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                  size='sm'
                  onClick={() => setViewMode('table')}
                  className='view-toggle-btn'
                >
                  <span className='material-icons'>view_list</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  size='sm'
                  onClick={() => setViewMode('grid')}
                  className='view-toggle-btn'
                >
                  <span className='material-icons'>grid_view</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Vista de tabla */}
          {viewMode === 'table' && (
            <div className='purchases-table'>
              <div className='table-header'>
                <h5 className='table-title'>
                  <span className='material-icons'>inventory</span>
                  Compras
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
                      <th>
                        <Form.Check
                          type='checkbox'
                          checked={
                            selectedPurchases.length ===
                              paginatedPurchases.length &&
                            paginatedPurchases.length > 0
                          }
                          onChange={toggleAllSelection}
                        />
                      </th>
                      <th>Número</th>
                      <th>Descripción</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Proveedor</th>
                      <th>Centro de Costo</th>
                      <th>Monto</th>
                      <th>Fecha Solicitada</th>
                      <th className='text-end'>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPurchases.map(purchase => (
                      <tr key={purchase.id} className='data-row'>
                        <td>
                          <Form.Check
                            type='checkbox'
                            checked={selectedPurchases.includes(purchase.id)}
                            onChange={() =>
                              togglePurchaseSelection(purchase.id)
                            }
                          />
                        </td>
                        <td>
                          <div className='fw-medium'>{purchase.number}</div>
                          <small className='text-muted'>
                            {new Date(
                              purchase.requestDate,
                            ).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          <div className='fw-medium'>
                            {purchase.description}
                          </div>
                          <small className='text-muted'>
                            {purchase.items.length} item(s) •{' '}
                            {purchase.documents} doc(s)
                          </small>
                        </td>
                        <td>{getTypeBadge(purchase.type)}</td>
                        <td>{getStatusBadge(purchase.status)}</td>
                        <td>{getPriorityBadge(purchase.priority)}</td>
                        <td>
                          <div className='fw-medium'>
                            {purchase.provider.name}
                          </div>
                          <small className='text-muted'>
                            {purchase.provider.category}
                          </small>
                        </td>
                        <td>
                          <div className='fw-medium'>
                            {purchase.costCenter.name}
                          </div>
                          <small className='text-muted'>
                            {purchase.costCenter.department}
                          </small>
                        </td>
                        <td>
                          <div className='fw-medium'>
                            {formatCurrency(
                              purchase.totalAmount,
                              purchase.currency,
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {new Date(
                              purchase.requiredDate,
                            ).toLocaleDateString()}
                          </div>
                          <small className='text-muted'>
                            Por {purchase.requestedBy}
                          </small>
                        </td>
                        <td className='text-end'>
                          <div className='d-flex gap-1 justify-content-end'>
                            <Button
                              variant='outline-info'
                              size='sm'
                              className='action-button'
                              onClick={() => handleViewPurchase(purchase.id)}
                            >
                              <span className='material-icons'>visibility</span>
                            </Button>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              className='action-button'
                              onClick={() => handleEditPurchase(purchase.id)}
                            >
                              <span className='material-icons'>edit</span>
                            </Button>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              className='action-button'
                              onClick={() => handleDeletePurchase(purchase)}
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
              {paginatedPurchases.map(purchase => (
                <Col key={purchase.id} lg={6} xl={4}>
                  <div className='purchase-card'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div>
                          <h6 className='card-title mb-1'>{purchase.number}</h6>
                          <small className='text-muted'>
                            {purchase.description}
                          </small>
                        </div>
                        <div className='text-end'>
                          {getStatusBadge(purchase.status)}
                        </div>
                      </div>

                      <div className='d-flex gap-2 mb-3'>
                        {getTypeBadge(purchase.type)}
                        {getPriorityBadge(purchase.priority)}
                      </div>

                      <div className='purchase-info mb-3'>
                        <div className='d-flex align-items-center mb-1'>
                          <span
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            store
                          </span>
                          <small>{purchase.provider.name}</small>
                        </div>
                        <div className='d-flex align-items-center mb-1'>
                          <span
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            account_balance_wallet
                          </span>
                          <small>{purchase.costCenter.name}</small>
                        </div>
                        <div className='d-flex align-items-center'>
                          <span
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            person
                          </span>
                          <small>Por {purchase.requestedBy}</small>
                        </div>
                      </div>

                      <div className='purchase-stats mb-3'>
                        <Row className='text-center'>
                          <Col xs={4}>
                            <div className='fw-bold'>
                              {purchase.items.length}
                            </div>
                            <small className='text-muted'>Items</small>
                          </Col>
                          <Col xs={4}>
                            <div className='fw-bold'>
                              {formatCurrency(
                                purchase.totalAmount,
                                purchase.currency,
                              )}
                            </div>
                            <small className='text-muted'>Total</small>
                          </Col>
                          <Col xs={4}>
                            <div className='fw-bold'>{purchase.documents}</div>
                            <small className='text-muted'>Docs</small>
                          </Col>
                        </Row>
                      </div>

                      <div className='d-flex justify-content-between align-items-center'>
                        <small className='text-muted'>
                          Vence:{' '}
                          {new Date(purchase.requiredDate).toLocaleDateString()}
                        </small>
                        <div className='d-flex gap-1'>
                          <Button
                            variant='outline-info'
                            size='sm'
                            onClick={() => handleViewPurchase(purchase.id)}
                          >
                            <span className='material-icons'>visibility</span>
                          </Button>
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() => handleEditPurchase(purchase.id)}
                          >
                            <span className='material-icons'>edit</span>
                          </Button>
                          <Button
                            variant='outline-danger'
                            size='sm'
                            onClick={() => handleDeletePurchase(purchase)}
                          >
                            <span className='material-icons'>delete</span>
                          </Button>
                        </div>
                      </div>
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
                {Math.min(startIndex + itemsPerPage, filteredPurchases.length)}{' '}
                de {filteredPurchases.length} compras
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
              Eliminar Compra
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPurchase && (
              <>
                <div className='alert alert-danger'>
                  <span className='material-icons me-2'>warning</span>
                  Esta acción no se puede deshacer. La compra será eliminada
                  permanentemente.
                </div>
                <p>
                  ¿Estás seguro de que deseas eliminar la compra{' '}
                  <strong>"{selectedPurchase.number}"</strong>?
                </p>
                <p className='text-muted'>
                  Esto también eliminará toda la información relacionada,
                  incluyendo items y documentos.
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
