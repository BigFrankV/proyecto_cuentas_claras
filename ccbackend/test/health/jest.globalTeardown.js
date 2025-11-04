/**
 * Teardown Global de Jest
 * Se ejecuta UNA VEZ después de todos los tests
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // Calcular tiempo total
  const totalTime = global.__TEST_START_TIME__
    ? ((Date.now() - global.__TEST_START_TIME__) / 1000).toFixed(2)
    : 'N/A';

  console.log('');
  console.log(
    '════════════════════════════════════════════════════════════════════════════════'
  );
  console.log('✅ SUITE DE TESTS COMPLETADA');
  console.log(`⏱️  Tiempo total: ${totalTime}s`);
  console.log(
    '════════════════════════════════════════════════════════════════════════════════'
  );
  console.log('');
  console.log('📊 GENERANDO REPORTE CONSOLIDADO...');
  console.log('');

  try {
    // Intentar generar el reporte final
    // Nota: Como estamos en un contexto global separado,
    // necesitamos leer los resultados desde un archivo global
    const globalResultsPath = path.join(
      __dirname,
      '..',
      '..',
      'logs',
      'global-results.json'
    );

    if (fs.existsSync(globalResultsPath)) {
      const resultsData = fs.readFileSync(globalResultsPath, 'utf8');
      const results = JSON.parse(resultsData);

      // Generar reporte final
      generateFinalReport(results);

      // Limpiar archivo temporal
      fs.unlinkSync(globalResultsPath);

      console.log('');
      console.log('✅ Reporte generado exitosamente');
      console.log(`   📄 Reporte: logs/health-test-report-*.log`);
      console.log(`   📊 Detalles: logs/health-test-details-*.json`);
    } else {
      console.log('⚠️  No se encontraron resultados para generar reporte');
      console.log(`   (Buscando: ${globalResultsPath})`);
    }
  } catch (error) {
    console.error('❌ Error al generar reporte final:', error.message);
  }

  // Limpiar recursos (cerrar conexiones DB, etc.)
  try {
    await require('./setup').cleanupTestSetup();
  } catch (error) {
    console.error('❌ Error en cleanup:', error.message);
  }

  console.log('');
  console.log(
    '════════════════════════════════════════════════════════════════════════════════'
  );
  console.log('');
};

/**
 * Genera el reporte final consolidado
 */
function generateFinalReport(globalResults) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logsDir = path.join(__dirname, '..', '..', 'logs');

  // Crear directorio de logs si no existe
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Archivo de log en texto
  const logFile = path.join(logsDir, `health-test-report-${timestamp}.log`);

  // Archivo de detalles en JSON
  const jsonFile = path.join(logsDir, `health-test-details-${timestamp}.json`);

  // Calcular totales
  const total =
    globalResults.success.length +
    globalResults.unauthorized.length +
    globalResults.notFound.length +
    globalResults.serverError.length +
    globalResults.other.length;

  const successRate =
    total > 0 ? ((globalResults.success.length / total) * 100).toFixed(2) : 0;

  // Generar contenido del reporte
  let report = '';
  report +=
    '================================================================================\n';
  report += 'REPORTE CONSOLIDADO DE SALUD DE ENDPOINTS\n';
  report += `Fecha: ${new Date().toLocaleString('es-ES')}\n`;
  report +=
    '================================================================================\n\n';

  // Sección de éxitos
  report += `✅ ENDPOINTS EXITOSOS (200/201):\n`;
  report += `   Total: ${globalResults.success.length}\n`;
  if (globalResults.success.length > 0) {
    globalResults.success.forEach((r) => {
      report += `   ✓ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
  } else {
    report += '   (Ninguno)\n';
  }
  report += '\n';

  // Sección de no autorizados
  report += `🔒 ENDPOINTS NO AUTORIZADOS (401/403):\n`;
  report += `   Total: ${globalResults.unauthorized.length}\n`;
  if (globalResults.unauthorized.length > 0) {
    report += `   ⚠️  ACCIÓN REQUERIDA: Verificar credenciales y permisos\n`;
    globalResults.unauthorized.forEach((r) => {
      report += `   ⚠ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
  } else {
    report += '   (Ninguno - ¡Excelente!)\n';
  }
  report += '\n';

  // Sección de no encontrados
  report += `🔍 ENDPOINTS NO ENCONTRADOS (404):\n`;
  report += `   Total: ${globalResults.notFound.length}\n`;
  if (globalResults.notFound.length > 0) {
    report += `   ⚠️  ACCIÓN REQUERIDA: Verificar rutas en el servidor\n`;
    globalResults.notFound.forEach((r) => {
      report += `   ⚠ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
  } else {
    report += '   (Ninguno - ¡Excelente!)\n';
  }
  report += '\n';

  // Sección de errores de servidor
  report += `❌ ENDPOINTS CON ERROR DE SERVIDOR (500+):\n`;
  report += `   Total: ${globalResults.serverError.length}\n`;
  if (globalResults.serverError.length > 0) {
    report += `   🚨 URGENTE: Revisar logs del servidor\n`;
    globalResults.serverError.forEach((r) => {
      report += `   ❌ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
      if (r.error) {
        report += `      Error: ${r.error}\n`;
      }
    });
  } else {
    report += '   (Ninguno - ¡Excelente!)\n';
  }
  report += '\n';

  // Sección de otros
  if (globalResults.other.length > 0) {
    report += `⚠️ OTROS CÓDIGOS DE ESTADO:\n`;
    report += `   Total: ${globalResults.other.length}\n`;
    globalResults.other.forEach((r) => {
      report += `   ⚠ ${r.method} ${r.endpoint} → ${r.statusCode} [${r.timestamp}]\n`;
    });
    report += '\n';
  }

  // Resumen global
  report +=
    '================================================================================\n';
  report += 'RESUMEN GLOBAL:\n';
  report += `   Total endpoints probados: ${total}\n`;
  report += `   ✅ Exitosos: ${globalResults.success.length}\n`;
  report += `   🔒 No autorizados: ${globalResults.unauthorized.length}\n`;
  report += `   🔍 No encontrados: ${globalResults.notFound.length}\n`;
  report += `   ❌ Errores de servidor: ${globalResults.serverError.length}\n`;
  if (globalResults.other.length > 0) {
    report += `   ⚠️  Otros: ${globalResults.other.length}\n`;
  }
  report += `   📊 Tasa de éxito: ${successRate}%\n`;
  report +=
    '================================================================================\n\n';

  // Recomendaciones
  report += 'RECOMENDACIONES:\n\n';

  if (globalResults.unauthorized.length > 0) {
    report += '1. ENDPOINTS NO AUTORIZADOS (401/403):\n';
    report += '   - Verificar que el token de autenticación es válido\n';
    report +=
      '   - Verificar que el usuario tiene permisos para estos endpoints\n';
    report +=
      '   - Revisar archivo .env.test con TEST_USER_EMAIL y TEST_USER_PASSWORD\n';
    report += '   - Verificar que el usuario existe en la base de datos\n\n';
  }

  if (globalResults.notFound.length > 0) {
    report += '2. ENDPOINTS NO ENCONTRADOS (404):\n';
    report += '   - Verificar que las rutas están correctamente definidas\n';
    report += '   - Revisar archivos en src/routes/\n';
    report +=
      '   - Verificar que el servidor tiene todas las rutas registradas en src/index.js\n\n';
  }

  if (globalResults.serverError.length > 0) {
    report += '3. ENDPOINTS CON ERROR DE SERVIDOR (500+):\n';
    report += '   - URGENTE: Revisar los logs del servidor para más detalles\n';
    report += '   - Verificar conexión a base de datos\n';
    report += '   - Verificar que todas las dependencias están instaladas\n';
    report +=
      '   - Revisar la implementación específica de cada endpoint con error\n\n';
  }

  if (globalResults.success.length === total) {
    report +=
      '¡EXCELENTE! Todos los endpoints respondieron correctamente (200/201).\n';
    report += 'No se requieren acciones adicionales.\n\n';
  }

  // Guardar reporte en archivo
  fs.writeFileSync(logFile, report, 'utf8');

  // Guardar detalles en JSON
  const jsonData = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      success: globalResults.success.length,
      unauthorized: globalResults.unauthorized.length,
      notFound: globalResults.notFound.length,
      serverError: globalResults.serverError.length,
      other: globalResults.other.length,
      successRate: parseFloat(successRate),
    },
    results: globalResults,
    details: globalResults.details || [],
  };

  fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2), 'utf8');

  return { logFile, jsonFile };
}
