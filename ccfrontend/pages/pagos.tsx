import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import PaymentComponent from '@/components/PaymentComponent';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

interface Transaction {
  orderId: string;
  amount: number;
  gateway: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentFilter {
  status: string;
  gateway: string;
  page: number;
  limit: number;
}

export default function PagosListado() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [filters, setFilters] = useState<PaymentFilter>({
    status: '',
    gateway: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 20
  });

  // Datos para nuevo pago
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    description: '',
    communityId: 1 // Esto debería venir del contexto del usuario
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.gateway) queryParams.append('gateway', filters.gateway);
      queryParams.append('page', filters.page.toString());
      queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`/api/gateway/community/${newPayment.communityId}/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Error al cargar transacciones');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'warning', text: 'Pendiente', icon: 'schedule' },
      approved: { variant: 'success', text: 'Aprobado', icon: 'check_circle' },
      rejected: { variant: 'danger', text: 'Rechazado', icon: 'cancel' },
      cancelled: { variant: 'secondary', text: 'Cancelado', icon: 'cancel' },
      expired: { variant: 'dark', text: 'Expirado', icon: 'timer_off' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: 'secondary',
      text: status,
      icon: 'help'
    };

    return (
      <Badge bg={statusInfo.variant}>
        <i className="material-icons me-1" style={{fontSize: '12px'}}>{statusInfo.icon}</i>
        {statusInfo.text}
      </Badge>
    );
  };

  const getGatewayName = (gateway: string): string => {
    const gatewayMap = {
      webpay: 'Webpay Plus',
      khipu: 'Khipu',
      mercadopago: 'MercadoPago'
    };
    return gatewayMap[gateway as keyof typeof gatewayMap] || gateway;
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setShowNewPayment(false);
    setNewPayment({
      amount: 0,
      description: '',
      communityId: newPayment.communityId
    });
    loadTransactions(); // Recargar la lista
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Pagos — Cuentas Claras</title>
      </Head>

      <Layout title='Gestión de Pagos'>
        <div className="container-fluid p-4">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3">Gestión de Pagos</h1>
                <Button 
                  variant="primary" 
                  onClick={() => setShowNewPayment(true)}
                >
                  <i className="material-icons me-2">add</i>
                  Nuevo Pago
                </Button>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Filtros */}
              <Card className="mb-4">
                <Card.Body>
                  <Form>
                    <div className="row">
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                          >
                            <option value="">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="expired">Expirado</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Pasarela</Form.Label>
                          <Form.Select
                            value={filters.gateway}
                            onChange={(e) => handleFilterChange('gateway', e.target.value)}
                          >
                            <option value="">Todas</option>
                            <option value="webpay">Webpay Plus</option>
                            <option value="khipu">Khipu</option>
                            <option value="mercadopago">MercadoPago</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>Registros por página</Form.Label>
                          <Form.Select
                            value={filters.limit}
                            onChange={(e) => handleFilterChange('limit', e.target.value)}
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-3">
                        <Form.Group>
                          <Form.Label>&nbsp;</Form.Label>
                          <div>
                            <Button 
                              variant="outline-secondary" 
                              onClick={() => setFilters({
                                status: '',
                                gateway: '',
                                page: 1,
                                limit: 20
                              })}
                            >
                              Limpiar Filtros
                            </Button>
                          </div>
                        </Form.Group>
                      </div>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Tabla de transacciones */}
              <Card>
                <Card.Body>
                  {loading ? (
                    <div className="text-center p-4">
                      <Spinner animation="border" />
                      <p className="mt-2">Cargando transacciones...</p>
                    </div>
                  ) : (
                    <>
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>ID Orden</th>
                            <th>Monto</th>
                            <th>Pasarela</th>
                            <th>Estado</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center text-muted py-4">
                                No se encontraron transacciones
                              </td>
                            </tr>
                          ) : (
                            transactions.map((transaction) => (
                              <tr key={transaction.orderId}>
                                <td>
                                  <code>{transaction.orderId}</code>
                                </td>
                                <td>
                                  <strong>{formatCurrency(transaction.amount)}</strong>
                                </td>
                                <td>{getGatewayName(transaction.gateway)}</td>
                                <td>{getStatusBadge(transaction.status)}</td>
                                <td>{transaction.description}</td>
                                <td>{formatDate(transaction.createdAt)}</td>
                                <td>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                      // Aquí podrías abrir un modal con detalles
                                      console.log('Ver detalles:', transaction.orderId);
                                    }}
                                  >
                                    Ver Detalles
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>

                      {/* Paginación */}
                      {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
                          </div>
                          <div>
                            <Button
                              variant="outline-primary"
                              disabled={pagination.page === 1}
                              onClick={() => handlePageChange(pagination.page - 1)}
                              className="me-2"
                            >
                              Anterior
                            </Button>
                            <span className="mx-2">
                              Página {pagination.page} de {pagination.totalPages}
                            </span>
                            <Button
                              variant="outline-primary"
                              disabled={pagination.page === pagination.totalPages}
                              onClick={() => handlePageChange(pagination.page + 1)}
                              className="ms-2"
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal para nuevo pago */}
        <Modal show={showNewPayment} onHide={() => setShowNewPayment(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Nuevo Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form className="mb-3">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Monto (CLP)</Form.Label>
                    <Form.Control
                      type="number"
                      min="100"
                      max="50000000"
                      step="100"
                      value={newPayment.amount || ''}
                      onChange={(e) => setNewPayment(prev => ({
                        ...prev,
                        amount: parseInt(e.target.value) || 0
                      }))}
                      placeholder="Ingrese el monto"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      type="text"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Ej: Pago de gastos comunes"
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>

            {newPayment.amount >= 100 && newPayment.description ? (
              <PaymentComponent
                communityId={newPayment.communityId}
                amount={newPayment.amount}
                description={newPayment.description}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={() => setShowNewPayment(false)}
              />
            ) : (
              <Alert variant="info">
                Complete el monto (mínimo $100) y la descripción para continuar con el pago.
              </Alert>
            )}
          </Modal.Body>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
