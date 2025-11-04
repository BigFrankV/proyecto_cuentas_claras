import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/components.css';
import '@/styles/comunidades.css';
import '@/styles/map-section.css';
import '@/styles/compras.css';
import '@/styles/amenidades.css';
import '@/styles/amenidades-reservas.css';
import '@/styles/multas.css';
import '@/styles/apelaciones.css';
import '@/styles/medidores.css';
// import '@/styles/utm-consultor.css';
import '@/lib/console-filters'; // Filtros para limpiar consola en desarrollo
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/useAuth';
import { setAxiosAuthToken } from '@/lib/multasService';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Dinamically import Bootstrap JS to avoid SSR issues
    import('bootstrap/dist/js/bootstrap.bundle.min.js' as any);

    // Configurar token de axios al iniciar (y reaccionar ante cambios en localStorage)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setAxiosAuthToken(token);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') setAxiosAuthToken(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
