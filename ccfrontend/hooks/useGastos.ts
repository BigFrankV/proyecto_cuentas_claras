import { useState, useEffect, useCallback } from 'react';
import { gastosService, type GastoFilters } from '../lib/gastosService';
import type { Gasto, PaginatedResponse, GastoEstadisticas } from '../types/gastos';
import { toast } from 'react-hot-toast';

export function useGastos(comunidadId: number, initialFilters: GastoFilters = {}) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });

  const [filters, setFilters] = useState<GastoFilters>({
    page: 1,
    limit: 20,
    ordenar: 'fecha',
    direccion: 'DESC',
    ...initialFilters
  });

  const fetchGastos = useCallback(async () => {
    if (!comunidadId) return;

    try {
      setLoading(true);
      setError(null);

      const response: PaginatedResponse<Gasto> = await gastosService.getGastos(comunidadId, filters);
      
      setGastos(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar gastos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [comunidadId, filters]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const updateFilters = useCallback((newFilters: Partial<GastoFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Si cambian filtros, volver a página 1
      ...(Object.keys(newFilters).some(key => key !== 'page') && { page: 1 })
    }));
  }, []);

  const refetch = useCallback(() => {
    fetchGastos();
  }, [fetchGastos]);

  return {
    gastos,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch
  };
}

export function useGasto(id: number | null) {
  const [gasto, setGasto] = useState<Gasto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGasto = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await gastosService.getGasto(id);
      setGasto(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar gasto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGasto();
  }, [fetchGasto]);

  const refetch = useCallback(() => {
    fetchGasto();
  }, [fetchGasto]);

  return {
    gasto,
    loading,
    error,
    refetch
  };
}

export function useGastoActions() {
  const [loading, setLoading] = useState(false);

  const aprobarGasto = useCallback(async (id: number, observaciones?: string) => {
    try {
      setLoading(true);
      await gastosService.aprobarGasto(id, observaciones);
      toast.success('Gasto aprobado exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al aprobar gasto';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const rechazarGasto = useCallback(async (id: number, observaciones: string) => {
    try {
      setLoading(true);
      await gastosService.rechazarGasto(id, observaciones);
      toast.success('Gasto rechazado');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al rechazar gasto';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarGasto = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await gastosService.deleteGasto(id);
      toast.success('Gasto eliminado exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar gasto';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    aprobarGasto,
    rechazarGasto,
    eliminarGasto
  };
}

export function useGastoEstadisticas(comunidadId: number) {
  const [estadisticas, setEstadisticas] = useState<GastoEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async () => {
    if (!comunidadId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await gastosService.getEstadisticas(comunidadId);
      setEstadisticas(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al cargar estadísticas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [comunidadId]);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    estadisticas,
    loading,
    error,
    refetch: fetchEstadisticas
  };
}