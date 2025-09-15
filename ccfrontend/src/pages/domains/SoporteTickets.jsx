import GenericCrud from '@/components/GenericCrud'

export default function SoporteTicketsPage() {
  return (
    <GenericCrud
      title="SoporteTickets"
  list={{ url: '/soporte/tickets/comunidad/1' }}
  create={{ url: '/soporte/tickets/comunidad/1' }}
  getOne={{ url: (id) => `/soporte/tickets/{id}` }}
  update={{ url: (id) => `/soporte/tickets/{id}` }}
  remove={{ url: (id) => `/soporte/tickets/{id}` }}
  exampleCreateBody={{ titulo: "Problema", descripcion: "Detalle" }}
    />
  )
}
