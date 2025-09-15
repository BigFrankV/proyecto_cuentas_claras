import GenericCrud from '@/components/GenericCrud'

export default function DocumentosCompraPage() {
  return (
    <GenericCrud
      title="DocumentosCompra"
  list={{ url: '/documentos-compra/comunidad/1' }}
  create={{ url: '/documentos-compra/comunidad/1' }}
  getOne={{ url: (id) => `/documentos-compra/{id}` }}
  update={{ url: (id) => `/documentos-compra/{id}` }}
  remove={{ url: (id) => `/documentos-compra/{id}` }}
  exampleCreateBody={{ tipo: "factura", numero: "123", monto: 10000 }}
    />
  )
}
