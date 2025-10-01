-- =====================================================
-- LIMPIEZA PRE-MIGRACIÓN V2
-- Proyecto: Cuentas Claras
-- =====================================================
-- 
-- IMPORTANTE: Este script debe ejecutarse ANTES de migracion_estructura_mejorada_v2.sql
-- Solo es necesario si ya ejecutaste parcialmente la versión 1 del script
-- 
-- =====================================================

USE `cuentasclaras`;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- PASO 1: ELIMINAR VISTAS SI EXISTEN
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
-- PASO 2: REVERTIR NOMBRES DE TABLAS SI FUERON RENOMBRADAS
-- =====================================================

-- Verificar y revertir renombramientos si existen las tablas nuevas

-- Si existe cuenta_cobro_unidad, revertir a cargo_unidad
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'cuenta_cobro_unidad';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `cuenta_cobro_unidad` TO `cargo_unidad`', 
  'SELECT "cuenta_cobro_unidad no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si existe detalle_cuenta_unidad, revertir a cargo_unidad_detalle
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'detalle_cuenta_unidad';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `detalle_cuenta_unidad` TO `cargo_unidad_detalle`', 
  'SELECT "detalle_cuenta_unidad no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si existe emision_gastos_comunes, revertir a emision_gasto_comun
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'emision_gastos_comunes';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `emision_gastos_comunes` TO `emision_gasto_comun`', 
  'SELECT "emision_gastos_comunes no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si existe detalle_emision, revertir a emision_gasto_detalle
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'detalle_emision';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `detalle_emision` TO `emision_gasto_detalle`', 
  'SELECT "detalle_emision no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si existe titulares_unidad, revertir a tenencia_unidad
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'titulares_unidad';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `titulares_unidad` TO `tenencia_unidad`', 
  'SELECT "titulares_unidad no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si existe solicitud_soporte, revertir a ticket
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'solicitud_soporte';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `solicitud_soporte` TO `ticket`', 
  'SELECT "solicitud_soporte no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si existe registro_conserjeria, revertir a bitacora_conserjeria
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = 'cuentasclaras' 
  AND table_name = 'registro_conserjeria';

SET @sql = IF(@table_exists > 0, 
  'RENAME TABLE `registro_conserjeria` TO `bitacora_conserjeria`', 
  'SELECT "registro_conserjeria no existe, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 3: REVERTIR CAMBIOS EN COLUMNAS
-- =====================================================

-- Revertir nombre de columna en cargo_unidad_detalle si existe
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists
FROM information_schema.columns
WHERE table_schema = 'cuentasclaras'
  AND table_name = 'cargo_unidad_detalle'
  AND column_name = 'cuenta_cobro_unidad_id';

SET @sql = IF(@column_exists > 0,
  'ALTER TABLE `cargo_unidad_detalle` CHANGE COLUMN `cuenta_cobro_unidad_id` `cargo_unidad_id` bigint NOT NULL',
  'SELECT "Columna cuenta_cobro_unidad_id no existe en cargo_unidad_detalle, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Revertir nombre de columna en pago_aplicacion si existe
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists
FROM information_schema.columns
WHERE table_schema = 'cuentasclaras'
  AND table_name = 'pago_aplicacion'
  AND column_name = 'cuenta_cobro_unidad_id';

SET @sql = IF(@column_exists > 0,
  'ALTER TABLE `pago_aplicacion` CHANGE COLUMN `cuenta_cobro_unidad_id` `cargo_unidad_id` bigint NOT NULL',
  'SELECT "Columna cuenta_cobro_unidad_id no existe en pago_aplicacion, omitiendo..." as Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- PASO 4: ELIMINAR TABLAS NUEVAS SI EXISTEN
-- =====================================================

-- Eliminar usuario_comunidad_rol si existe (se recreará en v2)
DROP TABLE IF EXISTS `usuario_comunidad_rol`;

-- Eliminar tabla rol si existe (se recreará en v2)
DROP TABLE IF EXISTS `rol`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '============================================' as '';
SELECT 'LIMPIEZA COMPLETADA' as Resultado;
SELECT '============================================' as '';
SELECT 'Ahora puedes ejecutar migracion_estructura_mejorada_v2.sql' as 'Próximo Paso';
SELECT '============================================' as '';

-- Mostrar estado actual de tablas principales
SELECT 'Estado de tablas principales:' as Info;
SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_type = 'BASE TABLE' THEN '✓ Tabla lista para migración'
    WHEN table_type = 'VIEW' THEN '⚠ Vista eliminada, OK'
    ELSE '? Tipo desconocido'
  END as Estado
FROM information_schema.tables
WHERE table_schema = 'cuentasclaras'
  AND table_name IN (
    'cargo_unidad',
    'cargo_unidad_detalle',
    'membresia_comunidad',
    'emision_gasto_comun',
    'emision_gasto_detalle',
    'tenencia_unidad',
    'ticket',
    'bitacora_conserjeria'
  )
ORDER BY table_name;
