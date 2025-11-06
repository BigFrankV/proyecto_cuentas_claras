const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// =========================================
// BITÁCORA DE AUDITORÍA - REGISTRO DE EVENTOS
// =========================================

/**
 * GET /bitacora
 * Listado de registros de bitácora con filtros
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { comunidad_id, tipo, prioridad, usuario_id, fecha_desde, fecha_hasta, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        b.id,
        b.numero_registro,
        b.comunidad_id,
        c.razon_social AS comunidad,
        b.tipo,
        b.prioridad,
        b.titulo,
        b.descripcion,
        b.usuario_id,
        u.nombre AS usuario,
        b.fecha,
        b.tags,
        b.adjuntos,
        b.ip,
        b.ubicacion,
        b.created_at,
        b.updated_at
      FROM bitacora_auditoria b
      JOIN comunidad c ON b.comunidad_id = c.id
      LEFT JOIN usuarios u ON b.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND b.comunidad_id = ?';
      params.push(comunidad_id);
    }
    if (tipo) {
      query += ' AND b.tipo = ?';
      params.push(tipo);
    }
    if (prioridad) {
      query += ' AND b.prioridad = ?';
      params.push(prioridad);
    }
    if (usuario_id) {
      query += ' AND b.usuario_id = ?';
      params.push(usuario_id);
    }
    if (fecha_desde) {
      query += ' AND DATE(b.fecha) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND DATE(b.fecha) <= ?';
      params.push(fecha_hasta);
    }

    query += ` ORDER BY b.fecha DESC, b.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [registros] = await db.query(query, params);
    
    res.json({
      success: true,
      data: registros,
      count: registros.length
    });
  } catch (error) {
    console.error('Error al obtener registros de bitácora:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /bitacora/:id
 * Obtener detalle de un registro
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        b.*,
        c.razon_social AS comunidad,
        u.nombre AS usuario,
        u.email AS correo_usuario
      FROM bitacora_auditoria b
      JOIN comunidad c ON b.comunidad_id = c.id
      LEFT JOIN usuarios u ON b.usuario_id = u.id
      WHERE b.id = ?
    `;

    const [registros] = await db.query(query, [id]);
    
    if (registros.length === 0) {
      return res.status(404).json({ success: false, error: 'Registro no encontrado' });
    }

    res.json({ success: true, data: registros[0] });
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /bitacora
 * Crear nuevo registro en bitácora
 */
router.post(
  '/',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  [
    body('numero_registro').trim().notEmpty().withMessage('Número de registro requerido'),
    body('comunidad_id').isInt().withMessage('ID de comunidad inválido'),
    body('tipo').trim().notEmpty().isIn(['acceso', 'cambio_datos', 'accion_importante', 'evento_seguridad', 'otro']).withMessage('Tipo inválido'),
    body('prioridad').trim().notEmpty().isIn(['baja', 'media', 'alta', 'crítica']).withMessage('Prioridad inválida'),
    body('titulo').trim().notEmpty().withMessage('Título requerido'),
    body('descripcion').trim().notEmpty().withMessage('Descripción requerida'),
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('tags').optional().trim().escape(),
    body('adjuntos').optional().trim().escape(),
    body('ubicacion').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        numero_registro,
        comunidad_id,
        tipo,
        prioridad,
        titulo,
        descripcion,
        fecha,
        tags,
        adjuntos,
        ubicacion
      } = req.body;

      // Verificar que la comunidad existe
      const [comunidades] = await db.query('SELECT id FROM comunidad WHERE id = ?', [comunidad_id]);
      if (comunidades.length === 0) {
        return res.status(404).json({ success: false, error: 'Comunidad no encontrada' });
      }

      // Verificar que el número de registro sea único
      const [registrosExistentes] = await db.query(
        'SELECT id FROM bitacora_auditoria WHERE numero_registro = ? AND comunidad_id = ?',
        [numero_registro, comunidad_id]
      );
      if (registrosExistentes.length > 0) {
        return res.status(409).json({ success: false, error: 'Número de registro ya existe' });
      }

      // Crear el registro
      const insertQuery = `
        INSERT INTO bitacora_auditoria (
          numero_registro,
          comunidad_id,
          tipo,
          prioridad,
          titulo,
          descripcion,
          usuario_id,
          fecha,
          tags,
          adjuntos,
          ip,
          ubicacion,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.query(insertQuery, [
        numero_registro,
        comunidad_id,
        tipo,
        prioridad,
        titulo,
        descripcion,
        req.user.id,
        fecha,
        tags || null,
        adjuntos || null,
        req.ip,
        ubicacion || null
      ]);

      // Registrar en auditoría del sistema
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'INSERT',
          'bitacora_auditoria',
          result.insertId,
          JSON.stringify({
            numero_registro,
            tipo,
            prioridad,
            titulo
          }),
          req.ip
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Registro de bitácora creado exitosamente',
        data: { id: result.insertId, ...req.body }
      });
    } catch (error) {
      console.error('Error al crear registro:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /bitacora/:id
 * Actualizar registro de bitácora
 */
router.put(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  [
    body('tipo').optional().isIn(['acceso', 'cambio_datos', 'accion_importante', 'evento_seguridad', 'otro']).withMessage('Tipo inválido'),
    body('prioridad').optional().isIn(['baja', 'media', 'alta', 'crítica']).withMessage('Prioridad inválida'),
    body('titulo').optional().trim().notEmpty().withMessage('Título no puede estar vacío'),
    body('descripcion').optional().trim().notEmpty().withMessage('Descripción no puede estar vacía'),
    body('tags').optional().trim().escape(),
    body('adjuntos').optional().trim().escape(),
    body('ubicacion').optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { tipo, prioridad, titulo, descripcion, tags, adjuntos, ubicacion } = req.body;

      // Obtener registro actual
      const [registros] = await db.query('SELECT * FROM bitacora_auditoria WHERE id = ?', [id]);
      if (registros.length === 0) {
        return res.status(404).json({ success: false, error: 'Registro no encontrado' });
      }

      const registro = registros[0];
      const valores_anteriores = { ...registro };

      let updateFields = [];
      let updateValues = [];

      if (tipo !== undefined) {
        updateFields.push('tipo = ?');
        updateValues.push(tipo);
      }
      if (prioridad !== undefined) {
        updateFields.push('prioridad = ?');
        updateValues.push(prioridad);
      }
      if (titulo !== undefined) {
        updateFields.push('titulo = ?');
        updateValues.push(titulo);
      }
      if (descripcion !== undefined) {
        updateFields.push('descripcion = ?');
        updateValues.push(descripcion);
      }
      if (tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(tags);
      }
      if (adjuntos !== undefined) {
        updateFields.push('adjuntos = ?');
        updateValues.push(adjuntos);
      }
      if (ubicacion !== undefined) {
        updateFields.push('ubicacion = ?');
        updateValues.push(ubicacion);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ success: false, error: 'No hay campos para actualizar' });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE bitacora_auditoria SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(updateQuery, updateValues);

      // Obtener registro actualizado
      const [registrosActualizados] = await db.query('SELECT * FROM bitacora_auditoria WHERE id = ?', [id]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'UPDATE',
          'bitacora_auditoria',
          id,
          JSON.stringify(valores_anteriores),
          JSON.stringify(registrosActualizados[0]),
          req.ip
        ]
      );

      res.json({
        success: true,
        message: 'Registro actualizado exitosamente',
        data: registrosActualizados[0]
      });
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /bitacora/:id
 * Eliminar registro (soft delete)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener registro
      const [registros] = await db.query('SELECT * FROM bitacora_auditoria WHERE id = ?', [id]);
      if (registros.length === 0) {
        return res.status(404).json({ success: false, error: 'Registro no encontrado' });
      }

      const registro = registros[0];

      // Validar que no esté ya eliminado
      if (registro.activo === 0) {
        return res.status(409).json({ success: false, error: 'Registro ya fue eliminado' });
      }

      // Soft delete
      await db.query('UPDATE bitacora_auditoria SET activo = 0, updated_at = NOW() WHERE id = ?', [id]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'DELETE',
          'bitacora_auditoria',
          id,
          JSON.stringify(registro),
          req.ip
        ]
      );

      res.json({
        success: true,
        message: 'Registro eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
