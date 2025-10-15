-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO AMENIDADES
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de amenidades con filtros
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
    a.reglas,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.created_at,
    a.updated_at,
    -- Calcular reservas activas (simulado - ajustar según tabla real)
    0 as reservas_activas,
    -- Calcular disponibilidad (simulado - ajustar según tabla real)
    CASE WHEN a.capacidad > 0 THEN 'Disponible' ELSE 'No disponible' END as estado_disponibilidad
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
    c.razon_social as comunidad,
    COUNT(a.id) as total_amenidades,
    COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) as requieren_aprobacion,
    COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) as con_tarifa,
    SUM(a.capacidad) as capacidad_total,
    AVG(a.tarifa) as tarifa_promedio
FROM comunidad c
LEFT JOIN amenidad a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Amenidades disponibles (sin reservas activas)
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
    a.capacidad,
    a.tarifa,
    a.reglas
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE a.capacidad > 0
ORDER BY c.razon_social, a.nombre;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una amenidad específica
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
    c.direccion as direccion_comunidad,
    a.reglas,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.created_at,
    a.updated_at,
    -- Información adicional calculada
    CASE
        WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación'
        ELSE 'Reserva directa'
    END as tipo_reserva,
    CASE
        WHEN a.tarifa > 0 THEN CONCAT('Costo: $', FORMAT(a.tarifa, 0))
        ELSE 'Gratuito'
    END as costo,
    -- Estadísticas de uso (simulado - ajustar según tablas reales)
    JSON_OBJECT(
        'reservas_mes_actual', 0,
        'reservas_mes_anterior', 0,
        'ocupacion_promedio', 0,
        'ingresos_mes_actual', 0
    ) as estadisticas_uso
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE a.id = :amenidad_id;

-- 2.2 Vista de amenidades con información completa
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
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
    ) as informacion_completa
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
ORDER BY c.razon_social, a.nombre;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de amenidades
SELECT
    COUNT(*) as total_amenidades,
    COUNT(DISTINCT comunidad_id) as comunidades_con_amenidades,
    SUM(capacidad) as capacidad_total,
    AVG(capacidad) as capacidad_promedio,
    COUNT(CASE WHEN requiere_aprobacion = 1 THEN 1 END) as requieren_aprobacion,
    COUNT(CASE WHEN tarifa > 0 THEN 1 END) as amenidades_con_costo,
    COUNT(CASE WHEN tarifa = 0 THEN 1 END) as amenidades_gratuitas,
    AVG(CASE WHEN tarifa > 0 THEN tarifa END) as tarifa_promedio_costo,
    MIN(tarifa) as tarifa_minima,
    MAX(tarifa) as tarifa_maxima
FROM amenidad;

-- 3.2 Estadísticas por comunidad
SELECT
    c.razon_social as comunidad,
    COUNT(a.id) as num_amenidades,
    SUM(a.capacidad) as capacidad_total,
    AVG(a.tarifa) as tarifa_promedio,
    COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) as requieren_aprobacion,
    COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) as con_costo,
    SUM(CASE WHEN a.tarifa > 0 THEN a.tarifa ELSE 0 END) as ingresos_potenciales
FROM comunidad c
LEFT JOIN amenidad a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 3.3 Estadísticas por tipo de amenidad (basado en nombre)
SELECT
    CASE
        WHEN LOWER(nombre) LIKE '%piscina%' THEN 'Piscina'
        WHEN LOWER(nombre) LIKE '%gimnasio%' OR LOWER(nombre) LIKE '%gym%' THEN 'Gimnasio'
        WHEN LOWER(nombre) LIKE '%quincho%' OR LOWER(nombre) LIKE '%parrilla%' THEN 'Quincho'
        WHEN LOWER(nombre) LIKE '%salón%' OR LOWER(nombre) LIKE '%sala%' THEN 'Salón'
        WHEN LOWER(nombre) LIKE '%terraza%' THEN 'Terraza'
        WHEN LOWER(nombre) LIKE '%lavandería%' THEN 'Lavandería'
        ELSE 'Otros'
    END as tipo_amenidad,
    COUNT(*) as cantidad,
    AVG(capacidad) as capacidad_promedio,
    AVG(tarifa) as tarifa_promedio,
    COUNT(CASE WHEN requiere_aprobacion = 1 THEN 1 END) as requieren_aprobacion
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

-- 4.1 Búsqueda avanzada de amenidades
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.reglas,
    -- Información adicional para filtros
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Directa' END as tipo_reserva,
    CASE WHEN a.tarifa > 0 THEN 'Con costo' ELSE 'Gratuito' END as tipo_costo
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

-- 4.2 Amenidades por rango de capacidad
SELECT
    CASE
        WHEN capacidad <= 5 THEN 'Pequeña (1-5 personas)'
        WHEN capacidad <= 15 THEN 'Mediana (6-15 personas)'
        WHEN capacidad <= 30 THEN 'Grande (16-30 personas)'
        ELSE 'Muy grande (31+ personas)'
    END as rango_capacidad,
    COUNT(*) as cantidad_amenidades,
    AVG(tarifa) as tarifa_promedio,
    MIN(capacidad) as capacidad_minima,
    MAX(capacidad) as capacidad_maxima
FROM amenidad
GROUP BY
    CASE
        WHEN capacidad <= 5 THEN 'Pequeña (1-5 personas)'
        WHEN capacidad <= 15 THEN 'Mediana (6-15 personas)'
        WHEN capacidad <= 30 THEN 'Grande (16-30 personas)'
        ELSE 'Muy grande (31+ personas)'
    END
ORDER BY capacidad_minima;

-- 4.3 Amenidades por rango de tarifa
SELECT
    CASE
        WHEN tarifa = 0 THEN 'Gratuito'
        WHEN tarifa <= 5000 THEN 'Económico (hasta $5.000)'
        WHEN tarifa <= 15000 THEN 'Medio ($5.001-$15.000)'
        WHEN tarifa <= 30000 THEN 'Caro ($15.001-$30.000)'
        ELSE 'Muy caro (más de $30.000)'
    END as rango_tarifa,
    COUNT(*) as cantidad_amenidades,
    AVG(capacidad) as capacidad_promedio,
    MIN(tarifa) as tarifa_minima,
    MAX(tarifa) as tarifa_maxima
FROM amenidad
GROUP BY
    CASE
        WHEN tarifa = 0 THEN 'Gratuito'
        WHEN tarifa <= 5000 THEN 'Económico (hasta $5.000)'
        WHEN tarifa <= 15000 THEN 'Medio ($5.001-$15.000)'
        WHEN tarifa <= 30000 THEN 'Caro ($15.001-$30.000)'
        ELSE 'Muy caro (más de $30.000)'
    END
ORDER BY tarifa_minima;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de amenidades para Excel/CSV
SELECT
    a.id as 'ID',
    a.nombre as 'Nombre Amenidad',
    c.razon_social as 'Comunidad',
    c.direccion as 'Dirección Comunidad',
    a.capacidad as 'Capacidad',
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Sí' ELSE 'No' END as 'Requiere Aprobación',
    a.tarifa as 'Tarifa',
    a.reglas as 'Reglas',
    DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as 'Fecha Creación',
    DATE_FORMAT(a.updated_at, '%Y-%m-%d %H:%i:%s') as 'Última Actualización'
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
ORDER BY c.razon_social, a.nombre;

-- 5.2 Exportación de amenidades con estadísticas
SELECT
    c.razon_social as 'Comunidad',
    a.nombre as 'Amenidad',
    a.capacidad as 'Capacidad',
    a.tarifa as 'Tarifa',
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Reserva directa' END as 'Tipo Reserva',
    '0' as 'Reservas Activas', -- Simulado
    '0' as 'Reservas Mes Actual', -- Simulado
    '0' as 'Ingresos Mes Actual' -- Simulado
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
ORDER BY c.razon_social, a.nombre;

-- 5.3 Exportación de reglas de amenidades
SELECT
    a.nombre as 'Amenidad',
    c.razon_social as 'Comunidad',
    a.reglas as 'Reglas de Uso',
    a.capacidad as 'Capacidad Máxima',
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación previa' ELSE 'Reserva directa disponible' END as 'Tipo de Reserva'
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
WHERE a.reglas IS NOT NULL AND a.reglas != ''
ORDER BY c.razon_social, a.nombre;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de amenidades
SELECT
    'Amenidades sin comunidad' as validacion,
    COUNT(*) as cantidad
FROM amenidad a
LEFT JOIN comunidad c ON a.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Amenidades con capacidad cero o negativa' as validacion,
    COUNT(*) as cantidad
FROM amenidad
WHERE capacidad <= 0
UNION ALL
SELECT
    'Amenidades con tarifa negativa' as validacion,
    COUNT(*) as cantidad
FROM amenidad
WHERE tarifa < 0
UNION ALL
SELECT
    'Amenidades sin nombre' as validacion,
    COUNT(*) as cantidad
FROM amenidad
WHERE nombre IS NULL OR nombre = ''
UNION ALL
SELECT
    'Comunidades sin amenidades' as validacion,
    COUNT(*) as cantidad
FROM comunidad c
WHERE NOT EXISTS (SELECT 1 FROM amenidad a WHERE a.comunidad_id = c.id);

-- 6.2 Validar nombres duplicados en misma comunidad
SELECT
    c.razon_social as comunidad,
    a.nombre,
    COUNT(*) as cantidad_duplicados
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id
GROUP BY c.id, c.razon_social, a.nombre
HAVING COUNT(*) > 1
ORDER BY c.razon_social, a.nombre;

-- 6.3 Validar rangos de capacidad y tarifa razonables
SELECT
    'Capacidades extremas' as validacion,
    COUNT(*) as cantidad_anomalias,
    GROUP_CONCAT(CONCAT(a.nombre, ' (', a.capacidad, ')') SEPARATOR '; ') as detalles
FROM amenidad a
WHERE a.capacidad < 1 OR a.capacidad > 200
UNION ALL
SELECT
    'Tarifas potencialmente erróneas' as validacion,
    COUNT(*) as cantidad_anomalias,
    GROUP_CONCAT(CONCAT(a.nombre, ' ($', FORMAT(a.tarifa, 0), ')') SEPARATOR '; ') as detalles
FROM amenidad a
WHERE a.tarifa > 100000 OR (a.tarifa > 0 AND a.tarifa < 100);

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de amenidades
CREATE OR REPLACE VIEW vista_amenidades_listado AS
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    CASE WHEN a.tarifa > 0 THEN 'Con costo' ELSE 'Gratuito' END as tipo_costo,
    CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Directa' END as tipo_reserva
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id;

-- 7.2 Vista para estadísticas de amenidades por comunidad
CREATE OR REPLACE VIEW vista_amenidades_estadisticas AS
SELECT
    c.razon_social as comunidad,
    COUNT(a.id) as total_amenidades,
    SUM(a.capacidad) as capacidad_total,
    AVG(a.tarifa) as tarifa_promedio,
    COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) as requieren_aprobacion,
    COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) as con_costo,
    MAX(a.updated_at) as ultima_actualizacion
FROM comunidad c
LEFT JOIN amenidad a ON c.id = a.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para búsqueda y filtros de amenidades
CREATE OR REPLACE VIEW vista_amenidades_busqueda AS
SELECT
    a.id,
    a.nombre,
    c.razon_social as comunidad,
    c.direccion as direccion_comunidad,
    a.capacidad,
    a.requiere_aprobacion,
    a.tarifa,
    a.reglas,
    a.created_at,
    a.updated_at,
    -- Categorización automática por tipo
    CASE
        WHEN LOWER(a.nombre) LIKE '%piscina%' THEN 'piscina'
        WHEN LOWER(a.nombre) LIKE '%gimnasio%' OR LOWER(a.nombre) LIKE '%gym%' THEN 'gimnasio'
        WHEN LOWER(a.nombre) LIKE '%quincho%' OR LOWER(a.nombre) LIKE '%parrilla%' THEN 'quincho'
        WHEN LOWER(a.nombre) LIKE '%salón%' OR LOWER(a.nombre) LIKE '%sala%' THEN 'salon'
        WHEN LOWER(a.nombre) LIKE '%terraza%' THEN 'terraza'
        WHEN LOWER(a.nombre) LIKE '%lavandería%' THEN 'lavanderia'
        ELSE 'otros'
    END as tipo_categoria
FROM amenidad a
JOIN comunidad c ON a.comunidad_id = c.id;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
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