import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';
import TwoFactorModal from '@/components/ui/TwoFactorModal';
import profileService from '@/lib/profileService';
import { getUserRole, getRoleTagClass } from '@/lib/roles';
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import {
  UserExtended,
  ProfileFormData,
  PasswordChangeData,
  UserPreferences,
  SessionInfo,
  TotpSetupResponse,
} from '@/types/profile';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserExtended | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Estados para formularios
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    paymentNotifications: true,
    weeklyReports: false,
    platformNotifications: true,
    platformMessages: true,
    platformTasks: true,
    marketingEmails: false,
    timezone: '(GMT-4) Santiago de Chile',
    dateFormat: 'DD/MM/AAAA',
  });

  // Estados para 2FA
  const [totpSetup, setTotpSetup] = useState<TotpSetupResponse | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [modalMode, setModalMode] = useState<'setup' | 'disable'>('setup');
  const [totp2FAEnabled, setTotp2FAEnabled] = useState<boolean>(false);
  const [checking2FA, setChecking2FA] = useState<boolean>(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadProfileData();
  }, []);

  // Sincronizar estado 2FA con los datos del usuario
  useEffect(() => {
    if (user?.totp_enabled !== undefined && !checking2FA) {
      setTotp2FAEnabled(user.totp_enabled);
    }
  }, [user?.totp_enabled, checking2FA]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // Cargar perfil
      const profile = await profileService.getProfile();
      setUserProfile(profile);

      // Verificar estado del 2FA solo si no tenemos la info del usuario o es inconsistente
      if (user?.totp_enabled === undefined && !checking2FA) {
        setChecking2FA(true);
        try {
          const twoFAStatus = await profileService.check2FAStatus();
          setTotp2FAEnabled(twoFAStatus.enabled);
        } catch (error) {
          console.error('Error checking 2FA status:', error);
          setTotp2FAEnabled(false);
        } finally {
          setChecking2FA(false);
        }
      }

      // Mapear datos del perfil al formulario, priorizando datos de persona si existen
      setProfileForm({
        firstName:
          user?.persona?.nombres ||
          profile.firstName ||
          user?.username?.split(' ')[0] ||
          '',
        lastName:
          user?.persona?.apellidos ||
          profile.lastName ||
          user?.username?.split(' ')[1] ||
          '',
        email: user?.email || profile.email || '',
        phone: user?.persona?.telefono || profile.phone || '',
      });

      // Cargar sesiones activas
      const activeSessions = await profileService.getActiveSessions();
      setSessions(activeSessions);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar actualización de perfil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Si el usuario tiene persona vinculada, usar endpoints específicos
      if (user?.persona_id) {
        // Actualizar email del usuario si cambió
        if (profileForm.email !== user?.email) {
          const authService = (await import('@/lib/auth')).default;
          await authService.updateProfile({ email: profileForm.email });
        }

        // Actualizar datos de persona
        const personaData: {
          nombres?: string;
          apellidos?: string;
          telefono?: string;
        } = {};

        if (profileForm.firstName) {
          personaData.nombres = profileForm.firstName;
        }
        if (profileForm.lastName) {
          personaData.apellidos = profileForm.lastName;
        }
        if (profileForm.phone) {
          personaData.telefono = profileForm.phone;
        }

        const authService = (await import('@/lib/auth')).default;
        await authService.updatePersona(personaData);
      } else {
        // Usuario sin persona vinculada, usar servicio de perfil tradicional
        await profileService.updateProfile(profileForm);
      }

      setMessage({
        type: 'success',
        text: '¡Perfil actualizado correctamente!',
      });
      await refreshUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambio de contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'La contraseña debe tener al menos 8 caracteres',
      });
      return;
    }

    setIsLoading(true);
    try {
      await profileService.changePassword(passwordForm);
      setMessage({
        type: 'success',
        text: '¡Contraseña actualizada correctamente!',
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar actualización de preferencias
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await profileService.updatePreferences(preferences);
      setMessage({ type: 'success', text: '¡Preferencias guardadas!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar configuración de 2FA
  const handleSetup2FA = async () => {
    try {
      setIsLoading(true);
      const setupData = await profileService.setup2FA();
      setTotpSetup(setupData);
      setModalMode('setup');
      setShow2FAModal(true);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Activar 2FA
  const handleEnable2FA = async (code: string) => {
    if (!totpSetup) {
      return;
    }

    setIsLoading(true);
    try {
      await profileService.enable2FA({ code, base32: totpSetup.base32 });
      setMessage({ type: 'success', text: '¡2FA activado exitosamente!' });
      setTotpSetup(null);
      setTotp2FAEnabled(true); // Actualizar estado local inmediatamente
      // Recargar otros datos pero no tocar el estado del 2FA por ahora
      setTimeout(async () => {
        await refreshUser();
        // Solo recargar el perfil sin verificar 2FA nuevamente
        const profile = await profileService.getProfile();
        setUserProfile(profile);
      }, 500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      throw error; // Re-lanzar para que el modal maneje el estado
    } finally {
      setIsLoading(false);
    }
  };

  // Desactivar 2FA
  const handleDisable2FA = async (code: string) => {
    setIsLoading(true);
    try {
      await profileService.disable2FA(code);
      setMessage({ type: 'success', text: '2FA desactivado exitosamente' });
      setTotp2FAEnabled(false); // Actualizar estado local inmediatamente
      // Recargar otros datos pero no tocar el estado del 2FA por ahora
      setTimeout(async () => {
        await refreshUser();
        // Solo recargar el perfil sin verificar 2FA nuevamente
        const profile = await profileService.getProfile();
        setUserProfile(profile);
      }, 500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      throw error; // Re-lanzar para que el modal maneje el estado
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar modal para desactivar 2FA
  const showDisable2FAModal = () => {
    setModalMode('disable');
    setShow2FAModal(true);
  };

  // Cerrar sesión específica
  const handleCloseSession = async (sessionId: string) => {
    try {
      await profileService.closeSession(sessionId);
      setMessage({ type: 'success', text: 'Sesión cerrada exitosamente' });
      await loadProfileData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Cerrar todas las sesiones
  const handleCloseAllSessions = async () => {
    if (!confirm('¿Estás seguro de que quieres cerrar todas las sesiones?')) {
      return;
    }

    try {
      await profileService.closeAllSessions();
      setMessage({
        type: 'success',
        text: 'Todas las sesiones han sido cerradas',
      });
      await loadProfileData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Obtener ícono del dispositivo
  const getDeviceIcon = (device: string) => {
    if (
      device.toLowerCase().includes('iphone') ||
      device.toLowerCase().includes('mobile')
    ) {
      return 'fa-mobile-alt';
    } else if (
      device.toLowerCase().includes('ipad') ||
      device.toLowerCase().includes('tablet')
    ) {
      return 'fa-tablet-alt';
    } else {
      return 'fa-laptop';
    }
  };

  const getUserInitials = () => {
    // Priorizar datos de persona si existen
    const firstName = user?.persona?.nombres || profileForm.firstName?.trim();
    const lastName = user?.persona?.apellidos || profileForm.lastName?.trim();

    if (firstName && lastName && firstName.length > 0 && lastName.length > 0) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getCommunityBadges = () => {
    if (userProfile?.communities && userProfile.communities.length > 0) {
      return userProfile.communities.map((community, index) => (
        <span key={index} className='badge bg-primary me-1'>
          {community.name}
        </span>
      ));
    }
    return (
      <span className='badge bg-primary me-1'>Sin comunidades asignadas</span>
    );
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Mi Perfil — Cuentas Claras</title>
      </Head>

      <Layout title='Mi Perfil'>
        <div className='container-fluid fade-in'>
          {/* Breadcrumb */}
          <div className='d-flex justify-content-between align-items-center mb-4'>
            <h1 className='h3 mb-0'>Mi Perfil</h1>
            <nav aria-label='breadcrumb'>
              <ol className='breadcrumb mb-0'>
                <li className='breadcrumb-item'>
                  <Link href='/dashboard'>Dashboard</Link>
                </li>
                <li className='breadcrumb-item active' aria-current='page'>
                  Mi Perfil
                </li>
              </ol>
            </nav>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div
              className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
              role='alert'
            >
              <span className='material-icons me-2'>
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {message.text}
              <button
                type='button'
                className='btn-close'
                onClick={() => setMessage(null)}
                aria-label='Close'
              ></button>
            </div>
          )}

          <div className='row'>
            {/* Información Personal */}
            <div className='col-md-4 mb-4'>
              <div className='app-card h-100'>
                <div className='card-body'>
                  <div className='text-center mb-4'>
                    <div
                      className='avatar mx-auto mb-3'
                      style={{
                        width: '100px',
                        height: '100px',
                        lineHeight: '100px',
                        fontSize: '40px',
                        backgroundColor: 'var(--color-accent)',
                      }}
                    >
                      {getUserInitials()}
                    </div>
                    <h5 className='mb-1'>
                      {profileForm.firstName} {profileForm.lastName}
                    </h5>
                    <p className='meta mb-2'>{profileForm.email}</p>
                    <span className={`tag ${getRoleTagClass(user)}`}>
                      {getUserRole(user)}
                    </span>
                  </div>

                  <hr />

                  <div className='mb-3'>
                    <label className='form-label fw-bold small mb-1'>
                      Teléfono
                    </label>
                    <p className='mb-0'>
                      {profileForm.phone || 'No especificado'}
                    </p>
                  </div>

                  <div className='mb-3'>
                    <label className='form-label fw-bold small mb-1'>
                      Última conexión
                    </label>
                    <p className='mb-0'>
                      {userProfile?.lastConnection
                        ? formatDate(userProfile.lastConnection)
                        : 'Sesión actual'}
                    </p>
                  </div>

                  <div>
                    <label className='form-label fw-bold small mb-1'>
                      Comunidades que administra
                    </label>
                    <p className='mb-0'>{getCommunityBadges()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editar Perfil */}
            <div className='col-md-8 mb-4'>
              <div className='app-card h-100'>
                <div className='card-header d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>Editar Información de Perfil</h5>
                </div>
                <div className='card-body'>
                  <form onSubmit={handleProfileSubmit}>
                    <div className='row mb-3'>
                      <div className='col-md-6 mb-3 mb-md-0'>
                        <label className='form-label required'>Nombre</label>
                        <input
                          type='text'
                          className='form-control'
                          value={profileForm.firstName}
                          onChange={e =>
                            setProfileForm({
                              ...profileForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label required'>Apellido</label>
                        <input
                          type='text'
                          className='form-control'
                          value={profileForm.lastName}
                          onChange={e =>
                            setProfileForm({
                              ...profileForm,
                              lastName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className='mb-3'>
                      <label className='form-label required'>Email</label>
                      <input
                        type='email'
                        className='form-control'
                        value={profileForm.email}
                        onChange={e =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>Teléfono</label>
                      <input
                        type='tel'
                        className='form-control'
                        value={profileForm.phone}
                        onChange={e =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <hr />

                    {/* Sección de cambio de contraseña */}
                    <h6>Cambiar Contraseña</h6>

                    <div className='mb-3'>
                      <label className='form-label'>Contraseña Actual</label>
                      <input
                        type='password'
                        className='form-control'
                        value={passwordForm.currentPassword}
                        onChange={e =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className='row mb-3'>
                      <div className='col-md-6 mb-3 mb-md-0'>
                        <label className='form-label'>Nueva Contraseña</label>
                        <input
                          type='password'
                          className='form-control'
                          value={passwordForm.newPassword}
                          onChange={e =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                        />
                        <div className='form-text'>
                          Mínimo 8 caracteres, incluir números y símbolos
                        </div>
                      </div>
                      <div className='col-md-6'>
                        <label className='form-label'>
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type='password'
                          className='form-control'
                          value={passwordForm.confirmPassword}
                          onChange={e =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className='d-flex justify-content-end mt-4'>
                      <button
                        type='button'
                        className='btn btn-outline-secondary me-2'
                        onClick={() => {
                          setProfileForm({
                            firstName:
                              user?.persona?.nombres ||
                              userProfile?.firstName ||
                              user?.username?.split(' ')[0] ||
                              '',
                            lastName:
                              user?.persona?.apellidos ||
                              userProfile?.lastName ||
                              user?.username?.split(' ')[1] ||
                              '',
                            email: user?.email || userProfile?.email || '',
                            phone:
                              user?.persona?.telefono ||
                              userProfile?.phone ||
                              '',
                          });
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type='button'
                        className='btn btn-secondary me-2'
                        onClick={handlePasswordSubmit}
                        disabled={
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          isLoading
                        }
                      >
                        {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </button>
                      <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={isLoading}
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Autenticación de Dos Factores */}
            <div className='col-md-6 mb-4'>
              <div className='app-card'>
                <div className='card-header d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>Autenticación de Dos Factores (2FA)</h5>
                  <span
                    className={`tag ${totp2FAEnabled ? 'tag--success' : 'tag--warning'}`}
                  >
                    {totp2FAEnabled ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
                <div className='card-body'>
                  <p className='text-muted mb-3'>
                    Agrega una capa extra de seguridad a tu cuenta usando Google
                    Authenticator o una aplicación compatible.
                  </p>

                  {!totp2FAEnabled ? (
                    <div>
                      <div className='d-flex align-items-center mb-3'>
                        <span className='material-icons text-warning me-2'>
                          security
                        </span>
                        <span>Tu cuenta no tiene 2FA activado</span>
                      </div>
                      <button
                        type='button'
                        className='btn btn-success'
                        onClick={handleSetup2FA}
                        disabled={isLoading}
                      >
                        <span className='material-icons me-2'>
                          add_moderator
                        </span>
                        Activar 2FA
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className='d-flex align-items-center mb-3'>
                        <span className='material-icons text-success me-2'>
                          verified_user
                        </span>
                        <span>2FA está activado en tu cuenta</span>
                      </div>
                      <button
                        type='button'
                        className='btn btn-outline-danger'
                        onClick={showDisable2FAModal}
                        disabled={isLoading}
                      >
                        <span className='material-icons me-2'>
                          remove_moderator
                        </span>
                        Desactivar 2FA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferencias */}
            <div className='col-md-6 mb-4'>
              <div className='app-card'>
                <div className='card-header d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>Preferencias</h5>
                </div>
                <div className='card-body'>
                  <form onSubmit={handlePreferencesSubmit}>
                    <div className='row'>
                      <div className='col-12 mb-4'>
                        <h6>Notificaciones</h6>

                        <div className='form-check form-switch mb-2'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='emailNoti'
                            checked={preferences.emailNotifications}
                            onChange={e =>
                              setPreferences({
                                ...preferences,
                                emailNotifications: e.target.checked,
                              })
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='emailNoti'
                          >
                            Recibir notificaciones por email
                          </label>
                        </div>

                        <div className='form-check form-switch mb-2'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='paymentNoti'
                            checked={preferences.paymentNotifications}
                            onChange={e =>
                              setPreferences({
                                ...preferences,
                                paymentNotifications: e.target.checked,
                              })
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='paymentNoti'
                          >
                            Notificaciones de pagos registrados
                          </label>
                        </div>

                        <div className='form-check form-switch mb-2'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='reportNoti'
                            checked={preferences.weeklyReports}
                            onChange={e =>
                              setPreferences({
                                ...preferences,
                                weeklyReports: e.target.checked,
                              })
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='reportNoti'
                          >
                            Resúmenes semanales
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className='row mb-3'>
                      <div className='col-12 mb-4'>
                        <h6>Visualización</h6>

                        <div className='mb-3'>
                          <label className='form-label'>Zona horaria</label>
                          <select
                            className='form-select'
                            value={preferences.timezone}
                            onChange={e =>
                              setPreferences({
                                ...preferences,
                                timezone: e.target.value,
                              })
                            }
                          >
                            <option>(GMT-4) Santiago de Chile</option>
                            <option>(GMT-3) Buenos Aires</option>
                            <option>(GMT-5) Bogotá</option>
                            <option>(GMT+1) Madrid</option>
                          </select>
                        </div>

                        <div className='mb-3'>
                          <label className='form-label'>Formato de fecha</label>
                          <select
                            className='form-select'
                            value={preferences.dateFormat}
                            onChange={e =>
                              setPreferences({
                                ...preferences,
                                dateFormat: e.target.value,
                              })
                            }
                          >
                            <option>DD/MM/AAAA</option>
                            <option>MM/DD/AAAA</option>
                            <option>AAAA-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className='d-flex justify-content-end mt-2'>
                      <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={isLoading}
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sesiones Activas */}
            <div className='col-md-12'>
              <div className='app-card'>
                <div className='card-header d-flex justify-content-between align-items-center'>
                  <h5 className='mb-0'>Sesiones Activas</h5>
                  <button
                    className='btn btn-sm btn-outline-danger'
                    onClick={handleCloseAllSessions}
                    disabled={isLoading}
                  >
                    Cerrar Todas las Sesiones
                  </button>
                </div>
                <div className='card-body'>
                  <div className='table-responsive'>
                    <table className='table'>
                      <thead>
                        <tr>
                          <th>Dispositivo</th>
                          <th>Ubicación</th>
                          <th>IP</th>
                          <th>Último Acceso</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map(session => (
                          <tr key={session.id}>
                            <td>
                              <i
                                className={`fa ${getDeviceIcon(session.device)} me-2`}
                              ></i>
                              {session.device}
                            </td>
                            <td>{session.location}</td>
                            <td>{session.ip}</td>
                            <td>
                              {session.isCurrent ? (
                                <span className='tag tag--success'>Actual</span>
                              ) : (
                                formatDate(session.lastAccess)
                              )}
                            </td>
                            <td>
                              {session.isCurrent ? (
                                '-'
                              ) : (
                                <button
                                  className='btn btn-sm btn-outline-danger'
                                  onClick={() => handleCloseSession(session.id)}
                                  disabled={isLoading}
                                >
                                  Cerrar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal para 2FA */}
        <TwoFactorModal
          isOpen={show2FAModal}
          onClose={() => {
            setShow2FAModal(false);
            setTotpSetup(null);
          }}
          setupData={totpSetup}
          onEnable={handleEnable2FA}
          onDisable={handleDisable2FA}
          mode={modalMode}
          isLoading={isLoading}
        />
      </Layout>
    </ProtectedRoute>
  );
}
