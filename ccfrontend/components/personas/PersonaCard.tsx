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

interface PersonaCardProps {
  persona: Persona;
}

export default function PersonaCard({ persona }: PersonaCardProps) {
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
    <div className='col-xl-4 col-lg-6 col-md-6 mb-4'>
      <div
        className='card h-100'
        style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
      >
        <div className='card-body' style={{ padding: '1.25rem' }}>
          <div className='d-flex justify-content-between align-items-start mb-3'>
            <div className='d-flex align-items-center'>
              <div
                className='me-3 d-flex align-items-center justify-content-center text-white'
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: getAvatarColor(persona.tipo),
                  fontSize: '20px',
                }}
              >
                {getInitials(persona.nombre)}
              </div>
              <div>
                <h6 className='mb-1'>{persona.nombre}</h6>
                <div className='small text-muted'>DNI: {persona.dni}</div>
              </div>
            </div>
            <span className={`badge ${getTipoBadgeClass(persona.tipo)}`}>
              {persona.tipo}
            </span>
          </div>

          <div className='mb-3'>
            <div className='small text-muted mb-1'>Email</div>
            <div>{persona.email}</div>
          </div>

          <div className='mb-3'>
            <div className='small text-muted mb-1'>Teléfono</div>
            <div>{persona.telefono}</div>
          </div>

          <div className='d-flex justify-content-between align-items-center'>
            <div>
              {persona.tipo === 'Administrador' ? (
                <span className='badge bg-secondary'>No aplica</span>
              ) : (
                <span className='badge bg-primary'>
                  {persona.unidades} unidad{persona.unidades !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <div className='d-flex align-items-center'>
              <span
                className='me-2'
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
              <span className='small'>{persona.estado}</span>
            </div>
          </div>

          <div className='d-flex gap-2 mt-3'>
            <Link
              href={`/personas/${persona.id}`}
              className='btn btn-outline-primary btn-sm flex-fill'
            >
              <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                visibility
              </i>
              Ver Detalle
            </Link>
            <button className='btn btn-outline-secondary btn-sm'>
              <i className='material-icons' style={{ fontSize: '16px' }}>
                more_vert
              </i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

