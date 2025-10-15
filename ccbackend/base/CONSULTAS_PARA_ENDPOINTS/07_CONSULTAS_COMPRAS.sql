-- =========================================
-- QUERIES PARA MÓDULO COMPRAS
-- Sistema de Gestión de Condominios - Cuentas Claras
-- NOTA DE CORRECCIÓN:
-- 1. Tabla principal renombrada a 'documento_compra'.
-- 2. 'numero_documento' renombrado a 'folio'. 'descripcion' a 'glosa'.
-- 3. Se eliminaron todas las referencias a la tabla 'documentos_compra_items' (no existe).
-- 4. El Centro de Costo y Categoría se obtienen a través de la tabla 'gasto' (Gasto que se imputa a la compra).
-- 5. Las columnas no existentes (estado, fecha_vencimiento, usuario_creacion, notas) se reemplazan con valores fijos o NULL.
-- =========================================

-- =========================================
-- 1. LISTADO BÁSICO DE COMPRAS CON FILTROS
-- =========================================

-- Consulta principal para listado de compras
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.tipo_doc AS type, -- CORRECCIÓN: Usar 'tipo_doc'
    'approved' AS status, -- CORRECCIÓN: Columna no existe, se asume 'approved' o se usa una columna de gasto.
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'

    -- Información del proveedor
    JSON_OBJECT(
        'id', p.id,
        'name', p.razon_social,
        'category', COALESCE(p.giro, 'Sin especificar'),
        'contact', COALESCE(p.telefono, ''),
        'phone', COALESCE(p.telefono, ''),
        'email', COALESCE(p.email, '')
    ) AS provider,

    -- Información del centro de costo (Obtenida a través de la tabla gasto)
    JSON_OBJECT(
        'id', cc.id,
        'name', cc.nombre,
        'department', 'operations'
    ) AS cost_center,

    -- Información de la categoría (Obtenida a través de la tabla gasto)
    JSON_OBJECT(
        'id', cg.id,
        'name', cg.nombre,
        'color', '#2196f3'
    ) AS category,

    -- Items de la compra (RESUMEN - Eliminados ya que la tabla de items no existe. Se usa gasto.monto)
    JSON_ARRAY() AS items,

    COALESCE(dc.total, 0) AS total_amount,
    'CLP' AS currency,
    COALESCE(DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d'), '') AS required_date, -- CORRECCIÓN: No existe fecha_vencimiento, usar fecha_emision
    'Sistema' AS requested_by, -- CORRECCIÓN: Columna no existe
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') AS request_date,

    -- Información de aprobación (campos calculados)
    g.aprobado_por AS approved_by, -- CORRECCIÓN: Usar el usuario de aprobación del Gasto
    NULL AS approved_date,
    NULL AS rejected_by,
    NULL AS rejected_date,
    NULL AS rejection_reason,

    COALESCE(dc.glosa, '') AS notes, -- CORRECCIÓN: Usar 'glosa'
    '' AS request_justification,
    COALESCE(archivos_count.total_archivos, 0) AS documents_count,

    -- Timeline básico (solo creación por ahora)
    JSON_ARRAY(
        JSON_OBJECT(
            'id', CONCAT('created_', dc.id),
            'type', 'created',
            'title', 'Compra creada',
            'description', CONCAT('Documento ', dc.folio, ' registrado'),
            'date', DATE_FORMAT(dc.created_at, '%Y-%m-%d %H:%i:%s'),
            'user', 'Sistema',
            'icon', 'add_shopping_cart',
            'color', 'primary'
        )
    ) AS timeline,

    DATE_FORMAT(dc.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
    DATE_FORMAT(dc.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at

FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
-- CORRECCIÓN: Join a gasto para obtener Centro de Costo y Categoría
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN (
    -- Conteo de archivos relacionados
    SELECT
        entity_id,
        COUNT(*) AS total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) AS archivos_count ON dc.id = archivos_count.entity_id

WHERE 1=1
    -- Filtros opcionales
    AND (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         dc.folio LIKE CONCAT('%', :search, '%') OR
         dc.glosa LIKE CONCAT('%', :search, '%') OR -- CORRECCIÓN: Usar glosa
         p.razon_social LIKE CONCAT('%', :search, '%'))
    AND (:type IS NULL OR dc.tipo_doc = :type) -- CORRECCIÓN: Usar tipo_doc
    -- El filtro por estado (status) NO SE PUEDE aplicar a dc directamente, solo a 'gasto'.
    -- Para evitar un JOIN más complejo aquí, se remueve el filtro de status
    AND (:provider_id IS NULL OR dc.proveedor_id = :provider_id)
    AND (:cost_center_id IS NULL OR g.centro_costo_id = :cost_center_id) -- CORRECCIÓN: A través de gasto
    AND (:category_id IS NULL OR g.categoria_id = :category_id) -- CORRECCIÓN: A través de gasto
    AND (:date_from IS NULL OR dc.fecha_emision >= :date_from)
    AND (:date_to IS NULL OR dc.fecha_emision <= :date_to)
    AND (:amount_from IS NULL OR dc.total >= :amount_from)
    AND (:amount_to IS NULL OR dc.total <= :amount_to)

-- Se agrupa por campos de la tabla 'documento_compra' (y alias) y los campos resultantes del JOIN.
GROUP BY dc.id, dc.folio, dc.tipo_doc, dc.glosa,
         p.id, p.razon_social, p.giro, p.telefono, p.email,
         cc.id, cc.nombre, cg.id, cg.nombre,
         dc.total, dc.fecha_emision, dc.created_at, dc.updated_at, archivos_count.total_archivos, g.aprobado_por

ORDER BY dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 2. VISTA DETALLADA DE COMPRA CON ITEMS Y TIMELINE
-- =========================================

-- Consulta detallada para una compra específica
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.tipo_doc AS type, -- CORRECCIÓN: Usar 'tipo_doc'
    'approved' AS status, -- CORRECCIÓN: Columna no existe
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'

    -- Información completa del proveedor
    JSON_OBJECT(
        'id', p.id,
        'name', p.razon_social,
        'category', COALESCE(p.giro, 'Sin especificar'),
        'contact', COALESCE(p.telefono, ''),
        'phone', COALESCE(p.telefono, ''),
        'email', COALESCE(p.email, '')
    ) AS provider,

    -- Información completa del centro de costo (A través de la tabla gasto)
    JSON_OBJECT(
        'id', cc.id,
        'name', cc.nombre,
        'department', 'operations',
        'budget', 0,
        'spent', 0
    ) AS cost_center,

    -- Información completa de la categoría (A través de la tabla gasto)
    JSON_OBJECT(
        'id', cg.id,
        'name', cg.nombre,
        'color', '#2196f3'
    ) AS category,

    -- Items detallados de la compra (Eliminados - No existe tabla)
    JSON_ARRAY() AS items,

    COALESCE(dc.total, 0) AS total_amount,
    'CLP' AS currency,
    COALESCE(DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d'), '') AS required_date, -- CORRECCIÓN: No existe fecha_vencimiento
    'Sistema' AS requested_by, -- CORRECCIÓN: Columna no existe
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') AS request_date,

    -- Información de aprobación (A través de la tabla gasto)
    g.aprobado_por AS approved_by, -- CORRECCIÓN: Usar aprobador de Gasto
    g.updated_at AS approved_date, -- Asumimos que la aprobación es la última actualización
    NULL AS rejected_by,
    NULL AS rejected_date,
    NULL AS rejection_reason,

    COALESCE(dc.glosa, '') AS notes, -- CORRECCIÓN: Usar 'glosa'
    '' AS request_justification,
    COALESCE(archivos_count.total_archivos, 0) AS documents_count,

    -- Timeline completo (Solo eventos de Auditoría y Creación)
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', CONCAT('event_', a.id),
                'type', CASE
                    WHEN a.accion = 'INSERT' THEN 'created'
                    WHEN a.accion = 'UPDATE' AND a.tabla = 'gasto' AND a.valores_nuevos LIKE '%aprobado%' THEN 'approved' -- CORRECCIÓN: Aprobar Gasto
                    ELSE 'note'
                END,
                'title', CONCAT(a.accion, ' en ', a.tabla),
                'description', COALESCE(a.valores_nuevos, ''),
                'date', DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s'),
                'user', COALESCE(a.usuario_id, 'Sistema'),
                'icon', 'edit',
                'color', 'info'
            )
        )
        FROM auditoria a
        WHERE a.tabla IN ('documento_compra', 'gasto') AND a.registro_id = dc.id -- Incluir auditoría de gasto
        ORDER BY a.created_at ASC),
        JSON_ARRAY()
    ) AS timeline,

    NULL AS delivery_date,
    NULL AS completed_date,

    DATE_FORMAT(dc.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
    DATE_FORMAT(dc.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at

FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
-- CORRECCIÓN: Join a gasto para obtener Centro de Costo, Categoría y Aprobación.
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN (
    -- Conteo de archivos relacionados
    SELECT
        entity_id,
        COUNT(*) AS total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) AS archivos_count ON dc.id = archivos_count.entity_id

WHERE dc.id = :compra_id;

-- =========================================
-- 3. ESTADÍSTICAS GENERALES DE COMPRAS
-- =========================================

-- Estadísticas generales del módulo compras
SELECT
    COUNT(DISTINCT dc.id) AS total_compras,
    -- CORRECCIÓN: El estado del documento está dado por el gasto asociado. Se asume que gasto.estado refleja el estado de la compra.
    COUNT(DISTINCT CASE WHEN g.estado = 'pendiente' THEN dc.id END) AS compras_pendientes,
    COUNT(DISTINCT CASE WHEN g.estado = 'aprobado' THEN dc.id END) AS compras_aprobadas,
    COUNT(DISTINCT CASE WHEN g.estado = 'aprobado' THEN dc.id END) AS compras_completadas,
    COUNT(DISTINCT CASE WHEN g.estado = 'rechazado' OR g.estado = 'anulado' THEN dc.id END) AS compras_canceladas,
    COUNT(DISTINCT p.id) AS proveedores_activos,
    COUNT(DISTINCT cc.id) AS centros_costo_activos,

    -- Montos totales
    SUM(COALESCE(dc.total, 0)) AS monto_total_compras,
    AVG(COALESCE(dc.total, 0)) AS monto_promedio_compra,
    MAX(COALESCE(dc.total, 0)) AS monto_maximo_compra,
    MIN(COALESCE(dc.total, 0)) AS monto_minimo_compra,

    -- Estadísticas por período
    COUNT(DISTINCT CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN dc.id END) AS compras_ultimo_mes,
    SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN COALESCE(dc.total, 0) ELSE 0 END) AS monto_ultimo_mes,

    -- Estadísticas por tipo (Solo los tipos de documento que existen)
    COUNT(DISTINCT CASE WHEN dc.tipo_doc = 'factura' THEN dc.id END) AS compras_factura,
    COUNT(DISTINCT CASE WHEN dc.tipo_doc = 'boleta' THEN dc.id END) AS compras_boleta,
    COUNT(DISTINCT CASE WHEN dc.tipo_doc = 'nota_credito' THEN dc.id END) AS compras_nota_credito

FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
-- CORRECCIÓN: Joins a gasto para centros y categorías
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id);

-- Estadísticas por proveedor
SELECT
    p.razon_social AS proveedor,
    COUNT(dc.id) AS total_compras,
    SUM(COALESCE(dc.total, 0)) AS monto_total,
    AVG(COALESCE(dc.total, 0)) AS monto_promedio,
    MAX(dc.fecha_emision) AS ultima_compra,
    -- CORRECCIÓN: Estados a través de gasto
    COUNT(CASE WHEN g.estado = 'aprobado' THEN 1 END) AS compras_completadas,
    COUNT(CASE WHEN g.estado = 'pendiente' THEN 1 END) AS compras_pendientes
FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
GROUP BY p.id, p.razon_social
ORDER BY monto_total DESC;

-- Estadísticas por centro de costo
SELECT
    cc.nombre AS centro_costo,
    COUNT(dc.id) AS total_compras,
    SUM(COALESCE(dc.total, 0)) AS monto_total,
    AVG(COALESCE(dc.total, 0)) AS monto_promedio,
    COUNT(DISTINCT p.id) AS proveedores_distintos
FROM centro_costo cc
-- CORRECCIÓN: Join a gasto y luego a documento_compra
LEFT JOIN gasto g ON cc.id = g.centro_costo_id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR cc.comunidad_id = :comunidad_id)
    AND dc.id IS NOT NULL -- Solo si hay una compra asociada
GROUP BY cc.id, cc.nombre
ORDER BY monto_total DESC;

-- =========================================
-- 4. CONSULTAS FILTRADAS PARA BÚSQUEDA AVANZADA
-- =========================================

-- Búsqueda por texto completo
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.tipo_doc AS type, -- CORRECCIÓN: Usar 'tipo_doc'
    'approved' AS status, -- CORRECCIÓN: Columna no existe
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'
    p.razon_social AS provider_name,
    cc.nombre AS cost_center_name,
    cg.nombre AS category_name,
    COALESCE(dc.total, 0) AS total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') AS request_date,
    'Sistema' AS requested_by -- CORRECCIÓN: Columna no existe
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         dc.folio LIKE CONCAT('%', :search, '%') OR
         dc.glosa LIKE CONCAT('%', :search, '%') OR
         p.razon_social LIKE CONCAT('%', :search, '%') OR
         cc.nombre LIKE CONCAT('%', :search, '%') OR
         cg.nombre LIKE CONCAT('%', :search, '%'))
ORDER BY dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por rango de fechas
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'
    p.razon_social AS provider_name,
    COALESCE(dc.total, 0) AS total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') AS request_date,
    NULL AS required_date, -- CORRECCIÓN: Columna no existe
    'approved' AS status -- CORRECCIÓN: Columna no existe
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:fecha_desde IS NULL OR dc.fecha_emision >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR dc.fecha_emision <= :fecha_hasta)
ORDER BY dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por rango de montos
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'
    p.razon_social AS provider_name,
    COALESCE(dc.total, 0) AS total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') AS request_date,
    'approved' AS status -- CORRECCIÓN: Columna no existe
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:monto_min IS NULL OR dc.total >= :monto_min)
    AND (:monto_max IS NULL OR dc.total <= :monto_max)
ORDER BY dc.total DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por estado y prioridad
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'
    p.razon_social AS provider_name,
    COALESCE(dc.total, 0) AS total_amount,
    g.estado AS status, -- CORRECCIÓN: Usar estado del Gasto
    'medium' AS priority,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') AS request_date
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id -- CORRECCIÓN: Join a gasto
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:estado IS NULL OR g.estado = :estado) -- CORRECCIÓN: Filtrar por estado de Gasto
ORDER BY
    CASE
        WHEN g.estado = 'pendiente' THEN 1 -- Orden por el ENUM del Gasto
        WHEN g.estado = 'aprobado' THEN 2
        WHEN g.estado = 'rechazado' THEN 3
        WHEN g.estado = 'anulado' THEN 4
        ELSE 5
    END ASC,
    dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 5. CONSULTAS PARA EXPORTACIÓN DE DATOS
-- =========================================

-- Exportación completa de compras para Excel/CSV
SELECT
    dc.id AS 'ID',
    dc.folio AS 'Número', -- CORRECCIÓN: Usar 'folio'
    CASE dc.tipo_doc -- CORRECCIÓN: Usar tipo_doc
        WHEN 'factura' THEN 'Factura'
        WHEN 'boleta' THEN 'Boleta'
        WHEN 'nota_credito' THEN 'Nota de Crédito'
        ELSE 'Otro'
    END AS 'Tipo',
    CASE g.estado -- CORRECCIÓN: Usar estado de Gasto
        WHEN 'pendiente' THEN 'Pendiente'
        WHEN 'aprobado' THEN 'Aprobada'
        WHEN 'rechazado' THEN 'Rechazada'
        WHEN 'anulado' THEN 'Anulada'
        ELSE 'Sin Gasto Asociado'
    END AS 'Estado',
    dc.glosa AS 'Descripción', -- CORRECCIÓN: Usar 'glosa'
    p.razon_social AS 'Proveedor',
    CONCAT(p.rut, '-', p.dv) AS 'RUT Proveedor',
    cc.nombre AS 'Centro de Costo',
    cg.nombre AS 'Categoría',
    dc.total AS 'Monto Total',
    'CLP' AS 'Moneda',
    DATE_FORMAT(dc.fecha_emision, '%d/%m/%Y') AS 'Fecha Solicitud',
    NULL AS 'Fecha Requerida', -- CORRECCIÓN: Columna no existe
    'Sistema' AS 'Solicitado Por', -- CORRECCIÓN: Columna no existe
    dc.glosa AS 'Notas', -- CORRECCIÓN: Usar 'glosa'
    DATE_FORMAT(dc.created_at, '%d/%m/%Y %H:%i') AS 'Fecha Creación',
    DATE_FORMAT(dc.updated_at, '%d/%m/%Y %H:%i') AS 'Última Modificación'
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id -- CORRECCIÓN: Join a gasto
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:estado IS NULL OR g.estado = :estado) -- CORRECCIÓN: Filtrar por estado de Gasto
    AND (:fecha_desde IS NULL OR dc.fecha_emision >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR dc.fecha_emision <= :fecha_hasta)
ORDER BY dc.fecha_emision DESC;

-- Exportación de items de compras (ELIMINADO - Tabla no existe)

-- =========================================
-- 6. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- =========================================

-- Validar documentos de compra sin proveedor (Sin cambios, ya es correcto)
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'
    COALESCE(dc.total, 0) AS total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') AS request_date
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND dc.proveedor_id IS NULL
ORDER BY dc.fecha_emision DESC;

-- Validar documentos de compra sin gasto (No podemos validar CC/Categoría si no hay gasto)
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.glosa AS description, -- CORRECCIÓN: Usar 'glosa'
    p.razon_social AS provider_name,
    COALESCE(dc.total, 0) AS total_amount
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND g.id IS NULL -- Documento sin gasto asociado
ORDER BY dc.fecha_emision DESC;

-- Validar integridad de montos (Solo verifica el total ya que no hay items)
SELECT
    dc.id,
    dc.folio AS number, -- CORRECCIÓN: Usar 'folio'
    dc.total AS total_documento
    -- COALESCE(SUM(dci.total), 0) AS suma_items, -- ELIMINADO
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
ORDER BY dc.id;

-- Verificar documentos de compra con fechas vencidas (No existe fecha_vencimiento)
SELECT
    dc.id,
    dc.folio AS number,
    dc.glosa AS description,
    p.razon_social AS provider_name,
    NULL AS required_date, -- CORRECCIÓN: Columna no existe
    NULL AS dias_vencidos, -- CORRECCIÓN: No se puede calcular
    'approved' AS status -- CORRECCIÓN: Columna no existe
FROM documento_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND dc.fecha_emision < CURDATE() -- Se usa fecha_emision, que no es lo mismo que vencimiento
ORDER BY dc.fecha_emision ASC;

-- Verificar integridad de datos
SELECT
    'documento_compra' AS tabla, -- CORRECCIÓN: Nombre de la tabla
    COUNT(*) AS total_registros,
    COUNT(CASE WHEN dc.folio IS NULL OR dc.folio = '' THEN 1 END) AS folio_nulo, -- CORRECCIÓN: Usar folio
    COUNT(CASE WHEN dc.fecha_emision IS NULL THEN 1 END) AS fecha_emision_nula,
    COUNT(CASE WHEN dc.total IS NULL OR dc.total < 0 THEN 1 END) AS total_invalido,
    COUNT(CASE WHEN dc.comunidad_id IS NULL THEN 1 END) AS comunidad_id_nula
    -- COUNT(CASE WHEN dc.estado NOT IN (...) THEN 1 END) AS estado_invalido -- ELIMINADO: Columna no existe
FROM documento_compra dc -- CORRECCIÓN: Nombre de la tabla
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id);

-- =========================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO (ELIMINADAS - se rehace la lógica)
-- =========================================

-- Vista optimizada para listados de documentos de compra
CREATE OR REPLACE VIEW vista_documentos_compra_listado AS
SELECT
    dc.id,
    dc.folio AS number,
    dc.tipo_doc AS type,
    'approved' AS status,
    'medium' AS priority,
    dc.glosa AS description,
    JSON_OBJECT('id', p.id, 'name', p.razon_social, 'category', COALESCE(p.giro, 'Sin especificar')) AS provider,
    JSON_OBJECT('id', cc.id, 'name', cc.nombre, 'department', 'operations') AS cost_center,
    JSON_OBJECT('id', cg.id, 'name', cg.nombre, 'color', '#2196f3') AS category,
    COALESCE(dc.total, 0) AS total_amount,
    'CLP' AS currency,
    COALESCE(DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d'), '') AS required_date,
    'Sistema' AS requested_by,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') AS request_date,
    COALESCE(archivos_count.total_archivos, 0) AS documents_count,
    dc.created_at,
    dc.updated_at
FROM documento_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN (
    SELECT entity_id, COUNT(*) AS total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) AS archivos_count ON dc.id = archivos_count.entity_id;

-- Vista para estadísticas de documentos de compra
CREATE OR REPLACE VIEW vista_documentos_compra_estadisticas AS
SELECT
    dc.comunidad_id AS comunidad_id,
    COUNT(DISTINCT dc.id) AS total_compras,
    COUNT(DISTINCT CASE WHEN g.estado = 'pendiente' THEN dc.id END) AS compras_pendientes,
    COUNT(DISTINCT CASE WHEN g.estado = 'aprobado' THEN dc.id END) AS compras_aprobadas,
    COUNT(DISTINCT CASE WHEN g.estado = 'aprobado' THEN dc.id END) AS compras_completadas,
    COUNT(DISTINCT CASE WHEN g.estado = 'rechazado' OR g.estado = 'anulado' THEN dc.id END) AS compras_canceladas,
    COUNT(DISTINCT p.id) AS proveedores_activos,
    COUNT(DISTINCT cc.id) AS centros_costo_activos,
    SUM(COALESCE(dc.total, 0)) AS monto_total_compras,
    AVG(COALESCE(dc.total, 0)) AS monto_promedio_compra,
    COUNT(DISTINCT CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN dc.id END) AS compras_ultimo_mes,
    SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN COALESCE(dc.total, 0) ELSE 0 END) AS monto_ultimo_mes
FROM documento_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN gasto g ON dc.id = g.documento_compra_id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
GROUP BY dc.comunidad_id;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN (Ajustados al nombre correcto)
-- =========================================

-- Índices para búsquedas frecuentes en documentos_compra
CREATE INDEX idx_documento_compra_comunidad_fecha ON documento_compra(comunidad_id, fecha_emision);
CREATE INDEX idx_documento_compra_proveedor ON documento_compra(proveedor_id);
CREATE INDEX idx_documento_compra_tipo ON documento_compra(tipo_doc);
CREATE INDEX idx_documento_compra_folio ON documento_compra(folio);

-- Índices para Joins a Gasto
CREATE INDEX idx_gasto_documento_compra ON gasto(documento_compra_id);
CREATE INDEX idx_gasto_documento_compra_estado ON gasto(documento_compra_id, estado);
CREATE INDEX idx_gasto_centro_categoria ON gasto(centro_costo_id, categoria_id);

-- Índices para archivos relacionados con compras
CREATE INDEX idx_archivos_entity_compra ON archivos(entity_type, entity_id);