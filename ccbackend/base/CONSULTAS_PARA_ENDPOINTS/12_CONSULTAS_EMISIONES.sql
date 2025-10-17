-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE EMISIONES
-- Sistema de Cuentas Claras
-- ===========================================

-- ===========================================
-- 1. LISTAR EMISIONES (GET /emisiones)
-- Consulta principal para obtener todas las emisiones con filtros opcionales
-- ===========================================
SELECT
  egc.id,
  egc.periodo,
  -- CORRECCIÓN: El periodo solo es YYYY-MM, la clasificación es inviable. Se asume tipo principal.
  'gastos_comunes' AS tipo,
  CASE
    WHEN egc.estado = 'borrador' THEN 'draft'
    WHEN egc.estado = 'emitido' THEN 'sent'
    WHEN egc.estado = 'cerrado' THEN 'paid'
    WHEN egc.estado = 'anulado' THEN 'cancelled'
    ELSE 'ready'
  END AS status,
  DATE_FORMAT(egc.created_at, '%Y-%m-%d') AS issue_date,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS due_date,
  COALESCE(SUM(ccu.monto_total), 0) AS total_amount,
  COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) AS paid_amount,
  COUNT(DISTINCT ccu.unidad_id) AS unit_count,
  egc.observaciones AS description,
  c.razon_social AS community_name,
  egc.created_at,
  egc.updated_at
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
GROUP BY
    egc.id,
    egc.periodo,
    egc.estado,
    egc.created_at,
    egc.fecha_vencimiento,
    egc.observaciones,
    c.razon_social,
    egc.updated_at
ORDER BY egc.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR EMISIONES TOTALES (para paginación)
-- ===========================================
SELECT COUNT(DISTINCT egc.id) AS total
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE 1=1
-- Filtros opcionales (ejemplo de uso de placeholders):
-- AND egc.comunidad_id = ? /* :comunidad_id */
-- AND egc.periodo LIKE CONCAT('%', ?, '%') /* :periodo_search */
-- AND egc.estado = ? /* :estado */
-- AND egc.created_at >= ? /* :created_at_desde */
-- AND egc.created_at <= ?; /* :created_at_hasta */

-- ===========================================
-- 3. OBTENER EMISIÓN POR ID (GET /emisiones/:id)
-- ===========================================
SELECT
  egc.id,
  egc.periodo,
  -- CORRECCIÓN: Clasificación inviable. Se asume tipo principal.
  'gastos_comunes' AS tipo,
  CASE
    WHEN egc.estado = 'borrador' THEN 'draft'
    WHEN egc.estado = 'emitido' THEN 'sent'
    WHEN egc.estado = 'cerrado' THEN 'paid'
    WHEN egc.estado = 'anulado' THEN 'cancelled'
    ELSE 'ready'
  END AS status,
  DATE_FORMAT(egc.created_at, '%Y-%m-%d') AS issue_date,
  DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS due_date,
  COALESCE(SUM(ccu.monto_total), 0) AS total_amount,
  COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) AS paid_amount,
  COUNT(DISTINCT ccu.unidad_id) AS unit_count,
  egc.observaciones AS description,
  c.razon_social AS community_name,
  -- Información adicional para intereses (solo si se necesita)
  0 AS has_interest, -- CORRECCIÓN: Columna no existe, se simula 0
  COALESCE(pc.tasa_mora_mensual, 2.0) AS interest_rate,
  COALESCE(pc.dias_gracia, 5) AS grace_period,
  egc.created_at,
  egc.updated_at
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
LEFT JOIN parametros_cobranza pc ON c.id = pc.comunidad_id
WHERE egc.id = ? /* :emision_id */
GROUP BY
    egc.id,
    egc.periodo,
    egc.estado,
    egc.created_at,
    egc.fecha_vencimiento,
    egc.observaciones,
    c.razon_social,
    pc.tasa_mora_mensual,
    pc.dias_gracia,
    egc.updated_at;

-- ===========================================
-- 4. OBTENER CONCEPTOS/PRORRATEO DE UNA EMISIÓN
-- ===========================================
SELECT
  deg.id,
  cg.nombre AS name,
  cg.nombre AS description,
  deg.monto AS amount,
  CASE
    WHEN deg.regla_prorrateo = 'coeficiente' THEN 'proportional'
    WHEN deg.regla_prorrateo = 'partes_iguales' THEN 'equal'
    WHEN deg.regla_prorrateo = 'consumo' THEN 'custom'
    WHEN deg.regla_prorrateo = 'fijo_por_unidad' THEN 'custom'
    ELSE 'proportional'
  END AS distribution_type,
  cg.nombre AS category,
  deg.created_at
FROM detalle_emision_gastos deg
JOIN categoria_gasto cg ON deg.categoria_id = cg.id
WHERE deg.emision_id = ? /* :emision_id */
ORDER BY deg.created_at;

-- ===========================================
-- 5. OBTENER GASTOS INCLUIDOS EN UNA EMISIÓN
-- ===========================================
SELECT
  g.id,
  g.glosa AS description,
  deg.monto AS amount,
  cg.nombre AS category,
  p.razon_social AS supplier,
  DATE_FORMAT(g.fecha, '%Y-%m-%d') AS date,
  COALESCE(dc.folio, CONCAT('Gasto #', g.id)) AS document, -- CORRECCIÓN: Usar dc.folio
  g.created_at
FROM detalle_emision_gastos deg
JOIN gasto g ON deg.gasto_id = g.id
JOIN categoria_gasto cg ON deg.categoria_id = cg.id
-- CORRECCIÓN: El proveedor no está directamente en gasto, sino en documento_compra
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE deg.emision_id = ? /* :emision_id */
ORDER BY g.fecha DESC;

-- ===========================================
-- 6. OBTENER UNIDADES Y PRORRATEO DE UNA EMISIÓN
-- ===========================================
SELECT
  u.id,
  u.codigo AS number,
  -- CORRECCIÓN: La unidad no tiene tipos definidos. Se usa lógica simple basada en metadatos.
  CASE
    WHEN u.m2_utiles > 0 THEN 'Departamento'
    WHEN u.nro_estacionamiento IS NOT NULL THEN 'Estacionamiento'
    WHEN u.nro_bodega IS NOT NULL THEN 'Bodega'
    ELSE 'Unidad'
  END AS type,
  -- CORRECCIÓN: Se obtiene el titular activo a través de persona
  COALESCE(
    CONCAT(p.nombres, ' ', p.apellidos),
    'Sin asignar'
  ) AS owner,
  COALESCE(p.email, '') AS contact, -- CORRECCIÓN: Se obtiene email de persona
  u.alicuota AS participation,
  ccu.monto_total AS total_amount,
  (ccu.monto_total - ccu.saldo) AS paid_amount,
  CASE
    WHEN ccu.estado = 'pagado' THEN 'paid'
    WHEN ccu.estado = 'parcial' THEN 'partial'
    WHEN ccu.estado = 'vencido' THEN 'overdue' -- CORRECCIÓN: Cambiado a 'overdue'
    ELSE 'pending'
  END AS status,
  ccu.created_at
FROM cuenta_cobro_unidad ccu
JOIN unidad u ON ccu.unidad_id = u.id
-- CORRECCIÓN: Join a titulares_unidad y luego a persona para obtener datos del propietario
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.emision_id = ? /* :emision_id */
ORDER BY u.codigo;

-- ===========================================
-- 7. OBTENER PAGOS REALIZADOS PARA UNA EMISIÓN
-- ===========================================
SELECT
  p.id,
  DATE_FORMAT(p.fecha, '%Y-%m-%d') AS date,
  pa.monto AS amount,
  p.medio AS method, -- CORRECCIÓN: Usar el ENUM de p.medio
  p.referencia AS reference,
  u.codigo AS unit,
  CASE
    WHEN p.estado = 'aplicado' THEN 'confirmed'
    WHEN p.estado = 'pendiente' THEN 'pending'
    WHEN p.estado = 'reversado' THEN 'rejected'
    ELSE 'pending'
  END AS status,
  p.created_at
FROM pago_aplicacion pa
JOIN pago p ON pa.pago_id = p.id
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
JOIN unidad u ON ccu.unidad_id = u.id
WHERE ccu.emision_id = ? /* :emision_id */
ORDER BY p.fecha DESC, p.created_at DESC;

-- ===========================================
-- 8. OBTENER HISTORIAL DE CAMBIOS DE UNA EMISIÓN
-- ===========================================
SELECT
  a.id,
  DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS date,
  CASE
    WHEN a.accion = 'INSERT' THEN 'Emisión creada'
    WHEN a.accion = 'UPDATE' THEN 'Emisión actualizada'
    WHEN a.accion = 'DELETE' THEN 'Emisión eliminada'
    ELSE CONCAT('Acción: ', a.accion)
  END AS action,
  COALESCE(u.username, 'Sistema') AS user,
  CASE
    WHEN a.accion = 'INSERT' THEN 'Se creó la emisión'
    WHEN a.accion = 'UPDATE' THEN 'Se modificaron datos de la emisión'
    WHEN a.accion = 'DELETE' THEN 'Se eliminó la emisión'
    ELSE 'Cambio en emisión'
  END AS description,
  a.created_at
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.tabla = 'emision_gastos_comunes' AND a.registro_id = ? /* :emision_id */
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
  ?1, -- comunidad_id
  ?2, -- periodo (YYYY-MM)
  ?3, -- fecha_vencimiento
  'borrador', -- estado inicial
  ?4 -- observaciones
);

-- Después de crear la emisión, insertar los detalles de gastos (ejemplo)
INSERT INTO detalle_emision_gastos (
  emision_id,
  gasto_id,
  categoria_id,
  monto,
  regla_prorrateo
) VALUES
(?1, ?2, ?3, ?4, 'coeficiente'), -- Reemplazar con IDs reales y lógica de la aplicación
(?5, ?6, ?7, ?8, 'coeficiente');

-- Después de crear los detalles, generar las cuentas de cobro por unidad (ejemplo)
INSERT INTO cuenta_cobro_unidad (
  emision_id,
  comunidad_id,
  unidad_id,
  monto_total,
  saldo,
  estado
)
SELECT
  ?1, -- emision_id
  u.comunidad_id,
  u.id,
  -- Cálculo: Suma de (Monto Detalle * Alícuota)
  ROUND(SUM(deg.monto * u.alicuota), 0), -- CORRECCIÓN: Alícuota ya es un decimal (ej. 0.015000), no se divide por 100
  -- Saldo inicial igual al monto total
  ROUND(SUM(deg.monto * u.alicuota), 0),
  'pendiente'
FROM unidad u
CROSS JOIN detalle_emision_gastos deg
WHERE deg.emision_id = ?1
  AND u.activa = 1
  AND u.comunidad_id = ?2 -- misma comunidad que la emisión
GROUP BY u.id, u.comunidad_id;

-- ===========================================
-- 10. ACTUALIZAR EMISIÓN (PATCH /emisiones/:id)
-- ===========================================
UPDATE emision_gastos_comunes
SET
  estado = ?, -- cambiar estado
  observaciones = ?, -- actualizar observaciones
  updated_at = NOW()
WHERE id = ?; -- Reemplazar con el ID deseado

-- ===========================================
-- 11. ELIMINAR EMISIÓN (DELETE /emisiones/:id)
-- ===========================================
-- Primero eliminar las aplicaciones de pago relacionadas
-- NOTA: Esta sintaxis es específica de MySQL/SQL Server. En otros motores, se usaría subconsulta/CTE.
DELETE pa FROM pago_aplicacion pa
JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
WHERE ccu.emision_id = ?; /* :emision_id */

-- Después eliminar las cuentas de cobro
DELETE FROM cuenta_cobro_unidad WHERE emision_id = ?; /* :emision_id */

-- Después eliminar los detalles de gastos
DELETE FROM detalle_emision_gastos WHERE emision_id = ?; /* :emision_id */

-- Finalmente eliminar la emisión
DELETE FROM emision_gastos_comunes WHERE id = ?; /* :emision_id */

-- ===========================================
-- 12. ESTADÍSTICAS Y REPORTES
-- ===========================================

-- Estadísticas generales de emisiones
SELECT
  COUNT(t.id) AS total_emisiones,
  SUM(CASE WHEN t.estado = 'emitido' THEN 1 ELSE 0 END) AS emitidas,
  SUM(CASE WHEN t.estado = 'cerrado' THEN 1 ELSE 0 END) AS cerradas,
  SUM(CASE WHEN t.estado = 'anulado' THEN 1 ELSE 0 END) AS anuladas,
  AVG(t.total_monto) AS monto_promedio,
  MAX(t.total_monto) AS monto_maximo,
  MIN(t.total_monto) AS monto_minimo
FROM (
  SELECT
    egc.id,
    egc.estado,
    COALESCE(SUM(ccu.monto_total), 0) AS total_monto
  FROM emision_gastos_comunes egc
  LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
  GROUP BY egc.id, egc.estado
) AS t; -- CORRECCIÓN: Se usa alias en la subconsulta

-- Emisiones por estado y mes
SELECT
  DATE_FORMAT(t.created_at, '%Y-%m') AS mes,
  t.estado,
  COUNT(t.id) AS cantidad,
  SUM(t.total_monto) AS monto_total
FROM (
  SELECT
    egc.id,
    egc.estado,
    egc.created_at,
    COALESCE(SUM(ccu.monto_total), 0) AS total_monto
  FROM emision_gastos_comunes egc
  LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
  GROUP BY egc.id, egc.estado, egc.created_at
) AS t
GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), t.estado
ORDER BY mes DESC, t.estado;

-- Cobranza por emisión
SELECT
  egc.id,
  egc.periodo,
  c.razon_social AS comunidad,
  SUM(ccu.monto_total) AS total_emitido,
  SUM(ccu.monto_total - ccu.saldo) AS total_cobrado,
  -- CORRECCIÓN: Uso de NULLIF para evitar división por cero
  ROUND(
    (SUM(ccu.monto_total - ccu.saldo) / NULLIF(SUM(ccu.monto_total), 0)) * 100,
    2
  ) AS porcentaje_cobranza,
  COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) AS unidades_pagadas,
  COUNT(ccu.unidad_id) AS total_unidades
FROM emision_gastos_comunes egc
JOIN comunidad c ON egc.comunidad_id = c.id
LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.estado IN ('emitido', 'cerrado')
GROUP BY egc.id, egc.periodo, c.razon_social, egc.created_at
ORDER BY egc.created_at DESC;

-- ===========================================
-- 13. VALIDACIONES Y VERIFICACIONES
-- ===========================================

-- Verificar si ya existe una emisión para el mismo período y comunidad
SELECT COUNT(*) AS existe_emision
FROM emision_gastos_comunes
WHERE comunidad_id = ? /* :comunidad_id */ AND periodo = ?; /* :periodo_check */

-- Verificar que todos los gastos incluidos existen y están activos
SELECT
  deg.emision_id,
  COUNT(*) AS total_gastos_incluidos,
  SUM(CASE WHEN g.id IS NULL THEN 1 ELSE 0 END) AS gastos_inexistentes
FROM detalle_emision_gastos deg
LEFT JOIN gasto g ON deg.gasto_id = g.id
WHERE deg.emision_id = ? /* :emision_id */
GROUP BY deg.emision_id;

-- Verificar integridad de cuentas de cobro
SELECT
  'cuentas_cobro' AS tipo_verificacion,
  COUNT(ccu.id) AS total_registros,
  SUM(CASE WHEN ccu.monto_total <= 0 THEN 1 ELSE 0 END) AS montos_invalidos,
  SUM(CASE WHEN ccu.saldo > ccu.monto_total THEN 1 ELSE 0 END) AS saldos_invalidos
FROM cuenta_cobro_unidad ccu
WHERE ccu.emision_id = ?; /* :emision_id */

-- Verificar que todas las unidades activas tienen cuenta de cobro
SELECT
  'cobertura_unidades' AS tipo_verificacion,
  COUNT(DISTINCT u.id) AS unidades_activas,
  COUNT(DISTINCT ccu.unidad_id) AS unidades_con_cobro,
  COUNT(DISTINCT u.id) - COUNT(DISTINCT ccu.unidad_id) AS unidades_faltantes
FROM unidad u
LEFT JOIN cuenta_cobro_unidad ccu ON u.id = ccu.unidad_id AND ccu.emision_id = ? /* :emision_id */
WHERE u.activa = 1 AND u.comunidad_id = ?; /* :comunidad_id */