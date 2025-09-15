// ...existing code...
import React, { useEffect, useRef, useState } from 'react'
import { api } from '@/http/axios'

export default function GenericCrud(p) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [body, setBody] = useState(() => p.exampleCreateBody ? JSON.stringify(p.exampleCreateBody, null, 2) : '{\n  \n}')
  const [idQuery, setIdQuery] = useState('')
  const [search, setSearch] = useState('')
  const textareaRef = useRef(null)
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formValues, setFormValues] = useState(null)

  const load = async () => {
    if (!p?.list?.url) return
    setLoading(true); setError(null)
    try {
      const res = await api.get(p.list.url, { params: p.list.params || {} })
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []))
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo cargar el listado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    if (!p?.create) return
    try {
      const payload = JSON.parse(body || '{}')
      await api.post(p.create.url, payload)
      await load()
      alert('Creado')
    } catch (e) {
      alert(e?.response?.data?.message || 'Error al crear')
    }
  }

  const onUpdate = async () => {
    if (!p?.update || !idQuery) return
    try {
      const payload = JSON.parse(body || '{}')
      await api.patch(p.update.url(idQuery), payload)
      await load()
      alert('Actualizado')
    } catch (e) {
      alert(e?.response?.data?.message || 'Error al actualizar')
    }
  }

  const onRemove = async () => {
    if (!p?.remove || !idQuery) return
    if (!confirm('¿Seguro que deseas eliminar ' + idQuery + '?')) return
    try {
      await api.delete(p.remove.url(idQuery))
      await load()
      alert('Eliminado')
    } catch (e) {
      alert(e?.response?.data?.message || 'Error al eliminar')
    }
  }

  const onGetOne = async () => {
    if (!p?.getOne || !idQuery) return
    try {
      const res = await api.get(p.getOne.url(idQuery))
      setBody(JSON.stringify(res.data, null, 2))
      setFormValues(res.data)
      setShowModal(true)
    } catch (e) {
      alert(e?.response?.data?.message || 'Error al obtener')
    }
  }

  return (
    <div className="generic-crud">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>{p.title || 'CRUD'}</h5>
        <div className="d-flex gap-2">
          {p.create && <button className="btn btn-sm btn-primary" onClick={onCreate}>Crear</button>}
          {p.update && <button className="btn btn-sm btn-secondary" onClick={onUpdate}>Actualizar</button>}
          {p.remove && <button className="btn btn-sm btn-danger" onClick={onRemove}>Eliminar</button>}
        </div>
      </div>

      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-4">
            <label className="form-label">Buscar / ID</label>
            <input className="form-control" value={idQuery} onChange={e => setIdQuery(e.target.value)} placeholder="ID o filtro" />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Buscador</label>
            <input className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="texto..." />
          </div>
          <div className="col-12 col-md-4 d-flex align-items-end gap-2">
            <button className="btn btn-outline-primary" onClick={onGetOne}>Cargar</button>
            <button className="btn btn-outline-secondary" onClick={load}>Refrescar</button>
          </div>
          <div className="col-12">
            <label className="form-label">Body (JSON)</label>
            <textarea ref={textareaRef} className="form-control" rows={8} value={body} onChange={e => setBody(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-3">
        <h6 className="mb-2">Listado</h6>
        {loading ? (
          <div className="text-muted">Cargando…</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).filter(it => !search || JSON.stringify(it).toLowerCase().includes(search.toLowerCase())).map(it => (
                <tr key={it.id ?? JSON.stringify(it)}>
                  <td><span className="badge bg-primary">{it.id ?? '—'}</span></td>
                  <td>{it.nombre || it.name || JSON.stringify(it)}</td>
                </tr>
              ))}
              {(items || []).length === 0 && <tr><td colSpan={2} className="text-center text-muted">Sin resultados</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
// ...existing code...