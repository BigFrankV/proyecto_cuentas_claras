# 📚 Documentación Swagger - Módulo Gastos

## 🚀 Acceder a la Documentación

Una vez que el backend esté corriendo, puedes acceder a Swagger UI en:

- **Swagger UI Principal**: http://localhost:3001/docs
- **Swagger UI Alternativo**: http://localhost:3001/api-docs
- **JSON Swagger**: http://localhost:3001/swagger.json

## 🔐 Autenticación en Swagger

### Paso 1: Obtener Token JWT

1. En Swagger UI, busca el endpoint **POST /auth/login**
2. Haz clic en "Try it out"
3. Ingresa las credenciales:
   ```json
   {
     "identifier": "admin@example.com",
     "password": "tu_password"
   }
   ```
4. Ejecuta la petición
5. Copia el `token` de la respuesta

### Paso 2: Configurar Autorización

1. Haz clic en el botón **"Authorize"** (🔒) en la parte superior de Swagger UI
2. En el campo "Value", ingresa: `Bearer {tu_token_copiado}`
   - Ejemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Haz clic en "Authorize"
4. Cierra el modal

¡Ahora todos los endpoints protegidos funcionarán!

## 📋 Endpoints de Gastos Disponibles

### 🔍 Consultas (GET)

| Endpoint | Descripción | Ejemplo |
|----------|-------------|---------|
| `GET /gastos/comunidad/{comunidadId}` | Listar gastos con filtros | `/gastos/comunidad/1?estado=aprobado&page=1&limit=20` |
| `GET /gastos/comunidad/{comunidadId}/stats` | Estadísticas del dashboard | `/gastos/comunidad/1/stats` |
| `GET /gastos/{id}` | Detalle completo de un gasto | `/gastos/123` |
| `GET /gastos/{id}/historial` | Historial de cambios | `/gastos/123/historial` |
| `GET /gastos/{id}/aprobaciones` | Historial de aprobaciones | `/gastos/123/aprobaciones` |
| `GET /gastos/{id}/archivos` | Archivos adjuntos | `/gastos/123/archivos` |
| `GET /gastos/{id}/emisiones` | Emisiones donde está incluido | `/gastos/123/emisiones` |

### 📊 Reportes (GET)

| Endpoint | Descripción |
|----------|-------------|
| `GET /gastos/comunidad/{comunidadId}/por-categoria` | Gastos agrupados por categoría |
| `GET /gastos/comunidad/{comunidadId}/por-proveedor` | Gastos agrupados por proveedor |
| `GET /gastos/comunidad/{comunidadId}/por-centro-costo` | Gastos agrupados por centro de costo |
| `GET /gastos/comunidad/{comunidadId}/evolucion-temporal` | Evolución mes a mes |
| `GET /gastos/comunidad/{comunidadId}/top-gastos` | Top 10 gastos mayores |
| `GET /gastos/comunidad/{comunidadId}/pendientes-aprobacion` | Pendientes de aprobación |
| `GET /gastos/comunidad/{comunidadId}/alertas` | Alertas de gastos |

### ✏️ Operaciones (POST/PUT/DELETE)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gastos/comunidad/{comunidadId}` | POST | Crear nuevo gasto |
| `/gastos/{id}` | PUT | Actualizar gasto |
| `/gastos/{id}` | DELETE | Eliminar gasto (solo borradores) |
| `/gastos/{id}/aprobaciones` | POST | Aprobar/Rechazar gasto |
| `/gastos/{id}/anular` | POST | Anular gasto |

## 🧪 Ejemplos de Pruebas

### 1. Listar Gastos con Filtros

**Endpoint:** `GET /gastos/comunidad/1`

**Query Parameters:**
```
page=1
limit=20
estado=aprobado
fechaDesde=2024-01-01
fechaHasta=2024-12-31
ordenar=monto
direccion=DESC
```

**URL Completa:**
```
http://localhost:3001/api/gastos/comunidad/1?page=1&limit=20&estado=aprobado&fechaDesde=2024-01-01&fechaHasta=2024-12-31&ordenar=monto&direccion=DESC
```

### 2. Crear Nuevo Gasto

**Endpoint:** `POST /gastos/comunidad/1`

**Body:**
```json
{
  "categoria_id": 5,
  "centro_costo_id": 3,
  "fecha": "2024-01-15",
  "monto": 150000.50,
  "glosa": "Mantenimiento mensual de ascensores",
  "extraordinario": false
}
```

### 3. Obtener Estadísticas

**Endpoint:** `GET /gastos/comunidad/1/stats`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "total_gastos": 150,
      "borradores": 5,
      "pendientes": 10,
      "aprobados": 120,
      "rechazados": 3,
      "pagados": 100,
      "anulados": 2,
      "monto_total": 15000000,
      "monto_mes_actual": 1200000,
      "monto_anio_actual": 15000000,
      "monto_extraordinarios": 500000
    }
  }
}
```

### 4. Aprobar Gasto

**Endpoint:** `POST /gastos/123/aprobaciones`

**Body:**
```json
{
  "decision": "aprobado",
  "observaciones": "Aprobado conforme a presupuesto",
  "monto_aprobado": 150000.50
}
```

### 5. Rechazar Gasto

**Endpoint:** `POST /gastos/123/aprobaciones`

**Body:**
```json
{
  "decision": "rechazado",
  "observaciones": "Monto excede el presupuesto aprobado"
}
```

### 6. Actualizar Gasto

**Endpoint:** `PUT /gastos/123`

**Body (enviar solo los campos a actualizar):**
```json
{
  "monto": 180000,
  "glosa": "Mantenimiento mensual de ascensores - Actualizado"
}
```

### 7. Anular Gasto

**Endpoint:** `POST /gastos/123/anular`

**Body:**
```json
{
  "motivo": "Error en el monto registrado, se debe crear nuevo gasto"
}
```

### 8. Buscar Gastos

**Endpoint:** `GET /gastos/comunidad/1`

**Query Parameters:**
```
busqueda=ascensor
page=1
limit=10
```

**Buscará en:**
- Glosa del gasto
- Nombre de categoría
- Número de gasto
- Nombre del creador

## 🎯 Filtros Disponibles

### Estado del Gasto
- `borrador` - Gasto creado pero no enviado
- `pendiente` - Esperando aprobación
- `aprobado` - Aprobado por los responsables
- `rechazado` - Rechazado
- `pagado` - Ya fue pagado
- `anulado` - Anulado por algún motivo

### Ordenamiento
Campos disponibles para `ordenar`:
- `fecha` - Fecha del gasto
- `monto` - Monto del gasto
- `created_at` - Fecha de creación
- `numero` - Número correlativo
- `estado` - Estado del gasto

Dirección (`direccion`):
- `ASC` - Ascendente
- `DESC` - Descendente (por defecto)

## 🔒 Permisos Requeridos

| Acción | Permiso | Roles Permitidos |
|--------|---------|------------------|
| Listar gastos | `read` | Todos los roles |
| Ver detalle | `read` | Todos los roles |
| Crear gasto | `create` | Admin, Comité, Contador |
| Actualizar gasto | `update` | Admin, Comité, Contador |
| Eliminar gasto | `delete` | Admin, Comité |
| Aprobar gasto | `approve` | Admin, Comité |
| Anular gasto | `cancel` | Admin |

## 📝 Notas Importantes

### Restricciones de Edición
- Solo se pueden **editar** gastos en estado `borrador` o `pendiente`
- Solo se pueden **eliminar** gastos en estado `borrador`
- No se pueden **anular** gastos incluidos en emisiones cerradas

### Número Correlativo
- Se genera automáticamente al crear un gasto
- Formato: `G{AÑO}-{NÚMERO}`
- Ejemplo: `G2024-0001`, `G2024-0002`, etc.

### Aprobaciones Automáticas
El sistema calcula automáticamente las aprobaciones requeridas según el monto:
- Montos pequeños: 1 aprobación
- Montos medianos: 2 aprobaciones
- Montos grandes: 3 aprobaciones

### Comunidad ID = 0
Solo para **superadmin**:
- `comunidadId = 0` en endpoints de listado/stats muestra datos de TODAS las comunidades
- Útil para reportes globales y administración central

## 🐛 Solución de Problemas

### Error 401 (No autorizado)
- **Causa**: Token JWT inválido o expirado
- **Solución**: 
  1. Hacer login nuevamente en `/auth/login`
  2. Copiar el nuevo token
  3. Actualizar en "Authorize"

### Error 403 (Prohibido)
- **Causa**: Tu rol no tiene permisos para esta acción
- **Solución**: Verificar que tu usuario tenga el rol adecuado

### Error 404 (No encontrado)
- **Causa**: El gasto o recurso no existe
- **Solución**: Verificar el ID del gasto

### Error 400 (Datos inválidos)
- **Causa**: Los datos enviados no cumplen las validaciones
- **Solución**: Revisar el mensaje de error y corregir los datos

## 🔄 Workflow Típico

### Flujo de Creación y Aprobación

```
1. Crear Gasto (POST /gastos/comunidad/{id})
   └─> Estado: borrador

2. Actualizar si es necesario (PUT /gastos/{id})
   └─> Estado: borrador o pendiente

3. Primera Aprobación (POST /gastos/{id}/aprobaciones)
   └─> Estado: pendiente_aprobacion

4. Segunda Aprobación (POST /gastos/{id}/aprobaciones)
   └─> Estado: aprobado

5. Marcar como Pagado (sistema externo)
   └─> Estado: pagado

6. Si hay error, Anular (POST /gastos/{id}/anular)
   └─> Estado: anulado
```

## 📊 Ejemplos de Reportes

### Evolución Temporal (últimos 6 meses)
```
GET /gastos/comunidad/1/evolucion-temporal?meses=6
```

### Top 10 Gastos del Año
```
GET /gastos/comunidad/1/top-gastos?fechaDesde=2024-01-01&fechaHasta=2024-12-31&limite=10
```

### Gastos por Categoría (trimestre actual)
```
GET /gastos/comunidad/1/por-categoria?fechaDesde=2024-10-01&fechaHasta=2024-12-31
```

### Alertas de Gastos
```
GET /gastos/comunidad/1/alertas
```

Retorna:
- Pendientes de aprobación
- Vencidos sin aprobar (más de 30 días)
- Aprobados sin documento adjunto

## 🎨 Testing con Postman

Si prefieres usar Postman en lugar de Swagger:

1. Importa la colección desde: `/swagger.json`
2. Crea una variable de entorno `base_url` = `http://localhost:3001/api`
3. Crea una variable `token` para el JWT
4. Agrega en Headers: `Authorization: Bearer {{token}}`

## ✅ Checklist de Pruebas

- [ ] Login y obtención de token
- [ ] Listar gastos de una comunidad
- [ ] Ver estadísticas del dashboard
- [ ] Ver detalle de un gasto específico
- [ ] Crear nuevo gasto en borrador
- [ ] Actualizar gasto creado
- [ ] Ver historial de cambios
- [ ] Aprobar gasto (primera aprobación)
- [ ] Aprobar gasto (segunda aprobación, si aplica)
- [ ] Ver historial de aprobaciones
- [ ] Rechazar un gasto
- [ ] Consultar gastos por categoría
- [ ] Consultar evolución temporal
- [ ] Consultar top gastos
- [ ] Consultar gastos pendientes
- [ ] Consultar alertas
- [ ] Anular un gasto
- [ ] Eliminar un gasto en borrador

---

**📞 ¿Problemas con la API?**

Revisa los logs del backend en la terminal donde está corriendo el servidor. Los errores se registran con detalles completos.

**🚀 ¡Listo para probar!**

Inicia el backend con `npm start` y abre http://localhost:3001/docs
