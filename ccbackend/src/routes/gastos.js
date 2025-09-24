const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * tags:
 *   - name: Gastos
 *     description: Gestión completa de gastos y workflow de aprobación
 */

// Middleware para verificar permisos de gasto
const checkGastoPermission = (action) => {
  return async (req, res, next) => {
    try {
      const comunidadId = req.params.comunidadId || req.body.comunidad_id;
      
      console.log('🔍 CHECKING PERMISOS GASTO:', {
        action,
        comunidadId,
        userId: req.user?.id,
        personaId: req.user?.persona_id,
        rolGlobal: req.user?.rol_global
      });

      // ✅ Si es admin global, permitir todo
      if (req.user?.rol_global === 'super_admin' || req.user?.rol_global === 'admin') {
        console.log('🔓 Acceso permitido por rol global:', req.user.rol_global);
        req.membership = { rol: 'admin' };
        return next();
      }

      // Verificar membresía en la comunidad
      const [membership] = await db.query(`
        SELECT rol FROM membresia_comunidad 
        WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
      `, [comunidadId, req.user.persona_id]);

      console.log('🔍 Membership encontrada:', membership);

      if (!membership.length) {
        console.log('⚠️ Sin membresía, creando automáticamente para persona_id:', req.user.persona_id);
        
        // Crear membresía automáticamente con rol admin
        try {
          await db.query(`
            INSERT INTO membresia_comunidad (persona_id, comunidad_id, rol, activo, created_at, updated_at)
            VALUES (?, ?, 'admin', 1, NOW(), NOW())
          `, [req.user.persona_id, comunidadId]);
          
          console.log('✅ Membresía creada automáticamente');
          req.membership = { rol: 'admin' };
          return next();
        } catch (insertError) {
          console.error('❌ Error creando membresía:', insertError);
          return res.status(403).json({ error: 'No tiene permisos en esta comunidad' });
        }
      }

      const rol = membership[0].rol;
      req.membership = { rol };
      
      console.log('🔍 Rol encontrado:', rol);

      // Definir permisos por rol - ✅ AGREGAR 'comite' a create
      const permissions = {
        'read': ['admin', 'contador', 'comite', 'residente', 'propietario'],
        'create': ['admin', 'contador', 'comite'],
        'update': ['admin', 'contador'],
        'approve': ['admin', 'comite'],
        'reject': ['admin', 'comite'],
        'delete': ['admin']
      };

      console.log('🔍 Permisos necesarios para', action, ':', permissions[action]);
      console.log('🔍 Usuario tiene permiso:', permissions[action]?.includes(rol));

      if (!permissions[action]?.includes(rol)) {
        console.log('❌ Sin permisos: rol', rol, 'no puede', action);
        return res.status(403).json({ error: `No tiene permisos para ${action}` });
      }

      console.log('✅ Permisos OK para', action, 'con rol', rol);
      next();
    } catch (error) {
      console.error('❌ Error checking gasto permissions:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

/**
 * @openapi
 * /api/gastos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Gastos]
 *     summary: Listar gastos con filtros avanzados y paginación
 */
router.get('/comunidad/:comunidadId', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const {
      page = 1,
      limit = 20,
      estado,
      categoria,
      fechaDesde,
      fechaHasta,
      busqueda,
      ordenar = 'fecha',
      direccion = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE g.comunidad_id = ?';
    const queryParams = [comunidadId];

    // Filtro por rol - residentes y propietarios solo ven aprobados
    if (['residente', 'propietario'].includes(req.membership?.rol)) {
      whereClause += ' AND g.estado IN ("aprobado", "pagado")';
    }

    // Aplicar filtros adicionales
    if (estado) {
      whereClause += ' AND g.estado = ?';
      queryParams.push(estado);
    }

    if (categoria) {
      whereClause += ' AND g.categoria_id = ?';
      queryParams.push(Number(categoria));
    }

    if (fechaDesde && fechaHasta) {
      whereClause += ' AND g.fecha BETWEEN ? AND ?';
      queryParams.push(fechaDesde, fechaHasta);
    } else if (fechaDesde) {
      whereClause += ' AND g.fecha >= ?';
      queryParams.push(fechaDesde);
    } else if (fechaHasta) {
      whereClause += ' AND g.fecha <= ?';
      queryParams.push(fechaHasta);
    }

    if (busqueda) {
      whereClause += ' AND (g.glosa LIKE ? OR cg.nombre LIKE ? OR g.numero LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Validar campo de ordenamiento
    const allowedOrderFields = ['fecha', 'monto', 'created_at', 'numero', 'estado'];
    const orderField = allowedOrderFields.includes(ordenar) ? ordenar : 'fecha';
    const orderDirection = ['ASC', 'DESC'].includes(direccion.toUpperCase()) ? direccion.toUpperCase() : 'DESC';

    // ✅ CONSULTA PRINCIPAL CORREGIDA (sin proveedor_id)
    const baseQuery = `
      SELECT
        g.id,
        g.numero,
        g.comunidad_id,
        g.categoria_id,
        g.monto,
        g.fecha,
        g.glosa,
        g.estado,
        g.extraordinario,
        g.created_at,
        g.updated_at,
        g.creado_por,
        g.aprobado_por,
        g.observaciones_aprobacion,
        g.observaciones_rechazo,
        g.fecha_aprobacion,
        cg.nombre as categoria_nombre,
        cg.tipo as categoria_tipo,
        CONCAT(creador.nombres, ' ', creador.apellidos) as creado_por_nombre,
        CONCAT(aprobador.nombres, ' ', aprobador.apellidos) as aprobado_por_nombre,
        cc.nombre as centro_costo_nombre,
        COUNT(*) OVER() as total
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN persona creador ON g.creado_por = creador.id
      LEFT JOIN persona aprobador ON g.aprobado_por = aprobador.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      ${whereClause}
      ORDER BY g.${orderField} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(Number(limit), Number(offset));
    const [rows] = await db.query(baseQuery, queryParams);

    const total = rows.length > 0 ? rows[0].total : 0;
    const gastos = rows.map(({ total, ...gasto }) => ({
      ...gasto,
      monto: parseFloat(gasto.monto || 0),
      extraordinario: !!gasto.extraordinario
    }));

    res.json({
      success: true,
      data: gastos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error listing gastos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/gastos/{id}:
 *   get:
 *     tags: [Gastos]
 *     summary: Obtener detalle completo de un gasto incluyendo historial
 */
router.get('/:id', [
  authenticate
], async (req, res) => {
  try {
    const gastoId = Number(req.params.id);

    // ✅ CONSULTA DETALLE CORREGIDA (sin proveedor_id)
    const [gastos] = await db.query(`
      SELECT 
        g.*,
        cg.nombre as categoria_nombre,
        cg.tipo as categoria_tipo,
        CONCAT(creador.nombres, ' ', creador.apellidos) as creado_por_nombre,
        CONCAT(aprobador.nombres, ' ', aprobador.apellidos) as aprobado_por_nombre,
        cc.nombre as centro_costo_nombre,
        dc.folio as documento_folio,
        dc.tipo_doc as documento_tipo,
        c.razon_social as comunidad_nombre
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN persona creador ON g.creado_por = creador.id
      LEFT JOIN persona aprobador ON g.aprobado_por = aprobador.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN comunidad c ON g.comunidad_id = c.id
      WHERE g.id = ?
    `, [gastoId]);

    if (!gastos.length) {
      return res.status(404).json({
        success: false,
        error: 'Gasto no encontrado'
      });
    }

    const gasto = gastos[0];

    // Verificar permisos sobre este gasto
    const [membership] = await db.query(`
      SELECT rol FROM membresia_comunidad 
      WHERE comunidad_id = ? AND persona_id = ? AND activo = 1
    `, [gasto.comunidad_id, req.user.persona_id]);

    if (!membership.length) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para ver este gasto'
      });
    }

    // Obtener historial del gasto
    const [historial] = await db.query(`
      SELECT 
        h.accion,
        h.observaciones,
        h.fecha,
        CONCAT(p.nombres, ' ', p.apellidos) as usuario_nombre
      FROM historial_gasto h
      JOIN usuario u ON h.usuario_id = u.id
      JOIN persona p ON u.persona_id = p.id
      WHERE h.gasto_id = ?
      ORDER BY h.fecha DESC
    `, [gastoId]);

    const gastoCompleto = {
      ...gasto,
      monto: parseFloat(gasto.monto || 0),
      extraordinario: !!gasto.extraordinario,
      historial
    };

    res.json({
      success: true,
      data: gastoCompleto
    });

  } catch (error) {
    console.error('Error fetching gasto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * @openapi
 * /api/gastos/comunidad/{comunidadId}:
 *   post:
 *     tags: [Gastos]
 *     summary: Crear nuevo gasto
 */
router.post('/comunidad/:comunidadId', [
  authenticate,
  checkGastoPermission('create'),
  body('categoria_id').isInt({ min: 1 }).withMessage('Categoría es requerida'),
  body('fecha').isISO8601().withMessage('Fecha debe ser válida (YYYY-MM-DD)'),
  body('monto').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
  body('glosa').notEmpty().isLength({ min: 3, max: 500 }).withMessage('Glosa debe tener entre 3 y 500 caracteres'),
  body('centro_costo_id').optional().isInt(),
  body('documento_compra_id').optional().isInt(),
  body('extraordinario').optional().isBoolean()
], async (req, res) => {
  // Validar errores de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: errors.array()
    });
  }

  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    const comunidadId = Number(req.params.comunidadId);
    const {
      categoria_id,
      centro_costo_id,
      documento_compra_id,
      fecha,
      monto,
      glosa,
      extraordinario = false
    } = req.body;

    // Verificar que la categoría existe y pertenece a la comunidad o es global
    const [categoria] = await conexion.query(`
      SELECT id FROM categoria_gasto 
      WHERE id = ? AND (comunidad_id = ? OR comunidad_id IS NULL) AND activa = 1
    `, [categoria_id, comunidadId]);

    if (!categoria.length) {
      return res.status(400).json({
        success: false,
        error: 'Categoría no válida para esta comunidad'
      });
    }

    // Generar número correlativo por año y comunidad
    const currentYear = new Date().getFullYear();
    const [lastGasto] = await conexion.query(`
      SELECT numero FROM gasto 
      WHERE comunidad_id = ? AND numero LIKE ?
      ORDER BY numero DESC LIMIT 1
    `, [comunidadId, `G${currentYear}-%`]);

    let nextNumber = 1;
    if (lastGasto.length > 0) {
      const lastNumber = parseInt(lastGasto[0].numero.split('-')[1]) || 0;
      nextNumber = lastNumber + 1;
    }

    const numero = `G${currentYear}-${nextNumber.toString().padStart(4, '0')}`;

    // ✅ INSERT CORREGIDO (sin proveedor_id)
    const [result] = await conexion.query(`
      INSERT INTO gasto (
        comunidad_id, categoria_id, centro_costo_id, documento_compra_id,
        numero, fecha, monto, glosa, extraordinario, estado, creado_por, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', ?, NOW(), NOW())
    `, [
      comunidadId, categoria_id, centro_costo_id || null,
      documento_compra_id || null, numero, fecha, monto, glosa, extraordinario ? 1 : 0,
      req.user.persona_id
    ]);

    const gastoId = result.insertId;

    // Registrar en historial
    await conexion.query(`
      INSERT INTO historial_gasto (gasto_id, accion, usuario_id, observaciones, fecha)
      VALUES (?, 'creado', ?, 'Gasto creado en estado borrador', NOW())
    `, [gastoId, req.user.id]);

    // Registrar en auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'CREATE', 'gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      gastoId,
      JSON.stringify({ numero, monto, glosa, categoria_id, estado: 'borrador' }),
      req.ip || req.connection.remoteAddress
    ]);

    // Obtener gasto completo recién creado
    const [gastoCreado] = await conexion.query(`
      SELECT 
        g.*,
        cg.nombre as categoria_nombre,
        cg.tipo as categoria_tipo,
        CONCAT(p.nombres, ' ', p.apellidos) as creado_por_nombre
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN persona p ON g.creado_por = p.id
      WHERE g.id = ?
    `, [gastoId]);

    await conexion.commit();

    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: {
        ...gastoCreado[0],
        monto: parseFloat(gastoCreado[0].monto || 0),
        extraordinario: !!gastoCreado[0].extraordinario
      }
    });

  } catch (error) {
    await conexion.rollback();
    console.error('Error creating gasto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear gasto',
      message: error.message
    });
  } finally {
    conexion.release();
  }
});

/**
 * @openapi
 * /api/gastos/comunidad/{comunidadId}/stats:
 *   get:
 *     tags: [Gastos]
 *     summary: Obtener estadísticas de gastos para dashboard
 */
router.get('/comunidad/:comunidadId/stats', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentYear = new Date().getFullYear();

    let whereClause = 'WHERE g.comunidad_id = ?';
    const params = [comunidadId];

    // Filtro por rol - residentes solo ven aprobados
    if (['residente', 'propietario'].includes(req.membership?.rol)) {
      whereClause += ' AND g.estado IN ("aprobado", "pagado")';
    }

    // Estadísticas generales
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_gastos,
        COUNT(CASE WHEN g.estado = 'borrador' THEN 1 END) as borradores,
        COUNT(CASE WHEN g.estado = 'pendiente_aprobacion' THEN 1 END) as pendientes,
        COUNT(CASE WHEN g.estado = 'aprobado' THEN 1 END) as aprobados,
        COUNT(CASE WHEN g.estado = 'rechazado' THEN 1 END) as rechazados,
        COUNT(CASE WHEN g.estado = 'pagado' THEN 1 END) as pagados,
        COUNT(CASE WHEN g.estado = 'anulado' THEN 1 END) as anulados,
        COALESCE(SUM(g.monto), 0) as monto_total,
        COALESCE(SUM(CASE WHEN DATE_FORMAT(g.fecha, '%Y-%m') = ? THEN g.monto ELSE 0 END), 0) as monto_mes_actual,
        COALESCE(SUM(CASE WHEN YEAR(g.fecha) = ? THEN g.monto ELSE 0 END), 0) as monto_anio_actual,
        COALESCE(SUM(CASE WHEN g.extraordinario = 1 THEN g.monto ELSE 0 END), 0) as monto_extraordinarios
      FROM gasto g
      ${whereClause}
    `, [currentMonth, currentYear, ...params]);

    res.json({
      success: true,
      data: {
        resumen: {
          ...stats[0],
          monto_total: parseFloat(stats[0].monto_total || 0),
          monto_mes_actual: parseFloat(stats[0].monto_mes_actual || 0),
          monto_anio_actual: parseFloat(stats[0].monto_anio_actual || 0),
          monto_extraordinarios: parseFloat(stats[0].monto_extraordinarios || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
});

module.exports = router;