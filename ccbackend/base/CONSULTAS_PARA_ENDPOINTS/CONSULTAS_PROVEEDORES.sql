-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DE PROVEEDORES
-- =========================================
-- Este archivo contiene todas las consultas SQL necesarias
-- para el manejo completo del módulo de proveedores en el sistema
-- Cuentas Claras.

-- =========================================
-- 1. LISTADO DE PROVEEDORES CON ESTADÍSTICAS
-- =========================================

-- 1.1 Listado básico de proveedores con estadísticas de uso
SELECT
    p.id,
    p.comunidad_id,
    c.razon_social AS comunidad_nombre,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) AS rut_completo,
    p.razon_social AS nombre,
    p.giro AS categoria_principal,
    p.email,
    p.telefono,
    p.direccion,
    p.activo,
    -- Estadísticas de uso
    COUNT(DISTINCT dc.id) AS total_documentos,
    COUNT(DISTINCT g.id) AS total_gastos,
    COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
    COALESCE(AVG(g.monto), 0) AS promedio_gasto,
    MAX(g.fecha) AS ultimo_gasto_fecha,
    DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
    -- Metadatos
    p.created_at,
    p.updated_at
FROM proveedor p
INNER JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?
GROUP BY p.id
ORDER BY p.activo DESC, p.razon_social ASC;

-- 1.2 Listado con filtros avanzados
SELECT
    p.id,
    p.comunidad_id,
    c.razon_social AS comunidad_nombre,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) AS rut_completo,
    p.razon_social AS nombre,
    p.giro AS categoria_principal,
    p.email,
    p.telefono,
    p.direccion,
    p.activo,
    -- Estadísticas calculadas
    COUNT(DISTINCT dc.id) AS total_documentos,
    COUNT(DISTINCT g.id) AS total_gastos,
    COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
    COALESCE(AVG(g.monto), 0) AS promedio_gasto,
    MAX(g.fecha) AS ultimo_gasto_fecha,
    DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
    -- Metadatos
    p.created_at,
    p.updated_at
FROM proveedor p
INNER JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?
  AND (p.activo = ? OR ? IS NULL)
  AND (p.razon_social LIKE CONCAT('%', ?, '%') OR ? IS NULL)
  AND (p.giro LIKE CONCAT('%', ?, '%') OR ? IS NULL)
  AND (p.rut LIKE CONCAT('%', ?, '%') OR ? IS NULL)
GROUP BY p.id
ORDER BY
    CASE WHEN ? = 'activo' THEN p.activo END DESC,
    CASE WHEN ? = 'nombre' THEN p.razon_social END ASC,
    CASE WHEN ? = 'total_gastado' THEN COALESCE(SUM(g.monto), 0) END DESC,
    CASE WHEN ? = 'ultimo_gasto' THEN MAX(g.fecha) END DESC,
    p.razon_social ASC
LIMIT ? OFFSET ?;

-- 1.3 Estadísticas generales de proveedores
SELECT
    COUNT(*) AS total_proveedores,
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS proveedores_activos,
    SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) AS proveedores_inactivos,
    AVG(total_gastos) AS promedio_gastos_por_proveedor,
    AVG(monto_total) AS promedio_monto_por_proveedor,
    MAX(monto_total) AS maximo_monto_gastado,
    MIN(monto_total) AS minimo_monto_gastado
FROM (
    SELECT
        p.id,
        COUNT(DISTINCT g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total
    FROM proveedor p
    LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
    LEFT JOIN gasto g ON dc.id = g.documento_compra_id
    WHERE p.comunidad_id = ?
    GROUP BY p.id
) AS stats;

-- =========================================
-- 2. DETALLE COMPLETO DE PROVEEDOR
-- =========================================

-- 2.1 Detalle completo de un proveedor específico
SELECT
    p.id,
    p.comunidad_id,
    c.razon_social AS comunidad_nombre,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) AS rut_completo,
    p.razon_social AS nombre,
    p.giro AS categoria_principal,
    p.email,
    p.telefono,
    p.direccion,
    p.activo,
    -- Estadísticas detalladas
    COUNT(DISTINCT dc.id) AS total_documentos,
    COUNT(DISTINCT g.id) AS total_gastos,
    COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
    COALESCE(AVG(g.monto), 0) AS promedio_gasto,
    MIN(g.fecha) AS primer_gasto_fecha,
    MAX(g.fecha) AS ultimo_gasto_fecha,
    DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
    -- Información adicional
    p.created_at,
    p.updated_at
FROM proveedor p
INNER JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.id = ? AND p.comunidad_id = ?
GROUP BY p.id;

-- 2.2 Historial de gastos por proveedor
SELECT
    g.id AS gasto_id,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    g.extraordinario,
    -- Información del documento
    dc.tipo_doc,
    dc.folio,
    dc.fecha_emision,
    dc.total AS documento_total,
    -- Información de categoría y centro de costo
    cat.nombre AS categoria_nombre,
    cat.tipo AS categoria_tipo,
    cc.nombre AS centro_costo_nombre,
    -- Metadatos
    g.created_at
FROM gasto g
INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
WHERE dc.proveedor_id = ?
ORDER BY g.fecha DESC, g.created_at DESC;

-- 2.3 Documentos de compra por proveedor
SELECT
    dc.id,
    dc.tipo_doc,
    dc.folio,
    dc.fecha_emision,
    dc.neto,
    dc.iva,
    dc.exento,
    dc.total,
    dc.glosa,
    -- Estadísticas de gastos asociados
    COUNT(g.id) AS gastos_asociados,
    COALESCE(SUM(g.monto), 0) AS total_gastado,
    -- Metadatos
    dc.created_at,
    dc.updated_at
FROM documento_compra dc
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE dc.proveedor_id = ?
GROUP BY dc.id
ORDER BY dc.fecha_emision DESC;

-- =========================================
-- 3. OPERACIONES CRUD
-- =========================================

-- 3.1 Crear nuevo proveedor
INSERT INTO proveedor (
    comunidad_id,
    rut,
    dv,
    razon_social,
    giro,
    email,
    telefono,
    direccion,
    activo
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1);

-- 3.2 Actualizar proveedor existente
UPDATE proveedor SET
    razon_social = ?,
    giro = ?,
    email = ?,
    telefono = ?,
    direccion = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND comunidad_id = ?;

-- 3.3 Desactivar/Activar proveedor (lógica de eliminación)
UPDATE proveedor SET
    activo = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND comunidad_id = ?;

-- 3.4 Eliminar proveedor físicamente (solo si no tiene dependencias)
DELETE FROM proveedor
WHERE id = ? AND comunidad_id = ?
  AND NOT EXISTS (SELECT 1 FROM documento_compra WHERE proveedor_id = ?);

-- =========================================
-- 4. ESTADÍSTICAS Y REPORTES AVANZADOS
-- =========================================

-- 4.1 Proveedores por volumen de gasto (Top 10)
SELECT
    p.id,
    p.razon_social AS nombre,
    p.giro,
    COUNT(DISTINCT dc.id) AS total_documentos,
    COUNT(DISTINCT g.id) AS total_gastos,
    COALESCE(SUM(g.monto), 0) AS monto_total,
    COALESCE(AVG(g.monto), 0) AS promedio_gasto,
    MAX(g.fecha) AS ultimo_gasto
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ? AND p.activo = 1
GROUP BY p.id
HAVING COALESCE(SUM(g.monto), 0) > 0
ORDER BY COALESCE(SUM(g.monto), 0) DESC
LIMIT 10;

-- 4.2 Proveedores inactivos (sin gastos en los últimos N meses)
SELECT
    p.id,
    p.razon_social AS nombre,
    p.giro,
    p.email,
    p.telefono,
    MAX(g.fecha) AS ultimo_gasto,
    DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
    COUNT(DISTINCT g.id) AS total_gastos_historicos,
    COALESCE(SUM(g.monto), 0) AS monto_total_historico
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ? AND p.activo = 1
GROUP BY p.id
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURDATE(), MAX(g.fecha)) > ?
ORDER BY DATEDIFF(CURDATE(), MAX(g.fecha)) DESC;

-- 4.3 Análisis mensual de gastos por proveedor
SELECT
    p.id,
    p.razon_social AS nombre,
    YEAR(g.fecha) AS anio,
    MONTH(g.fecha) AS mes,
    DATE_FORMAT(g.fecha, '%Y-%m') AS periodo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
GROUP BY p.id, YEAR(g.fecha), MONTH(g.fecha)
ORDER BY p.razon_social, anio DESC, mes DESC;

-- 4.4 Proveedores por categoría de gasto
SELECT
    cat.nombre AS categoria,
    cat.tipo AS tipo_categoria,
    COUNT(DISTINCT p.id) AS cantidad_proveedores,
    COUNT(g.id) AS total_gastos,
    SUM(g.monto) AS monto_total,
    AVG(g.monto) AS promedio_gasto
FROM categoria_gasto cat
LEFT JOIN gasto g ON cat.id = g.categoria_id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE cat.comunidad_id = ?
GROUP BY cat.id, cat.nombre, cat.tipo
ORDER BY SUM(g.monto) DESC;

-- 4.5 Comparativa de proveedores por período
SELECT
    p.id,
    p.razon_social AS nombre,
    -- Período actual
    COUNT(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.id END) AS gastos_periodo_actual,
    COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) AS monto_periodo_actual,
    -- Período anterior
    COUNT(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.id END) AS gastos_periodo_anterior,
    COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) AS monto_periodo_anterior,
    -- Variación porcentual
    CASE
        WHEN COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) > 0
        THEN ROUND(
            ((COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) -
              COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0)) /
             COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0)) * 100, 2)
        ELSE NULL
    END AS variacion_porcentual
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ? AND p.activo = 1
GROUP BY p.id
HAVING (gastos_periodo_actual > 0 OR gastos_periodo_anterior > 0)
ORDER BY monto_periodo_actual DESC;

-- =========================================
-- 5. VALIDACIONES
-- =========================================

-- 5.1 Validar que el RUT no esté duplicado en la comunidad
SELECT COUNT(*) AS existe_rut
FROM proveedor
WHERE comunidad_id = ? AND rut = ? AND dv = ? AND id != ?;

-- 5.2 Validar que el proveedor no tenga documentos asociados antes de eliminar
SELECT
    COUNT(dc.id) AS documentos_asociados,
    COUNT(g.id) AS gastos_asociados
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.id = ?;

-- 5.3 Validar formato de RUT chileno
SELECT
    CASE
        WHEN ? REGEXP '^[0-9]{7,8}$' AND ? REGEXP '^[0-9Kk]$' THEN 1
        ELSE 0
    END AS rut_valido;

-- 5.4 Verificar si el proveedor está siendo usado en documentos recientes
SELECT
    COUNT(*) AS documentos_recientes,
    MAX(dc.fecha_emision) AS ultima_fecha_emision
FROM documento_compra dc
WHERE dc.proveedor_id = ?
  AND dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL ? DAY);

-- =========================================
-- 6. DASHBOARD Y MÉTRICAS
-- =========================================

-- 6.1 Resumen general para dashboard de proveedores
SELECT
    -- Totales generales
    COUNT(CASE WHEN p.activo = 1 THEN 1 END) AS proveedores_activos,
    COUNT(CASE WHEN p.activo = 0 THEN 1 END) AS proveedores_inactivos,
    COUNT(DISTINCT dc.proveedor_id) AS proveedores_con_compras,

    -- Estadísticas de gastos
    COALESCE(SUM(g.monto), 0) AS total_gastado_mes_actual,
    COALESCE(AVG(g.monto), 0) AS promedio_gasto,

    -- Proveedores más activos (último mes)
    COUNT(DISTINCT CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN p.id END) AS proveedores_activos_mes,

    -- Alertas
    COUNT(DISTINCT CASE WHEN DATEDIFF(CURDATE(), MAX(g.fecha)) > 90 THEN p.id END) AS proveedores_sin_gasto_90_dias

FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
WHERE p.comunidad_id = ?;

-- 6.2 Top proveedores del mes
SELECT
    p.id,
    p.razon_social AS nombre,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto,
    MAX(g.fecha) AS ultimo_gasto
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND p.activo = 1
GROUP BY p.id
ORDER BY SUM(g.monto) DESC
LIMIT 5;

-- 6.3 Distribución de gastos por proveedor (para gráficos)
SELECT
    p.razon_social AS nombre,
    SUM(g.monto) AS total_monto,
    ROUND((SUM(g.monto) / (SELECT SUM(g2.monto)
                           FROM gasto g2
                           INNER JOIN documento_compra dc2 ON g2.documento_compra_id = dc2.id
                           WHERE dc2.proveedor_id IN (SELECT id FROM proveedor WHERE comunidad_id = ?)
                           AND g2.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH))) * 100, 2) AS porcentaje_total
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
  AND p.activo = 1
GROUP BY p.id
HAVING SUM(g.monto) > 0
ORDER BY SUM(g.monto) DESC
LIMIT 10;

-- 6.4 Alertas de proveedores inactivos
SELECT
    p.id,
    p.razon_social AS nombre,
    p.email,
    p.telefono,
    MAX(g.fecha) AS ultimo_gasto,
    DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_actividad,
    COUNT(g.id) AS total_gastos_historicos,
    COALESCE(SUM(g.monto), 0) AS monto_total_historico
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ? AND p.activo = 1
GROUP BY p.id
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURDATE(), MAX(g.fecha)) > ?
ORDER BY DATEDIFF(CURDATE(), MAX(g.fecha)) DESC;

-- =========================================
-- 7. CONSULTAS DE MANTENIMIENTO
-- =========================================

-- 7.1 Limpiar proveedores inactivos sin uso histórico
SELECT
    p.id,
    p.razon_social AS nombre,
    COUNT(dc.id) AS documentos_asociados,
    COUNT(g.id) AS gastos_asociados
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.activo = 0
GROUP BY p.id
HAVING COUNT(dc.id) = 0 AND COUNT(g.id) = 0;

-- 7.2 Consolidar proveedores duplicados (mismo RUT)
SELECT
    p1.id AS proveedor_1_id,
    p1.razon_social AS proveedor_1_nombre,
    p2.id AS proveedor_2_id,
    p2.razon_social AS proveedor_2_nombre,
    CONCAT(p1.rut, '-', p1.dv) AS rut_comun,
    COUNT(DISTINCT dc1.id) + COUNT(DISTINCT dc2.id) AS total_documentos_combinados
FROM proveedor p1
INNER JOIN proveedor p2 ON p1.comunidad_id = p2.comunidad_id
    AND p1.rut = p2.rut AND p1.dv = p2.dv
    AND p1.id < p2.id
LEFT JOIN documento_compra dc1 ON p1.id = dc1.proveedor_id
LEFT JOIN documento_compra dc2 ON p2.id = dc2.proveedor_id
GROUP BY p1.id, p2.id;

-- 7.3 Auditoría de cambios en proveedores
SELECT
    a.id,
    a.usuario_id,
    u.nombre AS usuario_nombre,
    a.accion,
    a.tabla,
    a.registro_id,
    a.valores_anteriores,
    a.valores_nuevos,
    a.created_at
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.tabla = 'proveedor'
  AND a.registro_id = ?
ORDER BY a.created_at DESC;

-- =========================================
-- 8. EXPORTACIÓN E INTEGRACIÓN
-- =========================================

-- 8.1 Exportar proveedores con todos sus datos
SELECT
    p.id,
    CONCAT(p.rut, '-', p.dv) AS rut_completo,
    p.razon_social AS nombre,
    p.giro AS categoria,
    p.email,
    p.telefono,
    p.direccion,
    p.activo,
    -- Estadísticas
    COUNT(DISTINCT dc.id) AS total_documentos,
    COUNT(DISTINCT g.id) AS total_gastos,
    COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
    MAX(g.fecha) AS ultimo_gasto,
    -- Metadatos
    p.created_at,
    p.updated_at
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?
GROUP BY p.id
ORDER BY p.razon_social;

-- 8.2 Lista simple para selects/dropdowns
SELECT
    id,
    CONCAT(razon_social, ' (', rut, '-', dv, ')') AS nombre_completo,
    razon_social AS nombre,
    giro AS categoria
FROM proveedor
WHERE comunidad_id = ? AND activo = 1
ORDER BY razon_social;

-- =========================================
-- 9. CONSULTAS PARA REPORTES ESPECÍFICOS
-- =========================================

-- 9.1 Reporte de proveedores por período
SELECT
    p.razon_social AS proveedor,
    DATE_FORMAT(g.fecha, '%Y-%m') AS periodo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    GROUP_CONCAT(DISTINCT cat.nombre SEPARATOR ', ') AS categorias_usadas
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
WHERE p.comunidad_id = ?
  AND g.fecha BETWEEN ? AND ?
GROUP BY p.id, DATE_FORMAT(g.fecha, '%Y-%m')
ORDER BY p.razon_social, periodo;

-- 9.2 Análisis de eficiencia de proveedores
SELECT
    p.id,
    p.razon_social AS nombre,
    COUNT(g.id) AS total_gastos,
    SUM(g.monto) AS monto_total,
    AVG(g.monto) AS promedio_gasto,
    MIN(g.monto) AS gasto_minimo,
    MAX(g.monto) AS gasto_maximo,
    STDDEV(g.monto) AS desviacion_estandar,
    -- Eficiencia (menos variabilidad = más eficiente)
    CASE
        WHEN COUNT(g.id) >= 5 THEN ROUND(STDDEV(g.monto) / AVG(g.monto), 4)
        ELSE NULL
    END AS coeficiente_variacion
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ? AND p.activo = 1
GROUP BY p.id
HAVING COUNT(g.id) >= 3
ORDER BY coeficiente_variacion ASC, SUM(g.monto) DESC;</content>
<parameter name="filePath">c:\Users\patri\Documents\GitHub\proyecto_cuentas_claras\ccbackend\base\CONSULTAS_PROVEEDORES.sql