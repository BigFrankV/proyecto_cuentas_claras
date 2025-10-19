const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, param, query, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const MultasPermissions = require('../middleware/multasPermissions');

// Helper: obtener comunidades del usuario (copiar lógica de multas.js)
async function obtenerComunidadesUsuario(userId, personaId, isSuperAdmin) {
  try {
    if (isSuperAdmin) {
      const [comunidades] = await db.query('SELECT id FROM comunidad WHERE activo = 1');
      return comunidades.map(c => c.id);
    }
    const [memberships] = await db.query(`
      SELECT DISTINCT comunidad_id 
      FROM usuario_rol_comunidad 
      WHERE usuario_id = ? AND activo = 1
    `, [userId]);
    return memberships.map(m => m.comunidad_id);
  } catch (error) {
    console.error('Error obteniendo comunidades del usuario:', error);
    return [];
  }
}

// GET /apelaciones - listar apelaciones (global)
router.get('/',
  authenticate,
  MultasPermissions.canView,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('estado').optional().isIn(['pendiente','resuelta','rechazada'])
  ],
  async (req, res) => {
    try {
      const { page = 1, limit = 50, estado, search } = req.query;
      const offset = (page - 1) * limit;
      const params = [];
      let where = ' WHERE 1=1 ';

      // si usuario solo ve sus propias multas/apelaciones
      if (req.viewOnlyOwn && req.user.persona_id) {
        where += ' AND a.persona_id = ? ';
        params.push(req.user.persona_id);
      } else if (!req.user?.is_superadmin) {
        const comunidadIds = await obtenerComunidadesUsuario(req.user.sub, req.user.persona_id, req.user.is_superadmin);
        if (comunidadIds.length === 0) {
          return res.status(403).json({ success: false, error: 'Sin permisos (sin comunidades)' });
        }
        const placeholders = comunidadIds.map(() => '?').join(',');
        where += ` AND m.comunidad_id IN (${placeholders}) `;
        params.push(...comunidadIds);
      }

      if (estado) {
        where += ' AND a.estado = ? ';
        params.push(estado);
      }

      if (search) {
        where += ' AND (a.motivo_apelacion LIKE ? OR m.numero LIKE ? OR m.motivo LIKE ?) ';
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      const countSql = `
        SELECT COUNT(*) as total
        FROM multa_apelacion a
        INNER JOIN multa m ON a.multa_id = m.id
        ${where}
      `;
      const [countRows] = await db.query(countSql, params);
      const total = countRows[0].total || 0;

      const sql = `
        SELECT 
          a.*,
          m.numero as multa_numero,
          m.comunidad_id,
          m.motivo as multa_motivo,
          CONCAT(p.nombres, ' ', p.apellidos) as apelante_nombre
        FROM multa_apelacion a
        INNER JOIN multa m ON a.multa_id = m.id
        LEFT JOIN persona p ON a.persona_id = p.id
        ${where}
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(parseInt(limit), parseInt(offset));
      const [rows] = await db.query(sql, params);

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      console.error('Error GET /apelaciones:', err);
      res.status(500).json({ success: false, error: 'Error del servidor', message: err.message });
    }
  }
);

// GET /apelaciones/:id - detalle de apelación
router.get('/:id',
  authenticate,
  MultasPermissions.canView,
  param('id').notEmpty(),
  async (req, res) => {
    try {
      const id = req.params.id;
      const [rows] = await db.query(`
        SELECT a.*, m.numero as multa_numero, m.comunidad_id, CONCAT(p.nombres,' ',p.apellidos) as apelante_nombre
        FROM multa_apelacion a
        INNER JOIN multa m ON a.multa_id = m.id
        LEFT JOIN persona p ON a.persona_id = p.id
        WHERE a.id = ? LIMIT 1
      `, [id]);
      if (!rows.length) return res.status(404).json({ success: false, error: 'Apelación no encontrada' });
      return res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error('Error GET /apelaciones/:id', err);
      res.status(500).json({ success: false, error: 'Error del servidor' });
    }
  }
);

// POST /apelaciones - crear apelación (body: multa_id, motivo, documentos_json opt)
router.post('/',
  authenticate,
  MultasPermissions.canApelar,
  [
    body('multa_id').notEmpty(),
    body('motivo').notEmpty().isLength({ min: 20 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Validación fallida', details: errors.array() });

    try {
      const { multa_id, motivo, documentos_json } = req.body;
      // resolver id si viene como numero
      const [mRows] = await db.query('SELECT * FROM multa WHERE id = ? LIMIT 1', [multa_id]);
      if (!mRows.length) return res.status(404).json({ success: false, error: 'Multa no encontrada' });
      const multa = mRows[0];

      if (multa.estado === 'pagado' || multa.estado === 'anulada') {
        return res.status(400).json({ success: false, error: 'No se puede apelar esta multa' });
      }

      const [existing] = await db.query("SELECT id FROM multa_apelacion WHERE multa_id = ? AND estado = 'pendiente'", [multa.id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, error: 'Ya existe apelación pendiente' });
      }

      const [result] = await db.query(`
        INSERT INTO multa_apelacion (multa_id, usuario_id, persona_id, comunidad_id, motivo_apelacion, documentos_json, estado)
        VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
      `, [
        multa.id,
        req.user.sub,
        multa.persona_id || null,
        multa.comunidad_id || null,
        motivo,
        documentos_json ? JSON.stringify(documentos_json) : null
      ]);

      await db.query("UPDATE multa SET estado = 'apelada' WHERE id = ?", [multa.id]);

      res.status(201).json({ success: true, data: { id: result.insertId }, message: 'Apelación creada' });
    } catch (err) {
      console.error('Error POST /apelaciones', err);
      res.status(500).json({ success: false, error: 'Error del servidor' });
    }
  }
);

module.exports = router;