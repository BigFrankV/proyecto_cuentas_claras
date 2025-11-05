import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';

import { listApelaciones } from '@/lib/apelacionesService';
import { useAuth } from '@/lib/useAuth';

type Apelacion = {
  id: number;
  multa_id: number;
  motivo?: string;
  estado?: string;
  fecha_apelacion?: string;
  usuario_id?: number;
  persona_id?: number;
  comunidad_id?: number;
  [key: string]: any;
};

function ActionDropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) {
        return;
      }
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div ref={ref} className='position-relative'>
      <button
        type='button'
        className='btn btn-sm btn-secondary'
        onClick={() => setOpen(s => !s)}
      >
        Acciones <span className='caret' />
      </button>
      {open && (
        <div
          style={{ minWidth: 160, right: 0 }}
          className='position-absolute bg-white border rounded shadow-sm p-1'
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function ApelacionTable({
  initialParams = {},
  perPage = 25,
}: {
  initialParams?: Record<string, any>;
  perPage?: number;
}) {
  const { token, user } = useAuth();
  const [data, setData] = useState<Apelacion[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isManager(u: any) {
    if (!u) {
      return false;
    }
    if (u.is_superadmin) {
      return true;
    }
    const roles = (u.memberships || []).map((m: any) =>
      String(m.rol_slug || m.rol || '').toLowerCase(),
    );
    const allowed = [
      'presidente_comite',
      'admin_comunidad',
      'sindico',
      'contador',
      'admin',
      'gestor',
      'sistema',
    ];
    return roles.some((r: string) => allowed.includes(r));
  }

  const canEdit = (item: Apelacion) => {
    if (isManager(user)) {
      return true;
    }
    if (!user) {
      return false;
    }
    return (
      user.id === item.usuario_id ||
      (user.persona_id && user.persona_id === item.persona_id)
    );
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { ...initialParams, page, perPage };
        const res = await listApelaciones(params, token || undefined);
        setData(res.data || []);
        setTotal(
          res.meta && res.meta.total
            ? res.meta.total
            : res.data
              ? res.data.length
              : 0,
        );
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('ApelacionTable.list.error', err);
        setError(err?.message || 'Error al cargar apelaciones');
      } finally {
        setLoading(false);
      }
    })();
  }, [initialParams, page, perPage, token]);

  function renderBadge(estado?: string) {
    if (estado === 'pendiente') {
      return <span className='badge bg-warning text-dark'>Pendiente</span>;
    }
    if (estado === 'aprobada') {
      return <span className='badge bg-success'>Aprobada</span>;
    }
    if (estado === 'rechazada') {
      return <span className='badge bg-danger'>Rechazada</span>;
    }
    return <span className='badge bg-secondary'>—</span>;
  }

  return (
    <div className='apelaciones-table container p-2'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mb-0'>Resultados</h5>
        <small className='text-muted'>
          Mostrando {data.length} de {total}
        </small>
      </div>

      {loading && (
        <div className='alert alert-info'>Cargando apelaciones...</div>
      )}
      {error && <div className='alert alert-danger'>{error}</div>}

      {!loading && !error && (
        <>
          <div className='table-responsive'>
            <table className='table table-hover table-sm align-middle'>
              <thead className='table-light'>
                <tr>
                  <th style={{ width: 80 }}>#</th>
                  <th>Multa</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th style={{ width: 180 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className='text-center py-4'>
                      No hay apelaciones
                    </td>
                  </tr>
                )}
                {data.map(a => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/apelaciones/${a.id}`}>{a.id}</Link>
                    </td>
                    <td>
                      <Link href={`/multas/${a.multa_id}`}>{a.multa_id}</Link>
                    </td>
                    <td className='text-truncate' style={{ maxWidth: 360 }}>
                      {a.motivo
                        ? a.motivo.length > 140
                          ? `${a.motivo.slice(0, 140)}…`
                          : a.motivo
                        : '—'}
                    </td>
                    <td>{renderBadge(a.estado)}</td>
                    <td>
                      {a.fecha_apelacion
                        ? new Date(a.fecha_apelacion).toLocaleString()
                        : '—'}
                    </td>
                    <td>
                      <div className='d-flex gap-2 align-items-center'>
                        <Link
                          href={`/apelaciones/${a.id}`}
                          className='btn btn-sm btn-outline-secondary'
                        >
                          Ver
                        </Link>

                        {canEdit(a) ? (
                          <ActionDropdown>
                            <div className='d-flex flex-column'>
                              <Link
                                href={`/apelaciones/${a.id}/editar`}
                                className='p-2 text-decoration-none text-dark'
                              >
                                Editar
                              </Link>
                              <button
                                type='button'
                                className='p-2 text-decoration-none text-dark bg-transparent border-0 text-start'
                                onClick={e => {
                                  e.preventDefault(); /* implementar descargue */
                                }}
                              >
                                Descargar documentos
                              </button>
                            </div>
                          </ActionDropdown>
                        ) : (
                          <button
                            className='btn btn-sm btn-outline-light'
                            disabled
                          >
                            —
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='d-flex justify-content-between align-items-center mt-2'>
            <div className='text-muted'>Página {page}</div>
            <div>
              <button
                className='btn btn-sm btn-outline-secondary me-2'
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <button
                className='btn btn-sm btn-outline-secondary'
                disabled={data.length === 0 || page * perPage >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
