// =========================================
// TIPOS PARA MEDIDORES
// =========================================

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MedidorLocation {
  building?: string;
  floor?: string | null;
  unit?: string;
  position?: string | null;
  coordinates?: string | null;
}

export interface MedidorCommunity {
  id?: number;
  name?: string;
  address?: string | null;
}

export interface MedidorLastReading {
  value?: number;
  date?: string | null;
  consumption?: number | null;
  period?: string | null;
}

export interface Reading {
  id: number;
  fecha: string;
  lectura: number;
  periodo: string;
  reader_id?: number | null;
  method?: string | null;
  notes?: string | null;
  photo_url?: string | null;
  status?: string;
}

export interface Medidor {
  id: number;
  comunidad_id?: number | null;
  comunidad_nombre?: string | null;
  unidad_id?: number | null;
  unidad_codigo?: string | null;
  tipo?: 'agua' | 'gas' | 'electricidad' | string;
  medidor_codigo?: string | null; // medidor.codigo en la vista
  serial_number?: string | null;
  numero_serie?: string | null; // Alias para serial_number
  es_compartido?: 0 | 1 | boolean;
  marca?: string | null;
  modelo?: string | null;
  estado?: string | null;
  ubicacion?: any | null;
  activo?: 0 | 1;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  ultima_lectura?: number | null;
  fecha_ultima_lectura?: string | null;
  total_lecturas?: number | null;
  lecturas_recientes?: Reading[];
  
  // Ubicación detallada
  edificio?: string | null;
  unidad?: string | null;
  piso?: string | number | null;
  posicion?: string | null;
  
  // Alertas y mantenimiento
  alertas?: any[] | null;
  ultimo_consumo?: number | null;
  proximo_mantenimiento?: string | null;
  frecuencia_mantenimiento?: string | null;
  
  // Instalación
  fecha_instalacion?: string | null;
  tecnico_instalador?: string | null;
  empresa_instaladora?: string | null;
  
  // Servicio
  ultimo_servicio?: string | null;
  proximo_servicio?: string | null;
  empresa_servicio?: string | null;
  notas_servicio?: string | null;
  
  // Especificaciones técnicas
  capacidad?: string | number | null;
  precision?: string | null;
  certificacion?: string | null;
  temperatura_operacion?: string | null;
  tipo_comunicacion?: string | null;
  
  // Documentación
  certificado_instalacion?: string | null;
  garantia_hasta?: string | null;
  fecha_creacion?: string | null;
  ultima_actualizacion?: string | null;
}

export interface MedidoresListResponse {
  data: Medidor[];
  pagination?: { total: number; limit: number; offset: number; pages: number };
}
