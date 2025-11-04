const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * tags:
 *   - name: Tickets
 *     description: Gestión de tickets de soporte
 */

// =========================================
// 1. LISTADOS BÁSICOS CON FILTROS
// =========================================

/**
 * @swagger
 * /api/tickets/comunidad/{comunidadId}:
 *   get:
 *     tags: [Tickets]
 *     summary: Listar tickets con filtros avanzados
 *     parameters:
 *       - name: comunidadId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: estado
 *         in: query
 *         schema:
 *           type: string
 *           enum: [abierto, en_progreso, resuelto, cerrado]
 *       - name: prioridad
 *         in: query
 *         schema:
 *           type: string
 *           enum: [alta, media, baja]
 *       - name: categoria
 *         in: query
 *         schema:
 *           type: string
 *       - name: asignado_a
 *         in: query
 *         schema:
 *           type: integer
 *       - name: fecha_desde
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: fecha_hasta
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: ordenar_por
 *         in: query
 *         schema:
 *           type: string
 *           enum: [urgencia, fecha]
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 100
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        estado,
        prioridad,
        categoria,
        asignado_a,
        fecha_desde,
        fecha_hasta,
        ordenar_por,
        limit = 100,
        offset = 0,
      } = req.query;

      let query = `
      SELECT
        ts.id,
        ts.id AS numero,
        ts.titulo AS asunto,
        ts.descripcion,
        ts.estado,
        ts.prioridad,
        ts.categoria,
        c.razon_social AS comunidad,
        u.codigo AS unidad,
        COALESCE(pu.nombres, '') AS solicitante,
        COALESCE(pa.nombres, '') AS asignado_a,
        ts.created_at AS fecha_creacion,
        ts.updated_at AS fecha_actualizacion,
        ts.updated_at AS fecha_vencimiento,
        ts.updated_at AS fecha_cierre,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN NULL
          WHEN CURDATE() > ts.updated_at THEN DATEDIFF(CURDATE(), ts.updated_at)
          ELSE DATEDIFF(ts.updated_at, CURDATE())
        END AS dias_vencimiento,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN 'finalizado'
          WHEN CURDATE() > ts.updated_at THEN 'vencido'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'critico'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'urgente'
          ELSE 'normal'
        END AS nivel_urgencia,
        DATEDIFF(CURDATE(), ts.created_at) AS dias_abiertos
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN usuario us ON ts.asignado_a = us.id
      LEFT JOIN persona pa ON us.persona_id = pa.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      WHERE ts.comunidad_id = ?
    `;

      const params = [comunidadId];

      if (estado) {
        query += ` AND ts.estado = ?`;
        params.push(estado);
      }

      if (prioridad) {
        query += ` AND ts.prioridad = ?`;
        params.push(prioridad);
      }

      if (categoria) {
        query += ` AND ts.categoria = ?`;
        params.push(categoria);
      }

      if (asignado_a) {
        query += ` AND ts.asignado_a = ?`;
        params.push(Number(asignado_a));
      }

      if (fecha_desde) {
        query += ` AND ts.created_at >= ?`;
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        query += ` AND ts.created_at <= ?`;
        params.push(fecha_hasta);
      }

      // Ordenamiento
      if (ordenar_por === 'urgencia') {
        query += `
        ORDER BY
          CASE
            WHEN ts.estado IN ('resuelto', 'cerrado') THEN 999
            WHEN CURDATE() > ts.updated_at THEN 1
            WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 2
            WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 3
            ELSE 4
          END ASC,
          ts.created_at DESC
      `;
      } else {
        query += ` ORDER BY ts.created_at DESC, ts.id DESC`;
      }

      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      const [rows] = await db.query(query, params);

      res.json(rows);
    } catch (error) {
      console.error('Error al listar tickets:', error);
      res.status(500).json({ error: 'Error al listar tickets' });
    }
  }
);

/**
 * @swagger
 * /api/tickets/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Tickets]
 *     summary: Estadísticas de tickets por comunidad
 */
router.get(
  '/comunidad/:comunidadId/estadisticas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        c.razon_social AS comunidad,
        COUNT(ts.id) AS total_tickets,
        COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS abiertos,
        COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS en_progreso,
        COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS resueltos,
        COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS cerrados,
        0 AS escalados,
        AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END) AS tiempo_promedio_resolucion,
        MAX(ts.created_at) AS ultimo_ticket
      FROM comunidad c
      LEFT JOIN ticket_soporte ts ON c.id = ts.comunidad_id
      WHERE c.id = ?
      GROUP BY c.id, c.razon_social
    `;

      const [[stats]] = await db.query(query, [comunidadId]);

      res.json(stats || {});
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
);

/**
 * @swagger
 * /api/tickets/comunidad/{comunidadId}/proximos-vencer:
 *   get:
 *     tags: [Tickets]
 *     summary: Tickets próximos a vencer (3 días)
 */
router.get(
  '/comunidad/:comunidadId/proximos-vencer',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);

      const query = `
      SELECT
        ts.id,
        ts.id AS numero,
        ts.titulo AS asunto,
        c.razon_social AS comunidad,
        u.codigo AS unidad,
        COALESCE(pu.nombres, '') AS solicitante,
        ts.updated_at AS fecha_vencimiento,
        DATEDIFF(ts.updated_at, CURDATE()) AS dias_restantes,
        CASE
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 0 THEN 'vencido'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) = 1 THEN 'mañana'
          ELSE 'próximos_dias'
        END AS urgencia,
        ts.prioridad,
        ts.categoria
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      WHERE ts.comunidad_id = ?
        AND ts.estado NOT IN ('resuelto', 'cerrado')
        AND ts.updated_at IS NOT NULL
        AND DATEDIFF(ts.updated_at, CURDATE()) <= 3
      ORDER BY ts.updated_at ASC
    `;

      const [rows] = await db.query(query, [comunidadId]);

      res.json(rows);
    } catch (error) {
      console.error('Error al obtener tickets próximos a vencer:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener tickets próximos a vencer' });
    }
  }
);

// =========================================
// 2. VISTAS DETALLADAS
// =========================================

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Vista detallada completa de un ticket específico
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información completa del ticket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 numero:
 *                   type: string
 *                   example: "T-2024-0089"
 *                 asunto:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 estado:
 *                   type: string
 *                   enum: [abierto, en_progreso, resuelto, cerrado]
 *                 prioridad:
 *                   type: string
 *                   enum: [baja, media, alta]
 *                 categoria:
 *                   type: string
 *                 comunidad_id:
 *                   type: integer
 *                 comunidad_nombre:
 *                   type: string
 *                 unidad_id:
 *                   type: integer
 *                 unidad_codigo:
 *                   type: string
 *                 solicitante:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     unidad:
 *                       type: string
 *                 asignado:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     iniciales:
 *                       type: string
 *                 fecha_creacion:
 *                   type: string
 *                   format: date-time
 *                 fecha_actualizacion:
 *                   type: string
 *                   format: date-time
 *                 fecha_vencimiento:
 *                   type: string
 *                   format: date-time
 *                 fecha_cierre:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 tiempo_resolucion:
 *                   type: integer
 *                   nullable: true
 *                 estado_descripcion:
 *                   type: string
 *                 dias_desde_creacion:
 *                   type: integer
 *                 dias_para_resolver:
 *                   type: integer
 *                   nullable: true
 *                 etiquetas:
 *                   type: array
 *                   items:
 *                     type: string
 *                 comentarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       contenido:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                           email:
 *                             type: string
 *                           iniciales:
 *                             type: string
 *                       interno:
 *                         type: boolean
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                         enum: [add_circle, assignment_ind, swap_horiz, comment, attach_file, info]
 *                       descripcion:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                       usuario:
 *                         type: object
 *                         properties:
 *                           nombre:
 *                             type: string
 *                           email:
 *                             type: string
 *                 adjuntos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       tamano:
 *                         type: string
 *                       tipo:
 *                         type: string
 *                         enum: [image, description]
 *                       url:
 *                         type: string
 *                       subido_por:
 *                         type: string
 *                       fecha_subida:
 *                         type: string
 *                         format: date-time
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     num_comentarios:
 *                       type: integer
 *                     num_adjuntos:
 *                       type: integer
 *                     num_historial:
 *                       type: integer
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Obtener información básica del ticket
    const ticketQuery = `
      SELECT
        ts.id,
        CONCAT('T-', YEAR(ts.created_at), '-', LPAD(ts.id, 4, '0')) AS numero,
        ts.titulo AS asunto,
        ts.descripcion,
        ts.estado,
        ts.prioridad,
        ts.categoria,
        c.id AS comunidad_id,
        c.razon_social AS comunidad_nombre,
        u.id AS unidad_id,
        u.codigo AS unidad_codigo,
        NULL AS solicitante_id,
        COALESCE(pu.nombres, '') AS solicitante_nombre,
        COALESCE(pu.email, '') AS solicitante_email,
        ts.asignado_a AS asignado_id,
        COALESCE(pa.nombres, '') AS asignado_nombre,
        COALESCE(pa.email, '') AS asignado_email,
        ts.created_at AS fecha_creacion,
        ts.updated_at AS fecha_actualizacion,
        DATE_ADD(ts.created_at, INTERVAL 1 DAY) AS fecha_vencimiento,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN ts.updated_at
          ELSE NULL
        END AS fecha_cierre,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN TIMESTAMPDIFF(HOUR, ts.created_at, ts.updated_at)
          ELSE NULL
        END AS tiempo_resolucion,
        CASE
          WHEN ts.estado = 'abierto' THEN 'Abierto'
          WHEN ts.estado = 'en_progreso' THEN 'En Progreso'
          WHEN ts.estado = 'resuelto' THEN 'Resuelto'
          WHEN ts.estado = 'cerrado' THEN 'Cerrado'
        END AS estado_descripcion,
        DATEDIFF(CURDATE(), ts.created_at) AS dias_desde_creacion,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at)
          ELSE NULL
        END AS dias_para_resolver
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
      LEFT JOIN persona pa ON us_asig.persona_id = pa.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      WHERE ts.id = ?
    `;

    const [ticketRows] = await db.query(ticketQuery, [id]);

    if (!ticketRows.length) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const ticket = ticketRows[0];

    // Obtener adjuntos
    const attachmentsQuery = `
      SELECT
        a.id,
        a.original_name,
        a.filename,
        a.file_path,
        a.file_size,
        a.mimetype,
        a.uploaded_at,
        COALESCE(p.nombres, 'Sistema') AS uploaded_by_name,
        COALESCE(p.email, '') AS uploaded_by_email
      FROM archivos a
      LEFT JOIN usuario u ON a.uploaded_by = u.id
      LEFT JOIN persona p ON u.persona_id = p.id
      WHERE a.entity_type = 'ticket_soporte' AND a.entity_id = ? AND a.is_active = 1
      ORDER BY a.uploaded_at ASC
    `;

    const [attachments] = await db.query(attachmentsQuery, [id]);

    // Obtener historial de actividades desde auditoria
    const timelineQuery = `
      SELECT
        a.id,
        a.accion,
        a.created_at AS fecha,
        COALESCE(p.nombres, 'Sistema') AS usuario_nombre,
        COALESCE(p.email, '') AS usuario_email,
        a.valores_anteriores,
        a.valores_nuevos
      FROM auditoria a
      LEFT JOIN usuario u ON a.usuario_id = u.id
      LEFT JOIN persona p ON u.persona_id = p.id
      WHERE a.tabla = 'ticket_soporte' AND a.registro_id = ?
      ORDER BY a.created_at ASC
    `;

    const [timeline] = await db.query(timelineQuery, [id]);

    // Procesar timeline para formato legible
    const processedTimeline = timeline.map((activity) => {
      let descripcion = '';
      let tipo = '';

      switch (activity.accion) {
        case 'INSERT':
          tipo = 'add_circle';
          descripcion = 'Ticket creado';
          break;
        case 'UPDATE':
          if (activity.valores_anteriores && activity.valores_nuevos) {
            const anteriores = JSON.parse(activity.valores_anteriores);
            const nuevos = JSON.parse(activity.valores_nuevos);

            if (anteriores.estado !== nuevos.estado) {
              tipo = 'swap_horiz';
              descripcion = `Estado cambiado a ${nuevos.estado}`;
            } else if (anteriores.asignado_a !== nuevos.asignado_a) {
              tipo = 'assignment_ind';
              descripcion = 'Ticket asignado';
            } else {
              tipo = 'info';
              descripcion = 'Ticket actualizado';
            }
          } else {
            tipo = 'info';
            descripcion = 'Ticket actualizado';
          }
          break;
        default:
          tipo = 'info';
          descripcion = activity.accion;
      }

      return {
        id: activity.id,
        tipo,
        descripcion,
        fecha: activity.fecha,
        usuario: {
          nombre: activity.usuario_nombre,
          email: activity.usuario_email,
        },
      };
    });

    // Agregar evento de creación si no está en auditoria
    if (!processedTimeline.some((t) => t.descripcion === 'Ticket creado')) {
      processedTimeline.unshift({
        id: 'creation',
        tipo: 'add_circle',
        descripcion: 'Ticket creado',
        fecha: ticket.fecha_creacion,
        usuario: {
          nombre: ticket.solicitante_nombre || 'Sistema',
          email: ticket.solicitante_email || '',
        },
      });
    }

    // Comentarios simulados (hasta que se implemente tabla de comentarios)
    const comentarios = [
      {
        id: 1,
        contenido:
          'Gracias por reportar este problema. Voy a revisar el ascensor inmediatamente.',
        fecha: new Date(ticket.fecha_creacion.getTime() + 30 * 60 * 1000), // 30 min después
        usuario: {
          nombre: 'Carlos Técnico',
          email: 'carlos@mantenimiento.com',
          iniciales: 'CT',
        },
        interno: false,
      },
      {
        id: 2,
        contenido:
          'He revisado el ascensor y efectivamente hay un problema con el motor. He solicitado las piezas de repuesto y deberían llegar mañana por la mañana.',
        fecha: new Date(ticket.fecha_creacion.getTime() + 2 * 60 * 60 * 1000), // 2 horas después
        usuario: {
          nombre: 'Carlos Técnico',
          email: 'carlos@mantenimiento.com',
          iniciales: 'CT',
        },
        interno: false,
      },
      {
        id: 3,
        contenido:
          'Nota interna: Contactar proveedor para acelerar entrega de piezas.',
        fecha: new Date(ticket.fecha_creacion.getTime() + 2.5 * 60 * 60 * 1000), // 2.5 horas después
        usuario: {
          nombre: 'Admin Sistema',
          email: '',
          iniciales: 'AS',
        },
        interno: true,
      },
    ];

    // Etiquetas basadas en categoria y prioridad
    const etiquetas = [];
    if (ticket.prioridad === 'alta') etiquetas.push('urgente');
    if (ticket.categoria) etiquetas.push(ticket.categoria.toLowerCase());
    if (ticket.categoria === 'Mantenimiento') etiquetas.push('mantenimiento');

    // Respuesta completa
    const response = {
      ...ticket,
      etiquetas,
      solicitante: {
        nombre: ticket.solicitante_nombre,
        email: ticket.solicitante_email,
        unidad: ticket.unidad_codigo,
      },
      asignado: ticket.asignado_id
        ? {
            nombre: ticket.asignado_nombre,
            email: ticket.asignado_email,
            iniciales: ticket.asignado_nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          }
        : null,
      comentarios,
      timeline: processedTimeline,
      adjuntos: attachments.map((att) => ({
        id: att.id,
        nombre: att.original_name,
        tamano: `${(att.file_size / 1024 / 1024).toFixed(2)} MB`,
        tipo: att.mimetype.startsWith('image/') ? 'image' : 'description',
        url: att.file_path,
        subido_por: att.uploaded_by_name,
        fecha_subida: att.uploaded_at,
      })),
      estadisticas: {
        num_comentarios: comentarios.length,
        num_adjuntos: attachments.length,
        num_historial: processedTimeline.length,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
});

/**
 * @swagger
 * /api/tickets/todos/completos:
 *   get:
 *     tags: [Tickets]
 *     summary: Vista de tickets con información completa en JSON
 */
router.get('/todos/completos', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        ts.id,
        ts.id AS numero,
        ts.titulo AS asunto,
        ts.descripcion,
        ts.estado,
        ts.prioridad,
        ts.categoria,
        c.razon_social AS comunidad,
        u.codigo AS unidad,
        COALESCE(pu.nombres, '') AS solicitante,
        COALESCE(pa.nombres, '') AS asignado_a,
        ts.created_at AS fecha_creacion,
        ts.updated_at AS fecha_actualizacion,
        ts.updated_at AS fecha_vencimiento,
        ts.updated_at AS fecha_cierre,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN NULL
          WHEN CURDATE() > ts.updated_at THEN DATEDIFF(CURDATE(), ts.updated_at)
          ELSE DATEDIFF(ts.updated_at, CURDATE())
        END AS dias_vencimiento,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN 'finalizado'
          WHEN CURDATE() > ts.updated_at THEN 'vencido'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'critico'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'urgente'
          ELSE 'normal'
        END AS nivel_urgencia,
        DATEDIFF(CURDATE(), ts.created_at) AS dias_abiertos
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN usuario us ON ts.asignado_a = us.id
      LEFT JOIN persona pa ON us.persona_id = pa.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      ORDER BY ts.created_at DESC
      LIMIT 500
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tickets completos:', error);
    res.status(500).json({ error: 'Error al obtener tickets completos' });
  }
});

// =========================================
// 3. ESTADÍSTICAS
// =========================================

/**
 * @swagger
 * /api/tickets/estadisticas/generales:
 *   get:
 *     tags: [Tickets]
 *     summary: Estadísticas generales de tickets
 */
router.get('/estadisticas/generales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*) AS total_tickets,
        COUNT(DISTINCT comunidad_id) AS comunidades_con_tickets,
        COUNT(CASE WHEN estado = 'abierto' THEN 1 END) AS tickets_abiertos,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) AS tickets_en_progreso,
        COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) AS tickets_resueltos,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) AS tickets_cerrados,
        0 AS tickets_escalados,
        AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion,
        MIN(created_at) AS primer_ticket,
        MAX(created_at) AS ultimo_ticket
      FROM ticket_soporte
    `;

    const [[stats]] = await db.query(query);

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
});

/**
 * @swagger
 * /api/tickets/estadisticas/por-estado:
 *   get:
 *     tags: [Tickets]
 *     summary: Estadísticas por estado
 */
router.get('/estadisticas/por-estado', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        estado,
        COUNT(*) AS cantidad,
        ROUND(
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_soporte)), 2
        ) AS porcentaje,
        AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion,
        MIN(created_at) AS mas_antiguo,
        MAX(created_at) AS mas_reciente
      FROM ticket_soporte
      GROUP BY estado
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por estado:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por estado' });
  }
});

/**
 * @swagger
 * /api/tickets/estadisticas/por-prioridad:
 *   get:
 *     tags: [Tickets]
 *     summary: Estadísticas por prioridad
 */
router.get('/estadisticas/por-prioridad', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        prioridad,
        COUNT(*) AS cantidad,
        ROUND(
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_soporte)), 2
        ) AS porcentaje,
        COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) AS resueltos,
        ROUND(
          (COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_resolucion_prioridad,
        AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion
      FROM ticket_soporte
      GROUP BY prioridad
      ORDER BY
        CASE prioridad
          WHEN 'alta' THEN 1
          WHEN 'media' THEN 2
          WHEN 'baja' THEN 3
        END
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por prioridad:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener estadísticas por prioridad' });
  }
});

/**
 * @swagger
 * /api/tickets/estadisticas/por-categoria:
 *   get:
 *     tags: [Tickets]
 *     summary: Estadísticas por categoría
 */
router.get('/estadisticas/por-categoria', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        categoria,
        COUNT(*) AS cantidad,
        ROUND(
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_soporte)), 2
        ) AS porcentaje,
        COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) AS resueltos,
        ROUND(
          (COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_resolucion,
        AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion,
        MIN(created_at) AS mas_antiguo,
        MAX(created_at) AS mas_reciente
      FROM ticket_soporte
      GROUP BY categoria
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas por categoría:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener estadísticas por categoría' });
  }
});

/**
 * @swagger
 * /api/tickets/estadisticas/mensuales:
 *   get:
 *     tags: [Tickets]
 *     summary: Estadísticas mensuales de tickets (últimos 12 meses)
 */
router.get('/estadisticas/mensuales', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT
        YEAR(created_at) AS anio,
        MONTH(created_at) AS mes,
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN estado = 'abierto' THEN 1 END) AS abiertos,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) AS en_progreso,
        COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) AS resueltos,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) AS cerrados,
        0 AS escalados,
        ROUND(
          (COUNT(CASE WHEN estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS porcentaje_resolucion,
        AVG(CASE WHEN estado IN ('resuelto', 'cerrado') THEN DATEDIFF(updated_at, created_at) END) AS tiempo_promedio_resolucion
      FROM ticket_soporte
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY anio DESC, mes DESC
    `;

    const [rows] = await db.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estadísticas mensuales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas mensuales' });
  }
});

// =========================================
// 4. BÚSQUEDAS AVANZADAS
// =========================================

/**
 * @swagger
 * /api/tickets/busqueda/avanzada:
 *   get:
 *     tags: [Tickets]
 *     summary: Búsqueda avanzada de tickets
 */
router.get('/busqueda/avanzada', authenticate, async (req, res) => {
  try {
    const {
      busqueda,
      comunidad_id,
      estado,
      prioridad,
      categoria,
      asignado_a,
      fecha_desde,
      fecha_hasta,
      dias_vencimiento,
      limit = 100,
      offset = 0,
    } = req.query;

    let query = `
      SELECT
        ts.id,
        ts.id AS numero,
        ts.titulo AS asunto,
        ts.estado,
        ts.prioridad,
        ts.categoria,
        c.razon_social AS comunidad,
        u.codigo AS unidad,
        COALESCE(pu.nombres, '') AS solicitante,
        COALESCE(pa.nombres, '') AS asignado,
        ts.created_at AS fecha_creacion,
        ts.updated_at AS fecha_vencimiento,
        DATEDIFF(CURDATE(), ts.created_at) AS antiguedad_dias,
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN 'resuelto'
          WHEN CURDATE() > ts.updated_at THEN 'vencido'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'critico'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'urgente'
          ELSE 'normal'
        END AS nivel_urgencia
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
      LEFT JOIN persona pa ON us_asig.persona_id = pa.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      WHERE 1=1
    `;

    const params = [];

    if (busqueda) {
      query += ` AND (ts.id LIKE ? OR ts.titulo LIKE ? OR ts.descripcion LIKE ? OR pu.nombres LIKE ? OR pa.nombres LIKE ?)`;
      const searchPattern = `%${busqueda}%`;
      params.push(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
    }

    if (comunidad_id) {
      query += ` AND ts.comunidad_id = ?`;
      params.push(Number(comunidad_id));
    }

    if (estado) {
      query += ` AND ts.estado = ?`;
      params.push(estado);
    }

    if (prioridad) {
      query += ` AND ts.prioridad = ?`;
      params.push(prioridad);
    }

    if (categoria) {
      query += ` AND ts.categoria = ?`;
      params.push(categoria);
    }

    if (asignado_a) {
      query += ` AND ts.asignado_a = ?`;
      params.push(Number(asignado_a));
    }

    if (fecha_desde) {
      query += ` AND ts.created_at >= ?`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND ts.created_at <= ?`;
      params.push(fecha_hasta);
    }

    if (dias_vencimiento) {
      query += ` AND (
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN NULL
          WHEN CURDATE() > ts.updated_at THEN DATEDIFF(CURDATE(), ts.updated_at)
          ELSE DATEDIFF(ts.updated_at, CURDATE())
        END <= ?
      )`;
      params.push(Number(dias_vencimiento));
    }

    query += ` ORDER BY ts.created_at DESC, ts.id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({ error: 'Error en búsqueda avanzada' });
  }
});

/**
 * @swagger
 * /api/tickets/por-asignado/estadisticas:
 *   get:
 *     tags: [Tickets]
 *     summary: Tickets por asignado con estadísticas
 */
router.get('/por-asignado/estadisticas', authenticate, async (req, res) => {
  try {
    const { comunidad_id } = req.query;

    let query = `
      SELECT
        ta.id AS usuario_id,
        COALESCE(pa.nombres, ta.username) AS asignado,
        pa.email,
        COUNT(ts.id) AS total_tickets,
        COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS abiertos,
        COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS en_progreso,
        COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS resueltos,
        COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS cerrados,
        0 AS escalados,
        ROUND(
          (COUNT(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(ts.id), 0)), 2
        ) AS porcentaje_resolucion,
        AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END) AS tiempo_promedio_resolucion,
        MAX(ts.created_at) AS ultimo_ticket
      FROM usuario ta
      LEFT JOIN persona pa ON ta.persona_id = pa.id
      LEFT JOIN ticket_soporte ts ON ta.id = ts.asignado_a
      WHERE 1=1
    `;

    const params = [];

    if (comunidad_id) {
      query += ` AND ts.comunidad_id = ?`;
      params.push(Number(comunidad_id));
    }

    query += `
      GROUP BY ta.id, pa.nombres, ta.username, pa.email
      HAVING COUNT(ts.id) > 0
      ORDER BY total_tickets DESC
    `;

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tickets por asignado:', error);
    res.status(500).json({ error: 'Error al obtener tickets por asignado' });
  }
});

// =========================================
// 5. EXPORTACIÓN
// =========================================

/**
 * @swagger
 * /api/tickets/export/completo:
 *   get:
 *     tags: [Tickets]
 *     summary: Exportación completa de tickets para Excel/CSV
 */
router.get(
  '/export/completo',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        ts.id AS 'ID',
        ts.id AS 'Número',
        ts.titulo AS 'Asunto',
        ts.descripcion AS 'Descripción',
        ts.estado AS 'Estado',
        ts.prioridad AS 'Prioridad',
        ts.categoria AS 'Categoría',
        c.razon_social AS 'Comunidad',
        COALESCE(u.codigo, '') AS 'Unidad',
        COALESCE(pu.nombres, '') AS 'Solicitante',
        COALESCE(pu.email, '') AS 'Email Solicitante',
        COALESCE(pa.nombres, '') AS 'Asignado A',
        DATE_FORMAT(ts.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Creación',
        DATE_FORMAT(ts.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Actualización',
        DATE_FORMAT(ts.updated_at, '%Y-%m-%d') AS 'Fecha Vencimiento',
        DATE_FORMAT(ts.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Cierre',
        CASE
          WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at)
          ELSE NULL
        END AS 'Días Resolución'
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
      LEFT JOIN persona pa ON us_asig.persona_id = pa.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      ORDER BY ts.created_at DESC
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al exportar tickets:', error);
      res.status(500).json({ error: 'Error al exportar tickets' });
    }
  }
);

/**
 * @swagger
 * /api/tickets/export/abiertos:
 *   get:
 *     tags: [Tickets]
 *     summary: Exportación de tickets abiertos
 */
router.get(
  '/export/abiertos',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        ts.id AS 'Ticket',
        ts.titulo AS 'Asunto',
        c.razon_social AS 'Comunidad',
        COALESCE(u.codigo, '') AS 'Unidad',
        COALESCE(pu.nombres, '') AS 'Solicitante',
        COALESCE(pa.nombres, '') AS 'Asignado',
        ts.prioridad AS 'Prioridad',
        ts.categoria AS 'Categoría',
        DATE_FORMAT(ts.created_at, '%Y-%m-%d') AS 'Creado',
        DATE_FORMAT(ts.updated_at, '%Y-%m-%d') AS 'Vence',
        DATEDIFF(CURDATE(), ts.created_at) AS 'Días Abierto',
        CASE
          WHEN CURDATE() > ts.updated_at THEN 'VENCIDO'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 'CRÍTICO'
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 'URGENTE'
          ELSE 'NORMAL'
        END AS 'Estado Urgencia'
      FROM ticket_soporte ts
      JOIN comunidad c ON ts.comunidad_id = c.id
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      LEFT JOIN usuario us_asig ON ts.asignado_a = us_asig.id
      LEFT JOIN persona pa ON us_asig.persona_id = pa.id
      LEFT JOIN titulares_unidad tu ON ts.unidad_id = tu.unidad_id AND tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona pu ON tu.persona_id = pu.id
      WHERE ts.estado IN ('abierto', 'en_progreso')
      ORDER BY
        CASE
          WHEN CURDATE() > ts.updated_at THEN 1
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 1 THEN 2
          WHEN DATEDIFF(ts.updated_at, CURDATE()) <= 3 THEN 3
          ELSE 4
        END ASC,
        ts.created_at ASC
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al exportar tickets abiertos:', error);
      res.status(500).json({ error: 'Error al exportar tickets abiertos' });
    }
  }
);

/**
 * @swagger
 * /api/tickets/export/estadisticas-resolucion:
 *   get:
 *     tags: [Tickets]
 *     summary: Exportación de estadísticas de resolución
 */
router.get(
  '/export/estadisticas-resolucion',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        YEAR(ts.created_at) AS 'Año',
        MONTH(ts.created_at) AS 'Mes',
        COUNT(*) AS 'Total Tickets',
        COUNT(CASE WHEN ts.estado = 'abierto' THEN 1 END) AS 'Abiertos',
        COUNT(CASE WHEN ts.estado = 'en_progreso' THEN 1 END) AS 'En Progreso',
        COUNT(CASE WHEN ts.estado = 'resuelto' THEN 1 END) AS 'Resueltos',
        COUNT(CASE WHEN ts.estado = 'cerrado' THEN 1 END) AS 'Cerrados',
        0 AS 'Escalados',
        ROUND(
          (COUNT(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) AS 'Porcentaje Resolución (%)',
        ROUND(
          AVG(CASE WHEN ts.estado IN ('resuelto', 'cerrado') THEN DATEDIFF(ts.updated_at, ts.created_at) END), 1
        ) AS 'Días Promedio Resolución'
      FROM ticket_soporte ts
      WHERE ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(ts.created_at), MONTH(ts.created_at)
      ORDER BY 1 DESC, 2 DESC
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al exportar estadísticas:', error);
      res.status(500).json({ error: 'Error al exportar estadísticas' });
    }
  }
);

// =========================================
// 6. VALIDACIONES
// =========================================

/**
 * @swagger
 * /api/tickets/validacion/integridad:
 *   get:
 *     tags: [Tickets]
 *     summary: Validar integridad de tickets
 */
router.get(
  '/validacion/integridad',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    try {
      const query = `
      SELECT
        'Tickets sin comunidad' AS validacion,
        COUNT(*) AS cantidad
      FROM ticket_soporte ts
      LEFT JOIN comunidad c ON ts.comunidad_id = c.id
      WHERE c.id IS NULL
      UNION ALL
      SELECT
        'Tickets sin unidad' AS validacion,
        COUNT(*) AS cantidad
      FROM ticket_soporte ts
      LEFT JOIN unidad u ON ts.unidad_id = u.id
      WHERE u.id IS NULL
      UNION ALL
      SELECT
        'Tickets resueltos/cerrados sin fecha de cierre (updated_at)' AS validacion,
        COUNT(*) AS cantidad
      FROM ticket_soporte
      WHERE estado IN ('resuelto', 'cerrado') AND updated_at IS NULL
      UNION ALL
      SELECT
        'Tickets con fecha de cierre anterior a creación' AS validacion,
        COUNT(*) AS cantidad
      FROM ticket_soporte
      WHERE updated_at < created_at
      UNION ALL
      SELECT
        'Tickets con fecha de vencimiento pasada y estado abierto' AS validacion,
        COUNT(*) AS cantidad
      FROM ticket_soporte
      WHERE estado IN ('abierto', 'en_progreso') AND updated_at < CURDATE()
    `;

      const [rows] = await db.query(query);

      res.json(rows);
    } catch (error) {
      console.error('Error al validar integridad:', error);
      res.status(500).json({ error: 'Error al validar integridad' });
    }
  }
);

// =========================================
// 7. CRUD BÁSICO
// =========================================

/**
 * @swagger
 * /api/tickets/comunidad/{comunidadId}:
 *   post:
 *     tags: [Tickets]
 *     summary: Crear nuevo ticket
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    requireCommunity('comunidadId'),
    body('titulo').notEmpty(),
    body('descripcion').notEmpty(),
    body('prioridad').isIn(['alta', 'media', 'baja']),
    body('categoria').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comunidadId = Number(req.params.comunidadId);
      const {
        titulo,
        descripcion,
        prioridad,
        categoria,
        unidad_id,
        asignado_a,
      } = req.body;

      const [result] = await db.query(
        `INSERT INTO ticket_soporte (comunidad_id, titulo, descripcion, estado, prioridad, categoria, unidad_id, asignado_a)
       VALUES (?, ?, ?, 'abierto', ?, ?, ?, ?)`,
        [
          comunidadId,
          titulo,
          descripcion,
          prioridad,
          categoria,
          unidad_id || null,
          asignado_a || null,
        ]
      );

      const [row] = await db.query(
        'SELECT * FROM ticket_soporte WHERE id = ? LIMIT 1',
        [result.insertId]
      );

      res.status(201).json(row[0]);
    } catch (error) {
      console.error('Error al crear ticket:', error);
      res.status(500).json({ error: 'Error al crear ticket' });
    }
  }
);

/**
 * @swagger
 * /api/tickets/{id}:
 *   patch:
 *     tags: [Tickets]
 *     summary: Actualizar ticket
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fields = [
      'titulo',
      'descripcion',
      'estado',
      'prioridad',
      'categoria',
      'asignado_a',
    ];
    const updates = [];
    const values = [];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    await db.query(
      `UPDATE ticket_soporte SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await db.query(
      'SELECT * FROM ticket_soporte WHERE id = ? LIMIT 1',
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     tags: [Tickets]
 *     summary: Eliminar ticket
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.query('DELETE FROM ticket_soporte WHERE id = ?', [id]);

      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar ticket:', error);
      res.status(500).json({ error: 'Error al eliminar ticket' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE TICKETS
// =========================================

// // 1. LISTADOS BÁSICOS CON FILTROS
// GET: /tickets/comunidad/:comunidadId
// GET: /tickets/comunidad/:comunidadId/estadisticas
// GET: /tickets/comunidad/:comunidadId/proximos-vencer

// // 2. VISTAS DETALLADAS
// GET: /tickets/:id
// GET: /tickets/todos/completos

// // 3. ESTADÍSTICAS
// GET: /tickets/estadisticas/generales
// GET: /tickets/estadisticas/por-estado
// GET: /tickets/estadisticas/por-prioridad
// GET: /tickets/estadisticas/por-categoria
// GET: /tickets/estadisticas/mensuales

// // 4. BÚSQUEDAS AVANZADAS
// GET: /tickets/busqueda/avanzada
// GET: /tickets/por-asignado/estadisticas

// // 5. EXPORTACIÓN
// GET: /tickets/export/completo
// GET: /tickets/export/abiertos
// GET: /tickets/export/estadisticas-resolucion

// // 6. VALIDACIONES
// GET: /tickets/validacion/integridad

// // 7. CRUD BÁSICO
// POST: /tickets/comunidad/:comunidadId
// PATCH: /tickets/:id
// DELETE: /tickets/:id
