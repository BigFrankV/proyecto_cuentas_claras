const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @swagger
 * tags:
 *   - name: Medidores
 *     description: Gestión de medidores, lecturas y consumos
 */

/**
 * Helper: verifica existencia y tenancy / permisos básicos
 * Retorna: { exists, allowed, comunidadId, activo, isBasicRole, userRole, unidadId }
 */
async function medidorAccessCheck(user, medidorId) {
  try {
    const [mrows] = await db.query(
      'SELECT m.comunidad_id, m.activo, m.unidad_id FROM medidor m WHERE m.id = ? LIMIT 1',
      [medidorId]
    );
    if (!mrows.length) return { exists: false };
    const comunidadId = mrows[0].comunidad_id;
    const activo = mrows[0].activo;
    const unidadId = mrows[0].unidad_id;

    // DEBUG: log user info to help tracking permisos
    console.log('medidorAccessCheck user debug:', {
      userId: user?.id,
      persona_id: user?.persona_id,
      is_superadmin: user?.is_superadmin,
    });

    // SuperAdmin: acceso total
    if (user?.is_superadmin)
      return { exists: true, allowed: true, comunidadId, activo, isBasicRole: false, userRole: 'superadmin', unidadId };

    // Verificar membresía y obtener rol
    const [chk] = await db.query(
      `SELECT umc.id, umc.rol as rol_codigo
       FROM usuario_miembro_comunidad umc
       WHERE umc.persona_id = ? AND umc.comunidad_id = ? AND umc.activo = 1 
       LIMIT 1`,
      [user.persona_id, comunidadId]
    );
    
    if (!chk.length) {
      return { exists: true, allowed: false, comunidadId, activo, isBasicRole: false, userRole: null, unidadId };
    }

    const userRole = chk[0].rol_codigo;
    const isBasicRole = ['residente', 'propietario', 'inquilino'].includes(userRole);

    // Si es rol básico, verificar que el medidor pertenezca a una unidad del usuario
    if (isBasicRole) {
      const [unidadCheck] = await db.query(
        `SELECT 1 FROM titulares_unidad tu
         WHERE tu.persona_id = ? AND tu.unidad_id = ? 
         AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
         LIMIT 1`,
        [user.persona_id, unidadId]
      );
      
      const allowed = !!unidadCheck.length;
      return { exists: true, allowed, comunidadId, activo, isBasicRole, userRole, unidadId };
    }

    // Admin comunidad o roles superiores: acceso permitido
    return { exists: true, allowed: true, comunidadId, activo, isBasicRole, userRole, unidadId };
  } catch (err) {
    console.error('medidorAccessCheck error:', err);
    return { exists: false };
  }
}

/**
 * GET /api/medidores/comunidad/:comunidadId
 * Lista desde vista_medidores con paginación y filtros básicos
 * PROTECCIÓN: Roles básicos solo ven medidores de sus unidades
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Number(req.query.limit || 20));
    const offset =
      typeof req.query.offset !== 'undefined'
        ? Number(req.query.offset)
        : (page - 1) * limit;
    const { search, tipo, unidad_id } = req.query;

    // tenancy check: si no es superadmin validar pertenencia y obtener rol
    let userRole = 'superadmin';
    let isBasicRole = false;

    if (!req.user?.is_superadmin) {
      const [check] = await db.query(
        `SELECT umc.rol as rol_codigo
         FROM usuario_miembro_comunidad umc
         WHERE umc.persona_id = ? AND umc.comunidad_id = ? AND umc.activo = 1
         LIMIT 1`,
        [req.user.persona_id, comunidadId]
      );
      if (!check.length)
        return res.json({
          data: [],
          pagination: { total: 0, limit, offset, pages: 0 },
        });
      
      userRole = check[0].rol_codigo;
      isBasicRole = ['residente', 'propietario', 'inquilino'].includes(userRole);
    }

    let where = ' WHERE comunidad_id = ? ';
    const params = [comunidadId];

    // FILTRO ADICIONAL: Roles básicos solo ven medidores de sus unidades
    if (isBasicRole) {
      where += ` AND unidad_id IN (
        SELECT tu.unidad_id FROM titulares_unidad tu
        WHERE tu.persona_id = ? 
        AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      )`;
      params.push(req.user.persona_id);
    }

    if (search) {
      where +=
        ' AND (medidor_codigo LIKE ? OR serial_number LIKE ? OR marca LIKE ? OR modelo LIKE ?) ';
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

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM vista_medidores ${where}`,
      params
    );
    const total = countRows[0]?.total ?? rows.length;

    res.json({
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
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
    if (!access.exists)
      return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed)
      return res.status(403).json({ error: 'No autorizado' });

    const [rows] = await db.query(
      'SELECT * FROM vista_medidores WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Medidor no encontrado' });

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
    if (!access.exists)
      return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed)
      return res.status(403).json({ error: 'No autorizado' });

    const limit = Math.min(1000, Number(req.query.limit || 200));
    const offset = Number(req.query.offset || 0);

    const [rows] = await db.query(
      'SELECT id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status FROM lectura_medidor WHERE medidor_id = ? ORDER BY fecha DESC, id DESC LIMIT ? OFFSET ?',
      [id, limit, offset]
    );

    const [countRows] = await db.query(
      'SELECT COUNT(*) AS total FROM lectura_medidor WHERE medidor_id = ?',
      [id]
    );
    const total = countRows[0]?.total ?? rows.length;

    res.json({
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error('GET /medidores/:id/lecturas error', err);
    res.status(500).json({ error: 'Error al listar lecturas' });
  }
});

/**
 * POST /api/medidores/:id/lecturas
 * Crear lectura (maneja duplicados por unique periodo)
 * BLOQUEADO para residente, propietario, inquilino
 */
router.post('/:id/lecturas', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const access = await medidorAccessCheck(req.user, id);
    if (!access.exists)
      return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed)
      return res.status(403).json({ error: 'No autorizado' });

    // BLOQUEAR ROLES BÁSICOS: solo lectura permitida
    if (access.isBasicRole) {
      return res.status(403).json({ 
        error: 'No tienes permisos para crear lecturas',
        message: 'Los roles de residente, propietario e inquilino solo pueden ver información'
      });
    }

    const {
      fecha,
      lectura,
      periodo,
      notes,
      reader_id,
      method,
      photo_url,
      status,
    } = req.body;
    if (!fecha || typeof lectura === 'undefined' || !periodo) {
      return res
        .status(400)
        .json({ error: 'Parámetros requeridos: fecha, lectura, periodo' });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO lectura_medidor (medidor_id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())',
        [
          id,
          fecha,
          lectura,
          periodo,
          reader_id || null,
          method || null,
          notes || null,
          photo_url || null,
          status || 'validated',
        ]
      );
      const [row] = await db.query(
        'SELECT id, fecha, lectura, periodo, reader_id, method, notes, photo_url, status FROM lectura_medidor WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      return res.status(201).json(row[0]);
    } catch (dbErr) {
      if (dbErr && dbErr.code === 'ER_DUP_ENTRY') {
        return res
          .status(409)
          .json({ error: 'Ya existe una lectura para ese periodo' });
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
    if (!access.exists)
      return res.status(404).json({ error: 'Medidor no encontrado' });
    if (!access.allowed)
      return res.status(403).json({ error: 'No autorizado' });

    let where = ' WHERE medidor_id = ? ';
    const params = [id];
    if (periodo) {
      where += ' AND periodo = ? ';
      params.push(periodo);
    }

    const [rows] = await db.query(
      `SELECT * FROM vista_consumos ${where} ORDER BY periodo DESC`,
      params
    );
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
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const access = await medidorAccessCheck(req.user, id);
      if (!access.exists)
        return res.status(404).json({ error: 'Medidor no encontrado' });
      if (!access.allowed && !req.user?.is_superadmin)
        return res.status(403).json({ error: 'No autorizado' });

      const [lec] = await db.query(
        'SELECT COUNT(*) AS cnt FROM lectura_medidor WHERE medidor_id = ?',
        [id]
      );
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
  }
);

// NEW: GET /api/medidores  (global) - comportamiento similar a /gastos
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /medidores - user:', {
      id: req.user?.id,
      persona_id: req.user?.persona_id,
      is_superadmin: req.user?.is_superadmin,
      roles: req.user?.roles,
    });

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(200, Number(req.query.limit || 100));
    const offset =
      typeof req.query.offset !== 'undefined'
        ? Number(req.query.offset)
        : (page - 1) * limit;
    const { search, tipo, comunidad_id } = req.query;

    let where = ' WHERE 1=1 ';
    const params = [];

    // Determinar comunidades permitidas para el usuario
    let allowedComunidadIds = [];

    if (req.user?.is_superadmin) {
      // SuperAdmin: si se pide comunidad_id específica, usar esa; sino, todas
      if (comunidad_id) {
        allowedComunidadIds = [Number(comunidad_id)];
      }
      // Si no se pide comunidad_id específica, no filtrar (ver todas)
    } else {
      // Usuario normal: obtener sus comunidades asignadas
      const personaId = req.user?.persona_id;
      console.log('🔍 Resolviendo comunidades para persona_id=', personaId);

      try {
        const [r] = await db.query(
          `SELECT comunidad_id FROM usuario_miembro_comunidad 
           WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
          [personaId]
        );
        allowedComunidadIds = (r || []).map((row) => row.comunidad_id).filter(Boolean);
        console.log('✅ Comunidades desde usuario_miembro_comunidad:', allowedComunidadIds);
      } catch (err) {
        console.error('❌ Error leyendo usuario_miembro_comunidad:', err);
      }

      // Fallback: buscar usuario.id y leer usuario_rol_comunidad
      if (!allowedComunidadIds.length) {
        try {
          const [urows] = await db.query(
            'SELECT id FROM usuario WHERE persona_id = ? LIMIT 1',
            [personaId]
          );
          if (urows && urows.length) {
            const usuarioId = urows[0].id;
            const [r2] = await db.query(
              'SELECT comunidad_id FROM usuario_rol_comunidad WHERE usuario_id = ? AND activo = 1',
              [usuarioId]
            );
            allowedComunidadIds = (r2 || []).map((row) => row.comunidad_id).filter(Boolean);
            console.log('✅ Comunidades desde usuario_rol_comunidad (usuario_id=' + usuarioId + '):', allowedComunidadIds);
          }
        } catch (err) {
          console.error('❌ Error leyendo usuario_rol_comunidad fallback:', err);
        }
      }

      console.log('📋 Comunidades permitidas totales:', allowedComunidadIds);

      if (!allowedComunidadIds.length) {
        console.log('⚠️ Usuario sin membresías activas - devolver vacío');
        return res.json({
          data: [],
          pagination: { total: 0, limit, offset, pages: 0 },
        });
      }

      // Si se pide comunidad_id específica, validar que esté en las permitidas
      if (comunidad_id) {
        const requestedId = Number(comunidad_id);
        if (allowedComunidadIds.includes(requestedId)) {
          console.log('✅ Filtro comunidad_id válido:', requestedId);
          allowedComunidadIds = [requestedId];
        } else {
          console.log('⛔ Comunidad solicitada no permitida:', requestedId, 'permitidas:', allowedComunidadIds);
          return res.json({
            data: [],
            pagination: { total: 0, limit, offset, pages: 0 },
          });
        }
      }
    }

    // Aplicar filtro de comunidades si corresponde
    if (allowedComunidadIds.length > 0) {
      where += ` AND comunidad_id IN (${allowedComunidadIds.map(() => '?').join(',')}) `;
      params.push(...allowedComunidadIds);
      console.log('🔒 Filtro aplicado - comunidades:', allowedComunidadIds);
    }

    // PROTECCIÓN ADICIONAL: Si usuario tiene rol básico, filtrar por sus unidades
    if (!req.user?.is_superadmin && allowedComunidadIds.length > 0) {
      // Verificar si tiene rol básico en alguna de las comunidades
      const [roleCheck] = await db.query(
        `SELECT DISTINCT umc.rol as rol_codigo
         FROM usuario_miembro_comunidad umc
         WHERE umc.persona_id = ? AND umc.comunidad_id IN (${allowedComunidadIds.map(() => '?').join(',')})
         AND umc.activo = 1`,
        [req.user.persona_id, ...allowedComunidadIds]
      );

      const roles = roleCheck.map(r => r.rol_codigo);
      const isBasicRole = roles.some(r => ['residente', 'propietario', 'inquilino'].includes(r));

      if (isBasicRole) {
        console.log('👤 Usuario con rol básico - filtrando por unidades propias');
        // Filtrar solo medidores de unidades donde el usuario es titular
        where += ` AND unidad_id IN (
          SELECT unidad_id FROM titulares_unidad 
          WHERE persona_id = ? AND (hasta IS NULL OR hasta >= CURDATE())
        )`;
        params.push(req.user.persona_id);
      }
    }

    if (search) {
      where +=
        ' AND (medidor_codigo LIKE ? OR serial_number LIKE ? OR marca LIKE ? OR modelo LIKE ?) ';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (tipo) {
      where += ' AND tipo = ? ';
      params.push(tipo);
    }

    const sql = `SELECT * FROM vista_medidores ${where} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(sql, [...params, limit, offset]);

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM vista_medidores ${where}`,
      params
    );
    const total = countRows[0]?.total ?? rows.length;

    res.json({
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error('GET /medidores error', err);
    res.status(500).json({ error: 'Error al listar medidores' });
  }
});

// =========================================
// CRUD OPERATIONS - POST/PUT
// =========================================

/**
 * @swagger
 * /medidores:
 *   post:
 *     tags: [Medidores]
 *     summary: Crear nuevo medidor
 *     description: Crea un nuevo medidor para una unidad. BLOQUEADO para residente, propietario, inquilino
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unidad_id, tipo, numero_medidor]
 *             properties:
 *               unidad_id:
 *                 type: integer
 *                 description: ID de la unidad
 *               tipo:
 *                 type: string
 *                 enum: [agua, gas, electricidad, otro]
 *                 description: Tipo de medidor
 *               codigo:
 *                 type: string
 *                 description: Número único del medidor
 *               serial_number:
 *                 type: string
 *                 description: Número de serie
 *               marca:
 *                 type: string
 *                 description: Marca del medidor
 *               modelo:
 *                 type: string
 *                 description: Modelo del medidor
 *               ubicacion:
 *                 type: string
 *                 description: Ubicación del medidor
 *     responses:
 *       201:
 *         description: Medidor creado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado - rol básico intentando crear
 *       409:
 *         description: Medidor duplicado
 *       500:
 *         description: Error servidor
 */
router.post(
  '/',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'administrador', 'tesorero', 'presidente_comite', 'conserje', 'contador'),
    body('unidad_id').isInt({ min: 1 }).withMessage('unidad_id requerido'),
    body('tipo')
      .isIn(['agua', 'gas', 'electricidad', 'otro'])
      .withMessage('tipo inválido'),
    body('codigo').notEmpty().withMessage('codigo requerido').trim(),
    body('serial_number').optional().trim(),
    body('marca').optional().trim(),
    body('modelo').optional().trim(),
    body('ubicacion').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        unidad_id,
        tipo,
        codigo,
        serial_number,
        marca,
        modelo,
        ubicacion,
      } = req.body;

      // Verificar que la unidad existe
      const [unidad] = await db.query(
        'SELECT id, comunidad_id FROM unidad WHERE id = ?',
        [unidad_id]
      );
      if (!unidad.length) {
        return res.status(404).json({ error: 'Unidad no encontrada' });
      }

      // Verificar que no exista un medidor con el mismo número
      const [duplicate] = await db.query(
        'SELECT id FROM medidor WHERE codigo = ? AND unidad_id = ?',
        [codigo, unidad_id]
      );
      if (duplicate.length) {
        return res.status(409).json({
          error: 'Ya existe un medidor con ese número en esta unidad',
        });
      }

      // En POST /, después de verificar la unidad:
      const comunidad_id = unidad[0].comunidad_id;

      // Insertar medidor
      const [result] = await db.query(
        `INSERT INTO medidor (comunidad_id, unidad_id, tipo, codigo, serial_number, marca, modelo, ubicacion, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          comunidad_id,
          unidad_id,
          tipo,
          codigo,
          serial_number || null,
          marca || null,
          modelo || null,
          ubicacion ? JSON.stringify(ubicacion) : null,
        ]
      );

      // Obtener el medidor creado
      const [medidor] = await db.query('SELECT * FROM medidor WHERE id = ?', [
        result.insertId,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address)
         VALUES (?, 'INSERT', 'medidor', ?, ?, ?)`,
        [req.user.id, result.insertId, JSON.stringify(medidor[0]), req.ip]
      );

      res.status(201).json(medidor[0]);
    } catch (err) {
      console.error('Error al crear medidor:', err);
      res.status(500).json({ error: 'Error al crear medidor' });
    }
  }
);

/**
 * @swagger
 * /medidores/{id}:
 *   put:
 *     tags: [Medidores]
 *     summary: Actualizar medidor existente
 *     description: Actualiza los datos de un medidor existente. BLOQUEADO para residente, propietario, inquilino
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serial_number:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *               codigo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medidor actualizado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado - rol básico intentando editar
 *       404:
 *         description: Medidor no encontrado
 *       500:
 *         description: Error servidor
 */
router.put(
  '/:id',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'administrador', 'tesorero', 'presidente_comite', 'conserje', 'contador'),
    body('serial_number').optional().trim(),
    body('marca').optional().trim(),
    body('modelo').optional().trim(),
    body('ubicacion').optional().trim(),
    body('codigo').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const medidorId = Number(req.params.id);

      // Obtener medidor anterior
      const [medidorAnterior] = await db.query(
        'SELECT * FROM medidor WHERE id = ?',
        [medidorId]
      );
      if (!medidorAnterior.length) {
        return res.status(404).json({ error: 'Medidor no encontrado' });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.serial_number !== undefined) {
        campos.push('serial_number = ?');
        valores.push(req.body.serial_number || null);
      }
      if (req.body.marca !== undefined) {
        campos.push('marca = ?');
        valores.push(req.body.marca || null);
      }
      if (req.body.modelo !== undefined) {
        campos.push('modelo = ?');
        valores.push(req.body.modelo || null);
      }
      if (req.body.ubicacion !== undefined) {
        campos.push('ubicacion = ?');
        valores.push(
          req.body.ubicacion ? JSON.stringify(req.body.ubicacion) : null
        );
      }
      if (req.body.codigo !== undefined) {
        campos.push('codigo = ?');
        valores.push(req.body.codigo);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(medidorId);

      // Ejecutar actualización
      await db.query(
        `UPDATE medidor SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener medidor actualizado
      const [medidorActualizado] = await db.query(
        'SELECT * FROM medidor WHERE id = ?',
        [medidorId]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'medidor', ?, ?, ?, ?)`,
        [
          req.user.id,
          medidorId,
          JSON.stringify(medidorAnterior[0]),
          JSON.stringify(medidorActualizado[0]),
          req.ip,
        ]
      );

      res.json(medidorActualizado[0]);
    } catch (err) {
      console.error('Error al actualizar medidor:', err);
      res.status(500).json({ error: 'Error al actualizar medidor' });
    }
  }
);

module.exports = router;
