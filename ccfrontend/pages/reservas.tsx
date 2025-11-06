'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';

import Sidebar from '@/components/layout/Sidebar';
import CRUDTable, { ColumnConfig } from '@/components/ui/CRUDTable';
import reservasService, { Reserva } from '@/lib/reservasService';
import { useAuth } from '@/lib/useAuth';

/**
 * PÁGINA RESERVAS
 * Listar, crear, editar y eliminar reservas
 *
 * NOTA: Este es un template para copiar a otros módulos
 * Solo cambiar: servicio, tipo de dato, columnas, rutas
 */

const ReservasPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  // Cargar reservas
  const loadReservas = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await reservasService.listReservas(filters);
      setReservas(response.data || response);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar reservas');
      // eslint-disable-next-line no-console
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar componente
  useEffect(() => {
    if (!authLoading && user) {
      loadReservas({ comunidad_id: user.comunidad_id });
    }
  }, [authLoading, user, loadReservas]);

  // Columnas de la tabla
  const columns: ColumnConfig[] = [
    {
      key: 'numero_reserva',
      label: 'Número',
      sortable: true,
    },
    {
      key: 'amenidad',
      label: 'Amenidad',
    },
    {
      key: 'fecha_inicio',
      label: 'Inicio',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'fecha_fin',
      label: 'Fin',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'cantidad_personas',
      label: 'Personas',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => {
        let variant = 'secondary';
        if (value === 'aprobada') {
          variant = 'success';
        }
        if (value === 'rechazada') {
          variant = 'danger';
        }
        if (value === 'solicitada') {
          variant = 'warning';
        }
        if (value === 'cumplida') {
          variant = 'info';
        }
        if (value === 'cancelada') {
          variant = 'dark';
        }
        return <Badge bg={variant}>{value}</Badge>;
      },
    },
  ];

  // Acciones
  const handleEdit = (reserva: Reserva) => {
    router.push(`/reservas/${reserva.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await reservasService.cancelarReserva(id);
      alert('Reserva cancelada exitosamente');
      loadReservas({ comunidad_id: user?.comunidad_id });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAdd = () => {
    router.push('/reservas-nueva');
  };

  const handleSearch = (term: string) => {
    if (term) {
      const filtered = reservas.filter(r =>
        r.numero_reserva.toLowerCase().includes(term.toLowerCase()),
      );
      setReservas(filtered);
    } else {
      loadReservas({ comunidad_id: user?.comunidad_id });
    }
  };

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (pagination?.limit || 20);
    loadReservas({ comunidad_id: user?.comunidad_id, offset });
  };

  if (authLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <CRUDTable
          title="Gestión de Reservas de Amenidades"
          columns={columns}
          data={reservas}
          loading={loading}
          error={error || undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onSearch={handleSearch}
          pagination={pagination}
          onPageChange={handlePageChange}
          exportable
          searchable
        />
      </div>
    </div>
  );
};

export default ReservasPage;
