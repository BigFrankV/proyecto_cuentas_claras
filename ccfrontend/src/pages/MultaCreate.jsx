import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/http/axios'

export default function MultaCreate({ unidadId: propUnidadId, comunidadId: propComunidadId, onCreated }) {
  const { user } = useAuth() || {}
  const unidadId = propUnidadId ?? user?.unidad_id ?? user?.unidad?.id
  const comunidadId = propComunidadId ?? user?.comunidadId ?? user?.membresias?.[0]?.comunidad_id

  const [residentes, setResidentes] = useState([])
  const [selectedPersona, setSelectedPersona] = useState('')
  const [loadingResidents, setLoadingResidents] = useState(false)
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // form state mínimo
  const [formValues, setFormValues] = useState({
    monto: '',
    descripcion: ''
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!comunidadId) return
      setLoadingResidents(true)
      const tryUrls = [
        `/personas?comunidad_id=${comunidadId}`,
        `/personas?comunidad=${comunidadId}`,
        '/personas'
      ]
      for (const url of tryUrls) {
        try {
          const res = await api.get(url)
          const items = Array.isArray(res.data) ? res.data : (res.data?.items || [])
          if (mounted && items.length) {
            setResidentsSafe(items)
            break
          }
        } catch (err) {
          // ignorar y probar siguiente ruta
          if (err?.response?.status === 401) {
            setMessage('No autorizado. Inicia sesión.')
            break
          }
        }
      }
      setLoadingResidents(false)
    })()

    function setResidentsSafe(items) {
      // normaliza shape mínimo: { id, nombre }
      const normalized = items.map(r => ({
        id: r.id ?? r.persona_id ?? r.personaId,
        nombre: (r.nombre ?? r.nombre_completo ?? `${r.apellido ?? ''} ${r.nombre ?? ''}`.trim()) || String(r.id)
      })).filter(Boolean)
      setResidentes(normalized)
    }

    return () => { mounted = false }
  }, [comunidadId])

  const onChange = e => setFormValues(s => ({ ...s, [e.target.name]: e.target.value }))

  const onSubmit = async () => {
    setMessage(null)
    const isAdmin = !!(user?.is_superadmin || (Array.isArray(user?.roles) && user.roles.includes('admin')))
    if (!unidadId && !isAdmin && !selectedPersona) {
      return setMessage('No se encontró unidad en el usuario. No es posible crear multa sin unidad.')
    }
    if (isAdmin && !unidadId && !selectedPersona) {
      return setMessage('Selecciona un residente para asociar la multa.')
    }

    // declarar targetUnidadId en el scope y tratar su ausencia
    let targetUnidadId = unidadId || null

    if (!targetUnidadId && selectedPersona) {
      try {
        const resPersona = await api.get(`/personas/${selectedPersona}`)
        const persona = resPersona?.data
        targetUnidadId = persona?.unidad_id || persona?.unidad?.id || persona?.unidadId || null
        if (!targetUnidadId && Array.isArray(persona?.membresias) && persona.membresias.length) {
          targetUnidadId = persona.membresias[0]?.unidad_id || persona.membresias[0]?.unidad?.id || null
        }
      } catch (err) {
        console.debug('No se pudo obtener persona para inferir unidad', err?.response?.status)
      }
    }

    if (!targetUnidadId) {
      return setMessage('El residente no tiene unidad asignada. No se puede crear multa sin una unidad.')
    }

    const payload = {
      persona_id: selectedPersona || null,
      motivo: formValues.descripcion || 'Multa',
      descripcion: formValues.descripcion || '',
      monto: Number(formValues.monto) || 0,
      fecha: formValues.fecha || new Date().toISOString().slice(0, 10)
    }

    console.debug('MultaCreate: targetUnidadId ->', targetUnidadId)
    console.debug('MultaCreate: payload ->', payload)
    setSubmitting(true)
    try {
      const res = await api.post(`/multas/unidad/${targetUnidadId}`, payload)
      const created = res?.data

      setFormValues({ monto: '', descripcion: '' })
      setSelectedPersona('')
      setMessage('Multa creada correctamente')
      if (typeof onCreated === 'function') onCreated(created)
    } catch (err) {
      setMessage(err?.response?.data?.error || err.message || 'Error al crear multa')
      console.error('MultaCreate: error', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card p-3">
      <h5>Crear multa</h5>
      {message && <div className="alert alert-info">{message}</div>}

      {(!unidadId && residentes.length > 0) && (
        <div className="mb-3">
          <label className="form-label">Residente</label>
          <select className="form-select" value={selectedPersona} onChange={e => setSelectedPersona(e.target.value)}>
            <option value="">-- seleccionar --</option>
            {residentes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Monto</label>
        <input name="monto" className="form-control" value={formValues.monto} onChange={onChange} />
      </div>

      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <input name="descripcion" className="form-control" value={formValues.descripcion} onChange={onChange} />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" disabled={submitting} onClick={onSubmit}>{submitting ? 'Creando…' : 'Crear multa'}</button>
      </div>
    </div>
  )
}


