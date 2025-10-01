import dynamic from 'next/dynamic';

const AmenidadesReservasPage = dynamic(
  () => import('../components/amenidades/AmenidadesReservasPage'),
  { ssr: false }
);

export default function AmenidadesReservas() {
  return <AmenidadesReservasPage />;
}