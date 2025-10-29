# 🚀 CI/CD Local - Quick Start Guide

## ⚡ 5 Minutos para Empezar

### Paso 1: Instalación (primera vez)

**Windows:**
```batch
ci-cd-local.bat
# Selecciona opción 7 (Configuración inicial)
```

**Linux/Mac:**
```bash
bash setup-ci-cd.sh
```

### Paso 2: Primer Build

```bash
node ci-cd-local.js
```

**Espera 3-5 minutos (primer build es lento)**

### Paso 3: Encuentra tus Builds ✅

```
ci-cd-outputs/
├── front_ok/
│   ├── latest -> frontend_2025-10-29_14-30-00/
│   └── frontend_2025-10-29_14-30-00/    ← Listo para deploy!
└── back_ok/
    ├── latest -> backend_2025-10-29_14-30-00/
    └── backend_2025-10-29_14-30-00/     ← Listo para deploy!
```

---

## 🎯 Comandos Principales

### Build Completo
```bash
node ci-cd-local.js
```

### Solo Frontend
```bash
node ci-cd-local.js --front
```

### Solo Backend
```bash
node ci-cd-local.js --back
```

### Modo Watch (Desarrollo)
```bash
node ci-cd-local.js --watch
# Recompila automáticamente en cambios
# Perfecto para desarrollo iterativo
```

### Interfaz Gráfica (Windows)
```batch
ci-cd-local.bat
# Menú interactivo con todas las opciones
```

---

## 📊 ¿Qué Hace el Script?

### Backend Pipeline
1. 🔍 **Lint** - Valida código con ESLint
2. ✅ **Tests** - Ejecuta health checks
3. 📦 **Build** - Prepara dependencias
4. 📤 **Export** - Guarda en `back_ok/backend_TIMESTAMP/`

### Frontend Pipeline
1. 🔍 **Lint** - Valida código con ESLint
2. 📝 **Type Check** - Valida TypeScript
3. ✅ **Tests** - Ejecuta tests con Jest
4. 🏗️ **Build** - Compila con Next.js
5. 📤 **Export** - Guarda en `front_ok/frontend_TIMESTAMP/`

---

## 📂 Estructura de Output

```
front_ok/
├── latest/                           # Symlink al último
├── frontend_2025-10-29_14-30-00/
│   ├── .next/                        # Build compilado (listo para prod)
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── Dockerfile
│   ├── MANIFEST.json                 # Metadatos del build
│   └── README.md
└── frontend_2025-10-29_12-00-00/

back_ok/
├── latest/
├── backend_2025-10-29_14-30-00/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── MANIFEST.json
│   └── README.md
└── backend_2025-10-29_12-00-00/
```

---

## 🚀 Usar los Builds Exportados

### Frontend

```bash
cd ci-cd-outputs/front_ok/latest

# Opción 1: Correr directo (en desarrollo)
npm ci
npm start

# Opción 2: Con Docker
docker build -t frontend .
docker run -p 3000:3000 frontend
```

### Backend

```bash
cd ci-cd-outputs/back_ok/latest

# Opción 1: Correr directo
npm ci
cp .env.example .env
# Edita .env con tus valores
npm start

# Opción 2: Con Docker
docker build -t backend .
docker run -p 3000:3000 --env-file .env backend
```

---

## 🔄 CI/CD + GitHub Actions

### Para Validación en Team

GitHub Actions valida automáticamente en PRs. Los artifacts se guardan en:

**GitHub → Actions → Latest Build → Artifacts**

Descargar y usar igual que los builds locales:

```bash
# 1. Descargar artifact desde GitHub
# 2. Extraer
# 3. Usar como `ci-cd-outputs/front_ok/...`
```

---

## ⚙️ Configuración Avanzada

### Cambiar Directorio de Output

Editar en `ci-cd-local.js`:

```javascript
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'mis-builds'); // ← Cambiar ruta
```

### Añadir Pasos Custom

En `ci-cd-local.js`, agregar función:

```javascript
function myCustomStep() {
  log('Mi paso custom...', 'info');
  return runCommand('npm run custom', BACKEND_DIR, 'Custom step');
}

// Agregar al pipeline:
if (!myCustomStep()) success = false;
```

### Cambiar Frecuencia de Watch

En `ci-cd-local.js`:

```javascript
const watcher = chokidar.watch([BACKEND_DIR, FRONTEND_DIR], {
  ignored: /(node_modules|\.next|\.git)/,
  awaitWriteFinish: {
    stabilityThreshold: 2000,  // ← Cambiar delay (ms)
  },
});
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| `npm: command not found` | Instalar Node.js desde https://nodejs.org |
| Build toma mucho tiempo | Primer build es normal. Posteriores son rápidos |
| Tests fallan | Ejecutar `npm run test:debug` en ccfrontend/ccbackend |
| TypeScript errors | Ejecutar `npm run type-check` en ccfrontend |
| Permisos denegados (Linux) | `chmod +x ci-cd-local.js setup-ci-cd.sh` |

---

## 📞 Próximos Pasos

1. ✅ Setup inicial completado
2. 🔄 Usa local para desarrollo
3. 🌐 GitHub Actions valida PRs
4. 📤 Deploy los exports generados

---

**¿Preguntas? Ver `CI-CD-SETUP.md` para documentación completa**
