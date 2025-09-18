import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';
import Link from 'next/link';

// Componentes específicos
import ComunidadCard from '@/components/comunidades/ComunidadCard';
import ComunidadTable from '@/components/comunidades/ComunidadTable';
import FilterContainer from '@/components/comunidades/FilterContainer';
import ViewToggle from '@/components/comunidades/ViewToggle';

// Tipos y servicios
import { Comunidad, ComunidadFiltros, VistaConfiguracion } from '@/types/comunidades';
import comunidadesService from '@/lib/comunidadesService';

export default function ComunidadesListado() {
  const router = useRouter();
  
  // Estados principales
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [comunidadesFiltradas, setComunidadesFiltradas] = useState<Comunidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de filtros y configuración
  const [filtros, setFiltros] = useState<ComunidadFiltros>({
    busqueda: '',
    tipo: '',
    estado: '',
    administrador: '',
    ordenarPor: 'nombre',
    orden: 'asc'
  });
  
  const [configuracionVista, setConfiguracionVista] = useState<VistaConfiguracion>({
    tipoVista: 'cards',
    itemsPorPagina: 12,
    ordenarPor: 'nombre',
    direccionOrden: 'asc'
  });

  // Cargar comunidades
  useEffect(() => {
    loadComunidades();
  }, []);

  const loadComunidades = async () => {
    setIsLoading(true);
    try {
      const data = await comunidadesService.getComunidades();
      setComunidades(data);
    } catch (error) {
      console.error('Error loading comunidades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let resultado = [...comunidades];

    // Aplicar filtros
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(comunidad =>
        comunidad.nombre.toLowerCase().includes(busqueda) ||
        comunidad.direccion.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.tipo) {
      resultado = resultado.filter(comunidad => comunidad.tipo === filtros.tipo);
    }

    if (filtros.estado) {
      resultado = resultado.filter(comunidad => comunidad.estado === filtros.estado);
    }

    if (filtros.administrador) {
      const admin = filtros.administrador.toLowerCase();
      resultado = resultado.filter(comunidad =>
        comunidad.administrador.toLowerCase().includes(admin)
      );
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      let valorA: any = a[configuracionVista.ordenarPor as keyof Comunidad];
      let valorB: any = b[configuracionVista.ordenarPor as keyof Comunidad];

      // Convertir a string para comparación
      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      const comparacion = valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      return configuracionVista.direccionOrden === 'asc' ? comparacion : -comparacion;
    });

    setComunidadesFiltradas(resultado);
  }, [comunidades, filtros, configuracionVista]);

  // Manejadores de eventos
  const handleEdit = (id: number) => {
    router.push(`/comunidades/nueva?id=${id}&edit=true`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta comunidad?')) {
      try {
        await comunidadesService.deleteComunidad(id);
        await loadComunidades();
      } catch (error) {
        console.error('Error deleting comunidad:', error);
        alert('Error al eliminar la comunidad');
      }
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Comunidades — Cuentas Claras</title>
      </Head>

      <Layout title='Comunidades'>
        <div className='container-fluid py-4'>
          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>Comunidades</h1>
              <p className='text-muted mb-0'>Gestión y administración de comunidades</p>
            </div>
            
            <Link href="/comunidades/nueva" className='btn btn-primary'>
              <span className='material-icons me-2'>add</span>
              Nueva Comunidad
            </Link>
          </div>
          
          {/* Filtros */}
          <FilterContainer
            filtros={filtros}
            onFiltrosChange={setFiltros}
            totalResultados={comunidadesFiltradas.length}
          />
          
          {/* Toggle de vista y ordenamiento */}
          <ViewToggle
            configuracion={configuracionVista}
            onConfiguracionChange={setConfiguracionVista}
            totalResultados={comunidadesFiltradas.length}
          />
          
          {/* Contenido principal */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mt-3">Cargando comunidades...</p>
            </div>
          ) : (
            <>
              {/* Vista de tarjetas */}
              {configuracionVista.tipoVista === 'cards' && (
                <div className="row g-4 mb-4">
                  {comunidadesFiltradas.length > 0 ? (
                    comunidadesFiltradas.map(comunidad => (
                      <ComunidadCard
                        key={comunidad.id}
                        comunidad={comunidad}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="text-center py-5">
                        <span className="material-icons text-muted mb-3" style={{ fontSize: '64px' }}>domain</span>
                        <h5 className="text-muted">No se encontraron comunidades</h5>
                        <p className="text-muted">No hay comunidades que coincidan con los filtros aplicados.</p>
                        <Link href="/comunidades/nueva" className="btn btn-primary">
                          <span className="material-icons me-2">add</span>
                          Crear primera comunidad
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Vista de tabla */}
              {configuracionVista.tipoVista === 'table' && (
                <ComunidadTable
                  comunidades={comunidadesFiltradas}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              
              {/* Paginación (implementar si es necesario) */}
              {comunidadesFiltradas.length > configuracionVista.itemsPorPagina && (
                <nav aria-label="Navegación de páginas" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className="page-item disabled">
                      <span className="page-link">Anterior</span>
                    </li>
                    <li className="page-item active">
                      <span className="page-link">1</span>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">2</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">3</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">Siguiente</a>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
