import React from 'react';

export interface AmountCellProps {
  amount: number;
  currency?: string;
  type?: 'positive' | 'negative' | 'pending';
  className?: string;
}

export default function AmountCell({
  amount,
  currency = 'COP',
  type,
  className = '',
}: AmountCellProps) {
  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeClass = (): string => {
    if (type) {return `amount-cell ${type}`;}
    if (amount > 0) {return 'amount-cell positive';}
    if (amount < 0) {return 'amount-cell negative';}
    return 'amount-cell pending';
  };

  return (
    <span className={`${getTypeClass()} ${className}`}>
      {formatAmount(amount)}
    </span>
  );
}

