-- =====================================================
-- SCRIPT DE ROLLBACK
-- Proyecto: Cuentas Claras
-- Fecha: Octubre 2025
-- =====================================================
-- 
-- Este script revierte los cambios realizados por
-- migracion_estructura_mejorada.sql
--
-- ADVERTENCIA: Solo ejecutar si la migración falló
-- y necesitas volver al estado anterior
-- =====================================================

USE `cuentasclaras`;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- PASO 1: ELIMINAR VISTAS DE COMPATIBILIDAD
-- =====================================================

DROP VIEW IF EXISTS `cargo_unidad`;
DROP VIEW IF EXISTS `cargo_unidad_detalle`;
DROP VIEW IF EXISTS `membresia_comunidad`;
DROP VIEW IF EXISTS `emision_gasto_comun`;
DROP VIEW IF EXISTS `emision_gasto_detalle`;
DROP VIEW IF EXISTS `tenencia_unidad`;
DROP VIEW IF EXISTS `ticket`;
DROP VIEW IF EXISTS `bitacora_conserjeria`;

-- =====================================================
-- PASO 2: RENOMBRAR TABLAS A SUS NOMBRES ORIGINALES
-- =====================================================

-- Solo si las tablas nuevas existen
RENAME TABLE IF EXISTS `cuenta_cobro_unidad` TO `cargo_unidad`;
RENAME TABLE IF EXISTS `detalle_cuenta_unidad` TO `cargo_unidad_detalle`;
RENAME TABLE IF EXISTS `emision_gastos_comunes` TO `emision_gasto_comun`;
RENAME TABLE IF EXISTS `detalle_emision` TO `emision_gasto_detalle`;
RENAME TABLE IF EXISTS `titulares_unidad` TO `tenencia_unidad`;
RENAME TABLE IF EXISTS `solicitud_soporte` TO `ticket`;
RENAME TABLE IF EXISTS `registro_conserjeria` TO `bitacora_conserjeria`;

-- =====================================================
-- PASO 3: REVERTIR CAMBIOS EN COLUMNAS
-- =====================================================

-- Revertir cambio de columna en cargo_unidad_detalle
ALTER TABLE `cargo_unidad_detalle`
  CHANGE COLUMN `cuenta_cobro_unidad_id` `cargo_unidad_id` bigint NOT NULL;

-- Revertir cambio de columna en pago_aplicacion
ALTER TABLE `pago_aplicacion`
  CHANGE COLUMN `cuenta_cobro_unidad_id` `cargo_unidad_id` bigint NOT NULL;

-- Revertir persona_id en usuario a nullable
ALTER TABLE `usuario` 
  MODIFY `persona_id` bigint DEFAULT NULL COMMENT 'FK opcional a tabla persona';

-- Revertir comentario de is_superadmin
ALTER TABLE `usuario` 
  MODIFY `is_superadmin` tinyint(1) NOT NULL DEFAULT '0';

-- =====================================================
-- PASO 4: RESTAURAR FOREIGN KEYS ORIGINALES
-- =====================================================

-- cargo_unidad
ALTER TABLE `cargo_unidad`
  DROP FOREIGN KEY IF EXISTS `fk_cuenta_emision`,
  DROP FOREIGN KEY IF EXISTS `fk_cuenta_comunidad`;

ALTER TABLE `cargo_unidad`
  ADD CONSTRAINT `fk_cargo_emision` 
    FOREIGN KEY (`emision_id`) REFERENCES `emision_gasto_comun` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cargo_comunidad` 
    FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE;

-- cargo_unidad_detalle
ALTER TABLE `cargo_unidad_detalle`
  DROP FOREIGN KEY IF EXISTS `fk_detalle_categoria`,
  DROP FOREIGN KEY IF EXISTS `fk_detalle_cuenta`;

ALTER TABLE `cargo_unidad_detalle`
  ADD CONSTRAINT `fk_cargodet_categoria` 
    FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`) ON DELETE RESTRICT;

-- emision_gasto_detalle
ALTER TABLE `emision_gasto_detalle`
  DROP FOREIGN KEY IF EXISTS `fk_detemision_emision`,
  DROP FOREIGN KEY IF EXISTS `fk_detemision_categoria`;

ALTER TABLE `emision_gasto_detalle`
  ADD CONSTRAINT `fk_emisdet_emision` 
    FOREIGN KEY (`emision_id`) REFERENCES `emision_gasto_comun` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_emisdet_categoria` 
    FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`) ON DELETE RESTRICT;

-- tenencia_unidad
ALTER TABLE `tenencia_unidad`
  DROP FOREIGN KEY IF EXISTS `fk_titular_comunidad`,
  DROP FOREIGN KEY IF EXISTS `fk_titular_unidad`,
  DROP FOREIGN KEY IF EXISTS `fk_titular_persona`;

ALTER TABLE `tenencia_unidad`
  ADD CONSTRAINT `fk_tenencia_comunidad` 
    FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tenencia_unidad` 
    FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tenencia_persona` 
    FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE CASCADE;

-- ticket
ALTER TABLE `ticket`
  DROP FOREIGN KEY IF EXISTS `fk_solicitud_comunidad`,
  DROP FOREIGN KEY IF EXISTS `fk_solicitud_unidad`,
  DROP FOREIGN KEY IF EXISTS `fk_solicitud_asignado`;

ALTER TABLE `ticket`
  ADD CONSTRAINT `fk_ticket_comunidad` 
    FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ticket_unidad` 
    FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ticket_asignado` 
    FOREIGN KEY (`asignado_a`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

-- bitacora_conserjeria
ALTER TABLE `bitacora_conserjeria`
  DROP FOREIGN KEY IF EXISTS `fk_registro_comunidad`;

ALTER TABLE `bitacora_conserjeria`
  ADD CONSTRAINT `fk_bitacora_comunidad` 
    FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE;

-- pago_aplicacion
ALTER TABLE `pago_aplicacion`
  DROP FOREIGN KEY IF EXISTS `fk_pagoap_cuenta`;

ALTER TABLE `pago_aplicacion`
  ADD CONSTRAINT `fk_pagoap_cargo` 
    FOREIGN KEY (`cargo_unidad_id`) REFERENCES `cargo_unidad` (`id`) ON DELETE CASCADE;

-- =====================================================
-- PASO 5: ELIMINAR NUEVAS TABLAS
-- =====================================================

DROP TABLE IF EXISTS `usuario_comunidad_rol`;
DROP TABLE IF EXISTS `rol`;

-- =====================================================
-- PASO 6: RESTAURAR TABLA membresia_comunidad SI FUE ELIMINADA
-- =====================================================

-- Nota: Si eliminaste membresia_comunidad, necesitarás restaurarla desde backup
-- Este script asume que NO fue eliminada aún

-- Verificar que membresia_comunidad existe
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN 'OK: membresia_comunidad existe'
    ELSE 'ERROR: membresia_comunidad fue eliminada, restaurar desde backup'
  END as Estado
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'membresia_comunidad';

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICACIONES POST-ROLLBACK
-- =====================================================

SELECT 'Verificación de rollback completado' as Verificacion;

SELECT 
  CASE 
    WHEN COUNT(*) = 7 THEN 'OK: Todas las tablas restauradas'
    ELSE 'ERROR: Algunas tablas no fueron restauradas'
  END as Estado
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name IN (
    'cargo_unidad',
    'cargo_unidad_detalle',
    'emision_gasto_comun',
    'emision_gasto_detalle',
    'tenencia_unidad',
    'ticket',
    'bitacora_conserjeria'
  );

SELECT '============================================' as '';
SELECT 'ROLLBACK COMPLETADO' as Resultado;
SELECT '============================================' as '';
SELECT 'El sistema ha sido revertido al estado anterior' as Mensaje;
SELECT 'Verifica que todo funciona correctamente' as Mensaje;
SELECT '============================================' as '';
