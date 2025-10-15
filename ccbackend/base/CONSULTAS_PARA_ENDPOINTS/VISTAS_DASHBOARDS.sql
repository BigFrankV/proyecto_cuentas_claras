// ========================================================================================
// VISTAS OPTIMIZADAS PARA DASHBOARD - SISTEMA DE CUENTAS CLARAS
// ========================================================================================

/*
 * VISTAS DE BASE DE DATOS PARA DASHBOARD
 *
 * Estas vistas optimizan las consultas más frecuentes del dashboard,
 * mejorando el rendimiento y simplificando el código de la aplicación.
 */

// ========================================================================================
// 1. VISTA: dashboard_kpis_principales
// KPIs principales mostrados en la parte superior del dashboard
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_kpis_principales AS
SELECT
    k.comunidad_id,
    k.saldo_total,
    k.variacion_saldo_porcentual,
    k.ingresos_mes_actual,
    k.variacion_ingresos_porcentual,
    k.gastos_mes_actual,
    k.variacion_gastos_porcentual,
    k.tasa_morosidad_actual,
    k.variacion_morosidad_porcentual,
    k.total_unidades_activas,
    k.unidades_al_dia,
    ROUND((k.unidades_al_dia * 100.0) / NULLIF(k.total_unidades_activas, 0), 2) as efectividad_cobranza
FROM (
    SELECT
        comunidad_id,
        -- Saldo total
        (SELECT COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0)
         FROM pago p LEFT JOIN gasto g ON p.comunidad_id = g.comunidad_id
         WHERE p.comunidad_id = c.id AND p.estado = 'aplicado' AND g.estado = 'aprobado') as saldo_total,

        -- Variación saldo (comparación con mes anterior)
        (SELECT ROUND(
            ((COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0)) -
             LAG(COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0)) OVER (ORDER BY YEAR(fecha))) /
            NULLIF(LAG(COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0)) OVER (ORDER BY YEAR(fecha)), 0) * 100, 2
         ) FROM (
             SELECT fecha, monto FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado'
             UNION ALL
             SELECT fecha, -monto FROM gasto WHERE comunidad_id = c.id AND estado = 'aprobado'
         ) t GROUP BY YEAR(fecha) ORDER BY YEAR(fecha) DESC LIMIT 1) as variacion_saldo_porcentual,

        -- Ingresos mes actual
        (SELECT SUM(monto) FROM pago
         WHERE comunidad_id = c.id AND estado = 'aplicado'
         AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes_actual,

        -- Variación ingresos
        (SELECT ROUND(
            (SUM(monto) - LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
            NULLIF(LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0) * 100, 2
         ) FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado'
         GROUP BY YEAR(fecha), MONTH(fecha) ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC LIMIT 1) as variacion_ingresos_porcentual,

        -- Gastos mes actual
        (SELECT SUM(monto) FROM gasto
         WHERE comunidad_id = c.id AND estado = 'aprobado'
         AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes_actual,

        -- Variación gastos
        (SELECT ROUND(
            (SUM(monto) - LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
            NULLIF(LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0) * 100, 2
         ) FROM gasto WHERE comunidad_id = c.id AND estado = 'aprobado'
         GROUP BY YEAR(fecha), MONTH(fecha) ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC LIMIT 1) as variacion_gastos_porcentual,

        -- Tasa de morosidad
        (SELECT ROUND(
            (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*), 2
         ) FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido') as tasa_morosidad_actual,

        -- Variación morosidad
        (SELECT ROUND(
            ((COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*)) -
            LAG((COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*)) OVER (ORDER BY YEAR(egc.fecha_vencimiento)), 2
         ) FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido'
         GROUP BY YEAR(egc.fecha_vencimiento) ORDER BY YEAR(egc.fecha_vencimiento) DESC LIMIT 1) as variacion_morosidad_porcentual,

        -- Total unidades activas
        (SELECT COUNT(*) FROM unidad WHERE comunidad_id = c.id AND activa = 1) as total_unidades_activas,

        -- Unidades al día
        (SELECT COUNT(DISTINCT ccu.unidad_id)
         FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido' AND ccu.saldo = 0) as unidades_al_dia

    FROM comunidad c
) k;

// ========================================================================================
// 2. VISTA: dashboard_tendencias_emisiones
// Datos para el gráfico de tendencias de emisiones (últimos 6 meses)
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_tendencias_emisiones AS
SELECT
    egc.comunidad_id,
    DATE_FORMAT(egc.periodo, '%Y-%m') as periodo,
    YEAR(egc.periodo) as anio,
    MONTH(egc.periodo) as mes,
    SUM(egc.monto_total) as monto_total_emisiones,
    COUNT(DISTINCT ccu.unidad_id) as cantidad_unidades,
    ROUND(AVG(egc.monto_total / NULLIF((SELECT COUNT(*) FROM unidad WHERE comunidad_id = egc.comunidad_id AND activa = 1), 0)), 2) as monto_promedio_por_unidad,
    ROUND(
        ((SUM(egc.monto_total) - LAG(SUM(egc.monto_total)) OVER (PARTITION BY egc.comunidad_id ORDER BY egc.periodo)) /
         NULLIF(LAG(SUM(egc.monto_total)) OVER (PARTITION BY egc.comunidad_id ORDER BY egc.periodo), 0)) * 100, 2
    ) as variacion_porcentual
FROM emision_gastos_comunes egc
JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.estado = 'emitido'
  AND egc.periodo >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
GROUP BY egc.comunidad_id, DATE_FORMAT(egc.periodo, '%Y-%m'), YEAR(egc.periodo), MONTH(egc.periodo)
ORDER BY egc.comunidad_id, egc.periodo;

// ========================================================================================
// 3. VISTA: dashboard_estado_pagos
// Distribución del estado de pagos para gráfico circular
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_estado_pagos AS
SELECT
    ccu.comunidad_id,
    CASE
        WHEN ccu.saldo = 0 THEN 'Pagos al Día'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
        ELSE 'Morosos +60 días'
    END as categoria_pago,
    COUNT(*) as cantidad_unidades,
    ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER (PARTITION BY ccu.comunidad_id), 2) as porcentaje,
    SUM(ccu.saldo) as monto_total_pendiente,
    CASE
        WHEN ccu.saldo = 0 THEN 1
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 2
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 3
        ELSE 4
    END as orden_categoria
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE egc.estado = 'emitido'
  AND egc.fecha_vencimiento <= CURRENT_DATE
GROUP BY ccu.comunidad_id,
    CASE
        WHEN ccu.saldo = 0 THEN 'Pagos al Día'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
        ELSE 'Morosos +60 días'
    END
ORDER BY ccu.comunidad_id, orden_categoria;

// ========================================================================================
// 4. VISTA: dashboard_gastos_categoria
// Gastos agrupados por categoría para gráfico de barras
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_gastos_categoria AS
SELECT
    g.comunidad_id,
    cg.nombre as categoria,
    cg.tipo as tipo_categoria,
    SUM(g.monto) as total_gastos,
    ROUND((SUM(g.monto) * 100.0) / SUM(SUM(g.monto)) OVER (PARTITION BY g.comunidad_id), 2) as porcentaje_del_total,
    COUNT(g.id) as cantidad_gastos,
    MAX(g.fecha) as ultimo_gasto
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.estado = 'aprobado'
  AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
GROUP BY g.comunidad_id, cg.id, cg.nombre, cg.tipo
ORDER BY g.comunidad_id, total_gastos DESC;

// ========================================================================================
// 5. VISTA: dashboard_consumos_medidores
// Consumos de medidores para gráfico de consumos recientes
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_consumos_medidores AS
SELECT
    cu.comunidad_id,
    m.nombre as medidor,
    m.tipo_medidor,
    cu.lectura_actual - cu.lectura_anterior as consumo,
    cu.monto_calculado,
    DATE_FORMAT(cu.fecha_lectura, '%Y-%m') as periodo,
    CASE m.tipo_medidor
        WHEN 'agua' THEN 'L'
        WHEN 'electricidad' THEN 'kWh'
        WHEN 'gas' THEN 'm³'
        ELSE 'unidades'
    END as unidad_medida,
    ROUND(cu.consumo / NULLIF(DATEDIFF(cu.fecha_lectura, DATE_SUB(cu.fecha_lectura, INTERVAL 1 MONTH)), 0), 2) as consumo_diario_promedio
FROM consumo_unidad cu
JOIN medidor m ON cu.medidor_id = m.id
WHERE YEAR(cu.fecha_lectura) = YEAR(CURRENT_DATE)
  AND MONTH(cu.fecha_lectura) = MONTH(CURRENT_DATE)
  AND cu.estado = 'confirmado'
ORDER BY cu.comunidad_id, consumo DESC;

// ========================================================================================
// 6. VISTA: dashboard_pagos_recientes
// Últimos pagos registrados para tabla del dashboard
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_pagos_recientes AS
SELECT
    p.comunidad_id,
    p.id,
    u.codigo as unidad,
    CONCAT(pe.nombres, ' ', pe.apellidos) as propietario,
    p.monto,
    DATE_FORMAT(p.fecha, '%d/%m/%Y') as fecha_pago,
    p.estado,
    p.referencia_pago,
    CASE
        WHEN p.estado = 'aplicado' THEN 'Conciliado'
        WHEN p.estado = 'pendiente' THEN 'Pendiente'
        ELSE 'Rechazado'
    END as estado_descripcion,
    DATEDIFF(CURRENT_DATE, p.fecha) as dias_desde_pago,
    p.created_at as fecha_registro
FROM pago p
JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
    AND tu.tipo = 'propietario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
ORDER BY p.comunidad_id, p.fecha DESC, p.created_at DESC;

// ========================================================================================
// 7. VISTA: dashboard_unidades_morosas
// Unidades con morosidad para tabla del dashboard
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_unidades_morosas AS
SELECT
    ccu.comunidad_id,
    u.id as unidad_id,
    u.codigo as codigo_unidad,
    CONCAT(pe.nombres, ' ', pe.apellidos) as propietario,
    COUNT(DISTINCT egc.id) as meses_morosos,
    SUM(ccu.saldo) as deuda_total,
    MAX(DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento)) as dias_maximo_atraso,
    ROUND(AVG(ccu.saldo), 2) as deuda_promedio,
    GROUP_CONCAT(DATE_FORMAT(egc.periodo, '%m/%Y') ORDER BY egc.periodo DESC SEPARATOR ', ') as periodos_pendientes,
    MAX(egc.fecha_vencimiento) as ultimo_vencimiento
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
    AND tu.tipo = 'propietario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
WHERE egc.estado = 'emitido'
  AND ccu.saldo > 0
  AND egc.fecha_vencimiento < CURRENT_DATE
GROUP BY ccu.comunidad_id, u.id, u.codigo, pe.nombres, pe.apellidos
ORDER BY ccu.comunidad_id, deuda_total DESC, dias_maximo_atraso DESC;

// ========================================================================================
// 8. VISTA: dashboard_actividades_proximas
// Próximas actividades (emisiones, mantenimientos, reuniones)
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_actividades_proximas AS
SELECT
    comunidad_id,
    tipo_actividad,
    titulo,
    descripcion,
    fecha_programada,
    fecha_formateada,
    estado,
    estado_relativo,
    dias_restantes,
    prioridad_orden
FROM (
    -- Emisiones programadas
    SELECT
        egc.comunidad_id,
        'emision' as tipo_actividad,
        CONCAT('Emisión de Gastos - ', DATE_FORMAT(egc.periodo, '%M %Y')) as titulo,
        CONCAT('Generación automática de cargos para el período ', DATE_FORMAT(egc.periodo, '%m/%Y')) as descripcion,
        DATE_FORMAT(egc.fecha_emision, '%Y-%m-%d') as fecha_programada,
        DATE_FORMAT(egc.fecha_emision, '%d/%m/%Y') as fecha_formateada,
        egc.estado,
        CASE
            WHEN egc.fecha_emision < CURRENT_DATE THEN 'vencida'
            WHEN egc.fecha_emision = CURRENT_DATE THEN 'hoy'
            ELSE 'programada'
        END as estado_relativo,
        DATEDIFF(egc.fecha_emision, CURRENT_DATE) as dias_restantes,
        1 as prioridad_orden
    FROM emision_gastos_comunes egc
    WHERE egc.fecha_emision >= CURRENT_DATE
      AND egc.estado = 'programada'

    UNION ALL

    -- Mantenimientos programados
    SELECT
        mp.comunidad_id,
        'mantenimiento' as tipo_actividad,
        'Servicio de Mantención Programado' as titulo,
        CONCAT('Mantención de ', e.nombre, ' - Servicio técnico programado') as descripcion,
        DATE_FORMAT(mp.fecha_programada, '%Y-%m-%d') as fecha_programada,
        DATE_FORMAT(mp.fecha_programada, '%d/%m/%Y') as fecha_formateada,
        mp.estado,
        CASE
            WHEN mp.fecha_programada < CURRENT_DATE THEN 'vencida'
            WHEN mp.fecha_programada = CURRENT_DATE THEN 'hoy'
            ELSE 'programada'
        END as estado_relativo,
        DATEDIFF(mp.fecha_programada, CURRENT_DATE) as dias_restantes,
        2 as prioridad_orden
    FROM mantenimiento_programado mp
    JOIN equipo e ON mp.equipo_id = e.id
    WHERE mp.fecha_programada >= CURRENT_DATE
      AND mp.estado = 'programado'

    UNION ALL

    -- Reuniones programadas
    SELECT
        r.comunidad_id,
        'reunion' as tipo_actividad,
        r.titulo,
        r.descripcion,
        DATE_FORMAT(r.fecha_hora, '%Y-%m-%d') as fecha_programada,
        DATE_FORMAT(r.fecha_hora, '%d/%m/%Y %H:%i') as fecha_formateada,
        r.estado,
        CASE
            WHEN r.fecha_hora < CURRENT_DATE THEN 'vencida'
            WHEN DATE(r.fecha_hora) = CURRENT_DATE THEN 'hoy'
            ELSE 'programada'
        END as estado_relativo,
        DATEDIFF(DATE(r.fecha_hora), CURRENT_DATE) as dias_restantes,
        3 as prioridad_orden
    FROM reunion r
    WHERE r.fecha_hora >= CURRENT_DATE
      AND r.estado = 'programada'
) actividades
ORDER BY comunidad_id, fecha_programada ASC, prioridad_orden ASC;

// ========================================================================================
// 9. VISTA: dashboard_reservas_proximas
// Próximas reservas de amenidades
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_reservas_proximas AS
SELECT
    ra.comunidad_id,
    ra.id,
    a.nombre as amenidad,
    a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') as fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') as fecha_fin,
    ra.estado,
    u.codigo as unidad_reserva,
    CONCAT(p.nombres, ' ', p.apellidos) as reservado_por,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) as horas_reserva,
    TIMESTAMPDIFF(DAY, CURRENT_DATE, DATE(ra.inicio)) as dias_para_reserva,
    CASE
        WHEN ra.estado = 'cumplida' THEN 'Completada'
        WHEN ra.estado = 'aprobada' THEN 'Confirmada'
        WHEN ra.estado = 'solicitada' THEN 'Pendiente'
        ELSE 'Cancelada'
    END as estado_descripcion,
    CASE ra.estado
        WHEN 'aprobada' THEN 1
        WHEN 'solicitada' THEN 2
        WHEN 'cumplida' THEN 3
        ELSE 4
    END as orden_estado
FROM reserva_amenidad ra
JOIN amenidad a ON ra.amenidad_id = a.id
JOIN unidad u ON ra.unidad_id = u.id
JOIN persona p ON ra.persona_id = p.id
WHERE ra.inicio >= CURRENT_DATE
  AND ra.estado IN ('aprobada', 'solicitada')
ORDER BY ra.comunidad_id, ra.inicio ASC, orden_estado ASC;

// ========================================================================================
// 10. VISTA: dashboard_notificaciones
// Notificaciones recientes para el dashboard
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_notificaciones AS
SELECT
    comunidad_id,
    tipo_notificacion,
    titulo,
    mensaje,
    fecha_notificacion,
    referencia_id,
    severidad,
    CASE severidad
        WHEN 'danger' THEN 1
        WHEN 'warning' THEN 2
        WHEN 'success' THEN 3
        WHEN 'info' THEN 4
        ELSE 5
    END as orden_severidad
FROM (
    -- Pagos vencidos
    SELECT
        ccu.comunidad_id,
        'pago_vencido' as tipo_notificacion,
        CONCAT('Pago vencido - Unidad ', u.codigo) as titulo,
        CONCAT('La unidad ', u.codigo, ' tiene un pago vencido de $', FORMAT(ccu.saldo, 0), ' desde el ', DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y')) as mensaje,
        DATE_FORMAT(ccu.updated_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
        ccu.id as referencia_id,
        'warning' as severidad
    FROM cuenta_cobro_unidad ccu
    JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    JOIN unidad u ON ccu.unidad_id = u.id
    WHERE egc.estado = 'emitido'
      AND ccu.saldo > 0
      AND egc.fecha_vencimiento < CURRENT_DATE
      AND ccu.updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

    UNION ALL

    -- Nuevos pagos registrados
    SELECT
        p.comunidad_id,
        'pago_registrado' as tipo_notificacion,
        CONCAT('Nuevo pago registrado - Unidad ', u.codigo) as titulo,
        CONCAT('Se registró un pago de $', FORMAT(p.monto, 0), ' para la unidad ', u.codigo) as mensaje,
        DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
        p.id as referencia_id,
        'success' as severidad
    FROM pago p
    JOIN unidad u ON p.unidad_id = u.id
    WHERE p.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

    UNION ALL

    -- Gastos aprobados
    SELECT
        g.comunidad_id,
        'gasto_aprobado' as tipo_notificacion,
        CONCAT('Gasto aprobado - ', cg.nombre) as titulo,
        CONCAT('Se aprobó un gasto de $', FORMAT(g.monto, 0), ' en la categoría ', cg.nombre) as mensaje,
        DATE_FORMAT(g.updated_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
        g.id as referencia_id,
        'info' as severidad
    FROM gasto g
    JOIN categoria_gasto cg ON g.categoria_id = cg.id
    WHERE g.estado = 'aprobado'
      AND g.updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

    UNION ALL

    -- Tickets críticos
    SELECT
        ts.comunidad_id,
        'ticket_critico' as tipo_notificacion,
        CONCAT('Ticket crítico - ', ts.titulo) as titulo,
        CONCAT('Nuevo ticket de soporte crítico: ', LEFT(ts.descripcion, 100), '...') as mensaje,
        DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
        ts.id as referencia_id,
        'danger' as severidad
    FROM ticket_soporte ts
    WHERE ts.prioridad = 'critica'
      AND ts.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)
) notificaciones
ORDER BY comunidad_id, fecha_notificacion DESC, orden_severidad ASC;

// ========================================================================================
// 11. VISTA: dashboard_metricas_adicionales
// Métricas adicionales para estadísticas del dashboard
// ========================================================================================

CREATE OR REPLACE VIEW dashboard_metricas_adicionales AS
SELECT
    c.id as comunidad_id,
    c.nombre as comunidad,

    -- Efectividad de cobranza
    ROUND(
        (SELECT (COUNT(CASE WHEN ccu.saldo = 0 THEN 1 END) * 100.0) / COUNT(*)
         FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido'
         AND YEAR(egc.periodo) = YEAR(CURRENT_DATE) AND MONTH(egc.periodo) = MONTH(CURRENT_DATE)), 2
    ) as efectividad_cobranza,

    -- Ahorro generado vs presupuesto
    (SELECT COALESCE(p.monto_presupuestado, 0) - COALESCE(SUM(g.monto), 0)
     FROM presupuesto_mensual p
     LEFT JOIN gasto g ON p.categoria_id = g.categoria_id
         AND YEAR(g.fecha) = YEAR(CURRENT_DATE) AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
         AND g.estado = 'aprobado'
     WHERE p.comunidad_id = c.id AND p.anio = YEAR(CURRENT_DATE) AND p.mes = MONTH(CURRENT_DATE)
     GROUP BY p.id LIMIT 1) as ahorro_generado,

    -- Consumo promedio por unidad
    (SELECT ROUND(AVG(cu.lectura_actual - cu.lectura_anterior), 2)
     FROM consumo_unidad cu
     WHERE cu.comunidad_id = c.id
       AND YEAR(cu.fecha_lectura) = YEAR(CURRENT_DATE)
       AND MONTH(cu.fecha_lectura) = MONTH(CURRENT_DATE)
       AND cu.estado = 'confirmado') as consumo_promedio_unidad,

    -- Tendencia de crecimiento de ingresos
    (SELECT ROUND(
        ((SUM(monto) - LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
         NULLIF(LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0)) * 100, 2
     ) FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado'
     GROUP BY YEAR(fecha), MONTH(fecha) ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC LIMIT 1) as crecimiento_ingresos,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE comunidad_id = c.id AND activa = 1) as total_unidades,

    -- Total amenidades
    (SELECT COUNT(*) FROM amenidad WHERE comunidad_id = c.id AND activa = 1) as total_amenidades,

    -- Tickets activos
    (SELECT COUNT(*) FROM ticket_soporte
     WHERE comunidad_id = c.id AND estado IN ('abierto', 'en_progreso')) as tickets_activos

FROM comunidad c;

// ========================================================================================
// ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
// ========================================================================================

-- Índices para mejorar rendimiento de las vistas del dashboard
CREATE INDEX idx_pago_comunidad_fecha_estado ON pago(comunidad_id, fecha, estado);
CREATE INDEX idx_gasto_comunidad_fecha_estado ON gasto(comunidad_id, fecha, estado);
CREATE INDEX idx_emision_comunidad_periodo_estado ON emision_gastos_comunes(comunidad_id, periodo, estado);
CREATE INDEX idx_cuenta_cobro_comunidad_saldo ON cuenta_cobro_unidad(comunidad_id, saldo);
CREATE INDEX idx_ticket_comunidad_estado_prioridad ON ticket_soporte(comunidad_id, estado, prioridad);
CREATE INDEX idx_reserva_comunidad_inicio_estado ON reserva_amenidad(comunidad_id, inicio, estado);
CREATE INDEX idx_consumo_comunidad_fecha_estado ON consumo_unidad(comunidad_id, fecha_lectura, estado);