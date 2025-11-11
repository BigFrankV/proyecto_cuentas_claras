const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy'); // Agrega si no está

/**
 * @swagger
 * /compras:
 *   get:
 *     tags: [Compras]
 *     summary: Listar compras con filtros y paginación
 *     description: Obtiene una lista de compras con filtros opcionales por búsqueda, tipo de documento, fechas, etc.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda en folio o nombre de proveedor
 *       - in: query
 *         name: tipo_doc
 *         schema:
 *           type: string
 *         description: Tipo de documento
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *         description: ID de comunidad (solo para superadmin)
 *     responses:
 *       200:
 *         description: Lista de compras obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Datos de la compra desde vista_compras
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de registros
 *                     page:
 *                       type: integer
 *                       description: Página actual
 *                     limit:
 *                       type: integer
 *                       description: Registros por página
 *                     pages:
 *                       type: integer
 *                       description: Total de páginas
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      tipo_doc,
      fecha_desde,
      fecha_hasta,
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let where = ' WHERE 1=1 ';

    if (search) {
      where += ' AND (vc.folio LIKE ? OR vc.proveedor_nombre LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tipo_doc) {
      where += ' AND vc.tipo_doc = ?';
      params.push(tipo_doc);
    }
    if (fecha_desde) {
      where += ' AND vc.fecha_emision >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      where += ' AND vc.fecha_emision <= ?';
      params.push(fecha_hasta);
    }

    if (!req.user?.is_superadmin) {
      const [comRows] = await db.query(
        `SELECT comunidad_id FROM usuario_miembro_comunidad
         WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
        [req.user.persona_id]
      );
      const comunidadIds = comRows.map((r) => r.comunidad_id);
      if (!comunidadIds.length) {
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
      where += ` AND vc.comunidad_id IN (${comunidadIds
        .map(() => '?')
        .join(',')})`;
      params.push(...comunidadIds);
    } else if (req.query.comunidad_id) {
      where += ' AND vc.comunidad_id = ?';
      params.push(Number(req.query.comunidad_id));
    }

    const query = `
      SELECT vc.*
      FROM vista_compras vc
      ${where}
      ORDER BY vc.fecha_emision DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);

    const countParams = params.slice(0, params.length - 2);
    const countQuery = `SELECT COUNT(*) AS total FROM vista_compras vc ${where}`;
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
    console.error('Error GET /compras:', err);
    res.status(500).json({ error: 'Error al listar compras' });
  }
});

// =========================================
// CRUD OPERATIONS - POST/PATCH/DELETE
// =========================================

/**
 * @swagger
 * /compras:
 *   post:
 *     tags: [Compras]
 *     summary: Crear nueva compra
 *     description: Registra una nueva compra/gasto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [folio, fecha_emision, monto, tipo_doc, proveedor_id, comunidad_id]
 *             properties:
 *               folio:
 *                 type: string
 *               fecha_emision:
 *                 type: string
 *                 format: date
 *               monto:
 *                 type: number
 *               tipo_doc:
 *                 type: string
 *               proveedor_id:
 *                 type: integer
 *               comunidad_id:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compra creada exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error servidor
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin', 'admin_comunidad', 'administrador']),
    body('folio').notEmpty().withMessage('folio requerido').trim(),
    body('fecha_emision')
      .isISO8601()
      .withMessage('fecha_emision debe ser fecha válida')
      .toDate(),
    body('monto')
      .isFloat({ min: 0 })
      .withMessage('monto debe ser número positivo'),  // Cambia a total
    body('tipo_doc').notEmpty().withMessage('tipo_doc requerido').trim(),
    body('proveedor_id')
      .isInt({ min: 1 })
      .withMessage('proveedor_id requerido'),
    body('descripcion').optional().trim(),  // Cambia a glosa
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidad_id = req.params.comunidadId;
      const { folio, fecha_emision, monto, tipo_doc, proveedor_id, descripcion } = req.body;


      // Calcular IVA (19% en Chile)
      const total = parseFloat(monto);
      const neto = total / 1.19;
      const iva = neto * 0.19;
      const exento = 0;

      // Verificar proveedor
      const [proveedor] = await db.query('SELECT id FROM proveedor WHERE id = ?', [proveedor_id]);
      if (!proveedor.length) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }

      // Verificar comunidad
      const [comunidad] = await db.query('SELECT id FROM comunidad WHERE id = ?', [comunidad_id]);
      if (!comunidad.length) {
        return res.status(404).json({ error: 'Comunidad no encontrada' });
      }

      // Insertar con columnas correctas
      const [result] = await db.query(
        `INSERT INTO documento_compra (folio, fecha_emision, neto, iva, exento, total, tipo_doc, proveedor_id, comunidad_id, glosa)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [folio, fecha_emision, neto, iva, exento, total, tipo_doc, proveedor_id, comunidad_id, descripcion || null]
      );

      // Obtener la compra creada
      const [compra] = await db.query('SELECT * FROM documento_compra WHERE id = ?', [
        result.insertId,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address)
         VALUES (?, 'INSERT', 'documento_compra', ?, ?, ?)`,
        [req.user.id, result.insertId, JSON.stringify(compra[0]), req.ip]
      );

      res.status(201).json(compra[0]);
    } catch (err) {
      console.error('Error al crear compra:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Compra ya existe' });
      }
      res.status(500).json({ error: 'Error al crear compra' });
    }
  }
);

/**
 * @swagger
 * /compras/{id}:
 *   patch:
 *     tags: [Compras]
 *     summary: Actualizar compra existente
 *     description: Actualiza los datos de una compra
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folio:
 *                 type: string
 *               fecha_emision:
 *                 type: string
 *                 format: date
 *               monto:
 *                 type: number
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compra actualizada exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Compra no encontrada
 *       500:
 *         description: Error servidor
 */
router.patch(
  '/:id',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'administrador'),
    body('folio').optional().trim(),
    body('fecha_emision')
      .optional()
      .isISO8601()
      .withMessage('fecha_emision debe ser fecha válida')
      .toDate(),
    body('monto')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('monto debe ser número positivo'),
    body('descripcion').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const compra_id = Number(req.params.id);

      // Obtener compra anterior
      const [compra_anterior] = await db.query('SELECT * FROM documento_compra WHERE id = ?', [
        compra_id,
      ]);
      if (!compra_anterior.length) {
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.folio !== undefined) {
        campos.push('folio = ?');
        valores.push(req.body.folio);
      }
      if (req.body.fecha_emision !== undefined) {
        campos.push('fecha_emision = ?');
        valores.push(req.body.fecha_emision);
      }
      if (req.body.monto !== undefined) {
        const total = parseFloat(req.body.monto);
        const neto = total / 1.19;
        const iva = neto * 0.19;
        const exento = 0;
        campos.push('neto = ?, iva = ?, exento = ?, total = ?');
        valores.push(neto, iva, exento, total);
      }
      if (req.body.descripcion !== undefined) {
        campos.push('glosa = ?');
        valores.push(req.body.descripcion || null);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(compra_id);

      // Ejecutar actualización
      await db.query(
        `UPDATE documento_compra SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener compra actualizada
      const [compra_actualizada] = await db.query('SELECT * FROM documento_compra WHERE id = ?', [
        compra_id,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'documento_compra', ?, ?, ?, ?)`,
        [
          req.user.id,
          compra_id,
          JSON.stringify(compra_anterior[0]),
          JSON.stringify(compra_actualizada[0]),
          req.ip,
        ]
      );

      res.json(compra_actualizada[0]);
    } catch (err) {
      console.error('Error al actualizar compra:', err);
      res.status(500).json({ error: 'Error al actualizar compra' });
    }
  }
);

/**
 * @swagger
 * /compras/{id}:
 *   delete:
 *     tags: [Compras]
 *     summary: Eliminar compra
 *     description: Marca una compra como inactiva (soft delete)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compra eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Compra no encontrada
 *       500:
 *         description: Error servidor
 */
router.delete(
  '/:id',
  [authenticate, authorize('superadmin', 'admin_comunidad', 'administrador')],
  async (req, res) => {
    try {
      const compra_id = Number(req.params.id);

      // Obtener compra anterior
      const [compra] = await db.query('SELECT * FROM documento_compra WHERE id = ?', [compra_id]);
      if (!compra.length) {
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      // Hard delete
      await db.query('DELETE FROM documento_compra WHERE id = ?', [compra_id]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address)
         VALUES (?, 'DELETE', 'documento_compra', ?, ?, ?)`,
        [req.user.id, compra_id, JSON.stringify(compra[0]), req.ip]
      );

      res.status(200).json({ message: 'Compra eliminada exitosamente' });
    } catch (err) {
      console.error('Error al eliminar compra:', err);
      res.status(500).json({ error: 'Error al eliminar compra' });
    }
  }
);

/**
 * @swagger
 * /compras/{id}:
 *   get:
 *     tags: [Compras]
 *     summary: Obtener detalles de una compra
 *     description: Obtiene los detalles de una compra específica
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la compra
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Compra no encontrada
 *       500:
 *         description: Error servidor
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const compra_id = Number(req.params.id);

    // Obtener compra desde vista_compras
    const [compra] = await db.query('SELECT * FROM vista_compras WHERE id = ?', [compra_id]);
    if (!compra.length) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    // Verificar acceso por comunidad si no es superadmin
    if (!req.user?.is_superadmin) {
      const [comRows] = await db.query(
        `SELECT comunidad_id FROM usuario_miembro_comunidad
         WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
        [req.user.persona_id]
      );
      const comunidadIds = comRows.map((r) => r.comunidad_id);
      if (!comunidadIds.includes(compra[0].comunidad_id)) {
        return res.status(403).json({ error: 'No tienes acceso a esta compra' });
      }
    }

    res.json(compra[0]);
  } catch (err) {
    console.error('Error GET /compras/:id:', err);
    res.status(500).json({ error: 'Error al obtener compra' });
  }
});

module.exports = router;

