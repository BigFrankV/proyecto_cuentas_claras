import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

const ConsumosPage = dynamic(
  () => import('@/components/consumos/ConsumosPage'),
  { ssr: false },
);

export default function ConsumosRoute() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Consumos — Cuentas Claras</title>
      </Head>

      <Layout>
        <ConsumosPage />
      </Layout>
    </ProtectedRoute>
  );
}
