import  apiClient  from './api';

export interface ConsumoCalculado {
  medidor_id: number;
  medidor_codigo: string;
  medidor_tipo: string;
  unidad_id?: number;
  periodo: string;
  lectura_actual: number;
  lectura_anterior: number;
  consumo: number;
  tarifa_precio?: number;
  monto_calculado?: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface TarifaConsumo {
  id: number;
  tipo_medidor: string;
  precio_unitario: number;
  moneda: string;
  vigente_desde: string;
  vigente_hasta?: string;
  activa: boolean;
}

class ConsumosService {
  
  // Obtener consumos calculados por comunidad y período
  async getConsumosPorComunidad(comunidadId: number, periodo: string): Promise<ConsumoCalculado[]> {
    const response = await apiClient.get(`/consumos/comunidad/${comunidadId}/${periodo}`);
    return response.data;
  }

  // Obtener tarifas activas
  async getTarifasActivas(comunidadId?: number): Promise<TarifaConsumo[]> {
    const url = comunidadId ? `/tarifas-consumo/comunidad/${comunidadId}` : '/tarifas-consumo';
    const response = await apiClient.get(url);
    return response.data;
  }

  // Calcular consumos para un período específico
  async calcularConsumos(comunidadId: number, periodo: string): Promise<ConsumoCalculado[]> {
    const response = await apiClient.post(`/consumos/calcular`, {
      comunidad_id: comunidadId,
      periodo
    });
    return response.data;
  }

  // Generar facturación por consumos
  async generarFacturacion(comunidadId: number, periodo: string): Promise<any> {
    const response = await apiClient.post(`/consumos/facturar`, {
      comunidad_id: comunidadId,
      periodo
    });
    return response.data;
  }

  // Exportar consumos
  async exportarConsumos(comunidadId: number, periodo: string, formato: 'xlsx' | 'pdf' = 'xlsx'): Promise<Blob> {
    const response = await apiClient.get(`/consumos/export/${comunidadId}/${periodo}/${formato}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const consumosService = new ConsumosService();