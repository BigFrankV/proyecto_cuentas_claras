import GenericCrud from '@/components/GenericCrud'

export default function ParametrosCobranzaPage() {
  return (
    <GenericCrud
      title="ParametrosCobranza"
  list={{ url: '/soporte/comunidad/1/parametros-cobranza' }}
  create={{ url: '/soporte/comunidad/1/parametros-cobranza' }}
  getOne={{ url: (id) => `/soporte/comunidad/1/parametros-cobranza` }}
  update={{ url: (id) => `/soporte/comunidad/1/parametros-cobranza` }}
  remove={{ url: (id) => `/soporte/comunidad/1/parametros-cobranza` }}
  exampleCreateBody={{ interes: 1.5, moraDesdeDia: 11 }}
    />
  )
}
