-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO MULTAS
-- Sistema: Cuentas Claras (Basado en el esquema 'multa')
-- =========================================
-- NOTA DE CORRECCIÓN: Se ajustaron nombres de columna de 'multa' (fecha_infraccion -> fecha, tipo_infraccion -> motivo, numero -> id).
-- Se ajustó la referencia de unidad a u.codigo.
-- Se eliminó el estado ENUM 'vencido' y 'apelada'.

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de multas con filtros
SELECT
    m.id,
    m.id AS numero, -- CORRECCIÓN: Se usa ID como número único
    c.razon_social AS comunidad,
    u.codigo AS unidad_codigo, -- CORRECCIÓN: Usar u.codigo
    COALESCE(t.nombre, '') AS torre,
    COALESCE(e.nombre, '') AS edificio,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS propietario,
    m.motivo AS tipo_infraccion, -- CORRECCIÓN: Usar m.motivo
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha AS fecha_infraccion, -- CORRECCIÓN: Usar m.fecha
    -- NOTA: No existe m.fecha_vencimiento en el esquema. Se simula para la lógica de vencimiento.
    m.fecha AS fecha_vencimiento, -- SIMULADO/AJUSTE
    m.fecha_pago,
    m.created_at,
    m.updated_at,
    -- Calcular días de vencimiento (Basado en m.fecha, ya que no existe m.fecha_vencimiento)
    CASE
        WHEN m.estado IN ('pagada', 'anulada') THEN NULL
        WHEN CURDATE() > m.fecha THEN DATEDIFF(CURDATE(), m.fecha) -- Días vencido (desde fecha de infracción)
        ELSE DATEDIFF(m.fecha, CURDATE()) -- Días para vencer (simulado)
    END AS dias_vencimiento,
    -- Estado de vencimiento (Basado en m.fecha)
    CASE
        WHEN m.estado IN ('pagada', 'anulada') THEN 'finalizado'
        WHEN CURDATE() > m.fecha THEN 'vencido'
        WHEN DATEDIFF(m.fecha, CURDATE()) <= 7 THEN 'proximo_vencer'
        ELSE 'vigente'
    END AS estado_vencimiento
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON u.edificio_id = e.id -- CORRECCIÓN: Join edificio directamente desde unidad
LEFT JOIN persona p ON m.persona_id = p.id
WHERE
    (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR m.estado = :estado) AND
    (:prioridad IS NULL OR m.prioridad = :prioridad) AND
    (:tipo_infraccion IS NULL OR m.motivo LIKE CONCAT('%', :tipo_infraccion, '%')) AND -- CORRECCIÓN: Usar m.motivo
    (:fecha_desde IS NULL OR m.fecha >= :fecha_desde) AND -- CORRECCIÓN: Usar m.fecha
    (:fecha_hasta IS NULL OR m.fecha <= :fecha_hasta) AND -- CORRECCIÓN: Usar m.fecha
    (:monto_min IS NULL OR m.monto >= :monto_min) AND
    (:monto_max IS NULL OR m.monto <= :monto_max)
ORDER BY m.fecha DESC, m.created_at DESC -- CORRECCIÓN: Usar m.fecha
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de multas por comunidad con estadísticas
SELECT
    c.razon_social AS comunidad,
    COUNT(m.id) AS total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas, -- CORRECCIÓN: Estado calculado
    COUNT(ma.id) AS apeladas, -- CORRECCIÓN: Se cuenta apelaciones de la tabla multa_apelacion
    COUNT(CASE WHEN m.estado = 'anulada' THEN 1 END) AS anuladas,
    SUM(m.monto) AS monto_total,
    AVG(m.monto) AS monto_promedio,
    MAX(m.fecha) AS ultima_multa -- CORRECCIÓN: Usar m.fecha
FROM comunidad c
LEFT JOIN multa m ON c.id = m.comunidad_id
LEFT JOIN multa_apelacion ma ON m.id = ma.multa_id -- CORRECCIÓN: Join a multa_apelacion
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Multas próximas a vencer (7 días)
-- NOTA: Se usa m.fecha como fecha de vencimiento simulada.
SELECT
    m.id,
    m.id AS numero,
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    m.motivo AS tipo_infraccion, -- CORRECCIÓN: Usar m.motivo
    m.monto,
    m.fecha AS fecha_vencimiento, -- SIMULADO
    DATEDIFF(m.fecha, CURDATE()) AS dias_restantes, -- SIMULADO
    CASE
        WHEN DATEDIFF(m.fecha, CURDATE()) <= 0 THEN 'vencida'
        WHEN DATEDIFF(m.fecha, CURDATE()) <= 3 THEN 'critica'
        ELSE 'advertencia'
    END AS urgencia
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
WHERE m.estado = 'pendiente'
    AND m.fecha >= CURDATE()
    AND DATEDIFF(m.fecha, CURDATE()) <= 7
ORDER BY m.fecha ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una multa específica
SELECT
    m.id,
    m.id AS numero,
    c.id AS comunidad_id,
    c.razon_social AS comunidad_nombre,
    u.id AS unidad_id,
    u.codigo AS unidad_codigo, -- CORRECCIÓN: Usar u.codigo
    t.nombre AS torre_nombre,
    e.nombre AS edificio_nombre,
    p.id AS persona_id,
    CONCAT(p.nombres, ' ', p.apellidos) AS propietario_nombre,
    p.email AS propietario_email,
    p.telefono AS propietario_telefono,
    m.motivo AS tipo_infraccion, -- CORRECCIÓN: Usar m.motivo
    m.descripcion,
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha AS fecha_infraccion, -- CORRECCIÓN: Usar m.fecha
    m.fecha AS fecha_vencimiento, -- SIMULADO
    m.fecha_pago,
    NULL AS fecha_anulacion, -- CORRECCIÓN: Columna no existe, se usa NULL
    NULL AS motivo_anulacion, -- CORRECCIÓN: Columna no existe, se usa NULL
    m.anulado_por,
    COALESCE(ua.username, '') AS anulado_por_username,
    m.created_at,
    m.updated_at,
    -- Información adicional calculada
    CASE
        WHEN m.estado = 'pagada' THEN 'Pagada'
        WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 'Vencida' -- CORRECCIÓN: Basado en m.fecha
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        WHEN m.estado = 'anulada' THEN 'Anulada'
    END AS estado_descripcion,
    DATEDIFF(CURDATE(), m.fecha) AS dias_desde_infraccion, -- CORRECCIÓN: Usar m.fecha
    CASE
        WHEN m.fecha_pago IS NOT NULL THEN DATEDIFF(m.fecha_pago, m.fecha)
        ELSE NULL
    END AS dias_para_pagar -- CORRECCIÓN: Usar m.fecha
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON u.edificio_id = e.id -- CORRECCIÓN: Join edificio directamente desde unidad
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario ua ON m.anulado_por = ua.id
WHERE m.id = :multa_id;

-- 2.2 Vista de multas con información completa para frontend
SELECT
    m.id,
    m.id AS numero,
    JSON_OBJECT(
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social,
            'direccion', c.direccion
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'numero', u.codigo, -- CORRECCIÓN: Usar u.codigo
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
            'tipo_infraccion', m.motivo, -- CORRECCIÓN: Usar m.motivo
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'prioridad', m.prioridad,
            'fecha_infraccion', m.fecha, -- CORRECCIÓN: Usar m.fecha
            'fecha_vencimiento', m.fecha, -- SIMULADO
            'fecha_pago', m.fecha_pago,
            'fecha_anulacion', NULL, -- CORRECCIÓN: Columna no existe
            'motivo_anulacion', NULL -- CORRECCIÓN: Columna no existe
        ),
        'fechas', JSON_OBJECT(
            'creado', m.created_at,
            'actualizado', m.updated_at
        )
    ) AS informacion_completa
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON u.edificio_id = e.id -- CORRECCIÓN: Join edificio directamente desde unidad
LEFT JOIN persona p ON m.persona_id = p.id
ORDER BY m.fecha DESC; -- CORRECCIÓN: Usar m.fecha

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de multas
SELECT
    COUNT(*) AS total_multas,
    COUNT(DISTINCT comunidad_id) AS comunidades_con_multas,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS multas_pendientes,
    COUNT(CASE WHEN estado = 'pagada' THEN 1 END) AS multas_pagadas,
    COUNT(CASE WHEN estado = 'pendiente' AND CURDATE() > fecha THEN 1 END) AS multas_vencidas, -- CORRECCIÓN: Estado calculado
    COUNT(ma.id) AS multas_apeladas, -- CORRECCIÓN: Contar desde multa_apelacion
    COUNT(CASE WHEN estado = 'anulada' THEN 1 END) AS multas_anuladas,
    SUM(monto) AS monto_total,
    AVG(monto) AS monto_promedio,
    MIN(monto) AS monto_minimo,
    MAX(monto) AS monto_maximo,
    MIN(fecha) AS primera_multa, -- CORRECCIÓN: Usar m.fecha
    MAX(fecha) AS ultima_multa -- CORRECCIÓN: Usar m.fecha
FROM multa m
LEFT JOIN multa_apelacion ma ON m.id = ma.multa_id; -- CORRECCIÓN: Join para contar apelaciones

-- 3.2 Estadísticas por tipo de infracción
SELECT
    m.motivo AS tipo_infraccion, -- CORRECCIÓN: Usar m.motivo
    COUNT(m.id) AS cantidad,
    SUM(m.monto) AS monto_total,
    AVG(m.monto) AS monto_promedio,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas, -- CORRECCIÓN: Estado calculado
    ROUND(
        (COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS porcentaje_cobranza
FROM multa m
GROUP BY m.motivo
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por prioridad
SELECT
    prioridad,
    COUNT(*) AS cantidad,
    SUM(monto) AS monto_total,
    AVG(monto) AS monto_promedio,
    COUNT(CASE WHEN estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN estado = 'pendiente' AND CURDATE() > fecha THEN 1 END) AS vencidas, -- CORRECCIÓN: Estado calculado
    ROUND(
        (COUNT(CASE WHEN estado = 'pagada' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS porcentaje_cobranza
FROM multa
GROUP BY prioridad
ORDER BY
    CASE prioridad
        WHEN 'critica' THEN 1 -- CORRECCIÓN: 'critica' no existe en el ENUM, se usa 'alta' o 'media'
        WHEN 'alta' THEN 2
        WHEN 'media' THEN 3
        WHEN 'baja' THEN 4
        ELSE 5
    END;

-- 3.4 Estadísticas mensuales de multas
SELECT
    YEAR(fecha) AS anio, -- CORRECCIÓN: Usar m.fecha
    MONTH(fecha) AS mes, -- CORRECCIÓN: Usar m.fecha
    COUNT(*) AS total_multas,
    SUM(monto) AS monto_total,
    COUNT(CASE WHEN estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN estado = 'pendiente' AND CURDATE() > fecha THEN 1 END) AS vencidas, -- CORRECCIÓN: Estado calculado
    ROUND(
        (COUNT(CASE WHEN estado = 'pagada' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS porcentaje_cobranza
FROM multa
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY anio DESC, mes DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de multas
SELECT
    m.id,
    m.id AS numero,
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS propietario,
    m.motivo AS tipo_infraccion, -- CORRECCIÓN: Usar m.motivo
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha AS fecha_infraccion, -- CORRECCIÓN: Usar m.fecha
    m.fecha AS fecha_vencimiento, -- SIMULADO
    -- Información adicional para filtros
    CASE
        WHEN m.estado = 'pagada' THEN 'Pagada'
        WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 'Vencida'
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        ELSE m.estado
    END AS estado_actual,
    DATEDIFF(CURDATE(), m.fecha) AS antiguedad_dias
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE
    (:busqueda IS NULL OR
     m.id LIKE CONCAT('%', :busqueda, '%') OR -- CORRECCIÓN: Buscar por ID
     m.motivo LIKE CONCAT('%', :busqueda, '%') OR -- CORRECCIÓN: Usar m.motivo
     CONCAT(p.nombres, ' ', p.apellidos) LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR m.estado = :estado) AND
    (:prioridad IS NULL OR m.prioridad = :prioridad) AND
    (:tipo_infraccion IS NULL OR m.motivo LIKE CONCAT('%', :tipo_infraccion, '%')) AND
    (:fecha_desde IS NULL OR m.fecha >= :fecha_desde) AND -- CORRECCIÓN: Usar m.fecha
    (:fecha_hasta IS NULL OR m.fecha <= :fecha_hasta) AND -- CORRECCIÓN: Usar m.fecha
    (:monto_min IS NULL OR m.monto >= :monto_min) AND
    (:monto_max IS NULL OR m.monto <= :monto_max) AND
    -- Filtro de días de vencimiento (SIMULADO)
    (:dias_vencimiento IS NULL OR (
        CASE
            WHEN m.estado IN ('pagada', 'anulada') THEN NULL
            WHEN CURDATE() > m.fecha THEN DATEDIFF(CURDATE(), m.fecha)
            ELSE DATEDIFF(m.fecha, CURDATE())
        END <= :dias_vencimiento
    ))
ORDER BY m.fecha DESC, m.created_at DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Multas por propietario con estadísticas
SELECT
    p.id AS persona_id,
    CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
    p.email,
    COUNT(m.id) AS total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas, -- CORRECCIÓN: Estado calculado
    SUM(m.monto) AS monto_total,
    AVG(m.monto) AS monto_promedio,
    MAX(m.fecha) AS ultima_multa, -- CORRECCIÓN: Usar m.fecha
    MIN(m.fecha) AS primera_multa -- CORRECCIÓN: Usar m.fecha
FROM persona p
LEFT JOIN multa m ON p.id = m.persona_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) -- CORRECCIÓN: El filtro debe ser por multa.comunidad_id
GROUP BY p.id, p.nombres, p.apellidos, p.email
HAVING COUNT(m.id) > 0
ORDER BY total_multas DESC, monto_total DESC;

-- 4.3 Multas por unidad
SELECT
    u.id AS unidad_id,
    u.codigo AS unidad_codigo, -- CORRECCIÓN: Usar u.codigo
    t.nombre AS torre,
    e.nombre AS edificio,
    c.razon_social AS comunidad,
    COUNT(m.id) AS total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas, -- CORRECCIÓN: Estado calculado
    SUM(m.monto) AS monto_total,
    AVG(m.monto) AS monto_promedio,
    MAX(m.fecha) AS ultima_multa -- CORRECCIÓN: Usar m.fecha
FROM unidad u
LEFT JOIN torre t ON u.torre_id = t.id -- CORRECCIÓN: De LEFT JOIN a JOIN (si u.torre_id es NOT NULL)
LEFT JOIN edificio e ON u.edificio_id = e.id -- CORRECCIÓN: Join edificio directamente desde unidad
JOIN comunidad c ON u.comunidad_id = c.id -- CORRECCIÓN: Obtener comunidad directamente de unidad
LEFT JOIN multa m ON u.id = m.unidad_id
GROUP BY u.id, u.codigo, t.nombre, e.nombre, c.razon_social
HAVING COUNT(m.id) > 0
ORDER BY total_multas DESC;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de multas para Excel/CSV
SELECT
    m.id AS 'ID',
    m.id AS 'Número',
    c.razon_social AS 'Comunidad',
    COALESCE(u.codigo, '') AS 'Unidad', -- CORRECCIÓN: Usar u.codigo
    COALESCE(t.nombre, '') AS 'Torre',
    COALESCE(e.nombre, '') AS 'Edificio',
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS 'Propietario',
    COALESCE(p.email, '') AS 'Email Propietario',
    m.motivo AS 'Tipo Infracción', -- CORRECCIÓN: Usar m.motivo
    m.descripcion AS 'Descripción',
    m.monto AS 'Monto',
    m.estado AS 'Estado',
    m.prioridad AS 'Prioridad',
    DATE_FORMAT(m.fecha, '%Y-%m-%d') AS 'Fecha Infracción', -- CORRECCIÓN: Usar m.fecha
    m.fecha AS 'Fecha Vencimiento', -- SIMULADO
    DATE_FORMAT(m.fecha_pago, '%Y-%m-%d') AS 'Fecha Pago',
    DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización'
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id
ORDER BY c.razon_social, m.fecha DESC; -- CORRECCIÓN: Usar m.fecha

-- 5.2 Exportación de multas pendientes
SELECT
    m.id AS 'Número Multa',
    c.razon_social AS 'Comunidad',
    u.codigo AS 'Unidad', -- CORRECCIÓN: Usar u.codigo
    CONCAT(p.nombres, ' ', p.apellidos) AS 'Propietario',
    m.motivo AS 'Infracción', -- CORRECCIÓN: Usar m.motivo
    m.monto AS 'Monto',
    m.fecha AS 'Vence', -- SIMULADO
    DATEDIFF(m.fecha, CURDATE()) AS 'Días Restantes', -- SIMULADO
    CASE
        WHEN DATEDIFF(m.fecha, CURDATE()) <= 0 THEN 'VENCIDA'
        WHEN DATEDIFF(m.fecha, CURDATE()) <= 7 THEN 'URGENTE'
        ELSE 'PENDIENTE'
    END AS 'Estado Urgencia'
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE m.estado = 'pendiente'
ORDER BY m.fecha ASC; -- CORRECCIÓN: Usar m.fecha

-- 5.3 Exportación de estadísticas de cobranza
SELECT
    YEAR(m.fecha) AS 'Año', -- CORRECCIÓN: Usar m.fecha
    MONTH(m.fecha) AS 'Mes', -- CORRECCIÓN: Usar m.fecha
    COUNT(*) AS 'Total Multas',
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS 'Pagadas',
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS 'Pendientes',
    COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS 'Vencidas', -- CORRECCIÓN: Estado calculado
    SUM(m.monto) AS 'Monto Total',
    SUM(CASE WHEN m.estado = 'pagada' THEN m.monto ELSE 0 END) AS 'Monto Cobrado',
    ROUND(
        (COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) AS 'Porcentaje Cobranza (%)'
FROM multa m
WHERE m.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY 1 DESC, 2 DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de multas
SELECT
    'Multas sin comunidad' AS validacion,
    COUNT(*) AS cantidad
FROM multa m
LEFT JOIN comunidad c ON m.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Multas sin unidad' AS validacion,
    COUNT(*) AS cantidad
FROM multa m
LEFT JOIN unidad u ON m.unidad_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Multas con montos negativos o cero' AS validacion,
    COUNT(*) AS cantidad
FROM multa
WHERE monto <= 0
UNION ALL
SELECT
    'Multas con fecha de infracción pasada para estado pendiente' AS validacion,
    COUNT(*) AS cantidad
FROM multa
WHERE estado = 'pendiente' AND fecha < CURDATE()
UNION ALL
SELECT
    'Multas pagadas sin fecha de pago' AS validacion,
    COUNT(*) AS cantidad
FROM multa
WHERE estado = 'pagada' AND fecha_pago IS NULL
UNION ALL
SELECT
    'Números de multa duplicados' AS validacion,
    COUNT(*) AS cantidad
FROM (
    SELECT id, COUNT(*) AS cnt
    FROM multa
    GROUP BY id
    HAVING cnt > 1
) AS duplicados;

-- 6.2 Validar consistencia de estados y fechas
SELECT
    'Inconsistencias en estados y fechas' AS validacion,
    COUNT(*) AS cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Multa ', m.id, ': estado ', m.estado, ' pero fecha inconsistente')
        SEPARATOR '; '
    ) AS detalles
FROM multa m
WHERE
    (m.estado = 'pagada' AND m.fecha_pago IS NULL) OR
    (m.estado = 'anulada' AND m.anulado_por IS NULL) OR -- CORRECCIÓN: Se usa anulado_por como proxy
    (m.estado = 'pendiente' AND m.fecha < DATE_SUB(CURDATE(), INTERVAL 30 DAY)); -- CORRECCIÓN: Usar m.fecha

-- 6.3 Validar rangos de montos por tipo de infracción
SELECT
    m.motivo AS tipo_infraccion,
    COUNT(*) AS total_multas,
    AVG(m.monto) AS monto_promedio,
    MIN(m.monto) AS monto_minimo,
    MAX(m.monto) AS monto_maximo,
    CASE
        WHEN AVG(m.monto) < 1000 THEN 'Montos muy bajos'
        WHEN AVG(m.monto) > 500000 THEN 'Montos muy altos'
        ELSE 'Montos normales'
    END AS evaluacion_rango
FROM multa m
GROUP BY m.motivo
HAVING COUNT(*) > 1
ORDER BY monto_promedio DESC;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de multas
CREATE OR REPLACE VIEW vista_multas_listado AS
SELECT
    m.id,
    m.id AS numero,
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS propietario,
    m.motivo AS tipo_infraccion,
    m.monto,
    m.estado,
    m.prioridad,
    m.fecha AS fecha_infraccion,
    m.fecha AS fecha_vencimiento,
    CASE
        WHEN m.estado IN ('pagada', 'anulada') THEN NULL
        WHEN CURDATE() > m.fecha THEN DATEDIFF(CURDATE(), m.fecha)
        ELSE DATEDIFF(m.fecha, CURDATE())
    END AS dias_vencimiento
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id;

-- 7.2 Vista para estadísticas de multas por comunidad
CREATE OR REPLACE VIEW vista_multas_estadisticas AS
SELECT
    c.razon_social AS comunidad,
    COUNT(m.id) AS total_multas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas,
    SUM(m.monto) AS monto_total,
    AVG(m.monto) AS monto_promedio,
    MAX(m.fecha) AS ultima_multa
FROM comunidad c
LEFT JOIN multa m ON c.id = m.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para multas con información completa
CREATE OR REPLACE VIEW vista_multas_completas AS
SELECT
    m.id,
    m.id AS numero,
    JSON_OBJECT(
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'numero', u.codigo,
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
            'tipo_infraccion', m.motivo,
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'prioridad', m.prioridad,
            'fecha_infraccion', m.fecha,
            'fecha_vencimiento', m.fecha,
            'fecha_pago', m.fecha_pago
        )
    ) AS informacion_completa
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON u.edificio_id = e.id
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
CREATE INDEX idx_multa_fecha_infraccion ON multa(fecha DESC);
CREATE INDEX idx_multa_motivo ON multa(motivo); -- CORRECCIÓN: Usar m.motivo

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_multa_comunidad_estado ON multa(comunidad_id, estado);
CREATE INDEX idx_multa_estado_fecha ON multa(estado, fecha DESC);
CREATE INDEX idx_multa_comunidad_motivo ON multa(comunidad_id, motivo);
CREATE INDEX idx_multa_fecha_rango ON multa(fecha); -- Simplificado

-- Índice para búsquedas por número
CREATE INDEX idx_multa_numero ON multa(id); -- CORRECCIÓN: Usar ID como número

-- Índices para validaciones
CREATE INDEX idx_multa_monto ON multa(monto);
CREATE INDEX idx_multa_fecha_pago ON multa(fecha_pago);

-- Índice para estadísticas mensuales
CREATE INDEX idx_multa_anio_mes ON multa(YEAR(fecha), MONTH(fecha));