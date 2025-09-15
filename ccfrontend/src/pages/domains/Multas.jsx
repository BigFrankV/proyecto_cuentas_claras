// ...existing code...
import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'
import MultaForm from './MultaForm'

export default function MultasPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin') || user?.is_superadmin

  // obtener unidadId desde el user (no tocar backend)
  const unidadId =
    user?.unidadId ||
    user?.unidad?.id ||
    user?.unidad_id ||
    (Array.isArray(user?.unidades) && user.unidades[0]?.id) ||
    undefined

  const chooseEndpoint = () => ({
    // solo la ruta soportada por backend para listado por unidad
    listByUnidad: unidadId ? `/multas/unidad/${unidadId}` : null
  })

  const load = async () => {
    setLoading(true)
    setError(null)

    if (!unidadId) {
      // Backend no ofrece listado global de multas: informar y salir
      setItems([])
      setError(new Error('No se encontró unidad en el usuario. No es posible listar multas sin unidad.'))
      setLoading(false)
      return
    }

    const ep = chooseEndpoint()
    const attempts = [ep.listByUnidad].filter(Boolean)

    const personEndpoints = ['/personas', `/personas/comunidad/${user?.comunidadId || 1}`, '/mod/personas']

    try {
      const multasPromise = (async () => {
        for (const p of attempts) {
          try {
            console.debug('Multas: GET', p)
            const res = await api.get(p)
            const data = res?.data
            const raw = Array.isArray(data) ? data : (data?.items || [])
            return raw.map(it => ({ ...it, descripcion: it.glosa ?? it.motivo ?? it.descripcion ?? '' }))
          } catch (e) {
            if (e?.response?.status === 404) continue
            throw e
          }
        }
        return []
      })()

      const personasPromise = (async () => {
        for (const p of personEndpoints) {
          try {
            const r = await api.get(p)
            const d = r?.data
            return Array.isArray(d) ? d : (d?.items || [])
          } catch (e) {
            if (e?.response?.status === 404) continue
            throw e
          }
        }
        return []
      })()

      const [multas, personas] = await Promise.all([multasPromise, personasPromise])

      const personMap = {}
      personas.forEach(u => {
        const id = u.id ?? u._id ?? u.persona_id
        const nombres = u.nombres ?? u.nombre ?? u.firstName
        const apellidos = u.apellidos ?? u.apellido ?? u.lastName
        const label = (nombres && apellidos) ? `${nombres} ${apellidos}` : (nombres || u.name || u.email || `#${id}`)
        if (id !== undefined) personMap[String(id)] = label
      })

      const extractUserId = (m) => {
        const obj = m.persona ?? m.usuario ?? m.user ?? m.owner
        if (obj) return obj.id ?? obj._id ?? obj.persona_id
        return m.persona_id ?? m.personaId ?? m.usuario_id ?? m.user_id ?? m.owner_id
      }
      const nameFromObj = (obj) => {
        if (!obj) return null
        const n = obj.nombres ?? obj.nombre ?? obj.name ?? obj.firstName
        const a = obj.apellidos ?? obj.apellido ?? obj.lastName
        if (n && a) return `${n} ${a}`
        return n || obj.email || null
      }

      const withUserName = multas.map(m => {
        const usuarioObj = m.persona ?? m.usuario ?? m.user ?? m.owner
        const id = extractUserId(m)
        const nameObj = nameFromObj(usuarioObj)
        const lookup = id !== undefined ? personMap[String(id)] : undefined
        const usuario_nombre = nameObj || lookup || m.persona_nombre || m.usuario_nombre || '—'
        return { ...m, usuario_nombre }
      })

      setItems(withUserName)
    } catch (e) {
      console.error('Multas: error al cargar', e)
      setError(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [unidadId])

  const handleCreated = async (created) => {
    await load()
    setShowForm(false)
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Multas</h3>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cerrar' : 'Crear multa'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-muted">Cargando…</div>
      ) : (
        <table className="table table-sm">
          <thead>
            <tr><th>ID</th><th>Descripción</th><th>Monto</th><th>Fecha</th><th>Usuario</th></tr>
          </thead>
          <tbody>
            {items.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.descripcion || '—'}</td>
                <td>{m.monto ?? '—'}</td>
                <td>{m.fecha || m.createdAt || '—'}</td>
                <td>{m.usuario_nombre ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      )}

      {isAdmin && showForm && unidadId && (
        <div className="mt-4">
          <MultaForm unidadId={unidadId} onCreated={handleCreated} />
        </div>
      )}

      {isAdmin && showForm && !unidadId && (
        <div className="alert alert-warning">No se encontró unidad en el usuario. No es posible crear multa sin unidad.</div>
      )}
    </div>
  )
}
// ...existing code...