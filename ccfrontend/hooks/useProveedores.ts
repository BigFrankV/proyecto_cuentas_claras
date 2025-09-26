import { useState, useEffect } from 'react';
import { proveedoresService, Proveedor, ProveedorCreateRequest, ProveedorUpdateRequest, ProveedoresEstadisticas, ProveedorFilters } from '../lib/proveedoresService';

interface UseProveedoresState {
  proveedores: Proveedor[];
  loading: boolean;
  error: string | null;
  estadisticas: ProveedoresEstadisticas | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

interface UseProveedoresActions {
  fetchProveedores: (filters?: ProveedorFilters) => Promise<void>;
  createProveedor: (data: ProveedorCreateRequest) => Promise<Proveedor>;
  updateProveedor: (id: number, data: ProveedorUpdateRequest) => Promise<Proveedor>;
  deleteProveedor: (id: number) => Promise<void>;
  cambiarEstado: (id: number, activo: boolean) => Promise<Proveedor>;
  fetchEstadisticas: () => Promise<void>;
  clearError: () => void;
}

export function useProveedores(comunidadId: number): UseProveedoresState & UseProveedoresActions {
  const [state, setState] = useState<UseProveedoresState>({
    proveedores: [],
    loading: false,
    error: null,
    estadisticas: null,
    pagination: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => setError(null);

  const fetchProveedores = async (filters: ProveedorFilters = {}) => {
    if (!comunidadId) return;

    setLoading(true);
    setError(null);
    try {
      const proveedores = await proveedoresService.getProveedores(comunidadId, filters);
      setState(prev => ({ 
        ...prev, 
        proveedores,
        pagination: null
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProveedor = async (data: ProveedorCreateRequest): Promise<Proveedor> => {
    setLoading(true);
    setError(null);
    try {
      const nuevoProveedor = await proveedoresService.createProveedor(comunidadId, data);
      setState(prev => ({ 
        ...prev, 
        proveedores: [...prev.proveedores, nuevoProveedor] 
      }));
      return nuevoProveedor;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProveedor = async (id: number, data: ProveedorUpdateRequest): Promise<Proveedor> => {
    setLoading(true);
    setError(null);
    try {
      const proveedorActualizado = await proveedoresService.updateProveedor(id, data);
      setState(prev => ({
        ...prev,
        proveedores: prev.proveedores.map(p => 
          p.id === id ? proveedorActualizado : p
        )
      }));
      return proveedorActualizado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProveedor = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await proveedoresService.deleteProveedor(id);
      setState(prev => ({
        ...prev,
        proveedores: prev.proveedores.filter(p => p.id !== id)
      }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: number, activo: boolean): Promise<Proveedor> => {
    setLoading(true);
    setError(null);
    try {
      const proveedorActualizado = await proveedoresService.toggleEstado(id, activo);
      setState(prev => ({
        ...prev,
        proveedores: prev.proveedores.map(p => 
          p.id === id ? proveedorActualizado : p
        )
      }));
      return proveedorActualizado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    if (!comunidadId) return;

    setLoading(true);
    setError(null);
    try {
      const estadisticas = await proveedoresService.getEstadisticas(comunidadId);
      setState(prev => ({ ...prev, estadisticas }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state,
    fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    cambiarEstado,
    fetchEstadisticas,
    clearError
  };
}

interface UseProveedorState {
  proveedor: Proveedor | null;
  loading: boolean;
  error: string | null;
}

interface UseProveedorActions {
  fetchProveedor: () => Promise<void>;
  clearError: () => void;
}

export function useProveedor(id: number): UseProveedorState & UseProveedorActions {
  const [state, setState] = useState<UseProveedorState>({
    proveedor: null,
    loading: false,
    error: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => setError(null);

  const fetchProveedor = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const proveedor = await proveedoresService.getProveedor(id);
      setState(prev => ({ ...prev, proveedor }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedor();
  }, [id]);

  return {
    ...state,
    fetchProveedor,
    clearError
  };
}