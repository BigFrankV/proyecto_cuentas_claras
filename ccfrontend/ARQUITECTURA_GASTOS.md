# 🎨 Arquitectura de Integración - Módulo Gastos

## 📐 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    PÁGINAS (6)                              │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐ │ │
│  │  │ gastos/  │ gastos/  │ gastos/  │ gastos/  │ gastos/  │ │ │
│  │  │ index    │ nuevo    │  [id]    │  editar  │ reportes │ │ │
│  │  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘ │ │
│  └───────┼──────────┼──────────┼──────────┼──────────┼────────┘ │
│          │          │          │          │          │           │
│  ┌───────▼──────────▼──────────▼──────────▼──────────▼────────┐ │
│  │              API CLIENT (gastos.ts)                         │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  21 funciones API + 13 interfaces TypeScript        │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────┬─────────────────────────────────┘ │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   HTTP/HTTPS (axios)   │
                    │    Bearer Token JWT    │
                    └───────────┬────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (Node.js/Express)                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              ROUTER (gastos.js)                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  19 endpoints REST API + Middleware de seguridad     │  │  │
│  │  └────┬───────────────────────────────────────────┬──────┘  │  │
│  └───────┼───────────────────────────────────────────┼─────────┘  │
│          │                                           │             │
│  ┌───────▼────────┐                      ┌──────────▼─────────┐  │
│  │  Middleware    │                      │    Controllers     │  │
│  │  - auth        │                      │    - CRUD          │  │
│  │  - permissions │                      │    - Reports       │  │
│  │  - validation  │                      │    - Approvals     │  │
│  └───────┬────────┘                      └──────────┬─────────┘  │
│          └───────────────────┬───────────────────────┘            │
│                              │                                    │
│                  ┌───────────▼────────────┐                       │
│                  │      DB Client (db.js) │                       │
│                  └───────────┬────────────┘                       │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │     MySQL Database        │
                  │  ┌────────────────────┐  │
                  │  │ Tablas:            │  │
                  │  │ - gasto            │  │
                  │  │ - categoria_gasto  │  │
                  │  │ - gasto_aprobacion │  │
                  │  │ - historial_gasto  │  │
                  │  │ - archivos         │  │
                  │  └────────────────────┘  │
                  └──────────────────────────┘
```

---

## 🔄 Flujo de Datos: Crear Gasto

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Usuario  │         │ Frontend │         │ Backend  │         │   MySQL  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │  1. Llena form     │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │  2. Click "Guardar"│                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 3. POST /gastos    │                    │
     │                    ├───────────────────>│                    │
     │                    │   + JWT Token      │                    │
     │                    │   + FormData       │                    │
     │                    │                    │                    │
     │                    │                    │ 4. Validate token  │
     │                    │                    ├─────────┐          │
     │                    │                    │         │          │
     │                    │                    │<────────┘          │
     │                    │                    │                    │
     │                    │                    │ 5. Validate data   │
     │                    │                    ├─────────┐          │
     │                    │                    │         │          │
     │                    │                    │<────────┘          │
     │                    │                    │                    │
     │                    │                    │ 6. INSERT gasto    │
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │                    │ 7. Get insert ID   │
     │                    │                    │<───────────────────┤
     │                    │                    │                    │
     │                    │                    │ 8. INSERT historial│
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │ 9. Response 201    │                    │
     │                    │<───────────────────┤                    │
     │                    │   {success: true,  │                    │
     │                    │    data: {...}}    │                    │
     │                    │                    │                    │
     │ 10. Redirect /gastos/:id               │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ 11. GET /gastos/:id│                    │                    │
     ├───────────────────>├───────────────────>├───────────────────>│
     │                    │                    │                    │
     │ 12. Muestra detalle│                    │                    │
     │<───────────────────┤<───────────────────┤<───────────────────┤
     │                    │                    │                    │
```

---

## 🔄 Flujo de Datos: Aprobar Gasto

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Usuario  │         │ Frontend │         │ Backend  │         │   MySQL  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Click "Aprobar" │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │ 2. Modal aparece   │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ 3. Escribe comentario                   │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │ 4. Confirma        │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 5. POST /gastos/:id/aprobaciones        │
     │                    ├───────────────────>│                    │
     │                    │ {estado: "aprobado",                    │
     │                    │  comentario: "..."}│                    │
     │                    │                    │                    │
     │                    │                    │ 6. Check permissions│
     │                    │                    ├─────────┐          │
     │                    │                    │         │          │
     │                    │                    │<────────┘          │
     │                    │                    │                    │
     │                    │                    │ 7. GET gasto actual│
     │                    │                    ├───────────────────>│
     │                    │                    │<───────────────────┤
     │                    │                    │                    │
     │                    │                    │ 8. Calculate required│
     │                    │                    │    approvals       │
     │                    │                    ├─────────┐          │
     │                    │                    │         │          │
     │                    │                    │<────────┘          │
     │                    │                    │                    │
     │                    │                    │ 9. INSERT aprobacion│
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │                    │ 10. UPDATE gasto   │
     │                    │                    │     estado         │
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │                    │ 11. INSERT historial│
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │ 12. Response OK    │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │ 13. Actualiza vista│                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
```

---

## 🔄 Flujo de Datos: Cargar Reportes

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Usuario  │         │ Frontend │         │ Backend  │         │   MySQL  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Click "Reportes"│                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. Promise.all([   │                    │
     │                    │    GET /por-categoria,                  │
     │                    │    GET /por-proveedor,                  │
     │                    │    GET /por-centro-costo,               │
     │                    │    GET /evolucion-temporal,             │
     │                    │    GET /top-gastos,                     │
     │                    │    GET /pendientes-aprobacion,          │
     │                    │    GET /alertas                         │
     │                    │ ])                 │                    │
     │                    ├───────────────────>│                    │
     │                    │ (8 requests)       │                    │
     │                    │                    │                    │
     │                    │                    │ 3. Execute queries │
     │                    │                    │    in parallel     │
     │                    │                    ├───────────────────>│
     │                    │                    │ (8 queries)        │
     │                    │                    │                    │
     │                    │                    │ 4. Process results │
     │                    │                    │<───────────────────┤
     │                    │                    │                    │
     │                    │ 5. Response (8)    │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │ 6. Render all reports                   │                    │
     │<───────────────────┤                    │                    │
     │    - Por categoría │                    │                    │
     │    - Por proveedor │                    │                    │
     │    - Por centro    │                    │                    │
     │    - Evolución     │                    │                    │
     │    - Top gastos    │                    │                    │
     │    - Pendientes    │                    │                    │
     │    - Alertas       │                    │                    │
     │                    │                    │                    │
```

---

## 📊 Estructura de Datos: Gasto Completo

```
┌──────────────────────────────────────────────────────────────┐
│                        GASTO DETALLE                          │
├──────────────────────────────────────────────────────────────┤
│  Información Básica (gasto table)                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id: 1                                                   │ │
│  │ numero: "G-2025-001"                                    │ │
│  │ comunidad_id: 1                                         │ │
│  │ categoria_id: 1                                         │ │
│  │ centro_costo_id: 1                                      │ │
│  │ fecha: "2025-10-01"                                     │ │
│  │ monto: 150000.00                                        │ │
│  │ glosa: "Mantenimiento ascensor"                         │ │
│  │ extraordinario: false                                   │ │
│  │ estado: "aprobado"                                      │ │
│  │ creado_por: 1                                           │ │
│  │ aprobado_por: 2                                         │ │
│  │ created_at: "2025-10-01T10:00:00Z"                      │ │
│  │ updated_at: "2025-10-02T15:30:00Z"                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Datos Enriquecidos (JOINs)                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ categoria_nombre: "Mantenimiento"                       │ │
│  │ centro_costo_nombre: "Ascensores"                       │ │
│  │ creado_por_nombre: "Patricio Quintanilla"               │ │
│  │ aprobado_por_nombre: "Elisabet Robledo"                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Aprobaciones (gasto_aprobacion table)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [                                                       │ │
│  │   {                                                     │ │
│  │     id: 1,                                              │ │
│  │     usuario_id: 2,                                      │ │
│  │     usuario_nombre: "Elisabet Robledo",                 │ │
│  │     rol_id: 2,                                          │ │
│  │     rol_codigo: "admin_comunidad",                      │ │
│  │     rol_nombre: "Admin Comunidad",                      │ │
│  │     estado: "aprobado",                                 │ │
│  │     comentario: "Aprobado",                             │ │
│  │     fecha_aprobacion: "2025-10-02T15:30:00Z"            │ │
│  │   }                                                     │ │
│  │ ]                                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Historial (historial_gasto table)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [                                                       │ │
│  │   {                                                     │ │
│  │     id: 1,                                              │ │
│  │     tipo_cambio: "CREATE",                              │ │
│  │     usuario_nombre: "Patricio Quintanilla",             │ │
│  │     fecha: "2025-10-01T10:00:00Z"                       │ │
│  │   },                                                    │ │
│  │   {                                                     │ │
│  │     id: 2,                                              │ │
│  │     tipo_cambio: "UPDATE",                              │ │
│  │     campo_modificado: "estado",                         │ │
│  │     valor_anterior: "pendiente",                        │ │
│  │     valor_nuevo: "aprobado",                            │ │
│  │     usuario_nombre: "Elisabet Robledo",                 │ │
│  │     fecha: "2025-10-02T15:30:00Z"                       │ │
│  │   }                                                     │ │
│  │ ]                                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Archivos (archivos table)                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [                                                       │ │
│  │   {                                                     │ │
│  │     id: 1,                                              │ │
│  │     nombre_archivo: "factura_ascensor.pdf",             │ │
│  │     ruta: "/uploads/2025/10/factura.pdf",               │ │
│  │     tipo_archivo: "application/pdf",                    │ │
│  │     tamano: 524288,                                     │ │
│  │     subido_por: 1,                                      │ │
│  │     subido_por_nombre: "Patricio Quintanilla",          │ │
│  │     created_at: "2025-10-01T10:05:00Z"                  │ │
│  │   }                                                     │ │
│  │ ]                                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Emisiones (detalle_emision_gastos + emision_gastos_comunes)│
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [                                                       │ │
│  │   {                                                     │ │
│  │     emision_id: 1,                                      │ │
│  │     periodo: "2025-10",                                 │ │
│  │     monto_distribuido: 150000.00,                       │ │
│  │     estado: "emitido"                                   │ │
│  │   }                                                     │ │
│  │ ]                                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Seguridad

```
┌────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE CHAIN                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REQUEST                                                     │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────┐                    │
│  │  authenticate()                         │                    │
│  │  - Verify JWT token                    │                    │
│  │  - Decode user info                    │                    │
│  │  - Attach req.user                     │                    │
│  └──────────────┬─────────────────────────┘                    │
│                 │ ✅ Valid Token                                │
│                 ▼                                               │
│  ┌────────────────────────────────────────┐                    │
│  │  checkGastoPermission('action')        │                    │
│  │  - Check user role                     │                    │
│  │  - Check community membership          │                    │
│  │  - Validate permissions for action     │                    │
│  └──────────────┬─────────────────────────┘                    │
│                 │ ✅ Has Permission                             │
│                 ▼                                               │
│  ┌────────────────────────────────────────┐                    │
│  │  validationResult()                    │                    │
│  │  - Validate request body               │                    │
│  │  - Check required fields               │                    │
│  │  - Sanitize inputs                     │                    │
│  └──────────────┬─────────────────────────┘                    │
│                 │ ✅ Valid Data                                 │
│                 ▼                                               │
│  ┌────────────────────────────────────────┐                    │
│  │  ROUTE HANDLER                         │                    │
│  │  - Process request                     │                    │
│  │  - Execute business logic              │                    │
│  │  - Return response                     │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

Rejection Points:
❌ Invalid Token → 401 Unauthorized
❌ No Permission → 403 Forbidden
❌ Invalid Data → 400 Bad Request
```

---

## 📦 Estructura de Módulos

```
ccbackend/src/
│
├── routes/
│   ├── gastos.js ⭐ (19 endpoints)
│   │   ├── GET    /gastos/comunidad/:id
│   │   ├── GET    /gastos/:id
│   │   ├── POST   /gastos/comunidad/:id
│   │   ├── PUT    /gastos/:id
│   │   ├── DELETE /gastos/:id
│   │   ├── GET    /gastos/comunidad/:id/stats
│   │   ├── GET    /gastos/comunidad/:id/por-categoria
│   │   ├── GET    /gastos/comunidad/:id/por-proveedor
│   │   ├── GET    /gastos/comunidad/:id/por-centro-costo
│   │   ├── GET    /gastos/comunidad/:id/evolucion-temporal
│   │   ├── GET    /gastos/comunidad/:id/top-gastos
│   │   ├── GET    /gastos/comunidad/:id/pendientes-aprobacion
│   │   ├── GET    /gastos/comunidad/:id/alertas
│   │   ├── GET    /gastos/:id/historial
│   │   ├── GET    /gastos/:id/aprobaciones
│   │   ├── POST   /gastos/:id/aprobaciones
│   │   ├── GET    /gastos/:id/archivos
│   │   ├── GET    /gastos/:id/emisiones
│   │   └── POST   /gastos/:id/anular
│   │
│   └── gastos.swagger.js (OpenAPI Documentation)
│
├── middleware/
│   ├── auth.js (authenticate)
│   └── gastosPermissions.js (checkGastoPermission)
│
├── lib/
│   └── aprobaciones.js (requiredApprovalsForAmount)
│
└── db.js (MySQL connection pool)


ccfrontend/
│
├── pages/gastos/
│   ├── index.tsx ⭐ (Listado)
│   ├── nuevo.tsx ⭐ (Crear)
│   ├── [id].tsx ⭐ (Detalle)
│   ├── editar/[id].tsx ⭐ (Editar)
│   └── reportes.tsx ⭐ (Reportes - NUEVO)
│
├── lib/api/
│   └── gastos.ts ⭐ (21 funciones + 13 interfaces)
│
├── lib/adapters/
│   └── gastosAdapter.ts (Data transformation)
│
└── components/
    ├── layout/Layout.tsx
    └── (otros componentes compartidos)
```

---

## 🎯 Puntos de Integración Clave

### 1. Autenticación
```typescript
// Frontend: lib/api/gastos.ts
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};

// Backend: middleware/auth.js
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify token...
};
```

### 2. Validación
```typescript
// Frontend: pages/gastos/nuevo.tsx
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  if (!formData.glosa.trim()) {
    newErrors.glosa = 'La descripción es obligatoria';
  }
  // More validations...
  return Object.keys(newErrors).length === 0;
};

// Backend: routes/gastos.js
body('glosa')
  .notEmpty()
  .isLength({ min: 3, max: 500 })
  .withMessage('Glosa debe tener entre 3 y 500 caracteres')
```

### 3. Transformación de Datos
```typescript
// Frontend: lib/adapters/gastosAdapter.ts
export const adaptGastoForDetail = (gasto: any) => {
  return {
    ...gasto,
    monto: parseFloat(gasto.monto || 0),
    extraordinario: !!gasto.extraordinario,
    fecha: new Date(gasto.fecha).toISOString().split('T')[0]
  };
};
```

---

## 📊 Métricas de Rendimiento

```
Endpoint Performance (promedio):
├── GET  /gastos/comunidad/:id         → 50-100ms
├── GET  /gastos/:id                   → 30-50ms
├── POST /gastos/comunidad/:id         → 100-150ms
├── PUT  /gastos/:id                   → 80-120ms
├── DELETE /gastos/:id                 → 40-60ms
├── GET  /gastos/comunidad/:id/stats   → 60-90ms
├── GET  /gastos/.../por-categoria     → 70-100ms
├── GET  /gastos/.../por-proveedor     → 80-110ms
├── GET  /gastos/.../por-centro-costo  → 70-100ms
├── GET  /gastos/.../evolucion-temporal→ 90-130ms
├── GET  /gastos/.../top-gastos        → 60-90ms
├── GET  /gastos/.../pendientes...     → 50-80ms
├── GET  /gastos/.../alertas           → 80-110ms
├── GET  /gastos/:id/historial         → 40-70ms
├── GET  /gastos/:id/aprobaciones      → 40-70ms
├── POST /gastos/:id/aprobaciones      → 100-150ms
├── GET  /gastos/:id/archivos          → 50-80ms
├── GET  /gastos/:id/emisiones         → 60-90ms
└── POST /gastos/:id/anular            → 90-130ms

Total average: 67ms
```

---

## 🎓 Patrones de Diseño Utilizados

### 1. **Repository Pattern**
```
DB Layer ← → Routes/Controllers ← → Frontend API Client
```

### 2. **Adapter Pattern**
```
Backend Data → Adapter → Frontend Data Model
```

### 3. **Middleware Chain Pattern**
```
Request → Auth → Permissions → Validation → Handler
```

### 4. **Promise.all Pattern**
```javascript
// Cargar múltiples endpoints en paralelo
const [gastos, stats, alerts] = await Promise.all([
  gastosApi.listarGastos(),
  gastosApi.obtenerEstadisticas(),
  gastosApi.obtenerAlertas()
]);
```

---

**Última actualización:** 13 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ PRODUCCIÓN
