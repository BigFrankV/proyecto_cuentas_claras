#!/usr/bin/env node

/**
 * CI/CD Local Script
 * Valida, compila y exporta frontend/backend a carpetas timestamped
 * 
 * Uso:
 *   node ci-cd-local.js              # Ejecuta frontend + backend
 *   node ci-cd-local.js --front      # Solo frontend
 *   node ci-cd-local.js --back       # Solo backend
 *   node ci-cd-local.js --watch      # Modo watch (recompila en cambios)
 *   node ci-cd-local.js --skip-tests # Salta tests (solo lint + build)
 *   node ci-cd-local.js --no-build   # Solo lint + tests (sin build)
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Intentar cargar chalk, pero continuar sin él si no está disponible
let chalk;
try {
  const chalkModule = require('chalk');
  // Verificar que sea un objeto válido
  if (chalkModule && typeof chalkModule.red === 'function') {
    chalk = chalkModule;
  } else {
    throw new Error('chalk not properly loaded');
  }
} catch (e) {
  // Fallback si chalk no está instalado o no funciona
  console.log('[SETUP] Usando fallback para chalk (sin colores)');
  chalk = {
    green: (msg) => msg,
    red: (msg) => msg,
    yellow: (msg) => msg,
    blue: (msg) => msg,
    gray: (msg) => msg,
    bold: (msg) => msg,
  };
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname);
const BACKEND_DIR = path.join(PROJECT_ROOT, 'ccbackend');
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'ccfrontend');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'ci-cd-outputs');

const BACK_OUTPUT_DIR = path.join(OUTPUT_DIR, 'back_ok');
const FRONT_OUTPUT_DIR = path.join(OUTPUT_DIR, 'front_ok');

const args = process.argv.slice(2);
const buildFront = !args.includes('--back');
const buildBack = !args.includes('--front');
const watchMode = args.includes('--watch');
const skipTests = args.includes('--skip-tests');
const noBuild = args.includes('--no-build');

// ============================================================================
// UTILIDADES
// ============================================================================

function getTimestamp() {
  return new Date().toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .slice(0, -5); // YYYY-MM-DD_HH-MM-SS
}

function log(message, level = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;

  try {
    switch (level) {
      case 'success':
        console.log(`${chalk.green(prefix)} ${chalk.green('✓')} ${message}`);
        break;
      case 'error':
        console.log(`${chalk.red(prefix)} ${chalk.red('✗')} ${message}`);
        break;
      case 'warning':
        console.log(`${chalk.yellow(prefix)} ${chalk.yellow('⚠')} ${message}`);
        break;
      case 'info':
        console.log(`${chalk.blue(prefix)} ${chalk.blue('ℹ')} ${message}`);
        break;
      case 'debug':
        console.log(`${chalk.gray(prefix)} ${chalk.gray('→')} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  } catch (err) {
    // Fallback si hay error con chalk
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
      debug: '→',
    };
    const icon = icons[level] || '';
    console.log(`${prefix} ${icon} ${message}`);
  }
}

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runCommand(command, cwd, label) {
  try {
    log(`Ejecutando: ${command}`, 'debug');
    execSync(command, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
    log(`${label} completado exitosamente`, 'success');
    return true;
  } catch (error) {
    log(`${label} FALLÓ: ${error.message}`, 'error');
    return false;
  }
}

// ============================================================================
// VALIDACIONES INICIALES
// ============================================================================

function validateEnvironment() {
  log('Validando ambiente...', 'info');

  // Verificar que directorios existan
  if (!fs.existsSync(BACKEND_DIR)) {
    log(`Backend directory no encontrado: ${BACKEND_DIR}`, 'error');
    process.exit(1);
  }

  if (!fs.existsSync(FRONTEND_DIR)) {
    log(`Frontend directory no encontrado: ${FRONTEND_DIR}`, 'error');
    process.exit(1);
  }

  log('Ambiente válido', 'success');
}

// ============================================================================
// LINTING
// ============================================================================

function lintBackend() {
  log('Linting backend...', 'info');
  return runCommand('npm run lint', BACKEND_DIR, 'Lint backend');
}

function lintFrontend() {
  log('Linting frontend...', 'info');
  return runCommand('npm run lint', FRONTEND_DIR, 'Lint frontend');
}

// ============================================================================
// TYPE CHECKING
// ============================================================================

function typeCheckFrontend() {
  log('Type checking frontend...', 'info');
  return runCommand('npm run type-check', FRONTEND_DIR, 'Type check frontend');
}

// ============================================================================
// TESTING
// ============================================================================

function testBackend() {
  if (skipTests) {
    log('⏭️  Tests skipped (--skip-tests)', 'warning');
    return true;
  }
  
  log('Testing backend...', 'info');
  return runCommand('npm run test:health -- --forceExit', BACKEND_DIR, 'Test backend');
}

function testFrontend() {
  if (skipTests) {
    log('⏭️  Tests skipped (--skip-tests)', 'warning');
    return true;
  }
  
  log('Testing frontend...', 'info');
  return runCommand('npm run test:ci -- --forceExit', FRONTEND_DIR, 'Test frontend');
}

// ============================================================================
// BUILD
// ============================================================================

function buildBackend() {
  log('Building backend...', 'info');

  // Backend no necesita build (Node.js directo)
  // Solo validamos que las dependencias estén instaladas
  if (!fs.existsSync(path.join(BACKEND_DIR, 'node_modules'))) {
    log('Instalando dependencias backend...', 'debug');
    runCommand('npm install', BACKEND_DIR, 'NPM install backend');
  }

  log('Backend listo para deployment', 'success');
  return true;
}

function buildFrontend() {
  log('Building frontend...', 'info');
  return runCommand('npm run build', FRONTEND_DIR, 'Build frontend');
}

// ============================================================================
// EXPORT
// ============================================================================

function exportBackend() {
  log('Exportando backend...', 'info');

  ensureDirExists(BACK_OUTPUT_DIR);

  const timestamp = getTimestamp();
  const exportPath = path.join(BACK_OUTPUT_DIR, `backend_${timestamp}`);

  try {
    // Copiar archivos necesarios
    const filesToCopy = [
      'src',
      'package.json',
      'package-lock.json',
      '.env.example',
      'Dockerfile',
      'README.md',
    ];

    ensureDirExists(exportPath);

    for (const file of filesToCopy) {
      const src = path.join(BACKEND_DIR, file);
      const dest = path.join(exportPath, file);

      if (fs.existsSync(src)) {
        if (fs.statSync(src).isDirectory()) {
          copyDir(src, dest);
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    }

    // Crear manifest
    const manifest = {
      exportedAt: new Date().toISOString(),
      type: 'backend',
      version: JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, 'package.json'), 'utf8')).version,
      buildStatus: 'success',
      files: filesToCopy,
    };

    fs.writeFileSync(
      path.join(exportPath, 'MANIFEST.json'),
      JSON.stringify(manifest, null, 2)
    );

    log(`Backend exportado a: ${exportPath}`, 'success');

    // Crear symlink a "latest"
    const latestLink = path.join(BACK_OUTPUT_DIR, 'latest');
    if (fs.existsSync(latestLink)) {
      fs.rmSync(latestLink, { recursive: true });
    }
    fs.symlinkSync(exportPath, latestLink);

    return true;
  } catch (error) {
    log(`Error exportando backend: ${error.message}`, 'error');
    return false;
  }
}

function exportFrontend() {
  log('Exportando frontend...', 'info');

  ensureDirExists(FRONT_OUTPUT_DIR);

  const timestamp = getTimestamp();
  const exportPath = path.join(FRONT_OUTPUT_DIR, `frontend_${timestamp}`);

  try {
    const nextBuildDir = path.join(FRONTEND_DIR, '.next');
    const publicDir = path.join(FRONTEND_DIR, 'public');

    if (!fs.existsSync(nextBuildDir)) {
      log('Build directory (.next) no encontrado', 'error');
      return false;
    }

    ensureDirExists(exportPath);

    // Copiar archivos necesarios
    const filesToCopy = [
      { src: '.next', dest: '.next' },
      { src: 'public', dest: 'public' },
      { src: 'package.json', dest: 'package.json' },
      { src: 'package-lock.json', dest: 'package-lock.json' },
      { src: 'next.config.js', dest: 'next.config.js' },
      { src: '.env.example', dest: '.env.example' },
      { src: 'Dockerfile', dest: 'Dockerfile' },
      { src: 'README.md', dest: 'README.md' },
    ];

    for (const { src, dest } of filesToCopy) {
      const srcPath = path.join(FRONTEND_DIR, src);
      const destPath = path.join(exportPath, dest);

      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }

    // Crear manifest
    const manifest = {
      exportedAt: new Date().toISOString(),
      type: 'frontend',
      version: JSON.parse(fs.readFileSync(path.join(FRONTEND_DIR, 'package.json'), 'utf8')).version,
      buildStatus: 'success',
      files: filesToCopy.map((f) => f.src),
    };

    fs.writeFileSync(
      path.join(exportPath, 'MANIFEST.json'),
      JSON.stringify(manifest, null, 2)
    );

    log(`Frontend exportado a: ${exportPath}`, 'success');

    // Crear symlink a "latest"
    const latestLink = path.join(FRONT_OUTPUT_DIR, 'latest');
    if (fs.existsSync(latestLink)) {
      fs.rmSync(latestLink, { recursive: true });
    }
    fs.symlinkSync(exportPath, latestLink);

    return true;
  } catch (error) {
    log(`Error exportando frontend: ${error.message}`, 'error');
    return false;
  }
}

// ============================================================================
// UTILIDAD: COPIAR DIRECTORIOS
// ============================================================================

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);

    if (fs.statSync(srcFile).isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// ============================================================================
// PIPELINE
// ============================================================================

async function runPipeline() {
  console.log('\n');
  log('========================================', 'info');
  log('CI/CD LOCAL - INICIANDO', 'info');
  log('========================================', 'info');
  log(`Timestamp: ${getTimestamp()}`, 'debug');
  log(`Build Frontend: ${buildFront}`, 'debug');
  log(`Build Backend: ${buildBack}`, 'debug');
  if (skipTests) log(`Skip Tests: ${skipTests}`, 'warning');
  if (noBuild) log(`No Build: ${noBuild}`, 'warning');
  console.log('\n');

  validateEnvironment();

  let success = true;

  // ========== BACKEND ==========
  if (buildBack) {
    console.log('\n');
    log('┌─ BACKEND PIPELINE ─┐', 'info');
    console.log('\n');

    if (!lintBackend()) success = false;
    if (!noBuild && !testBackend()) success = false;
    if (!noBuild && !buildBackend()) success = false;
    if (success && !noBuild && !exportBackend()) success = false;

    console.log('\n');
  }

  // ========== FRONTEND ==========
  if (buildFront) {
    console.log('\n');
    log('┌─ FRONTEND PIPELINE ─┐', 'info');
    console.log('\n');

    if (!lintFrontend()) success = false;
    if (!typeCheckFrontend()) success = false;
    if (!noBuild && !testFrontend()) success = false;
    if (!noBuild && !buildFrontend()) success = false;
    if (success && !noBuild && !exportFrontend()) success = false;

    console.log('\n');
  }

  // ========== RESULTADO FINAL ==========
  console.log('\n');
  log('========================================', 'info');

  if (success) {
    log('✓ CI/CD COMPLETADO EXITOSAMENTE', 'success');
    log(`Outputs en: ${OUTPUT_DIR}`, 'success');
  } else {
    log('✗ CI/CD FALLÓ', 'error');
    process.exit(1);
  }

  log('========================================', 'info');
  console.log('\n');
}

// ============================================================================
// MAIN
// ============================================================================

if (watchMode) {
  log('Modo WATCH activado (recompila en cambios)', 'warning');
  log('Presiona Ctrl+C para salir', 'debug');

  // Intentar cargar chokidar, pero si no está disponible, usar alternativa
  let chokidar;
  try {
    chokidar = require('chokidar');
  } catch (e) {
    log('Chokidar no disponible. Para usar watch mode, instala: npm install --save-dev chokidar', 'error');
    log('Ejecutando build único en lugar de watch mode...', 'warning');
    runPipeline().catch((error) => {
      log(`Error: ${error.message}`, 'error');
      process.exit(1);
    });
    process.exit(0);
  }

  const watcher = chokidar.watch([BACKEND_DIR, FRONTEND_DIR], {
    ignored: /(node_modules|\.next|\.git)/,
    persistent: true,
  });

  let isBuilding = false;

  async function rebuild() {
    if (isBuilding) return;
    isBuilding = true;
    try {
      await runPipeline();
    } finally {
      isBuilding = false;
    }
  }

  watcher.on('change', (filePath) => {
    log(`Cambio detectado: ${filePath}`, 'debug');
    rebuild();
  });

  // Build inicial
  rebuild();
} else {
  runPipeline().catch((error) => {
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  });
}
