import dynamic from 'next/dynamic';

const AmenidadesCalendarioPage = dynamic(
  () => import('../components/amenidades/AmenidadesCalendarioPage'),
  { ssr: false }
);

export default function AmenidadesCalendario() {
  return <AmenidadesCalendarioPage />;
}
