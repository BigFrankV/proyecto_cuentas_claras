-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO NOTIFICACIONES
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-15 (Corregido)
-- =========================================
-- NOTA DE CORRECCIÓN: La tabla 'notificacion' no existe. Se usa 'notificacion_usuario' (n).
-- Se eliminaron todas las estadísticas de envío (enviados, abiertos, etc.) y la tabla 'notificacion_estadistica'
-- ya que no existen en el esquema. Se usan COUNT y 'leida' como proxy.

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de notificaciones con filtros
SELECT
    n.id,
    n.titulo AS asunto, -- CORRECCIÓN: Usar 'titulo' como asunto
    n.mensaje,
    n.tipo,
    n.leida AS estado_leida, -- CORRECCIÓN: Usar 'leida' como estado (1/0)
    c.razon_social AS comunidad,
    -- CORRECCIÓN: El autor no está explícito. Se simula 'Sistema'.
    'Sistema' AS autor,
    n.fecha_creacion,
    -- Columnas inexistentes (Simuladas/Eliminadas)
    NULL AS canales,
    NULL AS audiencia_tipo,
    NULL AS fecha_envio,
    NULL AS fecha_programada,
    NULL AS prioridad,
    -- Estadísticas de entrega (SIMULADAS)
    0 AS enviados,
    n.leida AS abiertos, -- SIMULADO: 'Leida' es 'Abiertos'
    (1 - n.leida) AS pendientes, -- SIMULADO: 1 - 'Leida'
    -- Cálculos adicionales (SIMULADOS)
    CASE
        WHEN n.leida = 1 THEN 'leida'
        ELSE 'pendiente'
    END AS estado_descripcion,
    'procesada' AS estado_programacion,
    DATEDIFF(NOW(), n.fecha_creacion) AS dias_desde_creacion
FROM notificacion_usuario n -- CORRECCIÓN: Nombre de la tabla
JOIN comunidad c ON n.comunidad_id = c.id
-- No hay columna de autor en n. Se elimina el JOIN a usuario u.
WHERE
    (:comunidad_id IS NULL OR n.comunidad_id = :comunidad_id) AND
    (:estado_leida IS NULL OR n.leida = :estado_leida) AND -- CORRECCIÓN: Filtrar por leida
    (:tipo IS NULL OR n.tipo = :tipo) AND
    (:persona_id IS NULL OR n.persona_id = :persona_id) AND -- CORRECCIÓN: Filtrar por persona_id (destinatario)
    (:fecha_desde IS NULL OR n.fecha_creacion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR n.fecha_creacion <= :fecha_hasta)
ORDER BY n.fecha_creacion DESC, n.id DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de notificaciones por comunidad con estadísticas
SELECT
    c.razon_social AS comunidad,
    COUNT(n.id) AS total_notificaciones,
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS abiertas, -- SIMULADO
    COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS pendientes, -- SIMULADO
    0 AS borradores, -- SIMULADO
    0 AS programadas, -- SIMULADO
    COUNT(n.id) AS total_enviados, -- SIMULADO: Todo registro es 'enviado'
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS total_entregados, -- SIMULADO: 'Leida' es 'Entregados'
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(n.id)), 2 -- Tasa de Apertura/Entrega (proxy)
    ) AS tasa_entrega_promedio,
    MAX(n.fecha_creacion) AS ultima_notificacion
FROM comunidad c
LEFT JOIN notificacion_usuario n ON c.id = n.comunidad_id -- CORRECCIÓN: Nombre de la tabla
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Notificaciones programadas pendientes
-- CORRECCIÓN: No implementable por falta de columna 'fecha_programada' y 'estado'. Se simula un listado de no leídas.
SELECT
    n.id,
    n.titulo AS asunto,
    n.tipo,
    c.razon_social AS comunidad,
    'Sistema' AS autor,
    n.fecha_creacion AS fecha_programada,
    1 AS audiencia_cantidad,
    'app' AS canales,
    0 AS minutos_restantes,
    'pendiente_lectura' AS urgencia_envio
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id
WHERE n.leida = 0
ORDER BY n.fecha_creacion ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una notificación específica
SELECT
    n.id,
    n.titulo AS asunto,
    n.mensaje,
    n.tipo,
    n.leida AS estado_leida,
    n.objeto_tipo,
    n.objeto_id,
    c.id AS comunidad_id,
    c.razon_social AS comunidad_nombre,
    -- Autor y otros campos (SIMULADOS)
    NULL AS autor_id,
    'Sistema' AS autor_nombre,
    NULL AS autor_email,
    n.fecha_creacion,
    -- Estadísticas (SIMULADAS)
    JSON_OBJECT(
        'enviados', 1,
        'entregados', n.leida,
        'abiertos', n.leida,
        'fallidos', (1 - n.leida),
        'tasa_entrega', ROUND(n.leida * 100.0, 2),
        'tasa_apertura', ROUND(n.leida * 100.0, 2)
    ) AS estadisticas_entrega,
    -- Conteos relacionados (SIMULADOS)
    0 AS num_adjuntos,
    0 AS num_historial
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id
WHERE n.id = :notificacion_id;

-- 2.2 Vista de notificaciones con información completa para listado
SELECT
    n.id,
    n.titulo AS asunto,
    n.tipo,
    c.razon_social AS comunidad,
    'Sistema' AS autor,
    n.fecha_creacion,
    n.leida AS estado_leida,
    JSON_OBJECT(
        'notificacion', JSON_OBJECT(
            'id', n.id,
            'asunto', n.titulo,
            'tipo', n.tipo,
            'leida', n.leida
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'autor', JSON_OBJECT(
            'nombre', 'Sistema',
            'email', c.email_contacto
        ),
        'audiencia', JSON_OBJECT(
            'tipo', n.tipo,
            'cantidad', 1,
            'descripcion', 'Destinatario Único'
        ),
        'estadisticas', JSON_OBJECT(
            'enviados', 1,
            'entregados', n.leida,
            'abiertos', n.leida
        )
    ) AS informacion_completa
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id
ORDER BY n.fecha_creacion DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de notificaciones
SELECT
    COUNT(*) AS total_notificaciones,
    COUNT(DISTINCT comunidad_id) AS comunidades_con_notificaciones,
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS notificaciones_leidas, -- CORRECCIÓN: Usar leida
    COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS notificaciones_pendientes, -- CORRECCIÓN: Usar leida
    0 AS notificaciones_programadas, -- SIMULADO
    0 AS notificaciones_fallidas, -- SIMULADO
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS porcentaje_leidas, -- Tasa de Apertura (Proxy)
    COUNT(*) AS total_mensajes_enviados, -- SIMULADO: Total de registros
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS total_mensajes_entregados, -- SIMULADO: Total de leídas
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS tasa_entrega_global, -- Proxy
    MIN(fecha_creacion) AS primera_notificacion,
    MAX(fecha_creacion) AS ultima_notificacion
FROM notificacion_usuario n;

-- 3.2 Estadísticas por estado (Leída vs. Pendiente)
SELECT
    CASE WHEN leida = 1 THEN 'leida' ELSE 'pendiente' END AS estado,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion_usuario)), 2
    ) AS porcentaje,
    COUNT(CASE WHEN leida = 1 THEN 1 END) AS mensajes_leidos,
    ROUND(
        (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS tasa_lectura_proxy,
    MIN(fecha_creacion) AS mas_antigua,
    MAX(fecha_creacion) AS mas_reciente
FROM notificacion_usuario n
GROUP BY leida
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por tipo
SELECT
    tipo,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion_usuario)), 2
    ) AS porcentaje,
    COUNT(CASE WHEN leida = 1 THEN 1 END) AS leidas,
    ROUND(
        (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS tasa_lectura_proxy,
    COUNT(*) AS total_enviados,
    ROUND(
        (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS tasa_entrega_promedio_proxy
FROM notificacion_usuario n
GROUP BY tipo
ORDER BY cantidad DESC;

-- 3.4 Estadísticas por canal (SIMULADA - Ya que canales no existe)
SELECT
    'app' AS canal,
    COUNT(n.id) AS notificaciones_usando_canal,
    COUNT(n.id) AS mensajes_enviados,
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS mensajes_entregados,
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS mensajes_abiertos,
    0 AS mensajes_clicados,
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(n.id)), 2
    ) AS tasa_entrega,
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN n.leida = 1 THEN 1 END), 0)), 2
    ) AS tasa_apertura
FROM notificacion_usuario n
GROUP BY 1
ORDER BY notificaciones_usando_canal DESC;

-- 3.5 Estadísticas mensuales de notificaciones
SELECT
    YEAR(fecha_creacion) AS anio,
    MONTH(fecha_creacion) AS mes,
    COUNT(*) AS total_notificaciones,
    COUNT(CASE WHEN leida = 1 THEN 1 END) AS leidas,
    COUNT(CASE WHEN leida = 0 THEN 1 END) AS pendientes,
    0 AS programadas, -- SIMULADO
    0 AS fallidas, -- SIMULADO
    COUNT(*) AS total_enviados,
    ROUND(
        (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS tasa_lectura_promedio
FROM notificacion_usuario n
WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY anio DESC, mes DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de notificaciones
SELECT
    n.id,
    n.titulo AS asunto,
    n.tipo,
    c.razon_social AS comunidad,
    'Sistema' AS autor,
    n.fecha_creacion,
    n.leida AS leida,
    1 AS enviados,
    n.leida AS entregados,
    n.leida AS abiertos,
    CASE
        WHEN n.leida = 1 THEN 'leida'
        ELSE 'pendiente'
    END AS estado_actual
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id
WHERE
    (:busqueda IS NULL OR
     n.titulo LIKE CONCAT('%', :busqueda, '%') OR
     n.mensaje LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR n.comunidad_id = :comunidad_id) AND
    (:estado_leida IS NULL OR n.leida = :estado_leida) AND
    (:tipo IS NULL OR n.tipo = :tipo) AND
    (:fecha_desde IS NULL OR n.fecha_creacion >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR n.fecha_creacion <= :fecha_hasta)
GROUP BY n.id, c.id, c.razon_social
ORDER BY n.fecha_creacion DESC, n.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Notificaciones por autor con estadísticas
-- CORRECCIÓN: Se agrupa por la comunidad, ya que el autor no está explícito
SELECT
    c.id AS comunidad_id,
    c.razon_social AS comunidad,
    COUNT(n.id) AS total_notificaciones,
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS leidas,
    COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS pendientes,
    COUNT(n.id) AS total_enviados,
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(n.id)), 2
    ) AS tasa_lectura_promedio,
    MAX(n.fecha_creacion) AS ultima_notificacion
FROM comunidad c
LEFT JOIN notificacion_usuario n ON c.id = n.comunidad_id
WHERE (:comunidad_id IS NULL OR c.id = :comunidad_id)
GROUP BY c.id, c.razon_social
HAVING COUNT(n.id) > 0
ORDER BY total_notificaciones DESC;

-- 4.3 Notificaciones por tipo de audiencia (Agrupado por tipo real)
SELECT
    n.tipo AS audiencia_tipo,
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion_usuario)), 2
    ) AS porcentaje,
    COUNT(n.id) AS total_destinatarios,
    1 AS promedio_destinatarios,
    COUNT(n.id) AS total_enviados,
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(n.id)), 2
    ) AS tasa_entrega_promedio
FROM notificacion_usuario n
GROUP BY n.tipo
ORDER BY cantidad DESC;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de notificaciones para Excel/CSV
SELECT
    n.id AS 'ID',
    n.titulo AS 'Asunto',
    n.mensaje AS 'Mensaje',
    n.tipo AS 'Tipo',
    CASE WHEN n.leida = 1 THEN 'Leída' ELSE 'Pendiente' END AS 'Estado Lectura',
    'App' AS 'Canales', -- SIMULADO
    n.objeto_tipo AS 'Tipo Objeto',
    n.objeto_id AS 'ID Objeto',
    c.razon_social AS 'Comunidad',
    'Sistema' AS 'Autor',
    DATE_FORMAT(n.fecha_creacion, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
    1 AS 'Enviados',
    n.leida AS 'Abiertos',
    (1 - n.leida) AS 'Pendientes',
    0 AS 'Clicados', -- SIMULADO
    0 AS 'Fallidos' -- SIMULADO
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id
ORDER BY n.fecha_creacion DESC;

-- 5.2 Exportación de notificaciones enviadas con estadísticas
SELECT
    n.titulo AS 'Notificación',
    c.razon_social AS 'Comunidad',
    'Sistema' AS 'Autor',
    n.tipo AS 'Tipo',
    DATE_FORMAT(n.fecha_creacion, '%Y-%m-%d %H:%i') AS 'Enviada',
    1 AS 'Destinatarios',
    'App' AS 'Canales',
    1 AS 'Enviados',
    n.leida AS 'Entregados',
    ROUND(n.leida * 100.0, 2) AS 'Tasa Entrega (%)',
    n.leida AS 'Abiertos',
    ROUND(n.leida * 100.0, 2) AS 'Tasa Apertura (%)'
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id
WHERE n.leida = 1 -- Solo las "entregadas/abiertas"
ORDER BY n.fecha_creacion DESC;

-- 5.3 Exportación de estadísticas de entrega por mes
SELECT
    YEAR(n.fecha_creacion) AS 'Año',
    MONTH(n.fecha_creacion) AS 'Mes',
    COUNT(n.id) AS 'Total Notificaciones',
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS 'Leídas',
    COUNT(n.id) AS 'Total Enviados',
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS 'Total Entregados',
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / COUNT(n.id)), 2
    ) AS 'Tasa Entrega Promedio (%)',
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS 'Total Abiertos',
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN n.leida = 1 THEN 1 END), 0)), 2
    ) AS 'Tasa Apertura Promedio (%)'
FROM notificacion_usuario n
WHERE n.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY 1 DESC, 2 DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de notificaciones
SELECT
    'Notificaciones sin comunidad' AS validacion,
    COUNT(*) AS cantidad
FROM notificacion_usuario n
LEFT JOIN comunidad c ON n.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Notificaciones sin destinatario (persona)' AS validacion,
    COUNT(*) AS cantidad
FROM notificacion_usuario n
LEFT JOIN persona p ON n.persona_id = p.id
WHERE p.id IS NULL;
-- Las validaciones de estado y fechas programadas no son implementables.

-- 6.2 Validar consistencia de estados y fechas (NO IMPLEMENTABLE en su mayoría)
SELECT 'Inconsistencias en estados y fechas (no implementable por falta de columnas)' AS validacion, 0 AS cantidad_errores, NULL AS detalles FROM DUAL;

-- 6.3 Validar estadísticas de entrega (NO IMPLEMENTABLE)
SELECT 'Estadísticas de entrega inconsistentes (no implementable por falta de tabla)' AS validacion, 0 AS cantidad_errores, NULL AS detalles FROM DUAL;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de notificaciones
CREATE OR REPLACE VIEW vista_notificaciones_listado AS
SELECT
    n.id,
    n.titulo AS asunto,
    n.mensaje,
    n.tipo,
    n.leida,
    c.razon_social AS comunidad,
    n.fecha_creacion,
    n.objeto_tipo,
    n.objeto_id,
    (1 - n.leida) AS pendientes
FROM notificacion_usuario n
JOIN comunidad c ON n.comunidad_id = c.id;

-- 7.2 Vista para estadísticas de notificaciones por comunidad
CREATE OR REPLACE VIEW vista_notificaciones_estadisticas AS
SELECT
    c.razon_social AS comunidad,
    COUNT(n.id) AS total_notificaciones,
    COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS leidas,
    COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS pendientes,
    ROUND(
        (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(n.id), 0)), 2
    ) AS tasa_lectura_promedio
FROM comunidad c
LEFT JOIN notificacion_usuario n ON c.id = n.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de notificaciones
CREATE OR REPLACE VIEW vista_notificaciones_dashboard AS
SELECT
    'total' AS tipo,
    COUNT(*) AS valor
FROM notificacion_usuario
UNION ALL
SELECT
    'leidas' AS tipo,
    COUNT(*) AS valor
FROM notificacion_usuario
WHERE leida = 1
UNION ALL
SELECT
    'pendientes' AS tipo,
    COUNT(*) AS valor
FROM notificacion_usuario
WHERE leida = 0;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS (AJUSTADOS AL NOMBRE CORRECTO)
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_notif_usuario_comunidad_id ON notificacion_usuario(comunidad_id);
CREATE INDEX idx_notif_usuario_persona_id ON notificacion_usuario(persona_id);
CREATE INDEX idx_notif_usuario_tipo ON notificacion_usuario(tipo);
CREATE INDEX idx_notif_usuario_fecha_creacion ON notificacion_usuario(fecha_creacion DESC);
CREATE INDEX idx_notif_usuario_leida ON notificacion_usuario(leida);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_notif_usuario_comunidad_leida ON notificacion_usuario(comunidad_id, leida);
CREATE INDEX idx_notif_usuario_persona_fecha ON notificacion_usuario(persona_id, fecha_creacion DESC);

-- Índice para estadísticas mensuales
CREATE INDEX idx_notif_usuario_anio_mes ON notificacion_usuario(YEAR(fecha_creacion), MONTH(fecha_creacion));

-- Índices para validaciones
CREATE INDEX idx_notif_usuario_objeto ON notificacion_usuario(objeto_tipo, objeto_id);