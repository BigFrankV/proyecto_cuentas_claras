import React, { useState, useMemo } from 'react';

// Interfaces
interface Charge {
  id: string;
  concept: string;
  type: 'administration' | 'maintenance' | 'service' | 'insurance' | 'other';
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'partial';
  unit: string;
  description?: string;
  createdAt: string;
  paymentDate?: string;
  paymentAmount?: number;
}

// Mock data
const mockCharges: Charge[] = [
  {
    id: 'CHG-2024-001',
    concept: 'Administración Enero 2024',
    type: 'administration',
    amount: 45000,
    dueDate: '2024-01-31',
    status: 'paid',
    unit: 'APT-101',
    description: 'Cuota de administración mensual',
    createdAt: '2024-01-01',
    paymentDate: '2024-01-25',
    paymentAmount: 45000
  },
  {
    id: 'CHG-2024-002',
    concept: 'Mantenimiento Ascensores',
    type: 'maintenance',
    amount: 25000,
    dueDate: '2024-02-15',
    status: 'pending',
    unit: 'APT-102',
    description: 'Mantenimiento preventivo ascensores',
    createdAt: '2024-02-01'
  },
  {
    id: 'CHG-2024-003',
    concept: 'Servicio de Seguridad',
    type: 'service',
    amount: 35000,
    dueDate: '2024-02-28',
    status: 'approved',
    unit: 'APT-103',
    description: 'Servicio de vigilancia 24/7',
    createdAt: '2024-02-01'
  },
  {
    id: 'CHG-2024-004',
    concept: 'Seguro Edificio',
    type: 'insurance',
    amount: 50000,
    dueDate: '2024-03-15',
    status: 'partial',
    unit: 'APT-104',
    description: 'Prima anual seguro integral',
    createdAt: '2024-02-15',
    paymentAmount: 25000
  },
  {
    id: 'CHG-2024-005',
    concept: 'Multa Parqueo',
    type: 'other',
    amount: 15000,
    dueDate: '2024-02-20',
    status: 'rejected',
    unit: 'APT-105',
    description: 'Parqueo en zona no autorizada',
    createdAt: '2024-02-10'
  }
];

const CargosListado: React.FC = () => {
  const [charges] = useState<Charge[]>(mockCharges);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'paid': 'Pagado',
      'partial': 'Parcial'
    };
    return statusMap[status] || status;
  };

  // Obtener texto del tipo
  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'administration': 'Administración',
      'maintenance': 'Mantenimiento',
      'service': 'Servicio',
      'insurance': 'Seguro',
      'other': 'Otro'
    };
    return typeMap[type] || type;
  };

  // Filtrar cargos
  const filteredCharges = useMemo(() => {
    return charges.filter(charge => {
      const matchesSearch = charge.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           charge.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           charge.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || charge.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [charges, searchTerm, selectedStatus]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: charges.length,
      pending: charges.filter(c => c.status === 'pending').length,
      paid: charges.filter(c => c.status === 'paid').length,
      overdue: charges.filter(c => {
        const dueDate = new Date(c.dueDate);
        const today = new Date();
        return c.status === 'pending' && dueDate < today;
      }).length
    };
  }, [charges]);

  return (
    <div className="container-fluid py-4">
      {/* Header con estadísticas */}
      <div className="charges-header mb-4">
        <h1 className="charges-title">
          Gestión de Cargos
        </h1>
        <p className="charges-subtitle">
          Administra y da seguimiento a todos los cargos de la comunidad
        </p>
        
        <div className="charges-stats">
          <div className="stat-item">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.paid}</div>
            <div className="stat-label">Pagados</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">Vencidos</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-card mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="search-bar">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Buscar por concepto, unidad o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="paid">Pagado</option>
              <option value="partial">Parcial</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <div>
          <a
            href="/cargos/nuevo"
            className="btn btn-success"
          >
            ➕ Nuevo Cargo
          </a>
        </div>
      </div>

      {/* Tabla de cargos */}
      <div className="charges-table">
        <div className="table-header">
          <h4 className="table-title mb-0">
            Lista de Cargos
          </h4>
          <div className="table-info">
            Mostrando {filteredCharges.length} cargos
          </div>
        </div>

        {filteredCharges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              📋
            </div>
            <h5 className="empty-state-title">No se encontraron cargos</h5>
            <p className="empty-state-description mb-0">
              No hay cargos que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Unidad</th>
                  <th>Monto</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharges.map((charge) => (
                  <tr key={charge.id}>
                    <td>
                      <span className="charge-id">{charge.id}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{charge.concept}</strong>
                        {charge.description && (
                          <small className="text-muted d-block">
                            {charge.description}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`charge-type ${charge.type}`}>
                        {getTypeText(charge.type)}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold">{charge.unit}</span>
                    </td>
                    <td>
                      <div className={`amount-cell ${charge.status === 'paid' ? 'positive' : 'pending'}`}>
                        <div>{formatCurrency(charge.amount)}</div>
                        {charge.paymentAmount && charge.paymentAmount !== charge.amount && (
                          <small className="text-muted">
                            Pagado: {formatCurrency(charge.paymentAmount)}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        {formatDate(charge.dueDate)}
                        {new Date(charge.dueDate) < new Date() && charge.status === 'pending' && (
                          <small className="text-danger d-block">
                            ⚠️ Vencido
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${charge.status}`}>
                        {getStatusText(charge.status)}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <a
                          href={`/cargos/${charge.id}`}
                          className="btn btn-primary btn-sm"
                          title="Ver detalles"
                        >
                          👁️
                        </a>
                        <a
                          href={`/cargos/editar/${charge.id}`}
                          className="btn btn-outline-secondary btn-sm"
                          title="Editar"
                        >
                          ✏️
                        </a>
                        {charge.status !== 'paid' && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Marcar como pagado"
                            onClick={() => {
                              // Aquí iría la lógica para marcar como pagado
                              console.log('Marcar como pagado:', charge.id);
                              // En un caso real, sería una llamada a la API
                            }}
                          >
                            💳
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargosListado;