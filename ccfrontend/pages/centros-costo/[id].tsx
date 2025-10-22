import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Modal, ProgressBar } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

interface CostCenter {
  id: number;
  name: string;
  description: string;
  department:
    | 'operations'
    | 'administration'
    | 'marketing'
    | 'maintenance'
    | 'security';
  manager: string;
  budget: number;
  spent: number;
  community: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  responsibilities: string[];
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected';
}

export default function CentroCostoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [costCenter, setCostCenter] = useState<CostCenter | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadCostCenter();
      loadExpenses();
    }
  }, [id]);

  const loadCostCenter = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockCenter: CostCenter = {
        id: parseInt(id as string),
        name: 'Mantenimiento Edificio A',
        description:
          'Centro de costo para mantenimiento general del edificio A, incluyendo reparaciones, pintura, plomería y electricidad.',
        department: 'maintenance',
        manager: 'Carlos Rodriguez',
        budget: 50000,
        spent: 32500,
        community: 'Comunidad Parque Real',
        icon: 'build',
        color: '#2196F3',
        status: 'active',
        responsibilities: [
          'Reparaciones menores',
          'Pintura interior y exterior',
          'Plomería general',
          'Electricidad básica',
          'Limpieza profunda',
          'Mantenimiento preventivo',
        ],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-03-20T14:25:00Z',
      };

      setCostCenter(mockCenter);
    } catch (error) {
      console.error('Error loading cost center:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      // Mock data
      const mockExpenses: Expense[] = [
        {
          id: 1,
          description: 'Reparación de tuberías en apartamento 3A',
          amount: 2500,
          date: '2024-03-20T10:30:00Z',
          category: 'Plomería',
          status: 'approved',
        },
        {
          id: 2,
          description: 'Pintura exterior del edificio - Fase 1',
          amount: 8900,
          date: '2024-03-18T14:20:00Z',
          category: 'Pintura',
          status: 'approved',
        },
        {
          id: 3,
          description: 'Cambio de luminarias LED en pasillos',
          amount: 3200,
          date: '2024-03-15T16:45:00Z',
          category: 'Electricidad',
          status: 'approved',
        },
        {
          id: 4,
          description: 'Mantenimiento preventivo ascensores',
          amount: 4500,
          date: '2024-03-10T09:15:00Z',
          category: 'Mantenimiento',
          status: 'pending',
        },
        {
          id: 5,
          description: 'Reparación de puerta principal',
          amount: 1800,
          date: '2024-03-08T11:30:00Z',
          category: 'Reparaciones',
          status: 'approved',
        },
      ];

      setExpenses(mockExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const getDepartmentBadge = (department: string) => {
    const badges = {
      operations: { bg: 'success', text: 'Operaciones' },
      administration: { bg: 'primary', text: 'Administración' },
      marketing: { bg: 'warning', text: 'Marketing' },
      maintenance: { bg: 'secondary', text: 'Mantenimiento' },
      security: { bg: 'danger', text: 'Seguridad' },
    };

    const badge = badges[department as keyof typeof badges];
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: { bg: 'success', text: 'Aprobado' },
      pending: { bg: 'warning', text: 'Pendiente' },
      rejected: { bg: 'danger', text: 'Rechazado' },
    };

    const badge = badges[status as keyof typeof badges];
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  const handleEdit = () => {
    router.push(`/centros-costo/editar/${id}`);
  };

  const handleDelete = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Centro de costo eliminado exitosamente');
      router.push('/centros-costo');
    } catch (error) {
      console.error('Error deleting cost center:', error);
      alert('Error al eliminar el centro de costo');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ minHeight: '400px' }}
          >
            <div className='text-center'>
              <div
                className='spinner-border text-primary mb-3'
                style={{ width: '3rem', height: '3rem' }}
              />
              <p className='text-muted'>Cargando centro de costo...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!costCenter) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='text-center py-5'>
            <h3>Centro de costo no encontrado</h3>
            <p className='text-muted'>
              El centro de costo que buscas no existe o fue eliminado.
            </p>
            <Button
              variant='primary'
              onClick={() => router.push('/centros-costo')}
            >
              Volver a Centros de Costo
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const budgetPercentage = (costCenter.spent / costCenter.budget) * 100;
  const remainingBudget = costCenter.budget - costCenter.spent;

  return (
    <ProtectedRoute>
      <Head>
        <title>{costCenter.name} — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='cost-center-detail-container'>
          {/* Header */}
          <div className='cost-center-detail-header'>
            <div className='d-flex justify-content-between align-items-start mb-4'>
              <div>
                <Button
                  variant='link'
                  className='p-0 mb-2 text-decoration-none'
                  onClick={() => router.push('/centros-costo')}
                >
                  <span className='material-icons me-1'>arrow_back</span>
                  Volver a Centros de Costo
                </Button>
                <div className='d-flex align-items-center mb-2'>
                  <div
                    className='center-icon me-3'
                    style={{
                      backgroundColor: costCenter.color,
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <span
                      className='material-icons'
                      style={{ fontSize: '32px' }}
                    >
                      {costCenter.icon}
                    </span>
                  </div>
                  <div>
                    <h1 className='cost-center-detail-title mb-1'>
                      {costCenter.name}
                    </h1>
                    <p className='cost-center-detail-subtitle mb-0'>
                      {costCenter.community}
                    </p>
                  </div>
                </div>
                <div className='d-flex align-items-center gap-2'>
                  {getDepartmentBadge(costCenter.department)}
                  <Badge
                    bg={
                      costCenter.status === 'active' ? 'success' : 'secondary'
                    }
                  >
                    {costCenter.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              <div className='d-flex gap-2'>
                <Button variant='outline-primary' onClick={handleEdit}>
                  <span className='material-icons me-2'>edit</span>
                  Editar
                </Button>
                <Button
                  variant='outline-danger'
                  onClick={() => setShowDeleteModal(true)}
                >
                  <span className='material-icons me-2'>delete</span>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>

          <div className='row'>
            {/* Columna izquierda - Información principal */}
            <div className='col-12 col-lg-8 mb-4'>
              {/* Información General */}
              <Card className='form-section mb-4'>
                <Card.Header className='form-section-header'>
                  <h5 className='mb-0'>
                    <span className='material-icons me-2'>info</span>
                    Información General
                  </h5>
                </Card.Header>
                <Card.Body className='form-section-body'>
                  <div className='row g-3'>
                    <div className='col-md-6'>
                      <div className='info-item'>
                        <label className='info-label'>Responsable</label>
                        <div className='info-value'>{costCenter.manager}</div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='info-item'>
                        <label className='info-label'>Comunidad</label>
                        <div className='info-value'>{costCenter.community}</div>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='info-item'>
                        <label className='info-label'>Descripción</label>
                        <div className='info-value'>
                          {costCenter.description}
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='info-item'>
                        <label className='info-label'>Fecha de Creación</label>
                        <div className='info-value'>
                          {new Date(costCenter.createdAt).toLocaleDateString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div className='info-item'>
                        <label className='info-label'>
                          Última Actualización
                        </label>
                        <div className='info-value'>
                          {new Date(costCenter.updatedAt).toLocaleDateString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Responsabilidades */}
              <Card className='form-section mb-4'>
                <Card.Header className='form-section-header'>
                  <h5 className='mb-0'>
                    <span className='material-icons me-2'>assignment</span>
                    Responsabilidades
                  </h5>
                </Card.Header>
                <Card.Body className='form-section-body'>
                  <div className='d-flex flex-wrap gap-2'>
                    {costCenter.responsibilities.map(
                      (responsibility, index) => (
                        <Badge
                          key={index}
                          bg='light'
                          text='dark'
                          className='p-2'
                        >
                          {responsibility}
                        </Badge>
                      ),
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Gastos Recientes */}
              <Card className='form-section'>
                <Card.Header className='form-section-header'>
                  <h5 className='mb-0'>
                    <span className='material-icons me-2'>receipt</span>
                    Gastos Recientes
                  </h5>
                </Card.Header>
                <Card.Body className='form-section-body'>
                  {expenses.length > 0 ? (
                    <div className='expenses-list'>
                      {expenses.map(expense => (
                        <div key={expense.id} className='expense-item'>
                          <div className='d-flex justify-content-between align-items-start'>
                            <div className='flex-grow-1'>
                              <h6 className='expense-title'>
                                {expense.description}
                              </h6>
                              <div className='d-flex align-items-center gap-2 mb-1'>
                                <Badge bg='light' text='dark'>
                                  {expense.category}
                                </Badge>
                                {getStatusBadge(expense.status)}
                              </div>
                              <small className='text-muted'>
                                {new Date(expense.date).toLocaleDateString(
                                  'es-ES',
                                )}
                              </small>
                            </div>
                            <div className='text-end'>
                              <div className='expense-amount'>
                                ${expense.amount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-4'>
                      <span
                        className='material-icons text-muted mb-2'
                        style={{ fontSize: '48px' }}
                      >
                        receipt_long
                      </span>
                      <p className='text-muted'>
                        No hay gastos registrados para este centro
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>

            {/* Columna derecha - Presupuesto */}
            <div className='col-12 col-lg-4'>
              <Card className='form-section mb-4'>
                <Card.Header className='form-section-header'>
                  <h5 className='mb-0'>
                    <span className='material-icons me-2'>
                      account_balance_wallet
                    </span>
                    Presupuesto
                  </h5>
                </Card.Header>
                <Card.Body className='form-section-body'>
                  <div className='budget-summary'>
                    <div className='budget-item mb-3'>
                      <div className='d-flex justify-content-between mb-1'>
                        <span className='text-muted'>Presupuesto Total</span>
                        <span className='fw-bold'>
                          ${costCenter.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className='budget-item mb-3'>
                      <div className='d-flex justify-content-between mb-1'>
                        <span className='text-muted'>Ejecutado</span>
                        <span className='fw-bold text-primary'>
                          ${costCenter.spent.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className='budget-item mb-3'>
                      <div className='d-flex justify-content-between mb-1'>
                        <span className='text-muted'>Disponible</span>
                        <span
                          className={`fw-bold ${remainingBudget < 0 ? 'text-danger' : 'text-success'}`}
                        >
                          ${remainingBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className='budget-progress mb-3'>
                      <div className='d-flex justify-content-between mb-2'>
                        <span className='small text-muted'>Ejecución</span>
                        <span className='small fw-medium'>
                          {budgetPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar
                        now={budgetPercentage}
                        variant={
                          budgetPercentage > 90
                            ? 'danger'
                            : budgetPercentage > 75
                              ? 'warning'
                              : 'success'
                        }
                        className='mb-2'
                      />
                      <small
                        className={`${budgetPercentage > 90 ? 'text-danger' : budgetPercentage > 75 ? 'text-warning' : 'text-success'}`}
                      >
                        {budgetPercentage > 90
                          ? 'Sobrepresupuesto'
                          : budgetPercentage > 75
                            ? 'Cerca del límite'
                            : 'En buen estado'}
                      </small>
                    </div>

                    <div className='budget-breakdown'>
                      <h6 className='mb-2'>Distribución Mensual</h6>
                      <div className='monthly-budget'>
                        <div className='d-flex justify-content-between'>
                          <span className='text-muted'>Asignado/mes</span>
                          <span>
                            $
                            {(costCenter.budget / 12).toLocaleString(
                              undefined,
                              { maximumFractionDigits: 0 },
                            )}
                          </span>
                        </div>
                        <div className='d-flex justify-content-between'>
                          <span className='text-muted'>Promedio gastado</span>
                          <span>
                            $
                            {(costCenter.spent / 3).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Estadísticas */}
              <Card className='form-section'>
                <Card.Header className='form-section-header'>
                  <h5 className='mb-0'>
                    <span className='material-icons me-2'>analytics</span>
                    Estadísticas
                  </h5>
                </Card.Header>
                <Card.Body className='form-section-body'>
                  <div className='stats-grid'>
                    <div className='stat-item'>
                      <div className='stat-value'>{expenses.length}</div>
                      <div className='stat-label'>Gastos Totales</div>
                    </div>
                    <div className='stat-item'>
                      <div className='stat-value'>
                        {expenses.filter(e => e.status === 'approved').length}
                      </div>
                      <div className='stat-label'>Aprobados</div>
                    </div>
                    <div className='stat-item'>
                      <div className='stat-value'>
                        {expenses.filter(e => e.status === 'pending').length}
                      </div>
                      <div className='stat-label'>Pendientes</div>
                    </div>
                    <div className='stat-item'>
                      <div className='stat-value'>
                        $
                        {(
                          costCenter.spent / expenses.length || 0
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className='stat-label'>Promedio/Gasto</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal de eliminación */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className='text-danger'>
              <span className='material-icons me-2'>delete</span>
              Eliminar Centro de Costo
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className='alert alert-danger'>
              <span className='material-icons me-2'>warning</span>
              Esta acción no se puede deshacer. El centro de costo será
              eliminado permanentemente.
            </div>
            <p>
              ¿Estás seguro de que deseas eliminar el centro de costo{' '}
              <strong>"{costCenter.name}"</strong>?
            </p>
            <p className='text-muted'>
              Esto también eliminará toda la información relacionada, incluyendo
              su historial de gastos y presupuesto.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button variant='danger' onClick={handleDelete}>
              <span className='material-icons me-2'>delete</span>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </Layout>
    </ProtectedRoute>
  );
}
