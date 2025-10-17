import React, { useState } from 'react';
import { createApelacion } from '@/lib/apelacionesService';

export default function ApelacionForm({ token, onCreated }: { token?: string, onCreated?: (res:any)=>void }) {
  const [multaId, setMultaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [comunidadId, setComunidadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const multa_id = Number(multaId);
    if (!multa_id || motivo.trim().length < 6) return setError('Multa ID válido y motivo (>=6 caracteres) requeridos');
    setLoading(true);
    try {
      const payload: any = { multa_id, motivo };
      if (comunidadId) payload.comunidad_id = Number(comunidadId);
      const res = await createApelacion(payload, token);
      if (onCreated) onCreated(res);
    } catch (err: any) {
      setError(err.message || 'Error al crear apelación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label className="form-label">Multa ID</label>
        <input className="form-control" value={multaId} onChange={e=>setMultaId(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Comunidad ID (opcional)</label>
        <input className="form-control" value={comunidadId} onChange={e=>setComunidadId(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Motivo</label>
        <textarea className="form-control" value={motivo} onChange={e=>setMotivo(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="form-label">Documentos (JSON opcional)</label>
        <textarea className="form-control" placeholder='[{"url":"...","name":"..."}]' />
        <small className="text-muted">Sube archivos en el módulo de archivos y pega aquí el JSON con URLs (opcional)</small>
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear apelación'}</button>
    </form>
  );
}