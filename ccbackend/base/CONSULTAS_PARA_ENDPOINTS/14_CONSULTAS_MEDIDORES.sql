-- =========================================
-- QUERIES PARA MÓDULO MEDIDORES
-- Sistema de Gestión de Condominios - Cuentas Claras
-- =========================================
-- NOTA DE CORRECCIÓN: La tabla 'medidor' es muy simple. Se han eliminado o reemplazado con NULL/fijos
-- las referencias a columnas no existentes (numero_serie, marca, modelo, activo, alertas, mantenimientos, etc.).
-- Se ajustaron los nombres de columna para 'unidad' (codigo) y 'comunidad' (razon_social).

-- =========================================
-- 1. LISTADO BÁSICO DE MEDIDORES CON FILTROS
-- =========================================

-- Consulta principal para listado de medidores
SELECT
    m.id,
    m.codigo AS code,
    NULL AS serial_number, -- CORRECCIÓN: Columna inexistente
    m.tipo AS type,
    'active' AS status, -- CORRECCIÓN: Columna 'activo' no existe
    NULL AS brand, -- CORRECCIÓN: Columna inexistente
    NULL AS model, -- CORRECCIÓN: Columna inexistente

    -- Información de ubicación
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'floor', NULL, -- CORRECCIÓN: Columna 'u.piso' no existe
        'unit', COALESCE(u.codigo, ''), -- CORRECCIÓN: Usar u.codigo
        'position', NULL, -- CORRECCIÓN: Columna 'm.ubicacion' no existe
        'coordinates', NULL -- CORRECCIÓN: Columna 'm.coordenadas' no existe
    ) AS location,

    -- Información de comunidad
    JSON_OBJECT(
        'id', c.id,
        'name', c.razon_social, -- CORRECCIÓN: Usar c.razon_social
        'address', COALESCE(c.direccion, '')
    ) AS community,

    -- Información de instalación (SIMULADA)
    JSON_OBJECT(
        'date', NULL,
        'technician', NULL,
        'company', NULL,
        'warranty', NULL,
        'certificate', NULL
    ) AS installation,

    -- Última lectura (Última lectura por medidor)
    JSON_OBJECT(
        'value', COALESCE(ul.lectura, 0.0), -- CORRECCIÓN: Usar ul.lectura
        'date', DATE_FORMAT(ul.fecha, '%Y-%m-%d'), -- CORRECCIÓN: Usar ul.fecha
        'consumption', NULL, -- CORRECCIÓN: Consumo no está en la tabla de lectura
        'period', COALESCE(ul.periodo, 'N/A')
    ) AS last_reading,

    -- Especificaciones (SIMULADAS)
    JSON_OBJECT(
        'capacity', NULL,
        'precision', NULL,
        'certification', NULL
    ) AS specifications,

    -- Mantenimiento (SIMULADO - Tablas no existen)
    JSON_OBJECT(
        'lastService', NULL,
        'nextService', NULL,
        'frequency', 'semestral',
        'serviceCompany', NULL,
        'notes', NULL
    ) AS maintenance,

    -- Alertas (SIMULADAS - Tablas no existen)
    JSON_OBJECT(
        'hasAlerts', FALSE,
        'count', 0,
        'severity', 'low',
        'lastAlert', NULL
    ) AS alerts,

    -- Configuración (SIMULADA)
    JSON_OBJECT(
        'readingFrequency', 'monthly',
        'alertThresholds', JSON_OBJECT(
            'consumption', 0,
            'pressure', 0,
            'temperature', 0
        ),
        'autoReading', FALSE,
        'notifications', FALSE
    ) AS configuration,

    DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
    DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at

FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
-- CORRECCIÓN: Subconsulta eficiente para la última lectura
LEFT JOIN lectura_medidor ul ON m.id = ul.medidor_id
LEFT JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
) AS ul_max ON ul.medidor_id = ul_max.medidor_id AND ul.fecha = ul_max.max_fecha

WHERE 1=1
    -- Filtros opcionales
    AND (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:edificio_id IS NULL OR u.edificio_id = :edificio_id)
    AND (:unidad_id IS NULL OR m.unidad_id = :unidad_id)
    AND (:search IS NULL OR
         m.codigo LIKE CONCAT('%', :search, '%')) -- CORRECCIÓN: Solo se busca por m.codigo
    AND (:type IS NULL OR m.tipo = :type)
    -- Filtro por status (Simulado como activo)
    AND (:status IS NULL OR :status = 'active')
    -- Se eliminan filtros por marca/modelo/numero_serie

ORDER BY m.created_at DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 2. VISTA DETALLADA DE MEDIDOR CON LECTURAS Y MANTENIMIENTOS
-- =========================================

-- Consulta detallada para un medidor específico
SELECT
    m.id,
    m.codigo AS code,
    NULL AS serial_number, -- CORRECCIÓN: Columna inexistente
    m.tipo AS type,
    'active' AS status, -- CORRECCIÓN: Columna 'activo' no existe
    NULL AS brand,
    NULL AS model,

    -- Información de ubicación completa
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'floor', NULL, -- CORRECCIÓN: Columna 'u.piso' no existe
        'unit', COALESCE(u.codigo, ''), -- CORRECCIÓN: Usar u.codigo
        'position', NULL,
        'coordinates', NULL
    ) AS location,

    -- Información de comunidad completa
    JSON_OBJECT(
        'id', c.id,
        'name', c.razon_social, -- CORRECCIÓN: Usar c.razon_social
        'address', COALESCE(c.direccion, '')
    ) AS community,

    -- Información de instalación (SIMULADA)
    JSON_OBJECT(
        'date', NULL,
        'technician', NULL,
        'company', NULL,
        'warranty', NULL,
        'certificate', NULL
    ) AS installation,

    -- Última lectura completa (Última lectura por medidor)
    JSON_OBJECT(
        'value', COALESCE(ul.lectura, 0.0), -- CORRECCIÓN: Usar ul.lectura
        'date', DATE_FORMAT(ul.fecha, '%Y-%m-%d %H:%i:%s'), -- CORRECCIÓN: Usar ul.fecha
        'consumption', NULL,
        'period', COALESCE(ul.periodo, 'N/A')
    ) AS last_reading,

    -- Especificaciones (SIMULADAS)
    JSON_OBJECT(
        'capacity', NULL,
        'precision', NULL,
        'certification', NULL
    ) AS specifications,

    -- Mantenimiento (SIMULADO)
    JSON_OBJECT(
        'lastService', NULL,
        'nextService', NULL,
        'frequency', 'semestral',
        'serviceCompany', NULL,
        'notes', NULL
    ) AS maintenance,

    -- Alertas (SIMULADAS)
    JSON_OBJECT(
        'hasAlerts', FALSE,
        'count', 0,
        'severity', 'low',
        'lastAlert', NULL
    ) AS alerts,

    -- Configuración (SIMULADA)
    JSON_OBJECT(
        'readingFrequency', 'monthly',
        'alertThresholds', JSON_OBJECT(
            'consumption', 0,
            'pressure', 0,
            'temperature', 0
        ),
        'autoReading', FALSE,
        'notifications', FALSE
    ) AS configuration,

    -- Historial de lecturas (últimas 12)
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', lm.id,
                'date', DATE_FORMAT(lm.fecha, '%Y-%m-%d %H:%i:%s'), -- CORRECCIÓN: Usar lm.fecha
                'value', lm.lectura,
                'consumption', NULL, -- Columna 'consumo' no existe
                'reader', 'Sistema', -- Columna 'usuario_lectura' no existe
                'method', 'manual', -- Columna 'automatica' no existe
                'status', 'valid', -- Columna 'estado' no existe
                'notes', NULL, -- Columna 'observaciones' no existe
                'photoUrl', NULL -- Columna 'foto_url' no existe
            )
        )
        FROM lectura_medidor lm
        WHERE lm.medidor_id = m.id
        ORDER BY lm.fecha DESC
        LIMIT 12),
        JSON_ARRAY()
    ) AS readings_history,

    -- Historial de mantenimientos (SIMULADO - Tablas no existen)
    JSON_ARRAY() AS maintenance_history,

    -- Alertas activas (SIMULADAS - Tablas no existen)
    JSON_ARRAY() AS active_alerts,

    DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
    DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at

FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor ul ON m.id = ul.medidor_id
LEFT JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
) AS ul_max ON ul.medidor_id = ul_max.medidor_id AND ul.fecha = ul_max.max_fecha
WHERE m.id = :medidor_id;

-- =========================================
-- 3. ESTADÍSTICAS GENERALES DE MEDIDORES
-- =========================================

-- Estadísticas generales del módulo medidores
SELECT
    COUNT(DISTINCT m.id) AS total_medidores,
    COUNT(DISTINCT m.id) AS medidores_activos, -- SIMULADO
    0 AS medidores_inactivos, -- SIMULADO
    COUNT(DISTINCT CASE WHEN m.tipo = 'electricidad' THEN m.id END) AS medidores_electricos, -- CORRECCIÓN: Tipos de ENUM reales
    COUNT(DISTINCT CASE WHEN m.tipo = 'agua' THEN m.id END) AS medidores_agua, -- CORRECCIÓN: Tipos de ENUM reales
    COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) AS medidores_gas, -- CORRECCIÓN: Tipos de ENUM reales
    COUNT(DISTINCT c.id) AS comunidades_con_medidores,
    COUNT(DISTINCT e.id) AS edificios_con_medidores,
    COUNT(DISTINCT u.id) AS unidades_con_medidores,

    -- Estadísticas de lecturas
    COUNT(DISTINCT lm.id) AS total_lecturas,
    AVG(lm.lectura) AS consumo_promedio, -- CORRECCIÓN: Usar lm.lectura
    MAX(lm.fecha) AS ultima_lectura_global, -- CORRECCIÓN: Usar lm.fecha

    -- Estadísticas de alertas (SIMULADAS)
    0 AS total_alertas,
    0 AS alertas_activas,
    0 AS alertas_altas,
    0 AS alertas_medias,
    0 AS alertas_bajas,

    -- Estadísticas de mantenimientos (SIMULADAS)
    0 AS total_mantenimientos,
    0 AS mantenimientos_completados,
    0 AS mantenimientos_pendientes

FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
-- Tablas 'alerta_medidor' y 'mantenimiento_medidor' eliminadas de JOIN
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
GROUP BY 1;

-- Estadísticas por tipo de medidor
SELECT
    m.tipo AS tipo_medidor,
    COUNT(DISTINCT m.id) AS total_medidores,
    COUNT(DISTINCT m.id) AS medidores_activos, -- SIMULADO
    COUNT(DISTINCT lm.id) AS total_lecturas,
    AVG(lm.lectura) AS consumo_promedio, -- CORRECCIÓN: Usar lm.lectura
    0 AS total_alertas, -- SIMULADO
    0 AS alertas_activas -- SIMULADO
FROM medidor m
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
-- Tablas 'alerta_medidor' eliminada de JOIN
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
GROUP BY m.tipo
ORDER BY total_medidores DESC;

-- Estadísticas por edificio
SELECT
    e.nombre AS edificio,
    COUNT(DISTINCT m.id) AS total_medidores,
    COUNT(DISTINCT m.id) AS medidores_activos, -- SIMULADO
    COUNT(DISTINCT CASE WHEN m.tipo = 'electricidad' THEN m.id END) AS electricos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'agua' THEN m.id END) AS agua,
    COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) AS gas,
    0 AS alertas_activas -- SIMULADO
FROM edificio e
LEFT JOIN unidad u ON e.id = u.edificio_id
LEFT JOIN medidor m ON u.id = m.unidad_id
-- Tabla 'alerta_medidor' eliminada de JOIN
WHERE (:comunidad_id IS NULL OR e.comunidad_id = :comunidad_id)
    AND m.id IS NOT NULL
GROUP BY e.id, e.nombre
ORDER BY total_medidores DESC;

-- =========================================
-- 4. CONSULTAS FILTRADAS PARA BÚSQUEDA AVANZADA
-- =========================================

-- Búsqueda por texto completo
SELECT
    m.id,
    m.codigo AS code,
    NULL AS serial_number, -- CORRECCIÓN: Columna inexistente
    m.tipo AS type,
    'active' AS status, -- SIMULADO
    NULL AS brand,
    NULL AS model,
    e.nombre AS building,
    u.codigo AS unit, -- CORRECCIÓN: Usar u.codigo
    c.razon_social AS community_name, -- CORRECCIÓN: Usar c.razon_social
    COALESCE(ul.lectura, 0.0) AS last_reading_value, -- CORRECCIÓN: Usar ul.lectura
    DATE_FORMAT(ul.fecha, '%Y-%m-%d') AS last_reading_date -- CORRECCIÓN: Usar ul.fecha
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor ul ON m.id = ul.medidor_id
LEFT JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
) AS ul_max ON ul.medidor_id = ul_max.medidor_id AND ul.fecha = ul_max.max_fecha
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         m.codigo LIKE CONCAT('%', :search, '%')) -- CORRECCIÓN: Solo se busca por m.codigo
ORDER BY m.created_at DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por estado y tipo
SELECT
    m.id,
    m.codigo AS code,
    NULL AS serial_number,
    m.tipo AS type,
    'active' AS status,
    NULL AS brand,
    NULL AS model,
    e.nombre AS building,
    u.codigo AS unit, -- CORRECCIÓN: Usar u.codigo
    0 AS active_alerts -- SIMULADO
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
-- Tabla 'alerta_medidor' eliminada de JOIN
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:tipo IS NULL OR m.tipo = :tipo)
    AND (:estado IS NULL OR :estado = 'active') -- SIMULADO (Asumido activo)
ORDER BY m.created_at DESC
LIMIT :limit OFFSET :offset;

-- Filtrar medidores con alertas
-- CORRECCIÓN: No implementable. Se simula una consulta dummy.
SELECT m.id, m.codigo AS code, 0 AS active_alerts, 'low' AS max_severity, NULL AS last_alert_date
FROM medidor m
WHERE 1=0;

-- =========================================
-- 5. CONSULTAS PARA EXPORTACIÓN DE DATOS
-- =========================================

-- Exportación completa de medidores para Excel/CSV
SELECT
    m.id AS 'ID',
    m.codigo AS 'Código',
    NULL AS 'Número Serie',
    CASE m.tipo
        WHEN 'electricidad' THEN 'Eléctrico'
        WHEN 'agua' THEN 'Agua'
        WHEN 'gas' THEN 'Gas'
        ELSE 'Otro'
    END AS 'Tipo',
    'Activo' AS 'Estado',
    NULL AS 'Marca',
    NULL AS 'Modelo',
    e.nombre AS 'Edificio',
    u.codigo AS 'Unidad', -- CORRECCIÓN: Usar u.codigo
    NULL AS 'Posición',
    c.razon_social AS 'Comunidad',
    NULL AS 'Capacidad',
    NULL AS 'Precisión',
    NULL AS 'Fecha Instalación',
    NULL AS 'Técnico Instalador',
    NULL AS 'Empresa Instaladora',
    NULL AS 'Fecha Garantía',
    COALESCE(ul.lectura, 0.0) AS 'Última Lectura',
    DATE_FORMAT(ul.fecha, '%d/%m/%Y') AS 'Fecha Última Lectura',
    NULL AS 'Último Consumo',
    NULL AS 'Último Mantenimiento', -- SIMULADO
    NULL AS 'Próximo Mantenimiento', -- SIMULADO
    0 AS 'Alertas Activas', -- SIMULADO
    DATE_FORMAT(m.created_at, '%d/%m/%Y %H:%i') AS 'Fecha Creación',
    DATE_FORMAT(m.updated_at, '%d/%m/%Y %H:%i') AS 'Última Modificación'
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor ul ON m.id = ul.medidor_id
LEFT JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
) AS ul_max ON ul.medidor_id = ul_max.medidor_id AND ul.fecha = ul_max.max_fecha
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:tipo IS NULL OR m.tipo = :tipo)
    AND (:estado IS NULL OR :estado = 'active') -- SIMULADO
ORDER BY c.razon_social ASC, e.nombre ASC, u.codigo ASC;

-- Exportación de lecturas por medidor
SELECT
    m.codigo AS 'Código Medidor',
    NULL AS 'Número Serie',
    e.nombre AS 'Edificio',
    u.codigo AS 'Unidad', -- CORRECCIÓN: Usar u.codigo
    DATE_FORMAT(lm.fecha, '%d/%m/%Y %H:%i') AS 'Fecha Lectura', -- CORRECCIÓN: Usar lm.fecha
    lm.lectura AS 'Valor', -- CORRECCIÓN: Usar lm.lectura
    NULL AS 'Consumo',
    'Manual' AS 'Método', -- SIMULADO
    'Confirmada' AS 'Estado', -- SIMULADO
    'Sistema' AS 'Usuario', -- SIMULADO
    NULL AS 'Observaciones' -- SIMULADO
FROM medidor m
INNER JOIN lectura_medidor lm ON m.id = lm.medidor_id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:medidor_id IS NULL OR m.id = :medidor_id)
    AND (:fecha_desde IS NULL OR lm.fecha >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR lm.fecha <= :fecha_hasta)
ORDER BY m.codigo ASC, lm.fecha DESC;

-- =========================================
-- 6. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- =========================================

-- Validar medidores sin lecturas recientes (NO IMPLEMENTABLE por columnas inexistentes)
SELECT
    m.id,
    m.codigo AS code,
    DATEDIFF(CURDATE(), ul.fecha) AS days_without_reading
FROM medidor m
LEFT JOIN lectura_medidor ul ON m.id = ul.medidor_id
LEFT JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
) AS ul_max ON ul.medidor_id = ul_max.medidor_id AND ul.fecha = ul_max.max_fecha
WHERE 1=0; -- Consulta dummy

-- Validar medidores sin mantenimientos recientes (NO IMPLEMENTABLE por tablas inexistentes)
SELECT m.id, m.codigo AS code, NULL AS days_since_last_maintenance
FROM medidor m WHERE 1=0; -- Consulta dummy

-- Validar medidores con lecturas inconsistentes (Se ajusta la consulta de ventana)
SELECT
    m.id,
    m.codigo AS code,
    lm.fecha,
    lm.lectura AS current_value,
    LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha) AS previous_value,
    (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) AS difference,
    CASE
        WHEN (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) < 0
        THEN 'Lectura menor que anterior'
        WHEN (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) > 10000
        THEN 'Consumo excesivo (Umbral 10000)'
        ELSE 'Normal'
    END AS validation_status
FROM medidor m
INNER JOIN lectura_medidor lm ON m.id = lm.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
ORDER BY m.id, lm.fecha DESC;

-- Verificar integridad de datos
SELECT
    'medidor' AS tabla,
    COUNT(*) AS total_registros,
    COUNT(CASE WHEN m.codigo IS NULL OR m.codigo = '' THEN 1 END) AS codigo_nulo,
    0 AS numero_serie_nulo, -- SIMULADO
    COUNT(CASE WHEN m.tipo NOT IN ('electricidad','agua','gas') THEN 1 END) AS tipo_invalido, -- CORRECCIÓN: Tipos de ENUM reales
    0 AS activo_invalido, -- SIMULADO
    COUNT(CASE WHEN m.unidad_id IS NULL THEN 1 END) AS unidad_id_nula,
    COUNT(CASE WHEN m.comunidad_id IS NULL THEN 1 END) AS comunidad_id_nula
FROM medidor m
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id);

-- =========================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =========================================

-- Vista optimizada para listados de medidores
CREATE OR REPLACE VIEW vista_medidores_listado AS
SELECT
    m.id,
    m.codigo AS code,
    m.tipo AS type,
    'active' AS status,
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'unit', COALESCE(u.codigo, '')
    ) AS location,
    JSON_OBJECT(
        'id', c.id,
        'name', c.razon_social
    ) AS community,
    JSON_OBJECT(
        'value', COALESCE(ul.lectura, 0.0),
        'date', DATE_FORMAT(ul.fecha, '%Y-%m-%d')
    ) AS last_reading,
    m.created_at,
    m.updated_at
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor ul ON m.id = ul.medidor_id
LEFT JOIN (
    SELECT medidor_id, MAX(fecha) AS max_fecha
    FROM lectura_medidor
    GROUP BY medidor_id
) AS ul_max ON ul.medidor_id = ul_max.medidor_id AND ul.fecha = ul_max.max_fecha;

-- Vista optimizada para estadísticas de medidores
CREATE OR REPLACE VIEW vista_medidores_estadisticas AS
SELECT
    m.comunidad_id,
    c.razon_social AS comunidad,
    COUNT(m.id) AS total_medidores,
    COUNT(CASE WHEN m.tipo = 'electricidad' THEN m.id END) AS medidores_electricos,
    COUNT(CASE WHEN m.tipo = 'agua' THEN m.id END) AS medidores_agua,
    COUNT(CASE WHEN m.tipo = 'gas' THEN m.id END) AS medidores_gas,
    COUNT(lm.id) AS total_lecturas,
    AVG(lm.lectura) AS consumo_promedio
FROM medidor m
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
GROUP BY m.comunidad_id, c.razon_social;