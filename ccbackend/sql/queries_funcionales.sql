-- ============================================
-- QUERIES SIMPLIFICADAS Y FUNCIONALES PARA PHPMYADMIN
-- ============================================

-- TEST 1: Listar comunidades (FUNCIONA)
SELECT 
    `c`.`id`,
    `c`.`razon_social` as `nombre`,
    `c`.`direccion`,
    `c`.`email_contacto` as `email`,
    `c`.`telefono_contacto` as `telefono`
FROM `comunidad` `c`
ORDER BY `c`.`razon_social` ASC;

-- TEST 2: Detalle de comunidad (cambiar 1 por ID real)
SELECT 
    `c`.`id`,
    `c`.`razon_social` as `nombre`,
    `c`.`rut`,
    `c`.`direccion`,
    `c`.`email_contacto` as `email`,
    `c`.`telefono_contacto` as `telefono`,
    `c`.`moneda`
FROM `comunidad` `c`
WHERE `c`.`id` = 1;

-- TEST 3: Edificios (FUNCIONA)
SELECT 
    `e`.`id`,
    `e`.`nombre`,
    `e`.`direccion`,
    `e`.`codigo`
FROM `edificio` `e`
WHERE `e`.`comunidad_id` = 1
ORDER BY `e`.`nombre`;

-- TEST 4: Unidades (FUNCIONA)
SELECT 
    `u`.`id`,
    `u`.`codigo`,
    `u`.`alicuota`,
    `u`.`m2_utiles`,
    CASE 
        WHEN `u`.`activa` = 1 THEN 'Activa'
        ELSE 'Inactiva'
    END as `estado`,
    `e`.`nombre` as `edificio`
FROM `unidad` `u`
INNER JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id`
WHERE `u`.`comunidad_id` = 1
ORDER BY `e`.`nombre`, `u`.`codigo`;

-- TEST 5: Amenidades (FUNCIONA)
SELECT 
    `a`.`id`,
    `a`.`nombre`,
    `a`.`reglas`,
    `a`.`capacidad`,
    `a`.`tarifa`
FROM `amenidad` `a`
WHERE `a`.`comunidad_id` = 1
ORDER BY `a`.`nombre`;

-- TEST 6: Documentos (FUNCIONA)
SELECT 
    `d`.`id`,
    `d`.`titulo` as `nombre`,
    `d`.`tipo`,
    `d`.`url`,
    `d`.`visibilidad`,
    `d`.`created_at` as `fecha`
FROM `documento` `d`
WHERE `d`.`comunidad_id` = 1
ORDER BY `d`.`created_at` DESC;

-- TEST 7: Miembros de comunidad (FUNCIONA)
SELECT 
    `p`.`id`,
    CONCAT(`p`.`nombres`, ' ', `p`.`apellidos`) as `nombre`,
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

-- TEST 8: Miembros con sus unidades (FUNCIONA)
SELECT 
    `p`.`id`,
    CONCAT(`p`.`nombres`, ' ', `p`.`apellidos`) as `nombre`,
    `mc`.`rol`,
    `tu`.`tipo` as `tipo_tenencia`,
    `u`.`codigo` as `unidad`,
    `e`.`nombre` as `edificio`
FROM `persona` `p`
INNER JOIN `membresia_comunidad` `mc` ON `mc`.`persona_id` = `p`.`id`
LEFT JOIN `tenencia_unidad` `tu` ON `tu`.`persona_id` = `p`.`id` AND `tu`.`comunidad_id` = `mc`.`comunidad_id`
LEFT JOIN `unidad` `u` ON `u`.`id` = `tu`.`unidad_id`
LEFT JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id`
WHERE `mc`.`comunidad_id` = 1
ORDER BY `mc`.`rol`, `p`.`apellidos`;

-- TEST 9: Configuración de intereses (FUNCIONA)
SELECT 
    `ci`.`id`,
    `ci`.`aplica_desde`,
    `ci`.`tasa_mensual`,
    `ci`.`metodo`,
    `ci`.`tope_mensual`
FROM `configuracion_interes` `ci`
WHERE `ci`.`comunidad_id` = 1;

-- TEST 10: Cargos pendientes (FUNCIONA)
SELECT 
    `cu`.`id`,
    `cu`.`monto_total`,
    `cu`.`saldo`,
    `cu`.`estado`,
    `cu`.`created_at` as `fecha_emision`
FROM `cargo_unidad` `cu`
WHERE `cu`.`comunidad_id` = 1
AND `cu`.`estado` IN ('pendiente', 'parcial')
ORDER BY `cu`.`created_at` DESC;

-- TEST 11: Gastos (FUNCIONA)
SELECT 
    `g`.`id`,
    `g`.`fecha`,
    `g`.`monto`,
    `g`.`glosa`,
    CASE 
        WHEN `g`.`extraordinario` = 1 THEN 'Extraordinario'
        ELSE 'Ordinario'
    END as `tipo`
FROM `gasto` `g`
WHERE `g`.`comunidad_id` = 1
ORDER BY `g`.`fecha` DESC;

-- TEST 12: Resumen financiero simple
SELECT 
    (SELECT COUNT(*) FROM `unidad` WHERE `comunidad_id` = 1) as `total_unidades`,
    (SELECT COUNT(*) FROM `unidad` WHERE `comunidad_id` = 1 AND `activa` = 1) as `unidades_activas`,
    (SELECT COUNT(DISTINCT `persona_id`) FROM `membresia_comunidad` WHERE `comunidad_id` = 1 AND `activo` = 1) as `total_miembros`,
    (SELECT COALESCE(SUM(`saldo`), 0) FROM `cargo_unidad` WHERE `comunidad_id` = 1 AND `estado` IN ('pendiente', 'parcial')) as `saldo_pendiente`;

-- TEST BÁSICO: Solo para verificar conexión
SELECT `id`, `razon_social` FROM `comunidad` WHERE `id` = 1;