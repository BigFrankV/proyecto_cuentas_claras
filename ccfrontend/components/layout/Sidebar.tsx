import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';
import { getUserRole } from '@/lib/roles';
import {
  usePermissions,
  PermissionGuard,
  Permission,
} from '@/lib/usePermissions';

// Definición de las secciones del menú
const menuSections = [
  {
    title: 'Dashboard',
    items: [
      { href: '/dashboard', label: 'Panel Principal', icon: 'dashboard' },
      { href: '/reportes', label: 'Reportes', icon: 'bar_chart' },
    ],
  },
  {
    title: 'Estructura',
    items: [
      { href: '/comunidades', label: 'Comunidades', icon: 'domain' },
      { href: '/edificios', label: 'Edificios', icon: 'business' },
      { href: '/torres', label: 'Torres', icon: 'location_city' },
      { href: '/unidades', label: 'Unidades', icon: 'apartment' },
    ],
  },
  {
    title: 'Residentes',
    items: [
      { href: '/personas', label: 'Personas', icon: 'people' },
      { href: '/membresias', label: 'Membresías', icon: 'card_membership' },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { href: '/emisiones', label: 'Emisiones', icon: 'receipt_long' },
      { href: '/cargos', label: 'Cargos', icon: 'assignment' },
      { href: '/pagos', label: 'Pagos', icon: 'payments' },
      {
        href: '/conciliaciones',
        label: 'Conciliaciones',
        icon: 'account_balance',
      },
    ],
  },
  {
    title: 'Gastos',
    items: [
      { href: '/gastos', label: 'Gastos', icon: 'shopping_cart' },
      { href: '/categorias-gasto', label: 'Categorías', icon: 'category' },
      {
        href: '/centros-costo',
        label: 'Centros de Costo',
        icon: 'account_balance_wallet',
      },
      { href: '/proveedores', label: 'Proveedores', icon: 'store' },
      { href: '/compras', label: 'Compras', icon: 'inventory' },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { href: '/medidores', label: 'Medidores', icon: 'speed' },
      { href: '/lecturas', label: 'Lecturas', icon: 'visibility' },
      { href: '/consumos', label: 'Consumos', icon: 'water_drop' },
      { href: '/tarifas', label: 'Tarifas', icon: 'price_change' },
    ],
  },
  {
    title: 'Amenidades',
    items: [
      { href: '/amenidades', label: 'Amenidades', icon: 'pool' },
      { href: '/reservas', label: 'Reservas', icon: 'event_available' },
      { href: '/calendario', label: 'Calendario', icon: 'calendar_month' },
    ],
  },
  {
    title: 'Sanciones',
    items: [{ href: '/multas', label: 'Multas', icon: 'gavel' }],
  },
  {
    title: 'Comunicación',
    items: [
      { href: '/tickets', label: 'Tickets', icon: 'support_agent' },
      {
        href: '/notificaciones',
        label: 'Notificaciones',
        icon: 'notifications',
      },
      { href: '/documentos', label: 'Documentos', icon: 'folder' },
      { href: '/bitacora', label: 'Bitácora', icon: 'history' },
    ],
  },
  {
    title: 'Utilidades',
    items: [
      { href: '/util-uf', label: 'Valor UF', icon: 'trending_up' },
      { href: '/util-utm', label: 'Valor UTM', icon: 'calculate' },
      { href: '/util-rut', label: 'Validador RUT', icon: 'verified_user' },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isSuperUser, hasPermission, currentRole } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función para determinar si una sección debe mostrarse según permisos
  const shouldShowSection = (sectionTitle: string) => {
    if (isSuperUser()) return true; // Superuser ve todo

    switch (sectionTitle) {
      case 'Dashboard':
        return true; // Todos pueden ver el dashboard
      case 'Estructura':
        return hasPermission(Permission.VIEW_COMMUNITIES);
      case 'Residentes':
        return hasPermission(Permission.VIEW_USERS);
      case 'Finanzas':
        return hasPermission(Permission.VIEW_FINANCES);
      case 'Gastos':
        return hasPermission(Permission.VIEW_FINANCES); // Gastos también son finanzas
      case 'Servicios':
        return hasPermission(Permission.VIEW_COMMUNITIES); // Servicios de comunidades
      case 'Amenidades':
        return hasPermission(Permission.VIEW_COMMUNITIES); // Amenidades de comunidades
      case 'Sanciones':
        return hasPermission(Permission.VIEW_USERS); // Sanciones a usuarios
      case 'Comunicación':
        return true; // Comunicación básica para todos
      case 'Utilidades':
        return hasPermission(Permission.VIEW_REPORTS); // Acceso a herramientas de utilidad
      default:
        return false;
    }
  };

  // Función para determinar si un item específico debe mostrarse
  const shouldShowItem = (href: string) => {
    if (isSuperUser()) return true;

    // Mapeo específico de rutas a permisos
    const routePermissions: { [key: string]: Permission } = {
      '/reportes': Permission.VIEW_REPORTS,
      '/comunidades': Permission.VIEW_COMMUNITIES,
      '/edificios': Permission.VIEW_COMMUNITIES,
      '/torres': Permission.VIEW_COMMUNITIES,
      '/unidades': Permission.VIEW_COMMUNITIES,
      '/personas': Permission.VIEW_USERS,
      '/membresias': Permission.VIEW_USERS,
      '/emisiones': Permission.VIEW_FINANCES,
      '/cargos': Permission.VIEW_FINANCES,
      '/pagos': Permission.VIEW_FINANCES,
      '/conciliaciones': Permission.VIEW_FINANCES,
      '/gastos': Permission.VIEW_FINANCES,
      '/categorias-gasto': Permission.VIEW_FINANCES,
      '/centros-costo': Permission.VIEW_FINANCES,
      '/proveedores': Permission.VIEW_FINANCES,
      '/compras': Permission.VIEW_FINANCES,
      '/medidores': Permission.VIEW_COMMUNITIES,
      '/lecturas': Permission.VIEW_COMMUNITIES,
      '/consumos': Permission.VIEW_COMMUNITIES,
      '/tarifas': Permission.VIEW_COMMUNITIES,
      '/multas': Permission.VIEW_USERS,
    };

    const requiredPermission = routePermissions[href];
    return !requiredPermission || hasPermission(requiredPermission);
  };

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <div
        className={`sidebar d-flex flex-column flex-shrink-0 p-3 text-white bg-dark ${isCollapsed ? 'collapsed' : ''}`}
        id='sidebar'
        style={{
          background:
            'linear-gradient(180deg, var(--color-primary) 0%, #071a38 100%) !important',
          width: '280px',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          transform: 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Logo y título */}
        <Link
          href='/dashboard'
          className='d-flex align-items-center text-white text-decoration-none mb-4'
        >
          <span className='material-icons me-2' style={{ fontSize: '32px' }}>
            apartment
          </span>
          <span className='fs-4'>Cuentas Claras</span>
        </Link>

        {/* Información del usuario */}
        <div className='d-flex align-items-center mb-3 px-2'>
          <div
            className='avatar me-2'
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-accent)',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '50%',
            }}
          >
            {user?.persona?.nombres && user?.persona?.apellidos 
              ? `${user.persona.nombres.charAt(0)}${user.persona.apellidos.charAt(0)}`.toUpperCase()
              : user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <span className='d-block text-white'>
              {user?.persona?.nombres && user?.persona?.apellidos 
                ? `${user.persona.nombres} ${user.persona.apellidos}`
                : user?.username || 'Usuario'}
              {isSuperUser() ? (
                <span
                  className='badge bg-warning text-dark ms-1'
                  style={{ fontSize: '0.6rem' }}
                >
                  SUPERADMIN
                </span>
              ) : (
                <span
                  className='badge bg-secondary ms-1'
                  style={{ fontSize: '0.6rem' }}
                >
                  {getUserRole(user).toUpperCase()}
                </span>
              )}
            </span>
            <span className='small text-white-50'>
              {user?.email || 'Sin email configurado'}
            </span>
          </div>
        </div>

        <hr />

        {/* Navegación principal */}
        <div
          className='nav-sections'
          style={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {menuSections
            .filter(section => shouldShowSection(section.title))
            .map((section, sectionIndex) => {
              // Filtrar items de la sección según permisos
              const visibleItems = section.items.filter(item =>
                shouldShowItem(item.href)
              );

              // Si no hay items visibles, no mostrar la sección
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title}>
                  {/* Header de sección */}
                  <div
                    className='nav-section-header'
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding:
                        sectionIndex === 0
                          ? '1rem 1rem 0.5rem'
                          : '1.5rem 1rem 0.5rem',
                      marginBottom: '0.5rem',
                      ...(sectionIndex > 0 && {
                        marginTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                      }),
                    }}
                  >
                    {section.title}
                    {isSuperUser() && section.title === 'Dashboard' && (
                      <span
                        className='badge bg-warning text-dark ms-2'
                        style={{ fontSize: '0.6rem' }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>

                  {/* Items de navegación */}
                  <ul className='nav nav-sidebar flex-column'>
                    {visibleItems.map(item => (
                      <li className='nav-item' key={item.href}>
                        <Link
                          href={item.href}
                          className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                          style={{
                            color: 'rgba(255,255,255,0.8)',
                            ...(isActive(item.href) && {
                              color: '#fff',
                              background: 'rgba(253,93,20,0.2)',
                              borderLeft: '3px solid var(--color-accent)',
                            }),
                          }}
                        >
                          <span className='material-icons align-middle me-2'>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>

        <hr />

        {/* Menú de usuario */}
        <div className='dropdown'>
          <a
            href='#'
            className='d-flex align-items-center text-white text-decoration-none dropdown-toggle'
            id='userDropdown'
            data-bs-toggle='dropdown'
          >
            <span className='material-icons me-2'>settings</span>
            <span>Configuración</span>
          </a>
          <ul
            className='dropdown-menu dropdown-menu-dark'
            aria-labelledby='userDropdown'
          >
            <li>
              <Link className='dropdown-item' href='/profile'>
                Mi Perfil
              </Link>
            </li>
            <li>
              <Link className='dropdown-item' href='/parametros'>
                Parámetros
              </Link>
            </li>
            <li>
              <a className='dropdown-item' href='#'>
                Preferencias
              </a>
            </li>
            <li>
              <hr className='dropdown-divider' />
            </li>
            <li>
              <button
                className='dropdown-item text-danger'
                onClick={handleLogout}
                style={{
                  border: 'none',
                  background: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <i className='material-icons me-2'>logout</i>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* CSS específico para el sidebar */}
      <style jsx>{`
        .nav-sections::-webkit-scrollbar {
          display: none;
        }

        .nav-sidebar .nav-item .nav-link:hover {
          color: #fff !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .nav-sidebar .nav-item .nav-link.active .material-icons {
          color: var(--color-accent) !important;
        }

        @media (min-width: 992px) {
          .sidebar {
            transform: translateX(0) !important;
          }
        }

        .sidebar.show {
          transform: translateX(0) !important;
        }
      `}</style>
    </>
  );
}
