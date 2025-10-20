const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', tipo_doc, fecha_desde, fecha_hasta } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params = [];
    let where = ' WHERE 1=1 ';

    if (search) {
      where += ' AND (vc.folio LIKE ? OR vc.proveedor_nombre LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tipo_doc) {
      where += ' AND vc.tipo_doc = ?';
      params.push(tipo_doc);
    }
    if (fecha_desde) {
      where += ' AND vc.fecha_emision >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      where += ' AND vc.fecha_emision <= ?';
      params.push(fecha_hasta);
    }

    if (!req.user?.is_superadmin) {
      const [comRows] = await db.query(
        `SELECT comunidad_id FROM usuario_miembro_comunidad
         WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
        [req.user.persona_id]
      );
      const comunidadIds = comRows.map(r => r.comunidad_id);
      if (!comunidadIds.length) {
        return res.json({ data: [], pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 } });
      }
      where += ` AND vc.comunidad_id IN (${comunidadIds.map(() => '?').join(',')})`;
      params.push(...comunidadIds);
    } else if (req.query.comunidad_id) {
      where += ' AND vc.comunidad_id = ?';
      params.push(Number(req.query.comunidad_id));
    }

    const query = `
      SELECT vc.*
      FROM vista_compras vc
      ${where}
      ORDER BY vc.fecha_emision DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const [rows] = await db.query(query, params);

    const countParams = params.slice(0, params.length - 2);
    const countQuery = `SELECT COUNT(*) AS total FROM vista_compras vc ${where}`;
    const [countRes] = await db.query(countQuery, countParams);
    const total = countRes[0]?.total ?? rows.length;

    res.json({ data: rows, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Error GET /compras:', err);
    res.status(500).json({ error: 'Error al listar compras' });
  }
});

module.exports = router;