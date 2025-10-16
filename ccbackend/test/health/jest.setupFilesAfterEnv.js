/**
 * Setup global de Jest que se ejecuta en cada worker
 * Configura hooks afterAll para guardar resultados
 */

const { saveResultsToTemp } = require('./helpers');

// Hook afterAll global que se ejecuta después de cada archivo de test
afterAll(async () => {
  // Guardar resultados actuales
  saveResultsToTemp();
});
