import {
  Cargo,
  CargoFormData,
  CargoFilters,
  CargoDetalle,
  PaymentRecord,
} from '@/types/cargos';

// Interfaces para respuestas del backend
interface CargoBackend {
  id: number;
  concepto: string;
  descripcion?: string;
  tipo: string;
  estado: string;
  monto: number;
  fecha_vencimiento: string;
  unidad: string;
  nombre_comunidad?: string;
  periodo?: string;
  propietario?: string;
  saldo: number;
  interes_acumulado: number;
  fecha_creacion: string;
}

interface PagoBackend {
  id: number;
  fecha: string;
  monto: number;
  metodo: string;
  referencia: string;
  estado: string;
}

// Base URL para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores de API
const handleApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { error?: string } } };
    throw new Error(
      apiError.response?.data?.error || 'Error de conexión con el servidor',
    );
  }
  throw new Error('Error de conexión con el servidor');
};

// Helper para hacer peticiones autenticadas
const apiRequest = async (
  url: string,
  options: Record<string, unknown> = {},
) => {
  // Obtener token directamente de localStorage para evitar problemas de importación
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!token) {
    throw new Error('Missing token');
  }

  const config: Record<string, unknown> = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...((options.headers as Record<string, unknown>) || {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
};

// =============================================================================
// CARGOS - CRUD Principal
// =============================================================================

export const cargosApi = {
  // Crear un nuevo cargo
  create: async (cargoData: CargoFormData): Promise<Cargo> => {
    try {
      const data = await apiRequest('/cargos', {
        method: 'POST',
        body: JSON.stringify(cargoData),
      });

      // Mapear la respuesta del backend al formato del frontend
      return {
        id: data.id,
        concepto: data.concepto,
        descripcion: data.descripcion,
        tipo: data.tipo,
        estado: data.estado,
        monto: data.monto,
        unidad: data.unidad,
        periodo: data.periodo,
        fechaVencimiento: new Date(data.fecha_vencimiento),
        fechaCreacion: new Date(data.fecha_creacion),
        nombreComunidad: data.nombre_comunidad,
        propietario: data.propietario,
        saldo: data.saldo,
        interesAcumulado: data.interes_acumulado,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener todos los cargos de una comunidad con filtros
  getByComunidad: async (
    comunidadId: number,
    filters?: CargoFilters,
  ): Promise<Cargo[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('comunidadId', comunidadId.toString());

      if (filters?.estado) {
        queryParams.append('estado', filters.estado);
      }
      if (filters?.unidadId) {
        queryParams.append('unidadId', filters.unidadId.toString());
      }
      if (filters?.periodo) {
        queryParams.append('periodo', filters.periodo);
      }
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const url = `/cargos/comunidad/${comunidadId}?${queryParams.toString()}`;
      const data = await apiRequest(url);

      // Mapear la respuesta del backend al formato del frontend
      return data.map((cargo: CargoBackend) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado: cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        propietario: cargo.propietario,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener detalle de un cargo específico
  getById: async (id: number): Promise<CargoDetalle> => {
    try {
      const data = await apiRequest(`/cargos/${id}`);

      // Mapear la respuesta del backend al formato del frontend
      return {
        id: data.id,
        concepto: data.concepto,
        descripcion: data.descripcion,
        tipo: data.tipo,
        estado: data.estado,
        monto: data.monto,
        unidad: data.unidad,
        periodo: data.periodo,
        fechaVencimiento: new Date(data.fecha_vencimiento),
        fechaCreacion: new Date(data.fecha_creacion),
        nombreComunidad: data.nombre_comunidad,
        propietario: data.propietario,
        emailPropietario: data.email_propietario,
        telefonoPropietario: data.telefono_propietario,
        saldo: data.saldo,
        interesAcumulado: data.interes_acumulado,
        // TODO: Agregar pagos, documentos e historial cuando estén disponibles en el backend
        pagos: [],
        documentos: [],
        historial: [],
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos de una unidad específica
  getByUnidad: async (unidadId: number): Promise<Cargo[]> => {
    try {
      const data = await apiRequest(`/cargos/unidad/${unidadId}`);

      // Mapear la respuesta del backend al formato del frontend
      return data.map((cargo: CargoBackend) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado:
          cargo.estado === 'pending'
            ? 'pendiente'
            : cargo.estado === 'paid'
              ? 'pagado'
              : cargo.estado === 'overdue'
                ? 'vencido'
                : cargo.estado === 'partial'
                  ? 'parcial'
                  : cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener detalle completo de un cargo
  getDetalleCompleto: async (id: number): Promise<CargoDetalle> => {
    try {
      const data = await apiRequest(`/cargos/${id}/detalle`);

      return {
        id: data.id,
        concepto: data.concepto,
        descripcion: data.descripcion,
        tipo: data.tipo,
        estado: data.estado,
        monto: data.monto,
        unidad: data.unidad,
        periodo: data.periodo,
        fechaVencimiento: new Date(data.fecha_vencimiento),
        fechaCreacion: new Date(data.fecha_creacion),
        nombreComunidad: data.nombre_comunidad,
        propietario: data.propietario,
        emailPropietario: data.email_propietario,
        telefonoPropietario: data.telefono_propietario,
        saldo: data.saldo,
        interesAcumulado: data.interes_acumulado,
        pagos: data.pagos || [],
        documentos: data.documentos || [],
        historial: data.historial || [],
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener pagos de un cargo
  getPagos: async (id: number): Promise<PaymentRecord[]> => {
    try {
      const data = await apiRequest(`/cargos/${id}/pagos`);

      return data.map((pago: PagoBackend) => ({
        id: pago.id.toString(),
        fecha: new Date(pago.fecha),
        monto: pago.monto,
        metodo: pago.metodo,
        referencia: pago.referencia,
        estado: pago.estado,
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener estadísticas de cargos por comunidad
  getEstadisticas: async (
    comunidadId: number,
  ): Promise<{
    totalCargos: number;
    totalMonto: number;
    totalSaldo: number;
    totalInteres: number;
    montoPromedio: number;
    cargosPagados: number;
    cargosPendientes: number;
    cargosVencidos: number;
    cargosParciales: number;
    cargoMasAntiguo: string;
    cargoMasReciente: string;
  }> => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/estadisticas`,
      );
      return {
        totalCargos: data.total_cargos,
        totalMonto: data.monto_total,
        totalSaldo: data.saldo_total,
        totalInteres: data.interes_total,
        montoPromedio: data.monto_promedio,
        cargosPagados: data.cargos_pagados,
        cargosPendientes: data.cargos_pendientes,
        cargosVencidos: data.cargos_vencidos,
        cargosParciales: data.cargos_parciales,
        cargoMasAntiguo: data.cargo_mas_antiguo,
        cargoMasReciente: data.cargo_mas_reciente,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos por período
  getByPeriodo: async (
    comunidadId: number,
    periodo: string,
  ): Promise<Cargo[]> => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/periodo/${periodo}`,
      );

      return data.map((cargo: CargoBackend) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado: cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos vencidos
  getVencidos: async (comunidadId: number): Promise<Cargo[]> => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/vencidos`,
      );

      return data.map((cargo: CargoBackend) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado: cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener historial de pagos de un cargo
  getHistorialPagos: async (id: number): Promise<PaymentRecord[]> => {
    try {
      const data = await apiRequest(`/cargos/${id}/historial-pagos`);

      return data.map((pago: PagoBackend) => ({
        id: pago.id.toString(),
        fecha: new Date(pago.fecha),
        monto: pago.monto,
        metodo: pago.metodo,
        referencia: pago.referencia,
        estado: pago.estado,
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos agrupados por estado
  getPorEstado: async (
    comunidadId: number,
  ): Promise<
    Array<{
      estado: string;
      cantidad: number;
      montoTotal: number;
      montoPromedio: number;
    }>
  > => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/por-estado`,
      );
      return data.map(
        (item: {
          estado: string;
          cantidad: number;
          monto_total: number;
          monto_promedio: number;
        }) => ({
          estado: item.estado,
          cantidad: item.cantidad,
          montoTotal: item.monto_total,
          montoPromedio: item.monto_promedio,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Validación de cargos
  validarCargos: async (
    comunidadId: number,
  ): Promise<
    Array<{
      id: number;
      estadoValidacion: string;
      montoTotal: number;
      saldo: number;
      cantidadDetalles: number;
    }>
  > => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/validacion`,
      );
      return data.map(
        (item: {
          id: number;
          estado_validacion: string;
          monto_total: number;
          saldo: number;
          cantidad_detalles: number;
        }) => ({
          id: item.id,
          estadoValidacion: item.estado_validacion,
          montoTotal: item.monto_total,
          saldo: item.saldo,
          cantidadDetalles: item.cantidad_detalles,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos con interés acumulado
  getConInteres: async (comunidadId: number): Promise<Cargo[]> => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/con-interes`,
      );

      return data.map((cargo: CargoBackend) => ({
        id: cargo.id,
        concepto: cargo.concepto,
        tipo: cargo.tipo,
        estado: cargo.estado,
        monto: cargo.monto,
        fechaVencimiento: new Date(cargo.fecha_vencimiento),
        unidad: cargo.unidad,
        nombreComunidad: cargo.nombre_comunidad,
        periodo: cargo.periodo,
        saldo: cargo.saldo,
        interesAcumulado: cargo.interes_acumulado,
        fechaCreacion: new Date(cargo.fecha_creacion),
      }));
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener resumen de pagos
  getResumenPagos: async (
    comunidadId: number,
  ): Promise<
    Array<{
      chargeId: number;
      concept: string;
      totalAmount: number;
      remainingBalance: number;
      totalPaid: number;
      paymentCount: number;
      lastPaymentDate: string | null;
      estadoCalculado: string;
    }>
  > => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/resumen-pagos`,
      );
      return data.map(
        (item: {
          chargeId: number;
          concept: string;
          totalAmount: number;
          remainingBalance: number;
          totalPaid: number;
          paymentCount: number;
          lastPaymentDate: string | null;
          estado_calculado: string;
        }) => ({
          chargeId: item.chargeId,
          concept: item.concept,
          totalAmount: item.totalAmount,
          remainingBalance: item.remainingBalance,
          totalPaid: item.totalPaid,
          paymentCount: item.paymentCount,
          lastPaymentDate: item.lastPaymentDate,
          estadoCalculado: item.estado_calculado,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Obtener cargos por categoría
  getPorCategoria: async (
    comunidadId: number,
  ): Promise<
    Array<{
      nombreCategoria: string;
      tipoCategoria: string;
      cantidadDetallesCargo: number;
      montoTotal: number;
      montoPromedio: number;
      cargosUnicos: number;
      unidadesAfectadas: number;
    }>
  > => {
    try {
      const data = await apiRequest(
        `/cargos/comunidad/${comunidadId}/por-categoria`,
      );
      return data.map(
        (item: {
          nombre_categoria: string;
          tipo_categoria: string;
          cantidad_detalles_cargo: number;
          monto_total: number;
          monto_promedio: number;
          cargos_unicos: number;
          unidades_afectadas: number;
        }) => ({
          nombreCategoria: item.nombre_categoria,
          tipoCategoria: item.tipo_categoria,
          cantidadDetallesCargo: item.cantidad_detalles_cargo,
          montoTotal: item.monto_total,
          montoPromedio: item.monto_promedio,
          cargosUnicos: item.cargos_unicos,
          unidadesAfectadas: item.unidades_afectadas,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Recalcular interés de un cargo
  recalcularInteres: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await apiRequest(`/cargos/${id}/recalcular-interes`, {
        method: 'POST',
      });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Notificar sobre un cargo
  notificarCargo: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await apiRequest(`/cargos/${id}/notificar`, {
        method: 'POST',
      });
      return data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
