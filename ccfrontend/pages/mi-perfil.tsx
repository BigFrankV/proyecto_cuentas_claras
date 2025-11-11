/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

import Layout from '@/components/layout/Layout';
import TwoFactorModal from '@/components/ui/TwoFactorModal';
import profileService from '@/lib/profileService';
import { getUserRole } from '@/lib/roles';
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

export default function MiPerfil() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserExtended | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Estados para foto de perfil
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Cargar foto de perfil
      const photo = await profileService.getProfilePhoto();
      console.log('Foto de perfil cargada:', photo);
      setProfilePhoto(photo);

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

  // Manejar selección de foto
  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMessage({
          type: 'error',
          text: 'Por favor selecciona un archivo de imagen válido',
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'La imagen no debe pesar más de 5MB',
        });
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = e => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // Manejar carga de foto
  const handlePhotoUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      return;
    }

    const file = fileInputRef.current.files[0];
    setIsUploadingPhoto(true);

    try {
      await profileService.uploadProfilePhoto(file);
      setMessage({
        type: 'success',
        text: '¡Foto de perfil actualizada correctamente!',
      });

      // Cargar la nueva foto
      const photo = await profileService.getProfilePhoto();
      setProfilePhoto(photo);
      setPhotoPreview(null);

      // Refrescar usuario
      await refreshUser();

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Manejar eliminación de foto
  const handlePhotoDelete = async () => {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar tu foto de perfil?',
      )
    ) {
      return;
    }

    try {
      await profileService.deleteProfilePhoto();
      setMessage({
        type: 'success',
        text: 'Foto de perfil eliminada correctamente',
      });
      setProfilePhoto(null);
      setPhotoPreview(null);
      await refreshUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
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
          {/* Hero Section */}
          <div className='profile-hero bg-gradient-primary text-white rounded-3 p-4 mb-4 shadow-sm'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <h1 className='h2 mb-1 fw-bold'>Mi Perfil</h1>
                <p className='mb-0 opacity-75'>
                  Gestiona tu información personal y preferencias de cuenta
                </p>
              </div>
              <div className='d-none d-md-block'>
                <span
                  className='material-icons'
                  style={{ fontSize: '4rem', opacity: '0.3' }}
                >
                  account_circle
                </span>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav aria-label='breadcrumb' className='mb-4'>
            <ol className='breadcrumb'>
              <li className='breadcrumb-item'>
                <Link href='/dashboard' className='text-decoration-none'>
                  <span
                    className='material-icons me-1'
                    style={{ fontSize: '16px' }}
                  >
                    dashboard
                  </span>
                  Dashboard
                </Link>
              </li>
              <li className='breadcrumb-item active' aria-current='page'>
                <span
                  className='material-icons me-1'
                  style={{ fontSize: '16px' }}
                >
                  person
                </span>
                Mi Perfil
              </li>
            </ol>
          </nav>

          {/* Mensaje de estado */}
          {message && (
            <div
              className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show shadow-sm border-0`}
              role='alert'
            >
              <div className='d-flex align-items-center'>
                <span
                  className='material-icons me-2'
                  style={{ fontSize: '20px' }}
                >
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <div className='flex-grow-1'>
                  <strong>
                    {message.type === 'success' ? '¡Éxito!' : 'Error'}
                  </strong>{' '}
                  {message.text}
                </div>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setMessage(null)}
                  aria-label='Close'
                ></button>
              </div>
            </div>
          )}

          <div className='row g-4'>
            {/* Información Personal y Foto de Perfil */}
            <div className='col-lg-4 mb-4'>
              <div className='app-card h-100 shadow-sm border-0 rounded-3 overflow-hidden'>
                <div className='card-body p-4'>
                  <div className='text-center mb-4'>
                    {/* Foto de perfil o avatar */}
                    <div className='position-relative d-inline-block'>
                      <div
                        className='avatar-container rounded-circle shadow position-relative border-0 d-flex align-items-center justify-content-center overflow-hidden'
                        style={{
                          width: '120px',
                          height: '120px',
                          background: !profilePhoto
                            ? 'linear-gradient(135deg, var(--color-accent), var(--color-primary))'
                            : '#f0f0f0',
                          cursor: 'pointer',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        role='button'
                        aria-label='Cambiar foto de perfil'
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            fileInputRef.current?.click();
                          }
                        }}
                      >
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt='Foto de perfil'
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                            onError={() => {
                              console.error('Error cargando foto de perfil desde:', profilePhoto);
                              setProfilePhoto(null);
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              color: 'white',
                              fontSize: '48px',
                              fontWeight: 'bold',
                            }}
                          >
                            {getUserInitials()}
                          </span>
                        )}
                        {/* Overlay al pasar el mouse */}
                        <div
                          className='position-absolute w-100 h-100 d-flex align-items-center justify-content-center'
                          style={{
                            background: 'rgba(0,0,0,0.5)',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                            pointerEvents: 'none',
                          }}
                          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.opacity = '1';
                          }}
                          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.opacity = '0';
                          }}
                          aria-hidden='true'
                        >
                          <span
                            className='material-icons'
                            style={{ fontSize: '32px', color: 'white' }}
                          >
                            camera_alt
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Preview de nueva foto */}
                    {photoPreview && (
                      <div className='mb-3 text-center'>
                        <div className='alert alert-info d-flex align-items-center gap-2 small'>
                          <span
                            className='material-icons'
                            style={{ fontSize: '16px' }}
                          >
                            info
                          </span>
                          Vista previa de la nueva foto
                        </div>
                        <Image
                          src={photoPreview}
                          alt='Preview'
                          width={120}
                          height={120}
                          className='img-fluid rounded'
                          style={{
                            maxWidth: '120px',
                            maxHeight: '120px',
                            marginBottom: '10px',
                          }}
                        />
                        <div className='d-flex gap-2 justify-content-center'>
                          <button
                            type='button'
                            className='btn btn-sm btn-success'
                            onClick={handlePhotoUpload}
                            disabled={isUploadingPhoto}
                          >
                            <span className='material-icons me-1'>
                              {isUploadingPhoto ? 'hourglass_empty' : 'check'}
                            </span>
                            {isUploadingPhoto ? 'Subiendo...' : 'Confirmar'}
                          </button>
                          <button
                            type='button'
                            className='btn btn-sm btn-secondary'
                            onClick={() => setPhotoPreview(null)}
                            disabled={isUploadingPhoto}
                          >
                            <span className='material-icons me-1'>close</span>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handlePhotoSelect}
                      style={{ display: 'none' }}
                    />

                    {profilePhoto && !photoPreview && (
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-danger'
                        onClick={handlePhotoDelete}
                        title='Eliminar foto de perfil'
                      >
                        <span className='material-icons'>delete</span>
                      </button>
                    )}

                    <h4 className='mb-2 fw-bold text-dark mt-3'>
                      {profileForm.firstName} {profileForm.lastName}
                    </h4>
                    <p className='text-muted mb-3 small'>{profileForm.email}</p>
                    <span
                      className={`badge ${user?.is_superadmin ? 'bg-danger' : 'bg-primary'} fs-6 px-3 py-2 rounded-pill`}
                    >
                      <span
                        className='material-icons me-1'
                        style={{ fontSize: '16px' }}
                      >
                        badge
                      </span>
                      {getUserRole(user)}
                    </span>
                  </div>

                  <hr className='my-4' />

                  <div className='profile-info'>
                    <div className='d-flex align-items-center mb-3'>
                      <div className='info-icon me-3'>
                        <span
                          className='material-icons text-primary'
                          style={{ fontSize: '20px' }}
                        >
                          phone
                        </span>
                      </div>
                      <div className='flex-grow-1'>
                        <label className='form-label fw-semibold small mb-0 text-muted'>
                          Teléfono
                        </label>
                        <p className='mb-0 fw-medium'>
                          {profileForm.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    <div className='d-flex align-items-center mb-3'>
                      <div className='info-icon me-3'>
                        <span
                          className='material-icons text-success'
                          style={{ fontSize: '20px' }}
                        >
                          access_time
                        </span>
                      </div>
                      <div className='flex-grow-1'>
                        <label className='form-label fw-semibold small mb-0 text-muted'>
                          Última conexión
                        </label>
                        <p className='mb-0 fw-medium'>
                          {userProfile?.lastConnection
                            ? formatDate(userProfile.lastConnection)
                            : 'Sesión actual'}
                        </p>
                      </div>
                    </div>

                    <div className='d-flex align-items-start'>
                      <div className='info-icon me-3 mt-1'>
                        <span
                          className='material-icons text-info'
                          style={{ fontSize: '20px' }}
                        >
                          business
                        </span>
                      </div>
                      <div className='flex-grow-1'>
                        <label className='form-label fw-semibold small mb-2 text-muted'>
                          Comunidades que administra
                        </label>
                        <div className='mb-0'>{getCommunityBadges()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editar Perfil */}
            <div className='col-lg-8 mb-4'>
              <div className='app-card h-100 shadow-sm border-0 rounded-3 overflow-hidden'>
                <div className='card-header bg-white border-bottom-0 py-4 px-4'>
                  <div className='d-flex align-items-center'>
                    <span
                      className='material-icons text-primary me-3'
                      style={{ fontSize: '28px' }}
                    >
                      edit
                    </span>
                    <div>
                      <h4 className='mb-1 fw-bold text-dark'>
                        Editar Información de Perfil
                      </h4>
                      <p className='mb-0 text-muted small'>
                        Actualiza tus datos personales y credenciales
                      </p>
                    </div>
                  </div>
                </div>
                <div className='card-body p-4'>
                  <form onSubmit={handleProfileSubmit}>
                    {/* Información Personal */}
                    <div className='mb-4'>
                      <h5 className='fw-bold text-dark mb-3 d-flex align-items-center'>
                        <span
                          className='material-icons me-2 text-primary'
                          style={{ fontSize: '20px' }}
                        >
                          person
                        </span>
                        Información Personal
                      </h5>
                      <div className='row g-3'>
                        <div className='col-md-6'>
                          <label className='form-label fw-semibold required'>
                            Nombre
                          </label>
                          <input
                            type='text'
                            className='form-control form-control-lg'
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
                          <label className='form-label fw-semibold required'>
                            Apellido
                          </label>
                          <input
                            type='text'
                            className='form-control form-control-lg'
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
                    </div>

                    {/* Información de Contacto */}
                    <div className='mb-4'>
                      <h5 className='fw-bold text-dark mb-3 d-flex align-items-center'>
                        <span
                          className='material-icons me-2 text-primary'
                          style={{ fontSize: '20px' }}
                        >
                          contact_mail
                        </span>
                        Información de Contacto
                      </h5>
                      <div className='row g-3'>
                        <div className='col-md-6'>
                          <label className='form-label fw-semibold required'>
                            Email
                          </label>
                          <input
                            type='email'
                            className='form-control form-control-lg'
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
                        <div className='col-md-6'>
                          <label className='form-label fw-semibold'>
                            Teléfono
                          </label>
                          <input
                            type='tel'
                            className='form-control form-control-lg'
                            value={profileForm.phone}
                            onChange={e =>
                              setProfileForm({
                                ...profileForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <hr className='my-4' />

                    {/* Cambio de Contraseña */}
                    <div className='mb-4'>
                      <h5 className='fw-bold text-dark mb-3 d-flex align-items-center'>
                        <span
                          className='material-icons me-2 text-warning'
                          style={{ fontSize: '20px' }}
                        >
                          lock
                        </span>
                        Cambiar Contraseña
                      </h5>

                      <div className='row g-3'>
                        <div className='col-md-6'>
                          <label className='form-label fw-semibold'>
                            Contraseña Actual
                          </label>
                          <input
                            type='password'
                            className='form-control form-control-lg'
                            value={passwordForm.currentPassword}
                            onChange={e =>
                              setPasswordForm({
                                ...passwordForm,
                                currentPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className='col-md-6'></div>
                        <div className='col-md-6'>
                          <label className='form-label fw-semibold'>
                            Nueva Contraseña
                          </label>
                          <input
                            type='password'
                            className='form-control form-control-lg'
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
                          <label className='form-label fw-semibold'>
                            Confirmar Nueva Contraseña
                          </label>
                          <input
                            type='password'
                            className='form-control form-control-lg'
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
                    </div>

                    <div className='d-flex justify-content-end gap-2 pt-3 border-top'>
                      <button
                        type='button'
                        className='btn btn-outline-secondary px-4'
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
                        <span
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          refresh
                        </span>
                        Cancelar
                      </button>
                      <button
                        type='button'
                        className='btn btn-secondary px-4'
                        onClick={handlePasswordSubmit}
                        disabled={
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          isLoading
                        }
                      >
                        <span
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          lock_reset
                        </span>
                        {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </button>
                      <button
                        type='submit'
                        className='btn btn-primary px-4'
                        disabled={isLoading}
                      >
                        <span
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          save
                        </span>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Autenticación de Dos Factores */}
            <div className='col-md-6 mb-4'>
              <div className='app-card shadow-sm border-0 rounded-3 overflow-hidden h-100'>
                <div className='card-header bg-white border-bottom-0 py-4 px-4'>
                  <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center'>
                      <span
                        className='material-icons text-info me-3'
                        style={{ fontSize: '28px' }}
                      >
                        security
                      </span>
                      <div>
                        <h5 className='mb-1 fw-bold text-dark'>
                          Autenticación 2FA
                        </h5>
                        <p className='mb-0 text-muted small'>
                          Seguridad adicional
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge fs-6 px-3 py-2 rounded-pill ${
                        totp2FAEnabled ? 'bg-success' : 'bg-warning text-dark'
                      }`}
                    >
                      {totp2FAEnabled ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                </div>
                <div className='card-body p-4'>
                  <p className='text-muted mb-4'>
                    Agrega una capa extra de seguridad a tu cuenta usando Google
                    Authenticator o una aplicación compatible.
                  </p>

                  {!totp2FAEnabled ? (
                    <div className='text-center py-3'>
                      <div className='d-flex align-items-center justify-content-center mb-3 text-warning'>
                        <span
                          className='material-icons me-2'
                          style={{ fontSize: '24px' }}
                        >
                          warning
                        </span>
                        <span className='fw-medium'>
                          Tu cuenta no tiene 2FA activado
                        </span>
                      </div>
                      <button
                        type='button'
                        className='btn btn-success btn-lg px-4 py-2'
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
                    <div className='text-center py-3'>
                      <div className='d-flex align-items-center justify-content-center mb-3 text-success'>
                        <span
                          className='material-icons me-2'
                          style={{ fontSize: '24px' }}
                        >
                          verified_user
                        </span>
                        <span className='fw-medium'>
                          2FA está activado en tu cuenta
                        </span>
                      </div>
                      <button
                        type='button'
                        className='btn btn-outline-danger btn-lg px-4 py-2'
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
              <div className='app-card shadow-sm border-0 rounded-3 overflow-hidden h-100'>
                <div className='card-header bg-white border-bottom-0 py-4 px-4'>
                  <div className='d-flex align-items-center'>
                    <span
                      className='material-icons text-secondary me-3'
                      style={{ fontSize: '28px' }}
                    >
                      settings
                    </span>
                    <div>
                      <h5 className='mb-1 fw-bold text-dark'>Preferencias</h5>
                      <p className='mb-0 text-muted small'>
                        Personaliza tu experiencia
                      </p>
                    </div>
                  </div>
                </div>
                <div className='card-body p-4'>
                  <form onSubmit={handlePreferencesSubmit}>
                    {/* Notificaciones */}
                    <div className='mb-4'>
                      <h6 className='fw-bold text-dark mb-3 d-flex align-items-center'>
                        <span
                          className='material-icons me-2 text-primary'
                          style={{ fontSize: '18px' }}
                        >
                          notifications
                        </span>
                        Notificaciones
                      </h6>

                      <div className='row g-3'>
                        <div className='col-12'>
                          <div className='form-check form-switch d-flex align-items-center p-3 rounded-2 hover-bg-light border'>
                            <input
                              className='form-check-input me-3 flex-shrink-0'
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
                              className='form-check-label fw-medium mb-0 flex-grow-1'
                              htmlFor='emailNoti'
                            >
                              Notificaciones por email
                            </label>
                          </div>
                        </div>

                        <div className='col-12'>
                          <div className='form-check form-switch d-flex align-items-center p-3 rounded-2 hover-bg-light border'>
                            <input
                              className='form-check-input me-3 flex-shrink-0'
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
                              className='form-check-label fw-medium mb-0 flex-grow-1'
                              htmlFor='paymentNoti'
                            >
                              Alertas de pagos
                            </label>
                          </div>
                        </div>

                        <div className='col-12'>
                          <div className='form-check form-switch d-flex align-items-center p-3 rounded-2 hover-bg-light border'>
                            <input
                              className='form-check-input me-3 flex-shrink-0'
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
                              className='form-check-label fw-medium mb-0 flex-grow-1'
                              htmlFor='reportNoti'
                            >
                              Resúmenes semanales
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visualización */}
                    <div className='mb-4'>
                      <h6 className='fw-bold text-dark mb-3 d-flex align-items-center'>
                        <span
                          className='material-icons me-2 text-info'
                          style={{ fontSize: '18px' }}
                        >
                          visibility
                        </span>
                        Visualización
                      </h6>

                      <div className='row g-3'>
                        <div className='col-12'>
                          <label className='form-label fw-semibold small'>
                            Zona horaria
                          </label>
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

                        <div className='col-12'>
                          <label className='form-label fw-semibold small'>
                            Formato de fecha
                          </label>
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

                    <div className='d-flex justify-content-end pt-3 border-top'>
                      <button
                        type='submit'
                        className='btn btn-primary px-4'
                        disabled={isLoading}
                      >
                        <span
                          className='material-icons me-2'
                          style={{ fontSize: '16px' }}
                        >
                          save
                        </span>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Sesiones Activas */}
            <div className='col-md-12'>
              <div className='app-card shadow-sm border-0 rounded-3 overflow-hidden'>
                <div className='card-header bg-white border-bottom-0 py-4 px-4'>
                  <div className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center'>
                      <span
                        className='material-icons text-warning me-3'
                        style={{ fontSize: '28px' }}
                      >
                        devices
                      </span>
                      <div>
                        <h5 className='mb-1 fw-bold text-dark'>
                          Sesiones Activas
                        </h5>
                        <p className='mb-0 text-muted small'>
                          Dispositivos conectados a tu cuenta
                        </p>
                      </div>
                    </div>
                    <button
                      className='btn btn-outline-danger px-3'
                      onClick={handleCloseAllSessions}
                      disabled={isLoading}
                    >
                      <span
                        className='material-icons me-2'
                        style={{ fontSize: '16px' }}
                      >
                        logout
                      </span>
                      Cerrar Todas
                    </button>
                  </div>
                </div>
                <div className='card-body p-0'>
                  <div className='table-responsive'>
                    <table className='table table-hover mb-0'>
                      <thead className='table-light'>
                        <tr>
                          <th className='border-0 fw-semibold py-3 px-4'>
                            Dispositivo
                          </th>
                          <th className='border-0 fw-semibold py-3 px-4'>
                            Ubicación
                          </th>
                          <th className='border-0 fw-semibold py-3 px-4'>IP</th>
                          <th className='border-0 fw-semibold py-3 px-4'>
                            Último Acceso
                          </th>
                          <th className='border-0 fw-semibold py-3 px-4 text-end'>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map(session => (
                          <tr
                            key={session.id}
                            className='border-bottom border-light'
                          >
                            <td className='py-3 px-4'>
                              <div className='d-flex align-items-center'>
                                <i
                                  className={`fa ${getDeviceIcon(session.device)} me-3 text-muted`}
                                  style={{ fontSize: '18px' }}
                                ></i>
                                <span className='fw-medium'>
                                  {session.device}
                                </span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <span className='text-muted'>
                                {session.location}
                              </span>
                            </td>
                            <td className='py-3 px-4'>
                              <code className='bg-light px-2 py-1 rounded small'>
                                {session.ip}
                              </code>
                            </td>
                            <td className='py-3 px-4'>
                              {session.isCurrent ? (
                                <span className='badge bg-success px-3 py-2 rounded-pill'>
                                  <span
                                    className='material-icons me-1'
                                    style={{ fontSize: '14px' }}
                                  >
                                    radio_button_checked
                                  </span>
                                  Actual
                                </span>
                              ) : (
                                <span className='text-muted small'>
                                  {formatDate(session.lastAccess)}
                                </span>
                              )}
                            </td>
                            <td className='py-3 px-4 text-end'>
                              {session.isCurrent ? (
                                <span className='text-muted small'>-</span>
                              ) : (
                                <button
                                  className='btn btn-sm btn-outline-danger px-3'
                                  onClick={() => handleCloseSession(session.id)}
                                  disabled={isLoading}
                                  title='Cerrar sesión'
                                >
                                  <span
                                    className='material-icons'
                                    style={{ fontSize: '16px' }}
                                  >
                                    logout
                                  </span>
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
