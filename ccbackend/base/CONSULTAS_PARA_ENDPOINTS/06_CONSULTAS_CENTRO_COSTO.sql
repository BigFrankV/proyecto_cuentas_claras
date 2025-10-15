-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DE CENTROS DE COSTO
-- =========================================
-- Este archivo contiene todas las consultas SQL necesarias
-- para el manejo completo del módulo de centros de costo
-- en el sistema Cuentas Claras.

-- =========================================
-- 1. LISTADO DE CENTROS DE COSTO CON FILTROS Y PAGINACIÓN
-- =========================================

-- 1.1 Listado básico de centros de costo con información completa
SELECT
    cc.id,
    cc.comunidad_id,
    c.razon_social AS comunidad_nombre,
    cc.nombre,
    cc.codigo,
    cc.created_at,
    cc.updated_at
FROM centro_costo cc
INNER JOIN comunidad c ON cc.comunidad_id = c.id
WHERE cc.comunidad_id = ?
ORDER BY cc.nombre;

-- 1.2 Listado con filtros avanzados
SELECT
    cc.id,
    cc.nombre,
    cc.codigo,
    c.razon_social AS comunidad,
    cc.created_at,
    cc.updated_at,
    -- Estadísticas de gastos asociados
    COALESCE(stats.total_gastado, 0) AS total_gastado,
    COALESCE(stats.cantidad_gastos, 0) AS cantidad_gastos,
    COALESCE(stats.ultimo_gasto, NULL) AS ultimo_gasto
FROM centro_costo cc
INNER JOIN comunidad c ON cc.comunidad_id = c.id
LEFT JOIN (
    SELECT
        centro_costo_id,
        SUM(monto) AS total_gastado,
        COUNT(*) AS cantidad_gastos,
        MAX(fecha) AS ultimo_gasto
    FROM gasto
    WHERE centro_costo_id IS NOT NULL
    GROUP BY centro_costo_id
) AS stats ON cc.id = stats.centro_costo_id
WHERE (cc.nombre LIKE CONCAT('%', ?1, '%') OR cc.codigo LIKE CONCAT('%', ?2, '%') OR ?3 = '') -- Filtrar por nombre, código o si el placeholder es vacío
    AND (cc.comunidad_id = ?4 OR ?5 = 0)
ORDER BY cc.nombre
LIMIT ?6 OFFSET ?7;

-- 1.3 Conteo total para paginación
SELECT COUNT(*) AS total
FROM centro_costo cc
INNER JOIN comunidad c ON cc.comunidad_id = c.id
WHERE (cc.nombre LIKE CONCAT('%', ?1, '%') OR cc.codigo LIKE CONCAT('%', ?2, '%') OR ?3 = '')
    AND (cc.comunidad_id = ?4 OR ?5 = 0);

-- =========================================
-- 2. DETALLE DE CENTRO DE COSTO ESPECÍFICO
-- =========================================

-- 2.1 Detalle completo de un centro de costo
SELECT
    cc.id,
    cc.comunidad_id,
    c.razon_social AS comunidad_nombre,
    cc.nombre,
    cc.codigo,
    -- Estadísticas de gastos
    COALESCE(stats.total_gastado, 0) AS total_gastado,
    COALESCE(stats.cantidad_gastos, 0) AS cantidad_gastos,
    COALESCE(stats.gasto_promedio, 0) AS gasto_promedio,
    COALESCE(stats.primer_gasto, NULL) AS primer_gasto,
    COALESCE(stats.ultimo_gasto, NULL) AS ultimo_gasto,
    -- Metadatos
    cc.created_at,
    cc.updated_at
FROM centro_costo cc
INNER JOIN comunidad c ON cc.comunidad_id = c.id
LEFT JOIN (
    SELECT
        centro_costo_id,
        SUM(monto) AS total_gastado,
        COUNT(*) AS cantidad_gastos,
        AVG(monto) AS gasto_promedio,
        MIN(fecha) AS primer_gasto,
        MAX(fecha) AS ultimo_gasto
    FROM gasto
    WHERE centro_costo_id IS NOT NULL
    GROUP BY centro_costo_id
) AS stats ON cc.id = stats.centro_costo_id
WHERE cc.id = ? AND cc.comunidad_id = ?;

-- 2.2 Gastos asociados al centro de costo (últimos 20)
SELECT
    g.id,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    cat.nombre AS categoria,
    p.razon_social AS proveedor,
    dc.folio AS documento_numero,
    g.created_at
FROM gasto g
LEFT JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.centro_costo_id = ?
ORDER BY g.fecha DESC, g.created_at DESC
LIMIT 20;

-- 2.3 Resumen mensual de gastos del centro de costo
SELECT
    DATE_FORMAT(fecha, '%Y-%m') AS mes,
    COUNT(*) AS cantidad_gastos,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_monto,
    MIN(monto) AS monto_minimo,
    MAX(monto) AS monto_maximo
FROM gasto
WHERE centro_costo_id = ?
    AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fecha, '%Y-%m')
ORDER BY mes DESC;

-- =========================================
-- 3. OPERACIONES CRUD
-- =========================================

-- 3.1 Crear nuevo centro de costo
INSERT INTO centro_costo (
    comunidad_id,
    nombre,
    codigo
) VALUES (?, ?, ?);

-- 3.2 Actualizar centro de costo existente
UPDATE centro_costo SET
    nombre = ?,
    codigo = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND comunidad_id = ?;

-- 3.3 Eliminar centro de costo
DELETE FROM centro_costo WHERE id = ? AND comunidad_id = ?;

-- =========================================
-- 4. ESTADÍSTICAS Y REPORTES
-- =========================================

-- 4.1 Estadísticas generales de centros de costo
SELECT
    COUNT(*) AS total_centros,
    COUNT(DISTINCT comunidad_id) AS comunidades_distintas,
    SUM(CASE WHEN stats.total_gastado > 0 THEN 1 ELSE 0 END) AS centros_con_gastos,
    SUM(stats.total_gastado) AS total_general_gastado,
    AVG(stats.total_gastado) AS promedio_gastado_por_centro
FROM centro_costo cc
LEFT JOIN (
    SELECT
        centro_costo_id,
        SUM(monto) AS total_gastado
    FROM gasto
    WHERE centro_costo_id IS NOT NULL
    GROUP BY centro_costo_id
) AS stats ON cc.id = stats.centro_costo_id
WHERE cc.comunidad_id = ?;

-- 4.2 Centros de costo más utilizados (por cantidad de gastos)
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_gasto,
    MAX(g.fecha) AS ultimo_gasto
FROM centro_costo cc
INNER JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
    -- CORRECCIÓN: Manejar los placeholders de fecha como IS NULL o rango completo
    AND (g.fecha BETWEEN ? AND ? OR (? IS NULL AND ? IS NULL))
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING COUNT(g.id) > 0
ORDER BY cantidad_gastos DESC;

-- 4.3 Centros de costo más costosos (por monto total)
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_gasto,
    MIN(g.fecha) AS primer_gasto,
    MAX(g.fecha) AS ultimo_gasto
FROM centro_costo cc
INNER JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
    -- CORRECCIÓN: Manejar los placeholders de fecha como IS NULL o rango completo
    AND (g.fecha BETWEEN ? AND ? OR (? IS NULL AND ? IS NULL))
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING SUM(g.monto) > 0
ORDER BY total_monto DESC;

-- 4.4 Centros de costo sin uso en período
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    MAX(g.fecha) AS ultimo_gasto,
    DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
FROM centro_costo cc
LEFT JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > ?
ORDER BY dias_sin_uso DESC;

-- 4.5 Análisis de gastos por centro de costo y categoría
SELECT
    cc.nombre AS centro_costo,
    cat.nombre AS categoria,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto,
    -- CORRECCIÓN: Subconsulta optimizada para el porcentaje total del centro
    (SUM(g.monto) / NULLIF((SELECT SUM(monto) FROM gasto WHERE centro_costo_id = cc.id), 0)) * 100 AS porcentaje_del_centro
FROM centro_costo cc
INNER JOIN gasto g ON cc.id = g.centro_costo_id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
WHERE cc.comunidad_id = ?
    -- CORRECCIÓN: Manejar los placeholders de fecha como IS NULL o rango completo
    AND (g.fecha BETWEEN ? AND ? OR (? IS NULL AND ? IS NULL))
GROUP BY cc.id, cc.nombre, cat.id, cat.nombre
ORDER BY cc.nombre, total_monto DESC;

-- =========================================
-- 5. VALIDACIONES Y VERIFICACIONES
-- =========================================

-- 5.1 Verificar si existe un centro de costo
SELECT COUNT(*) > 0 AS existe
FROM centro_costo
WHERE id = ? AND comunidad_id = ?;

-- 5.2 Verificar si existe un centro de costo con el mismo nombre
SELECT COUNT(*) > 0 AS existe_duplicado
FROM centro_costo
WHERE comunidad_id = ?
    AND nombre = ?
    AND id != ?; -- Excluir el centro actual en caso de actualización

-- 5.3 Verificar si existe un centro de costo con el mismo código
SELECT COUNT(*) > 0 AS existe_duplicado_codigo
FROM centro_costo
WHERE comunidad_id = ?
    AND codigo = ?
    AND id != ?; -- Excluir el centro actual en caso de actualización

-- 5.4 Verificar si el centro de costo tiene gastos asociados
SELECT COUNT(*) > 0 AS tiene_gastos
FROM gasto
WHERE centro_costo_id = ?;

-- =========================================
-- 6. CONSULTAS PARA LISTAS DESPLEGABLES
-- =========================================

-- 6.1 Lista de centros de costo para dropdowns
SELECT
    id,
    nombre,
    codigo,
    CONCAT(nombre, ' (', codigo, ')') AS nombre_completo
FROM centro_costo
WHERE comunidad_id = ?
ORDER BY nombre;

-- 6.2 Lista de centros de costo con estadísticas
SELECT
    cc.id,
    cc.nombre,
    cc.codigo,
    COALESCE(stats.total_gastado, 0) AS total_gastado,
    COALESCE(stats.cantidad_gastos, 0) AS cantidad_gastos
FROM centro_costo cc
LEFT JOIN (
    SELECT
        centro_costo_id,
        SUM(monto) AS total_gastado,
        COUNT(*) AS cantidad_gastos
    FROM gasto
    WHERE centro_costo_id IS NOT NULL
    GROUP BY centro_costo_id
) AS stats ON cc.id = stats.centro_costo_id
WHERE cc.comunidad_id = ?
ORDER BY cc.nombre;

-- =========================================
-- 7. REPORTES AVANZADOS
-- =========================================

-- 7.1 Reporte de uso de centros de costo por mes
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    YEAR(g.fecha) AS anio,
    MONTH(g.fecha) AS mes,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto
FROM centro_costo cc
INNER JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
    AND g.fecha BETWEEN ? AND ?
GROUP BY cc.id, cc.nombre, cc.codigo, YEAR(g.fecha), MONTH(g.fecha)
ORDER BY cc.nombre, anio DESC, mes DESC;

-- 7.2 Análisis comparativo de centros de costo
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    -- Total general
    COUNT(g.id) AS total_gastos,
    SUM(g.monto) AS total_monto,
    -- Último mes
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_ultimo_mes,
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_ultimo_mes,
    -- Mes anterior
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_mes_anterior,
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_mes_anterior
FROM centro_costo cc
LEFT JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
GROUP BY cc.id, cc.nombre, cc.codigo
ORDER BY total_monto DESC;

-- 7.3 Centros de costo con mayor variabilidad en gastos
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS cantidad_gastos,
    AVG(g.monto) AS promedio,
    STDDEV(g.monto) AS desviacion_estandar,
    MIN(g.monto) AS minimo,
    MAX(g.monto) AS maximo,
    -- CORRECCIÓN: Uso de NULLIF para evitar división por cero
    (STDDEV(g.monto) / NULLIF(AVG(g.monto), 0)) * 100 AS coeficiente_variacion
FROM centro_costo cc
INNER JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
    -- CORRECCIÓN: Manejar los placeholders de fecha como IS NULL o rango completo
    AND (g.fecha BETWEEN ? AND ? OR (? IS NULL AND ? IS NULL))
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING COUNT(g.id) >= 3 -- Al menos 3 gastos para calcular variabilidad
    AND AVG(g.monto) IS NOT NULL -- Asegurar que no dividamos por NULL/cero
ORDER BY coeficiente_variacion DESC;

-- =========================================
-- 8. CONSULTAS PARA EXPORTACIÓN
-- =========================================

-- 8.1 Exportación completa de centros de costo para Excel/CSV
SELECT
    cc.id AS 'ID Centro Costo',
    c.razon_social AS 'Comunidad',
    cc.nombre AS 'Nombre',
    cc.codigo AS 'Código',
    -- Estadísticas
    COALESCE(stats.cantidad_gastos, 0) AS 'Cantidad Gastos',
    COALESCE(stats.total_gastado, 0) AS 'Total Gastado',
    COALESCE(stats.gasto_promedio, 0) AS 'Gasto Promedio',
    DATE_FORMAT(stats.primer_gasto, '%d/%m/%Y') AS 'Primer Gasto',
    DATE_FORMAT(stats.ultimo_gasto, '%d/%m/%Y') AS 'Último Gasto',
    DATE_FORMAT(cc.created_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(cc.updated_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Actualización'
FROM centro_costo cc
INNER JOIN comunidad c ON cc.comunidad_id = c.id
LEFT JOIN (
    SELECT
        centro_costo_id,
        COUNT(*) AS cantidad_gastos,
        SUM(monto) AS total_gastado,
        AVG(monto) AS gasto_promedio,
        MIN(fecha) AS primer_gasto,
        MAX(fecha) AS ultimo_gasto
    FROM gasto
    GROUP BY centro_costo_id
) AS stats ON cc.id = stats.centro_costo_id
WHERE cc.comunidad_id = ?
ORDER BY cc.nombre;

-- =========================================
-- 9. CONSULTAS PARA DASHBOARD
-- =========================================

-- 9.1 Resumen de centros de costo para dashboard (Sin cambios estructurales)
SELECT
    COUNT(*) AS total_centros,
    COUNT(DISTINCT comunidad_id) AS comunidades,
    SUM(COALESCE(stats.total_gastado, 0)) AS total_general_gastado,
    AVG(COALESCE(stats.total_gastado, 0)) AS promedio_gastado_por_centro
FROM centro_costo cc
LEFT JOIN (
    SELECT
        centro_costo_id,
        SUM(monto) AS total_gastado
    FROM gasto
    WHERE centro_costo_id IS NOT NULL
    GROUP BY centro_costo_id
) AS stats ON cc.id = stats.centro_costo_id
WHERE cc.comunidad_id = ?;

-- 9.2 Top centros de costo por gasto en el último mes (Sin cambios estructurales)
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto
FROM centro_costo cc
INNER JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
    AND g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
GROUP BY cc.id, cc.nombre, cc.codigo
ORDER BY total_monto DESC
LIMIT 5;

-- 9.3 Centros de costo sin uso reciente (Sin cambios estructurales)
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    MAX(g.fecha) AS ultimo_gasto,
    DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
FROM centro_costo cc
LEFT JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?
GROUP BY cc.id, cc.nombre, cc.codigo
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > 30
ORDER BY dias_sin_uso DESC
LIMIT 10;

-- 9.4 Distribución de gastos por centro de costo
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS total_gastos,
    SUM(g.monto) AS total_monto,
    -- CORRECCIÓN: Uso de NULLIF y se asegura de que la subconsulta sea el total de la comunidad
    (SUM(g.monto) / NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = cc.comunidad_id), 0)) * 100 AS porcentaje_total
FROM centro_costo cc
LEFT JOIN gasto g ON cc.id = g.centro_costo_id
WHERE cc.comunidad_id = ?1
    -- CORRECCIÓN: Manejar los placeholders de fecha como IS NULL o rango completo
    AND (g.fecha BETWEEN ?2 AND ?3 OR (?4 IS NULL AND ?5 IS NULL))
GROUP BY cc.id, cc.nombre, cc.codigo, cc.comunidad_id
HAVING SUM(g.monto) > 0
ORDER BY total_monto DESC;