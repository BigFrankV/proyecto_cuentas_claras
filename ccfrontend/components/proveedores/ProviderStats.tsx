import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

interface ProviderStatsProps {
  total: number;
  active: number;
  totalGastos?: number;
  montoTotal?: number;
}

export default function ProviderStats({
  total,
  active,
  totalGastos = 0,
  montoTotal = 0,
}: ProviderStatsProps) {
  const fmt = (v: number) =>
    v
      ? v.toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
          maximumFractionDigits: 0,
        })
      : '$0';
  return (
    <Row className='mb-3 g-3'>
      <Col md={3}>
        <Card className='h-100'>
          <Card.Body>
            <div className='text-muted small'>Total Proveedores</div>
            <div className='h5'>{total}</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className='h-100'>
          <Card.Body>
            <div className='text-muted small'>Activos</div>
            <div className='h5'>{active}</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className='h-100'>
          <Card.Body>
            <div className='text-muted small'>Total Gastos</div>
            <div className='h5'>{totalGastos}</div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className='h-100'>
          <Card.Body>
            <div className='text-muted small'>Monto Total</div>
            <div className='h5'>{fmt(montoTotal)}</div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
