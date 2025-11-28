# 📋 ANÁLISIS DE PERMISOS - MÓDULO ESTRUCTURA

## 🎯 Requisitos del Usuario

### **Jerarquía de Roles:**
1. **Superadmin** → Ve TODO, hace TODO (sin límite de comunidades)
2. **Admin Comunidad** → Ve TODO de SU comunidad, crea/edita en su comunidad
3. **Roles Básicos** (Propietario, Inquilino, Residente) → Solo ven LO SUYO

### **Reglas por Entidad:**

#### **COMUNIDADES**
- ✅ **GET**: Todos los roles ven sus comunidades asignadas
  - Superadmin: todas
  - Admin: las suyas
  - Básicos: las suyas
- ✅ **POST**: Solo Superadmin puede crear
- ⚠️ **PATCH**: Superadmin + Admin Comunidad pueden editar
- ⚠️ **DELETE**: Solo Superadmin

#### **EDIFICIOS**
- ⚠️ **GET**: Todos ven según su comunidad
  - Superadmin: todos
  - Admin: de su comunidad
  - Básicos: solo edificios donde tienen unidades
- ⚠️ **POST**: Superadmin + Admin Comunidad
- ⚠️ **PATCH**: Superadmin + Admin Comunidad
- ⚠️ **DELETE**: Superadmin + Admin Comunidad

#### **TORRES**
- ⚠️ **GET**: Todos ven según su comunidad/edificio
  - Superadmin: todas
  - Admin: de su comunidad
  - Básicos: solo torres donde tienen unidades
- ⚠️ **POST**: Superadmin + Admin Comunidad
- ⚠️ **PATCH**: Superadmin + Admin Comunidad
- ⚠️ **DELETE**: Superadmin + Admin Comunidad

#### **UNIDADES**
- ❌ **GET**: Todos ven según su comunidad/propiedad
  - Superadmin: todas
  - Admin: de su comunidad
  - Básicos: SOLO SUS UNIDADES
- ⚠️ **POST**: Superadmin + Admin Comunidad
- ⚠️ **PATCH**: Superadmin + Admin Comunidad
- ⚠️ **DELETE**: Superadmin + Admin Comunidad

---

## 📊 ESTADO ACTUAL DEL BACKEND

### **1. COMUNIDADES** (`ccbackend/src/routes/comunidades.js`)

#### **GET /**
```javascript
router.get(
  '/',
  authenticate,
  authorize('superadmin', 'admin_comunidad', 'conserje', 'contador', ..., 'residente', 'propietario', 'inquilino'),
  async (req, res) => {
    // ✅ BIEN: Todos pueden acceder
    // ✅ BIEN: Filtra por comunidades del usuario si no es superadmin
    
    if (!req.user.is_superadmin) {
      query += `
        INNER JOIN usuario_miembro_comunidad umc 
          ON c.id = umc.comunidad_id 
          AND umc.persona_id = ?
      `;
    }
  }
);
```
**Estado:** ✅ **CORRECTO** - Filtra correctamente por comunidades asignadas

#### **POST /**
```javascript
router.post(
  '/',
  [authenticate, authorize('superadmin'), ...validations],
  async (req, res) => {
    // ✅ BIEN: Solo superadmin puede crear comunidades
  }
);
```
**Estado:** ✅ **CORRECTO** - Solo superadmin crea

#### **PATCH /:id**
```javascript
router.patch(
  '/:id',
  [authenticate, authorize('superadmin', 'admin_comunidad'), ...validations],
  async (req, res) => {
    // ⚠️ PROBLEMA: Admin puede editar CUALQUIER comunidad
    // ❌ FALTA: Validar que admin solo edite SU comunidad
  }
);
```
**Estado:** ⚠️ **NECESITA CORRECCIÓN**

---

### **2. EDIFICIOS** (`ccbackend/src/routes/edificios.js`)

#### **GET /**
```javascript
router.get('/', authenticate, async (req, res) => {
  // ⚠️ PROBLEMA: No usa authorize()
  // ⚠️ PROBLEMA: Filtro manual por rol en el SQL
  
  if (!req.user.is_superadmin) {
    if (req.user.rol === 'admin') {
      query += `
        INNER JOIN usuario_miembro_comunidad umc 
          ON c.id = umc.comunidad_id
          AND umc.persona_id = ?
          AND umc.rol = 'admin'
      `;
    } else {
      // ❌ PROBLEMA: Roles básicos ven TODOS los edificios de su comunidad
      // ❌ DEBERÍA: Solo ver edificios donde tienen unidades
      query += `
        INNER JOIN usuario_miembro_comunidad umc 
          ON c.id = umc.comunidad_id
          AND umc.persona_id = ?
      `;
    }
  }
});
```
**Estado:** ❌ **NECESITA CORRECCIÓN** - Roles básicos ven demasiado

#### **POST /**
```javascript
router.post(
  '/',
  [authenticate, authorize('admin', 'superadmin'), ...validations],
  async (req, res) => {
    // ⚠️ PROBLEMA: Admin puede crear en CUALQUIER comunidad
    // ❌ FALTA: Validar que admin solo cree en SU comunidad
  }
);
```
**Estado:** ⚠️ **NECESITA CORRECCIÓN**

#### **PATCH /:id**
```javascript
router.patch(
  '/:id',
  [authenticate, authorize('admin', 'superadmin'), ...validations],
  async (req, res) => {
    // ⚠️ PROBLEMA: Admin puede editar CUALQUIER edificio
    // ❌ FALTA: Validar que edificio pertenece a SU comunidad
  }
);
```
**Estado:** ⚠️ **NECESITA CORRECCIÓN**

---

### **3. TORRES** (`ccbackend/src/routes/torres.js`)

#### **GET /edificio/:edificioId/listado**
```javascript
router.get('/edificio/:edificioId/listado', authenticate, async (req, res) => {
  // ⚠️ PROBLEMA: No valida permisos por rol
  // ⚠️ PROBLEMA: No verifica que usuario tenga acceso al edificio/comunidad
  // ❌ CUALQUIER usuario autenticado puede ver CUALQUIER torre
});
```
**Estado:** ❌ **NECESITA CORRECCIÓN** - Sin control de acceso

#### **POST /edificio/:edificioId**
```javascript
router.post(
  '/edificio/:edificioId',
  [
    authenticate,
    // ✅ BIEN: Usa requireCommunity con rol 'admin'
    requireCommunity('comunidadId', ['admin']),
    ...validations
  ],
  async (req, res) => {
    // ✅ PARCIALMENTE BIEN: Valida que sea admin de la comunidad
  }
);
```
**Estado:** ⚠️ **PARCIALMENTE CORRECTO** - Falta validar superadmin

#### **PATCH /:id**
```javascript
router.patch(
  '/:id',
  [authenticate, authorize('admin', 'superadmin'), ...validations],
  async (req, res) => {
    // ⚠️ PROBLEMA: Admin puede editar CUALQUIER torre
    // ❌ FALTA: Validar que torre pertenece a SU comunidad
  }
);
```
**Estado:** ⚠️ **NECESITA CORRECCIÓN**

---

### **4. UNIDADES** (`ccbackend/src/routes/unidades.js`)

#### **GET /comunidad/:comunidadId**
```javascript
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    // ❌ PROBLEMA: requireCommunity solo valida membership
    // ❌ PROBLEMA: Roles básicos ven TODAS las unidades de su comunidad
    // ❌ DEBERÍA: Solo ver SUS unidades
    
    SELECT u.id, u.codigo, u.edificio_id, u.torre_id, ...
    FROM unidad u
    WHERE u.comunidad_id = ?  -- ❌ Sin filtro por persona
    LIMIT 500
  }
);
```
**Estado:** ❌ **NECESITA CORRECCIÓN CRÍTICA** - Roles básicos ven todo

#### **POST /comunidad/:comunidadId**
```javascript
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin']),  // ✅ Solo admin
    ...validations
  ],
  async (req, res) => {
    // ✅ PARCIALMENTE BIEN: Solo admin puede crear
    // ⚠️ FALTA: Validar superadmin
  }
);
```
**Estado:** ⚠️ **PARCIALMENTE CORRECTO**

#### **PATCH /comunidad/:comunidadId/:unidadId**
```javascript
router.patch(
  '/comunidad/:comunidadId/:unidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin']),
    ...validations
  ],
  async (req, res) => {
    // ✅ Solo admin puede editar
    // ⚠️ FALTA: Validar superadmin
  }
);
```
**Estado:** ⚠️ **PARCIALMENTE CORRECTO**

---

## 🔴 PROBLEMAS IDENTIFICADOS

### **CRÍTICOS (Bloquean funcionalidad):**

1. **❌ Unidades GET - Roles básicos ven TODO**
   - **Impacto:** Propietario ve unidades de otros
   - **Ubicación:** `ccbackend/src/routes/unidades.js:16-40`
   - **Fix:** Agregar JOIN con `titulares_unidad` para filtrar por persona

2. **❌ Edificios GET - Roles básicos ven TODO**
   - **Impacto:** Usuario ve edificios donde NO tiene unidades
   - **Ubicación:** `ccbackend/src/routes/edificios.js:59`
   - **Fix:** Filtrar por edificios donde tiene unidades

3. **❌ Torres GET - Sin control de acceso**
   - **Impacto:** Cualquier usuario ve cualquier torre
   - **Ubicación:** `ccbackend/src/routes/torres.js:79`
   - **Fix:** Agregar requireCommunity y filtrar por rol

### **ALTOS (Seguridad):**

4. **⚠️ Admin puede editar comunidades ajenas**
   - **Ubicación:** `ccbackend/src/routes/comunidades.js:900`
   - **Fix:** Validar `usuario_miembro_comunidad` antes de editar

5. **⚠️ Admin puede crear edificios en comunidades ajenas**
   - **Ubicación:** `ccbackend/src/routes/edificios.js:772`
   - **Fix:** Validar membership en `comunidadId` del body

6. **⚠️ Admin puede editar edificios de otras comunidades**
   - **Ubicación:** `ccbackend/src/routes/edificios.js:905`
   - **Fix:** Verificar que edificio pertenece a su comunidad

7. **⚠️ Admin puede editar torres de otras comunidades**
   - **Ubicación:** `ccbackend/src/routes/torres.js:1746`
   - **Fix:** Verificar cadena edificio→comunidad→membership

### **MEDIOS (Mejoras):**

8. **⚠️ Falta authorize() en varios GET**
   - **Ubicación:** Múltiples endpoints
   - **Fix:** Agregar authorize() explícito

9. **⚠️ requireCommunity no valida superadmin**
   - **Ubicación:** Middleware
   - **Fix:** Agregar excepción para superadmin en requireCommunity

---

## ✅ PLAN DE CORRECCIÓN

### **Fase 1: CRÍTICOS (Implementar YA)**

#### **1.1 Unidades GET - Filtrar por persona**
```javascript
// ccbackend/src/routes/unidades.js
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const userId = req.user.persona_id;
  const isSuperadmin = req.user.is_superadmin;
  
  // Obtener rol en comunidad
  const [rolRows] = await db.query(
    'SELECT rol FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ?',
    [userId, comunidadId]
  );
  const rol = rolRows[0]?.rol;
  
  let query = `
    SELECT u.id, u.codigo, u.edificio_id, u.torre_id, ...
    FROM unidad u
    LEFT JOIN edificio e ON e.id = u.edificio_id
    LEFT JOIN torre t ON t.id = u.torre_id
  `;
  
  const params = [comunidadId];
  
  if (!isSuperadmin && !['admin', 'admin_comunidad'].includes(rol)) {
    // Roles básicos: solo SUS unidades
    query += `
      INNER JOIN titulares_unidad tu ON tu.unidad_id = u.id
      WHERE u.comunidad_id = ? 
        AND tu.persona_id = ?
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    `;
    params.push(userId);
  } else {
    // Admin/Superadmin: todas de la comunidad
    query += ` WHERE u.comunidad_id = ? `;
  }
  
  query += ` LIMIT 500`;
  
  const [rows] = await db.query(query, params);
  res.json(rows);
});
```

#### **1.2 Edificios GET - Filtrar por unidades para roles básicos**
```javascript
// ccbackend/src/routes/edificios.js
// Dentro del GET /
if (!req.user.is_superadmin) {
  if (req.user.rol === 'admin') {
    // Admin: edificios de su comunidad
    query += `
      INNER JOIN usuario_miembro_comunidad umc 
        ON c.id = umc.comunidad_id
        AND umc.persona_id = ?
        AND umc.rol IN ('admin', 'admin_comunidad')
    `;
  } else {
    // Roles básicos: solo edificios donde tienen unidades
    query += `
      INNER JOIN usuario_miembro_comunidad umc 
        ON c.id = umc.comunidad_id
        AND umc.persona_id = ?
      INNER JOIN unidad u ON u.edificio_id = e.id
      INNER JOIN titulares_unidad tu 
        ON tu.unidad_id = u.id
        AND tu.persona_id = umc.persona_id
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
    `;
  }
  params.push(req.user.persona_id);
}
```

#### **1.3 Torres GET - Agregar control de acceso**
```javascript
// ccbackend/src/routes/torres.js
router.get('/edificio/:edificioId/listado', authenticate, async (req, res) => {
  try {
    const edificioId = Number(req.params.edificioId);
    const userId = req.user.persona_id;
    const isSuperadmin = req.user.is_superadmin;
    
    // Verificar acceso al edificio
    const [edificio] = await db.query(
      'SELECT comunidad_id FROM edificio WHERE id = ?',
      [edificioId]
    );
    
    if (!edificio.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    const comunidadId = edificio[0].comunidad_id;
    
    if (!isSuperadmin) {
      // Verificar membership
      const [membership] = await db.query(
        'SELECT rol FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ?',
        [userId, comunidadId]
      );
      
      if (!membership.length) {
        return res.status(403).json({ error: 'Sin acceso a esta comunidad' });
      }
      
      const rol = membership[0].rol;
      
      // Si es rol básico, verificar que tenga unidades en este edificio
      if (!['admin', 'admin_comunidad'].includes(rol)) {
        const [unidades] = await db.query(
          `SELECT 1 FROM unidad u
           INNER JOIN titulares_unidad tu ON tu.unidad_id = u.id
           WHERE u.edificio_id = ? 
             AND tu.persona_id = ?
             AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
           LIMIT 1`,
          [edificioId, userId]
        );
        
        if (!unidades.length) {
          return res.status(403).json({ error: 'Sin acceso a este edificio' });
        }
      }
    }
    
    // Continuar con query normal...
  }
});
```

### **Fase 2: ALTOS (Implementar esta semana)**

#### **2.1 Validar admin solo edita su comunidad**
```javascript
// ccbackend/src/routes/comunidades.js PATCH
if (!req.user.is_superadmin) {
  const [membership] = await db.query(
    'SELECT 1 FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ? AND rol IN ("admin", "admin_comunidad")',
    [req.user.persona_id, comunidadId]
  );
  
  if (!membership.length) {
    return res.status(403).json({ error: 'No tienes permisos para editar esta comunidad' });
  }
}
```

#### **2.2 Validar admin solo crea edificios en su comunidad**
```javascript
// ccbackend/src/routes/edificios.js POST
const { comunidadId } = req.body;

if (!req.user.is_superadmin) {
  const [membership] = await db.query(
    'SELECT 1 FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ? AND rol IN ("admin", "admin_comunidad")',
    [req.user.persona_id, comunidadId]
  );
  
  if (!membership.length) {
    return res.status(403).json({ error: 'No tienes permisos en esta comunidad' });
  }
}
```

### **Fase 3: MEDIOS (Refactoring)**

#### **3.1 Mejorar requireCommunity para soportar superadmin**
```javascript
// ccbackend/src/middleware/tenancy.js
function requireCommunity(paramName, allowedRoles = []) {
  return async (req, res, next) => {
    // Superadmin siempre pasa
    if (req.user.is_superadmin) {
      return next();
    }
    
    // Resto de la lógica...
  };
}
```

---

## 📝 RESUMEN EJECUTIVO

| Módulo | GET | POST | PATCH | DELETE | Estado |
|--------|-----|------|-------|--------|--------|
| **Comunidades** | ✅ | ✅ | ⚠️ | ✅ | 75% OK |
| **Edificios** | ❌ | ⚠️ | ⚠️ | ⚠️ | 25% OK |
| **Torres** | ❌ | ⚠️ | ⚠️ | ⚠️ | 25% OK |
| **Unidades** | ❌ | ⚠️ | ⚠️ | ⚠️ | 25% OK |

### **Prioridad de Fixes:**
1. 🔴 **CRÍTICO**: Unidades GET (expone datos privados)
2. 🔴 **CRÍTICO**: Edificios GET (filtrar por roles básicos)
3. 🔴 **CRÍTICO**: Torres GET (sin control de acceso)
4. 🟡 **ALTO**: Admin edita comunidades ajenas
5. 🟡 **ALTO**: Admin crea/edita edificios en comunidades ajenas
6. 🟡 **ALTO**: Admin crea/edita torres en comunidades ajenas

---

**Generado:** 28 de noviembre de 2025
**Versión:** 1.0
