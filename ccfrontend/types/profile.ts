// ============================================
// ROLES Y MEMBRESÍAS (NUEVAS)
// ============================================

export interface Role {
  id: number;
  nombre: string;
  slug: string;
  comunidad_id: number;
  comunidad_nombre?: string;
  nivel: number;
  es_admin: boolean;
  permisos?: any[];
}

export interface Membership {
  id: number;
  comunidad_id: number;
  comunidad_nombre: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_inicio?: string;
  fecha_fin?: string;
}

// ============================================
// PERSONA (NUEVA)
// ============================================

export interface Persona {
  rut?: string;
  dv?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

// ============================================
// USUARIO BASE (ACTUALIZADA)
// ============================================

export interface User {
  id: number;
  username: string;
  email?: string;
  persona_id?: number;
  
  // Flags de permisos (NUEVOS)
  is_superadmin: boolean;
  is_admin: boolean;
  is_2fa_enabled?: boolean;
  
  // Estado
  activo: number;
  created_at: string;
  
  // Relaciones (NUEVAS)
  persona?: Persona | null;
  roles: Role[];
  memberships: Membership[];
  roles_slug?: string[];
  
  // Campos legacy (mantener compatibilidad)
  firstName?: string;
  lastName?: string;
  phone?: string;
  totp_enabled?: boolean;
  comunidad_id?: number;
  lastConnection?: string;
}

// ============================================
// USUARIO EXTENDIDO (TU CÓDIGO EXISTENTE + MEJORAS)
// ============================================

export interface UserExtended extends User {
  // 2FA fields
  totp_secret?: string;
  
  // Preferencias
  preferences?: UserPreferences;
  
  // Sesiones
  sessions?: SessionInfo[];
  
  // Datos adicionales
  communities?: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  
  // Metadata
  last_login?: string;
  login_count?: number;
}

// ============================================
// PREFERENCIAS (TU CÓDIGO EXISTENTE)
// ============================================

export interface UserPreferences {
  // Notificaciones
  emailNotifications: boolean;
  paymentNotifications: boolean;
  weeklyReports: boolean;
  platformNotifications: boolean;
  platformMessages: boolean;
  platformTasks: boolean;
  marketingEmails: boolean;
  
  // Visualización
  timezone: string;
  dateFormat: string;
  language?: string;
  
  // Nuevas opciones
  theme?: 'light' | 'dark' | 'auto';
  
  // Notificaciones extendidas (compatibilidad con backend)
  notifications?: {
    email_enabled?: boolean;
    payment_notifications?: boolean;
    weekly_summaries?: boolean;
    multas_notifications?: boolean;
    gastos_notifications?: boolean;
  };
  
  // Display extendido (compatibilidad con backend)
  display?: {
    timezone?: string;
    date_format?: string;
    language?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
  
  // Privacidad
  privacy?: {
    profile_visible?: boolean;
    show_email?: boolean;
    show_phone?: boolean;
  };
}

// ============================================
// SESIONES (TU CÓDIGO EXISTENTE)
// ============================================

export interface SessionInfo {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastAccess: string;
  isCurrent: boolean;
  userAgent: string;
  browser?: string;
  os?: string;
}

// ============================================
// FORMULARIOS (TU CÓDIGO EXISTENTE + MEJORAS)
// ============================================

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Nuevos campos opcionales
  username?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  identifier: string; // Username, email, RUT o DNI
  password: string;
}

// ============================================
// 2FA / TOTP (TU CÓDIGO EXISTENTE)
// ============================================

export interface TotpSetupResponse {
  base32: string;
  otpauth: string;
  qr: string; // Data URL del QR code
}

export interface TotpVerificationData {
  code: string;
  base32?: string; // Solo para activación inicial
}

export interface TotpActionResponse {
  success: boolean;
  message: string;
  setupData?: TotpSetupResponse;
}

// ============================================
// AUTH RESPONSES (NUEVAS)
// ============================================

export interface LoginResponse {
  token: string;
  user: User;
  expires_in?: number;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  expires_in?: number;
  
  // Para 2FA
  twoFactorRequired?: boolean;
  tempToken?: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

// ============================================
// CONTEXTO DE AUTENTICACIÓN (NUEVA)
// ============================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Métodos de autenticación
  login: (identifier: string, password: string) => Promise<AuthResponse>;
  complete2FALogin: (tempToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Helpers de permisos (NUEVOS)
  hasRole: (roleSlug: string, comunidadId?: number) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasComunidadAccess: (comunidadId: number) => boolean;
  getRolesByComunidad: (comunidadId: number) => Role[];
}

// ============================================
// RESPUESTAS DE API (TU CÓDIGO EXISTENTE)
// ============================================

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user?: UserExtended | User;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export interface PreferencesUpdateResponse {
  success: boolean;
  message: string;
  preferences?: UserPreferences;
}

export interface SessionsResponse {
  success?: boolean;
  sessions: SessionInfo[];
}

// ============================================
// REGISTRO Y RECUPERACIÓN (NUEVAS)
// ============================================

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword?: string;
  email?: string;
  persona_id?: number;
  rut?: string;
  dv?: string;
  nombres?: string;
  apellidos?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword?: string;
}

// ============================================
// UTILIDADES DE TIPO (HELPERS)
// ============================================

// Type guard para verificar si es User o UserExtended
export function isUserExtended(user: User | UserExtended): user is UserExtended {
  return 'communities' in user || 'sessions' in user;
}

// Type guard para verificar si tiene roles
export function hasRoles(user: User | null): user is User & { roles: Role[] } {
  return !!user && Array.isArray(user.roles) && user.roles.length > 0;
}

// Type guard para verificar si tiene membresías
export function hasMemberships(user: User | null): user is User & { memberships: Membership[] } {
  return !!user && Array.isArray(user.memberships) && user.memberships.length > 0;
}

// ============================================
// CONSTANTES Y ENUMS
// ============================================

export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  SUSPENDED = -1
}

export enum MembershipStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
  SUSPENDED = 'suspendido'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum DateFormat {
  DMY = 'DD/MM/YYYY',
  MDY = 'MM/DD/YYYY',
  YMD = 'YYYY-MM-DD'
}

export enum Language {
  ES = 'es',
  EN = 'en',
  PT = 'pt'
}

// ============================================
// VALORES POR DEFECTO
// ============================================

export const DEFAULT_PREFERENCES: UserPreferences = {
  emailNotifications: true,
  paymentNotifications: true,
  weeklyReports: false,
  platformNotifications: true,
  platformMessages: true,
  platformTasks: true,
  marketingEmails: false,
  timezone: 'America/Santiago',
  dateFormat: 'DD/MM/YYYY',
  language: 'es',
  theme: 'auto',
  notifications: {
    email_enabled: true,
    payment_notifications: true,
    weekly_summaries: false,
    multas_notifications: true,
    gastos_notifications: true
  },
  display: {
    timezone: 'America/Santiago',
    date_format: 'DD/MM/YYYY',
    language: 'es',
    theme: 'auto'
  },
  privacy: {
    profile_visible: true,
    show_email: false,
    show_phone: false
  }
};

// ============================================
// EXPORTS ADICIONALES
// ============================================

// Re-exportar todo para facilitar imports
export type {
  Role as RoleType,
  Membership as MembershipType,
  Persona as PersonaType,
  User as UserType,
  UserExtended as UserExtendedType
};