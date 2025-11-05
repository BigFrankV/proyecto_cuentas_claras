/* eslint-disable import/no-anonymous-default-export */
/**
 * Utilidad para validación de RUT chileno
 *
 * El RUT (Rol Único Tributario) es un identificador único para personas y empresas en Chile
 * Formato: XX.XXX.XXX-X donde el último dígito es el verificador
 */

/**
 * Limpia el RUT removiendo puntos, guiones y espacios
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

/**
 * Calcula el dígito verificador de un RUT
 * @param rut - RUT sin dígito verificador (solo números)
 * @returns Dígito verificador calculado (0-9 o K)
 */
export function calculateDV(rut: string): string {
  // Limpiar el RUT (remover cualquier formato)
  const cleanedRut = cleanRut(rut);

  // Asegurar que solo contenga números
  const rutNumbers = cleanedRut.replace(/[^0-9]/g, '');

  if (!rutNumbers || rutNumbers.length === 0) {
    return '';
  }

  // Algoritmo de cálculo del dígito verificador
  let sum = 0;
  let multiplier = 2;

  // Recorrer el RUT de derecha a izquierda
  for (let i = rutNumbers.length - 1; i >= 0; i--) {
    const digit = rutNumbers[i];
    if (digit) {
      sum += parseInt(digit) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
  }

  const remainder = sum % 11;
  const dv = 11 - remainder;

  // Casos especiales
  if (dv === 11) {return '0';}
  if (dv === 10) {return 'K';}
  return dv.toString();
}

/**
 * Valida si un RUT y su dígito verificador son correctos
 * @param rut - RUT sin dígito verificador
 * @param dv - Dígito verificador
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validateRut(rut: string, dv: string): boolean {
  if (!rut || !dv) {
    return false;
  }

  // Limpiar inputs
  const cleanedRut = cleanRut(rut);
  const cleanedDV = cleanRut(dv);

  // Validar que el RUT solo contenga números
  if (!/^\d+$/.test(cleanedRut)) {
    return false;
  }

  // Validar que el DV sea un número o K
  if (!/^[0-9K]$/.test(cleanedDV)) {
    return false;
  }

  // Validar longitud del RUT (mínimo 7, máximo 8 dígitos sin contar el DV)
  if (cleanedRut.length < 7 || cleanedRut.length > 8) {
    return false;
  }

  // Calcular el DV esperado y comparar
  const expectedDV = calculateDV(cleanedRut);
  return expectedDV === cleanedDV;
}

/**
 * Valida un RUT completo en formato string (con o sin formato)
 * @param fullRut - RUT completo incluyendo dígito verificador
 * @returns true si el RUT es válido, false en caso contrario
 *
 * Acepta formatos: 12345678-9, 12.345.678-9, 123456789
 */
export function validateFullRut(fullRut: string): boolean {
  if (!fullRut) {return false;}

  const cleaned = cleanRut(fullRut);

  // Debe tener entre 8 y 9 caracteres (7-8 dígitos + 1 DV)
  if (cleaned.length < 8 || cleaned.length > 9) {
    return false;
  }

  // Separar RUT y DV
  const rut = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  return validateRut(rut, dv);
}

/**
 * Formatea un RUT al estándar chileno (XX.XXX.XXX-X)
 * @param rut - RUT sin formato
 * @param dv - Dígito verificador
 * @returns RUT formateado
 */
export function formatRut(rut: string, dv: string): string {
  if (!rut) {return '';}

  const cleaned = cleanRut(rut);

  // Separar en grupos de 3 desde la derecha
  const rutReversed = cleaned.split('').reverse().join('');
  const groups: string[] = [];

  for (let i = 0; i < rutReversed.length; i += 3) {
    groups.push(rutReversed.slice(i, i + 3));
  }

  const formattedRut = groups
    .map(g => g.split('').reverse().join(''))
    .reverse()
    .join('.');

  return dv ? `${formattedRut}-${cleanRut(dv)}` : formattedRut;
}

/**
 * Descompone un RUT completo en sus partes (rut y dv)
 * @param fullRut - RUT completo con o sin formato
 * @returns Objeto con rut y dv separados
 */
export function splitRut(fullRut: string): { rut: string; dv: string } {
  if (!fullRut) {return { rut: '', dv: '' };}

  const cleaned = cleanRut(fullRut);

  if (cleaned.length < 2) {
    return { rut: cleaned, dv: '' };
  }

  return {
    rut: cleaned.slice(0, -1),
    dv: cleaned.slice(-1),
  };
}

/**
 * Valida y retorna mensajes de error específicos para un RUT
 * @param rut - RUT sin dígito verificador
 * @param dv - Dígito verificador
 * @returns Mensaje de error o null si es válido
 */
export function getRutValidationError(rut: string, dv: string): string | null {
  if (!rut && !dv) {
    return null; // Permitir vacío si no es requerido
  }

  if (!rut) {
    return 'El RUT es requerido';
  }

  if (!dv) {
    return 'El dígito verificador es requerido';
  }

  const cleanedRut = cleanRut(rut);
  const cleanedDV = cleanRut(dv);

  if (!/^\d+$/.test(cleanedRut)) {
    return 'El RUT solo debe contener números';
  }

  if (!/^[0-9K]$/.test(cleanedDV)) {
    return 'El dígito verificador debe ser un número o K';
  }

  if (cleanedRut.length < 7) {
    return 'El RUT debe tener al menos 7 dígitos';
  }

  if (cleanedRut.length > 8) {
    return 'El RUT no puede tener más de 8 dígitos';
  }

  if (!validateRut(rut, dv)) {
    return 'El RUT no es válido. Verifique el dígito verificador';
  }

  return null;
}

// Exportar todas las funciones como objeto default también
export default {
  cleanRut,
  calculateDV,
  validateRut,
  validateFullRut,
  formatRut,
  splitRut,
  getRutValidationError,
};

