import api from './api';
import { jwtDecode } from 'jwt-decode';
import {
  User,
  Role,
  Membership,
  Persona,
  LoginResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData
} from '@/types/profile';

// ============================================
// INTERFACE PARA JWT PAYLOAD
// ============================================

interface JWTPayload {
  sub: number;
  username: string;
  persona_id?: number;
  is_superadmin?: boolean;
  is_admin?: boolean;
  roles?: string[]; // Array de slugs
  full_roles?: Role[]; // Array de objetos Role completos
  memberships?: Membership[];
  comunidad_id?: number;
  twoFactor?: boolean;
  iat: number;
  exp: number;
}

// ============================================
// INTERFACES ADICIONALES PARA RESPUESTAS
// ============================================

interface LoginResponseData {
  token?: string;
  user?: User;
  twoFactorRequired?: boolean;
  tempToken?: string;
}

// ============================================
// CLASE AUTH SERVICE
// ============================================

class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly TEMP_TOKEN_KEY = 'temp_token';

  // ============================================
  // LOGIN - CON SOPORTE PARA 2FA
  // ============================================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Intentando login con:', credentials.identifier);

      const response = await api.post<LoginResponseData>('/auth/login', {
        identifier: credentials.identifier,
        password: credentials.password,
      });

      console.log('📥 Respuesta del servidor:', response.data);

      const data = response.data;

      // ✅ VERIFICAR SI SE REQUIERE 2FA
      if (data.twoFactorRequired) {
        console.log('🔐 2FA requerido - Guardando tempToken');

        if (data.tempToken) {
          sessionStorage.setItem(this.TEMP_TOKEN_KEY, data.tempToken);
        }
        // ✅ CORRECCIÓN: return con valor completo
        return {
          twoFactorRequired: true,
          tempToken: data.tempToken,
        };
      }

      // ✅ LOGIN NORMAL (SIN 2FA)
      if (!data.token || !data.user) {
        throw new Error('No se recibió token de autenticación');
      }

      console.log('✅ Login exitoso:', {
        username: data.user.username,
        is_admin: data.user.is_admin,
        roles_count: data.user.roles?.length || 0,
        memberships_count: data.user.memberships?.length || 0
      });

      // Guardar en localStorage
      this.saveAuth(data.token, data.user);

      return { token: data.token, user: data.user };

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw this.handleAuthError(error, 'login');
    }
  }

  // ============================================
  // COMPLETAR LOGIN CON 2FA
  // ============================================

  async complete2FALogin(tempToken: string, code: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Verificando código 2FA...');

      const response = await api.post<LoginResponseData>('/auth/verify-2fa', {
        tempToken,
        code,
      });

      const data = response.data;

      if (!data.token || !data.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('✅ 2FA verificado exitosamente');

      // Limpiar tempToken
      sessionStorage.removeItem(this.TEMP_TOKEN_KEY);

      // Guardar auth
      this.saveAuth(data.token, data.user);

      return { token: data.token, user: data.user };

    } catch (error: any) {
      console.error('❌ Error verificando 2FA:', error);
      throw this.handleAuthError(error, '2FA');
    }
  }

  // ============================================
  // REGISTER
  // ============================================

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 Registrando usuario:', data.username);

      const response = await api.post<LoginResponseData>('/auth/register', data);

      const responseData = response.data;

      if (!responseData.token || !responseData.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('✅ Usuario registrado:', responseData.user.username);

      // Guardar auth
      this.saveAuth(responseData.token, responseData.user);

      return { token: responseData.token, user: responseData.user };

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      throw this.handleAuthError(error, 'registro');
    }
  }

  // ============================================
  // LOGOUT
  // ============================================

  async logout(): Promise<void> {
    try {
      console.log('👋 Cerrando sesión...');

      // Intentar logout en servidor
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.warn('⚠️ Error en logout del servidor:', error);
      }

    } finally {
      // Limpiar localStorage SIEMPRE
      this.clearAuth();

      console.log('✅ Sesión cerrada');
    }
  }

  // ============================================
  // OBTENER USUARIO ACTUAL (DESDE SERVIDOR)
  // ============================================

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔍 Obteniendo usuario actual desde servidor...');
      const response = await api.get<User>('/auth/me');
      // backend devuelve { success: true, data: user }
      const user = response.data?.data ?? response.data;

      // Normalizaciones para compatibilidad (alias en español y arrays de slugs)
      user.memberships = user.memberships || user.membreships || [];
      user.membresias = user.membresias || user.memberships || [];
      user.roles_slug = user.roles_slug || (user.memberships || []).map((m: any) => m.rol_slug).filter(Boolean);
      user.is_superadmin = Boolean(user.is_superadmin);

      console.log('✅ Usuario actual:', {
        username: user.username,
        is_admin: user.is_admin,
        roles: user.roles?.length || 0,
        memberships: user.memberships?.length || 0
      });
      this.saveUser(user);
      return user;
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return null;
    }
  }

  // ============================================
  // VERIFICAR SI ESTÁ AUTENTICADO
  // ============================================

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        console.log('❌ Token expirado');
        this.clearAuth();
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ Error verificando token:', error);
      this.clearAuth();
      return false;
    }
  }

  // ============================================
  // HELPERS DE PERMISOS
  // ============================================

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(user: User | null, roleSlug: string, comunidadId?: number): boolean {
    if (!user || !user.roles) return false;

    return user.roles.some(role => {
      const matchesSlug = role.slug.toLowerCase() === roleSlug.toLowerCase();
      const matchesComunidad = !comunidadId || role.comunidad_id === comunidadId;
      return matchesSlug && matchesComunidad;
    });
  }

  /**
   * Verificar si es admin (SuperAdmin O tiene rol admin)
   */
  isAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.is_admin === true || user.is_superadmin === true;
  }

  /**
   * Verificar si es SuperAdmin
   */
  isSuperAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.is_superadmin === true;
  }

  /**
   * Obtener roles de una comunidad específica
   */
  getRolesByComunidad(user: User | null, comunidadId: number): Role[] {
    if (!user || !user.roles) return [];
    return user.roles.filter(role => role.comunidad_id === comunidadId);
  }

  /**
   * Verificar si tiene acceso a una comunidad
   */
  hasComunidadAccess(user: User | null, comunidadId: number): boolean {
    if (!user) return false;
    if (user.is_superadmin) return true;

    return user.memberships?.some(m => m.comunidad_id === comunidadId && m.estado === 'activo') || false;
  }

  /**
   * Obtener nivel más alto del usuario
   */
  getHighestRoleLevel(user: User | null): number {
    if (!user || !user.roles) return 0;
    if (user.is_superadmin) return 100;

    return Math.max(...user.roles.map(r => r.nivel), 0);
  }

  /**
   * Verificar si tiene permiso específico
   */
  hasPermission(user: User | null, permission: string, comunidadId?: number): boolean {
    if (!user) return false;
    if (user.is_superadmin) return true;

    if (!user.roles) return false;

    const roles = comunidadId
      ? user.roles.filter(r => r.comunidad_id === comunidadId)
      : user.roles;

    return roles.some(role => {
      if (role.es_admin) return true;
      if (!role.permisos) return false;
      return role.permisos.includes(permission);
    });
  }

  // ============================================
  // GESTIÓN DE TOKEN Y USUARIO
  // ============================================

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      return user;

    } catch (error) {
      console.error('❌ Error parseando usuario:', error);
      return null;
    }
  }

  private saveAuth(token: string, user: User): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    console.log('💾 Auth guardado:', {
      username: user.username,
      is_admin: user.is_admin
    });
  }

  private saveUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem(this.TEMP_TOKEN_KEY);

    console.log('🗑️ Auth limpiado');
  }

  // ============================================
  // CAMBIO DE CONTRASEÑA
  // ============================================

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      console.log('✅ Contraseña cambiada');

    } catch (error: any) {
      console.error('❌ Error cambiando contraseña:', error);
      throw this.handleAuthError(error, 'cambio de contraseña');
    }
  }

  // ============================================
  // ACTUALIZAR PERFIL
  // ============================================

  async updateProfile(data: { username?: string; email?: string }): Promise<User> {
    try {
      const response = await api.patch<{ user: User }>('/auth/profile', data);
      const updatedUser = response.data.user;

      this.saveUser(updatedUser);
      console.log('✅ Perfil actualizado');

      return updatedUser;

    } catch (error: any) {
      console.error('❌ Error actualizando perfil:', error);
      throw this.handleAuthError(error, 'actualización de perfil');
    }
  }

  // ============================================
  // ACTUALIZAR PERSONA
  // ============================================

  async updatePersona(data: Partial<Persona>): Promise<Persona> {
    try {
      const response = await api.patch<{ persona: Persona }>('/auth/profile/persona', data);
      const updatedPersona = response.data.persona;

      const user = this.getStoredUser();
      if (user) {
        user.persona = updatedPersona;
        this.saveUser(user);
      }

      console.log('✅ Datos personales actualizados');
      return updatedPersona;

    } catch (error: any) {
      console.error('❌ Error actualizando persona:', error);
      throw this.handleAuthError(error, 'actualización de datos personales');
    }
  }

  // ============================================
  // PREFERENCIAS
  // ============================================

  async getPreferences(): Promise<any> {
    try {
      const response = await api.get('/auth/preferences');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      return {
        notifications: { email_enabled: true, payment_notifications: true },
        display: { timezone: 'America/Santiago', date_format: 'DD/MM/YYYY', language: 'es' }
      };
    }
  }

  async updatePreferences(preferences: any): Promise<void> {
    try {
      await api.patch('/auth/preferences', preferences);
      console.log('✅ Preferencias actualizadas');
    } catch (error: any) {
      console.error('❌ Error actualizando preferencias:', error);
      throw this.handleAuthError(error, 'actualización de preferencias');
    }
  }

  // ============================================
  // SESIONES
  // ============================================

  async getSessions(): Promise<any[]> {
    try {
      const response = await api.get('/auth/sessions');
      return response.data.sessions || [];
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      return [];
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      console.log('✅ Sesión cerrada');
    } catch (error: any) {
      console.error('❌ Error cerrando sesión:', error);
      throw this.handleAuthError(error, 'cerrar sesión');
    }
  }

  async closeAllSessions(): Promise<void> {
    try {
      await api.delete('/auth/sessions');
      console.log('✅ Todas las sesiones cerradas');
    } catch (error: any) {
      console.error('❌ Error cerrando sesiones:', error);
      throw this.handleAuthError(error, 'cerrar sesiones');
    }
  }

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
      console.log('✅ Email de recuperación enviado');
    } catch (error: any) {
      console.error('❌ Error solicitando reset:', error);
      throw this.handleAuthError(error, 'recuperación de contraseña');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post('/auth/reset-password', { token, password });
      console.log('✅ Contraseña reseteada');
    } catch (error: any) {
      console.error('❌ Error reseteando contraseña:', error);
      throw this.handleAuthError(error, 'reset de contraseña');
    }
  }

  // ============================================
  // REFRESH TOKEN
  // ============================================

  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      const { token } = response.data;

      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('✅ Token renovado');

      return token;

    } catch (error) {
      console.error('❌ Error renovando token:', error);
      return null;
    }
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  private handleAuthError(error: any, context: string): Error {
    const message = error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error desconocido';

    const status = error.response?.status;

    console.error(`❌ Error en ${context}:`, { status, message });

    switch (status) {
      case 400:
        return new Error(`Datos inválidos: ${message}`);
      case 401:
        return new Error('Credenciales inválidas');
      case 403:
        return new Error('Acceso denegado');
      case 404:
        return new Error('Recurso no encontrado');
      case 409:
        return new Error(message);
      case 422:
        return new Error(`Datos incorrectos: ${message}`);
      default:
        return new Error(message);
    }
  }

  // ============================================
  // DEBUG
  // ============================================

  debugAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    console.log('🔍 DEBUG - Estado de autenticación:');
    console.log('  Token presente:', !!token);
    console.log('  Usuario presente:', !!user);

    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const now = Date.now() / 1000;
        console.log('  Token válido:', decoded.exp > now);
        console.log('  Expira en:', Math.round(decoded.exp - now), 'segundos');
        console.log('  Usuario ID:', decoded.sub);
        console.log('  Roles:', decoded.roles || []);
      } catch (error) {
        console.log('  Token inválido:', error);
      }
    }

    if (user) {
      console.log('  Username:', user.username);
      console.log('  Is Admin:', user.is_admin);
      console.log('  Is SuperAdmin:', user.is_superadmin);
      console.log('  Roles:', user.roles?.length || 0);
      console.log('  Membresías:', user.memberships?.length || 0);
    }
  }
}

const authService = new AuthService();
export default authService;
export { AuthService };