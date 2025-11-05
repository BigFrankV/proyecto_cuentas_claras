/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { jwtDecode } from 'jwt-decode';

import apiClient from './api';

// Tipos para la autenticación
export interface LoginCredentials {
  identifier: string; // Email, RUT, DNI o username
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  persona_id?: number;
}

export interface Persona {
  rut?: string;
  dv?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface Membership {
  comunidadId: number;
  rol: string;
  desde?: string;
  hasta?: string;
  activo?: boolean;
}

//  CORREGIR: Interfaz User compatible con exactOptionalPropertyTypes
export interface User {
  id: number;
  username: string;
  is_superadmin?: boolean; //  CAMBIAR a opcional temporalmente
  email?: string;
  persona_id?: number | undefined; //  Agregar undefined explícitamente
  nombres?: string;
  apellidos?: string;
  comunidad_id?: number | undefined; //  Agregar undefined explícitamente
  roles?: string[];
  memberships?: Membership[];
  is_2fa_enabled?: boolean;
  totp_enabled?: boolean;

  // Campos adicionales opcionales
  firstName?: string;
  lastName?: string;
  phone?: string;
  activo?: boolean;
  created_at?: string;

  // Datos de persona relacionados
  persona?: Persona | null;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  expires_in?: number;

  // Campos para 2FA
  twoFactorRequired?: boolean;
  tempToken?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

// Interface para el payload del JWT
interface JWTPayload {
  sub: number;
  username: string;
  persona_id?: number;
  roles?: string[];
  comunidad_id?: number;
  is_superadmin?: boolean;
  memberships?: Membership[]; //  AGREGAR
  twoFactor?: boolean;
  iat: number;
  exp: number;
}

class AuthService {
  // Login del usuario (puede requerir 2FA)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: credentials.identifier,
        password: credentials.password,
      });

      // eslint-disable-next-line no-console
      console.log('Respuesta completa de la API:', response.data);

      // Verificar si se requiere 2FA
      if (response.data.twoFactorRequired) {
        // eslint-disable-next-line no-console
        console.log('2FA requerido, devolviendo tempToken');
        return {
          twoFactorRequired: true,
          tempToken: response.data.tempToken,
        };
      }

      const token = response.data.token;

      if (!token) {
        throw new Error('No se recibió token de autenticación');
      }

      // eslint-disable-next-line no-console
      console.log('Token extraído:', token);

      // Decodificar el token para extraer los datos del usuario
      let user: User;
      try {
        const decodedToken = jwtDecode<JWTPayload>(token);
        // eslint-disable-next-line no-console
        console.log('Token decodificado:', decodedToken);

        //  CORREGIR: Crear objeto usuario con valores por defecto seguros
        const userObj: User = {
          id: decodedToken.sub,
          username: decodedToken.username,
          is_superadmin: Boolean(decodedToken.is_superadmin), //  Convertir a boolean explícitamente
          persona_id: decodedToken.persona_id, // Ahora acepta undefined
          comunidad_id: decodedToken.comunidad_id, // Ahora acepta undefined
          roles: decodedToken.roles || [],
          memberships: decodedToken.memberships || [],
        };

        user = userObj;

        // eslint-disable-next-line no-console
        console.log('Usuario extraído del token:', user);

        // Intentar obtener información completa del usuario del servidor
        try {
          const fullUserData = await this.getCurrentUser();
          if (fullUserData) {
            // Combinar datos del token con datos completos del servidor
            user = { ...user, ...fullUserData };
            // eslint-disable-next-line no-console
          }
        } catch (serverError) {
          // eslint-disable-next-line no-console
          console.log(
            'No se pudo obtener datos completos del servidor, usando datos del token'
          );
        }
      } catch (jwtError) {
        // eslint-disable-next-line no-console
        console.error('Error decodificando token:', jwtError);
        throw new Error('Token de autenticación inválido');
      }

      // Guardar token y datos de usuario en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      // eslint-disable-next-line no-console
      return { token, user };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error en login:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error(
          'Credenciales inválidas. Verifica tu usuario y contraseña.'
        );
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(
          'No se pudo conectar con el servidor. Verifica que la API esté ejecutándose.'
        );
      } else {
        throw new Error('Error de conexión. Por favor intenta nuevamente.');
      }
    }
  }

  // Completar login con código 2FA
  async complete2FALogin(
    tempToken: string,
    code: string
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/2fa/verify', {
        tempToken,
        code,
      });

      const token = response.data.token;

      if (!token) {
        throw new Error('No se recibió token de autenticación');
      }

      // Decodificar el token para extraer los datos del usuario
      let user: User;
      try {
        const decodedToken = jwtDecode<JWTPayload>(token);
        // eslint-disable-next-line no-console

        //  CORREGIR: Crear objeto usuario con valores por defecto seguros
        const userObj: User = {
          id: decodedToken.sub,
          username: decodedToken.username,
          persona_id: decodedToken.persona_id,
          is_superadmin: Boolean(decodedToken.is_superadmin), //
          roles: decodedToken.roles || [],
          comunidad_id: decodedToken.comunidad_id,
          memberships: decodedToken.memberships || [],
        };

        user = userObj;

        // eslint-disable-next-line no-console

        // Intentar obtener información completa del usuario del servidor
        try {
          const fullUserData = await this.getCurrentUser();
          if (fullUserData) {
            // Combinar datos del token con datos completos del servidor
            user = { ...user, ...fullUserData };
            // eslint-disable-next-line no-console
            console.log('Usuario 2FA completo con datos del servidor:', user);
          }
        } catch (serverError) {
          // eslint-disable-next-line no-console
          console.log(
            'No se pudo obtener datos completos del servidor en 2FA, usando datos del token'
          );
        }
      } catch (jwtError) {
        // eslint-disable-next-line no-console
        console.error('Error decodificando token 2FA:', jwtError);
        throw new Error('Token de autenticación inválido');
      }

      // Guardar token y datos de usuario en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      // eslint-disable-next-line no-console

      return { token, user };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error en login 2FA:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Código 2FA inválido o expirado');
      } else {
        throw new Error('Error de conexión. Por favor intenta nuevamente.');
      }
    }
  }

  // Registro de usuario
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', {
        username: data.username,
        password: data.password,
        email: data.email,
        persona_id: data.persona_id,
      });

      const { token, user } = response.data;

      // Guardar token y datos de usuario en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error en registro:', error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error(
          'Datos de registro inválidos. Verifica que el usuario tenga al menos 3 caracteres y la contraseña 6.'
        );
      } else {
        throw new Error(
          'Error al registrar usuario. Por favor intenta nuevamente.'
        );
      }
    }
  }

  // Logout del usuario
  async logout(): Promise<void> {
    try {
      // Intentar hacer logout en el servidor
      await apiClient.post('/auth/logout');
    } catch (error) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console

      // eslint-disable-next-line no-console
      console.warn('Error al hacer logout en servidor:', error);
    } finally {
      // Limpiar datos locales siempre
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
  }

  // Obtener información del usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data;

      //  CORREGIR: Mapear correctamente todos los campos
      const user: User = {
        id: userData.id || userData.sub,
        username: userData.username,
        email: userData.email,
        persona_id: userData.persona_id,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        is_superadmin: userData.is_superadmin || false,
        roles: userData.roles || [],
        comunidad_id: userData.comunidad_id,
        memberships: userData.memberships || [],
        is_2fa_enabled:
          userData.totp_enabled || userData.is_2fa_enabled || false,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        activo: userData.activo,
        created_at: userData.created_at,
        persona: userData.persona,
      };

      // eslint-disable-next-line no-console
      return user;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Verificar si el usuario está logueado
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('auth_token');

    if (!token) {
      // eslint-disable-next-line no-console
      return false;
    }

    try {
      // Verificar si el token es válido y no ha expirado
      const decodedToken = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // eslint-disable-next-line no-console
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return false;
      }

      // eslint-disable-next-line no-console
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error validando token:', error);
      // Si hay error decodificando, limpiar datos
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return false;
    }
  }

  // Obtener token actual
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('auth_token');
  }

  // Obtener datos del usuario desde localStorage
  getUserData(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const userData = localStorage.getItem('user_data');
    // eslint-disable-next-line no-console
    try {
      const parsedUser = userData ? JSON.parse(userData) : null;
      // eslint-disable-next-line no-console
      return parsedUser;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parseando datos de usuario:', error);
      return null;
    }
  }

  // Debug: Mostrar estado actual del localStorage
  debugAuthState(): void {
    if (typeof window === 'undefined') {
      // eslint-disable-next-line no-console
      console.log('No se puede acceder a localStorage en el servidor');
      return;
    }
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const now = Date.now() / 1000;
      } catch (error) {
        // eslint-disable-next-line no-console
      }
    }
  }

  // Cambiar contraseña
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al cambiar la contraseña');
      }
    }
  }

  // Actualizar perfil de usuario
  async updateProfile(data: {
    username?: string;
    email?: string;
  }): Promise<User> {
    try {
      const response = await apiClient.patch('/auth/profile', data);
      const updatedUser = response.data.user;

      // Actualizar datos en localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    }
  }

  // Actualizar datos de persona
  async updatePersona(data: Partial<Persona>): Promise<Persona> {
    try {
      const response = await apiClient.patch('/auth/profile/persona', data);

      // Actualizar datos de usuario en localStorage con la nueva información de persona
      const currentUser = this.getUserData();
      if (currentUser) {
        currentUser.persona = response.data.persona;
        localStorage.setItem('user_data', JSON.stringify(currentUser));
      }

      return response.data.persona;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al actualizar la información personal');
      }
    }
  }

  // Obtener preferencias del usuario
  async getPreferences(): Promise<any> {
    try {
      const response = await apiClient.get('/auth/preferences');
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo preferencias:', error);
      // Devolver preferencias por defecto si hay error
      return {
        notifications: {
          email_enabled: true,
          payment_notifications: true,
          weekly_summaries: true,
        },
        display: {
          timezone: 'America/Santiago',
          date_format: 'DD/MM/YYYY',
          language: 'es',
        },
      };
    }
  }

  // Actualizar preferencias del usuario
  async updatePreferences(preferences: any): Promise<void> {
    try {
      await apiClient.patch('/auth/preferences', preferences);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Error al actualizar las preferencias');
      }
    }
  }

  // Obtener sesiones activas
  async getSessions(): Promise<any[]> {
    try {
      const response = await apiClient.get('/auth/sessions');
      return response.data.sessions;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo sesiones:', error);
      return [];
    }
  }

  // Cerrar una sesión específica
  async closeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al cerrar la sesión');
      }
    }
  }

  // Cerrar todas las sesiones excepto la actual
  async closeAllSessions(): Promise<void> {
    try {
      await apiClient.delete('/auth/sessions');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al cerrar las sesiones');
      }
    }
  }

  // Refresh del token
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token } = response.data;

      localStorage.setItem('auth_token', token);
      return token;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error refrescando token:', error);
      return null;
    }
  }

  // Solicitar reset de contraseña
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al solicitar reset de contraseña');
      }
    }
  }

  // Reset de contraseña
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password,
      });
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al resetear contraseña');
      }
    }
  }
}

// Exportar instancia única del servicio
const authService = new AuthService();
export default authService;
