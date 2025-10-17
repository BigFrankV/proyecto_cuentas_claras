-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE PAGOS
-- Sistema de Cuentas Claras (Basado en el esquema confirmado)
-- ===========================================

-- ===========================================
-- 1. LISTAR PAGOS (GET /pagos)
-- Consulta principal para obtener todos los pagos con filtros opcionales
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
  p.monto AS amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END AS status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END AS payment_method,
  p.referencia AS reference,
  p.comprobante_num AS receipt_number,
  c.razon_social AS community_name,
  u.codigo AS unit_number, -- CORRECCIÓN: Usar u.codigo
  CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
  pers.email AS resident_email,
  p.created_at,
  p.updated_at
FROM pago p
JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE 1=1
-- Filtros opcionales (ejemplo de uso de placeholders):
-- AND p.comunidad_id = ? /* :comunidad_id */
-- AND p.estado = ? /* :estado */
-- AND p.medio = ? /* :medio */
-- AND p.fecha >= ? /* :fecha_desde */
-- AND p.fecha <= ? /* :fecha_hasta */
-- AND (p.referencia LIKE CONCAT('%', ?, '%') OR CONCAT(pers.nombres, ' ', pers.apellidos) LIKE CONCAT('%', ?, '%') OR u.codigo LIKE CONCAT('%', ?, '%'))
ORDER BY p.fecha DESC, p.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR PAGOS TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) AS total
FROM pago p
JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE 1=1
-- Filtros opcionales (ejemplo de uso de placeholders):
-- AND p.comunidad_id = ? /* :comunidad_id */
-- AND p.estado = ? /* :estado */
-- AND p.medio = ? /* :medio */
-- AND p.fecha >= ? /* :fecha_desde */
-- AND p.fecha <= ?; /* :fecha_hasta */

-- ===========================================
-- 3. OBTENER PAGO POR ID (GET /pagos/:id)
-- Consulta detallada de un pago específico
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
  p.monto AS amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END AS status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END AS payment_method,
  p.referencia AS reference,
  p.comprobante_num AS receipt_number,
  c.razon_social AS community_name,
  u.codigo AS unit_number, -- CORRECCIÓN: Usar u.codigo
  CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
  pers.email AS resident_email,
  pers.telefono AS resident_phone,
  p.created_at,
  p.updated_at
FROM pago p
JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.id = ?; /* :pago_id */

-- ===========================================
-- 4. PAGOS POR COMUNIDAD
-- Consulta de todos los pagos de una comunidad específica
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
  p.monto AS amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END AS status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END AS payment_method,
  p.referencia AS reference,
  u.codigo AS unit_number, -- CORRECCIÓN: Usar u.codigo
  CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
  p.created_at
FROM pago p
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.comunidad_id = ? /* :comunidad_id */
ORDER BY p.fecha DESC, p.created_at DESC;

-- ===========================================
-- 5. ESTADÍSTICAS DE PAGOS POR COMUNIDAD
-- Consulta de estadísticas generales de pagos
-- ===========================================
SELECT
  COUNT(*) AS total_payments,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_payments,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_payments,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_payments,
  SUM(p.monto) AS total_amount,
  AVG(p.monto) AS average_amount,
  MIN(p.fecha) AS oldest_payment,
  MAX(p.fecha) AS newest_payment,
  SUM(CASE WHEN p.estado = 'aplicado' THEN p.monto ELSE 0 END) AS approved_amount
FROM pago p
WHERE p.comunidad_id = ?; /* :comunidad_id */

-- ===========================================
-- 6. APLICACIÓN DE PAGOS A CARGOS
-- Consulta de cómo se aplicó un pago específico a los cargos
-- ===========================================
SELECT
  pa.id,
  pa.monto AS applied_amount,
  pa.prioridad,
  ccu.id AS charge_id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS charge_code,
  ccu.monto_total AS charge_total,
  ccu.saldo AS charge_balance,
  egc.periodo AS period,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS due_date,
  u.codigo AS unit_number, -- CORRECCIÓN: Usar u.codigo
  CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name
FROM pago_aplicacion pa
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN unidad u ON ccu.unidad_id = u.id
-- CORRECCIÓN: Se asume que la persona a notificar es la asociada al pago, o el propietario activo.
-- Usaremos la persona asociada al pago (p.persona_id = pers.id) a través de la tabla pago.
LEFT JOIN pago p_ref ON pa.pago_id = p_ref.id
LEFT JOIN persona pers ON p_ref.persona_id = pers.id
WHERE pa.pago_id = ? /* :pago_id */
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
  END AS status,
  COUNT(*) AS count,
  SUM(p.monto) AS total_amount,
  AVG(p.monto) AS average_amount
FROM pago p
WHERE p.comunidad_id = ? /* :comunidad_id */
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
  END AS payment_method,
  COUNT(*) AS count,
  SUM(p.monto) AS total_amount,
  AVG(p.monto) AS average_amount
FROM pago p
WHERE p.comunidad_id = ? /* :comunidad_id */
GROUP BY p.medio
ORDER BY total_amount DESC;

-- ===========================================
-- 9. PAGOS PENDIENTES DE APLICACIÓN
-- Consulta de pagos que aún no se han aplicado completamente
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
  p.monto AS total_payment,
  COALESCE(SUM(pa.monto), 0) AS applied_amount,
  (p.monto - COALESCE(SUM(pa.monto), 0)) AS remaining_amount,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
  u.codigo AS unit_number, -- CORRECCIÓN: Usar u.codigo
  CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
  p.referencia AS reference
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE p.comunidad_id = ? /* :comunidad_id */
  AND p.estado = 'pendiente'
GROUP BY p.id, p.monto, p.fecha, u.codigo, pers.nombres, pers.apellidos, p.referencia
HAVING remaining_amount > 0
ORDER BY p.fecha DESC;

-- ===========================================
-- 10. HISTORIAL DE PAGOS POR UNIDAD
-- Consulta completa del historial de pagos de una unidad
-- ===========================================
SELECT
  p.id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
  p.monto AS amount,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'approved'
    WHEN p.estado = 'reversado' THEN 'cancelled'
    ELSE 'pending'
  END AS status,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END AS payment_method,
  p.referencia AS reference,
  COALESCE(SUM(pa.monto), 0) AS applied_amount
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
WHERE p.unidad_id = ? /* :unidad_id */
GROUP BY p.id, p.fecha, p.monto, p.estado, p.medio, p.referencia
ORDER BY p.fecha DESC;

-- ===========================================
-- 11. CONCILIACIÓN BANCARIA
-- Consulta de movimientos bancarios para conciliación
-- ===========================================
SELECT
  cb.id,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m-%d') AS movement_date, -- CORRECCIÓN: Usar cb.fecha_mov
  cb.glosa, -- CORRECCIÓN: Usar cb.glosa
  cb.monto,
  COALESCE(p.medio, 'No Aplicable') AS type, -- CORRECCIÓN: No existe cb.tipo, se usa p.medio
  cb.referencia AS bank_reference, -- CORRECCIÓN: Usar cb.referencia
  p.id AS payment_id,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS payment_code,
  p.referencia AS payment_reference,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pending'
    WHEN cb.estado = 'conciliado' THEN 'reconciled'
    WHEN cb.estado = 'descartado' THEN 'discarded' -- CORRECCIÓN: Estado descartado
    ELSE 'pending'
  END AS reconciliation_status
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = ? /* :comunidad_id */
ORDER BY cb.fecha_mov DESC;

-- ===========================================
-- 12. WEBHOOKS DE PAGOS
-- Consulta de webhooks recibidos para un pago
-- ===========================================
SELECT
  wp.id,
  wp.proveedor AS evento, -- CORRECCIÓN: Usar wp.proveedor como proxy de evento
  wp.payload_json AS payload, -- CORRECCIÓN: Usar wp.payload_json
  wp.procesado,
  DATE_FORMAT(wp.fecha_recepcion, '%Y-%m-%d %H:%i:%s') AS received_at,
  wp.created_at
FROM webhook_pago wp
WHERE wp.pago_id = ? /* :pago_id */
ORDER BY wp.fecha_recepcion DESC;

-- ===========================================
-- 13. PAGOS POR PERÍODO
-- Consulta de pagos agrupados por mes/año
-- ===========================================
SELECT
  YEAR(p.fecha) AS year,
  MONTH(p.fecha) AS month,
  DATE_FORMAT(p.fecha, '%Y-%m') AS period,
  COUNT(*) AS payment_count,
  SUM(p.monto) AS total_amount,
  AVG(p.monto) AS average_amount,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_count,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_count,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_count
FROM pago p
WHERE p.comunidad_id = ? /* :comunidad_id */
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
  END AS validation_status,
  p.monto,
  p.fecha,
  p.estado,
  COUNT(pa.id) AS application_count,
  COALESCE(SUM(pa.monto), 0) AS applied_amount
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
WHERE p.comunidad_id = ? /* :comunidad_id */
GROUP BY p.id, p.comunidad_id, p.monto, p.fecha, p.estado
HAVING validation_status != 'Valid'
ORDER BY p.id;

-- ===========================================
-- 15. RESUMEN DE PAGOS POR RESIDENTE
-- Consulta consolidada de pagos por residente
-- ===========================================
SELECT
  pers.id AS resident_id,
  CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
  pers.email AS resident_email,
  u.codigo AS unit_number, -- CORRECCIÓN: Usar u.codigo
  COUNT(p.id) AS total_payments,
  SUM(p.monto) AS total_paid,
  AVG(p.monto) AS average_payment,
  MAX(p.fecha) AS last_payment_date,
  COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_payments,
  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_payments,
  COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_payments
FROM persona pers
-- CORRECCIÓN: Se asume que el titular relevante es el propietario activo.
LEFT JOIN titulares_unidad tu ON pers.id = tu.persona_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN unidad u ON tu.unidad_id = u.id
LEFT JOIN pago p ON pers.id = p.persona_id
WHERE u.comunidad_id = ? /* :comunidad_id */
GROUP BY pers.id, pers.nombres, pers.apellidos, pers.email, u.codigo
HAVING COUNT(p.id) > 0
ORDER BY total_paid DESC;