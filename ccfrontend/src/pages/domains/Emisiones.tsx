import { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import GenericCrud from '@/components/GenericCrud'

export default function EmisionesPage() {
  const [accionId, setAccionId] = useState<string>('')
  const [preview, setPreview] = useState<string>('')

  async function previsualizar() {
    if (!accionId) return alert('Ingresa un ID de emisión')
    try {
      const r = await api.get(`/emisiones/${accionId}/previsualizar-prorrateo`)
      setPreview(JSON.stringify(r.data, null, 2))
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al previsualizar')
    }
  }

  async function generarCargos() {
    if (!accionId) return alert('Ingresa un ID de emisión')
    if (!confirm('Esto generará cargos a partir de la emisión. ¿Continuar?')) return
    try {
      const r = await api.post(`/emisiones/${accionId}/generar-cargos`)
      alert('Cargos generados.')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al generar cargos')
    }
  }

  return (
    <div className="vstack gap-3">
      <GenericCrud
        title="Emisiones"
        list={{ url: '/emisiones/comunidad/1' }}
        create={{ url: '/emisiones/comunidad/1' }}
        getOne={{ url: (id) => `/emisiones/${id}` }}
        update={{ url: (id) => `/emisiones/${id}` }}
        remove={{ url: (id) => `/emisiones/${id}` }}
        exampleCreateBody={{"periodo":"2025-08","descripcion":"Agosto 2025"}}
      />

      <div className="card p-3">
        <h5 className="mb-3">Acciones</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">ID de emisión</label>
            <input className="form-control" value={accionId} onChange={(e) => setAccionId(e.target.value)} placeholder="ej: 123" />
            <div className="d-flex gap-2 mt-2 flex-wrap">
              <button className="btn btn-outline-primary btn-sm" onClick={previsualizar}>
                <span className="material-icons align-middle me-1">visibility</span> Previsualizar prorrateo
              </button>
              <button className="btn btn-primary btn-sm" onClick={generarCargos}>
                <span className="material-icons align-middle me-1">add_shopping_cart</span> Generar cargos
              </button>
            </div>
          </div>
          <div className="col-12 col-md-8">
            <label className="form-label">Resultado</label>
            <pre className="bg-light p-3 rounded" style={{minHeight: 160}}>{preview || 'Ejecuta una acción para ver aquí la respuesta.'}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
