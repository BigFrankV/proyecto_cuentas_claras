'use client';

import { useRouter } from 'next/router';
import React, { useState, useEffect, useCallback } from 'react';

import Sidebar from '@/components/layout/Sidebar';
import CRUDTable, { ColumnConfig } from '@/components/ui/CRUDTable';
import {
  listBitacoraAuditoria,
  deleteBitacoraAuditoria,
  BitacoraAuditoria,
} from '@/lib/bitacoraAuditoriaService';
import { useAuth } from '@/lib/useAuth';

const BitacoraAuditoriaPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [registros, setRegistros] = useState<BitacoraAuditoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const loadBitacora = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await listBitacoraAuditoria(filters);
      setRegistros(response.data || response);
      if (response && typeof response === 'object' && 'pagination' in response) {
        setPagination((response as any).pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar auditoría');
      // eslint-disable-next-line no-console
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadBitacora({ comunidad_id: user.comunidad_id });
    }
  }, [user, loadBitacora]);

  const columns: ColumnConfig[] = [
    {
      key: 'numero_registro',
      label: 'Registro',
      sortable: true,
    },
    {
      key: 'accion',
      label: 'Acción',
    },
    {
      key: 'tabla_afectada',
      label: 'Tabla',
    },
    {
      key: 'titulo',
      label: 'Descripción',
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleEdit = (registro: BitacoraAuditoria) => {
    router.push(`/bitacora-auditoria/${registro.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBitacoraAuditoria(id);
      alert('Registro eliminado exitosamente');
      loadBitacora({ comunidad_id: user?.comunidad_id });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAdd = () => {
    router.push('/bitacora-auditoria-nueva');
  };

  const handleSearch = (term: string) => {
    if (term) {
      const filtered = registros.filter(r =>
        r.numero_registro.toLowerCase().includes(term.toLowerCase()),
      );
      setRegistros(filtered);
    } else {
      loadBitacora({ comunidad_id: user?.comunidad_id });
    }
  };

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (pagination?.limit || 20);
    loadBitacora({ comunidad_id: user?.comunidad_id, offset });
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <CRUDTable
          title="Auditoría - Bitácora de Cambios"
          columns={columns}
          data={registros}
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

export default BitacoraAuditoriaPage;
