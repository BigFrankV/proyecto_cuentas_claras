# 🚀 CI/CD Local & GitHub Actions - Guía Completa

## Índice
1. [Inicio Rápido](#-inicio-rápido)
2. [Opción 1: CI/CD Local (Recomendado)](#-opción-1-cicd-local-recomendado)
3. [Opción 2: GitHub Actions (Cloud)](#-opción-2-github-actions-cloud)
4. [Opción 3: Self-Hosted Runner](#-opción-3-self-hosted-runner-avanzado)
5. [Estructura de Outputs](#-estructura-de-outputs)
6. [Troubleshooting](#-troubleshooting)

---

## ⚡ Inicio Rápido

### Script Local (Más Rápido)

```bash
# Windows
node ci-cd-local.js              # Build both
node ci-cd-local.js --front      # Frontend only
node ci-cd-local.js --back       # Backend only
node ci-cd-local.js --watch      # Watch mode
```

Los builds compilados se guardarán en:
- `ci-cd-outputs/front_ok/frontend_YYYY-MM-DD_HH-MM-SS/`
- `ci-cd-outputs/back_ok/backend_YYYY-MM-DD_HH-MM-SS/`

---

## 🏠 Opción 1: CI/CD Local (RECOMENDADO)

### ¿Qué es?
Script Node.js que corre **completamente en tu máquina**:
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Tests (Jest)
- ✅ Build (Next.js, Node.js)
- ✅ Export a carpetas timestamped
- ✅ Modo watch (recompila en cambios)

### Instalación

```bash
# 1. Instalar dependencias globales (una sola vez)
npm install --save-dev chalk chokidar

# O usar el script de setup:
bash setup-ci-cd.sh
```

### Uso

#### Build Completo
```bash
node ci-cd-local.js
```

Output:
```
[12:34:56] ℹ CI/CD LOCAL - INICIANDO
[12:34:56] ℹ Validando ambiente...
[12:35:00] ✓ Lint backend completado exitosamente
[12:35:05] ✓ Test backend completado exitosamente
[12:35:10] ✓ Build frontend completado exitosamente
[12:35:15] ✓ Frontend exportado a: ci-cd-outputs/front_ok/frontend_2025-10-29_12-35-15
[12:35:20] ✓ Backend exportado a: ci-cd-outputs/back_ok/backend_2025-10-29_12-35-15
[12:35:20] ✓ CI/CD COMPLETADO EXITOSAMENTE
```

#### Solo Frontend
```bash
node ci-cd-local.js --front
```

#### Solo Backend
```bash
node ci-cd-local.js --back
```

#### Modo Watch (Recompila en Cambios)
```bash
node ci-cd-local.js --watch
```

El script monitoreará cambios en `ccbackend/` y `ccfrontend/`, y recompilará automáticamente.

### Output Structure

```
ci-cd-outputs/
├── front_ok/
│   ├── latest -> frontend_2025-10-29_12-35-15
│   ├── frontend_2025-10-29_12-35-15/
│   │   ├── .next/                   # Next.js build output
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── Dockerfile
│   │   └── MANIFEST.json             # Metadatos del build
│   ├── frontend_2025-10-29_11-20-00/
│   └── ...
└── back_ok/
    ├── latest -> backend_2025-10-29_12-35-15
    ├── backend_2025-10-29_12-35-15/
    │   ├── src/
    │   ├── package.json
    │   ├── Dockerfile
    │   └── MANIFEST.json
    └── ...
```

### MANIFEST.json

Cada export genera un `MANIFEST.json` con metadatos:

```json
{
  "exportedAt": "2025-10-29T12:35:15Z",
  "type": "frontend",
  "version": "1.0.0",
  "buildStatus": "success",
  "files": ["package.json", "next.config.js", ...]
}
```

### Automatizar con Task Scheduler (Windows)

Para que se ejecute automáticamente cada vez que hagas push:

1. **Crear archivo `check-git-changes.bat`:**

```batch
@echo off
REM Script que corre en background y checa cambios git

:loop
git status > nul 2>&1
timeout /t 60 /nobreak
goto loop
```

2. **Crear task en Task Scheduler:**
```
Programa: node
Argumentos: ci-cd-local.js
Carpeta: C:\Users\patri\Documents\GitHub\proyecto_cuentas_claras
Iniciar cuando: PC inicia
```

---

## ☁️ Opción 2: GitHub Actions (Cloud)

### ¿Qué es?
Pipelines que corren en **servidores de GitHub** (gratis hasta 2,000 min/mes).

### Archivos

Archivo de configuración: `.github/workflows/ci-cd.yml`

### Características

✅ **Lint & Type Check** - Valida código automáticamente en cada PR
✅ **Tests** - Ejecuta suite de tests
✅ **Build** - Compila frontend/backend
✅ **Export** - Genera artifacts descargables
✅ **Security Scan** - Audita vulnerabilidades
✅ **Artifacts** - Guarda builds por 30 días

### Triggers

El pipeline corre automáticamente cuando:
- 📌 Push a `main`, `develop`, o `conexiones-backend-frontend`
- 🔀 Pull Request a `main` o `develop`
- 🖱️ Trigger manual desde Actions tab

### Descargar Artifacts

1. Ir a GitHub → Actions → Último workflow
2. Scroll down → Artifacts
3. Descargar `backend-build-XXX` o `frontend-build-XXX`

```
backend-build-123/
├── back_ok/
│   └── backend_2025-10-29_12-35-15/
│       ├── src/
│       ├── package.json
│       └── MANIFEST.json
```

### Integrar con Local

```bash
# Script que descarga últimos artifacts
curl -L "https://github.com/BigFrankV/proyecto_cuentas_claras/actions/runs/latest/download/backend-build-*" \
  -o backend-latest.zip

unzip backend-latest.zip -d ci-cd-outputs/
```

---

## 🤖 Opción 3: Self-Hosted Runner (Avanzado)

### ¿Qué es?
Ejecutar GitHub Actions **en tu máquina local** como un "worker".

### Ventajas
- ✅ Sin límite de minutos
- ✅ Acceso a recursos locales
- ✅ Builds más rápidos

### Desventajas
- PC debe estar encendida 24/7
- Más complejo de configurar

### Setup (Windows)

1. **Descargar runner:**

```bash
cd C:\gh-runner
curl -o actions-runner-win-x64-2.317.0.zip \
  https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-win-x64-2.317.0.zip
```

2. **Extractar:**

```bash
tar -xzf actions-runner-win-x64-2.317.0.zip
```

3. **Configurar:**

```bash
# Generar token en GitHub → Settings → Actions → Runners
.\config.cmd --url https://github.com/BigFrankV/proyecto_cuentas_claras --token ABC123
```

4. **Instalar como servicio:**

```bash
.\install-svc.cmd
```

5. **Iniciar:**

```bash
net start ActionsRunnerSvc
```

---

## 📁 Estructura de Outputs Explicada

### Front OK Folder

```
front_ok/
├── latest/               # Symlink al último build
├── frontend_2025-10-29_14-30-00/
│   ├── .next/           # Build output de Next.js (listo para deploy)
│   ├── public/          # Assets estáticos
│   ├── package.json     # Dependencies (usa `npm ci` para instalar)
│   ├── next.config.js   # Configuración Next.js
│   ├── Dockerfile       # Para deploy en Docker
│   ├── MANIFEST.json    # Metadatos
│   └── README.md
├── frontend_2025-10-29_12-00-00/
└── frontend_2025-10-28_15-45-30/
```

**Para usar un build export:**

```bash
cd ci-cd-outputs/front_ok/latest

# Instalar dependencias
npm ci

# Correr en producción
npm start

# O con Docker
docker build -t cuentas-claras-frontend .
docker run -p 3000:3000 cuentas-claras-frontend
```

### Back OK Folder

```
back_ok/
├── latest/               # Symlink al último build
├── backend_2025-10-29_14-30-00/
│   ├── src/             # Código fuente
│   ├── package.json
│   ├── .env.example     # Copy a .env y configura
│   ├── Dockerfile
│   ├── MANIFEST.json
│   └── README.md
└── backend_2025-10-28_15-45-30/
```

**Para usar un build export:**

```bash
cd ci-cd-outputs/back_ok/latest

# Instalar dependencias
npm ci

# Configurar variables
cp .env.example .env
# Edita .env con tus valores

# Correr
npm start

# O con Docker
docker build -t cuentas-claras-api .
docker run -p 3000:3000 --env-file .env cuentas-claras-api
```

---

## 🔧 Configuración Avanzada

### Custom Build Steps

Editar `ci-cd-local.js`:

```javascript
// Agregar step custom
function buildCustom() {
  log('Ejecutando custom step...', 'info');
  return runCommand('npm run custom:build', FRONTEND_DIR, 'Custom build');
}

// Agregar a pipeline
if (!buildCustom()) success = false;
```

### Cambiar Directorio de Output

En `ci-cd-local.js`:

```javascript
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'mis-builds'); // ← Cambiar
```

### Añadir más tests

Backend:

```bash
# En ccbackend/package.json
"test:all": "jest --coverage",
"test:integration": "jest --testPathPattern=integration"
```

Frontend:

```bash
# En ccfrontend/package.json
"test:e2e": "playwright test"
```

---

## 🚨 Troubleshooting

### Error: "npm: command not found"

```bash
# Instalar Node.js desde https://nodejs.org
# O con Chocolatey (Windows):
choco install nodejs
```

### Error: "TypeScript compilation failed"

```bash
# Verificar tipos en frontend
cd ccfrontend
npm run type-check

# Corregir errores y reintentar
```

### Error: "Jest tests failed"

```bash
# Correr tests localmente para debugging
cd ccfrontend
npm run test:debug

# Ver coverage
npm run test:coverage
```

### Build toma mucho tiempo

Primer build es lento (instala dependencias). Builds posteriores son más rápidos.

```bash
# Limpiar cachés
rm -rf ccbackend/node_modules ccfrontend/node_modules .next

# Reintentar
node ci-cd-local.js
```

### No se crean las carpetas output

```bash
# Verificar permisos
ls -la ci-cd-outputs/

# Si no existen, crearlas manualmente
mkdir -p ci-cd-outputs/front_ok
mkdir -p ci-cd-outputs/back_ok
```

### GitHub Actions no se dispara

1. Verificar `.github/workflows/ci-cd.yml` está en rama correcta
2. Hacer commit de cambios:
   ```bash
   git add .github/workflows/ci-cd.yml
   git commit -m "Add CI/CD workflow"
   git push
   ```
3. Ir a GitHub → Actions → Ver workflow

---

## 📊 Comparativa: ¿Cuál Usar?

| Aspecto | Local | GitHub Actions | Self-Hosted |
|--------|-------|-----------------|-------------|
| **Costo** | Gratis | Gratis (2k min/mes) | Gratis |
| **Velocidad** | ⚡ Rápido | 🟡 Medio | ⚡ Rápido |
| **Setup** | 5 min | 5 min | 30 min |
| **Requires Server** | No | No | Sí |
| **Ideal Para** | Dev Local | Team | High-volume |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### Recomendación

**Para desarrollo actual:**
- Usa **CI/CD Local** para builds rápidos durante desarrollo
- Usa **GitHub Actions** para validación en el equipo

**Cuando tengas servidor:**
- Implementa **Self-Hosted Runner** para builds automáticos

---

## 📚 Recursos Adicionales

- [Node.js Docs](https://nodejs.org)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [ESLint Configuration](https://eslint.org)
- [Jest Testing](https://jestjs.io)
- [Next.js Build Output](https://nextjs.org/docs/advanced-features/output-file-tracing)

---

## ❓ FAQ

**P: ¿Puedo correr ambos (local + GitHub Actions)?**
R: Sí, úsalos complementariamente:
- Local: durante desarrollo
- GitHub Actions: validación en PR antes de merge

**P: ¿Cómo automatizar el CI/CD diario?**
R: Usa `--watch` en una terminal abierta:
```bash
node ci-cd-local.js --watch
```

**P: ¿Dónde puedo guardar estos outputs?**
R: Opciones:
- Carpeta local (`ci-cd-outputs/`)
- Cloud storage (AWS S3, Azure Blob)
- FTP server
- Git LFS (para versionado)

**P: ¿Cómo limpiar builds antiguos?**
R: Script para limpiar builds > 7 días:
```bash
find ci-cd-outputs -type d -mtime +7 -exec rm -rf {} +
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs detallados
2. Consulta Troubleshooting arriba
3. Abre un issue en el repo

---

**Última actualización**: 2025-10-29
**Versión**: 1.0.0
