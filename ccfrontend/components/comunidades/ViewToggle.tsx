import React from 'react';

import { VistaConfiguracion } from '@/types/comunidades';

interface ViewToggleProps {
  configuracion: VistaConfiguracion;
  onConfiguracionChange: (config: VistaConfiguracion) => void;
  totalResultados: number;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  configuracion,
  onConfiguracionChange,
  totalResultados,
}) => {
  const handleVistaChange = (tipoVista: 'cards' | 'table') => {
    onConfiguracionChange({
      ...configuracion,
      tipoVista,
    });
  };

  const handleOrdenChange = (field: string, value: string) => {
    onConfiguracionChange({
      ...configuracion,
      [field]: value,
    });
  };

  return (
    <div className='d-flex justify-content-between align-items-center mb-3'>
      <div className='d-flex align-items-center'>
        <span className='text-muted me-3'>
          {totalResultados}{' '}
          {totalResultados === 1 ? 'comunidad' : 'comunidades'}
        </span>

        {/* Selector de ordenamiento */}
        <div className='d-flex align-items-center me-3'>
          <span className='text-muted me-2 small'>Ordenar por:</span>
          <select
            className='form-select form-select-sm'
            style={{ width: 'auto' }}
            value={configuracion.ordenarPor}
            onChange={e => handleOrdenChange('ordenarPor', e.target.value)}
          >
            <option value='nombre'>Nombre</option>
            <option value='fechaCreacion'>Fecha creación</option>
            <option value='totalUnidades'>Unidades</option>
            <option value='morosidad'>Morosidad</option>
          </select>

          <button
            className='btn btn-sm btn-outline-secondary ms-1'
            onClick={() =>
              handleOrdenChange(
                'direccionOrden',
                configuracion.direccionOrden === 'asc' ? 'desc' : 'asc',
              )
            }
            title={`Ordenar ${configuracion.direccionOrden === 'asc' ? 'descendente' : 'ascendente'}`}
          >
            <span className='material-icons'>
              {configuracion.direccionOrden === 'asc'
                ? 'arrow_upward'
                : 'arrow_downward'}
            </span>
          </button>
        </div>
      </div>

      {/* Toggle de vista */}
      <div className='btn-group' role='group' aria-label='Tipo de vista'>
        <button
          type='button'
          className={`btn btn-outline-secondary ${configuracion.tipoVista === 'cards' ? 'active' : ''}`}
          onClick={() => handleVistaChange('cards')}
          title='Vista de tarjetas'
        >
          <span className='material-icons'>view_module</span>
        </button>
        <button
          type='button'
          className={`btn btn-outline-secondary ${configuracion.tipoVista === 'table' ? 'active' : ''}`}
          onClick={() => handleVistaChange('table')}
          title='Vista de tabla'
        >
          <span className='material-icons'>view_list</span>
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;
