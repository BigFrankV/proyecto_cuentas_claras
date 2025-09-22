-- ============================================
-- QUERIES DE PRUEBA - TABLA NOMBRES CORREGIDOS
-- ============================================

-- TEST 1: Listar todas las comunidades
SELECT 
    c.id,
    c.nombre,
    c.direccion,
    c.comuna,
    c.region,
    c.tipo,
    c.estado,
    c.administrador_nombre as administrador
FROM comunidad c
WHERE c.estado != 'Eliminada'
ORDER BY c.nombre ASC;

-- TEST 2: Detalle de una comunidad específica (reemplazar ? con ID real)
SELECT 
    c.id,
    c.nombre,
    c.direccion,
    c.comuna,
    c.region,
    c.tipo,
    c.estado,
    c.descripcion,
    c.administrador_nombre,
    c.telefono_comunidad,
    c.email_comunidad,
    
    -- Contador de unidades
    (SELECT COUNT(*) 
     FROM unidad u 
     INNER JOIN edificio e ON e.id = u.edificio_id 
     WHERE e.comunidad_id = c.id) as totalUnidades,
     
    (SELECT COUNT(*) 
     FROM unidad u 
     INNER JOIN edificio e ON e.id = u.edificio_id 
     WHERE e.comunidad_id = c.id AND u.activa = 1) as unidadesOcupadas,
     
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
     WHERE a.comunidad_id = c.id AND a.activo = 1) as totalAmenidades

FROM comunidad c
WHERE c.id = 1; -- CAMBIAR POR ID REAL

-- TEST 3: Edificios de una comunidad
SELECT 
    e.id,
    e.nombre,
    e.pisos,
    e.unidades_por_piso as unidadesPorPiso,
    (e.pisos * e.unidades_por_piso) as totalUnidades,
    CASE 
        WHEN e.estado = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as estado
FROM edificio e
WHERE e.comunidad_id = 1 -- CAMBIAR POR ID REAL
ORDER BY e.nombre;

-- TEST 4: Amenidades de una comunidad
SELECT 
    a.id,
    a.nombre,
    a.reglas as descripcion,
    CASE 
        WHEN a.requiere_aprobacion = 1 THEN 'Requiere Reserva'
        ELSE 'Disponible'
    END as estado,
    a.tarifa as costoReserva
FROM amenidad a
WHERE a.comunidad_id = 1 -- CAMBIAR POR ID REAL
AND a.activo = 1
ORDER BY a.nombre;

-- TEST 5: Residentes de una comunidad  
SELECT 
    p.id,
    CONCAT(p.nombres, ' ', p.apellidos) as nombre,
    CONCAT(e.nombre, '-', u.numero) as unidad,
    mc.rol as tipo,
    p.telefono,
    p.email,
    CASE 
        WHEN mc.activo = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as estado
FROM persona p
INNER JOIN membresia_comunidad mc ON mc.persona_id = p.id
INNER JOIN unidad u ON u.id = mc.unidad_id
INNER JOIN edificio e ON e.id = u.edificio_id
WHERE mc.comunidad_id = 1 -- CAMBIAR POR ID REAL
ORDER BY e.nombre, u.numero;

-- TEST 6: Documentos de una comunidad
SELECT 
    d.id,
    d.nombre,
    d.tipo_documento as tipo,
    d.ruta_archivo as url,
    d.fecha_documento as fechaSubida
FROM documento d
WHERE d.comunidad_id = 1 -- CAMBIAR POR ID REAL
ORDER BY d.fecha_documento DESC;

-- TEST 7: Verificar estructura de tablas principales
DESCRIBE comunidad;
DESCRIBE edificio;
DESCRIBE unidad;
DESCRIBE membresia_comunidad;
DESCRIBE persona;
DESCRIBE amenidad;
DESCRIBE documento;
DESCRIBE cargo_unidad;
DESCRIBE gasto;