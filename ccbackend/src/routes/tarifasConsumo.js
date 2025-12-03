const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Tarifas Consumo
 *     description: Gestión de tarifas de consumo (agua, gas, electricidad)
 */

// =========================================
// 1. LISTADOS BÁSICOS CON FILTROS
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/comunidad/{comunidadId}:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Listar tarifas con filtros avanzados
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: tipo
 *         in: query
 *         schema:
 *           type: string
 *           enum: [agua, gas, electricidad]
 *       - name: periodo_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: periodo_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        tipo,
        periodo_desde,
        periodo_hasta,
        limit = 100,
        offset = 0,
      } = req.query;

      let query = `
      SELECT
        t.id,
        c.razon_social AS comunidad_nombre,
        t.tipo AS servicio,
        t.precio_por_unidad,
        t.cargo_fijo,
        t.periodo_desde AS fecha_vigencia,
        t.periodo_hasta,
        CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre,
        'Activa' AS estado,
        t.created_at,
        t.updated_at
      FROM tarifa_consumo t
      LEFT JOIN comunidad c ON t.comunidad_id = c.id
      WHERE t.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (tipo) {
        query += ` AND t.tipo = ?`;
        params.push(tipo);
      }

      if (periodo_desde) {
        query += ` AND t.periodo_desde >= ?`;
        params.push(periodo_desde);
      }

      if (periodo_hasta) {
        query += ` AND t.periodo_desde <= ?`;
        params.push(periodo_hasta);
      }

      query += ` ORDER BY t.periodo_desde DESC, t.tipo ASC LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al listar tarifas:', error);
      res.status(500).json({ error: 'Error al listar tarifas' });
    }
  }
);

/**
 * @swagger
 * /api/tarifas-consumo/comunidad/{comunidadId}/por-tipo:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Listado de tarifas agrupadas por tipo
 */
router.get(
  '/comunidad/:comunidadId/por-tipo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        c.razon_social AS comunidad,
        t.tipo AS servicio,
        COUNT(t.id) AS total_tarifas,
        AVG(t.precio_por_unidad) AS precio_unitario_promedio,
        AVG(t.cargo_fijo) AS cargo_fijo_promedio
      FROM comunidad c
      LEFT JOIN tarifa_consumo t ON c.id = t.comunidad_id
      WHERE c.id = ?
      GROUP BY c.id, c.razon_social, t.tipo
      ORDER BY t.tipo
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al agrupar tarifas por tipo:', error);
      res.status(500).json({ error: 'Error al agrupar tarifas por tipo' });
    }
  }
);

// =========================================
// 2. VISTAS DETALLADAS
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/{id}:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Vista detallada de una tarifa específica
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const query = `
      SELECT
        t.id,
        c.razon_social AS comunidad_nombre,
        t.tipo AS servicio,
        t.precio_por_unidad,
        t.cargo_fijo,
        t.periodo_desde,
        t.periodo_hasta,
        t.created_at,
        t.updated_at,
        CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre,
        'Fija/Unitaria' AS tipo_estructura,
        'Activa' AS estado,
        'unidad' AS unidad,
        JSON_OBJECT(
          'tipo', 'Fija/Unitaria',
          'precio_unitario', t.precio_por_unidad,
          'cargo_fijo', t.cargo_fijo,
          'periodo_desde', t.periodo_desde,
          'periodo_hasta', t.periodo_hasta
        ) AS estructura_json
      FROM tarifa_consumo t
      LEFT JOIN comunidad c ON t.comunidad_id = c.id
      WHERE t.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Tarifa no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener tarifa:', error);
    res.status(500).json({ error: 'Error al obtener tarifa' });
  }
});

/**
 * @swagger
 * /api/tarifas-consumo/todas/con-estructura:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Todas las tarifas con estructura completa
 */
router.get('/todas/con-estructura', authenticate, async (req, res) => {
  try {
    const { comunidad_id } = req.query;
    
    let where = ' WHERE 1=1 ';
    const params = [];
    
    // Determinar comunidades permitidas para el usuario
    let allowedComunidadIds = [];

    if (req.user?.is_superadmin) {
      // SuperAdmin: si se pide comunidad_id específica, usar esa; sino, todas
      if (comunidad_id) {
        allowedComunidadIds = [Number(comunidad_id)];
      }
    } else {
      // Usuario normal: obtener sus comunidades asignadas
      const personaId = req.user?.persona_id;
      console.log('🔍 Tarifas - Resolviendo comunidades para persona_id=', personaId);

      try {
        const [r] = await db.query(
          `SELECT comunidad_id FROM usuario_miembro_comunidad 
           WHERE persona_id = ? AND activo = 1 AND (hasta IS NULL OR hasta > CURDATE())`,
          [personaId]
        );
        allowedComunidadIds = (r || []).map((row) => row.comunidad_id).filter(Boolean);
      } catch (err) {
        console.error('❌ Error leyendo comunidades:', err);
      }

      if (!allowedComunidadIds.length) {
        return res.json([]);
      }

      // Si se pide comunidad_id específica, validar que esté en las permitidas
      if (comunidad_id) {
        const requestedId = Number(comunidad_id);
        if (allowedComunidadIds.includes(requestedId)) {
          allowedComunidadIds = [requestedId];
        } else {
          return res.json([]);
        }
      }
    }

    // Aplicar filtro de comunidades si corresponde
    if (allowedComunidadIds.length > 0) {
      where += ` AND t.comunidad_id IN (${allowedComunidadIds.map(() => '?').join(',')}) `;
      params.push(...allowedComunidadIds);
    }

    const query = `
      SELECT
        t.id,
        c.razon_social AS comunidad_nombre,
        t.tipo AS servicio,
        'Activa' AS estado,
        t.periodo_desde AS fecha_vigencia,
        JSON_OBJECT(
          'tipo', 'Fija/Unitaria',
          'precio_unitario', t.precio_por_unidad,
          'cargo_fijo', t.cargo_fijo,
          'unidad', 'unidad'
        ) AS estructura_completa
      FROM tarifa_consumo t
      LEFT JOIN comunidad c ON t.comunidad_id = c.id
      ${where}
      ORDER BY c.razon_social, t.periodo_desde DESC
    `;

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tarifas con estructura:', error);
    res.status(500).json({ error: 'Error al obtener tarifas con estructura' });
  }
});

// =========================================
// 3. ESTADÍSTICAS
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/estadisticas/generales:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Estadísticas generales de tarifas
 */
router.get('/estadisticas/generales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_tarifas,
        COUNT(CASE WHEN t.tipo = 'agua' THEN 1 END) AS tarifas_agua,
        COUNT(CASE WHEN t.tipo = 'gas' THEN 1 END) AS tarifas_gas,
        COUNT(CASE WHEN t.tipo = 'electricidad' THEN 1 END) AS tarifas_electricidad,
        COUNT(DISTINCT comunidad_id) AS comunidades_cubiertas,
        AVG(t.precio_por_unidad) AS precio_unitario_promedio,
        AVG(t.cargo_fijo) AS cargo_fijo_promedio,
        MIN(t.periodo_desde) AS fecha_mas_antigua,
        MAX(t.periodo_desde) AS fecha_mas_reciente
      FROM tarifa_consumo t
    `;

    const [[stats]] = await db.query(query);

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

/**
 * @swagger
 * /api/tarifas-consumo/estadisticas/por-servicio:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Estadísticas por tipo de servicio
 */
router.get('/estadisticas/por-servicio', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        t.tipo AS servicio,
        COUNT(t.id) AS total_tarifas,
        COUNT(DISTINCT t.comunidad_id) AS comunidades_cubiertas,
        AVG(t.precio_por_unidad) AS precio_unitario_promedio,
        AVG(t.cargo_fijo) AS cargo_fijo_promedio,
        MAX(t.periodo_desde) AS ultima_actualizacion
      FROM tarifa_consumo t
      GROUP BY t.tipo
      ORDER BY t.tipo
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por servicio:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener estadísticas por servicio' });
  }
});

/**
 * @swagger
 * /api/tarifas-consumo/estadisticas/precios:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Estadísticas de precios unitarios y cargos fijos
 */
router.get('/estadisticas/precios', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        'precio_unitario' AS tipo,
        COUNT(*) AS total,
        AVG(precio_por_unidad) AS precio_promedio,
        MIN(precio_por_unidad) AS precio_minimo,
        MAX(precio_por_unidad) AS precio_maximo
      FROM tarifa_consumo
      UNION ALL
      SELECT
        'cargo_fijo' AS tipo,
        COUNT(*) AS total,
        AVG(cargo_fijo) AS precio_promedio,
        MIN(cargo_fijo) AS precio_minimo,
        MAX(cargo_fijo) AS precio_maximo
      FROM tarifa_consumo
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas de precios:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de precios' });
  }
});

// =========================================
// 4. BÚSQUEDAS AVANZADAS
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/busqueda/avanzada:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Búsqueda avanzada de tarifas
 *     parameters:
 *       - name: busqueda
 *         in: query
 *         schema:
 *           type: string
 *       - name: tipo
 *         in: query
 *         schema:
 *           type: string
 *       - name: periodo_desde
 *         in: query
 *         schema:
 *           type: string
 *       - name: periodo_hasta
 *         in: query
 *         schema:
 *           type: string
 *       - name: precio_min
 *         in: query
 *         schema:
 *           type: number
 *       - name: precio_max
 *         in: query
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 */
router.get('/busqueda/avanzada', authenticate, async (req, res) => {
  try {
    const {
      busqueda,
      tipo,
      periodo_desde,
      periodo_hasta,
      precio_min,
      precio_max,
      limit = 100,
      offset = 0,
    } = req.query;

    let query = `
      SELECT
        t.id,
        CONCAT(UPPER(t.tipo), ' (', t.periodo_desde, ')') AS nombre,
        t.tipo AS servicio,
        'Activa' AS estado,
        t.precio_por_unidad,
        t.cargo_fijo,
        t.periodo_desde AS fecha_vigencia,
        CONCAT('Precio Unitario: $', FORMAT(t.precio_por_unidad, 4), ' + Cargo Fijo: $', FORMAT(t.cargo_fijo, 2)) AS descripcion_estructura
      FROM tarifa_consumo t
      WHERE 1=1
    `;

    const params = [];

    if (busqueda) {
      query += ` AND t.tipo LIKE ?`;
      params.push(`%${busqueda}%`);
    }

    if (tipo) {
      query += ` AND t.tipo = ?`;
      params.push(tipo);
    }

    if (periodo_desde) {
      query += ` AND t.periodo_desde >= ?`;
      params.push(periodo_desde);
    }

    if (periodo_hasta) {
      query += ` AND t.periodo_desde <= ?`;
      params.push(periodo_hasta);
    }

    if (precio_min) {
      query += ` AND t.precio_por_unidad >= ?`;
      params.push(Number(precio_min));
    }

    if (precio_max) {
      query += ` AND t.precio_por_unidad <= ?`;
      params.push(Number(precio_max));
    }

    query += ` ORDER BY t.periodo_desde DESC, t.tipo ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({ error: 'Error en búsqueda avanzada' });
  }
});

/**
 * @swagger
 * /api/tarifas-consumo/busqueda/por-rango-precio:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Tarifas agrupadas por rango de precio
 */
router.get('/busqueda/por-rango-precio', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        CASE
          WHEN precio_por_unidad < 0.70 THEN 'Bajo (< $0.70)'
          WHEN precio_por_unidad < 1.10 THEN 'Medio ($0.70-$1.09)'
          ELSE 'Alto (≥ $1.10)'
        END AS rango_precio,
        COUNT(*) AS cantidad_tarifas,
        AVG(precio_por_unidad) AS precio_promedio,
        MIN(precio_por_unidad) AS precio_minimo,
        MAX(precio_por_unidad) AS precio_maximo
      FROM tarifa_consumo
      GROUP BY rango_precio
      ORDER BY precio_minimo
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener rangos de precio:', error);
    res.status(500).json({ error: 'Error al obtener rangos de precio' });
  }
});

// =========================================
// 5. EXPORTACIÓN
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/export/completo:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Exportación completa de tarifas para Excel/CSV
 */
router.get(
  '/export/completo',
  authenticate,
  authorize('admin', 'superadmin', 'contador'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        t.id AS 'ID',
        c.razon_social AS 'Comunidad',
        t.tipo AS 'Tipo Servicio',
        'Activa' AS 'Estado',
        t.precio_por_unidad AS 'Precio Unitario',
        t.cargo_fijo AS 'Cargo Fijo',
        t.periodo_desde AS 'Período Desde',
        COALESCE(t.periodo_hasta, 'Actual') AS 'Período Hasta',
        DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización',
        CONCAT('Precio: $', FORMAT(t.precio_por_unidad, 4), ' + Cargo Fijo: $', FORMAT(t.cargo_fijo, 2)) AS 'Estructura Detallada'
      FROM tarifa_consumo t
      LEFT JOIN comunidad c ON t.comunidad_id = c.id
      ORDER BY c.razon_social, t.periodo_desde DESC
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al exportar tarifas:', error);
      res.status(500).json({ error: 'Error al exportar tarifas' });
    }
  }
);

/**
 * @swagger
 * /api/tarifas-consumo/export/por-servicio:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Exportación de precios por servicio y período
 */
router.get(
  '/export/por-servicio',
  authenticate,
  authorize('admin', 'superadmin', 'contador'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        c.razon_social AS 'Comunidad',
        t.tipo AS 'Servicio',
        t.periodo_desde AS 'Período',
        t.precio_por_unidad AS 'Precio Unitario',
        t.cargo_fijo AS 'Cargo Fijo'
      FROM tarifa_consumo t
      LEFT JOIN comunidad c ON t.comunidad_id = c.id
      ORDER BY t.tipo, t.periodo_desde DESC
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al exportar por servicio:', error);
      res.status(500).json({ error: 'Error al exportar por servicio' });
    }
  }
);

// =========================================
// 6. VALIDACIONES
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/validacion/integridad:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Validar integridad de tarifas
 */
router.get(
  '/validacion/integridad',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        'Tarifas sin comunidad' AS validacion,
        COUNT(*) AS cantidad
      FROM tarifa_consumo t
      LEFT JOIN comunidad c ON t.comunidad_id = c.id
      WHERE c.id IS NULL
      UNION ALL
      SELECT
        'Precios unitarios negativos o cero' AS validacion,
        COUNT(*) AS cantidad
      FROM tarifa_consumo
      WHERE precio_por_unidad <= 0
      UNION ALL
      SELECT
        'Cargos fijos negativos' AS validacion,
        COUNT(*) AS cantidad
      FROM tarifa_consumo
      WHERE cargo_fijo < 0
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al validar integridad:', error);
      res.status(500).json({ error: 'Error al validar integridad' });
    }
  }
);

/**
 * @swagger
 * /api/tarifas-consumo/validacion/solapamiento:
 *   get:
 *     tags: [Tarifas de Consumo]
 *     summary: Validar solapamiento de períodos por comunidad y tipo
 */
router.get(
  '/validacion/solapamiento',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        t1.comunidad_id,
        c.razon_social AS comunidad,
        t1.tipo,
        t1.periodo_desde AS periodo1_inicio,
        COALESCE(t1.periodo_hasta, 'N/A') AS periodo1_fin,
        t2.periodo_desde AS periodo2_inicio,
        COALESCE(t2.periodo_hasta, 'N/A') AS periodo2_fin,
        'Solapamiento/Inconsistencia de períodos' AS problema
      FROM tarifa_consumo t1
      JOIN tarifa_consumo t2 ON t1.comunidad_id = t2.comunidad_id
        AND t1.tipo = t2.tipo
        AND t1.id < t2.id
      LEFT JOIN comunidad c ON t1.comunidad_id = c.id
      WHERE t1.periodo_desde < COALESCE(t2.periodo_hasta, t1.periodo_desde)
      ORDER BY t1.comunidad_id, t1.tipo, t1.periodo_desde
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al validar solapamiento:', error);
      res.status(500).json({ error: 'Error al validar solapamiento' });
    }
  }
);

// =========================================
// 7. CRUD BÁSICO
// =========================================

/**
 * @swagger
 * /api/tarifas-consumo/comunidad/{comunidadId}:
 *   post:
 *     tags: [Tarifas de Consumo]
 *     summary: Crear nueva tarifa de consumo
 *     description: BLOQUEADO para residente, propietario, inquilino
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'administrador', 'tesorero', 'presidente_comite', 'contador'),
    body('tipo').notEmpty().isIn(['agua', 'gas', 'electricidad']),
    body('periodo_desde').notEmpty(),
    body('precio_por_unidad').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        tipo,
        periodo_desde,
        periodo_hasta,
        precio_por_unidad,
        cargo_fijo,
      } = req.body;

      const [result] = await db.query(
        'INSERT INTO tarifa_consumo (comunidad_id, tipo, periodo_desde, periodo_hasta, precio_por_unidad, cargo_fijo) VALUES (?,?,?,?,?,?)',
        [
          comunidadId,
          tipo,
          periodo_desde.substring(0, 7), // Trunca a 'YYYY-MM' para evitar 'Data too long'
          periodo_hasta ? periodo_hasta.substring(0, 7) : null,
          precio_por_unidad,
          cargo_fijo || 0,
        ]
      );

      const [row] = await db.query(
        'SELECT id, tipo, periodo_desde, precio_por_unidad FROM tarifa_consumo WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (error) {
      console.error('Error al crear tarifa:', error);
      res.status(500).json({ error: 'Error al crear tarifa' });
    }
  }
);

/**
 * @swagger
 * /api/tarifas-consumo/{id}:
 *   patch:
 *     tags: [Tarifas de Consumo]
 *     summary: Actualizar tarifa
 *     description: BLOQUEADO para residente, propietario, inquilino
 */
router.patch(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin_comunidad', 'administrador', 'tesorero', 'presidente_comite', 'contador'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const fields = [
        'tipo',
        'periodo_desde',
        'periodo_hasta',
        'precio_por_unidad',
        'cargo_fijo',
      ];
      const updates = [];
      const values = [];

      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(req.body[f]);
        }
      });

      if (!updates.length) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      await db.query(
        `UPDATE tarifa_consumo SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const [rows] = await db.query(
        'SELECT id, tipo, periodo_desde, precio_por_unidad FROM tarifa_consumo WHERE id = ? LIMIT 1',
        [id]
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Error al actualizar tarifa:', error);
      res.status(500).json({ error: 'Error al actualizar tarifa' });
    }
  }
);

/**
 * @swagger
 * /api/tarifas-consumo/{id}:
 *   delete:
 *     tags: [Tarifas de Consumo]
 *     summary: Eliminar tarifa
 *     description: BLOQUEADO para residente, propietario, inquilino, contador
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin_comunidad', 'administrador'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.query('DELETE FROM tarifa_consumo WHERE id = ?', [id]);

      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar tarifa:', error);
      res.status(500).json({ error: 'Error al eliminar tarifa' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE TARIFAS DE CONSUMO
// =========================================

// // 1. LISTADOS BÁSICOS CON FILTROS
// GET: /tarifas-consumo/comunidad/:comunidadId
// GET: /tarifas-consumo/comunidad/:comunidadId/por-tipo

// // 2. VISTAS DETALLADAS
// GET: /tarifas-consumo/:id
// GET: /tarifas-consumo/todas/con-estructura

// // 3. ESTADÍSTICAS
// GET: /tarifas-consumo/estadisticas/generales
// GET: /tarifas-consumo/estadisticas/por-servicio
// GET: /tarifas-consumo/estadisticas/precios

// // 4. BÚSQUEDAS AVANZADAS
// GET: /tarifas-consumo/busqueda/avanzada
// GET: /tarifas-consumo/busqueda/por-rango-precio

// // 5. EXPORTACIÓN
// GET: /tarifas-consumo/export/completo
// GET: /tarifas-consumo/export/por-servicio

// // 6. VALIDACIONES
// GET: /tarifas-consumo/validacion/integridad
// GET: /tarifas-consumo/validacion/solapamiento

// // 7. CRUD BÁSICO
// POST: /tarifas-consumo/comunidad/:comunidadId
// PATCH: /tarifas-consumo/:id
// DELETE: /tarifas-consumo/:id
