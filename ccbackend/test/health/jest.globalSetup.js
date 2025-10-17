/**
 * Setup Global de Jest
 * Se ejecuta UNA VEZ antes de todos los tests
 */

module.exports = async () => {
  console.log('\n');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log('🧪 INICIANDO SUITE DE TESTS DE SALUD DE ENDPOINTS');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 Leyenda de estados:');
  console.log('   ✅ = Éxito (200/201)');
  console.log('   🔒 = No autorizado (401/403)');
  console.log('   🔍 = No encontrado (404)');
  console.log('   ❌ = Error de servidor (500+)');
  console.log('   ⚠️  = Otro código de estado');
  console.log('');
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Guardar timestamp de inicio
  global.__TEST_START_TIME__ = Date.now();
};
