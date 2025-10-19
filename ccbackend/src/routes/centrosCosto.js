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
 * @openapi
 * /centros-costo/comunidad/{comunidadId}:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listado básico de centros de costo con información completa
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/filtrar:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Listado con filtros avanzados y estadísticas
 */
router.get('/comunidad/:comunidadId/filtrar', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { 
      busqueda, 
      limit = 50, 
      offset = 0 
    } = req.query;

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
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT cc.id) as total FROM');
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al filtrar centros de costo' });
  }
});

// =========================================
// 2. DETALLE DE CENTRO DE COSTO ESPECÍFICO
// =========================================

/**
 * @openapi
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
    res.status(500).json({ error: 'Error al obtener detalle del centro de costo' });
  }
});

/**
 * @openapi
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
    res.status(500).json({ error: 'Error al obtener gastos del centro de costo' });
  }
});

/**
 * @openapi
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
 * @openapi
 * /centros-costo/comunidad/{comunidadId}:
 *   post:
 *     tags: [CentrosCosto]
 *     summary: Crear nuevo centro de costo
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin']),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('codigo').optional()
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
        return res.status(409).json({ error: 'Ya existe un centro de costo con ese nombre o código' });
      }
      res.status(500).json({ error: 'Error al crear centro de costo' });
    }
  }
);

/**
 * @openapi
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
 * @openapi
 * /centros-costo/{id}:
 *   patch:
 *     tags: [CentrosCosto]
 *     summary: Actualizar centro de costo
 */
router.patch('/:id', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
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

    const [rows] = await db.query('SELECT * FROM centro_costo WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar centro de costo' });
  }
});

/**
 * @openapi
 * /centros-costo/{id}:
 *   delete:
 *     tags: [CentrosCosto]
 *     summary: Eliminar centro de costo
 */
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
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
});

// =========================================
// 4. ESTADÍSTICAS Y REPORTES
// =========================================

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/estadisticas/generales:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Estadísticas generales de centros de costo
 */
router.get('/comunidad/:comunidadId/estadisticas/generales', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/mas-utilizados:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros de costo más utilizados por cantidad de gastos
 */
router.get('/comunidad/:comunidadId/mas-utilizados', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener centros más utilizados' });
  }
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/mas-costosos:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros de costo más costosos por monto total
 */
router.get('/comunidad/:comunidadId/mas-costosos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/sin-uso:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros de costo sin uso en período
 */
router.get('/comunidad/:comunidadId/sin-uso', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/analisis-por-categoria:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Análisis de gastos por centro de costo y categoría
 */
router.get('/comunidad/:comunidadId/analisis-por-categoria', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener análisis por categoría' });
  }
});

// =========================================
// 5. VALIDACIONES
// =========================================

/**
 * @openapi
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
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/validar-nombre:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si existe centro con el mismo nombre
 */
router.get('/comunidad/:comunidadId/validar-nombre', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/validar-codigo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si existe centro con el mismo código
 */
router.get('/comunidad/:comunidadId/validar-codigo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.json({ existe_duplicado_codigo: rows[0].existe_duplicado_codigo === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al validar código' });
  }
});

/**
 * @openapi
 * /centros-costo/{id}/tiene-gastos:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Verificar si el centro tiene gastos asociados
 */
router.get('/:id/tiene-gastos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT COUNT(*) > 0 AS tiene_gastos FROM gasto WHERE centro_costo_id = ?';
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
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/dropdown:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Lista de centros de costo para dropdowns
 */
router.get('/comunidad/:comunidadId/dropdown', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener lista de centros de costo' });
  }
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/con-estadisticas:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Lista de centros de costo con estadísticas
 */
router.get('/comunidad/:comunidadId/con-estadisticas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener centros con estadísticas' });
  }
});

// =========================================
// 7. REPORTES AVANZADOS
// =========================================

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/reporte/por-mes:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Reporte de uso de centros de costo por mes
 */
router.get('/comunidad/:comunidadId/reporte/por-mes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Fechas de inicio y fin son requeridas' });
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

    const [rows] = await db.query(query, [comunidadId, fecha_inicio, fecha_fin]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar reporte por mes' });
  }
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/reporte/comparativo:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Análisis comparativo de centros (último mes vs mes anterior)
 */
router.get('/comunidad/:comunidadId/reporte/comparativo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/reporte/variabilidad:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros con mayor variabilidad en gastos
 */
router.get('/comunidad/:comunidadId/reporte/variabilidad', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al generar reporte de variabilidad' });
  }
});

// =========================================
// 8. EXPORTACIÓN
// =========================================

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/exportar:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Exportación completa para Excel/CSV
 */
router.get('/comunidad/:comunidadId/exportar', authenticate, requireCommunity('comunidadId'), authorize('admin', 'superadmin'), async (req, res) => {
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
});

// =========================================
// 9. DASHBOARD
// =========================================

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/dashboard/resumen:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Resumen de centros de costo para dashboard
 */
router.get('/comunidad/:comunidadId/dashboard/resumen', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/dashboard/top-mes:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Top centros por gasto en el último mes
 */
router.get('/comunidad/:comunidadId/dashboard/top-mes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/dashboard/sin-uso-reciente:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Centros sin uso reciente
 */
router.get('/comunidad/:comunidadId/dashboard/sin-uso-reciente', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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

    const [rows] = await db.query(query, [comunidadId, Number(dias), Number(limit)]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener centros sin uso reciente' });
  }
});

/**
 * @openapi
 * /centros-costo/comunidad/{comunidadId}/dashboard/distribucion:
 *   get:
 *     tags: [CentrosCosto]
 *     summary: Distribución de gastos por centro de costo
 */
router.get('/comunidad/:comunidadId/dashboard/distribucion', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * GET /centros-costo
 * Lista global de centros de costo (superadmin) o filtrada por comunidades asignadas (otros roles).
 */
router.get('/', authenticate, authorize('superadmin', 'admin_comunidad', 'conserje', 'contador', 'proveedor_servicio', 'residente', 'propietario', 'inquilino', 'tesorero', 'presidente_comite'), async (req, res) => {
  try {
    const { 
      page = 1,
      limit = 100,
      nombre_busqueda = ''
    } = req.query; // <-- quitar tipo_filtro, activa_filtro

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
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener centros de costo' });
  }
});

module.exports = router;


// =========================================
// ENDPOINTS DE CENTROS DE COSTO
// =========================================

// // 1. LISTADO CON FILTROS Y PAGINACIÓN
// GET: /centros-costo/comunidad/:comunidadId
// GET: /centros-costo/comunidad/:comunidadId/filtrar

// // 2. DETALLE DE CENTRO DE COSTO ESPECÍFICO
// GET: /centros-costo/:id/detalle
// GET: /centros-costo/:id/gastos
// GET: /centros-costo/:id/resumen-mensual
// GET: /centros-costo/:id

// // 3. OPERACIONES CRUD
// POST: /centros-costo/comunidad/:comunidadId
// PATCH: /centros-costo/:id
// DELETE: /centros-costo/:id

// // 4. ESTADÍSTICAS Y REPORTES
// GET: /centros-costo/comunidad/:comunidadId/estadisticas/generales
// GET: /centros-costo/comunidad/:comunidadId/mas-utilizados
// GET: /centros-costo/comunidad/:comunidadId/mas-costosos
// GET: /centros-costo/comunidad/:comunidadId/sin-uso
// GET: /centros-costo/comunidad/:comunidadId/analisis-por-categoria

// // 5. VALIDACIONES
// GET: /centros-costo/:id/existe
// GET: /centros-costo/comunidad/:comunidadId/validar-nombre
// GET: /centros-costo/comunidad/:comunidadId/validar-codigo
// GET: /centros-costo/:id/tiene-gastos

// // 6. LISTAS DESPLEGABLES
// GET: /centros-costo/comunidad/:comunidadId/dropdown
// GET: /centros-costo/comunidad/:comunidadId/con-estadisticas

// // 7. REPORTES AVANZADOS
// GET: /centros-costo/comunidad/:comunidadId/reporte/por-mes
// GET: /centros-costo/comunidad/:comunidadId/reporte/comparativo
// GET: /centros-costo/comunidad/:comunidadId/reporte/variabilidad

// // 8. EXPORTACIÓN
// GET: /centros-costo/comunidad/:comunidadId/exportar

// // 9. DASHBOARD
// GET: /centros-costo/comunidad/:comunidadId/dashboard/resumen
// GET: /centros-costo/comunidad/:comunidadId/dashboard/top-mes
// GET: /centros-costo/comunidad/:comunidadId/dashboard/sin-uso-reciente
// GET: /centros-costo/comunidad/:comunidadId/dashboard/distribucion