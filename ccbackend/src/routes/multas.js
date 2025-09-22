const express = require('express');
const router = express.Router();
const db = require('../db');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

/**
 * @openapi
 * /unidades/{unidadId}/multas:
 *   get:
 *     tags: [Multas]
 *     summary: Listar multas de una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de multas
 */
router.get('/unidad/:unidadId', authenticate, async (req, res) => { const unidadId = req.params.unidadId; const [rows] = await db.query('SELECT id, motivo, monto, estado, fecha FROM multa WHERE unidad_id = ? ORDER BY fecha DESC LIMIT 200', [unidadId]); res.json(rows); });

/**
 * @openapi
 * /unidades/{unidadId}/multas:
 *   post:
 *     tags: [Multas]
 *     summary: Crear una multa para una unidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadId
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
 *               persona_id:
 *                 type: integer
 *               motivo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               monto:
 *                 type: number
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/unidad/:unidadId', [authenticate, authorize('admin','superadmin'), body('motivo').notEmpty(), body('monto').isNumeric(), body('fecha').notEmpty()], async (req, res) => { const unidadId = req.params.unidadId; const { persona_id, motivo, descripcion, monto, fecha } = req.body; try { const [result] = await db.query('INSERT INTO multa (comunidad_id, unidad_id, persona_id, motivo, descripcion, monto, fecha) SELECT unidad.comunidad_id, ?, ?, ?, ?, ?, ? FROM unidad WHERE id = ?',[unidadId, persona_id || null, motivo, descripcion || null, monto, fecha, unidadId]); const [row] = await db.query('SELECT id, motivo, monto, estado FROM multa WHERE id = ? LIMIT 1',[result.insertId]); res.status(201).json(row[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.get('/:id', authenticate, async (req, res) => { const id = req.params.id; const [rows] = await db.query('SELECT * FROM multa WHERE id = ? LIMIT 1', [id]); if (!rows.length) return res.status(404).json({ error: 'not found' }); res.json(rows[0]); });

router.patch('/:id', authenticate, authorize('admin','superadmin'), async (req, res) => { const id = req.params.id; const fields = ['estado','fecha_pago','monto','motivo','descripcion']; const updates=[]; const values=[]; fields.forEach(f=>{ if (req.body[f]!==undefined){ updates.push(`${f} = ?`); values.push(req.body[f]); }}); if (!updates.length) return res.status(400).json({ error: 'no fields' }); values.push(id); try { await db.query(`UPDATE multa SET ${updates.join(', ')} WHERE id = ?`, values); const [rows] = await db.query('SELECT id, motivo, monto, estado FROM multa WHERE id = ? LIMIT 1',[id]); res.json(rows[0]); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

router.delete('/:id', authenticate, authorize('superadmin','admin'), async (req, res) => { const id = req.params.id; try { await db.query('DELETE FROM multa WHERE id = ?', [id]); res.status(204).end(); } catch (err) { console.error(err); res.status(500).json({ error: 'server error' }); } });

// ✅ AGREGAR AL INICIO - Endpoint general para admins/superadmin
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('🔍 GET /multas - Listando todas las multas');
    console.log('👤 Usuario:', req.user?.id, 'Username:', req.user?.username);
    
    // ✅ QUERY CORREGIDA con razon_social
    let query = `
      SELECT 
        m.*,
        c.razon_social as comunidad_nombre,
        CONCAT('Unidad ', m.unidad_id) as unidad_numero
      FROM multa m
      LEFT JOIN comunidad c ON m.comunidad_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // 🔒 Filtros por rol
    if (!req.user?.is_superadmin) {
      console.log('🔒 Usuario NO es superadmin, aplicando filtros');
      
      if (req.user?.memberships && req.user.memberships.length > 0) {
        const comunidadIds = req.user.memberships.map(m => m.comunidadId || m.comunidad_id);
        console.log('🏢 Comunidades del usuario:', comunidadIds);
        
        if (comunidadIds.length > 0) {
          const placeholders = comunidadIds.map(() => '?').join(',');
          query += ` AND m.comunidad_id IN (${placeholders})`;
          params.push(...comunidadIds);
        }
      } else {
        console.log('⚠️ Usuario sin membresías válidas');
        return res.status(403).json({ 
          error: 'Sin permisos para ver multas',
          message: 'El usuario no tiene membresías activas'
        });
      }
    } else {
      console.log('👑 Usuario superadmin, puede ver todas las multas');
    }
    
    // Filtros opcionales de query
    if (req.query.comunidad_id) {
      query += ' AND m.comunidad_id = ?';
      params.push(req.query.comunidad_id);
    }
    
    if (req.query.estado) {
      query += ' AND m.estado = ?';
      params.push(req.query.estado);
    }
    
    if (req.query.search) {
      query += ' AND (m.motivo LIKE ? OR m.descripcion LIKE ?)';

      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // Ordenar y limitar
    query += ' ORDER BY m.created_at DESC LIMIT 200';
    
    console.log('🔍 Query SQL final:', query);
    console.log('🔍 Parámetros:', params);
    
    const [rows] = await db.query(query, params);
    
    console.log(`✅ ${rows.length} multas encontradas para usuario ${req.user?.username}`);
    console.log('📋 Primera multa (muestra):', rows[0]);
    
    res.json(rows);
    
  } catch (error) {
    console.error('❌ Error detallado en GET /multas:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ AGREGAR: Endpoint de estadísticas para dashboard
router.get('/estadisticas', authenticate, async (req, res) => {
  try {
    console.log('📊 GET /multas/estadisticas');
    console.log('👤 Usuario:', req.user?.id, req.user?.username);
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    // 🔒 Filtrar por rol
    if (!req.user?.is_superadmin) {
      if (req.user?.memberships && req.user.memberships.length > 0) {
        const comunidadIds = req.user.memberships.map(m => m.comunidadId || m.comunidad_id);
        console.log('🏢 Estadísticas para comunidades:', comunidadIds);
        
        const placeholders = comunidadIds.map(() => '?').join(',');
        whereClause += ` AND comunidad_id IN (${placeholders})`;
        params.push(...comunidadIds);
      } else {
        return res.status(403).json({ error: 'Sin permisos' });
      }
    }
    
    // Filtro opcional por comunidad específica
    if (req.query.comunidad_id) {
      whereClause += ' AND comunidad_id = ?';
      params.push(req.query.comunidad_id);
    }
    
    console.log('📊 Query estadísticas:', whereClause);
    console.log('📊 Parámetros estadísticas:', params);
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'pagado' THEN 1 END) as pagadas,
        COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as vencidas,
        COUNT(CASE WHEN estado = 'anulada' THEN 1 END) as anuladas,
        COALESCE(SUM(monto), 0) as monto_total,
        COALESCE(SUM(CASE WHEN estado = 'pagado' THEN monto ELSE 0 END), 0) as monto_recaudado,
        COALESCE(SUM(CASE WHEN estado IN ('pendiente', 'vencido') THEN monto ELSE 0 END), 0) as monto_pendiente
      FROM multa 
      ${whereClause}
    `, params);
    
    const estadisticas = {
      total: stats[0].total,
      pendientes: stats[0].pendientes,
      pagadas: stats[0].pagadas,
      vencidas: stats[0].vencidas,
      apeladas: 0,
      anuladas: stats[0].anuladas,
      monto_total: parseFloat(stats[0].monto_total || 0),
      monto_pendiente: parseFloat(stats[0].monto_pendiente || 0),
      monto_recaudado: parseFloat(stats[0].monto_recaudado || 0),
      monto_vencido: 0
    };
    
    console.log('✅ Estadísticas calculadas:', estadisticas);
    res.json(estadisticas);
    
  } catch (error) {
    console.error('❌ Error calculando estadísticas:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
