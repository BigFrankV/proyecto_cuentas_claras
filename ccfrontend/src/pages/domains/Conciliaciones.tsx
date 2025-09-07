import GenericCrud from '@/components/GenericCrud'

export default function ConciliacionesPage() {
  return (
    <GenericCrud
      title="Conciliaciones"
  list={{ url: '/conciliaciones/comunidad/1' }}
  create={{ url: '/conciliaciones/comunidad/1' }}
  getOne={{ url: (id) => `/conciliaciones/{id}` }}
  update={{ url: (id) => `/conciliaciones/{id}` }}
  remove={{ url: (id) => `/conciliaciones/{id}` }}
  exampleCreateBody={{ banco: "Bci", fecha: "2025-01-01" }}
    />
  )
}
