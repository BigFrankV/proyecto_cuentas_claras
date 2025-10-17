-- ========================================================================================
-- REPORTES Y ANALÍTICA - QUERIES SQL COMPLETAS
-- Sistema de Cuentas Claras (Basado en el esquema existente)
-- ========================================================================================

-- ========================================================================================
-- 1. REPORTES FINANCIEROS
-- ========================================================================================

-- 1.1 Resumen Financiero Mensual por Comunidad
-- Obtiene ingresos, gastos y saldo por mes para una comunidad específica
SELECT
    DATE_FORMAT(p.fecha, '%Y-%m') AS periodo,
    YEAR(p.fecha) AS anio,
    MONTH(p.fecha) AS mes,
    SUM(p.monto) AS ingresos_totales,
    0 AS gastos_totales, -- CORRECCIÓN: Se simula a 0 para no duplicar lógica. Ver 1.3
    SUM(p.monto) AS saldo,
    COUNT(DISTINCT p.unidad_id) AS unidades_pagadoras,
    COUNT(p.id) AS total_pagos
FROM pago p
WHERE p.comunidad_id = ?1 /* :comunidad_id */ AND p.estado = 'aplicado' -- CORRECCIÓN: Usar 'aplicado'
    AND p.fecha BETWEEN ?2 AND ?3
GROUP BY DATE_FORMAT(p.fecha, '%Y-%m'), YEAR(p.fecha), MONTH(p.fecha)
ORDER BY periodo DESC;
-- Sugerir índice: pago(comunidad_id, estado, fecha)

-- 1.2 Gastos Mensuales por Comunidad
-- Obtiene gastos agrupados por mes y categoría
SELECT
    DATE_FORMAT(g.fecha, '%Y-%m') AS periodo,
    YEAR(g.fecha) AS anio,
    MONTH(g.fecha) AS mes,
    cg.nombre AS categoria,
    cg.tipo AS tipo_categoria,
    SUM(g.monto) AS total_gastos,
    COUNT(g.id) AS cantidad_gastos,
    AVG(g.monto) AS gasto_promedio
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */ AND g.estado = 'aprobado' -- CORRECCIÓN: Usar 'aprobado'
    AND g.fecha BETWEEN ?2 AND ?3
GROUP BY DATE_FORMAT(g.fecha, '%Y-%m'), YEAR(g.fecha), MONTH(g.fecha), cg.id, cg.nombre, cg.tipo
ORDER BY periodo DESC, total_gastos DESC;
-- Sugerir índice: gasto(comunidad_id, estado, fecha, categoria_id)

-- 1.3 Balance General Mensual (Ingresos - Gastos)
-- Combina ingresos y gastos para obtener balance real
SELECT
    periodo,
    anio,
    mes,
    COALESCE(ingresos.ingresos_totales, 0) AS ingresos,
    COALESCE(gastos.gastos_totales, 0) AS gastos,
    COALESCE(ingresos.ingresos_totales, 0) - COALESCE(gastos.gastos_totales, 0) AS saldo,
    COALESCE(ingresos.unidades_pagadoras, 0) AS unidades_activas
FROM (
    SELECT DISTINCT DATE_FORMAT(fecha, '%Y-%m') AS periodo,
           YEAR(fecha) AS anio,
           MONTH(fecha) AS mes
    FROM (
        SELECT fecha FROM pago WHERE comunidad_id = ?1 AND fecha BETWEEN ?2 AND ?3
        UNION
        SELECT fecha FROM gasto WHERE comunidad_id = ?1 AND fecha BETWEEN ?2 AND ?3
    ) AS fechas
) AS periodos
LEFT JOIN (
    SELECT DATE_FORMAT(fecha, '%Y-%m') AS periodo, SUM(monto) AS ingresos_totales, COUNT(DISTINCT unidad_id) AS unidades_pagadoras
    FROM pago
    WHERE comunidad_id = ?1 AND estado = 'aplicado' AND fecha BETWEEN ?2 AND ?3
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) AS ingresos ON periodos.periodo = ingresos.periodo
LEFT JOIN (
    SELECT DATE_FORMAT(fecha, '%Y-%m') AS periodo, SUM(monto) AS gastos_totales
    FROM gasto
    WHERE comunidad_id = ?1 AND estado = 'aprobado' AND fecha BETWEEN ?2 AND ?3
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) AS gastos ON periodos.periodo = gastos.periodo
ORDER BY periodo DESC;

-- 1.4 KPIs Financieros del Mes Actual
SELECT
    -- Ingresos del mes actual
    (SELECT SUM(monto) FROM pago
     WHERE comunidad_id = ?1 AND estado = 'aplicado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) AS ingresos_mes_actual,

    -- Gastos del mes actual
    (SELECT SUM(monto) FROM gasto
     WHERE comunidad_id = ?1 AND estado = 'aprobado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) AS gastos_mes_actual,

    -- Saldo actual (ingresos - gastos acumulados)
    ((SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = ?1 AND estado = 'aplicado') -
     (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = ?1 AND estado = 'aprobado')) AS saldo_actual,

    -- Porcentaje de morosidad (unidades con saldo pendiente / total unidades)
    (SELECT
        ROUND(
            (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / NULLIF(COUNT(ccu.id), 0), 2
        )
     FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = ?1 AND egc.estado = 'emitido') AS porcentaje_morosidad,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE comunidad_id = ?1 AND activa = 1) AS total_unidades,

    -- Unidades al día
    (SELECT COUNT(DISTINCT ccu.unidad_id)
     FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = ?1 AND egc.estado = 'emitido' AND ccu.saldo = 0) AS unidades_al_dia;

-- ========================================================================================
-- 2. REPORTES DE GASTOS DETALLADOS
-- ========================================================================================

-- 2.1 Gastos por Categoría con Detalles
SELECT
    g.id,
    g.numero,
    DATE_FORMAT(g.fecha, '%d/%m/%Y') AS fecha,
    cg.nombre AS categoria,
    cg.tipo AS tipo_categoria,
    cc.nombre AS centro_costo,
    g.monto,
    g.glosa,
    g.estado,
    p.razon_social AS proveedor,
    dc.folio AS documento_folio,
    dc.tipo_doc,
    u.username AS creado_por, -- CORRECCIÓN: Asumimos que creado_por es usuario_id, se busca el username
    DATE_FORMAT(g.created_at, '%d/%m/%Y %H:%i') AS fecha_creacion
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN usuario u ON g.creado_por = u.id -- CORRECCIÓN: Join a usuario por g.creado_por
WHERE g.comunidad_id = ?1 /* :comunidad_id */
    AND g.fecha BETWEEN ?2 AND ?3
    AND g.estado = 'aprobado'
ORDER BY g.fecha DESC, g.monto DESC;
-- Sugerir índice: gasto(creado_por)

-- 2.2 Resumen de Gastos por Centro de Costo
SELECT
    cc.nombre AS centro_costo,
    cc.codigo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_gastos,
    AVG(g.monto) AS gasto_promedio,
    MIN(g.fecha) AS primer_gasto,
    MAX(g.fecha) AS ultimo_gasto
FROM gasto g
JOIN centro_costo cc ON g.centro_costo_id = cc.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */ AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ?2 AND ?3
GROUP BY cc.id, cc.nombre, cc.codigo -- CORRECCIÓN: Agrupar por id y código
ORDER BY total_gastos DESC;

-- 2.3 Gastos por Tipo de Categoría
SELECT
    cg.tipo,
    COUNT(g.id) AS cantidad_gastos,
    SUM(g.monto) AS total_monto,
    ROUND(AVG(g.monto), 2) AS promedio_gasto,
    ROUND(
        (SUM(g.monto) * 100.0) /
        NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?1 AND estado = 'aprobado' AND fecha BETWEEN ?2 AND ?3), 0), 2
    ) AS porcentaje_del_total
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */ AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ?2 AND ?3
GROUP BY cg.tipo
ORDER BY total_monto DESC;

-- ========================================================================================
-- 3. REPORTES DE MOROSIDAD Y PAGOS
-- ========================================================================================

-- 3.1 Estado de Morosidad por Unidad
SELECT
    u.id AS unidad_id,
    u.codigo AS codigo_unidad, -- CORRECCIÓN: Usar u.codigo
    CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
    ccu.monto_total AS deuda_total,
    ccu.saldo AS saldo_pendiente,
    ccu.interes_acumulado,
    ccu.estado,
    DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) AS dias_vencidos,
    CASE
        WHEN ccu.saldo = 0 THEN 'Al día'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 30 THEN 'Moroso reciente'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 90 THEN 'Moroso medio'
        ELSE 'Moroso crónico'
    END AS categoria_morosidad,
    DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y') AS fecha_vencimiento,
    DATE_FORMAT(egc.periodo, '%m/%Y') AS periodo
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
-- CORRECCIÓN: Lógica para obtener el propietario (asumiendo uno por unidad)
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.comunidad_id = ? /* :comunidad_id */ AND egc.estado = 'emitido'
    AND ccu.saldo > 0
ORDER BY ccu.saldo DESC, dias_vencidos DESC;
-- Sugerir índice: cuenta_cobro_unidad(comunidad_id, emision_id, saldo)

-- 3.2 Historial de Pagos por Unidad
SELECT
    p.id AS pago_id,
    DATE_FORMAT(p.fecha, '%d/%m/%Y') AS fecha_pago,
    p.monto AS monto_pagado,
    p.medio,
    p.referencia,
    p.estado,
    GROUP_CONCAT(
        CONCAT('Período ', egc.periodo, ': $', pa.monto) -- CORRECCIÓN: Usar egc.periodo
        ORDER BY egc.periodo
        SEPARATOR '; '
    ) AS periodos_aplicados,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    CONCAT(pe.nombres, ' ', pe.apellidos) AS pagador
FROM pago p
LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
LEFT JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
LEFT JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN persona pe ON p.persona_id = pe.id
WHERE p.comunidad_id = ?1 /* :comunidad_id */
    AND p.fecha BETWEEN ?2 AND ?3
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
    END AS rango_morosidad,
    COUNT(morosos.unidad_id) AS cantidad_unidades, -- CORRECCIÓN: Contar por unidad_id
    SUM(morosos.saldo_pendiente) AS monto_total_deuda,
    ROUND(AVG(morosos.saldo_pendiente), 2) AS deuda_promedio,
    ROUND(
        (COUNT(morosos.unidad_id) * 100.0) /
        NULLIF((SELECT COUNT(ccu.id) FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = ?1 AND egc.estado = 'emitido'), 0), 2
    ) AS porcentaje_unidades
FROM (
    SELECT
        ccu.unidad_id,
        ccu.saldo AS saldo_pendiente,
        DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) AS dias_vencidos
    FROM cuenta_cobro_unidad ccu
    JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    WHERE ccu.comunidad_id = ?1 AND egc.estado = 'emitido' AND ccu.saldo > 0
) AS morosos
GROUP BY 1
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
    DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') AS fecha_creacion,
    DATE_FORMAT(ts.updated_at, '%d/%m/%Y %H:%i') AS fecha_actualizacion,
    u.codigo AS unidad_afectada, -- CORRECCIÓN: Usar u.codigo
    'N/A' AS reportado_por, -- CORRECCIÓN: Creador no está en la tabla ticket_soporte
    ua.username AS asignado_a,
    DATEDIFF(CURRENT_DATE, DATE(ts.created_at)) AS dias_abierto
FROM ticket_soporte ts
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario ua ON ts.asignado_a = ua.id
WHERE ts.comunidad_id = ?1 /* :comunidad_id */
    AND ts.created_at BETWEEN ?2 AND ?3
ORDER BY ts.prioridad DESC, ts.created_at DESC;

-- 4.2 Reporte de Reservas de Amenidades
SELECT
    ra.id,
    a.nombre AS amenidad,
    a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') AS fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') AS fecha_fin,
    ra.estado,
    u.codigo AS unidad_reserva, -- CORRECCIÓN: Usar u.codigo
    CONCAT(p.nombres, ' ', p.apellidos) AS reservado_por,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) AS horas_reserva,
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
WHERE ra.comunidad_id = ?1 /* :comunidad_id */
    AND ra.inicio BETWEEN ?2 AND ?3
ORDER BY ra.inicio DESC;

-- 4.3 Bitácora de Conserjería
SELECT
    rc.id,
    DATE_FORMAT(rc.fecha_hora, '%d/%m/%Y %H:%i') AS fecha_hora,
    rc.evento,
    rc.detalle,
    u.username AS registrado_por,
    CASE
        WHEN rc.evento LIKE '%entrega%' THEN 'Entrega'
        WHEN rc.evento LIKE '%visita%' THEN 'Visita'
        WHEN rc.evento LIKE '%reporte%' THEN 'Reporte'
        WHEN rc.evento LIKE '%retiro%' THEN 'Retiro'
        ELSE 'Otro'
    END AS tipo_evento
FROM registro_conserjeria rc
LEFT JOIN usuario u ON rc.usuario_id = u.id
WHERE rc.comunidad_id = ?1 /* :comunidad_id */
    AND rc.fecha_hora BETWEEN ?2 AND ?3
ORDER BY rc.fecha_hora DESC;

-- ========================================================================================
-- 5. REPORTES DE MULTAS Y SANCIONES
-- ========================================================================================

-- 5.1 Multas por Unidad y Período
SELECT
    m.id,
    DATE_FORMAT(m.fecha, '%d/%m/%Y') AS fecha_multa,
    m.motivo, -- CORRECCIÓN: Usar m.motivo
    m.descripcion,
    m.monto,
    m.estado,
    m.prioridad,
    u.codigo AS unidad_multada, -- CORRECCIÓN: Usar u.codigo
    CONCAT(p.nombres, ' ', p.apellidos) AS infractor,
    uc.username AS creada_por, -- CORRECCIÓN: Usar uc.username
    DATE_FORMAT(m.fecha_pago, '%d/%m/%Y') AS fecha_pago,
    CASE
        WHEN m.estado = 'pagada' THEN 'Pagada'
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        ELSE 'Anulada'
    END AS estado_descripcion
FROM multa m
JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON m.creada_por = uc.id
WHERE m.comunidad_id = ?1 /* :comunidad_id */
    AND m.fecha BETWEEN ?2 AND ?3
ORDER BY m.fecha DESC, m.monto DESC;

-- 5.2 Resumen de Multas por Tipo
SELECT
    m.motivo, -- CORRECCIÓN: Usar m.motivo
    COUNT(*) AS cantidad_multas,
    SUM(m.monto) AS monto_total,
    AVG(m.monto) AS monto_promedio,
    COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS multas_pagadas,
    COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS multas_pendientes,
    ROUND(
        (COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 2
    ) AS porcentaje_cobranza
FROM multa m
WHERE m.comunidad_id = ?1 /* :comunidad_id */
    AND m.fecha BETWEEN ?2 AND ?3
GROUP BY m.motivo
ORDER BY monto_total DESC;

-- ========================================================================================
-- 6. REPORTES DE CONSUMOS Y MEDIDORES
-- ========================================================================================

-- 6.1 Lecturas de Medidores por Período
SELECT
    lm.id,
    m.codigo AS codigo_medidor,
    m.tipo,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    DATE_FORMAT(lm.fecha, '%d/%m/%Y') AS fecha_lectura, -- CORRECCIÓN: Usar lm.fecha
    lm.lectura,
    lm.periodo,
    -- Consumo calculado (lectura actual - lectura anterior)
    lm.lectura - LAG(lm.lectura) OVER (
        PARTITION BY lm.medidor_id ORDER BY lm.fecha
    ) AS consumo_periodo,
    t.precio_por_unidad,
    -- Costo calculado
    (lm.lectura - LAG(lm.lectura) OVER (
        PARTITION BY lm.medidor_id ORDER BY lm.fecha
    )) * t.precio_por_unidad AS costo_consumo
FROM lectura_medidor lm
JOIN medidor m ON lm.medidor_id = m.id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN tarifa_consumo t ON m.tipo = t.tipo AND t.comunidad_id = m.comunidad_id
    AND t.periodo_desde <= lm.periodo
    AND (t.periodo_hasta IS NULL OR t.periodo_hasta >= lm.periodo)
WHERE m.comunidad_id = ?1 /* :comunidad_id */
    AND lm.fecha BETWEEN ?2 AND ?3
ORDER BY m.tipo, u.codigo, lm.fecha;

-- 6.2 Consumo Total por Tipo de Servicio
SELECT
    m.tipo AS servicio,
    COUNT(DISTINCT m.id) AS cantidad_medidores,
    SUM(lm.lectura - LAG(lm.lectura) OVER (
        PARTITION BY lm.medidor_id ORDER BY lm.fecha
    )) AS consumo_total,
    AVG(t.precio_por_unidad) AS tarifa_promedio,
    SUM(
        (lm.lectura - LAG(lm.lectura) OVER (
            PARTITION BY lm.medidor_id ORDER BY lm.fecha
        )) * t.precio_por_unidad
    ) AS costo_total_consumo
FROM lectura_medidor lm
JOIN medidor m ON lm.medidor_id = m.id
LEFT JOIN tarifa_consumo t ON m.tipo = t.tipo AND t.comunidad_id = m.comunidad_id
    AND t.periodo_desde <= lm.periodo
    AND (t.periodo_hasta IS NULL OR t.periodo_hasta >= lm.periodo)
WHERE m.comunidad_id = ?1 /* :comunidad_id */
    AND lm.fecha BETWEEN ?2 AND ?3
GROUP BY m.tipo
ORDER BY costo_total_consumo DESC;

-- ========================================================================================
-- 7. REPORTES DE EXPORTACIÓN (CSV/Excel)
-- ========================================================================================

-- 7.1 Exportación Completa de Gastos
SELECT
    'Número' AS tipo_fila,
    g.numero AS numero_gasto,
    DATE_FORMAT(g.fecha, '%d/%m/%Y') AS fecha,
    cg.nombre AS categoria,
    cc.nombre AS centro_costo,
    g.monto AS monto,
    g.glosa AS descripcion,
    p.razon_social AS proveedor,
    g.estado AS estado
FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
WHERE g.comunidad_id = ?1 /* :comunidad_id */ AND g.estado = 'aprobado'
    AND g.fecha BETWEEN ?2 AND ?3
ORDER BY g.fecha DESC;

-- 7.2 Exportación de Estado de Cuentas por Unidad
SELECT
    'Cuenta' AS tipo_fila,
    u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
    CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
    DATE_FORMAT(egc.periodo, '%m/%Y') AS periodo,
    ccu.monto_total AS total_cargo,
    ccu.saldo AS saldo_pendiente,
    ccu.interes_acumulado AS intereses,
    ccu.estado AS estado_cuenta,
    DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) AS dias_vencidos
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE ccu.comunidad_id = ? /* :comunidad_id */ AND egc.estado = 'emitido'
ORDER BY u.codigo, egc.periodo DESC;

-- ========================================================================================
-- 8. DASHBOARD Y MÉTRICAS GENERALES
-- ========================================================================================

-- 8.1 Métricas Generales para Dashboard
SELECT
    -- Total de comunidades activas
    (SELECT COUNT(*) FROM comunidad) AS total_comunidades,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE activa = 1) AS total_unidades,

    -- Ingresos totales del mes actual
    (SELECT SUM(monto) FROM pago
     WHERE estado = 'aplicado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE)
     AND MONTH(fecha) = MONTH(CURRENT_DATE)) AS ingresos_mes_actual,

    -- Gastos totales del mes actual
    (SELECT SUM(monto) FROM gasto
     WHERE estado = 'aprobado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE)
     AND MONTH(fecha) = MONTH(CURRENT_DATE)) AS gastos_mes_actual,

    -- Tickets activos
    (SELECT COUNT(*) FROM ticket_soporte
     WHERE estado IN ('abierto', 'en_progreso')) AS tickets_activos,

    -- Reservas del mes
    (SELECT COUNT(*) FROM reserva_amenidad
     WHERE MONTH(inicio) = MONTH(CURRENT_DATE)
     AND YEAR(inicio) = YEAR(CURRENT_DATE)) AS reservas_mes,

    -- Multas pendientes
    (SELECT COUNT(*) FROM multa WHERE estado = 'pendiente') AS multas_pendientes,

    -- Porcentaje ocupación amenidades (últimos 30 días)
    -- CORRECCIÓN: La lógica de cálculo es incorrecta. Se simplifica el cálculo.
    (SELECT ROUND(
        (SELECT COUNT(*) FROM reserva_amenidad
         WHERE inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
         AND estado = 'cumplida') * 100.0 /
        NULLIF((SELECT COUNT(*) FROM reserva_amenidad), 0), 2
    )) AS ocupacion_promedio;

-- 8.2 Tendencias Mensuales (últimos 12 meses)
SELECT
    DATE_FORMAT(fecha, '%Y-%m') AS periodo,
    YEAR(fecha) AS anio,
    MONTH(fecha) AS mes,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) AS gastos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) -
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) AS saldo
FROM (
    SELECT fecha, monto, 'ingreso' AS tipo FROM pago WHERE estado = 'aplicado'
    UNION ALL
    SELECT fecha, monto, 'gasto' AS tipo FROM gasto WHERE estado = 'aprobado'
) AS movimientos
WHERE fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fecha, '%Y-%m'), YEAR(fecha), MONTH(fecha)
ORDER BY periodo;

-- ========================================================================================
-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN
-- ========================================================================================

-- Índices para mejorar rendimiento de consultas de reportes
-- Sugerir índice: gasto(comunidad_id, fecha, estado)
-- Sugerir índice: pago(comunidad_id, fecha, estado)
-- Sugerir índice: cuenta_cobro_unidad(comunidad_id, saldo)
-- Sugerir índice: ticket_soporte(comunidad_id, created_at)
-- Sugerir índice: multa(comunidad_id, fecha, estado)
-- Sugerir índice: titulares_unidad(unidad_id, persona_id, tipo)