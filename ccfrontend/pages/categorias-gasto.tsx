import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { useCategorias } from '@/hooks/useCategorias';
import type { CategoriaGasto, CategoriaCreateRequest } from '@/types/gastos';

interface CategoriasEstadisticas {
  total: number;
  activas: number;
  inactivas: number;
  operacionales: number;
  extraordinarias: number;
  fondo_reserva: number;
  multas: number;
  consumo: number;
  total_gastos: number;
  monto_total: number;
}

export default function CategoriasGastoListado() {
  const router = useRouter();
  const { user } = useAuth();

  // Estados principales
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [estadisticas, setEstadisticas] = useState<CategoriasEstadisticas | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [onlyWithGastos, setOnlyWithGastos] = useState(false);

  // Estados de vista
  const [vistaActual, setVistaActual] = useState<'cards' | 'table'>('cards');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<number[]>([]);

  // Estados de modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaGasto | null>(null);
  const [formData, setFormData] = useState<CategoriaCreateRequest>({
    nombre: '',
    tipo: 'operacional',
    cta_contable: ''
  });

  // ✅ LÓGICA SIMPLIFICADA PARA COMUNIDAD Y SUPERADMIN
  const { comunidadId, isSuperAdmin } = useMemo(() => {
    if (!user) return { comunidadId: null, isSuperAdmin: false };

    const esSuper = user?.rol_global === 'super_admin' || user?.is_superadmin;

    if (esSuper) {
      return { comunidadId: 0, isSuperAdmin: true }; // 0 = todas las comunidades
    }

    const membresias = user?.membresias || user?.memberships || [];
    const comunidadId = membresias.length > 0
      ? (membresias[0].comunidad_id || membresias[0].comunidadId)
      : null;

    return { comunidadId, isSuperAdmin: false };
  }, [user]);

  // ✅ VERIFICACIÓN DE ROLES CON ACCESO
  const userHasAccess = useMemo(() => {
    if (!user) return false;

    // SuperAdmin siempre tiene acceso
    if (user?.rol_global === 'super_admin' || user?.is_superadmin) {
      return true;
    }

    // Verificar roles permitidos
    const membresias = user?.membresias || user?.memberships || [];
    const ROLES_CON_ACCESO = ['admin', 'administrador', 'tesorero', 'contador', 'comite'];

    return membresias.some(membresia => {
      const rol = membresia.rol || membresia.role;
      return ROLES_CON_ACCESO.includes(rol);
    });
  }, [user]);

  // ✅ HOOK SIMPLIFICADO
  const {
    categorias: categoriasFromHook,
    estadisticas: estadisticasFromHook,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoria,
    refetch
  } = useCategorias(comunidadId, isSuperAdmin);

  // ✅ ACTUALIZAR DATOS CUANDO CAMBIAN
  useEffect(() => {
    if (categoriasFromHook) {
      setCategorias(categoriasFromHook);
      // 🔍 DEBUG - Ver qué datos llegan
      console.log('📊 Datos de categorías:', categoriasFromHook.map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        total_gastos: cat.total_gastos,
        monto_total: cat.monto_total,
        monto_anio_actual: cat.monto_anio_actual,
        tipo: typeof cat.total_gastos
      })));
    }

    if (estadisticasFromHook) {
      setEstadisticas(estadisticasFromHook);
    } else if (categoriasFromHook?.length) {
      // Calcular estadísticas localmente como fallback
      const stats: CategoriasEstadisticas = {
        total: categoriasFromHook.length,
        activas: categoriasFromHook.filter(c => c.activa).length,
        inactivas: categoriasFromHook.filter(c => !c.activa).length,
        operacionales: categoriasFromHook.filter(c => c.tipo === 'operacional').length,
        extraordinarias: categoriasFromHook.filter(c => c.tipo === 'extraordinario').length,
        fondo_reserva: categoriasFromHook.filter(c => c.tipo === 'fondo_reserva').length,
        multas: categoriasFromHook.filter(c => c.tipo === 'multas').length,
        consumo: categoriasFromHook.filter(c => c.tipo === 'consumo').length,
        total_gastos: categoriasFromHook.reduce((sum, c) => sum + (c.total_gastos || 0), 0),
        monto_total: categoriasFromHook.reduce((sum, c) => sum + (c.monto_total || 0), 0)
      };
      setEstadisticas(stats);
    }
  }, [categoriasFromHook, estadisticasFromHook]);

  // ✅ FILTROS OPTIMIZADOS CON useMemo
  const categoriasFiltradas = useMemo(() => {
    let filtered = [...categorias];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(categoria =>
        categoria.nombre.toLowerCase().includes(term) ||
        categoria.cta_contable?.toLowerCase().includes(term)
      );
    }

    if (selectedTipo) {
      filtered = filtered.filter(categoria => categoria.tipo === selectedTipo);
    }

    if (selectedEstado === 'activa') {
      filtered = filtered.filter(categoria => categoria.activa);
    } else if (selectedEstado === 'inactiva') {
      filtered = filtered.filter(categoria => !categoria.activa);
    }

    if (onlyWithGastos) {
      filtered = filtered.filter(categoria => (categoria.total_gastos || 0) > 0);
    }

    return filtered;
  }, [categorias, searchTerm, selectedTipo, selectedEstado, onlyWithGastos]);

  // ✅ PERMISOS OPTIMIZADOS
  const permissions = useMemo(() => {
    if (!user) return { canCreate: false, canEdit: false, canDelete: false, canViewAll: false };

    // SuperAdmin puede todo
    if (isSuperAdmin) {
      return { canCreate: true, canEdit: true, canDelete: true, canViewAll: true };
    }

    // Usuario normal: verificar membresías
    const membresias = user.membresias || user.memberships || [];
    const membresiaActual = membresias.find(m =>
      (m.comunidad_id === comunidadId || m.comunidadId === comunidadId)
    );

    if (!membresiaActual) {
      return { canCreate: false, canEdit: false, canDelete: false, canViewAll: false };
    }

    const rol = membresiaActual.rol || membresiaActual.role;

    switch (rol) {
      case 'administrador':
      case 'admin':
        return { canCreate: true, canEdit: true, canDelete: true, canViewAll: false };
      case 'tesorero':
      case 'contador':
        return { canCreate: true, canEdit: true, canDelete: false, canViewAll: false };
      case 'comite':  // ← AGREGAR ESTA LÍNEA
        return { canCreate: true, canEdit: true, canDelete: false, canViewAll: false };
      default:
        return { canCreate: false, canEdit: false, canDelete: false, canViewAll: false };
    }
  }, [user, isSuperAdmin, comunidadId]);

  // ✅ FUNCIONES DE PERMISOS SIMPLIFICADAS
  const canEditCategoria = (categoria: CategoriaGasto) => {
    if (permissions.canViewAll) {
      return !categoria.es_global; // SuperAdmin no puede editar globales del sistema
    }
    return permissions.canEdit && !categoria.es_global && categoria.comunidad_id === comunidadId;
  };

  const canDeleteCategoria = (categoria: CategoriaGasto) => {
    if ((categoria.total_gastos || 0) > 0 || categoria.es_global) return false;

    if (permissions.canViewAll) return true; // SuperAdmin puede eliminar sin gastos

    return permissions.canDelete && categoria.comunidad_id === comunidadId;
  };

  // ✅ HANDLERS SIMPLIFICADOS
  const handleCreateCategoria = () => {
    if (!permissions.canCreate) {
      toast.error('No tienes permisos para crear categorías');
      return;
    }

    // Solo mostrar error si SuperAdmin está viendo todas las comunidades
    if (isSuperAdmin && comunidadId === 0) {
      toast.error('Como SuperAdmin, debes seleccionar una comunidad específica primero');
      return;
    }

    setEditingCategoria(null);
    setFormData({ nombre: '', tipo: 'operacional', cta_contable: '' });
    setShowModal(true);
  };

  const handleEditCategoria = (categoria: CategoriaGasto) => {
    if (!canEditCategoria(categoria)) {
      toast.error('No tienes permisos para editar esta categoría');
      return;
    }

    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      cta_contable: categoria.cta_contable || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (categoria: CategoriaGasto) => {
    if (!canEditCategoria(categoria)) {
      toast.error('No tienes permisos para cambiar el estado de esta categoría');
      return;
    }

    try {
      await toggleCategoria(categoria.id, !categoria.activa);
      toast.success(`Categoría ${categoria.activa ? 'desactivada' : 'activada'} exitosamente`);
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado de la categoría');
    }
  };

  const handleDeleteCategoria = async (categoria: CategoriaGasto) => {
    if (!canDeleteCategoria(categoria)) {
      const mensaje = (categoria.total_gastos || 0) > 0
        ? `No se puede eliminar la categoría porque tiene ${categoria.total_gastos} gastos asociados`
        : 'No tienes permisos para eliminar esta categoría';
      toast.error(mensaje);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) return;

    try {
      await deleteCategoria(categoria.id);
      toast.success('Categoría eliminada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la categoría');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createCategoria(formData);
        toast.success('Categoría creada exitosamente');
      }
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la solicitud');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTipo('');
    setSelectedEstado('');
    setOnlyWithGastos(false);
  };

  // ✅ HELPERS OPTIMIZADOS
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      operacional: 'Operacional',
      extraordinario: 'Extraordinario',
      fondo_reserva: 'Fondo de Reserva',
      multas: 'Multas',
      consumo: 'Consumo'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoClass = (tipo: string) => {
    const classes: Record<string, string> = {
      operacional: 'badge bg-primary',
      extraordinario: 'badge bg-warning text-dark',
      fondo_reserva: 'badge bg-success',
      multas: 'badge bg-danger',
      consumo: 'badge bg-info'
    };
    return classes[tipo] || 'badge bg-light text-dark';
  };

  // ✅ COMPONENTE DE ESTADÍSTICAS
  const EstadisticasCards = () => {
    if (!estadisticas) return null;

    const cards = [
      { title: 'Total', value: estadisticas.total, icon: 'category', color: 'primary' },
      { title: 'Activas', value: estadisticas.activas, icon: 'check_circle', color: 'success' },
      { title: 'Operacionales', value: estadisticas.operacionales, icon: 'build', color: 'warning' },
      { title: 'Extraordinarias', value: estadisticas.extraordinarias, icon: 'flash_on', color: 'info' },
      { title: 'Total Gastos', value: estadisticas.total_gastos, icon: 'receipt_long', color: 'secondary' },
      { title: 'Monto Total', value: formatCurrency(estadisticas.monto_total), icon: 'attach_money', color: 'dark' }
    ];

    return (
      <div className="row mb-4">
        {cards.map((card, index) => (
          <div key={index} className="col-md-2 col-6 mb-3">
            <div className={`card bg-${card.color} text-white h-100`}>
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <span className="material-icons fs-1 me-3">{card.icon}</span>
                  <div>
                    <div className="fs-4 fw-bold">{card.value}</div>
                    <div className="small">{card.title}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ VERIFICACIÓN DE ACCESO SIMPLIFICADA
  if (!isSuperAdmin && (!comunidadId || comunidadId === 0)) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container-fluid p-4">
            <div className="alert alert-warning">
              <span className="material-icons me-2">warning</span>
              <strong>Sin acceso a comunidad</strong><br />
              No tienes acceso a ninguna comunidad o aún se está cargando la información.
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // ✅ BLOQUEAR ACCESO SI NO TIENE PERMISOS (DESPUÉS DE LA LÍNEA 350)
  if (!userHasAccess) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container-fluid p-4">
            <div className="alert alert-danger d-flex align-items-center">
              <span className="material-icons me-2">block</span>
              <div>
                <h5 className="mb-1">Acceso Denegado</h5>
                <p className="mb-0">
                  No tienes permisos para acceder a la gestión de categorías de gastos.
                  <br />
                  <small className="text-muted">
                    Solo administradores, tesoreros, contadores y comité pueden acceder.
                  </small>
                </p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // ✅ MEJORAR EL MANEJO DE DATOS DE CATEGORÍA
  const getCategoriaStats = (categoria: CategoriaGasto) => {
    return {
      totalGastos: Number(categoria.total_gastos) || 0,
      montoTotal: Number(categoria.monto_total) || 0,
      montoAnioActual: Number(categoria.monto_anio_actual) || 0
    };
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Categorías de Gastos — Cuentas Claras</title>
      </Head>

      <Layout title="Categorías de Gastos">
        <div className="container-fluid py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Categorías de Gastos</h1>
              <p className="text-muted mb-0">
                {isSuperAdmin
                  ? 'Gestiona categorías de todas las comunidades (SuperAdmin)'
                  : 'Gestiona las categorías para clasificar los gastos'
                }
              </p>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary">
                <span className="material-icons me-2">download</span>
                Exportar
              </button>

              {permissions.canCreate && (
                <button onClick={handleCreateCategoria} className="btn btn-primary">
                  <span className="material-icons me-2">add</span>
                  Nueva Categoría
                </button>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <EstadisticasCards />

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <span className="material-icons">search</span>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar categorías..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="operacional">Operacional</option>
                    <option value="extraordinario">Extraordinario</option>
                    <option value="fondo_reserva">Fondo de Reserva</option>
                    <option value="multas">Multas</option>
                    <option value="consumo">Consumo</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="activa">Solo activas</option>
                    <option value="inactiva">Solo inactivas</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="onlyWithGastos"
                      checked={onlyWithGastos}
                      onChange={(e) => setOnlyWithGastos(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="onlyWithGastos">
                      Solo con gastos
                    </label>
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${vistaActual === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaActual('cards')}
                      title="Vista Cards"
                    >
                      <span className="material-icons">view_module</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${vistaActual === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaActual('table')}
                      title="Vista Tabla"
                    >
                      <span className="material-icons">view_list</span>
                    </button>
                  </div>
                </div>

                <div className="col-md-1">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                    title="Limpiar filtros"
                  >
                    <span className="material-icons">clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">
              {categoriasFiltradas.length} categorías encontradas
            </span>
          </div>

          {/* Contenido principal */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3">Cargando categorías...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <span className="material-icons me-2">error</span>
              <div>
                <strong>Error:</strong> {error}
                <button
                  className="btn btn-link p-0 mt-1 d-block"
                  onClick={() => refetch()}
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : categoriasFiltradas.length === 0 ? (
            <div className="text-center py-5">
              <span className="material-icons display-1 text-muted">category</span>
              <h5 className="mt-3">No se encontraron categorías</h5>
              <p className="text-muted">
                {searchTerm || selectedTipo || selectedEstado || onlyWithGastos
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay categorías registradas aún'
                }
              </p>
              {permissions.canCreate && !searchTerm && (
                <button onClick={handleCreateCategoria} className="btn btn-primary mt-3">
                  <span className="material-icons me-2">add</span>
                  Crear Primera Categoría
                </button>
              )}
            </div>
          ) : (
            <div className="row">
              {categoriasFiltradas.map((categoria) => (
                <div
                  key={categoria.id}
                  className={vistaActual === 'cards' ? 'col-md-6 col-lg-4 mb-3' : 'col-12 mb-2'}
                >
                  {vistaActual === 'cards' ? (
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="card-title mb-0">{categoria.nombre}</h6>
                          {categoria.cta_contable && (
                            <small className="text-muted">Cta: {categoria.cta_contable}</small>
                          )}
                        </div>
                        <div className="d-flex gap-1">
                          <span className={getTipoClass(categoria.tipo)}>
                            {getTipoLabel(categoria.tipo)}
                          </span>
                          {categoria.es_global && (
                            <span className="badge bg-info">Global</span>
                          )}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row text-sm">
                          <div className="col-6">
                            <strong>Gastos:</strong><br />
                            <span className="text-primary fw-bold">
                              {getCategoriaStats(categoria).totalGastos}
                            </span>
                          </div>
                          <div className="col-6">
                            <strong>Monto Total:</strong><br />
                            <span className="text-success fw-bold">
                              {formatCurrency(getCategoriaStats(categoria).montoTotal)}
                            </span>
                          </div>
                        </div>
                        <div className="row text-sm mt-2">
                          <div className="col-12">
                            <strong>Este Año:</strong><br />
                            <span className="text-info fw-bold">
                              {formatCurrency(getCategoriaStats(categoria).montoAnioActual)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className={`badge ${categoria.activa ? 'bg-success' : 'bg-secondary'}`}>
                            {categoria.activa ? 'Activa' : 'Inactiva'}
                          </span>
                          <div className="d-flex gap-1">
                            {canEditCategoria(categoria) && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditCategoria(categoria)}
                                  title="Editar"
                                >
                                  <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                                </button>

                                <button
                                  className={`btn btn-sm ${categoria.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => handleToggleStatus(categoria)}
                                  title={categoria.activa ? 'Desactivar' : 'Activar'}
                                >
                                  <span className="material-icons" style={{ fontSize: '16px' }}>
                                    {categoria.activa ? 'pause' : 'play_arrow'}
                                  </span>
                                </button>

                                {canDeleteCategoria(categoria) && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCategoria(categoria)}
                                    title="Eliminar"
                                  >
                                    <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body py-2">
                        <div className="row align-items-center">
                          <div className="col-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={categoriasSeleccionadas.includes(categoria.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCategoriasSeleccionadas([...categoriasSeleccionadas, categoria.id]);
                                } else {
                                  setCategoriasSeleccionadas(categoriasSeleccionadas.filter(id => id !== categoria.id));
                                }
                              }}
                            />
                          </div>
                          <div className="col-3">
                            <div className="fw-bold">{categoria.nombre}</div>
                            {categoria.cta_contable && (
                              <small className="text-muted">Cta: {categoria.cta_contable}</small>
                            )}
                            {categoria.es_global && (
                              <span className="badge bg-info ms-1">Global</span>
                            )}
                          </div>
                          <div className="col-2">
                            <span className={getTipoClass(categoria.tipo)}>
                              {getTipoLabel(categoria.tipo)}
                            </span>
                          </div>
                          <div className="col-1 text-center">
                            <div className="fw-bold text-primary">{categoria.total_gastos || 0}</div>
                            <small className="text-muted">gastos</small>
                          </div>
                          <div className="col-2 text-center">
                            <div className="fw-bold text-success">{formatCurrency(categoria.monto_total || 0)}</div>
                            <small className="text-muted">{formatCurrency(categoria.monto_anio_actual || 0)} este año</small>
                          </div>
                          <div className="col-1 text-center">
                            <span className={`badge ${categoria.activa ? 'bg-success' : 'bg-secondary'}`}>
                              {categoria.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <div className="col-2 text-end">
                            {canEditCategoria(categoria) && (
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditCategoria(categoria)}
                                  title="Editar"
                                >
                                  <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                                </button>

                                <button
                                  className={`btn btn-sm ${categoria.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                  onClick={() => handleToggleStatus(categoria)}
                                  title={categoria.activa ? 'Desactivar' : 'Activar'}
                                >
                                  <span className="material-icons" style={{ fontSize: '16px' }}>
                                    {categoria.activa ? 'pause' : 'play_arrow'}
                                  </span>
                                </button>

                                {canDeleteCategoria(categoria) && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteCategoria(categoria)}
                                    title="Eliminar"
                                  >
                                    <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Acciones masivas */}
          {categoriasSeleccionadas.length > 0 && (
            <div className="card mt-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <span>{categoriasSeleccionadas.length} categorías seleccionadas</span>
                  <div className="d-flex gap-2">
                    {permissions.canEdit && (
                      <button className="btn btn-sm btn-outline-warning">
                        <span className="material-icons me-2">pause</span>
                        Desactivar seleccionadas
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-primary">
                      <span className="material-icons me-2">download</span>
                      Exportar seleccionadas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Formulario */}
          {showModal && (
            <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <form onSubmit={handleSubmitForm}>
                    <div className="modal-body">
                      <div className="row g-3">
                        <div className="col-12">
                          <label htmlFor="nombre" className="form-label">
                            Nombre de la categoría <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            required
                            maxLength={100}
                          />
                        </div>

                        <div className="col-12">
                          <label htmlFor="tipo" className="form-label">
                            Tipo <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            id="tipo"
                            value={formData.tipo}
                            onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                            required
                          >
                            <option value="operacional">Operacional</option>
                            <option value="extraordinario">Extraordinario</option>
                            <option value="fondo_reserva">Fondo de Reserva</option>
                            <option value="multas">Multas</option>
                            <option value="consumo">Consumo</option>
                          </select>
                        </div>

                        <div className="col-12">
                          <label htmlFor="cta_contable" className="form-label">
                            Cuenta Contable
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="cta_contable"
                            placeholder="Ej: 5101001"
                            value={formData.cta_contable}
                            onChange={(e) => setFormData(prev => ({ ...prev, cta_contable: e.target.value }))}
                            maxLength={20}
                          />
                          <div className="form-text">
                            Código de cuenta contable para reportes (opcional)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        <span className="material-icons align-middle me-1">
                          {editingCategoria ? 'save' : 'add'}
                        </span>
                        {editingCategoria ? 'Actualizar' : 'Crear'} Categoría
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>

      <style jsx>{`
        .modal.show {
          display: block !important;
        }
        
        .btn-outline-primary:hover,
        .btn-outline-warning:hover,
        .btn-outline-success:hover,
        .btn-outline-danger:hover {
          transform: translateY(-1px);
          transition: transform 0.2s ease;
        }

        .card {
          transition: box-shadow 0.2s ease;
        }

        .card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </ProtectedRoute>
  );
}