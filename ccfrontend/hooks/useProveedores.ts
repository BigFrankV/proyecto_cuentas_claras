import { useState, useCallback } from 'react';
import { proveedoresService, Proveedor, ProveedorEstadisticas } from '@/lib/proveedoresService';
import { useAuth } from '@/lib/useAuth';

export function useProveedores(comunidadId?: number) {
  const { user } = useAuth();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<ProveedorEstadisticas | null>(null);

  const fetchProveedores = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      let response;

      // ✅ LÓGICA CORREGIDA:
      if (user.is_superadmin) {
        console.log('👑 Superadmin - Cargando TODOS los proveedores');
        response = await proveedoresService.getAllProveedores();
      } else {
        console.log('👤 Usuario normal - Cargando proveedores de su comunidad');
        response = await proveedoresService.getProveedoresByComunidad();
      }

      if (response.success) {
        setProveedores(response.data || []);
        setEstadisticas(response.estadisticas || null);
      }

    } catch (error: any) {
      console.error('❌ Error cargando proveedores:', error);
      setError(error.response?.data?.error || 'Error al cargar proveedores');
      setProveedores([]);
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const eliminarProveedor = useCallback(async (id: number) => {
    setError(null);
    
    try {
      await proveedoresService.eliminarProveedor(id);
      setProveedores(prev => prev.filter(p => p.id !== id));
      // Refrescar estadísticas
      await fetchProveedores();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al eliminar proveedor';
      setError(errorMsg);
      throw error;
    }
  }, [fetchProveedores]);

  const cambiarEstado = useCallback(async (id: number, nuevoEstado: boolean) => {
    setError(null);
    
    try {
      await proveedoresService.cambiarEstado(id, nuevoEstado);
      setProveedores(prev => 
        prev.map(p => p.id === id ? { ...p, activo: nuevoEstado } : p)
      );
      // Refrescar estadísticas
      await fetchProveedores();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al cambiar estado';
      setError(errorMsg);
      throw error;
    }
  }, [fetchProveedores]);

  return {
    proveedores,
    loading,
    error,
    estadisticas,
    fetchProveedores,
    eliminarProveedor,
    cambiarEstado,
    clearError: () => setError(null)
  };
}