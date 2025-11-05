import React from 'react';

export interface PaymentProgressProps {
  totalAmount: number;
  paidAmount: number;
  currency?: string;
  className?: string;
}

export default function PaymentProgress({
  totalAmount,
  paidAmount,
  currency = 'COP',
  className = '',
}: PaymentProgressProps) {
  const percentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
  const remainingAmount = totalAmount - paidAmount;

  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProgressClass = (): string => {
    if (percentage >= 100) {
      return 'bg-success';
    }
    if (percentage >= 50) {
      return 'bg-info';
    }
    if (percentage >= 25) {
      return 'bg-warning';
    }
    return 'bg-danger';
  };

  return (
    <div className={`payment-progress ${className}`}>
      <div className='progress-info d-flex justify-content-between align-items-center mb-2'>
        <span className='progress-label'>
          <strong>Pagado:</strong> {formatAmount(paidAmount)}
        </span>
        <span className='progress-percentage'>{percentage.toFixed(1)}%</span>
      </div>

      <div className='progress' style={{ height: '8px' }}>
        <div
          className={`progress-bar ${getProgressClass()}`}
          role='progressbar'
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className='progress-details mt-2'>
        <div className='d-flex justify-content-between'>
          <span className='text-muted'>
            <strong>Total:</strong> {formatAmount(totalAmount)}
          </span>
          <span className='text-muted'>
            <strong>Pendiente:</strong> {formatAmount(remainingAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
