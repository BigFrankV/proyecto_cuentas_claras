-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE CONCILIACIONES
-- Sistema de Cuentas Claras (Basado en tablas confirmadas)
-- ===========================================

-- ===========================================
-- 1. LISTAR CONCILIACIONES (GET /conciliaciones)
-- Consulta principal para obtener todas las conciliaciones con filtros opcionales
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
  cb.fecha_mov AS movementDate,
  cb.glosa,
  cb.monto AS amount,
  -- CORRECCIÓN: Se elimina cb.tipo ya que no existe. Se usa el medio de pago asociado.
  COALESCE(p.medio, 'No Aplicable') AS movementType,
  cb.referencia AS bankReference,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pendiente'
    WHEN cb.estado = 'conciliado' THEN 'reconciliado'
    WHEN cb.estado = 'descartado' THEN 'descartado'
    ELSE 'pendiente'
  END AS reconciliationStatus,
  p.id AS paymentId,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS paymentCode,
  p.referencia AS paymentReference,
  c.razon_social AS communityName,
  cb.created_at,
  cb.updated_at
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
ORDER BY cb.fecha_mov DESC, cb.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR CONCILIACIONES TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) AS total
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND cb.comunidad_id = ?
-- AND cb.estado = ?
-- AND cb.fecha_mov >= ?
-- AND cb.fecha_mov <= ?;

-- ===========================================
-- 3. OBTENER CONCILIACIÓN POR ID (GET /conciliaciones/:id)
-- Consulta detallada de una conciliación específica
-- ===========================================
SELECT
  cb.id,
  -- Sugerir índice: conciliacion_bancaria(id)
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
  cb.fecha_mov AS movementDate,
  cb.glosa,
  cb.monto AS amount,
  COALESCE(p.medio, 'No Aplicable') AS movementType, -- CORRECCIÓN: Usar p.medio
  cb.referencia AS bankReference,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded'
    ELSE 'pending'
  END AS reconciliationStatus,
  p.id AS paymentId,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS paymentCode,
  p.referencia AS paymentReference,
  p.monto AS paymentAmount,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'applied'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END AS paymentStatus,
  c.razon_social AS communityName,
  u.codigo AS unitNumber, -- CORRECCIÓN: Usar u.codigo
  CONCAT(pers.nombres, ' ', pers.apellidos) AS residentName,
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
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
  cb.fecha_mov AS movementDate,
  cb.glosa,
  cb.monto AS amount,
  COALESCE(p.medio, 'No Aplicable') AS movementType, -- CORRECCIÓN: Usar p.medio
  cb.referencia AS bankReference,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded'
    ELSE 'pending'
  END AS reconciliationStatus,
  p.referencia AS paymentReference,
  cb.created_at
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = 1
ORDER BY cb.fecha_mov DESC;

-- ===========================================
-- 5. ESTADÍSTICAS DE CONCILIACIONES POR COMUNIDAD
-- Consulta de estadísticas generales de conciliaciones
-- ===========================================
SELECT
  COUNT(*) AS totalMovements,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledMovements,
  COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) AS pendingMovements,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS discardedMovements,
  SUM(cb.monto) AS totalAmount,
  AVG(cb.monto) AS averageAmount,
  -- CORRECCIÓN: El tipo (crédito/débito) no existe en cb. Se asume que todos los montos son créditos.
  COUNT(CASE WHEN cb.monto > 0 THEN 1 END) AS creditMovements,
  COUNT(CASE WHEN cb.monto < 0 THEN 1 END) AS debitMovements, -- Se asume que podría haber débitos con signo negativo
  MIN(cb.fecha_mov) AS oldestMovement,
  MAX(cb.fecha_mov) AS newestMovement
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?;

-- ===========================================
-- 6. MOVIMIENTOS BANCARIOS PENDIENTES DE CONCILIACIÓN
-- Consulta de movimientos que aún no han sido conciliados
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
  cb.fecha_mov AS movementDate,
  cb.glosa,
  cb.monto AS amount,
  COALESCE(p.medio, 'No Aplicable') AS movementType, -- CORRECCIÓN: Usar p.medio
  cb.referencia AS bankReference,
  c.razon_social AS communityName,
  cb.created_at
FROM conciliacion_bancaria cb
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.estado = 'pendiente'
  AND cb.comunidad_id = ?
ORDER BY cb.fecha_mov ASC;

-- ===========================================
-- 7. CONCILIACIONES POR ESTADO
-- Consulta agrupada por estado de conciliación
-- ===========================================
SELECT
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded'
    ELSE 'pending'
  END AS status,
  COUNT(*) AS count,
  SUM(cb.monto) AS totalAmount,
  AVG(cb.monto) AS averageAmount
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
GROUP BY cb.estado
ORDER BY
  CASE cb.estado
    WHEN 'pendiente' THEN 1
    WHEN 'descartado' THEN 2
    WHEN 'conciliado' THEN 3
    ELSE 4
  END;

-- ===========================================
-- 8. CONCILIACIONES POR TIPO DE MOVIMIENTO
-- Consulta agrupada por tipo (crédito/débito)
-- ===========================================
SELECT
  -- CORRECCIÓN: Se agrupa por el medio de pago asociado, ya que cb.tipo no existe.
  COALESCE(p.medio, 'Movimiento No Pagado') AS type,
  COUNT(cb.id) AS count,
  SUM(cb.monto) AS totalAmount,
  AVG(cb.monto) AS averageAmount,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledCount
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = ?
GROUP BY p.medio
ORDER BY totalAmount DESC;

-- ===========================================
-- 9. MOVIMIENTOS CON DIFERENCIAS
-- Consulta de movimientos que tienen diferencias pendientes
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
  cb.fecha_mov AS movementDate,
  cb.glosa,
  cb.monto AS bankAmount,
  p.monto AS paymentAmount,
  (cb.monto - COALESCE(p.monto, 0)) AS difference,
  COALESCE(p.medio, 'No Aplicable') AS movementType, -- CORRECCIÓN: Usar p.medio
  cb.referencia AS bankReference,
  p.referencia AS paymentReference,
  c.razon_social AS communityName
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.estado = 'descartado' -- Mapeado desde el concepto de 'diferencia'
  AND cb.comunidad_id = ?
ORDER BY ABS(cb.monto - COALESCE(p.monto, 0)) DESC;

-- ===========================================
-- 10. HISTORIAL DE CONCILIACIONES POR PERÍODO
-- Consulta de conciliaciones agrupadas por mes/año
-- ===========================================
SELECT
  YEAR(cb.fecha_mov) AS year,
  MONTH(cb.fecha_mov) AS month,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m') AS period,
  COUNT(*) AS totalMovements,
  SUM(cb.monto) AS totalAmount,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledCount,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS discardedCount,
  COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) AS pendingCount,
  ROUND(
    (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
    2
  ) AS reconciliationPercentage
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
GROUP BY 1, 2, 3
ORDER BY year DESC, month DESC;

-- ===========================================
-- 11. SALDOS BANCARIOS VS CONTABLES
-- Comparación de saldos bancarios contra registros contables
-- ===========================================
SELECT
  YEAR(cb.fecha_mov) AS year,
  MONTH(cb.fecha_mov) AS month,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m') AS period,
  -- Saldos bancarios
  SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) AS bankCredits, -- CORRECCIÓN: Se asume que > 0 es crédito
  SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END) AS bankDebits, -- CORRECCIÓN: Se asume que < 0 es débito
  (
    SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) +
    SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END) -- La suma de un negativo es resta
  ) AS bankBalance,
  -- Saldos contables (pagos)
  COALESCE(SUM(p.monto), 0) AS bookPayments,
  -- Diferencias
  (
    SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) +
    SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
  ) - COALESCE(SUM(p.monto), 0) AS difference
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id AND p.estado = 'aplicado'
WHERE cb.comunidad_id = ?
GROUP BY 1, 2, 3
ORDER BY year DESC, month DESC;

-- ===========================================
-- 12. VALIDACIÓN DE CONCILIACIONES
-- Verificar que las conciliaciones tienen todos los datos necesarios
-- ===========================================
SELECT
  cb.id,
  CASE
    WHEN cb.comunidad_id IS NULL THEN 'Missing community reference'
    WHEN cb.fecha_mov IS NULL THEN 'Missing movement date'
    WHEN cb.monto = 0 THEN 'Invalid amount'
    -- CORRECCIÓN: Se elimina la validación por cb.tipo ya que no existe.
    WHEN cb.estado NOT IN ('pendiente', 'conciliado', 'descartado') THEN 'Invalid reconciliation status'
    ELSE 'Valid'
  END AS validation_status,
  cb.monto,
  cb.fecha_mov,
  cb.estado,
  CASE WHEN cb.pago_id IS NOT NULL THEN 'Linked' ELSE 'Unlinked' END AS payment_link_status
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
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) AS code,
  cb.fecha_mov AS movementDate,
  cb.glosa,
  cb.monto AS amount,
  'No Aplicable' AS movementType, -- CORRECCIÓN: No hay medio de pago
  cb.referencia AS bankReference,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded'
    ELSE 'pending'
  END AS reconciliationStatus,
  c.razon_social AS communityName,
  cb.created_at
FROM conciliacion_bancaria cb
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.pago_id IS NULL
  AND cb.comunidad_id = ?
ORDER BY cb.fecha_mov DESC;

-- ===========================================
-- 14. ANÁLISIS DE PRECISIÓN DE CONCILIACIÓN
-- Estadísticas de precisión por período
-- ===========================================
SELECT
  YEAR(cb.fecha_mov) AS year,
  MONTH(cb.fecha_mov) AS month,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m') AS period,
  COUNT(*) AS totalMovements,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledMovements,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS differenceMovements,
  ROUND(
    (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
    2
  ) AS accuracyPercentage,
  AVG(ABS(cb.monto - COALESCE(p.monto, 0))) AS averageDifference,
  MAX(ABS(cb.monto - COALESCE(p.monto, 0))) AS maxDifference
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = ?
GROUP BY 1, 2, 3
ORDER BY year DESC, month DESC;

-- ===========================================
-- 15. RESUMEN DE CONCILIACIONES POR COMUNIDAD
-- Vista consolidada de todas las conciliaciones por comunidad
-- ===========================================
SELECT
  c.razon_social AS communityName,
  COUNT(cb.id) AS totalMovements,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) AS reconciledMovements,
  COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) AS pendingMovements,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) AS differenceMovements,
  SUM(cb.monto) AS totalBankAmount,
  COUNT(DISTINCT p.id) AS linkedPayments,
  ROUND(
    (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(cb.id),
    2
  ) AS reconciliationRate,
  MIN(cb.fecha_mov) AS oldestMovement,
  MAX(cb.fecha_mov) AS newestMovement
FROM comunidad c
LEFT JOIN conciliacion_bancaria cb ON c.id = cb.comunidad_id
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE c.id = ?
GROUP BY c.id, c.razon_social;