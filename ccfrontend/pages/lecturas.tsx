import dynamic from 'next/dynamic';
import React from 'react';

const LecturasPage = dynamic(
  () => import('@/components/lecturas/LecturasPage'),
  { ssr: false },
);

export default function LecturasRoute() {
  return <LecturasPage />;
}
