# Documentación de Endpoints - API Cuentas Claras

Este documento lista y describe los endpoints expuestos por el backend (`ccbackend/src/routes`). Para cada endpoint se indica método HTTP, ruta, parámetros principales, si requiere autenticación y notas importantes.

Nota general:
- La mayoría de rutas requieren autenticación mediante bearer token (middleware `authenticate`).
- Muchas operaciones administrativas requieren roles `admin` o `superadmin` (middleware `authorize`).
- Las rutas públicas (sin autenticación) son específicamente los webhooks y endpoints utilitarios como `/health` y `/version`.

Tabla de contenidos
- Auth
- Personas
- Comunidades
- Edificios
- Torres
- Unidades (tenencias, residentes)
- Membresías
- Proveedores
- Documentos de compra
- Gastos
- Categorías de gasto
- Centros de costo
- Emisiones (detalles, previsualización, generación de cargos)
- Cargos
- Pagos (aplicación, reversos)
- Conciliaciones
- Medidores (lecturas, consumos)
- Tarifas de consumo
- Amenidades (reservas)
- Multas
- Soporte (tickets, notificaciones, documentos, bitácora)
- Webhooks
- Utilidades

---

## Auth

- POST /auth/register
  - Crear usuario.
  - Body: { username, password, email?, persona_id? }
  - Respuesta: 201 { id, username, token }
  - Público.

- POST /auth/login
  - Autenticar y recibir JWT.
  - Body: { username, password }
  - Respuesta: 200 { token }
  - Público.

- POST /auth/refresh
  - Refresh del token.
  - Requiere: Authorization: Bearer <token>

- POST /auth/logout
  - Logout (stateless) — cliente debe desechar token.
  - Requiere autenticación.

- POST /auth/forgot-password
  - Inicia flujo de recuperación (envía token en demo).
  - Body: { email }
  - Público.

- POST /auth/reset-password
  - Reset de contraseña con token.
  - Body: { token, password }
  - Público.

- GET /auth/me
  - Obtener usuario actual.
  - Requiere autenticación.

---

## Personas

- GET /personas
  - Listar personas o buscar por query `?rut=`.
  - Requiere autenticación.

- POST /personas
  - Crear persona.
  - Body: { rut,dv,nombres,apellidos,email?,telefono?,direccion? }
  - Requiere rol `admin` o `superadmin`.

- GET /personas/:id
  - Obtener persona por id.
  - Requiere autenticación.

- PATCH /personas/:id
  - Actualizar parcialmente una persona.
  - Requiere autenticación; `allowSelfOrRoles` permite a la persona actualizarse o a `admin`/`superadmin`.

- DELETE /personas/:id
  - Eliminar persona (204).
  - Requiere `allowSelfOrRoles('id','admin','superadmin')`.

---

## Comunidades

- GET /comunidades
  - Listar comunidades (limit 200).
  - Requiere autenticación.

- POST /comunidades
  - Crear comunidad.
  - Body: { razon_social, rut, dv, giro?, direccion?, email_contacto?, telefono_contacto? }
  - Requiere `admin` o `superadmin`.

- GET /comunidades/:id
  - Obtener comunidad.
  - Requiere autenticación.

- PATCH /comunidades/:id
  - Actualizar comunidad.
  - Requiere `admin` o `superadmin`.

- DELETE /comunidades/:id
  - Eliminar comunidad.
  - Requiere `superadmin`.

---

## Edificios

- GET /edificios/comunidad/:comunidadId
  - Listar edificios de una comunidad.

- POST /edificios/comunidad/:comunidadId
  - Crear edificio.
  - Requiere `admin`/`superadmin`.

- GET /edificios/:id
- PATCH /edificios/:id (admin/superadmin)
- DELETE /edificios/:id (admin/superadmin)

---

## Torres

- GET /edificios/:edificioId/torres
  - Listar torres de un edificio.

- POST /edificios/:edificioId/torres
  - Crear torre.
  - Requiere `admin`/`superadmin`.

- GET /torres/:id
- PATCH /torres/:id (admin/superadmin)
- DELETE /torres/:id (admin/superadmin)

---

## Unidades

- GET /unidades/comunidad/:comunidadId
  - Listar unidades.

- POST /unidades/comunidad/:comunidadId
  - Crear unidad.
  - Body: { codigo, edificio_id xor torre_id, alicuota?, ... }
  - Requiere `admin`/`superadmin`.

- GET /unidades/:id
- PATCH /unidades/:id (admin/superadmin)
- DELETE /unidades/:id (admin/superadmin)

- GET /unidades/:id/tenencias
  - Listar tenencias de la unidad. Query `?activo=1` para solo vigentes.

- POST /unidades/:id/tenencias
  - Crear tenencia (persona vinculada a unidad).
  - Requiere `admin`/`superadmin`.

- GET /unidades/:id/residentes
  - Obtener residentes activos (propietario/arrendatario).

---

## Membresías

- GET /comunidades/:comunidadId/membresias
  - Listar membresías.

- POST /comunidades/:comunidadId/membresias
  - Crear membresía.
  - Requiere `admin`/`superadmin`.

- PATCH /membresias/:id (admin/superadmin)
- DELETE /membresias/:id (admin/superadmin)

---

## Proveedores

- GET /comunidades/:comunidadId/proveedores
  - Listar proveedores.

- POST /comunidades/:comunidadId/proveedores
  - Crear proveedor.
  - Requiere `admin`/`superadmin`.

- GET /proveedores/:id
- PATCH /proveedores/:id (admin/superadmin)
- DELETE /proveedores/:id (admin/superadmin)

---

## Documentos de compra

- GET /comunidades/:comunidadId/documentos-compra
  - Listar documentos de compra (paging: page, limit).

- POST /comunidades/:comunidadId/documentos-compra
  - Crear documento de compra.
  - Body: { proveedor_id, tipo_doc, folio, fecha_emision, neto?, iva?, exento?, total, glosa? }
  - Requiere `admin`/`superadmin`.

- GET /documentos-compra/:id
- PATCH /documentos-compra/:id (admin/superadmin)
- DELETE /documentos-compra/:id (admin/superadmin)

---

## Gastos

- GET /gastos/comunidad/:comunidadId
  - Listar gastos (page, limit).

- POST /comunidades/:comunidadId/gastos
  - Crear gasto.
  - Requiere `admin`/`superadmin`.

- GET /gastos/:id
- PATCH /gastos/:id (admin/superadmin)
- DELETE /gastos/:id (admin/superadmin)

---

## Categorías de gasto

- GET /comunidades/:comunidadId/categorias-gasto
- POST /comunidades/:comunidadId/categorias-gasto (admin/superadmin)
- GET /categoriasGasto/:id
- PATCH /categoriasGasto/:id (admin/superadmin)
- DELETE /categoriasGasto/:id (admin/superadmin)

Campos: { nombre, tipo (operacional|extraordinario|fondo_reserva|multas|consumo), cta_contable, activa }

---

## Centros de costo

- GET /comunidades/:comunidadId/centros-costo
- POST /comunidades/:comunidadId/centros-costo (admin/superadmin)
- PATCH /centrosCosto/:id (admin/superadmin)
- DELETE /centrosCosto/:id (admin/superadmin)

---

## Emisiones

- GET /emisiones/comunidad/:comunidadId
  - Listar emisiones (page, limit).

- POST /comunidades/:comunidadId/emisiones
  - Crear emision (periodo, fecha_vencimiento, observaciones).
  - Requiere `admin`/`superadmin`.

- GET /emisiones/:id
- PATCH /emisiones/:id (admin/superadmin)

- POST /emisiones/:id/detalles
  - Agregar detalle a una emisión: { categoria_id, monto, regla_prorrateo, gasto_id?, metadata_json? }.
  - Requiere `admin`/`superadmin`.

- GET /emisiones/:id/previsualizar-prorrateo
  - Previsualización de distribución entre unidades.
  - Nota: regla `consumo` requiere datos de medidores y no está implementada en preview.

- POST /emisiones/:id/generar-cargos
  - Genera cargos por unidad según detalles y reglas.
  - Requiere `admin`/`superadmin`.
  - Nota: no soporta prorrateo por consumo en la implementación actual.

---

## Cargos

- GET /cargos/comunidad/:comunidadId
  - Listar cargos con filtros: ?estado=&unidad=&periodo=&page=&limit=

- GET /cargos/:id
- GET /cargos/unidad/:id

- POST /cargos/:id/recalcular-interes (admin/superadmin) — endpoint stub
- POST /cargos/:id/notificar (admin/superadmin) — endpoint stub

---

## Pagos

- GET /pagos/comunidad/:comunidadId
  - Listar pagos (page, limit).

- POST /comunidades/:comunidadId/pagos
  - Registrar pago: { unidad_id?, persona_id?, fecha, monto, medio?, referencia? }

- GET /pagos/:id

- POST /pagos/:id/aplicar
  - Aplicar un pago a cargos. Body: { assignments: [{ cargo_unidad_id, monto }, ...] }
  - Requiere `admin`/`superadmin`.
  - Realiza transacción: crea `pago_aplicacion` y actualiza `cargo_unidad.saldo`.

- POST /pagos/:id/reversar (admin/superadmin) — stub: reversa pago (undo pendientes).

---

## Conciliaciones

- GET /conciliaciones/comunidad/:comunidadId
- POST /conciliaciones/comunidad/:comunidadId (admin/superadmin)
- PATCH /conciliaciones/:id (admin/superadmin) — actualizar `estado`

---

## Medidores

- GET /medidores/comunidad/:comunidadId
- POST /medidores/comunidad/:comunidadId (admin/superadmin)
- GET /medidores/:id
- PATCH /medidores/:id (admin/superadmin)
- DELETE /medidores/:id (admin/superadmin)

- GET /medidores/:id/lecturas
- POST /medidores/:id/lecturas (admin/superadmin)

- GET /medidores/:id/consumos  — stub: calcular consumos entre periodos (no implementado completamente)

---

## Tarifas de consumo

- GET /tarifas-consumo/comunidad/:comunidadId
- POST /tarifas-consumo/comunidad/:comunidadId (admin/superadmin)
- GET /tarifas-consumo/:id
- PATCH /tarifas-consumo/:id (admin/superadmin)
- DELETE /tarifas-consumo/:id (admin/superadmin)

---

## Amenidades

- GET /amenidades/comunidad/:comunidadId
- POST /amenidades/comunidad/:comunidadId (admin/superadmin)
- GET /amenidades/:id
- PATCH /amenidades/:id (admin/superadmin)
- DELETE /amenidades/:id (admin/superadmin)

- GET /amenidades/:id/reservas
- POST /amenidades/:id/reservas
  - Crear reserva: { unidad_id, persona_id, inicio, fin }

---

## Multas

- GET /multas/unidad/:unidadId
- POST /multas/unidad/:unidadId (admin/superadmin)
- GET /multas/:id
- PATCH /multas/:id (admin/superadmin)
- DELETE /multas/:id (admin/superadmin)

---

## Soporte

- GET /comunidades/:comunidadId/tickets
- POST /comunidades/:comunidadId/tickets
- GET /soporte/tickets/:id
- PATCH /soporte/tickets/:id (admin/superadmin)

- GET /comunidades/:comunidadId/notificaciones
- POST /comunidades/:comunidadId/notificaciones (admin/superadmin)

- GET /comunidades/:comunidadId/documentos
- POST /comunidades/:comunidadId/documentos (admin/superadmin)
- DELETE /soporte/documentos/:id (admin/superadmin)

- GET /comunidades/:comunidadId/bitacora
- POST /comunidades/:comunidadId/bitacora

- GET /comunidades/:comunidadId/parametros-cobranza
- PATCH /comunidades/:comunidadId/parametros-cobranza (admin/superadmin)

---

## Webhooks

- POST /webhooks/pagos/webpay
  - Webhook público para notificaciones Webpay.

- POST /webhooks/pagos/khipu
  - Webhook público para notificaciones Khipu.

Ambos insertan el payload en tabla `webhook_pago` para procesamiento posterior.

---

## Utilidades

- GET /health
  - Healthcheck público. Responde { status: 'ok' }.

- GET /version
  - Devuelve versión de la API.

- GET /util/uf?fecha=YYYY-MM-DD
  - Devuelve valor UF para fecha.

- GET /util/utm?fecha=YYYY-MM
  - Devuelve valor UTM para mes.

- GET /util/validar-rut?rut=XXXXXXXX-D
  - Valida RUT chileno y devuelve { valid, dv }.

---

## Notas y limitaciones actuales detectadas en el código

- Algunas rutas implementan sólo stubs (marcadas en las descripciones):
  - `cargos/:id/recalcular-interes` y `cargos/:id/notificar` son stubs.
  - `pagos/:id/reversar` y algunos cálculos de consumos son stubs.
  - Previsualización/prorrateo por `consumo` no está implementada (requiere lecturas medidor).

- La mayoría de endpoints siguen un patrón REST sencillo y retornan objetos o listas. Muchas rutas usan paginación por `page` y `limit` query params.

- Para obtener esquemas exactos de request/response revisa los JSDoc `@openapi` en la cabecera de cada archivo en `ccbackend/src/routes/` o usa `ccbackend/src/swagger.js` si expone OpenAPI en runtime.

---