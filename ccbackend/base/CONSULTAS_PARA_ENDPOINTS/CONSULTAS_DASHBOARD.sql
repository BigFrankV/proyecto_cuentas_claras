// ========================================================================================
// CONSULTAS SQL PARA DASHBOARD - SISTEMA DE CUENTAS CLARAS
// ========================================================================================

/*
 * CONSULTAS PARA DASHBOARD PRINCIPAL
 *
 * Este archivo contiene todas las consultas SQL necesarias para poblar
 * el dashboard principal del sistema Cuentas Claras.
 *
 * Secciones:
 * 1. KPIs Principales (Saldo, Ingresos, Gastos, Morosidad)
 * 2. Gráficos (Tendencias, Estados, Categorías, Consumos)
 * 3. Tablas de Datos (Pagos, Morosidad, Actividades, Reservas)
 * 4. Notificaciones
 */

// ========================================================================================
// 1. KPIs PRINCIPALES DEL DASHBOARD
// ========================================================================================

// KPI - SALDO TOTAL DE LA COMUNIDAD
SELECT
    (COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0)) as saldo_total,
    ROUND(
        ((COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0)) -
         LAG(COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0))
         OVER (ORDER BY YEAR(fecha) * 12 + MONTH(fecha))) /
        NULLIF(LAG(COALESCE(SUM(p.monto), 0) - COALESCE(SUM(g.monto), 0))
               OVER (ORDER BY YEAR(fecha) * 12 + MONTH(fecha)), 0) * 100, 2
    ) as variacion_porcentual
FROM (
    SELECT fecha, monto FROM pago WHERE comunidad_id = ? AND estado = 'aplicado'
    UNION ALL
    SELECT fecha, -monto FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado'
) as transacciones
GROUP BY YEAR(fecha), MONTH(fecha)
ORDER BY YEAR(fecha) DESC, MONTH(fecha) DESC
LIMIT 1;

// KPI - INGRESOS DEL MES ACTUAL
SELECT
    SUM(p.monto) as ingresos_mes_actual,
    ROUND(
        (SUM(p.monto) - LAG(SUM(p.monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
        NULLIF(LAG(SUM(p.monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0) * 100, 2
    ) as variacion_porcentual
FROM pago p
WHERE p.comunidad_id = ?
  AND p.estado = 'aplicado'
  AND YEAR(p.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(p.fecha) = MONTH(CURRENT_DATE)
GROUP BY YEAR(p.fecha), MONTH(p.fecha);

// KPI - GASTOS DEL MES ACTUAL
SELECT
    SUM(g.monto) as gastos_mes_actual,
    ROUND(
        (SUM(g.monto) - LAG(SUM(g.monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
        NULLIF(LAG(SUM(g.monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)), 0) * 100, 2
    ) as variacion_porcentual
FROM gasto g
WHERE g.comunidad_id = ?
  AND g.estado = 'aprobado'
  AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
GROUP BY YEAR(g.fecha), MONTH(g.fecha);

// KPI - TASA DE MOROSIDAD
SELECT
    ROUND(
        (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*), 2
    ) as tasa_morosidad_actual,
    ROUND(
        (LAG(COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END)) OVER (ORDER BY YEAR(egc.fecha_vencimiento), MONTH(egc.fecha_vencimiento)) * 100.0) /
        NULLIF(LAG(COUNT(*)) OVER (ORDER BY YEAR(egc.fecha_vencimiento), MONTH(egc.fecha_vencimiento)), 0), 2
    ) as tasa_morosidad_anterior,
    ROUND(
        (
            (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*) -
            (LAG(COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END)) OVER (ORDER BY YEAR(egc.fecha_vencimiento), MONTH(egc.fecha_vencimiento)) * 100.0) /
            NULLIF(LAG(COUNT(*)) OVER (ORDER BY YEAR(egc.fecha_vencimiento), MONTH(egc.fecha_vencimiento)), 0)
        ), 2
    ) as variacion_porcentual
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = ?
  AND egc.estado = 'emitido'
  AND YEAR(egc.fecha_vencimiento) = YEAR(CURRENT_DATE)
  AND MONTH(egc.fecha_vencimiento) = MONTH(CURRENT_DATE)
GROUP BY YEAR(egc.fecha_vencimiento), MONTH(egc.fecha_vencimiento);

// ========================================================================================
// 2. DATOS PARA GRÁFICOS
// ========================================================================================

// GRÁFICO - TENDENCIA DE EMISIONES (Últimos 6 meses)
SELECT
    DATE_FORMAT(egc.periodo, '%Y-%m') as periodo,
    YEAR(egc.periodo) as anio,
    MONTH(egc.periodo) as mes,
    SUM(egc.monto_total) as monto_total_emisiones,
    COUNT(DISTINCT ccu.unidad_id) as cantidad_unidades,
    AVG(egc.monto_total / NULLIF((SELECT COUNT(*) FROM unidad WHERE comunidad_id = egc.comunidad_id AND activa = 1), 0)) as monto_promedio_por_unidad
FROM emision_gastos_comunes egc
JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
WHERE egc.comunidad_id = ?
  AND egc.estado = 'emitido'
  AND egc.periodo >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(egc.periodo, '%Y-%m'), YEAR(egc.periodo), MONTH(egc.periodo)
ORDER BY egc.periodo;

// GRÁFICO - ESTADO DE PAGOS (Distribución actual)
SELECT
    CASE
        WHEN ccu.saldo = 0 THEN 'Pagos al Día'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
        ELSE 'Morosos +60 días'
    END as categoria_pago,
    COUNT(*) as cantidad_unidades,
    ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER (), 2) as porcentaje,
    SUM(ccu.saldo) as monto_total_pendiente
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = ?
  AND egc.estado = 'emitido'
  AND egc.fecha_vencimiento <= CURRENT_DATE
GROUP BY
    CASE
        WHEN ccu.saldo = 0 THEN 'Pagos al Día'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
        ELSE 'Morosos +60 días'
    END
ORDER BY
    CASE
        WHEN ccu.saldo = 0 THEN 1
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 2
        WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 3
        ELSE 4
    END;

// GRÁFICO - GASTOS POR CATEGORÍA (Mes actual)
SELECT
    cg.nombre as categoria,
    cg.tipo as tipo_categoria,
    SUM(g.monto) as total_gastos,
    ROUND((SUM(g.monto) * 100.0) / SUM(SUM(g.monto)) OVER (), 2) as porcentaje_del_total,
    COUNT(g.id) as cantidad_gastos
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ?
  AND g.estado = 'aprobado'
  AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
  AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
GROUP BY cg.id, cg.nombre, cg.tipo
ORDER BY total_gastos DESC;

// GRÁFICO - CONSUMOS DE MEDIDORES (Mes actual)
SELECT
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
    END as unidad_medida
FROM consumo_unidad cu
JOIN medidor m ON cu.medidor_id = m.id
WHERE cu.comunidad_id = ?
  AND YEAR(cu.fecha_lectura) = YEAR(CURRENT_DATE)
  AND MONTH(cu.fecha_lectura) = MONTH(CURRENT_DATE)
  AND cu.estado = 'confirmado'
ORDER BY consumo DESC;

// ========================================================================================
// 3. TABLAS DE DATOS DEL DASHBOARD
// ========================================================================================

// PAGOS RECIENTES (Últimos 10 pagos)
SELECT
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
    DATEDIFF(CURRENT_DATE, p.fecha) as dias_desde_pago
FROM pago p
JOIN unidad u ON p.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
WHERE p.comunidad_id = ?
ORDER BY p.fecha DESC, p.created_at DESC
LIMIT 10;

// UNIDADES CON MOROSIDAD (Top 10 más morosas)
SELECT
    u.id as unidad_id,
    u.codigo as codigo_unidad,
    CONCAT(pe.nombres, ' ', pe.apellidos) as propietario,
    COUNT(DISTINCT egc.id) as meses_morosos,
    SUM(ccu.saldo) as deuda_total,
    MAX(DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento)) as dias_maximo_atraso,
    AVG(ccu.saldo) as deuda_promedio,
    GROUP_CONCAT(DATE_FORMAT(egc.periodo, '%m/%Y') ORDER BY egc.periodo DESC SEPARATOR ', ') as periodos_pendientes
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
LEFT JOIN persona pe ON tu.persona_id = pe.id
WHERE ccu.comunidad_id = ?
  AND egc.estado = 'emitido'
  AND ccu.saldo > 0
  AND egc.fecha_vencimiento < CURRENT_DATE
GROUP BY u.id, u.codigo, pe.nombres, pe.apellidos
ORDER BY deuda_total DESC, dias_maximo_atraso DESC
LIMIT 10;

// PRÓXIMAS ACTIVIDADES (Eventos próximos)
SELECT
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
    DATEDIFF(egc.fecha_emision, CURRENT_DATE) as dias_restantes
FROM emision_gastos_comunes egc
WHERE egc.comunidad_id = ?
  AND egc.fecha_emision >= CURRENT_DATE
  AND egc.estado = 'programada'

UNION ALL

SELECT
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
    DATEDIFF(mp.fecha_programada, CURRENT_DATE) as dias_restantes
FROM mantenimiento_programado mp
JOIN equipo e ON mp.equipo_id = e.id
WHERE mp.comunidad_id = ?
  AND mp.fecha_programada >= CURRENT_DATE
  AND mp.estado = 'programado'

UNION ALL

SELECT
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
    DATEDIFF(DATE(r.fecha_hora), CURRENT_DATE) as dias_restantes
FROM reunion r
WHERE r.comunidad_id = ?
  AND r.fecha_hora >= CURRENT_DATE
  AND r.estado = 'programada'

ORDER BY fecha_programada ASC
LIMIT 8;

// RESERVAS DE AMENIDADES (Próximas reservas)
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
    TIMESTAMPDIFF(DAY, CURRENT_DATE, DATE(ra.inicio)) as dias_para_reserva,
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
  AND ra.inicio >= CURRENT_DATE
  AND ra.estado IN ('aprobada', 'solicitada')
ORDER BY ra.inicio ASC
LIMIT 6;

// ========================================================================================
// 4. NOTIFICACIONES DEL DASHBOARD
// ========================================================================================

// NOTIFICACIONES - PAGOS VENCIDOS (Últimas 24 horas)
SELECT
    'pago_vencido' as tipo_notificacion,
    CONCAT('Pago vencido - Unidad ', u.codigo) as titulo,
    CONCAT('La unidad ', u.codigo, ' tiene un pago vencido de $', FORMAT(ccu.saldo, 0), ' desde el ', DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y')) as mensaje,
    DATE_FORMAT(ccu.updated_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
    ccu.id as referencia_id,
    'warning' as severidad
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
WHERE ccu.comunidad_id = ?
  AND egc.estado = 'emitido'
  AND ccu.saldo > 0
  AND egc.fecha_vencimiento < CURRENT_DATE
  AND ccu.updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

UNION ALL

// NOTIFICACIONES - NUEVOS PAGOS REGISTRADOS
SELECT
    'pago_registrado' as tipo_notificacion,
    CONCAT('Nuevo pago registrado - Unidad ', u.codigo) as titulo,
    CONCAT('Se registró un pago de $', FORMAT(p.monto, 0), ' para la unidad ', u.codigo) as mensaje,
    DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
    p.id as referencia_id,
    'success' as severidad
FROM pago p
JOIN unidad u ON p.unidad_id = u.id
WHERE p.comunidad_id = ?
  AND p.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

UNION ALL

// NOTIFICACIONES - GASTOS APROBADOS
SELECT
    'gasto_aprobado' as tipo_notificacion,
    CONCAT('Gasto aprobado - ', cg.nombre) as titulo,
    CONCAT('Se aprobó un gasto de $', FORMAT(g.monto, 0), ' en la categoría ', cg.nombre) as mensaje,
    DATE_FORMAT(g.updated_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
    g.id as referencia_id,
    'info' as severidad
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
WHERE g.comunidad_id = ?
  AND g.estado = 'aprobado'
  AND g.updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

UNION ALL

// NOTIFICACIONES - TICKETS DE SOPORTE CRÍTICOS
SELECT
    'ticket_critico' as tipo_notificacion,
    CONCAT('Ticket crítico - ', ts.titulo) as titulo,
    CONCAT('Nuevo ticket de soporte crítico: ', LEFT(ts.descripcion, 100), '...') as mensaje,
    DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') as fecha_notificacion,
    ts.id as referencia_id,
    'danger' as severidad
FROM ticket_soporte ts
WHERE ts.comunidad_id = ?
  AND ts.prioridad = 'critica'
  AND ts.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 24 HOUR)

ORDER BY fecha_notificacion DESC
LIMIT 10;

// ========================================================================================
// 5. MÉTRICAS ADICIONALES PARA DASHBOARD
// ========================================================================================

// MÉTRICA - EFECTIVIDAD DE COBRANZA (Mes actual)
SELECT
    ROUND(
        (SUM(CASE WHEN ccu.saldo = 0 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2
    ) as efectividad_cobranza,
    COUNT(CASE WHEN ccu.saldo = 0 THEN 1 END) as unidades_al_dia,
    COUNT(*) as total_unidades,
    SUM(ccu.monto_total) as total_emitido,
    SUM(ccu.saldo) as total_pendiente
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = ?
  AND egc.estado = 'emitido'
  AND YEAR(egc.periodo) = YEAR(CURRENT_DATE)
  AND MONTH(egc.periodo) = MONTH(CURRENT_DATE);

// MÉTRICA - AHORRO GENERADO (Comparación con presupuesto)
SELECT
    COALESCE(p.monto_presupuestado, 0) as presupuesto_mensual,
    COALESCE(SUM(g.monto), 0) as gastos_reales,
    COALESCE(p.monto_presupuestado, 0) - COALESCE(SUM(g.monto), 0) as ahorro_generado,
    ROUND(
        ((COALESCE(p.monto_presupuestado, 0) - COALESCE(SUM(g.monto), 0)) /
         NULLIF(COALESCE(p.monto_presupuestado, 0), 0)) * 100, 2
    ) as porcentaje_ahorro
FROM presupuesto_mensual p
LEFT JOIN gasto g ON p.categoria_id = g.categoria_id
    AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
    AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
    AND g.estado = 'aprobado'
WHERE p.comunidad_id = ?
  AND p.anio = YEAR(CURRENT_DATE)
  AND p.mes = MONTH(CURRENT_DATE)
GROUP BY p.id, p.monto_presupuestado;

// MÉTRICA - CONSUMO PROMEDIO POR UNIDAD
SELECT
    AVG(cu.lectura_actual - cu.lectura_anterior) as consumo_promedio,
    m.tipo_medidor,
    COUNT(DISTINCT cu.unidad_id) as unidades_con_medidor,
    SUM(cu.lectura_actual - cu.lectura_anterior) as consumo_total,
    CASE m.tipo_medidor
        WHEN 'agua' THEN 'L'
        WHEN 'electricidad' THEN 'kWh'
        WHEN 'gas' THEN 'm³'
        ELSE 'unidades'
    END as unidad_medida
FROM consumo_unidad cu
JOIN medidor m ON cu.medidor_id = m.id
WHERE cu.comunidad_id = ?
  AND YEAR(cu.fecha_lectura) = YEAR(CURRENT_DATE)
  AND MONTH(cu.fecha_lectura) = MONTH(CURRENT_DATE)
  AND cu.estado = 'confirmado'
GROUP BY m.tipo_medidor;

// MÉTRICA - TENDENCIA DE CRECIMIENTO DE INGRESOS
SELECT
    periodo_actual,
    ingresos_actual,
    ingresos_anterior,
    ROUND(
        ((ingresos_actual - ingresos_anterior) / NULLIF(ingresos_anterior, 0)) * 100, 2
    ) as crecimiento_porcentual
FROM (
    SELECT
        DATE_FORMAT(fecha, '%Y-%m') as periodo_actual,
        SUM(monto) as ingresos_actual,
        LAG(SUM(monto)) OVER (ORDER BY DATE_FORMAT(fecha, '%Y-%m')) as ingresos_anterior
    FROM pago
    WHERE comunidad_id = ?
      AND estado = 'aplicado'
      AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
    ORDER BY periodo_actual DESC
    LIMIT 1
) as tendencia;