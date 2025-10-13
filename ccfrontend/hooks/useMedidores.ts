import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  medidoresService, 
  Medidor, 
  LecturaMedidor, 
  CreateMedidorRequest, 
  CreateLecturaRequest 
} from '@/lib/medidoresService';

// ✅ Hook principal para medidores
export function useMedidores(comunidadId: number | null) {
  const [medidores, setMedidores] = useState<Medidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📋 Cargar medidores
  const loadMedidores = useCallback(async () => {
    if (!comunidadId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await medidoresService.getMedidores(comunidadId);
      setMedidores(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar medidores';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [comunidadId]);

  // 🆕 Crear medidor
  const createMedidor = useCallback(async (data: CreateMedidorRequest) => {
    if (!comunidadId) return null;

    try {
      const newMedidor = await medidoresService.createMedidor(comunidadId, data);
      setMedidores(prev => [newMedidor, ...prev]);
      toast.success('Medidor creado exitosamente');
      return newMedidor;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al crear medidor';
      toast.error(errorMessage);
      throw err;
    }
  }, [comunidadId]);

  // 🗑️ Eliminar medidor
  const deleteMedidor = useCallback(async (medidorId: number) => {
    try {
      await medidoresService.deleteMedidor(medidorId);
      setMedidores(prev => prev.filter(m => m.id !== medidorId));
      toast.success('Medidor eliminado');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al eliminar medidor';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // 🔄 Auto-cargar cuando cambia la comunidad
  useEffect(() => {
    loadMedidores();
  }, [loadMedidores]);

  return {
    medidores,
    loading,
    error,
    loadMedidores,
    createMedidor,
    deleteMedidor
  };
}

// ✅ Hook específico para lecturas de un medidor
export function useLecturas(medidorId: number | null) {
  const [lecturas, setLecturas] = useState<LecturaMedidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📋 Cargar lecturas
  const loadLecturas = useCallback(async () => {
    if (!medidorId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await medidoresService.getLecturas(medidorId, 50); // Últimas 50
      setLecturas(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar lecturas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [medidorId]);

  // 🆕 Crear lectura
  const createLectura = useCallback(async (data: CreateLecturaRequest) => {
    if (!medidorId) return null;

    try {
      const newLectura = await medidoresService.createLectura(medidorId, data);
      setLecturas(prev => [newLectura, ...prev]);
      toast.success('Lectura registrada exitosamente');
      return newLectura;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al registrar lectura';
      toast.error(errorMessage);
      throw err;
    }
  }, [medidorId]);

  // 🗑️ Eliminar lectura
  const deleteLectura = useCallback(async (lecturaId: number) => {
    try {
      await medidoresService.deleteLectura(lecturaId);
      setLecturas(prev => prev.filter(l => l.id !== lecturaId));
      toast.success('Lectura eliminada');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al eliminar lectura';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // 🔄 Auto-cargar cuando cambia el medidor
  useEffect(() => {
    loadLecturas();
  }, [loadLecturas]);

  return {
    lecturas,
    loading,
    error,
    loadLecturas,
    createLectura,
    deleteLectura
  };
}

// ✅ Hook para consumos calculados
export function useConsumos(medidorId: number | null, desde?: string, hasta?: string) {
  const [consumos, setConsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsumos = useCallback(async () => {
    if (!medidorId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await medidoresService.getConsumos(medidorId, desde, hasta);
      setConsumos(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al cargar consumos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [medidorId, desde, hasta]);

  useEffect(() => {
    loadConsumos();
  }, [loadConsumos]);

  return {
    consumos,
    loading,
    error,
    loadConsumos
  };
}