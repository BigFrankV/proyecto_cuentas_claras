import React from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import ApelacionForm from '@/components/apelaciones/ApelacionForm';

export default function NuevoApelacionPage() {
  const router = useRouter();
  const { token } = useAuth();

  async function handleCreated(res) {
    // si backend retorna objeto con id
    const id = res && res.id ? res.id : (res && res.data && res.data.id);
    if (id) router.push(`/apelaciones/${id}`);
    else router.push('/apelaciones');
  }

  return (
    <ProtectedRoute>
      <div className="container p-4">
        <h1>Nueva Apelación</h1>
        <ApelacionForm token={token} onCreated={handleCreated} />
      </div>
    </ProtectedRoute>
  );
}