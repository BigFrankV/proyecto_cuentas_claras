import {
  Ticket,
  TicketDetalle,
  TicketEstadisticas,
  TicketProximoVencer,
  EstadisticasGenerales,
  EstadisticaPorEstado,
  EstadisticaPorPrioridad,
  EstadisticaPorCategoria,
  EstadisticaMensual,
  TicketFiltros,
  TicketFormData,
  TicketUpdateData,
  BusquedaAvanzadaFiltros,
  TicketPorAsignado,
  ValidacionIntegridad,
} from '@/types/tickets';

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
// TICKETS - Módulo API Completo
// =============================================================================

export const ticketsApi = {
  // =========================================
  // 1. LISTADOS BÁSICOS CON FILTROS
  // =========================================

  // Listar tickets con filtros avanzados
  getByComunidad: async (
    comunidadId: number,
    filtros?: TicketFiltros,
  ): Promise<Ticket[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('comunidadId', comunidadId.toString());

      if (filtros?.estado) {
        queryParams.append('estado', filtros.estado);
      }
      if (filtros?.prioridad) {
        queryParams.append('prioridad', filtros.prioridad);
      }
      if (filtros?.categoria) {
        queryParams.append('categoria', filtros.categoria);
      }
      if (filtros?.asignado_a) {
        queryParams.append('asignado_a', filtros.asignado_a.toString());
      }
      if (filtros?.fecha_desde) {
        queryParams.append('fecha_desde', filtros.fecha_desde);
      }
      if (filtros?.fecha_hasta) {
        queryParams.append('fecha_hasta', filtros.fecha_hasta);
      }
      if (filtros?.ordenar_por) {
        queryParams.append('ordenar_por', filtros.ordenar_por);
      }
      if (filtros?.limit) {
        queryParams.append('limit', filtros.limit.toString());
      }
      if (filtros?.offset) {
        queryParams.append('offset', filtros.offset.toString());
      }

      const url = `/tickets/comunidad/${comunidadId}?${queryParams.toString()}`;
      const data = await apiRequest(url);

      return data.map(
        (ticket: {
          id: number;
          numero: number;
          titulo: string;
          descripcion: string;
          estado: string;
          prioridad: string;
          categoria: string;
          comunidad: string;
          unidad: string;
          solicitante: string;
          asignado_a: string;
          fecha_creacion: string;
          fecha_actualizacion: string;
          fecha_vencimiento: string;
          fecha_cierre: string;
          dias_vencimiento: number | null;
          nivel_urgencia: string;
          dias_abiertos: number;
        }) => ({
          id: ticket.id,
          numero: ticket.numero,
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          estado: ticket.estado as
            | 'abierto'
            | 'en_progreso'
            | 'resuelto'
            | 'cerrado',
          prioridad: ticket.prioridad as 'alta' | 'media' | 'baja',
          categoria: ticket.categoria,
          comunidad: ticket.comunidad,
          unidad: ticket.unidad,
          solicitante: ticket.solicitante,
          asignado_a: ticket.asignado_a,
          fecha_creacion: ticket.fecha_creacion,
          fecha_actualizacion: ticket.fecha_actualizacion,
          fecha_vencimiento: ticket.fecha_vencimiento,
          fecha_cierre: ticket.fecha_cierre,
          dias_vencimiento: ticket.dias_vencimiento,
          nivel_urgencia: ticket.nivel_urgencia as
            | 'finalizado'
            | 'vencido'
            | 'critico'
            | 'urgente'
            | 'normal',
          dias_abiertos: ticket.dias_abiertos,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas de tickets por comunidad
  getEstadisticasByComunidad: async (
    comunidadId: number,
  ): Promise<TicketEstadisticas> => {
    try {
      const data = await apiRequest(
        `/tickets/comunidad/${comunidadId}/estadisticas`,
      );
      return {
        comunidad: data.comunidad,
        total_tickets: data.total_tickets,
        abiertos: data.abiertos,
        en_progreso: data.en_progreso,
        resueltos: data.resueltos,
        cerrados: data.cerrados,
        escalados: data.escalados,
        tiempo_promedio_resolucion: data.tiempo_promedio_resolucion,
        ultimo_ticket: data.ultimo_ticket,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Tickets próximos a vencer
  getProximosVencer: async (
    comunidadId: number,
  ): Promise<TicketProximoVencer[]> => {
    try {
      const data = await apiRequest(
        `/tickets/comunidad/${comunidadId}/proximos-vencer`,
      );
      return data.map(
        (ticket: {
          id: number;
          numero: number;
          titulo: string;
          comunidad: string;
          unidad: string;
          solicitante: string;
          fecha_vencimiento: string;
          dias_restantes: number;
          urgencia: string;
          prioridad: string;
          categoria: string;
        }) => ({
          id: ticket.id,
          numero: ticket.numero,
          titulo: ticket.titulo,
          comunidad: ticket.comunidad,
          unidad: ticket.unidad,
          solicitante: ticket.solicitante,
          fecha_vencimiento: ticket.fecha_vencimiento,
          dias_restantes: ticket.dias_restantes,
          urgencia: ticket.urgencia as 'alta' | 'media' | 'baja',
          prioridad: ticket.prioridad as 'alta' | 'media' | 'baja',
          categoria: ticket.categoria,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 2. VISTAS DETALLADAS
  // =========================================

  // Vista detallada de un ticket específico
  getById: async (id: number): Promise<TicketDetalle> => {
    try {
      const data = await apiRequest(`/tickets/${id}`);
      return {
        id: data.id,
        numero: data.numero,
        titulo: data.titulo || data.asunto,
        descripcion: data.descripcion,
        estado: data.estado,
        prioridad: data.prioridad,
        categoria: data.categoria,
        comunidad_id: data.comunidad_id,
        comunidad_nombre: data.comunidad_nombre,
        unidad_id: data.unidad_id,
        unidad_codigo: data.unidad_codigo,
        solicitante_id: data.solicitante_id,
        solicitante_nombre: data.solicitante_nombre,
        solicitante_email: data.solicitante_email,
        asignado_id: data.asignado_id,
        asignado_nombre: data.asignado_nombre,
        asignado_email: data.asignado_email,
        fecha_creacion: data.fecha_creacion,
        fecha_actualizacion: data.fecha_actualizacion,
        fecha_vencimiento: data.fecha_vencimiento,
        fecha_cierre: data.fecha_cierre,
        tiempo_resolucion: data.tiempo_resolucion,
        estado_descripcion: data.estado_descripcion,
        dias_desde_creacion: data.dias_desde_creacion,
        dias_para_resolver: data.dias_para_resolver,
        num_comentarios:
          data.estadisticas?.num_comentarios || data.num_comentarios || 0,
        num_adjuntos: data.estadisticas?.num_adjuntos || data.num_adjuntos || 0,
        num_historial:
          data.estadisticas?.num_historial || data.num_historial || 0,
        // Additional fields from backend
        tags: data.etiquetas || [],
        attachments: data.adjuntos || [],
        requester: data.solicitante || null,
        assignee: data.asignado || null,
        comments: data.comentarios || [],
        timeline: data.timeline || [],
        dueDate: data.fecha_vencimiento,
        createdAt: data.fecha_creacion,
        updatedAt: data.fecha_actualizacion,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Vista de tickets con información completa
  getTodosCompletos: async (): Promise<Ticket[]> => {
    try {
      const data = await apiRequest('/tickets/todos/completos');
      return data.map(
        (ticket: {
          id: number;
          numero: number;
          asunto: string;
          descripcion: string;
          estado: string;
          prioridad: string;
          categoria: string;
          comunidad: string;
          unidad: string;
          solicitante: string;
          asignado_a: string;
          fecha_creacion: string;
          fecha_actualizacion: string;
          fecha_vencimiento: string;
          fecha_cierre: string;
          dias_vencimiento: number | null;
          nivel_urgencia: string;
          dias_abiertos: number;
        }) => ({
          id: ticket.id,
          numero: ticket.numero,
          titulo: ticket.asunto,
          descripcion: ticket.descripcion,
          estado: ticket.estado as
            | 'abierto'
            | 'en_progreso'
            | 'resuelto'
            | 'cerrado',
          prioridad: ticket.prioridad as 'alta' | 'media' | 'baja',
          categoria: ticket.categoria,
          comunidad: ticket.comunidad,
          unidad: ticket.unidad,
          solicitante: ticket.solicitante,
          asignado_a: ticket.asignado_a,
          fecha_creacion: ticket.fecha_creacion,
          fecha_actualizacion: ticket.fecha_actualizacion,
          fecha_vencimiento: ticket.fecha_vencimiento,
          fecha_cierre: ticket.fecha_cierre,
          dias_vencimiento: ticket.dias_vencimiento,
          nivel_urgencia: ticket.nivel_urgencia as
            | 'finalizado'
            | 'vencido'
            | 'critico'
            | 'urgente'
            | 'normal',
          dias_abiertos: ticket.dias_abiertos,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 3. ESTADÍSTICAS
  // =========================================

  // Estadísticas generales
  getEstadisticasGenerales: async (): Promise<EstadisticasGenerales> => {
    try {
      const data = await apiRequest('/tickets/estadisticas/generales');
      return {
        total_tickets: data.total_tickets,
        comunidades_con_tickets: data.comunidades_con_tickets,
        tickets_abiertos: data.tickets_abiertos,
        tickets_en_progreso: data.tickets_en_progreso,
        tickets_resueltos: data.tickets_resueltos,
        tickets_cerrados: data.tickets_cerrados,
        tickets_escalados: data.tickets_escalados,
        tiempo_promedio_resolucion: data.tiempo_promedio_resolucion,
        primer_ticket: data.primer_ticket,
        ultimo_ticket: data.ultimo_ticket,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas por estado
  getEstadisticasPorEstado: async (): Promise<EstadisticaPorEstado[]> => {
    try {
      const data = await apiRequest('/tickets/estadisticas/por-estado');
      return data.map(
        (stat: {
          estado: string;
          cantidad: number;
          porcentaje: number;
          tiempo_promedio_resolucion: number;
          mas_antiguo: string;
          mas_reciente: string;
        }) => ({
          estado: stat.estado as
            | 'abierto'
            | 'en_progreso'
            | 'resuelto'
            | 'cerrado',
          cantidad: stat.cantidad,
          porcentaje: stat.porcentaje,
          tiempo_promedio_resolucion: stat.tiempo_promedio_resolucion,
          mas_antiguo: stat.mas_antiguo,
          mas_reciente: stat.mas_reciente,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas por prioridad
  getEstadisticasPorPrioridad: async (): Promise<EstadisticaPorPrioridad[]> => {
    try {
      const data = await apiRequest('/tickets/estadisticas/por-prioridad');
      return data.map(
        (stat: {
          prioridad: string;
          cantidad: number;
          porcentaje: number;
          resueltos: number;
          porcentaje_resolucion_prioridad: number;
          tiempo_promedio_resolucion: number;
        }) => ({
          prioridad: stat.prioridad as 'alta' | 'media' | 'baja',
          cantidad: stat.cantidad,
          porcentaje: stat.porcentaje,
          resueltos: stat.resueltos,
          porcentaje_resolucion_prioridad: stat.porcentaje_resolucion_prioridad,
          tiempo_promedio_resolucion: stat.tiempo_promedio_resolucion,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas por categoría
  getEstadisticasPorCategoria: async (): Promise<EstadisticaPorCategoria[]> => {
    try {
      const data = await apiRequest('/tickets/estadisticas/por-categoria');
      return data.map(
        (stat: {
          categoria: string;
          cantidad: number;
          porcentaje: number;
          resueltos: number;
          porcentaje_resolucion: number;
          tiempo_promedio_resolucion: number;
          mas_antiguo: string;
          mas_reciente: string;
        }) => ({
          categoria: stat.categoria,
          cantidad: stat.cantidad,
          porcentaje: stat.porcentaje,
          resueltos: stat.resueltos,
          porcentaje_resolucion: stat.porcentaje_resolucion,
          tiempo_promedio_resolucion: stat.tiempo_promedio_resolucion,
          mas_antiguo: stat.mas_antiguo,
          mas_reciente: stat.mas_reciente,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Estadísticas mensuales
  getEstadisticasMensuales: async (): Promise<EstadisticaMensual[]> => {
    try {
      const data = await apiRequest('/tickets/estadisticas/mensuales');
      return data.map(
        (stat: {
          anio: number;
          mes: number;
          total_tickets: number;
          abiertos: number;
          en_progreso: number;
          resueltos: number;
          cerrados: number;
          escalados: number;
          porcentaje_resolucion: number;
          tiempo_promedio_resolucion: number;
        }) => ({
          anio: stat.anio,
          mes: stat.mes,
          total_tickets: stat.total_tickets,
          abiertos: stat.abiertos,
          en_progreso: stat.en_progreso,
          resueltos: stat.resueltos,
          cerrados: stat.cerrados,
          escalados: stat.escalados,
          porcentaje_resolucion: stat.porcentaje_resolucion,
          tiempo_promedio_resolucion: stat.tiempo_promedio_resolucion,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 4. BÚSQUEDAS AVANZADAS
  // =========================================

  // Búsqueda avanzada
  busquedaAvanzada: async (
    filtros: BusquedaAvanzadaFiltros,
  ): Promise<Ticket[]> => {
    try {
      const queryParams = new URLSearchParams();

      if (filtros.busqueda) {
        queryParams.append('busqueda', filtros.busqueda);
      }
      if (filtros.comunidad_id) {
        queryParams.append('comunidad_id', filtros.comunidad_id.toString());
      }
      if (filtros.estado) {
        queryParams.append('estado', filtros.estado);
      }
      if (filtros.prioridad) {
        queryParams.append('prioridad', filtros.prioridad);
      }
      if (filtros.categoria) {
        queryParams.append('categoria', filtros.categoria);
      }
      if (filtros.asignado_a) {
        queryParams.append('asignado_a', filtros.asignado_a.toString());
      }
      if (filtros.fecha_desde) {
        queryParams.append('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        queryParams.append('fecha_hasta', filtros.fecha_hasta);
      }
      if (filtros.dias_vencimiento) {
        queryParams.append(
          'dias_vencimiento',
          filtros.dias_vencimiento.toString(),
        );
      }
      if (filtros.limit) {
        queryParams.append('limit', filtros.limit.toString());
      }
      if (filtros.offset) {
        queryParams.append('offset', filtros.offset.toString());
      }

      const url = `/tickets/busqueda/avanzada?${queryParams.toString()}`;
      const data = await apiRequest(url);

      return data.map(
        (ticket: {
          id: number;
          numero: number;
          titulo: string;
          descripcion: string;
          estado: string;
          prioridad: string;
          categoria: string;
          comunidad: string;
          unidad: string;
          solicitante: string;
          asignado_a: string;
          fecha_creacion: string;
          fecha_actualizacion: string;
          fecha_vencimiento: string;
          fecha_cierre: string;
          dias_vencimiento: number | null;
          nivel_urgencia: string;
          dias_abiertos: number;
        }) => ({
          id: ticket.id,
          numero: ticket.numero,
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          estado: ticket.estado as
            | 'abierto'
            | 'en_progreso'
            | 'resuelto'
            | 'cerrado',
          prioridad: ticket.prioridad as 'alta' | 'media' | 'baja',
          categoria: ticket.categoria,
          comunidad: ticket.comunidad,
          unidad: ticket.unidad,
          solicitante: ticket.solicitante,
          asignado_a: ticket.asignado_a,
          fecha_creacion: ticket.fecha_creacion,
          fecha_actualizacion: ticket.fecha_actualizacion,
          fecha_vencimiento: ticket.fecha_vencimiento,
          fecha_cierre: ticket.fecha_cierre,
          dias_vencimiento: ticket.dias_vencimiento,
          nivel_urgencia: ticket.nivel_urgencia as
            | 'finalizado'
            | 'vencido'
            | 'critico'
            | 'urgente'
            | 'normal',
          dias_abiertos: ticket.dias_abiertos,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Tickets por asignado con estadísticas
  getPorAsignadoEstadisticas: async (): Promise<TicketPorAsignado[]> => {
    try {
      const data = await apiRequest('/tickets/por-asignado/estadisticas');
      return data.map(
        (stat: {
          asignado_id: number;
          asignado_nombre: string;
          asignado_email: string;
          total_tickets: number;
          abiertos: number;
          en_progreso: number;
          resueltos: number;
          cerrados: number;
          tiempo_promedio_resolucion: number;
          ultimo_ticket: string;
        }) => ({
          asignado_id: stat.asignado_id,
          asignado_nombre: stat.asignado_nombre,
          asignado_email: stat.asignado_email,
          total_tickets: stat.total_tickets,
          abiertos: stat.abiertos,
          en_progreso: stat.en_progreso,
          resueltos: stat.resueltos,
          cerrados: stat.cerrados,
          tiempo_promedio_resolucion: stat.tiempo_promedio_resolucion,
          ultimo_ticket: stat.ultimo_ticket,
        }),
      );
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 5. EXPORTACIÓN
  // =========================================

  // Exportación completa
  exportCompleto: async (): Promise<Blob> => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      if (!token) {
        throw new Error('Missing token');
      }

      const response = await fetch(`${API_BASE_URL}/tickets/export/completo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Exportación de tickets abiertos
  exportAbiertos: async (): Promise<Blob> => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      if (!token) {
        throw new Error('Missing token');
      }

      const response = await fetch(`${API_BASE_URL}/tickets/export/abiertos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Exportación de estadísticas de resolución
  exportEstadisticasResolucion: async (): Promise<Blob> => {
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      if (!token) {
        throw new Error('Missing token');
      }

      const response = await fetch(
        `${API_BASE_URL}/tickets/export/estadisticas-resolucion`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 6. VALIDACIONES
  // =========================================

  // Validar integridad de tickets
  validarIntegridad: async (): Promise<ValidacionIntegridad> => {
    try {
      const data = await apiRequest('/tickets/validacion/integridad');
      return {
        total_tickets: data.total_tickets,
        tickets_validos: data.tickets_validos,
        tickets_invalidos: data.tickets_invalidos,
        errores: data.errores,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // =========================================
  // 7. CRUD BÁSICO
  // =========================================

  // Crear nuevo ticket
  create: async (
    comunidadId: number,
    ticketData: TicketFormData,
  ): Promise<Ticket> => {
    try {
      const data = await apiRequest(`/tickets/comunidad/${comunidadId}`, {
        method: 'POST',
        body: JSON.stringify(ticketData),
      });

      return {
        id: data.id,
        numero: data.numero,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: data.estado,
        prioridad: data.prioridad,
        categoria: data.categoria,
        comunidad: data.comunidad,
        unidad: data.unidad,
        solicitante: data.solicitante,
        asignado_a: data.asignado_a,
        fecha_creacion: data.fecha_creacion,
        fecha_actualizacion: data.fecha_actualizacion,
        fecha_vencimiento: data.fecha_vencimiento,
        fecha_cierre: data.fecha_cierre,
        dias_vencimiento: data.dias_vencimiento,
        nivel_urgencia: data.nivel_urgencia,
        dias_abiertos: data.dias_abiertos,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Actualizar ticket
  update: async (id: number, updateData: TicketUpdateData): Promise<Ticket> => {
    try {
      const data = await apiRequest(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });

      return {
        id: data.id,
        numero: data.numero,
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: data.estado,
        prioridad: data.prioridad,
        categoria: data.categoria,
        comunidad: data.comunidad,
        unidad: data.unidad,
        solicitante: data.solicitante,
        asignado_a: data.asignado_a,
        fecha_creacion: data.fecha_creacion,
        fecha_actualizacion: data.fecha_actualizacion,
        fecha_vencimiento: data.fecha_vencimiento,
        fecha_cierre: data.fecha_cierre,
        dias_vencimiento: data.dias_vencimiento,
        nivel_urgencia: data.nivel_urgencia,
        dias_abiertos: data.dias_abiertos,
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Eliminar ticket
  delete: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await apiRequest(`/tickets/${id}`, {
        method: 'DELETE',
      });
      return { success: true, message: 'Ticket eliminado exitosamente' };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

