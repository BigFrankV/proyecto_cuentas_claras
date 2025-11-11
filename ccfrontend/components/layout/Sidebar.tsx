import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import profileService from '@/lib/profileService';
import { useAuth } from '@/lib/useAuth';
import {
  usePermissions,
  PermissionGuard,
  Permission,
} from '@/lib/usePermissions';

// Definición de las secciones del menú (igual, pero con permisos asociados)
const menuSections = [
  {
    title: 'Dashboard',
    items: [
      { href: '/dashboard', label: 'Panel Principal', icon: 'dashboard', permission: Permission.VIEW_COMMUNITIES }, // Todos ven dashboard
      { href: '/reportes', label: 'Reportes', icon: 'bar_chart', permission: Permission.VIEW_REPORTS },
    ],
  },
  {
    title: 'Estructura',
    items: [
      { href: '/comunidades', label: 'Comunidades', icon: 'domain', permission: Permission.VIEW_COMMUNITIES },
      { href: '/edificios', label: 'Edificios', icon: 'business', permission: Permission.VIEW_COMMUNITIES },
      { href: '/torres', label: 'Torres', icon: 'location_city', permission: Permission.VIEW_COMMUNITIES },
      { href: '/unidades', label: 'Unidades', icon: 'apartment', permission: Permission.VIEW_COMMUNITIES },
    ],
  },
  {
    title: 'Residentes',
    items: [
      { href: '/personas', label: 'Personas', icon: 'people', permission: Permission.VIEW_USERS },
      { href: '/membresias', label: 'Membresías', icon: 'card_membership', permission: Permission.VIEW_USERS },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { href: '/emisiones', label: 'Emisiones', icon: 'receipt_long', permission: Permission.VIEW_FINANCES },
      { href: '/cargos', label: 'Cargos', icon: 'assignment', permission: Permission.VIEW_FINANCES },
      { href: '/pagos', label: 'Pagos', icon: 'payments', permission: Permission.VIEW_FINANCES },
      { href: '/conciliaciones', label: 'Conciliaciones', icon: 'account_balance', permission: Permission.APPROVE_PAYMENTS },
    ],
  },
  {
    title: 'Gastos',
    items: [
      { href: '/gastos', label: 'Gastos', icon: 'shopping_cart', permission: Permission.MANAGE_FINANCES },
      { href: '/categorias-gasto', label: 'Categorías', icon: 'category', permission: Permission.MANAGE_FINANCES },
      { href: '/centros-costo', label: 'Centros de Costo', icon: 'account_balance_wallet', permission: Permission.MANAGE_FINANCES },
      { href: '/proveedores', label: 'Proveedores', icon: 'store', permission: Permission.MANAGE_FINANCES },
      { href: '/compras', label: 'Compras', icon: 'inventory', permission: Permission.MANAGE_FINANCES },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { href: '/medidores', label: 'Medidores', icon: 'speed', permission: Permission.VIEW_COMMUNITIES }, // Todos ven, pero conserje edita
      { href: '/lecturas', label: 'Lecturas', icon: 'visibility', permission: Permission.VIEW_COMMUNITIES },
      { href: '/consumos', label: 'Consumos', icon: 'water_drop', permission: Permission.VIEW_FINANCES },
      { href: '/tarifas', label: 'Tarifas', icon: 'price_change', permission: Permission.MANAGE_FINANCES },
    ],
  },
  {
    title: 'Amenidades',
    items: [
      { href: '/amenidades', label: 'Lista de Amenidades', icon: 'pool', permission: Permission.MANAGE_AMENITIES },
      { href: '/amenidades-reservas', label: 'Reservas', icon: 'event_available', permission: Permission.VIEW_COMMUNITIES },
      { href: '/amenidades-calendario', label: 'Calendario', icon: 'calendar_month', permission: Permission.VIEW_COMMUNITIES },
    ],
  },
  {
    title: 'Sanciones',
    items: [
      { href: '/multas', label: 'Multas', icon: 'gavel', permission: Permission.VIEW_FINANCES },
      { href: '/multas-nueva', label: 'Nueva Multa', icon: 'add_circle', permission: Permission.MANAGE_MULTAS },
      { href: '/apelaciones', label: 'Apelaciones', icon: 'gavel', permission: Permission.VIEW_FINANCES },
      { href: '/apelaciones-nueva', label: 'Nueva Apelación', icon: 'add_circle_outline', permission: Permission.VIEW_FINANCES },
    ],
  },
  {
    title: 'Comunicación',
    items: [
      { href: '/tickets', label: 'Tickets', icon: 'support_agent', permission: Permission.VIEW_TICKETS },
      { href: '/notificaciones', label: 'Notificaciones', icon: 'notifications', permission: Permission.VIEW_COMMUNITIES },
      { href: '/documentos', label: 'Documentos', icon: 'folder', permission: Permission.VIEW_COMMUNITIES },
      { href: '/bitacora', label: 'Bitácora', icon: 'history', permission: Permission.VIEW_USERS },
    ],
  },
  {
    title: 'Utilidades',
    items: [
      { href: '/util-uf', label: 'Valor UF', icon: 'trending_up', permission: Permission.VIEW_COMMUNITIES }, // Todos
      { href: '/util-utm', label: 'Valor UTM', icon: 'calculate', permission: Permission.VIEW_COMMUNITIES },
      { href: '/util-rut', label: 'Validador RUT', icon: 'verified_user', permission: Permission.VIEW_COMMUNITIES },
    ],
  },
];

// Mapeo de roles a español
const roleTranslations: Record<string, string> = {
  superuser: 'Superusuario',
  admin: 'Administrador',
  concierge: 'Conserje',
  accountant: 'Contador',
  tesorero: 'Tesorero',              // Agregar
  presidente_comite: 'Presidente Comité', // Agregar
  proveedor_servicio: 'Proveedor Servicio', // Agregar
  residente: 'Residente',            // Agregar
  propietario: 'Propietario',        // Agregar
  inquilino: 'Inquilino',            // Agregar
  user: 'Usuario',
};

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { hasPermission, currentRole } = usePermissions(); // Usar permisos dinámicos
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Función para determinar si una sección debe mostrarse (usando permisos)
  const shouldShowSection = (sectionTitle: string) => {
    // Superadmin ve todo
    if (user?.is_superadmin) {return true;}

    // Verificar si al menos un item de la sección tiene permiso
    const section = menuSections.find(s => s.title === sectionTitle);
    return section?.items.some(item => hasPermission(item.permission)) || false;
  };

  // Función para determinar si un item debe mostrarse (usando permisos)
  const shouldShowItem = (item: any) => {
    return hasPermission(item.permission);
  };

  const isActive = (href: string) => {
    // Comparar si la ruta actual comienza con el href del menú
    // Esto permite que subsecciones también destaquen el menú principal
    // Ejemplo: /centros-costo/nuevo coincide con /centros-costo
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Traducción del rol actual a español
  const currentRoleSpanish = roleTranslations[currentRole] || currentRole;

  // Cargar foto de perfil cuando el usuario cambie
  useEffect(() => {
    if (user) {
      const loadProfilePhoto = async () => {
        try {
          const photoUrl = await profileService.getProfilePhoto();
          setProfilePhoto(photoUrl);
        } catch (error) {
          // Si hay error, dejar como null (mostrará iniciales)
          setProfilePhoto(null);
        }
      };
      loadProfilePhoto();
    } else {
      setProfilePhoto(null);
    }
  }, [user]);

  return (
    <>
      <div
        className={`sidebar d-flex flex-column flex-shrink-0 p-3 text-white bg-dark ${isCollapsed ? 'collapsed' : ''}`}
        id='sidebar'
        style={{
          background: '#004AAD !important',
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
          {profilePhoto ? (
            <Image
              src={profilePhoto}
              alt="Foto de perfil"
              className='avatar me-2'
              width={36}
              height={36}
              style={{
                borderRadius: '8px',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          ) : (
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
                borderRadius: '8px',
              }}
            >
              {user?.persona?.nombres && user?.persona?.apellidos
                ? `${user.persona.nombres.charAt(0)}${user.persona.apellidos.charAt(0)}`.toUpperCase()
                : user?.username
                  ? user.username.substring(0, 2).toUpperCase()
                  : 'U'}
            </div>
          )}
          <div>
            <span className='d-block text-white'>
              {user?.persona?.nombres && user?.persona?.apellidos
                ? `${user.persona.nombres} ${user.persona.apellidos}`
                : user?.username || 'Usuario'}
              {user?.is_superadmin ? (
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
                  {currentRoleSpanish?.toUpperCase()}
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
              // Filtrar items según permisos
              const visibleItems = section.items.filter(item => shouldShowItem(item));

              if (visibleItems.length === 0) {return null;}

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
                    {user?.is_superadmin && section.title === 'Dashboard' && (
                      <span
                        className='badge bg-warning text-dark ms-2'
                        style={{ fontSize: '0.6rem' }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>

                  {/* Items de navegación con PermissionGuard */}
                  <ul className='nav nav-sidebar flex-column'>
                    {visibleItems.map(item => (
                      <li className='nav-item' key={item.href}>
                        <PermissionGuard
                          permission={item.permission}
                          fallback={
                            <div
                              className='nav-link disabled'
                              title='No tienes permisos para acceder a esta sección'
                              style={{ color: 'rgba(255,255,255,0.5)', cursor: 'not-allowed' }}
                            >
                              <span className='material-icons align-middle me-2'>{item.icon}</span>
                              <span>{item.label}</span>
                            </div>
                          }
                        >
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
                        </PermissionGuard>
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
          <button
            type='button'
            className='d-flex align-items-center text-white text-decoration-none dropdown-toggle bg-transparent border-0 w-100'
            id='userDropdown'
            data-bs-toggle='dropdown'
          >
            <span className='material-icons me-2'>settings</span>
            <span>Configuración</span>
          </button>
          <ul
            className='dropdown-menu dropdown-menu-dark'
            aria-labelledby='userDropdown'
          >
            <li>
              <Link className='dropdown-item' href='/mi-perfil'>
                Mi Perfil
              </Link>
            </li>
            {/* Solo administradores pueden ver Parámetros */}
            {user?.is_superadmin && (
              <li>
                <Link className='dropdown-item' href='/parametros'>
                  Parámetros
                </Link>
              </li>
            )}
            <li>
              <button type='button' className='dropdown-item'>
                Preferencias
              </button>
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
