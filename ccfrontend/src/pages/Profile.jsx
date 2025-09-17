// ...existing code...
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import * as authApi from '@/auth/auth.api'
import '../styles/index.css'           // estilos globales del frontend
import '../public/assets/css/style.css'
export default function Profile() {
  const { user, logout } = useAuth()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Carga CSS y JS de la maqueta desde public/assets
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = '/assets/css/style.css'
    document.head.appendChild(cssLink)

    const s = document.createElement('script')
    s.src = '/assets/js/script.js'
    s.async = true
    document.body.appendChild(s)

    return () => {
      document.head.removeChild(cssLink)
      document.body.removeChild(s)
    }
  }, [])

  const initials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
  }

  if (!user) {
    return (
      <div className="container py-4">
        <div className="app-card p-3">
          <h3 className="mb-3">Mi Perfil</h3>
          <div className="text-center text-muted p-4">No autenticado</div>
        </div>
      </div>
    )
  }

  const emailToShow = user?.email ?? user?.correo ?? user?.mail ?? '—'
  const avatarSrc = user?.avatar_url || '/assets/img/avatar-placeholder.png' // coloca la imagen en public/assets/img

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('Perfil actualizado (demo)')
    }, 700)
  }

  const handlePrefsSubmit = (e) => {
    e.preventDefault()
    alert('Preferencias guardadas (demo)')
  }

  return (
    <div className="app-main">
      <div className="container-fluid fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="page-title">
            <span className="material-icons">badge</span>
            Mi Perfil
          </h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#/dashboard">Dashboard</a></li>
              <li className="breadcrumb-item active" aria-current="page">Mi Perfil</li>
            </ol>
          </nav>
        </div>

        <div className="row">
          {/* Columna izquierda: perfil */}
          <div className="col-md-4 mb-4">
            <div className="app-card h-100">
              <div className="card-body text-center">
                {avatarSrc ? (
                  <div className="avatar avatar-lg mb-3" style={{ width: 100, height: 100, margin: '0 auto' }}>
                    <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px' }} />
                  </div>
                ) : (
                  <div className="avatar avatar-lg mb-3" style={{ width: 100, height: 100, lineHeight: '100px', fontSize: 36, background: 'var(--color-accent)', color: '#fff', margin: '0 auto' }}>
                    {initials(user.nombre || user.username)}
                  </div>
                )}

                <h5 className="mb-1">{user.nombre ?? user.username ?? '—'}</h5>
                <p className="meta mb-2">{emailToShow}</p>
                <div className="mb-3">
                  <span className="tag tag--muted me-1">{(user.roles || [])[0] ?? 'Usuario'}</span>
                </div>

                <hr />

                <div className="text-start">
                  <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Teléfono</label>
                    <div>{user.telefono ?? user.phone ?? '—'}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Última conexión</label>
                    <div>{user.last_login ? new Date(user.last_login).toLocaleString() : '—'}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Comunidades</label>
                    <div>
                      {(user.admin_comunidades || []).length > 0 ? (
                        (user.admin_comunidades || []).map((c, i) => <span key={i} className="badge bg-primary me-1">{c}</span>)
                      ) : user.comunidad_name ? (
                        <span className="badge bg-primary">{user.comunidad_name}</span>
                      ) : '—'}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-outline-secondary" onClick={() => alert('Editar perfil (demo)')}>Editar</button>
                  <button className="btn btn-danger ms-auto" onClick={() => logout()}>Cerrar sesión</button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: formularios */}
          <div className="col-md-8 mb-4">
            <div className="app-card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Editar Información de Perfil</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label required">Nombre</label>
                      <input type="text" className="form-control" defaultValue={user.nombre ?? ''} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label required">Apellido</label>
                      <input type="text" className="form-control" defaultValue={user.apellido ?? ''} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label required">Email</label>
                    <input type="email" className="form-control" defaultValue={emailToShow} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-control" defaultValue={user.telefono ?? ''} />
                  </div>

                  <hr />

                  <h6>Cambiar contraseña</h6>
                  <div className="mb-3">
                    <label className="form-label">Contraseña actual</label>
                    <input type="password" className="form-control" />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label">Nueva contraseña</label>
                      <input type="password" id="newPassword" className="form-control" />
                      <div className="form-text">Mínimo 8 caracteres, incluir números y símbolos</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirmar nueva contraseña</label>
                      <input type="password" id="confirmNewPassword" className="form-control" />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button type="reset" className="btn btn-outline-secondary me-2">Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Preferencias */}
            <div className="app-card mt-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Preferencias</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handlePrefsSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Notificaciones</h6>
                      <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" id="emailNoti" defaultChecked />
                        <label className="form-check-label" htmlFor="emailNoti">Recibir notificaciones por email</label>
                      </div>
                      <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" id="paymentNoti" defaultChecked />
                        <label className="form-check-label" htmlFor="paymentNoti">Notificaciones de pagos</label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h6>Visualización</h6>
                      <div className="mb-3">
                        <label className="form-label">Zona horaria</label>
                        <select className="form-select" defaultValue="(GMT-4) Santiago de Chile">
                          <option>(GMT-4) Santiago de Chile</option>
                          <option>(GMT-3) Buenos Aires</option>
                          <option>(GMT-5) Bogotá</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Formato de fecha</label>
                        <select className="form-select" defaultValue="DD/MM/AAAA">
                          <option>DD/MM/AAAA</option>
                          <option>MM/DD/AAAA</option>
                          <option>AAAA-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-2">
                    <button type="submit" className="btn btn-primary">Guardar preferencias</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sesiones activas */}
            <div className="app-card mt-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Sesiones activas</h5>
                <button className="btn btn-sm btn-outline-danger" onClick={() => alert('Cerrar todas las sesiones (demo)')}>Cerrar todas</button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Dispositivo</th>
                        <th>Ubicación</th>
                        <th>IP</th>
                        <th>Último acceso</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><i className="fa fa-laptop me-2"></i>Windows</td>
                        <td>Santiago, Chile</td>
                        <td>192.168.1.105</td>
                        <td><span className="tag tag--success">Actual</span></td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td><i className="fa fa-mobile-alt me-2"></i>iPhone</td>
                        <td>Valparaíso, Chile</td>
                        <td>185.54.121.87</td>
                        <td>15/09/2025, 09:15</td>
                        <td><button className="btn btn-sm btn-outline-danger" onClick={() => alert('Sesión cerrada (demo)')}>Cerrar</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

/* TwoFactorCard (se deja para usar si lo integras en la página lateral) */
function TwoFactorCard() {
  const [loading, setLoading] = useState(false)
  const [qr, setQr] = useState(null)
  const [secret, setSecret] = useState(null)
  const [code, setCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [message, setMessage] = useState(null)

  const onSetup = async () => {
    setLoading(true); setMessage(null)
    try {
      const res = await authApi.setup2fa()
      setQr(res.qr || null)
      setSecret(res.base32 || null)
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Error al generar secreto')
    } finally { setLoading(false) }
  }

  const onEnable = async () => {
    if (!secret) return setMessage('No hay secreto generado')
    setLoading(true); setMessage(null)
    try {
      await authApi.enable2fa({ base32: secret, code })
      setMessage('2FA activado correctamente')
      setQr(null); setSecret(null); setCode('')
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Código inválido')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <p className="text-muted">Protege tu cuenta usando una app TOTP.</p>
      {message && <div className="alert alert-info">{message}</div>}
      {!qr && <button className="btn btn-outline-primary" onClick={onSetup} disabled={loading}>{loading ? 'Generando…' : 'Configurar 2FA'}</button>}
      {qr && (
        <div className="mt-3">
          <img src={qr} alt="QR 2FA" style={{ maxWidth: 220, width: '100%' }} />
          <div className="mt-2"><strong>Clave:</strong> <code>{secret}</code></div>
          <div className="mt-3">
            <input className="form-control mb-2" value={code} onChange={e => setCode(e.target.value)} placeholder="Código" />
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={onEnable}>Confirmar y activar</button>
              <button className="btn btn-outline-secondary" onClick={() => { setQr(null); setSecret(null); setCode('') }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <hr />
      <div className="mt-3">
        <input className="form-control mb-2" placeholder="Código para desactivar 2FA" value={disableCode} onChange={e => setDisableCode(e.target.value)} />
        <button className="btn btn-outline-danger" onClick={async () => {
          if (!disableCode) return setMessage('Ingresa un código')
          setLoading(true); setMessage(null)
          try {
            await authApi.disable2fa({ code: disableCode })
            setMessage('2FA desactivado')
            setDisableCode('')
          } catch (err) {
            setMessage(err?.response?.data?.message || 'No se pudo desactivar')
          } finally { setLoading(false) }
        }}>Desactivar 2FA</button>
      </div>
    </div>
  )
}