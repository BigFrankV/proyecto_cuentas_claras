import { useAuth } from '@/auth/AuthContext'
import * as authApi from '@/auth/auth.api'
import { useState } from 'react'

export default function Profile() {
  const { user, logout } = useAuth()
  if (!user) return (
    <div className="row g-3">
      <div className="col-12">
        <h1 className="page-title">
          <span className="material-icons text-primary">badge</span>
          Mi perfil
        </h1>
      </div>
      <div className="col-12">
        <div className="card p-3">
          <div className="p-4 text-center text-muted">No autenticado</div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="row g-3">
      <div className="col-12">
        <h1 className="page-title">
          <span className="material-icons text-primary">badge</span>
          Mi perfil
        </h1>
      </div>

      <div className="col-12 col-md-6">
        <div className="card p-4">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 72, height: 72 }}>
              <span className="material-icons">person</span>
            </div>
            <div>
              <h4 className="mb-1">{user.username ?? '—'}</h4>
              <div className="text-muted">ID: {user.id}</div>
            </div>
          </div>

          <hr />

          <div className="row">
            <div className="col-12 mb-2">
              <strong>Email:</strong>
              <div className="text-muted">{user.email ?? '—'}</div>
            </div>
            <div className="col-12 mb-2">
              <strong>Roles:</strong>
              <div className="text-muted">{(user.roles || []).join(', ') || '—'}</div>
            </div>
            <div className="col-12 mb-2">
              <strong>Comunidad ID:</strong>
              <div className="text-muted">{(user as any).comunidad_id ?? ((user as any).comunidadId ?? '—')}</div>
            </div>
            <div className="col-12">
              <strong>Super admin:</strong>
              <div className="text-muted">{(user as any).is_superadmin ? 'Sí' : 'No'}</div>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => alert('Editar perfil (no implementado)')}>Editar</button>
            <button className="btn btn-danger ms-auto" onClick={() => { logout(); }}>Cerrar sesión</button>
          </div>
        </div>
      </div>

      {/* 2FA card */}
      <div className="col-12 col-md-6">
        <div className="card p-3">
          <h5 className="mb-3">Autenticación en dos pasos (2FA)</h5>
          <TwoFactorCard />
        </div>
      </div>

      <div className="col-12 col-md-6">
        <div className="card p-3">
          <h5 className="mb-3">Detalles</h5>
          <dl className="row mb-0">
            <dt className="col-4">Username</dt>
            <dd className="col-8">{user.username}</dd>

            <dt className="col-4">ID</dt>
            <dd className="col-8">{user.id}</dd>

            <dt className="col-4">Email</dt>
            <dd className="col-8">{user.email ?? '—'}</dd>

            <dt className="col-4">Roles</dt>
            <dd className="col-8">{(user.roles || []).join(', ') || '—'}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}

function TwoFactorCard() {
  const [loading, setLoading] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const onSetup = async () => {
    setLoading(true); setMessage(null)
    try {
      const res = await authApi.setup2fa()
      setQr(res.qr || null)
      setSecret(res.base32 || null)
    } catch (err: any) {
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
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Código inválido')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <p className="text-muted">Protege tu cuenta usando Google Authenticator u otra app TOTP. Puedes configurar y activar 2FA desde aquí.</p>
      {message && <div className="alert alert-info">{message}</div>}
      {!qr && (
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onSetup} disabled={loading}>{loading ? 'Generando…' : 'Configurar 2FA'}</button>
        </div>
      )}
      {qr && (
        <div className="mt-3">
          <div className="mb-2">Escanea este código con tu app de autenticación:</div>
          <div style={{ maxWidth: 220 }}>
            <img src={qr} alt="QR 2FA" style={{ width: '100%' }} />
          </div>
          <div className="mt-2"><strong>Clave:</strong> <code>{secret}</code></div>
          <div className="mt-3">
            <label className="form-label">Código de tu app</label>
            <input className="form-control" value={code} onChange={e => setCode(e.target.value)} />
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-primary" onClick={onEnable} disabled={loading}>Confirmar y activar</button>
              <button className="btn btn-outline-secondary" onClick={() => { setQr(null); setSecret(null); setCode(''); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <hr />
      <div className="mt-3">
        <h6>Desactivar 2FA</h6>
        <p className="text-muted">Si deseas desactivar 2FA, ingresa un código válido desde tu app para confirmar.</p>
        <div className="mb-2">
          <input className="form-control" placeholder="Código de 2FA" value={disableCode} onChange={e => setDisableCode(e.target.value)} />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger" onClick={async () => {
            if (!disableCode) return setMessage('Ingresa un código')
            setLoading(true); setMessage(null)
            try {
              await authApi.disable2fa({ code: disableCode })
              setMessage('2FA desactivado')
              setDisableCode('')
            } catch (err: any) {
              setMessage(err?.response?.data?.message || 'No se pudo desactivar')
            } finally { setLoading(false) }
          }}>Desactivar 2FA</button>
        </div>
      </div>
    </div>
  )
}
