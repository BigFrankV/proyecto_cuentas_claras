const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { requireCommunity } = require('../middleware/tenancy');
const { body, validationResult } = require('express-validator');

/**
 * @openapi
 * tags:
 *   - name: Notificaciones
 *     description: Sistema de notificaciones de usuario
 */

// =========================================
// 1. LISTADOS BÁSICOS CON FILTROS
// =========================================

/**
 * @openapi
 * /api/notificaciones/comunidad/{comunidadId}:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Listado de notificaciones con filtros
 *     parameters:
 *       - name: estado_leida
 *         in: query
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *       - name: tipo
 *         in: query
 *         schema:
 *           type: string
 *       - name: persona_id
 *         in: query
 *         schema:
 *           type: integer
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
    const { estado_leida, tipo, persona_id, fecha_desde, fecha_hasta, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        n.id,
        n.titulo AS asunto,
        n.mensaje,
        n.tipo,
        n.leida AS estado_leida,
        c.razon_social AS comunidad,
        'Sistema' AS autor,
        n.fecha_creacion,
        NULL AS canales,
        NULL AS audiencia_tipo,
        NULL AS fecha_envio,
        NULL AS fecha_programada,
        NULL AS prioridad,
        0 AS enviados,
        n.leida AS abiertos,
        (1 - n.leida) AS pendientes,
        CASE
          WHEN n.leida = 1 THEN 'leida'
          ELSE 'pendiente'
        END AS estado_descripcion,
        'procesada' AS estado_programacion,
        DATEDIFF(NOW(), n.fecha_creacion) AS dias_desde_creacion
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      WHERE n.comunidad_id = ?
    `;

    const params = [comunidadId];

    if (estado_leida !== undefined) {
      query += ` AND n.leida = ?`;
      params.push(Number(estado_leida));
    }

    if (tipo) {
      query += ` AND n.tipo = ?`;
      params.push(tipo);
    }

    if (persona_id) {
      query += ` AND n.persona_id = ?`;
      params.push(Number(persona_id));
    }

    if (fecha_desde) {
      query += ` AND n.fecha_creacion >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND n.fecha_creacion <= ?`;
      params.push(fecha_hasta);
    }

    query += ` ORDER BY n.fecha_creacion DESC, n.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

/**
 * @openapi
 * /api/notificaciones/comunidad/{comunidadId}/estadisticas-general:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Estadísticas de notificaciones por comunidad
 */
router.get('/comunidad/:comunidadId/estadisticas-general', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        c.razon_social AS comunidad,
        COUNT(n.id) AS total_notificaciones,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS abiertas,
        COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS pendientes,
        0 AS borradores,
        0 AS programadas,
        COUNT(n.id) AS total_enviados,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS total_entregados,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(n.id), 0)), 2
        ) AS tasa_entrega_promedio,
        MAX(n.fecha_creacion) AS ultima_notificacion
      FROM comunidad c
      LEFT JOIN notificacion_usuario n ON c.id = n.comunidad_id
      WHERE c.id = ?
      GROUP BY c.id, c.razon_social
    `;

    const [[result]] = await db.query(query, [comunidadId]);

    res.json(result || {});
  } catch (error) {
    console.error('Error al obtener estadísticas de notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de notificaciones' });
  }
});

/**
 * @openapi
 * /api/notificaciones/comunidad/{comunidadId}/pendientes:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Notificaciones no leídas (pendientes)
 */
router.get('/comunidad/:comunidadId/pendientes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        n.id,
        n.titulo AS asunto,
        n.tipo,
        c.razon_social AS comunidad,
        'Sistema' AS autor,
        n.fecha_creacion AS fecha_programada,
        1 AS audiencia_cantidad,
        'app' AS canales,
        0 AS minutos_restantes,
        'pendiente_lectura' AS urgencia_envio
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      WHERE n.comunidad_id = ? AND n.leida = 0
      ORDER BY n.fecha_creacion ASC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones pendientes:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones pendientes' });
  }
});

// =========================================
// 2. VISTAS DETALLADAS
// =========================================

/**
 * @openapi
 * /api/notificaciones/{id}:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Detalle de una notificación específica
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notificacionId = Number(req.params.id);

    const query = `
      SELECT
        n.id,
        n.titulo AS asunto,
        n.mensaje,
        n.tipo,
        n.leida AS estado_leida,
        n.objeto_tipo,
        n.objeto_id,
        c.id AS comunidad_id,
        c.razon_social AS comunidad_nombre,
        NULL AS autor_id,
        'Sistema' AS autor_nombre,
        NULL AS autor_email,
        n.fecha_creacion,
        JSON_OBJECT(
          'enviados', 1,
          'entregados', n.leida,
          'abiertos', n.leida,
          'fallidos', (1 - n.leida),
          'tasa_entrega', ROUND(n.leida * 100.0, 2),
          'tasa_apertura', ROUND(n.leida * 100.0, 2)
        ) AS estadisticas_entrega,
        0 AS num_adjuntos,
        0 AS num_historial
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      WHERE n.id = ?
    `;

    const [[notificacion]] = await db.query(query, [notificacionId]);

    if (!notificacion) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json(notificacion);
  } catch (error) {
    console.error('Error al obtener detalle de notificación:', error);
    res.status(500).json({ error: 'Error al obtener detalle de notificación' });
  }
});

/**
 * @openapi
 * /api/notificaciones/comunidad/{comunidadId}/listado-completo:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Listado con información completa (JSON)
 */
router.get('/comunidad/:comunidadId/listado-completo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        n.id,
        n.titulo AS asunto,
        n.tipo,
        c.razon_social AS comunidad,
        'Sistema' AS autor,
        n.fecha_creacion,
        n.leida AS estado_leida,
        JSON_OBJECT(
          'notificacion', JSON_OBJECT(
            'id', n.id,
            'asunto', n.titulo,
            'tipo', n.tipo,
            'leida', n.leida
          ),
          'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
          ),
          'autor', JSON_OBJECT(
            'nombre', 'Sistema',
            'email', c.email_contacto
          ),
          'audiencia', JSON_OBJECT(
            'tipo', n.tipo,
            'cantidad', 1,
            'descripcion', 'Destinatario Único'
          ),
          'estadisticas', JSON_OBJECT(
            'enviados', 1,
            'entregados', n.leida,
            'abiertos', n.leida
          )
        ) AS informacion_completa
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      WHERE n.comunidad_id = ?
      ORDER BY n.fecha_creacion DESC
      LIMIT 100
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener listado completo:', error);
    res.status(500).json({ error: 'Error al obtener listado completo' });
  }
});

// =========================================
// 3. ESTADÍSTICAS
// =========================================

/**
 * @openapi
 * /api/notificaciones/estadisticas/generales:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Estadísticas generales globales
 */
router.get('/estadisticas/generales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_notificaciones,
        COUNT(DISTINCT comunidad_id) AS comunidades_con_notificaciones,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS notificaciones_leidas,
        COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS notificaciones_pendientes,
        0 AS notificaciones_programadas,
        0 AS notificaciones_fallidas,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_leidas,
        COUNT(*) AS total_mensajes_enviados,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS total_mensajes_entregados,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS tasa_entrega_global,
        MIN(fecha_creacion) AS primera_notificacion,
        MAX(fecha_creacion) AS ultima_notificacion
      FROM notificacion_usuario n
    `;

    const [[result]] = await db.query(query);

    res.json(result || {});
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

/**
 * @openapi
 * /api/notificaciones/estadisticas/por-estado:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Estadísticas por estado (leída/pendiente)
 */
router.get('/estadisticas/por-estado', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        CASE WHEN leida = 1 THEN 'leida' ELSE 'pendiente' END AS estado,
        COUNT(*) AS cantidad,
        ROUND(
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion_usuario)), 2
        ) AS porcentaje,
        COUNT(CASE WHEN leida = 1 THEN 1 END) AS mensajes_leidos,
        ROUND(
          (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS tasa_lectura_proxy,
        MIN(fecha_creacion) AS mas_antigua,
        MAX(fecha_creacion) AS mas_reciente
      FROM notificacion_usuario n
      GROUP BY leida
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por estado:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por estado' });
  }
});

/**
 * @openapi
 * /api/notificaciones/estadisticas/por-tipo:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Estadísticas por tipo de notificación
 */
router.get('/estadisticas/por-tipo', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        tipo,
        COUNT(*) AS cantidad,
        ROUND(
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion_usuario)), 2
        ) AS porcentaje,
        COUNT(CASE WHEN leida = 1 THEN 1 END) AS leidas,
        ROUND(
          (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS tasa_lectura_proxy,
        COUNT(*) AS total_enviados,
        ROUND(
          (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS tasa_entrega_promedio_proxy
      FROM notificacion_usuario n
      GROUP BY tipo
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por tipo:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por tipo' });
  }
});

/**
 * @openapi
 * /api/notificaciones/estadisticas/por-canal:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Estadísticas por canal (simuladas)
 */
router.get('/estadisticas/por-canal', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        'app' AS canal,
        COUNT(n.id) AS notificaciones_usando_canal,
        COUNT(n.id) AS mensajes_enviados,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS mensajes_entregados,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS mensajes_abiertos,
        0 AS mensajes_clicados,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(n.id), 0)), 2
        ) AS tasa_entrega,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN n.leida = 1 THEN 1 END), 0)), 2
        ) AS tasa_apertura
      FROM notificacion_usuario n
      GROUP BY 1
      ORDER BY notificaciones_usando_canal DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por canal:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por canal' });
  }
});

/**
 * @openapi
 * /api/notificaciones/estadisticas/mensuales:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Estadísticas mensuales (últimos 12 meses)
 */
router.get('/estadisticas/mensuales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        YEAR(fecha_creacion) AS anio,
        MONTH(fecha_creacion) AS mes,
        COUNT(*) AS total_notificaciones,
        COUNT(CASE WHEN leida = 1 THEN 1 END) AS leidas,
        COUNT(CASE WHEN leida = 0 THEN 1 END) AS pendientes,
        0 AS programadas,
        0 AS fallidas,
        COUNT(*) AS total_enviados,
        ROUND(
          (COUNT(CASE WHEN leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS tasa_lectura_promedio
      FROM notificacion_usuario n
      WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY 1, 2
      ORDER BY anio DESC, mes DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas mensuales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas mensuales' });
  }
});

// =========================================
// 4. BÚSQUEDAS FILTRADAS
// =========================================

/**
 * @openapi
 * /api/notificaciones/buscar:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Búsqueda avanzada de notificaciones
 *     parameters:
 *       - name: busqueda
 *         in: query
 *         schema:
 *           type: string
 *       - name: comunidad_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: estado_leida
 *         in: query
 *         schema:
 *           type: integer
 *       - name: tipo
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
router.get('/buscar', authenticate, async (req, res) => {
  try {
    const { busqueda, comunidad_id, estado_leida, tipo, fecha_desde, fecha_hasta, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        n.id,
        n.titulo AS asunto,
        n.tipo,
        c.razon_social AS comunidad,
        'Sistema' AS autor,
        n.fecha_creacion,
        n.leida AS leida,
        1 AS enviados,
        n.leida AS entregados,
        n.leida AS abiertos,
        CASE
          WHEN n.leida = 1 THEN 'leida'
          ELSE 'pendiente'
        END AS estado_actual
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (busqueda) {
      query += ` AND (n.titulo LIKE ? OR n.mensaje LIKE ?)`;
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    if (comunidad_id) {
      query += ` AND n.comunidad_id = ?`;
      params.push(Number(comunidad_id));
    }

    if (estado_leida !== undefined) {
      query += ` AND n.leida = ?`;
      params.push(Number(estado_leida));
    }

    if (tipo) {
      query += ` AND n.tipo = ?`;
      params.push(tipo);
    }

    if (fecha_desde) {
      query += ` AND n.fecha_creacion >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND n.fecha_creacion <= ?`;
      params.push(fecha_hasta);
    }

    query += ` GROUP BY n.id, c.id, c.razon_social ORDER BY n.fecha_creacion DESC, n.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({ error: 'Error en búsqueda avanzada' });
  }
});

/**
 * @openapi
 * /api/notificaciones/por-comunidad:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Notificaciones agrupadas por comunidad con estadísticas
 *     parameters:
 *       - name: comunidad_id
 *         in: query
 *         schema:
 *           type: integer
 */
router.get('/por-comunidad', authenticate, async (req, res) => {
  try {
    const { comunidad_id } = req.query;

    let query = `
      SELECT
        c.id AS comunidad_id,
        c.razon_social AS comunidad,
        COUNT(n.id) AS total_notificaciones,
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS leidas,
        COUNT(CASE WHEN n.leida = 0 THEN 1 END) AS pendientes,
        COUNT(n.id) AS total_enviados,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(n.id), 0)), 2
        ) AS tasa_lectura_promedio,
        MAX(n.fecha_creacion) AS ultima_notificacion
      FROM comunidad c
      LEFT JOIN notificacion_usuario n ON c.id = n.comunidad_id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ` AND c.id = ?`;
      params.push(Number(comunidad_id));
    }

    query += ` GROUP BY c.id, c.razon_social HAVING COUNT(n.id) > 0 ORDER BY total_notificaciones DESC`;

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones por comunidad:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones por comunidad' });
  }
});

/**
 * @openapi
 * /api/notificaciones/por-audiencia:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Notificaciones agrupadas por tipo de audiencia
 */
router.get('/por-audiencia', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        n.tipo AS audiencia_tipo,
        COUNT(*) AS cantidad,
        ROUND(
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM notificacion_usuario)), 2
        ) AS porcentaje,
        COUNT(n.id) AS total_destinatarios,
        1 AS promedio_destinatarios,
        COUNT(n.id) AS total_enviados,
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(n.id), 0)), 2
        ) AS tasa_entrega_promedio
      FROM notificacion_usuario n
      GROUP BY n.tipo
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener notificaciones por audiencia:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones por audiencia' });
  }
});

// =========================================
// 5. EXPORTACIONES
// =========================================

/**
 * @openapi
 * /api/notificaciones/exportar/completo:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Exportación completa para Excel/CSV
 */
router.get('/exportar/completo', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        n.id AS 'ID',
        n.titulo AS 'Asunto',
        n.mensaje AS 'Mensaje',
        n.tipo AS 'Tipo',
        CASE WHEN n.leida = 1 THEN 'Leída' ELSE 'Pendiente' END AS 'Estado Lectura',
        'App' AS 'Canales',
        n.objeto_tipo AS 'Tipo Objeto',
        n.objeto_id AS 'ID Objeto',
        c.razon_social AS 'Comunidad',
        'Sistema' AS 'Autor',
        DATE_FORMAT(n.fecha_creacion, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
        1 AS 'Enviados',
        n.leida AS 'Abiertos',
        (1 - n.leida) AS 'Pendientes',
        0 AS 'Clicados',
        0 AS 'Fallidos'
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      ORDER BY n.fecha_creacion DESC
      LIMIT 1000
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar notificaciones:', error);
    res.status(500).json({ error: 'Error al exportar notificaciones' });
  }
});

/**
 * @openapi
 * /api/notificaciones/exportar/enviadas:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Exportación de notificaciones enviadas con estadísticas
 */
router.get('/exportar/enviadas', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        n.titulo AS 'Notificación',
        c.razon_social AS 'Comunidad',
        'Sistema' AS 'Autor',
        n.tipo AS 'Tipo',
        DATE_FORMAT(n.fecha_creacion, '%Y-%m-%d %H:%i') AS 'Enviada',
        1 AS 'Destinatarios',
        'App' AS 'Canales',
        1 AS 'Enviados',
        n.leida AS 'Entregados',
        ROUND(n.leida * 100.0, 2) AS 'Tasa Entrega (%)',
        n.leida AS 'Abiertos',
        ROUND(n.leida * 100.0, 2) AS 'Tasa Apertura (%)'
      FROM notificacion_usuario n
      JOIN comunidad c ON n.comunidad_id = c.id
      WHERE n.leida = 1
      ORDER BY n.fecha_creacion DESC
      LIMIT 1000
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar notificaciones enviadas:', error);
    res.status(500).json({ error: 'Error al exportar notificaciones enviadas' });
  }
});

/**
 * @openapi
 * /api/notificaciones/exportar/estadisticas-mensuales:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Exportación de estadísticas de entrega por mes
 */
router.get('/exportar/estadisticas-mensuales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        YEAR(n.fecha_creacion) AS 'Año',
        MONTH(n.fecha_creacion) AS 'Mes',
        COUNT(n.id) AS 'Total Notificaciones',
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS 'Leídas',
        COUNT(n.id) AS 'Total Enviados',
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS 'Total Entregados',
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(n.id), 0)), 2
        ) AS 'Tasa Entrega Promedio (%)',
        COUNT(CASE WHEN n.leida = 1 THEN 1 END) AS 'Total Abiertos',
        ROUND(
          (COUNT(CASE WHEN n.leida = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN n.leida = 1 THEN 1 END), 0)), 2
        ) AS 'Tasa Apertura Promedio (%)'
      FROM notificacion_usuario n
      WHERE n.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY 1, 2
      ORDER BY 1 DESC, 2 DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar estadísticas mensuales:', error);
    res.status(500).json({ error: 'Error al exportar estadísticas mensuales' });
  }
});

// =========================================
// 6. VALIDACIONES
// =========================================

/**
 * @openapi
 * /api/notificaciones/validaciones/integridad:
 *   get:
 *     tags: [Notificaciones]
 *     summary: Validar integridad de notificaciones
 */
router.get('/validaciones/integridad', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        'Notificaciones sin comunidad' AS validacion,
        COUNT(*) AS cantidad
      FROM notificacion_usuario n
      LEFT JOIN comunidad c ON n.comunidad_id = c.id
      WHERE c.id IS NULL
      UNION ALL
      SELECT
        'Notificaciones sin destinatario (persona)' AS validacion,
        COUNT(*) AS cantidad
      FROM notificacion_usuario n
      LEFT JOIN persona p ON n.persona_id = p.id
      WHERE p.id IS NULL
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al validar integridad:', error);
    res.status(500).json({ error: 'Error al validar integridad' });
  }
});

// =========================================
// 7. OPERACIONES CRUD
// =========================================

/**
 * @openapi
 * /api/notificaciones:
 *   post:
 *     tags: [Notificaciones]
 *     summary: Crear nueva notificación
 */
router.post('/',
  authenticate,
  [
    body('comunidad_id').isInt().withMessage('ID de comunidad inválido'),
    body('persona_id').isInt().withMessage('ID de persona inválido'),
    body('titulo').notEmpty().withMessage('El título es requerido'),
    body('mensaje').notEmpty().withMessage('El mensaje es requerido'),
    body('tipo').notEmpty().withMessage('El tipo es requerido')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { comunidad_id, persona_id, titulo, mensaje, tipo, objeto_tipo, objeto_id } = req.body;

      const [result] = await connection.query(
        `INSERT INTO notificacion_usuario 
         (comunidad_id, persona_id, titulo, mensaje, tipo, objeto_tipo, objeto_id, leida, fecha_creacion) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
        [comunidad_id, persona_id, titulo, mensaje, tipo, objeto_tipo || null, objeto_id || null]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Notificación creada exitosamente',
        id: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error al crear notificación:', error);
      res.status(500).json({ error: 'Error al crear notificación' });
    } finally {
      connection.release();
    }
  }
);

/**
 * @openapi
 * /api/notificaciones/{id}/marcar-leida:
 *   patch:
 *     tags: [Notificaciones]
 *     summary: Marcar notificación como leída
 */
router.patch('/:id/marcar-leida', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const notificacionId = Number(req.params.id);

    const [result] = await connection.query(
      `UPDATE notificacion_usuario SET leida = 1 WHERE id = ?`,
      [notificacionId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    await connection.commit();

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  } finally {
    connection.release();
  }
});

/**
 * @openapi
 * /api/notificaciones/{id}:
 *   delete:
 *     tags: [Notificaciones]
 *     summary: Eliminar una notificación
 */
router.delete('/:id', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const notificacionId = Number(req.params.id);

    const [result] = await connection.query(
      `DELETE FROM notificacion_usuario WHERE id = ?`,
      [notificacionId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    await connection.commit();

    res.json({ message: 'Notificación eliminada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  } finally {
    connection.release();
  }
});

module.exports = router;
