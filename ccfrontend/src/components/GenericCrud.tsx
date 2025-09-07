import { useEffect, useState } from 'react'
import { api } from '@/http/axios'

type Props = {
  title: string
  list?: { url: string, params?: Record<string, any> }
  create?: { url: string }
  getOne?: { url: (id: number | string) => string }
  update?: { url: (id: number | string) => string }
  remove?: { url: (id: number | string) => string }
  exampleCreateBody?: any
}

export default function GenericCrud(p: Props) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState<string>(() => p.exampleCreateBody ? JSON.stringify(p.exampleCreateBody, null, 2) : '{\n  \n}')
  const [idQuery, setIdQuery] = useState<string>('')

  const load = async () => {
    if (!p.list) return
    setLoading(true); setError(null)
    try {
      const res = await api.get(p.list.url, { params: p.list.params })
      const data = res.data
      setItems(Array.isArray(data) ? data : (data?.items || []))
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo cargar el listado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [p.list?.url])

  const onCreate = async () => {
    if (!p.create) return
    try {
      const payload = JSON.parse(body || '{}')
      const res = await api.post(p.create.url, payload)
      await load()
      alert('Creado con id: ' + (res.data?.id ?? '(ver respuesta)'))
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al crear')
    }
  }

  const onGetOne = async () => {
    if (!p.getOne || !idQuery) return
    try {
      const res = await api.get(p.getOne.url(idQuery))
      alert(JSON.stringify(res.data, null, 2))
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al obtener')
    }
  }

  const onUpdate = async () => {
    if (!p.update || !idQuery) return
    try {
      const payload = JSON.parse(body || '{}')
      await api.patch(p.update.url(idQuery), payload)
      await load()
      alert('Actualizado')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al actualizar')
    }
  }

  const onRemove = async () => {
    if (!p.remove || !idQuery) return
    if (!confirm('¿Seguro que deseas eliminar ' + idQuery + '?')) return
    try {
      await api.delete(p.remove.url(idQuery))
      await load()
      alert('Eliminado')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al eliminar')
    }
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        <h1 className="page-title">
          <span className="material-icons text-primary">list_alt</span>
          {p.title}
        </h1>
      </div>

      {p.list && (
        <div className="col-12">
          <div className="card p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Resumen</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={2} className="text-center py-4">Cargando…</td></tr>}
                  {error && <tr><td colSpan={2} className="text-center text-danger py-4">{error}</td></tr>}
                  {!loading && !error && items?.length === 0 && <tr><td colSpan={2} className="text-center text-muted py-4">Sin resultados</td></tr>}
                  {items?.map((it, i) => (
                    <tr key={i}>
                      <td>{it?.id ?? i + 1}</td>
                      <td><code className="small">{JSON.stringify(it).slice(0, 200)}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {(p.create || p.getOne || p.update || p.remove) && (
        <div className="col-12">
          <div className="card p-3">
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label">ID</label>
                <input className="form-control" value={idQuery} onChange={e => setIdQuery(e.target.value)} placeholder="id para GET/PATCH/DELETE" />
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {p.getOne && <button className="btn btn-outline-primary btn-sm" onClick={onGetOne}><span className="material-icons align-middle me-1">search</span> Obtener</button>}
                  {p.update && <button className="btn btn-outline-warning btn-sm" onClick={onUpdate}><span className="material-icons align-middle me-1">edit</span> Actualizar</button>}
                  {p.remove && <button className="btn btn-outline-danger btn-sm" onClick={onRemove}><span className="material-icons align-middle me-1">delete</span> Eliminar</button>}
                </div>
              </div>
              <div className="col-12 col-md-9">
                <label className="form-label">JSON (crear/actualizar)</label>
                <textarea className="form-control" rows={10} value={body} onChange={e => setBody(e.target.value)} />
                {p.create && (
                  <div className="mt-2">
                    <button className="btn btn-primary" onClick={onCreate}>
                      <span className="material-icons align-middle me-1">add_circle</span>
                      Crear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
