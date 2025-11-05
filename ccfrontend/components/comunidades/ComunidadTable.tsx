import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import comunidadesService from '@/lib/comunidadesService';
import { Comunidad } from '@/types/comunidades';

interface ComunidadTableProps {
  comunidades: Comunidad[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ComunidadTable: React.FC<ComunidadTableProps> = ({
  comunidades,
  onEdit,
  onDelete,
}) => {
  return (
    <div className='card app-card mb-4'>
      <div className='table-responsive'>
        <table className='table table-hover mb-0'>
          <thead className='table-light'>
            <tr>
              <th scope='col'>Comunidad</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>Estado</th>
              <th scope='col'>Unidades</th>
              <th scope='col'>Ocupación</th>
              <th scope='col'>Morosidad</th>
              <th scope='col'>Saldo Pendiente</th>
              <th scope='col'>Administrador</th>
              <th scope='col' className='actions-cell'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {comunidades.map(comunidad => {
              const ocupacionPorcentaje =
                (comunidad.unidadesOcupadas / comunidad.totalUnidades) * 100;

              return (
                <tr key={comunidad.id}>
                  <td>
                    <div className='d-flex align-items-center'>
                      <Image
                        src={
                          comunidad.imagen ||
                          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
                        }
                        alt={comunidad.nombre}
                        className='rounded me-3'
                        width={50}
                        height={50}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                        }}
                      />
                      <div>
                        <div className='fw-bold'>{comunidad.nombre}</div>
                        <small className='text-muted'>
                          {comunidad.direccion}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className='d-flex align-items-center'>
                      <span
                        className='material-icons me-1 text-muted'
                        style={{ fontSize: '18px' }}
                      >
                        {comunidadesService.getTipoComunidadIcon(
                          comunidad.tipo,
                        )}
                      </span>
                      {comunidad.tipo}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${comunidadesService.getEstadoBadgeClass(comunidad.estado)}`}
                    >
                      {comunidad.estado}
                    </span>
                  </td>
                  <td>
                    <div className='text-center'>
                      <div className='fw-bold'>{comunidad.totalUnidades}</div>
                      <small className='text-muted'>
                        {comunidad.unidadesOcupadas} ocupadas
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className='d-flex align-items-center'>
                      <div
                        className='progress me-2'
                        style={{ width: '60px', height: '8px' }}
                      >
                        <div
                          className='progress-bar bg-primary'
                          role='progressbar'
                          style={{ width: `${ocupacionPorcentaje}%` }}
                          aria-valuenow={ocupacionPorcentaje}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <small className='text-muted'>
                        {ocupacionPorcentaje.toFixed(0)}%
                      </small>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`fw-bold ${
                        comunidad.morosidad > 10
                          ? 'text-danger'
                          : comunidad.morosidad > 5
                            ? 'text-warning'
                            : 'text-success'
                      }`}
                    >
                      {comunidadesService.formatPercentage(comunidad.morosidad)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`fw-bold ${comunidad.saldoPendiente > 0 ? 'text-warning' : 'text-success'}`}
                    >
                      {comunidadesService.formatCurrency(
                        comunidad.saldoPendiente,
                      )}
                    </span>
                  </td>
                  <td>
                    <div className='d-flex align-items-center'>
                      <span
                        className='material-icons me-1 text-muted'
                        style={{ fontSize: '16px' }}
                      >
                        person
                      </span>
                      <small>{comunidad.administrador}</small>
                    </div>
                  </td>
                  <td>
                    <div className='dropdown'>
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        type='button'
                        data-bs-toggle='dropdown'
                        aria-expanded='false'
                      >
                        <span className='material-icons'>more_vert</span>
                      </button>
                      <ul className='dropdown-menu dropdown-menu-end'>
                        <li>
                          <Link
                            href={`/comunidades/${comunidad.id}`}
                            className='dropdown-item'
                          >
                            <span className='material-icons me-2'>
                              visibility
                            </span>
                            Ver detalles
                          </Link>
                        </li>
                        <li>
                          <button
                            className='dropdown-item'
                            onClick={() => onEdit?.(comunidad.id)}
                          >
                            <span className='material-icons me-2'>edit</span>
                            Editar
                          </button>
                        </li>
                        <li>
                          <Link
                            href={`/comunidades/${comunidad.id}/parametros`}
                            className='dropdown-item'
                          >
                            <span className='material-icons me-2'>
                              settings
                            </span>
                            Parámetros
                          </Link>
                        </li>
                        <li>
                          <hr className='dropdown-divider' />
                        </li>
                        <li>
                          <button
                            className='dropdown-item text-danger'
                            onClick={() => onDelete?.(comunidad.id)}
                          >
                            <span className='material-icons me-2'>delete</span>
                            Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {comunidades.length === 0 && (
          <div className='text-center py-5'>
            <span
              className='material-icons text-muted mb-3'
              style={{ fontSize: '64px' }}
            >
              domain
            </span>
            <h5 className='text-muted'>No se encontraron comunidades</h5>
            <p className='text-muted'>
              No hay comunidades que coincidan con los filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComunidadTable;

