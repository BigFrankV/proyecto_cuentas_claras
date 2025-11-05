import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import {
  useMembresias,
  Membresia,
  MembresiaFilters,
} from '@/hooks/useMembresias';
import { ProtectedRoute } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';

const MembresiasListado = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelFilter, setNivelFilter] = useState<number | 'todos'>('todos');
  const [estadoFilter, setEstadoFilter] = useState<
    'todos' | 'activo' | 'inactivo'
  >('todos');
  const [comunidadFilter, setComunidadFilter] = useState<number | 'todos'>(
    'todos',
  );
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState<any[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);

  const { listarMembresias, listarRoles, listarComunidades, loading, error } =
    useMembresias();

  const itemsPerPage = 20;

  useEffect(() => {
    cargarMembresias();
  }, [searchTerm, nivelFilter, estadoFilter, comunidadFilter, currentPage]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [rolesData, comunidadesData] = await Promise.all([
        listarRoles(),
        listarComunidades(),
      ]);
      setRoles(rolesData);
      setComunidades(comunidadesData);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar catálogos:', err);
    }
  };

  const cargarMembresias = async () => {
    try {
      const filters: MembresiaFilters = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (nivelFilter !== 'todos') {
        filters.rol_id = nivelFilter;
      }

      if (comunidadFilter !== 'todos') {
        filters.comunidad_id = comunidadFilter;
      }

      const response = await listarMembresias(filters);
      setMembresias(response.data);
      setTotal(response.meta.total);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar membresías:', err);
    }
  };

  // Filtrado de membresías (ya filtrado por API)
  const filteredMembresias = membresias;

  // Estadísticas
  const stats = useMemo(() => {
    const activas = membresias.filter(m => m.activo).length;
    const inactivas = membresias.filter(m => !m.activo).length;
    // Para vencenEsteMes y vencidas, calcular basado en hasta
    const now = new Date();
    const vencenEsteMes = membresias.filter(
      m =>
        m.hasta &&
        new Date(m.hasta) > now &&
        (new Date(m.hasta).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <=
          30,
    ).length;
    const vencidas = membresias.filter(
      m => m.hasta && new Date(m.hasta) < now,
    ).length;

    return { total, activas, vencenEsteMes, vencidas };
  }, [membresias, total]);

  const getTierBadgeClass = (rolCodigo: string) => {
    const classes = {
      residente: 'tier-basic',
      propietario: 'tier-standard',
      directivo: 'tier-premium',
      contador: 'tier-premium',
      secretario: 'tier-premium',
      tesorero: 'tier-premium',
      comite: 'tier-premium',
      admin: 'tier-vip',
      superadmin: 'tier-vip',
    };
    return `tier-badge ${classes[rolCodigo as keyof typeof classes] || 'tier-basic'}`;
  };

  const getEstadoIcon = (activo: boolean) => {
    return activo ? 'status-activo' : 'status-inactivo';
  };

  const getProgressColor = (activo: boolean, hasta: string | null) => {
    if (!activo) {
      return 'bg-secondary';
    }
    if (!hasta) {
      return 'bg-success';
    }
    const now = new Date();
    const vencimiento = new Date(hasta);
    const diasRestantes =
      (vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diasRestantes < 0) {
      return 'bg-danger';
    }
    if (diasRestantes <= 30) {
      return 'bg-warning';
    }
    return 'bg-success';
  };

  const getAvatarColor = (rolCodigo: string) => {
    const colors = {
      residente: 'var(--color-info)',
      propietario: 'var(--color-primary)',
      directivo: 'var(--color-warning)',
      contador: 'var(--color-success)',
      secretario: 'var(--color-success)',
      tesorero: 'var(--color-success)',
      comite: 'var(--color-warning)',
      admin: 'var(--color-danger)',
      superadmin: 'var(--color-danger)',
    };
    return colors[rolCodigo as keyof typeof colors] || 'var(--color-primary)';
  };

  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Membresías — Cuentas Claras</title>
        </Head>

        <Layout title='Membresías'>
        <div className='container-fluid py-4'>
          {/* Filtros */}
          <div className='row mb-4'>
            <div className='col-12'>
              <div
                className='filter-container'
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                }}
              >
                <div className='row g-2'>
                  <div className='col-12 col-md-3 col-lg-2'>
                    <div
                      className='search-icon-container'
                      style={{ position: 'relative' }}
                    >
                      <i
                        className='material-icons search-icon'
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '10px',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-muted)',
                          fontSize: '18px',
                        }}
                      >
                        search
                      </i>
                      <input
                        type='text'
                        className='form-control search-input'
                        placeholder='Buscar membresía...'
                        style={{ paddingLeft: '35px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='col-12 col-md-2 col-lg-2'>
                    <select
                      className='form-select'
                      value={nivelFilter}
                      onChange={e =>
                        setNivelFilter(
                          e.target.value === 'todos'
                            ? 'todos'
                            : parseInt(e.target.value),
                        )
                      }
                    >
                      <option value='todos'>Todos los niveles</option>
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-12 col-md-2 col-lg-2'>
                    <select
                      className='form-select'
                      value={estadoFilter}
                      onChange={e =>
                        setEstadoFilter(
                          e.target.value as 'todos' | 'activo' | 'inactivo',
                        )
                      }
                    >
                      <option value='todos'>Todos los estados</option>
                      <option value='activo'>Activo</option>
                      <option value='inactivo'>Inactivo</option>
                    </select>
                  </div>
                  <div className='col-12 col-md-2 col-lg-2'>
                    <select
                      className='form-select'
                      value={comunidadFilter}
                      onChange={e =>
                        setComunidadFilter(
                          e.target.value === 'todos'
                            ? 'todos'
                            : parseInt(e.target.value),
                        )
                      }
                    >
                      <option value='todos'>Todas las comunidades</option>
                      {comunidades.map(comunidad => (
                        <option key={comunidad.id} value={comunidad.id}>
                          {comunidad.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-12 col-md-3 col-lg-2 d-flex gap-2'>
                    <button className='btn btn-outline-primary flex-fill'>
                      <i
                        className='material-icons me-2'
                        style={{ fontSize: '16px' }}
                      >
                        filter_list
                      </i>
                      Filtrar
                    </button>
                    <Link href='/membresias/nueva' className='btn btn-primary'>
                      <i
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        add
                      </i>
                      Nueva
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vista Principal */}
          <div className='row'>
            <div className='col-12'>
              {/* Card de Estadísticas */}
              <div className='card shadow-sm mb-4'>
                <div className='card-body'>
                  <div className='row g-3'>
                    <div className='col-sm-6 col-md-3'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='membresia-icon me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>card_membership</i>
                        </div>
                        <div>
                          <div className='text-muted small'>
                            Total Membresías
                          </div>
                          <h4 className='mb-0'>{stats.total}</h4>
                        </div>
                      </div>
                    </div>
                    <div className='col-sm-6 col-md-3'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='membresia-icon me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>check_circle</i>
                        </div>
                        <div>
                          <div className='text-muted small'>Activas</div>
                          <h4 className='mb-0'>{stats.activas}</h4>
                        </div>
                      </div>
                    </div>
                    <div className='col-sm-6 col-md-3'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='membresia-icon me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-warning)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>access_time</i>
                        </div>
                        <div>
                          <div className='text-muted small'>
                            Vencen este mes
                          </div>
                          <h4 className='mb-0'>{stats.vencenEsteMes}</h4>
                        </div>
                      </div>
                    </div>
                    <div className='col-sm-6 col-md-3'>
                      <div className='d-flex align-items-center'>
                        <div
                          className='membresia-icon me-3'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-danger)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <i className='material-icons'>highlight_off</i>
                        </div>
                        <div>
                          <div className='text-muted small'>Vencidas</div>
                          <h4 className='mb-0'>{stats.vencidas}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs de vista */}
              <ul className='nav nav-tabs mb-3'>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      view_list
                    </i>
                    Lista
                  </button>
                </li>
                <li className='nav-item'>
                  <button
                    className={`nav-link ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    <i
                      className='material-icons me-1'
                      style={{ fontSize: '16px' }}
                    >
                      view_module
                    </i>
                    Tarjetas
                  </button>
                </li>
              </ul>

              {/* Vista de tabla */}
              {viewMode === 'table' && (
                <div className='card shadow-sm'>
                  <div className='table-responsive'>
                    <table className='table table-hover mb-0'>
                      <thead className='table-light'>
                        <tr>
                          <th scope='col' style={{ width: '50px' }}>
                            #
                          </th>
                          <th scope='col'>Miembro</th>
                          <th scope='col'>Nivel</th>
                          <th scope='col'>Comunidad</th>
                          <th scope='col'>Fecha Inicio</th>
                          <th scope='col'>Fecha Vencimiento</th>
                          <th scope='col'>Estado</th>
                          <th
                            scope='col'
                            className='actions-cell'
                            style={{ width: '120px' }}
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembresias.map((membresia, index) => (
                          <tr key={membresia.id}>
                            <td>{index + 1}</td>
                            <td>
                              <div className='d-flex align-items-center'>
                                <div
                                  className='avatar me-2'
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: getAvatarColor(
                                      membresia.rol_codigo,
                                    ),
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    borderRadius: '50%',
                                  }}
                                >
                                  {membresia.nombre_completo
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <div className='fw-semibold'>
                                    {membresia.nombre_completo}
                                  </div>
                                  <div className='small text-muted'>
                                    {membresia.rol_nombre}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={getTierBadgeClass(
                                  membresia.rol_codigo,
                                )}
                              >
                                {membresia.rol_nombre}
                              </span>
                            </td>
                            <td>{membresia.comunidad_nombre}</td>
                            <td>
                              {new Date(membresia.desde).toLocaleDateString()}
                            </td>
                            <td>
                              {membresia.hasta
                                ? new Date(membresia.hasta).toLocaleDateString()
                                : 'Indefinido'}
                            </td>
                            <td>
                              <span className='d-flex align-items-center'>
                                <span
                                  className={`status-icon ${getEstadoIcon(membresia.activo)}`}
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    display: 'inline-block',
                                    borderRadius: '50%',
                                    marginRight: '5px',
                                    backgroundColor: membresia.activo
                                      ? 'var(--color-success)'
                                      : 'var(--color-muted)',
                                  }}
                                />
                                {membresia.activo ? 'Activo' : 'Inactivo'}
                              </span>
                              <div
                                className='progress mt-1'
                                style={{ height: '5px' }}
                              >
                                <div
                                  className={`progress-bar ${getProgressColor(membresia.activo, membresia.hasta)}`}
                                  role='progressbar'
                                  style={{
                                    width: membresia.hasta
                                      ? `${Math.max(0, Math.min(100, ((new Date(membresia.hasta).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365)) * 100))}%`
                                      : '100%',
                                  }}
                                  aria-valuenow={
                                    membresia.hasta
                                      ? Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            ((new Date(
                                              membresia.hasta,
                                            ).getTime() -
                                              new Date().getTime()) /
                                              (1000 * 60 * 60 * 24 * 365)) *
                                              100,
                                          ),
                                        )
                                      : 100
                                  }
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className='small'>
                                {membresia.hasta
                                  ? (() => {
                                      const diasRestantes = Math.ceil(
                                        (new Date(membresia.hasta).getTime() -
                                          new Date().getTime()) /
                                          (1000 * 60 * 60 * 24),
                                      );
                                      return diasRestantes > 0
                                        ? `Vence en ${diasRestantes} días`
                                        : `Vencida hace ${Math.abs(diasRestantes)} días`;
                                    })()
                                  : 'Sin vencimiento'}
                              </span>
                            </td>
                            <td>
                              <div className='btn-group'>
                                <Link
                                  href={`/membresias/${membresia.id}/editar`}
                                  className='btn btn-sm btn-outline-primary'
                                >
                                  <i
                                    className='material-icons'
                                    style={{ fontSize: '16px' }}
                                  >
                                    visibility
                                  </i>
                                </Link>
                                <button
                                  type='button'
                                  className='btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split'
                                  data-bs-toggle='dropdown'
                                  aria-expanded='false'
                                >
                                  <span className='visually-hidden'>
                                    Toggle Dropdown
                                  </span>
                                </button>
                                <ul className='dropdown-menu dropdown-menu-end'>
                                  <li>
                                    <Link
                                      className='dropdown-item'
                                      href={`/membresias/${membresia.id}/editar`}
                                    >
                                      <i
                                        className='material-icons me-2'
                                        style={{ fontSize: '16px' }}
                                      >
                                        edit
                                      </i>
                                      Editar
                                    </Link>
                                  </li>
                                  <li>
                                    <button
                                      type='button'
                                      className='dropdown-item'
                                    >
                                      <i
                                        className='material-icons me-2'
                                        style={{ fontSize: '16px' }}
                                      >
                                        sync
                                      </i>
                                      Renovar
                                    </button>
                                  </li>
                                  <li>
                                    <hr className='dropdown-divider' />
                                  </li>
                                  <li>
                                    <button
                                      type='button'
                                      className='dropdown-item text-danger'
                                    >
                                      <i
                                        className='material-icons me-2'
                                        style={{ fontSize: '16px' }}
                                      >
                                        cancel
                                      </i>
                                      Cancelar
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

              {/* Vista de tarjetas */}
              {viewMode === 'cards' && (
                <div className='row'>
                  {filteredMembresias.map(membresia => (
                    <div
                      key={membresia.id}
                      className='col-xl-4 col-lg-6 col-md-6 mb-4'
                    >
                      <div
                        className='card h-100 membresia-card'
                        style={{
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 'var(--radius)',
                          transition:
                            'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                      >
                        <div
                          className='card-body'
                          style={{ padding: '1.25rem' }}
                        >
                          <div className='d-flex justify-content-between align-items-start mb-3'>
                            <div className='d-flex align-items-center'>
                              <div
                                className='me-3 d-flex align-items-center justify-content-center text-white'
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  backgroundColor: getAvatarColor(
                                    membresia.rol_codigo,
                                  ),
                                  fontSize: '20px',
                                }}
                              >
                                {membresia.nombre_completo
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div>
                                <h6 className='mb-1'>
                                  {membresia.nombre_completo}
                                </h6>
                                <div className='small text-muted'>
                                  {membresia.rol_nombre}
                                </div>
                              </div>
                            </div>
                            <span
                              className={getTierBadgeClass(
                                membresia.rol_codigo,
                              )}
                            >
                              {membresia.rol_nombre}
                            </span>
                          </div>

                          <div className='mb-3'>
                            <div className='small text-muted mb-1'>
                              Comunidad
                            </div>
                            <div>{membresia.comunidad_nombre}</div>
                          </div>

                          <div className='mb-3'>
                            <div className='small text-muted mb-1'>
                              Vigencia
                            </div>
                            <div>
                              {new Date(membresia.desde).toLocaleDateString()} -{' '}
                              {membresia.hasta
                                ? new Date(membresia.hasta).toLocaleDateString()
                                : 'Indefinido'}
                            </div>
                          </div>

                          <div className='mb-3'>
                            <div className='d-flex justify-content-between align-items-center mb-1'>
                              <span className='small text-muted'>Estado</span>
                              <span className='small'>
                                {membresia.hasta
                                  ? (() => {
                                      const diasRestantes = Math.ceil(
                                        (new Date(membresia.hasta).getTime() -
                                          new Date().getTime()) /
                                          (1000 * 60 * 60 * 24),
                                      );
                                      return diasRestantes > 0
                                        ? `${diasRestantes} días restantes`
                                        : `Vencida hace ${Math.abs(diasRestantes)} días`;
                                    })()
                                  : 'Sin vencimiento'}
                              </span>
                            </div>
                            <div
                              className='progress'
                              style={{ height: '8px', borderRadius: '4px' }}
                            >
                              <div
                                className={`progress-bar ${getProgressColor(membresia.activo, membresia.hasta)}`}
                                role='progressbar'
                                style={{
                                  width: membresia.hasta
                                    ? `${Math.max(0, Math.min(100, ((new Date(membresia.hasta).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365)) * 100))}%`
                                    : '100%',
                                }}
                                aria-valuenow={
                                  membresia.hasta
                                    ? Math.max(
                                        0,
                                        Math.min(
                                          100,
                                          ((new Date(
                                            membresia.hasta,
                                          ).getTime() -
                                            new Date().getTime()) /
                                            (1000 * 60 * 60 * 24 * 365)) *
                                            100,
                                        ),
                                      )
                                    : 100
                                }
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>

                          <div className='d-flex justify-content-between align-items-center'>
                            <div className='d-flex align-items-center'>
                              <span
                                className='me-2'
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: membresia.activo
                                    ? 'var(--color-success)'
                                    : 'var(--color-muted)',
                                }}
                              />
                              <span className='small'>
                                {membresia.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>

                          <div className='d-flex gap-2 mt-3'>
                            <Link
                              href={`/membresias/${membresia.id}/editar`}
                              className='btn btn-outline-primary btn-sm flex-fill'
                            >
                              <i
                                className='material-icons me-1'
                                style={{ fontSize: '16px' }}
                              >
                                visibility
                              </i>
                              Ver Detalle
                            </Link>
                            <button className='btn btn-outline-secondary btn-sm'>
                              <i
                                className='material-icons'
                                style={{ fontSize: '16px' }}
                              >
                                more_vert
                              </i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paginación */}
              <nav className='mt-4'>
                <ul className='pagination justify-content-center'>
                  <li className='page-item disabled'>
                    <button
                      type='button'
                      className='page-link'
                      tabIndex={-1}
                      aria-disabled='true'
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '16px' }}
                      >
                        chevron_left
                      </i>
                    </button>
                  </li>
                  <li className='page-item active'>
                    <button type='button' className='page-link'>
                      1
                    </button>
                  </li>
                  <li className='page-item'>
                    <button type='button' className='page-link'>
                      2
                    </button>
                  </li>
                  <li className='page-item'>
                    <button type='button' className='page-link'>
                      3
                    </button>
                  </li>
                  <li className='page-item'>
                    <button type='button' className='page-link'>
                      <i
                        className='material-icons'
                        style={{ fontSize: '16px' }}
                      >
                        chevron_right
                      </i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <style jsx>{`
          .tier-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .tier-basic {
            background-color: #e9ecef;
            color: #495057;
          }

          .tier-standard {
            background-color: #cff4fc;
            color: #055160;
          }

          .tier-premium {
            background-color: #fff3cd;
            color: #664d03;
          }

          .tier-vip {
            background: linear-gradient(45deg, #f6d365 0%, #fda085 100%);
            color: #212529;
          }

          .membresia-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1) !important;
          }
        `}</style>
      </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
};

export default MembresiasListado;
