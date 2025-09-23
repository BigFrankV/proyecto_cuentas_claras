// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * tags:
 *   - name: Edificios
 *     description: Gestión de edificios
 */

/**
 * @openapi
 * /edificios:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener todos los edificios con estadísticas
 *     description: Lista todos los edificios con información estadística completa
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda (nombre, código, dirección)
 *       - in: query
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, construccion, mantenimiento]
 *         description: Estado del edificio
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de edificios con estadísticas
 */
// GET /edificios - Obtener todos los edificios con estadísticas y filtros
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, comunidadId, estado, fechaDesde, fechaHasta } = req.query;
    
    let query = `
      SELECT 
        e.id,
        e.nombre,
        e.codigo,
        e.direccion,
        e.created_at AS fecha_creacion,
        e.updated_at AS fecha_actualizacion,
        c.razon_social AS comunidad_nombre,
        c.id AS comunidad_id,
        COUNT(DISTINCT t.id) AS numero_torres,
        COUNT(DISTINCT u.id) AS total_unidades,
        COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_activas,
        CASE 
          WHEN COUNT(DISTINCT u.id) = 0 THEN 'construccion'
          WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activo'
          WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactivo'
          ELSE 'mantenimiento'
        END AS estado,
        CASE 
          WHEN c.direccion LIKE '%Las Condes%' OR c.direccion LIKE '%Vitacura%' OR c.direccion LIKE '%Providencia%' THEN 'residencial'
          WHEN c.direccion LIKE '%Centro%' THEN 'comercial'
          ELSE 'mixto'
        END AS tipo,
        ROUND(
          (COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) / 
           NULLIF(COUNT(DISTINCT u.id), 0)) * 100, 1
        ) AS porcentaje_ocupacion
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      LEFT JOIN torre t ON e.id = t.edificio_id
      LEFT JOIN unidad u ON e.id = u.edificio_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtros
    if (search) {
      query += ` AND (
        e.nombre LIKE ? OR
        e.codigo LIKE ? OR
        e.direccion LIKE ? OR
        c.razon_social LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }
    
    if (comunidadId) {
      query += ` AND c.id = ?`;
      params.push(comunidadId);
    }
    
    if (fechaDesde) {
      query += ` AND e.created_at >= ?`;
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      query += ` AND e.created_at <= ?`;
      params.push(fechaHasta);
    }
    
    query += `
      GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at, c.razon_social, c.id, c.direccion
    `;
    
    // Filtro por estado calculado (se aplica después del GROUP BY)
    if (estado) {
      query += ` HAVING estado = ?`;
      params.push(estado);
    }
    
    query += ` ORDER BY e.nombre`;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching edificios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/stats:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener estadísticas generales de edificios
 *     responses:
 *       200:
 *         description: Estadísticas generales
 */
// GET /edificios/stats - Obtener estadísticas generales
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) AS total_edificios,
        COUNT(CASE WHEN (
          SELECT COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) 
          FROM unidad u WHERE u.edificio_id = e.id
        ) > 0 THEN 1 END) AS edificios_activos,
        SUM((SELECT COUNT(DISTINCT u.id) FROM unidad u WHERE u.edificio_id = e.id)) AS total_unidades,
        SUM((SELECT COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) FROM unidad u WHERE u.edificio_id = e.id)) AS unidades_ocupadas,
        ROUND(
          (SUM((SELECT COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) FROM unidad u WHERE u.edificio_id = e.id)) / 
           NULLIF(SUM((SELECT COUNT(DISTINCT u.id) FROM unidad u WHERE u.edificio_id = e.id)), 0)) * 100, 2
        ) AS ocupacion
      FROM edificio e
    `);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/comunidades-opciones:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener lista de comunidades para formularios
 *     responses:
 *       200:
 *         description: Lista de comunidades disponibles
 */
// GET /edificios/comunidades-opciones - Obtener comunidades para formularios
router.get('/comunidades-opciones', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id AS value, 
        razon_social AS label,
        direccion,
        email_contacto,
        telefono_contacto
      FROM comunidad 
      ORDER BY razon_social
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching comunidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener edificio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Información completa del edificio
 *       404:
 *         description: Edificio no encontrado
 */
// GET /edificios/:id - Obtener edificio específico con información completa
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        e.codigo,
        e.direccion,
        e.created_at AS fecha_creacion,
        e.updated_at AS fecha_actualizacion,
        e.tipo,
        e.pisos,
        e.ano_construccion,
        e.area_comun,
        e.area_privada,
        e.parqueaderos,
        e.depositos,
        e.administrador,
        e.telefono_administrador,
        e.email_administrador,
        e.servicios,
        e.amenidades,
        e.latitud,
        e.longitud,
        e.imagen,
        e.observaciones,
        e.estado,
        c.id AS comunidad_id,
        c.razon_social AS comunidad_nombre,
        c.direccion AS comunidad_direccion,
        COUNT(DISTINCT t.id) AS numero_torres,
        COUNT(DISTINCT u.id) AS total_unidades,
        COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS total_unidades_ocupadas,
        CASE 
          WHEN COUNT(DISTINCT u.id) = 0 THEN 'construccion'
          WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activo'
          WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactivo'
          ELSE 'mantenimiento'
        END AS estado_calculado
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      LEFT JOIN torre t ON e.id = t.edificio_id
      LEFT JOIN unidad u ON e.id = u.edificio_id
      WHERE e.id = ?
      GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at,
               e.tipo, e.pisos, e.ano_construccion, e.area_comun, e.area_privada,
               e.parqueaderos, e.depositos, e.administrador, e.telefono_administrador,
               e.email_administrador, e.servicios, e.amenidades, e.latitud, e.longitud,
               e.imagen, e.observaciones, e.estado,
               c.id, c.razon_social, c.direccion
    `, [id]);
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    // Procesar los datos del edificio
    const edificio = rows[0];
    
    // Parsear servicios y amenidades JSON
    if (edificio.servicios) {
      try {
        edificio.servicios = typeof edificio.servicios === 'string' 
          ? JSON.parse(edificio.servicios) 
          : edificio.servicios;
      } catch (e) {
        edificio.servicios = [];
      }
    } else {
      edificio.servicios = [];
    }
    
    if (edificio.amenidades) {
      try {
        edificio.amenidades = typeof edificio.amenidades === 'string' 
          ? JSON.parse(edificio.amenidades) 
          : edificio.amenidades;
      } catch (e) {
        edificio.amenidades = [];
      }
    } else {
      edificio.amenidades = [];
    }
    
    res.json(edificio);
  } catch (error) {
    console.error('Error fetching edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/torres:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener torres del edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Lista de torres del edificio
 */
// GET /edificios/:id/torres - Obtener torres del edificio
router.get('/:id/torres', authenticate, async (req, res) => {
  try {
    const edificioId = req.params.id;
    
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.edificio_id,
        t.nombre,
        t.codigo,
        t.created_at AS fecha_creacion,
        COUNT(u.id) AS total_unidades,
        SUM(CASE WHEN u.activa = 1 THEN 1 ELSE 0 END) AS unidades_ocupadas,
        SUM(CASE WHEN u.activa = 0 OR u.activa IS NULL THEN 1 ELSE 0 END) AS unidades_vacias,
        10 AS pisos,
        CASE 
          WHEN COUNT(u.id) > 0 THEN ROUND(COUNT(u.id) / 10)
          ELSE 0
        END AS unidades_por_piso,
        CASE 
          WHEN COUNT(u.id) = 0 THEN 'inactiva'
          WHEN COUNT(CASE WHEN u.activa = 1 THEN 1 END) = COUNT(u.id) THEN 'activa'
          WHEN COUNT(CASE WHEN u.activa = 1 THEN 1 END) = 0 THEN 'inactiva'
          ELSE 'mantenimiento'
        END AS estado,
        'Torre principal con vista al parque' AS observaciones
      FROM torre t
      LEFT JOIN unidad u ON t.id = u.torre_id
      WHERE t.edificio_id = ?
      GROUP BY t.id, t.edificio_id, t.nombre, t.codigo, t.created_at
      ORDER BY t.nombre
    `, [edificioId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching torres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/unidades:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener unidades del edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *       - in: query
 *         name: torreId
 *         schema:
 *           type: integer
 *         description: ID de la torre (opcional)
 *     responses:
 *       200:
 *         description: Lista de unidades del edificio
 */
// GET /edificios/:id/unidades - Obtener unidades del edificio
router.get('/:id/unidades', authenticate, async (req, res) => {
  try {
    const edificioId = req.params.id;
    const { torreId } = req.query;
    
    let query = `
      SELECT 
        u.id,
        u.edificio_id,
        u.torre_id,
        u.codigo AS numero,
        1 AS piso,
        'apartamento' AS tipo,
        CASE 
          WHEN u.activa = 1 THEN 'ocupada'
          ELSE 'vacia'
        END AS estado,
        u.m2_utiles AS area,
        2 AS habitaciones,
        2 AS banos,
        CASE WHEN u.m2_terrazas > 0 THEN 1 ELSE 0 END AS balcon,
        CASE WHEN u.nro_estacionamiento IS NOT NULL THEN 1 ELSE 0 END AS parqueadero,
        CASE WHEN u.nro_bodega IS NOT NULL THEN 1 ELSE 0 END AS deposito,
        u.nro_estacionamiento,
        u.nro_bodega,
        u.created_at AS fecha_creacion,
        t.nombre AS torre_nombre
      FROM unidad u
      LEFT JOIN torre t ON u.torre_id = t.id
      WHERE u.edificio_id = ?
    `;
    
    const params = [edificioId];
    
    if (torreId) {
      query += ` AND u.torre_id = ?`;
      params.push(torreId);
    }
    
    query += ` ORDER BY u.codigo`;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching unidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/amenidades:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener amenidades del edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Lista de amenidades disponibles
 */
// GET /edificios/:id/amenidades - Obtener amenidades del edificio
router.get('/:id/amenidades', authenticate, async (req, res) => {
  try {
    const edificioId = req.params.id;
    
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.nombre,
        a.capacidad,
        a.tarifa,
        a.reglas,
        a.requiere_aprobacion
      FROM amenidad a
      INNER JOIN edificio e ON a.comunidad_id = e.comunidad_id
      WHERE e.id = ?
      ORDER BY a.nombre
    `, [edificioId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching amenidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/servicios:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener lista de servicios disponibles
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
// GET /edificios/servicios - Obtener lista de servicios disponibles
router.get('/servicios', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 'agua' AS value, 'Agua Potable' AS label
      UNION ALL SELECT 'luz', 'Electricidad'
      UNION ALL SELECT 'gas', 'Gas Natural'
      UNION ALL SELECT 'internet', 'Internet'
      UNION ALL SELECT 'vigilancia', 'Vigilancia 24/7'
      UNION ALL SELECT 'ascensor', 'Ascensor'
      UNION ALL SELECT 'porteria', 'Portería'
      UNION ALL SELECT 'citofono', 'Citófono'
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/amenidades-disponibles:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener lista de amenidades disponibles
 *     responses:
 *       200:
 *         description: Lista de amenidades
 */
// GET /edificios/amenidades-disponibles - Obtener lista de amenidades disponibles
router.get('/amenidades-disponibles', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 'piscina' AS value, 'Piscina' AS label
      UNION ALL SELECT 'gimnasio', 'Gimnasio'
      UNION ALL SELECT 'salon_comunal', 'Salón Comunal'
      UNION ALL SELECT 'salon_eventos', 'Salón de Eventos'
      UNION ALL SELECT 'quincho', 'Quincho'
      UNION ALL SELECT 'multicancha', 'Multicancha'
      UNION ALL SELECT 'cancha_tenis', 'Cancha de Tenis'
      UNION ALL SELECT 'playground', 'Área de Juegos'
      UNION ALL SELECT 'terraza_bbq', 'Terraza BBQ'
      UNION ALL SELECT 'porteria', 'Portería'
      UNION ALL SELECT 'ascensor', 'Ascensor'
      UNION ALL SELECT 'citofono', 'Citófono'
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching amenidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// List edificios por comunidad (mantener compatibilidad)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(`
      SELECT 
        e.id, 
        e.nombre, 
        e.direccion, 
        e.codigo,
        COUNT(DISTINCT u.id) AS total_unidades,
        COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_ocupadas
      FROM edificio e
      LEFT JOIN unidad u ON e.id = u.edificio_id
      WHERE e.comunidad_id = ? 
      GROUP BY e.id, e.nombre, e.direccion, e.codigo
      ORDER BY e.nombre
      LIMIT 200
    `, [comunidadId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching edificios by comunidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios:
 *   post:
 *     tags: [Edificios]
 *     summary: Crear nuevo edificio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - comunidadId
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               comunidadId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Edificio creado exitosamente
 */
// POST /edificios - Crear nuevo edificio
router.post('/', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('direccion').notEmpty().withMessage('La dirección es requerida'),
  body('comunidadId').isInt().withMessage('ID de comunidad inválido'),
  body('codigo').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, direccion, codigo, comunidadId } = req.body;
    
    // Verificar que la comunidad existe
    const [comunidadCheck] = await db.query('SELECT id FROM comunidad WHERE id = ?', [comunidadId]);
    if (!comunidadCheck.length) {
      return res.status(400).json({ error: 'Comunidad no encontrada' });
    }
    
    // Verificar que el código no esté duplicado en la misma comunidad
    if (codigo) {
      const [codigoCheck] = await db.query('SELECT id FROM edificio WHERE codigo = ? AND comunidad_id = ?', [codigo, comunidadId]);
      if (codigoCheck.length) {
        return res.status(400).json({ error: 'El código ya existe en esta comunidad' });
      }
    }
    
    const [result] = await db.query(
      'INSERT INTO edificio (comunidad_id, nombre, direccion, codigo) VALUES (?, ?, ?, ?)',
      [comunidadId, nombre, direccion, codigo || null]
    );
    
    // Obtener el edificio recién creado con información completa
    const [edificio] = await db.query(`
      SELECT 
        e.id, 
        e.nombre, 
        e.direccion, 
        e.codigo,
        e.created_at AS fecha_creacion,
        c.razon_social AS comunidad_nombre
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      WHERE e.id = ?
    `, [result.insertId]);
    
    res.status(201).json(edificio[0]);
  } catch (error) {
    console.error('Error creating edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear edificio por comunidad (mantener compatibilidad)
router.post('/comunidad/:comunidadId', [
  authenticate, 
  requireCommunity('comunidadId', ['admin']), 
  body('nombre').notEmpty()
], async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { nombre, direccion, codigo } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO edificio (comunidad_id, nombre, direccion, codigo) VALUES (?, ?, ?, ?)', 
      [comunidadId, nombre, direccion || null, codigo || null]
    );
    
    const [row] = await db.query(
      'SELECT id, nombre, direccion, codigo FROM edificio WHERE id = ?', 
      [result.insertId]
    );
    
    res.status(201).json(row[0]);
  } catch (error) {
    console.error('Error creating edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}:
 *   patch:
 *     tags: [Edificios]
 *     summary: Actualizar edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Edificio actualizado exitosamente
 */
// PATCH /edificios/:id - Actualizar edificio
router.patch('/:id', [
  authenticate, 
  authorize('admin', 'superadmin'),
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('direccion').optional().notEmpty().withMessage('La dirección no puede estar vacía'),
  body('codigo').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id;
    const fields = ['nombre', 'direccion', 'codigo'];
    const updates = [];
    const values = [];
    
    // Verificar que el edificio existe
    const [existeEdificio] = await db.query('SELECT id, comunidad_id FROM edificio WHERE id = ?', [id]);
    if (!existeEdificio.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });
    
    if (!updates.length) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    // Verificar código duplicado si se está actualizando
    if (req.body.codigo) {
      const [codigoCheck] = await db.query(
        'SELECT id FROM edificio WHERE codigo = ? AND comunidad_id = ? AND id != ?', 
        [req.body.codigo, existeEdificio[0].comunidad_id, id]
      );
      if (codigoCheck.length) {
        return res.status(400).json({ error: 'El código ya existe en esta comunidad' });
      }
    }
    
    values.push(id);
    
    await db.query(`UPDATE edificio SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    
    // Obtener edificio actualizado
    const [rows] = await db.query(`
      SELECT 
        e.id, 
        e.nombre, 
        e.direccion, 
        e.codigo,
        e.updated_at AS fecha_actualizacion,
        c.razon_social AS comunidad_nombre
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      WHERE e.id = ?
    `, [id]);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}:
 *   put:
 *     tags: [Edificios]
 *     summary: Actualizar edificio completamente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               comunidadId:
 *                 type: integer
 *               anoConstructccion:
 *                 type: integer
 *               pisos:
 *                 type: integer
 *               administrador:
 *                 type: string
 *               telefonoAdministrador:
 *                 type: string
 *               emailAdministrador:
 *                 type: string
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenidades:
 *                 type: array
 *                 items:
 *                   type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               observaciones:
 *                 type: string
 *               areaComun:
 *                 type: number
 *               areaPrivada:
 *                 type: number
 *               parqueaderos:
 *                 type: integer
 *               depositos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Edificio actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Edificio no encontrado
 */
// PUT /edificios/:id - Actualizar edificio completamente
router.put('/:id', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }).withMessage('El nombre debe tener máximo 100 caracteres'),
  body('codigo').notEmpty().withMessage('El código es obligatorio').isLength({ max: 20 }).withMessage('El código debe tener máximo 20 caracteres'),
  body('direccion').notEmpty().withMessage('La dirección es obligatoria').isLength({ max: 255 }).withMessage('La dirección debe tener máximo 255 caracteres'),
  body('comunidadId').custom((value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      throw new Error('La comunidad es obligatoria y debe ser un ID válido');
    }
    return true;
  }),
  body('anoConstructccion').optional().isInt({ min: 1800, max: new Date().getFullYear() + 5 }).withMessage('Año de construcción inválido'),
  body('pisos').optional().isInt({ min: 1 }).withMessage('El número de pisos debe ser mayor a 0'),
  body('administrador').optional().isLength({ max: 100 }).withMessage('El nombre del administrador debe tener máximo 100 caracteres'),
  body('telefonoAdministrador').optional().matches(/^[0-9+\-\s()]*$/).withMessage('Teléfono inválido').isLength({ max: 20 }).withMessage('El teléfono debe tener máximo 20 caracteres'),
  body('emailAdministrador').optional().isEmail().withMessage('Email inválido').isLength({ max: 100 }).withMessage('El email debe tener máximo 100 caracteres'),
  body('servicios').optional().isArray().withMessage('Los servicios deben ser un array'),
  body('amenidades').optional().isArray().withMessage('Las amenidades deben ser un array'),
  body('latitud').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitud').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('observaciones').optional().isLength({ max: 1000 }).withMessage('Las observaciones deben tener máximo 1000 caracteres'),
  body('areaComun').optional().isFloat({ min: 0 }).withMessage('El área común debe ser mayor o igual a 0'),
  body('areaPrivada').optional().isFloat({ min: 0 }).withMessage('El área privada debe ser mayor o igual a 0'),
  body('parqueaderos').optional().isInt({ min: 0 }).withMessage('El número de parqueaderos debe ser mayor o igual a 0'),
  body('depositos').optional().isInt({ min: 0 }).withMessage('El número de depósitos debe ser mayor o igual a 0'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const id = req.params.id;
    const {
      nombre,
      codigo,
      direccion,
      comunidadId,
      anoConstructccion,
      pisos,
      administrador,
      telefonoAdministrador,
      emailAdministrador,
      servicios,
      amenidades,
      latitud,
      longitud,
      observaciones,
      areaComun,
      areaPrivada,
      parqueaderos,
      depositos
    } = req.body;

    // Verificar que el edificio existe
    const [existing] = await db.query('SELECT id FROM edificio WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }

    // Verificar que la comunidad existe
    const comunidadIdNumber = parseInt(comunidadId);
    const [comunidad] = await db.query('SELECT id FROM comunidad WHERE id = ?', [comunidadIdNumber]);
    if (comunidad.length === 0) {
      return res.status(400).json({ error: 'La comunidad especificada no existe' });
    }

    // Verificar que el código sea único (excluyendo el edificio actual)
    const [codeCheck] = await db.query('SELECT id FROM edificio WHERE codigo = ? AND id != ?', [codigo, id]);
    if (codeCheck.length > 0) {
      return res.status(400).json({ error: 'El código ya está en uso por otro edificio' });
    }

    // Preparar datos para actualización
    const updateData = {
      nombre,
      codigo,
      direccion,
      comunidad_id: comunidadIdNumber,
      ano_construccion: anoConstructccion || null,
      pisos: pisos || null,
      administrador: administrador || null,
      telefono_administrador: telefonoAdministrador || null,
      email_administrador: emailAdministrador || null,
      servicios: servicios && Array.isArray(servicios) ? JSON.stringify(servicios) : null,
      amenidades: amenidades && Array.isArray(amenidades) ? JSON.stringify(amenidades) : null,
      latitud: latitud || null,
      longitud: longitud || null,
      observaciones: observaciones || null,
      area_comun: areaComun || null,
      area_privada: areaPrivada || null,
      parqueaderos: parqueaderos || null,
      depositos: depositos || null,
      updated_at: new Date()
    };

    // Construir query de actualización dinámicamente
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id); // Para el WHERE

    await db.query(`UPDATE edificio SET ${fields} WHERE id = ?`, values);

    // Obtener el edificio actualizado con información de la comunidad
    const [updated] = await db.query(`
      SELECT 
        e.*,
        c.razon_social AS comunidad_nombre
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      WHERE e.id = ?
    `, [id]);

    // Formatear respuesta
    const edificioActualizado = {
      id: updated[0].id.toString(),
      nombre: updated[0].nombre,
      codigo: updated[0].codigo,
      direccion: updated[0].direccion,
      comunidadId: updated[0].comunidad_id?.toString(),
      comunidadNombre: updated[0].comunidad_nombre,
      fechaCreacion: updated[0].created_at,
      fechaActualizacion: updated[0].updated_at,
      anoConstructccion: updated[0].ano_construccion,
      pisos: updated[0].pisos,
      administrador: updated[0].administrador,
      telefonoAdministrador: updated[0].telefono_administrador,
      emailAdministrador: updated[0].email_administrador,
      servicios: updated[0].servicios ? (typeof updated[0].servicios === 'string' && updated[0].servicios.trim() !== '' ? JSON.parse(updated[0].servicios) : []) : [],
      amenidades: updated[0].amenidades ? (typeof updated[0].amenidades === 'string' && updated[0].amenidades.trim() !== '' ? JSON.parse(updated[0].amenidades) : []) : [],
      latitud: updated[0].latitud,
      longitud: updated[0].longitud,
      observaciones: updated[0].observaciones,
      areaComun: updated[0].area_comun,
      areaPrivada: updated[0].area_privada,
      parqueaderos: updated[0].parqueaderos,
      depositos: updated[0].depositos
    };

    res.json(edificioActualizado);
  } catch (error) {
    console.error('Error updating edificio:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El código ya está en uso' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

/**
 * @openapi
 * /edificios/{id}/check-dependencies:
 *   get:
 *     tags: [Edificios]
 *     summary: Verificar dependencias antes de eliminar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Información de dependencias
 */
// GET /edificios/:id/check-dependencies - Verificar dependencias antes de eliminar
router.get('/:id/check-dependencies', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const id = req.params.id;
    
    // Verificar unidades
    const [unidades] = await db.query(`
      SELECT 
        COUNT(*) AS total_unidades,
        COUNT(CASE WHEN activa = 1 THEN 1 END) AS unidades_activas,
        COUNT(CASE WHEN activa = 0 THEN 1 END) AS unidades_inactivas
      FROM unidad 
      WHERE edificio_id = ?
    `, [id]);
    
    // Verificar torres
    const [torres] = await db.query('SELECT COUNT(*) AS total_torres FROM torre WHERE edificio_id = ?', [id]);
    
    const dependencies = {
      total_unidades: unidades[0].total_unidades,
      unidades_activas: unidades[0].unidades_activas,
      unidades_inactivas: unidades[0].unidades_inactivas,
      total_torres: torres[0].total_torres,
      can_delete: unidades[0].total_unidades === 0 && torres[0].total_torres === 0,
      warnings: []
    };
    
    if (unidades[0].unidades_activas > 0) {
      dependencies.warnings.push(`El edificio tiene ${unidades[0].unidades_activas} unidades activas`);
    }
    
    if (torres[0].total_torres > 0) {
      dependencies.warnings.push(`El edificio tiene ${torres[0].total_torres} torres asociadas`);
    }
    
    res.json(dependencies);
  } catch (error) {
    console.error('Error checking dependencies:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}:
 *   delete:
 *     tags: [Edificios]
 *     summary: Eliminar edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       204:
 *         description: Edificio eliminado exitosamente
 *       400:
 *         description: No se puede eliminar debido a dependencias
 */
// DELETE /edificios/:id - Eliminar edificio
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const id = req.params.id;
    
    // Verificar que el edificio existe
    const [existeEdificio] = await db.query('SELECT id FROM edificio WHERE id = ?', [id]);
    if (!existeEdificio.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    // Verificar dependencias
    const [unidades] = await db.query('SELECT COUNT(*) AS total FROM unidad WHERE edificio_id = ?', [id]);
    const [torres] = await db.query('SELECT COUNT(*) AS total FROM torre WHERE edificio_id = ?', [id]);
    
    if (unidades[0].total > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el edificio porque tiene unidades asociadas',
        details: { unidades: unidades[0].total }
      });
    }
    
    if (torres[0].total > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el edificio porque tiene torres asociadas',
        details: { torres: torres[0].total }
      });
    }
    
    await db.query('DELETE FROM edificio WHERE id = ?', [id]);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting edificio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/torres:
 *   post:
 *     tags: [Edificios]
 *     summary: Crear nueva torre en el edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - pisos
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               pisos:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Torre creada exitosamente
 */
// POST /edificios/:id/torres - Crear nueva torre
router.post('/:id/torres', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('pisos').isInt({ min: 1 }).withMessage('Los pisos deben ser un número entero mayor a 0'),
  body('codigo').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const edificioId = req.params.id;
    const { nombre, codigo, pisos, observaciones } = req.body;
    
    // Verificar que el edificio existe
    const [edificioCheck] = await db.query('SELECT id FROM edificio WHERE id = ?', [edificioId]);
    if (!edificioCheck.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    // Verificar código único si se proporciona
    if (codigo) {
      const [codigoCheck] = await db.query('SELECT id FROM torre WHERE codigo = ? AND edificio_id = ?', [codigo, edificioId]);
      if (codigoCheck.length) {
        return res.status(400).json({ error: 'El código ya existe en este edificio' });
      }
    }
    
    const [result] = await db.query(
      'INSERT INTO torre (edificio_id, nombre, codigo, pisos, observaciones) VALUES (?, ?, ?, ?, ?)',
      [edificioId, nombre, codigo || null, pisos, observaciones || null]
    );
    
    // Obtener la torre recién creada
    const [torre] = await db.query(`
      SELECT 
        t.id,
        t.edificio_id,
        t.nombre,
        t.codigo,
        t.pisos,
        t.created_at AS fecha_creacion,
        t.observaciones,
        COUNT(u.id) AS total_unidades,
        COUNT(CASE WHEN u.activa = 1 THEN 1 END) AS unidades_ocupadas,
        'activa' AS estado
      FROM torre t
      LEFT JOIN unidad u ON t.id = u.torre_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [result.insertId]);
    
    res.status(201).json(torre[0]);
  } catch (error) {
    console.error('Error creating torre:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/unidades:
 *   post:
 *     tags: [Edificios]
 *     summary: Crear nueva unidad en el edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - m2_utiles
 *             properties:
 *               codigo:
 *                 type: string
 *               torre_id:
 *                 type: integer
 *               m2_utiles:
 *                 type: number
 *               m2_terrazas:
 *                 type: number
 *               nro_estacionamiento:
 *                 type: string
 *               nro_bodega:
 *                 type: string
 *               activa:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Unidad creada exitosamente
 */
// POST /edificios/:id/unidades - Crear nueva unidad
router.post('/:id/unidades', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('codigo').notEmpty().withMessage('El código es requerido'),
  body('m2_utiles').isFloat({ min: 0 }).withMessage('Los m2 útiles deben ser un número positivo'),
  body('torre_id').optional().isInt(),
  body('m2_terrazas').optional().isFloat({ min: 0 }),
  body('nro_estacionamiento').optional().isString(),
  body('nro_bodega').optional().isString(),
  body('activa').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const edificioId = req.params.id;
    const { codigo, torre_id, m2_utiles, m2_terrazas, nro_estacionamiento, nro_bodega, activa } = req.body;
    
    // Verificar que el edificio existe
    const [edificioCheck] = await db.query('SELECT id FROM edificio WHERE id = ?', [edificioId]);
    if (!edificioCheck.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    // Verificar torre si se proporciona
    if (torre_id) {
      const [torreCheck] = await db.query('SELECT id FROM torre WHERE id = ? AND edificio_id = ?', [torre_id, edificioId]);
      if (!torreCheck.length) {
        return res.status(400).json({ error: 'Torre no encontrada en este edificio' });
      }
    }
    
    // Verificar código único en el edificio
    const [codigoCheck] = await db.query('SELECT id FROM unidad WHERE codigo = ? AND edificio_id = ?', [codigo, edificioId]);
    if (codigoCheck.length) {
      return res.status(400).json({ error: 'El código ya existe en este edificio' });
    }
    
    const [result] = await db.query(
      `INSERT INTO unidad (edificio_id, torre_id, codigo, m2_utiles, m2_terrazas, nro_estacionamiento, nro_bodega, activa) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        edificioId, 
        torre_id || null, 
        codigo, 
        m2_utiles, 
        m2_terrazas || 0, 
        nro_estacionamiento || null, 
        nro_bodega || null, 
        activa !== undefined ? activa : true
      ]
    );
    
    // Obtener la unidad recién creada
    const [unidad] = await db.query(`
      SELECT 
        u.id,
        u.edificio_id,
        u.torre_id,
        u.codigo AS numero,
        u.m2_utiles AS area,
        u.m2_terrazas,
        u.nro_estacionamiento,
        u.nro_bodega,
        u.activa,
        u.created_at AS fecha_creacion,
        t.nombre AS torre_nombre,
        CASE WHEN u.activa = 1 THEN 'ocupada' ELSE 'vacia' END AS estado
      FROM unidad u
      LEFT JOIN torre t ON u.torre_id = t.id
      WHERE u.id = ?
    `, [result.insertId]);
    
    res.status(201).json(unidad[0]);
  } catch (error) {
    console.error('Error creating unidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/filtros-opciones:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener opciones para filtros del edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Opciones de filtros disponibles
 */
// GET /edificios/:id/filtros-opciones - Obtener opciones para filtros
router.get('/:id/filtros-opciones', authenticate, async (req, res) => {
  try {
    const edificioId = req.params.id;
    
    // Obtener torres del edificio
    const [torres] = await db.query(`
      SELECT id AS value, nombre AS label 
      FROM torre 
      WHERE edificio_id = ? 
      ORDER BY nombre
    `, [edificioId]);
    
    // Opciones fijas
    const estados = [
      { value: 'ocupada', label: 'Ocupada' },
      { value: 'vacia', label: 'Vacía' },
      { value: 'mantenimiento', label: 'Mantenimiento' }
    ];
    
    const tipos = [
      { value: 'apartamento', label: 'Apartamento' },
      { value: 'casa', label: 'Casa' },
      { value: 'local', label: 'Local' },
      { value: 'oficina', label: 'Oficina' },
      { value: 'deposito', label: 'Depósito' },
      { value: 'parqueadero', label: 'Parqueadero' }
    ];
    
    res.json({
      torres,
      estados,
      tipos
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/resumen:
 *   get:
 *     tags: [Edificios]
 *     summary: Obtener resumen completo del edificio
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Resumen completo del edificio
 */
// GET /edificios/:id/resumen - Obtener resumen completo
router.get('/:id/resumen', authenticate, async (req, res) => {
  try {
    const edificioId = req.params.id;
    
    // Información básica del edificio
    const [edificio] = await db.query(`
      SELECT 
        e.*,
        c.razon_social AS comunidad_nombre,
        c.direccion AS comunidad_direccion
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      WHERE e.id = ?
    `, [edificioId]);
    
    if (!edificio.length) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }
    
    // Estadísticas de torres
    const [torresStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_torres,
        COUNT(CASE WHEN (
          SELECT COUNT(*) FROM unidad WHERE torre_id = t.id AND activa = 1
        ) > 0 THEN 1 END) AS torres_activas
      FROM torre t
      WHERE t.edificio_id = ?
    `, [edificioId]);
    
    // Estadísticas de unidades
    const [unidadesStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_unidades,
        COUNT(CASE WHEN activa = 1 THEN 1 END) AS unidades_ocupadas,
        COUNT(CASE WHEN activa = 0 THEN 1 END) AS unidades_vacias,
        AVG(m2_utiles) AS promedio_m2,
        COUNT(CASE WHEN nro_estacionamiento IS NOT NULL THEN 1 END) AS con_parqueadero,
        COUNT(CASE WHEN nro_bodega IS NOT NULL THEN 1 END) AS con_deposito
      FROM unidad
      WHERE edificio_id = ?
    `, [edificioId]);
    
    const resumen = {
      edificio: edificio[0],
      estadisticas: {
        torres: torresStats[0],
        unidades: unidadesStats[0],
        ocupacion: unidadesStats[0].total_unidades > 0 
          ? (unidadesStats[0].unidades_ocupadas / unidadesStats[0].total_unidades * 100).toFixed(1)
          : 0
      }
    };
    
    res.json(resumen);
  } catch (error) {
    console.error('Error fetching resumen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/buscar:
 *   get:
 *     tags: [Edificios]
 *     summary: Búsqueda rápida de edificios
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
// GET /edificios/buscar - Búsqueda rápida
router.get('/buscar', [
  authenticate,
  query('q').notEmpty().withMessage('El término de búsqueda es requerido'),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const searchTerm = req.query.q;
    const limit = parseInt(req.query.limit) || 10;
    
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.nombre,
        e.codigo,
        e.direccion,
        c.razon_social AS comunidad_nombre,
        COUNT(DISTINCT u.id) AS total_unidades
      FROM edificio e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      LEFT JOIN unidad u ON e.id = u.edificio_id
      WHERE (
        e.nombre LIKE ? OR
        e.codigo LIKE ? OR
        e.direccion LIKE ? OR
        c.razon_social LIKE ?
      )
      GROUP BY e.id
      ORDER BY e.nombre
      LIMIT ?
    `, [
      `%${searchTerm}%`,
      `%${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`,
      limit
    ]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching edificios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /edificios/{id}/validar-codigo:
 *   get:
 *     tags: [Edificios]
 *     summary: Validar si un código está disponible
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *       - in: query
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código a validar
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [edificio, torre, unidad]
 *         description: Tipo de entidad
 *     responses:
 *       200:
 *         description: Resultado de la validación
 */
// GET /edificios/:id/validar-codigo - Validar disponibilidad de código
router.get('/:id/validar-codigo', [
  authenticate,
  query('codigo').notEmpty().withMessage('El código es requerido'),
  query('tipo').isIn(['edificio', 'torre', 'unidad']).withMessage('Tipo inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const edificioId = req.params.id;
    const { codigo, tipo } = req.query;
    
    let query_sql = '';
    let params = [];
    
    switch (tipo) {
      case 'edificio':
        query_sql = 'SELECT id FROM edificio WHERE codigo = ? AND id != ?';
        params = [codigo, edificioId];
        break;
      case 'torre':
        query_sql = 'SELECT id FROM torre WHERE codigo = ? AND edificio_id = ?';
        params = [codigo, edificioId];
        break;
      case 'unidad':
        query_sql = 'SELECT id FROM unidad WHERE codigo = ? AND edificio_id = ?';
        params = [codigo, edificioId];
        break;
    }
    
    const [rows] = await db.query(query_sql, params);
    
    res.json({
      disponible: rows.length === 0,
      codigo,
      tipo
    });
  } catch (error) {
    console.error('Error validating codigo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;