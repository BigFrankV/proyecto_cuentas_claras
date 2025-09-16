import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import authService, { User } from '@/lib/auth';

// Tipos para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
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
    try {
      if (authService.isAuthenticated()) {
        console.log('✅ Token encontrado en localStorage');
        const userData = authService.getUserData();
        if (userData) {
          console.log('✅ Datos de usuario encontrados:', userData);
          setUser(userData);
          // Opcionalmente, verificar con el servidor
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              console.log('✅ Usuario verificado con servidor:', currentUser);
              setUser(currentUser);
            }
          } catch (serverError) {
            console.log(
              '⚠️ Error verificando con servidor, usando datos locales'
            );
          }
        } else {
          console.log('❌ No se encontraron datos de usuario');
        }
      } else {
        console.log('❌ No hay token de autenticación');
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

  const login = async (username: string, password: string) => {
    console.log('🔐 Iniciando login para:', username);
    try {
      const response = await authService.login({ username, password });
      console.log('✅ Login exitoso, datos recibidos:', response.user);
      setUser(response.user);
      console.log('✅ Usuario establecido en contexto:', response.user);
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error; // Re-lanzar para que el componente maneje el error
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
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
