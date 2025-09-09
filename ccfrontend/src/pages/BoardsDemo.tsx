import React from 'react'
import Kanban from '../layout/Kanban'

export default function BoardsDemo() {
  const columns = [
    { title: 'Pendientes', cards: [{ id: 'c1', title: 'Emitir gasto marzo', subtitle: 'Gasto general' }, { id: 'c2', title: 'Revisar factura proveedor X' }] },
    { title: 'En Proceso', cards: [{ id: 'c3', title: 'Generar cargos abril' }] },
    { title: 'Completado', cards: [{ id: 'c4', title: 'Pago #123 aplicado' }] },
  ]
  return (
    <div>
      <h3>Boards Demo</h3>
      <Kanban columns={columns} />
    </div>
  )
}
