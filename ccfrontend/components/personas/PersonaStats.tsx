interface PersonaStatsProps {
  total: number;
  propietarios: number;
  inquilinos: number;
  administradores: number;
}

export default function PersonaStats({
  total,
  propietarios,
  inquilinos,
  administradores,
}: PersonaStatsProps) {
  return (
    <div className='card shadow-sm mb-4'>
      <div className='card-body'>
        <div className='row g-3'>
          <div className='col-sm-6 col-md-3'>
            <div className='d-flex align-items-center'>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className='me-3'
              >
                <i className='material-icons'>people</i>
              </div>
              <div>
                <div className='text-muted small'>Total Personas</div>
                <h4 className='mb-0'>{total}</h4>
              </div>
            </div>
          </div>
          <div className='col-sm-6 col-md-3'>
            <div className='d-flex align-items-center'>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className='me-3'
              >
                <i className='material-icons'>home_work</i>
              </div>
              <div>
                <div className='text-muted small'>Propietarios</div>
                <h4 className='mb-0'>{propietarios}</h4>
              </div>
            </div>
          </div>
          <div className='col-sm-6 col-md-3'>
            <div className='d-flex align-items-center'>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-info)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className='me-3'
              >
                <i className='material-icons'>night_shelter</i>
              </div>
              <div>
                <div className='text-muted small'>Inquilinos</div>
                <h4 className='mb-0'>{inquilinos}</h4>
              </div>
            </div>
          </div>
          <div className='col-sm-6 col-md-3'>
            <div className='d-flex align-items-center'>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-warning)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className='me-3'
              >
                <i className='material-icons'>admin_panel_settings</i>
              </div>
              <div>
                <div className='text-muted small'>Administradores</div>
                <h4 className='mb-0'>{administradores}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
