/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from 'react';

import {
  Amenidad,
  AmenidadFormData,
  AmenidadFilters,
  ReservaAmenidad,
  ReservaAmenidadFormData,
} from '@/types/amenidades';

// Hook para manejo de amenidades
export const useAmenidades = () => {
  const [amenidades, setAmenidades] = useState<Amenidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para importar API dinámicamente
  const getApi = useCallback(async () => {
    const { amenidades: amenidadesApi } = await import('@/lib/api/amenidades');
    return amenidadesApi;
  }, []);

  // Cargar todas las amenidades
  const fetchAmenidades = useCallback(
    async (filters?: AmenidadFilters) => {
      if (typeof window === 'undefined') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const data = await api.getAll(filters);
        setAmenidades(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar las amenidades',
        );
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Crear una nueva amenidad
  const createAmenidad = useCallback(
    async (data: AmenidadFormData): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const newAmenidad = await api.create(data);
        if (newAmenidad) {
          setAmenidades(prev => [...prev, newAmenidad]);
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al crear la amenidad',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Actualizar una amenidad
  const updateAmenidad = useCallback(
    async (id: string, data: Partial<AmenidadFormData>): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const updatedAmenidad = await api.update(id, data);
        if (updatedAmenidad) {
          setAmenidades(prev =>
            prev.map(amenidad =>
              amenidad.id === Number(id) ? updatedAmenidad : amenidad,
            ),
          );
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al actualizar la amenidad',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Eliminar una amenidad
  const deleteAmenidad = useCallback(
    async (id: string): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const success = await api.delete(id);
        if (success) {
          setAmenidades(prev =>
            prev.filter(amenidad => amenidad.id !== Number(id)),
          );
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al eliminar la amenidad',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Obtener amenidad por ID
  const getAmenidadById = useCallback(
    async (id: string): Promise<Amenidad | null> => {
      if (typeof window === 'undefined') {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const amenidad = await api.getById(id);
        return amenidad;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar la amenidad',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Obtener detalle completo de amenidad
  const getAmenidadDetalle = useCallback(
    async (id: string): Promise<Amenidad | null> => {
      if (typeof window === 'undefined') {
        return null;
      }

      try {
        const api = await getApi();
        const amenidad = await api.getDetalle(id);
        return amenidad;
      } catch (err) {
        return null;
      }
    },
    [getApi],
  );

  // Obtener amenidades por comunidad
  const getAmenidadesByComunidad = useCallback(
    async (comunidadId: number): Promise<Amenidad[]> => {
      if (typeof window === 'undefined') {
        return [];
      }

      try {
        const api = await getApi();
        const amenidades = await api.getByComunidad(comunidadId);
        return amenidades;
      } catch (err) {
        return [];
      }
    },
    [getApi],
  );

  // Buscar amenidades
  const searchAmenidades = useCallback(
    async (filters: AmenidadFilters): Promise<Amenidad[]> => {
      if (typeof window === 'undefined') {
        return [];
      }

      try {
        const api = await getApi();
        const results = await api.search(filters);
        return results;
      } catch (err) {
        return [];
      }
    },
    [getApi],
  );

  // Obtener estadísticas
  const getStats = useCallback(async () => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const api = await getApi();
      return await api.getStats();
    } catch (err) {
      return {};
    }
  }, [getApi]);

  return {
    amenidades,
    loading,
    error,
    fetchAmenidades,
    createAmenidad,
    updateAmenidad,
    deleteAmenidad,
    getAmenidadById,
    getAmenidadDetalle,
    getAmenidadesByComunidad,
    searchAmenidades,
    getStats,
  };
};

// Hook para manejo de reservas de amenidades
export const useReservasAmenidades = (amenidadId?: string) => {
  const [reservas, setReservas] = useState<ReservaAmenidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para importar API dinámicamente
  const getApi = useCallback(async () => {
    const { reservasAmenidades } = await import('@/lib/api/amenidades');
    return reservasAmenidades;
  }, []);

  // Cargar reservas de una amenidad
  const fetchReservas = useCallback(
    async (id?: string) => {
      if (typeof window === 'undefined') {
        return;
      }
      const targetId = id || amenidadId;
      if (!targetId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const data = await api.getByAmenidad(targetId);
        setReservas(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar las reservas',
        );
      } finally {
        setLoading(false);
      }
    },
    [getApi, amenidadId],
  );

  // Crear una nueva reserva
  const createReserva = useCallback(
    async (
      amenidadId: string,
      data: ReservaAmenidadFormData,
    ): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const newReserva = await api.create(amenidadId, data);
        if (newReserva) {
          setReservas(prev => [...prev, newReserva]);
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al crear la reserva',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Actualizar una reserva
  const updateReserva = useCallback(
    async (
      id: string,
      data: Partial<ReservaAmenidadFormData>,
    ): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const updatedReserva = await api.update(id, data);
        if (updatedReserva) {
          setReservas(prev =>
            prev.map(reserva =>
              reserva.id === Number(id) ? updatedReserva : reserva,
            ),
          );
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al actualizar la reserva',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Eliminar una reserva
  const deleteReserva = useCallback(
    async (id: string): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const api = await getApi();
        const success = await api.delete(id);
        if (success) {
          setReservas(prev =>
            prev.filter(reserva => reserva.id !== Number(id)),
          );
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al eliminar la reserva',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getApi],
  );

  // Confirmar reserva
  const confirmReserva = useCallback(
    async (id: string): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      try {
        const api = await getApi();
        const success = await api.confirm(id);
        if (success) {
          setReservas(prev =>
            prev.map(reserva =>
              reserva.id === Number(id)
                ? { ...reserva, estado: 'aprobada' as const }
                : reserva,
            ),
          );
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al confirmar la reserva',
        );
        return false;
      }
    },
    [getApi],
  );

  // Cancelar reserva
  const cancelReserva = useCallback(
    async (id: string): Promise<boolean> => {
      if (typeof window === 'undefined') {
        return false;
      }

      try {
        const api = await getApi();
        const success = await api.cancel(id);
        if (success) {
          setReservas(prev =>
            prev.map(reserva =>
              reserva.id === Number(id)
                ? { ...reserva, estado: 'cancelada' as const }
                : reserva,
            ),
          );
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cancelar la reserva',
        );
        return false;
      }
    },
    [getApi],
  );

  return {
    reservas,
    loading,
    error,
    fetchReservas,
    createReserva,
    updateReserva,
    deleteReserva,
    confirmReserva,
    cancelReserva,
  };
};

