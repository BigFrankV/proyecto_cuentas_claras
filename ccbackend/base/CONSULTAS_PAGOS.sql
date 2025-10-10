-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE PAGOS
-- Extraído de los endpoints y componentes frontend
-- ===========================================

-- ===========================================
-- 1. LISTAR PAGOS (GET /pagos)
-- Consulta principal para obtener todos los pagos con filtros opcionales
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
  p.monto as monto,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as estado,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as metodoPago,
  p.referencia as referencia,
  p.comprobante_num as numeroComprobante,
  c.razon_social as nombreComunidad,
  u.codigo as numeroUnidad,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
  pers.email as emailResidente,
  p.created_at,
  p.updated_at
FROM pago p
JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND p.comunidad_id = ?
-- AND p.estado = ?
-- AND p.medio = ?
-- AND p.fecha >= ?
-- AND p.fecha <= ?
-- AND (p.referencia LIKE ? OR CONCAT(pers.nombres, ' ', pers.apellidos) LIKE ? OR u.codigo LIKE ?)
ORDER BY p.fecha DESC, p.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR PAGOS TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) as total
FROM pago p
JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND p.comunidad_id = ?
-- AND p.estado = ?
-- AND p.medio = ?
-- AND p.fecha >= ?
-- AND p.fecha <= ?;

-- ===========================================
-- 3. OBTENER PAGO POR ID (GET /pagos/:id)
-- Consulta detallada de un pago específico
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
  p.monto as monto,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as estado,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as metodoPago,
  p.referencia as referencia,
  p.comprobante_num as numeroComprobante,
  c.razon_social as nombreComunidad,
  u.codigo as numeroUnidad,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
  pers.email as emailResidente,
  pers.telefono as telefonoResidente,
  p.created_at,
  p.updated_at
FROM pago p
JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.id = ?;

-- ===========================================
-- 4. PAGOS POR COMUNIDAD
-- Consulta de todos los pagos de una comunidad específica
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
  p.monto as monto,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as estado,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as metodoPago,
  p.referencia as referencia,
  u.codigo as numeroUnidad,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
  p.created_at
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.comunidad_id = 1
ORDER BY p.fecha DESC, p.created_at DESC;

-- ===========================================
-- 5. ESTADÍSTICAS DE PAGOS POR COMUNIDAD
-- Consulta de estadísticas generales de pagos
-- ===========================================
SELECT
  COUNT(*) as totalPagos,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as pagosAprobados,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pagosPendientes,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as pagosCancelados,
  SUM(p.monto) as montoTotal,
  AVG(p.monto) as montoPromedio,
  MIN(p.fecha) as pagoMasAntiguo,
  MAX(p.fecha) as pagoMasReciente,
  SUM(CASE WHEN p.estado = 'aplicado' THEN p.monto ELSE 0 END) as montoAprobado
FROM pago p
WHERE p.comunidad_id = 1;

-- ===========================================
-- 6. APLICACIÓN DE PAGOS A CARGOS
-- Consulta de cómo se aplicó un pago específico a los cargos
-- ===========================================
SELECT
  pa.id,
  pa.monto as montoAplicado,
  pa.prioridad,
  ccu.id as idCargo,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as codigoCargo,
  ccu.monto_total as totalCargo,
  ccu.saldo as saldoCargo,
  egc.periodo as periodo,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fechaVencimiento,
  u.codigo as numeroUnidad,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente
FROM pago_aplicacion pa
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
LEFT JOIN persona pers ON tu.persona_id = pers.id
WHERE pa.pago_id = 1
ORDER BY pa.prioridad, pa.id;

-- ===========================================
-- 7. PAGOS POR ESTADO Y COMUNIDAD
-- Consulta agrupada por estado para dashboard
-- ===========================================
SELECT
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as estado,
  COUNT(*) as cantidad,
  SUM(p.monto) as montoTotal,
  AVG(p.monto) as montoPromedio
FROM pago p
WHERE p.comunidad_id = 1
GROUP BY p.estado
ORDER BY
  CASE p.estado
    WHEN 'aplicado' THEN 1
    WHEN 'pendiente' THEN 2
    WHEN 'reversado' THEN 3
    ELSE 4
  END;

-- ===========================================
-- 8. PAGOS POR MÉTODO DE PAGO
-- Consulta agrupada por método de pago
-- ===========================================
SELECT
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as metodoPago,
  COUNT(*) as cantidad,
  SUM(p.monto) as montoTotal,
  AVG(p.monto) as montoPromedio
FROM pago p
WHERE p.comunidad_id = 1
GROUP BY p.medio
ORDER BY montoTotal DESC;

-- ===========================================
-- 9. PAGOS PENDIENTES DE APLICACIÓN
-- Consulta de pagos que aún no se han aplicado completamente
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
  p.monto as totalPago,
  COALESCE(SUM(pa.monto), 0) as montoAplicado,
  (p.monto - COALESCE(SUM(pa.monto), 0)) as saldoPendiente,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
  u.codigo as numeroUnidad,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
  p.referencia as referencia
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.comunidad_id = 1
  AND p.estado = 'pendiente'
GROUP BY p.id, p.monto, p.fecha, u.codigo, pers.nombres, pers.apellidos, p.referencia
HAVING saldoPendiente > 0
ORDER BY p.fecha DESC;

-- ===========================================
-- 10. HISTORIAL DE PAGOS POR UNIDAD
-- Consulta completa del historial de pagos de una unidad
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as idOrden,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as fechaPago,
  p.monto as monto,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as estado,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as metodoPago,
  p.referencia as referencia,
  COALESCE(SUM(pa.monto), 0) as montoAplicado
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
WHERE p.unidad_id = 1
GROUP BY p.id, p.fecha, p.monto, p.estado, p.medio, p.referencia
ORDER BY p.fecha DESC;

-- ===========================================
-- 11. CONCILIACIÓN BANCARIA
-- Consulta de movimientos bancarios para conciliación
-- ===========================================
SELECT
  cb.id,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m-%d') as fechaMovimiento,
  cb.glosa as descripcion,
  cb.monto,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded'
    ELSE 'pending'
  END as estado,
  cb.referencia as referenciaBancaria,
  p.id as idPago,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago,
  p.referencia as referenciaPago,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded'
    ELSE 'pending'
  END as estadoConciliacion
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = 1
ORDER BY cb.fecha_mov DESC;

-- ===========================================
-- 12. WEBHOOKS DE PAGOS
-- Consulta de webhooks recibidos para un pago
-- ===========================================
SELECT
  wp.id,
  wp.proveedor as proveedor,
  wp.payload_json as payload,
  wp.procesado,
  DATE_FORMAT(wp.fecha_recepcion, '%Y-%m-%d %H:%i:%s') as fechaRecepcion,
  wp.fecha_recepcion as created_at
FROM webhook_pago wp
WHERE wp.pago_id = 1
ORDER BY wp.fecha_recepcion DESC;

-- ===========================================
-- 13. PAGOS POR PERÍODO
-- Consulta de pagos agrupados por mes/año
-- ===========================================
SELECT
  YEAR(p.fecha) as anio,
  MONTH(p.fecha) as mes,
  DATE_FORMAT(p.fecha, '%Y-%m') as periodo,
  COUNT(*) as cantidadPagos,
  SUM(p.monto) as montoTotal,
  AVG(p.monto) as montoPromedio,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as cantidadAprobados,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as cantidadPendientes,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as cantidadCancelados
FROM pago p
WHERE p.comunidad_id = 1
GROUP BY YEAR(p.fecha), MONTH(p.fecha), DATE_FORMAT(p.fecha, '%Y-%m')
ORDER BY anio DESC, mes DESC;

-- ===========================================
-- 14. VALIDACIÓN DE PAGOS
-- Verificar que los pagos tienen todos los datos necesarios
-- ===========================================
SELECT
  p.id,
  CASE
    WHEN p.comunidad_id IS NULL THEN 'Missing community reference'
    WHEN p.monto <= 0 THEN 'Invalid amount'
    WHEN p.fecha IS NULL THEN 'Missing payment date'
    WHEN p.estado NOT IN ('pendiente', 'aplicado', 'reversado') THEN 'Invalid status'
    ELSE 'Valid'
  END as estadoValidacion,
  p.monto,
  p.fecha,
  p.estado,
  COUNT(pa.id) as cantidadAplicaciones,
  COALESCE(SUM(pa.monto), 0) as montoAplicado
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
WHERE p.comunidad_id = 1
GROUP BY p.id, p.comunidad_id, p.monto, p.fecha, p.estado
HAVING estadoValidacion != 'Valid'
ORDER BY p.id;

-- ===========================================
-- 15. RESUMEN DE PAGOS POR RESIDENTE
-- Consulta consolidada de pagos por residente
-- ===========================================
SELECT
  pers.id as idResidente,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
  pers.email as emailResidente,
  u.codigo as numeroUnidad,
  COUNT(p.id) as totalPagos,
  SUM(p.monto) as totalPagado,
  AVG(p.monto) as pagoPromedio,
  MAX(p.fecha) as fechaUltimoPago,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as pagosAprobados,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pagosPendientes,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as pagosCancelados
FROM persona pers
JOIN titulares_unidad tu ON pers.id = tu.persona_id
JOIN unidad u ON tu.unidad_id = u.id
LEFT JOIN pago p ON pers.id = p.persona_id
WHERE u.comunidad_id = 1
GROUP BY pers.id, pers.nombres, pers.apellidos, pers.email, u.codigo
ORDER BY totalPagado DESC;<