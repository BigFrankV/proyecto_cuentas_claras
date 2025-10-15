-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO APELACIONES
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de apelaciones con filtros
SELECT
    a.id,
    a.multa_id,
    m.numero as numero_multa,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    a.usuario_id,
    COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), '') as apelante,
    a.motivo,
    a.estado,
    a.fecha_respuesta,
    a.respondido_por,
    COALESCE(CONCAT(ur.nombres, ' ', ur.apellidos), '') as respondedor,
    a.created_at,
    a.updated_at,
    -- Información adicional calculada
    DATEDIFF(CURDATE(), a.created_at) as dias_desde_apelacion,
    CASE
        WHEN a.estado = 'pendiente' THEN 'En revisión'
        WHEN a.estado = 'aprobada' THEN 'Aprobada'
        WHEN a.estado = 'rechazada' THEN 'Rechazada'
    END as estado_descripcion
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON a.usuario_id = uc.id
LEFT JOIN usuario ur ON a.respondido_por = ur.id
WHERE
    (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR a.estado = :estado) AND
    (:fecha_desde IS NULL OR a.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR a.created_at <= :fecha_hasta) AND
    (:usuario_id IS NULL OR a.usuario_id = :usuario_id)
ORDER BY a.created_at DESC, a.id DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de apelaciones por comunidad con estadísticas
SELECT
    c.razon_social as comunidad,
    COUNT(a.id) as total_apelaciones,
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN a.estado = 'aprobada' THEN 1 END) as aprobadas,
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) as rechazadas,
    AVG(DATEDIFF(CURDATE(), a.created_at)) as dias_promedio_resolucion,
    MAX(a.created_at) as ultima_apelacion
FROM comunidad c
LEFT JOIN multa m ON c.id = m.comunidad_id
LEFT JOIN apelacion a ON m.id = a.multa_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Apelaciones pendientes de resolución
SELECT
    a.id,
    a.multa_id,
    m.numero as numero_multa,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    a.motivo,
    a.created_at,
    DATEDIFF(CURDATE(), a.created_at) as dias_pendiente,
    CASE
        WHEN DATEDIFF(CURDATE(), a.created_at) > 30 THEN 'urgente'
        WHEN DATEDIFF(CURDATE(), a.created_at) > 15 THEN 'moderado'
        ELSE 'normal'
    END as nivel_urgencia
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE a.estado = 'pendiente'
ORDER BY a.created_at ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una apelación específica
SELECT
    a.id,
    a.multa_id,
    a.usuario_id,
    a.motivo,
    a.documentos_json,
    a.estado,
    a.respuesta,
    a.respondido_por,
    a.fecha_respuesta,
    a.created_at,
    a.updated_at,
    -- Información de la multa relacionada
    JSON_OBJECT(
        'multa', JSON_OBJECT(
            'id', m.id,
            'numero', m.numero,
            'tipo_infraccion', m.tipo_infraccion,
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'fecha_infraccion', m.fecha_infraccion,
            'fecha_vencimiento', m.fecha_vencimiento
        ),
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
        'apelante', CASE
            WHEN uc.id IS NOT NULL THEN JSON_OBJECT(
                'id', uc.id,
                'nombre', CONCAT(uc.nombres, ' ', uc.apellidos),
                'email', uc.email
            )
            ELSE NULL
        END,
        'respondedor', CASE
            WHEN ur.id IS NOT NULL THEN JSON_OBJECT(
                'id', ur.id,
                'nombre', CONCAT(ur.nombres, ' ', ur.apellidos),
                'email', ur.email
            )
            ELSE NULL
        END
    ) as informacion_completa,
    -- Cálculos adicionales
    DATEDIFF(CURDATE(), a.created_at) as dias_desde_apelacion,
    CASE
        WHEN a.fecha_respuesta IS NOT NULL THEN DATEDIFF(a.fecha_respuesta, a.created_at)
        ELSE NULL
    END as dias_para_resolver
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON a.usuario_id = uc.id
LEFT JOIN usuario ur ON a.respondido_por = ur.id
WHERE a.id = :apelacion_id;

-- 2.2 Vista de apelaciones con información completa para listado
SELECT
    a.id,
    a.multa_id,
    m.numero as numero_multa,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    a.motivo,
    a.estado,
    a.created_at,
    a.fecha_respuesta,
    JSON_OBJECT(
        'apelacion', JSON_OBJECT(
            'id', a.id,
            'motivo', a.motivo,
            'estado', a.estado,
            'fecha_creacion', a.created_at,
            'fecha_respuesta', a.fecha_respuesta
        ),
        'multa', JSON_OBJECT(
            'id', m.id,
            'numero', m.numero,
            'tipo_infraccion', m.tipo_infraccion,
            'monto', m.monto,
            'estado', m.estado
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        )
    ) as informacion_resumida
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
ORDER BY a.created_at DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de apelaciones
SELECT
    COUNT(*) as total_apelaciones,
    COUNT(DISTINCT multa_id) as multas_con_apelacion,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as apelaciones_pendientes,
    COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as apelaciones_aprobadas,
    COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as apelaciones_rechazadas,
    ROUND(
        (COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_aprobacion,
    AVG(CASE WHEN fecha_respuesta IS NOT NULL THEN DATEDIFF(fecha_respuesta, created_at) END) as dias_promedio_resolucion,
    MIN(created_at) as primera_apelacion,
    MAX(created_at) as ultima_apelacion
FROM apelacion;

-- 3.2 Estadísticas por estado
SELECT
    estado,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM apelacion)), 2
    ) as porcentaje,
    AVG(CASE WHEN fecha_respuesta IS NOT NULL THEN DATEDIFF(fecha_respuesta, created_at) END) as dias_promedio_resolucion,
    MIN(created_at) as mas_antigua,
    MAX(created_at) as mas_reciente
FROM apelacion
GROUP BY estado
ORDER BY cantidad DESC;

-- 3.3 Estadísticas mensuales de apelaciones
SELECT
    YEAR(created_at) as anio,
    MONTH(created_at) as mes,
    COUNT(*) as total_apelaciones,
    COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
    COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    ROUND(
        (COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_aprobacion,
    AVG(CASE WHEN fecha_respuesta IS NOT NULL THEN DATEDIFF(fecha_respuesta, created_at) END) as dias_promedio_resolucion
FROM apelacion
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY anio DESC, mes DESC;

-- 3.4 Estadísticas por usuario (apelantes)
SELECT
    a.usuario_id,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario,
    COUNT(a.id) as total_apelaciones,
    COUNT(CASE WHEN a.estado = 'aprobada' THEN 1 END) as aprobadas,
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) as rechazadas,
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) as pendientes,
    ROUND(
        (COUNT(CASE WHEN a.estado = 'aprobada' THEN 1 END) * 100.0 / COUNT(a.id)), 2
    ) as porcentaje_exito
FROM apelacion a
JOIN usuario u ON a.usuario_id = u.id
GROUP BY a.usuario_id, u.nombres, u.apellidos
HAVING COUNT(a.id) > 0
ORDER BY total_apelaciones DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de apelaciones
SELECT
    a.id,
    a.multa_id,
    m.numero as numero_multa,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), '') as apelante,
    a.motivo,
    a.estado,
    a.created_at,
    a.fecha_respuesta,
    DATEDIFF(CURDATE(), a.created_at) as dias_antiguedad,
    CASE
        WHEN a.estado = 'pendiente' AND DATEDIFF(CURDATE(), a.created_at) > 30 THEN 'urgente'
        WHEN a.estado = 'pendiente' AND DATEDIFF(CURDATE(), a.created_at) > 15 THEN 'moderado'
        WHEN a.estado = 'pendiente' THEN 'normal'
        ELSE 'resuelto'
    END as prioridad_actual
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON a.usuario_id = uc.id
WHERE
    (:busqueda IS NULL OR
     m.numero LIKE CONCAT('%', :busqueda, '%') OR
     a.motivo LIKE CONCAT('%', :busqueda, '%') OR
     CONCAT(p.nombres, ' ', p.apellidos) LIKE CONCAT('%', :busqueda, '%') OR
     CONCAT(uc.nombres, ' ', uc.apellidos) LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR a.estado = :estado) AND
    (:fecha_desde IS NULL OR a.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR a.created_at <= :fecha_hasta) AND
    (:usuario_id IS NULL OR a.usuario_id = :usuario_id) AND
    (:dias_max IS NULL OR DATEDIFF(CURDATE(), a.created_at) <= :dias_max)
ORDER BY a.created_at DESC, a.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Apelaciones por multa (historial de una multa específica)
SELECT
    a.id,
    a.usuario_id,
    CONCAT(u.nombres, ' ', u.apellidos) as apelante,
    a.motivo,
    a.documentos_json,
    a.estado,
    a.respuesta,
    a.respondido_por,
    CONCAT(ur.nombres, ' ', ur.apellidos) as respondedor,
    a.fecha_respuesta,
    a.created_at,
    DATEDIFF(CURDATE(), a.created_at) as dias_desde_apelacion
FROM apelacion a
LEFT JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN usuario ur ON a.respondido_por = ur.id
WHERE a.multa_id = :multa_id
ORDER BY a.created_at DESC;

-- 4.3 Apelaciones por tiempo de resolución
SELECT
    CASE
        WHEN fecha_respuesta IS NULL THEN 'Sin resolver'
        WHEN DATEDIFF(fecha_respuesta, created_at) <= 7 THEN '1 semana'
        WHEN DATEDIFF(fecha_respuesta, created_at) <= 15 THEN '2 semanas'
        WHEN DATEDIFF(fecha_respuesta, created_at) <= 30 THEN '1 mes'
        ELSE 'Más de 1 mes'
    END as tiempo_resolucion,
    COUNT(*) as cantidad,
    AVG(CASE WHEN fecha_respuesta IS NOT NULL THEN DATEDIFF(fecha_respuesta, created_at) END) as dias_promedio,
    COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
    COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas
FROM apelacion
GROUP BY
    CASE
        WHEN fecha_respuesta IS NULL THEN 'Sin resolver'
        WHEN DATEDIFF(fecha_respuesta, created_at) <= 7 THEN '1 semana'
        WHEN DATEDIFF(fecha_respuesta, created_at) <= 15 THEN '2 semanas'
        WHEN DATEDIFF(fecha_respuesta, created_at) <= 30 THEN '1 mes'
        ELSE 'Más de 1 mes'
    END
ORDER BY dias_promedio;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de apelaciones para Excel/CSV
SELECT
    a.id as 'ID Apelación',
    m.numero as 'Número Multa',
    c.razon_social as 'Comunidad',
    COALESCE(u.numero, '') as 'Unidad',
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as 'Propietario',
    COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), '') as 'Apelante',
    a.motivo as 'Motivo Apelación',
    a.estado as 'Estado',
    a.respuesta as 'Respuesta',
    COALESCE(CONCAT(ur.nombres, ' ', ur.apellidos), '') as 'Resolvió',
    DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as 'Fecha Apelación',
    DATE_FORMAT(a.fecha_respuesta, '%Y-%m-%d %H:%i:%s') as 'Fecha Respuesta',
    CASE
        WHEN a.fecha_respuesta IS NOT NULL THEN DATEDIFF(a.fecha_respuesta, a.created_at)
        ELSE NULL
    END as 'Días Resolución'
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON a.usuario_id = uc.id
LEFT JOIN usuario ur ON a.respondido_por = ur.id
ORDER BY a.created_at DESC;

-- 5.2 Exportación de apelaciones pendientes
SELECT
    a.id as 'ID',
    m.numero as 'Multa',
    c.razon_social as 'Comunidad',
    COALESCE(u.numero, '') as 'Unidad',
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as 'Propietario',
    a.motivo as 'Motivo',
    DATE_FORMAT(a.created_at, '%Y-%m-%d') as 'Fecha Apelación',
    DATEDIFF(CURDATE(), a.created_at) as 'Días Pendiente',
    CASE
        WHEN DATEDIFF(CURDATE(), a.created_at) > 30 THEN 'URGENTE'
        WHEN DATEDIFF(CURDATE(), a.created_at) > 15 THEN 'MODERADO'
        ELSE 'NORMAL'
    END as 'Prioridad'
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
WHERE a.estado = 'pendiente'
ORDER BY a.created_at ASC;

-- 5.3 Exportación de estadísticas de resolución
SELECT
    YEAR(a.created_at) as 'Año',
    MONTH(a.created_at) as 'Mes',
    COUNT(*) as 'Total Apelaciones',
    COUNT(CASE WHEN a.estado = 'aprobada' THEN 1 END) as 'Aprobadas',
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) as 'Rechazadas',
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) as 'Pendientes',
    ROUND(
        (COUNT(CASE WHEN a.estado = 'aprobada' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as 'Porcentaje Aprobación (%)',
    ROUND(
        AVG(CASE WHEN a.fecha_respuesta IS NOT NULL THEN DATEDIFF(a.fecha_respuesta, a.created_at) END), 1
    ) as 'Días Promedio Resolución'
FROM apelacion a
WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(a.created_at), MONTH(a.created_at)
ORDER BY YEAR(a.created_at) DESC, MONTH(a.created_at) DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de apelaciones
SELECT
    'Apelaciones sin multa' as validacion,
    COUNT(*) as cantidad
FROM apelacion a
LEFT JOIN multa m ON a.multa_id = m.id
WHERE m.id IS NULL
UNION ALL
SELECT
    'Apelaciones sin usuario' as validacion,
    COUNT(*) as cantidad
FROM apelacion a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Apelaciones aprobadas sin respuesta' as validacion,
    COUNT(*) as cantidad
FROM apelacion
WHERE estado = 'aprobada' AND (respuesta IS NULL OR respuesta = '')
UNION ALL
SELECT
    'Apelaciones rechazadas sin respuesta' as validacion,
    COUNT(*) as cantidad
FROM apelacion
WHERE estado = 'rechazada' AND (respuesta IS NULL OR respuesta = '')
UNION ALL
SELECT
    'Apelaciones resueltas sin fecha de respuesta' as validacion,
    COUNT(*) as cantidad
FROM apelacion
WHERE estado IN ('aprobada', 'rechazada') AND fecha_respuesta IS NULL
UNION ALL
SELECT
    'Apelaciones resueltas sin usuario respondedor' as validacion,
    COUNT(*) as cantidad
FROM apelacion
WHERE estado IN ('aprobada', 'rechazada') AND respondido_por IS NULL
UNION ALL
SELECT
    'Múltiples apelaciones activas por multa' as validacion,
    COUNT(*) as cantidad
FROM (
    SELECT multa_id, COUNT(*) as cnt
    FROM apelacion
    WHERE estado = 'pendiente'
    GROUP BY multa_id
    HAVING cnt > 1
) multiples;

-- 6.2 Validar consistencia de fechas
SELECT
    'Fechas de respuesta anteriores a creación' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Apelación ', a.id, ': respuesta ', DATE_FORMAT(a.fecha_respuesta, '%Y-%m-%d'), ' vs creación ', DATE_FORMAT(a.created_at, '%Y-%m-%d'))
        SEPARATOR '; '
    ) as detalles
FROM apelacion a
WHERE a.fecha_respuesta < a.created_at;

-- 6.3 Validar estados y campos requeridos
SELECT
    'Inconsistencias en estados y campos' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('ID ', a.id, ': estado ', a.estado, ' pero campos inconsistentes')
        SEPARATOR '; '
    ) as detalles
FROM apelacion a
WHERE
    (estado IN ('aprobada', 'rechazada') AND (respuesta IS NULL OR respondido_por IS NULL OR fecha_respuesta IS NULL)) OR
    (estado = 'pendiente' AND (respuesta IS NOT NULL OR respondido_por IS NOT NULL OR fecha_respuesta IS NOT NULL));

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de apelaciones
CREATE OR REPLACE VIEW vista_apelaciones_listado AS
SELECT
    a.id,
    a.multa_id,
    m.numero as numero_multa,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') as propietario,
    a.motivo,
    a.estado,
    a.created_at,
    a.fecha_respuesta,
    DATEDIFF(CURDATE(), a.created_at) as dias_pendiente
FROM apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id;

-- 7.2 Vista para estadísticas de apelaciones por comunidad
CREATE OR REPLACE VIEW vista_apelaciones_estadisticas AS
SELECT
    c.razon_social as comunidad,
    COUNT(a.id) as total_apelaciones,
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN a.estado = 'aprobada' THEN 1 END) as aprobadas,
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) as rechazadas,
    AVG(CASE WHEN a.fecha_respuesta IS NOT NULL THEN DATEDIFF(a.fecha_respuesta, a.created_at) END) as dias_promedio_resolucion,
    MAX(a.created_at) as ultima_apelacion
FROM comunidad c
LEFT JOIN multa m ON c.id = m.comunidad_id
LEFT JOIN apelacion a ON m.id = a.multa_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de apelaciones
CREATE OR REPLACE VIEW vista_apelaciones_dashboard AS
SELECT
    'total' as tipo,
    COUNT(*) as valor
FROM apelacion
UNION ALL
SELECT
    'pendientes' as tipo,
    COUNT(*) as valor
FROM apelacion
WHERE estado = 'pendiente'
UNION ALL
SELECT
    'aprobadas' as tipo,
    COUNT(*) as valor
FROM apelacion
WHERE estado = 'aprobada'
UNION ALL
SELECT
    'rechazadas' as tipo,
    COUNT(*) as valor
FROM apelacion
WHERE estado = 'rechazada'
UNION ALL
SELECT
    'dias_promedio_resolucion' as tipo,
    ROUND(AVG(CASE WHEN fecha_respuesta IS NOT NULL THEN DATEDIFF(fecha_respuesta, created_at) END), 1) as valor
FROM apelacion;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_apelacion_multa_id ON apelacion(multa_id);
CREATE INDEX idx_apelacion_usuario_id ON apelacion(usuario_id);
CREATE INDEX idx_apelacion_estado ON apelacion(estado);
CREATE INDEX idx_apelacion_created_at ON apelacion(created_at DESC);
CREATE INDEX idx_apelacion_fecha_respuesta ON apelacion(fecha_respuesta);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_apelacion_estado_fecha ON apelacion(estado, created_at DESC);
CREATE INDEX idx_apelacion_usuario_estado ON apelacion(usuario_id, estado);
CREATE INDEX idx_apelacion_multa_estado ON apelacion(multa_id, estado);

-- Índice para estadísticas mensuales
CREATE INDEX idx_apelacion_anio_mes ON apelacion(YEAR(created_at), MONTH(created_at));

-- Índices para joins frecuentes
CREATE INDEX idx_apelacion_respondido_por ON apelacion(respondido_por);

-- Índice para búsquedas por tiempo de resolución
CREATE INDEX idx_apelacion_resolucion ON apelacion(created_at, fecha_respuesta);