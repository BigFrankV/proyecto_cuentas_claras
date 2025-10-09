-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE EMISIONES
-- Extraído de los endpoints y componentes frontend
-- ===========================================

-- ===========================================
-- 1. LISTAR EMISIONES (GET /emisiones)
-- Consulta principal para obtener todas las emisiones con filtros opcionales
-- ===========================================
SELECT
  egc.id,
  egc.periodo,
  CASE
    WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
    WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
    WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
    ELSE 'gastos_comunes'
  END as tipo,
  CASE
    WHEN egc.estado = 'borrador' THEN 'draft'
    WHEN egc.estado = 'emitido' THEN 'sent'
    WHEN egc.estado = 'cerrado' THEN 'paid'
    WHEN egc.estado = 'anulado' THEN 'cancelled'
    ELSE 'ready'
  END as status,
  DATE_FORMAT(egc.created_at, '%Y-%m-%d') as issueDate,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as dueDate,
  COALESCE(SUM(ccu.monto_total), 0) as totalAmount,
  COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as paidAmount,
  COUNT(DISTINCT ccu.unidad_id) as unitCount,
  egc.observaciones as description,
  c.razon_social as communityName,
  egc.created_at,
  egc.updated_at
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND egc.comunidad_id = ?
-- AND egc.periodo LIKE ?
-- AND egc.estado = ?
-- AND egc.created_at >= ?
-- AND egc.created_at <= ?
GROUP BY egc.id, egc.periodo, egc.estado, egc.created_at, egc.fecha_vencimiento, egc.observaciones, c.razon_social, egc.updated_at
ORDER BY egc.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR EMISIONES TOTALES (para paginación)
-- ===========================================
SELECT COUNT(DISTINCT egc.id) as total
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND egc.comunidad_id = ?
-- AND egc.periodo LIKE ?
-- AND egc.estado = ?
-- AND egc.created_at >= ?
-- AND egc.created_at <= ?;

-- ===========================================
-- 3. OBTENER EMISIÓN POR ID (GET /emisiones/:id)
-- ===========================================
SELECT
  egc.id,
  egc.periodo,
  CASE
    WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
    WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
    WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
    ELSE 'gastos_comunes'
  END as tipo,
  CASE
    WHEN egc.estado = 'borrador' THEN 'draft'
    WHEN egc.estado = 'emitido' THEN 'sent'
    WHEN egc.estado = 'cerrado' THEN 'paid'
    WHEN egc.estado = 'anulado' THEN 'cancelled'
    ELSE 'ready'
  END as status,
  DATE_FORMAT(egc.created_at, '%Y-%m-%d') as issueDate,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as dueDate,
  COALESCE(SUM(ccu.monto_total), 0) as totalAmount,
  COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as paidAmount,
  COUNT(DISTINCT ccu.unidad_id) as unitCount,
  egc.observaciones as description,
  c.razon_social as communityName,
  -- Información adicional para intereses
  CASE WHEN egc.periodo LIKE '%Interes%' THEN 1 ELSE 0 END as hasInterest,
  COALESCE(pc.tasa_mora_mensual, 2.0) as interestRate,
  COALESCE(pc.dias_gracia, 5) as gracePeriod,
  egc.created_at,
  egc.updated_at
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
LEFT JOIN parametros_cobranza pc ON c.id = pc.comunidad_id
WHERE egc.id = 1 -- Reemplazar con el ID deseado
GROUP BY egc.id, egc.periodo, egc.estado, egc.created_at, egc.fecha_vencimiento, egc.observaciones, c.razon_social, pc.tasa_mora_mensual, pc.dias_gracia, egc.updated_at;

-- ===========================================
-- 4. OBTENER CONCEPTOS/PRORRATEO DE UNA EMISIÓN
-- ===========================================
SELECT
  deg.id,
  cg.nombre as name,
  cg.nombre as description,
  deg.monto as amount,
  CASE
    WHEN deg.regla_prorrateo = 'coeficiente' THEN 'proportional'
    WHEN deg.regla_prorrateo = 'partes_iguales' THEN 'equal'
    WHEN deg.regla_prorrateo = 'consumo' THEN 'custom'
    WHEN deg.regla_prorrateo = 'fijo_por_unidad' THEN 'custom'
    ELSE 'proportional'
  END as distributionType,
  cg.nombre as category,
  deg.created_at
FROM detalle_emision_gastos deg
JOIN categoria_gasto cg ON deg.categoria_id = cg.id
WHERE deg.emision_id = 1 -- Reemplazar con el ID de emisión deseado
ORDER BY deg.created_at;

-- ===========================================
-- 5. OBTENER GASTOS INCLUIDOS EN UNA EMISIÓN
-- ===========================================
SELECT
  g.id,
  g.glosa as description,
  deg.monto as amount,
  cg.nombre as category,
  p.razon_social as supplier,
  DATE_FORMAT(g.fecha, '%Y-%m-%d') as date,
  COALESCE(dc.folio, CONCAT('Gasto #', g.id)) as document,
  g.created_at
FROM detalle_emision_gastos deg
JOIN gasto g ON deg.gasto_id = g.id
JOIN categoria_gasto cg ON deg.categoria_id = cg.id
LEFT JOIN proveedor p ON g.proveedor_id = p.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
WHERE deg.emision_id = 1 -- Reemplazar con el ID de emisión deseado
ORDER BY g.fecha DESC;

-- ===========================================
-- 6. OBTENER UNIDADES Y PRORRATEO DE UNA EMISIÓN
-- ===========================================
SELECT
  u.id,
  u.codigo as number,
  CASE
    WHEN u.m2_utiles > 0 THEN 'Departamento'
    WHEN u.nro_estacionamiento IS NOT NULL THEN 'Estacionamiento'
    WHEN u.nro_bodega IS NOT NULL THEN 'Bodega'
    ELSE 'Unidad'
  END as type,
  COALESCE(
    CONCAT(p.nombres, ' ', p.apellidos),
    tu.nombre_titular,
    'Sin asignar'
  ) as owner,
  COALESCE(
    p.email,
    tu.email_contacto,
    ''
  ) as contact,
  u.alicuota as participation,
  ccu.monto_total as totalAmount,
  (ccu.monto_total - ccu.saldo) as paidAmount,
  CASE
    WHEN ccu.estado = 'pagado' THEN 'paid'
    WHEN ccu.estado = 'parcial' THEN 'partial'
    WHEN ccu.estado = 'vencido' THEN 'pending'
    ELSE 'pending'
  END as status,
  ccu.created_at
FROM cuenta_cobro_unidad ccu
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.activo = 1
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.emision_id = 1 -- Reemplazar con el ID de emisión deseado
ORDER BY u.codigo;

-- ===========================================
-- 7. OBTENER PAGOS REALIZADOS PARA UNA EMISIÓN
-- ===========================================
SELECT
  p.id,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') as date,
  pa.monto as amount,
  CASE
    WHEN p.medio = 'transferencia' THEN 'Transferencia'
    WHEN p.medio = 'webpay' THEN 'WebPay'
    WHEN p.medio = 'khipu' THEN 'Khipu'
    WHEN p.medio = 'servipag' THEN 'Servipag'
    WHEN p.medio = 'efectivo' THEN 'Efectivo'
    ELSE p.medio
  END as method,
  p.referencia as reference,
  u.codigo as unit,
  CASE
    WHEN p.estado = 'aplicado' THEN 'confirmed'
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'reversado' THEN 'rejected'
    ELSE 'pending'
  END as status,
  p.created_at
FROM pago_aplicacion pa
JOIN pago p ON pa.pago_id = p.id
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
JOIN unidad u ON ccu.unidad_id = u.id
WHERE ccu.emision_id = 1 -- Reemplazar con el ID de emisión deseado
ORDER BY p.fecha DESC, p.created_at DESC;

-- ===========================================
-- 8. OBTENER HISTORIAL DE CAMBIOS DE UNA EMISIÓN
-- ===========================================
SELECT
  a.id,
  DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as date,
  CASE
    WHEN a.accion = 'INSERT' THEN 'Emisión creada'
    WHEN a.accion = 'UPDATE' THEN 'Emisión actualizada'
    WHEN a.accion = 'DELETE' THEN 'Emisión eliminada'
    ELSE CONCAT('Acción: ', a.accion)
  END as action,
  COALESCE(u.username, 'Sistema') as user,
  CASE
    WHEN a.accion = 'INSERT' THEN 'Se creó la emisión'
    WHEN a.accion = 'UPDATE' THEN 'Se modificaron datos de la emisión'
    WHEN a.accion = 'DELETE' THEN 'Se eliminó la emisión'
    ELSE 'Cambio en emisión'
  END as description,
  a.created_at
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.tabla = 'emision_gastos_comunes' AND a.registro_id = 1 -- Reemplazar con el ID de emisión deseado
ORDER BY a.created_at DESC;

-- ===========================================
-- 9. CREAR NUEVA EMISIÓN (POST /emisiones)
-- ===========================================
INSERT INTO emision_gastos_comunes (
  comunidad_id,
  periodo,
  fecha_vencimiento,
  estado,
  observaciones
) VALUES (
  1, -- comunidad_id
  '2025-09', -- periodo (YYYY-MM)
  '2025-09-15', -- fecha_vencimiento
  'borrador', -- estado inicial
  'Emisión de gastos comunes del mes de septiembre' -- observaciones
);

-- Después de crear la emisión, insertar los detalles de gastos
INSERT INTO detalle_emision_gastos (
  emision_id,
  gasto_id,
  categoria_id,
  monto,
  regla_prorrateo
) VALUES
(1, 1, 1, 450000.00, 'coeficiente'), -- Reemplazar con IDs reales
(1, 2, 2, 730000.00, 'coeficiente');

-- Después de crear los detalles, generar las cuentas de cobro por unidad
INSERT INTO cuenta_cobro_unidad (
  emision_id,
  comunidad_id,
  unidad_id,
  monto_total,
  saldo,
  estado
)
SELECT
  1, -- emision_id
  u.comunidad_id,
  u.id,
  -- Calcular monto total basado en alícuota y gastos prorrateados
  ROUND(SUM(deg.monto * u.alicuota / 100), 0),
  -- Saldo inicial igual al monto total
  ROUND(SUM(deg.monto * u.alicuota / 100), 0),
  'pendiente'
FROM unidad u
CROSS JOIN detalle_emision_gastos deg
WHERE deg.emision_id = 1
  AND u.activa = 1
  AND u.comunidad_id = 1 -- misma comunidad que la emisión
GROUP BY u.id, u.comunidad_id;

-- ===========================================
-- 10. ACTUALIZAR EMISIÓN (PATCH /emisiones/:id)
-- ===========================================
UPDATE emision_gastos_comunes
SET
  estado = 'emitido', -- cambiar estado
  observaciones = 'Emisión enviada a unidades', -- actualizar observaciones
  updated_at = NOW()
WHERE id = 1; -- Reemplazar con el ID deseado

-- ===========================================
-- 11. ELIMINAR EMISIÓN (DELETE /emisiones/:id)
-- ===========================================
-- Primero eliminar las aplicaciones de pago relacionadas
DELETE pa FROM pago_aplicacion pa
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
WHERE ccu.emision_id = 1;

-- Después eliminar las cuentas de cobro
DELETE FROM cuenta_cobro_unidad WHERE emision_id = 1;

-- Después eliminar los detalles de gastos
DELETE FROM detalle_emision_gastos WHERE emision_id = 1;

-- Finalmente eliminar la emisión
DELETE FROM emision_gastos_comunes WHERE id = 1;

-- ===========================================
-- 12. ESTADÍSTICAS Y REPORTES
-- ===========================================

-- Estadísticas generales de emisiones
SELECT
  COUNT(*) as total_emisiones,
  SUM(CASE WHEN estado = 'emitido' THEN 1 ELSE 0 END) as emitidas,
  SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerradas,
  SUM(CASE WHEN estado = 'anulado' THEN 1 ELSE 0 END) as anuladas,
  AVG(total_monto) as monto_promedio,
  MAX(total_monto) as monto_maximo,
  MIN(total_monto) as monto_minimo
FROM (
  SELECT
    egc.id,
    egc.estado,
    COALESCE(SUM(ccu.monto_total), 0) as total_monto
  FROM emision_gastos_comunes egc
  LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
  GROUP BY egc.id, egc.estado
) as emisiones_estadisticas;

-- Emisiones por estado y mes
SELECT
  DATE_FORMAT(created_at, '%Y-%m') as mes,
  estado,
  COUNT(*) as cantidad,
  SUM(total_monto) as monto_total
FROM (
  SELECT
    egc.id,
    egc.estado,
    egc.created_at,
    COALESCE(SUM(ccu.monto_total), 0) as total_monto
  FROM emision_gastos_comunes egc
  LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
  GROUP BY egc.id, egc.estado, egc.created_at
) as emisiones_mes
GROUP BY DATE_FORMAT(created_at, '%Y-%m'), estado
ORDER BY mes DESC, estado;

-- Cobranza por emisión
SELECT
  egc.id,
  egc.periodo,
  c.razon_social as comunidad,
  SUM(ccu.monto_total) as total_emitido,
  SUM(ccu.monto_total - ccu.saldo) as total_cobrado,
  ROUND((SUM(ccu.monto_total - ccu.saldo) / SUM(ccu.monto_total)) * 100, 2) as porcentaje_cobranza,
  COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as unidades_pagadas,
  COUNT(ccu.unidad_id) as total_unidades
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.estado IN ('emitido', 'cerrado')
GROUP BY egc.id, egc.periodo, c.razon_social
ORDER BY egc.created_at DESC;

-- ===========================================
-- 13. VALIDACIONES Y VERIFICACIONES
-- ===========================================

-- Verificar si ya existe una emisión para el mismo período y comunidad
SELECT COUNT(*) as existe_emision
FROM emision_gastos_comunes
WHERE comunidad_id = 1 AND periodo = '2025-09';

-- Verificar que todos los gastos incluidos existen y están activos
SELECT
  deg.emision_id,
  COUNT(*) as total_gastos_incluidos,
  SUM(CASE WHEN g.id IS NULL THEN 1 ELSE 0 END) as gastos_inexistentes
FROM detalle_emision_gastos deg
LEFT JOIN gasto g ON deg.gasto_id = g.id
WHERE deg.emision_id = 1
GROUP BY deg.emision_id;

-- Verificar integridad de cuentas de cobro
SELECT
  'cuentas_cobro' as tipo_verificacion,
  COUNT(*) as total_registros,
  SUM(CASE WHEN ccu.monto_total <= 0 THEN 1 ELSE 0 END) as montos_invalidos,
  SUM(CASE WHEN ccu.saldo > ccu.monto_total THEN 1 ELSE 0 END) as saldos_invalidos
FROM cuenta_cobro_unidad ccu
WHERE ccu.emision_id = 1;

-- Verificar que todas las unidades activas tienen cuenta de cobro
SELECT
  'cobertura_unidades' as tipo_verificacion,
  COUNT(DISTINCT u.id) as unidades_activas,
  COUNT(DISTINCT ccu.unidad_id) as unidades_con_cobro,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT ccu.unidad_id) as unidades_faltantes
FROM unidad u
LEFT JOIN cuenta_cobro_unidad ccu ON u.id = ccu.unidad_id AND ccu.emision_id = 1
WHERE u.activa = 1 AND u.comunidad_id = 1;