import { Permission, usePermissions } from '@/lib/usePermissions';

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

interface UnidadActionsProps {
  selectedUnidades: string[];
  unidades: Unidad[];
  onDeleteSelected: () => void;
  onExport: () => void;
  onImport: () => void;
}

const UnidadActions: React.FC<UnidadActionsProps> = ({
  selectedUnidades,
  onDeleteSelected,
}) => {
  const hasSelectedUnidades = selectedUnidades.length > 0;
  const { hasPermission } = usePermissions();

  return (
    <>
      {/* Acciones en lote */}
      {hasSelectedUnidades && (
        <div className='alert alert-info d-flex align-items-center justify-content-between mb-3'>
          <div className='d-flex align-items-center'>
            <i className='material-icons me-2'>info</i>
            <span>
              {selectedUnidades.length} unidad
              {selectedUnidades.length !== 1 ? 'es' : ''} seleccionada
              {selectedUnidades.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className='d-flex gap-2'>
            {hasPermission(Permission.EDIT_UNIDAD) && (
              <button
                className='btn btn-sm btn-outline-primary'
                title='Asignar cargos en lote'
              >
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  assignment
                </i>
                Asignar Cargos
              </button>
            )}
            {hasPermission(Permission.EDIT_UNIDAD) && (
              <button
                className='btn btn-sm btn-outline-warning'
                title='Cambiar estado en lote'
              >
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  edit
                </i>
                Cambiar Estado
              </button>
            )}
            {hasPermission(Permission.DELETE_UNIDAD) && (
              <button
                className='btn btn-sm btn-outline-danger'
                onClick={onDeleteSelected}
                title='Eliminar seleccionadas'
              >
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  delete
                </i>
                Eliminar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de importación */}
      <div className='modal fade' id='importModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                <i className='material-icons me-2'>upload</i>
                Importar Unidades
              </h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
              ></button>
            </div>
            <div className='modal-body'>
              <div className='mb-3'>
                <label className='form-label'>Archivo Excel</label>
                <input
                  type='file'
                  className='form-control'
                  accept='.xlsx,.xls'
                />
                <div className='form-text'>
                  Formatos soportados: .xlsx, .xls
                </div>
              </div>
              <div className='alert alert-info'>
                <h6 className='alert-heading'>
                  <i
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    info
                  </i>
                  Formato requerido
                </h6>
                <p className='mb-2'>
                  El archivo debe contener las siguientes columnas:
                </p>
                <ul className='mb-0'>
                  <li>Número de Unidad</li>
                  <li>Piso</li>
                  <li>Torre</li>
                  <li>Edificio</li>
                  <li>Tipo (Departamento, Casa, Local, Oficina)</li>
                  <li>Superficie (m²)</li>
                  <li>Dormitorios</li>
                  <li>Baños</li>
                  <li>Propietario (opcional)</li>
                </ul>
              </div>
              <div className='d-flex gap-2'>
                <button className='btn btn-outline-secondary btn-sm'>
                  <i
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    download
                  </i>
                  Descargar Plantilla
                </button>
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
              >
                Cancelar
              </button>
              <button type='button' className='btn btn-primary'>
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  upload
                </i>
                Importar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <div className='modal fade' id='deleteModal' tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title text-danger'>
                <i className='material-icons me-2'>warning</i>
                Confirmar Eliminación
              </h5>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
              ></button>
            </div>
            <div className='modal-body'>
              <p>
                ¿Está seguro que desea eliminar las {selectedUnidades.length}{' '}
                unidades seleccionadas?
              </p>
              <div className='alert alert-warning'>
                <strong>¡Atención!</strong> Esta acción no se puede deshacer. Se
                eliminarán todos los datos asociados a estas unidades.
              </div>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
              >
                Cancelar
              </button>
              <button
                type='button'
                className='btn btn-danger'
                onClick={onDeleteSelected}
                data-bs-dismiss='modal'
              >
                <i className='material-icons me-1' style={{ fontSize: '16px' }}>
                  delete
                </i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnidadActions;
