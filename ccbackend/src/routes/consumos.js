const express = require('express');
const pool = require('../db');
const { authenticate } = require('../middleware/auth'); // Importa authenticate si no está

const router = express.Router();

/**
 * @swagger
 * /consumos/mensual:
 *   get:
 *     tags: [Consumos]
 *     summary: Obtener tendencia de consumo mensual
 *     description: Devuelve los datos de consumo mensual para un medidor específico en un rango de períodos.
 *     parameters:
 *       - name: medidor_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del medidor
 *       - name: periodo_inicio
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de inicio (YYYY-MM)
 *       - name: periodo_fin
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de fin (YYYY-MM)
 *     responses:
 *       200:
 *         description: Lista de consumos mensuales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mes:
 *                     type: string
 *                   consumo_total_unidad:
 *                     type: number
 *                   precio_unitario:
 *                     type: number
 *                   cargo_fijo_mensual:
 *                     type: number
 *                   costo_mensual:
 *                     type: number
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint para Gráfico Principal: Tendencia de Consumo Mensual
router.get('/mensual', async (req, res) => {
  try {
    const { medidor_id, periodo_inicio, periodo_fin } = req.query;
    const query = `
      SELECT
        vc.periodo AS mes,
        vc.consumo AS consumo_total_unidad,
        COALESCE(tc.precio_por_unidad, 0.00) AS precio_unitario,
        COALESCE(tc.cargo_fijo, 0.00) AS cargo_fijo_mensual,
        ROUND((vc.consumo * COALESCE(tc.precio_por_unidad, 0.00)) + COALESCE(tc.cargo_fijo, 0.00), 2) AS costo_mensual
      FROM vista_consumos vc
      INNER JOIN medidor m ON m.id = vc.medidor_id
      LEFT JOIN tarifa_consumo tc ON tc.comunidad_id = m.comunidad_id
        AND tc.tipo = m.tipo
        AND tc.periodo_desde = vc.periodo
      WHERE
        vc.medidor_id = ?
        AND vc.periodo BETWEEN ? AND ?
      ORDER BY mes;
    `;
    const [rows] = await pool.execute(query, [
      medidor_id,
      periodo_inicio,
      periodo_fin,
    ]);
    res.json(rows);
  } catch (error) {
    console.error('Error en /mensual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /consumos/trimestral:
 *   get:
 *     tags: [Consumos]
 *     summary: Obtener consumo por trimestre
 *     description: Devuelve los datos de consumo agrupados por trimestre para un medidor específico.
 *     parameters:
 *       - name: medidor_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del medidor
 *       - name: periodo_inicio
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de inicio (YYYY-MM)
 *       - name: periodo_fin
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de fin (YYYY-MM)
 *     responses:
 *       200:
 *         description: Lista de consumos trimestrales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   trimestre:
 *                     type: string
 *                   consumo_total_trimestral:
 *                     type: number
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint para Gráfico Mensual (Trimestral): Consumo por Trimestre
router.get('/trimestral', async (req, res) => {
  try {
    const { medidor_id, periodo_inicio, periodo_fin } = req.query;
    const query = `
      SELECT
        CONCAT(LEFT(vc.periodo, 4), '-Q', QUARTER(STR_TO_DATE(CONCAT(vc.periodo, '-01'), '%Y-%m-%d'))) AS trimestre,
        SUM(vc.consumo) AS consumo_total_trimestral
      FROM vista_consumos vc
      WHERE
        vc.medidor_id = ?
        AND vc.periodo BETWEEN ? AND ?
      GROUP BY trimestre
      ORDER BY trimestre;
    `;
    const [rows] = await pool.execute(query, [
      medidor_id,
      periodo_inicio,
      periodo_fin,
    ]);
    res.json(rows);
  } catch (error) {
    console.error('Error en /trimestral:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /consumos/semanal:
 *   get:
 *     tags: [Consumos]
 *     summary: Obtener promedio de consumo por día de la semana
 *     description: Devuelve el promedio de consumo diario por día de la semana para un medidor específico.
 *     parameters:
 *       - name: medidor_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del medidor
 *     responses:
 *       200:
 *         description: Lista de promedios semanales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   dia_semana:
 *                     type: integer
 *                     description: Día de la semana (1=Dom, 2=Lun, ..., 7=Sáb)
 *                   promedio_consumo_diario:
 *                     type: number
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint para Gráfico Semanal: Promedio de Consumo por Día de la Semana
router.get('/semanal', async (req, res) => {
  try {
    const { medidor_id } = req.query;
    const query = `
      WITH consumo_diario AS (
        SELECT
          lm.fecha,
          lm.lectura,
          DATEDIFF(lm.fecha, LAG(lm.fecha) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) AS dias_entre_lecturas,
          (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) /
            NULLIF(DATEDIFF(lm.fecha, LAG(lm.fecha) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)), 0) AS consumo_promedio_diario
        FROM lectura_medidor lm
        WHERE lm.medidor_id = ?
          AND lm.fecha BETWEEN '2024-01-01' AND '2025-12-31'
      )
      SELECT
        DAYOFWEEK(cd.fecha) AS dia_semana,
        COALESCE(AVG(cd.consumo_promedio_diario), 0) AS promedio_consumo_diario
      FROM consumo_diario cd
      WHERE cd.consumo_promedio_diario IS NOT NULL AND cd.consumo_promedio_diario > 0
      GROUP BY dia_semana
      ORDER BY dia_semana;
    `;
    const [rows] = await pool.execute(query, [medidor_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error en /semanal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /consumos/estadisticas:
 *   get:
 *     tags: [Consumos]
 *     summary: Obtener estadísticas de consumo
 *     description: Devuelve estadísticas totales de consumo, promedio y costo para un medidor específico en un rango de períodos.
 *     parameters:
 *       - name: medidor_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del medidor
 *       - name: periodo_inicio
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de inicio (YYYY-MM)
 *       - name: periodo_fin
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de fin (YYYY-MM)
 *     responses:
 *       200:
 *         description: Objeto con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_consumo_periodo:
 *                   type: number
 *                 promedio_consumo_mensual:
 *                   type: number
 *                 costo_total_periodo:
 *                   type: number
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint para Estadísticas (Cards): Total, Promedio y Costo
router.get('/estadisticas', async (req, res) => {
  try {
    const { medidor_id, periodo_inicio, periodo_fin } = req.query;
    const query = `
      SELECT
        COALESCE(SUM(vc.consumo), 0) AS total_consumo_periodo,
        COALESCE(AVG(vc.consumo), 0) AS promedio_consumo_mensual,
        ROUND(
          SUM(vc.consumo * COALESCE(tc.precio_por_unidad, 0.00)) + SUM(COALESCE(tc.cargo_fijo, 0.00))
        , 2) AS costo_total_periodo
      FROM vista_consumos vc
      INNER JOIN medidor m ON m.id = vc.medidor_id
      LEFT JOIN tarifa_consumo tc ON tc.comunidad_id = m.comunidad_id
        AND tc.tipo = m.tipo
        AND tc.periodo_desde = vc.periodo
      WHERE
        vc.medidor_id = ?
        AND vc.periodo BETWEEN ? AND ?;
    `;
    const [rows] = await pool.execute(query, [
      medidor_id,
      periodo_inicio,
      periodo_fin,
    ]);
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error en /estadisticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /consumos/detalle:
 *   get:
 *     tags: [Consumos]
 *     summary: Obtener detalle de consumos
 *     description: Devuelve una lista detallada de consumos por período para un medidor específico.
 *     parameters:
 *       - name: medidor_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del medidor
 *       - name: periodo_inicio
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de inicio (YYYY-MM)
 *       - name: periodo_fin
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Período de fin (YYYY-MM)
 *     responses:
 *       200:
 *         description: Lista de detalles de consumos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   periodo:
 *                     type: string
 *                   consumo_calculado:
 *                     type: number
 *                   precio_unitario:
 *                     type: number
 *                   cargo_fijo:
 *                     type: number
 *                   costo:
 *                     type: number
 *       500:
 *         description: Error interno del servidor
 */
// Endpoint para Tabla de Detalle de Consumos
router.get('/detalle', async (req, res) => {
  try {
    const { medidor_id, periodo_inicio, periodo_fin } = req.query;
    const query = `
      SELECT
        vc.periodo,
        vc.consumo AS consumo_calculado,
        COALESCE(tc.precio_por_unidad, 0.00) AS precio_unitario,
        COALESCE(tc.cargo_fijo, 0.00) AS cargo_fijo,
        ROUND((vc.consumo * COALESCE(tc.precio_por_unidad, 0.00)) + COALESCE(tc.cargo_fijo, 0.00), 2) AS costo
      FROM vista_consumos vc
      INNER JOIN medidor m ON m.id = vc.medidor_id
      LEFT JOIN tarifa_consumo tc ON tc.comunidad_id = m.comunidad_id
        AND tc.tipo = m.tipo
        AND tc.periodo_desde = vc.periodo
      WHERE
        vc.medidor_id = ?
        AND vc.periodo BETWEEN ? AND ?
      ORDER BY vc.periodo DESC;
    `;
    const [rows] = await pool.execute(query, [
      medidor_id,
      periodo_inicio,
      periodo_fin,
    ]);
    res.json(rows);
  } catch (error) {
    console.error('Error en /detalle:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /consumos:
 *   get:
 *     tags: [Consumos]
 *     summary: Listar consumos globales con filtros y paginación
 *     description: Devuelve una lista paginada de consumos de medidores en comunidades del usuario (si no es superadmin).
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: tipo
 *         in: query
 *         schema:
 *           type: string
 *       - name: comunidad_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: Solo para superadmin
 *     responses:
 *       200:
 *         description: Lista de consumos
 *       500:
 *         description: Error interno
 */
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /consumos - user:', {
      id: req.user?.id,
      persona_id: req.user?.persona_id,
      is_superadmin: req.user?.is_superadmin,
      roles: req.user?.roles,
    });

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(200, Number(req.query.limit || 100));
    const offset =
      typeof req.query.offset !== 'undefined'
        ? Number(req.query.offset)
        : (page - 1) * limit;
    const { search, tipo, comunidad_id } = req.query;

    let where = ' WHERE 1=1 ';
    const params = [];

    // Filtrar por comunidades del usuario si no es superadmin
    if (!req.user?.is_superadmin) {
      const [userCommunities] = await pool.query(
        'SELECT comunidad_id FROM usuario_miembro_comunidad WHERE persona_id = ? AND activo = 1',
        [req.user.persona_id]
      );
      if (userCommunities.length === 0) {
        return res.json({ data: [], pagination: { total: 0, limit, offset, pages: 0 } });
      }
      const communityIds = userCommunities.map((c) => c.comunidad_id); // Removido : any
      where += ` AND m.comunidad_id IN (${communityIds.map(() => '?').join(',')})`;
      params.push(...communityIds);
    } else if (comunidad_id) {
      where += ' AND m.comunidad_id = ?';
      params.push(comunidad_id);
    }

    if (search) {
      where += ' AND (m.numero_medidor LIKE ? OR m.ubicacion LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tipo) {
      where += ' AND m.tipo = ?';
      params.push(tipo);
    }

    const sql = `
      SELECT vc.*, m.numero_medidor, m.ubicacion, m.tipo, m.comunidad_id
      FROM vista_consumos vc
      INNER JOIN medidor m ON m.id = vc.medidor_id
      ${where}
      ORDER BY vc.fecha DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [...params, limit, offset]);

    const countSql = `
      SELECT COUNT(*) AS total
      FROM vista_consumos vc
      INNER JOIN medidor m ON m.id = vc.medidor_id
      ${where}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0]?.total ?? rows.length;

    res.json({
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error('GET /consumos error', err);
    res.status(500).json({ error: 'Error al listar consumos' });
  }
});

module.exports = router;
