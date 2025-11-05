const express = require('express');
const router = express.Router();
const db = require('../db');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { requireCommunity } = require('../middleware/tenancy');

/**
 * @swagger
 * components:
 *   schemas:
 *     Torre:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         codigo:
 *           type: string
 *         edificio_id:
 *           type: integer
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *         ultimaActualizacion:
 *           type: string
 *           format: date-time
 *     TorreDetalle:
 *       allOf:
 *         - $ref: '#/components/schemas/Torre'
 *         - type: object
 *           properties:
 *             nombreEdificio:
 *               type: string
 *             direccionEdificio:
 *               type: string
 *             nombreComunidad:
 *               type: string
 *             totalUnidades:
 *               type: integer
 *             unidadesOcupadas:
 *               type: integer
 *             numPisos:
 *               type: integer
 */

// ============================================================================
// ENDPOINTS DE LISTADO Y ESTADÍSTICAS
// ============================================================================

/**
 * @swagger
 * /torres/edificio/{edificioId}/listado:
 *   get:
 *     tags: [Torres]
 *     summary: Obtener listado completo de torres
 *     description: Lista todas las torres de un edificio con estadísticas completas de unidades y ocupación
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del edificio
 *     responses:
 *       200:
 *         description: Lista de torres con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TorreDetalle'
 *       500:
 *         description: Error del servidor
 */
router.get('/edificio/:edificioId/listado', authenticate, async (req, res) => {
  try {
    const edificioId = Number(req.params.edificioId);

    const [rows] = await db.query(
      `
      SELECT 
        t.id,
        t.nombre,
        t.codigo,
        t.edificio_id,
        t.created_at AS fechaCreacion,
        t.updated_at AS ultimaActualizacion,
        e.nombre AS nombreEdificio,
        e.direccion AS direccionEdificio,
        c.razon_social AS nombreComunidad,
        COUNT(DISTINCT u.id) AS totalUnidades,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS unidadesOcupadas,
        COALESCE(MAX(CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED)), 0) AS numPisos
      FROM torre t
      JOIN edificio e ON e.id = t.edificio_id
      JOIN comunidad c ON c.id = e.comunidad_id
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE t.edificio_id = ?
      GROUP BY t.id, t.nombre, t.codigo, t.edificio_id, t.created_at, t.updated_at,
               e.nombre, e.direccion, c.razon_social
      ORDER BY t.codigo ASC
    `,
      [edificioId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching torres listado:', error);
    res.status(500).json({ error: 'Error al obtener listado de torres' });
  }
});

/**
 * @swagger
 * /torres/edificio/{edificioId}/buscar:
 *   get:
 *     tags: [Torres]
 *     summary: Buscar y filtrar torres
 *     description: Búsqueda con filtros y ordenamiento de torres
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre o código)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nombre, unidades, fecha]
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Torres filtradas y ordenadas
 *       500:
 *         description: Error del servidor
 */
router.get('/edificio/:edificioId/buscar', authenticate, async (req, res) => {
  try {
    const edificioId = Number(req.params.edificioId);
    const searchTerm = req.query.search || '';
    const sortBy = req.query.sortBy || 'nombre';
    const sortOrder = req.query.sortOrder?.toUpperCase() || 'ASC';

    let orderByClause = 't.nombre ASC';

    if (sortBy === 'nombre') {
      orderByClause = `t.nombre ${sortOrder}`;
    } else if (sortBy === 'unidades') {
      orderByClause = `totalUnidades ${sortOrder}, t.nombre ASC`;
    } else if (sortBy === 'fecha') {
      orderByClause = `t.created_at ${sortOrder}`;
    }

    const [rows] = await db.query(
      `
      SELECT 
        t.id,
        t.nombre,
        t.codigo,
        t.created_at AS fechaCreacion,
        COUNT(DISTINCT u.id) AS totalUnidades,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS unidadesOcupadas
      FROM torre t
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE t.edificio_id = ?
        AND (
          ? = '' OR
          t.nombre COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', ?, '%') OR
          t.codigo COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', ?, '%')
        )
      GROUP BY t.id, t.nombre, t.codigo, t.created_at
      ORDER BY ${orderByClause}
    `,
      [edificioId, searchTerm, searchTerm, searchTerm]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error searching torres:', error);
    res.status(500).json({ error: 'Error al buscar torres' });
  }
});

/**
 * @swagger
 * /torres/edificio/{edificioId}/estadisticas:
 *   get:
 *     tags: [Torres]
 *     summary: Estadísticas generales del edificio
 *     description: Obtiene estadísticas agregadas de torres y unidades del edificio
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas del edificio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTorres:
 *                   type: integer
 *                 totalUnidades:
 *                   type: integer
 *                 promedioUnidadesPorTorre:
 *                   type: number
 *                 totalUnidadesOcupadas:
 *                   type: integer
 *                 totalUnidadesVacantes:
 *                   type: integer
 */
router.get(
  '/edificio/:edificioId/estadisticas',
  authenticate,
  async (req, res) => {
    try {
      const edificioId = Number(req.params.edificioId);

      const [rows] = await db.query(
        `
      SELECT 
        COUNT(DISTINCT t.id) AS totalTorres,
        COUNT(DISTINCT u.id) AS totalUnidades,
        COALESCE(ROUND(COUNT(DISTINCT u.id) / NULLIF(COUNT(DISTINCT t.id),0), 0), 0) AS promedioUnidadesPorTorre,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS totalUnidadesOcupadas,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS totalUnidadesVacantes
      FROM torre t
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE t.edificio_id = ?
    `,
        [edificioId]
      );

      res.json(rows[0] || {});
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
);

// ============================================================================
// ENDPOINTS DE DETALLE DE TORRE
// ============================================================================

/**
 * @swagger
 * /torres/{id}/detalle:
 *   get:
 *     tags: [Torres]
 *     summary: Detalle completo de torre
 *     description: Información detallada de una torre incluyendo estadísticas de unidades y superficies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la torre
 *     responses:
 *       200:
 *         description: Detalle de la torre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 codigo:
 *                   type: string
 *                 totalUnidades:
 *                   type: integer
 *                 unidadesOcupadas:
 *                   type: integer
 *                 numPisos:
 *                   type: integer
 *                 superficieTotalUtil:
 *                   type: number
 *                 superficieTotalTerrazas:
 *                   type: number
 *                 superficieTotal:
 *                   type: number
 *       404:
 *         description: Torre no encontrada
 */
router.get('/:id/detalle', authenticate, async (req, res) => {
  try {
    const torreId = Number(req.params.id);

    const [rows] = await db.query(
      `
      SELECT
        -- 1. Información de la Torre y Entidades Superiores
        t.id,
        t.nombre,
        t.codigo,
        t.edificio_id,
        t.created_at AS fechaCreacion,
        t.updated_at AS ultimaActualizacion,
        e.nombre AS nombreEdificio,
        e.direccion AS direccionEdificio,
        e.codigo AS codigoEdificio,
        c.id AS comunidadId,
        c.razon_social AS nombreComunidad,
        c.direccion AS direccionComunidad,
        c.tz AS zonaHorariaComunidad,

        -- 2. Métricas de Unidades (Calculadas)
        COUNT(DISTINCT u.id) AS totalUnidades,
        COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidadesActivas,
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.unidad_id = u.id
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id
        END) AS unidadesOcupadas,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.unidad_id = u.id
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id
        END) AS unidadesVacantes,

        -- 3. Métricas Físicas (Basadas en la sumatoria de unidades)
        COALESCE(SUM(u.m2_utiles), 0) AS superficieTotalUtil,
        COALESCE(SUM(u.m2_terrazas), 0) AS superficieTotalTerrazas,
        COALESCE(SUM(u.m2_utiles + COALESCE(u.m2_terrazas,0)), 0) AS superficieTotal,

        -- 4. Información de Gestión (Administrador)
        COALESCE(MAX(CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED)), 0) AS numPisos,
        adm.username AS administradorUsername,
        adm_per.nombres AS administradorNombres

      FROM torre t
      JOIN edificio e ON e.id = t.edificio_id
      JOIN comunidad c ON c.id = e.comunidad_id
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      LEFT JOIN usuario_rol_comunidad urc_adm ON c.id = urc_adm.comunidad_id
        AND urc_adm.rol_id = 2 AND urc_adm.activo = 1
      LEFT JOIN usuario adm ON urc_adm.usuario_id = adm.id
      LEFT JOIN persona adm_per ON adm.persona_id = adm_per.id
      WHERE t.id = ?
      GROUP BY t.id, t.nombre, t.codigo, t.edificio_id, t.created_at, t.updated_at,
               e.nombre, e.direccion, e.codigo, c.id, c.razon_social, c.direccion, c.tz,
               adm.username, adm_per.nombres
    `,
      [torreId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching torre detalle:', error);
    res.status(500).json({ error: 'Error al obtener detalle de torre' });
  }
});

/**
 * @swagger
 * /torres/{id}/unidades:
 *   get:
 *     tags: [Torres]
 *     summary: Listar unidades de la torre
 *     description: Obtiene todas las unidades con propietarios y arrendatarios actuales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   numero:
 *                     type: string
 *                   superficie:
 *                     type: number
 *                   estadoOcupacion:
 *                     type: string
 *                     enum: [Ocupada, Vacante]
 *                   propietarios:
 *                     type: string
 *                   arrendatarios:
 *                     type: string
 *                   piso:
 *                     type: integer
 */
router.get('/:id/unidades', authenticate, async (req, res) => {
  try {
    const torreId = Number(req.params.id);

    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.codigo AS numero,
        u.m2_utiles AS superficie,
        u.m2_terrazas,
        u.nro_bodega,
        u.nro_estacionamiento,
        u.alicuota,
        u.activa AS estado,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu
            WHERE tu.unidad_id = u.id
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN 'Ocupada'
          ELSE 'Vacante'
        END AS estadoOcupacion,
        GROUP_CONCAT(
          DISTINCT CASE 
            WHEN tuP.tipo = 'propietario' AND (tuP.hasta IS NULL OR tuP.hasta >= CURRENT_DATE)
            THEN CONCAT(p.nombres, ' ', p.apellidos) 
          END
          SEPARATOR ', '
        ) AS propietarios,
        GROUP_CONCAT(
          DISTINCT CASE 
            WHEN tuA.tipo = 'arrendatario' AND (tuA.hasta IS NULL OR tuA.hasta >= CURRENT_DATE)
            THEN CONCAT(pa.nombres, ' ', pa.apellidos) 
          END
          SEPARATOR ', '
        ) AS arrendatarios,
        CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED) AS piso
      FROM unidad u
      LEFT JOIN titulares_unidad tuP ON tuP.unidad_id = u.id AND tuP.tipo='propietario'
      LEFT JOIN persona p ON p.id = tuP.persona_id
      LEFT JOIN titulares_unidad tuA ON tuA.unidad_id = u.id AND tuA.tipo='arrendatario'
      LEFT JOIN persona pa ON pa.id = tuA.persona_id
      WHERE u.torre_id = ?
        AND u.activa = 1
      GROUP BY u.id, u.codigo, u.m2_utiles, u.m2_terrazas, u.nro_bodega, 
               u.nro_estacionamiento, u.alicuota, u.activa
      ORDER BY piso ASC, u.codigo ASC
    `,
      [torreId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching unidades:', error);
    res.status(500).json({ error: 'Error al obtener unidades' });
  }
});

/**
 * @swagger
 * /torres/{id}/unidades/filtradas:
 *   get:
 *     tags: [Torres]
 *     summary: Unidades filtradas por estado
 *     description: Obtiene unidades filtradas por su estado de ocupación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [todas, ocupada, vacante]
 *           default: todas
 *     responses:
 *       200:
 *         description: Unidades filtradas
 */
router.get('/:id/unidades/filtradas', authenticate, async (req, res) => {
  try {
    const torreId = Number(req.params.id);
    const estadoFilter = req.query.estado || 'todas';

    let whereClause = 'u.torre_id = ? AND u.activa = 1';

    if (estadoFilter === 'ocupada') {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM titulares_unidad tu2 
        WHERE tu2.unidad_id = u.id 
          AND (tu2.hasta IS NULL OR tu2.hasta >= CURRENT_DATE)
      )`;
    } else if (estadoFilter === 'vacante') {
      whereClause += ` AND NOT EXISTS (
        SELECT 1 FROM titulares_unidad tu3 
        WHERE tu3.unidad_id = u.id 
          AND (tu3.hasta IS NULL OR tu3.hasta >= CURRENT_DATE)
      )`;
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.codigo AS numero,
        u.m2_utiles AS superficie,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN 'Ocupada'
          ELSE 'Vacante'
        END AS estado,
        GROUP_CONCAT(
          DISTINCT CASE 
            WHEN tu.tipo = 'propietario' AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
            THEN CONCAT(p.nombres, ' ', p.apellidos) 
          END 
          SEPARATOR ', '
        ) AS propietarios
      FROM unidad u
      LEFT JOIN titulares_unidad tu ON tu.unidad_id = u.id AND tu.tipo='propietario'
      LEFT JOIN persona p ON p.id = tu.persona_id
      WHERE ${whereClause}
      GROUP BY u.id, u.codigo, u.m2_utiles
      ORDER BY u.codigo ASC
    `,
      [torreId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching unidades filtradas:', error);
    res.status(500).json({ error: 'Error al obtener unidades filtradas' });
  }
});

/**
 * @swagger
 * /torres/{id}/estadisticas-por-piso:
 *   get:
 *     tags: [Torres]
 *     summary: Estadísticas por piso
 *     description: Obtiene estadísticas de ocupación y superficie agrupadas por piso
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estadísticas por piso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   piso:
 *                     type: integer
 *                   totalUnidades:
 *                     type: integer
 *                   unidadesOcupadas:
 *                     type: integer
 *                   superficieTotal:
 *                     type: number
 *                   superficiePromedio:
 *                     type: number
 */
router.get('/:id/estadisticas-por-piso', authenticate, async (req, res) => {
  try {
    const torreId = Number(req.params.id);

    const [rows] = await db.query(
      `
      SELECT 
        CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED) AS piso,
        COUNT(u.id) AS totalUnidades,
        COUNT(CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN 1 
        END) AS unidadesOcupadas,
        SUM(u.m2_utiles) AS superficieTotal,
        AVG(u.m2_utiles) AS superficiePromedio
      FROM unidad u
      WHERE u.torre_id = ?
        AND u.activa = 1
      GROUP BY piso
      ORDER BY piso ASC
    `,
      [torreId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching estadisticas por piso:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas por piso' });
  }
});

// ============================================================================
// ENDPOINTS DE VALIDACIÓN
// ============================================================================

/**
 * @swagger
 * /torres/edificio/{edificioId}/validar-codigo:
 *   get:
 *     tags: [Torres]
 *     summary: Validar código de torre
 *     description: Verifica si un código de torre ya existe en el edificio
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existe:
 *                   type: boolean
 *       400:
 *         description: Código no proporcionado
 */
router.get(
  '/edificio/:edificioId/validar-codigo',
  authenticate,
  async (req, res) => {
    try {
      const edificioId = Number(req.params.edificioId);
      const codigo = req.query.codigo;

      if (!codigo) {
        return res.status(400).json({ error: 'Código es requerido' });
      }

      const [rows] = await db.query(
        `
      SELECT COUNT(*) AS existe
      FROM torre
      WHERE edificio_id = ? AND codigo = ?
    `,
        [edificioId, codigo]
      );

      res.json({ existe: rows[0].existe > 0 });
    } catch (error) {
      console.error('Error validando codigo:', error);
      res.status(500).json({ error: 'Error al validar código' });
    }
  }
);

/**
 * @swagger
 * /torres/edificio/{edificioId}/siguiente-codigo:
 *   get:
 *     tags: [Torres]
 *     summary: Obtener siguiente código disponible
 *     description: Genera el siguiente código disponible para una nueva torre (formato T001, T002...)
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Siguiente código sugerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 siguienteCodigo:
 *                   type: string
 *                   example: T001
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/edificio/:edificioId/siguiente-codigo',
  authenticate,
  async (req, res) => {
    try {
      const edificioId = Number(req.params.edificioId);

      const [rows] = await db.query(
        `
      SELECT 
        CONCAT('T', LPAD(COALESCE(MAX(CAST(SUBSTRING(codigo, 2) AS UNSIGNED)), 0) + 1, 3, '0')) AS siguienteCodigo
      FROM torre
      WHERE edificio_id = ?
        AND codigo REGEXP '^T[0-9]+$'
    `,
        [edificioId]
      );

      res.json(rows[0] || { siguienteCodigo: 'T001' });
    } catch (error) {
      console.error('Error getting siguiente codigo:', error);
      res.status(500).json({ error: 'Error al obtener siguiente código' });
    }
  }
);

/**
 * @swagger
 * /torres/{id}/puede-eliminar:
 *   get:
 *     tags: [Torres]
 *     summary: Verificar si torre puede eliminarse
 *     description: Valida si una torre puede ser eliminada (no debe tener unidades activas)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de validación de eliminación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 puedeEliminar:
 *                   type: boolean
 *                 razon:
 *                   type: string
 *                 totalUnidades:
 *                   type: integer
 *                 unidadesActivas:
 *                   type: integer
 *       404:
 *         description: Torre no encontrada
 */
router.get('/:id/puede-eliminar', authenticate, async (req, res) => {
  try {
    const torreId = Number(req.params.id);

    const [rows] = await db.query(
      `
      SELECT 
        t.id,
        t.nombre,
        COUNT(u.id) AS total_unidades,
        COUNT(CASE WHEN u.activa = 1 THEN 1 END) AS unidades_activas
      FROM torre t
      LEFT JOIN unidad u ON u.torre_id = t.id
      WHERE t.id = ?
      GROUP BY t.id, t.nombre
    `,
      [torreId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Torre no encontrada' });
    }

    const torre = rows[0];
    const puedeEliminar = torre.unidades_activas === 0;

    res.json({
      puedeEliminar,
      mensaje: puedeEliminar
        ? 'La torre puede ser eliminada'
        : `No se puede eliminar. La torre tiene ${torre.unidades_activas} unidades activas`,
      totalUnidades: torre.total_unidades,
      unidadesActivas: torre.unidades_activas,
    });
  } catch (error) {
    console.error('Error checking puede eliminar:', error);
    res.status(500).json({ error: 'Error al verificar si puede eliminar' });
  }
});

// ============================================================================
// ENDPOINTS DE REPORTES
// ============================================================================

/**
 * @swagger
 * /torres/reportes/completo:
 *   get:
 *     tags: [Torres]
 *     summary: Reporte completo de torres
 *     description: Genera reporte completo con todas las métricas de torres, unidades y ocupación
 *     parameters:
 *       - in: query
 *         name: edificioId
 *         schema:
 *           type: integer
 *         description: Filtrar por edificio específico
 *       - in: query
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         description: Filtrar por comunidad específica
 *     responses:
 *       200:
 *         description: Reporte completo de torres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   torre_id:
 *                     type: integer
 *                   torre_nombre:
 *                     type: string
 *                   torre_codigo:
 *                     type: string
 *                   edificio_id:
 *                     type: integer
 *                   edificio_nombre:
 *                     type: string
 *                   comunidad_id:
 *                     type: integer
 *                   comunidad_nombre:
 *                     type: string
 *                   total_unidades:
 *                     type: integer
 *                   unidades_ocupadas:
 *                     type: integer
 *                   porcentaje_ocupacion:
 *                     type: number
 *                   superficie_total:
 *                     type: number
 *                   superficie_promedio:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/reportes/completo', authenticate, async (req, res) => {
  try {
    const edificioId = req.query.edificioId
      ? Number(req.query.edificioId)
      : null;
    const comunidadId = req.query.comunidadId
      ? Number(req.query.comunidadId)
      : null;

    const [rows] = await db.query(
      `
      SELECT 
        t.id AS torre_id,
        t.nombre AS torre_nombre,
        t.codigo AS torre_codigo,
        e.id AS edificio_id,
        e.nombre AS edificio_nombre,
        e.codigo AS edificio_codigo,
        c.id AS comunidad_id,
        c.razon_social AS comunidad_nombre,
        COUNT(DISTINCT u.id) AS total_unidades,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS unidades_ocupadas,
        COUNT(DISTINCT u.id) - COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS unidades_vacantes,
        COALESCE(MAX(CAST(SUBSTRING_INDEX(u.codigo, '-', 1) AS UNSIGNED)), 0) AS numero_pisos,
        COALESCE(SUM(u.m2_utiles), 0) AS superficie_total_util,
        COALESCE(SUM(u.m2_terrazas), 0) AS superficie_total_terrazas,
        COALESCE(ROUND(AVG(u.m2_utiles), 2), 0) AS superficie_promedio,
        t.created_at AS fecha_creacion,
        t.updated_at AS ultima_actualizacion
      FROM torre t
      JOIN edificio e ON e.id = t.edificio_id
      JOIN comunidad c ON c.id = e.comunidad_id
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE (? IS NULL OR t.edificio_id = ?)
        AND (? IS NULL OR c.id = ?)
      GROUP BY t.id, t.nombre, t.codigo, e.id, e.nombre, e.codigo, 
               c.id, c.razon_social, t.created_at, t.updated_at
      ORDER BY c.razon_social, e.nombre, t.codigo
    `,
      [edificioId, edificioId, comunidadId, comunidadId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error generating reporte completo:', error);
    res.status(500).json({ error: 'Error al generar reporte completo' });
  }
});

/**
 * @swagger
 * /torres/reportes/ocupacion:
 *   get:
 *     tags: [Torres]
 *     summary: Reporte de ocupación
 *     description: Reporte con estadísticas de ocupación por torre
 *     parameters:
 *       - in: query
 *         name: edificioId
 *         schema:
 *           type: integer
 *         description: Filtrar por edificio específico
 *     responses:
 *       200:
 *         description: Reporte de ocupación
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   torre:
 *                     type: string
 *                   codigo:
 *                     type: string
 *                   total_unidades:
 *                     type: integer
 *                   ocupadas:
 *                     type: integer
 *                   vacantes:
 *                     type: integer
 *                   porcentaje_ocupacion:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/reportes/ocupacion', authenticate, async (req, res) => {
  try {
    const edificioId = req.query.edificioId
      ? Number(req.query.edificioId)
      : null;

    const [rows] = await db.query(
      `
      SELECT 
        t.nombre AS torre,
        t.codigo,
        COUNT(DISTINCT u.id) AS total_unidades,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS ocupadas,
        ROUND(
          (COUNT(DISTINCT CASE 
             WHEN EXISTS (
               SELECT 1 FROM titulares_unidad tu2 
               WHERE tu2.unidad_id = u.id 
                 AND (tu2.hasta IS NULL OR tu2.hasta >= CURRENT_DATE)
             ) THEN u.id 
           END) * 100.0) / NULLIF(COUNT(DISTINCT u.id), 0), 
        2) AS porcentaje_ocupacion
      FROM torre t
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE (? IS NULL OR t.edificio_id = ?)
      GROUP BY t.id, t.nombre, t.codigo
      ORDER BY porcentaje_ocupacion DESC
    `,
      [edificioId, edificioId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error generating reporte ocupacion:', error);
    res.status(500).json({ error: 'Error al generar reporte de ocupación' });
  }
});

/**
 * @swagger
 * /torres/buscar:
 *   get:
 *     tags: [Torres]
 *     summary: Buscar torres
 *     description: Busca torres por nombre o código con límite de resultados
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: edificioId
 *         schema:
 *           type: integer
 *         description: Filtrar por edificio específico
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Torres encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   codigo:
 *                     type: string
 *                   edificio:
 *                     type: string
 *                   totalUnidades:
 *                     type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/buscar', authenticate, async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const edificioId = req.query.edificioId
      ? Number(req.query.edificioId)
      : null;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const [rows] = await db.query(
      `
      SELECT 
        t.id,
        t.nombre,
        t.codigo,
        e.nombre AS edificio,
        COUNT(DISTINCT u.id) AS totalUnidades
      FROM torre t
      JOIN edificio e ON e.id = t.edificio_id
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE (
        t.nombre COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', ?, '%')
        OR t.codigo COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', ?, '%')
      )
      AND (? IS NULL OR t.edificio_id = ?)
      GROUP BY t.id, t.nombre, t.codigo, e.nombre
      ORDER BY t.nombre ASC
      LIMIT ?
    `,
      [searchTerm, searchTerm, edificioId, edificioId, limit]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error searching torres:', error);
    res.status(500).json({ error: 'Error al buscar torres' });
  }
});

/**
 * @swagger
 * /torres/edificio/{edificioId}/dropdown:
 *   get:
 *     tags: [Torres]
 *     summary: Torres para selector/dropdown
 *     description: Obtiene lista simplificada de torres para usar en dropdowns o selects
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de torres simplificada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   codigo:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get('/edificio/:edificioId/dropdown', authenticate, async (req, res) => {
  try {
    const edificioId = Number(req.params.edificioId);

    const [rows] = await db.query(
      `
      SELECT 
        t.id,
        t.nombre,
        t.codigo,
        CONCAT(t.nombre, ' (', t.codigo, ')') AS display_name
      FROM torre t
      WHERE t.edificio_id = ?
      ORDER BY t.codigo ASC
    `,
      [edificioId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching torres dropdown:', error);
    res.status(500).json({ error: 'Error al obtener torres para dropdown' });
  }
});

// ============================================================================
// ENDPOINTS DE DASHBOARD Y WIDGETS
// ============================================================================

/**
 * @swagger
 * /torres/top-unidades:
 *   get:
 *     tags: [Torres]
 *     summary: Top 5 torres con más unidades
 *     description: Obtiene las 5 torres con mayor cantidad de unidades
 *     parameters:
 *       - in: query
 *         name: edificioId
 *         schema:
 *           type: integer
 *         description: Filtrar por edificio específico
 *       - in: query
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         description: Filtrar por comunidad específica
 *     responses:
 *       200:
 *         description: Top torres por cantidad de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   torre:
 *                     type: string
 *                   codigo:
 *                     type: string
 *                   edificio:
 *                     type: string
 *                   totalUnidades:
 *                     type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/top-unidades', authenticate, async (req, res) => {
  try {
    const edificioId = req.query.edificioId
      ? Number(req.query.edificioId)
      : null;
    const comunidadId = req.query.comunidadId
      ? Number(req.query.comunidadId)
      : null;

    const [rows] = await db.query(
      `
      SELECT 
        t.nombre,
        t.codigo,
        e.nombre AS edificio,
        COUNT(DISTINCT u.id) AS totalUnidades,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS ocupadas
      FROM torre t
      JOIN edificio e ON e.id = t.edificio_id
      JOIN comunidad c ON c.id = e.comunidad_id
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE (? IS NULL OR t.edificio_id = ?)
        AND (? IS NULL OR c.id = ?)
      GROUP BY t.id, t.nombre, t.codigo, e.nombre
      ORDER BY totalUnidades DESC
      LIMIT 5
    `,
      [edificioId, edificioId, comunidadId, comunidadId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching top torres:', error);
    res.status(500).json({ error: 'Error al obtener top torres' });
  }
});

/**
 * @swagger
 * /torres/estadisticas-globales:
 *   get:
 *     tags: [Torres]
 *     summary: Estadísticas globales
 *     description: Obtiene estadísticas agregadas de todas las torres del sistema
 *     parameters:
 *       - in: query
 *         name: comunidadId
 *         schema:
 *           type: integer
 *         description: Filtrar por comunidad específica
 *     responses:
 *       200:
 *         description: Estadísticas globales del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_torres:
 *                   type: integer
 *                 total_edificios:
 *                   type: integer
 *                 total_unidades:
 *                   type: integer
 *                 total_unidades_ocupadas:
 *                   type: integer
 *                 promedio_unidades_por_torre:
 *                   type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas-globales', authenticate, async (req, res) => {
  try {
    const comunidadId = req.query.comunidadId
      ? Number(req.query.comunidadId)
      : null;

    const [rows] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT t.id) AS total_torres,
        COUNT(DISTINCT e.id) AS total_edificios,
        COUNT(DISTINCT u.id) AS total_unidades,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM titulares_unidad tu 
            WHERE tu.unidad_id = u.id 
              AND (tu.hasta IS NULL OR tu.hasta >= CURRENT_DATE)
          ) THEN u.id 
        END) AS total_unidades_ocupadas,
        COALESCE(ROUND(AVG(up.total), 2), 0) AS promedio_unidades_por_torre
      FROM torre t
      JOIN edificio e ON e.id = t.edificio_id
      JOIN comunidad c ON c.id = e.comunidad_id
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      LEFT JOIN (
        SELECT torre_id, COUNT(*) AS total
        FROM unidad
        WHERE activa = 1
        GROUP BY torre_id
      ) AS up ON up.torre_id = t.id
      WHERE (? IS NULL OR c.id = ?)
    `,
      [comunidadId, comunidadId]
    );

    res.json(rows[0] || {});
  } catch (error) {
    console.error('Error fetching estadisticas globales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas globales' });
  }
});

/**
 * @swagger
 * /torres/edificio/{edificioId}/distribucion:
 *   get:
 *     tags: [Torres]
 *     summary: Distribución de unidades por torre
 *     description: Obtiene la distribución porcentual de unidades por torre dentro del edificio
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Distribución de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   torre:
 *                     type: string
 *                   total_unidades:
 *                     type: integer
 *                   porcentaje_del_edificio:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/edificio/:edificioId/distribucion',
  authenticate,
  async (req, res) => {
    try {
      const edificioId = Number(req.params.edificioId);

      const [rows] = await db.query(
        `
      SELECT 
        t.nombre AS torre,
        COUNT(u.id) AS total_unidades,
        ROUND(
          (COUNT(u.id) * 100.0) / NULLIF(SUM(COUNT(u.id)) OVER (), 0)
        , 2) AS porcentaje_del_edificio
      FROM torre t
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE t.edificio_id = ?
      GROUP BY t.id, t.nombre
      ORDER BY total_unidades DESC
    `,
        [edificioId]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error fetching distribucion:', error);
      res.status(500).json({ error: 'Error al obtener distribución' });
    }
  }
);

/**
 * @swagger
 * /torres/edificio/{edificioId}/comparativa-superficies:
 *   get:
 *     tags: [Torres]
 *     summary: Comparativa de superficies
 *     description: Compara superficies útiles, terrazas y totales entre torres del edificio
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comparativa de superficies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   torre:
 *                     type: string
 *                   codigo:
 *                     type: string
 *                   superficie_util:
 *                     type: number
 *                   superficie_terrazas:
 *                     type: number
 *                   superficie_total:
 *                     type: number
 *                   superficie_promedio:
 *                     type: number
 *       500:
 *         description: Error del servidor
 */
/**
 * GET /torres/edificio/:edificioId/comparativa-superficies
 * Comparativa de superficies entre torres
 */
router.get(
  '/edificio/:edificioId/comparativa-superficies',
  authenticate,
  async (req, res) => {
    try {
      const edificioId = Number(req.params.edificioId);

      const [rows] = await db.query(
        `
      SELECT 
        t.nombre AS torre,
        t.codigo,
        COUNT(u.id) AS total_unidades,
        COALESCE(SUM(u.m2_utiles), 0) AS superficie_total_util,
        COALESCE(SUM(u.m2_terrazas), 0) AS superficie_total_terrazas,
        COALESCE(ROUND(AVG(u.m2_utiles), 2), 0) AS superficie_promedio_util,
        COALESCE(ROUND(AVG(u.m2_terrazas), 2), 0) AS superficie_promedio_terrazas
      FROM torre t
      LEFT JOIN unidad u ON u.torre_id = t.id AND u.activa = 1
      WHERE t.edificio_id = ?
      GROUP BY t.id, t.nombre, t.codigo
      ORDER BY t.codigo
    `,
        [edificioId]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error fetching comparativa superficies:', error);
      res
        .status(500)
        .json({ error: 'Error al obtener comparativa de superficies' });
    }
  }
);

// ============================================================================
// ENDPOINTS EXISTENTES (mantener compatibilidad)
// ============================================================================

/**
 * @swagger
 * /torres/comunidad/{comunidadId}:
 *   get:
 *     tags: [Torres]
 *     summary: Listar torres por comunidad (legacy)
 *     description: Obtiene todas las torres de una comunidad específica
 *     parameters:
 *       - in: path
 *         name: comunidadId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de torres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   edificio_id:
 *                     type: integer
 *                   edificio_nombre:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get('/comunidad/:comunidadId', authenticate, async (req, res) => {
  try {
    const comunidadId = Number(req.params.comunidadId);
    const [rows] = await db.query(
      `
      SELECT t.id, t.nombre, t.edificio_id, e.nombre as edificio_nombre
      FROM torre t
      INNER JOIN edificio e ON e.id = t.edificio_id
      WHERE e.comunidad_id = ?
      ORDER BY e.nombre, t.nombre
      LIMIT 200
    `,
      [comunidadId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching torres:', error);
    res.status(500).json({ error: 'Error fetching torres' });
  }
});

/**
 * @swagger
 * /torres/edificio/{edificioId}:
 *   get:
 *     tags: [Torres]
 *     summary: Listar torres por edificio (legacy)
 *     description: Obtiene lista básica de torres de un edificio
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de torres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get('/edificio/:edificioId', authenticate, async (req, res) => {
  const edificioId = Number(req.params.edificioId);
  const [rows] = await db.query(
    'SELECT id, nombre FROM torre WHERE edificio_id = ? LIMIT 200',
    [edificioId]
  );
  res.json(rows);
});

/**
 * @swagger
 * /torres/edificio/{edificioId}:
 *   post:
 *     tags: [Torres]
 *     summary: Crear torre en edificio
 *     description: Crea una nueva torre en el edificio especificado
 *     parameters:
 *       - in: path
 *         name: edificioId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       201:
 *         description: Torre creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *       404:
 *         description: Edificio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post(
  '/edificio/:edificioId',
  [
    authenticate,
    async (req, res, next) => {
      // small inline check to map edificio->comunidad then requireCommunity
      const edificioId = Number(req.params.edificioId);
      try {
        const [erows] = await db.query(
          'SELECT comunidad_id FROM edificio WHERE id = ? LIMIT 1',
          [edificioId]
        );
        if (!erows.length)
          return res.status(404).json({ error: 'edificio not found' });
        req.params.comunidadId = erows[0].comunidad_id;
        next();
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
      }
    },
    requireCommunity('comunidadId', ['admin']),
    body('nombre').notEmpty(),
  ],
  async (req, res) => {
    const edificioId = Number(req.params.edificioId);
    try {
      const [result] = await db.query(
        'INSERT INTO torre (edificio_id, nombre) VALUES (?,?)',
        [edificioId, req.body.nombre]
      );
      const [row] = await db.query(
        'SELECT id, nombre FROM torre WHERE id = ? LIMIT 1',
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
 * /torres/{id}:
 *   get:
 *     tags: [Torres]
 *     summary: Obtener torre por ID (legacy)
 *     description: Obtiene información básica de una torre
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Torre encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Torre'
 *       404:
 *         description: Torre no encontrada
 */
router.get('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const [rows] = await db.query('SELECT * FROM torre WHERE id = ? LIMIT 1', [
    id,
  ]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

/**
 * @swagger
 * /torres/{id}:
 *   patch:
 *     tags: [Torres]
 *     summary: Actualizar torre
 *     description: Actualiza el nombre de una torre existente
 *     parameters:
 *       - in: path
 *         name: id
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
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Torre actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Torre'
 *       400:
 *         description: No se proporcionaron campos para actualizar
 *       500:
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  async (req, res) => {
    const id = req.params.id;
    const fields = ['nombre'];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });
    if (!updates.length) return res.status(400).json({ error: 'no fields' });
    values.push(id);
    try {
      await db.query(
        `UPDATE torre SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      const [rows] = await db.query(
        'SELECT * FROM torre WHERE id = ? LIMIT 1',
        [id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

/**
 * @swagger
 * /torres/{id}:
 *   delete:
 *     tags: [Torres]
 *     summary: Eliminar torre
 *     description: Elimina una torre del sistema (requiere permisos de superadmin/admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Torre eliminada exitosamente
 *       500:
 *         description: Error del servidor
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authenticate,
  authorize('superadmin', 'admin'),
  async (req, res) => {
    const id = req.params.id;
    try {
      await db.query('DELETE FROM torre WHERE id = ?', [id]);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE TORRES
// =========================================

// // LISTADO Y FILTROS
// GET: /torres/edificio/:edificioId/listado
// GET: /torres/edificio/:edificioId/buscar
// GET: /torres/comunidad/:comunidadId
// GET: /torres/edificio/:edificioId
// GET: /torres/buscar
// GET: /torres/edificio/:edificioId/dropdown

// // VISTAS DETALLADAS
// GET: /torres/:id
// GET: /torres/:id/detalle
// GET: /torres/:id/unidades
// GET: /torres/:id/unidades/filtradas

// // ESTADÍSTICAS
// GET: /torres/edificio/:edificioId/estadisticas
// GET: /torres/:id/estadisticas-por-piso
// GET: /torres/estadisticas-globales
// GET: /torres/edificio/:edificioId/distribucion
// GET: /torres/edificio/:edificioId/comparativa-superficies
// GET: /torres/top-unidades

// // CRUD
// POST: /torres/edificio/:edificioId
// ============================================================================
// ENDPOINTS DE CREACIÓN
// ============================================================================

/**
 * @swagger
 * /torres:
 *   post:
 *     tags: [Torres]
 *     summary: Crear nueva torre
 *     description: Crea una nueva torre en un edificio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - edificio_id
 *               - nombre
 *               - codigo
 *             properties:
 *               edificio_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               num_pisos:
 *                 type: integer
 *               tiene_ascensor:
 *                 type: boolean
 *               tiene_porteria:
 *                 type: boolean
 *               tiene_estacionamiento:
 *                 type: boolean
 *               administrador_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Torre creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Código ya existe
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      edificio_id,
      nombre,
      codigo,
      descripcion,
      num_pisos,
      tiene_ascensor = false,
      tiene_porteria = false,
      tiene_estacionamiento = false,
      administrador_id,
    } = req.body;

    // Validaciones básicas
    if (!edificio_id || !nombre || !codigo) {
      return res
        .status(400)
        .json({ error: 'edificio_id, nombre y codigo son requeridos' });
    }

    // Verificar que el edificio existe
    const [edificioRows] = await db.query(
      'SELECT id FROM edificio WHERE id = ?',
      [edificio_id]
    );
    if (edificioRows.length === 0) {
      return res.status(400).json({ error: 'Edificio no encontrado' });
    }

    // Verificar que el código no existe
    const [codigoRows] = await db.query(
      'SELECT id FROM torre WHERE edificio_id = ? AND codigo = ?',
      [edificio_id, codigo]
    );
    if (codigoRows.length > 0) {
      return res
        .status(409)
        .json({ error: 'El código ya existe en este edificio' });
    }

    // Insertar la torre
    const [result] = await db.query(
      `
      INSERT INTO torre (
        edificio_id,
        nombre,
        codigo,
        descripcion,
        num_pisos,
        tiene_ascensor,
        tiene_porteria,
        tiene_estacionamiento,
        administrador_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        edificio_id,
        nombre,
        codigo,
        descripcion || null,
        num_pisos || null,
        tiene_ascensor,
        tiene_porteria,
        tiene_estacionamiento,
        administrador_id || null,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Torre creada exitosamente',
    });
  } catch (error) {
    console.error('Error creando torre:', error);
    res.status(500).json({ error: 'Error al crear la torre' });
  }
});

// PATCH: /torres/:id
// DELETE: /torres/:id

// // VALIDACIONES
// GET: /torres/edificio/:edificioId/validar-codigo
// GET: /torres/edificio/:edificioId/siguiente-codigo
// GET: /torres/:id/puede-eliminar

// // REPORTES
// GET: /torres/reportes/completo
// GET: /torres/reportes/ocupacion
