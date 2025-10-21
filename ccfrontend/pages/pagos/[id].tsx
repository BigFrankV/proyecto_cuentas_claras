import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, Badge, Button, Alert, Spinner, Table, Modal, Form } from 'react-bootstrap';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

interface PaymentDetail {
  id: string;
  orderId: string;
  amount: number;
  gateway: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  reference: string;
  unitNumber: string;
  unitId: number;
  resident: {
    name: string;
    email: string;
    phone: string;
  };
  charges: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
    month: string;
    year: number;
  }>;
  documents: Array<{
    id: number;
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  timeline: Array<{
    id: number;
    action: string;
    description: string;
    date: string;
    user: string;
  }>;
}

export default function PaymentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadPaymentDetail();
    }
  }, [id]);

  const loadPaymentDetail = async () => {
    try {
      setLoading(true);
      // Simular datos hasta que se implemente la API
      const mockPayment: PaymentDetail = {
        id: id as string,
        orderId: `ORD-${id}-2024-001`,
        amount: 85500,
        gateway: 'webpay',
        status: 'approved',
        description: 'Pago gastos comunes Febrero 2024',
        createdAt: '2024-02-15T10:30:00Z',
        updatedAt: '2024-02-15T10:45:00Z',
        paymentMethod: 'Tarjeta de Crédito',
        reference: 'TXN-789456123',
        unitNumber: 'Dpto. 304 Torre B',
        unitId: 304,
        resident: {
          name: 'María González López',
          email: 'maria.gonzalez@email.com',
          phone: '+56 9 8765 4321'
        },
        charges: [
          {
            id: 1,
            type: 'Gasto Común',
            description: 'Gastos comunes Febrero 2024',
            amount: 65000,
            month: 'Febrero',
            year: 2024
          },
          {
            id: 2,
            type: 'Fondo de Reserva',
            description: 'Fondo de reserva 2024',
            amount: 15000,
            month: 'Febrero',
            year: 2024
          },
          {
            id: 3,
            type: 'Multa',
            description: 'Multa por ruidos molestos',
            amount: 5500,
            month: 'Enero',
            year: 2024
          }
        ],
        documents: [
          {
            id: 1,
            name: 'comprobante-pago.pdf',
            type: 'receipt',
            size: '245 KB',
            url: '/documents/comprobante-pago.pdf'
          },
          {
            id: 2,
            name: 'detalle-cargos.pdf',
            type: 'detail',
            size: '182 KB',
            url: '/documents/detalle-cargos.pdf'
          }
        ],
        timeline: [
          {
            id: 1,
            action: 'Pago Confirmado',
            description: 'El pago fue procesado exitosamente por Webpay Plus',
            date: '2024-02-15T10:45:00Z',
            user: 'Sistema'
          },
          {
            id: 2,
            action: 'Procesando Pago',
            description: 'Pago enviado a procesamiento con Webpay Plus',
            date: '2024-02-15T10:32:00Z',
            user: 'Sistema'
          },
          {
            id: 3,
            action: 'Pago Iniciado',
            description: 'Pago iniciado por el residente María González',
            date: '2024-02-15T10:30:00Z',
            user: 'María González'
          }
        ]
      };

      setPayment(mockPayment);
    } catch (error) {
      setError('Error al cargar el detalle del pago');
      console.error('Error loading payment detail:', error);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'warning', text: 'Pendiente', icon: 'schedule' },
      approved: { variant: 'success', text: 'Confirmado', icon: 'check_circle' },
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
      <div className={`status-badge ${status}`}>
        <i className="material-icons">{statusInfo.icon}</i>
        {statusInfo.text}
      </div>
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

  const getPaymentMethodIcon = (method: string): string => {
    const iconMap = {
      'Tarjeta de Crédito': 'credit_card',
      'Transferencia': 'account_balance',
      'Efectivo': 'payments',
      'Cheque': 'receipt_long'
    };
    return iconMap[method as keyof typeof iconMap] || 'payment';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Implementar descarga de comprobante
    alert('Descargando comprobante...');
  };

  const handleSendReceipt = () => {
    // Implementar envío por email
    alert('Enviando comprobante por email...');
  };

  const handleEditPayment = () => {
    setShowEditModal(true);
  };

  const handleReversePayment = () => {
    setShowReverseModal(true);
  };

  const handleViewDocument = (doc: any) => {
    // Implementar visualización de documento
    window.open(doc.url, '_blank');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
            <Spinner animation="border" variant="primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !payment) {
    return (
      <ProtectedRoute>
        <Layout title="Error">
          <div className="container-fluid p-4">
            <Alert variant="danger">
              {error || 'Pago no encontrado'}
            </Alert>
            <Button variant="outline-primary" onClick={() => router.back()}>
              <i className="material-icons me-2">arrow_back</i>
              Volver
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Detalle de Pago {payment.orderId} — Cuentas Claras</title>
      </Head>

      <Layout title={`Detalle de Pago ${payment.orderId}`}>
        <div className="container-fluid p-4">
          {/* Header del pago */}
          <div className="payment-header">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="payment-title">
                  <i className="material-icons me-3">receipt_long</i>
                  Pago Confirmado
                </h1>
                <p className="payment-subtitle">
                  {payment.description}
                </p>
                <div className="payment-amount">
                  {formatCurrency(payment.amount)}
                </div>
                <div className="payment-method">
                  <i className="material-icons">{getPaymentMethodIcon(payment.paymentMethod)}</i>
                  {payment.paymentMethod} • {getGatewayName(payment.gateway)}
                </div>
                {getStatusBadge(payment.status)}
              </div>
              <div className="text-end">
                <Button
                  variant="light"
                  className="me-2 mb-2"
                  onClick={handlePrint}
                >
                  <i className="material-icons me-1">print</i>
                  Imprimir
                </Button>
                <Button
                  variant="light"
                  className="me-2 mb-2"
                  onClick={handleDownloadReceipt}
                >
                  <i className="material-icons me-1">download</i>
                  Descargar
                </Button>
                <Button
                  variant="light"
                  className="mb-2"
                  onClick={handleSendReceipt}
                >
                  <i className="material-icons me-1">email</i>
                  Enviar
                </Button>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Información del pago */}
            <div className="col-lg-8">
              <div className="detail-card">
                <div className="detail-card-header">
                  <h3 className="detail-card-title">
                    <i className="material-icons">info</i>
                    Información del Pago
                  </h3>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleEditPayment}
                    >
                      <i className="material-icons me-1">edit</i>
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleReversePayment}
                    >
                      <i className="material-icons me-1">undo</i>
                      Reversar
                    </Button>
                  </div>
                </div>
                <div className="detail-card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">ID de Orden</div>
                      <div className="info-value">{payment.orderId}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Referencia</div>
                      <div className="info-value">{payment.reference}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Unidad</div>
                      <div className="info-value">{payment.unitNumber}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Residente</div>
                      <div className="info-value">{payment.resident.name}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Email</div>
                      <div className="info-value">{payment.resident.email}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Teléfono</div>
                      <div className="info-value">{payment.resident.phone}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Fecha de Pago</div>
                      <div className="info-value date">{formatDate(payment.createdAt)}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Monto Total</div>
                      <div className="info-value amount">{formatCurrency(payment.amount)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cargos asignados */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <h3 className="detail-card-title">
                    <i className="material-icons">receipt</i>
                    Cargos Asignados
                  </h3>
                </div>
                <div className="detail-card-body p-0">
                  <div className="charges-table">
                    <Table className="custom-table mb-0">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th>Período</th>
                          <th>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payment.charges.map((charge) => (
                          <tr key={charge.id}>
                            <td>
                              <Badge bg="primary" className="text-uppercase">
                                {charge.type}
                              </Badge>
                            </td>
                            <td>{charge.description}</td>
                            <td>{charge.month} {charge.year}</td>
                            <td className="amount-cell">
                              {formatCurrency(charge.amount)}
                            </td>
                          </tr>
                        ))}
                        <tr className="table-success">
                          <td colSpan={3}><strong>Total</strong></td>
                          <td className="amount-cell">
                            <strong>{formatCurrency(payment.amount)}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Documentos */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <h3 className="detail-card-title">
                    <i className="material-icons">folder</i>
                    Documentos
                  </h3>
                  <Button variant="outline-primary" size="sm">
                    <i className="material-icons me-1">add</i>
                    Subir
                  </Button>
                </div>
                <div className="detail-card-body">
                  <div className="document-list">
                    {payment.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="document-item"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <div className="document-icon">
                          <i className="material-icons">description</i>
                        </div>
                        <div className="document-name">{doc.name}</div>
                        <div className="document-size">{doc.size}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="detail-card">
                <div className="detail-card-header">
                  <h3 className="detail-card-title">
                    <i className="material-icons">timeline</i>
                    Historial
                  </h3>
                </div>
                <div className="detail-card-body">
                  <div className="timeline">
                    {payment.timeline.map((item) => (
                      <div key={item.id} className="timeline-item">
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <h5 className="timeline-title">{item.action}</h5>
                            <small className="timeline-date">
                              {formatDate(item.date)}
                            </small>
                          </div>
                          <p className="timeline-description">
                            {item.description}
                          </p>
                          <small className="text-muted">Por: {item.user}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de edición */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Editar Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={payment.description}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select defaultValue={payment.status}>
                      <option value="pending">Pendiente</option>
                      <option value="approved">Confirmado</option>
                      <option value="rejected">Rechazado</option>
                      <option value="cancelled">Cancelado</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de reversión */}
        <Modal show={showReverseModal} onHide={() => setShowReverseModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Reversar Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning">
              <strong>¿Está seguro que desea reversar este pago?</strong>
              <br />
              Esta acción no se puede deshacer y se generará un registro en el historial.
            </Alert>
            <Form>
              <Form.Group>
                <Form.Label>Motivo de la reversión</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ingrese el motivo de la reversión..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReverseModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger">
              Confirmar Reversión
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}