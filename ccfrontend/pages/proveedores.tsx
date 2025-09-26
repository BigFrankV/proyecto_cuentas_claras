import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useProveedores } from '@/hooks/useProveedores';
import { proveedoresService, Proveedor } from '@/lib/proveedoresService';

interface ProveedoresListadoProps {}

export default function ProveedoresListado({}: ProveedoresListadoProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Hook de proveedores
  const {
    proveedores,
    loading,
    error,
    estadisticas,
    fetchProveedores,
    deleteProveedor,
    cambiarEstado,
    fetchEstadisticas,
    clearError
  } = useProveedores(user?.comunidad_id || 0);

  // Helper para verificar roles del usuario
  const isUserRole = (role: string): boolean => {
    if (role === 'superadmin') return user?.is_superadmin || false;
    return user?.roles?.includes(role) || false;
  };

  useEffect(() => {
    if (user?.comunidad_id) {
      fetchProveedores();
      fetchEstadisticas();
    }
  }, [user?.comunidad_id]);

  // Filtrar proveedores
  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const matchesSearch = proveedor.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proveedor.rut.includes(searchTerm) ||
                         proveedor.giro?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !filterCategoria || 
                           (proveedor.categorias && proveedor.categorias.includes(filterCategoria));
    
    const matchesEstado = filterEstado === 'todos' ||
                         (filterEstado === 'activos' && proveedor.activo) ||
                         (filterEstado === 'inactivos' && !proveedor.activo);
    
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  // Obtener categorías únicas para el filtro
  const categorias = [...new Set(
    proveedores.flatMap(p => p.categorias || [])
  )].filter(Boolean);

  const handleDelete = async (id: number, razonSocial: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el proveedor "${razonSocial}"?`)) {
      try {
        await deleteProveedor(id);
      } catch (error) {
        // El error ya se maneja en el hook
      }
    }
  };

  const handleToggleEstado = async (id: number, estadoActual: boolean) => {
    try {
      await cambiarEstado(id, !estadoActual);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const formatRut = (rut: string, dv: string) => {
    return proveedoresService.formatRut(rut, dv);
  };

  const getCalificacionStars = (calificacion?: number) => {
    if (!calificacion) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`material-icons small ${i <= calificacion ? 'text-warning' : 'text-muted'}`}>
          star
        </span>
      );
    }
    return stars;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Proveedores — Cuentas Claras</title>
      </Head>

      <Layout title='Proveedores'>
        <div className='container-fluid p-4'>
          {/* Estadísticas */}
          {estadisticas && (
            <div className='row mb-4'>
              <div className='col-md-3 col-sm-6 mb-3'>
                <div className='card stat-card'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='stat-icon bg-primary text-white me-3'>
                        <span className='material-icons'>store</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.total}</h5>
                        <small className='text-muted'>Total Proveedores</small>
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
                        <span className='material-icons'>check_circle</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.activos}</h5>
                        <small className='text-muted'>Activos</small>
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
                        <span className='material-icons'>new_releases</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.nuevos_mes}</h5>
                        <small className='text-muted'>Nuevos este mes</small>
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
                        <span className='material-icons'>star</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.calificacion_promedio?.toFixed(1) || 'N/A'}</h5>
                        <small className='text-muted'>Calificación Promedio</small>
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
                  <h1 className='h3 mb-0'>Proveedores</h1>
                  <p className='text-muted mb-0'>Gestión de proveedores de la comunidad</p>
                </div>

                <div className='d-flex gap-2'>
                  {(isUserRole('superadmin') || isUserRole('admin')) && (
                    <Link href='/proveedores/nuevo' className='btn btn-primary'>
                      <span className='material-icons me-2'>add</span>
                      Nuevo Proveedor
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
                      placeholder='Buscar proveedores...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='col-md-2'>
                  <select
                    className='form-select'
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <option value='todos'>Todos</option>
                    <option value='activos'>Activos</option>
                    <option value='inactivos'>Inactivos</option>
                  </select>
                </div>

                <div className='col-md-3'>
                  <select
                    className='form-select'
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                  >
                    <option value=''>Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div className='col-md-3'>
                  <div className='d-flex justify-content-end gap-2'>
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
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
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
              <p className='mt-2 text-muted'>Cargando proveedores...</p>
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
                        <th scope='col' className='ps-3'>Proveedor</th>
                        <th scope='col'>RUT</th>
                        <th scope='col'>Contacto</th>
                        <th scope='col'>Categoría</th>
                        <th scope='col'>Calificación</th>
                        <th scope='col'>Estado</th>
                        <th scope='col' className='text-end pe-3'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedoresFiltrados.map((proveedor) => (
                        <tr key={proveedor.id}>
                          <td className='ps-3'>
                            <div className='d-flex align-items-center'>
                              <div className='provider-icon me-3'>
                                <span className='material-icons'>store</span>
                              </div>
                              <div>
                                <div className='fw-medium'>{proveedor.razon_social}</div>
                                {proveedor.giro && (
                                  <small className='text-muted'>{proveedor.giro}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            <span className='font-monospace'>{formatRut(proveedor.rut, proveedor.dv)}</span>
                          </td>
                          
                          <td>
                            <div>
                              {proveedor.email && (
                                <div className='small'>
                                  <span className='material-icons small me-1'>email</span>
                                  {proveedor.email}
                                </div>
                              )}
                              {proveedor.telefono && (
                                <div className='small'>
                                  <span className='material-icons small me-1'>phone</span>
                                  {proveedor.telefono}
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td>
                            {proveedor.categorias && proveedor.categorias.length > 0 && (
                              <div>
                                {proveedor.categorias.slice(0, 2).map(categoria => (
                                  <span key={categoria} className='badge bg-light text-dark me-1 mb-1'>
                                    {categoria}
                                  </span>
                                ))}
                                {proveedor.categorias.length > 2 && (
                                  <span className='badge bg-secondary'>+{proveedor.categorias.length - 2}</span>
                                )}
                              </div>
                            )}
                          </td>
                          
                          <td>
                            <div className='d-flex align-items-center'>
                              {getCalificacionStars(proveedor.calificacion)}
                              {proveedor.calificacion && (
                                <span className='ms-1 small text-muted'>({proveedor.calificacion})</span>
                              )}
                            </div>
                          </td>
                          
                          <td>
                            <span className={`badge ${proveedor.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {proveedor.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          
                          <td className='text-end pe-3'>
                            <div className='btn-group' role='group'>
                              <Link 
                                href={`/proveedores/${proveedor.id}`}
                                className='btn btn-sm btn-outline-primary'
                              >
                                <span className='material-icons small'>visibility</span>
                              </Link>
                              
                              <Link 
                                href={`/proveedores/${proveedor.id}/editar`}
                                className='btn btn-sm btn-outline-secondary'
                              >
                                <span className='material-icons small'>edit</span>
                              </Link>
                              
                              <button
                                className={`btn btn-sm ${proveedor.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => handleToggleEstado(proveedor.id, proveedor.activo)}
                                title={proveedor.activo ? 'Desactivar' : 'Activar'}
                              >
                                <span className='material-icons small'>
                                  {proveedor.activo ? 'pause' : 'play_arrow'}
                                </span>
                              </button>
                              
                              {(isUserRole('superadmin') || isUserRole('admin')) && (
                                <button
                                  className='btn btn-sm btn-outline-danger'
                                  onClick={() => handleDelete(proveedor.id, proveedor.razon_social)}
                                  title='Eliminar proveedor'
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
                  
                  {proveedoresFiltrados.length === 0 && (
                    <div className='text-center py-5'>
                      <span className='material-icons text-muted mb-2' style={{fontSize: '3rem'}}>
                        store_off
                      </span>
                      <p className='text-muted'>No se encontraron proveedores</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {!loading && viewMode === 'cards' && (
            <div className='row'>
              {proveedoresFiltrados.map((proveedor) => (
                <div key={proveedor.id} className='col-lg-4 col-md-6 mb-4'>
                  <div className='card provider-card h-100'>
                    <div className='card-body'>
                      <div className='d-flex align-items-center mb-3'>
                        <div className='provider-icon me-3'>
                          <span className='material-icons'>store</span>
                        </div>
                        <div className='flex-grow-1'>
                          <h6 className='card-title mb-1'>{proveedor.razon_social}</h6>
                          <span className='font-monospace small text-muted'>
                            {formatRut(proveedor.rut, proveedor.dv)}
                          </span>
                        </div>
                        <span className={`badge ${proveedor.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {proveedor.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {proveedor.giro && (
                        <p className='card-text text-muted small mb-3'>{proveedor.giro}</p>
                      )}

                      <div className='mb-3'>
                        {proveedor.email && (
                          <div className='d-flex align-items-center mb-1 small'>
                            <span className='material-icons small me-2'>email</span>
                            <span className='text-truncate'>{proveedor.email}</span>
                          </div>
                        )}
                        {proveedor.telefono && (
                          <div className='d-flex align-items-center small'>
                            <span className='material-icons small me-2'>phone</span>
                            <span>{proveedor.telefono}</span>
                          </div>
                        )}
                      </div>

                      {proveedor.categorias && proveedor.categorias.length > 0 && (
                        <div className='mb-3'>
                          {proveedor.categorias.slice(0, 3).map(categoria => (
                            <span key={categoria} className='badge bg-light text-dark me-1 mb-1'>
                              {categoria}
                            </span>
                          ))}
                          {proveedor.categorias.length > 3 && (
                            <span className='badge bg-secondary'>+{proveedor.categorias.length - 3}</span>
                          )}
                        </div>
                      )}

                      {proveedor.calificacion && (
                        <div className='d-flex align-items-center mb-3'>
                          <span className='me-2 small'>Calificación:</span>
                          {getCalificacionStars(proveedor.calificacion)}
                          <span className='ms-1 small text-muted'>({proveedor.calificacion})</span>
                        </div>
                      )}

                      <div className='d-flex gap-2'>
                        <Link 
                          href={`/proveedores/${proveedor.id}`}
                          className='btn btn-sm btn-outline-primary flex-fill'
                        >
                          <span className='material-icons small me-1'>visibility</span>
                          Ver
                        </Link>
                        
                        <Link 
                          href={`/proveedores/${proveedor.id}/editar`}
                          className='btn btn-sm btn-outline-secondary'
                        >
                          <span className='material-icons small'>edit</span>
                        </Link>
                        
                        <button
                          className={`btn btn-sm ${proveedor.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleEstado(proveedor.id, proveedor.activo)}
                        >
                          <span className='material-icons small'>
                            {proveedor.activo ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        
                        {(isUserRole('superadmin') || isUserRole('admin')) && (
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => handleDelete(proveedor.id, proveedor.razon_social)}
                            title='Eliminar proveedor'
                          >
                            <span className='material-icons small'>delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {proveedoresFiltrados.length === 0 && (
                <div className='col-12'>
                  <div className='text-center py-5'>
                    <span className='material-icons text-muted mb-2' style={{fontSize: '3rem'}}>
                      store_off
                    </span>
                    <p className='text-muted'>No se encontraron proveedores</p>
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
        
        .provider-icon {
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
        
        .provider-card {
          border: 1px solid #dee2e6;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .provider-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </ProtectedRoute>
  );
}
