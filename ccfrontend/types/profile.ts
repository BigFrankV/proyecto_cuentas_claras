// Tipos extendidos para el perfil de usuario y funciones relacionadas

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
}

export interface SessionInfo {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastAccess: string;
  isCurrent: boolean;
  userAgent: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Tipos para 2FA
export interface TotpSetupResponse {
  base32: string;
  otpauth: string;
  qr: string; // Data URL del QR code
}

export interface TotpVerificationData {
  code: string;
  base32?: string; // Solo para activación inicial
}

export interface UserExtended {
  id: string;
  username: string;
  email?: string;
  persona_id?: number;
  is_superadmin?: boolean;
  roles?: string[];
  comunidad_id?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  lastConnection?: string;

  // 2FA fields
  totp_enabled: boolean;
  totp_secret?: string;

  // Preferencias
  preferences?: UserPreferences;

  // Datos adicionales para el perfil
  communities?: Array<{
    id: number;
    name: string;
    role: string;
  }>;
}

// Respuestas de API
export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user?: UserExtended;
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
  sessions: SessionInfo[];
}

export interface TotpActionResponse {
  success: boolean;
  message: string;
  setupData?: TotpSetupResponse;
}
