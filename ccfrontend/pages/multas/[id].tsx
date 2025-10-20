import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Layout from '@/components/layout/Layout';
import MultaDetallePage from '@/components/multas/MultaDetallePage';
import multasService from '@/lib/multasService'; // ajusta path si es distinto
import { ProtectedRoute } from '@/lib/useAuth';
import { Multa } from '@/types/multas';

const MultaDetalleRoute: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [multa, setMulta] = useState<Multa | null>(null);
  const [historial, setHistorial] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await multasService.getMulta(parseInt(id as string, 10));
        const hist = await multasService.obtenerHistorial(parseInt(id as string, 10));
        if (!mounted) {
          return;
        }
        setMulta(res); // getMulta ya devuelve el objeto adaptado
        setHistorial(Array.isArray(hist) ? hist : ((hist as {data?: unknown[]})?.data ?? []));
      } catch {
        // Error cargando multa
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout title='Cargando...' noGutter>
        <div className='p-4'>Cargando...</div>
      </Layout>
    );
  }
  if (!multa) {
    return (
      <Layout title='Multa no encontrada'>
        <div className='p-4'>Multa no encontrada</div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title={`Detalle de Multa ${multa.numero}`} noGutter>
        <MultaDetallePage multa={multa} historial={historial} />
      </Layout>
    </ProtectedRoute>
  );
};

export default MultaDetalleRoute;
