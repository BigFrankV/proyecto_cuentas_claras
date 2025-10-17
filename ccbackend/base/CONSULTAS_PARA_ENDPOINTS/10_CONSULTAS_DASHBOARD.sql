-- ========================================================================================
-- CONSULTAS SQL PARA DASHBOARD - SISTEMA DE CUENTAS CLARAS
-- Fecha de revisión: 2025-10-15
-- ========================================================================================

/*
 * CONSULTAS PARA DASHBOARD PRINCIPAL
 */

-- ========================================================================================
-- 1. KPIs PRINCIPALES DEL DASHBOARD
-- ========================================================================================

-- KPI - SALDO TOTAL DE LA COMUNIDAD (Acumulado a la fecha del último registro)
-- NOTA: Requiere que las subconsultas de LAG operen sobre la misma granularidad.
WITH TransaccionesMensuales AS (
    SELECT
        DATE_FORMAT(fecha, '%Y-%m-01') AS periodo_mes,
        SUM(CASE WHEN source = 'pago' THEN monto ELSE -monto END) AS flujo_neto_mensual
    FROM (
        SELECT fecha, monto, 'pago' AS source FROM pago WHERE comunidad_id = ?1 AND estado = 'aplicado'
        UNION ALL
        SELECT fecha, monto, 'gasto' AS source FROM gasto WHERE comunidad_id = ?1 AND estado = 'aprobado'
    ) AS transacciones
    GROUP BY 1
    ORDER BY 1
),
SaldoAcumulado AS (
    SELECT
        periodo_mes,
        SUM(flujo_neto_mensual) OVER (ORDER BY periodo_mes) AS saldo_acumulado
    FROM TransaccionesMensuales
)
SELECT
    sa.saldo_acumulado AS saldo_total,
    ROUND(
        (sa.saldo_acumulado - LAG(sa.saldo_acumulado, 1, sa.saldo_acumulado) OVER (ORDER BY sa.periodo_mes)) /
        NULLIF(LAG(sa.saldo_acumulado, 1, sa.saldo_acumulado) OVER (ORDER BY sa.periodo_mes), 0) * 100, 2
    ) AS variacion_porcentual
FROM SaldoAcumulado sa
ORDER BY sa.periodo_mes DESC
LIMIT 1;

-- KPI - INGRESOS DEL MES ACTUAL
SELECT
    SUM(p.monto) AS ingresos_mes_actual,
    -- CORRECCIÓN: Se usa LAG sobre todos los periodos para calcular la variación
    ROUND(
        (SUM(p.monto) - LAG(SUM(p.monto)) OVER (ORDER BY YEAR(p.fecha), MONTH(p.fecha))) /
        NULLIF(LAG(SUM(p.monto)) OVER (ORDER BY YEAR(p.fecha), MONTH(p.fecha)), 0) * 100, 2
    ) AS variacion_porcentual
FROM pago p
WHERE p.comunidad_id = ?
  AND p.estado = 'aplicado'
  AND p.fecha >= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 1 MONTH) -- Optimizado para buscar 2 meses
GROUP BY YEAR(p.fecha), MONTH(p.fecha)
ORDER BY YEAR(p.fecha) DESC, MONTH(p.fecha) DESC
LIMIT 1;

-- KPI - GASTOS DEL MES ACTUAL
SELECT
    SUM(g.monto) AS gastos_mes_actual,
    -- CORRECCIÓN: Se usa LAG sobre todos los periodos para calcular la variación
    ROUND(
        (SUM(g.monto) - LAG(SUM(g.monto)) OVER (ORDER BY YEAR(g.fecha), MONTH(g.fecha))) /
        NULLIF(LAG(SUM(g.monto)) OVER (ORDER BY YEAR(g.fecha), MONTH(g.fecha)), 0) * 100, 2
    ) AS variacion_porcentual
FROM gasto g
WHERE g.comunidad_id = ?
  AND g.estado = 'aprobado'
  AND g.fecha >= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 1 MONTH) -- Optimizado para buscar 2 meses
GROUP BY YEAR(g.fecha), MONTH(g.fecha)
ORDER BY YEAR(g.fecha) DESC, MONTH(g.fecha) DESC
LIMIT 1;

-- KPI - TASA DE MOROSIDAD (Basado en la emisión vigente/última)
WITH EmisionesActuales AS (
    -- Obtener la última emisión (o la del mes actual si está emitida/cerrada)
    SELECT id, fecha_vencimiento, comunidad_id
    FROM emision_gastos_comunes
    WHERE comunidad_id = ?
      AND estado IN ('emitido', 'cerrado')
    ORDER BY fecha_vencimiento DESC
    LIMIT 2 -- Para calcular la variación
),
CalculoMorosidad AS (
    SELECT
        egc.fecha_vencimiento AS periodo_vencimiento,
        -- Total de unidades en esa emisión con saldo pendiente (morosas)
        COUNT(CASE WHEN ccu.saldo > 0 AND egc.fecha_vencimiento < CURRENT_DATE THEN 1 END) AS unidades_morosas,
        -- Total de cuentas emitidas
        COUNT(ccu.id) AS total_cuentas
    FROM cuenta_cobro_unidad ccu
    JOIN EmisionesActuales egc ON ccu.emision_id = egc.id
    WHERE egc.comunidad_id = ccu.comunidad_id
    GROUP BY egc.fecha_vencimiento
    ORDER BY egc.fecha_vencimiento
)
SELECT
    -- Cálculo de la tasa de morosidad actual (último periodo)
    ROUND(
        (cm.unidades_morosas * 100.0) / NULLIF(cm.total_cuentas, 0), 2
    ) AS tasa_morosidad_actual,
    -- Tasa de morosidad anterior (para fines de referencia)
    ROUND(
        (LAG(cm.unidades_morosas, 1, cm.unidades_morosas) OVER (ORDER BY cm.periodo_vencimiento) * 100.0) /
        NULLIF(LAG(cm.total_cuentas, 1, cm.total_cuentas) OVER (ORDER BY cm.periodo_vencimiento), 0), 2
    ) AS tasa_morosidad_anterior,
    -- Variación porcentual
    ROUND(
        (
            (cm.unidades_morosas * 100.0 / NULLIF(cm.total_cuentas, 0)) -
            (LAG(cm.unidades_morosas, 1, cm.unidades_morosas) OVER (ORDER BY cm.periodo_vencimiento) * 100.0 /
            NULLIF(LAG(cm.total_cuentas, 1, cm.total_cuentas) OVER (ORDER BY cm.periodo_vencimiento), 0))
        ), 2
    ) AS variacion_porcentual
FROM CalculoMorosidad cm
ORDER BY cm.periodo_vencimiento DESC
LIMIT 1;

-- ========================================================================================
-- 2. DATOS PARA GRÁFICOS
-- ========================================================================================

-- GRÁFICO - TENDENCIA DE EMISIONES (Últimos 6 meses)
SELECT
    egc.periodo AS periodo, -- CORRECCIÓN: Usar campo 'periodo' (YYYY-MM)
    YEAR(STR_TO_DATE(CONCAT(egc.periodo, '-01'), '%Y-%m-%d')) AS anio,
    MONTH(STR_TO_DATE(CONCAT(egc.periodo, '-01'), '%Y-%m-%d')) AS mes,
    SUM(ccu.monto_total) AS monto_total_emisiones, -- CORRECCIÓN: Sumar ccu.monto_total
    COUNT(DISTINCT ccu.unidad_id) AS cantidad_unidades,
    AVG(ccu.monto_total) AS monto_promedio_por_unidad -- Se simplifica el promedio
FROM emision_gastos_comunes egc
JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.comunidad_id = ?
  AND egc.estado = 'emitido' -- O 'cerrado'
  AND egc.periodo >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH), '%Y-%m') -- Filtro SARGABLE
GROUP BY egc.periodo
ORDER BY egc.periodo;

-- GRÁFICO - ESTADO DE PAGOS (Distribución actual)
SELECT
    CASE
        WHEN ccu.saldo = 0 THEN 'Pagos al Día'
        WHEN ccu.saldo > 0 AND egc.fecha_vencimiento >= CURRENT_DATE THEN 'Pendiente' -- Se añade un estado 'Pendiente' no moroso
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
        ELSE 'Morosos +60 días'
    END AS categoria_pago,
    COUNT(*) AS cantidad_unidades,
    ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER (), 2) AS porcentaje,
    SUM(ccu.saldo) AS monto_total_pendiente
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = ?
  AND egc.estado IN ('emitido', 'cerrado')
GROUP BY 1
ORDER BY
    CASE
        WHEN categoria_pago = 'Pagos al Día' THEN 1
        WHEN categoria_pago = 'Pendiente' THEN 2
        WHEN categoria_pago = 'Atrasados 1-30 días' THEN 3
        WHEN categoria_pago = 'Atrasados 31-60 días' THEN 4
        ELSE 5
    END;

-- GRÁFICO - GASTOS POR CATEGORÍA (Mes actual)
SELECT
    cg.nombre AS categoria,
    cg.tipo AS tipo_categoria,
    SUM(g.monto) AS total_gastos,
    ROUND((SUM(g.monto) * 100.0) / SUM(SUM(g.monto)) OVER (), 2) AS porcentaje_del_total,
    COUNT(g.id) AS cantidad_gastos
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ?
  AND g.estado = 'aprobado'
  AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
GROUP BY cg.id, cg.nombre, cg.tipo
ORDER BY total_gastos DESC;

-- GRÁFICO - CONSUMOS DE MEDIDORES (Mes actual)
-- CORRECCIÓN: No existe la tabla 'consumo_unidad'. Esta consulta NO ES IMPLEMENTABLE.
SELECT
    'N/A' AS medidor,
    'N/A' AS tipo_medidor,
    NULL AS consumo,
    NULL AS monto_calculado,
    DATE_FORMAT(CURRENT_DATE, '%Y-%m') AS periodo,
    'unidades' AS unidad_medida
FROM DUAL WHERE 1=0; -- Consulta de fallback/dummy

-- ========================================================================================
-- 3. TABLAS DE DATOS DEL DASHBOARD
-- ========================================================================================

-- PAGOS RECIENTES (Últimos 10 pagos)
SELECT
    p.id,
    u.codigo AS unidad,
    CONCAT(pe.nombres, ' ', pe.apellidos) AS propietario,
    p.monto,
    DATE_FORMAT(p.fecha, '%d/%m/%Y') AS fecha_pago,
    p.estado,
    p.referencia AS referencia_pago, -- CORRECCIÓN: Usar p.referencia
    CASE
        WHEN p.estado = 'aplicado' THEN 'Conciliado'
        WHEN p.estado = 'pendiente' THEN 'Pendiente'
        ELSE 'Rechazado' -- 'reversado'
    END AS estado_descripcion,
    DATEDIFF(CURRENT_DATE, p.fecha) AS dias_desde_pago
FROM pago p
JOIN unidad u ON p.unidad_id = u.id
-- Sugerir índice: titulares_unidad(unidad_id, tipo, hasta)
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
WHERE p.comunidad_id = ?
ORDER BY p.fecha DESC, p.created_at DESC
LIMIT 10;

-- UNIDADES CON MOROSIDAD (Top 10 más morosas)
SELECT
    u.id AS unidad_id,
    u.codigo AS codigo_unidad,
    CONCAT(pe.nombres, ' ', pe.apellidos) AS propietario,
    COUNT(DISTINCT ccu.emision_id) AS meses_morosos, -- Usar emision_id para contar periodos
    SUM(ccu.saldo) AS deuda_total,
    MAX(DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento)) AS dias_maximo_atraso,
    AVG(ccu.saldo) AS deuda_promedio,
    -- CORRECCIÓN: Usar GROUP_CONCAT(egc.periodo) ya que la fecha de emisión no existe
    GROUP_CONCAT(egc.periodo ORDER BY egc.periodo DESC SEPARATOR ', ') AS periodos_pendientes
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
-- Sugerir índice: titulares_unidad(unidad_id, tipo, hasta)
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
WHERE ccu.comunidad_id = ?
  AND egc.estado IN ('emitido', 'cerrado')
  AND ccu.saldo > 0
  AND egc.fecha_vencimiento < CURRENT_DATE
GROUP BY u.id, u.codigo, pe.nombres, pe.apellidos
ORDER BY deuda_total DESC, dias_maximo_atraso DESC
LIMIT 10;

-- PRÓXIMAS ACTIVIDADES (Eventos próximos)
-- CORRECCIÓN: La mayoría de las tablas son inexistentes. Solo se incluye la EMISION.
SELECT
    'emision' AS tipo_actividad,
    CONCAT('Emisión de Gastos - ', egc.periodo) AS titulo,
    CONCAT('Vencimiento de cargos para el período ', egc.periodo) AS descripcion,
    DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS fecha_programada,
    DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y') AS fecha_formateada,
    egc.estado,
    CASE
        WHEN egc.fecha_vencimiento < CURRENT_DATE THEN 'vencida'
        WHEN egc.fecha_vencimiento = CURRENT_DATE THEN 'hoy'
        ELSE 'programada'
    END AS estado_relativo,
    DATEDIFF(egc.fecha_vencimiento, CURRENT_DATE) AS dias_restantes
FROM emision_gastos_comunes egc
WHERE egc.comunidad_id = ?
  AND egc.fecha_vencimiento >= CURRENT_DATE
  AND egc.estado = 'emitido' -- Se asume que emitido es programado
-- El resto de las uniones (mantenimiento_programado, reunion) NO SON IMPLEMENTABLES.

ORDER BY fecha_programada ASC
LIMIT 8;

-- RESERVAS DE AMENIDADES (Próximas reservas)
SELECT
    ra.id,
    a.nombre AS amenidad,
    a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') AS fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') AS fecha_fin,
    ra.estado,
    u.codigo AS unidad_reserva,
    CONCAT(p.nombres, ' ', p.apellidos) AS reservado_por,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) AS horas_reserva,
    TIMESTAMPDIFF(DAY, CURRENT_DATE, DATE(ra.inicio)) AS dias_para_reserva,
    CASE
        WHEN ra.estado = 'cumplida' THEN 'Completada'
        WHEN ra.estado = 'aprobada' THEN 'Confirmada'
        WHEN ra.estado = 'solicitada' THEN 'Pendiente'
        ELSE 'Cancelada'
    END AS estado_descripcion
FROM reserva_amenidad ra
JOIN amenidad a ON ra.amenidad_id = a.id
JOIN unidad u ON ra.unidad_id = u.id
JOIN persona p ON ra.persona_id = p.id
WHERE ra.comunidad_id = ?
  AND ra.inicio >= CURRENT_DATE
  AND ra.estado IN ('aprobada', 'solicitada')
ORDER BY ra.inicio ASC
LIMIT 6;

-- ========================================================================================
-- 4. NOTIFICACIONES DEL DASHBOARD
-- ========================================================================================

-- NOTIFICACIONES - PAGOS VENCIDOS (Últimas 24 horas)
SELECT
    'pago_vencido' AS tipo_notificacion,
    CONCAT('Pago vencido - Unidad ', u.codigo) AS titulo,
    CONCAT('La unidad ', u.codigo, ' tiene un saldo pendiente de $', FORMAT(ccu.saldo, 0), ' desde el ', DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y')) AS mensaje,
    DATE_FORMAT(ccu.updated_at, '%d/%m/%Y %H:%i') AS fecha_notificacion,
    ccu.id AS referencia_id,
    'warning' AS severidad
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
WHERE ccu.comunidad_id = ?
  AND egc.estado IN ('emitido', 'cerrado')
  AND ccu.saldo > 0
  AND egc.fecha_vencimiento < CURRENT_DATE
  AND ccu.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) -- CORRECCIÓN: Usar NOW() para la hora exacta

UNION ALL

-- NOTIFICACIONES - NUEVOS PAGOS REGISTRADOS
SELECT
    'pago_registrado' AS tipo_notificacion,
    CONCAT('Nuevo pago registrado - Unidad ', u.codigo) AS titulo,
    CONCAT('Se registró un pago de $', FORMAT(p.monto, 0), ' para la unidad ', u.codigo) AS mensaje,
    DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i') AS fecha_notificacion,
    p.id AS referencia_id,
    'success' AS severidad
FROM pago p
JOIN unidad u ON p.unidad_id = u.id
WHERE p.comunidad_id = ?
  AND p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) -- CORRECCIÓN: Usar NOW()

UNION ALL

-- NOTIFICACIONES - GASTOS APROBADOS
SELECT
    'gasto_aprobado' AS tipo_notificacion,
    CONCAT('Gasto aprobado - ', cg.nombre) AS titulo,
    CONCAT('Se aprobó un gasto de $', FORMAT(g.monto, 0), ' en la categoría ', cg.nombre) AS mensaje,
    DATE_FORMAT(g.updated_at, '%d/%m/%Y %H:%i') AS fecha_notificacion,
    g.id AS referencia_id,
    'info' AS severidad
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ?
  AND g.estado = 'aprobado'
  AND g.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) -- CORRECCIÓN: Usar NOW()

UNION ALL

-- NOTIFICACIONES - TICKETS DE SOPORTE CRÍTICOS
SELECT
    'ticket_critico' AS tipo_notificacion,
    CONCAT('Ticket crítico - ', ts.titulo) AS titulo,
    CONCAT('Nuevo ticket de soporte crítico: ', LEFT(ts.descripcion, 100), '...') AS mensaje,
    DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') AS fecha_notificacion,
    ts.id AS referencia_id,
    'danger' AS severidad
FROM ticket_soporte ts
WHERE ts.comunidad_id = ?
  AND ts.prioridad = 'alta' -- CORRECCIÓN: 'critica' no existe en el ENUM, se usa 'alta'
  AND ts.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) -- CORRECCIÓN: Usar NOW()

ORDER BY fecha_notificacion DESC
LIMIT 10;

-- ========================================================================================
-- 5. MÉTRICAS ADICIONALES PARA DASHBOARD
-- ========================================================================================

-- MÉTRICA - EFECTIVIDAD DE COBRANZA (Mes actual)
SELECT
    ROUND(
        (SUM(CASE WHEN ccu.saldo = 0 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0), 2
    ) AS efectividad_cobranza,
    COUNT(CASE WHEN ccu.saldo = 0 THEN 1 END) AS unidades_al_dia,
    COUNT(*) AS total_unidades,
    SUM(ccu.monto_total) AS total_emitido,
    SUM(ccu.saldo) AS total_pendiente
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = ?
  AND egc.estado IN ('emitido', 'cerrado')
  AND egc.periodo = DATE_FORMAT(CURRENT_DATE, '%Y-%m'); -- Filtro SARGABLE

-- MÉTRICA - AHORRO GENERADO (Comparación con presupuesto)
-- CORRECCIÓN: No existe la tabla 'presupuesto_mensual'. Esta consulta NO ES IMPLEMENTABLE.
SELECT
    0.00 AS presupuesto_mensual,
    COALESCE(SUM(g.monto), 0) AS gastos_reales,
    (0.00 - COALESCE(SUM(g.monto), 0)) AS ahorro_generado,
    0.00 AS porcentaje_ahorro -- No calculable sin presupuesto
FROM gasto g
WHERE g.comunidad_id = ?
    AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
    AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
    AND g.estado = 'aprobado';

-- MÉTRICA - CONSUMO PROMEDIO POR UNIDAD
-- CORRECCIÓN: No existe la tabla 'consumo_unidad'. Esta consulta NO ES IMPLEMENTABLE.
SELECT
    NULL AS consumo_promedio,
    m.tipo, -- CORRECCIÓN: Usar m.tipo
    COUNT(DISTINCT m.unidad_id) AS unidades_con_medidor,
    NULL AS consumo_total,
    CASE m.tipo
        WHEN 'agua' THEN 'L'
        WHEN 'electricidad' THEN 'kWh'
        WHEN 'gas' THEN 'm³'
        ELSE 'unidades'
    END AS unidad_medida
FROM medidor m
WHERE m.comunidad_id = ?
GROUP BY m.tipo;

-- MÉTRICA - TENDENCIA DE CRECIMIENTO DE INGRESOS
SELECT
    t.periodo_actual,
    t.ingresos_actual,
    t.ingresos_anterior,
    ROUND(
        (t.ingresos_actual - t.ingresos_anterior) / NULLIF(t.ingresos_anterior, 0) * 100, 2
    ) AS crecimiento_porcentual
FROM (
    SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS periodo_actual,
        SUM(monto) AS ingresos_actual,
        LAG(SUM(monto)) OVER (ORDER BY DATE_FORMAT(fecha, '%Y-%m')) AS ingresos_anterior
    FROM pago
    WHERE comunidad_id = ?
      AND estado = 'aplicado'
      AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 13 MONTH) -- Se extiende el rango para asegurar la comparación
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
    ORDER BY periodo_actual DESC
    LIMIT 1
) AS t;