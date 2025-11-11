import Link from 'next/link';
import { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label='breadcrumb' className={`breadcrumb-wrapper ${className}`}>
      <ol className='breadcrumb modern-breadcrumb'>
        {items.map((item, index) => {
          const isActive = index === items.length - 1;

          return (
            <li
              key={index}
              className={`breadcrumb-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {!isActive && item.href ? (
                <Link href={item.href} className='breadcrumb-link'>
                  {item.icon && (
                    <i className={`material-icons breadcrumb-icon ${item.icon}`}>
                      {item.icon}
                    </i>
                  )}
                  <span className='breadcrumb-label'>{item.label}</span>
                </Link>
              ) : (
                <>
                  {item.icon && (
                    <i className={`material-icons breadcrumb-icon ${item.icon}`}>
                      {item.icon}
                    </i>
                  )}
                  <span className='breadcrumb-label'>{item.label}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <style jsx>{`
        .breadcrumb-wrapper {
          margin-bottom: 1.5rem;
        }

        .modern-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0;
          margin: 0;
          background-color: transparent;
          border-radius: 0;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          font-size: 0.95rem;
          color: #6c757d;
        }

        .breadcrumb-item + .breadcrumb-item::before {
          content: '/';
          display: inline-flex;
          align-items: center;
          margin: 0 0.5rem;
          color: #dee2e6;
          font-weight: 300;
        }

        .breadcrumb-item.active {
          color: #495057;
          font-weight: 500;
        }

        .breadcrumb-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #0d6efd;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: #0b5ed7;
          text-decoration: underline;
        }

        .breadcrumb-icon {
          font-size: 1.1rem;
          line-height: 1;
          vertical-align: -0.15em;
          opacity: 0.75;
          transition: opacity 0.2s ease;
        }

        .breadcrumb-link:hover .breadcrumb-icon {
          opacity: 1;
        }

        .breadcrumb-item.active .breadcrumb-icon {
          opacity: 0.6;
        }

        .breadcrumb-label {
          display: inline-block;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .breadcrumb-label {
            font-size: 0.9rem;
          }

          .breadcrumb-icon {
            font-size: 1rem;
          }

          .breadcrumb-item + .breadcrumb-item::before {
            margin: 0 0.35rem;
          }
        }
      `}</style>
    </nav>
  );
}
