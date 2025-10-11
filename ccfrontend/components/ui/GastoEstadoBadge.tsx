import React from 'react';
import { GASTO_ESTADOS } from '../../types/gastos';

interface Props {
  estado: keyof typeof GASTO_ESTADOS;
  size?: 'sm' | 'md' | 'lg';
}

const GastoEstadoBadge: React.FC<Props> = ({ estado, size = 'md' }) => {
  const config = GASTO_ESTADOS[estado];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${config.color}
      ${sizeClasses[size]}
    `}>
      {config.label}
    </span>
  );
};

export default GastoEstadoBadge;