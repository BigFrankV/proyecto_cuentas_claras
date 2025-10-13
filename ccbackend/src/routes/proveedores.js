const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');
const proveedoresPermissions = require('../middleware/proveedoresPermissions');
const { authenticateProveedores } = require('../middleware/authProveedores');

/**
 * @openapi
 * tags:
 *   - name: Proveedores
 *     description: Gestión de proveedores por comunidad
 */

// ✅ 1. GET /all - PARA SUPERADMIN (USA AUTH NORMAL)
router.get('/all', authenticate, proveedoresPermissions.canViewAll, async (req, res) => {
  try {
    if (!req.user.is_superadmin) {
      return res.status(403).json({
        success: false,
        error: 'Solo superadmin puede ver todos los proveedores'
      });
    }

    console.log('🔍 GET todos los proveedores - Superadmin:', req.user.username);

    const [rows] = await db.query(`
      SELECT 
        p.id, 
        p.rut, 
        p.dv, 
        p.razon_social, 
        p.giro, 
        p.email, 
        p.telefono, 
        p.direccion, 
        p.activo,
        p.created_at,
        c.razon_social as comunidad_nombre,
        p.comunidad_id
      FROM proveedor p
      LEFT JOIN comunidad c ON p.comunidad_id = c.id
      ORDER BY p.razon_social ASC
    `);

    console.log('✅ Proveedores encontrados (todas las comunidades):', rows.length);

    const [statsRows] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes
      FROM proveedor
    `);

    res.json({
      success: true,
      data: rows,
      estadisticas: statsRows[0]
    });

  } catch (error) {
    console.error('❌ Error en GET todos los proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ 2. GET /all/search - BÚSQUEDA PARA SUPERADMIN (USA AUTH NORMAL)
router.get('/all/search', authenticate, proveedoresPermissions.canViewAll, async (req, res) => {
  try {
    if (!req.user.is_superadmin) {
      return res.status(403).json({
        success: false,
        error: 'Solo superadmin puede buscar en todos los proveedores'
      });
    }

    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q.trim()}%`;
    const [rows] = await db.query(`
      SELECT 
        p.id, p.rut, p.dv, p.razon_social, p.email, p.telefono, p.activo,
        c.razon_social as comunidad_nombre, p.comunidad_id
      FROM proveedor p
      LEFT JOIN comunidad c ON p.comunidad_id = c.id
      WHERE p.activo = 1 
        AND (p.razon_social LIKE ? OR p.rut LIKE ? OR p.email LIKE ?)
      ORDER BY p.razon_social ASC
      LIMIT 50
    `, [searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error searching all proveedores:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ 3. GET / - ENDPOINT PRINCIPAL (USA AUTHPROVEEDORES)
router.get('/', authenticateProveedores, proveedoresPermissions.canView, async (req, res) => {
  try {
    const { user } = req;

    console.log('🚨 DEBUG GET / - req.user:', {
      username: user?.username,
      memberships: user?.memberships,
      roles: user?.roles,
      is_superadmin: user?.is_superadmin
    });

    // Si es superadmin, obtener todos
    if (user.is_superadmin) {
      const [rows] = await db.query(`
        SELECT 
          p.id, p.rut, p.dv, p.razon_social, p.giro, p.email, p.telefono, p.direccion, p.activo, p.created_at,
          c.razon_social as comunidad_nombre, p.comunidad_id
        FROM proveedor p
        LEFT JOIN comunidad c ON p.comunidad_id = c.id
        ORDER BY p.razon_social ASC
      `);

      const [statsRows] = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
          COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
          COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes
        FROM proveedor
      `);

      return res.json({
        success: true,
        data: rows,
        estadisticas: statsRows[0],
        view_mode: 'superadmin'
      });
    }

    // ✅ CORREGIDO: Usar comunidadId en lugar de comunidad_id
    const comunidadId = user.memberships?.[0]?.comunidadId;
    console.log('🏠 ComunidadId obtenido:', comunidadId);
    
    if (!comunidadId) {
      console.log('❌ No se pudo obtener comunidadId');
      return res.status(403).json({
        success: false,
        error: 'Usuario no tiene comunidad asignada',
        debug: {
          memberships: user.memberships,
          expected: 'comunidadId property in first membership'
        }
      });
    }

    // Diferentes datos según el rol
    const esResidente = user.roles?.includes('residente') || user.roles?.includes('propietario');
    const esConserje = user.roles?.includes('conserje');
    const esTesorero = user.roles?.includes('tesorero');
    const esComiteOAdmin = user.roles?.includes('comite') || user.roles?.includes('admin');

    let query, estadisticasQuery;

    if (esResidente) {
      // ✅ RESIDENTES: Solo contactos básicos
      query = `
        SELECT id, razon_social, giro, email, telefono, activo, created_at
        FROM proveedor 
        WHERE comunidad_id = ? AND activo = 1
        ORDER BY razon_social ASC
      `;
      estadisticasQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = 1 THEN 1 END) as activos
        FROM proveedor 
        WHERE comunidad_id = ?
      `;
    } else if (esConserje) {
      // ✅ CONSERJE: Contactos + dirección para coordinar servicios
      query = `
        SELECT id, razon_social, giro, email, telefono, direccion, activo, created_at
        FROM proveedor 
        WHERE comunidad_id = ? AND activo = 1
        ORDER BY razon_social ASC
      `;
      estadisticasQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = 1 THEN 1 END) as activos
        FROM proveedor 
        WHERE comunidad_id = ?
      `;
    } else if (esTesorero) {
      // ✅ TESORERO: Contactos + RUT para facturación
      query = `
        SELECT id, rut, dv, razon_social, giro, email, telefono, activo, created_at
        FROM proveedor 
        WHERE comunidad_id = ?
        ORDER BY razon_social ASC
      `;
      estadisticasQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
          COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
        FROM proveedor 
        WHERE comunidad_id = ?
      `;
    } else {
      // ✅ ADMIN/COMITÉ: Datos completos
      query = `
        SELECT id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at, calificacion
        FROM proveedor 
        WHERE comunidad_id = ?
        ORDER BY razon_social ASC
      `;
      estadisticasQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
          COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
          COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes,
          COALESCE(AVG(calificacion), 0) as calificacion_promedio
        FROM proveedor 
        WHERE comunidad_id = ?
      `;
    }

    const [rows] = await db.query(query, [comunidadId]);
    const [estadisticas] = await db.query(estadisticasQuery, [comunidadId]);

    console.log('✅ Proveedores encontrados para comunidad', comunidadId, ':', rows.length);

    res.json({
      success: true,
      data: rows,
      estadisticas: estadisticas[0],
      view_mode: esResidente ? 'resident' : 
                 esConserje ? 'conserje' : 
                 esTesorero ? 'tesorero' : 'admin'
    });

  } catch (error) {
    console.error('❌ Error fetching proveedores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ✅ 4. GET /comunidad/:comunidadId - POR COMUNIDAD ESPECÍFICA (USA AUTHPROVEEDORES)
router.get('/comunidad/:comunidadId', authenticateProveedores, proveedoresPermissions.canView, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { page = 1, limit = 100, sort, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = 'SELECT id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at FROM proveedor WHERE comunidad_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM proveedor WHERE comunidad_id = ?';
    let params = [comunidadId];

    // Agregar búsqueda si existe
    if (search) {
      baseQuery += ' AND (razon_social LIKE ? OR rut LIKE ? OR email LIKE ?)';
      countQuery += ' AND (razon_social LIKE ? OR rut LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Agregar ordenamiento
    const sortField = sort === 'nombre' ? 'razon_social' : sort === 'fecha' ? 'created_at' : 'id';
    baseQuery += ` ORDER BY ${sortField} DESC LIMIT ? OFFSET ?`;

    // Ejecutar consultas
    const [rows] = await db.query(baseQuery, [...params, Number(limit), Number(offset)]);
    const [countResult] = await db.query(countQuery, params.slice(0, search ? 4 : 1));

    // Estadísticas
    const [estadisticas] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes,
        COALESCE(AVG(calificacion), 0) as calificacion_promedio
      FROM proveedor 
      WHERE comunidad_id = ?
    `, [comunidadId]);

    res.json({
      success: true,
      data: rows,
      estadisticas: estadisticas[0],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching proveedores:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ 5. GET /comunidad/:comunidadId/estadisticas - ESTADÍSTICAS POR COMUNIDAD (USA AUTHPROVEEDORES)
router.get('/comunidad/:comunidadId/estadisticas', authenticateProveedores, proveedoresPermissions.canView, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);

  try {
    const [estadisticas] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes,
        COALESCE(AVG(calificacion), 0) as calificacion_promedio
      FROM proveedor 
      WHERE comunidad_id = ?
    `, [comunidadId]);

    res.json({
      success: true,
      data: estadisticas[0]
    });

  } catch (error) {
    console.error('Error fetching estadisticas:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ 6. GET /comunidad/:comunidadId/search - BÚSQUEDA POR COMUNIDAD (USA AUTHPROVEEDORES)
router.get('/comunidad/:comunidadId/search', authenticateProveedores, proveedoresPermissions.canView, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ success: true, data: [] });
  }

  try {
    const searchTerm = `%${q.trim()}%`;
    const [rows] = await db.query(`
      SELECT id, rut, dv, razon_social, email, telefono, activo 
      FROM proveedor 
      WHERE comunidad_id = ? 
        AND activo = 1 
        AND (razon_social LIKE ? OR rut LIKE ? OR email LIKE ?)
      ORDER BY razon_social ASC
      LIMIT 20
    `, [comunidadId, searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error searching proveedores:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ 7. GET /comunidad/:comunidadId/publicos - PARA RESIDENTES (USA AUTHPROVEEDORES)
router.get('/comunidad/:comunidadId/publicos', authenticateProveedores, proveedoresPermissions.canView, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  const { user } = req;

  try {
    // Datos limitados para residentes
    if (user.roles?.includes('residente') || user.roles?.includes('propietario')) {

      const [rows] = await db.query(`
        SELECT 
          id, 
          razon_social, 
          giro, 
          email, 
          telefono,
          activo
        FROM proveedor 
        WHERE comunidad_id = ? AND activo = 1
        ORDER BY razon_social ASC
      `, [comunidadId]);

      // Estadísticas básicas para residentes
      const [estadisticas] = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = 1 THEN 1 END) as activos
        FROM proveedor 
        WHERE comunidad_id = ?
      `, [comunidadId]);

      return res.json({
        success: true,
        data: rows,
        estadisticas: {
          total: estadisticas[0].total,
          activos: estadisticas[0].activos
        },
        view_mode: 'public'
      });
    }

    // Datos completos para admin/comité
    const [rows] = await db.query(`
      SELECT 
        id, rut, dv, razon_social, giro, email, telefono, direccion, 
        activo, created_at, calificacion
      FROM proveedor 
      WHERE comunidad_id = ?
      ORDER BY razon_social ASC
    `, [comunidadId]);

    const [estadisticas] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as nuevos_mes,
        COALESCE(AVG(calificacion), 0) as calificacion_promedio
      FROM proveedor 
      WHERE comunidad_id = ?
    `, [comunidadId]);

    res.json({
      success: true,
      data: rows,
      estadisticas: estadisticas[0],
      view_mode: 'full'
    });

  } catch (error) {
    console.error('Error fetching proveedores públicos:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// ✅ 8. POST /comunidad/:comunidadId - CREAR PROVEEDOR (USA AUTHPROVEEDORES)
router.post('/comunidad/:comunidadId', [
  authenticateProveedores,
  proveedoresPermissions.canCreate,
  requireCommunity('comunidadId', ['admin']),
  body('rut').notEmpty().withMessage('RUT requerido'),
  body('dv').notEmpty().withMessage('Dígito verificador requerido'),
  body('razon_social').notEmpty().withMessage('Razón social requerida'),
  body('email').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: errors.array()
    });
  }

  const comunidadId = Number(req.params.comunidadId);
  const { rut, dv, razon_social, giro, email, telefono, direccion } = req.body;

  try {
    // Verificar si ya existe
    const [existing] = await db.query('SELECT id FROM proveedor WHERE rut = ? AND dv = ? AND comunidad_id = ?', [rut, dv, comunidadId]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un proveedor con este RUT'
      });
    }

    // Insertar proveedor
    const [result] = await db.query(`
      INSERT INTO proveedor (
        comunidad_id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [comunidadId, rut, dv, razon_social, giro || null, email || null, telefono || null, direccion || null]);

    // Obtener el proveedor creado
    const [newProveedor] = await db.query(`
      SELECT id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at 
      FROM proveedor WHERE id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newProveedor[0],
      message: 'Proveedor creado exitosamente'
    });

  } catch (err) {
    console.error('Error creating proveedor:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ✅ 9. GET /:id - OBTENER PROVEEDOR POR ID (USA AUTHPROVEEDORES)
router.get('/:id', authenticateProveedores, proveedoresPermissions.canView, proveedoresPermissions.canAccessProveedor, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.razon_social as comunidad_nombre
      FROM proveedor p
      LEFT JOIN comunidad c ON p.comunidad_id = c.id
      WHERE p.id = ? 
      LIMIT 1
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Error fetching proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ✅ 10. PATCH /:id - ACTUALIZAR PROVEEDOR (USA AUTHPROVEEDORES)
router.patch('/:id', authenticateProveedores, proveedoresPermissions.canEdit, proveedoresPermissions.canAccessProveedor, async (req, res) => {
  const id = Number(req.params.id);
  const fields = ['rut', 'dv', 'razon_social', 'giro', 'email', 'telefono', 'direccion'];
  const updates = [];
  const values = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (!updates.length) {
    return res.status(400).json({
      success: false,
      error: 'No hay campos para actualizar'
    });
  }

  values.push(id);

  try {
    await db.query(`UPDATE proveedor SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await db.query(`
      SELECT id, rut, dv, razon_social, giro, email, telefono, direccion, activo, created_at
      FROM proveedor WHERE id = ? LIMIT 1
    `, [id]);

    res.json({
      success: true,
      data: rows[0],
      message: 'Proveedor actualizado exitosamente'
    });

  } catch (err) {
    console.error('Error updating proveedor:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ✅ 11. PATCH /:id/toggle - TOGGLE DE ESTADO (USA AUTHPROVEEDORES)
router.patch('/:id/toggle', authenticateProveedores, proveedoresPermissions.canEdit, proveedoresPermissions.canAccessProveedor, async (req, res) => {
  const id = Number(req.params.id);

  try {
    // Obtener estado actual
    const [current] = await db.query('SELECT activo FROM proveedor WHERE id = ?', [id]);
    if (!current.length) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    const nuevoEstado = current[0].activo ? 0 : 1;

    // Actualizar estado
    await db.query('UPDATE proveedor SET activo = ? WHERE id = ?', [nuevoEstado, id]);

    res.json({
      success: true,
      data: { id, activo: nuevoEstado === 1 },
      message: `Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error toggling proveedor:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ✅ 12. PATCH /:id/estado - CAMBIAR ESTADO ESPECÍFICO (USA AUTHPROVEEDORES)
router.patch('/:id/estado', authenticateProveedores, proveedoresPermissions.canEdit, proveedoresPermissions.canAccessProveedor, async (req, res) => {
  const id = Number(req.params.id);
  const { activo } = req.body;

  try {
    await db.query('UPDATE proveedor SET activo = ? WHERE id = ?', [activo, id]);

    res.json({
      success: true,
      data: { id, activo },
      message: `Proveedor ${activo ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ✅ 13. DELETE /:id - ELIMINAR PROVEEDOR (USA AUTHPROVEEDORES)
router.delete('/:id', authenticateProveedores, proveedoresPermissions.canDelete, proveedoresPermissions.canAccessProveedor, async (req, res) => {
  const id = Number(req.params.id);

  try {
    // Verificar si tiene gastos asociados
    const [gastos] = await db.query('SELECT COUNT(*) as count FROM gasto WHERE proveedor_id = ?', [id]);

    if (gastos[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un proveedor que tiene gastos asociados'
      });
    }

    // Eliminar proveedor
    const [result] = await db.query('DELETE FROM proveedor WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });

  } catch (err) {
    console.error('Error deleting proveedor:', err);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;