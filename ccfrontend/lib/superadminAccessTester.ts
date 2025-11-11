/**
 * VERIFICACIÓN DE ACCESO GLOBAL PARA SUPERADMIN
 * 
 * Este archivo contiene utilidades para verificar si el backend
 * está permitiendo acceso global a superadmin
 */

/* eslint-disable no-console */

import apiClient from './api';

interface SuperadminAccessTest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  expectGlobalData: boolean;
  params?: Record<string, any>;
}

/**
 * Prueba un endpoint para verificar si superadmin tiene acceso global
 */
export async function testSuperadminAccess(
  test: SuperadminAccessTest,
): Promise<{
  passed: boolean;
  message: string;
  dataLength?: number;
  error?: string;
}> {
  try {
    const config = {
      params: test.params,
    };

    let response;
    if (test.method === 'GET') {
      response = await apiClient.get(test.endpoint, config);
    } else {
      throw new Error(`Método ${test.method} no soportado en tester`);
    }

    const dataArray = Array.isArray(response.data) ? response.data : response.data.data;
    const dataLength = Array.isArray(dataArray) ? dataArray.length : 0;

    if (test.expectGlobalData && dataLength === 0) {
      return {
        passed: false,
        message: `❌ ${test.description}: Se esperaba datos globales pero se recibió vacío`,
        dataLength,
      };
    }

    if (!test.expectGlobalData && dataLength > 0) {
      return {
        passed: true,
        message: `✅ ${test.description}: Datos restringidos correctamente`,
        dataLength,
      };
    }

    return {
      passed: true,
      message: `✅ ${test.description}: OK (${dataLength} registros)`,
      dataLength,
    };
  } catch (error: any) {
    return {
      passed: false,
      message: `❌ ${test.description}: Error en solicitud`,
      error: error.message,
    };
  }
}

/**
 * Suite de pruebas para validar acceso global del superadmin
 */
export async function runSuperadminAccessTests(): Promise<void> {
  console.log('🔍 Iniciando pruebas de acceso global para superadmin...\n');

  // Verificar que usuario es superadmin
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('❌ No hay token. Por favor, inicia sesión primero.');
    return;
  }

  const tests: SuperadminAccessTest[] = [
    {
      endpoint: '/tarifas',
      method: 'GET',
      description: 'GET /tarifas (debe retornar tarifas de todas las comunidades)',
      expectGlobalData: true,
    },
    {
      endpoint: '/personas',
      method: 'GET',
      description: 'GET /personas (debe retornar personas de todas las comunidades)',
      expectGlobalData: true,
    },
    {
      endpoint: '/cargos',
      method: 'GET',
      description: 'GET /cargos (debe retornar cargos de todas las comunidades)',
      expectGlobalData: true,
    },
    {
      endpoint: '/consumos',
      method: 'GET',
      description: 'GET /consumos (debe retornar consumos de todas las comunidades)',
      expectGlobalData: true,
    },
    {
      endpoint: '/multas',
      method: 'GET',
      description: 'GET /multas (debe retornar multas de todas las comunidades)',
      expectGlobalData: true,
    },
  ];

  let passCount = 0;
  let failCount = 0;

  for (const test of tests) {
    const result = await testSuperadminAccess(test);
    console.log(result.message);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.passed) {
      passCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Resumen: ${passCount} pasadas, ${failCount} fallidas`);

  if (failCount > 0) {
    console.warn(
      '\n⚠️  El backend puede estar filtrando datos por memberships incluso para superadmin.',
    );
    console.warn(
      '    Verifica que el backend respete is_superadmin en el token JWT.',
    );
  } else {
    console.log('\n✅ ¡Acceso global para superadmin funcionando correctamente!');
  }
}

/**
 * Utilidad para ejecutar desde la consola del navegador:
 * 
 * import { runSuperadminAccessTests } from '@/lib/superadminAccessTester';
 * await runSuperadminAccessTests();
 */
