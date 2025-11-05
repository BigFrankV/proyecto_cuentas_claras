import React from 'react';

import { useAuth } from '@/lib/useAuth';
import { usePermissions, Permission } from '@/lib/usePermissions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MultaTable({ multas, onAction }: any) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <table className='table multas-table'>
      <thead> {/* ... */} </thead>
      <tbody>
        {multas?.map((m: any) => {
          const isPagada = String(m.estado).toLowerCase() === 'pagado';
          const showRegister =
            !isPagada &&
            ['pendiente', 'vencido'].includes(String(m.estado).toLowerCase()) &&
            hasPermission(Permission.MANAGE_FINANCES, m.comunidad_id);
          const showEdit =
            !isPagada &&
            hasPermission(Permission.MANAGE_FINANCES, m.comunidad_id);
          const showAnular = hasPermission(
            Permission.MANAGE_FINANCES,
            m.comunidad_id,
          );
          const showApelar = !isPagada && user; // Users can appeal if authenticated
          const showDelete = hasPermission(Permission.MANAGE_FINANCES);

          return (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.comunidad_nombre}</td>
              <td>{m.persona_id}</td>
              <td>{m.estado}</td>
              <td>
                <div className='btn-group btn-group-sm' role='group'>
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => onAction('view', m)}
                  >
                    Ver
                  </button>

                  {showRegister && (
                    <button
                      type='button'
                      className='btn btn-outline-success'
                      onClick={() => onAction('payment', m)}
                    >
                      Pago
                    </button>
                  )}

                  {showEdit && (
                    <button
                      type='button'
                      className='btn btn-outline-primary'
                      onClick={() => onAction('edit', m)}
                    >
                      Editar
                    </button>
                  )}

                  {showApelar && (
                    <button
                      type='button'
                      className='btn btn-outline-info'
                      onClick={() => onAction('appeal', m)}
                    >
                      Apelar
                    </button>
                  )}

                  {showAnular && (
                    <button
                      type='button'
                      className='btn btn-outline-danger'
                      onClick={() => onAction('anular', m)}
                    >
                      Anular
                    </button>
                  )}

                  {showDelete && (
                    <button
                      type='button'
                      className='btn btn-outline-dark'
                      onClick={() => onAction('delete', m)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
