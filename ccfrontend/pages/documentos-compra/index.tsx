import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { StatusBadge, TypeBadge, FileIcon } from '@/components/documentos';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface PurchaseDocument {
  id: string;
  number: string;
  type: 'invoice' | 'receipt' | 'quote' | 'order';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
  provider: {
    id: string;
    name: string;
    rut: string;
  };
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  attachments: number;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export default function DocumentosCompraListado() {
  const router = useRouter();
  const [documents, setDocuments] = useState<PurchaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Mock data
  useEffect(() => {
    const mockDocuments: PurchaseDocument[] = [
      {
        id: '1',
        number: 'FC-2024-001',
        type: 'invoice',
        status: 'pending',
        provider: {
          id: '1',
          name: 'Empresa de Servicios ABC',
          rut: '12.345.678-9',
        },
        description: 'Mantenimiento ascensores enero 2024',
        amount: 850000,
        date: '2024-01-15',
        dueDate: '2024-02-15',
        attachments: 2,
        createdBy: 'Admin',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        number: 'BL-2024-002',
        type: 'receipt',
        status: 'approved',
        provider: {
          id: '2',
          name: 'Ferretería El Constructor',
          rut: '98.765.432-1',
        },
        description: 'Materiales de construcción para reparaciones',
        amount: 125000,
        date: '2024-01-20',
        attachments: 1,
        createdBy: 'Conserje',
        createdAt: '2024-01-20T14:45:00Z',
        approvedBy: 'Admin',
        approvedAt: '2024-01-21T09:15:00Z',
      },
      {
        id: '3',
        number: 'CT-2024-003',
        type: 'quote',
        status: 'draft',
        provider: {
          id: '3',
          name: 'Pinturas y Acabados Ltda.',
          rut: '55.444.333-2',
        },
        description: 'Cotización pintura fachada edificio',
        amount: 2500000,
        date: '2024-01-25',
        attachments: 3,
        createdBy: 'Admin',
        createdAt: '2024-01-25T16:20:00Z',
      },
      {
        id: '4',
        number: 'OR-2024-004',
        type: 'order',
        status: 'paid',
        provider: {
          id: '4',
          name: 'Suministros Industriales SA',
          rut: '11.222.333-4',
        },
        description: 'Repuestos bomba de agua',
        amount: 75000,
        date: '2024-01-10',
        dueDate: '2024-01-25',
        attachments: 1,
        createdBy: 'Técnico',
        createdAt: '2024-01-10T08:00:00Z',
        approvedBy: 'Admin',
        approvedAt: '2024-01-11T10:30:00Z',
      },
      {
        id: '5',
        number: 'FC-2024-005',
        type: 'invoice',
        status: 'rejected',
        provider: {
          id: '5',
          name: 'Servicios Generales XYZ',
          rut: '77.888.999-0',
        },
        description: 'Factura con errores en montos',
        amount: 450000,
        date: '2024-01-30',
        dueDate: '2024-02-28',
        attachments: 2,
        createdBy: 'Admin',
        createdAt: '2024-01-30T11:00:00Z',
      },
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 800);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesStatus =
      selectedStatus === 'all' || doc.status === selectedStatus;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const docDate = new Date(doc.date);
      if (dateFrom) {
        matchesDate = matchesDate && docDate >= new Date(dateFrom);
      }
      if (dateTo) {
        matchesDate = matchesDate && docDate <= new Date(dateTo);
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleDocumentAction = (action: string, id: string) => {
    const document = documents.find(d => d.id === id);
    if (!document) {
      return;
    }

    switch (action) {
      case 'view':
        router.push(`/documentos-compra/${id}`);
        break;
      case 'edit':
        router.push(`/documentos-compra/${id}/editar`);
        break;
      case 'approve':
        if (confirm('¿Estás seguro de que deseas aprobar este documento?')) {
          setDocuments(prev =>
            prev.map(doc =>
              doc.id === id
                ? {
                    ...doc,
                    status: 'approved',
                    approvedBy: 'Usuario Actual',
                    approvedAt: new Date().toISOString(),
                  }
                : doc
            )
          );
          alert('Documento aprobado exitosamente');
        }
        break;
      case 'reject':
        if (confirm('¿Estás seguro de que deseas rechazar este documento?')) {
          setDocuments(prev =>
            prev.map(doc =>
              doc.id === id ? { ...doc, status: 'rejected' } : doc
            )
          );
          alert('Documento rechazado');
        }
        break;
      case 'pay':
        if (confirm('¿Marcar este documento como pagado?')) {
          setDocuments(prev =>
            prev.map(doc => (doc.id === id ? { ...doc, status: 'paid' } : doc))
          );
          alert('Documento marcado como pagado');
        }
        break;
      case 'delete':
        if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
          setDocuments(prev => prev.filter(doc => doc.id !== id));
          alert('Documento eliminado exitosamente');
        }
        break;
    }
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedDocuments.length === 0) {
      alert('Selecciona al menos un documento');
      return;
    }

    switch (action) {
      case 'approve':
        if (
          confirm(
            `¿Aprobar ${selectedDocuments.length} documentos seleccionados?`
          )
        ) {
          setDocuments(prev =>
            prev.map(doc =>
              selectedDocuments.includes(doc.id) && doc.status === 'pending'
                ? {
                    ...doc,
                    status: 'approved',
                    approvedBy: 'Usuario Actual',
                    approvedAt: new Date().toISOString(),
                  }
                : doc
            )
          );
          setSelectedDocuments([]);
          alert('Documentos aprobados exitosamente');
        }
        break;
      case 'export':
        alert(`Exportando ${selectedDocuments.length} documentos`);
        break;
      case 'delete':
        if (
          confirm(
            `¿Eliminar ${selectedDocuments.length} documentos seleccionados?`
          )
        ) {
          setDocuments(prev =>
            prev.filter(doc => !selectedDocuments.includes(doc.id))
          );
          setSelectedDocuments([]);
          alert('Documentos eliminados exitosamente');
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const getDocumentTypeStats = () => {
    return {
      invoice: documents.filter(d => d.type === 'invoice').length,
      receipt: documents.filter(d => d.type === 'receipt').length,
      quote: documents.filter(d => d.type === 'quote').length,
      order: documents.filter(d => d.type === 'order').length,
    };
  };

  const getDocumentStatusStats = () => {
    return {
      draft: documents.filter(d => d.status === 'draft').length,
      pending: documents.filter(d => d.status === 'pending').length,
      approved: documents.filter(d => d.status === 'approved').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
      paid: documents.filter(d => d.status === 'paid').length,
    };
  };

  const typeStats = getDocumentTypeStats();
  const statusStats = getDocumentStatusStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Documentos de Compra'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>
                Cargando documentos de compra...
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Documentos de Compra — Cuentas Claras</title>
      </Head>

      <Layout title='Documentos de Compra'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h3 mb-1'>Documentos de Compra</h1>
              <p className='text-muted mb-0'>
                Gestiona facturas, boletas, cotizaciones y órdenes de compra
              </p>
            </div>
            <div className='d-flex gap-2'>
              <Link href='/documentos' className='btn btn-outline-secondary'>
                <i className='material-icons me-2'>folder</i>
                Ver Documentos
              </Link>
              <Link href='/documentos-compra/nuevo' className='btn btn-primary'>
                <i className='material-icons me-2'>add</i>
                Nuevo Documento
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className='row g-3 mb-4'>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-primary text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>receipt_long</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {documents.length}
                    </div>
                    <div className='stats-label text-muted small'>
                      Total Documentos
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-warning text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>pending</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {statusStats.pending}
                    </div>
                    <div className='stats-label text-muted small'>
                      Pendientes
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-success text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>check_circle</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {statusStats.approved}
                    </div>
                    <div className='stats-label text-muted small'>
                      Aprobados
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card card border-0 shadow-sm h-100'>
                <div className='card-body d-flex align-items-center'>
                  <div className='stats-icon bg-info text-white rounded-3 p-3 me-3'>
                    <i className='material-icons'>payments</i>
                  </div>
                  <div>
                    <div className='stats-number h4 mb-0'>
                      {statusStats.paid}
                    </div>
                    <div className='stats-label text-muted small'>Pagados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            className={`filter-container card border-0 shadow-sm mb-4 ${showFilters ? 'open' : ''}`}
          >
            <div className='card-body'>
              <div className='filter-header d-flex justify-content-between align-items-center mb-3'>
                <h6 className='mb-0'>
                  <i className='material-icons me-2'>filter_list</i>
                  Filtros
                </h6>
                <button
                  className='btn btn-sm btn-outline-secondary'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {showFilters && (
                <div className='filter-body'>
                  <div className='row g-3'>
                    <div className='col-lg-3'>
                      <label className='form-label'>Buscar</label>
                      <div className='position-relative'>
                        <i className='material-icons position-absolute start-0 top-50 translate-middle-y ms-3 text-muted'>
                          search
                        </i>
                        <input
                          type='text'
                          className='form-control ps-5'
                          placeholder='Número, proveedor, descripción...'
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className='col-lg-2'>
                      <label className='form-label'>Tipo</label>
                      <select
                        className='form-select'
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                      >
                        <option value='all'>Todos los tipos</option>
                        <option value='invoice'>
                          Facturas ({typeStats.invoice})
                        </option>
                        <option value='receipt'>
                          Boletas ({typeStats.receipt})
                        </option>
                        <option value='quote'>
                          Cotizaciones ({typeStats.quote})
                        </option>
                        <option value='order'>
                          Órdenes ({typeStats.order})
                        </option>
                      </select>
                    </div>

                    <div className='col-lg-2'>
                      <label className='form-label'>Estado</label>
                      <select
                        className='form-select'
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                      >
                        <option value='all'>Todos los estados</option>
                        <option value='draft'>
                          Borrador ({statusStats.draft})
                        </option>
                        <option value='pending'>
                          Pendiente ({statusStats.pending})
                        </option>
                        <option value='approved'>
                          Aprobado ({statusStats.approved})
                        </option>
                        <option value='rejected'>
                          Rechazado ({statusStats.rejected})
                        </option>
                        <option value='paid'>
                          Pagado ({statusStats.paid})
                        </option>
                      </select>
                    </div>

                    <div className='col-lg-2'>
                      <label className='form-label'>Fecha desde</label>
                      <input
                        type='date'
                        className='form-control'
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                      />
                    </div>

                    <div className='col-lg-2'>
                      <label className='form-label'>Fecha hasta</label>
                      <input
                        type='date'
                        className='form-control'
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                      />
                    </div>

                    <div className='col-lg-1 d-flex align-items-end'>
                      <button
                        className='btn btn-outline-secondary w-100'
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedType('all');
                          setSelectedStatus('all');
                          setDateFrom('');
                          setDateTo('');
                        }}
                      >
                        <i className='material-icons'>clear</i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3 gap-3'>
            <div className='results-summary'>
              <strong>{filteredDocuments.length}</strong> documentos encontrados
              {searchTerm && (
                <span className='text-muted'> para "{searchTerm}"</span>
              )}
            </div>

            <div className='d-flex gap-2 align-items-center'>
              {/* Bulk actions */}
              {selectedDocuments.length > 0 && (
                <div className='bulk-actions d-flex gap-2 me-3'>
                  <span className='text-muted small'>
                    {selectedDocuments.length} seleccionados
                  </span>
                  <div className='btn-group'>
                    <button
                      className='btn btn-sm btn-outline-success'
                      onClick={() => handleBulkAction('approve')}
                    >
                      <i className='material-icons me-1'>check</i>
                      Aprobar
                    </button>
                    <button
                      className='btn btn-sm btn-outline-secondary'
                      onClick={() => handleBulkAction('export')}
                    >
                      <i className='material-icons me-1'>file_download</i>
                      Exportar
                    </button>
                    <button
                      className='btn btn-sm btn-outline-danger'
                      onClick={() => handleBulkAction('delete')}
                    >
                      <i className='material-icons me-1'>delete</i>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {/* View toggle */}
              <div className='view-toggle btn-group' role='group'>
                <button
                  type='button'
                  className={`btn btn-outline-secondary ${view === 'grid' ? 'active' : ''}`}
                  onClick={() => setView('grid')}
                >
                  <i className='material-icons'>grid_view</i>
                </button>
                <button
                  type='button'
                  className={`btn btn-outline-secondary ${view === 'table' ? 'active' : ''}`}
                  onClick={() => setView('table')}
                >
                  <i className='material-icons'>view_list</i>
                </button>
              </div>
            </div>
          </div>

          {/* Documents Grid View */}
          {view === 'grid' && (
            <div className='row g-3'>
              {filteredDocuments.map(document => (
                <div key={document.id} className='col-sm-6 col-lg-4 col-xl-3'>
                  <div className='doc-card card shadow-sm h-100'>
                    <div className='card-body'>
                      {/* Header */}
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div>
                          <h6 className='card-title mb-1'>{document.number}</h6>
                          <div className='d-flex gap-2 mb-2'>
                            <TypeBadge type={document.type} size='sm' />
                            <StatusBadge status={document.status} size='sm' />
                          </div>
                        </div>
                        <div className='dropdown'>
                          <button
                            className='btn btn-sm btn-outline-secondary dropdown-toggle'
                            type='button'
                            data-bs-toggle='dropdown'
                          >
                            <i className='material-icons'>more_vert</i>
                          </button>
                          <ul className='dropdown-menu dropdown-menu-end'>
                            <li>
                              <button
                                className='dropdown-item'
                                onClick={() =>
                                  handleDocumentAction('view', document.id)
                                }
                              >
                                <i className='material-icons me-2'>
                                  visibility
                                </i>
                                Ver detalle
                              </button>
                            </li>
                            <li>
                              <button
                                className='dropdown-item'
                                onClick={() =>
                                  handleDocumentAction('edit', document.id)
                                }
                              >
                                <i className='material-icons me-2'>edit</i>
                                Editar
                              </button>
                            </li>
                            {document.status === 'pending' && (
                              <>
                                <li>
                                  <hr className='dropdown-divider' />
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item text-success'
                                    onClick={() =>
                                      handleDocumentAction(
                                        'approve',
                                        document.id
                                      )
                                    }
                                  >
                                    <i className='material-icons me-2'>check</i>
                                    Aprobar
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item text-warning'
                                    onClick={() =>
                                      handleDocumentAction(
                                        'reject',
                                        document.id
                                      )
                                    }
                                  >
                                    <i className='material-icons me-2'>close</i>
                                    Rechazar
                                  </button>
                                </li>
                              </>
                            )}
                            {document.status === 'approved' && (
                              <>
                                <li>
                                  <hr className='dropdown-divider' />
                                </li>
                                <li>
                                  <button
                                    className='dropdown-item text-info'
                                    onClick={() =>
                                      handleDocumentAction('pay', document.id)
                                    }
                                  >
                                    <i className='material-icons me-2'>
                                      payments
                                    </i>
                                    Marcar como pagado
                                  </button>
                                </li>
                              </>
                            )}
                            <li>
                              <hr className='dropdown-divider' />
                            </li>
                            <li>
                              <button
                                className='dropdown-item text-danger'
                                onClick={() =>
                                  handleDocumentAction('delete', document.id)
                                }
                              >
                                <i className='material-icons me-2'>delete</i>
                                Eliminar
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Content */}
                      <div className='mb-3'>
                        <div className='fw-medium text-truncate mb-1'>
                          {document.provider.name}
                        </div>
                        <div className='text-muted small mb-2'>
                          {document.provider.rut}
                        </div>
                        <div className='text-muted small'>
                          {document.description}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className='doc-amount mb-3 text-primary'>
                        {formatCurrency(document.amount)}
                      </div>

                      {/* Meta */}
                      <div className='doc-meta'>
                        <div className='d-flex align-items-center mb-1'>
                          <i
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            calendar_today
                          </i>
                          <span className='small text-muted'>
                            {formatDate(document.date)}
                          </span>
                        </div>
                        {document.dueDate && (
                          <div className='d-flex align-items-center mb-1'>
                            <i
                              className='material-icons me-2 text-muted'
                              style={{ fontSize: '16px' }}
                            >
                              schedule
                            </i>
                            <span className='small text-muted'>
                              Vence: {formatDate(document.dueDate)}
                            </span>
                          </div>
                        )}
                        <div className='d-flex align-items-center'>
                          <i
                            className='material-icons me-2 text-muted'
                            style={{ fontSize: '16px' }}
                          >
                            attach_file
                          </i>
                          <span className='small text-muted'>
                            {document.attachments} archivo(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className='card-footer bg-transparent border-0 pt-0'>
                      <div className='d-flex gap-2'>
                        <button
                          className='btn btn-sm btn-outline-primary flex-fill'
                          onClick={() =>
                            handleDocumentAction('view', document.id)
                          }
                        >
                          <i
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            visibility
                          </i>
                          Ver
                        </button>
                        {document.status === 'pending' && (
                          <button
                            className='btn btn-sm btn-success'
                            onClick={() =>
                              handleDocumentAction('approve', document.id)
                            }
                          >
                            <i
                              className='material-icons'
                              style={{ fontSize: '16px' }}
                            >
                              check
                            </i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Table View */}
          {view === 'table' && (
            <div className='card border-0 shadow-sm'>
              <div className='table-responsive'>
                <table className='table table-hover document-table mb-0'>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type='checkbox'
                          className='form-check-input'
                          checked={
                            selectedDocuments.length ===
                              filteredDocuments.length &&
                            filteredDocuments.length > 0
                          }
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Número</th>
                      <th>Tipo</th>
                      <th>Proveedor</th>
                      <th>Descripción</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th style={{ width: '100px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(document => (
                      <tr key={document.id}>
                        <td>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            checked={selectedDocuments.includes(document.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedDocuments(prev => [
                                  ...prev,
                                  document.id,
                                ]);
                              } else {
                                setSelectedDocuments(prev =>
                                  prev.filter(id => id !== document.id)
                                );
                              }
                            }}
                          />
                        </td>
                        <td className='fw-medium'>{document.number}</td>
                        <td>
                          <TypeBadge type={document.type} size='sm' />
                        </td>
                        <td>
                          <div>
                            <div className='fw-medium'>
                              {document.provider.name}
                            </div>
                            <div className='text-muted small'>
                              {document.provider.rut}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div
                            className='text-truncate'
                            style={{ maxWidth: '200px' }}
                          >
                            {document.description}
                          </div>
                        </td>
                        <td className='fw-medium text-primary'>
                          {formatCurrency(document.amount)}
                        </td>
                        <td>
                          <StatusBadge status={document.status} size='sm' />
                        </td>
                        <td className='text-muted'>
                          {formatDate(document.date)}
                        </td>
                        <td>
                          <div className='dropdown'>
                            <button
                              className='btn btn-sm btn-outline-secondary dropdown-toggle'
                              type='button'
                              data-bs-toggle='dropdown'
                            >
                              <i className='material-icons'>more_vert</i>
                            </button>
                            <ul className='dropdown-menu dropdown-menu-end'>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleDocumentAction('view', document.id)
                                  }
                                >
                                  <i className='material-icons me-2'>
                                    visibility
                                  </i>
                                  Ver detalle
                                </button>
                              </li>
                              <li>
                                <button
                                  className='dropdown-item'
                                  onClick={() =>
                                    handleDocumentAction('edit', document.id)
                                  }
                                >
                                  <i className='material-icons me-2'>edit</i>
                                  Editar
                                </button>
                              </li>
                              {document.status === 'pending' && (
                                <>
                                  <li>
                                    <hr className='dropdown-divider' />
                                  </li>
                                  <li>
                                    <button
                                      className='dropdown-item text-success'
                                      onClick={() =>
                                        handleDocumentAction(
                                          'approve',
                                          document.id
                                        )
                                      }
                                    >
                                      <i className='material-icons me-2'>
                                        check
                                      </i>
                                      Aprobar
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className='dropdown-item text-warning'
                                      onClick={() =>
                                        handleDocumentAction(
                                          'reject',
                                          document.id
                                        )
                                      }
                                    >
                                      <i className='material-icons me-2'>
                                        close
                                      </i>
                                      Rechazar
                                    </button>
                                  </li>
                                </>
                              )}
                              {document.status === 'approved' && (
                                <>
                                  <li>
                                    <hr className='dropdown-divider' />
                                  </li>
                                  <li>
                                    <button
                                      className='dropdown-item text-info'
                                      onClick={() =>
                                        handleDocumentAction('pay', document.id)
                                      }
                                    >
                                      <i className='material-icons me-2'>
                                        payments
                                      </i>
                                      Marcar como pagado
                                    </button>
                                  </li>
                                </>
                              )}
                              <li>
                                <hr className='dropdown-divider' />
                              </li>
                              <li>
                                <button
                                  className='dropdown-item text-danger'
                                  onClick={() =>
                                    handleDocumentAction('delete', document.id)
                                  }
                                >
                                  <i className='material-icons me-2'>delete</i>
                                  Eliminar
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredDocuments.length === 0 && (
            <div className='text-center py-5'>
              <i
                className='material-icons mb-3 text-muted'
                style={{ fontSize: '4rem' }}
              >
                receipt_long
              </i>
              <h5 className='text-muted'>No se encontraron documentos</h5>
              <p className='text-muted'>
                {searchTerm
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Comienza creando tu primer documento de compra'}
              </p>
              {!searchTerm && (
                <Link
                  href='/documentos-compra/nuevo'
                  className='btn btn-primary'
                >
                  <i className='material-icons me-2'>add</i>
                  Nuevo Documento
                </Link>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
