import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/ui/PageHeader';
import { pagosApi } from '@/lib/api/pagos';
import { ProtectedRoute } from '@/lib/useAuth';
import { PaymentDetail as PaymentDetailType } from '@/types/pagos';

export default function PaymentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState<PaymentDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ description: '', status: '' });

  const loadPaymentDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const paymentData = await pagosApi.getById(Number(id));
      setPayment(paymentData);
    } catch {
      setError('Error al cargar el detalle del pago');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPaymentDetail();
    }
  }, [id, loadPaymentDetail]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { className: 'status-pending', text: 'Pendiente', icon: 'schedule' },
      approved: { className: 'status-approved', text: 'Confirmado', icon: 'check_circle' },
      rejected: { className: 'status-rejected', text: 'Rechazado', icon: 'cancel' },
      cancelled: { className: 'status-cancelled', text: 'Cancelado', icon: 'block' },
      expired: { className: 'status-expired', text: 'Expirado', icon: 'timer_off' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      className: 'status-default',
      text: status,
      icon: 'help',
    };

    return (
      <span className={`custom-badge ${statusInfo.className}`}>
        <span className='material-icons'>{statusInfo.icon}</span>
        {statusInfo.text}
      </span>
    );
  };

  const getGatewayName = (gateway: string): string => {
    const gatewayMap = {
      webpay: 'Webpay Plus',
      khipu: 'Khipu',
      mercadopago: 'MercadoPago',
    };
    return gatewayMap[gateway as keyof typeof gatewayMap] || gateway;
  };

  const getPaymentMethodIcon = (method: string): string => {
    const iconMap = {
      'Tarjeta de Crédito': 'credit_card',
      Transferencia: 'account_balance',
      Efectivo: 'payments',
      Cheque: 'receipt_long',
    };
    return iconMap[method as keyof typeof iconMap] || 'payment';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    alert('Descargando comprobante...');
  };

  const handleSendReceipt = () => {
    alert('Enviando comprobante por email...');
  };

  const handleEditPayment = () => {
    if (payment) {
      setEditFormData({
        description: payment.description,
        status: payment.status,
      });
    }
    setShowEditModal(true);
  };

  const handleReversePayment = () => {
    setShowReverseModal(true);
  };

  const handleViewDocument = (doc: {
    id: number;
    name: string;
    type: string;
    size: string;
    url: string;
  }) => {
    window.open(doc.url, '_blank');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Cargando...'>
          <div className='loading-container'>
            <Spinner animation='border' variant='primary' />
            <p className="mt-3 text-muted">Cargando detalle del pago...</p>
          </div>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 60vh;
            }
          `}</style>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !payment) {
    return (
      <ProtectedRoute>
        <Layout title='Error'>
          <div className='error-container'>
            <span className='material-icons error-icon'>error_outline</span>
            <h3>Pago no encontrado</h3>
            <p>{error || 'El pago que buscas no existe o ha sido eliminado.'}</p>
            <button className='btn-primary' onClick={() => router.back()}>
              <span className='material-icons'>arrow_back</span>
              Volver
            </button>
          </div>
          <style jsx>{`
            .error-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 60vh;
              text-align: center;
              color: #6c757d;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
              color: #dee2e6;
            }
            .btn-primary {
              background: #2a5298;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              cursor: pointer;
              margin-top: 1rem;
            }
          `}</style>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Pago #{payment.orderId} — Cuentas Claras</title>
      </Head>

      <Layout title={`Pago #${payment.orderId}`}>
        <div className='payment-detail-page'>
          <PageHeader
            title={`Pago #${payment.orderId}`}
            subtitle="Detalle de la transacción y estado"
            icon="receipt_long"
          >
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => router.back()}>
                <span className="material-icons">arrow_back</span> Volver
              </button>
              <button className="btn-secondary" onClick={handlePrint} title="Imprimir">
                <span className="material-icons">print</span>
              </button>
              <button className="btn-secondary" onClick={handleDownloadReceipt} title="Descargar">
                <span className="material-icons">download</span>
              </button>
              <button className="btn-secondary" onClick={handleSendReceipt} title="Enviar por Email">
                <span className="material-icons">email</span>
              </button>
              <button className="btn-primary" onClick={handleEditPayment}>
                <span className="material-icons">edit</span> Editar
              </button>
            </div>
          </PageHeader>

          <div className="content-grid">
            <div className="main-column">
              {/* Main Info Card */}
              <div className="content-card main-info">
                <div className="info-header">
                  <div className="info-title">
                    <h1>{payment.description}</h1>
                    <div className="meta-row">
                      <span className="meta-item">
                        <span className="material-icons">tag</span>
                        Ref: {payment.reference}
                      </span>
                      <span className="meta-separator">•</span>
                      <span className="meta-item">
                        <span className="material-icons">event</span>
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="amount-display">
                    <span className="amount-label">Monto Total</span>
                    <span className="amount-value">{formatCurrency(payment.amount)}</span>
                  </div>
                </div>
                
                <div className="badges-row">
                  {getStatusBadge(payment.status)}
                  <span className="custom-badge badge-info">
                    <span className="material-icons">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                    {payment.paymentMethod}
                  </span>
                  <span className="custom-badge badge-secondary">
                    <span className="material-icons">dns</span>
                    {getGatewayName(payment.gateway)}
                  </span>
                </div>
              </div>

              {/* Resident Info */}
              <div className="content-card">
                <h3 className="card-title">
                  <span className="material-icons">person</span>
                  Información del Residente
                </h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Nombre</label>
                    <div className="value">{payment.resident.name}</div>
                  </div>
                  <div className="detail-item">
                    <label>Unidad</label>
                    <div className="value">{payment.unitNumber}</div>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <div className="value">{payment.resident.email}</div>
                  </div>
                  <div className="detail-item">
                    <label>Teléfono</label>
                    <div className="value">{payment.resident.phone}</div>
                  </div>
                </div>
              </div>

              {/* Charges Table */}
              <div className="content-card">
                <h3 className="card-title">
                  <span className="material-icons">list_alt</span>
                  Cargos Asignados
                </h3>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Período</th>
                        <th className="text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payment.charges.map(charge => (
                        <tr key={charge.id}>
                          <td>
                            <span className="type-badge">{charge.type}</span>
                          </td>
                          <td>{charge.description}</td>
                          <td>{charge.month} {charge.year}</td>
                          <td className="text-end font-weight-bold">
                            {formatCurrency(charge.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="total-row">
                        <td colSpan={3} className="text-end label">Total Pagado</td>
                        <td className="text-end value">{formatCurrency(payment.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="sidebar-column">
              {/* Documents */}
              <div className="content-card">
                <div className="card-header-actions">
                  <h3 className="card-title mb-0">
                    <span className="material-icons">folder</span>
                    Documentos
                  </h3>
                  <button className="btn-icon-small" title="Subir documento">
                    <span className="material-icons">add</span>
                  </button>
                </div>
                <div className="documents-list">
                  {payment.documents.map(doc => (
                    <button 
                      key={doc.id} 
                      className="document-item" 
                      onClick={() => handleViewDocument(doc)}
                      type="button"
                    >
                      <div className="document-icon">
                        <span className="material-icons">description</span>
                      </div>
                      <div className="document-info">
                        <div className="document-name">{doc.name}</div>
                        <div className="document-size">{doc.size}</div>
                      </div>
                      <span className="material-icons arrow">chevron_right</span>
                    </button>
                  ))}
                  {payment.documents.length === 0 && (
                    <div className="empty-state">No hay documentos adjuntos</div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="content-card">
                <h3 className="card-title">
                  <span className="material-icons">history</span>
                  Historial
                </h3>
                <div className="timeline">
                  {payment.timeline.map(item => (
                    <div key={item.id} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-action">{item.action}</span>
                          <span className="timeline-date">{formatDate(item.date)}</span>
                        </div>
                        <p className="timeline-desc">{item.description}</p>
                        <div className="timeline-user">Por: {item.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="content-card danger-zone">
                <h3 className="card-title text-danger">Zona de Peligro</h3>
                <p className="danger-text">Si necesitas anular este pago, puedes reversarlo aquí. Esta acción quedará registrada.</p>
                <button 
                  className="btn-danger-outline"
                  onClick={handleReversePayment}
                >
                  <span className="material-icons">undo</span>
                  Reversar Pago
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de edición */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className='row'>
                <div className='col-md-12'>
                  <Form.Group className='mb-3'>
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      type='text'
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    />
                  </Form.Group>
                </div>
                <div className='col-md-12'>
                  <Form.Group className='mb-3'>
                    <Form.Label>Estado</Form.Label>
                    <div className="status-selector">
                      {[
                        { value: 'pending', label: 'Pendiente', icon: 'schedule', className: 'status-pending' },
                        { value: 'approved', label: 'Confirmado', icon: 'check_circle', className: 'status-approved' },
                        { value: 'rejected', label: 'Rechazado', icon: 'cancel', className: 'status-rejected' },
                        { value: 'cancelled', label: 'Cancelado', icon: 'block', className: 'status-cancelled' },
                      ].map(option => (
                        <button
                          key={option.value}
                          type="button"
                          className={`selection-badge ${option.className} ${editFormData.status === option.value ? 'selected' : ''}`}
                          onClick={() => setEditFormData({...editFormData, status: option.value})}
                        >
                          <span className="material-icons">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancelar
            </button>
            <button className="btn-primary">Guardar Cambios</button>
          </Modal.Footer>
        </Modal>

        {/* Modal de reversión */}
        <Modal show={showReverseModal} onHide={() => setShowReverseModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Reversar Pago</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant='warning'>
              <div className="d-flex gap-2">
                <span className="material-icons">warning</span>
                <div>
                  <strong>¿Está seguro que desea reversar este pago?</strong>
                  <p className="mb-0 mt-1">Esta acción no se puede deshacer y se generará un registro en el historial.</p>
                </div>
              </div>
            </Alert>
            <Form>
              <Form.Group>
                <Form.Label>Motivo de la reversión</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  placeholder='Ingrese el motivo de la reversión...'
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn-secondary" onClick={() => setShowReverseModal(false)}>
              Cancelar
            </button>
            <button className="btn-danger">Confirmar Reversión</button>
          </Modal.Footer>
        </Modal>

        <style jsx>{`
          .payment-detail-page {
            padding: 1.5rem;
            background-color: #f8f9fa;
            min-height: 100vh;
          }

          .header-actions {
            display: flex;
            gap: 0.5rem;
          }

          .content-grid {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 2rem;
            margin-top: 2rem;
          }

          .content-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          }

          .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #212529;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .card-title .material-icons {
            color: #6c757d;
            font-size: 1.2rem;
          }

          .card-header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .card-header-actions .card-title {
            margin-bottom: 0;
          }

          /* Main Info */
          .main-info {
            border-left: 4px solid #2a5298;
          }

          .info-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
          }

          .info-title h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #212529;
            margin: 0 0 0.5rem 0;
          }

          .meta-row {
            display: flex;
            align-items: center;
            color: #6c757d;
            font-size: 0.9rem;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .meta-separator { margin: 0 0.5rem; }

          .amount-display { text-align: right; }
          .amount-label { display: block; font-size: 0.85rem; color: #6c757d; text-transform: uppercase; font-weight: 600; }
          .amount-value { font-size: 2rem; font-weight: 700; color: #2a5298; }

          .badges-row {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            align-items: center;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e9ecef;
          }

          /* Badges - Complementary Opposites */
          .custom-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 0 2px 5px rgba(0,0,0,0.08);
            transition: transform 0.2s;
          }
          
          .custom-badge:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.12);
          }

          .custom-badge .material-icons { 
            font-size: 1.1rem;
            margin-top: -2px;
          }

          .status-pending { background: #f57c00; } /* Orange */
          .status-approved { background: #2e7d32; } /* Green */
          .status-rejected { background: #c62828; } /* Red */
          .status-cancelled { background: #6a1b9a; } /* Purple */
          .status-expired { background: #37474f; } /* Dark Grey */
          .status-default { background: #78909c; }

          .badge-info { background: #0277bd; } /* Light Blue */
          .badge-secondary { background: #546e7a; } /* Blue Grey */

          /* Details Grid */
          .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .detail-item label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #6c757d;
            font-weight: 600;
            margin-bottom: 0.4rem;
          }

          .detail-item .value {
            font-size: 1rem;
            color: #212529;
            font-weight: 500;
          }

          /* Table */
          .custom-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }

          .custom-table th {
            font-size: 0.75rem;
            text-transform: uppercase;
            color: #6c757d;
            font-weight: 600;
            padding: 0.75rem 1rem;
            border-bottom: 2px solid #e9ecef;
          }

          .custom-table td {
            padding: 1rem;
            border-bottom: 1px solid #e9ecef;
            color: #212529;
            font-size: 0.95rem;
          }

          .type-badge {
            background: #e3f2fd;
            color: #0d47a1;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }

          .total-row td {
            border-top: 2px solid #e9ecef;
            border-bottom: none;
            font-weight: 700;
            font-size: 1.1rem;
            color: #2a5298;
          }

          /* Documents */
          .documents-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .document-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
            width: 100%;
            text-align: left;
            font-family: inherit;
          }

          .document-item:hover {
            background: #f8f9fa;
            border-color: #dee2e6;
          }

          .document-icon {
            width: 36px;
            height: 36px;
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 0.75rem;
          }

          .document-info { flex: 1; }
          .document-name { font-weight: 500; font-size: 0.9rem; color: #212529; }
          .document-size { font-size: 0.75rem; color: #6c757d; }
          .arrow { color: #adb5bd; font-size: 1.2rem; }
          .empty-state { text-align: center; color: #adb5bd; font-style: italic; padding: 1rem; }

          /* Timeline */
          .timeline {
            position: relative;
            padding-left: 1rem;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e9ecef;
          }

          .timeline-item {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .timeline-dot {
            position: absolute;
            left: 0;
            top: 6px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: white;
            border: 3px solid #2a5298;
            z-index: 1;
          }

          .timeline-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
          }

          .timeline-action { font-weight: 600; color: #212529; font-size: 0.9rem; }
          .timeline-date { font-size: 0.75rem; color: #6c757d; }
          .timeline-desc { font-size: 0.85rem; color: #495057; margin-bottom: 0.25rem; }
          .timeline-user { font-size: 0.75rem; color: #6c757d; font-style: italic; }

          /* Danger Zone */
          .danger-zone {
            border-color: #ffcdd2;
            background: #fffafa;
          }
          
          .danger-text {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 1rem;
          }

          /* Buttons */
          .btn-primary, .btn-secondary, .btn-danger {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
          }

          .btn-primary { background: #2a5298; color: white; }
          .btn-primary:hover { background: #1e3c72; }

          .btn-secondary { background: white; border: 1px solid #dee2e6; color: #495057; }
          .btn-secondary:hover { background: #f8f9fa; border-color: #adb5bd; }

          .btn-danger { background: #dc3545; color: white; }
          .btn-danger:hover { background: #c82333; }

          .btn-icon-small {
            width: 28px;
            height: 28px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            background: white;
            color: #6c757d;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .btn-icon-small:hover { background: #f8f9fa; color: #2a5298; }
          .btn-icon-small .material-icons { font-size: 1.1rem; }

          .btn-danger-outline {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #dc3545;
            background: white;
            color: #dc3545;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-danger-outline:hover {
            background: #dc3545;
            color: white;
          }

          .status-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            padding: 0.5rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }

          .selection-badge {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s;
            opacity: 0.4;
            transform: scale(0.95);
            filter: grayscale(0.5);
            border: none;
            background-color: transparent; /* Fallback */
          }

          .selection-badge:hover {
            opacity: 0.7;
            transform: scale(0.98);
            filter: grayscale(0.2);
          }

          .selection-badge.selected {
            opacity: 1;
            transform: scale(1);
            filter: grayscale(0);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          @media (max-width: 992px) {
            .content-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
