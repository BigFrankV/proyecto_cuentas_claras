import { api } from './api';

export interface DocumentoCompra {
  id: number;
  proveedor_id: number;
  tipo_doc: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  folio: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  neto: number;
  iva: number;
  exento: number;
  total: number;
  glosa?: string;
  estado: 'borrador' | 'ingresado' | 'aprobado' | 'pagado' | 'anulado';
  archivo_url?: string;
  
  // Relaciones
  proveedor?: {
    id: number;
    rut: string;
    dv: string;
    razon_social: string;
  };
  
  // Detalle de productos/servicios
  detalles?: DetalleDocumento[];
  
  comunidad_id: number;
  created_at: string;
  updated_at: string;
}

export interface DetalleDocumento {
  id?: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  subtotal: number;
  centro_costo_id?: number;
  centro_costo?: {
    id: number;
    nombre: string;
  };
}

export interface DocumentoCompraCreateRequest {
  proveedor_id: number;
  tipo_doc: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  folio: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  neto: number;
  iva: number;
  exento: number;
  total: number;
  glosa?: string;
  detalles?: Omit<DetalleDocumento, 'id'>[];
}

export interface DocumentoCompraUpdateRequest extends Partial<DocumentoCompraCreateRequest> {
  estado?: 'borrador' | 'ingresado' | 'aprobado' | 'pagado' | 'anulado';
}

export interface DocumentosCompraEstadisticas {
  total: number;
  por_estado: {
    borrador: number;
    ingresado: number;
    aprobado: number;
    pagado: number;
    anulado: number;
  };
  monto_total: number;
  monto_pendiente: number;
  monto_mes_actual: number;
  por_tipo: {
    factura: number;
    boleta: number;
    nota_credito: number;
    nota_debito: number;
  };
}

export interface DocumentosCompraFilters {
  search?: string;
  proveedor_id?: number;
  tipo_doc?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  page?: number;
  limit?: number;
  sort?: 'fecha_emision' | 'total' | 'proveedor';
  order?: 'asc' | 'desc';
}

class DocumentosCompraService {
  /**
   * Obtiene todos los documentos de compra de una comunidad con filtros
   */
  async getDocumentosCompra(comunidadId: number, filters: DocumentosCompraFilters = {}): Promise<DocumentoCompra[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.proveedor_id) queryParams.append('proveedor_id', filters.proveedor_id.toString());
      if (filters.tipo_doc) queryParams.append('tipo_doc', filters.tipo_doc);
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.fecha_desde) queryParams.append('fecha_desde', filters.fecha_desde);
      if (filters.fecha_hasta) queryParams.append('fecha_hasta', filters.fecha_hasta);
      if (filters.monto_min) queryParams.append('monto_min', filters.monto_min.toString());
      if (filters.monto_max) queryParams.append('monto_max', filters.monto_max.toString());
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.order) queryParams.append('order', filters.order);

      const response = await api.get(`/documentos-compra/comunidad/${comunidadId}?${queryParams}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo documentos de compra:', error);
      throw new Error(error?.response?.data?.error || 'Error al obtener los documentos de compra');
    }
  }

  /**
   * Obtiene un documento de compra por ID
   */
  async getDocumentoCompra(id: number): Promise<DocumentoCompra> {
    try {
      const response = await api.get(`/documentos-compra/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo documento de compra:', error);
      throw new Error(error?.response?.data?.error || 'Error al obtener el documento de compra');
    }
  }

  /**
   * Crea un nuevo documento de compra
   */
  async createDocumentoCompra(comunidadId: number, data: DocumentoCompraCreateRequest): Promise<DocumentoCompra> {
    try {
      const response = await api.post(`/documentos-compra/comunidad/${comunidadId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando documento de compra:', error);
      throw new Error(error?.response?.data?.error || 'Error al crear el documento de compra');
    }
  }

  /**
   * Actualiza un documento de compra
   */
  async updateDocumentoCompra(id: number, data: DocumentoCompraUpdateRequest): Promise<DocumentoCompra> {
    try {
      const response = await api.patch(`/documentos-compra/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando documento de compra:', error);
      throw new Error(error?.response?.data?.error || 'Error al actualizar el documento de compra');
    }
  }

  /**
   * Elimina un documento de compra
   */
  async deleteDocumentoCompra(id: number): Promise<void> {
    try {
      await api.delete(`/documentos-compra/${id}`);
    } catch (error: any) {
      console.error('Error eliminando documento de compra:', error);
      throw new Error(error?.response?.data?.error || 'Error al eliminar el documento de compra');
    }
  }

  /**
   * Obtiene estadísticas de documentos de compra
   */
  async getEstadisticas(comunidadId: number): Promise<DocumentosCompraEstadisticas> {
    try {
      const response = await api.get(`/documentos-compra/comunidad/${comunidadId}/estadisticas`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas de documentos de compra:', error);
      // Fallback: retornar estadísticas por defecto
      return {
        total: 0,
        por_estado: {
          borrador: 0,
          ingresado: 0,
          aprobado: 0,
          pagado: 0,
          anulado: 0
        },
        monto_total: 0,
        monto_pendiente: 0,
        monto_mes_actual: 0,
        por_tipo: {
          factura: 0,
          boleta: 0,
          nota_credito: 0,
          nota_debito: 0
        }
      };
    }
  }

  /**
   * Cambia el estado de un documento de compra
   */
  async cambiarEstado(id: number, estado: DocumentoCompra['estado']): Promise<DocumentoCompra> {
    return this.updateDocumentoCompra(id, { estado });
  }

  /**
   * Sube un archivo adjunto al documento
   */
  async subirArchivo(id: number, file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      
      const response = await api.post(`/documentos-compra/${id}/archivo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error subiendo archivo:', error);
      throw new Error(error?.response?.data?.error || 'Error al subir el archivo');
    }
  }

  /**
   * Obtiene etiquetas de tipos de documento
   */
  getTipoDocumentoLabel(tipo: string): string {
    const tipos = {
      factura: 'Factura',
      boleta: 'Boleta',
      nota_credito: 'Nota de Crédito',
      nota_debito: 'Nota de Débito'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  }

  /**
   * Obtiene etiquetas de estados
   */
  getEstadoLabel(estado: string): string {
    const estados = {
      borrador: 'Borrador',
      ingresado: 'Ingresado',
      aprobado: 'Aprobado',
      pagado: 'Pagado',
      anulado: 'Anulado'
    };
    return estados[estado as keyof typeof estados] || estado;
  }

  /**
   * Calcula totales de un documento basado en sus detalles
   */
  calcularTotales(detalles: DetalleDocumento[], tasaIva: number = 19): {
    neto: number;
    iva: number;
    total: number;
  } {
    const neto = detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    const iva = Math.round(neto * (tasaIva / 100));
    const total = neto + iva;

    return { neto, iva, total };
  }

  /**
   * Formatea montos en pesos chilenos
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  }
}

export const documentosCompraService = new DocumentosCompraService();
export default documentosCompraService;