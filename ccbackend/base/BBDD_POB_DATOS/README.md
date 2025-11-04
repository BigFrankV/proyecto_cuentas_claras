# 🗄️ Inicialización Automática de Base de Datos

## ✅ Configuración Automática

Esta carpeta contiene los archivos SQL que Docker **cargará automáticamente** cuando se inicialice la base de datos por primera vez.

## 🚀 Cómo Usar

### Para cualquier desarrollador nuevo o para resetear la base de datos:

```bash
# 1. Detener los contenedores
docker-compose down

# 2. ELIMINAR el volumen de datos (esto borra la BD actual)
docker volume rm proyecto_cuentas_claras_db_data

# 3. Levantar de nuevo (Docker ejecutará automáticamente los SQL)
docker-compose up -d

# 4. Esperar unos segundos y verificar
docker logs cuentasclaras_db
```

## 📋 Orden de Ejecución

Los archivos se ejecutan en **orden alfabético**:

1. **`01_cuentasclaras.sql`** ← Esquema completo + datos (ARCHIVO PRINCIPAL)
2. **`02_VISTAS_OK_10-10-2025.sql`** ← Vistas de la BD
3. `INDICES_Y_FK.sql` ← Índices y claves foráneas adicionales
4. `INSERTS.sql` ← Datos adicionales
5. `PRESETEAR_PASSWORDS.sql` ← Contraseñas de prueba
6. `crear_vistas.sql` ← Vistas adicionales
7. `verificar_vistas.sql` ← Verificación de vistas

## ⚠️ IMPORTANTE

### ¿Cuándo se ejecutan estos archivos?

- ✅ **SOLO** cuando el volumen de Docker está vacío (primera vez o después de eliminarlo)
- ❌ **NO** se ejecutan si la base de datos ya existe

### ¿Cómo actualizar el archivo principal?

1. Exporta la BD desde phpMyAdmin (http://localhost:8080)
2. Reemplaza `01_cuentasclaras.sql` con la nueva versión
3. Commitea el cambio
4. Todos los devs hacen reset:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

## 🔄 Workflow para Sincronizar Equipo

### Escenario: "Actualicé el repositorio y hay cambios en la BD"

```bash
# Opción 1: Reset completo (RECOMENDADO - pierdes datos locales)
docker-compose down
docker volume rm proyecto_cuentas_claras_db_data
docker-compose up -d

# Opción 2: Aplicar cambios manualmente (conserva datos locales)
docker exec -i cuentasclaras_db mysql -uroot -prootpassword cuentasclaras < 01_cuentasclaras.sql
```

### Escenario: "Hice cambios locales y quiero actualizarlos para todos"

```bash
# 1. Exportar BD actual desde phpMyAdmin
# 2. Guardar como 01_cuentasclaras.sql
# 3. Commitear y pushear
# 4. Avisar al equipo para que hagan reset
```

## 🔍 Verificar que Funcionó

```bash
# Ver logs de inicialización
docker logs cuentasclaras_db

# Conectarse a la BD
docker exec -it cuentasclaras_db mysql -uapi_admin -papipassword cuentasclaras

# Ver tablas creadas
docker exec -it cuentasclaras_db mysql -uapi_admin -papipassword -e "SHOW TABLES;" cuentasclaras
```

## 📁 Archivos de Respaldo

Los archivos `*.bak` son versiones antiguas que **NO se ejecutan**. Se mantienen solo como respaldo histórico.

## 💡 Buenas Prácticas

1. **Mantén `01_cuentasclaras.sql` actualizado** - Este es tu "source of truth"
2. **Usa nombres con prefijo numérico** (01*, 02*) para controlar el orden
3. **Documenta cambios grandes** en commits descriptivos
4. **Coordina con el equipo** antes de cambios de esquema mayores
5. **Prueba en limpio** antes de pushear: haz reset y verifica que todo funciona

## 🆘 Solución de Problemas

### "La BD no se inicializó"

```bash
# Verificar que el volumen está vacío
docker volume ls
docker volume inspect proyecto_cuentas_claras_db_data

# Ver logs para detectar errores SQL
docker logs cuentasclaras_db
```

### "Tengo errores de sintaxis SQL"

- Verifica que el archivo esté en UTF-8
- Asegura compatibilidad con MySQL 8.0
- Prueba importar manualmente en phpMyAdmin primero

### "Otro dev tiene diferente estructura"

- Asegurarse de que ambos tienen la última versión de `01_cuentasclaras.sql`
- Ambos hacen reset completo
- Si persiste, comparar volúmenes: uno puede tener BD antigua

---

**TL;DR:** Cualquier cambio en estos archivos SQL requiere que los devs ejecuten:

```bash
docker-compose down -v && docker-compose up -d
```
