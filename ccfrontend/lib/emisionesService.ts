import apiClient from './api';
import {
  Emission,
  EmissionDetail,
  Concept,
  ExpenseDetail,
  UnitDistribution,
  Payment,
  HistoryEntry,
  EmissionFilters,
  EmissionListResponse,
  CreateEmissionData
} from '@/types/emisiones';

class EmisionesService {
  private baseUrl = '/emisiones';

  // Listar emisiones con filtros y paginación
  async getEmissions(filters?: EmissionFilters, page: number = 1, limit: number = 20): Promise<EmissionListResponse> {
    try {
      const params = new URLSearchParams();

      // Paginación
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      // Filtros
      if (filters?.communityId) params.append('comunidad_id', filters.communityId.toString());
      if (filters?.period) params.append('periodo', filters.period);
      if (filters?.status && filters.status !== 'all') {
        // Convertir status del frontend al de la API
        const statusMap: Record<string, string> = {
          'draft': 'borrador',
          'ready': 'borrador',
          'sent': 'emitido',
          'paid': 'cerrado',
          'cancelled': 'anulado'
        };
        params.append('estado', statusMap[filters.status] || filters.status);
      }
      if (filters?.dateFrom) params.append('fecha_desde', filters.dateFrom);
      if (filters?.dateTo) params.append('fecha_hasta', filters.dateTo);

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      return {
        data: response.data.data.map((emission: any) => this.normalizeEmission(emission)),
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching emissions:', error);
      throw error;
    }
  }

  // Obtener detalle de una emisión
  async getEmissionById(id: string): Promise<EmissionDetail> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.normalizeEmissionDetail(response.data);
    } catch (error) {
      console.error(`Error fetching emission ${id}:`, error);
      throw error;
    }
  }

  // Obtener conceptos de una emisión
  async getEmissionConcepts(id: string): Promise<Concept[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/conceptos`);
      return response.data.map((concept: any) => this.normalizeConcept(concept));
    } catch (error) {
      console.error(`Error fetching concepts for emission ${id}:`, error);
      return [];
    }
  }

  // Obtener gastos de una emisión
  async getEmissionExpenses(id: string): Promise<ExpenseDetail[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/gastos`);
      return response.data.map((expense: any) => this.normalizeExpense(expense));
    } catch (error) {
      console.error(`Error fetching expenses for emission ${id}:`, error);
      return [];
    }
  }

  // Obtener unidades de una emisión
  async getEmissionUnits(id: string): Promise<UnitDistribution[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/unidades`);
      return response.data.map((unit: any) => this.normalizeUnit(unit));
    } catch (error) {
      console.error(`Error fetching units for emission ${id}:`, error);
      return [];
    }
  }

  // Obtener pagos de una emisión
  async getEmissionPayments(id: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/pagos`);
      return response.data.map((payment: any) => this.normalizePayment(payment));
    } catch (error) {
      console.error(`Error fetching payments for emission ${id}:`, error);
      return [];
    }
  }

  // Obtener historial de una emisión
  async getEmissionHistory(id: string): Promise<HistoryEntry[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/historial`);
      return response.data.map((entry: any) => ({
        id: entry.id.toString(),
        date: entry.fecha,
        action: entry.accion,
        user: entry.usuario,
        description: entry.descripcion
      }));
    } catch (error) {
      console.error(`Error fetching history for emission ${id}:`, error);
      return [];
    }
  }

  // Obtener estadísticas de emisiones
  async getEmissionsStatistics(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/estadisticas`);
      return response.data;
    } catch (error) {
      console.error('Error fetching emissions statistics:', error);
      throw error;
    }
  }

  // Obtener validaciones de una emisión
  async getEmissionValidations(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/validaciones`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching validations for emission ${id}:`, error);
      throw error;
    }
  }

  // Crear nueva emisión
  async createEmission(communityId: number, data: CreateEmissionData): Promise<Emission> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/comunidad/${communityId}`, data);
      return this.normalizeEmission(response.data);
    } catch (error) {
      console.error('Error creating emission:', error);
      throw error;
    }
  }

  // Actualizar emisión
  async updateEmission(id: string, data: Partial<Emission>): Promise<Emission> {
    try {
      const updateData: any = {};

      if (data.status) {
        // Convertir status del frontend al de la API
        const statusMap: Record<string, string> = {
          'draft': 'borrador',
          'sent': 'emitido',
          'paid': 'cerrado',
          'cancelled': 'anulado'
        };
        updateData.estado = statusMap[data.status] || data.status;
      }

      if (data.description !== undefined) {
        updateData.observaciones = data.description;
      }

      const response = await apiClient.patch(`${this.baseUrl}/${id}`, updateData);
      return this.normalizeEmission(response.data);
    } catch (error) {
      console.error(`Error updating emission ${id}:`, error);
      throw error;
    }
  }

  // Eliminar emisión
  async deleteEmission(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting emission ${id}:`, error);
      throw error;
    }
  }

  // Normalizar datos de emisión desde la API
  private normalizeEmission(apiEmission: any): Emission {
    return {
      id: apiEmission.id.toString(),
      period: apiEmission.periodo,
      type: apiEmission.tipo,
      status: apiEmission.estado,
      issueDate: apiEmission.fechaEmision,
      dueDate: apiEmission.fechaVencimiento,
      totalAmount: apiEmission.montoTotal || 0,
      paidAmount: apiEmission.montoPagado || 0,
      unitCount: apiEmission.cantidadUnidades || 0,
      description: apiEmission.descripcion || '',
      communityName: apiEmission.nombreComunidad || ''
    };
  }

  // Normalizar detalle de emisión
  private normalizeEmissionDetail(apiEmission: any): EmissionDetail {
    const baseEmission = this.normalizeEmission(apiEmission);
    return {
      ...baseEmission,
      tieneInteres: apiEmission.tieneInteres || false,
      tasaInteres: apiEmission.tasaInteres || 0,
      periodoGracia: apiEmission.periodoGracia || 0
    };
  }

  // Normalizar concepto
  private normalizeConcept(apiConcept: any): Concept {
    return {
      id: apiConcept.id.toString(),
      name: apiConcept.nombre,
      description: apiConcept.descripcion,
      amount: apiConcept.monto,
      distributionType: apiConcept.tipoDistribucion,
      category: apiConcept.categoria
    };
  }

  // Normalizar gasto
  private normalizeExpense(apiExpense: any): ExpenseDetail {
    return {
      id: apiExpense.id.toString(),
      description: apiExpense.descripcion,
      amount: apiExpense.monto,
      category: apiExpense.categoria,
      supplier: apiExpense.proveedor || '',
      date: apiExpense.fecha,
      document: apiExpense.documento || ''
    };
  }

  // Normalizar unidad
  private normalizeUnit(apiUnit: any): UnitDistribution {
    return {
      id: apiUnit.id.toString(),
      unitNumber: apiUnit.numero,
      unitType: apiUnit.tipo,
      owner: apiUnit.propietario,
      contact: apiUnit.contacto,
      participation: apiUnit.participacion || 0,
      totalAmount: apiUnit.montoTotal || 0,
      paidAmount: apiUnit.montoPagado || 0,
      status: apiUnit.estado
    };
  }

  // Normalizar pago
  private normalizePayment(apiPayment: any): Payment {
    return {
      id: apiPayment.id.toString(),
      date: apiPayment.fecha,
      amount: apiPayment.monto,
      method: apiPayment.metodo,
      reference: apiPayment.referencia,
      unit: apiPayment.unidad,
      status: apiPayment.estado
    };
  }
}

export default new EmisionesService();