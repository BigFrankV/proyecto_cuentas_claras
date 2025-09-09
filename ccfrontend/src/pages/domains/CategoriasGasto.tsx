import React, { useState } from 'react'
import GenericCrud from '@/components/GenericCrud'

export default function CategoriasGastoPage() {
  const [search, setSearch] = useState('')
  return (
    <div className="kk-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Categorías de Gasto</h2>
          <small className="text-muted">Gestiona las categorías que usas para clasificar gastos</small>
        </div>

        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <input className="form-control kk-search" placeholder="Buscar categoría..." style={{ width: 240 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="kk-card p-3">
        <GenericCrud
          title="Categorías de Gasto"
          list={{ url: '/categorias-gasto/comunidad/1' }}
          create={{ url: '/categorias-gasto/comunidad/1' }}
          getOne={{ url: (id: any) => `/categorias-gasto/${id}` }}
          update={{ url: (id: any) => `/categorias-gasto/${id}` }}
          remove={{ url: (id: any) => `/categorias-gasto/${id}` }}
          exampleCreateBody={{ nombre: 'Gastos Comunes' }}
          search={search}
        />
      </div>
    </div>
  )
}
