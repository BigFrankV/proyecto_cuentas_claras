-- Script de migración para actualizar la base de datos
-- Fecha: 26 de septiembre de 2025
-- Descripción: Actualiza la estructura de la base de datos a la nueva versión

-- ========================================
-- CORRECCIONES EN TABLA COMUNIDAD
-- ========================================

-- Habilitar AUTO_INCREMENT en la tabla comunidad que faltaba en la primera versión
ALTER TABLE `comunidad` MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

-- ========================================
-- CORRECCIONES EN TABLA EMISION_GASTO_DETALLE
-- ========================================

-- Restaurar AUTO_INCREMENT en emision_gasto_detalle que se perdió en la primera versión
ALTER TABLE `emision_gasto_detalle` MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

-- ========================================
-- CORRECCIONES EN TABLA TICKET
-- ========================================

-- Restaurar AUTO_INCREMENT en ticket que se perdió en la primera versión
ALTER TABLE `ticket` MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

-- ========================================
-- CORRECCIONES EN TABLA WEBHOOK_PAGO
-- ========================================

-- Restaurar AUTO_INCREMENT en webhook_pago que se perdió en la primera versión
ALTER TABLE `webhook_pago` MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

-- ========================================
-- INSERCIÓN DE DATOS FALTANTES
-- ========================================

-- Insertar datos faltantes en emision_gasto_detalle
INSERT INTO `emision_gasto_detalle` (`id`, `emision_id`, `gasto_id`, `categoria_id`, `monto`, `regla_prorrateo`, `metadata_json`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 499800.00, 'coeficiente', '{\"base\": \"alicuota\", \"factor\": 1.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(2, 1, 2, 2, 416500.00, 'coeficiente', '{\"base\": \"alicuota\", \"factor\": 1.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(3, 2, 3, 3, 580000.00, 'coeficiente', '{\"base\": \"alicuota\", \"factor\": 1.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(4, 2, 4, 4, 333200.00, 'partes_iguales', '{\"unidades\": 4, \"monto_por_unidad\": 83300.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(5, 3, 5, 5, 280000.00, 'coeficiente', '{\"base\": \"alicuota\", \"factor\": 1.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(6, 4, 6, 6, 380800.00, 'partes_iguales', '{\"unidades\": 2, \"monto_por_unidad\": 190400.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(7, 5, 7, 7, 214200.00, 'fijo_por_unidad', '{\"monto_fijo\": 214200.0, \"aplica_todas\": true}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(8, 6, 8, 8, 850000.00, 'coeficiente', '{\"base\": \"alicuota\", \"factor\": 1.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(9, 7, 9, 9, 297500.00, 'partes_iguales', '{\"unidades\": 1, \"monto_por_unidad\": 297500.0}', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(10, 1, NULL, 1, 45000.00, 'consumo', '{\"base\": \"consumo_agua\", \"tarifa\": 850.0, \"metros_cubicos\": 52.94}', '2025-09-18 23:17:03', '2025-09-18 23:17:03')
ON DUPLICATE KEY UPDATE 
    `emision_id` = VALUES(`emision_id`),
    `gasto_id` = VALUES(`gasto_id`),
    `categoria_id` = VALUES(`categoria_id`),
    `monto` = VALUES(`monto`),
    `regla_prorrateo` = VALUES(`regla_prorrateo`),
    `metadata_json` = VALUES(`metadata_json`),
    `updated_at` = VALUES(`updated_at`);

-- Insertar datos faltantes en ticket
INSERT INTO `ticket` (`id`, `comunidad_id`, `unidad_id`, `categoria`, `titulo`, `descripcion`, `estado`, `prioridad`, `asignado_a`, `attachments_json`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Mantención', 'Filtración en baño principal', 'Se detecta filtración de agua en cielo del baño principal, goteo constante', 'en_progreso', 'alta', 1, '{\"fotos\": [\"foto1.jpg\", \"foto2.jpg\"]}', '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(2, 1, 2, 'Servicios', 'Ascensor lento Torre Norte', 'El ascensor se detiene mucho tiempo en cada piso, demora excesiva', 'abierto', 'media', NULL, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(3, 2, 4, 'Limpieza', 'Basura acumulada en hall', 'Se acumula basura en área común del primer piso', 'cerrado', 'baja', 2, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(4, 3, 6, 'Seguridad', 'Problema portón automático', 'Portón de acceso vehicular no abre correctamente', 'en_progreso', 'alta', 3, '{\"video\": \"porton_falla.mp4\"}', '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(5, 4, 8, 'General', 'Ruidos en tubería', 'Ruidos extraños en cañerías durante la noche', 'abierto', 'media', NULL, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(6, 5, 9, 'Mantención', 'Problema calefacción', 'Sistema de calefacción central no funciona correctamente', 'abierto', 'alta', 4, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(7, 6, 10, 'Servicios', 'Falla en internet común', 'Internet en áreas comunes sin conexión', 'resuelto', 'media', 5, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(8, 1, 3, 'Limpieza', 'Problema en piscina', 'Agua turbia en piscina comunitaria', 'en_progreso', 'alta', 2, '{\"analisis\": \"analisis_agua.pdf\"}', '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(9, 2, 5, 'Seguridad', 'Cámara descompuesta', 'Cámara de seguridad hall principal no funciona', 'abierto', 'media', 3, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38'),
(10, 3, 7, 'General', 'Solicitud nueva llave', 'Solicitud de copia de llave de bodega', 'cerrado', 'baja', 1, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38')
ON DUPLICATE KEY UPDATE 
    `comunidad_id` = VALUES(`comunidad_id`),
    `unidad_id` = VALUES(`unidad_id`),
    `categoria` = VALUES(`categoria`),
    `titulo` = VALUES(`titulo`),
    `descripcion` = VALUES(`descripcion`),
    `estado` = VALUES(`estado`),
    `prioridad` = VALUES(`prioridad`),
    `asignado_a` = VALUES(`asignado_a`),
    `attachments_json` = VALUES(`attachments_json`),
    `updated_at` = VALUES(`updated_at`);

-- Insertar datos faltantes en webhook_pago
INSERT INTO `webhook_pago` (`id`, `comunidad_id`, `proveedor`, `payload_json`, `fecha_recepcion`, `procesado`, `pago_id`) VALUES
(1, 1, 'webpay', '{\"transaction_id\": \"WP555666777\", \"amount\": 17608, \"status\": \"approved\", \"card_last_4\": \"1234\"}', '2025-09-08 14:30:15', 1, 3),
(2, 1, 'khipu', '{\"payment_id\": \"KH444555666\", \"amount\": 23016, \"status\": \"done\", \"payer_email\": \"laura.silva@email.com\"}', '2025-09-11 16:45:22', 1, 7),
(3, 2, 'webpay', '{\"transaction_id\": \"WP777888999\", \"amount\": 38556, \"status\": \"approved\", \"card_last_4\": \"5678\"}', '2025-09-16 10:20:33', 1, 8),
(4, 3, 'transferencia', '{\"bank_ref\": \"TRF123456789\", \"amount\": 47012, \"sender_rut\": \"15678923-4\", \"status\": \"completed\"}', '2025-09-15 09:15:44', 1, 1),
(5, 4, 'khipu', '{\"payment_id\": \"KH999888777\", \"amount\": 15000, \"status\": \"pending\", \"payer_email\": \"unknown@email.com\"}', '2025-09-17 11:30:55', 0, NULL),
(6, 5, 'webpay', '{\"transaction_id\": \"WP111222333\", \"amount\": 25000, \"status\": \"rejected\", \"error\": \"insufficient_funds\"}', '2025-09-16 13:45:12', 1, NULL),
(7, 6, 'transferencia', '{\"bank_ref\": \"TRF987654321\", \"amount\": 35259, \"sender_rut\": \"16789234-5\", \"status\": \"completed\"}', '2025-09-10 15:20:18', 1, 2),
(8, 7, 'otro', '{\"provider\": \"custom\", \"ref\": \"CUST789012\", \"amount\": 12000, \"status\": \"processing\"}', '2025-09-18 08:10:25', 0, NULL),
(9, 8, 'khipu', '{\"payment_id\": \"KH555444333\", \"amount\": 98175, \"status\": \"done\", \"payer_email\": \"roberto.fernandez@email.com\"}', '2025-09-05 12:35:40', 1, 6),
(10, 9, 'webpay', '{\"transaction_id\": \"WP333444555\", \"amount\": 13492, \"status\": \"approved\", \"card_last_4\": \"9999\"}', '2025-09-14 17:50:30', 1, 4)
ON DUPLICATE KEY UPDATE 
    `comunidad_id` = VALUES(`comunidad_id`),
    `proveedor` = VALUES(`proveedor`),
    `payload_json` = VALUES(`payload_json`),
    `fecha_recepcion` = VALUES(`fecha_recepcion`),
    `procesado` = VALUES(`procesado`),
    `pago_id` = VALUES(`pago_id`);

-- ========================================
-- VERIFICACIONES FINALES
-- ========================================

-- Verificar que todas las tablas tienen los AUTO_INCREMENT correctos
SELECT 
    TABLE_NAME, 
    AUTO_INCREMENT 
FROM 
    information_schema.TABLES 
WHERE 
    TABLE_SCHEMA = 'cuentasclaras' 
    AND AUTO_INCREMENT IS NOT NULL
ORDER BY TABLE_NAME;

-- Mostrar un resumen de registros por tabla
SELECT 
    'amenidad' as tabla, 
    COUNT(*) as registros 
FROM amenidad
UNION ALL
SELECT 
    'bitacora_conserjeria' as tabla, 
    COUNT(*) as registros 
FROM bitacora_conserjeria
UNION ALL
SELECT 
    'cargo_unidad' as tabla, 
    COUNT(*) as registros 
FROM cargo_unidad
UNION ALL
SELECT 
    'cargo_unidad_detalle' as tabla, 
    COUNT(*) as registros 
FROM cargo_unidad_detalle
UNION ALL
SELECT 
    'categoria_gasto' as tabla, 
    COUNT(*) as registros 
FROM categoria_gasto
UNION ALL
SELECT 
    'centro_costo' as tabla, 
    COUNT(*) as registros 
FROM centro_costo
UNION ALL
SELECT 
    'comunidad' as tabla, 
    COUNT(*) as registros 
FROM comunidad
UNION ALL
SELECT 
    'conciliacion_bancaria' as tabla, 
    COUNT(*) as registros 
FROM conciliacion_bancaria
UNION ALL
SELECT 
    'configuracion_interes' as tabla, 
    COUNT(*) as registros 
FROM configuracion_interes
UNION ALL
SELECT 
    'documento' as tabla, 
    COUNT(*) as registros 
FROM documento
UNION ALL
SELECT 
    'documento_compra' as tabla, 
    COUNT(*) as registros 
FROM documento_compra
UNION ALL
SELECT 
    'edificio' as tabla, 
    COUNT(*) as registros 
FROM edificio
UNION ALL
SELECT 
    'emision_gasto_comun' as tabla, 
    COUNT(*) as registros 
FROM emision_gasto_comun
UNION ALL
SELECT 
    'emision_gasto_detalle' as tabla, 
    COUNT(*) as registros 
FROM emision_gasto_detalle
UNION ALL
SELECT 
    'gasto' as tabla, 
    COUNT(*) as registros 
FROM gasto
UNION ALL
SELECT 
    'lectura_medidor' as tabla, 
    COUNT(*) as registros 
FROM lectura_medidor
UNION ALL
SELECT 
    'medidor' as tabla, 
    COUNT(*) as registros 
FROM medidor
UNION ALL
SELECT 
    'membresia_comunidad' as tabla, 
    COUNT(*) as registros 
FROM membresia_comunidad
UNION ALL
SELECT 
    'multa' as tabla, 
    COUNT(*) as registros 
FROM multa
UNION ALL
SELECT 
    'notificacion' as tabla, 
    COUNT(*) as registros 
FROM notificacion
UNION ALL
SELECT 
    'pago' as tabla, 
    COUNT(*) as registros 
FROM pago
UNION ALL
SELECT 
    'pago_aplicacion' as tabla, 
    COUNT(*) as registros 
FROM pago_aplicacion
UNION ALL
SELECT 
    'parametros_cobranza' as tabla, 
    COUNT(*) as registros 
FROM parametros_cobranza
UNION ALL
SELECT 
    'persona' as tabla, 
    COUNT(*) as registros 
FROM persona
UNION ALL
SELECT 
    'proveedor' as tabla, 
    COUNT(*) as registros 
FROM proveedor
UNION ALL
SELECT 
    'reserva_amenidad' as tabla, 
    COUNT(*) as registros 
FROM reserva_amenidad
UNION ALL
SELECT 
    'tarifa_consumo' as tabla, 
    COUNT(*) as registros 
FROM tarifa_consumo
UNION ALL
SELECT 
    'tenencia_unidad' as tabla, 
    COUNT(*) as registros 
FROM tenencia_unidad
UNION ALL
SELECT 
    'ticket' as tabla, 
    COUNT(*) as registros 
FROM ticket
UNION ALL
SELECT 
    'torre' as tabla, 
    COUNT(*) as registros 
FROM torre
UNION ALL
SELECT 
    'uf_valor' as tabla, 
    COUNT(*) as registros 
FROM uf_valor
UNION ALL
SELECT 
    'unidad' as tabla, 
    COUNT(*) as registros 
FROM unidad
UNION ALL
SELECT 
    'user_preferences' as tabla, 
    COUNT(*) as registros 
FROM user_preferences
UNION ALL
SELECT 
    'usuario' as tabla, 
    COUNT(*) as registros 
FROM usuario
UNION ALL
SELECT 
    'utm_valor' as tabla, 
    COUNT(*) as registros 
FROM utm_valor
UNION ALL
SELECT 
    'webhook_pago' as tabla, 
    COUNT(*) as registros 
FROM webhook_pago
ORDER BY tabla;

-- ========================================
-- MENSAJE FINAL
-- ========================================

SELECT 'Migración completada exitosamente' as mensaje;