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
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
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

      if (searchTerm) {filters.search = searchTerm;}
      if (tipoFilter !== 'todos') {filters.tipo = tipoFilter as any;}
      if (estadoFilter !== 'todos') {filters.estado = estadoFilter as any;}

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
      <Head>
        <title>Personas — Cuentas Claras</title>
      </Head>

      <Layout title='Personas'>
        <div className='container-fluid py-4'>
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
    </ProtectedRoute>
  );
};

export default PersonasListado;

