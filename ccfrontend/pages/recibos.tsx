'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';

import Sidebar from '@/components/layout/Sidebar';
import CRUDTable, { ColumnConfig } from '@/components/ui/CRUDTable';
import reciboService, { Recibo } from '@/lib/reciboService';
import { useAuth } from '@/lib/useAuth';

/**
 * PÁGINA RECIBOS
 * Listar, crear, editar y eliminar recibos
 */

const RecibosPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  // Cargar recibos
  const loadRecibos = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await reciboService.listRecibos(filters);
      setRecibos(response.data || response);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar recibos');
      // eslint-disable-next-line no-console
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar componente
  useEffect(() => {
    if (!authLoading && user) {
      loadRecibos({ comunidad_id: user.comunidad_id });
    }
  }, [authLoading, user, loadRecibos]);

  // Columnas de la tabla
  const columns: ColumnConfig[] = [
    {
      key: 'numero_recibo',
      label: 'Número',
      sortable: true,
    },
    {
      key: 'monto_recibido',
      label: 'Monto',
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      key: 'metodo_pago',
      label: 'Método',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => {
        let variant = 'secondary';
        if (value === 'validado') {
          variant = 'success';
        }
        if (value === 'rechazado') {
          variant = 'danger';
        }
        if (value === 'pendiente_validacion') {
          variant = 'warning';
        }
        return <Badge bg={variant}>{value}</Badge>;
      },
    },
    {
      key: 'fecha_recepcion',
      label: 'Fecha',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Acciones
  const handleEdit = (recibo: Recibo) => {
    router.push(`/recibos/${recibo.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await reciboService.deleteRecibo(id);
      alert('Recibo eliminado exitosamente');
      loadRecibos({ comunidad_id: user?.comunidad_id });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAdd = () => {
    router.push('/recibos-nueva');
  };

  const handleSearch = (term: string) => {
    if (term) {
      const filtered = recibos.filter(r =>
        r.numero_recibo.toLowerCase().includes(term.toLowerCase()),
      );
      setRecibos(filtered);
    } else {
      loadRecibos({ comunidad_id: user?.comunidad_id });
    }
  };

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (pagination?.limit || 20);
    loadRecibos({ comunidad_id: user?.comunidad_id, offset });
  };

  if (authLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <CRUDTable
          title="Gestión de Recibos"
          columns={columns}
          data={recibos}
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

export default RecibosPage;
