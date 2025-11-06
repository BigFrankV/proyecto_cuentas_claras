import { useState, useCallback } from 'react';

import {
  listCargos as listCargosService,
  getCargo,
  getCargosByUnidad,
  getCargosByComunidad,
  createCargo,
  updateCargo,
  deleteCargo,
  getCargoStats,
  getCargosVencidos,
  Cargo,
  CargoFormData,
  CargoStats,
} from '@/lib/cargosService';
import { useAuth } from '@/lib/useAuth';

export const useCargos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const clearError = useCallback(() => setError(null), []);

  /**
   * Obtener comunidad ID del usuario autenticado
   */
  const getComunidadId = (): number | null => {
    if (!user) {
      return null;
    }

    // Intentar obtener de comunidad_id directo
    if (user.comunidad_id) {
      return user.comunidad_id;
    }

    // Si no, intentar de la primera membresía
    if (user.memberships && user.memberships.length > 0) {
      return user.memberships[0].comunidadId;
    }

    return null;
  };

  /**
   * Listar todos los cargos (por comunidad del usuario si disponible)
   */
  const listarCargos = useCallback(
    async (filters?: any): Promise<Cargo[]> => {
      setLoading(true);
      setError(null);
      try {
        const comunidadId = getComunidadId();
        
        // Si hay comunidad, usar el endpoint específico de comunidad
        if (comunidadId) {
          const result = await getCargosByComunidad(comunidadId, filters);
          return result;
        }
        
        // Si no hay comunidad, listar todos
        const data = await listCargosService(filters);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al listar cargos';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  /**
   * Obtener un cargo por ID
   */
  const obtenerCargo = useCallback(
    async (id: number): Promise<Cargo | null> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCargo(id);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al obtener cargo';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Obtener cargos por comunidad
   */
  const obtenerCargosPorComunidad = useCallback(
    async (comunidadId: number, filters?: any): Promise<Cargo[]> => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCargosByComunidad(comunidadId, filters);
        return result;
      } catch (err: any) {
        const errorMessage =
          err.message || 'Error al obtener cargos de comunidad';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Obtener cargos por unidad
   */
  const obtenerCargosPorUnidad = useCallback(
    async (unidadId: number): Promise<Cargo[]> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCargosByUnidad(unidadId);
        return data;
      } catch (err: any) {
        const errorMessage =
          err.message || 'Error al obtener cargos de unidad';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Crear un nuevo cargo
   */
  const crearCargo = useCallback(
    async (data: CargoFormData): Promise<Cargo | null> => {
      setLoading(true);
      setError(null);
      try {
        const cargo = await createCargo(data);
        return cargo;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al crear cargo';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Actualizar un cargo
   */
  const actualizarCargo = useCallback(
    async (id: number, data: Partial<CargoFormData>): Promise<Cargo | null> => {
      setLoading(true);
      setError(null);
      try {
        const cargo = await updateCargo(id, data);
        return cargo;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al actualizar cargo';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Eliminar un cargo
   */
  const eliminarCargo = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const success = await deleteCargo(id);
      return success;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar cargo';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas
   */
  const obtenerEstadisticas = useCallback(
    async (): Promise<CargoStats> => {
      setLoading(true);
      setError(null);
      try {
        const stats = await getCargoStats();
        return stats;
      } catch (err: any) {
        const errorMessage =
          err.message || 'Error al obtener estadísticas';
        setError(errorMessage);
        return {
          total_cargos: 0,
          total_monto: 0,
          total_saldo: 0,
          total_interes: 0,
          cargos_pagados: 0,
          cargos_pendientes: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Obtener cargos vencidos/alertas
   */
  const obtenerCargosVencidos = useCallback(
    async (): Promise<Cargo[]> => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCargosVencidos();
        return data;
      } catch (err: any) {
        const errorMessage =
          err.message || 'Error al obtener cargos vencidos';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    clearError,
    listarCargos,
    obtenerCargo,
    obtenerCargosPorComunidad,
    obtenerCargosPorUnidad,
    crearCargo,
    actualizarCargo,
    eliminarCargo,
    obtenerEstadisticas,
    obtenerCargosVencidos,
  };
};
