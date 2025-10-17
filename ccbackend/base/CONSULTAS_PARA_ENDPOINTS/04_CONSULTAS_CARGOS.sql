-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE CARGOS
-- Extraído de los endpoints y componentes frontend
--
-- NOTA: Corregido para usar nombres de tablas y columnas según el esquema 'cuentasclaras'.
-- Se ajustó la lógica del campo 'tipo' ya que 'emision_gastos_comunes.periodo' es solo 'YYYY-MM'.
-- ===========================================

-- ===========================================
-- 1. LISTAR CARGOS (GET /cargos)
-- Consulta principal para obtener todas las cuentas de cobro con filtros opcionales
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS concepto,
  -- CORRECCIÓN (Lógica simplificada): Inferir tipo de cargo basado en el tipo de emisión o el estado.
  CASE
    WHEN ccu.interes_acumulado > 0 THEN 'interes'
    WHEN egc.observaciones LIKE '%Extraordinario%' THEN 'extraordinaria'
    -- Una solución más robusta requeriría inspeccionar detalle_cuenta_unidad.origen
    ELSE 'Administración'
  END AS tipo,
  ccu.monto_total AS monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
  ccu.estado, -- El estado ya está en el formato de la columna enum
  u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
  c.razon_social AS nombre_comunidad,
  egc.periodo AS periodo,
  CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
  ccu.saldo AS saldo,
  ccu.interes_acumulado AS interes_acumulado,
  DATE_FORMAT(ccu.created_at, '%Y-%m-%d') AS fecha_creacion,
  ccu.updated_at
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN (
    -- Lógica para obtener el propietario activo más reciente
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
) AS tu ON u.id = tu.unidad_id
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
SELECT COUNT(*) AS total
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
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS concepto,
  -- CORRECCIÓN (Lógica simplificada): Inferir tipo de cargo basado en el tipo de emisión o el estado.
  CASE
    WHEN ccu.interes_acumulado > 0 THEN 'interes'
    WHEN egc.observaciones LIKE '%Extraordinario%' THEN 'extraordinaria'
    ELSE 'Administración'
  END AS tipo,
  ccu.monto_total AS monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
  ccu.estado, -- El estado ya está en el formato de la columna enum
  u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
  c.razon_social AS nombre_comunidad,
  egc.periodo AS periodo,
  CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
  p.email AS email_propietario,
  p.telefono AS telefono_propietario,
  ccu.saldo AS saldo,
  ccu.interes_acumulado AS interes_acumulado,
  DATE_FORMAT(ccu.created_at, '%Y-%m-%d') AS fecha_creacion,
  ccu.updated_at,
  egc.observaciones AS descripcion
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
) AS tu ON u.id = tu.unidad_id
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.id = 1;

-- ===========================================
-- 4. DETALLE DE CARGOS POR UNIDAD (GET /cargos/unidad/:unidad)
-- Consulta de todos los cargos de una unidad específica
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS concepto,
  -- CORRECCIÓN (Lógica simplificada): Inferir tipo de cargo basado en el tipo de emisión o el estado.
  CASE
    WHEN ccu.interes_acumulado > 0 THEN 'interes'
    WHEN egc.observaciones LIKE '%Extraordinario%' THEN 'extraordinaria'
    ELSE 'Administración'
  END AS tipo,
  ccu.monto_total AS monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
  -- CORRECCIÓN: Mantener el estado de la base de datos, ya que el mapeo a inglés se hace en la aplicación.
  ccu.estado,
  u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
  c.razon_social AS nombre_comunidad,
  egc.periodo AS periodo,
  ccu.saldo AS saldo,
  ccu.interes_acumulado AS interes_acumulado,
  DATE_FORMAT(ccu.created_at, '%Y-%m-%d') AS fecha_creacion,
  ccu.updated_at
FROM cuenta_cobro_unidad ccu
JOIN comunidad c ON ccu.comunidad_id = c.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE u.codigo = '10' -- CORRECCIÓN: Asumiendo que se busca el código de la unidad (VARCHAR)
ORDER BY ccu.created_at DESC;

-- ===========================================
-- 5. DETALLE DE CARGOS (breakdown por categoría)
-- Consulta del detalle de gastos que componen un cargo
-- ===========================================
SELECT
  dcu.id,
  cg.nombre AS categoria,
  dcu.glosa AS descripcion,
  dcu.monto AS monto,
  dcu.origen, -- El origen ya es un ENUM válido
  dcu.origen_id AS origen_id,
  dcu.iva_incluido AS iva_incluido
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
  p.id AS pago_id,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS fecha_pago,
  p.monto AS monto_pago,
  pa.monto AS monto_aplicado,
  p.medio AS metodo_pago, -- El medio ya es un ENUM válido
  p.referencia AS referencia,
  p.comprobante_num AS numero_comprobante,
  p.estado AS estado_pago, -- El estado ya es un ENUM válido
  CONCAT(pers.nombres, ' ', pers.apellidos) AS nombre_pagador,
  pers.email AS email_pagador
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
  COUNT(*) AS total_cargos,
  SUM(ccu.monto_total) AS monto_total,
  SUM(ccu.saldo) AS saldo_total,
  SUM(ccu.interes_acumulado) AS interes_total,
  AVG(ccu.monto_total) AS monto_promedio,
  COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) AS cargos_pagados,
  COUNT(CASE WHEN ccu.estado = 'pendiente' THEN 1 END) AS cargos_pendientes,
  COUNT(CASE WHEN ccu.estado = 'vencido' THEN 1 END) AS cargos_vencidos,
  COUNT(CASE WHEN ccu.estado = 'parcial' THEN 1 END) AS cargos_parciales,
  MIN(ccu.created_at) AS cargo_mas_antiguo,
  MAX(ccu.created_at) AS cargo_mas_reciente
FROM cuenta_cobro_unidad ccu
WHERE ccu.comunidad_id = 1;

-- ===========================================
-- 8. CARGOS POR PERÍODO
-- Consulta de cargos agrupados por período de emisión
-- ===========================================
SELECT
  egc.periodo AS periodo,
  COUNT(ccu.id) AS cantidad_cargos,
  SUM(ccu.monto_total) AS monto_total,
  SUM(ccu.saldo) AS saldo_total,
  COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) AS cantidad_pagados,
  COUNT(CASE WHEN ccu.estado = 'pendiente' THEN 1 END) AS cantidad_pendientes,
  COUNT(CASE WHEN ccu.estado = 'vencido' THEN 1 END) AS cantidad_vencidos,
  MIN(egc.fecha_vencimiento) AS fecha_vencimiento
FROM emision_gastos_comunes egc
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.comunidad_id = 1
GROUP BY egc.id, egc.periodo, egc.fecha_vencimiento -- Incluir id y fecha_vencimiento en el GROUP BY para evitar ambigüedad.
ORDER BY egc.periodo DESC;

-- ===========================================
-- 9. CARGOS VENCIDOS
-- Consulta de cargos que han vencido y están pendientes
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS concepto,
  ccu.monto_total AS monto,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento,
  DATEDIFF(CURDATE(), egc.fecha_vencimiento) AS dias_vencido,
  ccu.saldo AS saldo,
  ccu.interes_acumulado AS interes_acumulado,
  u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
  CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
  p.email AS email_propietario,
  c.razon_social AS nombre_comunidad
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
) AS tu ON u.id = tu.unidad_id
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
  p.id AS paymentId,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS paymentDate,
  p.monto AS totalPaymentAmount,
  pa.monto AS appliedToChargeAmount,
  p.medio AS paymentMethod, -- El medio ya es un ENUM válido
  p.referencia AS reference,
  p.comprobante_num AS receiptNumber,
  p.estado AS paymentStatus, -- El estado ya es un ENUM válido
  CONCAT(pers.nombres, ' ', pers.apellidos) AS payerName,
  pers.email AS payerEmail,
  p.created_at AS paymentCreatedAt
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
  ccu.estado, -- Mantener el valor ENUM de la columna
  COUNT(*) AS cantidad,
  SUM(ccu.monto_total) AS monto_total,
  SUM(ccu.saldo) AS saldo_total,
  AVG(ccu.monto_total) AS monto_promedio
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
  -- CORRECCIÓN: Se debe hacer un CASE/WHEN para cada condición en el SELECT y luego en el HAVING
  CASE
    WHEN ccu.emision_id IS NULL THEN 'Missing emission reference'
    WHEN ccu.unidad_id IS NULL THEN 'Missing unit reference'
    WHEN ccu.monto_total <= 0 THEN 'Invalid amount'
    WHEN COUNT(dcu.id) = 0 THEN 'No charge details found' -- CORRECCIÓN: usar COUNT(dcu.id) después del LEFT JOIN
    ELSE 'Valid'
  END AS estado_validacion,
  ccu.monto_total,
  ccu.saldo,
  COUNT(dcu.id) AS cantidad_detalles
FROM cuenta_cobro_unidad ccu
LEFT JOIN detalle_cuenta_unidad dcu ON ccu.id = dcu.cuenta_cobro_unidad_id
WHERE ccu.comunidad_id = 10
GROUP BY ccu.id, ccu.emision_id, ccu.unidad_id, ccu.monto_total, ccu.saldo
HAVING estado_validacion != 'Valid' -- CORRECCIÓN: Usar el alias del campo 'estado_validacion'
ORDER BY ccu.id;

-- ===========================================
-- 13. CARGOS CON INTERÉS ACUMULADO
-- Consulta de cargos que tienen interés acumulado
-- ===========================================
SELECT
  ccu.id,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS concepto,
  ccu.monto_total AS monto_original,
  ccu.saldo AS saldo_actual,
  ccu.interes_acumulado AS interes_acumulado,
  (ccu.monto_total + ccu.interes_acumulado) AS total_con_interes,
  DATEDIFF(CURDATE(), egc.fecha_vencimiento) AS dias_vencido,
  u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
  CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
  c.razon_social AS nombre_comunidad
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
) AS tu ON u.id = tu.unidad_id
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.interes_acumulado > 0
  AND ccu.comunidad_id = 1
ORDER BY ccu.interes_acumulado DESC;

-- ===========================================
-- 14. RESUMEN DE PAGOS POR CARGO
-- Consulta resumen de pagos aplicados a cada cargo
-- ===========================================
SELECT
  ccu.id AS chargeId,
  CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS concept,
  ccu.monto_total AS totalAmount,
  ccu.saldo AS remainingBalance,
  COALESCE(SUM(pa.monto), 0) AS totalPaid,
  COUNT(DISTINCT pa.pago_id) AS paymentCount,
  MAX(p.fecha) AS lastPaymentDate,
  ccu.estado AS estado_calculado -- CORRECCIÓN: Usar el estado real del cargo que refleja mejor el estado
FROM cuenta_cobro_unidad ccu
LEFT JOIN pago_aplicacion pa ON ccu.id = pa.cuenta_cobro_unidad_id
LEFT JOIN pago p ON pa.pago_id = p.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = 1
GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.created_at, egc.fecha_vencimiento, ccu.estado -- Incluir ccu.estado en GROUP BY
ORDER BY ccu.created_at DESC;

-- ===========================================
-- 15. CARGOS POR CATEGORÍA DE GASTO
-- Análisis de cargos por categoría de gasto
-- ===========================================
SELECT
  cg.nombre AS nombre_categoria,
  cg.tipo AS tipo_categoria,
  COUNT(dcu.id) AS cantidad_detalles_cargo,
  SUM(dcu.monto) AS monto_total,
  AVG(dcu.monto) AS monto_promedio,
  COUNT(DISTINCT ccu.id) AS cargos_unicos,
  COUNT(DISTINCT ccu.unidad_id) AS unidades_afectadas
FROM categoria_gasto cg
JOIN detalle_cuenta_unidad dcu ON cg.id = dcu.categoria_id
JOIN cuenta_cobro_unidad ccu ON dcu.cuenta_cobro_unidad_id = ccu.id
WHERE cg.comunidad_id = ?
GROUP BY cg.id, cg.nombre, cg.tipo;