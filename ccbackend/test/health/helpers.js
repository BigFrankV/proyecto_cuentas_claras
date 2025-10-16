/**
 * Funciones auxiliares para los tests de health
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');

/**
 * Resultados globales compartidos entre todos los tests
 */
const globalResults = {
  success: [],
  unauthorized: [],
  notFound: [],
  serverError: [],
  other: [],
  details: [] // Detalles completos de cada request
};

/**
 * Categoriza la respuesta de un endpoint
 */
function categorizeResponse(method, endpoint, statusCode, responseBody = null, error = null) {
  const timestamp = new Date().toISOString();
  const result = { 
    method,
    endpoint, 
    statusCode,
    timestamp,
    responseBody: responseBody ? JSON.stringify(responseBody).substring(0, 200) : null,
    error: error ? error.message : null
  };
  
  // Guardar detalles completos
  globalResults.details.push(result);
  
  // Log en consola con color
  const statusEmoji = statusCode === 200 || statusCode === 201 ? '✅' : 
                     statusCode === 401 || statusCode === 403 ? '🔒' :
                     statusCode === 404 ? '🔍' :
                     statusCode >= 500 ? '❌' : '⚠️';
  
  console.log(`${statusEmoji} ${method} ${endpoint} → ${statusCode}`);
  
  // Categorizar
  if (statusCode === 200 || statusCode === 201) {
    globalResults.success.push(result);
  } else if (statusCode === 401 || statusCode === 403) {
    globalResults.unauthorized.push(result);
  } else if (statusCode === 404) {
    globalResults.notFound.push(result);
  } else if (statusCode >= 500) {
    globalResults.serverError.push(result);
  } else {
    globalResults.other.push(result);
  }
}

/**
 * Hace un request GET con autenticación
 */
function getWithAuth(app, endpoint, authToken) {
  const req = request(app).get(endpoint);
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`);
  }
  return req;
}

/**
 * Hace un request POST con autenticación
 */
function postWithAuth(app, endpoint, authToken, data = {}) {
  const req = request(app).post(endpoint).send(data);
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`);
  }
  return req;
}

/**
 * Hace un request PUT con autenticación
 */
function putWithAuth(app, endpoint, authToken, data = {}) {
  const req = request(app).put(endpoint).send(data);
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`);
  }
  return req;
}

/**
 * Hace un request DELETE con autenticación
 */
function deleteWithAuth(app, endpoint, authToken) {
  const req = request(app).delete(endpoint);
  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`);
  }
  return req;
}

/**
 * Genera el reporte final consolidado
 */
function generateFinalReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, `health-test-report-${timestamp}.log`);
  
  // Crear directorio de logs si no existe
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Generar reporte en texto
  let report = '';
  report += '='.repeat(80) + '\n';
  report += 'REPORTE CONSOLIDADO DE SALUD DE ENDPOINTS\n';
  report += `Fecha: ${new Date().toLocaleString()}\n`;
  report += '='.repeat(80) + '\n\n';

  // Endpoints exitosos
  report += '✅ ENDPOINTS EXITOSOS (200/201):\n';
  report += `   Total: ${globalResults.success.length}\n`;
  globalResults.success.forEach(r => {
    report += `   ✓ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
  });
  report += '\n';

  // Endpoints no autorizados
  if (globalResults.unauthorized.length > 0) {
    report += '🔒 ENDPOINTS NO AUTORIZADOS (401/403):\n';
    report += `   Total: ${globalResults.unauthorized.length}\n`;
    report += '   ⚠️  ACCIÓN REQUERIDA: Verificar credenciales y permisos\n';
    globalResults.unauthorized.forEach(r => {
      report += `   ⚠ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
    report += '\n';
  }

  // Endpoints no encontrados
  if (globalResults.notFound.length > 0) {
    report += '� ENDPOINTS NO ENCONTRADOS (404):\n';
    report += `   Total: ${globalResults.notFound.length}\n`;
    report += '   ⚠️  ACCIÓN REQUERIDA: Verificar rutas en el servidor\n';
    globalResults.notFound.forEach(r => {
      report += `   ⚠ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
    report += '\n';
  }

  // Errores de servidor
  if (globalResults.serverError.length > 0) {
    report += '❌ ENDPOINTS CON ERROR DE SERVIDOR (500+):\n';
    report += `   Total: ${globalResults.serverError.length}\n`;
    report += '   ❌ ACCIÓN CRÍTICA: Revisar logs del servidor\n';
    globalResults.serverError.forEach(r => {
      report += `   ✗ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
      if (r.error) {
        report += `     Error: ${r.error}\n`;
      }
    });
    report += '\n';
  }

  // Otros
  if (globalResults.other.length > 0) {
    report += '⚠️  OTROS CÓDIGOS DE ESTADO:\n';
    report += `   Total: ${globalResults.other.length}\n`;
    globalResults.other.forEach(r => {
      report += `   ⚠ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
    report += '\n';
  }

  // Resumen
  const total = globalResults.success.length + 
                globalResults.unauthorized.length + 
                globalResults.notFound.length + 
                globalResults.serverError.length + 
                globalResults.other.length;
  
  report += '='.repeat(80) + '\n';
  report += 'RESUMEN GLOBAL:\n';
  report += `   Total endpoints probados: ${total}\n`;
  report += `   ✅ Exitosos: ${globalResults.success.length}\n`;
  report += `   🔒 No autorizados: ${globalResults.unauthorized.length}\n`;
  report += `   🔍 No encontrados: ${globalResults.notFound.length}\n`;
  report += `   ❌ Errores de servidor: ${globalResults.serverError.length}\n`;
  report += `   ⚠️  Otros: ${globalResults.other.length}\n`;
  
  const successRate = total > 0 ? (globalResults.success.length / total * 100).toFixed(2) : 0;
  report += `   📊 Tasa de éxito: ${successRate}%\n`;
  report += '='.repeat(80) + '\n\n';

  // Recomendaciones
  report += 'RECOMENDACIONES:\n\n';
  
  if (globalResults.unauthorized.length > 0) {
    report += '1. ENDPOINTS NO AUTORIZADOS (401/403):\n';
    report += '   - Verificar que el token de autenticación es válido\n';
    report += '   - Verificar que el usuario tiene permisos para estos endpoints\n';
    report += '   - Revisar archivo .env.test\n\n';
  }
  
  if (globalResults.notFound.length > 0) {
    report += '2. ENDPOINTS NO ENCONTRADOS (404):\n';
    report += '   - Verificar que las rutas están correctamente definidas\n';
    report += '   - Revisar archivos en src/routes/\n';
    report += '   - Verificar que el servidor tiene todas las rutas registradas\n\n';
  }
  
  if (globalResults.serverError.length > 0) {
    report += '3. ERRORES DE SERVIDOR (500+):\n';
    report += '   - Revisar logs del servidor para detalles del error\n';
    report += '   - Verificar conexión a base de datos\n';
    report += '   - Revisar implementación de los endpoints\n\n';
  }

  // Guardar archivo de log
  fs.writeFileSync(logFile, report, 'utf8');

  // Mostrar en consola
  console.log('\n');
  console.log(report);
  console.log(`📄 Reporte detallado guardado en: ${logFile}`);
  console.log('\n');

  // Generar también un archivo JSON con los detalles completos
  const jsonFile = path.join(logDir, `health-test-details-${timestamp}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      success: globalResults.success.length,
      unauthorized: globalResults.unauthorized.length,
      notFound: globalResults.notFound.length,
      serverError: globalResults.serverError.length,
      other: globalResults.other.length,
      successRate: parseFloat(successRate)
    },
    results: {
      success: globalResults.success,
      unauthorized: globalResults.unauthorized,
      notFound: globalResults.notFound,
      serverError: globalResults.serverError,
      other: globalResults.other
    },
    details: globalResults.details
  }, null, 2), 'utf8');
  
  console.log(`📊 Detalles completos en JSON: ${jsonFile}`);
  console.log('\n');
}

/**
 * Guarda los resultados en un archivo temporal para el teardown global
 */
function saveResultsToTemp() {
  const tempDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFile = path.join(tempDir, 'temp-results.json');
  fs.writeFileSync(tempFile, JSON.stringify(globalResults, null, 2), 'utf8');
}

/**
 * Limpia los resultados globales
 */
function clearResults() {
  globalResults.success = [];
  globalResults.unauthorized = [];
  globalResults.notFound = [];
  globalResults.serverError = [];
  globalResults.other = [];
  globalResults.details = [];
}

module.exports = {
  globalResults,
  categorizeResponse,
  getWithAuth,
  postWithAuth,
  putWithAuth,
  deleteWithAuth,
  generateFinalReport,
  clearResults,
  saveResultsToTemp
};
