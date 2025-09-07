# Cuentas Claras 2.0 — Diseño técnico de API y Modelo de Datos (Chile)

---

## 1) Alcance y contexto chileno

Este documento propone un diseño de API y modelo de datos para administrar comunidades (condominios y edificios) en Chile, considerando:
- Ley N° 21.442 de Copropiedad Inmobiliaria (coeficientes de copropiedad, comité de administración, gastos comunes ordinarios/extraordinarios y fondos).
- Identificación mediante RUT (con dígito verificador), domicilios y contactos.
- Gasto común con prorrateo por coeficiente y/o por consumo (agua fría/caliente, gas, electricidad), intereses por mora, multas, descuentos, recargos.
- Fondos: fondo de reserva, fondo extraordinario, caja chica.
- Proveedores (RUT), documentos tributarios (facturas/boletas), IVA (19%), integración futura con SII.
- Pagos: transferencias, Webpay/Transbank, Khipu, Servipag; conciliación y webhooks.
- Operación: bitácora de conserjería, reservas de amenities, tickets de mantención, comunicaciones/ circulares, repositorio documental.

---

## 2) Requisitos y principios de diseño

- Multi-tenant por comunidad (aislamiento lógico por `comunidad_id`).
- OLTP normalizado (3FN) para coherencia y consistencia, y un esquema analítico separado para reportería (estrella).
- Control de acceso por roles y membresías a nivel de comunidad y unidad.
- Auditabilidad: created_at/updated_at, soft delete opcional y bitácora de eventos.
- Configurabilidad: parámetros de cobranza (intereses por mora, días de gracia), política de redondeo, reglas de prorrateo.
- Interoperabilidad: IDs públicos inmutables, webhooks, paginación, filtros, ordenamiento y expansión selectiva de recursos.

---

## 3) Modelo de datos (MySQL, OLTP 3FN)

Convenciones:
- Tipos: `BIGINT` como PK, `VARCHAR(…)`, `DECIMAL(12,2)`, `DECIMAL(8,6)` para coeficientes, `DATE`, `DATETIME`, `BOOLEAN` (TINYINT(1)), `JSON` para metadatos.
- Claves: `id` autoincrement, FK con `ON DELETE RESTRICT` salvo relaciones detalle `ON DELETE CASCADE`.
- Todas las tablas de negocio incluyen: `comunidad_id` (FK) salvo catálogos globales (UF/UTM, etc.), y trazabilidad (`created_at`, `updated_at`, `created_by`, `updated_by`).

### 3.1 Núcleo de comunidades y unidades

1) comunidad
- Propósito: Tenancy y configuración general.
- Campos principales: `id`, `razon_social`, `rut`, `giro`, `direccion`, `email_contacto`, `telefono_contacto`, `politica_mora_json`, `moneda` (CLP), `tz` (America/Santiago), timestamps.
- Índices: `rut` único; búsqueda por `razon_social`.

2) edificio
- FK: `comunidad_id`.
- Campos: `id`, `comunidad_id`, `nombre`, `direccion`, `codigo`.

3) torre (opcional si el edificio se subdivide)
- FK: `edificio_id`.
- Campos: `id`, `edificio_id`, `nombre`, `codigo`.

4) unidad
- FK: `edificio_id` o `torre_id` (una de ambas, con restricción), `comunidad_id`.
- Campos: `id`, `comunidad_id`, `edificio_id` (nullable), `torre_id` (nullable), `codigo` (p.e. A-101), `alicuota` DECIMAL(8,6) (coeficiente de copropiedad), `m2_utiles` DECIMAL(10,2), `m2_terrazas` DECIMAL(10,2), `nro_bodega`, `nro_estacionamiento`, `activa` BOOLEAN.
- Índices: únicos por (`comunidad_id`, `codigo`).

5) persona
- Campos: `id`, `rut` (único), `dv`, `nombres`, `apellidos`, `email`, `telefono`, `direccion`.

6) usuario
- Autenticación del sistema (si se gestiona localmente): `id`, `username` (único), `hash_password`, `email`, `activo` BOOLEAN.
- Relación con persona opcional: `persona_id`.

7) membresia_comunidad
- Relación persona–comunidad–rol: `id`, `comunidad_id`, `persona_id`, `rol` ENUM('admin','comite','conserje','contador','residente','propietario'), `desde`, `hasta` (nulable), `activo`.
- Índice único por (`comunidad_id`,`persona_id`,`rol`,`desde`).

8) tenencia_unidad
- Propiedad/arrendamiento en el tiempo.
- Campos: `id`, `comunidad_id`, `unidad_id`, `persona_id`, `tipo` ENUM('propietario','arrendatario'), `desde`, `hasta` (nulable), `porcentaje` DECIMAL(5,2) para copropiedad compartida.
- Reglas: al menos un propietario activo por unidad; múltiples arrendatarios posibles.

### 3.2 Catálogos y configuración

9) categoria_gasto
- `id`, `comunidad_id`, `nombre`, `tipo` ENUM('operacional','extraordinario','fondo_reserva','multas','consumo'), `cta_contable` (opcional), `activa`.

10) centro_costo (opcional)
- `id`, `comunidad_id`, `nombre`, `codigo`.

11) proveedor
- `id`, `comunidad_id`, `rut`, `dv`, `razon_social`, `giro`, `email`, `telefono`, `direccion`.

12) parametros_cobranza
- `id`, `comunidad_id`, `dias_gracia` INT, `tasa_mora_mensual` DECIMAL(5,2), `mora_calculo` ENUM('diaria','mensual'), `redondeo` ENUM('arriba','normal','abajo'), `interes_max_mensual` DECIMAL(5,2), `aplica_interes_sobre` ENUM('saldo','capital').

### 3.3 Gastos, emisiones y cargos

13) documento_compra
- Registro de facturas/boletas: `id`, `comunidad_id`, `proveedor_id`, `tipo_doc` ENUM('factura','boleta','nota_credito'), `folio`, `fecha_emision`, `neto` DECIMAL(12,2), `iva` DECIMAL(12,2), `exento` DECIMAL(12,2), `total` DECIMAL(12,2), `glosa`.

14) gasto
- Gasto registrado para prorrateo: `id`, `comunidad_id`, `categoria_id`, `centro_costo_id` (nullable), `documento_compra_id` (nullable), `fecha`, `monto` DECIMAL(12,2), `glosa`, `extraordinario` BOOLEAN.

15) emision_gasto_comun
- Corte mensual (o periodo): `id`, `comunidad_id`, `periodo` (YYYY-MM), `fecha_vencimiento`, `estado` ENUM('borrador','emitido','cerrado','anulado'), `observaciones`.
- Único por (`comunidad_id`,`periodo`) con estados no anulados.

16) emision_gasto_detalle
- Items a prorratear en una emisión: `id`, `emision_id`, `gasto_id` (nullable), `categoria_id`, `monto` DECIMAL(12,2), `regla_prorrateo` ENUM('coeficiente','partes_iguales','consumo','fijo_por_unidad'), `metadata_json`.

17) cargo_unidad
- Resultado del prorrateo por unidad: `id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total` DECIMAL(12,2), `saldo` DECIMAL(12,2), `estado` ENUM('pendiente','pagado','vencido','parcial'), `interes_acumulado` DECIMAL(12,2).
- Índices por `unidad_id`, `estado`.

18) cargo_unidad_detalle
- Detalle de conceptos: `id`, `cargo_unidad_id`, `categoria_id`, `glosa`, `monto` DECIMAL(12,2), `origen` ENUM('gasto','multa','consumo','ajuste'), `origen_id` (nullable), `iva_incluido` BOOLEAN.

### 3.4 Consumos (medidores)

19) medidor
- `id`, `comunidad_id`, `unidad_id` (nullable si es general), `tipo` ENUM('agua','gas','electricidad'), `codigo`, `es_compartido` BOOLEAN.

20) lectura_medidor
- `id`, `medidor_id`, `fecha`, `lectura` DECIMAL(12,3), `periodo` (YYYY-MM), único por (`medidor_id`,`periodo`).

21) tarifa_consumo
- `id`, `comunidad_id`, `tipo` ENUM('agua','gas','electricidad'), `periodo_desde`, `periodo_hasta` (nullable), `precio_por_unidad` DECIMAL(12,6), `cargo_fijo` DECIMAL(12,2).

19b) medidor_unidad (consumos compartidos)
- Mapea un medidor a múltiples unidades con porcentaje de reparto: `id`, `medidor_id`, `unidad_id`, `porcentaje` DECIMAL(5,2) con CHECK 0–100, único (`medidor_id`,`unidad_id`).

### 3.5 Multas e intereses

22) multa
- `id`, `comunidad_id`, `unidad_id`, `persona_id` (opcional), `motivo`, `descripcion`, `monto` DECIMAL(12,2), `estado` ENUM('pendiente','pagada','anulada'), `fecha`, `fecha_pago` (nullable).

23) configuracion_interes
- `id`, `comunidad_id`, `aplica_desde` DATE, `tasa_mensual` DECIMAL(5,2), `metodo` ENUM('simple','compuesto'), `tope_mensual` DECIMAL(5,2).

### 3.6 Cobranzas y pagos

24) pago
- `id`, `comunidad_id`, `unidad_id` (opcional), `persona_id` (opcional), `fecha`, `monto` DECIMAL(12,2), `medio` ENUM('transferencia','webpay','khipu','servipag','efectivo'), `referencia`, `estado` ENUM('pendiente','aplicado','reversado'), `comprobante_num` (opcional).

25) pago_aplicacion
- Aplicación del pago a cargos: `id`, `pago_id`, `cargo_unidad_id`, `monto` DECIMAL(12,2), `prioridad` INT.

26) conciliacion_bancaria (opcional)
- `id`, `comunidad_id`, `fecha_mov`, `monto`, `glosa`, `referencia`, `estado` ENUM('pendiente','conciliado','descartado'), `pago_id` (nullable), `extracto_id` (nullable).

27) webhook_pago
- `id`, `comunidad_id`, `proveedor` ENUM('webpay','khipu','otro'), `payload_json`, `fecha_recepcion`, `procesado` BOOLEAN, `pago_id` (nullable).

### 3.7 Operación y soporte

28) amenidad
- `id`, `comunidad_id`, `nombre`, `reglas`, `capacidad`, `requiere_aprobacion` BOOLEAN, `tarifa` DECIMAL(12,2) (opcional).

29) reserva_amenidad
- `id`, `comunidad_id`, `amenidad_id`, `unidad_id`, `persona_id`, `inicio` DATETIME, `fin` DATETIME, `estado` ENUM('solicitada','aprobada','rechazada','cancelada','cumplida').

30) ticket
- Incidencias/mantención: `id`, `comunidad_id`, `unidad_id` (nullable), `categoria`, `titulo`, `descripcion`, `estado` ENUM('abierto','en_progreso','resuelto','cerrado'), `prioridad` ENUM('baja','media','alta'), `asignado_a` (usuario/persona), `attachments_json`.

31) notificacion
- `id`, `comunidad_id`, `persona_id` (nullable), `tipo`, `titulo`, `mensaje`, `leida` BOOLEAN, `objeto_tipo`, `objeto_id`, `fecha_creacion`.

32) documento
- Repositorio: `id`, `comunidad_id`, `tipo` ENUM('circular','acta','reglamento','boletin','otro'), `titulo`, `url`, `periodo` (opcional), `visibilidad` ENUM('publico','privado')

33) bitacora_conserjeria
- `id`, `comunidad_id`, `fecha_hora`, `usuario_id`, `evento`, `detalle`.

### 3.8 Tablas de soporte nacionales

34) uf_valor, utm_valor
- `fecha`, `valor` DECIMAL(12,2). Índice por `fecha`.

### 3.9 Módulos financieros y cross-cutting (PRO)

- Fondos: `fondo` (reserva/extraordinario/caja) y `movimiento_fondo` (ingresos/egresos/ajustes, conciliables).
- Contabilidad (doble partida): `catalogo_cuenta` (plan de cuentas por comunidad), `asiento`, `asiento_detalle`.
- Presupuesto: `presupuesto_periodo` (YYYY-MM) y `presupuesto_detalle` por categoría.
- Archivos/adjuntos: `archivo` polimórfico (`objeto_tipo`, `objeto_id`, `url`, `mime`, `size_bytes`).
- Auditoría: `audit_event` (quién, cuándo, qué; before/after JSON) para cambios sensibles.
- Idempotencia: `idempotency_key` (scope, key_hash) para evitar reprocesos.
- Outbox: `outbox_event` para integraciones/webhooks con reintentos y estado.

---

## 4) API REST — Recursos y Endpoints

Convenciones: JSON, JWT (Bearer), paginación `page/limit`, filtros por query, orden `sort=campo,-otro`, inclusión `include=`.

### 4.1 Autenticación y cuentas
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET  /auth/me
- POST /auth/forgot-password
- POST /auth/reset-password

### 4.2 Comunidades, edificios y unidades
- GET  /comunidades
- POST /comunidades
- GET  /comunidades/{id}
- PATCH/PUT /comunidades/{id}
- DELETE /comunidades/{id}
- GET  /comunidades/{id}/edificios
- POST /comunidades/{id}/edificios
- GET  /edificios/{id}
- PATCH/PUT /edificios/{id}
- DELETE /edificios/{id}
- GET  /edificios/{id}/torres
- POST /edificios/{id}/torres
- GET  /torres/{id}
- PATCH/PUT /torres/{id}
- DELETE /torres/{id}
- GET  /comunidades/{id}/unidades
- POST /comunidades/{id}/unidades
- GET  /unidades/{id}
- PATCH/PUT /unidades/{id}
- DELETE /unidades/{id}
- GET  /unidades/{id}/tenencias
- POST /unidades/{id}/tenencias

### 4.3 Personas, usuarios y membresías
- GET  /personas?rut=…
- POST /personas
- GET  /personas/{id}
- PATCH/PUT /personas/{id}
- DELETE /personas/{id}
- GET  /comunidades/{id}/membresias
- POST /comunidades/{id}/membresias
- PATCH/PUT /membresias/{id}
- DELETE /membresias/{id}
- GET  /unidades/{id}/residentes (vista unificada propietarios/arrendatarios activos)

### 4.4 Catálogos y parámetros
- GET/POST /comunidades/{id}/categorias-gasto
- GET/PATCH/DELETE /categorias-gasto/{id}
- GET/POST /comunidades/{id}/centros-costo
- GET/PATCH/DELETE /centros-costo/{id}
- GET/PATCH /comunidades/{id}/parametros-cobranza

### 4.5 Proveedores y documentos de compra
- GET/POST /comunidades/{id}/proveedores
- GET/PATCH/DELETE /proveedores/{id}
- GET/POST /comunidades/{id}/documentos-compra
- GET/PATCH/DELETE /documentos-compra/{id}

### 4.6 Gastos y emisiones
- GET/POST /comunidades/{id}/gastos
- GET/PATCH/DELETE /gastos/{id}
- GET/POST /comunidades/{id}/emisiones
- GET  /emisiones/{id}
- PATCH /emisiones/{id} (emitir/cerrar/anular)
- POST /emisiones/{id}/detalles (agrega item prorrateable)
- GET  /emisiones/{id}/previsualizar-prorrateo
- POST /emisiones/{id}/generar-cargos

### 4.7 Cargos por unidad y cobranzas
- GET  /comunidades/{id}/cargos?estado=pending&unidad=…&periodo=…
- GET  /cargos/{id}
- GET  /unidades/{id}/cargos
- POST /cargos/{id}/recalcular-interes
- POST /cargos/{id}/notificar

### 4.8 Multas e intereses
- GET/POST /unidades/{id}/multas
- GET/PATCH/DELETE /multas/{id}
- POST /comunidades/{id}/configuracion-interes (o PATCH)

### 4.9 Medidores y consumos
- GET/POST /comunidades/{id}/medidores
- GET/PATCH/DELETE /medidores/{id}
- GET/POST /medidores/{id}/lecturas
- GET  /medidores/{id}/consumos?desde=YYYY-MM&hasta=YYYY-MM
- GET/POST /comunidades/{id}/tarifas-consumo
- GET/PATCH/DELETE /tarifas-consumo/{id}

### 4.10 Pagos, conciliación y webhooks
- GET/POST /comunidades/{id}/pagos
- GET  /pagos/{id}
- POST /pagos/{id}/aplicar (payload con asignaciones a cargos)
- POST /pagos/{id}/reversar
- GET/POST /comunidades/{id}/conciliaciones
- PATCH /conciliaciones/{id}
- POST /webhooks/pagos/webpay
- POST /webhooks/pagos/khipu

### 4.11 Operación
- GET/POST /comunidades/{id}/amenidades
- GET/PATCH/DELETE /amenidades/{id}
- GET/POST /amenidades/{id}/reservas
- PATCH/DELETE /reservas/{id}
- GET/POST /comunidades/{id}/tickets
- GET/PATCH/DELETE /tickets/{id}
- GET/POST /comunidades/{id}/notificaciones
- PATCH/DELETE /notificaciones/{id}
- GET/POST /comunidades/{id}/documentos
- DELETE /documentos/{id}
- GET/POST /comunidades/{id}/bitacora

### 4.12 Utilidades Chile
- GET  /util/uf?fecha=YYYY-MM-DD
- GET  /util/utm?fecha=YYYY-MM
- GET  /util/validar-rut?rut=XXXXXXXX-D

### 4.13 Fondos
- GET/POST /comunidades/{id}/fondos
- GET/PATCH/DELETE /fondos/{id}
- GET/POST /fondos/{id}/movimientos

### 4.14 Contabilidad (doble partida)
- GET/POST /comunidades/{id}/cuentas
- GET/PATCH/DELETE /cuentas/{id}
- GET/POST /comunidades/{id}/asientos
- GET  /asientos/{id}

### 4.15 Presupuesto
- GET/POST /comunidades/{id}/presupuestos
- GET/PATCH /presupuestos/{id}
- GET/POST /presupuestos/{id}/detalles

### 4.16 Archivos y auditoría
- POST /archivos (multipart)
- GET  /archivos/{id}
- DELETE /archivos/{id}
- GET  /audit?entidad=...&entidad_id=...

### 4.17 Salud y observabilidad
- GET  /healthz
- GET  /readyz
- GET  /metrics

---

## 5) Seguridad, permisos y auditoría
- Roles por membresía de comunidad: admin, comité, conserje, contador, propietario, residente.
- Regla general: acceso restringido por `comunidad_id`; residentes ven solo sus unidades/cargos/pagos.
- Auditoría: cabeceras `X-Request-Id`, tabla de bitácora, retención de eventos, soft delete con `deleted_at` opcional.
- Webhooks firmados (HMAC o mTLS) + validación de repetición con `Idempotency-Key`.
- Rate limiting por IP/usuario/endpoint; CORS restrictivo; headers de seguridad (Helmet).
- Gestión de secretos fuera del repo (Vault/Secrets Manager); rotación de tokens (refresh) y 2FA opcional para roles sensibles.

---

## 6) Ejemplos mínimos de payload

Crear multa
```json
{
  "unidad_id": 123,
  "persona_id": 456,
  "motivo": "Ruidos molestos",
  "descripcion": "Incumplimiento reglamento interno",
  "monto": 50000
}
```

Aplicar pago a cargos
```json
{
  "fecha": "2025-08-30",
  "monto": 120000,
  "medio": "webpay",
  "referencia": "TBK-12345",
  "aplicaciones": [
    { "cargo_id": 987, "monto": 80000 },
    { "cargo_id": 988, "monto": 40000 }
  ]
}
```

---

## 7) Normalización y reglas clave (3FN)
- Entidades separadas por dominios (personas vs. usuarios; gastos vs. documentos).
- Relaciones históricas con intervalos [desde, hasta] (tenencias, membresías, tarifas) para trazabilidad temporal.
- Evitar duplicidad: categorías parametrizadas, coeficientes almacenados en `unidad.alicuota` y usados en prorrateo.
- Integridad: restricciones únicas por comunidad, FKs con cascadas prudentes, checks (donde aplique) y validación DV de RUT a nivel de aplicación.

---

## 8) Recomendaciones de reportería (futuro)

### 8.1 Capa analítica (Data Warehouse)
- Modelo estrella con hechos y dimensiones:
  - Hechos: `fact_cargos_unidad`, `fact_pagos`, `fact_multas`, `fact_consumos`, `fact_gastos`.
  - Dimensiones: `dim_fecha`, `dim_unidad`, `dim_persona`, `dim_comunidad`, `dim_categoria`, `dim_proveedor`, `dim_medio_pago`.
- Cargas ETL incrementales (daily/hourly) desde OLTP; CDC si es posible.
- Manejo de SCD Tipo 2 en `dim_unidad` y `dim_persona` (cambios de atributos relevantes).

### 8.2 Materializaciones y vistas
- Vistas agregadas por periodo/unidad/comunidad para saldos, morosidad, rotación de gastos, aging de deuda, cumplimiento de pagos.
- Materialized views o tablas resumen mensuales para acelerar dashboard.

### 8.3 Herramientas BI
- Compatibilidad con Power BI / Metabase / Superset.
- Exponer endpoint `/reportes/export` (CSV/Parquet) con límites y jobs asíncronos.

### 8.4 Métricas clave sugeridas
- Morosidad por comunidad y por tramo (0-30, 31-60, 61-90, >90 días).
- Recuperación de deuda (cobranza) mensual y acumulada.
- Composición del gasto: operacional vs extraordinario vs consumo.
- Uso de amenities (ocupación, peak times), SLA de tickets.

---

## 9) Notas de implementación (API Node.js)

### 9.1 Stack sugerido
- Node.js + TypeScript
- Framework: NestJS o Express.js
- ORM/ODM: TypeORM o Sequelize (driver: mysql2)
- Cache/colas: Redis (BullMQ para jobs)
- Documentación: OpenAPI 3.1/Swagger
- Contenedores: Docker (Dockerfile, docker-compose)
- Despliegue: a elección (Vercel, Render, ECS, etc.)

Buenas prácticas base
- Migraciones y seeds versionadas.
- Validación de RUT + DV en capa de dominio.
- Idempotencia en webhooks (claves de idempotencia y deduplicación en Redis) y clave persistida en BD (`idempotency_key`).
- Patrón Outbox para integraciones/webhooks con reintentos backoff.
- Tareas programadas para cierres mensuales (cron).

### 9.2 Tecnologías y utilidades (referencia consolidada)

Principales
- Node.js (v18.x o superior)
- Express.js o NestJS
- Sequelize o TypeORM
- mysql2
- Redis
- Swagger (swagger-jsdoc, swagger-ui-express, swagger-autogen)
- Docker (Dockerfile, docker-compose.yml)
- Vercel (vercel.json) si aplica

Seguridad y utilidades
- bcrypt
- cors
- helmet
- dotenv
- jsonwebtoken
- multer (subida de archivos)
- nodemailer (correo)
- morgan (HTTP logging)
- winston (logging estructurado)

Validación
- express-validator (Express)
- joi o zod (esquemas compartidos)

Desarrollo y calidad de código
- ESLint (con reglas para TS/Node)
- Prettier (formato consistente)
- Husky (ganchos de git)
- lint-staged (lint/format en staged files)
- Nodemon (reload en desarrollo)
- Babel (si necesitas compatibilidad específica: @babel/cli, @babel/core, @babel/node, @babel/preset-env)

Pruebas
- Jest (unitarias y de integración)
- Supertest (pruebas HTTP)
- Pruebas de contrato con OpenAPI (ej. schemathesis o dredd) [opcional]

Scripts y automatización
- sequelize-cli o typeorm migration:generate/run (migraciones y seeders)
- Scripts batch (.bat) para Windows cuando aplique

Otros
- Postman/Insomnia (colecciones en /postman)

### 9.3 CI/CD y comprobaciones
- GitHub Actions (o GitLab CI) con jobs para:
  - Lint + Typecheck (ESLint, tsc --noEmit)
  - Pruebas (Jest + cobertura)
  - Validación OpenAPI (breaking changes)
  - Seguridad: npm audit, Snyk (dependencias), CodeQL (análisis estático)
  - Docker build & push; escaneo de imagen (Trivy)
- SonarCloud/SonarQube para calidad (coverage, code smells, duplicaciones)
- Pre-commit: Husky + lint-staged (eslint --fix, prettier --write, pruebas rápidas opcionales)

---

## 10) Anexo — Índices sugeridos
- Unicos: (`comunidad_id`,`codigo`) en `unidad`, (`comunidad_id`,`periodo`) en `emision_gasto_comun`.
- Búsqueda: `cargo_unidad(estado, unidad_id)`, `pago(comunidad_id, fecha)`, `multa(comunidad_id, estado)`.
- FK habituales con ON DELETE RESTRICT; CASCADE en detalles (`*_detalle`).

---

## 11) Observabilidad y SRE (PRO)
- Logs JSON estructurados con `request_id`, `user_id`, `comunidad_id`, latencias y resultado.
- Métricas Prometheus: HTTP (p95/p99), DB (pool y lentas), colas/jobs, webhooks/outbox, memoria/CPU.
- Trazas distribuidas (OpenTelemetry) y correlación por `X-Request-Id`.
- Healthchecks: `healthz` (liveness) y `readyz` (dependencias: DB, Redis, colas, migraciones up-to-date).

## 12) Pruebas y calidad (CI/CD)
- Unitarias, integración (DB real/Testcontainers), contrato (OpenAPI), e2e.
- Umbral de cobertura ≥ 80% en módulos críticos.
- Pipeline: lint, typecheck, test, cobertura, validación OpenAPI, npm audit/Snyk, CodeQL, build Docker + Trivy.
- Pre-commit: Husky + lint-staged.

## 13) Variables de configuración sugeridas
- DB: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS.
- Cache/colas: REDIS_URL.
- Auth: JWT_SECRET, JWT_EXP, REFRESH_EXP, ENABLE_2FA.
- Mail: SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM.
- Chile: UF_SOURCE_URL, UTM_SOURCE_URL.
- Seguridad: CORS_ORIGINS, RATE_LIMIT_*.

## 14) Referencia al blueprint PRO
Para una versión extendida y completamente desarrollada de estas mejoras, ver `cuentas-claras-pro.md` (incluye DDL delta, módulos financieros y patrones de confiabilidad detallados).
