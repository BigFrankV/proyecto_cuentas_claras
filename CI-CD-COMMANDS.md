# 🚀 CI/CD Local - Commandos Rápidos

## Banderas Disponibles

```bash
# Build COMPLETO (lint + tests + build + export)
node ci-cd-local.js

# Solo FRONTEND
node ci-cd-local.js --front

# Solo BACKEND
node ci-cd-local.js --back

# Modo WATCH (recompila en cambios)
node ci-cd-local.js --watch

# SALTARSE TESTS (más rápido - solo lint + build)
node ci-cd-local.js --skip-tests

# SOLO VALIDACIÓN (lint + tests, sin build)
node ci-cd-local.js --no-build

# COMBINAR FLAGS
node ci-cd-local.js --front --skip-tests    # Frontend sin tests
node ci-cd-local.js --back --no-build       # Backend solo validar
node ci-cd-local.js --watch --skip-tests    # Watch sin tests
```

---

## 📊 Comparativa de Opciones

| Opción | Lint | Tests | Build | Export | Tiempo |
|--------|------|-------|-------|--------|--------|
| `node ci-cd-local.js` | ✅ | ✅ | ✅ | ✅ | ~45s |
| `--skip-tests` | ✅ | ⏭️ | ✅ | ✅ | ~10s |
| `--no-build` | ✅ | ✅ | ⏭️ | ⏭️ | ~15s |
| `--front` | ✅ | ✅ | ✅ | ✅ | ~25s |
| `--back` | ✅ | ✅ | ✅ | ✅ | ~20s |
| `--watch` | ✅ | ✅ | ✅ | ✅ | ~30s/cambio |

---

## 🎯 Casos de Uso

### ⚡ Desarrollo Rápido (Solo Validar)
```bash
node ci-cd-local.js --skip-tests
```
**Ideal para:** Cambios rápidos, quieres compilar sin esperar tests

### 🧪 Solo Verificar (Sin Build)
```bash
node ci-cd-local.js --no-build
```
**Ideal para:** Validar que el código está ok, sin crear artifacts

### 👀 Modo Watch (Desarrollo Continuo)
```bash
node ci-cd-local.js --watch
```
**Ideal para:** Dejar corriendo mientras desarrollas, auto-recompila

### 📦 Build Final (Completo)
```bash
node ci-cd-local.js
```
**Ideal para:** Pre-commit, deploy, asegurar todo pasa

---

## 🔧 Fixear Tests que No Cierran

Si ves el error `Jest did not exit one second after the test...`:

La opción **`--skip-tests`** es la solución rápida:

```bash
# Saltarse tests mientras los fixeas
node ci-cd-local.js --skip-tests

# Luego en tu código, agrega --forceExit
# npm run test:health -- --forceExit
```

---

## 📈 Performance Tips

**Si necesitas speed:**
```bash
# Más rápido (sin tests)
node ci-cd-local.js --skip-tests

# O solo validar
node ci-cd-local.js --no-build
```

**Si necesitas confiabilidad:**
```bash
# Completo (recomendado pre-commit)
node ci-cd-local.js
```

---

## 🪟 Windows - GUI Menu

El menú batch también soporta estas opciones:

```batch
ci-cd-local.bat
```

Y selecciona:
- **Opción 1**: Build completo
- **Opción 7**: Setup (instala deps)

---

## ✅ Recomendaciones

- **Desarrollo local**: `--skip-tests` para velocidad
- **Pre-commit**: Build completo (sin flags)
- **CI/CD**: Build completo (sin flags)
- **Debugging**: `--no-build` para validar sin esperar compilación

---

Listo. Ahora prueba:

```bash
node ci-cd-local.js --skip-tests
```

¡Debería ser mucho más rápido! ⚡
