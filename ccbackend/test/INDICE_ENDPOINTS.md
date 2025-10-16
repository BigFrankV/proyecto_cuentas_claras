# 📋 Índice Completo de Endpoints Testeados

Este documento lista todos los 73 endpoints organizados por módulo.

---

## 🏢 MÓDULO 1: COMUNIDADES (3 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/comunidades` | GET | Listado de comunidades |
| `/comunidades/:id` | GET | Detalle de comunidad |
| `/comunidades/:id/estadisticas` | GET | Estadísticas de comunidad |

---

## 🏗️ MÓDULO 2: EDIFICIOS (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/edificios/:id` | GET | Detalle de edificio |

---

## 🏘️ MÓDULO 3: UNIDADES (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/unidades/:id` | GET | Detalle de unidad |

---

## 🏢 MÓDULO 4: TORRES (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/torres/:id` | GET | Detalle de torre |

---

## 👤 MÓDULO 5: PERSONAS (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/personas/:id` | GET | Detalle de persona |

---

## 🎯 MÓDULO 6: AMENIDADES (3 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/amenidades` | GET | Listado de amenidades |
| `/amenidades/:id` | GET | Detalle de amenidad |
| `/amenidades/estadisticas/generales` | GET | Estadísticas generales |

---

## 📊 MÓDULO 7: CATEGORÍAS DE GASTO (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/categorias-gasto/comunidad/:comunidadId` | GET | Categorías por comunidad |
| `/categorias-gasto/:id` | GET | Detalle de categoría |

---

## 💼 MÓDULO 8: CENTROS DE COSTO (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/centros-costo/comunidad/:comunidadId` | GET | Centros por comunidad |
| `/centros-costo/:id` | GET | Detalle de centro |

---

## 💸 MÓDULO 9: GASTOS (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gastos/:id` | GET | Detalle de gasto |

---

## 📋 MÓDULO 10: EMISIONES (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/emisiones/:id` | GET | Detalle de emisión |

---

## 🧾 MÓDULO 11: CARGOS (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/cargos/comunidad/:comunidadId` | GET | Cargos por comunidad |
| `/cargos/:id` | GET | Detalle de cargo |

---

## 💳 MÓDULO 12: PAGOS (10 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/pagos/comunidad/:comunidadId` | GET | Pagos por comunidad |
| `/pagos/:id` | GET | Detalle de pago |
| `/pagos/comunidad/:comunidadId/estadisticas` | GET | Estadísticas generales |
| `/pagos/comunidad/:comunidadId/estadisticas/estado` | GET | Estadísticas por estado |
| `/pagos/comunidad/:comunidadId/estadisticas/metodo` | GET | Estadísticas por método |
| `/pagos/comunidad/:comunidadId/estadisticas/periodo` | GET | Estadísticas por período |
| `/pagos/comunidad/:comunidadId/pendientes` | GET | Pagos pendientes |
| `/pagos/:id/aplicaciones` | GET | Aplicaciones de pago |
| `/pagos/unidad/:unidadId/historial` | GET | Historial de pagos |
| `/pagos/comunidad/:comunidadId/por-residente` | GET | Pagos por residente |

---

## 🏪 MÓDULO 13: PROVEEDORES (5 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/proveedores/comunidad/:comunidadId` | GET | Proveedores por comunidad |
| `/proveedores/:id` | GET | Detalle de proveedor |
| `/proveedores/:id/historial-gastos` | GET | Historial de gastos |
| `/proveedores/comunidad/:comunidadId/top-gastos` | GET | Top proveedores por gasto |
| `/proveedores/comunidad/:comunidadId/dashboard` | GET | Dashboard de proveedores |

---

## 💧 MÓDULO 14: TARIFAS DE CONSUMO (4 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/tarifas-consumo/comunidad/:comunidadId` | GET | Tarifas por comunidad |
| `/tarifas-consumo/comunidad/:comunidadId/por-tipo/:tipo` | GET | Tarifas por tipo |
| `/tarifas-consumo/comunidad/:comunidadId/vigentes` | GET | Tarifas vigentes |
| `/tarifas-consumo/comunidad/:comunidadId/estadisticas-por-servicio` | GET | Estadísticas por servicio |

---

## 🎫 MÓDULO 15: TICKETS (5 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/tickets/comunidad/:comunidadId` | GET | Tickets por comunidad |
| `/tickets/:id` | GET | Detalle de ticket |
| `/tickets/comunidad/:comunidadId/por-estado/:estado` | GET | Tickets por estado |
| `/tickets/comunidad/:comunidadId/urgentes` | GET | Tickets urgentes |
| `/tickets/comunidad/:comunidadId/estadisticas-estado` | GET | Estadísticas por estado |

---

## 📈 MÓDULO 16: DASHBOARD (4 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/dashboard/comunidad/:comunidadId/kpi-saldo-total` | GET | KPI saldo total |
| `/dashboard/comunidad/:comunidadId/kpi-ingresos-mes` | GET | KPI ingresos del mes |
| `/dashboard/comunidad/:comunidadId/grafico-emisiones` | GET | Gráfico de emisiones |
| `/dashboard/comunidad/:comunidadId/resumen-completo` | GET | Resumen completo |

---

## 📊 MÓDULO 17: REPORTES (5 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/reportes/comunidad/:comunidadId/resumen-financiero` | GET | Resumen financiero |
| `/reportes/comunidad/:comunidadId/kpis-financieros` | GET | KPIs financieros |
| `/reportes/comunidad/:comunidadId/morosidad-unidades` | GET | Morosidad por unidades |
| `/reportes/comunidad/:comunidadId/gastos-por-categoria` | GET | Gastos por categoría |
| `/reportes/comunidad/:comunidadId/reporte-completo` | GET | Reporte completo |

---

## 🔔 MÓDULO 18: NOTIFICACIONES (4 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/notificaciones/comunidad/:comunidadId` | GET | Notificaciones por comunidad |
| `/notificaciones/:id` | GET | Detalle de notificación |
| `/notificaciones/estadisticas/generales` | GET | Estadísticas generales |
| `/notificaciones/estadisticas/por-tipo` | GET | Estadísticas por tipo |

---

## 📏 MÓDULO 19: MEDIDORES (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/medidores/:id` | GET | Detalle de medidor |
| `/medidores/unidad/:unidadId` | GET | Medidores por unidad |

---

## ⚠️ MÓDULO 20: MULTAS (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/multas/:id` | GET | Detalle de multa |
| `/multas/comunidad/:comunidadId` | GET | Multas por comunidad |

---

## 🔄 MÓDULO 21: CONCILIACIONES (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/conciliaciones/comunidad/:comunidadId` | GET | Conciliaciones por comunidad |

---

## 📄 MÓDULO 22: DOCUMENTOS DE COMPRA (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/documentos-compra/comunidad/:comunidadId` | GET | Documentos por comunidad |

---

## 👥 MÓDULO 23: MEMBRESÍAS (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/membresias/comunidad/:comunidadId` | GET | Membresías por comunidad |

---

## 🎧 MÓDULO 24: SOPORTE (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/soporte/comunidad/:comunidadId` | GET | Tickets de soporte |

---

## 📁 MÓDULO 25: FILES (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/files/comunidad/:comunidadId` | GET | Archivos por comunidad |

---

## 💱 MÓDULO 26: VALOR UTM (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/valor-utm/actual` | GET | Valor UTM actual |
| `/valor-utm/fecha/:fecha` | GET | Valor UTM por fecha |

---

## 🔧 MÓDULO 27: UTIL (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/util/health` | GET | Health check del sistema |

---

## 🔗 MÓDULO 28: WEBHOOKS (1 endpoint)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/webhooks/logs` | GET | Logs de webhooks |

---

## 🔐 MÓDULO 29: AUTH (2 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/auth/me` | GET | Información del usuario actual |
| `/auth/verify-token` | GET | Verificar token |

---

## 💰 MÓDULO 30: PAYMENT GATEWAY (3 endpoints)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gateway/available` | GET | Gateways disponibles |
| `/gateway/transaction/:orderId` | GET | Detalle de transacción |
| `/gateway/community/:communityId/transactions` | GET | Transacciones por comunidad |

---

## 📊 Resumen por Categoría

### Estructura y Entidades (5 módulos, 7 endpoints)
- Comunidades, Edificios, Unidades, Torres, Personas

### Financiero (8 módulos, 25 endpoints)
- Pagos, Cargos, Emisiones, Gastos, Proveedores, Multas, Conciliaciones, Documentos

### Operaciones (4 módulos, 13 endpoints)
- Amenidades, Tickets, Soporte, Notificaciones

### Configuración (4 módulos, 10 endpoints)
- Categorías Gasto, Centros Costo, Tarifas, Medidores

### Administración (2 módulos, 2 endpoints)
- Membresías, Files

### Integración (7 módulos, 16 endpoints)
- Dashboard, Reportes, Util, Valor UTM, Webhooks, Auth, Payment Gateway

---

**Total: 30 Módulos | 73 Endpoints**
