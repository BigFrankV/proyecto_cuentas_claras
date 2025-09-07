import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      const payload = form.identifier.includes('@')
        ? { email: form.identifier, password: form.password }
        : { username: form.identifier, password: form.password }
      await login(payload)
      nav('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center minh-50">
      <div className="col-12 col-md-7 col-lg-5">
        <div className="card p-4 p-md-5">
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
            <button className="btn btn-primary" disabled={loading}>
              <span className="material-icons align-middle me-1">arrow_forward</span>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
          <hr className="my-4" />
          <p className="mb-0">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
      </div>
    </div>
  )
}
