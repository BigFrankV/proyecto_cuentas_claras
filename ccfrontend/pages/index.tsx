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
    // eslint-disable-next-line no-console
    console.log(
      '🏠 Estado auth en login page - autenticado:',
      isAuthenticated,
      'cargando:',
      authLoading,
    );
    if (isAuthenticated && !authLoading) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.log('📱 Enviando código 2FA...');
      await complete2FALogin(tempToken, twoFactorCode);
      // eslint-disable-next-line no-console
      console.log('✅ Código 2FA verificado, esperando redirección...');
      // La redirección se maneja en el useEffect cuando isAuthenticated cambie
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('❌ Error en 2FA:', err);
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

    if (usernameInput) {
      usernameInput.value = 'patrick';
    }
    if (passwordInput) {
      passwordInput.value = 'patrick';
    }
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
                {/* <svg
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
                </svg> */}
              </div>
              <h1 className='mb-3'>Bienvenido a Cuentas Claras</h1>
              <p className='lead'>
                Cuentas Claras es una plataforma integral diseñada para optimizar la administración de comunidades y condominios mediante herramientas profesionales, análisis avanzado y procesos automatizados.
              </p>


              <ul className='list-unstyled mt-4 feature-list'>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    dashboard
                  </span>
                  Panel ejecutivo con indicadores en tiempo real, facilitando decisiones rápidas y basadas en datos.
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    business
                  </span>
                  Gestión centralizada de comunidades y edificios, con soporte para múltiples configuraciones.
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    apartment
                  </span>
                  Control detallado de unidades, propietarios, arrendatarios y ocupación.
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    payments
                  </span>
                  Sistema financiero robusto, con pagos online, conciliación automática y trazabilidad completa.
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    receipt_long
                  </span>
                  Generación automática de documentos contables y administrativos.
                </li>


                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    bar_chart
                  </span>
                  Reportes avanzados para análisis financiero, operativo y de cumplimiento.
                </li>
                <li className='mb-2'>
                  <span
                    className='material-icons align-middle me-2'
                    style={{ color: 'var(--color-accent)' }}
                  >
                    support_agent
                  </span>
                  Plataforma de soporte y atención mediante tickets.
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

      {/* Secciones con fondo claro */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '80px 0' }}>
        <div className='container'>
          {/* Features Section */}
          <div className='row mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Módulos Principales</h2>
              <p className='lead text-muted'>
                Soluciones diseñadas para una administración eficiente y profesional
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-3 col-md-6 fade-in'>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon primary mb-4'>
                  <i className='material-icons'>business</i>
                </div>
                <h5 className='fw-bold mb-3'>Comunidades</h5>
                <p className='text-muted mb-0'>
                  Administración completa de comunidades, estructuras organizativas, reglamentos, políticas internas y roles de usuario. Permite gestionar múltiples edificios bajo una misma plataforma con visión centralizada.
                </p>
                <div className='mt-3'>
                  <img // eslint-disable-line @next/next/no-img-element
                    src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiByeD0iOCIgZmlsbD0iI2Y4ZjlmYSIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgcng9IjQiIGZpbGw9IiM2YzcwNmQiLz4KPHJlY3QgeD0iMTAwIiB5PSI0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiByeD0iNCIgZmlsbD0iIzZjNzA2ZCIvPgo8cmVjdCB4PSI2MCIgeT0iNzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzMCIgcng9IjIiIGZpbGw9IiM2YzcwNmQiLz4KPHRleHQgeD0iMTAwIiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNmM3MDZkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Db21wbGV4byBkZSBjb21hbmlkYWRlczwvdGV4dD4KPC9zdmc+'
                    alt='Gestión de Comunidades'
                    className='img-fluid rounded mt-3'
                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon success mb-4'>
                  <i className='material-icons'>apartment</i>
                </div>
                <h5 className='fw-bold mb-3'>Unidades</h5>
                <p className='text-muted mb-0'>
                  Control exhaustivo de unidades, residentes, propietarios y ocupación. Incluye historial de movimientos, documentación asociada y trazabilidad de cada registro.
                </p>
                <div className='mt-3'>
                  <img // eslint-disable-line @next/next/no-img-element
                    src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiByeD0iOCIgZmlsbD0iI2Y4ZjlmYSIvPgo8cmVjdCB4PSIyMCIgeT0iMzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgcng9IjIiIGZpbGw9IiMyOGE3NDUiLz4KPHJlY3QgeD0iNzAiIHk9IjMwIiB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIHJ4PSIyIiBmaWxsPSIjMjhhNzQ1Ii8+CjxyZWN0IHg9IjEzMCIgeT0iMzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgcng9IjIiIGZpbGw9IiMyOGE3NDUiLz4KPHJlY3QgeD0iMjAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNjAiIHJ4PSIyIiBmaWxsPSIjMjhhNzQ1Ii8+CjxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgcng9IjIiIGZpbGw9IiMyOGE3NDUiLz4KPHRleHQgeD0iMTAwIiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMjhhNzQ1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HZXN0acOzbiBkZSB1bmlkYWRlczwvdGV4dD4KPC9zdmc+'
                    alt='Gestión de Unidades'
                    className='img-fluid rounded mt-3'
                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon info mb-4'>
                  <i className='material-icons'>payments</i>
                </div>
                <h5 className='fw-bold mb-3'>Finanzas</h5>
                <p className='text-muted mb-0'>
                  Herramienta financiera corporativa con módulos de cobranza, gastos comunes, presupuestos, morosidad, conciliación bancaria automática y reportes orientados a auditoría.
                </p>
                <div className='mt-3'>
                  <img // eslint-disable-line @next/next/no-img-element
                    src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiByeD0iOCIgZmlsbD0iI2Y4ZjlmYSIvPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iIzBmNmNmZSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iIzBmNmNmZSIvPgo8Y2lyY2xlIGN4PSIxMTAiIGN5PSI1MCIgcj0iMTUiIGZpbGw9IiMwZjZjZmUiLz4KPHJlY3QgeD0iMTQwIiB5PSI0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iIzBmNmNmZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMGY2Y2ZlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GaW5hbnphcyB5IGNvYnJvczwvdGV4dD4KPC9zdmc+'
                    alt='Sistema Financiero'
                    className='img-fluid rounded mt-3'
                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.3s' }}>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon warning mb-4'>
                  <i className='material-icons'>support_agent</i>
                </div>
                <h5 className='fw-bold mb-3'>Soporte y Comunicación</h5>
                <p className='text-muted mb-0'>
                  Sistema de tickets para gestión de solicitudes, incidencias y requerimientos internos. Incluye notificaciones automatizadas, tableros de seguimiento y mensajería interna.
                </p>
                <div className='mt-3'>
                  {/* eslint-disable-line @next/next/no-img-element */}<img
                    src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiByeD0iOCIgZmlsbD0iI2Y4ZjlmYSIvPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxNSIgZmlsbD0iI2ZmYzEwNyIvPgo8cmVjdCB4PSI4MCIgeT0iNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiNmZmMxMDciLz4KPHJlY3QgeD0iMTMwIiB5PSI0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iI2ZmYzEwNyIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjZmZjMTA3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb3BvcnRlIGludGVncmFkbzwvdGV4dD4KPC9zdmc+'
                    alt='Sistema de Soporte'
                    className='img-fluid rounded mt-3'
                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Lo que dicen nuestros clientes</h2>
              <p className='lead text-muted'>
                Historias reales de comunidades que transformaron su administración
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-4 fade-in'>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          format_quote
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className='fw-bold text-dark'>María González</div>
                      <small className='text-muted'>Administradora - Edificio Los Álamos</small>
                    </div>
                  </div>
                  <p className='text-muted mb-0'>
                    &ldquo;Cuentas Claras revolucionó nuestra administración. Ahora todo está automatizado y los residentes están mucho más satisfechos con la transparencia.&rdquo;
                  </p>
                  <div className='mt-3'>
                    <div className='d-flex text-warning'>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-success d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          format_quote
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className='fw-bold text-dark'>Carlos Rodríguez</div>
                      <small className='text-muted'>Presidente - Condominio San Pablo</small>
                    </div>
                  </div>
                  <p className='text-muted mb-0'>
                    &ldquo;La plataforma es intuitiva y completa. Desde pagos hasta reportes, todo lo tenemos centralizado. Ha reducido nuestro trabajo administrativo en un 70%.&rdquo;
                  </p>
                  <div className='mt-3'>
                    <div className='d-flex text-warning'>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-info d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          format_quote
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className='fw-bold text-dark'>Ana López</div>
                      <small className='text-muted'>Residente - Torre del Valle</small>
                    </div>
                  </div>
                  <p className='text-muted mb-0'>
                    &ldquo;Como residente, ahora es muy fácil pagar mis gastos comunes y hacer reservas. La app es moderna y confiable.&rdquo;
                  </p>
                  <div className='mt-3'>
                    <div className='d-flex text-warning'>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                      <i className='material-icons' style={{ fontSize: '16px' }}>star</i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Equipo del Proyecto</h2>
              <p className='lead text-muted'>
                Proyecto de Título DUOC UC — Ingeniería en Informática
              </p>
              <p className='text-muted'>
                Cuentas Claras es un proyecto desarrollado en el marco del Trabajo de Título de Ingeniería en Informática de DUOC UC, adoptando estándares de la industria, metodologías ágiles y buenas prácticas de arquitectura de software.
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-4 fade-in'>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto' style={{ width: '80px', height: '80px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '32px' }}>
                        code
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Patricio Quintanilla</h5>
                  <p className='text-muted mb-3'>Frontend Developer</p>
                  <p className='text-muted small mb-0'>
                    Responsable del desarrollo de la interfaz, experiencia del usuario, diseño visual, integración de componentes, lógica de interacción y optimización general del frontend utilizando Next.js y React.
                  </p>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto' style={{ width: '80px', height: '80px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '32px' }}>
                        storage
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Frank Vogt</h5>
                  <p className='text-muted mb-3'>Backend Developer</p>
                  <p className='text-muted small mb-0'>
                    Encargado de la arquitectura del sistema, APIs, seguridad, autenticación, lógica de negocio, integración con bases de datos y desarrollo de servicios utilizando Node.js, Express y autenticación 2FA.
                  </p>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-info d-flex align-items-center justify-content-center mx-auto' style={{ width: '80px', height: '80px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '32px' }}>
                        description
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Matías Román</h5>
                  <p className='text-muted mb-3'>Documentación y QA</p>
                  <p className='text-muted small mb-0'>
                    Responsable de la documentación formal del proyecto, manuales y diagramación. Encargado del control de calidad mediante pruebas funcionales, validación de requerimientos y aseguramiento de estándares técnicos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Seguridad de Nivel Empresarial</h2>
              <p className='lead text-muted'>
                Protección avanzada de datos personales y financieros
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-6 fade-in'>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          security
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className='fw-bold mb-2'>Cifrado Avanzado</h5>
                      <p className='text-muted small mb-0'>Todas las comunicaciones protegidas con cifrado de nivel empresarial</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-6 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-success d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          verified_user
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className='fw-bold mb-2'>Autenticación 2FA</h5>
                      <p className='text-muted small mb-0'>Verificación en dos pasos para acceso seguro a la plataforma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-6 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-info d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          admin_panel_settings
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className='fw-bold mb-2'>Control de Acceso</h5>
                      <p className='text-muted small mb-0'>Roles y permisos granulares para cada tipo de usuario</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-lg-6 fade-in' style={{ animationDelay: '0.3s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='d-flex align-items-center mb-3'>
                    <div className='me-3'>
                      <div className='rounded-circle bg-warning d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                        <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                          monitoring
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className='fw-bold mb-2'>Auditoría Completa</h5>
                      <p className='text-muted small mb-0'>Monitoreo y registro de todas las actividades del sistema</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Automatización Inteligente</h2>
              <p className='lead text-muted'>
                Reduce cargas operativas mediante procesos automatizados
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-4 fade-in'>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto' style={{ width: '60px', height: '60px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '28px' }}>
                        receipt_long
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Emisión Automática</h5>
                  <p className='text-muted small mb-0'>
                    Recibos, boletas y avisos generados automáticamente según cronogramas definidos
                  </p>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto' style={{ width: '60px', height: '60px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '28px' }}>
                        account_balance
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Conciliación Bancaria</h5>
                  <p className='text-muted small mb-0'>
                    Proceso inteligente de reconciliación automática de movimientos bancarios
                  </p>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-info d-flex align-items-center justify-content-center mx-auto' style={{ width: '60px', height: '60px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '28px' }}>
                        notifications
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Comunicaciones</h5>
                  <p className='text-muted small mb-0'>
                    Envío masivo automatizado de comunicaciones oficiales y recordatorios
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resident App Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Aplicación para Residentes</h2>
              <p className='lead text-muted'>
                Una experiencia diseñada para la comunidad
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-3 col-md-6 fade-in'>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        payment
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Pagos Fáciles</h6>
                  <p className='text-muted small mb-0'>Pagos seguros y convenientes desde cualquier dispositivo</p>
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        event_available
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Reservas</h6>
                  <p className='text-muted small mb-0'>Sistema de reservas para espacios y amenidades compartidas</p>
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-info d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        description
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Documentación</h6>
                  <p className='text-muted small mb-0'>Acceso a documentación personal y comunitaria</p>
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.3s' }}>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        notifications_active
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Notificaciones</h6>
                  <p className='text-muted small mb-0'>Alertas en tiempo real sobre actividades importantes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Integraciones Corporativas</h2>
              <p className='lead text-muted'>
                Conectividad nativa con sistemas externos
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-3 col-md-6 fade-in'>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        credit_card
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Pasarelas de Pago</h6>
                  <p className='text-muted small mb-0'>Integración con plataformas de pago electrónico</p>
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        account_balance
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Bancos</h6>
                  <p className='text-muted small mb-0'>Conexión directa con instituciones bancarias</p>
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-info d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        calculate
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Sistemas Contables</h6>
                  <p className='text-muted small mb-0'>Integración con software de contabilidad externa</p>
                </div>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.3s' }}>
              <div className='card h-100 border-0 shadow-sm text-center' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto' style={{ width: '50px', height: '50px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '24px' }}>
                        email
                      </span>
                    </div>
                  </div>
                  <h6 className='fw-bold mb-2'>Correo y Notificaciones</h6>
                  <p className='text-muted small mb-0'>Plataformas de envío masivo y comunicación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3'>Reportes Avanzados</h2>
              <p className='lead text-muted'>
                Análisis ejecutivo y auditoría con información precisa
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-4 fade-in'>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto' style={{ width: '60px', height: '60px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '28px' }}>
                        analytics
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Indicadores Financieros</h5>
                  <p className='text-muted small mb-0'>
                    KPIs financieros, morosidad, recaudación y análisis de tendencias
                  </p>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto' style={{ width: '60px', height: '60px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '28px' }}>
                        compare_arrows
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Análisis Comparativo</h5>
                  <p className='text-muted small mb-0'>
                    Comparaciones históricas, benchmarking y proyecciones
                  </p>
                </div>
              </div>
            </div>

            <div className='col-lg-4 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='card h-100 border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-4 text-center'>
                  <div className='mb-3'>
                    <div className='rounded-circle bg-info d-flex align-items-center justify-content-center mx-auto' style={{ width: '60px', height: '60px' }}>
                      <span className='material-icons text-white' style={{ fontSize: '28px' }}>
                        download
                      </span>
                    </div>
                  </div>
                  <h5 className='fw-bold mb-3'>Reportes Descargables</h5>
                  <p className='text-muted small mb-0'>
                    Exportación en PDF, Excel y otros formatos para auditoría
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='row mt-5 pt-5 border-top border-secondary border-opacity-25'>
            <div className='col-12 text-center'>
              <div className='mb-4'>
                <h3 className='fw-bold text-dark mb-3'>¿Listo para modernizar la administración de tu comunidad?</h3>
                <p className='text-muted mb-4'>
                  Más de 500 condominios y comunidades ya confían en Cuentas Claras para una gestión eficiente, segura y transparente.
                </p>
                <button className='btn btn-primary btn-lg px-4 py-2' style={{ borderRadius: '25px' }}>
                  <span className='material-icons me-2' style={{ fontSize: '20px' }}>login</span>
                  Comenzar Ahora
                </button>
              </div>

              <div className='mt-5 pt-4 border-top border-secondary border-opacity-25'>
                <p className='text-muted mb-3'>
                  © 2025 Cuentas Claras. Todos los derechos reservados.
                </p>
                <div className='d-flex justify-content-center gap-4'>
                  <button className='btn btn-link text-muted text-decoration-none small p-0'>
                    Términos de Servicio
                  </button>
                  <button className='btn btn-link text-muted text-decoration-none small p-0'>
                    Política de Privacidad
                  </button>
                  <button className='btn btn-link text-muted text-decoration-none small p-0'>
                    Contacto
                  </button>
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

        /* Landing page animations */
        .fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hover effects for feature cards */
        .stats-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 12px 30px rgba(13, 71, 161, 0.2) !important;
        }

        .stats-card .stats-icon {
          transition: all 0.3s ease;
        }

        .stats-card:hover .stats-icon {
          transform: scale(1.1);
        }

        /* Card hover effects */
        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
}
