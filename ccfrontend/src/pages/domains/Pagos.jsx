// ...existing code...ect, useState } from 'react'
import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'

export default function PagosPage() {
  const [pagos, setPagos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const tryEndpoints = async (paths) => {
      for (const p of paths) {
        try {
          const r = await api.get(p)
          if (r && r.status >= 200 && r.status < 300) return { ok: true, data: r.data, path: p }
        } catch (e) {
          if (e?.response?.status === 404) continue
          return { ok: false, err: e, tried: p }
        }
      }
      return { ok: false, err: new Error('Ningún endpoint devolvió datos'), tried: paths }
    }

    ;(async () => {
      try {
        const endpoints = ['/mod/pagos', '/pagos', '/mod/pagos/comunidad/1', '/pagos/comunidad/1']
        const res = await tryEndpoints(endpoints)
        if (!mounted) return
        if (res.ok) setPagos(res.data)
        else setError(res.err)
      } catch (err) {
        if (mounted) setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])

  if (loading) return <div>Cargando pagos…</div>
  if (error) return <div className="text-danger">Error al cargar pagos: {error?.message || 'desconocido'}</div>

  return (
    <div>
      <h3>Pagos</h3>
      {Array.isArray(pagos) ? (
        <ul>
          {pagos.map(p => <li key={p.id || JSON.stringify(p)}>{p.descripcion || p.nombre || JSON.stringify(p)}</li>)}
        </ul>
      ) : (
        <pre>{JSON.stringify(pagos, null, 2)}</pre>
      )}
    </div>
  )
}