import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export default function Register() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await register(form)
      nav('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center minh-50">
      <div className="col-12 col-md-7 col-lg-6">
        <div className="card p-4 p-md-5">
          <h1 className="page-title">
            <span className="material-icons text-primary">person_add</span>
            Crear cuenta
          </h1>
          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Usuario</label>
              <input required className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Email</label>
              <input required type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label">Contraseña</label>
              <input required type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <div className="col-12"><div className="alert alert-danger">{error}</div></div>}
            <div className="col-12">
              <button className="btn btn-primary" disabled={loading}>
                <span className="material-icons align-middle me-1">how_to_reg</span>
                {loading ? 'Creando…' : 'Crear cuenta'}
              </button>
              <Link className="btn btn-link ms-2" to="/login">Ya tengo cuenta</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
