/* eslint-disable no-console */
import apiClient from './api';

// Interfaces para las respuestas de la API
export interface Emision {
  id: number;
  periodo: string;
  fecha_emision: string;
  monto_total: number;
  estado: 'borrador' | 'emitida' | 'cerrada';
  comunidad_id: number;
  created_at: string;
  updated_at: string;
}

export interface EmisionDetalle {
  id: number;
  periodo: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  monto_total: number;
  estado: string;
  observaciones: string;
  comunidad_id: number;
  created_at: string;
  updated_at: string;
  // Información adicional
  comunidad_razon_social?: string;
  total_unidades?: number;
  unidades_pagadas?: number;
  porcentaje_cobranza?: number;
  intereses_acumulados?: number;
  dias_mora_promedio?: number;
}

export interface EmisionResumen {
  emision_id: number;
  periodo: string;
  tipo_emision: string;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  nombre_comunidad: string;
  total_unidades_impactadas: number;
  monto_total_liquidado: number;
  monto_pagado_aplicado: number;
}

export interface DetalleEmision {
  id: number;
  categoria_id: number;
  gasto_id?: number;
  regla_prorrateo: string;
  monto: number;
  metadata_json?: string;
  created_at: string;
  // Información del gasto relacionado
  gasto_glosa?: string;
  gasto_fecha?: string;
  gasto_monto?: number;
  categoria_nombre?: string;
  centro_costo_nombre?: string;
}

export interface UnidadEmision {
  id: number;
  unidad_id: number;
  cuenta_cobro_unidad_id: number;
  monto_total: number;
  saldo: number;
  estado: string;
  intereses_acumulado: number;
  created_at: string;
  // Información de la unidad
  unidad_codigo?: string;
  torre_nombre?: string;
  // Información del titular
  titular_nombres?: string;
  titular_apellidos?: string;
  titular_tipo?: string;
}

export interface PagoEmision {
  id: number;
  pago_id: number;
  cuenta_cobro_unidad_id: number;
  monto_aplicado: number;
  fecha_aplicacion: string;
  // Información del pago
  pago_fecha?: string;
  pago_monto?: string;
  pago_medio?: string;
  pago_estado?: string;
  // Información de la unidad
  unidad_codigo?: string;
}

export interface AuditoriaEmision {
  id: number;
  tabla: string;
  registro_id: number;
  accion: string;
  usuario_id: number;
  cambios_json: string;
  fecha: string;
  ip_address?: string;
  // Información del usuario
  usuario_username?: string;
  usuario_nombres?: string;
}

export interface EstadisticasGenerales {
  total_emisiones: number;
  total_monto_emitido: number;
  total_monto_cobrado: number;
  porcentaje_cobranza_general: number;
  emisiones_vigentes: number;
  emisiones_vencidas: number;
  promedio_dias_mora: number;
}

export interface EstadisticasPorMes {
  periodo: string;
  total_emisiones: number;
  monto_emitido: number;
  monto_cobrado: number;
  porcentaje_cobranza: number;
  emisiones_vencidas: number;
}

export interface EstadisticasCobranza {
  emision_id: number;
  periodo: string;
  monto_total: number;
  monto_cobrado: number;
  porcentaje_cobranza: number;
  unidades_total: number;
  unidades_pagadas: number;
  intereses_acumulados: number;
  dias_mora_promedio: number;
}

// Interfaces para Prorrateo
export interface EmisionProrrateo {
  id: number;
  periodo: string;
  fecha_vencimiento: string;
  estado: string;
  observaciones: string;
  created_at: string;
}

export interface DetalleEmisionProrrateo {
  detalle_emision_gasto_id: number;
  glosa_gasto: string;
  fecha_gasto: string;
  monto_total_gasto: number;
  categoria_nombre: string;
  centro_costo_nombre?: string;
  regla_prorrateo: string;
  metadata_json?: string;
  monto_a_prorratear: number;
}

export interface CuentaCobroProrrateo {
  cuenta_cobro_id: number;
  unidad_codigo: string;
  torre_nombre?: string;
  monto_total: number;
  saldo: number;
  estado_cobro: string;
  interes_acumulado: number;
  titular_nombres?: string;
  titular_apellidos?: string;
  titular_tipo?: string;
}

export interface DetalleCargoCuenta {
  detalle_cargo_id: number;
  categoria_nombre: string;
  glosa: string;
  monto: number;
  origen: string;
  iva_incluido: boolean;
}

// Servicio de Emisiones
class EmisionesService {
  // ========================================
  // LISTADO Y GESTIÓN BÁSICA
  // ========================================

  /**
   * Obtener emisiones de una comunidad
   */
  async getEmisionesComunidad(
    comunidadId: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    emisiones: Emision[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const [emisionesResponse, countResponse] = await Promise.all([
        apiClient.get(`/emisiones/comunidad/${comunidadId}`, {
          params: { page, limit },
        }),
        apiClient.get(`/emisiones/comunidad/${comunidadId}/count`),
      ]);

      const emisiones = emisionesResponse.data;
      const total = countResponse.data.total;
      const totalPages = Math.ceil(total / limit);

      return {
        emisiones,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching emisiones:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de emisiones con métricas consolidadas
   */
  async getEmisionesComunidadResumen(
    comunidadId: number,
  ): Promise<EmisionResumen[]> {
    try {
      const response = await apiClient.get(
        `/emisiones/comunidad/${comunidadId}/resumen`,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching emisiones resumen:', error);
      throw error;
    }
  }

  /**
   * Obtener emisión por ID
   */
  async getEmision(id: number): Promise<Emision> {
    try {
      const response = await apiClient.get(`/emisiones/${id}`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching emision:', error);
      throw error;
    }
  }

  /**
   * Obtener emisión con detalle completo
   */
  async getEmisionDetalleCompleto(id: number): Promise<EmisionDetalle> {
    try {
      const response = await apiClient.get(`/emisiones/${id}/detalle-completo`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching emision detalle completo:', error);
      throw error;
    }
  }

  /**
   * Crear nueva emisión
   */
  async createEmision(
    comunidadId: number,
    data: {
      periodo: string;
      fecha_vencimiento: string;
      observaciones?: string;
    },
  ): Promise<Emision> {
    try {
      const response = await apiClient.post(
        `/emisiones/comunidad/${comunidadId}`,
        data,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error creating emision:', error);
      throw error;
    }
  }

  /**
   * Actualizar emisión
   */
  async updateEmision(id: number, data: Partial<Emision>): Promise<Emision> {
    try {
      const response = await apiClient.patch(`/emisiones/${id}`, data);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error updating emision:', error);
      throw error;
    }
  }

  /**
   * Eliminar emisión
   */
  async deleteEmision(id: number): Promise<void> {
    try {
      await apiClient.delete(`/emisiones/${id}`);
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error deleting emision:', error);
      throw error;
    }
  }

  // ========================================
  // DETALLES Y CONCEPTOS
  // ========================================

  /**
   * Obtener detalles/conceptos de una emisión
   */
  async getDetallesEmision(emisionId: number): Promise<DetalleEmision[]> {
    try {
      const response = await apiClient.get(`/emisiones/${emisionId}/detalles`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching detalles emision:', error);
      throw error;
    }
  }

  /**
   * Agregar detalle a una emisión
   */
  async addDetalleEmision(
    emisionId: number,
    data: {
      categoria_id: number;
      gasto_id?: number;
      regla_prorrateo: string;
      monto: number;
      metadata_json?: string;
    },
  ): Promise<DetalleEmision> {
    try {
      const response = await apiClient.post(
        `/emisiones/${emisionId}/detalles`,
        data,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error adding detalle emision:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos incluidos en una emisión
   */
  async getGastosEmision(emisionId: number): Promise<
    {
      id: number;
      gasto_id: number;
      glosa: string;
      fecha: string;
      monto: number;
      categoria_id: number;
      categoria_nombre: string;
      centro_costo_id?: number;
      centro_costo_nombre?: string;
    }[]
  > {
    try {
      const response = await apiClient.get(`/emisiones/${emisionId}/gastos`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching gastos emision:', error);
      throw error;
    }
  }

  // ========================================
  // UNIDADES Y PRORRATEO
  // ========================================

  /**
   * Obtener unidades y su prorrateo para una emisión
   */
  async getUnidadesEmision(emisionId: number): Promise<UnidadEmision[]> {
    try {
      const response = await apiClient.get(`/emisiones/${emisionId}/unidades`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching unidades emision:', error);
      throw error;
    }
  }

  // ========================================
  // PAGOS
  // ========================================

  /**
   * Obtener pagos aplicados para una emisión
   */
  async getPagosEmision(emisionId: number): Promise<PagoEmision[]> {
    try {
      const response = await apiClient.get(`/emisiones/${emisionId}/pagos`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching pagos emision:', error);
      throw error;
    }
  }

  // ========================================
  // AUDITORÍA
  // ========================================

  /**
   * Obtener historial de auditoría de una emisión
   */
  async getAuditoriaEmision(emisionId: number): Promise<AuditoriaEmision[]> {
    try {
      const response = await apiClient.get(`/emisiones/${emisionId}/auditoria`);
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching auditoria emision:', error);
      throw error;
    }
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Obtener estadísticas generales
   */
  async getEstadisticasGenerales(): Promise<EstadisticasGenerales> {
    try {
      const response = await apiClient.get('/emisiones/estadisticas/general');
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching estadisticas generales:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas por mes
   */
  async getEstadisticasPorMes(): Promise<EstadisticasPorMes[]> {
    try {
      const response = await apiClient.get('/emisiones/estadisticas/por-mes');
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching estadisticas por mes:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de cobranza por emisión
   */
  async getEstadisticasCobranza(): Promise<EstadisticasCobranza[]> {
    try {
      const response = await apiClient.get('/emisiones/estadisticas/cobranza');
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching estadisticas cobranza:', error);
      throw error;
    }
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  /**
   * Validar existencia de emisión para periodo y comunidad
   */
  async validarExistenciaEmision(
    comunidadId: number,
    periodo: string,
  ): Promise<{
    existe: boolean;
    emision_id?: number;
  }> {
    try {
      const response = await apiClient.get('/emisiones/validar/existencia', {
        params: { comunidad_id: comunidadId, periodo },
      });
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error validating emision existencia:', error);
      throw error;
    }
  }

  // ========================================
  // ENDPOINTS DE PRORRATEO
  // ========================================

  /**
   * Obtener emisiones de gastos comunes por comunidad (Prorrateo)
   */
  async getEmisionesProrrateo(
    comunidadId: number,
  ): Promise<EmisionProrrateo[]> {
    try {
      const response = await apiClient.get(
        `/prorrateo/emisiones/${comunidadId}`,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching emisiones prorrateo:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de gastos de una emisión (Prorrateo)
   */
  async getDetallesEmisionProrrateo(
    emisionId: number,
  ): Promise<DetalleEmisionProrrateo[]> {
    try {
      const response = await apiClient.get(
        `/prorrateo/emision/${emisionId}/detalles`,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching detalles emision prorrateo:', error);
      throw error;
    }
  }

  /**
   * Obtener cuentas de cobro de una emisión (Prorrateo)
   */
  async getCuentasCobroEmision(
    emisionId: number,
  ): Promise<CuentaCobroProrrateo[]> {
    try {
      const response = await apiClient.get(
        `/prorrateo/emision/${emisionId}/cuentas`,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching cuentas cobro emision:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de cargos de una cuenta específica (Prorrateo)
   */
  async getDetallesCuentaCobro(
    cuentaId: number,
  ): Promise<DetalleCargoCuenta[]> {
    try {
      const response = await apiClient.get(
        `/prorrateo/cuenta/${cuentaId}/detalles`,
      );
      return response.data;
    } catch (error) {
// eslint-disable-next-line no-console
console.error('Error fetching detalles cuenta cobro:', error);
      throw error;
    }
  }
}

const emisionesService = new EmisionesService();
export default emisionesService;

