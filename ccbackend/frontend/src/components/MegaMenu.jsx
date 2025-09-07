import React, { useState } from 'react'
import './megamenu.css'

export default function MegaMenu({ items }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <nav className="mm-nav" aria-label="Main navigation">
      <ul className="mm-list">
        {items.map((section, i) => (
          <li
            key={section.key || i}
            className="mm-item"
            onMouseEnter={() => setOpenIndex(i)}
            onMouseLeave={() => setOpenIndex(null)}
          >
            <button
              className="mm-button"
              aria-haspopup="true"
              aria-expanded={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {section.title}
            </button>

            <div
              className={`mm-panel ${openIndex === i ? 'open' : ''}`}
              role="region"
              aria-hidden={openIndex === i ? 'false' : 'true'}
            >
              <div className="mm-grid">
                {section.columns.map((col, ci) => (
                  <div className="mm-col" key={ci}>
                    {col.title && <h4 className="mm-col-title">{col.title}</h4>}
                    <ul className="mm-col-list">
                      {col.items.map((it, k) => (
                        <li key={k}>
                          <a className="mm-link" href={it.href || '#'}>
                            {it.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  )
}
