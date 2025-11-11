const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Proveedores
 *     description: Gestión de proveedores por comunidad
 */

// =========================================
// 1. LISTADOS CON ESTADÍSTICAS
// =========================================

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}:
 *   get:
 *     tags: [Proveedores]
 *     summary: Listar proveedores con estadísticas de uso
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: activo
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: giro
 *         in: query
 *         schema:
 *           type: string
 *       - name: rut
 *         in: query
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [activo, nombre, total_gastado, ultimo_gasto]
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        activo,
        search,
        giro,
        rut,
        sort,
        limit = 100,
        offset = 0,
      } = req.query;

      let query = `
      SELECT
        p.id,
        p.comunidad_id,
        c.razon_social AS comunidad_nombre,
        p.rut,
        p.dv,
        CONCAT(p.rut, '-', p.dv) AS rut_completo,
        p.razon_social AS nombre,
        p.giro AS categoria_principal,
        p.email,
        p.telefono,
        p.direccion,
        p.activo,
        COUNT(DISTINCT dc.id) AS total_documentos,
        COUNT(DISTINCT g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
        COALESCE(AVG(g.monto), 0) AS promedio_gasto,
        MAX(g.fecha) AS ultimo_gasto_fecha,
        DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
        p.created_at,
        p.updated_at
      FROM proveedor p
      INNER JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (activo !== undefined) {
        query += ` AND p.activo = ?`;
        params.push(activo === 'true' || activo === '1' ? 1 : 0);
      }

      if (search) {
        query += ` AND p.razon_social LIKE ?`;
        params.push(`%${search}%`);
      }

      if (giro) {
        query += ` AND p.giro LIKE ?`;
        params.push(`%${giro}%`);
      }

      if (rut) {
        query += ` AND p.rut LIKE ?`;
        params.push(`%${rut}%`);
      }

      query += ` GROUP BY p.id, c.razon_social`;

      // Ordenamiento
      if (sort === 'activo') {
        query += ` ORDER BY p.activo DESC, p.razon_social ASC`;
      } else if (sort === 'nombre') {
        query += ` ORDER BY p.razon_social ASC`;
      } else if (sort === 'total_gastado') {
        query += ` ORDER BY COALESCE(SUM(g.monto), 0) DESC`;
      } else if (sort === 'ultimo_gasto') {
        query += ` ORDER BY MAX(g.fecha) DESC`;
      } else {
        query += ` ORDER BY p.activo DESC, p.razon_social ASC`;
      }

      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al listar proveedores:', error);
      res.status(500).json({ error: 'Error al listar proveedores' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Proveedores]
 *     summary: Estadísticas generales de proveedores
 */
router.get(
  '/comunidad/:comunidadId/estadisticas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        COUNT(p.id) AS total_proveedores,
        SUM(CASE WHEN p.activo = 1 THEN 1 ELSE 0 END) AS proveedores_activos,
        SUM(CASE WHEN p.activo = 0 THEN 1 ELSE 0 END) AS proveedores_inactivos,
        COALESCE(AVG(stats.total_gastos), 0) AS promedio_gastos_por_proveedor,
        COALESCE(AVG(stats.monto_total), 0) AS promedio_monto_por_proveedor,
        COALESCE(MAX(stats.monto_total), 0) AS maximo_monto_gastado,
        COALESCE(MIN(stats.monto_total), 0) AS minimo_monto_gastado
      FROM proveedor p
      LEFT JOIN (
        SELECT
          pr.id,
          COUNT(DISTINCT g.id) AS total_gastos,
          COALESCE(SUM(g.monto), 0) AS monto_total
        FROM proveedor pr
        LEFT JOIN documento_compra dc ON pr.id = dc.proveedor_id
        LEFT JOIN gasto g ON dc.id = g.documento_compra_id
        WHERE pr.comunidad_id = ?
        GROUP BY pr.id
      ) AS stats ON p.id = stats.id
      WHERE p.comunidad_id = ?
    `;

      const [[stats]] = await db.query(query, [comunidadId, comunidadId]);

      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
);

// =========================================
// 2. DETALLE COMPLETO
// =========================================

/**
 * @swagger
 * /api/proveedores/{id}:
 *   get:
 *     tags: [Proveedores]
 *     summary: Obtener proveedor por ID con detalles completos
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const query = `
      SELECT
        p.id,
        p.comunidad_id,
        c.razon_social AS comunidad_nombre,
        p.rut,
        p.dv,
        CONCAT(p.rut, '-', p.dv) AS rut_completo,
        p.razon_social AS nombre,
        p.giro AS categoria_principal,
        p.email,
        p.telefono,
        p.direccion,
        p.activo,
        COUNT(DISTINCT dc.id) AS total_documentos,
        COUNT(DISTINCT g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
        COALESCE(AVG(g.monto), 0) AS promedio_gasto,
        MIN(g.fecha) AS primer_gasto_fecha,
        MAX(g.fecha) AS ultimo_gasto_fecha,
        DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
        p.created_at,
        p.updated_at
      FROM proveedor p
      INNER JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.id = ?
      GROUP BY p.id, c.razon_social
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
});

/**
 * @swagger
 * /api/proveedores/{id}/historial-gastos:
 *   get:
 *     tags: [Proveedores]
 *     summary: Historial de gastos por proveedor
 */
router.get('/:id/historial-gastos', authenticate, async (req, res) => {
  try {
    const proveedorId = Number(req.params.id);

    const query = `
      SELECT
        g.id AS gasto_id,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        g.extraordinario,
        dc.tipo_doc,
        dc.folio,
        dc.fecha_emision,
        dc.total AS documento_total,
        cat.nombre AS categoria_nombre,
        cat.tipo AS categoria_tipo,
        cc.nombre AS centro_costo_nombre,
        g.created_at
      FROM gasto g
      INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      WHERE dc.proveedor_id = ?
      ORDER BY g.fecha DESC, g.created_at DESC
    `;

    const [rows] = await db.query(query, [proveedorId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial de gastos:', error);
    res.status(500).json({ error: 'Error al obtener historial de gastos' });
  }
});

/**
 * @swagger
 * /api/proveedores/{id}/documentos:
 *   get:
 *     tags: [Proveedores]
 *     summary: Documentos de compra por proveedor
 */
router.get('/:id/documentos', authenticate, async (req, res) => {
  try {
    const proveedorId = Number(req.params.id);

    const query = `
      SELECT
        dc.id,
        dc.tipo_doc,
        dc.folio,
        dc.fecha_emision,
        dc.neto,
        dc.iva,
        dc.exento,
        dc.total,
        dc.glosa,
        COUNT(g.id) AS gastos_asociados,
        COALESCE(SUM(g.monto), 0) AS total_gastado,
        dc.created_at,
        dc.updated_at
      FROM documento_compra dc
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE dc.proveedor_id = ?
      GROUP BY dc.id, dc.tipo_doc, dc.folio, dc.fecha_emision, dc.neto, dc.iva, dc.exento, dc.total, dc.glosa, dc.created_at, dc.updated_at
      ORDER BY dc.fecha_emision DESC
    `;

    const [rows] = await db.query(query, [proveedorId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// =========================================
// 3. REPORTES Y ANÁLISIS
// =========================================

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/top-volumen:
 *   get:
 *     tags: [Proveedores]
 *     summary: Top 10 proveedores por volumen de gasto
 */
router.get(
  '/comunidad/:comunidadId/top-volumen',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        p.id,
        p.razon_social AS nombre,
        p.giro,
        COUNT(DISTINCT dc.id) AS total_documentos,
        COUNT(DISTINCT g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total,
        COALESCE(AVG(g.monto), 0) AS promedio_gasto,
        MAX(g.fecha) AS ultimo_gasto
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ? AND p.activo = 1
      GROUP BY p.id, p.razon_social, p.giro
      HAVING COALESCE(SUM(g.monto), 0) > 0
      ORDER BY COALESCE(SUM(g.monto), 0) DESC
      LIMIT 10
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener top proveedores:', error);
      res.status(500).json({ error: 'Error al obtener top proveedores' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/inactivos:
 *   get:
 *     tags: [Proveedores]
 *     summary: Proveedores inactivos (sin gastos en los últimos N días)
 *     parameters:
 *       - name: dias
 *         in: query
 *         schema:
 *           type: integer
 *           default: 90
 */
router.get(
  '/comunidad/:comunidadId/inactivos',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { dias = 90 } = req.query;

      const query = `
      SELECT
        p.id,
        p.razon_social AS nombre,
        p.giro,
        p.email,
        p.telefono,
        MAX(g.fecha) AS ultimo_gasto,
        DATEDIFF(CURDATE(), MAX(g.fecha)) AS dias_sin_gasto,
        COUNT(DISTINCT g.id) AS total_gastos_historicos,
        COALESCE(SUM(g.monto), 0) AS monto_total_historico
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ? AND p.activo = 1
      GROUP BY p.id, p.razon_social, p.giro, p.email, p.telefono
      HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURDATE(), MAX(g.fecha)) > ?
      ORDER BY DATEDIFF(CURDATE(), MAX(g.fecha)) DESC
    `;

      const [rows] = await db.query(query, [comunidadId, Number(dias)]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener proveedores inactivos:', error);
      res.status(500).json({ error: 'Error al obtener proveedores inactivos' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/analisis-mensual:
 *   get:
 *     tags: [Proveedores]
 *     summary: Análisis mensual de gastos por proveedor
 *     parameters:
 *       - name: meses
 *         in: query
 *         schema:
 *           type: integer
 *           default: 12
 */
router.get(
  '/comunidad/:comunidadId/analisis-mensual',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { meses = 12 } = req.query;

      const query = `
      SELECT
        p.id,
        p.razon_social AS nombre,
        YEAR(g.fecha) AS anio,
        MONTH(g.fecha) AS mes,
        DATE_FORMAT(g.fecha, '%Y-%m') AS periodo,
        COUNT(g.id) AS cantidad_gastos,
        COALESCE(SUM(g.monto), 0) AS total_monto,
        COALESCE(AVG(g.monto), 0) AS promedio_monto
      FROM proveedor p
      INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
      INNER JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ?
        AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY p.id, p.razon_social, YEAR(g.fecha), MONTH(g.fecha)
      ORDER BY p.razon_social, anio DESC, mes DESC
    `;

      const [rows] = await db.query(query, [comunidadId, Number(meses)]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener análisis mensual:', error);
      res.status(500).json({ error: 'Error al obtener análisis mensual' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/por-categoria:
 *   get:
 *     tags: [Proveedores]
 *     summary: Proveedores agrupados por categoría de gasto
 */
router.get(
  '/comunidad/:comunidadId/por-categoria',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cat.nombre AS categoria,
        cat.tipo AS tipo_categoria,
        COUNT(DISTINCT p.id) AS cantidad_proveedores,
        COUNT(g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total,
        COALESCE(AVG(g.monto), 0) AS promedio_gasto
      FROM categoria_gasto cat
      LEFT JOIN gasto g ON cat.id = g.categoria_id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE cat.comunidad_id = ?
      GROUP BY cat.id, cat.nombre, cat.tipo
      ORDER BY COALESCE(SUM(g.monto), 0) DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener proveedores por categoría:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener proveedores por categoría' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/comparativa:
 *   get:
 *     tags: [Proveedores]
 *     summary: Comparativa de proveedores por período
 *     parameters:
 *       - name: meses
 *         in: query
 *         schema:
 *           type: integer
 *           default: 3
 */
router.get(
  '/comunidad/:comunidadId/comparativa',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { meses = 3 } = req.query;

      const query = `
      SELECT
        p.id,
        p.razon_social AS nombre,
        COUNT(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.id END) AS gastos_periodo_actual,
        COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) AS monto_periodo_actual,
        COUNT(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.id END) AS gastos_periodo_anterior,
        COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) AS monto_periodo_anterior,
        CASE
          WHEN COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) > 0
          THEN ROUND(
            ((COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0) -
              COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0)) /
             NULLIF(COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH) AND g.fecha < DATE_SUB(CURDATE(), INTERVAL ? MONTH) THEN g.monto END), 0), 0)) * 100, 2)
          ELSE NULL
        END AS variacion_porcentual
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ? AND p.activo = 1
      GROUP BY p.id, p.razon_social
      HAVING (gastos_periodo_actual > 0 OR gastos_periodo_anterior > 0)
      ORDER BY monto_periodo_actual DESC
    `;

      const mesesNum = Number(meses);
      const [rows] = await db.query(query, [
        mesesNum,
        mesesNum,
        mesesNum * 2,
        mesesNum,
        mesesNum * 2,
        mesesNum,
        mesesNum * 2,
        mesesNum,
        mesesNum,
        mesesNum * 2,
        mesesNum,
        mesesNum * 2,
        mesesNum,
        comunidadId,
      ]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener comparativa:', error);
      res.status(500).json({ error: 'Error al obtener comparativa' });
    }
  }
);

// =========================================
// 4. DASHBOARD Y MÉTRICAS
// =========================================

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/dashboard:
 *   get:
 *     tags: [Proveedores]
 *     summary: Resumen general para dashboard
 */
router.get(
  '/comunidad/:comunidadId/dashboard',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        COUNT(CASE WHEN p.activo = 1 THEN 1 END) AS proveedores_activos,
        COUNT(CASE WHEN p.activo = 0 THEN 1 END) AS proveedores_inactivos,
        COUNT(DISTINCT dc.proveedor_id) AS proveedores_con_compras,
        COALESCE(SUM(CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN g.monto END), 0) AS total_gastado_mes_actual,
        COALESCE(AVG(g.monto), 0) AS promedio_gasto,
        COUNT(DISTINCT CASE WHEN g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN p.id END) AS proveedores_activos_mes,
        COUNT(DISTINCT CASE WHEN DATEDIFF(CURDATE(), MAX(g.fecha)) > 90 THEN p.id END) AS proveedores_sin_gasto_90_dias
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ?
    `;

      const [[dashboard]] = await db.query(query, [comunidadId]);

      res.json(dashboard);
    } catch (error) {
      console.error('Error al obtener dashboard:', error);
      res.status(500).json({ error: 'Error al obtener dashboard' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/top-mes:
 *   get:
 *     tags: [Proveedores]
 *     summary: Top 5 proveedores del mes
 */
router.get(
  '/comunidad/:comunidadId/top-mes',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        p.id,
        p.razon_social AS nombre,
        COUNT(g.id) AS cantidad_gastos,
        COALESCE(SUM(g.monto), 0) AS total_monto,
        COALESCE(AVG(g.monto), 0) AS promedio_monto,
        MAX(g.fecha) AS ultimo_gasto
      FROM proveedor p
      INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
      INNER JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ?
        AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND p.activo = 1
      GROUP BY p.id, p.razon_social
      ORDER BY COALESCE(SUM(g.monto), 0) DESC
      LIMIT 5
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener top del mes:', error);
      res.status(500).json({ error: 'Error al obtener top del mes' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/distribucion:
 *   get:
 *     tags: [Proveedores]
 *     summary: Distribución de gastos por proveedor (para gráficos)
 *     parameters:
 *       - name: meses
 *         in: query
 *         schema:
 *           type: integer
 *           default: 6
 */
router.get(
  '/comunidad/:comunidadId/distribucion',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { meses = 6 } = req.query;

      const query = `
      SELECT
        p.razon_social AS nombre,
        COALESCE(SUM(g.monto), 0) AS total_monto,
        ROUND((SUM(g.monto) / NULLIF((SELECT SUM(g2.monto)
                               FROM gasto g2
                               INNER JOIN documento_compra dc2 ON g2.documento_compra_id = dc2.id
                               WHERE dc2.proveedor_id IN (SELECT id FROM proveedor WHERE comunidad_id = ?)
                               AND g2.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)), 0)) * 100, 2) AS porcentaje_total
      FROM proveedor p
      INNER JOIN documento_compra dc ON p.id = dc.proveedor_id
      INNER JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ?
        AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        AND p.activo = 1
      GROUP BY p.id, p.razon_social
      HAVING COALESCE(SUM(g.monto), 0) > 0
      ORDER BY COALESCE(SUM(g.monto), 0) DESC
      LIMIT 10
    `;

      const mesesNum = Number(meses);
      const [rows] = await db.query(query, [
        comunidadId,
        mesesNum,
        comunidadId,
        mesesNum,
      ]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener distribución:', error);
      res.status(500).json({ error: 'Error al obtener distribución' });
    }
  }
);

/**
 * GET /proveedores
 * - superadmin: ve todos los proveedores (global)
 * - otros roles: ven proveedores solo de las comunidades donde son miembros activos
 * Query params soportados: page, limit, search, activo
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', activo } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // base where
    let where = ' WHERE 1=1 ';
    const params = [];

    if (search) {
      where += ' AND p.razon_social LIKE ?';
      params.push(`%${search}%`);
    }

    if (typeof activo !== 'undefined' && activo !== '') {
      where += ' AND p.activo = ?';
      params.push(Number(activo));
    }

    // Si NO es superadmin, limitar por comunidades donde el usuario tiene membresía activa
    if (!req.user?.is_superadmin) {
      // obtener comunidades del usuario
      const [comRows] = await db.query(
        `SELECT comunidad_id FROM usuario_miembro_comunidad
         WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
        [req.user.persona_id]
      );

      const comunidadIds = comRows.map((r) => r.comunidad_id);
      if (comunidadIds.length === 0) {
        // usuario sin comunidades -> no puede ver proveedores
        return res.json({
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            pages: 0,
          },
        });
      }

      // anexar cláusula IN con placeholders
      where += ` AND p.comunidad_id IN (${comunidadIds
        .map(() => '?')
        .join(',')})`;
      params.push(...comunidadIds);
    }

    // consulta principal (incluye nombre de comunidad)
    const query = `
      SELECT
        p.id,
        p.comunidad_id,
        c.razon_social AS comunidad_nombre,
        p.rut,
        p.dv,
        p.razon_social AS nombre,
        p.giro,
        p.email,
        p.telefono,
        p.direccion,
        p.activo,
        p.created_at,
        p.updated_at
      FROM proveedor p
      INNER JOIN comunidad c ON p.comunidad_id = c.id
      ${where}
      ORDER BY p.razon_social
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    // contar total (misma cláusula WHERE, sin limit/offset)
    const countParams = params.slice(0, params.length - 2);
    const countQuery = `SELECT COUNT(*) AS total FROM proveedor p INNER JOIN comunidad c ON p.comunidad_id = c.id ${where}`;
    const [countRes] = await db.query(countQuery, countParams);
    const total = countRes[0]?.total ?? rows.length;

    res.json({
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error GET /proveedores:', err);
    res.status(500).json({ error: 'Error al listar proveedores' });
  }
});

// =========================================
// 5. VALIDACIONES
// =========================================

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/validar-rut:
 *   post:
 *     tags: [Proveedores]
 *     summary: Validar que el RUT no esté duplicado
 */
router.post(
  '/comunidad/:comunidadId/validar-rut',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { rut, dv, id = 0 } = req.body;

      const query = `
      SELECT COUNT(*) AS existe_rut
      FROM proveedor
      WHERE comunidad_id = ? AND rut = ? AND dv = ? AND id != ?
    `;

      const [[result]] = await db.query(query, [comunidadId, rut, dv, id]);

      res.json({ existe: result.existe_rut > 0 });
    } catch (error) {
      console.error('Error al validar RUT:', error);
      res.status(500).json({ error: 'Error al validar RUT' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/{id}/validar-eliminacion:
 *   get:
 *     tags: [Proveedores]
 *     summary: Validar si el proveedor puede ser eliminado
 */
router.get('/:id/validar-eliminacion', authenticate, async (req, res) => {
  try {
    const proveedorId = Number(req.params.id);

    const query = `
      SELECT
        COUNT(dc.id) AS documentos_asociados,
        COUNT(g.id) AS gastos_asociados
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.id = ?
    `;

    const [[result]] = await db.query(query, [proveedorId]);

    res.json({
      puede_eliminar:
        result.documentos_asociados === 0 && result.gastos_asociados === 0,
      documentos_asociados: result.documentos_asociados,
      gastos_asociados: result.gastos_asociados,
    });
  } catch (error) {
    console.error('Error al validar eliminación:', error);
    res.status(500).json({ error: 'Error al validar eliminación' });
  }
});

// =========================================
// 6. EXPORTACIÓN Y UTILIDADES
// =========================================

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/export:
 *   get:
 *     tags: [Proveedores]
 *     summary: Exportar proveedores con todos sus datos
 */
router.get(
  '/comunidad/:comunidadId/export',
  authenticate,
  requireCommunity('comunidadId', ['admin', 'superadmin']),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        p.id,
        CONCAT(p.rut, '-', p.dv) AS rut_completo,
        p.razon_social AS nombre,
        p.giro AS categoria,
        p.email,
        p.telefono,
        p.direccion,
        p.activo,
        COUNT(DISTINCT dc.id) AS total_documentos,
        COUNT(DISTINCT g.id) AS total_gastos,
        COALESCE(SUM(g.monto), 0) AS monto_total_gastado,
        MAX(g.fecha) AS ultimo_gasto,
        p.created_at,
        p.updated_at
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ?
      GROUP BY p.id, CONCAT(p.rut, '-', p.dv), p.razon_social, p.giro, p.email, p.telefono, p.direccion, p.activo, p.created_at, p.updated_at
      ORDER BY p.razon_social
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al exportar proveedores:', error);
      res.status(500).json({ error: 'Error al exportar proveedores' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}/dropdown:
 *   get:
 *     tags: [Proveedores]
 *     summary: Lista simple para selects/dropdowns
 */
router.get(
  '/comunidad/:comunidadId/dropdown',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        id,
        CONCAT(razon_social, ' (', rut, '-', dv, ')') AS nombre_completo,
        razon_social AS nombre,
        giro AS categoria
      FROM proveedor
      WHERE comunidad_id = ? AND activo = 1
      ORDER BY razon_social
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener lista de proveedores:', error);
      res.status(500).json({ error: 'Error al obtener lista de proveedores' });
    }
  }
);

// =========================================
// 7. CRUD BÁSICO
// =========================================

/**
 * @swagger
 * /api/proveedores/comunidad/{comunidadId}:
 *   post:
 *     tags: [Proveedores]
 *     summary: Crear nuevo proveedor
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin', 'superadmin', 'admin_comunidad']),
    body('rut').notEmpty(),
    body('dv').notEmpty(),
    body('razon_social').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { rut, dv, razon_social, giro, email, telefono, direccion } =
        req.body;

      const [result] = await db.query(
        'INSERT INTO proveedor (comunidad_id, rut, dv, razon_social, giro, email, telefono, direccion) VALUES (?,?,?,?,?,?,?,?)',
        [
          comunidadId,
          rut,
          dv,
          razon_social,
          giro || null,
          email || null,
          telefono || null,
          direccion || null,
        ]
      );

      const [row] = await db.query(
        'SELECT id, rut, dv, razon_social FROM proveedor WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      if (error && error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Proveedor ya existe' });
      }
      res.status(500).json({ error: 'Error al crear proveedor' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   patch:
 *     tags: [Proveedores]
 *     summary: Actualizar proveedor
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const fields = [
        'rut',
        'dv',
        'razon_social',
        'giro',
        'email',
        'telefono',
        'direccion',
        'activo',
      ];
      const updates = [];
      const values = [];

      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });

      if (!updates.length) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      await db.query(
        `UPDATE proveedor SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const [rows] = await db.query(
        'SELECT id, rut, dv, razon_social, activo FROM proveedor WHERE id = ? LIMIT 1',
        [id]
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
  }
);

/**
 * @swagger
 * /api/proveedores/{id}:
 *   delete:
 *     tags: [Proveedores]
 *     summary: Eliminar proveedor (solo si no tiene dependencias)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Verificar si tiene documentos asociados
      const [[check]] = await db.query(
        'SELECT COUNT(*) AS count FROM documento_compra WHERE proveedor_id = ?',
        [id]
      );

      if (check.count > 0) {
        return res.status(400).json({
          error:
            'No se puede eliminar el proveedor porque tiene documentos asociados',
          documentos_asociados: check.count,
        });
      }

      await db.query('DELETE FROM proveedor WHERE id = ?', [id]);

      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE PROVEEDORES
// =========================================

// // 1. LISTADOS CON ESTADÍSTICAS
// GET: /proveedores/comunidad/:comunidadId
// GET: /proveedores/comunidad/:comunidadId/estadisticas

// // 2. DETALLE COMPLETO
// GET: /proveedores/:id
// GET: /proveedores/:id/historial-gastos
// GET: /proveedores/:id/documentos

// // 3. REPORTES Y ANÁLISIS
// GET: /proveedores/comunidad/:comunidadId/top-volumen
// GET: /proveedores/comunidad/:comunidadId/inactivos
// GET: /proveedores/comunidad/:comunidadId/analisis-mensual
// GET: /proveedores/comunidad/:comunidadId/por-categoria
// GET: /proveedores/comunidad/:comunidadId/comparativa

// // 4. DASHBOARD Y MÉTRICAS
// GET: /proveedores/comunidad/:comunidadId/dashboard
// GET: /proveedores/comunidad/:comunidadId/top-mes
// GET: /proveedores/comunidad/:comunidadId/distribucion

// // 5. VALIDACIONES
// POST: /proveedores/comunidad/:comunidadId/validar-rut
// GET: /proveedores/:id/validar-eliminacion

// // 6. EXPORTACIÓN Y UTILIDADES
// GET: /proveedores/comunidad/:comunidadId/export
// GET: /proveedores/comunidad/:comunidadId/dropdown

// // 7. CRUD BÁSICO
// POST: /proveedores/comunidad/:comunidadId
// PATCH: /proveedores/:id
// DELETE: /proveedores/:id
