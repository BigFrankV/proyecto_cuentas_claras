const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// Tipos de categoría permitidos
const TIPOS_CATEGORIA = ['operacional', 'extraordinario', 'fondo_reserva', 'multas', 'consumo'];
 
// =========================================
// 1. LISTADO DE CATEGORÍAS CON FILTROS Y PAGINACIÓN
// =========================================

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Listado básico de categorías de gasto con información completa
 */
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    
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
      WHERE cg.comunidad_id = ?
      ORDER BY cg.nombre
    `;

    const [rows] = await db.query(query, [comunidadId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías de gasto' });
  }
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/filtrar:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Listado con filtros avanzados y paginación
 */
router.get('/comunidad/:comunidadId/filtrar', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const { 
      nombre_busqueda, 
      tipo_filtro, 
      activa_filtro,
      limit = 50,
      offset = 0
    } = req.query;

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
      WHERE cg.comunidad_id = ?
    `;

    const params = [comunidadId];

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
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al filtrar categorías' });
  }
});

// =========================================
// 2. DETALLE DE CATEGORÍA ESPECÍFICA
// =========================================

/**
 * @openapi
 * /categorias-gasto/{id}/detalle:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Detalle completo de una categoría con estadísticas
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
 * @openapi
 * /categorias-gasto/{id}/ultimos-gastos:
 *   get:
 *     tags: [CategoriasGasto]
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
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}:
 *   post:
 *     tags: [CategoriasGasto]
 *     summary: Crear nueva categoría de gasto
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId', ['admin']),
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('tipo').optional().isIn(TIPOS_CATEGORIA).withMessage('Tipo inválido'),
    body('cta_contable').optional(),
    body('activa').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const { nombre, tipo, cta_contable, activa } = req.body;
      
      const tipoVal = tipo && TIPOS_CATEGORIA.includes(tipo) ? tipo : 'operacional';
      const activaVal = typeof activa === 'undefined' ? 1 : (activa ? 1 : 0);

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
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
);

/**
 * @openapi
 * /categorias-gasto/{id}:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Obtener una categoría específica
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
 * @openapi
 * /categorias-gasto/{id}:
 *   patch:
 *     tags: [CategoriasGasto]
 *     summary: Actualizar categoría de gasto
 */
router.patch('/:id', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
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

    let query = `UPDATE categoria_gasto SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    if (comunidad_id) {
      query += ' AND comunidad_id = ?';
      values.push(comunidad_id);
    }

    await db.query(query, values);

    const [rows] = await db.query('SELECT * FROM categoria_gasto WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

/**
 * @openapi
 * /categorias-gasto/{id}:
 *   delete:
 *     tags: [CategoriasGasto]
 *     summary: Eliminar categoría de gasto
 */
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/{id}/activar:
 *   patch:
 *     tags: [CategoriasGasto]
 *     summary: Activar/Desactivar categoría
 */
router.patch('/:id/activar', authenticate, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { activa, comunidad_id } = req.body;

    let query = 'UPDATE categoria_gasto SET activa = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [activa ? 1 : 0, id];

    if (comunidad_id) {
      query += ' AND comunidad_id = ?';
      params.push(comunidad_id);
    }

    await db.query(query, params);

    const [rows] = await db.query('SELECT * FROM categoria_gasto WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cambiar estado de categoría' });
  }
});

// =========================================
// 4. ESTADÍSTICAS Y REPORTES
// =========================================

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/estadisticas/generales:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Estadísticas generales de categorías
 */
router.get('/comunidad/:comunidadId/estadisticas/generales', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/estadisticas/por-tipo:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Estadísticas por tipo de categoría
 */
router.get('/comunidad/:comunidadId/estadisticas/por-tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/mas-utilizadas:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Categorías más utilizadas por cantidad de gastos
 */
router.get('/comunidad/:comunidadId/mas-utilizadas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener categorías más utilizadas' });
  }
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/mas-costosas:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Categorías más costosas por monto total
 */
router.get('/comunidad/:comunidadId/mas-costosas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al obtener categorías más costosas' });
  }
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/sin-uso:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Categorías sin uso en período
 */
router.get('/comunidad/:comunidadId/sin-uso', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

// =========================================
// 5. VALIDACIONES
// =========================================

/**
 * @openapi
 * /categorias-gasto/{id}/existe:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Verificar si existe una categoría
 */
router.get('/:id/existe', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { comunidad_id } = req.query;

    let query = 'SELECT COUNT(*) > 0 AS existe FROM categoria_gasto WHERE id = ?';
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
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/validar-nombre:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Verificar si existe categoría con el mismo nombre
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
});

/**
 * @openapi
 * /categorias-gasto/{id}/tiene-gastos:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Verificar si la categoría tiene gastos asociados
 */
router.get('/:id/tiene-gastos', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT COUNT(*) > 0 AS tiene_gastos FROM gasto WHERE categoria_id = ?';
    const [rows] = await db.query(query, [id]);
    
    res.json({ tiene_gastos: rows[0].tiene_gastos === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al verificar gastos' });
  }
});

/**
 * @openapi
 * /categorias-gasto/validar-tipo:
 *   get:
 *     tags: [CategoriasGasto]
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
      tipos_permitidos: TIPOS_CATEGORIA
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
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/activas:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Lista de categorías activas para dropdowns
 */
router.get('/comunidad/:comunidadId/activas', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/tipos:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Lista de tipos de categoría disponibles en la comunidad
 */
router.get('/comunidad/:comunidadId/tipos', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/por-tipo/{tipo}:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Lista de categorías por tipo específico
 */
router.get('/comunidad/:comunidadId/por-tipo/:tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

// =========================================
// 7. REPORTES AVANZADOS
// =========================================

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/reporte/por-mes:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Reporte de uso de categorías por mes
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

    const [rows] = await db.query(query, [comunidadId, fecha_inicio, fecha_fin]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar reporte por mes' });
  }
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/reporte/comparativo:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Análisis comparativo de categorías (último mes vs mes anterior)
 */
router.get('/comunidad/:comunidadId/reporte/comparativo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/reporte/variabilidad:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Categorías con mayor variabilidad en gastos
 */
router.get('/comunidad/:comunidadId/reporte/variabilidad', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
    res.status(500).json({ error: 'Error al generar reporte de variabilidad' });
  }
});

// =========================================
// 8. EXPORTACIÓN
// =========================================

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/exportar:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Exportación completa para Excel/CSV
 */
router.get('/comunidad/:comunidadId/exportar', authenticate, requireCommunity('comunidadId'), authorize('admin', 'superadmin'), async (req, res) => {
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
});

// =========================================
// 9. DASHBOARD
// =========================================

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/resumen:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Resumen de categorías para dashboard
 */
router.get('/comunidad/:comunidadId/dashboard/resumen', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/top-mes:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Top categorías por gasto en el último mes
 */
router.get('/comunidad/:comunidadId/dashboard/top-mes', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/sin-uso-reciente:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Categorías activas sin uso reciente
 */
router.get('/comunidad/:comunidadId/dashboard/sin-uso-reciente', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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

    const [rows] = await db.query(query, [comunidadId, Number(dias), Number(limit)]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías sin uso' });
  }
});

/**
 * @openapi
 * /categorias-gasto/comunidad/{comunidadId}/dashboard/distribucion-tipo:
 *   get:
 *     tags: [CategoriasGasto]
 *     summary: Distribución de gastos por tipo de categoría
 */
router.get('/comunidad/:comunidadId/dashboard/distribucion-tipo', authenticate, requireCommunity('comunidadId'), async (req, res) => {
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
});

/**
 * GET /categorias-gasto
 * Lista global de categorías (superadmin) o filtrada por comunidades asignadas (otros roles).
 */
router.get('/', authenticate, authorize('superadmin', 'admin_comunidad', 'conserje', 'contador', 'proveedor_servicio', 'residente', 'propietario', 'inquilino', 'tesorero', 'presidente_comite'), async (req, res) => {
  try {
    const { 
      page = 1,
      limit = 100,
      nombre_busqueda = '',
      tipo_filtro = '',
      activa_filtro = -1
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
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY cg.nombre LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

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
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

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