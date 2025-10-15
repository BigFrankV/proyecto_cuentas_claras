-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DE GASTOS
-- Sistema de Cuentas Claras (Basado en el esquema de 'gasto')
-- =========================================

-- =========================================
-- 1. LISTADO DE GASTOS CON FILTROS Y PAGINACIÓN
-- =========================================

-- 1.1 Listado básico de gastos con información completa
SELECT
    g.id,
    g.comunidad_id,
    c.razon_social AS comunidad_nombre,
    g.categoria_id,
    cat.nombre AS categoria_nombre,
    cat.tipo AS categoria_tipo,
    g.centro_costo_id,
    cc.nombre AS centro_costo_nombre,
    g.documento_compra_id,
    dc.tipo_doc AS documento_tipo,
    dc.folio AS documento_numero,
    dc.fecha_emision AS documento_fecha,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    g.extraordinario,
    -- Información del proveedor (a través de documento_compra)
    p.razon_social AS proveedor_nombre,
    p.rut AS proveedor_rut,
    g.estado AS estado, -- Se añade el estado de gasto
    -- Información de archivos adjuntos
    CASE WHEN COUNT(a.id) > 0 THEN 1 ELSE 0 END AS tiene_adjuntos,
    -- Metadatos
    g.created_at,
    g.updated_at
FROM gasto g
INNER JOIN comunidad c ON g.comunidad_id = c.id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
WHERE g.comunidad_id = ? /* :comunidad_id */
GROUP BY
    g.id, g.comunidad_id, c.razon_social, g.categoria_id, cat.nombre, cat.tipo, g.centro_costo_id, cc.nombre,
    g.documento_compra_id, dc.tipo_doc, dc.folio, dc.fecha_emision, g.fecha, g.monto, g.glosa, g.extraordinario,
    p.razon_social, p.rut, g.estado, g.created_at, g.updated_at
ORDER BY g.fecha DESC, g.created_at DESC;

-- 1.2 Listado con filtros avanzados
SELECT
    g.id,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    cat.nombre AS categoria,
    cc.nombre AS centro_costo,
    p.razon_social AS proveedor,
    dc.folio AS documento_numero,
    CASE WHEN COUNT(a.id) > 0 THEN 1 ELSE 0 END AS tiene_adjuntos,
    g.created_at
FROM gasto g
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND (cat.nombre LIKE CONCAT('%', ?2, '%') OR ?3 = '') -- Filtro categoría nombre
    AND (p.razon_social LIKE CONCAT('%', ?4, '%') OR ?5 = '') -- Filtro proveedor nombre
    AND (g.fecha BETWEEN ?6 AND ?7 OR (?8 = '' AND ?9 = '')) -- Filtro rango de fechas
    AND (g.monto BETWEEN ?10 AND ?11 OR (?12 = 0 AND ?13 = 0)) -- Filtro rango de montos
    AND (g.categoria_id = ?14 OR ?15 = 0) -- Filtro categoría id
    AND (g.centro_costo_id = ?16 OR ?17 = 0) -- Filtro centro costo id
    AND (g.extraordinario = ?18 OR ?19 = -1) -- Filtro extraordinario
GROUP BY
    g.id, g.fecha, g.monto, g.glosa, cat.nombre, cc.nombre, p.razon_social, dc.folio, g.created_at
ORDER BY g.fecha DESC, g.created_at DESC
LIMIT ?20 OFFSET ?21;

-- 1.3 Conteo total para paginación
SELECT COUNT(DISTINCT g.id) AS total
FROM gasto g
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.comunidad_id = ?1
    AND (cat.nombre LIKE CONCAT('%', ?2, '%') OR ?3 = '')
    AND (p.razon_social LIKE CONCAT('%', ?4, '%') OR ?5 = '')
    AND (g.fecha BETWEEN ?6 AND ?7 OR (?8 = '' AND ?9 = ''))
    AND (g.monto BETWEEN ?10 AND ?11 OR (?12 = 0 AND ?13 = 0))
    AND (g.categoria_id = ?14 OR ?15 = 0)
    AND (g.centro_costo_id = ?16 OR ?17 = 0)
    AND (g.extraordinario = ?18 OR ?19 = -1);

-- =========================================
-- 2. DETALLE DE GASTO ESPECÍFICO
-- =========================================

-- 2.1 Detalle completo de un gasto
SELECT
    g.id,
    g.comunidad_id,
    c.razon_social AS comunidad_nombre,
    g.categoria_id,
    cat.nombre AS categoria_nombre,
    cat.tipo AS categoria_tipo,
    g.centro_costo_id,
    cc.nombre AS centro_costo_nombre,
    cc.codigo AS centro_costo_codigo,
    g.documento_compra_id,
    dc.tipo_doc AS documento_tipo,
    dc.folio AS documento_numero,
    dc.fecha_emision AS documento_fecha,
    dc.neto,
    dc.iva,
    dc.exento,
    dc.total,
    dc.glosa AS documento_glosa,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    g.extraordinario,
    g.estado,
    -- Información del proveedor
    p.id AS proveedor_id,
    p.razon_social AS proveedor_nombre,
    p.rut AS proveedor_rut,
    p.dv AS proveedor_dv,
    p.giro AS proveedor_giro,
    p.email AS proveedor_email,
    p.telefono AS proveedor_telefono,
    p.direccion AS proveedor_direccion,
    -- Metadatos
    g.created_at,
    g.updated_at
FROM gasto g
INNER JOIN comunidad c ON g.comunidad_id = c.id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.id = ? /* :gasto_id */ AND g.comunidad_id = ? /* :comunidad_id */;

-- 2.2 Archivos adjuntos del gasto
SELECT
    a.id,
    a.original_name,
    a.filename,
    a.file_path,
    a.file_size,
    a.mimetype,
    a.category,
    a.description,
    a.uploaded_at,
    a.uploaded_by,
    -- Información del usuario que subió el archivo
    -- CORRECCIÓN: Se usa COALESCE para manejar el nombre completo, ya que persona_id es nullable
    COALESCE(CONCAT(per.nombres, ' ', per.apellidos), u.username, 'Sistema') AS uploaded_by_name
FROM archivos a
LEFT JOIN usuario u ON a.uploaded_by = u.id
LEFT JOIN persona per ON u.persona_id = per.id
WHERE a.entity_type = 'gasto'
    AND a.entity_id = ? /* :gasto_id */
    AND a.is_active = 1
ORDER BY a.uploaded_at DESC;

-- =========================================
-- 3. OPERACIONES CRUD
-- =========================================

-- 3.1 Crear nuevo gasto
INSERT INTO gasto (
    comunidad_id,
    categoria_id,
    centro_costo_id,
    documento_compra_id,
    fecha,
    monto,
    glosa,
    extraordinario,
    numero,
    creado_por
) VALUES (
    ?1, -- comunidad_id
    ?2, -- categoria_id
    ?3, -- centro_costo_id
    ?4, -- documento_compra_id
    ?5, -- fecha
    ?6, -- monto
    ?7, -- glosa
    ?8, -- extraordinario
    ?9, -- numero (opcional, pero existe en esquema)
    ?10 -- creado_por (opcional, pero existe en esquema)
);

-- 3.2 Actualizar gasto existente
UPDATE gasto SET
    categoria_id = ?1,
    centro_costo_id = ?2,
    documento_compra_id = ?3,
    fecha = ?4,
    monto = ?5,
    glosa = ?6,
    extraordinario = ?7,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?8 AND comunidad_id = ?9;

-- 3.3 Eliminar gasto
-- Sugerir índice: gasto(comunidad_id, id)
DELETE FROM gasto WHERE id = ? AND comunidad_id = ?;

-- =========================================
-- 4. ESTADÍSTICAS Y REPORTES
-- =========================================

-- 4.1 Estadísticas generales de gastos
SELECT
    COUNT(*) AS total_gastos,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_monto,
    MIN(monto) AS monto_minimo,
    MAX(monto) AS monto_maximo,
    MIN(fecha) AS fecha_primer_gasto,
    MAX(fecha) AS fecha_ultimo_gasto
FROM gasto
WHERE comunidad_id = ?1 /* :comunidad_id */
    AND (fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''));

-- 4.2 Gastos por categoría
SELECT
    cat.nombre AS categoria,
    cat.tipo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto,
    MIN(g.monto) AS monto_minimo,
    MAX(g.monto) AS monto_maximo
FROM gasto g
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND (g.fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY cat.id, cat.nombre, cat.tipo
ORDER BY total_monto DESC;

-- 4.3 Gastos por centro de costo
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto
FROM gasto g
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND (g.fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY cc.id, cc.nombre, cc.codigo
ORDER BY total_monto DESC;

-- 4.4 Gastos por proveedor
SELECT
    p.razon_social AS proveedor,
    p.rut,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    AVG(g.monto) AS promedio_monto,
    MAX(g.fecha) AS ultimo_gasto
FROM gasto g
INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
INNER JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND (g.fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY p.id, p.razon_social, p.rut
ORDER BY total_monto DESC;

-- 4.5 Gastos mensuales (últimos 12 meses)
SELECT
    DATE_FORMAT(fecha, '%Y-%m') AS mes,
    COUNT(*) AS cantidad_gastos,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_monto
FROM gasto
WHERE comunidad_id = ? /* :comunidad_id */
    AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fecha, '%Y-%m')
ORDER BY mes DESC;

-- 4.6 Gastos extraordinarios vs operativos
SELECT
    CASE
        WHEN extraordinario = 1 THEN 'Extraordinarios'
        ELSE 'Operativos'
    END AS tipo_gasto,
    COUNT(*) AS cantidad,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_monto,
    -- CORRECCIÓN: Uso de NULLIF para evitar división por cero
    (SUM(monto) / NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?1), 0)) * 100 AS porcentaje_total
FROM gasto
WHERE comunidad_id = ?1 /* :comunidad_id */
    AND (fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY extraordinario
ORDER BY extraordinario DESC;

-- =========================================
-- 5. VALIDACIONES Y VERIFICACIONES
-- =========================================

-- 5.1 Verificar si existe un gasto
SELECT COUNT(*) > 0 AS existe
FROM gasto
WHERE id = ? AND comunidad_id = ?;

-- 5.2 Verificar si existe categoría de gasto (y está activa)
SELECT COUNT(*) > 0 AS existe
FROM categoria_gasto
WHERE id = ? AND comunidad_id = ? AND activa = 1;

-- 5.3 Verificar si existe centro de costo
SELECT COUNT(*) > 0 AS existe
FROM centro_costo
WHERE id = ? AND comunidad_id = ?;

-- 5.4 Verificar si existe documento de compra
SELECT COUNT(*) > 0 AS existe
FROM documento_compra
WHERE id = ? AND comunidad_id = ?;

-- 5.5 Verificar si existe proveedor (y está activo)
SELECT COUNT(*) > 0 AS existe
FROM proveedor
WHERE id = ? AND comunidad_id = ? AND activo = 1;

-- 5.6 Validar que no haya gastos duplicados (mismo documento en misma fecha)
SELECT COUNT(*) > 0 AS existe_duplicado
FROM gasto g
INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND dc.folio = ?2 /* :folio */
    AND g.fecha = ?3 /* :fecha */
    AND g.id != ?4; -- Excluir el gasto actual en caso de actualización

-- =========================================
-- 6. CONSULTAS PARA LISTAS DESPLEGABLES
-- =========================================

-- 6.1 Lista de categorías de gasto activas
SELECT
    id,
    nombre,
    tipo,
    cta_contable
FROM categoria_gasto
WHERE comunidad_id = ? AND activa = 1
ORDER BY nombre;

-- 6.2 Lista de centros de costo
SELECT
    id,
    nombre,
    codigo
FROM centro_costo
WHERE comunidad_id = ?
ORDER BY nombre;

-- 6.3 Lista de proveedores activos
SELECT
    id,
    razon_social,
    rut,
    CONCAT(rut, '-', dv) AS rut_completo
FROM proveedor
WHERE comunidad_id = ? AND activo = 1
ORDER BY razon_social;

-- 6.4 Lista de documentos de compra disponibles (no asociados a gastos)
SELECT
    dc.id,
    dc.tipo_doc,
    dc.folio,
    dc.fecha_emision,
    dc.total,
    p.razon_social AS proveedor
FROM documento_compra dc
INNER JOIN proveedor p ON dc.proveedor_id = p.id
WHERE dc.comunidad_id = ?1 /* :comunidad_id */
    AND dc.id NOT IN (
        SELECT documento_compra_id
        FROM gasto
        WHERE documento_compra_id IS NOT NULL
            AND comunidad_id = ?1
    )
ORDER BY dc.fecha_emision DESC;

-- =========================================
-- 7. REPORTES AVANZADOS
-- =========================================

-- 7.1 Reporte de gastos por período con comparativo
SELECT
    YEAR(fecha) AS anio,
    MONTH(fecha) AS mes,
    COUNT(*) AS cantidad_gastos,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_monto,
    -- Comparativo con mes anterior
    LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)) AS monto_mes_anterior,
    -- CORRECCIÓN: Uso de NULLIF para evitar división por cero
    CASE
        WHEN LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)) IS NOT NULL
        THEN ((SUM(monto) - LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
              NULLIF(LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0)) * 100
        ELSE NULL
    END AS variacion_porcentual
FROM gasto
WHERE comunidad_id = ?1 /* :comunidad_id */
    AND fecha BETWEEN ?2 AND ?3
GROUP BY YEAR(fecha), MONTH(fecha)
ORDER BY anio DESC, mes DESC;

-- 7.2 Top proveedores por monto
SELECT
    p.razon_social AS proveedor,
    p.rut,
    COUNT(g.id) AS cantidad_compras,
    SUM(g.monto) AS total_comprado,
    AVG(g.monto) AS promedio_compra,
    MIN(g.fecha) AS primera_compra,
    MAX(g.fecha) AS ultima_compra,
    DATEDIFF(MAX(g.fecha), MIN(g.fecha)) AS dias_relacion
FROM gasto g
INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
INNER JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND (g.fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY p.id, p.razon_social, p.rut
HAVING COUNT(g.id) >= ?6 /* :min_compras */
ORDER BY total_comprado DESC
LIMIT ?7; /* :limit */

-- 7.3 Análisis de gastos por día de la semana
SELECT
    DAYOFWEEK(fecha) AS dia_semana_num,
    CASE DAYOFWEEK(fecha)
        WHEN 1 THEN 'Domingo'
        WHEN 2 THEN 'Lunes'
        WHEN 3 THEN 'Martes'
        WHEN 4 THEN 'Miércoles'
        WHEN 5 THEN 'Jueves'
        WHEN 6 THEN 'Viernes'
        WHEN 7 THEN 'Sábado'
    END AS dia_semana,
    COUNT(*) AS cantidad_gastos,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_monto
FROM gasto
WHERE comunidad_id = ?1 /* :comunidad_id */
    AND (fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY DAYOFWEEK(fecha)
ORDER BY dia_semana_num;

-- =========================================
-- 8. CONSULTAS PARA EXPORTACIÓN
-- =========================================

-- 8.1 Exportación completa de gastos para Excel/CSV
SELECT
    g.id AS 'ID Gasto',
    c.razon_social AS 'Comunidad',
    cat.nombre AS 'Categoría',
    cat.tipo AS 'Tipo Categoría',
    cc.nombre AS 'Centro Costo',
    p.razon_social AS 'Proveedor',
    p.rut AS 'RUT Proveedor',
    dc.tipo_doc AS 'Tipo Documento',
    dc.folio AS 'Número Documento',
    DATE_FORMAT(dc.fecha_emision, '%d/%m/%Y') AS 'Fecha Documento',
    DATE_FORMAT(g.fecha, '%d/%m/%Y') AS 'Fecha Gasto',
    g.monto AS 'Monto',
    g.glosa AS 'Descripción',
    CASE WHEN g.extraordinario = 1 THEN 'Sí' ELSE 'No' END AS 'Extraordinario',
    CASE WHEN COUNT(a.id) > 0 THEN 'Sí' ELSE 'No' END AS 'Tiene Adjuntos',
    DATE_FORMAT(g.created_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(g.updated_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Actualización'
FROM gasto g
INNER JOIN comunidad c ON g.comunidad_id = c.id
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND (g.fecha BETWEEN ?2 AND ?3 OR (?4 = '' AND ?5 = ''))
GROUP BY
    g.id, c.razon_social, cat.nombre, cat.tipo, cc.nombre, p.razon_social, p.rut, dc.tipo_doc, dc.folio,
    dc.fecha_emision, g.fecha, g.monto, g.glosa, g.extraordinario, g.created_at, g.updated_at
ORDER BY g.fecha DESC, g.id DESC;

-- =========================================
-- 9. CONSULTAS PARA DASHBOARD
-- =========================================

-- 9.1 Resumen mensual para dashboard
SELECT
    DATE_FORMAT(fecha, '%Y-%m') AS periodo,
    COUNT(*) AS total_gastos,
    SUM(monto) AS total_monto,
    AVG(monto) AS promedio_gasto,
    SUM(CASE WHEN extraordinario = 1 THEN monto ELSE 0 END) AS gastos_extraordinarios,
    SUM(CASE WHEN extraordinario = 0 THEN monto ELSE 0 END) AS gastos_operativos
FROM gasto
WHERE comunidad_id = ?1 /* :comunidad_id */
    AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL ?2 MONTH)
GROUP BY DATE_FORMAT(fecha, '%Y-%m')
ORDER BY periodo DESC;

-- 9.2 Top categorías del mes actual
SELECT
    cat.nombre AS categoria,
    COUNT(g.id) AS cantidad,
    SUM(g.monto) AS total
FROM gasto g
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
WHERE g.comunidad_id = ? /* :comunidad_id */
    AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
    AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
GROUP BY cat.id, cat.nombre
ORDER BY total DESC
LIMIT 5;

-- 9.3 Alertas de gastos altos
SELECT
    g.id,
    g.fecha,
    g.monto,
    g.glosa AS descripcion,
    cat.nombre AS categoria,
    p.razon_social AS proveedor
FROM gasto g
INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    AND g.monto > ?2 /* :monto_umbral */
ORDER BY g.monto DESC;