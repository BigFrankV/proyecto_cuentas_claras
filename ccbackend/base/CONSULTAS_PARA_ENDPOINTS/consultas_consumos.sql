-- Parámetros dinámicos:
SET @target_medidor_id = 1;
SET @periodo_inicio = '2024-01';
SET @periodo_fin = '2025-12';

-- 1. Gráfico Principal: Tendencia de Consumo Mensual (Utilizando la vista precalculada)
SELECT
    vc.periodo AS mes,
    vc.consumo AS consumo_total_unidad,
    COALESCE(tc.precio_por_unidad, 0.00) AS precio_unitario,
    COALESCE(tc.cargo_fijo, 0.00) AS cargo_fijo_mensual,
    ROUND((vc.consumo * COALESCE(tc.precio_por_unidad, 0.00)) + COALESCE(tc.cargo_fijo, 0.00), 2) AS costo_mensual
FROM vista_consumos vc
INNER JOIN medidor m ON m.id = vc.medidor_id
LEFT JOIN tarifa_consumo tc ON tc.comunidad_id = m.comunidad_id 
    AND tc.tipo = m.tipo
    AND tc.periodo_desde = vc.periodo -- Asume que la tarifa se define por periodo de consumo
WHERE 
    vc.medidor_id = @target_medidor_id
    AND vc.periodo BETWEEN @periodo_inicio AND @periodo_fin
ORDER BY mes;

-- 2. Gráfico Mensual (Trimestral): Consumo por Trimestre
SELECT
    CONCAT(LEFT(vc.periodo, 4), '-Q', QUARTER(STR_TO_DATE(CONCAT(vc.periodo, '-01'), '%Y-%m-%d'))) AS trimestre,
    SUM(vc.consumo) AS consumo_total_trimestral
FROM vista_consumos vc
WHERE 
    vc.medidor_id = @target_medidor_id
    AND vc.periodo BETWEEN @periodo_inicio AND @periodo_fin
GROUP BY trimestre
ORDER BY trimestre;

-- 3. Gráfico Semanal: Promedio de Consumo por Día de la Semana
-- NOTA: Requiere que las lecturas sean diarias o que se imputen consumos diarios.
-- La tabla `lectura_medidor` en el esquema provisto no es diaria, por lo que esta consulta se ajusta para usar el campo `fecha` de las lecturas.
-- Generaremos un consumo por la diferencia entre lecturas y dividiremos por la diferencia de días.
-- Esta es la aproximación más cercana con el esquema actual, pero solo si las lecturas son consecutivas y en un rango de fechas.

WITH consumo_diario AS (
    SELECT
        lm.fecha,
        lm.lectura,
        DATEDIFF(lm.fecha, LAG(lm.fecha) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) AS dias_entre_lecturas,
        (lm.lectura - LAG(lm.lectura) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)) / 
            NULLIF(DATEDIFF(lm.fecha, LAG(lm.fecha) OVER (PARTITION BY lm.medidor_id ORDER BY lm.fecha)), 0) AS consumo_promedio_diario
    FROM lectura_medidor lm
    WHERE lm.medidor_id = @target_medidor_id
      AND lm.fecha BETWEEN '2024-01-01' AND '2025-12-31'
)
SELECT
    DAYOFWEEK(cd.fecha) AS dia_semana,  -- 1=Dom, 2=Lun, ..., 7=Sáb
    COALESCE(AVG(cd.consumo_promedio_diario), 0) AS promedio_consumo_diario
FROM consumo_diario cd
WHERE cd.consumo_promedio_diario IS NOT NULL AND cd.consumo_promedio_diario > 0
GROUP BY dia_semana
ORDER BY dia_semana;


-- 4. Estadísticas (Cards): Total, Promedio y Costo
SELECT
    COALESCE(SUM(vc.consumo), 0) AS total_consumo_periodo,
    COALESCE(AVG(vc.consumo), 0) AS promedio_consumo_mensual,
    ROUND(
        SUM(vc.consumo * COALESCE(tc.precio_por_unidad, 0.00)) + SUM(COALESCE(tc.cargo_fijo, 0.00))
    , 2) AS costo_total_periodo
FROM vista_consumos vc
INNER JOIN medidor m ON m.id = vc.medidor_id
LEFT JOIN tarifa_consumo tc ON tc.comunidad_id = m.comunidad_id 
    AND tc.tipo = m.tipo
    AND tc.periodo_desde = vc.periodo
WHERE 
    vc.medidor_id = @target_medidor_id
    AND vc.periodo BETWEEN @periodo_inicio AND @periodo_fin;


-- 5. Tabla de Detalle de Consumos (Lecturas mensuales y cálculo de consumo y costo)
SELECT
    vc.periodo,
    vc.consumo AS consumo_calculado,
    COALESCE(tc.precio_por_unidad, 0.00) AS precio_unitario,
    COALESCE(tc.cargo_fijo, 0.00) AS cargo_fijo,
    ROUND((vc.consumo * COALESCE(tc.precio_por_unidad, 0.00)) + COALESCE(tc.cargo_fijo, 0.00), 2) AS costo
FROM vista_consumos vc
INNER JOIN medidor m ON m.id = vc.medidor_id
LEFT JOIN tarifa_consumo tc ON tc.comunidad_id = m.comunidad_id 
    AND tc.tipo = m.tipo
    AND tc.periodo_desde = vc.periodo
WHERE 
    vc.medidor_id = @target_medidor_id
    AND vc.periodo BETWEEN @periodo_inicio AND @periodo_fin
ORDER BY vc.periodo DESC;