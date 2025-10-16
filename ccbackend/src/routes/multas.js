const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @openapi
 * tags:
 *   - name: Multas
 *     description: Gestión de multas y sanciones
 */

// =========================================
// 1. LISTADOS Y FILTROS
// =========================================

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}:
 *   get:
 *     tags: [Multas]
 *     summary: Listar multas con filtros avanzados
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pendiente, pagada, anulada]
 *       - name: prioridad
 *         in: query
 *         schema:
 *           type: string
 *           enum: [alta, media, baja]
 *       - name: tipo_infraccion
 *         in: query
 *         schema:
 *           type: string
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: monto_min
 *         in: query
 *         schema:
 *           type: number
 *       - name: monto_max
 *         in: query
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { 
      estado, 
      prioridad, 
      tipo_infraccion, 
      fecha_desde, 
      fecha_hasta, 
      monto_min, 
      monto_max,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        m.id,
        m.id AS numero,
        c.razon_social AS comunidad,
        u.codigo AS unidad_codigo,
        COALESCE(t.nombre, '') AS torre,
        COALESCE(e.nombre, '') AS edificio,
        COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS propietario,
        m.motivo AS tipo_infraccion,
        m.monto,
        m.estado,
        m.prioridad,
        m.fecha AS fecha_infraccion,
        m.fecha AS fecha_vencimiento,
        m.fecha_pago,
        m.created_at,
        m.updated_at,
        CASE
          WHEN m.estado IN ('pagada', 'anulada') THEN NULL
          WHEN CURDATE() > m.fecha THEN DATEDIFF(CURDATE(), m.fecha)
          ELSE DATEDIFF(m.fecha, CURDATE())
        END AS dias_vencimiento,
        CASE
          WHEN m.estado IN ('pagada', 'anulada') THEN 'finalizado'
          WHEN CURDATE() > m.fecha THEN 'vencido'
          WHEN DATEDIFF(m.fecha, CURDATE()) <= 7 THEN 'proximo_vencer'
          ELSE 'vigente'
        END AS estado_vencimiento
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN torre t ON u.torre_id = t.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN persona p ON m.persona_id = p.id
      WHERE m.comunidad_id = ?
    `;

    const params = [comunidadId];

    if (estado) {
      query += ` AND m.estado = ?`;
      params.push(estado);
    }

    if (prioridad) {
      query += ` AND m.prioridad = ?`;
      params.push(prioridad);
    }

    if (tipo_infraccion) {
      query += ` AND m.motivo LIKE ?`;
      params.push(`%${tipo_infraccion}%`);
    }

    if (fecha_desde) {
      query += ` AND m.fecha >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND m.fecha <= ?`;
      params.push(fecha_hasta);
    }

    if (monto_min) {
      query += ` AND m.monto >= ?`;
      params.push(Number(monto_min));
    }

    if (monto_max) {
      query += ` AND m.monto <= ?`;
      params.push(Number(monto_max));
    }

    query += ` ORDER BY m.fecha DESC, m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    // Contar total
    let countQuery = `SELECT COUNT(*) AS total FROM multa m WHERE m.comunidad_id = ?`;
    const countParams = [comunidadId];

    if (estado) {
      countQuery += ` AND m.estado = ?`;
      countParams.push(estado);
    }
    if (prioridad) {
      countQuery += ` AND m.prioridad = ?`;
      countParams.push(prioridad);
    }
    if (tipo_infraccion) {
      countQuery += ` AND m.motivo LIKE ?`;
      countParams.push(`%${tipo_infraccion}%`);
    }
    if (fecha_desde) {
      countQuery += ` AND m.fecha >= ?`;
      countParams.push(fecha_desde);
    }
    if (fecha_hasta) {
      countQuery += ` AND m.fecha <= ?`;
      countParams.push(fecha_hasta);
    }
    if (monto_min) {
      countQuery += ` AND m.monto >= ?`;
      countParams.push(Number(monto_min));
    }
    if (monto_max) {
      countQuery += ` AND m.monto <= ?`;
      countParams.push(Number(monto_max));
    }

    const [[{ total }]] = await db.query(countQuery, countParams);

    res.json({
      data: rows,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (Number(offset) + rows.length) < total
      }
    });
  } catch (error) {
    console.error('Error al listar multas:', error);
    res.status(500).json({ error: 'Error al listar multas' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/estadisticas-comunidad:
 *   get:
 *     tags: [Multas]
 *     summary: Estadísticas de multas por comunidad
 */
router.get('/comunidad/:comunidadId/estadisticas-comunidad', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        c.razon_social AS comunidad,
        COUNT(m.id) AS total_multas,
        COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
        COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
        COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas,
        COUNT(ma.id) AS apeladas,
        COUNT(CASE WHEN m.estado = 'anulada' THEN 1 END) AS anuladas,
        COALESCE(SUM(m.monto), 0) AS monto_total,
        COALESCE(AVG(m.monto), 0) AS monto_promedio,
        MAX(m.fecha) AS ultima_multa
      FROM comunidad c
      LEFT JOIN multa m ON c.id = m.comunidad_id
      LEFT JOIN multa_apelacion ma ON m.id = ma.multa_id
      WHERE c.id = ?
      GROUP BY c.id, c.razon_social
    `;

    const [[stats]] = await db.query(query, [comunidadId]);

    res.json(stats || {
      comunidad: '',
      total_multas: 0,
      pendientes: 0,
      pagadas: 0,
      vencidas: 0,
      apeladas: 0,
      anuladas: 0,
      monto_total: 0,
      monto_promedio: 0,
      ultima_multa: null
    });
  } catch (error) {
    console.error('Error al obtener estadísticas por comunidad:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/proximas-vencer:
 *   get:
 *     tags: [Multas]
 *     summary: Multas próximas a vencer (7 días)
 */
router.get('/comunidad/:comunidadId/proximas-vencer', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.id,
        m.id AS numero,
        c.razon_social AS comunidad,
        u.codigo AS unidad,
        m.motivo AS tipo_infraccion,
        m.monto,
        m.fecha AS fecha_vencimiento,
        DATEDIFF(m.fecha, CURDATE()) AS dias_restantes,
        CASE
          WHEN DATEDIFF(m.fecha, CURDATE()) <= 0 THEN 'vencida'
          WHEN DATEDIFF(m.fecha, CURDATE()) <= 3 THEN 'critica'
          ELSE 'advertencia'
        END AS urgencia
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      WHERE m.comunidad_id = ?
        AND m.estado = 'pendiente'
        AND m.fecha >= CURDATE()
        AND DATEDIFF(m.fecha, CURDATE()) <= 7
      ORDER BY m.fecha ASC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener multas próximas a vencer:', error);
    res.status(500).json({ error: 'Error al obtener multas próximas a vencer' });
  }
});

// =========================================
// 2. VISTA DETALLADA
// =========================================

/**
 * @openapi
 * /api/multas/{id}:
 *   get:
 *     tags: [Multas]
 *     summary: Obtener multa por ID con detalles completos
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const query = `
      SELECT
        m.id,
        m.id AS numero,
        c.id AS comunidad_id,
        c.razon_social AS comunidad_nombre,
        u.id AS unidad_id,
        u.codigo AS unidad_codigo,
        t.nombre AS torre_nombre,
        e.nombre AS edificio_nombre,
        p.id AS persona_id,
        CONCAT(p.nombres, ' ', p.apellidos) AS propietario_nombre,
        p.email AS propietario_email,
        p.telefono AS propietario_telefono,
        m.motivo AS tipo_infraccion,
        m.descripcion,
        m.monto,
        m.estado,
        m.prioridad,
        m.fecha AS fecha_infraccion,
        m.fecha AS fecha_vencimiento,
        m.fecha_pago,
        NULL AS fecha_anulacion,
        NULL AS motivo_anulacion,
        m.anulado_por,
        COALESCE(ua.username, '') AS anulado_por_username,
        m.created_at,
        m.updated_at,
        CASE
          WHEN m.estado = 'pagada' THEN 'Pagada'
          WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 'Vencida'
          WHEN m.estado = 'pendiente' THEN 'Pendiente'
          WHEN m.estado = 'anulada' THEN 'Anulada'
        END AS estado_descripcion,
        DATEDIFF(CURDATE(), m.fecha) AS dias_desde_infraccion,
        CASE
          WHEN m.fecha_pago IS NOT NULL THEN DATEDIFF(m.fecha_pago, m.fecha)
          ELSE NULL
        END AS dias_para_pagar
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN torre t ON u.torre_id = t.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN persona p ON m.persona_id = p.id
      LEFT JOIN usuario ua ON m.anulado_por = ua.id
      WHERE m.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Multa no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener multa:', error);
    res.status(500).json({ error: 'Error al obtener multa' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/completas:
 *   get:
 *     tags: [Multas]
 *     summary: Vista de multas con información completa en JSON
 */
router.get('/comunidad/:comunidadId/completas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        m.id,
        m.id AS numero,
        JSON_OBJECT(
          'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social,
            'direccion', c.direccion
          ),
          'unidad', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
              'id', u.id,
              'numero', u.codigo,
              'torre', t.nombre,
              'edificio', e.nombre
            )
            ELSE NULL
          END,
          'propietario', CASE
            WHEN p.id IS NOT NULL THEN JSON_OBJECT(
              'id', p.id,
              'nombre', CONCAT(p.nombres, ' ', p.apellidos),
              'email', p.email,
              'telefono', p.telefono
            )
            ELSE NULL
          END,
          'multa', JSON_OBJECT(
            'tipo_infraccion', m.motivo,
            'descripcion', m.descripcion,
            'monto', m.monto,
            'estado', m.estado,
            'prioridad', m.prioridad,
            'fecha_infraccion', m.fecha,
            'fecha_vencimiento', m.fecha,
            'fecha_pago', m.fecha_pago,
            'fecha_anulacion', NULL,
            'motivo_anulacion', NULL
          ),
          'fechas', JSON_OBJECT(
            'creado', m.created_at,
            'actualizado', m.updated_at
          )
        ) AS informacion_completa
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN torre t ON u.torre_id = t.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN persona p ON m.persona_id = p.id
      WHERE m.comunidad_id = ?
      ORDER BY m.fecha DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(query, [comunidadId, Number(limit), Number(offset)]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener multas completas:', error);
    res.status(500).json({ error: 'Error al obtener multas completas' });
  }
});

// =========================================
// 3. ESTADÍSTICAS
// =========================================

/**
 * @openapi
 * /api/multas/estadisticas/generales:
 *   get:
 *     tags: [Multas]
 *     summary: Estadísticas generales de multas
 */
router.get('/estadisticas/generales', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_multas,
        COUNT(DISTINCT comunidad_id) AS comunidades_con_multas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS multas_pendientes,
        COUNT(CASE WHEN estado = 'pagada' THEN 1 END) AS multas_pagadas,
        COUNT(CASE WHEN estado = 'pendiente' AND CURDATE() > fecha THEN 1 END) AS multas_vencidas,
        (SELECT COUNT(*) FROM multa_apelacion) AS multas_apeladas,
        COUNT(CASE WHEN estado = 'anulada' THEN 1 END) AS multas_anuladas,
        COALESCE(SUM(monto), 0) AS monto_total,
        COALESCE(AVG(monto), 0) AS monto_promedio,
        COALESCE(MIN(monto), 0) AS monto_minimo,
        COALESCE(MAX(monto), 0) AS monto_maximo,
        MIN(fecha) AS primera_multa,
        MAX(fecha) AS ultima_multa
      FROM multa m
    `;

    const [[stats]] = await db.query(query);

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/estadisticas/tipo:
 *   get:
 *     tags: [Multas]
 *     summary: Estadísticas por tipo de infracción
 */
router.get('/comunidad/:comunidadId/estadisticas/tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.motivo AS tipo_infraccion,
        COUNT(m.id) AS cantidad,
        COALESCE(SUM(m.monto), 0) AS monto_total,
        COALESCE(AVG(m.monto), 0) AS monto_promedio,
        COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
        COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
        COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas,
        ROUND(
          (COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_cobranza
      FROM multa m
      WHERE m.comunidad_id = ?
      GROUP BY m.motivo
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por tipo:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por tipo' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/estadisticas/prioridad:
 *   get:
 *     tags: [Multas]
 *     summary: Estadísticas por prioridad
 */
router.get('/comunidad/:comunidadId/estadisticas/prioridad', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        prioridad,
        COUNT(*) AS cantidad,
        COALESCE(SUM(monto), 0) AS monto_total,
        COALESCE(AVG(monto), 0) AS monto_promedio,
        COUNT(CASE WHEN estado = 'pagada' THEN 1 END) AS pagadas,
        COUNT(CASE WHEN estado = 'pendiente' AND CURDATE() > fecha THEN 1 END) AS vencidas,
        ROUND(
          (COUNT(CASE WHEN estado = 'pagada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_cobranza
      FROM multa
      WHERE comunidad_id = ?
      GROUP BY prioridad
      ORDER BY
        CASE prioridad
          WHEN 'alta' THEN 1
          WHEN 'media' THEN 2
          WHEN 'baja' THEN 3
          ELSE 4
        END
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por prioridad:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por prioridad' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/estadisticas/mensuales:
 *   get:
 *     tags: [Multas]
 *     summary: Estadísticas mensuales de multas (últimos 12 meses)
 */
router.get('/comunidad/:comunidadId/estadisticas/mensuales', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        YEAR(fecha) AS anio,
        MONTH(fecha) AS mes,
        COUNT(*) AS total_multas,
        COALESCE(SUM(monto), 0) AS monto_total,
        COUNT(CASE WHEN estado = 'pagada' THEN 1 END) AS pagadas,
        COUNT(CASE WHEN estado = 'pendiente' AND CURDATE() > fecha THEN 1 END) AS vencidas,
        ROUND(
          (COUNT(CASE WHEN estado = 'pagada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_cobranza
      FROM multa
      WHERE comunidad_id = ?
        AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(fecha), MONTH(fecha)
      ORDER BY anio DESC, mes DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas mensuales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas mensuales' });
  }
});

// =========================================
// 4. BÚSQUEDAS AVANZADAS
// =========================================

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/buscar:
 *   get:
 *     tags: [Multas]
 *     summary: Búsqueda avanzada de multas
 */
router.get('/comunidad/:comunidadId/buscar', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { busqueda, limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        m.id,
        m.id AS numero,
        c.razon_social AS comunidad,
        u.codigo AS unidad,
        COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS propietario,
        m.motivo AS tipo_infraccion,
        m.monto,
        m.estado,
        m.prioridad,
        m.fecha AS fecha_infraccion,
        m.fecha AS fecha_vencimiento,
        CASE
          WHEN m.estado = 'pagada' THEN 'Pagada'
          WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 'Vencida'
          WHEN m.estado = 'pendiente' THEN 'Pendiente'
          ELSE m.estado
        END AS estado_actual,
        DATEDIFF(CURDATE(), m.fecha) AS antiguedad_dias
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN persona p ON m.persona_id = p.id
      WHERE m.comunidad_id = ?
        AND (? IS NULL OR
             m.id LIKE ? OR
             m.motivo LIKE ? OR
             CONCAT(p.nombres, ' ', p.apellidos) LIKE ?)
      ORDER BY m.fecha DESC, m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const searchParam = busqueda || null;
    const searchPattern = busqueda ? `%${busqueda}%` : null;

    const [rows] = await db.query(query, [
      comunidadId,
      searchParam, searchPattern, searchPattern, searchPattern,
      Number(limit), Number(offset)
    ]);

    res.json(rows);
  } catch (error) {
    console.error('Error en búsqueda de multas:', error);
    res.status(500).json({ error: 'Error en búsqueda de multas' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/por-propietario:
 *   get:
 *     tags: [Multas]
 *     summary: Multas por propietario con estadísticas
 */
router.get('/comunidad/:comunidadId/por-propietario', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        p.id AS persona_id,
        CONCAT(p.nombres, ' ', p.apellidos) AS propietario,
        p.email,
        COUNT(m.id) AS total_multas,
        COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
        COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
        COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas,
        COALESCE(SUM(m.monto), 0) AS monto_total,
        COALESCE(AVG(m.monto), 0) AS monto_promedio,
        MAX(m.fecha) AS ultima_multa,
        MIN(m.fecha) AS primera_multa
      FROM persona p
      LEFT JOIN multa m ON p.id = m.persona_id
      WHERE m.comunidad_id = ?
      GROUP BY p.id, p.nombres, p.apellidos, p.email
      HAVING COUNT(m.id) > 0
      ORDER BY total_multas DESC, monto_total DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener multas por propietario:', error);
    res.status(500).json({ error: 'Error al obtener multas por propietario' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/por-unidad:
 *   get:
 *     tags: [Multas]
 *     summary: Multas por unidad con estadísticas
 */
router.get('/comunidad/:comunidadId/por-unidad', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        u.id AS unidad_id,
        u.codigo AS unidad_codigo,
        t.nombre AS torre,
        e.nombre AS edificio,
        c.razon_social AS comunidad,
        COUNT(m.id) AS total_multas,
        COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS pendientes,
        COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS pagadas,
        COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS vencidas,
        COALESCE(SUM(m.monto), 0) AS monto_total,
        COALESCE(AVG(m.monto), 0) AS monto_promedio,
        MAX(m.fecha) AS ultima_multa
      FROM unidad u
      LEFT JOIN torre t ON u.torre_id = t.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      JOIN comunidad c ON u.comunidad_id = c.id
      LEFT JOIN multa m ON u.id = m.unidad_id
      WHERE u.comunidad_id = ?
      GROUP BY u.id, u.codigo, t.nombre, e.nombre, c.razon_social
      HAVING COUNT(m.id) > 0
      ORDER BY total_multas DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener multas por unidad:', error);
    res.status(500).json({ error: 'Error al obtener multas por unidad' });
  }
});

// =========================================
// 5. EXPORTACIÓN
// =========================================

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/export:
 *   get:
 *     tags: [Multas]
 *     summary: Exportar multas a CSV/Excel
 */
router.get('/comunidad/:comunidadId/export', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.id AS 'ID',
        m.id AS 'Número',
        c.razon_social AS 'Comunidad',
        COALESCE(u.codigo, '') AS 'Unidad',
        COALESCE(t.nombre, '') AS 'Torre',
        COALESCE(e.nombre, '') AS 'Edificio',
        COALESCE(CONCAT(p.nombres, ' ', p.apellidos), '') AS 'Propietario',
        COALESCE(p.email, '') AS 'Email Propietario',
        m.motivo AS 'Tipo Infracción',
        m.descripcion AS 'Descripción',
        m.monto AS 'Monto',
        m.estado AS 'Estado',
        m.prioridad AS 'Prioridad',
        DATE_FORMAT(m.fecha, '%Y-%m-%d') AS 'Fecha Infracción',
        m.fecha AS 'Fecha Vencimiento',
        DATE_FORMAT(m.fecha_pago, '%Y-%m-%d') AS 'Fecha Pago',
        DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización'
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN torre t ON u.torre_id = t.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN persona p ON m.persona_id = p.id
      WHERE m.comunidad_id = ?
      ORDER BY c.razon_social, m.fecha DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar multas:', error);
    res.status(500).json({ error: 'Error al exportar multas' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/export/pendientes:
 *   get:
 *     tags: [Multas]
 *     summary: Exportar multas pendientes
 */
router.get('/comunidad/:comunidadId/export/pendientes', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.id AS 'Número Multa',
        c.razon_social AS 'Comunidad',
        u.codigo AS 'Unidad',
        CONCAT(p.nombres, ' ', p.apellidos) AS 'Propietario',
        m.motivo AS 'Infracción',
        m.monto AS 'Monto',
        m.fecha AS 'Vence',
        DATEDIFF(m.fecha, CURDATE()) AS 'Días Restantes',
        CASE
          WHEN DATEDIFF(m.fecha, CURDATE()) <= 0 THEN 'VENCIDA'
          WHEN DATEDIFF(m.fecha, CURDATE()) <= 7 THEN 'URGENTE'
          ELSE 'PENDIENTE'
        END AS 'Estado Urgencia'
      FROM multa m
      JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN persona p ON m.persona_id = p.id
      WHERE m.comunidad_id = ?
        AND m.estado = 'pendiente'
      ORDER BY m.fecha ASC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar multas pendientes:', error);
    res.status(500).json({ error: 'Error al exportar multas pendientes' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/export/estadisticas:
 *   get:
 *     tags: [Multas]
 *     summary: Exportar estadísticas de cobranza
 */
router.get('/comunidad/:comunidadId/export/estadisticas', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        YEAR(m.fecha) AS 'Año',
        MONTH(m.fecha) AS 'Mes',
        COUNT(*) AS 'Total Multas',
        COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) AS 'Pagadas',
        COUNT(CASE WHEN m.estado = 'pendiente' THEN 1 END) AS 'Pendientes',
        COUNT(CASE WHEN m.estado = 'pendiente' AND CURDATE() > m.fecha THEN 1 END) AS 'Vencidas',
        COALESCE(SUM(m.monto), 0) AS 'Monto Total',
        COALESCE(SUM(CASE WHEN m.estado = 'pagada' THEN m.monto ELSE 0 END), 0) AS 'Monto Cobrado',
        ROUND(
          (COUNT(CASE WHEN m.estado = 'pagada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS 'Porcentaje Cobranza (%)'
      FROM multa m
      WHERE m.comunidad_id = ?
        AND m.fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(m.fecha), MONTH(m.fecha)
      ORDER BY 'Año' DESC, 'Mes' DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar estadísticas:', error);
    res.status(500).json({ error: 'Error al exportar estadísticas' });
  }
});

// =========================================
// 6. VALIDACIONES
// =========================================

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/validar/integridad:
 *   get:
 *     tags: [Multas]
 *     summary: Validar integridad de multas
 */
router.get('/comunidad/:comunidadId/validar/integridad', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT 'Multas sin comunidad' AS validacion, COUNT(*) AS cantidad
      FROM multa m
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      WHERE m.comunidad_id = ? AND c.id IS NULL
      UNION ALL
      SELECT 'Multas sin unidad' AS validacion, COUNT(*) AS cantidad
      FROM multa m
      LEFT JOIN unidad u ON m.unidad_id = u.id
      WHERE m.comunidad_id = ? AND u.id IS NULL
      UNION ALL
      SELECT 'Multas con montos negativos o cero' AS validacion, COUNT(*) AS cantidad
      FROM multa
      WHERE comunidad_id = ? AND monto <= 0
      UNION ALL
      SELECT 'Multas pagadas sin fecha de pago' AS validacion, COUNT(*) AS cantidad
      FROM multa
      WHERE comunidad_id = ? AND estado = 'pagada' AND fecha_pago IS NULL
    `;

    const [rows] = await db.query(query, [comunidadId, comunidadId, comunidadId, comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al validar integridad:', error);
    res.status(500).json({ error: 'Error al validar integridad' });
  }
});

/**
 * @openapi
 * /api/multas/comunidad/{comunidadId}/validar/rangos-monto:
 *   get:
 *     tags: [Multas]
 *     summary: Validar rangos de montos por tipo de infracción
 */
router.get('/comunidad/:comunidadId/validar/rangos-monto', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.motivo AS tipo_infraccion,
        COUNT(*) AS total_multas,
        AVG(m.monto) AS monto_promedio,
        MIN(m.monto) AS monto_minimo,
        MAX(m.monto) AS monto_maximo,
        CASE
          WHEN AVG(m.monto) < 1000 THEN 'Montos muy bajos'
          WHEN AVG(m.monto) > 500000 THEN 'Montos muy altos'
          ELSE 'Montos normales'
        END AS evaluacion_rango
      FROM multa m
      WHERE m.comunidad_id = ?
      GROUP BY m.motivo
      HAVING COUNT(*) > 1
      ORDER BY monto_promedio DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al validar rangos de monto:', error);
    res.status(500).json({ error: 'Error al validar rangos de monto' });
  }
});

// =========================================
// 7. CRUD BÁSICO
// =========================================

/**
 * @openapi
 * /api/multas/unidad/{unidadId}:
 *   get:
 *     tags: [Multas]
 *     summary: Listar multas de una unidad
 */
router.get('/unidad/:unidadId', authenticate, async (req, res) => {
  try {
    const unidadId = Number(req.params.unidadId);

    const [rows] = await db.query(
      'SELECT id, motivo, monto, estado, fecha, prioridad, descripcion FROM multa WHERE unidad_id = ? ORDER BY fecha DESC LIMIT 200',
      [unidadId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al listar multas de unidad:', error);
    res.status(500).json({ error: 'Error al listar multas' });
  }
});

/**
 * @openapi
 * /api/multas/unidad/{unidadId}:
 *   post:
 *     tags: [Multas]
 *     summary: Crear una multa para una unidad
 */
router.post('/unidad/:unidadId', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('motivo').notEmpty(),
  body('monto').isNumeric(),
  body('fecha').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const unidadId = Number(req.params.unidadId);
    const { persona_id, motivo, descripcion, monto, fecha, prioridad = 'media' } = req.body;

    const [result] = await db.query(
      `INSERT INTO multa (comunidad_id, unidad_id, persona_id, motivo, descripcion, monto, fecha, prioridad)
       SELECT unidad.comunidad_id, ?, ?, ?, ?, ?, ?, ?
       FROM unidad WHERE id = ?`,
      [unidadId, persona_id || null, motivo, descripcion || null, monto, fecha, prioridad, unidadId]
    );

    const [row] = await db.query('SELECT id, motivo, monto, estado, prioridad FROM multa WHERE id = ? LIMIT 1', [result.insertId]);

    res.status(201).json(row[0]);
  } catch (error) {
    console.error('Error al crear multa:', error);
    res.status(500).json({ error: 'Error al crear multa' });
  }
});

/**
 * @openapi
 * /api/multas/{id}:
 *   patch:
 *     tags: [Multas]
 *     summary: Actualizar multa
 */
router.patch('/:id', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fields = ['estado', 'fecha_pago', 'monto', 'motivo', 'descripcion', 'prioridad'];
    const updates = [];
    const values = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    await db.query(`UPDATE multa SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await db.query('SELECT id, motivo, monto, estado, prioridad FROM multa WHERE id = ? LIMIT 1', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar multa:', error);
    res.status(500).json({ error: 'Error al actualizar multa' });
  }
});

/**
 * @openapi
 * /api/multas/{id}/anular:
 *   patch:
 *     tags: [Multas]
 *     summary: Anular una multa
 */
router.patch('/:id/anular', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.user.id;

    await db.query(
      'UPDATE multa SET estado = ?, anulado_por = ? WHERE id = ?',
      ['anulada', usuarioId, id]
    );

    const [rows] = await db.query('SELECT id, motivo, monto, estado FROM multa WHERE id = ? LIMIT 1', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al anular multa:', error);
    res.status(500).json({ error: 'Error al anular multa' });
  }
});

/**
 * @openapi
 * /api/multas/{id}:
 *   delete:
 *     tags: [Multas]
 *     summary: Eliminar multa
 */
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);

    await db.query('DELETE FROM multa WHERE id = ?', [id]);

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar multa:', error);
    res.status(500).json({ error: 'Error al eliminar multa' });
  }
});

module.exports = router;
