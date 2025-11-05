/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { useRouter } from 'next/router';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

import authService, { User, AuthResponse } from './auth';

// Tipos para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    identifier: string,
    password: string,
    totp_code?: string
  ) => Promise<AuthResponse>; // ✅ AGREGAR totp_code
  complete2FALogin: (tempToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar la app
  useEffect(() => {
    let isMounted = true;

    const clearSession = async () => {
      // eslint-disable-next-line no-console`n      console.log('Iniciando proceso de logout...');
      try {
        await authService.logout();
        // eslint-disable-next-line no-console`n        console.log('Logout exitoso en servidor');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error en logout del servidor:', error);
      } finally {
        if (isMounted) {
          // eslint-disable-next-line no-console`n          console.log('Limpiando estado local...');
          setUser(null);
          // eslint-disable-next-line no-console`n          console.log('Redirigiendo a página de inicio...');
          router.push('/');
        }
      }
    };

    const checkAuthStatus = async () => {
      // eslint-disable-next-line no-console`n      console.log('Verificando estado de autenticación...');

      // Debug del estado actual
      authService.debugAuthState();

      try {
        // Primero verificar si tenemos un token válido
        if (!authService.isAuthenticated()) {
          // eslint-disable-next-line no-console`n          console.log('No hay token válido o está expirado');
          if (isMounted) {
            setUser(null);
          }
          return;
        }

        // eslint-disable-next-line no-console`n        console.log('Token válido encontrado en localStorage');

        // Intentar obtener datos del usuario desde localStorage
        const userData = authService.getUserData();
        if (userData) {
          // eslint-disable-next-line no-console
          console.log(
            'Datos de usuario encontrados en localStorage:',
            userData
          );
          // ✅ NUEVO: Log de memberships para debug
          if (userData.memberships) {
            // eslint-disable-next-line no-console`n            console.log('Membresías del usuario:', userData.memberships);
          }
          if (isMounted) {
            setUser(userData);
          }

          // Verificar con el servidor para sincronizar datos
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser && isMounted) {
              // eslint-disable-next-line no-console`n              console.log('Usuario verificado con servidor:', currentUser);
              // ✅ NUEVO: Log de memberships actualizadas
              if (currentUser.memberships) {
                // eslint-disable-next-line no-console
                console.log(
                  'Membresías actualizadas del servidor:',
                  currentUser.memberships
                );
              }
              // Actualizar datos con información completa del servidor
              const updatedUserData = { ...userData, ...currentUser };
              setUser(updatedUserData);
              // Actualizar localStorage con datos completos
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  'user_data',
                  JSON.stringify(updatedUserData)
                );
              }
            } else if (!currentUser) {
              // eslint-disable-next-line no-console
              console.log(
                'Servidor no reconoce el token, manteniendo datos locales'
              );
            }
          } catch (serverError: any) {
            // eslint-disable-next-line no-console
            console.log('Error verificando con servidor:', serverError.message);
            if (serverError.response?.status === 401) {
              // eslint-disable-next-line no-console`n              console.log('Token inválido según servidor, limpiando sesión');
              await clearSession();
              return;
            }
            // Si es otro tipo de error, mantener datos locales
            // eslint-disable-next-line no-console
            console.log('Manteniendo sesión local por error de conectividad');
          }
        } else {
          // eslint-disable-next-line no-console`n          console.log('No se encontraron datos de usuario en localStorage');
          // Si hay token pero no datos de usuario, limpiar todo
          await clearSession();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error verificando autenticación:', error);
        // Si hay error, limpiar datos
        await clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
          // eslint-disable-next-line no-console`n          console.log('Verificación de autenticación completada');
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // ✅ CORREGIR: Agregar soporte para totp_code opcional
  const login = async (identifier: string, password: string) => {
    // eslint-disable-next-line no-console`n    console.log('Iniciando login para:', identifier);
    try {
      const response = await authService.login({
        identifier,
        password,
      });

      // eslint-disable-next-line no-console`n      console.log('Login exitoso, datos recibidos:', response.user);
      // ✅ NUEVO: Log específico para memberships
      if (response.user?.memberships) {
        // eslint-disable-next-line no-console
        console.log(
          'Membresías recibidas en login:',
          response.user.memberships
        );
      }
      if (response.user?.is_superadmin) {
        // eslint-disable-next-line no-console`n        console.log('Usuario identificado como SUPERADMIN');
      }
      if (response.user) {
        setUser(response.user);
        // eslint-disable-next-line no-console`n        console.log('Usuario establecido en contexto:', response.user);
      }
      return response; // Devolver la respuesta para manejar 2FA
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en login:', error);
      throw error; // Re-lanzar para que el componente maneje el error
    }
  };

  const complete2FALogin = async (tempToken: string, code: string) => {
    // eslint-disable-next-line no-console`n    console.log('Completando login 2FA');
    try {
      const response = await authService.complete2FALogin(tempToken, code);
      // eslint-disable-next-line no-console`n      console.log('Login 2FA exitoso, datos recibidos:', response.user);
      // ✅ NUEVO: Log específico para memberships en 2FA
      if (response.user?.memberships) {
        // eslint-disable-next-line no-console
        console.log(
          'Membresías recibidas en 2FA login:',
          response.user.memberships
        );
      }
      if (response.user) {
        setUser(response.user);
        // eslint-disable-next-line no-console`n        console.log('Usuario establecido en contexto:', response.user);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en login 2FA:', error);
      throw error;
    }
  };

  const logout = async () => {
    // eslint-disable-next-line no-console`n    console.log('Iniciando proceso de logout...');
    try {
      await authService.logout();
      // eslint-disable-next-line no-console`n      console.log('Logout exitoso en servidor');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en logout del servidor:', error);
    } finally {
      // eslint-disable-next-line no-console`n      console.log('Limpiando estado local...');
      setUser(null);
      // eslint-disable-next-line no-console`n      console.log('🏠 Redirigiendo a página de inicio...');
      router.push('/');
    }
  };

  const refreshUser = async () => {
    // eslint-disable-next-line no-console`n    console.log('Refrescando datos de usuario...');
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        // eslint-disable-next-line no-console`n        console.log('Datos de usuario actualizados:', currentUser);
        // ✅ NUEVO: Log de memberships actualizadas
        if (currentUser.memberships) {
          // eslint-disable-next-line no-console`n          console.log('Membresías actualizadas:', currentUser.memberships);
        }
        setUser(currentUser);
        // Actualizar localStorage
        localStorage.setItem('user_data', JSON.stringify(currentUser));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error refrescando usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token: authService.getToken(),
    isLoading,
    isAuthenticated: !!user,
    login,
    complete2FALogin,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Componente para proteger rutas que requieren autenticación
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      'ProtectedRoute - autenticado:',
      isAuthenticated,
      'cargando:',
      isLoading
    );
    if (!isLoading && !isAuthenticated) {
      // eslint-disable-next-line no-console`n      console.log('No autenticado, redirigiendo a login...');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    // eslint-disable-next-line no-console`n    console.log('ProtectedRoute - Mostrando spinner de carga...');
    return (
      <div className='d-flex justify-content-center align-items-center min-vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // eslint-disable-next-line no-console
    console.log(
      'ProtectedRoute - Usuario no autenticado, no mostrando contenido'
    );
    return null;
  }

  // eslint-disable-next-line no-console`n  console.log('ProtectedRoute - Usuario autenticado, mostrando contenido');
  return <>{children}</>;
}
