import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';

// Hooks y servicios
import { useGastos, useGastoEstadisticas } from '@/hooks/useGastos';
import { useCategorias } from '@/hooks/useCategorias';

// Types
import type { Gasto, GastoFilters } from '@/types/gastos';

export default function GastosListado() {
  const router = useRouter();
  const { user } = useAuth();

  // Estados de filtros locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | undefined>();
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Estados de vista
  const [vistaActual, setVistaActual] = useState<'cards' | 'table'>('cards');
  const [gastosSeleccionados, setGastosSeleccionados] = useState<number[]>([]);

  // Determinar comunidadId basado en rol
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  // Filtros para el hook
  const [filtros, setFiltros] = useState<GastoFilters>({
    page: 1,
    limit: 20,
    ordenar: 'fecha',
    direccion: 'DESC'
  });

  // ✅ Establecer comunidad según rol del usuario
  useEffect(() => {
    if (user) {
      console.log('🔍 DEBUG COMPLETO DEL USUARIO:');
      console.log('- Username:', user.username);
      console.log('- Rol global:', user.rol_global);
      console.log('- ID:', user.id);
      console.log('- Persona ID:', user.persona_id);
      console.log('- Membresías (español):', user.membresias);
      console.log('- Memberships (inglés):', user.memberships);
      console.log('- Todas las propiedades:', Object.keys(user));
      console.log('- Usuario completo:', JSON.stringify(user, null, 2));

      // Normalizar membresías
      const membresias = user?.membresias || user?.memberships || [];

      console.log('🏢 Membresías procesadas:', membresias);

      if (membresias.length > 0) {
        // ✅ DETECTAR TANTO comunidad_id COMO comunidadId
        const comunidadId = membresias[0].comunidad_id || membresias[0].comunidadId;
        setComunidadId(comunidadId);
        console.log('✅ Comunidad establecida:', comunidadId);
      } else {
        console.log('⚠️ Usuario sin membresías');
        setComunidadId(null);
      }
    }
  }, [user]);

  // ✅ USAR LOS HOOKS CORREGIDOS (eliminar duplicación de estadisticas)
  const { gastos, loading, error, updateFilters, refetch } = useGastos(comunidadId || 0, filtros);
  const { estadisticas: statsFromHook } = useGastoEstadisticas(comunidadId || 0);
  const { categorias } = useCategorias(comunidadId || 0);

  // ✅ Filtrar gastos localmente
  const gastosFiltrados = React.useMemo(() => {
    let filtered = [...gastos];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(gasto =>
        gasto.glosa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.creado_por_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (selectedEstado) {
      filtered = filtered.filter(gasto => gasto.estado === selectedEstado);
    }

    // Filtro por categoría
    if (selectedCategoria) {
      filtered = filtered.filter(gasto => gasto.categoria_id === selectedCategoria);
    }

    // Filtro por fechas
    if (fechaDesde) {
      filtered = filtered.filter(gasto => gasto.fecha >= fechaDesde);
    }
    if (fechaHasta) {
      filtered = filtered.filter(gasto => gasto.fecha <= fechaHasta);
    }

    return filtered;
  }, [gastos, searchTerm, selectedEstado, selectedCategoria, fechaDesde, fechaHasta]);

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getEstadoColor = (estado: string) => {
    const colores = {
      borrador: 'secondary',
      pendiente_aprobacion: 'warning',
      aprobado: 'success',
      rechazado: 'danger',
      pagado: 'primary',
      anulado: 'dark'
    };
    return colores[estado as keyof typeof colores] || 'secondary';
  };

  const getCategoriaColor = (tipo: string) => {
    const colores = {
      operacional: 'primary',
      extraordinario: 'warning',
      fondo_reserva: 'success',
      multas: 'danger',
      consumo: 'info'
    };
    return colores[tipo as keyof typeof colores] || 'secondary';
  };

  // Permisos
  const canCreate = user?.rol_global === 'super_admin' || user?.is_superadmin ||
    (comunidadId && (user?.membresias || user?.memberships || []).find(m =>
      (m.comunidad_id === comunidadId || m.comunidadId === comunidadId) &&
      ['administrador', 'tesorero', 'admin'].includes(m.rol || m.role)
    ));

  const canApprove = user?.rol_global === 'super_admin' || user?.is_superadmin ||
    (comunidadId && (user?.membresias || user?.memberships || []).find(m =>
      (m.comunidad_id === comunidadId || m.comunidadId === comunidadId) &&
      ['administrador', 'admin'].includes(m.rol || m.role)
    ));

  // Render de estadísticas
  const renderEstadisticas = () => {
    if (!statsFromHook) return null;

    return (
      <div className="row mb-4">
        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">receipt_long</span>
                <div>
                  <div className="fs-4 fw-bold">{statsFromHook.total_gastos || 0}</div>
                  <div className="small">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">pending</span>
                <div>
                  <div className="fs-4 fw-bold">{statsFromHook.pendientes || 0}</div>
                  <div className="small">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">check_circle</span>
                <div>
                  <div className="fs-4 fw-bold">{statsFromHook.aprobados || 0}</div>
                  <div className="small">Aprobados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">paid</span>
                <div>
                  <div className="fs-4 fw-bold">{statsFromHook.pagados || 0}</div>
                  <div className="small">Pagados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">attach_money</span>
                <div>
                  <div className="fs-4 fw-bold">
                    {formatCurrency(statsFromHook.monto_total || 0)}
                  </div>
                  <div className="small">Monto Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-secondary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">calendar_month</span>
                <div>
                  <div className="fs-4 fw-bold">
                    {formatCurrency(statsFromHook.monto_anio_actual || 0)}
                  </div>
                  <div className="small">Este Año</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ MOSTRAR DEBUG SI NO HAY COMUNIDAD
  if (!comunidadId) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container-fluid p-4">
            <div className="alert alert-warning">
              <strong>🔍 Debug: Sin acceso a comunidad</strong><br />
              <div className="mt-3">
                <strong>Usuario:</strong> {user?.username}<br />
                <strong>Rol global:</strong> {user?.rol_global}<br />
                <strong>Membresías encontradas:</strong> {JSON.stringify(user?.membresias || user?.memberships || [], null, 2)}
              </div>
              <div className="mt-3">
                <small>Este mensaje desaparecerá cuando tengas membresías correctas desde el backend.</small>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Gastos — Cuentas Claras</title>
      </Head>

      <Layout title='Gastos'>
        <div className='container-fluid py-4'>

          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>Gastos</h1>
              <p className='text-muted mb-0'>
                Gestión de gastos de la comunidad ID: {comunidadId}
              </p>
            </div>

            <div className="d-flex gap-2">
              {/* Botón exportar */}
              <button className="btn btn-outline-primary">
                <span className="material-icons me-2">download</span>
                Exportar
              </button>

              {/* Botón nuevo gasto */}
              {canCreate && (
                <Link href="/gasto-nuevo" className='btn btn-primary'>
                  <span className='material-icons me-2'>add</span>
                  Nuevo Gasto
                </Link>
              )}
            </div>
          </div>

          {/* Debug info temporal */}
          <div className="alert alert-info mb-4">
            <strong>🔍 Debug Info:</strong><br />
            <small>
              Comunidad ID: {comunidadId} |
              Gastos: {gastos.length} |
              Loading: {loading ? 'Sí' : 'No'} |
              Error: {error || 'Ninguno'} |
              Categorías: {categorias.length}
            </small>
          </div>

          {/* Estadísticas */}
          {renderEstadisticas()}

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                {/* Búsqueda */}
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <span className="material-icons">search</span>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar gastos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtro por estado */}
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="borrador">Borrador</option>
                    <option value="pendiente_aprobacion">Pendientes</option>
                    <option value="aprobado">Aprobados</option>
                    <option value="rechazado">Rechazados</option>
                    <option value="pagado">Pagados</option>
                    <option value="anulado">Anulados</option>
                  </select>
                </div>

                {/* Filtro por categoría */}
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedCategoria || ''}
                    onChange={(e) => setSelectedCategoria(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha desde */}
                <div className="col-md-2">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Fecha desde"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>

                {/* Fecha hasta */}
                <div className="col-md-1">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Fecha hasta"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>

                {/* Toggle de vista */}
                <div className="col-md-1">
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${vistaActual === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaActual('cards')}
                    >
                      <span className="material-icons">view_module</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${vistaActual === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaActual('table')}
                    >
                      <span className="material-icons">view_list</span>
                    </button>
                  </div>
                </div>

                {/* Limpiar filtros */}
                <div className="col-md-1">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedEstado('');
                      setSelectedCategoria(undefined);
                      setFechaDesde('');
                      setFechaHasta('');
                    }}
                  >
                    <span className="material-icons">clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando gastos...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
              <button className="btn btn-link p-0 mt-1 d-block" onClick={refetch}>
                Reintentar
              </button>
            </div>
          ) : gastosFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <span className="material-icons display-1 text-muted">receipt_long</span>
              <h5 className="mt-3">No se encontraron gastos</h5>
              <p className="text-muted">
                {searchTerm || selectedEstado || selectedCategoria || fechaDesde || fechaHasta
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay gastos registrados aún'
                }
              </p>
              {canCreate && !searchTerm && (
                <Link href="/gasto-nuevo" className="btn btn-primary mt-3">
                  <span className="material-icons me-2">add</span>
                  Crear Primer Gasto
                </Link>
              )}
            </div>
          ) : (
            <div className="row">
              {gastosFiltrados.map((gasto) => (
                <div key={gasto.id} className={vistaActual === 'cards' ? 'col-md-6 col-lg-4 mb-3' : 'col-12 mb-2'}>
                  {vistaActual === 'cards' ? (
                    /* Card View */
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="card-title mb-0">{gasto.glosa}</h6>
                          <small className="text-muted">#{gasto.numero}</small>
                        </div>
                        <div className="d-flex gap-1">
                          <span className={`badge bg-${getEstadoColor(gasto.estado)}`}>
                            {gasto.estado.replace('_', ' ')}
                          </span>
                          {gasto.extraordinario && (
                            <span className="badge bg-warning">Extraordinario</span>
                          )}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <span className={`badge bg-${getCategoriaColor(gasto.categoria_tipo || '')}`}>
                            {gasto.categoria_nombre}
                          </span>
                        </div>
                        <div className="row text-sm">
                          <div className="col-6">
                            <strong>Monto:</strong><br />
                            <span className="text-primary fw-bold">
                              {formatCurrency(gasto.monto)}
                            </span>
                          </div>
                          <div className="col-6">
                            <strong>Fecha:</strong><br />
                            <span className="text-muted">
                              {formatDate(gasto.fecha)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {gasto.creado_por_nombre || 'Sistema'}
                          </small>
                          <Link
                            href={`/gastos/${gasto.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Ver detalle
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Table Row */
                    <div className="card">
                      <div className="card-body py-2">
                        <div className="row align-items-center">
                          <div className="col-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={gastosSeleccionados.includes(gasto.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setGastosSeleccionados([...gastosSeleccionados, gasto.id]);
                                } else {
                                  setGastosSeleccionados(gastosSeleccionados.filter(id => id !== gasto.id));
                                }
                              }}
                            />
                          </div>
                          <div className="col-3">
                            <div className="fw-bold">{gasto.glosa}</div>
                            <small className="text-muted">#{gasto.numero}</small>
                          </div>
                          <div className="col-2">
                            <span className={`badge bg-${getCategoriaColor(gasto.categoria_tipo || '')}`}>
                              {gasto.categoria_nombre}
                            </span>
                          </div>
                          <div className="col-2 text-center">
                            <div className="fw-bold text-primary">{formatCurrency(gasto.monto)}</div>
                            <small className="text-muted">{formatDate(gasto.fecha)}</small>
                          </div>
                          <div className="col-2 text-center">
                            <span className={`badge bg-${getEstadoColor(gasto.estado)}`}>
                              {gasto.estado.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="col-2 text-end">
                            <Link
                              href={`/gastos/${gasto.id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <span className="material-icons">visibility</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}