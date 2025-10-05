import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import authService from './auth';
import { User, Role, AuthResponse } from '@/types/profile';

// ============================================
// INTERFACE DEL CONTEXTO
// ============================================

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Métodos de autenticación
  login: (identifier: string, password: string) => Promise<AuthResponse>;
  complete2FALogin: (tempToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Helpers de permisos
  hasRole: (roleSlug: string, comunidadId?: number) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasComunidadAccess: (comunidadId: number) => boolean;
  getRolesByComunidad: (comunidadId: number) => Role[];
}

// ============================================
// CREAR CONTEXTO
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ============================================
  // INICIALIZAR AL CARGAR
  // ============================================

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      console.log('🔄 Inicializando autenticación...');

      // Obtener token y usuario de localStorage
      const storedToken = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        console.log('📦 Sesión encontrada en localStorage:', {
          username: storedUser.username,
          is_admin: storedUser.is_admin,
          roles: storedUser.roles?.length || 0,
          memberships: storedUser.memberships?.length || 0
        });

        setToken(storedToken);
        setUser(storedUser);

        // Verificar que el token siga válido
        if (authService.isAuthenticated()) {
          console.log('✅ Token válido');

          // Refrescar datos del usuario desde el servidor
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              console.log('✅ Datos actualizados desde servidor');
              setUser(currentUser);
            }
          } catch (error) {
            console.warn('⚠️ Error actualizando datos, usando caché');
          }
        } else {
          console.warn('⚠️ Token expirado - Limpiando sesión');
          await handleLogout();
        }
      } else {
        console.log('ℹ️ No hay sesión guardada');
      }
    } catch (error) {
      console.error('❌ Error inicializando auth:', error);
      await handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGIN
  // ============================================

  const login = async (identifier: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('🔐 Iniciando login...');

      const response = await authService.login({ identifier, password });

      // Si requiere 2FA, devolver la respuesta sin actualizar estado
      if (response.twoFactorRequired) {
        console.log('🔐 Se requiere verificación 2FA');
        return response;
      }

      // Login exitoso sin 2FA
      if (response.token && response.user) {
        console.log('✅ Login exitoso:', {
          username: response.user.username,
          is_admin: response.user.is_admin,
          roles: response.user.roles?.length || 0,
          memberships: response.user.memberships?.length || 0
        });

        setToken(response.token);
        setUser(response.user);

        // Redirigir al dashboard
        router.push('/dashboard');
      }

      return response;

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  // ============================================
  // COMPLETAR LOGIN CON 2FA
  // ============================================

  const complete2FALogin = async (tempToken: string, code: string): Promise<void> => {
    try {
      console.log('🔐 Verificando código 2FA...');

      const response = await authService.complete2FALogin(tempToken, code);

      if (response.token && response.user) {
        console.log('✅ Login 2FA exitoso:', {
          username: response.user.username,
          is_admin: response.user.is_admin
        });

        setToken(response.token);
        setUser(response.user);

        // Redirigir al dashboard
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error('❌ Error verificando 2FA:', error);
      throw error;
    }
  };

  // ============================================
  // LOGOUT
  // ============================================

  const logout = async (): Promise<void> => {
    await handleLogout();
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Cerrando sesión...');

      // Llamar al logout del servicio
      await authService.logout();

      // Limpiar estado
      setUser(null);
      setToken(null);

      console.log('✅ Sesión cerrada');

      // Redirigir a login
      router.push('/login');

    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Limpiar estado de todas formas
      setUser(null);
      setToken(null);
      router.push('/login');
    }
  };

  // ============================================
  // REFRESH USER
  // ============================================

  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 Actualizando datos del usuario...');

      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        console.log('✅ Datos actualizados:', {
          username: currentUser.username,
          roles: currentUser.roles?.length || 0,
          memberships: currentUser.memberships?.length || 0
        });

        setUser(currentUser);
      } else {
        console.warn('⚠️ No se pudo obtener usuario actualizado');
      }

    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
    }
  };

  // ============================================
  // HELPERS DE PERMISOS
  // ============================================

  const hasRole = (roleSlug: string, comunidadId?: number): boolean => {
    return authService.hasRole(user, roleSlug, comunidadId);
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin(user);
  };

  const isSuperAdmin = (): boolean => {
    return authService.isSuperAdmin(user);
  };

  const hasComunidadAccess = (comunidadId: number): boolean => {
    return authService.hasComunidadAccess(user, comunidadId);
  };

  const getRolesByComunidad = (comunidadId: number): Role[] => {
    return authService.getRolesByComunidad(user, comunidadId);
  };

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,

    // Métodos
    login,
    complete2FALogin,
    logout,
    refreshUser,

    // Helpers
    hasRole,
    isAdmin,
    isSuperAdmin,
    hasComunidadAccess,
    getRolesByComunidad,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK PARA USAR EL CONTEXTO
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
}

// ============================================
// COMPONENTE PARA PROTEGER RUTAS
// ============================================

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🔒 Ruta protegida - Redirigiendo a login');
      
      // Guardar ruta actual para volver después del login
      const currentPath = router.asPath;
      if (currentPath !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (mientras redirige)
  if (!isAuthenticated) {
    return null;
  }

  // Mostrar contenido protegido
  return <>{children}</>;
}

// ============================================
// COMPONENTE PARA PROTEGER POR ROL
// ============================================

export function RoleProtectedRoute({
  children,
  requiredRole,
  comunidadId,
  fallback,
}: {
  children: ReactNode;
  requiredRole: string;
  comunidadId?: number;
  fallback?: ReactNode;
}) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  const hasRequiredRole = hasRole(requiredRole, comunidadId);

  if (!hasRequiredRole) {
    console.warn(`🚫 Usuario sin rol requerido: ${requiredRole}`);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos suficientes para acceder a esta página.</p>
          <p>Se requiere el rol: <strong>{requiredRole}</strong></p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================
// COMPONENTE PARA PROTEGER SOLO ADMINS
// ============================================

export function AdminProtectedRoute({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    console.warn('🚫 Usuario sin permisos de administrador');
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Acceso Denegado</h4>
          <p>Solo administradores pueden acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================
// EXPORTS
// ============================================

export default useAuth;