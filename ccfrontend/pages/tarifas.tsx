/* eslint-disable max-len */
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Agrega Form

import Layout from '@/components/layout/Layout';
import { listTarifasConsumo, listAllTarifasConsumo, createTarifaConsumo } from '@/lib/tarifasConsumoService'; // Agrega createTarifaConsumo
import { ProtectedRoute } from '@/lib/useAuth';
import { useAuth } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';
import { usePermissions } from '@/lib/usePermissions';

import styles from '../styles/tarifas.module.css';

export default function TarifasListado() {
  const { user } = useAuth();
  const { isSuperUser } = usePermissions();
  const isSuper = !!user?.is_superadmin;

  // Estados para modales
  const [showImport, setShowImport] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showCreate, setShowCreate] = useState(false); // Nuevo estado para modal crear

  // Estados para datos dinámicos
  const [tarifas, setTarifas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [selectedComunidad, setSelectedComunidad] = useState<any | null>(null);

  // Estado para formulario crear
  const [newTarifa, setNewTarifa] = useState({
    comunidad_id: '',
    tipo: 'agua',
    precio_por_unidad: '',
    periodo_desde: '',
    cargo_fijo: '',
  });

  // Filtros dinámicos
  const [filterEstado, setFilterEstado] = useState('');
  const [filterServicio, setFilterServicio] = useState('');
  const [search, setSearch] = useState('');

  // Tipos de tarifa simulados (puedes cargarlos del backend si es necesario)
  type Tramo = { min: number; max: number | null; precio: number };
  type Estacional = { estacion: string; precio: number };
  type Tarifa = {
    id: number;
    nombre: string;
    tipo: 'Fija' | 'Por Tramos' | 'Estacional';
    servicio: 'electric' | 'water' | 'gas';
    estado: 'Activa' | 'Pendiente' | 'Inactiva';
    precio: number;
    unidad: string;
    fecha: string;
    estructura: Tramo[] | Estacional[] | null;
  };

  // Cargar comunidades para selector (superadmin)
  useEffect(() => {
    if (!isSuper) {
      return undefined;
    }
    let mounted = true;
    (async () => {
      try {
        const resp = await fetch('/comunidades');
        const data = await resp.json();
        if (!mounted) {
          return;
        }
        setComunidades(data || []);
      } catch (err) { /* empty */ }
    })();
    return () => {
      mounted = false;
    };
  }, [isSuper]);

  // Cargar tarifas dinámicamente
  useEffect(() => {
    if (!user) {
      return undefined;
    }
    let mounted = true;
    const loadTarifas = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {
          estado: filterEstado || undefined,
          servicio: filterServicio || undefined,
          busqueda: search || undefined,
        };

        let resp;
        if (isSuper) {
          if (selectedComunidad?.id) {
            resp = await listTarifasConsumo(selectedComunidad.id, params);
          } else {
            resp = await listAllTarifasConsumo(params);
          }
        } else {
          const comunidadId = user.memberships?.[0]?.comunidadId;
          if (!comunidadId) {
            setError('No tienes comunidades asignadas.');
            return;
          }
          resp = await listTarifasConsumo(comunidadId, params);
        }

        if (!mounted) {
          return;
        }
        setTarifas(resp.data || []);
      } catch (err: any) {
        if (!mounted) {
          return;
        }
        setError(err.response?.data?.error || 'Error cargando tarifas');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadTarifas();
    return () => {
      mounted = false;
    };
  }, [user, isSuper, selectedComunidad, filterEstado, filterServicio, search]);

  // Función para mapear datos del backend a la estructura de la UI
  const mapTarifaToUI = (tarifa: any): Tarifa => {
    const servicio = tarifa.servicio || 'desconocido'; // Usa 'servicio' en lugar de 'tipo'
    const fecha = tarifa.fecha_vigencia || 'N/A'; // Usa 'fecha_vigencia' en lugar de 'periodo_desde'
    return {
      id: tarifa.id || 0,
      nombre: `${servicio.charAt(0).toUpperCase() + servicio.slice(1)} (${fecha})`, // Ej: Agua (2025-09)
      tipo: 'Fija', // Asumido; ajusta si el backend soporta otros tipos
      servicio: servicio === 'agua' ? 'water' : servicio === 'gas' ? 'gas' : 'electric', // Mapea a clases CSS
      estado: tarifa.estado || 'Inactiva', // Usa 'estado' del backend
      precio: tarifa.precio_por_unidad || 0, // Asegúrate de que el backend lo devuelva
      unidad: tarifa.unidad || 'unidad',
      fecha,
      estructura: null,
    };
  };

  // Aviso si usuario no es superadmin y no tiene comunidades
  const hasMemberships = user?.memberships && user.memberships.length > 0;
  if (!isSuper && !hasMemberships) {
    return (
      <Layout title='Tarifas de Consumo'>
        <div className='alert alert-warning'>
          No estás asignado a ninguna comunidad. Contacta al administrador para asignar tu rol/comunidad.
        </div>
      </Layout>
    );
  }

  // Función para crear tarifa
  const handleCreateTarifa = async () => {
    const comunidadId = isSuper ? parseInt(newTarifa.comunidad_id) : user.memberships[0].comunidadId;
    try {
      await createTarifaConsumo(comunidadId, { // Pasa comunidadId como primer parámetro
        tipo: newTarifa.tipo,
        precio_por_unidad: parseFloat(newTarifa.precio_por_unidad),
        periodo_desde: newTarifa.periodo_desde,
        cargo_fijo: parseFloat(newTarifa.cargo_fijo) || 0,
      });
      setShowCreate(false);
      // Recargar tarifas
      window.location.reload(); // O usa un estado para recargar
      alert('Tarifa creada exitosamente');
    } catch (err) {
      alert('Error creando tarifa');
    }
  };

  return (
    <ProtectedRoute>
      <ProtectedPage allowedRoles={[
             'Superadmin',
             'admin_comunidad',
             'conserje',
             'contador',
             'tesorero',
             'presidente_comite',
             'residente',
             'propietario',
             'inquilino',
           ]}>
        <Head>
          <title>Tarifas de Consumo — Cuentas Claras</title>
        </Head>
        <Layout title='Tarifas de Consumo'>
          <div className='container-fluid p-4'>
            <div className='row'>
              <div className='col-12'>
                {/* Encabezado */}
                <div className='d-flex justify-content-between align-items-center mb-4'>
                  <h1 className='h3'>Tarifas de Consumo</h1>
                  <div className='d-flex gap-2'>
                    <button className='btn btn-outline-secondary' onClick={() => setShowImport(true)}>
                      <span className='material-icons me-1'>file_upload</span> Importar
                    </button>
                    <button className='btn btn-primary' onClick={() => setShowCreate(true)}> {/* Conecta el botón */}
                      <span className='material-icons me-2'>add</span> Nueva Tarifa
                    </button>
                  </div>
                </div>

                {/* Selector de comunidad para superadmin */}
                {isSuper && (
                  <div className='mb-3'>
                    <label className='form-label'>Comunidad</label>
                    <select
                      className='form-select'
                      value={selectedComunidad?.id || ''}
                      onChange={(e) => {
                        const id = parseInt(e.target.value, 10);
                        const comunidad = comunidades.find((c) => c.id === id);
                        setSelectedComunidad(comunidad || null);
                      }}
                    >
                      <option value=''>Todas las comunidades</option>
                      {comunidades.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtros funcionales */}
                <div className={`${styles['filters-panel']} mb-4`}>
                  <input
                    type='text'
                    placeholder='Buscar...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='form-control me-2'
                  />
                  <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className='form-select me-2'>
                    <option value=''>Todos los estados</option>
                    <option value='Activa'>Activa</option>
                    <option value='Pendiente'>Pendiente</option>
                    <option value='Inactiva'>Inactiva</option>
                  </select>
                  <select value={filterServicio} onChange={(e) => setFilterServicio(e.target.value)} className='form-select me-2'>
                    <option value=''>Todos los servicios</option>
                    <option value='electric'>Eléctrico</option>
                    <option value='water'>Agua</option>
                    <option value='gas'>Gas</option>
                  </select>
                  <button className='btn btn-sm btn-outline-primary float-end' onClick={() => alert('Exportando tarifas a Excel...')}>
                    <span className='material-icons me-1'>file_download</span> Exportar
                  </button>
                </div>

                {/* Loading y Error */}
                {loading && <div className='text-center'>Cargando tarifas...</div>}
                {error && <div className='alert alert-danger'>{error}</div>}

                {/* Listado de tarifas */}
                {!loading && !error && (
                  <div>
                    {tarifas.length === 0 ? (
                      <div>No hay tarifas disponibles.</div> // Mensaje si no hay datos
                    ) : (
                      tarifas.map((tarifa) => {
                        const uiTarifa = mapTarifaToUI(tarifa);
                        return (
                          <div key={uiTarifa.id} className={`${styles['tariff-card']} mb-3 ${uiTarifa.servicio}`}>
                            <div className={`${styles['tariff-header']} d-flex justify-content-between align-items-start`}>
                              <div>
                                <div className={styles['tariff-title']}>{uiTarifa.nombre}</div>
                                <div className={styles['tariff-subtitle']}>Desde {uiTarifa.fecha}</div>
                                <span className={`${styles['type-badge']} ${styles[`type-${uiTarifa.tipo.toLowerCase().replace(' ', '-')}`]}`}>
                                  {uiTarifa.tipo}
                                </span>
                                <span className={`${styles['status-badge']} ${styles[`status-${uiTarifa.estado.toLowerCase()}`]}`}>
                                  {uiTarifa.estado}
                                </span>
                              </div>
                              <div className='text-end'>
                                {uiTarifa.tipo === 'Fija' && (
                                  <>
                                    <div className={styles['tariff-price']}>${uiTarifa.precio.toLocaleString('es-CL')}</div>
                                    <div className={styles['tariff-unit']}>por {uiTarifa.unidad}</div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className='mt-2 d-flex gap-2'>
                              <button className='btn btn-sm btn-outline-primary'>Editar</button>
                              <button className='btn btn-sm btn-outline-secondary' onClick={() => setShowDuplicate(true)}>Duplicar</button>
                              <button className='btn btn-sm btn-outline-danger'>Eliminar</button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Importar */}
          <Modal show={showImport} onHide={() => setShowImport(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Importar Tarifas</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className='mb-3'>
                  <label className='form-label'>Archivo Excel</label>
                  <input
                    type='file'
                    className='form-control'
                    accept='.xlsx,.xls'
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='outline-secondary'>Descargar Plantilla</Button>
              <Button variant='secondary' onClick={() => setShowImport(false)}>
                Cancelar
              </Button>
              <Button variant='primary'>Importar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal Duplicar */}
          <Modal
            show={showDuplicate}
            onHide={() => setShowDuplicate(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Duplicar Tarifa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className='mb-3'>
                  <label className='form-label'>Nombre de la nueva tarifa</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Ej: Tarifa Residencial Copia'
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setShowDuplicate(false)}>
                Cancelar
              </Button>
              <Button variant='primary'>Duplicar Tarifa</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal Crear Tarifa */}
          <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Crear Nueva Tarifa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {isSuper && (
                  <Form.Group className='mb-3'>
                    <Form.Label>Comunidad</Form.Label>
                    <Form.Select
                      value={newTarifa.comunidad_id}
                      onChange={(e) => setNewTarifa({ ...newTarifa, comunidad_id: e.target.value })}
                    >
                      <option value=''>Seleccionar comunidad</option>
                      {comunidades.map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
                <Form.Group className='mb-3'>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    value={newTarifa.tipo}
                    onChange={(e) => setNewTarifa({ ...newTarifa, tipo: e.target.value })}
                  >
                    <option value='agua'>Agua</option>
                    <option value='gas'>Gas</option>
                    <option value='electricidad'>Electricidad</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Precio por Unidad</Form.Label>
                  <Form.Control
                    type='number'
                    value={newTarifa.precio_por_unidad}
                    onChange={(e) => setNewTarifa({ ...newTarifa, precio_por_unidad: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Período Desde</Form.Label>
                  <Form.Control
                    type='date'
                    value={newTarifa.periodo_desde}
                    onChange={(e) => setNewTarifa({ ...newTarifa, periodo_desde: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Cargo Fijo (opcional)</Form.Label>
                  <Form.Control
                    type='number'
                    value={newTarifa.cargo_fijo}
                    onChange={(e) => setNewTarifa({ ...newTarifa, cargo_fijo: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button variant='primary' onClick={handleCreateTarifa}>
                Crear Tarifa
              </Button>
            </Modal.Footer>
          </Modal>
        </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
}
