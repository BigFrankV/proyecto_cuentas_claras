const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * components:
 *   schemas:
 *     EmisionGastosComunes:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         periodo:
 *           type: string
 *         fecha_vencimiento:
 *           type: string
 *           format: date
 *         estado:
 *           type: string
 *         observaciones:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     DetalleEmisionGasto:
 *       type: object
 *       properties:
 *         detalle_emision_gasto_id:
 *           type: integer
 *         glosa_gasto:
 *           type: string
 *         fecha_gasto:
 *           type: string
 *           format: date
 *         monto_total_gasto:
 *           type: number
 *         categoria_nombre:
 *           type: string
 *         centro_costo_nombre:
 *           type: string
 *         regla_prorrateo:
 *           type: string
 *         metadata_json:
 *           type: string
 *         monto_a_prorratear:
 *           type: number
 *     CuentaCobroUnidad:
 *       type: object
 *       properties:
 *         cuenta_cobro_id:
 *           type: integer
 *         unidad_codigo:
 *           type: string
 *         torre_nombre:
 *           type: string
 *         monto_total:
 *           type: number
 *         saldo:
 *           type: number
 *         estado_cobro:
 *           type: string
 *         interes_acumulado:
 *           type: number
 *         titular_nombres:
 *           type: string
 *         titular_apellidos:
 *           type: string
 *         titular_tipo:
 *           type: string
 */

// ============================================================================
// ENDPOINTS DE EMISIONES
// ============================================================================

/**
 * @swagger
 * /prorrateo/emisiones/{comunidadId}:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener emisiones de gastos comunes por comunidad
 *     description: Lista todas las emisiones de gastos comunes de una comunidad específica
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmisionGastosComunes'
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/emisiones/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const [rows] = await db.query(
        `
      SELECT
        id AS emision_id,
        periodo,
        fecha_vencimiento,
        estado,
        observaciones,
        created_at
      FROM
        emision_gastos_comunes
      WHERE
        comunidad_id = ?
      ORDER BY
        periodo DESC
    `,
        [comunidadId]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error fetching emisiones:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener emisiones de gastos comunes' });
    }
  }
);

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/detalles:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener detalles de gastos de una emisión
 *     description: Lista todos los gastos incluidos en una emisión específica con sus detalles
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de detalles de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetalleEmisionGasto'
 *       500:
 *         description: Error del servidor
 */
router.get('/emision/:emisionId/detalles', authenticate, async (req, res) => {
  try {
    const emisionId = Number(req.params.emisionId);

    const [rows] = await db.query(
      `
      SELECT
        deg.id AS detalle_emision_gasto_id,
        g.glosa AS glosa_gasto,
        g.fecha AS fecha_gasto,
        g.monto AS monto_total_gasto,
        cg.nombre AS categoria_nombre,
        cc.nombre AS centro_costo_nombre,
        deg.regla_prorrateo,
        deg.metadata_json,
        deg.monto AS monto_a_prorratear
      FROM
        detalle_emision_gastos deg
      INNER JOIN
        gasto g ON deg.gasto_id = g.id
      INNER JOIN
        categoria_gasto cg ON deg.categoria_id = cg.id
      LEFT JOIN
        centro_costo cc ON g.centro_costo_id = cc.id
      WHERE
        deg.emision_id = ?
      ORDER BY
        cg.nombre, g.fecha
    `,
      [emisionId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching detalles emision:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la emisión' });
  }
});

// ============================================================================
// ENDPOINTS DE CUENTAS DE COBRO
// ============================================================================

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/cuentas:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener cuentas de cobro de una emisión
 *     description: Lista todas las cuentas de cobro generadas para las unidades en una emisión específica
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de cuentas de cobro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CuentaCobroUnidad'
 *       500:
 *         description: Error del servidor
 */
router.get('/emision/:emisionId/cuentas', authenticate, async (req, res) => {
  try {
    const emisionId = Number(req.params.emisionId);

    const [rows] = await db.query(
      `
      SELECT
        ccu.id AS cuenta_cobro_id,
        u.codigo AS unidad_codigo,
        t.nombre AS torre_nombre,
        ccu.monto_total,
        ccu.saldo,
        ccu.estado AS estado_cobro,
        ccu.interes_acumulado,
        p.nombres AS titular_nombres,
        p.apellidos AS titular_apellidos,
        tu.tipo AS titular_tipo
      FROM
        cuenta_cobro_unidad ccu
      INNER JOIN
        unidad u ON ccu.unidad_id = u.id
      LEFT JOIN
        torre t ON u.torre_id = t.id
      LEFT JOIN
        titulares_unidad tu ON u.id = tu.unidad_id AND tu.hasta IS NULL
      LEFT JOIN
        persona p ON tu.persona_id = p.id
      WHERE
        ccu.emision_id = ?
      ORDER BY
        u.codigo
    `,
      [emisionId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching cuentas cobro:', error);
    res.status(500).json({ error: 'Error al obtener cuentas de cobro' });
  }
});

/**
 * @swagger
 * /prorrateo/cuenta/{cuentaId}/detalles:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener detalles de cargos de una cuenta específica
 *     description: Lista todos los cargos individuales que componen una cuenta de cobro específica
 *     parameters:
 *       - in: path
 *         name: cuentaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta de cobro
 *     responses:
 *       200:
 *         description: Lista de detalles de cargos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   detalle_cargo_id:
 *                     type: integer
 *                   categoria_nombre:
 *                     type: string
 *                   glosa:
 *                     type: string
 *                   monto:
 *                     type: number
 *                   origen:
 *                     type: string
 *                   iva_incluido:
 *                     type: boolean
 *       500:
 *         description: Error del servidor
 */
router.get('/cuenta/:cuentaId/detalles', authenticate, async (req, res) => {
  try {
    const cuentaId = Number(req.params.cuentaId);

    const [rows] = await db.query(
      `
      SELECT
        dcu.id AS detalle_cargo_id,
        cg.nombre AS categoria_nombre,
        dcu.glosa,
        dcu.monto,
        dcu.origen,
        dcu.iva_incluido
      FROM
        detalle_cuenta_unidad dcu
      INNER JOIN
        categoria_gasto cg ON dcu.categoria_id = cg.id
      WHERE
        dcu.cuenta_cobro_unidad_id = ?
      ORDER BY
        dcu.origen, cg.nombre
    `,
      [cuentaId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching detalles cuenta:', error);
    res.status(500).json({ error: 'Error al obtener detalles de la cuenta' });
  }
});

// ============================================================================
// ENDPOINTS DE PAGOS
// ============================================================================

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/pagos:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener pagos de una emisión
 *     description: Lista todos los pagos realizados para las cuentas de una emisión específica
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pago_id:
 *                     type: integer
 *                   unidad_codigo:
 *                     type: string
 *                   fecha_pago:
 *                     type: string
 *                     format: date
 *                   monto_pago:
 *                     type: number
 *                   medio:
 *                     type: string
 *                   estado_pago:
 *                     type: string
 *                   estado_conciliacion_bancaria:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get('/emision/:emisionId/pagos', authenticate, async (req, res) => {
  try {
    const emisionId = Number(req.params.emisionId);

    const [rows] = await db.query(
      `
      SELECT
        p.id AS pago_id,
        u.codigo AS unidad_codigo,
        p.fecha AS fecha_pago,
        p.monto AS monto_pago,
        p.medio,
        p.estado AS estado_pago,
        cb.estado AS estado_conciliacion_bancaria
      FROM
        pago p
      INNER JOIN
        pago_aplicacion pa ON p.id = pa.pago_id
      INNER JOIN
        cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
      INNER JOIN
        unidad u ON p.unidad_id = u.id
      LEFT JOIN
        conciliacion_bancaria cb ON p.id = cb.pago_id
      WHERE
        ccu.emision_id = ?
      GROUP BY
        p.id, u.codigo, cb.estado
      ORDER BY
        p.fecha DESC
    `,
      [emisionId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos de la emisión' });
  }
});

// ============================================================================
// ENDPOINTS DE REPORTES Y RESUMENES
// ============================================================================

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/resumen:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener resumen general de una emisión
 *     description: Proporciona un resumen completo de una emisión incluyendo estadísticas generales
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Resumen de la emisión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 period:
 *                   type: string
 *                 type:
 *                   type: string
 *                 status:
 *                   type: string
 *                 issueDate:
 *                   type: string
 *                   format: date
 *                 dueDate:
 *                   type: string
 *                   format: date
 *                 description:
 *                   type: string
 *                 communityName:
 *                   type: string
 *                 unitCount:
 *                   type: integer
 *                 totalAmount:
 *                   type: number
 *                 paidAmount:
 *                   type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/emision/:emisionId/resumen', authenticate, async (req, res) => {
  try {
    const emisionId = Number(req.params.emisionId);

    const [rows] = await db.query(
      `
      SELECT
        e.id,
        e.periodo AS period,
        'gastos_comunes' AS type,
        e.estado AS status,
        DATE(e.created_at) AS issueDate,
        e.fecha_vencimiento AS dueDate,
        e.observaciones AS description,
        c.razon_social AS communityName,
        COUNT(ccu.unidad_id) AS unitCount,
        COALESCE(SUM(ccu.monto_total), 0.00) AS totalAmount,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0.00) AS paidAmount
      FROM
        emision_gastos_comunes e
      INNER JOIN
        comunidad c ON e.comunidad_id = c.id
      LEFT JOIN
        cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
      WHERE
        e.id = ?
      GROUP BY
        e.id, c.razon_social
      LIMIT 1
    `,
      [emisionId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Emisión no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching resumen emision:', error);
    res.status(500).json({ error: 'Error al obtener resumen de la emisión' });
  }
});

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/conceptos:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener totales por concepto de una emisión
 *     description: Agrupa los montos totales por categoría de gasto para una emisión específica
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Totales por concepto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   conceptName:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/emision/:emisionId/conceptos', authenticate, async (req, res) => {
  try {
    const emisionId = Number(req.params.emisionId);

    const [rows] = await db.query(
      `
      SELECT
        cg.nombre AS conceptName,
        COALESCE(SUM(deg.monto), 0.00) AS totalAmount
      FROM
        detalle_emision_gastos deg
      INNER JOIN
        categoria_gasto cg ON deg.categoria_id = cg.id
      WHERE
        deg.emision_id = ?
      GROUP BY
        cg.nombre
      ORDER BY
        totalAmount DESC
    `,
      [emisionId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching conceptos:', error);
    res.status(500).json({ error: 'Error al obtener conceptos de la emisión' });
  }
});

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/unidades:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener unidades con montos de una emisión
 *     description: Lista todas las unidades con sus montos correspondientes en una emisión específica
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de unidades con montos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   unitNumber:
 *                     type: string
 *                   unitType:
 *                     type: string
 *                   owner:
 *                     type: string
 *                   participation:
 *                     type: number
 *                   totalAmount:
 *                     type: number
 *                   paidAmount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   emision_id:
 *                     type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/emision/:emisionId/unidades', authenticate, async (req, res) => {
  try {
    const emisionId = Number(req.params.emisionId);

    const [rows] = await db.query(
      `
      SELECT
        ccu.id AS id,
        u.codigo AS unitNumber,
        'Departamento' AS unitType,
        CONCAT(p.nombres, ' ', p.apellidos) AS owner,
        u.alicuota * 100 AS participation,
        ccu.monto_total AS totalAmount,
        ccu.monto_total - ccu.saldo AS paidAmount,
        ccu.estado AS status,
        e.id AS emision_id
      FROM
        cuenta_cobro_unidad ccu
      INNER JOIN
        unidad u ON ccu.unidad_id = u.id
      LEFT JOIN
        titulares_unidad tu ON u.id = tu.unidad_id AND tu.hasta IS NULL
      LEFT JOIN
        persona p ON tu.persona_id = p.id
      INNER JOIN
        emision_gastos_comunes e ON ccu.emision_id = e.id
      WHERE
        ccu.emision_id = ?
      ORDER BY
        u.codigo
    `,
      [emisionId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching unidades:', error);
    res.status(500).json({ error: 'Error al obtener unidades de la emisión' });
  }
});

/**
 * @swagger
 * /prorrateo/emision/{emisionId}/conceptos-detallados:
 *   get:
 *     tags: [Prorrateo]
 *     summary: Obtener conceptos detallados por unidad de una emisión
 *     description: Proporciona un breakdown detallado de cómo se prorratean los conceptos por cada unidad
 *     parameters:
 *       - in: path
 *         name: emisionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Conceptos detallados por unidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   conceptId:
 *                     type: integer
 *                   conceptName:
 *                     type: string
 *                   unitAmount:
 *                     type: number
 *                   totalAmount:
 *                     type: number
 *                   distributionType:
 *                     type: string
 *                   ccu_id:
 *                     type: integer
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/emision/:emisionId/conceptos-detallados',
  authenticate,
  async (req, res) => {
    try {
      const emisionId = Number(req.params.emisionId);

      const [rows] = await db.query(
        `
      SELECT
        dcu.id AS conceptId,
        cg.nombre AS conceptName,
        dcu.monto AS unitAmount,
        (
          SELECT deg.monto
          FROM detalle_emision_gastos deg
          WHERE deg.emision_id = ccu.emision_id
          AND deg.categoria_id = dcu.categoria_id
          LIMIT 1
        ) AS totalAmount,
        CASE
          WHEN deg_base.regla_prorrateo = 'coeficiente' THEN 'proportional'
          WHEN deg_base.regla_prorrateo = 'partes_iguales' THEN 'equal'
          ELSE 'custom'
        END AS distributionType,
        dcu.cuenta_cobro_unidad_id AS ccu_id
      FROM
        detalle_cuenta_unidad dcu
      INNER JOIN
        cuenta_cobro_unidad ccu ON dcu.cuenta_cobro_unidad_id = ccu.id
      INNER JOIN
        categoria_gasto cg ON dcu.categoria_id = cg.id
      LEFT JOIN
        detalle_emision_gastos deg_base ON ccu.emision_id = deg_base.emision_id
        AND dcu.categoria_id = deg_base.categoria_id
      WHERE
        ccu.emision_id = ?
      ORDER BY
        ccu_id, conceptName
    `,
        [emisionId]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error fetching conceptos detallados:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener conceptos detallados de la emisión' });
    }
  }
);

module.exports = router;
