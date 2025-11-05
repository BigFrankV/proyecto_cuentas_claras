import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import authService from '@/lib/auth';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {setError('');}
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Contraseña — Cuentas Claras</title>
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
                  mail_lock
                </span>
              </div>
              <h1 className='fw-bold display-5 mb-3'>Recupera tu acceso</h1>
              <p className='lead'>
                Te ayudamos a restablecer tu contraseña de forma segura.
              </p>
            </div>
          </div>

          {/* Columna derecha: formulario */}
          <div className='col-lg-6 col-12'>
            <div className='d-flex flex-column min-vh-100 p-4 p-md-5 justify-content-center'>
              <div className='mb-5'>
                <div className='text-center mb-4'>
                  <h1 className='h2 fw-bold'>¿Olvidaste tu contraseña?</h1>
                  <p className='text-muted'>
                    No te preocupes, ingresa tu correo electrónico y te
                    enviaremos un enlace para restablecerla.
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
                        <label htmlFor='email' className='form-label'>
                          Correo electrónico{' '}
                          <span className='text-danger'>*</span>
                        </label>
                        <div className='input-group'>
                          <span className='input-group-text'>
                            <span className='material-icons'>email</span>
                          </span>
                          <input
                            type='email'
                            className='form-control'
                            id='email'
                            name='email'
                            value={email}
                            onChange={handleInputChange}
                            placeholder='tu-email@ejemplo.com'
                            required
                          />
                        </div>
                        <div className='form-text'>
                          Ingresa el correo asociado a tu cuenta de Cuentas
                          Claras.
                        </div>
                      </div>

                      <div className='d-grid mb-3'>
                        <button
                          type='submit'
                          className='btn btn-primary'
                          disabled={isLoading}
                        >
                          {isLoading
                            ? 'Enviando...'
                            : 'Enviar enlace de recuperación'}
                        </button>
                      </div>

                      <div className='text-center'>
                        <Link href='/' className='text-decoration-none'>
                          <i
                            className='material-icons me-1'
                            style={{
                              fontSize: '1.2rem',
                              verticalAlign: 'middle',
                            }}
                          >
                            arrow_back
                          </i>
                          Volver al inicio de sesión
                        </Link>
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
                          mark_email_read
                        </span>
                      </div>
                      <h5 className='text-center'>¡Correo enviado!</h5>
                      <p className='text-center'>
                        Hemos enviado un enlace de recuperación a{' '}
                        <strong>{email}</strong>. Revisa tu bandeja de entrada y
                        sigue las instrucciones.
                      </p>
                      <div className='alert alert-info'>
                        <small>
                          <strong>¿No ves el correo?</strong> Revisa tu carpeta
                          de spam o correo no deseado. El enlace expirará en 1
                          hora por seguridad.
                        </small>
                      </div>
                      <div className='d-grid mt-3'>
                        <Link href='/' className='btn btn-outline-primary'>
                          Volver al inicio de sesión
                        </Link>
                      </div>
                      <div className='text-center mt-3'>
                        <button
                          onClick={() => {
                            setIsSuccess(false);
                            setEmail('');
                          }}
                          className='btn btn-link btn-sm'
                        >
                          Enviar a otro correo
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
