# Scripts de Creación de Vistas - Cuentas Claras

## 📋 Descripción

Este directorio contiene scripts SQL para crear/recrear las vistas necesarias del sistema **Cuentas Claras**.

## 📁 Archivos Disponibles

### 1. `crear_vistas.sql` (Completo)

Script completo con DEFINERs y configuración avanzada.

**Características:**

- ✅ Incluye `DEFINER` específico (`api_admin@%`)
- ✅ Configuración de `SQL SECURITY DEFINER`
- ✅ Documentación detallada de cada vista
- ⚠️ Requiere privilegios de SUPER o que el usuario `api_admin` exista

### 2. `crear_vistas_simple.sql` (Recomendado)

Script simplificado sin DEFINERs, más compatible.

**Características:**

- ✅ Sin `DEFINER` específico (usa el usuario actual)
- ✅ Sintaxis simple y clara
- ✅ Compatible con cualquier usuario con privilegios CREATE VIEW
- ✅ **Recomendado para la mayoría de casos**

## 🚀 Uso

### Opción 1: Ejecutar localmente

```bash
# Con el script completo
mysql -u cuentasclaras -p cuentasclaras < base/crear_vistas.sql

# Con el script simple (recomendado)
mysql -u cuentasclaras -p cuentasclaras < base/crear_vistas_simple.sql
```

### Opción 2: Ejecutar en Docker

```bash
# Con el script completo
docker exec -i <nombre_contenedor> mysql -u cuentasclaras -pcuentasclaras cuentasclaras < base/crear_vistas.sql

# Con el script simple (recomendado)
docker exec -i <nombre_contenedor> mysql -u cuentasclaras -pcuentasclaras cuentasclaras < base/crear_vistas_simple.sql
```

**Nota:** Reemplaza `<nombre_contenedor>` con el nombre de tu contenedor MySQL.

### Opción 3: Ejecutar desde MySQL CLI

```bash
# Conectarse a MySQL
mysql -u cuentasclaras -p cuentasclaras

# Ejecutar el script
mysql> source /ruta/absoluta/base/crear_vistas_simple.sql;
```

## 📊 Vistas Creadas

El script crea las siguientes 8 vistas:

| #   | Vista                       | Tabla Base                      | Descripción                         |
| --- | --------------------------- | ------------------------------- | ----------------------------------- |
| 1   | `bitacora_conserjeria`      | `registro_conserjeria`          | Registros de eventos de conserjería |
| 2   | `cargo_financiero_unidad`   | `cuenta_cobro_unidad`           | Cargos financieros por unidad       |
| 3   | `detalle_cargo_unidad`      | `detalle_cuenta_unidad`         | Detalles de cargos (con alias)      |
| 4   | `emision_gasto_comun`       | `emision_gastos_comunes`        | Emisiones de gastos comunes         |
| 5   | `emision_gasto_detalle`     | `detalle_emision`               | Detalles de emisión de gastos       |
| 6   | `ticket`                    | `solicitud_soporte`             | Tickets de soporte                  |
| 7   | `titularidad_unidad`        | `titulares_unidad`              | Titularidad de unidades             |
| 8   | `usuario_miembro_comunidad` | `usuario_rol_comunidad` + JOINs | Usuarios miembros con roles         |

## ⚙️ Detalles Técnicos

### Vista Simple: Solo Alias

Algunas vistas son alias simples de una tabla:

- `bitacora_conserjeria` → `registro_conserjeria`
- `cargo_financiero_unidad` → `cuenta_cobro_unidad`
- `emision_gasto_comun` → `emision_gastos_comunes`
- `ticket` → `solicitud_soporte`
- `titularidad_unidad` → `titulares_unidad`

### Vista con Alias de Columnas

Cambia nombres de columnas:

- `detalle_cargo_unidad`: Renombra `cuenta_cobro_unidad_id` → `cargo_unidad_id`
- `emision_gasto_detalle`: Simplifica desde `detalle_emision`

### Vista con JOIN

Vista compleja con múltiples tablas:

- `usuario_miembro_comunidad`:
  - JOIN entre `usuario_rol_comunidad`, `usuario` y `rol_sistema`
  - Combina información de usuarios con sus roles en comunidades

## 🔍 Verificación

Después de ejecutar el script, verifica que las vistas se crearon correctamente:

```sql
-- Ver todas las vistas
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Ver estructura de una vista específica
SHOW CREATE VIEW bitacora_conserjeria;

-- Probar una vista
SELECT * FROM ticket LIMIT 5;
```

## 🛠️ Troubleshooting

### Error: "Access denied for user to create view"

**Solución:** Usa el script `crear_vistas_simple.sql` que no requiere privilegios especiales.

### Error: "DEFINER clause not found"

**Solución:** Usa el script `crear_vistas_simple.sql`.

### Error: "Table 'xxx' doesn't exist"

**Solución:** Asegúrate de que las tablas base existan. Importa primero el esquema completo:

```bash
mysql -u cuentasclaras -p cuentasclaras < base/cuentasclaras.sql
```

### Error: "View already exists"

**Solución:** El script incluye `DROP VIEW IF EXISTS`, así que este error no debería ocurrir. Si ocurre, ejecuta:

```sql
DROP VIEW IF EXISTS nombre_vista;
```

## 📝 Notas Importantes

1. **Orden de Ejecución:**

   - Primero importa el esquema completo (`cuentasclaras.sql`)
   - Luego ejecuta el script de vistas (`crear_vistas_simple.sql`)

2. **Seguridad:**

   - El script `crear_vistas.sql` usa `SQL SECURITY DEFINER`
   - El script `crear_vistas_simple.sql` usa el contexto de seguridad del usuario actual

3. **Permisos Necesarios:**
   - Privilegio `CREATE VIEW` en la base de datos `cuentasclaras`
   - Privilegio `SELECT` en las tablas base

## 🔄 Actualización

Si necesitas recrear las vistas:

```bash
# Las vistas se eliminarán y recrearán automáticamente
mysql -u cuentasclaras -p cuentasclaras < base/crear_vistas_simple.sql
```

El script incluye `DROP VIEW IF EXISTS` para cada vista, por lo que es seguro ejecutarlo múltiples veces.

## 📞 Soporte

Si tienes problemas ejecutando estos scripts:

1. Verifica que el usuario tenga los permisos necesarios
2. Asegúrate de que las tablas base existan
3. Usa el script simple (`crear_vistas_simple.sql`) si tienes problemas de permisos
4. Revisa los logs de MySQL para mensajes de error detallados

---

**Última actualización:** 2025-10-10  
**Versión:** 1.0
