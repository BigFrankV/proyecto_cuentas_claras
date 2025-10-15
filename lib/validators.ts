// Utilidades de validación para identificadores

export interface IdentifierValidation {
  isValid: boolean;
  type: 'email' | 'rut' | 'dni' | 'username';
  message?: string | undefined;
}

// Validar email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

// Validar y formatear RUT chileno
export function validateRUT(rut: string): { isValid: boolean; formatted?: string | undefined } {
  // Limpiar el RUT (quitar espacios, puntos, guiones)
  const cleanRut = rut.replace(/[.\s-]/g, '').toUpperCase();
  
  // Verificar formato básico
  const rutPattern = /^(\d{1,8})([0-9K])$/;
  const match = cleanRut.match(rutPattern);
  
  if (!match) {
    return { isValid: false };
  }
  
  const rutNumber = match[1];
  const dv = match[2];
  
  if (!rutNumber) {
    return { isValid: false };
  }
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    const digit = rutNumber[i];
    if (digit !== undefined) {
      sum += parseInt(digit) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
  }
  
  const remainder = sum % 11;
  const calculatedDV = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
  
  const isValid = calculatedDV === dv;
  
  return {
    isValid,
    formatted: isValid ? `${rutNumber}-${dv}` : undefined
  };
}

// Validar DNI (Argentina y otros países)
export function validateDNI(dni: string): boolean {
  const cleanDni = dni.replace(/\D/g, '');
  return /^\d{7,9}$/.test(cleanDni);
}

// Validar identificador general
export function validateIdentifier(identifier: string): IdentifierValidation {
  const trimmedIdentifier = identifier.trim();
  
  if (!trimmedIdentifier) {
    return {
      isValid: false,
      type: 'username',
      message: 'El identificador no puede estar vacío'
    };
  }
  
  // Verificar si es email
  if (trimmedIdentifier.includes('@')) {
    const isValidEmail = validateEmail(trimmedIdentifier);
    return {
      isValid: isValidEmail,
      type: 'email',
      message: isValidEmail ? undefined : 'Formato de email inválido'
    };
  }
  
  // Verificar si es RUT chileno
  const rutResult = validateRUT(trimmedIdentifier);
  if (rutResult.isValid) {
    return {
      isValid: true,
      type: 'rut'
    };
  }
  
  // Verificar si parece RUT pero es inválido
  const rutPattern = /^(\d{1,8})-?([0-9K])$/i;
  if (rutPattern.test(trimmedIdentifier.replace(/[.\s]/g, ''))) {
    return {
      isValid: false,
      type: 'rut',
      message: 'RUT inválido. Verifica el número y dígito verificador'
    };
  }
  
  // Verificar si es DNI
  if (validateDNI(trimmedIdentifier)) {
    return {
      isValid: true,
      type: 'dni'
    };
  }
  
  // Verificar si parece DNI pero es inválido
  if (/^\d+$/.test(trimmedIdentifier) && (trimmedIdentifier.length < 7 || trimmedIdentifier.length > 9)) {
    return {
      isValid: false,
      type: 'dni',
      message: 'DNI debe tener entre 7 y 9 dígitos'
    };
  }
  
  // Validar como username
  if (trimmedIdentifier.length < 3) {
    return {
      isValid: false,
      type: 'username',
      message: 'El nombre de usuario debe tener al menos 3 caracteres'
    };
  }
  
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedIdentifier)) {
    return {
      isValid: false,
      type: 'username',
      message: 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos'
    };
  }
  
  return {
    isValid: true,
    type: 'username'
  };
}

// Formatear identificador para mostrar
export function formatIdentifier(identifier: string): string {
  const validation = validateIdentifier(identifier);
  
  if (validation.type === 'rut' && validation.isValid) {
    const rutResult = validateRUT(identifier);
    return rutResult.formatted || identifier;
  }
  
  if (validation.type === 'email') {
    return identifier.toLowerCase();
  }
  
  return identifier.trim();
}

// Obtener mensaje de ayuda para el tipo de identificador
export function getIdentifierHelpText(type: 'email' | 'rut' | 'dni' | 'username'): string {
  switch (type) {
    case 'email':
      return 'Ejemplo: usuario@ejemplo.com';
    case 'rut':
      return 'Ejemplo: 12345678-9 (con o sin guión)';
    case 'dni':
      return 'Ejemplo: 12345678 (7 a 9 dígitos)';
    case 'username':
      return 'Ejemplo: usuario123 (solo letras, números y algunos símbolos)';
    default:
      return '';
  }
}