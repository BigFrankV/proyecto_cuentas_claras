import { useState } from 'react'
import { api } from '@/http/axios'
import GenericCrud from '@/components/GenericCrud'

export default function CargosPage() {
  const [cargoId, setCargoId] = useState<string>('')
  const [resp, setResp] = useState<string>('')

  async function recalcularInteres() {
    if (!cargoId) return alert('Ingresa un ID de cargo')
    try {
      const r = await api.post(`/cargos/${cargoId}/recalcular-interes`)
      setResp(JSON.stringify(r.data, null, 2))
      alert('Interés recalculado.')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al recalcular interés')
    }
  }

  async function notificar() {
    if (!cargoId) return alert('Ingresa un ID de cargo')
    try {
      const r = await api.post(`/cargos/${cargoId}/notificar`)
      setResp(JSON.stringify(r.data, null, 2))
      alert('Notificación enviada.')
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error al notificar')
    }
  }

  return (
    <div className="vstack gap-3">
      <GenericCrud
        title="Cargos"
        list={{ url: '/cargos/comunidad/1' }}
        getOne={{ url: (id) => `/cargos/${id}` }}
        update={{ url: (id) => `/cargos/${id}` }}
        remove={{ url: (id) => `/cargos/${id}` }}
        exampleCreateBody={{"estado":"pendiente"}}
      />

      <div className="card p-3">
        <h5 className="mb-3">Acciones</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">ID de cargo</label>
            <input className="form-control" value={cargoId} onChange={(e) => setCargoId(e.target.value)} placeholder="ej: 987" />
            <div className="d-flex gap-2 mt-2 flex-wrap">
              <button className="btn btn-outline-warning btn-sm" onClick={recalcularInteres}>
                <span className="material-icons align-middle me-1">calculate</span> Recalcular interés
              </button>
              <button className="btn btn-primary btn-sm" onClick={notificar}>
                <span className="material-icons align-middle me-1">notifications_active</span> Notificar
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
