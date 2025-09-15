import GenericCrud from '@/components/GenericCrud'

export default function LecturasPage() {
  return (
    <GenericCrud
      title="Lecturas"
  list={{ url: '/lecturas/comunidad/1' }}
  create={{ url: '/lecturas/comunidad/1' }}
  getOne={{ url: (id) => `/lecturas/{id}` }}
  update={{ url: (id) => `/lecturas/{id}` }}
  remove={{ url: (id) => `/lecturas/{id}` }}
  exampleCreateBody={{ medidorId: 1, fecha: "2025-01-01", valor: 10 }}
    />
  )
}
