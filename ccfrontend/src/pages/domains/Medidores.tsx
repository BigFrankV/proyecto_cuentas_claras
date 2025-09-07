import GenericCrud from '@/components/GenericCrud'

export default function MedidoresPage() {
  return (
    <GenericCrud
      title="Medidores"
  list={{ url: '/medidores/comunidad/1' }}
  create={{ url: '/medidores/comunidad/1' }}
  getOne={{ url: (id) => `/medidores/{id}` }}
  update={{ url: (id) => `/medidores/{id}` }}
  remove={{ url: (id) => `/medidores/{id}` }}
  exampleCreateBody={{ tipo: "agua", codigo: "M-01" }}
    />
  )
}
