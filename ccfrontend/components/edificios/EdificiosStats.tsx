import { EdificioStats } from '@/types/edificios';

interface EdificiosStatsProps {
  stats: EdificioStats;
  loading?: boolean;
}

export default function EdificiosStats({ stats, loading = false }: EdificiosStatsProps) {
  if (loading) {
    return (
      <div className='row mb-4'>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='col-lg-3 col-md-6 mb-3'>
            <div className='card stat-card'>
              <div className='card-body p-3'>
                <div className='d-flex align-items-center'>
                  <div className='stat-icon me-3'>
                    <div className='placeholder-glow'>
                      <span className='placeholder w-100'></span>
                    </div>
                  </div>
                  <div className='flex-grow-1'>
                    <div className='placeholder-glow'>
                      <span className='placeholder w-75'></span>
                      <span className='placeholder w-50'></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='row mb-4'>
      <div className='col-lg-3 col-md-6 mb-3'>
        <div className='card stat-card'>
          <div className='card-body p-3'>
            <div className='d-flex align-items-center'>
              <div className='stat-icon me-3'>
                <i className='material-icons text-primary'>business</i>
              </div>
              <div>
                <div className='stat-value'>{stats.totalEdificios}</div>
                <div className='stat-label text-muted'>Total Edificios</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='col-lg-3 col-md-6 mb-3'>
        <div className='card stat-card'>
          <div className='card-body p-3'>
            <div className='d-flex align-items-center'>
              <div className='stat-icon me-3'>
                <i className='material-icons text-success'>check_circle</i>
              </div>
              <div>
                <div className='stat-value'>{stats.edificiosActivos}</div>
                <div className='stat-label text-muted'>Edificios Activos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='col-lg-3 col-md-6 mb-3'>
        <div className='card stat-card'>
          <div className='card-body p-3'>
            <div className='d-flex align-items-center'>
              <div className='stat-icon me-3'>
                <i className='material-icons text-info'>apartment</i>
              </div>
              <div>
                <div className='stat-value'>{stats.totalUnidades}</div>
                <div className='stat-label text-muted'>Total Unidades</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='col-lg-3 col-md-6 mb-3'>
        <div className='card stat-card'>
          <div className='card-body p-3'>
            <div className='d-flex align-items-center'>
              <div className='stat-icon me-3'>
                <i className='material-icons text-warning'>groups</i>
              </div>
              <div>
                <div className='stat-value'>{stats.ocupacion.toFixed(1)}%</div>
                <div className='stat-label text-muted'>Ocupación</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background-color: rgba(3,14,39,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}