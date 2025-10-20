import apiClient from './api';

// Tipos para emisiones
export interface Emision {
  id: number;
  comunidad_id?: number;
  periodo: string; // YYYY-MM
  fecha_emision?: string;
  fecha_vencimiento: string;
  estado: 'borrador' | 'emitida' | 'cerrada' | 'anulada' | 'lista';
  monto_total?: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleEmision {
  id: number;
  emision_id?: number;
  categoria_id?: number;
  monto?: number;
  regla_prorrateo?: string;
  descripcion?: string;
  categoria?: string;
  nombre?: string;
  tipo_prorrateo?: 'proporcional' | 'igual' | 'personalizado';
  created_at?: string;
}

export interface EmisionCompleta extends Emision {
  detalles?: DetalleEmision[];
  total_gastos?: number;
  total_pagos?: number;
  unidades_count?: number;
}

export interface UnidadProrrateo {
  id?: number;
  unidad_id?: number;
  numero?: string;
  tipo?: string;
  propietario?: string;
  contacto?: string;
  alicuota?: number;
  monto_total?: number;
  monto_pagado?: number;
  estado?: string;
  created_at?: string;
}

export interface GastoEmision {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
  proveedor?: string;
  fecha: string;
  documento?: string;
}

export interface PagoEmision {
  id: number;
  fecha: string;
  monto: number;
  medio: string;
  referencia?: string;
  unidad: string;
  estado: string;
}

export interface CreateEmisionData {
  periodo: string;
  fecha_vencimiento: string;
  observaciones?: string;
}

export interface CreateDetalleData {
  categoria_id: number;
  monto: number;
  regla_prorrateo: string;
  descripcion?: string;
}

const emisionesService = {
  /**
   * Obtener emisiones de una comunidad
   */
  async getEmisionesByComunidad(
    comunidadId: number,
    page = 1,
    limit = 50,
  ): Promise<{ data: Emision[]; total: number }> {
    const [emisionesRes, countRes] = await Promise.all([
      apiClient.get(`/emisiones/comunidad/${comunidadId}`, {
        params: { page, limit },
      }),
      apiClient.get(`/emisiones/comunidad/${comunidadId}/count`),
    ]);
    return {
      data: emisionesRes.data,
      total: countRes.data.total || 0,
    };
  },

  /**
   * Obtener una emisión por ID
   */
  async getEmisionById(id: number): Promise<Emision> {
    const response = await apiClient.get(`/emisiones/${id}`);
    return response.data;
  },

  /**
   * Obtener detalle completo de una emisión (con totales y parámetros)
   */
  async getEmisionDetalleCompleto(id: number): Promise<EmisionCompleta> {
    const response = await apiClient.get(`/emisiones/${id}/detalle-completo`);
    return response.data;
  },

  /**
   * Crear una nueva emisión
   */
  async createEmision(
    comunidadId: number,
    data: CreateEmisionData,
  ): Promise<Emision> {
    const response = await apiClient.post(
      `/emisiones/comunidad/${comunidadId}`,
      data,
    );
    return response.data;
  },

  /**
   * Actualizar una emisión
   */
  async updateEmision(
    id: number,
    data: Partial<CreateEmisionData>,
  ): Promise<Emision> {
    const response = await apiClient.patch(`/emisiones/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una emisión
   */
  async deleteEmision(id: number): Promise<void> {
    await apiClient.delete(`/emisiones/${id}`);
  },

  /**
   * Obtener detalles/conceptos de una emisión
   */
  async getDetallesEmision(id: number): Promise<DetalleEmision[]> {
    const response = await apiClient.get(`/emisiones/${id}/detalles`);
    return response.data;
  },

  /**
   * Agregar un detalle/concepto a una emisión
   */
  async addDetalleEmision(
    id: number,
    data: CreateDetalleData,
  ): Promise<DetalleEmision> {
    const response = await apiClient.post(`/emisiones/${id}/detalles`, data);
    return response.data;
  },

  /**
   * Obtener gastos incluidos en una emisión
   */
  async getGastosEmision(id: number): Promise<GastoEmision[]> {
    const response = await apiClient.get(`/emisiones/${id}/gastos`);
    return response.data;
  },

  /**
   * Obtener unidades y prorrateo de una emisión
   */
  async getUnidadesProrrateo(id: number): Promise<UnidadProrrateo[]> {
    const response = await apiClient.get(`/emisiones/${id}/unidades`);
    return response.data;
  },

  /**
   * Obtener pagos de una emisión
   */
  async getPagosEmision(id: number): Promise<PagoEmision[]> {
    const response = await apiClient.get(`/emisiones/${id}/pagos`);
    return response.data;
  },

  /**
   * Obtener auditoría/historial de una emisión
   */
  async getAuditoriaEmision(id: number): Promise<any[]> {
    const response = await apiClient.get(`/emisiones/${id}/auditoria`);
    return response.data;
  },

  /**
   * Previsualizar prorrateo de una emisión antes de generar cargos
   */
  async previsualizarProrrateo(id: number): Promise<any> {
    const response = await apiClient.get(`/emisiones/${id}/previsualizar-prorrateo`);
    return response.data;
  },

  /**
   * Generar cargos (cuentas de cobro) para todas las unidades
   */
  async generarCargos(id: number): Promise<any> {
    const response = await apiClient.post(`/emisiones/${id}/generar-cargos`);
    return response.data;
  },

  /**
   * Verificar existencia de emisión para un período
   */
  async verificarExistencia(
    comunidadId: number,
    periodo: string,
  ): Promise<boolean> {
    try {
      const response = await apiClient.get(`/emisiones/validar/existencia`, {
        params: { comunidad_id: comunidadId, periodo },
      });
      return response.data.existe_emision > 0;
    } catch {
      return false;
    }
  },

  /**
   * Validar gastos de una emisión
   */
  async validarGastos(id: number): Promise<any> {
    const response = await apiClient.get(`/emisiones/validar/gastos/${id}`);
    return response.data;
  },

  /**
   * Validar integridad de cuentas de cobro
   */
  async validarCuentas(id: number): Promise<any> {
    const response = await apiClient.get(`/emisiones/validar/cuentas/${id}`);
    return response.data;
  },

  /**
   * Validar cobertura de unidades con cuentas de cobro
   */
  async validarCobertura(comunidadId: number, emisionId: number): Promise<any> {
    const response = await apiClient.get(`/emisiones/validar/cobertura/${comunidadId}/${emisionId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas generales
   */
  async getEstadisticasGenerales(): Promise<any> {
    const response = await apiClient.get(`/emisiones/estadisticas/general`);
    return response.data;
  },

  /**
   * Obtener estadísticas por mes
   */
  async getEstadisticasPorMes(): Promise<any> {
    const response = await apiClient.get(`/emisiones/estadisticas/por-mes`);
    return response.data;
  },

  /**
   * Obtener estadísticas de cobranza
   */
  async getEstadisticasCobranza(): Promise<any> {
    const response = await apiClient.get(`/emisiones/estadisticas/cobranza`);
    return response.data;
  },
};

export default emisionesService;
