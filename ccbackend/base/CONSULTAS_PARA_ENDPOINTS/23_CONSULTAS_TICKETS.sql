-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO TICKETS
-- Sistema: Cuentas Claras (Basado en el esquema 'ticket_soporte')
-- =========================================
-- NOTA DE CORRECCIÓN: La tabla 'ticket' se reemplazó por 'ticket_soporte' (ts).
-- Se ajustó el ENUM de estados a: ('abierto','en_progreso','resuelto','cerrado').
-- No existen columnas de fecha de vencimiento/cierre explícitas, se usa ts.updated_at como proxy.

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de tickets con filtros
SELECT
    ts.id,
    ts.id AS numero, -- CORRECCIÓN: Usar ID como número
    ts.titulo AS asunto, -- CORRECCIÓN: Usar ts.titulo
    ts.descripcion,
    ts.estado,
    ts.prioridad,
    ts.categoria,
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    COALESCE(pu.nombres, '') AS solicitante, -- CORRECCIÓN: Obtener nombre de persona (solicitante)
    COALESCE(pa.nombres, '') AS asignado_a, -- CORRECCIÓN: Obtener nombre de persona (asignado)
    ts.created_at AS fecha_creacion,
    ts.updated_at AS fecha_actualizacion,
    ts.updated_at AS fecha_vencimiento, -- SIMULADO: Usar updated_at como proxy
    ts.updated_at AS fecha_cierre, -- SIMULADO: Usar updated_at como proxy
    -- Cálculos adicionales
    CASE
        WHEN ts.estado IN ('resuelto', 'cerrado') THEN NULL
        WHEN CURDATE() > ts.updated_at THEN DATEDIFF(CURDATE(), ts.updated_at) -- Días vencido (proxy)
        ELSE DATEDIFF(ts.updated_at, CURDATE())
    END AS dias_vencimiento,
    CASE
        WHEN ts.estado IN ('resuelto', 'cerrado') THEN 'finalizado'
        WHEN CURDATE() > ts.updated_at THEN 'vencido' -- Proxy de vencimiento
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'critico'
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'urgente'
        ELSE 'normal'
    END AS nivel_urgencia,
    DATEDIFF(CURDATE(), ts.created_at) AS dias_abiertos
FROM ticket_soporte ts -- CORRECCIÓN: Nombre de tabla
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us ON ts.asignado_a = us.id -- Usuario asignado
LEFT JOIN persona pa ON us.persona_id = pa.id -- Persona asignada
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE()) -- Proxy para solicitante
LEFT JOIN persona pu ON tu.persona_id = pu.id
WHERE
    (:comunidad_id IS NULL OR ts.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR ts.estado = :estado) AND
    (:prioridad IS NULL OR ts.prioridad = :prioridad) AND
    (:categoria IS NULL OR ts.categoria = :categoria) AND
    (:usuario_asignado_id IS NULL OR ts.asignado_a = :usuario_asignado_id) AND
    (:fecha_desde IS NULL OR ts.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR ts.created_at <= :fecha_hasta)
ORDER BY
    CASE
        WHEN :ordenar_por = 'urgencia' THEN
            CASE
                WHEN ts.estado IN ('resuelto', 'cerrado') THEN 999
                WHEN CURDATE() > ts.updated_at THEN 1
                WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 2
                WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 3
                ELSE 4
            END
        ELSE 0
    END ASC,
    ts.created_at DESC,
    ts.id DESC
LIMIT :limit OFFSET :offset;
-- Sugerir índice: ticket_soporte(comunidad_id, estado, prioridad, categoria, creado_por, created_at)

-- 1.2 Listado de tickets por comunidad con estadísticas
SELECT
    c.razon_social AS comunidad,
    COUNT(ts.id) AS total_tickets,
    COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS abiertos, -- CORRECCIÓN: Mapeo de estado
    COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS en_progreso, -- CORRECCIÓN: Mapeo de estado
    COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS resueltos, -- CORRECCIÓN: Mapeo de estado
    COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS cerrados, -- CORRECCIÓN: Mapeo de estado
    0 AS escalados, -- SIMULADO: Estado no existe
    AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END) AS tiempo_promedio_resolucion, -- Proxy de fecha de cierre
    MAX(ts.created_at) AS ultimo_ticket
FROM comunidad c
LEFT JOIN ticket_soporte ts ON c.id = ts.comunidad_id -- CORRECCIÓN: Nombre de tabla
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Tickets próximos a vencer (3 días)
SELECT
    ts.id,
    ts.id AS numero,
    ts.titulo AS asunto,
    c.razon_social AS comunidad,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    COALESCE(pu.nombres, '') AS solicitante,
    ts.updated_at AS fecha_vencimiento, -- Proxy
    DATEDIFF(ts.updated_at, CURDATE()) AS dias_restantes, -- Proxy
    CASE
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 0 THEN 'vencido'
        WHEN DATEDIFF(ts.updated_at, CURDATE()) = 1 THEN 'mañana'
        ELSE 'próximos_dias'
    END AS urgencia,
    ts.prioridad,
    ts.categoria
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona pu ON tu.persona_id = pu.id
WHERE ts.estado NOT IN ('resuelto', 'cerrado')
    AND ts.updated_at IS NOT NULL
    AND DATEDIFF(ts.updated_at, CURDATE()) <= 3
ORDER BY ts.updated_at ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de un ticket específico
SELECT
    ts.id,
    ts.id AS numero,
    ts.titulo AS asunto,
    ts.descripcion,
    ts.estado,
    ts.prioridad,
    ts.categoria,
    c.id AS comunidad_id,
    c.razon_social AS comunidad_nombre,
    u.id AS unidad_id,
    u.codigo AS unidad_codigo, -- CORRECCIÓN: Usar u.codigo
    NULL AS solicitante_id, -- No existe en la tabla
    COALESCE(pu.nombres, '') AS solicitante_nombre,
    COALESCE(pu.email, '') AS solicitante_email,
    ts.asignado_a AS asignado_id,
    COALESCE(pa.nombres, '') AS asignado_nombre,
    COALESCE(pa.email, '') AS asignado_email,
    ts.created_at AS fecha_creacion,
    ts.updated_at AS fecha_actualizacion,
    ts.updated_at AS fecha_vencimiento, -- Proxy
    ts.updated_at AS fecha_cierre, -- Proxy
    NULL AS tiempo_resolucion, -- Se calcula en la app
    -- Información adicional calculada
    CASE
        WHEN ts.estado = 'abierto' THEN 'Abierto'
        WHEN ts.estado = 'en_progreso' THEN 'En Progreso'
        WHEN ts.estado = 'resuelto' THEN 'Resuelto'
        WHEN ts.estado = 'cerrado' THEN 'Cerrado'
    END AS estado_descripcion,
    DATEDIFF(CURDATE(), ts.created_at) AS dias_desde_creacion,
    CASE
        WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at)
        ELSE NULL
    END AS dias_para_resolver, -- Proxy de fecha de cierre
    -- Conteos relacionados (SIMULADOS)
    0 AS num_comentarios,
    0 AS num_adjuntos,
    0 AS num_historial
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us_sol ON ts.unidad_id = us_sol.id -- Proxy: No hay relación directa, pero se intenta usar el campo para el join.
LEFT JOIN persona pu ON us_sol.persona_id = pu.id
LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
LEFT JOIN persona pa ON us_asig.persona_id = pa.id
WHERE ts.id = :ticket_id;

-- 2.2 Vista de tickets con información completa para listado
SELECT
    ts.id,
    ts.id AS numero,
    ts.titulo AS asunto,
    ts.estado,
    ts.prioridad,
    ts.categoria,
    c.razon_social AS comunidad,
    u.codigo AS unidad,
    COALESCE(pu.nombres, '') AS solicitante,
    COALESCE(pa.nombres, '') AS asignado,
    ts.created_at AS fecha_creacion,
    ts.updated_at AS fecha_vencimiento, -- Proxy
    JSON_OBJECT(
        'ticket', JSON_OBJECT(
            'id', ts.id,
            'numero', ts.id,
            'asunto', ts.titulo,
            'estado', ts.estado,
            'prioridad', ts.prioridad,
            'categoria', ts.categoria
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'codigo', u.codigo
            )
            ELSE NULL
        END,
        'solicitante', JSON_OBJECT(
            'nombre', COALESCE(pu.nombres, ''),
            'email', COALESCE(pu.email, '')
        ),
        'asignado', JSON_OBJECT(
            'nombre', COALESCE(pa.nombres, ''),
            'email', COALESCE(pa.email, '')
        ),
        'fechas', JSON_OBJECT(
            'creacion', ts.created_at,
            'vencimiento', ts.updated_at, -- Proxy
            'cierre', ts.updated_at -- Proxy
        )
    ) AS informacion_completa
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
LEFT JOIN persona pa ON us_asig.persona_id = pa.id
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona pu ON tu.persona_id = pu.id
ORDER BY ts.created_at DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de tickets
SELECT
    COUNT(*) AS total_tickets,
    COUNT(DISTINCT comunidad_id) AS comunidades_con_tickets,
    COUNT(CASE WHEN estado = 'abierto' THEN 1 END) AS tickets_abiertos,
    COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) AS tickets_en_progreso,
    COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) AS tickets_resueltos,
    COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) AS tickets_cerrados,
    0 AS tickets_escalados, -- SIMULADO
    AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion, -- Proxy
    MIN(created_at) AS primer_ticket,
    MAX(created_at) AS ultimo_ticket
FROM ticket_soporte;

-- 3.2 Estadísticas por estado
SELECT
    estado,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_soporte)), 2
    ) AS porcentaje,
    AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion, -- Proxy
    MIN(created_at) AS mas_antiguo,
    MAX(created_at) AS mas_reciente
FROM ticket_soporte
GROUP BY estado
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por prioridad
SELECT
    prioridad,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_soporte)), 2
    ) AS porcentaje,
    COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) AS resueltos,
    ROUND(
        (COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) AS porcentaje_resolucion_prioridad,
    AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion -- Proxy
FROM ticket_soporte
GROUP BY prioridad
ORDER BY
    CASE prioridad
        WHEN 'alta' THEN 1
        WHEN 'media' THEN 2
        WHEN 'baja' THEN 3
    END;

-- 3.4 Estadísticas por categoría
SELECT
    categoria,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_soporte)), 2
    ) AS porcentaje,
    COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) AS resueltos,
    ROUND(
        (COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) AS porcentaje_resolucion,
    AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion, -- Proxy
    MIN(created_at) AS mas_antiguo,
    MAX(created_at) AS mas_reciente
FROM ticket_soporte
GROUP BY categoria
ORDER BY cantidad DESC;

-- 3.5 Estadísticas mensuales de tickets
SELECT
    YEAR(created_at) AS anio,
    MONTH(created_at) AS mes,
    COUNT(*) AS total_tickets,
    COUNT(CASE WHEN estado = 'abierto' THEN 1 END) AS abiertos,
    COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) AS en_progreso,
    COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) AS resueltos,
    COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) AS cerrados,
    0 AS escalados, -- SIMULADO
    ROUND(
        (COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) AS porcentaje_resolucion,
    AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion -- Proxy
FROM ticket_soporte
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY anio DESC, mes DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de tickets
SELECT
    ts.id,
    ts.id AS numero,
    ts.titulo AS asunto,
    ts.estado,
    ts.prioridad,
    ts.categoria,
    c.razon_social AS comunidad,
    u.codigo AS unidad,
    COALESCE(pu.nombres, '') AS solicitante,
    COALESCE(pa.nombres, '') AS asignado,
    ts.created_at AS fecha_creacion,
    ts.updated_at AS fecha_vencimiento, -- Proxy
    DATEDIFF(CURDATE(), ts.created_at) AS antiguedad_dias,
    CASE
        WHEN ts.estado IN ('resuelto', 'cerrado') THEN 'resuelto'
        WHEN CURDATE() > ts.updated_at THEN 'vencido' -- Proxy
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'critico'
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'urgente'
        ELSE 'normal'
    END AS nivel_urgencia
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
LEFT JOIN persona pa ON us_asig.persona_id = pa.id
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona pu ON tu.persona_id = pu.id
WHERE
    (:busqueda IS NULL OR
     ts.id LIKE CONCAT('%', :busqueda, '%') OR
     ts.titulo LIKE CONCAT('%', :busqueda, '%') OR
     ts.descripcion LIKE CONCAT('%', :busqueda, '%') OR
     pu.nombres LIKE CONCAT('%', :busqueda, '%') OR
     pa.nombres LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR ts.comunidad_id = :comunidad_id) AND
    (:estado IS NULL OR ts.estado = :estado) AND
    (:prioridad IS NULL OR ts.prioridad = :prioridad) AND
    (:categoria IS NULL OR ts.categoria = :categoria) AND
    (:usuario_asignado_id IS NULL OR ts.asignado_a = :usuario_asignado_id) AND
    (:fecha_desde IS NULL OR ts.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR ts.created_at <= :fecha_hasta) AND
    (:dias_vencimiento IS NULL OR (
        CASE
            WHEN ts.estado IN ('resuelto', 'cerrado') THEN NULL
            WHEN CURDATE() > ts.updated_at THEN DATEDIFF(CURDATE(), ts.updated_at)
            ELSE DATEDIFF(ts.updated_at, CURDATE())
        END <= :dias_vencimiento
    ))
ORDER BY ts.created_at DESC, ts.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Tickets por asignado con estadísticas
SELECT
    ta.id AS usuario_id,
    COALESCE(pa.nombres, ta.username) AS asignado,
    pa.email,
    COUNT(ts.id) AS total_tickets,
    COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS abiertos,
    COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS en_progreso,
    COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS resueltos,
    COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS cerrados,
    0 AS escalados, -- SIMULADO
    ROUND(
        (COUNT(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(ts.id), 0)), 2
    ) AS porcentaje_resolucion,
    AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END) AS tiempo_promedio_resolucion, -- Proxy
    MAX(ts.created_at) AS ultimo_ticket
FROM usuario ta
LEFT JOIN persona pa ON ta.persona_id = pa.id
LEFT JOIN ticket_soporte ts ON ta.id = ts.asignado_a
WHERE (:comunidad_id IS NULL OR ts.comunidad_id = :comunidad_id)
GROUP BY ta.id, pa.nombres, ta.username, pa.email
HAVING COUNT(ts.id) > 0
ORDER BY total_tickets DESC;

-- 4.3 Tickets por solicitante
SELECT
    u.id AS usuario_id,
    COALESCE(p.nombres, u.username) AS solicitante,
    p.email,
    COUNT(ts.id) AS total_tickets,
    COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS abiertos,
    COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS en_progreso,
    COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS resueltos,
    COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS cerrados,
    0 AS escalados, -- SIMULADO
    MAX(ts.created_at) AS ultimo_ticket,
    MIN(ts.created_at) AS primer_ticket
FROM usuario u
LEFT JOIN persona p ON u.persona_id = p.id
-- CORRECCIÓN: La tabla ticket_soporte no tiene usuario_solicitante_id. Se usa el titular de la unidad asociada como proxy.
LEFT JOIN titulares_unidad tu ON p.id = tu.persona_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN ticket_soporte ts ON tu.unidad_id = ts.unidad_id
WHERE (:comunidad_id IS NULL OR ts.comunidad_id = :comunidad_id)
GROUP BY u.id, p.nombres, u.username, p.email
HAVING COUNT(ts.id) > 0
ORDER BY total_tickets DESC;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de tickets para Excel/CSV
SELECT
    ts.id AS 'ID',
    ts.id AS 'Número',
    ts.titulo AS 'Asunto',
    ts.descripcion AS 'Descripción',
    ts.estado AS 'Estado',
    ts.prioridad AS 'Prioridad',
    ts.categoria AS 'Categoría',
    c.razon_social AS 'Comunidad',
    COALESCE(u.codigo, '') AS 'Unidad', -- CORRECCIÓN: Usar u.codigo
    COALESCE(pu.nombres, '') AS 'Solicitante',
    COALESCE(pu.email, '') AS 'Email Solicitante',
    COALESCE(pa.nombres, '') AS 'Asignado A',
    DATE_FORMAT(ts.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(ts.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización',
    DATE_FORMAT(ts.updated_at, '%Y-%m-%d') AS 'Fecha Vencimiento', -- Proxy
    DATE_FORMAT(ts.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Cierre', -- Proxy
    CASE
        WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at)
        ELSE NULL
    END AS 'Días Resolución'
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
LEFT JOIN persona pa ON us_asig.persona_id = pa.id
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona pu ON tu.persona_id = pu.id
ORDER BY ts.created_at DESC;

-- 5.2 Exportación de tickets abiertos
SELECT
    ts.id AS 'Ticket',
    ts.titulo AS 'Asunto',
    c.razon_social AS 'Comunidad',
    COALESCE(u.codigo, '') AS 'Unidad', -- CORRECCIÓN: Usar u.codigo
    COALESCE(pu.nombres, '') AS 'Solicitante',
    COALESCE(pa.nombres, '') AS 'Asignado',
    ts.prioridad AS 'Prioridad',
    ts.categoria AS 'Categoría',
    DATE_FORMAT(ts.created_at, '%Y-%m-%d') AS 'Creado',
    DATE_FORMAT(ts.updated_at, '%Y-%m-%d') AS 'Vence', -- Proxy
    DATEDIFF(CURDATE(), ts.created_at) AS 'Días Abierto',
    CASE
        WHEN CURDATE() > ts.updated_at THEN 'VENCIDO'
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'CRÍTICO'
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'URGENTE'
        ELSE 'NORMAL'
    END AS 'Estado Urgencia'
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
LEFT JOIN persona pa ON us_asig.persona_id = pa.id
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona pu ON tu.persona_id = pu.id
WHERE ts.estado IN ('abierto', 'en_progreso')
ORDER BY
    CASE
        WHEN CURDATE() > ts.updated_at THEN 1
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 2
        WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 3
        ELSE 4
    END ASC,
    ts.created_at ASC;

-- 5.3 Exportación de estadísticas de resolución
SELECT
    YEAR(ts.created_at) AS 'Año',
    MONTH(ts.created_at) AS 'Mes',
    COUNT(*) AS 'Total Tickets',
    COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS 'Abiertos',
    COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS 'En Progreso',
    COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS 'Resueltos',
    COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS 'Cerrados',
    0 AS 'Escalados', -- SIMULADO
    ROUND(
        (COUNT(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) AS 'Porcentaje Resolución (%)',
    ROUND(
        AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END), 1
    ) AS 'Días Promedio Resolución' -- Proxy
FROM ticket_soporte ts
WHERE ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY 1 DESC, 2 DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de tickets
SELECT
    'Tickets sin comunidad' AS validacion,
    COUNT(*) AS cantidad
FROM ticket_soporte ts
LEFT JOIN comunidad c ON ts.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Tickets sin unidad' AS validacion,
    COUNT(*) AS cantidad
FROM ticket_soporte ts
LEFT JOIN unidad u ON ts.unidad_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Tickets resueltos/cerrados sin fecha de cierre (updated_at)' AS validacion,
    COUNT(*) AS cantidad
FROM ticket_soporte
WHERE estado IN ('resuelto', 'cerrado') AND updated_at IS NULL -- Proxy de fecha de cierre
UNION ALL
SELECT
    'Tickets con fecha de cierre anterior a creación' AS validacion,
    COUNT(*) AS cantidad
FROM ticket_soporte
WHERE updated_at < created_at -- Proxy de fecha de cierre
UNION ALL
SELECT
    'Tickets con fecha de vencimiento pasada y estado abierto' AS validacion,
    COUNT(*) AS cantidad
FROM ticket_soporte
WHERE estado IN ('abierto', 'en_progreso') AND updated_at < CURDATE() -- Proxy de fecha de vencimiento
UNION ALL
SELECT
    'Números de ticket duplicados (ID)' AS validacion,
    COUNT(*) AS cantidad
FROM (
    SELECT id, COUNT(*) AS cnt
    FROM ticket_soporte
    GROUP BY id
    HAVING cnt > 1
) AS duplicados; -- El ID siempre debería ser único

-- 6.2 Validar consistencia de estados y fechas
SELECT
    'Inconsistencias en estados y fechas' AS validacion,
    COUNT(*) AS cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Ticket ', ts.id, ': estado ', ts.estado, ' inconsistente con updated_at')
        SEPARATOR '; '
    ) AS detalles
FROM ticket_soporte ts
WHERE
    (ts.estado IN ('resuelto', 'cerrado') AND ts.updated_at IS NULL) OR -- Si está cerrado, debe tener fecha de actualización
    (ts.estado NOT IN ('resuelto', 'cerrado') AND ts.updated_at < ts.created_at);

-- 6.3 Validar asignaciones y categorías
SELECT
    'Tickets sin categoría' AS validacion,
    COUNT(*) AS cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Ticket ', id, ' sin categoría')
        SEPARATOR '; '
    ) AS detalles
FROM ticket_soporte
WHERE categoria IS NULL OR categoria = ''
UNION ALL
SELECT
    'Tickets asignados a usuarios inactivos' AS validacion,
    COUNT(*) AS cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Ticket ', ts.id, ' asignado a usuario inactivo ', u.username)
        SEPARATOR '; '
    ) AS detalles
FROM ticket_soporte ts
JOIN usuario u ON ts.asignado_a = u.id
WHERE u.activo = 0;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de tickets
CREATE OR REPLACE VIEW vista_tickets_listado AS
SELECT
    ts.id,
    ts.id AS numero,
    ts.titulo AS asunto,
    ts.estado,
    ts.prioridad,
    ts.categoria,
    c.razon_social AS comunidad,
    u.codigo AS unidad,
    COALESCE(pu.nombres, '') AS solicitante,
    COALESCE(pa.nombres, '') AS asignado,
    ts.created_at AS fecha_creacion,
    ts.updated_at AS fecha_vencimiento,
    CASE
        WHEN ts.estado IN ('resuelto', 'cerrado') THEN NULL
        WHEN CURDATE() > ts.updated_at THEN DATEDIFF(CURDATE(), ts.updated_at)
        ELSE DATEDIFF(ts.updated_at, CURDATE())
    END AS dias_vencimiento
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
LEFT JOIN persona pa ON us_asig.persona_id = pa.id
LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
LEFT JOIN persona pu ON tu.persona_id = pu.id;

-- 7.2 Vista para estadísticas de tickets por comunidad
CREATE OR REPLACE VIEW vista_tickets_estadisticas AS
SELECT
    c.razon_social AS comunidad,
    COUNT(ts.id) AS total_tickets,
    COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS abiertos,
    COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS en_progreso,
    COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS resueltos,
    COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS cerrados,
    0 AS escalados, -- SIMULADO
    AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END) AS tiempo_promedio_resolucion, -- Proxy
    MAX(ts.created_at) AS ultimo_ticket
FROM comunidad c
LEFT JOIN ticket_soporte ts ON c.id = ts.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de tickets
CREATE OR REPLACE VIEW vista_tickets_dashboard AS
SELECT
    'total' AS tipo,
    COUNT(*) AS valor
FROM ticket_soporte
UNION ALL
SELECT
    'abiertos' AS tipo,
    COUNT(*) AS valor
FROM ticket_soporte
WHERE estado = 'abierto'
UNION ALL
SELECT
    'en_progreso' AS tipo,
    COUNT(*) AS valor
FROM ticket_soporte
WHERE estado = 'en_progreso'
UNION ALL
SELECT
    'resueltos' AS tipo,
    COUNT(*) AS valor
FROM ticket_soporte
WHERE estado IN ('resuelto', 'cerrado')
UNION ALL
SELECT
    'escalados' AS tipo,
    0 AS valor
FROM DUAL -- SIMULADO
UNION ALL
SELECT
    'vencidos' AS tipo,
    COUNT(*) AS valor
FROM ticket_soporte
WHERE estado NOT IN ('resuelto', 'cerrado') AND CURDATE() > updated_at -- Proxy
UNION ALL
SELECT
    'tiempo_promedio_resolucion' AS tipo,
    ROUND(AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END), 1) AS valor
FROM ticket_soporte;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_ticket_soporte_comunidad_id ON ticket_soporte(comunidad_id);
CREATE INDEX idx_ticket_soporte_unidad_id ON ticket_soporte(unidad_id);
CREATE INDEX idx_ticket_soporte_usuario_asignado_id ON ticket_soporte(asignado_a);
CREATE INDEX idx_ticket_soporte_estado ON ticket_soporte(estado);
CREATE INDEX idx_ticket_soporte_prioridad ON ticket_soporte(prioridad);
CREATE INDEX idx_ticket_soporte_categoria ON ticket_soporte(categoria);
CREATE INDEX idx_ticket_soporte_fecha_creacion ON ticket_soporte(created_at DESC);
CREATE INDEX idx_ticket_soporte_fecha_actualizacion ON ticket_soporte(updated_at); -- Proxy de cierre/vencimiento

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_ticket_soporte_comunidad_estado ON ticket_soporte(comunidad_id, estado);
CREATE INDEX idx_ticket_soporte_estado_fecha ON ticket_soporte(estado, created_at DESC);
CREATE INDEX idx_ticket_soporte_asignado_estado ON ticket_soporte(asignado_a, estado);
CREATE INDEX idx_ticket_soporte_categoria_estado ON ticket_soporte(categoria, estado);
CREATE INDEX idx_ticket_soporte_fecha_rango ON ticket_soporte(created_at, updated_at);

-- Índices para estadísticas mensuales
CREATE INDEX idx_ticket_soporte_anio_mes ON ticket_soporte(YEAR(created_at), MONTH(created_at));

-- Índices para validaciones
CREATE INDEX idx_ticket_soporte_fechas_validacion ON ticket_soporte(created_at, updated_at);