import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { getApelacion, updateApelacion } from '@/lib/apelacionesService';

export default function EditApelacionPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [form, setForm] = useState({ motivo: '', documentos_json: null });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const r = await getApelacion(Number(id), token);
      setForm({ motivo: r.motivo || '', documentos_json: r.documentos_json || null });
    })();
  }, [id, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    await updateApelacion(Number(id), form, token);
    router.push(`/apelaciones/${id}`);
  }

  return (
    <ProtectedRoute>
      <div className="container p-4">
        <h1>Editar Apelación #{id}</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Motivo</label>
            <textarea className="form-control" value={form.motivo} onChange={e=>setForm({...form, motivo: e.target.value})} />
          </div>
          {/* Simplificación: documentos_json como JSON textarea; si quieres upload, crea endpoint de archivos */}
          <div className="mb-3">
            <label className="form-label">Documentos (JSON)</label>
            <textarea className="form-control" value={form.documentos_json ? JSON.stringify(form.documentos_json) : ''} onChange={e=>{
              try { setForm({...form, documentos_json: JSON.parse(e.target.value)}); } catch { setForm({...form, documentos_json: null}); }
            }} />
          </div>
          <button className="btn btn-primary" type="submit">Guardar</button>
        </form>
      </div>
    </ProtectedRoute>
  );
}