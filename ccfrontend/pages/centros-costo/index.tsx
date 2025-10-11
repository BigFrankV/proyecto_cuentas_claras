import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useCentrosCosto } from '@/hooks/useCentrosCosto';
import { CentroCosto } from '@/lib/centrosCostoService';

interface CentrosCostoListadoProps {}

export default function CentrosCostoListado({}: CentrosCostoListadoProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('');

  // Hook de centros de costo
  const {
    centrosCosto,
    loading,
    error,
    estadisticas,
    fetchCentrosCosto,
    deleteCentroCosto,
    cambiarEstado,
    fetchEstadisticas,
    clearError
  } = useCentrosCosto(user?.comunidad_id || 0);

  // Helper para verificar roles del usuario
  const isUserRole = (role: string): boolean => {
    if (role === 'superadmin') return user?.is_superadmin || false;
    return user?.roles?.includes(role) || false;
  };

  useEffect(() => {
    if (user?.comunidad_id) {
      fetchCentrosCosto();
      fetchEstadisticas();
    }
  }, [user?.comunidad_id]);

  // Filtrar centros de costo
  const centrosCostoFiltrados = centrosCosto.filter(cc => {
    const matchesSearch = cc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartamento = !filterDepartamento || cc.departamento === filterDepartamento;
    
    return matchesSearch && matchesDepartamento;
  });

  // Obtener departamentos únicos para el filtro
  const departamentos = [...new Set(centrosCosto.map(cc => cc.departamento))].filter(Boolean);

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el centro de costo "${nombre}"?`)) {
      try {
        await deleteCentroCosto(id);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getUtilizacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return 'bg-danger';
    if (porcentaje >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const getDepartmentBadgeClass = (departamento: string) => {
    const classes: Record<string, string> = {
      'Mantenimiento': 'department-maintenance',
      'Operaciones': 'department-operations', 
      'Administración': 'department-admin',
      'Seguridad': 'department-security'
    };
    return `department-badge ${classes[departamento] || 'department-other'}`;
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Centros de Costo — Cuentas Claras</title>
      </Head>

      <Layout title='Centros de Costo'>
        <div className='container-fluid p-4'>
          {/* Estadísticas */}
          {estadisticas && (
            <div className='row mb-4'>
              <div className='col-md-3 col-sm-6 mb-3'>
                <div className='card stat-card'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='stat-icon bg-primary text-white me-3'>
                        <span className='material-icons'>account_balance_wallet</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{estadisticas.total}</h5>
                        <small className='text-muted'>Total Centros</small>
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
                        <span className='material-icons'>trending_up</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{formatCurrency(estadisticas.presupuesto_total)}</h5>
                        <small className='text-muted'>Presupuesto Total</small>
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
                        <span className='material-icons'>receipt</span>
                      </div>
                      <div>
                        <h5 className='mb-0'>{formatCurrency(estadisticas.gasto_total)}</h5>
                        <small className='text-muted'>Gasto Total</small>
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
                  <h1 className='h3 mb-0'>Centros de Costo</h1>
                  <p className='text-muted mb-0'>Gestión de centros de costo de la comunidad</p>
                </div>

                <div className='d-flex gap-2'>
                  {(isUserRole('superadmin') || isUserRole('admin')) && (
                    <Link href='/centros-costo/nuevo' className='btn btn-primary'>
                      <span className='material-icons me-2'>add</span>
                      Nuevo Centro
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
                      placeholder='Buscar centros de costo...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='col-md-3'>
                  <select
                    className='form-select'
                    value={filterDepartamento}
                    onChange={(e) => setFilterDepartamento(e.target.value)}
                  >
                    <option value=''>Todos los departamentos</option>
                    {departamentos.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div className='col-md-5'>
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
              <p className='mt-2 text-muted'>Cargando centros de costo...</p>
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
                        <th scope='col' className='ps-3'>Nombre</th>
                        <th scope='col'>Departamento</th>
                        <th scope='col'>Presupuesto</th>
                        <th scope='col'>Estado</th>
                        <th scope='col' className='text-end pe-3'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centrosCostoFiltrados.map((centroCosto) => (
                        <tr key={centroCosto.id}>
                          <td className='ps-3'>
                            <div className='d-flex align-items-center'>
                              <div className='center-icon me-2' style={{backgroundColor: '#4CAF50'}}>
                                <span className='material-icons'>account_balance_wallet</span>
                              </div>
                              <div>
                                <div className='fw-medium'>{centroCosto.nombre}</div>
                                {centroCosto.descripcion && (
                                  <small className='text-muted'>{centroCosto.descripcion}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td>
                            {centroCosto.departamento && (
                              <span className={getDepartmentBadgeClass(centroCosto.departamento)}>
                                {centroCosto.departamento}
                              </span>
                            )}
                          </td>
                          
                          <td>{formatCurrency(centroCosto.presupuesto || 0)}</td>
                          
                          <td>
                            <span className={`badge ${centroCosto.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {centroCosto.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          
                          <td className='text-end pe-3'>
                            <div className='btn-group' role='group'>
                              {(isUserRole('superadmin') || isUserRole('admin') || isUserRole('contador')) && (
                                <Link 
                                  href={`/centros-costo/${centroCosto.id}`}
                                  className='btn btn-sm btn-outline-primary'
                                  title='Editar centro de costo'
                                >
                                  <span className='material-icons small'>edit</span>
                                </Link>
                              )}
                              
                              {(isUserRole('superadmin') || isUserRole('admin')) && (
                                <button
                                  className={`btn btn-sm ${centroCosto.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => handleToggleEstado(centroCosto.id, centroCosto.activo)}
                                  title={centroCosto.activo ? 'Desactivar' : 'Activar'}
                                >
                                  <span className='material-icons small'>
                                    {centroCosto.activo ? 'pause' : 'play_arrow'}
                                  </span>
                                </button>
                              )}
                              
                              {(isUserRole('superadmin') || isUserRole('admin')) && (
                                <button
                                  className='btn btn-sm btn-outline-danger'
                                  onClick={() => handleDelete(centroCosto.id, centroCosto.nombre)}
                                  title='Eliminar centro de costo'
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
                  
                  {centrosCostoFiltrados.length === 0 && (
                    <div className='text-center py-5'>
                      <span className='material-icons text-muted mb-2' style={{fontSize: '3rem'}}>
                        search_off
                      </span>
                      <p className='text-muted'>No se encontraron centros de costo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {!loading && viewMode === 'cards' && (
            <div className='row'>
              {centrosCostoFiltrados.map((centroCosto) => (
                <div key={centroCosto.id} className='col-lg-4 col-md-6 mb-4'>
                  <div className='card cost-center-item h-100'>
                    <div className='card-body'>
                      <div className='d-flex align-items-center mb-3'>
                        <div className='center-icon me-3' style={{backgroundColor: '#4CAF50'}}>
                          <span className='material-icons'>account_balance_wallet</span>
                        </div>
                        <div className='flex-grow-1'>
                          <h6 className='card-title mb-1'>{centroCosto.nombre}</h6>
                          {centroCosto.departamento && (
                            <span className={getDepartmentBadgeClass(centroCosto.departamento)}>
                              {centroCosto.departamento}
                            </span>
                          )}
                        </div>
                      </div>

                      {centroCosto.descripcion && (
                        <p className='card-text text-muted small mb-3'>{centroCosto.descripcion}</p>
                      )}

                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <div>
                          <small className='text-muted'>Presupuesto</small>
                          <div className='fw-bold'>{formatCurrency(centroCosto.presupuesto || 0)}</div>
                        </div>
                        <span className={`badge ${centroCosto.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {centroCosto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className='d-flex gap-2'>
                        {(isUserRole('superadmin') || isUserRole('admin') || isUserRole('contador')) && (
                          <Link 
                            href={`/centros-costo/${centroCosto.id}`}
                            className='btn btn-sm btn-outline-primary flex-fill'
                          >
                            <span className='material-icons small me-1'>edit</span>
                            Editar
                          </Link>
                        )}
                        
                        {(isUserRole('superadmin') || isUserRole('admin')) && (
                          <button
                            className={`btn btn-sm ${centroCosto.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleEstado(centroCosto.id, centroCosto.activo)}
                          >
                            <span className='material-icons small'>
                              {centroCosto.activo ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                        )}
                        
                        {(isUserRole('superadmin') || isUserRole('admin')) && (
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => handleDelete(centroCosto.id, centroCosto.nombre)}
                            title='Eliminar centro de costo'
                          >
                            <span className='material-icons small'>delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {centrosCostoFiltrados.length === 0 && (
                <div className='col-12'>
                  <div className='text-center py-5'>
                    <span className='material-icons text-muted mb-2' style={{fontSize: '3rem'}}>
                      search_off
                    </span>
                    <p className='text-muted'>No se encontraron centros de costo</p>
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
        
        .center-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .view-switch .btn {
          padding: 0.25rem 0.5rem;
        }
        
        .cost-center-item {
          border: 1px solid #dee2e6;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .cost-center-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .department-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .department-operations {
          background-color: #E8F5E9;
          color: #2E7D32;
        }
        
        .department-maintenance {
          background-color: #FFF3E0;
          color: #F57C00;
        }
        
        .department-admin {
          background-color: #E3F2FD;
          color: #1976D2;
        }
        
        .department-security {
          background-color: #FCE4EC;
          color: #C2185B;
        }
        
        .department-other {
          background-color: #F5F5F5;
          color: #666;
        }
      `}</style>
    </ProtectedRoute>
  );
}