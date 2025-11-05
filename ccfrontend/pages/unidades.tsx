import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute } from '@/lib/useAuth';

interface Unidad {
  id: string;
  numero: string;
  piso: number;
  torre: string;
  edificio: string;
  comunidad: string;
  tipo: 'Departamento' | 'Casa' | 'Local' | 'Oficina';
  superficie: number;
  dormitorios: number;
  banos: number;
  estado: 'Activa' | 'Inactiva' | 'Mantenimiento';
  propietario?: string;
  residente?: string;
  saldoPendiente: number;
  ultimoPago?: string;
  fechaCreacion: string;
}

const mockUnidades: Unidad[] = [
  {
    id: '1',
    numero: 'A-101',
    piso: 1,
    torre: 'Torre A',
    edificio: 'Edificio Norte',
    comunidad: 'Las Palmas',
    tipo: 'Departamento',
    superficie: 78.5,
    dormitorios: 3,
    banos: 2,
    estado: 'Activa',
    propietario: 'Juan Ramírez',
    residente: 'Juan Ramírez',
    saldoPendiente: 256800,
    ultimoPago: '2023-08-15',
    fechaCreacion: '2021-03-15',
  },
  {
    id: '2',
    numero: 'A-102',
    piso: 1,
    torre: 'Torre A',
    edificio: 'Edificio Norte',
    comunidad: 'Las Palmas',
    tipo: 'Departamento',
    superficie: 85.2,
    dormitorios: 3,
    banos: 2,
    estado: 'Activa',
    propietario: 'María González',
    residente: 'Carlos Pérez',
    saldoPendiente: 0,
    ultimoPago: '2023-09-01',
    fechaCreacion: '2021-04-20',
  },
  {
    id: '3',
    numero: 'A-201',
    piso: 2,
    torre: 'Torre A',
    edificio: 'Edificio Norte',
    comunidad: 'Las Palmas',
    tipo: 'Departamento',
    superficie: 78.5,
    dormitorios: 3,
    banos: 2,
    estado: 'Inactiva',
    propietario: 'Luis Martínez',
    saldoPendiente: 450000,
    fechaCreacion: '2021-05-10',
  },
  {
    id: '4',
    numero: 'B-101',
    piso: 1,
    torre: 'Torre B',
    edificio: 'Torre Central',
    comunidad: 'Edificio Central',
    tipo: 'Departamento',
    superficie: 92.0,
    dormitorios: 4,
    banos: 3,
    estado: 'Activa',
    propietario: 'Ana Silva',
    residente: 'Ana Silva',
    saldoPendiente: 125000,
    ultimoPago: '2023-08-30',
    fechaCreacion: '2020-11-15',
  },
  {
    id: '5',
    numero: 'C-301',
    piso: 3,
    torre: 'Torre C',
    edificio: 'Jardines del Este',
    comunidad: 'Jardines del Este',
    tipo: 'Casa',
    superficie: 120.0,
    dormitorios: 4,
    banos: 3,
    estado: 'Mantenimiento',
    propietario: 'Roberto Torres',
    saldoPendiente: 320000,
    fechaCreacion: '2022-01-08',
  },
];

export default function UnidadesListado() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filteredUnidades, setFilteredUnidades] = useState<Unidad[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    comunidad: '',
    edificio: '',
    torre: '',
    estado: '',
    tipo: '',
  });
  const [selectedUnidades, setSelectedUnidades] = useState<string[]>([]);

  // Filtrar edificios según comunidad seleccionada
  const [availableEdificios, setAvailableEdificios] = useState<any[]>([]);
  const [availableTorres, setAvailableTorres] = useState<any[]>([]);
  const [comunidadesState, setComunidadesState] = useState<any[]>([]);

  useEffect(() => {
    // load comunidades dropdown
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get('/unidades/dropdowns/comunidades');
        if (!mounted) {return;}
        setComunidadesState(res.data || []);
      } catch (err) {
        console.error('Error loading comunidades dropdown', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // load edificios for selected comunidad
    let mounted = true;
    (async () => {
      try {
        if (!filters.comunidad) {
          setAvailableEdificios([]);
          return;
        }
        const res = await apiClient.get('/unidades/dropdowns/edificios', {
          params: { comunidad_id: filters.comunidad },
        });
        if (!mounted) {return;}
        setAvailableEdificios(res.data || []);
      } catch (err) {
        console.error('Error loading edificios dropdown', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filters.comunidad]);

  useEffect(() => {
    // load torres for selected edificio
    let mounted = true;
    (async () => {
      try {
        if (!filters.edificio) {
          setAvailableTorres([]);
          return;
        }
        const res = await apiClient.get('/unidades/dropdowns/torres', {
          params: { edificio_id: filters.edificio },
        });
        if (!mounted) {return;}
        setAvailableTorres(res.data || []);
      } catch (err) {
        console.error('Error loading torres dropdown', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filters.edificio]);

  // (removed legacy useMemo for availableTorres)

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = unidades;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        unidad =>
          unidad.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unidad.propietario
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          unidad.residente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unidad.torre.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por comunidad
    if (filters.comunidad) {
      const comunidadNombre = comunidadesState.find(
        (c: any) => c.id === filters.comunidad,
      )?.nombre;
      filtered = filtered.filter(
        unidad => unidad.comunidad === comunidadNombre,
      );
    }

    // Filtrar por edificio
    if (filters.edificio) {
      const edificioNombre = availableEdificios.find(
        (e: any) => e.id === filters.edificio,
      )?.nombre;
      filtered = filtered.filter(unidad => unidad.edificio === edificioNombre);
    }

    // Filtrar por torre
    if (filters.torre) {
      const torreNombre = availableTorres.find(
        (t: any) => t.id === filters.torre,
      )?.nombre;
      filtered = filtered.filter(unidad => unidad.torre === torreNombre);
    }

    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(unidad => unidad.estado === filters.estado);
    }

    // Filtrar por tipo
    if (filters.tipo) {
      filtered = filtered.filter(unidad => unidad.tipo === filters.tipo);
    }

    setFilteredUnidades(filtered);
  }, [unidades, searchTerm, filters]);

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = { ...filters, [filterName]: value };

    // Resetear filtros dependientes
    if (filterName === 'comunidad') {
      newFilters.edificio = '';
      newFilters.torre = '';
    } else if (filterName === 'edificio') {
      newFilters.torre = '';
    }

    setFilters(newFilters);
  };

  const handleSelectUnidad = (unidadId: string) => {
    setSelectedUnidades(prev =>
      prev.includes(unidadId)
        ? prev.filter(id => id !== unidadId)
        : [...prev, unidadId],
    );
  };

  const handleSelectAll = () => {
    setSelectedUnidades(
      selectedUnidades.length === filteredUnidades.length
        ? []
        : filteredUnidades.map(u => u.id),
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activa':
        return 'bg-success';
      case 'Inactiva':
        return 'bg-warning';
      case 'Mantenimiento':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Departamento':
        return 'apartment';
      case 'Casa':
        return 'home';
      case 'Local':
        return 'store';
      case 'Oficina':
        return 'business';
      default:
        return 'location_city';
    }
  };

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = filteredUnidades.length;
    const activas = filteredUnidades.filter(u => u.estado === 'Activa').length;
    const inactivas = filteredUnidades.filter(
      u => u.estado === 'Inactiva',
    ).length;
    const mantenimiento = filteredUnidades.filter(
      u => u.estado === 'Mantenimiento',
    ).length;
    const saldoTotal = filteredUnidades.reduce(
      (sum, u) => sum + u.saldoPendiente,
      0,
    );

    return { total, activas, inactivas, mantenimiento, saldoTotal };
  }, [filteredUnidades]);

  // Load unidades from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        // map filters from UI to API params (basic)
        if (filters.comunidad) {params.comunidad_id = filters.comunidad;}
        if (filters.edificio) {params.edificio_id = filters.edificio;}
        if (filters.torre) {params.torre_id = filters.torre;}
        if (filters.estado)
          {params.activa = filters.estado === 'Activa' ? true : undefined;}
        if (filters.tipo) {params.tipo = filters.tipo;}
        if (searchTerm) {params.search = searchTerm;}

        const resp = await apiClient.get('/unidades', { params });
        if (!mounted) {return;}
        const data = resp.data || [];
        // Map backend shapes to frontend Unidad as needed (light mapping)
        const mapped = data.map((u: any) => ({
          id: String(u.id),
          numero: u.codigo || u.numero || '',
          piso: u.piso || 0,
          torre: u.torre_nombre || u.torre || '',
          edificio: u.edificio_nombre || u.edificio || '',
          comunidad: u.comunidad_nombre || u.comunidad || '',
          tipo: u.tipo || 'Departamento',
          superficie: u.m2_utiles || u.superficie || 0,
          dormitorios: u.dormitorios || 0,
          banos: u.nro_banos || u.banos || 0,
          estado: u.estado || 'Activa',
          propietario: u.propietario_nombre || u.propietario || undefined,
          residente: u.residente_nombre || undefined,
          saldoPendiente: u.saldo_pendiente || u.saldo || 0,
          ultimoPago: u.ultimo_pago_fecha || u.ultimoPago || undefined,
          fechaCreacion: u.created_at || u.fechaCreacion || '',
        }));
        setUnidades(mapped);
        setFilteredUnidades(mapped);
      } catch (err: any) {
        console.error('Error fetching unidades', err);
        setError(
          err?.response?.data?.error ||
            err.message ||
            'Error al cargar unidades',
        );
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [
    filters.comunidad,
    filters.edificio,
    filters.torre,
    filters.estado,
    filters.tipo,
    searchTerm,
  ]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Unidades — Cuentas Claras</title>
      </Head>

      <Layout title='Lista de Unidades'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='row mb-4 align-items-center'>
            <div className='col-md-8'>
              <h1 className='h3 mb-2'>Lista de Unidades</h1>
              <p className='text-muted'>
                Gestione todas las unidades/departamentos en la comunidad
              </p>
            </div>
            <div className='col-md-4 text-md-end'>
              <Link href='/unidades/nueva' className='btn btn-primary'>
                <i className='material-icons align-middle me-1'>add</i>
                Nueva Unidad
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className='row mb-4'>
            <div className='col-12'>
              <div
                className='p-3 mb-4'
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div className='row g-3'>
                  <div className='col-md-3'>
                    <label
                      htmlFor='comunidadFilter'
                      className='form-label small'
                    >
                      Comunidad
                    </label>
                    <select
                      className='form-select form-select-sm'
                      id='comunidadFilter'
                      value={filters.comunidad}
                      onChange={e =>
                        handleFilterChange('comunidad', e.target.value)
                      }
                    >
                      <option value=''>Todas las comunidades</option>
                      {(comunidadesState || []).map((comunidad: any) => (
                        <option key={comunidad.id} value={comunidad.id}>
                          {comunidad.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-md-3'>
                    <label
                      htmlFor='edificioFilter'
                      className='form-label small'
                    >
                      Edificio
                    </label>
                    <select
                      className='form-select form-select-sm'
                      id='edificioFilter'
                      value={filters.edificio}
                      onChange={e =>
                        handleFilterChange('edificio', e.target.value)
                      }
                      disabled={!filters.comunidad}
                    >
                      <option value=''>Todos los edificios</option>
                      {availableEdificios.map(edificio => (
                        <option key={edificio.id} value={edificio.id}>
                          {edificio.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-md-2'>
                    <label htmlFor='torreFilter' className='form-label small'>
                      Torre
                    </label>
                    <select
                      className='form-select form-select-sm'
                      id='torreFilter'
                      value={filters.torre}
                      onChange={e =>
                        handleFilterChange('torre', e.target.value)
                      }
                      disabled={!filters.edificio}
                    >
                      <option value=''>Todas las torres</option>
                      {availableTorres.map(torre => (
                        <option key={torre.id} value={torre.id}>
                          {torre.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-md-2'>
                    <label htmlFor='estadoFilter' className='form-label small'>
                      Estado
                    </label>
                    <select
                      className='form-select form-select-sm'
                      id='estadoFilter'
                      value={filters.estado}
                      onChange={e =>
                        handleFilterChange('estado', e.target.value)
                      }
                    >
                      <option value=''>Todos los estados</option>
                      <option value='Activa'>Activa</option>
                      <option value='Inactiva'>Inactiva</option>
                      <option value='Mantenimiento'>Mantenimiento</option>
                    </select>
                  </div>
                  <div className='col-md-2'>
                    <label htmlFor='tipoFilter' className='form-label small'>
                      Tipo
                    </label>
                    <select
                      className='form-select form-select-sm'
                      id='tipoFilter'
                      value={filters.tipo}
                      onChange={e => handleFilterChange('tipo', e.target.value)}
                    >
                      <option value=''>Todos los tipos</option>
                      <option value='Departamento'>Departamento</option>
                      <option value='Casa'>Casa</option>
                      <option value='Local'>Local</option>
                      <option value='Oficina'>Oficina</option>
                    </select>
                  </div>
                </div>

                <div className='row g-3 mt-2'>
                  <div className='col-md-6'>
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
                        className='form-control form-control-sm'
                        placeholder='Buscar por número, propietario o residente...'
                        style={{ paddingLeft: '35px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='col-md-6 d-flex justify-content-end align-items-end'>
                    <div className='btn-group' role='group'>
                      <button
                        type='button'
                        className={`btn btn-outline-secondary btn-sm ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                      >
                        <i className='material-icons'>view_list</i>
                      </button>
                      <button
                        type='button'
                        className={`btn btn-outline-secondary btn-sm ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                      >
                        <i className='material-icons'>view_module</i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className='row mb-4'>
            <div className='col-md-3 mb-3'>
              <div className='card bg-primary text-white'>
                <div className='card-body text-center'>
                  <h2 className='card-title'>{stats.total}</h2>
                  <p className='card-text'>Total Unidades</p>
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div className='card bg-success text-white'>
                <div className='card-body text-center'>
                  <h2 className='card-title'>{stats.activas}</h2>
                  <p className='card-text'>Activas</p>
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div className='card bg-warning text-white'>
                <div className='card-body text-center'>
                  <h2 className='card-title'>{stats.inactivas}</h2>
                  <p className='card-text'>Inactivas</p>
                </div>
              </div>
            </div>
            <div className='col-md-3 mb-3'>
              <div className='card bg-danger text-white'>
                <div className='card-body text-center'>
                  <h2 className='card-title'>
                    {formatCurrency(stats.saldoTotal)}
                  </h2>
                  <p className='card-text'>Saldo Pendiente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones masivas */}
          {selectedUnidades.length > 0 && (
            <div className='alert alert-info d-flex justify-content-between align-items-center mb-4'>
              <span>
                <i className='material-icons me-2'>info</i>
                {selectedUnidades.length} unidad(es) seleccionada(s)
              </span>
              <div>
                <button className='btn btn-sm btn-outline-primary me-2'>
                  <i className='material-icons me-1'>receipt</i>
                  Generar Cargos
                </button>
                <button className='btn btn-sm btn-outline-danger'>
                  <i className='material-icons me-1'>delete</i>
                  Eliminar
                </button>
              </div>
            </div>
          )}

          {/* Contenido principal */}
          {viewMode === 'table' ? (
            <div className='card'>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th>
                          <input
                            type='checkbox'
                            className='form-check-input'
                            checked={
                              selectedUnidades.length ===
                                filteredUnidades.length &&
                              filteredUnidades.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Unidad</th>
                        <th>Ubicación</th>
                        <th>Tipo</th>
                        <th>Propietario</th>
                        <th>Estado</th>
                        <th>Saldo</th>
                        <th className='actions-cell'>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUnidades.map(unidad => (
                        <tr key={unidad.id}>
                          <td>
                            <input
                              type='checkbox'
                              className='form-check-input'
                              checked={selectedUnidades.includes(unidad.id)}
                              onChange={() => handleSelectUnidad(unidad.id)}
                            />
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div
                                className='me-3 d-flex align-items-center justify-content-center text-white'
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--color-primary)',
                                }}
                              >
                                <i className='material-icons'>
                                  {getTipoIcon(unidad.tipo)}
                                </i>
                              </div>
                              <div>
                                <div className='fw-medium'>{unidad.numero}</div>
                                <div className='small text-muted'>
                                  Piso {unidad.piso} • {unidad.superficie} m²
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{unidad.torre}</div>
                            <div className='small text-muted'>
                              {unidad.edificio}
                            </div>
                          </td>
                          <td>
                            <span className='badge bg-light text-dark'>
                              {unidad.tipo}
                            </span>
                            <div className='small text-muted mt-1'>
                              {unidad.dormitorios}D/{unidad.banos}B
                            </div>
                          </td>
                          <td>
                            <div>{unidad.propietario || '-'}</div>
                            {unidad.residente &&
                              unidad.residente !== unidad.propietario && (
                                <div className='small text-muted'>
                                  Residente: {unidad.residente}
                                </div>
                              )}
                          </td>
                          <td>
                            <span
                              className={`badge ${getEstadoBadgeClass(unidad.estado)}`}
                            >
                              {unidad.estado}
                            </span>
                          </td>
                          <td>
                            <div
                              className={
                                unidad.saldoPendiente > 0
                                  ? 'text-danger fw-medium'
                                  : 'text-success'
                              }
                            >
                              {formatCurrency(unidad.saldoPendiente)}
                            </div>
                            {unidad.ultimoPago && (
                              <div className='small text-muted'>
                                Último: {formatDate(unidad.ultimoPago)}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className='d-flex gap-1'>
                              <Link
                                href={`/unidades/${unidad.id}`}
                                className='btn btn-sm btn-outline-primary'
                              >
                                <i
                                  className='material-icons'
                                  style={{ fontSize: '16px' }}
                                >
                                  visibility
                                </i>
                              </Link>
                              <Link
                                href={`/unidades/${unidad.id}/cargos`}
                                className='btn btn-sm btn-outline-secondary'
                              >
                                <i
                                  className='material-icons'
                                  style={{ fontSize: '16px' }}
                                >
                                  receipt
                                </i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className='row'>
              {filteredUnidades.map(unidad => (
                <div
                  key={unidad.id}
                  className='col-xl-3 col-lg-4 col-md-6 mb-4'
                >
                  <div
                    className='card h-100 position-relative'
                    style={{
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow =
                        '0 10px 15px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className='position-absolute top-0 end-0 p-2'>
                      <span
                        className={`badge ${getEstadoBadgeClass(unidad.estado)}`}
                      >
                        {unidad.estado}
                      </span>
                    </div>

                    <div className='card-body' style={{ padding: '1.25rem' }}>
                      <div className='d-flex align-items-center mb-3'>
                        <div
                          className='me-3 d-flex align-items-center justify-content-center text-white'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-primary)',
                          }}
                        >
                          <i className='material-icons'>
                            {getTipoIcon(unidad.tipo)}
                          </i>
                        </div>
                        <div>
                          <h5 className='card-title mb-0'>{unidad.numero}</h5>
                          <p className='card-text text-muted small mb-0'>
                            Piso {unidad.piso} • {unidad.superficie} m²
                          </p>
                        </div>
                      </div>

                      <div className='mb-3'>
                        <div className='small text-muted'>Ubicación:</div>
                        <div>{unidad.torre}</div>
                        <div className='small text-muted'>
                          {unidad.edificio}
                        </div>
                      </div>

                      <div className='mb-3'>
                        <span className='badge bg-light text-dark me-2'>
                          {unidad.tipo}
                        </span>
                        <span className='badge bg-light text-dark'>
                          {unidad.dormitorios}D/{unidad.banos}B
                        </span>
                      </div>

                      {unidad.propietario && (
                        <div className='mb-3'>
                          <div className='small text-muted'>Propietario:</div>
                          <div className='fw-medium'>{unidad.propietario}</div>
                        </div>
                      )}

                      <div className='mb-3'>
                        <div className='small text-muted'>Saldo Pendiente:</div>
                        <div
                          className={`fw-medium ${unidad.saldoPendiente > 0 ? 'text-danger' : 'text-success'}`}
                        >
                          {formatCurrency(unidad.saldoPendiente)}
                        </div>
                      </div>

                      <div className='d-flex justify-content-between mt-auto'>
                        <Link
                          href={`/unidades/${unidad.id}`}
                          className='btn btn-outline-primary btn-sm'
                        >
                          <i
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            visibility
                          </i>
                          Ver
                        </Link>
                        <Link
                          href={`/unidades/${unidad.id}/cargos`}
                          className='btn btn-primary btn-sm'
                        >
                          <i
                            className='material-icons me-1'
                            style={{ fontSize: '16px' }}
                          >
                            receipt
                          </i>
                          Cargos
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredUnidades.length === 0 && (
            <div className='text-center py-5'>
              <i
                className='material-icons'
                style={{ fontSize: '4rem', color: '#6c757d' }}
              >
                search_off
              </i>
              <h4 className='mt-3'>No se encontraron unidades</h4>
              <p className='text-muted'>
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
