#!/usr/bin/env node

/**
 * 🚀 CI/CD FAST MODE
 * Ejecuta lint + build sin tests (modo desarrollo rápido)
 * 
 * Uso:
 *   node run-cicd-fast.js          # Ambos (backend + frontend)
 *   node run-cicd-fast.js --back   # Solo backend
 *   node run-cicd-fast.js --front  # Solo frontend
 *   node run-cicd-fast.js --test   # Con tests (modo full)
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const backendOnly = args.includes('--back');
const frontendOnly = args.includes('--front');
const withTests = args.includes('--test');

const flags = withTests 
  ? ['--skip-tests'] 
  : [];

const cicdScript = path.join(__dirname, 'ci-cd-local.js');

let command = `node ${cicdScript}`;

if (backendOnly) {
  command += ' --back';
} else if (frontendOnly) {
  command += ' --front';
}

if (flags.length > 0) {
  command += ` ${flags.join(' ')}`;
}

if (!withTests) {
  command += ' --skip-tests';
}

console.log('🚀 Ejecutando CI/CD rápido...\n');
console.log(`Comando: ${command}\n`);

try {
  execSync(command, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  console.log('\n✅ CI/CD completado exitosamente!');
  process.exit(0);
} catch (err) {
  console.error('\n❌ CI/CD falló');
  process.exit(1);
}
