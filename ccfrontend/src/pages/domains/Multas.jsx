import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'
import GenericCrud from '@/components/GenericCrud'

export default function MultasPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin') || user?.is_superadmin

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/multas')
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const createMulta = async () => {
    const descripcion = prompt('Descripción de la multa:')
    const monto = parseFloat(prompt('Monto:') || '0') || 0
    if (!descripcion) return
    try {
      await api.post('/multas', { descripcion, monto })
      await load()
      alert('Multa creada')
    } catch (e) { alert(e?.response?.data?.message || 'Error creando multa') }
  }

  return (
    <GenericCrud
      title="Multas"
  list={{ url: '/multas/comunidad/1' }}
  create={{ url: '/multas/comunidad/1' }}
  getOne={{ url: (id) => `/multas/{id}` }}
  update={{ url: (id) => `/multas/{id}` }}
  remove={{ url: (id) => `/multas/{id}` }}
  exampleCreateBody={{ unidadId: 1, motivo: "ruidos", monto: 5000 }}
    />
  )
}
