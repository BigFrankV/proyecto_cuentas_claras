import dynamic from 'next/dynamic';
import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

const AmenidadesCalendarioPage = dynamic(
  () => import('../components/amenidades/AmenidadesCalendarioPage'),
  { ssr: false },
);

export default function AmenidadesCalendario() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Amenidades - Calendario — Cuentas Claras</title>
      </Head>

      <Layout>
        <AmenidadesCalendarioPage />
      </Layout>
    </ProtectedRoute>
  );
}
