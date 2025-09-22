export interface Multa {
  id: number;
  numero: string;
  tipo_infraccion: string;
  descripcion: string;
  monto: number;
  fecha_infraccion: string;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'apelada' | 'anulada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  
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
  
  // Evidencia y documentos
  evidencia_urls?: string[];
  documento_notificacion_url?: string;
  
  // Pagos
  monto_pagado?: number;
  fecha_pago?: string;
  metodo_pago?: string;
  referencia_pago?: string;
  
  // Apelación
  fecha_apelacion?: string;
  motivo_apelacion?: string;
  estado_apelacion?: 'pendiente' | 'aprobada' | 'rechazada';
  respuesta_apelacion?: string;
  
  // Notificaciones
  notificado_email: boolean;
  notificado_sms: boolean;
  fecha_ultima_notificacion?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TipoInfraccion {
  id: number;
  nombre: string;
  descripcion: string;
  monto_base: number;
  categoria: string;
  activo: boolean;
  created_at: string;
}

export interface MultaFiltros {
  search?: string;
  comunidad_id?: number;
  unidad_id?: number;
  torre_id?: number;
  edificio_id?: number;
  estado?: Multa['estado'];
  prioridad?: Multa['prioridad'];
  tipo_infraccion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  propietario_id?: number;
  created_by_user_id?: number;
  assigned_to_user_id?: number;
  vencidas?: boolean;
  sin_notificar?: boolean;
}

export interface CreateMultaData {
  tipo_infraccion: string;
  descripcion: string;
  monto: number;
  fecha_infraccion: string;
  fecha_vencimiento: string;
  prioridad: Multa['prioridad'];
  unidad_id: number;
  evidencia_urls?: string[];
  notificar_email?: boolean;
  notificar_sms?: boolean;
  observaciones?: string;
}

export interface UpdateMultaData extends Partial<CreateMultaData> {
  estado?: Multa['estado'];
  assigned_to_user_id?: number;
  monto_pagado?: number;
  fecha_pago?: string;
  metodo_pago?: string;
  referencia_pago?: string;
  motivo_apelacion?: string;
  estado_apelacion?: Multa['estado_apelacion'];
  respuesta_apelacion?: string;
}

export interface MultasEstadisticas {
  total: number;
  pendientes: number;
  pagadas: number;
  vencidas: number;
  apeladas: number;
  anuladas: number;
  monto_total: number;
  monto_pendiente: number;
  monto_recaudado: number;
  monto_vencido: number;
}

export interface MultasResumen {
  estadisticas: MultasEstadisticas;
  multas_recientes: Multa[];
  infracciones_frecuentes: {
    tipo: string;
    cantidad: number;
    monto_total: number;
  }[];
  unidades_con_mas_multas: {
    unidad_numero: string;
    unidad_id: number;
    comunidad_nombre: string;
    total_multas: number;
    monto_total: number;
  }[];
}

export interface MultaActividad {
  id: number;
  multa_id: number;
  tipo: 'creada' | 'modificada' | 'pagada' | 'apelada' | 'anulada' | 'notificada';
  descripcion: string;
  usuario_id: number;
  usuario_nombre: string;
  fecha: string;
  datos_adicionales?: any;
}

// Para el wizard de crear multa
export interface MultaWizardStep {
  numero: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  activo: boolean;
}

export interface MultaFormData {
  // Step 1: Selección de unidad
  comunidad_id?: number;
  edificio_id?: number;
  torre_id?: number;
  unidad_id?: number;
  
  // Step 2: Tipo de infracción
  tipo_infraccion_id?: number;
  tipo_infraccion?: string;
  monto?: number;
  
  // Step 3: Detalles
  descripcion?: string;
  fecha_infraccion?: string;
  fecha_vencimiento?: string;
  prioridad?: Multa['prioridad'];
  evidencia_files?: File[];
  evidencia_urls?: string[];
  
  // Step 4: Notificaciones y configuración
  notificar_email?: boolean;
  notificar_sms?: boolean;
  observaciones?: string;
  asignar_a_usuario_id?: number;
}