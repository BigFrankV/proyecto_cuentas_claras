import { useState, useCallback, useEffect } from 'react';

import {
  RutValidation,
  RutGenerationOptions,
  GeneratedRut,
  UfConsultaResult,
  UfCalculatorInputs,
  UfCalculatorResult,
  UtmConsultaResult,
  UtmCalculatorInputs,
  UtmCalculatorResult,
  CalculatorState,
} from '../types/utilidades';

// Hook para validación y generación de RUT
export const useRutValidator = () => {
  const [validation, setValidation] = useState<RutValidation | null>(null);
  const [generatedRuts, setGeneratedRuts] = useState<GeneratedRut[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Función para calcular dígito verificador
  const calculateDigitoVerificador = useCallback(
    (rutNumbers: string): string => {
      let suma = 0;
      let multiplicador = 2;

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
    },
    []
  );

  // Función para limpiar RUT
  const cleanRut = useCallback((rut: string): string => {
    return rut.replace(/[^\dkK]/g, '').toUpperCase();
  }, []);

  // Función para formatear RUT
  const formatRut = useCallback(
    (rut: string, format: 'dots' | 'clean' | 'dash' = 'dots'): string => {
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
    },
    [cleanRut]
  );

  // Función para validar RUT
  const validateRut = useCallback(
    (rut: string): RutValidation => {
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
        ...(isValid
          ? {}
          : {
              errorMessage: `Dígito verificador incorrecto. Debería ser: ${calculatedDv}`,
            }),
      };

      setValidation(result);
      return result;
    },
    [cleanRut, calculateDigitoVerificador, formatRut]
  );

  // Función para generar RUTs válidos
  const generateValidRuts = useCallback(
    async (options: RutGenerationOptions): Promise<GeneratedRut[]> => {
      setIsGenerating(true);

      return new Promise(resolve => {
        setTimeout(() => {
          const ruts: GeneratedRut[] = [];

          for (let i = 0; i < options.count; i++) {
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

          setGeneratedRuts(ruts);
          setIsGenerating(false);
          resolve(ruts);
        }, 300);
      });
    },
    [calculateDigitoVerificador, formatRut]
  );

  // Función para limpiar resultados
  const clearResults = useCallback(() => {
    setValidation(null);
    setGeneratedRuts([]);
  }, []);

  return {
    validation,
    generatedRuts,
    isGenerating,
    validateRut,
    generateValidRuts,
    formatRut,
    cleanRut,
    clearResults,
  };
};

// Hook para consulta y cálculo de UF
export const useUfConsultor = () => {
  const [consultaResult, setConsultaResult] = useState<UfConsultaResult | null>(
    null
  );
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    loading: false,
    error: null,
    result: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Función para consultar UF por fecha
  const consultarUF = useCallback(
    async (fecha: string): Promise<UfConsultaResult> => {
      setIsLoading(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const dateObj = new Date(fecha);
        const baseValue = 37250;
        const dayOfYear = Math.floor(
          (dateObj.getTime() -
            new Date(dateObj.getFullYear(), 0, 0).getTime()) /
            86400000
        );
        const variation =
          Math.sin((dayOfYear / 365) * 2 * Math.PI) * 500 +
          (Math.random() - 0.5) * 100;
        const valor = baseValue + variation;

        const result: UfConsultaResult = {
          fecha,
          valor: Math.round(valor * 100) / 100,
          fechaFormateada: dateObj.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          success: true,
        };

        setConsultaResult(result);
        return result;
      } catch (error) {
        const errorResult: UfConsultaResult = {
          fecha,
          valor: 0,
          fechaFormateada: '',
          success: false,
          errorMessage: 'Error al consultar el valor de la UF',
        };

        setConsultaResult(errorResult);
        return errorResult;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Función para calcular conversiones UF
  const calcularConversionUF = useCallback(
    (
      inputs: UfCalculatorInputs,
      type: 'toPesos' | 'toUf'
    ): Promise<UfCalculatorResult> => {
      setCalculatorState(prev => ({ ...prev, loading: true, error: null }));

      return new Promise(resolve => {
        setTimeout(() => {
          try {
            const valorUf =
              inputs.valorUfActual || consultaResult?.valor || 37250;

            let result: UfCalculatorResult;

            if (type === 'toPesos') {
              const pesos = inputs.uf * valorUf;
              result = {
                fromPesos: 0,
                fromUf: inputs.uf,
                toPesos: Math.round(pesos * 100) / 100,
                toUf: 0,
                valorUfUsado: valorUf,
                fechaConsulta: (consultaResult?.fecha ||
                  new Date().toISOString().split('T')[0]) as string,
              };
            } else {
              const uf = inputs.pesos / valorUf;
              result = {
                fromPesos: inputs.pesos,
                fromUf: 0,
                toPesos: 0,
                toUf: Math.round(uf * 10000) / 10000,
                valorUfUsado: valorUf,
                fechaConsulta: (consultaResult?.fecha ||
                  new Date().toISOString().split('T')[0]) as string,
              };
            }

            setCalculatorState({
              loading: false,
              error: null,
              result,
            });

            resolve(result);
          } catch (error) {
            const errorMessage = 'Error al realizar el cálculo';
            setCalculatorState({
              loading: false,
              error: errorMessage,
              result: null,
            });
            throw new Error(errorMessage);
          }
        }, 300);
      });
    },
    [consultaResult]
  );

  return {
    consultaResult,
    calculatorState,
    isLoading,
    consultarUF,
    calcularConversionUF,
    clearConsulta: () => setConsultaResult(null),
    clearCalculator: () =>
      setCalculatorState({ loading: false, error: null, result: null }),
  };
};

// Hook para consulta y cálculo de UTM
export const useUtmConsultor = () => {
  const [consultaResult, setConsultaResult] =
    useState<UtmConsultaResult | null>(null);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    loading: false,
    error: null,
    result: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Función para consultar UTM por mes y año
  const consultarUTM = useCallback(
    async (mes: number, ano: number): Promise<UtmConsultaResult> => {
      setIsLoading(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const baseValue = 60000 + (ano - 2020) * 2000;
        const seasonalVariation = Math.sin(((mes - 1) * Math.PI) / 6) * 1000;
        const valor = Math.round(baseValue + seasonalVariation);

        const mesesNombres = [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ];

        const result: UtmConsultaResult = {
          mes,
          ano,
          valor,
          mesNombre: mesesNombres[mes - 1] || 'Mes desconocido',
          periodo: `${mesesNombres[mes - 1] || 'Mes desconocido'} ${ano}`,
          success: true,
        };

        setConsultaResult(result);
        return result;
      } catch (error) {
        const mesesNombres = [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ];

        const errorResult: UtmConsultaResult = {
          mes,
          ano,
          valor: 0,
          mesNombre: mesesNombres[mes - 1] || 'Mes desconocido',
          periodo: `${mesesNombres[mes - 1] || 'Mes desconocido'} ${ano}`,
          success: false,
          errorMessage: 'Error al consultar el valor de la UTM',
        };

        setConsultaResult(errorResult);
        return errorResult;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Función para calcular conversiones UTM
  const calcularConversionUTM = useCallback(
    (
      inputs: UtmCalculatorInputs,
      type: 'toPesos' | 'toUtm'
    ): Promise<UtmCalculatorResult> => {
      setCalculatorState(prev => ({ ...prev, loading: true, error: null }));

      return new Promise(resolve => {
        setTimeout(() => {
          try {
            const valorUtm =
              inputs.valorUtmActual || consultaResult?.valor || 60000;

            let result: UtmCalculatorResult;

            if (type === 'toPesos') {
              const pesos = inputs.utm * valorUtm;
              result = {
                fromPesos: 0,
                fromUtm: inputs.utm,
                toPesos: Math.round(pesos),
                toUtm: 0,
                valorUtmUsado: valorUtm,
                periodoConsulta:
                  consultaResult?.periodo ||
                  `${new Date().toLocaleDateString('es-CL', { month: 'long' })} ${new Date().getFullYear()}`,
              };
            } else {
              const utm = inputs.pesos / valorUtm;
              result = {
                fromPesos: inputs.pesos,
                fromUtm: 0,
                toPesos: 0,
                toUtm: Math.round(utm * 10000) / 10000,
                valorUtmUsado: valorUtm,
                periodoConsulta:
                  consultaResult?.periodo ||
                  `${new Date().toLocaleDateString('es-CL', { month: 'long' })} ${new Date().getFullYear()}`,
              };
            }

            setCalculatorState({
              loading: false,
              error: null,
              result,
            });

            resolve(result);
          } catch (error) {
            const errorMessage = 'Error al realizar el cálculo';
            setCalculatorState({
              loading: false,
              error: errorMessage,
              result: null,
            });
            throw new Error(errorMessage);
          }
        }, 300);
      });
    },
    [consultaResult]
  );

  return {
    consultaResult,
    calculatorState,
    isLoading,
    consultarUTM,
    calcularConversionUTM,
    clearConsulta: () => setConsultaResult(null),
    clearCalculator: () =>
      setCalculatorState({ loading: false, error: null, result: null }),
  };
};

// Hook para manejo de períodos rápidos
export const usePeriodosRapidos = () => {
  const getPeriodoRapidoUF = useCallback((key: string): string => {
    const today = new Date();
    const targetDate = new Date(today);

    switch (key) {
      case 'today':
        break;
      case 'yesterday':
        targetDate.setDate(today.getDate() - 1);
        break;
      case 'week':
        targetDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        targetDate.setDate(today.getDate() - 30);
        break;
      default:
        break;
    }

    return targetDate.toISOString().split('T')[0] as string;
  }, []);

  const getPeriodoRapidoUTM = useCallback(
    (key: string): { mes: number; ano: number } => {
      const today = new Date();
      let targetMes = today.getMonth() + 1;
      let targetAno = today.getFullYear();

      switch (key) {
        case 'current':
          break;
        case 'previous':
          targetMes = targetMes === 1 ? 12 : targetMes - 1;
          if (targetMes === 12) {
            targetAno--;
          }
          break;
        case 'year_ago':
          targetAno--;
          break;
        default:
          break;
      }

      return { mes: targetMes, ano: targetAno };
    },
    []
  );

  return {
    getPeriodoRapidoUF,
    getPeriodoRapidoUTM,
  };
};

// Hook para formateo de números
export const useNumberFormatter = () => {
  const formatPesos = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatUF = useCallback((amount: number): string => {
    return `${amount.toLocaleString('es-CL', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })} UF`;
  }, []);

  const formatUTM = useCallback((amount: number): string => {
    return `${amount.toLocaleString('es-CL', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })} UTM`;
  }, []);

  const formatNumber = useCallback(
    (amount: number, decimals: number = 0): string => {
      return amount.toLocaleString('es-CL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    []
  );

  return {
    formatPesos,
    formatUF,
    formatUTM,
    formatNumber,
  };
};

// Hook para manejo de estado del portapapeles
export const useClipboard = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);

        // Limpiar después de 2 segundos
        setTimeout(() => setCopiedText(null), 2000);

        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error al copiar al portapapeles:', error);
        return false;
      }
    },
    []
  );

  const clearCopied = useCallback(() => {
    setCopiedText(null);
  }, []);

  return {
    copiedText,
    copyToClipboard,
    clearCopied,
  };
};

// Hook para manejo de fechas
export const useDateUtils = () => {
  const getToday = useCallback((): string => {
    const date = new Date().toISOString().split('T')[0];
    return date || '';
  }, []);

  const formatDate = useCallback(
    (date: string, locale: string = 'es-CL'): string => {
      return new Date(date).toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    []
  );

  const getCurrentMonth = useCallback((): number => {
    return new Date().getMonth() + 1;
  }, []);

  const getCurrentYear = useCallback((): number => {
    return new Date().getFullYear();
  }, []);

  const isValidDate = useCallback((date: string): boolean => {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }, []);

  return {
    getToday,
    formatDate,
    getCurrentMonth,
    getCurrentYear,
    isValidDate,
  };
};
