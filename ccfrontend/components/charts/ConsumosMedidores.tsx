import React from 'react';

import { ConsumoMedidor } from '@/lib/dashboardService';

interface ConsumosMedidoresProps {
  data: ConsumoMedidor[];
  loading?: boolean;
}

export default function ConsumosMedidores({
  data,
  loading,
}: ConsumosMedidoresProps) {
  if (loading) {
    return (
      <div className='d-flex align-items-center justify-content-center h-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className='d-flex align-items-center justify-content-center h-100 text-muted'>
        <div className='text-center'>
          <i className='material-icons mb-2' style={{ fontSize: '3rem' }}>
            water_drop
          </i>
          <p>No hay datos de medidores disponibles</p>
        </div>
      </div>
    );
  }

  // Obtener el máximo consumo para calcular porcentajes
  const maxConsumo = Math.max(...data.map(item => item.consumo));

  const getConsumoColor = (consumo: number) => {
    const porcentaje = maxConsumo > 0 ? (consumo / maxConsumo) * 100 : 0;

    if (porcentaje >= 80) {return 'text-danger';}
    if (porcentaje >= 60) {return 'text-warning';}
    return 'text-success';
  };

  const getConsumoIcon = (unidad: string) => {
    switch (unidad.toLowerCase()) {
      case 'l':
      case 'litros':
        return 'water_drop';
      case 'kw':
      case 'kwh':
        return 'electrical_services';
      case 'm3':
        return 'local_gas_station';
      default:
        return 'speed';
    }
  };

  return (
    <div className='h-100'>
      <div className='row g-3 h-100'>
        {data.map((medidor, index) => {
          const porcentaje =
            maxConsumo > 0
              ? Math.round((medidor.consumo / maxConsumo) * 100)
              : 0;

          return (
            <div key={index} className='col-12'>
              <div className='card border-0 bg-light h-100'>
                <div className='card-body p-3'>
                  <div className='d-flex align-items-center mb-2'>
                    <div className='me-3'>
                      <i
                        className={`material-icons ${getConsumoColor(medidor.consumo)}`}
                        style={{ fontSize: '1.8rem' }}
                      >
                        {getConsumoIcon(medidor.unidad)}
                      </i>
                    </div>
                    <div className='flex-grow-1'>
                      <h6 className='card-title mb-1 small fw-bold'>
                        {medidor.medidor}
                      </h6>
                      <div className='small text-muted'>
                        Período: {medidor.periodo}
                      </div>
                    </div>
                  </div>

                  <div className='d-flex align-items-center justify-content-between'>
                    <div>
                      <div
                        className={`fw-bold ${getConsumoColor(medidor.consumo)}`}
                      >
                        {medidor.consumo.toLocaleString('es-CL')}{' '}
                        {medidor.unidad}
                      </div>
                    </div>
                    <div className='small text-muted'>{porcentaje}%</div>
                  </div>

                  {/* Barra de progreso */}
                  <div className='progress mt-2' style={{ height: '4px' }}>
                    <div
                      className={`progress-bar ${
                        porcentaje >= 80
                          ? 'bg-danger'
                          : porcentaje >= 60
                            ? 'bg-warning'
                            : 'bg-success'
                      }`}
                      role='progressbar'
                      style={{ width: `${porcentaje}%` }}
                      aria-valuenow={porcentaje}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className='text-center text-muted mt-3'>
          <small>No hay medidores configurados para esta comunidad</small>
        </div>
      )}
    </div>
  );
}
