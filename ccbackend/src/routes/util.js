const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Util]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/health', (req, res) => { res.json({ status: 'ok' }); });
/**
 * @openapi
 * /version:
 *   get:
 *     tags: [Util]
 *     summary: Obtener versión de la API
 *     responses:
 *       200:
 *         description: Version
 */
router.get('/version', (req, res) => { res.json({ version: process.env.npm_package_version || '0.0.0' }); });

// GET /util/uf?fecha=YYYY-MM-DD
router.get('/uf', async (req, res) => {
  const fecha = req.query.fecha;
  if (!fecha) return res.status(400).json({ error: 'fecha required' });
  try {
    const [rows] = await db.query('SELECT fecha, valor FROM uf_valor WHERE fecha = ? LIMIT 1', [fecha]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// GET /util/utm?fecha=YYYY-MM
router.get('/utm', async (req, res) => {
  const fecha = req.query.fecha;
  if (!fecha) return res.status(400).json({ error: 'fecha required' });
  try {
    const [rows] = await db.query("SELECT fecha, valor FROM utm_valor WHERE DATE_FORMAT(fecha, '%Y-%m') = ? LIMIT 1", [fecha]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// GET /util/validar-rut?rut=XXXXXXXX-D
router.get('/validar-rut', async (req, res) => {
  const rut = req.query.rut;
  if (!rut) return res.status(400).json({ error: 'rut required' });
  // normalize
  const parts = rut.replace(/\./g,'').split('-');
  if (parts.length !== 2) return res.json({ valid: false });
  const num = parts[0]; const dv = parts[1].toLowerCase();
  // compute dv
  let M=0,S=1; for (let i=num.length-1;i>=0;i--){ S=(S+Number(num[i])*(9-M++%6))%11; }
  const dvCalc = S?String(S-1):'k';
  res.json({ valid: dv === dvCalc, dv: dvCalc });
});

module.exports = router;
