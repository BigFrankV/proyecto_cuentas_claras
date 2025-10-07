-- =====================================================
-- CONSULTAS SQL PARA EL MÓDULO DE COMUNIDADES
-- =====================================================
-- Archivo generado basado en el componente comunidades.tsx
-- y los tipos definidos en types/comunidades.ts
-- =====================================================

-- =====================================================
-- 1. LISTADO DE COMUNIDADES (Vista Principal)
-- =====================================================

-- 1.1 Obtener todas las comunidades con estadísticas básicas
-- Usado por: getComunidades() en comunidadesService.ts
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
    -- Conteo de unidades
    SELECT 
        comunidad_id,
        COUNT(*) AS total,
        SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS ocupadas
    FROM unidad
    GROUP BY comunidad_id
) AS unidades ON c.id = unidades.comunidad_id
LEFT JOIN (
    -- Conteo de residentes activos
    SELECT 
        tu.comunidad_id,
        COUNT(DISTINCT tu.persona_id) AS total
    FROM titulares_unidad tu
    WHERE tu.hasta IS NULL OR tu.hasta > CURDATE()
    GROUP BY tu.comunidad_id
) AS residentes ON c.id = residentes.comunidad_id
LEFT JOIN (
    -- Estadísticas financieras
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
ORDER BY c.razon_social;


-- 1.2 Obtener comunidades filtradas por usuario (solo las que tiene asignadas)
-- Usado cuando: user.is_superadmin = false
SELECT c.id
FROM comunidad c
INNER JOIN usuario_rol_comunidad urc ON c.id = urc.comunidad_id
WHERE urc.usuario_id = ? -- Parámetro: ID del usuario actual
AND urc.activo = 1
AND (urc.hasta IS NULL OR urc.hasta > CURDATE());


-- =====================================================
-- 2. DETALLE DE COMUNIDAD
-- =====================================================

-- 2.1 Obtener información completa de una comunidad específica
-- Usado por: getComunidadById(id) en comunidadesService.ts
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
WHERE c.id = ?; -- Parámetro: ID de la comunidad


-- =====================================================
-- 3. AMENIDADES DE UNA COMUNIDAD
-- =====================================================

-- 3.1 Obtener amenidades de una comunidad específica
-- Usado por: getAmenidadesByComunidad(id) en comunidadesService.ts
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
WHERE a.comunidad_id = ? -- Parámetro: ID de la comunidad
ORDER BY a.nombre;


-- =====================================================
-- 4. EDIFICIOS DE UNA COMUNIDAD
-- =====================================================

-- 4.1 Obtener edificios de una comunidad específica
-- Usado por: getEdificiosByComunidad(id) en comunidadesService.ts
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
WHERE e.comunidad_id = ? -- Parámetro: ID de la comunidad
GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at
ORDER BY e.nombre;


-- =====================================================
-- 5. CONTACTOS DE UNA COMUNIDAD
-- =====================================================

-- 5.1 Obtener contactos de una comunidad (usuarios con acceso)
-- Usado por: getContactosByComunidad(id) en comunidadesService.ts
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
WHERE urc.comunidad_id = ? -- Parámetro: ID de la comunidad
AND urc.activo = 1
AND u.activo = 1
AND (urc.hasta IS NULL OR urc.hasta > CURDATE())
ORDER BY p.apellidos, p.nombres;


-- =====================================================
-- 6. DOCUMENTOS DE UNA COMUNIDAD
-- =====================================================

-- 6.1 Obtener documentos de una comunidad específica
-- Usado por: getDocumentosByComunidad(id) en comunidadesService.ts
SELECT 
    dc.id,
    dc.titulo AS nombre,
    dc.tipo,
    dc.url,
    dc.created_at AS fechaSubida,
    0 AS tamano, -- Agregar campo si es necesario
    dc.periodo,
    dc.visibilidad
FROM documento_comunidad dc
WHERE dc.comunidad_id = ? -- Parámetro: ID de la comunidad
ORDER BY dc.created_at DESC;


-- =====================================================
-- 7. RESIDENTES DE UNA COMUNIDAD
-- =====================================================

-- 7.1 Obtener residentes de una comunidad
-- Usado por: getResidentesByComunidad(id) en comunidadesService.ts
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
WHERE tu.comunidad_id = ? -- Parámetro: ID de la comunidad
AND (tu.hasta IS NULL OR tu.hasta > CURDATE())
ORDER BY p.apellidos, p.nombres;


-- =====================================================
-- 8. PARÁMETROS DE COBRANZA DE UNA COMUNIDAD
-- =====================================================

-- 8.1 Obtener parámetros de cobranza de una comunidad
-- Usado por: getParametrosByComunidad(id) en comunidadesService.ts
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
WHERE pc.comunidad_id = ? -- Parámetro: ID de la comunidad
LIMIT 1;


-- =====================================================
-- 9. ESTADÍSTICAS FINANCIERAS DE UNA COMUNIDAD
-- =====================================================

-- 9.1 Obtener estadísticas financieras
-- Usado por: getEstadisticasByComunidad(id) en comunidadesService.ts
SELECT 
    COALESCE(SUM(ccu.monto_total), 0) AS totalIngresos,
    COALESCE(SUM(ccu.monto_total - ccu.saldo), 0) AS ingresosPagados,
    COALESCE(SUM(ccu.saldo), 0) AS ingresosPendientes
FROM cuenta_cobro_unidad ccu
WHERE ccu.comunidad_id = ?; -- Parámetro: ID de la comunidad


-- =====================================================
-- 10. FLUJO DE CAJA DE UNA COMUNIDAD
-- =====================================================

-- 10.1 Obtener flujo de caja mensual (resumen de cuentas de cobro)
-- Usado por: getFlujoCajaByComunidad(id) en comunidadesService.ts
SELECT 
    e.periodo,
    e.fecha_vencimiento AS fecha,
    COUNT(ccu.id) AS totalCuentas,
    SUM(ccu.monto_total) AS montoTotal,
    SUM(ccu.saldo) AS saldoPendiente,
    SUM(ccu.monto_total - ccu.saldo) AS montoPagado
FROM emision_gastos_comunes e
LEFT JOIN cuenta_cobro_unidad ccu ON e.id = ccu.emision_id
WHERE e.comunidad_id = ? -- Parámetro: ID de la comunidad
AND e.estado != 'anulado'
GROUP BY e.periodo, e.fecha_vencimiento
ORDER BY e.periodo DESC
LIMIT 12;


-- =====================================================
-- 11. CREAR/ACTUALIZAR COMUNIDAD
-- =====================================================

-- 11.1 Insertar nueva comunidad
-- Usado por: createComunidad(data) en comunidadesService.ts
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
) VALUES (
    ?, -- nombre/razon_social
    ?, -- rut
    ?, -- dv
    ?, -- giro/descripcion
    ?, -- direccion
    ?, -- email
    ?, -- telefono
    'CLP', -- moneda por defecto
    'America/Santiago', -- zona horaria por defecto
    ?, -- usuario que crea
    NOW(),
    NOW()
);

-- 11.2 Actualizar comunidad existente
-- Usado por: updateComunidad(id, data) en comunidadesService.ts
UPDATE comunidad
SET 
    razon_social = ?,
    rut = ?,
    dv = ?,
    giro = ?,
    direccion = ?,
    email_contacto = ?,
    telefono_contacto = ?,
    updated_at = NOW(),
    updated_by = ?
WHERE id = ?;


-- =====================================================
-- 12. ELIMINAR COMUNIDAD
-- =====================================================

-- 12.1 Eliminar comunidad (hard delete)
-- Usado por: deleteComunidad(id) en comunidadesService.ts
-- NOTA: Considerar agregar campo 'activa' para soft delete en lugar de eliminar físicamente
DELETE FROM comunidad WHERE id = ?;


-- =====================================================
-- 13. FILTROS Y BÚSQUEDAS
-- =====================================================

-- 13.1 Búsqueda por nombre o dirección
SELECT c.* FROM comunidad c
WHERE (
    c.razon_social LIKE CONCAT('%', ?, '%')
    OR c.direccion LIKE CONCAT('%', ?, '%')
)
ORDER BY c.razon_social;

-- 13.2 Filtro por RUT
SELECT c.* FROM comunidad c
WHERE c.rut = ?
ORDER BY c.razon_social;


-- =====================================================
-- 14. VERIFICACIÓN DE PERMISOS DE USUARIO
-- =====================================================

-- 14.1 Verificar si usuario es superadmin
SELECT u.is_superadmin
FROM usuario u
WHERE u.id = ?;

-- 14.2 Obtener membresías de usuario (comunidades asignadas)
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
AND (urc.hasta IS NULL OR urc.hasta > CURDATE());

-- 14.3 Verificar acceso de usuario a comunidad específica
SELECT COUNT(*) AS tiene_acceso
FROM usuario_rol_comunidad urc
WHERE urc.usuario_id = ?
AND urc.comunidad_id = ?
AND urc.activo = 1
AND (urc.hasta IS NULL OR urc.hasta > CURDATE());

