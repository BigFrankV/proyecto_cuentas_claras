const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// =========================================
// RESERVAS - GESTIÓN DE AMENIDADES
// =========================================

/**
 * GET /reservas
 * Listado de reservas con filtros
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      comunidad_id,
      estado,
      amenidad_id,
      usuario_id,
      fecha_desde,
      fecha_hasta,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT 
        r.id,
        r.numero_reserva,
        r.comunidad_id,
        c.razon_social AS comunidad,
        r.amenidad_id,
        a.nombre AS amenidad,
        r.usuario_id,
        u.nombre AS usuario,
        u.email,
        r.unidad_id,
        un.numero_unidad,
        r.fecha_inicio,
        r.fecha_fin,
        r.cantidad_personas,
        r.estado,
        r.motivo_rechazo,
        r.observaciones,
        r.aprobado_por,
        r.fecha_aprobacion,
        r.created_at,
        r.updated_at
      FROM reserva_amenidad r
      JOIN comunidad c ON r.comunidad_id = c.id
      JOIN amenidad a ON r.amenidad_id = a.id
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN unidad un ON r.unidad_id = un.id
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
    if (amenidad_id) {
      query += ' AND r.amenidad_id = ?';
      params.push(amenidad_id);
    }
    if (usuario_id) {
      query += ' AND r.usuario_id = ?';
      params.push(usuario_id);
    }
    if (fecha_desde) {
      query += ' AND DATE(r.fecha_inicio) >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND DATE(r.fecha_fin) <= ?';
      params.push(fecha_hasta);
    }

    query += ` ORDER BY r.fecha_inicio DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [reservas] = await db.query(query, params);

    res.json({
      success: true,
      data: reservas,
      count: reservas.length,
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /reservas/:id
 * Obtener detalle de una reserva
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.*,
        c.razon_social AS comunidad,
        a.nombre AS amenidad,
        a.reglas,
        a.capacidad,
        u.nombre AS usuario,
        u.email,
        un.numero_unidad,
        CASE 
          WHEN r.estado = 'solicitada' AND a.requiere_aprobacion = 1 THEN 'Pendiente de aprobación'
          WHEN r.estado = 'solicitada' AND a.requiere_aprobacion = 0 THEN 'Confirmada automáticamente'
          WHEN r.estado = 'aprobada' THEN 'Aprobada'
          WHEN r.estado = 'rechazada' THEN 'Rechazada'
          WHEN r.estado = 'cumplida' THEN 'Completada'
          WHEN r.estado = 'cancelada' THEN 'Cancelada'
          ELSE r.estado
        END AS estado_descripcion
      FROM reserva_amenidad r
      JOIN comunidad c ON r.comunidad_id = c.id
      JOIN amenidad a ON r.amenidad_id = a.id
      JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN unidad un ON r.unidad_id = un.id
      WHERE r.id = ?
    `;

    const [reservas] = await db.query(query, [id]);

    if (reservas.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Reserva no encontrada' });
    }

    res.json({ success: true, data: reservas[0] });
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /reservas
 * Crear nueva reserva de amenidad
 */
router.post(
  '/',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador', 'residente']),
  [
    body('numero_reserva')
      .trim()
      .notEmpty()
      .withMessage('Número de reserva requerido'),
    body('comunidad_id').isInt().withMessage('ID de comunidad inválido'),
    body('amenidad_id').isInt().withMessage('ID de amenidad inválido'),
    body('unidad_id').isInt().withMessage('ID de unidad inválido'),
    body('fecha_inicio').isISO8601().withMessage('Fecha inicio inválida'),
    body('fecha_fin').isISO8601().withMessage('Fecha fin inválida'),
    body('cantidad_personas')
      .isInt({ min: 1 })
      .withMessage('Cantidad de personas inválida'),
    body('observaciones').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        numero_reserva,
        comunidad_id,
        amenidad_id,
        unidad_id,
        fecha_inicio,
        fecha_fin,
        cantidad_personas,
        observaciones,
      } = req.body;

      // Verificaciones de existencia
      const [comunidades] = await db.query(
        'SELECT id FROM comunidad WHERE id = ?',
        [comunidad_id]
      );
      if (comunidades.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Comunidad no encontrada' });
      }

      const [amenidades] = await db.query(
        'SELECT id, capacidad, requiere_aprobacion FROM amenidad WHERE id = ? AND comunidad_id = ?',
        [amenidad_id, comunidad_id]
      );
      if (amenidades.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Amenidad no encontrada' });
      }

      const [unidades] = await db.query(
        'SELECT id FROM unidad WHERE id = ? AND comunidad_id = ?',
        [unidad_id, comunidad_id]
      );
      if (unidades.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Unidad no encontrada' });
      }

      // Validar que el número de reserva sea único
      const [reservasExistentes] = await db.query(
        'SELECT id FROM reserva_amenidad WHERE numero_reserva = ? AND comunidad_id = ?',
        [numero_reserva, comunidad_id]
      );
      if (reservasExistentes.length > 0) {
        return res
          .status(409)
          .json({ success: false, error: 'Número de reserva ya existe' });
      }

      // Validar que cantidad de personas no supere capacidad
      if (
        cantidad_personas > amenidades[0].capacidad &&
        amenidades[0].capacidad > 0
      ) {
        return res.status(400).json({
          success: false,
          error: `Cantidad de personas no puede superar capacidad de ${amenidades[0].capacidad}`,
        });
      }

      // Validar que no haya conflicto de fechas
      const [conflictos] = await db.query(
        `
        SELECT id FROM reserva_amenidad 
        WHERE amenidad_id = ? 
        AND estado IN ('solicitada', 'aprobada', 'cumplida')
        AND (
          (DATE(fecha_inicio) <= ? AND DATE(fecha_fin) >= ?)
          OR (DATE(fecha_inicio) >= ? AND DATE(fecha_inicio) <= ?)
          OR (DATE(fecha_fin) >= ? AND DATE(fecha_fin) <= ?)
        )
      `,
        [
          amenidad_id,
          fecha_fin,
          fecha_inicio,
          fecha_inicio,
          fecha_fin,
          fecha_inicio,
          fecha_fin,
        ]
      );

      if (conflictos.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Hay conflicto con otras reservas en esas fechas',
        });
      }

      // Crear la reserva
      const estado =
        amenidades[0].requiere_aprobacion === 1 ? 'solicitada' : 'aprobada';

      const insertQuery = `
        INSERT INTO reserva_amenidad (
          numero_reserva,
          comunidad_id,
          amenidad_id,
          usuario_id,
          unidad_id,
          fecha_inicio,
          fecha_fin,
          cantidad_personas,
          estado,
          observaciones,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.query(insertQuery, [
        numero_reserva,
        comunidad_id,
        amenidad_id,
        req.user.id,
        unidad_id,
        fecha_inicio,
        fecha_fin,
        cantidad_personas,
        estado,
        observaciones || null,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'INSERT',
          'reserva_amenidad',
          result.insertId,
          JSON.stringify({
            numero_reserva,
            amenidad_id,
            fecha_inicio,
            fecha_fin,
            cantidad_personas,
          }),
          req.ip,
        ]
      );

      res.status(201).json({
        success: true,
        message: `Reserva ${estado === 'aprobada' ? 'confirmada' : 'solicitada'} exitosamente`,
        data: { id: result.insertId, estado, ...req.body },
      });
    } catch (error) {
      console.error('Error al crear reserva:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * PUT /reservas/:id
 * Actualizar reserva (cambiar fechas, cantidad, aprobar/rechazar)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador', 'residente']),
  [
    body('fecha_inicio')
      .optional()
      .isISO8601()
      .withMessage('Fecha inicio inválida'),
    body('fecha_fin').optional().isISO8601().withMessage('Fecha fin inválida'),
    body('cantidad_personas')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Cantidad de personas inválida'),
    body('estado')
      .optional()
      .isIn(['solicitada', 'aprobada', 'rechazada', 'cumplida', 'cancelada'])
      .withMessage('Estado inválido'),
    body('motivo_rechazo').optional().trim().escape(),
    body('observaciones').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const {
        fecha_inicio,
        fecha_fin,
        cantidad_personas,
        estado,
        motivo_rechazo,
        observaciones,
      } = req.body;

      // Obtener reserva actual
      const [reservas] = await db.query(
        'SELECT * FROM reserva_amenidad WHERE id = ?',
        [id]
      );
      if (reservas.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Reserva no encontrada' });
      }

      const reserva = reservas[0];
      const valores_anteriores = { ...reserva };

      // Validar permisos de actualización
      const esAdmin = [
        'superadmin',
        'admin_comunidad',
        'administrador',
      ].includes(req.user.rol);
      const esOwner = reserva.usuario_id === req.user.id;

      if (!esAdmin && !esOwner) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para actualizar esta reserva',
        });
      }

      // Si el residente intenta cambiar el estado, solo puede a 'cancelada'
      if (!esAdmin && estado && estado !== 'cancelada') {
        return res
          .status(403)
          .json({ success: false, error: 'Solo puedes cancelar tu reserva' });
      }

      // Validar que no esté ya cumplida o cancelada
      if (
        ['cumplida', 'cancelada'].includes(reserva.estado) &&
        (fecha_inicio || fecha_fin || estado)
      ) {
        return res.status(409).json({
          success: false,
          error: 'No se puede modificar una reserva completada o cancelada',
        });
      }

      let updateFields = [];
      let updateValues = [];

      if (fecha_inicio !== undefined) {
        updateFields.push('fecha_inicio = ?');
        updateValues.push(fecha_inicio);
      }
      if (fecha_fin !== undefined) {
        updateFields.push('fecha_fin = ?');
        updateValues.push(fecha_fin);
      }
      if (cantidad_personas !== undefined) {
        updateFields.push('cantidad_personas = ?');
        updateValues.push(cantidad_personas);
      }
      if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateValues.push(estado);
      }
      if (motivo_rechazo !== undefined) {
        updateFields.push('motivo_rechazo = ?');
        updateValues.push(motivo_rechazo);
      }
      if (observaciones !== undefined) {
        updateFields.push('observaciones = ?');
        updateValues.push(observaciones);
      }

      if (estado === 'aprobada' && esAdmin && reserva.estado === 'solicitada') {
        updateFields.push('aprobado_por = ?');
        updateValues.push(req.user.id);
        updateFields.push('fecha_aprobacion = NOW()');
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'No hay campos para actualizar' });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const updateQuery = `UPDATE reserva_amenidad SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(updateQuery, updateValues);

      // Obtener reserva actualizada
      const [reservasActualizadas] = await db.query(
        'SELECT * FROM reserva_amenidad WHERE id = ?',
        [id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'UPDATE',
          'reserva_amenidad',
          id,
          JSON.stringify(valores_anteriores),
          JSON.stringify(reservasActualizadas[0]),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Reserva actualizada exitosamente',
        data: reservasActualizadas[0],
      });
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * DELETE /reservas/:id
 * Eliminar/Cancelar reserva
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['superadmin', 'admin_comunidad', 'administrador', 'residente']),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Obtener reserva
      const [reservas] = await db.query(
        'SELECT * FROM reserva_amenidad WHERE id = ?',
        [id]
      );
      if (reservas.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: 'Reserva no encontrada' });
      }

      const reserva = reservas[0];

      // Validar permisos
      const esAdmin = [
        'superadmin',
        'admin_comunidad',
        'administrador',
      ].includes(req.user.rol);
      const esOwner = reserva.usuario_id === req.user.id;

      if (!esAdmin && !esOwner) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para cancelar esta reserva',
        });
      }

      // Validar que sea cancelable (no cumplida, no rechazada)
      if (['cumplida', 'rechazada'].includes(reserva.estado)) {
        return res.status(409).json({
          success: false,
          error: `No se puede cancelar una reserva ${reserva.estado}`,
        });
      }

      // Soft delete - cambiar estado a cancelada
      await db.query(
        'UPDATE reserva_amenidad SET estado = ?, activo = 0, updated_at = NOW() WHERE id = ?',
        ['cancelada', id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          'DELETE',
          'reserva_amenidad',
          id,
          JSON.stringify(reserva),
          req.ip,
        ]
      );

      res.json({
        success: true,
        message: 'Reserva cancelada exitosamente',
      });
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
