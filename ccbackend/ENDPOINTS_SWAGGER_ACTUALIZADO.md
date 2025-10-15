# 📋 Documentación Swagger Actualizada - Cuentas Claras API v2.0

**Fecha de actualización:** 2 de Octubre, 2025  
**Versión API:** 2.0.0  
**Total de endpoints:** 188+

---

## 🎯 Resumen de Cambios en Swagger

### ✅ Actualizaciones Realizadas

1. **Versión actualizada** de 1.0.0 → 2.0.0
2. **Descripción mejorada** con módulos más detallados
3. **25 tags organizados** (antes 10) con iconos y descripciones claras
4. **Nuevos endpoints documentados:**
   - POST /auth/verify-2fa
   - GET /comunidades/:id/dashboard
   - GET /comunidades/:id/miembros
   - GET /torres/comunidad/:id
5. **Credenciales de prueba** incluidas en la documentación
6. **Tabla de roles** con niveles de acceso 1-7

---

## 📦 Módulos y Endpoints por Categoría

### 🔐 1. Auth (Autenticación) - 18 endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Registro de nuevo usuario con auto-creación de persona | ❌ |
| POST | /auth/login | Login con identifier (email/username/RUT) | ❌ |
| POST | /auth/verify-2fa | **NUEVO** Verificar código 2FA | ❌ |
| POST | /auth/2fa/verify | Verificar código temporal 2FA | ❌ |
| GET | /auth/2fa/setup | Configurar 2FA (genera QR) | ✅ |
| POST | /auth/2fa/enable | Habilitar 2FA | ✅ |
| POST | /auth/2fa/disable | Deshabilitar 2FA | ✅ |
| POST | /auth/refresh | Refrescar token JWT | ✅ |
| POST | /auth/logout | Cerrar sesión | ✅ |
| POST | /auth/forgot-password | Solicitar reset de contraseña | ❌ |
| POST | /auth/reset-password | Resetear contraseña con token | ❌ |
| POST | /auth/change-password | Cambiar contraseña (autenticado) | ✅ |
| GET | /auth/me | Obtener perfil del usuario autenticado | ✅ |
| PATCH | /auth/profile | Actualizar perfil de usuario | ✅ |
| PATCH | /auth/profile/persona | Actualizar datos de persona | ✅ |
| GET | /auth/sessions | Listar sesiones activas | ✅ |
| DELETE | /auth/sessions/:sessionId | Cerrar sesión específica | ✅ |
| DELETE | /auth/sessions | Cerrar todas las sesiones | ✅ |
| GET | /auth/preferences | Obtener preferencias de usuario | ✅ |
| PATCH | /auth/preferences | Actualizar preferencias | ✅ |

**Notas importantes:**
- Campo `identifier` acepta: email, username, RUT, DNI
- Campos `nombres` y `apellidos` en plural (no singular)
- Password mínimo 6 caracteres con bcrypt
- 2FA usa TOTP con speakeasy

---

### 🏘️ 2. Comunidades - 12 endpoints

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | /comunidades | Lista con estadísticas | Todos |
| POST | /comunidades | Crear comunidad | admin, superadmin |
| GET | /comunidades/:id | Detalle de comunidad | Todos |
| PATCH | /comunidades/:id | Actualizar comunidad | admin, superadmin |
| DELETE | /comunidades/:id | Eliminar comunidad | superadmin |
| GET | /comunidades/:id/dashboard | **NUEVO** Dashboard con estadísticas completas | admin, propietario, residente |
| GET | /comunidades/:id/amenidades | Amenidades de la comunidad | Todos |
| GET | /comunidades/:id/edificios | Edificios de la comunidad | Todos |
| GET | /comunidades/:id/contactos | Contactos de emergencia | Todos |
| GET | /comunidades/:id/documentos | Documentos de la comunidad | Todos |
| GET | /comunidades/:id/miembros | **NUEVO** Alias de /residentes | Todos |
| GET | /comunidades/:id/residentes | Lista de residentes con roles | Todos |
| GET | /comunidades/:id/parametros | Parámetros de configuración | Todos |
| GET | /comunidades/:id/estadisticas | Estadísticas detalladas | Todos |
| GET | /comunidades/:id/flujo-caja | Flujo de caja por período | admin, contador |

**Dashboard incluye:**
- Información básica de comunidad
- Estadísticas de unidades (total, activas, inactivas)
- Estadísticas de residentes (total, propietarios, residentes, administradores)
- Estadísticas financieras (ingresos, gastos, saldo, balance)
- Top 5 cargos pendientes
- Últimos 5 pagos registrados

---

### 🏗️ 3. Edificios - 24 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /edificios | Lista de todos los edificios |
| GET | /edificios/stats | Estadísticas globales |
| GET | /edificios/comunidades-opciones | Opciones de comunidades |
| GET | /edificios/:id | Detalle de edificio |
| GET | /edificios/:id/torres | Torres del edificio |
| GET | /edificios/:id/unidades | Unidades del edificio |
| GET | /edificios/:id/amenidades | Amenidades del edificio |
| GET | /edificios/servicios | Servicios disponibles |
| GET | /edificios/amenidades-disponibles | Amenidades disponibles |
| GET | /edificios/comunidad/:comunidadId | Edificios por comunidad |
| POST | /edificios | Crear edificio |
| POST | /edificios/comunidad/:comunidadId | Crear en comunidad específica |
| PATCH | /edificios/:id | Actualización parcial |
| PUT | /edificios/:id | Actualización completa |
| GET | /edificios/:id/check-dependencies | Verificar dependencias antes de borrar |
| DELETE | /edificios/:id | Eliminar edificio |
| POST | /edificios/:id/torres | Crear torre en edificio |
| POST | /edificios/:id/unidades | Crear unidad en edificio |
| GET | /edificios/:id/filtros-opciones | Opciones para filtros |
| GET | /edificios/:id/resumen | Resumen del edificio |
| GET | /edificios/buscar | Búsqueda de edificios |
| GET | /edificios/:id/validar-codigo | Validar código único |

---

### 🗼 4. Torres - 6 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /torres/comunidad/:comunidadId | **NUEVO** Torres por comunidad |
| GET | /torres/edificio/:edificioId | Torres por edificio |
| POST | /torres/edificio/:edificioId | Crear torre en edificio |
| GET | /torres/:id | Detalle de torre |
| PATCH | /torres/:id | Actualizar torre |
| DELETE | /torres/:id | Eliminar torre |

**Nota:** El endpoint `/torres/comunidad/:id` hace JOIN con `edificio` para obtener todas las torres de una comunidad.

---

### 🏠 5. Unidades - 9 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /unidades/comunidad/:comunidadId | Unidades por comunidad |
| POST | /unidades/comunidad/:comunidadId | Crear unidad |
| GET | /unidades/:id | Detalle de unidad |
| PATCH | /unidades/:id | Actualizar unidad |
| DELETE | /unidades/:id | Eliminar unidad |
| GET | /unidades/:id/tenencias | Historial de tenencias |
| POST | /unidades/:id/tenencias | Crear tenencia |
| GET | /unidades/:id/residentes | Residentes actuales |

---

### 👤 6. Personas - 5 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /personas | Lista con filtros |
| POST | /personas | Crear persona |
| GET | /personas/:id | Detalle de persona |
| PATCH | /personas/:id | Actualizar persona |
| DELETE | /personas/:id | Eliminar persona |

---

### 👥 7. Membresías - 4 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /membresias/comunidad/:comunidadId | Membresías de la comunidad |
| POST | /membresias/comunidad/:comunidadId | Crear membresía |
| PATCH | /membresias/:id | Actualizar membresía |
| DELETE | /membresias/:id | Eliminar membresía |

**Cambio importante:** Usa `usuario_id` + `rol_id` (no persona_id + rol string)

---

### 💸 8. Cargos - 6 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /cargos/comunidad/:comunidadId | Cargos por comunidad |
| GET | /cargos/:id | Detalle de cargo |
| GET | /cargos/unidad/:id | Cargos por unidad |
| POST | /cargos/:id/recalcular-interes | Recalcular intereses |
| POST | /cargos/:id/notificar | Notificar cargo |

**Tabla:** `cuenta_cobro_unidad` (vista: `cargo_unidad`)

---

### 💰 9. Pagos - 6 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /pagos/comunidad/:comunidadId | Pagos por comunidad |
| POST | /pagos/comunidad/:comunidadId | Registrar pago |
| GET | /pagos/:id | Detalle de pago |
| POST | /pagos/:id/aplicar | Aplicar pago a cargos |
| POST | /pagos/:id/reversar | Reversar pago |

**Campos tabla pago:** `fecha`, `medio` (no fecha_pago/medio_pago)

---

### 💵 10. Gastos - 5 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /gastos/comunidad/:comunidadId | Gastos por comunidad |
| POST | /gastos/comunidad/:comunidadId | Registrar gasto |
| GET | /gastos/:id | Detalle de gasto |
| PATCH | /gastos/:id | Actualizar gasto |
| DELETE | /gastos/:id | Eliminar gasto |

---

### 📋 11. Emisiones - 7 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /emisiones/comunidad/:comunidadId | Emisiones por comunidad |
| POST | /emisiones/comunidad/:comunidadId | Crear emisión |
| GET | /emisiones/:id | Detalle de emisión |
| PATCH | /emisiones/:id | Actualizar estado |
| POST | /emisiones/:id/detalles | Agregar detalle a emisión |
| GET | /emisiones/:id/previsualizar-prorrateo | Previsualizar distribución |
| POST | /emisiones/:id/generar-cargos | Generar cargos a unidades |

**Tabla:** `emision_gastos_comunes`

---

### 📂 12. Categorías de Gasto - 4 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /categorias-gasto/comunidad/:comunidadId | Categorías por comunidad |
| POST | /categorias-gasto/comunidad/:comunidadId | Crear categoría |
| PATCH | /categorias-gasto/:id | Actualizar |
| DELETE | /categorias-gasto/:id | Eliminar |

---

### 🎯 13. Centros de Costo - 4 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /centros-costo/comunidad/:comunidadId | Centros por comunidad |
| POST | /centros-costo/comunidad/:comunidadId | Crear centro |
| PATCH | /centros-costo/:id | Actualizar |
| DELETE | /centros-costo/:id | Eliminar |

---

### 🏪 14. Proveedores - 5 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /proveedores/comunidad/:comunidadId | Proveedores por comunidad |
| POST | /proveedores/comunidad/:comunidadId | Crear proveedor |
| GET | /proveedores/:id | Detalle |
| PATCH | /proveedores/:id | Actualizar |
| DELETE | /proveedores/:id | Eliminar |

---

### 📄 15. Documentos de Compra - 5 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /documentos-compra/comunidad/:comunidadId | Documentos por comunidad |
| POST | /documentos-compra/comunidad/:comunidadId | Crear documento |
| GET | /documentos-compra/:id | Detalle |
| PATCH | /documentos-compra/:id | Actualizar |
| DELETE | /documentos-compra/:id | Eliminar |

---

### 🏦 16. Conciliaciones - 3 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /conciliaciones/comunidad/:comunidadId | Conciliaciones por comunidad |
| POST | /conciliaciones/comunidad/:comunidadId | Crear conciliación |
| PATCH | /conciliaciones/:id | Actualizar estado |

---

### ⚡ 17. Amenidades - 7 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /amenidades/comunidad/:comunidadId | Amenidades por comunidad |
| POST | /amenidades/comunidad/:comunidadId | Crear amenidad |
| GET | /amenidades/:id | Detalle |
| PATCH | /amenidades/:id | Actualizar |
| DELETE | /amenidades/:id | Eliminar |
| GET | /amenidades/:id/reservas | Reservas de amenidad |
| POST | /amenidades/:id/reservas | Crear reserva |

---

### ⚠️ 18. Multas - 6 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /multas/unidad/:unidadId | Multas por unidad |
| POST | /multas/unidad/:unidadId | Crear multa |
| GET | /multas/:id | Detalle |
| PATCH | /multas/:id | Actualizar |
| DELETE | /multas/:id | Eliminar |

---

### 📊 19. Medidores - 9 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /medidores/comunidad/:comunidadId | Medidores por comunidad |
| POST | /medidores/comunidad/:comunidadId | Crear medidor |
| GET | /medidores/:id | Detalle |
| PATCH | /medidores/:id | Actualizar |
| DELETE | /medidores/:id | Eliminar |
| GET | /medidores/:id/lecturas | Lecturas del medidor |
| POST | /medidores/:id/lecturas | Registrar lectura |
| GET | /medidores/:id/consumos | Calcular consumos |

---

### 💲 20. Tarifas de Consumo - 5 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /tarifas-consumo/comunidad/:comunidadId | Tarifas por comunidad |
| POST | /tarifas-consumo/comunidad/:comunidadId | Crear tarifa |
| GET | /tarifas-consumo/:id | Detalle |
| PATCH | /tarifas-consumo/:id | Actualizar |
| DELETE | /tarifas-consumo/:id | Eliminar |

---

### 🔧 21. Soporte - 11 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /soporte/comunidad/:comunidadId/tickets | Tickets de soporte |
| POST | /soporte/comunidad/:comunidadId/tickets | Crear ticket |
| GET | /soporte/tickets/:id | Detalle de ticket |
| PATCH | /soporte/tickets/:id | Actualizar ticket |
| GET | /soporte/comunidad/:comunidadId/notificaciones | Notificaciones |
| POST | /soporte/comunidad/:comunidadId/notificaciones | Crear notificación |
| GET | /soporte/comunidad/:comunidadId/documentos | Documentos |
| POST | /soporte/comunidad/:comunidadId/documentos | Subir documento |
| DELETE | /soporte/documentos/:id | Eliminar documento |
| GET | /soporte/comunidad/:comunidadId/bitacora | Bitácora de conserjería |
| POST | /soporte/comunidad/:comunidadId/bitacora | Crear registro |
| GET | /soporte/comunidad/:comunidadId/parametros-cobranza | Parámetros |
| PATCH | /soporte/comunidad/:comunidadId/parametros-cobranza | Actualizar parámetros |

**Tabla:** `solicitud_soporte` (antes `ticket`)

---

### 💳 22. Payment Gateway - 6 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /payment-gateway/available | Gateways disponibles |
| POST | /payment-gateway/create-payment | Crear transacción |
| POST | /payment-gateway/confirm-payment | Confirmar pago |
| GET | /payment-gateway/transaction/:orderId | Estado de transacción |
| GET | /payment-gateway/community/:communityId/transactions | Transacciones por comunidad |
| POST | /payment-gateway/webhook/webpay | Webhook Webpay |

**Integraciones:** Webpay, Khipu

---

### 📁 23. Files - 6 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /files/upload | Subir archivos (máx 10) |
| GET | /files/:id | Descargar archivo |
| GET | /files | Listar archivos con filtros |
| DELETE | /files/:id | Eliminar archivo |
| GET | /files/stats | Estadísticas de archivos |
| POST | /files/cleanup | Limpiar archivos huérfanos |

**Tabla:** `archivos` (tipos BIGINT)

---

### 🔔 24. Webhooks - 2 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /webhooks/pagos/webpay | Webhook Webpay |
| POST | /webhooks/pagos/khipu | Webhook Khipu |

---

### 🛠️ 25. Utilidades - 14 endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /version | Versión de la API |
| GET | /uf | Valor UF actual |
| GET | /utm | Valor UTM actual |
| GET | /validar-rut | Validar RUT chileno |
| POST | /sync | Sincronizar indicadores |
| GET | /sync/status | Estado de sincronización |
| POST | /sync/init | Inicializar sincronización |
| POST | /sync/manual | Sincronización manual |
| GET | /indicadores | Todos los indicadores |
| GET | /uf/historico | Histórico de UF |
| GET | /utm/historico | Histórico de UTM |

---

## 🔍 Verificación de Endpoints

### ✅ Endpoints Confirmados y Funcionales

| Endpoint | Status | Notas |
|----------|--------|-------|
| POST /auth/login | ✅ 200 | Campo `identifier` |
| POST /auth/register | ✅ 201 | Campos `nombres`, `apellidos` |
| POST /auth/verify-2fa | ✅ 200 | **Nuevo** Verificación 2FA |
| GET /membresias/comunidad/2 | ✅ 200 | Paginado |
| GET /comunidades | ✅ 200 | Con estadísticas |
| GET /comunidades/2 | ✅ 200 | Detalle |
| GET /comunidades/2/dashboard | ✅ 200 | **Nuevo** Dashboard completo |
| GET /comunidades/2/miembros | ✅ 200 | **Nuevo** Alias de /residentes |
| GET /comunidades/2/residentes | ✅ 200 | Lista con roles |
| GET /edificios/comunidad/2 | ✅ 200 | Edificios |
| GET /torres/comunidad/2 | ✅ 200 | **Nuevo** Torres por comunidad |
| GET /unidades/comunidad/2 | ✅ 200 | Unidades |

### ❌ Endpoints Anteriormente con Error (Corregidos)

| Endpoint | Error Anterior | Corrección |
|----------|----------------|------------|
| POST /auth/verify-2fa | 404 Not Found | ✅ Endpoint agregado |
| GET /comunidades/2/dashboard | 500 Unknown column 'p.fecha_pago' | ✅ Campos corregidos: `fecha`, `medio` |
| GET /comunidades/2/miembros | 404 Not Found | ✅ Alias agregado |
| GET /torres/comunidad/2 | 404 Not Found | ✅ Endpoint agregado |

---

## 📊 Estadísticas de la API

- **Total de rutas:** 25 módulos
- **Total de endpoints:** 188+
- **Endpoints GET:** ~120
- **Endpoints POST:** ~40
- **Endpoints PATCH/PUT:** ~20
- **Endpoints DELETE:** ~15

### Por Módulo:
- Auth: 18 endpoints
- Edificios: 24 endpoints
- Comunidades: 12 endpoints
- Soporte: 11 endpoints
- Utilidades: 14 endpoints
- Otros módulos: 3-9 endpoints cada uno

---

## 🔐 Autenticación y Seguridad

### Headers Requeridos

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Estructura del JWT Token

```json
{
  "sub": 1000,
  "username": "patricio",
  "persona_id": 1000,
  "roles": ["admin", "propietario"],
  "comunidad_id": 1,
  "memberships": [
    {
      "comunidadId": 1,
      "rol": "admin",
      "nivel_acceso": 2
    },
    {
      "comunidadId": 2,
      "rol": "propietario",
      "nivel_acceso": 6
    }
  ],
  "iat": 1696259400,
  "exp": 1696345800
}
```

---

## 🧪 Credenciales de Prueba

```
Email: patricio@pquintanilla.cl
Username: patricio
Password: 123456
RUT: 11111111-1
Membresías:
  - Comunidad 1: Admin (nivel 2)
  - Comunidad 2: Propietario (nivel 6)
```

**Ejecutar script SQL:**
```bash
mysql -u root -p cuentasclaras < base/usuario_patricio.sql
```

---

## 📝 Notas de Migración v2.0

### Cambios en Base de Datos

1. **Tabla `pago`:**
   - ❌ `fecha_pago` → ✅ `fecha`
   - ❌ `medio_pago` → ✅ `medio`

2. **Vista `cargo_unidad`:**
   - Solo campos: id, emision_id, comunidad_id, unidad_id, monto_total, saldo, estado, interes_acumulado, created_at, updated_at
   - ❌ No tiene: concepto, fecha_emision, fecha_vencimiento

3. **Tabla `comunidad`:**
   - Tipo de ID: BIGINT (no INT)
   - Nombre en singular (no `comunidades`)

4. **Tabla `archivos`:**
   - Todos los IDs: BIGINT
   - Foreign key: REFERENCES `comunidad`(id)

### Cambios en Endpoints

1. **Nuevos endpoints:**
   - POST /auth/verify-2fa
   - GET /comunidades/:id/dashboard
   - GET /comunidades/:id/miembros
   - GET /torres/comunidad/:id

2. **Endpoints con alias:**
   - GET /comunidades/:id/miembros → redirige a /residentes

3. **Campos actualizados:**
   - Auth register: `nombres`, `apellidos` (plural)
   - Auth login: `identifier` (acepta email/username/RUT/DNI)

---

## 🚀 Acceso a Documentación

- **Swagger UI:** http://localhost:3000/docs o http://localhost:3000/api-docs
- **Swagger JSON:** http://localhost:3000/swagger.json
- **API Info:** http://localhost:3000/api/info
- **Health Check:** http://localhost:3000/health

---

**Última actualización:** 2 de Octubre, 2025  
**Versión:** 2.0.0  
**Swagger personalizado:** CSS moderno con temas y colores
