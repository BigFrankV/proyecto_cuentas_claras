import { useAuth } from '@/auth/AuthContext'

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
