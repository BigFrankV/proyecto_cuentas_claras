import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import ApelacionDetail from '@/components/apelaciones/ApelacionDetail';
import Layout from '@/components/layout/Layout';
import { getApelacion } from '@/lib/apelacionesService';
import api from '@/lib/api'; // axios client que incluye cookies o token
import { ProtectedRoute, useAuth } from '@/lib/useAuth';

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { id } = ctx.params;
  const cookie = ctx.req.headers.cookie || '';
  try {
    const res = await api.get(`/apelaciones/${id}`, { headers: { cookie } });
    const data = res.data?.data ?? res.data;
    // puedes verificar rol del usuario desde la sesión (si tu backend devuelve user en sesión)
    // si no autorizado:
    // return { redirect: { destination: '/login', permanent: false } };
    return { props: { inicialApelacion: data } };
  } catch (err) {
    return { notFound: true };
  }
};

export default function ApelacionDetallePage({ inicialApelacion }: any) {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [apelacion, setApelacion] = useState<any>(inicialApelacion ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const r = await getApelacion(Number(id), token);
        setApelacion(r?.data ?? r);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('getApelacion.error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  if (loading || !apelacion) {
    return (
      <ProtectedRoute>
        <Layout title='Apelación'>
          <div className='p-4'>Cargando...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title={`Apelación #${apelacion.id}`}>
        <div className='container p-4'>
          <div className='mb-3'>
            <button
              className='btn btn-link'
              onClick={() => router.push('/apelaciones')}
            >
              ← Volver a lista
            </button>
          </div>

          <ApelacionDetail
            apelacion={apelacion}
            onResolved={async () => {
              // refrescar después de resolver
              const r = await getApelacion(Number(id), token);
              setApelacion(r);
            }}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
