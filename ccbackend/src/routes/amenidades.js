const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// =========================================
// 1. LISTADOS BÁSICOS CON FILTROS
// =========================================

/**
 * @swagger
 * /amenidades:
 *   get:
 *     tags: [Amenidades]
 *     summary: Listado básico de amenidades con filtros avanzados
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *       - in: query
 *         name: requiere_aprobacion
 *       - in: query
 *         name: capacidad_min
 *       - in: query
 *         name: capacidad_max
 *       - in: query
 *         name: tarifa_min
 *       - in: query
 *         name: tarifa_max
 *       - in: query
 *         name: limit
 *       - in: query
 *         name: offset
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      comunidad_id,
      requiere_aprobacion,
      capacidad_min,
      capacidad_max,
      tarifa_min,
      tarifa_max,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT
        a.id,
        a.nombre,
        c.razon_social AS comunidad,
        a.reglas,
        a.capacidad,
        a.requiere_aprobacion,
        a.tarifa,
        a.created_at,
        a.updated_at,
        (
          SELECT COUNT(r.id)
          FROM reserva_amenidad r
          WHERE r.amenidad_id = a.id
            AND r.estado IN ('solicitada', 'aprobada')
        ) AS reservas_activas,
        CASE
          WHEN a.capacidad > 0 AND (
            SELECT COUNT(r.id)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id AND r.estado IN ('solicitada', 'aprobada', 'cumplida')
          ) < a.capacidad THEN 'Disponible'
          WHEN a.capacidad = 0 THEN 'No aplica'
          ELSE 'Ocupada'
        END AS estado_disponibilidad
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND a.comunidad_id = ?';
      params.push(comunidad_id);
    }
    if (requiere_aprobacion !== undefined) {
      query += ' AND a.requiere_aprobacion = ?';
      params.push(requiere_aprobacion);
    }
    if (capacidad_min) {
      query += ' AND a.capacidad >= ?';
      params.push(capacidad_min);
    }
    if (capacidad_max) {
      query += ' AND a.capacidad <= ?';
      params.push(capacidad_max);
    }
    if (tarifa_min) {
      query += ' AND a.tarifa >= ?';
      params.push(tarifa_min);
    }
    if (tarifa_max) {
      query += ' AND a.tarifa <= ?';
      params.push(tarifa_max);
    }

    query += ' ORDER BY c.razon_social, a.nombre ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener amenidades:', err);
    res.status(500).json({ error: 'Error al obtener amenidades' });
  }
});

/**
 * @swagger
 * /amenidades/por-comunidad:
 *   get:
 *     tags: [Amenidades]
 *     summary: Estadísticas de amenidades agrupadas por comunidad
 */
router.get('/por-comunidad', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        c.razon_social AS comunidad,
        COUNT(a.id) AS total_amenidades,
        COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
        COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) AS con_tarifa,
        SUM(a.capacidad) AS capacidad_total,
        AVG(a.tarifa) AS tarifa_promedio
      FROM comunidad c
      LEFT JOIN amenidad a ON c.id = a.comunidad_id
      GROUP BY c.id, c.razon_social
      ORDER BY c.razon_social
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener estadísticas de amenidades:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * @swagger
 * /amenidades/disponibles:
 *   get:
 *     tags: [Amenidades]
 *     summary: Amenidades disponibles (sin reservas activas en este momento)
 */
router.get('/disponibles', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.nombre,
        c.razon_social AS comunidad,
        a.capacidad,
        a.tarifa,
        a.reglas
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      WHERE
        a.capacidad > 0 AND
        NOT EXISTS (
          SELECT 1
          FROM reserva_amenidad r
          WHERE r.amenidad_id = a.id
            AND r.estado IN ('solicitada', 'aprobada')
            AND r.inicio <= NOW()
            AND r.fin >= NOW()
        )
      ORDER BY c.razon_social, a.nombre
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener amenidades disponibles:', err);
    res.status(500).json({ error: 'Error al obtener amenidades disponibles' });
  }
});

// =========================================
// 2. VISTAS DETALLADAS
// =========================================

/**
 * @swagger
 * /amenidades/{id}/detalle:
 *   get:
 *     tags: [Amenidades]
 *     summary: Vista detallada de una amenidad con estadísticas de uso
 */
router.get('/:id/detalle', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        a.id,
        a.nombre,
        c.razon_social AS comunidad,
        c.direccion AS direccion_comunidad,
        a.reglas,
        a.capacidad,
        a.requiere_aprobacion,
        a.tarifa,
        a.created_at,
        a.updated_at,
        CASE
          WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación'
          ELSE 'Reserva directa'
        END AS tipo_reserva,
        CASE
          WHEN a.tarifa > 0 THEN CONCAT('Costo: $', FORMAT(a.tarifa, 0))
          ELSE 'Gratuito'
        END AS costo,
        JSON_OBJECT(
          'reservas_mes_actual', (
            SELECT COUNT(r.id)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id
              AND YEAR(r.inicio) = YEAR(NOW()) AND MONTH(r.inicio) = MONTH(NOW())
          ),
          'reservas_mes_anterior', (
            SELECT COUNT(r.id)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id
              AND YEAR(r.inicio) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
              AND MONTH(r.inicio) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
          ),
          'ingresos_mes_actual', (
            SELECT SUM(a.tarifa)
            FROM reserva_amenidad r
            WHERE r.amenidad_id = a.id
              AND YEAR(r.created_at) = YEAR(NOW()) AND MONTH(r.created_at) = MONTH(NOW())
              AND r.estado IN ('aprobada', 'cumplida')
          )
        ) AS estadisticas_uso
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      WHERE a.id = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Amenidad no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener detalle de amenidad:', err);
    res.status(500).json({ error: 'Error al obtener detalle de amenidad' });
  }
});

/**
 * @swagger
 * /amenidades/completas:
 *   get:
 *     tags: [Amenidades]
 *     summary: Amenidades con información completa en JSON
 */
router.get('/completas', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.nombre,
        c.razon_social AS comunidad,
        a.reglas,
        a.capacidad,
        a.requiere_aprobacion,
        a.tarifa,
        JSON_OBJECT(
          'comunidad_info', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social,
            'direccion', c.direccion,
            'email', c.email_contacto,
            'telefono', c.telefono_contacto
          ),
          'configuracion', JSON_OBJECT(
            'requiere_aprobacion', a.requiere_aprobacion,
            'capacidad', a.capacidad,
            'tarifa', a.tarifa,
            'reglas', a.reglas
          ),
          'fechas', JSON_OBJECT(
            'creado', a.created_at,
            'actualizado', a.updated_at
          )
        ) AS informacion_completa
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      ORDER BY c.razon_social, a.nombre
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener información completa de amenidades:', err);
    res.status(500).json({ error: 'Error al obtener información completa' });
  }
});

// =========================================
// 3. ESTADÍSTICAS
// =========================================

/**
 * @swagger
 * /amenidades/estadisticas/generales:
 *   get:
 *     tags: [Amenidades]
 *     summary: Estadísticas generales de amenidades
 */
router.get('/estadisticas/generales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_amenidades,
        COUNT(DISTINCT comunidad_id) AS comunidades_con_amenidades,
        SUM(capacidad) AS capacidad_total,
        AVG(capacidad) AS capacidad_promedio,
        COUNT(CASE WHEN requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
        COUNT(CASE WHEN tarifa > 0 THEN 1 END) AS amenidades_con_costo,
        COUNT(CASE WHEN tarifa = 0 THEN 1 END) AS amenidades_gratuitas,
        AVG(CASE WHEN tarifa > 0 THEN tarifa END) AS tarifa_promedio_costo,
        MIN(tarifa) AS tarifa_minima,
        MAX(tarifa) AS tarifa_maxima
      FROM amenidad
    `;

    const [rows] = await db.query(query);
    res.json(rows[0]);
  } catch (err) {
    console.error(
      'Error al obtener estadísticas generales de amenidades:',
      err
    );
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

/**
 * @swagger
 * /amenidades/estadisticas/comunidad:
 *   get:
 *     tags: [Amenidades]
 *     summary: Estadísticas detalladas por comunidad
 */
router.get('/estadisticas/comunidad', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        c.razon_social AS comunidad,
        COUNT(a.id) AS num_amenidades,
        SUM(a.capacidad) AS capacidad_total,
        AVG(a.tarifa) AS tarifa_promedio,
        COUNT(CASE WHEN a.requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion,
        COUNT(CASE WHEN a.tarifa > 0 THEN 1 END) AS con_costo,
        SUM(CASE WHEN a.tarifa > 0 THEN a.tarifa ELSE 0 END) AS ingresos_potenciales
      FROM comunidad c
      LEFT JOIN amenidad a ON c.id = a.comunidad_id
      GROUP BY c.id, c.razon_social
      ORDER BY c.razon_social
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(
      'Error al obtener estadísticas de amenidades por comunidad:',
      err
    );
    res
      .status(500)
      .json({ error: 'Error al obtener estadísticas por comunidad' });
  }
});

/**
 * @swagger
 * /amenidades/estadisticas/tipo:
 *   get:
 *     tags: [Amenidades]
 *     summary: Estadísticas por tipo de amenidad
 */
router.get('/estadisticas/tipo', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        CASE
          WHEN LOWER(nombre) LIKE '%piscina%' THEN 'Piscina'
          WHEN LOWER(nombre) LIKE '%gimnasio%' OR LOWER(nombre) LIKE '%gym%' THEN 'Gimnasio'
          WHEN LOWER(nombre) LIKE '%quincho%' OR LOWER(nombre) LIKE '%parrilla%' THEN 'Quincho'
          WHEN LOWER(nombre) LIKE '%salón%' OR LOWER(nombre) LIKE '%sala%' THEN 'Salón'
          WHEN LOWER(nombre) LIKE '%terraza%' THEN 'Terraza'
          WHEN LOWER(nombre) LIKE '%lavandería%' THEN 'Lavandería'
          ELSE 'Otros'
        END AS tipo_amenidad,
        COUNT(*) AS cantidad,
        AVG(capacidad) AS capacidad_promedio,
        AVG(tarifa) AS tarifa_promedio,
        COUNT(CASE WHEN requiere_aprobacion = 1 THEN 1 END) AS requieren_aprobacion
      FROM amenidad
      GROUP BY tipo_amenidad
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener estadísticas de amenidades por tipo:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas por tipo' });
  }
});

// =========================================
// 4. BÚSQUEDAS FILTRADAS
// =========================================

/**
 * @swagger
 * /amenidades/buscar:
 *   get:
 *     tags: [Amenidades]
 *     summary: Búsqueda avanzada de amenidades
 */
router.get('/buscar', authenticate, async (req, res) => {
  try {
    const {
      busqueda,
      comunidad_id,
      requiere_aprobacion,
      capacidad_min,
      tarifa_min,
      tarifa_max,
      tipo_amenidad,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT
        a.id,
        a.nombre,
        c.razon_social AS comunidad,
        a.capacidad,
        a.requiere_aprobacion,
        a.tarifa,
        a.reglas,
        CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Directa' END AS tipo_reserva,
        CASE WHEN a.tarifa > 0 THEN 'Con costo' ELSE 'Gratuito' END AS tipo_costo
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (busqueda) {
      query += ' AND (a.nombre LIKE ? OR a.reglas LIKE ?)';
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }
    if (comunidad_id) {
      query += ' AND a.comunidad_id = ?';
      params.push(comunidad_id);
    }
    if (requiere_aprobacion !== undefined) {
      query += ' AND a.requiere_aprobacion = ?';
      params.push(requiere_aprobacion);
    }
    if (capacidad_min) {
      query += ' AND a.capacidad >= ?';
      params.push(capacidad_min);
    }
    if (tarifa_min) {
      query += ' AND a.tarifa >= ?';
      params.push(tarifa_min);
    }
    if (tarifa_max) {
      query += ' AND a.tarifa <= ?';
      params.push(tarifa_max);
    }
    if (tipo_amenidad) {
      const tipoConditions = {
        piscina: "LOWER(a.nombre) LIKE '%piscina%'",
        gimnasio:
          "(LOWER(a.nombre) LIKE '%gimnasio%' OR LOWER(a.nombre) LIKE '%gym%')",
        quincho:
          "(LOWER(a.nombre) LIKE '%quincho%' OR LOWER(a.nombre) LIKE '%parrilla%')",
        salon:
          "(LOWER(a.nombre) LIKE '%salón%' OR LOWER(a.nombre) LIKE '%sala%')",
        terraza: "LOWER(a.nombre) LIKE '%terraza%'",
        lavanderia: "LOWER(a.nombre) LIKE '%lavandería%'",
      };

      if (tipoConditions[tipo_amenidad]) {
        query += ` AND ${tipoConditions[tipo_amenidad]}`;
      }
    }

    query += ' ORDER BY c.razon_social, a.nombre ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en búsqueda avanzada de amenidades:', err);
    res.status(500).json({ error: 'Error en búsqueda avanzada' });
  }
});

/**
 * @swagger
 * /amenidades/por-capacidad:
 *   get:
 *     tags: [Amenidades]
 *     summary: Amenidades agrupadas por rango de capacidad
 */
router.get('/por-capacidad', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        CASE
          WHEN capacidad <= 5 THEN 'Pequeña (1-5 personas)'
          WHEN capacidad <= 15 THEN 'Mediana (6-15 personas)'
          WHEN capacidad <= 30 THEN 'Grande (16-30 personas)'
          ELSE 'Muy grande (31+ personas)'
        END AS rango_capacidad,
        COUNT(*) AS cantidad_amenidades,
        AVG(tarifa) AS tarifa_promedio,
        MIN(capacidad) AS capacidad_minima,
        MAX(capacidad) AS capacidad_maxima
      FROM amenidad
      GROUP BY rango_capacidad
      ORDER BY capacidad_minima
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al agrupar amenidades por capacidad:', err);
    res.status(500).json({ error: 'Error al agrupar por capacidad' });
  }
});

/**
 * @swagger
 * /amenidades/por-tarifa:
 *   get:
 *     tags: [Amenidades]
 *     summary: Amenidades agrupadas por rango de tarifa
 */
router.get('/por-tarifa', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        CASE
          WHEN tarifa = 0 THEN 'Gratuito'
          WHEN tarifa <= 5000 THEN 'Económico (hasta $5.000)'
          WHEN tarifa <= 15000 THEN 'Medio ($5.001-$15.000)'
          WHEN tarifa <= 30000 THEN 'Caro ($15.001-$30.000)'
          ELSE 'Muy caro (más de $30.000)'
        END AS rango_tarifa,
        COUNT(*) AS cantidad_amenidades,
        AVG(capacidad) AS capacidad_promedio,
        MIN(tarifa) AS tarifa_minima,
        MAX(tarifa) AS tarifa_maxima
      FROM amenidad
      GROUP BY rango_tarifa
      ORDER BY tarifa_minima
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al agrupar amenidades por tarifa:', err);
    res.status(500).json({ error: 'Error al agrupar por tarifa' });
  }
});

// =========================================
// 5. EXPORTACIONES
// =========================================

/**
 * @swagger
 * /amenidades/exportar/completo:
 *   get:
 *     tags: [Amenidades]
 *     summary: Exportación completa para Excel/CSV
 */
router.get(
  '/exportar/completo',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        a.id AS 'ID',
        a.nombre AS 'Nombre Amenidad',
        c.razon_social AS 'Comunidad',
        c.direccion AS 'Dirección Comunidad',
        a.capacidad AS 'Capacidad',
        CASE WHEN a.requiere_aprobacion = 1 THEN 'Sí' ELSE 'No' END AS 'Requiere Aprobación',
        a.tarifa AS 'Tarifa',
        a.reglas AS 'Reglas',
        DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(a.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización'
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      ORDER BY c.razon_social, a.nombre
    `;

      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      console.error('Error al exportar datos de amenidades:', err);
      res.status(500).json({ error: 'Error al exportar datos' });
    }
  }
);

/**
 * @swagger
 * /amenidades/exportar/estadisticas:
 *   get:
 *     tags: [Amenidades]
 *     summary: Exportación con estadísticas de uso
 */
router.get(
  '/exportar/estadisticas',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        c.razon_social AS 'Comunidad',
        a.nombre AS 'Amenidad',
        a.capacidad AS 'Capacidad',
        a.tarifa AS 'Tarifa',
        CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación' ELSE 'Reserva directa' END AS 'Tipo Reserva',
        (
          SELECT COUNT(r.id)
          FROM reserva_amenidad r
          WHERE r.amenidad_id = a.id
            AND r.estado IN ('solicitada', 'aprobada')
            AND r.inicio <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
            AND r.fin >= CURDATE()
        ) AS 'Reservas Activas',
        (
          SELECT COUNT(r.id)
          FROM reserva_amenidad r
          WHERE r.amenidad_id = a.id
            AND YEAR(r.inicio) = YEAR(NOW()) AND MONTH(r.inicio) = MONTH(NOW())
        ) AS 'Reservas Mes Actual',
        (
          SELECT SUM(a.tarifa)
          FROM reserva_amenidad r
          WHERE r.amenidad_id = a.id
            AND YEAR(r.created_at) = YEAR(NOW()) AND MONTH(r.created_at) = MONTH(NOW())
            AND r.estado IN ('aprobada', 'cumplida')
        ) AS 'Ingresos Mes Actual'
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      ORDER BY c.razon_social, a.nombre
    `;

      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      console.error('Error al exportar estadísticas de amenidades:', err);
      res.status(500).json({ error: 'Error al exportar estadísticas' });
    }
  }
);

/**
 * @swagger
 * /amenidades/exportar/reglas:
 *   get:
 *     tags: [Amenidades]
 *     summary: Exportación de reglas de amenidades
 */
router.get('/exportar/reglas', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        a.nombre AS 'Amenidad',
        c.razon_social AS 'Comunidad',
        a.reglas AS 'Reglas de Uso',
        a.capacidad AS 'Capacidad Máxima',
        CASE WHEN a.requiere_aprobacion = 1 THEN 'Requiere aprobación previa' ELSE 'Reserva directa disponible' END AS 'Tipo de Reserva'
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      WHERE a.reglas IS NOT NULL AND a.reglas != ''
      ORDER BY c.razon_social, a.nombre
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al exportar reglas de amenidades:', err);
    res.status(500).json({ error: 'Error al exportar reglas' });
  }
});

// =========================================
// 6. VALIDACIONES
// =========================================

/**
 * @swagger
 * /amenidades/validar/integridad:
 *   get:
 *     tags: [Amenidades]
 *     summary: Validar integridad de datos de amenidades
 */
router.get(
  '/validar/integridad',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        'Amenidades sin comunidad' AS validacion,
        COUNT(*) AS cantidad
      FROM amenidad a
      LEFT JOIN comunidad c ON a.comunidad_id = c.id
      WHERE c.id IS NULL
      UNION ALL
      SELECT
        'Amenidades con capacidad cero o negativa' AS validacion,
        COUNT(*) AS cantidad
      FROM amenidad
      WHERE capacidad <= 0
      UNION ALL
      SELECT
        'Amenidades con tarifa negativa' AS validacion,
        COUNT(*) AS cantidad
      FROM amenidad
      WHERE tarifa < 0
      UNION ALL
      SELECT
        'Amenidades sin nombre' AS validacion,
        COUNT(*) AS cantidad
      FROM amenidad
      WHERE nombre IS NULL OR nombre = ''
      UNION ALL
      SELECT
        'Comunidades sin amenidades' AS validacion,
        COUNT(*) AS cantidad
      FROM comunidad c
      WHERE NOT EXISTS (SELECT 1 FROM amenidad a WHERE a.comunidad_id = c.id)
    `;

      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      console.error('Error al validar integridad de amenidades:', err);
      res.status(500).json({ error: 'Error al validar integridad' });
    }
  }
);

/**
 * @swagger
 * /amenidades/validar/duplicados:
 *   get:
 *     tags: [Amenidades]
 *     summary: Validar nombres duplicados en misma comunidad
 */
router.get(
  '/validar/duplicados',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        c.razon_social AS comunidad,
        a.nombre,
        COUNT(*) AS cantidad_duplicados
      FROM amenidad a
      JOIN comunidad c ON a.comunidad_id = c.id
      GROUP BY c.id, c.razon_social, a.nombre
      HAVING COUNT(*) > 1
      ORDER BY c.razon_social, a.nombre
    `;

      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      console.error('Error al validar duplicados de amenidades:', err);
      res.status(500).json({ error: 'Error al validar duplicados' });
    }
  }
);

/**
 * @swagger
 * /amenidades/validar/anomalias:
 *   get:
 *     tags: [Amenidades]
 *     summary: Validar rangos de capacidad y tarifa razonables
 */
router.get(
  '/validar/anomalias',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        'Capacidades extremas' AS validacion,
        COUNT(*) AS cantidad_anomalias,
        GROUP_CONCAT(CONCAT(a.nombre, ' (', a.capacidad, ')') SEPARATOR '; ') AS detalles
      FROM amenidad a
      WHERE a.capacidad < 1 OR a.capacidad > 200
      UNION ALL
      SELECT
        'Tarifas potencialmente erróneas' AS validacion,
        COUNT(*) AS cantidad_anomalias,
        GROUP_CONCAT(CONCAT(a.nombre, ' ($', FORMAT(a.tarifa, 0), ')') SEPARATOR '; ') AS detalles
      FROM amenidad a
      WHERE a.tarifa > 100000 OR (a.tarifa > 0 AND a.tarifa < 100)
    `;

      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      console.error('Error al validar anomalías de amenidades:', err);
      res.status(500).json({ error: 'Error al validar anomalías' });
    }
  }
);

// =========================================
// 7. CRUD BÁSICO POR COMUNIDAD
// =========================================

/**
 * @swagger
 * /amenidades/comunidad/{comunidadId}:
 *   get:
 *     tags: [Amenidades]
 *     summary: Listar amenidades de una comunidad
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const [rows] = await db.query(
        'SELECT id, nombre, reglas, capacidad, requiere_aprobacion, tarifa, created_at, updated_at FROM amenidad WHERE comunidad_id = ? ORDER BY nombre',
        [comunidadId]
      );
      res.json(rows);
    } catch (err) {
      console.error('Error al obtener amenidades de comunidad:', err);
      res.status(500).json({ error: 'Error al obtener amenidades' });
    }
  }
);

/**
 * @swagger
 * /amenidades/comunidad/{comunidadId}:
 *   post:
 *     tags: [Amenidades]
 *     summary: Crear amenidad (admin de comunidad)
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin']),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('capacidad').optional().isInt({ min: 0 }),
    body('tarifa').optional().isNumeric({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, reglas, capacidad, requiere_aprobacion, tarifa } =
        req.body;

      const [result] = await db.query(
        'INSERT INTO amenidad (comunidad_id, nombre, reglas, capacidad, requiere_aprobacion, tarifa) VALUES (?,?,?,?,?,?)',
        [
          comunidadId,
          nombre,
          reglas || null,
          capacidad || null,
          requiere_aprobacion ? 1 : 0,
          tarifa || null,
        ]
      );

      const [row] = await db.query('SELECT * FROM amenidad WHERE id = ?', [
        result.insertId,
      ]);
      res.status(201).json(row[0]);
    } catch (err) {
      console.error('Error al crear amenidad:', err);
      res.status(500).json({ error: 'Error al crear amenidad' });
    }
  }
);

/**
 * @swagger
 * /amenidades/{id}:
 *   get:
 *     tags: [Amenidades]
 *     summary: Obtener una amenidad específica
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM amenidad WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Amenidad no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener amenidad:', err);
    res.status(500).json({ error: 'Error al obtener amenidad' });
  }
});

/**
 * @swagger
 * /amenidades/{id}:
 *   patch:
 *     tags: [Amenidades]
 *     summary: Actualizar amenidad
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const fields = [
        'nombre',
        'reglas',
        'capacidad',
        'requiere_aprobacion',
        'tarifa',
      ];
      const updates = [];
      const values = [];

      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      });

      if (!updates.length) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      await db.query(
        `UPDATE amenidad SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const [rows] = await db.query('SELECT * FROM amenidad WHERE id = ?', [
        id,
      ]);
      res.json(rows[0]);
    } catch (err) {
      console.error('Error al actualizar amenidad:', err);
      res.status(500).json({ error: 'Error al actualizar amenidad' });
    }
  }
);

/**
 * @swagger
 * /amenidades/{id}:
 *   delete:
 *     tags: [Amenidades]
 *     summary: Eliminar amenidad
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM amenidad WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error('Error al eliminar amenidad:', err);
      res.status(500).json({ error: 'Error al eliminar amenidad' });
    }
  }
);

// =========================================
// 8. RESERVAS DE AMENIDADES
// =========================================

/**
 * @swagger
 * /amenidades/{id}/reservas:
 *   get:
 *     tags: [Amenidades]
 *     summary: Listar reservas de una amenidad
 */
router.get('/:id/reservas', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        r.id, 
        r.inicio, 
        r.fin, 
        r.estado, 
        r.unidad_id,
        r.persona_id,
        r.created_at
      FROM reserva_amenidad r
      WHERE r.amenidad_id = ?
      ORDER BY r.inicio DESC
      LIMIT 200`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

/**
 * @swagger
 * /amenidades/{id}/reservas:
 *   post:
 *     tags: [Amenidades]
 *     summary: Crear reserva de amenidad
 */
router.post(
  '/:id/reservas',
  [
    authenticate,
    body('unidad_id').isInt(),
    body('persona_id').isInt(),
    body('inicio').notEmpty(),
    body('fin').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { unidad_id, persona_id, inicio, fin } = req.body;

      const [result] = await db.query(
        `INSERT INTO reserva_amenidad (comunidad_id, amenidad_id, unidad_id, persona_id, inicio, fin)
         SELECT comunidad_id, ?, ?, ?, ?, ?
         FROM amenidad
         WHERE id = ?`,
        [id, unidad_id, persona_id, inicio, fin, id]
      );

      const [row] = await db.query(
        'SELECT id, inicio, fin, estado FROM reserva_amenidad WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear reserva' });
    }
  }
);

// =========================================
// CRUD OPERATIONS - POST/PUT/DELETE
// =========================================

/**
 * @swagger
 * /amenidades/comunidad/{comunidadId}:
 *   post:
 *     tags: [Amenidades]
 *     summary: Crear nueva amenidad
 *     description: Crea una nueva amenidad para la comunidad especificada
 *     parameters:
 *       - name: comunidadId
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
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la amenidad
 *               reglas:
 *                 type: string
 *                 description: Reglas de uso
 *               capacidad:
 *                 type: integer
 *                 description: Capacidad máxima
 *               requiere_aprobacion:
 *                 type: boolean
 *                 description: Si requiere aprobación de admin
 *               tarifa:
 *                 type: number
 *                 description: Tarifa de uso
 *     responses:
 *       201:
 *         description: Amenidad creada exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Amenidad duplicada
 *       500:
 *         description: Error servidor
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'tesorero'),
    requireCommunity('comunidadId'),
    body('nombre')
      .notEmpty()
      .withMessage('Nombre es requerido')
      .trim()
      .escape(),
    body('reglas').optional().trim(),
    body('capacidad').optional().isInt({ min: 0 }).toInt(),
    body('requiere_aprobacion').optional().isBoolean().toBoolean(),
    body('tarifa').optional().isFloat({ min: 0 }).toFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, reglas, capacidad, requiere_aprobacion, tarifa } =
        req.body;

      // Verificar que la comunidad existe
      const [comunidad] = await db.query(
        'SELECT id FROM comunidad WHERE id = ?',
        [comunidadId]
      );
      if (!comunidad.length) {
        return res.status(404).json({ error: 'Comunidad no encontrada' });
      }

      // Verificar que no exista una amenidad con el mismo nombre
      const [duplicate] = await db.query(
        'SELECT id FROM amenidad WHERE comunidad_id = ? AND nombre = ?',
        [comunidadId, nombre]
      );
      if (duplicate.length) {
        return res
          .status(409)
          .json({ error: 'Ya existe una amenidad con ese nombre' });
      }

      // Insertar amenidad
      const [result] = await db.query(
        `INSERT INTO amenidad (comunidad_id, nombre, reglas, capacidad, requiere_aprobacion, tarifa)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          comunidadId,
          nombre,
          reglas || null,
          capacidad || 0,
          requiere_aprobacion ? 1 : 0,
          tarifa || 0,
        ]
      );

      // Obtener la amenidad creada
      const [amenidad] = await db.query('SELECT * FROM amenidad WHERE id = ?', [
        result.insertId,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address)
         VALUES (?, 'INSERT', 'amenidad', ?, ?, ?)`,
        [req.user.id, result.insertId, JSON.stringify(amenidad[0]), req.ip]
      );

      res.status(201).json(amenidad[0]);
    } catch (err) {
      console.error('Error al crear amenidad:', err);
      res.status(500).json({ error: 'Error al crear amenidad' });
    }
  }
);

/**
 * @swagger
 * /amenidades/{id}:
 *   put:
 *     tags: [Amenidades]
 *     summary: Actualizar amenidad existente
 *     description: Actualiza los datos de una amenidad existente
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
 *               nombre:
 *                 type: string
 *               reglas:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               requiere_aprobacion:
 *                 type: boolean
 *               tarifa:
 *                 type: number
 *     responses:
 *       200:
 *         description: Amenidad actualizada exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Amenidad no encontrada
 *       500:
 *         description: Error servidor
 */
router.put(
  '/:id',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'tesorero'),
    body('nombre').optional().trim().escape(),
    body('reglas').optional().trim(),
    body('capacidad').optional().isInt({ min: 0 }).toInt(),
    body('requiere_aprobacion').optional().isBoolean().toBoolean(),
    body('tarifa').optional().isFloat({ min: 0 }).toFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const amenidadId = Number(req.params.id);

      // Obtener amenidad anterior para auditoría
      const [amenidadAnterior] = await db.query(
        'SELECT * FROM amenidad WHERE id = ?',
        [amenidadId]
      );
      if (!amenidadAnterior.length) {
        return res.status(404).json({ error: 'Amenidad no encontrada' });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.nombre !== undefined) {
        campos.push('nombre = ?');
        valores.push(req.body.nombre);
      }
      if (req.body.reglas !== undefined) {
        campos.push('reglas = ?');
        valores.push(req.body.reglas || null);
      }
      if (req.body.capacidad !== undefined) {
        campos.push('capacidad = ?');
        valores.push(req.body.capacidad);
      }
      if (req.body.requiere_aprobacion !== undefined) {
        campos.push('requiere_aprobacion = ?');
        valores.push(req.body.requiere_aprobacion ? 1 : 0);
      }
      if (req.body.tarifa !== undefined) {
        campos.push('tarifa = ?');
        valores.push(req.body.tarifa);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(amenidadId);

      // Ejecutar actualización
      await db.query(
        `UPDATE amenidad SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener registro actualizado
      const [amenidadActualizada] = await db.query(
        'SELECT * FROM amenidad WHERE id = ?',
        [amenidadId]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'amenidad', ?, ?, ?, ?)`,
        [
          req.user.id,
          amenidadId,
          JSON.stringify(amenidadAnterior[0]),
          JSON.stringify(amenidadActualizada[0]),
          req.ip,
        ]
      );

      res.json(amenidadActualizada[0]);
    } catch (err) {
      console.error('Error al actualizar amenidad:', err);
      res.status(500).json({ error: 'Error al actualizar amenidad' });
    }
  }
);

/**
 * @swagger
 * /amenidades/{id}:
 *   delete:
 *     tags: [Amenidades]
 *     summary: Eliminar amenidad
 *     description: Elimina una amenidad (soft delete si tiene reservas)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Amenidad eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Amenidad no encontrada
 *       409:
 *         description: Amenidad tiene reservas activas
 *       500:
 *         description: Error servidor
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin_comunidad'),
  async (req, res) => {
    try {
      const amenidadId = Number(req.params.id);

      // Obtener amenidad a eliminar
      const [amenidad] = await db.query('SELECT * FROM amenidad WHERE id = ?', [
        amenidadId,
      ]);
      if (!amenidad.length) {
        return res.status(404).json({ error: 'Amenidad no encontrada' });
      }

      // Verificar si tiene reservas activas
      const [reservasActivas] = await db.query(
        `SELECT COUNT(*) as total FROM reserva_amenidad 
         WHERE amenidad_id = ? AND estado IN ('solicitada', 'aprobada')`,
        [amenidadId]
      );

      if (reservasActivas[0].total > 0) {
        return res.status(409).json({
          error:
            'No se puede eliminar una amenidad con reservas activas. Cancele las reservas primero.',
        });
      }

      // Realizar eliminación (hard delete ya que no tiene reservas activas)
      await db.query('DELETE FROM amenidad WHERE id = ?', [amenidadId]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address)
         VALUES (?, 'DELETE', 'amenidad', ?, ?, ?)`,
        [req.user.id, amenidadId, JSON.stringify(amenidad[0]), req.ip]
      );

      res.status(204).end();
    } catch (err) {
      console.error('Error al eliminar amenidad:', err);
      res.status(500).json({ error: 'Error al eliminar amenidad' });
    }
  }
);

module.exports = router;
