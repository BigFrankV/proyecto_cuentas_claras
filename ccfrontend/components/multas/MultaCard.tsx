import React from 'react';

import multasService from '@/lib/multasService';
import { Multa } from '@/types/multas';

interface MultaCardProps {
  multa: Multa;
  onAction: (action: string, multa: Multa) => void;
}

export const MultaCard: React.FC<MultaCardProps> = ({ multa, onAction }) => {
  return (
    <div className={`fine-card ${multa.estado}`}>
      <div className='fine-header'>
        <div className='flex-grow-1'>
          <div className='fine-number'>#{multa.numero}</div>
          <div className='fine-unit'>{multa.unidad_numero}</div>
          <div className='fine-violation'>{multa.tipo_infraccion}</div>
          <div className='mb-2'>
            <span className={`status-badge status-${multa.estado} me-2`}>
              {multa.estado}
            </span>
            <span className={`priority-badge priority-${multa.prioridad}`}>
              {multa.prioridad}
            </span>
          </div>
        </div>
        <div className='text-end'>
          <div className='fine-amount'>
            {multasService.formatearMonto(multa.monto)}
          </div>
          <small className='text-muted'>
            Vence:{' '}
            {new Date(multa.fecha_vencimiento).toLocaleDateString('es-CL')}
          </small>
        </div>
      </div>
      <div className='d-flex justify-content-end gap-2'>
        <button
          className='btn btn-sm btn-outline-primary'
          onClick={() => onAction('view', multa)}
        >
          Ver Detalle
        </button>
        <button
          className='btn btn-sm btn-outline-secondary'
          onClick={() => onAction('payment', multa)}
        >
          Registrar Pago
        </button>
      </div>
    </div>
  );
};
