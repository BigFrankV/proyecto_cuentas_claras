-- ============================================================================
-- SCRIPT DE LIMPIEZA COMPLETA DE LA BASE DE DATOS CUENTAS CLARAS
-- ============================================================================
-- 
-- ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
-- Asegúrate de tener un respaldo antes de ejecutar
-- 
-- Orden: Se eliminan primero las tablas dependientes (con claves foráneas)
-- y luego las tablas principales
-- ============================================================================

-- Deshabilitar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- PASO 1: Limpiar tablas de transacciones y detalles
-- --------------------------------------------------------

-- Limpiar aplicaciones de pagos (depende de pagos y cargos)
DELETE FROM `pago_aplicacion`;

-- Limpiar detalles de cargos (depende de cargos y categorías)
DELETE FROM `cargo_unidad_detalle`;

-- Limpiar detalles de emisiones (depende de emisiones y gastos)
DELETE FROM `emision_gasto_detalle`;

-- Limpiar lecturas de medidores (depende de medidores)
DELETE FROM `lectura_medidor`;

-- Limpiar reservas de amenidades (depende de amenidades y unidades)
DELETE FROM `reserva_amenidad`;

-- Limpiar tenencias de unidades (depende de unidades y personas)
DELETE FROM `tenencia_unidad`;

-- Limpiar membresías (depende de comunidades y personas)
DELETE FROM `membresia_comunidad`;

-- Limpiar webhooks de pagos
DELETE FROM `webhook_pago`;

-- Limpiar conciliaciones bancarias
DELETE FROM `conciliacion_bancaria`;

-- --------------------------------------------------------
-- PASO 2: Limpiar registros operacionales
-- --------------------------------------------------------

-- Limpiar cargos a unidades (depende de emisiones, comunidades y unidades)
DELETE FROM `cargo_unidad`;

-- Limpiar pagos (depende de comunidades y unidades)
DELETE FROM `pago`;

-- Limpiar multas (depende de comunidades y unidades)
DELETE FROM `multa`;

-- Limpiar tickets (depende de comunidades y unidades)
DELETE FROM `ticket`;

-- Limpiar notificaciones (depende de comunidades y unidades)
DELETE FROM `notificacion`;

-- Limpiar bitácora de conserjería (depende de comunidades)
DELETE FROM `bitacora_conserjeria`;

-- Limpiar gastos (depende de comunidades, proveedores, categorías)
DELETE FROM `gasto`;

-- Limpiar emisiones de gastos comunes (depende de comunidades)
DELETE FROM `emision_gasto_comun`;

-- Limpiar documentos de compra (depende de comunidades y proveedores)
DELETE FROM `documento_compra`;

-- Limpiar documentos (depende de comunidades)
DELETE FROM `documento`;

-- --------------------------------------------------------
-- PASO 3: Limpiar configuraciones y parámetros
-- --------------------------------------------------------

-- Limpiar configuraciones de interés
DELETE FROM `configuracion_interes`;

-- Limpiar parámetros de cobranza
DELETE FROM `parametros_cobranza`;

-- Limpiar tarifas de consumo
DELETE FROM `tarifa_consumo`;

-- Limpiar valores UF
DELETE FROM `uf_valor`;

-- Limpiar valores UTM
DELETE FROM `utm_valor`;

-- Limpiar preferencias de usuario
DELETE FROM `user_preferences`;

-- --------------------------------------------------------
-- PASO 4: Limpiar estructura física
-- --------------------------------------------------------

-- Limpiar medidores (depende de comunidades y unidades)
DELETE FROM `medidor`;

-- Limpiar unidades (depende de comunidades, edificios, torres)
DELETE FROM `unidad`;

-- Limpiar amenidades (depende de comunidades)
DELETE FROM `amenidad`;

-- Limpiar edificios (depende de comunidades)
DELETE FROM `edificio`;

-- Limpiar torres (depende de comunidades)
DELETE FROM `torre`;

-- --------------------------------------------------------
-- PASO 5: Limpiar configuraciones de comunidades
-- --------------------------------------------------------

-- Limpiar categorías de gastos (depende de comunidades)
DELETE FROM `categoria_gasto`;

-- Limpiar centros de costo (depende de comunidades)
DELETE FROM `centro_costo`;

-- Limpiar proveedores (depende de comunidades)
DELETE FROM `proveedor`;

-- --------------------------------------------------------
-- PASO 6: Limpiar usuarios y personas
-- --------------------------------------------------------

-- Limpiar usuarios (puede depender de personas)
DELETE FROM `usuario`;

-- Limpiar personas
DELETE FROM `persona`;

-- --------------------------------------------------------
-- PASO 7: Limpiar comunidades (tabla principal)
-- --------------------------------------------------------

-- Limpiar comunidades (tabla principal, otras dependen de esta)
DELETE FROM `comunidad`;

-- --------------------------------------------------------
-- PASO 8: Reiniciar AUTO_INCREMENT
-- --------------------------------------------------------

-- Reiniciar contadores AUTO_INCREMENT para todas las tablas
ALTER TABLE `amenidad` AUTO_INCREMENT = 1;
ALTER TABLE `bitacora_conserjeria` AUTO_INCREMENT = 1;
ALTER TABLE `cargo_unidad` AUTO_INCREMENT = 1;
ALTER TABLE `cargo_unidad_detalle` AUTO_INCREMENT = 1;
ALTER TABLE `categoria_gasto` AUTO_INCREMENT = 1;
ALTER TABLE `centro_costo` AUTO_INCREMENT = 1;
ALTER TABLE `comunidad` AUTO_INCREMENT = 1;
ALTER TABLE `conciliacion_bancaria` AUTO_INCREMENT = 1;
ALTER TABLE `configuracion_interes` AUTO_INCREMENT = 1;
ALTER TABLE `documento` AUTO_INCREMENT = 1;
ALTER TABLE `documento_compra` AUTO_INCREMENT = 1;
ALTER TABLE `edificio` AUTO_INCREMENT = 1;
ALTER TABLE `emision_gasto_comun` AUTO_INCREMENT = 1;
ALTER TABLE `emision_gasto_detalle` AUTO_INCREMENT = 1;
ALTER TABLE `gasto` AUTO_INCREMENT = 1;
ALTER TABLE `lectura_medidor` AUTO_INCREMENT = 1;
ALTER TABLE `medidor` AUTO_INCREMENT = 1;
ALTER TABLE `membresia_comunidad` AUTO_INCREMENT = 1;
ALTER TABLE `multa` AUTO_INCREMENT = 1;
ALTER TABLE `notificacion` AUTO_INCREMENT = 1;
ALTER TABLE `pago` AUTO_INCREMENT = 1;
ALTER TABLE `pago_aplicacion` AUTO_INCREMENT = 1;
ALTER TABLE `parametros_cobranza` AUTO_INCREMENT = 1;
ALTER TABLE `persona` AUTO_INCREMENT = 1;
ALTER TABLE `proveedor` AUTO_INCREMENT = 1;
ALTER TABLE `reserva_amenidad` AUTO_INCREMENT = 1;
ALTER TABLE `tarifa_consumo` AUTO_INCREMENT = 1;
ALTER TABLE `tenencia_unidad` AUTO_INCREMENT = 1;
ALTER TABLE `ticket` AUTO_INCREMENT = 1;
ALTER TABLE `torre` AUTO_INCREMENT = 1;
ALTER TABLE `uf_valor` AUTO_INCREMENT = 1;
ALTER TABLE `unidad` AUTO_INCREMENT = 1;
ALTER TABLE `user_preferences` AUTO_INCREMENT = 1;
ALTER TABLE `usuario` AUTO_INCREMENT = 1;
ALTER TABLE `utm_valor` AUTO_INCREMENT = 1;
ALTER TABLE `webhook_pago` AUTO_INCREMENT = 1;

-- Rehabilitar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICACIÓN DE LIMPIEZA COMPLETADA
-- ============================================================================

-- Consulta para verificar que todas las tablas están vacías
SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Registros'
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'cuentasclaras' 
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    TABLE_NAME;

-- ============================================================================
-- LIMPIEZA COMPLETADA EXITOSAMENTE
-- ============================================================================
-- 
-- Todas las tablas han sido limpiadas y los contadores AUTO_INCREMENT 
-- han sido reiniciados a 1
-- 
-- La base de datos está lista para recibir datos frescos desde cero
-- 
-- ============================================================================