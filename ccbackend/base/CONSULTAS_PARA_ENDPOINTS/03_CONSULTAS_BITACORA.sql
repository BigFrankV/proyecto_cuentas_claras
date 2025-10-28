-- =========================================
-- CONSULTAS SQL PARA MÓDULO BITÁCORA
-- Sistema de Cuentas Claras
-- Fecha: 2025-10-15 (Corregido)
-- =========================================

-- NOTA DE CORRECCIÓN:
-- 1. Los nombres de usuario ('user') ahora se obtienen haciendo JOIN a 'usuario' y luego a 'persona'.
-- 2. El nombre de la comunidad ('location') es 'razon_social', no 'nombre'.
-- 3. Los joins a roles para el detalle se hacen a través de 'usuario_rol_comunidad' y 'rol_sistema'.
-- 4. Se eliminó la referencia a la tabla inexistente 'permisos'.

-- =========================================
-- 1. LISTADO BÁSICO DE ACTIVIDADES CON FILTROS
-- =========================================

-- 1.1 Listado básico de actividades de bitácora (últimas 100)
SELECT
    JSON_OBJECT(
        'id', CONCAT('bitacora_', rc.id),
        'type', CASE
            WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
            WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
            WHEN rc.evento = 'otro' THEN 'maintenance'
            ELSE 'system'
        END,
        'priority', 'normal',
        'title', CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))),
        'description', COALESCE(rc.detalle, 'Sin descripción'),
        -- CORRECCIÓN: Obtener nombre de persona (p) a través de usuario (u)
        'user', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        -- CORRECCIÓN: Usar 'razon_social' de la comunidad (c)
        'location', c.razon_social
    ) AS actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
ORDER BY rc.fecha_hora DESC
LIMIT 100;

-- 1.2 Listado de auditoría del sistema (últimas 100)
SELECT
    JSON_OBJECT(
        'id', CONCAT('auditoria_', a.id),
        'type', CASE
            WHEN a.accion = 'INSERT' THEN 'user'
            WHEN a.accion = 'UPDATE' THEN 'admin'
            WHEN a.accion = 'DELETE' THEN 'security'
            ELSE 'system'
        END,
        'priority', CASE
            WHEN a.tabla = 'usuario' THEN 'critical' -- CORRECCIÓN: 'permisos' no existe
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        -- CORRECCIÓN: Obtener nombre de persona (p) a través de usuario (u)
        'user', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla)
    ) AS actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id
ORDER BY a.created_at DESC
LIMIT 100;

-- 1.3 Listado unificado de todas las actividades (bitácora + auditoría)
SELECT
    JSON_OBJECT(
        'id', CONCAT('bitacora_', rc.id),
        'type', CASE
            WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
            WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
            WHEN rc.evento = 'otro' THEN 'maintenance'
            ELSE 'system'
        END,
        'priority', 'normal',
        'title', CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))),
        'description', COALESCE(rc.detalle, 'Sin descripción'),
        -- CORRECCIÓN: Obtener nombre de persona (p_rc) a través de usuario (u_rc)
        'user', COALESCE(CONCAT(p_rc.nombres, ' ', p_rc.apellidos), 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        -- CORRECCIÓN: Usar 'razon_social'
        'location', c.razon_social,
        'source', 'bitacora'
    ) AS actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u_rc ON rc.usuario_id = u_rc.id
LEFT JOIN persona p_rc ON u_rc.persona_id = p_rc.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id

UNION ALL

SELECT
    JSON_OBJECT(
        'id', CONCAT('auditoria_', a.id),
        'type', CASE
            WHEN a.accion = 'INSERT' THEN 'user'
            WHEN a.accion = 'UPDATE' THEN 'admin'
            WHEN a.accion = 'DELETE' THEN 'security'
            ELSE 'system'
        END,
        'priority', CASE
            WHEN a.tabla = 'usuario' THEN 'critical' -- CORRECCIÓN: 'permisos' no existe
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        -- CORRECCIÓN: Obtener nombre de persona (p_a) a través de usuario (u_a)
        'user', COALESCE(CONCAT(p_a.nombres, ' ', p_a.apellidos), 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla),
        'source', 'auditoria'
    ) AS actividad
FROM auditoria a
LEFT JOIN usuario u_a ON a.usuario_id = u_a.id
LEFT JOIN persona p_a ON u_a.persona_id = p_a.id

ORDER BY JSON_UNQUOTE(JSON_EXTRACT(actividad, '$.date')) DESC
LIMIT 100;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Detalle completo de actividad de bitácora
SELECT
    JSON_OBJECT(
        'id', CONCAT('bitacora_', rc.id),
        'type', CASE
            WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
            WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
            WHEN rc.evento = 'otro' THEN 'maintenance'
            ELSE 'system'
        END,
        'priority', 'normal',
        'title', CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))),
        'description', COALESCE(rc.detalle, 'Sin descripción'),
        'user', JSON_OBJECT(
            'id', u.id,
            -- CORRECCIÓN: Obtener nombre de persona (p)
            'name', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
            'email', u.email,
            -- CORRECCIÓN: Obtener nombre de rol a través de urc y r
            'role', COALESCE(r.nombre, 'Sistema')
        ),
        'date', rc.fecha_hora,
        'created_at', rc.created_at,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', JSON_ARRAY(),
        'metadata', JSON_OBJECT(
            'comunidad', JSON_OBJECT(
                'id', c.id,
                -- CORRECCIÓN: Usar 'razon_social'
                'name', c.razon_social
            ),
            'evento_type', rc.evento,
            'source', 'bitacora'
        ),
        'ip', NULL,
        -- CORRECCIÓN: Usar 'razon_social'
        'location', c.razon_social
    ) AS actividad_detallada
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id -- CORRECCIÓN: Join a persona
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
-- CORRECCIÓN: Joins para obtener el Rol del Usuario en la Comunidad
LEFT JOIN usuario_rol_comunidad urc ON u.id = urc.usuario_id AND c.id = urc.comunidad_id AND urc.activo = 1
LEFT JOIN rol_sistema r ON urc.rol_id = r.id
WHERE rc.id = ?;

-- 2.2 Detalle completo de actividad de auditoría
SELECT
    JSON_OBJECT(
        'id', CONCAT('auditoria_', a.id),
        'type', CASE
            WHEN a.accion = 'INSERT' THEN 'user'
            WHEN a.accion = 'UPDATE' THEN 'admin'
            WHEN a.accion = 'DELETE' THEN 'security'
            ELSE 'system'
        END,
        'priority', CASE
            WHEN a.tabla = 'usuario' THEN 'critical' -- CORRECCIÓN: 'permisos' no existe
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Cambios realizados en la tabla del sistema'
        ),
        'user', JSON_OBJECT(
            'id', u.id,
            -- CORRECCIÓN: Obtener nombre de persona (p)
            'name', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
            'email', u.email,
            -- CORRECCIÓN: Obtener rol principal del usuario (simplificado)
            'role', COALESCE(r.nombre, 'Sistema')
        ),
        'date', a.created_at,
        'created_at', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', JSON_ARRAY(),
        'metadata', JSON_OBJECT(
            'table', a.tabla,
            'action', a.accion,
            'record_id', a.registro_id,
            'old_values', a.valores_anteriores,
            'new_values', a.valores_nuevos,
            'source', 'auditoria'
        ),
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla)
    ) AS actividad_detallada
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id -- CORRECCIÓN: Join a persona
-- CORRECCIÓN: Joins para obtener el Rol principal del Usuario
LEFT JOIN usuario_rol_comunidad urc ON u.id = urc.usuario_id AND urc.activo = 1 -- Asumimos un rol principal activo
LEFT JOIN rol_sistema r ON urc.rol_id = r.id
WHERE a.id = ?;

-- =========================================
-- 3. ESTADÍSTICAS Y MÉTRICAS
-- =========================================

-- 3.1 Estadísticas generales de bitácora
SELECT
    JSON_OBJECT(
        'total', (
            (SELECT COUNT(*) FROM registro_conserjeria)
            +
            (SELECT COUNT(*) FROM auditoria)
        ),
        'today', (
            (SELECT COUNT(*) FROM registro_conserjeria WHERE DATE(fecha_hora) = CURDATE())
            +
            (SELECT COUNT(*) FROM auditoria WHERE DATE(created_at) = CURDATE())
        ),
        'high', (
            SELECT COUNT(*) FROM auditoria
            WHERE tabla IN ('pago', 'gasto', 'usuario') -- CORRECCIÓN: 'permisos' no existe
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ),
        'critical', (
            SELECT COUNT(*) FROM auditoria
            WHERE tabla = 'usuario' -- CORRECCIÓN: 'permisos' no existe
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ),
        'by_type', JSON_OBJECT(
            'system', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento NOT IN ('entrega', 'retiro', 'visita', 'reporte', 'otro')) + (SELECT COUNT(*) FROM auditoria WHERE tabla NOT IN ('pago', 'gasto', 'usuario')),
            'user', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento IN ('entrega', 'retiro')),
            'security', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento IN ('visita', 'reporte')),
            'maintenance', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento = 'otro'),
            'admin', (SELECT COUNT(*) FROM auditoria WHERE accion = 'UPDATE' AND tabla NOT IN ('pago', 'gasto', 'usuario')),
            'financial', (SELECT COUNT(*) FROM auditoria WHERE tabla IN ('pago', 'gasto'))
        ),
        'by_priority', JSON_OBJECT(
            'low', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento IN ('entrega', 'retiro')),
            'normal', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento NOT IN ('entrega', 'retiro')) + (SELECT COUNT(*) FROM auditoria WHERE tabla NOT IN ('usuario', 'pago', 'gasto')),
            'high', (SELECT COUNT(*) FROM auditoria WHERE tabla IN ('pago', 'gasto')),
            'critical', (SELECT COUNT(*) FROM auditoria WHERE tabla = 'usuario') -- CORRECCIÓN: 'permisos' no existe
        )
    ) AS estadisticas;

-- 3.2 Estadísticas por comunidad
SELECT
    JSON_OBJECT(
        'comunidad_id', c.id,
        -- CORRECCIÓN: Usar 'razon_social'
        'comunidad_name', c.razon_social,
        'total_actividades', COUNT(rc.id),
        'actividades_hoy', COUNT(CASE WHEN DATE(rc.fecha_hora) = CURDATE() THEN 1 END),
        'tipos_eventos', JSON_OBJECTAGG(
            rc.evento,
            COUNT(*)
        )
    ) AS estadisticas_comunidad
FROM comunidad c
LEFT JOIN registro_conserjeria rc ON c.id = rc.comunidad_id
-- CORRECCIÓN: Agrupar por 'razon_social'
GROUP BY c.id, c.razon_social
ORDER BY COUNT(rc.id) DESC;

-- 3.3 Top usuarios más activos
SELECT
    JSON_OBJECT(
        'usuario_id', u.id,
        -- CORRECCIÓN: Obtener nombre de persona (p)
        'usuario_name', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
        -- CORRECCIÓN: Obtener rol principal del usuario (r)
        'rol', COALESCE(r.nombre, 'Sistema'),
        'total_actividades', (
            COALESCE(bitacora_count.total_bitacora, 0) +
            COALESCE(auditoria_count.total_auditoria, 0)
        ),
        'actividades_bitacora', COALESCE(bitacora_count.total_bitacora, 0),
        'actividades_auditoria', COALESCE(auditoria_count.total_auditoria, 0),
        'ultima_actividad', GREATEST(
            COALESCE(bitacora_count.ultima_bitacora, '2000-01-01'),
            COALESCE(auditoria_count.ultima_auditoria, '2000-01-01')
        )
    ) AS usuario_estadisticas
FROM usuario u
LEFT JOIN persona p ON u.persona_id = p.id -- CORRECCIÓN: Join a persona
-- CORRECCIÓN: Joins para obtener el Rol principal del Usuario
LEFT JOIN usuario_rol_comunidad urc ON u.id = urc.usuario_id AND urc.activo = 1
LEFT JOIN rol_sistema r ON urc.rol_id = r.id
LEFT JOIN (
    SELECT usuario_id, COUNT(*) AS total_bitacora, MAX(fecha_hora) AS ultima_bitacora
    FROM registro_conserjeria
    GROUP BY usuario_id
) AS bitacora_count ON u.id = bitacora_count.usuario_id
LEFT JOIN (
    SELECT usuario_id, COUNT(*) AS total_auditoria, MAX(created_at) AS ultima_auditoria
    FROM auditoria
    GROUP BY usuario_id
) AS auditoria_count ON u.id = auditoria_count.usuario_id
WHERE COALESCE(bitacora_count.total_bitacora, 0) + COALESCE(auditoria_count.total_auditoria, 0) > 0
ORDER BY (
    COALESCE(bitacora_count.total_bitacora, 0) +
    COALESCE(auditoria_count.total_auditoria, 0)
) DESC
LIMIT 10;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda por tipo de actividad
SELECT
    JSON_OBJECT(
        'id', CONCAT('bitacora_', rc.id),
        'type', CASE
            WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
            WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
            WHEN rc.evento = 'otro' THEN 'maintenance'
            ELSE 'system'
        END,
        'priority', 'normal',
        'title', CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))),
        'description', COALESCE(rc.detalle, 'Sin descripción'),
        -- CORRECCIÓN: Obtener nombre de persona (p)
        'user', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        -- CORRECCIÓN: Usar 'razon_social'
        'location', c.razon_social
    ) AS actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
WHERE CASE
    WHEN ? = 'user' THEN rc.evento IN ('entrega', 'retiro')
    WHEN ? = 'security' THEN rc.evento IN ('visita', 'reporte')
    WHEN ? = 'maintenance' THEN rc.evento = 'otro'
    WHEN ? = 'system' THEN rc.evento NOT IN ('entrega', 'retiro', 'visita', 'reporte', 'otro')
    ELSE TRUE
END
ORDER BY rc.fecha_hora DESC
LIMIT ? OFFSET ?;

-- 4.2 Búsqueda por prioridad
SELECT
    JSON_OBJECT(
        'id', CONCAT('auditoria_', a.id),
        'type', CASE
            WHEN a.accion = 'INSERT' THEN 'user'
            WHEN a.accion = 'UPDATE' THEN 'admin'
            WHEN a.accion = 'DELETE' THEN 'security'
            ELSE 'system'
        END,
        'priority', CASE
            WHEN a.tabla = 'usuario' THEN 'critical' -- CORRECCIÓN: 'permisos' no existe
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        -- CORRECCIÓN: Obtener nombre de persona (p)
        'user', COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla)
    ) AS actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id
WHERE CASE
    WHEN ? = 'critical' THEN a.tabla = 'usuario' -- CORRECCIÓN: 'permisos' no existe
    WHEN ? = 'high' THEN a.tabla IN ('pago', 'gasto')
    WHEN ? = 'normal' THEN a.tabla NOT IN ('usuario', 'pago', 'gasto')
    ELSE TRUE
END
ORDER BY a.created_at DESC
LIMIT ? OFFSET ?;

-- 4.3 Búsqueda por texto (título, descripción, usuario)
SELECT
    JSON_OBJECT(
        'id', CONCAT('bitacora_', rc.id),
        'type', CASE
            WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
            WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
            WHEN rc.evento = 'otro' THEN 'maintenance'
            ELSE 'system'
        END,
        'priority', 'normal',
        'title', CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))),
        'description', COALESCE(rc.detalle, 'Sin descripción'),
        -- CORRECCIÓN: Obtener nombre de persona (p_rc)
        'user', COALESCE(CONCAT(p_rc.nombres, ' ', p_rc.apellidos), 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        -- CORRECCIÓN: Usar 'razon_social'
        'location', c.razon_social,
        'source', 'bitacora'
    ) AS actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u_rc ON rc.usuario_id = u_rc.id
LEFT JOIN persona p_rc ON u_rc.persona_id = p_rc.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
WHERE rc.evento LIKE CONCAT('%', ?, '%')
   OR COALESCE(rc.detalle, '') LIKE CONCAT('%', ?, '%')
   -- CORRECCIÓN: Buscar por nombre completo de la persona
   OR COALESCE(CONCAT(p_rc.nombres, ' ', p_rc.apellidos), '') LIKE CONCAT('%', ?, '%')
   -- CORRECCIÓN: Usar 'razon_social'
   OR c.razon_social LIKE CONCAT('%', ?, '%')

UNION ALL

SELECT
    JSON_OBJECT(
        'id', CONCAT('auditoria_', a.id),
        'type', CASE
            WHEN a.accion = 'INSERT' THEN 'user'
            WHEN a.accion = 'UPDATE' THEN 'admin'
            WHEN a.accion = 'DELETE' THEN 'security'
            ELSE 'system'
        END,
        'priority', CASE
            WHEN a.tabla = 'usuario' THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        -- CORRECCIÓN: Obtener nombre de persona (p_a)
        'user', COALESCE(CONCAT(p_a.nombres, ' ', p_a.apellidos), 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla),
        'source', 'auditoria'
    ) AS actividad
FROM auditoria a
LEFT JOIN usuario u_a ON a.usuario_id = u_a.id
LEFT JOIN persona p_a ON u_a.persona_id = p_a.id
WHERE a.accion LIKE CONCAT('%', ?, '%')
   OR a.tabla LIKE CONCAT('%', ?, '%')
   -- CORRECCIÓN: Buscar por nombre completo de la persona
   OR COALESCE(CONCAT(p_a.nombres, ' ', p_a.apellidos), '') LIKE CONCAT('%', ?, '%')
   OR COALESCE(a.ip_address, '') LIKE CONCAT('%', ?, '%')

ORDER BY JSON_UNQUOTE(JSON_EXTRACT(actividad, '$.date')) DESC
LIMIT ? OFFSET ?;

-- 4.4 Búsqueda por rango de fechas
SELECT
    JSON_OBJECT(
        'id', CONCAT('bitacora_', rc.id),
        'type', CASE
            WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
            WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
            WHEN rc.evento = 'otro' THEN 'maintenance'
            ELSE 'system'
        END,
        'priority', 'normal',
        'title', CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))),
        'description', COALESCE(rc.detalle, 'Sin descripción'),
        -- CORRECCIÓN: Obtener nombre de persona (p_rc)
        'user', COALESCE(CONCAT(p_rc.nombres, ' ', p_rc.apellidos), 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        -- CORRECCIÓN: Usar 'razon_social'
        'location', c.razon_social,
        'source', 'bitacora'
    ) AS actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u_rc ON rc.usuario_id = u_rc.id
LEFT JOIN persona p_rc ON u_rc.persona_id = p_rc.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
WHERE DATE(rc.fecha_hora) BETWEEN ? AND ?

UNION ALL

SELECT
    JSON_OBJECT(
        'id', CONCAT('auditoria_', a.id),
        'type', CASE
            WHEN a.accion = 'INSERT' THEN 'user'
            WHEN a.accion = 'UPDATE' THEN 'admin'
            WHEN a.accion = 'DELETE' THEN 'security'
            ELSE 'system'
        END,
        'priority', CASE
            WHEN a.tabla = 'usuario' THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        -- CORRECCIÓN: Obtener nombre de persona (p_a)
        'user', COALESCE(CONCAT(p_a.nombres, ' ', p_a.apellidos), 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla),
        'source', 'auditoria'
    ) AS actividad
FROM auditoria a
LEFT JOIN usuario u_a ON a.usuario_id = u_a.id
LEFT JOIN persona p_a ON u_a.persona_id = p_a.id
WHERE DATE(a.created_at) BETWEEN ? AND ?

ORDER BY JSON_UNQUOTE(JSON_EXTRACT(actividad, '$.date')) DESC
LIMIT ? OFFSET ?;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa para Excel/CSV
SELECT
    'bitacora' AS source,
    rc.id AS record_id,
    CASE
        WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
        WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
        WHEN rc.evento = 'otro' THEN 'maintenance'
        ELSE 'system'
    END AS type,
    'normal' AS priority,
    CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))) AS title,
    COALESCE(rc.detalle, 'Sin descripción') AS description,
    -- CORRECCIÓN: Obtener nombre de persona (p_rc)
    COALESCE(CONCAT(p_rc.nombres, ' ', p_rc.apellidos), 'Sistema') AS user_name,
    rc.fecha_hora AS activity_date,
    -- CORRECCIÓN: Usar 'razon_social'
    c.razon_social AS location,
    NULL AS ip_address,
    rc.evento AS event_type,
    rc.created_at AS created_at
FROM registro_conserjeria rc
LEFT JOIN usuario u_rc ON rc.usuario_id = u_rc.id
LEFT JOIN persona p_rc ON u_rc.persona_id = p_rc.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id

UNION ALL

SELECT
    'auditoria' AS source,
    a.id AS record_id,
    CASE
        WHEN a.accion = 'INSERT' THEN 'user'
        WHEN a.accion = 'UPDATE' THEN 'admin'
        WHEN a.accion = 'DELETE' THEN 'security'
        ELSE 'system'
    END AS type,
    CASE
        WHEN a.tabla = 'usuario' THEN 'critical' -- CORRECCIÓN: 'permisos' no existe
        WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
        ELSE 'normal'
    END AS priority,
    CONCAT(a.accion, ' en ', a.tabla) AS title,
    CONCAT('Registro ID: ', COALESCE(a.registro_id, 'N/A'), ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')) AS description,
    -- CORRECCIÓN: Obtener nombre de persona (p_a)
    COALESCE(CONCAT(p_a.nombres, ' ', p_a.apellidos), 'Sistema') AS user_name,
    a.created_at AS activity_date,
    CONCAT('Tabla: ', a.tabla) AS location,
    a.ip_address,
    a.accion AS event_type,
    a.created_at AS created_at
FROM auditoria a
LEFT JOIN usuario u_a ON a.usuario_id = u_a.id
LEFT JOIN persona p_a ON u_a.persona_id = p_a.id

ORDER BY activity_date DESC;

-- 5.2 Exportación filtrada por comunidad
SELECT
    -- CORRECCIÓN: Usar 'razon_social'
    c.razon_social AS comunidad,
    COUNT(rc.id) AS total_actividades,
    COUNT(CASE WHEN DATE(rc.fecha_hora) = CURDATE() THEN 1 END) AS actividades_hoy,
    GROUP_CONCAT(DISTINCT rc.evento SEPARATOR ', ') AS tipos_eventos
FROM comunidad c
LEFT JOIN registro_conserjeria rc ON c.id = rc.comunidad_id
WHERE c.id = ?
-- CORRECCIÓN: Agrupar por 'razon_social'
GROUP BY c.id, c.razon_social;

-- 5.3 Exportación de resumen por usuario
SELECT
    -- CORRECCIÓN: Obtener nombre de persona (p)
    COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sistema') AS usuario,
    -- CORRECCIÓN: Obtener nombre de rol (r)
    COALESCE(r.nombre, 'Sistema') AS rol,
    COUNT(rc.id) AS actividades_bitacora,
    COUNT(a.id) AS actividades_auditoria,
    COUNT(rc.id) + COUNT(a.id) AS total_actividades,
    MAX(GREATEST(COALESCE(rc.fecha_hora, '2000-01-01'), COALESCE(a.created_at, '2000-01-01'))) AS ultima_actividad
FROM usuario u
LEFT JOIN persona p ON u.persona_id = p.id -- CORRECCIÓN: Join a persona
-- CORRECCIÓN: Joins para obtener el Rol principal del Usuario
LEFT JOIN usuario_rol_comunidad urc ON u.id = urc.usuario_id AND urc.activo = 1
LEFT JOIN rol_sistema r ON urc.rol_id = r.id
LEFT JOIN registro_conserjeria rc ON u.id = rc.usuario_id
LEFT JOIN auditoria a ON u.id = a.usuario_id
WHERE u.id = ?
-- CORRECCIÓN: Agrupar por campos de persona y rol
GROUP BY u.id, p.nombres, p.apellidos, r.nombre;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de datos de bitácora (Sin cambios estructurales)
SELECT
    'bitacora_integrity' AS check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS status,
    CONCAT('Registros sin comunidad válida: ', COUNT(*)) AS message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', rc.id,
            'comunidad_id', rc.comunidad_id,
            'evento', rc.evento
        )
    ) AS details
FROM registro_conserjeria rc
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
WHERE c.id IS NULL;

-- 6.2 Validar integridad de datos de auditoría (Sin cambios estructurales)
SELECT
    'auditoria_integrity' AS check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS status,
    CONCAT('Registros sin usuario válido: ', COUNT(*)) AS message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', a.id,
            'usuario_id', a.usuario_id,
            'accion', a.accion,
            'tabla', a.tabla
        )
    ) AS details
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.usuario_id IS NOT NULL AND u.id IS NULL;

-- 6.3 Validar consistencia de fechas (Sin cambios estructurales)
SELECT
    'date_consistency' AS check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS status,
    CONCAT('Registros con fechas futuras: ', COUNT(*)) AS message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', rc.id,
            'fecha_hora', rc.fecha_hora,
            'created_at', rc.created_at
        )
    ) AS details
FROM registro_conserjeria rc
WHERE rc.fecha_hora > NOW() OR rc.created_at > NOW();

-- 6.4 Validar datos requeridos (Sin cambios estructurales)
SELECT
    'required_fields' AS check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS status,
    CONCAT('Registros con campos requeridos nulos: ', COUNT(*)) AS message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', rc.id,
            'evento', rc.evento,
            'comunidad_id', rc.comunidad_id
        )
    ) AS details
FROM registro_conserjeria rc
WHERE rc.evento IS NULL OR rc.evento = ''
   OR rc.comunidad_id IS NULL;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista unificada de actividades (para listados rápidos)
CREATE OR REPLACE VIEW vista_actividades_unificadas AS
SELECT
    CONCAT('bitacora_', rc.id) AS id,
    CASE
        WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
        WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
        WHEN rc.evento = 'otro' THEN 'maintenance'
        ELSE 'system'
    END AS type,
    'normal' AS priority,
    CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))) AS title,
    COALESCE(rc.detalle, 'Sin descripción') AS description,
    -- CORRECCIÓN: Obtener nombre de persona (p_rc)
    COALESCE(CONCAT(p_rc.nombres, ' ', p_rc.apellidos), 'Sistema') AS user_name,
    rc.fecha_hora AS activity_date,
    JSON_ARRAY('bitácora', rc.evento) AS tags,
    0 AS attachments,
    NULL AS ip_address,
    -- CORRECCIÓN: Usar 'razon_social'
    c.razon_social AS location,
    'bitacora' AS source,
    rc.created_at AS created_at
FROM registro_conserjeria rc
LEFT JOIN usuario u_rc ON rc.usuario_id = u_rc.id
LEFT JOIN persona p_rc ON u_rc.persona_id = p_rc.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id

UNION ALL

SELECT
    CONCAT('auditoria_', a.id) AS id,
    CASE
        WHEN a.accion = 'INSERT' THEN 'user'
        WHEN a.accion = 'UPDATE' THEN 'admin'
        WHEN a.accion = 'DELETE' THEN 'security'
        ELSE 'system'
    END AS type,
    CASE
        WHEN a.tabla = 'usuario' THEN 'critical' -- CORRECCIÓN: 'permisos' no existe
        WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
        ELSE 'normal'
    END AS priority,
    CONCAT(a.accion, ' en ', a.tabla) AS title,
    CONCAT('Registro ID: ', COALESCE(a.registro_id, 'N/A'), ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')) AS description,
    -- CORRECCIÓN: Obtener nombre de persona (p_a)
    COALESCE(CONCAT(p_a.nombres, ' ', p_a.apellidos), 'Sistema') AS user_name,
    a.created_at AS activity_date,
    JSON_ARRAY('auditoría', a.accion, a.tabla) AS tags,
    0 AS attachments,
    a.ip_address,
    CONCAT('Tabla: ', a.tabla) AS location,
    'auditoria' AS source,
    a.created_at AS created_at
FROM auditoria a
LEFT JOIN usuario u_a ON a.usuario_id = u_a.id
LEFT JOIN persona p_a ON u_a.persona_id = p_a.id;

-- 7.2 Vista de estadísticas diarias (Sin cambios estructurales, ya que usa la vista 7.1)
CREATE OR REPLACE VIEW vista_estadisticas_bitacora_diarias AS
SELECT
    DATE(activity_date) AS fecha,
    COUNT(*) AS total_actividades,
    COUNT(CASE WHEN type = 'system' THEN 1 END) AS system_activities,
    COUNT(CASE WHEN type = 'user' THEN 1 END) AS user_activities,
    COUNT(CASE WHEN type = 'security' THEN 1 END) AS security_activities,
    COUNT(CASE WHEN type = 'maintenance' THEN 1 END) AS maintenance_activities,
    COUNT(CASE WHEN type = 'admin' THEN 1 END) AS admin_activities,
    COUNT(CASE WHEN type = 'financial' THEN 1 END) AS financial_activities,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) AS critical_priority,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) AS high_priority,
    COUNT(CASE WHEN priority = 'normal' THEN 1 END) AS normal_priority,
    COUNT(CASE WHEN priority = 'low' THEN 1 END) AS low_priority
FROM vista_actividades_unificadas
GROUP BY DATE(activity_date)
ORDER BY fecha DESC;

-- 7.3 Vista de actividades por usuario (Sin cambios estructurales, ya que usa la vista 7.1)
CREATE OR REPLACE VIEW vista_actividades_por_usuario AS
SELECT
    user_name,
    COUNT(*) AS total_actividades,
    COUNT(CASE WHEN source = 'bitacora' THEN 1 END) AS actividades_bitacora,
    COUNT(CASE WHEN source = 'auditoria' THEN 1 END) AS actividades_auditoria,
    MAX(activity_date) AS ultima_actividad,
    GROUP_CONCAT(DISTINCT type SEPARATOR ', ') AS tipos_actividad,
    GROUP_CONCAT(DISTINCT priority SEPARATOR ', ') AS prioridades
FROM vista_actividades_unificadas
GROUP BY user_name
ORDER BY total_actividades DESC;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS (Se eliminan los CREATE INDEX de las vistas ya que se basan en la tabla base)
-- =========================================

-- Índices para tabla registro_conserjeria
CREATE INDEX idx_bitacora_fecha_hora ON registro_conserjeria(fecha_hora);
CREATE INDEX idx_bitacora_comunidad_fecha ON registro_conserjeria(comunidad_id, fecha_hora);
CREATE INDEX idx_bitacora_usuario_fecha ON registro_conserjeria(usuario_id, fecha_hora);
CREATE INDEX idx_bitacora_evento ON registro_conserjeria(evento);

-- =========================================
-- CONSULTAS PARA NUEVA TABLA BITACORA_AUDITORIA
-- Sistema avanzado de auditoría
-- =========================================

-- 1. LISTADO DE ACTIVIDADES DE AUDITORÍA CON FILTROS
SELECT
    JSON_OBJECT(
        'id', ba.id,
        'type', ba.tipo,
        'priority', ba.prioridad,
        'title', ba.titulo,
        'description', COALESCE(ba.descripcion, ''),
        'user', COALESCE(ba.usuario, 'Sistema'),
        'date', ba.fecha,
        'tags', COALESCE(ba.tags, JSON_ARRAY()),
        'attachments', JSON_LENGTH(COALESCE(ba.adjuntos, '[]')),
        'ip', ba.ip,
        'location', ba.ubicacion
    ) AS actividad
FROM bitacora_auditoria ba
WHERE ba.comunidad_id = 1
ORDER BY ba.fecha DESC
LIMIT 50;

-- 2. ESTADÍSTICAS DE BITÁCORA DE AUDITORÍA
SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN DATE(fecha) = CURDATE() THEN 1 END) as today,
    COUNT(CASE WHEN prioridad = 'high' THEN 1 END) as high,
    COUNT(CASE WHEN prioridad = 'critical' THEN 1 END) as critical,
    COUNT(CASE WHEN tipo = 'security' THEN 1 END) as security_events,
    COUNT(CASE WHEN tipo = 'user' THEN 1 END) as user_actions,
    COUNT(CASE WHEN tipo = 'system' THEN 1 END) as system_events
FROM bitacora_auditoria
WHERE comunidad_id = 1;

-- 3. BÚSQUEDA AVANZADA EN BITÁCORA
SELECT
    ba.id,
    ba.tipo,
    ba.prioridad,
    ba.titulo,
    ba.descripcion,
    ba.usuario,
    ba.fecha,
    ba.tags,
    JSON_LENGTH(ba.adjuntos) as attachments,
    ba.ip,
    ba.ubicacion
FROM bitacora_auditoria ba
WHERE ba.comunidad_id = 1
    AND (ba.titulo LIKE '%pago%' OR ba.descripcion LIKE '%pago%' OR JSON_SEARCH(ba.tags, 'one', 'pago') IS NOT NULL)
    AND ba.tipo = 'financial'
    AND ba.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY ba.fecha DESC;

-- 4. ACTIVIDADES POR USUARIO
SELECT
    ba.usuario,
    COUNT(*) as total_activities,
    COUNT(CASE WHEN ba.tipo = 'security' THEN 1 END) as security_actions,
    COUNT(CASE WHEN ba.prioridad = 'critical' THEN 1 END) as critical_actions,
    MAX(ba.fecha) as last_activity
FROM bitacora_auditoria ba
WHERE ba.comunidad_id = 1
GROUP BY ba.usuario
ORDER BY total_activities DESC;

-- 5. ACTIVIDADES RECIENTES (ÚLTIMAS 24 HORAS)
SELECT
    ba.tipo,
    ba.prioridad,
    ba.titulo,
    ba.usuario,
    ba.fecha,
    ba.ip
FROM bitacora_auditoria ba
WHERE ba.comunidad_id = 1
    AND ba.fecha >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY ba.fecha DESC;

-- =========================================
-- ÍNDICES OPTIMIZADOS PARA BITACORA_AUDITORIA
-- =========================================

CREATE INDEX idx_bitacora_auditoria_comunidad_fecha ON bitacora_auditoria(comunidad_id, fecha);
CREATE INDEX idx_bitacora_auditoria_tipo ON bitacora_auditoria(tipo);
CREATE INDEX idx_bitacora_auditoria_prioridad ON bitacora_auditoria(prioridad);
CREATE INDEX idx_bitacora_auditoria_usuario ON bitacora_auditoria(usuario_id);
CREATE INDEX idx_bitacora_auditoria_tags ON bitacora_auditoria(tags(255));
CREATE INDEX idx_bitacora_auditoria_ip ON bitacora_auditoria(ip);