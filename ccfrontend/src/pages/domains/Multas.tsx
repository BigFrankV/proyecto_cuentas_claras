import GenericCrud from '@/components/GenericCrud'

export default function MultasPage() {
  return (
    <GenericCrud
      title="Multas"
  list={{ url: '/multas/comunidad/1' }}
  create={{ url: '/multas/comunidad/1' }}
  getOne={{ url: (id) => `/multas/{id}` }}
  update={{ url: (id) => `/multas/{id}` }}
  remove={{ url: (id) => `/multas/{id}` }}
  exampleCreateBody={{ unidadId: 1, motivo: "ruidos", monto: 5000 }}
    />
  )
}
