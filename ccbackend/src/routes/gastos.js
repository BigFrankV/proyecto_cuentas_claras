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
 *   - name: Gastos
 *     description: |
 *       Gestión completa de gastos operativos y extraordinarios.
 *       Incluye filtros avanzados, estadísticas, reportes y validaciones.
 */

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Listar gastos de una comunidad con filtros avanzados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: proveedor
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: monto_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: monto_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: centro_costo_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: extraordinario
 *         schema:
 *           type: integer
 *           enum: [0, 1, -1]
 *     responses:
 *       200:
 *         description: Lista de gastos
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const {
      page = 1,
      limit = 100,
      categoria = '',
      proveedor = '',
      fecha_desde = '',
      fecha_hasta = '',
      monto_min = 0,
      monto_max = 0,
      categoria_id = 0,
      centro_costo_id = 0,
      extraordinario = -1,
    } = req.query;

    const offset = (page - 1) * limit;

    try {
      // Construir cláusulas WHERE dinámicas
      let whereComunidad = 'AND g.comunidad_id = ?';
      let whereFecha = '';
      let whereMonto = '';
      const params = [comunidadId];

      // Solo agregar filtro de fecha si ambos valores están presentes
      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      // Solo agregar filtro de monto si ambos valores son mayores a 0
      if (monto_min > 0 && monto_max > 0) {
        whereMonto = 'AND g.monto BETWEEN ? AND ?';
        params.push(Number(monto_min), Number(monto_max));
      }

      // Agregar resto de parámetros
      params.push(
        categoria,
        categoria,
        proveedor,
        proveedor,
        categoria_id,
        categoria_id,
        centro_costo_id,
        centro_costo_id,
        extraordinario,
        extraordinario,
        Number(limit),
        Number(offset)
      );

      const [rows] = await db.query(
        `
      SELECT
        g.id,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        cat.nombre AS categoria,
        cc.nombre AS centro_costo,
        p.razon_social AS proveedor,
        dc.folio AS documento_numero,
        CASE WHEN COUNT(a.id) > 0 THEN 1 ELSE 0 END AS tiene_adjuntos,
        g.extraordinario,
        g.comunidad_id,
        g.estado,
        COALESCE(ga_count.total_aprobaciones, 0) AS current_approvals,
        g.created_at
      FROM gasto g
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
      LEFT JOIN (
        SELECT gasto_id, COUNT(*) AS total_aprobaciones
        FROM gasto_aprobacion
        WHERE accion = 'aprobar'
        GROUP BY gasto_id
      ) ga_count ON g.id = ga_count.gasto_id
      WHERE 1=1
        ${whereComunidad}
        ${whereFecha}
        ${whereMonto}
        AND (cat.nombre LIKE CONCAT('%', ?, '%') OR ? = '')
        AND (p.razon_social LIKE CONCAT('%', ?, '%') OR ? = '')
        AND (g.categoria_id = ? OR ? = 0)
        AND (g.centro_costo_id = ? OR ? = 0)
        AND (g.extraordinario = ? OR ? = -1)
      GROUP BY g.id
      ORDER BY g.fecha DESC, g.created_at DESC
      LIMIT ? OFFSET ?
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}/count:
 *   get:
 *     tags: [Gastos]
 *     summary: Contar gastos con filtros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total de gastos
 */
router.get(
  '/comunidad/:comunidadId/count',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const {
      categoria = '',
      proveedor = '',
      fecha_desde = '',
      fecha_hasta = '',
      monto_min = 0,
      monto_max = 0,
      categoria_id = 0,
      centro_costo_id = 0,
      extraordinario = -1,
    } = req.query;

    try {
      // Construir cláusulas WHERE dinámicas
      let whereFecha = '';
      let whereMonto = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      if (monto_min > 0 && monto_max > 0) {
        whereMonto = 'AND g.monto BETWEEN ? AND ?';
        params.push(Number(monto_min), Number(monto_max));
      }

      params.push(
        categoria,
        categoria,
        proveedor,
        proveedor,
        categoria_id,
        categoria_id,
        centro_costo_id,
        centro_costo_id,
        extraordinario,
        extraordinario
      );

      const [[row]] = await db.query(
        `
      SELECT COUNT(DISTINCT g.id) AS total
      FROM gasto g
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.comunidad_id = ?
        ${whereFecha}
        ${whereMonto}
        AND (cat.nombre LIKE CONCAT('%', ?, '%') OR ? = '')
        AND (p.razon_social LIKE CONCAT('%', ?, '%') OR ? = '')
        AND (g.categoria_id = ? OR ? = 0)
        AND (g.centro_costo_id = ? OR ? = 0)
        AND (g.extraordinario = ? OR ? = -1)
    `,
        params
      );

      res.json({ total: row.total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/comunidad/{comunidadId}:
 *   post:
 *     tags: [Gastos]
 *     summary: Crear nuevo gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoria_id
 *               - fecha
 *               - monto
 *             properties:
 *               categoria_id:
 *                 type: integer
 *               centro_costo_id:
 *                 type: integer
 *               documento_compra_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               monto:
 *                 type: number
 *               glosa:
 *                 type: string
 *               extraordinario:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Gasto creado
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity(
      'comunidadId',
      ['superadmin', 'contador', 'admin_comunidad'],
      true
    ),
    body('categoria_id').isInt(),
    body('fecha').notEmpty(),
    body('monto').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const comunidadId = Number(req.params.comunidadId);
    const {
      categoria_id,
      centro_costo_id,
      documento_compra_id,
      fecha,
      monto,
      glosa,
      extraordinario,
    } = req.body;

    // Generar numero único (ej. 'G-' + timestamp + comunidadId para mayor unicidad)
    const numero = `G${Date.now()}-${comunidadId}`;

    try {
      const [result] = await db.query(
        'INSERT INTO gasto (numero, comunidad_id, categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          numero,
          comunidadId,
          categoria_id,
          centro_costo_id || null,
          documento_compra_id || null,
          fecha,
          monto,
          glosa || null,
          extraordinario ? 1 : 0,
        ]
      );

      const [row] = await db.query(
        'SELECT id, categoria_id, fecha, monto FROM gasto WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/{id}:
 *   get:
 *     tags: [Gastos]
 *     summary: Obtener detalle completo de un gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del gasto
 *       404:
 *         description: No encontrado
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await db.query(
      `
      SELECT
        g.id,
        g.comunidad_id,
        c.razon_social AS comunidad_nombre,
        g.categoria_id,
        cat.nombre AS categoria_nombre,
        cat.tipo AS categoria_tipo,
        g.centro_costo_id,
        cc.nombre AS centro_costo_nombre,
        cc.codigo AS centro_costo_codigo,
        g.documento_compra_id,
        dc.tipo_doc AS documento_tipo,
        dc.folio AS documento_numero,
        dc.fecha_emision AS documento_fecha,
        dc.neto,
        dc.iva,
        dc.exento,
        dc.total,
        dc.glosa AS documento_glosa,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        g.extraordinario,
        p.id AS proveedor_id,
        p.razon_social AS proveedor_nombre,
        p.rut AS proveedor_rut,
        p.dv AS proveedor_dv,
        p.giro AS proveedor_giro,
        p.email AS proveedor_email,
        p.telefono AS proveedor_telefono,
        p.direccion AS proveedor_direccion,
        g.estado, 
        g.aprobaciones_count AS current_approvals,
        g.created_at,
        g.updated_at
      FROM gasto g
      LEFT JOIN comunidad c ON g.comunidad_id = c.id
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.id = ?
      LIMIT 1
    `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /gastos/{id}/archivos:
 *   get:
 *     tags: [Gastos]
 *     summary: Obtener archivos adjuntos del gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de archivos adjuntos
 */
router.get('/:id/archivos', authenticate, async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await db.query(
      `
      SELECT
        a.id,
        a.original_name,
        a.filename,
        a.file_path,
        a.file_size,
        a.mimetype,
        a.category,
        a.description,
        a.uploaded_at,
        a.uploaded_by,
        CONCAT(per.nombres, ' ', per.apellido_paterno, ' ', COALESCE(per.apellido_materno, '')) AS uploaded_by_name
      FROM archivos a
      LEFT JOIN usuario u ON a.uploaded_by = u.id
      LEFT JOIN persona per ON u.persona_id = per.id
      WHERE a.entity_type = 'gasto'
        AND a.entity_id = ?
        AND a.is_active = 1
      ORDER BY a.uploaded_at DESC
    `,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /gastos/{id}:
 *   patch:
 *     tags: [Gastos]
 *     summary: Actualizar gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto actualizado
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const id = req.params.id;
    const fields = [
      'categoria_id',
      'centro_costo_id',
      'documento_compra_id',
      'fecha',
      'monto',
      'glosa',
      'extraordinario',
    ];
    const updates = [];
    const values = [];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });

    if (!updates.length) return res.status(400).json({ error: 'no fields' });

    values.push(id);

    try {
      await db.query(
        `UPDATE gasto SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT id, categoria_id, fecha, monto FROM gasto WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/{id}:
 *   delete:
 *     tags: [Gastos]
 *     summary: Eliminar gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminado
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    const id = req.params.id;

    try {
      await db.query('DELETE FROM gasto WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// ==================== ESTADÍSTICAS ====================

/**
 * @swagger
 * /gastos/estadisticas/general/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Estadísticas generales de gastos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas generales
 */
router.get(
  '/estadisticas/general/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [[row]] = await db.query(
        `
      SELECT
        COUNT(*) AS total_gastos,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_monto,
        MIN(monto) AS monto_minimo,
        MAX(monto) AS monto_maximo,
        MIN(fecha) AS fecha_primer_gasto,
        MAX(fecha) AS fecha_ultimo_gasto
      FROM gasto
      WHERE comunidad_id = ?
        ${whereFecha}
    `,
        params
      );

      res.json(row);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/estadisticas/por-categoria/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Gastos agrupados por categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gastos por categoría
 */
router.get(
  '/estadisticas/por-categoria/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [rows] = await db.query(
        `
      SELECT
        cat.nombre AS categoria,
        cat.tipo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_monto,
        MIN(g.monto) AS monto_minimo,
        MAX(g.monto) AS monto_maximo
      FROM gasto g
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      WHERE g.comunidad_id = ?
        ${whereFecha}
      GROUP BY cat.id, cat.nombre, cat.tipo
      ORDER BY total_monto DESC
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/estadisticas/por-centro-costo/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Gastos agrupados por centro de costo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gastos por centro de costo
 */
router.get(
  '/estadisticas/por-centro-costo/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [rows] = await db.query(
        `
      SELECT
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_monto
      FROM gasto g
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      WHERE g.comunidad_id = ?
        ${whereFecha}
      GROUP BY cc.id, cc.nombre, cc.codigo
      ORDER BY total_monto DESC
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/estadisticas/por-proveedor/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Gastos agrupados por proveedor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gastos por proveedor
 */
router.get(
  '/estadisticas/por-proveedor/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [rows] = await db.query(
        `
      SELECT
        p.razon_social AS proveedor,
        p.rut,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_monto,
        MAX(g.fecha) AS ultimo_gasto
      FROM gasto g
      INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
      INNER JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.comunidad_id = ?
        ${whereFecha}
      GROUP BY p.id, p.razon_social, p.rut
      ORDER BY total_monto DESC
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/estadisticas/mensuales/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Gastos mensuales (últimos 12 meses)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gastos mensuales
 */
router.get(
  '/estadisticas/mensuales/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);

    try {
      const [rows] = await db.query(
        `
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        COUNT(*) AS cantidad_gastos,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_monto
      FROM gasto
      WHERE comunidad_id = ?
        AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes DESC
    `,
        [comunidadId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/estadisticas/extraordinarios-vs-operativos/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Comparación gastos extraordinarios vs operativos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comparación de gastos
 */
router.get(
  '/estadisticas/extraordinarios-vs-operativos/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId, comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [rows] = await db.query(
        `
      SELECT
        CASE
          WHEN extraordinario = 1 THEN 'Extraordinarios'
          ELSE 'Operativos'
        END AS tipo_gasto,
        COUNT(*) AS cantidad,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_monto,
        (SUM(monto) / (SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?)) * 100 AS porcentaje_total
      FROM gasto
      WHERE comunidad_id = ?
        ${whereFecha}
      GROUP BY extraordinario
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// ==================== VALIDACIONES ====================

/**
 * @swagger
 * /gastos/validar/existe/{id}:
 *   get:
 *     tags: [Gastos]
 *     summary: Verificar si existe un gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: comunidad_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/existe/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { comunidad_id } = req.query;

  try {
    const [[row]] = await db.query(
      'SELECT COUNT(*) > 0 AS existe FROM gasto WHERE id = ? AND comunidad_id = ?',
      [id, comunidad_id]
    );
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /gastos/validar/categoria/{id}:
 *   get:
 *     tags: [Gastos]
 *     summary: Verificar si existe categoría de gasto activa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/categoria/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { comunidad_id } = req.query;

  try {
    const [[row]] = await db.query(
      'SELECT COUNT(*) > 0 AS existe FROM categoria_gasto WHERE id = ? AND comunidad_id = ? AND activa = 1',
      [id, comunidad_id]
    );
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /gastos/validar/duplicado:
 *   get:
 *     tags: [Gastos]
 *     summary: Verificar si existe gasto duplicado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: folio
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: gasto_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/duplicado', authenticate, async (req, res) => {
  const { comunidad_id, folio, fecha, gasto_id = 0 } = req.query;

  try {
    const [[row]] = await db.query(
      `
      SELECT COUNT(*) > 0 AS existe_duplicado
      FROM gasto g
      INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
      WHERE g.comunidad_id = ?
        AND dc.folio = ?
        AND g.fecha = ?
        AND g.id != ?
    `,
      [comunidad_id, folio, fecha, gasto_id]
    );

    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ==================== LISTAS DESPLEGABLES ====================

/**
 * @swagger
 * /gastos/listas/categorias/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Lista de categorías de gasto activas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get(
  '/listas/categorias/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);

    try {
      const [rows] = await db.query(
        `
      SELECT
        id,
        nombre,
        tipo,
        cta_contable
      FROM categoria_gasto
      WHERE comunidad_id = ? AND activa = 1
      ORDER BY nombre
    `,
        [comunidadId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/listas/centros-costo/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Lista de centros de costo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de centros de costo
 */
router.get(
  '/listas/centros-costo/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);

    try {
      const [rows] = await db.query(
        `
      SELECT
        id,
        nombre,
        codigo
      FROM centro_costo
      WHERE comunidad_id = ?
      ORDER BY nombre
    `,
        [comunidadId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/listas/proveedores/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Lista de proveedores activos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de proveedores
 */
router.get(
  '/listas/proveedores/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);

    try {
      const [rows] = await db.query(
        `
      SELECT
        id,
        razon_social,
        rut,
        CONCAT(rut, '-', dv) AS rut_completo
      FROM proveedor
      WHERE comunidad_id = ? AND activo = 1
      ORDER BY razon_social
    `,
        [comunidadId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/listas/documentos-disponibles/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Lista de documentos de compra no asociados a gastos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de documentos disponibles
 */
router.get(
  '/listas/documentos-disponibles/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);

    try {
      const [rows] = await db.query(
        `
      SELECT
        dc.id,
        dc.tipo_doc,
        dc.folio,
        dc.fecha_emision,
        dc.total,
        p.razon_social AS proveedor
      FROM documento_compra dc
      INNER JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE dc.comunidad_id = ?
        AND dc.id NOT IN (
          SELECT documento_compra_id
          FROM gasto
          WHERE documento_compra_id IS NOT NULL
            AND comunidad_id = ?
        )
      ORDER BY dc.fecha_emision DESC
    `,
        [comunidadId, comunidadId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// ==================== REPORTES AVANZADOS ====================

/**
 * @swagger
 * /gastos/reportes/periodo-comparativo/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Reporte de gastos por período con comparativo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reporte con comparativo
 */
router.get(
  '/reportes/periodo-comparativo/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res
        .status(400)
        .json({ error: 'fecha_desde y fecha_hasta son requeridos' });
    }

    try {
      const [rows] = await db.query(
        `
      SELECT
        YEAR(fecha) AS anio,
        MONTH(fecha) AS mes,
        COUNT(*) AS cantidad_gastos,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_monto,
        LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)) AS monto_mes_anterior,
        CASE
          WHEN LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha)) IS NOT NULL
          THEN ((SUM(monto) - LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) /
                LAG(SUM(monto)) OVER (ORDER BY YEAR(fecha), MONTH(fecha))) * 100
          ELSE NULL
        END AS variacion_porcentual
      FROM gasto
      WHERE comunidad_id = ?
        AND fecha BETWEEN ? AND ?
      GROUP BY YEAR(fecha), MONTH(fecha)
      ORDER BY anio DESC, mes DESC
    `,
        [comunidadId, fecha_desde, fecha_hasta]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/reportes/top-proveedores/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Top proveedores por monto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: min_compras
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top proveedores
 */
router.get(
  '/reportes/top-proveedores/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const {
      fecha_desde = '',
      fecha_hasta = '',
      min_compras = 1,
      limit = 10,
    } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      params.push(min_compras, Number(limit));

      const [rows] = await db.query(
        `
      SELECT
        p.razon_social AS proveedor,
        p.rut,
        COUNT(g.id) AS cantidad_compras,
        SUM(g.monto) AS total_comprado,
        AVG(g.monto) AS promedio_compra,
        MIN(g.fecha) AS primera_compra,
        MAX(g.fecha) AS ultima_compra,
        DATEDIFF(MAX(g.fecha), MIN(g.fecha)) AS dias_relacion
      FROM gasto g
      INNER JOIN documento_compra dc ON g.documento_compra_id = dc.id
      INNER JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.comunidad_id = ?
        ${whereFecha}
      GROUP BY p.id, p.razon_social, p.rut
      HAVING COUNT(g.id) >= ?
      ORDER BY total_comprado DESC
      LIMIT ?
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/reportes/por-dia-semana/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Análisis de gastos por día de la semana
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gastos por día de semana
 */
router.get(
  '/reportes/por-dia-semana/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [rows] = await db.query(
        `
      SELECT
        DAYOFWEEK(fecha) AS dia_semana_num,
        CASE DAYOFWEEK(fecha)
          WHEN 1 THEN 'Domingo'
          WHEN 2 THEN 'Lunes'
          WHEN 3 THEN 'Martes'
          WHEN 4 THEN 'Miércoles'
          WHEN 5 THEN 'Jueves'
          WHEN 6 THEN 'Viernes'
          WHEN 7 THEN 'Sábado'
        END AS dia_semana,
        COUNT(*) AS cantidad_gastos,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_monto
      FROM gasto
      WHERE comunidad_id = ?
        ${whereFecha}
      GROUP BY DAYOFWEEK(fecha), 
        CASE DAYOFWEEK(fecha)
          WHEN 1 THEN 'Domingo'
          WHEN 2 THEN 'Lunes'
          WHEN 3 THEN 'Martes'
          WHEN 4 THEN 'Miércoles'
          WHEN 5 THEN 'Jueves'
          WHEN 6 THEN 'Viernes'
          WHEN 7 THEN 'Sábado'
        END
      ORDER BY dia_semana_num
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// ==================== EXPORTACIÓN ====================

/**
 * @swagger
 * /gastos/exportar/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Exportación completa de gastos (Excel/CSV)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos para exportación
 */
router.get(
  '/exportar/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_desde = '', fecha_hasta = '' } = req.query;

    try {
      let whereFecha = '';
      const params = [comunidadId];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      const [rows] = await db.query(
        `
      SELECT
        g.id AS 'ID Gasto',
        c.razon_social AS 'Comunidad',
        cat.nombre AS 'Categoría',
        cat.tipo AS 'Tipo Categoría',
        cc.nombre AS 'Centro Costo',
        p.razon_social AS 'Proveedor',
        p.rut AS 'RUT Proveedor',
        dc.tipo_doc AS 'Tipo Documento',
        dc.folio AS 'Número Documento',
        DATE_FORMAT(dc.fecha_emision, '%d/%m/%Y') AS 'Fecha Documento',
        DATE_FORMAT(g.fecha, '%d/%m/%Y') AS 'Fecha Gasto',
        g.monto AS 'Monto',
        g.glosa AS 'Descripción',
        CASE WHEN g.extraordinario = 1 THEN 'Sí' ELSE 'No' END AS 'Extraordinario',
        CASE WHEN COUNT(a.id) > 0 THEN 'Sí' ELSE 'No' END AS 'Tiene Adjuntos',
        DATE_FORMAT(g.created_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(g.updated_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Actualización'
      FROM gasto g
      LEFT JOIN comunidad c ON g.comunidad_id = c.id
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
      WHERE g.comunidad_id = ?
        ${whereFecha}
      GROUP BY g.id
      ORDER BY g.fecha DESC, g.id DESC
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// ==================== DASHBOARD ====================

/**
 * @swagger
 * /gastos/dashboard/resumen-mensual/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Resumen mensual para dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: meses
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Resumen mensual
 */
router.get(
  '/dashboard/resumen-mensual/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { meses = 6 } = req.query;

    try {
      const [rows] = await db.query(
        `
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS periodo,
        COUNT(*) AS total_gastos,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_gasto,
        SUM(CASE WHEN extraordinario = 1 THEN monto ELSE 0 END) AS gastos_extraordinarios,
        SUM(CASE WHEN extraordinario = 0 THEN monto ELSE 0 END) AS gastos_operativos
      FROM gasto
      WHERE comunidad_id = ?
        AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY periodo DESC
    `,
        [comunidadId, Number(meses)]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/dashboard/top-categorias-mes/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Top categorías del mes actual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top categorías
 */
router.get(
  '/dashboard/top-categorias-mes/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);

    try {
      const [rows] = await db.query(
        `
      SELECT
        cat.nombre AS categoria,
        COUNT(g.id) AS cantidad,
        SUM(g.monto) AS total
      FROM gasto g
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      WHERE g.comunidad_id = ?
        AND YEAR(g.fecha) = YEAR(CURRENT_DATE)
        AND MONTH(g.fecha) = MONTH(CURRENT_DATE)
      GROUP BY cat.id, cat.nombre
      ORDER BY total DESC
      LIMIT 5
    `,
        [comunidadId]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/dashboard/alertas-gastos-altos/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Alertas de gastos altos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: monto_minimo
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lista de gastos altos
 */
router.get(
  '/dashboard/alertas-gastos-altos/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { monto_minimo } = req.query;

    if (!monto_minimo) {
      return res.status(400).json({ error: 'monto_minimo required' });
    }

    try {
      const [rows] = await db.query(
        `
      SELECT
        g.id,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        cat.nombre AS categoria,
        p.razon_social AS proveedor
      FROM gasto g
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.comunidad_id = ?
        AND g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        AND g.monto > ?
      ORDER BY g.monto DESC
    `,
        [comunidadId, monto_minimo]
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * GET /gastos
 * Lista gastos en modo global (superadmin) o filtrado por comunidades asignadas (otros roles).
 * Acepta mismos filtros que /comunidad/:comunidadId
 * BLOQUEADO para residente, propietario, inquilino
 */
router.get(
  '/',
  authenticate,
  authorize(
    'superadmin',
    'admin_comunidad',
    'conserje',
    'contador',
    'proveedor_servicio',
    'tesorero',
    'presidente_comite'
  ),
  async (req, res) => {
    const {
      page = 1,
      limit = 100,
      categoria = '',
      proveedor = '',
      fecha_desde = '',
      fecha_hasta = '',
      monto_min = 0,
      monto_max = 0,
      categoria_id = 0,
      centro_costo_id = 0,
      extraordinario = -1,
      comunidad_id = 0, // opcional: filtrar por comunidad si se pasa
    } = req.query;

    const offset = (page - 1) * limit;

    try {
      // Construir cláusulas WHERE dinámicas
      let whereFecha = '';
      let whereMonto = '';
      let whereComunidad = '';
      const params = [];

      if (fecha_desde && fecha_hasta) {
        whereFecha = 'AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_desde, fecha_hasta);
      }

      if (monto_min > 0 && monto_max > 0) {
        whereMonto = 'AND g.monto BETWEEN ? AND ?';
        params.push(Number(monto_min), Number(monto_max));
      }

      // Si es superadmin, ve todo; si no, filtra por comunidades asignadas
      if (req.user.is_superadmin) {
        if (comunidad_id && Number(comunidad_id) > 0) {
          whereComunidad = 'AND g.comunidad_id = ?';
          params.push(Number(comunidad_id));
        }
      } else {
        // Filtrar por comunidades asignadas EXCLUYENDO roles básicos
        whereComunidad = `AND g.comunidad_id IN (
        SELECT ucr.comunidad_id
        FROM usuario_rol_comunidad ucr
        JOIN rol_sistema r ON r.id = ucr.rol_id
        WHERE ucr.usuario_id = ? 
          AND ucr.activo = 1
          AND r.codigo NOT IN ('residente', 'propietario', 'inquilino')
      )`;
        params.push(req.user.sub || req.user.id);
      }

      params.push(
        categoria,
        categoria,
        proveedor,
        proveedor,
        categoria_id,
        categoria_id,
        centro_costo_id,
        centro_costo_id,
        extraordinario,
        extraordinario,
        Number(limit),
        Number(offset)
      );

      const [rows] = await db.query(
        `
      SELECT
        g.id,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        cat.nombre AS categoria,
        cc.nombre AS centro_costo,
        p.razon_social AS proveedor,
        dc.folio AS documento_numero,
        CASE WHEN COUNT(a.id) > 0 THEN 1 ELSE 0 END AS tiene_adjuntos,
        g.extraordinario,
        g.comunidad_id,
        g.estado,
        COALESCE(ga_count.total_aprobaciones, 0) AS current_approvals,
        g.created_at
      FROM gasto g
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      LEFT JOIN archivos a ON a.entity_type = 'gasto' AND a.entity_id = g.id AND a.is_active = 1
      LEFT JOIN (
        SELECT gasto_id, COUNT(*) AS total_aprobaciones
        FROM gasto_aprobacion
        WHERE accion = 'aprobar'
        GROUP BY gasto_id
      ) ga_count ON g.id = ga_count.gasto_id
      WHERE 1=1
        ${whereComunidad}
        ${whereFecha}
        ${whereMonto}
        AND (cat.nombre LIKE CONCAT('%', ?, '%') OR ? = '')
        AND (p.razon_social LIKE CONCAT('%', ?, '%') OR ? = '')
        AND (g.categoria_id = ? OR ? = 0)
        AND (g.centro_costo_id = ? OR ? = 0)
        AND (g.extraordinario = ? OR ? = -1)
      GROUP BY g.id
      ORDER BY g.fecha DESC, g.created_at DESC
      LIMIT ? OFFSET ?
    `,
        params
      );

      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Mantener sólo este handler (versión corregida)
router.get('/:id/aprobaciones', authenticate, async (req, res) => {
  const gastoId = Number(req.params.id);
  if (Number.isNaN(gastoId))
    return res.status(400).json({ error: 'gasto id inválido' });

  try {
    const sql = `
      SELECT
        ga.*,
        COALESCE(u.username,
         CONCAT(
           COALESCE(p.nombres, ''), ' ',
           COALESCE(p.apellidos, '')
         ),
         u.email
) AS nombre_usuario,
        rs.nombre AS rol_nombre
      FROM gasto_aprobacion ga
      LEFT JOIN usuario u ON ga.usuario_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id
      LEFT JOIN rol_sistema rs ON ga.rol_id = rs.id
      WHERE ga.gasto_id = ?
      ORDER BY ga.created_at DESC
    `;
    const [rows] = await db.query(sql, [gastoId]);
    return res.json(rows || []);
  } catch (err) {
    console.error('Error GET /gastos/:id/aprobaciones', {
      gastoId,
      message: err.message,
      sqlMessage: err.sqlMessage || null,
      stack: err.stack,
    });
    return res
      .status(500)
      .json({ error: 'Error interno al obtener aprobaciones' });
  }
});

/**
 * @swagger
 * /gastos:
 *   post:
 *     tags: [Gastos]
 *     summary: Crear nuevo gasto global (superadmin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoria_id
 *               - fecha
 *               - monto
 *             properties:
 *               comunidad_id:
 *                 type: integer
 *                 description: Opcional para superadmin; requerido para otros
 *               categoria_id:
 *                 type: integer
 *               centro_costo_id:
 *                 type: integer
 *               documento_compra_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               monto:
 *                 type: number
 *               glosa:
 *                 type: string
 *               extraordinario:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Gasto creado
 */
router.post(
  '/',
  [
    authenticate,
    authorize('superadmin'), // Solo superadmin
    body('categoria_id').isInt(),
    body('fecha').notEmpty(),
    body('monto').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      comunidad_id,
      categoria_id,
      centro_costo_id,
      documento_compra_id,
      fecha,
      monto,
      glosa,
      extraordinario,
    } = req.body;
    const comunidadId = comunidad_id || null;

    // Generar numero único (si comunidadId es null, usar 'GLOBAL')
    const numero = `GG${Date.now()}`;

    try {
      const [result] = await db.query(
        'INSERT INTO gasto (numero, comunidad_id, categoria_id, centro_costo_id, documento_compra_id, fecha, monto, glosa, extraordinario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          numero,
          comunidadId,
          categoria_id,
          centro_costo_id || null,
          documento_compra_id || null,
          fecha,
          monto,
          glosa || null,
          extraordinario ? 1 : 0,
        ]
      );

      const [row] = await db.query(
        'SELECT id, categoria_id, fecha, monto FROM gasto WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /gastos/{id}/aprobaciones:
 *   post:
 *     tags: [Gastos]
 *     summary: Crear aprobación para un gasto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accion
 *             properties:
 *               accion:
 *                 type: string
 *                 enum: [aprobar, rechazar]
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aprobación creada
 */
router.post(
  '/:id/aprobaciones',
  [
    authenticate,
    authorize(
      'admin',
      'admin_comunidad',
      'contador',
      'tesorero',
      'presidente_comite'
    ), // Roles que pueden aprobar
    body('accion').isIn(['aprobar', 'rechazar']),
    body('observaciones').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const gastoId = Number(req.params.id);
    const { accion, observaciones } = req.body;
    const usuarioId = req.user.persona_id; // 5 (referencia persona.id)

    if (Number.isNaN(gastoId))
      return res.status(400).json({ error: 'gasto id inválido' });

    try {
      // Verificar que el gasto existe y pertenece a una comunidad accesible
      const [[gasto]] = await db.query(
        'SELECT id, comunidad_id FROM gasto WHERE id = ?',
        [gastoId]
      );
      if (!gasto) return res.status(404).json({ error: 'gasto no encontrado' });

      // Obtener rol_id del rol del usuario en la comunidad del gasto
      const rolNombre =
        req.user.memberships.find((m) => m.comunidadId === gasto.comunidad_id)
          ?.rol || req.user.roles[0];
      const [[rolRow]] = await db.query(
        'SELECT id FROM rol_sistema WHERE nombre = ?',
        [rolNombre]
      );
      const rolId = rolRow?.id || 1; // Fallback a 1 si no encuentra

      // Verificar permisos por comunidad (opcional, si no lo hace authorize)
      // ... (agregar lógica si es necesario)

      // Verificar que no haya aprobación previa del mismo usuario/rol
      const [[existing]] = await db.query(
        'SELECT id FROM gasto_aprobacion WHERE gasto_id = ? AND usuario_id = ? AND rol_id = ?',
        [gastoId, usuarioId, rolId]
      );
      if (existing)
        return res
          .status(400)
          .json({ error: 'ya has aprobado/rechazado este gasto' });

      // Insertar aprobación
      const [result] = await db.query(
        'INSERT INTO gasto_aprobacion (gasto_id, usuario_id, rol_id, accion, observaciones) VALUES (?, ?, ?, ?, ?)',
        [gastoId, usuarioId, rolId, accion, observaciones || null]
      );

      // Incrementar aprobaciones_count
      await db.query(
        'UPDATE gasto SET aprobaciones_count = aprobaciones_count + 1 WHERE id = ?',
        [gastoId]
      );

      // Verificar si alcanza el límite y actualizar estado
      const [[gastoData]] = await db.query(
        'SELECT required_aprobaciones, aprobaciones_count FROM gasto WHERE id = ?',
        [gastoId]
      );
      if (gastoData.aprobaciones_count >= gastoData.required_aprobaciones) {
        await db.query(
          'UPDATE gasto SET estado = "aprobado", aprobado_por = ? WHERE id = ?',
          [usuarioId, gastoId]
        );
      }

      res
        .status(201)
        .json({ id: result.insertId, message: 'aprobación registrada' });
    } catch (err) {
      console.error('Error POST /gastos/:id/aprobaciones', err);
      res.status(500).json({ error: 'error interno al crear aprobación' });
    }
  }
);

module.exports = router;
// =========================================
// ENDPOINTS DE GASTOS
// =========================================

// // LISTADOS, FILTROS Y CRUD
// GET: /gastos/comunidad/:comunidadId
// GET: /gastos/comunidad/:comunidadId/count
// POST: /gastos/comunidad/:comunidadId
// GET: /gastos/:id
// GET: /gastos/:id/archivos
// PATCH: /gastos/:id
// DELETE: /gastos/:id

// // ESTADÍSTICAS
// GET: /gastos/estadisticas/general/:comunidadId
// GET: /gastos/estadisticas/por-categoria/:comunidadId
// GET: /gastos/estadisticas/por-centro-costo/:comunidadId
// GET: /gastos/estadisticas/por-proveedor/:comunidadId
// GET: /gastos/estadisticas/mensuales/:comunidadId
// GET: /gastos/estadisticas/extraordinarios-vs-operativos/:comunidadId

// // VALIDACIONES
// GET: /gastos/validar/existe/:id
// GET: /gastos/validar/categoria/:id
// GET: /gastos/validar/duplicado

// // LISTAS DESPLEGABLES
// GET: /gastos/listas/categorias/:comunidadId
// GET: /gastos/listas/centros-costo/:comunidadId
// GET: /gastos/listas/proveedores/:comunidadId
// GET: /gastos/listas/documentos-disponibles/:comunidadId

// // REPORTES AVANZADOS
// GET: /gastos/reportes/periodo-comparativo/:comunidadId
// GET: /gastos/reportes/top-proveedores/:comunidadId
// GET: /gastos/reportes/por-dia-semana/:comunidadId

// // EXPORTACIÓN
// GET: /gastos/exportar/:comunidadId

// // DASHBOARD
// GET: /gastos/dashboard/resumen-mensual/:comunidadId
// GET: /gastos/dashboard/top-categorias-mes/:comunidadId
// GET: /gastos/dashboard/alertas-gastos-altos/:comunidadId
