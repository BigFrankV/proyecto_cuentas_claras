// Tipos para emisiones del backend
export interface EmisionBackend {
  id: number;
  comunidad_id: number;
  periodo: string; // YYYY-MM
  fecha_emision?: string;
  fecha_vencimiento: string;
  estado: 'borrador' | 'emitida' | 'cerrada';
  monto_total?: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DetalleEmisionBackend {
  id: number;
  emision_id?: number;
  categoria_id?: number;
  monto?: number;
  regla_prorrateo?: string;
  descripcion?: string;
  categoria_nombre?: string;
  // Campos del endpoint /detalles (que mapea a frontend)
  name?: string;
  description?: string;
  amount?: number;
  distributionType?: 'proportional' | 'equal' | 'custom';
  category?: string;
  created_at?: string;
}

export interface EmisionCompletaBackend extends EmisionBackend {
  detalles?: DetalleEmisionBackend[];
  total_gastos?: number;
  total_pagos?: number;
  unidades_count?: number;
}

export interface UnidadProrrateoBackend {
  unidad_id: number;
  numero_unidad: string;
  monto_asignado: number;
  monto_pagado: number;
  estado_pago: string;
  propietario?: string;
  participacion?: number;
}

export interface GastoEmisionBackend {
  id: number;
  descripcion: string;
  monto: number;
  categoria: string;
  proveedor?: string;
  fecha: string;
}

export interface PagoEmisionBackend {
  id: number;
  fecha_pago: string;
  monto: number;
  metodo_pago: string;
  referencia?: string;
  unidad_numero: string;
  estado: string;
}

// Tipos para el frontend
export type EmisionEstado = 'draft' | 'ready' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type EmisionTipo = 'gastos_comunes' | 'extraordinaria' | 'multa' | 'interes';

export interface Emision {
  id: string;
  period: string;
  type: EmisionTipo;
  status: EmisionEstado;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  unitCount: number;
  description: string;
  communityName: string;
}

export interface EmisionDetalle extends Emision {
  hasInterest: boolean;
  interestRate: number;
  gracePeriod: number;
}

// Mapeos entre backend y frontend
export function mapEstadoBackendToFrontend(estado: string): EmisionEstado {
  const estadoMap: Record<string, EmisionEstado> = {
    'borrador': 'draft',
    'emitida': 'sent',
    'cerrada': 'paid',
  };
  return estadoMap[estado] || 'draft';
}

export function mapEstadoFrontendToBackend(status: EmisionEstado): string {
  const statusMap: Record<EmisionEstado, string> = {
    'draft': 'borrador',
    'ready': 'borrador',
    'sent': 'emitida',
    'paid': 'cerrada',
    'partial': 'emitida',
    'overdue': 'emitida',
    'cancelled': 'borrador',
  };
  return statusMap[status] || 'borrador';
}

export function transformEmisionBackendToFrontend(
  emision: EmisionBackend,
  communityName = 'Mi Comunidad',
): Emision {
  return {
    id: emision.id.toString(),
    period: emision.periodo,
    type: 'gastos_comunes',
    status: mapEstadoBackendToFrontend(emision.estado),
    issueDate: emision.fecha_emision || emision.created_at || '',
    dueDate: emision.fecha_vencimiento,
    totalAmount: emision.monto_total || 0,
    paidAmount: 0,
    unitCount: 0,
    description: emision.observaciones || '',
    communityName,
  };
}

export function transformEmisionCompletaToDetalle(
  emision: EmisionCompletaBackend,
  communityName = 'Mi Comunidad',
): EmisionDetalle {
  return {
    id: emision.id.toString(),
    period: emision.periodo,
    type: 'gastos_comunes',
    status: mapEstadoBackendToFrontend(emision.estado),
    issueDate: emision.fecha_emision || emision.created_at || '',
    dueDate: emision.fecha_vencimiento,
    totalAmount: emision.monto_total || 0,
    paidAmount: emision.total_pagos || 0,
    unitCount: emision.unidades_count || 0,
    description: emision.observaciones || '',
    communityName,
    hasInterest: false,
    interestRate: 0,
    gracePeriod: 0,
  };
}
