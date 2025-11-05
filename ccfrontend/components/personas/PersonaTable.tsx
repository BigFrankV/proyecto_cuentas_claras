import Link from 'next/link';

interface Persona {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: 'Propietario' | 'Inquilino' | 'Administrador';
  estado: 'Activo' | 'Inactivo';
  unidades: number;
}

interface PersonaTableProps {
  personas: Persona[];
}

export default function PersonaTable({ personas }: PersonaTableProps) {
  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (tipo: string) => {
    switch (tipo) {
      case 'Propietario':
        return 'var(--color-success)';
      case 'Inquilino':
        return 'var(--color-info)';
      case 'Administrador':
        return 'var(--color-warning)';
      default:
        return 'var(--color-primary)';
    }
  };

  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Propietario':
        return 'bg-success';
      case 'Inquilino':
        return 'bg-info';
      case 'Administrador':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className='card shadow-sm'>
      <div className='table-responsive'>
        <table className='table table-hover mb-0'>
          <thead className='table-light'>
            <tr>
              <th scope='col' style={{ width: '50px' }}>
                #
              </th>
              <th scope='col'>Nombre</th>
              <th scope='col'>Tipo</th>
              <th scope='col'>Email</th>
              <th scope='col'>Teléfono</th>
              <th scope='col'>Unidades</th>
              <th scope='col'>Estado</th>
              <th scope='col' style={{ width: '120px' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {personas.map((persona, index) => (
              <tr key={persona.id}>
                <td>{index + 1}</td>
                <td>
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-2 d-flex align-items-center justify-content-center text-white'
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: getAvatarColor(persona.tipo),
                        fontSize: '12px',
                      }}
                    >
                      {getInitials(persona.nombre)}
                    </div>
                    <div>
                      <div className='fw-semibold'>{persona.nombre}</div>
                      <div className='small text-muted'>DNI: {persona.dni}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getTipoBadgeClass(persona.tipo)}`}>
                    {persona.tipo}
                  </span>
                </td>
                <td>{persona.email}</td>
                <td>{persona.telefono}</td>
                <td>
                  {persona.tipo === 'Administrador' ? (
                    <span className='badge bg-secondary'>No aplica</span>
                  ) : (
                    <span className='badge bg-primary'>
                      {persona.unidades} unidad
                      {persona.unidades !== 1 ? 'es' : ''}
                    </span>
                  )}
                </td>
                <td>
                  <span className='d-flex align-items-center'>
                    <span
                      className={'me-2'}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor:
                          persona.estado === 'Activo'
                            ? 'var(--color-success)'
                            : 'var(--color-muted)',
                      }}
                    />
                    {persona.estado}
                  </span>
                </td>
                <td>
                  <div className='btn-group'>
                    <Link
                      href={`/personas/${persona.id}`}
                      className='btn btn-sm btn-outline-primary'
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '16px' }}
                      >
                        visibility
                      </i>
                    </Link>
                    <button
                      type='button'
                      className='btn btn-sm btn-outline-secondary'
                    >
                      <i
                        className='material-icons'
                        style={{ fontSize: '16px' }}
                      >
                        more_vert
                      </i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
