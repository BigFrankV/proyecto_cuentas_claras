import { useState, useEffect } from 'react';
import { documentosCompraService, DocumentoCompra, DocumentoCompraCreateRequest, DocumentoCompraUpdateRequest, DocumentosCompraEstadisticas, DocumentosCompraFilters } from '../lib/documentosCompraService';

interface UseDocumentosCompraState {
  documentos: DocumentoCompra[];
  loading: boolean;
  error: string | null;
  estadisticas: DocumentosCompraEstadisticas | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

interface UseDocumentosCompraActions {
  fetchDocumentos: (filters?: DocumentosCompraFilters) => Promise<void>;
  createDocumento: (data: DocumentoCompraCreateRequest) => Promise<DocumentoCompra>;
  updateDocumento: (id: number, data: DocumentoCompraUpdateRequest) => Promise<DocumentoCompra>;
  deleteDocumento: (id: number) => Promise<void>;
  cambiarEstado: (id: number, estado: DocumentoCompra['estado']) => Promise<DocumentoCompra>;
  subirArchivo: (id: number, file: File) => Promise<{ url: string }>;
  fetchEstadisticas: () => Promise<void>;
  clearError: () => void;
}

export function useDocumentosCompra(comunidadId: number): UseDocumentosCompraState & UseDocumentosCompraActions {
  const [state, setState] = useState<UseDocumentosCompraState>({
    documentos: [],
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

  const fetchDocumentos = async (filters: DocumentosCompraFilters = {}) => {
    if (!comunidadId) return;

    setLoading(true);
    setError(null);
    try {
      const documentos = await documentosCompraService.getDocumentosCompra(comunidadId, filters);
      setState(prev => ({ 
        ...prev, 
        documentos,
        pagination: null
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createDocumento = async (data: DocumentoCompraCreateRequest): Promise<DocumentoCompra> => {
    setLoading(true);
    setError(null);
    try {
      const nuevoDocumento = await documentosCompraService.createDocumentoCompra(comunidadId, data);
      setState(prev => ({ 
        ...prev, 
        documentos: [...prev.documentos, nuevoDocumento] 
      }));
      return nuevoDocumento;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumento = async (id: number, data: DocumentoCompraUpdateRequest): Promise<DocumentoCompra> => {
    setLoading(true);
    setError(null);
    try {
      const documentoActualizado = await documentosCompraService.updateDocumentoCompra(id, data);
      setState(prev => ({
        ...prev,
        documentos: prev.documentos.map(d => 
          d.id === id ? documentoActualizado : d
        )
      }));
      return documentoActualizado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocumento = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await documentosCompraService.deleteDocumentoCompra(id);
      setState(prev => ({
        ...prev,
        documentos: prev.documentos.filter(d => d.id !== id)
      }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: number, estado: DocumentoCompra['estado']): Promise<DocumentoCompra> => {
    setLoading(true);
    setError(null);
    try {
      const documentoActualizado = await documentosCompraService.cambiarEstado(id, estado);
      setState(prev => ({
        ...prev,
        documentos: prev.documentos.map(d => 
          d.id === id ? documentoActualizado : d
        )
      }));
      return documentoActualizado;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const subirArchivo = async (id: number, file: File): Promise<{ url: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await documentosCompraService.subirArchivo(id, file);
      // Actualizar el documento con la nueva URL del archivo
      setState(prev => ({
        ...prev,
        documentos: prev.documentos.map(d => 
          d.id === id ? { ...d, archivo_url: result.url } : d
        )
      }));
      return result;
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
      const estadisticas = await documentosCompraService.getEstadisticas(comunidadId);
      setState(prev => ({ ...prev, estadisticas }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state,
    fetchDocumentos,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    cambiarEstado,
    subirArchivo,
    fetchEstadisticas,
    clearError
  };
}

interface UseDocumentoCompraState {
  documento: DocumentoCompra | null;
  loading: boolean;
  error: string | null;
}

interface UseDocumentoCompraActions {
  fetchDocumento: () => Promise<void>;
  clearError: () => void;
}

export function useDocumentoCompra(id: number): UseDocumentoCompraState & UseDocumentoCompraActions {
  const [state, setState] = useState<UseDocumentoCompraState>({
    documento: null,
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

  const fetchDocumento = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const documento = await documentosCompraService.getDocumentoCompra(id);
      setState(prev => ({ ...prev, documento }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumento();
  }, [id]);

  return {
    ...state,
    fetchDocumento,
    clearError
  };
}