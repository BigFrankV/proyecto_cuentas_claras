import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { getApelacion } from '@/lib/apelacionesService';
import Layout from '@/components/layout/Layout';
import ApelacionDetail from '@/components/apelaciones/ApelacionDetail';

export default function ApelacionDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [apelacion, setApelacion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const r = await getApelacion(Number(id), token);
        setApelacion(r);
      } catch (err) {
        console.error('getApelacion.error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  if (loading || !apelacion) {
    return (
      <ProtectedRoute>
        <Layout title="Apelación">
          <div className="p-4">Cargando...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title={`Apelación #${apelacion.id}`}>
        <div className="container p-4">
          <div className="mb-3">
            <button className="btn btn-link" onClick={() => router.push('/apelaciones')}>← Volver a lista</button>
          </div>

          <ApelacionDetail apelacion={apelacion} onResolved={async () => {
            // refrescar después de resolver
            const r = await getApelacion(Number(id), token);
            setApelacion(r);
          }} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}