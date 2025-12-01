const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// Tipos de categoría permitidos
const TIPOS_CATEGORIA = [
  'operacional',
  'extraordinario',
  'fondo_reserva',
  'multas',
  'consumo',
];

// =========================================
// 0. LISTADO GLOBAL DE CATEGORÍAS (TODAS LAS COMUNIDADES DEL USUARIO)
// =========================================

/**
 * @swagger
 * /categorias-gasto:
 *   get:
 *     tags: [Categorías de Gasto]
 *     summary: Listado global de categorías de todas las comunidades del usuario
 *     description: Devuelve categorías de gasto de todas las comunidades donde el usuario tiene roles NO básicos
 *     responses:
 *       200:
 *         description: Lista de categorías
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const query = `
        SELECT
          cg.id,
          cg.comunidad_id,
          c.razon_social AS comunidad_nombre,
          cg.nombre,
          cg.tipo,
          cg.cta_contable,
          cg.activa,
          CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
          cg.created_at,
          cg.updated_at
        FROM categoria_gasto cg
        INNER JOIN comunidad c ON cg.comunidad_id = c.id
        INNER JOIN usuario_rol_comunidad urc ON cg.comunidad_id = urc.comunidad_id
        INNER JOIN rol_sistema r ON urc.rol_id = r.id
        WHERE urc.usuario_id = ?
          AND r.codigo NOT IN ('residente', 'propietario', 'inquilino')
        ORDER BY cg.nombre
      `;

    const [rows] = await db.query(query, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías de gasto' });
  }
});

// =========================================
// 1. LISTADO DE CATEGORÍAS CON FILTROS Y PAGINACIÓN
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Listado básico de categorías de gasto
 *     description: Devuelve una lista completa de categorías de gasto para una comunidad específica, incluyendo información básica y estado.
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   comunidad_id:
 *                     type: integer
 *                   comunidad_nombre:
 *                     type: string
 *                   nombre:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                     enum: [operacional, extraordinario, fondo_reserva, multas, consumo]
 *                   cta_contable:
 *                     type: string
 *                   activa:
 *                     type: integer
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      // Si comunidadId es null/undefined, devolver comunidades donde el usuario NO tenga rol básico
      let query, params;

      if (!comunidadId) {
        query = `
        SELECT
          cg.id,
          cg.comunidad_id,
          c.razon_social AS comunidad_nombre,
          cg.nombre,
          cg.tipo,
          cg.cta_contable,
          cg.activa,
          CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
          cg.created_at,
          cg.updated_at
        FROM categoria_gasto cg
        INNER JOIN comunidad c ON cg.comunidad_id = c.id
        INNER JOIN usuario_rol_comunidad urc ON cg.comunidad_id = urc.comunidad_id
        INNER JOIN rol_sistema r ON urc.rol_id = r.id
        WHERE urc.usuario_id = ?
          AND r.codigo NOT IN ('residente', 'propietario', 'inquilino')
        ORDER BY cg.nombre
        `;
        params = [req.user.id];
      } else {
        query = `
        SELECT
          cg.id,
          cg.comunidad_id,
          c.razon_social AS comunidad_nombre,
          cg.nombre,
          cg.tipo,
          cg.cta_contable,
          cg.activa,
          CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
          cg.created_at,
          cg.updated_at
        FROM categoria_gasto cg
        INNER JOIN comunidad c ON cg.comunidad_id = c.id
        WHERE cg.comunidad_id = ?
        ORDER BY cg.nombre
        `;
        params = [comunidadId];
      }

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías de gasto' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/filtrar:
 *   get:
 *     summary: Listado con filtros avanzados y paginación
 *     description: Devuelve una lista paginada de categorías de gasto con filtros opcionales por nombre, tipo y estado de actividad.
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - name: nombre_busqueda
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda en el nombre de la categoría
 *       - name: tipo_filtro
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [operacional, extraordinario, fondo_reserva, multas, consumo]
 *         description: Filtrar por tipo de categoría
 *       - name: activa_filtro
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filtrar por estado activo (0=inactiva, 1=activa, -1=todas)
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de elementos por página
 *       - name: offset
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista filtrada de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                       cta_contable:
 *                         type: string
 *                       status:
 *                         type: string
 *                       comunidad:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/filtrar:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Listado filtrado de categorías de gasto
 *     description: Devuelve una lista filtrada de categorías de gasto para una comunidad específica
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - name: nombre_busqueda
 *         in: query
 *         schema:
 *           type: string
 *         description: Término de búsqueda en nombre
 *       - name: tipo_filtro
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtro por tipo
 *       - name: activa_filtro
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filtro por estado activo
 *     responses:
 *       200:
 *         description: Lista filtrada obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

router.get(
  '/comunidad/:comunidadId/filtrar',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        nombre_busqueda,
        tipo_filtro,
        activa_filtro,
        limit = 50,
        offset = 0,
      } = req.query;

      let query, params;

      // Si comunidadId es null/undefined (todas las comunidades), filtrar por roles no básicos
      if (!comunidadId) {
        query = `
        SELECT
          cg.id,
          cg.nombre,
          cg.tipo,
          cg.cta_contable,
          CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
          c.razon_social AS comunidad,
          cg.created_at,
          cg.updated_at
        FROM categoria_gasto cg
        INNER JOIN comunidad c ON cg.comunidad_id = c.id
        INNER JOIN usuario_rol_comunidad urc ON cg.comunidad_id = urc.comunidad_id
        INNER JOIN rol_sistema r ON urc.rol_id = r.id
        WHERE urc.usuario_id = ?
          AND r.codigo NOT IN ('residente', 'propietario', 'inquilino')
        `;
        params = [req.user.id];
      } else {
        query = `
        SELECT
          cg.id,
          cg.nombre,
          cg.tipo,
          cg.cta_contable,
          CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
          c.razon_social AS comunidad,
          cg.created_at,
          cg.updated_at
        FROM categoria_gasto cg
        INNER JOIN comunidad c ON cg.comunidad_id = c.id
        WHERE cg.comunidad_id = ?
        `;
        params = [comunidadId];
      }

      if (nombre_busqueda) {
        query += ' AND cg.nombre LIKE ?';
        params.push(`%${nombre_busqueda}%`);
      }

      if (tipo_filtro) {
        query += ' AND cg.tipo = ?';
        params.push(tipo_filtro);
      }

      if (activa_filtro !== undefined && activa_filtro !== '-1') {
        query += ' AND cg.activa = ?';
        params.push(Number(activa_filtro));
      }

      // Obtener total antes de aplicar limit/offset
      const countQuery = query.replace(
        /SELECT.*FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const [countResult] = await db.query(countQuery, params);
      const total = countResult[0].total;

      query += ' ORDER BY cg.nombre LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);

      res.json({
        data: rows,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al filtrar categorías' });
    }
  }
);

// =========================================
// 2. DETALLE DE CATEGORÍA ESPECÍFICA
// =========================================

/**
 * @swagger
 * /categorias-gasto/{id}/detalle:
 *   get:
 *     summary: Detalle completo de una categoría con estadísticas
 *     description: Devuelve información detallada de una categoría específica, incluyendo estadísticas de uso y gastos asociados.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *       - name: comunidad_id
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la comunidad para filtrar (opcional)
 *     responses:
 *       200:
 *         description: Detalle de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 comunidad_id:
 *                   type: integer
 *                 comunidad_nombre:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 cta_contable:
 *                   type: string
 *                 activa:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 gastos_asociados:
 *                   type: integer
 *                 total_gastado:
 *                   type: number
 *                 ultimo_uso:
 *                   type: string
 *                   format: date
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:id/detalle', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidad_id } = req.query;

    const query = `
      SELECT
        cg.id,
        cg.comunidad_id,
        c.razon_social AS comunidad_nombre,
        cg.nombre,
        cg.tipo,
        cg.cta_contable,
        cg.activa,
        CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
        (SELECT COUNT(*) FROM gasto g WHERE g.categoria_id = cg.id) AS gastos_asociados,
        (SELECT SUM(g.monto) FROM gasto g WHERE g.categoria_id = cg.id) AS total_gastado,
        (SELECT MAX(g.fecha) FROM gasto g WHERE g.categoria_id = cg.id) AS ultimo_uso,
        cg.created_at,
        cg.updated_at
      FROM categoria_gasto cg
      INNER JOIN comunidad c ON cg.comunidad_id = c.id
      WHERE cg.id = ?
    `;

    const params = [id];
    let finalQuery = query;

    if (comunidad_id) {
      finalQuery += ' AND cg.comunidad_id = ?';
      params.push(comunidad_id);
    }

    const [rows] = await db.query(finalQuery, params);

    if (!rows.length) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener detalle de categoría' });
  }
});

/**
 * @swagger
 * /categorias-gasto/{id}/ultimos-gastos:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Últimos gastos asociados a la categoría
 */
router.get('/:id/ultimos-gastos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const query = `
      SELECT
        g.id,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        p.razon_social AS proveedor,
        g.created_at
      FROM gasto g
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.categoria_id = ?
      ORDER BY g.fecha DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [id, Number(limit)]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener últimos gastos' });
  }
});

// =========================================
// 3. OPERACIONES CRUD
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}:
 *   post:
 *     summary: Crear nueva categoría de gasto
 *     description: Crea una nueva categoría de gasto para la comunidad especificada.
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoría
 *               tipo:
 *                 type: string
 *                 enum: [operacional, extraordinario, fondo_reserva, multas, consumo]
 *                 default: operacional
 *                 description: Tipo de categoría
 *               cta_contable:
 *                 type: string
 *                 description: Cuenta contable asociada
 *               activa:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo de la categoría
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 cta_contable:
 *                   type: string
 *                 activa:
 *                   type: integer
 *       400:
 *         description: Datos de validación incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       409:
 *         description: Ya existe una categoría con ese nombre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin', 'admin_comunidad'], true),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('tipo').optional().isIn(TIPOS_CATEGORIA).withMessage('Tipo inválido'),
    body('cta_contable').optional(),
    body('activa').optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, tipo, cta_contable, activa } = req.body;

      const tipoVal =
        tipo && TIPOS_CATEGORIA.includes(tipo) ? tipo : 'operacional';
      const activaVal = typeof activa === 'undefined' ? 1 : activa ? 1 : 0;

      const [result] = await db.query(
        'INSERT INTO categoria_gasto (comunidad_id, nombre, tipo, cta_contable, activa) VALUES (?,?,?,?,?)',
        [comunidadId, nombre, tipoVal, cta_contable || null, activaVal]
      );

      const [row] = await db.query(
        'SELECT id, nombre, tipo, cta_contable, activa FROM categoria_gasto WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res
          .status(409)
          .json({ error: 'Ya existe una categoría con ese nombre' });
      }
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/{id}:
 *   get:
 *     summary: Obtener una categoría específica
 *     description: Devuelve los detalles de una categoría de gasto específica por ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Detalles de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 comunidad_id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 cta_contable:
 *                   type: string
 *                 activa:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, comunidad_id, nombre, tipo, cta_contable, activa, created_at, updated_at FROM categoria_gasto WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

/**
 * @swagger
 * /categorias-gasto/{id}:
 *   patch:
 *     summary: Actualizar categoría de gasto
 *     description: Actualiza parcialmente una categoría de gasto existente.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la categoría
 *               tipo:
 *                 type: string
 *                 enum: [operacional, extraordinario, fondo_reserva, multas, consumo]
 *                 description: Nuevo tipo de categoría
 *               cta_contable:
 *                 type: string
 *                 description: Nueva cuenta contable
 *               activa:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Nuevo estado activo
 *               comunidad_id:
 *                 type: integer
 *                 description: ID de la comunidad (opcional para filtrar)
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 comunidad_id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 cta_contable:
 *                   type: string
 *                 activa:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos o no hay campos para actualizar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin', 'admin_comunidad'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, tipo, cta_contable, activa, comunidad_id } = req.body;

      const updates = [];
      const values = [];

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre);
      }

      if (tipo !== undefined) {
        if (!TIPOS_CATEGORIA.includes(tipo)) {
          return res.status(400).json({ error: 'Tipo de categoría inválido' });
        }
        updates.push('tipo = ?');
        values.push(tipo);
      }

      if (cta_contable !== undefined) {
        updates.push('cta_contable = ?');
        values.push(cta_contable);
      }

      if (activa !== undefined) {
        updates.push('activa = ?');
        values.push(activa ? 1 : 0);
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');

      let query = `UPDATE categoria_gasto SET ${updates.join(
        ', '
      )} WHERE id = ?`;
      values.push(id);

      if (comunidad_id) {
        query += ' AND comunidad_id = ?';
        values.push(comunidad_id);
      }

      await db.query(query, values);

      const [rows] = await db.query(
        'SELECT * FROM categoria_gasto WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/{id}:
 *   delete:
 *     summary: Eliminar categoría de gasto
 *     description: Elimina una categoría de gasto específica.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *       - name: comunidad_id
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de la comunidad para filtrar (opcional)
 *     responses:
 *       204:
 *         description: Categoría eliminada exitosamente
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comunidad_id } = req.query;

      let query = 'DELETE FROM categoria_gasto WHERE id = ?';
      const params = [id];

      if (comunidad_id) {
        query += ' AND comunidad_id = ?';
        params.push(comunidad_id);
      }

      await db.query(query, params);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar categoría' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/{id}/activar:
 *   patch:
 *     summary: Activar/Desactivar categoría
 *     description: Cambia el estado activo/inactivo de una categoría de gasto.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activa
 *             properties:
 *               activa:
 *                 type: boolean
 *                 description: Estado activo deseado
 *               comunidad_id:
 *                 type: integer
 *                 description: ID de la comunidad para filtrar (opcional)
 *     responses:
 *       200:
 *         description: Estado de la categoría actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 cta_contable:
 *                   type: string
 *                 activa:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.patch(
  '/:id/activar',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { activa, comunidad_id } = req.body;

      let query =
        'UPDATE categoria_gasto SET activa = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const params = [activa ? 1 : 0, id];

      if (comunidad_id) {
        query += ' AND comunidad_id = ?';
        params.push(comunidad_id);
      }

      await db.query(query, params);

      const [rows] = await db.query(
        'SELECT * FROM categoria_gasto WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al cambiar estado de categoría' });
    }
  }
);

// =========================================
// 4. ESTADÍSTICAS Y REPORTES
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/estadisticas/generales:
 *   get:
 *     summary: Estadísticas generales de categorías
 *     description: Devuelve estadísticas generales sobre las categorías de gasto de una comunidad.
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Estadísticas generales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_categorias:
 *                   type: integer
 *                 categorias_activas:
 *                   type: integer
 *                 categorias_inactivas:
 *                   type: integer
 *                 tipos_distintos:
 *                   type: integer
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/comunidad/:comunidadId/estadisticas/generales',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        COUNT(*) AS total_categorias,
        SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS categorias_activas,
        SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) AS categorias_inactivas,
        COUNT(DISTINCT tipo) AS tipos_distintos
      FROM categoria_gasto
      WHERE comunidad_id = ?
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener estadísticas generales' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/estadisticas/por-tipo:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Estadísticas por tipo de categoría
 */
router.get(
  '/comunidad/:comunidadId/estadisticas/por-tipo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        tipo,
        COUNT(*) AS cantidad,
        SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS activas,
        SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) AS inactivas
      FROM categoria_gasto
      WHERE comunidad_id = ?
      GROUP BY tipo
      ORDER BY cantidad DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener estadísticas por tipo' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/mas-utilizadas:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Categorías más utilizadas por cantidad de gastos
 */
router.get(
  '/comunidad/:comunidadId/mas-utilizadas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_gasto,
        MAX(g.fecha) AS ultimo_gasto
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cg.id, cg.nombre, cg.tipo
      HAVING COUNT(g.id) > 0
      ORDER BY cantidad_gastos DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener categorías más utilizadas' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/mas-costosas:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Categorías más costosas por monto total
 */
router.get(
  '/comunidad/:comunidadId/mas-costosas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_gasto,
        MIN(g.fecha) AS primer_gasto,
        MAX(g.fecha) AS ultimo_gasto
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cg.id, cg.nombre, cg.tipo
      HAVING SUM(g.monto) > 0
      ORDER BY total_monto DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener categorías más costosas' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/sin-uso:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Categorías sin uso en período
 */
router.get(
  '/comunidad/:comunidadId/sin-uso',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { dias = 30 } = req.query;

      const query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        cg.activa,
        MAX(g.fecha) AS ultimo_gasto,
        DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
      GROUP BY cg.id, cg.nombre, cg.tipo, cg.activa
      HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > ?
      ORDER BY dias_sin_uso DESC
    `;

      const [rows] = await db.query(query, [comunidadId, Number(dias)]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías sin uso' });
    }
  }
);

// =========================================
// 5. VALIDACIONES
// =========================================

/**
 * @swagger
 * /categorias-gasto/{id}/existe:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Verificar si existe una categoría
 */
router.get('/:id/existe', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidad_id } = req.query;

    let query =
      'SELECT COUNT(*) > 0 AS existe FROM categoria_gasto WHERE id = ?';
    const params = [id];

    if (comunidad_id) {
      query += ' AND comunidad_id = ?';
      params.push(comunidad_id);
    }

    const [rows] = await db.query(query, params);
    res.json({ existe: rows[0].existe === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar categoría' });
  }
});

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/validar-nombre:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Verificar si existe categoría con el mismo nombre
 */
router.get(
  '/comunidad/:comunidadId/validar-nombre',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, excluir_id } = req.query;

      if (!nombre) {
        return res.status(400).json({ error: 'Nombre es requerido' });
      }

      let query = `
      SELECT COUNT(*) > 0 AS existe_duplicado
      FROM categoria_gasto
      WHERE comunidad_id = ? AND nombre = ?
    `;
      const params = [comunidadId, nombre];

      if (excluir_id) {
        query += ' AND id != ?';
        params.push(excluir_id);
      }

      const [rows] = await db.query(query, params);
      res.json({ existe_duplicado: rows[0].existe_duplicado === 1 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al validar nombre' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/{id}/tiene-gastos:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Verificar si la categoría tiene gastos asociados
 */
router.get('/:id/tiene-gastos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query =
      'SELECT COUNT(*) > 0 AS tiene_gastos FROM gasto WHERE categoria_id = ?';
    const [rows] = await db.query(query, [id]);

    res.json({ tiene_gastos: rows[0].tiene_gastos === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar gastos' });
  }
});

/**
 * @swagger
 * /categorias-gasto/validar-tipo:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Verificar si el tipo de categoría es válido
 */
router.get('/validar-tipo', authenticate, async (req, res) => {
  try {
    const { tipo } = req.query;

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo es requerido' });
    }

    const tipo_valido = TIPOS_CATEGORIA.includes(tipo);
    res.json({
      tipo_valido,
      tipos_permitidos: TIPOS_CATEGORIA,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al validar tipo' });
  }
});

// =========================================
// 6. LISTAS DESPLEGABLES
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/activas:
 *   get:
 *     summary: Lista de categorías activas para dropdowns
 *     description: Devuelve una lista de categorías activas de una comunidad para usar en menús desplegables.
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de categorías activas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   cta_contable:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/comunidad/:comunidadId/activas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        id,
        nombre,
        tipo,
        cta_contable
      FROM categoria_gasto
      WHERE comunidad_id = ? AND activa = 1
      ORDER BY nombre
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías activas' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/tipos:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Lista de tipos de categoría disponibles en la comunidad
 */
router.get(
  '/comunidad/:comunidadId/tipos',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT DISTINCT
        tipo,
        CASE tipo
          WHEN 'operacional' THEN 'Operacional'
          WHEN 'extraordinario' THEN 'Extraordinario'
          WHEN 'fondo_reserva' THEN 'Fondo Reserva'
          WHEN 'multas' THEN 'Multas'
          WHEN 'consumo' THEN 'Consumo'
          ELSE tipo
        END AS descripcion
      FROM categoria_gasto
      WHERE comunidad_id = ?
      ORDER BY tipo
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener tipos de categoría' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/por-tipo/{tipo}:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Lista de categorías por tipo específico
 */
router.get(
  '/comunidad/:comunidadId/por-tipo/:tipo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { tipo } = req.params;

      if (!TIPOS_CATEGORIA.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de categoría inválido' });
      }

      const query = `
      SELECT
        id,
        nombre,
        tipo,
        cta_contable,
        activa
      FROM categoria_gasto
      WHERE comunidad_id = ? AND tipo = ?
      ORDER BY nombre
    `;

      const [rows] = await db.query(query, [comunidadId, tipo]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías por tipo' });
    }
  }
);

// =========================================
// 7. REPORTES AVANZADOS
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/reporte/por-mes:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Reporte de uso de categorías por mes
 */
router.get(
  '/comunidad/:comunidadId/reporte/por-mes',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res
          .status(400)
          .json({ error: 'Fechas de inicio y fin son requeridas' });
      }

      const query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        YEAR(g.fecha) AS anio,
        MONTH(g.fecha) AS mes,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_monto
      FROM categoria_gasto cg
      INNER JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
        AND g.fecha BETWEEN ? AND ?
      GROUP BY cg.id, cg.nombre, cg.tipo, YEAR(g.fecha), MONTH(g.fecha)
      ORDER BY cg.nombre, anio DESC, mes DESC
    `;

      const [rows] = await db.query(query, [
        comunidadId,
        fecha_inicio,
        fecha_fin,
      ]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al generar reporte por mes' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/reporte/comparativo:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Análisis comparativo de categorías (último mes vs mes anterior)
 */
router.get(
  '/comunidad/:comunidadId/reporte/comparativo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        COUNT(g.id) AS total_gastos,
        SUM(g.monto) AS total_monto,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_ultimo_mes,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_ultimo_mes,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_mes_anterior,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_mes_anterior
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
      GROUP BY cg.id, cg.nombre, cg.tipo
      ORDER BY total_monto DESC
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al generar reporte comparativo' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/reporte/variabilidad:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Categorías con mayor variabilidad en gastos
 */
router.get(
  '/comunidad/:comunidadId/reporte/variabilidad',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        COUNT(g.id) AS cantidad_gastos,
        AVG(g.monto) AS promedio,
        STDDEV(g.monto) AS desviacion_estandar,
        MIN(g.monto) AS minimo,
        MAX(g.monto) AS maximo,
        (STDDEV(g.monto) / NULLIF(AVG(g.monto), 0)) * 100 AS coeficiente_variacion
      FROM categoria_gasto cg
      INNER JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cg.id, cg.nombre, cg.tipo
      HAVING COUNT(g.id) >= 3 AND AVG(g.monto) IS NOT NULL
      ORDER BY coeficiente_variacion DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al generar reporte de variabilidad' });
    }
  }
);

// =========================================
// 8. EXPORTACIÓN
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/exportar:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Exportación completa para Excel/CSV
 */
router.get(
  '/comunidad/:comunidadId/exportar',
  authenticate,
  requireCommunity('comunidadId'),
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cg.id AS 'ID Categoría',
        c.razon_social AS 'Comunidad',
        cg.nombre AS 'Nombre',
        CASE cg.tipo
          WHEN 'operacional' THEN 'Operacional'
          WHEN 'extraordinario' THEN 'Extraordinario'
          WHEN 'fondo_reserva' THEN 'Fondo Reserva'
          WHEN 'multas' THEN 'Multas'
          WHEN 'consumo' THEN 'Consumo'
          ELSE cg.tipo
        END AS 'Tipo',
        cg.cta_contable AS 'Cuenta Contable',
        CASE WHEN cg.activa = 1 THEN 'Activa' ELSE 'Inactiva' END AS 'Estado',
        COALESCE(stats.cantidad_gastos, 0) AS 'Cantidad Gastos',
        COALESCE(stats.total_monto, 0) AS 'Total Gastado',
        DATE_FORMAT(stats.ultimo_gasto, '%d/%m/%Y') AS 'Último Gasto',
        DATE_FORMAT(cg.created_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(cg.updated_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Actualización'
      FROM categoria_gasto cg
      INNER JOIN comunidad c ON cg.comunidad_id = c.id
      LEFT JOIN (
        SELECT
          categoria_id,
          COUNT(*) AS cantidad_gastos,
          SUM(monto) AS total_monto,
          MAX(fecha) AS ultimo_gasto
        FROM gasto
        GROUP BY categoria_id
      ) AS stats ON cg.id = stats.categoria_id
      WHERE cg.comunidad_id = ?
      ORDER BY cg.nombre
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al exportar categorías' });
    }
  }
);

// =========================================
// 9. DASHBOARD
// =========================================

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/resumen:
 *   get:
 *     summary: Resumen de categorías para dashboard
 *     description: Devuelve un resumen estadístico de las categorías de gasto para mostrar en el dashboard de la comunidad.
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Resumen para dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_categorias:
 *                   type: integer
 *                 categorias_activas:
 *                   type: integer
 *                 categorias_inactivas:
 *                   type: integer
 *                 tipos_categorias:
 *                   type: integer
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/comunidad/:comunidadId/dashboard/resumen',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        COUNT(*) AS total_categorias,
        SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS categorias_activas,
        SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) AS categorias_inactivas,
        COUNT(DISTINCT tipo) AS tipos_categorias
      FROM categoria_gasto
      WHERE comunidad_id = ?
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/top-mes:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Top categorías por gasto en el último mes
 */
router.get(
  '/comunidad/:comunidadId/dashboard/top-mes',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { limit = 5 } = req.query;

      const query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto
      FROM categoria_gasto cg
      INNER JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
        AND g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
      GROUP BY cg.id, cg.nombre, cg.tipo
      ORDER BY total_monto DESC
      LIMIT ?
    `;

      const [rows] = await db.query(query, [comunidadId, Number(limit)]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener top categorías' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/sin-uso-reciente:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Categorías activas sin uso reciente
 */
router.get(
  '/comunidad/:comunidadId/dashboard/sin-uso-reciente',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { dias = 30, limit = 10 } = req.query;

      const query = `
      SELECT
        cg.nombre AS categoria,
        cg.tipo,
        MAX(g.fecha) AS ultimo_gasto,
        DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
        AND cg.activa = 1
      GROUP BY cg.id, cg.nombre, cg.tipo
      HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > ?
      ORDER BY dias_sin_uso DESC
      LIMIT ?
    `;

      const [rows] = await db.query(query, [
        comunidadId,
        Number(dias),
        Number(limit),
      ]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías sin uso' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/distribucion-tipo:
 *   get:
 *     tags: [Categor�as de Gasto]
 *     summary: Distribución de gastos por tipo de categoría
 */
router.get(
  '/comunidad/:comunidadId/dashboard/distribucion-tipo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let subQuery = `SELECT SUM(monto) FROM gasto WHERE comunidad_id = ?`;
      const params = [comunidadId];
      const subParams = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        subQuery += ' AND fecha BETWEEN ? AND ?';
        subParams.push(fecha_inicio, fecha_fin);
      }

      let query = `
      SELECT
        cg.tipo,
        CASE cg.tipo
          WHEN 'operacional' THEN 'Operacional'
          WHEN 'extraordinario' THEN 'Extraordinario'
          WHEN 'fondo_reserva' THEN 'Fondo Reserva'
          WHEN 'multas' THEN 'Multas'
          WHEN 'consumo' THEN 'Consumo'
          ELSE cg.tipo
        END AS tipo_descripcion,
        COUNT(DISTINCT cg.id) AS categorias,
        COUNT(g.id) AS total_gastos,
        SUM(g.monto) AS total_monto,
        (SUM(g.monto) / NULLIF((${subQuery}), 0)) * 100 AS porcentaje_total
      FROM categoria_gasto cg
      LEFT JOIN gasto g ON cg.id = g.categoria_id
      WHERE cg.comunidad_id = ?
    `;

      params.push(...subParams, comunidadId);

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += ' GROUP BY cg.tipo ORDER BY total_monto DESC';

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener distribución por tipo' });
    }
  }
);

/**
 * @swagger
 * /categorias-gasto:
 *   get:
 *     summary: Lista global de categorías de gasto
 *     description: Devuelve una lista paginada de categorías de gasto. Para superadmin muestra todas, para otros roles filtra por comunidades asignadas.
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Número de elementos por página
 *       - name: nombre_busqueda
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Término de búsqueda en el nombre
 *       - name: tipo_filtro
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [operacional, extraordinario, fondo_reserva, multas, consumo]
 *         description: Filtrar por tipo
 *       - name: activa_filtro
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [-1, 0, 1]
 *           default: -1
 *         description: Filtrar por estado activo (-1=todas, 0=inactiva, 1=activa)
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                       cta_contable:
 *                         type: string
 *                       status:
 *                         type: string
 *                       comunidad:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get(
  '/',
  authenticate,
  authorize(
    'superadmin',
    'admin_comunidad',
    'conserje',
    'contador',
    'proveedor_servicio',
    'residente',
    'propietario',
    'inquilino',
    'tesorero',
    'presidente_comite'
  ),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 100,
        nombre_busqueda = '',
        tipo_filtro = '',
        activa_filtro = -1,
      } = req.query;

      const offset = (page - 1) * limit;

      let whereClauses = [];
      const params = [];

      if (nombre_busqueda) {
        whereClauses.push('cg.nombre LIKE ?');
        params.push(`%${nombre_busqueda}%`);
      }

      if (tipo_filtro) {
        whereClauses.push('cg.tipo = ?');
        params.push(tipo_filtro);
      }

      if (activa_filtro !== -1) {
        whereClauses.push('cg.activa = ?');
        params.push(Number(activa_filtro));
      }

      let query = `
      SELECT
        cg.id,
        cg.nombre,
        cg.tipo,
        cg.cta_contable,
        CASE WHEN cg.activa = 1 THEN 'active' ELSE 'inactive' END AS status,
        c.razon_social AS comunidad,
        cg.created_at,
        cg.updated_at
      FROM categoria_gasto cg
      INNER JOIN comunidad c ON cg.comunidad_id = c.id
    `;

      // Filtro por comunidades asignadas si no es superadmin
      if (!req.user.is_superadmin) {
        whereClauses.push(`cg.comunidad_id IN (
        SELECT umc.comunidad_id
        FROM usuario_miembro_comunidad umc
        WHERE umc.persona_id = ? AND umc.activo = 1 AND (umc.hasta IS NULL OR umc.hasta > CURDATE())
      )`);
        params.push(req.user.persona_id);
      }

      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      // Obtener total
      const countQuery = query.replace(
        /SELECT.*FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const [countResult] = await db.query(countQuery, params);
      const total = countResult[0].total;

      query += ' ORDER BY cg.nombre LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);
      console.log('Categorias rows:', rows); // <-- añadir
      res.json({
        data: rows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  }
);

// =========================================
// PUT /categorias-gasto/:id
// Actualizar categoría de gasto
// =========================================
router.put(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  [
    body('nombre')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Nombre no puede estar vacío'),
    body('tipo')
      .optional()
      .isIn(TIPOS_CATEGORIA)
      .withMessage('Tipo de categoría inválido'),
    body('cta_contable').optional().trim().escape(),
    body('activa')
      .optional()
      .isBoolean()
      .withMessage('Activa debe ser booleano'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { nombre, tipo, cta_contable, activa } = req.body;

      // Obtener categoría actual
      const [categorias] = await db.query(
        'SELECT * FROM categoria_gasto WHERE id = ?',
        [id]
      );
      if (categorias.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Categoría no encontrada' });
      }

      const categoria = categorias[0];
      const valores_anteriores = { ...categoria };

      // Validar que el nuevo nombre sea único en la comunidad (si se proporciona)
      if (nombre && nombre !== categoria.nombre) {
        const [duplicados] = await db.query(
          'SELECT id FROM categoria_gasto WHERE nombre = ? AND comunidad_id = ? AND id != ?',
          [nombre, categoria.comunidad_id, id]
        );
        if (duplicados.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Ya existe una categoría con ese nombre',
          });
        }
      }

      // Construir query de actualización
      let updateFields = [];
      let updateValues = [];

      if (nombre !== undefined) {
        updateFields.push('nombre = ?');
        updateValues.push(nombre);
      }
      if (tipo !== undefined) {
        updateFields.push('tipo = ?');
        updateValues.push(tipo);
      }
      if (cta_contable !== undefined) {
        updateFields.push('cta_contable = ?');
        updateValues.push(cta_contable);
      }
      if (activa !== undefined) {
        updateFields.push('activa = ?');
        updateValues.push(activa ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'No hay campos para actualizar' });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE categoria_gasto SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(updateQuery, updateValues);

      // Obtener categoría actualizada
      const [categoriasActualizadas] = await db.query(
        'SELECT * FROM categoria_gasto WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'UPDATE',
          'categoria_gasto',
          id,
          JSON.stringify(valores_anteriores),
          JSON.stringify(categoriasActualizadas[0]),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoriasActualizadas[0],
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// =========================================
// DELETE /categorias-gasto/:id
// Eliminar categoría (soft delete)
// =========================================
router.delete(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener categoría
      const [categorias] = await db.query(
        'SELECT * FROM categoria_gasto WHERE id = ?',
        [id]
      );
      if (categorias.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Categoría no encontrada' });
      }

      const categoria = categorias[0];

      // Validar que no tenga gastos activos
      const [gastos] = await db.query(
        `SELECT COUNT(*) as total FROM gasto 
         WHERE categoria_gasto_id = ? AND estado IN ('pendiente', 'aprobado')`,
        [id]
      );

      if (gastos[0].total > 0) {
        return res.status(409).json({
          success: false,
          error: `No se puede eliminar: hay ${gastos[0].total} gasto(s) activo(s) en esta categoría`,
        });
      }

      // Soft delete - marcar como inactiva
      await db.query(
        'UPDATE categoria_gasto SET activa = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'DELETE',
          'categoria_gasto',
          id,
          JSON.stringify(categoria),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE CATEGORÍAS DE GASTO
// =========================================

// // LISTADOS, FILTROS Y DETALLES
// GET: /categorias-gasto/comunidad/:comunidadId
// GET: /categorias-gasto/comunidad/:comunidadId/filtrar
// GET: /categorias-gasto/:id/detalle
// GET: /categorias-gasto/:id/ultimos-gastos
// GET: /categorias-gasto/:id

// // OPERACIONES CRUD
// POST: /categorias-gasto/comunidad/:comunidadId
// PATCH: /categorias-gasto/:id
// DELETE: /categorias-gasto/:id
// PATCH: /categorias-gasto/:id/activar

// // ESTADÍSTICAS Y REPORTES
// GET: /categorias-gasto/comunidad/:comunidadId/estadisticas/generales
// GET: /categorias-gasto/comunidad/:comunidadId/estadisticas/por-tipo
// GET: /categorias-gasto/comunidad/:comunidadId/mas-utilizadas
// GET: /categorias-gasto/comunidad/:comunidadId/mas-costosas
// GET: /categorias-gasto/comunidad/:comunidadId/sin-uso
// GET: /categorias-gasto/comunidad/:comunidadId/reporte/por-mes
// GET: /categorias-gasto/comunidad/:comunidadId/reporte/comparativo
// GET: /categorias-gasto/comunidad/:comunidadId/reporte/variabilidad

// // VALIDACIONES
// GET: /categorias-gasto/:id/existe
// GET: /categorias-gasto/comunidad/:comunidadId/validar-nombre
// GET: /categorias-gasto/:id/tiene-gastos
// GET: /categorias-gasto/validar-tipo

// // LISTAS DESPLEGABLES
// GET: /categorias-gasto/comunidad/:comunidadId/activas
// GET: /categorias-gasto/comunidad/:comunidadId/tipos
// GET: /categorias-gasto/comunidad/:comunidadId/por-tipo/:tipo

// // EXPORTACIÓN
// GET: /categorias-gasto/comunidad/:comunidadId/exportar

// // DASHBOARD
// GET: /categorias-gasto/comunidad/:comunidadId/dashboard/resumen
// GET: /categorias-gasto/comunidad/:comunidadId/dashboard/top-mes
// GET: /categorias-gasto/comunidad/:comunidadId/dashboard/sin-uso-reciente
// GET: /categorias-gasto/comunidad/:comunidadId/dashboard/distribucion-tipo
