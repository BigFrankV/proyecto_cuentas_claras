import React from 'react';
import { useAuth } from '@/lib/useAuth';
import ActionsDropdown from '@/components/ActionsDropdown';
import {
  canRegisterPayment,
  canEditMulta,
  canAnularMulta,
  canApelarMulta,
  canDeleteMulta
} from '@/lib/usePermissions';

export default function MultaTable({ multas, onAction }: any) {
  const { user } = useAuth();

  return (
    <table className="table multas-table">
      <thead> {/* ... */} </thead>
      <tbody>
        {multas?.map((m: any) => {
          const isPagada = String(m.estado).toLowerCase() === 'pagado';
          const showRegister = !isPagada && ['pendiente','vencido'].includes(String(m.estado).toLowerCase()) && canRegisterPayment(user, m.comunidad_id);
          const showEdit = !isPagada && canEditMulta(user, m.comunidad_id);
          const showAnular = canAnularMulta(user, m.comunidad_id); // según política, puede anular aunque esté pagada (ajusta si no)
          const showApelar = !isPagada && canApelarMulta(user, m);
          const showDelete = canDeleteMulta(user);

          return (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.comunidad_nombre}</td>
              <td>{m.persona_id}</td>
              <td>{m.estado}</td>
              <td>
                <ActionsDropdown
                  trigger={<span className={`btn btn-sm ${isPagada ? 'btn-outline-secondary disabled' : 'btn-outline-secondary'}`}>{isPagada ? 'Acciones • Pagada' : 'Acciones ▾'}</span>}
                menu={
                  <ul style={{ margin: 0, padding: 8, listStyle: 'none' }}>
                    <li><button className="dropdown-item" onClick={() => onAction('view', m)}>Ver Detalle</button></li>

                    {showRegister && (
                      <li><button className="dropdown-item text-success" onClick={() => onAction('payment', m)}>Registrar Pago</button></li>
                    )}

                    {showEdit && (
                      <li><button className="dropdown-item" onClick={() => onAction('edit', m)}>Editar</button></li>
                    )}

                    {showApelar && (
                      <li><button className="dropdown-item" onClick={() => onAction('appeal', m)}>Apelar</button></li>
                    )}

                    {showAnular && (
                      <li><button className="dropdown-item text-danger" onClick={() => onAction('anular', m)}>Anular Multa</button></li>
                    )}

                    {showDelete && (
                      <li><hr/></li>
                    )}

                    {showDelete && (
                      <li><button className="dropdown-item text-danger" onClick={() => onAction('delete', m)}>Eliminar (superadmin)</button></li>
                    )}
                  </ul>
                }
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}