import apiClient from './api';
import { jwtDecode } from 'jwt-decode';

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

export interface User {
  id: string;
  username: string;
  email?: string;
  persona_id?: number;
  is_superadmin?: boolean;
  roles?: string[];
  comunidad_id?: number;
  totp_enabled?: boolean;
  activo?: boolean;
  created_at?: string;
  
  // Datos de persona relacionados
  persona?: Persona | null;
  
  // Campos adicionales de perfil (deprecated - usar persona)
  firstName?: string;
  lastName?: string;
  phone?: string;
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

      console.log('🔍 Respuesta completa de la API:', response.data);

      // Verificar si se requiere 2FA
      if (response.data.twoFactorRequired) {
        console.log('🔐 2FA requerido, devolviendo tempToken');
        return {
          twoFactorRequired: true,
          tempToken: response.data.tempToken,
        };
      }

      const token = response.data.token;

      if (!token) {
        throw new Error('No se recibió token de autenticación');
      }

      console.log('🔍 Token extraído:', token);

      // Decodificar el token para extraer los datos del usuario
      let user: User;
      try {
        const decodedToken = jwtDecode<JWTPayload>(token);
        console.log('🔍 Token decodificado:', decodedToken);

        // Crear objeto usuario básico desde el token
        const userObj: Partial<User> = {
          id: decodedToken.sub.toString(),
          username: decodedToken.username,
          is_superadmin: decodedToken.is_superadmin || false,
          roles: decodedToken.roles || [],
        };

        if (decodedToken.persona_id !== undefined) {
          userObj.persona_id = decodedToken.persona_id;
        }

        if (decodedToken.comunidad_id !== undefined) {
          userObj.comunidad_id = decodedToken.comunidad_id;
        }

        user = userObj as User;

        console.log('🔍 Usuario extraído del token:', user);
        
        // Intentar obtener información completa del usuario del servidor
        try {
          const fullUserData = await this.getCurrentUser();
          if (fullUserData) {
            // Combinar datos del token con datos completos del servidor
            user = { ...user, ...fullUserData };
            console.log('🔍 Usuario completo con datos del servidor:', user);
          }
        } catch (serverError) {
          console.log('⚠️ No se pudo obtener datos completos del servidor, usando datos del token');
        }
      } catch (jwtError) {
        console.error('❌ Error decodificando token:', jwtError);
        throw new Error('Token de autenticación inválido');
      }

      // Guardar token y datos de usuario en localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      console.log('💾 Datos guardados en localStorage');
      console.log(
        '💾 Token en localStorage:',
        localStorage.getItem('auth_token')
      );
      console.log(
        '💾 Usuario en localStorage:',
        localStorage.getItem('user_data')
      );

      return { token, user };
    } catch (error: any) {
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
  async complete2FALogin(tempToken: string, code: string): Promise<AuthResponse> {
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
        console.log('🔍 Token 2FA decodificado:', decodedToken);

        // Crear objeto usuario básico desde el token
        const userObj: Partial<User> = {
          id: decodedToken.sub.toString(),
          username: decodedToken.username,
          is_superadmin: decodedToken.is_superadmin || false,
          roles: decodedToken.roles || [],
        };

        if (decodedToken.persona_id !== undefined) {
          userObj.persona_id = decodedToken.persona_id;
        }

        if (decodedToken.comunidad_id !== undefined) {
          userObj.comunidad_id = decodedToken.comunidad_id;
        }

        user = userObj as User;

        console.log('🔍 Usuario extraído del token 2FA:', user);
        
        // Intentar obtener información completa del usuario del servidor
        try {
          const fullUserData = await this.getCurrentUser();
          if (fullUserData) {
            // Combinar datos del token con datos completos del servidor
            user = { ...user, ...fullUserData };
            console.log('🔍 Usuario 2FA completo con datos del servidor:', user);
          }
        } catch (serverError) {
          console.log('⚠️ No se pudo obtener datos completos del servidor en 2FA, usando datos del token');
        }
      } catch (jwtError) {
        console.error('❌ Error decodificando token 2FA:', jwtError);
        throw new Error('Token de autenticación inválido');
      }

      // Guardar token y datos de usuario en localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      console.log('💾 Datos 2FA guardados en localStorage');

      return { token, user };
    } catch (error: any) {
      console.error('❌ Error en login 2FA:', error);
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
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));

      return response.data;
    } catch (error: any) {
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
      console.warn('Error al hacer logout en servidor:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  // Obtener información del usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data;
      
      // Asegurar que tenemos el campo totp_enabled
      const user: User = {
        id: userData.id?.toString() || userData.sub?.toString(),
        username: userData.username,
        email: userData.email,
        persona_id: userData.persona_id,
        is_superadmin: userData.is_superadmin || false,
        roles: userData.roles || [],
        comunidad_id: userData.comunidad_id,
        totp_enabled: userData.totp_enabled || false,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        activo: userData.activo,
        created_at: userData.created_at,
      };
      
      console.log('✅ Usuario actual obtenido del servidor:', user);
      return user;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Verificar si el usuario está logueado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log('❌ No se encontró token en localStorage');
      return false;
    }

    try {
      // Verificar si el token es válido y no ha expirado
      const decodedToken = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        console.log('❌ Token expirado, limpiando localStorage');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        return false;
      }
      
      console.log('✅ Token válido y no expirado');
      return true;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      // Si hay error decodificando, limpiar datos
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return false;
    }
  }

  // Obtener token actual
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Obtener datos del usuario desde localStorage
  getUserData(): User | null {
    const userData = localStorage.getItem('user_data');
    console.log('🔍 Datos raw del localStorage:', userData);
    try {
      const parsedUser = userData ? JSON.parse(userData) : null;
      console.log('🔍 Usuario parseado:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('❌ Error parseando datos de usuario:', error);
      return null;
    }
  }

  // Debug: Mostrar estado actual del localStorage
  debugAuthState(): void {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('🔍 DEBUG - Estado de autenticación:');
    console.log('  Token presente:', !!token);
    console.log('  Token:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('  Datos de usuario:', userData);
    
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const now = Date.now() / 1000;
        console.log('  Token válido:', decoded.exp > now);
        console.log('  Expira en:', Math.round(decoded.exp - now), 'segundos');
      } catch (error) {
        console.log('  Token inválido:', error);
      }
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
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
  async updateProfile(data: { username?: string; email?: string }): Promise<User> {
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
      console.error('Error obteniendo preferencias:', error);
      // Devolver preferencias por defecto si hay error
      return {
        notifications: {
          email_enabled: true,
          payment_notifications: true,
          weekly_summaries: true
        },
        display: {
          timezone: 'America/Santiago',
          date_format: 'DD/MM/YYYY',
          language: 'es'
        }
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
