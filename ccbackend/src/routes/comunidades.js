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
 *     summary: Lista comunidades con estadísticas calculadas
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
 *     responses:
 *       200:
 *         description: Lista de comunidades con estadísticas
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { nombre, direccion } = req.query;
    
    let query = `
      SELECT 
          c.id,
          c.razon_social as nombre,
          c.rut,
          c.dv,
          c.giro,
          c.direccion,
          c.email_contacto as email,
          c.telefono_contacto as telefono,
          c.moneda,
          c.tz as zona_horaria,
          c.created_at as fechaCreacion,
          c.updated_at as fechaActualizacion,
          
          -- Estadísticas calculadas
          COALESCE(stats.total_unidades, 0) as totalUnidades,
          COALESCE(stats.unidades_activas, 0) as unidadesActivas,
          COALESCE(stats.total_residentes, 0) as totalResidentes,
          COALESCE(stats.saldo_pendiente, 0) as saldoPendiente,
          COALESCE(stats.ingresos_mensuales, 0) as ingresosMensuales,
          COALESCE(stats.gastos_mensuales, 0) as gastosMensuales
          
      FROM comunidad c
      LEFT JOIN (
          -- Subconsulta para calcular estadísticas
          SELECT 
              com.id as comunidad_id,
              COUNT(DISTINCT u.id) as total_unidades,
              COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) as unidades_activas,
              COUNT(DISTINCT CASE WHEN r.codigo IN ('residente', 'propietario') AND ucr.activo = 1 THEN ucr.usuario_id END) as total_residentes,
              COALESCE(SUM(CASE WHEN cu.estado IN ('pendiente', 'parcial') THEN cu.saldo ELSE 0 END), 0) as saldo_pendiente,
              -- Ingresos del mes actual
              COALESCE((
                  SELECT SUM(cu2.monto_total) 
                  FROM cargo_unidad cu2 
                  WHERE cu2.comunidad_id = com.id 
                  AND MONTH(cu2.created_at) = MONTH(CURDATE()) 
                  AND YEAR(cu2.created_at) = YEAR(CURDATE())
              ), 0) as ingresos_mensuales,
              -- Gastos del mes actual  
              COALESCE((
                  SELECT SUM(monto) 
                  FROM gasto g2 
                  WHERE g2.comunidad_id = com.id 
                  AND MONTH(g2.fecha) = MONTH(CURDATE()) 
                  AND YEAR(g2.fecha) = YEAR(CURDATE())
              ), 0) as gastos_mensuales
          FROM comunidad com
          LEFT JOIN unidad u ON u.comunidad_id = com.id
          LEFT JOIN usuario_comunidad_rol ucr ON ucr.comunidad_id = com.id
          LEFT JOIN rol r ON r.id = ucr.rol_id
          LEFT JOIN cuenta_cobro_unidad cu ON cu.comunidad_id = com.id
          GROUP BY com.id
      ) stats ON stats.comunidad_id = c.id
      WHERE 1=1`;
    
    const params = [];
    
    if (nombre) {
      query += ` AND c.razon_social LIKE CONCAT('%', ?, '%')`;
      params.push(nombre);
    }
    
    if (direccion) {
      query += ` AND c.direccion LIKE CONCAT('%', ?, '%')`;
      params.push(direccion);
    }
    
    query += ` ORDER BY c.razon_social ASC LIMIT 200`;
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching communities:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades:
 *   post:
 *     tags: [Comunidades]
 *     summary: Crear comunidad
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
 *               rut:
 *                 type: string
 *               dv:
 *                 type: string
 *               giro:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', [authenticate, authorize('admin','superadmin'), body('razon_social').notEmpty(), body('rut').notEmpty(), body('dv').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto } = req.body;
  try {
    const [result] = await db.query('INSERT INTO comunidad (razon_social, rut, dv, giro, direccion, email_contacto, telefono_contacto) VALUES (?,?,?,?,?,?,?)', [razon_social, rut, dv, giro || null, direccion || null, email_contacto || null, telefono_contacto || null]);
    const [row] = await db.query('SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener comunidad por id con información completa
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
 *         description: Comunidad con información completa
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT 
          c.id,
          c.razon_social as nombre,
          c.rut,
          c.dv,
          c.giro,
          c.direccion,
          c.email_contacto as email,
          c.telefono_contacto as telefono,
          c.moneda,
          c.tz as zona_horaria,
          c.politica_mora_json,
          c.created_at as fechaCreacion,
          c.updated_at as fechaActualizacion,
          
          -- Contador de unidades
          (SELECT COUNT(*) 
           FROM unidad u 
           WHERE u.comunidad_id = c.id) as totalUnidades,
           
          (SELECT COUNT(*) 
           FROM unidad u 
           WHERE u.comunidad_id = c.id AND u.activa = 1) as unidadesActivas,
           
          -- Contador de residentes activos
          (SELECT COUNT(DISTINCT ucr.usuario_id) 
           FROM usuario_comunidad_rol ucr
           INNER JOIN rol r ON r.id = ucr.rol_id
           WHERE ucr.comunidad_id = c.id 
           AND ucr.activo = 1 
           AND r.codigo IN ('residente', 'propietario')) as totalResidentes,
           
          -- Contador de edificios
          (SELECT COUNT(*) 
           FROM edificio e 
           WHERE e.comunidad_id = c.id) as totalEdificios,
           
          -- Contador de amenidades
          (SELECT COUNT(*) 
           FROM amenidad a 
           WHERE a.comunidad_id = c.id) as totalAmenidades,
           
          -- Saldo pendiente
          (SELECT COALESCE(SUM(cu.saldo), 0) 
           FROM cuenta_cobro_unidad cu 
           WHERE cu.comunidad_id = c.id 
           AND cu.estado IN ('pendiente', 'parcial')) as saldoPendiente

      FROM comunidad c
      WHERE c.id = ?`;
    
    const [rows] = await db.query(query, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Comunidad no encontrada' });
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching community:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   patch:
 *     tags: [Comunidades]
 *     summary: Actualizar comunidad parcialmente
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
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => {
  const id = req.params.id;
  const fields = ['razon_social','rut','dv','giro','direccion','email_contacto','telefono_contacto','moneda','tz'];
  const updates = [];
  const values = [];
  fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } });
  if (!updates.length) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  try {
    await db.query(`UPDATE comunidad SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT id, razon_social, rut, dv FROM comunidad WHERE id = ? LIMIT 1', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /comunidades/{id}:
 *   delete:
 *     tags: [Comunidades]
 *     summary: Eliminar comunidad
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
 *         description: No Content
 */
router.delete('/:id', authenticate, authorize('superadmin'), async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM comunidad WHERE id = ?', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/dashboard:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener dashboard completo de una comunidad
 *     description: Retorna información consolidada para el dashboard incluyendo estadísticas financieras, unidades, residentes y alertas
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
 *         description: Dashboard de la comunidad
 */
router.get('/:id/dashboard', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    // Obtener información básica de la comunidad
    const [comunidad] = await db.query(`
      SELECT 
        c.id,
        c.razon_social as nombre,
        c.direccion,
        c.email_contacto as email,
        c.telefono_contacto as telefono,
        c.moneda
      FROM comunidad c
      WHERE c.id = ?
      LIMIT 1
    `, [id]);
    
    if (!comunidad.length) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }
    
    // Obtener estadísticas de unidades
    const [unidades] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN activa = 1 THEN 1 END) as activas,
        COUNT(CASE WHEN activa = 0 THEN 1 END) as inactivas
      FROM unidad u
      INNER JOIN edificio e ON e.id = u.edificio_id
      WHERE e.comunidad_id = ?
    `, [id]);
    
    // Obtener estadísticas de residentes
    const [residentes] = await db.query(`
      SELECT 
        COUNT(DISTINCT ucr.usuario_id) as total,
        COUNT(DISTINCT CASE WHEN r.codigo = 'propietario' AND ucr.activo = 1 THEN ucr.usuario_id END) as propietarios,
        COUNT(DISTINCT CASE WHEN r.codigo = 'residente' AND ucr.activo = 1 THEN ucr.usuario_id END) as residentes,
        COUNT(DISTINCT CASE WHEN r.codigo IN ('admin', 'comite') AND ucr.activo = 1 THEN ucr.usuario_id END) as administradores
      FROM usuario_comunidad_rol ucr
      INNER JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.comunidad_id = ?
    `, [id]);
    
    // Obtener estadísticas financieras del mes actual
    const [finanzas] = await db.query(`
      SELECT 
        -- Ingresos del mes
        COALESCE((
          SELECT SUM(cu.monto_total)
          FROM cargo_unidad cu
          INNER JOIN unidad u ON u.id = cu.unidad_id
          INNER JOIN edificio e ON e.id = u.edificio_id
          WHERE e.comunidad_id = ?
            AND MONTH(cu.created_at) = MONTH(CURDATE())
            AND YEAR(cu.created_at) = YEAR(CURDATE())
        ), 0) as ingresosMes,
        
        -- Ingresos cobrados
        COALESCE((
          SELECT SUM(cu.monto_total - cu.saldo)
          FROM cargo_unidad cu
          INNER JOIN unidad u ON u.id = cu.unidad_id
          INNER JOIN edificio e ON e.id = u.edificio_id
          WHERE e.comunidad_id = ?
            AND MONTH(cu.created_at) = MONTH(CURDATE())
            AND YEAR(cu.created_at) = YEAR(CURDATE())
        ), 0) as ingresosCobrados,
        
        -- Gastos del mes
        COALESCE((
          SELECT SUM(g.monto)
          FROM gasto g
          WHERE g.comunidad_id = ?
            AND MONTH(g.fecha) = MONTH(CURDATE())
            AND YEAR(g.fecha) = YEAR(CURDATE())
        ), 0) as gastosMes,
        
        -- Saldo pendiente total
        COALESCE((
          SELECT SUM(cu.saldo)
          FROM cargo_unidad cu
          INNER JOIN unidad u ON u.id = cu.unidad_id
          INNER JOIN edificio e ON e.id = u.edificio_id
          WHERE e.comunidad_id = ?
            AND cu.estado IN ('pendiente', 'parcial')
        ), 0) as saldoPendiente
    `, [id, id, id, id]);
    
    // Obtener cargos pendientes (top 5)
    const [cargosPendientes] = await db.query(`
      SELECT 
        cu.id,
        CONCAT(e.nombre, ' - ', u.codigo) as unidad,
        cu.monto_total as monto,
        cu.saldo,
        cu.estado,
        cu.created_at as fechaEmision,
        cu.updated_at as fechaActualizacion,
        DATEDIFF(CURDATE(), cu.created_at) as diasDesdeCreacion
      FROM cargo_unidad cu
      INNER JOIN unidad u ON u.id = cu.unidad_id
      INNER JOIN edificio e ON e.id = u.edificio_id
      WHERE e.comunidad_id = ?
        AND cu.estado IN ('pendiente', 'parcial')
      ORDER BY cu.created_at DESC
      LIMIT 5
    `, [id]);
    
    // Obtener actividad reciente (últimos 5 pagos)
    const [actividadReciente] = await db.query(`
      SELECT 
        p.id,
        CONCAT(e.nombre, ' - ', u.codigo) as unidad,
        p.monto,
        p.fecha as fecha,
        'Pago recibido' as tipo,
        p.medio as metodo
      FROM pago p
      INNER JOIN unidad u ON u.id = p.unidad_id
      INNER JOIN edificio e ON e.id = u.edificio_id
      WHERE e.comunidad_id = ?
      ORDER BY p.fecha DESC
      LIMIT 5
    `, [id]);
    
    // Construir respuesta del dashboard
    const dashboard = {
      comunidad: comunidad[0],
      resumen: {
        unidades: {
          total: unidades[0]?.total || 0,
          activas: unidades[0]?.activas || 0,
          inactivas: unidades[0]?.inactivas || 0
        },
        residentes: {
          total: residentes[0]?.total || 0,
          propietarios: residentes[0]?.propietarios || 0,
          residentes: residentes[0]?.residentes || 0,
          administradores: residentes[0]?.administradores || 0
        },
        finanzas: {
          ingresosMes: parseFloat(finanzas[0]?.ingresosMes || 0),
          ingresosCobrados: parseFloat(finanzas[0]?.ingresosCobrados || 0),
          gastosMes: parseFloat(finanzas[0]?.gastosMes || 0),
          saldoPendiente: parseFloat(finanzas[0]?.saldoPendiente || 0),
          balanceMes: parseFloat(finanzas[0]?.ingresosCobrados || 0) - parseFloat(finanzas[0]?.gastosMes || 0)
        }
      },
      cargosPendientes: cargosPendientes.map(c => ({
        ...c,
        monto: parseFloat(c.monto),
        saldo: parseFloat(c.saldo)
      })),
      actividadReciente: actividadReciente.map(a => ({
        ...a,
        monto: parseFloat(a.monto)
      }))
    };
    
    res.json(dashboard);
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/amenidades:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener amenidades de una comunidad
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
    
    const query = `
      SELECT 
          a.id,
          a.nombre,
          a.reglas as descripcion,
          CASE 
              WHEN a.requiere_aprobacion = 1 THEN 'Mantenimiento'
              ELSE 'Disponible'
          END as estado,
          TIME_FORMAT(a.created_at, '%H:%i') as horarioInicio,
          TIME_FORMAT(DATE_ADD(a.created_at, INTERVAL 8 HOUR), '%H:%i') as horarioFin,
          a.requiere_aprobacion as requiereReserva,
          a.tarifa as costoReserva
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
 *         description: Lista de edificios
 */
router.get('/:id/edificios', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT 
          e.id,
          e.nombre,
          e.direccion,
          e.codigo,
          e.created_at as fechaCreacion
      FROM edificio e
      WHERE e.comunidad_id = ?
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
    
    const query = `
      SELECT 
          1 as id,
          'Administración' as nombre,
          'Administrador' as cargo,
          c.telefono_contacto as telefono,
          c.email_contacto as email,
          1 as esContactoPrincipal
      FROM comunidad c
      WHERE c.id = ?`;
    
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
    
    const query = `
      SELECT 
          d.id,
          d.titulo as nombre,
          d.tipo,
          d.url,
          d.periodo,
          d.visibilidad,
          d.created_at as fechaSubida
      FROM documento d
      WHERE d.comunidad_id = ?
      ORDER BY d.created_at DESC`;
    
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
 *     summary: Obtener residentes de una comunidad
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
 *         description: Lista de residentes
 */
// Alias para compatibilidad
router.get('/:id/miembros', authenticate, async (req, res) => {
  req.url = req.url.replace('/miembros', '/residentes');
  return router.handle(req, res);
});

router.get('/:id/residentes', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT 
          p.id,
          CONCAT(p.nombres, ' ', p.apellidos) as nombre,
          COALESCE(CONCAT(e.nombre, '-', u.codigo), 'Sin unidad') as unidad,
          r.codigo as tipo,
          tu.tipo as tipo_tenencia,
          p.telefono,
          p.email,
          CASE 
              WHEN ucr.activo = 1 THEN 'Activo'
              ELSE 'Inactivo'
          END as estado
      FROM persona p
      INNER JOIN usuario u_table ON u_table.persona_id = p.id
      INNER JOIN usuario_comunidad_rol ucr ON ucr.usuario_id = u_table.id
      INNER JOIN rol r ON r.id = ucr.rol_id
      LEFT JOIN titulares_unidad tu ON tu.persona_id = p.id AND tu.comunidad_id = ucr.comunidad_id
      LEFT JOIN unidad u ON u.id = tu.unidad_id
      LEFT JOIN edificio e ON e.id = u.edificio_id
      WHERE ucr.comunidad_id = ?
      ORDER BY r.nivel_acceso, p.apellidos, p.nombres`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching residents:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /comunidades/{id}/parametros:
 *   get:
 *     tags: [Comunidades]
 *     summary: Obtener parámetros de cobranza de una comunidad
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
 */
router.get('/:id/parametros', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT 
          ci.id,
          ci.comunidad_id as comunidadId,
          ci.aplica_desde,
          ci.tasa_mensual as tasaMora,
          ci.metodo as calculoInteres,
          COALESCE(ci.tope_mensual, 50.0) as interesMaximo,
          'capital' as aplicacionInteres,
          'normal' as tipoRedondeo,
          'antiguos' as politicaPago,
          'interes-capital' as ordenAplicacion,
          5 as diaEmision,
          25 as diaVencimiento,
          1 as notificacionesAuto,
          ci.created_at as fechaCreacion,
          ci.updated_at as fechaActualizacion
      FROM configuracion_interes ci
      WHERE ci.comunidad_id = ?`;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows.length ? rows[0] : null);
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
 *         description: Estadísticas financieras del mes actual
 */
router.get('/:id/estadisticas', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    
    const query = `
      SELECT 
          -- Ingresos totales del mes actual
          SUM(cu.monto_total) as totalIngresos,
          SUM(CASE WHEN cu.estado = 'pagado' THEN cu.monto_total ELSE 0 END) as ingresosPagados,
          SUM(CASE WHEN cu.estado IN ('pendiente', 'parcial') THEN cu.saldo ELSE 0 END) as ingresosPendientes,
          
          -- Gastos por tipo del mes actual
          COALESCE((SELECT SUM(g2.monto) 
                    FROM gasto g2 
                    INNER JOIN categoria_gasto gc2 ON g2.categoria_id = gc2.id
                    WHERE g2.comunidad_id = ? 
                    AND gc2.nombre = 'Servicios Básicos'
                    AND MONTH(g2.fecha) = MONTH(CURDATE()) 
                    AND YEAR(g2.fecha) = YEAR(CURDATE())), 0) as serviciosBasicos,
                    
          COALESCE((SELECT SUM(g3.monto) 
                    FROM gasto g3 
                    INNER JOIN categoria_gasto gc3 ON g3.categoria_id = gc3.id
                    WHERE g3.comunidad_id = ? 
                    AND gc3.nombre = 'Mantenimiento'
                    AND MONTH(g3.fecha) = MONTH(CURDATE()) 
                    AND YEAR(g3.fecha) = YEAR(CURDATE())), 0) as mantenimiento,
                    
          COALESCE((SELECT SUM(g4.monto) 
                    FROM gasto g4 
                    INNER JOIN categoria_gasto gc4 ON g4.categoria_id = gc4.id
                    WHERE g4.comunidad_id = ? 
                    AND gc4.nombre = 'Administración'
                    AND MONTH(g4.fecha) = MONTH(CURDATE()) 
                    AND YEAR(g4.fecha) = YEAR(CURDATE())), 0) as administracion
          
      FROM cargo_unidad cu
      WHERE cu.comunidad_id = ?
          AND MONTH(cu.created_at) = MONTH(CURDATE()) 
          AND YEAR(cu.created_at) = YEAR(CURDATE())`;
    
    const [rows] = await db.query(query, [id, id, id, id]);
    res.json(rows.length ? rows[0] : {
      totalIngresos: 0,
      ingresosPagados: 0,
      ingresosPendientes: 0,
      serviciosBasicos: 0,
      mantenimiento: 0,
      administracion: 0
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
 *     summary: Obtener flujo de caja de los últimos 6 meses
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
    
    const query = `
      SELECT 
          DATE_FORMAT(mes.fecha, '%Y-%m') as mes,
          COALESCE(ingresos.total, 0) as ingresos,
          COALESCE(gastos.total, 0) as gastos,
          (COALESCE(ingresos.total, 0) - COALESCE(gastos.total, 0)) as flujoNeto
      FROM (
          SELECT DATE_SUB(CURDATE(), INTERVAL n MONTH) as fecha
          FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) meses
      ) mes
      LEFT JOIN (
          SELECT 
              DATE_FORMAT(cu.created_at, '%Y-%m') as mes,
              SUM(cu.monto_total) as total
          FROM cargo_unidad cu
          INNER JOIN unidad u ON u.id = cu.unidad_id
          INNER JOIN edificio e ON e.id = u.edificio_id
          WHERE e.comunidad_id = ?
              AND cu.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(cu.created_at, '%Y-%m')
      ) ingresos ON DATE_FORMAT(mes.fecha, '%Y-%m') = ingresos.mes
      LEFT JOIN (
          SELECT 
              DATE_FORMAT(g.fecha, '%Y-%m') as mes,
              SUM(g.monto) as total
          FROM gasto g
          WHERE g.comunidad_id = ?
              AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(g.fecha, '%Y-%m')
      ) gastos ON DATE_FORMAT(mes.fecha, '%Y-%m') = gastos.mes
      ORDER BY mes.fecha`;
    
    const [rows] = await db.query(query, [id, id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cash flow:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
