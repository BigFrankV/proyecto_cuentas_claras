import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Gasto, GastoFilters } from '@/types/gastos';
import { api } from '@/lib/api';

// ✅ AGREGAR INTERFACES FALTANTES
interface GastoEstadisticas {
  total_gastos: number;
  borradores: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
  pagados: number;
  anulados: number;
  monto_total: number;
  monto_mes_actual: number;
  monto_anio_actual: number;
  monto_extraordinarios: number;
}

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
    // comunidadId === 0 => todas las comunidades (permitir para superadmin)
    if (comunidadId === null || typeof comunidadId === 'undefined') return;
    // continuar para comunidadId === 0 o >0

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Cargando gastos para comunidad:', comunidadId, 'filtros:', filters);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      // ✅ USAR LA URL CORRECTA DEL BACKEND
      const response = await api.get(`/gastos/comunidad/${comunidadId}?${params}`);
      
      console.log('📋 Respuesta del backend:', response.data);
      
      const gastos = response.data.data || [];
      const paginationData = response.data.pagination || {};
      
      setGastos(gastos);
      setPagination(paginationData);
      
    } catch (err: any) {
      console.error('❌ Error cargando gastos:', err);
      setError(err.response?.data?.error || 'Error al cargar gastos');
      toast.error(err.response?.data?.error || 'Error al cargar gastos');
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

// ✅ HOOK PARA ESTADÍSTICAS
export function useGastoEstadisticas(comunidadId: number) {
  const [estadisticas, setEstadisticas] = useState<GastoEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = useCallback(async () => {
    if (comunidadId === null || typeof comunidadId === 'undefined') return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/gastos/comunidad/${comunidadId}/stats`);
      setEstadisticas(response.data.data.resumen);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al cargar estadísticas';
      setError(errorMessage);
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