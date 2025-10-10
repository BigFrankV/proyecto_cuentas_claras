// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { checkGastoPermission } = require('../middleware/gastosPermissions');
const { requiredApprovalsForAmount } = require('../lib/aprobaciones');

/**
 * Rutas de gastos (CommonJS) — versión corregida a partir de tu lógica.
 *
 * Notas:
 * - No usar imports de React ni código frontend aquí.
 * - comunidadId <= 0 o comunidadId === 0 significa "sin filtro" (superadmin).
 * - Asume que middleware authenticate establece req.user (id, persona_id, is_superadmin).
 */

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
      whereClause += ' AND (g.glosa LIKE ? OR cg.nombre LIKE ? OR g.numero LIKE ? OR CONCAT(p.nombres," ",p.apellidos) LIKE ?)';
      const term = `%${busqueda}%`;
      queryParams.push(term, term, term, term);
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
      LEFT JOIN persona creador ON g.creado_por = creador.id
      LEFT JOIN persona aprobador ON g.aprobado_por = aprobador.id
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
      SELECT g.*, cg.nombre AS categoria_nombre, cc.nombre AS centro_costo_nombre,
             CONCAT(creador.nombres,' ',creador.apellidos) AS creado_por_nombre,
             CONCAT(aprobador.nombres,' ',aprobador.apellidos) AS aprobado_por_nombre
      FROM gasto g
      LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
      LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
      LEFT JOIN persona creador ON g.creado_por = creador.id
      LEFT JOIN persona aprobador ON g.aprobado_por = aprobador.id
      WHERE g.id = ?
    `, [id]);

    if (!gasto) return res.status(404).json({ success: false, error: 'Gasto no encontrado' });

    const [aprobaciones] = await db.query(`
      SELECT ga.*, u.username, rs.slug AS rol_slug, rs.nombre AS rol_nombre
      FROM gasto_aprobacion ga
      LEFT JOIN usuario u ON ga.usuario_id = u.id
      LEFT JOIN rol_sistema rs ON ga.rol_id = rs.id
      WHERE ga.gasto_id = ? ORDER BY ga.created_at ASC
    `, [id]);

    const [historial] = await db.query(`
      SELECT h.* , u.username
      FROM historial_gasto h
      LEFT JOIN usuario u ON h.usuario_id = u.id
      WHERE h.gasto_id = ? ORDER BY h.fecha ASC
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
      proveedor_id,
      fecha,
      monto,
      glosa,
      extraordinario = false
    } = req.body;

    const [categoria] = await conexion.query(`
      SELECT id FROM categoria_gasto 
      WHERE id = ? AND (comunidad_id = ? OR comunidad_id IS NULL) AND activa = 1
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
        comunidad_id, categoria_id, centro_costo_id, documento_compra_id, proveedor_id,
        numero, fecha, monto, glosa, extraordinario, estado, creado_por,
        required_aprobaciones, aprobaciones_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', ?, ?, 0, NOW(), NOW())
    `, [
      comunidadId,
      categoria_id,
      centro_costo_id || null,
      documento_compra_id || null,
      proveedor_id || null,
      numero,
      fecha,
      monto,
      glosa,
      extraordinario ? 1 : 0,
      req.user.persona_id,
      requiredAprob,
      0
    ]);

    const gastoId = result.insertId;

    await conexion.query(`
      INSERT INTO historial_gasto (gasto_id, accion, usuario_id, observaciones, fecha)
      VALUES (?, 'creado', ?, 'Gasto creado en estado borrador', NOW())
    `, [gastoId, req.user.id]);

    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'CREATE', 'gasto', ?, ?, ?, NOW())
    `, [
      req.user.id,
      gastoId,
      JSON.stringify({ numero, monto, glosa, categoria_id, estado: 'borrador' }),
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
      LEFT JOIN persona p ON g.creado_por = p.id
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
      whereClause += ' AND g.estado IN ("aprobado", "pagado")';
    }

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
    const rolId = req.membership?.rol_id || null;
    const { decision, observaciones, monto_aprobado } = req.body;

    await conexion.beginTransaction();

    // Insertar registro de aprobación
    await conexion.query(
      `INSERT INTO gasto_aprobacion (gasto_id, usuario_id, rol_id, decision, observaciones, monto_aprobado, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [gastoId, usuarioId, rolId, decision, observaciones || null, monto_aprobado || null]
    );

    // Registrar en historial_gasto la acción
    await conexion.query(
      `INSERT INTO historial_gasto (gasto_id, accion, usuario_id, observaciones, fecha)
       VALUES (?, ?, ?, ?, NOW())`,
      [gastoId, decision === 'aprobado' ? 'aprobado' : 'rechazado', usuarioId, observaciones || null]
    );

    // Recalcular conteo de aprobaciones y rechazadas
    const [[counts]] = await conexion.query(
      `SELECT SUM(decision='aprobado') AS aprobadas, SUM(decision='rechazado') AS rechazadas
       FROM gasto_aprobacion WHERE gasto_id = ?`, [gastoId]
    );
    const aprobadas = Number(counts?.aprobadas || 0);
    const rechazadas = Number(counts?.rechazadas || 0);

    // Obtener gasto para determinar required_aprobaciones y estado actual
    const [[gastoRow]] = await conexion.query(`SELECT required_aprobaciones, aprobaciones_count, estado FROM gasto WHERE id = ? LIMIT 1`, [gastoId]);
    if (!gastoRow) {
      await conexion.rollback();
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }

    // Actualizar aprobaciones_count
    await conexion.query(`UPDATE gasto SET aprobaciones_count = ?, updated_at = NOW() WHERE id = ?`, [aprobadas, gastoId]);

    // Determinar nuevo estado según reglas:
    // - Si aprobadas >= required_aprobaciones -> aprobado
    // - Si rechazadas > 0 and rechazadas >= required_aprobaciones -> rechazado (o si se decide la lógica distinta, ajustar)
    // - Si aun no llega a required -> pendiente_aprobacion
    let nuevoEstado = gastoRow.estado;
    const required = Number(gastoRow.required_aprobaciones || 0);
    if (aprobadas >= required && required > 0) {
      nuevoEstado = 'aprobado';
    } else if (rechazadas > 0 && (rechazadas >= required && required > 0)) {
      nuevoEstado = 'rechazado';
    } else {
      // si hay alguna aprobación y no cumple -> pendiente_aprobacion
      if (aprobadas > 0 || rechazadas > 0) nuevoEstado = 'pendiente_aprobacion';
    }

    // Actualizar estado si cambió
    if (nuevoEstado !== gastoRow.estado) {
      await conexion.query(`UPDATE gasto SET estado = ?, updated_at = NOW() WHERE id = ?`, [nuevoEstado, gastoId]);
    }

    // Auditoría de aprobación
    await conexion.query(`
      INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
      VALUES (?, 'APROBAR', 'gasto', ?, ?, ?, NOW())
    `, [
      usuarioId,
      gastoId,
      JSON.stringify({ aprobadas, rechazadas, nuevoEstado }),
      req.ip || req.connection.remoteAddress
    ]);

    await conexion.commit();

    return res.json({
      success: true,
      message: 'Aprobación registrada',
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

module.exports = router;
// ...existing code...