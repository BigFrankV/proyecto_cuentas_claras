import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import {
  PersonaStats,
  PersonaFilters,
  PersonaCard,
  PersonaTable,
  PersonaViewTabs,
  PersonaPagination,
} from '@/components/personas';
import { usePersonas } from '@/hooks/usePersonas';
import { ProtectedRoute } from '@/lib/useAuth';
import { ProtectedPage, UserRole, Permission, usePermissions } from '@/lib/usePermissions';
import { Persona, PersonaFilters as ApiFilters } from '@/types/personas';

interface PersonaUI {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: 'Propietario' | 'Inquilino' | 'Administrador';
  estado: 'Activo' | 'Inactivo';
  unidades: number;
  fechaRegistro: string;
  avatar: string | undefined;
}

const PersonasListado = () => {
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [stats, setStats] = useState<any>(null);

  const { listarPersonas, obtenerEstadisticas, loading, error } = usePersonas();

  const itemsPerPage = 20;

  // Cargar datos iniciales
  useEffect(() => {
    cargarPersonas();
    cargarEstadisticas();
  }, []);

  // Cargar personas con filtros
  useEffect(() => {
    cargarPersonas();
  }, [searchTerm, tipoFilter, estadoFilter, currentPage]);

  const cargarPersonas = async () => {
    try {
      const filters: ApiFilters = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }
      if (tipoFilter !== 'todos') {
        filters.tipo = tipoFilter as any;
      }
      if (estadoFilter !== 'todos') {
        filters.estado = estadoFilter as any;
      }

      const data = await listarPersonas(filters);
      setPersonas(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar personas:', err);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await obtenerEstadisticas();
      setStats({
        total: data.total_personas,
        propietarios: data.propietarios,
        inquilinos: data.inquilinos,
        administradores: data.administradores,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al cargar estadísticas:', err);
      // Si falla, usar valores por defecto vacíos
      setStats({
        total: 0,
        propietarios: 0,
        inquilinos: 0,
        administradores: 0,
      });
    }
  };

  // Filtrar personas (ya filtradas por API, pero mantenemos lógica local para UI)
  const filteredPersonas: PersonaUI[] = useMemo(() => {
    return personas.map(persona => ({
      id: persona.id.toString(),
      nombre: `${persona.nombres} ${persona.apellidos}`,
      dni: `${persona.rut}-${persona.dv}`,
      email: persona.email || '',
      telefono: persona.telefono || '',
      tipo: (persona.usuario ? 'Administrador' : 'Propietario') as
        | 'Propietario'
        | 'Inquilino'
        | 'Administrador',
      estado: (persona.usuario?.estado || 'Activo') as 'Activo' | 'Inactivo',
      unidades: 0, // TODO: Obtener de API
      fechaRegistro: new Date(persona.fecha_registro).toLocaleDateString(
        'es-AR',
      ),
      avatar: persona.avatar || undefined,
    }));
  }, [personas]);

  const totalPages = Math.ceil((stats?.total || 0) / itemsPerPage);

  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Personas — Cuentas Claras</title>
        </Head>

        <Layout title='Personas'>
        {/* Header Profesional */}
        <div className='container-fluid p-0'>
          <div
            className='text-white'
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                    people
                  </i>
                </div>
                <div>
                  <h1 className='h2 mb-1 text-white'>Personas</h1>
                  <p className='mb-0 opacity-75'>
                    Gestión de propietarios, inquilinos y administradores
                  </p>
                </div>
              </div>
              {hasPermission(Permission.CREATE_PERSONA) && (
                <div className='text-end'>
                  <Link
                    href='/personas/nueva'
                    className='btn btn-light btn-lg'
                  >
                    <i className='material-icons me-2'>person_add</i>
                    Nueva Persona
                  </Link>
                </div>
              )}
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
                      <i className='material-icons'>people</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats?.total || 0}</div>
                      <div className='text-white-50'>Total Personas</div>
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
                      <i className='material-icons'>person</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats?.propietarios || 0}</div>
                      <div className='text-white-50'>Propietarios</div>
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
                      <i className='material-icons'>group</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats?.inquilinos || 0}</div>
                      <div className='text-white-50'>Inquilinos</div>
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
                      <i className='material-icons'>admin_panel_settings</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{stats?.administradores || 0}</div>
                      <div className='text-white-50'>Administradores</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className='container-fluid pt-4 pb-4'>
          {/* Mostrar error si existe */}
          {error && (
            <div
              className='alert alert-danger alert-dismissible fade show'
              role='alert'
            >
              <i className='material-icons me-2'>error</i>
              {error}
              <button
                type='button'
                className='btn-close'
                onClick={() => {
                  /* clear error */
                }}
              ></button>
            </div>
          )}

          {/* Filtros */}
          <PersonaFilters
            searchTerm={searchTerm}
            tipoFilter={tipoFilter}
            estadoFilter={estadoFilter}
            onSearchChange={setSearchTerm}
            onTipoChange={setTipoFilter}
            onEstadoChange={setEstadoFilter}
          />

          {/* Estadísticas */}
          {stats && (
            <PersonaStats
              total={stats.total}
              propietarios={stats.propietarios}
              inquilinos={stats.inquilinos}
              administradores={stats.administradores}
            />
          )}

          {/* Tabs de vista */}
          <PersonaViewTabs viewMode={viewMode} onViewModeChange={setViewMode} />

          {/* Indicador de carga */}
          {loading && (
            <div className='text-center py-4'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='mt-2 text-muted'>Cargando personas...</p>
            </div>
          )}

          {/* Vista de tabla */}
          {!loading && viewMode === 'table' && (
            <PersonaTable personas={filteredPersonas} />
          )}

          {/* Vista de tarjetas */}
          {!loading && viewMode === 'cards' && (
            <div className='row'>
              {filteredPersonas.map(persona => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          )}

          {/* Paginación */}
          {stats && totalPages > 1 && (
            <PersonaPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Mensaje cuando no hay resultados */}
          {!loading && filteredPersonas.length === 0 && (
            <div className='text-center py-5'>
              <i
                className='material-icons'
                style={{ fontSize: '4rem', color: '#6c757d' }}
              >
                people
              </i>
              <h5 className='mt-3 text-muted'>No se encontraron personas</h5>
              <p className='text-muted'>
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
};

export default PersonasListado;
