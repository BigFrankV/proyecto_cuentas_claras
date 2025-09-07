import { useState } from 'react'
import { api } from '@/http/axios'

export default function ApiExplorer() {
  const [method, setMethod] = useState<'GET'|'POST'|'PATCH'|'DELETE'>('GET')
  const [url, setUrl] = useState<string>('/util/health')
  const [body, setBody] = useState<string>('{}')
  const [resp, setResp] = useState<string>('')

  const run = async () => {
    try {
      let data
      if (method === 'GET' || method === 'DELETE') {
        const r = await api.request({ method, url })
        data = r.data
      } else {
        const payload = JSON.parse(body || '{}')
        const r = await api.request({ method, url, data: payload })
        data = r.data
      }
      setResp(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setResp(e?.response?.data?.message || e?.message || 'Error')
    }
  }

  return (
    <div className="row g-3">
      <div className="col-12">
        <h1 className="page-title"><span className="material-icons text-primary">api</span> API Explorer</h1>
      </div>
      <div className="col-12">
        <div className="card p-3">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">Método</label>
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value as any)}>
                <option>GET</option>
                <option>POST</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
            </div>
            <div className="col-12 col-md-9">
              <label className="form-label">URL</label>
              <input className="form-control" value={url} onChange={e => setUrl(e.target.value)} placeholder="/ruta" />
            </div>
            {(method === 'POST' || method === 'PATCH') && (
              <div className="col-12">
                <label className="form-label">Body JSON</label>
                <textarea className="form-control" rows={8} value={body} onChange={e => setBody(e.target.value)} />
              </div>
            )}
            <div className="col-12">
              <button className="btn btn-primary" onClick={run}>
                <span className="material-icons align-middle me-1">play_arrow</span>
                Ejecutar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="card p-3">
          <h6 className="mb-2">Respuesta</h6>
          <pre className="bg-light p-3 rounded mb-0" style={{whiteSpace:'pre-wrap'}}>{resp}</pre>
        </div>
      </div>
    </div>
  )
}
