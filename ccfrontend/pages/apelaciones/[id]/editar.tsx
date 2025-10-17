import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { getApelacion, updateApelacion } from '@/lib/apelacionesService';
import Layout from '@/components/layout/Layout';

export default function EditApelacionPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [form, setForm] = useState({ motivo: '', documentos_json: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const r = await getApelacion(Number(id), token);
        setForm({ motivo: r.motivo || '', documentos_json: r.documentos_json || null });
      } catch (err) {
        console.error('getApelacion.error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateApelacion(Number(id), form, token);
      router.push(`/apelaciones/${id}`);
    } catch (err) {
      console.error('updateApelacion.error', err);
      alert('Error al guardar la apelación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <Layout title={`Editar Apelación #${id}`}>
        <div className="container p-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Editar Apelación #{id}</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Motivo</label>
                  <textarea className="form-control" value={form.motivo} onChange={e=>setForm({...form, motivo: e.target.value})} rows={4} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Documentos (JSON)</label>
                  <textarea className="form-control" value={form.documentos_json ? JSON.stringify(form.documentos_json, null, 2) : ''} onChange={e=>{
                    const v = e.target.value;
                    if (!v) return setForm({...form, documentos_json: null});
                    try {
                      const parsed = JSON.parse(v);
                      setForm({...form, documentos_json: parsed});
                    } catch {
                      // dejar string temporal mientras usuario edita (no rompemos UI)
                      // No parseado: mantenemos null y no bloqueamos edición
                      setForm({...form, documentos_json: null});
                    }
                  }} rows={6} />
                  <div className="form-text">Si necesitas subir archivos, utiliza el módulo de documentos y añade enlaces en este JSON.</div>
                </div>

                <div className="d-flex">
                  <button className="btn btn-primary me-2" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
                  <button className="btn btn-outline-secondary" type="button" onClick={()=>router.push(`/apelaciones/${id}`)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}