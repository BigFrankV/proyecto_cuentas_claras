import GenericCrud from '@/components/GenericCrud'

export default function GastosPage() {
  return (
    <GenericCrud
      title="Gastos"
  list={{ url: '/gastos/comunidad/1' }}
  create={{ url: '/gastos/comunidad/1' }}
  getOne={{ url: (id) => `/gastos/{id}` }}
  update={{ url: (id) => `/gastos/{id}` }}
  remove={{ url: (id) => `/gastos/{id}` }}
  exampleCreateBody={{ categoriaId: 1, monto: 10000, fecha: "2025-01-01" }}
    />
  )
}
