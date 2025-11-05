import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

import type { Proveedor } from '@/types/proveedores';

export interface ProviderCardProps {
  providers: Proveedor[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (p: Proveedor) => void;
}

export default function ProviderCard({
  providers,
  onView,
  onEdit,
  onDelete,
}: ProviderCardProps) {
  if (!providers.length)
    {return (
      <div className='py-4 text-center text-muted'>No hay proveedores</div>
    );}

  return (
    <Row xs={1} md={2} lg={3} className='g-3'>
      {providers.map(p => (
        <Col key={p.id}>
          <Card className='h-100'>
            <Card.Body>
              <div className='d-flex justify-content-between'>
                <div>
                  <Card.Title className='mb-1'>{p.nombre}</Card.Title>
                  <Card.Subtitle className='text-muted'>
                    {p.comunidad_nombre}
                  </Card.Subtitle>
                </div>
                <div className='text-end'>
                  {p.activo === 1 ? (
                    <span className='badge bg-success'>Activo</span>
                  ) : (
                    <span className='badge bg-secondary'>Inactivo</span>
                  )}
                </div>
              </div>

              <div className='mt-3 small text-muted'>Contacto</div>
              <div>{p.telefono ?? '-'}</div>
              <small className='text-muted'>{p.email ?? '-'}</small>

              <div className='mt-3 d-flex gap-2 justify-content-end'>
                <Button
                  variant='outline-info'
                  size='sm'
                  onClick={() => onView(p.id)}
                >
                  <span className='material-icons'>visibility</span>
                </Button>
                <Button
                  variant='outline-primary'
                  size='sm'
                  onClick={() => onEdit(p.id)}
                >
                  <span className='material-icons'>edit</span>
                </Button>
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={() => onDelete(p)}
                >
                  <span className='material-icons'>delete</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

