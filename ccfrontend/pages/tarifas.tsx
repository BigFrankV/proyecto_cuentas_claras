import Head from 'next/head';
import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import { ProtectedRoute } from '@/lib/useAuth';

import styles from '../styles/tarifas.module.css';

export default function TarifasListado() {
  // Estado para modales
  const [showImport, setShowImport] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);

  // Simulación de datos de tarifas
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

  const tarifas: Tarifa[] = [
    {
      id: 1,
      nombre: 'Tarifa Residencial Eléctrica',
      tipo: 'Fija',
      servicio: 'electric',
      estado: 'Activa',
      precio: 120,
      unidad: 'kWh',
      fecha: '2024-01-01',
      estructura: null,
    },
    {
      id: 2,
      nombre: 'Tarifa Agua Potable',
      tipo: 'Por Tramos',
      servicio: 'water',
      estado: 'Pendiente',
      precio: 0,
      unidad: 'L',
      fecha: '2024-03-01',
      estructura: [
        { min: 0, max: 10000, precio: 0.8 },
        { min: 10001, max: 20000, precio: 1.2 },
        { min: 20001, max: null, precio: 2.0 },
      ],
    },
    {
      id: 3,
      nombre: 'Tarifa Gas Invierno',
      tipo: 'Estacional',
      servicio: 'gas',
      estado: 'Inactiva',
      precio: 0,
      unidad: 'm³',
      fecha: '2024-05-01',
      estructura: [
        { estacion: 'Invierno', precio: 3.5 },
        { estacion: 'Verano', precio: 2.1 },
      ],
    },
  ];

  // Filtros simulados
  const filtros = [
    { label: 'Todas', value: 'todas' },
    { label: 'Activas', value: 'activa' },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Inactivas', value: 'inactiva' },
    { label: 'Eléctrico', value: 'electric' },
    { label: 'Agua', value: 'water' },
    { label: 'Gas', value: 'gas' },
  ];

  return (
    <ProtectedRoute>
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
                  <button
                    className='btn btn-outline-secondary'
                    onClick={() => setShowImport(true)}
                  >
                    <span className='material-icons me-1'>file_upload</span>{' '}
                    Importar
                  </button>
                  <button className='btn btn-primary'>
                    <span className='material-icons me-2'>add</span>
                    Nueva Tarifa
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className={`${styles['filters-panel']} mb-4`}>
                {filtros.map(f => (
                  <span key={f.value} className={styles['filter-chip']}>
                    {f.label}
                  </span>
                ))}
                <button
                  className='btn btn-sm btn-outline-primary float-end'
                  onClick={() => alert('Exportando tarifas a Excel...')}
                >
                  <span className='material-icons me-1'>file_download</span>{' '}
                  Exportar
                </button>
              </div>

              {/* Listado de tarifas (cards) */}
              <div>
                {tarifas.map(tarifa => (
                  <div
                    key={tarifa.id}
                    className={`${styles['tariff-card']} mb-3 ${tarifa.servicio}`}
                  >
                    <div
                      className={`${styles['tariff-header']} d-flex justify-content-between align-items-start`}
                    >
                      <div>
                        <div className={styles['tariff-title']}>
                          {tarifa.nombre}
                        </div>
                        <div className={styles['tariff-subtitle']}>
                          Desde {tarifa.fecha}
                        </div>
                        <span
                          className={`${styles['type-badge']} ${styles[`type-${tarifa.tipo.toLowerCase().replace(' ', '-')}`]}`}
                        >
                          {tarifa.tipo}
                        </span>{' '}
                        <span
                          className={`${styles['status-badge']} ${styles[`status-${tarifa.estado.toLowerCase()}`]}`}
                        >
                          {tarifa.estado}
                        </span>
                      </div>
                      <div className='text-end'>
                        {tarifa.tipo === 'Fija' && (
                          <>
                            <div className={styles['tariff-price']}>
                              ${tarifa.precio.toLocaleString('es-CL')}
                            </div>
                            <div className={styles['tariff-unit']}>
                              por {tarifa.unidad}
                            </div>
                          </>
                        )}
                        {tarifa.tipo === 'Por Tramos' &&
                          Array.isArray(tarifa.estructura) && (
                          <div className={styles['tier-structure']}>
                            {(tarifa.estructura as Tramo[]).map(
                              (tramo, idx) => (
                                <div
                                  key={idx}
                                  className={styles['tier-item']}
                                >
                                  <span className={styles['tier-range']}>
                                    {tramo.min} -{' '}
                                    {tramo.max !== null ? tramo.max : '∞'}{' '}
                                    {tarifa.unidad}
                                  </span>
                                  <span className={styles['tier-price']}>
                                      ${tramo.precio}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                        {tarifa.tipo === 'Estacional' &&
                          Array.isArray(tarifa.estructura) && (
                          <div className={styles['tier-structure']}>
                            {(tarifa.estructura as Estacional[]).map(
                              (est, idx) => (
                                <div
                                  key={idx}
                                  className={styles['tier-item']}
                                >
                                  <span className={styles['tier-range']}>
                                    {est.estacion}
                                  </span>
                                  <span className={styles['tier-price']}>
                                      ${est.precio}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='mt-2 d-flex gap-2'>
                      <button className='btn btn-sm btn-outline-primary'>
                        <span className='material-icons'>edit</span> Editar
                      </button>
                      <button
                        className='btn btn-sm btn-outline-secondary'
                        onClick={() => setShowDuplicate(true)}
                      >
                        <span className='material-icons'>content_copy</span>{' '}
                        Duplicar
                      </button>
                      <button className='btn btn-sm btn-outline-danger'>
                        <span className='material-icons'>delete</span> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
      </Layout>
    </ProtectedRoute>
  );
}
