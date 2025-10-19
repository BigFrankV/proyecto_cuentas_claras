import Link from 'next/link';
import React, { useState } from 'react';

import { resolveApelacion } from '@/lib/apelacionesService';
import useAuth from '@/lib/useAuth';
import usePermissions from '@/lib/usePermissions';

const ApelacionDetail = ({
  apelacion,
  onResolved,
  onUpdated,
}: {
  apelacion: any;
  onResolved?: Function;
  onUpdated?: Function;
}) => {
  const { user, token } = useAuth();
  const { can } = usePermissions();
  const [resolucion, setResolucion] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResolve(accion: 'aceptar' | 'rechazar') {
    setLoading(true);
    try {
      await resolveApelacion(apelacion.id, { accion, resolucion }, token);
      if (onResolved) {
        onResolved(apelacion.id);
      }
    } catch (err) {
      console.error('resolve.error', err);
      alert('Error al resolver la apelación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='apelacion-detail card p-3'>
      <h4>Apelación #{apelacion.id}</h4>
      <p>
        <strong>Multa:</strong>{' '}
        <Link href={`/multas/${apelacion.multa_id}`}>{apelacion.multa_id}</Link>
      </p>
      <p>
        <strong>Motivo:</strong> {apelacion.motivo || '—'}
      </p>
      <p>
        <strong>Estado:</strong>{' '}
        <span
          className={`badge ${apelacion.estado === 'pendiente' ? 'bg-warning text-dark' : apelacion.estado === 'aprobada' ? 'bg-success' : 'bg-danger'}`}
        >
          {(apelacion.estado || '—').toUpperCase()}
        </span>
      </p>
      <p>
        <strong>Documentos:</strong>{' '}
        {apelacion.documentos_json
          ? JSON.stringify(apelacion.documentos_json)
          : '—'}
      </p>
      <p>
        <strong>Fecha apelación:</strong>{' '}
        {apelacion.fecha_apelacion
          ? new Date(apelacion.fecha_apelacion).toLocaleString()
          : '—'}
      </p>
      {apelacion.resolucion && (
        <p>
          <strong>Resolución:</strong> {apelacion.resolucion}
        </p>
      )}
      <div className='mt-3'>
        {apelacion.estado === 'pendiente' && can('apelaciones.resolve') && (
          <>
            <button
              className='btn btn-success me-2'
              disabled={loading}
              onClick={() => handleResolve('aceptar')}
            >
              Aprobar
            </button>
            <button
              className='btn btn-danger'
              disabled={loading}
              onClick={() => handleResolve('rechazar')}
            >
              Rechazar
            </button>
          </>
        )}

        {!isManager() &&
          user &&
          (user.id === apelacion.usuario_id ||
            user.persona_id === apelacion.persona_id) &&
          apelacion.estado === 'pendiente' && (
          <Link
            href={`/apelaciones/${apelacion.id}/editar`}
            className='btn btn-primary'
          >
              Editar mi apelación
          </Link>
        )}
      </div>
    </div>
  );
};

export default ApelacionDetail;
