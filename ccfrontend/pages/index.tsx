import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const router = useRouter();
  const {
    login: authLogin,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log(
      '🏠 Estado auth en login page - autenticado:',
      isAuthenticated,
      'cargando:',
      authLoading
    );
    if (isAuthenticated && !authLoading) {
      console.log('✅ Usuario autenticado, redirigiendo al dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Validación básica
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Usar el login del contexto de autenticación
      await authLogin(username, password);

      // La redirección se maneja en el useEffect cuando isAuthenticated cambie
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-llenar los campos con las credenciales por defecto
  const fillDefaultCredentials = () => {
    const usernameInput = document.querySelector(
      'input[name="username"]'
    ) as HTMLInputElement;
    const passwordInput = document.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement;

    if (usernameInput) usernameInput.value = 'patrick';
    if (passwordInput) passwordInput.value = 'patrick';
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

                  <p className='text-muted'>
                    Ingresa con tu usuario y contraseña para acceder al panel.
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

                  <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                      <label className='form-label'>Usuario</label>
                      <input
                        name='username'
                        type='text'
                        className='form-control'
                        placeholder='Nombre de usuario'
                        required
                      />
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
                        <label className='form-check-label' htmlFor='remember'>
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
