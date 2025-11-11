/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import Layout from '@/components/layout/Layout';
import type { TarifaConsumo } from '@/lib/tarifasConsumoService';
import { getTarifaConsumo, updateTarifaConsumo } from '@/lib/tarifasConsumoService';
import { ProtectedRoute, useAuth } from '@/lib/useAuth';
import { ProtectedPage, UserRole } from '@/lib/usePermissions';

export default function EditarTarifa() {
  const router = useRouter();
  const { id } = router.query;
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [tarifa, setTarifa] = useState<TarifaConsumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [valor, setValor] = useState('');
  const [activo, setActivo] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadTarifa(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTarifa = async (tarifaId: number) => {
    try {
      setLoading(true);
      const resp = await getTarifaConsumo(tarifaId);
      setTarifa(resp.data);
      setValor(resp.data.valor_unitario.toString());
      setActivo(resp.data.activo);
    } catch (err) {
      console.error('Error loading tarifa:', err);
      alert('Error al cargar la tarifa');
      router.push('/parametros');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tarifa) {
      return;
    }

    if (!valor || parseFloat(valor) <= 0) {
      alert('Ingresa un valor válido mayor a 0');
      return;
    }

    try {
      setSaving(true);
      await updateTarifaConsumo(tarifa.id, {
        valor_unitario: parseFloat(valor),
        activo,
      });
      alert('Tarifa actualizada exitosamente');
      router.push('/parametros');
    } catch (err) {
      console.error('Error updating tarifa:', err);
      alert('Error al actualizar la tarifa');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tarifa) {
    return (
      <ProtectedRoute>
        <ProtectedPage role={UserRole.ADMIN}>
          <Layout title='Editar Tarifa'>
            <div className='container-fluid p-4'>
              <div className='d-flex justify-content-center align-items-center' style={{ height: '400px' }}>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Cargando...</span>
                </div>
              </div>
            </div>
          </Layout>
        </ProtectedPage>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ProtectedPage role={UserRole.ADMIN}>
        <Head>
          <title>Editar Tarifa de Consumo — Cuentas Claras</title>
        </Head>

        <Layout title='Editar Tarifa de Consumo'>
          <div className='container-fluid p-4'>
            <div className='row justify-content-center'>
              <div className='col-12 col-lg-6'>
                <div className='card border-0 shadow-sm'>
                  <div className='card-body p-4'>
                    <h5 className='mb-4'>Editar tarifa: {tarifa.tipo_consumo}</h5>

                    <div className='mb-3'>
                      <label className='form-label'>Tipo de consumo</label>
                      <input
                        type='text'
                        className='form-control'
                        value={tarifa.tipo_consumo}
                        disabled
                      />
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>Unidad de medida</label>
                      <input
                        type='text'
                        className='form-control'
                        value={tarifa.unidad_medida}
                        disabled
                      />
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>Vigencia desde</label>
                      <input
                        type='date'
                        className='form-control'
                        value={tarifa.vigencia_desde.split('T')[0]}
                        disabled
                      />
                    </div>

                    <div className='mb-3'>
                      <label className='form-label'>Valor unitario *</label>
                      <input
                        type='number'
                        className='form-control'
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        min='0'
                        step='0.01'
                      />
                    </div>

                    <div className='mb-4'>
                      <label className='form-label'>Estado</label>
                      <select
                        className='form-select'
                        value={activo}
                        onChange={(e) => setActivo(parseInt(e.target.value))}
                      >
                        <option value={1}>Activa</option>
                        <option value={0}>Inactiva</option>
                      </select>
                    </div>

                    <div className='d-flex gap-2'>
                      <Button
                        variant='secondary'
                        onClick={() => router.push('/parametros')}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant='primary'
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span
                              className='spinner-border spinner-border-sm me-2'
                              role='status'
                              aria-hidden='true'
                            />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className='material-icons me-1'>save</i>
                            Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedPage>
    </ProtectedRoute>
  );
}
