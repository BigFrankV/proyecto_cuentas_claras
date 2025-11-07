#!/usr/bin/env node

/**
 * Script para exportar la aplicación Next.js a archivos estáticos
 * Cambia temporalmente output: 'export', construye, y luego revierte
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'next.config.mjs');

// Lee la configuración actual
let config = fs.readFileSync(configPath, 'utf8');

// Guarda el contenido original
const originalConfig = config;

try {
  // Reemplaza 'standalone' con 'export'
  config = config.replace("output: 'standalone'", "output: 'export'");
  
  // Escribe la configuración modificada
  fs.writeFileSync(configPath, config);
  // eslint-disable-next-line no-console
  console.log('✓ Configuración modificada para exportación estática');

  // Ejecuta next build
  // eslint-disable-next-line no-console
  console.log('→ Construyendo aplicación...');
  execSync('next build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // eslint-disable-next-line no-console
  console.log('✓ Exportación completada correctamente');
  // eslint-disable-next-line no-console
  console.log('→ Los archivos estáticos están en la carpeta "out/"');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('✗ Error durante la exportación:', error.message);
  process.exit(1);
} finally {
  // Revierte la configuración original
  fs.writeFileSync(configPath, originalConfig);
  // eslint-disable-next-line no-console
  console.log('✓ Configuración revertida a original');
}
