import React from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

import type { Comunidad } from '@/types/comunidades';

export interface CentroFiltersProps {
  search: string;
  comunidadId?: number | null;
  comunidades: Comunidad[];
  onChange: (payload: { search?: string; comunidadId?: number | null }) => void;
  onClear?: () => void;
}

export default function CentroFilters({
  search,
  comunidadId,
  comunidades,
  onChange,
  onClear,
}: CentroFiltersProps) {
  return (
    <Form className='mb-3'>
      <Row className='g-2 align-items-center'>
        <Col xs={12} md={6}>
          <InputGroup>
            <InputGroup.Text className='bg-white'>
              <span className='material-icons'>search</span>
            </InputGroup.Text>
            <Form.Control
              placeholder='Nombre del centro...'
              value={search}
              onChange={e => onChange({ search: e.target.value })}
            />
          </InputGroup>
        </Col>

        <Col xs={12} md={4}>
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
                {c.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col xs='auto' className='d-flex gap-2'>
          <Button variant='primary' onClick={() => onChange({})}>
            Aplicar
          </Button>
          <Button
            variant='outline-secondary'
            onClick={() => {
              onClear?.();
              onChange({ search: '', comunidadId: null });
            }}
          >
            Limpiar
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
