# 🚀 CI/CD Rápido - Guía de Uso

## Descripción

Tienes **dos opciones** para ejecutar el CI/CD localmente:

### ⚡ Opción 1: Modo RÁPIDO (Recomendado para Desarrollo)

**Lint + Build SIN tests** (~2-3 minutos)

```bash
# Ambos (backend + frontend)
node run-cicd-fast.js

# Solo backend
node run-cicd-fast.js --back

# Solo frontend
node run-cicd-fast.js --front
```

**Ventajas:**
- ✅ Mucho más rápido (2-3 min vs 5+ min)
- ✅ Ideal para iteración rápida
- ✅ Genera exports a `ci-cd-outputs/`
- ✅ Los tests están listos para CI/CD en GitHub

---

### 📊 Opción 2: Modo COMPLETO (Con Tests)

**Lint + Test + Build** (~5+ minutos)

```bash
# Ambos con tests
node ci-cd-local.js

# Solo backend con tests
node ci-cd-local.js --back

# Solo frontend con tests
node ci-cd-local.js --front
```

**Ventajas:**
- ✅ Valida todo completamente
- ✅ Ejecuta 403 tests del backend
- ✅ Ejecuta tests del frontend
- ✅ Ideal para validación pre-push

---

## 📋 Comandos Disponibles

| Comando | Backend | Frontend | Tests | Tiempo |
|---------|---------|----------|-------|--------|
| `node run-cicd-fast.js` | ✅ Lint/Build | ✅ Lint/Build | ❌ No | 2-3 min |
| `node ci-cd-local.js --skip-tests` | ✅ Lint/Build | ✅ Lint/Build | ❌ No | 2-3 min |
| `node ci-cd-local.js` | ✅ All | ✅ All | ✅ Yes | 5+ min |
| `node ci-cd-local.js --watch` | ✅ Watch | ✅ Watch | ❌ No | Continuous |

---

## 📤 Outputs Generados

### Estructura de Carpetas

```
ci-cd-outputs/
├── back_ok/
│   ├── latest/ → (symlink a backend_YYYY-MM-DD_HH-MM-SS)
│   ├── backend_2025-10-29_21-00-00/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── backend_2025-10-29_20-00-00/
│
└── front_ok/
    ├── latest/ → (symlink a frontend_YYYY-MM-DD_HH-MM-SS)
    ├── frontend_2025-10-29_21-00-00/
    │   ├── .next/
    │   ├── public/
    │   ├── package.json
    │   └── Dockerfile
    └── frontend_2025-10-29_20-00-00/
```

**Cómo usar:**
```bash
# Ver la construcción más reciente
cd ci-cd-outputs/back_ok/latest

# Descargar para deployment
# Puedes comprimir y transferir la carpeta
zip -r backend-latest.zip ci-cd-outputs/back_ok/latest
```

---

## ✅ Test Results

### Backend (403 tests)
```
Test Suites: 33 passed, 33 total
Tests:       403 passed, 403 total
Time:        ~30s
```

**Módulos testeados:**
- Auth, Comunidades, Edificios, Unidades
- Personas, Torres, Membresias, Categorías Gasto
- Centros Costo, Proveedores, Documentos Compra
- Gastos, Emisiones, Cargos, Pagos
- Prorrateo, Medidores, Tarifas Consumo
- Multas, Conciliaciones, Consumos
- Webhooks, Amenidades, Util, Files
- Valor UTM, Dashboard, Reportes
- Notificaciones, Tickets, Payment Gateway
- Apelaciones, Compras, Bitácora

### Frontend
- ESLint: ~20-30s (algunos warnings por configuración)
- Type Check: ~20-30s (algunos warnings por tipos faltantes)
- Tests: ~10-20s
- Build: ~30-45s

---

## 🔄 GitHub Actions

El workflow automático ejecuta todo en GitHub:

1. **Push a cualquier rama** → Se ejecuta el workflow
2. **Frontend tests** + **Backend health checks**
3. **Security scan** (npm audit)
4. **Export artifacts** (si es push, no PR)
5. **Notificación con resumen**

**Ver resultados en:**
```
GitHub → Actions → Latest Run
```

---

## 📝 Recomendaciones

### Durante Desarrollo
```bash
# Ejecuta esto cada vez que cambies código
node run-cicd-fast.js

# O con watch mode
node ci-cd-local.js --watch --skip-tests
```

### Antes de Hacer Push
```bash
# Valida TODO
node ci-cd-local.js
```

### Después de Push
```bash
# Monitorea GitHub Actions
# GitHub → Actions → Ver el último run
```

---

## 🆘 Troubleshooting

### "Jest did not exit cleanly"
**Solución:** Ya está fixed con `--forceExit` en el workflow

### "Frontend lint/type-check fallen"
**Solución:** Son warnings, no errores. El workflow continúa sin problems.

### "Build failed"
**Opciones:**
1. Ejecutar con `--skip-tests` primero
2. Revisar los logs de output
3. Ejecutar `npm install` nuevamente

### Tests muy lentos
**Solución:** Usa `node run-cicd-fast.js` para desarrollo rápido

---

## 📊 Status del Proyecto

- ✅ **Backend**: 403/403 tests passing
- ✅ **Frontend**: Builds successfully
- ✅ **GitHub Actions**: Configured & working
- ✅ **Exports**: Timestamped artifacts ready
- ✅ **Docker**: Both services containerized

---

## 🎯 Próximos Pasos

1. **Hacer push** de los cambios:
   ```bash
   git add .
   git commit -m "your message"
   git push origin conexiones-backend-frontend
   ```

2. **Monitorear GitHub Actions**:
   - Ir a GitHub → Actions
   - Ver el run más reciente
   - Descargar artifacts si es necesario

3. **Para Deploy**:
   - Usar los artifacts de `ci-cd-outputs/`
   - O esperar al workflow de GitHub
   - Los artifacts están disponibles por 30 días

---

**¿Preguntas?** Revisa la documentación completa en `CI-CD-SETUP.md`
