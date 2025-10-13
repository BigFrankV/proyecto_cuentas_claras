# 🔗 MAPA DE CONEXIONES - Módulo de Gastos

## 📊 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MÓDULO DE GASTOS                              │
│                   (Sistema de Gestión Completa)                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
        ┌──────────────────────────┴──────────────────────────┐
        │                                                       │
        ▼                                                       ▼
┌───────────────┐                                    ┌──────────────────┐
│   FRONTEND    │                                    │     BACKEND      │
│  (Next.js)    │◄─────── HTTP/REST ──────────────►│   (Express.js)   │
│               │        JSON + JWT                  │                  │
└───────────────┘                                    └──────────────────┘
        │                                                       │
        │                                                       │
        ├─ pages/gastos.tsx                                   ├─ routes/gastos.js
        ├─ pages/gastos/nuevo.tsx                             │   (19 endpoints)
        ├─ pages/gastos/[id].tsx                              │
        ├─ pages/gastos/reportes.tsx                          ▼
        │                                            ┌──────────────────┐
        ├─ lib/api/gastos.ts                        │   MySQL 8.0.43   │
        │  (21 funciones API)                       │   (Base de Datos)│
        │                                            └──────────────────┘
        ▼
┌───────────────┐
│   USUARIO     │
│   (Browser)   │
└───────────────┘
```

---

## 🗺️ Mapa de Endpoints por Página

### **PÁGINA 1: `/gastos` (Listado Principal)**

```
┌────────────────────────────────────────────────────────┐
│  GASTOS.TSX - Listado Principal                        │
│                                                         │
│  Estado: ✅ 100% Funcional                             │
│  Endpoints: 2/2                                        │
└────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        ▼                              ▼
┌─────────────────┐          ┌──────────────────┐
│ GET /gastos/    │          │ GET /gastos/     │
│ comunidad/:id   │          │ comunidad/:id/   │
│                 │          │ stats            │
│ Línea: 69-87    │          │                  │
│                 │          │ Línea: 89-99     │
└─────────────────┘          └──────────────────┘
        │                              │
        ▼                              ▼
   [Lista de      [Estadísticas:
    gastos]         - Total gastos
                    - Monto total
                    - Pendientes
                    - Aprobados]
                              │
                              ▼
                    ┌─────────────────────┐
                    │  UI COMPONENTS      │
                    ├─────────────────────┤
                    │ • Tabla (338-464)   │
                    │ • Tarjetas (473-548)│
                    │ • Stats (175-193)   │
                    │ • Filtros (228-305) │
                    │ • Paginación        │
                    └─────────────────────┘
```

---

### **PÁGINA 2: `/gastos/nuevo` (Crear Gasto)**

```
┌────────────────────────────────────────────────────────┐
│  NUEVO.TSX - Crear Nuevo Gasto                         │
│                                                         │
│  Estado: ✅ 95% Funcional                              │
│  Endpoints: 2 (1 principal + 1 pendiente)             │
└────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌─────────────────┐        ┌────────────────────┐
│ POST /gastos/   │        │ POST /gastos/:id/  │
│ comunidad/:id   │        │ archivos           │
│                 │        │                    │
│ Línea: 232-267  │        │ Línea: 252-258     │
│ ✅ Funcional    │        │ ⚠️ Backend falta   │
└─────────────────┘        └────────────────────┘
        │                             │
        ▼                             ▼
   [Crea gasto]              [Sube archivos]
   [Retorna ID]              [Adjunta al gasto]
        │
        ▼
┌─────────────────────────────┐
│  FORMULARIO                 │
├─────────────────────────────┤
│ • Descripción ✅            │
│ • Categoría ✅              │
│ • Proveedor ✅              │
│ • Monto ✅                  │
│ • Fecha ✅                  │
│ • Tipo Documento ✅         │
│ • Número Documento ✅       │
│ • Centro Costo ⚪           │
│ • Extraordinario ⚪          │
│ • Tags ⚪                    │
│ • Archivos ⚠️               │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  VALIDACIONES               │
├─────────────────────────────┤
│ ✅ Campos obligatorios      │
│ ✅ Monto > 0                │
│ ✅ Formato de fecha         │
│ ✅ Tipo de archivo          │
│ ✅ Tamaño < 10MB            │
└─────────────────────────────┘
```

---

### **PÁGINA 3: `/gastos/[id]` (Detalle de Gasto)**

```
┌────────────────────────────────────────────────────────────────┐
│  [ID].TSX - Vista Detallada de Gasto                           │
│                                                                 │
│  Estado: ✅ 100% Funcional                                     │
│  Endpoints: 8/8 (Más completo del módulo)                     │
└────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐     ┌──────────────────┐    ┌──────────────────┐
│ GET /gastos/ │     │ GET /gastos/:id/ │    │ GET /gastos/:id/ │
│ :id          │     │ historial        │    │ aprobaciones     │
│              │     │                  │    │                  │
│ Línea: 25-34 │     │ Línea: 26        │    │ Línea: 27        │
└──────────────┘     └──────────────────┘    └──────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   [Gasto base]         [Historial de           [Aprobaciones]
                         cambios]
        │
        ├────────────────────────────────────────────────────────┐
        │                       │                                 │
        ▼                       ▼                                 ▼
┌──────────────┐     ┌──────────────────┐         ┌──────────────────┐
│ GET /gastos/ │     │ POST /gastos/    │         │ DELETE /gastos/  │
│ :id/archivos │     │ :id/aprobar      │         │ :id              │
│              │     │                  │         │                  │
│ Línea: 28    │     │ Línea: 131-171   │         │ Línea: 178-193   │
└──────────────┘     └──────────────────┘         └──────────────────┘
        │                       │                         │
        ▼                       ▼                         ▼
   [Archivos            [Aprobar/Rechazar]        [Eliminar gasto]
    adjuntos]
        │
        ├────────────────────────────────┐
        │                                │
        ▼                                ▼
┌──────────────┐              ┌──────────────────┐
│ GET /gastos/ │              │ POST /gastos/    │
│ :id/emisiones│              │ :id/anular       │
│              │              │                  │
│ Línea: 29    │              │ Línea: 197-213   │
└──────────────┘              └──────────────────┘
        │                                │
        ▼                                ▼
   [Emisiones                    [Anular gasto]
    asociadas]
        │
        ▼
┌──────────────────────────────────────────┐
│  UI SECTIONS                             │
├──────────────────────────────────────────┤
│ 📄 Header (263-338)                      │
│    • Número, estado, botones             │
│                                          │
│ 📊 Info Grid (345-372)                   │
│    • 2 columnas con datos clave          │
│                                          │
│ 📋 Card Detalles (375-441)               │
│    • Información completa                │
│                                          │
│ 📎 Archivos (446-490)                    │
│    • Lista de adjuntos                   │
│                                          │
│ ✅ Aprobaciones (494-537)                │
│    • Historial de aprobaciones           │
│                                          │
│ 🔄 Timeline Historial (544-586)          │
│    • Cambios cronológicos                │
│                                          │
│ 📅 Emisiones (589-626)                   │
│    • Distribución por periodo            │
│                                          │
│ 🪧 Sidebar (629-663)                     │
│    • Resumen sticky                      │
└──────────────────────────────────────────┘
```

---

### **PÁGINA 4: `/gastos/reportes` (Dashboard de Reportes)**

```
┌────────────────────────────────────────────────────────────────┐
│  REPORTES.TSX - Dashboard de Análisis                          │
│                                                                 │
│  Estado: ✅ 100% Funcional                                     │
│  Endpoints: 8/8 (Dashboard más completo)                      │
└────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐     ┌──────────────────┐    ┌──────────────────┐
│ GET /gastos/ │     │ GET /gastos/     │    │ GET /gastos/     │
│ comunidad/   │     │ comunidad/:id/   │    │ comunidad/:id/   │
│ :id/por-     │     │ por-proveedor    │    │ por-centro-costo │
│ categoria    │     │                  │    │                  │
│              │     │ Línea: 43        │    │ Línea: 44        │
│ Línea: 42    │     └──────────────────┘    └──────────────────┘
└──────────────┘              │                       │
        │                     ▼                       ▼
        │              [Por Proveedor]         [Por Centro Costo]
        ▼              • Nombre                • Nombre
   [Por Categoría]     • Total gastos         • Total gastos
   • Nombre            • Monto total          • Monto total
   • Total gastos      • Promedio
   • Monto total       • Último gasto
   • Porcentaje
        │
        ├────────────────────────────────────────────────────────┐
        │                       │                                 │
        ▼                       ▼                                 ▼
┌──────────────┐     ┌──────────────────┐         ┌──────────────────┐
│ GET /gastos/ │     │ GET /gastos/     │         │ GET /gastos/     │
│ comunidad/   │     │ comunidad/:id/   │         │ comunidad/:id/   │
│ :id/evolucion│     │ top-gastos       │         │ pendientes-      │
│ -temporal    │     │                  │         │ aprobacion       │
│              │     │ Línea: 46        │         │                  │
│ Línea: 45    │     └──────────────────┘         │ Línea: 47        │
└──────────────┘              │                   └──────────────────┘
        │                     ▼                            │
        │              [Top N Gastos                       ▼
        ▼               Mayores]                    [Gastos Pendientes]
   [Evolución           • Configurable              • Destacados
    Temporal]           • Filtrable                 • Card warning
   • Por mes/año        • Top 5-50
   • Total gastos
   • Monto total
   • Promedio
        │
        ├────────────────────────────┐
        │                            │
        ▼                            ▼
┌──────────────┐          ┌──────────────────┐
│ GET /gastos/ │          │ Filtros          │
│ comunidad/   │          │ Aplicados        │
│ :id/alertas  │          │                  │
│              │          │ • Fecha desde    │
│ Línea: 48    │          │ • Fecha hasta    │
└──────────────┘          │ • Meses (1-24)   │
        │                 │ • Límite (5-50)  │
        ▼                 └──────────────────┘
   [Alertas]
   • Sin aprobación
   • Monto alto
   • Vencidos
        │
        ▼
┌──────────────────────────────────────────┐
│  8 REPORTES DESPLEGADOS                  │
├──────────────────────────────────────────┤
│ 1️⃣ Alertas (229-247)                     │
│    • Cards con iconos y colores          │
│                                          │
│ 2️⃣ Pendientes Aprobación (253-295)      │
│    • Tabla destacada                     │
│                                          │
│ 3️⃣ Por Categoría (302-331)              │
│    • Tabla con porcentajes               │
│                                          │
│ 4️⃣ Por Centro Costo (336-361)           │
│    • Tabla resumen                       │
│                                          │
│ 5️⃣ Por Proveedor (368-395)              │
│    • Tabla con promedios                 │
│                                          │
│ 6️⃣ Evolución Temporal (399-423)         │
│    • Tabla mes/año                       │
│                                          │
│ 7️⃣ Top Gastos (428-478)                 │
│    • Tabla con links                     │
│                                          │
│ 8️⃣ Estadísticas (implícito)             │
│    • Dashboard metrics                   │
└──────────────────────────────────────────┘
```

---

## 🔌 Diagrama de Flujo de Datos

### **FLUJO TÍPICO: Cargar Lista de Gastos**

```
┌─────────────┐
│   USUARIO   │
│   (Browser) │
└──────┬──────┘
       │ 1. Navega a /gastos
       ▼
┌──────────────────┐
│  gastos.tsx      │
│  (Página React)  │
└──────┬───────────┘
       │ 2. useEffect() se ejecuta
       │    al cargar componente
       ▼
┌──────────────────┐
│  loadExpenses()  │
│  (línea 69-87)   │
└──────┬───────────┘
       │ 3. Llama a API function
       ▼
┌──────────────────────────┐
│  gastosApi.listarGastos()│
│  (lib/api/gastos.ts)     │
└──────┬───────────────────┘
       │ 4. axios.get() con token
       │    Authorization: Bearer <JWT>
       ▼
┌──────────────────────────┐
│  Backend API             │
│  GET /gastos/comunidad/1 │
│  (routes/gastos.js)      │
└──────┬───────────────────┘
       │ 5. Query a MySQL
       │    SELECT * FROM gastos...
       ▼
┌──────────────────────────┐
│  MySQL Database          │
│  tabla: gastos           │
└──────┬───────────────────┘
       │ 6. Retorna filas
       ▼
┌──────────────────────────┐
│  Backend procesa         │
│  • Joins con tablas      │
│  • Aplica filtros        │
│  • Paginación            │
│  • Formateo JSON         │
└──────┬───────────────────┘
       │ 7. Response JSON
       │    { success: true,
       │      data: [...],
       │      pagination: {...} }
       ▼
┌──────────────────────────┐
│  gastosApi.listarGastos()│
│  Recibe response         │
└──────┬───────────────────┘
       │ 8. Retorna response.data
       ▼
┌──────────────────────────┐
│  loadExpenses()          │
│  setExpenses(data)       │
│  setTotalItems(total)    │
└──────┬───────────────────┘
       │ 9. React actualiza estado
       │    useState hooks disparan
       │    re-render
       ▼
┌──────────────────────────┐
│  gastos.tsx re-renderiza │
│  • Map sobre expenses[]  │
│  • Genera <tr> por cada  │
│  • Aplica formateo       │
└──────┬───────────────────┘
       │ 10. DOM actualizado
       ▼
┌──────────────────────────┐
│  USUARIO ve la tabla     │
│  con datos actualizados  │
└──────────────────────────┘

⏱️ Tiempo total: ~200-500ms
```

---

## 🔐 Diagrama de Autenticación

```
┌──────────────────────────────────────────────┐
│  FLUJO DE AUTENTICACIÓN                      │
└──────────────────────────────────────────────┘

┌─────────────┐
│  Login Page │
└──────┬──────┘
       │ 1. Usuario ingresa credenciales
       ▼
┌──────────────────┐
│  POST /auth/     │
│  login           │
└──────┬───────────┘
       │ 2. Backend valida
       │    y genera JWT
       ▼
┌──────────────────┐
│  localStorage    │
│  .setItem(       │
│   'token',       │
│   jwt_token)     │
└──────┬───────────┘
       │ 3. Token guardado
       │    en navegador
       ▼
┌──────────────────────────┐
│  Todas las llamadas API  │
│  incluyen header:        │
│                          │
│  const getAuthHeaders =  │
│    () => {               │
│      const token =       │
│        localStorage      │
│        .getItem('token');│
│      return {            │
│        Authorization:    │
│        `Bearer ${token}` │
│      };                  │
│    };                    │
└──────┬───────────────────┘
       │ 4. Cada request incluye
       │    Authorization header
       ▼
┌──────────────────┐
│  Backend verifica│
│  JWT middleware  │
│  • Valida firma  │
│  • Verifica exp  │
│  • Extrae user   │
└──────┬───────────┘
       │ 5. Si válido, procesa
       │    Si no, 401 Unauthorized
       ▼
┌──────────────────┐
│  Protected Route │
│  Component       │
│  • Verifica auth │
│  • Redirecciona  │
│    si no autent. │
└──────────────────┘
```

---

## 🗂️ Estructura de Datos

### **Objeto Gasto (completo)**

```typescript
{
  // Identificación
  id: 123,
  numero: "G2024-0123",
  
  // Relaciones
  comunidad_id: 1,
  categoria_id: 5,
  centro_costo_id: 3,
  documento_compra_id: null,
  creado_por: 10,
  aprobado_por: 12,
  
  // Datos principales
  fecha: "2024-01-15",
  monto: 150000.50,
  glosa: "Mantenimiento de ascensores",
  extraordinario: false,
  
  // Estado
  estado: "aprobado",
  
  // Timestamps
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-16T14:20:00Z",
  
  // Datos relacionados (joins)
  categoria_nombre: "Mantenimiento",
  centro_costo_nombre: "Áreas Comunes",
  creado_por_nombre: "Juan Pérez",
  aprobado_por_nombre: "María González",
  
  // Arrays opcionales (en detalle)
  aprobaciones: [...],
  historial: [...],
  archivos: [...],
  emisiones: [...]
}
```

---

## 📊 Tabla de Conexiones Completa

| # | Endpoint | Método | Función API | Página(s) | Estado |
|---|----------|--------|-------------|-----------|--------|
| 1 | `/gastos/comunidad/:id` | GET | `listarGastos()` | gastos.tsx | ✅ |
| 2 | `/gastos/comunidad/:id/stats` | GET | `obtenerEstadisticas()` | gastos.tsx | ✅ |
| 3 | `/gastos/comunidad/:id` | POST | `crearGasto()` | nuevo.tsx | ✅ |
| 4 | `/gastos/:id` | GET | `obtenerGasto()` | [id].tsx | ✅ |
| 5 | `/gastos/:id` | PUT | `actualizarGasto()` | ❌ | ⚠️ |
| 6 | `/gastos/:id` | DELETE | `eliminarGasto()` | [id].tsx | ✅ |
| 7 | `/gastos/:id/aprobar` | POST | `registrarAprobacion()` | [id].tsx | ✅ |
| 8 | `/gastos/:id/anular` | POST | `anularGasto()` | [id].tsx | ✅ |
| 9 | `/gastos/:id/historial` | GET | `obtenerHistorial()` | [id].tsx | ✅ |
| 10 | `/gastos/:id/aprobaciones` | GET | `obtenerAprobaciones()` | [id].tsx | ✅ |
| 11 | `/gastos/:id/archivos` | GET | `obtenerArchivos()` | [id].tsx | ✅ |
| 12 | `/gastos/:id/archivos` | POST | `subirArchivo()` | nuevo.tsx | ⚠️ |
| 13 | `/gastos/:id/archivos/:archivoId` | DELETE | `eliminarArchivo()` | ❌ | ⚠️ |
| 14 | `/gastos/:id/emisiones` | GET | `obtenerEmisiones()` | [id].tsx | ✅ |
| 15 | `/gastos/comunidad/:id/por-categoria` | GET | `obtenerGastosPorCategoria()` | reportes.tsx | ✅ |
| 16 | `/gastos/comunidad/:id/por-proveedor` | GET | `obtenerGastosPorProveedor()` | reportes.tsx | ✅ |
| 17 | `/gastos/comunidad/:id/por-centro-costo` | GET | `obtenerGastosPorCentroCosto()` | reportes.tsx | ✅ |
| 18 | `/gastos/comunidad/:id/evolucion-temporal` | GET | `obtenerEvolucionTemporal()` | reportes.tsx | ✅ |
| 19 | `/gastos/comunidad/:id/top-gastos` | GET | `obtenerTopGastos()` | reportes.tsx | ✅ |
| 20 | `/gastos/comunidad/:id/pendientes-aprobacion` | GET | `obtenerGastosPendientes()` | reportes.tsx | ✅ |
| 21 | `/gastos/comunidad/:id/alertas` | GET | `obtenerAlertas()` | reportes.tsx | ✅ |

**Leyenda:**
- ✅ = Conectado y funcional
- ⚠️ = Endpoint pendiente en backend o página no creada
- ❌ = No implementado

---

## 🎯 Cobertura Visual

```
  ENDPOINTS BACKEND (19)
  ████████████████████░  94.7%
  
  PÁGINAS FRONTEND (6)
  ████████████████░░░░  83.3%
  
  DATOS DESPLEGADOS
  ████████████████████  100%
  
  VALIDACIONES
  ████████████████████  100%
```

---

**Última actualización:** 13 de octubre de 2025
