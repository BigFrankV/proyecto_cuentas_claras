# Endpoints de la API

Este documento lista todos los endpoints expuestos por la API (método + ruta). Está extraído de los routers en `src/routes` y de los mount points en `src/index.js`.

Nota: algunos archivos contienen comentarios OpenAPI con rutas expresadas como `/comunidades/...`, pero aquí se listan las rutas reales según cómo se montan los routers en `index.js`.

## Rutas principales

- GET  /healthz — health check (simple)

## /auth

- POST  /auth/register
- POST  /auth/login
- POST  /auth/refresh
- POST  /auth/logout
- POST  /auth/forgot-password
- POST  /auth/reset-password
- GET   /auth/me

## /comunidades

- GET    /comunidades
- POST   /comunidades
- GET    /comunidades/:id
- PATCH  /comunidades/:id
- DELETE /comunidades/:id

## /edificios

- GET    /edificios/comunidad/:comunidadId
- POST   /edificios/comunidad/:comunidadId
- GET    /edificios/:id
- PATCH  /edificios/:id
- DELETE /edificios/:id

## /unidades

- GET    /unidades/comunidad/:comunidadId
- POST   /unidades/comunidad/:comunidadId
- GET    /unidades/:id
- PATCH  /unidades/:id
- DELETE /unidades/:id
- GET    /unidades/:id/tenencias
- POST   /unidades/:id/tenencias
- GET    /unidades/:id/residentes

## /personas

- GET    /personas
- POST   /personas
- GET    /personas/:id
- PATCH  /personas/:id
- DELETE /personas/:id

## /torres

- GET    /torres/edificio/:edificioId
- POST   /torres/edificio/:edificioId
- GET    /torres/:id
- PATCH  /torres/:id
- DELETE /torres/:id

## /membresias

- GET    /membresias/comunidad/:comunidadId
- POST   /membresias/comunidad/:comunidadId
- PATCH  /membresias/:id
- DELETE /membresias/:id

## /categorias-gasto

- GET    /categorias-gasto/comunidad/:comunidadId
- POST   /categorias-gasto/comunidad/:comunidadId
- GET    /categorias-gasto/:id
- PATCH  /categorias-gasto/:id
- DELETE /categorias-gasto/:id

## /centros-costo

- GET    /centros-costo/comunidad/:comunidadId
- POST   /centros-costo/comunidad/:comunidadId
- PATCH  /centros-costo/:id
- DELETE /centros-costo/:id

## /proveedores

- GET    /proveedores/comunidad/:comunidadId
- POST   /proveedores/comunidad/:comunidadId
- GET    /proveedores/:id
- PATCH  /proveedores/:id
- DELETE /proveedores/:id

## /documentos-compra

- GET    /documentos-compra/comunidad/:comunidadId
- POST   /documentos-compra/comunidad/:comunidadId
- GET    /documentos-compra/:id
- PATCH  /documentos-compra/:id
- DELETE /documentos-compra/:id

## /gastos

- GET    /gastos/comunidad/:comunidadId
- POST   /gastos/comunidad/:comunidadId
- GET    /gastos/:id
- PATCH  /gastos/:id
- DELETE /gastos/:id

## /emisiones

- GET    /emisiones/comunidad/:comunidadId
- POST   /emisiones/comunidad/:comunidadId
- GET    /emisiones/:id
- PATCH  /emisiones/:id
- POST   /emisiones/:id/detalles
- GET    /emisiones/:id/previsualizar-prorrateo
- POST   /emisiones/:id/generar-cargos

## /cargos

- GET    /cargos/comunidad/:comunidadId
- GET    /cargos/:id
- GET    /cargos/unidad/:id
- POST   /cargos/:id/recalcular-interes
- POST   /cargos/:id/notificar

## /pagos

- GET    /pagos/comunidad/:comunidadId
- POST   /pagos/comunidad/:comunidadId
- GET    /pagos/:id
- POST   /pagos/:id/aplicar
- POST   /pagos/:id/reversar

## /medidores

- GET    /medidores/comunidad/:comunidadId
- POST   /medidores/comunidad/:comunidadId
- GET    /medidores/:id
- PATCH  /medidores/:id
- DELETE /medidores/:id
- GET    /medidores/:id/lecturas
- POST   /medidores/:id/lecturas
- GET    /medidores/:id/consumos

## /tarifas-consumo

- GET    /tarifas-consumo/comunidad/:comunidadId
- POST   /tarifas-consumo/comunidad/:comunidadId
- GET    /tarifas-consumo/:id
- PATCH  /tarifas-consumo/:id
- DELETE /tarifas-consumo/:id

## /multas

- GET    /multas/unidad/:unidadId
- POST   /multas/unidad/:unidadId
- GET    /multas/:id
- PATCH  /multas/:id
- DELETE /multas/:id

## /conciliaciones

- GET    /conciliaciones/comunidad/:comunidadId
- POST   /conciliaciones/comunidad/:comunidadId
- PATCH  /conciliaciones/:id

## /webhooks

- POST   /webhooks/pagos/webpay
- POST   /webhooks/pagos/khipu

## /amenidades

- GET    /amenidades/comunidad/:comunidadId
- POST   /amenidades/comunidad/:comunidadId
- GET    /amenidades/:id
- PATCH  /amenidades/:id
- DELETE /amenidades/:id
- GET    /amenidades/:id/reservas
- POST   /amenidades/:id/reservas

## Soporte (mount en `/`)

- GET    /comunidad/:comunidadId/tickets
- POST   /comunidad/:comunidadId/tickets
- GET    /tickets/:id
- PATCH  /tickets/:id
- GET    /comunidad/:comunidadId/notificaciones
- POST   /comunidad/:comunidadId/notificaciones
- GET    /comunidad/:comunidadId/documentos
- POST   /comunidad/:comunidadId/documentos
- DELETE /documentos/:id
- GET    /comunidad/:comunidadId/bitacora
- POST   /comunidad/:comunidadId/bitacora
- GET    /comunidad/:comunidadId/parametros-cobranza
- PATCH  /comunidad/:comunidadId/parametros-cobranza

## /util

- GET    /util/health
- GET    /util/version
- GET    /util/uf?fecha=YYYY-MM-DD
- GET    /util/utm?fecha=YYYY-MM
- GET    /util/validar-rut?rut=XXXXXXXX-D

---