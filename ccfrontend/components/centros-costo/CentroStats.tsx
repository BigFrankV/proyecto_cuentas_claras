import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

interface StatsProps {
  total: number;
  active: number;
  presupuestoTotal?: number;
  ejecutado?: number;
}

export default function CentroStats({
  total,
  active,
  presupuestoTotal = 0,
  ejecutado = 0,
}: StatsProps) {
  const fmt = (v: number) =>
    isFinite(v) && !Number.isNaN(v)
      ? v.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      })
      : '$0';

  return (
    <Row className='mb-4 g-3'>
      <Col xs={12} md={3}>
        <Card className='h-100 shadow-sm stat-card'>
          <Card.Body className='d-flex align-items-center gap-3'>
            <div className='stat-icon bg-primary text-white rounded d-flex align-items-center justify-content-center'>
              <span className='material-icons'>account_balance</span>
            </div>
            <div>
              <div className='text-muted small'>Total Centros</div>
              <div className='h5 mb-0'>{total}</div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={3}>
        <Card className='h-100 shadow-sm stat-card'>
          <Card.Body className='d-flex align-items-center gap-3'>
            <div className='stat-icon bg-success text-white rounded d-flex align-items-center justify-content-center'>
              <span className='material-icons'>check_circle</span>
            </div>
            <div>
              <div className='text-muted small'>Centros Activos</div>
              <div className='h5 mb-0'>{active}</div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={3}>
        <Card className='h-100 shadow-sm stat-card'>
          <Card.Body className='d-flex align-items-center gap-3'>
            <div className='stat-icon bg-warning text-dark rounded d-flex align-items-center justify-content-center'>
              <span className='material-icons'>account_balance_wallet</span>
            </div>
            <div>
              <div className='text-muted small'>Presupuesto Total</div>
              <div className='h5 mb-0'>{fmt(presupuestoTotal)}</div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={3}>
        <Card className='h-100 shadow-sm stat-card'>
          <Card.Body className='d-flex align-items-center gap-3'>
            <div className='stat-icon bg-info text-white rounded d-flex align-items-center justify-content-center'>
              <span className='material-icons'>trending_up</span>
            </div>
            <div>
              <div className='text-muted small'>Ejecutado</div>
              <div className='h5 mb-0'>{fmt(ejecutado)}</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
