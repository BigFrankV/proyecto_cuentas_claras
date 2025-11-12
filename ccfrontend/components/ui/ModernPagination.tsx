import { ReactNode } from 'react';

interface ModernPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemName: string; // "edificios", "unidades", "personas", etc.
  onPageChange: (page: number) => void;
  className?: string;
  showItemCount?: boolean;
}

export default function ModernPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemName,
  onPageChange,
  className = '',
  showItemCount = true,
}: ModernPaginationProps) {
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav
      aria-label='Navegación de páginas'
      className={`pagination-modern ${className}`}
    >
      <button
        className='btn btn-outline-secondary'
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        aria-label='Página anterior'
        type='button'
      >
        <span className='material-icons'>chevron_left</span>
      </button>

      <div className='page-info'>
        <div className='page-numbers'>
          Página {currentPage} de {totalPages}
        </div>
        {showItemCount && (
          <div className='item-count text-muted'>
            Mostrando {startItem}-{endItem} de {totalItems} {itemName}
          </div>
        )}
      </div>

      <button
        className='btn btn-outline-secondary'
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        aria-label='Página siguiente'
        type='button'
      >
        <span className='material-icons'>chevron_right</span>
      </button>

      <style jsx>{`
        .pagination-modern {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem 0;
          margin: 2rem 0;
        }

        .page-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          min-width: 200px;
        }

        .page-numbers {
          font-weight: 600;
          color: var(--bs-body-color);
          font-size: 0.95rem;
        }

        .item-count {
          font-size: 0.85rem;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid var(--bs-border-color);
          background: white;
          color: var(--bs-body-color);
          transition: all 0.2s ease;
        }

        .btn:hover:not(:disabled) {
          background: var(--bs-primary);
          border-color: var(--bs-primary);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn .material-icons {
          font-size: 20px;
        }

        @media (max-width: 576px) {
          .pagination-modern {
            flex-direction: column;
            gap: 0.75rem;
          }

          .page-info {
            order: -1;
          }

          .item-count {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </nav>
  );
}