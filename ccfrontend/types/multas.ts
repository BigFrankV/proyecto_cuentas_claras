// =========================================
// TIPOS PARA MULTAS
// =========================================

/* eslint-disable max-len */

export type EstadoMulta = 'pendiente' | 'pagado' | 'vencido' | 'apelada' | 'anulada';

export type PrioridadMulta = 'baja' | 'media' | 'alta' | 'critica';

export const ESTADOS_MULTA = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  pagado: { label: 'Pagado', color: 'success' },
  vencido: { label: 'Vencido', color: 'danger' },
  apelada: { label: 'Apelada', color: 'info' },
  anulada: { label: 'Anulada', color: 'secondary' },
} as const;

export const PRIORIDADES_MULTA = {
  baja: { label: 'Baja', color: 'secondary' },
  media: { label: 'Media', color: 'warning' },
  alta: { label: 'Alta', color: 'danger' },
  critica: { label: 'Crítica', color: 'danger' },
} as const;

/* eslint-disable max-len */
export interface Multa {
  id: number;
  numero: string;
  tipo_infraccion: string;
  descripcion: string;
  monto: number;
  fecha_infraccion: string;
  fecha_vencimiento: string;
  estado: EstadoMulta;
  prioridad: PrioridadMulta;

  // Relaciones
  unidad_id: number;
  unidad_numero?: string;
  torre_id?: number;
  torre_nombre?: string;
  edificio_id?: number;
  edificio_nombre?: string;
  comunidad_id: number;
  comunidad_nombre?: string;

  // Propietario
  propietario_id?: number;
  propietario_nombre?: string;
  propietario_email?: string;
  propietario_telefono?: string;

  // Gestión
  created_by_user_id: number;
  created_by_username?: string;
  assigned_to_user_id?: number;
  assigned_to_username?: string;

  // Pagos
  monto_pagado?: number;
  fecha_pago?: string;
  metodo_pago?: string;
  referencia_pago?: string;

  // Notificaciones
  notificado_email: boolean;
  notificado_sms: boolean;
  fecha_ultima_notificacion?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ✅ AGREGAR: Interface que falta para el wizard
export interface TipoInfraccion {
  id: string;
  nombre: string;
  monto_base: number;
  categoria: string;
}

// ✅ MANTENER: Para compatibilidad
export interface OpcionInfraccion extends TipoInfraccion {
  // Mantener compatibilidad
}

export interface MultaFiltros {
  search?: string;
  comunidad_id?: number;
  unidad_id?: number;
  estado?: Multa['estado'];
  prioridad?: Multa['prioridad'];
  tipo_infraccion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
}

export interface CreateMultaData {
  tipo_infraccion: string;
  descripcion: string;
  monto: number;
  fecha_infraccion: string;
  fecha_vencimiento: string;
  prioridad: Multa['prioridad'];
  unidad_id: number;
  observaciones?: string;
  notificar_email?: boolean;
  notificar_sms?: boolean;
}

export interface UpdateMultaData extends Partial<CreateMultaData> {
  estado?: Multa['estado'];
  monto_pagado?: number;
  fecha_pago?: string;
  metodo_pago?: string;
  referencia_pago?: string;
}

export interface MultasEstadisticas {
  total: number;
  pendientes: number;
  pagadas: number; // ✅ Mantener nombre genérico en stats
  vencidas: number; // ✅ Mantener nombre genérico en stats
  apeladas: number;
  anuladas: number;
  monto_total: number;
  monto_pendiente: number;
  monto_recaudado: number;
  monto_vencido: number;
}

export interface MultaFormData {
  // Step 1: Selección de unidad
  comunidad_id?: number;
  edificio_id?: number;
  torre_id?: number;
  unidad_id?: number;

  // Step 2: Tipo de infracción
  tipo_infraccion?: string;
  monto?: number;
  prioridad?: Multa['prioridad'];

  // Step 3: Detalles
  descripcion?: string;
  fecha_infraccion?: string;
  fecha_vencimiento?: string;

  // Step 4: Configuración
  observaciones?: string;
  notificar_email?: boolean;
  notificar_sms?: boolean;
  asignar_a_usuario_id?: number;
}

export interface MultaWizardStep {
  numero: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  activo: boolean;
}

export interface MultaActividad {
  id: number;
  multa_id: number;
  tipo: 'creada' | 'modificada' | 'pagada' | 'apelada' | 'anulada';
  descripcion: string;
  usuario_id: number;
  usuario_nombre: string;
  fecha: string;
}

export interface MultasResumen {
  estadisticas: MultasEstadisticas;
  multas_recientes: Multa[];
}
