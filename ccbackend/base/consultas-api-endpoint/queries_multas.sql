-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO MULTAS
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de multas con filtros
SELECT
    m.id,
    m.numero,
    c.razon_social as comunidad,
    u.numero as unidad_numero,
    COALESCE(t.nombre, '') as torre,
    COALESCE(e.nombre, '') as edificio,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    m.tipo_infraccion,
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha_infraccion,
    m.fecha_vencimiento,
    m.fecha_pago,
    m.created_at,
    m.updated_at,
    -- Calcular días de vencimiento
    CASE
        WHEN m.estado IN ('pagado', 'anulada') THEN NULL
        WHEN CURDATE() > m.fecha_vencimiento THEN DATEDIFF(CURDATE(), m.fecha_vencimiento)
        ELSE DATEDIFF(m.fecha_vencimiento, CURDATE())
    END as dias_vencimiento,
    -- Estado de vencimiento
    CASE
        WHEN m.estado IN ('pagado', 'anulada') THEN 'finalizado'
        WHEN CURDATE() > m.fecha_vencimiento THEN 'vencido'
        WHEN DATEDIFF(m.fecha_vencimiento, CURDATE()) <= 7 THEN 'proximo_vencer'
        ELSE 'vigente'
    END as estado_vencimiento
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE
    (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR m.estado = :estado) AND
    (:prioridad IS NULL OR m.prioridad = :prioridad) AND
    (:tipo_infraccion IS NULL OR m.tipo_infraccion LIKE CONCAT('%', :tipo_infraccion, '%')) AND
    (:fecha_desde IS NULL OR m.fecha_infraccion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR m.fecha_infraccion <= :fecha_hasta) AND
    (:monto_min IS NULL OR m.monto >= :monto_min) AND
    (:monto_max IS NULL OR m.monto <= :monto_max)
ORDER BY m.fecha_infraccion DESC, m.created_at DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de multas por comunidad con estadísticas
SELECT
    c.razon_social as comunidad,
    COUNT(m.id) as total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN m.estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN m.estado = 'vencido' THEN 1 END) as vencidas,
    COUNT(CASE WHEN m.estado = 'apelada' THEN 1 END) as apeladas,
    COUNT(CASE WHEN m.estado = 'anulada' THEN 1 END) as anuladas,
    SUM(m.monto) as monto_total,
    AVG(m.monto) as monto_promedio,
    MAX(m.fecha_infraccion) as ultima_multa
FROM comunidad c
LEFT JOIN multa m ON c.id = m.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Multas próximas a vencer (7 días)
SELECT
    m.id,
    m.numero,
    c.razon_social as comunidad,
    u.numero as unidad,
    m.tipo_infraccion,
    m.monto,
    m.fecha_vencimiento,
    DATEDIFF(m.fecha_vencimiento, CURDATE()) as dias_restantes,
    CASE
        WHEN DATEDIFF(m.fecha_vencimiento, CURDATE()) <= 0 THEN 'vencida'
        WHEN DATEDIFF(m.fecha_vencimiento, CURDATE()) <= 3 THEN 'critica'
        ELSE 'advertencia'
    END as urgencia
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
WHERE m.estado = 'pendiente'
    AND m.fecha_vencimiento >= CURDATE()
    AND DATEDIFF(m.fecha_vencimiento, CURDATE()) <= 7
ORDER BY m.fecha_vencimiento ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una multa específica
SELECT
    m.id,
    m.numero,
    c.id as comunidad_id,
    c.razon_social as comunidad_nombre,
    u.id as unidad_id,
    u.numero as unidad_numero,
    t.nombre as torre_nombre,
    e.nombre as edificio_nombre,
    p.id as persona_id,
    CONCAT(p.nombres, ' ', p.apellidos) as propietario_nombre,
    p.email as propietario_email,
    p.telefono as propietario_telefono,
    m.tipo_infraccion,
    m.descripcion,
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha_infraccion,
    m.fecha_vencimiento,
    m.fecha_pago,
    m.fecha_anulacion,
    m.motivo_anulacion,
    m.anulado_por,
    COALESCE(ua.username, '') as anulado_por_username,
    m.created_at,
    m.updated_at,
    -- Información adicional calculada
    CASE
        WHEN m.estado = 'pagado' THEN 'Pagada'
        WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha_vencimiento THEN 'Vencida'
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        WHEN m.estado = 'vencido' THEN 'Vencida'
        WHEN m.estado = 'apelada' THEN 'Apelada'
        WHEN m.estado = 'anulada' THEN 'Anulada'
    END as estado_descripcion,
    DATEDIFF(CURDATE(), m.fecha_infraccion) as dias_desde_infraccion,
    CASE
        WHEN m.fecha_pago IS NOT NULL THEN DATEDIFF(m.fecha_pago, m.fecha_infraccion)
        ELSE NULL
    END as dias_para_pagar
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario ua ON m.anulado_por = ua.id
WHERE m.id = :multa_id;

-- 2.2 Vista de multas con información completa para frontend
SELECT
    m.id,
    m.numero,
    JSON_OBJECT(
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social,
            'direccion', c.direccion
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'numero', u.numero,
                'torre', t.nombre,
                'edificio', e.nombre
            )
            ELSE NULL
        END,
        'propietario', CASE
            WHEN p.id IS NOT NULL THEN JSON_OBJECT(
                'id', p.id,
                'nombre', CONCAT(p.nombres, ' ', p.apellidos),
                'email', p.email,
                'telefono', p.telefono
            )
            ELSE NULL
        END,
        'multa', JSON_OBJECT(
            'tipo_infraccion', m.tipo_infraccion,
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'prioridad', m.prioridad,
            'fecha_infraccion', m.fecha_infraccion,
            'fecha_vencimiento', m.fecha_vencimiento,
            'fecha_pago', m.fecha_pago,
            'fecha_anulacion', m.fecha_anulacion,
            'motivo_anulacion', m.motivo_anulacion
        ),
        'fechas', JSON_OBJECT(
            'creado', m.created_at,
            'actualizado', m.updated_at
        )
    ) as informacion_completa
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id
ORDER BY m.fecha_infraccion DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de multas
SELECT
    COUNT(*) as total_multas,
    COUNT(DISTINCT comunidad_id) as comunidades_con_multas,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as multas_pendientes,
    COUNT(CASE WHEN estado = 'pagado' THEN 1 END) as multas_pagadas,
    COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as multas_vencidas,
    COUNT(CASE WHEN estado = 'apelada' THEN 1 END) as multas_apeladas,
    COUNT(CASE WHEN estado = 'anulada' THEN 1 END) as multas_anuladas,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio,
    MIN(monto) as monto_minimo,
    MAX(monto) as monto_maximo,
    MIN(fecha_infraccion) as primera_multa,
    MAX(fecha_infraccion) as ultima_multa
FROM multa;

-- 3.2 Estadísticas por tipo de infracción
SELECT
    tipo_infraccion,
    COUNT(*) as cantidad,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio,
    COUNT(CASE WHEN estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as vencidas,
    ROUND(
        (COUNT(CASE WHEN estado = 'pagado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_cobranza
FROM multa
GROUP BY tipo_infraccion
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por prioridad
SELECT
    prioridad,
    COUNT(*) as cantidad,
    SUM(monto) as monto_total,
    AVG(monto) as monto_promedio,
    COUNT(CASE WHEN estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as vencidas,
    ROUND(
        (COUNT(CASE WHEN estado = 'pagado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_cobranza
FROM multa
GROUP BY prioridad
ORDER BY
    CASE prioridad
        WHEN 'critica' THEN 1
        WHEN 'alta' THEN 2
        WHEN 'media' THEN 3
        WHEN 'baja' THEN 4
    END;

-- 3.4 Estadísticas mensuales de multas
SELECT
    YEAR(fecha_infraccion) as anio,
    MONTH(fecha_infraccion) as mes,
    COUNT(*) as total_multas,
    SUM(monto) as monto_total,
    COUNT(CASE WHEN estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as vencidas,
    ROUND(
        (COUNT(CASE WHEN estado = 'pagado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_cobranza
FROM multa
WHERE fecha_infraccion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(fecha_infraccion), MONTH(fecha_infraccion)
ORDER BY anio DESC, mes DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de multas
SELECT
    m.id,
    m.numero,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    m.tipo_infraccion,
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha_infraccion,
    m.fecha_vencimiento,
    -- Información adicional para filtros
    CASE
        WHEN m.estado = 'pagado' THEN 'Pagada'
        WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha_vencimiento THEN 'Vencida'
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        ELSE m.estado
    END as estado_actual,
    DATEDIFF(CURDATE(), m.fecha_infraccion) as antiguedad_dias
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE
    (:busqueda IS NULL OR
     m.numero LIKE CONCAT('%', :busqueda, '%') OR
     m.tipo_infraccion LIKE CONCAT('%', :busqueda, '%') OR
     CONCAT(p.nombres, ' ', p.apellidos) LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR m.estado = :estado) AND
    (:prioridad IS NULL OR m.prioridad = :prioridad) AND
    (:tipo_infraccion IS NULL OR m.tipo_infraccion LIKE CONCAT('%', :tipo_infraccion, '%')) AND
    (:fecha_desde IS NULL OR m.fecha_infraccion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR m.fecha_infraccion <= :fecha_hasta) AND
    (:monto_min IS NULL OR m.monto >= :monto_min) AND
    (:monto_max IS NULL OR m.monto <= :monto_max) AND
    (:dias_vencimiento IS NULL OR (
        CASE
            WHEN m.estado IN ('pagado', 'anulada') THEN NULL
            WHEN CURDATE() > m.fecha_vencimiento THEN DATEDIFF(CURDATE(), m.fecha_vencimiento)
            ELSE DATEDIFF(m.fecha_vencimiento, CURDATE())
        END <= :dias_vencimiento
    ))
ORDER BY m.fecha_infraccion DESC, m.created_at DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Multas por propietario con estadísticas
SELECT
    p.id as persona_id,
    CONCAT(p.nombres, ' ', p.apellidos) as propietario,
    p.email,
    COUNT(m.id) as total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN m.estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN m.estado = 'vencido' THEN 1 END) as vencidas,
    SUM(m.monto) as monto_total,
    AVG(m.monto) as monto_promedio,
    MAX(m.fecha_infraccion) as ultima_multa,
    MIN(m.fecha_infraccion) as primera_multa
FROM persona p
LEFT JOIN multa m ON p.id = m.persona_id
WHERE (:comunidad_id IS NULL OR p.comunidad_id = :comunidad_id)
GROUP BY p.id, p.nombres, p.apellidos, p.email
HAVING COUNT(m.id) > 0
ORDER BY total_multas DESC, monto_total DESC;

-- 4.3 Multas por unidad
SELECT
    u.id as unidad_id,
    u.numero as unidad_numero,
    t.nombre as torre,
    e.nombre as edificio,
    c.razon_social as comunidad,
    COUNT(m.id) as total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN m.estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN m.estado = 'vencido' THEN 1 END) as vencidas,
    SUM(m.monto) as monto_total,
    AVG(m.monto) as monto_promedio,
    MAX(m.fecha_infraccion) as ultima_multa
FROM unidad u
JOIN torre t ON u.torre_id = t.id
JOIN edificio e ON t.edificio_id = e.id
JOIN comunidad c ON e.comunidad_id = c.id
LEFT JOIN multa m ON u.id = m.unidad_id
GROUP BY u.id, u.numero, t.nombre, e.nombre, c.razon_social
HAVING COUNT(m.id) > 0
ORDER BY total_multas DESC;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de multas para Excel/CSV
SELECT
    m.id as 'ID',
    m.numero as 'Número',
    c.razon_social as 'Comunidad',
    COALESCE(u.numero, '') as 'Unidad',
    COALESCE(t.nombre, '') as 'Torre',
    COALESCE(e.nombre, '') as 'Edificio',
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as 'Propietario',
    COALESCE(p.email, '') as 'Email Propietario',
    m.tipo_infraccion as 'Tipo Infracción',
    m.descripcion as 'Descripción',
    m.monto as 'Monto',
    m.estado as 'Estado',
    m.prioridad as 'Prioridad',
    DATE_FORMAT(m.fecha_infraccion, '%Y-%m-%d') as 'Fecha Infracción',
    DATE_FORMAT(m.fecha_vencimiento, '%Y-%m-%d') as 'Fecha Vencimiento',
    DATE_FORMAT(m.fecha_pago, '%Y-%m-%d') as 'Fecha Pago',
    DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') as 'Fecha Creación',
    DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') as 'Última Actualización'
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id
ORDER BY c.razon_social, m.fecha_infraccion DESC;

-- 5.2 Exportación de multas pendientes
SELECT
    m.numero as 'Número Multa',
    c.razon_social as 'Comunidad',
    u.numero as 'Unidad',
    CONCAT(p.nombres, ' ', p.apellidos) as 'Propietario',
    m.tipo_infraccion as 'Infracción',
    m.monto as 'Monto',
    DATE_FORMAT(m.fecha_vencimiento, '%Y-%m-%d') as 'Vence',
    DATEDIFF(m.fecha_vencimiento, CURDATE()) as 'Días Restantes',
    CASE
        WHEN DATEDIFF(m.fecha_vencimiento, CURDATE()) <= 0 THEN 'VENCIDA'
        WHEN DATEDIFF(m.fecha_vencimiento, CURDATE()) <= 7 THEN 'URGENTE'
        ELSE 'PENDIENTE'
    END as 'Estado Urgencia'
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE m.estado = 'pendiente'
ORDER BY m.fecha_vencimiento ASC;

-- 5.3 Exportación de estadísticas de cobranza
SELECT
    YEAR(m.fecha_infraccion) as 'Año',
    MONTH(m.fecha_infraccion) as 'Mes',
    COUNT(*) as 'Total Multas',
    COUNT(CASE WHEN m.estado = 'pagado' THEN 1 END) as 'Pagadas',
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) as 'Pendientes',
    COUNT(CASE WHEN m.estado = 'vencido' THEN 1 END) as 'Vencidas',
    SUM(m.monto) as 'Monto Total',
    SUM(CASE WHEN m.estado = 'pagado' THEN m.monto ELSE 0 END) as 'Monto Cobrado',
    ROUND(
        (COUNT(CASE WHEN m.estado = 'pagado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as 'Porcentaje Cobranza (%)'
FROM multa m
WHERE m.fecha_infraccion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(m.fecha_infraccion), MONTH(m.fecha_infraccion)
ORDER BY YEAR(m.fecha_infraccion) DESC, MONTH(m.fecha_infraccion) DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de multas
SELECT
    'Multas sin comunidad' as validacion,
    COUNT(*) as cantidad
FROM multa m
LEFT JOIN comunidad c ON m.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Multas sin unidad' as validacion,
    COUNT(*) as cantidad
FROM multa m
LEFT JOIN unidad u ON m.unidad_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Multas con montos negativos o cero' as validacion,
    COUNT(*) as cantidad
FROM multa
WHERE monto <= 0
UNION ALL
SELECT
    'Multas con fechas de vencimiento pasadas para estado pendiente' as validacion,
    COUNT(*) as cantidad
FROM multa
WHERE estado = 'pendiente' AND fecha_vencimiento < CURDATE()
UNION ALL
SELECT
    'Multas pagadas sin fecha de pago' as validacion,
    COUNT(*) as cantidad
FROM multa
WHERE estado = 'pagado' AND fecha_pago IS NULL
UNION ALL
SELECT
    'Multas anuladas sin motivo' as validacion,
    COUNT(*) as cantidad
FROM multa
WHERE estado = 'anulada' AND (motivo_anulacion IS NULL OR motivo_anulacion = '')
UNION ALL
SELECT
    'Números de multa duplicados' as validacion,
    COUNT(*) as cantidad
FROM (
    SELECT numero, COUNT(*) as cnt
    FROM multa
    GROUP BY numero
    HAVING cnt > 1
) duplicados;

-- 6.2 Validar consistencia de estados y fechas
SELECT
    'Inconsistencias en estados y fechas' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Multa ', m.numero, ': estado ', m.estado, ' pero fecha inconsistente')
        SEPARATOR '; '
    ) as detalles
FROM multa m
WHERE
    (estado = 'pagado' AND fecha_pago IS NULL) OR
    (estado = 'anulada' AND (fecha_anulacion IS NULL OR motivo_anulacion IS NULL)) OR
    (estado = 'pendiente' AND fecha_vencimiento < CURDATE() - INTERVAL 30 DAY);

-- 6.3 Validar rangos de montos por tipo de infracción
SELECT
    tipo_infraccion,
    COUNT(*) as total_multas,
    AVG(monto) as monto_promedio,
    MIN(monto) as monto_minimo,
    MAX(monto) as monto_maximo,
    CASE
        WHEN AVG(monto) < 1000 THEN 'Montos muy bajos'
        WHEN AVG(monto) > 500000 THEN 'Montos muy altos'
        ELSE 'Montos normales'
    END as evaluacion_rango
FROM multa
GROUP BY tipo_infraccion
HAVING COUNT(*) > 1
ORDER BY monto_promedio DESC;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de multas
CREATE OR REPLACE VIEW vista_multas_listado AS
SELECT
    m.id,
    m.numero,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    m.tipo_infraccion,
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha_infraccion,
    m.fecha_vencimiento,
    CASE
        WHEN m.estado IN ('pagado', 'anulada') THEN NULL
        WHEN CURDATE() > m.fecha_vencimiento THEN DATEDIFF(CURDATE(), m.fecha_vencimiento)
        ELSE DATEDIFF(m.fecha_vencimiento, CURDATE())
    END as dias_vencimiento
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id;

-- 7.2 Vista para estadísticas de multas por comunidad
CREATE OR REPLACE VIEW vista_multas_estadisticas AS
SELECT
    c.razon_social as comunidad,
    COUNT(m.id) as total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN m.estado = 'pagado' THEN 1 END) as pagadas,
    COUNT(CASE WHEN m.estado = 'vencido' THEN 1 END) as vencidas,
    SUM(m.monto) as monto_total,
    AVG(m.monto) as monto_promedio,
    MAX(m.fecha_infraccion) as ultima_multa
FROM comunidad c
LEFT JOIN multa m ON c.id = m.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para multas con información completa
CREATE OR REPLACE VIEW vista_multas_completas AS
SELECT
    m.id,
    m.numero,
    JSON_OBJECT(
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'numero', u.numero,
                'torre', t.nombre,
                'edificio', e.nombre
            )
            ELSE NULL
        END,
        'propietario', CASE
            WHEN p.id IS NOT NULL THEN JSON_OBJECT(
                'id', p.id,
                'nombre', CONCAT(p.nombres, ' ', p.apellidos),
                'email', p.email
            )
            ELSE NULL
        END,
        'multa', JSON_OBJECT(
            'tipo_infraccion', m.tipo_infraccion,
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'prioridad', m.prioridad,
            'fecha_infraccion', m.fecha_infraccion,
            'fecha_vencimiento', m.fecha_vencimiento,
            'fecha_pago', m.fecha_pago
        )
    ) as informacion_completa
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_multa_comunidad_id ON multa(comunidad_id);
CREATE INDEX idx_multa_unidad_id ON multa(unidad_id);
CREATE INDEX idx_multa_persona_id ON multa(persona_id);
CREATE INDEX idx_multa_estado ON multa(estado);
CREATE INDEX idx_multa_prioridad ON multa(prioridad);
CREATE INDEX idx_multa_fecha_infraccion ON multa(fecha_infraccion DESC);
CREATE INDEX idx_multa_fecha_vencimiento ON multa(fecha_vencimiento);
CREATE INDEX idx_multa_tipo_infraccion ON multa(tipo_infraccion);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_multa_comunidad_estado ON multa(comunidad_id, estado);
CREATE INDEX idx_multa_estado_fecha ON multa(estado, fecha_infraccion DESC);
CREATE INDEX idx_multa_comunidad_tipo ON multa(comunidad_id, tipo_infraccion);
CREATE INDEX idx_multa_fecha_rango ON multa(fecha_infraccion, fecha_vencimiento);

-- Índice para búsquedas por número
CREATE INDEX idx_multa_numero ON multa(numero);

-- Índices para validaciones
CREATE INDEX idx_multa_monto ON multa(monto);
CREATE INDEX idx_multa_fecha_pago ON multa(fecha_pago);

-- Índice para estadísticas mensuales
CREATE INDEX idx_multa_anio_mes ON multa(YEAR(fecha_infraccion), MONTH(fecha_infraccion));