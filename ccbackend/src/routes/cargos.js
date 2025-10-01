// ...existing code...
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
 *   - name: Cargos
 *     description: |
 *       Gestión de cuentas de cobro por unidad (anteriormente "cargos").
 *       
 *       **Cambio de nomenclatura**: La tabla `cargo_unidad` ahora se llama `cuenta_cobro_unidad`.
 *       Representa los montos totales a cobrar a cada unidad por período (gastos comunes, multas, consumos, etc.).
 */

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Cargos]
 *     summary: Listar cuentas de cobro de una comunidad
 *     description: |
 *       Obtiene las cuentas de cobro (cargos) de una comunidad con filtros opcionales.
 *       Cualquier miembro de la comunidad puede consultar esta información.
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
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, pagado, vencido, parcial]
 *         description: Filtrar por estado de la cuenta
 *       - in: query
 *         name: unidad
 *         schema:
 *           type: integer
 *         description: ID de unidad específica
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *         description: Filtrar por período (formato YYYY-MM)
 *         example: "2024-03"
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
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de cuentas de cobro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   unidad_id:
 *                     type: integer
 *                   monto_total:
 *                     type: number
 *                     format: decimal
 *                   saldo:
 *                     type: number
 *                     format: decimal
 *                   estado:
 *                     type: string
 *                     enum: [pendiente, pagado, vencido, parcial]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

// list cargos by comunidad with filters (members)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { estado, unidad, periodo, page=1, limit=100 } = req.query;
  const offset = (page-1)*limit;
  const conditions = ['comunidad_id = ?']; const params = [comunidadId];
  if (estado) { conditions.push('estado = ?'); params.push(estado); }
  if (unidad) { conditions.push('unidad_id = ?'); params.push(unidad); }
  if (periodo) { conditions.push("DATE_FORMAT(created_at, '%Y-%m') = ?"); params.push(periodo); }
  // Actualizado: cargo_unidad → cuenta_cobro_unidad
  const sql = `SELECT id, unidad_id, monto_total, saldo, estado FROM cuenta_cobro_unidad WHERE ${conditions.join(' AND ')} ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

/**
 * @swagger
 * /cargos/{id}:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener detalle de una cuenta de cobro
 *     description: Retorna toda la información de una cuenta de cobro específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta de cobro
 *     responses:
 *       200:
 *         description: Detalle de la cuenta de cobro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 unidad_id:
 *                   type: integer
 *                 comunidad_id:
 *                   type: integer
 *                 monto_total:
 *                   type: number
 *                 saldo:
 *                   type: number
 *                 estado:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Cuenta de cobro no encontrada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM cuenta_cobro_unidad WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

/**
 * @swagger
 * /cargos/unidad/{id}:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener historial de cuentas de cobro de una unidad
 *     description: |
 *       Retorna las últimas 500 cuentas de cobro de una unidad específica, ordenadas por fecha (más recientes primero).
 *       Útil para ver el historial de cobros de un departamento o casa.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la unidad
 *     responses:
 *       200:
 *         description: Lista de cuentas de cobro de la unidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   monto_total:
 *                     type: number
 *                   saldo:
 *                     type: number
 *                   estado:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/unidad/:id', authenticate, async (req, res) => { const unidadId = req.params.id; const [rows] = await db.query('SELECT id, monto_total, saldo, estado FROM cuenta_cobro_unidad WHERE unidad_id = ? ORDER BY created_at DESC LIMIT 500', [unidadId]); res.json(rows); });

router.post('/:id/recalcular-interes', authenticate, authorize('admin','superadmin'), async (req, res) => { res.json({ ok: true, note: 'stub: recalculate interest' }); });

router.post('/:id/notificar', authenticate, authorize('admin','superadmin'), async (req, res) => { res.json({ ok: true, note: 'stub: notify about charge' }); });

module.exports = router;