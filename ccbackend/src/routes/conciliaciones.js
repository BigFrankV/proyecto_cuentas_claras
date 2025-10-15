// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * components:
 *   schemas:
 *     Conciliacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la conciliación
 *         codigo:
 *           type: string
 *           description: Código generado (CONC-YYYY-NNNN)
 *           example: "CONC-2024-0001"
 *         fechaMovimiento:
 *           type: string
 *           format: date
 *           description: Fecha del movimiento bancario
 *         glosa:
 *           type: string
 *           description: Descripción del movimiento
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del movimiento
 *         tipo:
 *           type: string
 *           enum: [credito, debito, otro]
 *           description: Tipo de movimiento derivado del monto
 *         referenciaBancaria:
 *           type: string
 *           description: Referencia bancaria
 *         estadoConciliacion:
 *           type: string
 *           enum: [pendiente, conciliado, descartado]
 *           description: Estado de la conciliación
 *         idPago:
 *           type: integer
 *           description: ID del pago asociado
 *         codigoPago:
 *           type: string
 *           description: Código del pago asociado
 *         referenciaPago:
 *           type: string
 *           description: Referencia del pago asociado
 *         nombreComunidad:
 *           type: string
 *           description: Nombre de la comunidad
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *
 *     ConciliacionCreate:
 *       type: object
 *       required:
 *         - fecha_mov
 *         - monto
 *       properties:
 *         fecha_mov:
 *           type: string
 *           format: date
 *           description: Fecha del movimiento bancario (YYYY-MM-DD)
 *           example: "2024-01-15"
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del movimiento (positivo para crédito, negativo para débito)
 *           example: 150000.50
 *         glosa:
 *           type: string
 *           description: Descripción del movimiento bancario
 *           example: "Transferencia desde cuenta corriente"
 *         referencia:
 *           type: string
 *           description: Referencia bancaria del movimiento
 *         pago_id:
 *           type: integer
 *           description: ID del pago asociado (opcional)
 *
 *     ConciliacionUpdate:
 *       type: object
 *       properties:
 *         fecha_mov:
 *           type: string
 *           format: date
 *           description: Fecha del movimiento bancario (YYYY-MM-DD)
 *           example: "2024-01-15"
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del movimiento (positivo para crédito, negativo para débito)
 *           example: 150000.50
 *         glosa:
 *           type: string
 *           description: Descripción del movimiento bancario
 *           example: "Transferencia desde cuenta corriente"
 *         referencia:
 *           type: string
 *           description: Referencia bancaria del movimiento
 *         estado:
 *           type: string
 *           enum: [pendiente, conciliado, descartado]
 *           description: Estado de la conciliación
 *           example: "conciliado"
 *         pago_id:
 *           type: integer
 *           description: ID del pago asociado
 *
 * /conciliaciones:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Listar todas las conciliaciones con filtros opcionales
 *     description: Obtiene una lista paginada de conciliaciones bancarias con posibilidad de filtrar por comunidad, estado y fechas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidad_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: ID de la comunidad para filtrar
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pendiente, conciliado, descartado]
 *         description: Estado de la conciliación para filtrar
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número máximo de registros a retornar
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Número de registros a saltar (para paginación)
 *     responses:
 *       200:
 *         description: Lista de conciliaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conciliacion'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      comunidad_id,
      estado,
      fecha_desde,
      fecha_hasta,
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
        cb.fecha_mov as fechaMovimiento,
        cb.glosa,
        cb.monto as monto,
        CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END as tipo,
        cb.referencia as referenciaBancaria,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pendiente'
          WHEN cb.estado = 'conciliado' THEN 'conciliado'
          WHEN cb.estado = 'descartado' THEN 'descartado'
          ELSE 'pendiente'
        END as estadoConciliacion,
        p.id as idPago,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago,
        p.referencia as referenciaPago,
        c.razon_social as nombreComunidad,
        cb.created_at,
        cb.updated_at
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND cb.comunidad_id = ?';
      params.push(comunidad_id);
    }

    if (estado) {
      query += ' AND cb.estado = ?';
      params.push(estado);
    }

    if (fecha_desde) {
      query += ' AND cb.fecha_mov >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND cb.fecha_mov <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY cb.fecha_mov DESC, cb.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliaciones' });
  }
});

/**
 * @openapi
 * /conciliaciones/count:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Contar conciliaciones totales para paginación
 *     description: Obtiene el número total de conciliaciones aplicando los mismos filtros que la lista principal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidad_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: ID de la comunidad para filtrar
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pendiente, conciliado, descartado]
 *         description: Estado de la conciliación para filtrar
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Conteo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Número total de conciliaciones
 *                   example: 150
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/count', authenticate, async (req, res) => {
  try {
    const { comunidad_id, estado, fecha_desde, fecha_hasta } = req.query;

    let query = `
      SELECT COUNT(*) as total
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND cb.comunidad_id = ?';
      params.push(comunidad_id);
    }

    if (estado) {
      query += ' AND cb.estado = ?';
      params.push(estado);
    }

    if (fecha_desde) {
      query += ' AND cb.fecha_mov >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND cb.fecha_mov <= ?';
      params.push(fecha_hasta);
    }

    const [rows] = await db.query(query, params);
    res.json({ total: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al contar conciliaciones' });
  }
});

/**
 * @openapi
 * /conciliaciones/{id}:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Obtener conciliación por ID
 *     description: Obtiene los detalles completos de una conciliación bancaria específica incluyendo información del pago y comunidad asociados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la conciliación
 *         example: 1
 *     responses:
 *       200:
 *         description: Conciliación obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conciliacion'
 *             example:
 *               id: 1
 *               codigo: "CONC-2024-0001"
 *               fechaMovimiento: "2024-01-15"
 *               glosa: "Transferencia cliente"
 *               monto: 150000.00
 *               tipo: "credito"
 *               referenciaBancaria: "TRF-001"
 *               estadoConciliacion: "conciliado"
 *               idPago: 123
 *               codigoPago: "PAY-2024-0123"
 *               referenciaPago: "REF-456"
 *               montoPago: 150000.00
 *               estadoPago: "aplicado"
 *               nombreComunidad: "Condominio Los Alamos"
 *               numeroUnidad: "101"
 *               nombreResidente: "Juan Pérez"
 *       404:
 *         description: Conciliación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conciliación no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(`
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
        cb.fecha_mov as fechaMovimiento,
        cb.glosa,
        cb.monto as monto,
        CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END as tipo,
        cb.referencia as referenciaBancaria,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pendiente'
          WHEN cb.estado = 'conciliado' THEN 'conciliado'
          WHEN cb.estado = 'descartado' THEN 'descartado'
          ELSE 'pendiente'
        END as estadoConciliacion,
        p.id as idPago,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) as codigoPago,
        p.referencia as referenciaPago,
        p.monto as montoPago,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pendiente'
          WHEN p.estado = 'aplicado' THEN 'aplicado'
          WHEN p.estado = 'reversado' THEN 'reversado'
          ELSE 'pendiente'
        END as estadoPago,
        c.razon_social as nombreComunidad,
        u.codigo as numeroUnidad,
        CONCAT(pers.nombres, ' ', pers.apellidos) as nombreResidente,
        cb.created_at,
        cb.updated_at
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE cb.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Conciliación no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliación' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Listar conciliaciones por comunidad
 *     description: Obtiene una lista de conciliaciones bancarias para una comunidad específica. Requiere acceso a la comunidad. Retorna máximo 200 registros ordenados por fecha descendente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de conciliaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la conciliación
 *                   fecha_mov:
 *                     type: string
 *                     format: date
 *                     description: Fecha del movimiento
 *                   monto:
 *                     type: number
 *                     format: float
 *                     description: Monto del movimiento
 *                   estado:
 *                     type: string
 *                     enum: [pendiente, conciliado, descartado]
 *                     description: Estado de la conciliación
 *             example:
 *               - id: 456
 *                 fecha_mov: "2024-01-15"
 *                 monto: 150000.50
 *                 estado: "pendiente"
 *               - id: 455
 *                 fecha_mov: "2024-01-14"
 *                 monto: -50000.00
 *                 estado: "conciliado"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "server error"
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const [rows] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE comunidad_id = ? ORDER BY fecha_mov DESC LIMIT 200', [comunidadId]);
  res.json(rows);
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Estadísticas de conciliaciones por comunidad
 *     description: Obtiene estadísticas generales de los movimientos de conciliación bancaria para una comunidad específica, incluyendo totales, promedios y distribución por estado y tipo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMovimientos:
 *                   type: integer
 *                   description: Total de movimientos bancarios
 *                 movimientosConciliados:
 *                   type: integer
 *                   description: Número de movimientos conciliados
 *                 movimientosPendientes:
 *                   type: integer
 *                   description: Número de movimientos pendientes
 *                 movimientosDiferencia:
 *                   type: integer
 *                   description: Número de movimientos con diferencias (descartados)
 *                 montoTotal:
 *                   type: number
 *                   format: float
 *                   description: Suma total de todos los montos
 *                 montoPromedio:
 *                   type: number
 *                   format: float
 *                   description: Monto promedio de los movimientos
 *                 movimientosCredito:
 *                   type: integer
 *                   description: Número de movimientos de crédito (monto > 0)
 *                 movimientosDebito:
 *                   type: integer
 *                   description: Número de movimientos de débito (monto < 0)
 *                 movimientoMasAntiguo:
 *                   type: string
 *                   format: date
 *                   description: Fecha del movimiento más antiguo
 *                 movimientoMasNuevo:
 *                   type: string
 *                   format: date
 *                   description: Fecha del movimiento más nuevo
 *             example:
 *               totalMovimientos: 150
 *               movimientosConciliados: 120
 *               movimientosPendientes: 25
 *               movimientosDiferencia: 5
 *               montoTotal: 2500000.75
 *               montoPromedio: 16666.67
 *               movimientosCredito: 80
 *               movimientosDebito: 70
 *               movimientoMasAntiguo: "2023-01-01"
 *               movimientoMasNuevo: "2024-01-15"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener estadísticas"
 */
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as totalMovimientos,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as movimientosConciliados,
        COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) as movimientosPendientes,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as movimientosDiferencia,
        SUM(cb.monto) as montoTotal,
        AVG(cb.monto) as montoPromedio,
        COUNT(CASE WHEN cb.monto > 0 THEN 1 END) as movimientosCredito,
        COUNT(CASE WHEN cb.monto < 0 THEN 1 END) as movimientosDebito,
        MIN(cb.fecha_mov) as movimientoMasAntiguo,
        MAX(cb.fecha_mov) as movimientoMasNuevo
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
    `, [comunidadId]);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/pendientes:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Movimientos bancarios pendientes de conciliación
 *     description: Obtiene una lista de movimientos bancarios que aún no han sido conciliados (estado = 'pendiente') para una comunidad específica, ordenados por fecha ascendente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Movimientos pendientes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la conciliación
 *                   codigo:
 *                     type: string
 *                     description: Código generado (CONC-YYYY-NNNN)
 *                     example: "CONC-2024-0001"
 *                   fechaMovimiento:
 *                     type: string
 *                     format: date
 *                     description: Fecha del movimiento bancario
 *                   glosa:
 *                     type: string
 *                     description: Descripción del movimiento
 *                   monto:
 *                     type: number
 *                     format: float
 *                     description: Monto del movimiento
 *                   tipo:
 *                     type: string
 *                     enum: [credito, debito, otro]
 *                     description: Tipo derivado del monto
 *                   referenciaBancaria:
 *                     type: string
 *                     description: Referencia bancaria
 *                   nombreComunidad:
 *                     type: string
 *                     description: Nombre de la comunidad
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *             example:
 *               - id: 456
 *                 codigo: "CONC-2024-0001"
 *                 fechaMovimiento: "2024-01-15"
 *                 glosa: "Transferencia desde cuenta corriente"
 *                 monto: 150000.50
 *                 tipo: "credito"
 *                 referenciaBancaria: "REF-2024-001"
 *                 nombreComunidad: "Condominio Los Alamos"
 *                 created_at: "2024-01-15T10:30:00Z"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener movimientos pendientes"
 */
router.get('/comunidad/:comunidadId/pendientes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
        cb.fecha_mov as fechaMovimiento,
        cb.glosa,
        cb.monto as monto,
        CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END as tipo,
        cb.referencia as referenciaBancaria,
        c.razon_social as nombreComunidad,
        cb.created_at
      FROM conciliacion_bancaria cb
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE cb.estado = 'pendiente'
        AND cb.comunidad_id = ?
      ORDER BY cb.fecha_mov ASC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos pendientes' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/por-estado:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Conciliaciones agrupadas por estado
 *     description: Obtiene estadísticas de conciliaciones agrupadas por estado (pendiente, conciliado, diferencia) para una comunidad específica, incluyendo cantidad, monto total y promedio por grupo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Estadísticas por estado obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   estado:
 *                     type: string
 *                     enum: [pendiente, conciliado, diferencia]
 *                     description: Estado de las conciliaciones
 *                   cantidad:
 *                     type: integer
 *                     description: Número de conciliaciones en este estado
 *                   montoTotal:
 *                     type: number
 *                     format: float
 *                     description: Suma total de montos en este estado
 *                   montoPromedio:
 *                     type: number
 *                     format: float
 *                     description: Monto promedio en este estado
 *             example:
 *               - estado: "pendiente"
 *                 cantidad: 25
 *                 montoTotal: 1250000.50
 *                 montoPromedio: 50000.02
 *               - estado: "diferencia"
 *                 cantidad: 5
 *                 montoTotal: -250000.00
 *                 montoPromedio: -50000.00
 *               - estado: "conciliado"
 *                 cantidad: 120
 *                 montoTotal: 3500000.75
 *                 montoPromedio: 29166.67
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener conciliaciones por estado"
 */
router.get('/comunidad/:comunidadId/por-estado', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pendiente'
          WHEN cb.estado = 'conciliado' THEN 'conciliado'
          WHEN cb.estado = 'descartado' THEN 'diferencia'
          ELSE 'pendiente'
        END as estado,
        COUNT(*) as cantidad,
        SUM(cb.monto) as montoTotal,
        AVG(cb.monto) as montoPromedio
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      GROUP BY cb.estado
      ORDER BY
        CASE cb.estado
          WHEN 'pendiente' THEN 1
          WHEN 'descartado' THEN 2
          WHEN 'conciliado' THEN 3
          ELSE 4
        END
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliaciones por estado' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/por-tipo:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Conciliaciones agrupadas por tipo de movimiento
 *     description: Obtiene estadísticas de conciliaciones agrupadas por tipo de movimiento (crédito, débito, otro) basado en el signo del monto, incluyendo cantidad total y conciliada por grupo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Estadísticas por tipo obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [credito, debito, otro]
 *                     description: Tipo de movimiento basado en el monto
 *                   cantidad:
 *                     type: integer
 *                     description: Número total de movimientos de este tipo
 *                   montoTotal:
 *                     type: number
 *                     format: float
 *                     description: Suma total de montos de este tipo
 *                   montoPromedio:
 *                     type: number
 *                     format: float
 *                     description: Monto promedio de este tipo
 *                   cantidadConciliada:
 *                     type: integer
 *                     description: Número de movimientos conciliados de este tipo
 *             example:
 *               - tipo: "credito"
 *                 cantidad: 80
 *                 montoTotal: 4000000.50
 *                 montoPromedio: 50000.01
 *                 cantidadConciliada: 75
 *               - tipo: "debito"
 *                 cantidad: 70
 *                 montoTotal: -3500000.25
 *                 montoPromedio: -50000.00
 *                 cantidadConciliada: 65
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener conciliaciones por tipo"
 */
router.get('/comunidad/:comunidadId/por-tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END as tipo,
        COUNT(*) as cantidad,
        SUM(cb.monto) as montoTotal,
        AVG(cb.monto) as montoPromedio,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as cantidadConciliada
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      GROUP BY CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END
      ORDER BY montoTotal DESC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener conciliaciones por tipo' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/diferencias:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Movimientos con diferencias pendientes
 *     description: Obtiene movimientos bancarios marcados como descartados (con diferencias) que requieren revisión manual, incluyendo comparación entre montos bancarios y de pagos asociados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Movimientos con diferencias obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la conciliación
 *                   codigo:
 *                     type: string
 *                     description: Código generado (CONC-YYYY-NNNN)
 *                     example: "CONC-2024-0001"
 *                   fechaMovimiento:
 *                     type: string
 *                     format: date
 *                     description: Fecha del movimiento bancario
 *                   glosa:
 *                     type: string
 *                     description: Descripción del movimiento
 *                   montoBancario:
 *                     type: number
 *                     format: float
 *                     description: Monto del movimiento bancario
 *                   montoPago:
 *                     type: number
 *                     format: float
 *                     description: Monto del pago asociado (puede ser null)
 *                   diferencia:
 *                     type: number
 *                     format: float
 *                     description: Diferencia entre monto bancario y pago
 *                   tipo:
 *                     type: string
 *                     enum: [credito, debito, otro]
 *                     description: Tipo derivado del monto bancario
 *                   referenciaBancaria:
 *                     type: string
 *                     description: Referencia bancaria
 *                   referenciaPago:
 *                     type: string
 *                     description: Referencia del pago asociado
 *                   nombreComunidad:
 *                     type: string
 *                     description: Nombre de la comunidad
 *             example:
 *               - id: 456
 *                 codigo: "CONC-2024-0001"
 *                 fechaMovimiento: "2024-01-15"
 *                 glosa: "Transferencia con diferencia"
 *                 montoBancario: 150000.50
 *                 montoPago: 150050.00
 *                 diferencia: -49.50
 *                 tipo: "credito"
 *                 referenciaBancaria: "REF-2024-001"
 *                 referenciaPago: "PAGO-REF-001"
 *                 nombreComunidad: "Condominio Los Alamos"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener movimientos con diferencias"
 */
router.get('/comunidad/:comunidadId/diferencias', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
        cb.fecha_mov as fechaMovimiento,
        cb.glosa,
        cb.monto as montoBancario,
        p.monto as montoPago,
        (cb.monto - COALESCE(p.monto, 0)) as diferencia,
        CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END as tipo,
        cb.referencia as referenciaBancaria,
        p.referencia as referenciaPago,
        c.razon_social as nombreComunidad
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE cb.estado = 'descartado'
        AND cb.comunidad_id = ?
      ORDER BY ABS(cb.monto - COALESCE(p.monto, 0)) DESC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos con diferencias' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/historial:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Historial de conciliaciones por período
 *     description: Obtiene un historial mensual de conciliaciones agrupadas por año y mes, incluyendo estadísticas de conciliación y porcentajes de efectividad para análisis de tendencias.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ano:
 *                     type: integer
 *                     description: Año del período
 *                     example: 2024
 *                   mes:
 *                     type: integer
 *                     description: Mes del período (1-12)
 *                     example: 1
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-01"
 *                   totalMovimientos:
 *                     type: integer
 *                     description: Total de movimientos en el período
 *                   montoTotal:
 *                     type: number
 *                     format: float
 *                     description: Suma total de montos en el período
 *                   cantidadConciliada:
 *                     type: integer
 *                     description: Número de movimientos conciliados
 *                   cantidadDiferencia:
 *                     type: integer
 *                     description: Número de movimientos con diferencias
 *                   cantidadPendiente:
 *                     type: integer
 *                     description: Número de movimientos pendientes
 *                   porcentajeConciliacion:
 *                     type: number
 *                     format: float
 *                     description: Porcentaje de movimientos conciliados
 *                     example: 85.50
 *             example:
 *               - ano: 2024
 *                 mes: 1
 *                 periodo: "2024-01"
 *                 totalMovimientos: 150
 *                 montoTotal: 2500000.75
 *                 cantidadConciliada: 128
 *                 cantidadDiferencia: 12
 *                 cantidadPendiente: 10
 *                 porcentajeConciliacion: 85.33
 *               - ano: 2023
 *                 mes: 12
 *                 periodo: "2023-12"
 *                 totalMovimientos: 145
 *                 montoTotal: 2400000.50
 *                 cantidadConciliada: 135
 *                 cantidadDiferencia: 8
 *                 cantidadPendiente: 2
 *                 porcentajeConciliacion: 93.10
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener historial"
 */
router.get('/comunidad/:comunidadId/historial', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        YEAR(cb.fecha_mov) as ano,
        MONTH(cb.fecha_mov) as mes,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m') as periodo,
        COUNT(*) as totalMovimientos,
        SUM(cb.monto) as montoTotal,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as cantidadConciliada,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as cantidadDiferencia,
        COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) as cantidadPendiente,
        ROUND(
          (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
          2
        ) as porcentajeConciliacion
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
      ORDER BY ano DESC, mes DESC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/saldos:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Saldos bancarios vs contables
 *     description: Obtiene comparación mensual entre saldos bancarios calculados y saldos contables basados en pagos aplicados, permitiendo identificar diferencias por período.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Saldos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ano:
 *                     type: integer
 *                     description: Año del período
 *                     example: 2024
 *                   mes:
 *                     type: integer
 *                     description: Mes del período (1-12)
 *                     example: 1
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-01"
 *                   creditosBancarios:
 *                     type: number
 *                     format: float
 *                     description: Suma de créditos bancarios (montos positivos)
 *                   debitosBancarios:
 *                     type: number
 *                     format: float
 *                     description: Suma de débitos bancarios (montos negativos)
 *                   saldoBancario:
 *                     type: number
 *                     format: float
 *                     description: Saldo bancario calculado (créditos - débitos)
 *                   pagosContables:
 *                     type: number
 *                     format: float
 *                     description: Suma de pagos contables aplicados
 *                   diferencia:
 *                     type: number
 *                     format: float
 *                     description: Diferencia entre saldo bancario y pagos contables
 *             example:
 *               - ano: 2024
 *                 mes: 1
 *                 periodo: "2024-01"
 *                 creditosBancarios: 5000000.00
 *                 debitosBancarios: -3500000.50
 *                 saldoBancario: 1500000.50
 *                 pagosContables: 1495000.00
 *                 diferencia: 5000.50
 *               - ano: 2023
 *                 mes: 12
 *                 periodo: "2023-12"
 *                 creditosBancarios: 4800000.25
 *                 debitosBancarios: -3400000.75
 *                 saldoBancario: 1400000.50
 *                 pagosContables: 1400000.50
 *                 diferencia: 0.00
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener saldos"
 */
router.get('/comunidad/:comunidadId/saldos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        YEAR(cb.fecha_mov) as ano,
        MONTH(cb.fecha_mov) as mes,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m') as periodo,
        -- Saldos bancarios
        SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) as creditosBancarios,
        SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END) as debitosBancarios,
        (
          SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) -
          SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
        ) as saldoBancario,
        -- Saldos contables (pagos)
        COALESCE(SUM(p.monto), 0) as pagosContables,
        -- Diferencias
        (
          SUM(CASE WHEN cb.monto > 0 THEN cb.monto ELSE 0 END) -
          SUM(CASE WHEN cb.monto < 0 THEN cb.monto ELSE 0 END)
        ) - COALESCE(SUM(p.monto), 0) as diferencia
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id AND p.estado = 'aplicado'
      WHERE cb.comunidad_id = ?
      GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
      ORDER BY ano DESC, mes DESC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener saldos' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/validacion:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Validación de conciliaciones
 *     description: Realiza validaciones automáticas en los movimientos de conciliación bancaria para identificar inconsistencias de datos, estados inválidos o problemas de integridad.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Validaciones realizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la conciliación con problemas
 *                   estado_validacion:
 *                     type: string
 *                     description: Descripción del problema de validación encontrado
 *                     enum: [Valido, 'Falta referencia de comunidad', 'Falta fecha de movimiento', 'Monto inválido', 'Estado de conciliación inválido']
 *                     example: "Monto inválido"
 *                   monto:
 *                     type: number
 *                     format: float
 *                     description: Monto del movimiento
 *                   fecha_mov:
 *                     type: string
 *                     format: date
 *                     description: Fecha del movimiento
 *                   estado:
 *                     type: string
 *                     enum: [pendiente, conciliado, descartado]
 *                     description: Estado actual de la conciliación
 *                   estado_vinculacion_pago:
 *                     type: string
 *                     enum: [Vinculado, 'Sin vincular']
 *                     description: Estado de vinculación con pago
 *             example:
 *               - id: 456
 *                 estado_validacion: "Monto inválido"
 *                 monto: 0.00
 *                 fecha_mov: "2024-01-15"
 *                 estado: "pendiente"
 *                 estado_vinculacion_pago: "Sin vincular"
 *               - id: 457
 *                 estado_validacion: "Estado de conciliación inválido"
 *                 monto: 150000.50
 *                 fecha_mov: "2024-01-16"
 *                 estado: "invalido"
 *                 estado_vinculacion_pago: "Vinculado"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al realizar validaciones"
 */
router.get('/comunidad/:comunidadId/validacion', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        cb.id,
        CASE
          WHEN cb.comunidad_id IS NULL THEN 'Falta referencia de comunidad'
          WHEN cb.fecha_mov IS NULL THEN 'Falta fecha de movimiento'
          WHEN cb.monto = 0 THEN 'Monto inválido'
          WHEN cb.estado NOT IN ('pendiente', 'conciliado', 'descartado') THEN 'Estado de conciliación inválido'
          ELSE 'Valido'
        END as estado_validacion,
        cb.monto,
        cb.fecha_mov,
        cb.estado,
        CASE WHEN cb.pago_id IS NOT NULL THEN 'Vinculado' ELSE 'Sin vincular' END as estado_vinculacion_pago
      FROM conciliacion_bancaria cb
      WHERE cb.comunidad_id = ?
      HAVING estado_validacion != 'Valido'
      ORDER BY cb.id
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al validar conciliaciones' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/sin-pagos:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Movimientos bancarios sin pagos asociados
 *     description: Obtiene movimientos bancarios que no tienen pagos asociados (pago_id IS NULL), útiles para identificar conciliaciones pendientes de vincular con transacciones contables.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Movimientos sin pagos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la conciliación
 *                   codigo:
 *                     type: string
 *                     description: Código generado (CONC-YYYY-NNNN)
 *                     example: "CONC-2024-0001"
 *                   fechaMovimiento:
 *                     type: string
 *                     format: date
 *                     description: Fecha del movimiento bancario
 *                   glosa:
 *                     type: string
 *                     description: Descripción del movimiento
 *                   monto:
 *                     type: number
 *                     format: float
 *                     description: Monto del movimiento
 *                   tipo:
 *                     type: string
 *                     enum: [credito, debito, otro]
 *                     description: Tipo derivado del monto
 *                   referenciaBancaria:
 *                     type: string
 *                     description: Referencia bancaria
 *                   estadoConciliacion:
 *                     type: string
 *                     enum: [pendiente, conciliado, diferencia]
 *                     description: Estado de la conciliación
 *                   nombreComunidad:
 *                     type: string
 *                     description: Nombre de la comunidad
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *             example:
 *               - id: 456
 *                 codigo: "CONC-2024-0001"
 *                 fechaMovimiento: "2024-01-15"
 *                 glosa: "Transferencia sin pago asociado"
 *                 monto: 150000.50
 *                 tipo: "credito"
 *                 referenciaBancaria: "REF-2024-001"
 *                 estadoConciliacion: "pendiente"
 *                 nombreComunidad: "Condominio Los Alamos"
 *                 created_at: "2024-01-15T10:30:00Z"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener movimientos sin pagos"
 */
router.get('/comunidad/:comunidadId/sin-pagos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        cb.id,
        CONCAT('CONC-', YEAR(cb.fecha_mov), '-', LPAD(cb.id, 4, '0')) as codigo,
        cb.fecha_mov as fechaMovimiento,
        cb.glosa,
        cb.monto as monto,
        CASE
          WHEN cb.monto > 0 THEN 'credito'
          WHEN cb.monto < 0 THEN 'debito'
          ELSE 'otro'
        END as tipo,
        cb.referencia as referenciaBancaria,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pendiente'
          WHEN cb.estado = 'conciliado' THEN 'conciliado'
          WHEN cb.estado = 'descartado' THEN 'diferencia'
          ELSE 'pendiente'
        END as estadoConciliacion,
        c.razon_social as nombreComunidad,
        cb.created_at
      FROM conciliacion_bancaria cb
      JOIN comunidad c ON cb.comunidad_id = c.id
      WHERE cb.pago_id IS NULL
        AND cb.comunidad_id = ?
      ORDER BY cb.fecha_mov DESC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos sin pagos' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/precision:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Análisis de precisión de conciliación
 *     description: Proporciona métricas de precisión mensual de las conciliaciones, incluyendo porcentajes de éxito, diferencias promedio y máxima entre movimientos bancarios y pagos asociados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Análisis de precisión obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ano:
 *                     type: integer
 *                     description: Año del período
 *                     example: 2024
 *                   mes:
 *                     type: integer
 *                     description: Mes del período (1-12)
 *                     example: 1
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-01"
 *                   totalMovimientos:
 *                     type: integer
 *                     description: Total de movimientos en el período
 *                   movimientosConciliados:
 *                     type: integer
 *                     description: Número de movimientos conciliados
 *                   movimientosDiferencia:
 *                     type: integer
 *                     description: Número de movimientos con diferencias
 *                   porcentajePrecision:
 *                     type: number
 *                     format: float
 *                     description: Porcentaje de precisión de conciliación
 *                     example: 85.50
 *                   diferenciaPromedio:
 *                     type: number
 *                     format: float
 *                     description: Diferencia promedio absoluta entre montos
 *                   diferenciaMaxima:
 *                     type: number
 *                     format: float
 *                     description: Diferencia máxima absoluta encontrada
 *             example:
 *               - ano: 2024
 *                 mes: 1
 *                 periodo: "2024-01"
 *                 totalMovimientos: 150
 *                 movimientosConciliados: 128
 *                 movimientosDiferencia: 12
 *                 porcentajePrecision: 85.33
 *                 diferenciaPromedio: 1250.75
 *                 diferenciaMaxima: 50000.00
 *               - ano: 2023
 *                 mes: 12
 *                 periodo: "2023-12"
 *                 totalMovimientos: 145
 *                 movimientosConciliados: 135
 *                 movimientosDiferencia: 8
 *                 porcentajePrecision: 93.10
 *                 diferenciaPromedio: 850.25
 *                 diferenciaMaxima: 25000.50
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener análisis de precisión"
 */
router.get('/comunidad/:comunidadId/precision', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        YEAR(cb.fecha_mov) as ano,
        MONTH(cb.fecha_mov) as mes,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m') as periodo,
        COUNT(*) as totalMovimientos,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as movimientosConciliados,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as movimientosDiferencia,
        ROUND(
          (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(*),
          2
        ) as porcentajePrecision,
        AVG(ABS(cb.monto - COALESCE(p.monto, 0))) as diferenciaPromedio,
        MAX(ABS(cb.monto - COALESCE(p.monto, 0))) as diferenciaMaxima
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.comunidad_id = ?
      GROUP BY YEAR(cb.fecha_mov), MONTH(cb.fecha_mov), DATE_FORMAT(cb.fecha_mov, '%Y-%m')
      ORDER BY ano DESC, mes DESC
    `, [comunidadId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener análisis de precisión' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}/resumen:
 *   get:
 *     tags: [Conciliaciones]
 *     summary: Resumen de conciliaciones por comunidad
 *     description: Proporciona un resumen ejecutivo completo del estado de conciliaciones bancarias para una comunidad específica, incluyendo métricas generales y estadísticas de rendimiento.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     responses:
 *       200:
 *         description: Resumen obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombreComunidad:
 *                   type: string
 *                   description: Nombre de la comunidad
 *                   example: "Condominio Los Alamos"
 *                 totalMovimientos:
 *                   type: integer
 *                   description: Total de movimientos bancarios
 *                   example: 150
 *                 movimientosConciliados:
 *                   type: integer
 *                   description: Número de movimientos conciliados
 *                   example: 120
 *                 movimientosPendientes:
 *                   type: integer
 *                   description: Número de movimientos pendientes
 *                   example: 25
 *                 movimientosDiferencia:
 *                   type: integer
 *                   description: Número de movimientos con diferencias
 *                   example: 5
 *                 montoBancarioTotal:
 *                   type: number
 *                   format: float
 *                   description: Suma total de todos los montos bancarios
 *                   example: 2500000.75
 *                 pagosVinculados:
 *                   type: integer
 *                   description: Número de pagos únicos vinculados
 *                   example: 118
 *                 tasaConciliacion:
 *                   type: number
 *                   format: float
 *                   description: Porcentaje de tasa de conciliación
 *                   example: 80.00
 *                 movimientoMasAntiguo:
 *                   type: string
 *                   format: date
 *                   description: Fecha del movimiento más antiguo
 *                   example: "2023-01-01"
 *                 movimientoMasNuevo:
 *                   type: string
 *                   format: date
 *                   description: Fecha del movimiento más nuevo
 *                   example: "2024-01-15"
 *             example:
 *               nombreComunidad: "Condominio Los Alamos"
 *               totalMovimientos: 150
 *               movimientosConciliados: 120
 *               movimientosPendientes: 25
 *               movimientosDiferencia: 5
 *               montoBancarioTotal: 2500000.75
 *               pagosVinculados: 118
 *               tasaConciliacion: 80.00
 *               movimientoMasAntiguo: "2023-01-01"
 *               movimientoMasNuevo: "2024-01-15"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene acceso a esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al obtener resumen"
 */
router.get('/comunidad/:comunidadId/resumen', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT
        c.razon_social as nombreComunidad,
        COUNT(cb.id) as totalMovimientos,
        COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) as movimientosConciliados,
        COUNT(CASE WHEN cb.estado = 'pendiente' THEN 1 END) as movimientosPendientes,
        COUNT(CASE WHEN cb.estado = 'descartado' THEN 1 END) as movimientosDiferencia,
        SUM(cb.monto) as montoBancarioTotal,
        COUNT(DISTINCT p.id) as pagosVinculados,
        ROUND(
          (COUNT(CASE WHEN cb.estado = 'conciliado' THEN 1 END) * 100.0) / COUNT(cb.id),
          2
        ) as tasaConciliacion,
        MIN(cb.fecha_mov) as movimientoMasAntiguo,
        MAX(cb.fecha_mov) as movimientoMasNuevo
      FROM comunidad c
      LEFT JOIN conciliacion_bancaria cb ON c.id = cb.comunidad_id
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE c.id = ?
      GROUP BY c.id, c.razon_social
    `, [comunidadId]);

    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

/**
 * @openapi
 * /conciliaciones/comunidad/{comunidadId}:
 *   post:
 *     tags: [Conciliaciones]
 *     summary: Crear nueva conciliación bancaria
 *     description: Crea un nuevo movimiento de conciliación bancaria para una comunidad específica. Requiere permisos de admin o contador en la comunidad.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConciliacionCreate'
 *           example:
 *             fecha_mov: "2024-01-15"
 *             monto: 150000.50
 *             glosa: "Transferencia desde cuenta corriente"
 *             referencia: "REF-2024-001"
 *             pago_id: 123
 *     responses:
 *       201:
 *         description: Conciliación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la nueva conciliación
 *                 fecha_mov:
 *                   type: string
 *                   format: date
 *                   description: Fecha del movimiento
 *                 monto:
 *                   type: number
 *                   format: float
 *                   description: Monto del movimiento
 *                 estado:
 *                   type: string
 *                   enum: [pendiente]
 *                   description: Estado inicial (siempre pendiente)
 *             example:
 *               id: 456
 *               fecha_mov: "2024-01-15"
 *               monto: 150000.50
 *               estado: "pendiente"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "fecha_mov is required"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene permisos en esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Access denied to this community"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "server error"
 */
router.post('/comunidad/:comunidadId', [authenticate, requireCommunity('comunidadId', ['admin','contador']), body('fecha_mov').notEmpty(), body('monto').isNumeric()], async (req, res) => {
  const comunidadId = Number(req.params.comunidadId); const { fecha_mov, monto, glosa, referencia, pago_id } = req.body;
  try { const [result] = await db.query('INSERT INTO conciliacion_bancaria (comunidad_id, fecha_mov, monto, glosa, referencia, pago_id) VALUES (?,?,?,?,?,?)', [comunidadId, fecha_mov, monto, glosa || null, referencia || null, pago_id || null]); const [row] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE id = ? LIMIT 1', [result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); }
});

/**
 * @openapi
 * /conciliaciones/{id}:
 *   put:
 *     tags: [Conciliaciones]
 *     summary: Actualizar conciliación completa
 *     description: Actualiza todos los campos de una conciliación bancaria existente. Requiere permisos de admin o superadmin. Solo campos proporcionados serán actualizados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la conciliación a actualizar
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConciliacionUpdate'
 *           example:
 *             fecha_mov: "2024-01-15"
 *             monto: 150000.50
 *             glosa: "Transferencia corregida"
 *             estado: "conciliado"
 *             pago_id: 123
 *     responses:
 *       200:
 *         description: Conciliación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conciliacion'
 *             example:
 *               id: 456
 *               codigo: "CONC-2024-0001"
 *               fechaMovimiento: "2024-01-15"
 *               glosa: "Transferencia corregida"
 *               monto: 150000.50
 *               tipo: "credito"
 *               referenciaBancaria: "REF-2024-001"
 *               estadoConciliacion: "conciliado"
 *               idPago: 123
 *               codigoPago: "PAGO-2024-0123"
 *               referenciaPago: "REF-PAGO-001"
 *               nombreComunidad: "Condominio Los Alamos"
 *               created_at: "2024-01-15T10:30:00Z"
 *               updated_at: "2024-01-15T14:45:00Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid estado value"
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene permisos de admin/superadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden"
 *       404:
 *         description: Conciliación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conciliación not found"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "server error"
 */
router.put('/:id', authenticate, authorize('admin','superadmin'), [
  body('fecha_mov').optional().notEmpty(),
  body('monto').optional().isNumeric(),
  body('estado').optional().isIn(['pendiente', 'conciliado', 'descartado']),
  body('pago_id').optional().isNumeric()
], async (req, res) => {
  try {
    const id = req.params.id;
    const { fecha_mov, monto, glosa, referencia, estado, pago_id } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (fecha_mov !== undefined) {
      updateFields.push('fecha_mov = ?');
      updateValues.push(fecha_mov);
    }
    if (monto !== undefined) {
      updateFields.push('monto = ?');
      updateValues.push(monto);
    }
    if (glosa !== undefined) {
      updateFields.push('glosa = ?');
      updateValues.push(glosa);
    }
    if (referencia !== undefined) {
      updateFields.push('referencia = ?');
      updateValues.push(referencia);
    }
    if (estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(estado);
    }
    if (pago_id !== undefined) {
      updateFields.push('pago_id = ?');
      updateValues.push(pago_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const query = `UPDATE conciliacion_bancaria SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(query, updateValues);

    const [rows] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Conciliación no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar conciliación' });
  }
});

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; if (!req.body.estado) return res.status(400).json({ error: 'estado required' }); try { await db.query('UPDATE conciliacion_bancaria SET estado = ? WHERE id = ?', [req.body.estado, id]); const [rows] = await db.query('SELECT id, fecha_mov, monto, estado FROM conciliacion_bancaria WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

/**
 * @openapi
 * /conciliaciones/{id}:
 *   delete:
 *     tags: [Conciliaciones]
 *     summary: Eliminar conciliación
 *     description: Elimina permanentemente una conciliación bancaria del sistema. Requiere permisos de admin o superadmin. Esta operación no se puede deshacer.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la conciliación a eliminar
 *         example: 456
 *     responses:
 *       204:
 *         description: Conciliación eliminada exitosamente (sin contenido)
 *       401:
 *         description: No autorizado - Token JWT faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       403:
 *         description: Prohibido - Usuario no tiene permisos de admin/superadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden"
 *       404:
 *         description: Conciliación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Conciliación no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Error al eliminar conciliación"
 */
router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.query('DELETE FROM conciliacion_bancaria WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Conciliación no encontrada' });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar conciliación' });
  }
});

module.exports = router;