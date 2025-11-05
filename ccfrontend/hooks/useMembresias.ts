import { useState, useEffect, useCallback } from 'react';

import apiClient from '@/lib/api';

export interface Membresia {
  id: number;
  usuario_id: number;
  username: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  rut: string;
  dv: string;
  rut_completo: string;
  comunidad_id: number;
  comunidad_nombre: string;
  rol_id: number;
  rol_nombre: string;
  rol_codigo: string;
  nivel_acceso: number;
  desde: string;
  hasta: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembresiaFilters {
  comunidad_id?: number;
  usuario_id?: number;
  rol_id?: number;
  activo?: boolean;
  limit?: number;
  offset?: number;
}

export interface MembresiaListResponse {
  data: Membresia[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface Plan {
  id: number;
  codigo: string;
  nombre: string;
  nivel_acceso: number;
}

export const useMembresias = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const listarMembresias = useCallback(
    async (filters: MembresiaFilters = {}): Promise<MembresiaListResponse> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });

        const response = await apiClient.get(
          `/membresias?${params.toString()}`
        );
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al listar membresías';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const obtenerMembresia = useCallback(
    async (id: number): Promise<Membresia> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/membresias/${id}`);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al obtener membresía';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const crearMembresia = useCallback(
    async (data: {
      usuario_id: number;
      comunidad_id: number;
      rol_id: number;
      desde?: string;
      hasta?: string;
      activo?: boolean;
    }): Promise<Membresia> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post('/membresias', data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al crear membresía';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const actualizarMembresia = useCallback(
    async (
      id: number,
      data: Partial<{
        rol_id: number;
        activo: boolean;
        hasta: string;
      }>
    ): Promise<Membresia> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.patch(`/membresias/${id}`, data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Error al actualizar membresía';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarMembresia = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/membresias/${id}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al eliminar membresía';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerPlanes = useCallback(async (): Promise<Plan[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/membresias/catalogos/planes');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al obtener planes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerEstados = useCallback(async (): Promise<string[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/membresias/catalogos/estados');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al obtener estados';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const listarRoles = useCallback(async (): Promise<any[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/membresias/catalogos/roles');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al obtener roles';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const listarComunidades = useCallback(async (): Promise<any[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/membresias/catalogos/comunidades');
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Error al obtener comunidades';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    listarMembresias,
    obtenerMembresia,
    crearMembresia,
    actualizarMembresia,
    eliminarMembresia,
    obtenerPlanes,
    obtenerEstados,
    listarRoles,
    listarComunidades,
    loading,
    error,
    clearError,
  };
};
