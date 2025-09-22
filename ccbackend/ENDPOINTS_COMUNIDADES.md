# ENDPOINTS DE COMUNIDADES - API BACKEND

## 📋 Resumen de Endpoints Disponibles

### **Endpoints Básicos CRUD**
- `GET /api/comunidades` - Lista comunidades con estadísticas
- `GET /api/comunidades/:id` - Detalle completo de una comunidad
- `POST /api/comunidades` - Crear nueva comunidad
- `PATCH /api/comunidades/:id` - Actualizar comunidad
- `DELETE /api/comunidades/:id` - Eliminar comunidad

### **Endpoints Específicos para Datos Relacionados**
- `GET /api/comunidades/:id/amenidades` - Amenidades de la comunidad
- `GET /api/comunidades/:id/edificios` - Edificios de la comunidad
- `GET /api/comunidades/:id/contactos` - Contactos de la comunidad
- `GET /api/comunidades/:id/documentos` - Documentos de la comunidad
- `GET /api/comunidades/:id/residentes` - Residentes de la comunidad
- `GET /api/comunidades/:id/parametros` - Parámetros de cobranza
- `GET /api/comunidades/:id/estadisticas` - Estadísticas financieras
- `GET /api/comunidades/:id/flujo-caja` - Flujo de caja últimos 6 meses

---

## 🔗 **Detalle de Endpoints**

### 1. **Lista de Comunidades con Estadísticas**
```
GET /api/comunidades
```

**Query Parameters:**
- `nombre` (opcional): Filtrar por nombre de comunidad
- `direccion` (opcional): Filtrar por dirección

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Condominio Las Palmas",
    "rut": "12345678",
    "dv": "9",
    "giro": "Administración de edificios",
    "direccion": "Av. Las Condes 1234",
    "email": "admin@laspalmas.cl",
    "telefono": "+56 9 8765 4321",
    "moneda": "CLP",
    "zona_horaria": "America/Santiago",
    "fechaCreacion": "2023-01-15T10:30:00Z",
    "fechaActualizacion": "2024-09-15T14:20:00Z",
    "totalUnidades": 48,
    "unidadesActivas": 46,
    "totalResidentes": 132,
    "saldoPendiente": 2450000,
    "ingresosMensuales": 8500000,
    "gastosMensuales": 7200000
  }
]
```

### 2. **Detalle Completo de Comunidad**
```
GET /api/comunidades/:id
```

**Response:**
```json
{
  "id": 1,
  "nombre": "Condominio Las Palmas",
  "rut": "12345678",
  "dv": "9",
  "giro": "Administración de edificios",
  "direccion": "Av. Las Condes 1234",
  "email": "admin@laspalmas.cl",
  "telefono": "+56 9 8765 4321",
  "moneda": "CLP",
  "zona_horaria": "America/Santiago",
  "politica_mora_json": "{...}",
  "fechaCreacion": "2023-01-15T10:30:00Z",
  "fechaActualizacion": "2024-09-15T14:20:00Z",
  "totalUnidades": 48,
  "unidadesActivas": 46,
  "totalResidentes": 132,
  "totalEdificios": 2,
  "totalAmenidades": 5,
  "saldoPendiente": 2450000
}
```

### 3. **Amenidades de la Comunidad**
```
GET /api/comunidades/:id/amenidades
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Piscina",
    "descripcion": "Horario de 6:00 a 22:00",
    "estado": "Disponible",
    "horarioInicio": "06:00",
    "horarioFin": "22:00",
    "requiereReserva": false,
    "costoReserva": 0
  }
]
```

### 4. **Edificios de la Comunidad**
```
GET /api/comunidades/:id/edificios
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Torre A",
    "direccion": "Av. Las Condes 1234-A",
    "codigo": "TA",
    "fechaCreacion": "2023-01-15T10:30:00Z"
  }
]
```

### 5. **Contactos de la Comunidad**
```
GET /api/comunidades/:id/contactos
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Administración",
    "cargo": "Administrador",
    "telefono": "+56 9 8765 4321",
    "email": "admin@laspalmas.cl",
    "esContactoPrincipal": 1
  }
]
```

### 6. **Documentos de la Comunidad**
```
GET /api/comunidades/:id/documentos
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Reglamento Interno",
    "tipo": "reglamento",
    "url": "/documentos/reglamento-interno.pdf",
    "periodo": "2024",
    "visibilidad": "publico",
    "fechaSubida": "2024-01-15T10:30:00Z"
  }
]
```

### 7. **Residentes de la Comunidad**
```
GET /api/comunidades/:id/residentes
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Juan Pérez González",
    "unidad": "Torre A-101",
    "tipo": "propietario",
    "tipo_tenencia": "propietario",
    "telefono": "+56 9 1234 5678",
    "email": "juan.perez@email.com",
    "estado": "Activo"
  }
]
```

### 8. **Parámetros de Cobranza**
```
GET /api/comunidades/:id/parametros
```

**Response:**
```json
{
  "id": 1,
  "comunidadId": 1,
  "aplica_desde": "2024-01-01",
  "tasaMora": 0.02,
  "calculoInteres": "mensual",
  "interesMaximo": 50.0,
  "aplicacionInteres": "capital",
  "tipoRedondeo": "normal",
  "politicaPago": "antiguos",
  "ordenAplicacion": "interes-capital",
  "diaEmision": 5,
  "diaVencimiento": 25,
  "notificacionesAuto": 1,
  "fechaCreacion": "2024-01-01T00:00:00Z",
  "fechaActualizacion": "2024-09-15T14:20:00Z"
}
```

### 9. **Estadísticas Financieras**
```
GET /api/comunidades/:id/estadisticas
```

**Response:**
```json
{
  "totalIngresos": 8500000,
  "ingresosPagados": 6050000,
  "ingresosPendientes": 2450000,
  "serviciosBasicos": 2800000,
  "mantenimiento": 3200000,
  "administracion": 1200000
}
```

### 10. **Flujo de Caja (Últimos 6 Meses)**
```
GET /api/comunidades/:id/flujo-caja
```

**Response:**
```json
[
  {
    "mes": "2024-04",
    "ingresos": 8200000,
    "gastos": 7100000,
    "flujoNeto": 1100000
  },
  {
    "mes": "2024-05",
    "ingresos": 8350000,
    "gastos": 7250000,
    "flujoNeto": 1100000
  }
]
```

---

## 🔐 **Autenticación**

Todos los endpoints requieren autenticación Bearer Token:

```
Authorization: Bearer <tu_token_jwt>
```

---

## 🚀 **Uso en Frontend React**

### **Ejemplo de conexión desde el frontend:**

```typescript
import { comunidadesService } from '@/lib/comunidadesService';

// Obtener lista de comunidades
const comunidades = await comunidadesService.getComunidades({
  nombre: 'Las Palmas'
});

// Obtener detalle completo
const comunidad = await comunidadesService.getComunidadById(1);

// Obtener estadísticas financieras
const estadisticas = await comunidadesService.getEstadisticasByComunidad(1);

// Obtener flujo de caja
const flujoCaja = await comunidadesService.getFlujoCajaByComunidad(1);
```

---

## ✅ **Estado de Implementación**

- ✅ **Endpoints del backend**: Implementados y funcionales
- ✅ **Queries SQL**: Optimizadas y corregidas para la estructura real de BD
- ✅ **Servicio frontend**: Métodos actualizados para conectar con los endpoints
- ✅ **Tipos TypeScript**: Actualizados para soportar los nuevos filtros
- ✅ **Documentación**: Completa con ejemplos de uso

---

## 🔧 **Siguiente Paso**

Ahora puedes:
1. **Iniciar tu servidor backend** con `npm start`
2. **Probar los endpoints** con Postman o desde tu frontend React
3. **Las estadísticas reales** se reflejarán automáticamente desde la base de datos

Los datos mostrados en tu página de comunidades ahora serán **reales** y actualizados en tiempo real! 🎉