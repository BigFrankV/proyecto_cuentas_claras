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
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as orderId,
  p.monto as amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as paymentMethod,
  p.referencia as reference,
  p.comprobante_num as receiptNumber,
  c.razon_social as communityName,
  u.codigo as unitNumber,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName,
  pers.email as residentEmail,
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
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as orderId,
  p.monto as amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as paymentMethod,
  p.referencia as reference,
  p.comprobante_num as receiptNumber,
  c.razon_social as communityName,
  u.codigo as unitNumber,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName,
  pers.email as residentEmail,
  pers.telefono as residentPhone,
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
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as orderId,
  p.monto as amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as paymentMethod,
  p.referencia as reference,
  u.codigo as unitNumber,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName,
  p.created_at
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.comunidad_id = ?
ORDER BY p.fecha DESC, p.created_at DESC;

-- ===========================================
-- 5. ESTADÍSTICAS DE PAGOS POR COMUNIDAD
-- Consulta de estadísticas generales de pagos
-- ===========================================
SELECT
  COUNT(*) as totalPayments,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as approvedPayments,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pendingPayments,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as cancelledPayments,
  SUM(p.monto) as totalAmount,
  AVG(p.monto) as averageAmount,
  MIN(p.fecha) as oldestPayment,
  MAX(p.fecha) as newestPayment,
  SUM(CASE WHEN p.estado = 'aplicado' THEN p.monto ELSE 0 END) as approvedAmount
FROM pago p
WHERE p.comunidad_id = ?;

-- ===========================================
-- 6. APLICACIÓN DE PAGOS A CARGOS
-- Consulta de cómo se aplicó un pago específico a los cargos
-- ===========================================
SELECT
  pa.id,
  pa.monto as appliedAmount,
  pa.prioridad,
  ccu.id as chargeId,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as chargeCode,
  ccu.monto_total as chargeTotal,
  ccu.saldo as chargeBalance,
  egc.periodo as period,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as dueDate,
  u.codigo as unitNumber,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName
FROM pago_aplicacion pa
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.principal = 1
LEFT JOIN persona pers ON tu.persona_id = pers.id
WHERE pa.pago_id = ?
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
  END as status,
  COUNT(*) as count,
  SUM(p.monto) as totalAmount,
  AVG(p.monto) as averageAmount
FROM pago p
WHERE p.comunidad_id = ?
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
  END as paymentMethod,
  COUNT(*) as count,
  SUM(p.monto) as totalAmount,
  AVG(p.monto) as averageAmount
FROM pago p
WHERE p.comunidad_id = ?
GROUP BY p.medio
ORDER BY totalAmount DESC;

-- ===========================================
-- 9. PAGOS PENDIENTES DE APLICACIÓN
-- Consulta de pagos que aún no se han aplicado completamente
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as orderId,
  p.monto as totalPayment,
  COALESCE(SUM(pa.monto), 0) as appliedAmount,
  (p.monto - COALESCE(SUM(pa.monto), 0)) as remainingAmount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
  u.codigo as unitNumber,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName,
  p.referencia as reference
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.comunidad_id = ?
  AND p.estado = 'pendiente'
GROUP BY p.id, p.monto, p.fecha, u.codigo, pers.nombres, pers.apellidos, p.referencia
HAVING remainingAmount > 0
ORDER BY p.fecha DESC;

-- ===========================================
-- 10. HISTORIAL DE PAGOS POR UNIDAD
-- Consulta completa del historial de pagos de una unidad
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as orderId,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
  p.monto as amount,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END as status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as paymentMethod,
  p.referencia as reference,
  COALESCE(SUM(pa.monto), 0) as appliedAmount
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
WHERE p.unidad_id = ?
GROUP BY p.id, p.fecha, p.monto, p.estado, p.medio, p.referencia
ORDER BY p.fecha DESC;

-- ===========================================
-- 11. CONCILIACIÓN BANCARIA
-- Consulta de movimientos bancarios para conciliación
-- ===========================================
SELECT
  cb.id,
  DATE_FORMAT(cb.fecha_movimiento, '%Y-%m-%d') as movementDate,
  cb.descripcion,
  cb.monto,
  CASE
    WHEN cb.tipo = 'credito' THEN 'credit'
    WHEN cb.tipo = 'debito' THEN 'debit'
    ELSE cb.tipo
  END as type,
  cb.referencia_bancaria as bankReference,
  p.id as paymentId,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as paymentCode,
  p.referencia as paymentReference,
  CASE
    WHEN cb.estado_conciliacion = 'pendiente' THEN 'pending'
    WHEN cb.estado_conciliacion = 'conciliado' THEN 'reconciled'
    WHEN cb.estado_conciliacion = 'diferencia' THEN 'difference'
    ELSE 'pending'
  END as reconciliationStatus
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = ?
ORDER BY cb.fecha_movimiento DESC;

-- ===========================================
-- 12. WEBHOOKS DE PAGOS
-- Consulta de webhooks recibidos para un pago
-- ===========================================
SELECT
  wp.id,
  wp.evento,
  wp.payload,
  wp.procesado,
  DATE_FORMAT(wp.fecha_recepcion, '%Y-%m-%d %H:%i:%s') as receivedAt,
  wp.created_at
FROM webhook_pago wp
WHERE wp.pago_id = ?
ORDER BY wp.fecha_recepcion DESC;

-- ===========================================
-- 13. PAGOS POR PERÍODO
-- Consulta de pagos agrupados por mes/año
-- ===========================================
SELECT
  YEAR(p.fecha) as year,
  MONTH(p.fecha) as month,
  DATE_FORMAT(p.fecha, '%Y-%m') as period,
  COUNT(*) as paymentCount,
  SUM(p.monto) as totalAmount,
  AVG(p.monto) as averageAmount,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as approvedCount,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pendingCount,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as cancelledCount
FROM pago p
WHERE p.comunidad_id = ?
GROUP BY YEAR(p.fecha), MONTH(p.fecha), DATE_FORMAT(p.fecha, '%Y-%m')
ORDER BY year DESC, month DESC;

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
  END as validation_status,
  p.monto,
  p.fecha,
  p.estado,
  COUNT(pa.id) as application_count,
  COALESCE(SUM(pa.monto), 0) as applied_amount
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
WHERE p.comunidad_id = ?
GROUP BY p.id, p.comunidad_id, p.monto, p.fecha, p.estado
HAVING validation_status != 'Valid'
ORDER BY p.id;

-- ===========================================
-- 15. RESUMEN DE PAGOS POR RESIDENTE
-- Consulta consolidada de pagos por residente
-- ===========================================
SELECT
  pers.id as residentId,
  CONCAT(pers.nombres, ' ', pers.apellidos) as residentName,
  pers.email as residentEmail,
  u.codigo as unitNumber,
  COUNT(p.id) as totalPayments,
  SUM(p.monto) as totalPaid,
  AVG(p.monto) as averagePayment,
  MAX(p.fecha) as lastPaymentDate,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) as approvedPayments,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) as pendingPayments,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) as cancelledPayments
FROM persona pers
JOIN titulares_unidad tu ON pers.id = tu.persona_id AND tu.principal = 1
JOIN unidad u ON tu.unidad_id = u.id
LEFT JOIN pago p ON pers.id = p.persona_id
WHERE u.comunidad_id = ?
GROUP BY pers.id, pers.nombres, pers.apellidos, pers.email, u.codigo
ORDER BY totalPaid DESC;</content>
<parameter name="filePath">c:\Users\patri\Documents\GitHub\proyecto_cuentas_claras\ccbackend\base\CONSULTAS_PAGOS.sql