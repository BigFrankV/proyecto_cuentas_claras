# Guía de Inicialización de Base de Datos con Docker

## 🚀 Respuesta Rápida

**SÍ, Docker CARGA AUTOMÁTICAMENTE la base de datos** desde:
```
ccbackend/base/BBDD+pob_datos/01_cuentasclaras.sql
```

## ✅ Ya Está Configurado

Cada vez que inicies Docker con la BD vacía, se cargará automáticamente `01_cuentasclaras.sql` con todo el esquema y datos.

## Cómo Funciona (Para tu Equipo)

### Reset Completo de Base de Datos

Cuando tú o cualquier desarrollador necesite la BD actualizada del repositorio:

```bash
# Windows CMD / PowerShell
docker-compose down
docker volume rm proyecto_cuentas_claras_db_data
docker-compose up -d
```

Esto:
1. Detiene los contenedores
2. **Borra completamente la base de datos**
3. Al reiniciar, ejecuta automáticamente todos los `.sql` en orden alfabético

## 📋 Orden de Ejecución

```
ccbackend/base/
  ├── 00_init.sql           → Se ejecuta PRIMERO (configuración)
  ├── Frank_tablas_new.sql  → Esquema completo de tablas
  └── (otros .sql)          → En orden alfabético
```

## 🔄 Para Aplicar Cambios a BD Existente

### Opción 1: Script Manual
```bash
docker exec -i cuentasclaras_db mysql -uroot -prootpassword cuentasclaras < ccbackend\sql\migration_xxx.sql
```

### Opción 2: phpMyAdmin
1. Abrir http://localhost:8080
2. Importar archivo SQL

## ⚠️ IMPORTANTE

- Scripts de inicialización **SOLO se ejecutan en BD nueva** (volumen vacío)
- Si modificas archivos aquí y la BD ya existe, **NO se aplicarán automáticamente**
- Para cambios incrementales, usar `/ccbackend/sql/` y aplicarlos manualmente

## 💡 Solución: Problemas entre Desarrolladores

### Problema: "Mi compañero tiene diferente estructura de BD"

**Solución coordinada:**

1. **Actualizar el SQL maestro** (`Frank_tablas_new.sql`)
2. **Todos hacen reset:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Problema: "Necesito aplicar cambios sin perder datos"

**Crear script de migración:**

```sql
-- ccbackend/sql/2025_10_13_nueva_columna.sql
ALTER TABLE gastos ADD COLUMN aprobado BOOLEAN DEFAULT FALSE;
```

**Aplicar:**
```bash
docker exec -i cuentasclaras_db mysql -uapi_admin -papipassword cuentasclaras < ccbackend\sql\2025_10_13_nueva_columna.sql
```

## 🔍 Verificación

```bash
# Ver si la BD se inicializó correctamente
docker logs cuentasclaras_db

# Conectarse a la BD
docker exec -it cuentasclaras_db mysql -uapi_admin -papipassword cuentasclaras
```

## 📁 Estructura Recomendada

```
ccbackend/
  ├── base/                    (inicialización automática)
  │   ├── 00_init.sql         (configuración)
  │   └── Frank_tablas_new.sql (esquema completo)
  │
  └── sql/                     (migraciones manuales)
      ├── migration_database_update.sql
      └── centro_costo_migration.sql
```

## 🎯 Workflow Recomendado

### Para cambios de esquema:

1. Crear script de migración en `/ccbackend/sql/`
2. Aplicar en tu BD local
3. Probar que funciona
4. Commitear el script
5. Actualizar `Frank_tablas_new.sql` con el esquema completo final
6. Equipo puede aplicar migración O hacer reset completo

---

**TL;DR:** Ya lo tienes configurado. Para sincronizar BDs entre devs: `docker-compose down -v && docker-compose up -d`
