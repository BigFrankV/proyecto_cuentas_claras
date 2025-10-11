-- *********************************************************************************
-- Definición de Vistas (Requieren permisos DEFINER)
-- *********************************************************************************

-- 1. Vista: bitacora_conserjeria (Simplifica el registro de conserjería)
CREATE VIEW `bitacora_conserjeria` AS
SELECT
  `registro_conserjeria`.`id` AS `id`,
  `registro_conserjeria`.`comunidad_id` AS `comunidad_id`,
  `registro_conserjeria`.`fecha_hora` AS `fecha_hora`,
  `registro_conserjeria`.`usuario_id` AS `usuario_id`,
  `registro_conserjeria`.`evento` AS `evento`,
  `registro_conserjeria`.`detalle` AS `detalle`,
  `registro_conserjeria`.`created_at` AS `created_at`
FROM `registro_conserjeria`;

-- 2. Vista: cargo_financiero_unidad (Resumen de cuentas por unidad)
CREATE VIEW `cargo_financiero_unidad` AS
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
FROM `cuenta_cobro_unidad`;

-- 3. Vista: detalle_cargo_unidad (Detalle de los cargos de cada cuenta)
CREATE VIEW `detalle_cargo_unidad` AS
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
FROM `detalle_cuenta_unidad`;

-- 4. Vista: emision_gasto_comun (Resumen de las emisiones de GC)
CREATE VIEW `emision_gasto_comun` AS
SELECT
  `emision_gastos_comunes`.`id` AS `id`,
  `emision_gastos_comunes`.`comunidad_id` AS `comunidad_id`,
  `emision_gastos_comunes`.`periodo` AS `periodo`,
  `emision_gastos_comunes`.`fecha_vencimiento` AS `fecha_vencimiento`,
  `emision_gastos_comunes`.`estado` AS `estado`,
  `emision_gastos_comunes`.`observaciones` AS `observaciones`,
  `emision_gastos_comunes`.`created_at` AS `created_at`,
  `emision_gastos_comunes`.`updated_at` AS `updated_at`
FROM `emision_gastos_comunes`;

-- 5. Vista: emision_gasto_detalle (Detalle de los gastos incluidos en cada emisión)
-- NOTA: El script original hacía un alias simple, probablemente faltaba un JOIN si la tabla 'detalle_emision' no existe. Asumo que se refiere a 'detalle_emision_gastos'.
CREATE VIEW `emision_gasto_detalle` AS
SELECT
  `detalle_emision_gastos`.`id` AS `id`,
  `detalle_emision_gastos`.`emision_id` AS `emision_id`,
  `detalle_emision_gastos`.`gasto_id` AS `gasto_id`,
  `detalle_emision_gastos`.`categoria_id` AS `categoria_id`,
  `detalle_emision_gastos`.`monto` AS `monto`,
  `detalle_emision_gastos`.`regla_prorrateo` AS `regla_prorrateo`,
  `detalle_emision_gastos`.`metadata_json` AS `metadata_json`,
  `detalle_emision_gastos`.`created_at` AS `created_at`,
  `detalle_emision_gastos`.`updated_at` AS `updated_at`
FROM `detalle_emision_gastos`;

-- 6. Vista: ticket (Simplifica la tabla ticket_soporte con un alias)
CREATE VIEW `ticket` AS
SELECT
  `ticket_soporte`.`id` AS `id`,
  `ticket_soporte`.`comunidad_id` AS `comunidad_id`,
  `ticket_soporte`.`unidad_id` AS `unidad_id`,
  `ticket_soporte`.`categoria` AS `categoria`,
  `ticket_soporte`.`titulo` AS `titulo`,
  `ticket_soporte`.`descripcion` AS `descripcion`,
  `ticket_soporte`.`estado` AS `estado`,
  `ticket_soporte`.`prioridad` AS `prioridad`,
  `ticket_soporte`.`asignado_a` AS `asignado_a`,
  `ticket_soporte`.`attachments_json` AS `attachments_json`,
  `ticket_soporte`.`created_at` AS `created_at`,
  `ticket_soporte`.`updated_at` AS `updated_at`
FROM `ticket_soporte`;

-- 7. Vista: titularidad_unidad (Resumen de la tenencia por unidad)
CREATE VIEW `titularidad_unidad` AS
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
FROM `titulares_unidad`;

-- 8. Vista: usuario_miembro_comunidad (Resumen del rol activo de un usuario en una comunidad)
CREATE VIEW `usuario_miembro_comunidad` AS
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
FROM (
  (`usuario_rol_comunidad` `urc` JOIN `usuario` `u` ON ((`u`.`id` = `urc`.`usuario_id`)))
  JOIN `rol_sistema` `r` ON ((`r`.`id` = `urc`.`rol_id`))
);