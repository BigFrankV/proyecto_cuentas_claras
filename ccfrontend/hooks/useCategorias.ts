import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CategoriaGasto, CategoriaCreateRequest } from '@/types/gastos';
import { api } from '@/lib/api';

export function useCategorias(comunidadId: number | null, isSuperAdmin: boolean = false) {
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    if (!comunidadId && !isSuperAdmin) {
      console.log('⚠️ Sin comunidadId y no es superadmin - no cargar');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Cargando categorías:', { comunidadId, isSuperAdmin });
      
      let url: string;
      let response: any;

      // ✅ LÓGICA MEJORADA CON MÁS LOGS
      if (isSuperAdmin) {
        // SuperAdmin usa el endpoint global
        url = '/categorias-gasto';
        if (comunidadId && comunidadId > 0) {
          url += `?comunidad_id=${comunidadId}`;
          console.log('🏢 SuperAdmin filtrando por comunidad:', comunidadId);
        } else {
          console.log('🌍 SuperAdmin viendo todas las comunidades');
        }
        console.log('🔍 SuperAdmin URL final:', url);
        response = await api.get(url);
      } else {
        // Usuarios normales usan endpoint específico de comunidad
        if (!comunidadId || comunidadId === 0) {
          throw new Error('Comunidad requerida para usuarios no admin');
        }
        url = `/categorias-gasto/comunidad/${comunidadId}`;
        console.log('👤 Usuario normal URL:', url);
        response = await api.get(url);
      }
      
      // ✅ LOGGING MEJORADO
      console.log('📨 Respuesta completa:', response);
      console.log('📊 Status:', response.status);
      console.log('📋 Headers:', response.headers);
      
      // ✅ MANEJO CONSISTENTE DE LA RESPUESTA
      const data = response.data?.data || response.data || [];
      const stats = response.data?.estadisticas || null;
      
      console.log('📋 Categorías procesadas:', data);
      console.log('📊 Estadísticas procesadas:', stats);
      
      setCategorias(Array.isArray(data) ? data : []);
      setEstadisticas(stats);
      
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      console.error('📋 Response data:', err.response?.data);
      console.error('📋 Response status:', err.response?.status);
      console.error('📋 Request config:', err.config);
      
      // Manejo mejorado de errores
      let errorMsg = 'Error al cargar categorías';
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      // Mostrar detalles adicionales en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('🔍 Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: err.config
        });
      }
      
      setError(errorMsg);
      setCategorias([]);
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [comunidadId, isSuperAdmin]);

  // ✅ CREAR CATEGORÍA - SOLO PARA COMUNIDAD ESPECÍFICA
  const createCategoria = async (data: CategoriaCreateRequest) => {
    if (!comunidadId || comunidadId === 0) {
      throw new Error('Se requiere una comunidad específica para crear categorías');
    }

    try {
      console.log('➕ Creando categoría:', data);
      
      const response = await api.post(`/categorias-gasto/comunidad/${comunidadId}`, data);
      
      // Recargar después de crear
      await fetchCategorias();
      return response.data;
      
    } catch (err: any) {
      console.error('❌ Error creando categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al crear categoría';
      throw new Error(errorMsg);
    }
  };

  // ✅ ACTUALIZAR CATEGORÍA
  const updateCategoria = async (id: number, data: Partial<CategoriaCreateRequest & { activa?: boolean }>) => {
    try {
      console.log('✏️ Actualizando categoría:', id, data);
      
      const response = await api.put(`/categorias-gasto/${id}`, data);
      
      // Recargar después de actualizar
      await fetchCategorias();
      return response.data;
      
    } catch (err: any) {
      console.error('❌ Error actualizando categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al actualizar categoría';
      throw new Error(errorMsg);
    }
  };

  // ✅ TOGGLE ESTADO (usar endpoint específico si existe)
  const toggleCategoria = async (id: number, activa: boolean) => {
    try {
      console.log('🔄 Cambiando estado categoría:', id, 'activa:', activa);
      
      // Usar endpoint específico si existe, sino usar PUT genérico
      let response;
      try {
        response = await api.patch(`/categorias-gasto/${id}/toggle`);
      } catch (toggleError) {
        // Fallback a PUT si no existe el endpoint toggle
        response = await api.put(`/categorias-gasto/${id}`, { activa });
      }
      
      // Recargar después del cambio
      await fetchCategorias();
      return response.data;
      
    } catch (err: any) {
      console.error('❌ Error cambiando estado categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al cambiar estado';
      throw new Error(errorMsg);
    }
  };

  // ✅ ELIMINAR CATEGORÍA
  const deleteCategoria = async (id: number) => {
    try {
      console.log('🗑️ Eliminando categoría:', id);
      
      // Intentar DELETE primero, sino usar PUT para desactivar
      let response;
      try {
        response = await api.delete(`/categorias-gasto/${id}`);
      } catch (deleteError) {
        // Si falla DELETE, desactivar
        console.log('🔄 DELETE falló, desactivando en su lugar...');
        response = await api.put(`/categorias-gasto/${id}`, { activa: false });
      }
      
      // Recargar después de eliminar/desactivar
      await fetchCategorias();
      return response.data;
      
    } catch (err: any) {
      console.error('❌ Error eliminando categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al eliminar categoría';
      throw new Error(errorMsg);
    }
  };

  return {
    categorias,
    estadisticas,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoria,
    refetch: fetchCategorias,
  };
}