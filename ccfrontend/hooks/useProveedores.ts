import { useState, useCallback } from 'react';
import { proveedoresService, Proveedor, ProveedorEstadisticas } from '@/lib/proveedoresService';
import { useAuth } from '@/lib/useAuth';

export function useProveedores(comunidadId?: number) {
  const { user } = useAuth();
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<any>({});

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      // ✅ LÓGICA DE PERMISOS:
      if (user?.is_superadmin) {
        console.log('👑 Usuario superadmin - Cargando TODOS los proveedores');
        response = await proveedoresService.getAllProveedores();
      } else if (user?.memberships?.[0]?.comunidadId) {
        const userComunidadId = user.memberships[0].comunidadId;
        console.log('👤 Usuario admin - Cargando proveedores de comunidad:', userComunidadId);
        response = await proveedoresService.getProveedores(userComunidadId);
      } else {
        throw new Error('Usuario sin permisos para ver proveedores');
      }

      if (response.success) {
        setProveedores(response.data || []);
        setEstadisticas(response.estadisticas || {});
      } else {
        throw new Error('Error en la respuesta del servidor');
      }

    } catch (error: any) {
      console.error('❌ Error cargando proveedores:', error);
      setError(error.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, [user?.is_superadmin, user?.memberships]);

  const fetchEstadisticas = useCallback(async () => {
    if (!comunidadId) return;
    
    try {
      const response = await proveedoresService.getEstadisticas(comunidadId);
      if (response.success) {
        setEstadisticas(response.data);
      }
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
    }
  }, [comunidadId]);

  const createProveedor = useCallback(async (proveedorData: any) => {
    setError(null);
    
    try {
      const response = await proveedoresService.createProveedor(comunidadId, proveedorData);
      if (response.success) {
        setProveedores(prev => [...prev, response.data]);
        await fetchEstadisticas();
        return response.data;
      } else {
        throw new Error('Error al crear proveedor');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al crear proveedor';
      setError(errorMsg);
      throw error;
    }
  }, [comunidadId, fetchEstadisticas]);

  const updateProveedor = useCallback(async (id: number, proveedorData: any) => {
    setError(null);
    
    try {
      const response = await proveedoresService.updateProveedor(id, proveedorData);
      if (response.success) {
        setProveedores(prev => 
          prev.map(p => p.id === id ? response.data : p)
        );
        await fetchEstadisticas();
        return response.data;
      } else {
        throw new Error('Error al actualizar proveedor');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al actualizar proveedor';
      setError(errorMsg);
      throw error;
    }
  }, [fetchEstadisticas]);

  const deleteProveedor = useCallback(async (id: number) => {
    setError(null);
    
    try {
      const response = await proveedoresService.deleteProveedor(id);
      if (response.success) {
        setProveedores(prev => prev.filter(p => p.id !== id));
        await fetchEstadisticas();
      } else {
        throw new Error('Error al eliminar proveedor');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al eliminar proveedor';
      setError(errorMsg);
      throw error;
    }
  }, [fetchEstadisticas]);

  const cambiarEstado = useCallback(async (id: number, nuevoEstado: boolean) => {
    setError(null);
    
    try {
      const response = await proveedoresService.toggleEstado(id);
      if (response.success) {
        setProveedores(prev => 
          prev.map(p => p.id === id ? { ...p, activo: response.data.activo } : p)
        );
        await fetchEstadisticas();
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al cambiar estado';
      setError(errorMsg);
      throw error;
    }
  }, [fetchEstadisticas]);

  return {
    proveedores,
    loading,
    error,
    estadisticas,
    fetchProveedores,
    fetchEstadisticas,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    cambiarEstado,
    clearError: () => setError(null)
  };
}