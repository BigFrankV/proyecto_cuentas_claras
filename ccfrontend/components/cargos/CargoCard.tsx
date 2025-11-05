import React from 'react';

import AmountCell from './AmountCell';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';

export interface Cargo {
  id: string;
  concepto: string;
  descripcion?: string;
  tipo: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  estado: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  monto: number;
  montoAplicado: number;
  unidad: string;
  periodo: string;
  fechaVencimiento: Date;
  fechaCreacion: Date;
  cuentaCosto: string;
  observaciones?: string;
}

export interface CargoCardProps {
  cargo: Cargo;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export default function CargoCard({
  cargo,
  onView,
  onEdit,
  onDelete,
  className = '',
}: CargoCardProps) {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatPeriod = (period: string): string => {
    const [year, month] = period.split('-');
    if (!year || !month) {return period;}
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
    }).format(new Date(parseInt(year), parseInt(month) - 1));
  };

  const isOverdue = (): boolean => {
    return new Date() > cargo.fechaVencimiento && cargo.estado !== 'paid';
  };

  return (
    <div
      className={`card h-100 ${className} ${isOverdue() ? 'border-danger' : ''}`}
    >
      <div className='card-header d-flex justify-content-between align-items-center'>
        <div>
          <h6 className='card-title mb-0'>{cargo.concepto}</h6>
          <small className='text-muted'>#{cargo.id}</small>
        </div>
        <div className='d-flex gap-1'>
          <TypeBadge type={cargo.tipo} />
          <StatusBadge status={cargo.estado} />
        </div>
      </div>

      <div className='card-body'>
        <div className='row g-2 mb-3'>
          <div className='col-6'>
            <small className='text-muted d-block'>Unidad</small>
            <strong>{cargo.unidad}</strong>
          </div>
          <div className='col-6'>
            <small className='text-muted d-block'>Período</small>
            <strong>{formatPeriod(cargo.periodo)}</strong>
          </div>
        </div>

        <div className='row g-2 mb-3'>
          <div className='col-6'>
            <small className='text-muted d-block'>Monto</small>
            <AmountCell amount={cargo.monto} />
          </div>
          <div className='col-6'>
            <small className='text-muted d-block'>Aplicado</small>
            <AmountCell amount={cargo.montoAplicado} />
          </div>
        </div>

        <div className='mb-3'>
          <small className='text-muted d-block'>Vencimiento</small>
          <span className={isOverdue() ? 'text-danger fw-bold' : ''}>
            {formatDate(cargo.fechaVencimiento)}
            {isOverdue() && (
              <i
                className='material-icons ms-1 text-danger'
                style={{ fontSize: '16px' }}
              >
                warning
              </i>
            )}
          </span>
        </div>

        {cargo.descripcion && (
          <div className='mb-3'>
            <small className='text-muted d-block'>Descripción</small>
            <p className='small mb-0'>{cargo.descripcion}</p>
          </div>
        )}
      </div>

      <div className='card-footer'>
        <div className='btn-group w-100' role='group'>
          <button
            className='btn btn-outline-primary btn-sm'
            onClick={() => onView(cargo.id)}
          >
            <i className='material-icons me-1'>visibility</i>
            Ver
          </button>
          <button
            className='btn btn-outline-secondary btn-sm'
            onClick={() => onEdit(cargo.id)}
          >
            <i className='material-icons me-1'>edit</i>
            Editar
          </button>
          <button
            className='btn btn-outline-danger btn-sm'
            onClick={() => onDelete(cargo.id)}
          >
            <i className='material-icons me-1'>delete</i>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
