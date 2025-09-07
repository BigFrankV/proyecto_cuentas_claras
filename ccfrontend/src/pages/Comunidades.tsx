import { useQuery } from '@tanstack/react-query'
import * as apiComunidades from '@/api/comunidades'

export default function Comunidades() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['comunidades'],
    queryFn: () => apiComunidades.listComunidades()
  })

  const items = (Array.isArray(data) ? data : (data?.items || []))

  return (
    <div className="row g-3">
      <div className="col-12">
        <h1 className="page-title">
          <span className="material-icons text-primary">apartment</span>
          Comunidades
        </h1>
      </div>
      <div className="col-12">
        <div className="card p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{width: '90px'}}>ID</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={2} className="text-center py-4">Cargando…</td></tr>}
                {error && <tr><td colSpan={2} className="text-center text-danger py-4">Error al cargar</td></tr>}
                {!isLoading && !error && items?.length === 0 && <tr><td colSpan={2} className="text-center text-muted py-4">Sin comunidades</td></tr>}
                {items?.map((c: any) => (
                  <tr key={c.id}>
                    <td><span className="badge text-bg-primary">{c.id}</span></td>
                    <td>{c.nombre || c.name || `Comunidad #${c.id}`}</td>
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
