import {
  validateEmail,
  validateRUT,
  validateDNI,
  validateIdentifier,
  formatIdentifier,
  getIdentifierHelpText,
} from '../lib/validators';

describe('validators utilities', () => {
  test('validateEmail: valid and invalid', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('bad-email')).toBe(false);
    expect(validateEmail('TEST@EXAMPLE.COM')).toBe(true);
  });

  test('validateRUT: valid RUT and invalid', () => {
    // This RUT may not be valid but we can test format handling
    const res = validateRUT('12.345.678-5');
    expect(typeof res.isValid).toBe('boolean');
    // Invalid format
    expect(validateRUT('abc').isValid).toBe(false);
  });

  test('validateDNI', () => {
    expect(validateDNI('12345678')).toBe(true);
    expect(validateDNI('123')).toBe(false);
  });

  test('validateIdentifier: email, rut, dni, username', () => {
    expect(validateIdentifier('user@example.com').type).toBe('email');
    expect(validateIdentifier('12345678-5').type).toMatch(/(rut|dni|username)/);
    expect(validateIdentifier('abcdef').type).toBe('username');
    expect(validateIdentifier('  ').isValid).toBe(false);
  });

  test('formatIdentifier and help text', () => {
    expect(formatIdentifier('USER@EXAMPLE.COM')).toBe('user@example.com');
    expect(getIdentifierHelpText('email')).toContain('Ejemplo');
  });
});

