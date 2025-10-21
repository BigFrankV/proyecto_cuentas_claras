SELECT
    id AS emision_id,
    periodo,
    fecha_vencimiento,
    estado,
    observaciones,
    created_at
FROM
    emision_gastos_comunes
WHERE
    comunidad_id = 1 -- Parámetro {id} de la comunidad
ORDER BY
    periodo DESC;

SELECT
    deg.id AS detalle_emision_gasto_id,
    g.glosa AS glosa_gasto,
    g.fecha AS fecha_gasto,
    g.monto AS monto_total_gasto,
    cg.nombre AS categoria_nombre,
    cc.nombre AS centro_costo_nombre,
    deg.regla_prorrateo,
    deg.metadata_json,
    deg.monto AS monto_a_prorratear -- Monto específico que entra en la liquidación
FROM
    detalle_emision_gastos deg
INNER JOIN
    gasto g ON deg.gasto_id = g.id
INNER JOIN
    categoria_gasto cg ON deg.categoria_id = cg.id
LEFT JOIN
    centro_costo cc ON g.centro_costo_id = cc.id
WHERE
    deg.emision_id = 1 -- Parámetro {emision_id}
ORDER BY
    cg.nombre, g.fecha;

------------

SELECT
    deg.id AS detalle_emision_gasto_id,
    g.glosa AS glosa_gasto,
    g.fecha AS fecha_gasto,
    g.monto AS monto_total_gasto,
    cg.nombre AS categoria_nombre,
    cc.nombre AS centro_costo_nombre,
    deg.regla_prorrateo,
    deg.metadata_json,
    deg.monto AS monto_a_prorratear -- Monto específico que entra en la liquidación
FROM
    detalle_emision_gastos deg
INNER JOIN
    gasto g ON deg.gasto_id = g.id
INNER JOIN
    categoria_gasto cg ON deg.categoria_id = cg.id
LEFT JOIN
    centro_costo cc ON g.centro_costo_id = cc.id
WHERE
    deg.emision_id = 1 -- Parámetro {emision_id}
ORDER BY
    cg.nombre, g.fecha;

----------

SELECT
    ccu.id AS cuenta_cobro_id,
    u.codigo AS unidad_codigo,
    t.nombre AS torre_nombre,
    ccu.monto_total,
    ccu.saldo,
    ccu.estado AS estado_cobro,
    ccu.interes_acumulado,
    -- Información del titular de la unidad (ej. nombre del arrendatario/propietario)
    p.nombres AS titular_nombres,
    p.apellidos AS titular_apellidos,
    tu.tipo AS titular_tipo
FROM
    cuenta_cobro_unidad ccu
INNER JOIN
    unidad u ON ccu.unidad_id = u.id
LEFT JOIN
    torre t ON u.torre_id = t.id
LEFT JOIN
    titulares_unidad tu ON u.id = tu.unidad_id AND tu.hasta IS NULL -- Titular activo
LEFT JOIN
    persona p ON tu.persona_id = p.id
WHERE
    ccu.emision_id = 1 -- Parámetro {emision_id}
ORDER BY
    u.codigo;

-------

SELECT
    dcu.id AS detalle_cargo_id,
    cg.nombre AS categoria_nombre,
    dcu.glosa,
    dcu.monto,
    dcu.origen, -- Origen del cargo (gasto, multa, consumo, ajuste)
    dcu.iva_incluido
FROM
    detalle_cuenta_unidad dcu
INNER JOIN
    categoria_gasto cg ON dcu.categoria_id = cg.id
WHERE
    dcu.cuenta_cobro_unidad_id = 1 -- Parámetro {cuenta_cobro_id} (e.g., cuenta de D101 para Emision 1)
ORDER BY
    dcu.origen, cg.nombre;


------

SELECT
    p.id AS pago_id,
    u.codigo AS unidad_codigo,
    p.fecha AS fecha_pago,
    p.monto AS monto_pago,
    p.medio,
    p.estado AS estado_pago,
    cb.estado AS estado_conciliacion_bancaria
FROM
    pago p
INNER JOIN
    pago_aplicacion pa ON p.id = pa.pago_id
INNER JOIN
    cuenta_cobro_unidad ccu ON pa.cuenta_cobro_unidad_id = ccu.id
INNER JOIN
    unidad u ON p.unidad_id = u.id
LEFT JOIN
    conciliacion_bancaria cb ON p.id = cb.pago_id
WHERE
    ccu.emision_id = 1 -- Parámetro {emision_id}
GROUP BY
    p.id, u.codigo, cb.estado
ORDER BY
    p.fecha DESC;

---------

SELECT
    e.id,
    e.periodo AS period,
    -- Se asume 'gastos_comunes' por defecto; puede ser inferido desde categorías de gasto.
    'gastos_comunes' AS type,
    e.estado AS status,
    DATE(e.created_at) AS issueDate,
    e.fecha_vencimiento AS dueDate,
    e.observaciones AS description,
    c.razon_social AS communityName,
    COUNT(ccu.unidad_id) AS unitCount,
    COALESCE(SUM(ccu.monto_total), 0.00) AS totalAmount,
    COALESCE(SUM(ccu.monto_total - ccu.saldo), 0.00) AS paidAmount
FROM
    emision_gastos_comunes e
INNER JOIN
    comunidad c ON e.comunidad_id = c.id
LEFT JOIN
    cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
WHERE
    e.id = 1 -- Parámetro {id} de la emisión
GROUP BY
    e.id, c.razon_social
LIMIT 1;

-------

SELECT
    cg.nombre AS conceptName,
    COALESCE(SUM(deg.monto), 0.00) AS totalAmount
FROM
    detalle_emision_gastos deg
INNER JOIN
    categoria_gasto cg ON deg.categoria_id = cg.id
WHERE
    deg.emision_id = 1 -- Parámetro {id} de la emisión
GROUP BY
    cg.nombre
ORDER BY
    totalAmount DESC;
-- Nota: Los campos 'labels' y 'amounts' se construyen en el frontend a partir de 'conceptName' y 'totalAmount'.
-- Los 'colors' se asignan en el frontend o se obtienen de una tabla de configuración de la BD si existiera.


SELECT
    ccu.id AS id,
    u.codigo AS unitNumber,
    -- Asumir 'Departamento' o buscar tipo en tabla `unidad` si existiera ese campo
    'Departamento' AS unitType,
    CONCAT(p.nombres, ' ', p.apellidos) AS owner,
    u.alicuota * 100 AS participation, -- Alicuota como porcentaje
    ccu.monto_total AS totalAmount,
    ccu.monto_total - ccu.saldo AS paidAmount,
    ccu.estado AS status, -- mapeo: 'pagado' -> 'paid', 'parcial' -> 'partial', 'pendiente'/'vencido' -> 'pending'
    e.id AS emision_id
FROM
    cuenta_cobro_unidad ccu
INNER JOIN
    unidad u ON ccu.unidad_id = u.id
LEFT JOIN
    titulares_unidad tu ON u.id = tu.unidad_id AND tu.hasta IS NULL
LEFT JOIN
    persona p ON tu.persona_id = p.id
INNER JOIN
    emision_gastos_comunes e ON ccu.emision_id = e.id
WHERE
    ccu.emision_id = 1 -- Parámetro {id} de la emisión
ORDER BY
    u.codigo;

SELECT
    dcu.id AS conceptId,
    cg.nombre AS conceptName,
    dcu.monto AS unitAmount,
    -- Buscar el monto total del concepto en la emisión, prorrateado por la regla:
    (
        SELECT deg.monto
        FROM detalle_emision_gastos deg
        WHERE deg.emision_id = ccu.emision_id
        AND deg.categoria_id = dcu.categoria_id
        LIMIT 1
    ) AS totalAmount,
    -- Mapeo de reglas de prorrateo a los tipos de distribución del frontend
    CASE
        WHEN deg_base.regla_prorrateo = 'coeficiente' THEN 'proportional'
        WHEN deg_base.regla_prorrateo = 'partes_iguales' THEN 'equal'
        ELSE 'custom' -- Consumo, fijo_por_unidad u otros
    END AS distributionType,
    dcu.cuenta_cobro_unidad_id AS ccu_id -- Clave para agrupar en el frontend/API
FROM
    detalle_cuenta_unidad dcu
INNER JOIN
    cuenta_cobro_unidad ccu ON dcu.cuenta_cobro_unidad_id = ccu.id
INNER JOIN
    categoria_gasto cg ON dcu.categoria_id = cg.id
-- Se hace un JOIN para obtener la regla de prorrateo desde el detalle de la emisión
LEFT JOIN
    detalle_emision_gastos deg_base ON ccu.emision_id = deg_base.emision_id
    AND dcu.categoria_id = deg_base.categoria_id
WHERE
    ccu.emision_id = 1 -- Parámetro {id} de la emisión
ORDER BY
    ccu_id, conceptName;


