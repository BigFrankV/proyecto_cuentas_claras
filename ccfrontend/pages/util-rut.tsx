/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import Layout from '@/components/layout/Layout';

import {
  RutValidation,
  RutGenerationOptions,
  GeneratedRut,
  RUT_FORMAT_EXAMPLES,
} from '../types/utilidades';

const ValidadorRUT: React.FC = () => {
  // Estados principales
  const [rutInput, setRutInput] = useState<string>('');
  const [validation, setValidation] = useState<RutValidation | null>(null);
  const [generatedRuts, setGeneratedRuts] = useState<GeneratedRut[]>([]);
  const [generateCount, setGenerateCount] = useState<number>(5);
  const [generateFormat, setGenerateFormat] = useState<
    'dots' | 'clean' | 'dash'
  >('dots');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState<string | null>(null);

  // Función para calcular dígito verificador
  const calculateDigitoVerificador = (rutNumbers: string): string => {
    let suma = 0;
    let multiplicador = 2;

    // Recorremos de derecha a izquierda
    for (let i = rutNumbers.length - 1; i >= 0; i--) {
      const digit = rutNumbers[i];
      if (digit) {
        suma += parseInt(digit) * multiplicador;
      }
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dv = 11 - resto;

    if (dv === 11) {
      return '0';
    }
    if (dv === 10) {
      return 'K';
    }
    return dv.toString();
  };

  // Función para limpiar RUT (solo números)
  const cleanRut = (rut: string): string => {
    return rut.replace(/[^\dkK]/g, '').toUpperCase();
  };

  // Función para formatear RUT
  const formatRut = (
    rut: string,
    format: 'dots' | 'clean' | 'dash' = 'dots',
  ): string => {
    const cleaned = cleanRut(rut);
    if (cleaned.length < 2) {
      return cleaned;
    }

    const numbers = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    switch (format) {
      case 'dots':
        return `${numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
      case 'dash':
        return `${numbers}-${dv}`;
      case 'clean':
        return numbers + dv;
      default:
        return cleaned;
    }
  };

  // Función para validar RUT
  const validateRut = (rut: string): RutValidation => {
    const cleaned = cleanRut(rut);

    if (!cleaned) {
      return {
        rut,
        isValid: false,
        formatted: '',
        cleanRut: '',
        digitoVerificador: '',
        errorMessage: 'RUT no puede estar vacío',
      };
    }

    if (cleaned.length < 2) {
      return {
        rut,
        isValid: false,
        formatted: '',
        cleanRut: cleaned,
        digitoVerificador: '',
        errorMessage: 'RUT debe tener al menos 2 caracteres',
      };
    }

    const numbers = cleaned.slice(0, -1);
    const providedDv = cleaned.slice(-1);

    // Validar que los números sean solo dígitos
    if (!/^\d+$/.test(numbers)) {
      return {
        rut,
        isValid: false,
        formatted: '',
        cleanRut: cleaned,
        digitoVerificador: providedDv,
        errorMessage: 'RUT contiene caracteres inválidos',
      };
    }

    // Validar rango
    const numbersPart = parseInt(numbers);
    if (numbersPart < 1000000 || numbersPart > 99999999) {
      return {
        rut,
        isValid: false,
        formatted: '',
        cleanRut: cleaned,
        digitoVerificador: providedDv,
        errorMessage: 'RUT fuera del rango válido (1.000.000 - 99.999.999)',
      };
    }

    const calculatedDv = calculateDigitoVerificador(numbers);
    const isValid = providedDv === calculatedDv;

    const result: RutValidation = {
      rut,
      isValid,
      formatted: formatRut(cleaned, 'dots'),
      cleanRut: cleaned,
      digitoVerificador: providedDv,
    };

    if (!isValid) {
      result.errorMessage = `Dígito verificador incorrecto. Debería ser: ${calculatedDv}`;
    }

    return result;
  };

  // Función para generar RUTs válidos
  const generateValidRuts = (options: RutGenerationOptions): GeneratedRut[] => {
    const ruts: GeneratedRut[] = [];

    for (let i = 0; i < options.count; i++) {
      // Generar número aleatorio entre 10.000.000 y 99.999.999
      const randomNumber =
        Math.floor(Math.random() * (99999999 - 10000000 + 1)) + 10000000;
      const numbers = randomNumber.toString();
      const dv = calculateDigitoVerificador(numbers);
      const fullRut = numbers + dv;

      ruts.push({
        rut: fullRut,
        formatted: formatRut(fullRut, options.format),
        digitoVerificador: dv,
      });
    }

    return ruts;
  };

  // Manejar validación en tiempo real
  useEffect(() => {
    if (rutInput.trim()) {
      const result = validateRut(rutInput);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [rutInput]);

  // Manejar generación de RUTs
  const handleGenerate = () => {
    setLoading(true);

    setTimeout(() => {
      const options: RutGenerationOptions = {
        count: generateCount,
        format: generateFormat,
      };

      const generated = generateValidRuts(options);
      setGeneratedRuts(generated);
      setLoading(false);
    }, 300);
  };

  // Copiar al portapapeles
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopiedAlert(text);
      setTimeout(() => setShowCopiedAlert(null), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al copiar:', err);
    }
  };

  return (
    <Layout title='Validador de RUT - Cuentas Claras'>
      <div className='container-fluid px-4 py-4'>
        {/* Header */}
        <div className='row mb-4'>
          <div className='col-12'>
            <nav aria-label='breadcrumb'>
              <ol className='breadcrumb'>
                <li className='breadcrumb-item'>
                  <Link href='/dashboard'>
                    <i className='material-icons me-1'>home</i>
                    Dashboard
                  </Link>
                </li>
                <li className='breadcrumb-item active'>
                  <i className='material-icons me-1'>badge</i>
                  Validador RUT
                </li>
              </ol>
            </nav>

            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <h1 className='h3 mb-1'>
                  <i className='material-icons me-2'>badge</i>
                  Validador de RUT
                </h1>
                <p className='text-muted mb-0'>
                  Valida y genera RUTs chilenos usando el algoritmo oficial
                </p>
              </div>

              <div className='btn-group'>
                <Link href='/util-uf' className='btn btn-outline-primary'>
                  <i className='material-icons me-1'>attach_money</i>
                  Consultar UF
                </Link>
                <Link href='/util-utm' className='btn btn-outline-primary'>
                  <i className='material-icons me-1'>calculate</i>
                  Consultar UTM
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alert de copiado */}
        {showCopiedAlert && (
          <div
            className='alert alert-success alert-dismissible fade show'
            role='alert'
          >
            <i className='material-icons me-2'>check_circle</i>
            <strong>¡Copiado!</strong> RUT "{showCopiedAlert}&rdquo; copiado al
            portapapeles.
            <button
              type='button'
              className='btn-close'
              onClick={() => setShowCopiedAlert(null)}
            ></button>
          </div>
        )}

        <div className='row'>
          {/* Sección de Validación */}
          <div className='col-lg-6 mb-4'>
            <div className='card h-100'>
              <div className='card-header bg-primary text-white'>
                <h5 className='card-title mb-0'>
                  <i className='material-icons me-2'>verified_user</i>
                  Validar RUT
                </h5>
              </div>
              <div className='card-body'>
                <div className='mb-3'>
                  <label htmlFor='rutInput' className='form-label'>
                    Ingresa un RUT para validar:
                  </label>
                  <div className='input-group'>
                    <span className='input-group-text'>
                      <i className='material-icons'>badge</i>
                    </span>
                    <input
                      type='text'
                      className={`form-control ${
                        validation
                          ? validation.isValid
                            ? 'is-valid'
                            : 'is-invalid'
                          : ''
                      }`}
                      id='rutInput'
                      placeholder='Ej: 12.345.678-9'
                      value={rutInput}
                      onChange={e => setRutInput(e.target.value)}
                      maxLength={12}
                    />
                    {rutInput && (
                      <button
                        className='btn btn-outline-secondary'
                        type='button'
                        onClick={() => setRutInput('')}
                      >
                        <i className='material-icons'>clear</i>
                      </button>
                    )}
                  </div>

                  {validation && (
                    <div
                      className={`mt-2 ${validation.isValid ? 'text-success' : 'text-danger'}`}
                    >
                      <i
                        className={`material-icons me-1 ${validation.isValid ? 'text-success' : 'text-danger'}`}
                      >
                        {validation.isValid ? 'check_circle' : 'error'}
                      </i>
                      {validation.isValid ? (
                        <span>
                          <strong>RUT válido:</strong> {validation.formatted}
                          <button
                            className='btn btn-sm btn-outline-primary ms-2'
                            onClick={() =>
                              copyToClipboard(validation.formatted)
                            }
                          >
                            <i className='material-icons'>content_copy</i>
                          </button>
                        </span>
                      ) : (
                        <span>{validation.errorMessage}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ejemplos de formato */}
                <div className='mt-4'>
                  <h6 className='mb-3'>
                    <i className='material-icons me-1'>info</i>
                    Formatos aceptados:
                  </h6>
                  <div className='row g-2'>
                    {RUT_FORMAT_EXAMPLES.map((example, index) => (
                      <div key={index} className='col-12'>
                        <div className='d-flex align-items-center p-2 bg-light rounded'>
                          <div className='flex-grow-1'>
                            <div className='fw-bold'>{example.format}</div>
                            <code className='text-primary'>
                              {example.example}
                            </code>
                            <div className='small text-muted'>
                              {example.description}
                            </div>
                          </div>
                          <button
                            className='btn btn-sm btn-outline-primary'
                            onClick={() => setRutInput(example.example)}
                          >
                            <i className='material-icons'>input</i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Generación */}
          <div className='col-lg-6 mb-4'>
            <div className='card h-100'>
              <div className='card-header bg-success text-white'>
                <h5 className='card-title mb-0'>
                  <i className='material-icons me-2'>auto_awesome</i>
                  Generar RUTs
                </h5>
              </div>
              <div className='card-body'>
                <div className='row g-3 mb-3'>
                  <div className='col-md-6'>
                    <label htmlFor='generateCount' className='form-label'>
                      Cantidad a generar:
                    </label>
                    <select
                      className='form-select'
                      id='generateCount'
                      value={generateCount}
                      onChange={e => setGenerateCount(parseInt(e.target.value))}
                    >
                      <option value={1}>1 RUT</option>
                      <option value={5}>5 RUTs</option>
                      <option value={10}>10 RUTs</option>
                      <option value={15}>15 RUTs</option>
                      <option value={20}>20 RUTs</option>
                    </select>
                  </div>
                  <div className='col-md-6'>
                    <label htmlFor='generateFormat' className='form-label'>
                      Formato:
                    </label>
                    <select
                      className='form-select'
                      id='generateFormat'
                      value={generateFormat}
                      onChange={e =>
                        setGenerateFormat(
                          e.target.value as 'dots' | 'clean' | 'dash',
                        )
                      }
                    >
                      <option value='dots'>Con puntos (12.345.678-9)</option>
                      <option value='dash'>Con guión (12345678-9)</option>
                      <option value='clean'>Sin formato (123456789)</option>
                    </select>
                  </div>
                </div>

                <button
                  className='btn btn-success w-100 mb-3'
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2'></span>
                      Generando...
                    </>
                  ) : (
                    <>
                      <i className='material-icons me-2'>auto_awesome</i>
                      Generar RUTs válidos
                    </>
                  )}
                </button>

                {/* Lista de RUTs generados */}
                {generatedRuts.length > 0 && (
                  <div className='mt-3'>
                    <div className='d-flex justify-content-between align-items-center mb-2'>
                      <h6 className='mb-0'>
                        <i className='material-icons me-1'>list</i>
                        RUTs generados ({generatedRuts.length})
                      </h6>
                      <button
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => {
                          const allRuts = generatedRuts
                            .map(r => r.formatted)
                            .join('\n');
                          copyToClipboard(allRuts);
                        }}
                      >
                        <i className='material-icons me-1'>content_copy</i>
                        Copiar todos
                      </button>
                    </div>

                    <div
                      className='list-group list-group-flush'
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                    >
                      {generatedRuts.map((rut, index) => (
                        <div
                          key={index}
                          className='list-group-item d-flex justify-content-between align-items-center'
                        >
                          <div>
                            <code className='text-primary fw-bold'>
                              {rut.formatted}
                            </code>
                            <small className='text-muted ms-2'>
                              DV: {rut.digitoVerificador}
                            </small>
                          </div>
                          <button
                            className='btn btn-sm btn-outline-secondary'
                            onClick={() => copyToClipboard(rut.formatted)}
                          >
                            <i className='material-icons'>content_copy</i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className='row'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-header'>
                <h5 className='card-title mb-0'>
                  <i className='material-icons me-2'>help</i>
                  Información sobre el RUT
                </h5>
              </div>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-md-6'>
                    <h6>¿Qué es el RUT?</h6>
                    <p className='text-muted'>
                      El RUT (Rol Único Tributario) es un identificador único
                      asignado por el Servicio de Impuestos Internos (SII) a
                      cada persona natural o jurídica en Chile.
                    </p>

                    <h6>Estructura del RUT:</h6>
                    <ul className='text-muted'>
                      <li>
                        <strong>Número:</strong> Entre 1.000.000 y 99.999.999
                      </li>
                      <li>
                        <strong>Dígito verificador:</strong> Calculado mediante
                        algoritmo matemático
                      </li>
                      <li>
                        <strong>Formato:</strong> XX.XXX.XXX-Y donde Y puede ser
                        0-9 o K
                      </li>
                    </ul>
                  </div>

                  <div className='col-md-6'>
                    <h6>Algoritmo de validación:</h6>
                    <ol className='text-muted'>
                      <li>
                        Se toman los dígitos del RUT (sin DV) de derecha a
                        izquierda
                      </li>
                      <li>
                        Se multiplican por la secuencia 2, 3, 4, 5, 6, 7, 2,
                        3...
                      </li>
                      <li>Se suman todos los productos</li>
                      <li>Se calcula el resto de dividir por 11</li>
                      <li>Se resta de 11: si es 11 = 0, si es 10 = K</li>
                    </ol>

                    <div className='alert alert-info mt-3'>
                      <i className='material-icons me-2'>info</i>
                      <strong>Nota:</strong> Esta herramienta genera RUTs
                      válidos para testing, no representa RUTs reales de
                      personas existentes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ValidadorRUT;
