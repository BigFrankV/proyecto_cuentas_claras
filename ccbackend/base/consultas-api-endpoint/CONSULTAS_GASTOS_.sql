-- Consultas SQL para el módulo de Gastos - Cuentas Claras
-- Este archivo contiene todas las consultas necesarias para el manejo completo de gastos

-- =============================================================================
-- 1. LISTADO DE GASTOS CON FILTROS
-- =============================================================================

-- Consulta principal para listado de gastos con filtros
SELECT
    g.id,
    g.descripcion,
    g.categoria,
    g.proveedor,
    g.monto,
    g.fecha,
    g.estado,
    g.fecha_vencimiento as dueDate,
    g.tipo_documento as documentType,
    g.numero_documento as documentNumber,
    CASE WHEN COUNT(a.id) > 0 THEN 1 ELSE 0 END as hasAttachments,
    g.creado_por as createdBy,
    g.fecha_creacion as createdAt,
    g.etiquetas as tags,
    g.prioridad,
    g.aprobaciones_requeridas as requiredApprovals,
    COUNT(ah.id) as currentApprovals,
    g.centro_costo as costCenter,
    g.observaciones,
    g.es_recurring as isRecurring,
    g.periodo_recurring as recurringPeriod,
    g.metodo_pago as paymentMethod
FROM gastos g
LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
LEFT JOIN aprobaciones_historial ah ON ah.gasto_id = g.id AND ah.accion = 'approved'
WHERE g.comunidad_id = ?
    AND (COALESCE(?, '') = '' OR g.descripcion LIKE CONCAT('%', ?, '%'))
    AND (COALESCE(?, '') = '' OR g.categoria = ?)
    AND (COALESCE(?, '') = '' OR g.estado = ?)
    AND (COALESCE(?, '') = '' OR g.proveedor LIKE CONCAT('%', ?, '%'))
    AND (COALESCE(?, '') = '' OR g.fecha >= ?)
    AND (COALESCE(?, '') = '' OR g.fecha <= ?)
    AND (COALESCE(?, '') = '' OR g.monto >= ?)
    AND (COALESCE(?, '') = '' OR g.monto <= ?)
GROUP BY g.id
ORDER BY g.fecha DESC, g.id DESC
LIMIT ? OFFSET ?;

-- =============================================================================
-- 2. DETALLE COMPLETO DE UN GASTO
-- =============================================================================

-- Consulta para obtener detalle completo de un gasto específico
SELECT
    g.id,
    g.descripcion,
    g.categoria,
    g.proveedor,
    g.monto,
    g.fecha,
    g.estado,
    g.fecha_vencimiento as dueDate,
    g.tipo_documento as documentType,
    g.numero_documento as documentNumber,
    g.creado_por as createdBy,
    g.fecha_creacion as createdAt,
    g.etiquetas as tags,
    g.prioridad,
    g.aprobaciones_requeridas as requiredApprovals,
    g.centro_costo as costCenter,
    g.observaciones,
    g.es_recurring as isRecurring,
    g.periodo_recurring as recurringPeriod,
    g.metodo_pago as paymentMethod,
    g.fecha_pago as paymentDate,
    g.referencia_pago as paymentReference,
    -- Información del documento de compra si existe
    dc.tipo_doc,
    dc.folio,
    dc.fecha_emision,
    dc.neto,
    dc.iva,
    dc.total,
    -- Información del proveedor
    p.nombre as proveedor_nombre,
    p.rut as proveedor_rut,
    p.email as proveedor_email,
    p.telefono as proveedor_telefono
FROM gastos g
LEFT JOIN documento_compra dc ON dc.id = g.documento_compra_id
LEFT JOIN proveedores p ON p.id = g.proveedor_id
WHERE g.id = ? AND g.comunidad_id = ?;

-- Consulta para obtener historial de aprobaciones de un gasto
SELECT
    ah.id,
    ah.aprobador,
    ah.accion,
    ah.fecha,
    ah.comentarios,
    u.nombre as aprobador_nombre
FROM aprobaciones_historial ah
LEFT JOIN usuarios u ON u.id = ah.aprobador_id
WHERE ah.gasto_id = ?
ORDER BY ah.fecha DESC;

-- Consulta para obtener archivos adjuntos de un gasto
SELECT
    a.id,
    a.original_name as name,
    a.mimetype as type,
    a.file_size as size,
    a.file_path as url,
    a.uploaded_at as uploadedAt,
    u.nombre as uploadedBy
FROM archivos a
LEFT JOIN usuarios u ON u.id = a.uploaded_by
WHERE a.entity_type = 'gasto'
    AND a.entity_id = ?
    AND a.is_active = 1
ORDER BY a.uploaded_at DESC;

-- =============================================================================
-- 3. ESTADÍSTICAS Y REPORTES
-- =============================================================================

-- Gastos por categoría
SELECT
    g.categoria,
    COUNT(*) as cantidad,
    SUM(g.monto) as total,
    AVG(g.monto) as promedio,
    MIN(g.monto) as minimo,
    MAX(g.monto) as maximo
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND (COALESCE(?, '') = '' OR g.fecha >= ?)
    AND (COALESCE(?, '') = '' OR g.fecha <= ?)
GROUP BY g.categoria
ORDER BY total DESC;

-- Gastos por proveedor
SELECT
    g.proveedor,
    COUNT(*) as cantidad,
    SUM(g.monto) as total,
    AVG(g.monto) as promedio,
    MAX(g.fecha) as ultima_compra
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND (COALESCE(?, '') = '' OR g.fecha >= ?)
    AND (COALESCE(?, '') = '' OR g.fecha <= ?)
GROUP BY g.proveedor
ORDER BY total DESC;

-- Gastos por centro de costo
SELECT
    cc.nombre as centro_costo,
    COUNT(*) as cantidad,
    SUM(g.monto) as total,
    AVG(g.monto) as promedio
FROM gastos g
LEFT JOIN centro_costo cc ON cc.id = g.centro_costo_id
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND (COALESCE(?, '') = '' OR g.fecha >= ?)
    AND (COALESCE(?, '') = '' OR g.fecha <= ?)
GROUP BY cc.id, cc.nombre
ORDER BY total DESC;

-- Evolución temporal de gastos (últimos N meses)
SELECT
    DATE_FORMAT(g.fecha, '%Y-%m') as mes,
    COUNT(*) as cantidad,
    SUM(g.monto) as total,
    AVG(g.monto) as promedio
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
GROUP BY DATE_FORMAT(g.fecha, '%Y-%m')
ORDER BY mes DESC;

-- Top N gastos más altos
SELECT
    g.id,
    g.descripcion,
    g.proveedor,
    g.monto,
    g.fecha,
    g.categoria
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND (COALESCE(?, '') = '' OR g.fecha >= ?)
    AND (COALESCE(?, '') = '' OR g.fecha <= ?)
ORDER BY g.monto DESC
LIMIT ?;

-- Gastos pendientes de aprobación
SELECT
    g.id,
    g.descripcion,
    g.proveedor,
    g.monto,
    g.fecha,
    g.fecha_vencimiento,
    g.prioridad,
    g.creado_por,
    g.fecha_creacion,
    DATEDIFF(CURDATE(), g.fecha_vencimiento) as dias_vencido
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado = 'pending'
ORDER BY
    CASE
        WHEN g.fecha_vencimiento < CURDATE() THEN 1
        WHEN g.prioridad = 'high' THEN 2
        WHEN g.prioridad = 'medium' THEN 3
        ELSE 4
    END,
    g.fecha_vencimiento ASC;

-- Alertas de gastos
SELECT
    'sin_aprobacion' as tipo,
    CONCAT('Gasto pendiente de aprobación: ', g.descripcion) as mensaje,
    g.id as gasto_id,
    g.fecha_vencimiento as fecha_referencia,
    DATEDIFF(CURDATE(), g.fecha_vencimiento) as dias_atraso
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado = 'pending'
    AND g.fecha_vencimiento < CURDATE()

UNION ALL

SELECT
    'monto_alto' as tipo,
    CONCAT('Gasto de alto monto: ', g.descripcion, ' ($', FORMAT(g.monto, 0), ')') as mensaje,
    g.id as gasto_id,
    g.fecha as fecha_referencia,
    NULL as dias_atraso
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND g.monto > 500000
    AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)

UNION ALL

SELECT
    'vencido' as tipo,
    CONCAT('Gasto vencido: ', g.descripcion) as mensaje,
    g.id as gasto_id,
    g.fecha_vencimiento as fecha_referencia,
    DATEDIFF(CURDATE(), g.fecha_vencimiento) as dias_atraso
FROM gastos g
WHERE g.comunidad_id = ?
    AND g.estado IN ('approved', 'pending')
    AND g.fecha_vencimiento < CURDATE()
    AND g.fecha_vencimiento >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)

ORDER BY fecha_referencia DESC;

-- =============================================================================
-- 4. CONSULTAS PARA FILTROS Y BÚSQUEDA
-- =============================================================================

-- Obtener categorías disponibles
SELECT DISTINCT g.categoria
FROM gastos g
WHERE g.comunidad_id = ?
ORDER BY g.categoria;

-- Obtener proveedores disponibles
SELECT DISTINCT g.proveedor
FROM gastos g
WHERE g.comunidad_id = ?
ORDER BY g.proveedor;

-- Obtener centros de costo disponibles
SELECT DISTINCT cc.id, cc.nombre, cc.codigo
FROM centro_costo cc
WHERE cc.comunidad_id = ?
ORDER BY cc.nombre;

-- =============================================================================
-- 5. CONSULTAS PARA EXPORTACIÓN
-- =============================================================================

-- Exportación completa de gastos para Excel/CSV
SELECT
    g.id,
    g.descripcion,
    g.categoria,
    g.proveedor,
    g.monto,
    g.fecha,
    g.estado,
    g.fecha_vencimiento as fecha_vencimiento,
    g.tipo_documento as tipo_documento,
    g.numero_documento as numero_documento,
    g.creado_por as creado_por,
    g.fecha_creacion as fecha_creacion,
    g.prioridad,
    g.centro_costo as centro_costo,
    g.observaciones,
    g.metodo_pago as metodo_pago,
    g.fecha_pago as fecha_pago,
    COUNT(a.id) as cantidad_adjuntos
FROM gastos g
LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
WHERE g.comunidad_id = ?
    AND (COALESCE(?, '') = '' OR g.fecha >= ?)
    AND (COALESCE(?, '') = '' OR g.fecha <= ?)
    AND (COALESCE(?, '') = '' OR g.categoria = ?)
    AND (COALESCE(?, '') = '' OR g.estado = ?)
GROUP BY g.id
ORDER BY g.fecha DESC, g.id DESC;

-- =============================================================================
-- 6. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =============================================================================

-- Vista para listado rápido de gastos
CREATE OR REPLACE VIEW vista_gastos_listado AS
SELECT
    g.id,
    g.descripcion,
    g.categoria,
    g.proveedor,
    g.monto,
    g.fecha,
    g.estado,
    g.fecha_vencimiento,
    g.tipo_documento,
    g.numero_documento,
    g.creado_por,
    g.fecha_creacion,
    g.prioridad,
    g.centro_costo,
    g.comunidad_id,
    CASE WHEN COUNT(a.id) > 0 THEN 1 ELSE 0 END as tiene_adjuntos,
    COUNT(ah.id) as aprobaciones_actuales,
    g.aprobaciones_requeridas
FROM gastos g
LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
LEFT JOIN aprobaciones_historial ah ON ah.gasto_id = g.id AND ah.accion = 'approved'
GROUP BY g.id;

-- Vista para estadísticas de gastos por mes
CREATE OR REPLACE VIEW vista_gastos_mensuales AS
SELECT
    g.comunidad_id,
    DATE_FORMAT(g.fecha, '%Y-%m') as mes,
    COUNT(*) as cantidad_gastos,
    SUM(g.monto) as total_gastos,
    AVG(g.monto) as promedio_gasto,
    COUNT(CASE WHEN g.estado = 'paid' THEN 1 END) as gastos_pagados,
    COUNT(CASE WHEN g.estado = 'pending' THEN 1 END) as gastos_pendientes
FROM gastos g
WHERE g.estado IN ('approved', 'paid', 'completed')
GROUP BY g.comunidad_id, DATE_FORMAT(g.fecha, '%Y-%m');

-- Vista para resumen de gastos por categoría
CREATE OR REPLACE VIEW vista_gastos_categorias AS
SELECT
    g.comunidad_id,
    g.categoria,
    COUNT(*) as cantidad,
    SUM(g.monto) as total,
    AVG(g.monto) as promedio,
    MIN(g.monto) as minimo,
    MAX(g.monto) as maximo,
    MAX(g.fecha) as ultimo_gasto
FROM gastos g
WHERE g.estado IN ('approved', 'paid', 'completed')
GROUP BY g.comunidad_id, g.categoria;

-- =============================================================================
-- 7. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =============================================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_gastos_comunidad_fecha ON gastos(comunidad_id, fecha);
CREATE INDEX idx_gastos_comunidad_estado ON gastos(comunidad_id, estado);
CREATE INDEX idx_gastos_comunidad_categoria ON gastos(comunidad_id, categoria);
CREATE INDEX idx_gastos_comunidad_proveedor ON gastos(comunidad_id, proveedor);
CREATE INDEX idx_gastos_fecha_vencimiento ON gastos(fecha_vencimiento);
CREATE INDEX idx_gastos_monto ON gastos(monto);

-- Índices para archivos adjuntos
CREATE INDEX idx_archivos_entity_gasto ON archivos(entity_type, entity_id) WHERE entity_type = 'gasto';

-- Índices para historial de aprobaciones
CREATE INDEX idx_aprobaciones_gasto ON aprobaciones_historial(gasto_id, fecha);

-- Índice compuesto para filtros complejos
CREATE INDEX idx_gastos_filtros_complejos ON gastos(
    comunidad_id, estado, categoria, fecha, fecha_vencimiento, monto
);