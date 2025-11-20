/**
 * @file valor_utm.js
 * @description Rutas para consulta y estadísticas de valores UTM
 * @module routes/valor_utm
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { body, validationResult } = require('express-validator');
const logger = require('../logger');

/**
 * @swagger
 * tags:
 *   - name: UTM
 *     description: Valores UTM, conversiones y estadísticas económicas
 */

// ==========================================
// 1. CONSULTAS BÁSICAS DE VALOR UTM
// ==========================================

/**
 * @route GET /api/valor-utm/actual
 * @description Obtiene el valor UTM más reciente
 * @access Private
 */
router.get('/actual', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        fecha,
        valor,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano,
        DATE_FORMAT(fecha, '%M %Y') as periodo
      FROM utm_valor
      ORDER BY fecha DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay valores UTM disponibles',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error('Error al obtener valor UTM actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el valor UTM actual',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/periodo/:mes/:ano
 * @description Obtiene el valor UTM de un mes y año específico
 * @access Private
 * @param {number} mes - Mes (1-12)
 * @param {number} ano - Año (ej: 2025)
 */
router.get('/periodo/:mes/:ano', authenticate, async (req, res) => {
  try {
    const { mes, ano } = req.params;

    // Validaciones
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'El mes debe estar entre 1 y 12',
      });
    }

    if (anoNum < 2000 || anoNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Año inválido',
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        fecha,
        valor,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano,
        DATE_FORMAT(fecha, '%M %Y') as periodo
      FROM utm_valor
      WHERE YEAR(fecha) = ? AND MONTH(fecha) = ?
      ORDER BY fecha DESC
      LIMIT 1
    `,
      [anoNum, mesNum]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay valores UTM disponibles para ${mes}/${ano}`,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error('Error al obtener valor UTM por período:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el valor UTM',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/rango
 * @description Obtiene valores UTM de los últimos N meses
 * @access Private
 * @query {number} meses - Cantidad de meses (default: 12, max: 60)
 */
router.get('/rango', authenticate, async (req, res) => {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 12, 60);

    const [rows] = await db.query(
      `
      SELECT 
        fecha,
        valor,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano,
        DATE_FORMAT(fecha, '%M %Y') as periodo
      FROM utm_valor
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      ORDER BY fecha DESC
    `,
      [meses]
    );

    res.json({
      success: true,
      cantidad: rows.length,
      meses_solicitados: meses,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener rango de valores UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el rango de valores UTM',
      error: error.message,
    });
  }
});

// ==========================================
// 2. HISTÓRICO ANUAL
// ==========================================

/**
 * @route GET /api/valor-utm/historico/:ano
 * @description Obtiene todos los valores UTM de un año específico
 * @access Private
 * @param {number} ano - Año a consultar
 */
router.get('/historico/:ano', authenticate, async (req, res) => {
  try {
    const { ano } = req.params;
    const anoNum = parseInt(ano);

    if (anoNum < 2000 || anoNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Año inválido',
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        fecha,
        valor,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano,
        DATE_FORMAT(fecha, '%M') as mes_nombre
      FROM utm_valor
      WHERE YEAR(fecha) = ?
      ORDER BY fecha ASC
    `,
      [anoNum]
    );

    res.json({
      success: true,
      ano: anoNum,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener histórico anual UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el histórico anual',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/resumen-anual/:ano
 * @description Obtiene resumen estadístico de un año
 * @access Private
 * @param {number} ano - Año a consultar
 */
router.get('/resumen-anual/:ano', authenticate, async (req, res) => {
  try {
    const { ano } = req.params;
    const anoNum = parseInt(ano);

    const [rows] = await db.query(
      `
      SELECT 
        YEAR(fecha) as ano,
        COUNT(*) as total_registros,
        COUNT(DISTINCT MONTH(fecha)) as meses_disponibles,
        MIN(valor) as valor_minimo,
        MAX(valor) as valor_maximo,
        ROUND(AVG(valor), 2) as valor_promedio,
        ROUND(MAX(valor) - MIN(valor), 2) as variacion_total,
        ROUND(((MAX(valor) - MIN(valor)) / MIN(valor)) * 100, 2) as variacion_porcentual,
        MIN(fecha) as fecha_inicio,
        MAX(fecha) as fecha_fin
      FROM utm_valor
      WHERE YEAR(fecha) = ?
      GROUP BY YEAR(fecha)
    `,
      [anoNum]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No hay datos disponibles para el año ${ano}`,
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error('Error al obtener resumen anual UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen anual',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/resumen-anos
 * @description Obtiene resumen de todos los años disponibles
 * @access Private
 */
router.get('/resumen-anos', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        YEAR(fecha) as ano,
        COUNT(*) as total_registros,
        COUNT(DISTINCT MONTH(fecha)) as meses_disponibles,
        MIN(valor) as valor_minimo,
        MAX(valor) as valor_maximo,
        ROUND(AVG(valor), 2) as valor_promedio,
        ROUND(MAX(valor) - MIN(valor), 2) as variacion_total,
        ROUND(((MAX(valor) - MIN(valor)) / MIN(valor)) * 100, 2) as variacion_porcentual,
        MIN(fecha) as fecha_inicio,
        MAX(fecha) as fecha_fin
      FROM utm_valor
      GROUP BY YEAR(fecha)
      ORDER BY ano DESC
    `);

    res.json({
      success: true,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener resumen de años UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen de años',
      error: error.message,
    });
  }
});

// ==========================================
// 3. VARIACIONES Y TENDENCIAS
// ==========================================

/**
 * @route GET /api/valor-utm/variacion-mensual
 * @description Obtiene variación mensual de los últimos N meses
 * @access Private
 * @query {number} meses - Cantidad de meses (default: 12)
 */
router.get('/variacion-mensual', authenticate, async (req, res) => {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 12, 24);

    const [rows] = await db.query(
      `
      SELECT 
        t1.fecha,
        t1.valor as valor_actual,
        t1.mes,
        t1.ano,
        t1.periodo,
        t2.valor as valor_anterior,
        t2.periodo as periodo_anterior,
        CASE 
          WHEN t2.valor IS NOT NULL 
          THEN ROUND(t1.valor - t2.valor, 2)
          ELSE NULL
        END as variacion_absoluta,
        CASE 
          WHEN t2.valor IS NOT NULL AND t2.valor > 0
          THEN ROUND(((t1.valor - t2.valor) / t2.valor) * 100, 4)
          ELSE NULL
        END as variacion_porcentual
      FROM (
        SELECT 
          fecha,
          valor,
          MONTH(fecha) as mes,
          YEAR(fecha) as ano,
          DATE_FORMAT(fecha, '%M %Y') as periodo
        FROM utm_valor
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      ) t1
      LEFT JOIN (
        SELECT 
          fecha,
          valor,
          DATE_FORMAT(fecha, '%M %Y') as periodo,
          DATE_ADD(fecha, INTERVAL 1 MONTH) as fecha_siguiente
        FROM utm_valor
      ) t2 ON DATE_FORMAT(t1.fecha, '%Y-%m') = DATE_FORMAT(t2.fecha_siguiente, '%Y-%m')
      ORDER BY t1.fecha DESC
      LIMIT ?
    `,
      [meses + 1, meses]
    );

    res.json({
      success: true,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener variación mensual UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la variación mensual',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/variacion-interanual/:ano
 * @description Obtiene variación interanual (comparación con año anterior)
 * @access Private
 * @param {number} ano - Año a comparar
 */
router.get('/variacion-interanual/:ano', authenticate, async (req, res) => {
  try {
    const { ano } = req.params;
    const anoNum = parseInt(ano);
    const anoAnterior = anoNum - 1;

    const [rows] = await db.query(
      `
      SELECT 
        t1.fecha as fecha_actual,
        t1.valor as valor_actual,
        t1.periodo as periodo_actual,
        t2.fecha as fecha_anterior,
        t2.valor as valor_anterior,
        t2.periodo as periodo_anterior,
        ROUND(t1.valor - IFNULL(t2.valor, 0), 2) as variacion_absoluta,
        CASE 
          WHEN t2.valor IS NOT NULL AND t2.valor > 0
          THEN ROUND(((t1.valor - t2.valor) / t2.valor) * 100, 4)
          ELSE NULL
        END as variacion_porcentual_anual
      FROM (
        SELECT 
          fecha,
          valor,
          MONTH(fecha) as mes,
          DATE_FORMAT(fecha, '%M %Y') as periodo
        FROM utm_valor
        WHERE YEAR(fecha) = ?
      ) t1
      LEFT JOIN (
        SELECT 
          fecha,
          valor,
          DATE_FORMAT(fecha, '%M %Y') as periodo,
          MONTH(fecha) as mes
        FROM utm_valor
        WHERE YEAR(fecha) = ?
      ) t2 ON t1.mes = t2.mes
      ORDER BY t1.fecha ASC
    `,
      [anoNum, anoAnterior]
    );

    res.json({
      success: true,
      ano_actual: anoNum,
      ano_comparacion: anoAnterior,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener variación interanual UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la variación interanual',
      error: error.message,
    });
  }
});

// ==========================================
// 4. ANÁLISIS TRIMESTRAL Y SEMESTRAL
// ==========================================

/**
 * @route GET /api/valor-utm/trimestral
 * @description Obtiene análisis trimestral de los últimos N meses
 * @access Private
 * @query {number} meses - Cantidad de meses (default: 24)
 */
router.get('/trimestral', authenticate, async (req, res) => {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 24, 60);

    const [rows] = await db.query(
      `
      SELECT 
        ano,
        trimestre,
        periodo,
        registros,
        valor_minimo,
        valor_maximo,
        ROUND(valor_promedio, 2) as valor_promedio,
        variacion_trimestre
      FROM (
        SELECT 
          YEAR(fecha) as ano,
          QUARTER(fecha) as trimestre,
          CONCAT('Q', QUARTER(fecha), ' ', YEAR(fecha)) as periodo,
          COUNT(*) as registros,
          MIN(valor) as valor_minimo,
          MAX(valor) as valor_maximo,
          AVG(valor) as valor_promedio,
          ROUND(MAX(valor) - MIN(valor), 2) as variacion_trimestre
        FROM utm_valor
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        GROUP BY YEAR(fecha), QUARTER(fecha)
      ) as trimestral
      ORDER BY ano DESC, trimestre DESC
    `,
      [meses]
    );

    res.json({
      success: true,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener análisis trimestral UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el análisis trimestral',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/semestral
 * @description Obtiene análisis semestral desde un año específico
 * @access Private
 * @query {number} desde - Año inicial (default: año actual - 3)
 */
router.get('/semestral', authenticate, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const desde = parseInt(req.query.desde) || currentYear - 3;

    const [rows] = await db.query(
      `
      SELECT 
        ano,
        semestre_num,
        semestre_nombre,
        registros,
        valor_minimo,
        valor_maximo,
        ROUND(valor_promedio, 2) as valor_promedio
      FROM (
        SELECT 
          YEAR(fecha) as ano,
          IF(MONTH(fecha) <= 6, 1, 2) as semestre_num,
          IF(MONTH(fecha) <= 6, 'Primer Semestre', 'Segundo Semestre') as semestre_nombre,
          COUNT(*) as registros,
          MIN(valor) as valor_minimo,
          MAX(valor) as valor_maximo,
          AVG(valor) as valor_promedio
        FROM utm_valor
        WHERE YEAR(fecha) >= ?
        GROUP BY YEAR(fecha), IF(MONTH(fecha) <= 6, 1, 2)
      ) as semestral
      ORDER BY ano DESC, semestre_num DESC
    `,
      [desde]
    );

    res.json({
      success: true,
      desde_ano: desde,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener análisis semestral UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el análisis semestral',
      error: error.message,
    });
  }
});

// ==========================================
// 5. COMPARACIONES ENTRE AÑOS
// ==========================================

/**
 * @route GET /api/valor-utm/comparacion-anos
 * @description Compara valores UTM de múltiples años por mes
 * @access Private
 * @query {string} anos - Años a comparar separados por coma (ej: "2021,2022,2023,2024,2025")
 */
router.get('/comparacion-anos', authenticate, async (req, res) => {
  try {
    const { anos } = req.query;

    // Si no se especifican años, usar los últimos 5
    let anosArray;
    if (anos) {
      anosArray = anos
        .split(',')
        .map((a) => parseInt(a.trim()))
        .filter((a) => !isNaN(a));
    } else {
      const currentYear = new Date().getFullYear();
      anosArray = [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
        currentYear - 4,
      ];
    }

    if (anosArray.length === 0 || anosArray.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar entre 1 y 10 años para comparar',
      });
    }

    // Construir consulta dinámica con CASE para cada año
    const caseClauses = anosArray
      .map((ano) => `MAX(CASE WHEN ano = ${ano} THEN valor END) as '${ano}'`)
      .join(',\n        ');

    const query = `
      SELECT 
        mes,
        mes_nombre,
        ${caseClauses}
      FROM (
        SELECT 
          MONTH(fecha) as mes,
          DATE_FORMAT(fecha, '%M') as mes_nombre,
          YEAR(fecha) as ano,
          MIN(valor) as valor
        FROM utm_valor
        WHERE YEAR(fecha) IN (${anosArray.join(',')})
        GROUP BY YEAR(fecha), MONTH(fecha)
      ) as datos_anuales
      GROUP BY mes, mes_nombre
      ORDER BY mes ASC
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      anos_comparados: anosArray,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al comparar años UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comparar años',
      error: error.message,
    });
  }
});

// ==========================================
// 6. ESTADÍSTICAS Y RANKINGS
// ==========================================

/**
 * @route GET /api/valor-utm/top-valores
 * @description Obtiene los valores UTM más altos y más bajos
 * @access Private
 * @query {number} limit - Cantidad de registros (default: 10, max: 50)
 */
router.get('/top-valores', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Valores más altos
    const [mayores] = await db.query(
      `
      SELECT 
        fecha,
        valor,
        DATE_FORMAT(fecha, '%M %Y') as periodo,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano
      FROM utm_valor
      ORDER BY valor DESC
      LIMIT ?
    `,
      [limit]
    );

    // Valores más bajos
    const [menores] = await db.query(
      `
      SELECT 
        fecha,
        valor,
        DATE_FORMAT(fecha, '%M %Y') as periodo,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano
      FROM utm_valor
      ORDER BY valor ASC
      LIMIT ?
    `,
      [limit]
    );

    res.json({
      success: true,
      limit,
      mayores: mayores,
      menores: menores,
    });
  } catch (error) {
    logger.error('Error al obtener top valores UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los valores extremos',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/estadisticas
 * @description Obtiene estadísticas generales por año
 * @access Private
 */
router.get('/estadisticas', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        YEAR(fecha) as ano,
        COUNT(*) as registros,
        ROUND(AVG(valor), 2) as promedio,
        MIN(valor) as minimo,
        MAX(valor) as maximo,
        ROUND(STDDEV(valor), 2) as desviacion_estandar,
        ROUND((STDDEV(valor) / AVG(valor)) * 100, 2) as coeficiente_variacion
      FROM utm_valor
      GROUP BY YEAR(fecha)
      ORDER BY ano DESC
    `);

    res.json({
      success: true,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
});

// ==========================================
// 7. DASHBOARD Y RESUMEN EJECUTIVO
// ==========================================

/**
 * @route GET /api/valor-utm/dashboard
 * @description Obtiene KPIs principales para dashboard
 * @access Private
 * @query {number} meses - Cantidad de meses (default: 12)
 */
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 12, 24);

    const [kpis] = await db.query(
      `
      SELECT 
        COUNT(*) as meses_registrados,
        MIN(valor) as valor_minimo,
        MAX(valor) as valor_maximo,
        ROUND(AVG(valor), 2) as valor_promedio,
        ROUND(MAX(valor) - MIN(valor), 2) as rango,
        ROUND(((MAX(valor) - MIN(valor)) / MIN(valor)) * 100, 2) as variacion_porcentual,
        MIN(fecha) as fecha_desde,
        MAX(fecha) as fecha_hasta,
        DATE_FORMAT(MIN(fecha), '%M %Y') as periodo_desde,
        DATE_FORMAT(MAX(fecha), '%M %Y') as periodo_hasta
      FROM utm_valor
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    `,
      [meses]
    );

    // Últimos 5 valores con variación
    const [ultimos] = await db.query(`
      SELECT 
        t.fecha,
        t.valor,
        t.periodo,
        ROUND(t.valor - LAG(t.valor) OVER (ORDER BY t.fecha), 2) as variacion,
        ROUND(((t.valor - LAG(t.valor) OVER (ORDER BY t.fecha)) / 
               LAG(t.valor) OVER (ORDER BY t.fecha)) * 100, 4) as variacion_porcentual
      FROM (
        SELECT 
          fecha,
          valor,
          DATE_FORMAT(fecha, '%M %Y') as periodo
        FROM utm_valor
        ORDER BY fecha DESC
        LIMIT 6
      ) t
      ORDER BY t.fecha DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      kpis: kpis[0],
      ultimos_valores: ultimos,
    });
  } catch (error) {
    logger.error('Error al obtener dashboard UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/grafico
 * @description Obtiene datos formateados para gráficos
 * @access Private
 * @query {number} meses - Cantidad de meses (default: 24)
 */
router.get('/grafico', authenticate, async (req, res) => {
  try {
    const meses = Math.min(parseInt(req.query.meses) || 24, 60);

    const [rows] = await db.query(
      `
      SELECT 
        fecha,
        valor,
        DATE_FORMAT(fecha, '%Y-%m') as periodo_corto,
        DATE_FORMAT(fecha, '%b %Y') as periodo_formato,
        MONTH(fecha) as mes,
        YEAR(fecha) as ano
      FROM utm_valor
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      ORDER BY fecha ASC
    `,
      [meses]
    );

    res.json({
      success: true,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener datos para gráfico UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos para el gráfico',
      error: error.message,
    });
  }
});

// ==========================================
// 8. CONVERSIONES Y CÁLCULOS
// ==========================================

/**
 * @route GET /api/valor-utm/conversion/tabla
 * @description Obtiene tabla de conversión con valores comunes
 * @access Private
 */
router.get('/conversion/tabla', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        fecha,
        valor as valor_utm,
        DATE_FORMAT(fecha, '%M %Y') as periodo,
        ROUND(valor * 1, 2) as utm_1,
        ROUND(valor * 5, 2) as utm_5,
        ROUND(valor * 10, 2) as utm_10,
        ROUND(valor * 25, 2) as utm_25,
        ROUND(valor * 50, 2) as utm_50,
        ROUND(valor * 100, 2) as utm_100,
        ROUND(valor * 500, 2) as utm_500,
        ROUND(valor * 1000, 2) as utm_1000
      FROM utm_valor
      ORDER BY fecha DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay valores UTM disponibles',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error('Error al obtener tabla de conversión UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la tabla de conversión',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/conversion/pesos-a-utm
 * @description Convierte pesos a UTM usando el valor actual
 * @access Private
 * @query {number} pesos - Monto en pesos chilenos
 */
router.get('/conversion/pesos-a-utm', authenticate, async (req, res) => {
  try {
    const { pesos } = req.query;

    if (!pesos || isNaN(pesos)) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar un monto válido en pesos',
      });
    }

    const montoPesos = parseFloat(pesos);

    const [rows] = await db.query(
      `
      SELECT 
        ? as monto_pesos,
        valor as valor_utm,
        fecha,
        DATE_FORMAT(fecha, '%M %Y') as periodo,
        ROUND(? / valor, 4) as equivalente_utm
      FROM utm_valor
      ORDER BY fecha DESC
      LIMIT 1
    `,
      [montoPesos, montoPesos]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay valores UTM disponibles para realizar la conversión',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error('Error al convertir pesos a UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la conversión',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/valor-utm/conversion/utm-a-pesos
 * @description Convierte UTM a pesos usando el valor actual
 * @access Private
 * @query {number} utm - Cantidad de UTM
 */
router.get('/conversion/utm-a-pesos', authenticate, async (req, res) => {
  try {
    const { utm } = req.query;

    if (!utm || isNaN(utm)) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar una cantidad válida de UTM',
      });
    }

    const cantidadUtm = parseFloat(utm);

    const [rows] = await db.query(
      `
      SELECT 
        ? as cantidad_utm,
        valor as valor_utm,
        fecha,
        DATE_FORMAT(fecha, '%M %Y') as periodo,
        ROUND(? * valor, 2) as equivalente_pesos
      FROM utm_valor
      ORDER BY fecha DESC
      LIMIT 1
    `,
      [cantidadUtm, cantidadUtm]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay valores UTM disponibles para realizar la conversión',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    logger.error('Error al convertir UTM a pesos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la conversión',
      error: error.message,
    });
  }
});

// ==========================================
// 9. DISPONIBILIDAD DE DATOS
// ==========================================

/**
 * @route GET /api/valor-utm/disponibilidad
 * @description Obtiene información sobre disponibilidad de datos por año
 * @access Private
 */
router.get('/disponibilidad', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        YEAR(fecha) as ano,
        COUNT(*) as total_registros,
        COUNT(DISTINCT MONTH(fecha)) as meses_disponibles,
        MIN(fecha) as primera_fecha,
        MAX(fecha) as ultima_fecha,
        DATEDIFF(MAX(fecha), MIN(fecha)) as dias_rango,
        CASE 
          WHEN COUNT(DISTINCT MONTH(fecha)) = 12 THEN 'Completo'
          WHEN COUNT(DISTINCT MONTH(fecha)) >= 6 THEN 'Parcial'
          ELSE 'Incompleto'
        END as estado_completitud
      FROM utm_valor
      GROUP BY YEAR(fecha)
      ORDER BY ano DESC
    `);

    res.json({
      success: true,
      cantidad: rows.length,
      data: rows,
    });
  } catch (error) {
    logger.error('Error al obtener disponibilidad UTM:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener disponibilidad de datos',
      error: error.message,
    });
  }
});

// =========================================
// CRUD OPERATIONS - POST/PATCH/DELETE
// =========================================

/**
 * @swagger
 * /valor-utm:
 *   post:
 *     tags: [UTM]
 *     summary: Crear nuevo valor UTM
 *     description: Registra un nuevo valor UTM para una fecha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fecha, valor]
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               valor:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Valor UTM creado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo superadmin)
 *       409:
 *         description: Valor UTM duplicado para esa fecha
 *       500:
 *         description: Error servidor
 */
router.post(
  '/',
  [
    authenticate,
    authorize('superadmin'),
    body('fecha')
      .isISO8601()
      .withMessage('fecha debe ser fecha válida')
      .toDate(),
    body('valor')
      .isFloat({ min: 0 })
      .withMessage('valor debe ser número positivo'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { fecha, valor } = req.body;

      // Verificar que no exista valor UTM para esa fecha
      const [duplicate] = await db.query(
        'SELECT id FROM utm_valor WHERE DATE(fecha) = DATE(?)',
        [fecha]
      );
      if (duplicate.length) {
        return res
          .status(409)
          .json({ error: 'Ya existe un valor UTM para esa fecha' });
      }

      // Insertar valor UTM
      const [result] = await db.query(
        `INSERT INTO utm_valor (fecha, valor) VALUES (?, ?)`,
        [fecha, valor]
      );

      // Obtener el valor UTM creado
      const [utm] = await db.query('SELECT * FROM utm_valor WHERE id = ?', [
        result.insertId,
      ]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_nuevos, ip_address)
         VALUES (?, 'INSERT', 'utm_valor', ?, ?, ?)`,
        [req.user.id, result.insertId, JSON.stringify(utm[0]), req.ip]
      );

      res.status(201).json(utm[0]);
    } catch (err) {
      logger.error('Error al crear valor UTM:', err);
      res.status(500).json({ error: 'Error al crear valor UTM' });
    }
  }
);

/**
 * @swagger
 * /valor-utm/{id}:
 *   patch:
 *     tags: [UTM]
 *     summary: Actualizar valor UTM
 *     description: Actualiza el valor UTM existente
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
 *               valor:
 *                 type: number
 *                 format: float
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Valor UTM actualizado exitosamente
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo superadmin)
 *       404:
 *         description: Valor UTM no encontrado
 *       500:
 *         description: Error servidor
 */
router.patch(
  '/:id',
  [
    authenticate,
    authorize('superadmin'),
    body('valor')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('valor debe ser número positivo'),
    body('fecha')
      .optional()
      .isISO8601()
      .withMessage('fecha debe ser fecha válida')
      .toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const utm_id = Number(req.params.id);

      // Obtener valor UTM anterior
      const [utm_anterior] = await db.query(
        'SELECT * FROM utm_valor WHERE id = ?',
        [utm_id]
      );
      if (!utm_anterior.length) {
        return res.status(404).json({ error: 'Valor UTM no encontrado' });
      }

      // Preparar actualización
      const campos = [];
      const valores = [];

      if (req.body.valor !== undefined) {
        campos.push('valor = ?');
        valores.push(req.body.valor);
      }
      if (req.body.fecha !== undefined) {
        campos.push('fecha = ?');
        valores.push(req.body.fecha);
      }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      valores.push(utm_id);

      // Ejecutar actualización
      await db.query(
        `UPDATE utm_valor SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        valores
      );

      // Obtener valor UTM actualizado
      const [utm_actualizado] = await db.query(
        'SELECT * FROM utm_valor WHERE id = ?',
        [utm_id]
      );

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, valores_nuevos, ip_address)
         VALUES (?, 'UPDATE', 'utm_valor', ?, ?, ?, ?)`,
        [
          req.user.id,
          utm_id,
          JSON.stringify(utm_anterior[0]),
          JSON.stringify(utm_actualizado[0]),
          req.ip,
        ]
      );

      res.json(utm_actualizado[0]);
    } catch (err) {
      logger.error('Error al actualizar valor UTM:', err);
      res.status(500).json({ error: 'Error al actualizar valor UTM' });
    }
  }
);

/**
 * @swagger
 * /valor-utm/{id}:
 *   delete:
 *     tags: [UTM]
 *     summary: Eliminar valor UTM
 *     description: Elimina un valor UTM (hard delete - se debe considerar cuidadosamente)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Valor UTM eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo superadmin)
 *       404:
 *         description: Valor UTM no encontrado
 *       500:
 *         description: Error servidor
 */
router.delete(
  '/:id',
  [authenticate, authorize('superadmin')],
  async (req, res) => {
    try {
      const utm_id = Number(req.params.id);

      // Obtener valor UTM anterior
      const [utm] = await db.query('SELECT * FROM utm_valor WHERE id = ?', [
        utm_id,
      ]);
      if (!utm.length) {
        return res.status(404).json({ error: 'Valor UTM no encontrado' });
      }

      // Eliminar valor UTM (hard delete)
      await db.query('DELETE FROM utm_valor WHERE id = ?', [utm_id]);

      // Registrar en auditoría
      await db.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla, registro_id, valores_anteriores, ip_address)
         VALUES (?, 'DELETE', 'utm_valor', ?, ?, ?)`,
        [req.user.id, utm_id, JSON.stringify(utm[0]), req.ip]
      );

      res.status(200).json({ message: 'Valor UTM eliminado exitosamente' });
    } catch (err) {
      logger.error('Error al eliminar valor UTM:', err);
      res.status(500).json({ error: 'Error al eliminar valor UTM' });
    }
  }
);

module.exports = router;

// =========================================
// ENDPOINTS DE VALOR UTM
// // =========================================

// // 1. CONSULTAS BÁSICAS
// GET: /valor-utm/actual
// GET: /valor-utm/periodo/:mes/:ano
// GET: /valor-utm/rango

// // 2. HISTÓRICO ANUAL
// GET: /valor-utm/historico/:ano
// GET: /valor-utm/resumen-anual/:ano
// GET: /valor-utm/resumen-anos

// // 3. VARIACIONES Y TENDENCIAS
// GET: /valor-utm/variacion-mensual
// GET: /valor-utm/variacion-interanual/:ano

// // 4. ANÁLISIS TRIMESTRAL Y SEMESTRAL
// GET: /valor-utm/trimestral
// GET: /valor-utm/semestral

// // 5. COMPARACIONES ENTRE AÑOS
// GET: /valor-utm/comparacion-anos

// // 6. ESTADÍSTICAS Y RANKINGS
// GET: /valor-utm/top-valores
// GET: /valor-utm/estadisticas

// // 7. DASHBOARD Y RESUMEN EJECUTIVO
// GET: /valor-utm/dashboard
// GET: /valor-utm/grafico

// // 8. CONVERSIONES Y CÁLCULOS
// GET: /valor-utm/conversion/tabla
// GET: /valor-utm/conversion/pesos-a-utm
// GET: /valor-utm/conversion/utm-a-pesos

// // 9. DISPONIBILIDAD DE DATOS
// GET: /valor-utm/disponibilidad
