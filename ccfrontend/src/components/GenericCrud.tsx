import { useEffect, useRef, useState } from 'react'
import { api } from '@/http/axios'

type Props = {
  title: string
  list?: { url: string, params?: Record<string, any> }
  create?: { url: string }
  getOne?: { url: (id: number | string) => string }
  update?: { url: (id: number | string) => string }
  remove?: { url: (id: number | string) => string }
  exampleCreateBody?: any
  search?: string
}

export default function GenericCrud(p: Props) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState<string>(() => p.exampleCreateBody ? JSON.stringify(p.exampleCreateBody, null, 2) : '{\n  \n}')
  const [idQuery, setIdQuery] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any> | null>(null)

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
  useEffect(() => { if (p.search !== undefined) setSearch(p.search) }, [p.search])

  const filteredItems = items.filter(it => {
    if (!search) return true
    try { return JSON.stringify(it).toLowerCase().includes(search.toLowerCase()) } catch { return true }
  })

  const focusCreate = () => textareaRef.current?.focus()

  const openNewModal = () => {
    setEditingId(null)
    if (p.exampleCreateBody && typeof p.exampleCreateBody === 'object') {
      setFormValues(JSON.parse(JSON.stringify(p.exampleCreateBody)))
    } else {
      setFormValues(null)
    }
    setShowModal(true)
  }

  const openEditModal = (id: any, item: any) => {
    setEditingId(id)
    if (item && typeof item === 'object') setFormValues(JSON.parse(JSON.stringify(item)))
    else setFormValues(null)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setFormValues(null); setEditingId(null) }

  const onSubmitForm = async () => {
    try {
      if (editingId && p.update) {
        await api.patch(p.update.url(editingId), formValues)
      } else if (p.create) {
        await api.post(p.create.url, formValues)
      }
      await load()
      closeModal()
      alert(editingId ? 'Actualizado' : 'Creado')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error en operación')
    }
  }

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
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 className="page-title mb-1">
              <span className="material-icons text-primary">list_alt</span>
              {p.title}
            </h1>
            <small className="text-muted">Lista y operaciones rápidas sobre {p.title}</small>
          </div>

            <div className="kk-toolbar d-flex align-items-center">
            <input className="form-control form-control-sm me-2 kk-search" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{width:260}} />
            {p.create && <button className="btn btn-sm btn-primary" onClick={openNewModal}><span className="material-icons align-middle me-1">add</span> Nuevo</button>}
          </div>
        </div>
      </div>

      {p.list && (
        <div className="col-12">
          <div className="card p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 kk-data-table">
                <thead className="table-light">
                  <tr>
                    <th style={{width:80}}>#</th>
                    <th>Resumen</th>
                    <th style={{width:140}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && items.length === 0 && (
                    Array.from({length:3}).map((_,i) => (
                      <tr key={'s'+i}><td colSpan={3}><div className="skeleton-row" /></td></tr>
                    ))
                  )}
                  {error && <tr><td colSpan={3} className="text-center text-danger py-4">{error}</td></tr>}
                  {!loading && !error && filteredItems?.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-5">
                    <div className="kk-empty">
                      <div className="mb-2">No se encontraron resultados.</div>
                      {p.create && <button className="btn btn-outline-primary" onClick={focusCreate}>Crear nueva categoría</button>}
                    </div>
                  </td></tr>}

                  {!loading && !error && filteredItems?.map((it, i) => (
                    <tr key={i}>
                      <td className="text-muted">{it?.id ?? i + 1}</td>
                      <td>
                        <div className="fw-semibold">{renderSummary(it)}</div>
                        <div className="text-muted small mt-1"><code>{truncate(JSON.stringify(it), 180)}</code></div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {p.getOne && <button className="btn btn-sm btn-outline-primary" onClick={() => { setIdQuery(it?.id ?? ''); onGetOne() }}><span className="material-icons">visibility</span></button>}
                          {p.update && <button className="btn btn-sm btn-outline-warning" onClick={() => { openEditModal(it?.id ?? '', it) }}><span className="material-icons">edit</span></button>}
                          {p.remove && <button className="btn btn-sm btn-outline-danger" onClick={() => { setIdQuery(it?.id ?? ''); onRemove() }}><span className="material-icons">delete</span></button>}
                        </div>
                      </td>
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
                <textarea ref={textareaRef} className="form-control" rows={10} value={body} onChange={e => setBody(e.target.value)} />
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
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? 'Editar' : 'Crear'} {p.title}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {formValues ? (
                  <div className="row g-3">
                    {Object.keys(formValues).map(key => (
                      <div className="col-12 col-md-6" key={key}>
                        <label className="form-label">{key}</label>
                        <input className="form-control" value={String(formValues[key] ?? '')} onChange={e => setFormValues(v => ({...(v||{}), [key]: e.target.value}))} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea className="form-control" rows={8} value={body} onChange={e => setBody(e.target.value)} />
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={closeModal}>Cancelar</button>
                <button className="btn btn-primary" onClick={onSubmitForm}>{editingId ? 'Guardar' : 'Crear'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function truncate(s: string, n = 120) {
  if (!s) return ''
  return s.length <= n ? s : s.slice(0, n) + '…'
}

function renderSummary(it: any) {
  if (!it) return ''
  if (typeof it === 'string') return it
  if (it.nombre) return it.nombre
  if (it.name) return it.name
  if (it.descripcion) return it.descripcion?.slice?.(0, 60)
  try { return Object.values(it).find(v => typeof v === 'string') ?? JSON.stringify(it).slice(0,60) } catch { return JSON.stringify(it).slice(0,60) }
}
