-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO NOTIFICACIONES
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de notificaciones con filtros
SELECT
    n.id,
    n.asunto,
    n.mensaje,
    n.tipo,
    n.estado,
    n.canales,
    n.audiencia_tipo,
    n.audiencia_cantidad,
    n.audiencia_descripcion,
    c.razon_social as comunidad,
    u.nombre as autor,
    n.fecha_creacion,
    n.fecha_envio,
    n.fecha_programada,
    n.prioridad,
    n.seguimiento_apertura,
    n.confirmacion_requerida,
    -- Estadísticas de entrega
    COALESCE(nd.enviados, 0) as enviados,
    COALESCE(nd.entregados, 0) as entregados,
    COALESCE(nd.abiertos, 0) as abiertos,
    COALESCE(nd.clicados, 0) as clicados,
    COALESCE(nd.fallidos, 0) as fallidos,
    -- Cálculos adicionales
    CASE
        WHEN n.estado = 'sent' THEN 'enviada'
        WHEN n.estado = 'draft' THEN 'borrador'
        WHEN n.estado = 'scheduled' THEN 'programada'
        WHEN n.estado = 'failed' THEN 'fallida'
    END as estado_descripcion,
    CASE
        WHEN n.fecha_programada IS NOT NULL AND n.fecha_programada > NOW() THEN 'pendiente'
        WHEN n.fecha_programada IS NOT NULL AND n.fecha_programada <= NOW() AND n.estado = 'scheduled' THEN 'lista_para_enviar'
        ELSE 'procesada'
    END as estado_programacion,
    DATEDIFF(NOW(), n.fecha_creacion) as dias_desde_creacion
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN (
    SELECT
        notificacion_id,
        SUM(enviados) as enviados,
        SUM(entregados) as entregados,
        SUM(abiertos) as abiertos,
        SUM(clicados) as clicados,
        SUM(fallidos) as fallidos
    FROM notificacion_estadistica
    GROUP BY notificacion_id
) nd ON n.id = nd.notificacion_id
WHERE
    (:comunidad_id IS NULL OR n.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR n.estado = :estado) AND
    (:tipo IS NULL OR n.tipo = :tipo) AND
    (:usuario_autor_id IS NULL OR n.usuario_autor_id = :usuario_autor_id) AND
    (:fecha_desde IS NULL OR n.fecha_creacion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR n.fecha_creacion <= :fecha_hasta) AND
    (:canal IS NULL OR JSON_CONTAINS(n.canales, JSON_QUOTE(:canal)))
ORDER BY
    CASE
        WHEN :ordenar_por = 'fecha_programada' THEN n.fecha_programada
        ELSE n.fecha_creacion
    END DESC,
    n.id DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de notificaciones por comunidad con estadísticas
SELECT
    c.razon_social as comunidad,
    COUNT(n.id) as total_notificaciones,
    COUNT(CASE WHEN n.estado = 'sent' THEN 1 END) as enviadas,
    COUNT(CASE WHEN n.estado = 'draft' THEN 1 END) as borradores,
    COUNT(CASE WHEN n.estado = 'scheduled' THEN 1 END) as programadas,
    COUNT(CASE WHEN n.estado = 'failed' THEN 1 END) as fallidas,
    SUM(COALESCE(ne.enviados, 0)) as total_enviados,
    SUM(COALESCE(ne.entregados, 0)) as total_entregados,
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_promedio,
    MAX(n.fecha_creacion) as ultima_notificacion
FROM comunidad c
LEFT JOIN notificacion n ON c.id = n.comunidad_id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Notificaciones programadas pendientes
SELECT
    n.id,
    n.asunto,
    n.tipo,
    c.razon_social as comunidad,
    u.nombre as autor,
    n.fecha_programada,
    n.audiencia_cantidad,
    n.canales,
    TIMESTAMPDIFF(MINUTE, NOW(), n.fecha_programada) as minutos_restantes,
    CASE
        WHEN TIMESTAMPDIFF(MINUTE, NOW(), n.fecha_programada) <= 0 THEN 'lista_para_enviar'
        WHEN TIMESTAMPDIFF(MINUTE, NOW(), n.fecha_programada) <= 60 THEN 'próxima_hora'
        WHEN TIMESTAMPDIFF(HOUR, NOW(), n.fecha_programada) <= 24 THEN 'hoy'
        ELSE 'futuro'
    END as urgencia_envio
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
WHERE n.estado = 'scheduled'
    AND n.fecha_programada > NOW()
ORDER BY n.fecha_programada ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una notificación específica
SELECT
    n.id,
    n.asunto,
    n.mensaje,
    n.tipo,
    n.estado,
    n.canales,
    n.audiencia_tipo,
    n.audiencia_cantidad,
    n.audiencia_descripcion,
    n.audiencia_detalles,
    c.id as comunidad_id,
    c.razon_social as comunidad_nombre,
    u.id as autor_id,
    u.nombre as autor_nombre,
    u.email as autor_email,
    n.fecha_creacion,
    n.fecha_envio,
    n.fecha_programada,
    n.prioridad,
    n.seguimiento_apertura,
    n.confirmacion_requerida,
    n.contenido_html,
    n.contenido_plano,
    -- Estadísticas completas
    JSON_OBJECT(
        'enviados', COALESCE(SUM(ne.enviados), 0),
        'entregados', COALESCE(SUM(ne.entregados), 0),
        'abiertos', COALESCE(SUM(ne.abiertos), 0),
        'clicados', COALESCE(SUM(ne.clicados), 0),
        'fallidos', COALESCE(SUM(ne.fallidos), 0),
        'tasa_entrega', ROUND(
            CASE
                WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                    (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
                ELSE 0
            END, 2
        ),
        'tasa_apertura', ROUND(
            CASE
                WHEN SUM(COALESCE(ne.entregados, 0)) > 0 THEN
                    (SUM(COALESCE(ne.abiertos, 0)) * 100.0 / SUM(COALESCE(ne.entregados, 0)))
                ELSE 0
            END, 2
        )
    ) as estadisticas_entrega,
    -- Conteos relacionados
    (SELECT COUNT(*) FROM notificacion_adjunto na WHERE na.notificacion_id = n.id) as num_adjuntos,
    (SELECT COUNT(*) FROM notificacion_historial nh WHERE nh.notificacion_id = n.id) as num_historial
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
WHERE n.id = :notificacion_id
GROUP BY n.id, c.id, c.razon_social, u.id, u.nombre, u.email;

-- 2.2 Vista de notificaciones con información completa para listado
SELECT
    n.id,
    n.asunto,
    n.estado,
    n.tipo,
    n.canales,
    n.audiencia_cantidad,
    c.razon_social as comunidad,
    u.nombre as autor,
    n.fecha_creacion,
    n.fecha_envio,
    n.fecha_programada,
    JSON_OBJECT(
        'notificacion', JSON_OBJECT(
            'id', n.id,
            'asunto', n.asunto,
            'tipo', n.tipo,
            'estado', n.estado,
            'canales', n.canales
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'autor', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'nombre', u.nombre,
                'email', u.email
            )
            ELSE NULL
        END,
        'audiencia', JSON_OBJECT(
            'tipo', n.audiencia_tipo,
            'cantidad', n.audiencia_cantidad,
            'descripcion', n.audiencia_descripcion
        ),
        'estadisticas', JSON_OBJECT(
            'enviados', COALESCE(SUM(ne.enviados), 0),
            'entregados', COALESCE(SUM(ne.entregados), 0),
            'abiertos', COALESCE(SUM(ne.abiertos), 0),
            'clicados', COALESCE(SUM(ne.clicados), 0)
        )
    ) as informacion_completa
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
GROUP BY n.id, c.id, c.razon_social, u.id, u.nombre, u.email
ORDER BY n.fecha_creacion DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de notificaciones
SELECT
    COUNT(*) as total_notificaciones,
    COUNT(DISTINCT comunidad_id) as comunidades_con_notificaciones,
    COUNT(CASE WHEN estado = 'sent' THEN 1 END) as notificaciones_enviadas,
    COUNT(CASE WHEN estado = 'draft' THEN 1 END) as notificaciones_borrador,
    COUNT(CASE WHEN estado = 'scheduled' THEN 1 END) as notificaciones_programadas,
    COUNT(CASE WHEN estado = 'failed' THEN 1 END) as notificaciones_fallidas,
    ROUND(
        (COUNT(CASE WHEN estado = 'sent' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_enviadas,
    SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as total_mensajes_enviados,
    SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as total_mensajes_entregados,
    ROUND(
        CASE
            WHEN SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) > 0 THEN
                (SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) * 100.0 /
                 SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_global,
    MIN(fecha_creacion) as primera_notificacion,
    MAX(fecha_creacion) as ultima_notificacion
FROM notificacion n;

-- 3.2 Estadísticas por estado
SELECT
    estado,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion)), 2
    ) as porcentaje,
    SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as mensajes_enviados,
    ROUND(
        CASE
            WHEN SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) > 0 THEN
                (SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) * 100.0 /
                 SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega,
    MIN(fecha_creacion) as mas_antigua,
    MAX(fecha_creacion) as mas_reciente
FROM notificacion n
GROUP BY estado
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por tipo
SELECT
    tipo,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion)), 2
    ) as porcentaje,
    COUNT(CASE WHEN estado = 'sent' THEN 1 END) as enviadas,
    ROUND(
        (COUNT(CASE WHEN estado = 'sent' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_enviadas_tipo,
    SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as total_enviados,
    ROUND(
        CASE
            WHEN SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) > 0 THEN
                (SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) * 100.0 /
                 SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_promedio
FROM notificacion n
GROUP BY tipo
ORDER BY cantidad DESC;

-- 3.4 Estadísticas por canal
SELECT
    canal,
    COUNT(DISTINCT n.id) as notificaciones_usando_canal,
    SUM(COALESCE(ne.enviados, 0)) as mensajes_enviados,
    SUM(COALESCE(ne.entregados, 0)) as mensajes_entregados,
    SUM(COALESCE(ne.abiertos, 0)) as mensajes_abiertos,
    SUM(COALESCE(ne.clicados, 0)) as mensajes_clicados,
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega,
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.entregados, 0)) > 0 THEN
                (SUM(COALESCE(ne.abiertos, 0)) * 100.0 / SUM(COALESCE(ne.entregados, 0)))
            ELSE 0
        END, 2
    ) as tasa_apertura
FROM notificacion n
CROSS JOIN (
    SELECT 'email' as canal
    UNION SELECT 'sms'
    UNION SELECT 'push'
    UNION SELECT 'app'
) canales
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id AND ne.canal = canales.canal
WHERE JSON_CONTAINS(n.canales, JSON_QUOTE(canales.canal))
GROUP BY canal
ORDER BY notificaciones_usando_canal DESC;

-- 3.5 Estadísticas mensuales de notificaciones
SELECT
    YEAR(fecha_creacion) as anio,
    MONTH(fecha_creacion) as mes,
    COUNT(*) as total_notificaciones,
    COUNT(CASE WHEN estado = 'sent' THEN 1 END) as enviadas,
    COUNT(CASE WHEN estado = 'draft' THEN 1 END) as borradores,
    COUNT(CASE WHEN estado = 'scheduled' THEN 1 END) as programadas,
    COUNT(CASE WHEN estado = 'failed' THEN 1 END) as fallidas,
    SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as total_enviados,
    ROUND(
        CASE
            WHEN SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) > 0 THEN
                (SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) * 100.0 /
                 SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_promedio
FROM notificacion n
WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(fecha_creacion), MONTH(fecha_creacion)
ORDER BY anio DESC, mes DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de notificaciones
SELECT
    n.id,
    n.asunto,
    n.estado,
    n.tipo,
    n.canales,
    n.audiencia_cantidad,
    c.razon_social as comunidad,
    u.nombre as autor,
    n.fecha_creacion,
    n.fecha_envio,
    n.fecha_programada,
    SUM(COALESCE(ne.enviados, 0)) as enviados,
    SUM(COALESCE(ne.entregados, 0)) as entregados,
    SUM(COALESCE(ne.abiertos, 0)) as abiertos,
    CASE
        WHEN n.estado = 'scheduled' AND n.fecha_programada > NOW() THEN 'pendiente'
        WHEN n.estado = 'scheduled' AND n.fecha_programada <= NOW() THEN 'lista_para_enviar'
        WHEN n.estado = 'sent' THEN 'enviada'
        WHEN n.estado = 'draft' THEN 'borrador'
        WHEN n.estado = 'failed' THEN 'fallida'
    END as estado_actual
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
WHERE
    (:busqueda IS NULL OR
     n.asunto LIKE CONCAT('%', :busqueda, '%') OR
     n.mensaje LIKE CONCAT('%', :busqueda, '%') OR
     u.nombre LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR n.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR n.estado = :estado) AND
    (:tipo IS NULL OR n.tipo = :tipo) AND
    (:usuario_autor_id IS NULL OR n.usuario_autor_id = :usuario_autor_id) AND
    (:fecha_desde IS NULL OR n.fecha_creacion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR n.fecha_creacion <= :fecha_hasta) AND
    (:canal IS NULL OR JSON_CONTAINS(n.canales, JSON_QUOTE(:canal)))
GROUP BY n.id, c.id, c.razon_social, u.id, u.nombre
ORDER BY n.fecha_creacion DESC, n.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Notificaciones por autor con estadísticas
SELECT
    u.id as usuario_id,
    u.nombre as autor,
    u.email,
    COUNT(n.id) as total_notificaciones,
    COUNT(CASE WHEN n.estado = 'sent' THEN 1 END) as enviadas,
    COUNT(CASE WHEN n.estado = 'draft' THEN 1 END) as borradores,
    COUNT(CASE WHEN n.estado = 'scheduled' THEN 1 END) as programadas,
    COUNT(CASE WHEN n.estado = 'failed' THEN 1 END) as fallidas,
    SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as total_enviados,
    ROUND(
        CASE
            WHEN SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) > 0 THEN
                (SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) * 100.0 /
                 SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_promedio,
    MAX(n.fecha_creacion) as ultima_notificacion
FROM usuario u
LEFT JOIN notificacion n ON u.id = n.usuario_autor_id
WHERE (:comunidad_id IS NULL OR n.comunidad_id = :comunidad_id)
GROUP BY u.id, u.nombre, u.email
HAVING COUNT(n.id) > 0
ORDER BY total_notificaciones DESC;

-- 4.3 Notificaciones por tipo de audiencia
SELECT
    audiencia_tipo,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion)), 2
    ) as porcentaje,
    SUM(audiencia_cantidad) as total_destinatarios,
    AVG(audiencia_cantidad) as promedio_destinatarios,
    SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) as total_enviados,
    ROUND(
        CASE
            WHEN SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) > 0 THEN
                (SUM(COALESCE((SELECT SUM(entregados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)) * 100.0 /
                 SUM(COALESCE((SELECT SUM(enviados) FROM notificacion_estadistica ne WHERE ne.notificacion_id = n.id), 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_promedio
FROM notificacion n
GROUP BY audiencia_tipo
ORDER BY cantidad DESC;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de notificaciones para Excel/CSV
SELECT
    n.id as 'ID',
    n.asunto as 'Asunto',
    n.mensaje as 'Mensaje',
    n.tipo as 'Tipo',
    n.estado as 'Estado',
    n.canales as 'Canales',
    n.audiencia_tipo as 'Tipo Audiencia',
    n.audiencia_cantidad as 'Cantidad Destinatarios',
    n.audiencia_descripcion as 'Descripción Audiencia',
    c.razon_social as 'Comunidad',
    COALESCE(u.nombre, '') as 'Autor',
    DATE_FORMAT(n.fecha_creacion, '%Y-%m-%d %H:%i:%s') as 'Fecha Creación',
    DATE_FORMAT(n.fecha_envio, '%Y-%m-%d %H:%i:%s') as 'Fecha Envío',
    DATE_FORMAT(n.fecha_programada, '%Y-%m-%d %H:%i:%s') as 'Fecha Programada',
    n.prioridad as 'Prioridad',
    COALESCE(SUM(ne.enviados), 0) as 'Enviados',
    COALESCE(SUM(ne.entregados), 0) as 'Entregados',
    COALESCE(SUM(ne.abiertos), 0) as 'Abiertos',
    COALESCE(SUM(ne.clicados), 0) as 'Clicados',
    COALESCE(SUM(ne.fallidos), 0) as 'Fallidos'
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
GROUP BY n.id, c.id, c.razon_social, u.id, u.nombre
ORDER BY n.fecha_creacion DESC;

-- 5.2 Exportación de notificaciones enviadas con estadísticas
SELECT
    n.asunto as 'Notificación',
    c.razon_social as 'Comunidad',
    COALESCE(u.nombre, '') as 'Autor',
    n.tipo as 'Tipo',
    DATE_FORMAT(n.fecha_envio, '%Y-%m-%d %H:%i') as 'Enviada',
    n.audiencia_cantidad as 'Destinatarios',
    n.canales as 'Canales',
    COALESCE(SUM(ne.enviados), 0) as 'Enviados',
    COALESCE(SUM(ne.entregados), 0) as 'Entregados',
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
            ELSE 0
        END, 2
    ) as 'Tasa Entrega (%)',
    COALESCE(SUM(ne.abiertos), 0) as 'Abiertos',
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.entregados, 0)) > 0 THEN
                (SUM(COALESCE(ne.abiertos, 0)) * 100.0 / SUM(COALESCE(ne.entregados, 0)))
            ELSE 0
        END, 2
    ) as 'Tasa Apertura (%)'
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
WHERE n.estado = 'sent'
GROUP BY n.id, c.id, c.razon_social, u.id, u.nombre
ORDER BY n.fecha_envio DESC;

-- 5.3 Exportación de estadísticas de entrega por mes
SELECT
    YEAR(n.fecha_creacion) as 'Año',
    MONTH(n.fecha_creacion) as 'Mes',
    COUNT(*) as 'Total Notificaciones',
    COUNT(CASE WHEN n.estado = 'sent' THEN 1 END) as 'Enviadas',
    SUM(COALESCE(ne.enviados, 0)) as 'Total Enviados',
    SUM(COALESCE(ne.entregados, 0)) as 'Total Entregados',
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
            ELSE 0
        END, 2
    ) as 'Tasa Entrega Promedio (%)',
    SUM(COALESCE(ne.abiertos, 0)) as 'Total Abiertos',
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.entregados, 0)) > 0 THEN
                (SUM(COALESCE(ne.abiertos, 0)) * 100.0 / SUM(COALESCE(ne.entregados, 0)))
            ELSE 0
        END, 2
    ) as 'Tasa Apertura Promedio (%)'
FROM notificacion n
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
WHERE n.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(n.fecha_creacion), MONTH(n.fecha_creacion)
ORDER BY YEAR(n.fecha_creacion) DESC, MONTH(n.fecha_creacion) DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de notificaciones
SELECT
    'Notificaciones sin comunidad' as validacion,
    COUNT(*) as cantidad
FROM notificacion n
LEFT JOIN comunidad c ON n.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Notificaciones sin autor' as validacion,
    COUNT(*) as cantidad
FROM notificacion n
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Notificaciones enviadas sin fecha de envío' as validacion,
    COUNT(*) as cantidad
FROM notificacion
WHERE estado = 'sent' AND fecha_envio IS NULL
UNION ALL
SELECT
    'Notificaciones programadas sin fecha programada' as validacion,
    COUNT(*) as cantidad
FROM notificacion
WHERE estado = 'scheduled' AND fecha_programada IS NULL
UNION ALL
SELECT
    'Notificaciones con fecha programada en el pasado y estado scheduled' as validacion,
    COUNT(*) as cantidad
FROM notificacion
WHERE estado = 'scheduled' AND fecha_programada < NOW()
UNION ALL
SELECT
    'Notificaciones con canales inválidos' as validacion,
    COUNT(*) as cantidad
FROM notificacion
WHERE NOT JSON_VALID(canales) OR JSON_LENGTH(canales) = 0;

-- 6.2 Validar consistencia de estados y fechas
SELECT
    'Inconsistencias en estados y fechas' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Notificación ', n.asunto, ' (ID: ', n.id, '): estado ', n.estado, ' inconsistente')
        SEPARATOR '; '
    ) as detalles
FROM notificacion n
WHERE
    (estado = 'sent' AND fecha_envio IS NULL) OR
    (estado = 'scheduled' AND fecha_programada IS NULL) OR
    (estado NOT IN ('sent', 'scheduled') AND (fecha_envio IS NOT NULL OR fecha_programada IS NOT NULL)) OR
    (fecha_envio IS NOT NULL AND fecha_envio < fecha_creacion) OR
    (fecha_programada IS NOT NULL AND fecha_programada < fecha_creacion);

-- 6.3 Validar estadísticas de entrega
SELECT
    'Estadísticas de entrega inconsistentes' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Notificación ', n.asunto, ': entregados > enviados')
        SEPARATOR '; '
    ) as detalles
FROM notificacion n
JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
WHERE ne.entregados > ne.enviados
    OR ne.abiertos > ne.entregados
    OR ne.clicados > ne.abiertos;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de notificaciones
CREATE OR REPLACE VIEW vista_notificaciones_listado AS
SELECT
    n.id,
    n.asunto,
    n.estado,
    n.tipo,
    n.canales,
    n.audiencia_cantidad,
    c.razon_social as comunidad,
    u.nombre as autor,
    n.fecha_creacion,
    n.fecha_envio,
    n.fecha_programada,
    COALESCE(SUM(ne.enviados), 0) as enviados,
    COALESCE(SUM(ne.entregados), 0) as entregados,
    COALESCE(SUM(ne.abiertos), 0) as abiertos
FROM notificacion n
JOIN comunidad c ON n.comunidad_id = c.id
LEFT JOIN usuario u ON n.usuario_autor_id = u.id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
GROUP BY n.id, c.id, c.razon_social, u.id, u.nombre;

-- 7.2 Vista para estadísticas de notificaciones por comunidad
CREATE OR REPLACE VIEW vista_notificaciones_estadisticas AS
SELECT
    c.razon_social as comunidad,
    COUNT(n.id) as total_notificaciones,
    COUNT(CASE WHEN n.estado = 'sent' THEN 1 END) as enviadas,
    COUNT(CASE WHEN n.estado = 'draft' THEN 1 END) as borradores,
    COUNT(CASE WHEN n.estado = 'scheduled' THEN 1 END) as programadas,
    COUNT(CASE WHEN n.estado = 'failed' THEN 1 END) as fallidas,
    SUM(COALESCE(ne.enviados, 0)) as total_enviados,
    SUM(COALESCE(ne.entregados, 0)) as total_entregados,
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
            ELSE 0
        END, 2
    ) as tasa_entrega_promedio
FROM comunidad c
LEFT JOIN notificacion n ON c.id = n.comunidad_id
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de notificaciones
CREATE OR REPLACE VIEW vista_notificaciones_dashboard AS
SELECT
    'total' as tipo,
    COUNT(*) as valor
FROM notificacion
UNION ALL
SELECT
    'enviadas' as tipo,
    COUNT(*) as valor
FROM notificacion
WHERE estado = 'sent'
UNION ALL
SELECT
    'borradores' as tipo,
    COUNT(*) as valor
FROM notificacion
WHERE estado = 'draft'
UNION ALL
SELECT
    'programadas' as tipo,
    COUNT(*) as valor
FROM notificacion
WHERE estado = 'scheduled'
UNION ALL
SELECT
    'fallidas' as tipo,
    COUNT(*) as valor
FROM notificacion
WHERE estado = 'failed'
UNION ALL
SELECT
    'pendientes_envio' as tipo,
    COUNT(*) as valor
FROM notificacion
WHERE estado = 'scheduled' AND fecha_programada > NOW()
UNION ALL
SELECT
    'tasa_entrega_global' as tipo,
    ROUND(
        CASE
            WHEN SUM(COALESCE(ne.enviados, 0)) > 0 THEN
                (SUM(COALESCE(ne.entregados, 0)) * 100.0 / SUM(COALESCE(ne.enviados, 0)))
            ELSE 0
        END, 2
    ) as valor
FROM notificacion n
LEFT JOIN notificacion_estadistica ne ON n.id = ne.notificacion_id;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_notificacion_comunidad_id ON notificacion(comunidad_id);
CREATE INDEX idx_notificacion_usuario_autor_id ON notificacion(usuario_autor_id);
CREATE INDEX idx_notificacion_estado ON notificacion(estado);
CREATE INDEX idx_notificacion_tipo ON notificacion(tipo);
CREATE INDEX idx_notificacion_fecha_creacion ON notificacion(fecha_creacion DESC);
CREATE INDEX idx_notificacion_fecha_envio ON notificacion(fecha_envio);
CREATE INDEX idx_notificacion_fecha_programada ON notificacion(fecha_programada);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_notificacion_comunidad_estado ON notificacion(comunidad_id, estado);
CREATE INDEX idx_notificacion_estado_fecha ON notificacion(estado, fecha_creacion DESC);
CREATE INDEX idx_notificacion_autor_estado ON notificacion(usuario_autor_id, estado);
CREATE INDEX idx_notificacion_tipo_estado ON notificacion(tipo, estado);
CREATE INDEX idx_notificacion_fecha_rango ON notificacion(fecha_creacion, fecha_envio);

-- Índice para estadísticas mensuales
CREATE INDEX idx_notificacion_anio_mes ON notificacion(YEAR(fecha_creacion), MONTH(fecha_creacion));

-- Índices para estadísticas de entrega
CREATE INDEX idx_notificacion_estadistica_notificacion_id ON notificacion_estadistica(notificacion_id);
CREATE INDEX idx_notificacion_estadistica_canal ON notificacion_estadistica(canal);

-- Índices para validaciones
CREATE INDEX idx_notificacion_fechas_validacion ON notificacion(fecha_creacion, fecha_envio, fecha_programada);

-- Índice para búsqueda por asunto
CREATE INDEX idx_notificacion_asunto ON notificacion(asunto(50));