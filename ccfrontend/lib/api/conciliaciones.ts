/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

import {
  Conciliacion,
  ConciliacionDetalle,
  ConciliacionFormData,
  ConciliacionFiltros,
  EstadisticasConciliaciones,
  ConciliacionPendiente,
  ConciliacionPorEstado,
  ConciliacionPorTipo,
  MovimientoConDiferencias,
  MovimientoSinPago,
  HistorialPeriodo,
  SaldosComparacion,
  AnalisisPrecision,
  ResumenConciliacion,
  ValidacionConciliacion,
} from '@/types/conciliaciones';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ConciliacionesApi {
  private baseURL = `${API_BASE_URL}/conciliaciones`;

  // =========================================
  // 1. LISTAR CONCILIACIONES CON FILTROS
  // =========================================

  /**
   * Obtener todas las conciliaciones con filtros y paginación
   */
  async getAll(filtros: ConciliacionFiltros = {}): Promise<{
    data: Conciliacion[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filtros.comunidad_id) {
        params.append('comunidad_id', filtros.comunidad_id.toString());
      }
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      if (filtros.fecha_inicio) {
        params.append('fecha_inicio', filtros.fecha_inicio);
      }
      if (filtros.fecha_fin) {
        params.append('fecha_fin', filtros.fecha_fin);
      }
      if (filtros.limit) {
        params.append('limit', filtros.limit.toString());
      }
      if (filtros.offset) {
        params.append('offset', filtros.offset.toString());
      }

      const response = await axios.get(`${this.baseURL}?${params.toString()}`);
      return response.data;
    } catch {
      throw new Error('Error al obtener las conciliaciones');
    }
  }

  /**
   * Obtener conciliación por ID con detalle completo
   */
  async getById(id: number): Promise<ConciliacionDetalle> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch {
      throw new Error('Error al obtener la conciliación');
    }
  }

  // =========================================
  // 2. CONCILIACIONES POR COMUNIDAD
  // =========================================

  /**
   * Listar conciliaciones de una comunidad específica
   */
  async getByComunidad(
    comunidadId: number,
    filtros: Omit<ConciliacionFiltros, 'comunidad_id'> = {},
  ): Promise<{
    data: Conciliacion[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      if (filtros.fecha_inicio) {
        params.append('fecha_inicio', filtros.fecha_inicio);
      }
      if (filtros.fecha_fin) {
        params.append('fecha_fin', filtros.fecha_fin);
      }
      if (filtros.limit) {
        params.append('limit', filtros.limit.toString());
      }
      if (filtros.offset) {
        params.append('offset', filtros.offset.toString());
      }

      const url = `${this.baseURL}/comunidad/${comunidadId}?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch {
      throw new Error('Error al obtener las conciliaciones de la comunidad');
    }
  }

  /**
   * Crear nueva conciliación bancaria
   */
  async create(comunidadId: number, data: ConciliacionFormData): Promise<ConciliacionDetalle> {
    try {
      const response = await axios.post(`${this.baseURL}/comunidad/${comunidadId}`, data);
      return response.data;
    } catch {
      throw new Error('Error al crear la conciliación');
    }
  }

  // =========================================
  // 3. ESTADÍSTICAS DE CONCILIACIONES
  // =========================================

  /**
   * Estadísticas generales de conciliaciones por comunidad
   */
  async getEstadisticas(comunidadId: number): Promise<EstadisticasConciliaciones> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/estadisticas`);
      return response.data;
    } catch {
      throw new Error('Error al obtener las estadísticas');
    }
  }

  /**
   * Movimientos bancarios pendientes de conciliación
   */
  async getPendientes(comunidadId: number): Promise<ConciliacionPendiente[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/pendientes`);
      return response.data;
    } catch {
      throw new Error('Error al obtener los movimientos pendientes');
    }
  }

  /**
   * Conciliaciones agrupadas por estado
   */
  async getPorEstado(comunidadId: number): Promise<ConciliacionPorEstado[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/por-estado`);
      return response.data;
    } catch {
      throw new Error('Error al obtener las conciliaciones por estado');
    }
  }

  /**
   * Conciliaciones agrupadas por tipo de movimiento
   */
  async getPorTipo(comunidadId: number): Promise<ConciliacionPorTipo[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/por-tipo`);
      return response.data;
    } catch {
      throw new Error('Error al obtener las conciliaciones por tipo');
    }
  }

  // =========================================
  // 4. ANÁLISIS DE DIFERENCIAS
  // =========================================

  /**
   * Movimientos con diferencias entre banco y pago
   */
  async getConDiferencias(comunidadId: number): Promise<MovimientoConDiferencias[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/con-diferencias`);
      return response.data;
    } catch {
      throw new Error('Error al obtener los movimientos con diferencias');
    }
  }

  /**
   * Movimientos bancarios sin pagos asociados
   */
  async getSinPago(comunidadId: number): Promise<MovimientoSinPago[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/sin-pago`);
      return response.data;
    } catch {
      throw new Error('Error al obtener los movimientos sin pago');
    }
  }

  // =========================================
  // 5. REPORTES HISTÓRICOS
  // =========================================

  /**
   * Historial de conciliaciones por período
   */
  async getHistorialPeriodo(comunidadId: number): Promise<HistorialPeriodo[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/historial-periodo`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      
      throw new Error('Error al obtener el historial por período');
    }
  }

  /**
   * Comparación de saldos bancarios vs contables
   */
  async getSaldos(comunidadId: number): Promise<SaldosComparacion[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/saldos`);
      return response.data;
    } catch (error) {
      
      throw new Error('Error al obtener la comparación de saldos');
    }
  }

  /**
   * Análisis de precisión de conciliación por período
   */
  async getAnalisisPrecision(comunidadId: number): Promise<AnalisisPrecision[]> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/analisis-precision`);
      return response.data;
    } catch (error) {
      
      throw new Error('Error al obtener el análisis de precisión');
    }
  }

  /**
   * Resumen consolidado de conciliaciones por comunidad
   */
  async getResumen(comunidadId: number): Promise<ResumenConciliacion> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/resumen`);
      return response.data;
    } catch (error) {
      
      throw new Error('Error al obtener el resumen de conciliaciones');
    }
  }

  // =========================================
  // 6. VALIDACIONES
  // =========================================

  /**
   * Validar que las conciliaciones tienen datos necesarios
   */
  async validar(comunidadId: number): Promise<ValidacionConciliacion> {
    try {
      const response = await axios.get(`${this.baseURL}/comunidad/${comunidadId}/validar`);
      return response.data;
    } catch (error) {
      
      throw new Error('Error al validar las conciliaciones');
    }
  }

  // =========================================
  // 7. ACTUALIZACIÓN DE CONCILIACIONES
  // =========================================

  /**
   * Actualizar estado de conciliación
   */
  async updateEstado(id: number, estado: 'pendiente' | 'conciliado' | 'descartado'): Promise<ConciliacionDetalle> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, { estado });
      return response.data;
    } catch (error) {
      
      throw new Error('Error al actualizar el estado de la conciliación');
    }
  }

  /**
   * Conciliar un movimiento con un pago
   */
  async conciliar(id: number, pagoId: number): Promise<ConciliacionDetalle> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/conciliar`, { pago_id: pagoId });
      return response.data;
    } catch (error) {
      
      throw new Error('Error al conciliar el movimiento');
    }
  }

  /**
   * Descartar un movimiento
   */
  async descartar(id: number): Promise<ConciliacionDetalle> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/descartar`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      
      throw new Error('Error al descartar el movimiento');
    }
  }
}

export const conciliacionesApi = new ConciliacionesApi();
