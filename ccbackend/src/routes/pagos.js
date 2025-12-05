const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// ============================================
// HELPER: Obtener comunidades del usuario
// ============================================
// eslint-disable-next-line no-unused-vars
async function obtenerComunidadesUsuario(
  usuarioId,
  personaId,
  isSuperAdmin = false
) {
  if (isSuperAdmin) {
    const [all] = await db.query(`SELECT id FROM comunidad`);
    return Array.isArray(all) ? all.map((r) => Number(r.id)) : [];
  }

  // por rol en usuario_rol_comunidad
  const [porRol] = await db.query(
    `SELECT DISTINCT comunidad_id
     FROM usuario_rol_comunidad
     WHERE usuario_id = ?
       AND activo = 1
       AND (desde <= CURDATE())
       AND (hasta IS NULL OR hasta >= CURDATE())`,
    [usuarioId]
  );

  // por pertenencia como miembro
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

/**
 * @swagger
 * tags:
 *   - name: Pagos
 *     description: Gestión de pagos, aplicaciones a cuentas de cobro y reversos
 *
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pago
 *           example: 123
 *         order_id:
 *           type: string
 *           description: Código único de orden
 *           example: "PAY-2025-0123"
 *         amount:
 *           type: number
 *           format: float
 *           description: Monto del pago
 *           example: 150000.00
 *         payment_date:
 *           type: string
 *           format: date
 *           description: Fecha del pago
 *           example: "2025-10-16"
 *         status:
 *           type: string
 *           enum: [pending, approved, cancelled]
 *           description: Estado del pago
 *           example: "approved"
 *         payment_method:
 *           type: string
 *           enum: [bank_transfer, webpay, khipu, servipag, cash]
 *           description: Método de pago
 *           example: "bank_transfer"
 *         reference:
 *           type: string
 *           description: Referencia o número de transacción
 *           example: "TRX-123456789"
 *         receipt_number:
 *           type: string
 *           description: Número de comprobante
 *           example: "COMP-001"
 *         community_name:
 *           type: string
 *           description: Nombre de la comunidad
 *           example: "Condominio Los Aromos"
 *         unit_number:
 *           type: string
 *           description: Número de unidad
 *           example: "101"
 *         resident_name:
 *           type: string
 *           description: Nombre del residente
 *           example: "Juan Pérez"
 *         resident_email:
 *           type: string
 *           format: email
 *           description: Email del residente
 *           example: "juan.perez@email.com"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *
 *     PaymentCreate:
 *       type: object
 *       required:
 *         - fecha
 *         - monto
 *       properties:
 *         unidad_id:
 *           type: integer
 *           description: ID de la unidad
 *           example: 45
 *         persona_id:
 *           type: integer
 *           description: ID de la persona
 *           example: 12
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del pago
 *           example: "2025-10-16"
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del pago
 *           example: 150000.00
 *         medio:
 *           type: string
 *           enum: [transferencia, webpay, khipu, servipag, efectivo]
 *           description: Medio de pago
 *           example: "transferencia"
 *         referencia:
 *           type: string
 *           description: Referencia de la transacción
 *           example: "TRX-123456789"
 *         comprobante_num:
 *           type: string
 *           description: Número de comprobante
 *           example: "COMP-001"
 *
 *     PaymentApplication:
 *       type: object
 *       required:
 *         - assignments
 *       properties:
 *         assignments:
 *           type: array
 *           description: Lista de asignaciones del pago a cuentas
 *           items:
 *             type: object
 *             required:
 *               - cuenta_cobro_unidad_id
 *               - monto
 *             properties:
 *               cuenta_cobro_unidad_id:
 *                 type: integer
 *                 description: ID de la cuenta de cobro
 *                 example: 234
 *               cargo_unidad_id:
 *                 type: integer
 *                 description: ID del cargo (alternativo)
 *                 example: 234
 *               monto:
 *                 type: number
 *                 format: float
 *                 description: Monto a aplicar
 *                 example: 75000.00
 *       example:
 *         assignments:
 *           - cuenta_cobro_unidad_id: 234
 *             monto: 75000.00
 *           - cuenta_cobro_unidad_id: 235
 *             monto: 50000.00
 *
 *     PaymentStats:
 *       type: object
 *       properties:
 *         total_payments:
 *           type: integer
 *           description: Total de pagos
 *           example: 150
 *         approved_payments:
 *           type: integer
 *           description: Pagos aprobados
 *           example: 120
 *         pending_payments:
 *           type: integer
 *           description: Pagos pendientes
 *           example: 25
 *         cancelled_payments:
 *           type: integer
 *           description: Pagos cancelados
 *           example: 5
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Monto total
 *           example: 22500000.00
 *         average_amount:
 *           type: number
 *           format: float
 *           description: Monto promedio
 *           example: 150000.00
 *         oldest_payment:
 *           type: string
 *           format: date
 *           description: Pago más antiguo
 *           example: "2024-01-15"
 *         newest_payment:
 *           type: string
 *           format: date
 *           description: Pago más reciente
 *           example: "2025-10-16"
 *         approved_amount:
 *           type: number
 *           format: float
 *           description: Monto aprobado total
 *           example: 18000000.00
 *
 *     PaginatedPayments:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total de registros
 *               example: 150
 *             limit:
 *               type: integer
 *               description: Límite por página
 *               example: 20
 *             offset:
 *               type: integer
 *               description: Desplazamiento
 *               example: 0
 *             hasMore:
 *               type: boolean
 *               description: Hay más registros
 *               example: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensaje de error
 *           example: "Error al procesar la solicitud"
 *         errors:
 *           type: array
 *           description: Lista de errores de validación
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *                 example: "Campo requerido"
 *               param:
 *                 type: string
 *                 example: "monto"
 */

// =========================================
// 1. LISTADOS Y FILTROS
// =========================================

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar pagos con filtros avanzados
 *     description: Obtiene un listado paginado de pagos con múltiples opciones de filtrado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         description: ID de la comunidad
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: estado
 *         in: query
 *         description: Filtrar por estado del pago
 *         schema:
 *           type: string
 *           enum: [pendiente, aplicado, reversado]
 *           example: aplicado
 *       - name: medio
 *         in: query
 *         description: Filtrar por medio de pago
 *         schema:
 *           type: string
 *           enum: [transferencia, webpay, khipu, servipag, efectivo]
 *           example: transferencia
 *       - name: fecha_desde
 *         in: query
 *         description: Fecha inicial del rango
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - name: fecha_hasta
 *         in: query
 *         description: Fecha final del rango
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *       - name: search
 *         in: query
 *         description: Búsqueda por referencia, nombre o unidad
 *         schema:
 *           type: string
 *           example: "Juan"
 *       - name: limit
 *         in: query
 *         description: Cantidad de registros por página
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 20
 *       - name: offset
 *         in: query
 *         description: Desplazamiento para paginación
 *         schema:
 *           type: integer
 *           default: 0
 *           example: 0
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedPayments'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado para esta comunidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        estado,
        medio,
        fecha_desde,
        fecha_hasta,
        search,
        limit = 20,
        offset = 0,
      } = req.query;

      let query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        p.monto AS amount,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        p.referencia AS reference,
        p.comprobante_num AS receipt_number,
        c.razon_social AS community_name,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        pers.email AS resident_email,
        p.created_at,
        p.updated_at
      FROM pago p
      JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE p.comunidad_id = ?
    `;

      const params = [comunidadId];

      // Verificar si es superadmin (de tabla usuario)
      const usuarioId = req.user.sub;
      const isSuper = Boolean(req.user.is_superadmin === true);

      // Verificar si es admin de la comunidad
      let isAdmin = false;
      if (!isSuper && usuarioId) {
        const [adminCheck] = await db.query(
          `SELECT 1 FROM usuario_rol_comunidad urc
           JOIN rol_sistema rs ON urc.rol_id = rs.id
           WHERE urc.usuario_id = ?
             AND urc.comunidad_id = ?
             AND urc.activo = 1
             AND rs.codigo IN ('admin_comunidad', 'tesorero', 'presidente_comite')
           LIMIT 1`,
          [usuarioId, comunidadId]
        );
        isAdmin = adminCheck && adminCheck.length > 0;
      }

      // Si NO es superadmin NI admin, filtrar solo SUS pagos
      if (!isSuper && !isAdmin && usuarioId) {
        // Buscar persona_id del usuario
        const [personaRows] = await db.query(
          'SELECT id FROM persona WHERE usuario_id = ? LIMIT 1',
          [usuarioId]
        );

        if (personaRows && personaRows.length > 0) {
          const personaId = personaRows[0].id;
          query += ` AND p.persona_id = ?`;
          params.push(personaId);
        } else {
          // Si no tiene persona asociada, no puede ver nada
          return res.json({
            data: [],
            pagination: { total: 0, limit, offset, hasMore: false },
          });
        }
      }

      if (estado) {
        query += ` AND p.estado = ?`;
        params.push(estado);
      }

      if (medio) {
        query += ` AND p.medio = ?`;
        params.push(medio);
      }

      if (fecha_desde) {
        query += ` AND p.fecha >= ?`;
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += ` AND p.fecha <= ?`;
        params.push(fecha_hasta);
      }

      if (search) {
        query += ` AND (p.referencia LIKE ? OR CONCAT(pers.nombres, ' ', pers.apellidos) LIKE ? OR u.codigo LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ` ORDER BY p.fecha DESC, p.created_at DESC LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);

      // Contar total
      let countQuery = `SELECT COUNT(*) AS total FROM pago p WHERE p.comunidad_id = ?`;
      const countParams = [comunidadId];

      if (estado) {
        countQuery += ` AND p.estado = ?`;
        countParams.push(estado);
      }
      if (medio) {
        countQuery += ` AND p.medio = ?`;
        countParams.push(medio);
      }
      if (fecha_desde) {
        countQuery += ` AND p.fecha >= ?`;
        countParams.push(fecha_desde);
      }
      if (fecha_hasta) {
        countQuery += ` AND p.fecha <= ?`;
        countParams.push(fecha_hasta);
      }

      const [[{ total }]] = await db.query(countQuery, countParams);

      res.json({
        data: rows,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + rows.length < total,
        },
      });
    } catch (error) {
      console.error('Error al listar pagos:', error);
      res.status(500).json({ error: 'Error al listar pagos' });
    }
  }
);

/**
 * @swagger
 * /api/pagos/{id}:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener pago por ID con detalles completos
 *     description: Retorna toda la información detallada de un pago específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del pago
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Pago encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Pago no encontrado"
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        p.monto AS amount,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        p.referencia AS reference,
        p.comprobante_num AS receipt_number,
        c.razon_social AS community_name,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        pers.email AS resident_email,
        pers.telefono AS resident_phone,
        p.created_at,
        p.updated_at
      FROM pago p
      JOIN comunidad c ON p.comunidad_id = c.id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE p.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error al obtener pago' });
  }
});

// =========================================
// 2. ESTADÍSTICAS
// =========================================

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas generales de pagos por comunidad
 *     description: Retorna métricas consolidadas de todos los pagos de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         description: ID de la comunidad
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentStats'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/estadisticas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        COUNT(*) AS total_payments,
        COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_payments,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_payments,
        COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_payments,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount,
        MIN(p.fecha) AS oldest_payment,
        MAX(p.fecha) AS newest_payment,
        COALESCE(SUM(CASE WHEN p.estado = 'aplicado' THEN p.monto ELSE 0 END), 0) AS approved_amount
      FROM pago p
      WHERE p.comunidad_id = ?
    `;

      const [[stats]] = await db.query(query, [comunidadId]);

      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas de pagos:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
);

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/estadisticas/estado:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas agrupadas por estado
 *     description: Retorna métricas agrupadas por estado del pago (pending, approved, cancelled)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estadísticas por estado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, cancelled]
 *                     example: "approved"
 *                   count:
 *                     type: integer
 *                     example: 120
 *                   total_amount:
 *                     type: number
 *                     format: float
 *                     example: 18000000.00
 *                   average_amount:
 *                     type: number
 *                     format: float
 *                     example: 150000.00
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/estadisticas/estado',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        COUNT(*) AS count,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount
      FROM pago p
      WHERE p.comunidad_id = ?
      GROUP BY p.estado
      ORDER BY
        CASE p.estado
          WHEN 'aplicado' THEN 1
          WHEN 'pendiente' THEN 2
          WHEN 'reversado' THEN 3
          ELSE 4
        END
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener estadísticas por estado:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas por estado' });
    }
  }
);

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/estadisticas/metodo:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas agrupadas por método de pago
 *     description: Retorna métricas agrupadas por medio de pago utilizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estadísticas por método de pago
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   payment_method:
 *                     type: string
 *                     example: "bank_transfer"
 *                   count:
 *                     type: integer
 *                     example: 85
 *                   total_amount:
 *                     type: number
 *                     example: 12750000.00
 *                   average_amount:
 *                     type: number
 *                     example: 150000.00
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/estadisticas/metodo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount
      FROM pago p
      WHERE p.comunidad_id = ?
      GROUP BY p.medio
      ORDER BY total_amount DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener estadísticas por método:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas por método' });
    }
  }
);

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/estadisticas/periodo:
 *   get:
 *     tags: [Pagos]
 *     summary: Estadísticas agrupadas por período (mes/año)
 *     description: Retorna métricas mensuales de pagos para análisis de tendencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estadísticas por período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: integer
 *                     example: 2025
 *                   month:
 *                     type: integer
 *                     example: 10
 *                   period:
 *                     type: string
 *                     example: "2025-10"
 *                   payment_count:
 *                     type: integer
 *                     example: 45
 *                   total_amount:
 *                     type: number
 *                     example: 6750000.00
 *                   average_amount:
 *                     type: number
 *                     example: 150000.00
 *                   approved_count:
 *                     type: integer
 *                     example: 40
 *                   pending_count:
 *                     type: integer
 *                     example: 3
 *                   cancelled_count:
 *                     type: integer
 *                     example: 2
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/estadisticas/periodo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        YEAR(p.fecha) AS year,
        MONTH(p.fecha) AS month,
        DATE_FORMAT(p.fecha, '%Y-%m') AS period,
        COUNT(*) AS payment_count,
        COALESCE(SUM(p.monto), 0) AS total_amount,
        COALESCE(AVG(p.monto), 0) AS average_amount,
        COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_count,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_count
      FROM pago p
      WHERE p.comunidad_id = ?
      GROUP BY YEAR(p.fecha), MONTH(p.fecha), DATE_FORMAT(p.fecha, '%Y-%m')
      ORDER BY year DESC, month DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener estadísticas por período:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas por período' });
    }
  }
);

// =========================================
// 3. PAGOS PENDIENTES Y APLICACIONES
// =========================================

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/pendientes:
 *   get:
 *     tags: [Pagos]
 *     summary: Pagos pendientes de aplicación completa
 *     description: Lista todos los pagos que tienen saldo remanente sin aplicar a cuentas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de pagos pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123
 *                   order_id:
 *                     type: string
 *                     example: "PAY-2025-0123"
 *                   total_payment:
 *                     type: number
 *                     example: 150000.00
 *                   applied_amount:
 *                     type: number
 *                     example: 75000.00
 *                   remaining_amount:
 *                     type: number
 *                     example: 75000.00
 *                   payment_date:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-16"
 *                   unit_number:
 *                     type: string
 *                     example: "101"
 *                   resident_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   reference:
 *                     type: string
 *                     example: "TRX-123456789"
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/pendientes',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        p.monto AS total_payment,
        COALESCE(SUM(pa.monto), 0) AS applied_amount,
        (p.monto - COALESCE(SUM(pa.monto), 0)) AS remaining_amount,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        p.referencia AS reference
      FROM pago p
      LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
      LEFT JOIN unidad u ON p.unidad_id = u.id
      LEFT JOIN persona pers ON p.persona_id = pers.id
      WHERE p.comunidad_id = ?
        AND p.estado = 'pendiente'
      GROUP BY p.id, p.monto, p.fecha, u.codigo, pers.nombres, pers.apellidos, p.referencia
      HAVING remaining_amount > 0
      ORDER BY p.fecha DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener pagos pendientes:', error);
      res.status(500).json({ error: 'Error al obtener pagos pendientes' });
    }
  }
);

/**
 * @swagger
 * /api/pagos/{id}/aplicaciones:
 *   get:
 *     tags: [Pagos]
 *     summary: Ver cómo se aplicó un pago a cargos
 *     description: Muestra el detalle de las aplicaciones del pago a diferentes cuentas de cobro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del pago
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Lista de aplicaciones del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 456
 *                   applied_amount:
 *                     type: number
 *                     example: 75000.00
 *                   prioridad:
 *                     type: integer
 *                     example: 1
 *                   charge_id:
 *                     type: integer
 *                     example: 234
 *                   charge_code:
 *                     type: string
 *                     example: "CHG-2025-0234"
 *                   charge_total:
 *                     type: number
 *                     example: 150000.00
 *                   charge_balance:
 *                     type: number
 *                     example: 75000.00
 *                   period:
 *                     type: string
 *                     example: "2025-10"
 *                   due_date:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-05"
 *                   unit_number:
 *                     type: string
 *                     example: "101"
 *                   resident_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/aplicaciones', authenticate, async (req, res) => {
  try {
    const pagoId = Number(req.params.id);

    const query = `
      SELECT
        pa.id,
        pa.monto AS applied_amount,
        pa.prioridad,
        ccu.id AS charge_id,
        CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) AS charge_code,
        ccu.monto_total AS charge_total,
        ccu.saldo AS charge_balance,
        egc.periodo AS period,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') AS due_date,
        u.codigo AS unit_number,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name
      FROM pago_aplicacion pa
      JOIN cuenta_cobro_unidad ccu ON pa.cargo_unidad_id = ccu.id
      LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      LEFT JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN pago p_ref ON pa.pago_id = p_ref.id
      LEFT JOIN persona pers ON p_ref.persona_id = pers.id
      WHERE pa.pago_id = ?
      ORDER BY pa.prioridad, pa.id
    `;

    const [rows] = await db.query(query, [pagoId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener aplicaciones de pago:', error);
    res.status(500).json({ error: 'Error al obtener aplicaciones' });
  }
});

// =========================================
// 4. HISTORIAL Y CONSULTAS POR UNIDAD/RESIDENTE
// =========================================

/**
 * @swagger
 * /api/pagos/unidad/{unidadId}/historial:
 *   get:
 *     tags: [Pagos]
 *     summary: Historial completo de pagos de una unidad
 *     description: Retorna todos los pagos realizados por una unidad específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: unidadId
 *         in: path
 *         required: true
 *         description: ID de la unidad
 *         schema:
 *           type: integer
 *           example: 45
 *     responses:
 *       200:
 *         description: Historial de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123
 *                   order_id:
 *                     type: string
 *                     example: "PAY-2025-0123"
 *                   payment_date:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-16"
 *                   amount:
 *                     type: number
 *                     example: 150000.00
 *                   status:
 *                     type: string
 *                     example: "approved"
 *                   payment_method:
 *                     type: string
 *                     example: "bank_transfer"
 *                   reference:
 *                     type: string
 *                     example: "TRX-123456789"
 *                   applied_amount:
 *                     type: number
 *                     example: 150000.00
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/unidad/:unidadId/historial', authenticate, async (req, res) => {
  try {
    const unidadId = Number(req.params.unidadId);

    const query = `
      SELECT
        p.id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS order_id,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') AS payment_date,
        p.monto AS amount,
        CASE
          WHEN p.estado = 'pendiente' THEN 'pending'
          WHEN p.estado = 'aplicado' THEN 'approved'
          WHEN p.estado = 'reversado' THEN 'cancelled'
          ELSE 'pending'
        END AS status,
        CASE
          WHEN p.medio = 'transferencia' THEN 'bank_transfer'
          WHEN p.medio = 'webpay' THEN 'webpay'
          WHEN p.medio = 'khipu' THEN 'khipu'
          WHEN p.medio = 'servipag' THEN 'servipag'
          WHEN p.medio = 'efectivo' THEN 'cash'
          ELSE p.medio
        END AS payment_method,
        p.referencia AS reference,
        COALESCE(SUM(pa.monto), 0) AS applied_amount
      FROM pago p
      LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
      WHERE p.unidad_id = ?
      GROUP BY p.id, p.fecha, p.monto, p.estado, p.medio, p.referencia
      ORDER BY p.fecha DESC
    `;

    const [rows] = await db.query(query, [unidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/por-residente:
 *   get:
 *     tags: [Pagos]
 *     summary: Resumen de pagos por residente
 *     description: Muestra estadísticas consolidadas de pagos agrupadas por residente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Resumen por residente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   resident_id:
 *                     type: integer
 *                     example: 12
 *                   resident_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   resident_email:
 *                     type: string
 *                     example: "juan.perez@email.com"
 *                   unit_number:
 *                     type: string
 *                     example: "101"
 *                   total_payments:
 *                     type: integer
 *                     example: 24
 *                   total_paid:
 *                     type: number
 *                     example: 3600000.00
 *                   average_payment:
 *                     type: number
 *                     example: 150000.00
 *                   last_payment_date:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-16"
 *                   approved_payments:
 *                     type: integer
 *                     example: 22
 *                   pending_payments:
 *                     type: integer
 *                     example: 2
 *                   cancelled_payments:
 *                     type: integer
 *                     example: 0
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/por-residente',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        pers.id AS resident_id,
        CONCAT(pers.nombres, ' ', pers.apellidos) AS resident_name,
        pers.email AS resident_email,
        u.codigo AS unit_number,
        COUNT(p.id) AS total_payments,
        COALESCE(SUM(p.monto), 0) AS total_paid,
        COALESCE(AVG(p.monto), 0) AS average_payment,
        MAX(p.fecha) AS last_payment_date,
        COUNT(CASE WHEN p.estado = 'aplicado' THEN 1 END) AS approved_payments,
        COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pending_payments,
        COUNT(CASE WHEN p.estado = 'reversado' THEN 1 END) AS cancelled_payments
      FROM persona pers
      LEFT JOIN titulares_unidad tu ON pers.id = tu.persona_id 
        AND tu.tipo = 'propietario' 
        AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN unidad u ON tu.unidad_id = u.id
      LEFT JOIN pago p ON pers.id = p.persona_id
      WHERE u.comunidad_id = ?
      GROUP BY pers.id, pers.nombres, pers.apellidos, pers.email, u.codigo
      HAVING COUNT(p.id) > 0
      ORDER BY total_paid DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener pagos por residente:', error);
      res.status(500).json({ error: 'Error al obtener pagos por residente' });
    }
  }
);

// =========================================
// 5. CONCILIACIÓN BANCARIA
// =========================================

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/conciliacion:
 *   get:
 *     tags: [Pagos]
 *     summary: Movimientos bancarios para conciliación
 *     description: Lista movimientos bancarios y su estado de conciliación con pagos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Movimientos bancarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 789
 *                   movement_date:
 *                     type: string
 *                     format: date
 *                     example: "2025-10-16"
 *                   glosa:
 *                     type: string
 *                     example: "Transferencia entrante"
 *                   monto:
 *                     type: number
 *                     example: 150000.00
 *                   type:
 *                     type: string
 *                     example: "bank_transfer"
 *                   bank_reference:
 *                     type: string
 *                     example: "REF-987654"
 *                   payment_id:
 *                     type: integer
 *                     nullable: true
 *                     example: 123
 *                   payment_code:
 *                     type: string
 *                     nullable: true
 *                     example: "PAY-2025-0123"
 *                   payment_reference:
 *                     type: string
 *                     nullable: true
 *                     example: "TRX-123456789"
 *                   reconciliation_status:
 *                     type: string
 *                     enum: [pending, reconciled, discarded]
 *                     example: "reconciled"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/conciliacion',
  authenticate,
  requireCommunity('comunidadId', ['admin', 'superadmin']),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cb.id,
        DATE_FORMAT(cb.fecha_mov, '%Y-%m-%d') AS movement_date,
        cb.glosa,
        cb.monto,
        COALESCE(p.medio, 'No Aplicable') AS type,
        cb.referencia AS bank_reference,
        p.id AS payment_id,
        CONCAT('PAY-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS payment_code,
        p.referencia AS payment_reference,
        CASE
          WHEN cb.estado = 'pendiente' THEN 'pending'
          WHEN cb.estado = 'conciliado' THEN 'reconciled'
          WHEN cb.estado = 'descartado' THEN 'discarded'
          ELSE 'pending'
        END AS reconciliation_status
      FROM conciliacion_bancaria cb
      LEFT JOIN pago p ON cb.pago_id = p.id
      WHERE cb.comunidad_id = ?
      ORDER BY cb.fecha_mov DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener conciliación bancaria:', error);
      res.status(500).json({ error: 'Error al obtener conciliación bancaria' });
    }
  }
);

// =========================================
// 6. WEBHOOKS
// =========================================

/**
 * @swagger
 * /api/pagos/{id}/webhooks:
 *   get:
 *     tags: [Pagos]
 *     summary: Webhooks recibidos para un pago
 *     description: Lista todos los webhooks recibidos de pasarelas de pago para un pago específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del pago
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Lista de webhooks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 567
 *                   evento:
 *                     type: string
 *                     example: "payment.success"
 *                   payload:
 *                     type: object
 *                     description: Datos JSON del webhook
 *                   procesado:
 *                     type: boolean
 *                     example: true
 *                   received_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-16T14:30:00Z"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-10-16T14:30:05Z"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/:id/webhooks',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const pagoId = Number(req.params.id);

      const query = `
      SELECT
        wp.id,
        wp.proveedor AS evento,
        wp.payload_json AS payload,
        wp.procesado,
        DATE_FORMAT(wp.fecha_recepcion, '%Y-%m-%d %H:%i:%s') AS received_at,
        wp.created_at
      FROM webhook_pago wp
      WHERE wp.pago_id = ?
      ORDER BY wp.fecha_recepcion DESC
    `;

      const [rows] = await db.query(query, [pagoId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener webhooks:', error);
      res.status(500).json({ error: 'Error al obtener webhooks' });
    }
  }
);

// =========================================
// 7. VALIDACIONES
// =========================================

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}/validar:
 *   get:
 *     tags: [Pagos]
 *     summary: Validar integridad de pagos
 *     description: Identifica pagos con problemas de integridad o datos inválidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de pagos con problemas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 123
 *                   validation_status:
 *                     type: string
 *                     enum: [Valid, Missing community reference, Invalid amount, Missing payment date, Invalid status]
 *                     example: "Invalid amount"
 *                   monto:
 *                     type: number
 *                     example: -100.00
 *                   fecha:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                     example: "2025-10-16"
 *                   estado:
 *                     type: string
 *                     example: "pendiente"
 *                   application_count:
 *                     type: integer
 *                     example: 0
 *                   applied_amount:
 *                     type: number
 *                     example: 0.00
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/comunidad/:comunidadId/validar',
  authenticate,
  requireCommunity('comunidadId', ['admin', 'superadmin']),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        p.id,
        CASE
          WHEN p.comunidad_id IS NULL THEN 'Missing community reference'
          WHEN p.monto <= 0 THEN 'Invalid amount'
          WHEN p.fecha IS NULL THEN 'Missing payment date'
          WHEN p.estado NOT IN ('pendiente', 'aplicado', 'reversado') THEN 'Invalid status'
          ELSE 'Valid'
        END AS validation_status,
        p.monto,
        p.fecha,
        p.estado,
        COUNT(pa.id) AS application_count,
        COALESCE(SUM(pa.monto), 0) AS applied_amount
      FROM pago p
      LEFT JOIN pago_aplicacion pa ON p.id = pa.pago_id
      WHERE p.comunidad_id = ?
      GROUP BY p.id, p.comunidad_id, p.monto, p.fecha, p.estado
      HAVING validation_status != 'Valid'
      ORDER BY p.id
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al validar pagos:', error);
      res.status(500).json({ error: 'Error al validar pagos' });
    }
  }
);

// =========================================
// 8. CRUD BÁSICO
// =========================================

/**
 * @swagger
 * /api/pagos/comunidad/{comunidadId}:
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar un nuevo pago
 *     description: Crea un nuevo registro de pago en el sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         description: ID de la comunidad
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreate'
 *           examples:
 *             transferencia:
 *               summary: Pago por transferencia
 *               value:
 *                 unidad_id: 45
 *                 persona_id: 12
 *                 fecha: "2025-10-16"
 *                 monto: 150000.00
 *                 medio: "transferencia"
 *                 referencia: "TRX-123456789"
 *                 comprobante_num: "COMP-001"
 *             efectivo:
 *               summary: Pago en efectivo
 *               value:
 *                 unidad_id: 45
 *                 persona_id: 12
 *                 fecha: "2025-10-16"
 *                 monto: 75000.00
 *                 medio: "efectivo"
 *                 comprobante_num: "REC-045"
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 123
 *                 fecha:
 *                   type: string
 *                   format: date
 *                   example: "2025-10-16"
 *                 monto:
 *                   type: number
 *                   example: 150000.00
 *                 medio:
 *                   type: string
 *                   example: "transferencia"
 *                 estado:
 *                   type: string
 *                   example: "pendiente"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId'),
    body('monto').isNumeric(),
    body('fecha').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        unidad_id,
        persona_id,
        fecha,
        monto,
        medio,
        referencia,
        comprobante_num,
      } = req.body;

      const [result] = await db.query(
        'INSERT INTO pago (comunidad_id, unidad_id, persona_id, fecha, monto, medio, referencia, comprobante_num) VALUES (?,?,?,?,?,?,?,?)',
        [
          comunidadId,
          unidad_id || null,
          persona_id || null,
          fecha,
          monto,
          medio || null,
          referencia || null,
          comprobante_num || null,
        ]
      );

      const [row] = await db.query(
        'SELECT id, fecha, monto, medio, estado FROM pago WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (error) {
      console.error('Error al crear pago:', error);
      res.status(500).json({ error: 'Error al crear pago' });
    }
  }
);

/**
 * @swagger
 * /api/pagos/aplicar-multiple:
 *   post:
 *     tags: [Pagos]
 *     summary: Crear y aplicar pago a múltiples cargos (cuentas de cobro y multas)
 *     description: |
 *       Crea un nuevo pago y lo aplica automáticamente a múltiples cargos.
 *       Soporta tanto cuentas de cobro como multas.
 *       Usa transacciones para garantizar integridad.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - transaction_id
 *               - amount
 *               - cargos
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: ID de orden del gateway
 *                 example: "PAY-2025-12345"
 *               transaction_id:
 *                 type: string
 *                 description: ID de transacción del gateway
 *                 example: "TRX-WEBPAY-98765"
 *               amount:
 *                 type: number
 *                 description: Monto total del pago
 *                 example: 150000.00
 *               cargos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - cargo_id
 *                     - monto
 *                     - tipo
 *                   properties:
 *                     cargo_id:
 *                       type: integer
 *                       description: ID del cargo
 *                     monto:
 *                       type: number
 *                       description: Monto aplicado a este cargo
 *                     tipo:
 *                       type: string
 *                       enum: [cuenta_cobro, multa]
 *                       description: Tipo de cargo
 *                     unidad_id:
 *                       type: integer
 *                       description: ID de la unidad
 *                     comunidad_id:
 *                       type: integer
 *                       description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Pago creado y aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pago_id:
 *                   type: integer
 *                   description: ID del pago creado
 *                   example: 123
 *                 message:
 *                   type: string
 *                   example: "Pago aplicado exitosamente a 3 cargos"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/aplicar-multiple',
  [
    authenticate,
    body('order_id').notEmpty().withMessage('order_id requerido'),
    body('transaction_id').notEmpty().withMessage('transaction_id requerido'),
    body('amount').isFloat({ min: 0 }).withMessage('amount debe ser positivo'),
    body('cargos').isArray({ min: 1 }).withMessage('cargos debe ser un array'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const { order_id, transaction_id, amount, cargos } = req.body;
      const usuarioId = req.user.sub;

      // Buscar persona_id del usuario
      const [usuarioRows] = await connection.query(
        'SELECT persona_id FROM usuario WHERE id = ? LIMIT 1',
        [usuarioId]
      );

      if (!usuarioRows || !usuarioRows.length) {
        await connection.rollback();
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      const personaId = usuarioRows[0].persona_id;
      const comunidadId = cargos[0].comunidad_id;
      const unidadId = cargos[0].unidad_id;

      // 1. Crear registro de pago
      const [pagoResult] = await connection.query(
        `INSERT INTO pago (
          comunidad_id,
          unidad_id,
          persona_id,
          fecha,
          monto,
          medio,
          referencia,
          estado,
          comprobante_num
        ) VALUES (?, ?, ?, CURDATE(), ?, 'webpay', ?, 'aplicado', ?)`,
        [comunidadId, unidadId, personaId, amount, transaction_id, order_id]
      );

      const pagoId = pagoResult.insertId;

      // 2. Aplicar a cada cargo
      for (let i = 0; i < cargos.length; i++) {
        const cargo = cargos[i];

        // Crear pago_aplicacion
        await connection.query(
          `INSERT INTO pago_aplicacion (
            pago_id,
            cuenta_cobro_unidad_id,
            monto,
            prioridad
          ) VALUES (?, ?, ?, ?)`,
          [pagoId, cargo.cargo_id, cargo.monto, i + 1]
        );

        // Actualizar saldo según tipo
        if (cargo.tipo === 'multa') {
          // Para multas, actualizar estado
          await connection.query(
            `UPDATE multas
             SET estado = CASE
                 WHEN monto <= ? THEN 'pagado'
                 ELSE estado
               END,
               updated_at = NOW()
             WHERE id = ?`,
            [cargo.monto, cargo.cargo_id]
          );
        } else {
          // Para cuentas de cobro
          await connection.query(
            `UPDATE cuenta_cobro_unidad
             SET saldo = saldo - ?,
                 estado = CASE
                   WHEN (saldo - ?) <= 0 THEN 'pagado'
                   WHEN (saldo - ?) < monto_total THEN 'parcial'
                   ELSE estado
                 END,
                 updated_at = NOW()
             WHERE id = ?`,
            [cargo.monto, cargo.monto, cargo.monto, cargo.cargo_id]
          );
        }
      }

      // 3. Registrar en bitácora (opcional)
      try {
        await connection.query(
          `INSERT INTO bitacora (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            detalles
          ) VALUES (?, 'PAGO_MULTIPLE_WEBPAY', 'pago', ?, ?)`,
          [
            usuarioId,
            pagoId,
            JSON.stringify({
              monto: amount,
              cargos: cargos.length,
              transaction_id,
              order_id,
            }),
          ]
        );
      } catch (bitacoraError) {
        // No fallar si bitácora falla
        console.error('Error en bitácora:', bitacoraError);
      }

      await connection.commit();

      res.json({
        success: true,
        pago_id: pagoId,
        message: `Pago aplicado exitosamente a ${cargos.length} cargo(s)`,
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error en /aplicar-multiple:', error);
      res
        .status(500)
        .json({ error: 'Error al aplicar pago', details: error.message });
    } finally {
      connection.release();
    }
  }
);

/**
 * @swagger
 * /api/pagos/{id}/aplicar:
 *   post:
 *     tags: [Pagos]
 *     summary: Aplicar un pago a cuentas de cobro específicas
 *     description: Asigna el monto del pago a una o más cuentas de cobro de unidades. El sistema valida que los montos no excedan el saldo pendiente de cada cuenta.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del pago a aplicar
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentApplication'
 *           examples:
 *             aplicacion_simple:
 *               summary: Aplicar a una cuenta
 *               value:
 *                 assignments:
 *                   - cuenta_cobro_unidad_id: 234
 *                     monto: 150000.00
 *             aplicacion_multiple:
 *               summary: Aplicar a múltiples cuentas
 *               value:
 *                 assignments:
 *                   - cuenta_cobro_unidad_id: 234
 *                     monto: 75000.00
 *                   - cuenta_cobro_unidad_id: 235
 *                     monto: 50000.00
 *                   - cuenta_cobro_unidad_id: 236
 *                     monto: 25000.00
 *     responses:
 *       200:
 *         description: Pago aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 pago_id:
 *                   type: integer
 *                   example: 123
 *                 assigned:
 *                   type: number
 *                   description: Monto total asignado
 *                   example: 150000.00
 *       400:
 *         description: Datos inválidos o monto excede saldo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sin_assignments:
 *                 summary: Sin asignaciones
 *                 value:
 *                   error: "Se requiere array de assignments"
 *               pago_reversado:
 *                 summary: Pago ya reversado
 *                 value:
 *                   error: "Pago reversado no puede ser aplicado"
 *               excede_saldo:
 *                 summary: Monto excede saldo
 *                 value:
 *                   error: "El monto excede el saldo de la cuenta 234"
 *       404:
 *         description: Pago o cuenta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/:id/aplicar',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const pagoId = Number(req.params.id);
    const assignments = req.body.assignments || [];

    if (!Array.isArray(assignments) || !assignments.length) {
      return res
        .status(400)
        .json({ error: 'Se requiere array de assignments' });
    }

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [pRows] = await conn.query(
        'SELECT comunidad_id, monto, estado FROM pago WHERE id = ? LIMIT 1',
        [pagoId]
      );

      if (!pRows.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      const pago = pRows[0];

      if (pago.estado === 'reversado') {
        await conn.rollback();
        return res
          .status(400)
          .json({ error: 'Pago reversado no puede ser aplicado' });
      }

      for (const a of assignments) {
        const cuentaId = a.cuenta_cobro_unidad_id || a.cargo_unidad_id;

        if (
          !cuentaId ||
          (typeof a.monto !== 'number' && typeof a.monto !== 'string')
        ) {
          await conn.rollback();
          return res
            .status(400)
            .json({ error: 'Formato de assignment inválido' });
        }

        const monto = Number(a.monto);

        if (monto <= 0) {
          await conn.rollback();
          return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
        }

        const [cRows] = await conn.query(
          'SELECT saldo FROM cuenta_cobro_unidad WHERE id = ? LIMIT 1 FOR UPDATE',
          [cuentaId]
        );

        if (!cRows.length) {
          await conn.rollback();
          return res
            .status(404)
            .json({ error: `Cuenta ${cuentaId} no encontrada` });
        }

        const cargoSaldo = Number(cRows[0].saldo || 0);

        if (monto > cargoSaldo) {
          await conn.rollback();
          return res.status(400).json({
            error: `El monto excede el saldo de la cuenta ${cuentaId}`,
          });
        }

        await conn.query(
          'INSERT INTO pago_aplicacion (pago_id, cargo_unidad_id, monto) VALUES (?,?,?)',
          [pagoId, cuentaId, monto]
        );
        await conn.query(
          'UPDATE cuenta_cobro_unidad SET saldo = saldo - ? WHERE id = ?',
          [monto, cuentaId]
        );
      }

      const [paRows] = await conn.query(
        'SELECT SUM(monto) as total FROM pago_aplicacion WHERE pago_id = ?',
        [pagoId]
      );
      const applied = Number((paRows[0] && paRows[0].total) || 0);

      let newEstado = 'pendiente';
      if (applied >= Number(pago.monto)) {
        newEstado = 'aplicado';
      } else if (applied > 0) {
        newEstado = 'aplicado';
      }

      await conn.query('UPDATE pago SET estado = ? WHERE id = ?', [
        newEstado,
        pagoId,
      ]);

      await conn.commit();

      res.json({ ok: true, pago_id: pagoId, assigned: applied });
    } catch (error) {
      console.error('Error al aplicar pago:', error);
      try {
        await conn.rollback();
      } catch (e) {
        console.error('Error al hacer rollback:', e);
      }
      res.status(500).json({ error: 'Error al aplicar pago' });
    } finally {
      try {
        conn.release();
      } catch (e) {
        console.error('Error al liberar conexión:', e);
      }
    }
  }
);

/**
 * @swagger
 * /api/pagos/{id}/reversar:
 *   post:
 *     tags: [Pagos]
 *     summary: Reversar un pago aplicado
 *     description: Revierte todas las aplicaciones de un pago, devolviendo los montos a las cuentas de cobro y marcando el pago como reversado. Esta operación no puede deshacerse.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del pago a reversar
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Pago reversado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 pago_id:
 *                   type: integer
 *                   example: 123
 *                 message:
 *                   type: string
 *                   example: "Pago reversado exitosamente"
 *       400:
 *         description: Pago ya está reversado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Pago ya está reversado"
 *       404:
 *         description: Pago no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Pago no encontrado"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/:id/reversar',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const pagoId = Number(req.params.id);
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [pRows] = await conn.query(
        'SELECT estado FROM pago WHERE id = ? LIMIT 1',
        [pagoId]
      );

      if (!pRows.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      if (pRows[0].estado === 'reversado') {
        await conn.rollback();
        return res.status(400).json({ error: 'Pago ya está reversado' });
      }

      // Revertir aplicaciones
      const [aplicaciones] = await conn.query(
        'SELECT cargo_unidad_id, monto FROM pago_aplicacion WHERE pago_id = ?',
        [pagoId]
      );

      for (const ap of aplicaciones) {
        await conn.query(
          'UPDATE cuenta_cobro_unidad SET saldo = saldo + ? WHERE id = ?',
          [ap.monto, ap.cargo_unidad_id]
        );
      }

      await conn.query('DELETE FROM pago_aplicacion WHERE pago_id = ?', [
        pagoId,
      ]);
      await conn.query('UPDATE pago SET estado = ? WHERE id = ?', [
        'reversado',
        pagoId,
      ]);

      await conn.commit();

      res.json({
        ok: true,
        pago_id: pagoId,
        message: 'Pago reversado exitosamente',
      });
    } catch (error) {
      console.error('Error al reversar pago:', error);
      try {
        await conn.rollback();
      } catch (e) {
        console.error('Error al hacer rollback:', e);
      }
      res.status(500).json({ error: 'Error al reversar pago' });
    } finally {
      try {
        conn.release();
      } catch (e) {
        console.error('Error al liberar conexión:', e);
      }
    }
  }
);

// =========================================
// CRUD OPERATIONS - PUT/DELETE
// =========================================

/**
 * @swagger
 * /pagos/{id}:
 *   put:
 *     tags: [Pagos]
 *     summary: Actualizar pago existente
 *     description: Actualiza los datos de un pago (solo si está en estado pendiente)
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
 *               monto:
 *                 type: number
 *                 description: Monto del pago
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha del pago
 *               forma_pago:
 *                 type: string
 *                 description: Forma de pago
 *               referencia_pago:
 *                 type: string
 *                 description: Referencia/número de transacción
 *               descripcion:
 *                 type: string
 *                 description: Descripción adicional
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Pago no encontrado
 *       409:
 *         description: Pago no puede ser actualizado
 *       500:
 *         description: Error servidor
 */
router.put(
  '/:id',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'tesorero'),
    body('monto').optional().isNumeric(),
    body('fecha').optional().notEmpty(),
    body('forma_pago').optional().trim(),
    body('referencia_pago').optional().trim(),
    body('descripcion').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const pagoId = Number(req.params.id);

      // Obtener pago anterior
      const [pagoAnterior] = await db.query('SELECT * FROM pago WHERE id = ?', [
        pagoId,
      ]);
      if (!pagoAnterior.length) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Verificar que el pago esté en estado pendiente
      if (pagoAnterior[0].estado !== 'pendiente') {
        return res.status(409).json({
          error:
            'Solo se pueden actualizar pagos en estado pendiente. Estado actual: ' +
            pagoAnterior[0].estado,
        });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.monto !== undefined) {
        campos.push('monto = ?');
        valores.push(req.body.monto);
      }
      if (req.body.fecha !== undefined) {
        campos.push('fecha = ?');
        valores.push(req.body.fecha);
      }
      if (req.body.forma_pago !== undefined) {
        campos.push('forma_pago = ?');
        valores.push(req.body.forma_pago);
      }
      if (req.body.referencia_pago !== undefined) {
        campos.push('referencia_pago = ?');
        valores.push(req.body.referencia_pago);
      }
      if (req.body.descripcion !== undefined) {
        campos.push('descripcion = ?');
        valores.push(req.body.descripcion);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(pagoId);

      // Ejecutar actualización
      await db.query(
        `UPDATE pago SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener pago actualizado
      const [pagoActualizado] = await db.query(
        'SELECT * FROM pago WHERE id = ?',
        [pagoId]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'pago', ?, ?, ?, ?)`,
        [
          req.user.id,
          pagoId,
          JSON.stringify(pagoAnterior[0]),
          JSON.stringify(pagoActualizado[0]),
          req.ip,
        ]
      );

      res.json(pagoActualizado[0]);
    } catch (err) {
      console.error('Error al actualizar pago:', err);
      res.status(500).json({ error: 'Error al actualizar pago' });
    }
  }
);

/**
 * @swagger
 * /pagos/{id}:
 *   delete:
 *     tags: [Pagos]
 *     summary: Eliminar pago
 *     description: Elimina un pago verificando que esté en estado pendiente y sin aplicaciones
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Pago eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Pago no encontrado
 *       409:
 *         description: Pago no puede ser eliminado
 *       500:
 *         description: Error servidor
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin_comunidad'),
  async (req, res) => {
    try {
      const pagoId = Number(req.params.id);

      // Obtener pago a eliminar
      const [pago] = await db.query('SELECT * FROM pago WHERE id = ?', [
        pagoId,
      ]);
      if (!pago.length) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Verificar que el pago esté en estado pendiente
      if (pago[0].estado !== 'pendiente') {
        return res.status(409).json({
          error:
            'Solo se pueden eliminar pagos en estado pendiente. Estado actual: ' +
            pago[0].estado,
        });
      }

      // Verificar que no tenga aplicaciones
      const [aplicaciones] = await db.query(
        'SELECT COUNT(*) as total FROM aplicacion_pago WHERE pago_id = ?',
        [pagoId]
      );

      if (aplicaciones[0].total > 0) {
        return res.status(409).json({
          error:
            'No se puede eliminar un pago que tiene aplicaciones. Primero revise las aplicaciones.',
        });
      }

      // Realizar eliminación
      await db.query('DELETE FROM pago WHERE id = ?', [pagoId]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address)
         VALUES (?, 'DELETE', 'pago', ?, ?, ?)`,
        [req.user.id, pagoId, JSON.stringify(pago[0]), req.ip]
      );

      res.status(204).end();
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      res.status(500).json({ error: 'Error al eliminar pago' });
    }
  }
);

module.exports = router;
