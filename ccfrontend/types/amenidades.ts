// =========================================
// TIPOS PARA AMENIDADES
// =========================================

export interface Amenidad {
  id: number;
  nombre: string;
  comunidad_id: number;
  comunidad?: string;
  reglas?: string;
  capacidad?: number;
  requiere_aprobacion: boolean;
  tarifa?: number;
  created_at: string;
  updated_at: string;
  estadisticas_uso?: {
    reservas_mes_actual: number;
    reservas_mes_anterior: number;
    ingresos_mes_actual: number;
  };
}

export interface AmenidadFormData {
  comunidad_id: number;
  nombre: string;
  reglas?: string;
  capacidad?: number;
  requiere_aprobacion: boolean;
  tarifa?: number;
}

export interface AmenidadFilters {
  busqueda?: string;
  comunidad_id?: number;
  requiere_aprobacion?: boolean;
  capacidad_min?: number;
  capacidad_max?: number;
  tarifa_min?: number;
  tarifa_max?: number;
  limit?: number;
  offset?: number;
}

// =========================================
// TIPOS PARA RESERVAS DE AMENIDADES
// =========================================

export type EstadoReserva = 'solicitada' | 'aprobada' | 'rechazada' | 'cancelada' | 'cumplida';

export interface ReservaAmenidad {
  id: number;
  amenidad_id: number;
  comunidad_id: number;
  unidad_id: number;
  persona_id: number;
  inicio: string;
  fin: string;
  estado: EstadoReserva;
  proposito?: string;
  numero_personas?: number;
  notas_admin?: string;
  created_at: string;
  updated_at: string;
  // Información relacionada
  amenidad?: {
    nombre: string;
    capacidad: number;
    tarifa: number;
  };
  unidad?: {
    numero: string;
    torre?: string;
  };
  persona?: {
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface ReservaAmenidadFormData {
  unidad_id: number;
  persona_id: number;
  inicio: string;
  fin: string;
  proposito?: string;
  numero_personas?: number;
}

// =========================================
// TIPOS PARA ESTADÍSTICAS
// =========================================

export interface AmenidadStats {
  total_amenidades: number;
  amenidades_activas: number;
  reservas_mes_actual: number;
  ingresos_mes_actual: number;
  ocupacion_promedio: number;
  amenidades_mas_utilizadas: Array<{
    amenidad: string;
    reservas: number;
    ingresos: number;
  }>;
}

// =========================================
// TIPOS PARA CALENDARIO
// =========================================

export interface EventoCalendario {
  id: string;
  title: string;
  start: string;
  end?: string;
  className: string;
  extendedProps?: {
    reservaId: number;
    amenidadId: number;
    estado: EstadoReserva;
    persona: string;
    unidad: string;
  };
}

// =========================================
// CONSTANTES
// =========================================

export const ESTADOS_RESERVA = {
  solicitada: { label: 'Solicitada', color: 'warning' },
  aprobada: { label: 'Aprobada', color: 'success' },
  rechazada: { label: 'Rechazada', color: 'danger' },
  cancelada: { label: 'Cancelada', color: 'secondary' },
  cumplida: { label: 'Cumplida', color: 'info' },
} as const;

export const TIPOS_AMENIDAD = {
  piscina: { label: 'Piscina', icon: 'pool' },
  gimnasio: { label: 'Gimnasio', icon: 'fitness_center' },
  quincho: { label: 'Quincho', icon: 'outdoor_grill' },
  salon: { label: 'Salón de Eventos', icon: 'event' },
  cancha: { label: 'Cancha', icon: 'sports_soccer' },
  lavanderia: { label: 'Lavandería', icon: 'local_laundry_service' },
  estacionamiento: { label: 'Estacionamiento', icon: 'local_parking' },
  otros: { label: 'Otros', icon: 'category' },
} as const;