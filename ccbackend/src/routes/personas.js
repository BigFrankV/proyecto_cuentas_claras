const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize, allowSelfOrRoles } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Personas
 *     description: Gestión de personas
 */

/**
 * @openapi
 * /personas:
 *   get:
 *     tags: [Personas]
 *     summary: Listar personas con filtros avanzados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rut
 *         schema:
 *           type: string
 *         description: Filtrar por RUT específico
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda general por nombre, email o RUT
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Administrador, Inquilino, Propietario]
 *         description: Filtrar por tipo de persona
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo]
 *         description: Filtrar por estado del usuario
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 500
 *         description: Número máximo de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
 */
router.get('/', authenticate, async (req, res) => {
  const { rut, search, tipo, estado, limit = 500, offset = 0 } = req.query;
  
  try {
    // ✅ Superadmin ve TODAS las personas
    if (req.user.is_superadmin) {
      let query = `
        SELECT
          p.id,
          COALESCE(p.nombres, '') AS nombres,
          COALESCE(p.apellidos, '') AS apellidos,
          COALESCE(p.rut, '') AS rut,
          COALESCE(p.dv, '') AS dv,
          COALESCE(p.email, '') AS email,
          COALESCE(p.telefono, '') AS telefono,
          p.direccion,
          DATE(p.created_at) AS fecha_registro,
          DATE(u.created_at) AS ultimo_acceso,
          CASE
            WHEN EXISTS (
              SELECT 1 FROM usuario_rol_comunidad ucr
              JOIN rol_sistema r ON r.id = ucr.rol_id
              WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
            ) THEN 'Administrador'
            WHEN EXISTS (
              SELECT 1 FROM titulares_unidad tu
              WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
              AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
            ) THEN 'Inquilino'
            ELSE 'Propietario'
          END AS tipo,
          CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
          COALESCE((
            SELECT COUNT(*) FROM titulares_unidad tu
            WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
          ), 0) AS unidades,
          COALESCE(DATE(u.created_at), DATE(p.created_at)) AS fechaRegistro,
          (
            SELECT CONCAT('/uploads/', a.filename)
            FROM archivos a
            WHERE a.entity_type = 'personas'
              AND a.entity_id = p.id
              AND a.category = 'avatar'
              AND a.is_active = 1
            ORDER BY a.uploaded_at DESC
            LIMIT 1
          ) AS avatar,
          u.id AS usuario_id,
          u.username,
          CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS usuario_estado,
          'usuario' AS nivel_acceso
        FROM persona p
        LEFT JOIN usuario u ON u.persona_id = p.id
        WHERE 1 = 1
      `;
      const params = [];

      // Filtro por RUT específico
      if (rut) {
        query += ' AND p.rut = ?';
        params.push(rut);
      }

      // Filtro de búsqueda general
      if (search) {
        query += ` AND (CONCAT(COALESCE(p.nombres, ''), ' ', COALESCE(p.apellidos, '')) LIKE ?
                       OR COALESCE(p.email, '') LIKE ?
                       OR CONCAT(COALESCE(p.rut, ''), '-', COALESCE(p.dv, '')) LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Filtro por tipo
      if (tipo) {
        if (tipo === 'Administrador') {
          query += ` AND EXISTS (
            SELECT 1 FROM usuario_rol_comunidad ucr
            JOIN rol_sistema r ON r.id = ucr.rol_id
            WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
          )`;
        } else if (tipo === 'Inquilino') {
          query += ` AND EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
            AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
          )`;
        } else if (tipo === 'Propietario') {
          query += ` AND NOT EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
            AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
          ) AND NOT EXISTS (
            SELECT 1 FROM usuario_rol_comunidad ucr
            JOIN rol_sistema r ON r.id = ucr.rol_id
            WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
          )`;
        }
      }

      // Filtro por estado
      if (estado) {
        const activoValue = estado === 'Activo' ? 1 : 0;
        query += ' AND COALESCE(u.activo, 0) = ?';
        params.push(activoValue);
      }

      query += ' ORDER BY p.apellidos, p.nombres LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await db.query(query, params);
      const personas = rows.map(row => {
        const persona = { ...row };
        if (row.usuario_id) {
          persona.usuario = {
            id: row.usuario_id,
            username: row.username,
            estado: row.usuario_estado,
            nivel_acceso: row.nivel_acceso
          };
        }
        delete persona.usuario_id;
        delete persona.username;
        delete persona.usuario_estado;
        delete persona.nivel_acceso;
        return persona;
      });
      return res.json(personas);
    }

    // ✅ Usuarios normales solo ven personas de SUS comunidades
    const personaId = req.user.persona_id;
    if (!personaId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    let query = `
      SELECT DISTINCT
        p.id,
        COALESCE(p.nombres, '') AS nombres,
        COALESCE(p.apellidos, '') AS apellidos,
        COALESCE(p.rut, '') AS rut,
        COALESCE(p.dv, '') AS dv,
        COALESCE(p.email, '') AS email,
        COALESCE(p.telefono, '') AS telefono,
        p.direccion,
        DATE(p.created_at) AS fecha_registro,
        DATE(u.created_at) AS ultimo_acceso,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM usuario_rol_comunidad ucr
            JOIN rol_sistema r ON r.id = ucr.rol_id
            WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
          ) THEN 'Administrador'
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
            AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
          ) THEN 'Inquilino'
          ELSE 'Propietario'
        END AS tipo,
        CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
        COALESCE((
          SELECT COUNT(*) FROM titulares_unidad tu
          WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        ), 0) AS unidades,
        COALESCE(DATE(u.created_at), DATE(p.created_at)) AS fechaRegistro,
        (
          SELECT CONCAT('/uploads/', a.filename)
          FROM archivos a
          WHERE a.entity_type = 'personas'
            AND a.entity_id = p.id
            AND a.category = 'avatar'
            AND a.is_active = 1
          ORDER BY a.uploaded_at DESC
          LIMIT 1
        ) AS avatar,
        u.id AS usuario_id,
        u.username,
        CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS usuario_estado,
        'usuario' AS nivel_acceso
      FROM persona p
      LEFT JOIN usuario u ON u.persona_id = p.id
      JOIN usuario_miembro_comunidad mc ON p.id = mc.persona_id
      WHERE mc.comunidad_id IN (
        SELECT comunidad_id FROM usuario_miembro_comunidad 
        WHERE persona_id = ? AND activo = 1
      )
    `;
    const params = [personaId];

    // Filtro por RUT específico
    if (rut) {
      query += ' AND p.rut = ?';
      params.push(rut);
    }

    // Filtro de búsqueda general
    if (search) {
      query += ` AND (CONCAT(COALESCE(p.nombres, ''), ' ', COALESCE(p.apellidos, '')) LIKE ?
                     OR COALESCE(p.email, '') LIKE ?
                     OR CONCAT(COALESCE(p.rut, ''), '-', COALESCE(p.dv, '')) LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Filtro por tipo
    if (tipo) {
      if (tipo === 'Administrador') {
        query += ` AND EXISTS (
          SELECT 1 FROM usuario_rol_comunidad ucr
          JOIN rol_sistema r ON r.id = ucr.rol_id
          WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
        )`;
      } else if (tipo === 'Inquilino') {
        query += ` AND EXISTS (
          SELECT 1 FROM titulares_unidad tu
          WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
          AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        )`;
      } else if (tipo === 'Propietario') {
        query += ` AND NOT EXISTS (
          SELECT 1 FROM titulares_unidad tu
          WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
          AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        ) AND NOT EXISTS (
          SELECT 1 FROM usuario_rol_comunidad ucr
          JOIN rol_sistema r ON r.id = ucr.rol_id
          WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
        )`;
      }
    }

    // Filtro por estado
    if (estado) {
      const activoValue = estado === 'Activo' ? 1 : 0;
      query += ' AND COALESCE(u.activo, 0) = ?';
      params.push(activoValue);
    }

    query += ' ORDER BY p.apellidos, p.nombres LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    const personas = rows.map(row => {
      const persona = { ...row };
      if (row.usuario_id) {
        persona.usuario = {
          id: row.usuario_id,
          username: row.username,
          estado: row.usuario_estado,
          nivel_acceso: row.nivel_acceso
        };
      }
      delete persona.usuario_id;
      delete persona.username;
      delete persona.usuario_estado;
      delete persona.nivel_acceso;
      return persona;
    });
    res.json(personas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas:
 *   post:
 *     tags: [Personas]
 *     summary: Crear persona
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rut,dv,nombres,apellidos]
 *             properties:
 *               rut:
 *                 type: string
 *               dv:
 *                 type: string
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', [authenticate, authorize('admin','superadmin'), body('rut').notEmpty(), body('dv').notEmpty(), body('nombres').notEmpty(), body('apellidos').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { rut,dv,nombres,apellidos,email,telefono,direccion } = req.body;
  try {
    const [result] = await db.query('INSERT INTO persona (rut,dv,nombres,apellidos,email,telefono,direccion) VALUES (?,?,?,?,?,?,?)', [rut,dv,nombres,apellidos,email||null,telefono||null,direccion||null]);
    const [row] = await db.query('SELECT id, rut, dv, nombres, apellidos FROM persona WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener persona por id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Persona
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.rut,
        p.dv,
        CONCAT(p.rut, '-', p.dv) AS dni_completo,
        p.nombres,
        p.apellidos,
        CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
        p.email,
        p.telefono,
        p.direccion,
        u.username,
        COALESCE(u.activo, 0) AS usuario_activo,
        DATE(COALESCE(u.created_at, p.created_at)) AS fechaRegistro,
        (
          SELECT DATE(a.created_at)
          FROM auditoria a
          WHERE a.usuario_id = u.id AND a.accion = 'login'
          ORDER BY a.created_at DESC
          LIMIT 1
        ) AS ultimoAcceso,
        (
          SELECT r.nombre
          FROM usuario_rol_comunidad ucr
          JOIN rol_sistema r ON r.id = ucr.rol_id
          WHERE ucr.usuario_id = u.id AND ucr.activo = 1
          ORDER BY r.nivel_acceso DESC
          LIMIT 1
        ) AS nivelAcceso,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM usuario_rol_comunidad ucr
            JOIN rol_sistema r ON r.id = ucr.rol_id
            WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
          ) THEN 'Administrador'
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
            AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
          ) THEN 'Inquilino'
          ELSE 'Propietario'
        END AS tipo,
        CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
        COALESCE((
          SELECT COUNT(*) FROM titulares_unidad tu
          WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        ), 0) AS total_unidades,
        COALESCE((
          SELECT SUM(cu.saldo)
          FROM cuenta_cobro_unidad cu
          JOIN titulares_unidad tu ON tu.unidad_id = cu.unidad_id
          WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        ), 0) AS saldo_total,
        (
          SELECT CONCAT('/uploads/', a.filename)
          FROM archivos a
          WHERE a.entity_type = 'personas'
            AND a.entity_id = p.id
            AND a.category = 'avatar'
            AND a.is_active = 1
          ORDER BY a.uploaded_at DESC
          LIMIT 1
        ) AS avatar
      FROM persona p
      LEFT JOIN usuario u ON u.persona_id = p.id
      WHERE p.id = ?
      LIMIT 1
    `, [id]);
    
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}:
 *   patch:
 *     tags: [Personas]
 *     summary: Actualizar persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', authenticate, allowSelfOrRoles('id', 'admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  const fields = ['rut','dv','nombres','apellidos','email','telefono','direccion'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try {
    await db.query(`UPDATE persona SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT id, rut, dv, nombres, apellidos FROM persona WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}:
 *   put:
 *     tags: [Personas]
 *     summary: Reemplazar persona completamente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rut,dv,nombres,apellidos]
 *             properties:
 *               rut:
 *                 type: string
 *               dv:
 *                 type: string
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Replaced
 */
router.put('/:id', [authenticate, allowSelfOrRoles('id', 'admin','superadmin'), body('rut').notEmpty(), body('dv').notEmpty(), body('nombres').notEmpty(), body('apellidos').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = req.params.id;
  const { rut, dv, nombres, apellidos, email, telefono, direccion } = req.body;
  try {
    await db.query('UPDATE persona SET rut = ?, dv = ?, nombres = ?, apellidos = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?', [rut, dv, nombres, apellidos, email || null, telefono || null, direccion || null, id]);
    const [rows] = await db.query('SELECT id, rut, dv, nombres, apellidos FROM persona WHERE id = ? LIMIT 1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}:
 *   delete:
 *     tags: [Personas]
 *     summary: Eliminar persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/:id', authenticate, allowSelfOrRoles('id', 'admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  try {
    // only admins or self (allowSelfOrRoles applied) reach here
    await db.query('DELETE FROM persona WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/estadisticas:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener estadísticas de personas para dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de personas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_personas:
 *                   type: integer
 *                 administradores:
 *                   type: integer
 *                 inquilinos:
 *                   type: integer
 *                 propietarios:
 *                   type: integer
 *                 activos:
 *                   type: integer
 *                 inactivos:
 *                   type: integer
 */
router.get('/estadisticas', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(DISTINCT p.id) AS total_personas,
        COUNT(DISTINCT CASE WHEN EXISTS (
          SELECT 1 FROM usuario_rol_comunidad ucr
          JOIN rol_sistema r ON r.id = ucr.rol_id
          WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
        ) THEN p.id END) AS administradores,
        COUNT(DISTINCT CASE WHEN EXISTS (
          SELECT 1 FROM titulares_unidad tu
          WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
          AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        ) THEN p.id END) AS inquilinos,
        COUNT(DISTINCT CASE WHEN NOT EXISTS (
          SELECT 1 FROM titulares_unidad tu
          WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
          AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
        ) AND NOT EXISTS (
          SELECT 1 FROM usuario_rol_comunidad ucr
          JOIN rol_sistema r ON r.id = ucr.rol_id
          WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
        ) THEN p.id END) AS propietarios,
        COUNT(DISTINCT CASE WHEN COALESCE(u.activo, 0) = 1 THEN p.id END) AS activos,
        COUNT(DISTINCT CASE WHEN COALESCE(u.activo, 0) = 0 OR u.activo IS NULL THEN p.id END) AS inactivos
      FROM persona p
      LEFT JOIN usuario u ON u.persona_id = p.id
    `);
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/unidades:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener unidades asociadas a una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de unidades
 */
router.get('/:id/unidades', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        u.id,
        u.codigo AS nombre,
        e.nombre AS edificio,
        t.nombre AS torre,
        c.razon_social AS comunidad,
        CONCAT(
          COALESCE(e.direccion, ''),
          CASE WHEN e.direccion IS NOT NULL AND (t.nombre IS NOT NULL OR u.codigo IS NOT NULL) THEN ', ' ELSE '' END,
          COALESCE(t.nombre, ''),
          CASE WHEN t.nombre IS NOT NULL AND u.codigo IS NOT NULL THEN ', ' ELSE '' END,
          COALESCE(u.codigo, '')
        ) AS direccion,
        u.m2_utiles AS metrosCuadrados,
        CASE WHEN u.activa = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
        COALESCE((
          SELECT SUM(cu.saldo)
          FROM cuenta_cobro_unidad cu
          WHERE cu.unidad_id = u.id
        ), 0) AS saldoPendiente,
        CASE WHEN tu.tipo = 'propietario' THEN 'Propietario' ELSE 'Inquilino' END AS relacion,
        DATE(tu.desde) AS fecha_asignacion,
        DATE(tu.hasta) AS fecha_fin,
        tu.porcentaje
      FROM titulares_unidad tu
      JOIN unidad u ON u.id = tu.unidad_id
      LEFT JOIN edificio e ON e.id = u.edificio_id
      LEFT JOIN torre t ON t.id = u.torre_id
      LEFT JOIN comunidad c ON c.id = u.comunidad_id
      WHERE tu.persona_id = ?
        AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      ORDER BY tu.desde DESC
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/pagos:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener pagos realizados por una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/:id/pagos', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        DATE(p.fecha) AS fecha,
        u.codigo AS unidad,
        COALESCE(eg.periodo, 'Sin periodo') AS periodo,
        p.monto AS importe,
        p.medio AS metodo,
        CASE
          WHEN p.estado = 'aplicado' THEN 'Pagado'
          WHEN p.estado = 'pendiente' THEN 'Pendiente'
          ELSE p.estado
        END AS estado,
        p.referencia,
        p.comprobante_num,
        c.razon_social AS comunidad
      FROM pago p
      JOIN unidad u ON u.id = p.unidad_id
      LEFT JOIN comunidad c ON c.id = u.comunidad_id
      LEFT JOIN pago_aplicacion pa ON pa.pago_id = p.id
      LEFT JOIN cuenta_cobro_unidad ccu ON ccu.id = pa.cuenta_cobro_unidad_id
      LEFT JOIN emision_gastos_comunes eg ON eg.id = ccu.emision_id
      WHERE EXISTS (
        SELECT 1 FROM titulares_unidad tu
        WHERE tu.persona_id = ? AND tu.unidad_id = p.unidad_id
          AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      )
      GROUP BY p.id, p.fecha, p.monto, p.medio, p.referencia, p.estado, p.comprobante_num, u.codigo, c.razon_social, eg.periodo
      ORDER BY p.fecha DESC
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/actividad:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener actividad/auditoría de una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de actividades
 */
router.get('/:id/actividad', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        DATE(a.created_at) AS fecha,
        TIME(a.created_at) AS hora,
        a.created_at AS fecha_completa,
        CASE
          WHEN a.accion = 'login' THEN 'Inicio de sesión'
          WHEN a.accion = 'logout' THEN 'Cierre de sesión'
          WHEN a.accion = 'insert' THEN CONCAT('Creó registro en ', a.tabla)
          WHEN a.accion = 'update' THEN CONCAT('Actualizó registro en ', a.tabla)
          WHEN a.accion = 'delete' THEN CONCAT('Eliminó registro en ', a.tabla)
          ELSE CONCAT(a.accion, ' en ', a.tabla)
        END AS titulo,
        CASE
          WHEN a.accion = 'login' THEN 'El usuario inició sesión en el sistema'
          WHEN a.accion = 'logout' THEN 'El usuario cerró sesión en el sistema'
          WHEN a.accion IN ('insert', 'update', 'delete') THEN
            CONCAT('Se realizó una operación de ', a.accion, ' en la tabla ', a.tabla,
                   CASE WHEN a.registro_id IS NOT NULL THEN CONCAT(' (ID: ', a.registro_id, ')') ELSE '' END)
          ELSE CONCAT('Acción: ', a.accion, ' en tabla: ', a.tabla)
        END AS descripcion,
        a.ip_address,
        a.valores_anteriores,
        a.valores_nuevos
      FROM auditoria a
      WHERE a.usuario_id = (SELECT id FROM usuario WHERE persona_id = ?)
      ORDER BY a.created_at DESC
      LIMIT 100
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/documentos:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener documentos asociados a una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de documentos
 */
router.get('/:id/documentos', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        a.id,
        a.original_name AS nombre,
        a.filename,
        a.category AS tipo,
        DATE(a.uploaded_at) AS fecha,
        ROUND(a.file_size / 1024, 1) AS tamaño_kb,
        CASE
          WHEN a.file_size < 1024 THEN CONCAT(a.file_size, ' B')
          WHEN a.file_size < 1048576 THEN CONCAT(ROUND(a.file_size / 1024, 1), ' KB')
          ELSE CONCAT(ROUND(a.file_size / 1048576, 1), ' MB')
        END AS tamaño,
        CASE
          WHEN a.mimetype LIKE 'application/pdf' THEN 'picture_as_pdf'
          WHEN a.mimetype LIKE 'image/%' THEN 'image'
          WHEN a.mimetype LIKE 'application/msword' OR a.mimetype LIKE 'application/vnd.openxmlformats%' THEN 'description'
          ELSE 'insert_drive_file'
        END AS icono,
        a.description,
        CONCAT('/uploads/', a.filename) AS url,
        CONCAT(up.nombres, ' ', up.apellidos) AS subido_por
      FROM archivos a
      LEFT JOIN usuario uu ON uu.id = a.uploaded_by
      LEFT JOIN persona up ON up.id = uu.persona_id
      WHERE a.entity_type = 'personas'
        AND a.entity_id = ?
        AND a.is_active = 1
      ORDER BY a.uploaded_at DESC
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/notas:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener notas asociadas a una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de notas
 */
router.get('/:id/notas', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    // Combinar ambas opciones: registro_conserjeria y auditoria
    const [rows] = await db.query(`
      SELECT * FROM (
        SELECT
          rc.id,
          'Registro Conserjería' AS titulo,
          rc.detalle AS contenido,
          'Observación' AS tipo,
          DATE(rc.fecha_hora) AS fecha,
          TIME(rc.fecha_hora) AS hora,
          CONCAT(up.nombres, ' ', up.apellidos) AS autor,
          DATE(rc.created_at) AS fecha_actualizacion,
          rc.fecha_hora AS orden_fecha
        FROM registro_conserjeria rc
        LEFT JOIN usuario uu ON uu.id = rc.usuario_id
        LEFT JOIN persona up ON up.id = uu.persona_id
        WHERE rc.evento LIKE '%nota%' OR rc.evento LIKE '%observacion%'
        
        UNION ALL
        
        SELECT
          a.id,
          CONCAT('Actividad: ', a.accion) AS titulo,
          COALESCE(a.valores_anteriores, 'Sin detalles') AS contenido,
          'Actividad' AS tipo,
          DATE(a.created_at) AS fecha,
          TIME(a.created_at) AS hora,
          CONCAT(up.nombres, ' ', up.apellidos) AS autor,
          DATE(a.created_at) AS fecha_actualizacion,
          a.created_at AS orden_fecha
        FROM auditoria a
        LEFT JOIN usuario uu ON uu.id = a.usuario_id
        LEFT JOIN persona up ON up.id = uu.persona_id
        WHERE a.tabla = 'persona' AND a.registro_id = ?
      ) combined_notes
      ORDER BY orden_fecha DESC
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/roles:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener roles y comunidades de una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de roles y comunidades
 */
router.get('/:id/roles', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        ucr.id,
        c.razon_social AS comunidad_nombre,
        r.nombre AS rol_nombre,
        r.codigo AS rol_codigo,
        r.nivel_acceso,
        DATE(ucr.desde) AS desde,
        DATE(ucr.hasta) AS hasta,
        ucr.activo
      FROM usuario_rol_comunidad ucr
      JOIN comunidad c ON c.id = ucr.comunidad_id
      JOIN rol_sistema r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = (SELECT id FROM usuario WHERE persona_id = ?)
      ORDER BY ucr.activo DESC, r.nivel_acceso DESC, ucr.desde DESC
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/{id}/resumen-financiero:
 *   get:
 *     tags: [Personas]
 *     summary: Obtener resumen financiero de una persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resumen financiero por comunidad
 */
router.get('/:id/resumen-financiero', authenticate, async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT
        c.razon_social AS comunidad,
        COUNT(DISTINCT u.id) AS unidades,
        COALESCE(SUM(cu.saldo), 0) AS saldo_pendiente,
        COALESCE(SUM(CASE WHEN cu.estado = 'pagado' THEN cu.monto_total ELSE 0 END), 0) AS total_pagado,
        MAX(CASE WHEN p.fecha IS NOT NULL THEN DATE(p.fecha) END) AS ultimo_pago
      FROM titulares_unidad tu
      JOIN unidad u ON u.id = tu.unidad_id
      JOIN comunidad c ON c.id = u.comunidad_id
      LEFT JOIN cuenta_cobro_unidad cu ON cu.unidad_id = u.id
      LEFT JOIN pago p ON p.unidad_id = u.id AND p.estado = 'aplicado'
      WHERE tu.persona_id = ?
        AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      GROUP BY c.id, c.razon_social
      ORDER BY c.razon_social
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/validar:
 *   get:
 *     tags: [Personas]
 *     summary: Validar campos para crear/editar persona
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *           enum: [rut, username, email]
 *         required: true
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: exclude
 *         schema:
 *           type: integer
 *         description: ID de persona a excluir (para edición)
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar', authenticate, async (req, res) => {
  const { field, value, exclude } = req.query;
  const excludeId = exclude || 0;
  
  try {
    let query, params;
    
    switch (field) {
      case 'rut':
        query = 'SELECT COUNT(*) as existe FROM persona WHERE rut = ? AND id != ?';
        params = [value, excludeId];
        break;
      case 'username':
        query = 'SELECT COUNT(*) as existe FROM usuario WHERE username = ? AND persona_id != ?';
        params = [value, excludeId];
        break;
      case 'email':
        query = 'SELECT COUNT(*) as existe FROM persona WHERE email = ? AND id != ?';
        params = [value, excludeId];
        break;
      default:
        return res.status(400).json({ error: 'invalid field' });
    }
    
    const [rows] = await db.query(query, params);
    res.json({ exists: rows[0].existe > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /personas/unidades/autocompletar:
 *   get:
 *     tags: [Personas]
 *     summary: Autocompletar unidades para asignar a personas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de unidades para autocompletar
 */
router.get('/unidades/autocompletar', authenticate, async (req, res) => {
  const { search } = req.query;
  
  try {
    let query, params;
    
    if (search) {
      query = `
        SELECT
          u.id,
          u.codigo AS nombre,
          e.nombre AS edificio,
          t.nombre AS torre,
          c.razon_social AS comunidad,
          CONCAT(c.razon_social, ' - ', COALESCE(e.nombre, ''), ' - ', COALESCE(t.nombre, ''), ' - ', u.codigo) AS direccion_completa
        FROM unidad u
        LEFT JOIN edificio e ON e.id = u.edificio_id
        LEFT JOIN torre t ON t.id = u.torre_id
        LEFT JOIN comunidad c ON c.id = u.comunidad_id
        WHERE u.activa = 1
          AND (u.codigo LIKE ? OR c.razon_social LIKE ? OR e.nombre LIKE ? OR t.nombre LIKE ?)
        ORDER BY c.razon_social, e.nombre, t.nombre, u.codigo
        LIMIT 50
      `;
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    } else {
      query = `
        SELECT
          u.id,
          u.codigo AS nombre,
          e.nombre AS edificio,
          t.nombre AS torre,
          c.razon_social AS comunidad,
          CONCAT(c.razon_social, ' - ', COALESCE(e.nombre, ''), ' - ', COALESCE(t.nombre, ''), ' - ', u.codigo) AS direccion_completa
        FROM unidad u
        LEFT JOIN edificio e ON e.id = u.edificio_id
        LEFT JOIN torre t ON t.id = u.torre_id
        LEFT JOIN comunidad c ON c.id = u.comunidad_id
        WHERE u.activa = 1
        ORDER BY c.razon_social, e.nombre, t.nombre, u.codigo
        LIMIT 50
      `;
      params = [];
    }
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
