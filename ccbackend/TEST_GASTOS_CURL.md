# 🧪 Scripts de Prueba - API Gastos

## Variables de Entorno

```bash
# Configurar variables
export API_URL="http://localhost:3001"
export COMUNIDAD_ID="1"
```

## 1️⃣ Autenticación

### Login y Obtener Token

```bash
# Login
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@example.com",
    "password": "your_password"
  }'

# Guardar el token en variable
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 2️⃣ Consultas Básicas

### Listar Gastos (Paginado)

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Listar con Filtros

```bash
# Gastos aprobados del mes actual
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID?estado=aprobado&fechaDesde=2024-01-01&fechaHasta=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# Buscar por texto
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID?busqueda=ascensor" \
  -H "Authorization: Bearer $TOKEN"

# Ordenar por monto descendente
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID?ordenar=monto&direccion=DESC" \
  -H "Authorization: Bearer $TOKEN"
```

### Estadísticas del Dashboard

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/stats" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Detalle de un Gasto

```bash
export GASTO_ID="123"

curl -X GET "$API_URL/gastos/$GASTO_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## 3️⃣ Reportes y Análisis

### Gastos por Categoría

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/por-categoria" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Con filtro de fechas
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/por-categoria?fechaDesde=2024-01-01&fechaHasta=2024-12-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Gastos por Proveedor

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/por-proveedor?limite=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Gastos por Centro de Costo

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/por-centro-costo" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Evolución Temporal (últimos 12 meses)

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/evolucion-temporal?meses=12" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Top 10 Gastos Mayores

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/top-gastos?limite=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Gastos Pendientes de Aprobación

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/pendientes-aprobacion" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Alertas de Gastos

```bash
curl -X GET "$API_URL/gastos/comunidad/$COMUNIDAD_ID/alertas" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## 4️⃣ Historial y Auditoría

### Historial de Cambios

```bash
curl -X GET "$API_URL/gastos/$GASTO_ID/historial" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Historial de Aprobaciones

```bash
curl -X GET "$API_URL/gastos/$GASTO_ID/aprobaciones" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Archivos Adjuntos

```bash
curl -X GET "$API_URL/gastos/$GASTO_ID/archivos" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Emisiones Relacionadas

```bash
curl -X GET "$API_URL/gastos/$GASTO_ID/emisiones" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## 5️⃣ Operaciones CRUD

### Crear Gasto

```bash
curl -X POST "$API_URL/gastos/comunidad/$COMUNIDAD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 5,
    "centro_costo_id": 3,
    "fecha": "2024-01-15",
    "monto": 150000.50,
    "glosa": "Mantenimiento mensual de ascensores",
    "extraordinario": false
  }' | jq .
```

### Crear Gasto Extraordinario

```bash
curl -X POST "$API_URL/gastos/comunidad/$COMUNIDAD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 8,
    "fecha": "2024-01-20",
    "monto": 2500000,
    "glosa": "Reparación urgente de tubería principal",
    "extraordinario": true
  }' | jq .
```

### Actualizar Gasto

```bash
curl -X PUT "$API_URL/gastos/$GASTO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 180000,
    "glosa": "Mantenimiento mensual de ascensores - Actualizado"
  }' | jq .
```

### Eliminar Gasto (solo borradores)

```bash
curl -X DELETE "$API_URL/gastos/$GASTO_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## 6️⃣ Aprobaciones

### Aprobar Gasto

```bash
curl -X POST "$API_URL/gastos/$GASTO_ID/aprobaciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "aprobado",
    "observaciones": "Aprobado conforme a presupuesto",
    "monto_aprobado": 150000.50
  }' | jq .
```

### Rechazar Gasto

```bash
curl -X POST "$API_URL/gastos/$GASTO_ID/aprobaciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "rechazado",
    "observaciones": "Monto excede el presupuesto aprobado. Favor revisar."
  }' | jq .
```

### Anular Gasto

```bash
curl -X POST "$API_URL/gastos/$GASTO_ID/anular" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "motivo": "Error en el monto registrado, se debe crear nuevo gasto"
  }' | jq .
```

## 7️⃣ Scripts de Testing Completo

### Test Suite Completo

```bash
#!/bin/bash

echo "🧪 Iniciando test suite completo de API Gastos"
echo "=============================================="

# 1. Login
echo "\n1️⃣ Autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@example.com","password":"your_password"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 2. Listar gastos
echo "\n2️⃣ Listando gastos..."
curl -s -X GET "$API_URL/gastos/comunidad/1?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, numero, glosa, monto, estado}'

# 3. Estadísticas
echo "\n3️⃣ Obteniendo estadísticas..."
curl -s -X GET "$API_URL/gastos/comunidad/1/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.resumen'

# 4. Crear gasto
echo "\n4️⃣ Creando nuevo gasto..."
NEW_GASTO=$(curl -s -X POST "$API_URL/gastos/comunidad/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 5,
    "fecha": "2024-01-15",
    "monto": 150000,
    "glosa": "Test de API - Mantenimiento"
  }')

GASTO_ID=$(echo $NEW_GASTO | jq -r '.data.id')
echo "✅ Gasto creado con ID: $GASTO_ID"

# 5. Ver detalle
echo "\n5️⃣ Consultando detalle del gasto..."
curl -s -X GET "$API_URL/gastos/$GASTO_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.gasto | {id, numero, glosa, monto, estado}'

# 6. Actualizar gasto
echo "\n6️⃣ Actualizando gasto..."
curl -s -X PUT "$API_URL/gastos/$GASTO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"monto": 175000}' | jq '.data | {id, numero, monto}'

# 7. Ver historial
echo "\n7️⃣ Consultando historial de cambios..."
curl -s -X GET "$API_URL/gastos/$GASTO_ID/historial" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {field, oldValue, newValue, changedAt}'

# 8. Reportes
echo "\n8️⃣ Consultando reportes..."
echo "Por categoría:"
curl -s -X GET "$API_URL/gastos/comunidad/1/por-categoria" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0:3] | .[] | {categoryName, expenseCount, totalAmount}'

echo "\nTop gastos:"
curl -s -X GET "$API_URL/gastos/comunidad/1/top-gastos?limite=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {numero, description, amount}'

echo "\n✅ Test suite completado exitosamente!"
```

### Guardar script como test-gastos.sh

```bash
chmod +x test-gastos.sh
./test-gastos.sh
```

## 8️⃣ Pruebas con PowerShell (Windows)

```powershell
# Variables
$API_URL = "http://localhost:3001"
$COMUNIDAD_ID = "1"

# Login
$loginBody = @{
    identifier = "admin@example.com"
    password = "your_password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$TOKEN = $response.token

# Headers con token
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Listar gastos
Invoke-RestMethod -Uri "$API_URL/gastos/comunidad/$COMUNIDAD_ID" -Method Get -Headers $headers

# Estadísticas
Invoke-RestMethod -Uri "$API_URL/gastos/comunidad/$COMUNIDAD_ID/stats" -Method Get -Headers $headers

# Crear gasto
$gastoBody = @{
    categoria_id = 5
    fecha = "2024-01-15"
    monto = 150000
    glosa = "Test desde PowerShell"
} | ConvertTo-Json

$newGasto = Invoke-RestMethod -Uri "$API_URL/gastos/comunidad/$COMUNIDAD_ID" -Method Post -Headers $headers -Body $gastoBody
$GASTO_ID = $newGasto.data.id

Write-Host "Gasto creado con ID: $GASTO_ID"
```

## 9️⃣ Validaciones y Errores

### Probar validaciones de campos

```bash
# Error: monto debe ser mayor a 0
curl -X POST "$API_URL/gastos/comunidad/$COMUNIDAD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 5,
    "fecha": "2024-01-15",
    "monto": 0,
    "glosa": "Test"
  }'

# Error: glosa muy corta
curl -X POST "$API_URL/gastos/comunidad/$COMUNIDAD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 5,
    "fecha": "2024-01-15",
    "monto": 100000,
    "glosa": "ab"
  }'

# Error: fecha inválida
curl -X POST "$API_URL/gastos/comunidad/$COMUNIDAD_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoria_id": 5,
    "fecha": "2024-13-45",
    "monto": 100000,
    "glosa": "Test validación"
  }'
```

## 🔟 Performance Testing

### Test de carga simple

```bash
# Instalar apache bench
# Ubuntu: sudo apt-get install apache2-utils
# Mac: viene incluido

# 100 requests, 10 concurrentes
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/gastos/comunidad/1?page=1&limit=20"

# Ver estadísticas de tiempo de respuesta
```

---

## 📝 Notas

- **jq**: Herramienta para formatear JSON. Instalar con `brew install jq` (Mac) o `apt install jq` (Linux)
- **TOKEN**: Reemplazar con tu token real obtenido del login
- **IDs**: Reemplazar los IDs de ejemplo (123, 1, etc.) con IDs reales de tu base de datos

## ✅ Checklist de Pruebas

Marca las pruebas completadas:

- [ ] Login exitoso y token obtenido
- [ ] Listar gastos con paginación
- [ ] Listar gastos con filtros (estado, fecha, búsqueda)
- [ ] Obtener estadísticas del dashboard
- [ ] Ver detalle completo de un gasto
- [ ] Crear nuevo gasto
- [ ] Actualizar gasto existente
- [ ] Ver historial de cambios
- [ ] Ver historial de aprobaciones
- [ ] Aprobar un gasto
- [ ] Rechazar un gasto
- [ ] Consultar gastos por categoría
- [ ] Consultar gastos por proveedor
- [ ] Consultar evolución temporal
- [ ] Consultar top gastos
- [ ] Consultar pendientes de aprobación
- [ ] Consultar alertas
- [ ] Anular un gasto
- [ ] Eliminar un gasto (borrador)
- [ ] Validar errores (campos inválidos)
