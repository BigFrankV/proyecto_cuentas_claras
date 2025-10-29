const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize'); // <-- añadir import

/**
 * @swagger
 * tags:
 *   - name: Medidores
 *     description: Gestión de medidores, lecturas y consumos
 */

/**
 * Helper: verifica existencia y tenancy / permisos básicos
 * Retorna: { exists, allowed, comunidadId, activo }
 */
async function medidorAccessCheck(user, medidorId) {
  try {
    const [mrows] = await db.query('SELECT comunidad_id, activo FROM medidor WHERE id = ? LIMIT 1', [medidorId]);
    if (!mrows.length) return { exists: false };
    const comunidadId = mrows[0].comunidad_id;
    const activo = mrows[0].activo;

    // DEBUG: log user info to help tracking permisos
    console.log('medidorAccessCheck user debug:', { userId: user?.id, persona_id: user?.persona_id, is_superadmin: user?.is_superadmin });

    if (user?.is_superadmin) return { exists: true, allowed: true, comunidadId, activo };
    const [chk] = await db.query(
      'SELECT 1 FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ? AND activo = 1 LIMIT 1',
      [user.persona_id, comunidadId]
    );
    return { exists: true, allowed: !!chk.length, comunidadId, activo };
  } catch (err) {
    console.error('medidorAccessCheck error:', err);
    return { exists: false };
  }
}

/**
 * GET /api/medidores/comunidad/:comunidadId
 * Lista desde vista_medidores con paginación y filtros básicos
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Number(req.query.limit || 20));
    const offset = typeof req.query.offset !== 'undefined' ? Number(req.query.offset) : (page - 1) * limit;
    const { search, tipo, unidad_id } = req.query;

    // tenancy check: si no es superadmin validar pertenencia
    if (!req.user?.is_superadmin) {
      const [check] = await db.query(
        'SELECT 1 FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ? AND activo = 1 LIMIT 1',
        [req.user.persona_id, comunidadId]
      );
      if (!check.length) return res.json({ data: [], pagination: { total: 0, limit, offset, pages: 0 } });
    }

    let where = ' WHERE comunidad_id = ? ';
    const params = [comunidadId];
    if (search) {
      where += ' AND (medidor_codigo LIKE ? OR serial_number LIKE ? OR marca LIKE ? OR modelo LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (tipo) {
      where += ' AND tipo = ? ';
      params.push(tipo);
    }
    if (unidad_id) {
      where += ' AND unidad_id = ? ';
      params.push(Number(unidad_id));
    }

    const sql = `SELECT * FROM vista_medidores ${where} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(sql, [...params, limit, offset]);

    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM vista_medidores ${where}`, params);
    const total = countRows[0]?.total ?? rows.length;

    res.json({ data: rows, pagination: { total, limit, offset, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (err) {
    console.error('GET /medidores/comunidad error', err);
    res.status(500).json({ error: 'Error al listar medidores' });
  }
});

/**
 * GET /api/medidores/:id
 * Detalle usando vista_medidores + lecturas recientes
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const access = await medidorAccessCheck(req.user, id);
    if (!access.exists) return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed) return res.status(403).json({ error: 'No autorizado' });

    const [rows] = await db.query('SELECT * FROM vista_medidores WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Medidor no encontrado' });

    const [lecturas] = await db.query(
      'SELECT id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status FROM lectura_medidor WHERE medidor_id = ? ORDER BY fecha DESC, id DESC LIMIT 24',
      [id]
    );

    res.json({ ...rows[0], lecturas_recientes: lecturas });
  } catch (err) {
    console.error('GET /medidores/:id error', err);
    res.status(500).json({ error: 'Error al obtener medidor' });
  }
});

/**
 * GET /api/medidores/:id/lecturas
 * Lecturas paginadas / cap limit
 */
router.get('/:id/lecturas', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const access = await medidorAccessCheck(req.user, id);
    if (!access.exists) return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed) return res.status(403).json({ error: 'No autorizado' });

    const limit = Math.min(1000, Number(req.query.limit || 200));
    const offset = Number(req.query.offset || 0);

    const [rows] = await db.query(
      'SELECT id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status FROM lectura_medidor WHERE medidor_id = ? ORDER BY fecha DESC, id DESC LIMIT ? OFFSET ?',
      [id, limit, offset]
    );

    const [countRows] = await db.query('SELECT COUNT(*) AS total FROM lectura_medidor WHERE medidor_id = ?', [id]);
    const total = countRows[0]?.total ?? rows.length;

    res.json({ data: rows, pagination: { total, limit, offset, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (err) {
    console.error('GET /medidores/:id/lecturas error', err);
    res.status(500).json({ error: 'Error al listar lecturas' });
  }
});

/**
 * POST /api/medidores/:id/lecturas
 * Crear lectura (maneja duplicados por unique periodo)
 */
router.post('/:id/lecturas', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const access = await medidorAccessCheck(req.user, id);
    if (!access.exists) return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed) return res.status(403).json({ error: 'No autorizado' });

    const { fecha, lectura, periodo, notes, reader_id, method, photo_url, status } = req.body;
    if (!fecha || typeof lectura === 'undefined' || !periodo) {
      return res.status(400).json({ error: 'Parámetros requeridos: fecha, lectura, periodo' });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO lectura_medidor (medidor_id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())',
        [id, fecha, lectura, periodo, reader_id || null, method || null, notes || null, photo_url || null, status || 'validated']
      );
      const [row] = await db.query('SELECT id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status FROM lectura_medidor WHERE id = ? LIMIT 1', [result.insertId]);
      return res.status(201).json(row[0]);
    } catch (dbErr) {
      if (dbErr && dbErr.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Ya existe una lectura para ese periodo' });
      }
      throw dbErr;
    }
  } catch (err) {
    console.error('POST /medidores/:id/lecturas error', err);
    res.status(500).json({ error: 'Error al crear lectura' });
  }
});

/**
 * GET /api/medidores/:id/consumos
 * Usa vista_consumos
 */
router.get('/:id/consumos', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { periodo } = req.query;

    // validar acceso
    const access = await medidorAccessCheck(req.user, id);
    if (!access.exists) return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed) return res.status(403).json({ error: 'No autorizado' });

    let where = ' WHERE medidor_id = ? ';
    const params = [id];
    if (periodo) { where += ' AND periodo = ? '; params.push(periodo); }

    const [rows] = await db.query(`SELECT * FROM vista_consumos ${where} ORDER BY periodo DESC`, params);
    res.json({ data: rows });
  } catch (err) {
    console.error('GET /medidores/:id/consumos error', err);
    res.status(500).json({ error: 'Error al listar consumos' });
  }
});

/**
 * DELETE /api/medidores/:id
 * Soft-delete si hay lecturas; verifica permisos
 */
router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const access = await medidorAccessCheck(req.user, id);
    if (!access.exists) return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed && !req.user?.is_superadmin) return res.status(403).json({ error: 'No autorizado' });

    const [lec] = await db.query('SELECT COUNT(*) AS cnt FROM lectura_medidor WHERE medidor_id = ?', [id]);
    if (lec[0].cnt > 0) {
      await db.query('UPDATE medidor SET activo = 0 WHERE id = ?', [id]);
      return res.json({ success: true, softDeleted: true });
    }

    await db.query('DELETE FROM medidor WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /medidores/:id error', err);
    res.status(500).json({ error: 'Error al eliminar medidor' });
  }
});

// NEW: GET /api/medidores  (global) - comportamiento similar a /gastos
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /medidores - user:', { id: req.user?.id, persona_id: req.user?.persona_id, is_superadmin: req.user?.is_superadmin, roles: req.user?.roles });

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(200, Number(req.query.limit || 100));
    const offset = typeof req.query.offset !== 'undefined' ? Number(req.query.offset) : (page - 1) * limit;
    const { search, tipo, comunidad_id } = req.query;

    let where = ' WHERE 1=1 ';
    const params = [];

    // Si se pide comunidad_id y es superadmin, permitirlo
    if (comunidad_id && req.user?.is_superadmin) {
      where += ' AND comunidad_id = ? ';
      params.push(Number(comunidad_id));
    } else if (!req.user?.is_superadmin) {
      // filtrar por comunidades asignadas al usuario (misma cláusula usada en otros endpoints)
      where += ` AND comunidad_id IN (
        SELECT umc.comunidad_id
        FROM usuario_miembro_comunidad umc
        WHERE umc.persona_id = ? AND umc.activo = 1 AND (umc.hasta IS NULL OR umc.hasta > CURDATE())
      )`;
      params.push(req.user.persona_id);

      // obtener comunidades del usuario directamente desde la BD (no confiar en req.user.comunidades)
      const personaId = req.user?.persona_id;
      console.log('Resolviendo comunidades para persona_id=', personaId);

      // intentos: 1) vista usuario_miembro_comunidad (usa persona_id)
      //          2) tabla usuario_rol_comunidad (usa usuario.id -> usuario_id)
      let comIds = [];
      try {
        const [r] = await db.query(
          `SELECT comunidad_id FROM usuario_miembro_comunidad WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
          [personaId]
        );
        comIds = (r || []).map(row => row.comunidad_id).filter(Boolean);
        console.log('Comunidades desde usuario_miembro_comunidad:', comIds);
      } catch (err) {
        console.error('Error leyendo usuario_miembro_comunidad:', err);
        comIds = [];
      }

      // fallback: buscar usuario.id por persona_id y leer usuario_rol_comunidad
      if (!comIds.length) {
        try {
          const [urows] = await db.query('SELECT id FROM usuario WHERE persona_id = ? LIMIT 1', [personaId]);
          if (urows && urows.length) {
            const usuarioId = urows[0].id;
            const [r2] = await db.query(
              'SELECT comunidad_id FROM usuario_rol_comunidad WHERE usuario_id = ? AND activo = 1',
              [usuarioId]
            );
            comIds = (r2 || []).map(row => row.comunidad_id).filter(Boolean);
            console.log('Comunidades desde usuario_rol_comunidad (usuario_id=' + usuarioId + '):', comIds);
          } else {
            console.log('No se encontró usuario.id para persona_id=', personaId);
          }
        } catch (err) {
          console.error('Error leyendo usuario_rol_comunidad fallback:', err);
        }
      }

      console.log('Comunidades encontradas totales:', comIds);

      if (!comIds.length) {
        // sin membresías activas -> devolver vacío con pagination
        return res.json({ data: [], pagination: { total: 0, limit, offset, pages: 0 } });
      }

      // construir IN (...)
      where += ` AND comunidad_id IN (${comIds.map(() => '?').join(',')}) `;
      params.push(...comIds);
    }

    if (search) {
      where += ' AND (medidor_codigo LIKE ? OR serial_number LIKE ? OR marca LIKE ? OR modelo LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (tipo) {
      where += ' AND tipo = ? ';
      params.push(tipo);
    }

    const sql = `SELECT * FROM vista_medidores ${where} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(sql, [...params, limit, offset]);

    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM vista_medidores ${where}`, params);
    const total = countRows[0]?.total ?? rows.length;

    res.json({ data: rows, pagination: { total, limit, offset, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (err) {
    console.error('GET /medidores error', err);
    res.status(500).json({ error: 'Error al listar medidores' });
  }
});

module.exports = router;




