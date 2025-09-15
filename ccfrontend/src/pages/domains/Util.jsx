import GenericCrud from '@/components/GenericCrud'

export default function UtilPage() {
  return (
    <GenericCrud
      title="Util"
  list={{ url: '/util/health' }}
  create={{ url: '/util/health' }}
  getOne={{ url: (id) => `/util/version` }}
  update={{ url: (id) => `/util/version` }}
  remove={{ url: (id) => `/util/version` }}
  exampleCreateBody={{}}
    />
  )
}
