-- Consultas SQL para el módulo de Categorías de Gasto - Cuentas Claras
-- Este archivo contiene todas las consultas necesarias para el manejo completo de categorías de gasto

-- =============================================================================
-- 1. LISTADO DE CATEGORÍAS CON FILTROS
-- =============================================================================

-- Consulta principal para listado de categorías con filtros
SELECT
    cg.id,
    cg.nombre as name,
    cg.tipo as type,
    cg.cta_contable as accounting_code,
    cg.activa as is_active,
    CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END as status,
    cg.created_at as createdAt,
    cg.updated_at as updatedAt,
    c.razon_social as community_name,
    cg.comunidad_id as community_id,
    -- Campos adicionales que podrían agregarse a la tabla
    COALESCE(cg.descripcion, '') as description,
    COALESCE(cg.icono, 'category') as icon,
    COALESCE(cg.color, '#607D8B') as color
FROM categoria_gasto cg
LEFT JOIN comunidad c ON c.id = cg.comunidad_id
WHERE (COALESCE(?, '') = '' OR cg.comunidad_id = ?)
    AND (COALESCE(?, '') = '' OR cg.nombre LIKE CONCAT('%', ?, '%'))
    AND (COALESCE(?, '') = '' OR cg.tipo = ?)
    AND (COALESCE(?, '') = '' OR cg.activa = ?)
ORDER BY cg.nombre ASC
LIMIT ? OFFSET ?;

-- =============================================================================
-- 2. DETALLE COMPLETO DE UNA CATEGORÍA
-- =============================================================================

-- Consulta para obtener detalle completo de una categoría específica
SELECT
    cg.id,
    cg.nombre as name,
    cg.tipo as type,
    cg.cta_contable as accounting_code,
    cg.activa as is_active,
    CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END as status,
    cg.created_at as createdAt,
    cg.updated_at as updatedAt,
    c.razon_social as community_name,
    cg.comunidad_id as community_id,
    -- Campos adicionales que podrían agregarse
    COALESCE(cg.descripcion, '') as description,
    COALESCE(cg.icono, 'category') as icon,
    COALESCE(cg.color, '#607D8B') as color,
    -- Estadísticas de uso
    COUNT(g.id) as gastos_asociados,
    COALESCE(SUM(g.monto), 0) as total_gastado,
    MAX(g.fecha) as ultimo_gasto
FROM categoria_gasto cg
LEFT JOIN comunidad c ON c.id = cg.comunidad_id
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
WHERE cg.id = ?
GROUP BY cg.id, c.razon_social;

-- Consulta para obtener gastos asociados a una categoría
SELECT
    g.id,
    g.descripcion,
    g.monto,
    g.fecha,
    g.estado,
    g.proveedor,
    g.tipo_documento,
    g.numero_documento
FROM gasto g
INNER JOIN detalle_emision_gastos deg ON deg.gasto_id = g.id
WHERE deg.categoria_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
ORDER BY g.fecha DESC
LIMIT ?;

-- =============================================================================
-- 3. ESTADÍSTICAS Y REPORTES
-- =============================================================================

-- Estadísticas generales de categorías
SELECT
    COUNT(*) as total_categorias,
    COUNT(CASE WHEN activa = 1 THEN 1 END) as categorias_activas,
    COUNT(CASE WHEN activa = 0 THEN 1 END) as categorias_inactivas,
    COUNT(DISTINCT tipo) as tipos_diferentes
FROM categoria_gasto
WHERE comunidad_id = ?;

-- Categorías por tipo
SELECT
    tipo,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN activa = 1 THEN 1 END) as activas,
    COUNT(CASE WHEN activa = 0 THEN 1 END) as inactivas
FROM categoria_gasto
WHERE comunidad_id = ?
GROUP BY tipo
ORDER BY cantidad DESC;

-- Categorías más utilizadas (con más gastos asociados)
SELECT
    cg.id,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    COUNT(g.id) as cantidad_gastos,
    COALESCE(SUM(g.monto), 0) as total_monto,
    AVG(g.monto) as promedio_monto,
    MAX(g.fecha) as ultimo_gasto,
    MIN(g.fecha) as primer_gasto
FROM categoria_gasto cg
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
WHERE cg.comunidad_id = ?
    AND cg.activa = 1
GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable
HAVING COUNT(g.id) > 0
ORDER BY total_monto DESC;

-- Categorías sin uso reciente
SELECT
    cg.id,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    cg.created_at,
    cg.updated_at,
    MAX(g.fecha) as ultimo_gasto,
    DATEDIFF(CURDATE(), MAX(g.fecha)) as dias_sin_uso
FROM categoria_gasto cg
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
WHERE cg.comunidad_id = ?
    AND cg.activa = 1
GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable, cg.created_at, cg.updated_at
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURDATE(), MAX(g.fecha)) > 90
ORDER BY dias_sin_uso DESC;

-- Evolución de uso de categorías por mes
SELECT
    cg.nombre as categoria,
    DATE_FORMAT(g.fecha, '%Y-%m') as mes,
    COUNT(g.id) as cantidad_gastos,
    SUM(g.monto) as total_monto
FROM categoria_gasto cg
INNER JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
INNER JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
WHERE cg.comunidad_id = ?
    AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY cg.id, cg.nombre, DATE_FORMAT(g.fecha, '%Y-%m')
ORDER BY cg.nombre, mes DESC;

-- =============================================================================
-- 4. CONSULTAS PARA FILTROS Y BÚSQUEDA
-- =============================================================================

-- Obtener tipos de categoría disponibles
SELECT DISTINCT tipo
FROM categoria_gasto
WHERE comunidad_id = ?
ORDER BY tipo;

-- Obtener comunidades disponibles
SELECT DISTINCT
    c.id,
    c.razon_social as nombre
FROM comunidad c
INNER JOIN categoria_gasto cg ON cg.comunidad_id = c.id
ORDER BY c.razon_social;

-- Obtener categorías activas para dropdowns
SELECT
    id,
    nombre as name,
    tipo as type,
    cta_contable as accounting_code
FROM categoria_gasto
WHERE comunidad_id = ?
    AND activa = 1
ORDER BY nombre ASC;

-- =============================================================================
-- 5. CONSULTAS PARA EXPORTACIÓN
-- =============================================================================

-- Exportación completa de categorías para Excel/CSV
SELECT
    cg.id,
    cg.nombre as nombre_categoria,
    cg.tipo as tipo_categoria,
    cg.cta_contable as cuenta_contable,
    CASE WHEN cg.activa = 1 THEN 'Activa' ELSE 'Inactiva' END as estado,
    c.razon_social as comunidad,
    cg.created_at as fecha_creacion,
    cg.updated_at as fecha_actualizacion,
    -- Estadísticas
    COUNT(g.id) as cantidad_gastos,
    COALESCE(SUM(g.monto), 0) as total_gastado,
    COALESCE(AVG(g.monto), 0) as promedio_gasto,
    MAX(g.fecha) as ultimo_gasto
FROM categoria_gasto cg
LEFT JOIN comunidad c ON c.id = cg.comunidad_id
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
WHERE (COALESCE(?, '') = '' OR cg.comunidad_id = ?)
    AND (COALESCE(?, '') = '' OR cg.tipo = ?)
    AND (COALESCE(?, '') = '' OR cg.activa = ?)
GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable, cg.activa, c.razon_social, cg.created_at, cg.updated_at
ORDER BY cg.nombre ASC;

-- =============================================================================
-- 6. CONSULTAS PARA VALIDACIONES
-- =============================================================================

-- Verificar si una categoría puede ser eliminada (no tiene gastos asociados)
SELECT
    cg.id,
    cg.nombre,
    COUNT(g.id) as gastos_asociados
FROM categoria_gasto cg
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id
WHERE cg.id = ?
GROUP BY cg.id, cg.nombre
HAVING COUNT(g.id) = 0;

-- Verificar si ya existe una categoría con el mismo nombre en la comunidad
SELECT
    id,
    nombre,
    tipo,
    cta_contable
FROM categoria_gasto
WHERE comunidad_id = ?
    AND nombre = ?
    AND id != COALESCE(?, 0);

-- Verificar si la cuenta contable ya está en uso
SELECT
    id,
    nombre,
    tipo
FROM categoria_gasto
WHERE comunidad_id = ?
    AND cta_contable = ?
    AND id != COALESCE(?, 0);

-- =============================================================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =============================================================================

-- Vista para listado rápido de categorías
CREATE OR REPLACE VIEW vista_categorias_listado AS
SELECT
    cg.id,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    cg.activa,
    CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END as status,
    cg.created_at,
    cg.updated_at,
    c.razon_social as comunidad,
    cg.comunidad_id,
    -- Estadísticas calculadas
    COUNT(DISTINCT g.id) as gastos_asociados,
    COALESCE(SUM(g.monto), 0) as total_gastado,
    MAX(g.fecha) as ultimo_gasto
FROM categoria_gasto cg
LEFT JOIN comunidad c ON c.id = cg.comunidad_id
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable, cg.activa, cg.created_at, cg.updated_at, c.razon_social, cg.comunidad_id;

-- Vista para estadísticas de categorías por comunidad
CREATE OR REPLACE VIEW vista_categorias_estadisticas AS
SELECT
    cg.comunidad_id,
    c.razon_social as comunidad,
    COUNT(*) as total_categorias,
    COUNT(CASE WHEN cg.activa = 1 THEN 1 END) as categorias_activas,
    COUNT(DISTINCT cg.tipo) as tipos_diferentes,
    COUNT(DISTINCT g.id) as total_gastos,
    COALESCE(SUM(g.monto), 0) as total_monto_gastado,
    COALESCE(AVG(g.monto), 0) as promedio_gasto
FROM categoria_gasto cg
LEFT JOIN comunidad c ON c.id = cg.comunidad_id
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
GROUP BY cg.comunidad_id, c.razon_social;

-- Vista para categorías más utilizadas
CREATE OR REPLACE VIEW vista_categorias_mas_utilizadas AS
SELECT
    cg.id,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    cg.comunidad_id,
    c.razon_social as comunidad,
    COUNT(DISTINCT g.id) as cantidad_gastos,
    COALESCE(SUM(g.monto), 0) as total_monto,
    COALESCE(AVG(g.monto), 0) as promedio_monto,
    MAX(g.fecha) as ultimo_gasto,
    MIN(g.fecha) as primer_gasto,
    DATEDIFF(CURDATE(), MAX(g.fecha)) as dias_desde_ultimo_gasto
FROM categoria_gasto cg
LEFT JOIN comunidad c ON c.id = cg.comunidad_id
LEFT JOIN detalle_emision_gastos deg ON deg.categoria_id = cg.id
LEFT JOIN gasto g ON g.id = deg.gasto_id AND g.estado IN ('approved', 'paid', 'completed')
WHERE cg.activa = 1
GROUP BY cg.id, cg.nombre, cg.tipo, cg.cta_contable, cg.comunidad_id, c.razon_social
HAVING COUNT(DISTINCT g.id) > 0
ORDER BY total_monto DESC;

-- =============================================================================
-- 8. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =============================================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_categoria_gasto_comunidad ON categoria_gasto(comunidad_id);
CREATE INDEX idx_categoria_gasto_tipo ON categoria_gasto(tipo);
CREATE INDEX idx_categoria_gasto_activa ON categoria_gasto(activa);
CREATE INDEX idx_categoria_gasto_nombre ON categoria_gasto(nombre);

-- Índices compuestos para filtros complejos
CREATE INDEX idx_categoria_gasto_filtros ON categoria_gasto(comunidad_id, tipo, activa, nombre);

-- Índices para relaciones con gastos
CREATE INDEX idx_detalle_emision_categoria ON detalle_emision_gastos(categoria_id);
CREATE INDEX idx_gasto_estado_fecha ON gasto(estado, fecha);

-- Índice único para cuenta contable por comunidad
CREATE UNIQUE INDEX idx_categoria_gasto_cta_contable ON categoria_gasto(comunidad_id, cta_contable) WHERE cta_contable IS NOT NULL;