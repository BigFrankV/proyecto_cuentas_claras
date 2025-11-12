/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import {
  ProviderFilters,
  ProviderStats,
  ProviderTable,
  ProviderCard,
} from '@/components/proveedores';
import { listProveedores, deleteProveedor } from '@/lib/proveedoresService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';
import type { Proveedor } from '@/types/proveedores';

export default function ProveedoresListado() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser } = usePermissions();

  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<Proveedor | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const comunidades = useMemo(() => [] as any[], []);

  const resolvedComunidadId = useMemo(
    () => (isSuperUser ? undefined : undefined),
    [isSuperUser],
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadProviders(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, pagination.page]);

  const loadProviders = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { limit: pagination.limit };
      const offset = (page - 1) * pagination.limit;
      params.offset = offset;
      if (search) {
        params.search = search;
      }
      if (status) {
        params.activo =
          status === 'active' ? 1 : status === 'inactive' ? 0 : undefined;
      }

      const resp = await listProveedores(
        comunidadId ?? resolvedComunidadId,
        params,
      );
      setProviders(resp.data);
      if (resp.pagination) {
        setPagination(resp.pagination);
      } else {
        setPagination(prev => ({
          ...prev,
          total: resp.data.length,
          pages: Math.ceil(resp.data.length / prev.limit),
        }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => router.push(`/proveedores/${id}`);
  const handleEdit = (id: number) => router.push(`/proveedores/editar/${id}`);
  const handleDelete = (p: Proveedor) => {
    setSelectedProvider(p);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProvider) {
      return;
    }
    try {
      await deleteProveedor(selectedProvider.id);
      setShowDeleteModal(false);
      setSelectedProvider(null);
      loadProviders(pagination.page);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error deleting provider:', err);
      alert('No se pudo eliminar el proveedor');
    }
  };

  const handleFiltersChange = (payload: any) => {
    if (payload.search !== undefined) {
      setSearch(payload.search);
    }
    if (payload.status !== undefined) {
      setStatus(payload.status);
    }
    if (payload.comunidadId !== undefined) {
      setComunidadId(payload.comunidadId);
    }
    setPagination(prev => ({ ...prev, page: 1 }));
    loadProviders(1);
  };

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.activo === 1).length,
    totalGastos: providers.reduce((s, p) => s + (p.total_gastos ?? 0), 0),
    montoTotal: providers.reduce((s, p) => s + (p.monto_total_gastado ?? 0), 0),
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Proveedores — Cuentas Claras</title>
      </Head>
      <Layout title='Proveedores'>
        {/* Header Profesional */}
        <div className='container-fluid p-0'>
          <div
            className='text-white'
            style={{
              background: 'linear-gradient(135deg, #607d8b 0%, #546e7a 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div className='p-4'>
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '150px',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
              }}
            />
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center'>
                <div
                  className='me-4'
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i
                    className='material-icons'
                    style={{ fontSize: '32px', color: 'white' }}
                  >
                    business
                  </i>
                </div>
                <div>
                  <h1 className='h2 mb-1 text-white'>Proveedores</h1>
                  <p className='mb-0 opacity-75'>
                    Gestión de proveedores
                  </p>
                </div>
              </div>
              <div className='text-end'>
                <Button
                  variant='light'
                  onClick={() => router.push('/proveedores/nuevo')}
                  className='btn-lg'
                >
                  <i className='material-icons me-2'>add</i>
                  Nuevo Proveedor
                </Button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className='row mt-4'>
              <div className='col-md-4 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>business</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{pagination.total}</div>
                      <div className='text-white-50'>Total Proveedores</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-success)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>check_circle</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>
                        {providers.filter(p => p.activo === 1).length}
                      </div>
                      <div className='text-white-50'>Activos</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-md-4 mb-3'>
                <div
                  className='p-3 rounded-3 text-white'
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className='d-flex align-items-center'>
                    <div
                      className='me-3'
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-info)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className='material-icons'>attach_money</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>
                        {stats.montoTotal.toLocaleString('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                        })}
                      </div>
                      <div className='text-white-50'>Monto Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className='providers-container'>

          {/* filtros */}
          <ProviderFilters
            search={search}
            status={status}
            comunidades={comunidades}
            comunidadId={comunidadId}
            onChange={handleFiltersChange}
            onClear={() => {
              setSearch('');
              setStatus('');
              setComunidadId(null);
            }}
          />

          {/* Toggle de vista MOVIDO: fuera del header, alineado a la derecha */}
          <div className='d-flex justify-content-end mb-3'>
            <div className='btn-group' role='group' aria-label='view-mode'>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                size='sm'
                onClick={() => setViewMode('grid')}
              >
                <span className='material-icons'>grid_view</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                size='sm'
                onClick={() => setViewMode('list')}
              >
                <span className='material-icons'>view_list</span>
              </Button>
            </div>
          </div>

          <ProviderStats
            total={stats.total}
            active={stats.active}
            totalGastos={stats.totalGastos}
            montoTotal={stats.montoTotal}
          />

          {viewMode === 'list' ? (
            <ProviderTable
              providers={providers}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ProviderCard
              providers={providers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {pagination.pages > 1 && (
            <div className='d-flex justify-content-between align-items-center mt-4'>
              <span className='text-muted'>
                Mostrando página {pagination.page} de {pagination.pages}
              </span>
              <nav>...</nav>
            </div>
          )}

          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title className='text-danger'>
                <span className='material-icons me-2'>delete</span>Eliminar
                Proveedor
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedProvider && (
                <>
                  <div className='alert alert-danger'>
                    <span className='material-icons me-2'>warning</span>Esta
                    acción no se puede deshacer.
                  </div>
                  <p>
                    ¿Eliminar proveedor{' '}
                    <strong>{selectedProvider.razon_social}</strong>?
                  </p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='outline-secondary'
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button variant='danger' onClick={confirmDelete}>
                Eliminar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
);
}
