import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import {
  Button,
  Card,
  Badge,
  Alert,
  Table,
  Modal,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { getGastoById, getAprobaciones, createAprobacion } from '@/lib/gastosService';
import { mapBackendToExpense } from '@/types/gastos';

interface Expense {
  id: number;
  description: string;
  category: string;
  provider: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'completed';
  dueDate: string;
  documentType: string;
  documentNumber: string;
  hasAttachments: boolean;
  createdBy: string;
  createdAt: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  requiredApprovals: number;
  currentApprovals: number;
  costCenter: string;
  observations: string;
  isRecurring: boolean;
  recurringPeriod: string;
  paymentMethod: string;
  approvalHistory: ApprovalRecord[];
  attachments: AttachmentFile[];
}

interface ApprovalRecord {
  id: number;
  approver: string;
  action: 'approved' | 'rejected' | 'requested_changes';
  date: string;
  comments: string;
}

interface AttachmentFile {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export default function GastoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const currentComunidadId = user?.comunidad_id;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);

  const comunidadId = currentComunidadId;

  useEffect(() => {
    if (id) {
      loadExpense();
      getAprobaciones(Number(id)).then(setApprovalHistory);
    }
  }, [id]);

  const loadExpense = async () => {
    try {
      setLoading(true);
      const data = await getGastoById(Number(id));
      setExpense(mapBackendToExpense(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'status-pending' },
      approved: { label: 'Aprobado', className: 'status-approved' },
      rejected: { label: 'Rechazado', className: 'status-rejected' },
      paid: { label: 'Pagado', className: 'status-paid' },
      completed: { label: 'Completado', className: 'status-completed' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`status-badge ${config.className}`}>
        <span className='material-icons me-1'>
          {status === 'approved'
            ? 'check_circle'
            : status === 'rejected'
              ? 'cancel'
              : status === 'paid'
                ? 'payment'
                : status === 'completed'
                  ? 'task_alt'
                  : 'schedule'}
        </span>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: {
        label: 'Baja',
        className: 'priority-low',
        icon: 'keyboard_arrow_down',
      },
      medium: { label: 'Media', className: 'priority-medium', icon: 'remove' },
      high: {
        label: 'Alta',
        className: 'priority-high',
        icon: 'keyboard_arrow_up',
      },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.medium;

    return (
      <span className={`priority-badge ${config.className}`}>
        <span className='material-icons me-1'>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      mantenimiento: {
        label: 'Mantenimiento',
        className: 'category-mantenimiento',
      },
      servicios: { label: 'Servicios', className: 'category-servicios' },
      personal: { label: 'Personal', className: 'category-personal' },
      suministros: { label: 'Suministros', className: 'category-suministros' },
      impuestos: { label: 'Impuestos', className: 'category-impuestos' },
      seguros: { label: 'Seguros', className: 'category-seguros' },
    };

    const config = categoryConfig[category as keyof typeof categoryConfig] || {
      label: category,
      className: 'category-badge',
    };

    return (
      <span className={`category-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleApproveExpense = async () => {
    setActionLoading(true);
    try {
      await createAprobacion(Number(id), { accion: 'aprobar', observaciones: 'Aprobado' });
      // Recargar aprobaciones
      const nuevasAprobaciones = await getAprobaciones(Number(id));
      setApprovalHistory(nuevasAprobaciones);
      // Recargar gasto para actualizar estado/aprobaciones
      const data = await getGastoById(Number(id));
      setExpense(mapBackendToExpense(data));
      setShowApprovalModal(false);
      alert('Gasto aprobado exitosamente');
    } catch (err) {
      console.error('Error al aprobar:', err);
      alert('Error al aprobar el gasto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectExpense = async () => {
    setActionLoading(true);
    try {
      await createAprobacion(Number(id), { accion: 'rechazar', observaciones: 'Rechazado' });
      // Recargar aprobaciones
      const nuevasAprobaciones = await getAprobaciones(Number(id));
      setApprovalHistory(nuevasAprobaciones);
      // Recargar gasto para actualizar estado/aprobaciones
      const data = await getGastoById(Number(id));
      setExpense(mapBackendToExpense(data));
      setShowApprovalModal(false);
      alert('Gasto rechazado');
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert('Error al rechazar el gasto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    setActionLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowDeleteModal(false);
      alert('Gasto eliminado exitosamente');
      router.push('/gastos');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error al eliminar el gasto');
    } finally {
      setActionLoading(false);
    }
  };

  const mapToFormData = (gasto: any): ExpenseFormData => ({
    id: gasto.id,
    description: gasto.glosa || '',
    category: gasto.categoria_id || 0, // Dinámico
    provider: gasto.proveedor_id || 0, // Dinámico
    amount: gasto.monto?.toString() || '',
    date: gasto.fecha || '',
    dueDate: gasto.fecha_vencimiento || '',
    documentType: gasto.documento_tipo || 'factura',
    documentNumber: gasto.documento_numero || '',
    isRecurring: gasto.extraordinario === 0, // Dinámico
    recurringPeriod: gasto.recurring_period || '', // Dinámico
    costCenter: gasto.centro_costo_id || 0, // Dinámico
    tags: gasto.tags || [], // Dinámico
    observations: gasto.observaciones || '',
    priority: gasto.priority || 'medium', // Dinámico
    requiredApprovals: gasto.required_aprobaciones || 1,
    attachments: [],
    existingAttachments: gasto.attachments?.map((a: any) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      size: a.size,
      url: a.url,
      uploadedAt: a.uploadedAt,
    })) || [],
  });

  const mapFormDataToPayload = (form: any): any => ({
    categoria_id: parseInt(form.category), // Asumir que category es ID
    fecha: form.date,
    monto: parseFloat(form.amount.replace(/\./g, '').replace(',', '.')),
    centro_costo_id: form.costCenter ? parseInt(form.costCenter) : undefined,
    glosa: form.description,
    // Agrega otros campos según backend
  });

  useEffect(() => {
    if (id && comunidadId) {
      getGastoById(Number(id)).then(data => setExpense(mapToFormData(data)));
    }
  }, [id, comunidadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = mapFormDataToPayload(expense);
      await updateGasto(Number(id), payload);
      router.push(`/gastos/${id}`);
    } catch (err) {
      console.error(err);
      // Manejar error
    } finally {
      setLoading(false);
    }
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
              <p>Cargando detalles del gasto...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!expense) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <span className='material-icons display-1 text-muted'>
              error_outline
            </span>
            <h3>Gasto no encontrado</h3>
            <p className='text-muted'>
              El gasto que buscas no existe o ha sido eliminado.
            </p>
            <Button variant='primary' onClick={() => router.push('/gastos')}>
              <span className='material-icons me-2'>arrow_back</span>
              Volver a Gastos
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{expense.description} — Gastos — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='expense-detail-container'>
          {/* Header */}
          <div className='detail-header mb-4'>
            <div className='d-flex align-items-start justify-content-between'>
              <div className='d-flex align-items-center'>
                <Button
                  variant='outline-secondary'
                  onClick={() => router.push('/gastos')}
                  className='me-3'
                >
                  <span className='material-icons'>arrow_back</span>
                </Button>
                <div>
                  <h1 className='detail-title mb-1'>
                    <span className='material-icons me-2'>receipt_long</span>
                    {expense.description}
                  </h1>
                  <div className='detail-subtitle'>
                    <span className='text-muted me-3'>
                      {expense.documentType} {expense.documentNumber}
                    </span>
                    <span className='text-muted me-3'>•</span>
                    <span className='text-muted'>
                      Creado el{' '}
                      {new Date(expense.createdAt).toLocaleDateString('es-CL')}{' '}
                      por {expense.createdBy}
                    </span>
                  </div>
                  <div className='detail-badges mt-2'>
                    {getStatusBadge(expense.status)}
                    {getPriorityBadge(expense.priority)}
                    {getCategoryBadge(expense.category)}
                    {expense.isRecurring && (
                      <Badge bg='info' className='me-2'>
                        <span className='material-icons me-1'>refresh</span>
                        Recurrente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className='d-flex gap-2'>
                <Dropdown>
                  <Dropdown.Toggle variant='outline-secondary'>
                    <span className='material-icons me-2'>share</span>
                    Compartir
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <span className='material-icons me-2'>email</span>
                      Enviar por email
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <span className='material-icons me-2'>file_download</span>
                      Descargar PDF
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <span className='material-icons me-2'>print</span>
                      Imprimir
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Button
                  variant='outline-primary'
                  onClick={() => router.push(`/gastos/editar/${expense.id}`)}
                >
                  <span className='material-icons me-2'>edit</span>
                  Editar
                </Button>

                {expense.status === 'pending' && (
                  <Button
                    variant='primary'
                    onClick={() => setShowApprovalModal(true)}
                  >
                    <span className='material-icons me-2'>how_to_vote</span>
                    Aprobar/Rechazar
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8'>
              {/* Información principal */}
              <div className='row mb-4'>
                <div className='col-md-6'>
                  <Card className='info-card'>
                    <Card.Body>
                      <div className='info-card-header'>
                        <span className='material-icons info-card-icon'>
                          attach_money
                        </span>
                        <h6>Monto Total</h6>
                      </div>
                      <div className='info-card-value amount-high'>
                        {formatCurrency(expense.amount)}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className='col-md-6'>
                  <Card className='info-card'>
                    <Card.Body>
                      <div className='info-card-header'>
                        <span className='material-icons info-card-icon'>
                          business
                        </span>
                        <h6>Proveedor</h6>
                      </div>
                      <div className='info-card-value'>{expense.provider}</div>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {/* Detalles del gasto */}
              <Card className='detail-card mb-4'>
                <Card.Body>
                  <div className='card-header-custom mb-4'>
                    <h5 className='card-title-custom'>
                      <span className='material-icons me-2'>info</span>
                      Detalles del Gasto
                    </h5>
                  </div>

                  <div className='row'>
                    <div className='col-md-6 mb-3'>
                      <div className='detail-item'>
                        <label>Fecha del Documento</label>
                        <div className='detail-value'>
                          {new Date(expense.date).toLocaleDateString('es-CL')}
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6 mb-3'>
                      <div className='detail-item'>
                        <label>Fecha de Vencimiento</label>
                        <div className='detail-value'>
                          {new Date(expense.dueDate).toLocaleDateString(
                            'es-CL',
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6 mb-3'>
                      <div className='detail-item'>
                        <label>Centro de Costo</label>
                        <div className='detail-value'>
                          {expense.costCenter === 'mantenimiento'
                            ? 'Mantenimiento'
                            : expense.costCenter}
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6 mb-3'>
                      <div className='detail-item'>
                        <label>Método de Pago</label>
                        <div className='detail-value'>
                          {expense.paymentMethod === 'transferencia'
                            ? 'Transferencia Bancaria'
                            : expense.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>

                  {expense.observations && (
                    <div className='mt-4'>
                      <label>Observaciones</label>
                      <div className='detail-value'>{expense.observations}</div>
                    </div>
                  )}

                  {expense.tags.length > 0 && (
                    <div className='mt-4'>
                      <label>Etiquetas</label>
                      <div className='mt-2'>
                        {expense.tags.map((tag, index) => (
                          <Badge key={index} bg='secondary' className='me-2'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Archivos adjuntos */}
              {expense.attachments.length > 0 && (
                <Card className='detail-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-4'>
                      <h5 className='card-title-custom'>
                        <span className='material-icons me-2'>attach_file</span>
                        Archivos Adjuntos ({expense.attachments.length})
                      </h5>
                    </div>

                    <div className='attachments-grid'>
                      {expense.attachments.map(file => (
                        <div key={file.id} className='attachment-item'>
                          <div className='attachment-icon'>
                            <span className='material-icons'>
                              {file.type.includes('pdf')
                                ? 'picture_as_pdf'
                                : 'image'}
                            </span>
                          </div>
                          <div className='attachment-info'>
                            <div className='attachment-name'>{file.name}</div>
                            <div className='attachment-meta'>
                              {formatFileSize(file.size)} •{' '}
                              {new Date(file.uploadedAt).toLocaleDateString(
                                'es-CL',
                              )}
                            </div>
                          </div>
                          <div className='attachment-actions'>
                            <OverlayTrigger
                              overlay={<Tooltip>Ver archivo</Tooltip>}
                            >
                              <Button variant='outline-primary' size='sm'>
                                <span className='material-icons'>
                                  visibility
                                </span>
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              overlay={<Tooltip>Descargar</Tooltip>}
                            >
                              <Button variant='outline-secondary' size='sm'>
                                <span className='material-icons'>
                                  file_download
                                </span>
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Historial de aprobaciones */}
              {approvalHistory.length > 0 && (
                <Card className='detail-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-4'>
                      <h5 className='card-title-custom'>
                        <span className='material-icons me-2'>history</span>
                        Historial de Aprobaciones
                      </h5>
                    </div>

                    <div className='approval-timeline'>
                      {approvalHistory.map((approval: any, index: number) => (
                        <div key={approval.id} className='approval-item'>
                          <div className='approval-icon'>
                            <span
                              className={`material-icons ${
                                approval.accion === 'aprobar'
                                  ? 'text-success'
                                  : 'text-danger'
                              }`}
                            >
                              {approval.accion === 'aprobar'
                                ? 'check_circle'
                                : 'cancel'}
                            </span>
                          </div>
                          <div className='approval-content'>
                            <div className='approval-header'>
                              <span className='approval-user'>
                                {approval.nombre_usuario}
                              </span>
                              <span
                                className={`approval-action ${approval.accion}`}
                              >
                                {approval.accion === 'aprobar'
                                  ? 'Aprobó'
                                  : 'Rechazó'}
                              </span>
                              <span className='approval-date'>
                                {new Date(approval.created_at).toLocaleDateString(
                                  'es-CL',
                                )}
                              </span>
                            </div>
                            {approval.observaciones && (
                              <div className='approval-comments'>
                                {approval.observaciones}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>

            <div className='col-lg-4'>
              {/* Panel lateral */}
              <div className='sticky-sidebar'>
                {/* Estado de aprobación */}
                <Card className='info-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-3'>
                      <h6 className='card-title-custom'>
                        <span className='material-icons me-2'>how_to_vote</span>
                        Estado de Aprobación
                      </h6>
                    </div>

                    <div className='approval-progress'>
                      <div className='approval-progress-bar'>
                        <div
                          className='approval-progress-fill'
                          style={{
                            width: `${(expense.currentApprovals / expense.requiredApprovals) * 100}%`,
                          }}
                        />
                      </div>
                      <div className='approval-progress-text'>
                        {expense.currentApprovals} de{' '}
                        {expense.requiredApprovals} aprobaciones
                      </div>
                    </div>

                    {expense.status === 'pending' && (
                      <Alert variant='warning' className='mt-3 mb-0'>
                        <span className='material-icons me-2'>schedule</span>
                        Pendiente de{' '}
                        {expense.requiredApprovals -
                          expense.currentApprovals}{' '}
                        aprobación(es)
                      </Alert>
                    )}

                    {expense.status === 'approved' && (
                      <Alert variant='success' className='mt-3 mb-0'>
                        <span className='material-icons me-2'>
                          check_circle
                        </span>
                        Gasto aprobado completamente
                      </Alert>
                    )}

                    {expense.status === 'rejected' && (
                      <Alert variant='danger' className='mt-3 mb-0'>
                        <span className='material-icons me-2'>cancel</span>
                        Gasto rechazado
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {/* Acciones rápidas */}
                <Card className='info-card mb-4'>
                  <Card.Body>
                    <div className='card-header-custom mb-3'>
                      <h6 className='card-title-custom'>
                        <span className='material-icons me-2'>flash_on</span>
                        Acciones Rápidas
                      </h6>
                    </div>

                    <div className='d-grid gap-2'>
                      <Button
                        variant='outline-primary'
                        onClick={() =>
                          router.push(`/gastos/editar/${expense.id}`)
                        }
                      >
                        <span className='material-icons me-2'>edit</span>
                        Editar Gasto
                      </Button>

                      <Button variant='outline-secondary'>
                        <span className='material-icons me-2'>
                          content_copy
                        </span>
                        Duplicar Gasto
                      </Button>

                      <Button variant='outline-secondary'>
                        <span className='material-icons me-2'>
                          file_download
                        </span>
                        Descargar PDF
                      </Button>

                      <Button
                        variant='outline-danger'
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <span className='material-icons me-2'>delete</span>
                        Eliminar Gasto
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Información adicional */}
                <Card className='info-card'>
                  <Card.Body>
                    <div className='card-header-custom mb-3'>
                      <h6 className='card-title-custom'>
                        <span className='material-icons me-2'>info</span>
                        Información Adicional
                      </h6>
                    </div>

                    <div className='info-list'>
                      <div className='info-list-item'>
                        <span className='info-list-label'>ID del Gasto</span>
                        <span className='info-list-value'>#{expense.id}</span>
                      </div>
                      <div className='info-list-item'>
                        <span className='info-list-label'>Creado por</span>
                        <span className='info-list-value'>
                          {expense.createdBy}
                        </span>
                      </div>
                      <div className='info-list-item'>
                        <span className='info-list-label'>
                          Fecha de creación
                        </span>
                        <span className='info-list-value'>
                          {new Date(expense.createdAt).toLocaleDateString(
                            'es-CL',
                          )}
                        </span>
                      </div>
                      {expense.isRecurring && (
                        <div className='info-list-item'>
                          <span className='info-list-label'>Recurrencia</span>
                          <span className='info-list-value'>
                            {expense.recurringPeriod === 'monthly'
                              ? 'Mensual'
                              : expense.recurringPeriod}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de aprobación */}
        <Modal
          show={showApprovalModal}
          onHide={() => setShowApprovalModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <span className='material-icons me-2'>how_to_vote</span>
              Aprobar o Rechazar Gasto
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Qué acción deseas realizar con este gasto?</p>
            <div className='d-flex gap-2 justify-content-end'>
              <Button
                variant='success'
                onClick={handleApproveExpense}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className='spinner-border spinner-border-sm me-2' />
                ) : (
                  <span className='material-icons me-2'>check_circle</span>
                )}
                Aprobar
              </Button>
              <Button
                variant='danger'
                onClick={handleRejectExpense}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className='spinner-border spinner-border-sm me-2' />
                ) : (
                  <span className='material-icons me-2'>cancel</span>
                )}
                Rechazar
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Modal de eliminación */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className='text-danger'>
              <span className='material-icons me-2'>delete</span>
              Eliminar Gasto
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant='danger'>
              <span className='material-icons me-2'>warning</span>
              Esta acción no se puede deshacer. El gasto será eliminado
              permanentemente.
            </Alert>
            <p>¿Estás seguro de que deseas eliminar este gasto?</p>
            <div className='d-flex gap-2 justify-content-end'>
              <Button
                variant='outline-secondary'
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                variant='danger'
                onClick={handleDeleteExpense}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className='spinner-border spinner-border-sm me-2' />
                ) : (
                  <span className='material-icons me-2'>delete</span>
                )}
                Eliminar
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
