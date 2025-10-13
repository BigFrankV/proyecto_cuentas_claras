const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * tags:
 *   - name: Comunidades
 *     description: Gestión de comunidades
 */

/**
 * @openapi
 * /comunidades:
 *   get:
 *     tags: [Comunidades]
 *     summary: Lista comunidades con estadísticas completas
 *     description: |
 *       Retorna todas las comunidades con estadísticas. Si el usuario no es superadmin,
 *       solo retorna las comunidades asignadas.
 *       Basado en: CONSULTAS_SQL_COMUNIDADES.sql secciones 1.1 y 1.2
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de comunidad
 *       - in: query
 *         name: direccion
 *         schema:
 *           type: string
 *         description: Filtrar por dirección
 *       - in: query
 *         name: rut
 *         schema:
 *           type: string
 *         description: Filtrar por RUT
 *     responses:
 *       200:
 *         description: Lista de comunidades con estadísticas
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { nombre, direccion, rut } = req.query;
    const userId = req.user.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 1.1
    let query = `
      SELECT 
          c.id,
          c.razon_social AS nombre,
          c.direccion,
          c.telefono_contacto AS telefono,
          c.email_contacto AS email,
          c.created_at AS fechaCreacion,
          c.updated_at AS fechaActualizacion,
          -- Estadísticas
          COALESCE(unidades.total, 0) AS totalUnidades,
          COALESCE(unidades.ocupadas, 0) AS unidadesOcupadas,
          COALESCE(residentes.total, 0) AS totalResidentes,
          COALESCE(finanzas.saldo_pendiente, 0) AS saldoPendiente,
          COALESCE(finanzas.morosidad, 0) AS morosidad
      FROM comunidad c
      LEFT JOIN (
          SELECT 
              comunidad_id,
              COUNT(*) AS total,
              SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS ocupadas
          FROM unidad
          GROUP BY comunidad_id
      ) AS unidades ON c.id = unidades.comunidad_id
      LEFT JOIN (
          SELECT 
              tu.comunidad_id,
              COUNT(DISTINCT tu.persona_id) AS total
          FROM titulares_unidad tu
          WHERE tu.hasta IS NULL OR tu.hasta > CURDATE()
          GROUP BY tu.comunidad_id
      ) AS residentes ON c.id = residentes.comunidad_id
      LEFT JOIN (
          SELECT 
              ccu.comunidad_id,
              SUM(ccu.saldo) AS saldo_pendiente,
              CASE 
                  WHEN COUNT(ccu.id) > 0 
                  THEN (SUM(CASE WHEN ccu.estado = 'vencido' THEN 1 ELSE 0 END) * 100.0 / COUNT(ccu.id))
                  ELSE 0 
              END AS morosidad
          FROM cuenta_cobro_unidad ccu
          GROUP BY ccu.comunidad_id
      ) AS finanzas ON c.id = finanzas.comunidad_id
      WHERE 1=1`;
    
    const params = [];
    
    // Filtro por usuario (sección 1.2 del SQL) - Si no es superadmin
    if (!req.user.is_superadmin) {
      query += ` AND c.id IN (
        SELECT urc.comunidad_id 
        FROM usuario_rol_comunidad urc
        WHERE urc.usuario_id = ?
        AND urc.activo = 1
        AND (urc.hasta IS NULL OR urc.hasta > CURDATE())
      )`;
      params.push(userId);
    }
    
    // Filtros adicionales (sección 13.1 y 13.2 del SQL)
    if (nombre) {
      query += ` AND c.razon_social LIKE ?`;
      params.push(`%${nombre}%`);
    }
    
    if (direccion) {
      query += ` AND c.direccion LIKE ?`;
      params.push(`%${direccion}%`);
    }
    
    if (rut) {
      query += ` AND c.rut = ?`;
      params.push(rut);
    }
    
    query += ` ORDER BY c.razon_social`;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching communities:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener detalle completo de una comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 2.1
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
 *         description: Información completa de la comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 2.1
    const query = `
      SELECT 
          c.id,
          c.razon_social AS nombre,
          c.rut,
          c.dv,
          c.giro AS descripcion,
          c.direccion,
          c.email_contacto AS email,
          c.telefono_contacto AS telefono,
          c.created_at AS fechaCreacion,
          c.updated_at AS fechaActualizacion,
          c.moneda,
          c.tz AS zonaHoraria,
          -- Estadísticas
          COALESCE(unidades.total, 0) AS totalUnidades,
          COALESCE(unidades.ocupadas, 0) AS unidadesOcupadas,
          COALESCE(residentes.total, 0) AS totalResidentes,
          COALESCE(finanzas.saldo_pendiente, 0) AS saldoPendiente,
          COALESCE(finanzas.morosidad, 0) AS morosidad
      FROM comunidad c
      LEFT JOIN (
          SELECT comunidad_id, COUNT(*) AS total, 
                 SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS ocupadas
          FROM unidad GROUP BY comunidad_id
      ) AS unidades ON c.id = unidades.comunidad_id
      LEFT JOIN (
          SELECT tu.comunidad_id, COUNT(DISTINCT tu.persona_id) AS total
          FROM titulares_unidad tu
          WHERE tu.hasta IS NULL OR tu.hasta > CURDATE()
          GROUP BY tu.comunidad_id
      ) AS residentes ON c.id = residentes.comunidad_id
      LEFT JOIN (
          SELECT ccu.comunidad_id, SUM(ccu.saldo) AS saldo_pendiente,
                 CASE WHEN COUNT(ccu.id) > 0 
                      THEN (SUM(CASE WHEN ccu.estado = 'vencido' THEN 1 ELSE 0 END) * 100.0 / COUNT(ccu.id))
                      ELSE 0 END AS morosidad
          FROM cuenta_cobro_unidad ccu
          GROUP BY ccu.comunidad_id
      ) AS finanzas ON c.id = finanzas.comunidad_id
      WHERE c.id = ?`;
    
    const [rows] = await db.query(query, [id]);
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching community:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/amenidades:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener amenidades de una comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 3.1
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
 *         description: Lista de amenidades
 */
router.get('/:id/amenidades', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 3.1
    const query = `
      SELECT 
          a.id,
          a.nombre,
          a.reglas AS descripcion,
          CASE 
              WHEN a.requiere_aprobacion = 1 THEN 'Requiere Aprobación'
              ELSE 'Disponible'
          END AS estado,
          a.requiere_aprobacion AS requiereReserva,
          a.tarifa AS costoReserva,
          a.capacidad,
          a.created_at,
          a.updated_at
      FROM amenidad a
      WHERE a.comunidad_id = ?
      ORDER BY a.nombre`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching amenities:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/edificios:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener edificios de una comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 4.1
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
 *         description: Lista de edificios con conteo de unidades
 */
router.get('/:id/edificios', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 4.1
    const query = `
      SELECT 
          e.id,
          e.nombre,
          e.codigo,
          e.direccion,
          COUNT(u.id) AS totalUnidades,
          e.created_at,
          e.updated_at
      FROM edificio e
      LEFT JOIN unidad u ON e.id = u.edificio_id
      WHERE e.comunidad_id = ?
      GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at
      ORDER BY e.nombre`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/contactos:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener contactos de una comunidad
 *     description: |
 *       Retorna usuarios con acceso a la comunidad (administradores, comité, etc.)
 *       Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 5.1
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
 *         description: Lista de contactos
 */
router.get('/:id/contactos', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 5.1
    const query = `
      SELECT 
          p.id,
          CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
          p.telefono,
          p.email,
          u.username,
          r.nombre AS rol
      FROM persona p
      INNER JOIN usuario u ON p.id = u.persona_id
      INNER JOIN usuario_rol_comunidad urc ON u.id = urc.usuario_id
      LEFT JOIN rol_sistema r ON urc.rol_id = r.id
      WHERE urc.comunidad_id = ?
      AND urc.activo = 1
      AND u.activo = 1
      AND (urc.hasta IS NULL OR urc.hasta > CURDATE())
      ORDER BY p.apellidos, p.nombres`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/documentos:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener documentos de una comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 6.1
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
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 6.1
    const query = `
      SELECT 
          dc.id,
          dc.titulo AS nombre,
          dc.tipo,
          dc.url,
          dc.created_at AS fechaSubida,
          0 AS tamano,
          dc.periodo,
          dc.visibilidad
      FROM documento_comunidad dc
      WHERE dc.comunidad_id = ?
      ORDER BY dc.created_at DESC`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/residentes:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener residentes activos de una comunidad
 *     description: |
 *       Retorna personas con titularidad activa en unidades de la comunidad.
 *       Incluye propietarios y arrendatarios vigentes.
 *       Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 7.1
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
 *         description: Lista de residentes con información de unidad
 */
router.get('/:id/residentes', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 7.1
    const query = `
      SELECT DISTINCT
          p.id,
          p.rut,
          p.dv,
          CONCAT(p.nombres, ' ', p.apellidos) AS nombreCompleto,
          p.nombres,
          p.apellidos,
          p.email,
          p.telefono,
          u.codigo AS unidad,
          tu.tipo AS tipoResidente,
          tu.desde AS fechaIngreso,
          tu.porcentaje,
          p.created_at,
          p.updated_at
      FROM persona p
      INNER JOIN titulares_unidad tu ON p.id = tu.persona_id
      INNER JOIN unidad u ON tu.unidad_id = u.id
      WHERE tu.comunidad_id = ?
      AND (tu.hasta IS NULL OR tu.hasta > CURDATE())
      ORDER BY p.apellidos, p.nombres`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching residents:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Alias para compatibilidad con código legacy
/**
 * @openapi
 * /comunidades/{id}/miembros:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener miembros de una comunidad
 *     description: Lista todos los miembros activos de una comunidad con sus roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Lista de miembros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   comunidad_id:
 *                     type: integer
 *                   usuario_id:
 *                     type: integer
 *                   persona_id:
 *                     type: integer
 *                   rol:
 *                     type: string
 *                   rol_nombre:
 *                     type: string
 *                   nivel_acceso:
 *                     type: integer
 *                   desde:
 *                     type: string
 *                     format: date
 *                   hasta:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *                   activo:
 *                     type: boolean
 *       404:
 *         description: Comunidad no encontrada
 */
router.get('/:id/miembros', authenticate, async (req, res) => {
  try {
    const comunidadId = req.params.id;
    
    const query = `
      SELECT 
        urc.id,
        urc.comunidad_id,
        urc.usuario_id,
        u.persona_id,
        r.codigo AS rol,
        r.nombre AS rol_nombre,
        r.nivel_acceso,
        urc.desde,
        urc.hasta,
        urc.activo
      FROM usuario_rol_comunidad urc
      INNER JOIN usuario u ON urc.usuario_id = u.id
      LEFT JOIN rol_sistema r ON urc.rol_id = r.id
      WHERE urc.comunidad_id = ?
      ORDER BY r.nivel_acceso DESC, u.persona_id
    `;
    
    const [rows] = await db.query(query, [comunidadId]);
    
    // Convertir activo a boolean
    const miembros = rows.map(row => ({
      ...row,
      activo: Boolean(row.activo)
    }));
    
    res.json(miembros);
  } catch (err) {
    console.error('Error fetching miembros:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/parametros:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener parámetros de cobranza de una comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 8.1
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
 *         description: Parámetros de cobranza
 *       404:
 *         description: No se encontraron parámetros
 */
router.get('/:id/parametros', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 8.1
    const query = `
      SELECT 
          pc.id,
          pc.comunidad_id,
          pc.dias_gracia AS diasGracia,
          pc.tasa_mora_mensual AS tasaMora,
          pc.mora_calculo AS calculoInteres,
          pc.interes_max_mensual AS interesMaximo,
          pc.aplica_interes_sobre AS aplicacionInteres,
          pc.redondeo AS tipoRedondeo,
          pc.created_at,
          pc.updated_at
      FROM parametros_cobranza pc
      WHERE pc.comunidad_id = ?
      LIMIT 1`;
    
    const [rows] = await db.query(query, [id]);
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Parámetros no encontrados' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching parameters:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/estadisticas:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener estadísticas financieras de una comunidad
 *     description: |
 *       Retorna resumen de ingresos totales, pagados y pendientes.
 *       Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 9.1
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
 *         description: Estadísticas financieras
 */
router.get('/:id/estadisticas', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 9.1
    const query = `
      SELECT 
          COALESCE(SUM(ccu.monto_total), 0) AS totalIngresos,
          COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) AS ingresosPagados,
          COALESCE(SUM(ccu.saldo), 0) AS ingresosPendientes
      FROM cuenta_cobro_unidad ccu
      WHERE ccu.comunidad_id = ?`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows[0] || {
      totalIngresos: 0,
      ingresosPagados: 0,
      ingresosPendientes: 0
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/flujo-caja:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener flujo de caja de una comunidad (últimos 12 meses)
 *     description: |
 *       Retorna resumen mensual de cuentas de cobro por periodo.
 *       Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 10.1
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
 *         description: Flujo de caja histórico
 */
router.get('/:id/flujo-caja', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 10.1
    const query = `
      SELECT 
          e.periodo,
          e.fecha_vencimiento AS fecha,
          COUNT(ccu.id) AS totalCuentas,
          SUM(ccu.monto_total) AS montoTotal,
          SUM(ccu.saldo) AS saldoPendiente,
          SUM(ccu.monto_total - ccu.saldo) AS montoPagado
      FROM emision_gastos_comunes e
      LEFT JOIN cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
      WHERE e.comunidad_id = ?
      AND e.estado != 'anulado'
      GROUP BY e.periodo, e.fecha_vencimiento
      ORDER BY e.periodo DESC
      LIMIT 12`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cash flow:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades:
 *   post:
 *     tags: [Comunidades]
 *     summary: Crear nueva comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 11.1
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razon_social, rut, dv]
 *             properties:
 *               razon_social:
 *                 type: string
 *                 description: Nombre o razón social de la comunidad
 *               rut:
 *                 type: string
 *                 description: RUT de la comunidad
 *               dv:
 *                 type: string
 *                 description: Dígito verificador
 *               giro:
 *                 type: string
 *                 description: Giro o descripción
 *               direccion:
 *                 type: string
 *               email_contacto:
 *                 type: string
 *               telefono_contacto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comunidad creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', [
  authenticate,
  authorize('admin', 'superadmin'),
  body('razon_social').notEmpty().withMessage('Razón social es requerida'),
  body('rut').notEmpty().withMessage('RUT es requerido'),
  body('dv').notEmpty().withMessage('Dígito verificador es requerido')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      razon_social,
      rut,
      dv,
      giro,
      direccion,
      email_contacto,
      telefono_contacto
    } = req.body;
    
    const userId = req.user.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 11.1
    const query = `
      INSERT INTO comunidad (
          razon_social,
          rut,
          dv,
          giro,
          direccion,
          email_contacto,
          telefono_contacto,
          moneda,
          tz,
          created_by,
          created_at,
          updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CLP', 'America/Santiago', ?, NOW(), NOW())`;
    
    const [result] = await db.query(query, [
      razon_social,
      rut,
      dv,
      giro || null,
      direccion || null,
      email_contacto || null,
      telefono_contacto || null,
      userId
    ]);
    
    // Retornar la comunidad creada
    const [row] = await db.query(
      'SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1',
      [result.insertId]
    );
    
    res.status(201).json(row[0]);
  } catch (err) {
    console.error('Error creating community:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   patch:
 *     tags: [Comunidades]
 *     summary: Actualizar comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 11.2
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
 *             properties:
 *               razon_social:
 *                 type: string
 *               rut:
 *                 type: string
 *               dv:
 *                 type: string
 *               giro:
 *                 type: string
 *               direccion:
 *                 type: string
 *               email_contacto:
 *                 type: string
 *               telefono_contacto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comunidad actualizada
 *       400:
 *         description: Sin campos para actualizar
 */
router.patch('/:id', [
  authenticate,
  authorize('admin', 'superadmin')
], async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    
    const allowedFields = [
      'razon_social',
      'rut',
      'dv',
      'giro',
      'direccion',
      'email_contacto',
      'telefono_contacto'
    ];
    
    const updates = [];
    const values = [];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });
    
    if (!updates.length) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    // Agregar updated_at y updated_by
    updates.push('updated_at = NOW()');
    updates.push('updated_by = ?');
    values.push(userId);
    values.push(id);
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 11.2
    await db.query(
      `UPDATE comunidad SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Retornar la comunidad actualizada
    const [rows] = await db.query(
      'SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1',
      [id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating community:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   delete:
 *     tags: [Comunidades]
 *     summary: Eliminar comunidad
 *     description: |
 *       Elimina físicamente una comunidad de la base de datos.
 *       Solo disponible para superadmin.
 *       Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 12.1
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
 *         description: Comunidad eliminada exitosamente
 *       403:
 *         description: Sin permisos suficientes
 */
router.delete('/:id', [
  authenticate,
  authorize('superadmin')
], async (req, res) => {
  try {
    const id = req.params.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 12.1
    await db.query('DELETE FROM comunidad WHERE id = ?', [id]);
    
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting community:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/verificar-acceso/{id}:
 *   get:
 *     tags: [Comunidades]
 *     summary: Verificar acceso de usuario a comunidad
 *     description: Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 14.3
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
 *         description: Resultado de verificación de acceso
 */
router.get('/verificar-acceso/:id', authenticate, async (req, res) => {
  try {
    const comunidadId = req.params.id;
    const userId = req.user.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 14.3
    const query = `
      SELECT COUNT(*) AS tiene_acceso
      FROM usuario_rol_comunidad urc
      WHERE urc.usuario_id = ?
      AND urc.comunidad_id = ?
      AND urc.activo = 1
      AND (urc.hasta IS NULL OR urc.hasta > CURDATE())`;
    
    const [rows] = await db.query(query, [userId, comunidadId]);
    
    res.json({
      tieneAcceso: rows[0].tiene_acceso > 0,
      esSuperadmin: req.user.is_superadmin || false
    });
  } catch (err) {
    console.error('Error verifying access:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/mis-membresias:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener membresías del usuario actual
 *     description: |
 *       Retorna todas las comunidades a las que el usuario tiene acceso con su rol.
 *       Basado en CONSULTAS_SQL_COMUNIDADES.sql sección 14.2
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de membresías del usuario
 */
router.get('/mis-membresias', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Query basado en CONSULTAS_SQL_COMUNIDADES.sql sección 14.2
    const query = `
      SELECT 
          urc.comunidad_id AS comunidadId,
          c.razon_social AS nombreComunidad,
          urc.rol_id,
          r.nombre AS rol,
          r.codigo AS rolCodigo
      FROM usuario_rol_comunidad urc
      INNER JOIN comunidad c ON urc.comunidad_id = c.id
      LEFT JOIN rol_sistema r ON urc.rol_id = r.id
      WHERE urc.usuario_id = ?
      AND urc.activo = 1
      AND (urc.hasta IS NULL OR urc.hasta > CURDATE())`;
    
    const [rows] = await db.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching memberships:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
