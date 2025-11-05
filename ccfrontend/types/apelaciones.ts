export interface Apelacion {
  id: number;
  multa_id: number;
  usuario_id: number;
  persona_id?: number;
  comunidad_id?: number;
  motivo: string;
  documentos_json?: any;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | string;
  resolucion?: string;
  resuelto_por?: number;
  fecha_apelacion?: string;
  fecha_resolucion?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
