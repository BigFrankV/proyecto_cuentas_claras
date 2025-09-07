import GenericCrud from '@/components/GenericCrud'

export default function SoporteNotificacionesPage() {
  return (
    <GenericCrud
      title="SoporteNotificaciones"
  list={{ url: '/soporte/notificaciones/comunidad/1' }}
  create={{ url: '/soporte/notificaciones/comunidad/1' }}
  getOne={{ url: (id) => `/soporte/notificaciones/{id}` }}
  update={{ url: (id) => `/soporte/notificaciones/{id}` }}
  remove={{ url: (id) => `/soporte/notificaciones/{id}` }}
  exampleCreateBody={{ titulo: "Corte", mensaje: "Hoy 15:00-18:00" }}
    />
  )
}
