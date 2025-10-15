-- Consultas SQL para el módulo de Centros de Costo - Cuentas Claras
-- Este archivo contiene todas las consultas necesarias para el manejo completo de centros de costo

-- =============================================================================
-- 1. LISTADO DE CENTROS DE COSTO CON FILTROS
-- =============================================================================

-- Consulta principal para listado de centros de costo con filtros
SELECT
    cc.id,
    cc.nombre as name,
    cc.codigo as code,
    cc.created_at as createdAt,
    cc.updated_at as updatedAt,
    c.razon_social as community_name,
    cc.comunidad_id as community_id,
    -- Campos adicionales que podrían agregarse a la tabla
    COALESCE(cc.descripcion, '') as description,
    COALESCE(cc.departamento, 'operations') as department,
    COALESCE(cc.responsable, '') as manager,
    COALESCE(cc.presupuesto_anual, 0) as budget,
    COALESCE(cc.icono, 'build') as icon,
    COALESCE(cc.color, '#2196F3') as color,
    COALESCE(cc.activo, 1) as is_active,
    CASE WHEN COALESCE(cc.activo, 1) = 1 THEN 'active' ELSE 'inactive' END as status,
    -- Estadísticas calculadas
    COALESCE(SUM(g.monto), 0) as spent,
    COALESCE(cc.presupuesto_anual, 0) - COALESCE(SUM(g.monto), 0) as remaining_budget,
    CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0
        THEN (COALESCE(SUM(g.monto), 0) / COALESCE(cc.presupuesto_anual, 0)) * 100
        ELSE 0
    END as budget_percentage
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
    AND g.estado IN ('approved', 'paid', 'completed')
    AND YEAR(g.fecha) = YEAR(CURDATE())
WHERE (COALESCE(?, '') = '' OR cc.comunidad_id = ?)
    AND (COALESCE(?, '') = '' OR cc.nombre LIKE CONCAT('%', ?, '%'))
    AND (COALESCE(?, '') = '' OR COALESCE(cc.departamento, 'operations') = ?)
    AND (COALESCE(?, '') = '' OR COALESCE(cc.activo, 1) = ?)
GROUP BY cc.id, cc.nombre, cc.codigo, cc.created_at, cc.updated_at, c.razon_social, cc.comunidad_id
ORDER BY cc.nombre ASC
LIMIT ? OFFSET ?;

-- =============================================================================
-- 2. DETALLE COMPLETO DE UN CENTRO DE COSTO
-- =============================================================================

-- Consulta para obtener detalle completo de un centro de costo específico
SELECT
    cc.id,
    cc.nombre as name,
    cc.codigo as code,
    cc.created_at as createdAt,
    cc.updated_at as updatedAt,
    c.razon_social as community_name,
    cc.comunidad_id as community_id,
    -- Campos adicionales
    COALESCE(cc.descripcion, '') as description,
    COALESCE(cc.departamento, 'operations') as department,
    COALESCE(cc.responsable, '') as manager,
    COALESCE(cc.presupuesto_anual, 0) as budget,
    COALESCE(cc.icono, 'build') as icon,
    COALESCE(cc.color, '#2196F3') as color,
    COALESCE(cc.activo, 1) as is_active,
    CASE WHEN COALESCE(cc.activo, 1) = 1 THEN 'active' ELSE 'inactive' END as status,
    -- Estadísticas del año actual
    COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as spent_current_year,
    COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) - 1 AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as spent_previous_year,
    -- Responsabilidades (si se almacena como JSON o tabla separada)
    COALESCE(cc.responsabilidades_json, '[]') as responsibilities_json
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
WHERE cc.id = ?
GROUP BY cc.id, cc.nombre, cc.codigo, cc.created_at, cc.updated_at, c.razon_social, cc.comunidad_id;

-- Consulta para obtener gastos asociados a un centro de costo
SELECT
    g.id,
    g.descripcion,
    g.monto,
    g.fecha,
    g.estado,
    g.proveedor,
    g.tipo_documento,
    g.numero_documento,
    cg.nombre as categoria_gasto,
    g.fecha_creacion,
    g.fecha_pago
FROM gasto g
LEFT JOIN detalle_emision_gastos deg ON deg.gasto_id = g.id
LEFT JOIN categoria_gasto cg ON cg.id = deg.categoria_id
WHERE g.centro_costo_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
ORDER BY g.fecha DESC
LIMIT ? OFFSET ?;

-- Consulta para obtener estadísticas mensuales de gastos por centro de costo
SELECT
    DATE_FORMAT(g.fecha, '%Y-%m') as mes,
    COUNT(*) as cantidad_gastos,
    SUM(g.monto) as total_gastado,
    AVG(g.monto) as promedio_gasto,
    MIN(g.monto) as gasto_minimo,
    MAX(g.monto) as gasto_maximo
FROM gasto g
WHERE g.centro_costo_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(g.fecha, '%Y-%m')
ORDER BY mes DESC;

-- =============================================================================
-- 3. ESTADÍSTICAS Y REPORTES
-- =============================================================================

-- Estadísticas generales de centros de costo
SELECT
    COUNT(*) as total_centros,
    COUNT(CASE WHEN COALESCE(cc.activo, 1) = 1 THEN 1 END) as centros_activos,
    COUNT(CASE WHEN COALESCE(cc.activo, 1) = 0 THEN 1 END) as centros_inactivos,
    COUNT(DISTINCT COALESCE(cc.departamento, 'operations')) as departamentos_diferentes,
    SUM(COALESCE(cc.presupuesto_anual, 0)) as presupuesto_total,
    SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END) as gastado_total_anio
FROM centro_costo cc
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
WHERE cc.comunidad_id = ?;

-- Centros de costo por departamento
SELECT
    COALESCE(cc.departamento, 'operations') as departamento,
    COUNT(*) as cantidad_centros,
    SUM(COALESCE(cc.presupuesto_anual, 0)) as presupuesto_total,
    SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END) as gastado_anio,
    AVG(CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0
        THEN (SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END) / COALESCE(cc.presupuesto_anual, 0)) * 100
        ELSE 0
    END) as promedio_ejecucion_presupuesto
FROM centro_costo cc
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
WHERE cc.comunidad_id = ?
    AND COALESCE(cc.activo, 1) = 1
GROUP BY COALESCE(cc.departamento, 'operations')
ORDER BY presupuesto_total DESC;

-- Centros de costo con mayor gasto
SELECT
    cc.id,
    cc.nombre,
    cc.codigo,
    COALESCE(cc.presupuesto_anual, 0) as presupuesto,
    COALESCE(SUM(g.monto), 0) as gastado_anio,
    COALESCE(cc.presupuesto_anual, 0) - COALESCE(SUM(g.monto), 0) as presupuesto_restante,
    CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0
        THEN (COALESCE(SUM(g.monto), 0) / COALESCE(cc.presupuesto_anual, 0)) * 100
        ELSE 0
    END as porcentaje_ejecutado,
    COUNT(g.id) as cantidad_gastos
FROM centro_costo cc
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
    AND YEAR(g.fecha) = YEAR(CURDATE())
    AND g.estado IN ('approved', 'paid', 'completed')
WHERE cc.comunidad_id = ?
    AND COALESCE(cc.activo, 1) = 1
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING COALESCE(SUM(g.monto), 0) > 0
ORDER BY gastado_anio DESC;

-- Centros de costo con presupuesto agotado o cercano al límite
SELECT
    cc.id,
    cc.nombre,
    cc.codigo,
    COALESCE(cc.presupuesto_anual, 0) as presupuesto,
    COALESCE(SUM(g.monto), 0) as gastado_anio,
    COALESCE(cc.presupuesto_anual, 0) - COALESCE(SUM(g.monto), 0) as presupuesto_restante,
    CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0
        THEN (COALESCE(SUM(g.monto), 0) / COALESCE(cc.presupuesto_anual, 0)) * 100
        ELSE 0
    END as porcentaje_ejecutado,
    CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0 AND (COALESCE(SUM(g.monto), 0) / COALESCE(cc.presupuesto_anual, 0)) >= 0.9 THEN 'crítico'
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0 AND (COALESCE(SUM(g.monto), 0) / COALESCE(cc.presupuesto_anual, 0)) >= 0.75 THEN 'advertencia'
        ELSE 'normal'
    END as estado_presupuesto
FROM centro_costo cc
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
    AND YEAR(g.fecha) = YEAR(CURDATE())
    AND g.estado IN ('approved', 'paid', 'completed')
WHERE cc.comunidad_id = ?
    AND COALESCE(cc.activo, 1) = 1
    AND COALESCE(cc.presupuesto_anual, 0) > 0
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING (COALESCE(SUM(g.monto), 0) / COALESCE(cc.presupuesto_anual, 0)) >= 0.75
ORDER BY porcentaje_ejecutado DESC;

-- Evolución de gastos por centro de costo (últimos 12 meses)
SELECT
    cc.nombre as centro_costo,
    DATE_FORMAT(g.fecha, '%Y-%m') as mes,
    SUM(g.monto) as total_gastado,
    COUNT(g.id) as cantidad_gastos
FROM centro_costo cc
INNER JOIN gasto g ON g.centro_costo_id = cc.id
WHERE cc.comunidad_id = ?
    AND g.estado IN ('approved', 'paid', 'completed')
    AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY cc.id, cc.nombre, DATE_FORMAT(g.fecha, '%Y-%m')
ORDER BY cc.nombre, mes DESC;

-- =============================================================================
-- 4. CONSULTAS PARA FILTROS Y BÚSQUEDA
-- =============================================================================

-- Obtener departamentos disponibles
SELECT DISTINCT COALESCE(cc.departamento, 'operations') as departamento
FROM centro_costo cc
WHERE cc.comunidad_id = ?
ORDER BY departamento;

-- Obtener comunidades disponibles
SELECT DISTINCT
    c.id,
    c.razon_social as nombre
FROM comunidad c
INNER JOIN centro_costo cc ON cc.comunidad_id = c.id
ORDER BY c.razon_social;

-- Obtener centros de costo activos para dropdowns
SELECT
    cc.id,
    cc.nombre as name,
    cc.codigo as code,
    COALESCE(cc.departamento, 'operations') as department,
    c.razon_social as community
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
WHERE COALESCE(cc.activo, 1) = 1
ORDER BY cc.nombre ASC;

-- =============================================================================
-- 5. CONSULTAS PARA VALIDACIONES
-- =============================================================================

-- Verificar si un centro de costo puede ser eliminado (no tiene gastos asociados)
SELECT
    cc.id,
    cc.nombre,
    COUNT(g.id) as gastos_asociados
FROM centro_costo cc
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
WHERE cc.id = ?
GROUP BY cc.id, cc.nombre
HAVING COUNT(g.id) = 0;

-- Verificar si ya existe un centro de costo con el mismo código en la comunidad
SELECT
    id,
    nombre,
    codigo
FROM centro_costo
WHERE comunidad_id = ?
    AND codigo = ?
    AND id != COALESCE(?, 0);

-- Verificar si ya existe un centro de costo con el mismo nombre en la comunidad
SELECT
    id,
    nombre,
    codigo
FROM centro_costo
WHERE comunidad_id = ?
    AND nombre = ?
    AND id != COALESCE(?, 0);

-- =============================================================================
-- 6. CONSULTAS PARA EXPORTACIÓN
-- =============================================================================

-- Exportación completa de centros de costo para Excel/CSV
SELECT
    cc.id,
    cc.nombre as nombre_centro,
    cc.codigo as codigo_centro,
    c.razon_social as comunidad,
    COALESCE(cc.departamento, 'operations') as departamento,
    COALESCE(cc.responsable, '') as responsable,
    COALESCE(cc.presupuesto_anual, 0) as presupuesto_anual,
    CASE WHEN COALESCE(cc.activo, 1) = 1 THEN 'Activo' ELSE 'Inactivo' END as estado,
    cc.created_at as fecha_creacion,
    cc.updated_at as fecha_actualizacion,
    -- Estadísticas calculadas
    COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as gastado_anio_actual,
    COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) - 1 AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as gastado_anio_anterior,
    COUNT(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN 1 END) as cantidad_gastos_anio,
    COALESCE(cc.presupuesto_anual, 0) - COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as presupuesto_restante
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
WHERE (COALESCE(?, '') = '' OR cc.comunidad_id = ?)
    AND (COALESCE(?, '') = '' OR COALESCE(cc.departamento, 'operations') = ?)
    AND (COALESCE(?, '') = '' OR COALESCE(cc.activo, 1) = ?)
GROUP BY cc.id, cc.nombre, cc.codigo, c.razon_social, cc.created_at, cc.updated_at
ORDER BY cc.nombre ASC;

-- =============================================================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =============================================================================

-- Vista para listado rápido de centros de costo
CREATE OR REPLACE VIEW vista_centros_costo_listado AS
SELECT
    cc.id,
    cc.nombre,
    cc.codigo,
    cc.created_at,
    cc.updated_at,
    c.razon_social as comunidad,
    cc.comunidad_id,
    COALESCE(cc.descripcion, '') as descripcion,
    COALESCE(cc.departamento, 'operations') as departamento,
    COALESCE(cc.responsable, '') as responsable,
    COALESCE(cc.presupuesto_anual, 0) as presupuesto,
    COALESCE(cc.icono, 'build') as icono,
    COALESCE(cc.color, '#2196F3') as color,
    COALESCE(cc.activo, 1) as activo,
    CASE WHEN COALESCE(cc.activo, 1) = 1 THEN 'active' ELSE 'inactive' END as status,
    -- Estadísticas calculadas
    COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as gastado_anio_actual,
    COUNT(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN 1 END) as gastos_anio_actual
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
GROUP BY cc.id, cc.nombre, cc.codigo, cc.created_at, cc.updated_at, c.razon_social, cc.comunidad_id;

-- Vista para estadísticas de centros de costo por comunidad
CREATE OR REPLACE VIEW vista_centros_costo_estadisticas AS
SELECT
    cc.comunidad_id,
    c.razon_social as comunidad,
    COUNT(*) as total_centros,
    COUNT(CASE WHEN COALESCE(cc.activo, 1) = 1 THEN 1 END) as centros_activos,
    COUNT(DISTINCT COALESCE(cc.departamento, 'operations')) as departamentos_diferentes,
    SUM(COALESCE(cc.presupuesto_anual, 0)) as presupuesto_total,
    SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END) as gastado_total_anio,
    AVG(CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0
        THEN (SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END) / COALESCE(cc.presupuesto_anual, 0)) * 100
        ELSE 0
    END) as promedio_ejecucion_presupuesto
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
GROUP BY cc.comunidad_id, c.razon_social;

-- Vista para centros de costo con alertas de presupuesto
CREATE OR REPLACE VIEW vista_centros_costo_alertas AS
SELECT
    cc.id,
    cc.nombre,
    cc.codigo,
    cc.comunidad_id,
    c.razon_social as comunidad,
    COALESCE(cc.presupuesto_anual, 0) as presupuesto,
    COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as gastado_anio,
    COALESCE(cc.presupuesto_anual, 0) - COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) as presupuesto_restante,
    CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0
        THEN (COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) / COALESCE(cc.presupuesto_anual, 0)) * 100
        ELSE 0
    END as porcentaje_ejecutado,
    CASE
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0 AND (COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) / COALESCE(cc.presupuesto_anual, 0)) >= 0.95 THEN 'crítico'
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0 AND (COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) / COALESCE(cc.presupuesto_anual, 0)) >= 0.85 THEN 'alto'
        WHEN COALESCE(cc.presupuesto_anual, 0) > 0 AND (COALESCE(SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURDATE()) AND g.estado IN ('approved', 'paid', 'completed') THEN g.monto END), 0) / COALESCE(cc.presupuesto_anual, 0)) >= 0.75 THEN 'medio'
        ELSE 'normal'
    END as nivel_alerta
FROM centro_costo cc
LEFT JOIN comunidad c ON c.id = cc.comunidad_id
LEFT JOIN gasto g ON g.centro_costo_id = cc.id
WHERE COALESCE(cc.activo, 1) = 1
    AND COALESCE(cc.presupuesto_anual, 0) > 0
GROUP BY cc.id, cc.nombre, cc.codigo, cc.comunidad_id, c.razon_social
HAVING porcentaje_ejecutado >= 75
ORDER BY porcentaje_ejecutado DESC;

-- =============================================================================
-- 8. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =============================================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_centro_costo_comunidad ON centro_costo(comunidad_id);
CREATE INDEX idx_centro_costo_nombre ON centro_costo(nombre);
CREATE INDEX idx_centro_costo_codigo ON centro_costo(codigo);
CREATE INDEX idx_centro_costo_activo ON centro_costo(activo);

-- Índices compuestos para filtros complejos
CREATE INDEX idx_centro_costo_filtros ON centro_costo(comunidad_id, activo, nombre);

-- Índices para campos adicionales (si se agregan)
CREATE INDEX idx_centro_costo_departamento ON centro_costo(departamento) WHERE departamento IS NOT NULL;
CREATE INDEX idx_centro_costo_presupuesto ON centro_costo(presupuesto_anual) WHERE presupuesto_anual IS NOT NULL;

-- Índices para relaciones con gastos
CREATE INDEX idx_gasto_centro_costo ON gasto(centro_costo_id);
CREATE INDEX idx_gasto_centro_costo_fecha ON gasto(centro_costo_id, fecha, estado);

-- Índice único para código por comunidad
CREATE UNIQUE INDEX idx_centro_costo_codigo_unico ON centro_costo(comunidad_id, codigo);