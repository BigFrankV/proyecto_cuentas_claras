// Tipos para el módulo de Cargos (Cuentas de Cobro)

export interface Cargo {
  id: number;
  concepto: string;
  descripcion?: string;
  tipo: 'Administración' | 'extraordinaria' | 'multa' | 'interes' | 'Mantenimiento' | 'Servicio' | 'Seguro' | 'Otro';
  estado: 'pendiente' | 'pagado' | 'vencido' | 'parcial';
  monto: number;
  montoAplicado?: number;
  unidad: string;
  periodo?: string;
  fechaVencimiento: Date;
  fechaCreacion: Date;
  cuentaCosto?: string;
  observaciones?: string;
  nombreComunidad?: string;
  propietario?: string;
  emailPropietario?: string;
  telefonoPropietario?: string;
  saldo: number;
  interesAcumulado: number;
}

export interface CargoFormData {
  concept: string;
  type: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  unit: string;
  description?: string;
}

export interface CargoFilters {
  comunidadId?: number;
  estado?: 'pendiente' | 'pagado' | 'vencido' | 'parcial';
  unidad?: number;
  periodo?: string;
  page?: number;
  limit?: number;
}

export interface PaymentRecord {
  id: string;
  fecha: Date;
  monto: number;
  metodo: string;
  referencia: string;
  estado: 'completed' | 'pending' | 'failed';
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