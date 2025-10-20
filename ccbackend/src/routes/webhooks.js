const express = require('express');
const router = express.Router();
const db = require('../db');

// webhooks are public endpoints; do not require authenticate
/**
 * @openapi
 * /webhooks/pagos/webpay:
 *   post:
 *     tags: [Webhooks]
 *     summary: Recibir notificaciones de pago desde pasarela Webpay
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload enviado por la pasarela
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/pagos/webpay', async (req, res) => {
  const payload = req.body;
  try { await db.query('INSERT INTO webhook_pago (comunidad_id, proveedor, payload_json, procesado) VALUES (?,?,?,?)', [payload.comunidad_id || null, 'webpay', JSON.stringify(payload), 0]); res.status(200).json({ ok: true }); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.post('/pagos/khipu', async (req, res) => {
  const payload = req.body;
  try { await db.query('INSERT INTO webhook_pago (comunidad_id, proveedor, payload_json, procesado) VALUES (?,?,?,?)', [payload.comunidad_id || null, 'khipu', JSON.stringify(payload), 0]); res.status(200).json({ ok: true }); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

/**
 * @openapi
 * /webhooks/pagos/khipu:
 *   post:
 *     tags: [Webhooks]
 *     summary: Recibir notificaciones de pago desde pasarela Khipu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload enviado por la pasarela
 *     responses:
 *       200:
 *         description: OK
 */
module.exports = router;


// =========================================
// ENDPOINTS DE WEBHOOKS
// =========================================

// // PAGOS
// POST: /webhooks/pagos/webpay
// POST: /webhooks/pagos/khipu