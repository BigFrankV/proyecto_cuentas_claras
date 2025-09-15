import GenericCrud from '@/components/GenericCrud'

export default function CentrosCostoPage() {
  return (
    <GenericCrud
      title="CentrosCosto"
  list={{ url: '/centros-costo/comunidad/1' }}
  create={{ url: '/centros-costo/comunidad/1' }}
  getOne={{ url: (id) => `/centros-costo/{id}` }}
  update={{ url: (id) => `/centros-costo/{id}` }}
  remove={{ url: (id) => `/centros-costo/{id}` }}
  exampleCreateBody={{ nombre: "Fondo Operativo" }}
    />
  )
}
