import GenericCrud from '@/components/GenericCrud'

export default function ReservasPage() {
  return (
    <GenericCrud
      title="Reservas"
  list={{ url: '/reservas/comunidad/1' }}
  create={{ url: '/reservas/comunidad/1' }}
  getOne={{ url: (id) => `/reservas/{id}` }}
  update={{ url: (id) => `/reservas/{id}` }}
  remove={{ url: (id) => `/reservas/{id}` }}
  exampleCreateBody={{ amenidadId: 1, fecha: "2025-01-10", hora: "10:00" }}
    />
  )
}
