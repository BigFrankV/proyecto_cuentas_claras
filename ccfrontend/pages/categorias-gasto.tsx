import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';

// Hooks y servicios
import { useCategorias } from '@/hooks/useCategorias';

// Types
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
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<CategoriaGasto[]>([]);
  const [estadisticas, setEstadisticas] = useState<CategoriasEstadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Determinar comunidadId basado en rol
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  // ✅ Establecer comunidad según rol del usuario
  useEffect(() => {
    if (user) {
      console.log('👤 Usuario actual:', user);
      console.log('👑 Es superadmin:', user?.rol_global === 'super_admin');
      console.log('🏢 Membresías:', user?.membresias || user?.memberships);

      // Normalizar membresías
      const membresias = user?.membresias || user?.memberships || [];

      if (membresias.length > 0) {
        // ✅ DETECTAR TANTO comunidad_id COMO comunidadId
        const comunidadId = membresias[0].comunidad_id || membresias[0].comunidadId;
        setComunidadId(comunidadId);
        console.log('✅ Comunidad establecida para categorías:', comunidadId);
      } else {
        console.log('⚠️ Usuario sin membresías');
        setComunidadId(null);
      }
    }
  }, [user]);

  // Hook personalizado
  const {
    categorias: categoriasFromHook,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoria,
    refetch
  } = useCategorias(comunidadId || 0);

  // ✅ Cargar datos cuando tengamos comunidadId
  useEffect(() => {
    if (comunidadId && categoriasFromHook) {
      setCategorias(categoriasFromHook);

      // Calcular estadísticas
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
      setIsLoading(loading);
    }
  }, [comunidadId, categoriasFromHook, loading]);

  // Filtrar categorías localmente
  useEffect(() => {
    let categoriasFiltradas = [...categorias];

    // Filtro por búsqueda
    if (searchTerm) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoria.cta_contable?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (selectedTipo) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.tipo === selectedTipo);
    }

    // Filtro por estado
    if (selectedEstado === 'activa') {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => categoria.activa);
    } else if (selectedEstado === 'inactiva') {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => !categoria.activa);
    }

    // Filtro solo con gastos
    if (onlyWithGastos) {
      categoriasFiltradas = categoriasFiltradas.filter(categoria => (categoria.total_gastos || 0) > 0);
    }

    setCategoriasFiltradas(categoriasFiltradas);
  }, [categorias, searchTerm, selectedTipo, selectedEstado, onlyWithGastos]);

  // Handlers
  const handleCreateCategoria = () => {
    setEditingCategoria(null);
    setFormData({
      nombre: '',
      tipo: 'operacional',
      cta_contable: ''
    });
    setShowModal(true);
  };

  const handleEditCategoria = (categoria: CategoriaGasto) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      cta_contable: categoria.cta_contable || ''
    });
    setShowModal(true);
  };

  const handleDeleteCategoria = async (categoria: CategoriaGasto) => {
    if ((categoria.total_gastos || 0) > 0) {
      toast.error(`No se puede eliminar la categoría porque tiene ${categoria.total_gastos} gastos asociados`);
      return;
    }

    if (confirm(`¿Estás seguro de desactivar la categoría "${categoria.nombre}"?`)) {
      try {
        await deleteCategoria(categoria.id);
        toast.success('Categoría desactivada exitosamente');
      } catch (error) {
        toast.error('Error al desactivar la categoría');
      }
    }
  };

  const handleToggleStatus = async (categoria: CategoriaGasto) => {
    try {
      await toggleCategoria(categoria.id, !categoria.activa);
      toast.success(`Categoría ${categoria.activa ? 'desactivada' : 'activada'} exitosamente`);
    } catch (error) {
      toast.error('Error al cambiar el estado de la categoría');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    console.log('📤 Enviando formulario:', { formData, comunidadId });

    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createCategoria(formData);
        toast.success('Categoría creada exitosamente');
      }

      setShowModal(false);
      refetch();
    } catch (error: any) {
      console.error('❌ Error en formulario:', error);
      if (error.response?.status === 403) {
        toast.error('No tienes permisos para realizar esta acción');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al procesar la solicitud');
      }
    }
  };

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      operacional: 'Operacional',
      extraordinario: 'Extraordinario',
      fondo_reserva: 'Fondo de Reserva',
      multas: 'Multas',
      consumo: 'Consumo'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoClass = (tipo: string) => {
    const classes = {
      operacional: 'badge bg-primary',
      extraordinario: 'badge bg-warning text-dark',
      fondo_reserva: 'badge bg-success',
      multas: 'badge bg-danger',
      consumo: 'badge bg-info'
    };
    return classes[tipo as keyof typeof classes] || 'badge bg-light text-dark';
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

  const canEdit = (categoria: CategoriaGasto) => {
    return !categoria.es_global && canCreate;
  };

  // Render de estadísticas
  const renderEstadisticas = () => {
    if (!estadisticas) return null;

    return (
      <div className="row mb-4">
        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">category</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.total}</div>
                  <div className="small">Total</div>
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
                  <div className="fs-4 fw-bold">{estadisticas.activas}</div>
                  <div className="small">Activas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">build</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.operacionales}</div>
                  <div className="small">Operacionales</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">flash_on</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.extraordinarias}</div>
                  <div className="small">Extraordinarias</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-secondary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">receipt_long</span>
                <div>
                  <div className="fs-4 fw-bold">{estadisticas.total_gastos}</div>
                  <div className="small">Total Gastos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-2 col-6 mb-3">
          <div className="card bg-dark text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <span className="material-icons fs-1 me-3">attach_money</span>
                <div>
                  <div className="fs-4 fw-bold">
                    {formatCurrency(estadisticas.monto_total)}
                  </div>
                  <div className="small">Monto Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!comunidadId) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container-fluid p-4">
            <div className="alert alert-warning">
              <strong>Sin acceso a comunidad</strong><br />
              No tienes acceso a ninguna comunidad o aún se está cargando la información.
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Categorías de Gastos — Cuentas Claras</title>
      </Head>

      <Layout title='Categorías de Gastos'>
        <div className='container-fluid py-4'>

          {/* Header */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <div>
              <h1 className='h3 mb-0'>Categorías de Gastos</h1>
              <p className='text-muted mb-0'>
                Gestiona las categorías para clasificar los gastos
              </p>
            </div>

            <div className="d-flex gap-2">
              {/* Botón exportar */}
              <button className="btn btn-outline-primary">
                <span className="material-icons me-2">download</span>
                Exportar
              </button>

              {/* Botón nueva categoría */}
              {canCreate && (
                <button onClick={handleCreateCategoria} className='btn btn-primary'>
                  <span className='material-icons me-2'>add</span>
                  Nueva Categoría
                </button>
              )}
            </div>
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
                      placeholder="Buscar categorías..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtro por tipo */}
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

                {/* Filtro por estado */}
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

                {/* Filtro solo con gastos */}
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

                {/* Toggle de vista */}
                <div className="col-md-2">
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
                      setSelectedTipo('');
                      setSelectedEstado('');
                      setOnlyWithGastos(false);
                    }}
                  >
                    <span className="material-icons">clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {isLoading ? (
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
              {canCreate && !searchTerm && (
                <button onClick={handleCreateCategoria} className="btn btn-primary mt-3">
                  <span className="material-icons me-2">add</span>
                  Crear Primera Categoría
                </button>
              )}
            </div>
          ) : (
            <div className="row">
              {categoriasFiltradas.map((categoria) => (
                <div key={categoria.id} className={vistaActual === 'cards' ? 'col-md-6 col-lg-4 mb-3' : 'col-12 mb-2'}>
                  {vistaActual === 'cards' ? (
                    /* Card View */
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
                              {categoria.total_gastos || 0}
                            </span>
                          </div>
                          <div className="col-6">
                            <strong>Monto Total:</strong><br />
                            <span className="text-success fw-bold">
                              {formatCurrency(categoria.monto_total || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="row text-sm mt-2">
                          <div className="col-12">
                            <strong>Este Año:</strong><br />
                            <span className="text-info fw-bold">
                              {formatCurrency(categoria.monto_anio_actual || 0)}
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
                            {canEdit(categoria) && (
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

                                {(categoria.total_gastos || 0) === 0 && (
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
                    /* Table Row */
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
                            {canEdit(categoria) && (
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

                                {(categoria.total_gastos || 0) === 0 && (
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
                    {canCreate && (
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

          {/* View Options */}
          <div className="view-options">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="text-muted">
                  {filteredCategories.length} categorías encontradas
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="btn-group" role="group">
                  <Button 
                    variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <span className="material-icons">view_list</span>
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <span className="material-icons">grid_view</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

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
        .table th {
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }
        
        .modal.show {
          display: block !important;
        }
        
        .btn-outline-primary:hover,
        .btn-outline-warning:hover,
        .btn-outline-success:hover,
        .btn-outline-danger:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </ProtectedRoute>
  );
}