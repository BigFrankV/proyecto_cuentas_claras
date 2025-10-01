import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/lib/useAuth';
import Head from 'next/head';

const AmenidadesPage = dynamic(() => import('@/components/amenidades/AmenidadesPage'), { ssr: false });

export default function AmenidadesListado() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Amenidades — Cuentas Claras</title>
      </Head>

      <AmenidadesPage />
    </ProtectedRoute>
  );
}
