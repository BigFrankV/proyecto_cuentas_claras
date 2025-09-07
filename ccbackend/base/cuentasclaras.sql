-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2025 at 05:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cuentasclaras`
--

-- --------------------------------------------------------

--
-- Table structure for table `amenidad`
--

CREATE TABLE `amenidad` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `reglas` varchar(500) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `requiere_aprobacion` tinyint(1) NOT NULL DEFAULT 0,
  `tarifa` decimal(12,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bitacora_conserjeria`
--

CREATE TABLE `bitacora_conserjeria` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  `evento` varchar(150) NOT NULL,
  `detalle` varchar(1000) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cargo_unidad`
--

CREATE TABLE `cargo_unidad` (
  `id` bigint(20) NOT NULL,
  `emision_id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) NOT NULL,
  `monto_total` decimal(12,2) NOT NULL,
  `saldo` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagado','vencido','parcial') NOT NULL DEFAULT 'pendiente',
  `interes_acumulado` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cargo_unidad`
--

INSERT INTO `cargo_unidad` (`id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total`, `saldo`, `estado`, `interes_acumulado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 35000.00, 5000.00, 'pagado', 0.00, '2025-08-30 20:52:58', '2025-08-30 20:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `cargo_unidad_detalle`
--

CREATE TABLE `cargo_unidad_detalle` (
  `id` bigint(20) NOT NULL,
  `cargo_unidad_id` bigint(20) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `glosa` varchar(250) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `origen` enum('gasto','multa','consumo','ajuste') NOT NULL,
  `origen_id` bigint(20) DEFAULT NULL,
  `iva_incluido` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cargo_unidad_detalle`
--

INSERT INTO `cargo_unidad_detalle` (`id`, `cargo_unidad_id`, `categoria_id`, `glosa`, `monto`, `origen`, `origen_id`, `iva_incluido`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Multa ruidos', 50000.00, 'multa', 1, 1, '2025-08-30 20:52:59', '2025-08-30 20:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `categoria_gasto`
--

CREATE TABLE `categoria_gasto` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `tipo` enum('operacional','extraordinario','fondo_reserva','multas','consumo') NOT NULL,
  `cta_contable` varchar(50) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categoria_gasto`
--

INSERT INTO `categoria_gasto` (`id`, `comunidad_id`, `nombre`, `tipo`, `cta_contable`, `activa`, `created_at`, `updated_at`) VALUES
(1, 1, 'Aseo y Mantención', 'operacional', NULL, 1, '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `centro_costo`
--

CREATE TABLE `centro_costo` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comunidad`
--

CREATE TABLE `comunidad` (
  `id` bigint(20) NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `dv` char(1) NOT NULL,
  `giro` varchar(200) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `email_contacto` varchar(150) DEFAULT NULL,
  `telefono_contacto` varchar(50) DEFAULT NULL,
  `politica_mora_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`politica_mora_json`)),
  `moneda` varchar(10) NOT NULL DEFAULT 'CLP',
  `tz` varchar(50) NOT NULL DEFAULT 'America/Santiago',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) DEFAULT NULL,
  `updated_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comunidad`
--

INSERT INTO `comunidad` (`id`, `razon_social`, `rut`, `dv`, `giro`, `direccion`, `email_contacto`, `telefono_contacto`, `politica_mora_json`, `moneda`, `tz`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'Comunidad Las Palmas', '76895432', 'K', 'Administración de Condominios', 'Av. Providencia 1234, Santiago', 'contacto@laspalmas.cl', '+56 2 23456789', NULL, 'CLP', 'America/Santiago', '2025-08-30 20:52:58', '2025-08-30 20:52:58', NULL, NULL),
(2, 'Comunidad Admin Demo', '11111111', '1', NULL, NULL, NULL, NULL, NULL, 'CLP', 'America/Santiago', '2025-08-30 23:16:39', '2025-08-30 23:16:39', NULL, NULL),
(4, 'Comunidad Demo', '11211111', '1', NULL, NULL, NULL, NULL, NULL, 'CLP', 'America/Santiago', '2025-08-30 23:18:54', '2025-08-30 23:18:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `conciliacion_bancaria`
--

CREATE TABLE `conciliacion_bancaria` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `fecha_mov` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `glosa` varchar(250) DEFAULT NULL,
  `referencia` varchar(150) DEFAULT NULL,
  `estado` enum('pendiente','conciliado','descartado') NOT NULL DEFAULT 'pendiente',
  `pago_id` bigint(20) DEFAULT NULL,
  `extracto_id` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_interes`
--

CREATE TABLE `configuracion_interes` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `aplica_desde` date NOT NULL,
  `tasa_mensual` decimal(5,2) NOT NULL,
  `metodo` enum('simple','compuesto') NOT NULL DEFAULT 'simple',
  `tope_mensual` decimal(5,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documento`
--

CREATE TABLE `documento` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `tipo` enum('circular','acta','reglamento','boletin','otro') NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `url` varchar(500) NOT NULL,
  `periodo` char(7) DEFAULT NULL,
  `visibilidad` enum('publico','privado') NOT NULL DEFAULT 'privado',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documento_compra`
--

CREATE TABLE `documento_compra` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `proveedor_id` bigint(20) NOT NULL,
  `tipo_doc` enum('factura','boleta','nota_credito') NOT NULL,
  `folio` varchar(50) NOT NULL,
  `fecha_emision` date NOT NULL,
  `neto` decimal(12,2) NOT NULL DEFAULT 0.00,
  `iva` decimal(12,2) NOT NULL DEFAULT 0.00,
  `exento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `glosa` varchar(250) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documento_compra`
--

INSERT INTO `documento_compra` (`id`, `comunidad_id`, `proveedor_id`, `tipo_doc`, `folio`, `fecha_emision`, `neto`, `iva`, `exento`, `total`, `glosa`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'factura', 'F12345', '2025-08-01', 100000.00, 19000.00, 0.00, 119000.00, 'Servicio de aseo julio', '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `edificio`
--

CREATE TABLE `edificio` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edificio`
--

INSERT INTO `edificio` (`id`, `comunidad_id`, `nombre`, `direccion`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Edificio A', 'Av. Providencia 1234', 'EDA', '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `emision_gasto_comun`
--

CREATE TABLE `emision_gasto_comun` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `periodo` char(7) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('borrador','emitido','cerrado','anulado') NOT NULL DEFAULT 'borrador',
  `observaciones` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emision_gasto_comun`
--

INSERT INTO `emision_gasto_comun` (`id`, `comunidad_id`, `periodo`, `fecha_vencimiento`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-08', '2025-09-10', 'emitido', 'Emisión mensual agosto 2025', '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `emision_gasto_detalle`
--

CREATE TABLE `emision_gasto_detalle` (
  `id` bigint(20) NOT NULL,
  `emision_id` bigint(20) NOT NULL,
  `gasto_id` bigint(20) DEFAULT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `regla_prorrateo` enum('coeficiente','partes_iguales','consumo','fijo_por_unidad') NOT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emision_gasto_detalle`
--

INSERT INTO `emision_gasto_detalle` (`id`, `emision_id`, `gasto_id`, `categoria_id`, `monto`, `regla_prorrateo`, `metadata_json`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 119000.00, 'coeficiente', '{\"base\": \"alicuota\"}', '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `gasto`
--

CREATE TABLE `gasto` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `centro_costo_id` bigint(20) DEFAULT NULL,
  `documento_compra_id` bigint(20) DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `glosa` varchar(250) DEFAULT NULL,
  `extraordinario` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gasto`
--

INSERT INTO `gasto` (`id`, `comunidad_id`, `categoria_id`, `centro_costo_id`, `documento_compra_id`, `fecha`, `monto`, `glosa`, `extraordinario`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 1, '2025-08-01', 119000.00, 'Aseo mensual', 0, '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `lectura_medidor`
--

CREATE TABLE `lectura_medidor` (
  `id` bigint(20) NOT NULL,
  `medidor_id` bigint(20) NOT NULL,
  `fecha` date NOT NULL,
  `lectura` decimal(12,3) NOT NULL,
  `periodo` char(7) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medidor`
--

CREATE TABLE `medidor` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) DEFAULT NULL,
  `tipo` enum('agua','gas','electricidad') NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `es_compartido` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `membresia_comunidad`
--

CREATE TABLE `membresia_comunidad` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `persona_id` bigint(20) NOT NULL,
  `rol` enum('admin','comite','conserje','contador','residente','propietario') NOT NULL,
  `desde` date NOT NULL,
  `hasta` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membresia_comunidad`
--

INSERT INTO `membresia_comunidad` (`id`, `comunidad_id`, `persona_id`, `rol`, `desde`, `hasta`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'propietario', '2024-01-01', NULL, 1, '2025-08-30 20:52:58', '2025-08-30 23:07:00'),
(2, 2, 2, 'admin', '2025-08-30', NULL, 1, '2025-08-30 23:16:39', '2025-08-30 23:16:39');

-- --------------------------------------------------------

--
-- Table structure for table `multa`
--

CREATE TABLE `multa` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) NOT NULL,
  `persona_id` bigint(20) DEFAULT NULL,
  `motivo` varchar(120) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagada','anulada') NOT NULL DEFAULT 'pendiente',
  `fecha` date NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `multa`
--

INSERT INTO `multa` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `descripcion`, `monto`, `estado`, `fecha`, `fecha_pago`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Ruidos molestos', 'Incumplimiento de reglamento interno', 50000.00, 'pendiente', '2025-08-15', NULL, '2025-08-30 20:52:59', '2025-08-30 20:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `notificacion`
--

CREATE TABLE `notificacion` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `persona_id` bigint(20) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` varchar(1000) NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `objeto_tipo` varchar(50) DEFAULT NULL,
  `objeto_id` bigint(20) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pago`
--

CREATE TABLE `pago` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) DEFAULT NULL,
  `persona_id` bigint(20) DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `medio` enum('transferencia','webpay','khipu','servipag','efectivo') NOT NULL,
  `referencia` varchar(120) DEFAULT NULL,
  `estado` enum('pendiente','aplicado','reversado') NOT NULL DEFAULT 'pendiente',
  `comprobante_num` varchar(120) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pago`
--

INSERT INTO `pago` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `fecha`, `monto`, `medio`, `referencia`, `estado`, `comprobante_num`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-08-20', 30000.00, 'transferencia', 'TRX-0001', 'aplicado', NULL, '2025-08-30 20:52:59', '2025-08-30 20:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `pago_aplicacion`
--

CREATE TABLE `pago_aplicacion` (
  `id` bigint(20) NOT NULL,
  `pago_id` bigint(20) NOT NULL,
  `cargo_unidad_id` bigint(20) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `prioridad` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pago_aplicacion`
--

INSERT INTO `pago_aplicacion` (`id`, `pago_id`, `cargo_unidad_id`, `monto`, `prioridad`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 30000.00, 1, '2025-08-30 20:52:59', '2025-08-30 20:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `parametros_cobranza`
--

CREATE TABLE `parametros_cobranza` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `dias_gracia` int(11) NOT NULL DEFAULT 0,
  `tasa_mora_mensual` decimal(5,2) NOT NULL DEFAULT 0.00,
  `mora_calculo` enum('diaria','mensual') NOT NULL DEFAULT 'mensual',
  `redondeo` enum('arriba','normal','abajo') NOT NULL DEFAULT 'normal',
  `interes_max_mensual` decimal(5,2) DEFAULT NULL,
  `aplica_interes_sobre` enum('saldo','capital') NOT NULL DEFAULT 'saldo',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parametros_cobranza`
--

INSERT INTO `parametros_cobranza` (`id`, `comunidad_id`, `dias_gracia`, `tasa_mora_mensual`, `mora_calculo`, `redondeo`, `interes_max_mensual`, `aplica_interes_sobre`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 2.50, 'mensual', 'normal', NULL, 'saldo', '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

CREATE TABLE `persona` (
  `id` bigint(20) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `dv` char(1) NOT NULL,
  `nombres` varchar(120) NOT NULL,
  `apellidos` varchar(120) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`id`, `rut`, `dv`, `nombres`, `apellidos`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, '12345678', '9', 'Juan', 'Pérez', 'juan.perez@example.com', '+56 9 99999999', NULL, '2025-08-30 20:52:58', '2025-08-30 20:52:58'),
(2, '22222222', '2', 'Super', 'Admin', 'admin@example.com', NULL, NULL, '2025-08-30 23:16:39', '2025-08-30 23:16:39');

-- --------------------------------------------------------

--
-- Table structure for table `proveedor`
--

CREATE TABLE `proveedor` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `dv` char(1) NOT NULL,
  `razon_social` varchar(200) NOT NULL,
  `giro` varchar(200) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proveedor`
--

INSERT INTO `proveedor` (`id`, `comunidad_id`, `rut`, `dv`, `razon_social`, `giro`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, 1, '96543210', '1', 'Servicios de Aseo SPA', 'Servicios', NULL, NULL, NULL, '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `reserva_amenidad`
--

CREATE TABLE `reserva_amenidad` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `amenidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) NOT NULL,
  `persona_id` bigint(20) NOT NULL,
  `inicio` datetime NOT NULL,
  `fin` datetime NOT NULL,
  `estado` enum('solicitada','aprobada','rechazada','cancelada','cumplida') NOT NULL DEFAULT 'solicitada',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tarifa_consumo`
--

CREATE TABLE `tarifa_consumo` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `tipo` enum('agua','gas','electricidad') NOT NULL,
  `periodo_desde` char(7) NOT NULL,
  `periodo_hasta` char(7) DEFAULT NULL,
  `precio_por_unidad` decimal(12,6) NOT NULL DEFAULT 0.000000,
  `cargo_fijo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenencia_unidad`
--

CREATE TABLE `tenencia_unidad` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) NOT NULL,
  `persona_id` bigint(20) NOT NULL,
  `tipo` enum('propietario','arrendatario') NOT NULL,
  `desde` date NOT NULL,
  `hasta` date DEFAULT NULL,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT 100.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenencia_unidad`
--

INSERT INTO `tenencia_unidad` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `tipo`, `desde`, `hasta`, `porcentaje`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'propietario', '2024-01-01', NULL, 100.00, '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) DEFAULT NULL,
  `categoria` varchar(120) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `estado` enum('abierto','en_progreso','resuelto','cerrado') NOT NULL DEFAULT 'abierto',
  `prioridad` enum('baja','media','alta') NOT NULL DEFAULT 'media',
  `asignado_a` bigint(20) DEFAULT NULL,
  `attachments_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments_json`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `torre`
--

CREATE TABLE `torre` (
  `id` bigint(20) NOT NULL,
  `edificio_id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `uf_valor`
--

CREATE TABLE `uf_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `unidad`
--

CREATE TABLE `unidad` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `edificio_id` bigint(20) DEFAULT NULL,
  `torre_id` bigint(20) DEFAULT NULL,
  `codigo` varchar(50) NOT NULL,
  `alicuota` decimal(8,6) NOT NULL DEFAULT 0.000000,
  `m2_utiles` decimal(10,2) DEFAULT NULL,
  `m2_terrazas` decimal(10,2) DEFAULT NULL,
  `nro_bodega` varchar(50) DEFAULT NULL,
  `nro_estacionamiento` varchar(50) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `unidad`
--

INSERT INTO `unidad` (`id`, `comunidad_id`, `edificio_id`, `torre_id`, `codigo`, `alicuota`, `m2_utiles`, `m2_terrazas`, `nro_bodega`, `nro_estacionamiento`, `activa`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'A-101', 0.012345, 55.00, 5.00, NULL, NULL, 1, '2025-08-30 20:52:58', '2025-08-30 20:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint(20) NOT NULL,
  `persona_id` bigint(20) DEFAULT NULL,
  `username` varchar(80) NOT NULL,
  `hash_password` varchar(255) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_superadmin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id`, `persona_id`, `username`, `hash_password`, `email`, `activo`, `created_at`, `updated_at`, `is_superadmin`) VALUES
(1, 1, 'tester', '$2a$10$AuaSZeXF1XZVeUXxZMjwrO.FaFOGrL.fnPCdiDS35gHhUgFFRNtl2', 'test@example.com', 1, '2025-08-30 21:43:06', '2025-08-30 23:17:39', 1),
(2, 1, 'tester1', '$2a$10$ePvgugzxAdENuTT6Ht2JoOGP2oc4T3HevJPqVwKxFkgnFY90fnOHO', 'tester1@example.com', 1, '2025-08-30 22:53:20', '2025-08-30 23:17:49', 1),
(3, 1, 'admin.juan', '$2a$10$6kpJOcnLlNeZ0VrRZTEvxOYIj4S9SwjwcU1yobKvasY3DjYHviPBm', 'admin.juan@example.com', 1, '2025-08-30 23:08:57', '2025-08-30 23:17:52', 1);

-- --------------------------------------------------------

--
-- Table structure for table `utm_valor`
--

CREATE TABLE `utm_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `webhook_pago`
--

CREATE TABLE `webhook_pago` (
  `id` bigint(20) NOT NULL,
  `comunidad_id` bigint(20) NOT NULL,
  `proveedor` enum('webpay','khipu','otro') NOT NULL,
  `payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload_json`)),
  `fecha_recepcion` datetime NOT NULL DEFAULT current_timestamp(),
  `procesado` tinyint(1) NOT NULL DEFAULT 0,
  `pago_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenidad`
--
ALTER TABLE `amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_amenidad_comunidad` (`comunidad_id`);

--
-- Indexes for table `bitacora_conserjeria`
--
ALTER TABLE `bitacora_conserjeria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bitacora_comunidad` (`comunidad_id`);

--
-- Indexes for table `cargo_unidad`
--
ALTER TABLE `cargo_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargo_emision` (`emision_id`),
  ADD KEY `fk_cargo_comunidad` (`comunidad_id`),
  ADD KEY `ix_cargo_unidad` (`unidad_id`),
  ADD KEY `ix_cargo_estado` (`estado`);

--
-- Indexes for table `cargo_unidad_detalle`
--
ALTER TABLE `cargo_unidad_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargodet_categoria` (`categoria_id`),
  ADD KEY `ix_cargodet_cargo` (`cargo_unidad_id`);

--
-- Indexes for table `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_catgasto_nombre` (`comunidad_id`,`nombre`);

--
-- Indexes for table `centro_costo`
--
ALTER TABLE `centro_costo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ccosto_codigo` (`comunidad_id`,`codigo`);

--
-- Indexes for table `comunidad`
--
ALTER TABLE `comunidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_comunidad_rut` (`rut`,`dv`);

--
-- Indexes for table `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_conc_comunidad` (`comunidad_id`),
  ADD KEY `fk_conc_pago` (`pago_id`);

--
-- Indexes for table `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_cint_comunidad` (`comunidad_id`);

--
-- Indexes for table `documento`
--
ALTER TABLE `documento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_docrepo_comunidad` (`comunidad_id`);

--
-- Indexes for table `documento_compra`
--
ALTER TABLE `documento_compra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_doc_comunidad` (`comunidad_id`),
  ADD KEY `ix_doc_proveedor` (`proveedor_id`);

--
-- Indexes for table `edificio`
--
ALTER TABLE `edificio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_edificio_comunidad` (`comunidad_id`);

--
-- Indexes for table `emision_gasto_comun`
--
ALTER TABLE `emision_gasto_comun`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_emision_periodo` (`comunidad_id`,`periodo`);

--
-- Indexes for table `emision_gasto_detalle`
--
ALTER TABLE `emision_gasto_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_emidet_gasto` (`gasto_id`),
  ADD KEY `fk_emidet_categoria` (`categoria_id`),
  ADD KEY `ix_emidet_emision` (`emision_id`);

--
-- Indexes for table `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_gasto_comunidad` (`comunidad_id`),
  ADD KEY `fk_gasto_ccosto` (`centro_costo_id`),
  ADD KEY `fk_gasto_doc` (`documento_compra_id`),
  ADD KEY `ix_gasto_categoria` (`categoria_id`);

--
-- Indexes for table `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lectura_periodo` (`medidor_id`,`periodo`),
  ADD KEY `ix_lectura_medidor` (`medidor_id`);

--
-- Indexes for table `medidor`
--
ALTER TABLE `medidor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_medidor_codigo` (`comunidad_id`,`codigo`),
  ADD KEY `fk_medidor_unidad` (`unidad_id`);

--
-- Indexes for table `membresia_comunidad`
--
ALTER TABLE `membresia_comunidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_membresia` (`comunidad_id`,`persona_id`,`rol`,`desde`),
  ADD KEY `ix_memb_comunidad` (`comunidad_id`),
  ADD KEY `ix_memb_persona` (`persona_id`);

--
-- Indexes for table `multa`
--
ALTER TABLE `multa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_multa_comunidad` (`comunidad_id`),
  ADD KEY `fk_multa_unidad` (`unidad_id`),
  ADD KEY `fk_multa_persona` (`persona_id`),
  ADD KEY `ix_multa_estado` (`estado`);

--
-- Indexes for table `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_comunidad` (`comunidad_id`),
  ADD KEY `fk_notif_persona` (`persona_id`);

--
-- Indexes for table `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pago_comunidad` (`comunidad_id`),
  ADD KEY `fk_pago_unidad` (`unidad_id`),
  ADD KEY `fk_pago_persona` (`persona_id`),
  ADD KEY `ix_pago_fecha` (`fecha`);

--
-- Indexes for table `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_papp` (`pago_id`,`cargo_unidad_id`),
  ADD KEY `fk_papp_cargo` (`cargo_unidad_id`),
  ADD KEY `ix_papp_pago` (`pago_id`);

--
-- Indexes for table `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `comunidad_id` (`comunidad_id`);

--
-- Indexes for table `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_persona_rut` (`rut`,`dv`);

--
-- Indexes for table `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_proveedor_rut` (`comunidad_id`,`rut`,`dv`);

--
-- Indexes for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resa_comunidad` (`comunidad_id`),
  ADD KEY `fk_resa_amenidad` (`amenidad_id`),
  ADD KEY `fk_resa_unidad` (`unidad_id`),
  ADD KEY `fk_resa_persona` (`persona_id`);

--
-- Indexes for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_tarifa_comunidad` (`comunidad_id`);

--
-- Indexes for table `tenencia_unidad`
--
ALTER TABLE `tenencia_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tenencia_comunidad` (`comunidad_id`),
  ADD KEY `ix_tenencia_unidad` (`unidad_id`),
  ADD KEY `ix_tenencia_persona` (`persona_id`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_comunidad` (`comunidad_id`),
  ADD KEY `fk_ticket_unidad` (`unidad_id`);

--
-- Indexes for table `torre`
--
ALTER TABLE `torre`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_torre_edificio` (`edificio_id`);

--
-- Indexes for table `uf_valor`
--
ALTER TABLE `uf_valor`
  ADD PRIMARY KEY (`fecha`);

--
-- Indexes for table `unidad`
--
ALTER TABLE `unidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_unidad_codigo` (`comunidad_id`,`codigo`),
  ADD KEY `ix_unidad_comunidad` (`comunidad_id`),
  ADD KEY `ix_unidad_edificio` (`edificio_id`),
  ADD KEY `ix_unidad_torre` (`torre_id`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_username` (`username`),
  ADD KEY `fk_usuario_persona` (`persona_id`);

--
-- Indexes for table `utm_valor`
--
ALTER TABLE `utm_valor`
  ADD PRIMARY KEY (`fecha`);

--
-- Indexes for table `webhook_pago`
--
ALTER TABLE `webhook_pago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wh_comunidad` (`comunidad_id`),
  ADD KEY `fk_wh_pago` (`pago_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `amenidad`
--
ALTER TABLE `amenidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bitacora_conserjeria`
--
ALTER TABLE `bitacora_conserjeria`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cargo_unidad`
--
ALTER TABLE `cargo_unidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cargo_unidad_detalle`
--
ALTER TABLE `cargo_unidad_detalle`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `centro_costo`
--
ALTER TABLE `centro_costo`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comunidad`
--
ALTER TABLE `comunidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documento`
--
ALTER TABLE `documento`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documento_compra`
--
ALTER TABLE `documento_compra`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `edificio`
--
ALTER TABLE `edificio`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `emision_gasto_comun`
--
ALTER TABLE `emision_gasto_comun`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `emision_gasto_detalle`
--
ALTER TABLE `emision_gasto_detalle`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `gasto`
--
ALTER TABLE `gasto`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medidor`
--
ALTER TABLE `medidor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `membresia_comunidad`
--
ALTER TABLE `membresia_comunidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `multa`
--
ALTER TABLE `multa`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pago`
--
ALTER TABLE `pago`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `persona`
--
ALTER TABLE `persona`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenencia_unidad`
--
ALTER TABLE `tenencia_unidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `torre`
--
ALTER TABLE `torre`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `unidad`
--
ALTER TABLE `unidad`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `webhook_pago`
--
ALTER TABLE `webhook_pago`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `amenidad`
--
ALTER TABLE `amenidad`
  ADD CONSTRAINT `fk_amenidad_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `bitacora_conserjeria`
--
ALTER TABLE `bitacora_conserjeria`
  ADD CONSTRAINT `fk_bitacora_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `cargo_unidad`
--
ALTER TABLE `cargo_unidad`
  ADD CONSTRAINT `fk_cargo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_cargo_emision` FOREIGN KEY (`emision_id`) REFERENCES `emision_gasto_comun` (`id`),
  ADD CONSTRAINT `fk_cargo_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `cargo_unidad_detalle`
--
ALTER TABLE `cargo_unidad_detalle`
  ADD CONSTRAINT `fk_cargodet_cargo` FOREIGN KEY (`cargo_unidad_id`) REFERENCES `cargo_unidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cargodet_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`);

--
-- Constraints for table `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD CONSTRAINT `fk_catgasto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `centro_costo`
--
ALTER TABLE `centro_costo`
  ADD CONSTRAINT `fk_ccosto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  ADD CONSTRAINT `fk_conc_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_conc_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  ADD CONSTRAINT `fk_cint_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `documento`
--
ALTER TABLE `documento`
  ADD CONSTRAINT `fk_docrepo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `documento_compra`
--
ALTER TABLE `documento_compra`
  ADD CONSTRAINT `fk_doc_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_doc_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`);

--
-- Constraints for table `edificio`
--
ALTER TABLE `edificio`
  ADD CONSTRAINT `fk_edificio_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `emision_gasto_comun`
--
ALTER TABLE `emision_gasto_comun`
  ADD CONSTRAINT `fk_emision_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `emision_gasto_detalle`
--
ALTER TABLE `emision_gasto_detalle`
  ADD CONSTRAINT `fk_emidet_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`),
  ADD CONSTRAINT `fk_emidet_emision` FOREIGN KEY (`emision_id`) REFERENCES `emision_gasto_comun` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_emidet_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `gasto`
--
ALTER TABLE `gasto`
  ADD CONSTRAINT `fk_gasto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`),
  ADD CONSTRAINT `fk_gasto_ccosto` FOREIGN KEY (`centro_costo_id`) REFERENCES `centro_costo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_gasto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_gasto_doc` FOREIGN KEY (`documento_compra_id`) REFERENCES `documento_compra` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  ADD CONSTRAINT `fk_lectura_medidor` FOREIGN KEY (`medidor_id`) REFERENCES `medidor` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medidor`
--
ALTER TABLE `medidor`
  ADD CONSTRAINT `fk_medidor_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_medidor_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `membresia_comunidad`
--
ALTER TABLE `membresia_comunidad`
  ADD CONSTRAINT `fk_memb_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_memb_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`);

--
-- Constraints for table `multa`
--
ALTER TABLE `multa`
  ADD CONSTRAINT `fk_multa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_multa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_multa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `fk_notif_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_notif_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `fk_pago_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_pago_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pago_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  ADD CONSTRAINT `fk_papp_cargo` FOREIGN KEY (`cargo_unidad_id`) REFERENCES `cargo_unidad` (`id`),
  ADD CONSTRAINT `fk_papp_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  ADD CONSTRAINT `fk_paramcobr_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `proveedor`
--
ALTER TABLE `proveedor`
  ADD CONSTRAINT `fk_prov_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  ADD CONSTRAINT `fk_resa_amenidad` FOREIGN KEY (`amenidad_id`) REFERENCES `amenidad` (`id`),
  ADD CONSTRAINT `fk_resa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_resa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_resa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  ADD CONSTRAINT `fk_tarifa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `tenencia_unidad`
--
ALTER TABLE `tenencia_unidad`
  ADD CONSTRAINT `fk_tenencia_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_tenencia_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_tenencia_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `fk_ticket_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_ticket_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `torre`
--
ALTER TABLE `torre`
  ADD CONSTRAINT `fk_torre_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id`);

--
-- Constraints for table `unidad`
--
ALTER TABLE `unidad`
  ADD CONSTRAINT `fk_unidad_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_unidad_edificio` FOREIGN KEY (`edificio_id`) REFERENCES `edificio` (`id`),
  ADD CONSTRAINT `fk_unidad_torre` FOREIGN KEY (`torre_id`) REFERENCES `torre` (`id`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `webhook_pago`
--
ALTER TABLE `webhook_pago`
  ADD CONSTRAINT `fk_wh_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_wh_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
