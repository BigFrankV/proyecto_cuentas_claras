import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import emisionesService from '@/lib/emisionesService';
import comunidadesService from '@/lib/comunidadesService';

interface Concept {
  id: string;
  name: string;
  description: string;
  amount: number;
  distributionType: 'proportional' | 'equal' | 'custom';
  category: string;
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  supplier: string;
  date: string;
  selected: boolean;
}

export default function EmisionNueva() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    period: '',
    type: 'gastos_comunes',
    description: '',
    issueDate: '',
    dueDate: '',
    community: '',
    hasInterest: false,
    interestRate: 2.0,
    gracePeriod: 5
  });

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [loadingComunidades, setLoadingComunidades] = useState(true);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [newConcept, setNewConcept] = useState({
    name: '',
    description: '',
    amount: 0,
    distributionType: 'proportional' as const,
    category: ''
  });

  // Generate mock expenses
  useEffect(() => {
    const mockExpenses: ExpenseItem[] = [
      {
        id: '1',
        description: 'Consumo eléctrico - Septiembre',
        amount: 450000,
        category: 'Servicios Básicos',
        supplier: 'CGE',
        date: '2025-09-15',
        selected: false
      },
      {
        id: '2',
        description: 'Consumo de agua - Septiembre',
        amount: 280000,
        category: 'Servicios Básicos',
        supplier: 'ESVAL',
        date: '2025-09-10',
        selected: false
      },
      {
        id: '3',
        description: 'Servicio de aseo - Septiembre',
        amount: 320000,
        category: 'Servicios',
        supplier: 'Aseo Total',
        date: '2025-09-01',
        selected: false
      },
      {
        id: '4',
        description: 'Mantención ascensores',
        amount: 180000,
        category: 'Mantenimiento',
        supplier: 'Ascensores SA',
        date: '2025-09-05',
        selected: false
      },
      {
        id: '5',
        description: 'Seguridad - Septiembre',
        amount: 650000,
        category: 'Servicios',
        supplier: 'Seguridad Total',
        date: '2025-09-01',
        selected: false
      }
    ];
    setExpenses(mockExpenses);
  }, []);

  // Load comunidades
  useEffect(() => {
    const loadComunidades = async () => {
      try {
        setLoadingComunidades(true);
        const comunidadesData = await comunidadesService.getComunidades();
        setComunidades(comunidadesData);
      } catch (error) {
        console.error('Error loading comunidades:', error);
        // Fallback to mock data if API fails
        setComunidades([
          { id: 1, razon_social: 'Edificio Central' },
          { id: 2, razon_social: 'Torres del Sol' },
          { id: 3, razon_social: 'Condominio Verde' }
        ]);
      } finally {
        setLoadingComunidades(false);
      }
    };

    loadComunidades();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseToggle = (expenseId: string) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, selected: !expense.selected }
          : expense
      )
    );
  };

  const handleSelectAllExpenses = () => {
    const allSelected = expenses.every(expense => expense.selected);
    setExpenses(prev => 
      prev.map(expense => ({ ...expense, selected: !allSelected }))
    );
  };

  const handleAddConcept = () => {
    if (!newConcept.name.trim() || newConcept.amount <= 0) return;
    
    const concept: Concept = {
      id: Date.now().toString(),
      name: newConcept.name,
      description: newConcept.description,
      amount: newConcept.amount,
      distributionType: newConcept.distributionType,
      category: newConcept.category
    };
    
    setConcepts(prev => [...prev, concept]);
    setNewConcept({
      name: '',
      description: '',
      amount: 0,
      distributionType: 'proportional',
      category: ''
    });
    setShowConceptModal(false);
  };

  const handleRemoveConcept = (conceptId: string) => {
    setConcepts(prev => prev.filter(concept => concept.id !== conceptId));
  };

  const getTotalExpenses = () => {
    return expenses
      .filter(expense => expense.selected)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalConcepts = () => {
    return concepts.reduce((sum, concept) => sum + concept.amount, 0);
  };

  const getTotalEmission = () => {
    return getTotalExpenses() + getTotalConcepts();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.period || !formData.issueDate || !formData.dueDate || !formData.community) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    
    try {
      // Convert community string to number
      const comunidadId = parseInt(formData.community);
      
      // Prepare data for API
      const emisionData: {
        periodo: string;
        fecha_vencimiento: string;
        observaciones?: string;
      } = {
        periodo: formData.period,
        fecha_vencimiento: formData.dueDate
      };

      // Add observations only if provided
      if (formData.description.trim()) {
        emisionData.observaciones = formData.description;
      }

      // Call API to create emission
      const nuevaEmision = await emisionesService.createEmision(comunidadId, emisionData);
      
      alert('Emisión creada exitosamente');
      router.push('/emisiones');
    } catch (error) {
      console.error('Error creating emision:', error);
      alert('Error al crear la emisión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Nueva Emisión — Cuentas Claras</title>
      </Head>

      <Layout title='Nueva Emisión'>
        <div className='container-fluid p-4'>
          {/* Header */}
          <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3'>
            <div>
              <h1 className='h2 mb-1'>
                <i className='fa-solid fa-file-invoice-dollar me-2'></i>
                Nueva Emisión
              </h1>
              <p className='text-muted mb-0'>Crear una nueva emisión de gastos comunes</p>
            </div>
            <div className='d-flex gap-2'>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => router.push('/emisiones')}
              >
                <i className='fa-solid fa-arrow-left me-2'></i>
                Volver
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='needs-validation' noValidate>
            <div className='row'>
              <div className='col-lg-8'>
                {/* Información básica */}
                <div className='form-section mb-4'>
                  <div className='section-header'>
                    <h4 className='section-title'>
                      <i className='material-icons me-2'>info</i>
                      Información Básica
                    </h4>
                  </div>
                  <div className='section-content'>
                    <div className='row mb-3'>
                      <div className='col-md-6'>
                        <label htmlFor='period' className='form-label'>
                          Período *
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='period'
                          value={formData.period}
                          onChange={(e) => handleInputChange('period', e.target.value)}
                          placeholder='Ej: Septiembre 2025'
                          required
                        />
                      </div>
                      <div className='col-md-6'>
                        <label htmlFor='type' className='form-label'>
                          Tipo de Emisión *
                        </label>
                        <select
                          className='form-select'
                          id='type'
                          value={formData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          required
                        >
                          <option value='gastos_comunes'>Gastos Comunes</option>
                          <option value='extraordinaria'>Extraordinaria</option>
                          <option value='multa'>Multa</option>
                          <option value='interes'>Interés</option>
                        </select>
                      </div>
                    </div>

                    <div className='row mb-3'>
                      <div className='col-md-6'>
                        <label htmlFor='community' className='form-label'>
                          Comunidad *
                        </label>
                        <select
                          className='form-select'
                          id='community'
                          value={formData.community}
                          onChange={(e) => handleInputChange('community', e.target.value)}
                          required
                          disabled={loadingComunidades}
                        >
                          <option value=''>
                            {loadingComunidades ? 'Cargando comunidades...' : 'Seleccionar comunidad'}
                          </option>
                          {comunidades.map((comunidad) => (
                            <option key={comunidad.id} value={comunidad.id.toString()}>
                              {comunidad.razon_social}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='col-md-6'>
                        <label htmlFor='description' className='form-label'>
                          Descripción
                        </label>
                        <input
                          type='text'
                          className='form-control'
                          id='description'
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder='Descripción de la emisión'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas y plazos */}
                <div className='form-section mb-4'>
                  <div className='section-header'>
                    <h4 className='section-title'>
                      <i className='material-icons me-2'>event</i>
                      Fechas y Plazos
                    </h4>
                  </div>
                  <div className='section-content'>
                    <div className='row mb-3'>
                      <div className='col-md-6'>
                        <label htmlFor='issueDate' className='form-label'>
                          Fecha de Emisión *
                        </label>
                        <input
                          type='date'
                          className='form-control'
                          id='issueDate'
                          value={formData.issueDate}
                          onChange={(e) => handleInputChange('issueDate', e.target.value)}
                          required
                        />
                      </div>
                      <div className='col-md-6'>
                        <label htmlFor='dueDate' className='form-label'>
                          Fecha de Vencimiento *
                        </label>
                        <input
                          type='date'
                          className='form-control'
                          id='dueDate'
                          value={formData.dueDate}
                          onChange={(e) => handleInputChange('dueDate', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className='row mb-3'>
                      <div className='col-12'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='hasInterest'
                            checked={formData.hasInterest}
                            onChange={(e) => handleInputChange('hasInterest', e.target.checked)}
                          />
                          <label className='form-check-label' htmlFor='hasInterest'>
                            Aplicar interés por mora
                          </label>
                        </div>
                      </div>
                    </div>

                    {formData.hasInterest && (
                      <div className='row mb-3'>
                        <div className='col-md-6'>
                          <label htmlFor='interestRate' className='form-label'>
                            Tasa de Interés (% mensual)
                          </label>
                          <input
                            type='number'
                            className='form-control'
                            id='interestRate'
                            value={formData.interestRate}
                            onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value))}
                            step='0.1'
                            min='0'
                          />
                        </div>
                        <div className='col-md-6'>
                          <label htmlFor='gracePeriod' className='form-label'>
                            Período de Gracia (días)
                          </label>
                          <input
                            type='number'
                            className='form-control'
                            id='gracePeriod'
                            value={formData.gracePeriod}
                            onChange={(e) => handleInputChange('gracePeriod', parseInt(e.target.value))}
                            min='0'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conceptos */}
                <div className='form-section mb-4'>
                  <div className='section-header'>
                    <h4 className='section-title'>
                      <i className='material-icons me-2'>receipt_long</i>
                      Conceptos
                    </h4>
                    <button
                      type='button'
                      className='btn btn-outline-primary btn-sm'
                      onClick={() => setShowConceptModal(true)}
                    >
                      <i className='material-icons me-2'>add</i>
                      Agregar Concepto
                    </button>
                  </div>
                  <div className='section-content'>
                    {concepts.length > 0 ? (
                      <div className='table-responsive'>
                        <table className='table table-sm'>
                          <thead>
                            <tr>
                              <th>Concepto</th>
                              <th>Descripción</th>
                              <th>Distribución</th>
                              <th>Monto</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {concepts.map((concept) => (
                              <tr key={concept.id}>
                                <td>{concept.name}</td>
                                <td>{concept.description}</td>
                                <td>
                                  <span className='badge bg-secondary'>
                                    {concept.distributionType === 'proportional' ? 'Proporcional' :
                                     concept.distributionType === 'equal' ? 'Igualitario' : 'Personalizado'}
                                  </span>
                                </td>
                                <td>{formatCurrency(concept.amount)}</td>
                                <td>
                                  <button
                                    type='button'
                                    className='btn btn-sm btn-outline-danger'
                                    onClick={() => handleRemoveConcept(concept.id)}
                                  >
                                    <i className='material-icons'>delete</i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className='text-center py-4 text-muted'>
                        <i className='material-icons mb-2' style={{ fontSize: '3rem' }}>receipt_long</i>
                        <p>No hay conceptos agregados</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gastos incluidos */}
                <div className='form-section mb-4'>
                  <div className='section-header'>
                    <h4 className='section-title'>
                      <i className='material-icons me-2'>receipt</i>
                      Gastos Incluidos
                    </h4>
                    <div className='form-check'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='selectAllExpenses'
                        checked={expenses.every(expense => expense.selected)}
                        onChange={handleSelectAllExpenses}
                      />
                      <label className='form-check-label' htmlFor='selectAllExpenses'>
                        Seleccionar todos
                      </label>
                    </div>
                  </div>
                  <div className='section-content'>
                    <div className='table-responsive'>
                      <table className='table table-sm table-hover'>
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}></th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Proveedor</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense) => (
                            <tr key={expense.id} className={expense.selected ? 'table-primary' : ''}>
                              <td>
                                <div className='form-check'>
                                  <input
                                    className='form-check-input'
                                    type='checkbox'
                                    checked={expense.selected}
                                    onChange={() => handleExpenseToggle(expense.id)}
                                  />
                                </div>
                              </td>
                              <td>{expense.description}</td>
                              <td>
                                <span className='badge bg-light text-dark'>
                                  {expense.category}
                                </span>
                              </td>
                              <td>{expense.supplier}</td>
                              <td>{new Date(expense.date).toLocaleDateString('es-CL')}</td>
                              <td>{formatCurrency(expense.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className='col-lg-4'>
                <div className='sticky-sidebar'>
                  {/* Resumen */}
                  <div className='summary-card mb-4'>
                    <div className='card-header'>
                      <h5 className='mb-0'>
                        <i className='material-icons me-2'>calculate</i>
                        Resumen
                      </h5>
                    </div>
                    <div className='card-body'>
                      <div className='summary-item'>
                        <span className='summary-label'>Gastos seleccionados:</span>
                        <span className='summary-value'>{formatCurrency(getTotalExpenses())}</span>
                      </div>
                      <div className='summary-item'>
                        <span className='summary-label'>Conceptos adicionales:</span>
                        <span className='summary-value'>{formatCurrency(getTotalConcepts())}</span>
                      </div>
                      <hr />
                      <div className='summary-item total'>
                        <span className='summary-label'>Total emisión:</span>
                        <span className='summary-value'>{formatCurrency(getTotalEmission())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='actions-card'>
                    <button
                      type='submit'
                      className='btn btn-primary w-100 mb-2'
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                          Creando...
                        </>
                      ) : (
                        <>
                          <i className='material-icons me-2'>check</i>
                          Crear Emisión
                        </>
                      )}
                    </button>
                    <button
                      type='button'
                      className='btn btn-outline-secondary w-100'
                      onClick={() => router.push('/emisiones')}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal para agregar concepto */}
        {showConceptModal && (
          <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-lg'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Agregar Concepto</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowConceptModal(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Nombre del concepto *</label>
                      <input
                        type='text'
                        className='form-control'
                        value={newConcept.name}
                        onChange={(e) => setNewConcept(prev => ({ ...prev, name: e.target.value }))}
                        placeholder='Ej: Fondo de Reserva'
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Categoría</label>
                      <select
                        className='form-select'
                        value={newConcept.category}
                        onChange={(e) => setNewConcept(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value=''>Seleccionar</option>
                        <option value='Administración'>Administración</option>
                        <option value='Mantenimiento'>Mantenimiento</option>
                        <option value='Servicios'>Servicios</option>
                        <option value='Reservas'>Reservas</option>
                        <option value='Otros'>Otros</option>
                      </select>
                    </div>
                  </div>
                  <div className='row mb-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Monto *</label>
                      <input
                        type='number'
                        className='form-control'
                        value={newConcept.amount}
                        onChange={(e) => setNewConcept(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        min='0'
                        step='1000'
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Tipo de distribución</label>
                      <select
                        className='form-select'
                        value={newConcept.distributionType}
                        onChange={(e) => setNewConcept(prev => ({ ...prev, distributionType: e.target.value as any }))}
                      >
                        <option value='proportional'>Proporcional</option>
                        <option value='equal'>Igualitario</option>
                        <option value='custom'>Personalizado</option>
                      </select>
                    </div>
                  </div>
                  <div className='mb-3'>
                    <label className='form-label'>Descripción</label>
                    <textarea
                      className='form-control'
                      rows={3}
                      value={newConcept.description}
                      onChange={(e) => setNewConcept(prev => ({ ...prev, description: e.target.value }))}
                      placeholder='Descripción del concepto'
                    ></textarea>
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowConceptModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={handleAddConcept}
                    disabled={!newConcept.name.trim() || newConcept.amount <= 0}
                  >
                    Agregar Concepto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .form-section {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f8f9fa;
            background: #fdfdfe;
            border-radius: 0.5rem 0.5rem 0 0;
          }

          .section-title {
            display: flex;
            align-items: center;
            color: #212529;
            font-weight: 600;
            margin: 0;
          }

          .section-content {
            padding: 1.5rem;
          }

          .sticky-sidebar {
            position: sticky;
            top: 1rem;
          }

          .summary-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
          }

          .summary-card .card-header {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            border-radius: 0.5rem 0.5rem 0 0;
            padding: 1rem 1.5rem;
          }

          .summary-card .card-body {
            padding: 1.5rem;
          }

          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
          }

          .summary-item.total {
            font-weight: 600;
            font-size: 1.1rem;
            color: #212529;
          }

          .summary-label {
            color: #6c757d;
          }

          .summary-value {
            font-weight: 500;
            color: #212529;
          }

          .actions-card {
            background: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            border: 1px solid #e9ecef;
            padding: 1.5rem;
          }

          .table-primary {
            --bs-table-accent-bg: rgba(13, 110, 253, 0.05);
          }

          .modal.show {
            display: block !important;
          }

          @media (max-width: 992px) {
            .sticky-sidebar {
              position: static;
            }
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}