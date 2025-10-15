-- ========================================================================================
-- CONSULTAS SQL PARA EL MÓDULO TORRES
-- Sistema de Cuentas Claras
-- ========================================================================================

-- =============================================================================
-- 1. LISTADO DE TORRES - Información básica para la vista principal
-- =============================================================================

-- Consulta principal para el listado de torres
SELECT
    t.id,
    t.nombre,
    t.codigo,
    t.descripcion,
    t.num_pisos as pisos,
    t.num_unidades as unidades,
    t.estado,
    t.fecha_creacion,
    t.fecha_actualizacion,
    t.activa,
    t.visible_en_portal,
    t.facturacion_independiente,
    -- Información del edificio
    e.nombre as edificio_nombre,
    e.direccion as edificio_direccion,
    -- Información del administrador
    CONCAT(p.nombre, ' ', p.apellido_paterno) as administrador_nombre,
    -- Estadísticas calculadas
    COALESCE(ue.ocupadas, 0) as unidades_ocupadas,
    COALESCE(ue.vacantes, 0) as unidades_vacantes,
    COALESCE(ue.mantenimiento, 0) as unidades_mantenimiento,
    -- Servicios disponibles
    t.tiene_ascensor,
    t.tiene_porteria,
    t.tiene_estacionamiento,
    t.tiene_gimnasio,
    t.tiene_sala_eventos,
    -- Imagen
    t.imagen_url,
    t.imagen_thumbnail
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON t.administrador_id = p.id
LEFT JOIN (
    -- Subconsulta para contar unidades por estado
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as vacantes,
        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as mantenimiento
    FROM unidad
    GROUP BY torre_id
) ue ON t.id = ue.torre_id
ORDER BY t.fecha_creacion DESC;

-- =============================================================================
-- 2. DETALLE COMPLETO DE UNA TORRE
-- =============================================================================

-- Consulta para obtener detalle completo de una torre específica
SELECT
    t.id,
    t.nombre,
    t.codigo,
    t.descripcion,
    t.num_pisos,
    t.num_unidades,
    t.estado,
    t.ano_construccion,
    t.superficie_total_m2,
    t.coeficiente_torre,
    t.gastos_especificos,
    t.activa,
    t.visible_en_portal,
    t.facturacion_independiente,
    t.observaciones,
    t.fecha_creacion,
    t.fecha_actualizacion,
    -- Información del edificio
    e.id as edificio_id,
    e.nombre as edificio_nombre,
    e.direccion as edificio_direccion,
    e.comuna as edificio_comuna,
    -- Información del administrador
    p.id as administrador_id,
    CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as administrador_nombre,
    p.email as administrador_email,
    p.telefono as administrador_telefono,
    -- Servicios
    t.tiene_ascensor,
    t.tiene_porteria,
    t.tiene_estacionamiento,
    t.tiene_gimnasio,
    t.tiene_sala_eventos,
    t.tiene_piscina,
    t.tiene_quiosco,
    t.tiene_areas_verdes,
    -- Estadísticas calculadas
    COALESCE(stats.unidades_ocupadas, 0) as unidades_ocupadas,
    COALESCE(stats.unidades_vacantes, 0) as unidades_vacantes,
    COALESCE(stats.unidades_mantenimiento, 0) as unidades_mantenimiento,
    COALESCE(stats.total_superficie_ocupada, 0) as total_superficie_ocupada_m2,
    COALESCE(stats.total_superficie_vacante, 0) as total_superficie_vacante_m2,
    -- Imágenes
    t.imagen_url,
    t.imagen_thumbnail,
    t.imagen_plano
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON t.administrador_id = p.id
LEFT JOIN (
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as unidades_ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as unidades_vacantes,
        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as unidades_mantenimiento,
        SUM(CASE WHEN estado = 'ocupada' THEN superficie_m2 ELSE 0 END) as total_superficie_ocupada,
        SUM(CASE WHEN estado = 'vacante' THEN superficie_m2 ELSE 0 END) as total_superficie_vacante
    FROM unidad
    GROUP BY torre_id
) stats ON t.id = stats.torre_id
WHERE t.id = ?;

-- =============================================================================
-- 3. UNIDADES DE UNA TORRE - Para el tab de unidades
-- =============================================================================

-- Consulta para obtener todas las unidades de una torre
SELECT
    u.id,
    u.numero_unidad,
    u.piso,
    u.tipo_unidad,
    u.superficie_m2,
    u.superficie_terraza_m2,
    u.superficie_total_m2,
    u.dormitorios,
    u.banos,
    u.estado,
    u.fecha_creacion,
    -- Propietario actual
    COALESCE(prop.nombre_completo, u.propietario_anterior) as propietario_nombre,
    prop.email as propietario_email,
    prop.telefono as propietario_telefono,
    -- Arrendatario actual (si aplica)
    arr.nombre_completo as arrendatario_nombre,
    arr.email as arrendatario_email,
    arr.telefono as arrendatario_telefono,
    -- Información financiera
    COALESCE(ult_pago.fecha_pago, NULL) as ultimo_pago_fecha,
    COALESCE(ult_pago.monto, 0) as ultimo_pago_monto,
    COALESCE(deuda.total_deuda, 0) as deuda_pendiente,
    -- Estadísticas de consumo
    COALESCE(consumo.agua_m3_mes, 0) as consumo_agua_actual,
    COALESCE(consumo.luz_kwh_mes, 0) as consumo_luz_actual,
    COALESCE(consumo.gas_m3_mes, 0) as consumo_gas_actual
FROM unidad u
LEFT JOIN (
    -- Propietario actual
    SELECT
        up.unidad_id,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        p.email,
        p.telefono
    FROM unidad_propietario up
    JOIN persona p ON up.persona_id = p.id
    WHERE up.fecha_fin IS NULL OR up.fecha_fin > CURRENT_DATE
) prop ON u.id = prop.unidad_id
LEFT JOIN (
    -- Arrendatario actual
    SELECT
        ua.unidad_id,
        CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', COALESCE(p.apellido_materno, '')) as nombre_completo,
        p.email,
        p.telefono
    FROM unidad_arrendatario ua
    JOIN persona p ON ua.persona_id = p.id
    WHERE ua.fecha_fin IS NULL OR ua.fecha_fin > CURRENT_DATE
) arr ON u.id = arr.unidad_id
LEFT JOIN (
    -- Último pago
    SELECT
        p.unidad_id,
        p.fecha_pago,
        p.monto,
        ROW_NUMBER() OVER (PARTITION BY p.unidad_id ORDER BY p.fecha_pago DESC) as rn
    FROM pago p
    WHERE p.estado = 'completado'
) ult_pago ON u.id = ult_pago.unidad_id AND ult_pago.rn = 1
LEFT JOIN (
    -- Deuda pendiente
    SELECT
        cc.unidad_id,
        SUM(cc.monto_pendiente) as total_deuda
    FROM cuenta_cobro_unidad cc
    WHERE cc.estado = 'pendiente'
    GROUP BY cc.unidad_id
) deuda ON u.id = deuda.unidad_id
LEFT JOIN (
    -- Consumo del mes actual
    SELECT
        c.unidad_id,
        SUM(CASE WHEN c.tipo_consumo = 'agua' THEN c.consumo ELSE 0 END) as agua_m3_mes,
        SUM(CASE WHEN c.tipo_consumo = 'luz' THEN c.consumo ELSE 0 END) as luz_kwh_mes,
        SUM(CASE WHEN c.tipo_consumo = 'gas' THEN c.consumo ELSE 0 END) as gas_m3_mes
    FROM consumo_unidad c
    WHERE YEAR(c.fecha_lectura) = YEAR(CURRENT_DATE)
      AND MONTH(c.fecha_lectura) = MONTH(CURRENT_DATE)
    GROUP BY c.unidad_id
) consumo ON u.id = consumo.unidad_id
WHERE u.torre_id = ?
ORDER BY u.piso ASC, u.numero_unidad ASC;

-- =============================================================================
-- 4. ESTADÍSTICAS GENERALES DEL MÓDULO TORRES
-- =============================================================================

-- Estadísticas principales para el módulo torres
SELECT
    COUNT(DISTINCT t.id) as total_torres,
    SUM(t.num_unidades) as total_unidades,
    ROUND(AVG(t.num_unidades), 1) as promedio_unidades_por_torre,
    ROUND(AVG(t.num_pisos), 1) as promedio_pisos_por_torre,
    SUM(t.superficie_total_m2) as superficie_total_m2,
    -- Torres por estado
    SUM(CASE WHEN t.estado = 'activa' THEN 1 ELSE 0 END) as torres_activas,
    SUM(CASE WHEN t.estado = 'inactiva' THEN 1 ELSE 0 END) as torres_inactivas,
    SUM(CASE WHEN t.estado = 'mantenimiento' THEN 1 ELSE 0 END) as torres_mantenimiento,
    -- Servicios disponibles
    SUM(CASE WHEN t.tiene_ascensor = 1 THEN 1 ELSE 0 END) as torres_con_ascensor,
    SUM(CASE WHEN t.tiene_estacionamiento = 1 THEN 1 ELSE 0 END) as torres_con_estacionamiento,
    SUM(CASE WHEN t.tiene_porteria = 1 THEN 1 ELSE 0 END) as torres_con_porteria,
    SUM(CASE WHEN t.tiene_gimnasio = 1 THEN 1 ELSE 0 END) as torres_con_gimnasio,
    SUM(CASE WHEN t.tiene_piscina = 1 THEN 1 ELSE 0 END) as torres_con_piscina,
    -- Unidades por estado
    COALESCE(unidades_stats.ocupadas, 0) as unidades_ocupadas_total,
    COALESCE(unidades_stats.vacantes, 0) as unidades_vacantes_total,
    COALESCE(unidades_stats.mantenimiento, 0) as unidades_mantenimiento_total,
    -- Porcentajes
    ROUND(
        (COALESCE(unidades_stats.ocupadas, 0) * 100.0) / NULLIF(SUM(t.num_unidades), 0),
        1
    ) as porcentaje_ocupacion_general
FROM torre t
LEFT JOIN (
    SELECT
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as vacantes,
        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as mantenimiento
    FROM unidad
) unidades_stats ON 1=1;

-- =============================================================================
-- 5. TORRES POR EDIFICIO - Para navegación jerárquica
-- =============================================================================

-- Consulta para obtener torres agrupadas por edificio
SELECT
    e.id as edificio_id,
    e.nombre as edificio_nombre,
    e.direccion as edificio_direccion,
    e.comuna as edificio_comuna,
    COUNT(t.id) as cantidad_torres,
    SUM(t.num_unidades) as total_unidades_edificio,
    SUM(t.num_pisos) as total_pisos_edificio,
    GROUP_CONCAT(t.nombre ORDER BY t.nombre SEPARATOR ', ') as nombres_torres,
    -- Estadísticas del edificio
    AVG(t.num_unidades) as promedio_unidades_por_torre,
    MAX(t.ano_construccion) as ano_construccion_mas_reciente,
    MIN(t.ano_construccion) as ano_construccion_mas_antiguo
FROM edificio e
LEFT JOIN torre t ON e.id = t.edificio_id AND t.activa = 1
WHERE e.activa = 1
GROUP BY e.id, e.nombre, e.direccion, e.comuna
ORDER BY e.nombre ASC;

-- =============================================================================
-- 6. TORRES CON FILTROS AVANZADOS - Para búsqueda y filtrado
-- =============================================================================

-- Consulta con filtros dinámicos (usar parámetros preparados)
SELECT
    t.id,
    t.nombre,
    t.codigo,
    t.num_pisos,
    t.num_unidades,
    t.estado,
    t.activa,
    e.nombre as edificio_nombre,
    CONCAT(p.nombre, ' ', p.apellido_paterno) as administrador,
    COALESCE(stats.unidades_ocupadas, 0) as unidades_ocupadas,
    COALESCE(stats.unidades_vacantes, 0) as unidades_vacantes,
    ROUND(
        (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0),
        1
    ) as porcentaje_ocupacion
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON t.administrador_id = p.id
LEFT JOIN (
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as unidades_ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as unidades_vacantes
    FROM unidad
    GROUP BY torre_id
) stats ON t.id = stats.torre_id
WHERE 1=1
  -- Filtros opcionales (comentar/descomentar según necesidad)
  -- AND t.activa = ?
  -- AND t.estado = ?
  -- AND e.id = ?
  -- AND t.nombre LIKE CONCAT('%', ?, '%')
  -- AND t.codigo LIKE CONCAT('%', ?, '%')
  -- AND t.num_unidades >= ?
  -- AND t.num_unidades <= ?
  -- AND t.tiene_ascensor = ?
  -- AND t.tiene_estacionamiento = ?
ORDER BY t.nombre ASC;

-- =============================================================================
-- 7. CARACTERÍSTICAS Y SERVICIOS DE TORRES - Para detalles
-- =============================================================================

-- Consulta para obtener características adicionales de una torre
SELECT
    t.id as torre_id,
    t.nombre as torre_nombre,
    -- Servicios básicos
    t.tiene_ascensor,
    t.tiene_porteria,
    t.tiene_estacionamiento,
    t.tiene_gimnasio,
    t.tiene_sala_eventos,
    t.tiene_piscina,
    t.tiene_quiosco,
    t.tiene_areas_verdes,
    t.tiene_sala_juegos,
    t.tiene_ascensor_carga,
    -- Servicios adicionales
    t.tiene_generador_emergencia,
    t.tiene_sistema_seguridad,
    t.tiene_estacionamiento_visitas,
    t.tiene_bicicletero,
    t.tiene_sala_reuniones,
    -- Información adicional
    t.ano_construccion,
    t.superficie_total_m2,
    t.coeficiente_torre,
    t.gastos_especificos,
    t.observaciones,
    -- Información del edificio padre
    e.nombre as edificio_nombre,
    e.direccion as edificio_direccion,
    e.comuna as edificio_comuna,
    e.region as edificio_region
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
WHERE t.id = ?;

-- =============================================================================
-- 8. HISTÓRICO DE CAMBIOS EN TORRES - Para auditoría
-- =============================================================================

-- Consulta para obtener histórico de cambios en una torre
SELECT
    ht.id,
    ht.fecha_cambio,
    ht.tipo_cambio,
    ht.campo_modificado,
    ht.valor_anterior,
    ht.valor_nuevo,
    ht.usuario_id,
    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_nombre,
    ht.observaciones
FROM historico_torre ht
LEFT JOIN usuario u ON ht.usuario_id = u.id
WHERE ht.torre_id = ?
ORDER BY ht.fecha_cambio DESC
LIMIT 50;

-- =============================================================================
-- 9. TORRES CON ALERTAS - Para dashboard y notificaciones
-- =============================================================================

-- Consulta para identificar torres que requieren atención
SELECT
    t.id,
    t.nombre,
    t.codigo,
    e.nombre as edificio_nombre,
    -- Alertas de ocupación baja
    CASE
        WHEN (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0) < 30
        THEN 'Ocupación baja (< 30%)'
        ELSE NULL
    END as alerta_ocupacion,
    -- Alertas de mantenimiento
    CASE
        WHEN t.estado = 'mantenimiento' THEN 'En mantenimiento'
        WHEN COALESCE(mant.pendientes, 0) > 0 THEN CONCAT(COALESCE(mant.pendientes, 0), ' mantenimientos pendientes')
        ELSE NULL
    END as alerta_mantenimiento,
    -- Alertas financieras
    CASE
        WHEN COALESCE(deuda.total_deuda_torre, 0) > 1000000 THEN 'Deuda alta (> $1.000.000)'
        ELSE NULL
    END as alerta_financiera,
    -- Estadísticas actuales
    COALESCE(stats.unidades_ocupadas, 0) as unidades_ocupadas,
    COALESCE(stats.unidades_vacantes, 0) as unidades_vacantes,
    ROUND(
        (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0),
        1
    ) as porcentaje_ocupacion,
    COALESCE(deuda.total_deuda_torre, 0) as deuda_total
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN (
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as unidades_ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as unidades_vacantes
    FROM unidad
    GROUP BY torre_id
) stats ON t.id = stats.torre_id
LEFT JOIN (
    SELECT
        torre_id,
        COUNT(*) as pendientes
    FROM mantenimiento_torre
    WHERE estado = 'pendiente' AND fecha_programada <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)
    GROUP BY torre_id
) mant ON t.id = mant.torre_id
LEFT JOIN (
    SELECT
        u.torre_id,
        SUM(cc.monto_pendiente) as total_deuda_torre
    FROM unidad u
    JOIN cuenta_cobro_unidad cc ON u.id = cc.unidad_id
    WHERE cc.estado = 'pendiente'
    GROUP BY u.torre_id
) deuda ON t.id = deuda.torre_id
WHERE t.activa = 1
  AND (
      -- Torres con ocupación baja
      (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0) < 50
      -- Torres en mantenimiento
      OR t.estado = 'mantenimiento'
      -- Torres con deuda alta
      OR COALESCE(deuda.total_deuda_torre, 0) > 500000
      -- Torres con mantenimientos pendientes
      OR COALESCE(mant.pendientes, 0) > 0
  )
ORDER BY
    CASE
        WHEN t.estado = 'mantenimiento' THEN 1
        WHEN COALESCE(deuda.total_deuda_torre, 0) > 1000000 THEN 2
        WHEN (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0) < 30 THEN 3
        ELSE 4
    END ASC,
    t.nombre ASC;

-- =============================================================================
-- 10. EXPORTACIÓN DE DATOS DE TORRES - Para reportes
-- =============================================================================

-- Consulta para exportar datos completos de torres (para Excel/CSV)
SELECT
    'TORRE' as tipo_registro,
    t.id as torre_id,
    t.nombre as torre_nombre,
    t.codigo as torre_codigo,
    t.descripcion,
    t.num_pisos,
    t.num_unidades,
    t.estado,
    t.activa,
    t.visible_en_portal,
    t.facturacion_independiente,
    t.ano_construccion,
    t.superficie_total_m2,
    t.coeficiente_torre,
    t.fecha_creacion,
    t.fecha_actualizacion,
    -- Edificio
    e.nombre as edificio_nombre,
    e.direccion as edificio_direccion,
    e.comuna as edificio_comuna,
    -- Administrador
    CONCAT(p.nombre, ' ', p.apellido_paterno) as administrador,
    -- Servicios
    t.tiene_ascensor,
    t.tiene_porteria,
    t.tiene_estacionamiento,
    t.tiene_gimnasio,
    t.tiene_sala_eventos,
    t.tiene_piscina,
    -- Estadísticas
    COALESCE(stats.unidades_ocupadas, 0) as unidades_ocupadas,
    COALESCE(stats.unidades_vacantes, 0) as unidades_vacantes,
    COALESCE(stats.unidades_mantenimiento, 0) as unidades_mantenimiento,
    ROUND(
        (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0),
        1
    ) as porcentaje_ocupacion,
    -- Información financiera
    COALESCE(fin.ingresos_mes_actual, 0) as ingresos_mes_actual,
    COALESCE(fin.gastos_mes_actual, 0) as gastos_mes_actual,
    COALESCE(fin.deuda_total, 0) as deuda_total_pendiente
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON t.administrador_id = p.id
LEFT JOIN (
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as unidades_ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as unidades_vacantes,
        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as unidades_mantenimiento
    FROM unidad
    GROUP BY torre_id
) stats ON t.id = stats.torre_id
LEFT JOIN (
    SELECT
        u.torre_id,
        SUM(CASE WHEN YEAR(p.fecha_pago) = YEAR(CURRENT_DATE) AND MONTH(p.fecha_pago) = MONTH(CURRENT_DATE) THEN p.monto ELSE 0 END) as ingresos_mes_actual,
        SUM(CASE WHEN YEAR(g.fecha) = YEAR(CURRENT_DATE) AND MONTH(g.fecha) = MONTH(CURRENT_DATE) THEN g.monto ELSE 0 END) as gastos_mes_actual,
        SUM(cc.monto_pendiente) as deuda_total
    FROM unidad u
    LEFT JOIN pago p ON u.id = p.unidad_id AND p.estado = 'completado'
    LEFT JOIN gasto g ON u.torre_id = g.torre_id AND g.estado = 'aprobado'
    LEFT JOIN cuenta_cobro_unidad cc ON u.id = cc.unidad_id AND cc.estado = 'pendiente'
    GROUP BY u.torre_id
) fin ON t.id = fin.torre_id
ORDER BY e.nombre ASC, t.nombre ASC;

-- =============================================================================
-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- =============================================================================

-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_torre_edificio_id ON torre(edificio_id);
CREATE INDEX idx_torre_estado ON torre(estado);
CREATE INDEX idx_torre_activa ON torre(activa);
CREATE INDEX idx_torre_administrador_id ON torre(administrador_id);
CREATE INDEX idx_unidad_torre_id ON unidad(torre_id);
CREATE INDEX idx_unidad_estado ON unidad(estado);
CREATE INDEX idx_unidad_propietario_fecha ON unidad_propietario(fecha_fin);
CREATE INDEX idx_unidad_arrendatario_fecha ON unidad_arrendatario(fecha_fin);
CREATE INDEX idx_pago_unidad_fecha ON pago(unidad_id, fecha_pago);
CREATE INDEX idx_cuenta_cobro_unidad_estado ON cuenta_cobro_unidad(unidad_id, estado);
CREATE INDEX idx_consumo_unidad_fecha ON consumo_unidad(unidad_id, fecha_lectura);

-- =============================================================================
-- VISTAS OPTIMIZADAS PARA EL MÓDULO TORRES
-- =============================================================================

-- Vista para listado rápido de torres
CREATE VIEW vista_torres_listado AS
SELECT
    t.id,
    t.nombre,
    t.codigo,
    t.num_pisos,
    t.num_unidades,
    t.estado,
    t.activa,
    t.fecha_creacion,
    e.nombre as edificio_nombre,
    CONCAT(p.nombre, ' ', p.apellido_paterno) as administrador,
    COALESCE(stats.unidades_ocupadas, 0) as unidades_ocupadas,
    COALESCE(stats.unidades_vacantes, 0) as unidades_vacantes,
    ROUND(
        (COALESCE(stats.unidades_ocupadas, 0) * 100.0) / NULLIF(t.num_unidades, 0),
        1
    ) as porcentaje_ocupacion
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON t.administrador_id = p.id
LEFT JOIN (
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as unidades_ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as unidades_vacantes
    FROM unidad
    GROUP BY torre_id
) stats ON t.id = stats.torre_id;

-- Vista para estadísticas del módulo torres
CREATE VIEW vista_torres_estadisticas AS
SELECT
    COUNT(DISTINCT t.id) as total_torres,
    SUM(t.num_unidades) as total_unidades,
    ROUND(AVG(t.num_unidades), 1) as promedio_unidades_por_torre,
    SUM(CASE WHEN t.estado = 'activa' THEN 1 ELSE 0 END) as torres_activas,
    SUM(CASE WHEN t.estado = 'inactiva' THEN 1 ELSE 0 END) as torres_inactivas,
    SUM(CASE WHEN t.estado = 'mantenimiento' THEN 1 ELSE 0 END) as torres_mantenimiento,
    COALESCE(unidades_stats.ocupadas, 0) as unidades_ocupadas_total,
    COALESCE(unidades_stats.vacantes, 0) as unidades_vacantes_total,
    ROUND(
        (COALESCE(unidades_stats.ocupadas, 0) * 100.0) / NULLIF(SUM(t.num_unidades), 0),
        1
    ) as porcentaje_ocupacion_general
FROM torre t
LEFT JOIN (
    SELECT
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as vacantes
    FROM unidad
) unidades_stats ON 1=1;

-- Vista para detalle completo de torres
CREATE VIEW vista_torres_detalle AS
SELECT
    t.id,
    t.nombre,
    t.codigo,
    t.descripcion,
    t.num_pisos,
    t.num_unidades,
    t.estado,
    t.activa,
    t.visible_en_portal,
    t.facturacion_independiente,
    t.ano_construccion,
    t.superficie_total_m2,
    t.coeficiente_torre,
    e.id as edificio_id,
    e.nombre as edificio_nombre,
    e.direccion as edificio_direccion,
    CONCAT(p.nombre, ' ', p.apellido_paterno) as administrador_nombre,
    t.tiene_ascensor,
    t.tiene_porteria,
    t.tiene_estacionamiento,
    t.tiene_gimnasio,
    t.tiene_sala_eventos,
    COALESCE(stats.unidades_ocupadas, 0) as unidades_ocupadas,
    COALESCE(stats.unidades_vacantes, 0) as unidades_vacantes,
    COALESCE(stats.unidades_mantenimiento, 0) as unidades_mantenimiento
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
LEFT JOIN persona p ON t.administrador_id = p.id
LEFT JOIN (
    SELECT
        torre_id,
        SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as unidades_ocupadas,
        SUM(CASE WHEN estado = 'vacante' THEN 1 ELSE 0 END) as unidades_vacantes,
        SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) as unidades_mantenimiento
    FROM unidad
    GROUP BY torre_id
) stats ON t.id = stats.torre_id;