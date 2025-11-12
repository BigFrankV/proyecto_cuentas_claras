import { useRouter } from 'next/router';
import React from 'react';

import ApelacionForm from '@/components/apelaciones/ApelacionForm';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/ui/PageHeader';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';

export default function ApelacionesNueva() {
  const router = useRouter();
  const { token } = useAuth();

  return (
    <ProtectedRoute>
      <Layout title='Nueva Apelación'>
        <div className='container-fluid p-4'>
          <div className='row'>
            <div className='col-12'>
              <PageHeader
                title="Nueva Apelación"
                subtitle="Crear una nueva apelación contra una multa"
                icon="gavel"
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => router.push('/apelaciones')}
                >
                  <i className="material-icons me-2">arrow_back</i>
                  Cancelar
                </button>
              </PageHeader>

              <div className='card'>
                <div className='card-body'>
                  <ApelacionForm
                    token={token}
                    onCreated={res => {
                      // Redirect to the detail page of the created appeal
                      router.push(`/apelaciones/${res.id}`);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
