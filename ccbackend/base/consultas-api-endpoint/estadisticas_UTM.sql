-- ==========================================
-- 1. CONSULTAS BÁSICAS DE VALOR UTM
-- ==========================================

-- 1.1. Obtener valor UTM de un mes específico (primera fecha del mes)
SELECT 
    valor,
    fecha,
    MONTH(fecha) as mes,
    YEAR(fecha) as ano
FROM utm_valor
WHERE YEAR(fecha) = 2025 
  AND MONTH(fecha) = 10
ORDER BY fecha ASC
LIMIT 1;

-- 1.2. Obtener todos los valores de un mes (si hay múltiples registros)
SELECT 
    fecha,
    valor,
    DAY(fecha) as dia,
    MONTH(fecha) as mes,
    YEAR(fecha) as ano
FROM utm_valor
WHERE YEAR(fecha) = 2025 
  AND MONTH(fecha) = 10
ORDER BY fecha ASC;

-- 1.3. Obtener valor UTM actual (último registro)
SELECT 
    valor,
    fecha,
    MONTH(fecha) as mes_actual,
    YEAR(fecha) as ano_actual,
    DATE_FORMAT(fecha, '%M %Y') as periodo
FROM utm_valor
ORDER BY fecha DESC
LIMIT 1;


-- ==========================================
-- 2. HISTÓRICO ANUAL
-- ==========================================

-- 2.1. Valores UTM de todo un año (un valor por mes)
SELECT 
    MONTH(fecha) as mes,
    YEAR(fecha) as ano,
    MIN(valor) as valor_min_mes,
    MAX(valor) as valor_max_mes,
    AVG(valor) as valor_promedio_mes,
    COUNT(*) as cantidad_registros,
    MIN(fecha) as primera_fecha,
    MAX(fecha) as ultima_fecha
FROM utm_valor
WHERE YEAR(fecha) = 2025
GROUP BY YEAR(fecha), MONTH(fecha)
ORDER BY mes ASC;

-- 2.2. Resumen anual con estadísticas
SELECT 
    YEAR(fecha) as ano,
    COUNT(*) as total_registros,
    MIN(valor) as valor_minimo,
    MAX(valor) as valor_maximo,
    AVG(valor) as valor_promedio,
    ROUND(MAX(valor) - MIN(valor), 2) as variacion_total,
    ROUND(((MAX(valor) - MIN(valor)) / MIN(valor)) * 100, 2) as variacion_porcentual
FROM utm_valor
WHERE YEAR(fecha) = 2025
GROUP BY YEAR(fecha);


-- ==========================================
-- 3. VARIACIONES Y TENDENCIAS
-- ==========================================

-- 3.1. Variación mensual (mes a mes)
SELECT 
    t1.fecha as fecha_actual,
    t1.valor as valor_actual,
    t2.fecha as fecha_anterior,
    t2.valor as valor_anterior,
    ROUND(t1.valor - t2.valor, 2) as variacion_absoluta,
    ROUND(((t1.valor - t2.valor) / t2.valor) * 100, 4) as variacion_porcentual
FROM utm_valor t1
LEFT JOIN utm_valor t2 ON DATE_SUB(t1.fecha, INTERVAL 1 MONTH) = t2.fecha
WHERE YEAR(t1.fecha) = 2025
ORDER BY t1.fecha ASC;

-- 3.2. Variación interanual (mismo mes, año anterior)
SELECT 
    t1.fecha as fecha_actual,
    t1.valor as valor_actual,
    t2.fecha as fecha_ano_anterior,
    t2.valor as valor_ano_anterior,
    ROUND(t1.valor - t2.valor, 2) as variacion_absoluta,
    ROUND(((t1.valor - t2.valor) / t2.valor) * 100, 4) as variacion_porcentual_anual
FROM utm_valor t1
LEFT JOIN utm_valor t2 ON 
    DATE_SUB(t1.fecha, INTERVAL 1 YEAR) = t2.fecha
WHERE YEAR(t1.fecha) = 2025
ORDER BY t1.fecha ASC;

-- 3.3. Tendencia de crecimiento (últimos 12 meses)
SELECT 
    DATE_FORMAT(fecha, '%Y-%m') as periodo,
    valor,
    LAG(valor) OVER (ORDER BY fecha) as valor_mes_anterior,
    ROUND(valor - LAG(valor) OVER (ORDER BY fecha), 2) as variacion,
    ROUND(((valor - LAG(valor) OVER (ORDER BY fecha)) / LAG(valor) OVER (ORDER BY fecha)) * 100, 4) as variacion_porcentual
FROM utm_valor
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
ORDER BY fecha DESC;


-- ==========================================
-- 4. COMPARACIONES MÚLTIPLES
-- ==========================================

-- 4.1. Comparar últimos 5 años (por mes)
SELECT 
    MONTH(fecha) as mes,
    MAX(CASE WHEN YEAR(fecha) = 2025 THEN valor END) as '2025',
    MAX(CASE WHEN YEAR(fecha) = 2024 THEN valor END) as '2024',
    MAX(CASE WHEN YEAR(fecha) = 2023 THEN valor END) as '2023',
    MAX(CASE WHEN YEAR(fecha) = 2022 THEN valor END) as '2022',
    MAX(CASE WHEN YEAR(fecha) = 2021 THEN valor END) as '2021'
FROM utm_valor
WHERE YEAR(fecha) BETWEEN 2021 AND 2025
GROUP BY MONTH(fecha)
ORDER BY mes ASC;

-- 4.2. Ranking de meses con mayor/menor valor histórico
SELECT 
    fecha,
    valor,
    MONTH(fecha) as mes,
    YEAR(fecha) as ano,
    DATE_FORMAT(fecha, '%M %Y') as periodo,
    RANK() OVER (ORDER BY valor DESC) as ranking_mayor,
    RANK() OVER (ORDER BY valor ASC) as ranking_menor
FROM utm_valor
ORDER BY valor DESC;


-- ==========================================
-- 5. ANÁLISIS DE PERÍODOS ESPECÍFICOS
-- ==========================================

-- 5.1. Trimestral (últimos 4 trimestres) - CORREGIDO para ONLY_FULL_GROUP_BY
SELECT 
    ano,
    trimestre,
    CONCAT('Q', trimestre, ' ', ano) as periodo,
    registros,
    valor_minimo,
    valor_maximo,
    valor_promedio,
    variacion_trimestre
FROM (
    SELECT 
        YEAR(fecha) as ano,
        QUARTER(fecha) as trimestre,
        COUNT(*) as registros,
        MIN(valor) as valor_minimo,
        MAX(valor) as valor_maximo,
        AVG(valor) as valor_promedio,
        ROUND(MAX(valor) - MIN(valor), 2) as variacion_trimestre
    FROM utm_valor
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(fecha), QUARTER(fecha)
) as subquery
ORDER BY ano DESC, trimestre DESC;

-- 5.2. Semestral - CORREGIDO para ONLY_FULL_GROUP_BY
SELECT 
    YEAR(fecha) as ano,
    CASE 
        WHEN MONTH(fecha) BETWEEN 1 AND 6 THEN 'Primer Semestre'
        ELSE 'Segundo Semestre'
    END as semestre,
    CASE 
        WHEN MONTH(fecha) BETWEEN 1 AND 6 THEN 1
        ELSE 2
    END as semestre_num,
    COUNT(*) as registros,
    MIN(valor) as valor_minimo,
    MAX(valor) as valor_maximo,
    AVG(valor) as valor_promedio
FROM utm_valor
WHERE YEAR(fecha) >= 2023
GROUP BY 
    YEAR(fecha),
    CASE 
        WHEN MONTH(fecha) BETWEEN 1 AND 6 THEN 'Primer Semestre'
        ELSE 'Segundo Semestre'
    END,
    CASE 
        WHEN MONTH(fecha) BETWEEN 1 AND 6 THEN 1
        ELSE 2
    END
ORDER BY ano DESC, semestre_num DESC;


-- ==========================================
-- 6. ESTADÍSTICAS AVANZADAS
-- ==========================================

-- 6.1. Desviación estándar y coeficiente de variación por año
SELECT 
    YEAR(fecha) as ano,
    COUNT(*) as registros,
    AVG(valor) as promedio,
    MIN(valor) as minimo,
    MAX(valor) as maximo,
    STDDEV(valor) as desviacion_estandar,
    ROUND((STDDEV(valor) / AVG(valor)) * 100, 2) as coeficiente_variacion
FROM utm_valor
GROUP BY YEAR(fecha)
ORDER BY ano DESC;

-- 6.3. Meses con mayor incremento histórico
SELECT 
    t1.fecha,
    t1.valor as valor_actual,
    t2.valor as valor_anterior,
    ROUND(t1.valor - t2.valor, 2) as incremento,
    ROUND(((t1.valor - t2.valor) / t2.valor) * 100, 4) as porcentaje_incremento,
    DATE_FORMAT(t1.fecha, '%M %Y') as periodo
FROM utm_valor t1
INNER JOIN utm_valor t2 ON DATE_SUB(t1.fecha, INTERVAL 1 MONTH) = t2.fecha
ORDER BY incremento DESC
LIMIT 10;


-- ==========================================
-- 7. PROYECCIONES Y PROMEDIOS MÓVILES
-- ==========================================

-- 7.1. Promedio móvil de 3 meses
SELECT 
    fecha,
    valor,
    AVG(valor) OVER (
        ORDER BY fecha 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as promedio_movil_3_meses
FROM utm_valor
ORDER BY fecha DESC
LIMIT 12;

-- 7.2. Tasa de crecimiento acumulada
SELECT 
    fecha,
    valor,
    FIRST_VALUE(valor) OVER (ORDER BY fecha) as valor_inicial,
    ROUND(((valor - FIRST_VALUE(valor) OVER (ORDER BY fecha)) / 
           FIRST_VALUE(valor) OVER (ORDER BY fecha)) * 100, 2) as crecimiento_acumulado_porcentual
FROM utm_valor
WHERE YEAR(fecha) = 2025
ORDER BY fecha ASC;


-- ==========================================
-- 8. REPORTES PARA DASHBOARDS
-- ==========================================

-- 8.1. Resumen ejecutivo (últimos 12 meses)
SELECT 
    'Últimos 12 meses' as periodo,
    COUNT(*) as meses_registrados,
    MIN(valor) as valor_minimo,
    MAX(valor) as valor_maximo,
    AVG(valor) as valor_promedio,
    ROUND(MAX(valor) - MIN(valor), 2) as rango,
    ROUND(((MAX(valor) - MIN(valor)) / MIN(valor)) * 100, 2) as variacion_porcentual,
    MIN(fecha) as desde,
    MAX(fecha) as hasta
FROM utm_valor
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH);

-- 8.2. Top 5 meses con mayor y menor valor
(SELECT 
    'Mayor' as tipo,
    fecha,
    valor,
    DATE_FORMAT(fecha, '%M %Y') as periodo
FROM utm_valor
ORDER BY valor DESC
LIMIT 5)
UNION ALL
(SELECT 
    'Menor' as tipo,
    fecha,
    valor,
    DATE_FORMAT(fecha, '%M %Y') as periodo
FROM utm_valor
ORDER BY valor ASC
LIMIT 5)
ORDER BY tipo DESC, valor DESC;

-- 8.3. Datos para gráfico de línea (últimos 24 meses)
SELECT 
    DATE_FORMAT(fecha, '%Y-%m') as periodo,
    DATE_FORMAT(fecha, '%b %Y') as periodo_formato,
    valor,
    MONTH(fecha) as mes,
    YEAR(fecha) as ano
FROM utm_valor
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
ORDER BY fecha ASC;


-- ==========================================
-- 9. CONVERSIONES Y CÁLCULOS
-- ==========================================

-- 9.1. Tabla de conversión para montos comunes
SELECT 
    valor as valor_utm,
    fecha,
    ROUND(valor * 1, 2) as '1_UTM',
    ROUND(valor * 5, 2) as '5_UTM',
    ROUND(valor * 10, 2) as '10_UTM',
    ROUND(valor * 50, 2) as '50_UTM',
    ROUND(valor * 100, 2) as '100_UTM'
FROM utm_valor
WHERE fecha = (SELECT MAX(fecha) FROM utm_valor);

-- 9.2. Equivalencia en UF (asumiendo valor UF)
SELECT 
    u.fecha,
    u.valor as valor_utm,
    36000 as valor_uf_referencial,
    ROUND(u.valor / 36000, 4) as utm_en_uf,
    ROUND(36000 / u.valor, 4) as uf_en_utm
FROM utm_valor u
ORDER BY u.fecha DESC
LIMIT 12;


-- ==========================================
-- 10. DISPONIBILIDAD DE DATOS
-- ==========================================

-- 10.1. Años con datos disponibles
SELECT 
    YEAR(fecha) as ano,
    COUNT(DISTINCT MONTH(fecha)) as meses_disponibles,
    MIN(fecha) as primera_fecha,
    MAX(fecha) as ultima_fecha,
    COUNT(*) as total_registros
FROM utm_valor
GROUP BY YEAR(fecha)
ORDER BY ano DESC;

