-- // ========================================================================================
-- // EJEMPLOS DE USO DE VISTAS DE BASE DE DATOS
-- // Sistema de Cuentas Claras - Optimización de Consultas
-- // ========================================================================================

/*
 * USO DE VISTAS PARA OPTIMIZACIÓN DE CONSULTAS
 *
 * Las vistas creadas en vistas_reportes.sql permiten simplificar y optimizar
 * las consultas más comunes del módulo de reportes.
 *
 * Ventajas de usar vistas:
 * - Consultas más simples y legibles
 * - Mejor rendimiento (pre-computadas)
 * - Seguridad (ocultan lógica compleja)
 * - Mantenimiento centralizado
 */

-- // ========================================================================================
-- // 1. VISTA: resumen_financiero_mensual
-- // ========================================================================================

// Consulta DIRECTA (compleja):
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
        SELECT fecha FROM pago WHERE comunidad_id = 1 AND fecha BETWEEN '2024-01-01' AND '2024-12-31'
        UNION
        SELECT fecha FROM gasto WHERE comunidad_id = 1 AND fecha BETWEEN '2024-01-01' AND '2024-12-31'
    ) fechas
) periodos
LEFT JOIN (
    SELECT DATE_FORMAT(fecha, '%Y-%m') as periodo, SUM(monto) as ingresos_totales, COUNT(DISTINCT unidad_id) as unidades_pagadoras
    FROM pago
    WHERE comunidad_id = 1 AND estado = 'aplicado' AND fecha BETWEEN '2024-01-01' AND '2024-12-31'
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) ingresos ON periodos.periodo = ingresos.periodo
LEFT JOIN (
    SELECT DATE_FORMAT(fecha, '%Y-%m') as periodo, SUM(monto) as gastos_totales
    FROM gasto
    WHERE comunidad_id = 1 AND estado = 'aprobado' AND fecha BETWEEN '2024-01-01' AND '2024-12-31'
    GROUP BY DATE_FORMAT(fecha, '%Y-%m')
) gastos ON periodos.periodo = gastos.periodo
ORDER BY periodo DESC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM resumen_financiero_mensual
WHERE comunidad_id = 1
  AND periodo BETWEEN '2024-01' AND '2024-12'
ORDER BY periodo DESC;

-- // ========================================================================================
-- // 2. VISTA: kpis_financieros
-- // ========================================================================================

// Consulta DIRECTA (muy compleja):
SELECT
    (SELECT SUM(monto) FROM pago WHERE comunidad_id = 1 AND estado = 'aplicado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes_actual,
    (SELECT SUM(monto) FROM gasto WHERE comunidad_id = 1 AND estado = 'aprobado'
     AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes_actual,
    ((SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = 1 AND estado = 'aplicado') -
     (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = 1 AND estado = 'aprobado')) as saldo_actual,
    (SELECT ROUND(
        (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / COUNT(*), 2
     ) FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = 1 AND egc.estado = 'emitido') as porcentaje_morosidad,
    (SELECT COUNT(*) FROM unidad WHERE comunidad_id = 1 AND activa = 1) as total_unidades,
    (SELECT COUNT(DISTINCT ccu.unidad_id)
     FROM cuenta_cobro_unidad ccu
     JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
     WHERE ccu.comunidad_id = 1 AND egc.estado = 'emitido' AND ccu.saldo = 0) as unidades_al_dia;

-- // Consulta OPTIMIZADA usando vista:
SELECT * FROM kpis_financieros WHERE comunidad_id = 1;

-- // ========================================================================================
-- // 3. VISTA: gastos_detallados_view
-- // ========================================================================================

// Consulta DIRECTA:
SELECT
    g.id, g.numero, DATE_FORMAT(g.fecha, '%d/%m/%Y') as fecha,
    cg.nombre as categoria, cg.tipo as tipo_categoria,
    cc.nombre as centro_costo, g.monto, g.glosa, g.estado,
    p.razon_social as proveedor, dc.folio as documento_folio,
    dc.tipo_doc, u.username as creado_por,
    DATE_FORMAT(g.created_at, '%d/%m/%Y %H:%i') as fecha_creacion
FROM gasto g
JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN usuario u ON g.creado_por = u.id
WHERE g.comunidad_id = 1 AND g.estado = 'aprobado'
ORDER BY g.fecha DESC, g.monto DESC;

-- // Consulta OPTIMIZADA usando vista:
SELECT * FROM gastos_detallados_view
WHERE comunidad_id = 1
ORDER BY fecha DESC, monto DESC;

-- // ========================================================================================
-- // 4. VISTA: estado_morosidad_view
-- // ========================================================================================

// Consulta DIRECTA:
SELECT
    u.id as unidad_id, u.codigo as codigo_unidad,
    CONCAT(p.nombres, ' ', p.apellidos) as propietario,
    ccu.monto_total as deuda_total, ccu.saldo as saldo_pendiente,
    ccu.interes_acumulado, ccu.estado, DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) as dias_vencidos,
    CASE WHEN ccu.saldo = 0 THEN 'Al día'
         WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 30 THEN 'Moroso reciente'
         WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 90 THEN 'Moroso medio'
         ELSE 'Moroso crónico' END as categoria_morosidad,
    DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y') as fecha_vencimiento,
    DATE_FORMAT(egc.periodo, '%m/%Y') as periodo
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
JOIN unidad u ON ccu.unidad_id = u.id
LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario'
LEFT JOIN persona pe ON tu.persona_id = pe.id
WHERE ccu.comunidad_id = 1 AND egc.estado = 'emitido' AND ccu.saldo > 0
ORDER BY ccu.saldo DESC, dias_vencidos DESC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM estado_morosidad_view
WHERE comunidad_id = 1
ORDER BY saldo_pendiente DESC, dias_vencidos DESC;

// ========================================================================================
// 5. VISTA: tickets_soporte_view
// ========================================================================================

// Consulta DIRECTA:
SELECT
    ts.id, ts.titulo, ts.descripcion, ts.categoria, ts.prioridad, ts.estado,
    DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') as fecha_creacion,
    DATE_FORMAT(ts.updated_at, '%d/%m/%Y %H:%i') as fecha_actualizacion,
    u.codigo as unidad_afectada,
    CONCAT(p.nombres, ' ', p.apellidos) as reportado_por,
    ua.username as asignado_a,
    DATEDIFF(CURRENT_DATE, DATE(ts.created_at)) as dias_abierto
FROM ticket_soporte ts
LEFT JOIN unidad u ON ts.unidad_id = u.id
LEFT JOIN usuario ur ON ts.id = ur.id
LEFT JOIN persona p ON ur.persona_id = p.id
LEFT JOIN usuario ua ON ts.asignado_a = ua.id
WHERE ts.comunidad_id = 1
ORDER BY CASE ts.prioridad WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 WHEN 'baja' THEN 4 END,
         ts.created_at DESC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM tickets_soporte_view
WHERE comunidad_id = 1
ORDER BY prioridad_order, created_at DESC;

// ========================================================================================
// 6. VISTA: reservas_amenidades_view
// ========================================================================================

// Consulta DIRECTA:
SELECT
    ra.id, a.nombre as amenidad, a.tarifa,
    DATE_FORMAT(ra.inicio, '%d/%m/%Y %H:%i') as fecha_inicio,
    DATE_FORMAT(ra.fin, '%d/%m/%Y %H:%i') as fecha_fin,
    ra.estado, u.codigo as unidad_reserva,
    CONCAT(p.nombres, ' ', p.apellidos) as reservado_por,
    TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin) as horas_reserva,
    CASE WHEN ra.estado = 'cumplida' THEN 'Completada'
         WHEN ra.estado = 'aprobada' THEN 'Confirmada'
         WHEN ra.estado = 'solicitada' THEN 'Pendiente'
         ELSE 'Cancelada' END as estado_descripcion
FROM reserva_amenidad ra
JOIN amenidad a ON ra.amenidad_id = a.id
JOIN unidad u ON ra.unidad_id = u.id
JOIN persona p ON ra.persona_id = p.id
WHERE ra.comunidad_id = 1
ORDER BY ra.inicio DESC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM reservas_amenidades_view
WHERE comunidad_id = 1
ORDER BY inicio DESC;

// ========================================================================================
// 7. VISTA: consumo_unidades_view
// ========================================================================================

// Consulta DIRECTA:
SELECT
    cu.id, u.codigo as unidad, m.nombre as medidor,
    DATE_FORMAT(cu.fecha_lectura, '%d/%m/%Y') as fecha_lectura,
    cu.lectura_anterior, cu.lectura_actual,
    cu.consumo, cu.monto_calculado,
    DATE_FORMAT(cu.fecha_vencimiento, '%d/%m/%Y') as fecha_vencimiento,
    cu.estado, cu.observaciones,
    CASE WHEN cu.estado = 'pendiente' AND cu.fecha_vencimiento < CURRENT_DATE THEN 'Vencido'
         WHEN cu.estado = 'pendiente' THEN 'Pendiente'
         WHEN cu.estado = 'pagado' THEN 'Pagado'
         ELSE 'Anulado' END as estado_descripcion
FROM consumo_unidad cu
JOIN unidad u ON cu.unidad_id = u.id
JOIN medidor m ON cu.medidor_id = m.id
WHERE cu.comunidad_id = 1
ORDER BY cu.fecha_lectura DESC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM consumo_unidades_view
WHERE comunidad_id = 1
ORDER BY fecha_lectura DESC;

// ========================================================================================
// 8. VISTA: multas_pendientes_view
// ========================================================================================

// Consulta DIRECTA:
SELECT
    m.id, u.codigo as unidad, tm.nombre as tipo_multa,
    m.monto, m.descripcion,
    DATE_FORMAT(m.fecha_incurrida, '%d/%m/%Y') as fecha_incurrida,
    DATE_FORMAT(m.fecha_vencimiento, '%d/%m/%Y') as fecha_vencimiento,
    m.estado, DATEDIFF(CURRENT_DATE, m.fecha_vencimiento) as dias_vencidos,
    CASE WHEN m.estado = 'pendiente' AND m.fecha_vencimiento < CURRENT_DATE THEN 'Vencida'
         WHEN m.estado = 'pendiente' THEN 'Pendiente'
         WHEN m.estado = 'pagada' THEN 'Pagada'
         ELSE 'Anulada' END as estado_descripcion
FROM multa m
JOIN unidad u ON m.unidad_id = u.id
JOIN tipo_multa tm ON m.tipo_multa_id = tm.id
WHERE m.comunidad_id = 1
ORDER BY m.fecha_vencimiento ASC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM multas_pendientes_view
WHERE comunidad_id = 1
ORDER BY fecha_vencimiento ASC;

// ========================================================================================
// 9. VISTA: tendencias_gastos_view
// ========================================================================================

// Consulta DIRECTA (muy compleja con análisis de tendencias):
SELECT
    periodo, anio, mes,
    gastos_totales,
    LAG(gastos_totales) OVER (ORDER BY periodo) as gastos_mes_anterior,
    ROUND(
        ((gastos_totales - LAG(gastos_totales) OVER (ORDER BY periodo)) /
         NULLIF(LAG(gastos_totales) OVER (ORDER BY periodo), 0)) * 100, 2
    ) as variacion_porcentual,
    AVG(gastos_totales) OVER (ORDER BY periodo ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as promedio_3_meses,
    SUM(gastos_totales) OVER (PARTITION BY anio) as total_anual,
    RANK() OVER (PARTITION BY anio ORDER BY gastos_totales DESC) as ranking_mes_anio
FROM (
    SELECT
        DATE_FORMAT(fecha, '%Y-%m') as periodo,
        YEAR(fecha) as anio,
        MONTH(fecha) as mes,
        SUM(monto) as gastos_totales
    FROM gasto
    WHERE comunidad_id = 1 AND estado = 'aprobado'
    GROUP BY DATE_FORMAT(fecha, '%Y-%m'), YEAR(fecha), MONTH(fecha)
) gastos_mensuales
ORDER BY periodo DESC;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM tendencias_gastos_view
WHERE comunidad_id = 1
ORDER BY periodo DESC;

// ========================================================================================
// 10. VISTA: dashboard_resumen_view
// ========================================================================================

// Consulta DIRECTA (dashboard completo):
SELECT
    'financiero' as tipo_reporte,
    'Ingresos del Mes' as indicador,
    SUM(monto) as valor,
    'monto' as unidad
FROM pago
WHERE comunidad_id = 1 AND estado = 'aplicado'
  AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)

UNION ALL

SELECT
    'financiero' as tipo_reporte,
    'Gastos del Mes' as indicador,
    SUM(monto) as valor,
    'monto' as unidad
FROM gasto
WHERE comunidad_id = 1 AND estado = 'aprobado'
  AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)

UNION ALL

SELECT
    'operacional' as tipo_reporte,
    'Tickets Abiertos' as indicador,
    COUNT(*) as valor,
    'cantidad' as unidad
FROM ticket_soporte
WHERE comunidad_id = 1 AND estado IN ('abierto', 'en_progreso')

UNION ALL

SELECT
    'operacional' as tipo_reporte,
    'Unidades Morosas' as indicador,
    COUNT(DISTINCT ccu.unidad_id) as valor,
    'cantidad' as unidad
FROM cuenta_cobro_unidad ccu
JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
WHERE ccu.comunidad_id = 1 AND egc.estado = 'emitido' AND ccu.saldo > 0;

// Consulta OPTIMIZADA usando vista:
SELECT * FROM dashboard_resumen_view
WHERE comunidad_id = 1
ORDER BY tipo_reporte, indicador;

// ========================================================================================
// EJEMPLOS DE USO EN APLICACIONES
// ========================================================================================

/*
 * INTEGRACIÓN CON APLICACIONES
 *
 * Las vistas pueden ser usadas directamente en:
 * - APIs REST
 * - Reportes Jasper/BIRT
 * - Dashboards Power BI/Tableau
 * - Consultas directas desde aplicaciones
 */

// Ejemplo de uso en API Node.js:
const express = require('express');
const db = require('../config/database');

app.get('/api/reportes/dashboard/:comunidadId', async (req, res) => {
    const { comunidadId } = req.params;

    try {
        // Usando vistas para consultas optimizadas
        const [kpis] = await db.execute('SELECT * FROM kpis_financieros WHERE comunidad_id = ?', [comunidadId]);
        const [resumen] = await db.execute('SELECT * FROM resumen_financiero_mensual WHERE comunidad_id = ? ORDER BY periodo DESC LIMIT 12', [comunidadId]);
        const [morosidad] = await db.execute('SELECT COUNT(*) as total_morosos FROM estado_morosidad_view WHERE comunidad_id = ?', [comunidadId]);
        const [tickets] = await db.execute('SELECT COUNT(*) as tickets_abiertos FROM tickets_soporte_view WHERE comunidad_id = ? AND estado IN ("abierto", "en_progreso")', [comunidadId]);

        res.json({
            kpis: kpis[0],
            resumenFinanciero: resumen,
            estadisticas: {
                unidadesMorosas: morosidad[0].total_morosos,
                ticketsAbiertos: tickets[0].tickets_abiertos
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo dashboard' });
    }
});

// Ejemplo de uso en Python (Django/FastAPI):
def get_dashboard_data(comunidad_id):
    with connection.cursor() as cursor:
        # Usando vistas para optimización
        cursor.execute("""
            SELECT * FROM dashboard_resumen_view
            WHERE comunidad_id = %s
            ORDER BY tipo_reporte, indicador
        """, [comunidad_id])

        dashboard_data = cursor.fetchall()

        return {
            'financiero': [row for row in dashboard_data if row[0] == 'financiero'],
            'operacional': [row for row in dashboard_data if row[0] == 'operacional']
        }

// Ejemplo de uso en consultas SQL directas para reportes:
-- Reporte mensual completo usando vistas
SELECT
    rf.periodo,
    rf.ingresos,
    rf.gastos,
    rf.saldo,
    em.total_morosos,
    ts.tickets_abiertos
FROM resumen_financiero_mensual rf
LEFT JOIN (
    SELECT DATE_FORMAT(fecha_vencimiento, '%Y-%m') as periodo, COUNT(*) as total_morosos
    FROM estado_morosidad_view
    WHERE comunidad_id = 1
    GROUP BY DATE_FORMAT(fecha_vencimiento, '%Y-%m')
) em ON rf.periodo = em.periodo
LEFT JOIN (
    SELECT DATE_FORMAT(created_at, '%Y-%m') as periodo, COUNT(*) as tickets_abiertos
    FROM tickets_soporte_view
    WHERE comunidad_id = 1 AND estado IN ('abierto', 'en_progreso')
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
) ts ON rf.periodo = ts.periodo
WHERE rf.comunidad_id = 1
ORDER BY rf.periodo DESC;

// ========================================================================================
// MANTENIMIENTO DE VISTAS
// ========================================================================================

/*
 * RECREAR VISTAS DESPUÉS DE CAMBIOS EN ESQUEMA
 *
 * Si se modifican las tablas base, las vistas deben recrearse.
 * Ejecutar el archivo vistas_reportes.sql completo para actualizar todas las vistas.
 */

// Script de mantenimiento:
-- 1. Verificar vistas existentes
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';

-- 2. Recrear vistas (ejecutar vistas_reportes.sql)

-- 3. Verificar que las vistas funcionan
SELECT COUNT(*) FROM resumen_financiero_mensual WHERE comunidad_id = 1;
SELECT COUNT(*) FROM kpis_financieros WHERE comunidad_id = 1;

-- 4. Otorgar permisos si es necesario
GRANT SELECT ON resumen_financiero_mensual TO 'reportes_user'@'%';
GRANT SELECT ON kpis_financieros TO 'reportes_user'@'%';

/*
 * OPTIMIZACIÓN DE VISTAS
 *
 * Para mejorar el rendimiento de las vistas:
 * 1. Crear índices en las columnas más usadas para filtrado
 * 2. Considerar vistas materializadas para datos que no cambian frecuentemente
 * 3. Usar EXPLAIN para analizar el plan de ejecución
 */

// Ejemplo de índices recomendados:
CREATE INDEX idx_gasto_comunidad_fecha ON gasto(comunidad_id, fecha, estado);
CREATE INDEX idx_pago_comunidad_fecha ON pago(comunidad_id, fecha, estado);
CREATE INDEX idx_ticket_comunidad_estado ON ticket_soporte(comunidad_id, estado);
CREATE INDEX idx_cuenta_cobro_comunidad ON cuenta_cobro_unidad(comunidad_id, saldo);

// Verificar rendimiento:
EXPLAIN SELECT * FROM resumen_financiero_mensual WHERE comunidad_id = 1 AND periodo >= '2024-01';