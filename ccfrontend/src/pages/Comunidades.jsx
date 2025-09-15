import { useQuery } from '@tanstack/react-query'
import * as apiComunidades from '@/api/comunidades'
import { useAuth } from '@/auth/AuthContext'
import { Link } from 'react-router-dom'

export default function Comunidades() {
  const { user } = useAuth() || {}
  const { data, isLoading, error } = useQuery({
    queryKey: ['comunidades'],
    queryFn: () => apiComunidades.listComunidades()
  })

  const raw = (Array.isArray(data) ? data : (data?.items || []))
  const items = raw.map(c => ({
    id: c.id,
    nombre: c.razon_social || c.nombre || c.name || `Comunidad #${c.id}`,
    rut: c.rut || null,
    dv: c.dv || null,
    email: c.email_contacto || c.email || null,
    telefono: c.telefono_contacto || c.telefono || null,
    raw: c
  }))

  return (
    <div className="row g-3">
      <div className="col-12 d-flex align-items-center justify-content-between">
        <h1 className="page-title">
          <span className="material-icons text-primary">apartment</span>
          Comunidades
        </h1>
        {user?.is_superadmin && (
          <Link to="/comunidades/nueva" className="btn btn-primary">Crear comunidad</Link>
        )}
      </div>

      <div className="col-12">
        <div className="card p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{width: '90px'}}>ID</th>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={5} className="text-center py-4">Cargando…</td></tr>}
                {error && <tr><td colSpan={5} className="text-center text-danger py-4">Error al cargar</td></tr>}
                {!isLoading && !error && items?.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">Sin comunidades</td></tr>}
                {items?.map(c => (
                  <tr key={c.id}>
                    <td><span className="badge text-bg-primary">{c.id}</span></td>
                    <td>
                      <Link to={`/comunidades/${c.id}`}>{c.nombre}</Link>
                    </td>
                    <td>{c.rut}{c.dv ? '-' + c.dv : ''}</td>
                    <td>{c.email}</td>
                    <td>{c.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
