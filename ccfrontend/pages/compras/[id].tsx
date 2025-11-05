import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Row,
  Col,
  Badge,
  Table,
  Alert,
  Modal,
  Form,
  Tab,
  Tabs,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { comprasApi } from '@/lib/api/compras';
import { ProtectedRoute } from '@/lib/useAuth';
import { CompraBackend } from '@/types/compras';

// Función para formatear moneda chilena
const formatCurrency = (
  amount: number,
  currency: 'clp' | 'usd' = 'clp',
): string => {
  if (currency === 'clp') {
    return `$${amount.toLocaleString('es-CL')}`;
  } else {
    return `US$${amount.toLocaleString('en-US')}`;
  }
};

interface PurchaseItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'received';
}

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
  description: string;
  provider: {
    id: number;
    name: string;
    category: string;
    rating: number;
    contact?: string;
    phone?: string;
    email?: string;
  };
  costCenter: {
    id: number;
    name: string;
    department: string;
    budget: number;
    spent: number;
  };
  category: {
    id: number;
    name: string;
    color: string;
  };
  items: PurchaseItem[];
  totalAmount: number;
  currency: 'clp' | 'usd';
  requiredDate: string;
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  notes?: string;
  requestJustification?: string;
  documentsCount: number;
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  id: string;
  type:
    | 'created'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'in-progress'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'note';
  title: string;
  description?: string;
  date: string;
  user: string;
  icon: string;
  color: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: 'quote' | 'invoice' | 'receipt' | 'contract' | 'other';
}

export default function DetallePurchase() {
  const router = useRouter();
  const { id } = router.query;

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      loadPurchaseData();
    }
  }, [id]);

  const loadPurchaseData = async () => {
    try {
      setLoading(true);

      const compra: CompraBackend = await comprasApi.getById(Number(id));

      // Mapear CompraBackend a Purchase local
      const mappedPurchase: Purchase = {
        id: Number(compra.id),
        number: compra.folio ?? `#${compra.id}`,
        type: 'order', // por defecto, podría mapearse según algún campo
        status: 'pending', // por defecto, podría mapearse según algún campo
        priority: 'medium', // por defecto
        description: compra.glosa ?? '',
        provider: {
          id: Number(compra.proveedor_id ?? 0),
          name: compra.proveedor_nombre ?? '-',
          category: '',
          rating: 0,
          contact: '',
          phone: '',
          email: '',
        },
        costCenter: {
          id: Number(compra.centro_costo_id ?? 0),
          name: compra.centro_costo_nombre ?? '',
          department: '',
          budget: 0,
          spent: 0,
        },
        category: {
          id: 0,
          name: compra.categoria_gasto ?? '',
          color: '#ccc',
        },
        items: [], // por ahora vacío, podría mapearse si hay detalle de items
        totalAmount: Number(compra.total ?? 0),
        currency: 'clp',
        requiredDate: compra.fecha_emision ?? compra.created_at ?? '',
        requestedBy: '', // no hay campo específico en la vista
        requestedDate: compra.created_at ?? '',
        documentsCount: 0, // por ahora 0
        timeline: [], // por ahora vacío
      };

      setPurchase(mappedPurchase);
      setDocuments([]); // por ahora vacío
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading purchase data:', error);
      setPurchase(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      draft: { label: 'Borrador', variant: 'secondary', icon: 'draft' },
      pending: { label: 'Pendiente', variant: 'warning', icon: 'schedule' },
      approved: { label: 'Aprobada', variant: 'success', icon: 'check_circle' },
      'in-progress': {
        label: 'En Progreso',
        variant: 'info',
        icon: 'progress_activity',
      },
      delivered: {
        label: 'Entregada',
        variant: 'primary',
        icon: 'local_shipping',
      },
      completed: { label: 'Completada', variant: 'success', icon: 'task_alt' },
      cancelled: { label: 'Cancelada', variant: 'danger', icon: 'cancel' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      low: { label: 'Baja', variant: 'success', icon: 'low_priority' },
      medium: { label: 'Media', variant: 'info', icon: 'remove' },
      high: { label: 'Alta', variant: 'warning', icon: 'priority_high' },
      urgent: { label: 'Urgente', variant: 'danger', icon: 'warning' },
    };
    return (
      priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium
    );
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      order: { label: 'Orden de Compra', icon: 'shopping_cart' },
      service: { label: 'Servicio', icon: 'build' },
      maintenance: { label: 'Mantenimiento', icon: 'handyman' },
      supplies: { label: 'Suministros', icon: 'inventory' },
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.order;
  };

  const handleApprove = async () => {
    try {
      // Simular aprobación
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (purchase) {
        const updatedPurchase = {
          ...purchase,
          status: 'approved' as const,
          approvedBy: 'Usuario Actual',
          approvedDate: new Date().toISOString(),
          timeline: [
            ...purchase.timeline,
            {
              id: Date.now().toString(),
              type: 'approved' as const,
              title: 'Compra aprobada',
              description: approvalNote || 'Compra aprobada para proceder',
              date: new Date().toISOString(),
              user: 'Usuario Actual',
              icon: 'check_circle',
              color: 'success',
            },
          ],
        };

        setPurchase(updatedPurchase);
        setShowApprovalModal(false);
        setApprovalNote('');
        alert('Compra aprobada exitosamente');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error approving purchase:', error);
      alert('Error al aprobar la compra');
    }
  };

  const handleReject = async () => {
    try {
      // Simular rechazo
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (purchase) {
        const updatedPurchase = {
          ...purchase,
          status: 'cancelled' as const,
          rejectedBy: 'Usuario Actual',
          rejectedDate: new Date().toISOString(),
          rejectionReason,
          timeline: [
            ...purchase.timeline,
            {
              id: Date.now().toString(),
              type: 'rejected' as const,
              title: 'Compra rechazada',
              description: rejectionReason,
              date: new Date().toISOString(),
              user: 'Usuario Actual',
              icon: 'cancel',
              color: 'danger',
            },
          ],
        };

        setPurchase(updatedPurchase);
        setShowRejectionModal(false);
        setRejectionReason('');
        alert('Compra rechazada');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error rejecting purchase:', error);
      alert('Error al rechazar la compra');
    }
  };

  const addNote = async () => {
    try {
      // Simular agregar nota
      await new Promise(resolve => setTimeout(resolve, 500));

      if (purchase && newNote.trim()) {
        const updatedPurchase = {
          ...purchase,
          timeline: [
            ...purchase.timeline,
            {
              id: Date.now().toString(),
              type: 'note' as const,
              title: 'Nota agregada',
              description: newNote,
              date: new Date().toISOString(),
              user: 'Usuario Actual',
              icon: 'note',
              color: 'info',
            },
          ],
        };

        setPurchase(updatedPurchase);
        setShowNoteModal(false);
        setNewNote('');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding note:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) {
      return '0 Bytes';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  const canApprove = () => {
    return purchase?.status === 'pending';
  };

  const canEdit = () => {
    return purchase?.status === 'draft' || purchase?.status === 'pending';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary mb-3' />
              <p>Cargando detalles de la compra...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!purchase) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <span
              className='material-icons text-muted mb-3'
              style={{ fontSize: '4rem' }}
            >
              error_outline
            </span>
            <h4>Compra no encontrada</h4>
            <p className='text-muted'>
              La compra que buscas no existe o ha sido eliminada.
            </p>
            <Button variant='primary' onClick={() => router.push('/compras')}>
              Volver a Compras
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const statusInfo = getStatusInfo(purchase.status);
  const priorityInfo = getPriorityInfo(purchase.priority);
  const typeInfo = getTypeInfo(purchase.type);

  return (
    <ProtectedRoute>
      <Head>
        <title>{purchase.number} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='purchases-container'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-start mb-4'>
            <div className='d-flex align-items-center'>
              <Button
                variant='link'
                className='text-secondary p-0 me-3'
                onClick={() => router.back()}
              >
                <span className='material-icons'>arrow_back</span>
              </Button>
              <div>
                <div className='d-flex align-items-center gap-3 mb-2'>
                  <h1 className='purchases-title mb-0'>
                    <span className='material-icons me-2'>{typeInfo.icon}</span>
                    {purchase.number}
                  </h1>
                  <Badge
                    bg={statusInfo.variant}
                    className='d-flex align-items-center'
                  >
                    <span
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      {statusInfo.icon}
                    </span>
                    {statusInfo.label}
                  </Badge>
                  <Badge
                    bg={priorityInfo.variant}
                    className='d-flex align-items-center'
                  >
                    <span
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      {priorityInfo.icon}
                    </span>
                    {priorityInfo.label}
                  </Badge>
                </div>
                <p className='purchases-subtitle mb-0'>
                  {typeInfo.label} • Solicitada por {purchase.requestedBy} •{' '}
                  {formatDate(purchase.requestedDate)}
                </p>
              </div>
            </div>

            <div className='d-flex gap-2'>
              {canApprove() && (
                <>
                  <Button
                    variant='outline-danger'
                    onClick={() => setShowRejectionModal(true)}
                  >
                    <span className='material-icons me-2'>cancel</span>
                    Rechazar
                  </Button>
                  <Button
                    variant='success'
                    onClick={() => setShowApprovalModal(true)}
                  >
                    <span className='material-icons me-2'>check_circle</span>
                    Aprobar
                  </Button>
                </>
              )}
              <Button
                variant='outline-primary'
                onClick={() => setShowNoteModal(true)}
              >
                <span className='material-icons me-2'>note_add</span>
                Agregar Nota
              </Button>
              {canEdit() && (
                <Button
                  variant='primary'
                  onClick={() => router.push(`/compras/editar/${purchase.id}`)}
                >
                  <span className='material-icons me-2'>edit</span>
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Tabs de navegación */}
          <Tabs
            activeKey={activeTab}
            onSelect={tab => setActiveTab(tab || 'details')}
            className='mb-4'
          >
            <Tab
              eventKey='details'
              title={
                <span>
                  <span className='material-icons me-2'>info</span>
                  Detalles
                </span>
              }
            >
              <Row>
                {/* Columna principal */}
                <Col lg={8}>
                  {/* Información General */}
                  <Card className='purchase-detail-section mb-4'>
                    <Card.Header className='section-header'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>info</span>
                        Información General
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className='g-3'>
                        <Col md={6}>
                          <div className='detail-field'>
                            <label className='detail-label'>Descripción</label>
                            <div className='detail-value'>
                              {purchase.description}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className='detail-field'>
                            <label className='detail-label'>
                              Fecha Requerida
                            </label>
                            <div className='detail-value'>
                              {new Date(
                                purchase.requiredDate,
                              ).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className='detail-field'>
                            <label className='detail-label'>Moneda</label>
                            <div className='detail-value'>
                              {purchase.currency.toUpperCase()}
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className='detail-field'>
                            <label className='detail-label'>Monto Total</label>
                            <div className='detail-value fw-bold'>
                              {formatCurrency(
                                purchase.totalAmount,
                                purchase.currency,
                              )}
                            </div>
                          </div>
                        </Col>
                        {purchase.notes && (
                          <Col xs={12}>
                            <div className='detail-field'>
                              <label className='detail-label'>Notas</label>
                              <div className='detail-value'>
                                {purchase.notes}
                              </div>
                            </div>
                          </Col>
                        )}
                        {purchase.requestJustification && (
                          <Col xs={12}>
                            <div className='detail-field'>
                              <label className='detail-label'>
                                Justificación
                              </label>
                              <div className='detail-value'>
                                {purchase.requestJustification}
                              </div>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Proveedor */}
                  <Card className='purchase-detail-section mb-4'>
                    <Card.Header className='section-header'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>store</span>
                        Proveedor
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className='d-flex align-items-start'>
                        <div className='provider-logo me-3'>
                          {purchase.provider.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className='flex-grow-1'>
                          <h6 className='mb-1'>{purchase.provider.name}</h6>
                          <div className='text-muted mb-2'>
                            <span className='me-3'>
                              ⭐ {purchase.provider.rating}
                            </span>
                            <span>{purchase.provider.category}</span>
                          </div>
                          {purchase.provider.contact && (
                            <div className='contact-info'>
                              <div>
                                <strong>Contacto:</strong>{' '}
                                {purchase.provider.contact}
                              </div>
                              {purchase.provider.phone && (
                                <div>
                                  <strong>Teléfono:</strong>{' '}
                                  {purchase.provider.phone}
                                </div>
                              )}
                              {purchase.provider.email && (
                                <div>
                                  <strong>Email:</strong>{' '}
                                  {purchase.provider.email}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Centro de Costo */}
                  <Card className='purchase-detail-section mb-4'>
                    <Card.Header className='section-header'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>
                          account_balance_wallet
                        </span>
                        Centro de Costo
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className='g-3'>
                        <Col md={8}>
                          <h6 className='mb-1'>{purchase.costCenter.name}</h6>
                          <p className='text-muted mb-0'>
                            Departamento: {purchase.costCenter.department}
                          </p>
                        </Col>
                        <Col md={4}>
                          <div className='budget-info'>
                            <div className='d-flex justify-content-between'>
                              <span>Presupuesto:</span>
                              <strong>
                                {formatCurrency(
                                  purchase.costCenter.budget,
                                  purchase.currency,
                                )}
                              </strong>
                            </div>
                            <div className='d-flex justify-content-between'>
                              <span>Gastado:</span>
                              <span>
                                {formatCurrency(
                                  purchase.costCenter.spent,
                                  purchase.currency,
                                )}
                              </span>
                            </div>
                            <div className='d-flex justify-content-between'>
                              <span>Disponible:</span>
                              <span className='text-success'>
                                {formatCurrency(
                                  purchase.costCenter.budget -
                                    purchase.costCenter.spent,
                                  purchase.currency,
                                )}
                              </span>
                            </div>
                            <div className='progress mt-2'>
                              <div
                                className='progress-bar'
                                style={{
                                  width: `${(purchase.costCenter.spent / purchase.costCenter.budget) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Items de la Compra */}
                  <Card className='purchase-detail-section'>
                    <Card.Header className='section-header'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>list</span>
                        Items de la Compra ({purchase.items.length})
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className='table-responsive'>
                        <Table className='items-table'>
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th>Cantidad</th>
                              <th>Unidad</th>
                              <th>Precio Unit.</th>
                              <th>Total</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {purchase.items.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <div>
                                    <div className='fw-medium'>
                                      {item.description}
                                    </div>
                                    {item.notes && (
                                      <small className='text-muted'>
                                        {item.notes}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td>{item.quantity}</td>
                                <td>{item.unit}</td>
                                <td>{item.unitPrice.toLocaleString()}</td>
                                <td className='fw-bold'>
                                  {item.totalPrice.toLocaleString()}
                                </td>
                                <td>
                                  <Badge
                                    bg={getStatusInfo(item.status).variant}
                                  >
                                    {getStatusInfo(item.status).label}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className='table-secondary'>
                              <td colSpan={4} className='text-end fw-bold'>
                                Total General:
                              </td>
                              <td className='fw-bold'>
                                {formatCurrency(
                                  purchase.totalAmount,
                                  purchase.currency,
                                )}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Columna lateral */}
                <Col lg={4}>
                  {/* Estadísticas */}
                  <Card className='purchase-detail-section mb-4'>
                    <Card.Header className='section-header'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>analytics</span>
                        Resumen
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className='g-2 text-center'>
                        <Col xs={6}>
                          <div className='summary-stat'>
                            <div className='stat-value'>
                              {purchase.items.length}
                            </div>
                            <div className='stat-label'>Items</div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className='summary-stat'>
                            <div className='stat-value'>
                              {purchase.documentsCount}
                            </div>
                            <div className='stat-label'>Documentos</div>
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className='summary-total'>
                            <div className='total-label'>Total</div>
                            <div className='total-value'>
                              {formatCurrency(
                                purchase.totalAmount,
                                purchase.currency,
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Categoría */}
                  <Card className='purchase-detail-section mb-4'>
                    <Card.Header className='section-header'>
                      <h6 className='mb-0'>
                        <span className='material-icons me-2'>category</span>
                        Categoría
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className='d-flex align-items-center'>
                        <div
                          className='category-color me-3'
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: purchase.category.color,
                            borderRadius: '4px',
                          }}
                        />
                        <div>{purchase.category.name}</div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Información de Aprobación */}
                  {(purchase.approvedBy || purchase.rejectedBy) && (
                    <Card className='purchase-detail-section'>
                      <Card.Header className='section-header'>
                        <h6 className='mb-0'>
                          <span className='material-icons me-2'>
                            {purchase.approvedBy ? 'check_circle' : 'cancel'}
                          </span>
                          {purchase.approvedBy ? 'Aprobación' : 'Rechazo'}
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        {purchase.approvedBy && (
                          <div>
                            <div>
                              <strong>Aprobada por:</strong>{' '}
                              {purchase.approvedBy}
                            </div>
                            {purchase.approvedDate && (
                              <div>
                                <strong>Fecha:</strong>{' '}
                                {formatDate(purchase.approvedDate)}
                              </div>
                            )}
                          </div>
                        )}
                        {purchase.rejectedBy && (
                          <div>
                            <div>
                              <strong>Rechazada por:</strong>{' '}
                              {purchase.rejectedBy}
                            </div>
                            {purchase.rejectedDate && (
                              <div>
                                <strong>Fecha:</strong>{' '}
                                {formatDate(purchase.rejectedDate)}
                              </div>
                            )}
                            {purchase.rejectionReason && (
                              <div className='mt-2'>
                                <strong>Motivo:</strong>
                                <div className='text-muted'>
                                  {purchase.rejectionReason}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Tab>

            <Tab
              eventKey='timeline'
              title={
                <span>
                  <span className='material-icons me-2'>timeline</span>
                  Historial
                </span>
              }
            >
              <Card className='purchase-detail-section'>
                <Card.Header className='section-header'>
                  <h6 className='mb-0'>
                    <span className='material-icons me-2'>timeline</span>
                    Línea de Tiempo
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className='timeline'>
                    {purchase.timeline.map((event, index) => (
                      <div
                        key={event.id}
                        className={`timeline-item ${index === 0 ? 'active' : ''}`}
                      >
                        <div className={`timeline-marker bg-${event.color}`}>
                          <span className='material-icons'>{event.icon}</span>
                        </div>
                        <div className='timeline-content'>
                          <h6 className='timeline-title'>{event.title}</h6>
                          <p className='timeline-description'>
                            {event.description}
                          </p>
                          <div className='timeline-meta'>
                            <span className='timeline-user'>{event.user}</span>
                            <span className='timeline-date'>
                              {formatDate(event.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Tab>

            <Tab
              eventKey='documents'
              title={
                <span>
                  <span className='material-icons me-2'>folder</span>
                  Documentos ({documents.length})
                </span>
              }
            >
              <Card className='purchase-detail-section'>
                <Card.Header className='section-header'>
                  <div className='d-flex justify-content-between align-items-center'>
                    <h6 className='mb-0'>
                      <span className='material-icons me-2'>folder</span>
                      Documentos Adjuntos
                    </h6>
                    <Button variant='outline-primary' size='sm'>
                      <span className='material-icons me-1'>cloud_upload</span>
                      Subir Documento
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {documents.length > 0 ? (
                    <div className='documents-list'>
                      {documents.map(doc => (
                        <div key={doc.id} className='document-item'>
                          <div className='d-flex align-items-center'>
                            <span className='material-icons text-primary me-3'>
                              description
                            </span>
                            <div className='flex-grow-1'>
                              <h6 className='mb-1'>{doc.name}</h6>
                              <small className='text-muted'>
                                {formatFileSize(doc.size)} • Subido por{' '}
                                {doc.uploadedBy} •{formatDate(doc.uploadDate)}
                              </small>
                            </div>
                            <div className='d-flex gap-2'>
                              <Button variant='outline-primary' size='sm'>
                                <span className='material-icons'>
                                  visibility
                                </span>
                              </Button>
                              <Button variant='outline-secondary' size='sm'>
                                <span className='material-icons'>download</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-4'>
                      <span
                        className='material-icons text-muted mb-3'
                        style={{ fontSize: '3rem' }}
                      >
                        folder_open
                      </span>
                      <h6>No hay documentos adjuntos</h6>
                      <p className='text-muted'>
                        Los documentos relacionados con esta compra aparecerán
                        aquí.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </div>

        {/* Modal de Aprobación */}
        <Modal
          show={showApprovalModal}
          onHide={() => setShowApprovalModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span className='material-icons me-2 text-success'>
                check_circle
              </span>
              Aprobar Compra
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas aprobar esta compra?</p>
            <Form.Group>
              <Form.Label>Nota de aprobación (opcional)</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Agrega una nota sobre la aprobación...'
                value={approvalNote}
                onChange={e => setApprovalNote(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowApprovalModal(false)}
            >
              Cancelar
            </Button>
            <Button variant='success' onClick={handleApprove}>
              <span className='material-icons me-2'>check_circle</span>
              Aprobar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Rechazo */}
        <Modal
          show={showRejectionModal}
          onHide={() => setShowRejectionModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span className='material-icons me-2 text-danger'>cancel</span>
              Rechazar Compra
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas rechazar esta compra?</p>
            <Form.Group>
              <Form.Label className='required'>Motivo del rechazo</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                placeholder='Explica el motivo del rechazo...'
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowRejectionModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant='danger'
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              <span className='material-icons me-2'>cancel</span>
              Rechazar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Agregar Nota */}
        <Modal
          show={showNoteModal}
          onHide={() => setShowNoteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span className='material-icons me-2'>note_add</span>
              Agregar Nota
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nota</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                placeholder='Escribe tu nota...'
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowNoteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              onClick={addNote}
              disabled={!newNote.trim()}
            >
              <span className='material-icons me-2'>note_add</span>
              Agregar Nota
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
