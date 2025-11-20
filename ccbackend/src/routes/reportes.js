const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Reportes
 *     description: Reportes y análisis financieros
 */

// =========================================
// 1. RESUMEN FINANCIERO
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/resumen-financiero:
 *   get:
 *     tags: [Reportes]
 *     summary: Resumen financiero mensual
 *     parameters:
 *       - name: meses
 *         in: query
 *         schema:
 *           type: integer
 *           default: 12
 */
router.get(
  '/comunidad/:comunidadId/resumen-financiero',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { meses = 12 } = req.query;

      const query = `
      SELECT
        c.id as comunidad_id,
        c.razon_social as comunidad,
        DATE_FORMAT(mov.fecha, '%Y-%m') as month,
        YEAR(mov.fecha) as anio,
        MONTH(mov.fecha) as mes,
        SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) as ingresos,
        SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as gastos,
        SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE -mov.monto END) as saldo,
        COUNT(DISTINCT CASE WHEN mov.tipo = 'ingreso' THEN mov.unidad_id END) as unidades_activas
      FROM comunidad c
      CROSS JOIN (
        SELECT fecha, monto, 'ingreso' as tipo, unidad_id, comunidad_id FROM pago WHERE estado = 'aplicado'
        UNION ALL
        SELECT fecha, monto, 'gasto' as tipo, NULL as unidad_id, comunidad_id FROM gasto WHERE estado = 'aprobado'
      ) mov
      WHERE c.id = ?
        AND mov.comunidad_id = c.id
        AND mov.fecha BETWEEN DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH) AND CURRENT_DATE
      GROUP BY c.id, c.razon_social, DATE_FORMAT(mov.fecha, '%Y-%m'), YEAR(mov.fecha), MONTH(mov.fecha)
      ORDER BY month DESC
    `;

      const [rows] = await db.query(query, [comunidadId, Number(meses)]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener resumen financiero:', error);
      res.status(500).json({ error: 'Error al obtener resumen financiero' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/kpis-financieros:
 *   get:
 *     tags: [Reportes]
 *     summary: KPIs financieros de la comunidad
 */
router.get(
  '/comunidad/:comunidadId/kpis-financieros',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        c.id as comunidad_id,
        c.razon_social as comunidad,
        
        (SELECT COALESCE(SUM(monto), 0) FROM pago
         WHERE comunidad_id = c.id AND estado = 'aplicado'
         AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes,
        
        (SELECT COALESCE(SUM(monto), 0) FROM gasto
         WHERE comunidad_id = c.id AND estado = 'aprobado'
         AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes,
        
        (SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado') as ingresos_total,
        
        (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = c.id AND estado = 'aprobado') as gastos_total,
        
        ((SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = c.id AND estado = 'aplicado') -
         (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = c.id AND estado = 'aprobado')) as saldo_actual,
        
        (SELECT COALESCE(ROUND(
            (COUNT(CASE WHEN ccu.saldo > 0 THEN 1 END) * 100.0) / NULLIF(COUNT(*), 0), 2
         ), 0) FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido') as morosidad,
        
        (SELECT COUNT(*) FROM unidad WHERE comunidad_id = c.id AND activa = 1) as total_unidades,
        
        (SELECT COUNT(DISTINCT ccu.unidad_id)
         FROM cuenta_cobro_unidad ccu
         JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
         WHERE ccu.comunidad_id = c.id AND egc.estado = 'emitido' AND ccu.saldo = 0) as unidades_al_dia,
        
        (SELECT COUNT(*) FROM ticket_soporte
         WHERE comunidad_id = c.id AND estado IN ('abierto', 'en_progreso')) as tickets_activos,
        
        (SELECT COUNT(*) FROM multa WHERE comunidad_id = c.id AND estado = 'pendiente') as multas_pendientes
      
      FROM comunidad c
      WHERE c.id = ?
    `;

      const [[result]] = await db.query(query, [comunidadId]);

      res.json(result || {});
    } catch (error) {
      console.error('Error al obtener KPIs financieros:', error);
      res.status(500).json({ error: 'Error al obtener KPIs financieros' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/tendencias-mensuales:
 *   get:
 *     tags: [Reportes]
 *     summary: Análisis de tendencias (últimos 12 meses)
 */
router.get(
  '/comunidad/:comunidadId/tendencias-mensuales',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
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
        SELECT fecha, monto, 'ingreso' as tipo, unidad_id, comunidad_id FROM pago WHERE estado = 'aplicado'
        UNION ALL
        SELECT fecha, monto, 'gasto' as tipo, NULL as unidad_id, comunidad_id FROM gasto WHERE estado = 'aprobado'
      ) mov
      WHERE c.id = ?
        AND mov.comunidad_id = c.id
        AND mov.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY c.id, c.razon_social, DATE_FORMAT(mov.fecha, '%Y-%m'), YEAR(mov.fecha), MONTH(mov.fecha)
      ORDER BY periodo DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener tendencias mensuales:', error);
      res.status(500).json({ error: 'Error al obtener tendencias mensuales' });
    }
  }
);

// =========================================
// 2. REPORTES DE MOROSIDAD
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/morosidad-unidades:
 *   get:
 *     tags: [Reportes]
 *     summary: Estado de morosidad por unidad
 *     parameters:
 *       - name: categoria
 *         in: query
 *         schema:
 *           type: string
 *           enum: [todos, al_dia, moroso_reciente, moroso_medio, moroso_cronico]
 */
router.get(
  '/comunidad/:comunidadId/morosidad-unidades',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { categoria } = req.query;

      let query = `
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
        egc.periodo
      FROM comunidad c
      JOIN cuenta_cobro_unidad ccu ON c.id = ccu.comunidad_id
      JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id
        AND tu.tipo = 'propietario'
        AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE c.id = ?
        AND egc.estado = 'emitido'
    `;

      const params = [comunidadId];

      if (categoria && categoria !== 'todos') {
        const categoriaMap = {
          al_dia: 'ccu.saldo = 0',
          moroso_reciente:
            'ccu.saldo > 0 AND DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) <= 30',
          moroso_medio:
            'DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 90',
          moroso_cronico: 'DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) > 90',
        };

        if (categoriaMap[categoria]) {
          query += ` AND ${categoriaMap[categoria]}`;
        }
      } else {
        query += ` AND ccu.saldo > 0`;
      }

      query += ` ORDER BY dias_vencidos DESC, saldo_pendiente DESC`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener morosidad de unidades:', error);
      res.status(500).json({ error: 'Error al obtener morosidad de unidades' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/estadisticas-morosidad:
 *   get:
 *     tags: [Reportes]
 *     summary: Estadísticas de morosidad agrupadas
 */
router.get(
  '/comunidad/:comunidadId/estadisticas-morosidad',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      // Primero obtener el detalle por rangos
      const query = `
      SELECT
        CASE
          WHEN ccu.saldo = 0 THEN 'Al día'
          WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 1 AND 30 THEN 'Moroso reciente'
          WHEN DATEDIFF(CURRENT_DATE, egc.fecha_vencimiento) BETWEEN 31 AND 90 THEN 'Moroso medio'
          ELSE 'Moroso crónico'
        END as categoria_morosidad,
        COUNT(DISTINCT u.id) as cantidad_unidades,
        SUM(ccu.saldo) as saldo_total_pendiente,
        AVG(ccu.saldo) as promedio_deuda,
        MAX(ccu.saldo) as deuda_maxima,
        MIN(ccu.saldo) as deuda_minima,
        ROUND((COUNT(DISTINCT u.id) * 100.0) / NULLIF((SELECT COUNT(*) FROM unidad WHERE comunidad_id = ?), 0), 2) as porcentaje
      FROM cuenta_cobro_unidad ccu
      JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      JOIN unidad u ON ccu.unidad_id = u.id
      WHERE ccu.comunidad_id = ?
        AND egc.estado = 'emitido'
      GROUP BY categoria_morosidad
      ORDER BY 
        CASE categoria_morosidad
          WHEN 'Al día' THEN 1
          WHEN 'Moroso reciente' THEN 2
          WHEN 'Moroso medio' THEN 3
          ELSE 4
        END
    `;

      const [rows] = await db.query(query, [comunidadId, comunidadId]);

      // Mapear a formato que el frontend espera
      const estadisticas = {
        'Al día': 0,
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
      };

      (rows || []).forEach((row) => {
        if (row.categoria_morosidad === 'Al día') {
          estadisticas['Al día'] = row.saldo_total_pendiente || 0;
        } else if (row.categoria_morosidad === 'Moroso reciente') {
          estadisticas['0-30'] = row.saldo_total_pendiente || 0;
        } else if (row.categoria_morosidad === 'Moroso medio') {
          estadisticas['31-90'] = row.saldo_total_pendiente || 0;
        } else if (row.categoria_morosidad === 'Moroso crónico') {
          estadisticas['90+'] = row.saldo_total_pendiente || 0;
        }
      });

      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas de morosidad:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas de morosidad' });
    }
  }
);

// =========================================
// 3. REPORTES DE GASTOS
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/gastos-detallados:
 *   get:
 *     tags: [Reportes]
 *     summary: Gastos detallados con categorías
 *     parameters:
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: categoria_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 */
router.get(
  '/comunidad/:comunidadId/gastos-detallados',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_desde, fecha_hasta, categoria_id, limit = 100 } = req.query;

      let query = `
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
      LEFT JOIN usuario u ON g.creado_por = u.id
      WHERE g.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_desde) {
        query += ` AND g.fecha >= ?`;
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += ` AND g.fecha <= ?`;
        params.push(fecha_hasta);
      }

      if (categoria_id) {
        query += ` AND g.categoria_id = ?`;
        params.push(Number(categoria_id));
      }

      query += ` ORDER BY g.fecha DESC LIMIT ?`;
      params.push(Number(limit));

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener gastos detallados:', error);
      res.status(500).json({ error: 'Error al obtener gastos detallados' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/gastos-por-categoria:
 *   get:
 *     tags: [Reportes]
 *     summary: Resumen de gastos por categoría
 */
router.get(
  '/comunidad/:comunidadId/gastos-por-categoria',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cg.id as categoria_id,
        cg.nombre as categoria,
        cg.tipo as tipo_categoria,
        COUNT(g.id) as cantidad_gastos,
        COALESCE(SUM(g.monto), 0) as total_gastos,
        COALESCE(AVG(g.monto), 0) as gasto_promedio,
        MIN(g.fecha) as primer_gasto,
        MAX(g.fecha) as ultimo_gasto,
        ROUND(
          (COALESCE(SUM(g.monto), 0) * 100.0) /
          NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado'), 0), 2
        ) as porcentaje_del_total
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id AND g.comunidad_id = ? AND g.estado = 'aprobado'
      WHERE cg.comunidad_id = ?
      GROUP BY cg.id, cg.nombre, cg.tipo
      HAVING cantidad_gastos > 0
      ORDER BY total_gastos DESC
    `;

      const [rows] = await db.query(query, [
        comunidadId,
        comunidadId,
        comunidadId,
      ]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener gastos por categoría:', error);
      res.status(500).json({ error: 'Error al obtener gastos por categoría' });
    }
  }
);

// =========================================
// 4. REPORTES DE CONSUMOS
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/consumo-servicios:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte de consumo de servicios
 *     parameters:
 *       - name: tipo
 *         in: query
 *         schema:
 *           type: string
 *           enum: [agua, gas, electricidad]
 *       - name: periodo
 *         in: query
 *         schema:
 *           type: string
 *           format: YYYY-MM
 */
router.get(
  '/comunidad/:comunidadId/consumo-servicios',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { tipo, periodo } = req.query;

      let query = `
      SELECT
        m.id as medidor_id,
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
      FROM medidor m
      JOIN lectura_medidor lm ON m.id = lm.medidor_id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN tarifa_consumo t ON m.tipo = t.tipo AND t.comunidad_id = m.comunidad_id
        AND t.periodo_desde <= lm.periodo
        AND (t.periodo_hasta IS NULL OR t.periodo_hasta >= lm.periodo)
      WHERE m.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (tipo) {
        query += ` AND m.tipo = ?`;
        params.push(tipo);
      }

      if (periodo) {
        query += ` AND lm.periodo = ?`;
        params.push(periodo);
      }

      query += ` ORDER BY lm.periodo DESC, u.codigo, m.tipo`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener consumo de servicios:', error);
      res.status(500).json({ error: 'Error al obtener consumo de servicios' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/estadisticas-consumo:
 *   get:
 *     tags: [Reportes]
 *     summary: Estadísticas de consumo por tipo de servicio
 */
router.get(
  '/comunidad/:comunidadId/estadisticas-consumo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        m.tipo as servicio,
        COUNT(DISTINCT m.id) as cantidad_medidores,
        COUNT(DISTINCT m.unidad_id) as unidades_con_medidor,
        COUNT(lm.id) as lecturas_registradas,
        AVG(lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) as consumo_promedio,
        MAX(lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) as consumo_maximo,
        MIN(lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) as consumo_minimo
      FROM medidor m
      LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
      WHERE m.comunidad_id = ?
      GROUP BY m.tipo
      ORDER BY m.tipo
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener estadísticas de consumo:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas de consumo' });
    }
  }
);

// =========================================
// 5. REPORTES DE TICKETS
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/tickets-soporte:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte de tickets de soporte
 *     parameters:
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *       - name: prioridad
 *         in: query
 *         schema:
 *           type: string
 */
router.get(
  '/comunidad/:comunidadId/tickets-soporte',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { estado, prioridad } = req.query;

      let query = `
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
      LEFT JOIN usuario ua ON ts.asignado_a = ua.id
      WHERE ts.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (estado) {
        query += ` AND ts.estado = ?`;
        params.push(estado);
      }

      if (prioridad) {
        query += ` AND ts.prioridad = ?`;
        params.push(prioridad);
      }

      query += ` ORDER BY ts.created_at DESC`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener tickets de soporte:', error);
      res.status(500).json({ error: 'Error al obtener tickets de soporte' });
    }
  }
);

// =========================================
// 6. REPORTES DE AMENIDADES
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/reservas-amenidades:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte de reservas de amenidades
 *     parameters:
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 */
router.get(
  '/comunidad/:comunidadId/reservas-amenidades',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_desde, fecha_hasta, estado } = req.query;

      let query = `
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
      JOIN persona p ON ra.persona_id = p.id
      WHERE ra.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_desde) {
        query += ` AND DATE(ra.inicio) >= ?`;
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += ` AND DATE(ra.inicio) <= ?`;
        params.push(fecha_hasta);
      }

      if (estado) {
        query += ` AND ra.estado = ?`;
        params.push(estado);
      }

      query += ` ORDER BY ra.inicio DESC`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener reservas de amenidades:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener reservas de amenidades' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/ingresos-amenidades:
 *   get:
 *     tags: [Reportes]
 *     summary: Resumen de ingresos por amenidades
 */
router.get(
  '/comunidad/:comunidadId/ingresos-amenidades',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        a.nombre as amenidad,
        COUNT(ra.id) as total_reservas,
        SUM(TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin)) as horas_totales,
        SUM(a.tarifa * TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin)) as ingreso_total,
        AVG(a.tarifa * TIMESTAMPDIFF(HOUR, ra.inicio, ra.fin)) as ingreso_promedio,
        COUNT(CASE WHEN ra.estado = 'cumplida' THEN 1 END) as reservas_completadas,
        COUNT(CASE WHEN ra.estado = 'cancelada' THEN 1 END) as reservas_canceladas
      FROM amenidad a
      LEFT JOIN reserva_amenidad ra ON a.id = ra.amenidad_id
        AND ra.estado IN ('cumplida', 'aprobada')
        AND ra.inicio >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      WHERE a.comunidad_id = ?
      GROUP BY a.id, a.nombre
      ORDER BY ingreso_total DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener ingresos de amenidades:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener ingresos de amenidades' });
    }
  }
);

// =========================================
// 7. REPORTES DE MULTAS
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/multas-sanciones:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte de multas y sanciones
 *     parameters:
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 */
router.get(
  '/comunidad/:comunidadId/multas-sanciones',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { estado } = req.query;

      let query = `
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
      LEFT JOIN usuario uc ON m.creada_por = uc.id
      WHERE m.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (estado) {
        query += ` AND m.estado = ?`;
        params.push(estado);
      }

      query += ` ORDER BY m.fecha DESC`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener multas y sanciones:', error);
      res.status(500).json({ error: 'Error al obtener multas y sanciones' });
    }
  }
);

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/estadisticas-multas:
 *   get:
 *     tags: [Reportes]
 *     summary: Estadísticas de multas
 */
router.get(
  '/comunidad/:comunidadId/estadisticas-multas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        COUNT(*) as total_multas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as multas_pendientes,
        COUNT(CASE WHEN estado = 'pagada' THEN 1 END) as multas_pagadas,
        COUNT(CASE WHEN estado = 'anulada' THEN 1 END) as multas_anuladas,
        SUM(monto) as monto_total,
        SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END) as monto_pendiente,
        SUM(CASE WHEN estado = 'pagada' THEN monto ELSE 0 END) as monto_recaudado,
        AVG(monto) as monto_promedio,
        COUNT(CASE WHEN prioridad = 'alta' THEN 1 END) as multas_alta_prioridad
      FROM multa
      WHERE comunidad_id = ?
    `;

      const [[result]] = await db.query(query, [comunidadId]);

      res.json(result || {});
    } catch (error) {
      console.error('Error al obtener estadísticas de multas:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas de multas' });
    }
  }
);

// =========================================
// 8. REPORTES DE CONSERJERÍA
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/bitacora-conserjeria:
 *   get:
 *     tags: [Reportes]
 *     summary: Bitácora de conserjería
 *     parameters:
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: tipo_evento
 *         in: query
 *         schema:
 *           type: string
 */
router.get(
  '/comunidad/:comunidadId/bitacora-conserjeria',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_desde, fecha_hasta, tipo_evento } = req.query;

      let query = `
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
      LEFT JOIN usuario u ON rc.usuario_id = u.id
      WHERE rc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_desde) {
        query += ` AND DATE(rc.fecha_hora) >= ?`;
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += ` AND DATE(rc.fecha_hora) <= ?`;
        params.push(fecha_hasta);
      }

      if (tipo_evento) {
        query += ` AND CASE
          WHEN rc.evento LIKE '%entrega%' THEN 'Entrega'
          WHEN rc.evento LIKE '%visita%' THEN 'Visita'
          WHEN rc.evento LIKE '%reporte%' THEN 'Reporte'
          WHEN rc.evento LIKE '%retiro%' THEN 'Retiro'
          ELSE 'Otro'
        END = ?`;
        params.push(tipo_evento);
      }

      query += ` ORDER BY rc.fecha_hora DESC LIMIT 500`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener bitácora de conserjería:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener bitácora de conserjería' });
    }
  }
);

// =========================================
// 9. REPORTES PERSONALIZADOS/EXPORTACIÓN
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/reporte-completo:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte completo de la comunidad (para exportar)
 */
router.get(
  '/comunidad/:comunidadId/reporte-completo',
  authenticate,
  requireCommunity('comunidadId', ['admin', 'superadmin', 'contador']),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      // Ejecutar todas las consultas en paralelo
      const [
        [kpis],
        [resumenFinanciero],
        [morosidad],
        [gastosPorCategoria],
        [[estadisticasMultas]],
        [tickets],
      ] = await Promise.all([
        // KPIs
        db.query(
          `
        SELECT
          (SELECT COALESCE(SUM(monto), 0) FROM pago WHERE comunidad_id = ? AND estado = 'aplicado'
           AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as ingresos_mes_actual,
          (SELECT COALESCE(SUM(monto), 0) FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado'
           AND YEAR(fecha) = YEAR(CURRENT_DATE) AND MONTH(fecha) = MONTH(CURRENT_DATE)) as gastos_mes_actual,
          (SELECT COUNT(*) FROM unidad WHERE comunidad_id = ? AND activa = 1) as total_unidades,
          (SELECT COUNT(*) FROM ticket_soporte WHERE comunidad_id = ? AND estado IN ('abierto', 'en_progreso')) as tickets_activos
      `,
          [comunidadId, comunidadId, comunidadId, comunidadId]
        ),

        // Resumen financiero (últimos 6 meses)
        db.query(
          `
        SELECT DATE_FORMAT(mov.fecha, '%Y-%m') as periodo,
               SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) as ingresos,
               SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as gastos
        FROM (
          SELECT fecha, monto, 'ingreso' as tipo FROM pago WHERE comunidad_id = ? AND estado = 'aplicado'
          UNION ALL
          SELECT fecha, monto, 'gasto' as tipo FROM gasto WHERE comunidad_id = ? AND estado = 'aprobado'
        ) mov
        WHERE mov.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(mov.fecha, '%Y-%m')
        ORDER BY periodo DESC
      `,
          [comunidadId, comunidadId]
        ),

        // Morosidad
        db.query(
          `
        SELECT u.codigo, SUM(ccu.saldo) as deuda
        FROM cuenta_cobro_unidad ccu
        JOIN unidad u ON ccu.unidad_id = u.id
        JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
        WHERE ccu.comunidad_id = ? AND egc.estado = 'emitido' AND ccu.saldo > 0
        GROUP BY u.id, u.codigo
        ORDER BY deuda DESC
        LIMIT 10
      `,
          [comunidadId]
        ),

        // Gastos por categoría
        db.query(
          `
        SELECT cg.nombre as categoria, COALESCE(SUM(g.monto), 0) as total
        FROM categoria_gasto cg
        LEFT JOIN gasto g ON cg.id = g.categoria_id AND g.estado = 'aprobado'
        WHERE cg.comunidad_id = ?
        GROUP BY cg.id, cg.nombre
        HAVING total > 0
        ORDER BY total DESC
        LIMIT 10
      `,
          [comunidadId]
        ),

        // Estadísticas de multas
        db.query(
          `
        SELECT COUNT(*) as total, SUM(monto) as monto_total,
               COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes
        FROM multa WHERE comunidad_id = ?
      `,
          [comunidadId]
        ),

        // Tickets
        db.query(
          `
        SELECT estado, COUNT(*) as cantidad
        FROM ticket_soporte
        WHERE comunidad_id = ?
        GROUP BY estado
      `,
          [comunidadId]
        ),
      ]);

      res.json({
        comunidad_id: comunidadId,
        fecha_generacion: new Date().toISOString(),
        kpis: kpis[0] || {},
        resumen_financiero: resumenFinanciero,
        unidades_morosas: morosidad,
        gastos_por_categoria: gastosPorCategoria,
        estadisticas_multas: estadisticasMultas || {},
        tickets_por_estado: tickets,
      });
    } catch (error) {
      console.error('Error al generar reporte completo:', error);
      res.status(500).json({ error: 'Error al generar reporte completo' });
    }
  }
);

// =========================================
// 10. REPORTES DE INGRESOS DETALLADOS
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/ingresos-detallados:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte detallado de ingresos por pago
 *     parameters:
 *       - name: desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 */
router.get(
  '/comunidad/:comunidadId/ingresos-detallados',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { desde, hasta } = req.query;

      let query = `
      SELECT
        p.id,
        p.comunidad_id,
        c.razon_social as comunidad,
        DATE_FORMAT(p.fecha, '%d/%m/%Y') as fecha_pago,
        p.monto,
        p.medio,
        p.referencia,
        u.codigo as unidad,
        egc.periodo as periodo_emision,
        egc.concepto as concepto,
        p.estado,
        p.comprobante_num
      FROM pago p
      JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN emision_gastos_comunes egc ON p.emision_id = egc.id
      WHERE p.comunidad_id = ? AND p.estado = 'aplicado'
    `;

      const params = [comunidadId];

      if (desde) {
        query += ` AND DATE(p.fecha) >= ?`;
        params.push(desde);
      }

      if (hasta) {
        query += ` AND DATE(p.fecha) <= ?`;
        params.push(hasta);
      }

      query += ` ORDER BY p.fecha DESC`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener ingresos detallados:', error);
      res.status(500).json({ error: 'Error al obtener ingresos detallados' });
    }
  }
);

// =========================================
// 11. REPORTES DE ACCESOS Y VISITAS
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/accesos-visitas:
 *   get:
 *     tags: [Reportes]
 *     summary: Reporte de accesos y visitas registrados
 *     parameters:
 *       - name: desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: tipo_evento
 *         in: query
 *         schema:
 *           type: string
 */
router.get(
  '/comunidad/:comunidadId/accesos-visitas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { desde, hasta, tipo_evento } = req.query;

      let query = `
      SELECT
        rc.id,
        rc.comunidad_id,
        c.razon_social as comunidad,
        DATE_FORMAT(rc.fecha_hora, '%d/%m/%Y %H:%i') as fecha_hora,
        rc.evento as evento,
        CASE
          WHEN rc.evento LIKE '%entrega%' THEN 'Entrega'
          WHEN rc.evento LIKE '%visita%' THEN 'Visita'
          WHEN rc.evento LIKE '%reporte%' THEN 'Reporte'
          WHEN rc.evento LIKE '%retiro%' THEN 'Retiro'
          ELSE 'Otro'
        END as tipo_evento,
        rc.detalles,
        u.codigo as unidad,
        CONCAT(p.nombres, ' ', p.apellidos) as persona
      FROM registro_conserjeria rc
      JOIN comunidad c ON rc.comunidad_id = c.id
      LEFT JOIN unidad u ON rc.unidad_id = u.id
      LEFT JOIN persona p ON rc.persona_id = p.id
      WHERE rc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (desde) {
        query += ` AND DATE(rc.fecha_hora) >= ?`;
        params.push(desde);
      }

      if (hasta) {
        query += ` AND DATE(rc.fecha_hora) <= ?`;
        params.push(hasta);
      }

      if (tipo_evento) {
        query += ` AND CASE
          WHEN rc.evento LIKE '%entrega%' THEN 'Entrega'
          WHEN rc.evento LIKE '%visita%' THEN 'Visita'
          WHEN rc.evento LIKE '%reporte%' THEN 'Reporte'
          WHEN rc.evento LIKE '%retiro%' THEN 'Retiro'
          ELSE 'Otro'
        END = ?`;
        params.push(tipo_evento);
      }

      query += ` ORDER BY rc.fecha_hora DESC LIMIT 500`;

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener accesos y visitas:', error);
      res.status(500).json({ error: 'Error al obtener accesos y visitas' });
    }
  }
);

// =========================================
// 12. FLUJO DE CAJA MEJORADO PARA REPORTES
// =========================================

/**
 * @swagger
 * /api/reportes/comunidad/{comunidadId}/flujo-caja:
 *   get:
 *     tags: [Reportes]
 *     summary: Flujo de caja mejorado para reportes
 */
router.get(
  '/comunidad/:comunidadId/flujo-caja',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        DATE_FORMAT(mov.fecha, '%Y-%m') as mes,
        SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) as entradas,
        SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) as ingresos,
        SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as salidas,
        SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END) as gastos,
        (SUM(CASE WHEN mov.tipo = 'ingreso' THEN mov.monto ELSE 0 END) -
         SUM(CASE WHEN mov.tipo = 'gasto' THEN mov.monto ELSE 0 END)) as saldo
      FROM (
        SELECT fecha, monto, 'ingreso' as tipo, comunidad_id FROM pago WHERE estado = 'aplicado'
        UNION ALL
        SELECT fecha, monto, 'gasto' as tipo, comunidad_id FROM gasto WHERE estado = 'aprobado'
      ) mov
      WHERE mov.comunidad_id = ?
      GROUP BY DATE_FORMAT(mov.fecha, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows || []);
    } catch (error) {
      console.error('Error al obtener flujo de caja para reportes:', error);
      res.status(500).json({ error: 'Error al obtener flujo de caja' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE REPORTES
// =========================================

// // 1. RESUMEN FINANCIERO
// GET: /reportes/comunidad/:comunidadId/resumen-financiero
// GET: /reportes/comunidad/:comunidadId/kpis-financieros
// GET: /reportes/comunidad/:comunidadId/tendencias-mensuales

// // 2. REPORTES DE MOROSIDAD
// GET: /reportes/comunidad/:comunidadId/morosidad-unidades
// GET: /reportes/comunidad/:comunidadId/estadisticas-morosidad

// // 3. REPORTES DE GASTOS
// GET: /reportes/comunidad/:comunidadId/gastos-detallados
// GET: /reportes/comunidad/:comunidadId/gastos-por-categoria

// // 4. REPORTES DE CONSUMOS
// GET: /reportes/comunidad/:comunidadId/consumo-servicios
// GET: /reportes/comunidad/:comunidadId/estadisticas-consumo

// // 5. REPORTES DE TICKETS
// GET: /reportes/comunidad/:comunidadId/tickets-soporte

// // 6. REPORTES DE AMENIDADES
// GET: /reportes/comunidad/:comunidadId/reservas-amenidades
// GET: /reportes/comunidad/:comunidadId/ingresos-amenidades

// // 7. REPORTES DE MULTAS
// GET: /reportes/comunidad/:comunidadId/multas-sanciones
// GET: /reportes/comunidad/:comunidadId/estadisticas-multas

// // 8. REPORTES DE CONSERJERÍA
// GET: /reportes/comunidad/:comunidadId/bitacora-conserjeria

// // 9. REPORTES PERSONALIZADOS/EXPORTACIÓN
// GET: /reportes/comunidad/:comunidadId/reporte-completo
