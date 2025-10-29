const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Métricas y datos para el dashboard principal
 */

// =========================================
// 1. KPIs PRINCIPALES
// =========================================

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/kpis:
 *   get:
 *     tags: [Dashboard]
 *     summary: Obtener todos los KPIs principales del dashboard
 */
router.get('/comunidad/:comunidadId/kpis', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    // Ejecutar todas las consultas en paralelo
    const [saldoTotal, ingresosMes, gastosMes, morosidad] = await Promise.all([
      obtenerSaldoTotal(comunidadId),
      obtenerIngresosMes(comunidadId),
      obtenerGastosMes(comunidadId),
      obtenerTasaMorosidad(comunidadId)
    ]);

    res.json({
      saldo_total: saldoTotal,
      ingresos_mes: ingresosMes,
      gastos_mes: gastosMes,
      morosidad: morosidad
    });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    res.status(500).json({ error: 'Error al obtener KPIs' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/saldo-total:
 *   get:
 *     tags: [Dashboard]
 *     summary: KPI - Saldo total de la comunidad
 */
router.get('/comunidad/:comunidadId/saldo-total', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const result = await obtenerSaldoTotal(comunidadId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener saldo total:', error);
    res.status(500).json({ error: 'Error al obtener saldo total' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/ingresos-mes:
 *   get:
 *     tags: [Dashboard]
 *     summary: KPI - Ingresos del mes actual
 */
router.get('/comunidad/:comunidadId/ingresos-mes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const result = await obtenerIngresosMes(comunidadId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener ingresos del mes:', error);
    res.status(500).json({ error: 'Error al obtener ingresos del mes' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/gastos-mes:
 *   get:
 *     tags: [Dashboard]
 *     summary: KPI - Gastos del mes actual
 */
router.get('/comunidad/:comunidadId/gastos-mes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const result = await obtenerGastosMes(comunidadId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener gastos del mes:', error);
    res.status(500).json({ error: 'Error al obtener gastos del mes' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/tasa-morosidad:
 *   get:
 *     tags: [Dashboard]
 *     summary: KPI - Tasa de morosidad
 */
router.get('/comunidad/:comunidadId/tasa-morosidad', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const result = await obtenerTasaMorosidad(comunidadId);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener tasa de morosidad:', error);
    res.status(500).json({ error: 'Error al obtener tasa de morosidad' });
  }
});

// =========================================
// 2. DATOS PARA GRÁFICOS
// =========================================

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/grafico-emisiones:
 *   get:
 *     tags: [Dashboard]
 *     summary: Tendencia de emisiones (últimos 6 meses)
 *     parameters:
 *       - name: meses
 *         in: query
 *         schema:
 *           type: integer
 *           default: 6
 */
router.get('/comunidad/:comunidadId/grafico-emisiones', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { meses = 6 } = req.query;

    const query = `
      SELECT
        egc.periodo AS periodo,
        YEAR(STR_TO_DATE(CONCAT(egc.periodo, '-01'), '%Y-%m-%d')) AS anio,
        MONTH(STR_TO_DATE(CONCAT(egc.periodo, '-01'), '%Y-%m-%d')) AS mes,
        SUM(ccu.monto_total) AS monto_total_emisiones,
        COUNT(DISTINCT ccu.unidad_id) AS cantidad_unidades,
        AVG(ccu.monto_total) AS monto_promedio_por_unidad
      FROM emision_gastos_comunes egc
      JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      WHERE egc.comunidad_id = ?
        AND egc.estado IN ('emitido', 'cerrado')
        AND egc.periodo >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH), '%Y-%m')
      GROUP BY egc.periodo
      ORDER BY egc.periodo
    `;

    const [rows] = await db.query(query, [comunidadId, Number(meses)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener gráfico de emisiones:', error);
    res.status(500).json({ error: 'Error al obtener gráfico de emisiones' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/grafico-estado-pagos:
 *   get:
 *     tags: [Dashboard]
 *     summary: Distribución de estado de pagos
 */
router.get('/comunidad/:comunidadId/grafico-estado-pagos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        CASE
          WHEN ccu.saldo = 0 THEN 'Pagos al Día'
          WHEN ccu.saldo > 0 AND egc.fecha_vencimiento >= CURRENT_DATE THEN 'Pendiente'
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
      GROUP BY categoria_pago
      ORDER BY
        CASE
          WHEN categoria_pago = 'Pagos al Día' THEN 1
          WHEN categoria_pago = 'Pendiente' THEN 2
          WHEN categoria_pago = 'Atrasados 1-30 días' THEN 3
          WHEN categoria_pago = 'Atrasados 31-60 días' THEN 4
          ELSE 5
        END
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener gráfico de estado de pagos:', error);
    res.status(500).json({ error: 'Error al obtener gráfico de estado de pagos' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/grafico-gastos-categoria:
 *   get:
 *     tags: [Dashboard]
 *     summary: Gastos por categoría (mes actual)
 */
router.get('/comunidad/:comunidadId/grafico-gastos-categoria', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
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
      ORDER BY total_gastos DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener gráfico de gastos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener gráfico de gastos por categoría' });
  }
});

// =========================================
// 3. TABLAS DE DATOS
// =========================================

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/pagos-recientes:
 *   get:
 *     tags: [Dashboard]
 *     summary: Últimos pagos registrados
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 */
router.get('/comunidad/:comunidadId/pagos-recientes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 10 } = req.query;

    const query = `
      SELECT
        p.id,
        u.codigo AS unidad,
        CONCAT(pe.nombres, ' ', pe.apellidos) AS propietario,
        p.monto,
        DATE_FORMAT(p.fecha, '%d/%m/%Y') AS fecha_pago,
        p.estado,
        p.referencia AS referencia_pago,
        CASE
          WHEN p.estado = 'aplicado' THEN 'Conciliado'
          WHEN p.estado = 'pendiente' THEN 'Pendiente'
          ELSE 'Rechazado'
        END AS estado_descripcion,
        DATEDIFF(CURRENT_DATE, p.fecha) AS dias_desde_pago
      FROM pago p
      JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
      LEFT JOIN persona pe ON tu.persona_id = pe.id
      WHERE p.comunidad_id = ?
      ORDER BY p.fecha DESC, p.created_at DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [comunidadId, Number(limit)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener pagos recientes:', error);
    res.status(500).json({ error: 'Error al obtener pagos recientes' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/unidades-morosas:
 *   get:
 *     tags: [Dashboard]
 *     summary: Top unidades con morosidad
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 */
router.get('/comunidad/:comunidadId/unidades-morosas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 10 } = req.query;

    const query = `
      SELECT
        u.id AS unidad_id,
        u.codigo AS codigo_unidad,
        CONCAT(pe.nombres, ' ', pe.apellidos) AS propietario,
        COUNT(DISTINCT ccu.emision_id) AS meses_morosos,
        SUM(ccu.saldo) AS deuda_total,
        MAX(DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento)) AS dias_maximo_atraso,
        AVG(ccu.saldo) AS deuda_promedio,
        GROUP_CONCAT(egc.periodo ORDER BY egc.periodo DESC SEPARATOR ', ') AS periodos_pendientes
      FROM cuenta_cobro_unidad ccu
      JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
      LEFT JOIN persona pe ON tu.persona_id = pe.id
      WHERE ccu.comunidad_id = ?
        AND egc.estado IN ('emitido', 'cerrado')
        AND ccu.saldo > 0
        AND egc.fecha_vencimiento < CURRENT_DATE
      GROUP BY u.id, u.codigo, pe.nombres, pe.apellidos
      ORDER BY deuda_total DESC, dias_maximo_atraso DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [comunidadId, Number(limit)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener unidades morosas:', error);
    res.status(500).json({ error: 'Error al obtener unidades morosas' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/proximas-actividades:
 *   get:
 *     tags: [Dashboard]
 *     summary: Próximas actividades y eventos
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 8
 */
router.get('/comunidad/:comunidadId/proximas-actividades', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 8 } = req.query;

    const query = `
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
        AND egc.estado = 'emitido'
      ORDER BY fecha_programada ASC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [comunidadId, Number(limit)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener próximas actividades:', error);
    res.status(500).json({ error: 'Error al obtener próximas actividades' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/reservas-amenidades:
 *   get:
 *     tags: [Dashboard]
 *     summary: Próximas reservas de amenidades
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 6
 */
router.get('/comunidad/:comunidadId/reservas-amenidades', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 6 } = req.query;

    const query = `
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
      LIMIT ?
    `;

    const [rows] = await db.query(query, [comunidadId, Number(limit)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reservas de amenidades:', error);
    res.status(500).json({ error: 'Error al obtener reservas de amenidades' });
  }
});

// =========================================
// 4. NOTIFICACIONES
// =========================================

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/notificaciones:
 *   get:
 *     tags: [Dashboard]
 *     summary: Notificaciones recientes (últimas 24 horas)
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 */
router.get('/comunidad/:comunidadId/notificaciones', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 10 } = req.query;

    const query = `
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
        AND ccu.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)

      UNION ALL

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
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)

      UNION ALL

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
        AND g.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)

      UNION ALL

      SELECT
        'ticket_critico' AS tipo_notificacion,
        CONCAT('Ticket crítico - ', ts.titulo) AS titulo,
        CONCAT('Nuevo ticket de soporte crítico: ', LEFT(ts.descripcion, 100), '...') AS mensaje,
        DATE_FORMAT(ts.created_at, '%d/%m/%Y %H:%i') AS fecha_notificacion,
        ts.id AS referencia_id,
        'danger' AS severidad
      FROM ticket_soporte ts
      WHERE ts.comunidad_id = ?
        AND ts.prioridad = 'alta'
        AND ts.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)

      ORDER BY fecha_notificacion DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [comunidadId, comunidadId, comunidadId, comunidadId, Number(limit)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// =========================================
// 5. MÉTRICAS ADICIONALES
// =========================================

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/efectividad-cobranza:
 *   get:
 *     tags: [Dashboard]
 *     summary: Métrica de efectividad de cobranza (mes actual)
 */
router.get('/comunidad/:comunidadId/efectividad-cobranza', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
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
        AND egc.periodo = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
    `;

    const [[result]] = await db.query(query, [comunidadId]);

    res.json(result || {});
  } catch (error) {
    console.error('Error al obtener efectividad de cobranza:', error);
    res.status(500).json({ error: 'Error al obtener efectividad de cobranza' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/tendencia-ingresos:
 *   get:
 *     tags: [Dashboard]
 *     summary: Tendencia de crecimiento de ingresos
 */
router.get('/comunidad/:comunidadId/tendencia-ingresos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
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
          AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 13 MONTH)
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        ORDER BY periodo_actual DESC
        LIMIT 1
      ) AS t
    `;

    const [[result]] = await db.query(query, [comunidadId]);

    res.json(result || {});
  } catch (error) {
    console.error('Error al obtener tendencia de ingresos:', error);
    res.status(500).json({ error: 'Error al obtener tendencia de ingresos' });
  }
});

/**
 * @swagger
 * /api/dashboard/comunidad/{comunidadId}/resumen-completo:
 *   get:
 *     tags: [Dashboard]
 *     summary: Resumen completo del dashboard (todos los datos en una sola llamada)
 */
router.get('/comunidad/:comunidadId/resumen-completo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    // Ejecutar todas las consultas en paralelo para mayor eficiencia
    const [
      saldoTotal,
      ingresosMes,
      gastosMes,
      morosidad,
      [emisiones],
      [estadoPagos],
      [gastosCategoria],
      [pagosRecientes],
      [unidadesMorosas],
      [proximasActividades],
      [notificaciones],
      [[efectividad]]
    ] = await Promise.all([
      obtenerSaldoTotal(comunidadId),
      obtenerIngresosMes(comunidadId),
      obtenerGastosMes(comunidadId),
      obtenerTasaMorosidad(comunidadId),
      db.query(`
        SELECT egc.periodo, SUM(ccu.monto_total) AS monto_total_emisiones, COUNT(DISTINCT ccu.unidad_id) AS cantidad_unidades
        FROM emision_gastos_comunes egc
        JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
        WHERE egc.comunidad_id = ? AND egc.estado IN ('emitido', 'cerrado')
          AND egc.periodo >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH), '%Y-%m')
        GROUP BY egc.periodo ORDER BY egc.periodo
      `, [comunidadId]),
      db.query(`
        SELECT
          CASE WHEN ccu.saldo = 0 THEN 'Pagos al Día'
               WHEN ccu.saldo > 0 AND egc.fecha_vencimiento >= CURRENT_DATE THEN 'Pendiente'
               WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Atrasados 1-30 días'
               WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 60 THEN 'Atrasados 31-60 días'
               ELSE 'Morosos +60 días' END AS categoria_pago,
          COUNT(*) AS cantidad_unidades,
          SUM(ccu.saldo) AS monto_total_pendiente
        FROM cuenta_cobro_unidad ccu
        JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
        WHERE ccu.comunidad_id = ? AND egc.estado IN ('emitido', 'cerrado')
        GROUP BY categoria_pago
      `, [comunidadId]),
      db.query(`
        SELECT cg.nombre AS categoria, SUM(g.monto) AS total_gastos, COUNT(g.id) AS cantidad_gastos
        FROM gasto g JOIN categoria_gasto cg ON g.categoria_id = cg.id
        WHERE g.comunidad_id = ? AND g.estado = 'aprobado'
          AND YEAR(g.fecha) = YEAR(CURRENT_DATE) AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
        GROUP BY cg.id, cg.nombre ORDER BY total_gastos DESC LIMIT 10
      `, [comunidadId]),
      db.query(`
        SELECT p.id, u.codigo AS unidad, p.monto, DATE_FORMAT(p.fecha, '%d/%m/%Y') AS fecha_pago, p.estado
        FROM pago p JOIN unidad u ON p.unidad_id = u.id
        WHERE p.comunidad_id = ?
        ORDER BY p.fecha DESC LIMIT 10
      `, [comunidadId]),
      db.query(`
        SELECT u.codigo AS codigo_unidad, SUM(ccu.saldo) AS deuda_total, COUNT(DISTINCT ccu.emision_id) AS meses_morosos
        FROM cuenta_cobro_unidad ccu
        JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
        JOIN unidad u ON ccu.unidad_id = u.id
        WHERE ccu.comunidad_id = ? AND egc.estado IN ('emitido', 'cerrado')
          AND ccu.saldo > 0 AND egc.fecha_vencimiento < CURRENT_DATE
        GROUP BY u.id, u.codigo ORDER BY deuda_total DESC LIMIT 10
      `, [comunidadId]),
      db.query(`
        SELECT CONCAT('Emisión de Gastos - ', egc.periodo) AS titulo,
               DATE_FORMAT(egc.fecha_vencimiento, '%d/%m/%Y') AS fecha_formateada,
               DATEDIFF(egc.fecha_vencimiento, CURRENT_DATE) AS dias_restantes
        FROM emision_gastos_comunes egc
        WHERE egc.comunidad_id = ? AND egc.fecha_vencimiento >= CURRENT_DATE AND egc.estado = 'emitido'
        ORDER BY egc.fecha_vencimiento ASC LIMIT 5
      `, [comunidadId]),
      db.query(`
        SELECT 'pago_registrado' AS tipo_notificacion, CONCAT('Nuevo pago - Unidad ', u.codigo) AS titulo,
               DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i') AS fecha_notificacion, 'success' AS severidad
        FROM pago p JOIN unidad u ON p.unidad_id = u.id
        WHERE p.comunidad_id = ? AND p.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY p.created_at DESC LIMIT 5
      `, [comunidadId]),
      db.query(`
        SELECT COUNT(CASE WHEN ccu.saldo = 0 THEN 1 END) AS unidades_al_dia, COUNT(*) AS total_unidades
        FROM cuenta_cobro_unidad ccu JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
        WHERE ccu.comunidad_id = ? AND egc.estado IN ('emitido', 'cerrado')
          AND egc.periodo = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
      `, [comunidadId])
    ]);

    res.json({
      kpis: {
        saldo_total: saldoTotal,
        ingresos_mes: ingresosMes,
        gastos_mes: gastosMes,
        morosidad: morosidad
      },
      graficos: {
        emisiones: emisiones,
        estado_pagos: estadoPagos,
        gastos_categoria: gastosCategoria
      },
      tablas: {
        pagos_recientes: pagosRecientes,
        unidades_morosas: unidadesMorosas,
        proximas_actividades: proximasActividades
      },
      notificaciones: notificaciones,
      metricas: {
        efectividad_cobranza: efectividad
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen completo:', error);
    res.status(500).json({ error: 'Error al obtener resumen completo' });
  }
});

// =========================================
// FUNCIONES AUXILIARES
// =========================================

async function obtenerSaldoTotal(comunidadId) {
  const query = `
    WITH TransaccionesMensuales AS (
      SELECT
        DATE_FORMAT(fecha, '%Y-%m-01') AS periodo_mes,
        SUM(CASE WHEN source = 'pago' THEN monto ELSE -monto END) AS flujo_neto_mensual
      FROM (
        SELECT fecha, monto, 'pago' AS source FROM pago WHERE comunidad_id = ? AND estado = 'aplicado'
        UNION ALL
        SELECT fecha, monto, 'gasto' AS source FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado'
      ) AS transacciones
      GROUP BY periodo_mes
      ORDER BY periodo_mes
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
    LIMIT 1
  `;

  const [[result]] = await db.query(query, [comunidadId, comunidadId]);
  return result || { saldo_total: 0, variacion_porcentual: 0 };
}

async function obtenerIngresosMes(comunidadId) {
  const query = `
    SELECT
      SUM(p.monto) AS ingresos_mes_actual,
      ROUND(
        (SUM(p.monto) - LAG(SUM(p.monto)) OVER (ORDER BY YEAR(p.fecha), MONTH(p.fecha))) /
        NULLIF(LAG(SUM(p.monto)) OVER (ORDER BY YEAR(p.fecha), MONTH(p.fecha)), 0) * 100, 2
      ) AS variacion_porcentual
    FROM pago p
    WHERE p.comunidad_id = ?
      AND p.estado = 'aplicado'
      AND p.fecha >= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 1 MONTH)
    GROUP BY YEAR(p.fecha), MONTH(p.fecha)
    ORDER BY YEAR(p.fecha) DESC, MONTH(p.fecha) DESC
    LIMIT 1
  `;

  const [[result]] = await db.query(query, [comunidadId]);
  return result || { ingresos_mes_actual: 0, variacion_porcentual: 0 };
}

async function obtenerGastosMes(comunidadId) {
  const query = `
    SELECT
      SUM(g.monto) AS gastos_mes_actual,
      ROUND(
        (SUM(g.monto) - LAG(SUM(g.monto)) OVER (ORDER BY YEAR(g.fecha), MONTH(g.fecha))) /
        NULLIF(LAG(SUM(g.monto)) OVER (ORDER BY YEAR(g.fecha), MONTH(g.fecha)), 0) * 100, 2
      ) AS variacion_porcentual
    FROM gasto g
    WHERE g.comunidad_id = ?
      AND g.estado = 'aprobado'
      AND g.fecha >= DATE_SUB(LAST_DAY(CURRENT_DATE), INTERVAL 1 MONTH)
    GROUP BY YEAR(g.fecha), MONTH(g.fecha)
    ORDER BY YEAR(g.fecha) DESC, MONTH(g.fecha) DESC
    LIMIT 1
  `;

  const [[result]] = await db.query(query, [comunidadId]);
  return result || { gastos_mes_actual: 0, variacion_porcentual: 0 };
}

async function obtenerTasaMorosidad(comunidadId) {
  const query = `
    WITH EmisionesActuales AS (
      SELECT id, fecha_vencimiento, comunidad_id
      FROM emision_gastos_comunes
      WHERE comunidad_id = ?
        AND estado IN ('emitido', 'cerrado')
      ORDER BY fecha_vencimiento DESC
      LIMIT 2
    ),
    CalculoMorosidad AS (
      SELECT
        egc.fecha_vencimiento AS periodo_vencimiento,
        COUNT(CASE WHEN ccu.saldo > 0 AND egc.fecha_vencimiento < CURRENT_DATE THEN 1 END) AS unidades_morosas,
        COUNT(ccu.id) AS total_cuentas
      FROM cuenta_cobro_unidad ccu
      JOIN EmisionesActuales egc ON ccu.emision_id = egc.id
      WHERE egc.comunidad_id = ccu.comunidad_id
      GROUP BY egc.fecha_vencimiento
      ORDER BY egc.fecha_vencimiento
    )
    SELECT
      ROUND(
        (cm.unidades_morosas * 100.0) / NULLIF(cm.total_cuentas, 0), 2
      ) AS tasa_morosidad_actual,
      ROUND(
        (LAG(cm.unidades_morosas, 1, cm.unidades_morosas) OVER (ORDER BY cm.periodo_vencimiento) * 100.0) /
        NULLIF(LAG(cm.total_cuentas, 1, cm.total_cuentas) OVER (ORDER BY cm.periodo_vencimiento), 0), 2
      ) AS tasa_morosidad_anterior,
      ROUND(
        (
          (cm.unidades_morosas * 100.0 / NULLIF(cm.total_cuentas, 0)) -
          (LAG(cm.unidades_morosas, 1, cm.unidades_morosas) OVER (ORDER BY cm.periodo_vencimiento) * 100.0 /
          NULLIF(LAG(cm.total_cuentas, 1, cm.total_cuentas) OVER (ORDER BY cm.periodo_vencimiento), 0))
        ), 2
      ) AS variacion_porcentual
    FROM CalculoMorosidad cm
    ORDER BY cm.periodo_vencimiento DESC
    LIMIT 1
  `;

  const [[result]] = await db.query(query, [comunidadId]);
  return result || { tasa_morosidad_actual: 0, tasa_morosidad_anterior: 0, variacion_porcentual: 0 };
}

module.exports = router;


// =========================================
// ENDPOINTS DE DASHBOARD
// =========================================

// // 1. KPIs PRINCIPALES
// GET: /dashboard/comunidad/:comunidadId/kpis
// GET: /dashboard/comunidad/:comunidadId/saldo-total
// GET: /dashboard/comunidad/:comunidadId/ingresos-mes
// GET: /dashboard/comunidad/:comunidadId/gastos-mes
// GET: /dashboard/comunidad/:comunidadId/tasa-morosidad

// // 2. DATOS PARA GRÁFICOS
// GET: /dashboard/comunidad/:comunidadId/grafico-emisiones
// GET: /dashboard/comunidad/:comunidadId/grafico-estado-pagos
// GET: /dashboard/comunidad/:comunidadId/grafico-gastos-categoria

// // 3. TABLAS DE DATOS
// GET: /dashboard/comunidad/:comunidadId/pagos-recientes
// GET: /dashboard/comunidad/:comunidadId/unidades-morosas
// GET: /dashboard/comunidad/:comunidadId/proximas-actividades
// GET: /dashboard/comunidad/:comunidadId/reservas-amenidades

// // 4. NOTIFICACIONES
// GET: /dashboard/comunidad/:comunidadId/notificaciones

// // 5. MÉTRICAS ADICIONALES
// GET: /dashboard/comunidad/:comunidadId/efectividad-cobranza
// GET: /dashboard/comunidad/:comunidadId/tendencia-ingresos
// GET: /dashboard/comunidad/:comunidadId/resumen-completo




