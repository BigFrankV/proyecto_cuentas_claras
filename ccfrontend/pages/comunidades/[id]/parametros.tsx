import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import Layout from '../../../components/layout/Layout';
import comunidadesService from '../../../lib/comunidadesService';
import { ProtectedRoute } from '../../../lib/useAuth';
import {
  ParametrosCobranza,
  CuentaBancaria,
  MultaPredefinida,
  HistorialParametros,
} from '../../../types/comunidades';

interface ParametrosFormData {
  // Intereses y mora
  diasGracia: number;
  tasaMora: number;
  calculoInteres: 'diario' | 'mensual';
  interesMaximo: number;
  aplicacionInteres: 'capital' | 'saldo';
  tipoRedondeo: 'normal' | 'arriba' | 'abajo';

  // Políticas de pago
  politicaPago: 'antiguos' | 'recientes' | 'especificada';
  ordenAplicacion: 'interes-capital' | 'capital-interes';
  diaEmision: number;
  diaVencimiento: number;

  // Notificaciones
  notificacionesAuto: boolean;
  notificacion3Dias: boolean;
  notificacion1Dia: boolean;
  notificacionVencido: boolean;

  // Medios de pago
  pagoTransferencia: boolean;
  pagoWebpay: boolean;
  pagoKhipu: boolean;
  pagoEfectivo: boolean;

  // Cuenta bancaria
  cuentaBancaria?: CuentaBancaria;
}

export default function ParametrosCobranzaPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [comunidadNombre, setComunidadNombre] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);
  const [parametros, setParametros] = useState<ParametrosFormData>({
    diasGracia: 5,
    tasaMora: 2.5,
    calculoInteres: 'diario',
    interesMaximo: 5.0,
    aplicacionInteres: 'capital',
    tipoRedondeo: 'normal',
    politicaPago: 'antiguos',
    ordenAplicacion: 'interes-capital',
    diaEmision: 1,
    diaVencimiento: 10,
    notificacionesAuto: true,
    notificacion3Dias: true,
    notificacion1Dia: true,
    notificacionVencido: true,
    pagoTransferencia: true,
    pagoWebpay: true,
    pagoKhipu: false,
    pagoEfectivo: true,
    cuentaBancaria: {
      banco: 'banco-estado',
      tipoCuenta: 'corriente',
      numeroCuenta: '000123456789',
      rutTitular: '76.123.456-7',
      emailConfirmacion: 'pagos@laspalmas.cl',
    },
  });

  const [multas, setMultas] = useState<MultaPredefinida[]>([
    {
      id: 1,
      descripcion: 'Ruidos molestos',
      monto: 50000,
      activa: true,
      fechaCreacion: '2023-01-15',
    },
    {
      id: 2,
      descripcion: 'Estacionamiento en lugar no asignado',
      monto: 30000,
      activa: true,
      fechaCreacion: '2023-01-15',
    },
    {
      id: 3,
      descripcion: 'Incumplimiento reglamento interno',
      monto: 40000,
      activa: false,
      fechaCreacion: '2023-01-15',
    },
  ]);

  const historialEjemplo: HistorialParametros[] = [
    {
      id: 1,
      parametrosId: 1,
      fechaCambio: '12/08/2023 - 15:30',
      usuario: 'Patricia Contreras',
      accion: 'Modificación de tasa de interés',
      detalles: 'Tasa de mora mensual 3.0% → 2.5%',
    },
    {
      id: 2,
      parametrosId: 1,
      fechaCambio: '05/07/2023 - 10:15',
      usuario: 'Patricia Contreras',
      accion: 'Activación de notificaciones automáticas',
      detalles:
        'Habilitadas notificaciones 3 días antes, 1 día antes y el día del vencimiento',
    },
    {
      id: 3,
      parametrosId: 1,
      fechaCambio: '01/06/2023 - 09:00',
      usuario: 'Patricia Contreras',
      accion: 'Configuración inicial',
      detalles: 'Creación de parámetros iniciales de cobranza',
    },
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      if (id) {
        try {
          const comunidad = await comunidadesService.getComunidadById(
            Number(id),
          );
          setComunidadNombre(comunidad.nombre);

          // Cargar parámetros existentes o usar defaults
          const parametrosExistentes =
            await comunidadesService.getParametrosByComunidad(Number(id));
          if (parametrosExistentes) {
            setParametros(prev => ({ ...prev, ...parametrosExistentes }));
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error cargando datos:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    cargarDatos();
  }, [id]);

  const handleInputChange = (field: keyof ParametrosFormData, value: any) => {
    setParametros(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCuentaBancariaChange = (
    field: keyof CuentaBancaria,
    value: string,
  ) => {
    setParametros(prev => ({
      ...prev,
      cuentaBancaria: {
        banco: prev.cuentaBancaria?.banco || '',
        tipoCuenta: prev.cuentaBancaria?.tipoCuenta || 'corriente',
        numeroCuenta: prev.cuentaBancaria?.numeroCuenta || '',
        rutTitular: prev.cuentaBancaria?.rutTitular || '',
        emailConfirmacion: prev.cuentaBancaria?.emailConfirmacion || '',
        [field]: value,
      } as CuentaBancaria,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await comunidadesService.updateParametrosCobranza(Number(id), parametros);
      alert('Parámetros de cobranza actualizados correctamente');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error guardando parámetros:', error);
      alert('Error al guardar los parámetros');
    } finally {
      setSaving(false);
    }
  };

  const calcularEjemploInteres = () => {
    const capital = 100000;
    const diasAtraso = 20;
    const diasGraciaReal = parametros.diasGracia;
    const diasParaCalculo = Math.max(0, diasAtraso - diasGraciaReal);

    if (parametros.calculoInteres === 'diario') {
      const tasaDiaria = parametros.tasaMora / 30;
      const interes = capital * (tasaDiaria / 100) * diasParaCalculo;
      return {
        descripcion: `Interés diario: ${parametros.tasaMora}% / 30 = ${(parametros.tasaMora / 30).toFixed(3)}% diario`,
        calculo: `$${capital.toLocaleString('es-CL')} × ${(parametros.tasaMora / 30).toFixed(3)}% × (${diasAtraso} - ${diasGraciaReal}) = $${Math.round(interes).toLocaleString('es-CL')}`,
      };
    } else {
      const mesesAtraso = Math.ceil(diasParaCalculo / 30);
      const interes = capital * (parametros.tasaMora / 100) * mesesAtraso;
      return {
        descripcion: `Interés mensual: ${parametros.tasaMora}% por mes completo`,
        calculo: `$${capital.toLocaleString('es-CL')} × ${parametros.tasaMora}% × ${mesesAtraso} mes(es) = $${Math.round(interes).toLocaleString('es-CL')}`,
      };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Head>
          <title>Parámetros de Cobranza — Cuentas Claras</title>
        </Head>
        <Layout title='Parámetros de Cobranza'>
          <div
            className='d-flex justify-content-center align-items-center'
            style={{ height: '50vh' }}
          >
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Cargando...</span>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const ejemploCalculo = calcularEjemploInteres();

  return (
    <ProtectedRoute>
      <Head>
        <title>Parámetros de Cobranza — Cuentas Claras</title>
      </Head>

      <Layout title='Parámetros de Cobranza'>
        {/* Header con breadcrumbs y acciones */}
        <header className='bg-white border-bottom shadow-sm p-3'>
          <div className='container-fluid'>
            <div className='row align-items-center'>
              <div className='col-lg-8'>
                <div className='d-flex align-items-center'>
                  <button
                    onClick={() => router.back()}
                    className='btn btn-sm btn-outline-secondary me-3'
                  >
                    <span className='material-icons align-middle'>
                      arrow_back
                    </span>
                  </button>
                  <nav aria-label='breadcrumb'>
                    <ol className='breadcrumb mb-0'>
                      <li className='breadcrumb-item'>
                        <Link
                          href='/comunidades'
                          className='text-decoration-none'
                        >
                          Comunidades
                        </Link>
                      </li>
                      <li className='breadcrumb-item'>
                        <a
                          href={`/comunidades/${id}`}
                          className='text-decoration-none'
                        >
                          {comunidadNombre}
                        </a>
                      </li>
                      <li className='breadcrumb-item active'>
                        Parámetros de Cobranza
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
              <div className='col-lg-4 text-end'>
                <div className='d-flex align-items-center justify-content-end'>
                  <button
                    type='button'
                    className='btn btn-outline-primary me-2'
                    onClick={() => setShowHistorial(true)}
                  >
                    <span className='material-icons align-middle me-1'>
                      history
                    </span>{' '}
                    Ver historial
                  </button>
                  <button
                    type='submit'
                    form='formParametrosCobranza'
                    className='btn btn-primary'
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className='spinner-border spinner-border-sm me-1'
                          role='status'
                          aria-hidden='true'
                        ></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className='material-icons align-middle me-1'>
                          save
                        </span>{' '}
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className='container-fluid py-4'>
          <div className='row'>
            <div className='col-12 mb-4'>
              <h2 className='mb-1'>Parámetros de Cobranza</h2>
              <p className='text-muted'>
                Configuración de intereses, moras y políticas de pago para{' '}
                {comunidadNombre}
              </p>
            </div>
          </div>

          <form id='formParametrosCobranza' onSubmit={handleSubmit}>
            {/* Sección de Intereses y Mora */}
            <div className='param-section'>
              <div className='param-header'>
                <h4 className='mb-0'>
                  <span className='material-icons align-middle me-2'>
                    percent
                  </span>
                  Intereses y Mora
                </h4>
                <span className='badge bg-success'>Activo</span>
              </div>
              <div className='param-body'>
                <div className='param-description'>
                  Configure cómo se calculan los intereses por mora en los pagos
                  atrasados.
                </div>

                <div className='row mb-4'>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label htmlFor='diasGracia' className='form-label'>
                        Días de gracia
                      </label>
                      <div className='input-group'>
                        <input
                          type='number'
                          className='form-control'
                          id='diasGracia'
                          value={parametros.diasGracia}
                          min='0'
                          onChange={e =>
                            handleInputChange(
                              'diasGracia',
                              Number(e.target.value),
                            )
                          }
                        />
                        <span className='input-group-text'>días</span>
                      </div>
                      <div className='form-text'>
                        Período sin intereses después del vencimiento
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label htmlFor='tasaMora' className='form-label'>
                        Tasa de interés por mora
                      </label>
                      <div className='input-group'>
                        <input
                          type='number'
                          className='form-control'
                          id='tasaMora'
                          value={parametros.tasaMora}
                          step='0.1'
                          min='0'
                          onChange={e =>
                            handleInputChange(
                              'tasaMora',
                              Number(e.target.value),
                            )
                          }
                        />
                        <span className='input-group-text'>% mensual</span>
                      </div>
                      <div className='form-text'>
                        Interés mensual aplicado a pagos atrasados
                      </div>
                    </div>
                  </div>
                </div>

                <div className='row mb-4'>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label className='form-label'>Cálculo de interés</label>
                      <div className='form-check mb-2'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='calculoInteres'
                          id='calculoDiario'
                          checked={parametros.calculoInteres === 'diario'}
                          onChange={() =>
                            handleInputChange('calculoInteres', 'diario')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='calculoDiario'
                        >
                          Diario (prorrateado por días de atraso)
                        </label>
                      </div>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='calculoInteres'
                          id='calculoMensual'
                          checked={parametros.calculoInteres === 'mensual'}
                          onChange={() =>
                            handleInputChange('calculoInteres', 'mensual')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='calculoMensual'
                        >
                          Mensual (mes completo)
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label htmlFor='interesMaximo' className='form-label'>
                        Interés máximo mensual
                      </label>
                      <div className='input-group'>
                        <input
                          type='number'
                          className='form-control'
                          id='interesMaximo'
                          value={parametros.interesMaximo}
                          step='0.1'
                          min='0'
                          onChange={e =>
                            handleInputChange(
                              'interesMaximo',
                              Number(e.target.value),
                            )
                          }
                        />
                        <span className='input-group-text'>%</span>
                      </div>
                      <div className='form-text'>
                        Límite máximo de interés por mes
                      </div>
                    </div>
                  </div>
                </div>

                <div className='row mb-2'>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label className='form-label'>
                        Aplicación del interés sobre
                      </label>
                      <div className='form-check mb-2'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='aplicacionInteres'
                          id='aplicacionCapital'
                          checked={parametros.aplicacionInteres === 'capital'}
                          onChange={() =>
                            handleInputChange('aplicacionInteres', 'capital')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='aplicacionCapital'
                        >
                          Capital inicial
                        </label>
                      </div>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='aplicacionInteres'
                          id='aplicacionSaldo'
                          checked={parametros.aplicacionInteres === 'saldo'}
                          onChange={() =>
                            handleInputChange('aplicacionInteres', 'saldo')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='aplicacionSaldo'
                        >
                          Saldo total (incluye intereses previos)
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label htmlFor='tipoRedondeo' className='form-label'>
                        Redondeo de montos
                      </label>
                      <select
                        className='form-select'
                        id='tipoRedondeo'
                        value={parametros.tipoRedondeo}
                        onChange={e =>
                          handleInputChange(
                            'tipoRedondeo',
                            e.target.value as 'normal' | 'arriba' | 'abajo',
                          )
                        }
                      >
                        <option value='normal'>Normal (matemático)</option>
                        <option value='arriba'>Hacia arriba</option>
                        <option value='abajo'>Hacia abajo</option>
                      </select>
                      <div className='form-text'>
                        Tipo de redondeo aplicado a intereses calculados
                      </div>
                    </div>
                  </div>
                </div>

                <div className='calculation-example'>
                  <div className='fw-bold mb-1'>Ejemplo de cálculo:</div>
                  <div>
                    Para un cargo de <span className='fw-bold'>$100.000</span>{' '}
                    con <span className='fw-bold'>20 días</span> de atraso:
                  </div>
                  <div className='mt-1'>
                    <span className='fw-bold'>
                      {ejemploCalculo.descripcion}
                    </span>
                    <br />
                    <span className='fw-bold'>Interés aplicado:</span>{' '}
                    {ejemploCalculo.calculo}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Políticas de Pago */}
            <div className='param-section'>
              <div className='param-header'>
                <h4 className='mb-0'>
                  <span className='material-icons align-middle me-2'>
                    payments
                  </span>
                  Políticas de Pago
                </h4>
              </div>
              <div className='param-body'>
                <div className='param-description'>
                  Configure opciones para el proceso de pago y recaudación.
                </div>

                <div className='row mb-4'>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label className='form-label'>
                        Política de aplicación de pagos
                      </label>
                      <div className='form-check mb-2'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='politicaPago'
                          id='politicaAntiguos'
                          checked={parametros.politicaPago === 'antiguos'}
                          onChange={() =>
                            handleInputChange('politicaPago', 'antiguos')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='politicaAntiguos'
                        >
                          Priorizar cargos más antiguos
                        </label>
                      </div>
                      <div className='form-check mb-2'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='politicaPago'
                          id='politicaRecientes'
                          checked={parametros.politicaPago === 'recientes'}
                          onChange={() =>
                            handleInputChange('politicaPago', 'recientes')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='politicaRecientes'
                        >
                          Priorizar cargos más recientes
                        </label>
                      </div>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='politicaPago'
                          id='politicaEspecificada'
                          checked={parametros.politicaPago === 'especificada'}
                          onChange={() =>
                            handleInputChange('politicaPago', 'especificada')
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='politicaEspecificada'
                        >
                          Según lo especificado en cada pago
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label className='form-label'>
                        Orden de aplicación en cada cargo
                      </label>
                      <div className='form-check mb-2'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='ordenAplicacion'
                          id='ordenInteres'
                          checked={
                            parametros.ordenAplicacion === 'interes-capital'
                          }
                          onChange={() =>
                            handleInputChange(
                              'ordenAplicacion',
                              'interes-capital',
                            )
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='ordenInteres'
                        >
                          Primero intereses, luego capital
                        </label>
                      </div>
                      <div className='form-check'>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='ordenAplicacion'
                          id='ordenCapital'
                          checked={
                            parametros.ordenAplicacion === 'capital-interes'
                          }
                          onChange={() =>
                            handleInputChange(
                              'ordenAplicacion',
                              'capital-interes',
                            )
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='ordenCapital'
                        >
                          Primero capital, luego intereses
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='row mb-4'>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label htmlFor='diaEmision' className='form-label'>
                        Día de emisión mensual
                      </label>
                      <div className='input-group'>
                        <input
                          type='number'
                          className='form-control'
                          id='diaEmision'
                          value={parametros.diaEmision}
                          min='1'
                          max='28'
                          onChange={e =>
                            handleInputChange(
                              'diaEmision',
                              Number(e.target.value),
                            )
                          }
                        />
                        <span className='input-group-text'>del mes</span>
                      </div>
                      <div className='form-text'>
                        Día en que se emiten los gastos comunes
                      </div>
                    </div>
                  </div>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <label htmlFor='diaVencimiento' className='form-label'>
                        Día de vencimiento mensual
                      </label>
                      <div className='input-group'>
                        <input
                          type='number'
                          className='form-control'
                          id='diaVencimiento'
                          value={parametros.diaVencimiento}
                          min='1'
                          max='31'
                          onChange={e =>
                            handleInputChange(
                              'diaVencimiento',
                              Number(e.target.value),
                            )
                          }
                        />
                        <span className='input-group-text'>del mes</span>
                      </div>
                      <div className='form-text'>
                        Día en que vence el pago de gastos comunes
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mb-3'>
                  <div className='form-check form-switch'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      id='notificacionesAuto'
                      checked={parametros.notificacionesAuto}
                      onChange={e =>
                        handleInputChange(
                          'notificacionesAuto',
                          e.target.checked,
                        )
                      }
                    />
                    <label
                      className='form-check-label'
                      htmlFor='notificacionesAuto'
                    >
                      Enviar notificaciones automáticas de vencimiento
                    </label>
                  </div>
                  {parametros.notificacionesAuto && (
                    <div className='mt-2 ms-4'>
                      <div className='mb-2'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='notificacion3Dias'
                            checked={parametros.notificacion3Dias}
                            onChange={e =>
                              handleInputChange(
                                'notificacion3Dias',
                                e.target.checked,
                              )
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='notificacion3Dias'
                          >
                            3 días antes del vencimiento
                          </label>
                        </div>
                      </div>
                      <div className='mb-2'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='notificacion1Dia'
                            checked={parametros.notificacion1Dia}
                            onChange={e =>
                              handleInputChange(
                                'notificacion1Dia',
                                e.target.checked,
                              )
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='notificacion1Dia'
                          >
                            1 día antes del vencimiento
                          </label>
                        </div>
                      </div>
                      <div className='mb-2'>
                        <div className='form-check'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='notificacionVencido'
                            checked={parametros.notificacionVencido}
                            onChange={e =>
                              handleInputChange(
                                'notificacionVencido',
                                e.target.checked,
                              )
                            }
                          />
                          <label
                            className='form-check-label'
                            htmlFor='notificacionVencido'
                          >
                            El día del vencimiento
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Medios de Pago */}
            <div className='param-section'>
              <div className='param-header'>
                <h4 className='mb-0'>
                  <span className='material-icons align-middle me-2'>
                    credit_card
                  </span>
                  Medios de Pago
                </h4>
              </div>
              <div className='param-body'>
                <div className='param-description'>
                  Configure los medios de pago disponibles para los residentes.
                </div>

                <div className='row'>
                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <div className='form-check form-switch mb-3'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id='pagoTransferencia'
                          checked={parametros.pagoTransferencia}
                          onChange={e =>
                            handleInputChange(
                              'pagoTransferencia',
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='pagoTransferencia'
                        >
                          Transferencia bancaria
                        </label>
                      </div>

                      {parametros.pagoTransferencia &&
                        parametros.cuentaBancaria && (
                          <div className='card mb-3 ms-4'>
                            <div className='card-body'>
                              <div className='mb-3'>
                                <label
                                  htmlFor='bancoCuenta'
                                  className='form-label'
                                >
                                  Banco
                                </label>
                                <select
                                  className='form-select'
                                  id='bancoCuenta'
                                  value={parametros.cuentaBancaria.banco}
                                  onChange={e =>
                                    handleCuentaBancariaChange(
                                      'banco',
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value='banco-chile'>
                                    Banco de Chile
                                  </option>
                                  <option value='banco-santander'>
                                    Banco Santander
                                  </option>
                                  <option value='banco-estado'>
                                    BancoEstado
                                  </option>
                                  <option value='banco-bci'>BCI</option>
                                  <option value='banco-scotiabank'>
                                    Scotiabank
                                  </option>
                                </select>
                              </div>
                              <div className='mb-3'>
                                <label
                                  htmlFor='tipoCuenta'
                                  className='form-label'
                                >
                                  Tipo de cuenta
                                </label>
                                <select
                                  className='form-select'
                                  id='tipoCuenta'
                                  value={parametros.cuentaBancaria.tipoCuenta}
                                  onChange={e =>
                                    handleCuentaBancariaChange(
                                      'tipoCuenta',
                                      e.target.value as
                                        | 'corriente'
                                        | 'vista'
                                        | 'ahorro',
                                    )
                                  }
                                >
                                  <option value='corriente'>
                                    Cuenta Corriente
                                  </option>
                                  <option value='vista'>Cuenta Vista</option>
                                  <option value='ahorro'>
                                    Cuenta de Ahorro
                                  </option>
                                </select>
                              </div>
                              <div className='mb-3'>
                                <label
                                  htmlFor='numeroCuenta'
                                  className='form-label'
                                >
                                  Número de cuenta
                                </label>
                                <input
                                  type='text'
                                  className='form-control'
                                  id='numeroCuenta'
                                  value={parametros.cuentaBancaria.numeroCuenta}
                                  onChange={e =>
                                    handleCuentaBancariaChange(
                                      'numeroCuenta',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className='mb-3'>
                                <label
                                  htmlFor='rutTitular'
                                  className='form-label'
                                >
                                  RUT titular
                                </label>
                                <input
                                  type='text'
                                  className='form-control'
                                  id='rutTitular'
                                  value={parametros.cuentaBancaria.rutTitular}
                                  onChange={e =>
                                    handleCuentaBancariaChange(
                                      'rutTitular',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div className='mb-3'>
                                <label
                                  htmlFor='emailConfirmacion'
                                  className='form-label'
                                >
                                  Email para confirmaciones
                                </label>
                                <input
                                  type='email'
                                  className='form-control'
                                  id='emailConfirmacion'
                                  value={
                                    parametros.cuentaBancaria.emailConfirmacion
                                  }
                                  onChange={e =>
                                    handleCuentaBancariaChange(
                                      'emailConfirmacion',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className='col-md-6'>
                    <div className='mb-3'>
                      <div className='form-check form-switch mb-3'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id='pagoWebpay'
                          checked={parametros.pagoWebpay}
                          onChange={e =>
                            handleInputChange('pagoWebpay', e.target.checked)
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='pagoWebpay'
                        >
                          Webpay / Transbank
                        </label>
                      </div>

                      {parametros.pagoWebpay && (
                        <div className='card mb-3 ms-4'>
                          <div className='card-body'>
                            <p className='text-muted'>
                              La integración con Webpay está activada y
                              configurada.
                            </p>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-primary'
                            >
                              Editar configuración
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='mb-3'>
                      <div className='form-check form-switch mb-3'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id='pagoKhipu'
                          checked={parametros.pagoKhipu}
                          onChange={e =>
                            handleInputChange('pagoKhipu', e.target.checked)
                          }
                        />
                        <label className='form-check-label' htmlFor='pagoKhipu'>
                          Khipu
                        </label>
                      </div>

                      {parametros.pagoKhipu && (
                        <div className='card mb-3 ms-4'>
                          <div className='card-body'>
                            <p className='text-muted'>
                              La integración con Khipu no está configurada.
                            </p>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-primary'
                            >
                              Configurar integración
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='mb-3'>
                      <div className='form-check form-switch'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          id='pagoEfectivo'
                          checked={parametros.pagoEfectivo}
                          onChange={e =>
                            handleInputChange('pagoEfectivo', e.target.checked)
                          }
                        />
                        <label
                          className='form-check-label'
                          htmlFor='pagoEfectivo'
                        >
                          Efectivo (pago en oficina)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Multas */}
            <div className='param-section'>
              <div className='param-header'>
                <h4 className='mb-0'>
                  <span className='material-icons align-middle me-2'>
                    gavel
                  </span>
                  Multas
                </h4>
              </div>
              <div className='param-body'>
                <div className='param-description'>
                  Configure las multas predefinidas aplicables a unidades.
                </div>

                <div className='table-responsive mb-3'>
                  <table className='table table-hover'>
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Monto</th>
                        <th>Activa</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multas.map(multa => (
                        <tr key={multa.id}>
                          <td>{multa.descripcion}</td>
                          <td>${multa.monto.toLocaleString('es-CL')}</td>
                          <td>
                            <span
                              className={`badge ${multa.activa ? 'bg-success' : 'bg-secondary'}`}
                            >
                              {multa.activa ? 'Sí' : 'No'}
                            </span>
                          </td>
                          <td>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-secondary me-1'
                            >
                              Editar
                            </button>
                            <button
                              type='button'
                              className='btn btn-sm btn-outline-danger'
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button type='button' className='btn btn-sm btn-primary'>
                  <span className='material-icons align-middle me-1'>add</span>{' '}
                  Agregar multa
                </button>
              </div>
            </div>

            <div className='d-grid gap-2 d-md-flex justify-content-md-end'>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-1'
                      role='status'
                      aria-hidden='true'
                    ></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className='material-icons align-middle me-1'>
                      save
                    </span>{' '}
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Historial */}
        {showHistorial && (
          <div
            className='modal fade show d-block'
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <div className='modal-dialog modal-lg'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Historial de cambios</h5>
                  <button
                    type='button'
                    className='btn-close'
                    onClick={() => setShowHistorial(false)}
                  ></button>
                </div>
                <div className='modal-body'>
                  {historialEjemplo.map(item => (
                    <div key={item.id} className='history-item'>
                      <div className='history-date'>{item.fechaCambio}</div>
                      <div className='history-action'>{item.accion}</div>
                      <div className='history-detail'>
                        <span className='text-muted'>Usuario:</span>{' '}
                        {item.usuario}
                        <br />
                        <span className='text-muted'>Cambios:</span>{' '}
                        {item.detalles}
                      </div>
                    </div>
                  ))}
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowHistorial(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .param-section {
            background-color: #fff;
            border-radius: var(--bs-border-radius);
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            overflow: hidden;
            margin-bottom: 1.5rem;
          }

          .param-header {
            padding: 1rem 1.5rem;
            background-color: #f8f9fa;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .param-body {
            padding: 1.5rem;
          }

          .param-description {
            font-size: 0.875rem;
            color: #6c757d;
            margin-bottom: 1rem;
          }

          .history-item {
            padding: 1rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          }

          .history-item:last-child {
            border-bottom: none;
          }

          .history-date {
            font-size: 0.875rem;
            color: #6c757d;
          }

          .history-action {
            font-weight: 500;
          }

          .history-detail {
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          .calculation-example {
            background-color: #f8f9fa;
            border-left: 3px solid var(--bs-primary);
            padding: 1rem;
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }
        `}</style>
      </Layout>
    </ProtectedRoute>
  );
}
