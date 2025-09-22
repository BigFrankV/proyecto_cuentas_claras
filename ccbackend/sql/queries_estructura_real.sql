-- ============================================
-- QUERIES CORREGIDAS CON ESTRUCTURA REAL
-- ============================================

-- TEST 1: Listar todas las comunidades (estructura real)
SELECT 
    `c`.`id`,
    `c`.`razon_social` as `nombre`,
    `c`.`rut`,
    `c`.`dv`,
    `c`.`giro`,
    `c`.`direccion`,
    `c`.`email_contacto` as `email`,
    `c`.`telefono_contacto` as `telefono`,
    `c`.`created_at` as `fechaCreacion`
FROM `comunidad` `c`
ORDER BY `c`.`razon_social` ASC;

-- TEST 2: Detalle de una comunidad específica (cambiar 1 por ID real)
SELECT 
    `c`.`id`,
    `c`.`razon_social` as `nombre`,
    `c`.`rut`,
    `c`.`dv`,
    `c`.`giro`,
    `c`.`direccion`,
    `c`.`email_contacto` as `email`,
    `c`.`telefono_contacto` as `telefono`,
    `c`.`moneda`,
    `c`.`tz` as `zona_horaria`,
    
    -- Contador de unidades
    (SELECT COUNT(*) 
     FROM `unidad` `u` 
     WHERE `u`.`comunidad_id` = `c`.`id`) as `totalUnidades`,
     
    (SELECT COUNT(*) 
     FROM `unidad` `u` 
     WHERE `u`.`comunidad_id` = `c`.`id` AND `u`.`activa` = 1) as `unidadesActivas`,
     
    -- Contador de edificios
    (SELECT COUNT(*) 
     FROM `edificio` `e` 
     WHERE `e`.`comunidad_id` = `c`.`id`) as `totalEdificios`,
     
    -- Contador de amenidades
    (SELECT COUNT(*) 
     FROM `amenidad` `a` 
     WHERE `a`.`comunidad_id` = `c`.`id`) as `totalAmenidades`,
     
    -- Contador de residentes activos
    (SELECT COUNT(DISTINCT `mc`.`persona_id`) 
     FROM `membresia_comunidad` `mc` 
     WHERE `mc`.`comunidad_id` = `c`.`id` 
     AND `mc`.`activo` = 1 
     AND `mc`.`rol` IN ('residente', 'propietario')) as `totalResidentes`

FROM `comunidad` `c`
WHERE `c`.`id` = 1;

-- TEST 3: Edificios de una comunidad
SELECT 
    `e`.`id`,
    `e`.`nombre`,
    `e`.`direccion`,
    `e`.`codigo`,
    `e`.`created_at` as `fechaCreacion`
FROM `edificio` `e`
WHERE `e`.`comunidad_id` = 1
ORDER BY `e`.`nombre`;

-- TEST 4: Unidades de una comunidad
SELECT 
    `u`.`id`,
    `u`.`codigo`,
    `u`.`alicuota`,
    `u`.`m2_utiles`,
    `u`.`m2_terrazas`,
    `u`.`nro_bodega`,
    `u`.`nro_estacionamiento`,
    CASE 
        WHEN `u`.`activa` = 1 THEN 'Activa'
        ELSE 'Inactiva'
    END as `estado`,
    `e`.`nombre` as `edificio_nombre`
FROM `unidad` `u`
INNER JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id`
WHERE `u`.`comunidad_id` = 1
ORDER BY `e`.`nombre`, `u`.`codigo`;

-- TEST 5: Amenidades de una comunidad
SELECT 
    `a`.`id`,
    `a`.`nombre`,
    `a`.`reglas`,
    `a`.`capacidad`,
    CASE 
        WHEN `a`.`requiere_aprobacion` = 1 THEN 'Requiere Reserva'
        ELSE 'Disponible Libre'
    END as `tipo_reserva`,
    `a`.`tarifa`
FROM `amenidad` `a`
WHERE `a`.`comunidad_id` = 1
ORDER BY `a`.`nombre`;

-- TEST 6: Residentes de una comunidad con sus roles
SELECT 
    `p`.`id`,
    CONCAT(`p`.`nombres`, ' ', `p`.`apellidos`) as `nombre_completo`,
    `p`.`rut`,
    `p`.`dv`,
    `p`.`email`,
    `p`.`telefono`,
    `mc`.`rol`,
    `mc`.`desde`,
    `mc`.`hasta`,
    CASE 
        WHEN `mc`.`activo` = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as `estado_membresia`,
    `tu`.`tipo` as `tipo_tenencia`,
    `u`.`codigo` as `unidad_codigo`,
    `e`.`nombre` as `edificio_nombre`
FROM `persona` `p`
INNER JOIN `membresia_comunidad` `mc` ON `mc`.`persona_id` = `p`.`id`
LEFT JOIN `tenencia_unidad` `tu` ON `tu`.`persona_id` = `p`.`id` AND `tu`.`comunidad_id` = `mc`.`comunidad_id`
LEFT JOIN `unidad` `u` ON `u`.`id` = `tu`.`unidad_id`
LEFT JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id`
WHERE `mc`.`comunidad_id` = 1
ORDER BY `mc`.`rol`, `p`.`apellidos`, `p`.`nombres`;

-- TEST 6B: Versión simplificada - Solo miembros de comunidad (sin unidades)
SELECT 
    `p`.`id`,
    CONCAT(`p`.`nombres`, ' ', `p`.`apellidos`) as `nombre_completo`,
    `p`.`rut`,
    `p`.`email`,
    `p`.`telefono`,
    `mc`.`rol`,
    CASE 
        WHEN `mc`.`activo` = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as `estado`
FROM `persona` `p`
INNER JOIN `membresia_comunidad` `mc` ON `mc`.`persona_id` = `p`.`id`
WHERE `mc`.`comunidad_id` = 1
ORDER BY `mc`.`rol`, `p`.`apellidos`;

-- TEST 7: Documentos de una comunidad
SELECT 
    `d`.`id`,
    `d`.`tipo`,
    `d`.`titulo`,
    `d`.`url`,
    `d`.`periodo`,
    `d`.`visibilidad`,
    `d`.`created_at` as `fecha_creacion`
FROM `documento` `d`
WHERE `d`.`comunidad_id` = 1
ORDER BY `d`.`created_at` DESC;

-- TEST 8: Cargos pendientes de una comunidad
SELECT 
    `cu`.`id`,
    `cu`.`monto_total`,
    `cu`.`saldo`,
    `cu`.`estado`,
    `cu`.`interes_acumulado`,
    `u`.`codigo` as `unidad_codigo`,
    `e`.`nombre` as `edificio_nombre`,
    `cu`.`created_at` as `fecha_emision`
FROM `cargo_unidad` `cu`
INNER JOIN `unidad` `u` ON `u`.`id` = `cu`.`unidad_id`
INNER JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id`
WHERE `cu`.`comunidad_id` = 1
AND `cu`.`estado` IN ('pendiente', 'parcial')
ORDER BY `cu`.`created_at` DESC;

-- TEST 9: Gastos de una comunidad
SELECT 
    `g`.`id`,
    `g`.`fecha`,
    `g`.`monto`,
    `g`.`glosa`,
    CASE 
        WHEN `g`.`extraordinario` = 1 THEN 'Extraordinario'
        ELSE 'Ordinario'
    END as `tipo_gasto`,
    `cg`.`nombre` as `categoria`,
    `cc`.`nombre` as `centro_costo`
FROM `gasto` `g`
LEFT JOIN `categoria_gasto` `cg` ON `cg`.`id` = `g`.`categoria_id`
LEFT JOIN `centro_costo` `cc` ON `cc`.`id` = `g`.`centro_costo_id`
WHERE `g`.`comunidad_id` = 1
ORDER BY `g`.`fecha` DESC;

-- TEST 10: Verificar estructura de tablas principales
DESCRIBE `comunidad`;
DESCRIBE `edificio`;
DESCRIBE `unidad`;
DESCRIBE `membresia_comunidad`;
DESCRIBE `persona`;
DESCRIBE `amenidad`;
DESCRIBE `documento`;
DESCRIBE `cargo_unidad`;
DESCRIBE `gasto`;

-- TEST 11: Query simple para empezar - ver qué comunidades tienes
SELECT `id`, `razon_social` as `nombre` FROM `comunidad` LIMIT 5;