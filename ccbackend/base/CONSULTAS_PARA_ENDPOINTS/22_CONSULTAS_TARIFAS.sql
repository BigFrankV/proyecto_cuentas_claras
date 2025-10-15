-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO TARIFAS
-- Sistema: Cuentas Claras (Basado en el esquema 'tarifa_consumo')
-- =========================================
-- NOTA DE CORRECCIÓN: La estructura original no existe. Se reemplazó 'tarifa' por 'tarifa_consumo' (t).
-- Las tarifas se asumen fijas/unitarias ya que no existen tablas de tramos/estaciones.

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de tarifas con filtros
SELECT
    t.id,
    c.razon_social AS comunidad_nombre,
    t.tipo,
    t.precio_por_unidad,
    t.cargo_fijo,
    t.periodo_desde,
    t.periodo_hasta,
    -- Simulación de nombre y estado
    CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre,
    'Activa' AS estado, -- SIMULADO: Asumimos activa por defecto
    t.created_at,
    t.updated_at
FROM tarifa_consumo t -- CORRECCIÓN: Usar tabla real
LEFT JOIN comunidad c ON t.comunidad_id = c.id
WHERE
    (:estado IS NULL OR 'Activa' = :estado) AND -- SIMULADO: Siempre activa
    (:tipo IS NULL OR t.tipo = :tipo) AND
    (:comunidad_id IS NULL OR t.comunidad_id = :comunidad_id) AND
    (:periodo_desde IS NULL OR t.periodo_desde >= :periodo_desde) AND
    (:periodo_hasta IS NULL OR t.periodo_desde <= :periodo_hasta) -- Usamos periodo_desde como proxy
ORDER BY t.periodo_desde DESC, t.tipo ASC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de tarifas por comunidad y tipo
SELECT
    c.razon_social AS comunidad,
    t.tipo AS servicio,
    COUNT(t.id) AS total_tarifas,
    AVG(t.precio_por_unidad) AS precio_unitario_promedio,
    AVG(t.cargo_fijo) AS cargo_fijo_promedio
FROM comunidad c
LEFT JOIN tarifa_consumo t ON c.id = t.comunidad_id
GROUP BY c.id, c.razon_social, t.tipo
ORDER BY c.razon_social, t.tipo;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de una tarifa específica
SELECT
    t.id,
    c.razon_social AS comunidad_nombre,
    t.tipo AS servicio,
    t.precio_por_unidad,
    t.cargo_fijo,
    t.periodo_desde,
    t.periodo_hasta,
    t.created_at,
    t.updated_at,
    -- Simulación de campos originales
    CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre,
    'Fija/Unitaria' AS tipo_estructura,
    'Activa' AS estado,
    'unidad' AS unidad,
    -- Estructura simplificada
    JSON_OBJECT(
        'tipo', 'Fija/Unitaria',
        'precio_unitario', t.precio_por_unidad,
        'cargo_fijo', t.cargo_fijo,
        'periodo_desde', t.periodo_desde,
        'periodo_hasta', t.periodo_hasta
    ) AS estructura_json
FROM tarifa_consumo t
LEFT JOIN comunidad c ON t.comunidad_id = c.id
WHERE t.id = :tarifa_id;

-- 2.2 Vista de tarifas con estructura completa (Simplificada)
SELECT
    t.id,
    c.razon_social AS comunidad_nombre,
    t.tipo AS servicio,
    'Activa' AS estado,
    t.periodo_desde AS fecha_vigencia,
    JSON_OBJECT(
        'tipo', 'Fija/Unitaria',
        'precio_unitario', t.precio_por_unidad,
        'cargo_fijo', t.cargo_fijo,
        'unidad', 'unidad'
    ) AS estructura_completa
FROM tarifa_consumo t
LEFT JOIN comunidad c ON t.comunidad_id = c.id
ORDER BY c.razon_social, t.periodo_desde DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de tarifas
SELECT
    COUNT(*) AS total_tarifas,
    COUNT(CASE WHEN t.tipo = 'agua' THEN 1 END) AS tarifas_agua,
    COUNT(CASE WHEN t.tipo = 'gas' THEN 1 END) AS tarifas_gas,
    COUNT(CASE WHEN t.tipo = 'electricidad' THEN 1 END) AS tarifas_electricidad,
    COUNT(DISTINCT comunidad_id) AS comunidades_cubiertas,
    AVG(t.precio_por_unidad) AS precio_unitario_promedio,
    AVG(t.cargo_fijo) AS cargo_fijo_promedio,
    MIN(t.periodo_desde) AS fecha_mas_antigua,
    MAX(t.periodo_desde) AS fecha_mas_reciente
FROM tarifa_consumo t;

-- 3.2 Estadísticas por servicio (tipo)
SELECT
    t.tipo AS servicio,
    COUNT(t.id) AS total_tarifas,
    COUNT(DISTINCT t.comunidad_id) AS comunidades_cubiertas,
    AVG(t.precio_por_unidad) AS precio_unitario_promedio,
    AVG(t.cargo_fijo) AS cargo_fijo_promedio,
    MAX(t.periodo_desde) AS ultima_actualizacion
FROM tarifa_consumo t
GROUP BY t.tipo
ORDER BY t.tipo;

-- 3.3 Estadísticas de precios (Simplificada al precio unitario)
SELECT
    'precio_unitario' AS tipo,
    COUNT(*) AS total,
    AVG(precio_por_unidad) AS precio_promedio,
    MIN(precio_por_unidad) AS precio_minimo,
    MAX(precio_por_unidad) AS precio_maximo
FROM tarifa_consumo
UNION ALL
SELECT
    'cargo_fijo' AS tipo,
    COUNT(*) AS total,
    AVG(cargo_fijo) AS precio_promedio,
    MIN(cargo_fijo) AS precio_minimo,
    MAX(cargo_fijo) AS precio_maximo
FROM tarifa_consumo;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de tarifas
SELECT
    t.id,
    CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre,
    t.tipo AS servicio,
    'Activa' AS estado,
    t.precio_por_unidad,
    t.cargo_fijo,
    t.periodo_desde AS fecha_vigencia,
    CONCAT('Precio Unitario: $', FORMAT(t.precio_por_unidad, 4), ' + Cargo Fijo: $', FORMAT(t.cargo_fijo, 2)) AS descripcion_estructura
FROM tarifa_consumo t
WHERE
    (:busqueda IS NULL OR t.tipo LIKE CONCAT('%', :busqueda, '%')) AND
    (:tipo IS NULL OR t.tipo = :tipo) AND
    (:periodo_desde IS NULL OR t.periodo_desde >= :periodo_desde) AND
    (:periodo_hasta IS NULL OR t.periodo_desde <= :periodo_hasta) AND
    (:precio_min IS NULL OR t.precio_por_unidad >= :precio_min) AND
    (:precio_max IS NULL OR t.precio_por_unidad <= :precio_max)
ORDER BY t.periodo_desde DESC, t.tipo ASC
LIMIT :limit OFFSET :offset;

-- 4.2 Tarifas por rango de precios (solo precio unitario)
SELECT
    CASE
        WHEN precio_por_unidad < 0.70 THEN 'Bajo (< $0.70)'
        WHEN precio_por_unidad < 1.10 THEN 'Medio ($0.70-$1.09)'
        ELSE 'Alto (≥ $1.10)'
    END AS rango_precio,
    COUNT(*) AS cantidad_tarifas,
    AVG(precio_por_unidad) AS precio_promedio,
    MIN(precio_por_unidad) AS precio_minimo,
    MAX(precio_por_unidad) AS precio_maximo
FROM tarifa_consumo
GROUP BY 1
ORDER BY precio_minimo;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de tarifas para Excel/CSV
SELECT
    t.id AS 'ID',
    c.razon_social AS 'Comunidad',
    t.tipo AS 'Tipo Servicio',
    'Activa' AS 'Estado',
    t.precio_por_unidad AS 'Precio Unitario',
    t.cargo_fijo AS 'Cargo Fijo',
    t.periodo_desde AS 'Período Desde',
    COALESCE(t.periodo_hasta, 'Actual') AS 'Período Hasta',
    DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
    DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización',
    CONCAT('Precio: $', FORMAT(t.precio_por_unidad, 4), ' + Cargo Fijo: $', FORMAT(t.cargo_fijo, 2)) AS 'Estructura Detallada'
FROM tarifa_consumo t
LEFT JOIN comunidad c ON t.comunidad_id = c.id
ORDER BY c.razon_social, t.periodo_desde DESC;

-- 5.2 Exportación de precios por servicio y período
SELECT
    c.razon_social AS 'Comunidad',
    t.tipo AS 'Servicio',
    t.periodo_desde AS 'Período',
    t.precio_por_unidad AS 'Precio Unitario',
    t.cargo_fijo AS 'Cargo Fijo'
FROM tarifa_consumo t
LEFT JOIN comunidad c ON t.comunidad_id = c.id
ORDER BY t.tipo, t.periodo_desde DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de tarifas
SELECT
    'Tarifas sin comunidad' AS validacion,
    COUNT(*) AS cantidad
FROM tarifa_consumo t
LEFT JOIN comunidad c ON t.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Precios unitarios negativos o cero' AS validacion,
    COUNT(*) AS cantidad
FROM tarifa_consumo
WHERE precio_por_unidad <= 0
UNION ALL
SELECT
    'Cargos fijos negativos' AS validacion,
    COUNT(*) AS cantidad
FROM tarifa_consumo
WHERE cargo_fijo < 0;

-- 6.2 Validar solapamiento de períodos (por comunidad y tipo)
SELECT
    t1.comunidad_id,
    c.razon_social AS comunidad,
    t1.tipo,
    t1.periodo_desde AS periodo1_inicio,
    COALESCE(t1.periodo_hasta, 'N/A') AS periodo1_fin,
    t2.periodo_desde AS periodo2_inicio,
    COALESCE(t2.periodo_hasta, 'N/A') AS periodo2_fin,
    'Solapamiento/Inconsistencia de períodos' AS problema
FROM tarifa_consumo t1
JOIN tarifa_consumo t2 ON t1.comunidad_id = t2.comunidad_id
    AND t1.tipo = t2.tipo
    AND t1.id < t2.id
LEFT JOIN comunidad c ON t1.comunidad_id = c.id
WHERE t1.periodo_desde < COALESCE(t2.periodo_hasta, t1.periodo_desde) -- Simple chequeo de solapamiento
ORDER BY t1.comunidad_id, t1.tipo, t1.periodo_desde;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de tarifas
CREATE OR REPLACE VIEW vista_tarifas_listado AS
SELECT
    t.id,
    c.razon_social AS comunidad,
    t.tipo AS servicio,
    t.precio_por_unidad,
    t.cargo_fijo,
    t.periodo_desde,
    t.periodo_hasta,
    CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre_tarifa,
    CONCAT('$', FORMAT(t.precio_por_unidad, 4), ' + $', FORMAT(t.cargo_fijo, 2)) AS descripcion_precio
FROM tarifa_consumo t
LEFT JOIN comunidad c ON t.comunidad_id = c.id;

-- 7.2 Vista para estadísticas de consumo por tarifa
CREATE OR REPLACE VIEW vista_tarifas_estadisticas AS
SELECT
    t.tipo AS servicio,
    COUNT(t.id) AS num_tarifas,
    AVG(t.precio_por_unidad) AS precio_promedio_unitario,
    AVG(t.cargo_fijo) AS cargo_fijo_promedio,
    MAX(t.periodo_desde) AS ultima_actualizacion
FROM tarifa_consumo t
GROUP BY t.tipo;

-- 7.3 Vista para estructura completa de tarifas activas
CREATE OR REPLACE VIEW vista_tarifas_completas AS
SELECT
    t.id,
    t.tipo AS servicio,
    t.periodo_desde AS fecha_vigencia,
    JSON_OBJECT(
        'precio_unitario', t.precio_por_unidad,
        'cargo_fijo', t.cargo_fijo,
        'periodo_desde', t.periodo_desde
    ) AS estructura_json
FROM tarifa_consumo t;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_tarifa_consumo_comunidad_tipo ON tarifa_consumo(comunidad_id, tipo);
CREATE INDEX idx_tarifa_consumo_periodo_desde ON tarifa_consumo(periodo_desde);
CREATE INDEX idx_tarifa_consumo_precio_unidad ON tarifa_consumo(precio_por_unidad);

-- Índices para validaciones de solapamiento
CREATE INDEX idx_tarifa_consumo_validacion_periodo ON tarifa_consumo(comunidad_id, tipo, periodo_desde, periodo_hasta);