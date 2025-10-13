# 🧪 Guía de Pruebas - Módulo Gastos

## 🎯 Objetivo
Esta guía te ayudará a probar todos los endpoints conectados del módulo de gastos y verificar que la integración frontend-backend funciona correctamente.

---

## 📋 Pre-requisitos

1. **Backend corriendo:** `http://localhost:3001`
2. **Frontend corriendo:** `http://localhost:3000`
3. **Base de datos:** MySQL con datos de prueba cargados
4. **Usuario autenticado:** Token JWT válido

---

## 🔐 Autenticación

### Obtener Token
```bash
# Desde Swagger UI
1. Ir a http://localhost:3001/docs
2. Probar endpoint POST /auth/login
3. Usar credenciales de prueba
4. Copiar el token recibido

# O desde curl:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pquintanilla","password":"tu_password"}'
```

---

## 🧪 Tests por Funcionalidad

### 1. Listado de Gastos ✅

#### Test 1.1: Listar todos los gastos
```bash
Navegación: http://localhost:3000/gastos

Verificar:
✓ Se muestra la tabla con gastos
✓ Aparecen las estadísticas en el header
✓ Los botones "Reportes", "Filtros" y "Nuevo Gasto" están visibles
✓ La paginación funciona correctamente
```

#### Test 1.2: Aplicar filtros
```bash
Navegación: http://localhost:3000/gastos

Pasos:
1. Click en botón "Filtros"
2. Seleccionar estado: "pendiente"
3. Seleccionar fecha desde: 2025-01-01
4. Click fuera del panel de filtros

Verificar:
✓ Solo se muestran gastos pendientes
✓ Solo se muestran gastos después de la fecha
✓ El contador de filtros activos se actualiza
✓ Los resultados se actualizan sin recargar la página
```

#### Test 1.3: Búsqueda por texto
```bash
Navegación: http://localhost:3000/gastos

Pasos:
1. Click en botón "Filtros"
2. Escribir en el campo "Buscar": "Aseo"
3. Presionar Enter

Verificar:
✓ Solo se muestran gastos con "Aseo" en la descripción
✓ La búsqueda no es case-sensitive
✓ Los resultados se actualizan instantáneamente
```

#### Test 1.4: Cambiar vista
```bash
Navegación: http://localhost:3000/gastos

Pasos:
1. Click en icono "Grid" (vista de tarjetas)
2. Verificar vista de tarjetas
3. Click en icono "Table" (vista de tabla)

Verificar:
✓ La vista cambia entre tabla y tarjetas
✓ Los datos son los mismos en ambas vistas
✓ La selección se mantiene
```

---

### 2. Crear Nuevo Gasto ✅

#### Test 2.1: Crear gasto básico
```bash
Navegación: http://localhost:3000/gastos/nuevo

Pasos:
1. Llenar campos obligatorios:
   - Descripción: "Mantenimiento de Ascensor"
   - Categoría: "Mantenimiento"
   - Proveedor: "Ascensores Up"
   - Monto: "150000"
   - Fecha: "2025-10-15"
2. Click en "Guardar Gasto"

Verificar:
✓ Validación funciona correctamente
✓ Mensaje de éxito aparece
✓ Redirige a página de detalle del gasto creado
✓ Los datos se muestran correctamente
```

#### Test 2.2: Validación de formulario
```bash
Navegación: http://localhost:3000/gastos/nuevo

Pasos:
1. Intentar guardar sin llenar campos
2. Llenar descripción con solo 2 caracteres
3. Llenar monto con 0
4. Intentar guardar

Verificar:
✓ Muestra errores debajo de cada campo
✓ No permite guardar con errores
✓ Errores desaparecen al corregir campos
```

#### Test 2.3: Subir archivos
```bash
Navegación: http://localhost:3000/gastos/nuevo

Pasos:
1. Llenar formulario básico
2. Arrastrar archivo PDF al área de "Archivos Adjuntos"
3. Verificar que aparece en la lista
4. Intentar subir archivo > 10MB
5. Intentar subir archivo .exe

Verificar:
✓ Archivos PDF/JPG/PNG se aceptan
✓ Archivos grandes se rechazan con mensaje
✓ Archivos no permitidos se rechazan
✓ Se puede eliminar archivo antes de guardar
✓ Drag & drop funciona correctamente
```

---

### 3. Ver Detalle de Gasto ✅

#### Test 3.1: Ver información completa
```bash
Navegación: http://localhost:3000/gastos/1

Verificar:
✓ Se muestra toda la información del gasto
✓ Aparece el estado con badge de color
✓ Se muestran las fechas formateadas
✓ El monto se muestra en formato CLP
✓ Información de categoría y centro de costo visible
```

#### Test 3.2: Ver historial de cambios
```bash
Navegación: http://localhost:3000/gastos/1

Scroll hasta sección "Historial de Cambios"

Verificar:
✓ Se listan todos los cambios realizados
✓ Cada cambio muestra usuario, fecha y tipo
✓ Los valores anteriores y nuevos son visibles
✓ El historial está ordenado por fecha (más reciente primero)
```

#### Test 3.3: Ver aprobaciones
```bash
Navegación: http://localhost:3000/gastos/1

Verificar sección "Proceso de Aprobación":
✓ Se muestran todas las aprobaciones
✓ Cada aprobación muestra usuario, rol, estado
✓ Los comentarios son visibles
✓ El timeline visual es claro
```

#### Test 3.4: Ver archivos adjuntos
```bash
Navegación: http://localhost:3000/gastos/1

Verificar sección "Archivos Adjuntos":
✓ Se listan todos los archivos
✓ Se muestra el tamaño del archivo
✓ Se muestra el tipo de archivo (icon)
✓ Se puede descargar el archivo (click)
```

#### Test 3.5: Ver emisiones relacionadas
```bash
Navegación: http://localhost:3000/gastos/1

Verificar sección "Emisiones Relacionadas":
✓ Se listan las emisiones donde está incluido el gasto
✓ Se muestra el periodo y año
✓ Se muestra el monto distribuido
✓ Se puede navegar a la emisión (si hay link)
```

---

### 4. Aprobar/Rechazar Gasto ✅

#### Test 4.1: Aprobar gasto
```bash
Navegación: http://localhost:3000/gastos/1
(Asegurarse que el gasto esté en estado "pendiente")

Pasos:
1. Click en botón "Aprobar"
2. Escribir comentario: "Aprobado por gestión operacional"
3. Click en "Aprobar" en el modal

Verificar:
✓ Modal de confirmación aparece
✓ Se puede agregar comentario opcional
✓ Mensaje de éxito aparece
✓ Estado del gasto cambia a "aprobado"
✓ Se agrega entrada en historial de aprobaciones
✓ La página se actualiza automáticamente
```

#### Test 4.2: Rechazar gasto
```bash
Navegación: http://localhost:3000/gastos/2
(Asegurarse que el gasto esté en estado "pendiente")

Pasos:
1. Click en botón "Rechazar"
2. Escribir motivo: "Falta documentación de respaldo"
3. Click en "Rechazar" en el modal

Verificar:
✓ Modal de confirmación aparece
✓ El motivo es obligatorio
✓ Mensaje de éxito/información aparece
✓ Estado del gasto cambia a "rechazado"
✓ Se registra en historial con motivo
```

---

### 5. Editar Gasto ✅

#### Test 5.1: Editar campos básicos
```bash
Navegación: http://localhost:3000/gastos/editar/1

Pasos:
1. Cambiar descripción
2. Cambiar monto
3. Cambiar categoría
4. Click en "Actualizar Gasto"

Verificar:
✓ Formulario se carga con datos actuales
✓ Se puede editar todos los campos permitidos
✓ Validación funciona correctamente
✓ Mensaje de éxito aparece
✓ Cambios se reflejan en la vista de detalle
✓ Se registra en historial de cambios
```

#### Test 5.2: Gestionar archivos existentes
```bash
Navegación: http://localhost:3000/gastos/editar/1

Pasos:
1. Ver lista de archivos existentes
2. Click en "X" para eliminar un archivo
3. Confirmar eliminación
4. Agregar nuevo archivo
5. Guardar cambios

Verificar:
✓ Se listan archivos actuales
✓ Se puede eliminar archivo existente
✓ Confirmación antes de eliminar
✓ Se puede agregar nuevos archivos
✓ Los cambios persisten después de guardar
```

---

### 6. Eliminar Gasto ✅

#### Test 6.1: Eliminar borrador
```bash
Navegación: http://localhost:3000/gastos/10
(Asegurarse que el gasto esté en estado "borrador")

Pasos:
1. Click en botón "Eliminar"
2. Confirmar en modal
3. Click en "Eliminar Gasto"

Verificar:
✓ Modal de confirmación aparece
✓ Advertencia de acción irreversible
✓ Solo borradores tienen botón "Eliminar"
✓ Gasto se elimina de la base de datos
✓ Redirige a lista de gastos
```

#### Test 6.2: Intentar eliminar gasto aprobado
```bash
Navegación: http://localhost:3000/gastos/1
(Asegurarse que el gasto esté "aprobado")

Verificar:
✓ Botón "Eliminar" no está visible
✓ Solo aparece opción "Anular"
```

---

### 7. Anular Gasto ✅

#### Test 7.1: Anular gasto aprobado
```bash
Navegación: http://localhost:3000/gastos/1
(Asegurarse que el gasto esté "aprobado" o "pagado")

Pasos:
1. Click en botón "Anular"
2. Escribir motivo: "Factura duplicada"
3. Confirmar anulación

Verificar:
✓ Solicita motivo obligatorio
✓ Mensaje de confirmación
✓ Estado cambia a "anulado"
✓ Se registra en historial con motivo
✓ Gasto no se puede editar después de anular
```

---

### 8. Reportes y Análisis ✅ NUEVO

#### Test 8.1: Acceder a reportes
```bash
Navegación: http://localhost:3000/gastos

Pasos:
1. Click en botón "Reportes" (header)
2. Esperar carga de datos

Verificar:
✓ Redirige a /gastos/reportes
✓ Se cargan 8 reportes diferentes
✓ Filtros de fechas están disponibles
✓ Todos los reportes muestran datos
```

#### Test 8.2: Filtrar reportes por fecha
```bash
Navegación: http://localhost:3000/gastos/reportes

Pasos:
1. Establecer "Fecha Desde": 2025-01-01
2. Establecer "Fecha Hasta": 2025-06-30
3. Click en "Actualizar"

Verificar:
✓ Todos los reportes se actualizan
✓ Solo se muestran datos del rango especificado
✓ Los totales cambian correctamente
```

#### Test 8.3: Ver gastos por categoría
```bash
Navegación: http://localhost:3000/gastos/reportes

Scroll a sección "Gastos por Categoría"

Verificar:
✓ Tabla muestra todas las categorías
✓ Cantidad de gastos por categoría
✓ Monto total por categoría
✓ Porcentaje del total
✓ Suma de porcentajes = 100%
```

#### Test 8.4: Ver gastos por proveedor
```bash
Navegación: http://localhost:3000/gastos/reportes

Scroll a sección "Gastos por Proveedor"

Verificar:
✓ Tabla muestra proveedores ordenados por monto
✓ Cantidad de gastos por proveedor
✓ Monto total
✓ Monto promedio
✓ Fecha del último gasto
```

#### Test 8.5: Ver evolución temporal
```bash
Navegación: http://localhost:3000/gastos/reportes

Scroll a sección "Evolución Temporal"

Verificar:
✓ Se muestran los últimos 12 meses (por defecto)
✓ Cantidad de gastos por mes
✓ Monto total por mes
✓ Monto promedio por mes
✓ Se puede cambiar cantidad de meses a mostrar
```

#### Test 8.6: Ver top gastos
```bash
Navegación: http://localhost:3000/gastos/reportes

Scroll a sección "Top 10 Gastos Mayores"

Verificar:
✓ Se muestran 10 gastos (por defecto)
✓ Ordenados por monto descendente
✓ Se muestra toda la información relevante
✓ Se puede hacer click para ver detalle
✓ Se puede cambiar el límite (5, 20, 50)
```

#### Test 8.7: Ver gastos pendientes
```bash
Navegación: http://localhost:3000/gastos/reportes

Scroll a sección "Gastos Pendientes de Aprobación"

Verificar:
✓ Solo se muestran gastos en estado "pendiente"
✓ Se muestra cantidad en el título
✓ Se puede navegar al detalle de cada gasto
✓ Información clara y completa
```

#### Test 8.8: Ver alertas
```bash
Navegación: http://localhost:3000/gastos/reportes

Verificar sección superior "Alertas y Notificaciones"

Verificar:
✓ Se muestran diferentes tipos de alertas
✓ Colores diferentes según tipo
✓ Cantidad de elementos en cada alerta
✓ Descripción clara de cada alerta
```

#### Test 8.9: Imprimir reporte
```bash
Navegación: http://localhost:3000/gastos/reportes

Pasos:
1. Click en botón "Imprimir"
2. Verificar vista previa de impresión

Verificar:
✓ Se ocultan botones en vista de impresión
✓ Se ocultan filtros en vista de impresión
✓ Los datos se mantienen legibles
✓ El formato es apropiado para papel
```

---

## 🔄 Tests de Integración Completa

### Flujo Completo 1: Crear → Aprobar → Ver Emisión
```bash
1. Crear nuevo gasto en /gastos/nuevo
2. Ir a detalle del gasto creado
3. Aprobar el gasto
4. Verificar que aparece en emisiones (si aplica)
5. Verificar que el estado cambió correctamente
6. Verificar que el historial se actualizó
```

### Flujo Completo 2: Crear → Rechazar → Editar → Aprobar
```bash
1. Crear gasto con monto alto
2. Rechazar gasto con comentario
3. Editar gasto para corregir
4. Aprobar gasto corregido
5. Verificar historial completo de cambios
```

### Flujo Completo 3: Filtros → Reportes → Detalle
```bash
1. Aplicar filtros en lista de gastos
2. Ver estadísticas filtradas
3. Ir a reportes
4. Aplicar mismos filtros de fecha
5. Ver detalle de un gasto del reporte
6. Volver a reportes
```

---

## 🐛 Tests de Casos Extremos

### Test E1: Paginación con muchos resultados
```bash
1. Ir a /gastos sin filtros
2. Verificar que la paginación funciona con muchos registros
3. Cambiar límite de items por página
4. Ir a última página
5. Volver a primera página
```

### Test E2: Búsqueda sin resultados
```bash
1. Aplicar filtro de búsqueda: "zzzzzzzzz"
2. Verificar mensaje "Sin resultados"
3. Limpiar filtros
4. Verificar que vuelven los resultados
```

### Test E3: Crear gasto con monto muy alto
```bash
1. Crear gasto con monto > $10,000,000
2. Verificar que requiere múltiples aprobaciones
3. Verificar que aparece en alertas de "monto_alto"
```

### Test E4: Editar gasto aprobado
```bash
1. Intentar editar gasto aprobado
2. Verificar que solo algunos campos son editables
3. O que muestra mensaje de restricción
```

---

## ✅ Checklist de Verificación Final

### Funcionalidades Básicas
- [ ] Listar gastos funciona
- [ ] Crear gasto funciona
- [ ] Ver detalle funciona
- [ ] Editar gasto funciona
- [ ] Eliminar gasto funciona

### Filtros y Búsqueda
- [ ] Filtro por estado funciona
- [ ] Filtro por categoría funciona
- [ ] Filtro por fecha funciona
- [ ] Búsqueda por texto funciona
- [ ] Limpiar filtros funciona

### Aprobaciones
- [ ] Ver aprobaciones funciona
- [ ] Aprobar gasto funciona
- [ ] Rechazar gasto funciona
- [ ] Historial de aprobaciones visible

### Archivos
- [ ] Listar archivos funciona
- [ ] Subir archivo funciona (cuando backend esté listo)
- [ ] Eliminar archivo funciona (cuando backend esté listo)
- [ ] Validación de archivos funciona

### Reportes ⭐ NUEVO
- [ ] Estadísticas generales funcionan
- [ ] Gastos por categoría funciona
- [ ] Gastos por proveedor funciona
- [ ] Gastos por centro de costo funciona
- [ ] Evolución temporal funciona
- [ ] Top gastos funciona
- [ ] Gastos pendientes funciona
- [ ] Alertas funcionan

### Navegación
- [ ] Navegación entre páginas funciona
- [ ] Botón "Volver" funciona
- [ ] Links en tablas funcionan
- [ ] Breadcrumbs visibles (si aplica)

### UI/UX
- [ ] Loading states visibles
- [ ] Mensajes de error claros
- [ ] Mensajes de éxito claros
- [ ] Confirmaciones funcionan
- [ ] Responsive design funciona

---

## 📊 Matriz de Compatibilidad

| Navegador | Versión | Estado |
|-----------|---------|--------|
| Chrome | 120+ | ✅ Recomendado |
| Firefox | 115+ | ✅ Soportado |
| Safari | 16+ | ✅ Soportado |
| Edge | 120+ | ✅ Recomendado |

---

## 🐛 Reporte de Bugs

Si encuentras algún error, reporta con:

1. **URL donde ocurrió**
2. **Pasos para reproducir**
3. **Comportamiento esperado**
4. **Comportamiento actual**
5. **Screenshot (si aplica)**
6. **Console errors (F12)**
7. **Network requests fallidos**

---

## 📝 Notas Importantes

1. **Token JWT:** Asegúrate de tener un token válido antes de probar
2. **Permisos:** Algunos usuarios pueden no tener permisos para ciertas acciones
3. **Datos de Prueba:** Usa datos de prueba, no datos reales
4. **Backend Running:** Verifica que el backend esté corriendo antes de probar
5. **Archivos:** Los endpoints de archivos aún no están en el backend

---

## 🎯 Resultado Esperado

Al completar todas las pruebas, deberías tener:

✅ 19/19 endpoints funcionando  
✅ 6 páginas operativas  
✅ 0 errores en consola  
✅ Navegación fluida  
✅ Datos persistentes  
✅ UX consistente  

---

**Última actualización:** 13 de Octubre, 2025  
**Versión de pruebas:** 1.0
