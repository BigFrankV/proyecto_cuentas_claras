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
 *   - name: Unidades
 *     description: Gestión de unidades
 */

// List unidades por comunidad (miembros)
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const userId = req.user.persona_id;
      const isSuperadmin = req.user.is_superadmin;

      // Obtener rol del usuario en esta comunidad
      let rol = null;
      if (!isSuperadmin) {
        const [rolRows] = await db.query(
          'SELECT rol FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ?',
          [userId, comunidadId]
        );
        rol = rolRows[0]?.rol;
      }

      let query = `
      SELECT 
        u.id, 
        u.codigo, 
        u.edificio_id, 
        u.torre_id,
        e.nombre as edificio_nombre,
        t.nombre as torre_nombre,
        u.alicuota, 
        u.activa 
      FROM unidad u
      LEFT JOIN edificio e ON e.id = u.edificio_id
      LEFT JOIN torre t ON t.id = u.torre_id
    `;

      const params = [comunidadId];

      // CRÍTICO: Roles básicos solo ven SUS unidades
      if (!isSuperadmin && !['admin', 'admin_comunidad'].includes(rol)) {
        query += `
        INNER JOIN titulares_unidad tu ON tu.unidad_id = u.id
        WHERE u.comunidad_id = ? 
          AND tu.persona_id = ?
          AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
      `;
        params.push(userId);
      } else {
        // Admin/Superadmin: todas de la comunidad
        query += ` WHERE u.comunidad_id = ? `;
      }

      query += ` LIMIT 500`;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error('Error en GET /comunidad/:comunidadId:', err);
      res.status(500).json({ error: 'Error al obtener unidades' });
    }
  }
);

// Crear unidad en comunidad (admin de comunidad)
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin']),
    body('codigo').notEmpty(),
  ],
  async (req, res) => {
    const comunidadId = Number(req.params.comunidadId);
    const {
      edificio_id,
      torre_id,
      codigo,
      alicuota,
      m2_utiles,
      m2_terrazas,
      nro_bodega,
      nro_estacionamiento,
      activa,
    } = req.body;
    if ((edificio_id && torre_id) || (!edificio_id && !torre_id)) {
      return res
        .status(400)
        .json({ error: 'provide exactly one of edificio_id or torre_id' });
    }
    try {
      const [result] = await db.query(
        'INSERT INTO unidad (comunidad_id, edificio_id, torre_id, codigo, alicuota, m2_utiles, m2_terrazas, nro_bodega, nro_estacionamiento, activa) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [
          comunidadId,
          edificio_id || null,
          torre_id || null,
          codigo,
          alicuota || 0,
          m2_utiles || null,
          m2_terrazas || null,
          nro_bodega || null,
          nro_estacionamiento || null,
          typeof activa === 'undefined' ? 1 : activa ? 1 : 0,
        ]
      );
      const [row] = await db.query(
        'SELECT id, codigo, edificio_id, torre_id, alicuota FROM unidad WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      if (err && err.code === 'ER_DUP_ENTRY')
        return res
          .status(409)
          .json({ error: 'codigo must be unique per comunidad' });
      res.status(500).json({ error: 'server error' });
    }
  }
);

// GET /unidades/:id etc (kept)
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT * FROM unidad WHERE id = ? LIMIT 1', [
    id,
  ]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const id = req.params.id;
    const fields = [
      'edificio_id',
      'torre_id',
      'codigo',
      'alicuota',
      'm2_utiles',
      'm2_terrazas',
      'nro_bodega',
      'nro_estacionamiento',
      'activa',
    ];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });
    if (!updates.length) return res.status(400).json({ error: 'no fields' });
    values.push(id);
    try {
      if (
        req.body.edificio_id !== undefined &&
        req.body.torre_id !== undefined
      ) {
        return res
          .status(400)
          .json({ error: 'provide at most one of edificio_id or torre_id' });
      }
      await db.query(
        `UPDATE unidad SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM unidad WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      if (err && err.code === 'ER_DUP_ENTRY')
        return res
          .status(409)
          .json({ error: 'codigo must be unique per comunidad' });
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const id = req.params.id;
    try {
      await db.query('DELETE FROM unidad WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/* titulares / residentes endpoints - actualizado para usar titulares_unidad */
router.get('/:id/tenencias', authenticate, async (req, res) => {
  const unidadId = req.params.id;
  const { activo } = req.query;
  try {
    let sql =
      'SELECT t.id, t.persona_id, t.tipo, t.desde, t.hasta, t.porcentaje, p.nombres, p.apellidos, p.email FROM titulares_unidad t LEFT JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? ORDER BY t.desde DESC';
    const params = [unidadId];
    const [rows] = await db.query(sql, params);
    const today = new Date().toISOString().slice(0, 10);
    if (activo === '1') {
      return res.json(rows.filter((r) => !r.hasta || r.hasta >= today));
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post(
  '/:id/tenencias',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('persona_id').isInt(),
    body('tipo').notEmpty(),
    body('desde').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const unidadId = req.params.id;
    const { persona_id, tipo, desde, hasta, porcentaje } = req.body;
    try {
      const [urows] = await db.query(
        'SELECT comunidad_id FROM unidad WHERE id = ? LIMIT 1',
        [unidadId]
      );
      if (!urows.length)
        return res.status(404).json({ error: 'unidad not found' });
      const comunidad_id = urows[0].comunidad_id;
      const [result] = await db.query(
        'INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, hasta, porcentaje) VALUES (?,?,?,?,?,?,?)',
        [
          comunidad_id,
          unidadId,
          persona_id,
          tipo,
          desde,
          hasta || null,
          porcentaje || 100.0,
        ]
      );
      const [row] = await db.query(
        'SELECT id, persona_id, tipo, desde, hasta, porcentaje FROM titulares_unidad WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.get('/:id/residentes', authenticate, async (req, res) => {
  const unidadId = req.params.id;
  const personaId = req.user.persona_id;
  const isSuperadmin = req.user.is_superadmin;

  try {
    // Obtener la comunidad de la unidad
    const [unidadRows] = await db.query(
      'SELECT comunidad_id FROM unidad WHERE id = ?',
      [unidadId]
    );

    if (unidadRows.length === 0) {
      return res.status(404).json({ error: 'Unidad no encontrada' });
    }

    const comunidadId = unidadRows[0].comunidad_id;

    // ✅ Superadmin: acceso total
    if (isSuperadmin) {
      const today = new Date().toISOString().slice(0, 10);
      const [rows] = await db.query(
        "SELECT p.id, p.rut, p.dv, p.nombres, p.apellidos, t.tipo, t.desde, t.hasta, t.porcentaje FROM titulares_unidad t JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? AND t.tipo IN ('propietario','arrendatario') AND (t.hasta IS NULL OR t.hasta >= ?) ORDER BY t.desde DESC",
        [unidadId, today]
      );
      return res.json(rows);
    }

    // Verificar membresía y rol en la comunidad
    const [rolRows] = await db.query(
      'SELECT rol FROM usuario_miembro_comunidad WHERE persona_id = ? AND comunidad_id = ? AND activo = 1',
      [personaId, comunidadId]
    );

    if (rolRows.length === 0) {
      return res
        .status(403)
        .json({ error: 'No tienes acceso a esta comunidad' });
    }

    const rol = rolRows[0].rol;

    // ❌ Roles básicos NO tienen acceso a ver residentes
    if (!['admin', 'admin_comunidad'].includes(rol)) {
      return res.status(403).json({
        error: 'Acceso denegado. Solo administradores pueden ver residentes.',
      });
    }

    // ✅ Admin puede ver residentes
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await db.query(
      "SELECT p.id, p.rut, p.dv, p.nombres, p.apellidos, t.tipo, t.desde, t.hasta, t.porcentaje FROM titulares_unidad t JOIN persona p ON p.id = t.persona_id WHERE t.unidad_id = ? AND t.tipo IN ('propietario','arrendatario') AND (t.hasta IS NULL OR t.hasta >= ?) ORDER BY t.desde DESC",
      [unidadId, today]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// ----- Additional endpoints generated from queries_unidades.sql -----

/**
 * @swagger
 * /unidades:
 *   get:
 *     tags: [Unidades]
 *     summary: Listado de unidades con filtros y paginación
 *     description: Retorna unidades con filtros por comunidad/edificio/torre, búsqueda por código o persona y datos resumidos (saldo, último pago, propietario/residente).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: edificio_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: torre_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: búsqueda por código, nombre o RUT de persona
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de unidades
 */

// Main listing with filters, pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      comunidad_id,
      edificio_id,
      torre_id,
      search,
      activa,
      limit = 100,
      offset = 0,
    } = req.query;
    const params = [
      comunidad_id || null,
      edificio_id || null,
      torre_id || null,
      activa === undefined ? null : activa === '1' || activa === 'true' ? 1 : 0,
      search || null,
      Number(limit),
      Number(offset),
    ];

    // Agregar filtro por permisos si no es superadmin
    let comunidadFilter = '';
    let comunidadParams = [];
    let rolesBasicosFilter = '';
    let rolesBasicosParams = [];

    if (!req.user?.is_superadmin) {
      // Obtener comunidades y roles del usuario
      const [comRows] = await db.query(
        `SELECT DISTINCT comunidad_id, rol 
         FROM usuario_miembro_comunidad 
         WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
        [req.user.persona_id]
      );

      if (comRows.length === 0) {
        return res.json([]); // Usuario sin comunidades asignadas
      }

      const comunidadIds = comRows.map((r) => r.comunidad_id);
      comunidadFilter = ` AND u.comunidad_id IN (${comunidadIds
        .map(() => '?')
        .join(',')})`;
      comunidadParams = comunidadIds;

      // Si NO es admin en NINGUNA comunidad, aplicar filtro de titulares_unidad
      const esAdminEnAlgunaComunidad = comRows.some((r) =>
        ['admin', 'admin_comunidad'].includes(r.rol)
      );

      if (!esAdminEnAlgunaComunidad) {
        // Roles básicos: solo sus unidades
        rolesBasicosFilter = ` AND EXISTS (
          SELECT 1 FROM titulares_unidad tu 
          WHERE tu.unidad_id = u.id 
            AND tu.persona_id = ?
            AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        )`;
        rolesBasicosParams = [req.user.persona_id];
      }
    }

    const sql = `
      SELECT
        u.id,
        u.codigo AS numero,
        u.m2_utiles,
        u.m2_terrazas,
        u.alicuota,
        u.nro_estacionamiento,
        u.nro_bodega,
        u.activa,
        c.razon_social AS comunidad_nombre,
        e.nombre AS edificio_nombre,
        t.nombre AS torre_nombre,
        COALESCE( (SELECT SUM(ccu.saldo) FROM cuenta_cobro_unidad ccu WHERE ccu.unidad_id = u.id), 0 ) AS saldo_total,
        (SELECT p.fecha FROM pago p WHERE p.unidad_id = u.id AND p.estado = 'aplicado' ORDER BY p.fecha DESC LIMIT 1) AS ultimo_pago_fecha,
        (SELECT CONCAT(pe.nombres,' ',pe.apellidos)
           FROM titulares_unidad tu
           JOIN persona pe ON pe.id = tu.persona_id
           WHERE tu.unidad_id = u.id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
           ORDER BY tu.desde DESC LIMIT 1) AS propietario_nombre,
        (SELECT CONCAT(pe.nombres,' ',pe.apellidos)
           FROM titulares_unidad tu
           JOIN persona pe ON pe.id = tu.persona_id
           WHERE tu.unidad_id = u.id AND tu.tipo = 'arrendatario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
           ORDER BY tu.desde DESC LIMIT 1) AS residente_nombre
      FROM unidad u
      LEFT JOIN comunidad c ON c.id = u.comunidad_id
      LEFT JOIN edificio e ON e.id = u.edificio_id
      LEFT JOIN torre t ON t.id = u.torre_id
      WHERE 1 = 1
        AND (? IS NULL OR u.comunidad_id = ?)
        AND (? IS NULL OR u.edificio_id = ?)
        AND (? IS NULL OR u.torre_id = ?)
        AND (? IS NULL OR u.activa = ?)
        ${comunidadFilter}
        ${rolesBasicosFilter}
        AND (
          ? IS NULL
          OR u.codigo LIKE CONCAT('%', ?, '%')
          OR EXISTS (
            SELECT 1 FROM persona pe
            JOIN titulares_unidad tu ON tu.persona_id = pe.id
            WHERE tu.unidad_id = u.id
              AND (pe.nombres LIKE CONCAT('%', ?, '%') OR pe.apellidos LIKE CONCAT('%', ?, '%') OR pe.rut LIKE CONCAT('%', ?, '%'))
          )
        )
      ORDER BY u.codigo
      LIMIT ? OFFSET ?
    `;

    // Preparar params en el orden usado arriba
    const execParams = [
      params[0],
      params[0],
      params[1],
      params[1],
      params[2],
      params[2],
      params[3],
      params[3],
      ...comunidadParams,
      ...rolesBasicosParams,
      params[4],
      params[4],
      params[4],
      params[4],
      params[4],
      params[5],
      params[6],
    ];
    const [rows] = await db.query(sql, execParams);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/{id}/summary:
 *   get:
 *     tags: [Unidades]
 *     summary: Resumen detallado de una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resumen de la unidad
 *       404:
 *         description: Unidad no encontrada
 */

// Detailed summary (richer than simple SELECT *)
router.get('/:id/summary', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const sql = `
      SELECT
        u.id,
        u.codigo AS numero,
        u.alicuota,
        u.m2_utiles,
        u.m2_terrazas,
        u.nro_bodega,
        u.nro_estacionamiento,
        u.activa,
        c.id AS comunidad_id, c.razon_social AS comunidad_nombre,
        e.id AS edificio_id, e.nombre AS edificio_nombre,
        t.id AS torre_id, t.nombre AS torre_nombre,
        COALESCE( (SELECT SUM(ccu.saldo) FROM cuenta_cobro_unidad ccu WHERE ccu.unidad_id = u.id), 0 ) AS saldo_total,
        (SELECT CONCAT(pe.nombres,' ',pe.apellidos)
           FROM titulares_unidad tu
           JOIN persona pe ON pe.id = tu.persona_id
           WHERE tu.unidad_id = u.id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
           ORDER BY tu.desde DESC LIMIT 1) AS propietario_nombre,
        (SELECT p.fecha FROM pago p WHERE p.unidad_id = u.id AND p.estado = 'aplicado' ORDER BY p.fecha DESC LIMIT 1) AS ultimo_pago_fecha
      FROM unidad u
      LEFT JOIN comunidad c ON c.id = u.comunidad_id
      LEFT JOIN edificio e ON e.id = u.edificio_id
      LEFT JOIN torre t ON t.id = u.torre_id
      WHERE u.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/{id}/cuentas:
 *   get:
 *     tags: [Unidades]
 *     summary: Cuentas de cobro (emisiones) de la unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de cuentas de cobro
 */

// Cuentas de cobro por unidad
router.get('/:id/cuentas', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      `SELECT ccu.id, ccu.emision_id, ccu.comunidad_id, ccu.monto_total, ccu.saldo, ccu.estado, ccu.interes_acumulado, ccu.created_at, ccu.updated_at, eg.periodo AS emision_periodo, eg.fecha_vencimiento AS emision_vencimiento FROM cuenta_cobro_unidad ccu LEFT JOIN emision_gastos_comunes eg ON eg.id = ccu.emision_id WHERE ccu.unidad_id = ? ORDER BY ccu.created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/cuentas/{cuentaId}/detalle:
 *   get:
 *     tags: [Unidades]
 *     summary: Detalle de una cuenta de cobro (partidas)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cuentaId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Detalle de la cuenta
 */

// Detalle de una cuenta_cobro_unidad
router.get('/cuentas/:cuentaId/detalle', authenticate, async (req, res) => {
  try {
    const cuentaId = req.params.cuentaId;
    const [rows] = await db.query(
      `SELECT dcu.id, dcu.categoria_id, cat.nombre AS categoria_nombre, dcu.glosa, dcu.monto, dcu.origen, dcu.origen_id, dcu.iva_incluido, dcu.created_at FROM detalle_cuenta_unidad dcu LEFT JOIN categoria_gasto cat ON cat.id = dcu.categoria_id WHERE dcu.cuenta_cobro_unidad_id = ? ORDER BY dcu.id`,
      [cuentaId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/{id}/pagos:
 *   get:
 *     tags: [Unidades]
 *     summary: Pagos realizados en la unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de pagos
 */

// Cuentas + detalle (todo junto) por unidad
router.get('/:id/cuentas_full', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const sql = `SELECT ccu.id AS cuenta_id, ccu.emision_id, ccu.monto_total, ccu.saldo, ccu.estado, ccu.interes_acumulado, ccu.created_at AS cuenta_created, dcu.id AS detalle_id, dcu.categoria_id, cat.nombre AS categoria_nombre, dcu.glosa, dcu.monto AS detalle_monto, dcu.origen, dcu.origen_id FROM cuenta_cobro_unidad ccu LEFT JOIN detalle_cuenta_unidad dcu ON dcu.cuenta_cobro_unidad_id = ccu.id LEFT JOIN categoria_gasto cat ON cat.id = dcu.categoria_id WHERE ccu.unidad_id = ? ORDER BY ccu.created_at DESC, dcu.id`;
    const [rows] = await db.query(sql, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Pagos de la unidad
router.get('/:id/pagos', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      `SELECT p.id, p.fecha, p.monto, p.medio, p.referencia, p.estado, p.comprobante_num, pa.cuenta_cobro_unidad_id, pa.monto AS aplicado_monto, pa.prioridad FROM pago p LEFT JOIN pago_aplicacion pa ON pa.pago_id = p.id WHERE p.unidad_id = ? ORDER BY p.fecha DESC, p.id DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/{id}/medidores:
 *   get:
 *     tags: [Unidades]
 *     summary: Medidores asociados a la unidad y su última lectura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de medidores con última lectura
 */

// Aplicaciones por cuenta de cobro
router.get(
  '/cuentas/:cuentaId/aplicaciones',
  authenticate,
  async (req, res) => {
    try {
      const cuentaId = req.params.cuentaId;
      const [rows] = await db.query(
        `SELECT pa.id, pa.pago_id, pa.monto, pa.prioridad, p.fecha AS pago_fecha, p.monto AS pago_monto, p.medio, p.comprobante_num FROM pago_aplicacion pa LEFT JOIN pago p ON p.id = pa.pago_id WHERE pa.cuenta_cobro_unidad_id = ? ORDER BY pa.id`,
        [cuentaId]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Vista financiera (cargo_financiero_unidad)
router.get('/:id/financiero', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      'SELECT * FROM cargo_financiero_unidad v WHERE v.unidad_id = ? ORDER BY v.created_at DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Medidores y última lectura
router.get('/:id/medidores', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const sql = `SELECT m.id AS medidor_id, m.tipo, m.codigo, m.es_compartido, lm.ultima_lectura, lm.fecha_lectura, lm.periodo FROM medidor m LEFT JOIN ( SELECT l.medidor_id, l.lectura AS ultima_lectura, l.fecha AS fecha_lectura, l.periodo FROM lectura_medidor l JOIN ( SELECT medidor_id, MAX(fecha) AS max_fecha FROM lectura_medidor GROUP BY medidor_id ) lm2 ON lm2.medidor_id = l.medidor_id AND lm2.max_fecha = l.fecha ) lm ON lm.medidor_id = m.id WHERE m.unidad_id = ? ORDER BY m.tipo, m.codigo`;
    const [rows] = await db.query(sql, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/dropdowns/comunidades:
 *   get:
 *     tags: [Unidades]
 *     summary: Lista para dropdown de comunidades
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comunidades (id, nombre)
 */

// Lecturas por medidor
router.get('/medidores/:medidorId/lecturas', authenticate, async (req, res) => {
  try {
    const medidorId = req.params.medidorId;
    const { periodo_desde, periodo_hasta } = req.query;
    const sql = `SELECT l.id, l.periodo, l.fecha, l.lectura FROM lectura_medidor l WHERE l.medidor_id = ? AND (? IS NULL OR l.periodo >= ?) AND (? IS NULL OR l.periodo <= ?) ORDER BY l.periodo DESC`;
    const [rows] = await db.query(sql, [
      medidorId,
      periodo_desde || null,
      periodo_desde || null,
      periodo_hasta || null,
      periodo_hasta || null,
    ]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Tickets de soporte por unidad
router.get('/:id/tickets', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      'SELECT ts.id, ts.categoria, ts.titulo, ts.estado, ts.prioridad, ts.asignado_a, ts.created_at FROM ticket_soporte ts WHERE ts.unidad_id = ? ORDER BY ts.created_at DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Multas por unidad
router.get('/:id/multas', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      'SELECT id, motivo, descripcion, monto, persona_id, created_at, updated_at FROM multa WHERE unidad_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Reservas por unidad
router.get('/:id/reservas', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(
      'SELECT id, amenidad_id, inicio, fin, estado, created_at FROM reserva_amenidad WHERE unidad_id = ? ORDER BY inicio DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Dropdowns / selects
router.get('/dropdowns/comunidades', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, razon_social AS nombre FROM comunidad ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
router.get('/dropdowns/edificios', authenticate, async (req, res) => {
  try {
    const { comunidad_id } = req.query;
    const [rows] = await db.query(
      'SELECT id, nombre, direccion FROM edificio WHERE comunidad_id = ? ORDER BY nombre',
      [comunidad_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
router.get('/dropdowns/torres', authenticate, async (req, res) => {
  try {
    const { edificio_id } = req.query;
    const [rows] = await db.query(
      'SELECT id, nombre, codigo FROM torre WHERE edificio_id = ? ORDER BY nombre',
      [edificio_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
router.get('/dropdowns/unidades', authenticate, async (req, res) => {
  try {
    const { torre_id } = req.query;
    const [rows] = await db.query(
      'SELECT u.id, u.codigo AS numero, u.nro_estacionamiento, u.nro_bodega FROM unidad u WHERE u.torre_id = ? ORDER BY u.codigo',
      [torre_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Advanced search by propietario/residente
router.get('/search', authenticate, async (req, res) => {
  try {
    const q = req.query.q || '';
    const like = `%${q}%`;
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.codigo, CONCAT(pe.nombres,' ',pe.apellidos) AS persona FROM unidad u JOIN titulares_unidad tu ON tu.unidad_id = u.id JOIN persona pe ON pe.id = tu.persona_id WHERE (pe.nombres LIKE ? OR pe.apellidos LIKE ? OR pe.rut LIKE ?) ORDER BY u.codigo LIMIT 50`,
      [like, like, like]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/search:
 *   get:
 *     tags: [Unidades]
 *     summary: Búsqueda avanzada por propietario o residente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Texto de búsqueda (nombres, apellidos o RUT)
 *     responses:
 *       200:
 *         description: Resultados de unidades coincidentes
 */

// Report: saldo por unidad dentro de una comunidad
router.get('/report/saldos', authenticate, async (req, res) => {
  try {
    const { comunidad_id } = req.query;
    const [rows] = await db.query(
      `SELECT u.id, u.codigo, COALESCE(SUM(ccu.saldo),0) AS saldo_total, (SELECT p.fecha FROM pago p WHERE p.unidad_id = u.id AND p.estado='aplicado' ORDER BY p.fecha DESC LIMIT 1) AS ultimo_pago_fecha FROM unidad u LEFT JOIN cuenta_cobro_unidad ccu ON ccu.unidad_id = u.id WHERE u.comunidad_id = ? GROUP BY u.id, u.codigo ORDER BY saldo_total DESC LIMIT 200`,
      [comunidad_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/report/saldos:
 *   get:
 *     tags: [Unidades]
 *     summary: Reporte de saldos por unidad en una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de saldos por unidad
 */

// Validaciones unicidad bodega/estacionamiento
router.get('/validate/bodega', authenticate, async (req, res) => {
  try {
    const { comunidad_id, nro_bodega } = req.query;
    const [rows] = await db.query(
      'SELECT id, codigo FROM unidad WHERE comunidad_id = ? AND nro_bodega = ? LIMIT 1',
      [comunidad_id, nro_bodega]
    );
    res.json(rows.length ? rows[0] : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
router.get('/validate/estacionamiento', authenticate, async (req, res) => {
  try {
    const { comunidad_id, nro_estacionamiento } = req.query;
    const [rows] = await db.query(
      'SELECT id, codigo FROM unidad WHERE comunidad_id = ? AND nro_estacionamiento = ? LIMIT 1',
      [comunidad_id, nro_estacionamiento]
    );
    res.json(rows.length ? rows[0] : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /unidades/validate/bodega:
 *   get:
 *     tags: [Unidades]
 *     summary: Validar unicidad de número de bodega en una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: nro_bodega
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unidad encontrada o null
 */

/**
 * @swagger
 * /unidades/validate/estacionamiento:
 *   get:
 *     tags: [Unidades]
 *     summary: Validar unicidad de número de estacionamiento en una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: nro_estacionamiento
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unidad encontrada o null
 */

module.exports = router;

// ----------------- WRITE endpoints (CRUD extras) -----------------
/**
 * @swagger
 * /unidades/tenencias/{tenenciaId}:
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar una tenencia (titularidad)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenenciaId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               persona_id:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               desde:
 *                 type: string
 *                 format: date
 *               hasta:
 *                 type: string
 *                 format: date
 *               porcentaje:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tenencia actualizada
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar una tenencia
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenenciaId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Tenencia eliminada
 *
 * /unidades/{id}/pagos:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear un pago para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               monto:
 *                 type: number
 *               medio:
 *                 type: string
 *               referencia:
 *                 type: string
 *               estado:
 *                 type: string
 *               comprobante_num:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago creado
 *
 * /unidades/pagos/{pagoId}:
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar un pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               monto:
 *                 type: number
 *               medio:
 *                 type: string
 *               referencia:
 *                 type: string
 *               estado:
 *                 type: string
 *               comprobante_num:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago actualizado
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar un pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Pago eliminado
 *
 * /unidades/pagos/{pagoId}/aplicaciones:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear aplicación de pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagoId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cuenta_cobro_unidad_id:
 *                 type: integer
 *               monto:
 *                 type: number
 *               prioridad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Aplicación creada
 *
 * /unidades/pago_aplicaciones/{id}:
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar una aplicación de pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Aplicación eliminada
 *
 * /unidades/{id}/medidores:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear medidor en una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               codigo:
 *                 type: string
 *               es_compartido:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Medidor creado
 *
 * /unidades/medidores/{medidorId}:
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar medidor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medidorId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               codigo:
 *                 type: string
 *               es_compartido:
 *                 type: boolean
 *               unidad_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Medidor actualizado
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar medidor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medidorId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Medidor eliminado
 *
 * /unidades/medidores/{medidorId}/lecturas:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear lectura de medidor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medidorId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodo:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               lectura:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lectura creada
 *
 * /unidades/{id}/multas:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear multa para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               persona_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Multa creada
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar multa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               persona_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Multa actualizada
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar multa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Multa eliminada
 *
 * /unidades/{id}/reservas:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear reserva de amenidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amenidad_id:
 *                 type: integer
 *               inicio:
 *                 type: string
 *                 format: date-time
 *               fin:
 *                 type: string
 *                 format: date-time
 *               estado:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reserva creada
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amenidad_id:
 *                 type: integer
 *               inicio:
 *                 type: string
 *                 format: date-time
 *               fin:
 *                 type: string
 *                 format: date-time
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reserva actualizada
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Reserva eliminada
 *
 * /unidades/{id}/tickets:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear ticket de soporte para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria:
 *                 type: string
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               prioridad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket creado
 *   patch:
 *     tags: [Unidades]
 *     summary: Actualizar ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria:
 *                 type: string
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               prioridad:
 *                 type: string
 *               estado:
 *                 type: string
 *               asignado_a:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket actualizado
 *   delete:
 *     tags: [Unidades]
 *     summary: Eliminar ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Ticket eliminado
 *
 * /unidades/{id}/cuentas:
 *   post:
 *     tags: [Unidades]
 *     summary: Crear cuenta de cobro para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emision_id:
 *                 type: integer
 *               monto_total:
 *                 type: number
 *               estado:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cuenta creada
 *
 * /unidades/cuentas/{cuentaId}/detalle:
 *   post:
 *     tags: [Unidades]
 *     summary: Agregar partida a una cuenta de cobro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cuentaId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoria_id:
 *                 type: integer
 *               glosa:
 *                 type: string
 *               monto:
 *                 type: number
 *               origen:
 *                 type: string
 *               origen_id:
 *                 type: integer
 *               iva_incluido:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Partida agregada
 */

// Update titulares_unidad
router.patch(
  '/tenencias/:tenenciaId',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.tenenciaId;
      const fields = ['persona_id', 'tipo', 'desde', 'hasta', 'porcentaje'];
      const updates = [];
      const values = [];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
      if (!updates.length)
        return res.status(400).json({ error: 'no fields to update' });
      values.push(id);
      await db.query(
        `UPDATE titulares_unidad SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT id, persona_id, tipo, desde, hasta, porcentaje FROM titulares_unidad WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Delete tenencia
router.delete(
  '/tenencias/:tenenciaId',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.tenenciaId;
      await db.query('DELETE FROM titulares_unidad WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Create pago for unit
router.post(
  '/:id/pagos',
  [authenticate, body('monto').isFloat({ gt: 0 })],
  async (req, res) => {
    const unidadId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const {
        fecha,
        monto,
        medio,
        referencia,
        estado = 'pendiente',
        comprobante_num,
      } = req.body;
      const [result] = await db.query(
        'INSERT INTO pago (unidad_id, fecha, monto, medio, referencia, estado, comprobante_num) VALUES (?,?,?,?,?,?,?)',
        [
          unidadId,
          fecha || new Date(),
          monto,
          medio || null,
          referencia || null,
          estado,
          comprobante_num || null,
        ]
      );
      const [row] = await db.query('SELECT * FROM pago WHERE id = ? LIMIT 1', [
        result.insertId,
      ]);
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Update pago
router.patch(
  '/pagos/:pagoId',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.pagoId;
      const fields = [
        'fecha',
        'monto',
        'medio',
        'referencia',
        'estado',
        'comprobante_num',
      ];
      const updates = [];
      const values = [];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
      if (!updates.length) return res.status(400).json({ error: 'no fields' });
      values.push(id);
      await db.query(
        `UPDATE pago SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query('SELECT * FROM pago WHERE id = ? LIMIT 1', [
        id,
      ]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Delete pago
router.delete(
  '/pagos/:pagoId',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.pagoId;
      await db.query('DELETE FROM pago WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Create pago_aplicacion
router.post(
  '/pagos/:pagoId/aplicaciones',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('cuenta_cobro_unidad_id').isInt(),
    body('monto').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const pagoId = req.params.pagoId;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { cuenta_cobro_unidad_id, monto, prioridad = 1 } = req.body;
      const [result] = await db.query(
        'INSERT INTO pago_aplicacion (pago_id, cuenta_cobro_unidad_id, monto, prioridad) VALUES (?,?,?,?)',
        [pagoId, cuenta_cobro_unidad_id, monto, prioridad]
      );
      const [row] = await db.query(
        'SELECT * FROM pago_aplicacion WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Delete pago_aplicacion
router.delete(
  '/pago_aplicaciones/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      await db.query('DELETE FROM pago_aplicacion WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Medidor CRUD
router.post(
  '/:id/medidores',
  [authenticate, authorize('admin', 'superadmin'), body('tipo').notEmpty()],
  async (req, res) => {
    try {
      const unidadId = req.params.id;
      const { tipo, codigo, es_compartido } = req.body;
      const [result] = await db.query(
        'INSERT INTO medidor (unidad_id, tipo, codigo, es_compartido) VALUES (?,?,?,?)',
        [unidadId, tipo, codigo || null, es_compartido ? 1 : 0]
      );
      const [row] = await db.query(
        'SELECT * FROM medidor WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.patch(
  '/medidores/:medidorId',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.medidorId;
      const fields = ['tipo', 'codigo', 'es_compartido', 'unidad_id'];
      const updates = [];
      const values = [];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
      if (!updates.length) return res.status(400).json({ error: 'no fields' });
      values.push(id);
      await db.query(
        `UPDATE medidor SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM medidor WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.delete(
  '/medidores/:medidorId',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.medidorId;
      await db.query('DELETE FROM medidor WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Crear lectura
router.post(
  '/medidores/:medidorId/lecturas',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('lectura').isNumeric(),
    body('periodo').notEmpty(),
  ],
  async (req, res) => {
    const medidorId = req.params.medidorId;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { periodo, fecha, lectura } = req.body;
      const [result] = await db.query(
        'INSERT INTO lectura_medidor (medidor_id, periodo, fecha, lectura) VALUES (?,?,?,?)',
        [medidorId, periodo, fecha || new Date(), lectura]
      );
      const [row] = await db.query(
        'SELECT * FROM lectura_medidor WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Multa CRUD
router.post(
  '/:id/multas',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('motivo').notEmpty(),
    body('monto').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const unidadId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { motivo, descripcion, monto, persona_id } = req.body;
      const [result] = await db.query(
        'INSERT INTO multa (unidad_id, motivo, descripcion, monto, persona_id) VALUES (?,?,?,?,?)',
        [unidadId, motivo, descripcion || null, monto, persona_id || null]
      );
      const [row] = await db.query('SELECT * FROM multa WHERE id = ? LIMIT 1', [
        result.insertId,
      ]);
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.patch(
  '/multas/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      const fields = ['motivo', 'descripcion', 'monto', 'persona_id'];
      const updates = [];
      const values = [];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
      if (!updates.length) return res.status(400).json({ error: 'no fields' });
      values.push(id);
      await db.query(
        `UPDATE multa SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM multa WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.delete(
  '/multas/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      await db.query('DELETE FROM multa WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Reserva CRUD
router.post(
  '/:id/reservas',
  [
    authenticate,
    body('amenidad_id').isInt(),
    body('inicio').notEmpty(),
    body('fin').notEmpty(),
  ],
  async (req, res) => {
    const unidadId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { amenidad_id, inicio, fin, estado = 'pendiente' } = req.body;
      const [result] = await db.query(
        'INSERT INTO reserva_amenidad (unidad_id, amenidad_id, inicio, fin, estado) VALUES (?,?,?,?,?)',
        [unidadId, amenidad_id, inicio, fin, estado]
      );
      const [row] = await db.query(
        'SELECT * FROM reserva_amenidad WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.patch(
  '/reservas/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      const fields = ['amenidad_id', 'inicio', 'fin', 'estado'];
      const updates = [];
      const values = [];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
      if (!updates.length) return res.status(400).json({ error: 'no fields' });
      values.push(id);
      await db.query(
        `UPDATE reserva_amenidad SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM reserva_amenidad WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.delete(
  '/reservas/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      await db.query('DELETE FROM reserva_amenidad WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Ticket CRUD
router.post(
  '/:id/tickets',
  [authenticate, body('categoria').notEmpty(), body('titulo').notEmpty()],
  async (req, res) => {
    const unidadId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { categoria, titulo, descripcion, prioridad = 'media' } = req.body;
      const [result] = await db.query(
        'INSERT INTO ticket_soporte (unidad_id, categoria, titulo, descripcion, prioridad, estado) VALUES (?,?,?,?,?,?)',
        [unidadId, categoria, titulo, descripcion || null, prioridad, 'abierto']
      );
      const [row] = await db.query(
        'SELECT * FROM ticket_soporte WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.patch(
  '/tickets/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      const fields = [
        'categoria',
        'titulo',
        'descripcion',
        'prioridad',
        'estado',
        'asignado_a',
      ];
      const updates = [];
      const values = [];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });
      if (!updates.length) return res.status(400).json({ error: 'no fields' });
      values.push(id);
      await db.query(
        `UPDATE ticket_soporte SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM ticket_soporte WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.delete(
  '/tickets/:id',
  [authenticate, authorize('admin', 'superadmin')],
  async (req, res) => {
    try {
      const id = req.params.id;
      await db.query('DELETE FROM ticket_soporte WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// Cuentas basic create + añadir detalle
router.post(
  '/:id/cuentas',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('monto_total').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const unidadId = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { emision_id, monto_total, estado = 'emitida' } = req.body;
      const [result] = await db.query(
        'INSERT INTO cuenta_cobro_unidad (unidad_id, emision_id, comunidad_id, monto_total, saldo, estado) VALUES (?,?,?,?,?,?)',
        [unidadId, emision_id || null, null, monto_total, monto_total, estado]
      );
      const [row] = await db.query(
        'SELECT * FROM cuenta_cobro_unidad WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

router.post(
  '/cuentas/:cuentaId/detalle',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('categoria_id').isInt(),
    body('monto').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const cuentaId = req.params.cuentaId;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const { categoria_id, glosa, monto, origen, origen_id, iva_incluido } =
        req.body;
      const [result] = await db.query(
        'INSERT INTO detalle_cuenta_unidad (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, origen_id, iva_incluido) VALUES (?,?,?,?,?,?,?)',
        [
          cuentaId,
          categoria_id,
          glosa || null,
          monto,
          origen || null,
          origen_id || null,
          iva_incluido ? 1 : 0,
        ]
      );
      const [row] = await db.query(
        'SELECT * FROM detalle_cuenta_unidad WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// =========================================
// ENDPOINTS DE UNIDADES
// =========================================

// // LISTADOS, FILTROS Y BÚSQUEDA
// GET: /unidades/comunidad/:comunidadId
// GET: /unidades
// GET: /unidades/:id/residentes
// GET: /unidades/search
// GET: /unidades/validate/bodega
// GET: /unidades/validate/estacionamiento

// // VISTAS DETALLADAS Y FINANCIERAS
// GET: /unidades/:id
// GET: /unidades/:id/summary
// GET: /unidades/:id/cuentas
// GET: /unidades/cuentas/:cuentaId/detalle
// GET: /unidades/:id/cuentas_full
// GET: /unidades/:id/pagos
// GET: /unidades/cuentas/:cuentaId/aplicaciones
// GET: /unidades/:id/financiero
// GET: /unidades/:id/medidores
// GET: /unidades/medidores/:medidorId/lecturas
// GET: /unidades/:id/tickets
// GET: /unidades/:id/multas
// GET: /unidades/:id/reservas

// // CRUD BÁSICO
// POST: /unidades/comunidad/:comunidadId
// PATCH: /unidades/:id
// DELETE: /unidades/:id

// // CRUD DE TENENCIAS (TITULARIDADES)
// GET: /unidades/:id/tenencias
// POST: /unidades/:id/tenencias
// PATCH: /unidades/tenencias/:tenenciaId
// DELETE: /unidades/tenencias/:tenenciaId

// // CRUD DE PAGOS ASOCIADOS A UNIDAD
// POST: /unidades/:id/pagos
// PATCH: /unidades/pagos/:pagoId
// DELETE: /unidades/pagos/:pagoId
// POST: /unidades/pagos/:pagoId/aplicaciones
// DELETE: /unidades/pago_aplicaciones/:id

// // CRUD DE MEDIDORES ASOCIADOS A UNIDAD
// POST: /unidades/:id/medidores
// PATCH: /unidades/medidores/:medidorId
// DELETE: /unidades/medidores/:medidorId
// POST: /unidades/medidores/:medidorId/lecturas

// // CRUD DE MULTAS ASOCIADAS A UNIDAD (Stubbed routes for unit-context)
// POST: /unidades/:id/multas
// PATCH: /unidades/multas/:id
// DELETE: /unidades/multas/:id

// // CRUD DE RESERVAS ASOCIADAS A UNIDAD (Stubbed routes for unit-context)
// POST: /unidades/:id/reservas
// PATCH: /unidades/reservas/:id
// DELETE: /unidades/reservas/:id

// // CRUD DE TICKETS ASOCIADOS A UNIDAD (Stubbed routes for unit-context)
// POST: /unidades/:id/tickets
// PATCH: /unidades/tickets/:id
// DELETE: /unidades/tickets/:id

// // CRUD DE CUENTAS DE COBRO (Cargos)
// POST: /unidades/:id/cuentas
// POST: /unidades/cuentas/:cuentaId/detalle

// // REPORTES
// GET: /unidades/report/saldos

// // DROPDOWNS
// GET: /unidades/dropdowns/comunidades
// GET: /unidades/dropdowns/edificios
// GET: /unidades/dropdowns/torres
// GET: /unidades/dropdowns/unidades
