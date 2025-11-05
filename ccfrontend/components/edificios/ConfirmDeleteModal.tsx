interface ConfirmDeleteModalProps {
  isOpen: boolean;
  edificioNombre: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  edificioNombre,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) {return null;}

  return (
    <>
      <div
        className='modal fade show d-block'
        tabIndex={-1}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                <i className='material-icons me-2 text-danger'>warning</i>
                Confirmar Eliminación
              </h5>
              <button
                type='button'
                className='btn-close'
                onClick={onCancel}
                disabled={loading}
              ></button>
            </div>
            <div className='modal-body'>
              <div className='alert alert-warning d-flex align-items-center'>
                <i className='material-icons me-2'>info</i>
                <div>
                  Esta acción no se puede deshacer y eliminará toda la
                  información relacionada.
                </div>
              </div>
              <p>
                ¿Estás seguro de que deseas eliminar el edificio{' '}
                <strong>{edificioNombre}</strong>?
              </p>
              <p className='text-muted small'>Se eliminarán también:</p>
              <ul className='text-muted small'>
                <li>Todas las torres asociadas</li>
                <li>Todas las unidades del edificio</li>
                <li>Historial de pagos y emisiones</li>
                <li>Documentos y archivos relacionados</li>
              </ul>
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={onCancel}
                disabled={loading}
              >
                <i className='material-icons me-1'>close</i>
                Cancelar
              </button>
              <button
                type='button'
                className='btn btn-danger'
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                    >
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <i className='material-icons me-1'>delete_forever</i>
                    Eliminar Edificio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

