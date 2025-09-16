import apiClient from './api';
import { jwtDecode } from 'jwt-decode';

// Tipos para la autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  persona_id?: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  persona_id?: number;
  is_superadmin?: boolean;
  roles?: string[];
  comunidad_id?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in?: number;
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
  iat: number;
  exp: number;
}

class AuthService {
  // Login del usuario
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });

      console.log('🔍 Respuesta completa de la API:', response.data);

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

        user = {
          id: decodedToken.sub.toString(),
          username: decodedToken.username,
          persona_id: decodedToken.persona_id || undefined,
          is_superadmin: decodedToken.is_superadmin || false,
          roles: decodedToken.roles || [],
          comunidad_id: decodedToken.comunidad_id || undefined,
        };

        console.log('🔍 Usuario extraído del token:', user);
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
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Verificar si el usuario está logueado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
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
