# 📦 Resumen de Migración - Cuentas Claras

## 🎯 Objetivo General

Mejorar la estructura de la base de datos para hacerla más clara y comprensible en el contexto chileno de administración de condominios, separando conceptos de personas, usuarios y roles.

---

## 📋 Archivos Creados

### 1. **`migracion_estructura_mejorada.sql`**

Script principal que realiza TODA la migración:

- ✅ Crea nuevas tablas (`rol`, `usuario_comunidad_rol`)
- ✅ Renombra tablas existentes
- ✅ Migra datos automáticamente
- ✅ Actualiza foreign keys
- ✅ Crea vistas de compatibilidad
- ✅ Incluye verificaciones automáticas

**Duración estimada:** 2-5 minutos (depende del volumen de datos)

### 2. **`GUIA_MIGRACION_BACKEND.md`**

Guía completa para actualizar el código del backend:

- 📝 Mapeo detallado de todos los cambios
- 💻 Ejemplos de código antes/después
- 🔍 Patrones de búsqueda y reemplazo
- ✅ Checklist de verificación

### 3. **`rollback_migracion.sql`**

Script de emergencia para revertir cambios:

- ⏮️ Restaura nombres originales de tablas
- 🔙 Revierte cambios en columnas
- ✅ Incluye verificaciones

---

## 📊 Cambios Principales

### **Tablas Renombradas**

| Antes                   | Después                  | Razón                                     |
| ----------------------- | ------------------------ | ----------------------------------------- |
| `cargo_unidad`          | `cuenta_cobro_unidad`    | "Cargo" se confunde con puesto de trabajo |
| `cargo_unidad_detalle`  | `detalle_cuenta_unidad`  | Consistencia con nombre principal         |
| `emision_gasto_comun`   | `emision_gastos_comunes` | Plural más natural en español             |
| `emision_gasto_detalle` | `detalle_emision`        | Más conciso y claro                       |
| `tenencia_unidad`       | `titulares_unidad`       | "Tenencia" es muy legal/formal            |
| `ticket`                | `solicitud_soporte`      | Evitar anglicismo                         |
| `bitacora_conserjeria`  | `registro_conserjeria`   | "Registro" más común                      |

### **Tablas Nuevas**

| Tabla                   | Propósito                                                       |
| ----------------------- | --------------------------------------------------------------- |
| `rol`                   | Catálogo de roles del sistema (superadmin, admin, comité, etc.) |
| `usuario_comunidad_rol` | Asignación de múltiples roles por usuario y comunidad           |

### **Tabla Reemplazada**

| Antes                 | Después                 | Cambio                                                                     |
| --------------------- | ----------------------- | -------------------------------------------------------------------------- |
| `membresia_comunidad` | `usuario_comunidad_rol` | Estructura mejorada que separa roles y permite múltiples roles por usuario |

---

## 🚀 Pasos para Ejecutar la Migración

### **Paso 1: Backup (CRÍTICO)**

```bash
mysqldump -u root -p cuentasclaras > backup_cuentasclaras_$(date +%Y%m%d).sql
```

### **Paso 2: Ejecutar Migración**

```bash
mysql -u root -p cuentasclaras < migracion_estructura_mejorada.sql
```

### **Paso 3: Verificar Resultados**

El script incluye consultas de verificación al final. Revisa:

- ✅ Total de roles creados
- ✅ Asignaciones en `usuario_comunidad_rol`
- ✅ Usuarios sin persona_id (debe ser 0)
- ✅ Tablas renombradas correctamente

### **Paso 4: Actualizar Backend**

Sigue la guía en `GUIA_MIGRACION_BACKEND.md`:

1. Actualizar imports y nombres de tablas
2. Refactorizar `membresias.js`
3. Actualizar middleware de autorización
4. Buscar/reemplazar nombres globalmente

### **Paso 5: Probar Sistema**

- Probar login
- Verificar roles y permisos
- Probar operaciones CRUD en todas las entidades
- Verificar reportes y consultas

### **Paso 6: Eliminar Compatibilidad (Opcional)**

Una vez verificado todo:

```sql
-- Eliminar vistas de compatibilidad
DROP VIEW IF EXISTS cargo_unidad;
DROP VIEW IF EXISTS cargo_unidad_detalle;
-- ... etc

-- Eliminar tabla antigua
DROP TABLE IF EXISTS membresia_comunidad;
```

---

## 🔄 Modelo de Datos Mejorado

### **Antes (Confuso)**

```
persona ─┐
         ├─ membresia_comunidad (rol hardcodeado en ENUM)
         └─ usuario (is_superadmin como flag)
```

### **Después (Claro)**

```
persona ──> usuario ──> usuario_comunidad_rol ──> rol
                              │
                              └──> comunidad
```

**Beneficios:**

- ✅ Separación clara de conceptos
- ✅ Múltiples roles por usuario
- ✅ Roles flexibles y extensibles
- ✅ Jerarquía de permisos clara
- ✅ Auditoría mejorada (desde/hasta/activo)

---

## 🎭 Sistema de Roles

### **Roles del Sistema**

| Código        | Nombre              | Nivel | Descripción                          |
| ------------- | ------------------- | ----- | ------------------------------------ |
| `superadmin`  | Super Administrador | 100   | Acceso total a todas las comunidades |
| `admin`       | Administrador       | 80    | Admin de comunidad específica        |
| `comite`      | Miembro Comité      | 70    | Miembro del comité                   |
| `contador`    | Contador            | 60    | Acceso contable/financiero           |
| `conserje`    | Conserje            | 40    | Operaciones de conserjería           |
| `propietario` | Propietario         | 30    | Dueño de unidad(es)                  |
| `residente`   | Residente           | 20    | Arrendatario o residente             |

### **Ventajas**

- Nivel de acceso numérico para comparaciones
- Fácil agregar nuevos roles
- Un usuario puede tener múltiples roles
- Auditoría con fechas desde/hasta

---

## ⚠️ Consideraciones Importantes

### **Durante la Migración**

1. **Las vistas de compatibilidad** permiten que el código antiguo siga funcionando
2. **NO elimines** `membresia_comunidad` hasta verificar todo
3. El script es **idempotente**: puedes ejecutarlo múltiples veces
4. Usa **transacciones** si es posible

### **Después de la Migración**

1. Actualiza **Swagger/documentación** de API
2. Actualiza **tests unitarios**
3. Actualiza **frontend** (componentes afectados)
4. Comunica cambios al equipo
5. Monitorea logs por errores

### **En Producción**

1. Ejecuta en horario de baja demanda
2. Ten plan de rollback listo
3. Monitorea performance
4. Ten backup verificado y accesible

---

## 🔧 Archivos del Backend a Modificar

### **Prioridad ALTA**

- ✅ `src/routes/cargos.js` → Renombrar o actualizar
- ✅ `src/routes/membresias.js` → Refactorización completa
- ✅ `src/middleware/authorize.js` → Lógica de roles
- ✅ `src/middleware/auth.js` → Verificación de permisos

### **Prioridad MEDIA**

- ✅ `src/routes/emisiones.js`
- ✅ `src/routes/unidades.js`
- ✅ `src/routes/pagos.js`
- ✅ `src/routes/auth.js` (respuesta de login)

### **Prioridad BAJA**

- ✅ `src/routes/soporte.js` (si existe)
- ✅ Documentación Swagger
- ✅ Tests unitarios

---

## 📞 Troubleshooting

### **Error: Foreign Key Constraint**

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- ejecutar comandos problemáticos
SET FOREIGN_KEY_CHECKS = 1;
```

### **Error: Tabla no existe**

Verifica que estás en la base de datos correcta:

```sql
USE cuentasclaras;
SHOW TABLES;
```

### **Error: Duplicate entry**

Las vistas de compatibilidad pueden causar esto. Elimina las vistas primero:

```sql
DROP VIEW IF EXISTS cargo_unidad;
```

### **Rollback Total**

```bash
mysql -u root -p cuentasclaras < rollback_migracion.sql
```

---

## ✅ Checklist Final

### **Pre-Migración**

- [ ] Backup de base de datos creado
- [ ] Backup verificado y restaurable
- [ ] Equipo notificado
- [ ] Ambiente de pruebas disponible

### **Migración**

- [ ] Script ejecutado sin errores
- [ ] Verificaciones pasadas
- [ ] Datos migrados correctamente
- [ ] Vistas de compatibilidad funcionando

### **Post-Migración**

- [ ] Backend actualizado
- [ ] Tests pasados
- [ ] Sistema probado completamente
- [ ] Documentación actualizada
- [ ] Equipo capacitado en nuevos conceptos

### **Limpieza**

- [ ] Vistas de compatibilidad eliminadas
- [ ] Tabla `membresia_comunidad` eliminada
- [ ] Código antiguo removido
- [ ] Performance verificada

---

## 📈 Métricas de Éxito

- ✅ 0 errores en ejecución del script
- ✅ 100% de datos migrados
- ✅ Todos los tests pasan
- ✅ 0 downtime en producción
- ✅ Performance igual o mejor
- ✅ Código más claro y mantenible

---

## 📚 Referencias

- **SQL Principal:** `migracion_estructura_mejorada.sql`
- **Guía Backend:** `GUIA_MIGRACION_BACKEND.md`
- **Rollback:** `rollback_migracion.sql`
- **DB Original:** `cuentasclaras.sql`

---

**Fecha:** Octubre 2025  
**Versión:** 1.0  
**Estado:** Listo para ejecutar

---

## 💡 Próximos Pasos Sugeridos

1. **Ejecutar en ambiente de desarrollo**
2. **Probar exhaustivamente**
3. **Actualizar código del backend**
4. **Ejecutar en staging**
5. **Planificar ventana de mantenimiento para producción**
6. **Ejecutar en producción**
7. **Monitorear y ajustar**

¡Buena suerte con la migración! 🚀
