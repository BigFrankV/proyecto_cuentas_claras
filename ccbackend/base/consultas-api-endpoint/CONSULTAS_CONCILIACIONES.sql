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
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
  cb.fecha_mov as fechaMovimiento,
  cb.glosa,
  cb.monto as monto,
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  cb.referencia as referenciaBancaria,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pendiente'
    WHEN cb.estado = 'conciliado' THEN 'conciliado'
    WHEN cb.estado = 'descartado' THEN 'descartado'
    ELSE 'pendiente'
  END as estadoConciliacion,
  p.id as idPago,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago,
  p.referencia as referenciaPago,
  c.razon_social as nombreComunidad,
  cb.created_at,
  cb.updated_at
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND cb.comunidad_id = ?
-- AND cb.estado = ?
-- AND cb.fecha_mov >= ?
-- AND cb.fecha_mov <= ?
ORDER BY cb.fecha_mov DESC, cb.created_at DESC
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
-- AND cb.estado = ?
-- AND cb.fecha_mov >= ?
-- AND cb.fecha_mov <= ?;

-- ===========================================
-- 3. OBTENER CONCILIACIÓN POR ID (GET /conciliaciones/:id)
-- Consulta detallada de una conciliación específica
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
  cb.fecha_mov as fechaMovimiento,
  cb.glosa,
  cb.monto as monto,
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  cb.referencia as referenciaBancaria,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pendiente'
    WHEN cb.estado = 'conciliado' THEN 'conciliado'
    WHEN cb.estado = 'descartado' THEN 'descartado'
    ELSE 'pendiente'
  END as estadoConciliacion,
  p.id as idPago,
  CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago,
  p.referencia as referenciaPago,
  p.monto as montoPago,
  CASE
    WHEN p.estado = 'pendiente' THEN 'pendiente'
    WHEN p.estado = 'aplicado' THEN 'aplicado'
    WHEN p.estado = 'reversado' THEN 'reversado'
    ELSE 'pendiente'
  END as estadoPago,
  c.razon_social as nombreComunidad,
  u.codigo as numeroUnidad,
  CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
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
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
  cb.fecha_mov as fechaMovimiento,
  cb.glosa,
  cb.monto as monto,
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  cb.referencia as referenciaBancaria,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pendiente'
    WHEN cb.estado = 'conciliado' THEN 'conciliado'
    WHEN cb.estado = 'descartado' THEN 'descartado'
    ELSE 'pendiente'
  END as estadoConciliacion,
  p.referencia as referenciaPago,
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
  COUNT(*) as totalMovimientos,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as movimientosConciliados,
  COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) as movimientosPendientes,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as movimientosDiferencia,
  SUM(cb.monto) as montoTotal,
  AVG(cb.monto) as montoPromedio,
  COUNT(CASE WHEN cb.monto > 0 THEN 1 END) as movimientosCredito,
  COUNT(CASE WHEN cb.monto < 0 THEN 1 END) as movimientosDebito,
  MIN(cb.fecha_mov) as movimientoMasAntiguo,
  MAX(cb.fecha_mov) as movimientoMasNuevo
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = 1;

-- ===========================================
-- 6. MOVIMIENTOS BANCARIOS PENDIENTES DE CONCILIACIÓN
-- Consulta de movimientos que aún no han sido conciliados
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
  cb.fecha_mov as fechaMovimiento,
  cb.glosa,
  cb.monto as monto,
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  cb.referencia as referenciaBancaria,
  c.razon_social as nombreComunidad,
  cb.created_at
FROM conciliacion_bancaria cb
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.estado = 'pendiente'
  AND cb.comunidad_id = 1
ORDER BY cb.fecha_mov ASC;

-- ===========================================
-- 7. CONCILIACIONES POR ESTADO
-- Consulta agrupada por estado de conciliación
-- ===========================================
SELECT
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pendiente'
    WHEN cb.estado = 'conciliado' THEN 'conciliado'
    WHEN cb.estado = 'descartado' THEN 'diferencia'
    ELSE 'pendiente'
  END as estado,
  COUNT(*) as cantidad,
  SUM(cb.monto) as montoTotal,
  AVG(cb.monto) as montoPromedio
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = 1
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
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  COUNT(*) as cantidad,
  SUM(cb.monto) as montoTotal,
  AVG(cb.monto) as montoPromedio,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as cantidadConciliada
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = 1
GROUP BY CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END
ORDER BY montoTotal DESC;

-- ===========================================
-- 9. MOVIMIENTOS CON DIFERENCIAS
-- Consulta de movimientos que tienen diferencias pendientes
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
  cb.fecha_mov as fechaMovimiento,
  cb.glosa,
  cb.monto as montoBancario,
  p.monto as montoPago,
  (cb.monto - COALESCE(p.monto, 0)) as diferencia,
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  cb.referencia as referenciaBancaria,
  p.referencia as referenciaPago,
  c.razon_social as nombreComunidad
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
JOIN comunidad c ON cb.comunidad_id = c.id
WHERE cb.estado = 'descartado'
  AND cb.comunidad_id = 1
ORDER BY ABS(cb.monto - COALESCE(p.monto, 0)) DESC;

-- ===========================================
-- 10. HISTORIAL DE CONCILIACIONES POR PERÍODO
-- Consulta de conciliaciones agrupadas por mes/año
-- ===========================================
SELECT
  YEAR(cb.fecha_mov) as ano,
  MONTH(cb.fecha_mov) as mes,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m') as periodo,
  COUNT(*) as totalMovimientos,
  SUM(cb.monto) as montoTotal,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as cantidadConciliada,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as cantidadDiferencia,
  COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) as cantidadPendiente,
  ROUND(
    (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
    2
  ) as porcentajeConciliacion
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = 1
GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
ORDER BY ano DESC, mes DESC;

-- ===========================================
-- 11. SALDOS BANCARIOS VS CONTABLES
-- Comparación de saldos bancarios contra registros contables
-- ===========================================
SELECT
  YEAR(cb.fecha_mov) as ano,
  MONTH(cb.fecha_mov) as mes,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m') as periodo,
  -- Saldos bancarios
  SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) as creditosBancarios,
  SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END) as debitosBancarios,
  (
    SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) -
    SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
  ) as saldoBancario,
  -- Saldos contables (pagos)
  COALESCE(SUM(p.monto), 0) as pagosContables,
  -- Diferencias
  (
    SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) -
    SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
  ) - COALESCE(SUM(p.monto), 0) as diferencia
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id AND p.estado = 'aplicado'
WHERE cb.comunidad_id = 1
GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
ORDER BY ano DESC, mes DESC;

-- ===========================================
-- 12. VALIDACIÓN DE CONCILIACIONES
-- Verificar que las conciliaciones tienen todos los datos necesarios
-- ===========================================
SELECT
  cb.id,
  CASE
    WHEN cb.comunidad_id IS NULL THEN 'Falta referencia de comunidad'
    WHEN cb.fecha_mov IS NULL THEN 'Falta fecha de movimiento'
    WHEN cb.monto = 0 THEN 'Monto inválido'
    WHEN cb.estado NOT IN ('pendiente', 'conciliado', 'descartado') THEN 'Estado de conciliación inválido'
    ELSE 'Valido'
  END as estado_validacion,
  cb.monto,
  cb.fecha_mov,
  cb.estado,
  CASE WHEN cb.pago_id IS NOT NULL THEN 'Vinculado' ELSE 'Sin vincular' END as estado_vinculacion_pago
FROM conciliacion_bancaria cb
WHERE cb.comunidad_id = ?
HAVING estado_validacion != 'Valido'
ORDER BY cb.id;

-- ===========================================
-- 13. MOVIMIENTOS BANCARIOS SIN PAGOS ASOCIADOS
-- Consulta de movimientos bancarios que no tienen pagos vinculados
-- ===========================================
SELECT
  cb.id,
  CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
  cb.fecha_mov as fechaMovimiento,
  cb.glosa,
  cb.monto as monto,
  CASE
    WHEN cb.monto > 0 THEN 'credito'
    WHEN cb.monto < 0 THEN 'debito'
    ELSE 'otro'
  END as tipo,
  cb.referencia as referenciaBancaria,
  CASE
    WHEN cb.estado = 'pendiente' THEN 'pendiente'
    WHEN cb.estado = 'conciliado' THEN 'conciliado'
    WHEN cb.estado = 'descartado' THEN 'diferencia'
    ELSE 'pendiente'
  END as estadoConciliacion,
  c.razon_social as nombreComunidad,
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
  YEAR(cb.fecha_mov) as ano,
  MONTH(cb.fecha_mov) as mes,
  DATE_FORMAT(cb.fecha_mov, '%Y-%m') as periodo,
  COUNT(*) as totalMovimientos,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as movimientosConciliados,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as movimientosDiferencia,
  ROUND(
    (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
    2
  ) as porcentajePrecision,
  AVG(ABS(cb.monto - COALESCE(p.monto, 0))) as diferenciaPromedio,
  MAX(ABS(cb.monto - COALESCE(p.monto, 0))) as diferenciaMaxima
FROM conciliacion_bancaria cb
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE cb.comunidad_id = ?
GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
ORDER BY ano DESC, mes DESC;

-- ===========================================
-- 15. RESUMEN DE CONCILIACIONES POR COMUNIDAD
-- Vista consolidada de todas las conciliaciones por comunidad
-- ===========================================
SELECT
  c.razon_social as nombreComunidad,
  COUNT(cb.id) as totalMovimientos,
  COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as movimientosConciliados,
  COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) as movimientosPendientes,
  COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as movimientosDiferencia,
  SUM(cb.monto) as montoBancarioTotal,
  COUNT(DISTINCT p.id) as pagosVinculados,
  ROUND(
    (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(cb.id),
    2
  ) as tasaConciliacion,
  MIN(cb.fecha_mov) as movimientoMasAntiguo,
  MAX(cb.fecha_mov) as movimientoMasNuevo
FROM comunidad c
LEFT JOIN conciliacion_bancaria cb ON c.id = cb.comunidad_id
LEFT JOIN pago p ON cb.pago_id = p.id
WHERE c.id = ?
GROUP BY c.id, c.razon_social;</content>
<parameter name="filePath">c:\Users\patri\Documents\GitHub\proyecto_cuentas_claras\ccbackend\base\CONSULTAS_CONCILIACIONES.sql
