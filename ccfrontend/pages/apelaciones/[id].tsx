import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { getApelacion, resolveApelacion } from '@/lib/apelacionesService';
import Link from 'next/link';

export default function ApelacionDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const [apelacion, setApelacion] = useState(null);
  const [resolucion, setResolucion] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const r = await getApelacion(Number(id), token);
      setApelacion(r);
    })();
  }, [id, token]);

  function isManager() {
    if (!user) return false;
    if (user.is_superadmin) return true;
    return (user.memberships || []).some(m => ['presidente_comite','admin_comunidad','sindico','contador','admin','gestor'].includes((m.rol_slug||m.rol||'').toLowerCase()));
  }

  async function handleResolve(accion) {
    await resolveApelacion(Number(id), { accion }, token);
    const r = await getApelacion(Number(id), token);
    setApelacion(r);
  }

  if (!apelacion) return <ProtectedRoute><div className="p-4">Cargando...</div></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <div className="container p-4">
        <h1>Apelación #{apelacion.id}</h1>
        <p><strong>Multa:</strong> <Link href={`/multas/${apelacion.multa_id}`}>{apelacion.multa_id}</Link></p>
        <p><strong>Motivo:</strong> {apelacion.motivo}</p>
        <p><strong>Estado:</strong> {apelacion.estado}</p>
        <p><strong>Documentos:</strong> {apelacion.documentos_json ? JSON.stringify(apelacion.documentos_json) : '—'}</p>

        <div className="mt-3">
          {isManager() && (
            <>
              <textarea className="form-control mb-2" placeholder="Resolución / comentarios" value={resolucion} onChange={e=>setResolucion(e.target.value)} />
              <button className="btn btn-success me-2" onClick={()=>handleResolve('aceptar')}>Aprobar</button>
              <button className="btn btn-danger" onClick={()=>handleResolve('rechazar')}>Rechazar</button>
              <Link href={`/apelaciones/${apelacion.id}/editar`} className="btn btn-outline-secondary ms-2">Editar</Link>
            </>
          )}

          {!isManager() && (user && (user.id === apelacion.usuario_id || user.persona_id === apelacion.persona_id)) && (
            <Link href={`/apelaciones/${apelacion.id}/editar`} className="btn btn-primary">Editar mi apelación</Link>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}