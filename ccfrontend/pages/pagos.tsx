import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  Badge,
  Card,
  Spinner,
  InputGroup,
} from 'react-bootstrap';

import { pagosApi } from '@/lib/api/pagos';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import type { Pago, PaymentFilters, PaymentStats, EstadisticaPorEstado, EstadisticaPorMetodo } from '@/types/pagos';

import Layout from '../components/layout/Layout';
import PaymentComponent from '../components/PaymentComponent';

const Pagos: React.FC = () => {
  const { user } = useAuth();
  
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({
    search: '',
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
  });
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    approvedPayments: 0,
    pendingPayments: 0,
    cancelledPayments: 0,
    totalAmount: 0,
    averageAmount: 0,
  });
  const [statsPerEstado, setStatsPerEstado] = useState<EstadisticaPorEstado[]>([]);
  const [statsPerMetodo, setStatsPerMetodo] = useState<EstadisticaPorMetodo[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  // Get comunidad ID from user
  const comunidadId = user?.comunidad_id || 1;

  // Load payments data
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pagosApi.getByComunidad(comunidadId, {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      setPagos(response.data);
      setPagination(response.pagination);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset, comunidadId]);

  // Load stats data
  const loadStats = useCallback(async () => {
    try {
      const [statsData, statsEstado, statsMetodo] = await Promise.all([
        pagosApi.getEstadisticas(comunidadId),
        pagosApi.getEstadisticasPorEstado(comunidadId),
        pagosApi.getEstadisticasPorMetodo(comunidadId),
      ]);

      setStats(statsData);
      setStatsPerEstado(statsEstado);
      setStatsPerMetodo(statsMetodo);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error loading stats
    }
  }, [comunidadId]);

  useEffect(() => {
    loadPayments();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-apply search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== '') {
        setPagination(prev => ({ ...prev, offset: 0 }));
        loadPayments();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, loadPayments]);

  const handleFilterChange = (field: keyof PaymentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    loadPayments();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      method: '',
      dateFrom: '',
      dateTo: '',
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
    loadPayments();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      aprobado: {
        variant: 'success',
        text: 'Confirmado',
        icon: 'check_circle',
      },
      pendiente: { variant: 'warning', text: 'Pendiente', icon: 'schedule' },
      rechazado: { variant: 'danger', text: 'Rechazado', icon: 'cancel' },
      cancelado: { variant: 'secondary', text: 'Cancelado', icon: 'block' },
    };

    const config =
      statusConfig[estado as keyof typeof statusConfig] ||
      statusConfig.pendiente;

    return (
      <Badge bg={config.variant} className='d-flex align-items-center gap-1'>
        <span className='material-icons' style={{ fontSize: '14px' }}>
          {config.icon}
        </span>
        {config.text}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      transferencia: 'account_balance',
      tarjeta_credito: 'credit_card',
      efectivo: 'payments',
      debito: 'payment',
    };
    return icons[method] || 'payment';
  };

  if (loading) {
    return (
      <Layout>
        <Container className='d-flex justify-content-center py-5'>
          <Spinner animation='border' />
        </Container>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className='container-fluid py-4'>
          {/* Header Profesional */}
          <div className='container-fluid p-0'>
            <div
              className='text-white'
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className='p-4'>
                <div
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-5%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                  }}
                />
                <div className='d-flex align-items-center justify-content-between'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-4'
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '32px', color: 'white' }}
                      >
                        payments
                      </i>
                    </div>
                    <div>
                      <h1 className='h2 mb-1 text-white'>Pagos</h1>
                      <p className='mb-0 opacity-75'>
                        Gestión de pagos y transacciones
                      </p>
                    </div>
                  </div>
                  <div className='text-end'>
                    <Button variant='light' size='lg'>
                      <span className='material-icons me-2'>add_circle</span>
                      Nuevo Pago
                    </Button>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className='row mt-4'>
                  <div className='col-md-3 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>payments</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{stats.totalPayments}</div>
                          <div className='text-white-50'>Total Pagos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-3 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>check_circle</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{stats.approvedPayments}</div>
                          <div className='text-white-50'>Confirmados</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-3 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-warning)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>schedule</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{stats.pendingPayments}</div>
                          <div className='text-white-50'>Pendientes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-3 mb-3'>
                    <div
                      className='p-3 rounded-3 text-white'
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className='d-flex align-items-center'>
                        <div
                          className='me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>cancel</i>
                        </div>
                        <div>
                          <div className='h3 mb-0'>{stats.cancelledPayments}</div>
                          <div className='text-white-50'>Cancelados</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de estadísticas mejoradas */}
          <Row className='mb-4'>
            <Col lg={3} md={6} className='mb-3'>
              <Card className='stat-card h-100'>
                <Card.Body className='text-center'>
                  <div className='stat-card-icon mb-3'>
                    <span className='material-icons'>payments</span>
                  </div>
                  <h3 className='stat-card-value'>{stats.totalPayments}</h3>
                  <p className='stat-card-label mb-2'>Total de Pagos</p>
                  <small className='stat-card-change text-success'>
                    <span className='material-icons'>trending_up</span>
                    {stats.cancelledPayments > 0 && `${stats.cancelledPayments} cancelados`}
                  </small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className='mb-3'>
              <Card className='stat-card h-100'>
                <Card.Body className='text-center'>
                  <div className='stat-card-icon success mb-3'>
                    <span className='material-icons'>check_circle</span>
                  </div>
                  <h3 className='stat-card-value'>{stats.approvedPayments}</h3>
                  <p className='stat-card-label mb-2'>Confirmados</p>
                  <small className='stat-card-change text-success'>
                    <span className='material-icons'>trending_up</span>
                    {stats.approvedAmount && formatCurrency(stats.approvedAmount)}
                  </small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className='mb-3'>
              <Card className='stat-card h-100'>
                <Card.Body className='text-center'>
                  <div className='stat-card-icon warning mb-3'>
                    <span className='material-icons'>schedule</span>
                  </div>
                  <h3 className='stat-card-value'>{stats.pendingPayments}</h3>
                  <p className='stat-card-label mb-2'>Pendientes</p>
                  <small className='stat-card-change text-warning'>
                    <span className='material-icons'>trending_down</span>
                    Por procesar
                  </small>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className='mb-3'>
              <Card className='stat-card h-100'>
                <Card.Body className='text-center'>
                  <div className='stat-card-icon info mb-3'>
                    <span className='material-icons'>attach_money</span>
                  </div>
                  <h3 className='stat-card-value'>
                    {formatCurrency(stats.totalAmount)}
                  </h3>
                  <p className='stat-card-label mb-2'>Total Recaudado</p>
                  <small className='stat-card-change text-success'>
                    Promedio: {formatCurrency(stats.averageAmount)}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional Stats - Por Estado y Por Método */}
          <Row className='mb-4'>
            <Col lg={6} md={12} className='mb-3'>
              <Card>
                <Card.Header className='bg-light'>
                  <h6 className='mb-0'>
                    <span className='material-icons me-2'>assessment</span>
                    Pagos por Estado
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className='table-responsive'>
                    <Table size='sm' className='mb-0'>
                      <thead>
                        <tr>
                          <th>Estado</th>
                          <th className='text-end'>Cantidad</th>
                          <th className='text-end'>Monto Total</th>
                          <th className='text-end'>Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsPerEstado.map((stat) => (
                          <tr key={stat.status}>
                            <td>
                              <Badge bg='secondary' className='text-capitalize'>
                                {stat.status}
                              </Badge>
                            </td>
                            <td className='text-end fw-bold'>{stat.count}</td>
                            <td className='text-end text-success fw-bold'>
                              {formatCurrency(stat.total_amount)}
                            </td>
                            <td className='text-end text-info'>
                              {formatCurrency(stat.average_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} md={12} className='mb-3'>
              <Card>
                <Card.Header className='bg-light'>
                  <h6 className='mb-0'>
                    <span className='material-icons me-2'>payment</span>
                    Pagos por Método
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className='table-responsive'>
                    <Table size='sm' className='mb-0'>
                      <thead>
                        <tr>
                          <th>Método</th>
                          <th className='text-end'>Cantidad</th>
                          <th className='text-end'>Monto Total</th>
                          <th className='text-end'>Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsPerMetodo.map((stat) => (
                          <tr key={stat.payment_method}>
                            <td>
                              <div className='d-flex align-items-center'>
                                <span className='material-icons me-2 small text-muted'>
                                  {getMethodIcon(stat.payment_method)}
                                </span>
                                <span className='text-capitalize'>
                                  {stat.payment_method.replace('_', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className='text-end fw-bold'>{stat.count}</td>
                            <td className='text-end text-success fw-bold'>
                              {formatCurrency(stat.total_amount)}
                            </td>
                            <td className='text-end text-info'>
                              {formatCurrency(stat.average_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Advanced Filters */}
          <Card className='filter-card mb-4'>
            <Card.Header className='bg-light'>
              <Row className='align-items-center'>
                <Col>
                  <h6 className='mb-0 fw-bold'>
                    <span className='material-icons me-2'>filter_alt</span>
                    Filtros de Búsqueda
                  </h6>
                </Col>
                <Col xs='auto'>
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    onClick={handleClearFilters}
                  >
                    <span className='material-icons me-1'>refresh</span>
                    Limpiar
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className='g-3 align-items-end'>
                <Col md={4}>
                  <Form.Label className='small fw-medium text-muted mb-1'>
                    Buscar pagos
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className='bg-light border-end-0'>
                      <span className='material-icons text-muted'>search</span>
                    </InputGroup.Text>
                    <Form.Control
                      type='text'
                      placeholder='ID, concepto, residente...'
                      value={filters.search}
                      onChange={e =>
                        handleFilterChange('search', e.target.value)
                      }
                      className='border-start-0'
                    />
                  </InputGroup>
                </Col>

                <Col md={2}>
                  <Form.Label className='small fw-medium text-muted mb-1'>
                    Estado
                  </Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}
                  >
                    <option value=''>Todos</option>
                    <option value='aprobado'>Confirmado</option>
                    <option value='pendiente'>Pendiente</option>
                    <option value='rechazado'>Rechazado</option>
                    <option value='cancelado'>Cancelado</option>
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Label className='small fw-medium text-muted mb-1'>
                    Método
                  </Form.Label>
                  <Form.Select
                    value={filters.method}
                    onChange={e => handleFilterChange('method', e.target.value)}
                  >
                    <option value=''>Todos</option>
                    <option value='transferencia'>Transferencia</option>
                    <option value='tarjeta_credito'>Tarjeta</option>
                    <option value='efectivo'>Efectivo</option>
                    <option value='debito'>Débito</option>
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Label className='small fw-medium text-muted mb-1'>
                    Desde
                  </Form.Label>
                  <Form.Control
                    type='date'
                    value={filters.dateFrom}
                    onChange={e =>
                      handleFilterChange('dateFrom', e.target.value)
                    }
                  />
                </Col>

                <Col md={2}>
                  <Form.Label className='small fw-medium text-muted mb-1'>
                    Hasta
                  </Form.Label>
                  <Form.Control
                    type='date'
                    value={filters.dateTo}
                    onChange={e => handleFilterChange('dateTo', e.target.value)}
                  />
                </Col>

                <Col md={12}>
                  <div className='d-flex gap-2'>
                    <Button variant='primary' size='sm' onClick={handleSearch}>
                      <span className='material-icons me-1'>search</span>
                      Buscar
                    </Button>
                    <Button
                      variant='outline-secondary'
                      size='sm'
                      onClick={handleClearFilters}
                    >
                      <span className='material-icons me-1'>clear</span>
                      Limpiar
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Payments Table */}
          <Card className='payments-table-card'>
            <Card.Header className='bg-white border-bottom'>
              <Row className='align-items-center'>
                <Col>
                  <h6 className='mb-0 fw-bold'>
                    <span className='material-icons me-2'>view_list</span>
                    Lista de Pagos ({pagos.length}/{pagination.total})
                  </h6>
                </Col>
                <Col xs='auto'>
                  <div className='d-flex gap-2'>
                    <Button variant='outline-primary' size='sm'>
                      <span className='material-icons me-1'>select_all</span>
                      Seleccionar Todo
                    </Button>
                    <Button variant='outline-secondary' size='sm'>
                      <span className='material-icons me-1'>more_vert</span>
                      Acciones
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className='p-0'>
              <div className='table-responsive'>
                <Table hover className='payments-table mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th
                        className='border-0 text-center'
                        style={{ width: '40px' }}
                      >
                        <Form.Check type='checkbox' />
                      </th>
                      <th
                        className='border-0 fw-semibold'
                        style={{ width: '120px' }}
                      >
                        ID Pago
                      </th>
                      <th className='border-0 fw-semibold'>Concepto</th>
                      <th
                        className='border-0 fw-semibold'
                        style={{ width: '100px' }}
                      >
                        Unidad
                      </th>
                      <th
                        className='border-0 fw-semibold'
                        style={{ width: '180px' }}
                      >
                        Residente
                      </th>
                      <th
                        className='border-0 fw-semibold text-end'
                        style={{ width: '120px' }}
                      >
                        Monto
                      </th>
                      <th
                        className='border-0 fw-semibold'
                        style={{ width: '130px' }}
                      >
                        Fecha
                      </th>
                      <th
                        className='border-0 fw-semibold text-center'
                        style={{ width: '100px' }}
                      >
                        Estado
                      </th>
                      <th
                        className='border-0 fw-semibold'
                        style={{ width: '120px' }}
                      >
                        Método
                      </th>
                      <th
                        className='border-0 fw-semibold text-center'
                        style={{ width: '120px' }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.length === 0 ? (
                      <tr>
                        <td colSpan={10} className='text-center py-4'>
                          <i className='material-icons' style={{ fontSize: '3rem', color: '#ccc' }}>
                            inbox
                          </i>
                          <p className='text-muted mt-2'>No hay pagos para mostrar</p>
                        </td>
                      </tr>
                    ) : (
                      pagos.map(pago => (
                        <tr key={pago.id} className='align-middle'>
                          <td className='text-center'>
                            <Form.Check type='checkbox' />
                          </td>
                          <td>
                            <div className='fw-bold text-primary'>
                              PAG-{pago.id.toString().padStart(4, '0')}
                            </div>
                            <small className='text-muted d-block'>
                              {pago.transactionId || pago.orderId}
                            </small>
                          </td>
                          <td>
                            <div className='fw-medium'>{pago.concepto}</div>
                            <small className='text-muted'>
                              {pago.communityName || 'Comunidad'}
                            </small>
                          </td>
                          <td>
                            <span className='fw-medium'>
                              {pago.unitNumber || `Dpto. ${300 + pago.id}`}
                            </span>
                          </td>
                          <td>
                            <div className='fw-medium'>
                              {pago.residentName || 'Residente'}
                            </div>
                            <small className='text-muted'>
                              {pago.residentEmail || 'N/A'}
                            </small>
                          </td>
                          <td className='text-end'>
                            <span className='fw-bold text-success'>
                              {formatCurrency(pago.monto)}
                            </span>
                          </td>
                          <td>
                            <div className='fw-medium'>
                              {new Date(pago.fecha).toLocaleDateString('es-CL')}
                            </div>
                            <small className='text-muted'>
                              {new Date(pago.fecha).toLocaleTimeString('es-CL', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </small>
                          </td>
                          <td className='text-center'>
                            {getStatusBadge(pago.estado)}
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <span className='material-icons me-2 text-muted small'>
                                {getMethodIcon(pago.metodoPago)}
                              </span>
                              <div>
                                <div className='fw-medium small'>
                                  {pago.metodoPago.replace('_', ' ')}
                                </div>
                                <small className='text-muted'>
                                  {pago.gateway?.toUpperCase() || 'N/A'}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className='d-flex justify-content-center gap-1'>
                              <Link href={`/pagos/${pago.id}`} passHref>
                                <Button
                                  variant='outline-primary'
                                  size='sm'
                                  title='Ver detalle'
                                >
                                  <span className='material-icons small'>
                                    visibility
                                  </span>
                                </Button>
                              </Link>
                              <Button
                                variant='outline-secondary'
                                size='sm'
                                title='Editar'
                              >
                                <span className='material-icons small'>edit</span>
                              </Button>
                              <Button
                                variant='outline-success'
                                size='sm'
                                title='Imprimir'
                              >
                                <span className='material-icons small'>
                                  print
                                </span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='d-flex justify-content-between align-items-center p-3 border-top'>
                <div className='text-muted'>
                  Mostrando {pagination.offset + 1}-
                  {Math.min(pagination.offset + pagos.length, pagination.total)}{' '}
                  de {pagination.total} pagos
                </div>
                <nav>
                  <ul className='pagination pagination-sm mb-0'>
                    <li
                      className={`page-item ${pagination.offset === 0 ? 'disabled' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() =>
                          setPagination(prev => ({
                            ...prev,
                            offset: Math.max(0, prev.offset - prev.limit),
                          }))
                        }
                        disabled={pagination.offset === 0}
                      >
                        Anterior
                      </button>
                    </li>
                    <li className='page-item active'>
                      <span className='page-link'>
                        {Math.floor(pagination.offset / pagination.limit) + 1}
                      </span>
                    </li>
                    <li
                      className={`page-item ${!pagination.hasMore ? 'disabled' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() =>
                          setPagination(prev => ({
                            ...prev,
                            offset: prev.offset + prev.limit,
                          }))
                        }
                        disabled={!pagination.hasMore}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Component Integration */}
          <div className='mt-4'>
            <Card>
              <Card.Header>
                <h5 className='mb-0'>
                  <span className='material-icons me-2'>add_card</span>
                  Procesar Nuevo Pago
                </h5>
              </Card.Header>
              <Card.Body>
                <PaymentComponent
                  communityId={comunidadId}
                  amount={150000}
                  description='Pago de cuota mensual'
                  onSuccess={_transactionId => {
                    window.location.reload();
                  }}
                  onError={_error => {
                    // Payment error
                  }}
                />
              </Card.Body>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Pagos;
