import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'
import GastoForm from './GastoForm'

export default function GastosPage({ comunidadId: propComunidadId }) {
  const { user } = useAuth() || {}
  const comunidadId = propComunidadId || user?.comunidadId || user?.membresias?.[0]?.comunidad_id

  const isAdminInCommunity = Boolean(
    user?.is_superadmin ||
    (Array.isArray(user?.membresias) && user.membresias.some(m => String(m.comunidad_id) === String(comunidadId) && (m.rol === 'admin' || m.rol === 'propietario')))
  )

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false) // formulario oculto por defecto

  const chooseEndpoint = (method = 'get') => {
    // Probar primero las rutas sin /mod (el backend usa /gastos/comunidad/:id)
    return {
      listByComunidad: `/gastos/comunidad/${comunidadId}`,
      listByComunidadAlt: `/mod/gastos/comunidad/${comunidadId}`,
      listAll: `/gastos`,
      listAllMod: `/mod/gastos`
    }
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    const ep = chooseEndpoint()
    const attempts = [
      ep.listByComunidad,
      ep.listByComunidadAlt,
      ep.listAll,
      ep.listAllMod
    ]

    // pedir personas: probar primero /personas (tu backend expone /personas)
    const personEndpoints = [
      `/personas`, // <-- primera opción válida en tu backend
      `/personas/comunidad/${comunidadId}`,
      `/mod/personas`,
      `/mod/personas/comunidad/${comunidadId}`
    ]

    try {
      // pedir gastos y personas en paralelo (si falla personas no bloquea mostrar gastos)
      const gastosPromise = (async () => {
        for (const p of attempts) {
          try {
            const res = await api.get(p)
            const data = res?.data
            const raw = Array.isArray(data) ? data : (data?.items || [])
            const normalized = raw.map(item => ({
              ...item,
              descripcion: item.glosa ?? item.descripcion ?? item.title ?? item.nombre ?? ''
            }))
            return normalized
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

      const [gastos, personas] = await Promise.all([gastosPromise, personasPromise])

      // construir mapa id -> nombre para lookup rápido, normalizando campos reales del backend
      const personMap = {}
      personas.forEach(u => {
        const id = u.id ?? u._id ?? u.persona_id ?? u.personaId
        const nombres = u.nombres ?? u.nombres ?? u.nombre ?? u.firstName
        const apellidos = u.apellidos ?? u.apellido ?? u.lastName
        const display =
          (nombres && apellidos) ? `${nombres} ${apellidos}` :
          (nombres || u.nombre || u.name || u.email) ||
          `#${id}`
        if (id !== undefined) personMap[String(id)] = display
      })

      // helper para extraer id / nombre desde el gasto (varias variantes)
      const extractUserId = (g) => {
        const usuarioObj = g.usuario ?? g.persona ?? g.user ?? g.beneficiario ?? g.owner
        if (usuarioObj) return usuarioObj.id ?? usuarioObj._id ?? usuarioObj.persona_id ?? usuarioObj.personaId
        return g.usuario_id ?? g.persona_id ?? g.user_id ?? g.owner_id ?? g.personaId ?? g.usuarioId ?? g.userId
      }
      const nameFromObj = (obj) => {
        if (!obj) return null
        const n = obj.nombres ?? obj.nombre ?? obj.name ?? obj.firstName
        const a = obj.apellidos ?? obj.apellido ?? obj.lastName
        if (n && a) return `${n} ${a}`
        return n || obj.email || obj.username || null
      }

      const withUserName = gastos.map(g => {
        const usuarioObj = g.usuario ?? g.persona ?? g.user ?? g.beneficiario ?? g.owner
        const id = extractUserId(g)
        const nombreFromObj = nameFromObj(usuarioObj)
        const lookup = id !== undefined ? personMap[String(id)] : undefined
        const usuarioNombre = nombreFromObj || lookup || (g.usuario_nombre || g.usuarioName) || '—'
        // console.debug('Gasto', g.id, 'resolved user id', id, 'name', usuarioNombre)
        return { ...g, usuario_nombre: usuarioNombre }
      })

      setItems(withUserName)
    } catch (e) {
      console.error('Gastos: error al cargar', e)
      setError(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // callback cuando GastoForm crea un gasto: recargar lista y cerrar formulario
  const handleCreated = async (created) => {
    await load()
    setShowForm(false)
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Gastos</h3>
        {isAdminInCommunity && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(s => !s)}
          >
            {showForm ? 'Cerrar' : 'Crear gasto'}
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
            {items.map(g => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.descripcion || '—'}</td>
                <td>{g.monto ?? '—'}</td>
                <td>{g.fecha || g.createdAt || '—'}</td>
                <td>{g.usuario_nombre ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Mostrar formulario externo (GastoForm) cuando corresponde */}
      {isAdminInCommunity && showForm && (
        <div className="mt-4">
          <GastoForm comunidadId={comunidadId} isAdmin={true} onCreated={handleCreated} />
        </div>
      )}
    </div>
  )
}
