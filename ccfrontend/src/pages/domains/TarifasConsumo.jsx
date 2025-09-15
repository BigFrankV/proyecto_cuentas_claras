import GenericCrud from '@/components/GenericCrud'

export default function TarifasConsumoPage() {
  return (
    <GenericCrud
      title="TarifasConsumo"
  list={{ url: '/tarifas-consumo/comunidad/1' }}
  create={{ url: '/tarifas-consumo/comunidad/1' }}
  getOne={{ url: (id) => `/tarifas-consumo/{id}` }}
  update={{ url: (id) => `/tarifas-consumo/{id}` }}
  remove={{ url: (id) => `/tarifas-consumo/{id}` }}
  exampleCreateBody={{ tipo: "agua", valor: 123.45 }}
    />
  )
}
