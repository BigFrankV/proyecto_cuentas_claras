-- ========================================================================================
-- REPORTES Y ANALÍTICA - QUERIES SQL COMPLETAS
-- Sistema de Cuentas Claras
-- ========================================================================================

-- ========================================================================================
-- 1. REPORTES FINANCIEROS
-- ========================================================================================

-- 1.1 Resumen Financiero Mensual por Comunidad
-- Obtiene ingresos, gastos y saldo por mes para una comunidad específica
SELECT
    DATE_FORMAT(p.fecha, '%Y-%m') as periodo,
    YEAR(p.fecha) as anio,
    MONTH(p.fecha) as mes,
    SUM(p.monto) as ingresos_totales,
    0 as gastos_totales, -- Se calcula en consulta separada
    SUM(p.monto) as saldo,
    COUNT(DISTINCT p.unidad_id) as unidades_pagadoras,
    COUNT(p.id) as total_pagos
FROM pago p
WHERE p.comunidad_id = ? AND p.estado = 'aplicado'
    AND p.fecha BETWEEN ? AND ?
GROUP BY DATE_FORMAT(p.fecha, '%Y-%m'), YEAR(p.fecha), MONTH(p.fecha)
ORDER BY periodo DESC;

-- 1.2 Gastos Mensuales por Comunidad
-- Obtiene gastos agrupados por mes y categoría
SELECT
    DATE_FORMAT(g.fecha, '%Y-%m') as periodo,
    YEAR(g.fecha) as anio,
    MONTH(g.fecha) as mes,
    cg.nombre as categoria,
    cg.tipo as tipo_categoria,
    SUM(g.monto) as total_gastos,
    COUNT(g.id) as cantidad_gastos,
    AVG(g.monto) as gasto_promedio
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ? AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ? AND ?
GROUP BY DATE_FORMAT(g.fecha, '%Y-%m'), YEAR(g.fecha), MONTH(g.fecha), cg.id, cg.nombre, cg.tipo
ORDER BY periodo DESC, total_gastos DESC;

-- 1.3 Balance General Mensual (Ingresos - Gastos)
-- Combina ingresos y gastos para obtener balance real
SELECT
    periodo,
    anio,
    mes,
    COALESCE(ingresos.ingresos_totales, 0) as ingresos,
    COALESCE(gastos.gastos_totales, 0) as gastos,
    COALESCE(ingresos.ingresos_totales, 0) - COALESCE(gastos.gastos_totales, 0) as saldo,
    COALESCE(ingresos.unidades_pagadoras, 0) as unidades_activas
FROM (
    SELECT DISTINCT DATE_FORMAT(fecha, '%Y-%m') as periodo,
           YEAR(fecha) as anio,
           MONTH(fecha) as mes
    FROM (
        SELECT fecha FROM pago WHERE comunidad_id = ? AND fecha BETWEEN ? AND ?
        UNION
        SELECT fecha FROM gasto WHERE comunidad_id = ? AND fecha BETWEEN ? AND ?
    ) fechas
) periodos
LEFT JOIN (
    SELECT DATE_FORMAT(fecha, '%Y-%m') as periodo, SUM(monto) as ingresos_totales, COUNT(DISTINCT unidad_id) as unidades_pagadoras
    FROM pago
    WHERE comunidad_id = ? AND estado = 'aplicado' AND fecha BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) ingresos ON periodos.periodo = ingresos.periodo
LEFT JOIN (
    SELECT DATE_FORMAT(fecha, '%Y-%m') as periodo, SUM(monto) as gastos_totales
    FROM gasto
    WHERE comunidad_id = ? AND estado = 'aprobado' AND fecha BETWEEN ? AND ?
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) gastos ON periodos.periodo = gastos.periodo
ORDER BY periodo DESC;

-- 1.4 KPIs Financieros del Mes Actual
SELECT
    -- Ingresos del mes actual
    (SELECT SUM(monto) FROM pago
     WHERE comunidad_id = ? AND estado = 'aplicado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes_actual,

    -- Gastos del mes actual
    (SELECT SUM(monto) FROM gasto
     WHERE comunidad_id = ? AND estado = 'aprobado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes_actual,

    -- Saldo actual (ingresos - gastos acumulados)
    ((SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = ? AND estado = 'aplicado') -
     (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado')) as saldo_actual,

    -- Porcentaje de morosidad (unidades con saldo pendiente / total unidades)
    (SELECT
        ROUND(
            (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*), 2
        )
     FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido') as porcentaje_morosidad,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE comunidad_id = ? AND activa = 1) as total_unidades,

    -- Unidades al día
    (SELECT COUNT(DISTINCT ccu.unidad_id)
     FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido' AND ccu.saldo = 0) as unidades_al_dia;

-- ========================================================================================
-- 2. REPORTES DE GASTOS DETALLADOS
-- ========================================================================================

-- 2.1 Gastos por Categoría con Detalles
SELECT
    g.id,
    g.numero,
    DATE_FORMAT(g.fecha, '%d/%m/%Y') as fecha,
    cg.nombre as categoria,
    cg.tipo as tipo_categoria,
    cc.nombre as centro_costo,
    g.monto,
    g.glosa,
    g.estado,
    p.razon_social as proveedor,
    dc.folio as documento_folio,
    dc.tipo_doc,
    u.username as creado_por,
    DATE_FORMAT(g.created_at, '%d/%m/%Y %H:%i') as fecha_creacion
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN usuario u ON g.creado_por = u.id
WHERE g.comunidad_id = ?
    AND g.fecha BETWEEN ? AND ?
    AND g.estado = 'aprobado'
ORDER BY g.fecha DESC, g.monto DESC;

-- 2.2 Resumen de Gastos por Centro de Costo
SELECT
    cc.nombre as centro_costo,
    cc.codigo,
    COUNT(g.id) as cantidad_gastos,
    SUM(g.monto) as total_gastos,
    AVG(g.monto) as gasto_promedio,
    MIN(g.fecha) as primer_gasto,
    MAX(g.fecha) as ultimo_gasto
FROM gasto g
JOIN centro_costo cc ON g.centro_costo_id = cc.id
WHERE g.comunidad_id = ? AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ? AND ?
GROUP BY cc.id, cc.nombre, cc.codigo
ORDER BY total_gastos DESC;

-- 2.3 Gastos por Tipo de Categoría
SELECT
    cg.tipo,
    COUNT(g.id) as cantidad_gastos,
    SUM(g.monto) as total_monto,
    ROUND(AVG(g.monto), 2) as promedio_gasto,
    ROUND(
        (SUM(g.monto) * 100.0) /
        (SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado' AND fecha BETWEEN ? AND ?), 2
    ) as porcentaje_del_total
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ? AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ? AND ?
GROUP BY cg.tipo
ORDER BY total_monto DESC;

-- ========================================================================================
-- 3. REPORTES DE MOROSIDAD Y PAGOS
-- ========================================================================================

-- 3.1 Estado de Morosidad por Unidad
SELECT
    u.id as unidad_id,
    u.codigo as codigo_unidad,
    CONCAT(p.nombres, ' ', p.apellidos) as propietario,
    ccu.monto_total as deuda_total,
    ccu.saldo as saldo_pendiente,
    ccu.interes_acumulado,
    ccu.estado,
    DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) as dias_vencidos,
    CASE
        WHEN ccu.saldo = 0 THEN 'Al día'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 30 THEN 'Moroso reciente'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 90 THEN 'Moroso medio'
        ELSE 'Moroso crónico'
    END as categoria_morosidad,
    DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y') as fecha_vencimiento,
    DATE_FORMAT(egc.periodo, '%m/%Y') as periodo
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido'
    AND ccu.saldo > 0
ORDER BY ccu.saldo DESC, dias_vencidos DESC;

-- 3.2 Historial de Pagos por Unidad
SELECT
    p.id as pago_id,
    DATE_FORMAT(p.fecha, '%d/%m/%Y') as fecha_pago,
    p.monto as monto_pagado,
    p.medio,
    p.referencia,
    p.estado,
    GROUP_CONCAT(
        CONCAT('Período ', DATE_FORMAT(egc.periodo, '%m/%Y'), ': $', pa.monto)
        SEPARATOR '; '
    ) as periodos_aplicados,
    u.codigo as unidad,
    CONCAT(pe.nombres, ' ', pe.apellidos) as pagador
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
LEFT JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
WHERE p.comunidad_id = ?
    AND p.fecha BETWEEN ? AND ?
GROUP BY p.id, p.fecha, p.monto, p.medio, p.referencia, p.estado, u.codigo, pe.nombres, pe.apellidos
ORDER BY p.fecha DESC;

-- 3.3 Análisis de Morosidad por Rango de Tiempo
SELECT
    CASE
        WHEN dias_vencidos = 0 THEN 'Al día'
        WHEN dias_vencidos <= 30 THEN '1-30 días'
        WHEN dias_vencidos <= 60 THEN '31-60 días'
        WHEN dias_vencidos <= 90 THEN '61-90 días'
        ELSE 'Más de 90 días'
    END as rango_morosidad,
    COUNT(*) as cantidad_unidades,
    SUM(saldo_pendiente) as monto_total_deuda,
    ROUND(AVG(saldo_pendiente), 2) as deuda_promedio,
    ROUND(
        (COUNT(*) * 100.0) /
        (SELECT COUNT(*) FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido'), 2
    ) as porcentaje_unidades
FROM (
    SELECT
        ccu.unidad_id,
        ccu.saldo as saldo_pendiente,
        DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) as dias_vencidos
    FROM cuenta_cobro_unidad ccu
    JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido' AND ccu.saldo > 0
) morosos
GROUP BY CASE
    WHEN dias_vencidos = 0 THEN 'Al día'
    WHEN dias_vencidos <= 30 THEN '1-30 días'
    WHEN dias_vencidos <= 60 THEN '31-60 días'
    WHEN dias_vencidos <= 90 THEN '61-90 días'
    ELSE 'Más de 90 días'
END
ORDER BY monto_total_deuda DESC;

-- ========================================================================================
-- 4. REPORTES OPERACIONALES
-- ========================================================================================

-- 4.1 Reporte de Tickets/Soportes
SELECT
    ts.id,
    ts.titulo,
    ts.descripcion,
    ts.categoria,
    ts.prioridad,
    ts.estado,
    DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') as fecha_creacion,
    DATE_FORMAT(ts.updated_at, '%d/%m/%Y %H:%i') as fecha_actualizacion,
    u.codigo as unidad_afectada,
    CONCAT(p.nombres, ' ', p.apellidos) as reportado_por,
    ua.username as asignado_a,
    DATEDIFF(CURRENT_DATE, DATE(ts.created_at)) as dias_abierto
FROM ticket_soporte ts
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario ur ON ts.id = ur.id -- Necesitaría tabla intermedia para relacionar
LEFT JOIN persona p ON ur.persona_id = p.id
LEFT JOIN usuario ua ON ts.asignado_a = ua.id
WHERE ts.comunidad_id = ?
    AND ts.created_at BETWEEN ? AND ?
ORDER BY ts.prioridad DESC, ts.created_at DESC;

-- 4.2 Reporte de Reservas de Amenidades
SELECT
    ra.id,
    a.nombre as amenidad,
    a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') as fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') as fecha_fin,
    ra.estado,
    u.codigo as unidad_reserva,
    CONCAT(p.nombres, ' ', p.apellidos) as reservado_por,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) as horas_reserva,
    CASE
        WHEN ra.estado = 'cumplida' THEN 'Completada'
        WHEN ra.estado = 'aprobada' THEN 'Confirmada'
        WHEN ra.estado = 'solicitada' THEN 'Pendiente'
        ELSE 'Cancelada'
    END as estado_descripcion
FROM reserva_amenidad ra
JOIN amenidad a ON ra.amenidad_id = a.id
JOIN unidad u ON ra.unidad_id = u.id
JOIN persona p ON ra.persona_id = p.id
WHERE ra.comunidad_id = ?
    AND ra.inicio BETWEEN ? AND ?
ORDER BY ra.inicio DESC;

-- 4.3 Bitácora de Conserjería
SELECT
    rc.id,
    DATE_FORMAT(rc.fecha_hora, '%d/%m/%Y %H:%i') as fecha_hora,
    rc.evento,
    rc.detalle,
    u.username as registrado_por,
    CASE
        WHEN rc.evento LIKE '%entrega%' THEN 'Entrega'
        WHEN rc.evento LIKE '%visita%' THEN 'Visita'
        WHEN rc.evento LIKE '%reporte%' THEN 'Reporte'
        WHEN rc.evento LIKE '%retiro%' THEN 'Retiro'
        ELSE 'Otro'
    END as tipo_evento
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
WHERE rc.comunidad_id = ?
    AND rc.fecha_hora BETWEEN ? AND ?
ORDER BY rc.fecha_hora DESC;

-- ========================================================================================
-- 5. REPORTES DE MULTAS Y SANCIONES
-- ========================================================================================

-- 5.1 Multas por Unidad y Período
SELECT
    m.id,
    DATE_FORMAT(m.fecha, '%d/%m/%Y') as fecha_multa,
    m.motivo,
    m.descripcion,
    m.monto,
    m.estado,
    m.prioridad,
    u.codigo as unidad_multada,
    CONCAT(p.nombres, ' ', p.apellidos) as infractor,
    uc.username as creada_por,
    DATE_FORMAT(m.fecha_pago, '%d/%m/%Y') as fecha_pago,
    CASE
        WHEN m.estado = 'pagada' THEN 'Pagada'
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        ELSE 'Anulada'
    END as estado_descripcion
FROM multa m
JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON m.creada_por = uc.id
WHERE m.comunidad_id = ?
    AND m.fecha BETWEEN ? AND ?
ORDER BY m.fecha DESC, m.monto DESC;

-- 5.2 Resumen de Multas por Tipo
SELECT
    m.motivo,
    COUNT(*) as cantidad_multas,
    SUM(m.monto) as monto_total,
    AVG(m.monto) as monto_promedio,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) as multas_pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) as multas_pendientes,
    ROUND(
        (COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) * 100.0) / COUNT(*), 2
    ) as porcentaje_cobranza
FROM multa m
WHERE m.comunidad_id = ?
    AND m.fecha BETWEEN ? AND ?
GROUP BY m.motivo
ORDER BY monto_total DESC;

-- ========================================================================================
-- 6. REPORTES DE CONSUMOS Y MEDIDORES
-- ========================================================================================

-- 6.1 Lecturas de Medidores por Período
SELECT
    lm.id,
    m.codigo as codigo_medidor,
    m.tipo,
    u.codigo as unidad,
    DATE_FORMAT(lm.fecha, '%d/%m/%Y') as fecha_lectura,
    lm.lectura,
    lm.periodo,
    -- Consumo calculado (lectura actual - lectura anterior)
    lm.lectura - LAG(lm.lectura) OVER (
        PARTITION BY lm.medidor_id ORDER BY lm.fecha
    ) as consumo_periodo,
    t.precio_por_unidad,
    -- Costo calculado
    (lm.lectura - LAG(lm.lectura) OVER (
        PARTITION BY lm.medidor_id ORDER BY lm.fecha
    )) * t.precio_por_unidad as costo_consumo
FROM lectura_medidor lm
JOIN medidor m ON lm.medidor_id = m.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN tarifa_consumo t ON m.tipo = t.tipo AND t.comunidad_id = m.comunidad_id
    AND t.periodo_desde <= lm.periodo
    AND (t.periodo_hasta IS NULL OR t.periodo_hasta >= lm.periodo)
WHERE m.comunidad_id = ?
    AND lm.fecha BETWEEN ? AND ?
ORDER BY m.tipo, u.codigo, lm.fecha;

-- 6.2 Consumo Total por Tipo de Servicio
SELECT
    m.tipo as servicio,
    COUNT(DISTINCT m.id) as cantidad_medidores,
    SUM(lm.lectura - LAG(lm.lectura) OVER (
        PARTITION BY lm.medidor_id ORDER BY lm.fecha
    )) as consumo_total,
    AVG(t.precio_por_unidad) as tarifa_promedio,
    SUM(
        (lm.lectura - LAG(lm.lectura) OVER (
            PARTITION BY lm.medidor_id ORDER BY lm.fecha
        )) * t.precio_por_unidad
    ) as costo_total_consumo
FROM lectura_medidor lm
JOIN medidor m ON lm.medidor_id = m.id
LEFT JOIN tarifa_consumo t ON m.tipo = t.tipo AND t.comunidad_id = m.comunidad_id
    AND t.periodo_desde <= lm.periodo
    AND (t.periodo_hasta IS NULL OR t.periodo_hasta >= lm.periodo)
WHERE m.comunidad_id = ?
    AND lm.fecha BETWEEN ? AND ?
GROUP BY m.tipo
ORDER BY costo_total_consumo DESC;

-- ========================================================================================
-- 7. REPORTES DE EXPORTACIÓN (CSV/Excel)
-- ========================================================================================

-- 7.1 Exportación Completa de Gastos
SELECT
    'Número' as tipo_fila,
    g.numero as numero_gasto,
    DATE_FORMAT(g.fecha, '%d/%m/%Y') as fecha,
    cg.nombre as categoria,
    cc.nombre as centro_costo,
    g.monto as monto,
    g.glosa as descripcion,
    p.razon_social as proveedor,
    g.estado as estado
FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.comunidad_id = ? AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ? AND ?
ORDER BY g.fecha DESC;

-- 7.2 Exportación de Estado de Cuentas por Unidad
SELECT
    'Cuenta' as tipo_fila,
    u.codigo as unidad,
    CONCAT(p.nombres, ' ', p.apellidos) as propietario,
    DATE_FORMAT(egc.periodo, '%m/%Y') as periodo,
    ccu.monto_total as total_cargo,
    ccu.saldo as saldo_pendiente,
    ccu.interes_acumulado as intereses,
    ccu.estado as estado_cuenta,
    DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) as dias_vencidos
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario'
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido'
ORDER BY u.codigo, egc.periodo DESC;

-- ========================================================================================
-- 8. DASHBOARD Y MÉTRICAS GENERALES
-- ========================================================================================

-- 8.1 Métricas Generales para Dashboard
SELECT
    -- Total de comunidades activas
    (SELECT COUNT(*) FROM comunidad) as total_comunidades,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE activa = 1) as total_unidades,

    -- Ingresos totales del mes actual
    (SELECT SUM(monto) FROM pago
     WHERE estado = 'aplicado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE)
     AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes_actual,

    -- Gastos totales del mes actual
    (SELECT SUM(monto) FROM gasto
     WHERE estado = 'aprobado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE)
     AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes_actual,

    -- Tickets activos
    (SELECT COUNT(*) FROM ticket_soporte
     WHERE estado IN ('abierto', 'en_progreso')) as tickets_activos,

    -- Reservas del mes
    (SELECT COUNT(*) FROM reserva_amenidad
     WHERE MONTH(inicio) = MONTH(CURRENT_DATE)
     AND YEAR(inicio) = YEAR(CURRENT_DATE)) as reservas_mes,

    -- Multas pendientes
    (SELECT COUNT(*) FROM multa WHERE estado = 'pendiente') as multas_pendientes,

    -- Porcentaje ocupación amenidades (últimos 30 días)
    (SELECT ROUND(
        (SELECT COUNT(*) FROM reserva_amenidad
         WHERE inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
         AND estado = 'cumplida') * 100.0 /
        (SELECT COUNT(*) FROM amenidad) / 30, 2
    )) as ocupacion_promedio;

-- 8.2 Tendencias Mensuales (últimos 12 meses)
SELECT
    DATE_FORMAT(fecha, '%Y-%m') as periodo,
    YEAR(fecha) as anio,
    MONTH(fecha) as mes,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as ingresos,
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as gastos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) -
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as saldo
FROM (
    SELECT fecha, monto, 'ingreso' as tipo FROM pago WHERE estado = 'aplicado'
    UNION ALL
    SELECT fecha, monto, 'gasto' as tipo FROM gasto WHERE estado = 'aprobado'
) movimientos
WHERE fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fecha, '%Y-%m'), YEAR(fecha), MONTH(fecha)
ORDER BY periodo;

-- ========================================================================================
-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- ========================================================================================

-- Índices para mejorar rendimiento de consultas de reportes
-- CREATE INDEX idx_gasto_comunidad_fecha ON gasto(comunidad_id, fecha, estado);
-- CREATE INDEX idx_pago_comunidad_fecha ON pago(comunidad_id, fecha, estado);
-- CREATE INDEX idx_cuenta_cobro_comunidad ON cuenta_cobro_unidad(comunidad_id, saldo);
-- CREATE INDEX idx_ticket_comunidad_fecha ON ticket_soporte(comunidad_id, created_at);
-- CREATE INDEX idx_multa_comunidad_fecha ON multa(comunidad_id, fecha, estado);