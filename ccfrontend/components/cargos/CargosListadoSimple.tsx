import React, { useState, useEffect, useMemo } from 'react';
import { cargosApi } from '@/lib/api/cargos';
import { Cargo } from '@/types/cargos';
import { useAuth } from '@/lib/useAuth';

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

const CargosListado: React.FC = () => {
  const { user } = useAuth();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchCharges = async () => {
      if (!user?.memberships?.length) {
        console.log('⚠️ Usuario no tiene membresías activas');
        setCharges([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Cargando lista de cargos para comunidades del usuario...');

        // Obtener cargos de todas las comunidades del usuario
        const allCharges: Charge[] = [];

        for (const membership of user.memberships) {
          if (membership.activo !== false) { // Si no está explícitamente inactivo
            try {
              console.log(`🏢 Obteniendo cargos de comunidad ${membership.comunidadId}`);
              const comunidadCharges = await cargosApi.getByComunidad(membership.comunidadId);

              // Mapear los datos de la API al formato del componente
              const mappedCharges: Charge[] = comunidadCharges.map(cargo => {
                // Función helper para convertir fecha a string
                const formatDate = (date: any): string => {
                  if (date instanceof Date) {
                    return date.toISOString().split('T')[0]!;
                  }
                  if (typeof date === 'string') {
                    return date.split('T')[0]!;
                  }
                  return new Date().toISOString().split('T')[0]!;
                };

                return {
                  id: cargo.id.toString(),
                  concept: cargo.concepto,
                  type: cargo.tipo.toLowerCase().includes('administración') ? 'administration' :
                        cargo.tipo.toLowerCase().includes('mantenimiento') ? 'maintenance' :
                        cargo.tipo.toLowerCase().includes('servicio') ? 'service' :
                        cargo.tipo.toLowerCase().includes('seguro') ? 'insurance' : 'other',
                  amount: cargo.monto,
                  dueDate: formatDate(cargo.fechaVencimiento),
                  status: cargo.estado === 'pendiente' ? 'pending' :
                          cargo.estado === 'pagado' ? 'paid' :
                          cargo.estado === 'parcial' ? 'partial' : 'pending',
                  unit: cargo.unidad,
                  description: cargo.descripcion || '',
                  createdAt: formatDate(cargo.fechaCreacion),
                  paymentAmount: cargo.monto - cargo.saldo
                };
              });

              allCharges.push(...mappedCharges);
            } catch (comunidadError) {
              console.error(`❌ Error obteniendo cargos de comunidad ${membership.comunidadId}:`, comunidadError);
              // Continuar con otras comunidades
            }
          }
        }

        console.log(`✅ Total de cargos cargados: ${allCharges.length}`);
        setCharges(allCharges);
      } catch (err) {
        console.error('❌ Error al cargar cargos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar los cargos');
      } finally {
        setLoading(false);
      }
    };

    fetchCharges();
  }, [user]);

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

  // Estados de carga y error
  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando lista de cargos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="text-center">
              <i className="material-icons display-1 text-muted">error_outline</i>
              <h2 className="mt-3">Error al cargar cargos</h2>
              <p className="text-muted mb-4">{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                <i className="material-icons me-2">refresh</i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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