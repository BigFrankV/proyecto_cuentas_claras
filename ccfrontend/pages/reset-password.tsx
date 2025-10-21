import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import authService from '@/lib/auth';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Verificar que hay un token en la URL
    if (router.isReady && !token) {
      setTokenValid(false);
    }
  }, [router.isReady, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return 'La contraseña debe incluir al menos un número';
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return 'La contraseña debe incluir al menos un símbolo (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const { password, confirmPassword } = formData;

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!token) {
      setError('Token de restablecimiento no válido');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token as string, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/');
  };

  // Si no hay token válido, mostrar error
  if (!tokenValid) {
    return (
      <>
        <Head>
          <title>Token Inválido — Cuentas Claras</title>
        </Head>
        <div className='container-fluid min-vh-100 p-0'>
          <div className='row g-0 min-vh-100'>
            <div className='col-12'>
              <div className='d-flex flex-column min-vh-100 p-4 p-md-5 justify-content-center align-items-center'>
                <div className='text-center'>
                  <span
                    className='material-icons text-danger mb-3'
                    style={{ fontSize: '72px' }}
                  >
                    error
                  </span>
                  <h1 className='h2 fw-bold mb-3'>Token no válido</h1>
                  <p className='text-muted mb-4'>
                    El enlace de restablecimiento no es válido o ha expirado.
                    Por favor, solicita un nuevo enlace.
                  </p>
                  <button
                    onClick={() => router.push('/forgot-password')}
                    className='btn btn-primary me-2'
                  >
                    Solicitar nuevo enlace
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className='btn btn-outline-secondary'
                  >
                    Ir al login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Restablecer Contraseña — Cuentas Claras</title>
      </Head>

      <div className='container-fluid min-vh-100 p-0'>
        <div className='row g-0 min-vh-100'>
          {/* Columna izquierda: imagen de fondo y mensaje */}
          <div
            className='col-lg-6 d-none d-lg-block'
            style={{
              background:
                'linear-gradient(180deg, var(--color-primary) 0%, #071a38 100%)',
            }}
          >
            <div className='d-flex flex-column h-100 p-5 text-white justify-content-center align-items-center text-center'>
              <div className='mb-5'>
                <span
                  className='material-icons'
                  style={{ fontSize: '72px', color: 'var(--color-accent)' }}
                >
                  password
                </span>
              </div>
              <h1 className='fw-bold display-5 mb-3'>Crear nueva contraseña</h1>
              <p className='lead'>
                Estás a un paso de recuperar el acceso a tu cuenta.
              </p>
            </div>
          </div>

          {/* Columna derecha: formulario de reset */}
          <div className='col-lg-6 col-12'>
            <div className='d-flex flex-column min-vh-100 p-4 p-md-5 justify-content-center'>
              <div className='mb-5'>
                <div className='text-center mb-4'>
                  <h1 className='h2 fw-bold'>Restablecer contraseña</h1>
                  <p className='text-muted'>
                    Por favor, crea una nueva contraseña segura para tu cuenta.
                  </p>
                </div>
              </div>

              <div className='card shadow border-0'>
                <div className='card-body p-4'>
                  {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div
                          className='alert alert-danger alert-dismissible fade show mb-4'
                          role='alert'
                        >
                          <i
                            className='material-icons me-2'
                            style={{
                              fontSize: '1.2rem',
                              verticalAlign: 'middle',
                            }}
                          >
                            error
                          </i>
                          {error}
                          <button
                            type='button'
                            className='btn-close'
                            onClick={() => setError('')}
                            aria-label='Close'
                          ></button>
                        </div>
                      )}

                      <div className='mb-4'>
                        <label htmlFor='password' className='form-label'>
                          Nueva contraseña{' '}
                          <span className='text-danger'>*</span>
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>
                            <span className='material-icons'>lock</span>
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className='form-control'
                            id='password'
                            name='password'
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                          <button
                            className='btn btn-outline-secondary'
                            type='button'
                            onClick={() => togglePasswordVisibility('password')}
                          >
                            <span className='material-icons'>
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                        <div className='form-text'>
                          Mínimo 8 caracteres, incluye números y símbolos.
                        </div>
                      </div>

                      <div className='mb-4'>
                        <label htmlFor='confirmPassword' className='form-label'>
                          Confirmar nueva contraseña{' '}
                          <span className='text-danger'>*</span>
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>
                            <span className='material-icons'>lock</span>
                          </span>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className='form-control'
                            id='confirmPassword'
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                          />
                          <button
                            className='btn btn-outline-secondary'
                            type='button'
                            onClick={() =>
                              togglePasswordVisibility('confirmPassword')
                            }
                          >
                            <span className='material-icons'>
                              {showConfirmPassword
                                ? 'visibility_off'
                                : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className='d-grid'>
                        <button
                          type='submit'
                          className='btn btn-primary'
                          disabled={isLoading}
                        >
                          {isLoading
                            ? 'Restableciendo...'
                            : 'Restablecer contraseña'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Mensaje de éxito
                    <div className='text-center'>
                      <div className='text-center text-success mb-3'>
                        <span
                          className='material-icons'
                          style={{ fontSize: '48px' }}
                        >
                          check_circle
                        </span>
                      </div>
                      <h5 className='text-center'>¡Contraseña restablecida!</h5>
                      <p className='text-center'>
                        Tu contraseña ha sido actualizada correctamente. Ya
                        puedes iniciar sesión con tu nueva contraseña.
                      </p>
                      <div className='d-grid mt-3'>
                        <button
                          onClick={handleGoToLogin}
                          className='btn btn-primary'
                        >
                          Ir a iniciar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='mt-5 text-center'>
                <small className='text-muted'>
                  Cuentas Claras &copy; 2025. Todos los derechos reservados.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
