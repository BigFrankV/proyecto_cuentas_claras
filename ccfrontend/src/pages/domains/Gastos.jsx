import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'
import GastoForm from './GastoForm'

export default function GastosPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false) // formulario oculto por defecto
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin') || user?.is_superadmin

  // determinar comunidad del usuario (fallback a 1 si no existe)
  const comunidadId =
    user?.comunidadId ||
    user?.comunidad?.id ||
    (Array.isArray(user?.comunidades) && user.comunidades[0]?.id) ||
    1

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

    // endpoints para personas (usuarios) — probar primero sin /mod
    const personEndpoints = [
      `/personas/comunidad/${comunidadId}`,
      `/mod/personas/comunidad/${comunidadId}`,
      `/personas`,
      `/mod/personas`
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

      // construir mapa id -> nombre para lookup rápido
      const personMap = {}
      personas.forEach(u => {
        const id = u.id ?? u._id ?? u.persona_id
        personMap[id] = u.nombre || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || `#${id}`
      })

      // adjuntar nombre_usuario en cada gasto usando prioridad:
      // gasto.usuario || gasto.persona (objeto), luego campos id (usuario_id / persona_id)
      const withUserName = gastos.map(g => {
        const usuarioObj = g.usuario ?? g.persona ?? g.user
        const id = g.usuario_id ?? g.persona_id ?? g.user_id ?? (usuarioObj && (usuarioObj.id ?? usuarioObj._id))
        const nombreFromObj = usuarioObj && (usuarioObj.nombre || usuarioObj.name || `${usuarioObj.firstName || ''} ${usuarioObj.lastName || ''}`.trim())
        return {
          ...g,
          usuario_nombre: nombreFromObj || (id ? personMap[id] : undefined) || (g.usuario_nombre || g.usuarioName)
        }
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
        {isAdmin && (
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
      {isAdmin && showForm && (
        <div className="mt-4">
          <GastoForm comunidadId={comunidadId} onCreated={handleCreated} />
        </div>
      )}
    </div>
  )
}
