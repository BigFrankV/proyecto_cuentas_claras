import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { useAuth } from '@/lib/useAuth';
import { validateIdentifier, formatIdentifier } from '@/lib/validators';

export default function Home() {
  const router = useRouter();
  const {
    login: authLogin,
    complete2FALogin,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [username, setUsername] = useState('');

  // Estado para validación de identificador
  const [identifierValue, setIdentifierValue] = useState('');
  const [identifierValidation, setIdentifierValidation] = useState<{
    isValid: boolean;
    type: string;
    message?: string | undefined;
  } | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log(
      '🏠 Estado auth en login page - autenticado:',
      isAuthenticated,
      'cargando:',
      authLoading,
    );
    if (isAuthenticated && !authLoading) {
      console.log('✅ Usuario autenticado, redirigiendo al dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Validar identificador en tiempo real
  useEffect(() => {
    if (identifierValue.trim()) {
      const validation = validateIdentifier(identifierValue);
      setIdentifierValidation(validation);
    } else {
      setIdentifierValidation(null);
    }
  }, [identifierValue]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;

    // Validación básica
    if (!identifierValue || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Validar formato del identificador
    if (identifierValidation && !identifierValidation.isValid) {
      setError(
        identifierValidation.message || 'Formato de identificador inválido',
      );
      return;
    }

    setIsLoading(true);
    setUsername(identifierValue); // Guardar identifier para 2FA

    try {
      // Formatear el identificador antes de enviarlo
      const formattedIdentifier = formatIdentifier(identifierValue);

      // Usar el login del contexto de autenticación
      const response = await authLogin(formattedIdentifier, password);

      // Verificar si se requiere 2FA
      if (response.twoFactorRequired && response.tempToken) {
        setRequires2FA(true);
        setTempToken(response.tempToken);
        setIsLoading(false);
        return;
      }

      // Si no requiere 2FA, la redirección se maneja en el useEffect cuando isAuthenticated cambie
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío de código 2FA
  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    if (!tempToken) {
      setError('Token temporal expirado. Por favor inicia sesión nuevamente.');
      setRequires2FA(false);
      return;
    }

    setIsLoading(true);

    try {
      await complete2FALogin(tempToken, twoFactorCode);
      // La redirección se maneja en el useEffect cuando isAuthenticated cambie
    } catch (err: any) {
      setError(err.message || 'Código de verificación inválido');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar 2FA y volver al login normal
  const cancel2FA = () => {
    setRequires2FA(false);
    setTempToken('');
    setTwoFactorCode('');
    setUsername('');
    setError('');
  };

  // Pre-llenar los campos con las credenciales por defecto
  const fillDefaultCredentials = () => {
    const usernameInput = document.querySelector(
      'input[name="username"]',
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;

    if (usernameInput) {usernameInput.value = 'patrick';}
    if (passwordInput) {passwordInput.value = 'patrick';}
  };

  return (
    <>
      <Head>
        <title>Entrar — Cuentas Claras</title>
      </Head>

      <div
        style={{
          background:
            'linear-gradient(180deg, var(--color-primary) 0%, #07244a 100%)',
          minHeight: '100vh',
          color: 'var(--bs-body-color)',
        }}
      >
        <div className='container'>
          <div className='row align-items-center' style={{ minHeight: '80vh' }}>
            {/* Hero Left Section */}
            <div className='col-lg-6 d-none d-lg-flex hero-left flex-column justify-content-center'>
              {/* Illustrative SVG (buildings) */}
              <div className='mb-4'>
                <svg
                  width='160'
                  height='96'
                  viewBox='0 0 160 96'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  aria-hidden='true'
                >
                  <rect
                    x='2'
                    y='28'
                    width='38'
                    height='66'
                    rx='3'
                    fill='rgba(255,255,255,0.06)'
                  />
                  <rect
                    x='44'
                    y='8'
                    width='28'
                    height='86'
                    rx='3'
                    fill='rgba(255,255,255,0.08)'
                  />
                  <rect
                    x='76'
                    y='36'
                    width='22'
                    height='58'
                    rx='3'
                    fill='rgba(255,255,255,0.05)'
                  />
                  <rect
                    x='102'
                    y='16'
                    width='36'
                    height='78'
                    rx='3'
                    fill='rgba(255,255,255,0.07)'
                  />
                  <rect
                    x='142'
                    y='44'
                    width='14'
                    height='50'
                    rx='3'
                    fill='rgba(255,255,255,0.045)'
                  />
                </svg>
              </div>
              <h1 className='mb-3'>Bienvenido a Cuentas Claras</h1>
              <p className='lead'>
                Gestiona tus comunidades, pagos y reportes desde una sola
                plataforma. Seguro, simple y hecho para administradores y
                residentes.
              </p>
              <p className='mt-3 small'>
                Empieza a optimizar la administración y relación con tus
                residentes hoy mismo.
              </p>

              <ul className='list-unstyled mt-4 feature-list'>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    payments
                  </span>
                  Pagos y conciliación automática
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    event
                  </span>
                  Reservas y control de amenidades
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    bar_chart
                  </span>
                  Reportes claros y exportables
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    support_agent
                  </span>
                  Comunicación y soporte integrado
                </li>
              </ul>
            </div>

            {/* Login Form Section */}
            <div className='col-lg-6'>
              <div className='login-wrap'>
                <div
                  className='login-card card p-4 shadow-lg w-100 align-self-center'
                  style={{ maxWidth: '520px' }}
                >
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3 login-illustration'>
                      <span
                        className='material-icons'
                        style={{
                          fontSize: '48px',
                          color: 'var(--color-accent)',
                        }}
                      >
                        lock
                      </span>
                    </div>
                    <div>
                      <div className='brand-lg h4 mb-0'>Cuentas Claras</div>
                      <small className='muted'>Gestión condominial</small>
                    </div>
                  </div>

                  {/* Título dinámico */}
                  <p className='text-muted'>
                    {requires2FA
                      ? 'Introduce el código de 6 dígitos de tu aplicación de autenticación.'
                      : 'Ingresa con tu correo, RUT, DNI o usuario para acceder al panel.'}
                  </p>

                  {error && (
                    <div
                      className='alert alert-danger alert-dismissible fade show'
                      role='alert'
                    >
                      <i
                        className='material-icons me-2'
                        style={{ fontSize: '1.2rem', verticalAlign: 'middle' }}
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

                  {/* Formulario normal de login */}
                  {!requires2FA && (
                    <form onSubmit={handleSubmit}>
                      <div className='mb-3'>
                        <label className='form-label'>
                          Correo, RUT, DNI o Usuario
                        </label>
                        <input
                          name='identifier'
                          type='text'
                          className={`form-control ${
                            identifierValidation
                              ? identifierValidation.isValid
                                ? 'is-valid'
                                : 'is-invalid'
                              : ''
                          }`}
                          placeholder='ejemplo@correo.com, 12345678-9, 12345678 o usuario'
                          value={identifierValue}
                          onChange={e => setIdentifierValue(e.target.value)}
                          required
                        />
                        {identifierValidation && (
                          <div
                            className={`${
                              identifierValidation.isValid
                                ? 'valid-feedback'
                                : 'invalid-feedback'
                            }`}
                          >
                            {identifierValidation.isValid
                              ? `Tipo detectado: ${
                                  identifierValidation.type === 'email'
                                    ? 'Correo electrónico'
                                    : identifierValidation.type === 'rut'
                                      ? 'RUT chileno'
                                      : identifierValidation.type === 'dni'
                                        ? 'DNI'
                                        : 'Nombre de usuario'
                                }`
                              : identifierValidation.message ||
                                'Formato inválido'}
                          </div>
                        )}
                        {!identifierValidation && (
                          <div className='form-text'>
                            Puedes usar tu correo electrónico, RUT (Chile), DNI
                            o nombre de usuario
                          </div>
                        )}
                      </div>
                      <div className='mb-3'>
                        <label className='form-label'>Contraseña</label>
                        <input
                          name='password'
                          type='password'
                          className='form-control'
                          placeholder='********'
                          required
                        />
                      </div>

                      <div className='d-flex justify-content-between align-items-center mb-3'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='remember'
                          />
                          <label
                            className='form-check-label'
                            htmlFor='remember'
                          >
                            Recordarme
                          </label>
                        </div>
                        <Link
                          href='/forgot-password'
                          className='small text-decoration-none'
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>

                      <div className='d-grid'>
                        <button
                          className='btn btn-primary'
                          type='submit'
                          disabled={isLoading}
                        >
                          {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Formulario de verificación 2FA */}
                  {requires2FA && (
                    <form onSubmit={handle2FASubmit}>
                      <div className='text-center mb-4'>
                        <div
                          className='d-inline-flex align-items-center justify-content-center bg-light rounded-circle'
                          style={{ width: '80px', height: '80px' }}
                        >
                          <span
                            className='material-icons'
                            style={{
                              fontSize: '40px',
                              color: 'var(--color-primary)',
                            }}
                          >
                            verified_user
                          </span>
                        </div>
                        <h5 className='mt-3 mb-1'>
                          Verificación de Dos Factores
                        </h5>
                        <p className='text-muted small mb-0'>
                          Usuario: <strong>{username}</strong>
                        </p>
                      </div>

                      <div className='mb-4'>
                        <label className='form-label text-center d-block'>
                          Código de Verificación
                        </label>
                        <input
                          type='text'
                          className='form-control text-center'
                          style={{
                            fontSize: '1.5rem',
                            letterSpacing: '0.5rem',
                            height: '60px',
                          }}
                          placeholder='000000'
                          value={twoFactorCode}
                          onChange={e =>
                            setTwoFactorCode(
                              e.target.value.replace(/\D/g, '').slice(0, 6),
                            )
                          }
                          maxLength={6}
                          required
                          autoFocus
                        />
                        <div className='form-text text-center'>
                          Ingresa el código de 6 dígitos de tu aplicación de
                          autenticación
                        </div>
                      </div>

                      <div className='d-grid gap-2'>
                        <button
                          className='btn btn-primary'
                          type='submit'
                          disabled={isLoading || twoFactorCode.length !== 6}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className='spinner-border spinner-border-sm me-2'
                                role='status'
                              ></span>
                              Verificando...
                            </>
                          ) : (
                            'Verificar Código'
                          )}
                        </button>
                        <button
                          type='button'
                          className='btn btn-outline-secondary'
                          onClick={cancel2FA}
                          disabled={isLoading}
                        >
                          <span
                            className='material-icons me-2'
                            style={{ fontSize: '18px' }}
                          >
                            arrow_back
                          </span>
                          Volver al Login
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Credenciales de desarrollo - solo mostrar en login normal */}
                  {!requires2FA && (
                    <div className='text-center mt-3 small text-muted'>
                      Credenciales de desarrollo:{' '}
                      <button
                        type='button'
                        className='btn btn-link btn-sm p-0 text-decoration-none'
                        onClick={fillDefaultCredentials}
                        style={{ fontSize: 'inherit' }}
                      >
                        <strong>patrick</strong> / <strong>patrick</strong>
                      </button>
                      <br />
                      <small className='text-muted'>
                        Haz click para completar automáticamente
                      </small>
                    </div>
                  )}

                  {/* Información adicional para 2FA */}
                  {requires2FA && (
                    <div className='text-center mt-3'>
                      <div className='alert alert-info border-0 bg-light'>
                        <div className='d-flex align-items-start'>
                          <span
                            className='material-icons me-2 text-primary'
                            style={{ fontSize: '20px' }}
                          >
                            info
                          </span>
                          <div className='text-start small'>
                            <strong>
                              ¿No tienes acceso a tu aplicación de
                              autenticación?
                            </strong>
                            <br />
                            Contacta al administrador del sistema para
                            desactivar temporalmente 2FA en tu cuenta.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .brand-lg {
          color: var(--color-accent);
          font-weight: 700;
          letter-spacing: 0.4px;
        }
        .login-illustration {
          width: 120px;
          height: 120px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-left {
          color: white;
          padding: 48px 32px;
        }
        .hero-left h1 {
          font-size: 28px;
          line-height: 1.05;
        }
        .hero-left p {
          color: rgba(255, 255, 255, 0.85);
        }
        .login-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
        }
        @media (max-width: 767px) {
          .hero-left {
            text-align: center;
            padding: 24px;
          }
          .login-wrap {
            padding: 24px 0;
          }
        }
      `}</style>
    </>
  );
}
