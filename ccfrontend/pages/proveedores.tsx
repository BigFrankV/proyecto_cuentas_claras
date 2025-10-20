import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProviderFilters, ProviderStats, ProviderTable, ProviderCard } from '@/components/proveedores';
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
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 0 });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [comunidadId, setComunidadId] = useState<number | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<Proveedor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const comunidades = useMemo(() => [] as any[], []);

  const resolvedComunidadId = useMemo(() => (isSuperUser ? undefined : undefined), [isSuperUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {loadProviders(pagination.page);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, pagination.page]);

  const loadProviders = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { limit: pagination.limit };
      const offset = (page - 1) * pagination.limit;
      params.offset = offset;
      if (search) {params.search = search;}
      if (status) {params.activo = status === 'active' ? 1 : status === 'inactive' ? 0 : undefined;}

      const resp = await listProveedores(comunidadId ?? resolvedComunidadId, params);
      setProviders(resp.data);
      if (resp.pagination) {setPagination(resp.pagination);}
      else {setPagination(prev => ({ ...prev, total: resp.data.length, pages: Math.ceil(resp.data.length / prev.limit) }));}
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: number) => router.push(`/proveedores/${id}`);
  const handleEdit = (id: number) => router.push(`/proveedores/editar/${id}`);
  const handleDelete = (p: Proveedor) => { setSelectedProvider(p); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    if (!selectedProvider) {return;}
    try {
      await deleteProveedor(selectedProvider.id);
      setShowDeleteModal(false);
      setSelectedProvider(null);
      loadProviders(pagination.page);
    } catch (err) {
      console.error('Error deleting provider:', err);
      alert('No se pudo eliminar el proveedor');
    }
  };

  const handleFiltersChange = (payload: any) => {
    if (payload.search !== undefined) {setSearch(payload.search);}
    if (payload.status !== undefined) {setStatus(payload.status);}
    if (payload.comunidadId !== undefined) {setComunidadId(payload.comunidadId);}
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
      <Head><title>Proveedores — Cuentas Claras</title></Head>
      <Layout>
        <div className="providers-container">
          <div className="categories-header">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h1 className="categories-title">
                  <span className="material-icons me-2">business</span>
                  Lista de Proveedores
                </h1>
                <p className="categories-subtitle">
                  Gestiona y administra todos los proveedores de la comunidad
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="light" onClick={() => router.push('/proveedores/nuevo')}>
                  <span className="material-icons me-2">add</span>
                  Nuevo Proveedor
                </Button>
              </div>
            </div>
          </div>
          
          {/* filtros */}
          <ProviderFilters
            search={search}
            status={status}
            comunidades={comunidades}
            comunidadId={comunidadId}
            onChange={handleFiltersChange}
            onClear={() => { setSearch(''); setStatus(''); setComunidadId(null); }}
          />

          {/* Toggle de vista MOVIDO: fuera del header, alineado a la derecha */}
          <div className="d-flex justify-content-end mb-3">
            <div className="btn-group" role="group" aria-label="view-mode">
              <Button variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('grid')}>
                <span className="material-icons">grid_view</span>
              </Button>
              <Button variant={viewMode === 'list' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setViewMode('list')}>
                <span className="material-icons">view_list</span>
              </Button>
            </div>
          </div>

          <ProviderStats total={stats.total} active={stats.active} totalGastos={stats.totalGastos} montoTotal={stats.montoTotal} />

          {viewMode === 'list' ? (
            <ProviderTable providers={providers} loading={loading} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
          ) : (
            <ProviderCard providers={providers} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
          )}

          {pagination.pages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">Mostrando página {pagination.page} de {pagination.pages}</span>
              <nav>...</nav>
            </div>
          )}

          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton><Modal.Title className="text-danger"><span className="material-icons me-2">delete</span>Eliminar Proveedor</Modal.Title></Modal.Header>
            <Modal.Body>
              {selectedProvider && (
                <>
                  <div className="alert alert-danger"><span className="material-icons me-2">warning</span>Esta acción no se puede deshacer.</div>
                  <p>¿Eliminar proveedor <strong>{selectedProvider.nombre}</strong>?</p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
