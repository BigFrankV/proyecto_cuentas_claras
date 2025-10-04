# 📋 RESUMEN DE CAMBIOS - MIGRACIÓN API

> **Fecha:** Octubre 2025  
> **Estado:** ✅ Completado  
> **Versión:** 2.0

---

## 🎯 OBJETIVO

Migrar el backend de Cuentas Claras para usar la nueva estructura de base de datos con tablas renombradas y el nuevo sistema de roles basado en `usuario_comunidad_rol` y `rol`.

---

## ✅ ARCHIVOS ACTUALIZADOS

### **1. Middleware de Autorización** 

#### **`src/middleware/authorize.js`**
- ✅ Agregada función `checkRoleLevel()` para verificar nivel de acceso por comunidad
- ✅ Mantiene compatibilidad con `is_superadmin` (marcado como DEPRECADO)
- ✅ Usa `memberships` del token JWT con `nivel_acceso`

**Cambios clave:**
```javascript
// Nueva función para verificar nivel de acceso
function checkRoleLevel(comunidadIdParam = 'comunidadId', minLevel = 5)

// Los memberships ahora incluyen nivel_acceso
{ comunidadId, rol, nivel_acceso }
```

---

### **2. Autenticación**

#### **`src/routes/auth.js`**
- ✅ Actualizado query de login para cargar roles desde `usuario_comunidad_rol` con JOIN a `rol`
- ✅ Token JWT ahora incluye `nivel_acceso` en cada membership
- ✅ Actualizado 2FA verify con mismo cambio

**Query nueva:**
```sql
SELECT ucr.comunidad_id, r.codigo as rol, r.nivel_acceso 
FROM usuario_comunidad_rol ucr
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.usuario_id = ? AND ucr.activo = 1
```

---

### **3. Gestión de Membresías**

#### **`src/routes/membresias.js`**
- ✅ **GET**: Usa `usuario_comunidad_rol` con JOINs a `rol` y `usuario`
- ✅ **POST**: Requiere `usuario_id` y `rol_id` en lugar de `persona_id` y `rol`
- ✅ **PATCH**: Permite actualizar `rol_id`, `activo`, `hasta`
- ✅ **DELETE**: Usa `usuario_comunidad_rol`

**Cambios estructurales:**
- `membresia_comunidad` (vista) → `usuario_comunidad_rol` (tabla real)
- Ahora retorna `rol_nombre` y `nivel_acceso`

---

### **4. Cuentas de Cobro (Cargos)**

#### **`src/routes/cargos.js`**
- ✅ `cargo_unidad` → `cuenta_cobro_unidad`
- ✅ `cargo_unidad_detalle` → `detalle_cuenta_unidad` (para futura expansión)

**Tablas actualizadas:**
- Todos los queries SELECT, INSERT, UPDATE

---

### **5. Emisiones de Gastos Comunes**

#### **`src/routes/emisiones.js`**
- ✅ `emision_gasto_comun` → `emision_gastos_comunes`
- ✅ `emision_gasto_detalle` → `detalle_emision`
- ✅ Actualizado endpoint de generación de cargos:
  - `cargo_unidad` → `cuenta_cobro_unidad`
  - `cargo_unidad_detalle` → `detalle_cuenta_unidad`

**Afectados:**
- GET /comunidad/:comunidadId
- POST /comunidad/:comunidadId
- GET /:id
- PATCH /:id
- POST /:id/detalles
- GET /:id/previsualizar-prorrateo
- POST /:id/generar-cargos

---

### **6. Unidades y Titulares**

#### **`src/routes/unidades.js`**
- ✅ `tenencia_unidad` → `titulares_unidad`

**Endpoints actualizados:**
- GET /:id/tenencias
- POST /:id/tenencias
- GET /:id/residentes

---

### **7. Soporte y Tickets**

#### **`src/routes/soporte.js`**
- ✅ `ticket` → `solicitud_soporte`
- ✅ `bitacora_conserjeria` → `registro_conserjeria`

**Endpoints actualizados:**
- GET /comunidad/:comunidadId/tickets
- POST /comunidad/:comunidadId/tickets
- GET /tickets/:id
- PATCH /tickets/:id
- GET /comunidad/:comunidadId/bitacora
- POST /comunidad/:comunidadId/bitacora

---

### **8. Pagos**

#### **`src/routes/pagos.js`**
- ✅ Actualizado endpoint de aplicación de pagos
- ✅ Acepta tanto `cargo_unidad_id` (legacy) como `cuenta_cobro_unidad_id`
- ✅ `cargo_unidad` → `cuenta_cobro_unidad` en queries

**Compatibilidad:**
```javascript
const cuentaId = a.cuenta_cobro_unidad_id || a.cargo_unidad_id;
```

---

### **9. Middleware de Tenancy**

#### **`src/middleware/tenancy.js`**
- ✅ Query actualizado para usar `usuario_comunidad_rol` con `usuario_id`
- ✅ Ahora carga `nivel_acceso` además del rol
- ✅ `req.membership` incluye `nivel_acceso`

**Query nueva:**
```sql
SELECT r.codigo as rol, r.nivel_acceso 
FROM usuario_comunidad_rol ucr
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.comunidad_id = ? AND ucr.usuario_id = ? AND ucr.activo = 1
```

---

## 📊 TABLA DE EQUIVALENCIAS

| Tabla Antigua | Tabla Nueva | Estado |
|---------------|-------------|--------|
| `cargo_unidad` | `cuenta_cobro_unidad` | ✅ Migrado |
| `cargo_unidad_detalle` | `detalle_cuenta_unidad` | ✅ Migrado |
| `emision_gasto_comun` | `emision_gastos_comunes` | ✅ Migrado |
| `emision_gasto_detalle` | `detalle_emision` | ✅ Migrado |
| `tenencia_unidad` | `titulares_unidad` | ✅ Migrado |
| `ticket` | `solicitud_soporte` | ✅ Migrado |
| `bitacora_conserjeria` | `registro_conserjeria` | ✅ Migrado |
| `membresia_comunidad` (vista) | `usuario_comunidad_rol` (tabla) | ✅ Migrado |

---

## 🔄 COMPATIBILIDAD

### **Vistas de Compatibilidad Activas**

Las siguientes vistas siguen activas en la base de datos para garantizar compatibilidad:

```sql
-- Vistas que mapean nombres antiguos a nuevos
CREATE VIEW cargo_unidad AS SELECT * FROM cuenta_cobro_unidad;
CREATE VIEW cargo_unidad_detalle AS SELECT * FROM detalle_cuenta_unidad;
CREATE VIEW emision_gasto_comun AS SELECT * FROM emision_gastos_comunes;
CREATE VIEW emision_gasto_detalle AS SELECT * FROM detalle_emision;
CREATE VIEW tenencia_unidad AS SELECT * FROM titulares_unidad;
CREATE VIEW ticket AS SELECT * FROM solicitud_soporte;
CREATE VIEW bitacora_conserjeria AS SELECT * FROM registro_conserjeria;

-- Vista compleja con JOINs
CREATE VIEW membresia_comunidad AS 
  SELECT ucr.id, ucr.comunidad_id, u.persona_id, r.codigo as rol, ...
  FROM usuario_comunidad_rol ucr
  JOIN usuario u ON u.id = ucr.usuario_id
  JOIN rol r ON r.id = ucr.rol_id;
```

**⚠️ Nota:** Estas vistas pueden eliminarse en el futuro cuando se confirme que todo funciona correctamente.

---

## 🚀 NUEVO SISTEMA DE ROLES

### **Tabla `rol`**

| id | codigo | nombre | nivel_acceso |
|----|--------|--------|--------------|
| 1 | superadmin | Super Administrador | 1 |
| 2 | admin | Administrador | 2 |
| 3 | comite | Comité | 3 |
| 4 | contador | Contador | 4 |
| 5 | conserje | Conserje | 5 |
| 6 | propietario | Propietario | 6 |
| 7 | residente | Residente | 7 |

**Nivel de acceso:** 
- Menor número = Mayor privilegio
- `1` = Máximo acceso (superadmin)
- `7` = Mínimo acceso (residente)

### **Tabla `usuario_comunidad_rol`**

Reemplaza a `membresia_comunidad` (que ahora es una vista):

```sql
CREATE TABLE usuario_comunidad_rol (
  id BIGINT PRIMARY KEY,
  comunidad_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,  -- Cambio: antes era persona_id indirecto
  rol_id INT NOT NULL,          -- Cambio: antes era VARCHAR rol
  desde DATE NOT NULL,
  hasta DATE,
  activo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (comunidad_id) REFERENCES comunidad(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (rol_id) REFERENCES rol(id)
);
```

---

## 🧪 TESTING

### **Queries de Verificación**

```sql
-- 1. Verificar que vistas funcionan
SELECT COUNT(*) FROM cargo_unidad WHERE comunidad_id = 1;
SELECT COUNT(*) FROM cuenta_cobro_unidad WHERE comunidad_id = 1;
-- Deben retornar el mismo resultado

-- 2. Verificar roles cargados correctamente
SELECT 
  u.username,
  r.codigo as rol,
  r.nivel_acceso,
  ucr.activo
FROM usuario_comunidad_rol ucr
INNER JOIN usuario u ON u.id = ucr.usuario_id
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.comunidad_id = 1 AND ucr.activo = 1;

-- 3. Verificar integridad: usuarios sin persona_id
SELECT COUNT(*) FROM usuario WHERE persona_id IS NULL;
-- Debe ser 0

-- 4. Verificar cuentas de cobro sin emisión
SELECT COUNT(*) FROM cuenta_cobro_unidad 
WHERE emision_id NOT IN (SELECT id FROM emision_gastos_comunes);
-- Debe ser 0 o muy bajo
```

### **Endpoints a Probar**

1. **Autenticación:**
   - `POST /auth/login` - Verificar que retorna roles y nivel_acceso
   - `POST /auth/2fa/verify` - Verificar 2FA con roles

2. **Membresías:**
   - `GET /comunidad/{id}` - Listar membresías con roles
   - `POST /comunidad/{id}` - Crear membresía con rol_id

3. **Cargos:**
   - `GET /comunidad/{id}` - Listar cuentas de cobro
   - `GET /{id}` - Ver detalle de cuenta

4. **Emisiones:**
   - `POST /comunidad/{id}` - Crear emisión
   - `POST /{id}/generar-cargos` - Generar cargos

5. **Unidades:**
   - `GET /{id}/tenencias` - Listar titulares
   - `POST /{id}/tenencias` - Agregar titular

6. **Soporte:**
   - `GET /comunidad/{id}/tickets` - Listar solicitudes
   - `POST /comunidad/{id}/tickets` - Crear solicitud

---

## ⚠️ NOTAS IMPORTANTES

### **1. Campos Deprecados**

- `usuario.is_superadmin` - Mantener por compatibilidad pero usar sistema de roles
- Referencias a `persona_id` en contexto de membresías - Ahora usar `usuario_id`

### **2. Breaking Changes**

- API de membresías requiere `usuario_id` y `rol_id` en lugar de `persona_id` y `rol` (string)
- Token JWT ahora incluye `nivel_acceso` en cada membership
- Middleware `requireCommunity` ahora busca por `usuario_id` en lugar de `persona_id`

### **3. Retrocompatibilidad**

- Vistas de base de datos mantienen compatibilidad temporal
- Endpoint de pagos acepta tanto `cargo_unidad_id` como `cuenta_cobro_unidad_id`

---

## 📚 PRÓXIMOS PASOS

1. ⏳ **Testing exhaustivo de todos los endpoints**
2. ⏳ **Actualizar documentación Swagger/OpenAPI**
3. ⏳ **Actualizar tests automatizados**
4. ⏳ **Verificar performance de vistas con JOINs**
5. ⏳ **Considerar eliminar vistas de compatibilidad** (después de 1-2 meses)

---

## 🎉 CONCLUSIÓN

Se han actualizado exitosamente **9 archivos** del backend para usar la nueva estructura de base de datos:

- ✅ 2 archivos de middleware
- ✅ 7 archivos de rutas
- ✅ Sistema de roles implementado
- ✅ Compatibilidad temporal mantenida

**El backend ahora está listo para trabajar con la nueva estructura de base de datos.** 🚀

---

**Generado:** 1 de Octubre, 2025  
**Autor:** GitHub Copilot  
**Versión API:** 2.0
