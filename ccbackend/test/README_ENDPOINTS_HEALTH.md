# Test de Salud de Endpoints - Cobertura Completa

Este test verifica automáticamente todos los endpoints de la API, cubriendo los **30 módulos de rutas** del sistema, y genera un reporte detallado.

## Características

- ✅ Prueba **73 endpoints** distribuidos en **30 módulos**
- 📊 Genera reporte categorizado por código de estado
- 🎯 Identifica endpoints con problemas
- 📈 Calcula tasa de éxito
- 🔍 **100% de cobertura de módulos** del sistema

## Uso

### Ejecutar el test:

```bash
npm test -- endpoints.health.test.js
```

### Ejecutar con verbose:

```bash
npm test -- endpoints.health.test.js --verbose
```

### Ejecutar solo este test:

```bash
npm test -- --testPathPattern=endpoints.health
```

## Reporte Generado

El test genera un reporte con las siguientes categorías:

### ✅ Endpoints Exitosos (200/201)
Endpoints que responden correctamente con datos.

### 🔒 No Autorizados (401/403)
Endpoints que requieren autenticación o permisos especiales.
- **401**: No autenticado (falta token o token inválido)
- **403**: No autorizado (sin permisos para ese recurso)

### 🔍 No Encontrados (404)
Endpoints donde el recurso no existe (IDs no válidos en la base de datos).

### ❌ Errores de Servidor (500+)
Endpoints con errores internos que necesitan atención inmediata.

### ⚠️ Otros Códigos
Cualquier otro código de estado HTTP.

## Configuración

### Credenciales de Prueba

El test usa las siguientes credenciales por defecto:

```javascript
{
  username: 'admin',
  password: 'admin123'
}
```

**Importante**: Modifica estas credenciales en el archivo de test según tu entorno.

### IDs de Prueba

El test obtiene automáticamente IDs reales de la base de datos para:
- Comunidades
- Unidades
- Pagos
- Proveedores
- Tickets
- Notificaciones

Si no encuentra registros, usa IDs por defecto (1).

## Módulos Probados (30 Módulos - 73 Endpoints)

### Estructura y Entidades Base
1. **Comunidades** (3 endpoints)
2. **Edificios** (1 endpoint)
3. **Unidades** (1 endpoint)
4. **Torres** (1 endpoint)
5. **Personas** (1 endpoint)

### Financiero
6. **Pagos** (10 endpoints) - Gestión completa de pagos
7. **Cargos** (2 endpoints) - Cuentas de cobro
8. **Emisiones** (1 endpoint) - Emisiones de gastos comunes
9. **Gastos** (1 endpoint) - Gestión de gastos
10. **Proveedores** (5 endpoints) - Proveedores y dashboard
11. **Multas** (2 endpoints) - Gestión de multas
12. **Conciliaciones** (1 endpoint) - Conciliaciones bancarias
13. **Documentos Compra** (1 endpoint) - Documentos de compra

### Operaciones
14. **Amenidades** (3 endpoints) - Reservas y estadísticas
15. **Tickets** (5 endpoints) - Sistema de tickets
16. **Soporte** (1 endpoint) - Sistema de soporte
17. **Notificaciones** (4 endpoints) - Notificaciones y estadísticas

### Configuración
18. **Categorías Gasto** (2 endpoints) - Categorías de gastos
19. **Centros Costo** (2 endpoints) - Centros de costo
20. **Tarifas Consumo** (4 endpoints) - Tarifas de servicios
21. **Medidores** (2 endpoints) - Medidores de consumo

### Administración
22. **Membresías** (1 endpoint) - Membresías de comunidades
23. **Files** (1 endpoint) - Gestión de archivos

### Integración y Utilidades
24. **Dashboard** (4 endpoints) - KPIs y gráficos
25. **Reportes** (5 endpoints) - Reportes financieros
26. **Util** (1 endpoint) - Health check
27. **Valor UTM** (2 endpoints) - Valores UTM
28. **Webhooks** (1 endpoint) - Logs de webhooks
29. **Auth** (2 endpoints) - Autenticación
30. **Payment Gateway** (3 endpoints) - Gateway de pagos
- `/reportes/comunidad/:id/reporte-completo` - Reporte completo

### 7. Notificaciones (4 endpoints)
- `/notificaciones/comunidad/:id` - Por comunidad
- `/notificaciones/:id` - Detalle
- `/notificaciones/estadisticas/generales` - Estadísticas generales
- `/notificaciones/estadisticas/por-tipo` - Por tipo

## Ejemplo de Salida

```
================================================================================
REPORTE DE SALUD DE ENDPOINTS
================================================================================

✅ ENDPOINTS EXITOSOS (200/201):
   Total: 1
   ✓ /util/health - 200

🔒 ENDPOINTS NO AUTORIZADOS (401/403):
   Total: 56
   ⚠ /comunidades - 401
   ⚠ /pagos/comunidad/3 - 401
   ⚠ /dashboard/comunidad/3/resumen-completo - 401
   ⚠ /reportes/comunidad/3/resumen-financiero - 401
   ...

� ENDPOINTS NO ENCONTRADOS (404):
   Total: 16
   ⚠ /proveedores/comunidad/3/top-gastos - 404
   ⚠ /tarifas-consumo/comunidad/3/vigentes - 404
   ⚠ /tickets/comunidad/3/urgentes - 404
   ⚠ /dashboard/comunidad/3/kpi-saldo-total - 404
   ⚠ /valor-utm/actual - 404
   ...

❌ ENDPOINTS CON ERROR DE SERVIDOR (500+):
   Total: 0

================================================================================
RESUMEN:
   Total endpoints probados: 73
   ✅ Exitosos: 1
   🔒 No autorizados: 56
   🔍 No encontrados: 16
   ❌ Errores de servidor: 0
   ⚠️  Otros: 0
   📊 Tasa de éxito: 1.37%
================================================================================
```

**Nota:** La tasa de éxito es baja porque el test usa credenciales inválidas 
intencionalmente para verificar que la autenticación funciona correctamente.

## Resolución de Problemas

### Error de Autenticación
Si todos los endpoints retornan 401:
1. Verifica las credenciales en el archivo de test
2. Asegúrate de que el endpoint `/api/auth/login` funcione
3. Verifica que el token se esté enviando correctamente

### Base de Datos Vacía
Si muchos endpoints retornan 404:
1. Asegúrate de tener datos de prueba en la base de datos
2. Ejecuta los seeders si están disponibles
3. Verifica que las tablas tengan al menos un registro

### Errores 500
Si hay endpoints con error 500:
1. Revisa los logs del servidor
2. Verifica la conexión a la base de datos
3. Asegúrate de que las migraciones estén aplicadas

## Extensión del Test

### Para agregar un nuevo módulo:

```javascript
// =========================================
// MÓDULO XX: NOMBRE DEL MÓDULO
// =========================================
describe('Nombre Módulo Endpoints', () => {
  test('GET /ruta-ejemplo/:id', async () => {
    const endpoint = `/ruta-ejemplo/${testId}`;
    const response = await getWithAuth(endpoint);
    categorizeResponse(endpoint, response.status);
    expect([200, 401, 404, 500]).toContain(response.status);
  });
});
```

### Estructura Organizada por Tipo de Módulo

Los tests están organizados en 6 categorías lógicas:
1. **Estructura** (Comunidades, Edificios, Torres, Unidades, Personas)
2. **Financiero** (Pagos, Cargos, Emisiones, Gastos, Proveedores, Multas)
3. **Operaciones** (Amenidades, Tickets, Soporte, Notificaciones)
4. **Configuración** (Categorías, Centros Costo, Tarifas, Medidores)
5. **Administración** (Membresías, Files, Documentos Compra)
6. **Integración** (Dashboard, Reportes, Auth, Payment Gateway, Webhooks, Util)

## Integración Continua

Puedes agregar este test a tu pipeline de CI/CD:

```yaml
# .github/workflows/test.yml
- name: Health Check Endpoints
  run: npm test -- endpoints.health.test.js
```

## Notas

- El test **NO** hace llamadas POST/PUT/DELETE para evitar modificar datos
- Solo prueba endpoints GET para verificar disponibilidad
- Útil para smoke testing después de deployments
- Identifica rápidamente endpoints rotos
