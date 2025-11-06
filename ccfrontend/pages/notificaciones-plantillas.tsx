'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from 'react-bootstrap';

import Sidebar from '@/components/layout/Sidebar';
import CRUDTable, { ColumnConfig } from '@/components/ui/CRUDTable';
import notificacionesPlantillasService, {
  NotificacionPlantilla,
} from '@/lib/notificacionesPlantillasService';
import { useAuth } from '@/lib/useAuth';

/**
 * PÁGINA NOTIFICACIONES PLANTILLAS
 * Listar, crear, editar y eliminar plantillas de notificaciones
 */

const NotificacionesPlantillasPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [plantillas, setPlantillas] = useState<NotificacionPlantilla[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  // Cargar plantillas
  const loadPlantillas = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response =
        await notificacionesPlantillasService.listNotificacionesPlantillas(
          filters,
        );
      setPlantillas(response.data || response);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar plantillas');
      // eslint-disable-next-line no-console
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar componente
  useEffect(() => {
    if (!authLoading && user) {
      loadPlantillas({ comunidad_id: user.comunidad_id });
    }
  }, [authLoading, user, loadPlantillas]);

  // Columnas de la tabla
  const columns: ColumnConfig[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => <Badge bg="info">{value}</Badge>,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => {
        let variant = 'secondary';
        if (value === 'activa') {
          variant = 'success';
        }
        if (value === 'inactiva') {
          variant = 'danger';
        }
        if (value === 'prueba') {
          variant = 'warning';
        }
        return <Badge bg={variant}>{value}</Badge>;
      },
    },
    {
      key: 'asunto',
      label: 'Asunto',
    },
  ];

  // Acciones
  const handleEdit = (plantilla: NotificacionPlantilla) => {
    router.push(`/notificaciones-plantillas/${plantilla.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await notificacionesPlantillasService.deleteNotificacionPlantilla(id);
      alert('Plantilla eliminada exitosamente');
      loadPlantillas({ comunidad_id: user?.comunidad_id });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAdd = () => {
    router.push('/notificaciones-plantillas-nueva');
  };

  const handleSearch = (term: string) => {
    if (term) {
      const filtered = plantillas.filter(p =>
        p.nombre.toLowerCase().includes(term.toLowerCase()),
      );
      setPlantillas(filtered);
    } else {
      loadPlantillas({ comunidad_id: user?.comunidad_id });
    }
  };

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (pagination?.limit || 20);
    loadPlantillas({ comunidad_id: user?.comunidad_id, offset });
  };

  if (authLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <CRUDTable
          title="Gestión de Plantillas de Notificaciones"
          columns={columns}
          data={plantillas}
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

export default NotificacionesPlantillasPage;
