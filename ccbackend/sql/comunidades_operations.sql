-- ============================================
-- QUERIES ADICIONALES PARA OPERACIONES CRUD
-- ============================================

-- 11. CREAR NUEVA COMUNIDAD (POST /api/comunidades)
INSERT INTO comunidad (
    nombre, 
    direccion, 
    comuna, 
    region, 
    tipo, 
    estado, 
    administrador_nombre, 
    telefono_comunidad, 
    email_comunidad, 
    descripcion, 
    horario_atencion, 
    imagen_url
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- 12. ACTUALIZAR COMUNIDAD (PUT /api/comunidades/:id)
UPDATE comunidad SET 
    nombre = ?, 
    direccion = ?, 
    comuna = ?, 
    region = ?, 
    tipo = ?, 
    estado = ?, 
    administrador_nombre = ?, 
    telefono_comunidad = ?, 
    email_comunidad = ?, 
    descripcion = ?, 
    horario_atencion = ?, 
    imagen_url = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- 13. ELIMINAR COMUNIDAD (DELETE /api/comunidades/:id)
-- Nota: Implementar soft delete o verificar integridad referencial
UPDATE comunidad SET 
    estado = 'Eliminada',
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- 14. VERIFICAR EXISTENCIA DE COMUNIDAD
SELECT COUNT(*) as existe 
FROM comunidad 
WHERE id = ? AND estado != 'Eliminada';

-- 15. BÚSQUEDA AVANZADA DE COMUNIDADES (GET /api/comunidades/search)
SELECT 
    c.id,
    c.nombre,
    c.direccion,
    c.comuna,
    c.region,
    c.tipo,
    c.estado,
    c.administrador_nombre as administrador,
    -- Resaltar coincidencias en búsqueda
    CASE 
        WHEN c.nombre LIKE CONCAT('%', ?, '%') THEN 'nombre'
        WHEN c.direccion LIKE CONCAT('%', ?, '%') THEN 'direccion'
        WHEN c.administrador_nombre LIKE CONCAT('%', ?, '%') THEN 'administrador'
        ELSE 'otros'
    END as tipoCoincidencia
FROM comunidad c
WHERE (
    c.nombre LIKE CONCAT('%', ?, '%') OR
    c.direccion LIKE CONCAT('%', ?, '%') OR
    c.administrador_nombre LIKE CONCAT('%', ?, '%')
) AND c.estado != 'Eliminada'
ORDER BY 
    CASE 
        WHEN c.nombre LIKE CONCAT(?, '%') THEN 1  -- Empieza con el término
        WHEN c.nombre LIKE CONCAT('%', ?, '%') THEN 2  -- Contiene el término
        ELSE 3
    END,
    c.nombre;

-- 16. ESTADÍSTICAS GENERALES DEL DASHBOARD
SELECT 
    COUNT(*) as totalComunidades,
    COUNT(CASE WHEN estado = 'Activa' THEN 1 END) as comunidadesActivas,
    COUNT(CASE WHEN estado = 'Inactiva' THEN 1 END) as comunidadesInactivas,
    COUNT(CASE WHEN estado = 'Suspendida' THEN 1 END) as comunidadesSuspendidas,
    
    -- Estadísticas de unidades
    (SELECT COUNT(*) FROM unidad u 
     INNER JOIN edificio e ON e.id = u.edificio_id 
     INNER JOIN comunidad c ON c.id = e.comunidad_id 
     WHERE c.estado = 'Activa') as totalUnidades,
     
    (SELECT COUNT(*) FROM unidad u 
     INNER JOIN edificio e ON e.id = u.edificio_id 
     INNER JOIN comunidad c ON c.id = e.comunidad_id 
     WHERE c.estado = 'Activa' AND u.activa = 1) as unidadesOcupadas,
     
    -- Estadísticas financieras generales
    (SELECT COALESCE(SUM(monto), 0) FROM cargo_unidad cu
     INNER JOIN unidad u ON u.id = cu.unidad_id
     INNER JOIN edificio e ON e.id = u.edificio_id
     INNER JOIN comunidad c ON c.id = e.comunidad_id
     WHERE c.estado = 'Activa' 
     AND cu.estado = 'pendiente') as totalSaldoPendiente,
     
    (SELECT COALESCE(SUM(monto), 0) FROM cargo_unidad cu
     INNER JOIN unidad u ON u.id = cu.unidad_id
     INNER JOIN edificio e ON e.id = u.edificio_id
     INNER JOIN comunidad c ON c.id = e.comunidad_id
     WHERE c.estado = 'Activa' 
     AND MONTH(cu.created_at) = MONTH(CURDATE())
     AND YEAR(cu.created_at) = YEAR(CURDATE())) as ingresosMesActual
     
FROM comunidad
WHERE estado != 'Eliminada';

-- 17. VALIDACIONES PARA FORMULARIOS

-- Verificar nombre único (excluyendo la misma comunidad en edición)
SELECT COUNT(*) as existe 
FROM comunidad 
WHERE nombre = ? 
AND id != COALESCE(?, 0) 
AND estado != 'Eliminada';

-- Verificar email único (excluyendo la misma comunidad en edición)
SELECT COUNT(*) as existe 
FROM comunidad 
WHERE email_comunidad = ? 
AND id != COALESCE(?, 0) 
AND estado != 'Eliminada';

-- 18. QUERIES PARA EXPORTACIÓN (GET /api/comunidades/export)

-- Exportar listado completo
SELECT 
    c.id as 'ID',
    c.nombre as 'Nombre',
    c.direccion as 'Dirección',
    c.comuna as 'Comuna',
    c.region as 'Región',
    c.tipo as 'Tipo',
    c.estado as 'Estado',
    c.administrador_nombre as 'Administrador',
    c.telefono_comunidad as 'Teléfono',
    c.email_comunidad as 'Email',
    stats.total_unidades as 'Total Unidades',
    stats.unidades_ocupadas as 'Unidades Ocupadas',
    stats.total_residentes as 'Total Residentes',
    CONCAT(ROUND(stats.morosidad, 1), '%') as 'Morosidad',
    FORMAT(stats.saldo_pendiente, 0) as 'Saldo Pendiente',
    c.created_at as 'Fecha Creación'
FROM comunidad c
LEFT JOIN (
    -- [Subconsulta de estadísticas igual que en query principal]
) stats ON stats.comunidad_id = c.id
WHERE c.estado != 'Eliminada'
ORDER BY c.nombre;

-- 19. LOGS Y AUDITORÍA

-- Registrar cambios en comunidad (trigger o manual)
INSERT INTO auditoria_comunidad (
    comunidad_id,
    usuario_id,
    accion,
    campos_modificados,
    valores_anteriores,
    valores_nuevos,
    fecha_accion
) VALUES (?, ?, ?, ?, ?, ?, NOW());

-- Consultar historial de cambios
SELECT 
    ac.id,
    ac.accion,
    ac.campos_modificados,
    ac.valores_anteriores,
    ac.valores_nuevos,
    ac.fecha_accion,
    COALESCE(u.nombre, 'Sistema') as usuario
FROM auditoria_comunidad ac
LEFT JOIN usuario u ON u.id = ac.usuario_id
WHERE ac.comunidad_id = ?
ORDER BY ac.fecha_accion DESC
LIMIT 50;

-- 20. QUERIES PARA REPORTES ESPECÍFICOS

-- Reporte de ocupación por comunidad
SELECT 
    c.nombre,
    COUNT(u.id) as totalUnidades,
    COUNT(CASE WHEN u.activa = 1 THEN 1 END) as unidadesOcupadas,
    ROUND((COUNT(CASE WHEN u.activa = 1 THEN 1 END) * 100.0) / COUNT(u.id), 1) as porcentajeOcupacion
FROM comunidad c
LEFT JOIN edificio e ON e.comunidad_id = c.id
LEFT JOIN unidad u ON u.edificio_id = e.id
WHERE c.estado = 'Activa'
GROUP BY c.id, c.nombre
HAVING COUNT(u.id) > 0
ORDER BY porcentajeOcupacion DESC;

-- Reporte de morosidad por comunidad
SELECT 
    c.nombre,
    COUNT(DISTINCT u.id) as totalUnidades,
    COUNT(DISTINCT CASE WHEN cu.estado = 'vencido' THEN u.id END) as unidadesMorosas,
    ROUND((COUNT(DISTINCT CASE WHEN cu.estado = 'vencido' THEN u.id END) * 100.0) / COUNT(DISTINCT u.id), 1) as porcentajeMorosidad,
    SUM(CASE WHEN cu.estado = 'vencido' THEN cu.monto_total ELSE 0 END) as montoMoroso
FROM comunidad c
LEFT JOIN edificio e ON e.comunidad_id = c.id
LEFT JOIN unidad u ON u.edificio_id = e.id
LEFT JOIN cargo_unidad cu ON cu.unidad_id = u.id
WHERE c.estado = 'Activa'
GROUP BY c.id, c.nombre
HAVING COUNT(DISTINCT u.id) > 0
ORDER BY porcentajeMorosidad DESC;