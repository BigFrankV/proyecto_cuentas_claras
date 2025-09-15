// ...existing code...
import React from 'react'

export default function Kanban({ columns = [] }) {
  return (
    <div className="kk-kanban d-flex gap-3">
      {columns.map((col, i) => (
        <section className="kk-kanban-column card p-2" key={i}>
          <header className="d-flex align-items-center justify-content-between mb-2">
            <strong>{col.title}</strong>
            <span className="kk-pill badge bg-secondary">{(col.cards || []).length}</span>
          </header>

          <div className="kk-kanban-list">
            {(col.cards || []).map((c, ci) => (
              <article className="kk-card card mb-2 p-2" key={c.id ?? ci}>
                <div className="kk-card-title">{c.title}</div>
                {c.subtitle && <div className="kk-card-sub text-muted small">{c.subtitle}</div>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
// ...existing code...