import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/components.css';
import '@/styles/comunidades.css';
import '@/styles/map-section.css';
import '@/lib/console-filters'; // Filtros para limpiar consola en desarrollo
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/useAuth';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Dinamically import Bootstrap JS to avoid SSR issues
    import('bootstrap/dist/js/bootstrap.bundle.min.js' as any);
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
