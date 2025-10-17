-- ========================================================================================
-- VISTAS OPTIMIZADAS PARA DASHBOARD - SISTEMA DE CUENTAS CLARAS
-- NOTA: Varias vistas (5, 8, 11) se han simplificado o eliminado por falta de tablas
-- como 'presupuesto_mensual', 'consumo_unidad', 'mantenimiento_programado' y 'reunion'.
-- ========================================================================================

-- ========================================================================================
-- 1. VISTA: dashboard_kpis_principales
-- KPIs principales mostrados en la parte superior del dashboard
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_kpis_principales AS
SELECT
    c.id AS comunidad_id,
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
    ROUND((k.unidades_al_dia * 100.0) / NULLIF(k.total_unidades_activas, 0), 2) AS efectividad_cobranza
FROM comunidad c
LEFT JOIN (
    SELECT
        c_sub.id AS comunidad_id,
        -- Saldo Total y Variación (Calculado sobre el último periodo registrado)
        saldo_neto_acumulado.saldo_total,
        saldo_neto_acumulado.variacion_saldo_porcentual,
        -- Ingresos del Mes Actual y Variación
        ingresos_mes.ingresos_mes_actual,
        ingresos_mes.variacion_ingresos_porcentual,
        -- Gastos del Mes Actual y Variación
        gastos_mes.gastos_mes_actual,
        gastos_mes.variacion_gastos_porcentual,
        -- Tasa de Morosidad y Variación (Última emisión válida)
        morosidad.tasa_morosidad_actual,
        morosidad.variacion_morosidad_porcentual,
        -- Totales
        (SELECT COUNT(*) FROM unidad WHERE comunidad_id = c_sub.id AND activa = 1) AS total_unidades_activas,
        (SELECT COUNT(DISTINCT ccu.unidad_id)
         FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c_sub.id AND egc.estado = 'emitido' AND ccu.saldo = 0) AS unidades_al_dia

    FROM comunidad c_sub
    -- Subconsulta de Saldo
    LEFT JOIN (
        SELECT
            t.comunidad_id,
            t.saldo_acumulado AS saldo_total,
            ROUND((t.saldo_acumulado - LAG(t.saldo_acumulado, 1, t.saldo_acumulado) OVER (ORDER BY t.periodo_mes)) /
                  NULLIF(LAG(t.saldo_acumulado, 1, t.saldo_acumulado) OVER (ORDER BY t.periodo_mes), 0) * 100, 2
            ) AS variacion_saldo_porcentual
        FROM (
            SELECT
                comunidad_id,
                DATE_FORMAT(fecha, '%Y-%m-01') AS periodo_mes,
                SUM(CASE WHEN monto > 0 THEN monto ELSE -monto END) AS flujo_neto_mensual,
                SUM(SUM(CASE WHEN monto > 0 THEN monto ELSE -monto END)) OVER (PARTITION BY comunidad_id ORDER BY DATE_FORMAT(fecha, '%Y-%m-01')) AS saldo_acumulado
            FROM (
                SELECT comunidad_id, fecha, monto FROM pago WHERE estado = 'aplicado'
                UNION ALL
                SELECT comunidad_id, fecha, -monto FROM gasto WHERE estado = 'aprobado'
            ) AS transacciones
            GROUP BY comunidad_id, periodo_mes
            ORDER BY comunidad_id, periodo_mes DESC
            LIMIT 1000 -- Límite para evitar sobrecarga en la vista
        ) AS t
        ORDER BY t.periodo_mes DESC
        LIMIT 1 -- Solo el último periodo
    ) AS saldo_neto_acumulado ON c_sub.id = saldo_neto_acumulado.comunidad_id

    -- Subconsulta de Ingresos del Mes
    LEFT JOIN (
        SELECT
            comunidad_id,
            SUM(monto) AS ingresos_mes_actual,
            ROUND(
                (SUM(monto) - LAG(SUM(monto), 1, SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
                NULLIF(LAG(SUM(monto), 1, SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0) * 100, 2
            ) AS variacion_ingresos_porcentual
        FROM pago
        WHERE estado = 'aplicado'
        GROUP BY comunidad_id, YEAR(fecha), MONTH(fecha)
        ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC
        LIMIT 1
    ) AS ingresos_mes ON c_sub.id = ingresos_mes.comunidad_id

    -- Subconsulta de Gastos del Mes
    LEFT JOIN (
        SELECT
            comunidad_id,
            SUM(monto) AS gastos_mes_actual,
            ROUND(
                (SUM(monto) - LAG(SUM(monto), 1, SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
                NULLIF(LAG(SUM(monto), 1, SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0) * 100, 2
            ) AS variacion_gastos_porcentual
        FROM gasto
        WHERE estado = 'aprobado'
        GROUP BY comunidad_id, YEAR(fecha), MONTH(fecha)
        ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC
        LIMIT 1
    ) AS gastos_mes ON c_sub.id = gastos_mes.comunidad_id

    -- Subconsulta de Morosidad
    LEFT JOIN (
        SELECT
            ccu_sub.comunidad_id,
            t.tasa_morosidad_actual,
            ROUND(
                t.tasa_morosidad_actual - LAG(t.tasa_morosidad_actual, 1, t.tasa_morosidad_actual) OVER (ORDER BY t.periodo), 2
            ) AS variacion_morosidad_porcentual
        FROM (
            SELECT
                ccu.comunidad_id,
                egc.periodo,
                (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / NULLIF(COUNT(ccu.id), 0) AS tasa_morosidad_actual
            FROM cuenta_cobro_unidad ccu
            JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
            WHERE egc.estado = 'emitido'
            GROUP BY ccu.comunidad_id, egc.periodo
        ) AS t
        JOIN cuenta_cobro_unidad ccu_sub ON t.comunidad_id = ccu_sub.comunidad_id
        GROUP BY ccu_sub.comunidad_id
        ORDER BY t.periodo DESC
        LIMIT 1
    ) AS morosidad ON c_sub.id = morosidad.comunidad_id

    GROUP BY c_sub.id -- Agrupar por el ID de comunidad
) AS k ON c.id = k.comunidad_id;

-- ========================================================================================
-- 2. VISTA: dashboard_tendencias_emisiones
-- Datos para el gráfico de tendencias de emisiones (últimos 6 meses)
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_tendencias_emisiones AS
SELECT
    egc.comunidad_id,
    egc.periodo,
    YEAR(STR_TO_DATE(CONCAT(egc.periodo, '-01'), '%Y-%m-%d')) AS anio,
    MONTH(STR_TO_DATE(CONCAT(egc.periodo, '-01'), '%Y-%m-%d')) AS mes,
    SUM(ccu.monto_total) AS monto_total_emisiones,
    COUNT(DISTINCT ccu.unidad_id) AS cantidad_unidades,
    -- CORRECCIÓN: AVG debe ser sobre ccu.monto_total, no sobre egc.monto_total (que no existe)
    ROUND(AVG(ccu.monto_total), 2) AS monto_promedio_por_unidad,
    ROUND(
        ((SUM(ccu.monto_total) - LAG(SUM(ccu.monto_total)) OVER (PARTITION BY egc.comunidad_id ORDER BY egc.periodo)) /
         NULLIF(LAG(SUM(ccu.monto_total)) OVER (PARTITION BY egc.comunidad_id ORDER BY egc.periodo), 0)) * 100, 2
    ) AS variacion_porcentual
FROM emision_gastos_comunes egc
JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.estado = 'emitido'
  AND egc.periodo >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH), '%Y-%m') -- Filtro SARGABLE
GROUP BY egc.comunidad_id, egc.periodo
ORDER BY egc.comunidad_id, egc.periodo;

-- ========================================================================================
-- 3. VISTA: dashboard_estado_pagos
-- Distribución del estado de pagos para gráfico circular
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_estado_pagos AS
SELECT
    ccu.comunidad_id,
    CASE
        WHEN ccu.saldo = 0 THEN 'Pagos al Día'
        -- Incluir 'Pendiente' no moroso, asumiendo fecha_vencimiento > CURRENT_DATE y saldo > 0
        WHEN ccu.saldo > 0 AND egc.fecha_vencimiento >= CURRENT_DATE THEN 'Pendiente'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
        ELSE 'Morosos +60 días'
    END AS categoria_pago,
    COUNT(*) AS cantidad_unidades,
    ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER (PARTITION BY ccu.comunidad_id), 2) AS porcentaje,
    SUM(ccu.saldo) AS monto_total_pendiente,
    CASE
        WHEN ccu.saldo = 0 THEN 1
        WHEN ccu.saldo > 0 AND egc.fecha_vencimiento >= CURRENT_DATE THEN 2 -- Nuevo estado: Pendiente
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 3
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 4
        ELSE 5
    END AS orden_categoria
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE egc.estado = 'emitido'
GROUP BY ccu.comunidad_id, egc.fecha_vencimiento, ccu.saldo
ORDER BY ccu.comunidad_id, orden_categoria;

-- ========================================================================================
-- 4. VISTA: dashboard_gastos_categoria
-- Gastos agrupados por categoría para gráfico de barras
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_gastos_categoria AS
SELECT
    g.comunidad_id,
    cg.nombre AS categoria,
    cg.tipo AS tipo_categoria,
    SUM(g.monto) AS total_gastos,
    ROUND((SUM(g.monto) * 100.0) / SUM(SUM(g.monto)) OVER (PARTITION BY g.comunidad_id), 2) AS porcentaje_del_total,
    COUNT(g.id) AS cantidad_gastos,
    MAX(g.fecha) AS ultimo_gasto
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.estado = 'aprobado'
  AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
GROUP BY g.comunidad_id, cg.id, cg.nombre, cg.tipo
ORDER BY g.comunidad_id, total_gastos DESC;

-- ========================================================================================
-- 5. VISTA: dashboard_consumos_medidores (NO IMPLEMENTABLE POR TABLAS)
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_consumos_medidores AS
SELECT
    m.comunidad_id,
    m.codigo AS medidor, -- CORRECCIÓN: Usar m.codigo
    m.tipo, -- CORRECCIÓN: Usar m.tipo
    lm.lectura AS consumo, -- CORRECCIÓN: Proxy de consumo (usando lectura actual)
    NULL AS monto_calculado, -- COLUMNA INEXISTENTE
    DATE_FORMAT(lm.fecha, '%Y-%m') AS periodo, -- CORRECCIÓN: Usar lm.fecha
    CASE m.tipo
        WHEN 'agua' THEN 'L'
        WHEN 'electricidad' THEN 'kWh'
        WHEN 'gas' THEN 'm³'
        ELSE 'unidades'
    END AS unidad_medida,
    NULL AS consumo_diario_promedio -- CÁLCULO IMPOSIBLE SIN LECTURA ANTERIOR
FROM medidor m
LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
WHERE YEAR(lm.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(lm.fecha) = MONTH(CURRENT_DATE)
  AND m.es_compartido = 0 -- Filtrar por medidores no compartidos para consumo individual
ORDER BY m.comunidad_id, consumo DESC;

-- ========================================================================================
-- 6. VISTA: dashboard_pagos_recientes
-- Últimos pagos registrados para tabla del dashboard
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_pagos_recientes AS
SELECT
    p.comunidad_id,
    p.id,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    CONCAT(pe.nombres, ' ', pe.apellidos) AS propietario,
    p.monto,
    DATE_FORMAT(p.fecha, '%d/%m/%Y') AS fecha_pago,
    p.estado,
    p.referencia AS referencia_pago, -- CORRECCIÓN: Usar p.referencia
    CASE
        WHEN p.estado = 'aplicado' THEN 'Conciliado'
        WHEN p.estado = 'pendiente' THEN 'Pendiente'
        ELSE 'Rechazado'
    END AS estado_descripcion,
    DATEDIFF(CURRENT_DATE, p.fecha) AS dias_desde_pago,
    p.created_at AS fecha_registro
FROM pago p
JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
    AND tu.tipo = 'propietario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
ORDER BY p.comunidad_id, p.fecha DESC, p.created_at DESC;

-- ========================================================================================
-- 7. VISTA: dashboard_unidades_morosas
-- Unidades con morosidad para tabla del dashboard
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_unidades_morosas AS
SELECT
    ccu.comunidad_id,
    u.id AS unidad_id,
    u.codigo AS codigo_unidad, -- CORRECCIÓN: Usar u.codigo
    CONCAT(pe.nombres, ' ', pe.apellidos) AS propietario,
    COUNT(DISTINCT egc.id) AS meses_morosos,
    SUM(ccu.saldo) AS deuda_total,
    MAX(DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento)) AS dias_maximo_atraso,
    ROUND(AVG(ccu.saldo), 2) AS deuda_promedio,
    GROUP_CONCAT(egc.periodo ORDER BY egc.periodo DESC SEPARATOR ', ') AS periodos_pendientes,
    MAX(egc.fecha_vencimiento) AS ultimo_vencimiento
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

-- ========================================================================================
-- 8. VISTA: dashboard_actividades_proximas (SIMULADO - Tablas no existen)
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_actividades_proximas AS
SELECT
    egc.comunidad_id,
    'emision' AS tipo_actividad,
    CONCAT('Emisión de Vencimiento - ', egc.periodo) AS titulo,
    DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS fecha_programada,
    DATEDIFF(egc.fecha_vencimiento, CURRENT_DATE) AS dias_restantes,
    1 AS prioridad_orden
FROM emision_gastos_comunes egc
WHERE egc.estado = 'emitido'
  AND egc.fecha_vencimiento >= CURRENT_DATE
UNION ALL
-- SIMULACIÓN DE RESERVAS DE AMENIDADES PENDIENTES
SELECT
    ra.comunidad_id,
    'reserva_amenidad' AS tipo_actividad,
    CONCAT('Reserva: ', a.nombre) AS titulo,
    DATE_FORMAT(ra.inicio, '%Y-%m-%d') AS fecha_programada,
    DATEDIFF(ra.inicio, CURRENT_DATE) AS dias_restantes,
    2 AS prioridad_orden
FROM reserva_amenidad ra
JOIN amenidad a ON ra.amenidad_id = a.id
WHERE ra.estado = 'solicitada' AND ra.inicio >= CURRENT_DATE
ORDER BY comunidad_id, fecha_programada ASC;

-- ========================================================================================
-- 9. VISTA: dashboard_reservas_proximas
-- Próximas reservas de amenidades
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_reservas_proximas AS
SELECT
    ra.comunidad_id,
    ra.id,
    a.nombre AS amenidad,
    a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') AS fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') AS fecha_fin,
    ra.estado,
    u.codigo AS unidad_reserva, -- CORRECCIÓN: Usar u.codigo
    CONCAT(p.nombres, ' ', p.apellidos) AS reservado_por,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) AS horas_reserva,
    TIMESTAMPDIFF(DAY, CURRENT_DATE, DATE(ra.inicio)) AS dias_para_reserva,
    CASE
        WHEN ra.estado = 'cumplida' THEN 'Completada'
        WHEN ra.estado = 'aprobada' THEN 'Confirmada'
        WHEN ra.estado = 'solicitada' THEN 'Pendiente'
        ELSE 'Cancelada'
    END AS estado_descripcion,
    CASE ra.estado
        WHEN 'aprobada' THEN 1
        WHEN 'solicitada' THEN 2
        WHEN 'cumplida' THEN 3
        ELSE 4
    END AS orden_estado
FROM reserva_amenidad ra
JOIN amenidad a ON ra.amenidad_id = a.id
JOIN unidad u ON ra.unidad_id = u.id
JOIN persona p ON ra.persona_id = p.id
WHERE ra.inicio >= CURRENT_DATE
  AND ra.estado IN ('aprobada', 'solicitada')
ORDER BY ra.comunidad_id, ra.inicio ASC, orden_estado ASC;

-- ========================================================================================
-- 10. VISTA: dashboard_notificaciones (SIMPLIFICADA)
-- Notificaciones recientes para el dashboard
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_notificaciones AS
SELECT
    n.comunidad_id,
    n.tipo AS tipo_notificacion,
    n.titulo AS titulo,
    n.mensaje AS mensaje,
    n.fecha_creacion AS fecha_notificacion,
    n.id AS referencia_id,
    CASE n.tipo -- Proxy de severidad basado en tipo
        WHEN 'alerta' THEN 'danger'
        WHEN 'recordatorio' THEN 'warning'
        ELSE 'info'
    END AS severidad
FROM notificacion_usuario n -- CORRECCIÓN: Usar tabla real
WHERE n.fecha_creacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY n.comunidad_id, n.fecha_creacion DESC;

-- ========================================================================================
-- 11. VISTA: dashboard_metricas_adicionales (SIMPLIFICADA/AJUSTADA)
-- Métricas adicionales para estadísticas del dashboard
-- ========================================================================================

CREATE OR REPLACE VIEW dashboard_metricas_adicionales AS
SELECT
    c.id AS comunidad_id,
    c.razon_social AS comunidad, -- CORRECCIÓN: Usar razon_social
    -- Efectividad de cobranza
    ROUND(
        (SELECT (COUNT(CASE WHEN ccu.saldo = 0 THEN 1 END) * 100.0) / NULLIF(COUNT(ccu.id), 0)
         FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido'
         AND YEAR(egc.periodo) = YEAR(CURRENT_DATE) AND MONTH(egc.periodo) = MONTH(CURRENT_DATE)), 2
    ) AS efectividad_cobranza,

    -- Ahorro generado vs presupuesto (NO IMPLEMENTABLE)
    NULL AS ahorro_generado,

    -- Consumo promedio por unidad (NO IMPLEMENTABLE - proxy de lectura)
    (SELECT ROUND(AVG(lm.lectura), 2)
     FROM medidor m JOIN lectura_medidor lm ON m.id = lm.medidor_id
     WHERE m.comunidad_id = c.id
       AND YEAR(lm.fecha) = YEAR(CURRENT_DATE) AND MONTH(lm.fecha) = MONTH(CURRENT_DATE)) AS consumo_promedio_unidad,

    -- Tendencia de crecimiento de ingresos
    (SELECT ROUND(
        ((SUM(monto) - LAG(SUM(monto), 1, SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
         NULLIF(LAG(SUM(monto), 1, SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0)) * 100, 2
     ) FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado'
     GROUP BY YEAR(fecha), MONTH(fecha) ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC LIMIT 1) AS crecimiento_ingresos,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE comunidad_id = c.id AND activa = 1) AS total_unidades,

    -- Total amenidades
    (SELECT COUNT(*) FROM amenidad WHERE comunidad_id = c.id) AS total_amenidades,

    -- Tickets activos
    (SELECT COUNT(*) FROM ticket_soporte
     WHERE comunidad_id = c.id AND estado IN ('abierto', 'en_progreso')) AS tickets_activos

FROM comunidad c;