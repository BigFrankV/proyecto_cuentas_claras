import dynamic from 'next/dynamic';
import React from 'react';

const ConsumosPage = dynamic(
  () => import('@/components/consumos/ConsumosPage'),
  { ssr: false },
);

export default function ConsumosRoute() {
  return <ConsumosPage />;
}
