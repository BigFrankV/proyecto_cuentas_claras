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
 *   - name: Medidores
 *     description: Gestión de medidores y lecturas
 */

// =========================================
// 1. LISTADOS Y FILTROS
// =========================================

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}:
 *   get:
 *     tags: [Medidores]
 *     summary: Listar medidores con filtros avanzados
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [electricidad, agua, gas]
 *       - name: edificio_id
 *         in: query
 *         schema:
 *           type: integer
 *       - name: unidad_id
 *         in: query
 *         schema:
 *           type: integer
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
    const { search, type, edificio_id, unidad_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        m.id,
        m.codigo AS code,
        NULL AS serial_number,
        m.tipo AS type,
        'active' AS status,
        NULL AS brand,
        NULL AS model,
        JSON_OBJECT(
          'building', COALESCE(e.nombre, ''),
          'floor', NULL,
          'unit', COALESCE(u.codigo, ''),
          'position', NULL,
          'coordinates', NULL
        ) AS location,
        JSON_OBJECT(
          'id', c.id,
          'name', c.razon_social,
          'address', COALESCE(c.direccion, '')
        ) AS community,
        JSON_OBJECT(
          'date', NULL,
          'technician', NULL,
          'company', NULL,
          'warranty', NULL,
          'certificate', NULL
        ) AS installation,
        JSON_OBJECT(
          'value', COALESCE(ul.lectura, 0.0),
          'date', DATE_FORMAT(ul.fecha, '%Y-%m-%d'),
          'consumption', NULL,
          'period', COALESCE(ul.periodo, 'N/A')
        ) AS last_reading,
        DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM medidor m
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN (
        SELECT lm.medidor_id, lm.lectura, lm.fecha, lm.periodo
        FROM lectura_medidor lm
        INNER JOIN (
          SELECT medidor_id, MAX(fecha) AS max_fecha
          FROM lectura_medidor
          GROUP BY medidor_id
        ) AS lm_max ON lm.medidor_id = lm_max.medidor_id AND lm.fecha = lm_max.max_fecha
      ) AS ul ON m.id = ul.medidor_id
      WHERE m.comunidad_id = ?
    `;

    const params = [comunidadId];

    if (search) {
      query += ` AND m.codigo LIKE ?`;
      params.push(`%${search}%`);
    }

    if (type) {
      query += ` AND m.tipo = ?`;
      params.push(type);
    }

    if (edificio_id) {
      query += ` AND u.edificio_id = ?`;
      params.push(Number(edificio_id));
    }

    if (unidad_id) {
      query += ` AND m.unidad_id = ?`;
      params.push(Number(unidad_id));
    }

    query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    // Contar total
    let countQuery = `SELECT COUNT(DISTINCT m.id) AS total FROM medidor m LEFT JOIN unidad u ON m.unidad_id = u.id WHERE m.comunidad_id = ?`;
    const countParams = [comunidadId];
    
    if (search) {
      countQuery += ` AND m.codigo LIKE ?`;
      countParams.push(`%${search}%`);
    }
    if (type) {
      countQuery += ` AND m.tipo = ?`;
      countParams.push(type);
    }
    if (edificio_id) {
      countQuery += ` AND u.edificio_id = ?`;
      countParams.push(Number(edificio_id));
    }
    if (unidad_id) {
      countQuery += ` AND m.unidad_id = ?`;
      countParams.push(Number(unidad_id));
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
    console.error('Error al listar medidores:', error);
    res.status(500).json({ error: 'Error al listar medidores' });
  }
});

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/search:
 *   get:
 *     tags: [Medidores]
 *     summary: Búsqueda simplificada de medidores
 */
router.get('/comunidad/:comunidadId/search', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { search, limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT
        m.id,
        m.codigo AS code,
        NULL AS serial_number,
        m.tipo AS type,
        'active' AS status,
        NULL AS brand,
        NULL AS model,
        e.nombre AS building,
        u.codigo AS unit,
        c.razon_social AS community_name,
        COALESCE(ul.lectura, 0.0) AS last_reading_value,
        DATE_FORMAT(ul.fecha, '%Y-%m-%d') AS last_reading_date
      FROM medidor m
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN (
        SELECT lm.medidor_id, lm.lectura, lm.fecha
        FROM lectura_medidor lm
        INNER JOIN (
          SELECT medidor_id, MAX(fecha) AS max_fecha
          FROM lectura_medidor
          GROUP BY medidor_id
        ) AS lm_max ON lm.medidor_id = lm_max.medidor_id AND lm.fecha = lm_max.max_fecha
      ) AS ul ON m.id = ul.medidor_id
      WHERE m.comunidad_id = ?
        AND (? IS NULL OR m.codigo LIKE ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const searchParam = search ? `%${search}%` : null;
    const [rows] = await db.query(query, [comunidadId, searchParam, searchParam, Number(limit), Number(offset)]);

    res.json(rows);
  } catch (error) {
    console.error('Error en búsqueda de medidores:', error);
    res.status(500).json({ error: 'Error en búsqueda de medidores' });
  }
});

// =========================================
// 2. VISTA DETALLADA
// =========================================

/**
 * @openapi
 * /api/medidores/{id}:
 *   get:
 *     tags: [Medidores]
 *     summary: Obtener medidor por ID con detalles completos
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const query = `
      SELECT
        m.id,
        m.codigo AS code,
        NULL AS serial_number,
        m.tipo AS type,
        'active' AS status,
        NULL AS brand,
        NULL AS model,
        JSON_OBJECT(
          'building', COALESCE(e.nombre, ''),
          'floor', NULL,
          'unit', COALESCE(u.codigo, ''),
          'position', NULL,
          'coordinates', NULL
        ) AS location,
        JSON_OBJECT(
          'id', c.id,
          'name', c.razon_social,
          'address', COALESCE(c.direccion, '')
        ) AS community,
        JSON_OBJECT(
          'date', NULL,
          'technician', NULL,
          'company', NULL,
          'warranty', NULL,
          'certificate', NULL
        ) AS installation,
        JSON_OBJECT(
          'value', COALESCE(ul.lectura, 0.0),
          'date', DATE_FORMAT(ul.fecha, '%Y-%m-%d %H:%i:%s'),
          'consumption', NULL,
          'period', COALESCE(ul.periodo, 'N/A')
        ) AS last_reading,
        JSON_OBJECT(
          'capacity', NULL,
          'precision', NULL,
          'certification', NULL
        ) AS specifications,
        JSON_OBJECT(
          'lastService', NULL,
          'nextService', NULL,
          'frequency', 'semestral',
          'serviceCompany', NULL,
          'notes', NULL
        ) AS maintenance,
        JSON_OBJECT(
          'hasAlerts', FALSE,
          'count', 0,
          'severity', 'low',
          'lastAlert', NULL
        ) AS alerts,
        JSON_OBJECT(
          'readingFrequency', 'monthly',
          'alertThresholds', JSON_OBJECT(
            'consumption', 0,
            'pressure', 0,
            'temperature', 0
          ),
          'autoReading', FALSE,
          'notifications', FALSE
        ) AS configuration,
        DATE_FORMAT(m.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(m.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM medidor m
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN (
        SELECT lm.medidor_id, lm.lectura, lm.fecha, lm.periodo
        FROM lectura_medidor lm
        INNER JOIN (
          SELECT medidor_id, MAX(fecha) AS max_fecha
          FROM lectura_medidor
          GROUP BY medidor_id
        ) AS lm_max ON lm.medidor_id = lm_max.medidor_id AND lm.fecha = lm_max.max_fecha
      ) AS ul ON m.id = ul.medidor_id
      WHERE m.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Medidor no encontrado' });
    }

    // Obtener historial de lecturas (últimas 12)
    const [readings] = await db.query(`
      SELECT
        lm.id,
        DATE_FORMAT(lm.fecha, '%Y-%m-%d %H:%i:%s') AS date,
        lm.lectura AS value,
        NULL AS consumption,
        'Sistema' AS reader,
        'manual' AS method,
        'valid' AS status,
        NULL AS notes,
        NULL AS photoUrl,
        lm.periodo AS period
      FROM lectura_medidor lm
      WHERE lm.medidor_id = ?
      ORDER BY lm.fecha DESC
      LIMIT 12
    `, [id]);

    const medidor = rows[0];
    medidor.readings_history = readings;
    medidor.maintenance_history = [];
    medidor.active_alerts = [];

    res.json(medidor);
  } catch (error) {
    console.error('Error al obtener medidor:', error);
    res.status(500).json({ error: 'Error al obtener medidor' });
  }
});

// =========================================
// 3. ESTADÍSTICAS
// =========================================

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Medidores]
 *     summary: Obtener estadísticas generales de medidores
 */
router.get('/comunidad/:comunidadId/estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        COUNT(DISTINCT m.id) AS total_medidores,
        COUNT(DISTINCT m.id) AS medidores_activos,
        0 AS medidores_inactivos,
        COUNT(DISTINCT CASE WHEN m.tipo = 'electricidad' THEN m.id END) AS medidores_electricos,
        COUNT(DISTINCT CASE WHEN m.tipo = 'agua' THEN m.id END) AS medidores_agua,
        COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) AS medidores_gas,
        COUNT(DISTINCT c.id) AS comunidades_con_medidores,
        COUNT(DISTINCT e.id) AS edificios_con_medidores,
        COUNT(DISTINCT u.id) AS unidades_con_medidores,
        COUNT(DISTINCT lm.id) AS total_lecturas,
        COALESCE(AVG(lm.lectura), 0) AS consumo_promedio,
        MAX(lm.fecha) AS ultima_lectura_global,
        0 AS total_alertas,
        0 AS alertas_activas,
        0 AS alertas_altas,
        0 AS alertas_medias,
        0 AS alertas_bajas,
        0 AS total_mantenimientos,
        0 AS mantenimientos_completados,
        0 AS mantenimientos_pendientes
      FROM medidor m
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
      WHERE m.comunidad_id = ?
    `;

    const [[stats]] = await db.query(query, [comunidadId]);

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de medidores:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/estadisticas/tipo:
 *   get:
 *     tags: [Medidores]
 *     summary: Estadísticas por tipo de medidor
 */
router.get('/comunidad/:comunidadId/estadisticas/tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.tipo AS tipo_medidor,
        COUNT(DISTINCT m.id) AS total_medidores,
        COUNT(DISTINCT m.id) AS medidores_activos,
        COUNT(DISTINCT lm.id) AS total_lecturas,
        COALESCE(AVG(lm.lectura), 0) AS consumo_promedio,
        0 AS total_alertas,
        0 AS alertas_activas
      FROM medidor m
      LEFT JOIN lectura_medidor lm ON m.id = lm.medidor_id
      WHERE m.comunidad_id = ?
      GROUP BY m.tipo
      ORDER BY total_medidores DESC
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
 * /api/medidores/comunidad/{comunidadId}/estadisticas/edificio:
 *   get:
 *     tags: [Medidores]
 *     summary: Estadísticas por edificio
 */
router.get('/comunidad/:comunidadId/estadisticas/edificio', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        e.nombre AS edificio,
        COUNT(DISTINCT m.id) AS total_medidores,
        COUNT(DISTINCT m.id) AS medidores_activos,
        COUNT(DISTINCT CASE WHEN m.tipo = 'electricidad' THEN m.id END) AS electricos,
        COUNT(DISTINCT CASE WHEN m.tipo = 'agua' THEN m.id END) AS agua,
        COUNT(DISTINCT CASE WHEN m.tipo = 'gas' THEN m.id END) AS gas,
        0 AS alertas_activas
      FROM edificio e
      LEFT JOIN unidad u ON e.id = u.edificio_id
      LEFT JOIN medidor m ON u.id = m.unidad_id
      WHERE e.comunidad_id = ?
        AND m.id IS NOT NULL
      GROUP BY e.id, e.nombre
      ORDER BY total_medidores DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por edificio:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por edificio' });
  }
});

// =========================================
// 4. EXPORTACIÓN
// =========================================

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/export:
 *   get:
 *     tags: [Medidores]
 *     summary: Exportar medidores a CSV/Excel
 */
router.get('/comunidad/:comunidadId/export', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { type } = req.query;

    const query = `
      SELECT
        m.id AS 'ID',
        m.codigo AS 'Código',
        NULL AS 'Número Serie',
        CASE m.tipo
          WHEN 'electricidad' THEN 'Eléctrico'
          WHEN 'agua' THEN 'Agua'
          WHEN 'gas' THEN 'Gas'
          ELSE 'Otro'
        END AS 'Tipo',
        'Activo' AS 'Estado',
        NULL AS 'Marca',
        NULL AS 'Modelo',
        e.nombre AS 'Edificio',
        u.codigo AS 'Unidad',
        NULL AS 'Posición',
        c.razon_social AS 'Comunidad',
        NULL AS 'Capacidad',
        NULL AS 'Precisión',
        NULL AS 'Fecha Instalación',
        NULL AS 'Técnico Instalador',
        NULL AS 'Empresa Instaladora',
        NULL AS 'Fecha Garantía',
        COALESCE(ul.lectura, 0.0) AS 'Última Lectura',
        DATE_FORMAT(ul.fecha, '%d/%m/%Y') AS 'Fecha Última Lectura',
        NULL AS 'Último Consumo',
        NULL AS 'Último Mantenimiento',
        NULL AS 'Próximo Mantenimiento',
        0 AS 'Alertas Activas',
        DATE_FORMAT(m.created_at, '%d/%m/%Y %H:%i') AS 'Fecha Creación',
        DATE_FORMAT(m.updated_at, '%d/%m/%Y %H:%i') AS 'Última Modificación'
      FROM medidor m
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      LEFT JOIN (
        SELECT lm.medidor_id, lm.lectura, lm.fecha
        FROM lectura_medidor lm
        INNER JOIN (
          SELECT medidor_id, MAX(fecha) AS max_fecha
          FROM lectura_medidor
          GROUP BY medidor_id
        ) AS lm_max ON lm.medidor_id = lm_max.medidor_id AND lm.fecha = lm_max.max_fecha
      ) AS ul ON m.id = ul.medidor_id
      WHERE m.comunidad_id = ?
        AND (? IS NULL OR m.tipo = ?)
      ORDER BY c.razon_social ASC, e.nombre ASC, u.codigo ASC
    `;

    const [rows] = await db.query(query, [comunidadId, type || null, type || null]);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar medidores:', error);
    res.status(500).json({ error: 'Error al exportar medidores' });
  }
});

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/export/lecturas:
 *   get:
 *     tags: [Medidores]
 *     summary: Exportar lecturas de medidores
 */
router.get('/comunidad/:comunidadId/export/lecturas', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { medidor_id, fecha_desde, fecha_hasta } = req.query;

    const query = `
      SELECT
        m.codigo AS 'Código Medidor',
        NULL AS 'Número Serie',
        e.nombre AS 'Edificio',
        u.codigo AS 'Unidad',
        DATE_FORMAT(lm.fecha, '%d/%m/%Y %H:%i') AS 'Fecha Lectura',
        lm.lectura AS 'Valor',
        NULL AS 'Consumo',
        'Manual' AS 'Método',
        'Confirmada' AS 'Estado',
        'Sistema' AS 'Usuario',
        NULL AS 'Observaciones'
      FROM medidor m
      INNER JOIN lectura_medidor lm ON m.id = lm.medidor_id
      LEFT JOIN unidad u ON m.unidad_id = u.id
      LEFT JOIN edificio e ON u.edificio_id = e.id
      WHERE m.comunidad_id = ?
        AND (? IS NULL OR m.id = ?)
        AND (? IS NULL OR lm.fecha >= ?)
        AND (? IS NULL OR lm.fecha <= ?)
      ORDER BY m.codigo ASC, lm.fecha DESC
    `;

    const [rows] = await db.query(query, [
      comunidadId,
      medidor_id || null, medidor_id || null,
      fecha_desde || null, fecha_desde || null,
      fecha_hasta || null, fecha_hasta || null
    ]);

    res.json(rows);
  } catch (error) {
    console.error('Error al exportar lecturas:', error);
    res.status(500).json({ error: 'Error al exportar lecturas' });
  }
});

// =========================================
// 5. VALIDACIONES
// =========================================

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/validar/lecturas-inconsistentes:
 *   get:
 *     tags: [Medidores]
 *     summary: Validar lecturas inconsistentes
 */
router.get('/comunidad/:comunidadId/validar/lecturas-inconsistentes', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        m.id,
        m.codigo AS code,
        lm.fecha,
        lm.lectura AS current_value,
        LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha) AS previous_value,
        (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) AS difference,
        CASE
          WHEN (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) < 0
          THEN 'Lectura menor que anterior'
          WHEN (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) > 10000
          THEN 'Consumo excesivo (Umbral 10000)'
          ELSE 'Normal'
        END AS validation_status
      FROM medidor m
      INNER JOIN lectura_medidor lm ON m.id = lm.medidor_id
      WHERE m.comunidad_id = ?
      ORDER BY m.id, lm.fecha DESC
    `;

    const [rows] = await db.query(query, [comunidadId]);

    // Filtrar solo las inconsistentes
    const inconsistentes = rows.filter(r => r.validation_status !== 'Normal');

    res.json(inconsistentes);
  } catch (error) {
    console.error('Error al validar lecturas inconsistentes:', error);
    res.status(500).json({ error: 'Error al validar lecturas' });
  }
});

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}/validar/integridad:
 *   get:
 *     tags: [Medidores]
 *     summary: Verificar integridad de datos
 */
router.get('/comunidad/:comunidadId/validar/integridad', authenticate, requireCommunity('comunidadId', ['admin', 'superadmin']), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);

    const query = `
      SELECT
        'medidor' AS tabla,
        COUNT(*) AS total_registros,
        COUNT(CASE WHEN m.codigo IS NULL OR m.codigo = '' THEN 1 END) AS codigo_nulo,
        0 AS numero_serie_nulo,
        COUNT(CASE WHEN m.tipo NOT IN ('electricidad','agua','gas') THEN 1 END) AS tipo_invalido,
        0 AS activo_invalido,
        COUNT(CASE WHEN m.unidad_id IS NULL THEN 1 END) AS unidad_id_nula,
        COUNT(CASE WHEN m.comunidad_id IS NULL THEN 1 END) AS comunidad_id_nula
      FROM medidor m
      WHERE m.comunidad_id = ?
    `;

    const [[integridad]] = await db.query(query, [comunidadId]);

    res.json(integridad);
  } catch (error) {
    console.error('Error al verificar integridad:', error);
    res.status(500).json({ error: 'Error al verificar integridad' });
  }
});

// =========================================
// 6. CRUD BÁSICO
// =========================================

/**
 * @openapi
 * /api/medidores/comunidad/{comunidadId}:
 *   post:
 *     tags: [Medidores]
 *     summary: Crear nuevo medidor
 */
router.post('/comunidad/:comunidadId', [
  authenticate,
  requireCommunity('comunidadId', ['admin', 'superadmin']),
  body('tipo').notEmpty().isIn(['electricidad', 'agua', 'gas']),
  body('codigo').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comunidadId = Number(req.params.comunidadId);
    const { unidad_id, tipo, codigo, es_compartido } = req.body;

    const [result] = await db.query(
      'INSERT INTO medidor (comunidad_id, unidad_id, tipo, codigo, es_compartido) VALUES (?,?,?,?,?)',
      [comunidadId, unidad_id || null, tipo, codigo, es_compartido ? 1 : 0]
    );

    const [row] = await db.query('SELECT * FROM medidor WHERE id = ? LIMIT 1', [result.insertId]);

    res.status(201).json(row[0]);
  } catch (error) {
    console.error('Error al crear medidor:', error);
    res.status(500).json({ error: 'Error al crear medidor' });
  }
});

/**
 * @openapi
 * /api/medidores/{id}:
 *   patch:
 *     tags: [Medidores]
 *     summary: Actualizar medidor
 */
router.patch('/:id', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fields = ['unidad_id', 'tipo', 'codigo', 'es_compartido'];
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
    await db.query(`UPDATE medidor SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await db.query('SELECT * FROM medidor WHERE id = ? LIMIT 1', [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar medidor:', error);
    res.status(500).json({ error: 'Error al actualizar medidor' });
  }
});

/**
 * @openapi
 * /api/medidores/{id}:
 *   delete:
 *     tags: [Medidores]
 *     summary: Eliminar medidor
 */
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);

    await db.query('DELETE FROM medidor WHERE id = ?', [id]);

    res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar medidor:', error);
    res.status(500).json({ error: 'Error al eliminar medidor' });
  }
});

// =========================================
// 7. GESTIÓN DE LECTURAS
// =========================================

/**
 * @openapi
 * /api/medidores/{id}/lecturas:
 *   get:
 *     tags: [Medidores]
 *     summary: Listar lecturas de un medidor
 */
router.get('/:id/lecturas', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { limit = 200 } = req.query;

    const [rows] = await db.query(
      'SELECT id, fecha, lectura, periodo FROM lectura_medidor WHERE medidor_id = ? ORDER BY fecha DESC LIMIT ?',
      [id, Number(limit)]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error al listar lecturas:', error);
    res.status(500).json({ error: 'Error al listar lecturas' });
  }
});

/**
 * @openapi
 * /api/medidores/{id}/lecturas:
 *   post:
 *     tags: [Medidores]
 *     summary: Crear lectura de medidor
 */
router.post('/:id/lecturas', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('fecha').notEmpty(),
  body('lectura').notEmpty().isNumeric(),
  body('periodo').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = Number(req.params.id);
    const { fecha, lectura, periodo } = req.body;

    const [result] = await db.query(
      'INSERT INTO lectura_medidor (medidor_id, fecha, lectura, periodo) VALUES (?,?,?,?)',
      [id, fecha, lectura, periodo]
    );

    const [row] = await db.query('SELECT id, fecha, lectura, periodo FROM lectura_medidor WHERE id = ? LIMIT 1', [result.insertId]);

    res.status(201).json(row[0]);
  } catch (error) {
    console.error('Error al crear lectura:', error);
    res.status(500).json({ error: 'Error al crear lectura' });
  }
});

/**
 * @openapi
 * /api/medidores/{id}/consumos:
 *   get:
 *     tags: [Medidores]
 *     summary: Calcular consumos entre periodos
 */
router.get('/:id/consumos', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Se requieren parámetros desde y hasta' });
    }

    const query = `
      SELECT
        lm1.periodo AS periodo_inicio,
        lm2.periodo AS periodo_fin,
        lm1.lectura AS lectura_inicial,
        lm2.lectura AS lectura_final,
        (lm2.lectura - lm1.lectura) AS consumo,
        lm1.fecha AS fecha_inicial,
        lm2.fecha AS fecha_final,
        DATEDIFF(lm2.fecha, lm1.fecha) AS dias_transcurridos
      FROM lectura_medidor lm1
      INNER JOIN lectura_medidor lm2 ON lm1.medidor_id = lm2.medidor_id
      WHERE lm1.medidor_id = ?
        AND lm1.periodo = ?
        AND lm2.periodo = ?
    `;

    const [rows] = await db.query(query, [id, desde, hasta]);

    if (!rows.length) {
      return res.status(404).json({ error: 'No se encontraron lecturas para los periodos especificados' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al calcular consumos:', error);
    res.status(500).json({ error: 'Error al calcular consumos' });
  }
});

module.exports = router;


// =========================================
// ENDPOINTS DE MEDIDORES
// =========================================

// // 1. LISTADOS Y FILTROS
// GET: /medidores/comunidad/:comunidadId
// GET: /medidores/comunidad/:comunidadId/search

// // 2. VISTA DETALLADA
// GET: /medidores/:id

// // 3. ESTADÍSTICAS
// GET: /medidores/comunidad/:comunidadId/estadisticas
// GET: /medidores/comunidad/:comunidadId/estadisticas/tipo
// GET: /medidores/comunidad/:comunidadId/estadisticas/edificio

// // 4. EXPORTACIÓN
// GET: /medidores/comunidad/:comunidadId/export
// GET: /medidores/comunidad/:comunidadId/export/lecturas

// // 5. VALIDACIONES
// GET: /medidores/comunidad/:comunidadId/validar/lecturas-inconsistentes
// GET: /medidores/comunidad/:comunidadId/validar/integridad

// // 6. CRUD BÁSICO
// POST: /medidores/comunidad/:comunidadId
// PATCH: /medidores/:id
// DELETE: /medidores/:id

// // 7. GESTIÓN DE LECTURAS
// GET: /medidores/:id/lecturas
// POST: /medidores/:id/lecturas
// GET: /medidores/:id/consumos