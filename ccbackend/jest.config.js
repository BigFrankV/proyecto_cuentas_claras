module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  
  // Ejecutar setup global antes de todos los tests
  globalSetup: '<rootDir>/test/health/jest.globalSetup.js',
  
  // Ejecutar teardown global después de todos los tests
  globalTeardown: '<rootDir>/test/health/jest.globalTeardown.js',
  
  // Setup que se ejecuta después de cada archivo de test
  setupFilesAfterEnv: ['<rootDir>/test/health/jest.setupFilesAfterEnv.js'],
  
  // Detectar archivos de test
  testMatch: [
    '**/test/**/*.test.js'
  ],
  
  // Ejecutar tests en serie (no en paralelo)
  maxWorkers: 1,
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**'
  ]
};
