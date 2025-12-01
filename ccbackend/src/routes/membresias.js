/* Consolidated and authoritative membresias routes
   This file contains a single, consistent implementation for CRUD over
   usuario_miembro_comunidad and applies community-aware authorization
   to all state-changing endpoints. */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

// Middleware: requiere superadmin o admin en la comunidad objetivo
async function authorizeMembresiaByCommunity(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.is_superadmin) return next();

    const comunidadId = Number(
      req.body.comunidad_id || req.query.comunidad_id || req.params.comunidadId
    );
    if (!comunidadId)
      return res.status(400).json({ error: 'comunidad_id requerido' });

    const memberships = req.user.memberships || [];
    const isAdmin = memberships.some(
      (m) =>
        Number(m.comunidad_id || m.comunidadId) === comunidadId &&
        ['admin', 'admin_comunidad'].includes(m.rol)
    );
    if (!isAdmin)
      return res.status(403).json({
        error:
          'Acceso denegado. Solo administradores de la comunidad pueden realizar esta acción.',
      });
    next();
  } catch (err) {
    console.error('authorizeMembresiaByCommunity error', err);
    res.status(500).json({ error: 'server error' });
  }
}

// Middleware: verifica acceso sobre una membresía existente (por id)
async function authorizeMembresiaById(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'unauthorized' });
    if (req.user.is_superadmin) return next();

    const membresiaId = Number(req.params.id);
    if (!membresiaId) return res.status(400).json({ error: 'id inválido' });

    const [rows] = await db.query(
      'SELECT * FROM usuario_rol_comunidad WHERE id = ? LIMIT 1',
      [membresiaId]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Membresía no encontrada' });
    const membresia = rows[0];

    // permitir si el solicitante es el usuario afectado (self)
    if (req.user.id && Number(req.user.id) === Number(membresia.usuario_id)) {
      req.membresia = membresia;
      return next();
    }

    const memberships = req.user.memberships || [];
    const isAdmin = memberships.some(
      (m) =>
        Number(m.comunidad_id || m.comunidadId) ===
          Number(membresia.comunidad_id) &&
        ['admin', 'admin_comunidad'].includes(m.rol)
    );
    if (!isAdmin)
      return res.status(403).json({
        error:
          'Acceso denegado. Solo administradores de la comunidad pueden gestionar esta membresía.',
      });

    req.membresia = membresia;
    next();
  } catch (err) {
    console.error('authorizeMembresiaById error', err);
    res.status(500).json({ error: 'server error' });
  }
}

// GET / - listar membresías
router.get('/', authenticate, async (req, res) => {
  const {
    comunidad_id,
    usuario_id,
    rol_id,
    activo,
    limit = 20,
    offset = 0,
  } = req.query;
  try {
    // Logs de depuración para investigar 500
    console.log('[MEMBRESIAS] req.user:', req.user);
    console.log('[MEMBRESIAS] query:', req.query);
    const isSuperadmin = req.user?.is_superadmin;
    const personaId = req.user?.persona_id;

    if (isSuperadmin) {
      const params = [];
      let q = `SELECT umc.*, u.username, CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo, p.nombres AS nombres, p.apellidos AS apellidos, c.razon_social AS comunidad_nombre, r.nombre AS rol_nombre, r.codigo AS rol_codigo FROM usuario_rol_comunidad umc JOIN usuario u ON umc.usuario_id = u.id JOIN persona p ON u.persona_id = p.id JOIN comunidad c ON umc.comunidad_id = c.id JOIN rol_sistema r ON umc.rol_id = r.id WHERE 1=1`;
      if (comunidad_id) {
        q += ' AND umc.comunidad_id = ?';
        params.push(Number(comunidad_id));
      }
      if (usuario_id) {
        q += ' AND umc.usuario_id = ?';
        params.push(Number(usuario_id));
      }
      if (rol_id) {
        q += ' AND umc.rol_id = ?';
        params.push(Number(rol_id));
      }
      if (activo !== undefined) {
        q += ' AND umc.activo = ?';
        params.push(activo === 'true' ? 1 : 0);
      }
      q += ' ORDER BY umc.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
      const [rows] = await db.query(q, params);
      const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total FROM usuario_rol_comunidad umc WHERE 1=1${comunidad_id ? ' AND umc.comunidad_id = ?' : ''}`,
        comunidad_id ? [Number(comunidad_id)] : []
      );
      return res.json({
        data: rows,
        meta: {
          total: total || rows.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    }

    if (!personaId) return res.status(403).json({ error: 'forbidden' });
    const [rolRows] = await db.query(
      'SELECT comunidad_id, rol FROM usuario_miembro_comunidad WHERE persona_id = ? AND activo = 1',
      [personaId]
    );
    const comunidadesAdmin = rolRows
      .filter((r) => ['admin', 'admin_comunidad'].includes(r.rol))
      .map((r) => r.comunidad_id);
    if (!comunidadesAdmin.length)
      return res.status(403).json({
        error:
          'Acceso denegado. Solo administradores pueden gestionar membresías.',
      });

    const params = [...comunidadesAdmin];
    let q = `SELECT umc.*, u.username, p.nombres, p.apellidos, c.razon_social AS comunidad_nombre, r.nombre AS rol_nombre FROM usuario_rol_comunidad umc JOIN usuario u ON umc.usuario_id = u.id JOIN persona p ON u.persona_id = p.id JOIN comunidad c ON umc.comunidad_id = c.id JOIN rol_sistema r ON umc.rol_id = r.id WHERE umc.comunidad_id IN (${comunidadesAdmin.map(() => '?').join(',')})`;
    if (comunidad_id) {
      q += ' AND umc.comunidad_id = ?';
      params.push(Number(comunidad_id));
    }
    if (usuario_id) {
      q += ' AND umc.usuario_id = ?';
      params.push(Number(usuario_id));
    }
    if (rol_id) {
      q += ' AND umc.rol_id = ?';
      params.push(Number(rol_id));
    }
    if (activo !== undefined) {
      q += ' AND umc.activo = ?';
      params.push(activo === 'true' ? 1 : 0);
    }
    q += ' ORDER BY umc.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(q, params);

    const countParams = [...comunidadesAdmin];
    let countQ = `SELECT COUNT(*) as total FROM usuario_rol_comunidad umc WHERE umc.comunidad_id IN (${comunidadesAdmin.map(() => '?').join(',')})`;
    if (comunidad_id) {
      countQ += ' AND umc.comunidad_id = ?';
      countParams.push(Number(comunidad_id));
    }
    const [[{ total }]] = await db.query(countQ, countParams);

    res.json({
      data: rows,
      meta: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (err) {
    console.error('Error en GET /membresias:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Crear membresía
router.post(
  '/',
  [
    authenticate,
    authorizeMembresiaByCommunity,
    body('usuario_id').isInt({ min: 1 }).withMessage('usuario_id requerido'),
    body('comunidad_id')
      .isInt({ min: 1 })
      .withMessage('comunidad_id requerido'),
    body('rol_id').isInt({ min: 1 }).withMessage('rol_id requerido'),
    body('desde').optional().isISO8601().toDate(),
    body('hasta').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { usuario_id, comunidad_id, rol_id, desde, hasta } = req.body;

      const [usuario] = await db.query('SELECT id FROM usuario WHERE id = ?', [
        usuario_id,
      ]);
      if (!usuario.length)
        return res.status(404).json({ error: 'Usuario no encontrado' });

      const [comunidad] = await db.query(
        'SELECT id FROM comunidad WHERE id = ?',
        [comunidad_id]
      );
      if (!comunidad.length)
        return res.status(404).json({ error: 'Comunidad no encontrada' });

      const [rol] = await db.query('SELECT id FROM rol_sistema WHERE id = ?', [
        rol_id,
      ]);
      if (!rol.length)
        return res.status(404).json({ error: 'Rol no encontrado' });

      const [duplicate] = await db.query(
        'SELECT id FROM usuario_rol_comunidad WHERE usuario_id = ? AND comunidad_id = ? AND activo = 1',
        [usuario_id, comunidad_id]
      );
      if (duplicate.length)
        return res.status(409).json({
          error: 'El usuario ya tiene membresía activa en esta comunidad',
        });

      const [result] = await db.query(
        `INSERT INTO usuario_rol_comunidad (usuario_id, comunidad_id, rol_id, desde, hasta, activo) VALUES (?, ?, ?, ?, ?, 1)`,
        [
          usuario_id,
          comunidad_id,
          rol_id,
          desde || new Date().toISOString().slice(0, 10),
          hasta || null,
        ]
      );

      const [membresia] = await db.query(
        `SELECT umc.*, u.username, CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo, p.nombres AS nombres, p.apellidos AS apellidos, c.razon_social AS comunidad_nombre, r.nombre AS rol_nombre, r.codigo AS rol_codigo FROM usuario_rol_comunidad umc JOIN usuario u ON umc.usuario_id = u.id JOIN persona p ON u.persona_id = p.id JOIN comunidad c ON umc.comunidad_id = c.id JOIN rol_sistema r ON umc.rol_id = r.id WHERE umc.id = ?`,
        [result.insertId]
      );

      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address) VALUES (?, 'INSERT', 'usuario_rol_comunidad', ?, ?, ?)`,
        [
          req.user.id,
          result.insertId,
          JSON.stringify(membresia[0] || {}),
          req.ip,
        ]
      );

      res.status(201).json(membresia[0]);
    } catch (err) {
      console.error('Error al crear membresía:', err);
      res.status(500).json({ error: 'Error al crear membresía' });
    }
  }
);

// Obtener membresía por id
router.get('/:id', authenticate, authorizeMembresiaById, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query(
      `SELECT umc.*, u.username, CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo, p.nombres AS nombres, p.apellidos AS apellidos, c.razon_social AS comunidad_nombre, r.nombre AS rol_nombre, r.codigo AS rol_codigo FROM usuario_rol_comunidad umc JOIN usuario u ON umc.usuario_id = u.id JOIN persona p ON u.persona_id = p.id JOIN comunidad c ON umc.comunidad_id = c.id JOIN rol_sistema r ON umc.rol_id = r.id WHERE umc.id = ?`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Membresía no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Actualizar membresía
router.patch(
  '/:id',
  [
    authenticate,
    authorizeMembresiaById,
    body('rol_id').optional().isInt({ min: 1 }),
    body('hasta').optional().isISO8601().toDate(),
    body('activo').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const id = Number(req.params.id);
      const fields = [];
      const values = [];
      if (req.body.rol_id !== undefined) {
        fields.push('rol_id = ?');
        values.push(req.body.rol_id);
      }
      if (req.body.hasta !== undefined) {
        fields.push('hasta = ?');
        values.push(req.body.hasta || null);
      }
      if (req.body.activo !== undefined) {
        fields.push('activo = ?');
        values.push(req.body.activo ? 1 : 0);
      }
      if (!fields.length)
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      values.push(id);

      await db.query(
        `UPDATE usuario_rol_comunidad SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM usuario_rol_comunidad WHERE id = ?',
        [id]
      );
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address) VALUES (?, 'UPDATE', 'usuario_rol_comunidad', ?, ?, ?)`,
        [req.user.id, id, JSON.stringify(rows[0] || {}), req.ip]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Eliminar membresía (soft delete)
router.delete(
  '/:id',
  authenticate,
  authorizeMembresiaById,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.query(
        'SELECT * FROM usuario_rol_comunidad WHERE id = ?',
        [id]
      );
      if (!rows.length)
        return res.status(404).json({ error: 'Membresía no encontrada' });

      await db.query(
        'UPDATE usuario_rol_comunidad SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address) VALUES (?, 'DELETE', 'usuario_rol_comunidad', ?, ?, ?)`,
        [req.user.id, id, JSON.stringify(rows[0] || {}), req.ip]
      );

      res.status(200).json({ message: 'Membresía eliminada exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar membresía' });
    }
  }
);

// Catálogos
router.get('/catalogos/planes', authenticate, async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, codigo, nombre, nivel_acceso FROM rol_sistema ORDER BY nivel_acceso'
  );
  res.json(rows);
});

router.get('/catalogos/estados', authenticate, async (req, res) => {
  res.json(['activo', 'inactivo']);
});

// Catálogo: roles (rol_sistema)
router.get('/catalogos/roles', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, codigo, nombre, nivel_acceso FROM rol_sistema ORDER BY nivel_acceso'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener catálogo de roles:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Catálogo: comunidades (para filtros en UI)
router.get('/catalogos/comunidades', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, razon_social FROM comunidad WHERE activo = 1 ORDER BY razon_social'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener catálogo de comunidades:', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
