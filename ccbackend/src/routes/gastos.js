// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { checkGastoPermission } = require('../middleware/gastosPermissions');
const { requiredApprovalsForAmount } = require('../lib/aprobaciones');

// Documentación Swagger de gastos
require('./gastos.swagger');
/**
 * Listar gastos por comunidad (con filtros y paginación)
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

    // Construir WHERE dinámico (comunidadId <=0 => sin filtro)
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    if (comunidadId > 0) {
      whereClause += ' AND g.comunidad_id = ?';
      queryParams.push(comunidadId);
    }

    // Si el membership del request restringe, aplicar
    // Los nombres del creador y el aprobador se obtienen de la tabla `persona`
    if (req.membership && ['residente', 'propietario'].includes((req.membership.rol || '').toString().toLowerCase())) {
      whereClause += ' AND g.estado IN ("aprobado", "pagado")';
    }

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
      // Para búsquedas rápidas, usamos campos directos del gasto y de la categoría.
      whereClause += ' AND (g.glosa LIKE ? OR cg.nombre LIKE ? OR g.numero LIKE ?)';
      const term = `%${busqueda}%`;
      queryParams.push(term, term, term);
    }

    // Sanitizar campo de orden
    const allowedOrderFields = ['fecha', 'monto', 'created_at', 'numero', 'estado'];
    const orderField = allowedOrderFields.includes(ordenar) ? ordenar : 'fecha';
    const orderDirection = ['ASC', 'DESC'].includes((direccion || '').toString().toUpperCase()) ? direccion.toString().toUpperCase() : 'DESC';

    const baseQuery = `
      SELECT
        g.id,
        g.numero,
        g.comunidad_id,
        g.categoria_id,
        g.centro_costo_id,
        g.documento_compra_id,
        g.fecha,
        g.monto,
        g.glosa,
        g.extraordinario,
        g.estado,
        g.creado_por,
        g.aprobado_por,
        g.created_at,
        g.updated_at,
        cg.nombre AS categoria_nombre,
        cc.nombre AS centro_costo_nombre,
        CONCAT(creador.nombres, ' ', creador.apellidos) AS creado_por_nombre,
        CONCAT(aprobador.nombres, ' ', aprobador.apellidos) AS aprobado_por_nombre,
        COUNT(*) OVER() AS total
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN usuario u_creador ON g.creado_por = u_creador.id 
      LEFT JOIN persona creador ON u_creador.persona_id = creador.id 
      LEFT JOIN usuario u_aprobador ON g.aprobado_por = u_aprobador.id 
      LEFT JOIN persona aprobador ON u_aprobador.persona_id = aprobador.id 
      ${whereClause}
      ORDER BY g.${orderField} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(Number(limit), Number(offset));
    const [rows] = await db.query(baseQuery, queryParams);

    const total = rows.length > 0 ? Number(rows[0].total || 0) : 0;
    const gastos = rows.map(({ total: _t, monto, extraordinario, ...g }) => ({
      ...g,
      monto: parseFloat(monto || 0),
      extraordinario: !!extraordinario
    }));

    return res.json({
      success: true,
      data: gastos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: total > 0 ? Math.ceil(total / Number(limit)) : 0
      }
    });
  } catch (error) {
    console.error('Error listing gastos:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor', message: error.message });
  }
});

/**
 * Obtener detalle de gasto (incluye aprobaciones e historial)
 */
router.get('/:id', [ authenticate ], async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [[gasto]] = await db.query(`
      SELECT 
        g.*, 
        cg.nombre AS categoria_nombre, 
        cc.nombre AS centro_costo_nombre,
        -- Se corrigió el mapeo de ID's de usuario a nombres de persona en el JOIN
        CONCAT(p_creador.nombres,' ',p_creador.apellidos) AS creado_por_nombre,
        CONCAT(p_aprobador.nombres,' ',p_aprobador.apellidos) AS aprobado_por_nombre
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      -- JOIN para el creador
      LEFT JOIN usuario u_creador ON g.creado_por = u_creador.id
      LEFT JOIN persona p_creador ON u_creador.persona_id = p_creador.id 
      -- JOIN para el aprobador
      LEFT JOIN usuario u_aprobador ON g.aprobado_por = u_aprobador.id
      LEFT JOIN persona p_aprobador ON u_aprobador.persona_id = p_aprobador.id 
      WHERE g.id = ?
    `, [id]);

    if (!gasto) return res.status(404).json({ success: false, error: 'Gasto no encontrado' });

    const [aprobaciones] = await db.query(`
      SELECT ga.*, u.username, rs.codigo AS rol_codigo, rs.nombre AS rol_nombre
      FROM gasto_aprobacion ga
      LEFT JOIN usuario u ON ga.usuario_id = u.id
      LEFT JOIN rol_sistema rs ON ga.rol_id = rs.id
      WHERE ga.gasto_id = ? ORDER BY ga.created_at ASC
    `, [id]);

    const [historial] = await db.query(`
      SELECT 
        h.*, 
        u.username,
        CONCAT(p.nombres, ' ', p.apellidos) AS usuario_nombre -- Se incluye nombre de la persona
      FROM historial_gasto h
      LEFT JOIN usuario u ON h.usuario_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id -- Se corrige y añade JOIN a persona
      WHERE h.gasto_id = ? ORDER BY h.created_at ASC -- Se corrige el ORDER BY a created_at
    `, [id]);

    return res.json({ success: true, data: { gasto, aprobaciones, historial } });
  } catch (err) {
    console.error('Error GET /gastos/:id', err);
    return res.status(500).json({ success: false, error: 'Server error', message: err.message });
  }
});

/**
 * Crear gasto
 */
router.post('/comunidad/:comunidadId', [
  authenticate,
  checkGastoPermission('create'),
  body('categoria_id').isInt({ min: 1 }).withMessage('Categoría es requerida'),
  body('fecha').isISO8601().withMessage('Fecha debe ser válida (YYYY-MM-DD)'),
  body('monto').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
  body('glosa').notEmpty().isLength({ min: 3, max: 500 }).withMessage('Glosa debe tener entre 3 y 500 caracteres'),
  body('centro_costo_id').optional().isInt(),
  body('proveedor_id').optional().isInt(),
  body('documento_compra_id').optional().isInt(),
  body('extraordinario').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Datos inválidos', details: errors.array() });
  }

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const comunidadId = Number(req.params.comunidadId);
    const {
      categoria_id,
      centro_costo_id,
      documento_compra_id,
      proveedor_id, // Variable que ya no se usa, pero se mantiene para claridad
      fecha,
      monto,
      glosa,
      extraordinario = false
    } = req.body;

    const [categoria] = await conexion.query(`
      SELECT id FROM categoria_gasto 
      WHERE id = ? AND comunidad_id = ? AND activa = 1
    `, [categoria_id, comunidadId]);

    if (!categoria.length) {
      await conexion.rollback();
      return res.status(400).json({ success: false, error: 'Categoría no válida para esta comunidad' });
    }

    const currentYear = new Date().getFullYear();
    const [lastGasto] = await conexion.query(`
      SELECT numero FROM gasto 
      WHERE comunidad_id = ? AND numero LIKE ?
      ORDER BY id DESC LIMIT 1
    `, [comunidadId, `G${currentYear}-%`]);

    let nextNumber = 1;
    if (lastGasto.length > 0) {
      const parts = (lastGasto[0].numero || '').split('-');
      const lastNumber = parseInt(parts[1] || '0') || 0;
      nextNumber = lastNumber + 1;
    }

    const numero = `G${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    const requiredAprob = requiredApprovalsForAmount(Number(monto));

    const [result] = await conexion.query(`
      INSERT INTO gasto (
        comunidad_id, categoria_id, centro_costo_id, documento_compra_id,
        numero, fecha, monto, glosa, extraordinario, estado, creado_por,
        required_aprobaciones, aprobaciones_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, 0, NOW(), NOW())
      -- Se usa 'pendiente', un estado válido en la base de datos.
    `, [
      comunidadId,
      categoria_id,
      centro_costo_id || null,
      documento_compra_id || null,
      numero,
      fecha,
      monto,
      glosa,
      extraordinario ? 1 : 0,
      req.user.id, // creado_por es usuario_id (req.user.id)
      requiredAprob,
    ]);

    const gastoId = result.insertId;

    await conexion.query(`
      INSERT INTO historial_gasto (gasto_id, campo_modificado, usuario_id, valor_nuevo, created_at) 
      VALUES (?, 'estado', ?, 'creado/pendiente', NOW()) 
    `, [gastoId, req.user.id]);

    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'CREATE', 'gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      gastoId,
      JSON.stringify({ numero, monto, glosa, categoria_id, estado: 'pendiente' }),
      req.ip || req.connection.remoteAddress
    ]);

    const [gastoCreado] = await conexion.query(`
      SELECT 
        g.*,
        cg.nombre as categoria_nombre,
        cg.tipo as categoria_tipo,
        CONCAT(p.nombres, ' ', p.apellidos) as creado_por_nombre
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN usuario u ON g.creado_por = u.id 
      LEFT JOIN persona p ON u.persona_id = p.id 
      WHERE g.id = ?
    `, [gastoId]);

    await conexion.commit();

    return res.status(201).json({
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
    return res.status(500).json({ success: false, error: 'Error al crear gasto', message: error.message });
  } finally {
    conexion.release();
  }
});

/**
 * Estadísticas por comunidad (dashboard)
 */
router.get('/comunidad/:comunidadId/stats', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentYear = new Date().getFullYear();

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (comunidadId > 0) {
      whereClause += ' AND g.comunidad_id = ?';
      params.push(comunidadId);
    }

    if (req.membership && ['residente', 'propietario'].includes((req.membership.rol || '').toString().toLowerCase())) {
      // Se mantiene la lógica: los residentes solo ven aprobados (o pendientes en el flujo de su app)
      whereClause += ' AND g.estado IN ("aprobado", "pendiente")'; 
    }

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_gastos,
        COUNT(CASE WHEN g.estado = 'pendiente' AND g.aprobaciones_count = 0 THEN 1 END) as borradores, 
        COUNT(CASE WHEN g.estado = 'pendiente' AND g.aprobaciones_count > 0 THEN 1 END) as pendientes, 
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

    const s = stats[0] || {};
    return res.json({
      success: true,
      data: {
        resumen: {
          total_gastos: Number(s.total_gastos || 0),
          borradores: Number(s.borradores || 0),
          pendientes: Number(s.pendientes || 0),
          aprobados: Number(s.aprobados || 0),
          rechazados: Number(s.rechazados || 0),
          pagados: Number(s.pagados || 0),
          anulados: Number(s.anulados || 0),
          monto_total: parseFloat(s.monto_total || 0),
          monto_mes_actual: parseFloat(s.monto_mes_actual || 0),
          monto_anio_actual: parseFloat(s.monto_anio_actual || 0),
          monto_extraordinarios: parseFloat(s.monto_extraordinarios || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo estadísticas', message: error.message });
  }
});

/**
 * Registrar/actualizar una aprobación (aprobar o rechazar)
 */
router.post('/:id/aprobaciones', [
  authenticate,
  checkGastoPermission('approve')
], async (req, res) => {
  const conexion = await db.getConnection();
  try {
    const gastoId = Number(req.params.id);
    const usuarioId = req.user.id;
    // Se obtiene rol_id del membership (se asume que fue validado en el middleware)
    const rolId = req.membership?.rol_id || null; 
    const { decision, observaciones, monto_aprobado } = req.body;

    // Validación: 'decision' debe ser 'aprobar' o 'rechazar' (enum en DB)
    if (!['aprobar', 'rechazar'].includes(decision)) {
        await conexion.rollback();
        return res.status(400).json({ success: false, error: 'Decisión de aprobación no válida' });
    }

    await conexion.beginTransaction();

    // 1. Insertar registro de aprobación
    await conexion.query(
      // Se usa 'accion' que es el nombre de la columna en la BD.
      `INSERT INTO gasto_aprobacion (gasto_id, usuario_id, rol_id, accion, observaciones, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [gastoId, usuarioId, rolId, decision, observaciones || null]
    );

    // 2. Registrar en historial_gasto la acción
    await conexion.query(
      `INSERT INTO historial_gasto (gasto_id, campo_modificado, usuario_id, valor_nuevo, created_at)
       VALUES (?, 'aprobacion_accion', ?, ?, NOW())`,
      [gastoId, usuarioId, decision]
    );

    // 3. Recalcular conteo de aprobaciones y rechazadas
    const [[counts]] = await conexion.query(
      `SELECT SUM(accion='aprobar') AS aprobadas, SUM(accion='rechazar') AS rechazadas
       FROM gasto_aprobacion WHERE gasto_id = ?`, [gastoId]
    );
    const aprobadas = Number(counts?.aprobadas || 0);
    const rechazadas = Number(counts?.rechazadas || 0);

    // 4. Obtener gasto para determinar required_aprobaciones y estado actual
    const [[gastoRow]] = await conexion.query(`SELECT required_aprobaciones, aprobaciones_count, estado FROM gasto WHERE id = ? LIMIT 1`, [gastoId]);
    if (!gastoRow) {
      await conexion.rollback();
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }

    // 5. Determinar nuevo estado
    let nuevoEstado = gastoRow.estado;
    const required = Number(gastoRow.required_aprobaciones || 0);
    
    if (rechazadas > 0) {
      nuevoEstado = 'rechazado'; 
    } else if (aprobadas >= required && required > 0) {
      nuevoEstado = 'aprobado';
    } else {
      nuevoEstado = 'pendiente'; // Se usa 'pendiente' como estado estándar para "en proceso" o "recién creado"
    }

    // 6. Actualizar estado y aprobaciones_count
    await conexion.query(`UPDATE gasto SET aprobaciones_count = ?, updated_at = NOW() WHERE id = ?`, [aprobadas, gastoId]);
    
    if (nuevoEstado !== gastoRow.estado) {
      const aprobadorId = (nuevoEstado === 'aprobado') ? usuarioId : null;
      
      await conexion.query(`
        UPDATE gasto SET 
          estado = ?, 
          aprobado_por = ?, 
          updated_at = NOW() 
        WHERE id = ?
      `, [nuevoEstado, aprobadorId, gastoId]);
    }

    // 7. Auditoría de aprobación
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, ?, 'gasto', ?, ?, ?, NOW())
    `, [
      usuarioId,
      decision.toUpperCase(), // Se usa la acción (APROBAR/RECHAZAR) para la auditoría
      gastoId,
      JSON.stringify({ aprobadas, rechazadas, nuevoEstado, decision, observaciones }),
      req.ip || req.connection.remoteAddress
    ]);

    await conexion.commit();

    return res.json({
      success: true,
      message: `Gasto ${decision} registrado. Nuevo estado: ${nuevoEstado}`,
      data: { gasto_id: gastoId, aprobadas, rechazadas, estado: nuevoEstado }
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error en POST /gastos/:id/aprobaciones', error);
    return res.status(500).json({ success: false, error: 'Error registrando aprobación', message: error.message });
  } finally {
    conexion.release();
  }
});

/**
 * Gastos por categoría
 */
router.get('/comunidad/:comunidadId/por-categoria', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { fechaDesde, fechaHasta, estado } = req.query;

    let whereClause = 'WHERE cg.comunidad_id = ? AND cg.activa = 1';
    const params = [comunidadId];

    let gastoFilters = 'AND g.comunidad_id = ?';
    const gastoParams = [comunidadId];

    if (fechaDesde) {
      gastoFilters += ' AND g.fecha >= ?';
      gastoParams.push(fechaDesde);
    }
    if (fechaHasta) {
      gastoFilters += ' AND g.fecha <= ?';
      gastoParams.push(fechaHasta);
    }
    if (estado) {
      gastoFilters += ' AND g.estado = ?';
      gastoParams.push(estado);
    }

    const [categorias] = await db.query(`
      SELECT 
        cg.id as categoryId,
        cg.nombre as categoryName,
        cg.tipo as categoryType,
        COUNT(g.id) as expenseCount,
        COALESCE(SUM(g.monto), 0) as totalAmount,
        AVG(g.monto) as averageAmount,
        MIN(g.monto) as minAmount,
        MAX(g.monto) as maxAmount,
        ROUND((COALESCE(SUM(g.monto), 0) / 
               NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?), 0) * 100), 2) as percentage
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id ${gastoFilters}
      ${whereClause}
      GROUP BY cg.id, cg.nombre, cg.tipo
      HAVING expenseCount > 0
      ORDER BY totalAmount DESC
    `, [...gastoParams, comunidadId, ...params]);

    return res.json({
      success: true,
      data: categorias.map(c => ({
        ...c,
        totalAmount: parseFloat(c.totalAmount || 0),
        averageAmount: parseFloat(c.averageAmount || 0),
        minAmount: parseFloat(c.minAmount || 0),
        maxAmount: parseFloat(c.maxAmount || 0),
        percentage: parseFloat(c.percentage || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting gastos por categoria:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Gastos por proveedor
 */
router.get('/comunidad/:comunidadId/por-proveedor', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { fechaDesde, fechaHasta, limite = 10 } = req.query;

    let dateFilters = '';
    const params = [comunidadId, comunidadId];

    if (fechaDesde) {
      dateFilters += ' AND dc.fecha_emision >= ?';
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      dateFilters += ' AND dc.fecha_emision <= ?';
      params.push(fechaHasta);
    }

    params.push(Number(limite));

    const [proveedores] = await db.query(`
      SELECT 
        p.id as providerId,
        p.razon_social as providerName,
        p.rut,
        p.dv,
        CONCAT(p.rut, '-', p.dv) as fullRut,
        COUNT(DISTINCT dc.id) as documentCount,
        COUNT(DISTINCT g.id) as expenseCount,
        COALESCE(SUM(dc.total), 0) as totalAmount,
        AVG(dc.total) as averageAmount,
        MAX(dc.fecha_emision) as lastPurchaseDate,
        ROUND((COALESCE(SUM(dc.total), 0) / 
               NULLIF((SELECT SUM(dc2.total) 
                FROM documento_compra dc2 
                WHERE dc2.comunidad_id = ?), 0) * 100), 2) as percentage
      FROM proveedor p
      LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id 
        AND dc.comunidad_id = ? ${dateFilters}
      LEFT JOIN gasto g ON dc.id = g.documento_compra_id
      WHERE p.comunidad_id = ? AND p.activo = 1
      GROUP BY p.id, p.razon_social, p.rut, p.dv
      HAVING documentCount > 0
      ORDER BY totalAmount DESC
      LIMIT ?
    `, [...params, comunidadId]);

    return res.json({
      success: true,
      data: proveedores.map(p => ({
        ...p,
        totalAmount: parseFloat(p.totalAmount || 0),
        averageAmount: parseFloat(p.averageAmount || 0),
        percentage: parseFloat(p.percentage || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting gastos por proveedor:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Gastos por centro de costo
 */
router.get('/comunidad/:comunidadId/por-centro-costo', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { fechaDesde, fechaHasta, estado } = req.query;

    let gastoFilters = 'AND g.comunidad_id = ?';
    const params = [comunidadId, comunidadId]; 

    if (fechaDesde) {
      gastoFilters += ' AND g.fecha >= ?';
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      gastoFilters += ' AND g.fecha <= ?';
      params.push(fechaHasta);
    }
    if (estado) {
      gastoFilters += ' AND g.estado = ?';
      params.push(estado);
    }
    
    params.push(comunidadId);

    const [centros] = await db.query(`
      SELECT 
        cc.id as costCenterId,
        cc.nombre as costCenterName,
        cc.codigo as costCenterCode,
        COUNT(g.id) as expenseCount,
        COALESCE(SUM(g.monto), 0) as totalAmount,
        AVG(g.monto) as averageAmount,
        ROUND((COALESCE(SUM(g.monto), 0) / 
               NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?), 0) * 100), 2) as percentage
      FROM centro_costo cc
      LEFT JOIN gasto g ON cc.id = g.centro_costo_id ${gastoFilters}
      WHERE cc.comunidad_id = ?
      GROUP BY cc.id, cc.nombre, cc.codigo
      HAVING expenseCount > 0
      ORDER BY totalAmount DESC
    `, params);

    return res.json({
      success: true,
      data: centros.map(c => ({
        ...c,
        totalAmount: parseFloat(c.totalAmount || 0),
        averageAmount: parseFloat(c.averageAmount || 0),
        percentage: parseFloat(c.percentage || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting gastos por centro de costo:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Evolución temporal de gastos (por mes)
 */
router.get('/comunidad/:comunidadId/evolucion-temporal', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { meses = 12 } = req.query;

    const [evolucion] = await db.query(`
      SELECT 
        DATE_FORMAT(g.fecha, '%Y-%m') as period,
        DATE_FORMAT(g.fecha, '%Y') as year,
        DATE_FORMAT(g.fecha, '%m') as month,
        DATE_FORMAT(g.fecha, '%M %Y') as monthName,
        COUNT(*) as expenseCount,
        COALESCE(SUM(g.monto), 0) as totalAmount,
        AVG(g.monto) as averageAmount,
        SUM(CASE WHEN g.estado = 'aprobado' THEN 1 ELSE 0 END) as approvedCount,
        SUM(CASE WHEN g.estado = 'aprobado' THEN g.monto ELSE 0 END) as approvedAmount,
        SUM(CASE WHEN g.estado = 'pendiente' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN g.estado = 'pendiente' THEN g.monto ELSE 0 END) as pendingAmount,
        SUM(CASE WHEN g.extraordinario = 1 THEN g.monto ELSE 0 END) as extraordinaryAmount,
        SUM(CASE WHEN g.extraordinario = 0 THEN g.monto ELSE 0 END) as regularAmount
      FROM gasto g
      WHERE g.comunidad_id = ?
      AND g.fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH)
      GROUP BY 
        DATE_FORMAT(g.fecha, '%Y-%m'),
        DATE_FORMAT(g.fecha, '%Y'),
        DATE_FORMAT(g.fecha, '%m'),
        DATE_FORMAT(g.fecha, '%M %Y')
      ORDER BY period DESC
    `, [comunidadId, Number(meses)]);

    return res.json({
      success: true,
      data: evolucion.map(e => ({
        ...e,
        totalAmount: parseFloat(e.totalAmount || 0),
        averageAmount: parseFloat(e.averageAmount || 0),
        approvedAmount: parseFloat(e.approvedAmount || 0),
        pendingAmount: parseFloat(e.pendingAmount || 0),
        extraordinaryAmount: parseFloat(e.extraordinaryAmount || 0),
        regularAmount: parseFloat(e.regularAmount || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting evolucion temporal:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Top gastos mayores
 */
router.get('/comunidad/:comunidadId/top-gastos', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { fechaDesde, fechaHasta, estado, limite = 10 } = req.query;

    let whereClause = 'WHERE g.comunidad_id = ?';
    const params = [comunidadId];

    if (fechaDesde) {
      whereClause += ' AND g.fecha >= ?';
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      whereClause += ' AND g.fecha <= ?';
      params.push(fechaHasta);
    }
    if (estado) {
      whereClause += ' AND g.estado = ?';
      params.push(estado);
    }

    params.push(Number(limite));

    const [topGastos] = await db.query(`
      SELECT 
        g.id,
        g.numero,
        g.glosa as description,
        g.fecha as date,
        g.monto as amount,
        g.estado as status,
        cg.nombre as category,
        p.razon_social as provider,
        cc.nombre as costCenter
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      ${whereClause}
      ORDER BY g.monto DESC
      LIMIT ?
    `, params);

    return res.json({
      success: true,
      data: topGastos.map(g => ({
        ...g,
        amount: parseFloat(g.amount || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting top gastos:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Gastos pendientes de aprobación
 */
router.get('/comunidad/:comunidadId/pendientes-aprobacion', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const [pendientes] = await db.query(`
      SELECT 
        g.id,
        g.numero,
        g.glosa as description,
        g.fecha as date,
        g.monto as amount,
        g.required_aprobaciones as requiredApprovals,
        g.aprobaciones_count as currentApprovals,
        (g.required_aprobaciones - g.aprobaciones_count) as pendingApprovals,
        cg.nombre as category,
        p.razon_social as provider,
        per.nombres as creatorFirstName,
        per.apellidos as creatorLastName,
        g.created_at as createdAt,
        DATEDIFF(CURRENT_DATE(), g.created_at) as daysWaiting
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      LEFT JOIN usuario u ON g.creado_por = u.id 
      LEFT JOIN persona per ON u.persona_id = per.id 
      WHERE g.comunidad_id = ?
      AND g.estado = 'pendiente'
      AND g.aprobaciones_count < g.required_aprobaciones
      ORDER BY daysWaiting DESC, g.monto DESC
    `, [comunidadId]);

    return res.json({
      success: true,
      data: pendientes.map(p => ({
        ...p,
        amount: parseFloat(p.amount || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting pendientes aprobacion:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Alertas de gastos que necesitan atención
 */
router.get('/comunidad/:comunidadId/alertas', [
  authenticate,
  checkGastoPermission('read')
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const [alertas] = await db.query(`
      SELECT 
        'Pendientes de aprobación' as alert_type,
        COUNT(*) as count,
        SUM(g.monto) as total_amount
      FROM gasto g
      WHERE g.comunidad_id = ?
      AND g.estado = 'pendiente'
      AND g.aprobaciones_count < g.required_aprobaciones

      UNION ALL

      SELECT 
        'Vencidos sin aprobar' as alert_type,
        COUNT(*) as count,
        SUM(g.monto) as total_amount
      FROM gasto g
      WHERE g.comunidad_id = ?
      AND g.estado = 'pendiente'
      AND g.fecha < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)

      UNION ALL

      SELECT 
        'Sin documento adjunto' as alert_type,
        COUNT(*) as count,
        SUM(g.monto) as total_amount
      FROM gasto g
      WHERE g.comunidad_id = ?
      AND g.estado = 'aprobado'
      AND NOT EXISTS (
        SELECT 1 FROM archivos a 
        WHERE a.entity_type = 'gasto' 
        AND a.entity_id = g.id 
        AND a.is_active = 1
      )
    `, [comunidadId, comunidadId, comunidadId]);

    return res.json({
      success: true,
      data: alertas.map(a => ({
        ...a,
        count: Number(a.count || 0),
        total_amount: parseFloat(a.total_amount || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting alertas:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo datos', message: error.message });
  }
});

/**
 * Historial de cambios de un gasto
 */
router.get('/:id/historial', [
  authenticate
], async (req, res) => {
  try {
    const gastoId = Number(req.params.id);

    const [historial] = await db.query(`
      SELECT 
        hg.id,
        hg.gasto_id as expenseId,
        hg.campo_modificado as field,
        hg.valor_anterior as oldValue,
        hg.valor_nuevo as newValue,
        hg.created_at as changedAt,
        hg.usuario_id as userId,
        u.username,
        CONCAT(p.nombres, ' ', p.apellidos) AS usuario_nombre
      FROM historial_gasto hg
      LEFT JOIN usuario u ON hg.usuario_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id
      WHERE hg.gasto_id = ?
      ORDER BY hg.created_at DESC
    `, [gastoId]);

    return res.json({
      success: true,
      data: historial
    });
  } catch (error) {
    console.error('Error getting historial:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo historial', message: error.message });
  }
});

/**
 * Historial de aprobaciones de un gasto
 */
router.get('/:id/aprobaciones', [
  authenticate
], async (req, res) => {
  try {
    const gastoId = Number(req.params.id);

    const [aprobaciones] = await db.query(`
      SELECT 
        ga.id,
        ga.gasto_id as expenseId,
        ga.accion as action,
        ga.observaciones as comments,
        ga.created_at as approvalDate,
        ga.usuario_id as userId,
        u.username,
        CONCAT(p.nombres, ' ', p.apellidos) AS usuario_nombre, -- Se incluye nombre del aprobador
        ga.rol_id as roleId,
        r.nombre as roleName,
        r.descripcion as roleDescription
      FROM gasto_aprobacion ga
      LEFT JOIN usuario u ON ga.usuario_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id -- Se añade JOIN a persona
      LEFT JOIN rol_sistema r ON ga.rol_id = r.id
      WHERE ga.gasto_id = ?
      ORDER BY ga.created_at DESC
    `, [gastoId]);

    return res.json({
      success: true,
      data: aprobaciones
    });
  } catch (error) {
    console.error('Error getting aprobaciones:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo aprobaciones', message: error.message });
  }
});

/**
 * Archivos adjuntos de un gasto
 */
router.get('/:id/archivos', [
  authenticate
], async (req, res) => {
  try {
    const gastoId = Number(req.params.id);

    const [archivos] = await db.query(`
      SELECT 
        a.id,
        a.original_name as name,
        a.filename as storedName,
        a.file_path as path,
        a.file_size as size,
        a.mimetype as type,
        a.category,
        a.description,
        a.uploaded_at as uploadedAt,
        a.uploaded_by as uploadedById,
        u.username as uploadedBy,
        CONCAT(p.nombres, ' ', p.apellidos) AS uploaderName, -- Se incluye nombre de la persona
        a.is_active as isActive
      FROM archivos a
      LEFT JOIN usuario u ON a.uploaded_by = u.id
      LEFT JOIN persona p ON u.persona_id = p.id -- Se añade JOIN a persona
      WHERE a.entity_type = 'gasto'
      AND a.entity_id = ?
      AND a.is_active = 1
      ORDER BY a.uploaded_at DESC
    `, [gastoId]);

    return res.json({
      success: true,
      data: archivos.map(a => ({
        ...a,
        size: Number(a.size || 0)
      }))
    });
  } catch (error) {
    console.error('Error getting archivos:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo archivos', message: error.message });
  }
});

/**
 * Emisiones donde está incluido el gasto
 */
router.get('/:id/emisiones', [
  authenticate
], async (req, res) => {
  try {
    const gastoId = Number(req.params.id);

    const [info] = await db.query(`
      SELECT 
        g.id as expenseId,
        COUNT(DISTINCT deg.emision_id) as emissionCount,
        GROUP_CONCAT(DISTINCT egc.periodo ORDER BY egc.periodo) as periods,
        SUM(deg.monto) as totalDistributed,
        (g.monto - COALESCE(SUM(deg.monto), 0)) as remainingAmount
      FROM gasto g
      LEFT JOIN detalle_emision_gastos deg ON g.id = deg.gasto_id
      LEFT JOIN emision_gastos_comunes egc ON deg.emision_id = egc.id
      WHERE g.id = ?
      GROUP BY g.id, g.monto
    `, [gastoId]);

    const [detalles] = await db.query(`
      SELECT 
        egc.id as emissionId,
        egc.periodo,
        egc.estado as status,
        deg.monto as distributedAmount,
        deg.regla_prorrateo as distributionRule,
        deg.metadata_json as distributionMetadata
      FROM detalle_emision_gastos deg
      JOIN emision_gastos_comunes egc ON deg.emision_id = egc.id
      WHERE deg.gasto_id = ?
      ORDER BY egc.periodo DESC
    `, [gastoId]);

    return res.json({
      success: true,
      data: {
        resumen: info[0] ? {
          ...info[0],
          emissionCount: Number(info[0].emissionCount || 0),
          totalDistributed: parseFloat(info[0].totalDistributed || 0),
          remainingAmount: parseFloat(info[0].remainingAmount || 0)
        } : null,
        emisiones: detalles.map(d => ({
          ...d,
          distributedAmount: parseFloat(d.distributedAmount || 0),
          distributionMetadata: d.distributionMetadata ? JSON.parse(d.distributionMetadata) : null
        }))
      }
    });
  } catch (error) {
    console.error('Error getting emisiones:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo emisiones', message: error.message });
  }
});

/**
 * Actualizar gasto
 */
router.put('/:id', [
  authenticate,
  checkGastoPermission('update'),
  body('categoria_id').optional().isInt({ min: 1 }),
  body('fecha').optional().isISO8601(),
  body('monto').optional().isFloat({ min: 0.01 }),
  body('glosa').optional().notEmpty().isLength({ min: 3, max: 500 }),
  body('centro_costo_id').optional().isInt(),
  body('extraordinario').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Datos inválidos', details: errors.array() });
  }

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const gastoId = Number(req.params.id);
    const {
      categoria_id,
      centro_costo_id,
      fecha,
      monto,
      glosa,
      extraordinario
    } = req.body;

    // Obtener valores actuales
    const [[gastoActual]] = await conexion.query('SELECT * FROM gasto WHERE id = ?', [gastoId]);
    
    if (!gastoActual) {
      await conexion.rollback();
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }

    // Solo permitir edición de borradores o pendientes
    if (!['pendiente'].includes(gastoActual.estado)) { 
      await conexion.rollback();
      return res.status(400).json({ success: false, error: 'Solo se pueden editar gastos en estado pendiente' });
    }

    // Registrar cambios en historial
    const cambios = [];
    if (monto !== undefined && parseFloat(monto) !== parseFloat(gastoActual.monto)) {
      cambios.push({ campo: 'monto', anterior: gastoActual.monto, nuevo: monto });
    }
    if (glosa !== undefined && glosa !== gastoActual.glosa) {
      cambios.push({ campo: 'glosa', anterior: gastoActual.glosa, nuevo: glosa });
    }
    if (fecha !== undefined && fecha !== gastoActual.fecha) {
      cambios.push({ campo: 'fecha', anterior: gastoActual.fecha, nuevo: fecha });
    }
    if (categoria_id !== undefined && categoria_id !== gastoActual.categoria_id) {
      cambios.push({ campo: 'categoria_id', anterior: gastoActual.categoria_id, nuevo: categoria_id });
    }
    if (centro_costo_id !== undefined && centro_costo_id !== gastoActual.centro_costo_id) {
      cambios.push({ campo: 'centro_costo_id', anterior: gastoActual.centro_costo_id, nuevo: centro_costo_id });
    }

    // Insertar cambios en historial
    for (const cambio of cambios) {
      await conexion.query(
        `INSERT INTO historial_gasto (gasto_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [gastoId, req.user.id, cambio.campo, String(cambio.anterior), String(cambio.nuevo)]
      );
    }

    // Actualizar gasto
    await conexion.query(`
      UPDATE gasto
      SET 
        categoria_id = COALESCE(?, categoria_id),
        centro_costo_id = COALESCE(?, centro_costo_id),
        fecha = COALESCE(?, fecha),
        monto = COALESCE(?, monto),
        glosa = COALESCE(?, glosa),
        extraordinario = COALESCE(?, extraordinario),
        updated_at = NOW()
      WHERE id = ?
    `, [
      categoria_id || null,
      centro_costo_id || null,
      fecha || null,
      monto || null,
      glosa || null,
      extraordinario !== undefined ? (extraordinario ? 1 : 0) : null,
      gastoId
    ]);

    // Auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'UPDATE', 'gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      gastoId,
      JSON.stringify(req.body),
      req.ip || req.connection.remoteAddress
    ]);

    await conexion.commit();

    // Obtener gasto actualizado
    const [[gastoActualizado]] = await conexion.query(`
      SELECT 
        g.*,
        cg.nombre as categoria_nombre,
        cc.nombre as centro_costo_nombre
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      WHERE g.id = ?
    `, [gastoId]);

    return res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: {
        ...gastoActualizado,
        monto: parseFloat(gastoActualizado.monto || 0),
        extraordinario: !!gastoActualizado.extraordinario
      }
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error updating gasto:', error);
    return res.status(500).json({ success: false, error: 'Error al actualizar gasto', message: error.message });
  } finally {
    conexion.release();
  }
});

/**
 * Eliminar gasto (solo borradores)
 */
router.delete('/:id', [
  authenticate,
  checkGastoPermission('delete')
], async (req, res) => {
  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const gastoId = Number(req.params.id);

    const [[gasto]] = await conexion.query('SELECT estado FROM gasto WHERE id = ?', [gastoId]);
    
    if (!gasto) {
      await conexion.rollback();
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }

    if (gasto.estado !== 'pendiente') { 
      await conexion.rollback();
      return res.status(400).json({ success: false, error: 'Solo se pueden eliminar gastos en estado pendiente' });
    }

    // Eliminar archivos (soft delete)
    await conexion.query(
      `UPDATE archivos SET is_active = 0, uploaded_at = NOW() 
       WHERE entity_type = 'gasto' AND entity_id = ?`,
      [gastoId]
    );

    // Eliminar historial y aprobaciones (Las FK con CASCADE deberían hacer esto, pero se mantiene la limpieza explícita)
    await conexion.query('DELETE FROM historial_gasto WHERE gasto_id = ?', [gastoId]);
    await conexion.query('DELETE FROM gasto_aprobacion WHERE gasto_id = ?', [gastoId]);

    // Eliminar gasto
    await conexion.query('DELETE FROM gasto WHERE id = ?', [gastoId]);

    // Auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, ip_address, created_at)
      VALUES (?, 'DELETE', 'gasto', ?, ?, NOW())
    `, [
      req.user.id,
      gastoId,
      req.ip || req.connection.remoteAddress
    ]);

    await conexion.commit();

    return res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error deleting gasto:', error);
    return res.status(500).json({ success: false, error: 'Error al eliminar gasto', message: error.message });
  } finally {
    conexion.release();
  }
});

/**
 * Anular gasto
 */
router.post('/:id/anular', [
  authenticate,
  checkGastoPermission('cancel'),
  body('motivo').notEmpty().withMessage('El motivo es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Datos inválidos', details: errors.array() });
  }

  const conexion = await db.getConnection();
  try {
    await conexion.beginTransaction();

    const gastoId = Number(req.params.id);
    const { motivo } = req.body;

    // Verificar que el gasto no esté en emisiones cerradas
    const [[emisionesCerradas]] = await conexion.query(
      `SELECT COUNT(*) as count
       FROM detalle_emision_gastos deg
       JOIN emision_gastos_comunes egc ON deg.emision_id = egc.id
       WHERE deg.gasto_id = ?
       AND egc.estado IN ('emitido', 'cerrado')`,
      [gastoId]
    );

    if (emisionesCerradas.count > 0) {
      await conexion.rollback();
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede anular un gasto incluido en emisiones cerradas' 
      });
    }

    // Anular gasto
    await conexion.query(
      `UPDATE gasto
       SET estado = 'anulado', anulado_por = ?, fecha_anulacion = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [req.user.id, gastoId] // anulado_por es usuario_id (req.user.id)
    );

    // Registrar en historial
    await conexion.query(
      `INSERT INTO historial_gasto (gasto_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo, created_at)
       VALUES (?, ?, 'estado', 'aprobado', 'anulado', NOW()) -- Asumiendo 'aprobado' como estado anterior para una anulación de gasto activo
       `,
      [gastoId, req.user.id]
    );

    // Auditoría
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'ANULAR', 'gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      gastoId,
      JSON.stringify({ motivo }),
      req.ip || req.connection.remoteAddress
    ]);

    await conexion.commit();

    return res.json({
      success: true,
      message: 'Gasto anulado exitosamente'
    });
  } catch (error) {
    await conexion.rollback();
    console.error('Error anulando gasto:', error);
    return res.status(500).json({ success: false, error: 'Error al anular gasto', message: error.message });
  } finally {
    conexion.release();
  }
});

module.exports = router;