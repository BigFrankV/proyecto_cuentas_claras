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
  Modal,
  Alert,
} from 'react-bootstrap';

import { pagosApi } from '@/lib/api/pagos';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import type { Pago, PaymentFilters, PaymentStats, EstadisticaPorEstado, EstadisticaPorMetodo } from '@/types/pagos';

import Layout from '../components/layout/Layout';
import PaymentComponent from '../components/PaymentComponent';

interface CargoPendiente {
  id: number;
  unidad_numero: string;
  nombre_comunidad: string;
  periodo: string;
  fecha_vencimiento: string;
  monto: number;
  saldo: number;
  estado: string;
  interes_acumulado: number;
  dias_vencido: number;
  tipo_cargo: 'cuenta_cobro' | 'multa';
  concepto: string;
  unidad_id: number;
}

const Pagos: React.FC = () => {
  const { user } = useAuth();
  const { comunidadSeleccionada } = useComunidad();

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

  // Estados para cargos pendientes
  const [cargosPendientes, setCargosPendientes] = useState<CargoPendiente[]>([]);
  const [selectedCargos, setSelectedCargos] = useState<Set<number>>(new Set());
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Estados para modal de desglose por estado
  const [showDesglosePorEstado, setShowDesglosePorEstado] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');
  const [pagosDesglose, setPagosDesglose] = useState<Pago[]>([]);
  const [loadingDesglose, setLoadingDesglose] = useState(false);

  // Get comunidad ID from context (cambia cuando el usuario selecciona otra comunidad)
  const comunidadId = comunidadSeleccionada?.id ? Number(comunidadSeleccionada.id) : user?.comunidad_id || null;

  // Verificar si es admin en la comunidad ACTUAL (solo via memberships)
  const isAdmin = user?.is_superadmin ||
    user?.memberships?.some((m: any) =>
      Number(m.comunidad_id) === comunidadId &&
      ['admin_comunidad', 'tesorero', 'presidente_comite'].includes(m.rol),
    );  // Load payments data
  const loadPayments = useCallback(async () => {
    if (!comunidadId) { return; }

    try {
      setLoading(true);
      const response = await pagosApi.getByComunidad(Number(comunidadId), {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
      });

      setPagos(response.data);
      setPagination(response.pagination);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error cargando pagos
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }, [comunidadId, filters, pagination.limit, pagination.offset]);

  // Load stats data
  const loadStats = useCallback(async () => {
    if (!comunidadId) { return; }

    try {
      const [statsData, statsEstado] = await Promise.all([
        pagosApi.getEstadisticas(Number(comunidadId)),
        pagosApi.getEstadisticasPorEstado(Number(comunidadId)),
      ]);

      setStats(statsData);
      setStatsPerEstado(statsEstado);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error cargando estadísticas - establecer valores por defecto
      setStats({
        totalPayments: 0,
        approvedPayments: 0,
        pendingPayments: 0,
        cancelledPayments: 0,
        totalAmount: 0,
        averageAmount: 0,
      });
      setStatsPerEstado([]);
    }
  }, [comunidadId]);

  // Cargar datos cuando cambia la comunidad o el usuario
  // Cargar cargos pendientes del usuario
  const loadCargosPendientes = useCallback(async () => {
    if (!user || !comunidadId) { return; }

    // Solo cargar cargos si NO es admin (los admins no pagan, solo gestionan)
    if (isAdmin) {
      setCargosPendientes([]);
      return;
    }

    setLoadingCargos(true);
    try {
      const response = await fetch(
        `/api/cargos/mis-pendientes?comunidad_id=${comunidadId}&estados=pendiente,vencido,parcial`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCargosPendientes(data.data || []);
      } else {
        setCargosPendientes([]);
      }
    } catch (error) {
      // Error cargando cargos pendientes
      setCargosPendientes([]);
    } finally {
      setLoadingCargos(false);
    }
  }, [user, comunidadId, isAdmin]);

  // Manejar selección de cargos
  const handleToggleCargo = (cargoId: number) => {
    setSelectedCargos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cargoId)) {
        newSet.delete(cargoId);
      } else {
        newSet.add(cargoId);
      }
      return newSet;
    });
  };

  const handleToggleAllCargos = () => {
    if (selectedCargos.size === cargosPendientes.length && cargosPendientes.length > 0) {
      setSelectedCargos(new Set());
    } else {
      setSelectedCargos(new Set(cargosPendientes.map(c => c.id)));
    }
  };

  // Calcular total seleccionado
  const cargosSeleccionados = cargosPendientes.filter(c => selectedCargos.has(c.id));
  const totalSeleccionado = cargosSeleccionados.reduce(
    (sum, c) => sum + c.saldo + c.interes_acumulado,
    0,
  );

  // Función para cargar desglose de pagos por estado
  const handleVerDesglosePorEstado = async (estado: string) => {
    setEstadoSeleccionado(estado);
    setShowDesglosePorEstado(true);
    setLoadingDesglose(true);

    try {
      const response = await pagosApi.getByComunidad(Number(comunidadId), {
        search: '',
        status: estado,
        method: '',
        dateFrom: '',
        dateTo: '',
        limit: 1000, // Cargar todos los pagos de ese estado
        offset: 0,
      });

      setPagosDesglose(response.data);
    } catch (error) {
      // Error cargando desglose
      setPagosDesglose([]);
    } finally {
      setLoadingDesglose(false);
    }
  };

  // Procesar pago con Webpay
  const handlePagarConWebpay = () => {
    if (selectedCargos.size === 0) {
      alert('Debes seleccionar al menos un cargo');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      // Aplicar pago a los cargos seleccionados
      const response = await fetch('/api/pagos/aplicar-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          order_id: `PAY-${Date.now()}`,
          transaction_id: transactionId,
          amount: totalSeleccionado,
          cargos: cargosSeleccionados.map(c => ({
            cargo_id: c.id,
            monto: c.saldo + c.interes_acumulado,
            tipo: c.tipo_cargo,
            unidad_id: c.unidad_id,
            comunidad_id: comunidadId,
          })),
        }),
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setSelectedCargos(new Set());
        loadCargosPendientes(); // Recargar cargos
        loadPayments(); // Recargar historial
        loadStats(); // Actualizar estadísticas
        alert('¡Pago procesado exitosamente!');
      } else {
        alert('Error al registrar el pago');
      }
    } catch (error) {
      // Error aplicando pago
      alert('Error al aplicar el pago');
    }
  };

  // Efecto para manejar cambios de comunidad
  useEffect(() => {
    if (comunidadId) {
      // Resetear estados cuando cambia la comunidad
      setSelectedCargos(new Set());
      setPagination({ total: 0, limit: 20, offset: 0, hasMore: false });
      
      // Recargar datos
      loadPayments();
      loadStats();
      if (!isAdmin) {
        loadCargosPendientes();
      }
    }
  }, [comunidadId, isAdmin]);

  // Efecto para recargar cuando cambian los filtros o paginación
  useEffect(() => {
    if (comunidadId) {
      loadPayments();
    }
  }, [filters.search, filters.status, filters.method, filters.dateFrom, filters.dateTo, pagination.offset]);

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

  // Configuración de estados con nombres en español
  // El backend transforma los estados de la tabla 'pago' a inglés:
  // DB: pendiente/aplicado/reversado → API: pending/approved/cancelled
  const statusConfig = {
    // Estados que vienen del backend (en inglés)
    pending: {
      variant: 'warning' as const,
      text: 'Pendiente',
      icon: 'schedule',
    },
    approved: {
      variant: 'success' as const,
      text: 'Aplicado',
      icon: 'check_circle',
    },
    cancelled: {
      variant: 'danger' as const,
      text: 'Reversado',
      icon: 'cancel',
    },
    // Estados de la BD directos (por si vienen en español)
    pendiente: {
      variant: 'warning' as const,
      text: 'Pendiente',
      icon: 'schedule',
    },
    aplicado: {
      variant: 'success' as const,
      text: 'Aplicado',
      icon: 'check_circle',
    },
    reversado: {
      variant: 'danger' as const,
      text: 'Reversado',
      icon: 'cancel',
    },
    // Estados legacy de payment_transaction (por compatibilidad)
    completed: {
      variant: 'success' as const,
      text: 'Completado',
      icon: 'check_circle',
    },
    failed: {
      variant: 'danger' as const,
      text: 'Fallido',
      icon: 'error',
    },
    refunded: {
      variant: 'secondary' as const,
      text: 'Reembolsado',
      icon: 'undo',
    },
  };

  const getStatusConfig = (estado: string) => {
    return statusConfig[estado as keyof typeof statusConfig] || statusConfig.pendiente;
  };

  const getStatusBadge = (estado: string) => {
    const config = getStatusConfig(estado);

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
      webpay: 'credit_card',
    };
    return icons[method] || 'payment';
  };

  // Función para detectar el tipo de pago según el concepto
  const getTipoPago = (concepto: string) => {
    const conceptoLower = concepto?.toLowerCase() || '';

    if (conceptoLower.includes('multa')) {
      return { tipo: 'Multa', variant: 'danger' as const, icon: 'gavel' };
    }
    if (conceptoLower.includes('gasto común') || conceptoLower.includes('gasto comun')) {
      return { tipo: 'Gasto Común', variant: 'primary' as const, icon: 'home' };
    }
    if (conceptoLower.includes('cargo') || conceptoLower.includes('cuota')) {
      return { tipo: 'Cargo', variant: 'info' as const, icon: 'receipt' };
    }
    if (conceptoLower.includes('agua') || conceptoLower.includes('luz') || conceptoLower.includes('gas')) {
      return { tipo: 'Servicio', variant: 'warning' as const, icon: 'water_drop' };
    }
    if (conceptoLower.includes('extraordinario')) {
      return { tipo: 'Extraordinario', variant: 'secondary' as const, icon: 'star' };
    }

    return { tipo: 'Otro', variant: 'secondary' as const, icon: 'payments' };
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
          {/* Mensaje si no hay comunidad seleccionada */}
          {!comunidadId && (
            <Alert variant='info'>
              <Alert.Heading>
                <span className='material-icons me-2'>info</span>
                Seleccione una comunidad
              </Alert.Heading>
              <p className='mb-0'>
                Por favor seleccione una comunidad del menú superior para ver los pagos y cargos pendientes.
              </p>
            </Alert>
          )}

          {/* Contenido principal solo si hay comunidad */}
          {comunidadId && (
            <>
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
                          <h1 className='h2 mb-1 text-white'>
                            Pagos
                          </h1>
                          <p className='mb-0 opacity-75'>
                            {isAdmin
                              ? 'Gestión completa de pagos de la comunidad'
                              : 'Consulta tu historial de pagos'}
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

               {/* Additional Stats - Por Estado */}
              <Row className='mb-4'>
                <Col lg={12} md={12} className='mb-3'>
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
                              <th className='text-center'>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statsPerEstado.map((stat) => {
                              const config = getStatusConfig(stat.status);
                              return (
                                <tr key={stat.status}>
                                  <td>
                                    <Badge bg={config.variant} className='d-flex align-items-center gap-1'>
                                      <span className='material-icons' style={{ fontSize: '14px' }}>
                                        {config.icon}
                                      </span>
                                      {config.text}
                                    </Badge>
                                  </td>
                                  <td className='text-end fw-bold'>{stat.count}</td>
                                  <td className='text-end text-success fw-bold'>
                                    {formatCurrency(stat.total_amount)}
                                  </td>
                                  <td className='text-end text-info'>
                                    {formatCurrency(stat.average_amount)}
                                  </td>
                                  <td className='text-center'>
                                    <Button
                                      variant='outline-primary'
                                      size='sm'
                                      onClick={() => handleVerDesglosePorEstado(stat.status)}
                                      title='Ver desglose detallado'
                                    >
                                      <span className='material-icons' style={{ fontSize: '16px' }}>
                                        visibility
                                      </span>
                                      <span className='ms-1 d-none d-md-inline'>Desglose</span>
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Cargos y Multas Pendientes Table */}
              <Card className='payments-table-card'>
                <Card.Header className='bg-white border-bottom'>
                  <Row className='align-items-center'>
                    <Col>
                      <h6 className='mb-0 fw-bold'>
                        <span className='material-icons me-2'>receipt_long</span>
                        Cargos y Multas Pendientes ({cargosPendientes.length})
                      </h6>
                    </Col>
                    <Col xs='auto'>
                      <div className='d-flex gap-2'>
                        <Form.Check
                          type='checkbox'
                          label='Seleccionar Todos'
                          checked={selectedCargos.size === cargosPendientes.length && cargosPendientes.length > 0}
                          onChange={handleToggleAllCargos}
                        />
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
                            <Form.Check
                              type='checkbox'
                              checked={selectedCargos.size === cargosPendientes.length && cargosPendientes.length > 0}
                              onChange={handleToggleAllCargos}
                            />
                          </th>
                          <th
                            className='border-0 fw-semibold'
                            style={{ width: '110px' }}
                          >
                            Tipo
                          </th>
                          <th className='border-0 fw-semibold'>Concepto</th>
                          <th className='border-0 fw-semibold' style={{ width: '100px' }}>Unidad</th>
                          <th className='border-0 fw-semibold' style={{ width: '110px' }}>Período</th>
                          <th className='border-0 fw-semibold' style={{ width: '130px' }}>Vencimiento</th>
                          <th className='border-0 fw-semibold text-center' style={{ width: '100px' }}>Estado</th>
                          <th className='border-0 fw-semibold text-end' style={{ width: '110px' }}>Saldo</th>
                          <th className='border-0 fw-semibold text-end' style={{ width: '110px' }}>Interés</th>
                          <th className='border-0 fw-semibold text-end' style={{ width: '120px' }}>Total</th>
                          <th
                            className='border-0 fw-semibold text-center'
                            style={{ width: '200px' }}
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingCargos ? (
                          <tr>
                            <td colSpan={11} className='text-center py-5'>
                              <Spinner animation='border' />
                              <p className='mt-2 text-muted'>Cargando cargos...</p>
                            </td>
                          </tr>
                        ) : cargosPendientes.length === 0 ? (
                          <tr>
                            <td colSpan={11} className='text-center py-4'>
                              <i className='material-icons' style={{ fontSize: '3rem', color: '#ccc' }}>
                                inbox
                              </i>
                              <p className='text-muted mt-2'>
                                {isAdmin
                                  ? 'Los administradores no tienen cargos pendientes'
                                  : 'No tienes cargos pendientes para mostrar'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          cargosPendientes.map(cargo => {
                            const tipoCargo = getTipoPago(cargo.concepto);
                            const totalAPagar = cargo.saldo + cargo.interes_acumulado;
                            const isSelected = selectedCargos.has(cargo.id);
                            
                            return (
                              <tr 
                                key={cargo.id} 
                                className={`align-middle ${isSelected ? 'table-active' : ''}`}
                              >
                                <td className='text-center'>
                                  <Form.Check
                                    type='checkbox'
                                    checked={isSelected}
                                    onChange={() => handleToggleCargo(cargo.id)}
                                  />
                                </td>
                                <td>
                                  <Badge bg={tipoCargo.variant} className='d-flex align-items-center gap-1'>
                                    <span className='material-icons' style={{ fontSize: '14px' }}>
                                      {tipoCargo.icon}
                                    </span>
                                    {tipoCargo.tipo}
                                  </Badge>
                                </td>
                                <td>
                                  <div className='fw-medium'>{cargo.concepto}</div>
                                  <small className='text-muted'>
                                    {cargo.nombre_comunidad}
                                  </small>
                                </td>
                                <td>
                                  <span className='fw-medium'>{cargo.unidad_numero}</span>
                                </td>
                                <td>
                                  <div className='fw-medium'>{cargo.periodo}</div>
                                </td>
                                <td>
                                  <div className='fw-medium'>
                                    {new Date(cargo.fecha_vencimiento).toLocaleDateString('es-CL')}
                                  </div>
                                  {new Date(cargo.fecha_vencimiento) < new Date() && (
                                    <small className='text-danger'>
                                      <span className='material-icons' style={{ fontSize: '12px' }}>warning</span>
                                      Vencido
                                    </small>
                                  )}
                                </td>
                                <td className='text-center'>
                                  {getStatusBadge(cargo.estado)}
                                </td>
                                <td className='text-end'>
                                  <span className='fw-medium'>
                                    {formatCurrency(cargo.saldo)}
                                  </span>
                                </td>
                                <td className='text-end'>
                                  <span className={cargo.interes_acumulado > 0 ? 'text-danger fw-medium' : 'text-muted'}>
                                    {formatCurrency(cargo.interes_acumulado)}
                                  </span>
                                </td>
                                <td className='text-end'>
                                  <span className='fw-bold text-success'>
                                    {formatCurrency(totalAPagar)}
                                  </span>
                                </td>
                                <td>
                                  <div className='d-flex justify-content-center gap-1'>
                                    <Link 
                                      href={cargo.tipo_cargo === 'multa' 
                                        ? `/multas/${cargo.id}` 
                                        : `/cargos/${cargo.id}`
                                      } 
                                      passHref
                                    >
                                      <Button
                                        variant='outline-primary'
                                        size='sm'
                                        title='Ver detalle'
                                      >
                                        <span className='material-icons small'>visibility</span>
                                      </Button>
                                    </Link>
                                    <Button
                                      variant='success'
                                      size='sm'
                                      title='Pagar'
                                      onClick={() => {
                                        setSelectedCargos(new Set([cargo.id]));
                                        handlePagarConWebpay();
                                      }}
                                    >
                                      <span className='material-icons small'>credit_card</span>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {/* Botón flotante para pagar selección */}
              {selectedCargos.size > 0 && (
                <Alert 
                  variant='success' 
                  className='position-sticky bottom-0 d-flex justify-content-between align-items-center shadow-lg'
                  style={{ 
                    zIndex: 1000,
                    marginTop: '20px',
                    borderRadius: '12px',
                    padding: '20px',
                  }}
                >
                  <div className='d-flex align-items-center gap-3'>
                    <span className='material-icons' style={{ fontSize: '32px' }}>check_circle</span>
                    <div>
                      <strong style={{ fontSize: '18px' }}>
                        {selectedCargos.size} cargo(s) seleccionado(s)
                      </strong>
                      <div className='mt-1' style={{ fontSize: '14px' }}>
                        Total a pagar: <strong style={{ fontSize: '20px' }}>{formatCurrency(totalSeleccionado)}</strong>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant='light' 
                    size='lg' 
                    onClick={handlePagarConWebpay}
                    className='d-flex align-items-center gap-2'
                    style={{ 
                      padding: '12px 32px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    <span className='material-icons'>credit_card</span>
                    Pagar Selección con Webpay
                  </Button>
                </Alert>
              )}

              {/* SECCIÓN ELIMINADA: Cargos Pendientes duplicada */}

              {/* Modal de Pago con Webpay */}
              <Modal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                size='lg'
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    <span className='material-icons me-2'>credit_card</span>
                    Pagar con Webpay
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className='mb-3'>
                    <h6>Resumen del pago:</h6>
                    <ul className='list-unstyled'>
                      {cargosSeleccionados.map(cargo => (
                        <li key={cargo.id} className='d-flex justify-content-between py-2 border-bottom'>
                          <span>{cargo.concepto} - {cargo.unidad_numero}</span>
                          <strong>{formatCurrency(cargo.saldo + cargo.interes_acumulado)}</strong>
                        </li>
                      ))}
                    </ul>
                    <div className='d-flex justify-content-between pt-3'>
                      <strong>TOTAL A PAGAR:</strong>
                      <strong className='text-success fs-4'>
                        {formatCurrency(totalSeleccionado)}
                      </strong>
                    </div>
                  </div>

                  <PaymentComponent
                    communityId={Number(comunidadId)}
                    unitId={cargosSeleccionados[0]?.unidad_id}
                    amount={totalSeleccionado}
                    description={`Pago de ${selectedCargos.size} cargo(s)`}
                    onSuccess={handlePaymentSuccess}
                    onError={error => {
                      alert(`Error en el pago: ${error}`);
                      setShowPaymentModal(false);
                    }}
                    onCancel={() => setShowPaymentModal(false)}
                  />
                </Modal.Body>
              </Modal>

              {/* Modal de Desglose por Estado */}
              <Modal
                show={showDesglosePorEstado}
                onHide={() => setShowDesglosePorEstado(false)}
                size='xl'
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title className='d-flex align-items-center'>
                    <span className='material-icons me-2'>list_alt</span>
                    <span className='me-2'>Desglose de Pagos - Estado:</span>
                    {estadoSeleccionado && (() => {
                      const config = getStatusConfig(estadoSeleccionado);
                      return (
                        <Badge bg={config.variant} className='d-flex align-items-center gap-1'>
                          <span className='material-icons' style={{ fontSize: '14px' }}>
                            {config.icon}
                          </span>
                          {config.text}
                        </Badge>
                      );
                    })()}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {loadingDesglose ? (
                    <div className='text-center py-5'>
                      <Spinner animation='border' variant='primary' />
                      <p className='mt-3 text-muted'>Cargando pagos...</p>
                    </div>
                  ) : pagosDesglose.length === 0 ? (
                    <Alert variant='info'>
                      <span className='material-icons me-2'>info</span>
                      No hay pagos en estado &quot;{getStatusConfig(estadoSeleccionado).text}&quot;
                    </Alert>
                  ) : (
                    <>
                      <div className='mb-3'>
                        <strong>Total de pagos:</strong> {pagosDesglose.length} |
                        <strong className='ms-3'>Monto total:</strong> <span className='text-success'>
                          {formatCurrency(pagosDesglose.reduce((sum, p) => sum + p.monto, 0))}
                        </span>
                      </div>
                      <div className='table-responsive' style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <Table striped hover size='sm'>
                          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                            <tr>
                              <th>Tipo</th>
                              <th>ID</th>
                              <th>Fecha</th>
                              <th>Unidad</th>
                              <th>Persona</th>
                              <th>Concepto</th>
                              <th className='text-end'>Monto</th>
                              <th>Método</th>
                              <th>Estado</th>
                              <th>Referencia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagosDesglose.map((pago) => {
                              const tipoPago = getTipoPago(pago.concepto);
                              return (
                                <tr key={pago.id}>
                                  <td>
                                    <Badge bg={tipoPago.variant} className='d-flex align-items-center gap-1'>
                                      <span className='material-icons' style={{ fontSize: '14px' }}>
                                        {tipoPago.icon}
                                      </span>
                                      {tipoPago.tipo}
                                    </Badge>
                                  </td>
                                  <td className='text-muted'>#{pago.id}</td>
                                  <td>
                                    {new Date(pago.fecha).toLocaleDateString('es-CL', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </td>
                                  <td>
                                    <Badge bg='light' text='dark'>
                                      {pago.unitNumber || 'N/A'}
                                    </Badge>
                                  </td>
                                  <td>{pago.residentName || 'N/A'}</td>
                                  <td>
                                    <div className='text-truncate' style={{ maxWidth: '200px' }} title={pago.concepto || 'Sin concepto'}>
                                      {pago.concepto || 'Sin concepto'}
                                    </div>
                                  </td>
                                  <td className='text-end'>
                                    <strong className='text-success'>
                                      {formatCurrency(pago.monto)}
                                    </strong>
                                  </td>
                                  <td>
                                    <span className='material-icons me-1' style={{ fontSize: '16px', verticalAlign: 'middle' }}>
                                      {getMethodIcon(pago.metodoPago)}
                                    </span>
                                    <span className='text-capitalize small'>
                                      {pago.metodoPago?.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td>{getStatusBadge(pago.estado)}</td>
                                  <td>
                                    <small className='text-muted'>
                                      {pago.reference || '-'}
                                    </small>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant='secondary' onClick={() => setShowDesglosePorEstado(false)}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Pagos;
