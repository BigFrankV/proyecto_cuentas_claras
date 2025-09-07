import GenericCrud from '@/components/GenericCrud'

export default function CategoriasGastoPage() {
  return (
    <GenericCrud
      title="CategoriasGasto"
  list={{ url: '/categorias-gasto/comunidad/1' }}
  create={{ url: '/categorias-gasto/comunidad/1' }}
  getOne={{ url: (id) => `/categorias-gasto/{id}` }}
  update={{ url: (id) => `/categorias-gasto/{id}` }}
  remove={{ url: (id) => `/categorias-gasto/{id}` }}
  exampleCreateBody={{ nombre: "Gastos Comunes" }}
    />
  )
}
