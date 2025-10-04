# 🔄 PLAN DE ACTUALIZACIÓN DEL BACKEND
## Migración a Nueva Estructura de Base de Datos

> **Fecha:** Octubre 2025  
> **Versión:** 2.0  
> **Estado:** En progreso

---

## 📋 RESUMEN DE CAMBIOS EN BASE DE DATOS

### **Tablas Renombradas:**

| Tabla Antigua | Tabla Nueva | Estado |
|---------------|-------------|--------|
| `cargo_unidad` | `cuenta_cobro_unidad` | ✅ Vista de compatibilidad activa |
| `cargo_unidad_detalle` | `detalle_cuenta_unidad` | ✅ Vista de compatibilidad activa |
| `emision_gasto_comun` | `emision_gastos_comunes` | ✅ Vista de compatibilidad activa |
| `emision_gasto_detalle` | `detalle_emision` | ✅ Vista de compatibilidad activa |
| `tenencia_unidad` | `titulares_unidad` | ✅ Vista de compatibilidad activa |
| `ticket` | `solicitud_soporte` | ✅ Vista de compatibilidad activa |
| `bitacora_conserjeria` | `registro_conserjeria` | ✅ Vista de compatibilidad activa |

### **Nuevas Tablas:**

| Tabla | Descripción |
|-------|-------------|
| `rol` | Catálogo de 7 roles del sistema |
| `usuario_comunidad_rol` | Asignación de roles por comunidad (reemplaza `membresia_comunidad`) |

### **Cambios Estructurales:**

| Cambio | Impacto |
|--------|---------|
| `usuario.persona_id` ahora es **NOT NULL** | Integridad reforzada |
| `usuario.is_superadmin` marcado como **DEPRECADO** | Usar sistema de roles |
| `membresia_comunidad` ahora es **VISTA** | Ya no es tabla física |

---

## 🎯 ARCHIVOS A ACTUALIZAR

### **Alta Prioridad (Breaking Changes):**

1. ✅ **src/routes/cargos.js** - Actualizar nombres de tablas
2. ✅ **src/routes/membresias.js** - Migrar a `usuario_comunidad_rol`
3. ✅ **src/routes/emisiones.js** - Actualizar nombres de tablas
4. ✅ **src/middleware/auth.js** - Actualizar queries de usuario
5. ✅ **src/middleware/authorize.js** - Implementar sistema de roles
6. ✅ **src/routes/auth.js** - Actualizar login y registro

### **Prioridad Media:**

7. ⏳ **src/routes/unidades.js** - Actualizar `titulares_unidad`
8. ⏳ **src/routes/soporte.js** - Actualizar `solicitud_soporte`
9. ⏳ **src/routes/pagos.js** - Actualizar referencias a cuentas
10. ⏳ **src/routes/multas.js** - Verificar integridad

### **Prioridad Baja (Opcional):**

11. ⏳ **src/routes/comunidades.js** - Verificar queries
12. ⏳ **src/routes/personas.js** - Verificar integridad
13. ⏳ Otros archivos de rutas

---

## 🔧 ESTRATEGIA DE MIGRACIÓN

### **Fase 1: Preparación (Sin downtime)**
- ✅ Vistas de compatibilidad creadas
- ✅ Backend funciona con vistas
- ⏳ Testing de endpoints existentes

### **Fase 2: Actualización Gradual**
- ⏳ Actualizar archivo por archivo
- ⏳ Probar cada cambio individualmente
- ⏳ Mantener vistas activas

### **Fase 3: Optimización**
- ⏳ Eliminar código obsoleto
- ⏳ Optimizar queries a nuevas tablas
- ⏳ Actualizar documentación Swagger

### **Fase 4: Limpieza**
- ⏳ Eliminar vistas de compatibilidad
- ⏳ Eliminar código de fallback
- ⏳ Testing final completo

---

## 📝 CHECKLIST DE ACTUALIZACIÓN

### **Rutas de API:**

- [ ] `src/routes/cargos.js`
  - [ ] Cambiar `cargo_unidad` → `cuenta_cobro_unidad`
  - [ ] Cambiar `cargo_unidad_detalle` → `detalle_cuenta_unidad`
  - [ ] Actualizar queries JOIN
  - [ ] Testing de endpoints

- [ ] `src/routes/membresias.js`
  - [ ] Migrar de `membresia_comunidad` (vista) a `usuario_comunidad_rol`
  - [ ] Implementar lógica de roles
  - [ ] Actualizar endpoints POST/PATCH/DELETE
  - [ ] Agregar validación de roles

- [ ] `src/routes/emisiones.js`
  - [ ] Cambiar `emision_gasto_comun` → `emision_gastos_comunes`
  - [ ] Cambiar `emision_gasto_detalle` → `detalle_emision`
  - [ ] Actualizar queries

- [ ] `src/routes/auth.js`
  - [ ] Actualizar query de login para incluir roles
  - [ ] Actualizar generación de token JWT
  - [ ] Implementar carga de roles por comunidad

- [ ] `src/routes/unidades.js`
  - [ ] Cambiar `tenencia_unidad` → `titulares_unidad`
  - [ ] Actualizar endpoints relacionados

- [ ] `src/routes/soporte.js`
  - [ ] Cambiar `ticket` → `solicitud_soporte`
  - [ ] Actualizar queries

- [ ] `src/routes/pagos.js`
  - [ ] Actualizar referencias a `cuenta_cobro_unidad`
  - [ ] Verificar tabla `pago_aplicacion`

### **Middleware:**

- [ ] `src/middleware/auth.js`
  - [ ] Actualizar función `authenticate`
  - [ ] Cargar roles del usuario
  - [ ] Incluir roles en token JWT

- [ ] `src/middleware/authorize.js`
  - [ ] Implementar verificación por nivel de acceso
  - [ ] Deprecar `is_superadmin` (mantener compatibilidad)
  - [ ] Agregar función `checkRole(comunidadId, minLevel)`

- [ ] `src/middleware/tenancy.js`
  - [ ] Actualizar verificación de membresía
  - [ ] Usar `usuario_comunidad_rol` en lugar de `membresia_comunidad`

### **Servicios:**

- [ ] `src/services/indicadoresService.js`
  - [ ] Actualizar queries de reportes
  - [ ] Usar nombres nuevos de tablas

- [ ] `src/services/paymentGatewayService.js`
  - [ ] Actualizar referencias a cuentas de cobro

### **Tests:**

- [ ] `test/health.test.js`
  - [ ] Actualizar tests de integración
  - [ ] Agregar tests de roles
  - [ ] Verificar endpoints actualizados

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### **Paso 1: Backup y Preparación**

```bash
# 1. Hacer backup de la base de datos actual
mysqldump -u root -p cuentasclaras > backup_pre_migracion.sql

# 2. Crear rama de desarrollo
git checkout -b feature/api-db-migration

# 3. Instalar dependencias si faltan
npm install
```

### **Paso 2: Actualizar Rutas Críticas**

**Orden sugerido:**
1. `auth.js` - Sistema de autenticación y roles
2. `authorize.js` - Middleware de autorización
3. `membresias.js` - Gestión de roles por comunidad
4. `cargos.js` - Cuentas de cobro
5. `emisiones.js` - Emisiones de gastos comunes
6. Resto de rutas

### **Paso 3: Testing Incremental**

```bash
# Después de cada actualización, ejecutar:
npm test

# Probar manualmente los endpoints actualizados
# Usar Postman/Insomnia/Swagger UI
```

### **Paso 4: Actualizar Documentación**

- [ ] Actualizar Swagger/OpenAPI docs
- [ ] Actualizar README.md
- [ ] Documentar cambios en CHANGELOG.md

---

## 📊 COMPATIBILIDAD

### **Mantener Compatibilidad Temporal:**

Las **vistas de compatibilidad** permiten que el código antiguo siga funcionando:

```sql
-- Estas vistas existen temporalmente:
- cargo_unidad → SELECT * FROM cuenta_cobro_unidad
- membresia_comunidad → SELECT ... FROM usuario_comunidad_rol + JOINs
- emision_gasto_comun → SELECT * FROM emision_gastos_comunes
- etc.
```

**Ventajas:**
- ✅ Sin downtime durante migración
- ✅ Actualización gradual posible
- ✅ Rollback más seguro

**Desventajas:**
- ⚠️ Performance penalty en vistas con JOINs
- ⚠️ Requiere limpieza posterior
- ⚠️ Puede confundir en debugging

### **Eliminar Vistas (Fase Final):**

```sql
-- Cuando TODO el código esté migrado:
DROP VIEW cargo_unidad;
DROP VIEW cargo_unidad_detalle;
DROP VIEW membresia_comunidad;
DROP VIEW emision_gasto_comun;
DROP VIEW emision_gasto_detalle;
DROP VIEW tenencia_unidad;
DROP VIEW ticket;
DROP VIEW bitacora_conserjeria;
```

---

## 🔍 QUERIES DE VERIFICACIÓN

### **V1: Verificar que vistas funcionan correctamente**

```sql
-- Test: Query antigua debe funcionar igual que nueva
SELECT COUNT(*) FROM cargo_unidad WHERE comunidad_id = 1;
SELECT COUNT(*) FROM cuenta_cobro_unidad WHERE comunidad_id = 1;
-- Resultados deben ser idénticos
```

### **V2: Verificar roles de usuarios**

```sql
-- Usuarios con roles en comunidad específica
SELECT 
  u.username,
  r.nombre as rol,
  r.nivel_acceso,
  ucr.activo
FROM usuario_comunidad_rol ucr
INNER JOIN usuario u ON u.id = ucr.usuario_id
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.comunidad_id = 1 AND ucr.activo = 1;
```

### **V3: Verificar integridad de datos**

```sql
-- Usuarios sin persona_id (debe ser 0)
SELECT COUNT(*) FROM usuario WHERE persona_id IS NULL;

-- Cuentas sin emisión (integridad referencial)
SELECT COUNT(*) FROM cuenta_cobro_unidad 
WHERE emision_id NOT IN (SELECT id FROM emision_gastos_comunes);
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### **Error 1: "Table cargo_unidad doesn't exist"**

**Causa:** Vista de compatibilidad no creada o eliminada prematuramente  
**Solución:**
```sql
-- Recrear vista
CREATE OR REPLACE VIEW cargo_unidad AS
SELECT * FROM cuenta_cobro_unidad;
```

### **Error 2: "Column 'rol' not found in table usuario_comunidad_rol"**

**Causa:** Código intenta acceder a `membresia_comunidad.rol` directamente  
**Solución:** Usar JOIN con tabla `rol`:
```javascript
// ❌ Incorrecto
const [rows] = await db.query('SELECT rol FROM usuario_comunidad_rol WHERE ...');

// ✅ Correcto
const [rows] = await db.query(`
  SELECT r.codigo as rol 
  FROM usuario_comunidad_rol ucr
  INNER JOIN rol r ON r.id = ucr.rol_id
  WHERE ...
`);
```

### **Error 3: "Foreign key constraint fails"**

**Causa:** Intentar eliminar registro referenciado por FK  
**Solución:** Verificar cascadas y SET NULL definidos en migración

---

## 📚 RECURSOS

- **Guía de Migración Backend:** `ccbackend/base/GUIA_MIGRACION_BACKEND.md`
- **Diagrama ER Completo:** `ccbackend/base/DIAGRAMA_ER_COMPLETO.md`
- **Ejemplos SQL:** `ccbackend/base/consultas_sql_ejemplos.md`
- **Sección Usuarios:** `ccbackend/base/SECCION_02_USUARIOS.md`
- **Script de Migración:** `ccbackend/base/migracion_estructura_mejorada_v2.sql`

---

## 🎯 SIGUIENTE PASO

**Comenzar con actualización de archivos críticos en este orden:**

1. ✅ Crear este plan de actualización
2. ⏩ **Actualizar `src/middleware/authorize.js`** (verificación de roles)
3. ⏩ **Actualizar `src/routes/auth.js`** (login con roles)
4. ⏩ **Actualizar `src/routes/membresias.js`** (gestión de roles)
5. ⏩ **Actualizar `src/routes/cargos.js`** (cuentas de cobro)

**¿Continuar con la actualización de los archivos?** 🚀
