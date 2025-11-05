/* eslint-disable @typescript-eslint/no-unused-vars */
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { TimelineItem } from '@/components/bitacora';
import Layout from '@/components/layout/Layout';
import { useCurrentComunidad } from '@/hooks/useComunidad';
import bitacoraService, { ActivityFilters } from '@/lib/api/bitacora';
import { ProtectedRoute } from '@/lib/useAuth';

interface Activity {
  id: string;
  type: 'system' | 'user' | 'security' | 'maintenance' | 'admin' | 'financial';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  description: string;
  user: string;
  date: string;
  tags: string[];
  attachments: number;
  ip?: string | undefined;
  location?: string | undefined;
}

interface Stats {
  total: number;
  today: number;
  high: number;
  critical: number;
}

export default function BitacoraListado() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    today: 0,
    high: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');

  const comunidadId = useCurrentComunidad();

  // Load data from API
  const loadActivities = useCallback(async () => {
    if (!comunidadId) {
      setError('No se pudo determinar la comunidad actual');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare filters for backend
      const backendFilters: ActivityFilters = {};
      if (searchTerm) {
        backendFilters.search = searchTerm;
      }
      if (selectedType && selectedType !== 'all') {
        backendFilters.type = selectedType as Exclude<
          ActivityFilters['type'],
          undefined
        >;
      }
      if (selectedPriority && selectedPriority !== 'all') {
        const priority = selectedPriority as Exclude<
          ActivityFilters['priority'],
          undefined
        >;
        backendFilters.priority = priority;
      }
      if (dateRange && dateRange !== 'all') {
        backendFilters.dateRange = dateRange as Exclude<
          ActivityFilters['dateRange'],
          undefined
        >;
      }

      // Load activities and stats in parallel
      const [activitiesResponse, statsResponse] = await Promise.all([
        bitacoraService.getActivities(comunidadId, backendFilters),
        bitacoraService.getStats(comunidadId),
      ]);

      setActivities(activitiesResponse.activities);
      setFilteredActivities(activitiesResponse.activities);
      setStats(statsResponse);
    } catch (_err) {
      setError('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  }, [comunidadId, searchTerm, selectedType, selectedPriority, dateRange]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Filter activities (removed - now handled by backend)
  // The filteredActivities state is now set directly from the API response

  const handleRefresh = () => {
    loadActivities();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedPriority('all');
    setDateRange('today');
  };

  const exportData = (format: string) => {
    alert(`Exportando datos en formato ${format.toUpperCase()}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title='Bitácora de Actividades'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando actividades...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Bitácora de Actividades — Cuentas Claras</title>
      </Head>

      <Layout title='Bitácora de Actividades'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h3 mb-1'>Bitácora de Actividades</h1>
              <p className='text-muted mb-0'>
                Registro completo de actividades del sistema
              </p>
            </div>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className={`btn real-time-indicator ${autoRefresh ? 'active' : ''}`}
                onClick={toggleAutoRefresh}
                title={
                  autoRefresh
                    ? 'Desactivar actualización automática'
                    : 'Activar actualización automática'
                }
              >
                <i className='material-icons'>radio_button_checked</i>
                <span>{autoRefresh ? 'En vivo' : 'Manual'}</span>
              </button>
              <button
                className='btn btn-outline-secondary'
                onClick={handleRefresh}
              >
                <i className='material-icons me-2'>refresh</i>
                Actualizar
              </button>
              <Link href='/bitacora/nueva' className='btn btn-primary'>
                <i className='material-icons me-2'>add</i>
                Nueva Entrada
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='row g-3 mb-4'>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card'>
                <div className='stats-icon info'>
                  <i className='material-icons'>list</i>
                </div>
                <div className='stats-number'>{stats.total}</div>
                <div className='stats-label'>Total de Actividades</div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card'>
                <div className='stats-icon success'>
                  <i className='material-icons'>today</i>
                </div>
                <div className='stats-number'>{stats.today}</div>
                <div className='stats-label'>Actividades de Hoy</div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card'>
                <div className='stats-icon warning'>
                  <i className='material-icons'>priority_high</i>
                </div>
                <div className='stats-number'>{stats.high}</div>
                <div className='stats-label'>Prioridad Alta</div>
              </div>
            </div>
            <div className='col-sm-6 col-lg-3'>
              <div className='stats-card'>
                <div className='stats-icon danger'>
                  <i className='material-icons'>warning</i>
                </div>
                <div className='stats-number'>{stats.critical}</div>
                <div className='stats-label'>Críticas</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className='filters-card'>
            <div className='filters-row'>
              <div className='filter-group'>
                <label className='form-label'>Buscar actividades</label>
                <div className='search-box position-relative'>
                  <i className='material-icons position-absolute start-0 top-50 translate-middle-y ms-3 text-muted'>
                    search
                  </i>
                  <input
                    type='text'
                    className='form-control ps-5'
                    placeholder='Buscar por título, descripción, usuario...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className='filter-group'>
                <label className='form-label'>Tipo de actividad</label>
                <select
                  className='form-select'
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                >
                  <option value='all'>Todos los tipos</option>
                  <option value='system'>Sistema</option>
                  <option value='user'>Usuario</option>
                  <option value='security'>Seguridad</option>
                  <option value='maintenance'>Mantenimiento</option>
                  <option value='admin'>Administración</option>
                  <option value='financial'>Financiero</option>
                </select>
              </div>

              <div className='filter-group'>
                <label className='form-label'>Prioridad</label>
                <select
                  className='form-select'
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                >
                  <option value='all'>Todas las prioridades</option>
                  <option value='low'>Baja</option>
                  <option value='normal'>Normal</option>
                  <option value='high'>Alta</option>
                  <option value='critical'>Crítica</option>
                </select>
              </div>

              <div className='filter-group'>
                <label className='form-label'>Período</label>
                <select
                  className='form-select'
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                >
                  <option value='today'>Hoy</option>
                  <option value='week'>Esta semana</option>
                  <option value='month'>Este mes</option>
                  <option value='all'>Todo el tiempo</option>
                </select>
              </div>

              <div className='filter-group'>
                <label className='form-label'>&nbsp;</label>
                <div className='d-flex gap-2'>
                  <button
                    className='btn btn-outline-secondary'
                    onClick={clearFilters}
                  >
                    <i className='material-icons me-2'>clear</i>
                    Limpiar
                  </button>
                  <div className='dropdown'>
                    <button
                      className='btn btn-outline-primary dropdown-toggle'
                      type='button'
                      data-bs-toggle='dropdown'
                    >
                      <i className='material-icons me-2'>file_download</i>
                      Exportar
                    </button>
                    <ul className='dropdown-menu'>
                      <li>
                        <button
                          className='dropdown-item'
                          onClick={() => exportData('csv')}
                        >
                          <i className='material-icons me-2'>table_chart</i>
                          CSV
                        </button>
                      </li>
                      <li>
                        <button
                          className='dropdown-item'
                          onClick={() => exportData('excel')}
                        >
                          <i className='material-icons me-2'>description</i>
                          Excel
                        </button>
                      </li>
                      <li>
                        <button
                          className='dropdown-item'
                          onClick={() => exportData('pdf')}
                        >
                          <i className='material-icons me-2'>picture_as_pdf</i>
                          PDF
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className='activity-log'>
            <div className='activity-header'>
              <div className='activity-title'>
                Registro de Actividades ({filteredActivities.length})
              </div>
              <div className='activity-actions'>
                <span className='text-muted small me-3'>
                  Mostrando {filteredActivities.length} de {activities.length}{' '}
                  actividades
                </span>
              </div>
            </div>

            {filteredActivities.length > 0 ? (
              <div className='timeline position-relative'>
                {filteredActivities.map(activity => (
                  <TimelineItem
                    key={activity.id}
                    id={activity.id}
                    type={activity.type}
                    priority={activity.priority}
                    title={activity.title}
                    description={activity.description}
                    user={activity.user}
                    date={activity.date}
                    tags={activity.tags}
                    attachments={activity.attachments}
                    ip={activity.ip}
                    location={activity.location}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-5'>
                <i
                  className='material-icons mb-3 text-muted'
                  style={{ fontSize: '4rem' }}
                >
                  event_note
                </i>
                <h5 className='text-muted'>No se encontraron actividades</h5>
                <p className='text-muted'>
                  {searchTerm ||
                  selectedType !== 'all' ||
                  selectedPriority !== 'all'
                    ? 'Intenta cambiar los filtros de búsqueda'
                    : 'Aún no hay actividades registradas'}
                </p>
                {!searchTerm &&
                  selectedType === 'all' &&
                  selectedPriority === 'all' && (
                    <Link href='/bitacora/nueva' className='btn btn-primary'>
                      <i className='material-icons me-2'>add</i>
                      Crear Primera Entrada
                    </Link>
                  )}
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .stats-card {
            background-color: #fff;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border-left: 4px solid #007bff;
            height: 100%;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .stats-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }

          .stats-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            margin-bottom: 1rem;
          }

          .stats-icon.info {
            background-color: #17a2b8;
          }
          .stats-icon.warning {
            background-color: #ffc107;
          }
          .stats-icon.success {
            background-color: #28a745;
          }
          .stats-icon.danger {
            background-color: #dc3545;
          }

          .stats-number {
            font-size: 2rem;
            font-weight: bold;
            color: #212529;
            margin-bottom: 0.5rem;
          }

          .stats-label {
            color: #6c757d;
            font-size: 0.875rem;
            margin-bottom: 0;
          }

          .filters-card {
            background-color: #fff;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .filters-row {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: end;
          }

          .filter-group {
            flex: 1;
            min-width: 200px;
          }

          .activity-log {
            background-color: #fff;
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .activity-header {
            background-color: #f8f9fa;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .activity-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #212529;
            margin: 0;
          }

          .timeline {
            position: relative;
            padding: 0;
            margin: 0;
          }

          .timeline::before {
            content: '';
            position: absolute;
            left: 30px;
            top: 0;
            bottom: 0;
            width: 2px;
            background-color: #e9ecef;
          }

          .real-time-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            border: 1px solid #e9ecef;
            background: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .real-time-indicator.active {
            border-color: #28a745;
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
          }

          .real-time-indicator .material-icons {
            font-size: 16px;
            animation: ${autoRefresh ? 'pulse 2s infinite' : 'none'};
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @media (max-width: 768px) {
            .filter-group {
              min-width: 100%;
            }

            .filters-row {
              flex-direction: column;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
