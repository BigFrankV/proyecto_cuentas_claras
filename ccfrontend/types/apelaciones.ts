// =========================================
// TIPOS PARA APELACIONES
// =========================================

export type EstadoApelacion = 'pendiente' | 'aprobada' | 'rechazada';

export const ESTADOS_APELACION = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  aprobada: { label: 'Aprobada', color: 'success' },
  rechazada: { label: 'Rechazada', color: 'danger' },
} as const;

export interface Apelacion {
  id: number;
  multa_id: number;
  usuario_id: number;
  persona_id?: number;
  comunidad_id?: number;
  motivo: string;
  documentos_json?: any;
  estado: EstadoApelacion | string;
  resolucion?: string;
  resuelto_por?: number;
  fecha_apelacion?: string;
  fecha_resolucion?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
