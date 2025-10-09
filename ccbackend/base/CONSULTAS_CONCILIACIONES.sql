-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE CONCILIACIONES
-- Extraído de los endpoints y componentes frontend
-- ===========================================

-- ===========================================
-- 1. LISTAR CONCILIACIONES (GET /conciliaciones)
-- Consulta principal para obtener todas las conciliaciones con filtros opcionales
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_movimiento), '-', LPAD(cb.id, 4, '0')) as code,
  cb.fecha_movimiento as movementDate,
  cb.descripcion,
  cb.monto as amount,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  CASE
    WHEN cb.estado_conciliacion = 'pendiente' THEN 'pending'
    WHEN cb.estado_conciliacion = 'conciliado' THEN 'reconciled'
    WHEN cb.estado_conciliacion = 'diferencia' THEN 'difference'
    ELSE 'pending'
  END as reconciliationStatus,
  p.id as paymentId,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as paymentCode,
  p.referencia as paymentReference,
  c.razon_social as communityName,
  cb.created_at,
  cb.updated_at
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND cb.comunidad_id = ?
-- AND cb.estado_conciliacion = ?
-- AND cb.fecha_movimiento >= ?
-- AND cb.fecha_movimiento <= ?
-- AND cb.tipo = ?
ORDER BY cb.fecha_movimiento DESC, cb.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR CONCILIACIONES TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) as total
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND cb.comunidad_id = ?
-- AND cb.estado_conciliacion = ?
-- AND cb.fecha_movimiento >= ?
-- AND cb.fecha_movimiento <= ?;

-- ===========================================
-- 3. OBTENER CONCILIACIÓN POR ID (GET /conciliaciones/:id)
-- Consulta detallada de una conciliación específica
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_movimiento), '-', LPAD(cb.id, 4, '0')) as code,
  cb.fecha_movimiento as movementDate,
  cb.descripcion,
  cb.monto as amount,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  CASE
    WHEN cb.estado_conciliacion = 'pendiente' THEN 'pending'
    WHEN cb.estado_conciliacion = 'conciliado' THEN 'reconciled'
    WHEN cb.estado_conciliacion = 'diferencia' THEN 'difference'
    ELSE 'pending'
  END as reconciliationStatus,
  p.id as paymentId,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as paymentCode,
  p.referencia as paymentReference,
  p.monto as paymentAmount,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as paymentStatus,
  c.razon_social as communityName,
  u.codigo as unitNumber,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName,
  cb.created_at,
  cb.updated_at
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE cb.id = 1;

-- ===========================================
-- 4. CONCILIACIONES POR COMUNIDAD
-- Consulta de todas las conciliaciones de una comunidad específica
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_movimiento), '-', LPAD(cb.id, 4, '0')) as code,
  cb.fecha_movimiento as movementDate,
  cb.descripcion,
  cb.monto as amount,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  CASE
    WHEN cb.estado_conciliacion = 'pendiente' THEN 'pending'
    WHEN cb.estado_conciliacion = 'conciliado' THEN 'reconciled'
    WHEN cb.estado_conciliacion = 'diferencia' THEN 'difference'
    ELSE 'pending'
  END as reconciliationStatus,
  p.referencia as paymentReference,
  cb.created_at
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = 1
ORDER BY cb.fecha_movimiento DESC;

-- ===========================================
-- 5. ESTADÍSTICAS DE CONCILIACIONES POR COMUNIDAD
-- Consulta de estadísticas generales de conciliaciones
-- ===========================================
SELECT
  COUNT(*) as totalMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) as reconciledMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'pendiente' THEN 1 END) as pendingMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'diferencia' THEN 1 END) as differenceMovements,
  SUM(cb.monto) as totalAmount,
  AVG(cb.monto) as averageAmount,
  COUNT(CASE WHEN cb.tipo = 'credito' THEN 1 END) as creditMovements,
  COUNT(CASE WHEN cb.tipo = 'debito' THEN 1 END) as debitMovements,
  MIN(cb.fecha_movimiento) as oldestMovement,
  MAX(cb.fecha_movimiento) as newestMovement
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?;

-- ===========================================
-- 6. MOVIMIENTOS BANCARIOS PENDIENTES DE CONCILIACIÓN
-- Consulta de movimientos que aún no han sido conciliados
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_movimiento), '-', LPAD(cb.id, 4, '0')) as code,
  cb.fecha_movimiento as movementDate,
  cb.descripcion,
  cb.monto as amount,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  c.razon_social as communityName,
  cb.created_at
FROM conciliacion_bancaria cb
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.estado_conciliacion = 'pendiente'
  AND cb.comunidad_id = ?
ORDER BY cb.fecha_movimiento ASC;

-- ===========================================
-- 7. CONCILIACIONES POR ESTADO
-- Consulta agrupada por estado de conciliación
-- ===========================================
SELECT
  CASE
    WHEN cb.estado_conciliacion = 'pendiente' THEN 'pending'
    WHEN cb.estado_conciliacion = 'conciliado' THEN 'reconciled'
    WHEN cb.estado_conciliacion = 'diferencia' THEN 'difference'
    ELSE 'pending'
  END as status,
  COUNT(*) as count,
  SUM(cb.monto) as totalAmount,
  AVG(cb.monto) as averageAmount
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
GROUP BY cb.estado_conciliacion
ORDER BY
  CASE cb.estado_conciliacion
    WHEN 'pendiente' THEN 1
    WHEN 'diferencia' THEN 2
    WHEN 'conciliado' THEN 3
    ELSE 4
  END;

-- ===========================================
-- 8. CONCILIACIONES POR TIPO DE MOVIMIENTO
-- Consulta agrupada por tipo (crédito/débito)
-- ===========================================
SELECT
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  COUNT(*) as count,
  SUM(cb.monto) as totalAmount,
  AVG(cb.monto) as averageAmount,
  COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) as reconciledCount
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
GROUP BY cb.tipo
ORDER BY totalAmount DESC;

-- ===========================================
-- 9. MOVIMIENTOS CON DIFERENCIAS
-- Consulta de movimientos que tienen diferencias pendientes
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_movimiento), '-', LPAD(cb.id, 4, '0')) as code,
  cb.fecha_movimiento as movementDate,
  cb.descripcion,
  cb.monto as bankAmount,
  p.monto as paymentAmount,
  (cb.monto - COALESCE(p.monto, 0)) as difference,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  p.referencia as paymentReference,
  c.razon_social as communityName
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.estado_conciliacion = 'diferencia'
  AND cb.comunidad_id = ?
ORDER BY ABS(cb.monto - COALESCE(p.monto, 0)) DESC;

-- ===========================================
-- 10. HISTORIAL DE CONCILIACIONES POR PERÍODO
-- Consulta de conciliaciones agrupadas por mes/año
-- ===========================================
SELECT
  YEAR(cb.fecha_movimiento) as year,
  MONTH(cb.fecha_movimiento) as month,
  DATE_FORMAT(cb.fecha_movimiento, '%Y-%m') as period,
  COUNT(*) as totalMovements,
  SUM(cb.monto) as totalAmount,
  COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) as reconciledCount,
  COUNT(CASE WHEN cb.estado_conciliacion = 'diferencia' THEN 1 END) as differenceCount,
  COUNT(CASE WHEN cb.estado_conciliacion = 'pendiente' THEN 1 END) as pendingCount,
  ROUND(
    (COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
    2
  ) as reconciliationPercentage
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
GROUP BY YEAR(cb.fecha_movimiento), MONTH(cb.fecha_movimiento), DATE_FORMAT(cb.fecha_movimiento, '%Y-%m')
ORDER BY year DESC, month DESC;

-- ===========================================
-- 11. SALDOS BANCARIOS VS CONTABLES
-- Comparación de saldos bancarios contra registros contables
-- ===========================================
SELECT
  YEAR(cb.fecha_movimiento) as year,
  MONTH(cb.fecha_movimiento) as month,
  DATE_FORMAT(cb.fecha_movimiento, '%Y-%m') as period,
  -- Saldos bancarios
  SUM(CASE WHEN cb.tipo = 'credito' THEN cb.monto ELSE 0 END) as bankCredits,
  SUM(CASE WHEN cb.tipo = 'debito' THEN cb.monto ELSE 0 END) as bankDebits,
  (
    SUM(CASE WHEN cb.tipo = 'credito' THEN cb.monto ELSE 0 END) -
    SUM(CASE WHEN cb.tipo = 'debito' THEN cb.monto ELSE 0 END)
  ) as bankBalance,
  -- Saldos contables (pagos)
  COALESCE(SUM(p.monto), 0) as bookPayments,
  -- Diferencias
  (
    SUM(CASE WHEN cb.tipo = 'credito' THEN cb.monto ELSE 0 END) -
    SUM(CASE WHEN cb.tipo = 'debito' THEN cb.monto ELSE 0 END)
  ) - COALESCE(SUM(p.monto), 0) as difference
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id AND p.estado = 'aplicado'
WHERE cb.comunidad_id = ?
GROUP BY YEAR(cb.fecha_movimiento), MONTH(cb.fecha_movimiento), DATE_FORMAT(cb.fecha_movimiento, '%Y-%m')
ORDER BY year DESC, month DESC;

-- ===========================================
-- 12. VALIDACIÓN DE CONCILIACIONES
-- Verificar que las conciliaciones tienen todos los datos necesarios
-- ===========================================
SELECT
  cb.id,
  CASE
    WHEN cb.comunidad_id IS NULL THEN 'Missing community reference'
    WHEN cb.fecha_movimiento IS NULL THEN 'Missing movement date'
    WHEN cb.monto = 0 THEN 'Invalid amount'
    WHEN cb.tipo NOT IN ('credito', 'debito') THEN 'Invalid movement type'
    WHEN cb.estado_conciliacion NOT IN ('pendiente', 'conciliado', 'diferencia') THEN 'Invalid reconciliation status'
    ELSE 'Valid'
  END as validation_status,
  cb.monto,
  cb.fecha_movimiento,
  cb.tipo,
  cb.estado_conciliacion,
  CASE WHEN cb.pago_id IS NOT NULL THEN 'Linked' ELSE 'Unlinked' END as payment_link_status
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
HAVING validation_status != 'Valid'
ORDER BY cb.id;

-- ===========================================
-- 13. MOVIMIENTOS BANCARIOS SIN PAGOS ASOCIADOS
-- Consulta de movimientos bancarios que no tienen pagos vinculados
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_movimiento), '-', LPAD(cb.id, 4, '0')) as code,
  cb.fecha_movimiento as movementDate,
  cb.descripcion,
  cb.monto as amount,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  CASE
    WHEN cb.estado_conciliacion = 'pendiente' THEN 'pending'
    WHEN cb.estado_conciliacion = 'conciliado' THEN 'reconciled'
    WHEN cb.estado_conciliacion = 'diferencia' THEN 'difference'
    ELSE 'pending'
  END as reconciliationStatus,
  c.razon_social as communityName,
  cb.created_at
FROM conciliacion_bancaria cb
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.pago_id IS NULL
  AND cb.comunidad_id = ?
ORDER BY cb.fecha_movimiento DESC;

-- ===========================================
-- 14. ANÁLISIS DE PRECISIÓN DE CONCILIACIÓN
-- Estadísticas de precisión por período
-- ===========================================
SELECT
  YEAR(cb.fecha_movimiento) as year,
  MONTH(cb.fecha_movimiento) as month,
  DATE_FORMAT(cb.fecha_movimiento, '%Y-%m') as period,
  COUNT(*) as totalMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) as reconciledMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'diferencia' THEN 1 END) as differenceMovements,
  ROUND(
    (COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
    2
  ) as accuracyPercentage,
  AVG(ABS(cb.monto - COALESCE(p.monto, 0))) as averageDifference,
  MAX(ABS(cb.monto - COALESCE(p.monto, 0))) as maxDifference
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = ?
GROUP BY YEAR(cb.fecha_movimiento), MONTH(cb.fecha_movimiento), DATE_FORMAT(cb.fecha_movimiento, '%Y-%m')
ORDER BY year DESC, month DESC;

-- ===========================================
-- 15. RESUMEN DE CONCILIACIONES POR COMUNIDAD
-- Vista consolidada de todas las conciliaciones por comunidad
-- ===========================================
SELECT
  c.razon_social as communityName,
  COUNT(cb.id) as totalMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) as reconciledMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'pendiente' THEN 1 END) as pendingMovements,
  COUNT(CASE WHEN cb.estado_conciliacion = 'diferencia' THEN 1 END) as differenceMovements,
  SUM(cb.monto) as totalBankAmount,
  COUNT(DISTINCT p.id) as linkedPayments,
  ROUND(
    (COUNT(CASE WHEN cb.estado_conciliacion = 'conciliado' THEN 1 END) * 100.0) / COUNT(cb.id),
    2
  ) as reconciliationRate,
  MIN(cb.fecha_movimiento) as oldestMovement,
  MAX(cb.fecha_movimiento) as newestMovement
FROM comunidad c
LEFT JOIN conciliacion_bancaria cb ON c.id = cb.comunidad_id
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE c.id = ?
GROUP BY c.id, c.razon_social;</content>
<parameter name="filePath">c:\Users\patri\Documents\GitHub\proyecto_cuentas_claras\ccbackend\base\CONSULTAS_CONCILIACIONES.sql