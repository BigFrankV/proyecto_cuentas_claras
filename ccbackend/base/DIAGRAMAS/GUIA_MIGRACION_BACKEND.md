# 📋 Guía de Migración del Backend

## 🎯 Objetivo

Esta guía detalla los cambios necesarios en el código del backend después de ejecutar el script `migracion_estructura_mejorada.sql`.

---

## 📊 Mapeo de Cambios en Tablas

| Tabla Antigua           | Tabla Nueva              | Tipo de Cambio                                                    |
| ----------------------- | ------------------------ | ----------------------------------------------------------------- |
| `cargo_unidad`          | `cuenta_cobro_unidad`    | RENOMBRADA                                                        |
| `cargo_unidad_detalle`  | `detalle_cuenta_unidad`  | RENOMBRADA + columna `cargo_unidad_id` → `cuenta_cobro_unidad_id` |
| `emision_gasto_comun`   | `emision_gastos_comunes` | RENOMBRADA                                                        |
| `emision_gasto_detalle` | `detalle_emision`        | RENOMBRADA                                                        |
| `tenencia_unidad`       | `titulares_unidad`       | RENOMBRADA                                                        |
| `ticket`                | `solicitud_soporte`      | RENOMBRADA                                                        |
| `bitacora_conserjeria`  | `registro_conserjeria`   | RENOMBRADA                                                        |
| `membresia_comunidad`   | `usuario_comunidad_rol`  | REEMPLAZADA (estructura diferente)                                |
| N/A                     | `rol`                    | NUEVA TABLA                                                       |

---

## 🔧 Cambios en Archivos del Backend

### 1. **src/routes/cargos.js** → **Renombrar a `cuentasCobro.js` o actualizar**

**Cambios necesarios:**

```javascript
// ANTES:
const query = `SELECT * FROM cargo_unidad WHERE comunidad_id = ?`;
const detailQuery = `SELECT * FROM cargo_unidad_detalle WHERE cargo_unidad_id = ?`;

// DESPUÉS:
const query = `SELECT * FROM cuenta_cobro_unidad WHERE comunidad_id = ?`;
const detailQuery = `SELECT * FROM detalle_cuenta_unidad WHERE cuenta_cobro_unidad_id = ?`;
```

**Rutas HTTP a actualizar:**

- `/api/cargos` → `/api/cuentas-cobro` (opcional, para mayor claridad)

---

### 2. **src/routes/emisiones.js**

**Cambios necesarios:**

```javascript
// ANTES:
const query = `SELECT * FROM emision_gasto_comun WHERE comunidad_id = ?`;
const detailQuery = `SELECT * FROM emision_gasto_detalle WHERE emision_id = ?`;
const insertQuery = `INSERT INTO emision_gasto_comun (...) VALUES (...)`;

// DESPUÉS:
const query = `SELECT * FROM emision_gastos_comunes WHERE comunidad_id = ?`;
const detailQuery = `SELECT * FROM detalle_emision WHERE emision_id = ?`;
const insertQuery = `INSERT INTO emision_gastos_comunes (...) VALUES (...)`;
```

---

### 3. **src/routes/unidades.js**

**Cambios necesarios:**

```javascript
// ANTES:
const query = `
  SELECT u.*, t.persona_id, t.tipo, t.porcentaje
  FROM unidad u
  LEFT JOIN tenencia_unidad t ON t.unidad_id = u.id
  WHERE u.comunidad_id = ?
`;

// DESPUÉS:
const query = `
  SELECT u.*, t.persona_id, t.tipo, t.porcentaje
  FROM unidad u
  LEFT JOIN titulares_unidad t ON t.unidad_id = u.id
  WHERE u.comunidad_id = ?
`;
```

---

### 4. **src/routes/soporte.js** (antes probablemente no existe o está en otro archivo)

**Si existe archivo para tickets:**

```javascript
// ANTES:
const query = `SELECT * FROM ticket WHERE comunidad_id = ?`;

// DESPUÉS:
const query = `SELECT * FROM solicitud_soporte WHERE comunidad_id = ?`;
```

**Rutas HTTP a actualizar:**

- `/api/tickets` → `/api/solicitudes-soporte` o `/api/soporte`

---

### 5. **src/routes/membresias.js** → **CAMBIO MAYOR**

Este archivo requiere cambios significativos debido al nuevo modelo de roles.

#### **5.1. Listar roles disponibles (NUEVA FUNCIONALIDAD)**

```javascript
// GET /api/roles
router.get('/roles', tenancy, async (req, res) => {
  try {
    const [roles] = await db.query(`
      SELECT id, codigo, nombre, descripcion, nivel_acceso, es_rol_sistema
      FROM rol
      ORDER BY nivel_acceso DESC, nombre
    `);
    res.json(roles);
  } catch (error) {
    logger.error('Error obteniendo roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});
```

#### **5.2. Obtener roles de un usuario en una comunidad**

```javascript
// ANTES:
router.get('/:comunidadId/usuarios', tenancy, async (req, res) => {
  const { comunidadId } = req.params;
  const query = `
    SELECT m.*, p.nombres, p.apellidos, p.email, p.rut, p.dv
    FROM membresia_comunidad m
    INNER JOIN persona p ON p.id = m.persona_id
    WHERE m.comunidad_id = ? AND m.activo = 1
  `;
  // ...
});

// DESPUÉS:
router.get('/:comunidadId/usuarios', tenancy, async (req, res) => {
  const { comunidadId } = req.params;
  const query = `
    SELECT 
      u.id as usuario_id,
      p.id as persona_id,
      p.nombres, 
      p.apellidos, 
      p.email, 
      p.rut, 
      p.dv,
      GROUP_CONCAT(r.nombre SEPARATOR ', ') as roles,
      GROUP_CONCAT(r.codigo SEPARATOR ',') as roles_codigo,
      MAX(ucr.desde) as desde,
      MIN(CASE WHEN ucr.hasta IS NULL THEN '9999-12-31' ELSE ucr.hasta END) as hasta,
      MIN(ucr.activo) as activo
    FROM usuario_comunidad_rol ucr
    INNER JOIN usuario u ON u.id = ucr.usuario_id
    INNER JOIN persona p ON p.id = u.persona_id
    INNER JOIN rol r ON r.id = ucr.rol_id
    WHERE ucr.comunidad_id = ? AND ucr.activo = 1
    GROUP BY u.id, p.id, p.nombres, p.apellidos, p.email, p.rut, p.dv
  `;
  // ...
});
```

#### **5.3. Asignar rol a usuario en comunidad**

```javascript
// POST /api/membresias/:comunidadId/usuarios/:usuarioId/roles
router.post(
  '/:comunidadId/usuarios/:usuarioId/roles',
  tenancy,
  authorize(['admin', 'superadmin']),
  async (req, res) => {
    const { comunidadId, usuarioId } = req.params;
    const { rol_id, desde, hasta } = req.body;

    try {
      const [result] = await db.query(
        `
      INSERT INTO usuario_comunidad_rol 
        (usuario_id, comunidad_id, rol_id, desde, hasta, activo)
      VALUES (?, ?, ?, ?, ?, 1)
    `,
        [usuarioId, comunidadId, rol_id, desde || new Date(), hasta || null]
      );

      res.status(201).json({
        message: 'Rol asignado exitosamente',
        id: result.insertId,
      });
    } catch (error) {
      logger.error('Error asignando rol:', error);
      res.status(500).json({ error: 'Error al asignar rol' });
    }
  }
);
```

#### **5.4. Remover rol de usuario**

```javascript
// DELETE /api/membresias/:comunidadId/usuarios/:usuarioId/roles/:rolId
router.delete(
  '/:comunidadId/usuarios/:usuarioId/roles/:rolId',
  tenancy,
  authorize(['admin', 'superadmin']),
  async (req, res) => {
    const { comunidadId, usuarioId, rolId } = req.params;

    try {
      await db.query(
        `
      UPDATE usuario_comunidad_rol
      SET activo = 0, hasta = CURDATE()
      WHERE usuario_id = ? 
        AND comunidad_id = ? 
        AND rol_id = ?
        AND activo = 1
    `,
        [usuarioId, comunidadId, rolId]
      );

      res.json({ message: 'Rol removido exitosamente' });
    } catch (error) {
      logger.error('Error removiendo rol:', error);
      res.status(500).json({ error: 'Error al remover rol' });
    }
  }
);
```

---

### 6. **src/routes/pagos.js**

**Cambios necesarios:**

```javascript
// ANTES:
const applyQuery = `
  INSERT INTO pago_aplicacion (pago_id, cargo_unidad_id, monto, prioridad)
  VALUES (?, ?, ?, ?)
`;

const updateCargoQuery = `
  UPDATE cargo_unidad 
  SET saldo = saldo - ?, 
      estado = CASE 
        WHEN saldo - ? <= 0 THEN 'pagado'
        WHEN saldo - ? < monto_total THEN 'parcial'
        ELSE estado
      END
  WHERE id = ?
`;

// DESPUÉS:
const applyQuery = `
  INSERT INTO pago_aplicacion (pago_id, cuenta_cobro_unidad_id, monto, prioridad)
  VALUES (?, ?, ?, ?)
`;

const updateCuentaQuery = `
  UPDATE cuenta_cobro_unidad 
  SET saldo = saldo - ?, 
      estado = CASE 
        WHEN saldo - ? <= 0 THEN 'pagado'
        WHEN saldo - ? < monto_total THEN 'parcial'
        ELSE estado
      END
  WHERE id = ?
`;
```

---

### 7. **src/middleware/auth.js**

**Actualizar verificación de roles:**

```javascript
// ANTES:
async function checkUserRole(userId, comunidadId) {
  const [rows] = await db.query(
    `
    SELECT rol 
    FROM membresia_comunidad 
    WHERE persona_id = (SELECT persona_id FROM usuario WHERE id = ?)
      AND comunidad_id = ?
      AND activo = 1
  `,
    [userId, comunidadId]
  );

  return rows.length > 0 ? rows[0].rol : null;
}

// DESPUÉS:
async function checkUserRoles(userId, comunidadId) {
  const [rows] = await db.query(
    `
    SELECT r.codigo, r.nivel_acceso
    FROM usuario_comunidad_rol ucr
    INNER JOIN rol r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = ?
      AND ucr.comunidad_id = ?
      AND ucr.activo = 1
  `,
    [userId, comunidadId]
  );

  return rows; // Retorna array de roles
}

// Verificar si usuario tiene rol de superadmin (acceso a todas las comunidades)
async function isSuperAdmin(userId) {
  const [rows] = await db.query(
    `
    SELECT 1
    FROM usuario_comunidad_rol ucr
    INNER JOIN rol r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = ?
      AND r.codigo = 'superadmin'
      AND ucr.activo = 1
    LIMIT 1
  `,
    [userId]
  );

  return rows.length > 0;
}
```

---

### 8. **src/middleware/authorize.js**

**Actualizar middleware de autorización:**

```javascript
// ANTES:
function authorize(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const comunidadId = req.comunidadId || req.params.comunidadId;

      const [rows] = await db.query(
        `
        SELECT m.rol
        FROM membresia_comunidad m
        WHERE m.persona_id = (SELECT persona_id FROM usuario WHERE id = ?)
          AND m.comunidad_id = ?
          AND m.activo = 1
      `,
        [userId, comunidadId]
      );

      if (rows.length === 0) {
        return res
          .status(403)
          .json({ error: 'No tiene acceso a esta comunidad' });
      }

      const userRole = rows[0].rol;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'No tiene permisos suficientes' });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      logger.error('Error en autorización:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
}

// DESPUÉS:
function authorize(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const comunidadId = req.comunidadId || req.params.comunidadId;

      // Verificar si es superadmin (tiene acceso a todo)
      const [superadminRows] = await db.query(
        `
        SELECT 1
        FROM usuario_comunidad_rol ucr
        INNER JOIN rol r ON r.id = ucr.rol_id
        WHERE ucr.usuario_id = ?
          AND r.codigo = 'superadmin'
          AND ucr.activo = 1
        LIMIT 1
      `,
        [userId]
      );

      if (superadminRows.length > 0) {
        req.userRoles = ['superadmin'];
        req.isSuperAdmin = true;
        return next();
      }

      // Verificar roles en la comunidad específica
      const [rows] = await db.query(
        `
        SELECT r.codigo, r.nivel_acceso
        FROM usuario_comunidad_rol ucr
        INNER JOIN rol r ON r.id = ucr.rol_id
        WHERE ucr.usuario_id = ?
          AND ucr.comunidad_id = ?
          AND ucr.activo = 1
      `,
        [userId, comunidadId]
      );

      if (rows.length === 0) {
        return res
          .status(403)
          .json({ error: 'No tiene acceso a esta comunidad' });
      }

      const userRoles = rows.map((r) => r.codigo);
      const hasPermission = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'No tiene permisos suficientes',
          required: allowedRoles,
          current: userRoles,
        });
      }

      req.userRoles = userRoles;
      req.userMaxLevel = Math.max(...rows.map((r) => r.nivel_acceso));
      next();
    } catch (error) {
      logger.error('Error en autorización:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
}

module.exports = authorize;
```

---

### 9. **src/routes/auth.js**

**Actualizar respuesta de login para incluir roles:**

```javascript
// ANTES:
router.post('/login', async (req, res) => {
  // ... validación de credenciales ...

  const [membresias] = await db.query(
    `
    SELECT m.comunidad_id, c.nombre as comunidad_nombre, m.rol
    FROM membresia_comunidad m
    INNER JOIN comunidad c ON c.id = m.comunidad_id
    WHERE m.persona_id = ? AND m.activo = 1
  `,
    [user.persona_id]
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_superadmin: user.is_superadmin,
      comunidades: membresias,
    },
  });
});

// DESPUÉS:
router.post('/login', async (req, res) => {
  // ... validación de credenciales ...

  const [roles] = await db.query(
    `
    SELECT 
      ucr.comunidad_id, 
      c.nombre as comunidad_nombre,
      GROUP_CONCAT(r.codigo) as roles,
      GROUP_CONCAT(r.nombre SEPARATOR ', ') as roles_nombres,
      MAX(r.nivel_acceso) as nivel_acceso_maximo
    FROM usuario_comunidad_rol ucr
    INNER JOIN comunidad c ON c.id = ucr.comunidad_id
    INNER JOIN rol r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = ? AND ucr.activo = 1
    GROUP BY ucr.comunidad_id, c.nombre
  `,
    [user.id]
  );

  // Verificar si es superadmin
  const isSuperAdmin = roles.some((r) => r.roles.includes('superadmin'));

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_superadmin: isSuperAdmin,
      comunidades: roles.map((r) => ({
        comunidad_id: r.comunidad_id,
        comunidad_nombre: r.comunidad_nombre,
        roles: r.roles.split(','),
        roles_nombres: r.roles_nombres,
        nivel_acceso: r.nivel_acceso_maximo,
      })),
    },
  });
});
```

---

## 🔄 Búsqueda y Reemplazo Global

Puedes usar estos patrones para buscar y reemplazar en todo el proyecto:

```bash
# En Visual Studio Code o cualquier editor:

# Buscar: cargo_unidad
# Reemplazar con: cuenta_cobro_unidad

# Buscar: cargo_unidad_detalle
# Reemplazar con: detalle_cuenta_unidad

# Buscar: emision_gasto_comun
# Reemplazar con: emision_gastos_comunes

# Buscar: emision_gasto_detalle
# Reemplazar con: detalle_emision

# Buscar: tenencia_unidad
# Reemplazar con: titulares_unidad

# Buscar: \bticket\b
# Reemplazar con: solicitud_soporte

# Buscar: bitacora_conserjeria
# Reemplazar con: registro_conserjeria
```

---

## ✅ Checklist de Verificación

- [ ] Ejecutar script `migracion_estructura_mejorada.sql`
- [ ] Verificar las consultas de verificación al final del script
- [ ] Actualizar `src/routes/cargos.js` o renombrar a `cuentasCobro.js`
- [ ] Actualizar `src/routes/emisiones.js`
- [ ] Actualizar `src/routes/unidades.js`
- [ ] Actualizar `src/routes/soporte.js` (si existe referencia a tickets)
- [ ] Refactorizar completamente `src/routes/membresias.js`
- [ ] Actualizar `src/middleware/auth.js`
- [ ] Actualizar `src/middleware/authorize.js`
- [ ] Actualizar `src/routes/auth.js` (respuesta de login)
- [ ] Actualizar `src/routes/pagos.js`
- [ ] Buscar y reemplazar nombres de tablas en todo el proyecto
- [ ] Actualizar Swagger/documentación de API
- [ ] Actualizar tests unitarios
- [ ] Probar todos los endpoints afectados
- [ ] Actualizar frontend (componentes que usen nombres antiguos)
- [ ] Una vez verificado, eliminar vistas de compatibilidad
- [ ] Eliminar tabla `membresia_comunidad` antigua

---

## 🚨 Notas Importantes

1. **Las vistas de compatibilidad** permiten que el sistema siga funcionando mientras actualizas el código gradualmente
2. **NO elimines** las vistas ni la tabla `membresia_comunidad` hasta verificar que todo funciona
3. El campo `is_superadmin` en `usuario` se mantiene marcado como DEPRECADO pero funcional
4. Los **roles ahora son flexibles** y se pueden agregar/modificar en la tabla `rol`
5. Un usuario puede tener **múltiples roles** en la misma comunidad
6. El nivel de acceso en roles permite comparaciones jerárquicas (`nivel_acceso >= 70`)

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs de la base de datos
2. Verifica las consultas de verificación al final del script SQL
3. Usa las vistas de compatibilidad temporalmente
4. Revisa este documento paso a paso

---

**Fecha de creación:** Octubre 2025  
**Versión:** 1.0
