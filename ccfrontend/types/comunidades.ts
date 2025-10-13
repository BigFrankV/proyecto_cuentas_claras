// Tipos para el módulo de comunidades

export interface Comunidad {
  id: number;
  nombre: string;
  direccion: string;
  tipo: 'Condominio' | 'Edificio' | 'Conjunto Residencial' | 'Otro';
  estado: 'Activa' | 'Inactiva' | 'Suspendida';
  rut?: string;
  dv?: string;
  descripcion?: string;
  administrador: string;
  telefono?: string;
  email?: string;
  imagen?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  
  // Estadísticas
  totalUnidades: number;
  unidadesOcupadas: number;
  totalResidentes: number;
  saldoPendiente: number;
  ingresosMensuales: number;
  gastosMensuales: number;
  morosidad: number;
  
  // Configuración
  configuracionCobranza?: ParametrosCobranza;
}

export interface ComunidadDetalle extends Comunidad {
  descripcion?: string;
  horarioAtencion?: string;
  reglamento?: string;
  amenidades: Amenidad[];
  edificios: Edificio[];
  contactos: ContactoComunidad[];
  documentos: DocumentoComunidad[];
}

export interface Amenidad {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Disponible' | 'Mantenimiento' | 'No disponible';
  horarioInicio?: string;
  horarioFin?: string;
  requiereReserva: boolean;
  costoReserva?: number;
}

export interface Edificio {
  id: number;
  nombre: string;
  pisos: number;
  unidadesPorPiso: number;
  totalUnidades: number;
  estado: 'Activo' | 'Mantenimiento' | 'Inactivo';
}

export interface ContactoComunidad {
  id: number;
  nombre: string;
  cargo: string;
  telefono?: string;
  email?: string;
  esContactoPrincipal: boolean;
}

export interface DocumentoComunidad {
  id: number;
  nombre: string;
  tipo: 'Reglamento' | 'Acta' | 'Contrato' | 'Otro';
  url: string;
  fechaSubida: string;
  tamano: number;
}

export interface ParametrosCobranza {
  id: number;
  comunidadId: number;
  
  // Intereses y mora
  diasGracia: number;
  tasaMora: number; // porcentaje mensual
  calculoInteres: 'diario' | 'mensual';
  interesMaximo: number; // porcentaje máximo mensual
  aplicacionInteres: 'capital' | 'saldo';
  tipoRedondeo: 'normal' | 'arriba' | 'abajo';
  
  // Políticas de pago
  politicaPago: 'antiguos' | 'recientes' | 'especificada';
  ordenAplicacion: 'interes-capital' | 'capital-interes';
  diaEmision: number; // día del mes
  diaVencimiento: number; // día del mes
  
  // Notificaciones
  notificacionesAuto: boolean;
  notificacion3Dias: boolean;
  notificacion1Dia: boolean;
  notificacionVencido: boolean;
  
  // Medios de pago
  pagoTransferencia: boolean;
  pagoWebpay: boolean;
  pagoKhipu: boolean;
  pagoEfectivo: boolean;
  
  // Cuenta bancaria
  cuentaBancaria?: CuentaBancaria;
  
  // Multas predefinidas
  multasPredefinidas: MultaPredefinida[];
  
  // Auditoría
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
  actualizadoPor: string;
}

export interface CuentaBancaria {
  banco: string;
  tipoCuenta: 'corriente' | 'vista' | 'ahorro';
  numeroCuenta: string;
  rutTitular: string;
  emailConfirmacion: string;
}

export interface MultaPredefinida {
  id: number;
  descripcion: string;
  monto: number;
  activa: boolean;
  fechaCreacion: string;
}

export interface HistorialParametros {
  id: number;
  parametrosId: number;
  fechaCambio: string;
  usuario: string;
  accion: string;
  detalles: string;
}

// Formulario para crear/editar comunidad
export interface ComunidadFormData {
  nombre: string;
  rut?: string;
  dv?: string;
  direccion: string;
  tipo: 'Condominio' | 'Edificio' | 'Conjunto Residencial' | 'Otro';
  estado: 'Activa' | 'Inactiva' | 'Suspendida';
  administrador: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  horarioAtencion?: string;
  imagen?: File | string;
  totalUnidades?: number;
  totalEdificios?: number;
  areaComun?: number;
  amenidades?: string[];
}

// Filtros para búsqueda de comunidades
export interface ComunidadFiltros {
  busqueda?: string;
  nombre?: string;
  direccion?: string;
  tipo?: string;
  estado?: string;
  administrador?: string;
  ordenarPor?: 'nombre' | 'fechaCreacion' | 'totalUnidades' | 'morosidad';
  orden?: 'asc' | 'desc';
}

// Interfaces para vistas
export interface VistaConfiguracion {
  tipoVista: 'cards' | 'table';
  itemsPorPagina: number;
  ordenarPor: 'nombre' | 'fechaCreacion' | 'totalUnidades' | 'morosidad';
  direccionOrden: 'asc' | 'desc';
}

// Enums para constantes
export enum EstadoComunidad {
  ACTIVA = 'Activa',
  INACTIVA = 'Inactiva',
  SUSPENDIDA = 'Suspendida'
}

export enum TipoComunidad {
  CONDOMINIO = 'Condominio',
  EDIFICIO = 'Edificio',
  CONJUNTO_RESIDENCIAL = 'Conjunto Residencial',
  OTRO = 'Otro'
}

export enum EstadoAmenidad {
  DISPONIBLE = 'Disponible',
  MANTENIMIENTO = 'Mantenimiento',
  NO_DISPONIBLE = 'No disponible'
}

// Constantes para validaciones
export const VALIDATION_RULES = {
  nombre: {
    min: 3,
    max: 100,
    required: true
  },
  direccion: {
    min: 10,
    max: 200,
    required: true
  },
  telefono: {
    pattern: /^[\+]?[0-9\s\-\(\)]{8,15}$/,
    required: false
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: false
  },
  rut: {
    pattern: /^\d{7,8}$/,
    min: 7,
    max: 8,
    required: false,
    message: 'El RUT debe tener entre 7 y 8 dígitos'
  },
  dv: {
    pattern: /^[0-9kK]$/,
    required: false,
    message: 'El dígito verificador debe ser un número del 0-9 o K'
  },
  tasaMora: {
    min: 0,
    max: 100,
    required: true
  }
} as const;