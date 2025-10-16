import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import {
  getTorreDetalle,
  getUnidadesTorre,
  type TorreDetalle,
} from '@/lib/torresService';
import { ProtectedRoute } from '@/lib/useAuth';

interface TorreView extends TorreDetalle {
  estado: 'Activa' | 'Inactiva' | 'Mantenimiento';
  anoConstruction: number;
  unidadesPorPiso: number;
  administrador: string;
  descripcion: string;
  caracteristicas: string[];
  servicios: {
    ascensor: boolean;
    porteria: boolean;
    estacionamiento: boolean;
    gimnasio: boolean;
    salaEventos: boolean;
  };
}

interface UnidadView {
  id: string;
  numero: string;
  piso: number;
  tipo: string;
  superficie: number;
  dormitorios: number;
  banos: number;
  estado: 'Ocupada' | 'Vacante' | 'Mantenimiento';
  propietario?: string | undefined;
  arrendatario?: string | undefined;
}

export default function TorreDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [torre, setTorre] = useState<TorreView | null>(null);
  const [unidades, setUnidades] = useState<UnidadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<TorreView | null>(null);
  const [filteredUnidades, setFilteredUnidades] = useState<UnidadView[]>([]);
  const [unidadFilter, setUnidadFilter] = useState('todas');
  const [unidadSearch, setUnidadSearch] = useState('');

  // Cargar datos de la torre
  useEffect(() => {
    if (!id) {
      return;
    }

    const loadTorreData = async () => {
      try {
        setLoading(true);
        setError(null);

        const torreId = Number(id);
        const [torreData, unidadesData] = await Promise.all([
          getTorreDetalle(torreId),
          getUnidadesTorre(torreId),
        ]);

        // Transformar datos de la torre
        const torreView: TorreView = {
          ...torreData,
          estado: 'Activa', // TODO: Agregar campo estado en la API
          anoConstruction: 2018, // TODO: Agregar campo en la API
          unidadesPorPiso: torreData.numPisos
            ? Math.ceil((torreData.totalUnidades || 0) / torreData.numPisos)
            : 0,
          administrador: 'Patricia Contreras', // TODO: Agregar campo en la API
          descripcion: torreData.descripcion || '',
          caracteristicas: [], // TODO: Agregar campo en la API
          servicios: {
            ascensor: false,
            porteria: false,
            estacionamiento: false,
            gimnasio: false,
            salaEventos: false,
          }, // TODO: Agregar campo en la API
        };

        // Transformar datos de unidades
        const unidadesView: UnidadView[] = unidadesData.map((unidad) => ({
          id: String(unidad.id),
          numero: unidad.numero,
          piso: unidad.piso,
          tipo: unidad.tipo || 'Departamento',
          superficie: unidad.superficie || unidad.m2_utiles || 0,
          dormitorios: unidad.dormitorios || 0,
          banos: unidad.nro_banos || 0,
          estado: unidad.estadoOcupacion || 'Vacante',
          propietario: unidad.propietarios,
          arrendatario: unidad.arrendatarios,
        }));

        setTorre(torreView);
        setFormData(torreView);
        setUnidades(unidadesView);
      } catch (err) {
        setError('Error al cargar los datos de la torre');
      } finally {
        setLoading(false);
      }
    };

    loadTorreData();
  }, [id]);

  useEffect(() => {
    // Filtrar unidades
    const filtered = unidades.filter((unidad) => {
      const matchesFilter =
        unidadFilter === 'todas' ||
        unidad.estado.toLowerCase() === unidadFilter.toLowerCase();

      const matchesSearch =
        !unidadSearch ||
        unidad.numero.toLowerCase().includes(unidadSearch.toLowerCase()) ||
        unidad.propietario?.toLowerCase().includes(unidadSearch.toLowerCase()) ||
        unidad.arrendatario?.toLowerCase().includes(unidadSearch.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    setFilteredUnidades(filtered);
  }, [unidades, unidadFilter, unidadSearch]);

  const handleEditToggle = () => {
    if (!torre) {
      return;
    }
    setEditMode(!editMode);
    if (!editMode) {
      setFormData({ ...torre });
    }
  };

  const handleSave = () => {
    if (!formData) {
      return;
    }
    setTorre({ ...formData });
    setEditMode(false);
    // TODO: Aquí harías la llamada a la API para actualizar la torre
  };

  const handleCancel = () => {
    if (!torre) {
      return;
    }
    setFormData({ ...torre });
    setEditMode(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '';
    }
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activa':
      case 'Ocupada':
        return 'bg-success';
      case 'Inactiva':
      case 'Vacante':
        return 'bg-warning';
      case 'Mantenimiento':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getUnidadTypeIcon = (tipo: string) => {
    if (tipo.includes('3D')) {
      return 'king_bed';
    }
    if (tipo.includes('2D')) {
      return 'single_bed';
    }
    return 'bed';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="Torre">
          <div className="container-fluid py-4">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando información de la torre...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !torre) {
    return (
      <ProtectedRoute>
        <Layout title="Torre">
          <div className="container-fluid py-4">
            <div className="alert alert-danger" role="alert">
              <i className="material-icons align-middle me-2">error</i>
              {error || 'No se encontró la torre'}
            </div>
            <Link href="/torres" className="btn btn-primary">
              Volver al listado
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{torre.nombre} — Cuentas Claras</title>
      </Head>

      <Layout title={torre.nombre}>
        <div className='container-fluid py-4'>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/comunidades">Comunidades</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/edificios/1">Edificio Los Álamos</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/torres">Torres</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {torre.nombre}
              </li>
            </ol>
          </nav>

          {/* Torre Header */}
          <div 
            className="card mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #2c5282 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div 
              className="position-absolute"
              style={{
                top: 0,
                right: 0,
                width: '300px',
                height: '300px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(100px, -100px)',
              }}
            />
            <div className="card-body" style={{ padding: '2rem', position: 'relative', zIndex: 1 }}>
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {torre.nombre}
                  </h1>
                  <div style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                    Edificio Los Álamos • Las Condes, Santiago
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    Construida en {torre.anoConstruction} • {torre.numPisos} pisos •{' '}
                    {torre.totalUnidades || 0} unidades habitacionales
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row text-center">
                    <div className="col-3">
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {torre.totalUnidades || 0}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Unidades</div>
                    </div>
                    <div className="col-3">
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {torre.unidadesOcupadas || 0}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Ocupadas</div>
                    </div>
                    <div className="col-3">
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {torre.numPisos}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Pisos</div>
                    </div>
                    <div className="col-3">
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {(torre.totalUnidades || 0) - (torre.unidadesOcupadas || 0)}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Vacantes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end mb-4">
            <button 
              className="btn btn-primary me-2"
              onClick={handleEditToggle}
            >
              <i className="material-icons me-1">edit</i>
              {editMode ? 'Cancelar Edición' : 'Editar Torre'}
            </button>
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i className="material-icons me-1">more_vert</i>
                Más Acciones
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#"><i className="material-icons me-2">file_download</i>Generar Reporte</a></li>
                <li><a className="dropdown-item" href="#"><i className="material-icons me-2">print</i>Imprimir</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item text-danger" href="#"><i className="material-icons me-2">delete</i>Eliminar Torre</a></li>
              </ul>
            </div>
          </div>

          {/* Tabs de navegación */}
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
                type="button"
              >
                <i className="material-icons align-middle me-1">info</i>
                Información General
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'units' ? 'active' : ''}`}
                onClick={() => setActiveTab('units')}
                type="button"
              >
                <i className="material-icons align-middle me-1">apartment</i>
                Unidades ({torre.totalUnidades || 0})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
                type="button"
              >
                <i className="material-icons align-middle me-1">build</i>
                Servicios
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('maintenance')}
                type="button"
              >
                <i className="material-icons align-middle me-1">construction</i>
                Mantención
              </button>
            </li>
          </ul>

          <div className="tab-content mt-4">
            {/* Tab: Información General */}
            {activeTab === 'info' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-lg-8">
                    {!editMode ? (
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title d-flex align-items-center">
                            <i className="material-icons me-2">apartment</i>
                            Información de la Torre
                          </h3>
                        </div>
                        <div className="card-body">
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Nombre:</strong></div>
                            <div className="col-sm-9">{torre.nombre}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Estado:</strong></div>
                            <div className="col-sm-9">
                              <span className={`badge ${getEstadoBadgeClass(torre.estado)}`}>
                                {torre.estado}
                              </span>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Año de Construcción:</strong></div>
                            <div className="col-sm-9">{torre.anoConstruction}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Número de Pisos:</strong></div>
                            <div className="col-sm-9">{torre.numPisos} pisos</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Total de Unidades:</strong></div>
                            <div className="col-sm-9">{torre.totalUnidades} unidades</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Unidades por Piso:</strong></div>
                            <div className="col-sm-9">{torre.unidadesPorPiso} unidades</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Superficie Total:</strong></div>
                            <div className="col-sm-9">
                              {torre.superficieTotal?.toLocaleString('es-CL') || 0} m²
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Administrador:</strong></div>
                            <div className="col-sm-9">{torre.administrador}</div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Fecha de Creación:</strong></div>
                            <div className="col-sm-9">
                              {torre.fechaCreacion ? formatDate(torre.fechaCreacion) : 'N/A'}
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-sm-3"><strong>Última Actualización:</strong></div>
                            <div className="col-sm-9">
                              {torre.ultimaActualizacion
                                ? formatDate(torre.ultimaActualizacion)
                                : 'N/A'}
                            </div>
                          </div>
                          {torre.descripcion && (
                            <div className="row mb-3">
                              <div className="col-sm-3"><strong>Descripción:</strong></div>
                              <div className="col-sm-9">{torre.descripcion}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title d-flex align-items-center">
                            <i className="material-icons me-2">edit</i>
                            Editar Torre
                          </h3>
                        </div>
                        <div className="card-body">
                          <form>
                            <h5 className="mb-3">Información Básica</h5>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Nombre de la Torre</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={formData?.nombre || ''}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({ ...formData, nombre: e.target.value })
                                  }
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Estado</label>
                                <select 
                                  className="form-select"
                                  value={formData?.estado}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({
                                      ...formData,
                                      estado: e.target.value as TorreView['estado'],
                                    })
                                  }
                                >
                                  <option value="Activa">Activa</option>
                                  <option value="Inactiva">Inactiva</option>
                                  <option value="Mantenimiento">En Mantención</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Año de Construcción</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={formData?.anoConstruction || ''}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({
                                      ...formData,
                                      anoConstruction: parseInt(e.target.value),
                                    })
                                  }
                                  min="1900" 
                                  max="2030"
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Número de Pisos</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={formData?.numPisos || ''}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({ ...formData, numPisos: parseInt(e.target.value) })
                                  }
                                  min="1" 
                                  max="100"
                                />
                              </div>
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Total de Unidades</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={formData?.totalUnidades || ''}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({
                                      ...formData,
                                      totalUnidades: parseInt(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Unidades por Piso</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={formData?.unidadesPorPiso || ''}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({
                                      ...formData,
                                      unidadesPorPiso: parseInt(e.target.value),
                                    })
                                  }
                                  min="1"
                                />
                              </div>
                            </div>
                            
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Superficie Total (m²)</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  value={formData?.superficieTotal || ''}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({
                                      ...formData,
                                      superficieTotal: parseInt(e.target.value),
                                    })
                                  }
                                  min="1" 
                                  step="0.01"
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Administrador</label>
                                <select 
                                  className="form-select"
                                  value={formData?.administrador}
                                  onChange={(e) =>
                                    formData &&
                                    setFormData({ ...formData, administrador: e.target.value })
                                  }
                                >
                                  <option value="Patricia Contreras">Patricia Contreras</option>
                                  <option value="Juan Pérez">Juan Pérez</option>
                                  <option value="María González">María González</option>
                                </select>
                              </div>
                            </div>
                            
                            <h5 className="mb-3 mt-4">Descripción</h5>
                            <div className="mb-3">
                              <label className="form-label">Descripción de la Torre</label>
                              <textarea 
                                className="form-control" 
                                rows={4}
                                value={formData?.descripcion || ''}
                                onChange={(e) =>
                                  formData &&
                                  setFormData({ ...formData, descripcion: e.target.value })
                                }
                                placeholder="Descripción detallada de la torre..."
                              />
                            </div>
                            
                            <div className="d-flex gap-2">
                              <button type="button" className="btn btn-success" onClick={handleSave}>
                                <i className="material-icons me-1">save</i>
                                Guardar Cambios
                              </button>
                              <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                                <i className="material-icons me-1">cancel</i>
                                Cancelar
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-lg-4">
                    {/* Características adicionales */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="card-title d-flex align-items-center">
                          <i className="material-icons me-2">featured_play_list</i>
                          Características
                        </h5>
                      </div>
                      <div className="card-body">
                        {torre.caracteristicas.map((caracteristica, index) => (
                          <div key={index} className="d-flex align-items-center mb-2">
                            <i className="material-icons me-2 text-success">check_circle</i>
                            <span>{caracteristica}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Servicios disponibles */}
                    <div className="card">
                      <div className="card-header">
                        <h5 className="card-title d-flex align-items-center">
                          <i className="material-icons me-2">build</i>
                          Servicios
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <i className={`material-icons me-2 ${torre.servicios.ascensor ? 'text-success' : 'text-muted'}`}>
                            {torre.servicios.ascensor ? 'check_circle' : 'radio_button_unchecked'}
                          </i>
                          <span>Ascensor</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className={`material-icons me-2 ${torre.servicios.porteria ? 'text-success' : 'text-muted'}`}>
                            {torre.servicios.porteria ? 'check_circle' : 'radio_button_unchecked'}
                          </i>
                          <span>Portería</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className={`material-icons me-2 ${torre.servicios.estacionamiento ? 'text-success' : 'text-muted'}`}>
                            {torre.servicios.estacionamiento ? 'check_circle' : 'radio_button_unchecked'}
                          </i>
                          <span>Estacionamientos</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className={`material-icons me-2 ${torre.servicios.gimnasio ? 'text-success' : 'text-muted'}`}>
                            {torre.servicios.gimnasio ? 'check_circle' : 'radio_button_unchecked'}
                          </i>
                          <span>Gimnasio</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className={`material-icons me-2 ${torre.servicios.salaEventos ? 'text-success' : 'text-muted'}`}>
                            {torre.servicios.salaEventos ? 'check_circle' : 'radio_button_unchecked'}
                          </i>
                          <span>Sala de Eventos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Unidades */}
            {activeTab === 'units' && (
              <div className="tab-pane fade show active">
                {/* Filtros de unidades */}
                <div className="card mb-4">
                  <div className="card-body" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <div className="position-relative">
                          <i className="material-icons position-absolute" style={{ 
                            top: '50%', 
                            left: '10px', 
                            transform: 'translateY(-50%)', 
                            color: '#6c757d',
                            fontSize: '20px'
                          }}>search</i>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Buscar unidad..." 
                            style={{ paddingLeft: '35px' }}
                            value={unidadSearch}
                            onChange={(e) => setUnidadSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <select 
                          className="form-select"
                          value={unidadFilter}
                          onChange={(e) => setUnidadFilter(e.target.value)}
                        >
                          <option value="todas">Todas las unidades</option>
                          <option value="ocupada">Ocupadas</option>
                          <option value="vacante">Vacantes</option>
                          <option value="mantenimiento">En mantención</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-end">
                          <Link href="/torres/1/unidades/nueva" className="btn btn-primary">
                            <i className="material-icons me-1">add</i>
                            Nueva Unidad
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de unidades */}
                <div className="row">
                  {filteredUnidades.map((unidad) => (
                    <div key={unidad.id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="card-title mb-0">Unidad {unidad.numero}</h5>
                            <span className={`badge ${getEstadoBadgeClass(unidad.estado)}`}>
                              {unidad.estado}
                            </span>
                          </div>
                          <p className="card-text text-muted mb-2">Piso {unidad.piso}</p>
                          
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-1">
                              <i className="material-icons me-2" style={{ fontSize: '18px' }}>
                                {getUnidadTypeIcon(unidad.tipo)}
                              </i>
                              <span className="small">{unidad.tipo}</span>
                            </div>
                            <div className="d-flex align-items-center mb-1">
                              <i className="material-icons me-2" style={{ fontSize: '18px' }}>square_foot</i>
                              <span className="small">{unidad.superficie} m²</span>
                            </div>
                          </div>
                          
                          {unidad.propietario && (
                            <div className="mb-2">
                              <small className="text-muted">Propietario:</small>
                              <div className="fw-medium">{unidad.propietario}</div>
                            </div>
                          )}
                          {unidad.arrendatario && (
                            <div className="mb-2">
                              <small className="text-muted">Arrendatario:</small>
                              <div className="fw-medium">{unidad.arrendatario}</div>
                            </div>
                          )}
                          
                          <div className="d-flex justify-content-between mt-auto">
                            <Link href={`/unidades/${unidad.id}`} className="btn btn-outline-primary btn-sm">
                              <i className="material-icons me-1" style={{ fontSize: '16px' }}>visibility</i>
                              Ver
                            </Link>
                            <Link href={`/unidades/${unidad.id}/edit`} className="btn btn-primary btn-sm">
                              <i className="material-icons me-1" style={{ fontSize: '16px' }}>edit</i>
                              Editar
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Servicios */}
            {activeTab === 'services' && (
              <div className="tab-pane fade show active">
                <div className="card">
                  <div className="card-body">
                    <h4>Servicios de la Torre</h4>
                    <p className="text-muted">Administración y configuración de servicios disponibles.</p>
                    <div className="alert alert-info">
                      <i className="material-icons me-2">info</i>
                      Esta funcionalidad estará disponible próximamente.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Mantención */}
            {activeTab === 'maintenance' && (
              <div className="tab-pane fade show active">
                <div className="card">
                  <div className="card-body">
                    <h4>Plan de Mantención</h4>
                    <p className="text-muted">Seguimiento y programación de actividades de mantención.</p>
                    <div className="alert alert-info">
                      <i className="material-icons me-2">info</i>
                      Esta funcionalidad estará disponible próximamente.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
