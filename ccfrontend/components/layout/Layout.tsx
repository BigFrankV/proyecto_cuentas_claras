import Head from 'next/head';
import { ReactNode } from 'react';

import MobileNavbar from './MobileNavbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({
  children,
  title = 'Cuentas Claras',
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name='description'
          content='Sistema de administración de comunidades'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>

      <div className='d-flex'>
        {/* Sidebar para desktop */}
        <Sidebar />

        {/* Contenido principal */}
        <div className='main-content flex-grow-1 bg-light'>
          {/* Navbar móvil */}
          <MobileNavbar />

          {/* Contenido */}
          <main>{children}</main>
        </div>
      </div>

      <style jsx>{`
        /* Layout responsive */
        @media (min-width: 992px) {
          .main-content {
            margin-left: 280px;
          }
        }

        @media (max-width: 991.98px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  );
}
