// Tipos para el módulo de personas
export interface Persona {
  id: number;
  rut: string;
  dv: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fecha_registro: string;
  ultimo_acceso?: string;
  avatar?: string;
  usuario?: {
    id: number;
    username: string;
    estado: 'Activo' | 'Inactivo';
    nivel_acceso: string;
  };
}

export interface PersonaListado {
  id: number;
  nombre: string;
  dni: string;
  email?: string;
  telefono?: string;
  tipo: 'Administrador' | 'Inquilino' | 'Propietario';
  estado: 'Activo' | 'Inactivo';
  unidades: number;
  fechaRegistro: string;
  avatar?: string;
}

export interface PersonaConUsuario extends Persona {
  usuario: {
    id: number;
    username: string;
    estado: 'Activo' | 'Inactivo';
    nivel_acceso: string;
  };
}

export interface PersonaStats {
  total_personas: number;
  administradores: number;
  inquilinos: number;
  propietarios: number;
  activos: number;
  inactivos: number;
}

export interface UnidadAsociada {
  id: number;
  nombre: string;
  edificio: string;
  torre?: string;
  comunidad: string;
  direccion: string;
  metros_cuadrados: number;
  estado: string;
  saldo_pendiente: number;
  relacion: 'Propietario' | 'Inquilino';
  fecha_asignacion?: string;
  fecha_fin?: string;
  porcentaje?: number;
}

export interface PagoRealizado {
  id: number;
  fecha: string;
  unidad: string;
  periodo: string;
  importe: number;
  metodo: string;
  estado: string;
  referencia?: string;
  comprobante_num?: string;
  comunidad?: string;
}

export interface ActividadAuditoria {
  fecha: string;
  hora: string;
  fecha_completa: string;
  titulo: string;
  descripcion: string;
  ip_address?: string;
  valores_anteriores?: string;
  valores_nuevos?: string;
}

export interface DocumentoAsociado {
  id: number;
  nombre: string;
  tipo: string;
  ruta: string;
  fecha_subida: string;
  tamano: number;
}

export interface NotaAsociada {
  id: number;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  autor: string;
  usuario_id: number;
}

export interface RolComunidad {
  comunidad_id: number;
  comunidad_nombre: string;
  rol: 'Propietario' | 'Inquilino' | 'Administrador';
}

export interface ResumenFinanciero {
  comunidad_id: number;
  comunidad_nombre: string;
  saldo_pendiente: number;
  ultimo_pago?: {
    fecha: string;
    importe: number;
  };
  pagos_pendientes: number;
}

export interface UnidadAutocomplete {
  id: number;
  nombre: string;
  edificio: string;
  comunidad: string;
  disponible: boolean;
}

export interface PersonaFilters {
  rut?: string;
  search?: string;
  tipo?: 'Administrador' | 'Inquilino' | 'Propietario';
  estado?: 'Activo' | 'Inactivo';
  limit?: number;
  offset?: number;
}

export interface ValidacionCampo {
  valido: boolean;
  mensaje?: string;
}
