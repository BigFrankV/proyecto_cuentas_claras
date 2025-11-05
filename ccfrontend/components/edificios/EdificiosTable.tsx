import Link from 'next/link';

import { Edificio } from '@/types/edificios';

interface EdificiosTableProps {
  edificios: Edificio[];
  selectedEdificios: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectEdificio: (id: string, checked: boolean) => void;
  onEdit: (edificio: Edificio) => void;
  onDelete: (edificio: Edificio) => void;
  loading?: boolean;
}

export default function EdificiosTable({
  edificios,
  selectedEdificios,
  onSelectAll,
  onSelectEdificio,
  onEdit,
  onDelete,
  loading = false,
}: EdificiosTableProps) {
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

  const getTipoLabel = (tipo: string) => {
    const labels = {
      residencial: 'Residencial',
      comercial: 'Comercial',
      mixto: 'Mixto',
      oficinas: 'Oficinas',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  if (loading) {
    return (
      <div className='card shadow-sm mb-4'>
        <div className='card-body p-0'>
          <div className='table-responsive'>
            <table className='table table-hover mb-0'>
              <thead className='table-light'>
                <tr>
                  <th style={{ width: '40px' }}>
                    <div className='placeholder-glow'>
                      <span className='placeholder w-100'></span>
                    </div>
                  </th>
                  <th>Edificio</th>
                  <th>Comunidad</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Unidades</th>
                  <th>Ocupación</th>
                  <th>Administrador</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i}>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-75'></span>
                        <span className='placeholder w-50'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
                      </div>
                    </td>
                    <td>
                      <div className='placeholder-glow'>
                        <span className='placeholder w-100'></span>
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
  }

  return (
    <div className='card shadow-sm mb-4'>
      <div className='card-body p-0'>
        <div className='table-responsive'>
          <table className='table table-hover mb-0'>
            <thead className='table-light'>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type='checkbox'
                    className='form-check-input'
                    checked={
                      selectedEdificios.length === edificios.length &&
                      edificios.length > 0
                    }
                    onChange={e => onSelectAll(e.target.checked)}
                  />
                </th>
                <th>Edificio</th>
                <th>Comunidad</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Unidades</th>
                <th>Ocupación</th>
                <th>Administrador</th>
                <th style={{ width: '120px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {edificios.length === 0 ? (
                <tr>
                  <td colSpan={9} className='text-center py-4'>
                    <div className='text-muted'>
                      <i
                        className='material-icons mb-2'
                        style={{ fontSize: '48px' }}
                      >
                        business
                      </i>
                      <div>No se encontraron edificios</div>
                      <small>
                        Intenta cambiar los filtros o crear un nuevo edificio
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                edificios.map(edificio => (
                  <tr key={edificio.id}>
                    <td>
                      <input
                        type='checkbox'
                        className='form-check-input'
                        checked={selectedEdificios.includes(edificio.id)}
                        onChange={e =>
                          onSelectEdificio(edificio.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <div className='d-flex align-items-center'>
                        <div className='edificio-icon me-3'>
                          <i className='material-icons'>
                            {getTipoIcon(edificio.tipo)}
                          </i>
                        </div>
                        <div>
                          <div className='fw-semibold'>{edificio.nombre}</div>
                          {edificio.codigo && (
                            <div className='text-muted small'>
                              {edificio.codigo}
                            </div>
                          )}
                          <div className='text-muted small'>
                            {edificio.direccion}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className='text-muted'>
                        {edificio.comunidadNombre}
                      </span>
                    </td>
                    <td>
                      <span className='badge bg-light text-dark'>
                        {getTipoLabel(edificio.tipo)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getEstadoBadge(edificio.estado)}`}
                      >
                        {getEstadoLabel(edificio.estado)}
                      </span>
                    </td>
                    <td>
                      <div className='text-center'>
                        <div className='fw-semibold'>
                          {edificio.totalUnidades}
                        </div>
                        <div className='text-muted small'>
                          {edificio.numeroTorres} torre(s)
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className='d-flex align-items-center'>
                        <div className='flex-grow-1 me-2'>
                          <div className='progress' style={{ height: '8px' }}>
                            <div
                              className='progress-bar bg-success'
                              style={{
                                width: `${(edificio.totalUnidadesOcupadas / edificio.totalUnidades) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <small className='text-muted'>
                          {(
                            (edificio.totalUnidadesOcupadas /
                              edificio.totalUnidades) *
                            100
                          ).toFixed(0)}
                          %
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className='fw-semibold small'>
                          {edificio.administrador}
                        </div>
                        {edificio.telefonoAdministrador && (
                          <div className='text-muted small'>
                            {edificio.telefonoAdministrador}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className='btn-group' role='group'>
                        <Link
                          href={`/edificios/${edificio.id}`}
                          className='btn btn-sm btn-outline-primary'
                          title='Ver detalle'
                        >
                          <i className='material-icons'>visibility</i>
                        </Link>
                        <button
                          className='btn btn-sm btn-outline-secondary'
                          title='Editar'
                          onClick={() => onEdit(edificio)}
                        >
                          <i className='material-icons'>edit</i>
                        </button>
                        <button
                          className='btn btn-sm btn-outline-danger'
                          title='Eliminar'
                          onClick={() => onDelete(edificio)}
                        >
                          <i className='material-icons'>delete</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
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

        .table tr {
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
}
