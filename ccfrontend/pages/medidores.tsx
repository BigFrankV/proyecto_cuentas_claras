import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import comunidadesService from '@/lib/comunidadesService';
import {
  listMedidores,
  listAllMedidores,
  deleteMedidor,
} from '@/lib/medidoresService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import type { Medidor } from '@/types/medidores';

export default function MedidoresListadoPage() {
  const { user } = useAuth();
  const router = useRouter();

  const isSuper = !!user?.is_superadmin;
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [selectedComunidad, setSelectedComunidad] = useState<any | null>(null);

  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, offset: 0 });

  // filtros UI
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMarca, setFilterMarca] = useState('');

  // comunidad del usuario (si no es superadmin)
  const comunidadUsuarioId = user?.comunidades?.[0]?.id ?? null;

  // cargar comunidades para selector (superadmin)
  useEffect(() => {
    if (!isSuper) {return;}
    let mounted = true;
    (async () => {
      try {
        const resp = await comunidadesService.listComunidades?.();
        const list = Array.isArray(resp) ? resp : resp?.data ?? [];
        if (!mounted) {return;}
        setComunidades(list);
      } catch (err) {
        console.error('Error cargando comunidades', err);
      }
    })();
    return () => { mounted = false; };
  }, [isSuper]);

  // carga medidores (usa endpoint global para superadmin)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const params: any = { page, limit, search, tipo: filterTipo, estado: filterEstado, marca: filterMarca };
        if (isSuper) {
          if (selectedComunidad?.id) {params.comunidad_id = selectedComunidad.id;}
          const resp = await listAllMedidores(params);
          if (!mounted) {return;}
          setMedidores(resp.data || []);
          setPagination({
            total: resp.pagination?.total ?? (resp.data?.length ?? 0),
            pages: resp.pagination?.pages ?? 1,
            offset: resp.pagination?.offset ?? (page - 1) * limit,
          });
          return;
        }

        // usuario normal: usar su comunidad
        if (!comunidadUsuarioId) {
          setMedidores([]);
          setPagination({ total: 0, pages: 1, offset: 0 });
          return;
        }
        const resp = await listMedidores(comunidadUsuarioId, params);
        if (!mounted) {return;}
        setMedidores(resp.data || []);
        setPagination({
          total: resp.pagination?.total ?? (resp.data?.length ?? 0),
          pages: resp.pagination?.pages ?? 1,
          offset: resp.pagination?.offset ?? (page - 1) * limit,
        });
      } catch (err:any) {
        console.error('Error cargando medidores', err);
        if (err?.response?.status === 403) {alert('No autorizado');}
        else {alert('Error cargando medidores');}
      } finally {
        if (mounted) {setLoading(false);}
      }
    };
    load();
    return () => { mounted = false; };
  }, [isSuper, selectedComunidad, comunidadUsuarioId, page, limit, search, filterTipo, filterEstado, filterMarca]);

  const canManage = (medidor?: Medidor) => {
    if (!user) {return false;}
    if (user.is_superadmin) {return true;}
    const comunidadId = medidor?.comunidad_id ?? comunidadUsuarioId;
    return !!user.comunidades?.some((c:any) => c.id === comunidadId && (c.role === 'admin' || c.role === 'gestor'));
  };

  const handleView = (id:number) => router.push(`/medidores/${id}`);
  const handleNew = () => router.push('/medidores/nuevo');

  const handleDelete = async (id:number) => {
    if (!confirm('¿Eliminar medidor? (si tiene lecturas quedará desactivado)')) {return;}
    setLoading(true);
    try {
      const resp = await deleteMedidor(id);
      if (resp?.softDeleted) {alert('Medidor desactivado (soft-delete).');}
      setMedidores(prev => prev.filter(m => m.id !== id));
    } catch (err:any) {
      console.error('delete err', err);
      if (err?.response?.status === 403) {alert('No autorizado.');}
      else {alert('Error al eliminar medidor.');}
    } finally {
      setLoading(false);
    }
  };

  // debug temporal: memberships en consola
  useEffect(() => {
    console.debug('DEBUG user memberships:', user?.comunidades);
  }, [user]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Medidores — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='medidores-container'>
          {/* Header */}
          <div className='page-header'>
            <div className='container-fluid'>
              <div className='row align-items-center'>
                <div className='col'>
                  <h1 className='page-title'>
                    <span
                      className='material-icons me-3'
                      style={{ fontSize: '2.5rem' }}
                    >
                      speed
                    </span>
                    Gestión de Medidores
                  </h1>
                  <p className='page-subtitle'>
                    Control y monitoreo integral de medidores de servicios básicos
                  </p>
                </div>
                <div className='col-auto'>
                  { (user && (user.is_superadmin || canManage())) && (
                    <button
                      className='btn btn-primary'
                      onClick={() => router.push('/medidores/nuevo')}
                    >
                      <span className='material-icons me-2'>add</span>
                      Nuevo Medidor
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

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
                      <div className='stat-icon' style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
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
                          <span className='material-icons' style={{ fontSize: '14px' }}>trending_up</span>
                          +2% vs mes anterior
                        </div>
                      </div>
                      <div className='stat-icon' style={{ backgroundColor: '#d4edda', color: '#155724' }}>
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
                          {medidores.filter(m => m.estado === 'mantenimiento').length}
                        </div>
                        <div className='stat-label'>En mantenimiento</div>
                        <div className='stat-change'>
                          <span className='material-icons' style={{ fontSize: '14px' }}>schedule</span>
                          {medidores.filter(m => m.estado === 'mantenimiento').length} pendientes
                        </div>
                      </div>
                      <div className='stat-icon' style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
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
                        <div className='stat-value'>{medidores.filter(m => m.alertas?.length > 0).length}</div>
                        <div className='stat-label'>Con Alertas</div>
                        <div className='stat-change negative'>
                          <span className='material-icons' style={{ fontSize: '14px' }}>warning</span>
                          Requieren atención
                        </div>
                      </div>
                      <div className='stat-icon' style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                        <span className='material-icons'>notification_important</span>
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
                    <input type='text' className='form-control' placeholder='Código, serie o ubicación...' value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                  </div>
                </div>
                <div className='col-md-2'>
                  <div className='form-group'>
                    <label>Tipo</label>
                    <select className='form-select' value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(1); }}>
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
                    <select className='form-select' value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}>
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
                    <input type='text' className='form-control' placeholder='Torre, edificio...' value={''} onChange={e => {}} />
                  </div>
                </div>
                <div className='col-md-2'>
                  <div className='form-group'>
                    <label>Marca</label>
                    <input type='text' className='form-control' placeholder='Schneider, Elster...' value={filterMarca} onChange={e => { setFilterMarca(e.target.value); setPage(1); }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de vista */}
            <div className='view-controls'>
              <div className='d-flex align-items-center gap-3'>
                <span className='text-muted'>{pagination.total} medidores encontrados</span>
              </div>
              <div className='d-flex align-items-center gap-2'>
                <span className='text-muted small'>Vista:</span>
                <div className='btn-group' role='group'>
                  <button className={`btn btn-sm ${'table' === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => {}}>
                    <span className='material-icons'>view_list</span>
                  </button>
                  <button className={`btn btn-sm ${'grid' === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => {}}>
                    <span className='material-icons'>grid_view</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Selector comunidad (superadmin) */}
            {isSuper && (
              <div className='mb-3'>
                <label className='me-2'>Comunidad:</label>
                <select value={selectedComunidad?.id ?? ''} onChange={e => {
                  const v = e.target.value === '' ? null : Number(e.target.value);
                  setSelectedComunidad(comunidades.find(c => c.id === v) ?? null);
                  setPage(1);
                }} className='form-select' style={{ width: 320 }}>
                  <option value=''>Todas las comunidades</option>
                  {comunidades.map(c => <option key={c.id} value={c.id}>{c.razon_social ?? c.nombre ?? c.name}</option>)}
                </select>
              </div>
            )}

            {/* Aviso si usuario no es superadmin y no tiene comunidades */}
            {!isSuper && (!user?.comunidades || user.comunidades.length === 0) && (
              <div className="alert alert-warning">
                No estás asignado a ninguna comunidad. Contacta al administrador para asignar tu rol/comunidad.
              </div>
            )}

            {/* Vista de tabla */}
            <div className='medidores-table'>
              <div className='table-header'>
                <h5 className='table-title'><span className='material-icons'>speed</span> Medidores</h5>
                <button className='btn btn-outline-secondary btn-sm'><span className='material-icons me-1'>file_download</span> Exportar</button>
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
                          <div className='fw-medium'>{m.medidor_codigo ?? (m as any).codigo ?? '-'}</div>
                          <small className='text-muted'>S/N: {m.serial_number ?? (m as any).serialNumber ?? (m as any).numero_serie ?? '-'}</small>
                        </td>
                        <td>{m.unidad_codigo ?? m.unidad_id ?? '-'}</td>
                        <td>{m.tipo ?? '-'}</td>
                        <td><div className='fw-medium'>{m.ultima_lectura ?? '-'}</div></td>
                        <td>{m.estado ?? (m.activo ? 'activo' : 'inactivo') ?? '-'}</td>
                        <td className='text-end'>
                          <div className='d-flex gap-1 justify-content-end'>
                            <button className='btn btn-outline-info btn-sm' onClick={() => handleView(m.id)}><span className='material-icons'>visibility</span></button>
                            {canManage(m) && <button className='btn btn-outline-danger btn-sm' onClick={() => handleDelete(m.id)}><span className='material-icons'>delete</span></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {medidores.length === 0 && <tr><td colSpan={7} className='text-center'>Sin registros</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className='d-flex justify-content-between align-items-center mt-4'>
                <button className='btn btn-outline-primary btn-sm' onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
                <span className='text-muted'>Página {page} / {pagination.pages}</span>
                <button className='btn btn-outline-primary btn-sm' onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}>Siguiente</button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
