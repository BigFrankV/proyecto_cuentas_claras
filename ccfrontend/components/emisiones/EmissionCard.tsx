import Link from 'next/link';

import {
  EmissionStatusBadge,
  EmissionTypeBadge,
  EmissionStatus,
} from './Badges';

// Interfaz para datos de emisión
export interface Emission {
  id: string;
  period: string;
  type: 'gastos_comunes' | 'extraordinaria' | 'multa' | 'interes';
  status: EmissionStatus;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  unitCount: number;
  description?: string;
  communityName?: string;
}

// Card de emisión para vista de cards
interface EmissionCardProps {
  emission: Emission;
}

export function EmissionCard({ emission }: EmissionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getPaymentProgress = () => {
    if (emission.totalAmount === 0) {return 0;}
    return (emission.paidAmount / emission.totalAmount) * 100;
  };

  const isOverdue = () => {
    return (
      new Date(emission.dueDate) < new Date() && emission.status !== 'paid'
    );
  };

  return (
    <div className='emission-card'>
      <div className='card-header'>
        <div className='card-title'>
          <Link
            href={`/emisiones/${emission.id}`}
            className='text-decoration-none'
          >
            <h6 className='mb-1'>{emission.period}</h6>
          </Link>
          <div className='card-badges'>
            <EmissionTypeBadge type={emission.type} size='sm' />
            <EmissionStatusBadge status={emission.status} size='sm' />
          </div>
        </div>
        <div className='card-actions'>
          <div className='dropdown'>
            <button
              className='btn btn-sm btn-outline-secondary dropdown-toggle'
              type='button'
              data-bs-toggle='dropdown'
            >
              <i className='material-icons'>more_vert</i>
            </button>
            <ul className='dropdown-menu dropdown-menu-end'>
              <li>
                <Link
                  href={`/emisiones/${emission.id}`}
                  className='dropdown-item'
                >
                  <i className='material-icons me-2'>visibility</i>
                  Ver detalles
                </Link>
              </li>
              <li>
                <Link
                  href={`/emisiones/${emission.id}/prorrateo`}
                  className='dropdown-item'
                >
                  <i className='material-icons me-2'>pie_chart</i>
                  Prorrateo
                </Link>
              </li>
              <li>
                <hr className='dropdown-divider' />
              </li>
              <li>
                <button className='dropdown-item text-primary'>
                  <i className='material-icons me-2'>edit</i>
                  Editar
                </button>
              </li>
              <li>
                <button className='dropdown-item text-danger'>
                  <i className='material-icons me-2'>delete</i>
                  Eliminar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className='card-body'>
        {emission.description && (
          <p className='card-description'>{emission.description}</p>
        )}

        <div className='card-info'>
          <div className='info-row'>
            <span className='info-label'>
              <i className='material-icons'>event</i>
              Emisión:
            </span>
            <span className='info-value'>{formatDate(emission.issueDate)}</span>
          </div>

          <div className='info-row'>
            <span className='info-label'>
              <i className='material-icons'>schedule</i>
              Vencimiento:
            </span>
            <span className={`info-value ${isOverdue() ? 'text-danger' : ''}`}>
              {formatDate(emission.dueDate)}
              {isOverdue() && <i className='material-icons ms-1'>warning</i>}
            </span>
          </div>

          <div className='info-row'>
            <span className='info-label'>
              <i className='material-icons'>home</i>
              Unidades:
            </span>
            <span className='info-value'>{emission.unitCount}</span>
          </div>
        </div>

        <div className='card-amounts'>
          <div className='amount-row total'>
            <span className='amount-label'>Total:</span>
            <span className='amount-value'>
              {formatCurrency(emission.totalAmount)}
            </span>
          </div>

          {emission.paidAmount > 0 && (
            <div className='amount-row paid'>
              <span className='amount-label'>Pagado:</span>
              <span className='amount-value'>
                {formatCurrency(emission.paidAmount)}
              </span>
            </div>
          )}

          {emission.paidAmount < emission.totalAmount && (
            <div className='amount-row pending'>
              <span className='amount-label'>Pendiente:</span>
              <span className='amount-value'>
                {formatCurrency(emission.totalAmount - emission.paidAmount)}
              </span>
            </div>
          )}
        </div>

        {emission.status === 'partial' && (
          <div className='payment-progress'>
            <div className='progress-header'>
              <span className='progress-label'>Progreso de pago</span>
              <span className='progress-percentage'>
                {Math.round(getPaymentProgress())}%
              </span>
            </div>
            <div className='progress'>
              <div
                className='progress-bar'
                style={{ width: `${getPaymentProgress()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className='card-footer'>
        <div className='footer-actions'>
          <Link
            href={`/emisiones/${emission.id}`}
            className='btn btn-sm btn-outline-primary'
          >
            <i className='material-icons me-1'>visibility</i>
            Ver detalles
          </Link>

          {emission.status === 'draft' && (
            <button className='btn btn-sm btn-primary'>
              <i className='material-icons me-1'>send</i>
              Enviar
            </button>
          )}

          {emission.status === 'ready' && (
            <Link
              href={`/emisiones/${emission.id}/prorrateo`}
              className='btn btn-sm btn-success'
            >
              <i className='material-icons me-1'>pie_chart</i>
              Prorrateo
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .emission-card {
          background: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .emission-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .card-header {
          padding: 1rem;
          border-bottom: 1px solid #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-title h6 {
          color: #212529;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .card-title h6:hover {
          color: #0d6efd;
        }

        .card-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .card-actions {
          flex-shrink: 0;
        }

        .card-body {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-description {
          color: #6c757d;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6c757d;
          font-weight: 500;
        }

        .info-label .material-icons {
          font-size: 16px;
        }

        .info-value {
          color: #212529;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .card-amounts {
          background: #f8f9fa;
          border-radius: 0.375rem;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .amount-row.total {
          font-weight: 600;
          color: #212529;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .amount-row.paid .amount-value {
          color: #198754;
        }

        .amount-row.pending .amount-value {
          color: #ffc107;
        }

        .payment-progress {
          margin-top: auto;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .progress-label {
          color: #6c757d;
          font-weight: 500;
        }

        .progress-percentage {
          color: #212529;
          font-weight: 600;
        }

        .progress {
          height: 0.5rem;
          background-color: #e9ecef;
          border-radius: 0.25rem;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #198754 0%, #20c997 100%);
          transition: width 0.3s ease;
        }

        .card-footer {
          padding: 1rem;
          border-top: 1px solid #f8f9fa;
          background: #fdfdfe;
          border-radius: 0 0 0.5rem 0.5rem;
        }

        .footer-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .footer-actions .btn {
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .card-title {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .footer-actions {
            flex-direction: column;
          }

          .footer-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Fila de emisión para vista de tabla
interface EmissionRowProps {
  emission: Emission;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function EmissionRow({
  emission,
  selected = false,
  onSelect,
}: EmissionRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const isOverdue = () => {
    return (
      new Date(emission.dueDate) < new Date() && emission.status !== 'paid'
    );
  };

  return (
    <tr
      className={`emission-row ${selected ? 'selected' : ''} ${isOverdue() ? 'overdue' : ''}`}
    >
      <td>
        <div className='form-check'>
          <input
            className='form-check-input'
            type='checkbox'
            checked={selected}
            onChange={e => onSelect?.(emission.id, e.target.checked)}
          />
        </div>
      </td>
      <td>
        <Link
          href={`/emisiones/${emission.id}`}
          className='text-decoration-none'
        >
          <strong className='emission-link'>{emission.period}</strong>
        </Link>
      </td>
      <td>
        <EmissionTypeBadge type={emission.type} size='sm' />
      </td>
      <td>
        <EmissionStatusBadge status={emission.status} size='sm' />
      </td>
      <td>{formatDate(emission.issueDate)}</td>
      <td className={isOverdue() ? 'text-danger' : ''}>
        {formatDate(emission.dueDate)}
        {isOverdue() && (
          <i className='material-icons ms-1' style={{ fontSize: '16px' }}>
            warning
          </i>
        )}
      </td>
      <td>{emission.unitCount}</td>
      <td className='text-end'>{formatCurrency(emission.totalAmount)}</td>
      <td className='text-end text-success'>
        {formatCurrency(emission.paidAmount)}
      </td>
      <td className='text-end'>
        <div className='dropdown'>
          <button
            className='btn btn-sm btn-outline-secondary dropdown-toggle'
            type='button'
            data-bs-toggle='dropdown'
          >
            <i className='material-icons'>more_vert</i>
          </button>
          <ul className='dropdown-menu dropdown-menu-end'>
            <li>
              <Link
                href={`/emisiones/${emission.id}`}
                className='dropdown-item'
              >
                <i className='material-icons me-2'>visibility</i>
                Ver detalles
              </Link>
            </li>
            <li>
              <Link
                href={`/emisiones/${emission.id}/prorrateo`}
                className='dropdown-item'
              >
                <i className='material-icons me-2'>pie_chart</i>
                Prorrateo
              </Link>
            </li>
            <li>
              <hr className='dropdown-divider' />
            </li>
            <li>
              <button className='dropdown-item text-primary'>
                <i className='material-icons me-2'>edit</i>
                Editar
              </button>
            </li>
            <li>
              <button className='dropdown-item text-danger'>
                <i className='material-icons me-2'>delete</i>
                Eliminar
              </button>
            </li>
          </ul>
        </div>
      </td>

      <style jsx>{`
        .emission-row {
          transition: all 0.2s ease;
        }

        .emission-row:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .emission-row.selected {
          background-color: rgba(13, 110, 253, 0.1);
        }

        .emission-row.overdue {
          background-color: rgba(220, 53, 69, 0.05);
        }

        .emission-link {
          color: #0d6efd;
          text-decoration: none;
        }

        .emission-link:hover {
          text-decoration: underline;
        }

        .dropdown-toggle {
          border: none;
          background: transparent;
        }

        .dropdown-toggle:focus {
          box-shadow: none;
        }
      `}</style>
    </tr>
  );
}
