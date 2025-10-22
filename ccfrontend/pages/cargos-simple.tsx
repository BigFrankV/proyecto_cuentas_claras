import Head from 'next/head';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

import CargosListado from '../components/cargos/CargosListadoSimple';

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