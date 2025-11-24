const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

// ============================================
// HELPER: Obtener comunidades del usuario
// ============================================
// eslint-disable-next-line no-unused-vars
async function obtenerComunidadesUsuario(
  usuarioId,
  personaId,
  isSuperAdmin = false
) {
  if (isSuperAdmin) {
    const [all] = await db.query(`SELECT id FROM comunidad`);
    return Array.isArray(all) ? all.map((r) => Number(r.id)) : [];
  }

  // por rol en usuario_rol_comunidad
  const [porRol] = await db.query(
    `SELECT DISTINCT comunidad_id
     FROM usuario_rol_comunidad
     WHERE usuario_id = ?
       AND activo = 1
       AND (desde <= CURDATE())
       AND (hasta IS NULL OR hasta >= CURDATE())`,
    [usuarioId]
  );

  // por pertenencia como miembro
  const [porMiembro] = await db.query(
    `SELECT DISTINCT comunidad_id
     FROM usuario_miembro_comunidad
     WHERE persona_id = ?
       AND activo = 1
       AND (desde <= CURDATE())
       AND (hasta IS NULL OR hasta >= CURDATE())`,
    [personaId]
  );

  const ids = new Set();
  porRol.forEach((r) => ids.add(Number(r.comunidad_id)));
  porMiembro.forEach((r) => ids.add(Number(r.comunidad_id)));
  return Array.from(ids);
}

/**
 * @swagger
 * tags:
 *   - name: Cargos
 *     description: |
 *       Gestión de cuentas de cobro por unidad (anteriormente "cargos").
 *
 *       **Cambio de nomenclatura**: La tabla `cargo_unidad` ahora se llama `cuenta_cobro_unidad`.
 *       Representa los montos totales a cobrar a cada unidad por período (gastos comunes, multas, consumos, etc.).
 */

/**
 * @swagger
 * /cargos/mis-unidades:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener unidades del usuario actual
 *     description: |
 *       Retorna las unidades asociadas al usuario actual a través de la tabla titulares_unidad.
 *       Útil para saber qué unidades puede ver el usuario (propietario, inquilino, residente).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de unidades del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   unidad_id:
 *                     type: integer
 *                   codigo:
 *                     type: string
 *                   comunidad_id:
 *                     type: integer
 *                   nombre_comunidad:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                     enum: [propietario, inquilino, residente]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/mis-unidades', authenticate, async (req, res) => {
  try {
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const usuarioId = req.user.sub;

    // Buscar persona_id asociada al usuario
    const [usuarioRows] = await db.query(
      'SELECT persona_id FROM usuario WHERE id = ? LIMIT 1',
      [usuarioId]
    );

    if (!usuarioRows || !usuarioRows.length) {
      return res.json([]);
    }

    const personaId = usuarioRows[0].persona_id;

    // Buscar unidades donde esta persona es titular activo
    const [unidades] = await db.query(
      `SELECT DISTINCT
        tu.unidad_id,
        u.codigo,
        u.comunidad_id,
        c.razon_social as nombre_comunidad,
        tu.tipo
      FROM titulares_unidad tu
      JOIN unidad u ON tu.unidad_id = u.id
      JOIN comunidad c ON u.comunidad_id = c.id
      WHERE tu.persona_id = ?
        AND tu.hasta IS NULL
        AND u.activa = 1
      ORDER BY c.razon_social, u.codigo`,
      [personaId]
    );

    res.json(unidades);
  } catch (err) {
    console.error('Error en /mis-unidades:', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /cargos/todas/resumen:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener resumen de TODOS los cargos (solo superadmin)
 *     description: |
 *       Retorna un resumen de todas las cuentas de cobro de todas las comunidades.
 *       Solo accesible para superadmin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de todos los cargos
 *       403:
 *         description: No tiene permisos de superadmin
 */
router.get('/todas/resumen', authenticate, async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const usuarioId = req.user.sub;
    const isSuper = Boolean(req.user.is_superadmin === true);

    // Solo superadmin puede ver todos los cargos
    if (!isSuper) {
      return res.status(403).json({ error: 'forbidden - superadmin only' });
    }

    const [rows] = await db.query(
      `
      SELECT
        ccu.id,
        CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'Administración'
        END as tipo,
        ccu.monto_total as monto,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
        CASE
          WHEN ccu.estado = 'pendiente' THEN 'pendiente'
          WHEN ccu.estado = 'pagado' THEN 'pagado'
          WHEN ccu.estado = 'vencido' THEN 'vencido'
          WHEN ccu.estado = 'parcial' THEN 'parcial'
          ELSE 'pendiente'
        END as estado,
        u.codigo as unidad,
        c.razon_social as nombre_comunidad,
        egc.periodo as periodo,
        MAX(CONCAT(p.nombres, ' ', p.apellidos)) as propietario,
        ccu.saldo as saldo,
        ccu.interes_acumulado as interes_acumulado,
        DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
        ccu.updated_at
      FROM cuenta_cobro_unidad ccu
      JOIN comunidad c ON ccu.comunidad_id = c.id
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      LEFT JOIN (
          SELECT tu1.*
          FROM titulares_unidad tu1
          WHERE tu1.tipo = 'propietario'
            AND tu1.hasta IS NULL
            AND NOT EXISTS (
                SELECT 1 FROM titulares_unidad tu2
                WHERE tu2.unidad_id = tu1.unidad_id
                  AND tu2.tipo = 'propietario'
                  AND tu2.hasta IS NULL
                  AND tu2.created_at > tu1.created_at
            )
      ) tu ON u.id = tu.unidad_id
      LEFT JOIN persona p ON tu.persona_id = p.id
      GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, ccu.estado, ccu.created_at, ccu.updated_at, u.codigo, c.razon_social, egc.periodo, egc.fecha_vencimiento
      ORDER BY ccu.created_at DESC
    `
    );

    res.json(rows);
  } catch (err) {
    console.error('Error en /cargos/todas/resumen:', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/resumen:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener resumen de cargos de una comunidad
 *     description: |
 *       Retorna un resumen de las cuentas de cobro de una comunidad específica.
 *       - Superadmin: ve todos los cargos de la comunidad
 *       - Admin/Tesorero/Presidente: ve todos los cargos de su comunidad
 *       - Propietario/Inquilino/Residente: ve solo los cargos de sus unidades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resumen de cargos de la comunidad
 *       403:
 *         description: No tiene acceso a esta comunidad
 */
router.get(
  '/comunidad/:comunidadId/resumen',
  authenticate,
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const usuarioId = req.user.sub;
      const isSuper = Boolean(req.user.is_superadmin === true);

      // Verificar si es admin de la comunidad
      let isAdmin = false;
      if (!isSuper && usuarioId) {
        const [adminCheck] = await db.query(
          `SELECT 1 FROM usuario_rol_comunidad urc
           JOIN rol_sistema rs ON urc.rol_id = rs.id
           WHERE urc.usuario_id = ?
             AND urc.comunidad_id = ?
             AND urc.activo = 1
             AND rs.codigo IN ('admin_comunidad', 'tesorero', 'presidente_comite')
           LIMIT 1`,
          [usuarioId, comunidadId]
        );
        isAdmin = adminCheck && adminCheck.length > 0;
      }

      const conditions = ['ccu.comunidad_id = ?'];
      const params = [comunidadId];

      // Si NO es superadmin NI admin, filtrar por sus unidades
      if (!isSuper && !isAdmin && usuarioId) {
        // Buscar persona_id del usuario
        const [usuarioRows] = await db.query(
          'SELECT persona_id FROM usuario WHERE id = ? LIMIT 1',
          [usuarioId]
        );

        if (usuarioRows && usuarioRows.length > 0) {
          const personaId = usuarioRows[0].persona_id;
          // Agregar condición para filtrar solo sus unidades
          conditions.push(`u.id IN (
            SELECT unidad_id FROM titulares_unidad
            WHERE persona_id = ? AND hasta IS NULL
          )`);
          params.push(personaId);
        } else {
          // Si no tiene persona asociada, no puede ver nada
          return res.json([]);
        }
      }

      const sql = `
      SELECT
        ccu.id,
        CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'Administración'
        END as tipo,
        ccu.monto_total as monto,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
        CASE
          WHEN ccu.estado = 'pendiente' THEN 'pendiente'
          WHEN ccu.estado = 'pagado' THEN 'pagado'
          WHEN ccu.estado = 'vencido' THEN 'vencido'
          WHEN ccu.estado = 'parcial' THEN 'parcial'
          ELSE 'pendiente'
        END as estado,
        u.codigo as unidad,
        c.razon_social as nombre_comunidad,
        egc.periodo as periodo,
        MAX(CONCAT(p.nombres, ' ', p.apellidos)) as propietario,
        ccu.saldo as saldo,
        ccu.interes_acumulado as interes_acumulado,
        DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
        ccu.updated_at
      FROM cuenta_cobro_unidad ccu
      JOIN comunidad c ON ccu.comunidad_id = c.id
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      LEFT JOIN (
          SELECT tu1.*
          FROM titulares_unidad tu1
          WHERE tu1.tipo = 'propietario'
            AND tu1.hasta IS NULL
            AND NOT EXISTS (
                SELECT 1 FROM titulares_unidad tu2
                WHERE tu2.unidad_id = tu1.unidad_id
                  AND tu2.tipo = 'propietario'
                  AND tu2.hasta IS NULL
                  AND tu2.created_at > tu1.created_at
            )
      ) tu ON u.id = tu.unidad_id
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE ${conditions.join(' AND ')}
      GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, ccu.estado, ccu.created_at, ccu.updated_at, u.codigo, c.razon_social, egc.periodo, egc.fecha_vencimiento
      ORDER BY ccu.created_at DESC
    `;

      const [rows] = await db.query(sql, params);
      res.json(rows);
    } catch (err) {
      console.error('Error en /cargos/comunidad/resumen:', err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}:
 *   get:
 *     tags: [Cargos]
 *     summary: Listar cuentas de cobro de una comunidad
 *     description: |
 *       Obtiene las cuentas de cobro (cargos) de una comunidad con filtros opcionales.
 *       Cualquier miembro de la comunidad puede consultar esta información.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, pagado, vencido, parcial]
 *         description: Filtrar por estado de la cuenta
 *       - in: query
 *         name: unidad
 *         schema:
 *           type: integer
 *         description: ID de unidad específica
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *         description: Filtrar por período (formato YYYY-MM)
 *         example: "2024-03"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de cuentas de cobro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   concepto:
 *                     type: string
 *                     description: Código único del cargo (CHG-YYYY-XXXX)
 *                   tipo:
 *                     type: string
 *                     enum: [Administración, extraordinaria, multa, interes]
 *                   monto:
 *                     type: number
 *                     format: decimal
 *                   fecha_vencimiento:
 *                     type: string
 *                     format: date
 *                   estado:
 *                     type: string
 *                     enum: [pendiente, pagado, vencido, parcial]
 *                   unidad:
 *                     type: string
 *                     description: Código de la unidad
 *                   nombre_comunidad:
 *                     type: string
 *                   periodo:
 *                     type: string
 *                   propietario:
 *                     type: string
 *                   saldo:
 *                     type: number
 *                     format: decimal
 *                   interes_acumulado:
 *                     type: number
 *                     format: decimal
 *                   fecha_creacion:
 *                     type: string
 *                     format: date
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

// list cargos by comunidad with filters (members)
router.get(
  '/comunidad/:comunidadId',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const { estado, unidad, periodo, page = 1, limit = 100 } = req.query;
      const offset = (page - 1) * limit;
      const conditions = ['ccu.comunidad_id = ?'];
      const params = [comunidadId];

      // Verificar si es superadmin (de tabla usuario)
      const usuarioId = req.user.sub;
      const isSuper = Boolean(req.user.is_superadmin === true);

      // Verificar si es admin de la comunidad
      let isAdmin = false;
      if (!isSuper && usuarioId) {
        const [adminCheck] = await db.query(
          `SELECT 1 FROM usuario_rol_comunidad urc
           JOIN rol_sistema rs ON urc.rol_id = rs.id
           WHERE urc.usuario_id = ?
             AND urc.comunidad_id = ?
             AND urc.activo = 1
             AND rs.codigo IN ('admin_comunidad', 'tesorero', 'presidente_comite')
           LIMIT 1`,
          [usuarioId, comunidadId]
        );
        isAdmin = adminCheck && adminCheck.length > 0;
      }

      // Si NO es superadmin NI admin, filtrar por sus unidades
      if (!isSuper && !isAdmin && usuarioId) {
        // Buscar persona_id del usuario
        const [usuarioRows] = await db.query(
          'SELECT persona_id FROM usuario WHERE id = ? LIMIT 1',
          [usuarioId]
        );

        if (usuarioRows && usuarioRows.length > 0) {
          const personaId = usuarioRows[0].persona_id;
          // Agregar condición para filtrar solo sus unidades
          conditions.push(`u.id IN (
            SELECT unidad_id FROM titulares_unidad
            WHERE persona_id = ? AND hasta IS NULL
          )`);
          params.push(personaId);
        } else {
          // Si no tiene persona asociada, no puede ver nada
          return res.json([]);
        }
      }

      if (estado) {
        conditions.push('ccu.estado = ?');
        params.push(estado);
      }
      if (unidad) {
        conditions.push('u.id = ?');
        params.push(unidad);
      }
      if (periodo) {
        conditions.push('egc.periodo = ?');
        params.push(periodo);
      }

      const sql = `
    SELECT
      ccu.id,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
      CASE
        WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
        WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
        WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
        ELSE 'Administración'
      END as tipo,
      ccu.monto_total as monto,
      DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      CASE
        WHEN ccu.estado = 'pendiente' THEN 'pendiente'
        WHEN ccu.estado = 'pagado' THEN 'pagado'
        WHEN ccu.estado = 'vencido' THEN 'vencido'
        WHEN ccu.estado = 'parcial' THEN 'parcial'
        ELSE 'pendiente'
      END as estado,
      u.codigo as unidad,
      c.razon_social as nombre_comunidad,
      egc.periodo as periodo,
      MAX(CONCAT(p.nombres, ' ', p.apellidos)) as propietario,
      ccu.saldo as saldo,
      ccu.interes_acumulado as interes_acumulado,
      DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
      ccu.updated_at
    FROM cuenta_cobro_unidad ccu
    JOIN comunidad c ON ccu.comunidad_id = c.id
    JOIN unidad u ON ccu.unidad_id = u.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    LEFT JOIN (
        SELECT tu1.*
        FROM titulares_unidad tu1
        WHERE tu1.tipo = 'propietario'
          AND tu1.hasta IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM titulares_unidad tu2
              WHERE tu2.unidad_id = tu1.unidad_id
                AND tu2.tipo = 'propietario'
                AND tu2.hasta IS NULL
                AND tu2.created_at > tu1.created_at
          )
    ) tu ON u.id = tu.unidad_id
    LEFT JOIN persona p ON tu.persona_id = p.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, ccu.estado, ccu.created_at, ccu.updated_at, u.codigo, c.razon_social, egc.periodo, egc.fecha_vencimiento
    ORDER BY ccu.created_at DESC
    LIMIT ? OFFSET ?
  `;
      params.push(Number(limit), Number(offset));
      const [rows] = await db.query(sql, params);
      res.json(rows);
    } catch (err) {
      console.error('Error en /cargos/comunidad:', err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /cargos/{id}:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener detalle de una cuenta de cobro
 *     description: Retorna toda la información de una cuenta de cobro específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta de cobro
 *     responses:
 *       200:
 *         description: Detalle de la cuenta de cobro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 concepto:
 *                   type: string
 *                   description: Código único del cargo (CHG-YYYY-XXXX)
 *                 tipo:
 *                   type: string
 *                   enum: [Administración, extraordinaria, multa, interes]
 *                 monto:
 *                   type: number
 *                   format: decimal
 *                 fecha_vencimiento:
 *                   type: string
 *                   format: date
 *                 estado:
 *                   type: string
 *                   enum: [pendiente, pagado, vencido, parcial]
 *                 unidad:
 *                   type: string
 *                   description: Código de la unidad
 *                 nombre_comunidad:
 *                   type: string
 *                 periodo:
 *                   type: string
 *                 propietario:
 *                   type: string
 *                 email_propietario:
 *                   type: string
 *                 telefono_propietario:
 *                   type: string
 *                 saldo:
 *                   type: number
 *                   format: decimal
 *                 interes_acumulado:
 *                   type: number
 *                   format: decimal
 *                 fecha_creacion:
 *                   type: string
 *                   format: date
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 descripcion:
 *                   type: string
 *       404:
 *         description: Cuenta de cobro no encontrada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT
      ccu.id,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
      CASE
        WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
        WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
        WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
        ELSE 'Administración'
      END as tipo,
      ccu.monto_total as monto,
      DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      CASE
        WHEN ccu.estado = 'pendiente' THEN 'pendiente'
        WHEN ccu.estado = 'pagado' THEN 'pagado'
        WHEN ccu.estado = 'vencido' THEN 'vencido'
        WHEN ccu.estado = 'parcial' THEN 'parcial'
        ELSE 'pendiente'
      END as estado,
      u.codigo as unidad,
      c.razon_social as nombre_comunidad,
      egc.periodo as periodo,
      MAX(CONCAT(p.nombres, ' ', p.apellidos)) as propietario,
      MAX(p.email) as email_propietario,
      MAX(p.telefono) as telefono_propietario,
      ccu.saldo as saldo,
      ccu.interes_acumulado as interes_acumulado,
      DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
      ccu.updated_at,
      egc.observaciones as descripcion
    FROM cuenta_cobro_unidad ccu
    JOIN comunidad c ON ccu.comunidad_id = c.id
    JOIN unidad u ON ccu.unidad_id = u.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    LEFT JOIN (
        SELECT tu1.*
        FROM titulares_unidad tu1
        WHERE tu1.tipo = 'propietario'
          AND tu1.hasta IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM titulares_unidad tu2
              WHERE tu2.unidad_id = tu1.unidad_id
                AND tu2.tipo = 'propietario'
                AND tu2.hasta IS NULL
                AND tu2.created_at > tu1.created_at
          )
    ) tu ON u.id = tu.unidad_id
    LEFT JOIN persona p ON tu.persona_id = p.id
    WHERE ccu.id = ?
    GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, ccu.estado, ccu.created_at, ccu.updated_at, u.codigo, c.razon_social, egc.periodo, egc.fecha_vencimiento, egc.observaciones
  `;
  const [rows] = await db.query(sql, [id]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

/**
 * @swagger
 * /cargos/unidad/{id}:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener historial de cuentas de cobro de una unidad
 *     description: |
 *       Retorna las últimas 500 cuentas de cobro de una unidad específica, ordenadas por fecha (más recientes primero).
 *       Útil para ver el historial de cobros de un departamento o casa.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la unidad
 *     responses:
 *       200:
 *         description: Lista de cuentas de cobro de la unidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   concepto:
 *                     type: string
 *                     description: Código único del cargo (CHG-YYYY-XXXX)
 *                   tipo:
 *                     type: string
 *                     enum: [Administración, extraordinaria, multa, interes]
 *                   monto:
 *                     type: number
 *                     format: decimal
 *                   fecha_vencimiento:
 *                     type: string
 *                     format: date
 *                   estado:
 *                     type: string
 *                     enum: [pending, paid, overdue, partial]
 *                   unidad:
 *                     type: string
 *                     description: Código de la unidad
 *                   nombre_comunidad:
 *                     type: string
 *                   periodo:
 *                     type: string
 *                   saldo:
 *                     type: number
 *                     format: decimal
 *                   interes_acumulado:
 *                     type: number
 *                     format: decimal
 *                   fecha_creacion:
 *                     type: string
 *                     format: date
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/unidad/:id', authenticate, async (req, res) => {
  try {
    const unidadId = req.params.id;
    const usuarioId = req.user.sub;

    // Verificar si es superadmin (de tabla usuario)
    const isSuper = Boolean(req.user.is_superadmin === true);

    // Si NO es superadmin, verificar que la unidad pertenezca al usuario
    if (!isSuper && usuarioId) {
      // Buscar persona_id del usuario
      const [usuarioRows] = await db.query(
        'SELECT persona_id FROM usuario WHERE id = ? LIMIT 1',
        [usuarioId]
      );

      if (!usuarioRows || !usuarioRows.length) {
        return res.status(403).json({ error: 'forbidden' });
      }

      const personaId = usuarioRows[0].persona_id;

      // Verificar si es admin de la comunidad de esta unidad
      const [unidadInfo] = await db.query(
        'SELECT comunidad_id FROM unidad WHERE id = ? LIMIT 1',
        [unidadId]
      );

      if (!unidadInfo || !unidadInfo.length) {
        return res.status(404).json({ error: 'unidad not found' });
      }

      const comunidadId = unidadInfo[0].comunidad_id;

      const [adminCheck] = await db.query(
        `SELECT 1 FROM usuario_rol_comunidad urc
         JOIN rol_sistema rs ON urc.rol_id = rs.id
         WHERE urc.usuario_id = ?
           AND urc.comunidad_id = ?
           AND urc.activo = 1
           AND rs.codigo IN ('admin_comunidad', 'tesorero', 'presidente_comite')
         LIMIT 1`,
        [usuarioId, comunidadId]
      );

      const isAdmin = adminCheck && adminCheck.length > 0;

      // Si NO es admin, verificar que sea titular de la unidad
      if (!isAdmin) {
        const [titularCheck] = await db.query(
          `SELECT 1 FROM titulares_unidad
           WHERE unidad_id = ? AND persona_id = ? AND hasta IS NULL
           LIMIT 1`,
          [unidadId, personaId]
        );

        if (!titularCheck || !titularCheck.length) {
          return res
            .status(403)
            .json({ error: 'forbidden - no access to this unit' });
        }
      }
    }

    const sql = `
    SELECT
      ccu.id,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
      CASE
        WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
        WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
        WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
        ELSE 'Administración'
      END as tipo,
      ccu.monto_total as monto,
      DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      CASE
        WHEN ccu.estado = 'pendiente' THEN 'pending'
        WHEN ccu.estado = 'pagado' THEN 'paid'
        WHEN ccu.estado = 'vencido' THEN 'overdue'
        WHEN ccu.estado = 'parcial' THEN 'partial'
        ELSE 'pending'
      END as estado,
      u.codigo as unidad,
      c.razon_social as nombre_comunidad,
      egc.periodo as periodo,
      ccu.saldo as saldo,
      ccu.interes_acumulado as interes_acumulado,
      DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
      ccu.updated_at
    FROM cuenta_cobro_unidad ccu
    JOIN comunidad c ON ccu.comunidad_id = c.id
    JOIN unidad u ON ccu.unidad_id = u.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    WHERE ccu.unidad_id = ?
    ORDER BY ccu.created_at DESC
  `;
    const [rows] = await db.query(sql, [unidadId]);
    res.json(rows);
  } catch (err) {
    console.error('Error en /cargos/unidad:', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /cargos:
 *   post:
 *     tags: [Cargos]
 *     summary: Crear una nueva cuenta de cobro
 *     description: |
 *       Crea una nueva cuenta de cobro para una unidad específica.
 *       Solo administradores pueden crear cargos.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concept
 *               - type
 *               - amount
 *               - dueDate
 *               - unit
 *             properties:
 *               concept:
 *                 type: string
 *                 description: Concepto/descripción del cargo
 *                 example: "Administración Enero 2024"
 *               type:
 *                 type: string
 *                 enum: [administration, maintenance, service, insurance, other]
 *                 description: Tipo de cargo
 *                 example: "administration"
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 description: Monto total del cargo
 *                 example: 250000
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento
 *                 example: "2024-01-31"
 *               unit:
 *                 type: string
 *                 description: Código de la unidad
 *                 example: "101-A"
 *               description:
 *                 type: string
 *                 description: Descripción adicional (opcional)
 *                 example: "Cuota de administración mensual"
 *     responses:
 *       201:
 *         description: Cargo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 concepto:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 monto:
 *                   type: number
 *                 fecha_vencimiento:
 *                   type: string
 *                 estado:
 *                   type: string
 *                 unidad:
 *                   type: string
 *                 nombre_comunidad:
 *                   type: string
 *                 periodo:
 *                   type: string
 *                 propietario:
 *                   type: string
 *                 saldo:
 *                   type: number
 *                 fecha_creacion:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No tiene permisos para crear cargos
 *       404:
 *         description: Unidad no encontrada
 */

router.post(
  '/',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('concept').notEmpty().withMessage('El concepto es obligatorio'),
    body('type')
      .isIn(['administration', 'maintenance', 'service', 'insurance', 'other'])
      .withMessage('Tipo de cargo inválido'),
    body('amount').isNumeric().withMessage('El monto debe ser numérico'),
    body('dueDate').isISO8601().withMessage('Fecha de vencimiento inválida'),
    body('unit').notEmpty().withMessage('La unidad es obligatoria'),
  ],
  async (req, res) => {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: errors.array(),
        });
      }

      const { concept, type, amount, dueDate, unit, description } = req.body;

      // Buscar la unidad por código
      const [unitRows] = await db.query(
        `
      SELECT u.id, u.comunidad_id, u.alicuota, c.razon_social as nombre_comunidad,
             CONCAT(p.nombres, ' ', p.apellidos) as propietario
      FROM unidad u
      JOIN comunidad c ON u.comunidad_id = c.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND tu.hasta IS NULL
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE u.codigo = ? AND u.activa = 1
    `,
        [unit]
      );

      if (unitRows.length === 0) {
        return res.status(404).json({
          error: 'Unidad no encontrada',
          message: `La unidad con código '${unit}' no existe o no está activa`,
        });
      }

      const unitData = unitRows[0];

      // Verificar que el usuario tiene acceso a esta comunidad
      if (!req.user.comunidades?.includes(unitData.comunidad_id)) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tiene permisos para crear cargos en esta comunidad',
        });
      }

      // Crear emisión de gastos comunes para este cargo individual
      const [emisionResult] = await db.query(
        `
      INSERT INTO emision_gastos_comunes (
        comunidad_id,
        periodo,
        fecha_vencimiento,
        estado,
        observaciones,
        created_at
      ) VALUES (?, ?, ?, 'emitido', ?, NOW())
    `,
        [
          unitData.comunidad_id,
          concept, // Usar el concepto como período
          dueDate,
          description || concept,
        ]
      );

      const emisionId = emisionResult.insertId;

      // Crear el cargo
      const [cargoResult] = await db.query(
        `
      INSERT INTO cuenta_cobro_unidad (
        emision_id,
        comunidad_id,
        unidad_id,
        monto_total,
        saldo,
        estado,
        interes_acumulado
      ) VALUES (?, ?, ?, ?, ?, 'pendiente', 0)
    `,
        [emisionId, unitData.comunidad_id, unitData.id, amount, amount]
      );

      const cargoId = cargoResult.insertId;

      // Crear detalle del cargo
      await db.query(
        `
      INSERT INTO detalle_cuenta_unidad (
        cuenta_cobro_unidad_id,
        categoria_id,
        glosa,
        monto,
        origen,
        iva_incluido
      ) VALUES (?, 1, ?, ?, 'ajuste', 1)
    `,
        [cargoId, description || concept, amount]
      );

      // Obtener el cargo creado con todos los datos
      const [cargoRows] = await db.query(
        `
      SELECT
        ccu.id,
        CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
        CASE
          WHEN ? = 'administration' THEN 'Administración'
          WHEN ? = 'maintenance' THEN 'Mantenimiento'
          WHEN ? = 'service' THEN 'Servicio'
          WHEN ? = 'insurance' THEN 'Seguro'
          ELSE 'Otro'
        END as tipo,
        ccu.monto_total as monto,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
        ccu.estado,
        u.codigo as unidad,
        c.razon_social as nombre_comunidad,
        egc.periodo as periodo,
        CONCAT(p.nombres, ' ', p.apellidos) as propietario,
        ccu.saldo,
        ccu.interes_acumulado,
        DATE_FORMAT(ccu.created_at, '%Y-%m-%d') as fecha_creacion,
        ccu.updated_at
      FROM cuenta_cobro_unidad ccu
      JOIN comunidad c ON ccu.comunidad_id = c.id
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND tu.hasta IS NULL
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE ccu.id = ?
    `,
        [type, type, type, type, cargoId]
      );

      res.status(201).json(cargoRows[0]);
    } catch (error) {
      console.error('Error creando cargo:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo crear el cargo',
      });
    }
  }
);

/**
 * @swagger
 * /cargos/{id}/detalle:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener detalle de gastos que componen un cargo
 *     description: Retorna el breakdown por categoría de los gastos que conforman una cuenta de cobro específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta de cobro
 *     responses:
 *       200:
 *         description: Detalle de gastos del cargo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   categoria:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   monto:
 *                     type: number
 *                     format: decimal
 *                   origen:
 *                     type: string
 *                   origen_id:
 *                     type: integer
 *                   iva_incluido:
 *                     type: boolean
 *       404:
 *         description: Cuenta de cobro no encontrada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/:id/detalle', authenticate, async (req, res) => {
  const cargoId = req.params.id;
  const sql = `
    SELECT
      dcu.id,
      cg.nombre as categoria,
      dcu.glosa as descripcion,
      dcu.monto as monto,
      CASE
        WHEN dcu.origen = 'gasto' THEN 'Gasto'
        WHEN dcu.origen = 'multa' THEN 'Multa'
        WHEN dcu.origen = 'consumo' THEN 'Consumo'
        WHEN dcu.origen = 'ajuste' THEN 'Ajuste'
        ELSE 'Otro'
      END as origen,
      dcu.origen_id as origen_id,
      dcu.iva_incluido as iva_incluido
    FROM detalle_cuenta_unidad dcu
    LEFT JOIN categoria_gasto cg ON dcu.categoria_id = cg.id
    WHERE dcu.cuenta_cobro_unidad_id = ?
    ORDER BY dcu.id
  `;
  const [rows] = await db.query(sql, [cargoId]);
  res.json(rows);
});

/**
 * @swagger
 * /cargos/{id}/pagos:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener pagos aplicados a un cargo
 *     description: Retorna todos los pagos que han sido aplicados a una cuenta de cobro específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta de cobro
 *     responses:
 *       200:
 *         description: Lista de pagos aplicados al cargo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   pago_id:
 *                     type: integer
 *                   fecha_pago:
 *                     type: string
 *                     format: date
 *                   monto_pago:
 *                     type: number
 *                     format: decimal
 *                   monto_aplicado:
 *                     type: number
 *                     format: decimal
 *                   metodo_pago:
 *                     type: string
 *                   referencia:
 *                     type: string
 *                   numero_comprobante:
 *                     type: string
 *                   estado_pago:
 *                     type: string
 *                   nombre_pagador:
 *                     type: string
 *                   email_pagador:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/:id/pagos', authenticate, async (req, res) => {
  const cargoId = req.params.id;
  const sql = `
    SELECT
      pa.id,
      p.id as pago_id,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') as fecha_pago,
      p.monto as monto_pago,
      pa.monto as monto_aplicado,
      CASE
        WHEN p.medio = 'transferencia' THEN 'bank_transfer'
        WHEN p.medio = 'webpay' THEN 'webpay'
        WHEN p.medio = 'khipu' THEN 'khipu'
        WHEN p.medio = 'servipag' THEN 'servipag'
        WHEN p.medio = 'efectivo' THEN 'cash'
        ELSE p.medio
      END as metodo_pago,
      p.referencia as referencia,
      p.comprobante_num as numero_comprobante,
      CASE
        WHEN p.estado = 'pendiente' THEN 'pending'
        WHEN p.estado = 'aplicado' THEN 'applied'
        WHEN p.estado = 'reversado' THEN 'reversed'
        ELSE 'pending'
      END as estado_pago,
      CONCAT(pers.nombres, ' ', pers.apellidos) as nombre_pagador,
      pers.email as email_pagador
    FROM pago_aplicacion pa
    JOIN pago p ON pa.pago_id = p.id
    LEFT JOIN persona pers ON p.persona_id = pers.id
    WHERE pa.cuenta_cobro_unidad_id = ?
    ORDER BY p.fecha DESC, pa.id DESC
  `;
  const [rows] = await db.query(sql, [cargoId]);
  res.json(rows);
});

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/estadisticas:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener estadísticas de cargos por comunidad
 *     description: Retorna estadísticas generales de las cuentas de cobro de una comunidad
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
 *         description: Estadísticas de cargos de la comunidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_cargos:
 *                   type: integer
 *                 monto_total:
 *                   type: number
 *                   format: decimal
 *                 saldo_total:
 *                   type: number
 *                   format: decimal
 *                 interes_total:
 *                   type: number
 *                   format: decimal
 *                 monto_promedio:
 *                   type: number
 *                   format: decimal
 *                 cargos_pagados:
 *                   type: integer
 *                 cargos_pendientes:
 *                   type: integer
 *                 cargos_vencidos:
 *                   type: integer
 *                 cargos_parciales:
 *                   type: integer
 *                 cargo_mas_antiguo:
 *                   type: string
 *                   format: date-time
 *                 cargo_mas_reciente:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/estadisticas',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      COUNT(*) as total_cargos,
      SUM(ccu.monto_total) as monto_total,
      SUM(ccu.saldo) as saldo_total,
      SUM(ccu.interes_acumulado) as interes_total,
      AVG(ccu.monto_total) as monto_promedio,
      COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as cargos_pagados,
      COUNT(CASE WHEN ccu.estado = 'pendiente' THEN 1 END) as cargos_pendientes,
      COUNT(CASE WHEN ccu.estado = 'vencido' THEN 1 END) as cargos_vencidos,
      COUNT(CASE WHEN ccu.estado = 'parcial' THEN 1 END) as cargos_parciales,
      MIN(ccu.created_at) as cargo_mas_antiguo,
      MAX(ccu.created_at) as cargo_mas_reciente
    FROM cuenta_cobro_unidad ccu
    WHERE ccu.comunidad_id = ?
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows[0]);
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/periodo/{periodo}:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener cargos por período
 *     description: Retorna las cuentas de cobro agrupadas por período de emisión de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la comunidad
 *       - in: path
 *         name: periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-03"
 *     responses:
 *       200:
 *         description: Cargos agrupados por período
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   periodo:
 *                     type: string
 *                   cantidad_cargos:
 *                     type: integer
 *                   monto_total:
 *                     type: number
 *                     format: decimal
 *                   saldo_total:
 *                     type: number
 *                     format: decimal
 *                   cantidad_pagados:
 *                     type: integer
 *                   cantidad_pendientes:
 *                     type: integer
 *                   cantidad_vencidos:
 *                     type: integer
 *                   fecha_vencimiento:
 *                     type: string
 *                     format: date
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/periodo/:periodo',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const { comunidadId, periodo } = req.params;
    const sql = `
    SELECT
      egc.periodo as periodo,
      COUNT(ccu.id) as cantidad_cargos,
      SUM(ccu.monto_total) as monto_total,
      SUM(ccu.saldo) as saldo_total,
      COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as cantidad_pagados,
      COUNT(CASE WHEN ccu.estado = 'pendiente' THEN 1 END) as cantidad_pendientes,
      COUNT(CASE WHEN ccu.estado = 'vencido' THEN 1 END) as cantidad_vencidos,
      MIN(egc.fecha_vencimiento) as fecha_vencimiento
    FROM emision_gastos_comunes egc
    LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
    WHERE egc.comunidad_id = ? AND egc.periodo = ?
    GROUP BY egc.periodo, egc.id
    ORDER BY egc.periodo DESC
  `;
    const [rows] = await db.query(sql, [comunidadId, periodo]);
    res.json(rows);
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/vencidos:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener cargos vencidos
 *     description: Retorna las cuentas de cobro que han vencido y están pendientes de pago
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
 *         description: Lista de cargos vencidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   concepto:
 *                     type: string
 *                   monto:
 *                     type: number
 *                     format: decimal
 *                   fecha_vencimiento:
 *                     type: string
 *                     format: date
 *                   dias_vencido:
 *                     type: integer
 *                   saldo:
 *                     type: number
 *                     format: decimal
 *                   interes_acumulado:
 *                     type: number
 *                     format: decimal
 *                   unidad:
 *                     type: string
 *                   propietario:
 *                     type: string
 *                   email_propietario:
 *                     type: string
 *                   nombre_comunidad:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/vencidos',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      ccu.id,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
      ccu.monto_total as monto,
      DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      DATEDIFF(CURDATE(), egc.fecha_vencimiento) as dias_vencido,
      ccu.saldo as saldo,
      ccu.interes_acumulado as interes_acumulado,
      u.codigo as unidad,
      MAX(CONCAT(p.nombres, ' ', p.apellidos)) as propietario,
      MAX(p.email) as email_propietario,
      c.razon_social as nombre_comunidad
    FROM cuenta_cobro_unidad ccu
    JOIN comunidad c ON ccu.comunidad_id = c.id
    JOIN unidad u ON ccu.unidad_id = u.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    LEFT JOIN (
        SELECT tu1.*
        FROM titulares_unidad tu1
        WHERE tu1.tipo = 'propietario'
          AND tu1.hasta IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM titulares_unidad tu2
              WHERE tu2.unidad_id = tu1.unidad_id
                AND tu2.tipo = 'propietario'
                AND tu2.hasta IS NULL
                AND tu2.created_at > tu1.created_at
          )
    ) tu ON u.id = tu.unidad_id
    LEFT JOIN persona p ON tu.persona_id = p.id
    WHERE ccu.estado IN ('pendiente', 'parcial', 'vencido')
      AND egc.fecha_vencimiento < CURDATE()
      AND ccu.comunidad_id = ?
    GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, ccu.estado, ccu.created_at, u.codigo, c.razon_social, egc.fecha_vencimiento, egc.periodo
    ORDER BY egc.fecha_vencimiento ASC, ccu.saldo DESC
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows);
  }
);

/**
 * @swagger
 * /cargos/{id}/historial-pagos:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener historial completo de pagos de un cargo
 *     description: Retorna el historial completo de pagos aplicados a una cuenta de cobro específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta de cobro
 *     responses:
 *       200:
 *         description: Historial completo de pagos del cargo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   paymentId:
 *                     type: integer
 *                   paymentDate:
 *                     type: string
 *                     format: date
 *                   totalPaymentAmount:
 *                     type: number
 *                     format: decimal
 *                   appliedToChargeAmount:
 *                     type: number
 *                     format: decimal
 *                   paymentMethod:
 *                     type: string
 *                   reference:
 *                     type: string
 *                   receiptNumber:
 *                     type: string
 *                   paymentStatus:
 *                     type: string
 *                   payerName:
 *                     type: string
 *                   payerEmail:
 *                     type: string
 *                   paymentCreatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/:id/historial-pagos', authenticate, async (req, res) => {
  const cargoId = req.params.id;
  const sql = `
    SELECT
      p.id as paymentId,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') as paymentDate,
      p.monto as totalPaymentAmount,
      pa.monto as appliedToChargeAmount,
      CASE
        WHEN p.medio = 'transferencia' THEN 'bank_transfer'
        WHEN p.medio = 'webpay' THEN 'webpay'
        WHEN p.medio = 'khipu' THEN 'khipu'
        WHEN p.medio = 'servipag' THEN 'servipag'
        WHEN p.medio = 'efectivo' THEN 'cash'
        ELSE p.medio
      END as paymentMethod,
      p.referencia as reference,
      p.comprobante_num as receiptNumber,
      CASE
        WHEN p.estado = 'pendiente' THEN 'pending'
        WHEN p.estado = 'aplicado' THEN 'applied'
        WHEN p.estado = 'reversado' THEN 'reversed'
        ELSE 'pending'
      END as paymentStatus,
      CONCAT(pers.nombres, ' ', pers.apellidos) as payerName,
      pers.email as payerEmail,
      p.created_at as paymentCreatedAt
    FROM pago_aplicacion pa
    JOIN pago p ON pa.pago_id = p.id
    LEFT JOIN persona pers ON p.persona_id = pers.id
    WHERE pa.cuenta_cobro_unidad_id = ?
    ORDER BY p.fecha DESC, p.created_at DESC
  `;
  const [rows] = await db.query(sql, [cargoId]);
  res.json(rows);
});

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/por-estado:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener cargos agrupados por estado
 *     description: Retorna las cuentas de cobro agrupadas por estado para dashboard de una comunidad
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
 *         description: Cargos agrupados por estado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   estado:
 *                     type: string
 *                   cantidad:
 *                     type: integer
 *                   monto_total:
 *                     type: number
 *                     format: decimal
 *                   saldo_total:
 *                     type: number
 *                     format: decimal
 *                   monto_promedio:
 *                     type: number
 *                     format: decimal
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/por-estado',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      CASE
        WHEN ccu.estado = 'pendiente' THEN 'pending'
        WHEN ccu.estado = 'pagado' THEN 'paid'
        WHEN ccu.estado = 'vencido' THEN 'overdue'
        WHEN ccu.estado = 'parcial' THEN 'partial'
        ELSE 'pending'
      END as estado,
      COUNT(*) as cantidad,
      SUM(ccu.monto_total) as monto_total,
      SUM(ccu.saldo) as saldo_total,
      AVG(ccu.monto_total) as monto_promedio
    FROM cuenta_cobro_unidad ccu
    WHERE ccu.comunidad_id = ?
    GROUP BY ccu.estado
    ORDER BY
      CASE ccu.estado
        WHEN 'vencido' THEN 1
        WHEN 'pendiente' THEN 2
        WHEN 'parcial' THEN 3
        WHEN 'pagado' THEN 4
        ELSE 5
      END
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows);
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/validacion:
 *   get:
 *     tags: [Cargos]
 *     summary: Validar cargos de una comunidad
 *     description: Verifica que las cuentas de cobro tengan todos los datos necesarios y estén correctamente configuradas
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
 *         description: Resultados de validación de cargos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   estado_validacion:
 *                     type: string
 *                   monto_total:
 *                     type: number
 *                     format: decimal
 *                   saldo:
 *                     type: number
 *                     format: decimal
 *                   cantidad_detalles:
 *                     type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/validacion',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      ccu.id,
      CASE
        WHEN ccu.emision_id IS NULL THEN 'Missing emission reference'
        WHEN ccu.unidad_id IS NULL THEN 'Missing unit reference'
        WHEN ccu.monto_total <= 0 THEN 'Invalid amount'
        WHEN NOT EXISTS (
          SELECT 1 FROM detalle_cuenta_unidad dcu
          WHERE dcu.cuenta_cobro_unidad_id = ccu.id
        ) THEN 'No charge details found'
        ELSE 'Valid'
      END as estado_validacion,
      ccu.monto_total,
      ccu.saldo,
      COUNT(dcu.id) as cantidad_detalles
    FROM cuenta_cobro_unidad ccu
    LEFT JOIN detalle_cuenta_unidad dcu ON ccu.id = dcu.cuenta_cobro_unidad_id
    WHERE ccu.comunidad_id = ?
    GROUP BY ccu.id, ccu.emision_id, ccu.unidad_id, ccu.monto_total, ccu.saldo
    HAVING estado_validacion != 'Valid'
    ORDER BY ccu.id
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows);
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/con-interes:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener cargos con interés acumulado
 *     description: Retorna las cuentas de cobro que tienen interés acumulado pendiente de pago
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
 *         description: Lista de cargos con interés acumulado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   concepto:
 *                     type: string
 *                   monto_original:
 *                     type: number
 *                     format: decimal
 *                   saldo_actual:
 *                     type: number
 *                     format: decimal
 *                   interes_acumulado:
 *                     type: number
 *                     format: decimal
 *                   total_con_interes:
 *                     type: number
 *                     format: decimal
 *                   dias_vencido:
 *                     type: integer
 *                   unidad:
 *                     type: string
 *                   propietario:
 *                     type: string
 *                   nombre_comunidad:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/con-interes',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      ccu.id,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
      ccu.monto_total as monto_original,
      ccu.saldo as saldo_actual,
      ccu.interes_acumulado as interes_acumulado,
      (ccu.monto_total + ccu.interes_acumulado) as total_con_interes,
      DATEDIFF(CURDATE(), egc.fecha_vencimiento) as dias_vencido,
      u.codigo as unidad,
      MAX(CONCAT(p.nombres, ' ', p.apellidos)) as propietario,
      c.razon_social as nombre_comunidad
    FROM cuenta_cobro_unidad ccu
    JOIN comunidad c ON ccu.comunidad_id = c.id
    JOIN unidad u ON ccu.unidad_id = u.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    LEFT JOIN (
        SELECT tu1.*
        FROM titulares_unidad tu1
        WHERE tu1.tipo = 'propietario'
          AND tu1.hasta IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM titulares_unidad tu2
              WHERE tu2.unidad_id = tu1.unidad_id
                AND tu2.tipo = 'propietario'
                AND tu2.hasta IS NULL
                AND tu2.created_at > tu1.created_at
          )
    ) tu ON u.id = tu.unidad_id
    LEFT JOIN persona p ON tu.persona_id = p.id
    WHERE ccu.interes_acumulado > 0
      AND ccu.comunidad_id = ?
    GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, ccu.estado, ccu.created_at, u.codigo, c.razon_social, egc.fecha_vencimiento, egc.periodo
    ORDER BY ccu.interes_acumulado DESC
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows);
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/resumen-pagos:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener resumen de pagos por cargo
 *     description: Retorna un resumen de pagos aplicados a cada cuenta de cobro de una comunidad
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
 *         description: Resumen de pagos por cargo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chargeId:
 *                     type: integer
 *                   concept:
 *                     type: string
 *                   totalAmount:
 *                     type: number
 *                     format: decimal
 *                   remainingBalance:
 *                     type: number
 *                     format: decimal
 *                   totalPaid:
 *                     type: number
 *                     format: decimal
 *                   paymentCount:
 *                     type: integer
 *                   lastPaymentDate:
 *                     type: string
 *                     format: date
 *                   estado_calculado:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/resumen-pagos',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      ccu.id as chargeId,
      CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concept,
      ccu.monto_total as totalAmount,
      ccu.saldo as remainingBalance,
      COALESCE(SUM(pa.monto), 0) as totalPaid,
      COUNT(DISTINCT pa.pago_id) as paymentCount,
      MAX(p.fecha) as lastPaymentDate,
      CASE
        WHEN ccu.saldo <= 0 THEN 'paid'
        WHEN COALESCE(SUM(pa.monto), 0) > 0 THEN 'partial'
        WHEN egc.fecha_vencimiento < CURDATE() THEN 'overdue'
        ELSE 'pending'
      END as estado_calculado
    FROM cuenta_cobro_unidad ccu
    LEFT JOIN pago_aplicacion pa ON ccu.id = pa.cuenta_cobro_unidad_id
    LEFT JOIN pago p ON pa.pago_id = p.id
    LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
    WHERE ccu.comunidad_id = ?
    GROUP BY ccu.id, ccu.monto_total, ccu.saldo, ccu.created_at, egc.fecha_vencimiento
    ORDER BY ccu.created_at DESC
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows);
  }
);

/**
 * @swagger
 * /cargos/comunidad/{comunidadId}/por-categoria:
 *   get:
 *     tags: [Cargos]
 *     summary: Obtener análisis de cargos por categoría de gasto
 *     description: Retorna un análisis de las cuentas de cobro agrupadas por categoría de gasto
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
 *         description: Análisis de cargos por categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre_categoria:
 *                     type: string
 *                   tipo_categoria:
 *                     type: string
 *                   cantidad_detalles_cargo:
 *                     type: integer
 *                   monto_total:
 *                     type: number
 *                     format: decimal
 *                   monto_promedio:
 *                     type: number
 *                     format: decimal
 *                   cargos_unicos:
 *                     type: integer
 *                   unidades_afectadas:
 *                     type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: No es miembro de la comunidad
 */

router.get(
  '/comunidad/:comunidadId/por-categoria',
  authenticate,
  requireCommunity('comunidadId'),
  async (req, res) => {
    const comunidadId = req.params.comunidadId;
    const sql = `
    SELECT
      cg.nombre as nombre_categoria,
      cg.tipo as tipo_categoria,
      COUNT(dcu.id) as cantidad_detalles_cargo,
      SUM(dcu.monto) as monto_total,
      AVG(dcu.monto) as monto_promedio,
      COUNT(DISTINCT ccu.id) as cargos_unicos,
      COUNT(DISTINCT ccu.unidad_id) as unidades_afectadas
    FROM categoria_gasto cg
    JOIN detalle_cuenta_unidad dcu ON cg.id = dcu.categoria_id
    JOIN cuenta_cobro_unidad ccu ON dcu.cuenta_cobro_unidad_id = ccu.id
    WHERE cg.comunidad_id = ?
    GROUP BY cg.id, cg.nombre, cg.tipo
  `;
    const [rows] = await db.query(sql, [comunidadId]);
    res.json(rows);
  }
);

router.post(
  '/:id/recalcular-interes',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const cargoId = req.params.id;

    try {
      // Obtener información del cargo
      const [cargoRows] = await db.query(
        `
      SELECT ccu.id, ccu.monto_total, ccu.saldo, ccu.interes_acumulado, egc.fecha_vencimiento
      FROM cuenta_cobro_unidad ccu
      LEFT JOIN emision_gastos_comunes egc ON ccu.emision_id = egc.id
      WHERE ccu.id = ?
    `,
        [cargoId]
      );

      if (cargoRows.length === 0) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }

      const cargo = cargoRows[0];

      if (!cargo.fecha_vencimiento) {
        return res
          .status(400)
          .json({ error: 'El cargo no tiene fecha de vencimiento' });
      }

      // Calcular días de vencimiento
      const [diasRows] = await db.query(
        `
      SELECT DATEDIFF(CURDATE(), ?) as dias_vencido
    `,
        [cargo.fecha_vencimiento]
      );

      const diasVencido = Math.max(0, diasRows[0].dias_vencido);

      // Tasa de interés mensual (ejemplo: 2% mensual)
      const tasaInteresMensual = 0.02;
      const tasaInteresDiaria = tasaInteresMensual / 30;

      // Calcular interés acumulado
      const interesCalculado = cargo.saldo * tasaInteresDiaria * diasVencido;

      // Actualizar el interés acumulado
      await db.query(
        `
      UPDATE cuenta_cobro_unidad 
      SET interes_acumulado = ?
      WHERE id = ?
    `,
        [interesCalculado, cargoId]
      );

      res.json({
        success: true,
        message: 'Interés recalculado exitosamente',
        cargoId: cargoId,
        diasVencido: diasVencido,
        interesAcumulado: interesCalculado,
      });
    } catch (error) {
      console.error('Error recalculando interés:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

router.post(
  '/:id/notificar',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const cargoId = req.params.id;

    try {
      // Obtener información del cargo y propietario
      const [cargoRows] = await db.query(
        `
      SELECT 
        ccu.id,
        CONCAT('CHG-', YEAR(ccu.created_at), '-', LPAD(ccu.id, 4, '0')) as concepto,
        ccu.monto_total,
        ccu.saldo,
        ccu.interes_acumulado,
        u.codigo as unidad,
        p.email as email_propietario,
        p.telefono as telefono_propietario,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_propietario
      FROM cuenta_cobro_unidad ccu
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND tu.tipo = 'propietario' AND tu.hasta IS NULL
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE ccu.id = ?
    `,
        [cargoId]
      );

      if (cargoRows.length === 0) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }

      const cargo = cargoRows[0];

      // Aquí se implementaría el envío de notificación (email, SMS, etc.)
      // Por ahora, solo registramos la notificación
      console.log('Notificación enviada para cargo:', {
        cargoId: cargo.id,
        concepto: cargo.concepto,
        monto: cargo.monto_total,
        saldo: cargo.saldo,
        propietario: cargo.nombre_propietario,
        email: cargo.email_propietario,
        telefono: cargo.telefono_propietario,
      });

      // Podríamos guardar un registro de notificación en la base de datos
      // await db.query('INSERT INTO notificaciones (...) VALUES (...)', [...]);

      res.json({
        success: true,
        message: 'Notificación enviada exitosamente',
        cargoId: cargoId,
        notificadoA: cargo.nombre_propietario,
        email: cargo.email_propietario,
      });
    } catch (error) {
      console.error('Error enviando notificación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// =========================================
// CRUD OPERATIONS - PUT/DELETE
// =========================================

/**
 * @swagger
 * /cargos/{id}:
 *   put:
 *     tags: [Cargos]
 *     summary: Actualizar cargo/cuenta de cobro
 *     description: Actualiza un cargo existente (solo si está pendiente)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:
 *                 type: number
 *                 description: Monto del cargo
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento
 *               descripcion:
 *                 type: string
 *                 description: Descripción del cargo
 *               concepto:
 *                 type: string
 *                 description: Concepto/tipo de cargo
 *     responses:
 *       200:
 *         description: Cargo actualizado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Cargo no encontrado
 *       409:
 *         description: Cargo no puede ser actualizado
 *       500:
 *         description: Error servidor
 */
router.put(
  '/:id',
  [
    authenticate,
    authorize('superadmin', 'admin_comunidad', 'tesorero', 'contador'),
    body('monto').optional().isNumeric(),
    body('fecha_vencimiento').optional().notEmpty(),
    body('descripcion').optional().trim(),
    body('concepto').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const cargoId = Number(req.params.id);

      // Obtener cargo anterior
      const [cargoAnterior] = await db.query(
        'SELECT * FROM cargo_unidad WHERE id = ?',
        [cargoId]
      );
      if (!cargoAnterior.length) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }

      // Verificar que el cargo esté pendiente (no pagado ni parcial con muchos pagos)
      if (cargoAnterior[0].estado === 'pagado') {
        return res.status(409).json({
          error:
            'No se puede actualizar un cargo ya pagado. Contacte a administración.',
        });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.monto !== undefined) {
        campos.push('monto_total = ?');
        valores.push(req.body.monto);
      }
      if (req.body.fecha_vencimiento !== undefined) {
        campos.push('fecha_vencimiento = ?');
        valores.push(req.body.fecha_vencimiento);
      }
      if (req.body.descripcion !== undefined) {
        campos.push('descripcion = ?');
        valores.push(req.body.descripcion);
      }
      if (req.body.concepto !== undefined) {
        campos.push('concepto = ?');
        valores.push(req.body.concepto);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(cargoId);

      // Ejecutar actualización
      await db.query(
        `UPDATE cargo_unidad SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener cargo actualizado
      const [cargoActualizado] = await db.query(
        'SELECT * FROM cargo_unidad WHERE id = ?',
        [cargoId]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'cargo_unidad', ?, ?, ?, ?)`,
        [
          req.user.id,
          cargoId,
          JSON.stringify(cargoAnterior[0]),
          JSON.stringify(cargoActualizado[0]),
          req.ip,
        ]
      );

      res.json(cargoActualizado[0]);
    } catch (err) {
      console.error('Error al actualizar cargo:', err);
      res.status(500).json({ error: 'Error al actualizar cargo' });
    }
  }
);

/**
 * @swagger
 * /cargos/{id}:
 *   delete:
 *     tags: [Cargos]
 *     summary: Eliminar cargo/cuenta de cobro
 *     description: Elimina un cargo verificando que esté completamente pendiente (sin pagos aplicados)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cargo eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Cargo no encontrado
 *       409:
 *         description: Cargo no puede ser eliminado
 *       500:
 *         description: Error servidor
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin_comunidad'),
  async (req, res) => {
    try {
      const cargoId = Number(req.params.id);

      // Obtener cargo a eliminar
      const [cargo] = await db.query(
        'SELECT * FROM cargo_unidad WHERE id = ?',
        [cargoId]
      );
      if (!cargo.length) {
        return res.status(404).json({ error: 'Cargo no encontrado' });
      }

      // Verificar que el cargo no tenga pagos aplicados
      const [pagosAplicados] = await db.query(
        'SELECT COUNT(*) as total FROM aplicacion_pago WHERE cargo_id = ?',
        [cargoId]
      );

      if (pagosAplicados[0].total > 0) {
        return res.status(409).json({
          error:
            'No se puede eliminar un cargo que tiene pagos aplicados. Primero revise los pagos.',
        });
      }

      // Realizar eliminación
      await db.query('DELETE FROM cargo_unidad WHERE id = ?', [cargoId]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address)
         VALUES (?, 'DELETE', 'cargo_unidad', ?, ?, ?)`,
        [req.user.id, cargoId, JSON.stringify(cargo[0]), req.ip]
      );

      res.status(204).end();
    } catch (err) {
      console.error('Error al eliminar cargo:', err);
      res.status(500).json({ error: 'Error al eliminar cargo' });
    }
  }
);

module.exports = router;
