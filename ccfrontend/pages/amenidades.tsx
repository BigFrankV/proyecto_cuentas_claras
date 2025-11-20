/* eslint-disable max-len */
import dynamic from 'next/dynamic';
import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

const AmenidadesPage = dynamic(
  () => import('@/components/amenidades/AmenidadesPage'),
  { ssr: false },
);

export default function AmenidadesListado() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Amenidades — Cuentas Claras</title>
      </Head>

      <Layout>
        <AmenidadesPage />
      </Layout>
    </ProtectedRoute>
  );
}
