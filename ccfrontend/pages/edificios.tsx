import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import ModernPagination from '@/components/ui/ModernPagination';
import { useEdificios } from '@/hooks/useEdificios';
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import { Permission, usePermissions } from '@/lib/usePermissions';
import {
  Edificio,
  EdificioFilters,
  EdificioStats,
  VistaListado,
  ESTADOS_EDIFICIO,
  TIPOS_EDIFICIO,
} from '@/types/edificios';

export default function EdificiosListado() {
  const { user } = useAuth();
  const router = useRouter();
  const { hasPermission } = usePermissions();

  // Hooks personalizados
  const {
    edificios,
    loading,
    error,
    fetchEdificios,
    deleteEdificio,
    getStats,
    filterEdificios,
  } = useEdificios();

  // Estado local
  const [filters, setFilters] = useState<EdificioFilters>({});
  const [vista, setVista] = useState<VistaListado>('tabla');
  const [selectedEdificios, setSelectedEdificios] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edificios filtrados
  const filteredEdificios = filterEdificios(filters);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchEdificios();
  }, [fetchEdificios]);

  // Calcular estadísticas basadas en los edificios cargados
  const statsCalculadas = {
    totalEdificios: edificios.length,
    edificiosActivos: edificios.filter(e => e.estado === 'activo').length,
    totalUnidades: edificios.reduce(
      (sum, e) => sum + (e.totalUnidades || 0),
      0,
    ),
    unidadesOcupadas: edificios.reduce(
      (sum, e) => sum + (e.totalUnidadesOcupadas || 0),
      0,
    ),
    ocupacion:
      edificios.length > 0
        ? (edificios.reduce(
            (sum, e) => sum + (e.totalUnidadesOcupadas || 0),
            0,
          ) /
            edificios.reduce((sum, e) => sum + (e.totalUnidades || 1), 0)) *
          100
        : 0,
  };

  // Debug: log de estadísticas calculadas
  // eslint-disable-next-line no-console
  console.log('Edificios cargados:', edificios.length);
  // eslint-disable-next-line no-console
  console.log('Estadísticas calculadas:', statsCalculadas);
  // eslint-disable-next-line no-console
  console.log('Muestra de edificios:', edificios.slice(0, 2));

  const handleFilterChange = (key: keyof EdificioFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const handleDeleteEdificio = async (id: string, nombre: string) => {
    if (
      confirm(
        `¿Estás seguro de que deseas eliminar el edificio "${nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      const success = await deleteEdificio(id);
      if (success) {
        // Actualizar la lista
        await fetchEdificios();
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEdificios(filteredEdificios.map(e => e.id));
    } else {
      setSelectedEdificios([]);
    }
  };

  const handleSelectEdificio = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEdificios(prev => [...prev, id]);
    } else {
      setSelectedEdificios(prev => prev.filter(eId => eId !== id));
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: 'bg-success',
      inactivo: 'bg-secondary',
      construccion: 'bg-warning',
      mantenimiento: 'bg-info',
    };
    return badges[estado as keyof typeof badges] || 'bg-secondary';
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      residencial: 'home',
      comercial: 'business',
      mixto: 'domain',
      oficinas: 'corporate_fare',
    };
    return icons[tipo as keyof typeof icons] || 'business';
  };

  // Funciones de paginación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  // Paginación
  const totalPages = Math.ceil(filteredEdificios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEdificios = filteredEdificios.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <ProtectedRoute>
      <Head>
        <title>Edificios — Cuentas Claras</title>
      </Head>

      <Layout title='Edificios'>
        {/* Header profesional */}
        <div className='container-fluid p-0'>
          <header className='text-white shadow-lg' style={{ background: 'var(--gradient-dashboard-header)' }}>
            <div className='p-4'>
              <div className='row align-items-center'>
                {/* Información principal */}
                <div className='col-lg-8'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='icon-box bg-info bg-opacity-20 rounded-circle p-3 me-3'>
                      <span className='material-icons' style={{ fontSize: '32px', color: 'white' }}>
                        business
                      </span>
                    </div>
                    <div>
                      <h1 className='h3 mb-1 fw-bold'>Edificios</h1>
                      <p className='mb-0 opacity-75'>Gestión y administración de edificios</p>
                    </div>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className='bg-white bg-opacity-10 rounded p-3'>
                    <div className='row g-3'>
                      <div className='col-4'>
                        <div className='text-center'>
                          <div className='h5 mb-0 fw-bold'>{statsCalculadas.totalEdificios}</div>
                          <small className='text-white-50'>Total</small>
                        </div>
                      </div>
                      <div className='col-4'>
                        <div className='text-center'>
                          <div className='h5 mb-0 fw-bold'>{statsCalculadas.edificiosActivos}</div>
                          <small className='text-white-50'>Activos</small>
                        </div>
                      </div>
                      <div className='col-4'>
                        <div className='text-center'>
                          <div className='h5 mb-0 fw-bold'>{filteredEdificios.length}</div>
                          <small className='text-white-50'>Filtrados</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel de acciones */}
                <div className='col-lg-4'>
                  <div className='d-flex justify-content-end align-items-center'>
                    {/* Información del usuario */}
                    <div className='bg-white bg-opacity-10 rounded p-3 me-3'>
                      <div className='d-flex align-items-center'>
                        <span className='material-icons me-2'>person</span>
                        <div>
                          <small className='text-white-50'>Usuario</small>
                          <div className='fw-semibold'>{user?.username || 'Cargando...'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Botón de nuevo edificio */}
                    {hasPermission(Permission.CREATE_EDIFICIO) && (
                      <Link href='/edificios/nuevo' className='btn btn-light d-flex align-items-center'>
                        <span className='material-icons me-2'>add</span>
                        Nuevo Edificio
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>

        <div className='container-fluid py-4'>

          {/* Filtros y acciones */}
          <div className='row mb-4'>
            <div className='col-lg-8'>
              <div className='filter-container'>
                <div className='row g-3'>
                  <div className='col-md-4'>
                    <div className='search-icon-container'>
                      <i className='material-icons search-icon'>search</i>
                      <input
                        type='text'
                        className='form-control search-input'
                        placeholder='Buscar edificios...'
                        value={filters.busqueda || ''}
                        onChange={e =>
                          handleFilterChange('busqueda', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className='col-md-3'>
                    <select
                      className='form-select'
                      value={filters.estado || ''}
                      onChange={e =>
                        handleFilterChange('estado', e.target.value)
                      }
                    >
                      <option value=''>Todos los estados</option>
                      {ESTADOS_EDIFICIO.map(estado => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-md-3'>
                    <select
                      className='form-select'
                      value={filters.tipo || ''}
                      onChange={e => handleFilterChange('tipo', e.target.value)}
                    >
                      <option value=''>Todos los tipos</option>
                      {TIPOS_EDIFICIO.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-md-2'>
                    <button
                      className='btn btn-outline-secondary w-100'
                      onClick={() => setFilters({})}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4 d-flex justify-content-end'>
              {hasPermission(Permission.CREATE_EDIFICIO) && (
                <Link href='/edificios/nuevo' className='btn btn-primary'>
                  <i className='material-icons me-2'>add</i>
                  Nuevo Edificio
                </Link>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className='row mb-4'>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='card stat-card'>
                <div className='card-body p-3'>
                  <div className='d-flex align-items-center'>
                    <div className='stat-icon me-3'>
                      <i className='material-icons text-primary'>business</i>
                    </div>
                    <div>
                      <div className='stat-value'>
                        {statsCalculadas.totalEdificios}
                      </div>
                      <div className='stat-label text-muted'>
                        Total Edificios
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='card stat-card'>
                <div className='card-body p-3'>
                  <div className='d-flex align-items-center'>
                    <div className='stat-icon me-3'>
                      <i className='material-icons text-success'>
                        check_circle
                      </i>
                    </div>
                    <div>
                      <div className='stat-value'>
                        {statsCalculadas.edificiosActivos}
                      </div>
                      <div className='stat-label text-muted'>
                        Edificios Activos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='card stat-card'>
                <div className='card-body p-3'>
                  <div className='d-flex align-items-center'>
                    <div className='stat-icon me-3'>
                      <i className='material-icons text-info'>apartment</i>
                    </div>
                    <div>
                      <div className='stat-value'>
                        {statsCalculadas.totalUnidades}
                      </div>
                      <div className='stat-label text-muted'>
                        Total Unidades
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-3 col-md-6 mb-3'>
              <div className='card stat-card'>
                <div className='card-body p-3'>
                  <div className='d-flex align-items-center'>
                    <div className='stat-icon me-3'>
                      <i className='material-icons text-warning'>groups</i>
                    </div>
                    <div>
                      <div className='stat-value'>
                        {statsCalculadas.ocupacion.toFixed(1)}%
                      </div>
                      <div className='stat-label text-muted'>Ocupación</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mostrar errores */}
          {error && (
            <div className='alert alert-danger' role='alert'>
              <i className='material-icons me-2'>error</i>
              {error}
            </div>
          )}

          {/* Control de vista */}
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <div className='d-flex align-items-center'>
              <span className='me-3 text-muted'>
                Mostrando {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredEdificios.length)}{' '}
                de {filteredEdificios.length} edificios
              </span>
              {selectedEdificios.length > 0 && (
                <span className='badge bg-primary'>
                  {selectedEdificios.length} seleccionados
                </span>
              )}
            </div>
            <div className='btn-group' role='group'>
              <button
                type='button'
                className={`btn btn-outline-secondary ${vista === 'tabla' ? 'active' : ''}`}
                onClick={() => setVista('tabla')}
              >
                <i className='material-icons'>view_list</i>
              </button>
              <button
                type='button'
                className={`btn btn-outline-secondary ${vista === 'tarjetas' ? 'active' : ''}`}
                onClick={() => setVista('tarjetas')}
              >
                <i className='material-icons'>view_module</i>
              </button>
            </div>
          </div>

          {/* Vista de tabla */}
          {vista === 'tabla' && (
            <div className='card shadow-sm mb-4'>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            checked={
                              selectedEdificios.length ===
                                filteredEdificios.length &&
                              filteredEdificios.length > 0
                            }
                            onChange={e => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th>Edificio</th>
                        <th>Comunidad</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Unidades</th>
                        <th>Ocupación</th>
                        <th>Administrador</th>
                        <th style={{ width: '120px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEdificios.map(edificio => (
                        <tr key={edificio.id}>
                          <td>
                            <input
                              type='checkbox'
                              className='form-check-input'
                              checked={selectedEdificios.includes(edificio.id)}
                              onChange={e =>
                                handleSelectEdificio(
                                  edificio.id,
                                  e.target.checked,
                                )
                              }
                            />
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='edificio-icon me-3'>
                                <i className='material-icons'>
                                  {getTipoIcon(edificio.tipo)}
                                </i>
                              </div>
                              <div>
                                <div className='fw-semibold'>
                                  {edificio.nombre}
                                </div>
                                <div className='text-muted small'>
                                  {edificio.codigo}
                                </div>
                                <div className='text-muted small'>
                                  {edificio.direccion}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className='text-muted'>
                              {edificio.comunidadNombre}
                            </span>
                          </td>
                          <td>
                            <span className='badge bg-light text-dark'>
                              {
                                TIPOS_EDIFICIO.find(
                                  t => t.value === edificio.tipo,
                                )?.label
                              }
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${getEstadoBadge(edificio.estado)}`}
                            >
                              {
                                ESTADOS_EDIFICIO.find(
                                  e => e.value === edificio.estado,
                                )?.label
                              }
                            </span>
                          </td>
                          <td>
                            <div className='text-center'>
                              <div className='fw-semibold'>
                                {edificio.totalUnidades}
                              </div>
                              <div className='text-muted small'>
                                {edificio.numeroTorres} torre(s)
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='flex-grow-1 me-2'>
                                <div
                                  className='progress'
                                  style={{ height: '8px' }}
                                >
                                  <div
                                    className='progress-bar bg-success'
                                    style={{
                                      width: `${(edificio.totalUnidadesOcupadas / edificio.totalUnidades) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <small className='text-muted'>
                                {(
                                  (edificio.totalUnidadesOcupadas /
                                    edificio.totalUnidades) *
                                  100
                                ).toFixed(0)}
                                %
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className='fw-semibold small'>
                                {edificio.administrador}
                              </div>
                              <div className='text-muted small'>
                                {edificio.telefonoAdministrador}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className='btn-group' role='group'>
                              <Link
                                href={`/edificios/${edificio.id}`}
                                className='btn btn-sm btn-outline-primary'
                                title='Ver detalle'
                              >
                                <i className='material-icons'>visibility</i>
                              </Link>
                              {hasPermission(Permission.EDIT_EDIFICIO) && (
                                <button
                                  className='btn btn-sm btn-outline-secondary'
                                  title='Editar'
                                  onClick={() =>
                                    router.push(
                                      `/edificios/${edificio.id}/editar`,
                                    )
                                  }
                                >
                                  <i className='material-icons'>edit</i>
                                </button>
                              )}
                              {hasPermission(Permission.DELETE_EDIFICIO) && (
                                <button
                                  className='btn btn-sm btn-outline-danger'
                                  title='Eliminar'
                                  onClick={() =>
                                    handleDeleteEdificio(
                                      edificio.id,
                                      edificio.nombre,
                                    )
                                  }
                                >
                                  <i className='material-icons'>delete</i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {vista === 'tarjetas' && (
            <div className='row'>
              {paginatedEdificios.map(edificio => (
                <div key={edificio.id} className='col-lg-4 col-md-6 mb-4'>
                  <div className='card edificio-card h-100'>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-start mb-3'>
                        <div className='d-flex align-items-center'>
                          <div className='edificio-icon me-3'>
                            <i className='material-icons'>
                              {getTipoIcon(edificio.tipo)}
                            </i>
                          </div>
                          <div>
                            <h6 className='card-title mb-1'>
                              {edificio.nombre}
                            </h6>
                            <small className='text-muted'>
                              {edificio.codigo}
                            </small>
                          </div>
                        </div>
                        <span
                          className={`badge ${getEstadoBadge(edificio.estado)}`}
                        >
                          {
                            ESTADOS_EDIFICIO.find(
                              e => e.value === edificio.estado,
                            )?.label
                          }
                        </span>
                      </div>

                      <p className='text-muted small mb-3'>
                        <i
                          className='material-icons me-1'
                          style={{ fontSize: '16px' }}
                        >
                          location_on
                        </i>
                        {edificio.direccion}
                      </p>

                      <div className='row text-center mb-3'>
                        <div className='col-4'>
                          <div className='fw-semibold'>
                            {edificio.totalUnidades}
                          </div>
                          <small className='text-muted'>Unidades</small>
                        </div>
                        <div className='col-4'>
                          <div className='fw-semibold'>
                            {edificio.numeroTorres}
                          </div>
                          <small className='text-muted'>Torres</small>
                        </div>
                        <div className='col-4'>
                          <div className='fw-semibold'>{edificio.pisos}</div>
                          <small className='text-muted'>Pisos</small>
                        </div>
                      </div>

                      <div className='mb-3'>
                        <div className='d-flex justify-content-between align-items-center mb-1'>
                          <small className='text-muted'>Ocupación</small>
                          <small className='text-muted'>
                            {edificio.totalUnidadesOcupadas}/
                            {edificio.totalUnidades}
                          </small>
                        </div>
                        <div className='progress' style={{ height: '8px' }}>
                          <div
                            className='progress-bar bg-success'
                            style={{
                              width: `${(edificio.totalUnidadesOcupadas / edificio.totalUnidades) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className='d-flex justify-content-between align-items-center'>
                        <div>
                          <small className='text-muted d-block'>
                            Administrador
                          </small>
                          <small className='fw-semibold'>
                            {edificio.administrador}
                          </small>
                        </div>
                        <div className='btn-group' role='group'>
                          <Link
                            href={`/edificios/${edificio.id}`}
                            className='btn btn-sm btn-outline-primary'
                          >
                            <i className='material-icons'>visibility</i>
                          </Link>
                          {hasPermission(Permission.EDIT_EDIFICIO) && (
                            <button
                              className='btn btn-sm btn-outline-secondary'
                              onClick={() =>
                                router.push(`/edificios/${edificio.id}/editar`)
                              }
                            >
                              <i className='material-icons'>edit</i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación moderna */}
          {totalPages > 1 && (
            <ModernPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEdificios.length}
              itemsPerPage={itemsPerPage}
              itemName="edificios"
              onPageChange={goToPage}
            />
          )}


        </div>

        <style jsx>{`
          .filter-container {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 1rem;
          }

          .search-icon-container {
            position: relative;
          }

          .search-icon {
            position: absolute;
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            color: #6c757d;
            font-size: 20px;
          }

          .search-input {
            padding-left: 40px;
          }

          .stat-card {
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background-color: rgba(3, 14, 39, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .edificio-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background-color: var(--bs-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .edificio-card {
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
          }

          .edificio-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          }

          .btn-floating {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: var(--bs-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
              0 3px 5px -1px rgba(0, 0, 0, 0.2),
              0 6px 10px 0 rgba(0, 0, 0, 0.14),
              0 1px 18px 0 rgba(0, 0, 0, 0.12);
            z-index: 1000;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
            text-decoration: none;
          }

          .btn-floating:hover {
            transform: scale(1.1);
            box-shadow:
              0 5px 8px -1px rgba(0, 0, 0, 0.2),
              0 9px 14px 0 rgba(0, 0, 0, 0.14),
              0 2px 20px 0 rgba(0, 0, 0, 0.12);
            color: white;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
