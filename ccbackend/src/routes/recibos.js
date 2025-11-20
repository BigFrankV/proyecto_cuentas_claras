const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// =========================================
// RECIBOS - GESTIÓN DE RECEPCIÓN DE PAGOS
// =========================================

/**
 * GET /recibos
 * Listado de recibos con filtros
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      comunidad_id,
      estado,
      fecha_desde,
      fecha_hasta,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT 
        r.id,
        r.numero_recibo,
        r.comunidad_id,
        c.razon_social AS comunidad,
        r.pago_id,
        p.monto AS monto_pago,
        r.monto_recibido,
        r.estado,
        r.fecha_recepcion,
        r.metodo_pago,
        r.referencia,
        r.observaciones,
        u.nombre AS recibido_por,
        r.created_at,
        r.updated_at
      FROM recibos r
      JOIN comunidad c ON r.comunidad_id = c.id
      LEFT JOIN pagos p ON r.pago_id = p.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ' AND r.comunidad_id = ?';
      params.push(comunidad_id);
    }
    if (estado) {
      query += ' AND r.estado = ?';
      params.push(estado);
    }
    if (fecha_desde) {
      query += ' AND DATE(r.fecha_recepcion) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND DATE(r.fecha_recepcion) <= ?';
      params.push(fecha_hasta);
    }

    query += ` ORDER BY r.fecha_recepcion DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [recibos] = await db.query(query, params);

    res.json({
      success: true,
      data: recibos,
      count: recibos.length,
    });
  } catch (error) {
    console.error('Error al obtener recibos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /recibos/:id
 * Obtener detalle de un recibo
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.*,
        c.razon_social AS comunidad,
        p.monto AS monto_pago,
        p.numero_referencia AS ref_pago,
        u.nombre AS recibido_por,
        u.email AS correo_recibidor
      FROM recibos r
      JOIN comunidad c ON r.comunidad_id = c.id
      LEFT JOIN pagos p ON r.pago_id = p.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.id = ?
    `;

    const [recibos] = await db.query(query, [id]);

    if (recibos.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Recibo no encontrado' });
    }

    res.json({ success: true, data: recibos[0] });
  } catch (error) {
    console.error('Error al obtener recibo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /recibos
 * Crear nuevo recibo de pago
 */
router.post(
  '/',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador', 'tesorero']),
  [
    body('numero_recibo')
      .trim()
      .notEmpty()
      .withMessage('Número de recibo requerido'),
    body('comunidad_id').isInt().withMessage('ID de comunidad inválido'),
    body('pago_id').isInt().withMessage('ID de pago inválido'),
    body('monto_recibido')
      .isDecimal()
      .custom((v) => v > 0)
      .withMessage('Monto debe ser mayor a 0'),
    body('metodo_pago')
      .trim()
      .notEmpty()
      .isIn(['efectivo', 'transferencia', 'cheque', 'deposito', 'otro'])
      .withMessage('Método de pago inválido'),
    body('fecha_recepcion')
      .isISO8601()
      .withMessage('Fecha de recepción inválida'),
    body('referencia').optional().trim().escape(),
    body('observaciones').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        numero_recibo,
        comunidad_id,
        pago_id,
        monto_recibido,
        metodo_pago,
        fecha_recepcion,
        referencia,
        observaciones,
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

      // Verificar que el pago existe y pertenece a la comunidad
      const [pagos] = await db.query(
        'SELECT id, monto, estado, comunidad_id FROM pagos WHERE id = ? AND comunidad_id = ?',
        [pago_id, comunidad_id]
      );
      if (pagos.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Pago no encontrado' });
      }

      // Verificar que el número de recibo es único
      const [recibosExistentes] = await db.query(
        'SELECT id FROM recibos WHERE numero_recibo = ? AND comunidad_id = ?',
        [numero_recibo, comunidad_id]
      );
      if (recibosExistentes.length > 0) {
        return res
          .status(409)
          .json({ success: false, error: 'Número de recibo ya existe' });
      }

      // Validar que el monto no supere el del pago
      if (monto_recibido > pagos[0].monto) {
        return res.status(400).json({
          success: false,
          error: `Monto recibido no puede superar ${pagos[0].monto}`,
        });
      }

      // Crear el recibo
      const insertQuery = `
        INSERT INTO recibos (
          numero_recibo,
          comunidad_id,
          pago_id,
          monto_recibido,
          estado,
          metodo_pago,
          fecha_recepcion,
          referencia,
          observaciones,
          usuario_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.query(insertQuery, [
        numero_recibo,
        comunidad_id,
        pago_id,
        monto_recibido,
        'pendiente_validacion',
        metodo_pago,
        fecha_recepcion,
        referencia || null,
        observaciones || null,
        req.user.id,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'INSERT',
          'recibos',
          result.insertId,
          JSON.stringify({
            numero_recibo,
            comunidad_id,
            pago_id,
            monto_recibido,
            metodo_pago,
            fecha_recepcion,
          }),
          req.ip,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Recibo creado exitosamente',
        data: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      console.error('Error al crear recibo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /recibos/:id
 * Actualizar recibo (validación, referencias, observaciones)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador', 'tesorero']),
  [
    body('estado')
      .optional()
      .isIn(['pendiente_validacion', 'validado', 'rechazado'])
      .withMessage('Estado inválido'),
    body('referencia').optional().trim().escape(),
    body('observaciones').optional().trim().escape(),
    body('metodo_pago')
      .optional()
      .isIn(['efectivo', 'transferencia', 'cheque', 'deposito', 'otro'])
      .withMessage('Método de pago inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { estado, referencia, observaciones, metodo_pago } = req.body;

      // Obtener recibo actual
      const [recibos] = await db.query('SELECT * FROM recibos WHERE id = ?', [
        id,
      ]);
      if (recibos.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Recibo no encontrado' });
      }

      const recibo = recibos[0];
      const valores_anteriores = { ...recibo };

      // Actualizar campos permitidos
      let updateFields = [];
      let updateValues = [];

      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateValues.push(estado);
      }
      if (referencia !== undefined) {
        updateFields.push('referencia = ?');
        updateValues.push(referencia);
      }
      if (observaciones !== undefined) {
        updateFields.push('observaciones = ?');
        updateValues.push(observaciones);
      }
      if (metodo_pago !== undefined) {
        updateFields.push('metodo_pago = ?');
        updateValues.push(metodo_pago);
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'No hay campos para actualizar' });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE recibos SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(updateQuery, updateValues);

      // Obtener recibo actualizado
      const [recibosActualizados] = await db.query(
        'SELECT * FROM recibos WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'UPDATE',
          'recibos',
          id,
          JSON.stringify(valores_anteriores),
          JSON.stringify(recibosActualizados[0]),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Recibo actualizado exitosamente',
        data: recibosActualizados[0],
      });
    } catch (error) {
      console.error('Error al actualizar recibo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /recibos/:id
 * Eliminar recibo (soft delete)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador', 'tesorero']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener recibo
      const [recibos] = await db.query('SELECT * FROM recibos WHERE id = ?', [
        id,
      ]);
      if (recibos.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Recibo no encontrado' });
      }

      const recibo = recibos[0];

      // Validar que no esté ya eliminado
      if (recibo.activo === 0) {
        return res
          .status(409)
          .json({ success: false, error: 'Recibo ya fue eliminado' });
      }

      // Validar que sea elimnable (solo pendiente_validacion o rechazado)
      if (!['pendiente_validacion', 'rechazado'].includes(recibo.estado)) {
        return res.status(409).json({
          success: false,
          error: 'Solo se pueden eliminar recibos pendientes o rechazados',
        });
      }

      // Soft delete
      await db.query(
        'UPDATE recibos SET activo = 0, updated_at = NOW() WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [req.user.id, 'DELETE', 'recibos', id, JSON.stringify(recibo), req.ip]
      );

      res.json({
        success: true,
        message: 'Recibo eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar recibo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
