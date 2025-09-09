import React from 'react'
// layout styles are loaded globally via styles/index.css

type Card = { id: string; title: string; subtitle?: string }

export default function Kanban({ columns }: { columns: { title: string; cards: Card[] }[] }) {
  return (
    <div className="kk-kanban">
      {columns.map((col, i) => (
        <section className="kk-kanban-column" key={i}>
          <header>{col.title} <span className="kk-pill">{col.cards.length}</span></header>
          <div className="kk-kanban-list">
            {col.cards.map(c => (
              <article className="kk-card" key={c.id}>
                <div className="kk-card-title">{c.title}</div>
                {c.subtitle && <div className="kk-card-sub">{c.subtitle}</div>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
