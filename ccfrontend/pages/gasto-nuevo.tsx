import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { ProtectedRoute, useAuth } from '../lib/useAuth';

// Services
import { gastosService } from '../lib/gastosService';

// Types
import type { CategoriaGasto, GastoCreateRequest } from '../types/gastos';

const NuevoGastoPage: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Determinar comunidadId basado en rol del usuario
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  // Estados
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  
  const [formData, setFormData] = useState<GastoCreateRequest>({
    categoria_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    glosa: '',
    extraordinario: false
  });

  // ✅ Establecer comunidad según rol del usuario
  useEffect(() => {
    if (user) {
      console.log('🔍 Usuario en gasto-nuevo:', user);
      
      // Normalizar membresías
      const membresias = user?.membresias || user?.memberships || [];
      
      if (membresias.length > 0) {
        const comunidadId = membresias[0].comunidad_id || membresias[0].comunidadId;
        setComunidadId(comunidadId);
        console.log('✅ Comunidad establecida para nuevo gasto:', comunidadId);
      } else {
        console.log('⚠️ Usuario sin membresías');
        setComunidadId(null);
      }
    }
  }, [user]);

  // ✅ Cargar categorías cuando tengamos la comunidad
  useEffect(() => {
    const loadCategorias = async () => {
      if (!comunidadId) return;
      
      try {
        setLoadingCategorias(true);
        console.log('🔄 Cargando categorías para comunidad:', comunidadId);
        
        const data = await gastosService.getCategorias(comunidadId);
        console.log('✅ Categorías cargadas:', data);
        setCategorias(data);
      } catch (error: any) {
        console.error('❌ Error loading categories:', error);
        toast.error('Error al cargar categorías');
      } finally {
        setLoadingCategorias(false);
      }
    };

    loadCategorias();
  }, [comunidadId]);

  // ✅ Handlers mejorados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comunidadId) {
      toast.error('No se pudo determinar la comunidad');
      return;
    }

    if (!formData.categoria_id || !formData.glosa || !formData.monto) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.monto <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Creando gasto:', { comunidadId, formData });
      
      const response = await gastosService.createGasto(comunidadId, formData);
      console.log('✅ Gasto creado:', response);
      
      toast.success('Gasto creado exitosamente');
      router.push('/gastos');
    } catch (error: any) {
      console.error('❌ Error creating gasto:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al crear gasto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoriaId: number) => {
    setFormData(prev => ({ ...prev, categoria_id: categoriaId }));
  };

  const handleCancel = () => {
    router.push('/gastos');
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

  // ✅ Verificar permisos
  const canCreate = user?.rol_global === 'super_admin' || user?.is_superadmin ||
    (comunidadId && (user?.membresias || user?.memberships || []).find(m =>
      (m.comunidad_id === comunidadId || m.comunidadId === comunidadId) &&
      ['administrador', 'tesorero', 'admin', 'contador'].includes(m.rol || m.role)
    ));

  // ✅ Mostrar debug si no hay comunidad
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
                <strong>Membresías:</strong> {JSON.stringify(user?.membresias || user?.memberships || [], null, 2)}
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // ✅ Verificar permisos
  if (!canCreate) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container-fluid p-4">
            <div className="alert alert-danger">
              <span className="material-icons align-middle me-2">block</span>
              <strong>Sin permisos:</strong> No tienes autorización para crear gastos en esta comunidad.
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Crear Nuevo Gasto — Cuentas Claras</title>
      </Head>

      <Layout title="Crear Nuevo Gasto">
        <div className="container-fluid py-4">
          
          {/* ✅ Header mejorado */}
          <div className="d-flex align-items-center mb-4">
            <button 
              onClick={handleCancel}
              className="btn btn-link text-secondary p-0 me-3"
              disabled={loading}
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <div>
              <h1 className="h3 mb-0">
                <span className="material-icons align-middle me-2">add_shopping_cart</span>
                Crear Nuevo Gasto
              </h1>
              <p className="text-muted mb-0">
                Comunidad ID: {comunidadId}
              </p>
            </div>
          </div>

          {/* ✅ Formulario principal */}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-8">
                
                {/* Card: Información básica */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <span className="material-icons align-middle me-2">info</span>
                      Información Básica
                    </h5>
                  </div>
                  <div className="card-body">
                    
                    {/* Descripción */}
                    <div className="mb-3">
                      <label htmlFor="gasto-descripcion" className="form-label fw-semibold">
                        Descripción del Gasto <span className="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="gasto-descripcion" 
                        placeholder="Ej: Reparación de sistema eléctrico del edificio"
                        value={formData.glosa}
                        onChange={(e) => setFormData(prev => ({ ...prev, glosa: e.target.value }))}
                        disabled={loading}
                        required 
                      />
                      <div className="form-text">
                        Describe brevemente el concepto del gasto
                      </div>
                    </div>
                    
                    {/* Fecha y Monto */}
                    <div className="row">
                      <div className="col-md-6">
                        <label htmlFor="gasto-fecha" className="form-label fw-semibold">
                          Fecha del Gasto <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="gasto-fecha"
                          value={formData.fecha}
                          onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                          disabled={loading}
                          required 
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="gasto-monto" className="form-label fw-semibold">
                          Monto <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input 
                            type="number" 
                            className="form-control" 
                            id="gasto-monto" 
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={formData.monto || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              monto: e.target.value ? Number(e.target.value) : 0 
                            }))}
                            disabled={loading}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card: Categorización */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <span className="material-icons align-middle me-2">category</span>
                      Categorización
                    </h5>
                  </div>
                  <div className="card-body">
                    
                    {/* Selector de categoría */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Categoría de Gasto <span className="text-danger">*</span>
                      </label>
                      
                      {loadingCategorias ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Cargando categorías...</span>
                          </div>
                          <div className="mt-2 small text-muted">Cargando categorías...</div>
                        </div>
                      ) : categorias.length === 0 ? (
                        <div className="alert alert-warning">
                          <span className="material-icons align-middle me-2">warning</span>
                          No se encontraron categorías activas para esta comunidad.
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {categorias.filter(c => c.activa).map(categoria => (
                            <button
                              key={categoria.id}
                              type="button"
                              className={`btn ${formData.categoria_id === categoria.id 
                                ? `btn-${getCategoriaColor(categoria.tipo)}` 
                                : `btn-outline-${getCategoriaColor(categoria.tipo)}`
                              }`}
                              onClick={() => handleCategorySelect(categoria.id)}
                              disabled={loading}
                            >
                              <span className="material-icons align-middle me-1" style={{fontSize: '16px'}}>
                                category
                              </span>
                              {categoria.nombre}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Checkbox extraordinario */}
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="extraordinario"
                        checked={formData.extraordinario}
                        onChange={(e) => setFormData(prev => ({ ...prev, extraordinario: e.target.checked }))}
                        disabled={loading}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="extraordinario">
                        Marcar como gasto extraordinario
                      </label>
                      <div className="form-text">
                        <span className="material-icons align-middle me-1" style={{fontSize: '16px'}}>
                          info
                        </span>
                        Los gastos extraordinarios requieren aprobación especial del comité
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
              
              {/* ✅ Sidebar con resumen */}
              <div className="col-lg-4">
                <div className="card sticky-top" style={{top: '2rem'}}>
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <span className="material-icons align-middle me-2">summarize</span>
                      Resumen
                    </h5>
                  </div>
                  <div className="card-body">
                    
                    {/* Vista previa */}
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Vista previa:</h6>
                      <div className="p-3 bg-light rounded">
                        <div className="fw-bold mb-1">
                          {formData.glosa || 'Sin descripción'}
                        </div>
                        <div className="text-muted small mb-2">
                          {formData.fecha ? new Date(formData.fecha).toLocaleDateString() : 'Sin fecha'}
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary fs-5">
                            ${formData.monto ? formData.monto.toLocaleString() : '0'}
                          </span>
                          {formData.extraordinario && (
                            <span className="badge bg-warning">Extraordinario</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Información adicional */}
                    <div className="small text-muted">
                      <div className="mb-2">
                        <strong>Comunidad:</strong> ID {comunidadId}
                      </div>
                      <div className="mb-2">
                        <strong>Creado por:</strong> {user?.persona?.nombres && user?.persona?.apellidos 
                          ? `${user.persona.nombres} ${user.persona.apellidos}`
                          : user?.username || 'Usuario'}
                      </div>
                      <div className="mb-2">
                        <strong>Estado inicial:</strong> <span className="badge bg-secondary">Borrador</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ✅ Botones de acción */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <span className="material-icons align-middle me-2">cancel</span>
                    Cancelar
                  </button>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading || !formData.categoria_id || !formData.glosa || !formData.monto}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Creando...</span>
                        </div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <span className="material-icons align-middle me-2">check</span>
                        Crear Gasto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default NuevoGastoPage;