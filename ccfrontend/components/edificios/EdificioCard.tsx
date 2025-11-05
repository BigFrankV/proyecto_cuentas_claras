import Link from 'next/link';

import { Edificio } from '@/types/edificios';

interface EdificioCardProps {
  edificio: Edificio;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: (selected: boolean) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export default function EdificioCard({
  edificio,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
  showActions = true,
}: EdificioCardProps) {
  const getEstadoBadge = (estado: string) => {
    const badges = {
      activo: 'bg-success',
      inactivo: 'bg-secondary',
      construccion: 'bg-warning',
      mantenimiento: 'bg-info',
    };
    return badges[estado as keyof typeof badges] || 'bg-secondary';
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      residencial: 'home',
      comercial: 'business',
      mixto: 'domain',
      oficinas: 'corporate_fare',
    };
    return icons[tipo as keyof typeof icons] || 'business';
  };

  const getEstadoLabel = (estado: string) => {
    const labels = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      construccion: 'En Construcción',
      mantenimiento: 'En Mantenimiento',
    };
    return labels[estado as keyof typeof labels] || estado;
  };

  const ocupacionPorcentaje =
    edificio.totalUnidades > 0
      ? (edificio.totalUnidadesOcupadas / edificio.totalUnidades) * 100
      : 0;

  return (
    <div
      className={`card edificio-card h-100 ${isSelected ? 'border-primary' : ''}`}
    >
      <div className='card-body'>
        <div className='d-flex justify-content-between align-items-start mb-3'>
          <div className='d-flex align-items-center flex-grow-1'>
            {onSelect && (
              <input
                type='checkbox'
                className='form-check-input me-3'
                checked={isSelected}
                onChange={e => onSelect(e.target.checked)}
              />
            )}
            <div className='edificio-icon me-3'>
              <i className='material-icons'>{getTipoIcon(edificio.tipo)}</i>
            </div>
            <div className='flex-grow-1'>
              <h6 className='card-title mb-1'>{edificio.nombre}</h6>
              {edificio.codigo && (
                <small className='text-muted d-block'>{edificio.codigo}</small>
              )}
            </div>
          </div>
          <span className={`badge ${getEstadoBadge(edificio.estado)}`}>
            {getEstadoLabel(edificio.estado)}
          </span>
        </div>

        <p className='text-muted small mb-3'>
          <i className='material-icons me-1' style={{ fontSize: '16px' }}>
            location_on
          </i>
          {edificio.direccion}
        </p>

        {edificio.comunidadNombre && (
          <p className='text-muted small mb-3'>
            <i className='material-icons me-1' style={{ fontSize: '16px' }}>
              domain
            </i>
            {edificio.comunidadNombre}
          </p>
        )}

        <div className='row text-center mb-3'>
          <div className='col-4'>
            <div className='fw-semibold'>{edificio.totalUnidades}</div>
            <small className='text-muted'>Unidades</small>
          </div>
          <div className='col-4'>
            <div className='fw-semibold'>{edificio.numeroTorres}</div>
            <small className='text-muted'>Torres</small>
          </div>
          <div className='col-4'>
            <div className='fw-semibold'>{edificio.pisos}</div>
            <small className='text-muted'>Pisos</small>
          </div>
        </div>

        <div className='mb-3'>
          <div className='d-flex justify-content-between align-items-center mb-1'>
            <small className='text-muted'>Ocupación</small>
            <small className='text-muted'>
              {edificio.totalUnidadesOcupadas}/{edificio.totalUnidades}
            </small>
          </div>
          <div className='progress' style={{ height: '8px' }}>
            <div
              className='progress-bar bg-success'
              style={{ width: `${ocupacionPorcentaje}%` }}
            ></div>
          </div>
          <small className='text-muted'>
            {ocupacionPorcentaje.toFixed(1)}%
          </small>
        </div>

        {edificio.administrador && (
          <div className='mb-3'>
            <small className='text-muted d-block'>Administrador</small>
            <small className='fw-semibold'>{edificio.administrador}</small>
            {edificio.telefonoAdministrador && (
              <small className='text-muted d-block'>
                {edificio.telefonoAdministrador}
              </small>
            )}
          </div>
        )}

        {showActions && (
          <div className='d-flex justify-content-between align-items-center'>
            <Link
              href={`/edificios/${edificio.id}`}
              className='btn btn-outline-primary btn-sm'
            >
              <i className='material-icons me-1'>visibility</i>
              Ver Detalle
            </Link>
            <div className='btn-group' role='group'>
              {onEdit && (
                <button
                  className='btn btn-sm btn-outline-secondary'
                  onClick={onEdit}
                  title='Editar'
                >
                  <i className='material-icons'>edit</i>
                </button>
              )}
              {onDelete && (
                <button
                  className='btn btn-sm btn-outline-danger'
                  onClick={onDelete}
                  title='Eliminar'
                >
                  <i className='material-icons'>delete</i>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .edificio-card {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .edificio-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .edificio-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background-color: var(--bs-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
