import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Table, Form, Button, Badge, Card, Spinner, InputGroup } from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import PaymentComponent from '../components/PaymentComponent';

interface Pago {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
  estado: string;
  metodoPago: string;
  personaId: number;
  comunidadId: number;
  transactionId?: string;
  gateway?: string;
}

interface PaymentFilters {
  search: string;
  status: string;
  method: string;
  dateFrom: string;
  dateTo: string;
}

interface PaymentStats {
  totalPayments: number;
  approvedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
  totalAmount: number;
  avgAmount: number;
}

const Pagos: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({
    search: '',
    status: '',
    method: '',
    dateFrom: '',
    dateTo: ''
  });
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    approvedPayments: 0,
    pendingPayments: 0,
    rejectedPayments: 0,
    totalAmount: 0,
    avgAmount: 0
  });

  // Mock data
  const mockPagos: Pago[] = [
    {
      id: 1,
      concepto: 'Cuota de mantenimiento',
      monto: 150000,
      fecha: '2025-09-15',
      estado: 'aprobado',
      metodoPago: 'transferencia',
      personaId: 1,
      comunidadId: 1,
      transactionId: 'TXN-001-2025',
      gateway: 'webpay'
    },
    {
      id: 2,
      concepto: 'Servicios generales', 
      monto: 75000,
      fecha: '2025-09-20',
      estado: 'pendiente',
      metodoPago: 'tarjeta_credito',
      personaId: 2,
      comunidadId: 1,
      transactionId: 'TXN-002-2025',
      gateway: 'khipu'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPagos(mockPagos);
      calculateStats(mockPagos);
      setLoading(false);
    }, 1000);
  }, []);

  const calculateStats = (payments: Pago[]) => {
    const approved = payments.filter(p => p.estado === 'aprobado').length;
    const pending = payments.filter(p => p.estado === 'pendiente').length;
    const rejected = payments.filter(p => p.estado === 'rechazado').length;
    const total = payments.reduce((sum, p) => sum + p.monto, 0);

    setStats({
      totalPayments: payments.length,
      approvedPayments: approved,
      pendingPayments: pending,
      rejectedPayments: rejected,
      totalAmount: total,
      avgAmount: payments.length > 0 ? total / payments.length : 0
    });
  };

  const handleFilterChange = (field: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      aprobado: { variant: 'success', text: 'Confirmado', icon: 'check_circle' },
      pendiente: { variant: 'warning', text: 'Pendiente', icon: 'schedule' },
      rechazado: { variant: 'danger', text: 'Rechazado', icon: 'cancel' }
    };
    
    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig.pendiente;
    
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <span className="material-icons" style={{ fontSize: '14px' }}>{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    const icons = {
      transferencia: 'account_balance',
      tarjeta_credito: 'credit_card',
      efectivo: 'payments',
      debito: 'payment'
    };
    return icons[method as keyof typeof icons] || 'payment';
  };

  if (loading) {
    return (
      <Layout>
        <Container className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </Container>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Container fluid className="py-4">
          {/* Header con gradiente mejorado */}
          <div className="payments-header mb-4">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="d-flex align-items-center mb-3">
                  <span className="material-icons me-3" style={{ fontSize: '3rem' }}>payments</span>
                  <div>
                    <h1 className="payments-title mb-2">Gestión de Pagos</h1>
                    <p className="payments-subtitle mb-0">
                      Administra todos los pagos y transacciones de la comunidad
                    </p>
                  </div>
                </div>
                
                {/* Stats compactos en el header */}
                <div className="payments-stats">
                  <div className="stat-item">
                    <div className="stat-number">{stats.totalPayments}</div>
                    <div className="stat-label">Total</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.approvedPayments}</div>
                    <div className="stat-label">Confirmados</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{stats.pendingPayments}</div>
                    <div className="stat-label">Pendientes</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{formatCurrency(stats.totalAmount).slice(0, -3)}K</div>
                    <div className="stat-label">Recaudado</div>
                  </div>
                </div>
              </Col>
              <Col lg={4} className="text-end">
                <div className="d-flex flex-column gap-2">
                  <div>
                    <Button variant="light" size="sm" className="me-2">
                      <span className="material-icons me-1">print</span>
                      Imprimir
                    </Button>
                    <Button variant="light" size="sm" className="me-2">
                      <span className="material-icons me-1">file_download</span>
                      Exportar
                    </Button>
                  </div>
                  <Button variant="warning" size="lg">
                    <span className="material-icons me-2">add_circle</span>
                    Registrar Nuevo Pago
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Tarjetas de estadísticas mejoradas */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-3">
              <Card className="stat-card h-100">
                <Card.Body className="text-center">
                  <div className="stat-card-icon mb-3">
                    <span className="material-icons">payments</span>
                  </div>
                  <h3 className="stat-card-value">{stats.totalPayments}</h3>
                  <p className="stat-card-label mb-2">Total de Pagos</p>
                  <small className="stat-card-change text-success">
                    <span className="material-icons">trending_up</span>
                    +12% vs mes anterior
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card className="stat-card h-100">
                <Card.Body className="text-center">
                  <div className="stat-card-icon success mb-3">
                    <span className="material-icons">check_circle</span>
                  </div>
                  <h3 className="stat-card-value">{stats.approvedPayments}</h3>
                  <p className="stat-card-label mb-2">Confirmados</p>
                  <small className="stat-card-change text-success">
                    <span className="material-icons">trending_up</span>
                    +8% vs mes anterior
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card className="stat-card h-100">
                <Card.Body className="text-center">
                  <div className="stat-card-icon warning mb-3">
                    <span className="material-icons">schedule</span>
                  </div>
                  <h3 className="stat-card-value">{stats.pendingPayments}</h3>
                  <p className="stat-card-label mb-2">Pendientes</p>
                  <small className="stat-card-change text-warning">
                    <span className="material-icons">trending_down</span>
                    -5% vs mes anterior
                  </small>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-3">
              <Card className="stat-card h-100">
                <Card.Body className="text-center">
                  <div className="stat-card-icon info mb-3">
                    <span className="material-icons">attach_money</span>
                  </div>
                  <h3 className="stat-card-value">{formatCurrency(stats.totalAmount)}</h3>
                  <p className="stat-card-label mb-2">Total Recaudado</p>
                  <small className="stat-card-change text-success">
                    <span className="material-icons">trending_up</span>
                    +15% vs mes anterior
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Advanced Filters como en mockup */}
          <Card className="filter-card mb-4">
            <Card.Header className="bg-light">
              <Row className="align-items-center">
                <Col>
                  <h6 className="mb-0 fw-bold">
                    <span className="material-icons me-2">filter_alt</span>
                    Filtros de Búsqueda
                  </h6>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-secondary" size="sm">
                    <span className="material-icons me-1">refresh</span>
                    Limpiar
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col md={5}>
                  <Form.Label className="small fw-medium text-muted mb-1">Buscar pagos</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <span className="material-icons text-muted">search</span>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="ID, concepto, residente..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="border-start-0"
                    />
                  </InputGroup>
                </Col>
                
                <Col md={2}>
                  <Form.Label className="small fw-medium text-muted mb-1">Estado</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="aprobado">Confirmado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </Col>
                
                <Col md={2}>
                  <Form.Label className="small fw-medium text-muted mb-1">Método</Form.Label>
                  <Form.Select
                    value={filters.method}
                    onChange={(e) => handleFilterChange('method', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta_credito">Tarjeta</option>
                    <option value="efectivo">Efectivo</option>
                  </Form.Select>
                </Col>
                
                <Col md={3}>
                  <div className="d-flex gap-2">
                    <Button variant="primary" size="sm">
                      <span className="material-icons me-1">search</span>
                      Buscar
                    </Button>
                    <Button variant="outline-secondary" size="sm">
                      <span className="material-icons me-1">clear</span>
                      Limpiar
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payments Table igual al mockup */}
          <Card className="payments-table-card">
            <Card.Header className="bg-white border-bottom">
              <Row className="align-items-center">
                <Col>
                  <h6 className="mb-0 fw-bold">
                    <span className="material-icons me-2">view_list</span>
                    Lista de Pagos ({pagos.length})
                  </h6>
                </Col>
                <Col xs="auto">
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      <span className="material-icons me-1">select_all</span>
                      Seleccionar Todo
                    </Button>
                    <Button variant="outline-secondary" size="sm">
                      <span className="material-icons me-1">more_vert</span>
                      Acciones
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="payments-table mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 text-center" style={{width: '40px'}}>
                        <Form.Check type="checkbox" />
                      </th>
                      <th className="border-0 fw-semibold" style={{width: '120px'}}>ID Pago</th>
                      <th className="border-0 fw-semibold">Concepto</th>
                      <th className="border-0 fw-semibold" style={{width: '100px'}}>Unidad</th>
                      <th className="border-0 fw-semibold" style={{width: '180px'}}>Residente</th>
                      <th className="border-0 fw-semibold text-end" style={{width: '120px'}}>Monto</th>
                      <th className="border-0 fw-semibold" style={{width: '130px'}}>Fecha</th>
                      <th className="border-0 fw-semibold text-center" style={{width: '100px'}}>Estado</th>
                      <th className="border-0 fw-semibold" style={{width: '120px'}}>Método</th>
                      <th className="border-0 fw-semibold text-center" style={{width: '120px'}}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((pago) => (
                      <tr key={pago.id} className="align-middle">
                        <td className="text-center">
                          <Form.Check type="checkbox" />
                        </td>
                        <td>
                          <div className="fw-bold text-primary">PAG-{pago.id.toString().padStart(4, '0')}</div>
                          <small className="text-muted d-block">{pago.transactionId}</small>
                        </td>
                        <td>
                          <div className="fw-medium">{pago.concepto}</div>
                          <small className="text-muted">Comunidad Las Flores</small>
                        </td>
                        <td>
                          <span className="fw-medium">Dpto. {300 + pago.id}</span>
                        </td>
                        <td>
                          <div className="fw-medium">María González</div>
                          <small className="text-muted">maria.gonzalez@email.com</small>
                        </td>
                        <td className="text-end">
                          <span className="fw-bold text-success">{formatCurrency(pago.monto)}</span>
                        </td>
                        <td>
                          <div className="fw-medium">{new Date(pago.fecha).toLocaleDateString('es-CL')}</div>
                          <small className="text-muted">{new Date(pago.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</small>
                        </td>
                        <td className="text-center">{getStatusBadge(pago.estado)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="material-icons me-2 text-muted small">{getMethodIcon(pago.metodoPago)}</span>
                            <div>
                              <div className="fw-medium small">{pago.metodoPago.replace('_', ' ')}</div>
                              <small className="text-muted">{pago.gateway?.toUpperCase()}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <Link href={`/pagos/${pago.id}`} passHref>
                              <Button variant="outline-primary" size="sm" title="Ver detalle">
                                <span className="material-icons small">visibility</span>
                              </Button>
                            </Link>
                            <Button variant="outline-secondary" size="sm" title="Editar">
                              <span className="material-icons small">edit</span>
                            </Button>
                            <Button variant="outline-success" size="sm" title="Imprimir">
                              <span className="material-icons small">print</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <div className="text-muted">
                  Mostrando 1-{pagos.length} de {pagos.length} pagos
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item disabled">
                      <span className="page-link">Anterior</span>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">1</span>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">2</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">3</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">Siguiente</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Component Integration - as required to maintain existing functionality */}
          <div className="mt-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <span className="material-icons me-2">add_card</span>
                  Procesar Nuevo Pago
                </h5>
              </Card.Header>
              <Card.Body>
                <PaymentComponent
                  communityId={1}
                  amount={150000}
                  description="Pago de cuota mensual"
                  onSuccess={(transactionId) => {
                    console.log('Pago exitoso:', transactionId);
                    // Refresh the payment list
                    window.location.reload();
                  }}
                  onError={(error) => {
                    console.error('Error en pago:', error);
                  }}
                />
              </Card.Body>
            </Card>
          </div>
        </Container>
      </Layout>
    </ProtectedRoute>
  );
};

export default Pagos;