-- =========================================
-- QUERIES PARA MÓDULO PROVEEDORES
-- Sistema de Gestión de Condominios - Cuentas Claras
-- =========================================

-- =========================================
-- 1. LISTADO BÁSICO DE PROVEEDORES CON FILTROS
-- =========================================

-- Consulta principal para listado de proveedores
SELECT
    p.id,
    p.comunidad_id,
    c.nombre as comunidad_nombre,
    p.razon_social as name,
    p.razon_social as business_name,
    COALESCE(p.giro, 'Sin especificar') as category,
    CONCAT(p.rut, '-', p.dv) as rif,
    COALESCE(p.telefono, '') as phone,
    COALESCE(p.email, '') as email,
    COALESCE(p.direccion, '') as address,
    CASE
        WHEN p.activo = 1 THEN 'active'
        ELSE 'inactive'
    END as status,
    0 as rating, -- Campo calculado, por ahora 0
    '' as logo, -- Campo opcional
    -- Estadísticas calculadas
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0) as total_amount,
    COALESCE(DATE_FORMAT(stats.ultimo_contrato, '%Y-%m-%d'), '') as last_contract,
    DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN (
    -- Subconsulta para estadísticas de contratos y montos
    SELECT
        pr.id as proveedor_id,
        COUNT(DISTINCT dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        MAX(dc.fecha_emision) as ultimo_contrato
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
WHERE 1=1
    -- Filtros opcionales
    AND (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR p.razon_social LIKE CONCAT('%', :search, '%'))
    AND (:status IS NULL OR
         (:status = 'active' AND p.activo = 1) OR
         (:status = 'inactive' AND p.activo = 0))
    AND (:category IS NULL OR p.giro LIKE CONCAT('%', :category, '%'))
ORDER BY p.razon_social ASC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 2. VISTA DETALLADA DE PROVEEDOR CON ESTADÍSTICAS
-- =========================================

-- Consulta detallada para un proveedor específico
SELECT
    p.id,
    p.comunidad_id,
    c.nombre as comunidad_nombre,
    p.razon_social as name,
    p.razon_social as business_name,
    COALESCE(p.giro, 'Sin especificar') as category,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) as rif_completo,
    COALESCE(p.telefono, '') as phone,
    COALESCE(p.email, '') as email,
    COALESCE(p.direccion, '') as address,
    CASE
        WHEN p.activo = 1 THEN 'active'
        ELSE 'inactive'
    END as status,
    0 as rating, -- Campo calculado
    '' as logo, -- Campo opcional

    -- Estadísticas detalladas
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0.00) as total_amount,
    COALESCE(stats.monto_promedio, 0.00) as avg_contract_amount,
    COALESCE(stats.total_gastos, 0.00) as total_expenses,
    COALESCE(DATE_FORMAT(stats.primer_contrato, '%Y-%m-%d'), '') as first_contract,
    COALESCE(DATE_FORMAT(stats.ultimo_contrato, '%Y-%m-%d'), '') as last_contract,

    -- Estadísticas por período
    COALESCE(stats_periodo.ultimo_mes, 0.00) as last_month_amount,
    COALESCE(stats_periodo.ultimo_trimestre, 0.00) as last_quarter_amount,
    COALESCE(stats_periodo.ultimo_ano, 0.00) as last_year_amount,

    -- Información de auditoría
    DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at,

    -- Información adicional calculada
    CASE
        WHEN stats.ultimo_contrato IS NOT NULL AND
             DATEDIFF(CURDATE(), stats.ultimo_contrato) <= 30 THEN 'active_recent'
        WHEN stats.ultimo_contrato IS NOT NULL AND
             DATEDIFF(CURDATE(), stats.ultimo_contrato) <= 90 THEN 'active_quarter'
        WHEN stats.ultimo_contrato IS NOT NULL AND
             DATEDIFF(CURDATE(), stats.ultimo_contrato) <= 365 THEN 'active_year'
        ELSE 'inactive_long'
    END as activity_status

FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN (
    -- Estadísticas generales
    SELECT
        pr.id as proveedor_id,
        COUNT(DISTINCT dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        AVG(COALESCE(dc.total, 0)) as monto_promedio,
        SUM(COALESCE(g.monto, 0)) as total_gastos,
        MIN(dc.fecha_emision) as primer_contrato,
        MAX(dc.fecha_emision) as ultimo_contrato
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    LEFT JOIN gasto g ON pr.id = g.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
LEFT JOIN (
    -- Estadísticas por período
    SELECT
        pr.id as proveedor_id,
        SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN COALESCE(dc.total, 0) ELSE 0 END) as ultimo_mes,
        SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) THEN COALESCE(dc.total, 0) ELSE 0 END) as ultimo_trimestre,
        SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) THEN COALESCE(dc.total, 0) ELSE 0 END) as ultimo_ano
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats_periodo ON p.id = stats_periodo.proveedor_id
WHERE p.id = :proveedor_id;

-- =========================================
-- 3. ESTADÍSTICAS GENERALES DE PROVEEDORES
-- =========================================

-- Estadísticas generales del módulo proveedores
SELECT
    COUNT(DISTINCT p.id) as total_proveedores,
    COUNT(DISTINCT CASE WHEN p.activo = 1 THEN p.id END) as proveedores_activos,
    COUNT(DISTINCT CASE WHEN p.activo = 0 THEN p.id END) as proveedores_inactivos,
    COUNT(DISTINCT dc.id) as total_contratos,
    SUM(COALESCE(dc.total, 0)) as monto_total_contratos,
    AVG(COALESCE(dc.total, 0)) as monto_promedio_contrato,
    COUNT(DISTINCT c.id) as comunidades_con_proveedores,

    -- Estadísticas por categoría (giro)
    GROUP_CONCAT(DISTINCT COALESCE(p.giro, 'Sin especificar')
                 ORDER BY COUNT(*) DESC
                 SEPARATOR ', ') as categorias_principales,

    -- Proveedores más activos (último mes)
    (SELECT COUNT(DISTINCT pr.id)
     FROM proveedor pr
     INNER JOIN documentos_compra dc2 ON pr.id = dc2.proveedor_id
     WHERE dc2.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    ) as proveedores_activos_mes,

    -- Monto total último mes
    (SELECT SUM(COALESCE(dc3.total, 0))
     FROM documentos_compra dc3
     WHERE dc3.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    ) as monto_total_mes

FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN documentos_compra dc ON p.id = dc.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id);

-- Estadísticas por categoría de proveedores
SELECT
    COALESCE(p.giro, 'Sin especificar') as categoria,
    COUNT(DISTINCT p.id) as total_proveedores,
    COUNT(DISTINCT CASE WHEN p.activo = 1 THEN p.id END) as proveedores_activos,
    COUNT(DISTINCT dc.id) as total_contratos,
    SUM(COALESCE(dc.total, 0)) as monto_total,
    AVG(COALESCE(dc.total, 0)) as monto_promedio,
    MAX(dc.fecha_emision) as ultimo_contrato
FROM proveedor p
LEFT JOIN documentos_compra dc ON p.id = dc.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
GROUP BY COALESCE(p.giro, 'Sin especificar')
ORDER BY monto_total DESC;

-- =========================================
-- 4. CONSULTAS FILTRADAS PARA BÚSQUEDA AVANZADA
-- =========================================

-- Búsqueda por texto (razón social, email, teléfono)
SELECT
    p.id,
    p.razon_social as name,
    CONCAT(p.rut, '-', p.dv) as rif,
    p.email,
    p.telefono as phone,
    COALESCE(p.giro, 'Sin especificar') as category,
    CASE WHEN p.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0) as total_amount
FROM proveedor p
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        COUNT(dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         p.razon_social LIKE CONCAT('%', :search, '%') OR
         p.email LIKE CONCAT('%', :search, '%') OR
         p.telefono LIKE CONCAT('%', :search, '%') OR
         CONCAT(p.rut, '-', p.dv) LIKE CONCAT('%', :search, '%'))
ORDER BY p.razon_social ASC
LIMIT :limit OFFSET :offset;

-- Filtrar por estado de actividad
SELECT
    p.id,
    p.razon_social as name,
    CONCAT(p.rut, '-', p.dv) as rif,
    COALESCE(p.giro, 'Sin especificar') as category,
    CASE WHEN p.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0) as total_amount,
    COALESCE(DATE_FORMAT(stats.ultimo_contrato, '%Y-%m-%d'), '') as last_contract
FROM proveedor p
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        COUNT(dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        MAX(dc.fecha_emision) as ultimo_contrato
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (:status IS NULL OR
         (:status = 'active' AND p.activo = 1) OR
         (:status = 'inactive' AND p.activo = 0))
ORDER BY p.razon_social ASC
LIMIT :limit OFFSET :offset;

-- Filtrar por rango de montos
SELECT
    p.id,
    p.razon_social as name,
    CONCAT(p.rut, '-', p.dv) as rif,
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0) as total_amount,
    COALESCE(stats.monto_promedio, 0) as avg_contract_amount
FROM proveedor p
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        COUNT(dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        AVG(COALESCE(dc.total, 0)) as monto_promedio
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (:min_amount IS NULL OR COALESCE(stats.total_monto, 0) >= :min_amount)
    AND (:max_amount IS NULL OR COALESCE(stats.total_monto, 0) <= :max_amount)
ORDER BY stats.total_monto DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 5. CONSULTAS PARA EXPORTACIÓN DE DATOS
-- =========================================

-- Exportación completa de proveedores para Excel/CSV
SELECT
    p.id as 'ID',
    c.nombre as 'Comunidad',
    p.razon_social as 'Razón Social',
    CONCAT(p.rut, '-', p.dv) as 'RUT',
    COALESCE(p.giro, 'Sin especificar') as 'Giro/Categoría',
    p.email as 'Email',
    p.telefono as 'Teléfono',
    p.direccion as 'Dirección',
    CASE WHEN p.activo = 1 THEN 'Activo' ELSE 'Inactivo' END as 'Estado',
    COALESCE(stats.total_contratos, 0) as 'Total Contratos',
    COALESCE(stats.total_monto, 0) as 'Monto Total Contratos',
    COALESCE(stats.monto_promedio, 0) as 'Monto Promedio',
    COALESCE(DATE_FORMAT(stats.primer_contrato, '%d/%m/%Y'), '') as 'Primer Contrato',
    COALESCE(DATE_FORMAT(stats.ultimo_contrato, '%d/%m/%Y'), '') as 'Último Contrato',
    DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i') as 'Fecha Creación',
    DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i') as 'Última Modificación'
FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        COUNT(dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        AVG(COALESCE(dc.total, 0)) as monto_promedio,
        MIN(dc.fecha_emision) as primer_contrato,
        MAX(dc.fecha_emision) as ultimo_contrato
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (:status IS NULL OR
         (:status = 'active' AND p.activo = 1) OR
         (:status = 'inactive' AND p.activo = 0))
ORDER BY c.nombre ASC, p.razon_social ASC;

-- Exportación de contratos por proveedor
SELECT
    p.razon_social as 'Proveedor',
    CONCAT(p.rut, '-', p.dv) as 'RUT Proveedor',
    dc.numero_documento as 'Número Documento',
    dc.fecha_emision as 'Fecha Emisión',
    dc.fecha_vencimiento as 'Fecha Vencimiento',
    dc.total as 'Monto Total',
    dc.estado as 'Estado Documento',
    COALESCE(dc.descripcion, '') as 'Descripción',
    c.nombre as 'Comunidad'
FROM proveedor p
INNER JOIN documentos_compra dc ON p.id = dc.proveedor_id
LEFT JOIN comunidad c ON p.comunidad_id = c.id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (:proveedor_id IS NULL OR p.id = :proveedor_id)
    AND (:fecha_desde IS NULL OR dc.fecha_emision >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR dc.fecha_emision <= :fecha_hasta)
ORDER BY p.razon_social ASC, dc.fecha_emision DESC;

-- =========================================
-- 6. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- =========================================

-- Validar RUT duplicado
SELECT
    CONCAT(p.rut, '-', p.dv) as rut_completo,
    COUNT(*) as cantidad,
    GROUP_CONCAT(p.razon_social SEPARATOR '; ') as proveedores
FROM proveedor p
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
GROUP BY CONCAT(p.rut, '-', p.dv)
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- Validar proveedores sin contratos
SELECT
    p.id,
    p.razon_social as name,
    CONCAT(p.rut, '-', p.dv) as rif,
    CASE WHEN p.activo = 1 THEN 'Activo' ELSE 'Inactivo' END as status,
    DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_at,
    DATEDIFF(CURDATE(), p.created_at) as dias_sin_contrato
FROM proveedor p
LEFT JOIN documentos_compra dc ON p.id = dc.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND dc.id IS NULL
ORDER BY p.created_at DESC;

-- Validar proveedores con datos incompletos
SELECT
    p.id,
    p.razon_social as name,
    CASE
        WHEN p.email IS NULL OR p.email = '' THEN 'Sin email'
        ELSE 'Con email'
    END as email_status,
    CASE
        WHEN p.telefono IS NULL OR p.telefono = '' THEN 'Sin teléfono'
        ELSE 'Con teléfono'
    END as phone_status,
    CASE
        WHEN p.direccion IS NULL OR p.direccion = '' THEN 'Sin dirección'
        ELSE 'Con dirección'
    END as address_status,
    CASE WHEN p.activo = 1 THEN 'Activo' ELSE 'Inactivo' END as status
FROM proveedor p
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
    AND (p.email IS NULL OR p.email = '' OR
         p.telefono IS NULL OR p.telefono = '' OR
         p.direccion IS NULL OR p.direccion = '')
ORDER BY p.razon_social ASC;

-- Verificar integridad de datos
SELECT
    'proveedor' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN p.razon_social IS NULL OR p.razon_social = '' THEN 1 END) as razon_social_nula,
    COUNT(CASE WHEN p.rut IS NULL OR p.rut = '' THEN 1 END) as rut_nulo,
    COUNT(CASE WHEN p.dv IS NULL OR p.dv = '' THEN 1 END) as dv_nulo,
    COUNT(CASE WHEN p.comunidad_id IS NULL THEN 1 END) as comunidad_id_nula,
    COUNT(CASE WHEN p.activo NOT IN (0,1) THEN 1 END) as activo_invalido
FROM proveedor p
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id);

-- =========================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =========================================

-- Vista optimizada para listados de proveedores
CREATE OR REPLACE VIEW vista_proveedores_listado AS
SELECT
    p.id,
    p.comunidad_id,
    c.nombre as comunidad_nombre,
    p.razon_social as name,
    p.razon_social as business_name,
    COALESCE(p.giro, 'Sin especificar') as category,
    CONCAT(p.rut, '-', p.dv) as rif,
    COALESCE(p.telefono, '') as phone,
    COALESCE(p.email, '') as email,
    COALESCE(p.direccion, '') as address,
    CASE WHEN p.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    0 as rating,
    '' as logo,
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0) as total_amount,
    COALESCE(DATE_FORMAT(stats.ultimo_contrato, '%Y-%m-%d'), '') as last_contract,
    p.created_at,
    p.updated_at
FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        COUNT(DISTINCT dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        MAX(dc.fecha_emision) as ultimo_contrato
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id;

-- Vista optimizada para detalles de proveedores
CREATE OR REPLACE VIEW vista_proveedores_detalle AS
SELECT
    p.id,
    p.comunidad_id,
    c.nombre as comunidad_nombre,
    p.razon_social as name,
    p.razon_social as business_name,
    COALESCE(p.giro, 'Sin especificar') as category,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) as rif_completo,
    COALESCE(p.telefono, '') as phone,
    COALESCE(p.email, '') as email,
    COALESCE(p.direccion, '') as address,
    CASE WHEN p.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    0 as rating,
    '' as logo,
    COALESCE(stats.total_contratos, 0) as total_contracts,
    COALESCE(stats.total_monto, 0.00) as total_amount,
    COALESCE(stats.monto_promedio, 0.00) as avg_contract_amount,
    COALESCE(stats.total_gastos, 0.00) as total_expenses,
    COALESCE(DATE_FORMAT(stats.primer_contrato, '%Y-%m-%d'), '') as first_contract,
    COALESCE(DATE_FORMAT(stats.ultimo_contrato, '%Y-%m-%d'), '') as last_contract,
    COALESCE(stats_periodo.ultimo_mes, 0.00) as last_month_amount,
    COALESCE(stats_periodo.ultimo_trimestre, 0.00) as last_quarter_amount,
    COALESCE(stats_periodo.ultimo_ano, 0.00) as last_year_amount,
    CASE
        WHEN stats.ultimo_contrato IS NOT NULL AND
             DATEDIFF(CURDATE(), stats.ultimo_contrato) <= 30 THEN 'active_recent'
        WHEN stats.ultimo_contrato IS NOT NULL AND
             DATEDIFF(CURDATE(), stats.ultimo_contrato) <= 90 THEN 'active_quarter'
        WHEN stats.ultimo_contrato IS NOT NULL AND
             DATEDIFF(CURDATE(), stats.ultimo_contrato) <= 365 THEN 'active_year'
        ELSE 'inactive_long'
    END as activity_status,
    p.created_at,
    p.updated_at
FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        COUNT(DISTINCT dc.id) as total_contratos,
        SUM(COALESCE(dc.total, 0)) as total_monto,
        AVG(COALESCE(dc.total, 0)) as monto_promedio,
        SUM(COALESCE(g.monto, 0)) as total_gastos,
        MIN(dc.fecha_emision) as primer_contrato,
        MAX(dc.fecha_emision) as ultimo_contrato
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    LEFT JOIN gasto g ON pr.id = g.proveedor_id
    GROUP BY pr.id
) stats ON p.id = stats.proveedor_id
LEFT JOIN (
    SELECT
        pr.id as proveedor_id,
        SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN COALESCE(dc.total, 0) ELSE 0 END) as ultimo_mes,
        SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) THEN COALESCE(dc.total, 0) ELSE 0 END) as ultimo_trimestre,
        SUM(CASE WHEN dc.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) THEN COALESCE(dc.total, 0) ELSE 0 END) as ultimo_ano
    FROM proveedor pr
    LEFT JOIN documentos_compra dc ON pr.id = dc.proveedor_id
    GROUP BY pr.id
) stats_periodo ON p.id = stats_periodo.proveedor_id;

-- Vista para estadísticas de proveedores
CREATE OR REPLACE VIEW vista_proveedores_estadisticas AS
SELECT
    (:comunidad_id) as comunidad_id,
    COUNT(DISTINCT p.id) as total_proveedores,
    COUNT(DISTINCT CASE WHEN p.activo = 1 THEN p.id END) as proveedores_activos,
    COUNT(DISTINCT CASE WHEN p.activo = 0 THEN p.id END) as proveedores_inactivos,
    COUNT(DISTINCT dc.id) as total_contratos,
    SUM(COALESCE(dc.total, 0)) as monto_total_contratos,
    AVG(COALESCE(dc.total, 0)) as monto_promedio_contrato,
    COUNT(DISTINCT c.id) as comunidades_con_proveedores,
    (SELECT COUNT(DISTINCT pr.id)
     FROM proveedor pr
     INNER JOIN documentos_compra dc2 ON pr.id = dc2.proveedor_id
     WHERE dc2.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
     AND (:comunidad_id IS NULL OR pr.comunidad_id = :comunidad_id)
    ) as proveedores_activos_mes,
    (SELECT SUM(COALESCE(dc3.total, 0))
     FROM documentos_compra dc3
     LEFT JOIN proveedor pr3 ON dc3.proveedor_id = pr3.id
     WHERE dc3.fecha_emision >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
     AND (:comunidad_id IS NULL OR pr3.comunidad_id = :comunidad_id)
    ) as monto_total_mes
FROM proveedor p
LEFT JOIN comunidad c ON p.comunidad_id = c.id
LEFT JOIN documentos_compra dc ON p.id = dc.proveedor_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id);

-- =========================================
-- 8. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_proveedor_comunidad_activo ON proveedor(comunidad_id, activo);
CREATE INDEX idx_proveedor_razon_social ON proveedor(razon_social);
CREATE INDEX idx_proveedor_rut ON proveedor(rut, dv);
CREATE INDEX idx_proveedor_email ON proveedor(email);
CREATE INDEX idx_proveedor_telefono ON proveedor(telefono);
CREATE INDEX idx_proveedor_giro ON proveedor(giro);

-- Índices para documentos de compra
CREATE INDEX idx_documentos_compra_proveedor_fecha ON documentos_compra(proveedor_id, fecha_emision);
CREATE INDEX idx_documentos_compra_fecha_total ON documentos_compra(fecha_emision, total);

-- Índices para gastos relacionados con proveedores
CREATE INDEX idx_gasto_proveedor_fecha ON gasto(proveedor_id, fecha);

-- Índice compuesto para búsquedas complejas
CREATE INDEX idx_proveedor_busqueda ON proveedor(comunidad_id, activo, razon_social, email, telefono);

-- =========================================
-- NOTAS IMPORTANTES:
-- =========================================
--
-- 1. Todas las consultas incluyen filtros opcionales por comunidad_id
-- 2. Se usan COALESCE para manejar campos NULL y mantener compatibilidad
-- 3. Las estadísticas se calculan en tiempo real desde documentos_compra y gastos
-- 4. Los campos rating y logo son placeholders para futuras implementaciones
-- 5. Las vistas optimizadas mejoran el rendimiento de consultas frecuentes
-- 6. Los índices recomendados aceleran las búsquedas y filtros
-- 7. Todas las consultas están parametrizadas para prevenir SQL injection
-- 8. Se incluyen validaciones para mantener integridad de datos
-- 9. Las exportaciones generan formatos compatibles con Excel/CSV
-- 10. Las estadísticas incluyen análisis temporal (mes, trimestre, año)
--
-- =========================================