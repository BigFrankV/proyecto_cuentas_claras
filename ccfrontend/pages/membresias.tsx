import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface Membresia {
  id: string;
  miembro: {
    nombre: string;
    tipo: string;
    unidades: number;
    avatar: string;
  };
  nivel: 'Básico' | 'Estándar' | 'Premium' | 'VIP';
  comunidad: string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'Activo' | 'Pendiente' | 'Vencido' | 'Inactivo';
  progreso: number;
  diasVencimiento: number;
}

const mockMembresias: Membresia[] = [
  {
    id: '1',
    miembro: {
      nombre: 'Juan Delgado',
      tipo: 'Propietario',
      unidades: 2,
      avatar: 'JD'
    },
    nivel: 'Estándar',
    comunidad: 'Parque Real',
    fechaInicio: '01/01/2023',
    fechaVencimiento: '31/12/2023',
    estado: 'Activo',
    progreso: 75,
    diasVencimiento: 107
  },
  {
    id: '2',
    miembro: {
      nombre: 'María López',
      tipo: 'Inquilina',
      unidades: 1,
      avatar: 'ML'
    },
    nivel: 'Básico',
    comunidad: 'Torres del Bosque',
    fechaInicio: '15/03/2023',
    fechaVencimiento: '15/03/2024',
    estado: 'Activo',
    progreso: 50,
    diasVencimiento: 181
  },
  {
    id: '3',
    miembro: {
      nombre: 'Carlos Ramírez',
      tipo: 'Administrador',
      unidades: 0,
      avatar: 'CR'
    },
    nivel: 'Premium',
    comunidad: 'Edificio Las Heras',
    fechaInicio: '05/06/2023',
    fechaVencimiento: '05/06/2024',
    estado: 'Activo',
    progreso: 40,
    diasVencimiento: 225
  },
  {
    id: '4',
    miembro: {
      nombre: 'Ana Martínez',
      tipo: 'Propietaria',
      unidades: 1,
      avatar: 'AM'
    },
    nivel: 'VIP',
    comunidad: 'Parque Real',
    fechaInicio: '10/08/2023',
    fechaVencimiento: '10/08/2024',
    estado: 'Pendiente',
    progreso: 25,
    diasVencimiento: 289
  },
  {
    id: '5',
    miembro: {
      nombre: 'Pedro Vásquez',
      tipo: 'Inquilino',
      unidades: 1,
      avatar: 'PV'
    },
    nivel: 'Básico',
    comunidad: 'Torres del Bosque',
    fechaInicio: '20/02/2023',
    fechaVencimiento: '20/02/2024',
    estado: 'Vencido',
    progreso: 100,
    diasVencimiento: -45
  }
];

export default function MembresiasListado() {
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelFilter, setNivelFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtrado de membresías
  const filteredMembresias = useMemo(() => {
    return mockMembresias.filter(membresia => {
      const matchesSearch = membresia.miembro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           membresia.comunidad.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNivel = nivelFilter === 'todos' || 
                          (nivelFilter === 'basico' && membresia.nivel === 'Básico') ||
                          (nivelFilter === 'estandar' && membresia.nivel === 'Estándar') ||
                          (nivelFilter === 'premium' && membresia.nivel === 'Premium') ||
                          (nivelFilter === 'vip' && membresia.nivel === 'VIP');
      
      const matchesEstado = estadoFilter === 'todos' || 
                           (estadoFilter === 'activo' && membresia.estado === 'Activo') ||
                           (estadoFilter === 'pendiente' && membresia.estado === 'Pendiente') ||
                           (estadoFilter === 'vencido' && membresia.estado === 'Vencido') ||
                           (estadoFilter === 'inactivo' && membresia.estado === 'Inactivo');
      
      return matchesSearch && matchesNivel && matchesEstado;
    });
  }, [searchTerm, nivelFilter, estadoFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = mockMembresias.length;
    const activas = mockMembresias.filter(m => m.estado === 'Activo').length;
    const vencenEsteMes = mockMembresias.filter(m => m.diasVencimiento <= 30 && m.diasVencimiento > 0).length;
    const vencidas = mockMembresias.filter(m => m.estado === 'Vencido').length;
    
    return { total, activas, vencenEsteMes, vencidas };
  }, []);

  const getTierBadgeClass = (nivel: string) => {
    const classes = {
      'Básico': 'tier-basic',
      'Estándar': 'tier-standard',
      'Premium': 'tier-premium',
      'VIP': 'tier-vip'
    };
    return `tier-badge ${classes[nivel as keyof typeof classes] || 'tier-basic'}`;
  };

  const getEstadoIcon = (estado: string) => {
    const icons = {
      'Activo': 'status-activo',
      'Pendiente': 'status-pendiente',
      'Vencido': 'status-vencido',
      'Inactivo': 'status-inactivo'
    };
    return icons[estado as keyof typeof icons] || 'status-inactivo';
  };

  const getProgressColor = (estado: string, diasVencimiento: number) => {
    if (estado === 'Vencido') return 'bg-danger';
    if (diasVencimiento <= 30) return 'bg-warning';
    return 'bg-success';
  };

  const getAvatarColor = (tipo: string) => {
    const colors = {
      'Propietario': 'var(--color-primary)',
      'Propietaria': 'var(--color-primary)',
      'Inquilino': 'var(--color-info)',
      'Inquilina': 'var(--color-info)',
      'Administrador': 'var(--color-warning)'
    };
    return colors[tipo as keyof typeof colors] || 'var(--color-primary)';
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Membresías — Cuentas Claras</title>
      </Head>

      <Layout title='Membresías'>
        <div className='container-fluid py-4'>
          {/* Filtros */}
          <div className='row mb-4'>
            <div className='col-12'>
              <div className='filter-container' style={{ backgroundColor: '#f8f9fa', borderRadius: 'var(--radius)', padding: '1rem' }}>
                <div className='row g-2'>
                  <div className='col-12 col-md-4 col-lg-3'>
                    <div className='search-icon-container' style={{ position: 'relative' }}>
                      <i className='material-icons search-icon' style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '10px', 
                        transform: 'translateY(-50%)', 
                        color: 'var(--color-muted)', 
                        fontSize: '18px' 
                      }}>search</i>
                      <input 
                        type='text' 
                        className='form-control search-input' 
                        placeholder='Buscar membresía...'
                        style={{ paddingLeft: '35px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='col-12 col-md-3 col-lg-2'>
                    <select 
                      className='form-select'
                      value={nivelFilter}
                      onChange={(e) => setNivelFilter(e.target.value)}
                    >
                      <option value='todos'>Todos los niveles</option>
                      <option value='basico'>Básico</option>
                      <option value='estandar'>Estándar</option>
                      <option value='premium'>Premium</option>
                      <option value='vip'>VIP</option>
                    </select>
                  </div>
                  <div className='col-12 col-md-3 col-lg-2'>
                    <select 
                      className='form-select'
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                    >
                      <option value='todos'>Todos los estados</option>
                      <option value='activo'>Activo</option>
                      <option value='pendiente'>Pendiente</option>
                      <option value='vencido'>Vencido</option>
                      <option value='inactivo'>Inactivo</option>
                    </select>
                  </div>
                  <div className='col-12 col-md-2 col-lg-2 d-flex gap-2'>
                    <button className='btn btn-outline-primary flex-fill'>
                      <i className='material-icons me-2' style={{ fontSize: '16px' }}>filter_list</i>
                      Filtrar
                    </button>
                    <Link href='/membresias/nueva' className='btn btn-primary'>
                      <i className='material-icons me-1' style={{ fontSize: '16px' }}>add</i>
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
                        <div className='membresia-icon me-3' style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className='material-icons'>card_membership</i>
                        </div>
                        <div>
                          <div className='text-muted small'>Total Membresías</div>
                          <h4 className='mb-0'>{stats.total}</h4>
                        </div>
                      </div>
                    </div>
                    <div className='col-sm-6 col-md-3'>
                      <div className='d-flex align-items-center'>
                        <div className='membresia-icon me-3' style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-success)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
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
                        <div className='membresia-icon me-3' style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-warning)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className='material-icons'>access_time</i>
                        </div>
                        <div>
                          <div className='text-muted small'>Vencen este mes</div>
                          <h4 className='mb-0'>{stats.vencenEsteMes}</h4>
                        </div>
                      </div>
                    </div>
                    <div className='col-sm-6 col-md-3'>
                      <div className='d-flex align-items-center'>
                        <div className='membresia-icon me-3' style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-danger)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
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
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>view_list</i>
                    Lista
                  </button>
                </li>
                <li className='nav-item'>
                  <button 
                    className={`nav-link ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    <i className='material-icons me-1' style={{ fontSize: '16px' }}>view_module</i>
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
                          <th scope='col' style={{ width: '50px' }}>#</th>
                          <th scope='col'>Miembro</th>
                          <th scope='col'>Nivel</th>
                          <th scope='col'>Comunidad</th>
                          <th scope='col'>Fecha Inicio</th>
                          <th scope='col'>Fecha Vencimiento</th>
                          <th scope='col'>Estado</th>
                          <th scope='col' className='actions-cell' style={{ width: '120px' }}>Acciones</th>
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
                                    backgroundColor: getAvatarColor(membresia.miembro.tipo),
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    borderRadius: '50%'
                                  }}
                                >
                                  {membresia.miembro.avatar}
                                </div>
                                <div>
                                  <div className='fw-semibold'>{membresia.miembro.nombre}</div>
                                  <div className='small text-muted'>
                                    {membresia.miembro.tipo} - {membresia.miembro.unidades} unidad{membresia.miembro.unidades !== 1 ? 'es' : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={getTierBadgeClass(membresia.nivel)}>
                                {membresia.nivel}
                              </span>
                            </td>
                            <td>{membresia.comunidad}</td>
                            <td>{membresia.fechaInicio}</td>
                            <td>{membresia.fechaVencimiento}</td>
                            <td>
                              <span className='d-flex align-items-center'>
                                <span 
                                  className={`status-icon ${getEstadoIcon(membresia.estado)}`}
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    display: 'inline-block',
                                    borderRadius: '50%',
                                    marginRight: '5px',
                                    backgroundColor: membresia.estado === 'Activo' ? 'var(--color-success)' :
                                                   membresia.estado === 'Pendiente' ? 'var(--color-warning)' :
                                                   membresia.estado === 'Vencido' ? 'var(--color-danger)' :
                                                   'var(--color-muted)'
                                  }}
                                />
                                {membresia.estado}
                              </span>
                              <div className='progress mt-1' style={{ height: '5px' }}>
                                <div 
                                  className={`progress-bar ${getProgressColor(membresia.estado, membresia.diasVencimiento)}`}
                                  role='progressbar'
                                  style={{ width: `${membresia.progreso}%` }}
                                  aria-valuenow={membresia.progreso}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className='small'>
                                {membresia.diasVencimiento > 0 
                                  ? `Vence en ${membresia.diasVencimiento} días`
                                  : `Vencida hace ${Math.abs(membresia.diasVencimiento)} días`
                                }
                              </span>
                            </td>
                            <td>
                              <div className='btn-group'>
                                <Link href={`/membresias/${membresia.id}/editar`} className='btn btn-sm btn-outline-primary'>
                                  <i className='material-icons' style={{ fontSize: '16px' }}>visibility</i>
                                </Link>
                                <button 
                                  type='button' 
                                  className='btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split' 
                                  data-bs-toggle='dropdown' 
                                  aria-expanded='false'
                                >
                                  <span className='visually-hidden'>Toggle Dropdown</span>
                                </button>
                                <ul className='dropdown-menu dropdown-menu-end'>
                                  <li>
                                    <Link className='dropdown-item' href={`/membresias/${membresia.id}/editar`}>
                                      <i className='material-icons me-2' style={{ fontSize: '16px' }}>edit</i>
                                      Editar
                                    </Link>
                                  </li>
                                  <li>
                                    <a className='dropdown-item' href='#'>
                                      <i className='material-icons me-2' style={{ fontSize: '16px' }}>sync</i>
                                      Renovar
                                    </a>
                                  </li>
                                  <li><hr className='dropdown-divider' /></li>
                                  <li>
                                    <a className='dropdown-item text-danger' href='#'>
                                      <i className='material-icons me-2' style={{ fontSize: '16px' }}>cancel</i>
                                      Cancelar
                                    </a>
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
                  {filteredMembresias.map((membresia) => (
                    <div key={membresia.id} className='col-xl-4 col-lg-6 col-md-6 mb-4'>
                      <div className='card h-100 membresia-card' style={{ 
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 'var(--radius)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}>
                        <div className='card-body' style={{ padding: '1.25rem' }}>
                          <div className='d-flex justify-content-between align-items-start mb-3'>
                            <div className='d-flex align-items-center'>
                              <div 
                                className='me-3 d-flex align-items-center justify-content-center text-white'
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  backgroundColor: getAvatarColor(membresia.miembro.tipo),
                                  fontSize: '20px'
                                }}
                              >
                                {membresia.miembro.avatar}
                              </div>
                              <div>
                                <h6 className='mb-1'>{membresia.miembro.nombre}</h6>
                                <div className='small text-muted'>
                                  {membresia.miembro.tipo} - {membresia.miembro.unidades} unidad{membresia.miembro.unidades !== 1 ? 'es' : ''}
                                </div>
                              </div>
                            </div>
                            <span className={getTierBadgeClass(membresia.nivel)}>
                              {membresia.nivel}
                            </span>
                          </div>
                          
                          <div className='mb-3'>
                            <div className='small text-muted mb-1'>Comunidad</div>
                            <div>{membresia.comunidad}</div>
                          </div>
                          
                          <div className='mb-3'>
                            <div className='small text-muted mb-1'>Vigencia</div>
                            <div>{membresia.fechaInicio} - {membresia.fechaVencimiento}</div>
                          </div>
                          
                          <div className='mb-3'>
                            <div className='d-flex justify-content-between align-items-center mb-1'>
                              <span className='small text-muted'>Estado</span>
                              <span className='small'>
                                {membresia.diasVencimiento > 0 
                                  ? `${membresia.diasVencimiento} días restantes`
                                  : `Vencida hace ${Math.abs(membresia.diasVencimiento)} días`
                                }
                              </span>
                            </div>
                            <div className='progress' style={{ height: '8px', borderRadius: '4px' }}>
                              <div 
                                className={`progress-bar ${getProgressColor(membresia.estado, membresia.diasVencimiento)}`}
                                role='progressbar'
                                style={{ width: `${membresia.progreso}%` }}
                                aria-valuenow={membresia.progreso}
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
                                  backgroundColor: membresia.estado === 'Activo' ? 'var(--color-success)' :
                                                 membresia.estado === 'Pendiente' ? 'var(--color-warning)' :
                                                 membresia.estado === 'Vencido' ? 'var(--color-danger)' :
                                                 'var(--color-muted)'
                                }}
                              />
                              <span className='small'>{membresia.estado}</span>
                            </div>
                          </div>
                          
                          <div className='d-flex gap-2 mt-3'>
                            <Link href={`/membresias/${membresia.id}/editar`} className='btn btn-outline-primary btn-sm flex-fill'>
                              <i className='material-icons me-1' style={{ fontSize: '16px' }}>visibility</i>
                              Ver Detalle
                            </Link>
                            <button className='btn btn-outline-secondary btn-sm'>
                              <i className='material-icons' style={{ fontSize: '16px' }}>more_vert</i>
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
                    <a className='page-link' href='#' tabIndex={-1} aria-disabled='true'>
                      <i className='material-icons' style={{ fontSize: '16px' }}>chevron_left</i>
                    </a>
                  </li>
                  <li className='page-item active'><a className='page-link' href='#'>1</a></li>
                  <li className='page-item'><a className='page-link' href='#'>2</a></li>
                  <li className='page-item'><a className='page-link' href='#'>3</a></li>
                  <li className='page-item'>
                    <a className='page-link' href='#'>
                      <i className='material-icons' style={{ fontSize: '16px' }}>chevron_right</i>
                    </a>
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
            box-shadow: 0 10px 15px rgba(0,0,0,0.1) !important;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
