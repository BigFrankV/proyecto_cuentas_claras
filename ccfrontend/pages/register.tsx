import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import authService from '@/lib/auth';
import { getUserRole } from '@/lib/roles';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';

export default function Register() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userRole = getUserRole(user);
  const isSuperAdmin = userRole === 'Superadmin';
  const isAdmin =
    userRole === 'Administrador' ||
    userRole === 'Admin' ||
    user?.roles?.includes('admin');

  // Redirect if not authorized
  useEffect(() => {
    if (user && !isSuperAdmin && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isSuperAdmin, isAdmin, router]);

  const availableRoles = [];
  if (isSuperAdmin) {
    availableRoles.push(
      { value: 'admin', label: 'Administrador' },
      { value: 'manager', label: 'Gerente' },
      { value: 'conserje', label: 'Conserje' },
      { value: 'residente', label: 'Residente' },
    );
  } else if (isAdmin) {
    availableRoles.push(
      { value: 'manager', label: 'Gerente' },
      { value: 'conserje', label: 'Conserje' },
      { value: 'residente', label: 'Residente' },
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.role) {
      setError('Debes seleccionar un rol');
      return;
    }

    setIsLoading(true);
    try {
      await authService.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roles: [formData.role],
      });
      setSuccess('Usuario creado exitosamente');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (!isSuperAdmin && !isAdmin)) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Crear Usuario — Cuentas Claras</title>
      </Head>

      <Layout title='Crear Nuevo Usuario'>
        <div className='container-fluid p-4'>
          <div className='row justify-content-center'>
            <div className='col-12 col-md-8 col-lg-6'>
              <div className='card shadow-sm'>
                <div className='card-body p-4'>
                  <h2 className='card-title mb-4 text-center'>
                    Registrar Nuevo Usuario
                  </h2>

                  {error && (
                    <div className='alert alert-danger' role='alert'>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className='alert alert-success' role='alert'>
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                      <label htmlFor='username' className='form-label'>
                        Nombre de Usuario
                      </label>
                      <input
                        type='text'
                        className='form-control'
                        id='username'
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='email' className='form-label'>
                        Correo Electrónico
                      </label>
                      <input
                        type='email'
                        className='form-control'
                        id='email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className='mb-3'>
                      <label htmlFor='role' className='form-label'>
                        Rol
                      </label>
                      <select
                        className='form-select'
                        id='role'
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        required
                      >
                        <option value=''>Seleccionar rol...</option>
                        {availableRoles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <div className='form-text'>
                        {isSuperAdmin
                          ? 'Como Superadmin puedes crear cualquier rol.'
                          : 'Como Admin puedes crear roles de menor jerarquía.'}
                      </div>
                    </div>

                    <div className='row'>
                      <div className='col-md-6 mb-3'>
                        <label htmlFor='password'>Contraseña</label>
                        <input
                          type='password'
                          className='form-control'
                          id='password'
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                      <div className='col-md-6 mb-3'>
                        <label htmlFor='confirmPassword'>
                          Confirmar Contraseña
                        </label>
                        <input
                          type='password'
                          className='form-control'
                          id='confirmPassword'
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className='d-grid gap-2 mt-4'>
                      <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span
                              className='spinner-border spinner-border-sm me-2'
                              role='status'
                              aria-hidden='true'
                            ></span>
                            Creando usuario...
                          </>
                        ) : (
                          'Crear Usuario'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
