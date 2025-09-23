export interface Gasto {
  id: number;
  numero: string;
  fecha: string;
  monto: number;
  glosa: string;
  estado: 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'rechazado' | 'pagado' | 'anulado';
  extraordinario: boolean;
  created_at: string;
  updated_at: string;
  observaciones_aprobacion?: string;
  observaciones_rechazo?: string;
  fecha_aprobacion?: string;
  
  // Relaciones
  categoria_id: number;
  categoria_nombre: string;
  categoria_tipo: string;
  centro_costo_id?: number;
  centro_costo_nombre?: string;
  proveedor_id?: number;
  proveedor_nombre?: string;
  documento_compra_id?: number;
  documento_folio?: string;
  documento_tipo?: string;
  
  // Usuarios
  creado_por: number;
  creado_por_nombre: string;
  aprobado_por?: number;
  aprobado_por_nombre?: string;
  
  // Historial
  historial?: GastoHistorial[];
}

export interface GastoHistorial {
  accion: 'creado' | 'modificado' | 'aprobado' | 'rechazado' | 'pagado' | 'anulado';
  observaciones?: string;
  fecha: string;
  usuario_nombre: string;
}

export interface CategoriaGasto {
  id: number;
  nombre: string;
  tipo: 'operacional' | 'extraordinario' | 'fondo_reserva' | 'multas' | 'consumo';
  cta_contable?: string;
  activa: boolean;
  comunidad_id?: number;
  created_at: string;
  updated_at: string;
  
  // Estadísticas
  total_gastos: number;
  monto_total: number;
  monto_anio_actual: number;
  es_global: boolean;
}

export interface GastoEstadisticas {
  resumen: {
    total_gastos: number;
    borradores: number;
    pendientes: number;
    aprobados: number;
    rechazados: number;
    pagados: number;
    anulados: number;
    monto_total: number;
    monto_mes_actual: number;
    monto_anio_actual: number;
    monto_extraordinarios: number;
  };
  por_categoria: {
    categoria: string;
    categoria_tipo: string;
    cantidad: number;
    monto_total: number;
  }[];
  por_mes: {
    mes: string;
    cantidad: number;
    monto_total: number;
  }[];
}

export interface GastoCreateRequest {
  categoria_id: number;
  centro_costo_id?: number;
  proveedor_id?: number;
  documento_compra_id?: number;
  fecha: string;
  monto: number;
  glosa: string;
  extraordinario?: boolean;
}

export interface GastoUpdateRequest {
  categoria_id?: number;
  centro_costo_id?: number;
  proveedor_id?: number;
  documento_compra_id?: number;
  fecha?: string;
  monto?: number;
  glosa?: string;
  extraordinario?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Estados con sus colores y labels para el UI
export const GASTO_ESTADOS = {
  borrador: {
    label: 'Borrador',
    color: 'bg-gray-100 text-gray-800',
    badgeColor: 'secondary'
  },
  pendiente_aprobacion: {
    label: 'Pendiente Aprobación',
    color: 'bg-yellow-100 text-yellow-800',
    badgeColor: 'warning'
  },
  aprobado: {
    label: 'Aprobado',
    color: 'bg-green-100 text-green-800',
    badgeColor: 'success'
  },
  rechazado: {
    label: 'Rechazado',
    color: 'bg-red-100 text-red-800',
    badgeColor: 'danger'
  },
  pagado: {
    label: 'Pagado',
    color: 'bg-blue-100 text-blue-800',
    badgeColor: 'primary'
  },
  anulado: {
    label: 'Anulado',
    color: 'bg-gray-100 text-gray-600',
    badgeColor: 'secondary'
  }
} as const;

// Tipos de categorías
export const CATEGORIA_TIPOS = {
  operacional: {
    label: 'Operacional',
    description: 'Gastos operativos del día a día'
  },
  extraordinario: {
    label: 'Extraordinario',
    description: 'Gastos excepcionales no recurrentes'
  },
  fondo_reserva: {
    label: 'Fondo de Reserva',
    description: 'Gastos cubiertos por el fondo de reserva'
  },
  multas: {
    label: 'Multas',
    description: 'Multas y sanciones'
  },
  consumo: {
    label: 'Consumo',
    description: 'Gastos por consumo de servicios'
  }
} as const;