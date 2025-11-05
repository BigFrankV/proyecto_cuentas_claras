import Link from 'next/link';

interface UnidadCardProps {
  unidad: {
    id: string;
    numero: string;
    piso: number;
    torre: string;
    edificio: string;
    tipo: 'Departamento' | 'Casa' | 'Local' | 'Oficina';
    superficie: number;
    dormitorios: number;
    banos: number;
    estado: 'Activa' | 'Inactiva' | 'Mantenimiento';
    propietario?: string;
    saldoPendiente: number;
  };
}

const UnidadCard: React.FC<UnidadCardProps> = ({ unidad }) => {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Departamento':
        return 'apartment';
      case 'Casa':
        return 'home';
      case 'Local':
        return 'store';
      case 'Oficina':
        return 'business';
      default:
        return 'location_city';
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activa':
        return 'bg-success';
      case 'Inactiva':
        return 'bg-warning';
      case 'Mantenimiento':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  return (
    <div
      className='card h-100 position-relative'
      style={{
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className='position-absolute top-0 end-0 p-2'>
        <span className={`badge ${getEstadoBadgeClass(unidad.estado)}`}>
          {unidad.estado}
        </span>
      </div>

      <div className='card-body' style={{ padding: '1.25rem' }}>
        <div className='d-flex align-items-center mb-3'>
          <div
            className='me-3 d-flex align-items-center justify-content-center text-white'
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
            }}
          >
            <i className='material-icons'>{getTipoIcon(unidad.tipo)}</i>
          </div>
          <div>
            <h5 className='card-title mb-0'>{unidad.numero}</h5>
            <p className='card-text text-muted small mb-0'>
              Piso {unidad.piso} • {unidad.superficie} m²
            </p>
          </div>
        </div>

        <div className='mb-3'>
          <div className='small text-muted'>Ubicación:</div>
          <div>{unidad.torre}</div>
          <div className='small text-muted'>{unidad.edificio}</div>
        </div>

        <div className='mb-3'>
          <span className='badge bg-light text-dark me-2'>{unidad.tipo}</span>
          <span className='badge bg-light text-dark'>
            {unidad.dormitorios}D/{unidad.banos}B
          </span>
        </div>

        {unidad.propietario && (
          <div className='mb-3'>
            <div className='small text-muted'>Propietario:</div>
            <div className='fw-medium'>{unidad.propietario}</div>
          </div>
        )}

        <div className='mb-3'>
          <div className='small text-muted'>Saldo Pendiente:</div>
          <div
            className={`fw-medium ${unidad.saldoPendiente > 0 ? 'text-danger' : 'text-success'}`}
          >
            {formatCurrency(unidad.saldoPendiente)}
          </div>
        </div>

        <div className='d-flex justify-content-between mt-auto'>
          <Link
            href={`/unidades/${unidad.id}`}
            className='btn btn-outline-primary btn-sm'
          >
            <i className='material-icons me-1' style={{ fontSize: '16px' }}>
              visibility
            </i>
            Ver
          </Link>
          <Link
            href={`/unidades/${unidad.id}/cargos`}
            className='btn btn-primary btn-sm'
          >
            <i className='material-icons me-1' style={{ fontSize: '16px' }}>
              receipt
            </i>
            Cargos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnidadCard;
