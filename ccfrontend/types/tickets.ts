/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipos para el módulo de Tickets

export interface Ticket {
  id: number;
  numero: number;
  titulo: string;
  descripcion: string;
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  prioridad: 'alta' | 'media' | 'baja';
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
  nivel_urgencia: 'finalizado' | 'vencido' | 'critico' | 'urgente' | 'normal';
  dias_abiertos: number;
}

export interface TicketDetalle {
  tags: any;
  attachments: any;
  requester: any;
  assignee: any;
  dueDate: any;
  updatedAt(updatedAt: any): import('react').ReactNode;
  createdAt(createdAt: any): import('react').ReactNode;
  timeline: any;
  comments: any;
  id: number;
  numero: number;
  titulo: string;
  descripcion: string;
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  comunidad_id: number;
  comunidad_nombre: string;
  unidad_id: number | null;
  unidad_codigo: string | null;
  solicitante_id: number | null;
  solicitante_nombre: string;
  solicitante_email: string;
  asignado_id: number | null;
  asignado_nombre: string;
  asignado_email: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_vencimiento: string;
  fecha_cierre: string;
  tiempo_resolucion: number | null;
  estado_descripcion: string;
  dias_desde_creacion: number;
  dias_para_resolver: number | null;
  num_comentarios: number;
  num_adjuntos: number;
  num_historial: number;
}

export interface TicketCompleto {
  id: number;
  numero: number;
  titulo: string;
  estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  comunidad: string;
  unidad: string;
  solicitante: string;
  asignado: string;
  fecha_creacion: string;
  fecha_vencimiento: string;
  informacion_completa: {
    ticket: {
      id: number;
      numero: number;
      asunto: string;
      estado: string;
      prioridad: string;
      categoria: string;
    };
    comunidad: {
      id: number;
      razon_social: string;
    };
    unidad: {
      id: number;
      codigo: string;
    } | null;
    solicitante: {
      nombre: string;
      email: string;
    };
    asignado: {
      nombre: string;
      email: string;
    };
    fechas: {
      creacion: string;
      vencimiento: string;
      cierre: string;
    };
  };
}

export interface TicketEstadisticas {
  comunidad: string;
  total_tickets: number;
  abiertos: number;
  en_progreso: number;
  resueltos: number;
  cerrados: number;
  escalados: number;
  tiempo_promedio_resolucion: number | null;
  ultimo_ticket: string | null;
}

export interface TicketProximoVencer {
  id: number;
  numero: number;
  titulo: string;
  comunidad: string;
  unidad: string;
  solicitante: string;
  fecha_vencimiento: string;
  dias_restantes: number;
  urgencia: 'vencido' | 'mañana' | 'próximos_dias';
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
}

export interface EstadisticasGenerales {
  total_tickets: number;
  comunidades_con_tickets: number;
  tickets_abiertos: number;
  tickets_en_progreso: number;
  tickets_resueltos: number;
  tickets_cerrados: number;
  tickets_escalados: number;
  tiempo_promedio_resolucion: number | null;
  primer_ticket: string | null;
  ultimo_ticket: string | null;
}

export interface EstadisticaPorEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
  tiempo_promedio_resolucion: number | null;
  mas_antiguo: string | null;
  mas_reciente: string | null;
}

export interface EstadisticaPorPrioridad {
  prioridad: string;
  cantidad: number;
  porcentaje: number;
  resueltos: number;
  porcentaje_resolucion_prioridad: number;
  tiempo_promedio_resolucion: number | null;
}

export interface EstadisticaPorCategoria {
  categoria: string;
  cantidad: number;
  porcentaje: number;
  resueltos: number;
  porcentaje_resolucion: number;
  tiempo_promedio_resolucion: number | null;
  mas_antiguo: string | null;
  mas_reciente: string | null;
}

export interface EstadisticaMensual {
  anio: number;
  mes: number;
  total_tickets: number;
  abiertos: number;
  en_progreso: number;
  resueltos: number;
  cerrados: number;
  escalados: number;
  porcentaje_resolucion: number;
  tiempo_promedio_resolucion: number | null;
}

export interface TicketFiltros {
  estado?: string;
  prioridad?: string;
  categoria?: string;
  asignado_a?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  ordenar_por?: 'urgencia' | 'fecha';
  limit?: number;
  offset?: number;
}

export interface TicketFormData {
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  unidad_id?: number;
}

export interface TicketUpdateData {
  estado?: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
  prioridad?: 'alta' | 'media' | 'baja';
  categoria?: string;
  asignado_a?: number;
  descripcion?: string;
}

export interface BusquedaAvanzadaFiltros {
  busqueda?: string;
  comunidad_id?: number;
  estado?: string;
  prioridad?: string;
  categoria?: string;
  asignado_a?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  dias_vencimiento?: number;
  limit?: number;
  offset?: number;
}

export interface TicketPorAsignado {
  asignado_id: number;
  asignado_nombre: string;
  asignado_email: string;
  total_tickets: number;
  abiertos: number;
  en_progreso: number;
  resueltos: number;
  cerrados: number;
  tiempo_promedio_resolucion: number | null;
  ultimo_ticket: string | null;
}

export interface ValidacionIntegridad {
  total_tickets: number;
  tickets_validos: number;
  tickets_invalidos: number;
  errores: Array<{
    ticket_id: number;
    tipo_error: string;
    descripcion: string;
  }>;
}

