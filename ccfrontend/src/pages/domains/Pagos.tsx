import { useState } from 'react'
import { api } from '@/http/axios'
import GenericCrud from '@/components/GenericCrud'

export default function PagosPage() {
  const [pagoId, setPagoId] = useState<string>('')
  const [body, setBody] = useState<string>('{"monto": 10000, "fecha": "2025-01-01"}')
  const [resp, setResp] = useState<string>('')

  async function aplicar() {
    if (!pagoId) return alert('Ingresa un ID de pago')
    try {
      const payload = JSON.parse(body || '{}')
      const r = await api.post(`/pagos/${pagoId}/aplicar`, payload)
      setResp(JSON.stringify(r.data, null, 2))
      alert('Pago aplicado.')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al aplicar pago')
    }
  }

  async function reversar() {
    if (!pagoId) return alert('Ingresa un ID de pago')
    if (!confirm('¿Reversar este pago?')) return
    try {
      const r = await api.post(`/pagos/${pagoId}/reversar`)
      setResp(JSON.stringify(r.data, null, 2))
      alert('Pago reversado.')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al reversar')
    }
  }

  return (
    <div className="vstack gap-3">
      <GenericCrud
        title="Pagos"
        list={{ url: '/pagos/comunidad/1' }}
        create={{ url: '/pagos/comunidad/1' }}
        getOne={{ url: (id) => `/pagos/${id}` }}
        update={{ url: (id) => `/pagos/${id}` }}
        remove={{ url: (id) => `/pagos/${id}` }}
        exampleCreateBody={{"monto":10000,"fecha":"2025-01-01"}}
      />

      <div className="card p-3">
        <h5 className="mb-3">Acciones</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">ID de pago</label>
            <input className="form-control" value={pagoId} onChange={(e) => setPagoId(e.target.value)} placeholder="ej: 321" />
            <label className="form-label mt-3">Body (aplicar)</label>
            <textarea className="form-control" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="d-flex gap-2 mt-2 flex-wrap">
              <button className="btn btn-primary btn-sm" onClick={aplicar}>
                <span className="material-icons align-middle me-1">done_all</span> Aplicar
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={reversar}>
                <span className="material-icons align-middle me-1">undo</span> Reversar
              </button>
            </div>
          </div>
          <div className="col-12 col-md-8">
            <label className="form-label">Respuesta</label>
            <pre className="bg-light p-3 rounded" style={{minHeight: 160}}>{resp || 'Ejecuta una acción para ver aquí la respuesta.'}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
