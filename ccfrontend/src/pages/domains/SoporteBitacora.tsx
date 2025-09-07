import GenericCrud from '@/components/GenericCrud'

export default function SoporteBitacoraPage() {
  return (
    <GenericCrud
      title="SoporteBitacora"
  list={{ url: '/soporte/comunidad/1/bitacora' }}
  create={{ url: '/soporte/comunidad/1/bitacora' }}
  getOne={{ url: (id) => `/soporte/comunidad/1/bitacora` }}
  update={{ url: (id) => `/soporte/comunidad/1/bitacora` }}
  remove={{ url: (id) => `/soporte/comunidad/1/bitacora` }}
  exampleCreateBody={{ mensaje: "Ingreso técnico", fecha: "2025-01-05" }}
    />
  )
}
