// Tipos para el sistema de edificios

export interface Edificio {
  id: string;
  nombre: string;
  codigo?: string;
  direccion: string;
  comunidadId: string;
  comunidadNombre?: string;
  estado: 'activo' | 'inactivo' | 'construccion' | 'mantenimiento';
  tipo: 'residencial' | 'comercial' | 'mixto' | 'oficinas';
  fechaCreacion: string;
  fechaActualizacion?: string;
  
  // Información de construcción
  anoConstructccion?: number;
  numeroTorres: number;
  totalUnidades: number;
  totalUnidadesOcupadas: number;
  pisos: number;
  
  // Información de contacto
  administrador?: string;
  telefonoAdministrador?: string;
  emailAdministrador?: string;
  
  // Servicios y amenidades
  servicios?: string[];
  amenidades?: string[];
  
  // Ubicación
  latitud?: number;
  longitud?: number;
  
  // Imagen
  imagen?: string;
  
  // Observaciones
  observaciones?: string;
  
  // Información adicional
  areaComun?: number;
  areaPrivada?: number;
  parqueaderos?: number;
  depositos?: number;
}

export interface Torre {
  id: string;
  edificioId: string;
  nombre: string;
  codigo?: string;
  pisos: number;
  unidadesPorPiso: number;
  totalUnidades: number;
  unidadesOcupadas: number;
  estado: 'activa' | 'inactiva' | 'mantenimiento';
  fechaCreacion: string;
  observaciones?: string;
}

export interface Unidad {
  id: string;
  edificioId: string;
  torreId?: string;
  numero: string;
  piso: number;
  tipo: 'apartamento' | 'casa' | 'local' | 'oficina' | 'deposito' | 'parqueadero';
  estado: 'ocupada' | 'vacia' | 'mantenimiento' | 'vendida' | 'alquilada';
  area: number;
  habitaciones?: number;
  banos?: number;
  balcon?: boolean;
  parqueadero?: boolean;
  deposito?: boolean;
  propietarioId?: string;
  propietarioNombre?: string;
  inquilinoId?: string;
  inquilinoNombre?: string;
  valorArriendo?: number;
  valorAdministracion?: number;
  fechaCreacion: string;
  observaciones?: string;
}

// Formularios
export interface EdificioFormData {
  nombre: string;
  codigo?: string;
  direccion: string;
  comunidadId: string;
  tipo: 'residencial' | 'comercial' | 'mixto' | 'oficinas';
  anoConstructccion?: number;
  numeroTorres: number;
  pisos: number;
  administrador?: string;
  telefonoAdministrador?: string;
  emailAdministrador?: string;
  servicios?: string[];
  amenidades?: string[];
  latitud?: number;
  longitud?: number;
  imagen?: File | string;
  observaciones?: string;
  areaComun?: number;
  areaPrivada?: number;
  parqueaderos?: number;
  depositos?: number;
}

export interface TorreFormData {
  nombre: string;
  codigo?: string;
  pisos: number;
  unidadesPorPiso: number;
  observaciones?: string;
}

export interface UnidadFormData {
  numero: string;
  piso: number;
  torreId?: string;
  tipo: 'apartamento' | 'casa' | 'local' | 'oficina' | 'deposito' | 'parqueadero';
  area: number;
  habitaciones?: number;
  banos?: number;
  balcon?: boolean;
  parqueadero?: boolean;
  deposito?: boolean;
  propietarioId?: string;
  inquilinoId?: string;
  valorArriendo?: number;
  valorAdministracion?: number;
  observaciones?: string;
}

// Filtros y búsqueda
export interface EdificioFilters {
  busqueda?: string;
  comunidadId?: string;
  estado?: string;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface EdificioStats {
  totalEdificios: number;
  edificiosActivos: number;
  totalUnidades: number;
  unidadesOcupadas: number;
  ocupacion: number;
}

// Vista y configuración
export type VistaListado = 'tabla' | 'tarjetas';

export interface EdificioListConfig {
  vista: VistaListado;
  itemsPorPagina: number;
  ordenPor: keyof Edificio;
  orden: 'asc' | 'desc';
}

// Opciones para dropdowns
export interface OpcionSelect {
  value: string;
  label: string;
}

export const ESTADOS_EDIFICIO: OpcionSelect[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'construccion', label: 'En Construcción' },
  { value: 'mantenimiento', label: 'En Mantenimiento' }
];

export const TIPOS_EDIFICIO: OpcionSelect[] = [
  { value: 'residencial', label: 'Residencial' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'oficinas', label: 'Oficinas' }
];

export const SERVICIOS_DISPONIBLES: OpcionSelect[] = [
  { value: 'agua', label: 'Agua' },
  { value: 'luz', label: 'Electricidad' },
  { value: 'gas', label: 'Gas Natural' },
  { value: 'internet', label: 'Internet' },
  { value: 'cable', label: 'TV Cable' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'vigilancia', label: 'Vigilancia' },
  { value: 'aseo', label: 'Aseo' }
];

export const AMENIDADES_DISPONIBLES: OpcionSelect[] = [
  { value: 'piscina', label: 'Piscina' },
  { value: 'gimnasio', label: 'Gimnasio' },
  { value: 'salon_comunal', label: 'Salón Comunal' },
  { value: 'parque_infantil', label: 'Parque Infantil' },
  { value: 'cancha_deportiva', label: 'Cancha Deportiva' },
  { value: 'bbq', label: 'Zona BBQ' },
  { value: 'porteria', label: 'Portería' },
  { value: 'ascensor', label: 'Ascensor' },
  { value: 'citofono', label: 'Citófono' },
  { value: 'lavanderia', label: 'Lavandería' }
];