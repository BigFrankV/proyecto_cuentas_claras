import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useDocumentosCompra } from '@/hooks/useDocumentosCompra';
import { documentosCompraService, DocumentoCompra } from '@/lib/documentosCompraService';

interface DocumentosCompraListadoProps {}

export default function DocumentosCompraListado({}: DocumentosCompraListadoProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Hook de documentos de compra
  const {
    documentos,
    loading,
    error,
    estadisticas,
    fetchDocumentos,
    deleteDocumento,
    cambiarEstado,
    fetchEstadisticas,
    clearError
  } = useDocumentosCompra(user?.comunidad_id || 0);

  // Helper para verificar roles del usuario
  const isUserRole = (role: string): boolean => {
    if (role === 'superadmin') return user?.is_superadmin || false;
    return user?.roles?.includes(role) || false;
  };

  useEffect(() => {
    if (user?.comunidad_id) {
      fetchDocumentos();
      fetchEstadisticas();
    }
  }, [user?.comunidad_id]);

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const matchesSearch = doc.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.proveedor?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.glosa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !filterTipo || doc.tipo_doc === filterTipo;
    const matchesEstado = !filterEstado || doc.estado === filterEstado;
    const matchesProveedor = !filterProveedor || doc.proveedor_id.toString() === filterProveedor;
    const matchesDateFrom = !dateFrom || doc.fecha_emision >= dateFrom;
    const matchesDateTo = !dateTo || doc.fecha_emision <= dateTo;
    
    return matchesSearch && matchesTipo && matchesEstado && matchesProveedor && matchesDateFrom && matchesDateTo;
  });

  // Obtener proveedores únicos para el filtro
  const proveedores = [...new Map(
    documentos
      .filter(d => d.proveedor)
      .map(d => [d.proveedor!.id, d.proveedor!])
  ).values()];

  const handleDelete = async (id: number, folio: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el documento "${folio}"?`)) {
      try {
        await deleteDocumento(id);
      } catch (error) {
        // El error ya se maneja en el hook
      }
    }
  };

  const handleChangeStatus = async (id: number, estado: DocumentoCompra['estado']) => {
    try {
      await cambiarEstado(id, estado);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const formatCurrency = (amount: number) => {
    return documentosCompraService.formatCurrency(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getEstadoBadgeClass = (estado: string) => {
    const classes = {
      borrador: 'bg-secondary',
      ingresado: 'bg-primary',
      aprobado: 'bg-success',
      pagado: 'bg-info',
      anulado: 'bg-danger'
    };
    return `badge ${classes[estado as keyof typeof classes] || 'bg-secondary'}`;
  };

  const getTipoBadgeClass = (tipo: string) => {
    const classes = {
      factura: 'bg-primary',
      boleta: 'bg-info',
      nota_credito: 'bg-warning',
      nota_debito: 'bg-danger'
    };
    return `badge ${classes[tipo as keyof typeof classes] || 'bg-secondary'}`;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Documentos de Compra — Cuentas Claras</title>
      </Head>

      <Layout title='Documentos de Compra'>
        <div className='container-fluid p-4'>
          {/* Estadísticas */}
          {estadisticas && (
            <div className='row mb-4'>
              <div className='col-md-3 col-sm-6 mb-3'>
                <div className='card stat-card'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='stat-icon bg-primary text-white me-3'>
                        <span className='material-icons'>receipt</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.total}</h5>
                        <small className='text-muted'>Total Documentos</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='col-md-3 col-sm-6 mb-3'>
                <div className='card stat-card'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='stat-icon bg-warning text-white me-3'>
                        <span className='material-icons'>pending</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.por_estado.ingresado + estadisticas.por_estado.aprobado}</h5>
                        <small className='text-muted'>Pendientes</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-md-3 col-sm-6 mb-3'>
                <div className='card stat-card'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='stat-icon bg-success text-white me-3'>
                        <span className='material-icons'>paid</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{formatCurrency(estadisticas.monto_total)}</h5>
                        <small className='text-muted'>Monto Total</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='col-md-3 col-sm-6 mb-3'>
                <div className='card stat-card'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='stat-icon bg-info text-white me-3'>
                        <span className='material-icons'>schedule</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{formatCurrency(estadisticas.monto_pendiente)}</h5>
                        <small className='text-muted'>Monto Pendiente</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header y controles */}
          <div className='row mb-4'>
            <div className='col-12'>
              <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3'>
                <div>
                  <h1 className='h3 mb-0'>Documentos de Compra</h1>
                  <p className='text-muted mb-0'>Gestión de facturas, boletas y documentos de compra</p>
                </div>

                <div className='d-flex gap-2'>
                  {(isUserRole('superadmin') || isUserRole('admin')) && (
                    <Link href='/documentos-compra/nuevo' className='btn btn-primary'>
                      <span className='material-icons me-2'>add</span>
                      Nuevo Documento
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className='card mb-4'>
            <div className='card-body'>
              <div className='row g-3'>
                <div className='col-md-4'>
                  <div className='input-group'>
                    <span className='input-group-text'>
                      <span className='material-icons'>search</span>
                    </span>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar documentos...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='col-md-2'>
                  <select
                    className='form-select'
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                  >
                    <option value=''>Todos los tipos</option>
                    <option value='factura'>Facturas</option>
                    <option value='boleta'>Boletas</option>
                    <option value='nota_credito'>Notas de Crédito</option>
                    <option value='nota_debito'>Notas de Débito</option>
                  </select>
                </div>

                <div className='col-md-2'>
                  <select
                    className='form-select'
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <option value=''>Todos los estados</option>
                    <option value='borrador'>Borrador</option>
                    <option value='ingresado'>Ingresado</option>
                    <option value='aprobado'>Aprobado</option>
                    <option value='pagado'>Pagado</option>
                    <option value='anulado'>Anulado</option>
                  </select>
                </div>

                <div className='col-md-2'>
                  <select
                    className='form-select'
                    value={filterProveedor}
                    onChange={(e) => setFilterProveedor(e.target.value)}
                  >
                    <option value=''>Todos los proveedores</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.razon_social}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='col-md-2'>
                  <div className='d-flex gap-2'>
                    <button
                      className='btn btn-outline-secondary'
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <span className='material-icons'>filter_alt</span>
                    </button>
                    
                    <div className='btn-group view-switch' role='group'>
                      <button
                        type='button'
                        className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                      >
                        <span className='material-icons'>table_rows</span>
                      </button>
                      <button
                        type='button'
                        className={`btn btn-outline-secondary ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                      >
                        <span className='material-icons'>view_module</span>
                      </button>
                    </div>
                    
                    <button className='btn btn-outline-secondary'>
                      <span className='material-icons'>file_download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filtros avanzados */}
              {showFilters && (
                <div className='row g-3 mt-2 pt-3 border-top'>
                  <div className='col-md-3'>
                    <label className='form-label small'>Fecha desde</label>
                    <input
                      type='date'
                      className='form-control'
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label small'>Fecha hasta</label>
                    <input
                      type='date'
                      className='form-control'
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alertas de error */}
          {error && (
            <div className='alert alert-danger alert-dismissible fade show' role='alert'>
              <span className='material-icons me-2'>error</span>
              {error}
              <button 
                type='button' 
                className='btn-close' 
                onClick={clearError}
                aria-label='Close'
              ></button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className='text-center py-4'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando documentos de compra...</p>
            </div>
          )}

          {/* Vista de tabla */}
          {!loading && viewMode === 'table' && (
            <div className='card'>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover align-middle mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th scope='col' className='ps-3'>Documento</th>
                        <th scope='col'>Proveedor</th>
                        <th scope='col'>Fecha</th>
                        <th scope='col'>Tipo</th>
                        <th scope='col'>Monto</th>
                        <th scope='col'>Estado</th>
                        <th scope='col' className='text-end pe-3'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documentosFiltrados.map((documento) => (
                        <tr key={documento.id}>
                          <td className='ps-3'>
                            <div className='d-flex align-items-center'>
                              <div className='document-icon me-3'>
                                <span className='material-icons'>description</span>
                              </div>
                              <div>
                                <div className='fw-medium'>{documento.folio}</div>
                                {documento.glosa && (
                                  <small className='text-muted text-truncate d-block' style={{maxWidth: '200px'}}>
                                    {documento.glosa}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            {documento.proveedor ? (
                              <div>
                                <div className='fw-medium'>{documento.proveedor.razon_social}</div>
                                <small className='text-muted font-monospace'>{documento.proveedor.rut}-{documento.proveedor.dv}</small>
                              </div>
                            ) : (
                              <span className='text-muted'>Sin proveedor</span>
                            )}
                          </td>
                          
                          <td>
                            <div>
                              <div>{formatDate(documento.fecha_emision)}</div>
                              {documento.fecha_vencimiento && (
                                <small className='text-muted'>Vence: {formatDate(documento.fecha_vencimiento)}</small>
                              )}
                            </div>
                          </td>
                          
                          <td>
                            <span className={getTipoBadgeClass(documento.tipo_doc)}>
                              {documentosCompraService.getTipoDocumentoLabel(documento.tipo_doc)}
                            </span>
                          </td>
                          
                          <td>
                            <div className='text-end'>
                              <div className='fw-bold'>{formatCurrency(documento.total)}</div>
                              {documento.neto > 0 && (
                                <small className='text-muted'>Neto: {formatCurrency(documento.neto)}</small>
                              )}
                            </div>
                          </td>
                          
                          <td>
                            <span className={getEstadoBadgeClass(documento.estado)}>
                              {documentosCompraService.getEstadoLabel(documento.estado)}
                            </span>
                          </td>
                          
                          <td className='text-end pe-3'>
                            <div className='btn-group' role='group'>
                              <Link 
                                href={`/documentos-compra/${documento.id}`}
                                className='btn btn-sm btn-outline-primary'
                              >
                                <span className='material-icons small'>visibility</span>
                              </Link>
                              
                              {documento.estado !== 'pagado' && documento.estado !== 'anulado' && (
                                <Link 
                                  href={`/documentos-compra/${documento.id}/editar`}
                                  className='btn btn-sm btn-outline-secondary'
                                >
                                  <span className='material-icons small'>edit</span>
                                </Link>
                              )}
                              
                              {documento.estado === 'aprobado' && !user?.roles?.includes('contador') && (
                                <button
                                  className='btn btn-sm btn-outline-success'
                                  onClick={() => handleChangeStatus(documento.id, 'pagado')}
                                  title='Marcar como pagado'
                                >
                                  <span className='material-icons small'>paid</span>
                                </button>
                              )}
                              
                              {(user?.is_superadmin || user?.roles?.includes('admin')) && (
                                <button
                                  className='btn btn-sm btn-outline-danger'
                                  onClick={() => handleDelete(documento.id, documento.folio)}
                                  title='Eliminar documento'
                                >
                                  <span className='material-icons small'>delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {documentosFiltrados.length === 0 && (
                    <div className='text-center py-5'>
                      <span className='material-icons text-muted mb-2' style={{fontSize: '3rem'}}>
                        receipt_off
                      </span>
                      <p className='text-muted'>No se encontraron documentos de compra</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {!loading && viewMode === 'cards' && (
            <div className='row'>
              {documentosFiltrados.map((documento) => (
                <div key={documento.id} className='col-lg-4 col-md-6 mb-4'>
                  <div className='card document-card h-100'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div className='d-flex align-items-center'>
                          <div className='document-icon me-3'>
                            <span className='material-icons'>description</span>
                          </div>
                          <div>
                            <h6 className='card-title mb-1'>{documento.folio}</h6>
                            <span className={getTipoBadgeClass(documento.tipo_doc)}>
                              {documentosCompraService.getTipoDocumentoLabel(documento.tipo_doc)}
                            </span>
                          </div>
                        </div>
                        <span className={getEstadoBadgeClass(documento.estado)}>
                          {documentosCompraService.getEstadoLabel(documento.estado)}
                        </span>
                      </div>

                      {documento.proveedor && (
                        <div className='mb-3'>
                          <small className='text-muted'>Proveedor</small>
                          <div className='fw-medium'>{documento.proveedor.razon_social}</div>
                          <small className='text-muted font-monospace'>{documento.proveedor.rut}-{documento.proveedor.dv}</small>
                        </div>
                      )}

                      {documento.glosa && (
                        <p className='card-text text-muted small mb-3'>{documento.glosa}</p>
                      )}

                      <div className='row g-2 mb-3'>
                        <div className='col-6'>
                          <small className='text-muted'>Fecha emisión</small>
                          <div className='small'>{formatDate(documento.fecha_emision)}</div>
                        </div>
                        {documento.fecha_vencimiento && (
                          <div className='col-6'>
                            <small className='text-muted'>Vencimiento</small>
                            <div className='small'>{formatDate(documento.fecha_vencimiento)}</div>
                          </div>
                        )}
                      </div>

                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <div>
                          <small className='text-muted'>Total</small>
                          <div className='h6 mb-0'>{formatCurrency(documento.total)}</div>
                        </div>
                        {documento.archivo_url && (
                          <span className='badge bg-info'>
                            <span className='material-icons small me-1'>attach_file</span>
                            Archivo
                          </span>
                        )}
                      </div>

                      <div className='d-flex gap-2'>
                        <Link 
                          href={`/documentos-compra/${documento.id}`}
                          className='btn btn-sm btn-outline-primary flex-fill'
                        >
                          <span className='material-icons small me-1'>visibility</span>
                          Ver
                        </Link>
                        
                        {documento.estado !== 'pagado' && documento.estado !== 'anulado' && (
                          <Link 
                            href={`/documentos-compra/${documento.id}/editar`}
                            className='btn btn-sm btn-outline-secondary'
                          >
                            <span className='material-icons small'>edit</span>
                          </Link>
                        )}
                        
                        {documento.estado === 'aprobado' && !isUserRole('contador') && (
                          <button
                            className='btn btn-sm btn-outline-success'
                            onClick={() => handleChangeStatus(documento.id, 'pagado')}
                          >
                            <span className='material-icons small'>paid</span>
                          </button>
                        )}
                        
                        {(user?.is_superadmin || user?.roles?.includes('admin')) && (
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => handleDelete(documento.id, documento.folio)}
                            title='Eliminar documento'
                          >
                            <span className='material-icons small'>delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {documentosFiltrados.length === 0 && (
                <div className='col-12'>
                  <div className='text-center py-5'>
                    <span className='material-icons text-muted mb-2' style={{fontSize: '3rem'}}>
                      receipt_off
                    </span>
                    <p className='text-muted'>No se encontraron documentos de compra</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>

      <style jsx>{`
        .stat-card {
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .document-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background-color: #f8f9fa;
          border: 2px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }
        
        .view-switch .btn {
          padding: 0.25rem 0.5rem;
        }
        
        .document-card {
          border: 1px solid #dee2e6;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .document-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </ProtectedRoute>
  );
}