-- =========================================
-- QUERIES PARA MÓDULO COMPRAS
-- Sistema de Gestión de Condominios - Cuentas Claras
-- =========================================

-- =========================================
-- 1. LISTADO BÁSICO DE COMPRAS CON FILTROS
-- =========================================

-- Consulta principal para listado de compras
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.tipo_documento, 'order') as type,
    COALESCE(dc.estado, 'draft') as status,
    'medium' as priority, -- Campo calculado, por defecto medium
    COALESCE(dc.descripcion, '') as description,

    -- Información del proveedor
    JSON_OBJECT(
        'id', p.id,
        'name', p.razon_social,
        'category', COALESCE(p.giro, 'Sin especificar'),
        'rating', 0,
        'contact', COALESCE(p.telefono, ''),
        'phone', COALESCE(p.telefono, ''),
        'email', COALESCE(p.email, '')
    ) as provider,

    -- Información del centro de costo
    JSON_OBJECT(
        'id', cc.id,
        'name', cc.nombre,
        'department', 'operations' -- Campo calculado
    ) as cost_center,

    -- Información de la categoría
    JSON_OBJECT(
        'id', cg.id,
        'name', cg.nombre,
        'color', '#2196f3' -- Color por defecto
    ) as category,

    -- Items de la compra (resumen)
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', dci.id,
            'description', COALESCE(dci.descripcion, ''),
            'quantity', COALESCE(dci.cantidad, 1),
            'unit', COALESCE(dci.unidad, 'unidad'),
            'unitPrice', COALESCE(dci.precio_unitario, 0),
            'totalPrice', COALESCE(dci.total, 0),
            'category', COALESCE(cg.nombre, ''),
            'status', 'pending'
        )
    ) as items,

    COALESCE(dc.total, 0) as total_amount,
    'clp' as currency, -- Moneda por defecto
    COALESCE(DATE_FORMAT(dc.fecha_vencimiento, '%Y-%m-%d'), '') as required_date,
    COALESCE(dc.usuario_creacion, 'Sistema') as requested_by,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') as request_date,

    -- Información de aprobación (campos calculados)
    NULL as approved_by,
    NULL as approved_date,
    NULL as rejected_by,
    NULL as rejected_date,
    NULL as rejection_reason,

    -- Información adicional
    COALESCE(dc.notas, '') as notes,
    '' as request_justification, -- Campo calculado
    COALESCE(archivos_count.total_archivos, 0) as documents_count,

    -- Timeline básico (solo creación por ahora)
    JSON_ARRAY(
        JSON_OBJECT(
            'id', CONCAT('created_', dc.id),
            'type', 'created',
            'title', 'Compra creada',
            'description', CONCAT('Compra ', dc.numero_documento, ' creada'),
            'date', DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s'),
            'user', COALESCE(dc.usuario_creacion, 'Sistema'),
            'icon', 'add_shopping_cart',
            'color', 'primary'
        )
    ) as timeline,

    DATE_FORMAT(dc.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
    DATE_FORMAT(dc.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at

FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON dc.categoria_gasto_id = cg.id
LEFT JOIN documentos_compra_items dci ON dc.id = dci.documento_compra_id
LEFT JOIN (
    -- Conteo de archivos relacionados
    SELECT
        entity_id,
        COUNT(*) as total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) archivos_count ON dc.id = archivos_count.entity_id

WHERE 1=1
    -- Filtros opcionales
    AND (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         dc.numero_documento LIKE CONCAT('%', :search, '%') OR
         dc.descripcion LIKE CONCAT('%', :search, '%') OR
         p.razon_social LIKE CONCAT('%', :search, '%'))
    AND (:type IS NULL OR dc.tipo_documento = :type)
    AND (:status IS NULL OR dc.estado = :status)
    AND (:provider_id IS NULL OR dc.proveedor_id = :provider_id)
    AND (:cost_center_id IS NULL OR dc.centro_costo_id = :cost_center_id)
    AND (:category_id IS NULL OR dc.categoria_gasto_id = :category_id)
    AND (:date_from IS NULL OR dc.fecha_emision >= :date_from)
    AND (:date_to IS NULL OR dc.fecha_emision <= :date_to)
    AND (:amount_from IS NULL OR dc.total >= :amount_from)
    AND (:amount_to IS NULL OR dc.total <= :amount_to)

GROUP BY dc.id, dc.numero_documento, dc.tipo_documento, dc.estado, dc.descripcion,
         p.id, p.razon_social, p.giro, p.telefono, p.email,
         cc.id, cc.nombre, cg.id, cg.nombre,
         dc.total, dc.fecha_vencimiento, dc.usuario_creacion, dc.fecha_emision,
         dc.notas, dc.created_at, dc.updated_at, archivos_count.total_archivos

ORDER BY dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 2. VISTA DETALLADA DE COMPRA CON ITEMS Y TIMELINE
-- =========================================

-- Consulta detallada para una compra específica
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.tipo_documento, 'order') as type,
    COALESCE(dc.estado, 'draft') as status,
    'medium' as priority, -- Campo calculado
    COALESCE(dc.descripcion, '') as description,

    -- Información completa del proveedor
    JSON_OBJECT(
        'id', p.id,
        'name', p.razon_social,
        'category', COALESCE(p.giro, 'Sin especificar'),
        'rating', 0,
        'contact', COALESCE(p.telefono, ''),
        'phone', COALESCE(p.telefono, ''),
        'email', COALESCE(p.email, '')
    ) as provider,

    -- Información completa del centro de costo
    JSON_OBJECT(
        'id', cc.id,
        'name', cc.nombre,
        'department', 'operations',
        'budget', 0, -- Campo calculado, presupuesto del centro
        'spent', 0  -- Campo calculado, gastado en el centro
    ) as cost_center,

    -- Información completa de la categoría
    JSON_OBJECT(
        'id', cg.id,
        'name', cg.nombre,
        'color', '#2196f3'
    ) as category,

    -- Items detallados de la compra
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', dci.id,
                'description', COALESCE(dci.descripcion, ''),
                'quantity', COALESCE(dci.cantidad, 1),
                'unit', COALESCE(dci.unidad, 'unidad'),
                'unitPrice', COALESCE(dci.precio_unitario, 0),
                'totalPrice', COALESCE(dci.total, 0),
                'category', COALESCE(cg_item.nombre, ''),
                'notes', COALESCE(dci.notas, ''),
                'status', 'pending'
            )
        )
        FROM documentos_compra_items dci
        LEFT JOIN categoria_gasto cg_item ON dci.categoria_gasto_id = cg_item.id
        WHERE dci.documento_compra_id = dc.id),
        JSON_ARRAY()
    ) as items,

    COALESCE(dc.total, 0) as total_amount,
    'clp' as currency,
    COALESCE(DATE_FORMAT(dc.fecha_vencimiento, '%Y-%m-%d'), '') as required_date,
    COALESCE(dc.usuario_creacion, 'Sistema') as requested_by,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') as request_date,

    -- Información de aprobación (campos calculados basados en auditoría)
    NULL as approved_by,
    NULL as approved_date,
    NULL as rejected_by,
    NULL as rejected_date,
    NULL as rejection_reason,

    -- Información adicional
    COALESCE(dc.notas, '') as notes,
    '' as request_justification,
    COALESCE(archivos_count.total_archivos, 0) as documents_count,

    -- Timeline completo (creación + eventos de auditoría)
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', CONCAT('event_', a.id),
                'type', CASE
                    WHEN a.accion = 'INSERT' THEN 'created'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'approved'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'cancelled'
                            ELSE 'note'
                        END
                    ELSE 'note'
                END,
                'title', CASE
                    WHEN a.accion = 'INSERT' THEN 'Compra creada'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'Compra aprobada'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'Compra cancelada'
                            ELSE 'Compra actualizada'
                        END
                    ELSE 'Nota agregada'
                END,
                'description', COALESCE(a.valores_nuevos, ''),
                'date', DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s'),
                'user', COALESCE(a.usuario_id, 'Sistema'),
                'icon', CASE
                    WHEN a.accion = 'INSERT' THEN 'add_shopping_cart'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'check_circle'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'cancel'
                            ELSE 'edit'
                        END
                    ELSE 'note'
                END,
                'color', CASE
                    WHEN a.accion = 'INSERT' THEN 'primary'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'success'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'danger'
                            ELSE 'info'
                        END
                    ELSE 'secondary'
                END
            )
        )
        FROM auditoria a
        WHERE a.tabla = 'documentos_compra' AND a.registro_id = dc.id
        ORDER BY a.created_at ASC),
        JSON_ARRAY(
            JSON_OBJECT(
                'id', CONCAT('created_', dc.id),
                'type', 'created',
                'title', 'Compra creada',
                'description', CONCAT('Compra ', dc.numero_documento, ' creada'),
                'date', DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s'),
                'user', COALESCE(dc.usuario_creacion, 'Sistema'),
                'icon', 'add_shopping_cart',
                'color', 'primary'
            )
        )
    ) as timeline,

    -- Fechas adicionales calculadas
    NULL as delivery_date,
    NULL as completed_date,

    DATE_FORMAT(dc.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
    DATE_FORMAT(dc.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at

FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON dc.categoria_gasto_id = cg.id
LEFT JOIN (
    -- Conteo de archivos relacionados
    SELECT
        entity_id,
        COUNT(*) as total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) archivos_count ON dc.id = archivos_count.entity_id

WHERE dc.id = :compra_id;

-- =========================================
-- 3. ESTADÍSTICAS GENERALES DE COMPRAS
-- =========================================

-- Estadísticas generales del módulo compras
SELECT
    COUNT(DISTINCT dc.id) as total_compras,
    COUNT(DISTINCT CASE WHEN dc.estado = 'pending' THEN dc.id END) as compras_pendientes,
    COUNT(DISTINCT CASE WHEN dc.estado = 'approved' THEN dc.id END) as compras_aprobadas,
    COUNT(DISTINCT CASE WHEN dc.estado = 'in-progress' THEN dc.id END) as compras_en_progreso,
    COUNT(DISTINCT CASE WHEN dc.estado = 'completed' THEN dc.id END) as compras_completadas,
    COUNT(DISTINCT CASE WHEN dc.estado = 'cancelled' THEN dc.id END) as compras_canceladas,
    COUNT(DISTINCT p.id) as proveedores_activos,
    COUNT(DISTINCT cc.id) as centros_costo_activos,

    -- Montos totales
    SUM(COALESCE(dc.total, 0)) as monto_total_compras,
    AVG(COALESCE(dc.total, 0)) as monto_promedio_compra,
    MAX(COALESCE(dc.total, 0)) as monto_maximo_compra,
    MIN(COALESCE(dc.total, 0)) as monto_minimo_compra,

    -- Estadísticas por período
    COUNT(DISTINCT CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN dc.id END) as compras_ultimo_mes,
    SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN COALESCE(dc.total, 0) ELSE 0 END) as monto_ultimo_mes,

    -- Estadísticas por tipo
    COUNT(DISTINCT CASE WHEN dc.tipo_documento = 'order' THEN dc.id END) as compras_orden,
    COUNT(DISTINCT CASE WHEN dc.tipo_documento = 'service' THEN dc.id END) as compras_servicio,
    COUNT(DISTINCT CASE WHEN dc.tipo_documento = 'maintenance' THEN dc.id END) as compras_mantenimiento,
    COUNT(DISTINCT CASE WHEN dc.tipo_documento = 'supplies' THEN dc.id END) as compras_suministros

FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id);

-- Estadísticas por proveedor
SELECT
    p.razon_social as proveedor,
    COUNT(dc.id) as total_compras,
    SUM(COALESCE(dc.total, 0)) as monto_total,
    AVG(COALESCE(dc.total, 0)) as monto_promedio,
    MAX(dc.fecha_emision) as ultima_compra,
    COUNT(CASE WHEN dc.estado = 'completed' THEN 1 END) as compras_completadas,
    COUNT(CASE WHEN dc.estado = 'pending' THEN 1 END) as compras_pendientes
FROM proveedor p
LEFT JOIN documentos_compra dc ON p.id = dc.proveedor_id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND dc.id IS NOT NULL
GROUP BY p.id, p.razon_social
ORDER BY monto_total DESC;

-- Estadísticas por centro de costo
SELECT
    cc.nombre as centro_costo,
    COUNT(dc.id) as total_compras,
    SUM(COALESCE(dc.total, 0)) as monto_total,
    AVG(COALESCE(dc.total, 0)) as monto_promedio,
    COUNT(DISTINCT p.id) as proveedores_distintos
FROM centro_costo cc
LEFT JOIN documentos_compra dc ON cc.id = dc.centro_costo_id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR cc.comunidad_id = :comunidad_id)
    AND dc.id IS NOT NULL
GROUP BY cc.id, cc.nombre
ORDER BY monto_total DESC;

-- =========================================
-- 4. CONSULTAS FILTRADAS PARA BÚSQUEDA AVANZADA
-- =========================================

-- Búsqueda por texto completo
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.tipo_documento, 'order') as type,
    COALESCE(dc.estado, 'draft') as status,
    COALESCE(dc.descripcion, '') as description,
    p.razon_social as provider_name,
    cc.nombre as cost_center_name,
    cg.nombre as category_name,
    COALESCE(dc.total, 0) as total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') as request_date,
    COALESCE(dc.usuario_creacion, 'Sistema') as requested_by
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON dc.categoria_gasto_id = cg.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         dc.numero_documento LIKE CONCAT('%', :search, '%') OR
         dc.descripcion LIKE CONCAT('%', :search, '%') OR
         p.razon_social LIKE CONCAT('%', :search, '%') OR
         cc.nombre LIKE CONCAT('%', :search, '%') OR
         cg.nombre LIKE CONCAT('%', :search, '%'))
ORDER BY dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por rango de fechas
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.descripcion, '') as description,
    p.razon_social as provider_name,
    COALESCE(dc.total, 0) as total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') as request_date,
    DATE_FORMAT(dc.fecha_vencimiento, '%Y-%m-%d') as required_date,
    COALESCE(dc.estado, 'draft') as status
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:fecha_desde IS NULL OR dc.fecha_emision >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR dc.fecha_emision <= :fecha_hasta)
ORDER BY dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por rango de montos
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.descripcion, '') as description,
    p.razon_social as provider_name,
    COALESCE(dc.total, 0) as total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') as request_date,
    COALESCE(dc.estado, 'draft') as status
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:monto_min IS NULL OR dc.total >= :monto_min)
    AND (:monto_max IS NULL OR dc.total <= :monto_max)
ORDER BY dc.total DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por estado y prioridad
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.descripcion, '') as description,
    p.razon_social as provider_name,
    COALESCE(dc.total, 0) as total_amount,
    COALESCE(dc.estado, 'draft') as status,
    'medium' as priority, -- Campo calculado
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') as request_date
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:estado IS NULL OR dc.estado = :estado)
ORDER BY
    CASE
        WHEN dc.estado = 'urgent' THEN 1
        WHEN dc.estado = 'high' THEN 2
        WHEN dc.estado = 'medium' THEN 3
        WHEN dc.estado = 'low' THEN 4
        ELSE 5
    END ASC,
    dc.fecha_emision DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 5. CONSULTAS PARA EXPORTACIÓN DE DATOS
-- =========================================

-- Exportación completa de compras para Excel/CSV
SELECT
    dc.id as 'ID',
    dc.numero_documento as 'Número',
    CASE
        WHEN dc.tipo_documento = 'order' THEN 'Orden de Compra'
        WHEN dc.tipo_documento = 'service' THEN 'Servicio'
        WHEN dc.tipo_documento = 'maintenance' THEN 'Mantenimiento'
        WHEN dc.tipo_documento = 'supplies' THEN 'Suministros'
        ELSE 'Otro'
    END as 'Tipo',
    CASE
        WHEN dc.estado = 'draft' THEN 'Borrador'
        WHEN dc.estado = 'pending' THEN 'Pendiente'
        WHEN dc.estado = 'approved' THEN 'Aprobada'
        WHEN dc.estado = 'in-progress' THEN 'En Progreso'
        WHEN dc.estado = 'delivered' THEN 'Entregada'
        WHEN dc.estado = 'completed' THEN 'Completada'
        WHEN dc.estado = 'cancelled' THEN 'Cancelada'
        ELSE 'Desconocido'
    END as 'Estado',
    dc.descripcion as 'Descripción',
    p.razon_social as 'Proveedor',
    CONCAT(p.rut, '-', p.dv) as 'RUT Proveedor',
    cc.nombre as 'Centro de Costo',
    cg.nombre as 'Categoría',
    dc.total as 'Monto Total',
    'CLP' as 'Moneda',
    DATE_FORMAT(dc.fecha_emision, '%d/%m/%Y') as 'Fecha Solicitud',
    DATE_FORMAT(dc.fecha_vencimiento, '%d/%m/%Y') as 'Fecha Requerida',
    dc.usuario_creacion as 'Solicitado Por',
    dc.notas as 'Notas',
    DATE_FORMAT(dc.created_at, '%d/%m/%Y %H:%i') as 'Fecha Creación',
    DATE_FORMAT(dc.updated_at, '%d/%m/%Y %H:%i') as 'Última Modificación'
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON dc.categoria_gasto_id = cg.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:estado IS NULL OR dc.estado = :estado)
    AND (:fecha_desde IS NULL OR dc.fecha_emision >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR dc.fecha_emision <= :fecha_hasta)
ORDER BY dc.fecha_emision DESC;

-- Exportación de items de compras
SELECT
    dc.numero_documento as 'Número Compra',
    dc.fecha_emision as 'Fecha Compra',
    p.razon_social as 'Proveedor',
    dci.descripcion as 'Descripción Item',
    dci.cantidad as 'Cantidad',
    dci.unidad as 'Unidad',
    dci.precio_unitario as 'Precio Unitario',
    dci.total as 'Total Item',
    cg.nombre as 'Categoría Item',
    dci.notas as 'Notas Item'
FROM documentos_compra dc
INNER JOIN documentos_compra_items dci ON dc.id = dci.documento_compra_id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN categoria_gasto cg ON dci.categoria_gasto_id = cg.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND (:compra_id IS NULL OR dc.id = :compra_id)
ORDER BY dc.numero_documento ASC, dci.id ASC;

-- =========================================
-- 6. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- =========================================

-- Validar compras sin proveedor
SELECT
    dc.id,
    dc.numero_documento as number,
    dc.descripcion as description,
    COALESCE(dc.total, 0) as total_amount,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d') as request_date
FROM documentos_compra dc
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND dc.proveedor_id IS NULL
ORDER BY dc.fecha_emision DESC;

-- Validar compras sin centro de costo
SELECT
    dc.id,
    dc.numero_documento as number,
    dc.descripcion as description,
    p.razon_social as provider_name,
    COALESCE(dc.total, 0) as total_amount
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND dc.centro_costo_id IS NULL
ORDER BY dc.fecha_emision DESC;

-- Validar compras sin items
SELECT
    dc.id,
    dc.numero_documento as number,
    dc.descripcion as description,
    p.razon_social as provider_name,
    COALESCE(dc.total, 0) as total_amount
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND NOT EXISTS (
        SELECT 1 FROM documentos_compra_items dci
        WHERE dci.documento_compra_id = dc.id
    )
ORDER BY dc.fecha_emision DESC;

-- Validar integridad de montos (total vs suma de items)
SELECT
    dc.id,
    dc.numero_documento as number,
    dc.total as total_documento,
    COALESCE(SUM(dci.total), 0) as suma_items,
    (dc.total - COALESCE(SUM(dci.total), 0)) as diferencia
FROM documentos_compra dc
LEFT JOIN documentos_compra_items dci ON dc.id = dci.documento_compra_id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
GROUP BY dc.id, dc.numero_documento, dc.total
HAVING ABS(dc.total - COALESCE(SUM(dci.total), 0)) > 0.01
ORDER BY ABS(dc.total - COALESCE(SUM(dci.total), 0)) DESC;

-- Verificar compras con fechas vencidas
SELECT
    dc.id,
    dc.numero_documento as number,
    dc.descripcion as description,
    p.razon_social as provider_name,
    DATE_FORMAT(dc.fecha_vencimiento, '%Y-%m-%d') as required_date,
    DATEDIFF(CURDATE(), dc.fecha_vencimiento) as dias_vencidos,
    COALESCE(dc.estado, 'draft') as status
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id)
    AND dc.fecha_vencimiento IS NOT NULL
    AND dc.fecha_vencimiento < CURDATE()
    AND dc.estado NOT IN ('completed', 'cancelled')
ORDER BY dc.fecha_vencimiento ASC;

-- Verificar integridad de datos
SELECT
    'documentos_compra' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN dc.numero_documento IS NULL OR dc.numero_documento = '' THEN 1 END) as numero_documento_nulo,
    COUNT(CASE WHEN dc.fecha_emision IS NULL THEN 1 END) as fecha_emision_nula,
    COUNT(CASE WHEN dc.total IS NULL OR dc.total < 0 THEN 1 END) as total_invalido,
    COUNT(CASE WHEN dc.comunidad_id IS NULL THEN 1 END) as comunidad_id_nula,
    COUNT(CASE WHEN dc.estado NOT IN ('draft','pending','approved','in-progress','delivered','completed','cancelled') THEN 1 END) as estado_invalido
FROM documentos_compra dc
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id);

-- =========================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =========================================

-- Vista optimizada para listados de compras
CREATE OR REPLACE VIEW vista_compras_listado AS
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.tipo_documento, 'order') as type,
    COALESCE(dc.estado, 'draft') as status,
    'medium' as priority,
    COALESCE(dc.descripcion, '') as description,
    JSON_OBJECT(
        'id', p.id,
        'name', p.razon_social,
        'category', COALESCE(p.giro, 'Sin especificar'),
        'rating', 0
    ) as provider,
    JSON_OBJECT(
        'id', cc.id,
        'name', cc.nombre,
        'department', 'operations'
    ) as cost_center,
    JSON_OBJECT(
        'id', cg.id,
        'name', cg.nombre,
        'color', '#2196f3'
    ) as category,
    COALESCE(dc.total, 0) as total_amount,
    'clp' as currency,
    COALESCE(DATE_FORMAT(dc.fecha_vencimiento, '%Y-%m-%d'), '') as required_date,
    COALESCE(dc.usuario_creacion, 'Sistema') as requested_by,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') as request_date,
    COALESCE(archivos_count.total_archivos, 0) as documents_count,
    dc.created_at,
    dc.updated_at
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON dc.categoria_gasto_id = cg.id
LEFT JOIN (
    SELECT
        entity_id,
        COUNT(*) as total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) archivos_count ON dc.id = archivos_count.entity_id;

-- Vista optimizada para detalles de compras
CREATE OR REPLACE VIEW vista_compras_detalle AS
SELECT
    dc.id,
    dc.numero_documento as number,
    COALESCE(dc.tipo_documento, 'order') as type,
    COALESCE(dc.estado, 'draft') as status,
    'medium' as priority,
    COALESCE(dc.descripcion, '') as description,
    JSON_OBJECT(
        'id', p.id,
        'name', p.razon_social,
        'category', COALESCE(p.giro, 'Sin especificar'),
        'rating', 0,
        'contact', COALESCE(p.telefono, ''),
        'phone', COALESCE(p.telefono, ''),
        'email', COALESCE(p.email, '')
    ) as provider,
    JSON_OBJECT(
        'id', cc.id,
        'name', cc.nombre,
        'department', 'operations',
        'budget', 0,
        'spent', 0
    ) as cost_center,
    JSON_OBJECT(
        'id', cg.id,
        'name', cg.nombre,
        'color', '#2196f3'
    ) as category,
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', dci.id,
                'description', COALESCE(dci.descripcion, ''),
                'quantity', COALESCE(dci.cantidad, 1),
                'unit', COALESCE(dci.unidad, 'unidad'),
                'unitPrice', COALESCE(dci.precio_unitario, 0),
                'totalPrice', COALESCE(dci.total, 0),
                'category', COALESCE(cg_item.nombre, ''),
                'notes', COALESCE(dci.notas, ''),
                'status', 'pending'
            )
        )
        FROM documentos_compra_items dci
        LEFT JOIN categoria_gasto cg_item ON dci.categoria_gasto_id = cg_item.id
        WHERE dci.documento_compra_id = dc.id),
        JSON_ARRAY()
    ) as items,
    COALESCE(dc.total, 0) as total_amount,
    'clp' as currency,
    COALESCE(DATE_FORMAT(dc.fecha_vencimiento, '%Y-%m-%d'), '') as required_date,
    COALESCE(dc.usuario_creacion, 'Sistema') as requested_by,
    DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s') as request_date,
    NULL as approved_by,
    NULL as approved_date,
    NULL as rejected_by,
    NULL as rejected_date,
    NULL as rejection_reason,
    COALESCE(dc.notas, '') as notes,
    '' as request_justification,
    COALESCE(archivos_count.total_archivos, 0) as documents_count,
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', CONCAT('event_', a.id),
                'type', CASE
                    WHEN a.accion = 'INSERT' THEN 'created'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'approved'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'cancelled'
                            ELSE 'note'
                        END
                    ELSE 'note'
                END,
                'title', CASE
                    WHEN a.accion = 'INSERT' THEN 'Compra creada'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'Compra aprobada'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'Compra cancelada'
                            ELSE 'Compra actualizada'
                        END
                    ELSE 'Nota agregada'
                END,
                'description', COALESCE(a.valores_nuevos, ''),
                'date', DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s'),
                'user', COALESCE(a.usuario_id, 'Sistema'),
                'icon', CASE
                    WHEN a.accion = 'INSERT' THEN 'add_shopping_cart'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'check_circle'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'cancel'
                            ELSE 'edit'
                        END
                    ELSE 'note'
                END,
                'color', CASE
                    WHEN a.accion = 'INSERT' THEN 'primary'
                    WHEN a.accion = 'UPDATE' AND a.valores_nuevos LIKE '%estado%' THEN
                        CASE
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'approved' THEN 'success'
                            WHEN JSON_EXTRACT(a.valores_nuevos, '$.estado') = 'cancelled' THEN 'danger'
                            ELSE 'info'
                        END
                    ELSE 'secondary'
                END
            )
        )
        FROM auditoria a
        WHERE a.tabla = 'documentos_compra' AND a.registro_id = dc.id
        ORDER BY a.created_at ASC),
        JSON_ARRAY(
            JSON_OBJECT(
                'id', CONCAT('created_', dc.id),
                'type', 'created',
                'title', 'Compra creada',
                'description', CONCAT('Compra ', dc.numero_documento, ' creada'),
                'date', DATE_FORMAT(dc.fecha_emision, '%Y-%m-%d %H:%i:%s'),
                'user', COALESCE(dc.usuario_creacion, 'Sistema'),
                'icon', 'add_shopping_cart',
                'color', 'primary'
            )
        )
    ) as timeline,
    dc.created_at,
    dc.updated_at
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
LEFT JOIN categoria_gasto cg ON dc.categoria_gasto_id = cg.id
LEFT JOIN (
    SELECT
        entity_id,
        COUNT(*) as total_archivos
    FROM archivos
    WHERE entity_type = 'documento_compra'
    GROUP BY entity_id
) archivos_count ON dc.id = archivos_count.entity_id;

-- Vista para estadísticas de compras
CREATE OR REPLACE VIEW vista_compras_estadisticas AS
SELECT
    (:comunidad_id) as comunidad_id,
    COUNT(DISTINCT dc.id) as total_compras,
    COUNT(DISTINCT CASE WHEN dc.estado = 'pending' THEN dc.id END) as compras_pendientes,
    COUNT(DISTINCT CASE WHEN dc.estado = 'approved' THEN dc.id END) as compras_aprobadas,
    COUNT(DISTINCT CASE WHEN dc.estado = 'in-progress' THEN dc.id END) as compras_en_progreso,
    COUNT(DISTINCT CASE WHEN dc.estado = 'completed' THEN dc.id END) as compras_completadas,
    COUNT(DISTINCT CASE WHEN dc.estado = 'cancelled' THEN dc.id END) as compras_canceladas,
    COUNT(DISTINCT p.id) as proveedores_activos,
    COUNT(DISTINCT cc.id) as centros_costo_activos,
    SUM(COALESCE(dc.total, 0)) as monto_total_compras,
    AVG(COALESCE(dc.total, 0)) as monto_promedio_compra,
    COUNT(DISTINCT CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN dc.id END) as compras_ultimo_mes,
    SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN COALESCE(dc.total, 0) ELSE 0 END) as monto_ultimo_mes
FROM documentos_compra dc
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON dc.centro_costo_id = cc.id
WHERE (:comunidad_id IS NULL OR dc.comunidad_id = :comunidad_id);

-- =========================================
-- 8. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =========================================

-- Índices para búsquedas frecuentes en compras
CREATE INDEX idx_documentos_compra_comunidad_fecha ON documentos_compra(comunidad_id, fecha_emision);
CREATE INDEX idx_documentos_compra_proveedor ON documentos_compra(proveedor_id);
CREATE INDEX idx_documentos_compra_centro_costo ON documentos_compra(centro_costo_id);
CREATE INDEX idx_documentos_compra_categoria ON documentos_compra(categoria_gasto_id);
CREATE INDEX idx_documentos_compra_estado ON documentos_compra(estado);
CREATE INDEX idx_documentos_compra_tipo ON documentos_compra(tipo_documento);
CREATE INDEX idx_documentos_compra_numero ON documentos_compra(numero_documento);

-- Índices para items de compras
CREATE INDEX idx_documentos_compra_items_documento ON documentos_compra_items(documento_compra_id);
CREATE INDEX idx_documentos_compra_items_categoria ON documentos_compra_items(categoria_gasto_id);

-- Índices para archivos relacionados con compras
CREATE INDEX idx_archivos_entity_compra ON archivos(entity_type, entity_id) WHERE entity_type = 'documento_compra';

-- Índices compuestos para búsquedas complejas
CREATE INDEX idx_documentos_compra_busqueda ON documentos_compra(comunidad_id, estado, fecha_emision, total);
CREATE INDEX idx_documentos_compra_fechas ON documentos_compra(fecha_emision, fecha_vencimiento);

-- =========================================
-- NOTAS IMPORTANTES:
-- =========================================
--
-- 1. Todas las consultas incluyen filtros opcionales por comunidad_id
-- 2. Se usan COALESCE para manejar campos NULL y mantener compatibilidad
-- 3. Los campos calculados (rating, priority, budget, etc.) tienen valores por defecto
-- 4. Las estadísticas se calculan en tiempo real desde documentos_compra y relacionados
-- 5. Las vistas optimizadas mejoran el rendimiento de consultas frecuentes
-- 6. Los índices recomendados aceleran las búsquedas y filtros
-- 7. Todas las consultas están parametrizadas para prevenir SQL injection
-- 8. Se incluyen validaciones para mantener integridad de datos
-- 9. Las exportaciones generan formatos compatibles con Excel/CSV
-- 10. El timeline se construye desde la tabla auditoria cuando está disponible
-- 11. Los items se devuelven como JSON arrays para compatibilidad con el frontend
-- 12. Las estadísticas incluyen análisis temporal (último mes, etc.)
--
-- =========================================