import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import Layout from '@/components/layout/Layout';
import ApelacionFilters from '@/components/apelaciones/ApelacionFilters';
import ApelacionTable from '@/components/apelaciones/ApelacionTable';

export default function ApelacionesListadoPage() {
  const { token } = useAuth();
  const [params, setParams] = useState<Record<string, any>>({});

  function handleApplyFilters(p: Record<string, any>) {
    setParams(p);
  }

  return (
    <Layout title="Lista de Apelaciones">
      <div className="container-fluid p-4">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h4 mb-0">Apelaciones</h1>
            <small className="text-muted">Revisa, filtra y administra apelaciones</small>
          </div>
          <div>
            <Link href="/apelaciones/nuevo" className="btn btn-primary">
              <i className="material-icons me-2">add</i> Nueva Apelación
            </Link>
          </div>
        </header>

        <ApelacionFilters onApply={handleApplyFilters} />

        <ApelacionTable initialParams={params} perPage={25} />
      </div>
    </Layout>
  );
}