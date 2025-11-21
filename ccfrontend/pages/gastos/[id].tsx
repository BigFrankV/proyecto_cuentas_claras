import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Modal, Alert } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/ui/PageHeader';
import {
  getGastoById,
  getAprobaciones,
  createAprobacion,
  updateGasto,
} from '@/lib/gastosService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { mapBackendToExpense, Expense } from '@/types/gastos';

interface ExpenseFormData {
  id: number;
  description: string;
  category: number;
  provider: number;
  amount: string;
  date: string;
  dueDate: string;
  documentType: string;
  documentNumber: string;
  isRecurring: boolean;
  recurringPeriod: string;
  costCenter: number;
  tags: string[];
  observations: string;
  priority: 'low' | 'medium' | 'high';
  requiredApprovals: number;
  attachments: File[];
  existingAttachments: ExistingAttachment[];
}

interface ExistingAttachment {
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

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);

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
      // eslint-disable-next-line no-console
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
      pending: { label: 'Pendiente', className: 'status-pending', icon: 'schedule' },
      approved: { label: 'Aprobado', className: 'status-approved', icon: 'check_circle' },
      rejected: { label: 'Rechazado', className: 'status-rejected', icon: 'cancel' },
      paid: { label: 'Pagado', className: 'status-paid', icon: 'payment' },
      completed: { label: 'Completado', className: 'status-completed', icon: 'task_alt' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`custom-badge ${config.className}`}>
        <span className='material-icons'>{config.icon}</span>
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
      <span className={`custom-badge ${config.className}`}>
        <span className='material-icons'>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="category-tag">
        <span className="material-icons">label</span>
        {category}
      </span>
    );
  };

  const handleApproveExpense = async () => {
    setActionLoading(true);
    try {
      await createAprobacion(Number(id), {
        accion: 'aprobar',
        observaciones: 'Aprobado',
      });
      const nuevasAprobaciones = await getAprobaciones(Number(id));
      setApprovalHistory(nuevasAprobaciones);
      const data = await getGastoById(Number(id));
      setExpense(mapBackendToExpense(data));
      setShowApprovalModal(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al aprobar:', err);
      alert('Error al aprobar el gasto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectExpense = async () => {
    setActionLoading(true);
    try {
      await createAprobacion(Number(id), {
        accion: 'rechazar',
        observaciones: 'Rechazado',
      });
      const nuevasAprobaciones = await getAprobaciones(Number(id));
      setApprovalHistory(nuevasAprobaciones);
      const data = await getGastoById(Number(id));
      setExpense(mapBackendToExpense(data));
      setShowApprovalModal(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al rechazar:', err);
      alert('Error al rechazar el gasto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDeleteModal(false);
      router.push('/gastos');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting expense:', error);
      alert('Error al eliminar el gasto');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Cargando...">
          <div className='loading-container'>
            <div className='spinner-border text-primary mb-3' />
            <p>Cargando detalles del gasto...</p>
          </div>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 60vh;
              color: #6c757d;
            }
          `}</style>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!expense) {
    return (
      <ProtectedRoute>
        <Layout title="Gasto no encontrado">
          <div className='error-container'>
            <span className='material-icons error-icon'>error_outline</span>
            <h3>Gasto no encontrado</h3>
            <p>El gasto que buscas no existe o ha sido eliminado.</p>
            <button className='btn-primary' onClick={() => router.push('/gastos')}>
              <span className='material-icons'>arrow_back</span>
              Volver a Gastos
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
        <title>{expense.description} — Gastos — Cuentas Claras</title>
      </Head>

      <Layout title={`Gasto #${expense.id}`}>
        <div className='gasto-detalle-page'>
          <PageHeader
            title={`Gasto #${expense.id}`}
            subtitle="Detalle completo y gestión del gasto"
            icon="receipt_long"
          >
            <div className="header-actions">
              <button
                className="btn-secondary"
                onClick={() => router.push('/gastos')}
              >
                <span className="material-icons">arrow_back</span>
                Volver
              </button>
              
              <button
                className="btn-secondary"
                onClick={() => router.push(`/gastos/editar/${expense.id}`)}
              >
                <span className="material-icons">edit</span>
                Editar
              </button>

              {expense.status === 'pending' && (
                <button
                  className="btn-primary"
                  onClick={() => setShowApprovalModal(true)}
                >
                  <span className="material-icons">how_to_vote</span>
                  Aprobar/Rechazar
                </button>
              )}
            </div>
          </PageHeader>

          <div className="content-grid">
            <div className="main-column">
              {/* Main Info Card */}
              <div className="content-card main-info">
                <div className="info-header">
                  <div className="info-title">
                    <h1>{expense.description}</h1>
                    <div className="meta-row">
                      <span className="meta-item">
                        <span className="material-icons">description</span>
                        {expense.documentType} {expense.documentNumber}
                      </span>
                      <span className="meta-separator">•</span>
                      <span className="meta-item">
                        <span className="material-icons">event</span>
                        {new Date(expense.date).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>
                  <div className="amount-display">
                    <span className="amount-label">Monto Total</span>
                    <span className="amount-value">{formatCurrency(expense.amount)}</span>
                  </div>
                </div>
                
                <div className="badges-row">
                  {getStatusBadge(expense.status)}
                  {getPriorityBadge(expense.priority)}
                  {getCategoryBadge(expense.category)}
                  {expense.isRecurring && (
                    <span className="custom-badge badge-info">
                      <span className="material-icons">refresh</span>
                      Recurrente
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="content-card">
                <h3 className="card-title">
                  <span className="material-icons">info</span>
                  Detalles del Gasto
                </h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Proveedor</label>
                    <div className="value">{expense.provider}</div>
                  </div>
                  <div className="detail-item">
                    <label>Centro de Costo</label>
                    <div className="value">
                      {expense.costCenter === 'mantenimiento' ? 'Mantenimiento' : expense.costCenter}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Fecha de Vencimiento</label>
                    <div className="value">
                      {new Date(expense.dueDate).toLocaleDateString('es-CL')}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Método de Pago</label>
                    <div className="value">
                      {expense.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : expense.paymentMethod}
                    </div>
                  </div>
                  {expense.observations && (
                    <div className="detail-item full-width">
                      <label>Observaciones</label>
                      <div className="value">{expense.observations}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {expense.attachments.length > 0 && (
                <div className="content-card">
                  <h3 className="card-title">
                    <span className="material-icons">attach_file</span>
                    Archivos Adjuntos
                  </h3>
                  <div className="attachments-list">
                    {expense.attachments.map(file => (
                      <div key={file.id} className="attachment-item">
                        <div className="attachment-icon">
                          <span className="material-icons">
                            {file.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className="attachment-details">
                          <div className="attachment-name">{file.name}</div>
                          <div className="attachment-meta">
                            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('es-CL')}
                          </div>
                        </div>
                        <div className="attachment-actions">
                          <button className="btn-icon" title="Ver">
                            <span className="material-icons">visibility</span>
                          </button>
                          <button className="btn-icon" title="Descargar">
                            <span className="material-icons">download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval History */}
              {approvalHistory.length > 0 && (
                <div className="content-card">
                  <h3 className="card-title">
                    <span className="material-icons">history</span>
                    Historial de Aprobaciones
                  </h3>
                  <div className="timeline">
                    {approvalHistory.map((approval: any) => (
                      <div key={approval.id} className="timeline-item">
                        <div className={`timeline-icon ${approval.accion}`}>
                          <span className="material-icons">
                            {approval.accion === 'aprobar' ? 'check' : 'close'}
                          </span>
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="user-name">{approval.nombre_usuario}</span>
                            <span className="date">
                              {new Date(approval.created_at).toLocaleDateString('es-CL')}
                            </span>
                          </div>
                          <div className={`action-badge ${approval.accion}`}>
                            {approval.accion === 'aprobar' ? 'Aprobado' : 'Rechazado'}
                          </div>
                          {approval.observaciones && (
                            <p className="timeline-comment">{approval.observaciones}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sidebar-column">
              {/* Status Card */}
              <div className="content-card sidebar-card">
                <h3 className="card-title">Estado</h3>
                <div className="approval-status">
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(expense.currentApprovals / expense.requiredApprovals) * 100}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {expense.currentApprovals} de {expense.requiredApprovals} aprobaciones
                    </div>
                  </div>
                  
                  {expense.status === 'pending' && (
                    <div className="status-alert warning">
                      <span className="material-icons">schedule</span>
                      Pendiente de {expense.requiredApprovals - expense.currentApprovals} firma(s)
                    </div>
                  )}
                  {expense.status === 'approved' && (
                    <div className="status-alert success">
                      <span className="material-icons">check_circle</span>
                      Aprobado completamente
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="content-card sidebar-card">
                <h3 className="card-title">Información</h3>
                <div className="meta-list">
                  <div className="meta-list-item">
                    <span className="label">Creado por</span>
                    <span className="value">{expense.createdBy}</span>
                  </div>
                  <div className="meta-list-item">
                    <span className="label">Fecha creación</span>
                    <span className="value">{new Date(expense.createdAt).toLocaleDateString('es-CL')}</span>
                  </div>
                  <div className="meta-list-item">
                    <span className="label">ID Interno</span>
                    <span className="value">#{expense.id}</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="content-card sidebar-card danger-zone">
                <h3 className="card-title text-danger">Zona de Peligro</h3>
                <button 
                  className="btn-danger-outline"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <span className="material-icons">delete</span>
                  Eliminar Gasto
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Aprobar o Rechazar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Qué acción deseas realizar con este gasto?</p>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button className="btn-danger" onClick={handleRejectExpense} disabled={actionLoading}>
                <span className="material-icons">close</span> Rechazar
              </button>
              <button className="btn-success" onClick={handleApproveExpense} disabled={actionLoading}>
                <span className="material-icons">check</span> Aprobar
              </button>
            </div>
          </Modal.Body>
        </Modal>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">Eliminar Gasto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.</p>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeleteExpense} disabled={actionLoading}>
                Eliminar Definitivamente
              </button>
            </div>
          </Modal.Body>
        </Modal>

        <style jsx>{`
          .gasto-detalle-page {
            padding: 1.5rem;
            background-color: #f8f9fa;
            min-height: 100vh;
          }

          .header-actions {
            display: flex;
            gap: 1rem;
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

          .meta-item .material-icons {
            font-size: 1rem;
          }

          .meta-separator {
            margin: 0 0.5rem;
          }

          .amount-display {
            text-align: right;
          }

          .amount-label {
            display: block;
            font-size: 0.85rem;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 600;
          }

          .amount-value {
            font-size: 2rem;
            font-weight: 700;
            color: #2a5298;
          }

          .badges-row {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
          }

          /* Badges */
          .custom-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            color: white;
          }

          .custom-badge .material-icons {
            font-size: 1rem;
          }

          /* Status Colors - Complementary Opposites Palette */
          .status-pending { background: #f57c00; } /* Orange */
          .status-approved { background: #2e7d32; } /* Green */
          .status-rejected { background: #c62828; } /* Red */
          .status-paid { background: #1565c0; } /* Blue */
          .status-completed { background: #6a1b9a; } /* Purple */
          
          /* Priority Colors */
          .priority-low { background: #2e7d32; } /* Green */
          .priority-medium { background: #ff8f00; } /* Amber/Orange */
          .priority-high { background: #c62828; } /* Red */

          .badge-info { background: #00838f; } /* Cyan */

          .category-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.85rem;
            background: #f8f9fa;
            color: #495057;
            border: 1px solid #dee2e6;
          }

          .category-tag .material-icons {
            font-size: 1rem;
            color: #adb5bd;
          }

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

          .detail-item.full-width {
            grid-column: 1 / -1;
          }

          /* Attachments */
          .attachments-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .attachment-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background: #f8f9fa;
          }

          .attachment-icon {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2a5298;
            margin-right: 1rem;
            border: 1px solid #dee2e6;
          }

          .attachment-details {
            flex: 1;
          }

          .attachment-name {
            font-weight: 500;
            color: #212529;
            font-size: 0.95rem;
          }

          .attachment-meta {
            font-size: 0.8rem;
            color: #6c757d;
          }

          .btn-icon {
            background: none;
            border: none;
            color: #6c757d;
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
          }

          .btn-icon:hover {
            background: #e9ecef;
            color: #2a5298;
          }

          /* Timeline */
          .timeline {
            position: relative;
            padding-left: 1rem;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 20px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e9ecef;
          }

          .timeline-item {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
            position: relative;
          }

          .timeline-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: 2px solid #e9ecef;
            z-index: 1;
            flex-shrink: 0;
          }

          .timeline-icon.aprobar { border-color: #2e7d32; color: #2e7d32; background: #e8f5e9; }
          .timeline-icon.rechazar { border-color: #c62828; color: #c62828; background: #ffebee; }

          .timeline-content {
            flex: 1;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
          }

          .timeline-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }

          .user-name { font-weight: 600; color: #212529; }
          .date { font-size: 0.85rem; color: #6c757d; }

          .action-badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
          }
          .action-badge.aprobar { color: #2e7d32; }
          .action-badge.rechazar { color: #c62828; }

          .timeline-comment {
            margin: 0;
            font-size: 0.9rem;
            color: #495057;
            font-style: italic;
          }

          /* Sidebar */
          .progress-container {
            margin-bottom: 1rem;
          }

          .progress-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
          }

          .progress-fill {
            height: 100%;
            background: #2a5298;
            border-radius: 4px;
          }

          .progress-text {
            font-size: 0.85rem;
            color: #6c757d;
            text-align: right;
          }

          .status-alert {
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .status-alert.warning { background: #fff3cd; color: #e65100; }
          .status-alert.success { background: #d4edda; color: #1b5e20; }

          .meta-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .meta-list-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
          }

          .meta-list-item .label { color: #6c757d; }
          .meta-list-item .value { font-weight: 600; color: #212529; }

          .danger-zone {
            border-color: #ffcdd2;
            background: #fffafa;
          }

          /* Buttons */
          .btn-primary, .btn-secondary, .btn-danger, .btn-success {
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-primary { background: #2a5298; color: white; }
          .btn-primary:hover { background: #1e3c72; }

          .btn-secondary { background: white; border: 1px solid #dee2e6; color: #495057; }
          .btn-secondary:hover { background: #f8f9fa; border-color: #adb5bd; }

          .btn-danger { background: #dc3545; color: white; }
          .btn-danger:hover { background: #c82333; }

          .btn-success { background: #28a745; color: white; }
          .btn-success:hover { background: #218838; }

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
