import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import {
  getTorresListado,
  getEstadisticasEdificio,
  EstadisticasEdificio,
} from '@/lib/torresService';
import { ProtectedRoute } from '@/lib/useAuth';

interface TorreView {
  id: string;
  nombre: string;
  codigo: string;
  pisos: number;
  unidades: number;
  unidadesOcupadas: number;
  estado: 'Activa' | 'Inactiva' | 'Mantenimiento';
  fechaCreacion: string;
  imagen?: string | undefined;
}

export default function TorresListado() {
  const [torres, setTorres] = useState<TorreView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre-asc');
  const [filterBy, setFilterBy] = useState('todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedTorres, setSelectedTorres] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState<EstadisticasEdificio>({
    totalTorres: 0,
    totalUnidades: 0,
    promedioUnidadesPorTorre: 0,
    totalUnidadesOcupadas: 0,
    totalUnidadesVacantes: 0,
  });

  // TODO: Obtener edificioId dinámicamente (desde router o contexto)
  const edificioId = 1;

  // Cargar torres y estadísticas
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar torres y estadísticas en paralelo
        const [torresData, estadisticas] = await Promise.all([
          getTorresListado(edificioId),
          getEstadisticasEdificio(edificioId),
        ]);

        // Transformar datos de la API al formato del componente
        const torresView: TorreView[] = torresData.map(torre => ({
          id: String(torre.id),
          nombre: torre.nombre,
          codigo: torre.codigo,
          pisos: torre.numPisos || 0,
          unidades: torre.totalUnidades || 0,
          unidadesOcupadas: torre.unidadesOcupadas || 0,
          estado: 'Activa', // TODO: Agregar campo estado en la API
          fechaCreacion: torre.fechaCreacion || '',
          imagen: undefined, // TODO: Agregar campo imagen en la API
        }));

        setTorres(torresView);
        setStats(estadisticas);
      } catch (err) {
        console.error('Error cargando torres:', err);
        setError(
          'No se pudieron cargar las torres. Por favor, intente nuevamente.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [edificioId]);

  // Funciones de filtrado y ordenamiento
  const filteredAndSortedTorres = useMemo(() => {
    const filtered = torres.filter(torre => {
      const matchesSearch =
        torre.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torre.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterBy === 'todas' ||
        torre.nombre.toLowerCase().includes(filterBy.toLowerCase());
      return matchesSearch && matchesFilter;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nombre-asc':
          return a.nombre.localeCompare(b.nombre);
        case 'nombre-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'unidades-desc':
          return b.unidades - a.unidades;
        case 'unidades-asc':
          return a.unidades - b.unidades;
        default:
          return 0;
      }
    });

    return filtered;
  }, [torres, searchTerm, sortBy, filterBy]);

  // Manejo de selección
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTorres(filteredAndSortedTorres.map(torre => torre.id));
    } else {
      setSelectedTorres([]);
    }
  };

  const handleSelectTorre = (torreId: string, checked: boolean) => {
    if (checked) {
      setSelectedTorres([...selectedTorres, torreId]);
    } else {
      setSelectedTorres(selectedTorres.filter(id => id !== torreId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEstadoBadgeClass = (estado: TorreView['estado']) => {
    switch (estado) {
      case 'Activa':
        return 'bg-success';
      case 'Inactiva':
        return 'bg-danger';
      case 'Mantenimiento':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Torres'>
          <div className='container-fluid py-4'>
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2'>Cargando torres...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout title='Torres'>
          <div className='container-fluid py-4'>
            <div className='alert alert-danger' role='alert'>
              <i className='material-icons align-middle me-2'>error</i>
              {error}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Torres — Cuentas Claras</title>
      </Head>

      <Layout title='Torres'>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/dashboard'>Dashboard</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/edificios'>Edificios</Link>
              </li>
              <li className='breadcrumb-item'>
                <Link href='/edificios/1'>Edificio Central</Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                Torres
              </li>
            </ol>
          </nav>

          {/* Información del Edificio */}
          <div className='card mb-4' style={{ backgroundColor: '#f8f9fa' }}>
            <div className='card-body'>
              <div className='row align-items-center'>
                <div className='col-md-9'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--color-primary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i
                        className='material-icons text-white'
                        style={{ fontSize: '36px' }}
                      >
                        business
                      </i>
                    </div>
                    <div>
                      <h4 className='mb-0'>Edificio Central</h4>
                      <p className='text-muted mb-0'>
                        Av. Principal 123, Santiago
                      </p>
                      <div className='mt-1'>
                        <span className='badge bg-info me-1'>
                          {stats.totalTorres} Torres
                        </span>
                        <span className='badge bg-secondary'>
                          {stats.totalUnidades} Unidades
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-md-3 text-md-end mt-3 mt-md-0'>
                  <Link
                    href='/edificios/1'
                    className='btn btn-outline-secondary me-1'
                  >
                    <i className='material-icons align-middle me-1'>
                      arrow_back
                    </i>
                    Volver
                  </Link>
                  <Link href='/torres/nueva' className='btn btn-primary'>
                    <i className='material-icons align-middle me-1'>add</i>
                    Nueva Torre
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y acciones */}
          <div className='row mb-4'>
            <div className='col-lg-8'>
              <div className='card'>
                <div
                  className='card-body'
                  style={{ backgroundColor: '#f8f9fa' }}
                >
                  <div className='row g-2'>
                    <div className='col-md-4'>
                      <div className='position-relative'>
                        <i
                          className='material-icons position-absolute'
                          style={{
                            top: '50%',
                            left: '10px',
                            transform: 'translateY(-50%)',
                            color: '#6c757d',
                            fontSize: '20px',
                          }}
                        >
                          search
                        </i>
                        <input
                          type='text'
                          className='form-control'
                          placeholder='Buscar torre...'
                          style={{ paddingLeft: '35px' }}
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <select
                        className='form-select'
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                      >
                        <option value='nombre-asc'>Nombre (A-Z)</option>
                        <option value='nombre-desc'>Nombre (Z-A)</option>
                        <option value='unidades-desc'>Más unidades</option>
                        <option value='unidades-asc'>Menos unidades</option>
                      </select>
                    </div>
                    <div className='col-md-4'>
                      <select
                        className='form-select'
                        value={filterBy}
                        onChange={e => setFilterBy(e.target.value)}
                      >
                        <option value='todas'>Todas las torres</option>
                        <option value='norte'>Torre Norte</option>
                        <option value='sur'>Torre Sur</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4 d-flex justify-content-end align-items-start'>
              <div className='dropdown'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  data-bs-toggle='dropdown'
                >
                  <i className='material-icons align-middle me-1'>
                    file_download
                  </i>
                  Exportar
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <button type="button" className='dropdown-item'>
                      Excel
                    </button>
                  </li>
                  <li>
                    <button type="button" className='dropdown-item'>
                      PDF
                    </button>
                  </li>
                  <li>
                    <button type="button" className='dropdown-item'>
                      CSV
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='row mb-4'>
            <div className='col-lg-4 col-md-6 mb-3'>
              <div className='card h-100'>
                <div className='card-body'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
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
                      <i className='material-icons'>location_city</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats.totalTorres}</div>
                      <div className='text-muted'>Total Torres</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4 col-md-6 mb-3'>
              <div className='card h-100'>
                <div className='card-body'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>apartment</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats.totalUnidades}</div>
                      <div className='text-muted'>Total Unidades</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-lg-4 col-md-6 mb-3'>
              <div className='card h-100'>
                <div className='card-body'>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
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
                      <i className='material-icons'>grid_view</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>
                        {stats.promedioUnidadesPorTorre}
                      </div>
                      <div className='text-muted'>Promedio Unidades</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de vista */}
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h5 className='mb-0'>
              {viewMode === 'table' ? 'Vista de tabla' : 'Vista de tarjetas'}
            </h5>
            <div className='btn-group' role='group'>
              <button
                type='button'
                className={`btn btn-outline-secondary ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <i className='material-icons'>grid_view</i>
              </button>
              <button
                type='button'
                className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <i className='material-icons'>view_list</i>
              </button>
            </div>
          </div>

          {/* Vista de tabla */}
          {viewMode === 'table' && (
            <div className='card shadow-sm mb-4'>
              <div className='card-header bg-white d-flex justify-content-between align-items-center'>
                <h5 className='card-title mb-0'>Torres</h5>
                <div className='dropdown'>
                  <button
                    className='btn btn-sm btn-outline-secondary dropdown-toggle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    Acciones
                  </button>
                  <ul className='dropdown-menu'>
                    <li>
                      <button type="button" className='dropdown-item'>
                        Exportar a Excel
                      </button>
                    </li>
                    <li>
                      <button type="button" className='dropdown-item'>
                        Imprimir listado
                      </button>
                    </li>
                    <li>
                      <hr className='dropdown-divider' />
                    </li>
                    <li>
                      <button type="button" className='dropdown-item text-danger'>
                        Eliminar seleccionadas
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th scope='col' style={{ width: '40px' }}>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id='selectAllCheckbox'
                              checked={
                                selectedTorres.length ===
                                  filteredAndSortedTorres.length &&
                                filteredAndSortedTorres.length > 0
                              }
                              onChange={e => handleSelectAll(e.target.checked)}
                            />
                          </div>
                        </th>
                        <th scope='col'>Nombre</th>
                        <th scope='col'>Código</th>
                        <th scope='col'>Pisos</th>
                        <th scope='col'>Unidades</th>
                        <th scope='col'>Estado</th>
                        <th scope='col' className='text-end'>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedTorres.map(torre => (
                        <tr key={torre.id}>
                          <td>
                            <div className='form-check'>
                              <input
                                className='form-check-input'
                                type='checkbox'
                                checked={selectedTorres.includes(torre.id)}
                                onChange={e =>
                                  handleSelectTorre(torre.id, e.target.checked)
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div
                                className='me-3'
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  background: '#f1f3f4',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <i className='material-icons text-secondary'>
                                  location_city
                                </i>
                              </div>
                              <div>
                                <div className='fw-medium'>{torre.nombre}</div>
                                <div className='small text-muted'>
                                  Creada el {formatDate(torre.fechaCreacion)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{torre.codigo}</td>
                          <td>{torre.pisos}</td>
                          <td>
                            <span className='badge bg-secondary'>
                              {torre.unidades} unidades
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${getEstadoBadgeClass(torre.estado)}`}
                            >
                              {torre.estado}
                            </span>
                          </td>
                          <td className='text-end'>
                            <div className='btn-group'>
                              <Link
                                href={`/torres/${torre.id}`}
                                className='btn btn-sm btn-outline-secondary'
                              >
                                <i
                                  className='material-icons'
                                  style={{ fontSize: '16px' }}
                                >
                                  visibility
                                </i>
                              </Link>
                              <Link
                                href={`/torres/${torre.id}`}
                                className='btn btn-sm btn-outline-primary'
                              >
                                <i
                                  className='material-icons'
                                  style={{ fontSize: '16px' }}
                                >
                                  edit
                                </i>
                              </Link>
                              <button
                                type='button'
                                className='btn btn-sm btn-outline-danger'
                              >
                                <i
                                  className='material-icons'
                                  style={{ fontSize: '16px' }}
                                >
                                  delete
                                </i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='card-footer bg-white'>
                <div className='row align-items-center'>
                  <div className='col-auto'>
                    <select
                      className='form-select form-select-sm'
                      value={itemsPerPage}
                      onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                      <option value={100}>100 por página</option>
                    </select>
                  </div>
                  <div className='col-auto'>
                    <span className='text-muted'>
                      Mostrando 1-{filteredAndSortedTorres.length} de{' '}
                      {filteredAndSortedTorres.length} torres
                    </span>
                  </div>
                  <div className='col d-flex justify-content-end'>
                    <nav aria-label='Page navigation'>
                      <ul className='pagination pagination-sm mb-0'>
                        <li className='page-item disabled'>
                          <button
                            type="button"
                            className='page-link'
                            disabled
                            aria-label='Previous'
                          >
                            <span aria-hidden='true'>&laquo;</span>
                          </button>
                        </li>
                        <li className='page-item active'>
                          <button type="button" className='page-link'>
                            1
                          </button>
                        </li>
                        <li className='page-item disabled'>
                          <button
                            type="button"
                            className='page-link'
                            disabled
                            aria-label='Next'
                          >
                            <span aria-hidden='true'>&raquo;</span>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vista de tarjetas */}
          {viewMode === 'cards' && (
            <div className='row'>
              {filteredAndSortedTorres.map(torre => (
                <div key={torre.id} className='col-xl-4 col-lg-6 col-md-6 mb-4'>
                  <div
                    className='card h-100 torre-card'
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    <div className='position-relative'>
                      <img
                        src={torre.imagen}
                        className='card-img-top'
                        alt={torre.nombre}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div
                        className='position-absolute'
                        style={{ top: '10px', right: '10px', opacity: 0 }}
                        onMouseEnter={e =>
                          (e.currentTarget.style.opacity = '1')
                        }
                        onMouseLeave={e =>
                          (e.currentTarget.style.opacity = '0')
                        }
                      >
                        <div className='btn-group'>
                          <Link
                            href={`/torres/${torre.id}`}
                            className='btn btn-sm btn-light'
                          >
                            <i
                              className='material-icons'
                              style={{ fontSize: '16px' }}
                            >
                              edit
                            </i>
                          </Link>
                          <button
                            type='button'
                            className='btn btn-sm btn-light'
                          >
                            <i
                              className='material-icons'
                              style={{ fontSize: '16px' }}
                            >
                              delete
                            </i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className='card-body'>
                      <div className='d-flex justify-content-between align-items-start mb-2'>
                        <h5 className='card-title mb-0'>{torre.nombre}</h5>
                        <span
                          className={`badge ${getEstadoBadgeClass(torre.estado)}`}
                        >
                          {torre.estado}
                        </span>
                      </div>
                      <p className='card-text text-muted mb-2'>
                        Código: {torre.codigo}
                      </p>
                      <div className='row text-center mb-3'>
                        <div className='col-4'>
                          <div className='h6 mb-0'>{torre.pisos}</div>
                          <small className='text-muted'>Pisos</small>
                        </div>
                        <div className='col-4'>
                          <div className='h6 mb-0'>{torre.unidades}</div>
                          <small className='text-muted'>Unidades</small>
                        </div>
                        <div className='col-4'>
                          <div className='h6 mb-0'>100%</div>
                          <small className='text-muted'>Ocupación</small>
                        </div>
                      </div>
                      <div className='d-flex justify-content-between'>
                        <Link
                          href={`/torres/${torre.id}`}
                          className='btn btn-outline-primary btn-sm'
                        >
                          <i
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            visibility
                          </i>
                          Ver detalle
                        </Link>
                        <Link
                          href={`/torres/${torre.id}`}
                          className='btn btn-primary btn-sm'
                        >
                          <i
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            edit
                          </i>
                          Editar
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón flotante para agregar nueva torre */}
          <Link
            href='/torres/nueva'
            className='btn btn-primary position-fixed'
            style={{
              bottom: '20px',
              right: '20px',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
            }}
          >
            <i className='material-icons'>add</i>
          </Link>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
