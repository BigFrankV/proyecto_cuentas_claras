// Tipos para el módulo de Conciliaciones Bancarias

export interface Conciliacion {
  id: number;
  code: string;
  movementDate: string;
  glosa: string;
  amount: number;
  movementType: string;
  bankReference: string;
  reconciliationStatus: 'pendiente' | 'reconciliado' | 'descartado';
  paymentId?: number;
  paymentCode?: string;
  paymentReference?: string;
  communityName: string;
  created_at: string;
  updated_at: string;
}

export interface ConciliacionDetalle {
  id: number;
  code: string;
  movementDate: string;
  glosa: string;
  amount: number;
  movementType: string;
  bankReference: string;
  reconciliationStatus: 'pendiente' | 'reconciliado' | 'descartado';
  paymentId?: number;
  paymentCode?: string;
  paymentReference?: string;
  communityName: string;
  comunidad_id: number;
  estado: 'pendiente' | 'conciliado' | 'descartado';
  fecha_mov: string;
  monto: number;
  referencia: string;
  pago_id?: number;
  created_at: string;
  updated_at: string;
  // Información adicional del pago si existe
  pago?: {
    id: number;
    referencia: string;
    medio: string;
    fecha: string;
    monto: number;
    estado: string;
  };
}

export interface ConciliacionFormData {
  fecha_mov: string;
  monto: number;
  glosa?: string;
  referencia?: string;
  pago_id?: number;
}

export interface ConciliacionFiltros {
  comunidad_id?: number;
  estado?: 'pendiente' | 'conciliado' | 'descartado';
  fecha_inicio?: string;
  fecha_fin?: string;
  limit?: number;
  offset?: number;
}

export interface EstadisticasConciliaciones {
  total: number;
  conciliadas: number;
  pendientes: number;
  descartadas: number;
  totalMonto: number;
  montoConciliado: number;
  montoPendiente: number;
}

export interface ConciliacionPendiente {
  id: number;
  fecha_mov: string;
  glosa: string;
  monto: number;
  referencia: string;
  diasPendiente: number;
}

export interface ConciliacionPorEstado {
  estado: 'pendiente' | 'conciliado' | 'descartado';
  cantidad: number;
  porcentaje: number;
  monto: number;
}

export interface ConciliacionPorTipo {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  monto: number;
}

export interface MovimientoConDiferencias {
  id: number;
  fecha_mov: string;
  glosa: string;
  montoBanco: number;
  montoPago?: number;
  diferencia: number;
  referencia: string;
  pagoReferencia?: string;
}

export interface MovimientoSinPago {
  id: number;
  fecha_mov: string;
  glosa: string;
  monto: number;
  referencia: string;
  diasSinPago: number;
}

export interface HistorialPeriodo {
  periodo: string; // YYYY-MM
  total: number;
  conciliadas: number;
  pendientes: number;
  precision: number; // porcentaje
}

export interface SaldosComparacion {
  periodo: string;
  saldoBanco: number;
  saldoContable: number;
  diferencia: number;
  fechaCalculo: string;
}

export interface AnalisisPrecision {
  periodo: string;
  totalMovimientos: number;
  movimientosConciliados: number;
  precision: number;
  tiempoPromedioConciliacion: number; // días
}

export interface ResumenConciliacion {
  comunidad_id: number;
  comunidad_nombre: string;
  periodo_actual: string;
  estadisticas: EstadisticasConciliaciones;
  pendientes: ConciliacionPendiente[];
  precision_historica: number;
  ultimo_conciliacion: string;
}

export interface ValidacionConciliacion {
  valido: boolean;
  errores: string[];
  warnings: string[];
  estadisticas: {
    total: number;
    conDatosCompletos: number;
    sinReferencia: number;
    sinMonto: number;
  };
}