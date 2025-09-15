import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'

export default function MultaForm ({ unidadId: propUnidadId, comunidadId: propComunidadId, onCreated, compact = false }) {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin') || user?.is_superadmin

  const unidadIdFromUser =
    propUnidadId ||
    user?.unidadId ||
    user?.unidad?.id ||
    user?.unidad_id ||
    (Array.isArray(user?.unidades) && user.unidades[0]?.id) ||
    undefined

  const comunidadId =
    propComunidadId ||
    user?.comunidadId ||
    user?.comunidad?.id ||
    (Array.isArray(user?.comunidades) && user.comunidades[0]?.id) ||
    undefined

  const [unidadSeleccionada, setUnidadSeleccionada] = useState(unidadIdFromUser || '')
  const [unidades, setUnidades] = useState([])

  // cargar unidades de la comunidad para permitir selección si el user no tiene unidad fija
  useEffect(() => {
    let mounted = true
    if (!comunidadId) return
    const tryPaths = [
      `/unidades/comunidad/${comunidadId}`,
      `/unidades`,
      `/mod/unidades/comunidad/${comunidadId}`,
      `/mod/unidades`
    ]
    ;(async () => {
      try {
        for (const p of tryPaths) {
          try {
            const r = await api.get(p)
            const data = r?.data
            const items = Array.isArray(data) ? data : (data?.items || [])
            if (mounted && items.length) {
              setUnidades(items)
              // si no había unidad user, y hay al menos una, dejar dropdown vacío para seleccionar
              if (!unidadIdFromUser) setUnidadSeleccionada('')
              break
            }
          } catch (err) {
            if (err?.response?.status === 404) continue
            throw err
          }
        }
      } catch (err) {
        console.error('MultaForm: error cargando unidades', err)
      }
    })()
    return () => { mounted = false }
  }, [comunidadId])

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    personaId: isAdmin ? '' : (user?.id || ''), // propietario de la multa
    monto: '',
    descripcion: '',
    fecha: '',
    archivo: null
  })

  useEffect(() => {
    // cargar personas (same logic que antes)
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const r = await api.get('/personas')
        if (!mounted) return
        setUsers(Array.isArray(r.data) ? r.data : (r.data?.items || []))
        if (!isAdmin) setForm(f => ({ ...f, personaId: user?.id || '' }))
      } catch (err) {
        if (!mounted) return
        console.error('MultaForm: error cargando personas', err)
        setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [unidadId])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'archivo') {
      setForm(f => ({ ...f, archivo: files?.[0] || null }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const validate = () => {
    if (!form.monto) return 'El monto es obligatorio'
    if (!form.fecha) return 'La fecha es obligatoria'
    if (!form.descripcion) return 'La descripción es obligatoria'
    return null
  }

  const createMulta = async (e) => {
    e?.preventDefault?.()
    setError(null)
    setSuccess(null)
    const v = validate()
    if (v) { setError(new Error(v)); return }
    // determinar unidad objetivo
    const targetUnidadId = unidadSeleccionada || unidadIdFromUser
    if (!targetUnidadId) {
      setError(new Error('No se encontró unidad. Seleccione una unidad para crear la multa.'))
      return
    }

    setSaving(true)

    const payloadObj = {
      persona_id: form.personaId ? Number(form.personaId) : undefined,
      motivo: form.descripcion || undefined,
      descripcion: form.descripcion || undefined,
      monto: Number(form.monto),
      fecha: form.fecha
    }

    try {
      let res = null
      const postPath = `/multas/unidad/${targetUnidadId}` // obligatorio
      if (form.archivo) {
        const fd = new FormData()
        Object.keys(payloadObj).forEach(k => { if (payloadObj[k] !== undefined && payloadObj[k] !== null) fd.append(k, String(payloadObj[k])) })
        fd.append('comprobante', form.archivo)
        console.debug('MultaForm: intentando POST (formdata)', postPath)
        res = await api.post(postPath, fd)
      } else {
        console.debug('MultaForm: intentando POST (json)', postPath, payloadObj)
        res = await api.post(postPath, payloadObj)
      }

      if (!res || !(res.status >= 200 && res.status < 300)) throw new Error('No se pudo crear multa: respuesta inválida')
      const created = res.data
      setSuccess(created || { ok: true })
      setForm({ personaId: isAdmin ? '' : (user?.id || ''), monto: '', descripcion: '', fecha: '', archivo: null })
      if (typeof onCreated === 'function') onCreated(created)
    } catch (err) {
      const backendMsg = err?.response?.data?.errors ? err.response.data.errors.map(x => `${x.param}: ${x.msg}`).join('; ')
        : err?.response?.data?.error || err?.message
      console.error('MultaForm: error creando multa', err)
      setError(new Error(backendMsg || 'Error desconocido'))
    } finally { setSaving(false) }
  }

  return (
    <div className={`multa-form card p-3 ${compact ? 'compact' : ''}`}>
      <h5 className="mb-2">Nueva multa</h5>

      {loading && <div className="text-muted mb-2">Cargando opciones…</div>}
      {error && <div className="alert alert-danger">{error?.message || 'Error'}</div>}
      {success && <div className="alert alert-success">Multa creada correctamente</div>}

      <form onSubmit={createMulta} className="d-flex flex-column gap-2" style={{ maxWidth: 680 }}>
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small">Monto</label>
            <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} className="form-control" placeholder="Monto" />
          </div>

          <div className="col-md-6">
            <label className="form-label small">Fecha</label>
            <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="form-control" />
          </div>
        </div>

        <div>
          <label className="form-label small">Descripción / Motivo</label>
          <input name="descripcion" value={form.descripcion} onChange={handleChange} className="form-control" placeholder="Descripción breve" />
        </div>

        {isAdmin && (
          <div>
            <label className="form-label small">Usuario / Propietario</label>
            <select name="personaId" value={form.personaId || ''} onChange={handleChange} className="form-select">
              <option value="">{users.length ? '-- Seleccione usuario --' : 'No hay usuarios cargados'}</option>
              {users.map(u => {
                const id = u.id ?? u._id ?? u.persona_id
                const nombres = u.nombres ?? u.nombre ?? u.firstName
                const apellidos = u.apellidos ?? u.lastName
                const label = (nombres && apellidos) ? `${nombres} ${apellidos}` : (nombres || u.name || u.email || `#${id}`)
                return <option key={id} value={id}>{label}</option>
              })}
            </select>
          </div>
        )}

        {(!unidadIdFromUser || isAdmin) && (
          <div>
            <label className="form-label small">Unidad</label>
            <select name="unidad" value={unidadSeleccionada} onChange={e => setUnidadSeleccionada(e.target.value)} className="form-select">
              <option value="">{unidades.length ? '-- Seleccione unidad --' : 'No hay unidades cargadas'}</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.codigo ?? u.nombre ?? `Unidad #${u.id}`}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="form-label small">Comprobante (opcional)</label>
          <input name="archivo" type="file" accept="image/*,application/pdf" onChange={handleChange} className="form-control" />
        </div>

        <div className="d-flex gap-2 mt-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || (!unidadSeleccionada && !unidadIdFromUser)}
            title={!unidadSeleccionada && !unidadIdFromUser ? 'Seleccione una unidad antes de crear la multa' : undefined}
          >
            {saving ? 'Creando…' : 'Crear multa'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setForm({ personaId: isAdmin ? '' : (user?.id || ''), monto: '', descripcion: '', fecha: '', archivo: null })} disabled={saving}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}