import {
  Pago,
  PaymentFilters,
  PaymentStats,
  PaginatedPayments,
  PaymentDetail,
  EstadisticaPorEstado,
  EstadisticaPorMetodo,
} from '@/types/pagos';

// Base URL para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores de API
const handleApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { error?: string } } };
    throw new Error(apiError.response?.data?.error || 'Error de conexión con el servidor');
  }
  throw new Error('Error de conexión con el servidor');
};

// Helper para hacer peticiones autenticadas
const apiRequest = async (url: string, options: Record<string, unknown> = {}) => {
  // Obtener token directamente de localStorage para evitar problemas de importación
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!token) {
    throw new Error('Missing token');
  }

  const config: Record<string, unknown> = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, unknown> || {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// =============================================================================
// PAGOS - Módulo API Completo
// =============================================================================

export const pagosApi = {
  // =========================================
  // 1. LISTADOS Y FILTROS
  // =========================================

  // Listar pagos con filtros avanzados
  getByComunidad: async (
    comunidadId: number,
    filtros?: PaymentFilters,
  ): Promise<PaginatedPayments> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('comunidadId', comunidadId.toString());

      // Always send limit and offset for pagination
      const limit = filtros?.limit || 20;
      const offset = filtros?.offset || 0;

      queryParams.append('limit', limit.toString());
      queryParams.append('offset', offset.toString());

      const url = `/pagos/comunidad/${comunidadId}?${queryParams.toString()}`;
      const response = await apiRequest(url);

      // Map backend response to frontend format
      const pagos: Pago[] = response.data.map((item: {
        id: number;
        order_id: string;
        amount: number;
        payment_date: string;
        status: string;
        payment_method: string;
        reference: string;
        receipt_number: string;
        community_name: string;
        unit_number: string;
        resident_name: string;
        resident_email: string;
        created_at: string;
        updated_at: string;
      }) => ({
        id: item.id,
        concepto: item.reference || item.order_id,
        monto: item.amount,
        fecha: item.payment_date,
        estado: item.status,
        metodoPago: item.payment_method,
        personaId: 0, // Not available in this endpoint
        comunidadId,
        transactionId: item.order_id,
        gateway: item.payment_method,
        // Additional fields from backend
        orderId: item.order_id,
        paymentDate: item.payment_date,
        reference: item.reference,
        receiptNumber: item.receipt_number,
        communityName: item.community_name,
        unitNumber: item.unit_number,
        residentName: item.resident_name,
        residentEmail: item.resident_email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      // Ensure pagination data is correct
      const totalRecords = response.pagination?.total || response.total || pagos.length;
      const hasMore = response.pagination?.hasMore || (offset + pagos.length < totalRecords);

      const paginationData = {
        total: totalRecords,
        limit,
        offset,
        hasMore,
      };

      return {
        data: pagos,
        pagination: paginationData,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener pago por ID con detalles completos
  getById: async (id: number): Promise<PaymentDetail> => {
    try {
      const data = await apiRequest(`/pagos/${id}`);

      // Map to PaymentDetail format
      return {
        id: data.id,
        orderId: data.order_id,
        amount: data.amount,
        gateway: data.payment_method,
        status: data.status,
        description: data.reference || data.order_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        paymentMethod: data.payment_method,
        reference: data.reference,
        unitNumber: data.unit_number,
        unitId: 0, // Not available
        resident: {
          name: data.resident_name,
          email: data.resident_email,
          phone: '', // Not available
        },
        charges: [], // Not available in this endpoint
        documents: [], // Not available in this endpoint
        timeline: [], // Not available in this endpoint
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 2. ESTADÍSTICAS
  // =========================================

  // Estadísticas generales de pagos por comunidad
  getEstadisticas: async (comunidadId: number): Promise<PaymentStats> => {
    try {
      const data = await apiRequest(`/pagos/comunidad/${comunidadId}/estadisticas`);

      return {
        totalPayments: data.total_payments,
        approvedPayments: data.approved_payments,
        pendingPayments: data.pending_payments,
        cancelledPayments: data.cancelled_payments,
        totalAmount: data.total_amount,
        averageAmount: data.average_amount,
        oldestPayment: data.oldest_payment,
        newestPayment: data.newest_payment,
        approvedAmount: data.approved_amount,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas agrupadas por estado
  getEstadisticasPorEstado: async (comunidadId: number): Promise<EstadisticaPorEstado[]> => {
    try {
      const data = await apiRequest(`/pagos/comunidad/${comunidadId}/estadisticas/estado`);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas agrupadas por método de pago
  getEstadisticasPorMetodo: async (comunidadId: number): Promise<EstadisticaPorMetodo[]> => {
    try {
      const data = await apiRequest(`/pagos/comunidad/${comunidadId}/estadisticas/metodo`);
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};