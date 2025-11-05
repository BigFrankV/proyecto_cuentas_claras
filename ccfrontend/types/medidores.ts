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
}

export interface MedidoresListResponse {
  data: Medidor[];
  pagination?: { total: number; limit: number; offset: number; pages: number };
}
