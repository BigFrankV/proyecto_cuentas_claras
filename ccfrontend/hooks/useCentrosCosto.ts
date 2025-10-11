import { useState, useEffect } from 'react';
import { centrosCostoService, CentroCosto, CentroCostoCreateRequest, CentroCostoUpdateRequest, CentrosCostoEstadisticas } from '../lib/centrosCostoService';

interface UseCentrosCostoState {
  centrosCosto: CentroCosto[];
  loading: boolean;
  error: string | null;
  estadisticas: CentrosCostoEstadisticas | null;
}

interface UseCentrosCostoActions {
  fetchCentrosCosto: () => Promise<void>;
  createCentroCosto: (data: CentroCostoCreateRequest) => Promise<CentroCosto>;
  updateCentroCosto: (id: number, data: CentroCostoUpdateRequest) => Promise<CentroCosto>;
  deleteCentroCosto: (id: number) => Promise<void>;
  cambiarEstado: (id: number, activo: boolean) => Promise<CentroCosto>;
  fetchEstadisticas: () => Promise<void>;
  clearError: () => void;
}

export function useCentrosCosto(comunidadId: number): UseCentrosCostoState & UseCentrosCostoActions {
  const [state, setState] = useState<UseCentrosCostoState>({
    centrosCosto: [],
    loading: false,
    error: null,
    estadisticas: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => setError(null);

  const fetchCentrosCosto = async () => {
    if (!comunidadId) return;

    setLoading(true);
    setError(null);
    try {
      const centrosCosto = await centrosCostoService.getCentrosCosto(comunidadId);
      setState(prev => ({ ...prev, centrosCosto }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCentroCosto = async (data: CentroCostoCreateRequest): Promise<CentroCosto> => {
    setLoading(true);
    setError(null);
    try {
      const nuevoCentroCosto = await centrosCostoService.createCentroCosto(comunidadId, data);
      setState(prev => ({ 
        ...prev, 
        centrosCosto: [...prev.centrosCosto, nuevoCentroCosto] 
      }));
      return nuevoCentroCosto;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCentroCosto = async (id: number, data: CentroCostoUpdateRequest): Promise<CentroCosto> => {
    setLoading(true);
    setError(null);
    try {
      const centroCostoActualizado = await centrosCostoService.updateCentroCosto(id, data);
      setState(prev => ({
        ...prev,
        centrosCosto: prev.centrosCosto.map(cc => 
          cc.id === id ? centroCostoActualizado : cc
        )
      }));
      return centroCostoActualizado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCentroCosto = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await centrosCostoService.deleteCentroCosto(id);
      setState(prev => ({
        ...prev,
        centrosCosto: prev.centrosCosto.filter(cc => cc.id !== id)
      }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: number, activo: boolean): Promise<CentroCosto> => {
    setLoading(true);
    setError(null);
    try {
      const centroCostoActualizado = await centrosCostoService.toggleEstado(id, activo);
      setState(prev => ({
        ...prev,
        centrosCosto: prev.centrosCosto.map(cc => 
          cc.id === id ? centroCostoActualizado : cc
        )
      }));
      return centroCostoActualizado;
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
      const estadisticas = await centrosCostoService.getEstadisticas(comunidadId);
      setState(prev => ({ ...prev, estadisticas }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state,
    fetchCentrosCosto,
    createCentroCosto,
    updateCentroCosto,
    deleteCentroCosto,
    cambiarEstado,
    fetchEstadisticas,
    clearError
  };
}

interface UseCentroCostoState {
  centroCosto: CentroCosto | null;
  loading: boolean;
  error: string | null;
}

interface UseCentroCostoActions {
  fetchCentroCosto: () => Promise<void>;
  clearError: () => void;
}

export function useCentroCosto(id: number): UseCentroCostoState & UseCentroCostoActions {
  const [state, setState] = useState<UseCentroCostoState>({
    centroCosto: null,
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

  const fetchCentroCosto = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const centroCosto = await centrosCostoService.getCentroCosto(id);
      setState(prev => ({ ...prev, centroCosto }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentroCosto();
  }, [id]);

  return {
    ...state,
    fetchCentroCosto,
    clearError
  };
}