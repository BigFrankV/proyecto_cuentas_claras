import Link from 'next/link';

interface Unidad {
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
  residente?: string;
  saldoPendiente: number;
  ultimoPago?: string;
}

interface UnidadTableProps {
  unidades: Unidad[];
  selectedUnidades: string[];
  onSelectUnidad: (unidadId: string) => void;
  onSelectAll: () => void;
}

const UnidadTable: React.FC<UnidadTableProps> = ({
  unidades,
  selectedUnidades,
  onSelectUnidad,
  onSelectAll,
}) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='card'>
      <div className='card-body p-0'>
        <div className='table-responsive'>
          <table className='table table-hover mb-0'>
            <thead className='table-light'>
              <tr>
                <th>
                  <input
                    type='checkbox'
                    className='form-check-input'
                    checked={
                      selectedUnidades.length === unidades.length &&
                      unidades.length > 0
                    }
                    onChange={onSelectAll}
                  />
                </th>
                <th>Unidad</th>
                <th>Ubicación</th>
                <th>Tipo</th>
                <th>Propietario</th>
                <th>Estado</th>
                <th>Saldo</th>
                <th className='actions-cell'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unidades.map(unidad => (
                <tr key={unidad.id} style={{ verticalAlign: 'middle' }}>
                  <td>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      checked={selectedUnidades.includes(unidad.id)}
                      onChange={() => onSelectUnidad(unidad.id)}
                    />
                  </td>
                  <td>
                    <div className='d-flex align-items-center'>
                      <div
                        className='me-3 d-flex align-items-center justify-content-center text-white'
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--color-primary)',
                        }}
                      >
                        <i className='material-icons'>
                          {getTipoIcon(unidad.tipo)}
                        </i>
                      </div>
                      <div>
                        <div className='fw-medium'>{unidad.numero}</div>
                        <div className='small text-muted'>
                          Piso {unidad.piso} • {unidad.superficie} m²
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{unidad.torre}</div>
                    <div className='small text-muted'>{unidad.edificio}</div>
                  </td>
                  <td>
                    <span className='badge bg-light text-dark'>
                      {unidad.tipo}
                    </span>
                    <div className='small text-muted mt-1'>
                      {unidad.dormitorios}D/{unidad.banos}B
                    </div>
                  </td>
                  <td>
                    <div>{unidad.propietario || '-'}</div>
                    {unidad.residente &&
                      unidad.residente !== unidad.propietario && (
                        <div className='small text-muted'>
                          Residente: {unidad.residente}
                        </div>
                      )}
                  </td>
                  <td>
                    <span
                      className={`badge ${getEstadoBadgeClass(unidad.estado)}`}
                    >
                      {unidad.estado}
                    </span>
                  </td>
                  <td>
                    <div
                      className={
                        unidad.saldoPendiente > 0
                          ? 'text-danger fw-medium'
                          : 'text-success'
                      }
                    >
                      {formatCurrency(unidad.saldoPendiente)}
                    </div>
                    {unidad.ultimoPago && (
                      <div className='small text-muted'>
                        Último: {formatDate(unidad.ultimoPago)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className='d-flex gap-1'>
                      <Link
                        href={`/unidades/${unidad.id}`}
                        className='btn btn-sm btn-outline-primary'
                      >
                        <i
                          className='material-icons'
                          style={{ fontSize: '16px' }}
                        >
                          visibility
                        </i>
                      </Link>
                      <Link
                        href={`/unidades/${unidad.id}/cargos`}
                        className='btn btn-sm btn-outline-secondary'
                      >
                        <i
                          className='material-icons'
                          style={{ fontSize: '16px' }}
                        >
                          receipt
                        </i>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnidadTable;

