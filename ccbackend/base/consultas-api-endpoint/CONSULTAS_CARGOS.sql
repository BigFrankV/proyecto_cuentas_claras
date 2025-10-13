-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE CARGOS
-- Extraído de los endpoints y componentes frontend
--
-- NOTA: Se corrigieron las siguientes inconsistencias con ER.sql:
-- 1. Se eliminó la referencia a columna 'principal' en titulares_unidad
--    (no existe en el esquema actual)
-- 2. Se implementó lógica para seleccionar el propietario activo más reciente
--    por unidad usando subconsultas
-- ===========================================

-- ===========================================
-- 1. LISTAR CARGOS (GET /cargos)
-- Consulta principal para obtener todas las cuentas de cobro con filtros opcionales
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
  CASE
    WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
    WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
    WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
    ELSE 'Administración'
  END as tipo,
  ccu.monto_total as monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
  CASE
    WHEN ccu.estado = 'pendiente' THEN 'pendiente'
    WHEN ccu.estado = 'pagado' THEN 'pagado'
    WHEN ccu.estado = 'vencido' THEN 'vencido'
    WHEN ccu.estado = 'parcial' THEN 'parcial'
    ELSE 'pendiente'
  END as estado,
  u.codigo as unidad,
  c.razon_social as nombre_comunidad,
  egc.periodo as periodo,
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  ccu.saldo as saldo,
  ccu.interes_acumulado as interes_acumulado,
  DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
  ccu.updated_at
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN (
    SELECT tu1.*
    FROM titulares_unidad tu1
    WHERE tu1.tipo = 'propietario'
      AND tu1.hasta IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM titulares_unidad tu2
          WHERE tu2.unidad_id = tu1.unidad_id
            AND tu2.tipo = 'propietario'
            AND tu2.hasta IS NULL
            AND tu2.created_at > tu1.created_at
      )
) tu ON u.id = tu.unidad_id
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND ccu.comunidad_id = ?
-- AND u.codigo LIKE ?
-- AND ccu.estado = ?
-- AND egc.fecha_vencimiento >= ?
-- AND egc.fecha_vencimiento <= ?
-- AND ccu.created_at >= ?
-- AND ccu.created_at <= ?
ORDER BY ccu.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR CARGOS TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) as total
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND ccu.comunidad_id = ?
-- AND u.codigo LIKE ?
-- AND ccu.estado = ?
-- AND egc.fecha_vencimiento >= ?
-- AND egc.fecha_vencimiento <= ?;

-- ===========================================
-- 3. OBTENER CARGO POR ID (GET /cargos/:id)
-- Consulta detallada de un cargo específico
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
  CASE
    WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
    WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
    WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
    ELSE 'Administración'
  END as tipo,
  ccu.monto_total as monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
  CASE
    WHEN ccu.estado = 'pendiente' THEN 'pendiente'
    WHEN ccu.estado = 'pagado' THEN 'pagado'
    WHEN ccu.estado = 'vencido' THEN 'vencido'
    WHEN ccu.estado = 'parcial' THEN 'parcial'
    ELSE 'pendiente'
  END as estado,
  u.codigo as unidad,
  c.razon_social as nombre_comunidad,
  egc.periodo as periodo,
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  p.email as email_propietario,
  p.telefono as telefono_propietario,
  ccu.saldo as saldo,
  ccu.interes_acumulado as interes_acumulado,
  DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
  ccu.updated_at,
  egc.observaciones as descripcion
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN (
    SELECT tu1.*
    FROM titulares_unidad tu1
    WHERE tu1.tipo = 'propietario'
      AND tu1.hasta IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM titulares_unidad tu2
          WHERE tu2.unidad_id = tu1.unidad_id
            AND tu2.tipo = 'propietario'
            AND tu2.hasta IS NULL
            AND tu2.created_at > tu1.created_at
      )
) tu ON u.id = tu.unidad_id
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.id = 1;

-- ===========================================
-- 4. DETALLE DE CARGOS POR UNIDAD (GET /cargos/unidad/:unidad)
-- Consulta de todos los cargos de una unidad específica
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
  CASE
    WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
    WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
    WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
    ELSE 'Administración'
  END as tipo,
  ccu.monto_total as monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
  CASE
    WHEN ccu.estado = 'pendiente' THEN 'pending'
    WHEN ccu.estado = 'pagado' THEN 'paid'
    WHEN ccu.estado = 'vencido' THEN 'overdue'
    WHEN ccu.estado = 'parcial' THEN 'partial'
    ELSE 'pending'
  END as estado,
  u.codigo as unidad,
  c.razon_social as nombre_comunidad,
  egc.periodo as periodo,
  ccu.saldo as saldo,
  ccu.interes_acumulado as interes_acumulado,
  DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
  ccu.updated_at
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE u.codigo = 10
ORDER BY ccu.created_at DESC;

-- ===========================================
-- 5. DETALLE DE CARGOS (breakdown por categoría)
-- Consulta del detalle de gastos que componen un cargo
-- ===========================================
SELECT
  dcu.id,
  cg.nombre as categoria,
  dcu.glosa as descripcion,
  dcu.monto as monto,
  CASE
    WHEN dcu.origen = 'gasto' THEN 'Gasto'
    WHEN dcu.origen = 'multa' THEN 'Multa'
    WHEN dcu.origen = 'consumo' THEN 'Consumo'
    WHEN dcu.origen = 'ajuste' THEN 'Ajuste'
    ELSE 'Otro'
  END as origen,
  dcu.origen_id as origen_id,
  dcu.iva_incluido as iva_incluido
FROM detalle_cuenta_unidad dcu
LEFT JOIN categoria_gasto cg ON dcu.categoria_id = cg.id
WHERE dcu.cuenta_cobro_unidad_id = 1
ORDER BY dcu.id;

-- ===========================================
-- 6. PAGOS APLICADOS A UN CARGO
-- Consulta de todos los pagos aplicados a un cargo específico
-- ===========================================
SELECT
  pa.id,
  p.id as pago_id,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as fecha_pago,
  p.monto as monto_pago,
  pa.monto as monto_aplicado,
  CASE
    WHEN p.medio = 'transferencia' THEN 'bank_transfer'
    WHEN p.medio = 'webpay' THEN 'webpay'
    WHEN p.medio = 'khipu' THEN 'khipu'
    WHEN p.medio = 'servipag' THEN 'servipag'
    WHEN p.medio = 'efectivo' THEN 'cash'
    ELSE p.medio
  END as metodo_pago,
  p.referencia as referencia,
  p.comprobante_num as numero_comprobante,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'applied'
    WHEN p.estado = 'reversado' THEN 'reversed'
    ELSE 'pending'
  END as estado_pago,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombre_pagador,
  pers.email as email_pagador
FROM pago_aplicacion pa
JOIN pago p ON pa.pago_id = p.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE pa.cuenta_cobro_unidad_id = 2
ORDER BY p.fecha DESC, pa.id DESC;

-- ===========================================
-- 7. ESTADÍSTICAS DE CARGOS POR COMUNIDAD
-- Consulta de estadísticas generales de cargos
-- ===========================================
SELECT
  COUNT(*) as total_cargos,
  SUM(ccu.monto_total) as monto_total,
  SUM(ccu.saldo) as saldo_total,
  SUM(ccu.interes_acumulado) as interes_total,
  AVG(ccu.monto_total) as monto_promedio,
  COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as cargos_pagados,
  COUNT(CASE WHEN ccu.estado = 'pendiente' THEN 1 END) as cargos_pendientes,
  COUNT(CASE WHEN ccu.estado = 'vencido' THEN 1 END) as cargos_vencidos,
  COUNT(CASE WHEN ccu.estado = 'parcial' THEN 1 END) as cargos_parciales,
  MIN(ccu.created_at) as cargo_mas_antiguo,
  MAX(ccu.created_at) as cargo_mas_reciente
FROM cuenta_cobro_unidad ccu
WHERE ccu.comunidad_id = 1;

-- ===========================================
-- 8. CARGOS POR PERÍODO
-- Consulta de cargos agrupados por período de emisión
-- ===========================================
SELECT
  egc.periodo as periodo,
  COUNT(ccu.id) as cantidad_cargos,
  SUM(ccu.monto_total) as monto_total,
  SUM(ccu.saldo) as saldo_total,
  COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as cantidad_pagados,
  COUNT(CASE WHEN ccu.estado = 'pendiente' THEN 1 END) as cantidad_pendientes,
  COUNT(CASE WHEN ccu.estado = 'vencido' THEN 1 END) as cantidad_vencidos,
  MIN(egc.fecha_vencimiento) as fecha_vencimiento
FROM emision_gastos_comunes egc
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.comunidad_id = 1
GROUP BY egc.periodo, egc.id
ORDER BY egc.periodo DESC;

-- ===========================================
-- 9. CARGOS VENCIDOS
-- Consulta de cargos que han vencido y están pendientes
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
  ccu.monto_total as monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
  DATEDIFF(CURDATE(), egc.fecha_vencimiento) as dias_vencido,
  ccu.saldo as saldo,
  ccu.interes_acumulado as interes_acumulado,
  u.codigo as unidad,
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  p.email as email_propietario,
  c.razon_social as nombre_comunidad
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN (
    SELECT tu1.*
    FROM titulares_unidad tu1
    WHERE tu1.tipo = 'propietario'
      AND tu1.hasta IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM titulares_unidad tu2
          WHERE tu2.unidad_id = tu1.unidad_id
            AND tu2.tipo = 'propietario'
            AND tu2.hasta IS NULL
            AND tu2.created_at > tu1.created_at
      )
) tu ON u.id = tu.unidad_id
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.estado IN ('pendiente', 'parcial', 'vencido')
  AND egc.fecha_vencimiento < CURDATE()
  AND ccu.comunidad_id = 1
ORDER BY egc.fecha_vencimiento ASC, ccu.saldo DESC;

-- ===========================================
-- 10. HISTORIAL DE PAGOS POR CARGO
-- Consulta completa del historial de pagos de un cargo
-- ===========================================
SELECT
  p.id as paymentId,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
  p.monto as totalPaymentAmount,
  pa.monto as appliedToChargeAmount,
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
  CASE
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'aplicado' THEN 'applied'
    WHEN p.estado = 'reversado' THEN 'reversed'
    ELSE 'pending'
  END as paymentStatus,
  CONCAT(pers.nombres, ' ', pers.apellidos) as payerName,
  pers.email as payerEmail,
  p.created_at as paymentCreatedAt
FROM pago_aplicacion pa
JOIN pago p ON pa.pago_id = p.id
LEFT JOIN persona pers ON p.persona_id = pers.id
WHERE pa.cuenta_cobro_unidad_id = 3
ORDER BY p.fecha DESC, p.created_at DESC;

-- ===========================================
-- 11. CARGOS POR ESTADO Y COMUNIDAD
-- Consulta agrupada por estado para dashboard
-- ===========================================
SELECT
  CASE
    WHEN ccu.estado = 'pendiente' THEN 'pending'
    WHEN ccu.estado = 'pagado' THEN 'paid'
    WHEN ccu.estado = 'vencido' THEN 'overdue'
    WHEN ccu.estado = 'parcial' THEN 'partial'
    ELSE 'pending'
  END as estado,
  COUNT(*) as cantidad,
  SUM(ccu.monto_total) as monto_total,
  SUM(ccu.saldo) as saldo_total,
  AVG(ccu.monto_total) as monto_promedio
FROM cuenta_cobro_unidad ccu
WHERE ccu.comunidad_id = 1
GROUP BY ccu.estado
ORDER BY
  CASE ccu.estado
    WHEN 'vencido' THEN 1
    WHEN 'pendiente' THEN 2
    WHEN 'parcial' THEN 3
    WHEN 'pagado' THEN 4
    ELSE 5
  END;

-- ===========================================
-- 12. VALIDACIÓN DE CARGOS
-- Verificar que los cargos tienen todos los datos necesarios
-- ===========================================
SELECT
  ccu.id,
  CASE
    WHEN ccu.emision_id IS NULL THEN 'Missing emission reference'
    WHEN ccu.unidad_id IS NULL THEN 'Missing unit reference'
    WHEN ccu.monto_total <= 0 THEN 'Invalid amount'
    WHEN NOT EXISTS (
      SELECT 1 FROM detalle_cuenta_unidad dcu
      WHERE dcu.cuenta_cobro_unidad_id = ccu.id
    ) THEN 'No charge details found'
    ELSE 'Valid'
  END as estado_validacion,
  ccu.monto_total,
  ccu.saldo,
  COUNT(dcu.id) as cantidad_detalles
FROM cuenta_cobro_unidad ccu
LEFT JOIN detalle_cuenta_unidad dcu ON ccu.id = dcu.cuenta_cobro_unidad_id
WHERE ccu.comunidad_id = 10
GROUP BY ccu.id, ccu.emision_id, ccu.unidad_id, ccu.monto_total, ccu.saldo
HAVING validation_status != 'Valid'
ORDER BY ccu.id;

-- ===========================================
-- 13. CARGOS CON INTERÉS ACUMULADO
-- Consulta de cargos que tienen interés acumulado
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
  ccu.monto_total as monto_original,
  ccu.saldo as saldo_actual,
  ccu.interes_acumulado as interes_acumulado,
  (ccu.monto_total + ccu.interes_acumulado) as total_con_interes,
  DATEDIFF(CURDATE(), egc.fecha_vencimiento) as dias_vencido,
  u.codigo as unidad,
  CONCAT(p.nombres, ' ', p.apellidos) as propietario,
  c.razon_social as nombre_comunidad
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN (
    SELECT tu1.*
    FROM titulares_unidad tu1
    WHERE tu1.tipo = 'propietario'
      AND tu1.hasta IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM titulares_unidad tu2
          WHERE tu2.unidad_id = tu1.unidad_id
            AND tu2.tipo = 'propietario'
            AND tu2.hasta IS NULL
            AND tu2.created_at > tu1.created_at
      )
) tu ON u.id = tu.unidad_id
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.interes_acumulado > 0
  AND ccu.comunidad_id = 1
ORDER BY ccu.interes_acumulado DESC;

-- ===========================================
-- 14. RESUMEN DE PAGOS POR CARGO
-- Consulta resumen de pagos aplicados a cada cargo
-- ===========================================
SELECT
  ccu.id as chargeId,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concept,
  ccu.monto_total as totalAmount,
  ccu.saldo as remainingBalance,
  COALESCE(SUM(pa.monto), 0) as totalPaid,
  COUNT(DISTINCT pa.pago_id) as paymentCount,
  MAX(p.fecha) as lastPaymentDate,
  CASE
    WHEN ccu.saldo <= 0 THEN 'paid'
    WHEN COALESCE(SUM(pa.monto), 0) > 0 THEN 'partial'
    WHEN egc.fecha_vencimiento < CURDATE() THEN 'overdue'
    ELSE 'pending'
  END as estado_calculado
FROM cuenta_cobro_unidad ccu
LEFT JOIN pago_aplicacion pa ON ccu.id = pa.cuenta_cobro_unidad_id
LEFT JOIN pago p ON pa.pago_id = p.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = 1
GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.created_at, egc.fecha_vencimiento
ORDER BY ccu.created_at DESC;

-- ===========================================
-- 15. CARGOS POR CATEGORÍA DE GASTO
-- Análisis de cargos por categoría de gasto
-- ===========================================
SELECT
  cg.nombre as nombre_categoria,
  cg.tipo as tipo_categoria,
  COUNT(dcu.id) as cantidad_detalles_cargo,
  SUM(dcu.monto) as monto_total,
  AVG(dcu.monto) as monto_promedio,
  COUNT(DISTINCT ccu.id) as cargos_unicos,
  COUNT(DISTINCT ccu.unidad_id) as unidades_afectadas
FROM categoria_gasto cg
JOIN detalle_cuenta_unidad dcu ON cg.id = dcu.categoria_id
JOIN cuenta_cobro_unidad ccu ON dcu.cuenta_cobro_unidad_id = ccu.id
WHERE cg.comunidad_id = ?
GROUP BY cg.id, cg.nombre, cg.tipo