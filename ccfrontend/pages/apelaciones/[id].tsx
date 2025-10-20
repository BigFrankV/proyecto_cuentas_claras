import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import ApelacionDetail from '@/components/apelaciones/ApelacionDetail';
import Layout from '@/components/layout/Layout';
import { getApelacion } from '@/lib/apelacionesService';
import api from '@/lib/api'; // axios client que incluye cookies o token
import { ProtectedRoute, useAuth } from '@/lib/useAuth';

export const getStaticPaths: GetStaticPaths = async () => {
  // Para static export, retornamos un array vacío
  // Las páginas dinámicas se generarán bajo demanda (ISR no disponible con export)
  return {
    paths: [],
    fallback: true, // En client-side, se renderizará la página después de generar
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const id = ctx.params?.id;
  try {
    // Sin contexto de request, usamos la API directamente
    // Nota: En static generation no tenemos acceso a cookies del usuario
    const res = await api.get(`/apelaciones/${id}`);
    const data = res.data?.data ?? res.data;
    return {
      props: { inicialApelacion: data },
      revalidate: 60, // Revalidar cada 60 segundos (aunque con export es ignorado)
    };
  } catch {
    return { notFound: true };
  }
};

export default function ApelacionDetallePage({ inicialApelacion }: any) {
  const router = useRouter();
  const { id } = router.query;
  useAuth(); // Hook para verificar autenticación
  const [apelacion, setApelacion] = useState<any>(inicialApelacion ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token') || '';
        const r = await getApelacion(Number(id), token);
        setApelacion(r?.data ?? r);
      } catch {
        // Error fetching apelacion
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
              const token = localStorage.getItem('auth_token') || '';
              const r = await getApelacion(Number(id), token);
              setApelacion(r);
            }}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
