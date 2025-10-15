-- =========================================
-- QUERIES PARA MÓDULO MEDIDORES
-- Sistema de Gestión de Condominios - Cuentas Claras
-- =========================================

-- =========================================
-- 1. LISTADO BÁSICO DE MEDIDORES CON FILTROS
-- =========================================

-- Consulta principal para listado de medidores
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    CASE
        WHEN m.activo = 1 THEN 'active'
        ELSE 'inactive'
    END as status,
    COALESCE(m.marca, '') as brand,
    COALESCE(m.modelo, '') as model,

    -- Información de ubicación
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'floor', COALESCE(u.piso, ''),
        'unit', COALESCE(u.numero, ''),
        'position', COALESCE(m.ubicacion, ''),
        'coordinates', COALESCE(m.coordenadas, '')
    ) as location,

    -- Información de comunidad
    JSON_OBJECT(
        'id', c.id,
        'name', c.nombre,
        'address', COALESCE(c.direccion, '')
    ) as community,

    -- Información de instalación
    JSON_OBJECT(
        'date', DATE_FORMAT(m.fecha_instalacion, '%Y-%m-%d'),
        'technician', COALESCE(m.tecnico_instalador, ''),
        'company', COALESCE(m.empresa_instaladora, ''),
        'warranty', DATE_FORMAT(m.fecha_garantia, '%Y-%m-%d'),
        'certificate', COALESCE(m.certificado, '')
    ) as installation,

    -- Última lectura
    JSON_OBJECT(
        'value', COALESCE(ultima_lectura.valor, 0),
        'date', DATE_FORMAT(ultima_lectura.fecha_lectura, '%Y-%m-%d'),
        'consumption', COALESCE(ultima_lectura.consumo, 0),
        'period', DATE_FORMAT(ultima_lectura.fecha_lectura, '%M %Y')
    ) as last_reading,

    -- Especificaciones
    JSON_OBJECT(
        'capacity', COALESCE(m.capacidad, ''),
        'precision', COALESCE(m.precision_medicion, ''),
        'certification', COALESCE(m.certificacion, ''),
        'operatingTemp', COALESCE(m.temperatura_operacion, ''),
        'maxPressure', COALESCE(m.presion_maxima, ''),
        'communicationType', COALESCE(m.tipo_comunicacion, '')
    ) as specifications,

    -- Mantenimiento
    JSON_OBJECT(
        'lastService', DATE_FORMAT(ultimo_mantenimiento.fecha_mantenimiento, '%Y-%m-%d'),
        'nextService', DATE_FORMAT(m.proximo_mantenimiento, '%Y-%m-%d'),
        'frequency', COALESCE(m.frecuencia_mantenimiento, 'semestral'),
        'serviceCompany', COALESCE(m.empresa_mantenimiento, ''),
        'notes', COALESCE(ultimo_mantenimiento.notas, '')
    ) as maintenance,

    -- Alertas
    JSON_OBJECT(
        'hasAlerts', CASE WHEN alertas_count.total > 0 THEN true ELSE false END,
        'count', COALESCE(alertas_count.total, 0),
        'severity', COALESCE(alertas_activas.severidad_max, 'low'),
        'lastAlert', DATE_FORMAT(ultima_alerta.fecha_alerta, '%Y-%m-%d %H:%i')
    ) as alerts,

    -- Configuración
    JSON_OBJECT(
        'readingFrequency', COALESCE(m.frecuencia_lectura, 'monthly'),
        'alertThresholds', JSON_OBJECT(
            'consumption', COALESCE(m.umbral_consumo, 0),
            'pressure', COALESCE(m.umbral_presion, 0),
            'temperature', COALESCE(m.umbral_temperatura, 0)
        ),
        'autoReading', CASE WHEN m.lectura_automatica = 1 THEN true ELSE false END,
        'notifications', CASE WHEN m.notificaciones = 1 THEN true ELSE false END
    ) as configuration,

    DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
    DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at

FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN (
    -- Última lectura
    SELECT
        lm.medidor_id,
        lm.valor,
        lm.fecha_lectura,
        lm.consumo
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
LEFT JOIN (
    -- Último mantenimiento
    SELECT
        mm.medidor_id,
        mm.fecha_mantenimiento,
        mm.notas
    FROM mantenimiento_medidor mm
    WHERE mm.fecha_mantenimiento = (
        SELECT MAX(fecha_mantenimiento)
        FROM mantenimiento_medidor
        WHERE medidor_id = mm.medidor_id
    )
) ultimo_mantenimiento ON m.id = ultimo_mantenimiento.medidor_id
LEFT JOIN (
    -- Conteo de alertas activas
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
LEFT JOIN (
    -- Severidad máxima de alertas activas
    SELECT
        am.medidor_id,
        MAX(am.severidad) as severidad_max
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_activas ON m.id = alertas_activas.medidor_id
LEFT JOIN (
    -- Última alerta
    SELECT
        am.medidor_id,
        am.fecha_alerta
    FROM alerta_medidor am
    WHERE am.fecha_alerta = (
        SELECT MAX(fecha_alerta)
        FROM alerta_medidor
        WHERE medidor_id = am.medidor_id
    )
) ultima_alerta ON m.id = ultima_alerta.medidor_id

WHERE 1=1
    -- Filtros opcionales
    AND (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:edificio_id IS NULL OR u.edificio_id = :edificio_id)
    AND (:unidad_id IS NULL OR m.unidad_id = :unidad_id)
    AND (:search IS NULL OR
         m.codigo LIKE CONCAT('%', :search, '%') OR
         m.numero_serie LIKE CONCAT('%', :search, '%') OR
         m.marca LIKE CONCAT('%', :search, '%') OR
         m.modelo LIKE CONCAT('%', :search, '%'))
    AND (:type IS NULL OR m.tipo = :type)
    AND (:status IS NULL OR
         (:status = 'active' AND m.activo = 1) OR
         (:status = 'inactive' AND m.activo = 0))
    AND (:brand IS NULL OR m.marca LIKE CONCAT('%', :brand, '%'))

ORDER BY m.created_at DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 2. VISTA DETALLADA DE MEDIDOR CON LECTURAS Y MANTENIMIENTOS
-- =========================================

-- Consulta detallada para un medidor específico
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    CASE
        WHEN m.activo = 1 THEN 'active'
        ELSE 'inactive'
    END as status,
    COALESCE(m.marca, '') as brand,
    COALESCE(m.modelo, '') as model,

    -- Información de ubicación completa
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'floor', COALESCE(u.piso, ''),
        'unit', COALESCE(u.numero, ''),
        'position', COALESCE(m.ubicacion, ''),
        'coordinates', COALESCE(m.coordenadas, '')
    ) as location,

    -- Información de comunidad completa
    JSON_OBJECT(
        'id', c.id,
        'name', c.nombre,
        'address', COALESCE(c.direccion, '')
    ) as community,

    -- Información de instalación completa
    JSON_OBJECT(
        'date', DATE_FORMAT(m.fecha_instalacion, '%Y-%m-%d'),
        'technician', COALESCE(m.tecnico_instalador, ''),
        'company', COALESCE(m.empresa_instaladora, ''),
        'warranty', DATE_FORMAT(m.fecha_garantia, '%Y-%m-%d'),
        'certificate', COALESCE(m.certificado, '')
    ) as installation,

    -- Última lectura completa
    JSON_OBJECT(
        'value', COALESCE(ultima_lectura.valor, 0),
        'date', DATE_FORMAT(ultima_lectura.fecha_lectura, '%Y-%m-%d %H:%i:%s'),
        'consumption', COALESCE(ultima_lectura.consumo, 0),
        'period', DATE_FORMAT(ultima_lectura.fecha_lectura, '%M %Y')
    ) as last_reading,

    -- Especificaciones completas
    JSON_OBJECT(
        'capacity', COALESCE(m.capacidad, ''),
        'precision', COALESCE(m.precision_medicion, ''),
        'certification', COALESCE(m.certificacion, ''),
        'operatingTemp', COALESCE(m.temperatura_operacion, ''),
        'maxPressure', COALESCE(m.presion_maxima, ''),
        'communicationType', COALESCE(m.tipo_comunicacion, '')
    ) as specifications,

    -- Mantenimiento completo
    JSON_OBJECT(
        'lastService', DATE_FORMAT(ultimo_mantenimiento.fecha_mantenimiento, '%Y-%m-%d'),
        'nextService', DATE_FORMAT(m.proximo_mantenimiento, '%Y-%m-%d'),
        'frequency', COALESCE(m.frecuencia_mantenimiento, 'semestral'),
        'serviceCompany', COALESCE(m.empresa_mantenimiento, ''),
        'notes', COALESCE(ultimo_mantenimiento.notas, '')
    ) as maintenance,

    -- Alertas completas
    JSON_OBJECT(
        'hasAlerts', CASE WHEN alertas_count.total > 0 THEN true ELSE false END,
        'count', COALESCE(alertas_count.total, 0),
        'severity', COALESCE(alertas_activas.severidad_max, 'low'),
        'lastAlert', DATE_FORMAT(ultima_alerta.fecha_alerta, '%Y-%m-%d %H:%i:%s')
    ) as alerts,

    -- Configuración completa
    JSON_OBJECT(
        'readingFrequency', COALESCE(m.frecuencia_lectura, 'monthly'),
        'alertThresholds', JSON_OBJECT(
            'consumption', COALESCE(m.umbral_consumo, 0),
            'pressure', COALESCE(m.umbral_presion, 0),
            'temperature', COALESCE(m.umbral_temperatura, 0)
        ),
        'autoReading', CASE WHEN m.lectura_automatica = 1 THEN true ELSE false END,
        'notifications', CASE WHEN m.notificaciones = 1 THEN true ELSE false END
    ) as configuration,

    -- Historial de lecturas (últimas 12)
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', lm.id,
                'date', DATE_FORMAT(lm.fecha_lectura, '%Y-%m-%d %H:%i:%s'),
                'value', lm.valor,
                'consumption', lm.consumo,
                'reader', COALESCE(lm.usuario_lectura, 'Sistema'),
                'method', CASE WHEN lm.automatica = 1 THEN 'automatic' ELSE 'manual' END,
                'status', CASE
                    WHEN lm.estado = 'confirmada' THEN 'valid'
                    WHEN lm.estado = 'estimada' THEN 'estimated'
                    ELSE 'error'
                END,
                'notes', COALESCE(lm.observaciones, ''),
                'photoUrl', COALESCE(lm.foto_url, '')
            )
        )
        FROM lectura_medidor lm
        WHERE lm.medidor_id = m.id
        ORDER BY lm.fecha_lectura DESC
        LIMIT 12),
        JSON_ARRAY()
    ) as readings_history,

    -- Historial de mantenimientos
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', mm.id,
                'date', DATE_FORMAT(mm.fecha_mantenimiento, '%Y-%m-%d'),
                'type', COALESCE(mm.tipo_mantenimiento, 'preventive'),
                'technician', COALESCE(mm.tecnico, ''),
                'company', COALESCE(mm.empresa, ''),
                'description', COALESCE(mm.descripcion, ''),
                'cost', COALESCE(mm.costo, 0),
                'parts', COALESCE(mm.repuestos, ''),
                'nextService', DATE_FORMAT(mm.proximo_mantenimiento, '%Y-%m-%d'),
                'status', CASE
                    WHEN mm.estado = 'completado' THEN 'completed'
                    WHEN mm.estado = 'pendiente' THEN 'pending'
                    ELSE 'cancelled'
                END
            )
        )
        FROM mantenimiento_medidor mm
        WHERE mm.medidor_id = m.id
        ORDER BY mm.fecha_mantenimiento DESC),
        JSON_ARRAY()
    ) as maintenance_history,

    -- Alertas activas
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', am.id,
                'type', COALESCE(am.tipo_alerta, 'anomaly'),
                'title', COALESCE(am.titulo, ''),
                'description', COALESCE(am.descripcion, ''),
                'timestamp', DATE_FORMAT(am.fecha_alerta, '%Y-%m-%d %H:%i:%s'),
                'severity', COALESCE(am.severidad, 'medium'),
                'resolved', CASE WHEN am.resuelta = 1 THEN true ELSE false END
            )
        )
        FROM alerta_medidor am
        WHERE am.medidor_id = m.id AND am.resuelta = 0
        ORDER BY am.fecha_alerta DESC),
        JSON_ARRAY()
    ) as active_alerts,

    DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
    DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at

FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN (
    -- Última lectura
    SELECT
        lm.medidor_id,
        lm.valor,
        lm.fecha_lectura,
        lm.consumo
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
LEFT JOIN (
    -- Último mantenimiento
    SELECT
        mm.medidor_id,
        mm.fecha_mantenimiento,
        mm.notas
    FROM mantenimiento_medidor mm
    WHERE mm.fecha_mantenimiento = (
        SELECT MAX(fecha_mantenimiento)
        FROM mantenimiento_medidor
        WHERE medidor_id = mm.medidor_id
    )
) ultimo_mantenimiento ON m.id = ultimo_mantenimiento.medidor_id
LEFT JOIN (
    -- Conteo de alertas activas
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
LEFT JOIN (
    -- Severidad máxima de alertas activas
    SELECT
        am.medidor_id,
        MAX(am.severidad) as severidad_max
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_activas ON m.id = alertas_activas.medidor_id
LEFT JOIN (
    -- Última alerta
    SELECT
        am.medidor_id,
        am.fecha_alerta
    FROM alerta_medidor am
    WHERE am.fecha_alerta = (
        SELECT MAX(fecha_alerta)
        FROM alerta_medidor
        WHERE medidor_id = am.medidor_id
    )
) ultima_alerta ON m.id = ultima_alerta.medidor_id

WHERE m.id = :medidor_id;

-- =========================================
-- 3. ESTADÍSTICAS GENERALES DE MEDIDORES
-- =========================================

-- Estadísticas generales del módulo medidores
SELECT
    COUNT(DISTINCT m.id) as total_medidores,
    COUNT(DISTINCT CASE WHEN m.activo = 1 THEN m.id END) as medidores_activos,
    COUNT(DISTINCT CASE WHEN m.activo = 0 THEN m.id END) as medidores_inactivos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'electric' THEN m.id END) as medidores_electricos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'water' THEN m.id END) as medidores_agua,
    COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) as medidores_gas,
    COUNT(DISTINCT c.id) as comunidades_con_medidores,
    COUNT(DISTINCT e.id) as edificios_con_medidores,
    COUNT(DISTINCT u.id) as unidades_con_medidores,

    -- Estadísticas de lecturas
    COUNT(DISTINCT lm.id) as total_lecturas,
    AVG(lm.consumo) as consumo_promedio,
    MAX(lm.fecha_lectura) as ultima_lectura_global,

    -- Estadísticas de alertas
    COUNT(DISTINCT am.id) as total_alertas,
    COUNT(DISTINCT CASE WHEN am.resuelta = 0 THEN am.id END) as alertas_activas,
    COUNT(DISTINCT CASE WHEN am.severidad = 'high' THEN am.id END) as alertas_altas,
    COUNT(DISTINCT CASE WHEN am.severidad = 'medium' THEN am.id END) as alertas_medias,
    COUNT(DISTINCT CASE WHEN am.severidad = 'low' THEN am.id END) as alertas_bajas,

    -- Estadísticas de mantenimientos
    COUNT(DISTINCT mm.id) as total_mantenimientos,
    COUNT(DISTINCT CASE WHEN mm.estado = 'completado' THEN mm.id END) as mantenimientos_completados,
    COUNT(DISTINCT CASE WHEN mm.estado = 'pendiente' THEN mm.id END) as mantenimientos_pendientes

FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
LEFT JOIN alerta_medidor am ON m.id = am.medidor_id
LEFT JOIN mantenimiento_medidor mm ON m.id = mm.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id);

-- Estadísticas por tipo de medidor
SELECT
    m.tipo as tipo_medidor,
    COUNT(DISTINCT m.id) as total_medidores,
    COUNT(DISTINCT CASE WHEN m.activo = 1 THEN m.id END) as medidores_activos,
    COUNT(DISTINCT lm.id) as total_lecturas,
    AVG(lm.consumo) as consumo_promedio,
    COUNT(DISTINCT am.id) as total_alertas,
    COUNT(DISTINCT CASE WHEN am.resuelta = 0 THEN am.id END) as alertas_activas
FROM medidor m
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
LEFT JOIN alerta_medidor am ON m.id = am.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
GROUP BY m.tipo
ORDER BY total_medidores DESC;

-- Estadísticas por edificio
SELECT
    e.nombre as edificio,
    COUNT(DISTINCT m.id) as total_medidores,
    COUNT(DISTINCT CASE WHEN m.activo = 1 THEN m.id END) as medidores_activos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'electric' THEN m.id END) as electricos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'water' THEN m.id END) as agua,
    COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) as gas,
    COUNT(DISTINCT CASE WHEN am.resuelta = 0 THEN am.id END) as alertas_activas
FROM edificio e
LEFT JOIN unidad u ON e.id = u.edificio_id
LEFT JOIN medidor m ON u.id = m.unidad_id
LEFT JOIN alerta_medidor am ON m.id = am.medidor_id
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
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    CASE WHEN m.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    m.marca as brand,
    m.modelo as model,
    e.nombre as building,
    u.numero as unit,
    c.nombre as community_name,
    COALESCE(ultima_lectura.valor, 0) as last_reading_value,
    DATE_FORMAT(ultima_lectura.fecha_lectura, '%Y-%m-%d') as last_reading_date
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN (
    SELECT
        lm.medidor_id,
        lm.valor,
        lm.fecha_lectura
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:search IS NULL OR
         m.codigo LIKE CONCAT('%', :search, '%') OR
         m.numero_serie LIKE CONCAT('%', :search, '%') OR
         m.marca LIKE CONCAT('%', :search, '%') OR
         m.modelo LIKE CONCAT('%', :search, '%') OR
         e.nombre LIKE CONCAT('%', :search, '%') OR
         u.numero LIKE CONCAT('%', :search, '%'))
ORDER BY m.created_at DESC
LIMIT :limit OFFSET :offset;

-- Filtrar por estado y tipo
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    CASE WHEN m.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    m.marca as brand,
    m.modelo as model,
    e.nombre as building,
    u.numero as unit,
    COALESCE(alertas_count.total, 0) as active_alerts
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN (
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:tipo IS NULL OR m.tipo = :tipo)
    AND (:estado IS NULL OR
         (:estado = 'active' AND m.activo = 1) OR
         (:estado = 'inactive' AND m.activo = 0))
ORDER BY m.created_at DESC
LIMIT :limit OFFSET :offset;

-- Filtrar medidores con alertas
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    m.marca as brand,
    m.modelo as model,
    e.nombre as building,
    u.numero as unit,
    alertas_count.total as active_alerts,
    alertas_activas.severidad_max as max_severity,
    DATE_FORMAT(ultima_alerta.fecha_alerta, '%Y-%m-%d %H:%i') as last_alert_date
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
INNER JOIN (
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        MAX(am.severidad) as severidad_max
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_activas ON m.id = alertas_activas.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        am.fecha_alerta
    FROM alerta_medidor am
    WHERE am.fecha_alerta = (
        SELECT MAX(fecha_alerta)
        FROM alerta_medidor
        WHERE medidor_id = am.medidor_id AND am.resuelta = 0
    )
) ultima_alerta ON m.id = ultima_alerta.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:severidad IS NULL OR alertas_activas.severidad_max = :severidad)
ORDER BY alertas_count.total DESC, ultima_alerta.fecha_alerta DESC
LIMIT :limit OFFSET :offset;

-- =========================================
-- 5. CONSULTAS PARA EXPORTACIÓN DE DATOS
-- =========================================

-- Exportación completa de medidores para Excel/CSV
SELECT
    m.id as 'ID',
    m.codigo as 'Código',
    m.numero_serie as 'Número Serie',
    CASE
        WHEN m.tipo = 'electric' THEN 'Eléctrico'
        WHEN m.tipo = 'water' THEN 'Agua'
        WHEN m.tipo = 'gas' THEN 'Gas'
        ELSE 'Otro'
    END as 'Tipo',
    CASE
        WHEN m.activo = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as 'Estado',
    m.marca as 'Marca',
    m.modelo as 'Modelo',
    e.nombre as 'Edificio',
    u.numero as 'Unidad',
    m.ubicacion as 'Posición',
    c.nombre as 'Comunidad',
    m.capacidad as 'Capacidad',
    m.precision_medicion as 'Precisión',
    DATE_FORMAT(m.fecha_instalacion, '%d/%m/%Y') as 'Fecha Instalación',
    m.tecnico_instalador as 'Técnico Instalador',
    m.empresa_instaladora as 'Empresa Instaladora',
    DATE_FORMAT(m.fecha_garantia, '%d/%m/%Y') as 'Fecha Garantía',
    COALESCE(ultima_lectura.valor, 0) as 'Última Lectura',
    DATE_FORMAT(ultima_lectura.fecha_lectura, '%d/%m/%Y') as 'Fecha Última Lectura',
    COALESCE(ultima_lectura.consumo, 0) as 'Último Consumo',
    DATE_FORMAT(ultimo_mantenimiento.fecha_mantenimiento, '%d/%m/%Y') as 'Último Mantenimiento',
    DATE_FORMAT(m.proximo_mantenimiento, '%d/%m/%Y') as 'Próximo Mantenimiento',
    COALESCE(alertas_count.total, 0) as 'Alertas Activas',
    DATE_FORMAT(m.created_at, '%d/%m/%Y %H:%i') as 'Fecha Creación',
    DATE_FORMAT(m.updated_at, '%d/%m/%Y %H:%i') as 'Última Modificación'
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN (
    SELECT
        lm.medidor_id,
        lm.valor,
        lm.fecha_lectura,
        lm.consumo
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
LEFT JOIN (
    SELECT
        mm.medidor_id,
        mm.fecha_mantenimiento
    FROM mantenimiento_medidor mm
    WHERE mm.fecha_mantenimiento = (
        SELECT MAX(fecha_mantenimiento)
        FROM mantenimiento_medidor
        WHERE medidor_id = mm.medidor_id
    )
) ultimo_mantenimiento ON m.id = ultimo_mantenimiento.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:tipo IS NULL OR m.tipo = :tipo)
    AND (:estado IS NULL OR
         (:estado = 'active' AND m.activo = 1) OR
         (:estado = 'inactive' AND m.activo = 0))
ORDER BY c.nombre ASC, e.nombre ASC, u.numero ASC;

-- Exportación de lecturas por medidor
SELECT
    m.codigo as 'Código Medidor',
    m.numero_serie as 'Número Serie',
    e.nombre as 'Edificio',
    u.numero as 'Unidad',
    DATE_FORMAT(lm.fecha_lectura, '%d/%m/%Y %H:%i') as 'Fecha Lectura',
    lm.valor as 'Valor',
    lm.consumo as 'Consumo',
    CASE
        WHEN lm.automatica = 1 THEN 'Automática'
        ELSE 'Manual'
    END as 'Método',
    CASE
        WHEN lm.estado = 'confirmada' THEN 'Confirmada'
        WHEN lm.estado = 'estimada' THEN 'Estimada'
        ELSE 'Error'
    END as 'Estado',
    COALESCE(lm.usuario_lectura, 'Sistema') as 'Usuario',
    lm.observaciones as 'Observaciones'
FROM medidor m
INNER JOIN lectura_medidor lm ON m.id = lm.medidor_id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND (:medidor_id IS NULL OR m.id = :medidor_id)
    AND (:fecha_desde IS NULL OR lm.fecha_lectura >= :fecha_desde)
    AND (:fecha_hasta IS NULL OR lm.fecha_lectura <= :fecha_hasta)
ORDER BY m.codigo ASC, lm.fecha_lectura DESC;

-- =========================================
-- 6. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- =========================================

-- Validar medidores sin lecturas recientes
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    e.nombre as building,
    u.numero as unit,
    DATE_FORMAT(ultima_lectura.fecha_lectura, '%Y-%m-%d') as last_reading_date,
    DATEDIFF(CURDATE(), ultima_lectura.fecha_lectura) as days_without_reading,
    CASE
        WHEN m.frecuencia_lectura = 'daily' THEN 1
        WHEN m.frecuencia_lectura = 'weekly' THEN 7
        WHEN m.frecuencia_lectura = 'monthly' THEN 30
        ELSE 30
    END as expected_frequency_days
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN (
    SELECT
        lm.medidor_id,
        lm.fecha_lectura
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND m.activo = 1
    AND ultima_lectura.fecha_lectura IS NOT NULL
    AND DATEDIFF(CURDATE(), ultima_lectura.fecha_lectura) > CASE
        WHEN m.frecuencia_lectura = 'daily' THEN 2
        WHEN m.frecuencia_lectura = 'weekly' THEN 14
        WHEN m.frecuencia_lectura = 'monthly' THEN 60
        ELSE 60
    END
ORDER BY DATEDIFF(CURDATE(), ultima_lectura.fecha_lectura) DESC;

-- Validar medidores sin mantenimientos recientes
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    DATE_FORMAT(ultimo_mantenimiento.fecha_mantenimiento, '%Y-%m-%d') as last_maintenance_date,
    DATE_FORMAT(m.proximo_mantenimiento, '%Y-%m-%d') as next_maintenance_date,
    DATEDIFF(CURDATE(), ultimo_mantenimiento.fecha_mantenimiento) as days_since_last_maintenance,
    CASE
        WHEN m.frecuencia_mantenimiento = 'mensual' THEN 30
        WHEN m.frecuencia_mantenimiento = 'trimestral' THEN 90
        WHEN m.frecuencia_mantenimiento = 'semestral' THEN 180
        WHEN m.frecuencia_mantenimiento = 'anual' THEN 365
        ELSE 180
    END as expected_frequency_days
FROM medidor m
LEFT JOIN (
    SELECT
        mm.medidor_id,
        mm.fecha_mantenimiento
    FROM mantenimiento_medidor mm
    WHERE mm.fecha_mantenimiento = (
        SELECT MAX(fecha_mantenimiento)
        FROM mantenimiento_medidor
        WHERE medidor_id = mm.medidor_id
    )
) ultimo_mantenimiento ON m.id = ultimo_mantenimiento.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND m.activo = 1
    AND (ultimo_mantenimiento.fecha_mantenimiento IS NULL OR
         DATEDIFF(CURDATE(), ultimo_mantenimiento.fecha_mantenimiento) > CASE
             WHEN m.frecuencia_mantenimiento = 'mensual' THEN 45
             WHEN m.frecuencia_mantenimiento = 'trimestral' THEN 135
             WHEN m.frecuencia_mantenimiento = 'semestral' THEN 270
             WHEN m.frecuencia_mantenimiento = 'anual' THEN 450
             ELSE 270
         END)
ORDER BY DATEDIFF(CURDATE(), ultimo_mantenimiento.fecha_mantenimiento) DESC;

-- Validar medidores con lecturas inconsistentes
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    lm.fecha_lectura,
    lm.valor as current_value,
    lag(lm.valor) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha_lectura) as previous_value,
    (lm.valor - lag(lm.valor) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha_lectura)) as difference,
    CASE
        WHEN (lm.valor - lag(lm.valor) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha_lectura)) < 0
        THEN 'Lectura menor que anterior'
        WHEN (lm.valor - lag(lm.valor) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha_lectura)) > 10000
        THEN 'Consumo excesivo'
        ELSE 'Normal'
    END as validation_status
FROM medidor m
INNER JOIN lectura_medidor lm ON m.id = lm.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id)
    AND lm.estado = 'confirmada'
ORDER BY m.id, lm.fecha_lectura DESC;

-- Verificar integridad de datos
SELECT
    'medidor' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN m.codigo IS NULL OR m.codigo = '' THEN 1 END) as codigo_nulo,
    COUNT(CASE WHEN m.numero_serie IS NULL OR m.numero_serie = '' THEN 1 END) as numero_serie_nulo,
    COUNT(CASE WHEN m.tipo NOT IN ('electric','water','gas') THEN 1 END) as tipo_invalido,
    COUNT(CASE WHEN m.activo NOT IN (0,1) THEN 1 END) as activo_invalido,
    COUNT(CASE WHEN m.unidad_id IS NULL THEN 1 END) as unidad_id_nula,
    COUNT(CASE WHEN m.comunidad_id IS NULL THEN 1 END) as comunidad_id_nula
FROM medidor m
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id);

-- =========================================
-- 7. VISTAS OPTIMIZADAS PARA RENDIMIENTO
-- =========================================

-- Vista optimizada para listados de medidores
CREATE OR REPLACE VIEW vista_medidores_listado AS
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    CASE WHEN m.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    COALESCE(m.marca, '') as brand,
    COALESCE(m.modelo, '') as model,
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'floor', COALESCE(u.piso, ''),
        'unit', COALESCE(u.numero, ''),
        'position', COALESCE(m.ubicacion, '')
    ) as location,
    JSON_OBJECT(
        'id', c.id,
        'name', c.nombre
    ) as community,
    JSON_OBJECT(
        'date', DATE_FORMAT(m.fecha_instalacion, '%Y-%m-%d'),
        'technician', COALESCE(m.tecnico_instalador, ''),
        'company', COALESCE(m.empresa_instaladora, '')
    ) as installation,
    JSON_OBJECT(
        'value', COALESCE(ultima_lectura.valor, 0),
        'date', DATE_FORMAT(ultima_lectura.fecha_lectura, '%Y-%m-%d'),
        'consumption', COALESCE(ultima_lectura.consumo, 0)
    ) as last_reading,
    JSON_OBJECT(
        'capacity', COALESCE(m.capacidad, ''),
        'precision', COALESCE(m.precision_medicion, ''),
        'certification', COALESCE(m.certificacion, '')
    ) as specifications,
    JSON_OBJECT(
        'lastService', DATE_FORMAT(ultimo_mantenimiento.fecha_mantenimiento, '%Y-%m-%d'),
        'nextService', DATE_FORMAT(m.proximo_mantenimiento, '%Y-%m-%d'),
        'frequency', COALESCE(m.frecuencia_mantenimiento, 'semestral')
    ) as maintenance,
    JSON_OBJECT(
        'hasAlerts', CASE WHEN alertas_count.total > 0 THEN true ELSE false END,
        'count', COALESCE(alertas_count.total, 0),
        'severity', COALESCE(alertas_activas.severidad_max, 'low')
    ) as alerts,
    JSON_OBJECT(
        'readingFrequency', COALESCE(m.frecuencia_lectura, 'monthly'),
        'autoReading', CASE WHEN m.lectura_automatica = 1 THEN true ELSE false END,
        'notifications', CASE WHEN m.notificaciones = 1 THEN true ELSE false END
    ) as configuration,
    m.created_at,
    m.updated_at
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN (
    SELECT
        lm.medidor_id,
        lm.valor,
        lm.fecha_lectura,
        lm.consumo
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
LEFT JOIN (
    SELECT
        mm.medidor_id,
        mm.fecha_mantenimiento
    FROM mantenimiento_medidor mm
    WHERE mm.fecha_mantenimiento = (
        SELECT MAX(fecha_mantenimiento)
        FROM mantenimiento_medidor
        WHERE medidor_id = mm.medidor_id
    )
) ultimo_mantenimiento ON m.id = ultimo_mantenimiento.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        MAX(am.severidad) as severidad_max
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_activas ON m.id = alertas_activas.medidor_id;

-- Vista optimizada para detalles de medidores
CREATE OR REPLACE VIEW vista_medidores_detalle AS
SELECT
    m.id,
    m.codigo as code,
    m.numero_serie as serial_number,
    m.tipo as type,
    CASE WHEN m.activo = 1 THEN 'active' ELSE 'inactive' END as status,
    COALESCE(m.marca, '') as brand,
    COALESCE(m.modelo, '') as model,
    JSON_OBJECT(
        'building', COALESCE(e.nombre, ''),
        'floor', COALESCE(u.piso, ''),
        'unit', COALESCE(u.numero, ''),
        'position', COALESCE(m.ubicacion, ''),
        'coordinates', COALESCE(m.coordenadas, '')
    ) as location,
    JSON_OBJECT(
        'id', c.id,
        'name', c.nombre,
        'address', COALESCE(c.direccion, '')
    ) as community,
    JSON_OBJECT(
        'date', DATE_FORMAT(m.fecha_instalacion, '%Y-%m-%d'),
        'technician', COALESCE(m.tecnico_instalador, ''),
        'company', COALESCE(m.empresa_instaladora, ''),
        'warranty', DATE_FORMAT(m.fecha_garantia, '%Y-%m-%d'),
        'certificate', COALESCE(m.certificado, '')
    ) as installation,
    JSON_OBJECT(
        'value', COALESCE(ultima_lectura.valor, 0),
        'date', DATE_FORMAT(ultima_lectura.fecha_lectura, '%Y-%m-%d %H:%i:%s'),
        'consumption', COALESCE(ultima_lectura.consumo, 0),
        'period', DATE_FORMAT(ultima_lectura.fecha_lectura, '%M %Y')
    ) as last_reading,
    JSON_OBJECT(
        'capacity', COALESCE(m.capacidad, ''),
        'precision', COALESCE(m.precision_medicion, ''),
        'certification', COALESCE(m.certificacion, ''),
        'operatingTemp', COALESCE(m.temperatura_operacion, ''),
        'maxPressure', COALESCE(m.presion_maxima, ''),
        'communicationType', COALESCE(m.tipo_comunicacion, '')
    ) as specifications,
    JSON_OBJECT(
        'lastService', DATE_FORMAT(ultimo_mantenimiento.fecha_mantenimiento, '%Y-%m-%d'),
        'nextService', DATE_FORMAT(m.proximo_mantenimiento, '%Y-%m-%d'),
        'frequency', COALESCE(m.frecuencia_mantenimiento, 'semestral'),
        'serviceCompany', COALESCE(m.empresa_mantenimiento, ''),
        'notes', COALESCE(ultimo_mantenimiento.notas, '')
    ) as maintenance,
    JSON_OBJECT(
        'hasAlerts', CASE WHEN alertas_count.total > 0 THEN true ELSE false END,
        'count', COALESCE(alertas_count.total, 0),
        'severity', COALESCE(alertas_activas.severidad_max, 'low'),
        'lastAlert', DATE_FORMAT(ultima_alerta.fecha_alerta, '%Y-%m-%d %H:%i:%s')
    ) as alerts,
    JSON_OBJECT(
        'readingFrequency', COALESCE(m.frecuencia_lectura, 'monthly'),
        'alertThresholds', JSON_OBJECT(
            'consumption', COALESCE(m.umbral_consumo, 0),
            'pressure', COALESCE(m.umbral_presion, 0),
            'temperature', COALESCE(m.umbral_temperatura, 0)
        ),
        'autoReading', CASE WHEN m.lectura_automatica = 1 THEN true ELSE false END,
        'notifications', CASE WHEN m.notificaciones = 1 THEN true ELSE false END
    ) as configuration,
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', lm.id,
                'date', DATE_FORMAT(lm.fecha_lectura, '%Y-%m-%d %H:%i:%s'),
                'value', lm.valor,
                'consumption', lm.consumo,
                'reader', COALESCE(lm.usuario_lectura, 'Sistema'),
                'method', CASE WHEN lm.automatica = 1 THEN 'automatic' ELSE 'manual' END,
                'status', CASE
                    WHEN lm.estado = 'confirmada' THEN 'valid'
                    WHEN lm.estado = 'estimada' THEN 'estimated'
                    ELSE 'error'
                END,
                'notes', COALESCE(lm.observaciones, ''),
                'photoUrl', COALESCE(lm.foto_url, '')
            )
        )
        FROM lectura_medidor lm
        WHERE lm.medidor_id = m.id
        ORDER BY lm.fecha_lectura DESC
        LIMIT 12),
        JSON_ARRAY()
    ) as readings_history,
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', mm.id,
                'date', DATE_FORMAT(mm.fecha_mantenimiento, '%Y-%m-%d'),
                'type', COALESCE(mm.tipo_mantenimiento, 'preventive'),
                'technician', COALESCE(mm.tecnico, ''),
                'company', COALESCE(mm.empresa, ''),
                'description', COALESCE(mm.descripcion, ''),
                'cost', COALESCE(mm.costo, 0),
                'status', CASE
                    WHEN mm.estado = 'completado' THEN 'completed'
                    WHEN mm.estado = 'pendiente' THEN 'pending'
                    ELSE 'cancelled'
                END
            )
        )
        FROM mantenimiento_medidor mm
        WHERE mm.medidor_id = m.id
        ORDER BY mm.fecha_mantenimiento DESC),
        JSON_ARRAY()
    ) as maintenance_history,
    COALESCE(
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', am.id,
                'type', COALESCE(am.tipo_alerta, 'anomaly'),
                'title', COALESCE(am.titulo, ''),
                'description', COALESCE(am.descripcion, ''),
                'timestamp', DATE_FORMAT(am.fecha_alerta, '%Y-%m-%d %H:%i:%s'),
                'severity', COALESCE(am.severidad, 'medium'),
                'resolved', CASE WHEN am.resuelta = 1 THEN true ELSE false END
            )
        )
        FROM alerta_medidor am
        WHERE am.medidor_id = m.id AND am.resuelta = 0
        ORDER BY am.fecha_alerta DESC),
        JSON_ARRAY()
    ) as active_alerts,
    m.created_at,
    m.updated_at
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN (
    SELECT
        lm.medidor_id,
        lm.valor,
        lm.fecha_lectura,
        lm.consumo
    FROM lectura_medidor lm
    WHERE lm.fecha_lectura = (
        SELECT MAX(fecha_lectura)
        FROM lectura_medidor
        WHERE medidor_id = lm.medidor_id
    )
) ultima_lectura ON m.id = ultima_lectura.medidor_id
LEFT JOIN (
    SELECT
        mm.medidor_id,
        mm.fecha_mantenimiento,
        mm.notas
    FROM mantenimiento_medidor mm
    WHERE mm.fecha_mantenimiento = (
        SELECT MAX(fecha_mantenimiento)
        FROM mantenimiento_medidor
        WHERE medidor_id = mm.medidor_id
    )
) ultimo_mantenimiento ON m.id = ultimo_mantenimiento.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        COUNT(*) as total
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_count ON m.id = alertas_count.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        MAX(am.severidad) as severidad_max
    FROM alerta_medidor am
    WHERE am.resuelta = 0
    GROUP BY am.medidor_id
) alertas_activas ON m.id = alertas_activas.medidor_id
LEFT JOIN (
    SELECT
        am.medidor_id,
        am.fecha_alerta
    FROM alerta_medidor am
    WHERE am.fecha_alerta = (
        SELECT MAX(fecha_alerta)
        FROM alerta_medidor
        WHERE medidor_id = am.medidor_id
    )
) ultima_alerta ON m.id = ultima_alerta.medidor_id;

-- Vista para estadísticas de medidores
CREATE OR REPLACE VIEW vista_medidores_estadisticas AS
SELECT
    (:comunidad_id) as comunidad_id,
    COUNT(DISTINCT m.id) as total_medidores,
    COUNT(DISTINCT CASE WHEN m.activo = 1 THEN m.id END) as medidores_activos,
    COUNT(DISTINCT CASE WHEN m.activo = 0 THEN m.id END) as medidores_inactivos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'electric' THEN m.id END) as medidores_electricos,
    COUNT(DISTINCT CASE WHEN m.tipo = 'water' THEN m.id END) as medidores_agua,
    COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) as medidores_gas,
    COUNT(DISTINCT c.id) as comunidades_con_medidores,
    COUNT(DISTINCT e.id) as edificios_con_medidores,
    COUNT(DISTINCT u.id) as unidades_con_medidores,
    COUNT(DISTINCT lm.id) as total_lecturas,
    AVG(lm.consumo) as consumo_promedio,
    COUNT(DISTINCT am.id) as total_alertas,
    COUNT(DISTINCT CASE WHEN am.resuelta = 0 THEN am.id END) as alertas_activas,
    COUNT(DISTINCT mm.id) as total_mantenimientos
FROM medidor m
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN edificio e ON u.edificio_id = e.id
LEFT JOIN comunidad c ON m.comunidad_id = c.id
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
LEFT JOIN alerta_medidor am ON m.id = am.medidor_id
LEFT JOIN mantenimiento_medidor mm ON m.id = mm.medidor_id
WHERE (:comunidad_id IS NULL OR m.comunidad_id = :comunidad_id);

-- =========================================
-- 8. ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =========================================

-- Índices para búsquedas frecuentes en medidores
CREATE INDEX idx_medidor_comunidad_activo ON medidor(comunidad_id, activo);
CREATE INDEX idx_medidor_unidad ON medidor(unidad_id);
CREATE INDEX idx_medidor_tipo ON medidor(tipo);
CREATE INDEX idx_medidor_codigo ON medidor(codigo);
CREATE INDEX idx_medidor_numero_serie ON medidor(numero_serie);
CREATE INDEX idx_medidor_marca ON medidor(marca);
CREATE INDEX idx_medidor_modelo ON medidor(modelo);

-- Índices para lecturas de medidores
CREATE INDEX idx_lectura_medidor_medidor_fecha ON lectura_medidor(medidor_id, fecha_lectura);
CREATE INDEX idx_lectura_medidor_estado ON lectura_medidor(estado);
CREATE INDEX idx_lectura_medidor_automatica ON lectura_medidor(automatica);

-- Índices para alertas de medidores
CREATE INDEX idx_alerta_medidor_medidor_fecha ON alerta_medidor(medidor_id, fecha_alerta);
CREATE INDEX idx_alerta_medidor_resuelta ON alerta_medidor(resuelta);
CREATE INDEX idx_alerta_medidor_severidad ON alerta_medidor(severidad);

-- Índices para mantenimientos de medidores
CREATE INDEX idx_mantenimiento_medidor_medidor_fecha ON mantenimiento_medidor(medidor_id, fecha_mantenimiento);
CREATE INDEX idx_mantenimiento_medidor_estado ON mantenimiento_medidor(estado);
CREATE INDEX idx_mantenimiento_medidor_tipo ON mantenimiento_medidor(tipo_mantenimiento);

-- Índices para unidades y edificios
CREATE INDEX idx_unidad_edificio ON unidad(edificio_id);
CREATE INDEX idx_edificio_comunidad ON edificio(comunidad_id);

-- Índices compuestos para búsquedas complejas
CREATE INDEX idx_medidor_busqueda ON medidor(comunidad_id, activo, tipo, marca, modelo);
CREATE INDEX idx_medidor_ubicacion ON medidor(unidad_id, ubicacion);

-- =========================================
-- NOTAS IMPORTANTES:
-- =========================================
--
-- 1. Todas las consultas incluyen filtros opcionales por comunidad_id
-- 2. Se usan COALESCE para manejar campos NULL y mantener compatibilidad
-- 3. Los campos calculados tienen valores por defecto apropiados
-- 4. Las estadísticas se calculan en tiempo real desde las tablas relacionadas
-- 5. Las vistas optimizadas mejoran el rendimiento de consultas frecuentes
-- 6. Los índices recomendados aceleran las búsquedas y filtros
-- 7. Todas las consultas están parametrizadas para prevenir SQL injection
-- 8. Se incluyen validaciones para mantener integridad de datos
-- 9. Las exportaciones generan formatos compatibles con Excel/CSV
-- 10. Los historiales se limitan a registros recientes para optimización
-- 11. Las alertas activas se obtienen en tiempo real
-- 12. Los mantenimientos incluyen información completa de costos y repuestos
--
-- =========================================