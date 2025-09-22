// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Comunidades
 *     description: Gestión de comunidades
 */

// Listar comunidades (users may view list)
router.get('/', authenticate, async (req, res) => {
  try {
    // ✅ Superadmin ve TODAS las comunidades
    if (req.user.is_superadmin) {
      const [rows] = await db.query('SELECT id, razon_social, rut, dv, direccion, email_contacto FROM comunidad LIMIT 200');
      return res.json(rows);
    }

    // ✅ Usuarios normales solo ven SUS comunidades
    const personaId = req.user.persona_id;
    if (!personaId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const [rows] = await db.query(`
      SELECT DISTINCT c.id, c.razon_social, c.rut, c.dv, c.direccion, c.email_contacto 
      FROM comunidad c
      JOIN membresia_comunidad mc ON c.id = mc.comunidad_id 
      WHERE mc.persona_id = ? AND mc.activo = 1
      ORDER BY c.razon_social
    `, [personaId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Crear comunidad: policy decisión — aquí lo dejamos a admin/superadmin (si quieres solo superadmin cambia a 'superadmin')
router.post('/', [authenticate, authorize('admin','superadmin'), body('razon_social').notEmpty(), body('rut').notEmpty(), body('dv').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto } = req.body;
  try {
    const [result] = await db.query('INSERT INTO comunidad (razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto) VALUES (?,?,?,?,?,?,?)', [razon_social, rut, dv, giro || null, direccion || null, email_contacto || null, telefono_contacto || null]);
    const [row] = await db.query('SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT id, razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto FROM comunidad WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  const fields = ['razon_social','rut','dv','giro','direccion','email_contacto','telefono_contacto','moneda','tz'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try { await db.query(`UPDATE comunidad SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1', [id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

// delete restricted to superadmin only (stronger policy)
router.delete('/:id', authenticate, authorize('superadmin'), async (req, res) => {
  const id = req.params.id;
  try { await db.query('DELETE FROM comunidad WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

module.exports = router;