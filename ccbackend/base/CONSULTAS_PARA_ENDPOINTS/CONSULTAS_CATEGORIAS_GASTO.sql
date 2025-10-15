-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DE CATEGORÍAS DE GASTO
-- =========================================
-- Este archivo contiene todas las consultas SQL necesarias
-- para el manejo completo del módulo de categorías de gasto
-- en el sistema Cuentas Claras.

-- =========================================
-- 1. LISTADO DE CATEGORÍAS DE GASTO CON FILTROS Y PAGINACIÓN
-- =========================================

-- 1.1 Listado básico de categorías de gasto con información completa
SELECT
    cg.id,
    cg.comunidad_id,
    c.razon_social AS comunidad_nombre,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    cg.activa,
    CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
    -- Información adicional (si se almacenara en JSON o campos extendidos)
    cg.created_at,
    cg.updated_at
FROM categoria_gasto cg
INNER JOIN comunidad c ON cg.comunidad_id = c.id
WHERE cg.comunidad_id = ?
ORDER BY cg.nombre;

-- 1.2 Listado con filtros avanzados
SELECT
    cg.id,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
    c.razon_social AS comunidad,
    cg.created_at,
    cg.updated_at
FROM categoria_gasto cg
INNER JOIN comunidad c ON cg.comunidad_id = c.id
WHERE (cg.nombre LIKE CONCAT('%', ?, '%') OR ? = '')
    AND (cg.tipo = ? OR ? = '')
    AND (cg.activa = ? OR ? = -1)
    AND (cg.comunidad_id = ? OR ? = 0)
ORDER BY cg.nombre
LIMIT ? OFFSET ?;

-- 1.3 Conteo total para paginación
SELECT COUNT(*) AS total
FROM categoria_gasto cg
INNER JOIN comunidad c ON cg.comunidad_id = c.id
WHERE (cg.nombre LIKE CONCAT('%', ?, '%') OR ? = '')
    AND (cg.tipo = ? OR ? = '')
    AND (cg.activa = ? OR ? = -1)
    AND (cg.comunidad_id = ? OR ? = 0);

-- =========================================
-- 2. DETALLE DE CATEGORÍA DE GASTO ESPECÍFICA
-- =========================================

-- 2.1 Detalle completo de una categoría de gasto
SELECT
    cg.id,
    cg.comunidad_id,
    c.razon_social AS comunidad_nombre,
    cg.nombre,
    cg.tipo,
    cg.cta_contable,
    cg.activa,
    CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
    -- Estadísticas de uso
    (SELECT COUNT(*) FROM gasto g WHERE g.categoria_id = cg.id) AS gastos_asociados,
    (SELECT SUM(g.monto) FROM gasto g WHERE g.categoria_id = cg.id) AS total_gastado,
    (SELECT MAX(g.fecha) FROM gasto g WHERE g.categoria_id = cg.id) AS ultimo_uso,
    -- Metadatos
    cg.created_at,
    cg.updated_at
FROM categoria_gasto cg
INNER JOIN comunidad c ON cg.comunidad_id = c.id
WHERE cg.id = ? AND cg.comunidad_id = ?;

-- 2.2 Últimos gastos asociados a la categoría
SELECT
    g.id,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    p.razon_social AS proveedor,
    g.created_at
FROM gasto g
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.categoria_id = ?
ORDER BY g.fecha DESC
LIMIT 10;

-- =========================================
-- 3. OPERACIONES CRUD
-- =========================================

-- 3.1 Crear nueva categoría de gasto
INSERT INTO categoria_gasto (
    comunidad_id,
    nombre,
    tipo,
    cta_contable,
    activa
) VALUES (?, ?, ?, ?, ?);

-- 3.2 Actualizar categoría de gasto existente
UPDATE categoria_gasto SET
    nombre = ?,
    tipo = ?,
    cta_contable = ?,
    activa = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND comunidad_id = ?;

-- 3.3 Eliminar categoría de gasto
DELETE FROM categoria_gasto WHERE id = ? AND comunidad_id = ?;

-- 3.4 Activar/Desactivar categoría
UPDATE categoria_gasto SET
    activa = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND comunidad_id = ?;

-- =========================================
-- 4. ESTADÍSTICAS Y REPORTES
-- =========================================

-- 4.1 Estadísticas generales de categorías
SELECT
    COUNT(*) AS total_categorias,
    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS categorias_activas,
    SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) AS categorias_inactivas,
    COUNT(DISTINCT tipo) AS tipos_distintos
FROM categoria_gasto
WHERE comunidad_id = ?;

-- 4.2 Estadísticas por tipo de categoría
SELECT
    tipo,
    COUNT(*) AS cantidad,
    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS activas,
    SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) AS inactivas
FROM categoria_gasto
WHERE comunidad_id = ?
GROUP BY tipo
ORDER BY cantidad DESC;

-- 4.3 Categorías más utilizadas (por cantidad de gastos)
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_gasto,
    MAX(g.fecha) AS ultimo_gasto
FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND (g.fecha BETWEEN ? AND ? OR (? = '' AND ? = ''))
GROUP BY cg.id, cg.nombre, cg.tipo
HAVING COUNT(g.id) > 0
ORDER BY cantidad_gastos DESC;

-- 4.4 Categorías más costosas (por monto total)
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_gasto,
    MIN(g.fecha) AS primer_gasto,
    MAX(g.fecha) AS ultimo_gasto
FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND (g.fecha BETWEEN ? AND ? OR (? = '' AND ? = ''))
GROUP BY cg.id, cg.nombre, cg.tipo
HAVING SUM(g.monto) > 0
ORDER BY total_monto DESC;

-- 4.5 Categorías sin uso en período
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    cg.activa,
    MAX(g.fecha) AS ultimo_gasto,
    DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
GROUP BY cg.id, cg.nombre, cg.tipo, cg.activa
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > ?
ORDER BY dias_sin_uso DESC;

-- =========================================
-- 5. VALIDACIONES Y VERIFICACIONES
-- =========================================

-- 5.1 Verificar si existe una categoría de gasto
SELECT COUNT(*) > 0 AS existe
FROM categoria_gasto
WHERE id = ? AND comunidad_id = ?;

-- 5.2 Verificar si existe una categoría con el mismo nombre
SELECT COUNT(*) > 0 AS existe_duplicado
FROM categoria_gasto
WHERE comunidad_id = ?
    AND nombre = ?
    AND id != ?; -- Excluir la categoría actual en caso de actualización

-- 5.3 Verificar si la categoría tiene gastos asociados
SELECT COUNT(*) > 0 AS tiene_gastos
FROM gasto
WHERE categoria_id = ?;

-- 5.4 Verificar si existe el tipo de categoría
SELECT ? IN ('operacional', 'extraordinario', 'fondo_reserva', 'multas', 'consumo') AS tipo_valido;

-- =========================================
-- 6. CONSULTAS PARA LISTAS DESPLEGABLES
-- =========================================

-- 6.1 Lista de categorías activas para dropdowns
SELECT
    id,
    nombre,
    tipo,
    cta_contable
FROM categoria_gasto
WHERE comunidad_id = ? AND activa = 1
ORDER BY nombre;

-- 6.2 Lista de tipos de categoría disponibles
SELECT DISTINCT
    tipo,
    CASE tipo
        WHEN 'operacional' THEN 'Operacional'
        WHEN 'extraordinario' THEN 'Extraordinario'
        WHEN 'fondo_reserva' THEN 'Fondo Reserva'
        WHEN 'multas' THEN 'Multas'
        WHEN 'consumo' THEN 'Consumo'
        ELSE tipo
    END AS descripcion
FROM categoria_gasto
WHERE comunidad_id = ?
ORDER BY tipo;

-- 6.3 Lista de categorías por tipo
SELECT
    id,
    nombre,
    tipo,
    cta_contable,
    activa
FROM categoria_gasto
WHERE comunidad_id = ?
    AND tipo = ?
ORDER BY nombre;

-- =========================================
-- 7. REPORTES AVANZADOS
-- =========================================

-- 7.1 Reporte de uso de categorías por mes
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    YEAR(g.fecha) AS anio,
    MONTH(g.fecha) AS mes,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto
FROM categoria_gasto cg
INNER JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND g.fecha BETWEEN ? AND ?
GROUP BY cg.id, cg.nombre, cg.tipo, YEAR(g.fecha), MONTH(g.fecha)
ORDER BY cg.nombre, anio DESC, mes DESC;

-- 7.2 Análisis comparativo de categorías
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    -- Total general
    COUNT(g.id) AS total_gastos,
    SUM(g.monto) AS total_monto,
    -- Último mes
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_ultimo_mes,
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_ultimo_mes,
    -- Mes anterior
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_mes_anterior,
    SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_mes_anterior
FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
GROUP BY cg.id, cg.nombre, cg.tipo
ORDER BY total_monto DESC;

-- 7.3 Categorías con mayor variabilidad en gastos
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    COUNT(g.id) AS cantidad_gastos,
    AVG(g.monto) AS promedio,
    STDDEV(g.monto) AS desviacion_estandar,
    MIN(g.monto) AS minimo,
    MAX(g.monto) AS maximo,
    (STDDEV(g.monto) / AVG(g.monto)) * 100 AS coeficiente_variacion
FROM categoria_gasto cg
INNER JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND (g.fecha BETWEEN ? AND ? OR (? = '' AND ? = ''))
GROUP BY cg.id, cg.nombre, cg.tipo
HAVING COUNT(g.id) >= 3 -- Al menos 3 gastos para calcular variabilidad
ORDER BY coeficiente_variacion DESC;

-- =========================================
-- 8. CONSULTAS PARA EXPORTACIÓN
-- =========================================

-- 8.1 Exportación completa de categorías para Excel/CSV
SELECT
    cg.id AS 'ID Categoría',
    c.razon_social AS 'Comunidad',
    cg.nombre AS 'Nombre',
    CASE cg.tipo
        WHEN 'operacional' THEN 'Operacional'
        WHEN 'extraordinario' THEN 'Extraordinario'
        WHEN 'fondo_reserva' THEN 'Fondo Reserva'
        WHEN 'multas' THEN 'Multas'
        WHEN 'consumo' THEN 'Consumo'
        ELSE cg.tipo
    END AS 'Tipo',
    cg.cta_contable AS 'Cuenta Contable',
    CASE WHEN cg.activa = 1 THEN 'Activa' ELSE 'Inactiva' END AS 'Estado',
    -- Estadísticas
    COALESCE(stats.cantidad_gastos, 0) AS 'Cantidad Gastos',
    COALESCE(stats.total_monto, 0) AS 'Total Gastado',
    DATE_FORMAT(stats.ultimo_gasto, '%d/%m/%Y') AS 'Último Gasto',
    DATE_FORMAT(cg.created_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(cg.updated_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Actualización'
FROM categoria_gasto cg
INNER JOIN comunidad c ON cg.comunidad_id = c.id
LEFT JOIN (
    SELECT
        categoria_id,
        COUNT(*) AS cantidad_gastos,
        SUM(monto) AS total_monto,
        MAX(fecha) AS ultimo_gasto
    FROM gasto
    GROUP BY categoria_id
) stats ON cg.id = stats.categoria_id
WHERE cg.comunidad_id = ?
ORDER BY cg.nombre;

-- =========================================
-- 9. CONSULTAS PARA DASHBOARD
-- =========================================

-- 9.1 Resumen de categorías para dashboard
SELECT
    COUNT(*) AS total_categorias,
    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS categorias_activas,
    SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) AS categorias_inactivas,
    COUNT(DISTINCT tipo) AS tipos_categorias
FROM categoria_gasto
WHERE comunidad_id = ?;

-- 9.2 Top categorías por gasto en el último mes
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto
FROM categoria_gasto cg
INNER JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
GROUP BY cg.id, cg.nombre, cg.tipo
ORDER BY total_monto DESC
LIMIT 5;

-- 9.3 Categorías sin uso reciente
SELECT
    cg.nombre AS categoria,
    cg.tipo,
    MAX(g.fecha) AS ultimo_gasto,
    DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND cg.activa = 1
GROUP BY cg.id, cg.nombre, cg.tipo
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > 30
ORDER BY dias_sin_uso DESC
LIMIT 10;

-- 9.4 Distribución de gastos por tipo de categoría
SELECT
    cg.tipo,
    CASE cg.tipo
        WHEN 'operacional' THEN 'Operacional'
        WHEN 'extraordinario' THEN 'Extraordinario'
        WHEN 'fondo_reserva' THEN 'Fondo Reserva'
        WHEN 'multas' THEN 'Multas'
        WHEN 'consumo' THEN 'Consumo'
        ELSE cg.tipo
    END AS tipo_descripcion,
    COUNT(DISTINCT cg.id) AS categorias,
    COUNT(g.id) AS total_gastos,
    SUM(g.monto) AS total_monto,
    (SUM(g.monto) / (SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?)) * 100 AS porcentaje_total
FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id
WHERE cg.comunidad_id = ?
    AND (g.fecha BETWEEN ? AND ? OR (? = '' AND ? = ''))
GROUP BY cg.tipo
ORDER BY total_monto DESC;