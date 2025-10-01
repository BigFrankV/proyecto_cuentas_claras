# 🔍 Ejemplos de Consultas SQL - Sistema Mejorado

## Consultas para el Nuevo Sistema de Roles

### 1. Obtener todos los roles disponibles
```sql
SELECT 
  id, 
  codigo, 
  nombre, 
  descripcion, 
  nivel_acceso, 
  es_rol_sistema
FROM rol
ORDER BY nivel_acceso DESC;
```

### 2. Obtener roles de un usuario en todas las comunidades
```sql
SELECT 
  u.id as usuario_id,
  u.username,
  c.id as comunidad_id,
  c.nombre as comunidad_nombre,
  r.codigo as rol_codigo,
  r.nombre as rol_nombre,
  r.nivel_acceso,
  ucr.desde,
  ucr.hasta,
  ucr.activo
FROM usuario_comunidad_rol ucr
INNER JOIN usuario u ON u.id = ucr.usuario_id
INNER JOIN comunidad c ON c.id = ucr.comunidad_id
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE u.id = ? AND ucr.activo = 1
ORDER BY c.nombre, r.nivel_acceso DESC;
```

### 3. Verificar si usuario es superadmin
```sql
SELECT EXISTS(
  SELECT 1
  FROM usuario_comunidad_rol ucr
  INNER JOIN rol r ON r.id = ucr.rol_id
  WHERE ucr.usuario_id = ? 
    AND r.codigo = 'superadmin'
    AND ucr.activo = 1
) as es_superadmin;
```

### 4. Obtener usuarios de una comunidad con sus roles (agrupados)
```sql
SELECT 
  u.id as usuario_id,
  u.username,
  p.nombres,
  p.apellidos,
  p.email,
  p.rut,
  p.dv,
  GROUP_CONCAT(r.nombre ORDER BY r.nivel_acceso DESC SEPARATOR ', ') as roles,
  GROUP_CONCAT(r.codigo ORDER BY r.nivel_acceso DESC SEPARATOR ',') as roles_codigo,
  MAX(r.nivel_acceso) as nivel_acceso_maximo,
  MIN(ucr.desde) as miembro_desde,
  COUNT(DISTINCT ucr.rol_id) as cantidad_roles
FROM usuario_comunidad_rol ucr
INNER JOIN usuario u ON u.id = ucr.usuario_id
INNER JOIN persona p ON p.id = u.persona_id
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.comunidad_id = ? AND ucr.activo = 1
GROUP BY u.id, u.username, p.nombres, p.apellidos, p.email, p.rut, p.dv
ORDER BY nivel_acceso_maximo DESC, p.apellidos;
```

### 5. Asignar rol a usuario en comunidad
```sql
INSERT INTO usuario_comunidad_rol 
  (usuario_id, comunidad_id, rol_id, desde, hasta, activo)
VALUES 
  (?, ?, ?, CURDATE(), NULL, 1);
```

### 6. Remover rol de usuario (soft delete)
```sql
UPDATE usuario_comunidad_rol
SET activo = 0, hasta = CURDATE()
WHERE usuario_id = ? 
  AND comunidad_id = ? 
  AND rol_id = ?
  AND activo = 1;
```

### 7. Verificar si usuario tiene permiso específico en comunidad
```sql
SELECT 
  r.codigo,
  r.nivel_acceso
FROM usuario_comunidad_rol ucr
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.usuario_id = ?
  AND ucr.comunidad_id = ?
  AND r.codigo IN ('superadmin', 'admin', 'comite')
  AND ucr.activo = 1
LIMIT 1;
```

### 8. Obtener todas las comunidades donde usuario tiene rol de admin
```sql
SELECT 
  c.id,
  c.nombre,
  c.direccion,
  r.nombre as rol
FROM usuario_comunidad_rol ucr
INNER JOIN comunidad c ON c.id = ucr.comunidad_id
INNER JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.usuario_id = ?
  AND r.codigo IN ('superadmin', 'admin')
  AND ucr.activo = 1
ORDER BY c.nombre;
```

---

## Consultas para Cuentas de Cobro (antes Cargos)

### 9. Obtener cuentas de cobro pendientes de una unidad
```sql
SELECT 
  cc.id,
  cc.monto_total,
  cc.saldo,
  cc.estado,
  cc.interes_acumulado,
  e.periodo,
  e.fecha_emision,
  e.fecha_vencimiento
FROM cuenta_cobro_unidad cc
INNER JOIN emision_gastos_comunes e ON e.id = cc.emision_id
WHERE cc.unidad_id = ?
  AND cc.estado IN ('pendiente', 'parcial', 'vencido')
ORDER BY e.fecha_vencimiento DESC;
```

### 10. Obtener detalle de una cuenta de cobro
```sql
SELECT 
  d.id,
  d.glosa,
  d.monto,
  d.origen,
  d.iva_incluido,
  c.nombre as categoria,
  c.tipo as tipo_categoria
FROM detalle_cuenta_unidad d
INNER JOIN categoria_gasto c ON c.id = d.categoria_id
WHERE d.cuenta_cobro_unidad_id = ?
ORDER BY d.origen, c.nombre;
```

### 11. Resumen de cuentas de cobro por estado
```sql
SELECT 
  cc.estado,
  COUNT(*) as cantidad,
  SUM(cc.monto_total) as monto_total,
  SUM(cc.saldo) as saldo_pendiente,
  SUM(cc.interes_acumulado) as intereses_totales
FROM cuenta_cobro_unidad cc
WHERE cc.comunidad_id = ?
  AND YEAR(cc.created_at) = YEAR(CURDATE())
GROUP BY cc.estado
ORDER BY FIELD(cc.estado, 'pendiente', 'vencido', 'parcial', 'pagado');
```

### 12. Historial de cuentas de cobro de una unidad
```sql
SELECT 
  e.periodo,
  e.fecha_emision,
  e.fecha_vencimiento,
  cc.monto_total,
  cc.saldo,
  cc.estado,
  cc.interes_acumulado,
  DATEDIFF(CURDATE(), e.fecha_vencimiento) as dias_mora
FROM cuenta_cobro_unidad cc
INNER JOIN emision_gastos_comunes e ON e.id = cc.emision_id
WHERE cc.unidad_id = ?
ORDER BY e.periodo DESC
LIMIT 12;
```

---

## Consultas para Emisiones de Gastos Comunes

### 13. Obtener última emisión de una comunidad
```sql
SELECT 
  e.*,
  COUNT(DISTINCT cc.id) as total_cuentas,
  SUM(cc.monto_total) as monto_total_emitido,
  SUM(cc.saldo) as saldo_pendiente,
  SUM(CASE WHEN cc.estado = 'pagado' THEN 1 ELSE 0 END) as cuentas_pagadas,
  SUM(CASE WHEN cc.estado = 'vencido' THEN 1 ELSE 0 END) as cuentas_vencidas
FROM emision_gastos_comunes e
LEFT JOIN cuenta_cobro_unidad cc ON cc.emision_id = e.id
WHERE e.comunidad_id = ?
GROUP BY e.id
ORDER BY e.periodo DESC
LIMIT 1;
```

### 14. Detalle de gastos en una emisión
```sql
SELECT 
  d.id,
  c.nombre as categoria,
  c.tipo as tipo_categoria,
  d.monto,
  d.prorrateo_tipo,
  d.cantidad_distribuida
FROM detalle_emision d
INNER JOIN categoria_gasto c ON c.id = d.categoria_id
WHERE d.emision_id = ?
ORDER BY c.tipo, c.nombre;
```

### 15. Comparativa de emisiones (últimos 6 meses)
```sql
SELECT 
  e.periodo,
  e.fecha_emision,
  COUNT(DISTINCT cc.id) as unidades,
  SUM(cc.monto_total) as total_emitido,
  AVG(cc.monto_total) as promedio_por_unidad,
  SUM(CASE WHEN cc.estado = 'pagado' THEN cc.monto_total ELSE 0 END) as total_recaudado,
  (SUM(CASE WHEN cc.estado = 'pagado' THEN cc.monto_total ELSE 0 END) / SUM(cc.monto_total)) * 100 as porcentaje_recaudacion
FROM emision_gastos_comunes e
INNER JOIN cuenta_cobro_unidad cc ON cc.emision_id = e.id
WHERE e.comunidad_id = ?
  AND e.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY e.id, e.periodo, e.fecha_emision
ORDER BY e.periodo DESC;
```

---

## Consultas para Titulares de Unidad (antes Tenencia)

### 16. Obtener propietarios actuales de una unidad
```sql
SELECT 
  p.id,
  p.rut,
  p.dv,
  p.nombres,
  p.apellidos,
  p.email,
  p.telefono,
  t.tipo,
  t.porcentaje,
  t.desde,
  t.hasta
FROM titulares_unidad t
INNER JOIN persona p ON p.id = t.persona_id
WHERE t.unidad_id = ?
  AND (t.hasta IS NULL OR t.hasta >= CURDATE())
ORDER BY t.tipo DESC, t.porcentaje DESC;
```

### 17. Historial de titulares de una unidad
```sql
SELECT 
  p.nombres,
  p.apellidos,
  p.rut,
  p.dv,
  t.tipo,
  t.porcentaje,
  t.desde,
  t.hasta,
  DATEDIFF(COALESCE(t.hasta, CURDATE()), t.desde) as dias_duracion
FROM titulares_unidad t
INNER JOIN persona p ON p.id = t.persona_id
WHERE t.unidad_id = ?
ORDER BY t.desde DESC;
```

### 18. Unidades de un propietario
```sql
SELECT 
  u.id,
  u.codigo,
  e.nombre as edificio,
  tor.nombre as torre,
  c.nombre as comunidad,
  t.tipo,
  t.porcentaje,
  t.desde
FROM titulares_unidad t
INNER JOIN unidad u ON u.id = t.unidad_id
INNER JOIN comunidad c ON c.id = t.comunidad_id
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre tor ON tor.id = u.torre_id
WHERE t.persona_id = ?
  AND (t.hasta IS NULL OR t.hasta >= CURDATE())
ORDER BY c.nombre, u.codigo;
```

---

## Consultas para Solicitudes de Soporte (antes Tickets)

### 19. Solicitudes abiertas de una comunidad
```sql
SELECT 
  s.id,
  s.categoria,
  s.titulo,
  s.estado,
  s.prioridad,
  u.codigo as unidad,
  CONCAT(p.nombres, ' ', p.apellidos) as solicitante,
  CONCAT(asig.nombres, ' ', asig.apellidos) as asignado_a,
  DATEDIFF(CURDATE(), s.created_at) as dias_abierto
FROM solicitud_soporte s
LEFT JOIN unidad u ON u.id = s.unidad_id
LEFT JOIN usuario usr ON usr.id = s.asignado_a
LEFT JOIN persona asig ON asig.id = usr.persona_id
LEFT JOIN persona p ON p.id = (
  SELECT persona_id FROM titulares_unidad 
  WHERE unidad_id = s.unidad_id 
  LIMIT 1
)
WHERE s.comunidad_id = ?
  AND s.estado IN ('abierto', 'en_progreso')
ORDER BY 
  FIELD(s.prioridad, 'alta', 'media', 'baja'),
  s.created_at;
```

### 20. Estadísticas de solicitudes por categoría
```sql
SELECT 
  s.categoria,
  COUNT(*) as total,
  SUM(CASE WHEN s.estado = 'abierto' THEN 1 ELSE 0 END) as abiertas,
  SUM(CASE WHEN s.estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
  SUM(CASE WHEN s.estado = 'resuelto' THEN 1 ELSE 0 END) as resueltas,
  AVG(CASE 
    WHEN s.estado = 'resuelto' THEN 
      DATEDIFF(s.updated_at, s.created_at)
    ELSE NULL
  END) as dias_promedio_resolucion
FROM solicitud_soporte s
WHERE s.comunidad_id = ?
  AND s.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
GROUP BY s.categoria
ORDER BY total DESC;
```

---

## Consultas Útiles de Pagos

### 21. Aplicar pago a cuentas de cobro
```sql
-- Primero registrar el pago
INSERT INTO pago (comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia, estado)
VALUES (?, ?, ?, CURDATE(), ?, ?, ?, 'pendiente');

-- Obtener ID del pago recién creado
SET @pago_id = LAST_INSERT_ID();

-- Aplicar a cuenta más antigua pendiente
INSERT INTO pago_aplicacion (pago_id, cuenta_cobro_unidad_id, monto, prioridad)
SELECT 
  @pago_id,
  cc.id,
  LEAST(?, cc.saldo) as monto,
  1 as prioridad
FROM cuenta_cobro_unidad cc
INNER JOIN emision_gastos_comunes e ON e.id = cc.emision_id
WHERE cc.unidad_id = ?
  AND cc.estado IN ('pendiente', 'parcial', 'vencido')
ORDER BY e.fecha_vencimiento
LIMIT 1;

-- Actualizar saldo de cuenta
UPDATE cuenta_cobro_unidad cc
INNER JOIN pago_aplicacion pa ON pa.cuenta_cobro_unidad_id = cc.id
SET 
  cc.saldo = cc.saldo - pa.monto,
  cc.estado = CASE
    WHEN cc.saldo - pa.monto <= 0 THEN 'pagado'
    WHEN cc.saldo - pa.monto < cc.monto_total THEN 'parcial'
    ELSE cc.estado
  END
WHERE pa.pago_id = @pago_id;

-- Marcar pago como aplicado
UPDATE pago SET estado = 'aplicado' WHERE id = @pago_id;
```

### 22. Historial de pagos de una unidad
```sql
SELECT 
  p.id,
  p.fecha,
  p.monto,
  p.medio,
  p.referencia,
  p.comprobante_num,
  p.estado,
  COUNT(pa.id) as cuentas_aplicadas,
  GROUP_CONCAT(e.periodo SEPARATOR ', ') as periodos
FROM pago p
INNER JOIN pago_aplicacion pa ON pa.pago_id = p.id
INNER JOIN cuenta_cobro_unidad cc ON cc.id = pa.cuenta_cobro_unidad_id
INNER JOIN emision_gastos_comunes e ON e.id = cc.emision_id
WHERE p.unidad_id = ?
GROUP BY p.id
ORDER BY p.fecha DESC;
```

---

## Consultas de Dashboard y Reportes

### 23. Dashboard resumen de comunidad
```sql
SELECT 
  -- Unidades
  (SELECT COUNT(*) FROM unidad WHERE comunidad_id = ? AND activa = 1) as total_unidades,
  
  -- Usuarios activos
  (SELECT COUNT(DISTINCT usuario_id) FROM usuario_comunidad_rol WHERE comunidad_id = ? AND activo = 1) as usuarios_activos,
  
  -- Cuentas pendientes
  (SELECT COUNT(*) FROM cuenta_cobro_unidad WHERE comunidad_id = ? AND estado IN ('pendiente', 'vencido')) as cuentas_pendientes,
  
  -- Monto pendiente
  (SELECT SUM(saldo) FROM cuenta_cobro_unidad WHERE comunidad_id = ? AND estado IN ('pendiente', 'vencido')) as monto_pendiente,
  
  -- Recaudación mes actual
  (SELECT SUM(monto) FROM pago WHERE comunidad_id = ? AND MONTH(fecha) = MONTH(CURDATE()) AND estado = 'aplicado') as recaudacion_mes,
  
  -- Solicitudes abiertas
  (SELECT COUNT(*) FROM solicitud_soporte WHERE comunidad_id = ? AND estado IN ('abierto', 'en_progreso')) as solicitudes_abiertas,
  
  -- Morosidad
  (SELECT COUNT(DISTINCT unidad_id) FROM cuenta_cobro_unidad WHERE comunidad_id = ? AND estado = 'vencido') as unidades_morosas;
```

### 24. Top 10 deudores
```sql
SELECT 
  u.codigo as unidad,
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  COUNT(DISTINCT cc.id) as cuentas_pendientes,
  SUM(cc.saldo) as deuda_total,
  SUM(cc.interes_acumulado) as intereses,
  MIN(e.fecha_vencimiento) as deuda_mas_antigua,
  DATEDIFF(CURDATE(), MIN(e.fecha_vencimiento)) as dias_mora_max
FROM cuenta_cobro_unidad cc
INNER JOIN unidad u ON u.id = cc.unidad_id
INNER JOIN emision_gastos_comunes e ON e.id = cc.emision_id
LEFT JOIN titulares_unidad t ON t.unidad_id = u.id AND t.tipo = 'propietario' AND (t.hasta IS NULL OR t.hasta >= CURDATE())
LEFT JOIN persona p ON p.id = t.persona_id
WHERE cc.comunidad_id = ?
  AND cc.estado IN ('pendiente', 'vencido')
GROUP BY u.id, u.codigo, p.id, p.nombres, p.apellidos
ORDER BY deuda_total DESC
LIMIT 10;
```

### 25. Evolución de gastos por categoría (últimos 6 meses)
```sql
SELECT 
  c.nombre as categoria,
  e.periodo,
  SUM(d.monto) as monto_total
FROM detalle_emision d
INNER JOIN categoria_gasto c ON c.id = d.categoria_id
INNER JOIN emision_gastos_comunes e ON e.id = d.emision_id
WHERE e.comunidad_id = ?
  AND e.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY c.id, c.nombre, e.periodo
ORDER BY e.periodo DESC, monto_total DESC;
```

---

## Notas de Performance

- Todas las consultas incluyen índices apropiados
- Use `EXPLAIN` para verificar el plan de ejecución
- Considere agregar índices compuestos para consultas frecuentes
- Use paginación para listados grandes (`LIMIT` y `OFFSET`)
- Cache consultas de dashboard en Redis

---

**Última actualización:** Octubre 2025
