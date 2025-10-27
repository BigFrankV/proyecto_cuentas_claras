-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 24-10-2025 a las 01:16:04
-- Versión del servidor: 8.0.43
-- Versión de PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cuentasclaras`
--
CREATE DATABASE IF NOT EXISTS `cuentasclaras` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `cuentasclaras`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `amenidad`
--

DROP TABLE IF EXISTS `amenidad`;
CREATE TABLE `amenidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reglas` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `capacidad` int DEFAULT NULL,
  `requiere_aprobacion` tinyint(1) NOT NULL DEFAULT '0',
  `tarifa` decimal(12,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `amenidad`
--

INSERT INTO `amenidad` (`id`, `comunidad_id`, `nombre`, `reglas`, `capacidad`, `requiere_aprobacion`, `tarifa`, `created_at`, `updated_at`) VALUES
(1, 1, 'Salón de Eventos', 'No ruidos después de las 23:00 hrs.', 50, 1, 30000.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(2, 2, 'Quincho Techado', 'Uso máximo 4 horas.', 15, 0, 15000.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(3, 3, 'Gimnasio', 'Solo mayores de 18, uso de toalla.', 20, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(4, 4, 'Piscina Exterior', 'Abierta de 10 a 20 hrs.', 40, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(5, 5, 'Sala Cowork', 'Silencio absoluto.', 10, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(6, 6, 'Sala de Cine', 'Reserva con 48 hrs.', 12, 1, 10000.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(7, 7, 'Lavandería', 'Máximo 2 cargas por día.', 6, 0, 2500.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(8, 8, 'Terraza Panorámica', 'Prohibido parrillas a carbón.', 25, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(9, 9, 'Salón de Yoga', 'Traer mat personal.', 8, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(10, 10, 'Sala de Juegos', 'Niños deben estar acompañados.', 15, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos`
--

DROP TABLE IF EXISTS `archivos`;
CREATE TABLE `archivos` (
  `id` bigint NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `mimetype` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` bigint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `archivos`
--

INSERT INTO `archivos` (`id`, `original_name`, `filename`, `file_path`, `file_size`, `mimetype`, `comunidad_id`, `entity_type`, `entity_id`, `category`, `description`, `uploaded_at`, `uploaded_by`, `is_active`) VALUES
(1, 'Reporte_Gas_C2.pdf', 'rep_gas_c2.pdf', '/docs/c2/rep_gas_c2.pdf', 500000, 'application/pdf', 2, 'documento_compra', 10, 'general', NULL, '2025-10-10 18:10:26', 5, 1),
(2, 'Foto_Grieta.jpg', 'foto_grieta_c8.jpg', '/tickets/c8/foto_grieta.jpg', 1200000, 'image/jpeg', 8, 'ticket_soporte', 8, 'general', NULL, '2025-10-10 18:10:26', 8, 1),
(3, 'Comprobante_Pago_4.png', 'comp_pago_4.png', '/pagos/c8/comp_pago_4.png', 300000, 'image/png', 8, 'pago', 4, 'general', NULL, '2025-10-10 18:10:26', 9, 1),
(4, 'Acta_Comite_C7.pdf', 'acta_com_c7.pdf', '/docs/c7/acta_com_c7.pdf', 800000, 'application/pdf', 7, 'documento_comunidad', 7, 'general', NULL, '2025-10-10 18:10:26', 7, 1),
(5, 'Lectura_105_09.csv', 'lectura_105_09.csv', '/lecturas/c5/lectura_105_09.csv', 10000, 'text/csv', 5, 'lectura_medidor', 6, 'general', NULL, '2025-10-10 18:10:26', 5, 1),
(6, 'Factura_Aseo_C1.pdf', 'fact_aseo_c1.pdf', '/docs/c1/fact_aseo_c1.pdf', 600000, 'application/pdf', 1, 'documento_compra', 1, 'general', NULL, '2025-10-10 18:10:26', 1, 1),
(7, 'Foto_Ascensor_C3.jpg', 'foto_asc_c3.jpg', '/tickets/c3/foto_asc_c3.jpg', 900000, 'image/jpeg', 3, 'ticket_soporte', 3, 'general', NULL, '2025-10-10 18:10:26', 3, 1),
(8, 'Comp_Webpay_C4.pdf', 'comp_wp_c4.pdf', '/pagos/c4/comp_wp_c4.pdf', 250000, 'application/pdf', 4, 'pago', 2, 'general', NULL, '2025-10-10 18:10:26', 4, 1),
(9, 'Reglamento_Mascotas.pdf', 'regl_mascotas_c6.pdf', '/docs/c6/regl_mascotas_c6.pdf', 700000, 'application/pdf', 6, 'documento_comunidad', 6, 'general', NULL, '2025-10-10 18:10:26', 6, 1),
(10, 'Multa_Ruido_C2.pdf', 'multa_ruido_c2.pdf', '/multas/c2/multa_ruido_c2.pdf', 150000, 'application/pdf', 2, 'multa', 2, 'general', NULL, '2025-10-10 18:10:26', 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id` bigint NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `accion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tabla` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `registro_id` bigint DEFAULT NULL,
  `valores_anteriores` json DEFAULT NULL,
  `valores_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `auditoria`
--

INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `ip_address`, `created_at`) VALUES
(1, 1, 'UPDATE', 'unidad', 1, '{\"alicuota\": \"0.010000\"}', '{\"alicuota\": \"0.015000\"}', '192.168.1.1', '2025-10-10 18:10:29'),
(2, 2, 'INSERT', 'pago', 1, NULL, '{\"medio\": \"transferencia\", \"monto\": 62000}', '192.168.1.2', '2025-10-10 18:10:29'),
(3, 3, 'UPDATE', 'multa', 2, '{\"estado\": \"pendiente\"}', '{\"estado\": \"pagada\"}', '192.168.1.3', '2025-10-10 18:10:29'),
(4, 4, 'INSERT', 'ticket_soporte', 4, NULL, '{\"titulo\": \"Árbol seco\"}', '192.168.1.4', '2025-10-10 18:10:29'),
(5, 5, 'UPDATE', 'emision_gastos_comunes', 5, '{\"estado\": \"borrador\"}', '{\"estado\": \"emitido\"}', '192.168.1.5', '2025-10-10 18:10:29'),
(6, 6, 'INSERT', 'registro_conserjeria', 6, NULL, '{\"evento\": \"visita\"}', '192.168.1.6', '2025-10-10 18:10:29'),
(7, 7, 'UPDATE', 'unidad', 8, '{\"nro_estacionamiento\": \"E105A\"}', '{\"nro_estacionamiento\": \"E152\"}', '192.168.1.7', '2025-10-10 18:10:29'),
(8, 8, 'INSERT', 'gasto', 8, NULL, '{\"monto\": 47600}', '192.168.1.8', '2025-10-10 18:10:29'),
(9, 9, 'UPDATE', 'cuenta_cobro_unidad', 9, '{\"saldo\": \"49000.00\"}', '{\"estado\": \"vencido\"}', '192.168.1.9', '2025-10-10 18:10:29'),
(10, 10, 'INSERT', 'lectura_medidor', 10, NULL, '{\"lectura\": 44.9}', '192.168.1.10', '2025-10-10 18:10:29');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `bitacora_conserjeria`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `bitacora_conserjeria`;
CREATE TABLE `bitacora_conserjeria` (
`comunidad_id` bigint
,`created_at` datetime
,`detalle` varchar(1000)
,`evento` varchar(150)
,`fecha_hora` datetime
,`id` bigint
,`usuario_id` bigint
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `cargo_financiero_unidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `cargo_financiero_unidad`;
CREATE TABLE `cargo_financiero_unidad` (
`comunidad_id` bigint
,`created_at` datetime
,`emision_id` bigint
,`estado` enum('pendiente','pagado','vencido','parcial')
,`id` bigint
,`interes_acumulado` decimal(12,2)
,`monto_total` decimal(12,2)
,`saldo` decimal(12,2)
,`unidad_id` bigint
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_gasto`
--

DROP TABLE IF EXISTS `categoria_gasto`;
CREATE TABLE `categoria_gasto` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tipo` enum('operacional','extraordinario','fondo_reserva','multas','consumo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cta_contable` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `categoria_gasto`
--

INSERT INTO `categoria_gasto` (`id`, `comunidad_id`, `nombre`, `tipo`, `cta_contable`, `activa`, `created_at`, `updated_at`) VALUES
(1, 1, 'Gasto Común Operacional', 'operacional', 'OP-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(2, 2, 'Fondo de Reserva', 'fondo_reserva', 'FR-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(3, 3, 'Gasto Extraordinario', 'extraordinario', 'EX-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(4, 4, 'Multas por Reglamento', 'multas', 'MT-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(5, 5, 'Consumo Agua Caliente', 'consumo', 'CO-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(6, 6, 'Seguros e Impuestos', 'operacional', 'OP-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(7, 7, 'Reparaciones Mayores', 'extraordinario', 'EX-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(8, 8, 'Uso de Amenidades (Ingreso)', 'multas', 'MT-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(9, 9, 'Gasto de Administración', 'operacional', 'OP-003', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(10, 10, 'Consumo Electricidad Común', 'consumo', 'CO-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `centro_costo`
--

DROP TABLE IF EXISTS `centro_costo`;
CREATE TABLE `centro_costo` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `centro_costo`
--

INSERT INTO `centro_costo` (`id`, `comunidad_id`, `nombre`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Aseo y Limpieza', 'CC001', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(2, 2, 'Seguridad 24H', 'CC002', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(3, 3, 'Mantención General', 'CC003', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(4, 4, 'Áreas Verdes', 'CC004', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(5, 5, 'Suministros', 'CC005', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(6, 6, 'Gastos Fijos', 'CC006', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(7, 7, 'Ascensores y Escaleras', 'CC007', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(8, 8, 'Zonas Comunes', 'CC008', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(9, 9, 'Honorarios', 'CC009', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(10, 10, 'Contabilidad', 'CC010', '2025-10-10 18:07:49', '2025-10-10 18:07:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunidad`
--

DROP TABLE IF EXISTS `comunidad`;
CREATE TABLE `comunidad` (
  `id` bigint NOT NULL,
  `razon_social` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `dv` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `giro` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email_contacto` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `telefono_contacto` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `politica_mora_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `moneda` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'CLP',
  `tz` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'America/Santiago',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `comunidad`
--

INSERT INTO `comunidad` (`id`, `razon_social`, `rut`, `dv`, `giro`, `direccion`, `email_contacto`, `telefono_contacto`, `politica_mora_json`, `moneda`, `tz`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'Condominio Central Providencia', '76543210', '9', NULL, 'Av. Central 1234, Providencia', 'adm@providencia.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(2, 'Residencial Las Condes 500', '98765432', '1', NULL, 'Calle Principal 500, Las Condes', 'admin@lascondes.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(3, 'Edificio Mirador Ñuñoa', '12345678', '9', NULL, 'Pasaje Los Robles 789, Ñuñoa', 'mirador@nunoa.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(4, 'Loteo Maipú Norte', '87654321', '0', NULL, 'Ruta Maipu 100, Maipú', 'loteo@maipu.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(5, 'Parque Estación Central', '23456789', 'K', NULL, 'Alameda 3000, Estación Central', 'parque@central.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(6, 'Condominio Vitacura Hills', '34567890', '1', NULL, 'Av. Kennedy 8000, Vitacura', 'admin@vitacura.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(7, 'Edificio Metro Santiago', '45678901', '2', NULL, 'Calle Bandera 500, Santiago', 'metro@stgo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(8, 'Portal La Florida', '56789012', '3', NULL, 'Av. Vicuña Mackenna 9000, La Florida', 'portal@florida.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(9, 'Condominio Quilpué Sur', '67890123', '4', NULL, 'Calle Marga Marga 50, Quilpué', 'sur@quilpue.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(10, 'Loteo San Miguel', '78901234', '5', NULL, 'Av. Llano Subercaseaux 100, San Miguel', 'admin@sanmiguel.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conciliacion_bancaria`
--

DROP TABLE IF EXISTS `conciliacion_bancaria`;
CREATE TABLE `conciliacion_bancaria` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `fecha_mov` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `glosa` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `referencia` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `estado` enum('pendiente','conciliado','descartado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `pago_id` bigint DEFAULT NULL,
  `extracto_id` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `conciliacion_bancaria`
--

INSERT INTO `conciliacion_bancaria` (`id`, `comunidad_id`, `fecha_mov`, `monto`, `glosa`, `referencia`, `estado`, `pago_id`, `extracto_id`, `created_at`, `updated_at`) VALUES
(1, 2, '2025-10-01', 62000.00, 'Trf 62000 U305', 'TRF-ABC1', 'conciliado', 1, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(2, 4, '2025-10-02', 31000.00, 'Webpay Pago Casa A', 'WP-XYZ2', 'conciliado', 2, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(3, 7, '2025-10-03', 55000.00, 'Depósito efectivo D1502', 'EFE-1233', 'conciliado', 3, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(4, 8, '2025-10-04', 48000.00, 'Transferencia U105', 'TRF-LMN4', 'conciliado', 4, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(5, 10, '2025-10-05', 68000.00, 'Webpay D202', 'WP-QRS5', 'conciliado', 5, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(6, 1, '2025-10-06', 45000.00, 'Transferencia sin identificar', 'TRF-IND6', 'pendiente', 6, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(7, 3, '2025-10-07', 88000.00, 'Pago D402', 'TRF-TUV7', 'pendiente', 7, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(8, 5, '2025-10-08', 73000.00, 'Pago Pendiente D501', 'WP-UVW8', 'pendiente', 8, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(9, 9, '2025-10-09', 49000.00, 'Depósito UQ01', 'EFE-XYZ9', 'pendiente', 9, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(10, 6, '2025-10-10', 95000.00, 'Pago Pendiente D1001', 'TRF-JKL10', 'pendiente', 10, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_interes`
--

DROP TABLE IF EXISTS `configuracion_interes`;
CREATE TABLE `configuracion_interes` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `aplica_desde` date NOT NULL,
  `tasa_mensual` decimal(5,2) NOT NULL,
  `metodo` enum('simple','compuesto') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'simple',
  `tope_mensual` decimal(5,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `configuracion_interes`
--

INSERT INTO `configuracion_interes` (`id`, `comunidad_id`, `aplica_desde`, `tasa_mensual`, `metodo`, `tope_mensual`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-01-01', 1.20, 'simple', 2.00, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(2, 2, '2025-01-01', 1.50, 'compuesto', 2.50, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(3, 3, '2025-01-01', 1.00, 'simple', 1.80, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(4, 4, '2025-02-01', 1.10, 'compuesto', 1.90, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(5, 5, '2025-03-01', 1.30, 'simple', 2.10, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(6, 6, '2025-04-01', 1.40, 'compuesto', 2.30, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(7, 7, '2025-05-01', 1.60, 'simple', 2.60, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(8, 8, '2025-06-01', 1.15, 'compuesto', 1.95, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(9, 9, '2025-07-01', 1.25, 'simple', 2.05, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(10, 10, '2025-08-01', 1.55, 'compuesto', 2.45, '2025-10-10 18:07:44', '2025-10-10 18:07:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuenta_cobro_unidad`
--

DROP TABLE IF EXISTS `cuenta_cobro_unidad`;
CREATE TABLE `cuenta_cobro_unidad` (
  `id` bigint NOT NULL,
  `emision_id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `monto_total` decimal(12,2) NOT NULL,
  `saldo` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagado','vencido','parcial') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `interes_acumulado` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cuentas de cobro o liquidaciones de gastos comunes por unidad';

--
-- Volcado de datos para la tabla `cuenta_cobro_unidad`
--

INSERT INTO `cuenta_cobro_unidad` (`id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total`, `saldo`, `estado`, `interes_acumulado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 45000.00, 45000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(2, 2, 2, 3, 62000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(3, 3, 3, 4, 88000.00, 88000.00, 'vencido', 1500.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(4, 4, 4, 5, 51000.00, 20000.00, 'parcial', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(5, 5, 5, 6, 73000.00, 73000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(6, 6, 6, 7, 95000.00, 95000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(7, 7, 7, 8, 55000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(8, 8, 8, 9, 78000.00, 30000.00, 'parcial', 500.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(9, 9, 9, 10, 49000.00, 49000.00, 'vencido', 800.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(10, 10, 10, 10, 68000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `detalle_cargo_unidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `detalle_cargo_unidad`;
CREATE TABLE `detalle_cargo_unidad` (
`cargo_unidad_id` bigint
,`categoria_id` bigint
,`created_at` datetime
,`glosa` varchar(250)
,`id` bigint
,`iva_incluido` tinyint(1)
,`monto` decimal(12,2)
,`origen` enum('gasto','multa','consumo','ajuste')
,`origen_id` bigint
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_cuenta_unidad`
--

DROP TABLE IF EXISTS `detalle_cuenta_unidad`;
CREATE TABLE `detalle_cuenta_unidad` (
  `id` bigint NOT NULL,
  `cuenta_cobro_unidad_id` bigint NOT NULL,
  `categoria_id` bigint NOT NULL,
  `glosa` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `origen` enum('gasto','multa','consumo','ajuste') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `origen_id` bigint DEFAULT NULL,
  `iva_incluido` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `detalle_cuenta_unidad`
--

INSERT INTO `detalle_cuenta_unidad` (`id`, `cuenta_cobro_unidad_id`, `categoria_id`, `glosa`, `monto`, `origen`, `origen_id`, `iva_incluido`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Gasto Base Operacional', 45000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(2, 2, 2, 'Aporte Fondo Reserva', 62000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(3, 3, 3, 'Cuota por Gasto Extraordinario', 88000.00, 'ajuste', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(4, 4, 4, 'Multa por Atraso', 10000.00, 'multa', NULL, 0, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(5, 4, 5, 'Consumo Agua Caliente', 41000.00, 'consumo', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(6, 5, 6, 'Gastos Fijos y Seguros', 73000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(7, 6, 7, 'Cuota por Reparación Ascensores', 95000.00, 'ajuste', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(8, 7, 8, 'Recargo uso Amenidades', 55000.00, 'multa', NULL, 0, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(9, 8, 9, 'Gasto de Administración', 78000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(10, 9, 10, 'Consumo Electricidad', 49000.00, 'consumo', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_emision_gastos`
--

DROP TABLE IF EXISTS `detalle_emision_gastos`;
CREATE TABLE `detalle_emision_gastos` (
  `id` bigint NOT NULL,
  `emision_id` bigint NOT NULL,
  `gasto_id` bigint DEFAULT NULL,
  `categoria_id` bigint NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `regla_prorrateo` enum('coeficiente','partes_iguales','consumo','fijo_por_unidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Detalle de gastos incluidos en cada emisión';

--
-- Volcado de datos para la tabla `detalle_emision_gastos`
--

INSERT INTO `detalle_emision_gastos` (`id`, `emision_id`, `gasto_id`, `categoria_id`, `monto`, `regla_prorrateo`, `metadata_json`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 119000.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(2, 2, 2, 2, 59500.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(3, 3, 3, 3, 89250.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(4, 4, 4, 4, 35700.00, 'fijo_por_unidad', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(5, 5, 5, 5, 107100.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(6, 6, 6, 6, 142800.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(7, 7, 7, 7, 95200.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(8, 8, 8, 8, 47600.00, 'fijo_por_unidad', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(9, 9, 9, 9, 178500.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(10, 10, 10, 10, 71400.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documento_compra`
--

DROP TABLE IF EXISTS `documento_compra`;
CREATE TABLE `documento_compra` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `proveedor_id` bigint NOT NULL,
  `tipo_doc` enum('factura','boleta','nota_credito') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `folio` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_emision` date NOT NULL,
  `neto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `iva` decimal(12,2) NOT NULL DEFAULT '0.00',
  `exento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `glosa` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `documento_compra`
--

INSERT INTO `documento_compra` (`id`, `comunidad_id`, `proveedor_id`, `tipo_doc`, `folio`, `fecha_emision`, `neto`, `iva`, `exento`, `total`, `glosa`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'factura', 'F-1001', '2025-09-01', 100000.00, 19000.00, 0.00, 119000.00, 'Servicio de Aseo Septiembre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(2, 2, 2, 'boleta', 'B-2005', '2025-09-02', 50000.00, 9500.00, 0.00, 59500.00, 'Compra de cámara de repuesto', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(3, 3, 3, 'factura', 'F-3010', '2025-09-03', 75000.00, 14250.00, 0.00, 89250.00, 'Mantención Jardines Trimestral', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(4, 4, 4, 'boleta', 'B-4001', '2025-09-04', 30000.00, 5700.00, 0.00, 35700.00, 'Reparación de válvula principal', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(5, 5, 5, 'factura', 'F-5015', '2025-09-05', 90000.00, 17100.00, 0.00, 107100.00, 'Reparación de luminaria exterior', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(6, 6, 6, 'factura', 'F-6002', '2025-09-06', 120000.00, 22800.00, 0.00, 142800.00, 'Honorarios Contables Septiembre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(7, 7, 7, 'factura', 'F-7007', '2025-09-07', 80000.00, 15200.00, 0.00, 95200.00, 'Mantención Ascensores', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(8, 8, 8, 'boleta', 'B-8003', '2025-09-08', 40000.00, 7600.00, 0.00, 47600.00, 'Compra de pintura para pasillos', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(9, 9, 9, 'factura', 'F-9011', '2025-09-09', 150000.00, 28500.00, 0.00, 178500.00, 'Fee Administración Septiembre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(10, 10, 10, 'boleta', 'B-1002', '2025-09-10', 60000.00, 11400.00, 0.00, 71400.00, 'Revisión técnica de red de gas', '2025-10-10 18:07:50', '2025-10-10 18:07:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documento_comunidad`
--

DROP TABLE IF EXISTS `documento_comunidad`;
CREATE TABLE `documento_comunidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `tipo` enum('circular','acta','reglamento','boletin','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `periodo` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `visibilidad` enum('publico','privado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'privado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `documento_comunidad`
--

INSERT INTO `documento_comunidad` (`id`, `comunidad_id`, `tipo`, `titulo`, `url`, `periodo`, `visibilidad`, `created_at`, `updated_at`) VALUES
(1, 1, 'circular', 'Aviso corte de agua', 'https://docs.cc/c1/circular-agua.pdf', '2025-10', 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(2, 2, 'acta', 'Acta Asamblea Anual 2024', 'https://docs.cc/c2/acta-2024.pdf', '2024-12', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(3, 3, 'reglamento', 'Reglamento de Copropiedad', 'https://docs.cc/c3/reglamento.pdf', NULL, 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(4, 4, 'boletin', 'Boletín N°10 Octubre', 'https://docs.cc/c4/boletin-10.pdf', '2025-10', 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(5, 5, 'otro', 'Informe Técnico Ascensores', 'https://docs.cc/c5/informe-asc.pdf', '2025-09', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(6, 6, 'circular', 'Cambio en Horario de Piscina', 'https://docs.cc/c6/circ-piscina.pdf', '2025-10', 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(7, 7, 'acta', 'Acta Reunión Comité', 'https://docs.cc/c7/acta-comite-10.pdf', '2025-10', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(8, 8, 'reglamento', 'Uso de Estacionamientos', 'https://docs.cc/c8/regl-estac.pdf', NULL, 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(9, 9, 'boletin', 'Resumen Gastos Q3', 'https://docs.cc/c9/resumen-q3.pdf', '2025-09', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(10, 10, 'otro', 'Certificado Recepción Final', 'https://docs.cc/c10/cert-final.pdf', NULL, 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documento_multa`
--

DROP TABLE IF EXISTS `documento_multa`;
CREATE TABLE `documento_multa` (
  `id` bigint NOT NULL,
  `multa_id` bigint NOT NULL,
  `nombre_archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ruta_archivo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tipo_archivo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tamanio_bytes` bigint DEFAULT NULL,
  `descripcion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `subido_por` bigint NOT NULL COMMENT 'usuario_id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `edificio`
--

DROP TABLE IF EXISTS `edificio`;
CREATE TABLE `edificio` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `edificio`
--

INSERT INTO `edificio` (`id`, `comunidad_id`, `nombre`, `direccion`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Edificio Central A', 'Av. Central 1234', 'A', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(2, 2, 'Edificio Norte B', 'Calle Principal 500', 'B', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(3, 3, 'Edificio Único', 'Pasaje Los Robles 789', 'U', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(4, 4, 'Zona Casas 1', 'Ruta Maipu 100', 'C1', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(5, 5, 'Torre Alameda', 'Alameda 3000', 'TA', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(6, 6, 'Torre Lujo', 'Av. Kennedy 8000', 'TL', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(7, 7, 'Torre Histórica', 'Calle Bandera 500', 'TH', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(8, 8, 'Bloque 1', 'Av. Vicuña Mackenna 9000', 'B1', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(9, 9, 'Torre 1', 'Calle Marga Marga 50', 'T1', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(10, 10, 'Torre El Llano', 'Av. Llano Subercaseaux 100', 'LL', '2025-10-10 18:07:37', '2025-10-10 18:07:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `emision_gastos_comunes`
--

DROP TABLE IF EXISTS `emision_gastos_comunes`;
CREATE TABLE `emision_gastos_comunes` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `periodo` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('borrador','emitido','cerrado','anulado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'borrador',
  `observaciones` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `emision_gastos_comunes`
--

INSERT INTO `emision_gastos_comunes` (`id`, `comunidad_id`, `periodo`, `fecha_vencimiento`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-09', '2025-10-05', 'emitido', 'Emisión Septiembre C1', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(2, 2, '2025-09', '2025-10-06', 'emitido', 'Emisión Septiembre C2', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(3, 3, '2025-09', '2025-10-07', 'cerrado', 'Emisión Septiembre C3', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(4, 4, '2025-09', '2025-10-08', 'emitido', 'Emisión Septiembre C4', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(5, 5, '2025-09', '2025-10-09', 'emitido', 'Emisión Septiembre C5', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(6, 6, '2025-09', '2025-10-10', 'borrador', 'Emisión Septiembre C6', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(7, 7, '2025-09', '2025-10-11', 'emitido', 'Emisión Septiembre C7', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(8, 8, '2025-09', '2025-10-12', 'emitido', 'Emisión Septiembre C8', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(9, 9, '2025-09', '2025-10-13', 'cerrado', 'Emisión Septiembre C9', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(10, 10, '2025-09', '2025-10-14', 'emitido', 'Emisión Septiembre C10', '2025-10-10 18:07:53', '2025-10-10 18:07:53');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `emision_gasto_comun`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `emision_gasto_comun`;
CREATE TABLE `emision_gasto_comun` (
`comunidad_id` bigint
,`created_at` datetime
,`estado` enum('borrador','emitido','cerrado','anulado')
,`fecha_vencimiento` date
,`id` bigint
,`observaciones` varchar(500)
,`periodo` char(7)
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `emision_gasto_detalle`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `emision_gasto_detalle`;
CREATE TABLE `emision_gasto_detalle` (
`categoria_id` bigint
,`created_at` datetime
,`emision_id` bigint
,`gasto_id` bigint
,`id` bigint
,`metadata_json` longtext
,`monto` decimal(12,2)
,`regla_prorrateo` enum('coeficiente','partes_iguales','consumo','fijo_por_unidad')
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gasto`
--

DROP TABLE IF EXISTS `gasto`;
CREATE TABLE `gasto` (
  `id` bigint NOT NULL,
  `numero` varchar(20) NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `categoria_id` bigint NOT NULL,
  `centro_costo_id` bigint DEFAULT NULL,
  `documento_compra_id` bigint DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado','anulado') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado del gasto: pendiente, aprobado, rechazado, anulado',
  `creado_por` bigint NOT NULL DEFAULT '1' COMMENT 'Usuario que creó el gasto',
  `aprobado_por` bigint DEFAULT NULL COMMENT 'Usuario que aprobó el gasto',
  `required_aprobaciones` int NOT NULL DEFAULT '1' COMMENT 'Número de aprobaciones requeridas',
  `aprobaciones_count` int NOT NULL DEFAULT '0' COMMENT 'Contador de aprobaciones actuales',
  `anulado_por` bigint DEFAULT NULL COMMENT 'Usuario que anuló el gasto',
  `fecha_anulacion` datetime DEFAULT NULL COMMENT 'Fecha de anulación del gasto',
  `glosa` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `extraordinario` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `gasto`
--

INSERT INTO `gasto` (`id`, `numero`, `comunidad_id`, `categoria_id`, `centro_costo_id`, `documento_compra_id`, `fecha`, `monto`, `estado`, `creado_por`, `aprobado_por`, `required_aprobaciones`, `aprobaciones_count`, `anulado_por`, `fecha_anulacion`, `glosa`, `extraordinario`, `created_at`, `updated_at`) VALUES
(1, '', 1, 1, 1, 1, '2025-09-01', 119000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Gasto Aseo Comunal', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(2, '', 2, 2, 2, 2, '2025-09-02', 59500.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Aporte a Fondo de Reserva', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(3, '', 3, 3, 3, 3, '2025-09-03', 89250.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Gasto Extraordinario Jardinería', 1, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(4, '', 4, 4, 4, 4, '2025-09-04', 35700.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Gasto Multa (no aplica a unidad)', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(5, '', 5, 5, 5, 5, '2025-09-05', 107100.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Consumo Común de Agua Caliente', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(6, '', 6, 6, 6, 6, '2025-09-06', 142800.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Gasto Fijo Contabilidad', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(7, '', 7, 7, 7, 7, '2025-09-07', 95200.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Reparación de Motor de Ascensor', 1, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(8, '', 8, 8, 8, 8, '2025-09-08', 47600.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Compra de Materiales de Mantención', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(9, '', 9, 9, 9, 9, '2025-09-09', 178500.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Gasto de Administración', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(10, '', 10, 10, 10, 10, '2025-09-10', 71400.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Consumo Electricidad Común', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gasto_aprobacion`
--

DROP TABLE IF EXISTS `gasto_aprobacion`;
CREATE TABLE `gasto_aprobacion` (
  `id` bigint NOT NULL,
  `gasto_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL COMMENT 'Usuario que aprueba/rechaza',
  `rol_id` int NOT NULL COMMENT 'Rol con el que aprueba',
  `accion` enum('aprobar','rechazar') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_gasto`
--

DROP TABLE IF EXISTS `historial_gasto`;
CREATE TABLE `historial_gasto` (
  `id` bigint NOT NULL,
  `gasto_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `campo_modificado` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `valor_anterior` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `valor_nuevo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lectura_medidor`
--

DROP TABLE IF EXISTS `lectura_medidor`;
CREATE TABLE `lectura_medidor` (
  `id` bigint NOT NULL,
  `medidor_id` bigint NOT NULL,
  `fecha` date NOT NULL,
  `lectura` decimal(12,3) NOT NULL,
  `periodo` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reader_id` bigint DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `notes` text,
  `photo_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','validated','rejected') NOT NULL DEFAULT 'validated'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `lectura_medidor`
--

INSERT INTO `lectura_medidor` (`id`, `medidor_id`, `fecha`, `lectura`, `periodo`, `created_at`, `updated_at`, `reader_id`, `method`, `notes`, `photo_url`, `status`) VALUES
(1, 1, '2025-09-30', 50.500, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(2, 2, '2025-09-30', 120.300, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(3, 3, '2025-09-30', 90.100, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(4, 4, '2025-09-30', 65.800, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(5, 5, '2025-09-30', 150.000, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(6, 6, '2025-09-30', 88.700, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(7, 7, '2025-09-30', 105.200, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(8, 8, '2025-09-30', 130.400, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(9, 9, '2025-09-30', 75.600, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(10, 10, '2025-09-30', 44.900, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medidor`
--

DROP TABLE IF EXISTS `medidor`;
CREATE TABLE `medidor` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `tipo` enum('agua','gas','electricidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `es_compartido` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `serial_number` varchar(100) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `estado` enum('activo','inactivo','mantenimiento') NOT NULL DEFAULT 'activo',
  `ubicacion` json DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `medidor`
--

INSERT INTO `medidor` (`id`, `comunidad_id`, `unidad_id`, `tipo`, `codigo`, `es_compartido`, `created_at`, `updated_at`, `serial_number`, `marca`, `modelo`, `estado`, `ubicacion`, `activo`, `created_by`) VALUES
(1, 1, 1, 'agua', 'AGUA-101', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(2, 1, 2, 'electricidad', 'ELEC-201', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(3, 2, 3, 'gas', 'GAS-305', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(4, 3, 4, 'agua', 'AGUA-402', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(5, 4, 5, 'electricidad', 'ELEC-CASA-A', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(6, 5, 6, 'gas', 'GAS-501', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(7, 6, 7, 'agua', 'AGUA-1001', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(8, 7, 8, 'electricidad', 'ELEC-1502', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(9, 8, 9, 'gas', 'GAS-105', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(10, 9, 9, 'agua', 'AGUA-105-C9', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multa`
--

DROP TABLE IF EXISTS `multa`;
CREATE TABLE `multa` (
  `id` bigint NOT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint DEFAULT NULL,
  `motivo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagado','anulada','apelada') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `prioridad` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media' COMMENT 'Prioridad de la multa según gravedad',
  `creada_por` bigint NOT NULL COMMENT 'usuario_id',
  `aprobada_por` bigint DEFAULT NULL COMMENT 'usuario_id',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `fecha` date NOT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `anulado_por` bigint DEFAULT NULL COMMENT 'Usuario que anuló la multa',
  `motivo_anulacion` varchar(500) DEFAULT NULL COMMENT 'Motivo de la anulación',
  `fecha_anulacion` datetime DEFAULT NULL COMMENT 'Fecha y hora de la anulación',
  `pagado_por` bigint DEFAULT NULL COMMENT 'Usuario que registró el pago'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multa`
--

INSERT INTO `multa` (`id`, `numero`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `descripcion`, `monto`, `estado`, `prioridad`, `creada_por`, `aprobada_por`, `fecha_aprobacion`, `fecha`, `fecha_vencimiento`, `fecha_pago`, `created_at`, `updated_at`, `anulado_por`, `motivo_anulacion`, `fecha_anulacion`, `pagado_por`) VALUES
(1, 'M-2025-0001', 1, 1, 1, 'Mascota sin correa', 'Infracción por mascota sin correa en áreas comunes.', 5000.00, 'pagado', 'media', 1, NULL, NULL, '2025-11-20', NULL, '2025-09-01 00:00:00', '2025-09-25 20:00:00', '2025-10-16 04:17:35', 1, NULL, '2025-10-01 00:45:06', NULL),
(2, 'M-2025-0002', 2, 3, 3, 'Ruido excesivo', 'Ruido excesivo generado por fiestas nocturnas.', 15000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-02', NULL, '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-17 01:29:55', NULL, NULL, NULL, 1),
(3, 'M-2025-0003', 3, 4, 4, 'Bloqueo de acceso', 'Bloqueo de acceso vehicular sin autorización.', 10000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-03', NULL, '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-16 05:14:42', NULL, NULL, NULL, NULL),
(4, 'M-2025-0004', 4, 5, 5, 'Fumar en áreas comunes', 'Fumar en áreas comunes del edificio.', 20000.00, 'apelada', 'media', 1, NULL, NULL, '2025-09-04', NULL, '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-17 01:06:55', 1, 'Error en la emisión', '2025-10-14 14:00:00', NULL),
(5, 'M-2025-0005', 5, 6, 6, 'Daño a propiedad común', 'Daño a propiedad común (pintura en pared).', 30000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-05', NULL, '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-16 05:07:33', NULL, NULL, NULL, NULL),
(6, 'M-2025-0006', 6, 7, 7, 'Mascota peligrosa sin bozal', 'Mascota peligrosa sin bozal en espacios públicos.', 12000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-06', NULL, '2025-10-16 11:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 1),
(7, 'M-2025-0007', 7, 8, 8, 'Uso no autorizado de ascensor', 'Uso no autorizado del ascensor de servicio.', 8000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-07', NULL, NULL, '2025-10-10 18:10:15', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL),
(8, 'M-2025-0008', 8, 9, 9, 'Dejar basura en pasillo', 'Dejar basura en pasillo común.', 6000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-08', NULL, '2025-10-17 12:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 1),
(9, 'M-2025-0009', 9, 10, 10, 'Instalación de antena sin permiso', 'Instalación de antena sin permiso administrativo.', 25000.00, 'apelada', 'media', 1, NULL, NULL, '2025-09-09', NULL, NULL, '2025-10-10 18:10:15', '2025-10-16 05:38:29', NULL, NULL, NULL, NULL),
(10, 'M-2025-0010', 10, 10, 10, 'Fiesta hasta tarde', 'Fiesta hasta tarde generando molestias.', 18000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-10', NULL, '2025-10-18 13:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multa_apelacion`
--

DROP TABLE IF EXISTS `multa_apelacion`;
CREATE TABLE `multa_apelacion` (
  `id` bigint NOT NULL,
  `multa_id` bigint NOT NULL,
  `usuario_id` bigint DEFAULT NULL COMMENT 'Usuario que presenta apelación',
  `persona_id` bigint NOT NULL COMMENT 'Persona que apela',
  `comunidad_id` bigint NOT NULL,
  `fecha_apelacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo_apelacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `estado` enum('pendiente','aceptada','rechazada') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `resolucion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `fecha_resolucion` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multa_apelacion`
--

INSERT INTO `multa_apelacion` (`id`, `multa_id`, `usuario_id`, `persona_id`, `comunidad_id`, `fecha_apelacion`, `motivo_apelacion`, `estado`, `resolucion`, `fecha_resolucion`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, '2025-10-15 03:52:57', 'La infracción no ocurrió en la fecha indicada.', 'pendiente', NULL, NULL, '2025-10-15 03:52:57', '2025-10-15 03:52:57'),
(2, 3, 1, 4, 3, '2025-10-15 03:52:57', 'No fui yo quien bloqueó el acceso.', 'aceptada', 'Apelación aceptada, multa anulada.', '2025-10-15 15:00:00', '2025-10-15 03:52:57', '2025-10-15 03:52:57'),
(4, 7, 1, 8, 7, '2025-10-15 03:52:57', 'Uso autorizado por emergencia.', 'pendiente', NULL, NULL, '2025-10-15 03:52:57', '2025-10-15 03:52:57'),
(7, 9, 1, 10, 9, '2025-10-16 05:38:29', '\'apelada\' \'apelada\' \'apelada\' \'apelada\'', 'pendiente', NULL, NULL, '2025-10-16 05:38:29', '2025-10-16 05:38:29'),
(8, 4, 1, 5, 4, '2025-10-17 01:06:55', 'Textos completos\nid\ncodigo\nnombre\ndescripcion\nnivel_acceso\n0=mínimo, 100=superadmin\nes_rol_sistema\n1=rol del sistema, 0=rol de comunidad\ncreated_at\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n1\nsuperadmin\nSuper Administrador\nNULL\n100\n1\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n2\nadmin_comunidad\nAdmin Comunidad\nNULL\n80\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n3\nconserje\nConserje\nNULL\n50\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n4\ncontador\nContador\nNULL\n70\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n5\nproveedor_servicio\nProveedor Servicio\nNULL\n30\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n6\nresidente\nResidente\nNULL\n10\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n7\npropietario\nPropietario\nNULL\n20\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n8\ninquilino\nInquilino\nNULL\n15\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n9\ntesorero\nTesorero\nNULL\n60\n0\n2025-10-10 18:07:30\n\nEditar Editar\nCopiar Copiar\nBorrar Borrar\n10\npresidente_comite\nPresidente Comité\nNULL\n85\n0\n2025-10-10 18:07:30', 'pendiente', NULL, NULL, '2025-10-17 01:06:55', '2025-10-17 01:06:55'),
(9, 2, 1, 3, 2, '2025-10-17 01:28:15', 'test test test test test', 'pendiente', NULL, NULL, '2025-10-17 01:28:15', '2025-10-17 01:28:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multa_historial`
--

DROP TABLE IF EXISTS `multa_historial`;
CREATE TABLE `multa_historial` (
  `id` bigint NOT NULL,
  `multa_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `accion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `estado_anterior` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `estado_nuevo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multa_historial`
--

INSERT INTO `multa_historial` (`id`, `multa_id`, `usuario_id`, `accion`, `estado_anterior`, `estado_nuevo`, `observaciones`, `created_at`) VALUES
(1, 1, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26'),
(2, 2, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:44:26'),
(4, 4, 1, 'Multa creada', NULL, 'anulada', 'Multa emitida y anulada', '2025-10-15 03:44:26'),
(5, 5, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26'),
(6, 6, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:44:26'),
(7, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26'),
(9, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26'),
(10, 10, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:44:26'),
(14, 4, 1, 'Multa creada', NULL, 'anulada', 'Multa emitida y anulada', '2025-10-15 03:46:54'),
(16, 6, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:46:54'),
(17, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:46:54'),
(18, 8, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:46:54'),
(19, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:46:54'),
(20, 10, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:46:54'),
(25, 4, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34'),
(26, 4, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por error administrativo', '2025-10-15 03:48:34'),
(28, 6, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34'),
(29, 6, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:48:34'),
(30, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34'),
(33, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34'),
(34, 10, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34'),
(35, 10, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:48:34'),
(40, 4, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57'),
(41, 4, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por error administrativo', '2025-10-15 03:52:57'),
(43, 6, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57'),
(44, 6, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:52:57'),
(45, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57'),
(48, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57'),
(49, 10, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57'),
(50, 10, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:52:57'),
(55, 7, 1, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación por uso de ascensor', '2025-10-15 03:52:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificacion_usuario`
--

DROP TABLE IF EXISTS `notificacion_usuario`;
CREATE TABLE `notificacion_usuario` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `persona_id` bigint DEFAULT NULL,
  `tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `titulo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `mensaje` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `objeto_tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `objeto_id` bigint DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `notificacion_usuario`
--

INSERT INTO `notificacion_usuario` (`id`, `comunidad_id`, `persona_id`, `tipo`, `titulo`, `mensaje`, `leida`, `objeto_tipo`, `objeto_id`, `fecha_creacion`) VALUES
(1, 1, 1, 'alerta', 'Pago Vencido', 'Su gasto común de septiembre está vencido.', 0, 'cuenta_cobro_unidad', 1, '2025-10-10 18:10:22'),
(2, 2, 3, 'info', 'Pago Aplicado', 'Su pago ha sido aplicado con éxito.', 1, 'pago', 1, '2025-10-10 18:10:22'),
(3, 3, 4, 'recordatorio', 'Próxima Votación', 'Vote por el presupuesto del próximo año.', 0, 'documento_comunidad', 7, '2025-10-10 18:10:22'),
(4, 4, 5, 'info', 'Reserva Aprobada', 'Su solicitud de piscina para el 2025-10-25 ha sido aprobada.', 1, 'reserva_amenidad', 5, '2025-10-10 18:10:22'),
(5, 5, 6, 'alerta', 'Ticket Asignado', 'Se le asignó el ticket N°5 de seguridad.', 0, 'ticket_soporte', 5, '2025-10-10 18:10:22'),
(6, 6, 7, 'recordatorio', 'Mantención General', 'Recordatorio de la mantención del ascensor mañana.', 0, 'registro_conserjeria', 6, '2025-10-10 18:10:22'),
(7, 7, 8, 'info', 'Nueva Multa', 'Se ha generado una multa a su unidad.', 0, 'multa', 7, '2025-10-10 18:10:22'),
(8, 8, 9, 'alerta', 'Saldo Pendiente', 'Su saldo parcial tiene intereses acumulados.', 0, 'cuenta_cobro_unidad', 8, '2025-10-10 18:10:22'),
(9, 9, 10, 'recordatorio', 'Entrega de Paquete', 'Tiene un paquete pendiente de retiro en conserjería.', 1, 'registro_conserjeria', 9, '2025-10-10 18:10:22'),
(10, 10, 10, 'info', 'Cierre de Emisión', 'El periodo de gasto común 2025-09 ha sido cerrado.', 1, 'emision_gastos_comunes', 10, '2025-10-10 18:10:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

DROP TABLE IF EXISTS `pago`;
CREATE TABLE `pago` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `persona_id` bigint DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `medio` enum('transferencia','webpay','khipu','servipag','efectivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `referencia` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `estado` enum('pendiente','aplicado','reversado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `comprobante_num` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `fecha`, `monto`, `medio`, `referencia`, `estado`, `comprobante_num`, `created_at`, `updated_at`) VALUES
(1, 2, 3, 3, '2025-10-01', 62000.00, 'transferencia', 'REF-P001', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(2, 4, 5, 5, '2025-10-02', 31000.00, 'webpay', 'REF-P002', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(3, 7, 8, 8, '2025-10-03', 55000.00, 'efectivo', 'REF-P003', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(4, 8, 9, 9, '2025-10-04', 48000.00, 'transferencia', 'REF-P004', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(5, 10, 10, 10, '2025-10-05', 68000.00, 'webpay', 'REF-P005', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(6, 1, 1, 1, '2025-10-06', 45000.00, 'efectivo', 'REF-P006', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(7, 3, 4, 4, '2025-10-07', 88000.00, 'transferencia', 'REF-P007', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(8, 5, 6, 6, '2025-10-08', 73000.00, 'webpay', 'REF-P008', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(9, 9, 10, 10, '2025-10-09', 49000.00, 'efectivo', 'REF-P009', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(10, 6, 7, 7, '2025-10-10', 95000.00, 'transferencia', 'REF-P010', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago_aplicacion`
--

DROP TABLE IF EXISTS `pago_aplicacion`;
CREATE TABLE `pago_aplicacion` (
  `id` bigint NOT NULL,
  `pago_id` bigint NOT NULL,
  `cuenta_cobro_unidad_id` bigint NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `prioridad` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `pago_aplicacion`
--

INSERT INTO `pago_aplicacion` (`id`, `pago_id`, `cuenta_cobro_unidad_id`, `monto`, `prioridad`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 62000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(2, 2, 4, 31000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(3, 3, 7, 55000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(4, 4, 8, 48000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(5, 5, 10, 68000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(6, 6, 1, 45000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(7, 7, 3, 88000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(8, 8, 5, 73000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(9, 9, 9, 49000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(10, 10, 6, 95000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parametros_cobranza`
--

DROP TABLE IF EXISTS `parametros_cobranza`;
CREATE TABLE `parametros_cobranza` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `dias_gracia` int NOT NULL DEFAULT '0',
  `tasa_mora_mensual` decimal(5,2) NOT NULL DEFAULT '0.00',
  `mora_calculo` enum('diaria','mensual') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'mensual',
  `redondeo` enum('arriba','normal','abajo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'normal',
  `interes_max_mensual` decimal(5,2) DEFAULT NULL,
  `aplica_interes_sobre` enum('saldo','capital') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'saldo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `parametros_cobranza`
--

INSERT INTO `parametros_cobranza` (`id`, `comunidad_id`, `dias_gracia`, `tasa_mora_mensual`, `mora_calculo`, `redondeo`, `interes_max_mensual`, `aplica_interes_sobre`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(2, 2, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(3, 3, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(4, 4, 3, 1.80, 'diaria', 'normal', 2.20, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(5, 5, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(6, 6, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(7, 7, 4, 1.30, 'mensual', 'normal', NULL, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(8, 8, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(9, 9, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(10, 10, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

DROP TABLE IF EXISTS `persona`;
CREATE TABLE `persona` (
  `id` bigint NOT NULL,
  `rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `dv` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombres` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `apellidos` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `telefono` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Información personal de todas las personas relacionadas con el sistema';

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`id`, `rut`, `dv`, `nombres`, `apellidos`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, '18514420', '8', 'Patricio', 'Quintanilla', 'pat.quintanilla@duocuc.cl', '+56987654321', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(2, '11243882', '3', 'Elisabet', 'Robledo', 'elisabet@email.cl', '+56912345678', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(3, '21141366', '2', 'Dalila', 'Trillo', 'dalila@email.cl', '+56923456789', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(4, '9793463', '0', 'Isidora', 'Sedano', 'isidora@email.cl', '+56934567890', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(5, '2569079', '6', 'Sigfrido', 'Molins', 'sigfrido@email.cl', '+56945678901', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(6, '24317602', '6', 'José', 'Álvaro', 'elexfrank17@gmail.com', '+56956789012', NULL, '2025-10-10 18:07:27', '2025-10-16 02:49:34'),
(7, '21596168', '0', 'Jordi', 'Piñol', 'jordi@email.cl', '+56967890123', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(8, '17147778', '6', 'Flora', 'Olivares', 'flora@admin.cl', '+56978901234', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(9, '9974052', '3', 'Lina', 'Alonso', 'lina@email.cl', '+56989012345', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(10, '11788735', '9', 'Alejandro', 'Barros', 'alejandro@email.cl', '+56990123456', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
CREATE TABLE `proveedor` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `dv` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `razon_social` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `giro` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `telefono` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id`, `comunidad_id`, `rut`, `dv`, `razon_social`, `giro`, `email`, `telefono`, `direccion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, '20123456', '7', 'Aseo Brillante Ltda.', 'Servicios de limpieza', 'aseo@brillante.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(2, 2, '20234567', '8', 'Tecnoseguridad SA', 'Vigilancia y alarmas', 'contacto@tecno.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(3, 3, '20345678', '9', 'Jardín Perfecto SpA', 'Mantención áreas verdes', 'jardin@perfecto.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(4, 4, '20456789', 'K', 'Plomería Rápida', 'Servicios de plomería', 'plomeria@rapida.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(5, 5, '20567890', '1', 'ElectriCity Chile', 'Electricidad y redes', 'electri@city.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(6, 6, '20678901', '2', 'Contadores Asoc.', 'Servicios de contabilidad', 'info@contadores.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(7, 7, '20789012', '3', 'Ascensores Up', 'Mantención de ascensores', 'soporte@ascensoresup.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(8, 8, '20890123', '4', 'Ferretería Maestra', 'Suministro de materiales', 'ventas@ferreteria.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(9, 9, '20901234', '5', 'Administración Total', 'Administración Externa', 'admin@total.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(10, 10, '21012345', '6', 'Servicio Técnico Gas', 'Mantención red de gas', 'gas@servicio.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_conserjeria`
--

DROP TABLE IF EXISTS `registro_conserjeria`;
CREATE TABLE `registro_conserjeria` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `evento` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `detalle` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Libro de novedades o bitácora de conserjería';

--
-- Volcado de datos para la tabla `registro_conserjeria`
--

INSERT INTO `registro_conserjeria` (`id`, `comunidad_id`, `fecha_hora`, `usuario_id`, `evento`, `detalle`, `created_at`) VALUES
(1, 1, '2025-10-01 08:30:00', 6, 'entrega', 'Paquete grande recibido para D101.', '2025-10-10 18:10:20'),
(2, 2, '2025-10-01 15:45:00', 6, 'visita', 'Ingreso de técnico de ascensores.', '2025-10-10 18:10:20'),
(3, 3, '2025-10-02 10:00:00', 6, 'reporte', 'Fuga de agua menor reportada en piso 1.', '2025-10-10 18:10:20'),
(4, 4, '2025-10-02 19:20:00', 6, 'retiro', 'Unidad Casa A retira llave de piscina.', '2025-10-10 18:10:20'),
(5, 5, '2025-10-03 07:00:00', 6, 'otro', 'Cambio de turno de seguridad B.', '2025-10-10 18:10:20'),
(6, 6, '2025-10-03 13:30:00', 6, 'visita', 'Visita de contratista para Torre Lujo.', '2025-10-10 18:10:20'),
(7, 7, '2025-10-04 11:00:00', 6, 'reporte', 'Alarma de incendio activada por error.', '2025-10-10 18:10:20'),
(8, 8, '2025-10-04 18:40:00', 6, 'entrega', 'Correspondencia certificada para D105.', '2025-10-10 18:10:20'),
(9, 9, '2025-10-05 05:00:00', 6, 'otro', 'Prueba de grupo electrógeno OK.', '2025-10-10 18:10:20'),
(10, 10, '2025-10-05 17:15:00', 6, 'visita', 'Amigo visita a residente de D202.', '2025-10-10 18:10:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva_amenidad`
--

DROP TABLE IF EXISTS `reserva_amenidad`;
CREATE TABLE `reserva_amenidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `amenidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint NOT NULL,
  `inicio` datetime NOT NULL,
  `fin` datetime NOT NULL,
  `estado` enum('solicitada','aprobada','rechazada','cancelada','cumplida') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'solicitada',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `reserva_amenidad`
--

INSERT INTO `reserva_amenidad` (`id`, `comunidad_id`, `amenidad_id`, `unidad_id`, `persona_id`, `inicio`, `fin`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, '2025-10-15 19:00:00', '2025-10-15 22:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(2, 2, 2, 3, 3, '2025-10-16 12:00:00', '2025-10-16 16:00:00', 'solicitada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(3, 3, 3, 4, 4, '2025-10-17 07:00:00', '2025-10-17 08:00:00', 'cumplida', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(4, 4, 4, 5, 5, '2025-10-18 14:00:00', '2025-10-18 18:00:00', 'rechazada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(5, 5, 5, 6, 6, '2025-10-19 09:00:00', '2025-10-19 13:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(6, 6, 6, 7, 7, '2025-10-20 20:00:00', '2025-10-20 23:00:00', 'solicitada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(7, 7, 7, 8, 8, '2025-10-21 10:00:00', '2025-10-21 12:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(8, 8, 8, 9, 9, '2025-10-22 17:00:00', '2025-10-22 21:00:00', 'cumplida', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(9, 9, 9, 10, 10, '2025-10-23 11:00:00', '2025-10-23 12:30:00', 'cancelada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(10, 10, 10, 10, 10, '2025-10-24 16:00:00', '2025-10-24 18:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_sistema`
--

DROP TABLE IF EXISTS `rol_sistema`;
CREATE TABLE `rol_sistema` (
  `id` int NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nivel_acceso` int NOT NULL DEFAULT '0' COMMENT '0=mínimo, 100=superadmin',
  `es_rol_sistema` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=rol del sistema, 0=rol de comunidad',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de roles disponibles en el sistema';

--
-- Volcado de datos para la tabla `rol_sistema`
--

INSERT INTO `rol_sistema` (`id`, `codigo`, `nombre`, `descripcion`, `nivel_acceso`, `es_rol_sistema`, `created_at`) VALUES
(1, 'superadmin', 'Super Administrador', NULL, 100, 1, '2025-10-10 18:07:30'),
(2, 'admin_comunidad', 'Admin Comunidad', NULL, 80, 0, '2025-10-10 18:07:30'),
(3, 'conserje', 'Conserje', NULL, 50, 0, '2025-10-10 18:07:30'),
(4, 'contador', 'Contador', NULL, 70, 0, '2025-10-10 18:07:30'),
(5, 'proveedor_servicio', 'Proveedor Servicio', NULL, 30, 0, '2025-10-10 18:07:30'),
(6, 'residente', 'Residente', NULL, 10, 0, '2025-10-10 18:07:30'),
(7, 'propietario', 'Propietario', NULL, 20, 0, '2025-10-10 18:07:30'),
(8, 'inquilino', 'Inquilino', NULL, 15, 0, '2025-10-10 18:07:30'),
(9, 'tesorero', 'Tesorero', NULL, 60, 0, '2025-10-10 18:07:30'),
(10, 'presidente_comite', 'Presidente Comité', NULL, 85, 0, '2025-10-10 18:07:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesion_usuario`
--

DROP TABLE IF EXISTS `sesion_usuario`;
CREATE TABLE `sesion_usuario` (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `usuario_id` bigint NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `sesion_usuario`
--

INSERT INTO `sesion_usuario` (`id`, `usuario_id`, `ip_address`, `user_agent`, `data`, `last_activity`, `created_at`) VALUES
('SES-01', 1, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-10 17:00:00', '2025-10-10 18:10:23'),
('SES-02', 2, '192.168.1.2', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-10 16:30:00', '2025-10-10 18:10:23'),
('SES-03', 3, '192.168.1.3', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-10 15:50:00', '2025-10-10 18:10:23'),
('SES-04', 4, '192.168.1.4', 'Mozilla/5.0 (Android)', NULL, '2025-10-09 10:00:00', '2025-10-10 18:10:23'),
('SES-05', 5, '192.168.1.5', 'Mozilla/5.0 (Linux)', NULL, '2025-10-10 14:15:00', '2025-10-10 18:10:23'),
('SES-06', 6, '192.168.1.6', 'Mozilla/5.0 (iPad)', NULL, '2025-10-10 13:45:00', '2025-10-10 18:10:23'),
('SES-07', 7, '192.168.1.7', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-08 11:20:00', '2025-10-10 18:10:23'),
('SES-08', 8, '192.168.1.8', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-10 12:05:00', '2025-10-10 18:10:23'),
('SES-09', 9, '192.168.1.9', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-10 11:30:00', '2025-10-10 18:10:23'),
('SES-10', 10, '192.168.1.10', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-10 10:00:00', '2025-10-10 18:10:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarifa_consumo`
--

DROP TABLE IF EXISTS `tarifa_consumo`;
CREATE TABLE `tarifa_consumo` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `tipo` enum('agua','gas','electricidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `periodo_desde` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `periodo_hasta` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `precio_por_unidad` decimal(12,6) NOT NULL DEFAULT '0.000000',
  `cargo_fijo` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tarifa_consumo`
--

INSERT INTO `tarifa_consumo` (`id`, `comunidad_id`, `tipo`, `periodo_desde`, `periodo_hasta`, `precio_por_unidad`, `cargo_fijo`, `created_at`, `updated_at`) VALUES
(1, 1, 'agua', '2025-09', NULL, 0.650000, 1800.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(2, 2, 'gas', '2025-09', NULL, 1.200000, 2200.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(3, 3, 'electricidad', '2025-09', NULL, 0.950000, 2500.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(4, 4, 'agua', '2025-09', NULL, 0.700000, 1900.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(5, 5, 'gas', '2025-09', NULL, 1.300000, 2000.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(6, 6, 'electricidad', '2025-09', NULL, 1.000000, 2600.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(7, 7, 'agua', '2025-09', NULL, 0.600000, 1700.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(8, 8, 'gas', '2025-09', NULL, 1.250000, 2100.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(9, 9, 'electricidad', '2025-09', NULL, 0.900000, 2400.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(10, 10, 'agua', '2025-09', NULL, 0.680000, 1850.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ticket`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `ticket`;
CREATE TABLE `ticket` (
`asignado_a` bigint
,`attachments_json` longtext
,`categoria` varchar(120)
,`comunidad_id` bigint
,`created_at` datetime
,`descripcion` varchar(1000)
,`estado` enum('abierto','en_progreso','resuelto','cerrado')
,`id` bigint
,`prioridad` enum('baja','media','alta')
,`titulo` varchar(200)
,`unidad_id` bigint
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket_soporte`
--

DROP TABLE IF EXISTS `ticket_soporte`;
CREATE TABLE `ticket_soporte` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `categoria` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `estado` enum('abierto','en_progreso','resuelto','cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'abierto',
  `prioridad` enum('baja','media','alta') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'media',
  `asignado_a` bigint DEFAULT NULL,
  `attachments_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tickets o solicitudes de soporte/mantención';

--
-- Volcado de datos para la tabla `ticket_soporte`
--

INSERT INTO `ticket_soporte` (`id`, `comunidad_id`, `unidad_id`, `categoria`, `titulo`, `descripcion`, `estado`, `prioridad`, `asignado_a`, `attachments_json`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Electricidad', 'Problema con medidor', 'Medidor no marca correctamente.', 'abierto', 'alta', 8, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(2, 2, 3, 'Limpieza', 'Basura en pasillo', 'Basura acumulada cerca del ducto.', 'en_progreso', 'media', 6, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(3, 3, 4, 'Ascensor', 'Ascensor detenido', 'Ascensor principal no funciona.', 'cerrado', 'alta', 7, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(4, 4, 5, 'Jardinería', 'Árbol seco', 'Árbol frontal necesita ser retirado.', 'abierto', 'baja', NULL, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(5, 5, 6, 'Seguridad', 'Cámara apagada', 'Cámara de seguridad N°5 no enciende.', 'en_progreso', 'alta', 2, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(6, 6, 7, 'Mantención', 'Filtración en techo', 'Mancha de humedad en techo de unidad D1001.', 'resuelto', 'media', 1, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(7, 7, 8, 'Iluminación', 'Foco quemado', 'Foco quemado en pasillo piso 15.', 'cerrado', 'media', 5, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(8, 8, 9, 'Infraestructura', 'Grieta en muro exterior', 'Grieta visible en bloque 1.', 'abierto', 'alta', NULL, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(9, 9, 10, 'Ascensor', 'Ruidos extraños', 'Ascensor hace ruidos al frenar.', 'en_progreso', 'alta', 3, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(10, 10, 10, 'Electricidad', 'Cortocircuito', 'Olor a quemado cerca de la sala eléctrica.', 'cerrado', 'alta', 4, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `titulares_unidad`
--

DROP TABLE IF EXISTS `titulares_unidad`;
CREATE TABLE `titulares_unidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint NOT NULL,
  `tipo` enum('propietario','arrendatario') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `desde` date NOT NULL,
  `hasta` date DEFAULT NULL,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT '100.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `titulares_unidad`
--

INSERT INTO `titulares_unidad` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `tipo`, `desde`, `hasta`, `porcentaje`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'propietario', '2024-01-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(2, 1, 2, 2, 'arrendatario', '2024-02-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(3, 2, 3, 3, 'propietario', '2024-03-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(4, 3, 4, 4, 'arrendatario', '2024-04-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(5, 4, 5, 5, 'propietario', '2024-05-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(6, 5, 6, 6, 'arrendatario', '2024-06-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(7, 6, 7, 7, 'propietario', '2024-07-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(8, 7, 8, 8, 'arrendatario', '2024-08-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(9, 8, 9, 9, 'propietario', '2024-09-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(10, 9, 9, 10, 'arrendatario', '2024-10-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `titularidad_unidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `titularidad_unidad`;
CREATE TABLE `titularidad_unidad` (
`comunidad_id` bigint
,`created_at` datetime
,`desde` date
,`hasta` date
,`id` bigint
,`persona_id` bigint
,`porcentaje` decimal(5,2)
,`tipo` enum('propietario','arrendatario')
,`unidad_id` bigint
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `torre`
--

DROP TABLE IF EXISTS `torre`;
CREATE TABLE `torre` (
  `id` bigint NOT NULL,
  `edificio_id` bigint NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `torre`
--

INSERT INTO `torre` (`id`, `edificio_id`, `nombre`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Torre 1', 'T01', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(2, 1, 'Torre 2', 'T02', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(3, 2, 'Torre Norte', 'TN', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(4, 3, 'Única Torre', 'UT', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(5, 4, 'Sector A', 'SA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(6, 5, 'Alameda A', 'AA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(7, 6, 'Luxury A', 'LA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(8, 7, 'Central A', 'CA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(9, 8, 'Bloque Principal', 'BP', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(10, 10, 'Torre 1', 'T1', '2025-10-10 18:07:38', '2025-10-10 18:07:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `uf_valor`
--

DROP TABLE IF EXISTS `uf_valor`;
CREATE TABLE `uf_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `uf_valor`
--

INSERT INTO `uf_valor` (`fecha`, `valor`) VALUES
('2025-10-01', 36525.1234),
('2025-10-02', 36530.4567),
('2025-10-03', 36535.7890),
('2025-10-04', 36540.1223),
('2025-10-05', 36545.4556),
('2025-10-06', 36550.7889),
('2025-10-07', 36555.1222),
('2025-10-08', 36560.4555),
('2025-10-09', 36565.7888),
('2025-10-10', 36570.1221),
('2025-10-14', 39511.0800),
('2025-10-15', 39516.1700);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidad`
--

DROP TABLE IF EXISTS `unidad`;
CREATE TABLE `unidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `edificio_id` bigint DEFAULT NULL,
  `torre_id` bigint DEFAULT NULL,
  `codigo` varchar(50) NOT NULL,
  `alicuota` decimal(8,6) NOT NULL DEFAULT '0.000000',
  `m2_utiles` decimal(10,2) DEFAULT NULL,
  `m2_terrazas` decimal(10,2) DEFAULT NULL,
  `nro_bodega` varchar(50) DEFAULT NULL,
  `nro_estacionamiento` varchar(50) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `unidad`
--

INSERT INTO `unidad` (`id`, `comunidad_id`, `edificio_id`, `torre_id`, `codigo`, `alicuota`, `m2_utiles`, `m2_terrazas`, `nro_bodega`, `nro_estacionamiento`, `activa`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'D101', 0.015000, 60.50, NULL, NULL, 'E101', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(2, 1, 1, 2, 'D201', 0.020000, 75.80, NULL, NULL, 'E201', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(3, 2, 2, 3, 'D305', 0.018000, 68.20, NULL, NULL, 'E305', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(4, 3, 3, 4, 'D402', 0.025000, 85.00, NULL, NULL, 'E402', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(5, 4, 4, 5, 'Casa A', 0.030000, 120.00, NULL, NULL, 'CPA', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(6, 5, 5, 6, 'D501', 0.012000, 55.00, NULL, NULL, 'E501', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(7, 6, 6, 7, 'D1001', 0.040000, 150.90, NULL, NULL, 'EL1', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(8, 7, 7, 8, 'D1502', 0.022000, 78.10, NULL, NULL, 'E152', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(9, 8, 8, 9, 'D105', 0.017000, 63.40, NULL, NULL, 'E105', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(10, 10, 10, 10, 'D202', 0.019000, 70.30, NULL, NULL, 'E202', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `id` int UNSIGNED NOT NULL,
  `user_id` bigint NOT NULL,
  `preferences` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `preferences`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(2, 2, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(3, 3, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(4, 4, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(5, 5, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(6, 6, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(7, 7, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(8, 8, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(9, 9, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(10, 10, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id` bigint NOT NULL,
  `persona_id` bigint NOT NULL COMMENT 'FK obligatoria a tabla persona',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `hash_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_superadmin` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'DEPRECADO: Usar tabla usuario_comunidad_rol con rol superadmin',
  `totp_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `totp_enabled` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Credenciales de acceso al sistema, siempre vinculado a una persona';

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `persona_id`, `username`, `hash_password`, `email`, `activo`, `created_at`, `updated_at`, `is_superadmin`, `totp_secret`, `totp_enabled`) VALUES
(1, 1, 'pquintanilla', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'pat.quintanilla@duocuc.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:39:18', 1, NULL, 0),
(2, 2, 'erobledo', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'elisabet@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:17', 0, NULL, 0),
(3, 3, 'dtrillo', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'dalila@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(4, 4, 'isedano', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'isidora@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(5, 5, 'smolins', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sigfrido@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(6, 6, 'jconserje', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jose@conserje.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:19', 0, NULL, 0),
(7, 7, 'jpiñol', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jordi@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:19', 0, NULL, 0),
(8, 8, 'fadmin', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'flora@admin.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:23', 0, NULL, 0),
(9, 9, 'lalonsop', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'lina@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:24', 0, NULL, 0),
(10, 10, 'abarros', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'alejandro@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:42', 0, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `usuario_miembro_comunidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `usuario_miembro_comunidad`;
CREATE TABLE `usuario_miembro_comunidad` (
`activo` tinyint(1)
,`comunidad_id` bigint
,`created_at` datetime
,`desde` date
,`hasta` date
,`id` bigint
,`persona_id` bigint
,`rol` varchar(50)
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_rol_comunidad`
--

DROP TABLE IF EXISTS `usuario_rol_comunidad`;
CREATE TABLE `usuario_rol_comunidad` (
  `id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `rol_id` int NOT NULL,
  `desde` date NOT NULL,
  `hasta` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Roles de usuarios en cada comunidad';

--
-- Volcado de datos para la tabla `usuario_rol_comunidad`
--

INSERT INTO `usuario_rol_comunidad` (`id`, `usuario_id`, `comunidad_id`, `rol_id`, `desde`, `hasta`, `activo`, `created_at`, `updated_at`) VALUES
(2, 2, 2, 8, '2024-02-15', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(3, 3, 3, 6, '2024-03-20', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(4, 4, 4, 7, '2024-04-10', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(5, 5, 5, 2, '2024-05-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(6, 6, 6, 3, '2024-06-25', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(7, 7, 7, 6, '2024-07-07', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(8, 8, 8, 10, '2024-08-18', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(9, 9, 9, 4, '2024-09-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(10, 10, 10, 9, '2024-10-05', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `utm_valor`
--

DROP TABLE IF EXISTS `utm_valor`;
CREATE TABLE `utm_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `utm_valor`
--

INSERT INTO `utm_valor` (`fecha`, `valor`) VALUES
('2025-10-01', 69265.00),
('2025-10-02', 68148.97),
('2025-10-03', 68736.87),
('2025-10-04', 69106.69),
('2025-10-05', 67311.87),
('2025-10-06', 66974.94),
('2025-10-07', 65985.37),
('2025-10-08', 66620.53),
('2025-10-09', 67012.59),
('2025-10-10', 60880.97);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_compras`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_compras`;
CREATE TABLE `vista_compras` (
`comunidad_id` bigint
,`comunidad_nombre` varchar(200)
,`created_at` datetime
,`exento` decimal(12,2)
,`fecha_emision` date
,`folio` varchar(50)
,`glosa` varchar(250)
,`id` bigint
,`iva` decimal(12,2)
,`neto` decimal(12,2)
,`proveedor_id` bigint
,`proveedor_nombre` varchar(200)
,`tipo_doc` enum('factura','boleta','nota_credito')
,`total` decimal(12,2)
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_consumos`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_consumos`;
CREATE TABLE `vista_consumos` (
`comunidad_id` bigint
,`comunidad_nombre` varchar(200)
,`consumo` decimal(13,3)
,`fecha_fin_periodo` date
,`fecha_inicio_periodo` date
,`lecturas_en_periodo` bigint
,`medidor_codigo` varchar(50)
,`medidor_id` bigint
,`medidor_tipo` enum('agua','gas','electricidad')
,`periodo` char(7)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_medidores`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_medidores`;
CREATE TABLE `vista_medidores` (
`activo` tinyint(1)
,`comunidad_id` bigint
,`comunidad_nombre` varchar(200)
,`created_at` datetime
,`created_by` bigint
,`es_compartido` tinyint(1)
,`estado` enum('activo','inactivo','mantenimiento')
,`fecha_ultima_lectura` date
,`id` bigint
,`marca` varchar(100)
,`medidor_codigo` varchar(50)
,`modelo` varchar(100)
,`serial_number` varchar(100)
,`tipo` enum('agua','gas','electricidad')
,`total_lecturas` bigint
,`ubicacion` json
,`ultima_lectura` decimal(12,3)
,`unidad_codigo` varchar(50)
,`unidad_id` bigint
,`unidad_torre_id` bigint
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `webhook_pago`
--

DROP TABLE IF EXISTS `webhook_pago`;
CREATE TABLE `webhook_pago` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `proveedor` enum('webpay','khipu','otro','transferencia') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `fecha_recepcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `procesado` tinyint(1) NOT NULL DEFAULT '0',
  `pago_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `webhook_pago`
--

INSERT INTO `webhook_pago` (`id`, `comunidad_id`, `proveedor`, `payload_json`, `fecha_recepcion`, `procesado`, `pago_id`) VALUES
(1, 2, 'transferencia', '{\"tx_id\": \"tr1\", \"monto\": 62000}', '2025-10-10 18:10:28', 1, 1),
(2, 4, 'webpay', '{\"tx_id\": \"wp2\", \"monto\": 31000}', '2025-10-10 18:10:28', 1, 2),
(3, 7, 'otro', '{\"detalle\": \"efectivo 55000\"}', '2025-10-10 18:10:28', 1, 3),
(4, 8, 'transferencia', '{\"tx_id\": \"tr4\", \"monto\": 48000}', '2025-10-10 18:10:28', 1, 4),
(5, 10, 'webpay', '{\"tx_id\": \"wp5\", \"monto\": 68000}', '2025-10-10 18:10:28', 1, 5),
(6, 1, 'transferencia', '{\"tx_id\": \"tr6\", \"monto\": 45000}', '2025-10-10 18:10:28', 0, NULL),
(7, 3, 'transferencia', '{\"tx_id\": \"tr7\", \"monto\": 88000}', '2025-10-10 18:10:28', 0, NULL),
(8, 5, 'webpay', '{\"tx_id\": \"wp8\", \"monto\": 73000}', '2025-10-10 18:10:28', 0, NULL),
(9, 9, 'otro', '{\"detalle\": \"efectivo 49000\"}', '2025-10-10 18:10:28', 0, NULL),
(10, 6, 'transferencia', '{\"tx_id\": \"tr10\", \"monto\": 95000}', '2025-10-10 18:10:28', 0, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `amenidad`
--
ALTER TABLE `amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_amenidad_comunidad` (`comunidad_id`),
  ADD KEY `idx_comunidad_id` (`comunidad_id`);

--
-- Indices de la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comunidad_entity` (`comunidad_id`,`entity_type`,`entity_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_uploaded_at` (`uploaded_at`);

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_usuario` (`usuario_id`),
  ADD KEY `ix_audit_tabla` (`tabla`,`registro_id`),
  ADD KEY `ix_audit_fecha` (`created_at`),
  ADD KEY `ix_auditoria_accion` (`accion`),
  ADD KEY `ix_auditoria_usuario_fecha` (`usuario_id`,`created_at`);

--
-- Indices de la tabla `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_catgasto_nombre` (`comunidad_id`,`nombre`);

--
-- Indices de la tabla `centro_costo`
--
ALTER TABLE `centro_costo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ccosto_codigo` (`comunidad_id`,`codigo`);

--
-- Indices de la tabla `comunidad`
--
ALTER TABLE `comunidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_comunidad_rut` (`rut`,`dv`);

--
-- Indices de la tabla `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_conc_comunidad` (`comunidad_id`),
  ADD KEY `fk_conc_pago` (`pago_id`);

--
-- Indices de la tabla `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_cint_comunidad` (`comunidad_id`);

--
-- Indices de la tabla `cuenta_cobro_unidad`
--
ALTER TABLE `cuenta_cobro_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargo_emision` (`emision_id`),
  ADD KEY `fk_cargo_comunidad` (`comunidad_id`),
  ADD KEY `ix_cargo_unidad` (`unidad_id`),
  ADD KEY `ix_cargo_estado` (`estado`);

--
-- Indices de la tabla `detalle_cuenta_unidad`
--
ALTER TABLE `detalle_cuenta_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargodet_categoria` (`categoria_id`),
  ADD KEY `ix_cargodet_cargo` (`cuenta_cobro_unidad_id`);

--
-- Indices de la tabla `detalle_emision_gastos`
--
ALTER TABLE `detalle_emision_gastos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_emidet_gasto` (`gasto_id`),
  ADD KEY `fk_emidet_categoria` (`categoria_id`),
  ADD KEY `ix_emidet_emision` (`emision_id`);

--
-- Indices de la tabla `documento_compra`
--
ALTER TABLE `documento_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_doc_compra` (`comunidad_id`,`proveedor_id`,`tipo_doc`,`folio`),
  ADD KEY `fk_doc_comunidad` (`comunidad_id`),
  ADD KEY `ix_doc_proveedor` (`proveedor_id`);

--
-- Indices de la tabla `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_docrepo_comunidad` (`comunidad_id`);

--
-- Indices de la tabla `documento_multa`
--
ALTER TABLE `documento_multa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documento_multa_usuario` (`subido_por`),
  ADD KEY `fk_documento_multa` (`multa_id`);

--
-- Indices de la tabla `edificio`
--
ALTER TABLE `edificio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_edificio_comunidad` (`comunidad_id`);

--
-- Indices de la tabla `emision_gastos_comunes`
--
ALTER TABLE `emision_gastos_comunes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_emision_periodo` (`comunidad_id`,`periodo`);

--
-- Indices de la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_gasto_numero_comunidad` (`comunidad_id`,`numero`),
  ADD KEY `fk_gasto_comunidad` (`comunidad_id`),
  ADD KEY `fk_gasto_ccosto` (`centro_costo_id`),
  ADD KEY `fk_gasto_doc` (`documento_compra_id`),
  ADD KEY `ix_gasto_categoria` (`categoria_id`),
  ADD KEY `fk_gasto_anulado_por` (`anulado_por`),
  ADD KEY `fk_gasto_aprobado_por` (`aprobado_por`),
  ADD KEY `fk_gasto_creado_por` (`creado_por`);

--
-- Indices de la tabla `gasto_aprobacion`
--
ALTER TABLE `gasto_aprobacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aprobacion_gasto` (`gasto_id`),
  ADD KEY `fk_aprobacion_usuario` (`usuario_id`),
  ADD KEY `fk_aprobacion_rol` (`rol_id`);

--
-- Indices de la tabla `historial_gasto`
--
ALTER TABLE `historial_gasto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_historial_gasto` (`gasto_id`),
  ADD KEY `fk_historial_usuario` (`usuario_id`);

--
-- Indices de la tabla `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lectura_periodo` (`medidor_id`,`periodo`),
  ADD KEY `ix_lectura_medidor` (`medidor_id`);

--
-- Indices de la tabla `medidor`
--
ALTER TABLE `medidor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_medidor_codigo` (`comunidad_id`,`codigo`),
  ADD KEY `fk_medidor_unidad` (`unidad_id`);

--
-- Indices de la tabla `multa`
--
ALTER TABLE `multa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `fk_multa_comunidad` (`comunidad_id`),
  ADD KEY `fk_multa_unidad` (`unidad_id`),
  ADD KEY `fk_multa_persona` (`persona_id`),
  ADD KEY `ix_multa_estado` (`estado`),
  ADD KEY `fk_multa_creada_por` (`creada_por`),
  ADD KEY `fk_multa_aprobada_por` (`aprobada_por`),
  ADD KEY `fk_multa_anulado_por` (`anulado_por`),
  ADD KEY `fk_multa_pagado_por` (`pagado_por`);

--
-- Indices de la tabla `multa_apelacion`
--
ALTER TABLE `multa_apelacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_apelacion_multa` (`multa_id`),
  ADD KEY `fk_apelacion_usuario` (`usuario_id`),
  ADD KEY `fk_apelacion_persona` (`persona_id`),
  ADD KEY `fk_apelacion_comunidad` (`comunidad_id`);

--
-- Indices de la tabla `multa_historial`
--
ALTER TABLE `multa_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_historial_multa` (`multa_id`),
  ADD KEY `fk_historial_multa_usuario` (`usuario_id`);

--
-- Indices de la tabla `notificacion_usuario`
--
ALTER TABLE `notificacion_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_comunidad` (`comunidad_id`),
  ADD KEY `fk_notif_persona` (`persona_id`),
  ADD KEY `ix_notif_persona_leida` (`persona_id`,`leida`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pago_comunidad` (`comunidad_id`),
  ADD KEY `fk_pago_unidad` (`unidad_id`),
  ADD KEY `fk_pago_persona` (`persona_id`),
  ADD KEY `ix_pago_fecha` (`fecha`),
  ADD KEY `ix_pago_comunidad_fecha` (`comunidad_id`,`fecha`),
  ADD KEY `ix_pago_comunidad_estado` (`comunidad_id`,`estado`);

--
-- Indices de la tabla `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_papp` (`pago_id`,`cuenta_cobro_unidad_id`),
  ADD KEY `fk_papp_cargo` (`cuenta_cobro_unidad_id`),
  ADD KEY `ix_papp_pago` (`pago_id`);

--
-- Indices de la tabla `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `comunidad_id` (`comunidad_id`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_persona_rut` (`rut`,`dv`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_proveedor_rut` (`comunidad_id`,`rut`,`dv`);

--
-- Indices de la tabla `registro_conserjeria`
--
ALTER TABLE `registro_conserjeria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bitacora_comunidad` (`comunidad_id`),
  ADD KEY `fk_regconser_usuario` (`usuario_id`);

--
-- Indices de la tabla `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resa_comunidad` (`comunidad_id`),
  ADD KEY `fk_resa_amenidad` (`amenidad_id`),
  ADD KEY `fk_resa_unidad` (`unidad_id`),
  ADD KEY `fk_resa_persona` (`persona_id`),
  ADD KEY `ix_reserva_amenidad_rango` (`amenidad_id`,`inicio`,`fin`);

--
-- Indices de la tabla `rol_sistema`
--
ALTER TABLE `rol_sistema`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_rol_codigo` (`codigo`);

--
-- Indices de la tabla `sesion_usuario`
--
ALTER TABLE `sesion_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sesion_usuario` (`usuario_id`),
  ADD KEY `ix_sesion_activity` (`last_activity`),
  ADD KEY `ix_sesion_usuario_created` (`created_at`);

--
-- Indices de la tabla `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_tarifa_comunidad` (`comunidad_id`);

--
-- Indices de la tabla `ticket_soporte`
--
ALTER TABLE `ticket_soporte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_comunidad` (`comunidad_id`),
  ADD KEY `fk_ticket_unidad` (`unidad_id`),
  ADD KEY `fk_solsoporte_asignado` (`asignado_a`);

--
-- Indices de la tabla `titulares_unidad`
--
ALTER TABLE `titulares_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tenencia_comunidad` (`comunidad_id`),
  ADD KEY `ix_tenencia_unidad` (`unidad_id`),
  ADD KEY `ix_tenencia_persona` (`persona_id`);

--
-- Indices de la tabla `torre`
--
ALTER TABLE `torre`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_torre_edificio` (`edificio_id`);

--
-- Indices de la tabla `uf_valor`
--
ALTER TABLE `uf_valor`
  ADD PRIMARY KEY (`fecha`);

--
-- Indices de la tabla `unidad`
--
ALTER TABLE `unidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_unidad_codigo` (`comunidad_id`,`codigo`),
  ADD KEY `ix_unidad_comunidad` (`comunidad_id`),
  ADD KEY `ix_unidad_edificio` (`edificio_id`),
  ADD KEY `ix_unidad_torre` (`torre_id`);

--
-- Indices de la tabla `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_preferences` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_username` (`username`),
  ADD KEY `fk_usuario_persona` (`persona_id`);

--
-- Indices de la tabla `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_comunidad_rol_activo` (`usuario_id`,`comunidad_id`,`rol_id`,`activo`),
  ADD KEY `fk_ucr_usuario` (`usuario_id`),
  ADD KEY `fk_ucr_comunidad` (`comunidad_id`),
  ADD KEY `fk_ucr_rol` (`rol_id`),
  ADD KEY `ix_ucr_activo` (`activo`);

--
-- Indices de la tabla `utm_valor`
--
ALTER TABLE `utm_valor`
  ADD PRIMARY KEY (`fecha`);

--
-- Indices de la tabla `webhook_pago`
--
ALTER TABLE `webhook_pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wh_comunidad` (`comunidad_id`),
  ADD KEY `fk_wh_pago` (`pago_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `multa`
--
ALTER TABLE `multa`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `multa_apelacion`
--
ALTER TABLE `multa_apelacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `multa_historial`
--
ALTER TABLE `multa_historial`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

-- --------------------------------------------------------

--
-- Estructura para la vista `bitacora_conserjeria`
--
DROP TABLE IF EXISTS `bitacora_conserjeria`;

DROP VIEW IF EXISTS `bitacora_conserjeria`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `bitacora_conserjeria`  AS SELECT `registro_conserjeria`.`id` AS `id`, `registro_conserjeria`.`comunidad_id` AS `comunidad_id`, `registro_conserjeria`.`fecha_hora` AS `fecha_hora`, `registro_conserjeria`.`usuario_id` AS `usuario_id`, `registro_conserjeria`.`evento` AS `evento`, `registro_conserjeria`.`detalle` AS `detalle`, `registro_conserjeria`.`created_at` AS `created_at` FROM `registro_conserjeria` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `cargo_financiero_unidad`
--
DROP TABLE IF EXISTS `cargo_financiero_unidad`;

DROP VIEW IF EXISTS `cargo_financiero_unidad`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `cargo_financiero_unidad`  AS SELECT `cuenta_cobro_unidad`.`id` AS `id`, `cuenta_cobro_unidad`.`emision_id` AS `emision_id`, `cuenta_cobro_unidad`.`comunidad_id` AS `comunidad_id`, `cuenta_cobro_unidad`.`unidad_id` AS `unidad_id`, `cuenta_cobro_unidad`.`monto_total` AS `monto_total`, `cuenta_cobro_unidad`.`saldo` AS `saldo`, `cuenta_cobro_unidad`.`estado` AS `estado`, `cuenta_cobro_unidad`.`interes_acumulado` AS `interes_acumulado`, `cuenta_cobro_unidad`.`created_at` AS `created_at`, `cuenta_cobro_unidad`.`updated_at` AS `updated_at` FROM `cuenta_cobro_unidad` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `detalle_cargo_unidad`
--
DROP TABLE IF EXISTS `detalle_cargo_unidad`;

DROP VIEW IF EXISTS `detalle_cargo_unidad`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `detalle_cargo_unidad`  AS SELECT `detalle_cuenta_unidad`.`id` AS `id`, `detalle_cuenta_unidad`.`cuenta_cobro_unidad_id` AS `cargo_unidad_id`, `detalle_cuenta_unidad`.`categoria_id` AS `categoria_id`, `detalle_cuenta_unidad`.`glosa` AS `glosa`, `detalle_cuenta_unidad`.`monto` AS `monto`, `detalle_cuenta_unidad`.`origen` AS `origen`, `detalle_cuenta_unidad`.`origen_id` AS `origen_id`, `detalle_cuenta_unidad`.`iva_incluido` AS `iva_incluido`, `detalle_cuenta_unidad`.`created_at` AS `created_at`, `detalle_cuenta_unidad`.`updated_at` AS `updated_at` FROM `detalle_cuenta_unidad` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `emision_gasto_comun`
--
DROP TABLE IF EXISTS `emision_gasto_comun`;

DROP VIEW IF EXISTS `emision_gasto_comun`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `emision_gasto_comun`  AS SELECT `emision_gastos_comunes`.`id` AS `id`, `emision_gastos_comunes`.`comunidad_id` AS `comunidad_id`, `emision_gastos_comunes`.`periodo` AS `periodo`, `emision_gastos_comunes`.`fecha_vencimiento` AS `fecha_vencimiento`, `emision_gastos_comunes`.`estado` AS `estado`, `emision_gastos_comunes`.`observaciones` AS `observaciones`, `emision_gastos_comunes`.`created_at` AS `created_at`, `emision_gastos_comunes`.`updated_at` AS `updated_at` FROM `emision_gastos_comunes` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `emision_gasto_detalle`
--
DROP TABLE IF EXISTS `emision_gasto_detalle`;

DROP VIEW IF EXISTS `emision_gasto_detalle`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `emision_gasto_detalle`  AS SELECT `detalle_emision_gastos`.`id` AS `id`, `detalle_emision_gastos`.`emision_id` AS `emision_id`, `detalle_emision_gastos`.`gasto_id` AS `gasto_id`, `detalle_emision_gastos`.`categoria_id` AS `categoria_id`, `detalle_emision_gastos`.`monto` AS `monto`, `detalle_emision_gastos`.`regla_prorrateo` AS `regla_prorrateo`, `detalle_emision_gastos`.`metadata_json` AS `metadata_json`, `detalle_emision_gastos`.`created_at` AS `created_at`, `detalle_emision_gastos`.`updated_at` AS `updated_at` FROM `detalle_emision_gastos` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `ticket`
--
DROP TABLE IF EXISTS `ticket`;

DROP VIEW IF EXISTS `ticket`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `ticket`  AS SELECT `ticket_soporte`.`id` AS `id`, `ticket_soporte`.`comunidad_id` AS `comunidad_id`, `ticket_soporte`.`unidad_id` AS `unidad_id`, `ticket_soporte`.`categoria` AS `categoria`, `ticket_soporte`.`titulo` AS `titulo`, `ticket_soporte`.`descripcion` AS `descripcion`, `ticket_soporte`.`estado` AS `estado`, `ticket_soporte`.`prioridad` AS `prioridad`, `ticket_soporte`.`asignado_a` AS `asignado_a`, `ticket_soporte`.`attachments_json` AS `attachments_json`, `ticket_soporte`.`created_at` AS `created_at`, `ticket_soporte`.`updated_at` AS `updated_at` FROM `ticket_soporte` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `titularidad_unidad`
--
DROP TABLE IF EXISTS `titularidad_unidad`;

DROP VIEW IF EXISTS `titularidad_unidad`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `titularidad_unidad`  AS SELECT `titulares_unidad`.`id` AS `id`, `titulares_unidad`.`comunidad_id` AS `comunidad_id`, `titulares_unidad`.`unidad_id` AS `unidad_id`, `titulares_unidad`.`persona_id` AS `persona_id`, `titulares_unidad`.`tipo` AS `tipo`, `titulares_unidad`.`desde` AS `desde`, `titulares_unidad`.`hasta` AS `hasta`, `titulares_unidad`.`porcentaje` AS `porcentaje`, `titulares_unidad`.`created_at` AS `created_at`, `titulares_unidad`.`updated_at` AS `updated_at` FROM `titulares_unidad` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `usuario_miembro_comunidad`
--
DROP TABLE IF EXISTS `usuario_miembro_comunidad`;

DROP VIEW IF EXISTS `usuario_miembro_comunidad`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `usuario_miembro_comunidad`  AS SELECT `urc`.`id` AS `id`, `urc`.`comunidad_id` AS `comunidad_id`, `u`.`persona_id` AS `persona_id`, `r`.`codigo` AS `rol`, `urc`.`desde` AS `desde`, `urc`.`hasta` AS `hasta`, `urc`.`activo` AS `activo`, `urc`.`created_at` AS `created_at`, `urc`.`updated_at` AS `updated_at` FROM ((`usuario_rol_comunidad` `urc` join `usuario` `u` on((`u`.`id` = `urc`.`usuario_id`))) join `rol_sistema` `r` on((`r`.`id` = `urc`.`rol_id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_compras`
--
DROP TABLE IF EXISTS `vista_compras`;

DROP VIEW IF EXISTS `vista_compras`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `vista_compras`  AS SELECT `dc`.`id` AS `id`, `dc`.`comunidad_id` AS `comunidad_id`, `c`.`razon_social` AS `comunidad_nombre`, `dc`.`proveedor_id` AS `proveedor_id`, `p`.`razon_social` AS `proveedor_nombre`, `dc`.`tipo_doc` AS `tipo_doc`, `dc`.`folio` AS `folio`, `dc`.`fecha_emision` AS `fecha_emision`, `dc`.`neto` AS `neto`, `dc`.`iva` AS `iva`, `dc`.`exento` AS `exento`, coalesce(`dc`.`total`,0) AS `total`, `dc`.`glosa` AS `glosa`, `dc`.`created_at` AS `created_at`, `dc`.`updated_at` AS `updated_at` FROM ((`documento_compra` `dc` left join `proveedor` `p` on((`p`.`id` = `dc`.`proveedor_id`))) left join `comunidad` `c` on((`c`.`id` = `dc`.`comunidad_id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_consumos`
--
DROP TABLE IF EXISTS `vista_consumos`;

DROP VIEW IF EXISTS `vista_consumos`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `vista_consumos`  AS SELECT `lm`.`medidor_id` AS `medidor_id`, `m`.`codigo` AS `medidor_codigo`, `m`.`tipo` AS `medidor_tipo`, `m`.`comunidad_id` AS `comunidad_id`, `c`.`razon_social` AS `comunidad_nombre`, `lm`.`periodo` AS `periodo`, min(`lm`.`fecha`) AS `fecha_inicio_periodo`, max(`lm`.`fecha`) AS `fecha_fin_periodo`, (max(`lm`.`lectura`) - min(`lm`.`lectura`)) AS `consumo`, count(0) AS `lecturas_en_periodo` FROM ((`lectura_medidor` `lm` left join `medidor` `m` on((`m`.`id` = `lm`.`medidor_id`))) left join `comunidad` `c` on((`c`.`id` = `m`.`comunidad_id`))) GROUP BY `lm`.`medidor_id`, `lm`.`periodo` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_medidores`
--
DROP TABLE IF EXISTS `vista_medidores`;

DROP VIEW IF EXISTS `vista_medidores`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `vista_medidores`  AS SELECT `m`.`id` AS `id`, `m`.`comunidad_id` AS `comunidad_id`, `c`.`razon_social` AS `comunidad_nombre`, `m`.`unidad_id` AS `unidad_id`, `u`.`torre_id` AS `unidad_torre_id`, `u`.`codigo` AS `unidad_codigo`, `m`.`tipo` AS `tipo`, `m`.`codigo` AS `medidor_codigo`, `m`.`serial_number` AS `serial_number`, `m`.`es_compartido` AS `es_compartido`, `m`.`marca` AS `marca`, `m`.`modelo` AS `modelo`, `m`.`estado` AS `estado`, `m`.`ubicacion` AS `ubicacion`, `m`.`activo` AS `activo`, `m`.`created_by` AS `created_by`, `m`.`created_at` AS `created_at`, `m`.`updated_at` AS `updated_at`, (select `lm`.`lectura` from `lectura_medidor` `lm` where (`lm`.`medidor_id` = `m`.`id`) order by `lm`.`fecha` desc,`lm`.`id` desc limit 1) AS `ultima_lectura`, (select `lm`.`fecha` from `lectura_medidor` `lm` where (`lm`.`medidor_id` = `m`.`id`) order by `lm`.`fecha` desc,`lm`.`id` desc limit 1) AS `fecha_ultima_lectura`, (select count(0) from `lectura_medidor` `lm` where (`lm`.`medidor_id` = `m`.`id`)) AS `total_lecturas` FROM ((`medidor` `m` left join `unidad` `u` on((`u`.`id` = `m`.`unidad_id`))) left join `comunidad` `c` on((`c`.`id` = `m`.`comunidad_id`))) ;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `amenidad`
--
ALTER TABLE `amenidad`
  ADD CONSTRAINT `fk_amenidad_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD CONSTRAINT `archivos_ibfk_1` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD CONSTRAINT `fk_categoria_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `centro_costo`
--
ALTER TABLE `centro_costo`
  ADD CONSTRAINT `fk_ccosto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  ADD CONSTRAINT `fk_conc_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_conc_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  ADD CONSTRAINT `fk_cint_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `cuenta_cobro_unidad`
--
ALTER TABLE `cuenta_cobro_unidad`
  ADD CONSTRAINT `fk_cargo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_cargo_emision` FOREIGN KEY (`emision_id`) REFERENCES `emision_gastos_comunes` (`id`),
  ADD CONSTRAINT `fk_cargo_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Filtros para la tabla `detalle_cuenta_unidad`
--
ALTER TABLE `detalle_cuenta_unidad`
  ADD CONSTRAINT `fk_cargodet_cargo` FOREIGN KEY (`cuenta_cobro_unidad_id`) REFERENCES `cuenta_cobro_unidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cargodet_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`);

--
-- Filtros para la tabla `detalle_emision_gastos`
--
ALTER TABLE `detalle_emision_gastos`
  ADD CONSTRAINT `fk_emidet_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`),
  ADD CONSTRAINT `fk_emidet_emision` FOREIGN KEY (`emision_id`) REFERENCES `emision_gastos_comunes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_emidet_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `documento_compra`
--
ALTER TABLE `documento_compra`
  ADD CONSTRAINT `fk_doc_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_doc_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`);

--
-- Filtros para la tabla `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  ADD CONSTRAINT `fk_docrepo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `documento_multa`
--
ALTER TABLE `documento_multa`
  ADD CONSTRAINT `fk_documento_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documento_multa_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `edificio`
--
ALTER TABLE `edificio`
  ADD CONSTRAINT `fk_edificio_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `emision_gastos_comunes`
--
ALTER TABLE `emision_gastos_comunes`
  ADD CONSTRAINT `fk_emision_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `gasto`
--
ALTER TABLE `gasto`
  ADD CONSTRAINT `fk_gasto_anulado_por` FOREIGN KEY (`anulado_por`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_aprobado_por` FOREIGN KEY (`aprobado_por`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`),
  ADD CONSTRAINT `fk_gasto_ccosto` FOREIGN KEY (`centro_costo_id`) REFERENCES `centro_costo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_gasto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_gasto_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_doc` FOREIGN KEY (`documento_compra_id`) REFERENCES `documento_compra` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `gasto_aprobacion`
--
ALTER TABLE `gasto_aprobacion`
  ADD CONSTRAINT `fk_aprobacion_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprobacion_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol_sistema` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprobacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_gasto`
--
ALTER TABLE `historial_gasto`
  ADD CONSTRAINT `fk_historial_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  ADD CONSTRAINT `fk_lectura_medidor` FOREIGN KEY (`medidor_id`) REFERENCES `medidor` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medidor`
--
ALTER TABLE `medidor`
  ADD CONSTRAINT `fk_medidor_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_medidor_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `multa`
--
ALTER TABLE `multa`
  ADD CONSTRAINT `fk_multa_anulado_por` FOREIGN KEY (`anulado_por`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `fk_multa_aprobada_por` FOREIGN KEY (`aprobada_por`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_multa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_multa_creada_por` FOREIGN KEY (`creada_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_multa_pagado_por` FOREIGN KEY (`pagado_por`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `fk_multa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_multa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Filtros para la tabla `multa_apelacion`
--
ALTER TABLE `multa_apelacion`
  ADD CONSTRAINT `fk_apelacion_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apelacion_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apelacion_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apelacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `multa_historial`
--
ALTER TABLE `multa_historial`
  ADD CONSTRAINT `fk_historial_multa_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_multa_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificacion_usuario`
--
ALTER TABLE `notificacion_usuario`
  ADD CONSTRAINT `fk_notif_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_notif_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `fk_pago_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_pago_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pago_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  ADD CONSTRAINT `fk_papp_cargo` FOREIGN KEY (`cuenta_cobro_unidad_id`) REFERENCES `cuenta_cobro_unidad` (`id`),
  ADD CONSTRAINT `fk_papp_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  ADD CONSTRAINT `fk_paramcobr_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD CONSTRAINT `fk_prov_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `registro_conserjeria`
--
ALTER TABLE `registro_conserjeria`
  ADD CONSTRAINT `fk_bitacora_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_regconser_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  ADD CONSTRAINT `fk_resa_amenidad` FOREIGN KEY (`amenidad_id`) REFERENCES `amenidad` (`id`),
  ADD CONSTRAINT `fk_resa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_resa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_resa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Filtros para la tabla `sesion_usuario`
--
ALTER TABLE `sesion_usuario`
  ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  ADD CONSTRAINT `fk_tarifa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Filtros para la tabla `ticket_soporte`
--
ALTER TABLE `ticket_soporte`
  ADD CONSTRAINT `fk_solsoporte_asignado` FOREIGN KEY (`asignado_a`) REFERENCES `usuario` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ticket_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_ticket_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `titulares_unidad`
--
ALTER TABLE `titulares_unidad`
  ADD CONSTRAINT `fk_tenencia_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_tenencia_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_tenencia_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Filtros para la tabla `torre`
--
ALTER TABLE `torre`
  ADD CONSTRAINT `fk_torre_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id`);

--
-- Filtros para la tabla `unidad`
--
ALTER TABLE `unidad`
  ADD CONSTRAINT `fk_unidad_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_unidad_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id`),
  ADD CONSTRAINT `fk_unidad_torre` FOREIGN KEY (`torre_id`) REFERENCES `torre` (`id`);

--
-- Filtros para la tabla `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `fk_userpref_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  ADD CONSTRAINT `fk_ucr_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ucr_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol_sistema` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ucr_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `webhook_pago`
--
ALTER TABLE `webhook_pago`
  ADD CONSTRAINT `fk_wh_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_wh_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
