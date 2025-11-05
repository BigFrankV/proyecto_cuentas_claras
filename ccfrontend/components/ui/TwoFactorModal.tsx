import { useState } from 'react';

import { TotpSetupResponse } from '@/types/profile';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupData?: TotpSetupResponse | null;
  onEnable?: (code: string) => Promise<void>;
  onDisable?: (code: string) => Promise<void>;
  mode: 'setup' | 'disable';
  isLoading?: boolean;
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  setupData,
  onEnable,
  onDisable,
  mode,
  isLoading = false,
}: TwoFactorModalProps) {
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    if (code.length !== 6) {return;}

    try {
      if (mode === 'setup' && onEnable) {
        await onEnable(code);
      } else if (mode === 'disable' && onDisable) {
        await onDisable(code);
      }
      setCode('');
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  if (!isOpen) {return null;}

  return (
    <div
      className='modal fade show d-block'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className={`modal-dialog ${mode === 'setup' ? 'modal-lg' : ''}`}>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>
              {mode === 'setup'
                ? 'Configurar Autenticación de Dos Factores'
                : 'Desactivar 2FA'}
            </h5>
            <button
              type='button'
              className='btn-close'
              onClick={handleClose}
              disabled={isLoading}
            ></button>
          </div>
          <div className='modal-body'>
            {mode === 'setup' && setupData ? (
              <div className='row'>
                <div className='col-md-6'>
                  <h6>1. Escanea el código QR</h6>
                  <p className='text-muted small mb-3'>
                    Usa Google Authenticator, Authy u otra aplicación compatible
                  </p>
                  <div className='text-center mb-3'>
                    <img
                      src={setupData.qr}
                      alt='QR Code'
                      className='img-fluid border rounded'
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                  <p className='text-muted small'>
                    ¿No puedes escanear? Introduce este código manualmente:
                  </p>
                  <div className='bg-light p-2 rounded'>
                    <code className='small text-break'>{setupData.base32}</code>
                  </div>
                </div>
                <div className='col-md-6'>
                  <h6>2. Introduce el código de verificación</h6>
                  <p className='text-muted small mb-3'>
                    Escribe el código de 6 dígitos que aparece en tu aplicación
                  </p>
                  <div className='mb-3'>
                    <input
                      type='text'
                      className='form-control text-center'
                      style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                      placeholder='000000'
                      value={code}
                      onChange={e =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      maxLength={6}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <div className='alert alert-info'>
                    <span className='material-icons me-2'>info</span>
                    <small>
                      Una vez activado, necesitarás tu aplicación de
                      autenticación para iniciar sesión.
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className='alert alert-warning'>
                  <span className='material-icons me-2'>warning</span>
                  <strong>¡Atención!</strong> Desactivar 2FA reducirá la
                  seguridad de tu cuenta.
                </div>
                <p>
                  Para confirmar, introduce el código de verificación de tu
                  aplicación:
                </p>
                <div className='text-center'>
                  <input
                    type='text'
                    className='form-control text-center d-inline-block'
                    style={{
                      fontSize: '1.5rem',
                      letterSpacing: '0.5rem',
                      width: '200px',
                    }}
                    placeholder='000000'
                    value={code}
                    onChange={e =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    maxLength={6}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type='button'
              className={`btn ${mode === 'setup' ? 'btn-success' : 'btn-danger'}`}
              onClick={handleSubmit}
              disabled={code.length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm me-2'
                    role='status'
                  ></span>
                  {mode === 'setup' ? 'Activando...' : 'Desactivando...'}
                </>
              ) : (
                <>
                  <span className='material-icons me-2'>
                    {mode === 'setup' ? 'add_moderator' : 'remove_moderator'}
                  </span>
                  {mode === 'setup' ? 'Activar 2FA' : 'Desactivar 2FA'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

