const db = require('../db');

/**
 * Helpers
 */
function rowsFromResult(r) {
  if (!r) return [];
  if (r.rows) return r.rows;
  if (Array.isArray(r)) return r[0] || [];
  return r;
}

function isManager(user = {}) {
  if (!user) return false;
  const roles = (user.memberships || []).map(m => String(m.rol_slug || m.rol || '').toLowerCase());
  const allowed = ['sistema','soporte_tecnico','presidente_comite','admin_comunidad','sindico','contador'];
  if ((user.is_superadmin || user.role) && (user.is_superadmin === true || String(user.role).toLowerCase() === 'superadmin')) return true;
  return roles.some(r => allowed.includes(r));
}

/**
 * Listar apelaciones (filtros: multa_id, estado, comunidad_id, persona_id)
 */
exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const perPage = Math.min(parseInt(req.query.perPage || 25, 10), 200);
    const offset = (page - 1) * perPage;

    const filters = [];
    const params = [];

    if (req.query.multa_id) {
      params.push(req.query.multa_id);
      filters.push(`a.multa_id = ?`);
    }
    if (req.query.estado) {
      params.push(req.query.estado);
      filters.push(`a.estado = ?`);
    }
    if (req.query.comunidad_id) {
      params.push(req.query.comunidad_id);
      filters.push(`a.comunidad_id = ?`);
    }
    if (req.query.persona_id) {
      params.push(req.query.persona_id);
      filters.push(`a.persona_id = ?`);
    }

    // If not manager, restrict view to user's own apelaciones
    if (!isManager(req.user)) {
      // allow owners (usuario_id or persona_id)
      if (req.user && (req.user.id || req.user.persona_id)) {
        params.push(req.user.id || 0);
        filters.push(`(a.usuario_id = ? OR a.persona_id = ? )`);
        params.push(req.user.persona_id || req.user.id || 0);
      } else {
        return res.status(403).json({ error: 'forbidden' });
      }
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const sql = `
      SELECT a.*, m.monto AS multa_monto, m.estado AS multa_estado, c.razon_social AS comunidad_nombre
      FROM multa_apelacion a
      LEFT JOIN multa m ON m.id = a.multa_id
      LEFT JOIN comunidad c ON c.id = a.comunidad_id
      ${whereClause}
      ORDER BY a.fecha_apelacion DESC
      LIMIT ? OFFSET ?`;
    params.push(perPage, offset);

    const result = await db.query(sql, params);
    const rows = rowsFromResult(result);

    // total count (simple)
    const countSql = `SELECT COUNT(*) as total FROM multa_apelacion a ${whereClause}`;
    const countResult = await db.query(countSql, params.slice(0, params.length - 2));
    const countRows = rowsFromResult(countResult);
    const total = (countRows && countRows[0] && (countRows[0].total || countRows[0].TOTAL)) ? Number(countRows[0].total || countRows[0].TOTAL) : 0;

    res.json({ data: rows, meta: { page, perPage, total } });
  } catch (err) {
    console.error('apelaciones.list.error', err);
    res.status(500).json({ error: 'error_list_apelaciones' });
  }
};

/**
 * Obtener por id (solo owner o manager)
 */
exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const q = `SELECT a.*, m.monto AS multa_monto, c.razon_social AS comunidad_nombre
               FROM multa_apelacion a
               LEFT JOIN multa m ON m.id = a.multa_id
               LEFT JOIN comunidad c ON c.id = a.comunidad_id
               WHERE a.id = ? LIMIT 1`;
    const r = await db.query(q, [id]);
    const rows = rowsFromResult(r);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const item = rows[0];

    // permission: owner (usuario_id or persona_id) or manager
    const isOwner = req.user && (req.user.id === item.usuario_id || req.user.persona_id === item.persona_id);
    if (!isOwner && !isManager(req.user)) return res.status(403).json({ error: 'forbidden' });

    res.json(item);
  } catch (err) {
    console.error('apelaciones.getById.error', err);
    res.status(500).json({ error: 'error_get_apelacion' });
  }
};

/**
 * Crear apelación
 */
exports.create = async (req, res) => {
  try {
    const usuarioId = req.user && (req.user.id || null);
    const personaId = req.body.persona_id || (req.user && req.user.persona_id) || null;
    const { multa_id, motivo, comunidad_id, documentos_json } = req.body;
    if (!multa_id || !motivo) return res.status(400).json({ error: 'missing_fields' });

    // validar multa existe y pertenece a comunidad (si comunidad_id enviado)
    const multaRes = await db.query('SELECT * FROM multa WHERE id = ? LIMIT 1', [multa_id]);
    const multaRows = rowsFromResult(multaRes);
    if (!multaRows || multaRows.length === 0) return res.status(400).json({ error: 'multa_not_found' });
    const multa = multaRows[0];

    // si se envía comunidad_id, validar coincide con la multa
    if (comunidad_id && Number(comunidad_id) !== Number(multa.comunidad_id)) {
      return res.status(400).json({ error: 'multa_comunidad_mismatch' });
    }

    // Crear
    const insertSql = `INSERT INTO multa_apelacion
      (multa_id, usuario_id, persona_id, comunidad_id, motivo, documentos_json, estado, created_at, updated_at, fecha_apelacion)
      VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW(), NOW(), NOW())`;
    const params = [multa_id, usuarioId, personaId, comunidad_id || multa.comunidad_id || null, motivo, documentos_json ? JSON.stringify(documentos_json) : null];

    const insertRes = await db.query(insertSql, params);
    const insertedRows = rowsFromResult(insertRes);
    // Try to return last inserted id row
    let newId = null;
    if (insertRes && insertRes.insertId) newId = insertRes.insertId;
    // fallback: try to fetch by unique combination
    if (!newId) {
      const sel = await db.query('SELECT * FROM multa_apelacion WHERE multa_id = ? AND usuario_id = ? ORDER BY id DESC LIMIT 1', [multa_id, usuarioId]);
      const selRows = rowsFromResult(sel);
      if (selRows && selRows.length) newId = selRows[0].id;
    }
    const created = newId ? (await db.query('SELECT * FROM multa_apelacion WHERE id = ? LIMIT 1', [newId])) : insertRes;
    const createdRows = rowsFromResult(created);
    res.status(201).json(createdRows[0] || { id: newId });
  } catch (err) {
    console.error('apelaciones.create.error', err);
    res.status(500).json({ error: 'error_create_apelacion' });
  }
};

/**
 * Actualizar apelación (solo motivo/documentos mientras pendiente) — managers pueden actualizar cualquier campo razonable
 */
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const allowedFieldsAuthor = ['motivo', 'documentos_json'];
    const allowedFieldsManager = ['motivo', 'documentos_json', 'estado', 'resolucion'];

    const r = await db.query('SELECT * FROM multa_apelacion WHERE id = ? LIMIT 1', [id]);
    const rows = rowsFromResult(r);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'not_found' });
    const item = rows[0];

    const manager = isManager(req.user);
    const isAuthor = req.user && (req.user.id === item.usuario_id || req.user.persona_id === item.persona_id);

    if (!manager && !isAuthor) return res.status(403).json({ error: 'forbidden' });

    const payload = req.body || {};
    const allowed = manager ? allowedFieldsManager : allowedFieldsAuthor;
    const sets = [];
    const params = [];

    Object.keys(payload).forEach(k => {
      if (allowed.includes(k)) {
        sets.push(`${k} = ?`);
        params.push(k === 'documentos_json' ? (payload[k] ? JSON.stringify(payload[k]) : null) : payload[k]);
      }
    });

    if (!sets.length) return res.status(400).json({ error: 'no_valid_fields' });

    params.push(id);
    const sql = `UPDATE multa_apelacion SET ${sets.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.query(sql, params);

    const updated = await db.query('SELECT * FROM multa_apelacion WHERE id = ? LIMIT 1', [id]);
    const updatedRows = rowsFromResult(updated);
    res.json(updatedRows[0]);
  } catch (err) {
    console.error('apelaciones.update.error', err);
    res.status(500).json({ error: 'error_update_apelacion' });
  }
};

/**
 * Resolver apelación (solo managers)
 */
exports.resolve = async (req, res) => {
  try {
    if (!isManager(req.user)) return res.status(403).json({ error: 'forbidden' });

    const id = Number(req.params.id);
    const { accion, resolucion } = req.body;
    if (!accion || !['aceptar','rechazar'].includes(accion)) return res.status(400).json({ error: 'invalid_action' });

    const estado = accion === 'aceptar' ? 'aprobada' : 'rechazada';
    const sql = `UPDATE multa_apelacion SET estado = ?, resolucion = ?, resuelto_por = ?, fecha_resolucion = NOW(), updated_at = NOW() WHERE id = ?`;
    await db.query(sql, [estado, resolucion || null, req.user.id, id]);

    const updated = await db.query('SELECT * FROM multa_apelacion WHERE id = ? LIMIT 1', [id]);
    const updatedRows = rowsFromResult(updated);
    res.json(updatedRows[0]);
  } catch (err) {
    console.error('apelaciones.resolve.error', err);
    res.status(500).json({ error: 'error_resolve_apelacion' });
  }
};