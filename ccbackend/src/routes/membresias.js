// ...existing code...
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
 *   - name: Membresias
 *     description: |
 *       Gestión de membresías y roles de usuarios en comunidades.
 *       
 *       **Sistema de Roles (v2.0):**
 *       El sistema utiliza una tabla `usuario_comunidad_rol` que asigna roles jerárquicos a usuarios por comunidad.
 *       
 *       **Roles disponibles:**
 *       1. `superadmin` - Super Administrador (nivel 1)
 *       2. `admin` - Administrador (nivel 2)
 *       3. `comite` - Comité (nivel 3)
 *       4. `contador` - Contador (nivel 4)
 *       5. `conserje` - Conserje (nivel 5)
 *       6. `propietario` - Propietario (nivel 6)
 *       7. `residente` - Residente (nivel 7)
 *       
 *       **Nota:** Nivel de acceso menor = mayor privilegio
 * 
 * /comunidad/{comunidadId}:
 *   get:
 *     tags: [Membresias]
 *     summary: Listar membresías de una comunidad
 *     description: Obtiene todas las membresías activas e inactivas de una comunidad con información de roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de membresías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Membresia'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permisos en esta comunidad
 *       500:
 *         description: Error del servidor
 */

// List membresias for comunidad (members only)
router.get('/comunidad/:comunidadId', authenticate, requireCommunity('comunidadId'), async (req, res) => {
  const comunidadId = Number(req.params.comunidadId);
  // Usar nueva tabla usuario_comunidad_rol con JOIN a rol y usuario
  const [rows] = await db.query(`
    SELECT 
      ucr.id, 
      ucr.usuario_id,
      u.persona_id,
      r.codigo as rol,
      r.nombre as rol_nombre,
      r.nivel_acceso,
      ucr.desde,
      ucr.hasta,
      ucr.activo
    FROM usuario_comunidad_rol ucr
    INNER JOIN rol r ON r.id = ucr.rol_id
    INNER JOIN usuario u ON u.id = ucr.usuario_id
    WHERE ucr.comunidad_id = ?
    ORDER BY r.nivel_acceso ASC
    LIMIT 500
  `, [comunidadId]);
  res.json(rows);
});

/**
 * @openapi
 * /comunidad/{comunidadId}:
 *   post:
 *     tags: [Membresias]
 *     summary: Crear nueva membresía
 *     description: |
 *       Asigna un rol a un usuario en una comunidad específica.
 *       
 *       **⚠️ Breaking Change (v2.0):**
 *       - Ahora requiere `usuario_id` (antes `persona_id`)
 *       - Ahora requiere `rol_id` numérico (antes `rol` como string)
 *       
 *       **Solo administradores pueden crear membresías.**
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - rol_id
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 description: ID del usuario a asignar
 *                 example: 1
 *               rol_id:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 description: ID del rol (1=superadmin, 2=admin, ..., 7=residente)
 *                 example: 2
 *               desde:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio (por defecto hoy)
 *                 example: "2025-01-01"
 *               hasta:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha de fin (null = indefinido)
 *                 example: "2025-12-31"
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 description: Si la membresía está activa
 *     responses:
 *       201:
 *         description: Membresía creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membresia'
 *       400:
 *         description: Rol inválido o datos incorrectos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permisos de administrador
 *       500:
 *         description: Error del servidor
 */

// Create membresia (admin of comunidad or superadmin)
router.post('/comunidad/:comunidadId', [
  authenticate, 
  requireCommunity('comunidadId', ['admin']), 
  body('usuario_id').isInt(), 
  body('rol_id').isInt()
], async (req, res) => {
  const errors = validationResult(req); 
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const comunidadId = Number(req.params.comunidadId);
  const { usuario_id, rol_id, activo, desde, hasta } = req.body;
  
  // Verificar que el rol existe
  const [rolRows] = await db.query('SELECT id, codigo FROM rol WHERE id = ? LIMIT 1', [rol_id]);
  if (!rolRows.length) return res.status(400).json({ error: 'invalid rol_id' });
  
  const desdeVal = desde || new Date().toISOString().slice(0,10); // YYYY-MM-DD
  
  try {
    const [result] = await db.query(
      'INSERT INTO usuario_comunidad_rol (comunidad_id, usuario_id, rol_id, desde, hasta, activo) VALUES (?,?,?,?,?,?)', 
      [comunidadId, usuario_id, rol_id, desdeVal, hasta || null, typeof activo === 'undefined' ? 1 : (activo ? 1 : 0)]
    );
    
    const [row] = await db.query(`
      SELECT 
        ucr.id, 
        ucr.usuario_id,
        u.persona_id,
        r.codigo as rol,
        r.nombre as rol_nombre,
        ucr.desde, 
        ucr.hasta, 
        ucr.activo 
      FROM usuario_comunidad_rol ucr
      INNER JOIN rol r ON r.id = ucr.rol_id
      INNER JOIN usuario u ON u.id = ucr.usuario_id
      WHERE ucr.id = ? 
      LIMIT 1
    `, [result.insertId]);
    
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /membresias/{id}:
 *   patch:
 *     tags: [Membresias]
 *     summary: Actualizar una membresía existente
 *     description: |
 *       Permite actualizar los datos de una membresía (rol, estado activo, fecha de vencimiento).
 *       Solo administradores o superadministradores pueden usar este endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la membresía (registro en usuario_comunidad_rol)
 *     requestBody:
 *       description: Campos a actualizar (solo los campos enviados serán modificados)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol_id:
 *                 type: integer
 *                 description: Nuevo rol (1=superadmin, 2=admin, 3=tesorero, 4=secretario, 5=directivo, 6=propietario, 7=residente)
 *                 example: 3
 *               activo:
 *                 type: boolean
 *                 description: Estado de la membresía
 *                 example: true
 *               hasta:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento de la membresía (YYYY-MM-DD)
 *                 example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Membresía actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membresia'
 *       400:
 *         description: No se enviaron campos para actualizar
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permisos (requiere admin o superadmin)
 *       500:
 *         description: Error del servidor
 */

// Patch membresia (admin/superadmin)
router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id; 
  const allowedFields = ['rol_id', 'activo', 'hasta']; 
  const updates = []; 
  const values = [];
  
  allowedFields.forEach(f => { 
    if (req.body[f] !== undefined) { 
      updates.push(`${f} = ?`); 
      values.push(req.body[f]); 
    } 
  }); 
  
  if (!updates.length) return res.status(400).json({ error: 'no fields to update' }); 
  values.push(id);
  
  try { 
    await db.query(`UPDATE usuario_comunidad_rol SET ${updates.join(', ')} WHERE id = ?`, values); 
    const [rows] = await db.query(`
      SELECT 
        ucr.id, 
        ucr.usuario_id,
        u.persona_id,
        r.codigo as rol,
        r.nombre as rol_nombre,
        ucr.activo 
      FROM usuario_comunidad_rol ucr
      INNER JOIN rol r ON r.id = ucr.rol_id
      INNER JOIN usuario u ON u.id = ucr.usuario_id
      WHERE ucr.id = ? 
      LIMIT 1
    `, [id]); 
    res.json(rows[0]); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'server error' }); 
  }
});

/**
 * @swagger
 * /membresias/{id}:
 *   delete:
 *     tags: [Membresias]
 *     summary: Eliminar una membresía
 *     description: |
 *       Elimina permanentemente una membresía de un usuario en una comunidad.
 *       Solo administradores o superadministradores pueden usar este endpoint.
 *       
 *       ⚠️ **PRECAUCIÓN**: Esta acción no puede deshacerse. El usuario perderá todo acceso a la comunidad.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la membresía a eliminar (registro en usuario_comunidad_rol)
 *     responses:
 *       204:
 *         description: Membresía eliminada exitosamente (sin contenido)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permisos (requiere admin o superadmin)
 *       500:
 *         description: Error del servidor
 */

router.delete('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { 
  const id = req.params.id; 
  try { 
    await db.query('DELETE FROM usuario_comunidad_rol WHERE id = ?', [id]); 
    res.status(204).end(); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'server error' }); 
  } 
});

module.exports = router;