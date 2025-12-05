import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useComunidad } from '@/lib/useComunidad';
import {
  usePermissions,
  ProtectedPage,
  UserRole,
  Permission,
} from '@/lib/usePermissions';
import type { CentroCosto } from '@/types/centrosCosto';

export default function CentrosCostoListado() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isSuperUser, hasPermission, hasRoleInCommunity } = usePermissions();
  const { comunidadSeleccionada } = useComunidad();

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

  // Resolver comunidad usando selector global o user.comunidad_id; permitir global para superuser
  const resolvedComunidadId = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return undefined;
    }
    if (comunidadSeleccionada && comunidadSeleccionada.id) {
      return Number(comunidadSeleccionada.id);
    }
    return user?.comunidad_id ?? undefined;
  }, [isSuperUser, comunidadSeleccionada, user?.comunidad_id]);

  // Bloquear acceso si el usuario tiene rol básico
  const isBasicRoleInCommunity = useMemo(() => {
    if (typeof isSuperUser === 'function' ? isSuperUser() : isSuperUser) {
      return false;
    }

    if (resolvedComunidadId) {
      return (
        hasRoleInCommunity(Number(resolvedComunidadId), 'residente') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'propietario') ||
        hasRoleInCommunity(Number(resolvedComunidadId), 'inquilino')
      );
    }

    const memberships = user?.memberships || [];
    if (memberships.length === 0) {
      return false;
    }

    const hasNonBasicRole = memberships.some((m: any) => {
      const rol = (m.rol || '').toLowerCase();
      return rol !== 'residente' && rol !== 'propietario' && rol !== 'inquilino';
    });

    return !hasNonBasicRole;
  }, [resolvedComunidadId, isSuperUser, hasRoleInCommunity, user?.memberships]);

  const loadCentros = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await listCentros(resolvedComunidadId);
      // eslint-disable-next-line no-console
      console.log('API Response:', response);
      
      // Si response es un array directo, usarlo directamente
      const centrosData = Array.isArray(response) ? response : response.data || [];
      setCentros(centrosData);
      
      // Si viene con paginación, usarla; si no, calcular valores por defecto
      if (!Array.isArray(response) && response.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination({
          total: centrosData.length,
          page: 1,
          limit: centrosData.length,
          pages: 1,
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error loading centros:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedComunidadId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCentros();
    }
  }, [authLoading, isAuthenticated, loadCentros, resolvedComunidadId]);

  // Si tiene rol básico, mostrar Acceso Denegado
  if (isBasicRoleInCommunity) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className='container-fluid'>
            <div className='row justify-content-center align-items-center min-vh-100'>
              <div className='col-12 col-md-8 col-lg-6'>
                <div className='card shadow-lg border-0'>
                  <div className='card-body text-center p-5'>
                    <div className='mb-4'>
                      <span className='material-icons text-danger' style={{ fontSize: '80px' }}>
                        block
                      </span>
                    </div>
                    <h2 className='card-title mb-3'>Acceso Denegado</h2>
                    <p className='card-text text-muted mb-4'>
                      No tienes permisos para ver Centros de Costo en la comunidad seleccionada.
                      <br />
                      Solo usuarios con roles administrativos pueden acceder a esta sección.
                    </p>
                    <div className='d-flex gap-2 justify-content-center'>
                      <button
                        type='button'
                        className='btn btn-primary'
                        onClick={() => router.back()}
                      >
                        <span className='material-icons align-middle me-1'>arrow_back</span>
                        Volver Atrás
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline-primary'
                        onClick={() => router.push('/dashboard')}
                      >
                        <span className='material-icons align-middle me-1'>home</span>
                        Ir al Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const handleEditCenter = (id: number) => {
    router.push(`/centros-costo/editar/${id}`);
  };

  const handleDeleteCentro = (centro: CentroCosto) => {
    setSelectedCentro(centro);
    setShowDeleteModal(true);
  };

  // Wrappers que respetan permisos: evitan error de tipos y muestran alerta si no hay permiso
  const canEdit = hasPermission(Permission.EDIT_CENTRO_COSTO, resolvedComunidadId);
  const canDelete = hasPermission(Permission.DELETE_CENTRO_COSTO, resolvedComunidadId);
  const handleEditWrapper = (id: number) => {
    if (!canEdit) {
      alert('No tienes permiso para editar en la comunidad seleccionada');
      return;
    }
    handleEditCenter(id);
  };
  const handleDeleteWrapper = (centro: CentroCosto) => {
    if (!canDelete) {
      alert('No tienes permiso para eliminar en la comunidad seleccionada');
      return;
    }
    handleDeleteCentro(centro);
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
      // eslint-disable-next-line no-console
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

  const filteredCentros = (centros || []).filter(c => {
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
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Centros de Costo — Cuentas Claras</title>
        </Head>

        <Layout title='Centros de Costo'>
        {/* Header Profesional */}
        <div className='container-fluid p-0'>
          <div
            className='text-white'
            style={{
              background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
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
                    account_balance
                  </i>
                </div>
                <div>
                  <h1 className='h2 mb-1 text-white'>Centros de Costo</h1>
                  <p className='mb-0 opacity-75'>
                    Gestión de centros de costo
                  </p>
                </div>
              </div>
              {hasPermission(Permission.CREATE_CENTRO_COSTO, resolvedComunidadId) && (
                <div className='text-end'>
                  <Button
                    variant='light'
                    onClick={() => router.push('/centros-costo/nuevo')}
                    className='btn-lg'
                  >
                    <i className='material-icons me-2'>add</i>
                    Nuevo Centro
                  </Button>
                </div>
              )}
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
                      <i className='material-icons'>account_balance</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>{pagination.total}</div>
                      <div className='text-white-50'>Total Centros</div>
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
                      <div className='h3 mb-0'>{filteredCentros.length}</div>
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
                      <i className='material-icons'>trending_up</i>
                    </div>
                    <div>
                      <div className='h3 mb-0'>0</div>
                      <div className='text-white-50'>Presupuesto Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className='cost-centers-container'>

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
              onEdit={handleEditWrapper}
              onDelete={handleDeleteWrapper}
            />
          ) : (
            <CentroCard
              centros={filteredCentros}
              onEdit={handleEditWrapper}
              onDelete={handleDeleteWrapper}
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
    </ProtectedPage>
  </ProtectedRoute>
);
}
