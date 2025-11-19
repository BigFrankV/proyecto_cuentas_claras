// =========================================
// TIPOS PARA CARGOS (CUENTAS DE COBRO)
// =========================================

export type EstadoCargo = 'pendiente' | 'pagado' | 'vencido' | 'parcial';

export const ESTADOS_CARGO = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  pagado: { label: 'Pagado', color: 'success' },
  vencido: { label: 'Vencido', color: 'danger' },
  parcial: { label: 'Parcial', color: 'info' },
} as const;

export type EstadoPago = 'completed' | 'pending' | 'failed';

export const ESTADOS_PAGO = {
  completed: { label: 'Completado', color: 'success' },
  pending: { label: 'Pendiente', color: 'warning' },
  failed: { label: 'Fallido', color: 'danger' },
} as const;

export interface Cargo {
  id: number;
  concepto: string;
  descripcion?: string;
  tipo: string;
  estado: EstadoCargo;
  monto: number;
  fechaVencimiento: Date;
  unidad: string;
  nombreComunidad?: string;
  periodo?: string;
  propietario?: string;
  saldo: number;
  interesAcumulado: number;
  fechaCreacion: Date;
  emailPropietario?: string;
  telefonoPropietario?: string;
}

export interface CargoFormData {
  concepto: string;
  tipo: string;
  monto: number;
  fecha_vencimiento: string;
  unidad: string;
  descripcion?: string;
  periodo?: string;
}

export interface CargoFilters {
  comunidadId?: number;
  unidadId?: number;
  estado?: EstadoCargo;
  periodo?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CargoStats {
  total_cargos: number;
  total_monto: number;
  total_saldo: number;
  total_interes: number;
  cargos_pagados: number;
  cargos_pendientes: number;
}

export interface PaymentRecord {
  id: string;
  fecha: Date;
  monto: number;
  metodo: string;
  referencia: string;
  estado: EstadoPago;
  observaciones?: string;
}

export interface Document {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  fechaSubida: Date;
  url: string;
}

export interface TimelineItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  content: string;
  date: Date;
  user: string;
}

export interface CargoDetalle extends Cargo {
  pagos?: PaymentRecord[];
  documentos?: Document[];
  historial?: TimelineItem[];
}
