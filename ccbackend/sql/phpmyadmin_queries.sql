-- ============================================
-- QUERIES PARA PHPMYADMIN - CON BACKTICKS
-- ============================================

-- TEST 1: Listar todas las comunidades
SELECT 
    `c`.`id`,
    `c`.`nombre`,
    `c`.`direccion`,
    `c`.`comuna`,
    `c`.`region`,
    `c`.`tipo`,
    `c`.`estado`,
    `c`.`administrador_nombre` as `administrador`
FROM `comunidad` `c`
WHERE `c`.`estado` != 'Eliminada'
ORDER BY `c`.`nombre` ASC;

-- TEST 2: Detalle de una comunidad específica (reemplazar 1 con ID real)
SELECT 
    `c`.`id`,
    `c`.`nombre`,
    `c`.`direccion`,
    `c`.`comuna`,
    `c`.`region`,
    `c`.`tipo`,
    `c`.`estado`,
    `c`.`descripcion`,
    `c`.`administrador_nombre`,
    `c`.`telefono_comunidad`,
    `c`.`email_comunidad`,
    
    -- Contador de unidades
    (SELECT COUNT(*) 
     FROM `unidad` `u` 
     INNER JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id` 
     WHERE `e`.`comunidad_id` = `c`.`id`) as `totalUnidades`,
     
    (SELECT COUNT(*) 
     FROM `unidad` `u` 
     INNER JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id` 
     WHERE `e`.`comunidad_id` = `c`.`id` AND `u`.`activa` = 1) as `unidadesOcupadas`,
     
    -- Contador de residentes activos
    (SELECT COUNT(DISTINCT `mc`.`persona_id`) 
     FROM `membresia_comunidad` `mc` 
     WHERE `mc`.`comunidad_id` = `c`.`id` 
     AND `mc`.`activo` = 1 
     AND `mc`.`rol` IN ('residente', 'propietario')) as `totalResidentes`,
     
    -- Contador de edificios
    (SELECT COUNT(*) 
     FROM `edificio` `e` 
     WHERE `e`.`comunidad_id` = `c`.`id`) as `totalEdificios`,
     
    -- Contador de amenidades
    (SELECT COUNT(*) 
     FROM `amenidad` `a` 
     WHERE `a`.`comunidad_id` = `c`.`id` AND `a`.`activo` = 1) as `totalAmenidades`

FROM `comunidad` `c`
WHERE `c`.`id` = 1;

-- TEST 3: Edificios de una comunidad
SELECT 
    `e`.`id`,
    `e`.`nombre`,
    `e`.`pisos`,
    `e`.`unidades_por_piso` as `unidadesPorPiso`,
    (`e`.`pisos` * `e`.`unidades_por_piso`) as `totalUnidades`,
    CASE 
        WHEN `e`.`estado` = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as `estado`
FROM `edificio` `e`
WHERE `e`.`comunidad_id` = 1
ORDER BY `e`.`nombre`;

-- TEST 4: Amenidades de una comunidad
SELECT 
    `a`.`id`,
    `a`.`nombre`,
    `a`.`reglas` as `descripcion`,
    CASE 
        WHEN `a`.`requiere_aprobacion` = 1 THEN 'Requiere Reserva'
        ELSE 'Disponible'
    END as `estado`,
    `a`.`tarifa` as `costoReserva`
FROM `amenidad` `a`
WHERE `a`.`comunidad_id` = 1
AND `a`.`activo` = 1
ORDER BY `a`.`nombre`;

-- TEST 5: Residentes de una comunidad  
SELECT 
    `p`.`id`,
    CONCAT(`p`.`nombres`, ' ', `p`.`apellidos`) as `nombre`,
    CONCAT(`e`.`nombre`, '-', `u`.`numero`) as `unidad`,
    `mc`.`rol` as `tipo`,
    `p`.`telefono`,
    `p`.`email`,
    CASE 
        WHEN `mc`.`activo` = 1 THEN 'Activo'
        ELSE 'Inactivo'
    END as `estado`
FROM `persona` `p`
INNER JOIN `membresia_comunidad` `mc` ON `mc`.`persona_id` = `p`.`id`
INNER JOIN `unidad` `u` ON `u`.`id` = `mc`.`unidad_id`
INNER JOIN `edificio` `e` ON `e`.`id` = `u`.`edificio_id`
WHERE `mc`.`comunidad_id` = 1
ORDER BY `e`.`nombre`, `u`.`numero`;

-- TEST 6: Documentos de una comunidad
SELECT 
    `d`.`id`,
    `d`.`nombre`,
    `d`.`tipo_documento` as `tipo`,
    `d`.`ruta_archivo` as `url`,
    `d`.`fecha_documento` as `fechaSubida`
FROM `documento` `d`
WHERE `d`.`comunidad_id` = 1
ORDER BY `d`.`fecha_documento` DESC;

-- TEST 7: Verificar que existen las tablas
SHOW TABLES LIKE 'comunidad';
SHOW TABLES LIKE 'membresia_comunidad';
SHOW TABLES LIKE 'persona';
SHOW TABLES LIKE 'edificio';
SHOW TABLES LIKE 'unidad';

-- TEST 8: Ver estructura de tabla comunidad
DESCRIBE `comunidad`;

-- TEST 9: Query más simple para empezar
-- CONSULTAS PARA COMUNIDADES - FORMATO PHPMYADMIN
-- Reemplazar el 3 por el ID de la comunidad que quieras consultar

-- 1. INFORMACIÓN BÁSICA DE LA COMUNIDAD
SELECT * FROM `comunidad` WHERE `id` = 3;

-- 2. EDIFICIOS DE LA COMUNIDAD
SELECT `e`.`id`, `e`.`nombre`, `e`.`direccion`, `e`.`codigo`
FROM `edificio` `e`
WHERE `e`.`comunidad_id` = 3;

-- 3. UNIDADES DE LA COMUNIDAD
SELECT `u`.`id`, `u`.`codigo`, `u`.`edificio_id`, `u`.`alicuota`, `u`.`activa`,
       `e`.`nombre` as `edificio_nombre`
FROM `unidad` `u`
INNER JOIN `edificio` `e` ON `u`.`edificio_id` = `e`.`id`
WHERE `e`.`comunidad_id` = 3;

-- 4. MIEMBROS DE LA COMUNIDAD
SELECT `p`.`id`, `p`.`nombres`, `p`.`apellidos`, `p`.`rut`, `p`.`email`,
       `mc`.`rol`, `mc`.`activo`
FROM `persona` `p`
INNER JOIN `membresia_comunidad` `mc` ON `p`.`id` = `mc`.`persona_id`
WHERE `mc`.`comunidad_id` = 3 AND `mc`.`activo` = 1;

-- 5. RESIDENTES POR UNIDAD
SELECT `u`.`codigo` as `unidad_codigo`, 
       `p`.`nombres`, `p`.`apellidos`,
       `tu`.`tipo`
FROM `unidad` `u`
INNER JOIN `edificio` `e` ON `u`.`edificio_id` = `e`.`id`
INNER JOIN `tenencia_unidad` `tu` ON `u`.`id` = `tu`.`unidad_id`
INNER JOIN `persona` `p` ON `tu`.`persona_id` = `p`.`id`
WHERE `e`.`comunidad_id` = 3;

-- 6. DOCUMENTOS DE LA COMUNIDAD
SELECT `d`.`id`, `d`.`titulo`, `d`.`tipo`, `d`.`url`
FROM `documento` `d`
WHERE `d`.`comunidad_id` = 3;

-- 7. CARGOS PENDIENTES
SELECT `cu`.`id`, `cu`.`monto_total`, `cu`.`saldo`, `cu`.`estado`,
       `u`.`codigo` as `unidad_codigo`
FROM `cargo_unidad` `cu`
INNER JOIN `unidad` `u` ON `cu`.`unidad_id` = `u`.`id`
INNER JOIN `edificio` `e` ON `u`.`edificio_id` = `e`.`id`
WHERE `e`.`comunidad_id` = 3 AND `cu`.`estado` IN ('pendiente', 'parcial');

-- 8. GASTOS RECIENTES
SELECT `g`.`id`, `g`.`descripcion`, `g`.`monto`, `g`.`fecha`,
       `cg`.`nombre` as `categoria`
FROM `gasto` `g`
INNER JOIN `categoria_gasto` `cg` ON `g`.`categoria_id` = `cg`.`id`
WHERE `g`.`comunidad_id` = 3
ORDER BY `g`.`fecha` DESC
LIMIT 10;

-- 9. ESTADÍSTICAS FINANCIERAS (CORREGIDO)
SELECT 
    -- Ingresos totales del mes actual
    SUM(`cu`.`monto_total`) as `totalIngresos`,
    SUM(CASE WHEN `cu`.`estado` = 'pagado' THEN `cu`.`monto_total` ELSE 0 END) as `ingresosPagados`,
    SUM(CASE WHEN `cu`.`estado` IN ('pendiente', 'parcial') THEN `cu`.`saldo` ELSE 0 END) as `ingresosPendientes`,
    
    -- Gastos por tipo del mes actual
    COALESCE((SELECT SUM(`g2`.`monto`) 
              FROM `gasto` `g2` 
              INNER JOIN `categoria_gasto` `gc2` ON `g2`.`categoria_id` = `gc2`.`id`
              WHERE `g2`.`comunidad_id` = 3
              AND `gc2`.`nombre` = 'Servicios Básicos'
              AND MONTH(`g2`.`fecha`) = MONTH(CURDATE()) 
              AND YEAR(`g2`.`fecha`) = YEAR(CURDATE())), 0) as `serviciosBasicos`,
              
    COALESCE((SELECT SUM(`g3`.`monto`) 
              FROM `gasto` `g3` 
              INNER JOIN `categoria_gasto` `gc3` ON `g3`.`categoria_id` = `gc3`.`id`
              WHERE `g3`.`comunidad_id` = 3
              AND `gc3`.`nombre` = 'Mantenimiento'
              AND MONTH(`g3`.`fecha`) = MONTH(CURDATE()) 
              AND YEAR(`g3`.`fecha`) = YEAR(CURDATE())), 0) as `mantenimiento`,
              
    COALESCE((SELECT SUM(`g4`.`monto`) 
              FROM `gasto` `g4` 
              INNER JOIN `categoria_gasto` `gc4` ON `g4`.`categoria_id` = `gc4`.`id`
              WHERE `g4`.`comunidad_id` = 3
              AND `gc4`.`nombre` = 'Administración'
              AND MONTH(`g4`.`fecha`) = MONTH(CURDATE()) 
              AND YEAR(`g4`.`fecha`) = YEAR(CURDATE())), 0) as `administracion`
    
FROM `cargo_unidad` `cu`
INNER JOIN `unidad` `u` ON `cu`.`unidad_id` = `u`.`id`
INNER JOIN `edificio` `e` ON `u`.`edificio_id` = `e`.`id`
WHERE `e`.`comunidad_id` = 3
    AND MONTH(`cu`.`created_at`) = MONTH(CURDATE()) 
    AND YEAR(`cu`.`created_at`) = YEAR(CURDATE());

-- 10. CONFIGURACIÓN DE INTERESES
SELECT * FROM `configuracion_interes` WHERE `comunidad_id` = 3;

-- Prueba simple para verificar que todo funciona
SELECT `id`, `razon_social` FROM `comunidad` WHERE 1 LIMIT 5;