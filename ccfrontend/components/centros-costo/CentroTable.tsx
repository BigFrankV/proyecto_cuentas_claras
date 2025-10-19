import React from 'react';
import { Table, Button } from 'react-bootstrap';

import type { CentroCosto } from '@/types/centrosCosto';

export interface CentroTableProps {
  centros: CentroCosto[];
  loading?: boolean;
  onEdit: (id: number) => void;
  onDelete: (centro: CentroCosto) => void;
}

export default function CentroTable({
  centros,
  loading,
  onEdit,
  onDelete,
}: CentroTableProps) {
  if (loading) {
    return <div className='py-4 text-center'>Cargando centros...</div>;
  }

  if (!centros || centros.length === 0) {
    return (
      <div className='py-4 text-center text-muted'>
        No se encontraron centros de costo
      </div>
    );
  }

  return (
    <Table hover responsive className='align-middle table-borderless'>
      <thead className='small text-muted'>
        <tr>
          <th>Centro</th>
          <th>Comunidad</th>
          <th className='text-end'>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {centros.map(c => (
          <tr key={c.id} className='border-bottom'>
            <td>
              <div className='d-flex align-items-center'>
                <span className='fw-medium'>{c.nombre}</span>
              </div>
            </td>
            <td className='text-muted'>{c.comunidad}</td>
            <td className='text-end'>
              <div className='d-flex gap-1 justify-content-end'>
                <Button
                  variant='outline-primary'
                  size='sm'
                  onClick={() => onEdit(c.id)}
                >
                  <span className='material-icons'>edit</span>
                </Button>
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={() => onDelete(c)}
                >
                  <span className='material-icons'>delete</span>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
