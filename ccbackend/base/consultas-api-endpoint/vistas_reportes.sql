-- ========================================================================================
-- VISTAS ÚTILES PARA REPORTES
-- Sistema de Cuentas Claras
-- ========================================================================================

-- Vista para resumen financiero mensual
CREATE OR REPLACE VIEW vista_resumen_financiero_mensual AS
SELECT
    c.id as comunidad_id,
    c.razon_social as comunidad,
    DATE_FORMAT(mov.fecha, '%Y-%m') as periodo,
    YEAR(mov.fecha) as anio,
    MONTH(mov.fecha) as mes,
    SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) as ingresos,
    SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as gastos,
    SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE -mov.monto END) as saldo,
    COUNT(DISTINCT CASE WHEN mov.tipo = 'ingreso' THEN mov.unidad_id END) as unidades_activas
FROM comunidad c
CROSS JOIN (
    SELECT fecha, monto, 'ingreso' as tipo, unidad_id FROM pago WHERE estado = 'aplicado'
    UNION ALL
    SELECT fecha, monto, 'gasto' as tipo, NULL as unidad_id FROM gasto WHERE estado = 'aprobado'
) mov
WHERE mov.fecha BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH) AND CURRENT_DATE
GROUP BY c.id, c.razon_social, DATE_FORMAT(mov.fecha, '%Y-%m'), YEAR(mov.fecha), MONTH(mov.fecha);

-- Vista para estado de morosidad por unidad
CREATE OR REPLACE VIEW vista_morosidad_unidades AS
SELECT
    c.id as comunidad_id,
    c.razon_social as comunidad,
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
FROM comunidad c
JOIN cuenta_cobro_unidad ccu ON c.id = ccu.comunidad_id
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
    AND tu.tipo = 'propietario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona p ON tu.persona_id = p.id
WHERE egc.estado = 'emitido' AND ccu.saldo > 0;

-- Vista para gastos detallados con categorías
CREATE OR REPLACE VIEW vista_gastos_detallados AS
SELECT
    g.id,
    g.numero,
    g.comunidad_id,
    c.razon_social as comunidad,
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
JOIN comunidad c ON g.comunidad_id = c.id
JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN usuario u ON g.creado_por = u.id;

-- Vista para KPIs financieros
CREATE OR REPLACE VIEW vista_kpis_financieros AS
SELECT
    c.id as comunidad_id,
    c.razon_social as comunidad,

    -- Ingresos del mes actual
    (SELECT SUM(monto) FROM pago
     WHERE comunidad_id = c.id AND estado = 'aplicado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes_actual,

    -- Gastos del mes actual
    (SELECT SUM(monto) FROM gasto
     WHERE comunidad_id = c.id AND estado = 'aprobado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes_actual,

    -- Saldo actual acumulado
    ((SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado') -
     (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = c.id AND estado = 'aprobado')) as saldo_actual,

    -- Porcentaje de morosidad
    (SELECT ROUND(
        (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 2
     ) FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido') as porcentaje_morosidad,

    -- Total unidades activas
    (SELECT COUNT(*) FROM unidad WHERE comunidad_id = c.id AND activa = 1) as total_unidades,

    -- Unidades al día
    (SELECT COUNT(DISTINCT ccu.unidad_id)
     FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido' AND ccu.saldo = 0) as unidades_al_dia,

    -- Tickets activos
    (SELECT COUNT(*) FROM ticket_soporte
     WHERE comunidad_id = c.id AND estado IN ('abierto', 'en_progreso')) as tickets_activos,

    -- Multas pendientes
    (SELECT COUNT(*) FROM multa WHERE comunidad_id = c.id AND estado = 'pendiente') as multas_pendientes

FROM comunidad c;

-- Vista para resumen de gastos por categoría
CREATE OR REPLACE VIEW vista_gastos_por_categoria AS
SELECT
    c.id as comunidad_id,
    c.razon_social as comunidad,
    cg.nombre as categoria,
    cg.tipo as tipo_categoria,
    COUNT(g.id) as cantidad_gastos,
    SUM(g.monto) as total_gastos,
    AVG(g.monto) as gasto_promedio,
    MIN(g.fecha) as primer_gasto,
    MAX(g.fecha) as ultimo_gasto,
    ROUND(
        (SUM(g.monto) * 100.0) /
        NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = c.id AND estado = 'aprobado'), 0), 2
    ) as porcentaje_del_total
FROM comunidad c
CROSS JOIN categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id AND g.comunidad_id = c.id AND g.estado = 'aprobado'
GROUP BY c.id, c.razon_social, cg.id, cg.nombre, cg.tipo;

-- Vista para consumo de servicios
CREATE OR REPLACE VIEW vista_consumo_servicios AS
SELECT
    c.id as comunidad_id,
    c.razon_social as comunidad,
    m.tipo as servicio,
    m.codigo as medidor,
    u.codigo as unidad,
    lm.periodo,
    lm.lectura as lectura_actual,
    LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha) as lectura_anterior,
    (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) as consumo,
    t.precio_por_unidad as tarifa,
    ((lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) * t.precio_por_unidad) as costo,
    DATE_FORMAT(lm.fecha, '%d/%m/%Y') as fecha_lectura
FROM comunidad c
JOIN medidor m ON c.id = m.comunidad_id
JOIN lectura_medidor lm ON m.id = lm.medidor_id
LEFT JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN tarifa_consumo t ON m.tipo = t.tipo AND t.comunidad_id = c.id
    AND t.periodo_desde <= lm.periodo
    AND (t.periodo_hasta IS NULL OR t.periodo_hasta >= lm.periodo);

-- Vista para tickets y soporte
CREATE OR REPLACE VIEW vista_tickets_soporte AS
SELECT
    ts.id,
    ts.comunidad_id,
    c.razon_social as comunidad,
    ts.titulo,
    ts.descripcion,
    ts.categoria,
    ts.prioridad,
    ts.estado,
    DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') as fecha_creacion,
    DATE_FORMAT(ts.updated_at, '%d/%m/%Y %H:%i') as fecha_actualizacion,
    u.codigo as unidad_afectada,
    ua.username as asignado_a,
    DATEDIFF(CURRENT_DATE, DATE(ts.created_at)) as dias_abierto,
    CASE
        WHEN ts.prioridad = 'alta' AND ts.estado IN ('abierto', 'en_progreso') THEN 'Crítico'
        WHEN DATEDIFF(CURRENT_DATE, DATE(ts.created_at)) > 30 THEN 'Antiguo'
        ELSE 'Normal'
    END as clasificacion
FROM ticket_soporte ts
JOIN comunidad c ON ts.comunidad_id = c.id
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario ua ON ts.asignado_a = ua.id;

-- Vista para reservas de amenidades
CREATE OR REPLACE VIEW vista_reservas_amenidades AS
SELECT
    ra.id,
    ra.comunidad_id,
    c.razon_social as comunidad,
    a.nombre as amenidad,
    a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') as fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') as fecha_fin,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) as horas_reserva,
    ra.estado,
    u.codigo as unidad_reserva,
    CONCAT(p.nombres, ' ', p.apellidos) as reservado_por,
    CASE
        WHEN ra.estado = 'cumplida' THEN 'Completada'
        WHEN ra.estado = 'aprobada' THEN 'Confirmada'
        WHEN ra.estado = 'solicitada' THEN 'Pendiente'
        ELSE 'Cancelada'
    END as estado_descripcion,
    (a.tarifa * TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin)) as ingreso_esperado
FROM reserva_amenidad ra
JOIN comunidad c ON ra.comunidad_id = c.id
JOIN amenidad a ON ra.amenidad_id = a.id
JOIN unidad u ON ra.unidad_id = u.id
JOIN persona p ON ra.persona_id = p.id;

-- Vista para multas y sanciones
CREATE OR REPLACE VIEW vista_multas_sanciones AS
SELECT
    m.id,
    m.comunidad_id,
    c.razon_social as comunidad,
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
    DATEDIFF(CURRENT_DATE, m.fecha) as dias_desde_multa,
    CASE
        WHEN m.estado = 'pagada' THEN 'Pagada'
        WHEN m.estado = 'pendiente' AND DATEDIFF(CURRENT_DATE, m.fecha) > 30 THEN 'Vencida'
        WHEN m.estado = 'pendiente' THEN 'Pendiente'
        ELSE 'Anulada'
    END as estado_descripcion
FROM multa m
JOIN comunidad c ON m.comunidad_id = c.id
JOIN unidad u ON m.unidad_id = u.id
LEFT JOIN persona p ON m.persona_id = p.id
LEFT JOIN usuario uc ON m.creada_por = uc.id;

-- Vista para bitácora de conserjería
CREATE OR REPLACE VIEW vista_bitacora_conserjeria AS
SELECT
    rc.id,
    rc.comunidad_id,
    c.razon_social as comunidad,
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
    END as tipo_evento,
    DATE(rc.fecha_hora) as fecha,
    HOUR(rc.fecha_hora) as hora
FROM registro_conserjeria rc
JOIN comunidad c ON rc.comunidad_id = c.id
LEFT JOIN usuario u ON rc.usuario_id = u.id;

-- Vista para análisis de tendencias (últimos 12 meses)
CREATE OR REPLACE VIEW vista_tendencias_mensuales AS
SELECT
    c.id as comunidad_id,
    c.razon_social as comunidad,
    DATE_FORMAT(mov.fecha, '%Y-%m') as periodo,
    YEAR(mov.fecha) as anio,
    MONTH(mov.fecha) as mes,
    SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) as ingresos,
    SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as gastos,
    SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) -
    SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as saldo,
    COUNT(DISTINCT CASE WHEN mov.tipo = 'ingreso' THEN mov.unidad_id END) as unidades_activas
FROM comunidad c
CROSS JOIN (
    SELECT fecha, monto, 'ingreso' as tipo, unidad_id FROM pago WHERE estado = 'aplicado'
    UNION ALL
    SELECT fecha, monto, 'gasto' as tipo, NULL as unidad_id FROM gasto WHERE estado = 'aprobado'
) mov
WHERE mov.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY c.id, c.razon_social, DATE_FORMAT(mov.fecha, '%Y-%m'), YEAR(mov.fecha), MONTH(mov.fecha);