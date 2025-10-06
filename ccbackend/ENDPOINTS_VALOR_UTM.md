# 📊 API ENDPOINTS - VALOR UTM
## Documentación Completa

**Base URL**: `/api/valor-utm`
**Autenticación**: Requerida (Bearer Token)

---

## 📑 ÍNDICE

1. [Consultas Básicas](#1-consultas-básicas)
2. [Histórico Anual](#2-histórico-anual)
3. [Variaciones y Tendencias](#3-variaciones-y-tendencias)
4. [Análisis Trimestral y Semestral](#4-análisis-trimestral-y-semestral)
5. [Comparaciones entre Años](#5-comparaciones-entre-años)
6. [Estadísticas y Rankings](#6-estadísticas-y-rankings)
7. [Dashboard y Resumen Ejecutivo](#7-dashboard-y-resumen-ejecutivo)
8. [Conversiones y Cálculos](#8-conversiones-y-cálculos)
9. [Disponibilidad de Datos](#9-disponibilidad-de-datos)

---

## 1. CONSULTAS BÁSICAS

### 1.1. Obtener Valor UTM Actual

**Endpoint**: `GET /api/valor-utm/actual`

**Descripción**: Obtiene el valor UTM más reciente disponible.

**Request**:
```http
GET /api/valor-utm/actual
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "fecha": "2025-10-01",
    "valor": 65748.00,
    "mes": 10,
    "ano": 2025,
    "periodo": "Octubre 2025"
  }
}
```

---

### 1.2. Obtener Valor por Período

**Endpoint**: `GET /api/valor-utm/periodo/:mes/:ano`

**Descripción**: Obtiene el valor UTM de un mes y año específico.

**Parámetros**:
- `mes` (number, 1-12): Mes a consultar
- `ano` (number): Año a consultar

**Request**:
```http
GET /api/valor-utm/periodo/9/2025
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "fecha": "2025-09-01",
    "valor": 65321.00,
    "mes": 9,
    "ano": 2025,
    "periodo": "Septiembre 2025"
  }
}
```

**Error Responses**:
- `400`: Mes o año inválido
- `404`: No hay datos para ese período

---

### 1.3. Obtener Rango de Valores

**Endpoint**: `GET /api/valor-utm/rango`

**Descripción**: Obtiene valores UTM de los últimos N meses.

**Query Parameters**:
- `meses` (number, optional): Cantidad de meses (default: 12, max: 60)

**Request**:
```http
GET /api/valor-utm/rango?meses=6
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 6,
  "meses_solicitados": 6,
  "data": [
    {
      "fecha": "2025-10-01",
      "valor": 65748.00,
      "mes": 10,
      "ano": 2025,
      "periodo": "Octubre 2025"
    },
    {
      "fecha": "2025-09-01",
      "valor": 65321.00,
      "mes": 9,
      "ano": 2025,
      "periodo": "Septiembre 2025"
    }
    // ... más registros
  ]
}
```

---

## 2. HISTÓRICO ANUAL

### 2.1. Obtener Histórico de un Año

**Endpoint**: `GET /api/valor-utm/historico/:ano`

**Descripción**: Obtiene todos los valores UTM de un año específico.

**Request**:
```http
GET /api/valor-utm/historico/2024
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "ano": 2024,
  "cantidad": 12,
  "data": [
    {
      "fecha": "2024-01-01",
      "valor": 64216.00,
      "mes": 1,
      "ano": 2024,
      "mes_nombre": "Enero"
    }
    // ... 11 meses más
  ]
}
```

---

### 2.2. Resumen Anual

**Endpoint**: `GET /api/valor-utm/resumen-anual/:ano`

**Descripción**: Obtiene estadísticas resumidas de un año.

**Request**:
```http
GET /api/valor-utm/resumen-anual/2024
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "ano": 2024,
    "total_registros": 12,
    "meses_disponibles": 12,
    "valor_minimo": 64216.00,
    "valor_maximo": 65748.00,
    "valor_promedio": 64982.00,
    "variacion_total": 1532.00,
    "variacion_porcentual": 2.39,
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-12-01"
  }
}
```

---

### 2.3. Resumen de Todos los Años

**Endpoint**: `GET /api/valor-utm/resumen-anos`

**Descripción**: Obtiene resumen estadístico de todos los años disponibles.

**Request**:
```http
GET /api/valor-utm/resumen-anos
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 5,
  "data": [
    {
      "ano": 2025,
      "total_registros": 10,
      "meses_disponibles": 10,
      "valor_minimo": 64982.00,
      "valor_maximo": 65748.00,
      "valor_promedio": 65365.00,
      "variacion_total": 766.00,
      "variacion_porcentual": 1.18,
      "fecha_inicio": "2025-01-01",
      "fecha_fin": "2025-10-01"
    }
    // ... más años
  ]
}
```

---

## 3. VARIACIONES Y TENDENCIAS

### 3.1. Variación Mensual

**Endpoint**: `GET /api/valor-utm/variacion-mensual`

**Descripción**: Obtiene la variación mensual (mes a mes) de los últimos N meses.

**Query Parameters**:
- `meses` (number, optional): Cantidad de meses (default: 12, max: 24)

**Request**:
```http
GET /api/valor-utm/variacion-mensual?meses=6
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 6,
  "data": [
    {
      "fecha": "2025-10-01",
      "valor_actual": 65748.00,
      "mes": 10,
      "ano": 2025,
      "periodo": "Octubre 2025",
      "valor_anterior": 65321.00,
      "periodo_anterior": "Septiembre 2025",
      "variacion_absoluta": 427.00,
      "variacion_porcentual": 0.6538
    }
    // ... más registros
  ]
}
```

---

### 3.2. Variación Interanual

**Endpoint**: `GET /api/valor-utm/variacion-interanual/:ano`

**Descripción**: Compara los valores de un año con el año anterior (mismo mes).

**Request**:
```http
GET /api/valor-utm/variacion-interanual/2025
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "ano_actual": 2025,
  "ano_comparacion": 2024,
  "cantidad": 10,
  "data": [
    {
      "fecha_actual": "2025-01-01",
      "valor_actual": 64982.00,
      "periodo_actual": "Enero 2025",
      "fecha_anterior": "2024-01-01",
      "valor_anterior": 64216.00,
      "periodo_anterior": "Enero 2024",
      "variacion_absoluta": 766.00,
      "variacion_porcentual_anual": 1.1930
    }
    // ... más meses
  ]
}
```

---

## 4. ANÁLISIS TRIMESTRAL Y SEMESTRAL

### 4.1. Análisis Trimestral

**Endpoint**: `GET /api/valor-utm/trimestral`

**Descripción**: Obtiene estadísticas trimestrales.

**Query Parameters**:
- `meses` (number, optional): Cantidad de meses hacia atrás (default: 24, max: 60)

**Request**:
```http
GET /api/valor-utm/trimestral?meses=24
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 8,
  "data": [
    {
      "ano": 2025,
      "trimestre": 3,
      "periodo": "Q3 2025",
      "registros": 3,
      "valor_minimo": 65123.00,
      "valor_maximo": 65748.00,
      "valor_promedio": 65436.00,
      "variacion_trimestre": 625.00
    }
    // ... más trimestres
  ]
}
```

---

### 4.2. Análisis Semestral

**Endpoint**: `GET /api/valor-utm/semestral`

**Descripción**: Obtiene estadísticas semestrales.

**Query Parameters**:
- `desde` (number, optional): Año inicial (default: año actual - 3)

**Request**:
```http
GET /api/valor-utm/semestral?desde=2022
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "desde_ano": 2022,
  "cantidad": 8,
  "data": [
    {
      "ano": 2025,
      "semestre_num": 2,
      "semestre_nombre": "Segundo Semestre",
      "registros": 4,
      "valor_minimo": 65123.00,
      "valor_maximo": 65748.00,
      "valor_promedio": 65435.50
    }
    // ... más semestres
  ]
}
```

---

## 5. COMPARACIONES ENTRE AÑOS

### 5.1. Comparación de Años por Mes

**Endpoint**: `GET /api/valor-utm/comparacion-anos`

**Descripción**: Compara valores UTM de múltiples años, organizados por mes.

**Query Parameters**:
- `anos` (string, optional): Años separados por coma (ej: "2021,2022,2023,2024,2025")
  - Si no se especifica, usa los últimos 5 años

**Request**:
```http
GET /api/valor-utm/comparacion-anos?anos=2023,2024,2025
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "anos_comparados": [2023, 2024, 2025],
  "cantidad": 12,
  "data": [
    {
      "mes": 1,
      "mes_nombre": "Enero",
      "2023": 62876.00,
      "2024": 64216.00,
      "2025": 64982.00
    },
    {
      "mes": 2,
      "mes_nombre": "Febrero",
      "2023": 63021.00,
      "2024": 64387.00,
      "2025": 65143.00
    }
    // ... más meses
  ]
}
```

---

## 6. ESTADÍSTICAS Y RANKINGS

### 6.1. Top Valores (Máximos y Mínimos)

**Endpoint**: `GET /api/valor-utm/top-valores`

**Descripción**: Obtiene los valores UTM más altos y más bajos históricos.

**Query Parameters**:
- `limit` (number, optional): Cantidad de registros (default: 10, max: 50)

**Request**:
```http
GET /api/valor-utm/top-valores?limit=5
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "limit": 5,
  "mayores": [
    {
      "fecha": "2025-10-01",
      "valor": 65748.00,
      "periodo": "Octubre 2025",
      "mes": 10,
      "ano": 2025
    }
    // ... 4 más
  ],
  "menores": [
    {
      "fecha": "2020-01-01",
      "valor": 49623.00,
      "periodo": "Enero 2020",
      "mes": 1,
      "ano": 2020
    }
    // ... 4 más
  ]
}
```

---

### 6.2. Estadísticas Generales por Año

**Endpoint**: `GET /api/valor-utm/estadisticas`

**Descripción**: Obtiene estadísticas avanzadas (desviación estándar, coeficiente de variación) por año.

**Request**:
```http
GET /api/valor-utm/estadisticas
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 6,
  "data": [
    {
      "ano": 2025,
      "registros": 10,
      "promedio": 65365.00,
      "minimo": 64982.00,
      "maximo": 65748.00,
      "desviacion_estandar": 255.87,
      "coeficiente_variacion": 0.39
    }
    // ... más años
  ]
}
```

---

## 7. DASHBOARD Y RESUMEN EJECUTIVO

### 7.1. KPIs para Dashboard

**Endpoint**: `GET /api/valor-utm/dashboard`

**Descripción**: Obtiene indicadores clave y últimos valores para dashboard.

**Query Parameters**:
- `meses` (number, optional): Cantidad de meses (default: 12, max: 24)

**Request**:
```http
GET /api/valor-utm/dashboard?meses=12
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "kpis": {
    "meses_registrados": 12,
    "valor_minimo": 64216.00,
    "valor_maximo": 65748.00,
    "valor_promedio": 64982.00,
    "rango": 1532.00,
    "variacion_porcentual": 2.39,
    "fecha_desde": "2024-11-01",
    "fecha_hasta": "2025-10-01",
    "periodo_desde": "Noviembre 2024",
    "periodo_hasta": "Octubre 2025"
  },
  "ultimos_valores": [
    {
      "fecha": "2025-10-01",
      "valor": 65748.00,
      "periodo": "Octubre 2025",
      "variacion": 427.00,
      "variacion_porcentual": 0.6538
    }
    // ... 4 más
  ]
}
```

---

### 7.2. Datos para Gráfico

**Endpoint**: `GET /api/valor-utm/grafico`

**Descripción**: Obtiene datos formateados específicamente para renderizar gráficos de línea.

**Query Parameters**:
- `meses` (number, optional): Cantidad de meses (default: 24, max: 60)

**Request**:
```http
GET /api/valor-utm/grafico?meses=12
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 12,
  "data": [
    {
      "fecha": "2024-11-01",
      "valor": 64216.00,
      "periodo_corto": "2024-11",
      "periodo_formato": "Nov 2024",
      "mes": 11,
      "ano": 2024
    }
    // ... más puntos del gráfico
  ]
}
```

---

## 8. CONVERSIONES Y CÁLCULOS

### 8.1. Tabla de Conversión Rápida

**Endpoint**: `GET /api/valor-utm/conversion/tabla`

**Descripción**: Obtiene tabla con valores UTM comunes convertidos a pesos (usando valor actual).

**Request**:
```http
GET /api/valor-utm/conversion/tabla
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "fecha": "2025-10-01",
    "valor_utm": 65748.00,
    "periodo": "Octubre 2025",
    "utm_1": 65748.00,
    "utm_5": 328740.00,
    "utm_10": 657480.00,
    "utm_25": 1643700.00,
    "utm_50": 3287400.00,
    "utm_100": 6574800.00,
    "utm_500": 32874000.00,
    "utm_1000": 65748000.00
  }
}
```

---

### 8.2. Convertir Pesos a UTM

**Endpoint**: `GET /api/valor-utm/conversion/pesos-a-utm`

**Descripción**: Convierte un monto en pesos chilenos a UTM usando el valor actual.

**Query Parameters**:
- `pesos` (number, required): Monto en pesos chilenos

**Request**:
```http
GET /api/valor-utm/conversion/pesos-a-utm?pesos=5000000
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "monto_pesos": 5000000.00,
    "valor_utm": 65748.00,
    "fecha": "2025-10-01",
    "periodo": "Octubre 2025",
    "equivalente_utm": 76.0526
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Debe especificar un monto válido en pesos"
}
```

---

### 8.3. Convertir UTM a Pesos

**Endpoint**: `GET /api/valor-utm/conversion/utm-a-pesos`

**Descripción**: Convierte una cantidad de UTM a pesos chilenos usando el valor actual.

**Query Parameters**:
- `utm` (number, required): Cantidad de UTM

**Request**:
```http
GET /api/valor-utm/conversion/utm-a-pesos?utm=50
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "cantidad_utm": 50.00,
    "valor_utm": 65748.00,
    "fecha": "2025-10-01",
    "periodo": "Octubre 2025",
    "equivalente_pesos": 3287400.00
  }
}
```

---

## 9. DISPONIBILIDAD DE DATOS

### 9.1. Disponibilidad por Año

**Endpoint**: `GET /api/valor-utm/disponibilidad`

**Descripción**: Obtiene información sobre la disponibilidad y completitud de datos por año.

**Request**:
```http
GET /api/valor-utm/disponibilidad
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "cantidad": 6,
  "data": [
    {
      "ano": 2025,
      "total_registros": 10,
      "meses_disponibles": 10,
      "primera_fecha": "2025-01-01",
      "ultima_fecha": "2025-10-01",
      "dias_rango": 273,
      "estado_completitud": "Parcial"
    },
    {
      "ano": 2024,
      "total_registros": 12,
      "meses_disponibles": 12,
      "primera_fecha": "2024-01-01",
      "ultima_fecha": "2024-12-01",
      "dias_rango": 335,
      "estado_completitud": "Completo"
    }
    // ... más años
  ]
}
```

---

## 📌 NOTAS IMPORTANTES

### Autenticación

Todos los endpoints requieren autenticación mediante Bearer Token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `400 Bad Request`: Parámetros inválidos
- `401 Unauthorized`: Token faltante o inválido
- `404 Not Found`: No se encontraron datos
- `500 Internal Server Error`: Error del servidor

### Formato de Fechas

Todas las fechas se retornan en formato `YYYY-MM-DD` (ISO 8601).

### Valores Numéricos

- Los valores UTM están en pesos chilenos (CLP)
- Los valores están redondeados a 2 decimales
- Las variaciones porcentuales están en formato decimal (ej: 0.6538 = 0.6538%)

---

## 🔧 EJEMPLOS DE USO

### Ejemplo 1: Dashboard Completo

```javascript
// Obtener KPIs principales
const kpis = await fetch('/api/valor-utm/dashboard?meses=12', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Obtener datos para gráfico
const grafico = await fetch('/api/valor-utm/grafico?meses=24', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Obtener comparación de años
const comparacion = await fetch('/api/valor-utm/comparacion-anos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Ejemplo 2: Calculadora UTM

```javascript
// Convertir $5,000,000 a UTM
const pesosAUtm = await fetch('/api/valor-utm/conversion/pesos-a-utm?pesos=5000000', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Convertir 50 UTM a pesos
const utmAPesos = await fetch('/api/valor-utm/conversion/utm-a-pesos?utm=50', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Obtener tabla de conversión rápida
const tabla = await fetch('/api/valor-utm/conversion/tabla', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Ejemplo 3: Análisis Histórico

```javascript
// Obtener histórico de 2024
const historico = await fetch('/api/valor-utm/historico/2024', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Obtener variación mensual
const variacion = await fetch('/api/valor-utm/variacion-mensual?meses=12', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Obtener análisis trimestral
const trimestral = await fetch('/api/valor-utm/trimestral?meses=24', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 📊 RESUMEN DE ENDPOINTS

| Categoría | Cantidad | Endpoints |
|-----------|----------|-----------|
| **Consultas Básicas** | 3 | `/actual`, `/periodo/:mes/:ano`, `/rango` |
| **Histórico Anual** | 3 | `/historico/:ano`, `/resumen-anual/:ano`, `/resumen-anos` |
| **Variaciones** | 2 | `/variacion-mensual`, `/variacion-interanual/:ano` |
| **Análisis Temporal** | 2 | `/trimestral`, `/semestral` |
| **Comparaciones** | 1 | `/comparacion-anos` |
| **Estadísticas** | 2 | `/top-valores`, `/estadisticas` |
| **Dashboard** | 2 | `/dashboard`, `/grafico` |
| **Conversiones** | 3 | `/conversion/tabla`, `/conversion/pesos-a-utm`, `/conversion/utm-a-pesos` |
| **Disponibilidad** | 1 | `/disponibilidad` |
| **TOTAL** | **19** | |

---

**Versión**: 1.0  
**Fecha**: 6 de Octubre, 2025  
**Autor**: Sistema Cuentas Claras  
**Estado**: ✅ COMPLETO Y FUNCIONAL
