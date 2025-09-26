import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { PersonaStats, PersonaFilters, PersonaCard, PersonaTable, PersonaViewTabs, PersonaPagination } from '@/components/personas';

interface Persona {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: 'Propietario' | 'Inquilino' | 'Administrador';
  estado: 'Activo' | 'Inactivo';
  unidades: number;
  fechaRegistro: string;
  avatar?: string;
}

const mockPersonas: Persona[] = [
  {
    id: '1',
    nombre: 'Juan Delgado',
    dni: '30.457.892',
    email: 'juan.delgado@email.com',
    telefono: '+54 11 5555-1234',
    tipo: 'Propietario',
    estado: 'Activo',
    unidades: 2,
    fechaRegistro: '2025-01-15'
  },
  {
    id: '2',
    nombre: 'María López',
    dni: '28.765.432',
    email: 'maria.lopez@email.com',
    telefono: '+54 11 5555-5678',
    tipo: 'Inquilino',
    estado: 'Activo',
    unidades: 1,
    fechaRegistro: '2025-02-20'
  },
  {
    id: '3',
    nombre: 'Carlos Ramírez',
    dni: '25.987.654',
    email: 'carlos.ramirez@email.com',
    telefono: '+54 11 5555-9012',
    tipo: 'Administrador',
    estado: 'Activo',
    unidades: 0,
    fechaRegistro: '2024-12-10'
  },
  {
    id: '4',
    nombre: 'Ana Gómez',
    dni: '32.123.456',
    email: 'ana.gomez@email.com',
    telefono: '+54 11 5555-3456',
    tipo: 'Propietario',
    estado: 'Inactivo',
    unidades: 3,
    fechaRegistro: '2025-03-05'
  },
  {
    id: '5',
    nombre: 'Pablo Vázquez',
    dni: '27.654.321',
    email: 'pablo.vazquez@email.com',
    telefono: '+54 11 5555-7890',
    tipo: 'Inquilino',
    estado: 'Activo',
    unidades: 1,
    fechaRegistro: '2025-04-12'
  }
];

export default function PersonasListado() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);

  // Filtrar y buscar personas
  const filteredPersonas = useMemo(() => {
    return mockPersonas.filter(persona => {
      const matchesSearch = persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           persona.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           persona.dni.includes(searchTerm);
      
      const matchesTipo = tipoFilter === 'todos' || 
                         (tipoFilter === 'propietarios' && persona.tipo === 'Propietario') ||
                         (tipoFilter === 'inquilinos' && persona.tipo === 'Inquilino') ||
                         (tipoFilter === 'administradores' && persona.tipo === 'Administrador');
      
      const matchesEstado = estadoFilter === 'todos' || 
                           (estadoFilter === 'activos' && persona.estado === 'Activo') ||
                           (estadoFilter === 'inactivos' && persona.estado === 'Inactivo');
      
      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [searchTerm, tipoFilter, estadoFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    const propietarios = mockPersonas.filter(p => p.tipo === 'Propietario').length;
    const inquilinos = mockPersonas.filter(p => p.tipo === 'Inquilino').length;
    const administradores = mockPersonas.filter(p => p.tipo === 'Administrador').length;
    
    return {
      total: mockPersonas.length,
      propietarios,
      inquilinos,
      administradores
    };
  }, []);



  return (
    <ProtectedRoute>
      <Head>
        <title>Personas — Cuentas Claras</title>
      </Head>

      <Layout title='Personas'>
        <div className='container-fluid py-4'>
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
          <PersonaStats
            total={stats.total}
            propietarios={stats.propietarios}
            inquilinos={stats.inquilinos}
            administradores={stats.administradores}
          />

          {/* Tabs de vista */}
          <PersonaViewTabs 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />

          {/* Vista de tabla */}
          {viewMode === 'table' && (
            <PersonaTable personas={filteredPersonas} />
          )}

          {/* Vista de tarjetas */}
          {viewMode === 'cards' && (
            <div className='row'>
              {filteredPersonas.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          )}

          {/* Paginación */}
          <PersonaPagination 
            currentPage={currentPage}
            totalPages={3}
            onPageChange={setCurrentPage}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
