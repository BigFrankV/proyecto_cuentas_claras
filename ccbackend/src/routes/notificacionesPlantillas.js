const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// =========================================
// PLANTILLAS DE NOTIFICACIONES
// =========================================

/**
 * GET /notificaciones-plantillas
 * Listado de plantillas de notificación con filtros
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { comunidad_id, tipo, estado, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        p.id,
        p.nombre,
        p.tipo,
        p.asunto,
        p.contenido,
        p.variables,
        p.comunidad_id,
        c.razon_social AS comunidad,
        p.estado,
        p.created_at,
        p.updated_at
      FROM notificacion_plantilla p
      JOIN comunidad c ON p.comunidad_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND p.comunidad_id = ?';
      params.push(comunidad_id);
    }
    if (tipo) {
      query += ' AND p.tipo = ?';
      params.push(tipo);
    }
    if (estado) {
      query += ' AND p.estado = ?';
      params.push(estado);
    }

    query += ` ORDER BY p.nombre LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [plantillas] = await db.query(query, params);

    res.json({
      success: true,
      data: plantillas,
      count: plantillas.length,
    });
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /notificaciones-plantillas/:id
 * Obtener detalle de una plantilla
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        c.razon_social AS comunidad
      FROM notificacion_plantilla p
      JOIN comunidad c ON p.comunidad_id = c.id
      WHERE p.id = ?
    `;

    const [plantillas] = await db.query(query, [id]);

    if (plantillas.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Plantilla no encontrada' });
    }

    res.json({ success: true, data: plantillas[0] });
  } catch (error) {
    console.error('Error al obtener plantilla:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /notificaciones-plantillas
 * Crear nueva plantilla de notificación
 */
router.post(
  '/',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  [
    body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
    body('tipo')
      .trim()
      .notEmpty()
      .isIn(['email', 'sms', 'push', 'ambos'])
      .withMessage('Tipo inválido'),
    body('asunto').trim().notEmpty().withMessage('Asunto requerido'),
    body('contenido').trim().notEmpty().withMessage('Contenido requerido'),
    body('comunidad_id').isInt().withMessage('ID de comunidad inválido'),
    body('variables').optional().trim().escape(),
    body('estado')
      .optional()
      .isIn(['activa', 'inactiva', 'prueba'])
      .withMessage('Estado inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        nombre,
        tipo,
        asunto,
        contenido,
        comunidad_id,
        variables,
        estado = 'activa',
      } = req.body;

      // Verificar que la comunidad existe
      const [comunidades] = await db.query(
        'SELECT id FROM comunidad WHERE id = ?',
        [comunidad_id]
      );
      if (comunidades.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Comunidad no encontrada' });
      }

      // Verificar que el nombre sea único en la comunidad
      const [plantillasExistentes] = await db.query(
        'SELECT id FROM notificacion_plantilla WHERE nombre = ? AND comunidad_id = ?',
        [nombre, comunidad_id]
      );
      if (plantillasExistentes.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Ya existe una plantilla con ese nombre',
        });
      }

      // Crear la plantilla
      const insertQuery = `
        INSERT INTO notificacion_plantilla (
          nombre,
          tipo,
          asunto,
          contenido,
          comunidad_id,
          variables,
          estado,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.query(insertQuery, [
        nombre,
        tipo,
        asunto,
        contenido,
        comunidad_id,
        variables || null,
        estado,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'INSERT',
          'notificacion_plantilla',
          result.insertId,
          JSON.stringify({
            nombre,
            tipo,
            asunto,
            comunidad_id,
          }),
          req.ip,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Plantilla creada exitosamente',
        data: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /notificaciones-plantillas/:id
 * Actualizar plantilla de notificación
 */
router.put(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  [
    body('nombre')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Nombre no puede estar vacío'),
    body('tipo')
      .optional()
      .isIn(['email', 'sms', 'push', 'ambos'])
      .withMessage('Tipo inválido'),
    body('asunto')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Asunto no puede estar vacío'),
    body('contenido')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Contenido no puede estar vacío'),
    body('variables').optional().trim().escape(),
    body('estado')
      .optional()
      .isIn(['activa', 'inactiva', 'prueba'])
      .withMessage('Estado inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { nombre, tipo, asunto, contenido, variables, estado } = req.body;

      // Obtener plantilla actual
      const [plantillas] = await db.query(
        'SELECT * FROM notificacion_plantilla WHERE id = ?',
        [id]
      );
      if (plantillas.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Plantilla no encontrada' });
      }

      const plantilla = plantillas[0];
      const valores_anteriores = { ...plantilla };

      // Validar nombre único si se proporciona
      if (nombre && nombre !== plantilla.nombre) {
        const [duplicados] = await db.query(
          'SELECT id FROM notificacion_plantilla WHERE nombre = ? AND comunidad_id = ? AND id != ?',
          [nombre, plantilla.comunidad_id, id]
        );
        if (duplicados.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'Ya existe una plantilla con ese nombre',
          });
        }
      }

      let updateFields = [];
      let updateValues = [];

      if (nombre !== undefined) {
        updateFields.push('nombre = ?');
        updateValues.push(nombre);
      }
      if (tipo !== undefined) {
        updateFields.push('tipo = ?');
        updateValues.push(tipo);
      }
      if (asunto !== undefined) {
        updateFields.push('asunto = ?');
        updateValues.push(asunto);
      }
      if (contenido !== undefined) {
        updateFields.push('contenido = ?');
        updateValues.push(contenido);
      }
      if (variables !== undefined) {
        updateFields.push('variables = ?');
        updateValues.push(variables);
      }
      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateValues.push(estado);
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'No hay campos para actualizar' });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE notificacion_plantilla SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(updateQuery, updateValues);

      // Obtener plantilla actualizada
      const [plantillasActualizadas] = await db.query(
        'SELECT * FROM notificacion_plantilla WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'UPDATE',
          'notificacion_plantilla',
          id,
          JSON.stringify(valores_anteriores),
          JSON.stringify(plantillasActualizadas[0]),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: plantillasActualizadas[0],
      });
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /notificaciones-plantillas/:id
 * Eliminar plantilla (soft delete)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener plantilla
      const [plantillas] = await db.query(
        'SELECT * FROM notificacion_plantilla WHERE id = ?',
        [id]
      );
      if (plantillas.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Plantilla no encontrada' });
      }

      const plantilla = plantillas[0];

      // Validar que no esté ya eliminada
      if (plantilla.activo === 0) {
        return res
          .status(409)
          .json({ success: false, error: 'Plantilla ya fue eliminada' });
      }

      // Soft delete
      await db.query(
        'UPDATE notificacion_plantilla SET activo = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'DELETE',
          'notificacion_plantilla',
          id,
          JSON.stringify(plantilla),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Plantilla eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
