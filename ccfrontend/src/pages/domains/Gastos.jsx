import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'
import GenericCrud from '@/components/GenericCrud'

export default function GastosPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin') || user?.is_superadmin

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/gastos')
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []))
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Gastos</h3>
        {isAdmin && <button className="btn btn-primary" onClick={() => alert('Crear gasto (implementar)')}>Crear gasto</button>}
      </div>

      {loading ? <div className="text-muted">Cargando…</div> : (
        <table className="table table-sm">
          <thead><tr><th>ID</th><th>Descripción</th><th>Monto</th></tr></thead>
          <tbody>
            {items.map(g => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.descripcion || g.title || '—'}</td>
                <td>{g.monto ?? '—'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="text-center text-muted">Sin resultados</td></tr>}
          </tbody>
        </table>
      )}

      <GenericCrud
        title="Gastos"
        list={{ url: '/gastos/comunidad/1' }}
        create={{ url: '/gastos/comunidad/1' }}
        getOne={{ url: (id) => `/gastos/{id}` }}
        update={{ url: (id) => `/gastos/{id}` }}
        remove={{ url: (id) => `/gastos/{id}` }}
        exampleCreateBody={{ categoriaId: 1, monto: 10000, fecha: "2025-01-01" }}
      />
    </div>
  )
}
