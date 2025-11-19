/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import ModernPagination from '@/components/ui/ModernPagination';
import PageHeader from '@/components/ui/PageHeader';
import type { TarifaConsumo } from '@/lib/tarifasConsumoService';
import { listAllTarifasConsumo, deleteTarifaConsumo } from '@/lib/tarifasConsumoService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';

export default function TarifasListado() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [tarifas, setTarifas] = useState<TarifaConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('todas');
  const [selectedTarifa, setSelectedTarifa] = useState<TarifaConsumo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadTarifas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const loadTarifas = async () => {
    try {
      setLoading(true);
      const resp = await listAllTarifasConsumo();
      setTarifas(resp.data || []);
    } catch (err) {
      console.error('Error loading tarifas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTarifas = tarifas.filter(tarifa => {
    const matchesSearch = 
      (tarifa.tipo_consumo?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (tarifa.unidad_medida?.toLowerCase() || '').includes(search.toLowerCase());
    
    const matchesStatus = 
      filterType === 'todas' ||
      (filterType === 'activas' && tarifa.activo === 1) ||
      (filterType === 'inactivas' && tarifa.activo === 0);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const paginatedTarifas = filteredTarifas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Update pagination when filteredTarifas change
  useEffect(() => {
    const totalPages = Math.ceil(filteredTarifas.length / itemsPerPage);
    setTotalPages(totalPages);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredTarifas.length, itemsPerPage, currentPage]);

  const handleCreate = () => router.push('/parametros/nueva');
  const handleEdit = (id: number) => router.push(`/parametros/${id}`);
  const handleDelete = (tarifa: TarifaConsumo) => {
    setSelectedTarifa(tarifa);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTarifa) {
      return;
    }
    
    try {
      setDeleting(true);
      await deleteTarifaConsumo(selectedTarifa.id);
      setTarifas(tarifas.filter(t => t.id !== selectedTarifa.id));
      setShowDeleteModal(false);
      setSelectedTarifa(null);
    } catch (err) {
      console.error('Error deleting tarifa:', err);
      alert('Error al eliminar la tarifa');
    } finally {
      setDeleting(false);
    }
  };

  const getServiceIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'Electricidad': 'bolt',
      'Agua': 'water_drop',
      'Gas': 'local_gas_station',
    };
    return icons[tipo] || 'attach_money';
  };

  const getServiceColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Electricidad': 'text-warning',
      'Agua': 'text-info',
      'Gas': 'text-danger',
    };
    return colors[tipo] || 'text-secondary';
  };

  const stats = {
    total: tarifas.length,
    activas: tarifas.filter(t => t.activo === 1).length,
    inactivas: tarifas.filter(t => t.activo === 0).length,
  };

  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Tarifas de Consumo — Cuentas Claras</title>
        </Head>

        <Layout title='Tarifas de Consumo'>
          <div className='container-fluid p-4'>
            <PageHeader
              title="Tarifas de Consumo"
              subtitle="Gestión de tarifas por tipo de servicio"
              icon="attach_money"
              primaryAction={{
                href: '/parametros/nueva',
                label: 'Nueva Tarifa',
                icon: 'add',
              }}
              stats={[
                {
                  label: 'Total',
                  value: stats.total.toString(),
                  icon: 'attach_money',
                  color: '#007bff',
                },
                {
                  label: 'Activas',
                  value: stats.activas.toString(),
                  icon: 'check_circle',
                  color: '#28a745',
                },
                {
                  label: 'Inactivas',
                  value: stats.inactivas.toString(),
                  icon: 'cancel',
                  color: '#dc3545',
                },
              ]}
            >
              <Button 
                variant='outline-primary' 
                onClick={() => alert('Funcionalidad de importar en desarrollo')}
              >
                <i className='material-icons me-1'>file_upload</i>
                Importar
              </Button>
            </PageHeader>

            {/* Filtros y búsqueda */}
            <div className='row mb-4'>
              <div className='col-12'>
                <div className='card border-0 shadow-sm'>
                  <div className='card-body'>
                    <div className='row align-items-center'>
                      <div className='col-lg-8'>
                        <div className='d-flex flex-wrap gap-2'>
                          <button
                            className={`btn btn-sm ${filterType === 'todas' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setFilterType('todas')}
                          >
                            <i className='material-icons me-1'>check_circle</i>
                            Todas ({stats.total})
                          </button>
                          <button
                            className={`btn btn-sm ${filterType === 'activas' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setFilterType('activas')}
                          >
                            <i className='material-icons me-1'>check_circle</i>
                            Activas ({stats.activas})
                          </button>
                          <button
                            className={`btn btn-sm ${filterType === 'inactivas' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setFilterType('inactivas')}
                          >
                            <i className='material-icons me-1'>cancel</i>
                            Inactivas ({stats.inactivas})
                          </button>
                        </div>
                      </div>
                      <div className='col-lg-4'>
                        <div className='input-group'>
                          <span className='input-group-text bg-light border-0'>
                            <i className='material-icons text-muted'>search</i>
                          </span>
                          <input
                            type='text'
                            className='form-control bg-light border-0'
                            placeholder='Buscar tarifas...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className='row mb-4'>
              <div className='col-6 col-lg-3'>
                <div className='card border-0 bg-white shadow-sm'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='flex-grow-1'>
                        <p className='text-muted mb-1'>Total Tarifas</p>
                        <h5 className='mb-0'>{stats.total}</h5>
                      </div>
                      <div>
                        <i className='material-icons text-primary' style={{ fontSize: '2rem' }}>
                          attach_money
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-6 col-lg-3'>
                <div className='card border-0 bg-white shadow-sm'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='flex-grow-1'>
                        <p className='text-muted mb-1'>Activas</p>
                        <h5 className='mb-0 text-success'>{stats.activas}</h5>
                      </div>
                      <div>
                        <i className='material-icons text-success' style={{ fontSize: '2rem' }}>
                          check_circle
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-6 col-lg-3'>
                <div className='card border-0 bg-white shadow-sm'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='flex-grow-1'>
                        <p className='text-muted mb-1'>Inactivas</p>
                        <h5 className='mb-0 text-danger'>{stats.inactivas}</h5>
                      </div>
                      <div>
                        <i className='material-icons text-danger' style={{ fontSize: '2rem' }}>
                          cancel
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-6 col-lg-3'>
                <div className='card border-0 bg-white shadow-sm'>
                  <div className='card-body'>
                    <div className='d-flex align-items-center'>
                      <div className='flex-grow-1'>
                        <p className='text-muted mb-1'>Última actualización</p>
                        <h6 className='mb-0'>Hoy</h6>
                      </div>
                      <div>
                        <i className='material-icons text-info' style={{ fontSize: '2rem' }}>
                          update
                        </i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className='row'>
              <div className='col-12'>
                <div className='card border-0 shadow-sm'>
                  {loading ? (
                    <div className='card-body text-center py-5'>
                      <div className='spinner-border text-primary' role='status'>
                        <span className='visually-hidden'>Cargando...</span>
                      </div>
                    </div>
                  ) : filteredTarifas.length === 0 ? (
                    <div className='card-body text-center py-5'>
                      <i className='material-icons' style={{ fontSize: '3rem', color: '#ccc' }}>
                        inbox
                      </i>
                      <p className='text-muted mt-3'>No hay tarifas para mostrar</p>
                    </div>
                  ) : (
                    <div className='table-responsive'>
                      <table className='table table-hover align-middle mb-0'>
                        <thead className='bg-light'>
                          <tr>
                            <th>Servicio</th>
                            <th>Tipo de Consumo</th>
                            <th>Unidad</th>
                            <th>Vigencia</th>
                            <th>Valor Unitario</th>
                            <th>Estado</th>
                            <th className='text-end'>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedTarifas.map((tarifa) => (
                            <tr key={tarifa.id}>
                              <td>
                                <div className='d-flex align-items-center'>
                                  <i className={`material-icons me-2 ${getServiceColor(tarifa.tipo_consumo)}`}>
                                    {getServiceIcon(tarifa.tipo_consumo)}
                                  </i>
                                  <span>{tarifa.tipo_consumo}</span>
                                </div>
                              </td>
                              <td>
                                <div className='fw-medium'>{tarifa.tipo_consumo}</div>
                              </td>
                              <td>{tarifa.unidad_medida}</td>
                              <td>
                                <small className='text-muted'>
                                  Desde {new Date(tarifa.vigencia_desde).toLocaleDateString('es-CL')}
                                </small>
                              </td>
                              <td className='fw-medium'>
                                ${(tarifa.valor_unitario || 0).toLocaleString('es-CL')}
                              </td>
                              <td>
                                <span
                                  className={`badge ${tarifa.activo === 1 ? 'bg-success' : 'bg-secondary'}`}
                                >
                                  {tarifa.activo === 1 ? 'Activa' : 'Inactiva'}
                                </span>
                              </td>
                              <td className='text-end'>
                                <div className='btn-group btn-group-sm' role='group'>
                                  <button
                                    className='btn btn-outline-primary'
                                    onClick={() => handleEdit(tarifa.id)}
                                    title='Editar'
                                  >
                                    <i className='material-icons'>edit</i>
                                  </button>
                                  <button
                                    className='btn btn-outline-danger'
                                    onClick={() => handleDelete(tarifa)}
                                    title='Eliminar'
                                  >
                                    <i className='material-icons'>delete</i>
                                  </button>
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <ModernPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTarifas.length}
                itemsPerPage={itemsPerPage}
                itemName="tarifas"
                onPageChange={goToPage}
              />
            )}
          </div>
        </Layout>

        {/* Modal de confirmación de eliminación */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar Tarifa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedTarifa && (
              <>
                <div className='alert alert-danger'>
                  <i className='material-icons me-2'>warning</i>
                  Esta acción no se puede deshacer.
                </div>
                <p>
                  ¿Eliminar tarifa <strong>{selectedTarifa.tipo_consumo}</strong>?
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='outline-secondary'
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant='danger'
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm me-2'
                    role='status'
                    aria-hidden='true'
                  />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </ProtectedPage>
    </ProtectedRoute>
  );
}
