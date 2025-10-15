-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO AMENIDADES
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-14 (Corregido)
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de amenidades con filtros
-- CORRECCIÓN: Cálculo real de reservas activas y disponibilidad.
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    a.reglas,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.created_at,
    a.updated_at,
    -- 🔄 CALCULO REAL DE RESERVAS ACTIVAS (solicitadas o aprobadas)
    (
        SELECT COUNT(r.id)
        FROM reserva_amenidad r
        WHERE r.amenidad_id = a.id
          AND r.estado IN ('solicitada', 'aprobada')
          -- Se asume activa si está en estado de gestión o en el futuro.
    ) AS reservas_activas,
    -- 🔄 CALCULO REAL DE ESTADO DE DISPONIBILIDAD (asumiendo disponibilidad total si capacidad > 0 y reservas < capacidad)
    CASE
        WHEN a.capacidad > 0 AND (
            SELECT COUNT(r.id)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id AND r.estado IN ('solicitada', 'aprobada', 'cumplida') -- Se podría filtrar por hora/fecha actual
        ) < a.capacidad THEN 'Disponible (Libre)'
        WHEN a.capacidad = 0 THEN 'No aplica capacidad'
        ELSE 'Potencialmente Ocupada'
    END AS estado_disponibilidad
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE
    (:comunidad_id IS NULL OR a.comunidad_id = :comunidad_id) AND
    (:requiere_aprobacion IS NULL OR a.requiere_aprobacion = :requiere_aprobacion) AND
    (:capacidad_min IS NULL OR a.capacidad >= :capacidad_min) AND
    (:capacidad_max IS NULL OR a.capacidad <= :capacidad_max) AND
    (:tarifa_min IS NULL OR a.tarifa >= :tarifa_min) AND
    (:tarifa_max IS NULL OR a.tarifa <= :tarifa_max)
ORDER BY c.razon_social, a.nombre ASC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de amenidades por comunidad
SELECT
    c.razon_social AS comunidad,
    COUNT(a.id) AS total_amenidades,
    COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
    COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) AS con_tarifa,
    SUM(a.capacidad) AS capacidad_total,
    AVG(a.tarifa) AS tarifa_promedio
FROM comunidad c
LEFT JOIN amenidad a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Amenidades disponibles (sin reservas activas)
-- CORRECCIÓN: Utiliza NOT EXISTS para verificar reservas activas, asumiendo una disponibilidad actual (NOW()).
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    a.capacidad,
    a.tarifa,
    a.reglas
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE
    a.capacidad > 0 AND
    -- Filtra las amenidades que NO tienen una reserva activa en este momento (NOW())
    NOT EXISTS (
        SELECT 1
        FROM reserva_amenidad r
        WHERE r.amenidad_id = a.id
          AND r.estado IN ('solicitada', 'aprobada')
          AND r.inicio <= NOW()
          AND r.fin >= NOW()
    )
ORDER BY c.razon_social, a.nombre;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una amenidad específica
-- CORRECCIÓN: Cálculo real de estadísticas de uso.
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    c.direccion AS direccion_comunidad,
    a.reglas,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.created_at,
    a.updated_at,
    CASE
        WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación'
        ELSE 'Reserva directa'
    END AS tipo_reserva,
    CASE
        WHEN a.tarifa > 0 THEN CONCAT('Costo: $', FORMAT(a.tarifa, 0))
        ELSE 'Gratuito'
    END AS costo,
    -- 🔄 ESTADÍSTICAS DE USO REALES
    JSON_OBJECT(
        'reservas_mes_actual', (
            SELECT COUNT(r.id)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id
              AND YEAR(r.inicio) = YEAR(NOW()) AND MONTH(r.inicio) = MONTH(NOW())
        ),
        'reservas_mes_anterior', (
            SELECT COUNT(r.id)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id
              AND YEAR(r.inicio) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND MONTH(r.inicio) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        ),
        'ingresos_mes_actual', (
            SELECT SUM(a_sub.tarifa)
            FROM reserva_amenidad r_sub
            JOIN amenidad a_sub ON r_sub.amenidad_id = a_sub.id
            WHERE r_sub.amenidad_id = a.id
              AND YEAR(r_sub.created_at) = YEAR(NOW()) AND MONTH(r_sub.created_at) = MONTH(NOW())
              AND r_sub.estado IN ('aprobada', 'cumplida')
        )
    ) AS estadisticas_uso
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE a.id = :amenidad_id;

-- 2.2 Vista de amenidades con información completa (Sin cambios estructurales, ya es correcta)
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    a.reglas,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    JSON_OBJECT(
        'comunidad_info', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social,
            'direccion', c.direccion,
            'email', c.email_contacto,
            'telefono', c.telefono_contacto
        ),
        'configuracion', JSON_OBJECT(
            'requiere_aprobacion', a.requiere_aprobacion,
            'capacidad', a.capacidad,
            'tarifa', a.tarifa,
            'reglas', a.reglas
        ),
        'fechas', JSON_OBJECT(
            'creado', a.created_at,
            'actualizado', a.updated_at
        )
    ) AS informacion_completa
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
ORDER BY c.razon_social, a.nombre;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de amenidades (Sin cambios estructurales, ya es correcta)
SELECT
    COUNT(*) AS total_amenidades,
    COUNT(DISTINCT comunidad_id) AS comunidades_con_amenidades,
    SUM(capacidad) AS capacidad_total,
    AVG(capacidad) AS capacidad_promedio,
    COUNT(CASE WHEN requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
    COUNT(CASE WHEN tarifa > 0 THEN 1 END) AS amenidades_con_costo,
    COUNT(CASE WHEN tarifa = 0 THEN 1 END) AS amenidades_gratuitas,
    AVG(CASE WHEN tarifa > 0 THEN tarifa END) AS tarifa_promedio_costo,
    MIN(tarifa) AS tarifa_minima,
    MAX(tarifa) AS tarifa_maxima
FROM amenidad;

-- 3.2 Estadísticas por comunidad (Sin cambios estructurales, ya es correcta)
SELECT
    c.razon_social AS comunidad,
    COUNT(a.id) AS num_amenidades,
    SUM(a.capacidad) AS capacidad_total,
    AVG(a.tarifa) AS tarifa_promedio,
    COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
    COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) AS con_costo,
    SUM(CASE WHEN a.tarifa > 0 THEN a.tarifa ELSE 0 END) AS ingresos_potenciales
FROM comunidad c
LEFT JOIN amenidad a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 3.3 Estadísticas por tipo de amenidad (basado en nombre) (Sin cambios estructurales, ya es correcta)
SELECT
    CASE
        WHEN LOWER(nombre) LIKE '%piscina%' THEN 'Piscina'
        WHEN LOWER(nombre) LIKE '%gimnasio%' OR LOWER(nombre) LIKE '%gym%' THEN 'Gimnasio'
        WHEN LOWER(nombre) LIKE '%quincho%' OR LOWER(nombre) LIKE '%parrilla%' THEN 'Quincho'
        WHEN LOWER(nombre) LIKE '%salón%' OR LOWER(nombre) LIKE '%sala%' THEN 'Salón'
        WHEN LOWER(nombre) LIKE '%terraza%' THEN 'Terraza'
        WHEN LOWER(nombre) LIKE '%lavandería%' THEN 'Lavandería'
        ELSE 'Otros'
    END AS tipo_amenidad,
    COUNT(*) AS cantidad,
    AVG(capacidad) AS capacidad_promedio,
    AVG(tarifa) AS tarifa_promedio,
    COUNT(CASE WHEN requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion
FROM amenidad
GROUP BY
    CASE
        WHEN LOWER(nombre) LIKE '%piscina%' THEN 'Piscina'
        WHEN LOWER(nombre) LIKE '%gimnasio%' OR LOWER(nombre) LIKE '%gym%' THEN 'Gimnasio'
        WHEN LOWER(nombre) LIKE '%quincho%' OR LOWER(nombre) LIKE '%parrilla%' THEN 'Quincho'
        WHEN LOWER(nombre) LIKE '%salón%' OR LOWER(nombre) LIKE '%sala%' THEN 'Salón'
        WHEN LOWER(nombre) LIKE '%terraza%' THEN 'Terraza'
        WHEN LOWER(nombre) LIKE '%lavandería%' THEN 'Lavandería'
        ELSE 'Otros'
    END
ORDER BY cantidad DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de amenidades (Sin cambios estructurales, ya es correcta)
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.reglas,
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Directa' END AS tipo_reserva,
    CASE WHEN a.tarifa > 0 THEN 'Con costo' ELSE 'Gratuito' END AS tipo_costo
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE
    (:busqueda IS NULL OR a.nombre LIKE CONCAT('%', :busqueda, '%') OR a.reglas LIKE CONCAT('%', :busqueda, '%')) AND
    (:comunidad_id IS NULL OR a.comunidad_id = :comunidad_id) AND
    (:requiere_aprobacion IS NULL OR a.requiere_aprobacion = :requiere_aprobacion) AND
    (:capacidad_min IS NULL OR a.capacidad >= :capacidad_min) AND
    (:tarifa_min IS NULL OR a.tarifa >= :tarifa_min) AND
    (:tarifa_max IS NULL OR a.tarifa <= :tarifa_max) AND
    (:tipo_amenidad IS NULL OR (
        (:tipo_amenidad = 'piscina' AND LOWER(a.nombre) LIKE '%piscina%') OR
        (:tipo_amenidad = 'gimnasio' AND (LOWER(a.nombre) LIKE '%gimnasio%' OR LOWER(a.nombre) LIKE '%gym%')) OR
        (:tipo_amenidad = 'quincho' AND (LOWER(a.nombre) LIKE '%quincho%' OR LOWER(a.nombre) LIKE '%parrilla%')) OR
        (:tipo_amenidad = 'salon' AND (LOWER(a.nombre) LIKE '%salón%' OR LOWER(a.nombre) LIKE '%sala%')) OR
        (:tipo_amenidad = 'terraza' AND LOWER(a.nombre) LIKE '%terraza%') OR
        (:tipo_amenidad = 'lavanderia' AND LOWER(a.nombre) LIKE '%lavandería%')
    ))
ORDER BY c.razon_social, a.nombre ASC
LIMIT :limit OFFSET :offset;

-- 4.2 Amenidades por rango de capacidad (Sin cambios estructurales, ya es correcta)
SELECT
    CASE
        WHEN capacidad <= 5 THEN 'Pequeña (1-5 personas)'
        WHEN capacidad <= 15 THEN 'Mediana (6-15 personas)'
        WHEN capacidad <= 30 THEN 'Grande (16-30 personas)'
        ELSE 'Muy grande (31+ personas)'
    END AS rango_capacidad,
    COUNT(*) AS cantidad_amenidades,
    AVG(tarifa) AS tarifa_promedio,
    MIN(capacidad) AS capacidad_minima,
    MAX(capacidad) AS capacidad_maxima
FROM amenidad
GROUP BY 1
ORDER BY capacidad_minima;

-- 4.3 Amenidades por rango de tarifa (Sin cambios estructurales, ya es correcta)
SELECT
    CASE
        WHEN tarifa = 0 THEN 'Gratuito'
        WHEN tarifa <= 5000 THEN 'Económico (hasta $5.000)'
        WHEN tarifa <= 15000 THEN 'Medio ($5.001-$15.000)'
        WHEN tarifa <= 30000 THEN 'Caro ($15.001-$30.000)'
        ELSE 'Muy caro (más de $30.000)'
    END AS rango_tarifa,
    COUNT(*) AS cantidad_amenidades,
    AVG(capacidad) AS capacidad_promedio,
    MIN(tarifa) AS tarifa_minima,
    MAX(tarifa) AS tarifa_maxima
FROM amenidad
GROUP BY 1
ORDER BY tarifa_minima;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de amenidades para Excel/CSV (Sin cambios estructurales, ya es correcta)
SELECT
    a.id AS 'ID',
    a.nombre AS 'Nombre Amenidad',
    c.razon_social AS 'Comunidad',
    c.direccion AS 'Dirección Comunidad',
    a.capacidad AS 'Capacidad',
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Sí' ELSE 'No' END AS 'Requiere Aprobación',
    a.tarifa AS 'Tarifa',
    a.reglas AS 'Reglas',
    DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(a.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización'
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
ORDER BY c.razon_social, a.nombre;

-- 5.2 Exportación de amenidades con estadísticas
-- CORRECCIÓN: Uso de datos reales de reservas e ingresos.
SELECT
    c.razon_social AS 'Comunidad',
    a.nombre AS 'Amenidad',
    a.capacidad AS 'Capacidad',
    a.tarifa AS 'Tarifa',
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Reserva directa' END AS 'Tipo Reserva',
    -- 🔄 RESERVAS ACTIVAS
    (
        SELECT COUNT(r.id)
        FROM reserva_amenidad r
        WHERE r.amenidad_id = a.id
          AND r.estado IN ('solicitada', 'aprobada')
          AND r.inicio <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH) -- Próximo mes
          AND r.fin >= CURDATE()
    ) AS 'Reservas Activas',
    -- 🔄 RESERVAS MES ACTUAL
    (
        SELECT COUNT(r.id)
        FROM reserva_amenidad r
        WHERE r.amenidad_id = a.id
          AND YEAR(r.inicio) = YEAR(NOW()) AND MONTH(r.inicio) = MONTH(NOW())
    ) AS 'Reservas Mes Actual',
    -- 🔄 INGRESOS MES ACTUAL
    (
        SELECT SUM(a.tarifa)
        FROM reserva_amenidad r
        WHERE r.amenidad_id = a.id
          AND YEAR(r.created_at) = YEAR(NOW()) AND MONTH(r.created_at) = MONTH(NOW())
          AND r.estado IN ('aprobada', 'cumplida')
    ) AS 'Ingresos Mes Actual'
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
ORDER BY c.razon_social, a.nombre;

-- 5.3 Exportación de reglas de amenidades (Sin cambios estructurales, ya es correcta)
SELECT
    a.nombre AS 'Amenidad',
    c.razon_social AS 'Comunidad',
    a.reglas AS 'Reglas de Uso',
    a.capacidad AS 'Capacidad Máxima',
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación previa' ELSE 'Reserva directa disponible' END AS 'Tipo de Reserva'
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE a.reglas IS NOT NULL AND a.reglas != ''
ORDER BY c.razon_social, a.nombre;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de amenidades (Sin cambios estructurales, ya es correcta)
SELECT
    'Amenidades sin comunidad' AS validacion,
    COUNT(*) AS cantidad
FROM amenidad a
LEFT JOIN comunidad c ON a.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Amenidades con capacidad cero o negativa' AS validacion,
    COUNT(*) AS cantidad
FROM amenidad
WHERE capacidad <= 0
UNION ALL
SELECT
    'Amenidades con tarifa negativa' AS validacion,
    COUNT(*) AS cantidad
FROM amenidad
WHERE tarifa < 0
UNION ALL
SELECT
    'Amenidades sin nombre' AS validacion,
    COUNT(*) AS cantidad
FROM amenidad
WHERE nombre IS NULL OR nombre = ''
UNION ALL
SELECT
    'Comunidades sin amenidades' AS validacion,
    COUNT(*) AS cantidad
FROM comunidad c
WHERE NOT EXISTS (SELECT 1 FROM amenidad a WHERE a.comunidad_id = c.id);

-- 6.2 Validar nombres duplicados en misma comunidad (Sin cambios estructurales, ya es correcta)
SELECT
    c.razon_social AS comunidad,
    a.nombre,
    COUNT(*) AS cantidad_duplicados
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
GROUP BY c.id, c.razon_social, a.nombre
HAVING COUNT(*) > 1
ORDER BY c.razon_social, a.nombre;

-- 6.3 Validar rangos de capacidad y tarifa razonables (Sin cambios estructurales, ya es correcta)
SELECT
    'Capacidades extremas' AS validacion,
    COUNT(*) AS cantidad_anomalias,
    GROUP_CONCAT(CONCAT(a.nombre, ' (', a.capacidad, ')') SEPARATOR '; ') AS detalles
FROM amenidad a
WHERE a.capacidad < 1 OR a.capacidad > 200
UNION ALL
SELECT
    'Tarifas potencialmente erróneas' AS validacion,
    COUNT(*) AS cantidad_anomalias,
    GROUP_CONCAT(CONCAT(a.nombre, ' ($', FORMAT(a.tarifa, 0), ')') SEPARATOR '; ') AS detalles
FROM amenidad a
WHERE a.tarifa > 100000 OR (a.tarifa > 0 AND a.tarifa < 100);

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de amenidades (Sin cambios estructurales, ya es correcta)
CREATE OR REPLACE VIEW vista_amenidades_listado AS
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    CASE WHEN a.tarifa > 0 THEN 'Con costo' ELSE 'Gratuito' END AS tipo_costo,
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Directa' END AS tipo_reserva
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id;

-- 7.2 Vista para estadísticas de amenidades por comunidad (Sin cambios estructurales, ya es correcta)
CREATE OR REPLACE VIEW vista_amenidades_estadisticas AS
SELECT
    c.razon_social AS comunidad,
    COUNT(a.id) AS total_amenidades,
    SUM(a.capacidad) AS capacidad_total,
    AVG(a.tarifa) AS tarifa_promedio,
    COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
    COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) AS con_costo,
    MAX(a.updated_at) AS ultima_actualizacion
FROM comunidad c
LEFT JOIN amenidad a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para búsqueda y filtros de amenidades (Sin cambios estructurales, ya es correcta)
CREATE OR REPLACE VIEW vista_amenidades_busqueda AS
SELECT
    a.id,
    a.nombre,
    c.razon_social AS comunidad,
    c.direccion AS direccion_comunidad,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.reglas,
    a.created_at,
    a.updated_at,
    CASE
        WHEN LOWER(a.nombre) LIKE '%piscina%' THEN 'piscina'
        WHEN LOWER(a.nombre) LIKE '%gimnasio%' OR LOWER(a.nombre) LIKE '%gym%' THEN 'gimnasio'
        WHEN LOWER(a.nombre) LIKE '%quincho%' OR LOWER(a.nombre) LIKE '%parrilla%' THEN 'quincho'
        WHEN LOWER(a.nombre) LIKE '%salón%' OR LOWER(a.nombre) LIKE '%sala%' THEN 'salon'
        WHEN LOWER(a.nombre) LIKE '%terraza%' THEN 'terraza'
        WHEN LOWER(a.nombre) LIKE '%lavandería%' THEN 'lavanderia'
        ELSE 'otros'
    END AS tipo_categoria
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS (Se mantienen las recomendaciones)
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_amenidad_comunidad_id ON amenidad(comunidad_id);
CREATE INDEX idx_amenidad_requiere_aprobacion ON amenidad(requiere_aprobacion);
CREATE INDEX idx_amenidad_capacidad ON amenidad(capacidad);
CREATE INDEX idx_amenidad_tarifa ON amenidad(tarifa);
CREATE INDEX idx_amenidad_created_at ON amenidad(created_at DESC);

-- Índices para búsquedas por nombre y comunidad
CREATE INDEX idx_amenidad_nombre ON amenidad(nombre);
CREATE INDEX idx_amenidad_comunidad_nombre ON amenidad(comunidad_id, nombre);

-- Índice compuesto para filtros avanzados
CREATE INDEX idx_amenidad_filtros ON amenidad(comunidad_id, requiere_aprobacion, capacidad, tarifa);

-- Índice para validaciones
CREATE INDEX idx_amenidad_validaciones ON amenidad(comunidad_id, nombre, capacidad, tarifa);