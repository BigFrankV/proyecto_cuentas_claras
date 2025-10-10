-- ============================================================================
-- Script de Creación de Vistas - Cuentas Claras
-- ============================================================================
-- Fecha: 2025-10-10
-- Descripción: Script para crear/recrear todas las vistas del sistema
-- Base de datos: cuentasclaras
-- 
-- Uso:
--   mysql -u cuentasclaras -p cuentasclaras < crear_vistas.sql
--   
--   O en Docker:
--   docker exec -i <container_name> mysql -u cuentasclaras -p cuentasclaras < crear_vistas.sql
-- ============================================================================

USE cuentasclaras;

-- ============================================================================
-- 1. Vista: bitacora_conserjeria
-- ============================================================================
-- Descripción: Vista simplificada del registro de conserjería
-- Tabla base: registro_conserjeria
-- ============================================================================

DROP VIEW IF EXISTS `bitacora_conserjeria`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `bitacora_conserjeria` AS 
SELECT 
    `registro_conserjeria`.`id` AS `id`,
    `registro_conserjeria`.`comunidad_id` AS `comunidad_id`,
    `registro_conserjeria`.`fecha_hora` AS `fecha_hora`,
    `registro_conserjeria`.`usuario_id` AS `usuario_id`,
    `registro_conserjeria`.`evento` AS `evento`,
    `registro_conserjeria`.`detalle` AS `detalle`,
    `registro_conserjeria`.`created_at` AS `created_at`
FROM 
    `registro_conserjeria`;

-- ============================================================================
-- 2. Vista: cargo_financiero_unidad
-- ============================================================================
-- Descripción: Vista simplificada de los cargos financieros por unidad
-- Tabla base: cuenta_cobro_unidad
-- ============================================================================

DROP VIEW IF EXISTS `cargo_financiero_unidad`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `cargo_financiero_unidad` AS 
SELECT 
    `cuenta_cobro_unidad`.`id` AS `id`,
    `cuenta_cobro_unidad`.`emision_id` AS `emision_id`,
    `cuenta_cobro_unidad`.`comunidad_id` AS `comunidad_id`,
    `cuenta_cobro_unidad`.`unidad_id` AS `unidad_id`,
    `cuenta_cobro_unidad`.`monto_total` AS `monto_total`,
    `cuenta_cobro_unidad`.`saldo` AS `saldo`,
    `cuenta_cobro_unidad`.`estado` AS `estado`,
    `cuenta_cobro_unidad`.`interes_acumulado` AS `interes_acumulado`,
    `cuenta_cobro_unidad`.`created_at` AS `created_at`,
    `cuenta_cobro_unidad`.`updated_at` AS `updated_at`
FROM 
    `cuenta_cobro_unidad`;

-- ============================================================================
-- 3. Vista: detalle_cargo_unidad
-- ============================================================================
-- Descripción: Vista con alias para detalles de cargos por unidad
-- Tabla base: detalle_cuenta_unidad
-- Nota: Renombra cuenta_cobro_unidad_id a cargo_unidad_id
-- ============================================================================

DROP VIEW IF EXISTS `detalle_cargo_unidad`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `detalle_cargo_unidad` AS 
SELECT 
    `detalle_cuenta_unidad`.`id` AS `id`,
    `detalle_cuenta_unidad`.`cuenta_cobro_unidad_id` AS `cargo_unidad_id`,
    `detalle_cuenta_unidad`.`categoria_id` AS `categoria_id`,
    `detalle_cuenta_unidad`.`glosa` AS `glosa`,
    `detalle_cuenta_unidad`.`monto` AS `monto`,
    `detalle_cuenta_unidad`.`origen` AS `origen`,
    `detalle_cuenta_unidad`.`origen_id` AS `origen_id`,
    `detalle_cuenta_unidad`.`iva_incluido` AS `iva_incluido`,
    `detalle_cuenta_unidad`.`created_at` AS `created_at`,
    `detalle_cuenta_unidad`.`updated_at` AS `updated_at`
FROM 
    `detalle_cuenta_unidad`;

-- ============================================================================
-- 4. Vista: emision_gasto_comun
-- ============================================================================
-- Descripción: Vista simplificada de emisiones de gastos comunes
-- Tabla base: emision_gastos_comunes
-- ============================================================================

DROP VIEW IF EXISTS `emision_gasto_comun`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `emision_gasto_comun` AS 
SELECT 
    `emision_gastos_comunes`.`id` AS `id`,
    `emision_gastos_comunes`.`comunidad_id` AS `comunidad_id`,
    `emision_gastos_comunes`.`periodo` AS `periodo`,
    `emision_gastos_comunes`.`fecha_vencimiento` AS `fecha_vencimiento`,
    `emision_gastos_comunes`.`estado` AS `estado`,
    `emision_gastos_comunes`.`observaciones` AS `observaciones`,
    `emision_gastos_comunes`.`created_at` AS `created_at`,
    `emision_gastos_comunes`.`updated_at` AS `updated_at`
FROM 
    `emision_gastos_comunes`;

-- ============================================================================
-- 5. Vista: emision_gasto_detalle
-- ============================================================================
-- Descripción: Vista de detalles de emisión de gastos
-- Tabla base: detalle_emision
-- ============================================================================

DROP VIEW IF EXISTS `emision_gasto_detalle`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `emision_gasto_detalle` AS 
SELECT 
    `detalle_emision`.`id` AS `id`,
    `detalle_emision`.`emision_id` AS `emision_id`,
    `detalle_emision`.`gasto_id` AS `gasto_id`,
    `detalle_emision`.`categoria_id` AS `categoria_id`,
    `detalle_emision`.`monto` AS `monto`,
    `detalle_emision`.`regla_prorrateo` AS `regla_prorrateo`,
    `detalle_emision`.`metadata_json` AS `metadata_json`,
    `detalle_emision`.`created_at` AS `created_at`,
    `detalle_emision`.`updated_at` AS `updated_at`
FROM 
    `detalle_emision`;

-- ============================================================================
-- 6. Vista: ticket
-- ============================================================================
-- Descripción: Vista simplificada de tickets de soporte
-- Tabla base: solicitud_soporte
-- ============================================================================

DROP VIEW IF EXISTS `ticket`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `ticket` AS 
SELECT 
    `solicitud_soporte`.`id` AS `id`,
    `solicitud_soporte`.`comunidad_id` AS `comunidad_id`,
    `solicitud_soporte`.`unidad_id` AS `unidad_id`,
    `solicitud_soporte`.`categoria` AS `categoria`,
    `solicitud_soporte`.`titulo` AS `titulo`,
    `solicitud_soporte`.`descripcion` AS `descripcion`,
    `solicitud_soporte`.`estado` AS `estado`,
    `solicitud_soporte`.`prioridad` AS `prioridad`,
    `solicitud_soporte`.`asignado_a` AS `asignado_a`,
    `solicitud_soporte`.`attachments_json` AS `attachments_json`,
    `solicitud_soporte`.`created_at` AS `created_at`,
    `solicitud_soporte`.`updated_at` AS `updated_at`
FROM 
    `solicitud_soporte`;

-- ============================================================================
-- 7. Vista: titularidad_unidad
-- ============================================================================
-- Descripción: Vista simplificada de titularidad de unidades
-- Tabla base: titulares_unidad
-- ============================================================================

DROP VIEW IF EXISTS `titularidad_unidad`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`api_admin`@`%` 
SQL SECURITY DEFINER 
VIEW `titularidad_unidad` AS 
SELECT 
    `titulares_unidad`.`id` AS `id`,
    `titulares_unidad`.`comunidad_id` AS `comunidad_id`,
    `titulares_unidad`.`unidad_id` AS `unidad_id`,
    `titulares_unidad`.`persona_id` AS `persona_id`,
    `titulares_unidad`.`tipo` AS `tipo`,
    `titulares_unidad`.`desde` AS `desde`,
    `titulares_unidad`.`hasta` AS `hasta`,
    `titulares_unidad`.`porcentaje` AS `porcentaje`,
    `titulares_unidad`.`created_at` AS `created_at`,
    `titulares_unidad`.`updated_at` AS `updated_at`
FROM 
    `titulares_unidad`;

-- ============================================================================
-- 8. Vista: usuario_miembro_comunidad
-- ============================================================================
-- Descripción: Vista con JOIN de usuarios, roles y comunidades
-- Tablas base: usuario_rol_comunidad, usuario, rol_sistema
-- Nota: Usa SECURITY INVOKER (diferente a las demás)
-- ============================================================================

DROP VIEW IF EXISTS `usuario_miembro_comunidad`;

CREATE OR REPLACE 
ALGORITHM=UNDEFINED 
DEFINER=`root`@`localhost` 
SQL SECURITY INVOKER 
VIEW `usuario_miembro_comunidad` AS 
SELECT 
    `urc`.`id` AS `id`,
    `urc`.`comunidad_id` AS `comunidad_id`,
    `u`.`persona_id` AS `persona_id`,
    `r`.`codigo` AS `rol`,
    `urc`.`desde` AS `desde`,
    `urc`.`hasta` AS `hasta`,
    `urc`.`activo` AS `activo`,
    `urc`.`created_at` AS `created_at`,
    `urc`.`updated_at` AS `updated_at`
FROM 
    `usuario_rol_comunidad` AS `urc`
    INNER JOIN `usuario` AS `u` ON `u`.`id` = `urc`.`usuario_id`
    INNER JOIN `rol_sistema` AS `r` ON `r`.`id` = `urc`.`rol_id`;

-- ============================================================================
-- Verificación de Vistas Creadas
-- ============================================================================

SELECT 
    TABLE_NAME AS 'Vista Creada',
    TABLE_TYPE AS 'Tipo'
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'cuentasclaras' 
    AND TABLE_TYPE = 'VIEW'
ORDER BY 
    TABLE_NAME;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Total de vistas creadas: 8
--
-- 1. bitacora_conserjeria
-- 2. cargo_financiero_unidad
-- 3. detalle_cargo_unidad
-- 4. emision_gasto_comun
-- 5. emision_gasto_detalle
-- 6. ticket
-- 7. titularidad_unidad
-- 8. usuario_miembro_comunidad
--
-- Todas las vistas han sido creadas exitosamente!
-- ============================================================================
