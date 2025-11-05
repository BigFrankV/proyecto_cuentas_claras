import React from 'react';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';

import type { Comunidad } from '@/types/comunidades';

export interface ProviderFiltersProps {
  search: string;
  status: string;
  comunidadId?: number | null;
  comunidades: Comunidad[];
  onChange: (
    payload: Partial<{
      search: string;
      status: string;
      comunidadId: number | null;
    }>
  ) => void;
  onClear?: () => void;
}

export default function ProviderFilters({
  search,
  status,
  comunidadId,
  comunidades,
  onChange,
  onClear,
}: ProviderFiltersProps) {
  return (
    <Form className='mb-3'>
      <Row className='g-2 align-items-center'>
        <Col md={6} xs={12}>
          <InputGroup>
            <InputGroup.Text className='bg-white'>
              <span className='material-icons'>search</span>
            </InputGroup.Text>
            <Form.Control
              placeholder='Buscar proveedor...'
              value={search}
              onChange={e => onChange({ search: e.target.value })}
            />
          </InputGroup>
        </Col>

        <Col md={3} xs={6}>
          <Form.Select
            value={status}
            onChange={e => onChange({ status: e.target.value })}
          >
            <option value=''>Todos los estados</option>
            <option value='active'>Activo</option>
            <option value='inactive'>Inactivo</option>
          </Form.Select>
        </Col>

        <Col md={3} xs={6} className='d-flex gap-2'>
          <Form.Select
            value={comunidadId ?? ''}
            onChange={e =>
              onChange({
                comunidadId: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value=''>Todas las comunidades</option>
            {comunidades.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre || c.id}
              </option>
            ))}
          </Form.Select>
          <Button
            variant='outline-secondary'
            onClick={() => {
              onClear?.();
              onChange({ search: '', status: '', comunidadId: null });
            }}
          >
            Limpiar
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
