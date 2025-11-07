import dynamic from 'next/dynamic';
import React from 'react';

const ConsumosPage = dynamic(() => import('@/components/consumos/ConsumosPage'), { ssr: false });

export default function MedidorConsumosPage(): JSX.Element {
  // No cambiar diseño: reutiliza el mismo componente que usa la ruta /consumos.
  return <ConsumosPage />;
}
