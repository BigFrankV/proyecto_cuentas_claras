/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UserExtended,
  ProfileFormData,
  PasswordChangeData,
  UserPreferences,
  ProfileUpdateResponse,
  PasswordChangeResponse,
  PreferencesUpdateResponse,
  TotpSetupResponse,
  TotpVerificationData,
  TotpActionResponse,
  SessionInfo,
} from '@/types/profile';

import apiClient from './api';

class ProfileService {
  // Obtener perfil completo del usuario
  async getProfile(): Promise<UserExtended> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo perfil:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener perfil',
      );
    }
  }

  // Actualizar información personal
  async updateProfile(data: ProfileFormData): Promise<ProfileUpdateResponse> {
    try {
      const response = await apiClient.patch('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error actualizando perfil:', error);
      throw new Error(
        error.response?.data?.message || 'Error al actualizar perfil',
      );
    }
  }

  // Cambiar contraseña
  async changePassword(
    data: PasswordChangeData,
  ): Promise<PasswordChangeResponse> {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error cambiando contraseña:', error);
      throw new Error(
        error.response?.data?.message || 'Error al cambiar contraseña',
      );
    }
  }

  // Actualizar preferencias
  async updatePreferences(
    preferences: UserPreferences,
  ): Promise<PreferencesUpdateResponse> {
    try {
      const response = await apiClient.patch('/auth/preferences', preferences);
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error actualizando preferencias:', error);
      throw new Error(
        error.response?.data?.message || 'Error al actualizar preferencias',
      );
    }
  }

  // Obtener sesiones activas
  async getActiveSessions(): Promise<SessionInfo[]> {
    try {
      const response = await apiClient.get('/auth/sessions');
      return response.data.sessions || [];
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo sesiones:', error);
      // Devolver datos mock como fallback
      return this.getMockSessions();
    }
  }

  // Cerrar sesión específica
  async closeSession(sessionId: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error cerrando sesión:', error);
      throw new Error(
        error.response?.data?.message || 'Error al cerrar sesión',
      );
    }
  }

  // Cerrar todas las sesiones
  async closeAllSessions(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete('/auth/sessions');
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error cerrando todas las sesiones:', error);
      throw new Error(
        error.response?.data?.message || 'Error al cerrar sesiones',
      );
    }
  }

  // ==== MÉTODOS 2FA ====

  // Verificar estado actual del 2FA usando /auth/me
  async check2FAStatus(): Promise<{ enabled: boolean }> {
    try {
      const response = await apiClient.get('/auth/me');
      const totp_enabled = response.data?.totp_enabled || false;
      return { enabled: totp_enabled };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error checking 2FA status via /auth/me:', error);

      // Fallback al método anterior si /auth/me falla
      try {
        const response = await apiClient.get('/auth/2fa/setup');

        if (response.data && response.data.qr && response.data.base32) {
          // Si setup devuelve QR code, significa que 2FA está desactivado
          return { enabled: false };
        } else {
          // Setup devolvió datos inesperados
          return { enabled: false };
        }
      } catch (setupError: any) {
        // Si setup falla, probamos con disable
        try {
          await apiClient.post('/auth/2fa/disable', { code: '000000' });
          // Si disable funciona con código dummy, 2FA está desactivado
          return { enabled: false };
        } catch (disableError: any) {
          if (disableError.response?.status === 400) {
            const errorMsg =
              disableError.response?.data?.error?.toLowerCase() || '';
            const message =
              disableError.response?.data?.message?.toLowerCase() || '';

            // Si el error es "invalid code", significa que SÍ está habilitado
            if (
              errorMsg.includes('invalid code') ||
              message.includes('invalid code') ||
              errorMsg.includes('código inválido') ||
              message.includes('código inválido')
            ) {
              return { enabled: true };
            } else {
              return { enabled: false };
            }
          } else {
            return { enabled: false };
          }
        }
      }
    }
  }

  // Configurar 2FA - obtener QR y secret
  async setup2FA(): Promise<TotpSetupResponse> {
    try {
      const response = await apiClient.get('/auth/2fa/setup');
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error configurando 2FA:', error);
      throw new Error(
        error.response?.data?.message || 'Error al configurar 2FA',
      );
    }
  }

  // Activar 2FA
  async enable2FA(data: TotpVerificationData): Promise<TotpActionResponse> {
    try {
      const response = await apiClient.post('/auth/2fa/enable', {
        code: data.code,
        base32: data.base32,
      });
      return { success: true, message: '2FA activado exitosamente' };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error activando 2FA:', error);
      throw new Error(error.response?.data?.message || 'Error al activar 2FA');
    }
  }

  // Desactivar 2FA
  async disable2FA(code: string): Promise<TotpActionResponse> {
    try {
      const response = await apiClient.post('/auth/2fa/disable', { code });
      return { success: true, message: '2FA desactivado exitosamente' };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error desactivando 2FA:', error);
      throw new Error(
        error.response?.data?.message || 'Error al desactivar 2FA',
      );
    }
  }

  // Verificar código 2FA durante login
  async verify2FA(tempToken: string, code: string): Promise<{ token: string }> {
    try {
      const response = await apiClient.post('/auth/2fa/verify', {
        tempToken,
        code,
      });
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error verificando 2FA:', error);
      throw new Error(error.response?.data?.message || 'Código 2FA inválido');
    }
  }

  // Subir foto de perfil
  async uploadProfilePhoto(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        '/auth/profile-photo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error subiendo foto de perfil:', error);
      throw new Error(
        error.response?.data?.message || 'Error al subir foto de perfil',
      );
    }
  }

  // Obtener foto de perfil
  async getProfilePhoto(): Promise<string | null> {
    try {
      const response = await apiClient.get('/auth/profile-photo');
      
      // eslint-disable-next-line no-console
      console.log('🖼️ [ProfileService] Respuesta del backend:', response.data);
      
      // Si la respuesta incluye photoUrl, construir la URL completa
      if (response.data.photoUrl) {
        // Si ya es una URL absoluta, devolverla tal cual
        if (response.data.photoUrl.startsWith('http')) {
          // eslint-disable-next-line no-console
          console.log('🖼️ [ProfileService] URL absoluta:', response.data.photoUrl);
          return response.data.photoUrl;
        }
        // Si es una ruta relativa, construir la URL completa usando la base URL de la API
        const baseUrl = apiClient.defaults.baseURL || '';
        const fullUrl = `${baseUrl}${response.data.photoUrl}`;
        // eslint-disable-next-line no-console
        console.log('🖼️ [ProfileService] URL construida:', fullUrl);
        return fullUrl;
      }
      
      // eslint-disable-next-line no-console
      console.log('🖼️ [ProfileService] No hay foto de perfil');
      return null;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error obteniendo foto de perfil:', error);
      return null;
    }
  }

  // Eliminar foto de perfil
  async deleteProfilePhoto(): Promise<any> {
    try {
      const response = await apiClient.delete('/auth/profile-photo');
      return response.data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error eliminando foto de perfil:', error);
      throw new Error(
        error.response?.data?.message || 'Error al eliminar foto de perfil',
      );
    }
  }

  // Datos mock para sesiones (mientras no estén implementadas en backend)
  private getMockSessions(): SessionInfo[] {
    return [
      {
        id: '1',
        device: 'Windows 11',
        location: 'Santiago, Chile',
        ip: '192.168.1.105',
        lastAccess: new Date().toISOString(),
        isCurrent: true,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        id: '2',
        device: 'iPhone 14',
        location: 'Santiago, Chile',
        ip: '185.54.121.87',
        lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isCurrent: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
      {
        id: '3',
        device: 'iPad Pro',
        location: 'Viña del Mar, Chile',
        ip: '185.54.121.90',
        lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isCurrent: false,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
      },
    ];
  }
}

const profileService = new ProfileService();
export default profileService;
