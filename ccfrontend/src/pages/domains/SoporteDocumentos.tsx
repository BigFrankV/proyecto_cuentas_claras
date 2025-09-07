import GenericCrud from '@/components/GenericCrud'

export default function SoporteDocumentosPage() {
  return (
    <GenericCrud
      title="SoporteDocumentos"
  list={{ url: '/soporte/documentos/comunidad/1' }}
  create={{ url: '/soporte/documentos/comunidad/1' }}
  getOne={{ url: (id) => `/soporte/documentos/{id}` }}
  update={{ url: (id) => `/soporte/documentos/{id}` }}
  remove={{ url: (id) => `/soporte/documentos/{id}` }}
  exampleCreateBody={{ nombre: "Acta", url: "https://..." }}
    />
  )
}
