import Head from 'next/head';

import CargosListado from '@/components/cargos/CargosListadoSimple';
import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

export default function CargosPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Cargos — Cuentas Claras</title>
      </Head>

      <Layout title='Lista de Cargos'>
        <CargosListado />
      </Layout>
    </ProtectedRoute>
  );
}
