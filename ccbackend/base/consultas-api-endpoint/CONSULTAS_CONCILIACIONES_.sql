-- ========================================================================================
-- CONSULTAS SQL PARA EL MÓDULO CONCILIACIONES
-- Sistema de Cuentas Claras
-- ========================================================================================

-- =============================================================================
-- 1. LISTADO DE CONCILIACIONES - Información básica para la vista principal
-- =============================================================================

-- Consulta principal para el listado de conciliaciones con filtros
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.tipo,
    c.referencia_bancaria,
    c.estado_conciliacion,
    c.pago_id,
    -- Información del pago vinculado
    p.codigo as codigo_pago,
    p.referencia as referencia_pago,
    p.monto as monto_pago,
    p.estado as estado_pago,
    p.fecha_pago,
    -- Información de la comunidad
    com.razon_social as nombre_comunidad,
    com.id as comunidad_id,
    -- Información del usuario que creó/modificó
    u.nombre as usuario_creador,
    c.created_at,
    c.updated_at,
    -- Cálculos adicionales
    CASE
        WHEN c.estado_conciliacion = 'conciliado' THEN 'completed'
        WHEN c.estado_conciliacion = 'diferencia' THEN 'with-differences'
        WHEN c.estado_conciliacion = 'descartado' THEN 'cancelled'
        ELSE 'in-progress'
    END as status_mapped,
    -- Diferencia si existe
    CASE
        WHEN c.pago_id IS NOT NULL THEN ABS(c.monto - COALESCE(p.monto, 0))
        ELSE 0
    END as diferencia_monto
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.created_by = u.id
ORDER BY c.fecha_mov DESC, c.created_at DESC;

-- =============================================================================
-- 2. DETALLE COMPLETO DE UNA CONCILIACIÓN
-- =============================================================================

-- Consulta para obtener detalle completo de una conciliación específica
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.tipo,
    c.referencia_bancaria,
    c.estado_conciliacion,
    c.pago_id,
    c.comunidad_id,
    c.created_by,
    c.created_at,
    c.updated_at,
    -- Información detallada del pago vinculado
    p.id as pago_id,
    p.codigo as codigo_pago,
    p.referencia as referencia_pago,
    p.monto as monto_pago,
    p.estado as estado_pago,
    p.fecha_pago,
    p.medio_pago,
    p.gateway,
    p.transaction_id,
    -- Información de la comunidad
    com.razon_social as nombre_comunidad,
    com.rut as rut_comunidad,
    com.email_contacto,
    -- Información del usuario
    u.nombre as nombre_usuario,
    u.email as email_usuario,
    -- Información de la unidad/persona relacionada con el pago
    un.numero_unidad,
    per.nombre as nombre_persona,
    per.apellido_paterno,
    per.apellido_materno,
    -- Cálculos y estadísticas
    CASE
        WHEN c.estado_conciliacion = 'conciliado' THEN 'Completada'
        WHEN c.estado_conciliacion = 'diferencia' THEN 'Con diferencias'
        WHEN c.estado_conciliacion = 'descartado' THEN 'Descartada'
        ELSE 'En proceso'
    END as estado_descripcion,
    DATEDIFF(CURRENT_DATE, c.fecha_mov) as dias_desde_movimiento,
    CASE
        WHEN c.pago_id IS NOT NULL THEN ABS(c.monto - COALESCE(p.monto, 0))
        ELSE 0
    END as diferencia_monto,
    CASE
        WHEN c.pago_id IS NOT NULL AND ABS(c.monto - COALESCE(p.monto, 0)) > 0.01 THEN 1
        ELSE 0
    END as tiene_diferencia
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.created_by = u.id
LEFT JOIN unidad un ON p.unidad_id = un.id
LEFT JOIN persona per ON p.persona_id = per.id
WHERE c.id = ?;

-- =============================================================================
-- 3. TRANSACCIONES BANCARIAS DE UNA CONCILIACIÓN
-- =============================================================================

-- Consulta para obtener todas las transacciones relacionadas con una conciliación
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.tipo,
    c.referencia_bancaria,
    c.estado_conciliacion,
    -- Información del pago vinculado
    p.id as pago_id,
    p.codigo as codigo_pago,
    p.referencia as referencia_pago,
    p.monto as monto_pago,
    p.fecha_pago,
    p.estado as estado_pago,
    -- Información adicional para matching
    CASE
        WHEN c.pago_id IS NOT NULL THEN 'manual'
        WHEN c.estado_conciliacion = 'conciliado' THEN 'matched'
        ELSE 'unmatched'
    END as match_status,
    CASE
        WHEN c.pago_id IS NOT NULL THEN ABS(c.monto - COALESCE(p.monto, 0))
        ELSE 0
    END as diferencia,
    -- Metadata
    c.created_at,
    c.updated_at,
    u.nombre as usuario_ultima_modificacion
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN usuario u ON c.updated_by = u.id
WHERE c.comunidad_id = ?
ORDER BY c.fecha_mov DESC, c.created_at DESC;

-- =============================================================================
-- 4. ESTADÍSTICAS GENERALES DEL MÓDULO CONCILIACIONES
-- =============================================================================

-- Estadísticas principales del módulo conciliaciones
SELECT
    COUNT(*) as total_movimientos,
    SUM(CASE WHEN estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) as movimientos_conciliados,
    SUM(CASE WHEN estado_conciliacion = 'pendiente' THEN 1 ELSE 0 END) as movimientos_pendientes,
    SUM(CASE WHEN estado_conciliacion = 'diferencia' THEN 1 ELSE 0 END) as movimientos_con_diferencia,
    SUM(CASE WHEN estado_conciliacion = 'descartado' THEN 1 ELSE 0 END) as movimientos_descartados,
    -- Montos
    SUM(monto) as monto_total_bancario,
    AVG(monto) as monto_promedio,
    MIN(monto) as monto_minimo,
    MAX(monto) as monto_maximo,
    -- Por tipo
    SUM(CASE WHEN tipo = 'credito' THEN 1 ELSE 0 END) as movimientos_credito,
    SUM(CASE WHEN tipo = 'debito' THEN 1 ELSE 0 END) as movimientos_debito,
    SUM(CASE WHEN tipo = 'otro' THEN 1 ELSE 0 END) as movimientos_otro,
    -- Fechas
    MIN(fecha_mov) as movimiento_mas_antiguo,
    MAX(fecha_mov) as movimiento_mas_nuevo,
    -- Tasa de conciliación
    ROUND(
        (SUM(CASE WHEN estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
    ) as tasa_conciliacion_porcentaje,
    -- Comunidad específica (si se filtra)
    com.razon_social as nombre_comunidad
FROM conciliacion c
LEFT JOIN comunidad com ON c.comunidad_id = com.id
WHERE (? IS NULL OR c.comunidad_id = ?)
GROUP BY com.id, com.razon_social;

-- =============================================================================
-- 5. CONCILIACIONES POR COMUNIDAD - Para navegación jerárquica
-- =============================================================================

-- Consulta para obtener conciliaciones agrupadas por comunidad
SELECT
    com.id as comunidad_id,
    com.razon_social as nombre_comunidad,
    com.rut as rut_comunidad,
    COUNT(c.id) as total_movimientos,
    SUM(CASE WHEN c.estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) as movimientos_conciliados,
    SUM(CASE WHEN c.estado_conciliacion = 'pendiente' THEN 1 ELSE 0 END) as movimientos_pendientes,
    SUM(CASE WHEN c.estado_conciliacion = 'diferencia' THEN 1 ELSE 0 END) as movimientos_con_diferencia,
    SUM(c.monto) as monto_total_bancario,
    ROUND(
        (SUM(CASE WHEN c.estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) * 100.0) / COUNT(c.id),
        2
    ) as tasa_conciliacion,
    MIN(c.fecha_mov) as fecha_primer_movimiento,
    MAX(c.fecha_mov) as fecha_ultimo_movimiento,
    MAX(c.updated_at) as ultima_actualizacion
FROM comunidad com
LEFT JOIN conciliacion c ON com.id = c.comunidad_id
WHERE com.activa = 1
GROUP BY com.id, com.razon_social, com.rut
ORDER BY com.razon_social ASC;

-- =============================================================================
-- 6. CONCILIACIONES CON FILTROS AVANZADOS - Para búsqueda y filtrado
-- =============================================================================

-- Consulta con filtros dinámicos (usar parámetros preparados)
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.tipo,
    c.referencia_bancaria,
    c.estado_conciliacion,
    c.pago_id,
    -- Información relacionada
    p.codigo as codigo_pago,
    p.referencia as referencia_pago,
    p.monto as monto_pago,
    p.fecha_pago,
    com.razon_social as nombre_comunidad,
    u.nombre as usuario_creador,
    -- Cálculos
    CASE
        WHEN c.estado_conciliacion = 'conciliado' THEN 'Completada'
        WHEN c.estado_conciliacion = 'diferencia' THEN 'Con diferencias'
        WHEN c.estado_conciliacion = 'descartado' THEN 'Descartada'
        ELSE 'En proceso'
    END as estado_descripcion,
    CASE
        WHEN c.pago_id IS NOT NULL THEN ABS(c.monto - COALESCE(p.monto, 0))
        ELSE 0
    END as diferencia_monto
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.created_by = u.id
WHERE 1=1
  -- Filtros opcionales (comentar/descomentar según necesidad)
  -- AND c.comunidad_id = ?
  -- AND c.estado_conciliacion = ?
  -- AND c.fecha_mov BETWEEN ? AND ?
  -- AND c.tipo = ?
  -- AND c.monto BETWEEN ? AND ?
  -- AND (c.glosa LIKE CONCAT('%', ?, '%') OR c.referencia_bancaria LIKE CONCAT('%', ?, '%'))
  -- AND p.estado = ?
ORDER BY c.fecha_mov DESC, c.created_at DESC
LIMIT ? OFFSET ?;

-- =============================================================================
-- 7. PAGOS DISPONIBLES PARA CONCILIACIÓN - Para matching manual
-- =============================================================================

-- Consulta para obtener pagos disponibles que pueden ser conciliados
SELECT
    p.id,
    p.codigo,
    p.referencia,
    p.monto,
    p.fecha_pago,
    p.estado,
    p.medio_pago,
    p.gateway,
    p.transaction_id,
    -- Información relacionada
    un.numero_unidad,
    CONCAT(per.nombre, ' ', per.apellido_paterno) as nombre_persona,
    com.razon_social as nombre_comunidad,
    -- Estado de conciliación
    CASE
        WHEN EXISTS(SELECT 1 FROM conciliacion conc WHERE conc.pago_id = p.id) THEN 'conciliado'
        ELSE 'disponible'
    END as estado_conciliacion,
    -- Metadata
    p.created_at,
    p.updated_at
FROM pago p
LEFT JOIN unidad un ON p.unidad_id = un.id
LEFT JOIN persona per ON p.persona_id = per.id
LEFT JOIN comunidad com ON p.comunidad_id = com.id
WHERE p.estado IN ('completado', 'aprobado')
  AND p.comunidad_id = ?
  AND NOT EXISTS(SELECT 1 FROM conciliacion conc WHERE conc.pago_id = p.id AND conc.estado_conciliacion = 'conciliado')
ORDER BY p.fecha_pago DESC;

-- =============================================================================
-- 8. HISTÓRICO DE CAMBIOS EN CONCILIACIONES - Para auditoría
-- =============================================================================

-- Consulta para obtener histórico de cambios en conciliaciones
SELECT
    hc.id,
    hc.conciliacion_id,
    hc.fecha_cambio,
    hc.tipo_cambio,
    hc.campo_modificado,
    hc.valor_anterior,
    hc.valor_nuevo,
    hc.usuario_id,
    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_nombre,
    hc.observaciones,
    hc.created_at
FROM historico_conciliacion hc
LEFT JOIN usuario u ON hc.usuario_id = u.id
WHERE hc.conciliacion_id = ?
ORDER BY hc.fecha_cambio DESC
LIMIT 100;

-- =============================================================================
-- 9. CONCILIACIONES CON DIFERENCIAS - Para alertas y revisiones
-- =============================================================================

-- Consulta para identificar conciliaciones con diferencias que requieren atención
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto as monto_bancario,
    c.referencia_bancaria,
    -- Información del pago vinculado
    p.id as pago_id,
    p.codigo as codigo_pago,
    p.monto as monto_pago,
    p.fecha_pago,
    -- Cálculo de diferencia
    ABS(c.monto - COALESCE(p.monto, 0)) as diferencia_absoluta,
    CASE
        WHEN c.monto > COALESCE(p.monto, 0) THEN 'banco_mayor'
        WHEN c.monto < COALESCE(p.monto, 0) THEN 'pago_mayor'
        ELSE 'igual'
    END as tipo_diferencia,
    -- Información adicional
    com.razon_social as nombre_comunidad,
    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_responsable,
    c.updated_at as ultima_modificacion,
    DATEDIFF(CURRENT_DATE, c.fecha_mov) as dias_desde_movimiento
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.updated_by = u.id
WHERE c.estado_conciliacion = 'diferencia'
  AND ABS(c.monto - COALESCE(p.monto, 0)) > 0.01  -- Diferencia mayor a 1 centavo
ORDER BY
    ABS(c.monto - COALESCE(p.monto, 0)) DESC,  -- Más grandes primero
    c.fecha_mov DESC;

-- =============================================================================
-- 10. RESUMEN EJECUTIVO DE CONCILIACIONES - Para dashboard
-- =============================================================================

-- Consulta para obtener resumen ejecutivo del estado de conciliaciones
SELECT
    -- Período actual (mes actual)
    YEAR(CURRENT_DATE) as ano_actual,
    MONTH(CURRENT_DATE) as mes_actual,
    -- Estadísticas del período actual
    COUNT(CASE WHEN YEAR(c.fecha_mov) = YEAR(CURRENT_DATE) AND MONTH(c.fecha_mov) = MONTH(CURRENT_DATE) THEN 1 END) as movimientos_mes_actual,
    SUM(CASE WHEN YEAR(c.fecha_mov) = YEAR(CURRENT_DATE) AND MONTH(c.fecha_mov) = MONTH(CURRENT_DATE) THEN c.monto END) as monto_total_mes_actual,
    SUM(CASE WHEN YEAR(c.fecha_mov) = YEAR(CURRENT_DATE) AND MONTH(c.fecha_mov) = MONTH(CURRENT_DATE) AND c.estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) as conciliados_mes_actual,
    -- Estadísticas generales
    COUNT(*) as total_movimientos,
    SUM(CASE WHEN c.estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) as total_conciliados,
    SUM(CASE WHEN c.estado_conciliacion = 'pendiente' THEN 1 ELSE 0 END) as total_pendientes,
    SUM(CASE WHEN c.estado_conciliacion = 'diferencia' THEN 1 ELSE 0 END) as total_con_diferencias,
    -- Montos
    SUM(c.monto) as monto_total_bancario,
    SUM(CASE WHEN c.estado_conciliacion = 'conciliado' THEN c.monto ELSE 0 END) as monto_conciliado,
    -- Tasa de conciliación
    ROUND(
        (SUM(CASE WHEN c.estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
    ) as tasa_conciliacion_general,
    ROUND(
        (SUM(CASE WHEN YEAR(c.fecha_mov) = YEAR(CURRENT_DATE) AND MONTH(c.fecha_mov) = MONTH(CURRENT_DATE) AND c.estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) * 100.0) /
        NULLIF(SUM(CASE WHEN YEAR(c.fecha_mov) = YEAR(CURRENT_DATE) AND MONTH(c.fecha_mov) = MONTH(CURRENT_DATE) THEN 1 ELSE 0 END), 0),
        2
    ) as tasa_conciliacion_mes_actual,
    -- Comunidad específica
    com.razon_social as nombre_comunidad
FROM conciliacion c
LEFT JOIN comunidad com ON c.comunidad_id = com.id
WHERE (? IS NULL OR c.comunidad_id = ?);

-- =============================================================================
-- 11. CONCILIACIONES PENDIENTES POR TIEMPO - Para alertas de antigüedad
-- =============================================================================

-- Consulta para conciliaciones pendientes clasificadas por antigüedad
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.referencia_bancaria,
    c.estado_conciliacion,
    -- Cálculo de antigüedad
    DATEDIFF(CURRENT_DATE, c.fecha_mov) as dias_antiguedad,
    CASE
        WHEN DATEDIFF(CURRENT_DATE, c.fecha_mov) <= 7 THEN 'reciente'
        WHEN DATEDIFF(CURRENT_DATE, c.fecha_mov) <= 30 THEN 'moderado'
        WHEN DATEDIFF(CURRENT_DATE, c.fecha_mov) <= 90 THEN 'antiguo'
        ELSE 'muy_antiguo'
    END as nivel_antiguedad,
    -- Información adicional
    com.razon_social as nombre_comunidad,
    c.created_at,
    c.updated_at,
    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_responsable
FROM conciliacion c
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.created_by = u.id
WHERE c.estado_conciliacion IN ('pendiente', 'diferencia')
ORDER BY c.fecha_mov ASC;  -- Más antiguos primero

-- =============================================================================
-- 12. EXPORTACIÓN DE DATOS DE CONCILIACIONES - Para reportes
-- =============================================================================

-- Consulta para exportar datos completos de conciliaciones (para Excel/CSV)
SELECT
    'CONCILIACION' as tipo_registro,
    c.id as conciliacion_id,
    c.fecha_mov,
    c.glosa,
    c.monto as monto_bancario,
    c.tipo,
    c.referencia_bancaria,
    c.estado_conciliacion,
    -- Información del pago vinculado
    p.id as pago_id,
    p.codigo as codigo_pago,
    p.referencia as referencia_pago,
    p.monto as monto_pago,
    p.fecha_pago,
    p.estado as estado_pago,
    p.medio_pago,
    p.gateway,
    -- Diferencia
    CASE
        WHEN c.pago_id IS NOT NULL THEN ABS(c.monto - COALESCE(p.monto, 0))
        ELSE 0
    END as diferencia_monto,
    -- Información de la comunidad
    com.razon_social as nombre_comunidad,
    com.rut as rut_comunidad,
    -- Usuario
    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_creador,
    -- Metadata
    c.created_at,
    c.updated_at
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.created_by = u.id
ORDER BY c.fecha_mov DESC, c.created_at DESC;

-- =============================================================================
-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =============================================================================

-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_conciliacion_comunidad_fecha ON conciliacion(comunidad_id, fecha_mov);
CREATE INDEX idx_conciliacion_estado ON conciliacion(estado_conciliacion);
CREATE INDEX idx_conciliacion_pago_id ON conciliacion(pago_id);
CREATE INDEX idx_conciliacion_fecha_mov ON conciliacion(fecha_mov);
CREATE INDEX idx_conciliacion_created_by ON conciliacion(created_by);
CREATE INDEX idx_conciliacion_updated_by ON conciliacion(updated_by);
CREATE INDEX idx_pago_estado_fecha ON pago(estado, fecha_pago);
CREATE INDEX idx_pago_comunidad_id ON pago(comunidad_id);
CREATE INDEX idx_historico_conciliacion_id ON historico_conciliacion(conciliacion_id);

-- =============================================================================
-- VISTAS OPTIMIZADAS PARA EL MÓDULO CONCILIACIONES
-- =============================================================================

-- Vista para listado rápido de conciliaciones
CREATE VIEW vista_conciliaciones_listado AS
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.tipo,
    c.referencia_bancaria,
    c.estado_conciliacion,
    c.pago_id,
    p.codigo as codigo_pago,
    p.referencia as referencia_pago,
    p.monto as monto_pago,
    com.razon_social as nombre_comunidad,
    u.nombre as usuario_creador,
    c.created_at,
    c.updated_at,
    CASE
        WHEN c.estado_conciliacion = 'conciliado' THEN 'Completada'
        WHEN c.estado_conciliacion = 'diferencia' THEN 'Con diferencias'
        WHEN c.estado_conciliacion = 'descartado' THEN 'Descartada'
        ELSE 'En proceso'
    END as estado_descripcion
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
LEFT JOIN usuario u ON c.created_by = u.id;

-- Vista para estadísticas del módulo conciliaciones
CREATE VIEW vista_conciliaciones_estadisticas AS
SELECT
    COUNT(*) as total_movimientos,
    SUM(CASE WHEN estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) as movimientos_conciliados,
    SUM(CASE WHEN estado_conciliacion = 'pendiente' THEN 1 ELSE 0 END) as movimientos_pendientes,
    SUM(CASE WHEN estado_conciliacion = 'diferencia' THEN 1 ELSE 0 END) as movimientos_con_diferencia,
    SUM(monto) as monto_total_bancario,
    ROUND(
        (SUM(CASE WHEN estado_conciliacion = 'conciliado' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
        2
    ) as tasa_conciliacion_porcentaje,
    MIN(fecha_mov) as movimiento_mas_antiguo,
    MAX(fecha_mov) as movimiento_mas_nuevo
FROM conciliacion;

-- Vista para conciliaciones con diferencias
CREATE VIEW vista_conciliaciones_diferencias AS
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto as monto_bancario,
    p.monto as monto_pago,
    ABS(c.monto - COALESCE(p.monto, 0)) as diferencia_absoluta,
    CASE
        WHEN c.monto > COALESCE(p.monto, 0) THEN 'banco_mayor'
        WHEN c.monto < COALESCE(p.monto, 0) THEN 'pago_mayor'
        ELSE 'igual'
    END as tipo_diferencia,
    com.razon_social as nombre_comunidad,
    c.updated_at as ultima_modificacion,
    DATEDIFF(CURRENT_DATE, c.fecha_mov) as dias_desde_movimiento
FROM conciliacion c
LEFT JOIN pago p ON c.pago_id = p.id
LEFT JOIN comunidad com ON c.comunidad_id = com.id
WHERE c.estado_conciliacion = 'diferencia'
  AND ABS(c.monto - COALESCE(p.monto, 0)) > 0.01;

-- Vista para conciliaciones pendientes por antigüedad
CREATE VIEW vista_conciliaciones_pendientes_antiguedad AS
SELECT
    c.id,
    c.fecha_mov,
    c.glosa,
    c.monto,
    c.referencia_bancaria,
    DATEDIFF(CURRENT_DATE, c.fecha_mov) as dias_antiguedad,
    CASE
        WHEN DATEDIFF(CURRENT_DATE, c.fecha_mov) <= 7 THEN 'reciente'
        WHEN DATEDIFF(CURRENT_DATE, c.fecha_mov) <= 30 THEN 'moderado'
        WHEN DATEDIFF(CURRENT_DATE, c.fecha_mov) <= 90 THEN 'antiguo'
        ELSE 'muy_antiguo'
    END as nivel_antiguedad,
    com.razon_social as nombre_comunidad,
    c.created_at,
    c.updated_at
FROM conciliacion c
LEFT JOIN comunidad com ON c.comunidad_id = com.id
WHERE c.estado_conciliacion IN ('pendiente', 'diferencia');