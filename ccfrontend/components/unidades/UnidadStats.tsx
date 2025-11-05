interface UnidadStatsProps {
  stats: {
    total: number;
    activas: number;
    inactivas: number;
    mantenimiento: number;
    saldoTotal: number;
  };
}

const UnidadStats: React.FC<UnidadStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <div className='row mb-4'>
      <div className='col-md-3 mb-3'>
        <div className='card bg-primary text-white'>
          <div className='card-body text-center'>
            <h2 className='card-title'>{stats.total}</h2>
            <p className='card-text'>Total Unidades</p>
          </div>
        </div>
      </div>
      <div className='col-md-3 mb-3'>
        <div className='card bg-success text-white'>
          <div className='card-body text-center'>
            <h2 className='card-title'>{stats.activas}</h2>
            <p className='card-text'>Activas</p>
          </div>
        </div>
      </div>
      <div className='col-md-3 mb-3'>
        <div className='card bg-warning text-white'>
          <div className='card-body text-center'>
            <h2 className='card-title'>{stats.inactivas}</h2>
            <p className='card-text'>Inactivas</p>
          </div>
        </div>
      </div>
      <div className='col-md-3 mb-3'>
        <div className='card bg-danger text-white'>
          <div className='card-body text-center'>
            <h2 className='card-title'>{formatCurrency(stats.saldoTotal)}</h2>
            <p className='card-text'>Saldo Pendiente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnidadStats;
