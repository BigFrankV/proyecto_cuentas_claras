import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

import type { CentroCosto } from '@/types/centrosCosto';

export interface CentroCardProps {
  centros: CentroCosto[];
  onEdit: (id: number) => void;
  onDelete: (centro: CentroCosto) => void;
}

export default function CentroCard({
  centros,
  onEdit,
  onDelete,
}: CentroCardProps) {
  if (!centros || centros.length === 0) {
    return (
      <div className='py-4 text-center text-muted'>
        No hay centros para mostrar
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} className='g-3'>
      {centros.map(c => (
        <Col key={c.id}>
          <Card className='h-100 shadow-sm'>
            <Card.Body>
              <div className='d-flex justify-content-between align-items-start'>
                <div>
                  <Card.Title className='mb-1'>{c.nombre}</Card.Title>
                  <Card.Subtitle className='text-muted'>
                    {c.comunidad}
                  </Card.Subtitle>
                </div>
                <div className='text-end'>
                  <Button
                    size='sm'
                    variant='outline-primary'
                    onClick={() => onEdit(c.id)}
                    className='me-1'
                  >
                    <span className='material-icons'>edit</span>
                  </Button>
                  <Button
                    size='sm'
                    variant='outline-danger'
                    onClick={() => onDelete(c)}
                  >
                    <span className='material-icons'>delete</span>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

