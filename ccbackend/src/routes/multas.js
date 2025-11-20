const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const MultasPermissions = require('../middleware/multasPermissions');

/**
 * @swagger
 * tags:
 *   - name: Multas
 *     description: Gestión de multas, infracciones y apelaciones
 */

// ============================================
// HELPER: Obtener comunidades del usuario
// ============================================
async function obtenerComunidadesUsuario(
  usuarioId,
  personaId,
  isSuperAdmin = false
) {
  if (isSuperAdmin) {
    // La tabla comunidad no tiene columna "activo" -> devolver todas las comunidades
    const [all] = await db.query(`SELECT id FROM comunidad`);
    return Array.isArray(all) ? all.map((r) => Number(r.id)) : [];
  }

  // por rol en usuario_rol_comunidad (mantener filtro de activo y vigencia aquí)
  const [porRol] = await db.query(
    `SELECT DISTINCT comunidad_id
     FROM usuario_rol_comunidad
     WHERE usuario_id = ?
       AND activo = 1
       AND (desde <= CURDATE())
       AND (hasta IS NULL OR hasta >= CURDATE())`,
    [usuarioId]
  );

  // por pertenencia como miembro (vista usuario_miembro_comunidad)
  const [porMiembro] = await db.query(
    `SELECT DISTINCT comunidad_id
     FROM usuario_miembro_comunidad
     WHERE persona_id = ?
       AND activo = 1
       AND (desde <= CURDATE())
       AND (hasta IS NULL OR hasta >= CURDATE())`,
    [personaId]
  );

  const ids = new Set();
  porRol.forEach((r) => ids.add(Number(r.comunidad_id)));
  porMiembro.forEach((r) => ids.add(Number(r.comunidad_id)));
  return Array.from(ids);
}

// ============================================
// HELPER: Registrar en historial
// ============================================
async function registrarHistorial(
  multaId,
  usuarioId,
  accion,
  descripcion,
  extras = {}
) {
  try {
    await db.query(
      `
      INSERT INTO multa_historial (
        multa_id, usuario_id, accion, estado_anterior, estado_nuevo, 
        campo_modificado, valor_anterior, valor_nuevo, descripcion, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        multaId,
        usuarioId,
        accion,
        extras.estado_anterior || null,
        extras.estado_nuevo || null,
        extras.campo_modificado || null,
        extras.valor_anterior ? JSON.stringify(extras.valor_anterior) : null,
        extras.valor_nuevo ? JSON.stringify(extras.valor_nuevo) : null,
        descripcion,
        extras.ip_address || null,
      ]
    );
    console.log(`📝 Historial registrado: ${accion} para multa ${multaId}`);
  } catch (error) {
    console.error('❌ Error registrando historial:', error);
  }
}

// ============================================
// HELPER: Generar número de multa  (mejorado: usa MAX para evitar saltos)
// ============================================
async function generarNumeroMulta(comunidadId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const year = new Date().getFullYear();
    const likePattern = `M-${year}-%`;

    // Bloquear y ordenar por el número numérico para obtener el último
    const [lastRows] = await connection.query(
      `SELECT numero
       FROM multa
       WHERE comunidad_id = ? AND numero LIKE ?
       ORDER BY CAST(SUBSTRING_INDEX(numero, '-', -1) AS UNSIGNED) DESC
       LIMIT 1
       FOR UPDATE`, // Bloquea para evitar lecturas simultáneas
      [comunidadId, likePattern]
    );

    let nextNum = 1;
    if (lastRows && lastRows.length) {
      const last = lastRows[0].numero;
      const m = last.match(/M-\d{4}-(\d+)/);
      nextNum = m ? Number(m[1]) + 1 : 1;
    }

    const numero = `M-${year}-${String(nextNum).padStart(4, '0')}`;
    await connection.commit();
    return numero;
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error generando número:', err);
    throw err;
  } finally {
    connection.release();
  }
}

// ============================================
// HELPER: Resolver id o numero (M-2025-0001)
// ============================================
async function resolveMultaId(idOrNumero) {
  if (!idOrNumero) return null;
  if (!isNaN(Number(idOrNumero))) return Number(idOrNumero);
  try {
    const [rows] = await db.query(
      'SELECT id FROM multa WHERE numero = ? LIMIT 1',
      [idOrNumero]
    );
    if (!rows.length) return null;
    return rows[0].id;
  } catch (e) {
    console.error('❌ Error resolviendo multa por numero:', e);
    return null;
  }
}

// ============================================
// GET /multas - LISTAR MULTAS
// ============================================
router.get(
  '/',
  authenticate,
  MultasPermissions.canView,
  [
    query('estado')
      .optional()
      .isIn(['pendiente', 'pagado', 'vencido', 'apelada', 'anulada']),
    query('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
  ],
  async (req, res) => {
    try {
      const {
        estado,
        prioridad,
        unidad_id,
        search,
        page = 1,
        limit = 50,
      } = req.query;
      const offset = (page - 1) * limit;

      console.log(
        '🔍 GET /multas - Usuario:',
        req.user?.username,
        'ID:',
        req.user?.sub
      );

      let sql = `
         SELECT 
           m.*,
           m.motivo as tipo_infraccion,
           m.fecha as fecha_infraccion,
           u.codigo as unidad_numero,
           t.nombre as torre_nombre,
           e.nombre as edificio_nombre,
           c.razon_social as comunidad_nombre,
           CONCAT(p.nombres, ' ', p.apellidos) as propietario_nombre,
           p.email as propietario_email,
           anulador.username as anulado_por_username
         FROM multa m
         LEFT JOIN unidad u ON m.unidad_id = u.id
         LEFT JOIN torre t ON u.torre_id = t.id
         LEFT JOIN edificio e ON u.edificio_id = e.id
         LEFT JOIN comunidad c ON m.comunidad_id = c.id
         LEFT JOIN persona p ON m.persona_id = p.id
         LEFT JOIN usuario anulador ON m.anulado_por = anulador.id
         WHERE 1=1
       `;

      const params = [];

      if (req.viewOnlyOwn && req.user.persona_id) {
        // Usuario solo ve sus propias multas
        sql += ' AND m.persona_id = ?';
        params.push(req.user.persona_id);
        console.log(
          `🔒 Filtro aplicado: solo multas de persona_id=${req.user.persona_id}`
        );
      } else if (!req.user?.is_superadmin) {
        // Cargar comunidades desde BD
        const comunidadIds = await obtenerComunidadesUsuario(
          req.user.sub,
          req.user.persona_id,
          req.user.is_superadmin
        );

        console.log(`🏘️ Comunidades del usuario:`, comunidadIds);

        if (comunidadIds.length === 0) {
          console.log('⚠️ Usuario sin comunidades asignadas');
          return res.status(403).json({
            success: false,
            error: 'Sin permisos para ver multas (sin comunidades asignadas)',
          });
        }

        const placeholders = comunidadIds.map(() => '?').join(',');
        sql += ` AND m.comunidad_id IN (${placeholders})`;
        params.push(...comunidadIds);
      } else {
        console.log('👑 Usuario superadmin - ve todas las multas');
      }

      // Filtros adicionales
      if (estado && estado !== 'all') {
        sql += ' AND m.estado = ?';
        params.push(estado);
      }

      if (prioridad) {
        sql += ' AND m.prioridad = ?';
        params.push(prioridad);
      }

      if (unidad_id) {
        sql += ' AND m.unidad_id = ?';
        params.push(unidad_id);
      }

      if (search) {
        const s = `%${search}%`;
        sql +=
          ' AND (u.codigo LIKE ? OR m.motivo LIKE ? OR CONCAT(p.nombres, " ", p.apellidos) LIKE ?)';
        params.push(s, s, s);
      }

      // Total count
      const countQuery = sql.replace(
        /SELECT[\s\S]*?FROM/i,
        'SELECT COUNT(*) as total FROM'
      );
      const [countResult] = await db.query(countQuery, params);
      const total = countResult[0].total;

      console.log(`📊 Total de multas encontradas: ${total}`);

      // Paginación
      sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await db.query(sql, params);

      console.log('🔍 SQL ejecutado:', sql);
      console.log('📊 Parámetros:', params);
      console.log('📊 Filas encontradas:', rows.length);

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('❌ Error en GET /multas:', error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message,
      });
    }
  }
);

// ============================================
// GET /multas/estadisticas - ESTADÍSTICAS
// ============================================
router.get(
  '/estadisticas',
  authenticate,
  MultasPermissions.canView,
  async (req, res) => {
    try {
      console.log('📊 GET /multas/estadisticas - Usuario:', req.user?.username);

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (req.viewOnlyOwn && req.user.persona_id) {
        whereClause += ' AND persona_id = ?';
        params.push(req.user.persona_id);
      } else if (!req.user?.is_superadmin) {
        const comunidadIds = await obtenerComunidadesUsuario(
          req.user.sub,
          req.user.persona_id,
          req.user.is_superadmin
        );

        if (comunidadIds.length === 0) {
          return res
            .status(403)
            .json({ success: false, error: 'Sin permisos' });
        }

        const placeholders = comunidadIds.map(() => '?').join(',');
        whereClause += ` AND comunidad_id IN (${placeholders})`;
        params.push(...comunidadIds);
      }

      if (req.query.comunidad_id) {
        whereClause += ' AND comunidad_id = ?';
        params.push(req.query.comunidad_id);
      }

      const [stats] = await db.query(
        `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'pagado' THEN 1 END) as pagadas,
          COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as vencidas,
          COUNT(CASE WHEN estado = 'apelada' THEN 1 END) as apeladas,
          COUNT(CASE WHEN estado = 'anulada' THEN 1 END) as anuladas,
          COUNT(CASE WHEN prioridad = 'baja' THEN 1 END) as prioridad_baja,
          COUNT(CASE WHEN prioridad = 'media' THEN 1 END) as prioridad_media,
          COUNT(CASE WHEN prioridad = 'alta' THEN 1 END) as prioridad_alta,
          COUNT(CASE WHEN prioridad = 'critica' THEN 1 END) as prioridad_critica,
          COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN monto ELSE 0 END), 0) as monto_pendiente,
          COALESCE(SUM(CASE WHEN estado = 'vencido' THEN monto ELSE 0 END), 0) as monto_vencido,
          COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as monto_recaudado,
          COALESCE(SUM(monto), 0) as monto_total
        FROM multa 
        ${whereClause}
      `,
        params
      );

      const estadisticas = {
        total: stats[0].total,
        pendientes: stats[0].pendientes,
        pagadas: stats[0].pagadas,
        vencidas: stats[0].vencidas,
        apeladas: stats[0].apeladas,
        anuladas: stats[0].anuladas,
        prioridad: {
          baja: stats[0].prioridad_baja,
          media: stats[0].prioridad_media,
          alta: stats[0].prioridad_alta,
          critica: stats[0].prioridad_critica,
        },
        montos: {
          total: parseFloat(stats[0].monto_total || 0),
          pendiente: parseFloat(stats[0].monto_pendiente || 0),
          vencido: parseFloat(stats[0].monto_vencido || 0),
          recaudado: parseFloat(stats[0].monto_recaudado || 0),
        },
      };

      console.log('✅ Estadísticas calculadas:', estadisticas);
      res.json({ success: true, data: estadisticas });
    } catch (error) {
      console.error('❌ Error en estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message,
      });
    }
  }
);

// ============================================
// POST /multas - CREAR MULTA
// ============================================
router.post(
  '/',
  authenticate,
  MultasPermissions.canCreate,
  [
    body('unidad_id')
      .notEmpty()
      .isInt()
      .withMessage('unidad_id es requerido y debe ser un número'),
    body('tipo_infraccion')
      .notEmpty()
      .isLength({ min: 5, max: 120 })
      .withMessage('tipo_infraccion es requerido (5-120 caracteres)'),
    body('monto')
      .isFloat({ min: 0.01 })
      .withMessage('monto debe ser mayor a 0'),
    body('fecha_infraccion')
      .optional()
      .isISO8601()
      .withMessage('fecha_infraccion debe ser una fecha válida'),
    body('fecha_vencimiento')
      .optional()
      .isISO8601()
      .withMessage('fecha_vencimiento debe ser una fecha válida')
      .custom((fecha_venc, { req }) => {
        if (
          fecha_venc &&
          req.body.fecha_infraccion &&
          new Date(fecha_venc) <= new Date(req.body.fecha_infraccion)
        ) {
          throw new Error(
            'fecha_vencimiento debe ser mayor a fecha_infraccion'
          );
        }
        return true;
      }),
    body('prioridad')
      .optional()
      .isIn(['baja', 'media', 'alta', 'critica'])
      .withMessage('prioridad inválida'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array(),
      });
    }

    const {
      unidad_id,
      persona_id,
      tipo_infraccion,
      descripcion,
      monto,
      fecha_infraccion,
      fecha_vencimiento,
      prioridad = 'media',
    } = req.body;

    try {
      console.log('📝 POST /multas - Usuario:', req.user?.username);
      console.log('📝 Datos recibidos:', req.body);

      // Verificar unidad y obtener comunidad_id
      const [unidadRows] = await db.query(
        'SELECT id, comunidad_id FROM unidad WHERE id = ? LIMIT 1',
        [unidad_id]
      );

      if (!unidadRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Unidad no encontrada',
        });
      }

      const comunidad_id = unidadRows[0].comunidad_id;

      // Verificar permisos sobre la comunidad
      if (!req.user.is_superadmin) {
        const comunidadIds = await obtenerComunidadesUsuario(
          req.user.sub,
          req.user.persona_id,
          req.user.is_superadmin
        );

        if (!comunidadIds.includes(comunidad_id)) {
          return res.status(403).json({
            success: false,
            error: 'Sin permisos para crear multas en esta comunidad',
          });
        }
      }

      // Resolver tipo_infraccion_id (si existe tabla tipo_infraccion)
      let tipo_infraccion_id = null;
      try {
        if (req.body.tipo_infraccion_id) {
          tipo_infraccion_id = Number(req.body.tipo_infraccion_id);
        } else if (
          typeof tipo_infraccion === 'string' &&
          tipo_infraccion.trim()
        ) {
          const [tRows] = await db.query(
            `SELECT id FROM tipo_infraccion 
             WHERE (clave = ? OR nombre = ?) 
               AND (comunidad_id = ? OR comunidad_id IS NULL) 
               AND activo = 1
             LIMIT 1`,
            [tipo_infraccion, tipo_infraccion, comunidad_id]
          );
          if (tRows.length) tipo_infraccion_id = tRows[0].id;
        }
      } catch (err) {
        console.error('❌ Error buscando tipo_infraccion:', err);
      }

      // Intentar INSERT con reintentos en caso de conflicto en multa.numero
      let numeroGenerado = await generarNumeroMulta(comunidad_id);
      let insertResult = null;
      const maxRetries = 10000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `🔄 Intento ${attempt}/${maxRetries} con número: ${numeroGenerado}`
          );
          const [resInsert] = await db.query(
            `INSERT INTO multa (
              numero, comunidad_id, unidad_id, persona_id, motivo, descripcion, 
              monto, fecha, fecha_vencimiento, prioridad, tipo_infraccion_id, creada_por, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
            [
              numeroGenerado,
              comunidad_id,
              unidad_id,
              persona_id || null,
              tipo_infraccion,
              descripcion || null,
              monto,
              fecha_infraccion,
              fecha_vencimiento,
              prioridad,
              tipo_infraccion_id,
              req.user ? req.user.sub : null,
            ]
          );
          insertResult = resInsert;
          console.log(
            `✅ Multa creada exitosamente con número: ${numeroGenerado}`
          );
          break; // Salir del bucle si inserta correctamente
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY' && attempt < maxRetries) {
            console.warn(
              `⚠️ Conflicto número ${numeroGenerado}, reintentando con siguiente...`
            );
            // Incrementar el número en 1
            const m = numeroGenerado.match(/M-(\d{4})-(\d{4})/);
            if (m) {
              const year = m[1];
              const num = parseInt(m[2], 10) + 1;
              numeroGenerado = `M-${year}-${String(num).padStart(4, '0')}`;
            } else {
              // Fallback si no coincide
              numeroGenerado = await generarNumeroMulta(comunidad_id);
            }
          } else {
            console.error(`❌ Error en intento ${attempt}:`, err.message);
            throw err; // Re-lanzar si no es duplicado o se agotaron reintentos
          }
        }
      }

      if (!insertResult) {
        throw new Error(
          'No se pudo insertar multa: se agotaron los reintentos por conflicto en número.'
        );
      }

      const result = insertResult;

      // Registrar en historial
      await registrarHistorial(
        result.insertId,
        req.user.sub,
        'creada',
        `Multa ${numeroGenerado} creada`,
        {
          estado_nuevo: 'pendiente',
          ip_address: req.ip,
        }
      );

      // Obtener multa completa con JOINs
      const [rows] = await db.query(
        `
        SELECT 
          m.*,
          m.motivo as tipo_infraccion,
          m.fecha as fecha_infraccion,
          u.codigo as unidad_numero,
          c.razon_social as comunidad_nombre
        FROM multa m
        LEFT JOIN unidad u ON m.unidad_id = u.id
        LEFT JOIN comunidad c ON m.comunidad_id = c.id
        WHERE m.id = ?
      `,
        [result.insertId]
      );

      console.log('✅ Multa creada exitosamente:', rows[0].numero);

      res.status(201).json({
        success: true,
        data: rows[0],
        message: `Multa ${rows[0].numero} creada exitosamente`,
      });
    } catch (err) {
      console.error('❌ Error creando multa:', err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: err.message,
      });
    }
  }
);

// -------------------- NUEVO: mover AQUI --------------------
// GET /multas/tipos-infraccion
router.get('/tipos-infraccion', authenticate, async (req, res) => {
  try {
    const comunidadId = req.query.comunidadId
      ? Number(req.query.comunidadId)
      : null;
    const isSuperAdmin = !!req.user?.is_superadmin;
    const userId = req.user?.sub;
    const personaId = req.user?.persona_id;

    const comunidadIds = await obtenerComunidadesUsuario(
      userId,
      personaId,
      isSuperAdmin
    );

    if (comunidadId && !isSuperAdmin && !comunidadIds.includes(comunidadId)) {
      return res.status(403).json({
        success: false,
        error: 'Sin permisos para ver tipos en esta comunidad',
      });
    }

    let sql = `
      SELECT id, clave, nombre, descripcion, monto_default, prioridad_default, icono, comunidad_id, activo
      FROM tipo_infraccion
      WHERE activo = 1
    `;
    const params = [];

    if (comunidadId) {
      sql += ' AND (comunidad_id IS NULL OR comunidad_id = ?)';
      params.push(comunidadId);
    } else if (!isSuperAdmin) {
      if (comunidadIds.length > 0) {
        const placeholders = comunidadIds.map(() => '?').join(',');
        sql += ` AND (comunidad_id IS NULL OR comunidad_id IN (${placeholders}))`;
        params.push(...comunidadIds);
      } else {
        sql += ' AND comunidad_id IS NULL';
      }
    }

    sql += ' ORDER BY comunidad_id IS NULL DESC, nombre';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ Error GET /multas/tipos-infraccion:', err);
    res.status(500).json({
      success: false,
      error: 'Error del servidor',
      message: err.message,
    });
  }
});
// -------------------- FIN NUEVO --------------------

// ============================================
// GET /multas/:id - DETALLE DE MULTA
// ============================================
router.get(
  '/:id',
  authenticate,
  MultasPermissions.canView,
  param('id').notEmpty(),
  async (req, res) => {
    const idParam = req.params.id;
    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(`🔍 GET /multas/${id} - Usuario:`, req.user?.username);

      let query = `
        SELECT 
          m.*,
          m.motivo as tipo_infraccion,
          m.fecha as fecha_infraccion,
          u.codigo as unidad_numero,
          t.nombre as torre_nombre,
          e.nombre as edificio_nombre,
          c.razon_social as comunidad_nombre,
          CONCAT(p.nombres, ' ', p.apellidos) as propietario_nombre,
          p.email as propietario_email,
          p.telefono as propietario_telefono,
          anulador.username as anulado_por_username
        FROM multa m
        LEFT JOIN unidad u ON m.unidad_id = u.id
        LEFT JOIN torre t ON u.torre_id = t.id
        LEFT JOIN edificio e ON u.edificio_id = e.id
        LEFT JOIN comunidad c ON m.comunidad_id = c.id
        LEFT JOIN persona p ON m.persona_id = p.id
        LEFT JOIN usuario anulador ON m.anulado_por = anulador.id
        WHERE m.id = ?
      `;

      const params = [id];

      if (req.viewOnlyOwn && req.user.persona_id) {
        query += ' AND m.persona_id = ?';
        params.push(req.user.persona_id);
      }

      const [rows] = await db.query(query, params);

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada o sin permisos',
        });
      }

      console.log('✅ Multa encontrada:', rows[0].numero);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error(`❌ Error obteniendo multa ${idParam}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message,
      });
    }
  }
);

// ============================================
// PATCH /multas/:id - EDITAR MULTA
// ============================================
router.patch(
  '/:id',
  authenticate,
  MultasPermissions.canEdit,
  [
    param('id').notEmpty(),
    body('tipo_infraccion').optional().isLength({ min: 5, max: 120 }),
    body('monto').optional().isFloat({ min: 0.01 }),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']),
    body('fecha_infraccion').optional().isISO8601(),
    body('fecha_vencimiento').optional().isISO8601(),
  ],
  async (req, res) => {
    const idParam = req.params.id;
    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(`📝 PATCH /multas/${id} - Usuario:`, req.user?.username);
      console.log('📝 Datos recibidos:', req.body);

      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ? LIMIT 1',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada',
        });
      }

      const multaAnterior = existingRows[0];

      if (['pagado', 'anulada'].includes(multaAnterior.estado)) {
        return res.status(400).json({
          success: false,
          error: `No se puede editar una multa ${multaAnterior.estado}`,
        });
      }

      const fieldMapping = {
        tipo_infraccion: 'motivo',
        fecha_infraccion: 'fecha',
      };

      const allowedFields = [
        'tipo_infraccion',
        'descripcion',
        'monto',
        'prioridad',
        'fecha_infraccion',
        'fecha_vencimiento',
      ];

      const updates = [];
      const values = [];
      const cambios = [];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          const dbField = fieldMapping[field] || field;
          updates.push(`${dbField} = ?`);
          values.push(req.body[field]);
          cambios.push({
            campo: field,
            anterior: multaAnterior[dbField],
            nuevo: req.body[field],
          });
        }
      });

      if (!updates.length) {
        return res.status(400).json({
          success: false,
          error: 'No hay campos para actualizar',
        });
      }

      values.push(id);

      const updateQuery = `UPDATE multa SET ${updates.join(', ')} WHERE id = ?`;
      console.log('🔍 Query UPDATE:', updateQuery);

      await db.query(updateQuery, values);

      await registrarHistorial(
        id,
        req.user.sub,
        'editada',
        `Multa ${multaAnterior.numero} editada`,
        {
          valor_anterior: cambios,
          valor_nuevo: req.body,
          ip_address: req.ip,
        }
      );

      const [rows] = await db.query(
        `
        SELECT 
          m.*,
          m.motivo as tipo_infraccion,
          m.fecha as fecha_infraccion
        FROM multa m
        WHERE m.id = ?
      `,
        [id]
      );

      console.log('✅ Multa actualizada exitosamente');
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error(`❌ Error actualizando multa ${idParam}:`, err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: err.message,
      });
    }
  }
);

// ============================================
// PATCH /multas/:id/anular - ANULAR MULTA
// ============================================
router.patch(
  '/:id/anular',
  authenticate,
  MultasPermissions.canAnular,
  [
    param('id').notEmpty(),
    body('motivo_anulacion')
      .notEmpty()
      .withMessage('motivo_anulacion es requerido'),
  ],
  async (req, res) => {
    const idParam = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array(),
      });
    }

    const { motivo_anulacion } = req.body;

    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(
        `🚫 PATCH /multas/${id}/anular - Usuario:`,
        req.user?.username
      );

      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada',
        });
      }

      const multa = existingRows[0];

      if (multa.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          error: 'La multa ya está anulada',
        });
      }

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'No se puede anular una multa pagada',
        });
      }

      // Anular multa usando fecha_anulacion (columna en la BD)
      await db.query(
        `UPDATE multa 
         SET estado = 'anulada', 
             motivo_anulacion = ?, 
             anulado_por = ?, 
             fecha_anulacion = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [motivo_anulacion, req.user.sub, id]
      );

      await registrarHistorial(
        id,
        req.user.sub,
        'anulada',
        `Multa ${multa.numero} anulada: ${motivo_anulacion}`,
        {
          estado_anterior: multa.estado,
          estado_nuevo: 'anulada',
          ip_address: req.ip,
        }
      );

      const [rows] = await db.query('SELECT * FROM multa WHERE id = ?', [id]);

      console.log('✅ Multa anulada exitosamente');

      res.json({
        success: true,
        data: rows[0],
        message: `Multa ${multa.numero} anulada exitosamente`,
      });
    } catch (error) {
      console.error(`❌ Error anulando multa ${idParam}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
      });
    }
  }
);

// ============================================
// POST /multas/:id/registrar-pago - REGISTRAR PAGO
// ============================================
router.post(
  '/:id/registrar-pago',
  authenticate,
  MultasPermissions.canRegistrarPago,
  [
    param('id').notEmpty(),
    body('fecha_pago')
      .isISO8601()
      .withMessage('fecha_pago debe ser una fecha válida'),
    body('metodo_pago').optional().isString(),
    body('referencia').optional().isString(),
  ],
  async (req, res) => {
    const idParam = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array(),
      });
    }

    const { fecha_pago, metodo_pago, referencia } = req.body;

    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(
        `💰 POST /multas/${id}/registrar-pago - Usuario:`,
        req.user?.username
      );

      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada',
        });
      }

      const multa = existingRows[0];

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'La multa ya está pagada',
        });
      }

      if (multa.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          error: 'No se puede registrar pago de una multa anulada',
        });
      }

      await db.query(
        `UPDATE multa 
         SET estado = 'pagado', 
             fecha_pago = ? 
         WHERE id = ?`,
        [fecha_pago, id]
      );

      await registrarHistorial(
        id,
        req.user.sub,
        'pago_registrado',
        `Pago registrado para multa ${multa.numero}`,
        {
          estado_anterior: multa.estado,
          estado_nuevo: 'pagado',
          valor_nuevo: { fecha_pago, metodo_pago, referencia },
          ip_address: req.ip,
        }
      );

      const [rows] = await db.query('SELECT * FROM multa WHERE id = ?', [id]);

      console.log('✅ Pago registrado exitosamente');

      res.json({
        success: true,
        data: rows[0],
        message: `Pago de multa ${multa.numero} registrado exitosamente`,
      });
    } catch (error) {
      console.error(`❌ Error registrando pago ${idParam}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
      });
    }
  }
);

// ============================================
// GET /multas/:id/historial - VER HISTORIAL
// ============================================
router.get(
  '/:id/historial',
  authenticate,
  MultasPermissions.canView,
  param('id').notEmpty(),
  async (req, res) => {
    const idParam = req.params.id;
    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(
        `📜 GET /multas/${id}/historial - Usuario:`,
        req.user?.username
      );

      const [rows] = await db.query(
        `
        SELECT 
          h.*,
          u.username,
          CONCAT(p.nombres, ' ', p.apellidos) as usuario_nombre
        FROM multa_historial h
        INNER JOIN usuario u ON h.usuario_id = u.id
        LEFT JOIN persona p ON u.persona_id = p.id
        WHERE h.multa_id = ?
        ORDER BY h.created_at DESC
      `,
        [id]
      );

      console.log(`✅ ${rows.length} registros de historial encontrados`);

      res.json({
        success: true,
        data: rows,
        count: rows.length,
      });
    } catch (error) {
      console.error(`❌ Error obteniendo historial ${idParam}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
      });
    }
  }
);

// ============================================
// POST /multas/:id/apelacion - CREAR APELACIÓN
// ============================================
router.post(
  '/:id/apelacion',
  authenticate,
  MultasPermissions.canApelar,
  [
    param('id').notEmpty(),
    body('motivo')
      .notEmpty()
      .isLength({ min: 20 })
      .withMessage('motivo debe tener al menos 20 caracteres'),
    body('documentos_json').optional().isArray(),
  ],
  async (req, res) => {
    const idParam = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array(),
      });
    }

    const { motivo } = req.body;

    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(
        `📝 POST /multas/${id}/apelacion - Usuario:`,
        req.user?.username
      );

      const [multaRows] = await db.query('SELECT * FROM multa WHERE id = ?', [
        id,
      ]);

      if (!multaRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada',
        });
      }

      const multa = multaRows[0];

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'No se puede apelar una multa pagada',
        });
      }

      if (multa.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          error: 'No se puede apelar una multa anulada',
        });
      }

      const [existingApelacion] = await db.query(
        "SELECT id FROM multa_apelacion WHERE multa_id = ? AND estado = 'pendiente'",
        [id]
      );

      if (existingApelacion.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe una apelación pendiente para esta multa',
        });
      }

      // Insertar apelación usando columnas reales: motivo_apelacion, y referenciando persona/comunidad si están
      const [result] = await db.query(
        `INSERT INTO multa_apelacion (
          multa_id,
          usuario_id,
          persona_id,
          comunidad_id,
          motivo_apelacion,
          estado
        ) VALUES (?, ?, ?, ?, ?, 'pendiente')`,
        [
          id,
          req.user.sub,
          req.user.persona_id, // ✅ Usa persona_id del usuario
          multa.comunidad_id || null,
          motivo,
        ]
      );

      await db.query("UPDATE multa SET estado = 'apelada' WHERE id = ?", [id]);

      await registrarHistorial(
        id,
        req.user.sub,
        'apelada',
        `Apelación creada para multa ${multa.numero}`,
        {
          estado_anterior: multa.estado,
          estado_nuevo: 'apelada',
          ip_address: req.ip,
        }
      );

      const [rows] = await db.query(
        'SELECT * FROM multa_apelacion WHERE id = ?',
        [result.insertId]
      );

      console.log('✅ Apelación creada exitosamente');

      res.status(201).json({
        success: true,
        data: rows[0],
        message: `Apelación para multa ${multa.numero} creada exitosamente`,
      });
    } catch (error) {
      console.error(`❌ Error creando apelación ${idParam}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
      });
    }
  }
);

// ============================================
// DELETE /multas/:id - ELIMINAR MULTA
// ============================================
router.delete(
  '/:id',
  authenticate,
  MultasPermissions.canDelete,
  param('id').notEmpty(),
  async (req, res) => {
    const idParam = req.params.id;
    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });

      console.log(`🗑️ DELETE /multas/${id} - Usuario:`, req.user?.username);

      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada',
        });
      }

      const multa = existingRows[0];

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error:
            'No se puede eliminar una multa pagada. Use anular en su lugar.',
        });
      }

      await registrarHistorial(
        id,
        req.user.sub,
        'eliminada',
        `Multa ${multa.numero} eliminada`,
        {
          estado_anterior: multa.estado,
          valor_anterior: multa,
          ip_address: req.ip,
        }
      );

      await db.query('DELETE FROM multa WHERE id = ?', [id]);

      console.log('✅ Multa eliminada exitosamente');

      res.status(200).json({
        success: true,
        message: `Multa ${multa.numero} eliminada exitosamente`,
      });
    } catch (err) {
      console.error(`❌ Error eliminando multa ${idParam}:`, err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
      });
    }
  }
);

// ============================================
// GET /multas/unidad/:unidadId - MULTAS DE UNA UNIDAD
// ============================================
router.get('/unidad/:unidadId', authenticate, async (req, res) => {
  const unidadId = req.params.unidadId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validación fallida',
      details: errors.array(),
    });
  }

  try {
    console.log(`🔍 GET /multas/unidad/${unidadId}`);

    const [rows] = await db.query(
      `
        SELECT 
          m.id, 
          m.numero,
          m.motivo as tipo_infraccion, 
          m.monto, 
          m.estado, 
          m.prioridad,
          m.fecha as fecha_infraccion,
          m.fecha_vencimiento
        FROM multa m 
        WHERE m.unidad_id = ? 
        ORDER BY m.fecha DESC 
        LIMIT 200
      `,
      [unidadId]
    );

    console.log(`✅ ${rows.length} multas encontradas para unidad ${unidadId}`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Error obteniendo multas de unidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor',
    });
  }
});

// ============================================
// GET /multas/:id/apelaciones
// ============================================
router.get(
  '/:id/apelaciones',
  authenticate,
  MultasPermissions.canView,
  param('id').notEmpty(),
  async (req, res) => {
    const idParam = req.params.id;
    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });
      const [rows] = await db.query(
        'SELECT * FROM multa_apelacion WHERE multa_id = ? ORDER BY created_at DESC',
        [id]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Error del servidor' });
    }
  }
);

// ============================================
// GET /multas/:id/documentos
// ============================================
router.get(
  '/:id/documentos',
  authenticate,
  MultasPermissions.canView,
  param('id').notEmpty(),
  async (req, res) => {
    const idParam = req.params.id;
    try {
      const id = await resolveMultaId(idParam);
      if (!id)
        return res
          .status(404)
          .json({ success: false, error: 'Multa no encontrada' });
      const [rows] = await db.query(
        'SELECT * FROM documento_multa WHERE multa_id = ? ORDER BY created_at DESC',
        [id]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Error del servidor' });
    }
  }
);

// ============================================
// ENDPOINT: Iniciar pago de multa con Webpay
// ============================================
/**
 * @swagger
 * /multas/{id}/iniciar-pago:
 *   post:
 *     summary: Iniciar pago de una multa con Webpay
 *     tags: [Multas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la multa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gateway
 *             properties:
 *               gateway:
 *                 type: string
 *                 enum: [webpay]
 *                 description: Pasarela de pago (solo webpay por ahora)
 *               payerEmail:
 *                 type: string
 *                 format: email
 *                 description: Email del pagador
 *     responses:
 *       200:
 *         description: Transacción iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                     transactionId:
 *                       type: integer
 *                     paymentUrl:
 *                       type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No tiene permisos
 *       404:
 *         description: Multa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/:id/iniciar-pago',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de multa inválido'),
    body('gateway').isIn(['webpay']).withMessage('Gateway debe ser webpay'),
    body('payerEmail').optional().isEmail().withMessage('Email inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const multaId = parseInt(req.params.id, 10);
    const { gateway, payerEmail } = req.body;
    const usuarioId = req.user.id;

    try {
      // 1. Obtener la multa
      const [multas] = await db.query(
        `SELECT m.*, c.razon_social as comunidad_nombre
         FROM multa m
         INNER JOIN comunidad c ON m.comunidad_id = c.id
         WHERE m.id = ?`,
        [multaId]
      );

      if (!multas || multas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada',
        });
      }

      const multa = multas[0];

      // 2. Validar que la multa esté pendiente
      if (multa.estado !== 'pendiente') {
        return res.status(400).json({
          success: false,
          error: `La multa está en estado '${multa.estado}'. Solo se pueden pagar multas pendientes.`,
        });
      }

      // 3. Validar permisos del usuario en la comunidad
      const comunidadesUsuario = await obtenerComunidadesUsuario(
        usuarioId,
        req.user.persona_id,
        req.user.is_super_admin
      );

      if (!comunidadesUsuario.includes(multa.comunidad_id)) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para pagar esta multa',
        });
      }

      // 4. Generar order_id único
      const timestamp = Date.now();
      const orderId = `MULTA-${multa.comunidad_id}-${multaId}-${timestamp}`;

      // 5. Crear transacción en payment_transaction
      const [result] = await db.query(
        `INSERT INTO payment_transaction 
         (order_id, comunidad_id, multa_id, amount, gateway, status, payer_email, usuario_id)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          orderId,
          multa.comunidad_id,
          multaId,
          multa.monto,
          gateway,
          payerEmail || null,
          usuarioId,
        ]
      );

      const transactionId = result.insertId;

      // 6. Iniciar transacción con Webpay
      const paymentGatewayService = require('../services/paymentGatewayService');

      const paymentData = {
        orderId,
        sessionId: `session-${usuarioId}-${multaId}-${timestamp}`,
        communityId: multa.comunidad_id,
        unitId: multa.unidad_id,
        multaId: multaId,
        amount: parseFloat(multa.monto),
        description: `Pago de multa #${multa.numero || multaId} - ${multa.motivo}`,
      };

      const webpayResult =
        await paymentGatewayService.createWebpayTransaction(paymentData);

      // 7. Actualizar transaction_token en la BD
      await db.query(
        `UPDATE payment_transaction 
         SET transaction_token = ?, gateway_transaction_id = ?, gateway_response = ?
         WHERE id = ?`,
        [
          webpayResult.transactionId,
          webpayResult.transactionId,
          JSON.stringify(webpayResult.gatewayResponse),
          transactionId,
        ]
      );

      // 8. Responder con URL de pago
      res.json({
        success: true,
        data: {
          orderId,
          transactionId,
          paymentUrl: webpayResult.paymentUrl,
          token: webpayResult.transactionId,
          gateway: 'webpay',
          amount: multa.monto,
          description: paymentData.description,
        },
      });
    } catch (err) {
      console.error('Error al iniciar pago de multa:', err);
      res.status(500).json({
        success: false,
        error: 'Error al iniciar pago',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

// ============================================
// ENDPOINT: Confirmar pago de multa con Webpay
// ============================================
/**
 * @swagger
 * /multas/pago/confirmar:
 *   post:
 *     summary: Confirmar pago de multa después de Webpay
 *     tags: [Multas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token_ws
 *             properties:
 *               token_ws:
 *                 type: string
 *                 description: Token de respuesta de Webpay
 *     responses:
 *       200:
 *         description: Pago confirmado exitosamente
 *       400:
 *         description: Error en la confirmación
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/pago/confirmar',
  [body('token_ws').notEmpty().withMessage('Token de Webpay requerido')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token_ws } = req.body;

    try {
      const paymentGatewayService = require('../services/paymentGatewayService');

      // 1. Confirmar transacción con Webpay
      const webpayResponse =
        await paymentGatewayService.confirmWebpayTransaction(token_ws);

      // DEBUG: Ver respuesta de Webpay
      console.log(
        '🔍 Webpay Response:',
        JSON.stringify(webpayResponse, null, 2)
      );

      // 2. Buscar la transacción en payment_transaction
      const [transactions] = await db.query(
        `SELECT * FROM payment_transaction WHERE transaction_token = ?`,
        [token_ws]
      );

      if (!transactions || transactions.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Transacción no encontrada',
        });
      }

      const transaction = transactions[0];

      // 3. Actualizar estado de la transacción
      const transactionStatus =
        webpayResponse.success && webpayResponse.response.response_code === 0
          ? 'completed'
          : 'failed';

      await db.query(
        `UPDATE payment_transaction 
         SET status = ?, gateway_response = ?, gateway_transaction_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          transactionStatus,
          JSON.stringify(webpayResponse.response),
          webpayResponse.response.authorization_code,
          transaction.id,
        ]
      );

      // 4. Si el pago fue exitoso y hay multa_id, actualizar la multa
      if (transactionStatus === 'completed' && transaction.multa_id) {
        const multaId = transaction.multa_id;

        // Actualizar estado de la multa a 'pagado'
        await db.query(
          `UPDATE multa 
           SET estado = 'pagado', fecha_pago = NOW(), updated_at = NOW(), pagado_por = ?
           WHERE id = ?`,
          [transaction.usuario_id, multaId]
        );

        // Crear registro en la tabla pago
        await db.query(
          `INSERT INTO pago 
           (comunidad_id, unidad_id, fecha, monto, medio, referencia, estado, comprobante_num)
           VALUES (?, ?, CURDATE(), ?, 'webpay', ?, 'aplicado', ?)`,
          [
            transaction.comunidad_id,
            null, // unidad_id puede venir de multa si lo necesitas
            transaction.amount,
            transaction.order_id,
            webpayResponse.authorization_code,
          ]
        );

        // Registrar en historial de multa
        await db.query(
          `INSERT INTO multa_historial 
           (multa_id, accion, descripcion, usuario_id, created_at)
           VALUES (?, 'pago_webpay', ?, ?, NOW())`,
          [
            multaId,
            `Pago confirmado con Webpay. Auth: ${webpayResponse.response.authorization_code}`,
            transaction.usuario_id,
          ]
        );

        res.json({
          success: true,
          message: 'Pago confirmado exitosamente',
          data: {
            transactionId: transaction.id,
            orderId: transaction.order_id,
            multaId,
            amount: transaction.amount,
            authorizationCode: webpayResponse.response.authorization_code,
            status: 'completed',
          },
        });
      } else if (transactionStatus === 'failed') {
        res.status(400).json({
          success: false,
          error: 'El pago fue rechazado',
          data: {
            transactionId: transaction.id,
            orderId: transaction.order_id,
            responseCode: webpayResponse.response.response_code,
            status: 'failed',
          },
        });
      } else {
        res.json({
          success: true,
          message: 'Transacción confirmada',
          data: {
            transactionId: transaction.id,
            status: transactionStatus,
          },
        });
      }
    } catch (err) {
      console.error('Error al confirmar pago:', err);
      res.status(500).json({
        success: false,
        error: 'Error al confirmar el pago',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

module.exports = router;
// =========================================
// ENDPOINTS DE MULTAS
// =========================================

// // 1. LISTADOS Y FILTROS
// GET: /multas/comunidad/:comunidadId
// GET: /multas/comunidad/:comunidadId/estadisticas-comunidad
// GET: /multas/comunidad/:comunidadId/proximas-vencer
// GET: /multas/comunidad/:comunidadId/buscar

// // 2. VISTA DETALLADA
// GET: /multas/:id
// GET: /multas/comunidad/:comunidadId/completas

// // 3. ESTADÍSTICAS
// GET: /multas/estadisticas/generales
// GET: /multas/comunidad/:comunidadId/estadisticas/tipo
// GET: /multas/comunidad/:comunidadId/estadisticas/prioridad
// GET: /multas/comunidad/:comunidadId/estadisticas/mensuales

// // 4. BÚSQUEDAS AVANZADAS
// GET: /multas/comunidad/:comunidadId/por-propietario
// GET: /multas/comunidad/:comunidadId/por-unidad

// // 5. EXPORTACIÓN
// GET: /multas/comunidad/:comunidadId/export
// GET: /multas/comunidad/:comunidadId/export/pendientes
// GET: /multas/comunidad/:comunidadId/export/estadisticas

// // 6. VALIDACIONES
// GET: /multas/comunidad/:comunidadId/validar/integridad
// GET: /multas/comunidad/:comunidadId/validar/rangos-monto

// // 7. CRUD BÁSICO
// GET: /multas/unidad/:unidadId
// POST: /multas/unidad/:unidadId
// PATCH: /multas/:id
// PATCH: /multas/:id/anular
// DELETE: /multas/:id
