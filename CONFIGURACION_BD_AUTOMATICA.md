# ✅ CONFIGURACIÓN COMPLETADA: Carga Automática de Base de Datos

## 📋 Resumen de Cambios

Se ha configurado Docker para cargar **automáticamente** la base de datos desde el repositorio.

## 🎯 Archivo Principal

```
ccbackend/base/BBDD+pob_datos/01_cuentasclaras.sql
```

Este archivo contiene:
- ✅ Esquema completo de tablas
- ✅ Datos de prueba poblados
- ✅ Configuración inicial

## 🔧 Cambios Realizados

### 1. **docker-compose.yml** - Actualizado

```yaml
volumes:
  - ./ccbackend/base/BBDD+pob_datos:/docker-entrypoint-initdb.d:ro
```

Ahora Docker apunta directamente a la carpeta con los SQL.

### 2. **Archivos Renombrados** - Control de orden de ejecución

- `cuentasclaras.sql` → `01_cuentasclaras.sql` (se ejecuta PRIMERO)
- `VISTAS_OK_10-10-2025.sql` → `02_VISTAS_OK_10-10-2025.sql` (después del esquema)

### 3. **Scripts de Automatización** - Creados

- ✅ `reset_database.bat` - Script para Windows CMD
- ✅ `reset_database.ps1` - Script para PowerShell
- ✅ `ccbackend/base/BBDD+pob_datos/README.md` - Documentación completa

### 4. **Documentación** - Actualizada

- ✅ `GUIA_BASE_DATOS_DOCKER.md` - Guía técnica detallada
- ✅ `README.md` - Instrucciones en el README principal

## 🚀 Cómo Usar (Para Todo el Equipo)

### Primera vez o después de clonar el repo:

```bash
docker-compose up -d
```

La BD se carga automáticamente ✨

### Cuando hay actualizaciones en el repositorio:

**Opción A - Script automatizado (Recomendado):**
```bash
reset_database.bat
```

**Opción B - Manual:**
```bash
docker-compose down
docker volume rm proyecto_cuentas_claras_db_data
docker-compose up -d
```

## 📊 Orden de Ejecución de Scripts SQL

Cuando Docker inicializa la BD, ejecuta en este orden:

1. `01_cuentasclaras.sql` ← **ESQUEMA + DATOS PRINCIPALES**
2. `02_VISTAS_OK_10-10-2025.sql` ← Vistas de la BD
3. `INDICES_Y_FK.sql` ← Índices adicionales
4. `INSERTS.sql` ← Datos extra
5. `PRESETEAR_PASSWORDS.sql` ← Contraseñas de prueba
6. `crear_vistas.sql` ← Más vistas
7. `verificar_vistas.sql` ← Verificación

## 🎓 Workflow Recomendado para el Equipo

### Escenario 1: "Actualicé el repo y hay cambios en la BD"

```bash
# Ejecutar script de reset
reset_database.bat

# O manualmente
docker-compose down -v && docker-compose up -d
```

### Escenario 2: "Hice cambios en la BD y quiero compartirlos"

```bash
# 1. Exportar BD desde phpMyAdmin (http://localhost:8080)
# 2. Reemplazar: ccbackend/base/BBDD+pob_datos/01_cuentasclaras.sql
# 3. Commitear y pushear
# 4. Avisar al equipo para que hagan reset
```

### Escenario 3: "Necesito datos frescos para probar"

```bash
reset_database.bat
```

## 🔍 Verificación

```bash
# Ver si la BD se inicializó correctamente
docker logs cuentasclaras_db

# Conectarse a la BD
docker exec -it cuentasclaras_db mysql -uapi_admin -papipassword cuentasclaras

# Ver tablas
docker exec cuentasclaras_db mysql -uapi_admin -papipassword -e "SHOW TABLES;" cuentasclaras
```

## 🌐 Servicios Disponibles

- **API Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173 (o puerto configurado)
- **phpMyAdmin**: http://localhost:8080
  - Usuario: `api_admin`
  - Contraseña: `apipassword`

## ⚠️ Importante

### ¿Cuándo se ejecutan los scripts SQL?

- ✅ **Primera vez** que se inicia Docker (volumen vacío)
- ✅ **Después de eliminar** el volumen de datos
- ❌ **NO se ejecutan** si la BD ya existe

### ¿Qué pasa con mis datos locales?

Al ejecutar `reset_database.bat`:
- ❌ Se **pierden** todos los datos locales
- ✅ Se **cargan** los datos desde `01_cuentasclaras.sql`

Si quieres conservar datos locales, NO hagas reset. En su lugar, aplica migraciones manualmente.

## 📁 Estructura de Archivos

```
proyecto_cuentas_claras/
├── docker-compose.yml              ← Configuración actualizada
├── reset_database.bat              ← Script Windows CMD
├── reset_database.ps1              ← Script PowerShell
├── GUIA_BASE_DATOS_DOCKER.md      ← Guía técnica
└── ccbackend/
    └── base/
        └── BBDD+pob_datos/
            ├── 01_cuentasclaras.sql       ← ARCHIVO PRINCIPAL
            ├── 02_VISTAS_OK_10-10-2025.sql
            ├── INDICES_Y_FK.sql
            ├── INSERTS.sql
            ├── PRESETEAR_PASSWORDS.sql
            ├── crear_vistas.sql
            ├── verificar_vistas.sql
            └── README.md                   ← Documentación completa
```

## 💡 Beneficios de Esta Configuración

✅ **Sin conflictos entre desarrolladores** - Todos usan la misma BD
✅ **Setup rápido** - Nuevos devs solo ejecutan `docker-compose up`
✅ **Versionado de BD** - La estructura está en Git
✅ **Fácil rollback** - Volver a cualquier versión histórica
✅ **Pruebas limpias** - Reset rápido para testing
✅ **Documentado** - Todo el equipo sabe cómo funciona

## 🆘 Solución de Problemas

### "Mi BD no se inicializó"
```bash
# Verificar logs
docker logs cuentasclaras_db

# Verificar volumen
docker volume ls
```

### "Tengo errores SQL"
```bash
# Ver logs detallados
docker logs cuentasclaras_db --tail 100

# Verificar sintaxis del archivo SQL
# Importar manualmente en phpMyAdmin primero
```

### "Otro dev tiene diferente BD"
```bash
# Ambos deben:
1. Verificar que tienen la última versión del repo (git pull)
2. Ejecutar reset_database.bat
3. Verificar que funciona
```

## 📚 Documentación Adicional

- [GUIA_BASE_DATOS_DOCKER.md](./GUIA_BASE_DATOS_DOCKER.md) - Guía técnica completa
- [ccbackend/base/BBDD+pob_datos/README.md](./ccbackend/base/BBDD+pob_datos/README.md) - Detalles de inicialización

---

## ✨ Todo Listo

Tu equipo ahora puede:

1. ✅ **Clonar el repo** y ejecutar `docker-compose up -d`
2. ✅ **Actualizar BD** ejecutando `reset_database.bat`
3. ✅ **Compartir cambios** reemplazando `01_cuentasclaras.sql`
4. ✅ **Trabajar sincronizados** sin conflictos de BD

**No más problemas de sincronización de base de datos entre desarrolladores** 🎉
