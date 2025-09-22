-- ============================================
-- SELECT QUERIES PARA API DE COMUNIDADES - ESTRUCTURA REAL
-- ============================================

-- 1. LISTADO DE COMUNIDADES (GET /api/comunidades)
-- Con estadísticas calculadas y filtros
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
        COUNT(DISTINCT CASE WHEN mc.rol IN ('residente', 'propietario') AND mc.activo = 1 THEN mc.persona_id END) as total_residentes,
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
    LEFT JOIN membresia_comunidad mc ON mc.comunidad_id = com.id
    LEFT JOIN cargo_unidad cu ON cu.comunidad_id = com.id
    GROUP BY com.id
) stats ON stats.comunidad_id = c.id
WHERE 1=1
    -- Filtros dinámicos (agregar según parámetros de consulta)
    -- AND c.razon_social LIKE CONCAT('%', ?, '%')
    -- AND c.direccion LIKE CONCAT('%', ?, '%')
ORDER BY c.razon_social ASC;

-- 2. DETALLE DE COMUNIDAD (GET /api/comunidades/:id)
-- Información completa con todas las relaciones - ESTRUCTURA REAL
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
    (SELECT COUNT(DISTINCT mc.persona_id) 
     FROM membresia_comunidad mc 
     WHERE mc.comunidad_id = c.id 
     AND mc.activo = 1 
     AND mc.rol IN ('residente', 'propietario')) as totalResidentes,
     
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
     FROM cargo_unidad cu 
     WHERE cu.comunidad_id = c.id 
     AND cu.estado IN ('pendiente', 'parcial')) as saldoPendiente

FROM comunidad c
WHERE c.id = 1;

-- 3. AMENIDADES DE UNA COMUNIDAD (incluido en detalle)
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
ORDER BY a.nombre;

-- 4. EDIFICIOS DE UNA COMUNIDAD (incluido en detalle)
SELECT 
    e.id,
    e.nombre,
    e.direccion,
    e.codigo,
    e.created_at as fechaCreacion
FROM edificio e
WHERE e.comunidad_id = ?
ORDER BY e.nombre;

-- 5. CONTACTOS DE UNA COMUNIDAD (incluido en detalle)
-- Basado en estructura real - solo información de contacto básica
SELECT 
    1 as id,
    'Administración' as nombre,
    'Administrador' as cargo,
    c.telefono_contacto as telefono,
    c.email_contacto as email,
    1 as esContactoPrincipal
FROM comunidad c
WHERE c.id = ?;

-- 6. DOCUMENTOS DE UNA COMUNIDAD (incluido en detalle)
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
ORDER BY d.created_at DESC;

-- 7. RESIDENTES DE UNA COMUNIDAD (GET /api/comunidades/:id/residentes)
-- Corregido: usando tenencia_unidad para obtener las unidades
SELECT 
    p.id,
    CONCAT(p.nombres, ' ', p.apellidos) as nombre,
    COALESCE(CONCAT(e.nombre, '-', u.codigo), 'Sin unidad') as unidad,
    mc.rol as tipo,
    tu.tipo as tipo_tenencia,
    p.telefono,
    p.email,
    CASE 
        WHEN mc.activo = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as estado
FROM persona p
INNER JOIN membresia_comunidad mc ON mc.persona_id = p.id
LEFT JOIN tenencia_unidad tu ON tu.persona_id = p.id AND tu.comunidad_id = mc.comunidad_id
LEFT JOIN unidad u ON u.id = tu.unidad_id
LEFT JOIN edificio e ON e.id = u.edificio_id
WHERE mc.comunidad_id = ?
ORDER BY mc.rol, p.apellidos, p.nombres;

-- 8. PARÁMETROS DE COBRANZA (GET /api/comunidades/:id/parametros)
-- Usando tabla configuracion_interes con estructura real
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
WHERE ci.comunidad_id = ?;

-- 9. ESTADÍSTICAS FINANCIERAS (para pestaña Finanzas)
-- Corregido: los cargos no tienen categorías directas, son montos totales
SELECT 
    -- Ingresos totales del mes actual (sin categorías específicas)
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
    AND YEAR(cu.created_at) = YEAR(CURDATE());

-- 10. FLUJO DE CAJA ÚLTIMOS 6 MESES (para gráficos)
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
ORDER BY mes.fecha;