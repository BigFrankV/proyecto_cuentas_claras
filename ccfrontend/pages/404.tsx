import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { Button } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';

export default function Custom404() {
  const router = useRouter();

  return (
    <Layout title='Página no encontrada'>
      <Head>
        <title>404 - Página no encontrada | Cuentas Claras</title>
      </Head>

      <div
        className='d-flex flex-column align-items-center justify-content-center'
        style={{ minHeight: '60vh', textAlign: 'center' }}
      >
        <div className='mb-4'>
          <span
            className='material-icons text-muted'
            style={{ fontSize: '120px', opacity: 0.5 }}
          >
            sentiment_dissatisfied
          </span>
        </div>
        
        <h1 className='display-1 fw-bold text-primary mb-2'>404</h1>
        <h2 className='h4 text-muted mb-4'>Página no encontrada</h2>
        
        <p className='lead text-muted mb-5' style={{ maxWidth: '500px' }}>
          Lo sentimos, la página que estás buscando no existe, ha sido movida o eliminada.
          Verifica la URL o regresa al inicio.
        </p>

        <div className='d-flex gap-3'>
          <Button
            variant='outline-secondary'
            size='lg'
            onClick={() => router.back()}
          >
            <span className='material-icons me-2'>arrow_back</span>
            Volver atrás
          </Button>
          
          <Button
            variant='primary'
            size='lg'
            onClick={() => router.push('/dashboard')}
          >
            <span className='material-icons me-2'>home</span>
            Ir al Inicio
          </Button>
        </div>
      </div>
    </Layout>
  );
}
