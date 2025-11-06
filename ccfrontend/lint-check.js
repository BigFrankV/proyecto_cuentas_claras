#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'child_process';

console.log('\nIniciando verificación de lint...\n');

try {
  execSync('eslint .', { stdio: 'inherit' });
  
  console.log('\nEXITO! El lint se ejecutó correctamente. No hay errores.\n');
  process.exit(0);
} catch (error) {
  console.log('\nERROR: El lint encontró problemas.\n');
  console.log('Intenta ejecutar "npm run lint:fix" para solucionar automáticamente algunos errores.\n');
  process.exit(1);
}
