const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// =========================================
// 1. LISTADO DE CENTROS DE COSTO CON FILTROS Y PAGINACIÓN
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listado básico de centros de costo con información completa
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cc.id,
        cc.comunidad_id,
        c.razon_social AS comunidad_nombre,
        cc.nombre,
        cc.codigo,
        cc.created_at,
        cc.updated_at
      FROM centro_costo cc
      INNER JOIN comunidad c ON cc.comunidad_id = c.id
      WHERE cc.comunidad_id = ?
      ORDER BY cc.nombre
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener centros de costo' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/filtrar:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listado con filtros avanzados y estadísticas
 */
router.get(
  '/comunidad/:comunidadId/filtrar',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { busqueda, limit = 50, offset = 0 } = req.query;

      let query = `
      SELECT
        cc.id,
        cc.nombre,
        cc.codigo,
        c.razon_social AS comunidad,
        cc.created_at,
        cc.updated_at,
        COALESCE(stats.total_gastado, 0) AS total_gastado,
        COALESCE(stats.cantidad_gastos, 0) AS cantidad_gastos,
        COALESCE(stats.ultimo_gasto, NULL) AS ultimo_gasto
      FROM centro_costo cc
      INNER JOIN comunidad c ON cc.comunidad_id = c.id
      LEFT JOIN (
        SELECT
          centro_costo_id,
          SUM(monto) AS total_gastado,
          COUNT(*) AS cantidad_gastos,
          MAX(fecha) AS ultimo_gasto
        FROM gasto
        WHERE centro_costo_id IS NOT NULL
        GROUP BY centro_costo_id
      ) AS stats ON cc.id = stats.centro_costo_id
      WHERE cc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (busqueda) {
        query += ' AND (cc.nombre LIKE ? OR cc.codigo LIKE ?)';
        params.push(`%${busqueda}%`, `%${busqueda}%`);
      }

      // Obtener total
      const countQuery = query.replace(
        /SELECT.*FROM/,
        'SELECT COUNT(DISTINCT cc.id) as total FROM'
      );
      const [countResult] = await db.query(countQuery, params);
      const total = countResult[0].total;

      query += ' ORDER BY cc.nombre LIMIT ? OFFSET ?';
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
      res.status(500).json({ error: 'Error al filtrar centros de costo' });
    }
  }
);

// =========================================
// 2. DETALLE DE CENTRO DE COSTO ESPECÍFICO
// =========================================

/**
 * @swagger
 * /centros-costo/{id}/detalle:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Detalle completo de un centro de costo con estadísticas
 */
router.get('/:id/detalle', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidad_id } = req.query;

    const query = `
      SELECT
        cc.id,
        cc.comunidad_id,
        c.razon_social AS comunidad_nombre,
        cc.nombre,
        cc.codigo,
        COALESCE(stats.total_gastado, 0) AS total_gastado,
        COALESCE(stats.cantidad_gastos, 0) AS cantidad_gastos,
        COALESCE(stats.gasto_promedio, 0) AS gasto_promedio,
        COALESCE(stats.primer_gasto, NULL) AS primer_gasto,
        COALESCE(stats.ultimo_gasto, NULL) AS ultimo_gasto,
        cc.created_at,
        cc.updated_at
      FROM centro_costo cc
      INNER JOIN comunidad c ON cc.comunidad_id = c.id
      LEFT JOIN (
        SELECT
          centro_costo_id,
          SUM(monto) AS total_gastado,
          COUNT(*) AS cantidad_gastos,
          AVG(monto) AS gasto_promedio,
          MIN(fecha) AS primer_gasto,
          MAX(fecha) AS ultimo_gasto
        FROM gasto
        WHERE centro_costo_id IS NOT NULL
        GROUP BY centro_costo_id
      ) AS stats ON cc.id = stats.centro_costo_id
      WHERE cc.id = ?
    `;

    const params = [id];
    let finalQuery = query;

    if (comunidad_id) {
      finalQuery += ' AND cc.comunidad_id = ?';
      params.push(comunidad_id);
    }

    const [rows] = await db.query(finalQuery, params);

    if (!rows.length) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Error al obtener detalle del centro de costo' });
  }
});

/**
 * @swagger
 * /centros-costo/{id}/gastos:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Gastos asociados al centro de costo
 */
router.get('/:id/gastos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const query = `
      SELECT
        g.id,
        g.fecha,
        g.monto,
        g.glosa AS descripcion,
        cat.nombre AS categoria,
        p.razon_social AS proveedor,
        dc.folio AS documento_numero,
        g.created_at
      FROM gasto g
      LEFT JOIN categoria_gasto cat ON g.categoria_id = cat.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE g.centro_costo_id = ?
      ORDER BY g.fecha DESC, g.created_at DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [id, Number(limit)]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'Error al obtener gastos del centro de costo' });
  }
});

/**
 * @swagger
 * /centros-costo/{id}/resumen-mensual:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Resumen mensual de gastos del centro de costo (últimos 12 meses)
 */
router.get('/:id/resumen-mensual', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        DATE_FORMAT(fecha, '%Y-%m') AS mes,
        COUNT(*) AS cantidad_gastos,
        SUM(monto) AS total_monto,
        AVG(monto) AS promedio_monto,
        MIN(monto) AS monto_minimo,
        MAX(monto) AS monto_maximo
      FROM gasto
      WHERE centro_costo_id = ?
        AND fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes DESC
    `;

    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen mensual' });
  }
});

// =========================================
// 3. OPERACIONES CRUD
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}:
 *   post:
 *     tags: [CentrosCosto]
 *     summary: Crear nuevo centro de costo
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin','admin_comunidad','superadmin']),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('codigo').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, codigo } = req.body;

      const [result] = await db.query(
        'INSERT INTO centro_costo (comunidad_id, nombre, codigo) VALUES (?,?,?)',
        [comunidadId, nombre, codigo || null]
      );

      const [row] = await db.query(
        'SELECT id, nombre, codigo FROM centro_costo WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res
          .status(409)
          .json({
            error: 'Ya existe un centro de costo con ese nombre o código',
          });
      }
      res.status(500).json({ error: 'Error al crear centro de costo' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/{id}:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Obtener un centro de costo específico
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, comunidad_id, nombre, codigo, created_at, updated_at FROM centro_costo WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Centro de costo no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener centro de costo' });
  }
});

/**
 * @swagger
 * /centros-costo/{id}:
 *   patch:
 *     tags: [CentrosCosto]
 *     summary: Actualizar centro de costo
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, codigo, comunidad_id } = req.body;

      const updates = [];
      const values = [];

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre);
      }

      if (codigo !== undefined) {
        updates.push('codigo = ?');
        values.push(codigo);
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');

      let query = `UPDATE centro_costo SET ${updates.join(', ')} WHERE id = ?`;
      values.push(id);

      if (comunidad_id) {
        query += ' AND comunidad_id = ?';
        values.push(comunidad_id);
      }

      await db.query(query, values);

      const [rows] = await db.query('SELECT * FROM centro_costo WHERE id = ?', [
        id,
      ]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar centro de costo' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/{id}:
 *   delete:
 *     tags: [CentrosCosto]
 *     summary: Eliminar centro de costo
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comunidad_id } = req.query;

      let query = 'DELETE FROM centro_costo WHERE id = ?';
      const params = [id];

      if (comunidad_id) {
        query += ' AND comunidad_id = ?';
        params.push(comunidad_id);
      }

      await db.query(query, params);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar centro de costo' });
    }
  }
);

// =========================================
// 4. ESTADÍSTICAS Y REPORTES
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/estadisticas/generales:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Estadísticas generales de centros de costo
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
        COUNT(*) AS total_centros,
        COUNT(DISTINCT comunidad_id) AS comunidades_distintas,
        SUM(CASE WHEN stats.total_gastado > 0 THEN 1 ELSE 0 END) AS centros_con_gastos,
        SUM(stats.total_gastado) AS total_general_gastado,
        AVG(stats.total_gastado) AS promedio_gastado_por_centro
      FROM centro_costo cc
      LEFT JOIN (
        SELECT
          centro_costo_id,
          SUM(monto) AS total_gastado
        FROM gasto
        WHERE centro_costo_id IS NOT NULL
        GROUP BY centro_costo_id
      ) AS stats ON cc.id = stats.centro_costo_id
      WHERE cc.comunidad_id = ?
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
 * /centros-costo/comunidad/{comunidadId}/mas-utilizados:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros de costo más utilizados por cantidad de gastos
 */
router.get(
  '/comunidad/:comunidadId/mas-utilizados',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_gasto,
        MAX(g.fecha) AS ultimo_gasto
      FROM centro_costo cc
      INNER JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cc.id, cc.nombre, cc.codigo
      HAVING COUNT(g.id) > 0
      ORDER BY cantidad_gastos DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener centros más utilizados' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/mas-costosos:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros de costo más costosos por monto total
 */
router.get(
  '/comunidad/:comunidadId/mas-costosos',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_gasto,
        MIN(g.fecha) AS primer_gasto,
        MAX(g.fecha) AS ultimo_gasto
      FROM centro_costo cc
      INNER JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cc.id, cc.nombre, cc.codigo
      HAVING SUM(g.monto) > 0
      ORDER BY total_monto DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener centros más costosos' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/sin-uso:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros de costo sin uso en período
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
        cc.nombre AS centro_costo,
        cc.codigo,
        MAX(g.fecha) AS ultimo_gasto,
        DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
      FROM centro_costo cc
      LEFT JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
      GROUP BY cc.id, cc.nombre, cc.codigo
      HAVING MAX(g.fecha) IS NULL OR DATEDIFF(CURRENT_DATE, MAX(g.fecha)) > ?
      ORDER BY dias_sin_uso DESC
    `;

      const [rows] = await db.query(query, [comunidadId, Number(dias)]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener centros sin uso' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/analisis-por-categoria:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Análisis de gastos por centro de costo y categoría
 */
router.get(
  '/comunidad/:comunidadId/analisis-por-categoria',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cc.nombre AS centro_costo,
        cat.nombre AS categoria,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_monto,
        (SUM(g.monto) / NULLIF((SELECT SUM(monto) FROM gasto WHERE centro_costo_id = cc.id), 0)) * 100 AS porcentaje_del_centro
      FROM centro_costo cc
      INNER JOIN gasto g ON cc.id = g.centro_costo_id
      INNER JOIN categoria_gasto cat ON g.categoria_id = cat.id
      WHERE cc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cc.id, cc.nombre, cat.id, cat.nombre
      ORDER BY cc.nombre, total_monto DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener análisis por categoría' });
    }
  }
);

// =========================================
// 5. VALIDACIONES
// =========================================

/**
 * @swagger
 * /centros-costo/{id}/existe:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si existe un centro de costo
 */
router.get('/:id/existe', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidad_id } = req.query;

    let query = 'SELECT COUNT(*) > 0 AS existe FROM centro_costo WHERE id = ?';
    const params = [id];

    if (comunidad_id) {
      query += ' AND comunidad_id = ?';
      params.push(comunidad_id);
    }

    const [rows] = await db.query(query, params);
    res.json({ existe: rows[0].existe === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar centro de costo' });
  }
});

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/validar-nombre:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si existe centro con el mismo nombre
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
      FROM centro_costo
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
 * /centros-costo/comunidad/{comunidadId}/validar-codigo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si existe centro con el mismo código
 */
router.get(
  '/comunidad/:comunidadId/validar-codigo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { codigo, excluir_id } = req.query;

      if (!codigo) {
        return res.status(400).json({ error: 'Código es requerido' });
      }

      let query = `
      SELECT COUNT(*) > 0 AS existe_duplicado_codigo
      FROM centro_costo
      WHERE comunidad_id = ? AND codigo = ?
    `;
      const params = [comunidadId, codigo];

      if (excluir_id) {
        query += ' AND id != ?';
        params.push(excluir_id);
      }

      const [rows] = await db.query(query, params);
      res.json({
        existe_duplicado_codigo: rows[0].existe_duplicado_codigo === 1,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al validar código' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/{id}/tiene-gastos:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si el centro tiene gastos asociados
 */
router.get('/:id/tiene-gastos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query =
      'SELECT COUNT(*) > 0 AS tiene_gastos FROM gasto WHERE centro_costo_id = ?';
    const [rows] = await db.query(query, [id]);

    res.json({ tiene_gastos: rows[0].tiene_gastos === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar gastos' });
  }
});

// =========================================
// 6. LISTAS DESPLEGABLES
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/dropdown:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Lista de centros de costo para dropdowns
 */
router.get(
  '/comunidad/:comunidadId/dropdown',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        id,
        nombre,
        codigo,
        CONCAT(nombre, ' (', codigo, ')') AS nombre_completo
      FROM centro_costo
      WHERE comunidad_id = ?
      ORDER BY nombre
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener lista de centros de costo' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/con-estadisticas:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Lista de centros de costo con estadísticas
 */
router.get(
  '/comunidad/:comunidadId/con-estadisticas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        cc.id,
        cc.nombre,
        cc.codigo,
        COALESCE(stats.total_gastado, 0) AS total_gastado,
        COALESCE(stats.cantidad_gastos, 0) AS cantidad_gastos
      FROM centro_costo cc
      LEFT JOIN (
        SELECT
          centro_costo_id,
          SUM(monto) AS total_gastado,
          COUNT(*) AS cantidad_gastos
        FROM gasto
        WHERE centro_costo_id IS NOT NULL
        GROUP BY centro_costo_id
      ) AS stats ON cc.id = stats.centro_costo_id
      WHERE cc.comunidad_id = ?
      ORDER BY cc.nombre
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: 'Error al obtener centros con estadísticas' });
    }
  }
);

// =========================================
// 7. REPORTES AVANZADOS
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/reporte/por-mes:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Reporte de uso de centros de costo por mes
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
        cc.nombre AS centro_costo,
        cc.codigo,
        YEAR(g.fecha) AS anio,
        MONTH(g.fecha) AS mes,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto,
        AVG(g.monto) AS promedio_monto
      FROM centro_costo cc
      INNER JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
        AND g.fecha BETWEEN ? AND ?
      GROUP BY cc.id, cc.nombre, cc.codigo, YEAR(g.fecha), MONTH(g.fecha)
      ORDER BY cc.nombre, anio DESC, mes DESC
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
 * /centros-costo/comunidad/{comunidadId}/reporte/comparativo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Análisis comparativo de centros (último mes vs mes anterior)
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
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS total_gastos,
        SUM(g.monto) AS total_monto,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_ultimo_mes,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_ultimo_mes,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS gastos_mes_anterior,
        SUM(CASE WHEN g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH) AND g.fecha < DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) THEN g.monto ELSE 0 END) AS monto_mes_anterior
      FROM centro_costo cc
      LEFT JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
      GROUP BY cc.id, cc.nombre, cc.codigo
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
 * /centros-costo/comunidad/{comunidadId}/reporte/variabilidad:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros con mayor variabilidad en gastos
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
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS cantidad_gastos,
        AVG(g.monto) AS promedio,
        STDDEV(g.monto) AS desviacion_estandar,
        MIN(g.monto) AS minimo,
        MAX(g.monto) AS maximo,
        (STDDEV(g.monto) / NULLIF(AVG(g.monto), 0)) * 100 AS coeficiente_variacion
      FROM centro_costo cc
      INNER JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cc.id, cc.nombre, cc.codigo
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
 * /centros-costo/comunidad/{comunidadId}/exportar:
 *   get:
 *     tags: [CentrosCosto]
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
        cc.id AS 'ID Centro Costo',
        c.razon_social AS 'Comunidad',
        cc.nombre AS 'Nombre',
        cc.codigo AS 'Código',
        COALESCE(stats.cantidad_gastos, 0) AS 'Cantidad Gastos',
        COALESCE(stats.total_gastado, 0) AS 'Total Gastado',
        COALESCE(stats.gasto_promedio, 0) AS 'Gasto Promedio',
        DATE_FORMAT(stats.primer_gasto, '%d/%m/%Y') AS 'Primer Gasto',
        DATE_FORMAT(stats.ultimo_gasto, '%d/%m/%Y') AS 'Último Gasto',
        DATE_FORMAT(cc.created_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(cc.updated_at, '%d/%m/%Y %H:%i:%s') AS 'Fecha Actualización'
      FROM centro_costo cc
      INNER JOIN comunidad c ON cc.comunidad_id = c.id
      LEFT JOIN (
        SELECT
          centro_costo_id,
          COUNT(*) AS cantidad_gastos,
          SUM(monto) AS total_gastado,
          AVG(monto) AS gasto_promedio,
          MIN(fecha) AS primer_gasto,
          MAX(fecha) AS ultimo_gasto
        FROM gasto
        GROUP BY centro_costo_id
      ) AS stats ON cc.id = stats.centro_costo_id
      WHERE cc.comunidad_id = ?
      ORDER BY cc.nombre
    `;

      const [rows] = await db.query(query, [comunidadId]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al exportar centros de costo' });
    }
  }
);

// =========================================
// 9. DASHBOARD
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/dashboard/resumen:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Resumen de centros de costo para dashboard
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
        COUNT(*) AS total_centros,
        COUNT(DISTINCT comunidad_id) AS comunidades,
        SUM(COALESCE(stats.total_gastado, 0)) AS total_general_gastado,
        AVG(COALESCE(stats.total_gastado, 0)) AS promedio_gastado_por_centro
      FROM centro_costo cc
      LEFT JOIN (
        SELECT
          centro_costo_id,
          SUM(monto) AS total_gastado
        FROM gasto
        WHERE centro_costo_id IS NOT NULL
        GROUP BY centro_costo_id
      ) AS stats ON cc.id = stats.centro_costo_id
      WHERE cc.comunidad_id = ?
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
 * /centros-costo/comunidad/{comunidadId}/dashboard/top-mes:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Top centros por gasto en el último mes
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
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS cantidad_gastos,
        SUM(g.monto) AS total_monto
      FROM centro_costo cc
      INNER JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
        AND g.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
      GROUP BY cc.id, cc.nombre, cc.codigo
      ORDER BY total_monto DESC
      LIMIT ?
    `;

      const [rows] = await db.query(query, [comunidadId, Number(limit)]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener top centros' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/dashboard/sin-uso-reciente:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros sin uso reciente
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
        cc.nombre AS centro_costo,
        cc.codigo,
        MAX(g.fecha) AS ultimo_gasto,
        DATEDIFF(CURRENT_DATE, MAX(g.fecha)) AS dias_sin_uso
      FROM centro_costo cc
      LEFT JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
      GROUP BY cc.id, cc.nombre, cc.codigo
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
      res
        .status(500)
        .json({ error: 'Error al obtener centros sin uso reciente' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}/dashboard/distribucion:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Distribución de gastos por centro de costo
 */
router.get(
  '/comunidad/:comunidadId/dashboard/distribucion',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { fecha_inicio, fecha_fin } = req.query;

      let query = `
      SELECT
        cc.nombre AS centro_costo,
        cc.codigo,
        COUNT(g.id) AS total_gastos,
        SUM(g.monto) AS total_monto,
        (SUM(g.monto) / NULLIF((SELECT SUM(monto) FROM gasto WHERE comunidad_id = cc.comunidad_id
    `;

      const params = [comunidadId];

      if (fecha_inicio && fecha_fin) {
        query += ' AND fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `), 0)) * 100 AS porcentaje_total
      FROM centro_costo cc
      LEFT JOIN gasto g ON cc.id = g.centro_costo_id
      WHERE cc.comunidad_id = ?
    `;

      params.push(comunidadId);

      if (fecha_inicio && fecha_fin) {
        query += ' AND g.fecha BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += `
      GROUP BY cc.id, cc.nombre, cc.codigo, cc.comunidad_id
      HAVING SUM(g.monto) > 0
      ORDER BY total_monto DESC
    `;

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener distribución' });
    }
  }
);

/**
 * GET /centros-costo
 * Lista global de centros de costo (superadmin) o filtrada por comunidades asignadas (otros roles).
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
      const { page = 1, limit = 100, nombre_busqueda = '' } = req.query; // <-- quitar tipo_filtro, activa_filtro

      const offset = (page - 1) * limit;

      let whereClauses = [];
      const params = [];

      if (nombre_busqueda) {
        whereClauses.push('cc.nombre LIKE ?');
        params.push(`%${nombre_busqueda}%`);
      }

      // Quitar filtros tipo_filtro y activa_filtro

      let query = `
      SELECT
        cc.id,
        cc.nombre,
        c.razon_social AS comunidad,
        cc.created_at,
        cc.updated_at
      FROM centro_costo cc
      INNER JOIN comunidad c ON cc.comunidad_id = c.id
    `;

      // Filtro por comunidades asignadas si no es superadmin
      if (!req.user.is_superadmin) {
        whereClauses.push(`cc.comunidad_id IN (
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

      query += ' ORDER BY cc.nombre LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);
      console.log('Centros rows:', rows); // <-- añadir para debug
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
      res.status(500).json({ error: 'Error al obtener centros de costo' });
    }
  }
);

// =========================================
// CRUD OPERATIONS - POST/PUT/DELETE
// =========================================

/**
 * @swagger
 * /centros-costo/comunidad/{comunidadId}:
 *   post:
 *     tags: [Centros de Costo]
 *     summary: Crear nuevo centro de costo
 *     description: Crea un nuevo centro de costo para la comunidad especificada
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
 *             required: [nombre, codigo]
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del centro de costo
 *               codigo:
 *                 type: string
 *                 description: Código único del centro de costo
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada
 *               presupuesto:
 *                 type: number
 *                 description: Presupuesto asignado
 *     responses:
 *       201:
 *         description: Centro de costo creado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Centro de costo duplicado
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
    body('codigo')
      .notEmpty()
      .withMessage('Código es requerido')
      .trim()
      .escape(),
    body('descripcion').optional().trim(),
    body('presupuesto').optional().isFloat({ min: 0 }).toFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, codigo, descripcion, presupuesto } = req.body;

      // Verificar que la comunidad existe
      const [comunidad] = await db.query('SELECT id FROM comunidad WHERE id = ?', [
        comunidadId,
      ]);
      if (!comunidad.length) {
        return res.status(404).json({ error: 'Comunidad no encontrada' });
      }

      // Verificar que no exista un centro con el mismo código
      const [duplicate] = await db.query(
        'SELECT id FROM centro_costo WHERE comunidad_id = ? AND codigo = ?',
        [comunidadId, codigo]
      );
      if (duplicate.length) {
        return res
          .status(409)
          .json({ error: 'Ya existe un centro de costo con ese código' });
      }

      // Insertar centro de costo
      const [result] = await db.query(
        `INSERT INTO centro_costo (comunidad_id, nombre, codigo, descripcion, presupuesto)
         VALUES (?, ?, ?, ?, ?)`,
        [comunidadId, nombre, codigo, descripcion || null, presupuesto || 0]
      );

      // Obtener el centro creado
      const [centroCosto] = await db.query(
        'SELECT * FROM centro_costo WHERE id = ?',
        [result.insertId]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address)
         VALUES (?, 'INSERT', 'centro_costo', ?, ?, ?)`,
        [req.user.id, result.insertId, JSON.stringify(centroCosto[0]), req.ip]
      );

      res.status(201).json(centroCosto[0]);
    } catch (err) {
      console.error('Error al crear centro de costo:', err);
      res.status(500).json({ error: 'Error al crear centro de costo' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/{id}:
 *   put:
 *     tags: [Centros de Costo]
 *     summary: Actualizar centro de costo existente
 *     description: Actualiza los datos de un centro de costo existente
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
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               presupuesto:
 *                 type: number
 *     responses:
 *       200:
 *         description: Centro de costo actualizado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Centro de costo no encontrado
 *       500:
 *         description: Error servidor
 */
router.put(
  '/:id',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'tesorero'),
    body('nombre').optional().trim().escape(),
    body('codigo').optional().trim().escape(),
    body('descripcion').optional().trim(),
    body('presupuesto').optional().isFloat({ min: 0 }).toFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const centroCostoId = Number(req.params.id);

      // Obtener centro anterior para auditoría
      const [centroCostoAnterior] = await db.query(
        'SELECT * FROM centro_costo WHERE id = ?',
        [centroCostoId]
      );
      if (!centroCostoAnterior.length) {
        return res.status(404).json({ error: 'Centro de costo no encontrado' });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.nombre !== undefined) {
        campos.push('nombre = ?');
        valores.push(req.body.nombre);
      }
      if (req.body.codigo !== undefined) {
        campos.push('codigo = ?');
        valores.push(req.body.codigo);
      }
      if (req.body.descripcion !== undefined) {
        campos.push('descripcion = ?');
        valores.push(req.body.descripcion || null);
      }
      if (req.body.presupuesto !== undefined) {
        campos.push('presupuesto = ?');
        valores.push(req.body.presupuesto);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(centroCostoId);

      // Ejecutar actualización
      await db.query(
        `UPDATE centro_costo SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener registro actualizado
      const [centroCostoActualizado] = await db.query(
        'SELECT * FROM centro_costo WHERE id = ?',
        [centroCostoId]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'centro_costo', ?, ?, ?, ?)`,
        [
          req.user.id,
          centroCostoId,
          JSON.stringify(centroCostoAnterior[0]),
          JSON.stringify(centroCostoActualizado[0]),
          req.ip,
        ]
      );

      res.json(centroCostoActualizado[0]);
    } catch (err) {
      console.error('Error al actualizar centro de costo:', err);
      res.status(500).json({ error: 'Error al actualizar centro de costo' });
    }
  }
);

/**
 * @swagger
 * /centros-costo/{id}:
 *   delete:
 *     tags: [Centros de Costo]
 *     summary: Eliminar centro de costo
 *     description: Elimina un centro de costo verificando que no tenga gastos asociados
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Centro de costo eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Centro de costo no encontrado
 *       409:
 *         description: Centro de costo tiene gastos asociados
 *       500:
 *         description: Error servidor
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin_comunidad'),
  async (req, res) => {
    try {
      const centroCostoId = Number(req.params.id);

      // Obtener centro a eliminar
      const [centroCosto] = await db.query(
        'SELECT * FROM centro_costo WHERE id = ?',
        [centroCostoId]
      );
      if (!centroCosto.length) {
        return res.status(404).json({ error: 'Centro de costo no encontrado' });
      }

      // Verificar si tiene gastos asociados
      const [gastosAsociados] = await db.query(
        'SELECT COUNT(*) as total FROM gasto WHERE centro_costo_id = ?',
        [centroCostoId]
      );

      if (gastosAsociados[0].total > 0) {
        return res.status(409).json({
          error:
            'No se puede eliminar un centro de costo que tiene gastos asociados',
        });
      }

      // Realizar eliminación
      await db.query('DELETE FROM centro_costo WHERE id = ?', [centroCostoId]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address)
         VALUES (?, 'DELETE', 'centro_costo', ?, ?, ?)`,
        [req.user.id, centroCostoId, JSON.stringify(centroCosto[0]), req.ip]
      );

      res.status(204).end();
    } catch (err) {
      console.error('Error al eliminar centro de costo:', err);
      res.status(500).json({ error: 'Error al eliminar centro de costo' });
    }
  }
);

module.exports = router;
