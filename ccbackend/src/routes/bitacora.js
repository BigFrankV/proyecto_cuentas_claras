const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireCommunity } = require('../middleware/tenancy');
const { body, query, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la actividad
 *         type:
 *           type: string
 *           enum: [system, user, security, maintenance, admin, financial]
 *           description: Tipo de actividad
 *         priority:
 *           type: string
 *           enum: [low, normal, high, critical]
 *           description: Prioridad de la actividad
 *         title:
 *           type: string
 *           description: Título de la actividad
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         user:
 *           type: string
 *           description: Usuario que realizó la actividad
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la actividad
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Etiquetas asociadas
 *         attachments:
 *           type: integer
 *           description: Número de archivos adjuntos
 *         ip:
 *           type: string
 *           description: Dirección IP del usuario
 *         location:
 *           type: string
 *           description: Ubicación donde ocurrió la actividad
 *     ActivityStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de actividades
 *         today:
 *           type: integer
 *           description: Actividades de hoy
 *         high:
 *           type: integer
 *           description: Actividades de alta prioridad
 *         critical:
 *           type: integer
 *           description: Actividades críticas
 */

/**
 * @swagger
 * /bitacora/comunidad/{comunidadId}:
 *   get:
 *     summary: Listar actividades de auditoría de una comunidad
 *     description: Obtiene la lista de actividades del sistema de auditoría con filtros opcionales
 *     tags: [Bitácora]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página. Por defecto es 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página. Por defecto es 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [system, user, security, maintenance, admin, financial]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, critical]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: string
 *           enum: [today, week, month, all]
 *         description: Filtrar por rango de fechas
 *     responses:
 *       200:
 *         description: Lista de actividades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error del servidor
 */

// GET /api/bitacora/comunidad/:comunidadId - Listar actividades de auditoría
router.get(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim(),
    query('type')
      .optional()
      .isIn([
        'system',
        'user',
        'security',
        'maintenance',
        'admin',
        'financial',
      ]),
    query('priority').optional().isIn(['low', 'normal', 'high', 'critical']),
    query('dateRange').optional().isIn(['today', 'week', 'month', 'all']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { comunidadId } = req.params;
      const {
        page = 1,
        limit = 50,
        search,
        type,
        priority,
        dateRange,
      } = req.query;

      let whereConditions = ['ba.comunidad_id = ?'];
      let queryParams = [comunidadId];

      // Filtro de búsqueda
      if (search) {
        whereConditions.push(
          '(ba.titulo LIKE ? OR ba.descripcion LIKE ? OR ba.usuario LIKE ? OR JSON_SEARCH(ba.tags, "one", ?) IS NOT NULL)'
        );
        queryParams.push(
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
          `%${search}%`
        );
      }

      // Filtro por tipo
      if (type && type !== 'all') {
        whereConditions.push('ba.tipo = ?');
        queryParams.push(type);
      }

      // Filtro por prioridad
      if (priority && priority !== 'all') {
        whereConditions.push('ba.prioridad = ?');
        queryParams.push(priority);
      }

      // Filtro por rango de fechas
      if (dateRange && dateRange !== 'all') {
        const now = new Date();
        let startDate;

        switch (dateRange) {
          case 'today':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        if (startDate) {
          whereConditions.push('ba.fecha >= ?');
          queryParams.push(
            startDate.toISOString().slice(0, 19).replace('T', ' ')
          );
        }
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      // Consulta principal
      const offset = (page - 1) * limit;
      const [rows] = await db.query(
        `
      SELECT
        ba.id,
        ba.tipo,
        ba.prioridad,
        ba.titulo,
        ba.descripcion,
        ba.usuario,
        ba.fecha,
        ba.tags,
        JSON_LENGTH(ba.adjuntos) as attachments,
        ba.ip,
        ba.ubicacion,
        p.nombres,
        p.apellidos
      FROM vista_timeline_general ba
      LEFT JOIN usuario u ON ba.usuario_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id
      ${whereClause}
      ORDER BY ba.fecha DESC
      LIMIT ? OFFSET ?
    `,
        [...queryParams, limit, offset]
      );

      // Consulta de conteo total
      const [countResult] = await db.query(
        `
      SELECT COUNT(*) as total
      FROM vista_timeline_general ba
      ${whereClause}
    `,
        queryParams
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Transformar los resultados para que coincidan con el formato esperado por el frontend
      const activities = rows.map((row) => {
        let parsedTags = []; // Default to empty array

        if (row.tags) {
          try {
            // Attempt to parse the JSON string from the database
            parsedTags = JSON.parse(row.tags);

            // Extra safety check: ensure the parsed result is actually an array
            if (!Array.isArray(parsedTags)) {
              console.warn(
                `Las etiquetas analizadas para la entrada de bitácora ${row.id} no son un arreglo:`,
                parsedTags
              );
              parsedTags = []; // Fallback to empty array if not an array
            }
          } catch (e) {
            // If parsing fails, log a warning and keep the empty array
            console.warn(
              `Error al analizar JSON de etiquetas para la entrada de bitácora ${row.id}: "${row.tags}". Error: ${e.message}. Usando arreglo vacío por defecto.`
            );
            parsedTags = [];
          }
        }

        return {
          id: row.id.toString(),
          type: row.tipo,
          priority: row.prioridad,
          title: row.titulo,
          description: row.descripcion,
          user:
            row.usuario ||
            `${row.nombres || ''} ${row.apellidos || ''}`.trim() ||
            'Sistema',
          date: row.fecha.toISOString(),
          tags: parsedTags, // Use the safely parsed tags
          attachments: row.attachments || 0,
          ip: row.ip,
          location: row.ubicacion,
        };
      });

      res.json({
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (err) {
      console.error('Error al obtener el registro de auditoría:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/bitacora/stats/:comunidadId - Estadísticas de la bitácora
router.get(
  '/stats/:comunidadId',
  [authenticate, requireCommunity('comunidadId')],
  async (req, res) => {
    try {
      const { comunidadId } = req.params;

      // Estadísticas generales
      const [statsResult] = await db.query(
        `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(fecha) = CURDATE() THEN 1 END) as today,
        COUNT(CASE WHEN prioridad = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN prioridad = 'critical' THEN 1 END) as critical
      FROM vista_timeline_general
      WHERE comunidad_id = ?
    `,
        [comunidadId]
      );

      res.json(statsResult[0]);
    } catch (err) {
      console.error('Error al obtener estadísticas de auditoría:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/bitacora/comunidad/:comunidadId - Crear nueva entrada de auditoría
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId'),
    body('type').isIn([
      'system',
      'user',
      'security',
      'maintenance',
      'admin',
      'financial',
    ]),
    body('priority').optional().isIn(['low', 'normal', 'high', 'critical']),
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('tags').optional().isArray(),
    body('attachments').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { comunidadId } = req.params;
      const {
        type,
        priority = 'normal',
        title,
        description,
        tags = [],
        attachments = [],
      } = req.body;

      // Obtener información del usuario actual
      const [userResult] = await db.query(
        `
      SELECT u.id, p.nombres, p.apellidos
      FROM usuario u
      LEFT JOIN persona p ON u.persona_id = p.id
      WHERE u.id = ?
    `,
        [req.user.id]
      );

      const user = userResult[0];
      const userName = user
        ? `${user.nombres || ''} ${user.apellidos || ''}`.trim()
        : 'Sistema';

      // Insertar nueva entrada
      const [result] = await db.query(
        `
      INSERT INTO bitacora_auditoria
      (comunidad_id, tipo, prioridad, titulo, descripcion, usuario, usuario_id, fecha, tags, adjuntos, ip, ubicacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `,
        [
          comunidadId,
          type,
          priority,
          title,
          description || null,
          userName,
          user ? user.id : null,
          JSON.stringify(tags),
          JSON.stringify(attachments),
          req.ip || null,
          req.get('User-Agent') || null,
        ]
      );

      // Obtener la entrada creada
      const [newEntry] = await db.query(
        `
      SELECT
        id, tipo, prioridad, titulo, descripcion, usuario, fecha, tags,
        JSON_LENGTH(adjuntos) as attachments, ip, ubicacion
      FROM vista_timeline_general
      WHERE id = ?
    `,
        [result.insertId]
      );

      const entry = newEntry[0];

      res.status(201).json({
        id: entry.id.toString(),
        type: entry.tipo,
        priority: entry.prioridad,
        title: entry.titulo,
        description: entry.descripcion,
        user: entry.usuario,
        date: entry.fecha.toISOString(),
        tags: entry.tags ? JSON.parse(entry.tags) : [],
        attachments: entry.attachments || 0,
        ip: entry.ip,
        location: entry.ubicacion,
      });
    } catch (err) {
      console.error('Error al crear entrada de auditoría:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/bitacora/export - Exportar datos de bitácora
router.get(
  '/export',
  [
    authenticate,
    query('comunidadId').isInt().toInt(),
    query('format').isIn(['csv', 'excel', 'pdf']),
    query('search').optional().isString().trim(),
    query('type')
      .optional()
      .isIn([
        'system',
        'user',
        'security',
        'maintenance',
        'admin',
        'financial',
      ]),
    query('priority').optional().isIn(['low', 'normal', 'high', 'critical']),
    query('dateRange').optional().isIn(['today', 'week', 'month', 'all']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { comunidadId, format, search, type, priority, dateRange } =
        req.query;

      // Verificar que el usuario tenga acceso a la comunidad
      const [communityCheck] = await db.query(
        `
      SELECT 1 FROM usuario_miembro_comunidad
      WHERE usuario_id = ? AND comunidad_id = ?
    `,
        [req.user.id, comunidadId]
      );

      if (communityCheck.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Aquí iría la lógica de exportación
      // Por ahora, solo devolver un mensaje
      res.json({
        message: `Exporting audit log in ${format.toUpperCase()} format`,
        filters: { search, type, priority, dateRange },
      });
    } catch (err) {
      console.error('Error al exportar registro de auditoría:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
