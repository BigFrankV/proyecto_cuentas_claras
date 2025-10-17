-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DE PROVEEDORES
-- Sistema de Cuentas Claras (Consolidado y Corregido)
-- =========================================
-- NOTA DE CORRECCIÓN: c.nombre fue reemplazado por c.razon_social. Se ajustaron JOINs a 'documento_compra'
-- y la lógica de las estadísticas para usar 'gasto' correctamente.

-- =========================================
-- 1. LISTADO DE PROVEEDORES CON ESTADÍSTICAS
-- =========================================

-- 1.1 Listado básico de proveedores con estadísticas de uso
SELECT
    p.id,
    p.comunidad_id,
    c.razon_social AS comunidad_nombre, -- CORRECCIÓN: Usar razon_social
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
WHERE p.comunidad_id = ? /* :comunidad_id */
GROUP BY p.id, c.razon_social -- CORRECCIÓN: Agrupar por campos no agregados
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
WHERE p.comunidad_id = ? /* :comunidad_id */
  AND (p.activo = ? OR ? IS NULL)
  AND (p.razon_social LIKE CONCAT('%', ?, '%') OR ? IS NULL)
  AND (p.giro LIKE CONCAT('%', ?, '%') OR ? IS NULL)
  AND (p.rut LIKE CONCAT('%', ?, '%') OR ? IS NULL)
GROUP BY p.id, c.razon_social
ORDER BY
    CASE WHEN ? = 'activo' THEN p.activo END DESC,
    CASE WHEN ? = 'nombre' THEN p.razon_social END ASC,
    CASE WHEN ? = 'total_gastado' THEN COALESCE(SUM(g.monto), 0) END DESC,
    CASE WHEN ? = 'ultimo_gasto' THEN MAX(g.fecha) END DESC,
    p.razon_social ASC
LIMIT ? OFFSET ?;

-- 1.3 Estadísticas generales de proveedores
SELECT
    COUNT(p.id) AS total_proveedores,
    SUM(CASE WHEN p.activo = 1 THEN 1 ELSE 0 END) AS proveedores_activos,
    SUM(CASE WHEN p.activo = 0 THEN 1 ELSE 0 END) AS proveedores_inactivos,
    AVG(stats.total_gastos) AS promedio_gastos_por_proveedor,
    AVG(stats.monto_total) AS promedio_monto_por_proveedor,
    MAX(stats.monto_total) AS maximo_monto_gastado,
    MIN(stats.monto_total) AS minimo_monto_gastado
FROM proveedor p
LEFT JOIN (
    SELECT
        pr.id,
        COUNT(DISTINCT g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total
    FROM proveedor pr
    LEFT JOIN documento_compra dc ON pr.id = dc.proveedor_id
    LEFT JOIN gasto g ON dc.id = g.documento_compra_id
    WHERE pr.comunidad_id = ? /* :comunidad_id */
    GROUP BY pr.id
) AS stats ON p.id = stats.id;

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
WHERE p.id = ? /* :proveedor_id */ AND p.comunidad_id = ? /* :comunidad_id */
GROUP BY p.id, c.razon_social;

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
WHERE dc.proveedor_id = ? /* :proveedor_id */
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
WHERE dc.proveedor_id = ? /* :proveedor_id */
GROUP BY dc.id, dc.tipo_doc, dc.folio, dc.fecha_emision, dc.neto, dc.iva, dc.exento, dc.total, dc.glosa, dc.created_at, dc.updated_at
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
-- CORRECCIÓN: La sintaxis DELETE es MySQL/SQL Server específica
DELETE FROM proveedor
WHERE id = ? /* :proveedor_id */ AND comunidad_id = ? /* :comunidad_id */
  AND NOT EXISTS (SELECT 1 FROM documento_compra WHERE proveedor_id = ? /* :proveedor_id */);

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
WHERE p.comunidad_id = ? /* :comunidad_id */ AND p.activo = 1
GROUP BY p.id, p.razon_social, p.giro
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
WHERE p.comunidad_id = ? /* :comunidad_id */ AND p.activo = 1
GROUP BY p.id, p.razon_social, p.giro, p.email, p.telefono
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURDATE(), MAX(g.fecha)) > ? /* :dias_sin_gasto_umbral */
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
WHERE p.comunidad_id = ?1 /* :comunidad_id */
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?2 MONTH)
GROUP BY p.id, p.razon_social, YEAR(g.fecha), MONTH(g.fecha)
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
WHERE cat.comunidad_id = ? /* :comunidad_id */
GROUP BY cat.id, cat.nombre, cat.tipo
ORDER BY SUM(g.monto) DESC;

-- 4.5 Comparativa de proveedores por período
SELECT
    p.id,
    p.razon_social AS nombre,
    -- Parámetro ?1 es el intervalo en meses
    COUNT(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.id END) AS gastos_periodo_actual,
    COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.monto END), 0) AS monto_periodo_actual,
    -- Período anterior
    COUNT(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.id END) AS gastos_periodo_anterior,
    COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.monto END), 0) AS monto_periodo_anterior,
    -- Variación porcentual
    CASE
        WHEN COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.monto END), 0) > 0
        THEN ROUND(
            ((COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.monto END), 0) -
              COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.monto END), 0)) /
             NULLIF(COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?1*2 MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ?1 MONTH) THEN g.monto END), 0), 0)) * 100, 2)
        ELSE NULL
    END AS variacion_porcentual
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?2 /* :comunidad_id */ AND p.activo = 1
GROUP BY p.id
HAVING (gastos_periodo_actual > 0 OR gastos_periodo_anterior > 0)
ORDER BY monto_periodo_actual DESC;

-- =========================================
-- 5. VALIDACIONES
-- =========================================

-- 5.1 Validar que el RUT no esté duplicado en la comunidad
SELECT COUNT(*) AS existe_rut
FROM proveedor
WHERE comunidad_id = ?1 AND rut = ?2 AND dv = ?3 AND id != ?4; -- :comunidad_id, :rut, :dv, :id

-- 5.2 Validar que el proveedor no tenga documentos asociados antes de eliminar
SELECT
    COUNT(dc.id) AS documentos_asociados,
    COUNT(g.id) AS gastos_asociados
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.id = ?; /* :proveedor_id */

-- 5.3 Validar formato de RUT chileno (Uso de REGEXP asumiendo MySQL/MariaDB)
SELECT
    CASE
        WHEN ?1 REGEXP '^[0-9]{7,8}$' AND ?2 REGEXP '^[0-9Kk]$' THEN 1
        ELSE 0
    END AS rut_valido; -- :rut, :dv

-- 5.4 Verificar si el proveedor está siendo usado en documentos recientes
SELECT
    COUNT(*) AS documentos_recientes,
    MAX(dc.fecha_emision) AS ultima_fecha_emision
FROM documento_compra dc
WHERE dc.proveedor_id = ?1 /* :proveedor_id */
  AND dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL ?2 DAY); /* :dias_antiguedad */

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
    COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN g.monto END), 0) AS total_gastado_mes_actual,
    COALESCE(AVG(g.monto), 0) AS promedio_gasto,

    -- Proveedores más activos (último mes)
    COUNT(DISTINCT CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN p.id END) AS proveedores_activos_mes,

    -- Alertas (SIMULADAS)
    COUNT(DISTINCT CASE WHEN DATEDIFF(CURDATE(), MAX(g.fecha)) > 90 THEN p.id END) AS proveedores_sin_gasto_90_dias

FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?; /* :comunidad_id */

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
WHERE p.comunidad_id = ? /* :comunidad_id */
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND p.activo = 1
GROUP BY p.id, p.razon_social
ORDER BY SUM(g.monto) DESC
LIMIT 5;

-- 6.3 Distribución de gastos por proveedor (para gráficos)
SELECT
    p.razon_social AS nombre,
    SUM(g.monto) AS total_monto,
    -- CORRECCIÓN: Uso de NULLIF para evitar división por cero en la subconsulta
    ROUND((SUM(g.monto) / NULLIF((SELECT SUM(g2.monto)
                           FROM gasto g2
                           INNER JOIN documento_compra dc2 ON g2.documento_compra_id = dc2.id
                           WHERE dc2.proveedor_id IN (SELECT id FROM proveedor WHERE comunidad_id = ?1)
                           AND g2.fecha >= DATE_SUB(CURDATE(), INTERVAL ?2 MONTH)), 0)) * 100, 2) AS porcentaje_total
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?1 /* :comunidad_id */
  AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ?2 MONTH) /* :n_meses */
  AND p.activo = 1
GROUP BY p.id, p.razon_social
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
WHERE p.comunidad_id = ?1 /* :comunidad_id */ AND p.activo = 1
GROUP BY p.id, p.razon_social, p.email, p.telefono
HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURDATE(), MAX(g.fecha)) > ?2 /* :dias_antiguedad_umbral */
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
GROUP BY p.id, p.razon_social
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
GROUP BY p1.id, p1.razon_social, p2.id, p2.razon_social, CONCAT(p1.rut, '-', p1.dv);

-- 7.3 Auditoría de cambios en proveedores
SELECT
    a.id,
    a.usuario_id,
    COALESCE(u.username, 'Sistema') AS usuario_nombre, -- CORRECCIÓN: Usar u.username
    a.accion,
    a.tabla,
    a.registro_id,
    a.valores_anteriores,
    a.valores_nuevos,
    a.created_at
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.tabla = 'proveedor'
  AND a.registro_id = ? /* :registro_id */
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
WHERE p.comunidad_id = ? /* :comunidad_id */
GROUP BY p.id, CONCAT(p.rut, '-', p.dv), p.razon_social, p.giro, p.email, p.telefono, p.direccion, p.activo, p.created_at, p.updated_at
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
    GROUP_CONCAT(DISTINCT cat.nombre SEPARATOR ', ') AS categorias_usadas -- NOTA: GROUP_CONCAT es específico de MySQL/MariaDB
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
WHERE p.comunidad_id = ?1 /* :comunidad_id */
  AND g.fecha BETWEEN ?2 AND ?3
GROUP BY p.id, p.razon_social, DATE_FORMAT(g.fecha, '%Y-%m')
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
        WHEN COUNT(g.id) >= 5 THEN ROUND(NULLIF(STDDEV(g.monto), 0) / NULLIF(AVG(g.monto), 0), 4)
        ELSE NULL
    END AS coeficiente_variacion
FROM proveedor p
INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
INNER JOIN gasto g ON dc.id = g.documento_compra_id
WHERE p.comunidad_id = ?1 /* :comunidad_id */ AND p.activo = 1
GROUP BY p.id, p.razon_social
HAVING COUNT(g.id) >= 3
ORDER BY coeficiente_variacion ASC, SUM(g.monto) DESC;