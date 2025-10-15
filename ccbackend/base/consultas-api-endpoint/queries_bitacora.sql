-- =========================================
-- CONSULTAS SQL PARA MÓDULO BITÁCORA
-- Sistema de Cuentas Claras
-- =========================================

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
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        'location', c.nombre
    ) as actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
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
            WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla)
    ) as actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
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
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        'location', c.nombre,
        'source', 'bitacora'
    ) as actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
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
            WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla),
        'source', 'auditoria'
    ) as actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id

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
            'name', COALESCE(u.nombre, 'Sistema'),
            'email', u.email,
            'role', COALESCE(r.nombre, 'Sistema')
        ),
        'date', rc.fecha_hora,
        'created_at', rc.created_at,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', JSON_ARRAY(),
        'metadata', JSON_OBJECT(
            'comunidad', JSON_OBJECT(
                'id', c.id,
                'name', c.nombre
            ),
            'evento_type', rc.evento,
            'source', 'bitacora'
        ),
        'ip', NULL,
        'location', c.nombre
    ) as actividad_detallada
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN rol r ON u.rol_id = r.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
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
            WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
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
            'name', COALESCE(u.nombre, 'Sistema'),
            'email', u.email,
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
    ) as actividad_detallada
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
LEFT JOIN rol r ON u.rol_id = r.id
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
            WHERE tabla IN ('pago', 'gasto', 'usuario', 'permisos')
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ),
        'critical', (
            SELECT COUNT(*) FROM auditoria
            WHERE tabla IN ('usuario', 'permisos')
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        ),
        'by_type', JSON_OBJECT(
            'system', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento NOT IN ('entrega', 'retiro', 'visita', 'reporte')) + (SELECT COUNT(*) FROM auditoria),
            'user', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento IN ('entrega', 'retiro')),
            'security', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento IN ('visita', 'reporte')),
            'maintenance', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento = 'otro'),
            'admin', (SELECT COUNT(*) FROM auditoria WHERE accion = 'UPDATE'),
            'financial', (SELECT COUNT(*) FROM auditoria WHERE tabla IN ('pago', 'gasto'))
        ),
        'by_priority', JSON_OBJECT(
            'low', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento IN ('entrega', 'retiro')),
            'normal', (SELECT COUNT(*) FROM registro_conserjeria WHERE evento NOT IN ('entrega', 'retiro')) + (SELECT COUNT(*) FROM auditoria WHERE tabla NOT IN ('usuario', 'permisos', 'pago', 'gasto')),
            'high', (SELECT COUNT(*) FROM auditoria WHERE tabla IN ('pago', 'gasto')),
            'critical', (SELECT COUNT(*) FROM auditoria WHERE tabla IN ('usuario', 'permisos'))
        )
    ) as estadisticas;

-- 3.2 Estadísticas por comunidad
SELECT
    JSON_OBJECT(
        'comunidad_id', c.id,
        'comunidad_name', c.nombre,
        'total_actividades', COUNT(rc.id),
        'actividades_hoy', COUNT(CASE WHEN DATE(rc.fecha_hora) = CURDATE() THEN 1 END),
        'tipos_eventos', JSON_OBJECTAGG(
            rc.evento,
            COUNT(*)
        )
    ) as estadisticas_comunidad
FROM comunidad c
LEFT JOIN registro_conserjeria rc ON c.id = rc.comunidad_id
GROUP BY c.id, c.nombre
ORDER BY COUNT(rc.id) DESC;

-- 3.3 Top usuarios más activos
SELECT
    JSON_OBJECT(
        'usuario_id', u.id,
        'usuario_name', COALESCE(u.nombre, 'Sistema'),
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
    ) as usuario_estadisticas
FROM usuario u
LEFT JOIN rol r ON u.rol_id = r.id
LEFT JOIN (
    SELECT usuario_id, COUNT(*) as total_bitacora, MAX(fecha_hora) as ultima_bitacora
    FROM registro_conserjeria
    GROUP BY usuario_id
) bitacora_count ON u.id = bitacora_count.usuario_id
LEFT JOIN (
    SELECT usuario_id, COUNT(*) as total_auditoria, MAX(created_at) as ultima_auditoria
    FROM auditoria
    GROUP BY usuario_id
) auditoria_count ON u.id = auditoria_count.usuario_id
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
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        'location', c.nombre
    ) as actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
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
            WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla)
    ) as actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE CASE
    WHEN ? = 'critical' THEN a.tabla IN ('usuario', 'permisos')
    WHEN ? = 'high' THEN a.tabla IN ('pago', 'gasto')
    WHEN ? = 'normal' THEN a.tabla NOT IN ('usuario', 'permisos', 'pago', 'gasto')
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
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        'location', c.nombre,
        'source', 'bitacora'
    ) as actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
WHERE rc.evento LIKE CONCAT('%', ?, '%')
   OR COALESCE(rc.detalle, '') LIKE CONCAT('%', ?, '%')
   OR COALESCE(u.nombre, '') LIKE CONCAT('%', ?, '%')
   OR c.nombre LIKE CONCAT('%', ?, '%')

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
            WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla),
        'source', 'auditoria'
    ) as actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.accion LIKE CONCAT('%', ?, '%')
   OR a.tabla LIKE CONCAT('%', ?, '%')
   OR COALESCE(u.nombre, '') LIKE CONCAT('%', ?, '%')
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
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', rc.fecha_hora,
        'tags', JSON_ARRAY('bitácora', rc.evento),
        'attachments', 0,
        'ip', NULL,
        'location', c.nombre,
        'source', 'bitacora'
    ) as actividad
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
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
            WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
            WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
            ELSE 'normal'
        END,
        'title', CONCAT(a.accion, ' en ', a.tabla),
        'description', CONCAT(
            'Registro ID: ', COALESCE(a.registro_id, 'N/A'),
            ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')
        ),
        'user', COALESCE(u.nombre, 'Sistema'),
        'date', a.created_at,
        'tags', JSON_ARRAY('auditoría', a.accion, a.tabla),
        'attachments', 0,
        'ip', a.ip_address,
        'location', CONCAT('Tabla: ', a.tabla),
        'source', 'auditoria'
    ) as actividad
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE DATE(a.created_at) BETWEEN ? AND ?

ORDER BY JSON_UNQUOTE(JSON_EXTRACT(actividad, '$.date')) DESC
LIMIT ? OFFSET ?;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa para Excel/CSV
SELECT
    'bitacora' as source,
    rc.id as record_id,
    CASE
        WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
        WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
        WHEN rc.evento = 'otro' THEN 'maintenance'
        ELSE 'system'
    END as type,
    'normal' as priority,
    CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))) as title,
    COALESCE(rc.detalle, 'Sin descripción') as description,
    COALESCE(u.nombre, 'Sistema') as user_name,
    rc.fecha_hora as activity_date,
    c.nombre as location,
    NULL as ip_address,
    rc.evento as event_type,
    rc.created_at as created_at
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id

UNION ALL

SELECT
    'auditoria' as source,
    a.id as record_id,
    CASE
        WHEN a.accion = 'INSERT' THEN 'user'
        WHEN a.accion = 'UPDATE' THEN 'admin'
        WHEN a.accion = 'DELETE' THEN 'security'
        ELSE 'system'
    END as type,
    CASE
        WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
        WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
        ELSE 'normal'
    END as priority,
    CONCAT(a.accion, ' en ', a.tabla) as title,
    CONCAT('Registro ID: ', COALESCE(a.registro_id, 'N/A'), ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')) as description,
    COALESCE(u.nombre, 'Sistema') as user_name,
    a.created_at as activity_date,
    CONCAT('Tabla: ', a.tabla) as location,
    a.ip_address,
    a.accion as event_type,
    a.created_at as created_at
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id

ORDER BY activity_date DESC;

-- 5.2 Exportación filtrada por comunidad
SELECT
    c.nombre as comunidad,
    COUNT(rc.id) as total_actividades,
    COUNT(CASE WHEN DATE(rc.fecha_hora) = CURDATE() THEN 1 END) as actividades_hoy,
    GROUP_CONCAT(DISTINCT rc.evento SEPARATOR ', ') as tipos_eventos
FROM comunidad c
LEFT JOIN registro_conserjeria rc ON c.id = rc.comunidad_id
WHERE c.id = ?
GROUP BY c.id, c.nombre;

-- 5.3 Exportación de resumen por usuario
SELECT
    COALESCE(u.nombre, 'Sistema') as usuario,
    COALESCE(r.nombre, 'Sistema') as rol,
    COUNT(rc.id) as actividades_bitacora,
    COUNT(a.id) as actividades_auditoria,
    COUNT(rc.id) + COUNT(a.id) as total_actividades,
    MAX(GREATEST(COALESCE(rc.fecha_hora, '2000-01-01'), COALESCE(a.created_at, '2000-01-01'))) as ultima_actividad
FROM usuario u
LEFT JOIN rol r ON u.rol_id = r.id
LEFT JOIN registro_conserjeria rc ON u.id = rc.usuario_id
LEFT JOIN auditoria a ON u.id = a.usuario_id
WHERE u.id = ?
GROUP BY u.id, u.nombre, r.nombre;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de datos de bitácora
SELECT
    'bitacora_integrity' as check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    CONCAT('Registros sin comunidad válida: ', COUNT(*)) as message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', rc.id,
            'comunidad_id', rc.comunidad_id,
            'evento', rc.evento
        )
    ) as details
FROM registro_conserjeria rc
LEFT JOIN comunidad c ON rc.comunidad_id = c.id
WHERE c.id IS NULL;

-- 6.2 Validar integridad de datos de auditoría
SELECT
    'auditoria_integrity' as check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    CONCAT('Registros sin usuario válido: ', COUNT(*)) as message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', a.id,
            'usuario_id', a.usuario_id,
            'accion', a.accion,
            'tabla', a.tabla
        )
    ) as details
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE a.usuario_id IS NOT NULL AND u.id IS NULL;

-- 6.3 Validar consistencia de fechas
SELECT
    'date_consistency' as check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    CONCAT('Registros con fechas futuras: ', COUNT(*)) as message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', rc.id,
            'fecha_hora', rc.fecha_hora,
            'created_at', rc.created_at
        )
    ) as details
FROM registro_conserjeria rc
WHERE rc.fecha_hora > NOW() OR rc.created_at > NOW();

-- 6.4 Validar datos requeridos
SELECT
    'required_fields' as check_type,
    CASE
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END as status,
    CONCAT('Registros con campos requeridos nulos: ', COUNT(*)) as message,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', rc.id,
            'evento', rc.evento,
            'comunidad_id', rc.comunidad_id
        )
    ) as details
FROM registro_conserjeria rc
WHERE rc.evento IS NULL OR rc.evento = ''
   OR rc.comunidad_id IS NULL;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista unificada de actividades (para listados rápidos)
CREATE OR REPLACE VIEW vista_actividades_unificadas AS
SELECT
    CONCAT('bitacora_', rc.id) as id,
    CASE
        WHEN rc.evento IN ('entrega', 'retiro') THEN 'user'
        WHEN rc.evento IN ('visita', 'reporte') THEN 'security'
        WHEN rc.evento = 'otro' THEN 'maintenance'
        ELSE 'system'
    END as type,
    'normal' as priority,
    CONCAT(UPPER(LEFT(rc.evento, 1)), LOWER(SUBSTRING(rc.evento, 2))) as title,
    COALESCE(rc.detalle, 'Sin descripción') as description,
    COALESCE(u.nombre, 'Sistema') as user_name,
    rc.fecha_hora as activity_date,
    JSON_ARRAY('bitácora', rc.evento) as tags,
    0 as attachments,
    NULL as ip_address,
    c.nombre as location,
    'bitacora' as source,
    rc.created_at as created_at
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
LEFT JOIN comunidad c ON rc.comunidad_id = c.id

UNION ALL

SELECT
    CONCAT('auditoria_', a.id) as id,
    CASE
        WHEN a.accion = 'INSERT' THEN 'user'
        WHEN a.accion = 'UPDATE' THEN 'admin'
        WHEN a.accion = 'DELETE' THEN 'security'
        ELSE 'system'
    END as type,
    CASE
        WHEN a.tabla IN ('usuario', 'permisos') THEN 'critical'
        WHEN a.tabla IN ('pago', 'gasto') THEN 'high'
        ELSE 'normal'
    END as priority,
    CONCAT(a.accion, ' en ', a.tabla) as title,
    CONCAT('Registro ID: ', COALESCE(a.registro_id, 'N/A'), ' - Valores nuevos: ', COALESCE(a.valores_nuevos, 'N/A')) as description,
    COALESCE(u.nombre, 'Sistema') as user_name,
    a.created_at as activity_date,
    JSON_ARRAY('auditoría', a.accion, a.tabla) as tags,
    0 as attachments,
    a.ip_address,
    CONCAT('Tabla: ', a.tabla) as location,
    'auditoria' as source,
    a.created_at as created_at
FROM auditoria a
LEFT JOIN usuario u ON a.usuario_id = u.id;

-- 7.2 Vista de estadísticas diarias
CREATE OR REPLACE VIEW vista_estadisticas_bitacora_diarias AS
SELECT
    DATE(activity_date) as fecha,
    COUNT(*) as total_actividades,
    COUNT(CASE WHEN type = 'system' THEN 1 END) as system_activities,
    COUNT(CASE WHEN type = 'user' THEN 1 END) as user_activities,
    COUNT(CASE WHEN type = 'security' THEN 1 END) as security_activities,
    COUNT(CASE WHEN type = 'maintenance' THEN 1 END) as maintenance_activities,
    COUNT(CASE WHEN type = 'admin' THEN 1 END) as admin_activities,
    COUNT(CASE WHEN type = 'financial' THEN 1 END) as financial_activities,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_priority,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
    COUNT(CASE WHEN priority = 'normal' THEN 1 END) as normal_priority,
    COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
FROM vista_actividades_unificadas
GROUP BY DATE(activity_date)
ORDER BY fecha DESC;

-- 7.3 Vista de actividades por usuario
CREATE OR REPLACE VIEW vista_actividades_por_usuario AS
SELECT
    user_name,
    COUNT(*) as total_actividades,
    COUNT(CASE WHEN source = 'bitacora' THEN 1 END) as actividades_bitacora,
    COUNT(CASE WHEN source = 'auditoria' THEN 1 END) as actividades_auditoria,
    MAX(activity_date) as ultima_actividad,
    GROUP_CONCAT(DISTINCT type SEPARATOR ', ') as tipos_actividad,
    GROUP_CONCAT(DISTINCT priority SEPARATOR ', ') as prioridades
FROM vista_actividades_unificadas
GROUP BY user_name
ORDER BY total_actividades DESC;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para tabla registro_conserjeria
-- CREATE INDEX idx_bitacora_fecha_hora ON registro_conserjeria(fecha_hora);
-- CREATE INDEX idx_bitacora_comunidad_fecha ON registro_conserjeria(comunidad_id, fecha_hora);
-- CREATE INDEX idx_bitacora_usuario_fecha ON registro_conserjeria(usuario_id, fecha_hora);
-- CREATE INDEX idx_bitacora_evento ON registro_conserjeria(evento);

-- Índices para tabla auditoria
-- CREATE INDEX idx_auditoria_created_at ON auditoria(created_at);
-- CREATE INDEX idx_auditoria_usuario_fecha ON auditoria(usuario_id, created_at);
-- CREATE INDEX idx_auditoria_tabla_accion ON auditoria(tabla, accion);
-- CREATE INDEX idx_auditoria_ip ON auditoria(ip_address);

-- Índices para vistas
-- CREATE INDEX idx_vista_actividades_fecha ON vista_actividades_unificadas(activity_date);
-- CREATE INDEX idx_vista_actividades_tipo ON vista_actividades_unificadas(type);
-- CREATE INDEX idx_vista_actividades_usuario ON vista_actividades_unificadas(user_name);</content>
<parameter name="filePath">c:\Users\patri\Documents\GitHub\proyecto_cuentas_claras\ccfrontend\queries_bitacora.sql