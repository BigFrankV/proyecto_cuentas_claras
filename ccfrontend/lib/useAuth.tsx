import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import authService, { User, AuthResponse } from './auth'; // ✅ CORREGIR IMPORT

// Tipos para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, totp_code?: string) => Promise<AuthResponse>; // ✅ AGREGAR totp_code
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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔍 Verificando estado de autenticación...');
    
    // Debug del estado actual
    authService.debugAuthState();
    
    try {
      // Primero verificar si tenemos un token válido
      if (!authService.isAuthenticated()) {
        console.log('❌ No hay token válido o está expirado');
        setUser(null);
        return;
      }

      console.log('✅ Token válido encontrado en localStorage');
      
      // Intentar obtener datos del usuario desde localStorage
      const userData = authService.getUserData();
      if (userData) {
        console.log('✅ Datos de usuario encontrados en localStorage:', userData);
        // ✅ NUEVO: Log de memberships para debug
        if (userData.memberships) {
          console.log('🏢 Membresías del usuario:', userData.memberships);
        }
        setUser(userData);
        
        // Verificar con el servidor para sincronizar datos
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            console.log('✅ Usuario verificado con servidor:', currentUser);
            // ✅ NUEVO: Log de memberships actualizadas
            if (currentUser.memberships) {
              console.log('🏢 Membresías actualizadas del servidor:', currentUser.memberships);
            }
            // Actualizar datos con información completa del servidor
            const updatedUserData = { ...userData, ...currentUser };
            setUser(updatedUserData);
            // Actualizar localStorage con datos completos
            localStorage.setItem('user_data', JSON.stringify(updatedUserData));
          } else {
            console.log('⚠️ Servidor no reconoce el token, manteniendo datos locales');
          }
        } catch (serverError: any) {
          console.log('⚠️ Error verificando con servidor:', serverError.message);
          if (serverError.response?.status === 401) {
            console.log('❌ Token inválido según servidor, limpiando sesión');
            await logout();
            return;
          }
          // Si es otro tipo de error, mantener datos locales
          console.log('⚠️ Manteniendo sesión local por error de conectividad');
        }
      } else {
        console.log('❌ No se encontraron datos de usuario en localStorage');
        // Si hay token pero no datos de usuario, limpiar todo
        await logout();
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      // Si hay error, limpiar datos
      await logout();
    } finally {
      setIsLoading(false);
      console.log('🔍 Verificación de autenticación completada');
    }
  };

  // ✅ CORREGIR: Agregar soporte para totp_code opcional
  const login = async (identifier: string, password: string, totp_code?: string) => {
    console.log('🔐 Iniciando login para:', identifier);
    try {
      const response = await authService.login({ 
        identifier, 
        password 
      });
      
      console.log('✅ Login exitoso, datos recibidos:', response.user);
      // ✅ NUEVO: Log específico para memberships
      if (response.user?.memberships) {
        console.log('🏢 Membresías recibidas en login:', response.user.memberships);
      }
      if (response.user?.is_superadmin) {
        console.log('👑 Usuario identificado como SUPERADMIN');
      }
      if (response.user) {
        setUser(response.user);
        console.log('✅ Usuario establecido en contexto:', response.user);
      }
      return response; // Devolver la respuesta para manejar 2FA
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error; // Re-lanzar para que el componente maneje el error
    }
  };

  const complete2FALogin = async (tempToken: string, code: string) => {
    console.log('🔐 Completando login 2FA');
    try {
      const response = await authService.complete2FALogin(tempToken, code);
      console.log('✅ Login 2FA exitoso, datos recibidos:', response.user);
      // ✅ NUEVO: Log específico para memberships en 2FA
      if (response.user?.memberships) {
        console.log('🏢 Membresías recibidas en 2FA login:', response.user.memberships);
      }
      if (response.user) {
        setUser(response.user);
        console.log('✅ Usuario establecido en contexto:', response.user);
      }
    } catch (error) {
      console.error('❌ Error en login 2FA:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Iniciando proceso de logout...');
    try {
      await authService.logout();
      console.log('✅ Logout exitoso en servidor');
    } catch (error) {
      console.error('❌ Error en logout del servidor:', error);
    } finally {
      console.log('🧹 Limpiando estado local...');
      setUser(null);
      console.log('🏠 Redirigiendo a página de inicio...');
      router.push('/');
    }
  };

  const refreshUser = async () => {
    console.log('🔄 Refrescando datos de usuario...');
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        console.log('✅ Datos de usuario actualizados:', currentUser);
        // ✅ NUEVO: Log de memberships actualizadas
        if (currentUser.memberships) {
          console.log('🏢 Membresías actualizadas:', currentUser.memberships);
        }
        setUser(currentUser);
        // Actualizar localStorage
        localStorage.setItem('user_data', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('❌ Error refrescando usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
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
    console.log(
      '🔒 ProtectedRoute - autenticado:',
      isAuthenticated,
      'cargando:',
      isLoading
    );
    if (!isLoading && !isAuthenticated) {
      console.log('❌ No autenticado, redirigiendo a login...');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    console.log('⏳ ProtectedRoute - Mostrando spinner de carga...');
    return (
      <div className='d-flex justify-content-center align-items-center min-vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log(
      '❌ ProtectedRoute - Usuario no autenticado, no mostrando contenido'
    );
    return null;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido');
  return <>{children}</>;
}