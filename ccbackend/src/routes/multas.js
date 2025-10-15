const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const MultasPermissions = require('../middleware/multasPermissions');

// ============================================
// HELPER: Obtener comunidades del usuario
// ============================================
async function obtenerComunidadesUsuario(userId, personaId, isSuperAdmin) {
  try {
    if (isSuperAdmin) {
      // Superadmin ve todas las comunidades
      const [comunidades] = await db.query('SELECT id FROM comunidad WHERE activo = 1');
      return comunidades.map(c => c.id);
    }

    // Obtener comunidades donde tiene roles activos
    const [memberships] = await db.query(`
      SELECT DISTINCT comunidad_id 
      FROM usuario_rol_comunidad 
      WHERE usuario_id = ? AND activo = 1
    `, [userId]);
    console.log('🏘️ Comunidades obtenidas:', memberships.map(m => m.comunidad_id));  // ✅ Agregar
    return memberships.map(m => m.comunidad_id);
  } catch (error) {
    console.error('❌ Error obteniendo comunidades del usuario:', error);
    return [];
  }
}

// ============================================
// HELPER: Registrar en historial
// ============================================
async function registrarHistorial(multaId, usuarioId, accion, descripcion, extras = {}) {
  try {
    await db.query(`
      INSERT INTO multa_historial (
        multa_id, usuario_id, accion, estado_anterior, estado_nuevo, 
        campo_modificado, valor_anterior, valor_nuevo, descripcion, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      multaId,
      usuarioId,
      accion,
      extras.estado_anterior || null,
      extras.estado_nuevo || null,
      extras.campo_modificado || null,
      extras.valor_anterior ? JSON.stringify(extras.valor_anterior) : null,
      extras.valor_nuevo ? JSON.stringify(extras.valor_nuevo) : null,
      descripcion,
      extras.ip_address || null
    ]);
    console.log(`📝 Historial registrado: ${accion} para multa ${multaId}`);
  } catch (error) {
    console.error('❌ Error registrando historial:', error);
  }
}

// ============================================
// HELPER: Generar número de multa
// ============================================
async function generarNumeroMulta(comunidadId) {
  try {
    const year = new Date().getFullYear();

    const [lastMulta] = await db.query(
      "SELECT numero FROM multa WHERE comunidad_id = ? AND numero LIKE ? ORDER BY id DESC LIMIT 1",
      [comunidadId, `M-${year}-%`]
    );

    let nextNum = 1;
    if (lastMulta.length > 0 && lastMulta[0].numero) {
      const parts = lastMulta[0].numero.split('-');
      nextNum = parseInt(parts[2]) + 1;
    }

    const numero = `M-${year}-${String(nextNum).padStart(4, '0')}`;
    console.log(`🔢 Número generado: ${numero}`);
    return numero;

  } catch (error) {
    console.error('❌ Error generando número:', error);
    return `M-${new Date().getFullYear()}-0001`;
  }
}

// ============================================
// GET /multas - LISTAR MULTAS
// ============================================
router.get('/',
  authenticate,
  MultasPermissions.canView,
  [
    query('estado').optional().isIn(['pendiente', 'pagado', 'vencido', 'apelada', 'anulada']),
    query('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 })
  ],
  async (req, res) => {
    try {
      const { estado, prioridad, unidad_id, search, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      console.log('🔍 GET /multas - Usuario:', req.user?.username, 'ID:', req.user?.sub);

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
        console.log(`🔒 Filtro aplicado: solo multas de persona_id=${req.user.persona_id}`);
      } else if (!req.user?.is_superadmin) {
        // ✅ CORRECCIÓN: Cargar comunidades desde BD
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
            error: 'Sin permisos para ver multas (sin comunidades asignadas)'
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
        sql += ' AND (u.codigo LIKE ? OR m.motivo LIKE ? OR CONCAT(p.nombres, " ", p.apellidos) LIKE ?)';
        params.push(s, s, s);
      }

      // Total count (usar pattern que admita newlines)
      const countQuery = sql.replace(/SELECT[\s\S]*?FROM/i, 'SELECT COUNT(*) as total FROM');
      const [countResult] = await db.query(countQuery, params);
      const total = countResult[0].total;

      console.log(`📊 Total de multas encontradas: ${total}`);

      // Paginación
      sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await db.query(sql, params);

      // ✅ Agregar debug
      console.log('🔍 SQL ejecutado:', sql);
      console.log('📊 Parámetros:', params);
      console.log('📊 Filas encontradas:', rows.length);

      console.log(`✅ ${rows.length} multas devueltas en esta página`);

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

    } catch (error) {
      console.error('❌ Error en GET /multas:', error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message
      });
    }
  }
);

// ============================================
// GET /multas/estadisticas - ESTADÍSTICAS
// ============================================
router.get('/estadisticas',
  authenticate,
  MultasPermissions.canView,
  async (req, res) => {
    try {
      console.log('📊 GET /multas/estadisticas - Usuario:', req.user?.username);

      let whereClause = 'WHERE 1=1';
      const params = [];

      // ✅ CORRECCIÓN: Filtrar por permisos usando función helper
      if (req.viewOnlyOwn && req.user.persona_id) {
        whereClause += ' AND persona_id = ?';
        params.push(req.user.persona_id);
      } else if (!req.user?.is_superadmin) {
        // ✅ CORRECCIÓN: Cargar comunidades desde BD
        const comunidadIds = await obtenerComunidadesUsuario(
          req.user.sub,
          req.user.persona_id,
          req.user.is_superadmin
        );

        if (comunidadIds.length === 0) {
          return res.status(403).json({ success: false, error: 'Sin permisos' });
        }

        const placeholders = comunidadIds.map(() => '?').join(',');
        whereClause += ` AND comunidad_id IN (${placeholders})`;
        params.push(...comunidadIds);
      }

      // Filtro opcional por comunidad
      if (req.query.comunidad_id) {
        whereClause += ' AND comunidad_id = ?';
        params.push(req.query.comunidad_id);
      }

      const [stats] = await db.query(`
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
      `, params);

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
          critica: stats[0].prioridad_critica
        },
        montos: {
          total: parseFloat(stats[0].monto_total || 0),
          pendiente: parseFloat(stats[0].monto_pendiente || 0),
          vencido: parseFloat(stats[0].monto_vencido || 0),
          recaudado: parseFloat(stats[0].monto_recaudado || 0)
        }
      };

      console.log('✅ Estadísticas calculadas:', estadisticas);
      res.json({ success: true, data: estadisticas });

    } catch (error) {
      console.error('❌ Error en estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message
      });
    }
  }
);

// ============================================
// POST /multas - CREAR MULTA
// ============================================
router.post('/',
  authenticate,
  MultasPermissions.canCreate,
  [
    body('unidad_id').notEmpty().isInt().withMessage('unidad_id es requerido y debe ser un número'),
    body('tipo_infraccion').notEmpty().isLength({ min: 5, max: 120 }).withMessage('tipo_infraccion es requerido (5-120 caracteres)'),
    body('monto').isFloat({ min: 0.01 }).withMessage('monto debe ser mayor a 0'),
    // fechas opcionales
    body('fecha_infraccion').optional().isISO8601().withMessage('fecha_infraccion debe ser una fecha válida')
      .custom(fecha => {
        if (fecha && new Date(fecha) > new Date()) {
          throw new Error('fecha_infraccion no puede ser futura');
        }
        return true;
      }),
    body('fecha_vencimiento').optional().isISO8601().withMessage('fecha_vencimiento debe ser una fecha válida')
      .custom((fecha_venc, { req }) => {
        if (fecha_venc && req.body.fecha_infraccion && new Date(fecha_venc) <= new Date(req.body.fecha_infraccion)) {
          throw new Error('fecha_vencimiento debe ser mayor a fecha_infraccion');
        }
        return true;
      }),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']).withMessage('prioridad inválida')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array()
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
      prioridad = 'media'
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
          error: 'Unidad no encontrada'
        });
      }

      const comunidad_id = unidadRows[0].comunidad_id;

      // ✅ Verificar permisos sobre la comunidad
      if (!req.user.is_superadmin) {
        const comunidadIds = await obtenerComunidadesUsuario(
          req.user.sub,
          req.user.persona_id,
          req.user.is_superadmin
        );

        if (!comunidadIds.includes(comunidad_id)) {
          return res.status(403).json({
            success: false,
            error: 'Sin permisos para crear multas en esta comunidad'
          });
        }
      }

      // Generar número de multa
      const numero = await generarNumeroMulta(comunidad_id);

      // Insertar multa
      const [result] = await db.query(
        `INSERT INTO multa (
          numero, comunidad_id, unidad_id, persona_id, motivo, descripcion, 
          monto, fecha, fecha_vencimiento, prioridad, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
        [
          numero,
          comunidad_id,
          unidad_id,
          persona_id || null,
          tipo_infraccion,
          descripcion || null,
          monto,
          fecha_infraccion,
          fecha_vencimiento,
          prioridad
        ]
      );

      // Registrar en historial
      await registrarHistorial(
        result.insertId,
        req.user.sub, // ✅ Usar req.user.sub en lugar de req.user.id
        'creada',
        `Multa ${numero} creada`,
        {
          estado_nuevo: 'pendiente',
          ip_address: req.ip
        }
      );

      // Obtener multa completa con JOINs
      const [rows] = await db.query(`
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
      `, [result.insertId]);

      console.log('✅ Multa creada exitosamente:', rows[0].numero);

      res.status(201).json({
        success: true,
        data: rows[0],
        message: `Multa ${rows[0].numero} creada exitosamente`
      });

    } catch (err) {
      console.error('❌ Error creando multa:', err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: err.message
      });
    }
  }
);

// ============================================
// GET /multas/:id - DETALLE DE MULTA
// ============================================
router.get('/:id',
  authenticate,
  MultasPermissions.canView,
  param('id').isInt(),
  async (req, res) => {
    const id = req.params.id;

    try {
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

      // Verificar permisos
      if (req.viewOnlyOwn && req.user.persona_id) {
        query += ' AND m.persona_id = ?';
        params.push(req.user.persona_id);
      }

      const [rows] = await db.query(query, params);

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada o sin permisos'
        });
      }

      console.log('✅ Multa encontrada:', rows[0].numero);
      res.json({ success: true, data: rows[0] });

    } catch (error) {
      console.error(`❌ Error obteniendo multa ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: error.message
      });
    }
  }
);

// ============================================
// PATCH /multas/:id - EDITAR MULTA
// ============================================
router.patch('/:id',
  authenticate,
  MultasPermissions.canEdit,
  [
    param('id').isInt(),
    body('tipo_infraccion').optional().isLength({ min: 5, max: 120 }),
    body('monto').optional().isFloat({ min: 0.01 }),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'critica']),
    body('fecha_infraccion').optional().isISO8601(),
    body('fecha_vencimiento').optional().isISO8601()
  ],
  async (req, res) => {
    const id = req.params.id;

    try {
      console.log(`📝 PATCH /multas/${id} - Usuario:`, req.user?.username);
      console.log('📝 Datos recibidos:', req.body);

      // Verificar que multa existe
      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ? LIMIT 1',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada'
        });
      }

      const multaAnterior = existingRows[0];

      // No permitir editar multas pagadas o anuladas
      if (['pagado', 'anulada'].includes(multaAnterior.estado)) {
        return res.status(400).json({
          success: false,
          error: `No se puede editar una multa ${multaAnterior.estado}`
        });
      }

      // Mapear campos del frontend a la BD
      const fieldMapping = {
        'tipo_infraccion': 'motivo',
        'fecha_infraccion': 'fecha'
      };

      const allowedFields = [
        'tipo_infraccion', 'descripcion', 'monto',
        'prioridad', 'fecha_infraccion', 'fecha_vencimiento'
      ];

      const updates = [];
      const values = [];
      const cambios = [];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          const dbField = fieldMapping[field] || field;
          updates.push(`${dbField} = ?`);
          values.push(req.body[field]);
          cambios.push({
            campo: field,
            anterior: multaAnterior[dbField],
            nuevo: req.body[field]
          });
        }
      });

      if (!updates.length) {
        return res.status(400).json({
          success: false,
          error: 'No hay campos para actualizar'
        });
      }

      values.push(id);

      const updateQuery = `UPDATE multa SET ${updates.join(', ')} WHERE id = ?`;
      console.log('🔍 Query UPDATE:', updateQuery);

      await db.query(updateQuery, values);

      // Registrar en historial
      await registrarHistorial(
        id,
        req.user.sub, // ✅ Usar req.user.sub en lugar de req.user.id
        'editada',
        `Multa ${multaAnterior.numero} editada`,
        {
          valor_anterior: cambios,
          valor_nuevo: req.body,
          ip_address: req.ip
        }
      );

      // Obtener multa actualizada
      const [rows] = await db.query(`
        SELECT 
          m.*,
          m.motivo as tipo_infraccion,
          m.fecha as fecha_infraccion
        FROM multa m
        WHERE m.id = ?
      `, [id]);

      console.log('✅ Multa actualizada exitosamente');
      res.json({ success: true, data: rows[0] });

    } catch (err) {
      console.error(`❌ Error actualizando multa ${id}:`, err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor',
        message: err.message
      });
    }
  }
);

// ============================================
// PATCH /multas/:id/anular - ANULAR MULTA
// ============================================
router.patch('/:id/anular',
  authenticate,
  MultasPermissions.canAnular,
  [
    param('id').isInt(),
    body('motivo_anulacion').notEmpty().withMessage('motivo_anulacion es requerido')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array()
      });
    }

    const id = req.params.id;
    const { motivo_anulacion } = req.body;

    try {
      console.log(`🚫 PATCH /multas/${id}/anular - Usuario:`, req.user?.username);

      // Verificar multa
      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada'
        });
      }

      const multa = existingRows[0];

      if (multa.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          error: 'La multa ya está anulada'
        });
      }

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'No se puede anular una multa pagada'
        });
      }

      // Anular multa
      await db.query(
        `UPDATE multa 
         SET estado = 'anulada', 
             motivo_anulacion = ?, 
             anulado_por = ?, 
             anulado_en = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [motivo_anulacion, req.user.sub, id]
      );

      // Registrar en historial
      await registrarHistorial(
        id,
        req.user.sub,
        'anulada',
        `Multa ${multa.numero} anulada: ${motivo_anulacion}`,
        {
          estado_anterior: multa.estado,
          estado_nuevo: 'anulada',
          ip_address: req.ip
        }
      );

      // Obtener multa actualizada
      const [rows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      console.log('✅ Multa anulada exitosamente');

      res.json({
        success: true,
        data: rows[0],
        message: `Multa ${multa.numero} anulada exitosamente`
      });

    } catch (error) {
      console.error(`❌ Error anulando multa ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

// ============================================
// POST /multas/:id/registrar-pago - REGISTRAR PAGO
// ============================================
router.post('/:id/registrar-pago',
  authenticate,
  MultasPermissions.canRegistrarPago,
  [
    param('id').isInt(),
    body('fecha_pago').isISO8601().withMessage('fecha_pago debe ser una fecha válida'),
    body('metodo_pago').optional().isString(),
    body('referencia').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array()
      });
    }

    const id = req.params.id;
    const { fecha_pago, metodo_pago, referencia } = req.body;

    try {
      console.log(`💰 POST /multas/${id}/registrar-pago - Usuario:`, req.user?.username);

      // Verificar multa
      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada'
        });
      }

      const multa = existingRows[0];

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'La multa ya está pagada'
        });
      }

      if (multa.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          error: 'No se puede registrar pago de una multa anulada'
        });
      }

      // Registrar pago
      await db.query(
        `UPDATE multa 
         SET estado = 'pagado', 
             fecha_pago = ? 
         WHERE id = ?`,
        [fecha_pago, id]
      );

      // Registrar en historial
      await registrarHistorial(
        id,
        req.user.sub, // ✅ Usar req.user.sub en lugar de req.user.id
        'pago_registrado',
        `Pago registrado para multa ${multa.numero}`,
        {
          estado_anterior: multa.estado,
          estado_nuevo: 'pagado',
          valor_nuevo: { fecha_pago, metodo_pago, referencia },
          ip_address: req.ip
        }
      );

      // Obtener multa actualizada
      const [rows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      console.log('✅ Pago registrado exitosamente');

      res.json({
        success: true,
        data: rows[0],
        message: `Pago de multa ${multa.numero} registrado exitosamente`
      });

    } catch (error) {
      console.error(`❌ Error registrando pago ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

// ============================================
// GET /multas/:id/historial - VER HISTORIAL
// ============================================
router.get('/:id/historial',
  authenticate,
  MultasPermissions.canView,
  param('id').isInt(),
  async (req, res) => {
    const id = req.params.id;

    try {
      console.log(`📜 GET /multas/${id}/historial - Usuario:`, req.user?.username);

      // Verificar que la multa existe
      const [multaRows] = await db.query(
        'SELECT id FROM multa WHERE id = ?',
        [id]
      );

      if (!multaRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada'
        });
      }

      // Obtener historial
      const [rows] = await db.query(`
        SELECT 
          h.*,
          u.username,
          CONCAT(p.nombres, ' ', p.apellidos) as usuario_nombre
        FROM multa_historial h
        INNER JOIN usuario u ON h.usuario_id = u.id
        LEFT JOIN persona p ON u.persona_id = p.id
        WHERE h.multa_id = ?
        ORDER BY h.created_at DESC
      `, [id]);

      console.log(`✅ ${rows.length} registros de historial encontrados`);

      res.json({
        success: true,
        data: rows,
        count: rows.length
      });

    } catch (error) {
      console.error(`❌ Error obteniendo historial ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

// ============================================
// POST /multas/:id/apelacion - CREAR APELACIÓN
// ============================================
router.post('/:id/apelacion',
  authenticate,
  MultasPermissions.canApelar,
  [
    param('id').isInt(),
    body('motivo').notEmpty().isLength({ min: 20 }).withMessage('motivo debe tener al menos 20 caracteres'),
    body('documentos_json').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array()
      });
    }

    const id = req.params.id;
    const { motivo, documentos_json } = req.body;

    try {
      console.log(`📝 POST /multas/${id}/apelacion - Usuario:`, req.user?.username);

      // Verificar multa
      const [multaRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!multaRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada'
        });
      }

      const multa = multaRows[0];

      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'No se puede apelar una multa pagada'
        });
      }

      if (multa.estado === 'anulada') {
        return res.status(400).json({
          success: false,
          error: 'No se puede apelar una multa anulada'
        });
      }

      // Verificar si ya tiene apelación pendiente
      const [existingApelacion] = await db.query(
        "SELECT id FROM multa_apelacion WHERE multa_id = ? AND estado = 'pendiente'",
        [id]
      );

      if (existingApelacion.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe una apelación pendiente para esta multa'
        });
      }

      // Crear apelación
      const [result] = await db.query(
        `INSERT INTO multa_apelacion (
          multa_id, usuario_id, motivo, documentos_json, estado
        ) VALUES (?, ?, ?, ?, 'pendiente')`,
        [
          id,
          req.user.sub,  // ✅ CORREGIDO: Ahora usa req.user.sub
          motivo,
          documentos_json ? JSON.stringify(documentos_json) : null
        ]
      );

      // Cambiar estado de la multa a "apelada"
      await db.query(
        "UPDATE multa SET estado = 'apelada' WHERE id = ?",
        [id]
      );

      // Registrar en historial
      await registrarHistorial(
        id,
        req.user.sub,
        'apelada',
        `Apelación creada para multa ${multa.numero}`,
        {
          estado_anterior: multa.estado,
          estado_nuevo: 'apelada',
          ip_address: req.ip
        }
      );

      // Obtener apelación creada
      const [rows] = await db.query(
        'SELECT * FROM multa_apelacion WHERE id = ?',
        [result.insertId]
      );

      console.log('✅ Apelación creada exitosamente');

      res.status(201).json({
        success: true,
        data: rows[0],
        message: `Apelación para multa ${multa.numero} creada exitosamente`
      });

    } catch (error) {
      console.error(`❌ Error creando apelación ${id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

// ============================================
// DELETE /multas/:id - ELIMINAR MULTA
// ============================================
router.delete('/:id',
  authenticate,
  MultasPermissions.canDelete,
  param('id').isInt(),
  async (req, res) => {
    const id = req.params.id;

    try {
      console.log(`🗑️ DELETE /multas/${id} - Usuario:`, req.user?.username);

      // Verificar multa
      const [existingRows] = await db.query(
        'SELECT * FROM multa WHERE id = ?',
        [id]
      );

      if (!existingRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Multa no encontrada'
        });
      }

      const multa = existingRows[0];

      // No permitir eliminar multas pagadas
      if (multa.estado === 'pagado') {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar una multa pagada. Use anular en su lugar.'
        });
      }

      // Registrar en historial antes de eliminar
      await registrarHistorial(
        id,
        req.user.sub, // ✅ Usar req.user.sub en lugar de req.user.id
        'eliminada',
        `Multa ${multa.numero} eliminada`,
        {
          estado_anterior: multa.estado,
          valor_anterior: multa,
          ip_address: req.ip
        }
      );

      // Eliminar multa (CASCADE eliminará historial y apelaciones)
      await db.query('DELETE FROM multa WHERE id = ?', [id]);

      console.log('✅ Multa eliminada exitosamente');

      res.status(200).json({
        success: true,
        message: `Multa ${multa.numero} eliminada exitosamente`
      });

    } catch (err) {
      console.error(`❌ Error eliminando multa ${id}:`, err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

// ============================================
// GET /multas/unidad/:unidadId - MULTAS DE UNA UNIDAD
// ============================================
/**
 * @openapi
 * /unidades/{unidadId}/multas:
 *   get:
 *     tags: [Multas]
 *     summary: Listar multas de una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de multas
 */
router.get('/unidad/:unidadId',
  authenticate,
  async (req, res) => {
    const unidadId = req.params.unidadId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: errors.array()
      });
    }

    try {
      console.log(`🔍 GET /multas/unidad/${unidadId}`);

      const [rows] = await db.query(`
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
      `, [unidadId]);

      console.log(`✅ ${rows.length} multas encontradas para unidad ${unidadId}`);
      res.json({ success: true, data: rows });

    } catch (error) {
      console.error('❌ Error obteniendo multas de unidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

// ============================================
// POST /multas/unidad/:unidadId - CREAR MULTA DESDE UNIDAD
// ============================================
/**
 * @openapi
 * /unidades/{unidadId}/multas:
 *   post:
 *     tags: [Multas]
 *     summary: Crear una multa para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
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
 *               tipo_infraccion:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               fecha_infraccion:
 *                 type: string
 *                 format: date
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *               prioridad:
 *                 type: string
 *                 enum: [baja, media, alta, critica]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/unidad/:unidadId',
  authenticate,
  MultasPermissions.canCreate,
  [
    body('tipo_infraccion').notEmpty(),
    body('monto').isNumeric(),
    body('fecha_infraccion').optional().isISO8601() // antes .notEmpty()
  ],
  async (req, res) => {
    const unidadId = req.params.unidadId;
    const {
      persona_id,
      tipo_infraccion,
      descripcion,
      monto,
      fecha_infraccion,
      fecha_vencimiento,
      prioridad = 'media'
    } = req.body;

    try {
      console.log(`📝 POST /multas/unidad/${unidadId}`);

      // Obtener comunidad_id de la unidad
      const [unidadRows] = await db.query(
        'SELECT comunidad_id FROM unidad WHERE id = ?',
        [unidadId]
      );

      if (!unidadRows.length) {
        return res.status(404).json({
          success: false,
          error: 'Unidad no encontrada'
        });
      }

      const comunidad_id = unidadRows[0].comunidad_id;
      const numero = await generarNumeroMulta(comunidad_id);

      // Insertar multa
      const [result] = await db.query(
        `INSERT INTO multa (
          numero, comunidad_id, unidad_id, persona_id, motivo, descripcion, 
          monto, fecha, fecha_vencimiento, prioridad
        ) SELECT ?, unidad.comunidad_id, ?, ?, ?, ?, ?, ?, ?, ? 
        FROM unidad WHERE id = ?`,
        [
          numero,
          unidadId,
          persona_id || null,
          tipo_infraccion,
          descripcion || null,
          monto,
          fecha_infraccion,
          fecha_vencimiento || null,
          prioridad,
          unidadId
        ]
      );

      // Registrar en historial
      await registrarHistorial(
        result.insertId,
        req.user.sub, // ✅ Usar req.user.sub en lugar de req.user.id
        'creada',
        `Multa ${numero} creada desde unidad ${unidadId}`,
        {
          estado_nuevo: 'pendiente',
          ip_address: req.ip
        }
      );

      // Obtener multa creada
      const [row] = await db.query(
        'SELECT id, numero, motivo as tipo_infraccion, monto, estado, prioridad FROM multa WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      console.log('✅ Multa creada desde unidad');
      res.status(201).json({ success: true, data: row[0] });

    } catch (err) {
      console.error('❌ Error creando multa desde unidad:', err);
      res.status(500).json({
        success: false,
        error: 'Error del servidor'
      });
    }
  }
);

module.exports = router;