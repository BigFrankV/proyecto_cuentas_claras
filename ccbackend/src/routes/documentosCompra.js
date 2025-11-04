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
 *   - name: DocumentosCompra
 *     description: Documentos de compra (facturas, boletas)
 */

/**
 * @swagger
 * /documentos-compra/comunidad/{comunidadId}:
 *   get:
 *     tags: [DocumentosCompra]
 *     summary: Listar documentos de compra por comunidad
 *     description: Obtiene una lista paginada de documentos de compra para una comunidad específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
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
 *           default: 100
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de documentos obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /documentos-compra/comunidad/{comunidadId}:
 *   post:
 *     tags: [DocumentosCompra]
 *     summary: Crear documento de compra
 *     description: Crea un nuevo documento de compra para una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proveedor_id
 *               - tipo_doc
 *               - folio
 *               - fecha_emision
 *               - total
 *             properties:
 *               proveedor_id:
 *                 type: integer
 *                 description: ID del proveedor
 *               tipo_doc:
 *                 type: string
 *                 description: Tipo de documento
 *               folio:
 *                 type: string
 *                 description: Número de folio
 *               fecha_emision:
 *                 type: string
 *                 format: date
 *                 description: Fecha de emisión
 *               neto:
 *                 type: number
 *                 default: 0
 *                 description: Monto neto
 *               iva:
 *                 type: number
 *                 default: 0
 *                 description: Monto IVA
 *               exento:
 *                 type: number
 *                 default: 0
 *                 description: Monto exento
 *               total:
 *                 type: number
 *                 description: Monto total
 *               glosa:
 *                 type: string
 *                 description: Descripción opcional
 *     responses:
 *       201:
 *         description: Documento creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /documentos-compra/{id}:
 *   get:
 *     tags: [DocumentosCompra]
 *     summary: Obtener documento de compra por ID
 *     description: Obtiene los detalles de un documento de compra específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento obtenido exitosamente
 *       404:
 *         description: Documento no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /documentos-compra/{id}:
 *   patch:
 *     tags: [DocumentosCompra]
 *     summary: Actualizar documento de compra
 *     description: Actualiza los datos de un documento de compra existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proveedor_id:
 *                 type: integer
 *               tipo_doc:
 *                 type: string
 *               folio:
 *                 type: string
 *               fecha_emision:
 *                 type: string
 *                 format: date
 *               neto:
 *                 type: number
 *               iva:
 *                 type: number
 *               exento:
 *                 type: number
 *               total:
 *                 type: number
 *               glosa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Documento no encontrado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /documentos-compra/{id}:
 *   delete:
 *     tags: [DocumentosCompra]
 *     summary: Eliminar documento de compra
 *     description: Elimina un documento de compra existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       204:
 *         description: Documento eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT id, tipo_doc, folio, fecha_emision, total FROM documento_compra WHERE comunidad_id = ? ORDER BY fecha_emision DESC LIMIT ? OFFSET ?',
      [comunidadId, Number(limit), Number(offset)]
    );
    res.json(rows);
  }
);

router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin', 'contador']),
    body('proveedor_id').isInt(),
    body('tipo_doc').notEmpty(),
    body('folio').notEmpty(),
    body('fecha_emision').notEmpty(),
    body('total').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const comunidadId = Number(req.params.comunidadId);
    const {
      proveedor_id,
      tipo_doc,
      folio,
      fecha_emision,
      neto = 0,
      iva = 0,
      exento = 0,
      total,
      glosa,
    } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO documento_compra (comunidad_id, proveedor_id, tipo_doc, folio, fecha_emision, neto, iva, exento, total, glosa) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [
          comunidadId,
          proveedor_id,
          tipo_doc,
          folio,
          fecha_emision,
          neto,
          iva,
          exento,
          total,
          glosa || null,
        ]
      );
      const [row] = await db.query(
        'SELECT id, tipo_doc, folio, fecha_emision, total FROM documento_compra WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query(
    'SELECT * FROM documento_compra WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const id = req.params.id;
    const fields = [
      'proveedor_id',
      'tipo_doc',
      'folio',
      'fecha_emision',
      'neto',
      'iva',
      'exento',
      'total',
      'glosa',
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
        `UPDATE documento_compra SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT id, tipo_doc, folio, fecha_emision, total FROM documento_compra WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    const id = req.params.id;
    try {
      await db.query('DELETE FROM documento_compra WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE DOCUMENTOS DE COMPRA
// =========================================

// // LISTADOS Y CRUD
// GET: /documentos-compra/comunidad/:comunidadId
// POST: /documentos-compra/comunidad/:comunidadId
// GET: /documentos-compra/:id
// PATCH: /documentos-compra/:id
// DELETE: /documentos-compra/:id
