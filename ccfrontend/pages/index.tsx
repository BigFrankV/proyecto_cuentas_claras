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
                        <strong>pat.quintanilla@duocuc.cl</strong> / <strong>123456</strong>
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

      {/* Modern Section Separator */}
      <div className='section-separator'>
        <svg viewBox='0 0 1200 120' preserveAspectRatio='none' className='separator-wave'>
          <path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25'></path>
          <path d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5'></path>
          <path d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z'></path>
        </svg>
      </div>

      {/* Secciones con fondo claro */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Floating Particles */}
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='particle'></div>
        <div className='container'>
          {/* Features Section */}
          <div className='row mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Módulos Principales</h2>
              <p className='lead text-muted'>
                Soluciones diseñadas para una administración eficiente y profesional
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-3 col-md-6 fade-in'>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon bg-primary mb-4'>
                  <i className='material-icons'>business</i>
                </div>
                <h5 className='fw-bold mb-3'>Comunidades</h5>
                <p className='text-muted mb-0'>
                  Administración completa de comunidades, estructuras organizativas, reglamentos, políticas internas y roles de usuario. Permite gestionar múltiples edificios bajo una misma plataforma con visión centralizada.
                </p>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon bg-success mb-4'>
                  <i className='material-icons'>apartment</i>
                </div>
                <h5 className='fw-bold mb-3'>Unidades</h5>
                <p className='text-muted mb-0'>
                  Control exhaustivo de unidades, residentes, propietarios y ocupación. Incluye historial de movimientos, documentación asociada y trazabilidad de cada registro.
                </p>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon bg-info mb-4'>
                  <i className='material-icons'>payments</i>
                </div>
                <h5 className='fw-bold mb-3'>Finanzas</h5>
                <p className='text-muted mb-0'>
                  Herramienta financiera corporativa con módulos de cobranza, gastos comunes, presupuestos, morosidad, conciliación bancaria automática y reportes orientados a auditoría.
                </p>
              </div>
            </div>

            <div className='col-lg-3 col-md-6 fade-in' style={{ animationDelay: '0.3s' }}>
              <div className='stats-card h-100 text-center'>
                <div className='stats-icon bg-warning mb-4'>
                  <i className='material-icons'>support_agent</i>
                </div>
                <h5 className='fw-bold mb-3'>Soporte y Comunicación</h5>
                <p className='text-muted mb-0'>
                  Sistema de tickets para gestión de solicitudes, incidencias y requerimientos internos. Incluye notificaciones automatizadas, tableros de seguimiento y mensajería interna.
                </p>
              </div>
            </div>
          </div>

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-dot'></div>
            <div className='divider-line'></div>
          </div>

          {/* Testimonials Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Lo que dicen nuestros clientes</h2>
              <p className='lead text-muted'>
                Historias reales de comunidades que transformaron su administración
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-lg-4 fade-in'>
              <div className='card h-100 border-0 shadow-sm morph-card' style={{ backgroundColor: 'white' }}>
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
              <div className='card h-100 border-0 shadow-sm morph-card' style={{ backgroundColor: 'white' }}>
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
              <div className='card h-100 border-0 shadow-sm morph-card' style={{ backgroundColor: 'white' }}>
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

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>
              <span className='material-icons'>groups</span>
            </div>
            <div className='divider-line'></div>
          </div>

          {/* Team Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Equipo del Proyecto</h2>
              <p className='lead text-muted'>
                <strong>Proyecto de Título DUOC UC — Ingeniería en Informática</strong>
              </p>
              <p className='text-muted'>
                Cuentas Claras es un proyecto desarrollado en el marco del Trabajo de Título de Ingeniería en Informática de DUOC UC, adoptando estándares de la industria, metodologías ágiles y buenas prácticas de arquitectura de software.
              </p>
              <p className='text-muted small'>
                <span className='material-icons me-1' style={{ fontSize: '16px', verticalAlign: 'middle' }}>public</span>
                Proyecto open source disponible en{' '}
                <a
                  href='https://github.com/BigFrankV/proyecto_cuentas_claras'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary text-decoration-none fw-bold'
                >
                  GitHub
                </a>
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

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>
              <span className='material-icons'>security</span>
            </div>
            <div className='divider-line'></div>
          </div>

          {/* Security Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Seguridad de Nivel Empresarial</h2>
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

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>
              <span className='material-icons'>smart_toy</span>
            </div>
            <div className='divider-line'></div>
          </div>

          {/* Automation Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Automatización Inteligente</h2>
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

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>
              <span className='material-icons'>phone_android</span>
            </div>
            <div className='divider-line'></div>
          </div>

          {/* Resident App Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Aplicación para Residentes</h2>
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

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>
              <span className='material-icons'>link</span>
            </div>
            <div className='divider-line'></div>
          </div>

          {/* Integrations Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Integraciones Corporativas</h2>
              <p className='lead text-muted'>
                Conectividad nativa con sistemas externos para una experiencia fluida
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            {/* Payment Gateways */}
            <div className='col-lg-6 col-xl-3 fade-in'>
              <div className='integration-card h-100 position-relative overflow-hidden rounded-4 shadow-lg' style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '280px',
              }}>
                <div className='card-body d-flex flex-column justify-content-between h-100 p-4 text-white'>
                  <div>
                    <div className='d-flex align-items-center mb-3'>
                      <div className='integration-icon me-3'>
                        <span className='material-icons' style={{ fontSize: '32px' }}>
                          credit_card
                        </span>
                      </div>
                      <div>
                        <h5 className='fw-bold mb-1'>Pasarelas de Pago</h5>
                        <small className='opacity-75'>Pagos electrónicos seguros</small>
                      </div>
                    </div>
                    <p className='mb-3 opacity-90 small'>
                      Integración completa con WebPay, Khipu, MercadoPago y PayPal para transacciones seguras.
                    </p>
                  </div>
                  <div className='integration-features'>
                    <div className='d-flex flex-wrap gap-2'>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>WebPay</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>Khipu</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>PayPal</span>
                    </div>
                  </div>
                </div>
                <div className='integration-overlay'></div>
              </div>
            </div>

            {/* Banking */}
            <div className='col-lg-6 col-xl-3 fade-in' style={{ animationDelay: '0.1s' }}>
              <div className='integration-card h-100 position-relative overflow-hidden rounded-4 shadow-lg' style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                minHeight: '280px',
              }}>
                <div className='card-body d-flex flex-column justify-content-between h-100 p-4 text-white'>
                  <div>
                    <div className='d-flex align-items-center mb-3'>
                      <div className='integration-icon me-3'>
                        <span className='material-icons' style={{ fontSize: '32px' }}>
                          account_balance
                        </span>
                      </div>
                      <div>
                        <h5 className='fw-bold mb-1'>Instituciones Bancarias</h5>
                        <small className='opacity-75'>Conciliación automática</small>
                      </div>
                    </div>
                    <p className='mb-3 opacity-90 small'>
                      Conexión directa con bancos chilenos para transferencias y conciliación automática.
                    </p>
                  </div>
                  <div className='integration-features'>
                    <div className='d-flex flex-wrap gap-2'>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>Banco Estado</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>Banco Chile</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>BCI</span>
                    </div>
                  </div>
                </div>
                <div className='integration-overlay'></div>
              </div>
            </div>

            {/* Accounting Systems */}
            <div className='col-lg-6 col-xl-3 fade-in' style={{ animationDelay: '0.2s' }}>
              <div className='integration-card h-100 position-relative overflow-hidden rounded-4 shadow-lg' style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                minHeight: '280px',
              }}>
                <div className='card-body d-flex flex-column justify-content-between h-100 p-4 text-white'>
                  <div>
                    <div className='d-flex align-items-center mb-3'>
                      <div className='integration-icon me-3'>
                        <span className='material-icons' style={{ fontSize: '32px' }}>
                          calculate
                        </span>
                      </div>
                      <div>
                        <h5 className='fw-bold mb-1'>Sistemas Contables</h5>
                        <small className='opacity-75'>Sincronización financiera</small>
                      </div>
                    </div>
                    <p className='mb-3 opacity-90 small'>
                      Integración perfecta con SAP, Oracle, QuickBooks y otros sistemas contables.
                    </p>
                  </div>
                  <div className='integration-features'>
                    <div className='d-flex flex-wrap gap-2'>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>SAP</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>Oracle</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>QuickBooks</span>
                    </div>
                  </div>
                </div>
                <div className='integration-overlay'></div>
              </div>
            </div>

            {/* Communication */}
            <div className='col-lg-6 col-xl-3 fade-in' style={{ animationDelay: '0.3s' }}>
              <div className='integration-card h-100 position-relative overflow-hidden rounded-4 shadow-lg' style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                minHeight: '280px',
              }}>
                <div className='card-body d-flex flex-column justify-content-between h-100 p-4 text-white'>
                  <div>
                    <div className='d-flex align-items-center mb-3'>
                      <div className='integration-icon me-3'>
                        <span className='material-icons' style={{ fontSize: '32px' }}>
                          email
                        </span>
                      </div>
                      <div>
                        <h5 className='fw-bold mb-1'>Comunicación</h5>
                        <small className='opacity-75'>Envío masivo inteligente</small>
                      </div>
                    </div>
                    <p className='mb-3 opacity-90 small'>
                      Plataformas de email marketing y mensajería para comunicaciones efectivas.
                    </p>
                  </div>
                  <div className='integration-features'>
                    <div className='d-flex flex-wrap gap-2'>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>SendGrid</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>Twilio</span>
                      <span className='badge bg-white bg-opacity-20 text-white px-2 py-1 small'>WhatsApp</span>
                    </div>
                  </div>
                </div>
                <div className='integration-overlay'></div>
              </div>
            </div>
          </div>

          {/* Integration Architecture Showcase */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 fade-in' style={{ animationDelay: '0.4s' }}>
              <div className='card border-0 shadow-lg rounded-4 overflow-hidden' style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}>
                <div className='card-body p-5 text-center text-white'>
                  <div className='row align-items-center'>
                    <div className='col-lg-6 mb-4 mb-lg-0'>
                      <h3 className='fw-bold mb-4'>Arquitectura de Integración Avanzada</h3>
                      <p className='lead mb-4 opacity-90'>
                        APIs RESTful, webhooks bidireccionales y autenticación OAuth 2.0 garantizan
                        una comunicación segura y en tiempo real con todos tus sistemas externos.
                      </p>
                      <div className='row g-3'>
                        <div className='col-6'>
                          <div className='p-3 bg-white bg-opacity-10 rounded-3'>
                            <span className='material-icons mb-2' style={{ fontSize: '36px' }}>security</span>
                            <h6 className='fw-bold mb-1'>OAuth 2.0</h6>
                            <small className='opacity-75'>Autenticación segura</small>
                          </div>
                        </div>
                        <div className='col-6'>
                          <div className='p-3 bg-white bg-opacity-10 rounded-3'>
                            <span className='material-icons mb-2' style={{ fontSize: '36px' }}>sync</span>
                            <h6 className='fw-bold mb-1'>Sincronización</h6>
                            <small className='opacity-75'>Datos en tiempo real</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-6'>
                      <div className='position-relative'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src='https://via.placeholder.com/500x350/ffffff/667eea?text=Arquitectura+de+Integración'
                          alt='Arquitectura de Integración'
                          className='img-fluid rounded-3 shadow-lg'
                          style={{ width: '100%', height: 'auto' }}
                        />
                        <div className='position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-br from-transparent to-black opacity-20 rounded-3'></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Separator */}
          <div className='section-divider'>
            <div className='divider-line'></div>
            <div className='divider-icon'>
              <span className='material-icons'>analytics</span>
            </div>
            <div className='divider-line'></div>
          </div>

          {/* Reports Section */}
          <div className='row mt-5 mb-5'>
            <div className='col-12 text-center mb-5 fade-in'>
              <h2 className='display-4 fw-bold text-dark mb-3 gradient-text'>Reportes Avanzados</h2>
              <p className='lead text-muted'>
                Análisis ejecutivo y auditoría con información precisa
              </p>
            </div>
          </div>

          <div className='row g-4 mb-5'>
            <div className='col-12 fade-in'>
              <div className='card border-0 shadow-sm' style={{ backgroundColor: 'white' }}>
                <div className='card-body p-0'>
                  {/* Nav tabs */}
                  <ul className='nav nav-tabs nav-fill border-bottom-0' id='reportsTab' role='tablist'>
                    <li className='nav-item' role='presentation'>
                      <button
                        className='nav-link active fw-bold'
                        id='indicadores-tab'
                        data-bs-toggle='tab'
                        data-bs-target='#indicadores'
                        type='button'
                        role='tab'
                        aria-controls='indicadores'
                        aria-selected='true'
                      >
                        <span className='material-icons me-2' style={{ fontSize: '20px' }}>
                          analytics
                        </span>
                        Indicadores Financieros
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className='nav-link fw-bold'
                        id='analisis-tab'
                        data-bs-toggle='tab'
                        data-bs-target='#analisis'
                        type='button'
                        role='tab'
                        aria-controls='analisis'
                        aria-selected='false'
                      >
                        <span className='material-icons me-2' style={{ fontSize: '20px' }}>
                          compare_arrows
                        </span>
                        Análisis Comparativo
                      </button>
                    </li>
                    <li className='nav-item' role='presentation'>
                      <button
                        className='nav-link fw-bold'
                        id='descargables-tab'
                        data-bs-toggle='tab'
                        data-bs-target='#descargables'
                        type='button'
                        role='tab'
                        aria-controls='descargables'
                        aria-selected='false'
                      >
                        <span className='material-icons me-2' style={{ fontSize: '20px' }}>
                          download
                        </span>
                        Reportes Descargables
                      </button>
                    </li>
                  </ul>

                  {/* Tab content */}
                  <div className='tab-content p-4' id='reportsTabContent'>
                    <div
                      className='tab-pane fade show active'
                      id='indicadores'
                      role='tabpanel'
                      aria-labelledby='indicadores-tab'
                    >
                      <div className='text-center mb-4'>
                        <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '80px', height: '80px' }}>
                          <span className='material-icons text-white' style={{ fontSize: '36px' }}>
                            analytics
                          </span>
                        </div>
                        <h4 className='fw-bold mb-3'>Indicadores Financieros</h4>
                      </div>
                      <p className='text-muted mb-4'>
                        KPIs financieros, morosidad, recaudación y análisis de tendencias con gráficos interactivos y métricas en tiempo real para toma de decisiones ejecutivas.
                      </p>
                      <div className='row g-3'>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-primary mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>trending_up</span>
                            </div>
                            <h6 className='fw-bold'>KPIs Financieros</h6>
                            <small className='text-muted'>Métricas clave del rendimiento</small>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-success mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>account_balance_wallet</span>
                            </div>
                            <h6 className='fw-bold'>Morosidad</h6>
                            <small className='text-muted'>Análisis de pagos pendientes</small>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-info mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>insights</span>
                            </div>
                            <h6 className='fw-bold'>Tendencias</h6>
                            <small className='text-muted'>Proyecciones y análisis predictivo</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className='tab-pane fade'
                      id='analisis'
                      role='tabpanel'
                      aria-labelledby='analisis-tab'
                    >
                      <div className='text-center mb-4'>
                        <div className='rounded-circle bg-success d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '80px', height: '80px' }}>
                          <span className='material-icons text-white' style={{ fontSize: '36px' }}>
                            compare_arrows
                          </span>
                        </div>
                        <h4 className='fw-bold mb-3'>Análisis Comparativo</h4>
                      </div>
                      <p className='text-muted mb-4'>
                        Comparaciones históricas, benchmarking sectorial y proyecciones financieras con datos normalizados y visualizaciones comparativas avanzadas.
                      </p>
                      <div className='row g-3'>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-warning mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>history</span>
                            </div>
                            <h6 className='fw-bold'>Histórico</h6>
                            <small className='text-muted'>Comparaciones año a año</small>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-primary mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>assessment</span>
                            </div>
                            <h6 className='fw-bold'>Benchmarking</h6>
                            <small className='text-muted'>Estándares del sector</small>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-info mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>timeline</span>
                            </div>
                            <h6 className='fw-bold'>Proyecciones</h6>
                            <small className='text-muted'>Modelos predictivos</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className='tab-pane fade'
                      id='descargables'
                      role='tabpanel'
                      aria-labelledby='descargables-tab'
                    >
                      <div className='text-center mb-4'>
                        <div className='rounded-circle bg-info d-flex align-items-center justify-content-center mx-auto mb-3' style={{ width: '80px', height: '80px' }}>
                          <span className='material-icons text-white' style={{ fontSize: '36px' }}>
                            download
                          </span>
                        </div>
                        <h4 className='fw-bold mb-3'>Reportes Descargables</h4>
                      </div>
                      <p className='text-muted mb-4'>
                        Exportación automática en múltiples formatos (PDF, Excel, CSV) optimizados para auditoría externa y presentaciones ejecutivas.
                      </p>
                      <div className='row g-3'>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-danger mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>picture_as_pdf</span>
                            </div>
                            <h6 className='fw-bold'>PDF Ejecutivo</h6>
                            <small className='text-muted'>Formatos profesionales</small>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-success mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>table_chart</span>
                            </div>
                            <h6 className='fw-bold'>Excel Analítico</h6>
                            <small className='text-muted'>Datos estructurados</small>
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='text-center p-3 border rounded'>
                            <div className='text-warning mb-2'>
                              <span className='material-icons' style={{ fontSize: '32px' }}>file_download</span>
                            </div>
                            <h6 className='fw-bold'>CSV Raw</h6>
                            <small className='text-muted'>Datos sin procesar</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <a
                    href='https://github.com/BigFrankV/proyecto_cuentas_claras'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn btn-link text-muted text-decoration-none small p-0 d-flex align-items-center'
                  >
                    <span className='material-icons me-1' style={{ fontSize: '16px' }}>code</span>
                    Repositorio
                  </a>
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

        /* Modern Section Separators */
        .section-separator {
          position: relative;
          width: 100%;
          height: 120px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .separator-wave {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100%;
          fill: #f8f9fa;
        }

        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          position: relative;
        }

        .divider-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #007bff 50%, transparent 100%);
          position: relative;
        }

        .divider-dot {
          width: 12px;
          height: 12px;
          background: #007bff;
          border-radius: 50%;
          margin: 0 20px;
          box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
        }

        .divider-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 30px;
          color: white;
          font-size: 24px;
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Parallax Background Elements */
        .parallax-bg {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
          animation: float-slow 20s ease-in-out infinite;
        }

        .parallax-bg-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: -5%;
          animation-delay: 0s;
        }

        .parallax-bg-2 {
          width: 200px;
          height: 200px;
          top: 60%;
          right: -3%;
          animation-delay: 5s;
        }

        .parallax-bg-3 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        /* Floating Elements */
        .floating-element {
          position: absolute;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(0, 123, 255, 0.6);
          font-size: 24px;
          animation: float-random 15s ease-in-out infinite;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 123, 255, 0.1);
        }

        .floating-element-1 {
          top: 15%;
          right: 10%;
          animation-delay: 0s;
        }

        .floating-element-2 {
          top: 40%;
          left: 8%;
          animation-delay: 3s;
        }

        .floating-element-3 {
          bottom: 30%;
          right: 15%;
          animation-delay: 6s;
        }

        .floating-element-4 {
          bottom: 10%;
          left: 15%;
          animation-delay: 9s;
        }

        @keyframes float-random {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-30px) translateX(20px) rotate(90deg); }
          50% { transform: translateY(-15px) translateX(-15px) rotate(180deg); }
          75% { transform: translateY(-40px) translateX(10px) rotate(270deg); }
        }

        /* Enhanced Landing page animations */
        .fade-in {
          animation: fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: translateY(50px) scale(0.95);
        }

        .fade-in:nth-child(odd) {
          animation-delay: 0.1s;
        }

        .fade-in:nth-child(even) {
          animation-delay: 0.2s;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Staggered animations for cards */
        .stats-card:nth-child(1) { animation-delay: 0.1s; }
        .stats-card:nth-child(2) { animation-delay: 0.2s; }
        .stats-card:nth-child(3) { animation-delay: 0.3s; }
        .stats-card:nth-child(4) { animation-delay: 0.4s; }

        /* Scroll-triggered animations */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(100px) rotateX(10deg);
          transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0) rotateX(0deg);
        }

        /* Enhanced hover effects */
        .stats-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        .stats-card:hover {
          transform: translateY(-12px) rotateY(5deg) scale(1.02) !important;
          box-shadow: 0 20px 40px rgba(13, 71, 161, 0.25) !important;
        }

        .stats-card .stats-icon {
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform-style: preserve-3d;
        }

        .stats-card:hover .stats-icon {
          transform: scale(1.2) rotateY(15deg) rotateX(10deg);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }

        /* Morphing animations */
        .morph-card {
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          border-radius: 15px;
        }

        .morph-card:hover {
          border-radius: 25px;
          transform: perspective(1000px) rotateY(5deg) rotateX(5deg);
        }

        /* Gradient text animations */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease-in-out infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Particle effects */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(0,123,255,0.6) 0%, transparent 70%);
          border-radius: 50%;
          animation: particle-float 8s linear infinite;
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 1s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 2s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 3s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 4s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 6s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 7s; }

        @keyframes particle-float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        /* Enhanced card hover with glow */
        .card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }

        .card:hover::before {
          left: 100%;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }

        /* Advanced Integration Card Effects */
        .integration-card {
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .integration-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .integration-card:hover::after {
          transform: translateX(100%);
        }

        .integration-card:hover {
          transform: translateY(-15px) scale(1.03) rotateY(2deg) !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25) !important;
          filter: brightness(1.05);
        }

        .integration-card .integration-icon {
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          background: rgba(255, 255, 255, 0.25);
          border-radius: 15px;
          padding: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .integration-card:hover .integration-icon {
          transform: scale(1.15) rotate(10deg);
          background: rgba(255, 255, 255, 0.35);
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        .integration-card .integration-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .integration-card:hover .integration-overlay {
          opacity: 1;
        }

        .integration-features .badge {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(5px);
        }

        .integration-card:hover .badge {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 15px rgba(0,0,0,0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* Enhanced floating animation with more variation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          50% { transform: translateY(-16px) rotate(-1deg); }
          75% { transform: translateY(-8px) rotate(1deg); }
        }

        .integration-card:nth-child(1) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 0s;
        }
        .integration-card:nth-child(2) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .integration-card:nth-child(3) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .integration-card:nth-child(4) {
          animation: float 8s ease-in-out infinite;
          animation-delay: 3s;
        }
      `}</style>
    </>
  );
}
