import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const nav = useNavigate()
  const { login, completeTwoFactor } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiState, setApiState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' })
  const [twoFactor, setTwoFactor] = useState<{ required: boolean; tempToken?: string } | null>(null)
  const [code, setCode] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    setApiState({ status: 'loading', message: 'Enviando credenciales...' })
    try {
      const payload = form.identifier.includes('@')
        ? { email: form.identifier, password: form.password }
        : { username: form.identifier, password: form.password }
      const res = await login(payload)
      // if backend requires 2FA, it should return { twoFactorRequired: true, tempToken }
      if (res?.twoFactorRequired) {
        setTwoFactor({ required: true, tempToken: res.tempToken })
        setApiState({ status: 'idle', message: 'Se requiere código de dos pasos' })
      } else {
        setApiState({ status: 'success', message: 'Autenticado correctamente, redirigiendo…' })
        setTimeout(() => nav('/'), 400)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'No se pudo iniciar sesión'
      setError(msg)
      setApiState({ status: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  const submit2fa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!twoFactor?.tempToken) return
    setApiState({ status: 'loading', message: 'Verificando código…' })
    try {
      if (!completeTwoFactor) throw new Error('No 2FA handler')
      await completeTwoFactor(twoFactor.tempToken!, code)
      setApiState({ status: 'success', message: 'Verificado — redirigiendo…' })
      setTimeout(() => nav('/'), 400)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Código inválido'
      setApiState({ status: 'error', message: msg })
    }
  }

  return (
    <div className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div className="row g-0 align-items-center">
          <div className={`col-12 col-lg-6 ${styles.left}`}>
            <div className={styles.leftContent}>
              <h2 className="display-6 mb-3">Bienvenido a Cuentas Claras</h2>
              <p className="lead mb-4">Gestiona tus comunidades, pagos y reportes desde una sola plataforma. Seguro, simple y hecho para administradores y residentes.</p>
              <div className={styles.visual} aria-hidden>
                {/* simple decorative SVG */}
                <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0" stopColor="#e8f1ff" />
                      <stop offset="1" stopColor="#dbeeff" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#g1)" rx="14" />
                  <g fill="#bcd7ff" opacity="0.9">
                    <circle cx="120" cy="120" r="60" />
                    <rect x="220" y="60" width="240" height="140" rx="12" />
                    <circle cx="420" cy="280" r="48" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className={`d-flex justify-content-center ${styles.cardWrap}`}>
              <div className={`${styles.loginCard} card p-4 p-md-5`}> 
                <h1 className="page-title">
                  <span className="material-icons text-primary">login</span>
                  Ingresar
                </h1>
                <form onSubmit={onSubmit} className="vstack gap-3">
                  <div>
                    <label className="form-label">Usuario o Email</label>
                    <input
                      required
                      className="form-control"
                      value={form.identifier}
                      onChange={e => setForm({ ...form, identifier: e.target.value })}
                      placeholder="usuario o correo@dominio.cl"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {twoFactor?.required && (
                    <div>
                      <label className="form-label">Código de autenticación (Google Authenticator)</label>
                      <input
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="form-control"
                        placeholder="123456"
                      />
                      <button className="btn btn-outline-primary mt-2" onClick={submit2fa}>Verificar</button>
                    </div>
                  )}
                  <button className="btn btn-primary d-flex align-items-center justify-content-center" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden></span>
                        Entrando…
                      </>
                    ) : (
                      <>
                        <span className="material-icons align-middle me-1">arrow_forward</span>
                        Entrar
                      </>
                    )}
                  </button>

                  {/* Visual API status panel */}
                  <div className={styles.apiStatusWrap} aria-live="polite">
                    <div className={`${styles.apiStatus} ${apiState.status === 'loading' ? styles.loading : ''} ${apiState.status === 'success' ? styles.success : ''} ${apiState.status === 'error' ? styles.error : ''}`}>
                      <span className="material-icons me-2" aria-hidden>
                        {apiState.status === 'loading' ? 'hourglass_top' : apiState.status === 'success' ? 'check_circle' : apiState.status === 'error' ? 'error' : 'wifi_tethering'}
                      </span>
                      <div className={styles.apiMessage}>{apiState.message || 'Listo para enviar credenciales'}</div>
                    </div>
                  </div>
                </form>
                <hr className="my-4" />
                <p className="mb-0">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
