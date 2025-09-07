import { useQuery } from '@tanstack/react-query'
import { api } from '@/http/axios'

export default function Dashboard() {
  const health = useQuery({
    queryKey: ['healthz'],
    queryFn: async () => (await api.get('/healthz')).data
  })

  return (
    <div className="row g-3">
      <div className="col-12">
        <h1 className="page-title"><span className="material-icons text-primary">dashboard</span> Panel</h1>
      </div>
      <div className="col-12 col-md-6">
        <div className="card p-3">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Estado del servidor</h5>
            <span className="material-icons text-success">monitor_heart</span>
          </div>
          <div className="mt-3">
            {health.isLoading ? (
              <div className="text-muted">Cargando…</div>
            ) : (
              <pre className="bg-light p-3 rounded">{JSON.stringify(health.data, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
      <div className="col-12 col-md-6">
        <div className="card p-3">
          <h5 className="mb-2">Siguientes pasos</h5>
          <ul className="mb-0">
            <li>Configurar colores corporativos en <code>src/styles/index.css</code></li>
            <li>Ampliar módulos (Cargos, Pagos, Emisiones)</li>
            <li>Proteger rutas por rol (si aplica)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
