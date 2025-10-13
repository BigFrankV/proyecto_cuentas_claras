-- Migración para agregar campos adicionales a la tabla centro_costo
-- Fecha: 26 de septiembre de 2025

USE cuentasclaras;

-- Agregar campos adicionales a centro_costo
ALTER TABLE `centro_costo` 
ADD COLUMN `descripcion` TEXT NULL AFTER `nombre`,
ADD COLUMN `departamento` VARCHAR(100) NULL AFTER `descripcion`,
ADD COLUMN `presupuesto` DECIMAL(15,2) NULL DEFAULT 0.00 AFTER `departamento`,
ADD COLUMN `ano_fiscal` YEAR NULL DEFAULT YEAR(NOW()) AFTER `presupuesto`,
ADD COLUMN `fecha_inicio` DATE NULL AFTER `ano_fiscal`,
ADD COLUMN `fecha_fin` DATE NULL AFTER `fecha_inicio`,
ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT TRUE AFTER `fecha_fin`,
ADD COLUMN `color` VARCHAR(7) NULL DEFAULT '#2196F3' AFTER `activo`,
ADD COLUMN `icono` VARCHAR(50) NULL DEFAULT 'account_balance_wallet' AFTER `color`,
ADD COLUMN `etiquetas` JSON NULL AFTER `icono`;

-- Hacer que el campo codigo sea opcional (puede ser auto-generado)
ALTER TABLE `centro_costo` 
MODIFY COLUMN `codigo` VARCHAR(50) NULL;

-- Actualizar registros existentes con códigos si no los tienen
UPDATE `centro_costo` 
SET `codigo` = CONCAT('CC', LPAD(`id`, 3, '0'))
WHERE `codigo` IS NULL OR `codigo` = '';

COMMIT;