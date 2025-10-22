import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import {
  CentroFilters,
  CentroStats,
  CentroTable,
  CentroCard,
} from '@/components/centros-costo';
import Layout from '@/components/layout/Layout';
import { listCentros, deleteCentro } from '@/lib/centrosCostoService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { usePermissions } from '@/lib/usePermissions';
import type { CentroCosto } from '@/types/centrosCosto';

export default function CentrosCostoListado() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser } = usePermissions();

  const [centros, setCentros] = useState<CentroCosto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // modal / selección
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<CentroCosto | null>(
    null,
  );

  // filtros locales
  const [search, setSearch] = useState('');
  const [comunidadId, setComunidadId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Comunidades (vacío por ahora — puedes cargar desde API si quieres)
  const comunidades = useMemo(() => [] as any[], []);

  // Siempre llamar al endpoint global (backend filtra por memberships)
  const resolvedComunidadId = useMemo(() => undefined, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCentros(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, pagination.page]);

  const loadCentros = async (page = 1) => {
    try {
      setLoading(true);
      const response = await listCentros(resolvedComunidadId);
      console.log('API Response:', response);
      setCentros(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error loading centros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCenter = (id: number) => {
    router.push(`/centros-costo/editar/${id}`);
  };

  const handleDeleteCentro = (centro: CentroCosto) => {
    setSelectedCentro(centro);
    setShowDeleteModal(true);
  };

  const confirmDeleteCentro = async () => {
    if (!selectedCentro) {
      return;
    }
    try {
      await deleteCentro(selectedCentro.id);
      setShowDeleteModal(false);
      setSelectedCentro(null);
      loadCentros(pagination.page);
    } catch (err) {
      console.error('Error deleting centro:', err);
    }
  };

  const handleFilterChange = (payload: {
    search?: string;
    comunidadId?: number | null;
  }) => {
    if (typeof payload.search !== 'undefined') {
      setSearch(payload.search);
    }
    if (typeof payload.comunidadId !== 'undefined') {
      setComunidadId(payload.comunidadId ?? null);
    }
    // Para filtrar en backend, pasar params a listCentros; ahora filtro en frontend.
  };

  const filteredCentros = centros.filter(c => {
    const matchSearch =
      !search || c.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCom =
      !comunidadId ||
      (c as any).comunidad_id === comunidadId ||
      c.comunidad === comunidades.find(x => x.id === comunidadId)?.razon_social;
    return matchSearch && matchCom;
  });

  return (
    <ProtectedRoute>
      <Head>
        <title>Centros de Costo — Cuentas Claras</title>
      </Head>

      <Layout>
        <div className='cost-centers-container'>
          {/* Header (duplicado de Categorías, incluye icono, título, descripción y botón) */}
          <div className='categories-header'>
            <div className='d-flex justify-content-between align-items-start mb-4'>
              <div>
                <h1 className='categories-title'>
                  <span className='material-icons me-2'>account_balance</span>
                  Centros de Costo
                </h1>
                <p className='categories-subtitle'>
                  Gestiona los centros de costo para el control presupuestario
                </p>
              </div>
              <Button
                variant='light'
                onClick={() => router.push('/centros-costo/nuevo')}
              >
                <span className='material-icons me-2'>add</span>
                Nuevo Centro de Costo
              </Button>
            </div>
          </div>

          <CentroFilters
            search={search}
            comunidadId={comunidadId}
            comunidades={comunidades}
            onChange={handleFilterChange}
            onClear={() => {
              setSearch('');
              setComunidadId(null);
            }}
          />

          <CentroStats
            total={pagination.total}
            active={filteredCentros.length}
            presupuestoTotal={0}
            ejecutado={0}
          />

          {viewMode === 'list' ? (
            <CentroTable
              centros={filteredCentros}
              loading={loading}
              onEdit={handleEditCenter}
              onDelete={handleDeleteCentro}
            />
          ) : (
            <CentroCard
              centros={filteredCentros}
              onEdit={handleEditCenter}
              onDelete={handleDeleteCentro}
            />
          )}

          {pagination.pages > 1 && (
            <div className='d-flex justify-content-between align-items-center mt-4'>
              <span className='text-muted'>
                Mostrando {pagination.page} de {pagination.pages} páginas
              </span>
              <nav>
                <ul className='pagination'>
                  <li
                    className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}
                  >
                    <button
                      className='page-link'
                      onClick={() =>
                        setPagination(prev => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                    >
                      <span className='material-icons'>chevron_left</span>
                    </button>
                  </li>
                  {Array.from({ length: pagination.pages }, (_, index) => (
                    <li
                      key={index + 1}
                      className={`page-item ${pagination.page === index + 1 ? 'active' : ''}`}
                    >
                      <button
                        className='page-link'
                        onClick={() =>
                          setPagination(prev => ({ ...prev, page: index + 1 }))
                        }
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}
                  >
                    <button
                      className='page-link'
                      onClick={() =>
                        setPagination(prev => ({
                          ...prev,
                          page: Math.min(pagination.pages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.pages}
                    >
                      <span className='material-icons'>chevron_right</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title className='text-danger'>
                <span className='material-icons me-2'>delete</span> Eliminar
                Centro de Costo
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                ¿Estás seguro de que deseas eliminar el centro de costo{' '}
                <strong>{selectedCentro?.nombre}</strong>?
              </p>
              <p className='text-muted'>Esta acción no se puede deshacer.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button variant='danger' onClick={confirmDeleteCentro}>
                Eliminar
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
