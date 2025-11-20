'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';

import Layout from '@/components/layout/Layout';
import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import reservasService, { Reserva } from '@/lib/reservasService';
import { useAuth } from '@/lib/useAuth';

const ReservasPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    cancelled: 0,
  });

  const loadReservas = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const filters: any = {
        comunidad_id: user?.comunidad_id,
        page,
        limit: 10,
      };

      if (search) {
        filters.search = search;
      }

      const response = await reservasService.listReservas(filters);
      
      // Handle different response structures
      const data = Array.isArray(response) ? response : response.data || [];
      const meta = response.pagination || {
        page: 1,
        limit: 10,
        total: data.length,
        totalPages: Math.ceil(data.length / 10),
      };

      setReservas(data);
      setPagination(meta);

      // Calculate stats from current batch (or ideally from API)
      const currentStats = data.reduce(
        (acc: any, curr: Reserva) => {
          acc.total++;
          if (curr.estado === 'solicitada') { acc.pending++; }
          if (curr.estado === 'aprobada') { acc.approved++; }
          if (curr.estado === 'cancelada') { acc.cancelled++; }
          return acc;
        },
        { total: 0, pending: 0, approved: 0, cancelled: 0 },
      );
      setStats(currentStats);

    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Error loading reservas:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.comunidad_id]);

  useEffect(() => {
    if (!authLoading && user) {
      loadReservas(1, searchTerm);
    }
  }, [authLoading, user, loadReservas, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de cancelar esta reserva?')) { return; }
    
    try {
      await reservasService.cancelarReserva(id);
      loadReservas(pagination.page, searchTerm);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'aprobada': return 'bg-success-subtle text-success';
      case 'rechazada': return 'bg-danger-subtle text-danger';
      case 'solicitada': return 'bg-warning-subtle text-warning';
      case 'cumplida': return 'bg-info-subtle text-info';
      case 'cancelada': return 'bg-secondary-subtle text-secondary';
      default: return 'bg-light text-dark';
    }
  };

  if (authLoading) { return null; }

  return (
    <Layout>
      <div className="reservas-page">
        <PageHeader
          title="Gestión de Reservas"
          subtitle="Administra las reservas de espacios comunes"
          icon="event_note"
          primaryAction={{
            label: 'Nueva Reserva',
            icon: 'add',
            href: '/reservas-nueva',
            onClick: () => router.push('/reservas-nueva'),
          }}
          stats={[
            {
              label: 'Total Reservas',
              value: stats.total.toString(),
              icon: 'list',
              color: 'primary',
            },
            {
              label: 'Pendientes',
              value: stats.pending.toString(),
              icon: 'pending',
              color: 'warning',
            },
            {
              label: 'Aprobadas',
              value: stats.approved.toString(),
              icon: 'check_circle',
              color: 'success',
            },
            {
              label: 'Canceladas',
              value: stats.cancelled.toString(),
              icon: 'cancel',
              color: 'danger',
            },
          ]}
        />

        <div className="content-card">
          <div className="filters-bar">
            <div className="search-box">
              <span className="material-icons">search</span>
              <input
                type="text"
                placeholder="Buscar por número, amenidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Amenidad</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : reservas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No se encontraron reservas
                    </td>
                  </tr>
                ) : (
                  reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>
                        <span className="fw-medium">#{reserva.numero_reserva}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="material-icons text-muted fs-5">apartment</span>
                          {reserva.amenidad}
                        </div>
                      </td>
                      <td>
                        {new Date(reserva.fecha_inicio).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-muted">
                          <span className="material-icons fs-6">schedule</span>
                          {new Date(reserva.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(reserva.fecha_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className="material-icons fs-6 text-muted">group</span>
                          {reserva.cantidad_personas}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn-icon"
                            onClick={() => router.push(`/reservas/${reserva.id}`)}
                            title="Editar"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDelete(reserva.id)}
                            title="Cancelar"
                          >
                            <span className="material-icons">block</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-top">
            <ModernPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => loadReservas(page, searchTerm)}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .reservas-page {
          padding: 1.5rem;
        }

        .content-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e9ecef;
          margin-top: 2rem;
        }

        .filters-bar {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .search-box {
          position: relative;
          max-width: 300px;
        }

        .search-box .material-icons {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #adb5bd;
        }

        .search-box input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.5rem;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .table {
          margin-bottom: 0;
        }

        .table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          padding: 1rem;
          border-bottom: 2px solid #e9ecef;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table td {
          padding: 1rem;
          vertical-align: middle;
          color: #212529;
          border-bottom: 1px solid #e9ecef;
        }

        .badge {
          padding: 0.5rem 0.8rem;
          border-radius: 50px;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          background: white;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f8f9fa;
          color: #2a5298;
          border-color: #2a5298;
        }

        .btn-icon.delete:hover {
          background: #fee2e2;
          color: #dc3545;
          border-color: #dc3545;
        }

        .btn-icon .material-icons {
          font-size: 18px;
        }
      `}</style>
    </Layout>
  );
};

export default ReservasPage;
