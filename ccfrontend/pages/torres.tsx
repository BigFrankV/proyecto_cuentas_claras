import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import apiClient from '@/lib/api';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useComunidad } from '@/lib/useComunidad';
import { Permission, usePermissions } from '@/lib/usePermissions';

interface Torre {
  id: string;
  nombre: string;
  codigo: string;
  pisos: number;
  unidades: number;
  estado: 'Activa' | 'Inactiva' | 'Mantenimiento';
  fechaCreacion: string;
  imagen?: string;
}

export default function TorresListado() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre-asc');
  const [filterBy, setFilterBy] = useState('todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedTorres, setSelectedTorres] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [torres, setTorres] = useState<Torre[]>([]);
  const [stats, setStats] = useState({
    totalTorres: 0,
    totalUnidades: 0,
    promedioUnidades: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [edificios, setEdificios] = useState<any[]>([]);
  const [selectedEdificioId, setSelectedEdificioId] = useState<number | null>(null);

  // Load edificios when comunidad changes
  useEffect(() => {
    const loadEdificios = async () => {
      try {
        // eslint-disable-next-line no-console
        console.log('🗼 [Torres] Comunidad global cambió a:', comunidadSeleccionada);

        // Si no hay comunidad seleccionada, limpiar
        if (!comunidadSeleccionada) {
          setEdificios([]);
          setSelectedEdificioId(null);
          setTorres([]);
          setStats({ totalTorres: 0, totalUnidades: 0, promedioUnidades: 0 });
          return;
        }

        // Cargar edificios de la comunidad seleccionada
        const params: any = {};
        if (comunidadSeleccionada.id !== 'todas') {
          params.comunidadId = comunidadSeleccionada.id;
        }

        const edifResponse = await apiClient.get('/edificios/', { params });
        const edifs = edifResponse.data || [];
        setEdificios(edifs);

        // Auto-seleccionar primer edificio si hay
        if (edifs.length > 0) {
          setSelectedEdificioId(edifs[0].id);
        } else {
          setSelectedEdificioId(null);
          setTorres([]);
          setStats({ totalTorres: 0, totalUnidades: 0, promedioUnidades: 0 });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading edificios:', err);
        setError('Error al cargar edificios');
      }
    };

    loadEdificios();
  }, [comunidadSeleccionada]);

  // Load data from API - RESPETA FILTRO GLOBAL
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si no hay edificio seleccionado, no cargar
        if (!selectedEdificioId) {
          setTorres([]);
          setStats({ totalTorres: 0, totalUnidades: 0, promedioUnidades: 0 });
          setLoading(false);
          return;
        }

        // Load torres list
        const torresResponse = await apiClient.get(
          `/torres/edificio/${selectedEdificioId}/listado`,
        );
        const torresData = torresResponse.data.map((torre: any) => ({
          id: String(torre.id),
          nombre: torre.nombre,
          codigo: torre.codigo,
          pisos: torre.numPisos || 0,
          unidades: torre.totalUnidades || 0,
          estado: 'Activa' as const, // Default to Activa since backend doesn't provide estado
          fechaCreacion: torre.fechaCreacion,
          imagen: undefined, // No imagen from backend
        }));
        setTorres(torresData);

        // Load statistics
        const statsResponse = await apiClient.get(
          `/torres/edificio/${selectedEdificioId}/estadisticas`,
        );
        const statsData = statsResponse.data;
        setStats({
          totalTorres: statsData.totalTorres || 0,
          totalUnidades: statsData.totalUnidades || 0,
          promedioUnidades: statsData.promedioUnidadesPorTorre || 0,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading torres data:', err);
        setError('Error al cargar los datos de las torres');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedEdificioId]);

  // Funciones de filtrado y ordenamiento usando API
  const filteredAndSortedTorres = useMemo(() => {
    if (!torres.length) {
      return [];
    }

    // For now, do client-side filtering since the search API might not be fully implemented
    const filtered = torres.filter(torre => {
      const matchesSearch =
        searchTerm === '' ||
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

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedTorres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTorres = filteredAndSortedTorres.slice(startIndex, endIndex);

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

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, filterBy]);

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

  const getEstadoBadgeClass = (estado: Torre['estado']) => {
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

  return (
    <ProtectedRoute>
      <Head>
        <title>Torres — Cuentas Claras</title>
      </Head>

      <Layout title='Torres'>
        {/* Header Profesional */}
        <div className='container-fluid p-0'>
          <div
            className='text-white rounded-0'
            style={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className='p-4'>
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
              }}
            />
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center'>
                <div
                  className='me-4'
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i
                    className='material-icons'
                    style={{ fontSize: '32px', color: 'white' }}
                  >
                    location_city
                  </i>
                </div>
                <div>
                  <h1 className='h2 mb-1 text-white'>Torres</h1>
                  <p className='mb-0 opacity-75'>
                    Gestión y administración de torres
                  </p>
                </div>
              </div>
              <div className='text-end'>
                {hasPermission(Permission.CREATE_TORRE, comunidadSeleccionada?.id !== 'todas' ? Number(comunidadSeleccionada?.id) : undefined) && (
                  <Link href='/torres/nueva' className='btn btn-light btn-lg'>
                    <i className='material-icons me-2'>add</i>
                    Nueva Torre
                  </Link>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className='row mt-4'>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
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
                      <div className='text-white-50'>Total Torres</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
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
                      <i className='material-icons'>apartment</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats.totalUnidades}</div>
                      <div className='text-white-50'>Total Unidades</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
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
                      <i className='material-icons'>grid_view</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats.promedioUnidades}</div>
                      <div className='text-white-50'>Promedio Unidades</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-3 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-info)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>filter_list</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{filteredAndSortedTorres.length}</div>
                      <div className='text-white-50'>Filtradas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className='container-fluid pt-4 pb-4'>

          {/* Loading and Error States */}
          {loading && (
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando torres...</p>
            </div>
          )}

          {error && (
            <div className='alert alert-danger' role='alert'>
              <i className='material-icons align-middle me-2'>error</i>
              {error}
            </div>
          )}

          {/* Sin comunidad seleccionada */}
          {!loading && !error && !comunidadSeleccionada && (
            <div className='alert alert-info' role='alert'>
              <i className='material-icons align-middle me-2'>info</i>
              Selecciona una comunidad en el filtro superior para ver las torres
            </div>
          )}

          {/* Sin edificios disponibles */}
          {!loading && !error && comunidadSeleccionada && edificios.length === 0 && (
            <div className='alert alert-warning' role='alert'>
              <i className='material-icons align-middle me-2'>warning</i>
              No hay edificios disponibles en esta comunidad
            </div>
          )}

          {!loading && !error && comunidadSeleccionada && edificios.length > 0 && (
            <>
              {/* Selector de Edificio */}
              {edificios.length > 0 && (
                <div className='card mb-4'>
                  <div className='card-body'>
                    <div className='row align-items-center'>
                      <div className='col-md-4'>
                        <label className='form-label fw-bold'>
                          <i className='material-icons align-middle me-2'>business</i>
                          Seleccionar Edificio
                        </label>
                        <select
                          className='form-select'
                          value={selectedEdificioId || ''}
                          onChange={(e) => setSelectedEdificioId(Number(e.target.value))}
                        >
                          {edificios.map((edif) => (
                            <option key={edif.id} value={edif.id}>
                              {edif.nombre} - {edif.comunidad_nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='col-md-8'>
                        <div className='text-muted'>
                          <small>
                            <i className='material-icons align-middle' style={{ fontSize: '16px' }}>info</i>
                            {' '}Mostrando torres del edificio seleccionado en la comunidad actual
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Edificio */}
              {selectedEdificioId && (
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
                          <h4 className='mb-0'>{edificios.find(e => e.id === selectedEdificioId)?.nombre || 'Edificio'}</h4>
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
                        href={`/edificios/${selectedEdificioId}`}
                        className='btn btn-outline-secondary me-1'
                      >
                        <i className='material-icons align-middle me-1'>
                          arrow_back
                        </i>
                        Volver
                      </Link>
                      
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Filtros y acciones */}
              <div className='row mb-4'>
                <div className='col-lg-8'>
                  <div className='card'>
                    <div className='card-body' style={{ backgroundColor: '#f8f9fa' }}>
                      <form className='row g-2' onSubmit={(e) => e.preventDefault()}>
                        <div className='col-md-4'>
                          <label htmlFor='searchInput' className='visually-hidden'>
                            Buscar torre
                          </label>
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
                              aria-hidden='true'
                            >
                              search
                            </i>
                            <input
                              id='searchInput'
                              type='text'
                              className='form-control'
                              placeholder='Buscar torre...'
                              style={{ paddingLeft: '35px' }}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              aria-label='Buscar torre por nombre o código'
                            />
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <label htmlFor='sortSelect' className='visually-hidden'>
                            Ordenar por
                          </label>
                          <select
                            id='sortSelect'
                            className='form-select'
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label='Ordenar torres'
                          >
                            <option value='nombre-asc'>Nombre (A-Z)</option>
                            <option value='nombre-desc'>Nombre (Z-A)</option>
                            <option value='unidades-desc'>Más unidades</option>
                            <option value='unidades-asc'>Menos unidades</option>
                          </select>
                        </div>
                        <div className='col-md-4'>
                          <label htmlFor='filterSelect' className='visually-hidden'>
                            Filtrar por
                          </label>
                          <select
                            id='filterSelect'
                            className='form-select'
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            aria-label='Filtrar torres'
                          >
                            <option value='todas'>Todas las torres</option>
                            <option value='norte'>Torre Norte</option>
                            <option value='sur'>Torre Sur</option>
                          </select>
                        </div>
                      </form>
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
                        <button className='dropdown-item' type='button'>
                          Excel
                        </button>
                      </li>
                      <li>
                        <button className='dropdown-item' type='button'>
                          PDF
                        </button>
                      </li>
                      <li>
                        <button className='dropdown-item' type='button'>
                          CSV
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selector de vista */}
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h2 className='h5 mb-0' id='viewModeHeading'>
                  {viewMode === 'table'
                    ? 'Vista de tabla'
                    : 'Vista de tarjetas'}
                </h2>
                <div className='btn-group' role='group' aria-labelledby='viewModeHeading'>
                  <button
                    type='button'
                    className={`btn btn-outline-secondary ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                    aria-pressed={viewMode === 'cards'}
                    aria-label='Cambiar a vista de tarjetas'
                  >
                    <i className='material-icons' aria-hidden='true'>grid_view</i>
                  </button>
                  <button
                    type='button'
                    className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    aria-pressed={viewMode === 'table'}
                    aria-label='Cambiar a vista de tabla'
                  >
                    <i className='material-icons' aria-hidden='true'>view_list</i>
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
                          <button className='dropdown-item' type='button'>
                            Exportar a Excel
                          </button>
                        </li>
                        <li>
                          <button className='dropdown-item' type='button'>
                            Imprimir listado
                          </button>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button
                            className='dropdown-item text-danger'
                            type='button'
                          >
                            Eliminar seleccionadas
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className='card-body p-0'>
                    <div className='table-responsive'>
                      <table className='table table-hover mb-0' role='table' aria-label='Lista de torres'>
                        <caption className='visually-hidden'>
                          Tabla de torres con información de nombre, código, pisos, unidades, estado y acciones disponibles
                        </caption>
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
                                  onChange={(e) =>
                                    handleSelectAll(e.target.checked)
                                  }
                                  aria-label='Seleccionar todas las torres'
                                />
                                <label
                                  className='form-check-label visually-hidden'
                                  htmlFor='selectAllCheckbox'
                                >
                                  Seleccionar todas
                                </label>
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
                          {paginatedTorres.map(torre => (
                            <tr key={torre.id}>
                              <td>
                                <div className='form-check'>
                                  <input
                                    className='form-check-input'
                                    type='checkbox'
                                    id={`checkbox-${torre.id}`}
                                    checked={selectedTorres.includes(torre.id)}
                                    onChange={(e) =>
                                      handleSelectTorre(
                                        torre.id,
                                        e.target.checked,
                                      )
                                    }
                                    aria-label={`Seleccionar torre ${torre.nombre}`}
                                  />
                                  <label
                                    className='form-check-label visually-hidden'
                                    htmlFor={`checkbox-${torre.id}`}
                                  >
                                    Seleccionar {torre.nombre}
                                  </label>
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
                                    <div className='fw-medium'>
                                      {torre.nombre}
                                    </div>
                                    <div className='small text-muted'>
                                      Creada el{' '}
                                      {formatDate(torre.fechaCreacion)}
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
                                <div className='btn-group' role='group' aria-label={`Acciones para ${torre.nombre}`}>
                                  <Link
                                    href={`/torres/${torre.id}`}
                                    className='btn btn-sm btn-outline-secondary'
                                    aria-label={`Ver detalles de ${torre.nombre}`}
                                  >
                                    <i
                                      className='material-icons'
                                      style={{ fontSize: '16px' }}
                                      aria-hidden='true'
                                    >
                                      visibility
                                    </i>
                                  </Link>
                                  {hasPermission(Permission.EDIT_TORRE, comunidadSeleccionada?.id !== 'todas' ? Number(comunidadSeleccionada?.id) : undefined) && (
                                    <Link
                                      href={`/torres/${torre.id}`}
                                      className='btn btn-sm btn-outline-primary'
                                      aria-label={`Editar ${torre.nombre}`}
                                    >
                                      <i
                                        className='material-icons'
                                        style={{ fontSize: '16px' }}
                                        aria-hidden='true'
                                      >
                                        edit
                                      </i>
                                    </Link>
                                  )}
                                  {hasPermission(Permission.DELETE_TORRE, comunidadSeleccionada?.id !== 'todas' ? Number(comunidadSeleccionada?.id) : undefined) && (
                                    <button
                                      type='button'
                                      className='btn btn-sm btn-outline-danger'
                                      aria-label={`Eliminar ${torre.nombre}`}
                                      onClick={() => {
                                        if (confirm(`¿Estás seguro de eliminar ${torre.nombre}?`)) {
                                          // Lógica de eliminación
                                        }
                                      }}
                                    >
                                      <i
                                        className='material-icons'
                                        style={{ fontSize: '16px' }}
                                        aria-hidden='true'
                                      >
                                        delete
                                      </i>
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

              {/* Paginación moderna */}
              {totalPages > 1 && (
                <nav aria-label='Navegación de páginas' className='pagination-modern'>
                  <button
                    className='btn'
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    aria-label='Página anterior'
                  >
                    <span className='material-icons'>chevron_left</span>
                  </button>

                  <div className='page-info'>
                    Página {currentPage} de {totalPages} ({filteredAndSortedTorres.length} torres)
                  </div>

                  <button
                    className='btn'
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    aria-label='Página siguiente'
                  >
                    <span className='material-icons'>chevron_right</span>
                  </button>
                </nav>
              )}

              {/* Vista de tarjetas */}
              {viewMode === 'cards' && (
                <div className='row'>
                  {paginatedTorres.map(torre => (
                    <div
                      key={torre.id}
                      className='col-xl-4 col-lg-6 col-md-6 mb-4'
                    >
                      <div
                        className='card h-100 torre-card'
                        style={{ position: 'relative', overflow: 'hidden' }}
                      >
                        <div className='position-relative'>
                          <Image
                            src={torre.imagen}
                            className='card-img-top'
                            alt={torre.nombre}
                            width={400}
                            height={200}
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
                            role='presentation'
                          >
                            <div className='btn-group'>
                              {hasPermission(Permission.EDIT_TORRE, comunidadSeleccionada?.id !== 'todas' ? Number(comunidadSeleccionada?.id) : undefined) && (
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
                              )}
                              {hasPermission(Permission.DELETE_TORRE, comunidadSeleccionada?.id !== 'todas' ? Number(comunidadSeleccionada?.id) : undefined) && (
                                <button
                                  type='button'
                                  className='btn btn-sm btn-light'
                                  onClick={() => {
                                    if (confirm(`¿Estás seguro de eliminar ${torre.nombre}?`)) {
                                      // Lógica de eliminación
                                    }
                                  }}
                                >
                                  <i
                                    className='material-icons'
                                    style={{ fontSize: '16px' }}
                                  >
                                    delete
                                  </i>
                                </button>
                              )}
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
                            {hasPermission(Permission.EDIT_TORRE, comunidadSeleccionada?.id !== 'todas' ? Number(comunidadSeleccionada?.id) : undefined) && (
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
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón flotante para agregar nueva torre */}
              {hasPermission(Permission.CREATE_TORRE) && (
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
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
