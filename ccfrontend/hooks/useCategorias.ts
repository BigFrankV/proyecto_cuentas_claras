import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CategoriaGasto } from '@/types/gastos';
import { api } from '@/lib/api';

export function useCategorias(comunidadId: number) {
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    if (!comunidadId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando categorías para comunidad:', comunidadId);
      
      // ✅ URL CORRECTA SEGÚN TU BACKEND
      const response = await api.get(`/categorias-gasto/comunidad/${comunidadId}`);
      const data = response.data.data || [];
      
      console.log('📋 Categorías cargadas:', data);
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('❌ Error cargando categorías:', err);
      setError(err.response?.data?.error || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (comunidadId > 0) {
      fetchCategorias();
    }
  }, [comunidadId]);

  // Crear categoría
  const createCategoria = async (data: CategoriaCreateRequest) => {
    try {
      console.log('➕ Creando categoría:', data);
      
      // ✅ URL CORRECTA SEGÚN TU BACKEND
      const response = await api.post(`/categorias-gasto/comunidad/${comunidadId}`, data);
      
      // Recargar categorías después de crear
      await fetchCategorias();
      return response.data;
    } catch (err: any) {
      console.error('❌ Error creando categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al crear categoría';
      toast.error(errorMsg);
      throw err;
    }
  };

  // Actualizar categoría
  const updateCategoria = async (id: number, data: CategoriaCreateRequest) => {
    try {
      console.log('✏️ Actualizando categoría:', id, data);
      
      // ✅ URL CORRECTA SEGÚN TU BACKEND
      const response = await api.put(`/categorias-gasto/${id}`, data);
      
      // Recargar categorías después de actualizar
      await fetchCategorias();
      return response.data;
    } catch (err: any) {
      console.error('❌ Error actualizando categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al actualizar categoría';
      toast.error(errorMsg);
      throw err;
    }
  };

  // Eliminar/desactivar categoría
  const deleteCategoria = async (id: number) => {
    try {
      console.log('🗑️ Eliminando categoría:', id);
      
      // ✅ COMO NO TIENES DELETE EN TU BACKEND, USAR UPDATE PARA DESACTIVAR
      await api.put(`/categorias-gasto/${id}`, { activa: false });
      
      // Recargar categorías después de eliminar
      await fetchCategorias();
    } catch (err: any) {
      console.error('❌ Error eliminando categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al eliminar categoría';
      toast.error(errorMsg);
      throw err;
    }
  };

  // Toggle estado activo/inactivo
  const toggleCategoria = async (id: number, activa: boolean) => {
    try {
      console.log('🔄 Cambiando estado categoría:', id, 'activa:', activa);
      
      // ✅ URL CORRECTA SEGÚN TU BACKEND
      await api.put(`/categorias-gasto/${id}`, { activa });
      
      // Recargar categorías después del toggle
      await fetchCategorias();
    } catch (err: any) {
      console.error('❌ Error cambiando estado categoría:', err);
      const errorMsg = err.response?.data?.error || 'Error al cambiar estado';
      toast.error(errorMsg);
      throw err;
    }
  };

  return {
    categorias,
    loading,
    error,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoria,
    refetch: fetchCategorias,
  };
}