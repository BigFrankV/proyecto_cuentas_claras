import React from 'react';

import Sidebar from '@/components/layout/Sidebar';

export default function LecturasPage(): JSX.Element {
  return (
    <div className='d-flex'>
      <Sidebar />
      <div
        className='main-content flex-grow-1 bg-light'
        style={{ marginLeft: 280 }}
      >
        <header className='bg-white border-bottom shadow-sm p-3'>
          <div className='container-fluid d-flex align-items-center justify-content-between'>
            <h4 className='mb-0'>Lecturas de Medidor</h4>
            <div className='d-flex align-items-center gap-2'>
              <input
                id='meterSearch'
                className='form-control form-control-sm'
                placeholder='Buscar medidor...'
                style={{ width: 220 }}
              />
            </div>
          </div>
        </header>

        <main className='container-fluid p-4'>
          <div className='row'>
            <div className='col-lg-4'>
              <div className='reading-form-card'>
                <h5>Registrar lectura</h5>
                <form id='readingForm'>
                  <div className='mb-3'>
                    <label className='form-label'>Medidor</label>
                    <select className='form-select'>
                      <option>Medidor 001</option>
                      <option>Medidor 002</option>
                    </select>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Fecha y hora</label>
                    <input
                      id='readingDate'
                      type='datetime-local'
                      className='form-control'
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Lectura actual</label>
                    <input
                      id='currentReading'
                      type='number'
                      className='form-control reading-input'
                      defaultValue={0}
                    />
                  </div>
                  <div className='d-grid gap-2'>
                    <button type='submit' className='btn btn-primary'>
                      Guardar lectura
                    </button>
                    <button
                      type='button'
                      className='btn btn-outline-secondary'
                      onClick={() => window.location.reload()}
                    >
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              <div className='meter-selector mt-3'>
                <h6>Medidores</h6>
                <div className='meter-option p-2'>Medidor 001</div>
                <div className='meter-option p-2'>Medidor 002</div>
              </div>
            </div>

            <div className='col-lg-8'>
              <div className='reading-history'>
                <div className='reading-history-header d-flex justify-content-between align-items-center p-3'>
                  <h5 className='mb-0'>Historial de lecturas</h5>
                  <div>
                    <button className='btn btn-sm btn-outline-secondary me-2'>
                      Exportar
                    </button>
                    <button className='btn btn-sm btn-primary'>
                      Agregar lectura masiva
                    </button>
                  </div>
                </div>
                <div className='p-3'>
                  <div className='reading-item d-flex justify-content-between'>
                    <div>
                      <div className='fw-bold'>01/09/2025 10:00</div>
                      <div className='small text-muted'>Medidor 001</div>
                    </div>
                    <div className='text-end'>
                      <div className='consumption-value'>1234</div>
                      <div className='small text-muted'>Confirmado</div>
                    </div>
                  </div>
                  <div className='reading-item d-flex justify-content-between mt-2'>
                    <div>
                      <div className='fw-bold'>15/08/2025 09:30</div>
                      <div className='small text-muted'>Medidor 001</div>
                    </div>
                    <div className='text-end'>
                      <div className='consumption-value'>1200</div>
                      <div className='small text-muted'>Pendiente</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
