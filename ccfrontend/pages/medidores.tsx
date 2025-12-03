import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import comunidadesService from '@/lib/comunidadesService';
import {
  listMedidores,
  listAllMedidores,
  deleteMedidor,
} from '@/lib/medidoresService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { ProtectedPage, Permission, usePermissions } from '@/lib/usePermissions';
import type { Medidor } from '@/types/medidores';

export default function MedidoresListadoPage() {
  const { user } = useAuth();
  const { hasPermission, hasRoleInCommunity, isSuperUser } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();
  const router = useRouter();

  const isSuper = !!user?.is_superadmin;
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [selectedComunidad, setSelectedComunidad] = useState<any | null>(null);

  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    offset: 0,
  });

  // filtros UI
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [currentView, setCurrentView] = useState<'table' | 'grid'>('table');

  // Determinar comunidadId: si es super usar selector, si no usar comunidad seleccionada global
  const resolvedComunidadId = React.useMemo(() => {
    if (isSuper) {
      return selectedComunidad?.id ? Number(selectedComunidad.id) : undefined;
    }
    const comunidadId = comunidadSeleccionada?.id ? Number(comunidadSeleccionada.id) : undefined;
    // eslint-disable-next-line no-console
    console.log('🔄 resolvedComunidadId cambió:', comunidadId, 'comunidad:', comunidadSeleccionada?.nombre);
    return comunidadId;
  }, [isSuper, selectedComunidad, comunidadSeleccionada]);

  // Verificar si el usuario tiene rol básico en la comunidad actual
  const isBasicRoleInCommunity = React.useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return false;
    }

    if (resolvedComunidadId) {
      return (
        hasRoleInCommunity(resolvedComunidadId, 'residente') ||
        hasRoleInCommunity(resolvedComunidadId, 'propietario') ||
        hasRoleInCommunity(resolvedComunidadId, 'inquilino')
      );
    }

    return false;
  }, [resolvedComunidadId, isSuperUser, hasRoleInCommunity]);

  // cargar comunidades para selector (superadmin)
  useEffect(() => {
    if (!isSuper) {
      return undefined;
    }
    let mounted = true;
    (async () => {
      try {
        const resp = await comunidadesService.getComunidades();
        const list = Array.isArray(resp) ? resp : ((resp as any)?.data ?? []);
        if (!mounted) {
          return;
        }
        setComunidades(list);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error cargando comunidades', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isSuper]);

  // carga medidores (usa comunidad seleccionada del filtro global)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🔥 useEffect ejecutándose - resolvedComunidadId:', resolvedComunidadId, 'comunidadSeleccionada:', comunidadSeleccionada);
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          page,
          limit,
          search,
          tipo: filterTipo,
          estado: filterEstado,
          marca: filterMarca,
        };

        // Si es super y tiene comunidad seleccionada en el selector, usar esa
        if (isSuper && selectedComunidad?.id) {
          params.comunidad_id = selectedComunidad.id;
        } else if (!isSuper && resolvedComunidadId) {
          // Usuario normal: usar comunidad del filtro global
          params.comunidad_id = resolvedComunidadId;
        }

        // eslint-disable-next-line no-console
        console.log('📡 Llamando API con params:', params);
        const resp = await listAllMedidores(params);
        // eslint-disable-next-line no-console
        console.log('✅ Respuesta API - medidores:', resp.data?.length || 0, 'medidores');
        if (!mounted) {
          return;
        }
        setMedidores(resp.data || []);
        setPagination({
          total: resp.pagination?.total ?? resp.data?.length ?? 0,
          pages: resp.pagination?.pages ?? 1,
          offset: resp.pagination?.offset ?? (page - 1) * limit,
        });
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error cargando medidores', err);
        if (err?.response?.status === 403) {
          setError('No autorizado para cargar medidores');
        } else {
          setError('Error al cargar medidores');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [
    isSuper,
    selectedComunidad,
    resolvedComunidadId,
    comunidadSeleccionada, // ⚠️ Agregar comunidadSeleccionada directamente para forzar re-render
    page,
    limit,
    search,
    filterTipo,
    filterEstado,
    filterMarca,
  ]);

  const canManage = (medidor?: Medidor) => {
    if (!user) {
      // eslint-disable-next-line no-console
      console.log('❌ canManage: no user');
      return false;
    }
    if (user.is_superadmin) {
      // eslint-disable-next-line no-console
      console.log('✅ canManage: is superadmin');
      return true;
    }
    const comunidadId = medidor?.comunidad_id;
    const result = !!user.memberships?.some(
      (m: any) => {
        const match = Number(m.comunidad_id) === Number(comunidadId) &&
          (m.rol === 'admin_comunidad' || m.rol === 'administrador' || m.rol === 'tesorero' || m.rol === 'presidente_comite');

        // eslint-disable-next-line no-console
        console.log('🔎 Checking membership:', {
          membershipComunidadId: m.comunidad_id,
          medidorComunidadId: comunidadId,
          match,
          rol: m.rol,
        });
        
        return match;
      },
    );
    // eslint-disable-next-line no-console
    console.log('🎯 canManage result:', result, 'for medidor:', medidor?.id);
    return result;
  };

  const handleView = (id: number) => router.push(`/medidores/${id}`);
  const handleNew = () => router.push('/medidores/nuevo');

  const handleDelete = async (id: number) => {
    if (
      !confirm('¿Eliminar medidor? (si tiene lecturas quedará desactivado)')
    ) {
      return;
    }
    setLoading(true);
    try {
      const resp = await deleteMedidor(id);
      if (resp?.softDeleted) {
        alert('Medidor desactivado (soft-delete).');
      }
      setMedidores(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('delete err', err);
      if (err?.response?.status === 403) {
        alert('No autorizado.');
      } else {
        alert('Error al eliminar medidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  // debug temporal: memberships en consola
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('DEBUG user memberships:', user?.memberships);
  }, [user]);

  return (
    <ProtectedRoute>
      <ProtectedPage allowedRoles={[
        'Superadmin',
        'admin_comunidad',
        'conserje',
        'contador',
        'tesorero',
        'presidente_comite',
        'residente',
        'propietario',
        'inquilino',
      ]}>
        <Head>
          <title>Medidores — Cuentas Claras</title>
        </Head>

        <Layout>
          <PageHeader
            title="Gestión de Medidores"
            subtitle="Control y monitoreo integral de medidores de servicios básicos"
            icon="speed"
            stats={[
              {
                label: 'Total Medidores',
                value: pagination.total.toString(),
                icon: 'speed',
                color: 'primary',
              },
            ]}
          >
            {hasPermission(Permission.CREATE_MEDIDOR) && !isBasicRoleInCommunity && (
              <button
                className='btn btn-light btn-lg'
                onClick={() => router.push('/medidores/nuevo')}
              >
                <span className='material-icons me-2'>add</span>
                Nuevo Medidor
              </button>
            )}
          </PageHeader>

          <div className='container-fluid px-4'>
            {/* Stats Cards */}
            <div className='row stats-row g-3 mb-4'>
              <div className='col-md-6 col-lg-3'>
                <div className='card stat-card total'>
                  <div className='card-body'>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>{pagination.total}</div>
                        <div className='stat-label'>Total Medidores</div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                      >
                        <span className='material-icons'>speed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-6 col-lg-3'>
                <div className='card stat-card active'>
                  <div className='card-body'>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>
                          {medidores.filter(m => m.estado === 'activo').length}
                        </div>
                        <div className='stat-label'>Activos</div>
                        <div className='stat-change positive'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '14px' }}
                          >
                            trending_up
                          </span>
                          +2% vs mes anterior
                        </div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#d4edda', color: '#155724' }}
                      >
                        <span className='material-icons'>check_circle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-6 col-lg-3'>
                <div className='card stat-card maintenance'>
                  <div className='card-body'>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>
                          {
                            medidores.filter(m => m.estado === 'mantenimiento')
                              .length
                          }
                        </div>
                        <div className='stat-label'>En mantenimiento</div>
                        <div className='stat-change'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '14px' }}
                          >
                            schedule
                          </span>
                          {
                            medidores.filter(m => m.estado === 'mantenimiento')
                              .length
                          }{' '}
                          pendientes
                        </div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#fff3cd', color: '#856404' }}
                      >
                        <span className='material-icons'>build</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-6 col-lg-3'>
                <div className='card stat-card inactive'>
                  <div className='card-body'>
                    <div className='stat-header'>
                      <div>
                        <div className='stat-value'>
                          0
                        </div>
                        <div className='stat-label'>Con Alertas</div>
                        <div className='stat-change negative'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '14px' }}
                          >
                            warning
                          </span>
                          Requieren atención
                        </div>
                      </div>
                      <div
                        className='stat-icon'
                        style={{ backgroundColor: '#f8d7da', color: '#721c24' }}
                      >
                        <span className='material-icons'>
                          notification_important
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className='filters-panel'>
              <div className='filters-header'>
                <h6 className='mb-0'>
                  <span className='material-icons me-2'>filter_list</span>
                  Filtros de Búsqueda
                </h6>
              </div>
              <div className='row g-3'>
                <div className='col-md-4'>
                  <div className='form-group'>
                    <label>Buscar medidor</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Código, serie o ubicación...'
                      value={search}
                      onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
                <div className='col-md-2'>
                  <div className='form-group'>
                    <label>Tipo</label>
                    <select
                      className='form-select'
                      value={filterTipo}
                      onChange={e => {
                        setFilterTipo(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value=''>Todos</option>
                      <option value='electricidad'>Eléctrico</option>
                      <option value='agua'>Agua</option>
                      <option value='gas'>Gas</option>
                    </select>
                  </div>
                </div>
                <div className='col-md-2'>
                  <div className='form-group'>
                    <label>Estado</label>
                    <select
                      className='form-select'
                      value={filterEstado}
                      onChange={e => {
                        setFilterEstado(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value=''>Todos</option>
                      <option value='activo'>Activo</option>
                      <option value='inactivo'>Inactivo</option>
                      <option value='mantenimiento'>Mantenimiento</option>
                    </select>
                  </div>
                </div>
                <div className='col-md-2'>
                  <div className='form-group'>
                    <label>Edificio</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Torre, edificio...'
                      value={''}
                      onChange={e => { }}
                    />
                  </div>
                </div>
                <div className='col-md-2'>
                  <div className='form-group'>
                    <label>Marca</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Schneider, Elster...'
                      value={filterMarca}
                      onChange={e => {
                        setFilterMarca(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de vista */}
            <div className='view-controls'>
              <div className='d-flex align-items-center gap-3'>
                <span className='text-muted'>
                  {pagination.total} medidores encontrados
                </span>
              </div>
              <div className='d-flex align-items-center gap-2'>
                <span className='text-muted small'>Vista:</span>
                <div className='btn-group' role='group'>
                  <button
                    className={`btn btn-sm ${currentView === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentView('table')}
                  >
                    <span className='material-icons'>view_list</span>
                  </button>
                  <button
                    className={`btn btn-sm ${currentView === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentView('grid')}
                  >
                    <span className='material-icons'>grid_view</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selector comunidad (superadmin) */}
            {isSuper && (
              <div className='mb-3'>
                <label className='me-2'>Comunidad:</label>
                <select
                  value={selectedComunidad?.id ?? ''}
                  onChange={e => {
                    const v =
                      e.target.value === '' ? null : Number(e.target.value);
                    setSelectedComunidad(
                      comunidades.find(c => c.id === v) ?? null,
                    );
                    setPage(1);
                  }}
                  className='form-select'
                  style={{ width: 320 }}
                >
                  <option value=''>Todas las comunidades</option>
                  {comunidades.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.razon_social ?? c.nombre ?? c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Aviso si usuario no es superadmin y no tiene comunidades */}
            {!isSuper &&
              (!user?.memberships || user.memberships.length === 0) && (
                <div className='alert alert-warning'>
                  No estás asignado a ninguna comunidad. Contacta al
                  administrador para asignar tu rol/comunidad.
                </div>
              )}

            {/* Aviso para roles básicos */}
            {isBasicRoleInCommunity && (
              <div className='alert alert-info'>
                <span className='material-icons me-2' style={{ verticalAlign: 'middle' }}>info</span>
                Estás viendo solo los medidores de tus unidades. No puedes crear, editar o eliminar medidores.
              </div>
            )}

            {/* Mensaje de error al cargar */}
            {error && (
              <div className='alert alert-danger alert-dismissible fade show' role='alert'>
                <span className='material-icons me-2' style={{ verticalAlign: 'middle' }}>error</span>
                {error}
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setError(null)}
                />
              </div>
            )}

            {/* Vista de tabla */}
            {currentView === 'table' && (
              <div className='medidores-table'>
                <div className='table-header'>
                  <h5 className='table-title'>
                    <span className='material-icons'>speed</span> Medidores
                  </h5>
                  <button className='btn btn-outline-secondary btn-sm'>
                    <span className='material-icons me-1'>file_download</span>{' '}
                    Exportar
                  </button>
                </div>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Unidad</th>
                        <th>Tipo</th>
                        <th>Última lectura</th>
                        <th>Estado</th>
                        <th className='text-end'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medidores.map(m => (
                        <tr key={m.id} className='data-row'>
                          <td>{m.id}</td>
                          <td>
                            <div className='fw-medium'>
                              {m.medidor_codigo ?? (m as any).codigo ?? '-'}
                            </div>
                            <small className='text-muted'>
                              S/N:{' '}
                              {m.serial_number ??
                                (m as any).serialNumber ??
                                (m as any).numero_serie ??
                                '-'}
                            </small>
                          </td>
                          <td>{m.unidad_codigo ?? m.unidad_id ?? '-'}</td>
                          <td>{m.tipo ?? '-'}</td>
                          <td>
                            <div className='fw-medium'>
                              {m.ultima_lectura ?? '-'}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${m.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {m.estado ?? (m.activo ? 'Activo' : 'Inactivo')}
                            </span>
                          </td>
                          <td className='text-end'>
                            <div className='d-flex gap-1 justify-content-end'>
                              {(() => {
                                const canManageResult = canManage(m);
                                // eslint-disable-next-line no-console
                                console.log('🔍 Debug botones medidor:', {
                                  medidorId: m.id,
                                  comunidadId: m.comunidad_id,
                                  canManage: canManageResult,
                                  isBasicRole: isBasicRoleInCommunity,
                                  userMemberships: user?.memberships,
                                  shouldShowButtons: canManageResult && !isBasicRoleInCommunity,
                                });
                                return null;
                              })()}
                              {canManage(m) && !isBasicRoleInCommunity && (
                                <>
                                  <button
                                    className='btn btn-outline-primary btn-sm'
                                    onClick={() => router.push(`/medidores/${m.id}/editar`)}
                                    title="Editar medidor"
                                  >
                                    <span className='material-icons'>edit</span>
                                  </button>
                                  <button
                                    className='btn btn-outline-danger btn-sm'
                                    onClick={() => handleDelete(m.id)}
                                    title="Eliminar medidor"
                                  >
                                    <span className='material-icons'>delete</span>
                                  </button>
                                </>
                              )}
                              <button
                                className='btn btn-outline-info btn-sm'
                                onClick={() => handleView(m.id)}
                                title="Ver detalle"
                              >
                                <span className='material-icons'>visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {medidores.length === 0 && (
                        <tr>
                          <td colSpan={7} className='text-center'>
                            Sin registros
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vista de tarjetas (grid) */}
            {currentView === 'grid' && (
              <div className='row g-3'>
                {medidores.map(m => (
                  <div key={m.id} className='col-md-6 col-lg-4'>
                    <div className='card h-100'>
                      <div className='card-body'>
                        <div className='d-flex justify-content-between align-items-start mb-3'>
                          <div>
                            <h6 className='card-title mb-1'>
                              {m.medidor_codigo ?? (m as any).codigo ?? '-'}
                            </h6>
                            <small className='text-muted'>ID: {m.id}</small>
                          </div>
                          <span className={`badge ${m.activo ? 'bg-success' : 'bg-secondary'}`}>
                            {m.estado ?? (m.activo ? 'Activo' : 'Inactivo')}
                          </span>
                        </div>

                        <div className='mb-3'>
                          <div className='d-flex align-items-center gap-2 mb-2'>
                            <span className='material-icons text-muted' style={{ fontSize: '18px' }}>apartment</span>
                            <span className='small'>{m.unidad_codigo ?? m.unidad_id ?? '-'}</span>
                          </div>
                          <div className='d-flex align-items-center gap-2 mb-2'>
                            <span className='material-icons text-muted' style={{ fontSize: '18px' }}>category</span>
                            <span className='small'>{m.tipo ?? '-'}</span>
                          </div>
                          <div className='d-flex align-items-center gap-2 mb-2'>
                            <span className='material-icons text-muted' style={{ fontSize: '18px' }}>speed</span>
                            <span className='small'>Lectura: {m.ultima_lectura ?? '-'}</span>
                          </div>
                          <div className='d-flex align-items-center gap-2'>
                            <span className='material-icons text-muted' style={{ fontSize: '18px' }}>tag</span>
                            <span className='small'>S/N: {m.serial_number ?? (m as any).serialNumber ?? (m as any).numero_serie ?? '-'}</span>
                          </div>
                        </div>

                        <div className='d-flex gap-2'>
                          {canManage(m) && !isBasicRoleInCommunity && (
                            <>
                              <button
                                className='btn btn-outline-primary btn-sm flex-fill'
                                onClick={() => router.push(`/medidores/${m.id}/editar`)}
                                title="Editar medidor"
                              >
                                <span className='material-icons'>edit</span>
                              </button>
                              <button
                                className='btn btn-outline-danger btn-sm flex-fill'
                                onClick={() => handleDelete(m.id)}
                                title="Eliminar medidor"
                              >
                                <span className='material-icons'>delete</span>
                              </button>
                            </>
                          )}
                          <button
                            className='btn btn-outline-info btn-sm flex-fill'
                            onClick={() => handleView(m.id)}
                            title="Ver detalle"
                          >
                            <span className='material-icons'>visibility</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {medidores.length === 0 && (
                  <div className='col-12'>
                    <div className='alert alert-info text-center'>
                      Sin registros
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paginación moderna */}
            {pagination.pages > 1 && (
              <ModernPagination
                currentPage={page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={limit}
                itemName="medidores"
                onPageChange={setPage}
              />
            )}
          </div>
        </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
}
