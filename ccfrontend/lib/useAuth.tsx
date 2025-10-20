import { useRouter } from 'next/router';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useRef, // <-- agregado
} from 'react';

import authService, { User, AuthResponse } from './auth'; // ✅ CORREGIR IMPORT

// Tipos para el contexto de autenticación
interface AuthContextType {
  user: User | null;
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
    checkAuthStatus();
  }, []);

  // normalizar estructura de usuario: memberships -> comunidades
  function normalizeUserData(u: any) {
    if (!u) return u;
    const copy = { ...u };
    try {
      if (!copy.comunidades && Array.isArray(copy.memberships)) {
        copy.comunidades = copy.memberships.map((m: any) => ({
          id: m.comunidadId ?? m.comunidad_id ?? m.comunidad,
          role: m.rol ?? m.role ?? m.role_name ?? m.rol_nombre ?? null,
        }));
      }
    } catch (e) {
      console.debug('useAuth: normalizeUserData error', e);
    }
    console.debug('useAuth - usuario normalizado:', copy);
    return copy;
  }

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
        const normalized = normalizeUserData(userData);
        console.log('✅ Datos de usuario encontrados en localStorage:', normalized);
        setUser(normalized);

        // Verificar con el servidor para sincronizar datos
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            const merged = { ...normalized, ...currentUser };
            const normalizedMerged = normalizeUserData(merged);
            console.log('✅ Usuario verificado con servidor:', normalizedMerged);
            setUser(normalizedMerged);
            localStorage.setItem('user_data', JSON.stringify(normalizedMerged));
          } else {
            console.log('⚠️ Servidor no reconoce el token, manteniendo datos locales');
          }
        } catch (serverError: any) {
          console.log('⚠️ Error verificando con servidor:', serverError.message);
          if (serverError.response?.status === 401) {
            console.log('❌ Token inválido según servidor, limpiando sesión local sin redirigir');
            await authService.logout();
            setUser(null);
            return;
          }
          console.log('⚠️ Manteniendo sesión local por error de conectividad');
        }
      } else {
        console.log('❌ No se encontraron datos de usuario en localStorage');
        await authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('🔍 Verificación de autenticación completada');
    }
  };

  // ✅ CORREGIR: Agregar soporte para totp_code opcional
  const login = async (
    identifier: string,
    password: string,
    totp_code?: string,
  ) => {
    console.log('🔐 Iniciando login para:', identifier);
    try {
      const response = await authService.login({
        identifier,
        password,
      });

      const normalized = normalizeUserData(response.user);
      console.log('✅ Login exitoso, usuario normalizado:', normalized);
      if (normalized) {
        setUser(normalized);
        localStorage.setItem('user_data', JSON.stringify(normalized));
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
      const normalized = normalizeUserData(response.user);
      console.log('✅ Login 2FA exitoso, usuario normalizado:', normalized);
      if (normalized) {
        setUser(normalized);
        localStorage.setItem('user_data', JSON.stringify(normalized));
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
      console.log('✅ Logout exitoso en servidor (o local cleanup hecho)');
    } catch (error) {
      console.error('❌ Error en logout del servidor:', error);
    } finally {
      console.log('🧹 Limpiando estado local...');
      setUser(null);
      console.log('🏠 Redirigiendo a página de inicio si es necesario...');
      if (router.pathname !== '/') {
        router.replace('/'); // usar replace para evitar historial y repetir pushes
      }
    }
  };

  const refreshUser = async () => {
    console.log('🔄 Refrescando datos de usuario...');
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const normalized = normalizeUserData(currentUser);
        console.log('✅ Datos de usuario actualizados:', normalized);
        setUser(normalized);
        localStorage.setItem('user_data', JSON.stringify(normalized));
      }
    } catch (error) {
      console.error('❌ Error refrescando usuario:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    // Considerar token válido además de existencia de user para evitar falsos positivos
    isAuthenticated: !!user && authService.isAuthenticated(),
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
  const redirectingRef = useRef(false); // <-- agregado

  useEffect(() => {
    console.log(
      '🔒 ProtectedRoute - autenticado:',
      isAuthenticated,
      'cargando:',
      isLoading,
    );
    if (!isLoading && !isAuthenticated && !redirectingRef.current) {
      console.log('❌ No autenticado, redirigiendo a login...');
      redirectingRef.current = true;
      if (router.pathname !== '/') {
        router.replace('/').finally(() => {
          // permitir futuras redirecciones cuando cambie la ruta
          redirectingRef.current = false;
        });
      } else {
        redirectingRef.current = false;
      }
    }
  }, [isAuthenticated, isLoading, router, router.pathname]);

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
      '❌ ProtectedRoute - Usuario no autenticado, no mostrando contenido',
    );
    return null;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido');
  return <>{children}</>;
}
