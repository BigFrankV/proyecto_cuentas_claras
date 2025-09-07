import GenericCrud from '@/components/GenericCrud'

export default function ProveedoresPage() {
  return (
    <GenericCrud
      title="Proveedores"
  list={{ url: '/proveedores/comunidad/1' }}
  create={{ url: '/proveedores/comunidad/1' }}
  getOne={{ url: (id) => `/proveedores/{id}` }}
  update={{ url: (id) => `/proveedores/{id}` }}
  remove={{ url: (id) => `/proveedores/{id}` }}
  exampleCreateBody={{ nombre: "Proveedor S.A.", rut: "11111111-1" }}
    />
  )
}
