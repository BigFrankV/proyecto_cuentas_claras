-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO TICKETS
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de tickets con filtros
SELECT
    t.id,
    t.numero,
    t.asunto,
    t.descripcion,
    t.estado,
    t.prioridad,
    t.categoria,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(tu.nombre, '') as solicitante,
    COALESCE(ta.nombre, '') as asignado_a,
    t.fecha_creacion,
    t.fecha_actualizacion,
    t.fecha_vencimiento,
    t.fecha_cierre,
    -- Cálculos adicionales
    CASE
        WHEN t.estado IN ('resolved', 'closed') THEN NULL
        WHEN CURDATE() > t.fecha_vencimiento THEN DATEDIFF(CURDATE(), t.fecha_vencimiento)
        ELSE DATEDIFF(t.fecha_vencimiento, CURDATE())
    END as dias_vencimiento,
    CASE
        WHEN t.estado IN ('resolved', 'closed') THEN 'finalizado'
        WHEN CURDATE() > t.fecha_vencimiento THEN 'vencido'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 1 THEN 'critico'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 3 THEN 'urgente'
        ELSE 'normal'
    END as nivel_urgencia,
    DATEDIFF(CURDATE(), t.fecha_creacion) as dias_abiertos
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id
WHERE
    (:comunidad_id IS NULL OR t.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR t.estado = :estado) AND
    (:prioridad IS NULL OR t.prioridad = :prioridad) AND
    (:categoria IS NULL OR t.categoria = :categoria) AND
    (:usuario_asignado_id IS NULL OR t.usuario_asignado_id = :usuario_asignado_id) AND
    (:fecha_desde IS NULL OR t.fecha_creacion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR t.fecha_creacion <= :fecha_hasta)
ORDER BY
    CASE
        WHEN :ordenar_por = 'urgencia' THEN
            CASE
                WHEN t.estado IN ('resolved', 'closed') THEN 999
                WHEN CURDATE() > t.fecha_vencimiento THEN 1
                WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 1 THEN 2
                WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 3 THEN 3
                ELSE 4
            END
        ELSE 0
    END ASC,
    t.fecha_creacion DESC,
    t.id DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de tickets por comunidad con estadísticas
SELECT
    c.razon_social as comunidad,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.estado = 'open' THEN 1 END) as abiertos,
    COUNT(CASE WHEN t.estado = 'in-progress' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN t.estado = 'resolved' THEN 1 END) as resueltos,
    COUNT(CASE WHEN t.estado = 'closed' THEN 1 END) as cerrados,
    COUNT(CASE WHEN t.estado = 'escalated' THEN 1 END) as escalados,
    AVG(CASE WHEN t.fecha_cierre IS NOT NULL THEN DATEDIFF(t.fecha_cierre, t.fecha_creacion) END) as tiempo_promedio_resolucion,
    MAX(t.fecha_creacion) as ultimo_ticket
FROM comunidad c
LEFT JOIN ticket t ON c.id = t.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Tickets próximos a vencer (3 días)
SELECT
    t.id,
    t.numero,
    t.asunto,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(tu.nombre, '') as solicitante,
    t.fecha_vencimiento,
    DATEDIFF(t.fecha_vencimiento, CURDATE()) as dias_restantes,
    CASE
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 0 THEN 'vencido'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) = 1 THEN 'mañana'
        ELSE 'próximos_dias'
    END as urgencia,
    t.prioridad,
    t.categoria
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
WHERE t.estado NOT IN ('resolved', 'closed')
    AND t.fecha_vencimiento IS NOT NULL
    AND DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 3
ORDER BY t.fecha_vencimiento ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de un ticket específico
SELECT
    t.id,
    t.numero,
    t.asunto,
    t.descripcion,
    t.estado,
    t.prioridad,
    t.categoria,
    c.id as comunidad_id,
    c.razon_social as comunidad_nombre,
    u.id as unidad_id,
    u.numero as unidad_numero,
    tu.id as solicitante_id,
    tu.nombre as solicitante_nombre,
    tu.email as solicitante_email,
    ta.id as asignado_id,
    ta.nombre as asignado_nombre,
    ta.email as asignado_email,
    t.fecha_creacion,
    t.fecha_actualizacion,
    t.fecha_vencimiento,
    t.fecha_cierre,
    t.tiempo_resolucion,
    -- Información adicional calculada
    CASE
        WHEN t.estado = 'open' THEN 'Abierto'
        WHEN t.estado = 'in-progress' THEN 'En Progreso'
        WHEN t.estado = 'resolved' THEN 'Resuelto'
        WHEN t.estado = 'closed' THEN 'Cerrado'
        WHEN t.estado = 'escalated' THEN 'Escalado'
    END as estado_descripcion,
    DATEDIFF(CURDATE(), t.fecha_creacion) as dias_desde_creacion,
    CASE
        WHEN t.fecha_cierre IS NOT NULL THEN DATEDIFF(t.fecha_cierre, t.fecha_creacion)
        ELSE NULL
    END as dias_para_resolver,
    -- Conteos relacionados
    (SELECT COUNT(*) FROM ticket_comentario tc WHERE tc.ticket_id = t.id) as num_comentarios,
    (SELECT COUNT(*) FROM ticket_adjunto ta WHERE ta.ticket_id = t.id) as num_adjuntos,
    (SELECT COUNT(*) FROM ticket_historial th WHERE th.ticket_id = t.id) as num_historial
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id
WHERE t.id = :ticket_id;

-- 2.2 Vista de tickets con información completa para listado
SELECT
    t.id,
    t.numero,
    t.asunto,
    t.estado,
    t.prioridad,
    t.categoria,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(tu.nombre, '') as solicitante,
    COALESCE(ta.nombre, '') as asignado,
    t.fecha_creacion,
    t.fecha_vencimiento,
    JSON_OBJECT(
        'ticket', JSON_OBJECT(
            'id', t.id,
            'numero', t.numero,
            'asunto', t.asunto,
            'estado', t.estado,
            'prioridad', t.prioridad,
            'categoria', t.categoria
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'numero', u.numero
            )
            ELSE NULL
        END,
        'solicitante', CASE
            WHEN tu.id IS NOT NULL THEN JSON_OBJECT(
                'id', tu.id,
                'nombre', tu.nombre,
                'email', tu.email
            )
            ELSE NULL
        END,
        'asignado', CASE
            WHEN ta.id IS NOT NULL THEN JSON_OBJECT(
                'id', ta.id,
                'nombre', ta.nombre,
                'email', ta.email
            )
            ELSE NULL
        END,
        'fechas', JSON_OBJECT(
            'creacion', t.fecha_creacion,
            'vencimiento', t.fecha_vencimiento,
            'cierre', t.fecha_cierre
        )
    ) as informacion_completa
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id
ORDER BY t.fecha_creacion DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de tickets
SELECT
    COUNT(*) as total_tickets,
    COUNT(DISTINCT comunidad_id) as comunidades_con_tickets,
    COUNT(CASE WHEN estado = 'open' THEN 1 END) as tickets_abiertos,
    COUNT(CASE WHEN estado = 'in-progress' THEN 1 END) as tickets_en_progreso,
    COUNT(CASE WHEN estado = 'resolved' THEN 1 END) as tickets_resueltos,
    COUNT(CASE WHEN estado = 'closed' THEN 1 END) as tickets_cerrados,
    COUNT(CASE WHEN estado = 'escalated' THEN 1 END) as tickets_escalados,
    ROUND(
        (COUNT(CASE WHEN estado IN ('resolved', 'closed') THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_resolucion,
    AVG(CASE WHEN fecha_cierre IS NOT NULL THEN DATEDIFF(fecha_cierre, fecha_creacion) END) as tiempo_promedio_resolucion,
    MIN(fecha_creacion) as primer_ticket,
    MAX(fecha_creacion) as ultimo_ticket
FROM ticket;

-- 3.2 Estadísticas por estado
SELECT
    estado,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket)), 2
    ) as porcentaje,
    AVG(CASE WHEN fecha_cierre IS NOT NULL THEN DATEDIFF(fecha_cierre, fecha_creacion) END) as tiempo_promedio_resolucion,
    MIN(fecha_creacion) as mas_antiguo,
    MAX(fecha_creacion) as mas_reciente
FROM ticket
GROUP BY estado
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por prioridad
SELECT
    prioridad,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket)), 2
    ) as porcentaje,
    COUNT(CASE WHEN estado IN ('resolved', 'closed') THEN 1 END) as resueltos,
    ROUND(
        (COUNT(CASE WHEN estado IN ('resolved', 'closed') THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_resolucion_prioridad,
    AVG(CASE WHEN fecha_cierre IS NOT NULL THEN DATEDIFF(fecha_cierre, fecha_creacion) END) as tiempo_promedio_resolucion
FROM ticket
GROUP BY prioridad
ORDER BY
    CASE prioridad
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

-- 3.4 Estadísticas por categoría
SELECT
    categoria,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket)), 2
    ) as porcentaje,
    COUNT(CASE WHEN estado IN ('resolved', 'closed') THEN 1 END) as resueltos,
    ROUND(
        (COUNT(CASE WHEN estado IN ('resolved', 'closed') THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_resolucion,
    AVG(CASE WHEN fecha_cierre IS NOT NULL THEN DATEDIFF(fecha_cierre, fecha_creacion) END) as tiempo_promedio_resolucion,
    MIN(fecha_creacion) as mas_antiguo,
    MAX(fecha_creacion) as mas_reciente
FROM ticket
GROUP BY categoria
ORDER BY cantidad DESC;

-- 3.5 Estadísticas mensuales de tickets
SELECT
    YEAR(fecha_creacion) as anio,
    MONTH(fecha_creacion) as mes,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN estado = 'open' THEN 1 END) as abiertos,
    COUNT(CASE WHEN estado = 'in-progress' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN estado = 'resolved' THEN 1 END) as resueltos,
    COUNT(CASE WHEN estado = 'closed' THEN 1 END) as cerrados,
    COUNT(CASE WHEN estado = 'escalated' THEN 1 END) as escalados,
    ROUND(
        (COUNT(CASE WHEN estado IN ('resolved', 'closed') THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_resolucion,
    AVG(CASE WHEN fecha_cierre IS NOT NULL THEN DATEDIFF(fecha_cierre, fecha_creacion) END) as tiempo_promedio_resolucion
FROM ticket
WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(fecha_creacion), MONTH(fecha_creacion)
ORDER BY anio DESC, mes DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de tickets
SELECT
    t.id,
    t.numero,
    t.asunto,
    t.estado,
    t.prioridad,
    t.categoria,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(tu.nombre, '') as solicitante,
    COALESCE(ta.nombre, '') as asignado,
    t.fecha_creacion,
    t.fecha_vencimiento,
    DATEDIFF(CURDATE(), t.fecha_creacion) as antiguedad_dias,
    CASE
        WHEN t.estado IN ('resolved', 'closed') THEN 'resuelto'
        WHEN CURDATE() > t.fecha_vencimiento THEN 'vencido'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 1 THEN 'critico'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 3 THEN 'urgente'
        ELSE 'normal'
    END as nivel_urgencia
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id
WHERE
    (:busqueda IS NULL OR
     t.numero LIKE CONCAT('%', :busqueda, '%') OR
     t.asunto LIKE CONCAT('%', :busqueda, '%') OR
     t.descripcion LIKE CONCAT('%', :busqueda, '%') OR
     tu.nombre LIKE CONCAT('%', :busqueda, '%') OR
     ta.nombre LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR t.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR t.estado = :estado) AND
    (:prioridad IS NULL OR t.prioridad = :prioridad) AND
    (:categoria IS NULL OR t.categoria = :categoria) AND
    (:usuario_asignado_id IS NULL OR t.usuario_asignado_id = :usuario_asignado_id) AND
    (:fecha_desde IS NULL OR t.fecha_creacion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR t.fecha_creacion <= :fecha_hasta) AND
    (:dias_vencimiento IS NULL OR (
        CASE
            WHEN t.estado IN ('resolved', 'closed') THEN NULL
            WHEN CURDATE() > t.fecha_vencimiento THEN DATEDIFF(CURDATE(), t.fecha_vencimiento)
            ELSE DATEDIFF(t.fecha_vencimiento, CURDATE())
        END <= :dias_vencimiento
    ))
ORDER BY t.fecha_creacion DESC, t.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Tickets por asignado con estadísticas
SELECT
    ta.id as usuario_id,
    ta.nombre as asignado,
    ta.email,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.estado = 'open' THEN 1 END) as abiertos,
    COUNT(CASE WHEN t.estado = 'in-progress' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN t.estado = 'resolved' THEN 1 END) as resueltos,
    COUNT(CASE WHEN t.estado = 'closed' THEN 1 END) as cerrados,
    COUNT(CASE WHEN t.estado = 'escalated' THEN 1 END) as escalados,
    ROUND(
        (COUNT(CASE WHEN t.estado IN ('resolved', 'closed') THEN 1 END) * 100.0 / COUNT(t.id)), 2
    ) as porcentaje_resolucion,
    AVG(CASE WHEN t.fecha_cierre IS NOT NULL THEN DATEDIFF(t.fecha_cierre, t.fecha_creacion) END) as tiempo_promedio_resolucion,
    MAX(t.fecha_creacion) as ultimo_ticket
FROM usuario ta
LEFT JOIN ticket t ON ta.id = t.usuario_asignado_id
WHERE (:comunidad_id IS NULL OR t.comunidad_id = :comunidad_id)
GROUP BY ta.id, ta.nombre, ta.email
HAVING COUNT(t.id) > 0
ORDER BY total_tickets DESC;

-- 4.3 Tickets por solicitante
SELECT
    tu.id as usuario_id,
    tu.nombre as solicitante,
    tu.email,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.estado = 'open' THEN 1 END) as abiertos,
    COUNT(CASE WHEN t.estado = 'in-progress' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN t.estado = 'resolved' THEN 1 END) as resueltos,
    COUNT(CASE WHEN t.estado = 'closed' THEN 1 END) as cerrados,
    COUNT(CASE WHEN t.estado = 'escalated' THEN 1 END) as escalados,
    MAX(t.fecha_creacion) as ultimo_ticket,
    MIN(t.fecha_creacion) as primer_ticket
FROM usuario tu
LEFT JOIN ticket t ON tu.id = t.usuario_solicitante_id
WHERE (:comunidad_id IS NULL OR t.comunidad_id = :comunidad_id)
GROUP BY tu.id, tu.nombre, tu.email
HAVING COUNT(t.id) > 0
ORDER BY total_tickets DESC;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de tickets para Excel/CSV
SELECT
    t.id as 'ID',
    t.numero as 'Número',
    t.asunto as 'Asunto',
    t.descripcion as 'Descripción',
    t.estado as 'Estado',
    t.prioridad as 'Prioridad',
    t.categoria as 'Categoría',
    c.razon_social as 'Comunidad',
    COALESCE(u.numero, '') as 'Unidad',
    COALESCE(tu.nombre, '') as 'Solicitante',
    COALESCE(tu.email, '') as 'Email Solicitante',
    COALESCE(ta.nombre, '') as 'Asignado A',
    DATE_FORMAT(t.fecha_creacion, '%Y-%m-%d %H:%i:%s') as 'Fecha Creación',
    DATE_FORMAT(t.fecha_actualizacion, '%Y-%m-%d %H:%i:%s') as 'Última Actualización',
    DATE_FORMAT(t.fecha_vencimiento, '%Y-%m-%d') as 'Fecha Vencimiento',
    DATE_FORMAT(t.fecha_cierre, '%Y-%m-%d %H:%i:%s') as 'Fecha Cierre',
    CASE
        WHEN t.fecha_cierre IS NOT NULL THEN DATEDIFF(t.fecha_cierre, t.fecha_creacion)
        ELSE NULL
    END as 'Días Resolución'
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id
ORDER BY t.fecha_creacion DESC;

-- 5.2 Exportación de tickets abiertos
SELECT
    t.numero as 'Ticket',
    t.asunto as 'Asunto',
    c.razon_social as 'Comunidad',
    COALESCE(u.numero, '') as 'Unidad',
    COALESCE(tu.nombre, '') as 'Solicitante',
    COALESCE(ta.nombre, '') as 'Asignado',
    t.prioridad as 'Prioridad',
    t.categoria as 'Categoría',
    DATE_FORMAT(t.fecha_creacion, '%Y-%m-%d') as 'Creado',
    DATE_FORMAT(t.fecha_vencimiento, '%Y-%m-%d') as 'Vence',
    DATEDIFF(CURDATE(), t.fecha_creacion) as 'Días Abierto',
    CASE
        WHEN CURDATE() > t.fecha_vencimiento THEN 'VENCIDO'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 1 THEN 'CRÍTICO'
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 3 THEN 'URGENTE'
        ELSE 'NORMAL'
    END as 'Estado Urgencia'
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id
WHERE t.estado IN ('open', 'in-progress', 'escalated')
ORDER BY
    CASE
        WHEN CURDATE() > t.fecha_vencimiento THEN 1
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 1 THEN 2
        WHEN DATEDIFF(t.fecha_vencimiento, CURDATE()) <= 3 THEN 3
        ELSE 4
    END ASC,
    t.fecha_creacion ASC;

-- 5.3 Exportación de estadísticas de resolución
SELECT
    YEAR(t.fecha_creacion) as 'Año',
    MONTH(t.fecha_creacion) as 'Mes',
    COUNT(*) as 'Total Tickets',
    COUNT(CASE WHEN t.estado = 'open' THEN 1 END) as 'Abiertos',
    COUNT(CASE WHEN t.estado = 'in-progress' THEN 1 END) as 'En Progreso',
    COUNT(CASE WHEN t.estado = 'resolved' THEN 1 END) as 'Resueltos',
    COUNT(CASE WHEN t.estado = 'closed' THEN 1 END) as 'Cerrados',
    COUNT(CASE WHEN t.estado = 'escalated' THEN 1 END) as 'Escalados',
    ROUND(
        (COUNT(CASE WHEN t.estado IN ('resolved', 'closed') THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as 'Porcentaje Resolución (%)',
    ROUND(
        AVG(CASE WHEN t.fecha_cierre IS NOT NULL THEN DATEDIFF(t.fecha_cierre, t.fecha_creacion) END), 1
    ) as 'Días Promedio Resolución'
FROM ticket t
WHERE t.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(t.fecha_creacion), MONTH(t.fecha_creacion)
ORDER BY YEAR(t.fecha_creacion) DESC, MONTH(t.fecha_creacion) DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de tickets
SELECT
    'Tickets sin comunidad' as validacion,
    COUNT(*) as cantidad
FROM ticket t
LEFT JOIN comunidad c ON t.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Tickets sin solicitante' as validacion,
    COUNT(*) as cantidad
FROM ticket t
LEFT JOIN usuario u ON t.usuario_solicitante_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Tickets resueltos sin fecha de cierre' as validacion,
    COUNT(*) as cantidad
FROM ticket
WHERE estado IN ('resolved', 'closed') AND fecha_cierre IS NULL
UNION ALL
SELECT
    'Tickets con fecha de cierre anterior a creación' as validacion,
    COUNT(*) as cantidad
FROM ticket
WHERE fecha_cierre < fecha_creacion
UNION ALL
SELECT
    'Tickets con fecha de vencimiento pasada y estado abierto' as validacion,
    COUNT(*) as cantidad
FROM ticket
WHERE estado IN ('open', 'in-progress') AND fecha_vencimiento < CURDATE()
UNION ALL
SELECT
    'Números de ticket duplicados' as validacion,
    COUNT(*) as cantidad
FROM (
    SELECT numero, COUNT(*) as cnt
    FROM ticket
    GROUP BY numero
    HAVING cnt > 1
) duplicados;

-- 6.2 Validar consistencia de estados y fechas
SELECT
    'Inconsistencias en estados y fechas' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Ticket ', t.numero, ': estado ', t.estado, ' inconsistente con fechas')
        SEPARATOR '; '
    ) as detalles
FROM ticket t
WHERE
    (estado IN ('resolved', 'closed') AND fecha_cierre IS NULL) OR
    (estado NOT IN ('resolved', 'closed') AND fecha_cierre IS NOT NULL) OR
    (fecha_cierre IS NOT NULL AND fecha_cierre < fecha_creacion);

-- 6.3 Validar asignaciones y categorías
SELECT
    'Tickets sin categoría' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Ticket ', numero, ' sin categoría')
        SEPARATOR '; '
    ) as detalles
FROM ticket
WHERE categoria IS NULL OR categoria = ''
UNION ALL
SELECT
    'Tickets asignados a usuarios inactivos' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Ticket ', t.numero, ' asignado a usuario inactivo ', u.nombre)
        SEPARATOR '; '
    ) as detalles
FROM ticket t
JOIN usuario u ON t.usuario_asignado_id = u.id
WHERE u.activo = 0;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de tickets
CREATE OR REPLACE VIEW vista_tickets_listado AS
SELECT
    t.id,
    t.numero,
    t.asunto,
    t.estado,
    t.prioridad,
    t.categoria,
    c.razon_social as comunidad,
    u.numero as unidad,
    COALESCE(tu.nombre, '') as solicitante,
    COALESCE(ta.nombre, '') as asignado,
    t.fecha_creacion,
    t.fecha_vencimiento,
    CASE
        WHEN t.estado IN ('resolved', 'closed') THEN NULL
        WHEN CURDATE() > t.fecha_vencimiento THEN DATEDIFF(CURDATE(), t.fecha_vencimiento)
        ELSE DATEDIFF(t.fecha_vencimiento, CURDATE())
    END as dias_vencimiento
FROM ticket t
JOIN comunidad c ON t.comunidad_id = c.id
LEFT JOIN unidad u ON t.unidad_id = u.id
LEFT JOIN usuario tu ON t.usuario_solicitante_id = tu.id
LEFT JOIN usuario ta ON t.usuario_asignado_id = ta.id;

-- 7.2 Vista para estadísticas de tickets por comunidad
CREATE OR REPLACE VIEW vista_tickets_estadisticas AS
SELECT
    c.razon_social as comunidad,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.estado = 'open' THEN 1 END) as abiertos,
    COUNT(CASE WHEN t.estado = 'in-progress' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN t.estado = 'resolved' THEN 1 END) as resueltos,
    COUNT(CASE WHEN t.estado = 'closed' THEN 1 END) as cerrados,
    COUNT(CASE WHEN t.estado = 'escalated' THEN 1 END) as escalados,
    AVG(CASE WHEN t.fecha_cierre IS NOT NULL THEN DATEDIFF(t.fecha_cierre, t.fecha_creacion) END) as tiempo_promedio_resolucion,
    MAX(t.fecha_creacion) as ultimo_ticket
FROM comunidad c
LEFT JOIN ticket t ON c.id = t.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de tickets
CREATE OR REPLACE VIEW vista_tickets_dashboard AS
SELECT
    'total' as tipo,
    COUNT(*) as valor
FROM ticket
UNION ALL
SELECT
    'abiertos' as tipo,
    COUNT(*) as valor
FROM ticket
WHERE estado = 'open'
UNION ALL
SELECT
    'en_progreso' as tipo,
    COUNT(*) as valor
FROM ticket
WHERE estado = 'in-progress'
UNION ALL
SELECT
    'resueltos' as tipo,
    COUNT(*) as valor
FROM ticket
WHERE estado IN ('resolved', 'closed')
UNION ALL
SELECT
    'escalados' as tipo,
    COUNT(*) as valor
FROM ticket
WHERE estado = 'escalated'
UNION ALL
SELECT
    'vencidos' as tipo,
    COUNT(*) as valor
FROM ticket
WHERE estado NOT IN ('resolved', 'closed') AND CURDATE() > fecha_vencimiento
UNION ALL
SELECT
    'tiempo_promedio_resolucion' as tipo,
    ROUND(AVG(CASE WHEN fecha_cierre IS NOT NULL THEN DATEDIFF(fecha_cierre, fecha_creacion) END), 1) as valor
FROM ticket;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_ticket_comunidad_id ON ticket(comunidad_id);
CREATE INDEX idx_ticket_unidad_id ON ticket(unidad_id);
CREATE INDEX idx_ticket_usuario_solicitante_id ON ticket(usuario_solicitante_id);
CREATE INDEX idx_ticket_usuario_asignado_id ON ticket(usuario_asignado_id);
CREATE INDEX idx_ticket_estado ON ticket(estado);
CREATE INDEX idx_ticket_prioridad ON ticket(prioridad);
CREATE INDEX idx_ticket_categoria ON ticket(categoria);
CREATE INDEX idx_ticket_fecha_creacion ON ticket(fecha_creacion DESC);
CREATE INDEX idx_ticket_fecha_vencimiento ON ticket(fecha_vencimiento);
CREATE INDEX idx_ticket_fecha_cierre ON ticket(fecha_cierre);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_ticket_comunidad_estado ON ticket(comunidad_id, estado);
CREATE INDEX idx_ticket_estado_fecha ON ticket(estado, fecha_creacion DESC);
CREATE INDEX idx_ticket_asignado_estado ON ticket(usuario_asignado_id, estado);
CREATE INDEX idx_ticket_categoria_estado ON ticket(categoria, estado);
CREATE INDEX idx_ticket_fecha_rango ON ticket(fecha_creacion, fecha_vencimiento);

-- Índice para búsquedas por número
CREATE INDEX idx_ticket_numero ON ticket(numero);

-- Índices para estadísticas mensuales
CREATE INDEX idx_ticket_anio_mes ON ticket(YEAR(fecha_creacion), MONTH(fecha_creacion));

-- Índices para validaciones
CREATE INDEX idx_ticket_fechas_validacion ON ticket(fecha_creacion, fecha_cierre, fecha_vencimiento);