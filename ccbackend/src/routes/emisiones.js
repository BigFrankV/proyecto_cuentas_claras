const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// ============================================
// HELPER: Calcular consumo de medidor
// ============================================
async function calcularConsumoMedidor(unidadId, tipoServicio, periodo) {
  try {
    // 1. Buscar medidor activo de la unidad por tipo de servicio
    const [medidores] = await db.query(
      `SELECT id FROM medidor 
       WHERE unidad_id = ? 
       AND tipo = ? 
       AND activo = 1
       LIMIT 1`,
      [unidadId, tipoServicio]
    );

    if (!medidores || medidores.length === 0) {
      console.log(
        `   ⚠️ No hay medidor de ${tipoServicio} para unidad ${unidadId}`
      );
      return { cantidad: 0, lecturaAnterior: 0, lecturaActual: 0 };
    }

    const medidorId = medidores[0].id;

    // 2. Buscar lecturas del período actual y anterior
    const [lecturas] = await db.query(
      `SELECT 
        lectura as lectura_actual,
        periodo,
        fecha
       FROM lectura_medidor 
       WHERE medidor_id = ? 
       AND periodo <= ?
       ORDER BY periodo DESC, fecha DESC
       LIMIT 2`,
      [medidorId, periodo]
    );

    if (!lecturas || lecturas.length === 0) {
      console.log(
        `   ⚠️ No hay lecturas para medidor ${medidorId} en período ${periodo}`
      );
      return { cantidad: 0, lecturaAnterior: 0, lecturaActual: 0 };
    }

    // 3. Calcular consumo
    const lecturaActual = parseFloat(lecturas[0].lectura_actual || 0);
    const lecturaAnterior =
      lecturas.length > 1 ? parseFloat(lecturas[1].lectura_actual || 0) : 0;
    const consumo = Math.max(0, lecturaActual - lecturaAnterior);

    console.log(
      `   📊 Medidor ${tipoServicio} unidad ${unidadId}: ${lecturaAnterior} → ${lecturaActual} = ${consumo.toFixed(2)}`
    );

    return {
      cantidad: consumo,
      lecturaAnterior: lecturaAnterior.toFixed(2),
      lecturaActual: lecturaActual.toFixed(2),
    };
  } catch (error) {
    console.error(
      `Error calculando consumo medidor unidad ${unidadId}:`,
      error
    );
    return { cantidad: 0, lecturaAnterior: 0, lecturaActual: 0 };
  }
}

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
 *   - name: Emisiones
 *     description: |
 *       Gestión de emisiones de gastos comunes mensuales.
 *
 *       **Cambios importantes**:
 *       - La tabla `emision_gasto_comun` ahora se llama `emision_gastos_comunes`
 *       - Los detalles se guardan en `detalle_emision` (antes `emision_gasto_comun_detalle`)
 *
 *       Una emisión consolida todos los gastos del mes y genera las cuentas de cobro para cada unidad.
 */

/**
 * @swagger
 * /emisiones/comunidad/{comunidadId}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Listar emisiones de una comunidad
 *     description: |
 *       Obtiene el historial de emisiones de gastos comunes de una comunidad.
 *       Incluye información del período, monto total y estado de cada emisión.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
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
 *           default: 50
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-03"
 *                   fecha_emision:
 *                     type: string
 *                     format: date
 *                   monto_total:
 *                     type: number
 *                     description: Suma de todos los gastos del período
 *                   estado:
 *                     type: string
 *                     enum: [borrador, emitida, cerrada]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  const { page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await db.query(
      `SELECT 
        e.id, 
        e.periodo, 
        e.estado, 
        e.fecha_vencimiento,
        e.created_at,
        e.observaciones,
        c.razon_social AS nombre_comunidad,
        COUNT(ccu.unidad_id) AS total_unidades,
        COALESCE(SUM(ccu.monto_total), 0) AS monto_total,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) AS monto_pagado
      FROM emision_gastos_comunes e
      INNER JOIN comunidad c ON e.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
      WHERE e.comunidad_id = ? 
      GROUP BY e.id, e.periodo, e.estado, e.fecha_vencimiento, e.created_at, e.observaciones, c.razon_social
      ORDER BY e.periodo DESC 
      LIMIT ? OFFSET ?`,
      [comunidadId, Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
/**
 * @swagger
 * /emisiones/comunidad/{comunidadId}/count:
 *   get:
 *     tags: [Emisiones]
 *     summary: Contar emisiones de una comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Total de emisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 */
// count total emisiones for comunidad (pagination)
router.get('/comunidad/:comunidadId/count', authenticate, async (req, res) => {
  const comunidadId = req.params.comunidadId;
  try {
    const [[row]] = await db.query(
      'SELECT COUNT(DISTINCT egc.id) as total FROM emision_gastos_comunes egc WHERE egc.comunidad_id = ?',
      [comunidadId]
    );
    res.json({ total: row.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/todas/resumen:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener resumen de TODAS las emisiones (Solo Superadmin)
 *     description: |
 *       Obtiene un resumen detallado de TODAS las emisiones de TODAS las comunidades.
 *       **SOLO SUPERADMIN** puede acceder.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de todas las emisiones
 *       403:
 *         description: Solo superadmin puede acceder
 */
router.get('/todas/resumen', authenticate, async (req, res) => {
  try {
    const isSuper = Boolean(req.user.is_superadmin === true);

    // SOLO superadmin puede ver todas las emisiones
    if (!isSuper) {
      return res.status(403).json({ error: 'forbidden - superadmin only' });
    }

    const [rows] = await db.query(
      `
      SELECT
        e.id AS emision_id,
        e.periodo,
        'Gastos Comunes' AS tipo_emision,
        CASE
          WHEN e.estado = 'borrador' THEN 'borrador'
          WHEN e.estado = 'emitido' THEN 'emitida'
          WHEN e.estado = 'cerrado' THEN 'cerrada'
          WHEN e.estado = 'anulado' THEN 'anulada'
          ELSE 'lista'
        END as estado,
        DATE(e.created_at) AS fecha_emision,
        DATE(e.fecha_vencimiento) AS fecha_vencimiento,
        c.razon_social AS nombre_comunidad,
        e.comunidad_id,
        COUNT(ccu.unidad_id) AS total_unidades_impactadas,
        COALESCE(SUM(ccu.monto_total), 0.00) AS monto_total_liquidado,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0.00) AS monto_pagado_aplicado
      FROM
        emision_gastos_comunes e
      INNER JOIN
        comunidad c ON e.comunidad_id = c.id
      LEFT JOIN
        cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
      GROUP BY
        e.id, e.periodo, e.estado, e.created_at, e.fecha_vencimiento, c.razon_social, e.comunidad_id
      ORDER BY
        e.created_at DESC, e.periodo DESC
    `
    );

    const emisiones = rows.map((row) => ({
      id: row.emision_id.toString(),
      periodo: row.periodo,
      tipo: row.tipo_emision,
      estado: row.estado,
      fecha_emision: row.fecha_emision,
      fecha_vencimiento: row.fecha_vencimiento,
      nombre_comunidad: row.nombre_comunidad,
      comunidad_id: row.comunidad_id,
      total_unidades: row.total_unidades_impactadas,
      monto_total: parseFloat(row.monto_total_liquidado),
      monto_pagado: parseFloat(row.monto_pagado_aplicado),
    }));

    res.json({ emisiones });
  } catch (err) {
    console.error('Error en /todas/resumen:', err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/comunidad/{comunidadId}/resumen:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener resumen de emisiones con métricas consolidadas (Solo Admin)
 *     description: |
 *       Obtiene un resumen detallado de todas las emisiones de una comunidad,
 *       incluyendo métricas consolidadas como total de unidades impactadas,
 *       montos totales y pagos aplicados.
 *       **SOLO ADMIN, TESORERO O PRESIDENTE** pueden acceder.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la comunidad
 *     responses:
 *       200:
 *         description: Resumen de emisiones con métricas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   emision_id:
 *                     type: integer
 *                   periodo:
 *                     type: string
 *                     description: Período en formato YYYY-MM
 *                     example: "2024-03"
 *                   tipo_emision:
 *                     type: string
 *                     example: "Gastos Comunes"
 *                   estado:
 *                     type: string
 *                     enum: [borrador, emitida, cerrada, anulada]
 *                   fecha_emision:
 *                     type: string
 *                     format: date
 *                   fecha_vencimiento:
 *                     type: string
 *                     format: date
 *                   nombre_comunidad:
 *                     type: string
 *                   total_unidades_impactadas:
 *                     type: integer
 *                     description: Número total de unidades con cuentas de cobro
 *                   monto_total_liquidado:
 *                     type: number
 *                     description: Suma total de todos los montos de las cuentas de cobro
 *                   monto_pagado_aplicado:
 *                     type: number
 *                     description: Suma de los pagos aplicados a las cuentas de cobro
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Solo admin, tesorero o presidente pueden acceder
 */

// resumen de emisiones con métricas consolidadas (solo admin)
router.get(
  '/comunidad/:comunidadId/resumen',
  authenticate,
  async (req, res) => {
    try {
      const comunidadId = Number(req.params.comunidadId);
      const usuarioId = req.user.sub;

      // Verificar si es superadmin (de tabla usuario)
      const isSuper = Boolean(req.user.is_superadmin === true);

      // Si NO es superadmin, verificar que sea admin de la comunidad
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

        if (!adminCheck || !adminCheck.length) {
          return res.status(403).json({ error: 'forbidden - admin only' });
        }
      }

      const [rows] = await db.query(
        `
      SELECT
        e.id AS emision_id,
        e.periodo,
        'Gastos Comunes' AS tipo_emision,
        CASE
          WHEN e.estado = 'borrador' THEN 'borrador'
          WHEN e.estado = 'emitido' THEN 'emitida'
          WHEN e.estado = 'cerrado' THEN 'cerrada'
          WHEN e.estado = 'anulado' THEN 'anulada'
          ELSE 'lista'
        END as estado,
        DATE(e.created_at) AS fecha_emision,
        DATE(e.fecha_vencimiento) AS fecha_vencimiento,
        c.razon_social AS nombre_comunidad,
        COUNT(ccu.unidad_id) AS total_unidades_impactadas,
        COALESCE(SUM(ccu.monto_total), 0.00) AS monto_total_liquidado,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0.00) AS monto_pagado_aplicado
      FROM
        emision_gastos_comunes e
      INNER JOIN
        comunidad c ON e.comunidad_id = c.id
      LEFT JOIN
        cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
      WHERE
        e.comunidad_id = ?
      GROUP BY
        e.id, e.periodo, e.estado, e.created_at, e.fecha_vencimiento, c.razon_social
      ORDER BY
        e.periodo DESC
    `,
        [comunidadId]
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /comunidades/{comunidadId}/emisiones:
 *   post:
 *     tags: [Emisiones]
 *     summary: Crear una emisión (gasto común)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodo:
 *                 type: string
 *               fecha_vencimiento:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post(
  '/comunidad/:comunidadId',
  [
    authenticate,
    authorize('admin', 'superadmin', 'admin_comunidad'), // Agregar admin_comunidad
    body('periodo')
      .notEmpty()
      .withMessage('Período es requerido')
      .matches(/^\d{4}-\d{2}$/)
      .withMessage('Período debe tener formato YYYY-MM'),
    body('fecha_vencimiento')
      .notEmpty()
      .withMessage('Fecha de vencimiento es requerida')
      .isISO8601()
      .withMessage('Fecha de vencimiento debe ser una fecha válida'),
    body('monto_total')
      .isFloat({ min: 0 })
      .withMessage('Monto total debe ser mayor o igual a 0'),
    body('estado')
      .optional()
      .isIn(['borrador', 'emitido'])
      .withMessage('Estado debe ser borrador o emitido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const comunidadId = parseInt(req.params.comunidadId, 10);
    const {
      periodo,
      fecha_vencimiento,
      observaciones,
      monto_total,
      conceptos,
      estado = 'emitido', // Por defecto 'emitido', puede ser 'borrador'
      crear_cargos = true, // Permitir crear emisión sin cargos (solo borrador)
    } = req.body;

    try {
      console.log('📝 Creando emisión para comunidad:', comunidadId);
      console.log('   Período:', periodo);
      console.log('   Estado:', estado);
      console.log('   Monto total:', monto_total);
      console.log('   Crear cargos:', crear_cargos);

      // 1. Verificar que no exista ya una emisión para este período
      const [emisionesExistentes] = await db.query(
        `SELECT id FROM emision_gastos_comunes 
         WHERE comunidad_id = ? AND periodo = ? LIMIT 1`,
        [comunidadId, periodo]
      );

      if (emisionesExistentes && emisionesExistentes.length > 0) {
        return res.status(400).json({
          error: `Ya existe una emisión para el período ${periodo} en esta comunidad`,
        });
      }

      // 2. Crear la emisión
      const [emisionResult] = await db.query(
        `INSERT INTO emision_gastos_comunes 
         (comunidad_id, periodo, fecha_vencimiento, observaciones, estado, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [comunidadId, periodo, fecha_vencimiento, observaciones || null, estado]
      );

      const emisionId = emisionResult.insertId;
      console.log('✅ Emisión creada con ID:', emisionId);

      // 3. Si no se deben crear cargos o está en borrador, retornar solo la emisión
      if (!crear_cargos || estado === 'borrador') {
        const [emision] = await db.query(
          `SELECT * FROM emision_gastos_comunes WHERE id = ?`,
          [emisionId]
        );
        return res.status(201).json({
          success: true,
          emision: emision[0],
          message:
            estado === 'borrador'
              ? 'Emisión creada en borrador. Use el endpoint de emitir para generar los cargos.'
              : 'Emisión creada sin cargos',
        });
      }

      // 4. Obtener todas las unidades activas de la comunidad con sus alícuotas
      const [unidades] = await db.query(
        `SELECT id, codigo, alicuota 
         FROM unidad 
         WHERE comunidad_id = ? AND activa = 1
         ORDER BY codigo`,
        [comunidadId]
      );

      if (!unidades || unidades.length === 0) {
        return res.status(400).json({
          error: 'No hay unidades activas en esta comunidad',
        });
      }

      console.log(`📊 Se encontraron ${unidades.length} unidades activas`);

      // 5. Calcular la suma total de alícuotas
      const totalAlicuota = unidades.reduce(
        (sum, u) => sum + parseFloat(u.alicuota || 0),
        0
      );

      if (totalAlicuota === 0) {
        return res.status(400).json({
          error:
            'La suma de alícuotas es 0. Verifica las configuraciones de las unidades.',
        });
      }

      console.log('   Total alícuotas:', totalAlicuota);

      // Obtener servicios medidos y tarifas del request
      const { servicios_medidos = [], tarifas = {} } = req.body;
      console.log('   Servicios medidos:', servicios_medidos);
      console.log('   Tarifas:', tarifas);

      // 6. Crear cargos para cada unidad
      const cargosCreados = [];

      for (const unidad of unidades) {
        // Calcular monto prorrateado según alícuota
        const alicuota = parseFloat(unidad.alicuota || 0);
        const montoGastosComunes = parseFloat(
          ((monto_total * alicuota) / totalAlicuota).toFixed(2)
        );

        // Calcular consumos individuales por medidor
        let consumoAgua = 0;
        let consumoLuz = 0;
        let consumoGas = 0;
        const detallesConsumo = [];

        // Agua
        if (servicios_medidos.includes('agua') && tarifas.agua) {
          const consumo = await calcularConsumoMedidor(
            unidad.id,
            'agua',
            periodo
          );
          if (consumo.cantidad > 0) {
            consumoAgua = parseFloat(
              (consumo.cantidad * tarifas.agua).toFixed(2)
            );
            detallesConsumo.push({
              tipo: 'agua',
              cantidad: consumo.cantidad,
              tarifa: tarifas.agua,
              monto: consumoAgua,
              lecturaAnterior: consumo.lecturaAnterior,
              lecturaActual: consumo.lecturaActual,
            });
          }
        }

        // Luz
        if (
          servicios_medidos.includes('electricidad') &&
          tarifas.electricidad
        ) {
          const consumo = await calcularConsumoMedidor(
            unidad.id,
            'electricidad',
            periodo
          );
          if (consumo.cantidad > 0) {
            consumoLuz = parseFloat(
              (consumo.cantidad * tarifas.electricidad).toFixed(2)
            );
            detallesConsumo.push({
              tipo: 'electricidad',
              cantidad: consumo.cantidad,
              tarifa: tarifas.electricidad,
              monto: consumoLuz,
              lecturaAnterior: consumo.lecturaAnterior,
              lecturaActual: consumo.lecturaActual,
            });
          }
        }

        // Gas
        if (servicios_medidos.includes('gas') && tarifas.gas) {
          const consumo = await calcularConsumoMedidor(
            unidad.id,
            'gas',
            periodo
          );
          if (consumo.cantidad > 0) {
            consumoGas = parseFloat(
              (consumo.cantidad * tarifas.gas).toFixed(2)
            );
            detallesConsumo.push({
              tipo: 'gas',
              cantidad: consumo.cantidad,
              tarifa: tarifas.gas,
              monto: consumoGas,
              lecturaAnterior: consumo.lecturaAnterior,
              lecturaActual: consumo.lecturaActual,
            });
          }
        }

        // Monto total del cargo = gastos comunes + consumos
        const montoTotal = parseFloat(
          (montoGastosComunes + consumoAgua + consumoLuz + consumoGas).toFixed(
            2
          )
        );

        // Crear el cargo
        const [cargoResult] = await db.query(
          `INSERT INTO cuenta_cobro_unidad 
           (emision_id, comunidad_id, unidad_id, monto_total, saldo, estado, interes_acumulado, created_at)
           VALUES (?, ?, ?, ?, ?, 'pendiente', 0, NOW())`,
          [emisionId, comunidadId, unidad.id, montoTotal, montoTotal]
        );

        const cargoId = cargoResult.insertId;

        // Crear detalles de gastos comunes prorrateados
        if (conceptos && Array.isArray(conceptos) && conceptos.length > 0) {
          for (const concepto of conceptos) {
            const montoConcepto = parseFloat(
              ((concepto.monto * alicuota) / totalAlicuota).toFixed(2)
            );
            await db.query(
              `INSERT INTO detalle_cuenta_unidad 
               (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, iva_incluido)
               VALUES (?, ?, ?, ?, 'gasto', 1)`,
              [
                cargoId,
                concepto.categoria_id || 1,
                concepto.glosa || concepto.nombre,
                montoConcepto,
              ]
            );
          }
        } else if (montoGastosComunes > 0) {
          // Si no hay conceptos, crear un detalle genérico de gastos comunes
          await db.query(
            `INSERT INTO detalle_cuenta_unidad 
             (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, iva_incluido)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              cargoId,
              1,
              `${periodo} - Gastos Comunes`,
              montoGastosComunes,
              'gasto',
              1,
            ]
          );
        }

        // Crear detalles de consumos individuales
        for (const detalle of detallesConsumo) {
          const glosa = `${detalle.tipo.toUpperCase()} - ${detalle.cantidad.toFixed(2)} ${detalle.tipo === 'electricidad' ? 'kWh' : 'm³'} × $${detalle.tarifa} (${detalle.lecturaAnterior} → ${detalle.lecturaActual})`;

          await db.query(
            `INSERT INTO detalle_cuenta_unidad 
             (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, iva_incluido)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [cargoId, 1, glosa, detalle.monto, 'consumo', 1]
          );
        }

        cargosCreados.push({
          cargoId,
          unidadCodigo: unidad.codigo,
          monto: montoTotal,
          alicuota,
          gastosComunes: montoGastosComunes,
          consumos: {
            agua: consumoAgua,
            electricidad: consumoLuz,
            gas: consumoGas,
          },
        });
      }

      console.log(`✅ Se crearon ${cargosCreados.length} cargos`);

      // 7. Obtener la emisión completa con totales
      const [emisionCompleta] = await db.query(
        `SELECT 
          e.id, 
          e.periodo, 
          e.estado, 
          e.fecha_vencimiento,
          e.created_at,
          e.observaciones,
          COUNT(ccu.id) AS total_unidades,
          COALESCE(SUM(ccu.monto_total), 0) AS monto_total_calculado,
          COALESCE(SUM(ccu.saldo), 0) AS saldo_total
        FROM emision_gastos_comunes e
        LEFT JOIN cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
        WHERE e.id = ?
        GROUP BY e.id`,
        [emisionId]
      );

      res.status(201).json({
        success: true,
        emision: emisionCompleta[0],
        cargosCreados: cargosCreados.length,
        detalles: cargosCreados,
      });
    } catch (err) {
      console.error('❌ Error creando emisión:', err);
      res.status(500).json({
        error: 'Error al crear la emisión',
        details:
          process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

/**
 * @swagger
 * /emisiones/{id}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener emisión por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Emisión
 *       404:
 *         description: No encontrado
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  // Verificar que el usuario tenga acceso a esta emisión
  const [rows] = await db.query(
    `SELECT egc.*, c.razon_social as comunidad_nombre 
     FROM emision_gastos_comunes egc
     JOIN comunidad c ON egc.comunidad_id = c.id
     JOIN usuario_rol_comunidad mc ON c.id = mc.comunidad_id
     WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
     LIMIT 1`,
    [id, userId]
  );

  if (!rows.length) {
    return res
      .status(403)
      .json({ error: 'No tienes permiso para ver esta emisión' });
  }

  res.json(rows[0]);
});

// enhanced get by id (include totals, interest params)
/**
 * @swagger
 * /emisiones/{id}/detalle-completo:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener emisión con totales y parámetros de cobranza
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Emisión detallada
 *       404:
 *         description: No encontrado
 */
router.get('/:id/detalle-completo', authenticate, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    // Primero verificar acceso del usuario
    const [accessCheck] = await db.query(
      `SELECT 1 FROM usuario_rol_comunidad mc
       JOIN emision_gastos_comunes egc ON mc.comunidad_id = egc.comunidad_id
       WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
       LIMIT 1`,
      [id, userId]
    );

    if (!accessCheck.length) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para ver esta emisión' });
    }

    // Obtener los datos de la emisión
    const [rows] = await db.query(
      `
      SELECT
        egc.id,
        egc.comunidad_id,
        egc.periodo,
        CASE
          WHEN egc.periodo LIKE '%Extraordinaria%' THEN 'extraordinaria'
          WHEN egc.periodo LIKE '%Multa%' THEN 'multa'
          WHEN egc.periodo LIKE '%Interes%' THEN 'interes'
          ELSE 'gastos_comunes'
        END as tipo,
        CASE
          WHEN egc.estado = 'borrador' THEN 'borrador'
          WHEN egc.estado = 'emitido' THEN 'emitida'
          WHEN egc.estado = 'cerrado' THEN 'cerrada'
          WHEN egc.estado = 'anulado' THEN 'anulada'
          ELSE 'lista'
        END as estado,
        DATE_FORMAT(egc.created_at, '%Y-%m-%d') as fecha_emision,
        DATE_FORMAT(egc.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
        egc.observaciones as observaciones,
        c.razon_social as nombre_comunidad,
        CASE WHEN egc.periodo LIKE '%Interes%' THEN 1 ELSE 0 END as tiene_interes,
        COALESCE(pc.tasa_mora_mensual, 2.0) as tasa_interes,
        COALESCE(pc.dias_gracia, 5) as dias_gracia,
        (SELECT r.codigo FROM usuario_rol_comunidad mc2 
         JOIN rol_sistema r ON mc2.rol_id = r.id
         WHERE mc2.comunidad_id = egc.comunidad_id AND mc2.usuario_id = ? AND mc2.activo = 1
         ORDER BY mc2.id DESC LIMIT 1) as rol_usuario,
        egc.created_at,
        egc.updated_at
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN parametros_cobranza pc ON c.id = pc.comunidad_id
      WHERE egc.id = ?
      LIMIT 1
    `,
      [userId, id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Emisión no encontrada' });
    }

    // Obtener totales de las cuentas de cobro
    const [totals] = await db.query(
      `SELECT 
        COALESCE(SUM(ccu.monto_total), 0) as monto_total,
        COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) as monto_pagado,
        COUNT(DISTINCT ccu.unidad_id) as cantidad_unidades
       FROM cuenta_cobro_unidad ccu
       WHERE ccu.emision_id = ?`,
      [id]
    );

    const result = {
      ...rows[0],
      monto_total: totals[0].monto_total,
      monto_pagado: totals[0].monto_pagado,
      cantidad_unidades: totals[0].cantidad_unidades,
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const id = req.params.id;
    if (!req.body.estado)
      return res.status(400).json({ error: 'estado required' });
    try {
      await db.query(
        'UPDATE emision_gastos_comunes SET estado = ? WHERE id = ?',
        [req.body.estado, id]
      );
      const [rows] = await db.query(
        'SELECT id, periodo, estado FROM emision_gastos_comunes WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// add detalle
router.post(
  '/:id/detalles',
  [
    authenticate,
    authorize('admin', 'superadmin'),
    body('categoria_id').isInt(),
    body('monto').isNumeric(),
    body('regla_prorrateo').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const emisionId = req.params.id;
    const { gasto_id, categoria_id, monto, regla_prorrateo, metadata_json } =
      req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO detalle_emision_gastos (emision_id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json) VALUES (?,?,?,?,?,?)',
        [
          emisionId,
          gasto_id || null,
          categoria_id,
          monto,
          regla_prorrateo,
          metadata_json || null,
        ]
      );
      const [row] = await db.query(
        'SELECT id, categoria_id, monto, regla_prorrateo FROM detalle_emision_gastos WHERE id = ? LIMIT 1',
        [result.insertId]
      );
      res.status(201).json(row[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /emisiones/{id}/detalles:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener conceptos/prorrateo de una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de detalles
 */

// obtener conceptos/prorrateo de una emision
router.get('/:id/detalles', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar acceso
    const [accessCheck] = await db.query(
      `SELECT egc.id 
       FROM emision_gastos_comunes egc
       JOIN usuario_rol_comunidad mc ON egc.comunidad_id = mc.comunidad_id
       WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
       LIMIT 1`,
      [emisionId, userId]
    );

    if (!accessCheck.length) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para ver esta emisión' });
    }

    const [rows] = await db.query(
      `
      SELECT
        deg.id,
        cg.nombre as nombre,
        cg.nombre as descripcion,
        deg.monto as monto,
        CASE
          WHEN deg.regla_prorrateo = 'coeficiente' THEN 'proporcional'
          WHEN deg.regla_prorrateo = 'partes_iguales' THEN 'igual'
          WHEN deg.regla_prorrateo = 'consumo' THEN 'personalizado'
          WHEN deg.regla_prorrateo = 'fijo_por_unidad' THEN 'personalizado'
          ELSE 'proporcional'
        END as tipo_prorrateo,
        cg.nombre as categoria,
        deg.created_at
      FROM detalle_emision_gastos deg
      JOIN categoria_gasto cg ON deg.categoria_id = cg.id
      WHERE deg.emision_id = ?
      ORDER BY deg.created_at
    `,
      [emisionId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/gastos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener gastos incluidos en una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de gastos
 */
// obtener gastos incluidos en una emision
router.get('/:id/gastos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar acceso
    const [accessCheck] = await db.query(
      `SELECT egc.id 
       FROM emision_gastos_comunes egc
       JOIN usuario_rol_comunidad mc ON egc.comunidad_id = mc.comunidad_id
       WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
       LIMIT 1`,
      [emisionId, userId]
    );

    if (!accessCheck.length) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para ver esta emisión' });
    }

    const [rows] = await db.query(
      `
      SELECT
        g.id,
        g.glosa as descripcion,
        deg.monto as monto,
        cg.nombre as categoria,
        p.razon_social as proveedor,
        DATE_FORMAT(g.fecha, '%Y-%m-%d') as fecha,
        COALESCE(dc.folio, CONCAT('Gasto #', g.id)) as documento,
        g.created_at
      FROM detalle_emision_gastos deg
      LEFT JOIN gasto g ON deg.gasto_id = g.id
      JOIN categoria_gasto cg ON deg.categoria_id = cg.id
      LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
      LEFT JOIN proveedor p ON dc.proveedor_id = p.id
      WHERE deg.emision_id = ? AND deg.gasto_id IS NOT NULL
      ORDER BY g.fecha DESC
    `,
      [emisionId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/unidades:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener unidades y su prorrateo para una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de unidades con montos
 */
// obtener unidades y prorrateo de una emision
router.get('/:id/unidades', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar acceso a la emisión
    const [accessCheck] = await db.query(
      `SELECT egc.id 
       FROM emision_gastos_comunes egc
       JOIN usuario_rol_comunidad mc ON egc.comunidad_id = mc.comunidad_id
       WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
       LIMIT 1`,
      [emisionId, userId]
    );

    if (!accessCheck.length) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para ver esta emisión' });
    }

    const [rows] = await db.query(
      `
      SELECT
        ccu.id,
        u.codigo as numero,
        CASE
          WHEN u.m2_utiles > 0 THEN 'Departamento'
          WHEN u.nro_estacionamiento IS NOT NULL THEN 'Estacionamiento'
          WHEN u.nro_bodega IS NOT NULL THEN 'Bodega'
          ELSE 'Unidad'
        END as tipo,
        COALESCE(
          GROUP_CONCAT(DISTINCT CONCAT(p.nombres, ' ', p.apellidos) SEPARATOR ', '),
          'Sin asignar'
        ) as propietario,
        COALESCE(
          GROUP_CONCAT(DISTINCT p.email SEPARATOR ', '),
          ''
        ) as contacto,
        u.alicuota as alicuota,
        ccu.monto_total as monto_total,
        (ccu.monto_total - ccu.saldo) as monto_pagado,
        CASE
          WHEN ccu.estado = 'pagado' THEN 'pagado'
          WHEN ccu.estado = 'parcial' THEN 'parcial'
          WHEN ccu.estado = 'vencido' THEN 'vencido'
          ELSE 'pendiente'
        END as estado,
        ccu.created_at
      FROM cuenta_cobro_unidad ccu
      JOIN unidad u ON ccu.unidad_id = u.id
      LEFT JOIN titulares_unidad tu ON u.id = tu.unidad_id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
      LEFT JOIN persona p ON tu.persona_id = p.id
      WHERE ccu.emision_id = ?
      GROUP BY ccu.id, u.id, u.codigo, u.m2_utiles, u.nro_estacionamiento, u.nro_bodega, u.alicuota, ccu.monto_total, ccu.saldo, ccu.estado, ccu.created_at
      ORDER BY u.codigo
    `,
      [emisionId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/pagos:
 *   get:
 *     tags: [Emisiones]
 *     summary: Obtener pagos aplicados para una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
// obtener pagos realizados para una emision
router.get('/:id/pagos', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar acceso
    const [accessCheck] = await db.query(
      `SELECT egc.id 
       FROM emision_gastos_comunes egc
       JOIN usuario_rol_comunidad mc ON egc.comunidad_id = mc.comunidad_id
       WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
       LIMIT 1`,
      [emisionId, userId]
    );

    if (!accessCheck.length) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para ver esta emisión' });
    }

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        DATE_FORMAT(p.fecha, '%Y-%m-%d') as fecha,
        pa.monto as monto,
        CASE
          WHEN p.medio = 'transferencia' THEN 'Transferencia'
          WHEN p.medio = 'webpay' THEN 'WebPay'
          WHEN p.medio = 'khipu' THEN 'Khipu'
          WHEN p.medio = 'servipag' THEN 'Servipag'
          WHEN p.medio = 'efectivo' THEN 'Efectivo'
          ELSE p.medio
        END as medio,
        p.referencia as referencia,
        u.codigo as unidad,
        CASE
          WHEN p.estado = 'aplicado' THEN 'aplicado'
          WHEN p.estado = 'pendiente' THEN 'pendiente'
          WHEN p.estado = 'reversado' THEN 'reversado'
          ELSE 'pendiente'
        END as estado,
        p.created_at
      FROM pago_aplicacion pa
      JOIN pago p ON pa.pago_id = p.id
      JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
      JOIN unidad u ON ccu.unidad_id = u.id
      WHERE ccu.emision_id = ?
      ORDER BY p.fecha DESC, p.created_at DESC
    `,
      [emisionId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}/auditoria:
 *   get:
 *     tags: [Emisiones]
 *     summary: Historial (auditoría) de una emisión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Lista de auditoría
 */
// historial de cambios (auditoria)
router.get('/:id/auditoria', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  const userId = req.user.id;

  try {
    // Verificar acceso
    const [accessCheck] = await db.query(
      `SELECT egc.id 
       FROM emision_gastos_comunes egc
       JOIN usuario_rol_comunidad mc ON egc.comunidad_id = mc.comunidad_id
       WHERE egc.id = ? AND mc.usuario_id = ? AND mc.activo = 1
       LIMIT 1`,
      [emisionId, userId]
    );

    if (!accessCheck.length) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para ver esta emisión' });
    }

    const [rows] = await db.query(
      `
      SELECT
        a.id,
        DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as date,
        CASE
          WHEN a.accion = 'INSERT' THEN 'Emisión creada'
          WHEN a.accion = 'UPDATE' THEN 'Emisión actualizada'
          WHEN a.accion = 'DELETE' THEN 'Emisión eliminada'
          ELSE CONCAT('Acción: ', a.accion)
        END as action,
        COALESCE(u.username, 'Sistema') as user,
        CASE
          WHEN a.accion = 'INSERT' THEN 'Se creó la emisión'
          WHEN a.accion = 'UPDATE' THEN 'Se modificaron datos de la emisión'
          WHEN a.accion = 'DELETE' THEN 'Se eliminó la emisión'
          ELSE 'Cambio en emisión'
        END as description,
        a.created_at
      FROM auditoria a
      LEFT JOIN usuario u ON a.usuario_id = u.id
      WHERE a.tabla = 'emision_gastos_comunes' AND a.registro_id = ?
      ORDER BY a.created_at DESC
    `,
      [emisionId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/{id}:
 *   delete:
 *     tags: [Emisiones]
 *     summary: Eliminar emisión y dependencias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Eliminado con éxito
 */
// eliminar emision y dependencias (admin)
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const emisionId = req.params.id;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // delete pago_aplicacion
      await conn.query(
        'DELETE pa FROM pago_aplicacion pa JOIN cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id WHERE ccu.emision_id = ?',
        [emisionId]
      );
      // delete cuenta_cobro_unidad
      await conn.query('DELETE FROM cuenta_cobro_unidad WHERE emision_id = ?', [
        emisionId,
      ]);
      // delete detalle_emision_gastos
      await conn.query(
        'DELETE FROM detalle_emision_gastos WHERE emision_id = ?',
        [emisionId]
      );
      // delete emision
      await conn.query('DELETE FROM emision_gastos_comunes WHERE id = ?', [
        emisionId,
      ]);
      await conn.commit();
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      try {
        await conn.rollback();
      } catch (e) {
        console.error(e);
      }
      res.status(500).json({ error: 'server error' });
    } finally {
      try {
        conn.release();
      } catch (e) {
        console.error(e);
      }
    }
  }
);

/**
 * @swagger
 * /emisiones/estadisticas/general:
 *   get:
 *     tags: [Emisiones]
 *     summary: Estadísticas generales de emisiones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas
 */
// estadisticas: generales
router.get('/estadisticas/general', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total_emisiones,
        SUM(CASE WHEN estado = 'emitido' THEN 1 ELSE 0 END) as emitidas,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerradas,
        SUM(CASE WHEN estado = 'anulado' THEN 1 ELSE 0 END) as anuladas
      FROM emision_gastos_comunes
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/estadisticas/por-mes:
 *   get:
 *     tags: [Emisiones]
 *     summary: Emisiones por mes y estado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista por mes
 */
// estadisticas: por mes y estado
router.get('/estadisticas/por-mes', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as mes,
        estado,
        COUNT(*) as cantidad
      FROM emision_gastos_comunes
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), estado
      ORDER BY mes DESC, estado
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/estadisticas/cobranza:
 *   get:
 *     tags: [Emisiones]
 *     summary: Cobranza por emisión
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cobranza por emisión
 */
// estadisticas: cobranza por emision
router.get('/estadisticas/cobranza', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        egc.id,
        egc.periodo,
        c.razon_social as comunidad,
        SUM(ccu.monto_total) as total_emitido,
        SUM(ccu.monto_total - ccu.saldo) as total_cobrado,
        ROUND((SUM(ccu.monto_total - ccu.saldo) / SUM(ccu.monto_total)) * 100, 2) as porcentaje_cobranza,
        COUNT(CASE WHEN ccu.estado = 'pagado' THEN 1 END) as unidades_pagadas,
        COUNT(ccu.unidad_id) as total_unidades
      FROM emision_gastos_comunes egc
      JOIN comunidad c ON egc.comunidad_id = c.id
      LEFT JOIN cuenta_cobro_unidad ccu ON egc.id = ccu.emision_id
      WHERE egc.estado IN ('emitido', 'cerrado')
      GROUP BY egc.id, egc.periodo, c.razon_social
      ORDER BY egc.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/existencia:
 *   get:
 *     tags: [Emisiones]
 *     summary: Verificar existencia de emisión para periodo y comunidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Indica si existe o no
 */
// validaciones
router.get('/validar/existencia', authenticate, async (req, res) => {
  const { comunidad_id, periodo } = req.query;
  if (!comunidad_id || !periodo)
    return res.status(400).json({ error: 'comunidad_id and periodo required' });
  try {
    const [[row]] = await db.query(
      'SELECT COUNT(*) as existe_emision FROM emision_gastos_comunes WHERE comunidad_id = ? AND periodo = ?',
      [comunidad_id, periodo]
    );
    res.json({ existe_emision: row.existe_emision });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/gastos/{id}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Validar gastos de una emisión
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/gastos/:id', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(
      `
      SELECT
        deg.emision_id,
        COUNT(*) as total_gastos_incluidos,
        SUM(CASE WHEN g.id IS NULL THEN 1 ELSE 0 END) as gastos_inexistentes
      FROM detalle_emision_gastos deg
      LEFT JOIN gasto g ON deg.gasto_id = g.id
      WHERE deg.emision_id = ?
      GROUP BY deg.emision_id
    `,
      [emisionId]
    );
    res.json(
      rows.length
        ? rows[0]
        : { total_gastos_incluidos: 0, gastos_inexistentes: 0 }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/cuentas/{id}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Validar integridad de cuentas de cobro
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/validar/cuentas/:id', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    const [rows] = await db.query(
      `
      SELECT
        'cuentas_cobro' as tipo_verificacion,
        COUNT(*) as total_registros,
        SUM(CASE WHEN ccu.monto_total <= 0 THEN 1 ELSE 0 END) as montos_invalidos,
        SUM(CASE WHEN ccu.saldo > ccu.monto_total THEN 1 ELSE 0 END) as saldos_invalidos
      FROM cuenta_cobro_unidad ccu
      WHERE ccu.emision_id = ?
    `,
      [emisionId]
    );
    res.json(
      rows[0] || {
        total_registros: 0,
        montos_invalidos: 0,
        saldos_invalidos: 0,
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @swagger
 * /emisiones/validar/cobertura/{comunidadId}/{emisionId}:
 *   get:
 *     tags: [Emisiones]
 *     summary: Validar cobertura de unidades con cuentas de cobro
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: path
 *         name: emisionId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get(
  '/validar/cobertura/:comunidadId/:emisionId',
  authenticate,
  async (req, res) => {
    const { comunidadId, emisionId } = req.params;
    try {
      const [rows] = await db.query(
        `
      SELECT
        'cobertura_unidades' as tipo_verificacion,
        COUNT(DISTINCT u.id) as unidades_activas,
        COUNT(DISTINCT ccu.unidad_id) as unidades_con_cobro,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT ccu.unidad_id) as unidades_faltantes
      FROM unidad u
      LEFT JOIN cuenta_cobro_unidad ccu ON u.id = ccu.unidad_id AND ccu.emision_id = ?
      WHERE u.activa = 1 AND u.comunidad_id = ?
    `,
        [emisionId, comunidadId]
      );
      res.json(
        rows[0] || {
          unidades_activas: 0,
          unidades_con_cobro: 0,
          unidades_faltantes: 0,
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

// preview prorrateo - stub: return example distribution
router.get('/:id/previsualizar-prorrateo', authenticate, async (req, res) => {
  const emisionId = req.params.id;
  try {
    // load emision and detalles
    const [emRows] = await db.query(
      'SELECT comunidad_id, periodo FROM emision_gastos_comunes WHERE id = ? LIMIT 1',
      [emisionId]
    );
    if (!emRows.length)
      return res.status(404).json({ error: 'emision not found' });
    const comunidadId = emRows[0].comunidad_id;
    const [detalles] = await db.query(
      'SELECT id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json FROM detalle_emision_gastos WHERE emision_id = ?',
      [emisionId]
    );

    // load unidades for comunidad
    const [unidades] = await db.query(
      'SELECT id, codigo, alicuota FROM unidad WHERE comunidad_id = ? AND activa = 1',
      [comunidadId]
    );
    if (!unidades.length)
      return res.status(200).json({ preview: [], note: 'no active unidades' });

    const totalAlicuota =
      unidades.reduce((s, u) => s + Number(u.alicuota || 0), 0) || 0;
    const nUnits = unidades.length;

    // prepare preview structure: map unidadId => { detalleId -> monto }
    const preview = unidades.map((u) => ({
      unidad_id: u.id,
      codigo: u.codigo,
      distribucion: [],
      total: 0,
    }));

    for (const d of detalles) {
      const rule = d.regla_prorrateo || 'partes_iguales';
      if (rule === 'consumo') {
        // consumption requires medidor readings — mark as requires data
        // For now we cannot compute consumption-based prorrateo without readings.
        return res.json({
          preview: [],
          note: 'consumo-based prorrateo requires medidor data; not implemented in preview',
        });
      }

      if (rule === 'coeficiente') {
        // distribute by alicuota proportionally
        for (const p of preview) {
          const unidad = unidades.find((u) => u.id === p.unidad_id);
          const share =
            totalAlicuota > 0
              ? (Number(unidad.alicuota || 0) / totalAlicuota) * Number(d.monto)
              : 0;
          const val = Number(share.toFixed(2));
          p.distribucion.push({ detalle_id: d.id, monto: val });
          p.total = Number((p.total + val).toFixed(2));
        }
      } else if (rule === 'fijo_por_unidad' || rule === 'partes_iguales') {
        // equal split among units
        const per = Number((Number(d.monto) / nUnits).toFixed(2));
        // adjust rounding remainder to first unit
        let remainder = Number(d.monto) - per * nUnits;
        for (let i = 0; i < preview.length; i++) {
          let val = per;
          if (remainder !== 0 && i === 0) {
            val = Number((val + remainder).toFixed(2));
          }
          preview[i].distribucion.push({ detalle_id: d.id, monto: val });
          preview[i].total = Number((preview[i].total + val).toFixed(2));
        }
      } else {
        // unknown rule: skip
        continue;
      }
    }

    res.json({ preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// generar cargos - stub
router.post(
  '/:id/generar-cargos',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const emisionId = req.params.id;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [emRows] = await conn.query(
        'SELECT comunidad_id FROM emision_gastos_comunes WHERE id = ? LIMIT 1',
        [emisionId]
      );
      if (!emRows.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'emision not found' });
      }
      const comunidadId = emRows[0].comunidad_id;

      const [detalles] = await conn.query(
        'SELECT id, gasto_id, categoria_id, monto, regla_prorrateo, metadata_json FROM detalle_emision_gastos WHERE emision_id = ?',
        [emisionId]
      );
      const [unidades] = await conn.query(
        'SELECT id, codigo, alicuota FROM unidad WHERE comunidad_id = ? AND activa = 1',
        [comunidadId]
      );
      if (!unidades.length) {
        await conn.rollback();
        return res.status(400).json({ error: 'no active unidades' });
      }

      // compute preview using same logic as preview endpoint
      const totalAlicuota =
        unidades.reduce((s, u) => s + Number(u.alicuota || 0), 0) || 0;
      const nUnits = unidades.length;
      const distrib = unidades.map((u) => ({
        unidad_id: u.id,
        detalles: [],
        total: 0,
      }));

      for (const d of detalles) {
        const rule = d.regla_prorrateo || 'partes_iguales';
        if (rule === 'consumo') {
          await conn.rollback();
          return res.status(400).json({
            error:
              'consumo-based prorrateo requires medidor data; not supported in generate',
          });
        }
        if (rule === 'coeficiente') {
          for (const p of distrib) {
            const unidad = unidades.find((u) => u.id === p.unidad_id);
            const share =
              totalAlicuota > 0
                ? (Number(unidad.alicuota || 0) / totalAlicuota) *
                  Number(d.monto)
                : 0;
            const val = Number(share.toFixed(2));
            p.detalles.push({
              detalle_id: d.id,
              monto: val,
              categoria_id: d.categoria_id,
              gasto_id: d.gasto_id,
            });
            p.total = Number((p.total + val).toFixed(2));
          }
        } else if (rule === 'fijo_por_unidad' || rule === 'partes_iguales') {
          const per = Number((Number(d.monto) / nUnits).toFixed(2));
          let remainder = Number(d.monto) - per * nUnits;
          for (let i = 0; i < distrib.length; i++) {
            let val = per;
            if (remainder !== 0 && i === 0) {
              val = Number((val + remainder).toFixed(2));
            }
            distrib[i].detalles.push({
              detalle_id: d.id,
              monto: val,
              categoria_id: d.categoria_id,
              gasto_id: d.gasto_id,
            });
            distrib[i].total = Number((distrib[i].total + val).toFixed(2));
          }
        }
      }

      // create cuenta_cobro_unidad rows and detalle_cuenta_unidad
      const created = [];
      for (const d of distrib) {
        const [r] = await conn.query(
          'INSERT INTO cuenta_cobro_unidad (emision_id, comunidad_id, unidad_id, monto_total, saldo) VALUES (?,?,?,?,?)',
          [emisionId, comunidadId, d.unidad_id, d.total, d.total]
        );
        const cuentaId = r.insertId;
        for (const det of d.detalles) {
          await conn.query(
            'INSERT INTO detalle_cuenta_unidad (cuenta_cobro_unidad_id, categoria_id, glosa, monto, origen, origen_id, iva_incluido) VALUES (?,?,?,?,?,?,?)',
            [
              cuentaId,
              det.categoria_id,
              `detalle ${det.detalle_id}`,
              det.monto,
              'gasto',
              det.gasto_id || null,
              1,
            ]
          );
        }
        created.push({
          unidad_id: d.unidad_id,
          cuenta_cobro_unidad_id: cuentaId,
          monto_total: d.total,
        });
      }

      await conn.commit();
      res.status(201).json({ ok: true, created });
    } catch (err) {
      console.error(err);
      try {
        await conn.rollback();
      } catch (e) {
        console.error(e);
      }
      res.status(500).json({ error: 'server error' });
    } finally {
      try {
        conn.release();
      } catch (e) {
        console.error(e);
      }
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE EMISIONES
// =========================================

// // LISTADOS Y CRUD DE EMISIONES
// GET: /emisiones/comunidad/:comunidadId
// GET: /emisiones/comunidad/:comunidadId/count
// GET: /emisiones/comunidad/:comunidadId/resumen
// POST: /emisiones/comunidad/:comunidadId
// GET: /emisiones/:id
// GET: /emisiones/:id/detalle-completo
// PATCH: /emisiones/:id
// DELETE: /emisiones/:id

// // GESTIÓN DE DETALLES Y GASTOS
// POST: /emisiones/:id/detalles
// GET: /emisiones/:id/detalles
// GET: /emisiones/:id/gastos
// GET: /emisiones/:id/unidades
// GET: /emisiones/:id/pagos
// GET: /emisiones/:id/auditoria

// // CÁLCULO Y GENERACIÓN DE CARGOS (STUBS)
// GET: /emisiones/:id/previsualizar-prorrateo
// POST: /emisiones/:id/generar-cargos

// // ESTADÍSTICAS
// GET: /emisiones/estadisticas/general
// GET: /emisiones/estadisticas/por-mes
// GET: /emisiones/estadisticas/cobranza

// // VALIDACIONES
// GET: /emisiones/validar/existencia
// GET: /emisiones/validar/gastos/:id
// GET: /emisiones/validar/cuentas/:id
// GET: /emisiones/validar/cobertura/:comunidadId/:emisionId
