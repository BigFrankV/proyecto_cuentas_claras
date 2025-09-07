import React from 'react'
import MegaMenu from './components/MegaMenu'

const menu = [
  {
    key: 'productos',
    title: 'Productos',
    columns: [
      { title: 'Por categoría', items: [{ label: 'Unidades', href: '/unidades' }, { label: 'Torres', href: '/torres' }] },
      { title: 'Servicios', items: [{ label: 'Pagos', href: '/pagos' }, { label: 'Conciliaciones', href: '/conciliaciones' }] },
      { title: 'Soporte', items: [{ label: 'Tickets', href: '/soporte' }, { label: 'Documentos', href: '/documentos' }] }
    ]
  },
  {
    key: 'administrar',
    title: 'Administrar',
    columns: [
      { title: 'Comunidades', items: [{ label: 'Listar', href: '/comunidades' }, { label: 'Crear', href: '/comunidades/new' }] },
      { title: 'Cuentas', items: [{ label: 'Personas', href: '/personas' }, { label: 'Proveedores', href: '/proveedores' }] },
      { title: 'Configuración', items: [{ label: 'Parámetros cobranza', href: '/parametros' }] }
    ]
  }
]

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <MegaMenu items={menu} />
      </header>

      <main>
        <h1>Demo: MegaMenu</h1>
        <p>Este es un ejemplo mínimo para visualizar el megamenú.</p>
      </main>
    </div>
  )
}
