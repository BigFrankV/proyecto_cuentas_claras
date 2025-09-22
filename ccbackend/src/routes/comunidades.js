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
  try {
    const id = req.params.id;
    
    const query = `
      SELECT 
          c.id,
          c.razon_social as nombre,
          c.rut,
          c.dv,
          c.giro,
          c.direccion,
          c.email_contacto as email,
          c.telefono_contacto as telefono,
          c.moneda,
          c.tz as zona_horaria,
          c.politica_mora_json,
          c.created_at as fechaCreacion,
          c.updated_at as fechaActualizacion,
          
          -- Contador de unidades
          (SELECT COUNT(*) 
           FROM unidad u 
           WHERE u.comunidad_id = c.id) as totalUnidades,
           
          (SELECT COUNT(*) 
           FROM unidad u 
           WHERE u.comunidad_id = c.id AND u.activa = 1) as unidadesActivas,
           
          -- Contador de residentes activos
          (SELECT COUNT(DISTINCT mc.persona_id) 
           FROM membresia_comunidad mc 
           WHERE mc.comunidad_id = c.id 
           AND mc.activo = 1 
           AND mc.rol IN ('residente', 'propietario')) as totalResidentes,
           
          -- Contador de edificios
          (SELECT COUNT(*) 
           FROM edificio e 
           WHERE e.comunidad_id = c.id) as totalEdificios,
           
          -- Contador de amenidades
          (SELECT COUNT(*) 
           FROM amenidad a 
           WHERE a.comunidad_id = c.id) as totalAmenidades,
           
          -- Saldo pendiente
          (SELECT COALESCE(SUM(cu.saldo), 0) 
           FROM cargo_unidad cu 
           WHERE cu.comunidad_id = c.id 
           AND cu.estado IN ('pendiente', 'parcial')) as saldoPendiente

      FROM comunidad c
      WHERE c.id = ?`;
    
    const [rows] = await db.query(query, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Comunidad no encontrada' });
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching community:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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

