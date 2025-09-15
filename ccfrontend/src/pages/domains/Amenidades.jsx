import GenericCrud from '@/components/GenericCrud'

export default function AmenidadesPage() {
  return (
    <GenericCrud
      title="Amenidades"
  list={{ url: '/amenidades/comunidad/1' }}
  create={{ url: '/amenidades/comunidad/1' }}
  getOne={{ url: (id) => `/amenidades/{id}` }}
  update={{ url: (id) => `/amenidades/{id}` }}
  remove={{ url: (id) => `/amenidades/{id}` }}
  exampleCreateBody={{ nombre: "Quincho" }}
    />
  )
}
