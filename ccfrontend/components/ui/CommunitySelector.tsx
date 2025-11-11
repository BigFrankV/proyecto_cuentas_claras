/**
 * COMMUNITY SELECTOR COMPONENT
 * 
 * Componente reutilizable para que superadmin seleccione comunidades
 * Oculto automáticamente para usuarios regulares
 */

import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

import { shouldShowCommunitySelector } from '@/lib/superadminAccessHelper';
import { useAuth } from '@/lib/useAuth';

export interface CommunityOption {
  id: number;
  nombre: string;
  [key: string]: any;
}

interface CommunitySelectorProps {
  /** Comunidades disponibles */
  comunidades: CommunityOption[];

  /** ID seleccionado actualmente */
  selectedCommunityId: number | null | undefined;

  /** Callback cuando cambia la selección */
  onChange: (communityId: number | null) => void;

  /** Si está cargando comunidades */
  loading?: boolean;

  /** Etiqueta del selector */
  label?: string;

  /** Texto para "todas las comunidades" */
  allLabel?: string;

  /** Clases CSS adicionales */
  className?: string;

  /** Disabled? */
  disabled?: boolean;
}

/**
 * Componente de selector de comunidad para superadmin
 *
 * USO:
 * ```tsx
 * const [selectedComunidad, setSelectedComunidad] = useState<number | null>(null);
 * const [comunidades, setComunidades] = useState<any[]>([]);
 *
 * return (
 *   <CommunitySelector
 *     comunidades={comunidades}
 *     selectedCommunityId={selectedComunidad}
 *     onChange={setSelectedComunidad}
 *     loading={loadingComunidades}
 *     label="Selecciona una comunidad"
 *   />
 * );
 * ```
 */
export const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  comunidades,
  selectedCommunityId,
  onChange,
  loading = false,
  label = 'Comunidad',
  allLabel = 'Todas las comunidades',
  className = '',
  disabled = false,
}) => {
  const { user } = useAuth();

  // Ocultar para usuarios que no sean superadmin
  if (!shouldShowCommunitySelector(user)) {
    return null;
  }

  return (
    <Form.Group className={`mb-3 ${className}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Select
        value={selectedCommunityId || ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={loading || disabled}
      >
        <option value="">{allLabel}</option>
        {comunidades.map(c => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </Form.Select>
      {loading && <small className="text-muted">Cargando comunidades...</small>}
    </Form.Group>
  );
};

export default CommunitySelector;
