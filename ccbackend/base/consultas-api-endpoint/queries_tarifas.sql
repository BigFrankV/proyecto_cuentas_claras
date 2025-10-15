-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO TARIFAS
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de tarifas con filtros
SELECT
    t.id,
    t.nombre,
    t.tipo,
    s.nombre as servicio,
    t.estado,
    t.precio_base,
    t.unidad,
    t.fecha_vigencia,
    t.created_at,
    t.updated_at,
    -- Contar tramos si es por tramos
    CASE
        WHEN t.tipo = 'Por Tramos' THEN (
            SELECT COUNT(*) FROM tarifa_tramo tt WHERE tt.tarifa_id = t.id
        )
        ELSE NULL
    END as num_tramos,
    -- Contar estaciones si es estacional
    CASE
        WHEN t.tipo = 'Estacional' THEN (
            SELECT COUNT(*) FROM tarifa_estacional te WHERE te.tarifa_id = t.id
        )
        ELSE NULL
    END as num_estaciones
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
WHERE
    (:estado IS NULL OR t.estado = :estado) AND
    (:servicio IS NULL OR s.nombre = :servicio) AND
    (:tipo IS NULL OR t.tipo = :tipo) AND
    (:fecha_desde IS NULL OR t.fecha_vigencia >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR t.fecha_vigencia <= :fecha_hasta)
ORDER BY t.fecha_vigencia DESC, t.nombre ASC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de tarifas activas por servicio
SELECT
    s.nombre as servicio,
    COUNT(*) as total_tarifas,
    COUNT(CASE WHEN t.estado = 'Activa' THEN 1 END) as activas,
    COUNT(CASE WHEN t.estado = 'Pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN t.estado = 'Inactiva' THEN 1 END) as inactivas
FROM servicio s
LEFT JOIN tarifa t ON s.id = t.servicio_id
GROUP BY s.id, s.nombre
ORDER BY s.nombre;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una tarifa específica
SELECT
    t.id,
    t.nombre,
    t.tipo,
    s.nombre as servicio,
    s.tipo as tipo_servicio,
    t.estado,
    t.precio_base,
    t.unidad,
    t.fecha_vigencia,
    t.estructura_json,
    t.created_at,
    t.updated_at,
    -- Tramos si aplica
    CASE
        WHEN t.tipo = 'Por Tramos' THEN (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'min', tt.min_consumo,
                    'max', tt.max_consumo,
                    'precio', tt.precio
                )
            )
            FROM tarifa_tramo tt
            WHERE tt.tarifa_id = t.id
            ORDER BY tt.min_consumo
        )
        ELSE NULL
    END as tramos,
    -- Estaciones si aplica
    CASE
        WHEN t.tipo = 'Estacional' THEN (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'estacion', te.estacion,
                    'precio', te.precio
                )
            )
            FROM tarifa_estacional te
            WHERE te.tarifa_id = t.id
            ORDER BY te.estacion
        )
        ELSE NULL
    END as estaciones
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
WHERE t.id = :tarifa_id;

-- 2.2 Vista de tarifas con estructura completa
SELECT
    t.id,
    t.nombre,
    t.tipo,
    s.nombre as servicio,
    t.estado,
    t.fecha_vigencia,
    JSON_OBJECT(
        'tipo', t.tipo,
        'precio_base', t.precio_base,
        'unidad', t.unidad,
        'tramos', CASE
            WHEN t.tipo = 'Por Tramos' THEN (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'min', tt.min_consumo,
                        'max', tt.max_consumo,
                        'precio', tt.precio
                    )
                )
                FROM tarifa_tramo tt
                WHERE tt.tarifa_id = t.id
                ORDER BY tt.min_consumo
            )
            ELSE NULL
        END,
        'estaciones', CASE
            WHEN t.tipo = 'Estacional' THEN (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'estacion', te.estacion,
                        'precio', te.precio
                    )
                )
                FROM tarifa_estacional te
                WHERE te.tarifa_id = t.id
                ORDER BY te.estacion
            )
            ELSE NULL
        END
    ) as estructura_completa
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
WHERE t.estado = 'Activa'
ORDER BY s.nombre, t.fecha_vigencia DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de tarifas
SELECT
    COUNT(*) as total_tarifas,
    COUNT(CASE WHEN estado = 'Activa' THEN 1 END) as tarifas_activas,
    COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as tarifas_pendientes,
    COUNT(CASE WHEN estado = 'Inactiva' THEN 1 END) as tarifas_inactivas,
    COUNT(DISTINCT servicio_id) as servicios_cubiertos,
    AVG(CASE WHEN tipo = 'Fija' THEN precio_base END) as precio_promedio_fijo,
    COUNT(CASE WHEN tipo = 'Por Tramos' THEN 1 END) as tarifas_por_tramos,
    COUNT(CASE WHEN tipo = 'Estacional' THEN 1 END) as tarifas_estacionales,
    MIN(fecha_vigencia) as fecha_mas_antigua,
    MAX(fecha_vigencia) as fecha_mas_reciente
FROM tarifa;

-- 3.2 Estadísticas por servicio
SELECT
    s.nombre as servicio,
    COUNT(t.id) as total_tarifas,
    COUNT(CASE WHEN t.estado = 'Activa' THEN 1 END) as activas,
    AVG(CASE WHEN t.tipo = 'Fija' THEN t.precio_base END) as precio_promedio_fijo,
    COUNT(CASE WHEN t.tipo = 'Por Tramos' THEN 1 END) as por_tramos,
    COUNT(CASE WHEN t.tipo = 'Estacional' THEN 1 END) as estacionales,
    MAX(t.fecha_vigencia) as ultima_actualizacion
FROM servicio s
LEFT JOIN tarifa t ON s.id = t.servicio_id
GROUP BY s.id, s.nombre
ORDER BY s.nombre;

-- 3.3 Estadísticas de tramos y estaciones
SELECT
    'tramos' as tipo,
    COUNT(*) as total,
    AVG(precio) as precio_promedio,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo,
    AVG(max_consumo - min_consumo) as rango_promedio
FROM tarifa_tramo
UNION ALL
SELECT
    'estaciones' as tipo,
    COUNT(*) as total,
    AVG(precio) as precio_promedio,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo,
    NULL as rango_promedio
FROM tarifa_estacional;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de tarifas
SELECT
    t.id,
    t.nombre,
    t.tipo,
    s.nombre as servicio,
    t.estado,
    t.precio_base,
    t.unidad,
    t.fecha_vigencia,
    -- Información adicional de estructura
    CASE
        WHEN t.tipo = 'Por Tramos' THEN CONCAT('Tramos: ', (
            SELECT COUNT(*) FROM tarifa_tramo tt WHERE tt.tarifa_id = t.id
        ))
        WHEN t.tipo = 'Estacional' THEN CONCAT('Estaciones: ', (
            SELECT COUNT(*) FROM tarifa_estacional te WHERE te.tarifa_id = t.id
        ))
        ELSE CONCAT('Precio fijo: $', FORMAT(t.precio_base, 2))
    END as descripcion_estructura
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
WHERE
    (:busqueda IS NULL OR t.nombre LIKE CONCAT('%', :busqueda, '%')) AND
    (:estado IS NULL OR t.estado = :estado) AND
    (:servicio_id IS NULL OR t.servicio_id = :servicio_id) AND
    (:tipo IS NULL OR t.tipo = :tipo) AND
    (:fecha_desde IS NULL OR t.fecha_vigencia >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR t.fecha_vigencia <= :fecha_hasta) AND
    (:precio_min IS NULL OR t.precio_base >= :precio_min) AND
    (:precio_max IS NULL OR t.precio_base <= :precio_max)
ORDER BY t.fecha_vigencia DESC, t.nombre ASC
LIMIT :limit OFFSET :offset;

-- 4.2 Tarifas por rango de precios
SELECT
    CASE
        WHEN precio_base < 50 THEN 'Bajo (< $50)'
        WHEN precio_base < 100 THEN 'Medio ($50-$99)'
        WHEN precio_base < 200 THEN 'Alto ($100-$199)'
        ELSE 'Muy Alto (≥ $200)'
    END as rango_precio,
    COUNT(*) as cantidad_tarifas,
    AVG(precio_base) as precio_promedio,
    MIN(precio_base) as precio_minimo,
    MAX(precio_base) as precio_maximo
FROM tarifa
WHERE tipo = 'Fija'
GROUP BY
    CASE
        WHEN precio_base < 50 THEN 'Bajo (< $50)'
        WHEN precio_base < 100 THEN 'Medio ($50-$99)'
        WHEN precio_base < 200 THEN 'Alto ($100-$199)'
        ELSE 'Muy Alto (≥ $200)'
    END
ORDER BY precio_minimo;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de tarifas para Excel/CSV
SELECT
    t.id as 'ID',
    t.nombre as 'Nombre Tarifa',
    t.tipo as 'Tipo',
    s.nombre as 'Servicio',
    t.estado as 'Estado',
    t.precio_base as 'Precio Base',
    t.unidad as 'Unidad',
    DATE_FORMAT(t.fecha_vigencia, '%Y-%m-%d') as 'Fecha Vigencia',
    DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') as 'Fecha Creación',
    DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') as 'Última Actualización',
    -- Estructura como JSON para exportación
    CASE
        WHEN t.tipo = 'Por Tramos' THEN (
            SELECT GROUP_CONCAT(
                CONCAT(tt.min_consumo, '-', COALESCE(tt.max_consumo, '∞'), ':$', tt.precio)
                SEPARATOR '; '
            )
            FROM tarifa_tramo tt
            WHERE tt.tarifa_id = t.id
            ORDER BY tt.min_consumo
        )
        WHEN t.tipo = 'Estacional' THEN (
            SELECT GROUP_CONCAT(
                CONCAT(te.estacion, ':$', te.precio)
                SEPARATOR '; '
            )
            FROM tarifa_estacional te
            WHERE te.tarifa_id = t.id
            ORDER BY te.estacion
        )
        ELSE CONCAT('$', FORMAT(t.precio_base, 2), ' por ', t.unidad)
    END as 'Estructura Detallada'
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
ORDER BY s.nombre, t.fecha_vigencia DESC;

-- 5.2 Exportación de tramos de tarifas
SELECT
    t.nombre as 'Tarifa',
    s.nombre as 'Servicio',
    tt.min_consumo as 'Consumo Mínimo',
    COALESCE(tt.max_consumo, 'Ilimitado') as 'Consumo Máximo',
    tt.precio as 'Precio',
    CONCAT(tt.min_consumo, ' - ', COALESCE(tt.max_consumo, '∞'), ' ', t.unidad) as 'Rango'
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
JOIN tarifa_tramo tt ON t.id = tt.tarifa_id
WHERE t.estado = 'Activa'
ORDER BY t.nombre, tt.min_consumo;

-- 5.3 Exportación de tarifas estacionales
SELECT
    t.nombre as 'Tarifa',
    s.nombre as 'Servicio',
    te.estacion as 'Estación',
    te.precio as 'Precio',
    t.unidad as 'Unidad'
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
JOIN tarifa_estacional te ON t.id = te.tarifa_id
WHERE t.estado = 'Activa'
ORDER BY t.nombre, te.estacion;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de tarifas
SELECT
    'Tarifas sin servicio' as validacion,
    COUNT(*) as cantidad
FROM tarifa t
LEFT JOIN servicio s ON t.servicio_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT
    'Tarifas por tramos sin tramos definidos' as validacion,
    COUNT(*) as cantidad
FROM tarifa t
WHERE t.tipo = 'Por Tramos' AND NOT EXISTS (
    SELECT 1 FROM tarifa_tramo tt WHERE tt.tarifa_id = t.id
)
UNION ALL
SELECT
    'Tarifas estacionales sin estaciones definidas' as validacion,
    COUNT(*) as cantidad
FROM tarifa t
WHERE t.tipo = 'Estacional' AND NOT EXISTS (
    SELECT 1 FROM tarifa_estacional te WHERE te.tarifa_id = t.id
)
UNION ALL
SELECT
    'Tramos con rangos inválidos' as validacion,
    COUNT(*) as cantidad
FROM tarifa_tramo tt1
JOIN tarifa_tramo tt2 ON tt1.tarifa_id = tt2.tarifa_id
    AND tt1.id != tt2.id
    AND tt1.min_consumo < tt2.max_consumo
    AND tt2.min_consumo < tt1.max_consumo
UNION ALL
SELECT
    'Precios negativos o cero' as validacion,
    COUNT(*) as cantidad
FROM (
    SELECT precio_base as precio FROM tarifa WHERE precio_base <= 0
    UNION ALL
    SELECT precio FROM tarifa_tramo WHERE precio <= 0
    UNION ALL
    SELECT precio FROM tarifa_estacional WHERE precio <= 0
) precios_invalidos;

-- 6.2 Validar solapamiento de tramos
SELECT
    t.nombre as tarifa,
    tt1.min_consumo as tramo1_min,
    tt1.max_consumo as tramo1_max,
    tt2.min_consumo as tramo2_min,
    tt2.max_consumo as tramo2_max,
    'Solapamiento detectado' as problema
FROM tarifa t
JOIN tarifa_tramo tt1 ON t.id = tt1.tarifa_id
JOIN tarifa_tramo tt2 ON t.id = tt2.tarifa_id
WHERE tt1.id < tt2.id
    AND (
        (tt1.min_consumo <= tt2.min_consumo AND tt1.max_consumo >= tt2.min_consumo) OR
        (tt2.min_consumo <= tt1.min_consumo AND tt2.max_consumo >= tt1.min_consumo)
    );

-- 6.3 Validar fechas de vigencia
SELECT
    t.nombre as tarifa,
    t.fecha_vigencia,
    COUNT(*) OVER (PARTITION BY t.servicio_id, t.fecha_vigencia) as tarifas_misma_fecha,
    'Múltiples tarifas vigentes misma fecha' as advertencia
FROM tarifa t
WHERE t.estado = 'Activa'
    AND COUNT(*) OVER (PARTITION BY t.servicio_id, t.fecha_vigencia) > 1;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de tarifas
CREATE OR REPLACE VIEW vista_tarifas_listado AS
SELECT
    t.id,
    t.nombre,
    t.tipo,
    s.nombre as servicio,
    t.estado,
    t.precio_base,
    t.unidad,
    t.fecha_vigencia,
    CASE
        WHEN t.tipo = 'Por Tramos' THEN (
            SELECT CONCAT(COUNT(*), ' tramos')
            FROM tarifa_tramo tt
            WHERE tt.tarifa_id = t.id
        )
        WHEN t.tipo = 'Estacional' THEN (
            SELECT CONCAT(COUNT(*), ' estaciones')
            FROM tarifa_estacional te
            WHERE te.tarifa_id = t.id
        )
        ELSE CONCAT('$', FORMAT(t.precio_base, 2))
    END as descripcion_precio
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id;

-- 7.2 Vista para estadísticas de consumo por tarifa
CREATE OR REPLACE VIEW vista_tarifas_estadisticas AS
SELECT
    s.nombre as servicio,
    t.tipo as tipo_tarifa,
    COUNT(DISTINCT t.id) as num_tarifas,
    AVG(CASE WHEN t.tipo = 'Fija' THEN t.precio_base END) as precio_promedio_fijo,
    COUNT(CASE WHEN t.tipo = 'Por Tramos' THEN 1 END) as num_por_tramos,
    COUNT(CASE WHEN t.tipo = 'Estacional' THEN 1 END) as num_estacionales,
    MAX(t.fecha_vigencia) as ultima_actualizacion
FROM servicio s
LEFT JOIN tarifa t ON s.id = t.servicio_id
GROUP BY s.id, s.nombre, t.tipo;

-- 7.3 Vista para estructura completa de tarifas activas
CREATE OR REPLACE VIEW vista_tarifas_completas AS
SELECT
    t.id,
    t.nombre,
    s.nombre as servicio,
    t.tipo,
    t.estado,
    t.fecha_vigencia,
    JSON_OBJECT(
        'precio_base', t.precio_base,
        'unidad', t.unidad,
        'tramos', CASE
            WHEN t.tipo = 'Por Tramos' THEN (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'min', tt.min_consumo,
                        'max', tt.max_consumo,
                        'precio', tt.precio
                    )
                )
                FROM tarifa_tramo tt
                WHERE tt.tarifa_id = t.id
                ORDER BY tt.min_consumo
            )
            ELSE NULL
        END,
        'estaciones', CASE
            WHEN t.tipo = 'Estacional' THEN (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'estacion', te.estacion,
                        'precio', te.precio
                    )
                )
                FROM tarifa_estacional te
                WHERE te.tarifa_id = t.id
                ORDER BY te.estacion
            )
            ELSE NULL
        END
    ) as estructura_json
FROM tarifa t
JOIN servicio s ON t.servicio_id = s.id
WHERE t.estado = 'Activa';

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_tarifa_servicio_estado ON tarifa(servicio_id, estado);
CREATE INDEX idx_tarifa_fecha_vigencia ON tarifa(fecha_vigencia);
CREATE INDEX idx_tarifa_tipo ON tarifa(tipo);
CREATE INDEX idx_tarifa_estado_fecha ON tarifa(estado, fecha_vigencia DESC);

-- Índices para tramos
CREATE INDEX idx_tarifa_tramo_tarifa_id ON tarifa_tramo(tarifa_id);
CREATE INDEX idx_tarifa_tramo_rango ON tarifa_tramo(min_consumo, max_consumo);

-- Índices para estaciones
CREATE INDEX idx_tarifa_estacional_tarifa_id ON tarifa_estacional(tarifa_id);
CREATE INDEX idx_tarifa_estacional_estacion ON tarifa_estacional(estacion);

-- Índice compuesto para búsquedas avanzadas
CREATE INDEX idx_tarifa_busqueda ON tarifa(nombre, estado, tipo, precio_base);

-- Índice para validaciones de solapamiento
CREATE INDEX idx_tarifa_tramo_validacion ON tarifa_tramo(tarifa_id, min_consumo, max_consumo);