import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import profileService from '@/lib/profileService';
import { useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';

export default function MobileNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const { user } = useAuth();
  const { getUserRoleName } = usePermissions();

  useEffect(() => {
    if (user) {
      const loadProfilePhoto = async () => {
        try {
          const photoUrl = await profileService.getProfilePhoto();
          setProfilePhoto(photoUrl);
        } catch (error) {
          setProfilePhoto(null);
        }
      };
      loadProfilePhoto();
    } else {
      setProfilePhoto(null);
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (sidebar && backdrop) {
      sidebar.classList.toggle('show');
      backdrop.classList.toggle('show');
    }
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className='navbar navbar-dark bg-primary d-flex d-lg-none'>
        <div className='container-fluid'>
          <button
            className='navbar-toggler border-0'
            type='button'
            onClick={toggleSidebar}
            aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon'></span>
          </button>

          <Link href='/dashboard' className='navbar-brand me-auto'>
            <span className='material-icons align-middle me-1'>apartment</span>
            Cuentas Claras
          </Link>

          <div className='dropdown'>
            <button
              className='btn btn-link text-white p-0 d-flex align-items-center'
              type='button'
              id='userDropdownMobile'
              data-bs-toggle='dropdown'
              aria-expanded='false'
            >
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt='Foto de perfil'
                  className='avatar me-2'
                  width={36}
                  height={36}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
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
                    borderRadius: '50%',
                  }}
                >
                  {user?.persona?.nombres && user?.persona?.apellidos
                    ? `${user.persona.nombres.charAt(0)}${user.persona.apellidos.charAt(0)}`.toUpperCase()
                    : user?.username
                      ? user.username.substring(0, 2).toUpperCase()
                      : 'U'}
                </div>
              )}
              <div className='d-flex flex-column align-items-start d-none d-sm-block'>
                <span className='small fw-semibold'>
                  {user?.persona?.nombres && user?.persona?.apellidos
                    ? `${user.persona.nombres} ${user.persona.apellidos}`
                    : user?.username || 'Usuario'}
                </span>
                <span
                  className={`badge ${user?.is_superadmin ? 'bg-warning text-dark' : 'bg-primary text-white'}`}
                  style={{ fontSize: '0.5rem' }}
                >
                  {getUserRoleName().toUpperCase()}
                </span>
              </div>
            </button>
            <ul
              className='dropdown-menu dropdown-menu-end'
              aria-labelledby='userDropdownMobile'
            >
              <li>
                <Link className='dropdown-item' href='/mi-perfil'>
                  Perfil
                </Link>
              </li>
              <li>
                <button
                  type='button'
                  className='dropdown-item'
                  onClick={() => {
                    /* TODO: implementar configuración */
                  }}
                >
                  Configuración
                </button>
              </li>
              <li>
                <hr className='dropdown-divider' />
              </li>
              <li>
                <Link className='dropdown-item' href='/login'>
                  Cerrar sesión
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Backdrop for mobile sidebar */}
      <div
        className='sidebar-backdrop'
        id='sidebar-backdrop'
        onClick={toggleSidebar}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleSidebar();
          }
        }}
        role='button'
        tabIndex={0}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'none',
        }}
      />

      <style jsx>{`
        .sidebar-backdrop.show {
          display: block !important;
        }

        @media (min-width: 992px) {
          .main-content {
            margin-left: 280px;
          }
        }
      `}</style>
    </>
  );
}
