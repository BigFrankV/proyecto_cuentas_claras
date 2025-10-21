import { useState, useCallback } from 'react';
import { usePersonas } from './usePersonas';

export interface ValidacionResultado {
  valido: boolean;
  mensaje?: string;
}

export const useValidacionCampos = () => {
  const [validando, setValidando] = useState(false);
  const { validarCampo } = usePersonas();

  const validarRut = useCallback(async (rut: string, excludeId?: number): Promise<ValidacionResultado> => {
    if (!rut || rut.trim() === '') {
      return { valido: false, mensaje: 'El RUT es requerido' };
    }

    // Validación básica de formato RUT
    const rutRegex = /^\d{1,8}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
      return { valido: false, mensaje: 'Formato de RUT inválido' };
    }

    setValidando(true);
    try {
      const resultado = await validarCampo('rut', rut, excludeId);
      return {
        valido: resultado.valido,
        ...(resultado.mensaje && { mensaje: resultado.mensaje })
      };
    } catch (error) {
      return { valido: false, mensaje: 'Error al validar RUT' };
    } finally {
      setValidando(false);
    }
  }, [validarCampo]);

  const validarEmail = useCallback(async (email: string, excludeId?: number): Promise<ValidacionResultado> => {
    if (!email || email.trim() === '') {
      return { valido: false, mensaje: 'El email es requerido' };
    }

    // Validación básica de formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valido: false, mensaje: 'Formato de email inválido' };
    }

    setValidando(true);
    try {
      const resultado = await validarCampo('email', email, excludeId);
      return {
        valido: resultado.valido,
        ...(resultado.mensaje && { mensaje: resultado.mensaje })
      };
    } catch (error) {
      return { valido: false, mensaje: 'Error al validar email' };
    } finally {
      setValidando(false);
    }
  }, [validarCampo]);

  const validarUsername = useCallback(async (username: string, excludeId?: number): Promise<ValidacionResultado> => {
    if (!username || username.trim() === '') {
      return { valido: false, mensaje: 'El nombre de usuario es requerido' };
    }

    if (username.length < 3) {
      return { valido: false, mensaje: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }

    // Solo caracteres alfanuméricos y guiones
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return { valido: false, mensaje: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos' };
    }

    setValidando(true);
    try {
      const resultado = await validarCampo('username', username, excludeId);
      return {
        valido: resultado.valido,
        ...(resultado.mensaje && { mensaje: resultado.mensaje })
      };
    } catch (error) {
      return { valido: false, mensaje: 'Error al validar nombre de usuario' };
    } finally {
      setValidando(false);
    }
  }, [validarCampo]);

  return {
    validando,
    validarRut,
    validarEmail,
    validarUsername
  };
};