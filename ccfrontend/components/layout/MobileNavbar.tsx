import Link from 'next/link';
import { useState } from 'react';

export default function MobileNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              className='btn btn-link text-white p-0'
              type='button'
              id='userDropdownMobile'
              data-bs-toggle='dropdown'
              aria-expanded='false'
            >
              <div
                className='avatar'
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
                PC
              </div>
            </button>
            <ul
              className='dropdown-menu dropdown-menu-end'
              aria-labelledby='userDropdownMobile'
            >
              <li>
                <Link className='dropdown-item' href='/profile'>
                  Perfil
                </Link>
              </li>
              <li>
                <a className='dropdown-item' href='#'>
                  Configuración
                </a>
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

