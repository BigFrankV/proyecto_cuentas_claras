import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { StatusBadge, TypeBadge, FileIcon } from '@/components/documentos';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Provider {
  id: string;
  name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'comment';
  title: string;
  description: string;
  user: string;
  date: string;
  status?: string;
}

interface Comment {
  id: string;
  user: string;
  avatar: string;
  content: string;
  date: string;
}

interface PurchaseDocumentDetail {
  id: string;
  number: string;
  type: 'invoice' | 'receipt' | 'quote' | 'order';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  provider: Provider;
  description: string;
  date: string;
  dueDate?: string;
  items: DocumentItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  attachments: Attachment[];
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  timeline: TimelineEvent[];
  comments: Comment[];
  notes?: string;
  costCenter?: string;
}

export default function DocumentoCompraDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState<PurchaseDocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [newComment, setNewComment] = useState('');
  const [approvalAction, setApprovalAction] = useState<
    'approve' | 'reject' | null
  >(null);
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    if (!id) {return;}

    // Mock data
    setTimeout(() => {
      const mockDocument: PurchaseDocumentDetail = {
        id: id as string,
        number: 'FC-2024-001',
        type: 'invoice',
        status: 'pending',
        provider: {
          id: '1',
          name: 'Empresa de Servicios ABC',
          rut: '12.345.678-9',
          email: 'contacto@abc.cl',
          phone: '+56 9 1234 5678',
          address: 'Av. Providencia 123, Santiago',
        },
        description: 'Mantenimiento ascensores enero 2024',
        date: '2024-01-15',
        dueDate: '2024-02-15',
        items: [
          {
            id: '1',
            description: 'Mantenimiento preventivo ascensor 1',
            quantity: 1,
            unitPrice: 250000,
            total: 250000,
          },
          {
            id: '2',
            description: 'Mantenimiento preventivo ascensor 2',
            quantity: 1,
            unitPrice: 250000,
            total: 250000,
          },
          {
            id: '3',
            description: 'Repuestos varios',
            quantity: 5,
            unitPrice: 50000,
            total: 250000,
          },
          {
            id: '4',
            description: 'Mano de obra técnica especializada',
            quantity: 8,
            unitPrice: 25000,
            total: 200000,
          },
        ],
        subtotal: 950000,
        taxRate: 19,
        taxAmount: 180500,
        total: 1130500,
        attachments: [
          {
            id: '1',
            name: 'factura-fc-2024-001.pdf',
            size: '2.1 MB',
            type: 'pdf',
            url: '#',
          },
          {
            id: '2',
            name: 'orden-trabajo-ascensores.docx',
            size: '156 KB',
            type: 'doc',
            url: '#',
          },
        ],
        createdBy: 'Admin',
        createdAt: '2024-01-15T10:30:00Z',
        timeline: [
          {
            id: '1',
            type: 'created',
            title: 'Documento creado',
            description: 'Se creó el documento de compra FC-2024-001',
            user: 'Admin',
            date: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            type: 'submitted',
            title: 'Enviado para aprobación',
            description: 'El documento fue enviado para revisión y aprobación',
            user: 'Admin',
            date: '2024-01-15T11:00:00Z',
          },
          {
            id: '3',
            type: 'comment',
            title: 'Comentario agregado',
            description: 'Se agregó un comentario al documento',
            user: 'Revisor',
            date: '2024-01-16T09:15:00Z',
          },
        ],
        comments: [
          {
            id: '1',
            user: 'Revisor',
            avatar: 'RE',
            content:
              'Los montos parecen estar correctos. Revisar la fecha de vencimiento.',
            date: '2024-01-16T09:15:00Z',
          },
        ],
        notes:
          'Mantenimiento programado según contrato anual. Incluye revisión completa de sistemas.',
        costCenter: 'Mantenimiento General',
      };

      setDocument(mockDocument);
      setLoading(false);
    }, 800);
  }, [id]);

  const handleApproval = (action: 'approve' | 'reject') => {
    if (!document) {return;}

    if (!approvalComment.trim()) {
      alert('Debes agregar un comentario para la aprobación/rechazo');
      return;
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const newTimeline: TimelineEvent = {
      id: Date.now().toString(),
      type: action === 'approve' ? 'approved' : 'rejected',
      title:
        action === 'approve' ? 'Documento aprobado' : 'Documento rechazado',
      description: approvalComment,
      user: 'Usuario Actual',
      date: new Date().toISOString(),
    };

    setDocument(prev =>
      prev
        ? {
            ...prev,
            status: newStatus,
            approvedBy: 'Usuario Actual',
            approvedAt: new Date().toISOString(),
            timeline: [...prev.timeline, newTimeline],
          }
        : null,
    );

    setApprovalAction(null);
    setApprovalComment('');

    alert(
      `Documento ${action === 'approve' ? 'aprobado' : 'rechazado'} exitosamente`,
    );
  };

  const handleAddComment = () => {
    if (!document || !newComment.trim()) {return;}

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'Usuario Actual',
      avatar: 'UC',
      content: newComment,
      date: new Date().toISOString(),
    };

    const timelineEvent: TimelineEvent = {
      id: Date.now().toString(),
      type: 'comment',
      title: 'Comentario agregado',
      description: newComment,
      user: 'Usuario Actual',
      date: new Date().toISOString(),
    };

    setDocument(prev =>
      prev
        ? {
            ...prev,
            comments: [...prev.comments, comment],
            timeline: [...prev.timeline, timelineEvent],
          }
        : null,
    );

    setNewComment('');
  };

  const handleMarkAsPaid = () => {
    if (!document) {return;}

    if (confirm('¿Marcar este documento como pagado?')) {
      const timelineEvent: TimelineEvent = {
        id: Date.now().toString(),
        type: 'paid',
        title: 'Documento marcado como pagado',
        description: 'El documento ha sido procesado para pago',
        user: 'Usuario Actual',
        date: new Date().toISOString(),
      };

      setDocument(prev =>
        prev
          ? {
              ...prev,
              status: 'paid',
              timeline: [...prev.timeline, timelineEvent],
            }
          : null,
      );

      alert('Documento marcado como pagado exitosamente');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Documento de Compra'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando documento...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!document) {
    return (
      <ProtectedRoute>
        <Layout title='Documento no encontrado'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <h3>Documento no encontrado</h3>
              <p className='text-muted'>
                El documento que buscas no existe o ha sido eliminado.
              </p>
              <Link href='/documentos-compra' className='btn btn-primary'>
                Volver a Documentos de Compra
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{document.number} — Documentos de Compra — Cuentas Claras</title>
      </Head>

      <Layout title='Detalle de Documento de Compra'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link
                  href='/documentos-compra'
                  className='text-decoration-none'
                >
                  Documentos de Compra
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                {document.number}
              </li>
            </ol>
          </nav>

          {/* Document Header */}
          <div className='document-header card shadow-sm mb-4'>
            <div className='card-body'>
              <div className='row align-items-center'>
                <div className='col-lg-8'>
                  <div className='d-flex align-items-center mb-3'>
                    <TypeBadge type={document.type} size='md' />
                    <StatusBadge status={document.status} size='md' />
                  </div>
                  <h1 className='h3 mb-2'>{document.number}</h1>
                  <div className='document-info text-muted'>
                    <div className='row'>
                      <div className='col-md-6'>
                        <p className='mb-1'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            business
                          </i>
                          {document.provider.name}
                        </p>
                        <p className='mb-1'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            calendar_today
                          </i>
                          Fecha:{' '}
                          {new Date(document.date).toLocaleDateString('es-CL')}
                        </p>
                        {document.dueDate && (
                          <p className='mb-1'>
                            <i
                              className='material-icons me-2'
                              style={{ fontSize: '16px' }}
                            >
                              schedule
                            </i>
                            Vencimiento:{' '}
                            {new Date(document.dueDate).toLocaleDateString(
                              'es-CL',
                            )}
                          </p>
                        )}
                      </div>
                      <div className='col-md-6'>
                        <p className='mb-1'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            person
                          </i>
                          Creado por: {document.createdBy}
                        </p>
                        <p className='mb-1'>
                          <i
                            className='material-icons me-2'
                            style={{ fontSize: '16px' }}
                          >
                            access_time
                          </i>
                          {formatDate(document.createdAt)}
                        </p>
                        {document.costCenter && (
                          <p className='mb-1'>
                            <i
                              className='material-icons me-2'
                              style={{ fontSize: '16px' }}
                            >
                              account_tree
                            </i>
                            Centro de costo: {document.costCenter}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='col-lg-4 text-lg-end'>
                  <div className='h2 text-primary mb-3'>
                    {formatCurrency(document.total)}
                  </div>
                  <div className='d-flex gap-2 justify-content-lg-end'>
                    {document.status === 'pending' && (
                      <>
                        <button
                          className='btn btn-success'
                          onClick={() => setApprovalAction('approve')}
                        >
                          <i className='material-icons me-2'>check</i>
                          Aprobar
                        </button>
                        <button
                          className='btn btn-outline-warning'
                          onClick={() => setApprovalAction('reject')}
                        >
                          <i className='material-icons me-2'>close</i>
                          Rechazar
                        </button>
                      </>
                    )}
                    {document.status === 'approved' && (
                      <button
                        className='btn btn-info'
                        onClick={handleMarkAsPaid}
                      >
                        <i className='material-icons me-2'>payments</i>
                        Marcar como Pagado
                      </button>
                    )}
                    <div className='dropdown'>
                      <button
                        className='btn btn-outline-secondary dropdown-toggle'
                        type='button'
                        data-bs-toggle='dropdown'
                      >
                        <i className='material-icons'>more_vert</i>
                      </button>
                      <ul className='dropdown-menu dropdown-menu-end'>
                        <li>
                          <Link
                            className='dropdown-item'
                            href={`/documentos-compra/${document.id}/editar`}
                          >
                            <i className='material-icons me-2'>edit</i>
                            Editar
                          </Link>
                        </li>
                        <li>
                          <button className='dropdown-item'>
                            <i className='material-icons me-2'>print</i>
                            Imprimir
                          </button>
                        </li>
                        <li>
                          <button className='dropdown-item'>
                            <i className='material-icons me-2'>file_download</i>
                            Exportar PDF
                          </button>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button className='dropdown-item text-danger'>
                            <i className='material-icons me-2'>delete</i>
                            Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-8'>
              {/* Tabs */}
              <div className='document-tabs card shadow-sm mb-4'>
                <div className='card-body'>
                  <ul className='nav nav-tabs' role='tablist'>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('content')}
                      >
                        <i className='material-icons me-2'>receipt</i>
                        Contenido
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                      >
                        <i className='material-icons me-2'>timeline</i>
                        Historial
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'attachments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attachments')}
                      >
                        <i className='material-icons me-2'>attach_file</i>
                        Adjuntos ({document.attachments.length})
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                      >
                        <i className='material-icons me-2'>comment</i>
                        Comentarios ({document.comments.length})
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Detalles del Documento</h5>

                    {document.description && (
                      <div className='mb-4'>
                        <h6>Descripción</h6>
                        <p className='text-muted'>{document.description}</p>
                      </div>
                    )}

                    <h6 className='mb-3'>Ítems</h6>
                    <div className='table-responsive'>
                      <table className='table table-hover'>
                        <thead className='table-light'>
                          <tr>
                            <th>Descripción</th>
                            <th className='text-center'>Cantidad</th>
                            <th className='text-end'>Precio Unitario</th>
                            <th className='text-end'>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {document.items.map(item => (
                            <tr key={item.id}>
                              <td>{item.description}</td>
                              <td className='text-center'>{item.quantity}</td>
                              <td className='text-end'>
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className='text-end fw-medium'>
                                {formatCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className='row justify-content-end'>
                      <div className='col-md-6'>
                        <div className='table-totals'>
                          <div className='d-flex justify-content-between mb-2'>
                            <span>Subtotal:</span>
                            <span>{formatCurrency(document.subtotal)}</span>
                          </div>
                          <div className='d-flex justify-content-between mb-2'>
                            <span>IVA ({document.taxRate}%):</span>
                            <span>{formatCurrency(document.taxAmount)}</span>
                          </div>
                          <hr />
                          <div className='d-flex justify-content-between fw-bold h5'>
                            <span>Total:</span>
                            <span className='text-primary'>
                              {formatCurrency(document.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {document.notes && (
                      <div className='mt-4'>
                        <h6>Notas</h6>
                        <p className='text-muted'>{document.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Historial del Documento</h5>

                    <div className='timeline'>
                      {document.timeline.map((event, index) => (
                        <div key={event.id} className='timeline-item'>
                          <div className='timeline-dot bg-primary'></div>
                          <div className='timeline-content'>
                            <div className='timeline-header d-flex justify-content-between align-items-start mb-2'>
                              <div>
                                <h6 className='timeline-title mb-1'>
                                  {event.title}
                                </h6>
                                <p className='timeline-description text-muted mb-0'>
                                  {event.description}
                                </p>
                              </div>
                              <div className='timeline-date text-muted small'>
                                {formatDate(event.date)}
                              </div>
                            </div>
                            <div className='timeline-footer text-muted small'>
                              Por: {event.user}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Archivos Adjuntos</h5>

                    {document.attachments.length > 0 ? (
                      <div className='row g-3'>
                        {document.attachments.map(attachment => (
                          <div key={attachment.id} className='col-md-6'>
                            <div className='attachment-item d-flex align-items-center p-3 border rounded'>
                              <FileIcon fileName={attachment.name} size='md' />
                              <div className='attachment-info flex-grow-1 ms-3'>
                                <div className='attachment-name fw-medium'>
                                  {attachment.name}
                                </div>
                                <div className='attachment-meta text-muted small'>
                                  {attachment.size}
                                </div>
                              </div>
                              <div className='attachment-actions'>
                                <button className='btn btn-sm btn-outline-primary me-2'>
                                  <i className='material-icons'>visibility</i>
                                </button>
                                <button className='btn btn-sm btn-outline-secondary'>
                                  <i className='material-icons'>download</i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-4'>
                        <i
                          className='material-icons mb-2 text-muted'
                          style={{ fontSize: '3rem' }}
                        >
                          attach_file
                        </i>
                        <p className='text-muted'>No hay archivos adjuntos</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className='card shadow-sm mb-4'>
                  <div className='card-body'>
                    <h5 className='card-title mb-4'>Comentarios</h5>

                    {/* Comments List */}
                    {document.comments.length > 0 ? (
                      <div className='comments-list mb-4'>
                        {document.comments.map(comment => (
                          <div
                            key={comment.id}
                            className='comment-item d-flex mb-3'
                          >
                            <div
                              className='avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3'
                              style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '14px',
                                fontWeight: '500',
                              }}
                            >
                              {comment.avatar}
                            </div>
                            <div className='comment-content flex-grow-1'>
                              <div className='comment-header d-flex justify-content-between align-items-center mb-2'>
                                <div className='comment-author fw-medium'>
                                  {comment.user}
                                </div>
                                <div className='comment-date text-muted small'>
                                  {formatDate(comment.date)}
                                </div>
                              </div>
                              <div className='comment-text'>
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-4 mb-4'>
                        <i
                          className='material-icons mb-2 text-muted'
                          style={{ fontSize: '3rem' }}
                        >
                          comment
                        </i>
                        <p className='text-muted'>No hay comentarios aún</p>
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className='add-comment'>
                      <h6 className='mb-3'>Agregar comentario</h6>
                      <div className='d-flex'>
                        <div
                          className='avatar bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3'
                          style={{
                            width: '40px',
                            height: '40px',
                            fontSize: '14px',
                            fontWeight: '500',
                          }}
                        >
                          UC
                        </div>
                        <div className='flex-grow-1'>
                          <textarea
                            className='form-control mb-2'
                            rows={3}
                            placeholder='Escribe tu comentario...'
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                          ></textarea>
                          <button
                            className='btn btn-primary'
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                          >
                            <i className='material-icons me-2'>send</i>
                            Agregar Comentario
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='col-lg-4'>
              {/* Provider Info */}
              <div className='provider-info-box card shadow-sm mb-4'>
                <div className='card-body'>
                  <div className='provider-header d-flex align-items-center mb-3'>
                    <div
                      className='provider-logo bg-primary text-white rounded d-flex align-items-center justify-content-center me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        fontWeight: '500',
                      }}
                    >
                      {document.provider.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className='provider-name fw-bold'>
                        {document.provider.name}
                      </div>
                      <div className='text-muted small'>
                        {document.provider.rut}
                      </div>
                    </div>
                  </div>

                  <div className='provider-details'>
                    <div className='provider-contact mb-2'>
                      <i className='material-icons me-2'>email</i>
                      <a
                        href={`mailto:${document.provider.email}`}
                        className='text-decoration-none'
                      >
                        {document.provider.email}
                      </a>
                    </div>
                    <div className='provider-contact mb-2'>
                      <i className='material-icons me-2'>phone</i>
                      <a
                        href={`tel:${document.provider.phone}`}
                        className='text-decoration-none'
                      >
                        {document.provider.phone}
                      </a>
                    </div>
                    <div className='provider-contact'>
                      <i className='material-icons me-2'>location_on</i>
                      <span>{document.provider.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='card shadow-sm mb-4'>
                <div className='card-body'>
                  <h6 className='card-title mb-3'>Información Rápida</h6>
                  <div className='detail-section'>
                    <div className='detail-item d-flex justify-content-between mb-2'>
                      <span className='label text-muted'>Total de ítems:</span>
                      <span className='value'>{document.items.length}</span>
                    </div>
                    <div className='detail-item d-flex justify-content-between mb-2'>
                      <span className='label text-muted'>
                        Archivos adjuntos:
                      </span>
                      <span className='value'>
                        {document.attachments.length}
                      </span>
                    </div>
                    <div className='detail-item d-flex justify-content-between mb-2'>
                      <span className='label text-muted'>Comentarios:</span>
                      <span className='value'>{document.comments.length}</span>
                    </div>
                    {document.dueDate && (
                      <div className='detail-item d-flex justify-content-between'>
                        <span className='label text-muted'>
                          Días para vencer:
                        </span>
                        <span className='value'>
                          {Math.ceil(
                            (new Date(document.dueDate).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Modal */}
          {approvalAction && (
            <div
              className='modal d-block'
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <div className='modal-dialog modal-dialog-centered'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>
                      {approvalAction === 'approve'
                        ? 'Aprobar Documento'
                        : 'Rechazar Documento'}
                    </h5>
                    <button
                      type='button'
                      className='btn-close'
                      onClick={() => setApprovalAction(null)}
                    ></button>
                  </div>
                  <div className='modal-body'>
                    <p>
                      ¿Estás seguro de que deseas{' '}
                      {approvalAction === 'approve' ? 'aprobar' : 'rechazar'}{' '}
                      este documento?
                    </p>
                    <div className='mb-3'>
                      <label className='form-label'>Comentario *</label>
                      <textarea
                        className='form-control'
                        rows={3}
                        placeholder={`Razón para ${approvalAction === 'approve' ? 'aprobar' : 'rechazar'} el documento...`}
                        value={approvalComment}
                        onChange={e => setApprovalComment(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  <div className='modal-footer'>
                    <button
                      type='button'
                      className='btn btn-secondary'
                      onClick={() => setApprovalAction(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      type='button'
                      className={`btn ${approvalAction === 'approve' ? 'btn-success' : 'btn-warning'}`}
                      onClick={() => handleApproval(approvalAction)}
                      disabled={!approvalComment.trim()}
                    >
                      {approvalAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
