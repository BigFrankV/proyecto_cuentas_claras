import React, { useEffect, useState } from 'react'
import { api } from '@/http/axios'
import { useAuth } from '@/auth/AuthContext'

/**
 * GastoForm
 * Props:
 *  - comunidadId? (si no se pasa se toma del user)
 *  - onCreated(gasto) callback
 *  - compact? boolean (si true renderiza versión reducida)
 *
 * Comportamiento:
 *  - Si el user es admin muestra selector de usuario (beneficiario).
 *  - Carga categorías y usuarios de la comunidad con fallback a rutas alternativas.
 *  - Permite adjuntar un archivo (comprobante) — si se adjunta usa multipart/form-data.
 *  - Intenta crear el gasto en /mod/gastos o /gastos.
 */
export default function GastoForm ({ comunidadId: propComunidadId, onCreated, compact = false }) {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('admin') || user?.is_superadmin

  const comunidadId =
    propComunidadId ||
    user?.comunidadId ||
    user?.comunidad?.id ||
    (Array.isArray(user?.comunidades) && user.comunidades[0]?.id) ||
    1

  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    categoriaId: '',
    usuarioId: '', // beneficiario / perteneciente a la comunidad
    monto: '',
    descripcion: '',
    fecha: '',
    archivo: null
  })

  const chooseListEndpoints = (resource) => {
    // prefiero /mod/* porque el backend usa ese prefijo para módulos
    return [
      `/mod/${resource}/comunidad/${comunidadId}`,
      `/${resource}/comunidad/${comunidadId}`,
      `/mod/${resource}`,
      `/${resource}`
    ]
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    const tryFetch = async (paths) => {
      for (const p of paths) {
        try {
          const r = await api.get(p)
          if (r && r.status >= 200 && r.status < 300) return r.data
        } catch (e) {
          if (e?.response?.status === 404) continue
          throw e
        }
      }
      throw new Error('No se encontró endpoint válido')
    }

    ;(async () => {
      try {
        const [cats, usrs] = await Promise.all([
          tryFetch(chooseListEndpoints('categorias-gasto')),
          tryFetch(chooseListEndpoints('personas'))
        ])
        if (!mounted) return
        // Normalizar respuestas: aceptar arrays o { items: [...] } o { data: [...] }
        const norm = (d) => Array.isArray(d) ? d : (d?.items || d?.data || [])
        setCategories(norm(cats))
        setUsers(norm(usrs))
        // si no es admin set usuarioId al propio user
        if (!isAdmin) setForm(f => ({ ...f, usuarioId: user?.id || '' }))
      } catch (err) {
        if (!mounted) return
        console.error('GastoForm: error cargando opciones', err)
        setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [comunidadId])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'archivo') {
      setForm(f => ({ ...f, archivo: files?.[0] || null }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const validate = () => {
    if (!form.categoriaId) return 'Seleccione una categoría'
    if (!form.monto || Number.isNaN(Number(form.monto)) || Number(form.monto) <= 0) return 'Monto inválido'
    if (!form.fecha) return 'Seleccione una fecha'
    if (isAdmin && !form.usuarioId) return 'Seleccione un usuario'
    return null
  }

  // endpoints de creación a intentar (añadimos variantes con /comunidad/:id)
  const createPaths = [
    `/gastos/comunidad/${comunidadId}`,
    `/mod/gastos/comunidad/${comunidadId}`,
    `/mod/gastos`,
    `/gastos`
  ]

  const createGasto = async (e) => {
    e?.preventDefault?.()
    setError(null)
    setSuccess(null)
    const v = validate()
    if (v) { setError(new Error(v)); return }
    setSaving(true)

    // payload con los nombres que el backend valida
    const payloadObj = {
      categoria_id: Number(form.categoriaId),
      monto: Number(form.monto),
      fecha: form.fecha,
      glosa: form.descripcion || undefined,
      centro_costo_id: form.centroCostoId || undefined,
      documento_compra_id: form.documentoCompraId || undefined,
      extraordinario: form.extraordinario ? 1 : 0
    }

    try {
      let res = null
      if (form.archivo) {
        const fd = new FormData()
        Object.keys(payloadObj).forEach(k => {
          if (payloadObj[k] !== undefined && payloadObj[k] !== null) fd.append(k, String(payloadObj[k]))
        })
        fd.append('comprobante', form.archivo)
        for (const p of createPaths) {
          try {
            console.debug('GastoForm: intentando POST (formdata)', p)
            // dejar que el navegador establezca Content-Type con boundary
            res = await api.post(p, fd)
            if (res && res.status >= 200 && res.status < 300) break
          } catch (err) {
            if (err?.response?.status === 404) continue
            throw err
          }
        }
      } else {
        for (const p of createPaths) {
          try {
            console.debug('GastoForm: intentando POST (json)', p, payloadObj)
            res = await api.post(p, payloadObj)
            if (res && res.status >= 200 && res.status < 300) break
          } catch (err) {
            if (err?.response?.status === 404) continue
            throw err
          }
        }
      }

      if (!res) {
        const attempted = createPaths.join(', ')
        throw new Error(`No se pudo crear gasto: endpoint no encontrado. Rutas intentadas: ${attempted}`)
      }

      const created = res.data
      setSuccess(created || { ok: true })
      setForm({ categoriaId: '', usuarioId: isAdmin ? '' : (user?.id || ''), monto: '', descripcion: '', fecha: '', archivo: null })
      if (typeof onCreated === 'function') onCreated(created)
    } catch (err) {
      // mostrar errores de validación del backend si vienen en body
      const backendMsg = err?.response?.data?.errors
        ? err.response.data.errors.map(x => `${x.param}: ${x.msg}`).join('; ')
        : err?.response?.data?.error || err?.message
      console.error('GastoForm: error creando gasto', err)
      setError(new Error(backendMsg || 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="gasto-form card p-3">
      <h5 className="mb-2">Nuevo gasto</h5>

      {loading && <div className="text-muted mb-2">Cargando opciones…</div>}
      {error && <div className="alert alert-danger">{error?.message || 'Error'}</div>}
      {success && <div className="alert alert-success">Gasto creado correctamente</div>}

      <form onSubmit={createGasto} className="d-flex flex-column gap-2" style={{ maxWidth: 680 }}>
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small">Categoría</label>
            <select name="categoriaId" value={form.categoriaId} onChange={handleChange} className="form-select">
              <option value="">-- Seleccione categoría --</option>
              {categories.map(c => (
                <option key={c.id || c._id} value={c.id ?? c._id}>{c.nombre || c.descripcion || c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small">Monto</label>
            <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} className="form-control" placeholder="Monto en moneda local" />
          </div>
        </div>

        <div className="row g-2">
          <div className="col-md-8">
            <label className="form-label small">Descripción / servicio</label>
            <input name="descripcion" value={form.descripcion} onChange={handleChange} className="form-control" placeholder="Descripción breve del gasto" />
          </div>

          <div className="col-md-4">
            <label className="form-label small">Fecha</label>
            <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="form-control" />
          </div>
        </div>

        {isAdmin && (
          <div>
            <label className="form-label small">Usuario / Propietario</label>
            <select name="usuarioId" value={form.usuarioId || ''} onChange={handleChange} className="form-select">
              <option value="">{users.length ? '-- Seleccione usuario --' : 'No hay usuarios cargados'}</option>
              {users.map(u => (
                <option key={u.id || u._id} value={u.id ?? u._id}>
                  {u.nombre || `${u.firstName || u.nombre} ${u.lastName || ''}` || u.email || `#${u.id ?? u._id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="form-label small">Comprobante (opcional)</label>
          <input name="archivo" type="file" accept="image/*,application/pdf" onChange={handleChange} className="form-control" />
        </div>

        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creando…' : 'Crear gasto'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setForm({ categoriaId: '', usuarioId: isAdmin ? '' : (user?.id || ''), monto: '', descripcion: '', fecha: '', archivo: null })} disabled={saving}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}