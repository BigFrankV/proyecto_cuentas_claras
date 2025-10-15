-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO APELACIONES
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-15 (Corregido)
-- =========================================

-- NOTA DE CORRECCIÓN: La tabla 'apelacion' fue renombrada a 'multa_apelacion' para coincidir con el esquema.
-- Las columnas de 'multa' (numero, tipo_infraccion, fecha_vencimiento) no existen en el esquema, se reemplazan por 'id', 'motivo', y la columna 'fecha'.

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de apelaciones con filtros
SELECT
    a.id,
    a.multa_id,
    -- CORRECCIÓN: La columna 'numero' no existe en 'multa'. Usamos el ID de la multa.
    m.id AS numero_multa,
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar 'codigo' de unidad en lugar de 'numero'
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS apelante_persona, -- CORRECCIÓN: Usamos p.nombres/apellidos como apelante (persona_id)
    a.usuario_id,
    COALESCE(CONCAT(up.nombres, ' ', up.apellidos), '') AS usuario_apelante, -- CORRECCIÓN: Usuario que presenta la apelación (usuario_id)
    a.motivo_apelacion AS motivo, -- CORRECCIÓN: Columna correcta es 'motivo_apelacion'
    a.estado,
    a.fecha_resolucion AS fecha_respuesta, -- CORRECCIÓN: Columna correcta es 'fecha_resolucion'
    -- La tabla multa_apelacion NO tiene 'respondido_por', asumimos que el 'usuario_id' es el apelante.
    -- Se omite el join a ur, ya que el campo no existe.
    a.created_at,
    a.updated_at,
    DATEDIFF(CURDATE(), a.created_at) AS dias_desde_apelacion,
    CASE
        WHEN a.estado = 'pendiente' THEN 'En revisión'
        WHEN a.estado = 'aceptada' THEN 'Aprobada' -- CORRECCIÓN: El estado es 'aceptada'
        WHEN a.estado = 'rechazada' THEN 'Rechazada'
    END AS estado_descripcion
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id -- CORRECCIÓN: Unir a 'comunidad' usando a.comunidad_id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON a.persona_id = p.id -- CORRECCIÓN: Unir a persona por a.persona_id
LEFT JOIN usuario u_user ON a.usuario_id = u_user.id
LEFT JOIN persona up ON u_user.persona_id = up.id -- CORRECCIÓN: Obtener nombre del usuario apelante
WHERE
    (:comunidad_id IS NULL OR a.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR a.estado = :estado) AND
    (:fecha_desde IS NULL OR a.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR a.created_at <= :fecha_hasta) AND
    (:usuario_id IS NULL OR a.usuario_id = :usuario_id)
ORDER BY a.created_at DESC, a.id DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de apelaciones por comunidad con estadísticas
SELECT
    c.razon_social AS comunidad,
    COUNT(a.id) AS total_apelaciones,
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN a.estado = 'aceptada' THEN 1 END) AS aprobadas, -- CORRECCIÓN: Estado 'aceptada'
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) AS rechazadas,
    -- CORRECCIÓN: Usar fecha_resolucion y filtrar solo las resueltas
    AVG(CASE WHEN a.fecha_resolucion IS NOT NULL THEN DATEDIFF(a.fecha_resolucion, a.created_at) END) AS dias_promedio_resolucion,
    MAX(a.created_at) AS ultima_apelacion
FROM comunidad c
LEFT JOIN multa_apelacion a ON c.id = a.comunidad_id -- CORRECCIÓN: Unir directamente a multa_apelacion por comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Apelaciones pendientes de resolución
SELECT
    a.id,
    a.multa_id,
    m.id AS numero_multa, -- CORRECCIÓN: Usar ID de multa
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar 'codigo' de unidad
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS apelante_persona, -- CORRECCIÓN: Nombre de la persona apelante
    a.motivo_apelacion AS motivo, -- CORRECCIÓN: Columna correcta
    a.created_at,
    DATEDIFF(CURDATE(), a.created_at) AS dias_pendiente,
    CASE
        WHEN DATEDIFF(CURDATE(), a.created_at) > 30 THEN 'urgente'
        WHEN DATEDIFF(CURDATE(), a.created_at) > 15 THEN 'moderado'
        ELSE 'normal'
    END AS nivel_urgencia
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id -- CORRECCIÓN: Unir a 'comunidad'
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON a.persona_id = p.id
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
    a.motivo_apelacion AS motivo, -- CORRECCIÓN: Columna correcta
    -- NOTA: la tabla 'multa_apelacion' no tiene campo 'documentos_json', se omite.
    a.estado,
    a.resolucion AS respuesta, -- CORRECCIÓN: Columna correcta es 'resolucion'
    -- NOTA: La tabla 'multa_apelacion' no tiene 'respondido_por', usamos el usuario de la multa para simular quien creó el cargo.
    m.creada_por, -- Usuario que creó la multa
    a.fecha_resolucion AS fecha_respuesta, -- CORRECCIÓN: Columna correcta
    a.created_at,
    a.updated_at,
    -- Información de la multa relacionada
    JSON_OBJECT(
        'multa', JSON_OBJECT(
            'id', m.id,
            -- CORRECCIÓN: No existe m.numero, m.tipo_infraccion, m.fecha_infraccion, m.fecha_vencimiento
            'motivo_registro', m.motivo, -- Usamos el motivo de la multa
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'fecha', m.fecha -- Usamos m.fecha
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social,
            'direccion', c.direccion
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'codigo', u.codigo, -- CORRECCIÓN: Usar u.codigo
                'torre', t.nombre,
                'edificio', e.nombre
            )
            ELSE NULL
        END,
        -- CORRECCIÓN: 'propietario' en multa_apelacion es la persona, no necesariamente propietario.
        'persona_apelante', CASE
            WHEN pp.id IS NOT NULL THEN JSON_OBJECT(
                'id', pp.id,
                'nombre', CONCAT(pp.nombres, ' ', pp.apellidos),
                'email', pp.email,
                'telefono', pp.telefono
            )
            ELSE NULL
        END,
        -- CORRECCIÓN: Usuario que hizo la apelación (Si usuario_id es NOT NULL)
        'usuario_apelante', CASE
            WHEN uc.id IS NOT NULL THEN JSON_OBJECT(
                'id', uc.id,
                'nombre', CONCAT(up.nombres, ' ', up.apellidos),
                'email', up.email
            )
            ELSE NULL
        END
    ) AS informacion_completa,
    DATEDIFF(CURDATE(), a.created_at) AS dias_desde_apelacion,
    CASE
        WHEN a.fecha_resolucion IS NOT NULL THEN DATEDIFF(a.fecha_resolucion, a.created_at)
        ELSE NULL
    END AS dias_para_resolver
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN torre t ON u.torre_id = t.id
LEFT JOIN edificio e ON u.edificio_id = e.id -- CORRECCIÓN: La unidad se une a edificio_id, no la torre
LEFT JOIN persona pp ON a.persona_id = pp.id
LEFT JOIN usuario uc ON a.usuario_id = uc.id
LEFT JOIN persona up ON uc.persona_id = up.id
WHERE a.id = :apelacion_id;

-- 2.2 Vista de apelaciones con información completa para listado
SELECT
    a.id,
    a.multa_id,
    m.id AS numero_multa, -- CORRECCIÓN: Usar ID de multa
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar 'codigo' de unidad
    COALESCE(CONCAT(pp.nombres, ' ', pp.apellidos), '') AS apelante_persona, -- CORRECCIÓN: Nombre de persona apelante
    a.motivo_apelacion AS motivo, -- CORRECCIÓN: Columna correcta
    a.estado,
    a.created_at,
    a.fecha_resolucion AS fecha_respuesta, -- CORRECCIÓN: Columna correcta
    JSON_OBJECT(
        'apelacion', JSON_OBJECT(
            'id', a.id,
            'motivo', a.motivo_apelacion, -- CORRECCIÓN: Columna correcta
            'estado', a.estado,
            'fecha_creacion', a.created_at,
            'fecha_respuesta', a.fecha_resolucion -- CORRECCIÓN: Columna correcta
        ),
        'multa', JSON_OBJECT(
            'id', m.id,
            'motivo', m.motivo, -- CORRECCIÓN: Usar m.motivo
            'monto', m.monto,
            'estado', m.estado
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        )
    ) AS informacion_resumida
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona pp ON a.persona_id = pp.id
ORDER BY a.created_at DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de apelaciones
SELECT
    COUNT(*) AS total_apelaciones,
    COUNT(DISTINCT multa_id) AS multas_con_apelacion,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS apelaciones_pendientes,
    COUNT(CASE WHEN estado = 'aceptada' THEN 1 END) AS apelaciones_aprobadas, -- CORRECCIÓN: Estado 'aceptada'
    COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) AS apelaciones_rechazadas,
    ROUND(
        (COUNT(CASE WHEN estado = 'aceptada' THEN 1 END) * 100.0 / COUNT(*)), 2 -- CORRECCIÓN: Estado 'aceptada'
    ) AS porcentaje_aprobacion,
    AVG(CASE WHEN fecha_resolucion IS NOT NULL THEN DATEDIFF(fecha_resolucion, created_at) END) AS dias_promedio_resolucion, -- CORRECCIÓN: Columna 'fecha_resolucion'
    MIN(created_at) AS primera_apelacion,
    MAX(created_at) AS ultima_apelacion
FROM multa_apelacion; -- CORRECCIÓN: Usar 'multa_apelacion'

-- 3.2 Estadísticas por estado
SELECT
    estado,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM multa_apelacion)), 2 -- CORRECCIÓN: Usar 'multa_apelacion'
    ) AS porcentaje,
    AVG(CASE WHEN fecha_resolucion IS NOT NULL THEN DATEDIFF(fecha_resolucion, created_at) END) AS dias_promedio_resolucion, -- CORRECCIÓN: Columna 'fecha_resolucion'
    MIN(created_at) AS mas_antigua,
    MAX(created_at) AS mas_reciente
FROM multa_apelacion -- CORRECCIÓN: Usar 'multa_apelacion'
GROUP BY estado
ORDER BY cantidad DESC;

-- 3.3 Estadísticas mensuales de apelaciones
SELECT
    YEAR(created_at) AS anio,
    MONTH(created_at) AS mes,
    COUNT(*) AS total_apelaciones,
    COUNT(CASE WHEN estado = 'aceptada' THEN 1 END) AS aprobadas, -- CORRECCIÓN: Estado 'aceptada'
    COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) AS rechazadas,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS pendientes,
    ROUND(
        (COUNT(CASE WHEN estado = 'aceptada' THEN 1 END) * 100.0 / COUNT(*)), 2 -- CORRECCIÓN: Estado 'aceptada'
    ) AS porcentaje_aprobacion,
    AVG(CASE WHEN fecha_resolucion IS NOT NULL THEN DATEDIFF(fecha_resolucion, created_at) END) AS dias_promedio_resolucion -- CORRECCIÓN: Columna 'fecha_resolucion'
FROM multa_apelacion -- CORRECCIÓN: Usar 'multa_apelacion'
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY anio DESC, mes DESC;

-- 3.4 Estadísticas por usuario (apelantes)
SELECT
    a.usuario_id,
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS usuario, -- CORRECCIÓN: Obtener nombre desde persona
    COUNT(a.id) AS total_apelaciones,
    COUNT(CASE WHEN a.estado = 'aceptada' THEN 1 END) AS aprobadas, -- CORRECCIÓN: Estado 'aceptada'
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) AS rechazadas,
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) AS pendientes,
    ROUND(
        (COUNT(CASE WHEN a.estado = 'aceptada' THEN 1 END) * 100.0 / COUNT(a.id)), 2 -- CORRECCIÓN: Estado 'aceptada'
    ) AS porcentaje_exito
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN usuario u ON a.usuario_id = u.id
JOIN persona p ON u.persona_id = p.id
GROUP BY a.usuario_id, p.nombres, p.apellidos
HAVING COUNT(a.id) > 0
ORDER BY total_apelaciones DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de apelaciones
SELECT
    a.id,
    a.multa_id,
    m.id AS numero_multa, -- CORRECCIÓN: Usar ID de multa
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar 'codigo' de unidad
    COALESCE(CONCAT(pp.nombres, ' ', pp.apellidos), '') AS apelante_persona, -- CORRECCIÓN: Nombre de persona apelante
    COALESCE(CONCAT(up.nombres, ' ', up.apellidos), '') AS usuario_apelante, -- CORRECCIÓN: Nombre de usuario apelante
    a.motivo_apelacion AS motivo, -- CORRECCIÓN: Columna correcta
    a.estado,
    a.created_at,
    a.fecha_resolucion AS fecha_respuesta, -- CORRECCIÓN: Columna correcta
    DATEDIFF(CURDATE(), a.created_at) AS dias_antiguedad,
    CASE
        WHEN a.estado = 'pendiente' AND DATEDIFF(CURDATE(), a.created_at) > 30 THEN 'urgente'
        WHEN a.estado = 'pendiente' AND DATEDIFF(CURDATE(), a.created_at) > 15 THEN 'moderado'
        WHEN a.estado = 'pendiente' THEN 'normal'
        ELSE 'resuelto'
    END AS prioridad_actual
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona pp ON a.persona_id = pp.id -- Persona apelante
LEFT JOIN usuario uc ON a.usuario_id = uc.id
LEFT JOIN persona up ON uc.persona_id = up.id -- Persona asociada al usuario apelante
WHERE
    (:busqueda IS NULL OR
     -- CORRECCIÓN: La multa no tiene numero, solo motivo
     m.motivo LIKE CONCAT('%', :busqueda, '%') OR
     a.motivo_apelacion LIKE CONCAT('%', :busqueda, '%') OR -- CORRECCIÓN: Columna correcta
     CONCAT(pp.nombres, ' ', pp.apellidos) LIKE CONCAT('%', :busqueda, '%') OR
     CONCAT(up.nombres, ' ', up.apellidos) LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR a.comunidad_id = :comunidad_id) AND
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
    COALESCE(CONCAT(up.nombres, ' ', up.apellidos), '') AS usuario_apelante, -- CORRECCIÓN: Nombre de usuario apelante
    a.motivo_apelacion AS motivo, -- CORRECCIÓN: Columna correcta
    a.resolucion AS respuesta, -- CORRECCIÓN: Columna correcta
    a.fecha_resolucion AS fecha_respuesta, -- CORRECCIÓN: Columna correcta
    a.created_at,
    DATEDIFF(CURDATE(), a.created_at) AS dias_desde_apelacion
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
LEFT JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN persona up ON u.persona_id = up.id
WHERE a.multa_id = :multa_id
ORDER BY a.created_at DESC;

-- 4.3 Apelaciones por tiempo de resolución
SELECT
    CASE
        WHEN fecha_resolucion IS NULL THEN 'Sin resolver'
        WHEN DATEDIFF(fecha_resolucion, created_at) <= 7 THEN '1 semana'
        WHEN DATEDIFF(fecha_resolucion, created_at) <= 15 THEN '2 semanas'
        WHEN DATEDIFF(fecha_resolucion, created_at) <= 30 THEN '1 mes'
        ELSE 'Más de 1 mes'
    END AS tiempo_resolucion,
    COUNT(*) AS cantidad,
    AVG(CASE WHEN fecha_resolucion IS NOT NULL THEN DATEDIFF(fecha_resolucion, created_at) END) AS dias_promedio, -- CORRECCIÓN: Columna 'fecha_resolucion'
    COUNT(CASE WHEN estado = 'aceptada' THEN 1 END) AS aprobadas, -- CORRECCIÓN: Estado 'aceptada'
    COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) AS rechazadas
FROM multa_apelacion -- CORRECCIÓN: Usar 'multa_apelacion'
GROUP BY 1
ORDER BY dias_promedio;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de apelaciones para Excel/CSV
SELECT
    a.id AS 'ID Apelación',
    m.id AS 'Número Multa', -- CORRECCIÓN: Usar ID de multa
    c.razon_social AS 'Comunidad',
    COALESCE(u.codigo, '') AS 'Unidad', -- CORRECCIÓN: Usar 'codigo'
    COALESCE(CONCAT(pp.nombres, ' ', pp.apellidos), '') AS 'Persona Apelante', -- CORRECCIÓN: Persona Apelante
    COALESCE(CONCAT(up.nombres, ' ', up.apellidos), '') AS 'Usuario Apelante', -- CORRECCIÓN: Usuario que registró la apelación
    a.motivo_apelacion AS 'Motivo Apelación', -- CORRECCIÓN: Columna correcta
    a.estado AS 'Estado',
    a.resolucion AS 'Respuesta/Resolución', -- CORRECCIÓN: Columna correcta
    -- La tabla no tiene 'respondido_por', se omite.
    DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Apelación',
    DATE_FORMAT(a.fecha_resolucion, '%Y-%m-%d %H:%i:%s') AS 'Fecha Respuesta', -- CORRECCIÓN: Columna correcta
    CASE
        WHEN a.fecha_resolucion IS NOT NULL THEN DATEDIFF(a.fecha_resolucion, a.created_at) -- CORRECCIÓN: Columna correcta
        ELSE NULL
    END AS 'Días Resolución'
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona pp ON a.persona_id = pp.id -- Persona apelante
LEFT JOIN usuario uc ON a.usuario_id = uc.id
LEFT JOIN persona up ON uc.persona_id = up.id -- Persona asociada al usuario apelante
ORDER BY a.created_at DESC;

-- 5.2 Exportación de apelaciones pendientes
SELECT
    a.id AS 'ID',
    m.id AS 'Multa ID',
    c.razon_social AS 'Comunidad',
    COALESCE(u.codigo, '') AS 'Unidad', -- CORRECCIÓN: Usar 'codigo'
    COALESCE(CONCAT(pp.nombres, ' ', pp.apellidos), '') AS 'Persona Apelante',
    a.motivo_apelacion AS 'Motivo', -- CORRECCIÓN: Columna correcta
    DATE_FORMAT(a.created_at, '%Y-%m-%d') AS 'Fecha Apelación',
    DATEDIFF(CURDATE(), a.created_at) AS 'Días Pendiente',
    CASE
        WHEN DATEDIFF(CURDATE(), a.created_at) > 30 THEN 'URGENTE'
        WHEN DATEDIFF(CURDATE(), a.created_at) > 15 THEN 'MODERADO'
        ELSE 'NORMAL'
    END AS 'Prioridad'
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona pp ON a.persona_id = pp.id
WHERE a.estado = 'pendiente'
ORDER BY a.created_at ASC;

-- 5.3 Exportación de estadísticas de resolución
SELECT
    YEAR(a.created_at) AS 'Año',
    MONTH(a.created_at) AS 'Mes',
    COUNT(*) AS 'Total Apelaciones',
    COUNT(CASE WHEN a.estado = 'aceptada' THEN 1 END) AS 'Aprobadas', -- CORRECCIÓN: Estado 'aceptada'
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) AS 'Rechazadas',
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) AS 'Pendientes',
    ROUND(
        (COUNT(CASE WHEN a.estado = 'aceptada' THEN 1 END) * 100.0 / COUNT(*)), 2 -- CORRECCIÓN: Estado 'aceptada'
    ) AS 'Porcentaje Aprobación (%)',
    ROUND(
        AVG(CASE WHEN a.fecha_resolucion IS NOT NULL THEN DATEDIFF(a.fecha_resolucion, a.created_at) END), 1 -- CORRECCIÓN: Columna 'fecha_resolucion'
    ) AS 'Días Promedio Resolución'
FROM multa_apelacion a -- CORRECCIÓN: Usar 'multa_apelacion'
WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(a.created_at), MONTH(a.created_at)
ORDER BY YEAR(a.created_at) DESC, MONTH(a.created_at) DESC;

-- =========================================
-- 6. VALIDACIONES (Ajustadas a la tabla 'multa_apelacion')
-- =========================================

-- 6.1 Validar integridad de apelaciones
SELECT
    'Apelaciones sin multa' AS validacion,
    COUNT(*) AS cantidad
FROM multa_apelacion a -- CORRECCIÓN
LEFT JOIN multa m ON a.multa_id = m.id
WHERE m.id IS NULL
UNION ALL
SELECT
    'Apelaciones sin usuario' AS validacion,
    COUNT(*) AS cantidad
FROM multa_apelacion a -- CORRECCIÓN
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Apelaciones aprobadas (aceptadas) sin resolución' AS validacion,
    COUNT(*) AS cantidad
FROM multa_apelacion -- CORRECCIÓN
WHERE estado = 'aceptada' AND (resolucion IS NULL OR resolucion = '') -- CORRECCIÓN: Estado 'aceptada' y columna 'resolucion'
UNION ALL
SELECT
    'Apelaciones resueltas sin fecha de resolución' AS validacion,
    COUNT(*) AS cantidad
FROM multa_apelacion -- CORRECCIÓN
WHERE estado IN ('aceptada', 'rechazada') AND fecha_resolucion IS NULL -- CORRECCIÓN: Estado 'aceptada' y columna 'fecha_resolucion'
UNION ALL
SELECT
    'Múltiples apelaciones activas por multa' AS validacion,
    COUNT(*) AS cantidad
FROM (
    SELECT multa_id, COUNT(*) AS cnt
    FROM multa_apelacion -- CORRECCIÓN
    WHERE estado = 'pendiente'
    GROUP BY multa_id
    HAVING cnt > 1
) AS multiples;

-- 6.2 Validar consistencia de fechas
SELECT
    'Fechas de resolución anteriores a creación' AS validacion,
    COUNT(*) AS cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Apelación ', a.id, ': resolución ', DATE_FORMAT(a.fecha_resolucion, '%Y-%m-%d'), ' vs creación ', DATE_FORMAT(a.created_at, '%Y-%m-%d'))
        SEPARATOR '; '
    ) AS detalles
FROM multa_apelacion a -- CORRECCIÓN
WHERE a.fecha_resolucion < a.created_at;

-- 6.3 Validar estados y campos requeridos
SELECT
    'Inconsistencias en estados y campos' AS validacion,
    COUNT(*) AS cantidad_errores,
    GROUP_CONCAT(
        CONCAT('ID ', a.id, ': estado ', a.estado, ' pero campos inconsistentes')
        SEPARATOR '; '
    ) AS detalles
FROM multa_apelacion a -- CORRECCIÓN
WHERE
    (estado IN ('aceptada', 'rechazada') AND (resolucion IS NULL OR fecha_resolucion IS NULL)) OR -- CORRECCIÓN: Estado 'aceptada' y columna 'resolucion'
    (estado = 'pendiente' AND (resolucion IS NOT NULL OR fecha_resolucion IS NOT NULL)); -- CORRECCIÓN: Columna 'resolucion'

-- =========================================
-- 7. VISTAS OPTIMIZADAS (Ajustadas a la tabla 'multa_apelacion')
-- =========================================

-- 7.1 Vista para listado rápido de apelaciones
CREATE OR REPLACE VIEW vista_apelaciones_listado AS
SELECT
    a.id,
    a.multa_id,
    m.id AS numero_multa,
    c.razon_social AS comunidad,
    u.codigo AS unidad,
    COALESCE(CONCAT(pp.nombres, ' ', pp.apellidos), '') AS persona_apelante,
    a.motivo_apelacion AS motivo,
    a.estado,
    a.created_at,
    a.fecha_resolucion AS fecha_respuesta,
    DATEDIFF(CURDATE(), a.created_at) AS dias_pendiente
FROM multa_apelacion a
JOIN multa m ON a.multa_id = m.id
JOIN comunidad c ON a.comunidad_id = c.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona pp ON a.persona_id = pp.id;

-- 7.2 Vista para estadísticas de apelaciones por comunidad
CREATE OR REPLACE VIEW vista_apelaciones_estadisticas AS
SELECT
    c.razon_social AS comunidad,
    COUNT(a.id) AS total_apelaciones,
    COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) AS pendientes,
    COUNT(CASE WHEN a.estado = 'aceptada' THEN 1 END) AS aprobadas,
    COUNT(CASE WHEN a.estado = 'rechazada' THEN 1 END) AS rechazadas,
    AVG(CASE WHEN a.fecha_resolucion IS NOT NULL THEN DATEDIFF(a.fecha_resolucion, a.created_at) END) AS dias_promedio_resolucion,
    MAX(a.created_at) AS ultima_apelacion
FROM comunidad c
LEFT JOIN multa_apelacion a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de apelaciones
CREATE OR REPLACE VIEW vista_apelaciones_dashboard AS
SELECT
    'total' AS tipo,
    COUNT(*) AS valor
FROM multa_apelacion
UNION ALL
SELECT
    'pendientes' AS tipo,
    COUNT(*) AS valor
FROM multa_apelacion
WHERE estado = 'pendiente'
UNION ALL
SELECT
    'aprobadas' AS tipo,
    COUNT(*) AS valor
FROM multa_apelacion
WHERE estado = 'aceptada'
UNION ALL
SELECT
    'rechazadas' AS tipo,
    COUNT(*) AS valor
FROM multa_apelacion
WHERE estado = 'rechazada'
UNION ALL
SELECT
    'dias_promedio_resolucion' AS tipo,
    ROUND(AVG(CASE WHEN fecha_resolucion IS NOT NULL THEN DATEDIFF(fecha_resolucion, created_at) END), 1) AS valor
FROM multa_apelacion;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS (Se mantienen las recomendaciones, con el nombre de tabla correcto)
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_multa_apelacion_multa_id ON multa_apelacion(multa_id);
CREATE INDEX idx_multa_apelacion_usuario_id ON multa_apelacion(usuario_id);
CREATE INDEX idx_multa_apelacion_estado ON multa_apelacion(estado);
CREATE INDEX idx_multa_apelacion_created_at ON multa_apelacion(created_at DESC);
CREATE INDEX idx_multa_apelacion_fecha_resolucion ON multa_apelacion(fecha_resolucion);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_multa_apelacion_estado_fecha ON multa_apelacion(estado, created_at DESC);
CREATE INDEX idx_multa_apelacion_usuario_estado ON multa_apelacion(usuario_id, estado);
CREATE INDEX idx_multa_apelacion_multa_estado ON multa_apelacion(multa_id, estado);

-- Índice para estadísticas mensuales
-- NOTA: El esquema no soporta YEAR(created_at) directamente, se usa el índice de created_at para optimizar.
-- CREATE INDEX idx_multa_apelacion_anio_mes ON multa_apelacion(YEAR(created_at), MONTH(created_at));

-- Índices para joins frecuentes
CREATE INDEX idx_multa_apelacion_comunidad_id ON multa_apelacion(comunidad_id);

-- Índice para búsquedas por tiempo de resolución
CREATE INDEX idx_multa_apelacion_resolucion ON multa_apelacion(created_at, fecha_resolucion);
