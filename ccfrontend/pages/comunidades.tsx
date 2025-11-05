import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import ComunidadCard from '@/components/comunidades/ComunidadCard';
import ComunidadTable from '@/components/comunidades/ComunidadTable';
import FilterContainer from '@/components/comunidades/FilterContainer';
import ViewToggle from '@/components/comunidades/ViewToggle';
import Layout from '@/components/layout/Layout';
import comunidadesService from '@/lib/comunidadesService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth'; // ✅ AGREGAR useAuth
import {
  Comunidad,
  ComunidadFiltros,
  VistaConfiguracion,
} from '@/types/comunidades';

export default function ComunidadesListado() {
  const router = useRouter();
  const { user } = useAuth(); // ✅ AGREGAR hook de autenticación

  // Estados principales
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [comunidadesFiltradas, setComunidadesFiltradas] = useState<Comunidad[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y configuración
  const [filtros, setFiltros] = useState<ComunidadFiltros>({
    busqueda: '',
    tipo: '',
    estado: '',
    administrador: '',
    ordenarPor: 'nombre',
    orden: 'asc',
  });

  const [configuracionVista, setConfiguracionVista] =
    useState<VistaConfiguracion>({
      tipoVista: 'cards',
      itemsPorPagina: 12,
      ordenarPor: 'nombre',
      direccionOrden: 'asc',
    });

  // Cargar comunidades
  useEffect(() => {
    loadComunidades();
  }, []);

  const loadComunidades = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line no-console
      console.log('👤 Usuario actual:', user);
      // eslint-disable-next-line no-console
      console.log('👑 Es superadmin:', user?.is_superadmin);

      // El backend ya filtra las comunidades basado en permisos de usuario
      // No necesitamos lógica diferente para superadmin vs usuarios normales
      const data = await comunidadesService.getComunidades();
      setComunidades(data);
      // eslint-disable-next-line no-console
      console.log(`📊 Total comunidades cargadas: ${data.length}`);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('❌ Error loading comunidades:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al cargar las comunidades. Por favor, intente nuevamente.';
      setError(errorMessage);
      setComunidades([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MODIFICAR: Cargar cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      loadComunidades();
    }
  }, [user]); // ✅ Dependencia en user

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let resultado = [...comunidades];

    // Aplicar filtros
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        comunidad =>
          comunidad.nombre.toLowerCase().includes(busqueda) ||
          comunidad.direccion.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.tipo) {
      resultado = resultado.filter(
        comunidad => comunidad.tipo === filtros.tipo
      );
    }

    if (filtros.estado) {
      resultado = resultado.filter(
        comunidad => comunidad.estado === filtros.estado
      );
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
      return configuracionVista.direccionOrden === 'asc'
        ? comparacion
        : -comparacion;
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
        // eslint-disable-next-line no-console
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
              <p className='text-muted mb-0'>
                Gestión y administración de comunidades
              </p>
            </div>

            {/* ✅ CONDICIONAL: Solo superadmins pueden crear comunidades */}
            {user?.is_superadmin && (
              <Link href='/comunidades/nueva' className='btn btn-primary'>
                <span className='material-icons me-2'>add</span>
                Nueva Comunidad
              </Link>
            )}
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

          {/* Alerta de error */}
          {error && (
            <div
              className='alert alert-danger alert-dismissible fade show'
              role='alert'
            >
              <div className='d-flex align-items-center'>
                <span className='material-icons me-2'>error</span>
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
              <button
                type='button'
                className='btn-close'
                onClick={() => setError(null)}
                aria-label='Cerrar'
              />
            </div>
          )}

          {/* Contenido principal */}
          {isLoading ? (
            <div className='text-center py-5'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Cargando...</span>
              </div>
              <p className='text-muted mt-3'>Cargando comunidades...</p>
            </div>
          ) : (
            <>
              {/* Vista de tarjetas */}
              {configuracionVista.tipoVista === 'cards' && (
                <div className='row g-4 mb-4'>
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
                    <div className='col-12'>
                      <div className='text-center py-5'>
                        <span
                          className='material-icons text-muted mb-3'
                          style={{ fontSize: '64px' }}
                        >
                          domain
                        </span>
                        <h5 className='text-muted'>
                          No se encontraron comunidades
                        </h5>
                        <p className='text-muted'>
                          No hay comunidades que coincidan con los filtros
                          aplicados.
                        </p>
                        <Link
                          href='/comunidades/nueva'
                          className='btn btn-primary'
                        >
                          <span className='material-icons me-2'>add</span>
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
              {comunidadesFiltradas.length >
                configuracionVista.itemsPorPagina && (
                <nav aria-label='Navegación de páginas' className='mt-4'>
                  <ul className='pagination justify-content-center'>
                    <li className='page-item disabled'>
                      <span className='page-link'>Anterior</span>
                    </li>
                    <li className='page-item active'>
                      <span className='page-link'>1</span>
                    </li>
                    <li className='page-item'>
                      <button className='page-link' type='button'>
                        2
                      </button>
                    </li>
                    <li className='page-item'>
                      <button className='page-link' type='button'>
                        3
                      </button>
                    </li>
                    <li className='page-item'>
                      <button className='page-link' type='button'>
                        Siguiente
                      </button>
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
