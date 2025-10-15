-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Sep 22, 2025 at 02:41 PM
-- Server version: 8.0.43
-- PHP Version: 8.2.29

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
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `reglas` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `capacidad` int DEFAULT NULL,
  `requiere_aprobacion` tinyint(1) NOT NULL DEFAULT '0',
  `tarifa` decimal(12,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `amenidad`
--

INSERT INTO `amenidad` (`id`, `comunidad_id`, `nombre`, `reglas`, `capacidad`, `requiere_aprobacion`, `tarifa`, `created_at`, `updated_at`) VALUES
(1, 1, 'Salón de Eventos', 'Reserva con 7 días de anticipación. Horario: 09:00 - 23:00. Prohibido fumar.', 50, 1, 35000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(2, 1, 'Piscina', 'Horario: 07:00 - 22:00. Niños menores de 12 años con adulto responsable.', 25, 0, 0.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(3, 2, 'Sala de Reuniones', 'Reserva con 3 días de anticipación. Máximo 4 horas por reserva.', 12, 1, 25000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(4, 3, 'Quincho', 'Reserva con 5 días de anticipación. Incluye parrilla y mesas.', 30, 1, 20000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(5, 3, 'Cancha de Tenis', 'Horario: 08:00 - 20:00. Máximo 2 horas por reserva.', 4, 0, 8000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(6, 4, 'Multicancha', 'Horario: 09:00 - 21:00. Reserva máximo con 2 días de anticipación.', 10, 0, 5000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(7, 5, 'Salón Multiuso', 'Reserva con 10 días de anticipación. Incluye equipo de audio.', 40, 1, 30000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(8, 6, 'Gimnasio', 'Horario: 06:00 - 23:00. Uso de implementos propios obligatorio.', 15, 0, 0.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(9, 7, 'Terraza BBQ', 'Horario: 12:00 - 20:00. Traer carbón propio. Limpiar después del uso.', 20, 1, 15000.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30'),
(10, 8, 'Playground', 'Uso libre. Niños bajo supervisión de adultos.', 20, 0, 0.00, '2025-09-18 22:39:30', '2025-09-18 22:39:30');

-- --------------------------------------------------------

--
-- Table structure for table `bitacora_conserjeria`
--

CREATE TABLE `bitacora_conserjeria` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `evento` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `detalle` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bitacora_conserjeria`
--

INSERT INTO `bitacora_conserjeria` (`id`, `comunidad_id`, `fecha_hora`, `usuario_id`, `evento`, `detalle`, `created_at`) VALUES
(1, 1, '2025-09-18 08:30:00', NULL, 'Ingreso de proveedor', 'Empresa de mantención - Revisión ascensor Torre Norte', '2025-09-18 22:54:05'),
(2, 1, '2025-09-18 14:15:00', NULL, 'Entrega de encomienda', 'Paquete para depto TN-102 - Firmado por residente', '2025-09-18 22:54:05'),
(3, 2, '2025-09-18 09:45:00', NULL, 'Visita autorizada', 'Familiar de residente TP-1001 - Autorizado hasta 18:00', '2025-09-18 22:54:05'),
(4, 2, '2025-09-18 16:20:00', NULL, 'Incidente menor', 'Derrame de agua en hall - Limpiado inmediatamente', '2025-09-18 22:54:05'),
(5, 3, '2025-09-18 07:00:00', NULL, 'Ronda de seguridad', 'Revisión perímetro y áreas comunes - Sin novedad', '2025-09-18 22:54:05'),
(6, 3, '2025-09-18 11:30:00', NULL, 'Mantención jardines', 'Poda de árboles y riego automático - Finalizado', '2025-09-18 22:54:05'),
(7, 4, '2025-09-18 13:00:00', NULL, 'Ingreso de técnico', 'Revisión sistema eléctrico - Depto EP-101', '2025-09-18 22:54:05'),
(8, 5, '2025-09-18 10:15:00', NULL, 'Actividad en amenidades', 'Reserva salón para evento familiar - 15:00 a 22:00', '2025-09-18 22:54:05'),
(9, 6, '2025-09-18 15:45:00', NULL, 'Entrega de correspondencia', 'Facturas de servicios entregadas a administración', '2025-09-18 22:54:05'),
(10, 7, '2025-09-18 12:30:00', NULL, 'Inspección de seguridad', 'Revisión sistemas contraincendios - Todo operativo', '2025-09-18 22:54:05');

-- --------------------------------------------------------

--
-- Table structure for table `cargo_unidad`
--

CREATE TABLE `cargo_unidad` (
  `id` bigint NOT NULL,
  `emision_id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `monto_total` decimal(12,2) NOT NULL,
  `saldo` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagado','vencido','parcial') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendiente',
  `interes_acumulado` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cargo_unidad`
--

INSERT INTO `cargo_unidad` (`id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total`, `saldo`, `estado`, `interes_acumulado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 47012.50, 47012.50, 'pendiente', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(2, 1, 1, 2, 47012.50, 35259.38, 'parcial', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(3, 1, 1, 3, 47012.50, 0.00, 'pagado', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(4, 2, 2, 4, 17608.00, 17608.00, 'pendiente', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(5, 2, 2, 5, 17608.00, 0.00, 'pagado', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(6, 3, 3, 6, 13492.60, 13492.60, 'pendiente', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(7, 3, 3, 7, 14992.33, 7496.17, 'parcial', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(8, 4, 4, 8, 98175.00, 98175.00, 'pendiente', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(9, 5, 5, 9, 46032.00, 23016.00, 'parcial', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26'),
(10, 6, 6, 10, 38556.50, 0.00, 'pagado', 0.00, '2025-09-18 22:53:26', '2025-09-18 22:53:26');

-- --------------------------------------------------------

--
-- Table structure for table `cargo_unidad_detalle`
--

CREATE TABLE `cargo_unidad_detalle` (
  `id` bigint NOT NULL,
  `cargo_unidad_id` bigint NOT NULL,
  `categoria_id` bigint NOT NULL,
  `glosa` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `origen` enum('gasto','multa','consumo','ajuste') COLLATE utf8mb4_general_ci NOT NULL,
  `origen_id` bigint DEFAULT NULL,
  `iva_incluido` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cargo_unidad_detalle`
--

INSERT INTO `cargo_unidad_detalle` (`id`, `cargo_unidad_id`, `categoria_id`, `glosa`, `monto`, `origen`, `origen_id`, `iva_incluido`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Consumo eléctrico áreas comunes - Septiembre', 12500.50, 'gasto', 1, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(2, 1, 2, 'Servicio de aseo mensual - Septiembre', 15750.25, 'gasto', 2, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(3, 2, 1, 'Gastos básicos prorrateados', 18762.13, 'gasto', 1, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(4, 3, 3, 'Mantención ascensores - Cuota mensual', 22450.00, 'gasto', 3, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(5, 4, 4, 'Prima seguro incendio - Cuota', 8500.75, 'gasto', 4, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(6, 5, 5, 'Mantención jardines - Septiembre', 9057.25, 'gasto', 5, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(7, 1, 1, 'Multa por ruidos molestos', 50000.00, 'multa', 1, 0, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(8, 6, 6, 'Ajuste por diferencia período anterior', -2500.00, 'ajuste', NULL, 0, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(9, 7, 7, 'Consumo de gas común - Septiembre', 5680.30, 'consumo', NULL, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(10, 8, 8, 'Servicio de seguridad - Cuota mensual', 28350.00, 'gasto', 8, 1, '2025-09-18 23:13:31', '2025-09-18 23:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `categoria_gasto`
--

CREATE TABLE `categoria_gasto` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo` enum('operacional','extraordinario','fondo_reserva','multas','consumo') COLLATE utf8mb4_general_ci NOT NULL,
  `cta_contable` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categoria_gasto`
--

INSERT INTO `categoria_gasto` (`id`, `comunidad_id`, `nombre`, `tipo`, `cta_contable`, `activa`, `created_at`, `updated_at`) VALUES
(1, 1, 'Servicios Básicos', 'operacional', '511001', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(2, 1, 'Limpieza y Aseo', 'operacional', '511002', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(3, 2, 'Mantención Edificios', 'operacional', '511003', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(4, 2, 'Seguros Generales', 'operacional', '512001', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(5, 3, 'Jardinería', 'operacional', '511004', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(6, 4, 'Servicios Eléctricos', 'operacional', '511005', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(7, 5, 'Sistemas de Gas', 'operacional', '511006', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(8, 6, 'Seguridad', 'operacional', '511007', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(9, 7, 'Administración', 'operacional', '512002', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02'),
(10, 8, 'Reparaciones Generales', 'operacional', '511008', 1, '2025-09-18 23:02:02', '2025-09-18 23:02:02');

-- --------------------------------------------------------

--
-- Table structure for table `centro_costo`
--

CREATE TABLE `centro_costo` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `centro_costo`
--

INSERT INTO `centro_costo` (`id`, `comunidad_id`, `nombre`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Administración General', 'ADM001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(2, 1, 'Mantención Edificios', 'MAN001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(3, 2, 'Servicios Básicos', 'SER001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(4, 2, 'Seguridad y Vigilancia', 'SEG001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(5, 3, 'Áreas Verdes', 'VER001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(6, 3, 'Amenidades', 'AME001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(7, 4, 'Limpieza General', 'LIM001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(8, 5, 'Reparaciones Mayores', 'REP001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(9, 6, 'Gastos Extraordinarios', 'EXT001', '2025-09-18 23:00:42', '2025-09-18 23:00:42'),
(10, 7, 'Servicios Comunes', 'COM001', '2025-09-18 23:00:42', '2025-09-18 23:00:42');

-- --------------------------------------------------------

--
-- Table structure for table `comunidad`
--

CREATE TABLE `comunidad` (
  `id` bigint NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `dv` char(1) COLLATE utf8mb4_general_ci NOT NULL,
  `giro` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email_contacto` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono_contacto` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `politica_mora_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `moneda` varchar(10) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'CLP',
  `tz` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'America/Santiago',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL
) ;

--
-- Dumping data for table `comunidad`
--

INSERT INTO `comunidad` (`id`, `razon_social`, `rut`, `dv`, `giro`, `direccion`, `email_contacto`, `telefono_contacto`, `politica_mora_json`, `moneda`, `tz`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'Condominio Los Robles', '78956423', '7', 'Administración de Condominios', 'Av. Las Condes 5678, Las Condes, Santiago', 'administracion@losrobles.cl', '+56 2 29876543', '{\"interes_diario\": 0.05, \"dias_gracia\": 10, \"recargo_fijo\": 5000}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(2, 'Edificio Torre Central', '79654128', '3', 'Administración de Condominios', 'Av. Apoquindo 1890, Las Condes, Santiago', 'contacto@torrecentral.cl', '+56 2 28765432', '{\"interes_diario\": 0.03, \"dias_gracia\": 15, \"recargo_fijo\": 8000}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(3, 'Comunidad Parque Verde', '80123456', 'K', 'Administración de Condominios', 'Av. Vitacura 2340, Vitacura, Santiago', 'info@parqueverde.cl', '+56 2 27654321', '{\"interes_diario\": 0.04, \"dias_gracia\": 5, \"recargo_fijo\": 3000}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(4, 'Residencial San Antonio', '81987654', '2', 'Administración de Condominios', 'Av. Ñuñoa 876, Ñuñoa, Santiago', 'administracion@sanantonio.cl', '+56 2 26543210', '{\"interes_diario\": 0.06, \"dias_gracia\": 7, \"recargo_fijo\": 4500}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(5, 'Condominio Vista Hermosa', '82345678', '9', 'Administración de Condominios', 'Av. Maipú 3456, Maipú, Santiago', 'contacto@vistahermosa.cl', '+56 2 25432109', '{\"interes_diario\": 0.045, \"dias_gracia\": 12, \"recargo_fijo\": 6000}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(6, 'Torres del Sol', '83456789', '0', 'Administración de Condominios', 'Av. Providencia 2890, Providencia, Santiago', 'gerencia@torresdelsol.cl', '+56 2 24321098', '{\"interes_diario\": 0.055, \"dias_gracia\": 8, \"recargo_fijo\": 7500}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(7, 'Edificio Costanera', '84567890', '1', 'Administración de Condominios', 'Av. Costanera Norte 1567, Las Condes, Santiago', 'admin@costanera.cl', '+56 2 23210987', '{\"interes_diario\": 0.035, \"dias_gracia\": 20, \"recargo_fijo\": 9000}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(8, 'Condominio Lago Azul', '85678901', '2', 'Administración de Condominios', 'Av. Américo Vespucio 4567, La Florida, Santiago', 'contacto@lagoazul.cl', '+56 2 22109876', '{\"interes_diario\": 0.065, \"dias_gracia\": 6, \"recargo_fijo\": 3500}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(9, 'Residencial Cordillera', '86789012', '3', 'Administración de Condominios', 'Av. Manquehue Norte 890, Las Condes, Santiago', 'info@cordillera.cl', '+56 2 21098765', '{\"interes_diario\": 0.04, \"dias_gracia\": 14, \"recargo_fijo\": 5500}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL),
(10, 'Torres Mirador', '87890123', '4', 'Administración de Condominios', 'Av. Nueva Costanera 3456, Vitacura, Santiago', 'administracion@mirador.cl', '+56 2 20987654', '{\"interes_diario\": 0.05, \"dias_gracia\": 11, \"recargo_fijo\": 6500}', 'CLP', 'America/Santiago', '2025-09-18 22:27:51', '2025-09-18 22:27:51', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `conciliacion_bancaria`
--

CREATE TABLE `conciliacion_bancaria` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `fecha_mov` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `glosa` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `referencia` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('pendiente','conciliado','descartado') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendiente',
  `pago_id` bigint DEFAULT NULL,
  `extracto_id` bigint DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conciliacion_bancaria`
--

INSERT INTO `conciliacion_bancaria` (`id`, `comunidad_id`, `fecha_mov`, `monto`, `glosa`, `referencia`, `estado`, `pago_id`, `extracto_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-09-15', 47012.50, 'Transferencia recibida - Pago gastos comunes', 'TRF123456789', 'conciliado', 1, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(2, 1, '2025-09-10', 35259.38, 'Transferencia recibida - Pago parcial', 'TRF987654321', 'conciliado', 2, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(3, 2, '2025-09-08', 17608.00, 'Pago Webpay recibido', 'WP555666777', 'conciliado', 3, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(4, 3, '2025-09-14', 13492.60, 'Pago Servipag recibido', 'SP123456', 'conciliado', 4, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(5, 4, '2025-09-05', 98175.00, 'Transferencia recibida', 'TRF111222333', 'conciliado', 6, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(6, 5, '2025-09-11', 23016.00, 'Pago Khipu recibido', 'KH444555666', 'conciliado', 7, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(7, 1, '2025-09-17', 15000.00, 'Transferencia no identificada', 'TRF999888777', 'pendiente', NULL, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(8, 2, '2025-09-16', 25000.00, 'Deposito sin identificar origen', 'DEP123456', 'pendiente', NULL, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(9, 3, '2025-09-13', 5000.00, 'Movimiento bancario error', 'ERR789012', 'descartado', NULL, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(10, 6, '2025-09-16', 38556.50, 'Transferencia Webpay recibida', 'WP777888999', 'conciliado', 8, NULL, '2025-09-18 23:13:31', '2025-09-18 23:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_interes`
--

CREATE TABLE `configuracion_interes` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `aplica_desde` date NOT NULL,
  `tasa_mensual` decimal(5,2) NOT NULL,
  `metodo` enum('simple','compuesto') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'simple',
  `tope_mensual` decimal(5,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `configuracion_interes`
--

INSERT INTO `configuracion_interes` (`id`, `comunidad_id`, `aplica_desde`, `tasa_mensual`, `metodo`, `tope_mensual`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-01-01', 1.50, 'simple', 5.00, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(2, 2, '2025-01-01', 1.20, 'simple', 4.50, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(3, 3, '2025-01-01', 1.80, 'compuesto', 6.00, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(4, 4, '2025-01-01', 2.00, 'simple', 7.00, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(5, 5, '2025-01-01', 1.60, 'simple', 5.50, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(6, 6, '2025-03-01', 1.75, 'compuesto', 6.50, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(7, 7, '2025-01-01', 1.40, 'simple', 4.00, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(8, 8, '2025-02-01', 2.20, 'simple', 8.00, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(9, 9, '2025-01-01', 1.90, 'compuesto', 7.50, '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(10, 10, '2025-04-01', 1.65, 'simple', 5.25, '2025-09-18 23:13:31', '2025-09-18 23:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `documento`
--

CREATE TABLE `documento` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `tipo` enum('circular','acta','reglamento','boletin','otro') COLLATE utf8mb4_general_ci NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `periodo` char(7) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `visibilidad` enum('publico','privado') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'privado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documento`
--

INSERT INTO `documento` (`id`, `comunidad_id`, `tipo`, `titulo`, `url`, `periodo`, `visibilidad`, `created_at`, `updated_at`) VALUES
(1, 1, 'circular', 'Circular Informativa Septiembre 2025', '/documentos/circular_sep_2025.pdf', '2025-09', 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(2, 1, 'acta', 'Acta Reunión Ordinaria Agosto 2025', '/documentos/acta_ago_2025.pdf', '2025-08', 'privado', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(3, 2, 'reglamento', 'Reglamento de Convivencia Actualizado', '/documentos/reglamento_convivencia.pdf', NULL, 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(4, 3, 'boletin', 'Boletín Informativo Julio 2025', '/documentos/boletin_jul_2025.pdf', '2025-07', 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(5, 4, 'circular', 'Circular Mantención Ascensores', '/documentos/circular_ascensores.pdf', '2025-09', 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(6, 5, 'acta', 'Acta Reunión Extraordinaria Presupuesto', '/documentos/acta_presupuesto.pdf', '2025-09', 'privado', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(7, 6, 'otro', 'Manual de Uso Amenidades', '/documentos/manual_amenidades.pdf', NULL, 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(8, 7, 'reglamento', 'Reglamento Interno Estacionamientos', '/documentos/reglamento_estacionamientos.pdf', NULL, 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(9, 8, 'boletin', 'Boletín Mensual Agosto 2025', '/documentos/boletin_ago_2025.pdf', '2025-08', 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(10, 9, 'circular', 'Circular Cambio Horarios Gimnasio', '/documentos/circular_gimnasio.pdf', '2025-09', 'publico', '2025-09-18 23:13:31', '2025-09-18 23:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `documento_compra`
--

CREATE TABLE `documento_compra` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `proveedor_id` bigint NOT NULL,
  `tipo_doc` enum('factura','boleta','nota_credito') COLLATE utf8mb4_general_ci NOT NULL,
  `folio` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_emision` date NOT NULL,
  `neto` decimal(12,2) NOT NULL DEFAULT '0.00',
  `iva` decimal(12,2) NOT NULL DEFAULT '0.00',
  `exento` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `glosa` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documento_compra`
--

INSERT INTO `documento_compra` (`id`, `comunidad_id`, `proveedor_id`, `tipo_doc`, `folio`, `fecha_emision`, `neto`, `iva`, `exento`, `total`, `glosa`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'factura', 'F001-12345', '2025-09-01', 420000.00, 79800.00, 0.00, 499800.00, 'Servicio de aseo mensual septiembre', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(2, 1, 2, 'factura', 'F002-67890', '2025-09-05', 350000.00, 66500.00, 0.00, 416500.00, 'Mantención ascensores y sistemas', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(3, 2, 3, 'factura', 'F003-11111', '2025-09-02', 487395.00, 92605.00, 0.00, 580000.00, 'Servicio de seguridad 24/7 mensual', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(4, 2, 3, 'boleta', 'B004-22222', '2025-09-03', 333200.00, 0.00, 0.00, 333200.00, 'Prima seguro incendio anual', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(5, 3, 4, 'factura', 'F005-33333', '2025-09-02', 235294.00, 44706.00, 0.00, 280000.00, 'Mantención jardines y áreas verdes', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(6, 4, 5, 'factura', 'F006-44444', '2025-09-01', 320000.00, 60800.00, 0.00, 380800.00, 'Mantención sistema eléctrico general', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(7, 5, 6, 'factura', 'F007-55555', '2025-09-01', 180000.00, 34200.00, 0.00, 214200.00, 'Mantención sistema de gas común', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(8, 6, 7, 'factura', 'F008-66666', '2025-09-04', 714285.00, 135715.00, 0.00, 850000.00, 'Reparaciones generales edificio', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(9, 7, 8, 'boleta', 'B009-77777', '2025-09-03', 297500.00, 0.00, 0.00, 297500.00, 'Servicios administrativos', '2025-09-18 23:13:31', '2025-09-18 23:13:31'),
(10, 8, 9, 'nota_credito', 'NC10-88888', '2025-09-05', 150000.00, 28500.00, 0.00, 178500.00, 'Nota de crédito por devolución servicio', '2025-09-18 23:13:31', '2025-09-18 23:13:31');

-- --------------------------------------------------------

--
-- Table structure for table `edificio`
--

CREATE TABLE `edificio` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edificio`
--

INSERT INTO `edificio` (`id`, `comunidad_id`, `nombre`, `direccion`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Torre Norte', 'Av. Las Condes 5678, Las Condes', 'TN', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(2, 1, 'Torre Sur', 'Av. Las Condes 5678, Las Condes', 'TS', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(3, 2, 'Torre Principal', 'Av. Apoquindo 1890, Las Condes', 'TP', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(4, 3, 'Bloque A', 'Av. Vitacura 2340, Vitacura', 'BA', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(5, 3, 'Bloque B', 'Av. Vitacura 2340, Vitacura', 'BB', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(6, 4, 'Edificio Principal', 'Av. Ñuñoa 876, Ñuñoa', 'EP', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(7, 5, 'Edificio Residencial', 'Av. Maipú 3456, Maipú', 'ER', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(8, 6, 'Torre Oriente', 'Av. Providencia 2890, Providencia', 'TO', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(9, 7, 'Torre Única', 'Av. Costanera Norte 1567, Las Condes', 'TU', '2025-09-18 22:27:51', '2025-09-18 22:27:51'),
(10, 8, 'Edificio Central', 'Av. Américo Vespucio 4567, La Florida', 'EC', '2025-09-18 22:27:51', '2025-09-18 22:27:51');

-- --------------------------------------------------------

--
-- Table structure for table `emision_gasto_comun`
--

CREATE TABLE `emision_gasto_comun` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `periodo` char(7) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('borrador','emitido','cerrado','anulado') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'borrador',
  `observaciones` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emision_gasto_comun`
--

INSERT INTO `emision_gasto_comun` (`id`, `comunidad_id`, `periodo`, `fecha_vencimiento`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-09', '2025-09-25', 'emitido', 'Gastos Comunes Septiembre 2025 - Los Robles', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(2, 2, '2025-09', '2025-09-30', 'emitido', 'Gastos Comunes Septiembre 2025 - Torre Central', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(3, 3, '2025-09', '2025-09-20', 'emitido', 'Gastos Comunes Septiembre 2025 - Parque Verde', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(4, 4, '2025-09', '2025-09-25', 'emitido', 'Gastos Comunes Septiembre 2025 - San Antonio', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(5, 5, '2025-09', '2025-09-28', 'emitido', 'Gastos Comunes Septiembre 2025 - Vista Hermosa', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(6, 6, '2025-09', '2025-09-22', 'emitido', 'Gastos Comunes Septiembre 2025 - Torres del Sol', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(7, 7, '2025-09', '2025-09-26', 'emitido', 'Gastos Comunes Septiembre 2025 - Costanera', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(8, 8, '2025-09', '2025-09-24', 'emitido', 'Gastos Comunes Septiembre 2025 - Lago Azul', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(9, 9, '2025-09', '2025-09-27', 'emitido', 'Gastos Comunes Septiembre 2025 - Cordillera', '2025-09-18 22:52:07', '2025-09-18 22:52:07'),
(10, 10, '2025-09', '2025-09-29', 'emitido', 'Gastos Comunes Septiembre 2025 - Mirador', '2025-09-18 22:52:07', '2025-09-18 22:52:07');

-- --------------------------------------------------------

--
-- Table structure for table `emision_gasto_detalle`
--

CREATE TABLE `emision_gasto_detalle` (
  `id` bigint NOT NULL,
  `emision_id` bigint NOT NULL,
  `gasto_id` bigint DEFAULT NULL,
  `categoria_id` bigint NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `regla_prorrateo` enum('coeficiente','partes_iguales','consumo','fijo_por_unidad') COLLATE utf8mb4_general_ci NOT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `emision_gasto_detalle`
--

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
(10, 1, NULL, 1, 45000.00, 'consumo', '{\"base\": \"consumo_agua\", \"tarifa\": 850.0, \"metros_cubicos\": 52.94}', '2025-09-18 23:17:03', '2025-09-18 23:17:03');

-- --------------------------------------------------------

--
-- Table structure for table `gasto`
--

CREATE TABLE `gasto` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `categoria_id` bigint NOT NULL,
  `centro_costo_id` bigint DEFAULT NULL,
  `documento_compra_id` bigint DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `glosa` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `extraordinario` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gasto`
--

INSERT INTO `gasto` (`id`, `comunidad_id`, `categoria_id`, `centro_costo_id`, `documento_compra_id`, `fecha`, `monto`, `glosa`, `extraordinario`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL, '2025-09-01', 499800.00, 'Consumo eléctrico áreas comunes', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(2, 1, 2, NULL, NULL, '2025-09-05', 416500.00, 'Servicio de aseo mensual septiembre', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(3, 2, 3, NULL, NULL, '2025-09-02', 580000.00, 'Mantención ascensores y sistemas', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(4, 2, 4, NULL, NULL, '2025-09-03', 333200.00, 'Prima seguro incendio anual', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(5, 3, 5, NULL, NULL, '2025-09-02', 280000.00, 'Mantención jardines y áreas verdes', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(6, 4, 6, NULL, NULL, '2025-09-01', 380800.00, 'Mantención sistema eléctrico general', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(7, 5, 7, NULL, NULL, '2025-09-01', 214200.00, 'Mantención sistema de gas común', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(8, 6, 8, NULL, NULL, '2025-09-04', 850000.00, 'Servicio de seguridad 24/7 mensual', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(9, 7, 9, NULL, NULL, '2025-09-03', 297500.00, 'Honorarios administración septiembre', 0, '2025-09-18 23:02:48', '2025-09-18 23:02:48'),
(10, 8, 10, NULL, NULL, '2025-09-05', 1200000.00, 'Reparación estructura edificio', 1, '2025-09-18 23:02:48', '2025-09-18 23:02:48');

-- --------------------------------------------------------

--
-- Table structure for table `lectura_medidor`
--

CREATE TABLE `lectura_medidor` (
  `id` bigint NOT NULL,
  `medidor_id` bigint NOT NULL,
  `fecha` date NOT NULL,
  `lectura` decimal(12,3) NOT NULL,
  `periodo` char(7) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lectura_medidor`
--

INSERT INTO `lectura_medidor` (`id`, `medidor_id`, `fecha`, `lectura`, `periodo`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-09-01', 1245.500, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(2, 1, '2025-08-01', 1223.200, '2025-08', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(3, 2, '2025-09-01', 987.300, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(4, 2, '2025-08-01', 958.800, '2025-08', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(5, 3, '2025-09-01', 1534.800, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(6, 4, '2025-09-01', 567.450, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(7, 5, '2025-09-01', 432.100, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(8, 6, '2025-09-01', 789.600, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(9, 7, '2025-09-01', 654.200, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(10, 8, '2025-09-01', 2456.750, '2025-09', '2025-09-18 23:17:03', '2025-09-18 23:17:03');

-- --------------------------------------------------------

--
-- Table structure for table `medidor`
--

CREATE TABLE `medidor` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `tipo` enum('agua','gas','electricidad') COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `es_compartido` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medidor`
--

INSERT INTO `medidor` (`id`, `comunidad_id`, `unidad_id`, `tipo`, `codigo`, `es_compartido`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'agua', 'AGU-001-2023', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(2, 1, 2, 'agua', 'AGU-002-2023', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(3, 1, 3, 'agua', 'AGU-003-2023', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(4, 2, 4, 'gas', 'GAS-001-2024', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(5, 2, 5, 'gas', 'GAS-002-2024', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(6, 3, 6, 'agua', 'AGU-101-2024', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(7, 3, 7, 'agua', 'AGU-102-2024', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(8, 4, 8, 'electricidad', 'ELE-001-2023', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(9, 5, 9, 'gas', 'GAS-201-2024', 0, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(10, 1, NULL, 'agua', 'AGU-COMP-001', 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03');

-- --------------------------------------------------------

--
-- Table structure for table `membresia_comunidad`
--

CREATE TABLE `membresia_comunidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `persona_id` bigint NOT NULL,
  `rol` enum('admin','comite','conserje','contador','residente','propietario') COLLATE utf8mb4_general_ci NOT NULL,
  `desde` date NOT NULL,
  `hasta` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membresia_comunidad`
--

INSERT INTO `membresia_comunidad` (`id`, `comunidad_id`, `persona_id`, `rol`, `desde`, `hasta`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'propietario', '2023-01-15', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(2, 1, 2, 'propietario', '2022-08-20', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(3, 2, 3, 'propietario', '2024-03-10', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(4, 3, 4, 'propietario', '2023-11-05', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(5, 3, 5, 'propietario', '2024-01-20', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(6, 1, 1, 'comite', '2025-01-01', '2025-12-31', 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(7, 2, 3, 'admin', '2024-01-01', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(8, 4, 6, 'propietario', '2023-07-12', NULL, 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(9, 5, 7, 'residente', '2025-06-01', '2026-05-31', 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03'),
(10, 6, 8, 'contador', '2025-01-01', '2025-12-31', 1, '2025-09-18 23:17:03', '2025-09-18 23:17:03');

-- --------------------------------------------------------

--
-- Table structure for table `multa`
--

CREATE TABLE `multa` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint DEFAULT NULL,
  `motivo` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagada','anulada') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendiente',
  `fecha` date NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `multa`
--

INSERT INTO `multa` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `descripcion`, `monto`, `estado`, `fecha`, `fecha_pago`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Ruidos molestos', 'Música alta después de las 22:00 hrs en día de semana', 50000.00, 'pendiente', '2025-09-10', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(2, 2, 4, 3, 'Mascotas sin control', 'Perro suelto en hall principal sin correa ni supervisión', 25000.00, 'pendiente', '2025-09-12', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(3, 3, 7, 5, 'Mal uso amenidades', 'Daños en quincho tras evento familiar no reportado', 35000.00, 'pagada', '2025-09-08', '2025-09-15 14:30:00', '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(4, 4, 8, 6, 'Estacionamiento indebido', 'Vehículo estacionado en lugar de visitas por más de 24 hrs', 20000.00, 'pendiente', '2025-09-14', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(5, 5, 9, 7, 'Basura en balcón', 'Acumulación de basura visible desde áreas comunes', 40000.00, 'pendiente', '2025-09-07', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(6, 6, 10, 8, 'Alteración orden', 'Fiesta sin autorización de administración con ruidos', 60000.00, 'pendiente', '2025-09-11', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(7, 1, 2, 2, 'Daños bienes comunes', 'Rayado en paredes del ascensor detectado por cámaras', 80000.00, 'pendiente', '2025-09-09', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(8, 2, 5, 10, 'Incumplimiento horarios', 'Uso de gimnasio fuera del horario establecido', 15000.00, 'pagada', '2025-09-13', '2025-09-16 16:45:00', '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(9, 3, 6, 4, 'Mal uso estacionamiento', 'Ocupación de dos espacios de estacionamiento', 30000.00, 'pendiente', '2025-09-15', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33'),
(10, 1, 3, 9, 'Violación normas', 'Comportamiento inadecuado en reunión de copropietarios', 45000.00, 'anulada', '2025-09-16', NULL, '2025-09-18 23:08:33', '2025-09-18 23:08:33');

-- --------------------------------------------------------

--
-- Table structure for table `notificacion`
--

CREATE TABLE `notificacion` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `persona_id` bigint DEFAULT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `objeto_tipo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `objeto_id` bigint DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notificacion`
--

INSERT INTO `notificacion` (`id`, `comunidad_id`, `persona_id`, `tipo`, `titulo`, `mensaje`, `leida`, `objeto_tipo`, `objeto_id`, `fecha_creacion`) VALUES
(1, 1, 1, 'aviso', 'Mantención Ascensores', 'Se realizará mantención de ascensores el día 25/09 de 9:00 a 17:00 hrs. Se recomienda usar escaleras durante este período.', 0, 'mantencion', 1, '2025-09-18 08:00:00'),
(2, 1, 2, 'cobro', 'Gastos Comunes Septiembre', 'Sus gastos comunes de septiembre han sido emitidos por $47.012. Fecha de vencimiento: 25/09/2025.', 1, 'emision', 1, '2025-09-01 10:00:00'),
(3, 2, 3, 'multa', 'Multa por Mascotas', 'Se ha aplicado una multa de $25.000 por mascotas sin correa en áreas comunes. Debe regularizar su situación.', 0, 'multa', 2, '2025-09-12 14:30:00'),
(4, 3, 4, 'aviso', 'Corte de Agua Programado', 'Corte de agua programado el día 22/09 de 8:00 a 16:00 hrs por mantención de cañerías principales.', 0, 'mantencion', 2, '2025-09-18 09:00:00'),
(5, 4, 6, 'confirmacion', 'Pago Confirmado', 'Gracias por su pago puntual de gastos comunes. Su comprobante es COMP006. El pago ha sido aplicado correctamente.', 1, 'pago', 6, '2025-09-15 16:20:00'),
(6, 5, 7, 'recordatorio', 'Vencimiento Próximo', 'Sus gastos comunes vencen el 28/09/2025. Saldo pendiente: $23.016. Evite recargos pagando antes del vencimiento.', 0, 'emision', 5, '2025-09-18 12:00:00'),
(7, 6, 8, 'reunion', 'Reunión de Copropietarios', 'Se convoca a reunión ordinaria para el 30/09/2025 a las 19:00 hrs en salón de eventos. Asistencia obligatoria.', 0, 'reunion', 1, '2025-09-18 14:00:00'),
(8, 1, 2, 'multa', 'Multa por Daños', 'Se ha aplicado multa de $80.000 por daños a bienes comunes según registro de cámaras de seguridad.', 1, 'multa', 7, '2025-09-09 15:45:00'),
(9, 2, 10, 'informacion', 'Nuevo Horario Gimnasio', 'El gimnasio tendrá nuevo horario a partir del 20/09: Lunes a Domingo de 06:00 a 23:00 hrs.', 0, 'amenidad', 8, '2025-09-18 11:30:00'),
(10, 3, 5, 'felicitacion', 'Pago Multa Recibido', 'Hemos recibido el pago de su multa por $35.000. Gracias por regularizar su situación. Su expediente ha sido cerrado.', 1, 'multa', 3, '2025-09-15 13:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `pago`
--

CREATE TABLE `pago` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `persona_id` bigint DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `medio` enum('transferencia','webpay','khipu','servipag','efectivo') COLLATE utf8mb4_general_ci NOT NULL,
  `referencia` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('pendiente','aplicado','reversado') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendiente',
  `comprobante_num` varchar(120) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pago`
--

INSERT INTO `pago` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `fecha`, `monto`, `medio`, `referencia`, `estado`, `comprobante_num`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-09-15', 47012.50, 'transferencia', 'TRF123456789', 'aplicado', 'COMP001', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(2, 1, 2, 2, '2025-09-10', 35259.38, 'transferencia', 'TRF987654321', 'aplicado', 'COMP002', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(3, 2, 4, 3, '2025-09-08', 17608.00, 'webpay', 'WP555666777', 'aplicado', 'COMP003', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(4, 3, 6, 4, '2025-09-14', 13492.60, 'servipag', 'SP123456', 'aplicado', 'COMP004', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(5, 3, 7, 5, '2025-09-12', 7496.17, 'efectivo', 'EFE001', 'aplicado', 'COMP005', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(6, 4, 8, 6, '2025-09-05', 98175.00, 'transferencia', 'TRF111222333', 'aplicado', 'COMP006', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(7, 5, 9, 7, '2025-09-11', 23016.00, 'khipu', 'KH444555666', 'aplicado', 'COMP007', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(8, 6, 10, 8, '2025-09-16', 38556.50, 'webpay', 'WP777888999', 'aplicado', 'COMP008', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(9, 1, 3, 9, '2025-09-13', 47012.50, 'transferencia', 'TRF789012345', 'pendiente', 'COMP009', '2025-09-18 23:06:10', '2025-09-18 23:06:10'),
(10, 2, 5, 10, '2025-09-17', 17608.00, 'transferencia', 'TRF000111222', 'reversado', 'COMP010', '2025-09-18 23:06:10', '2025-09-18 23:06:10');

-- --------------------------------------------------------

--
-- Table structure for table `pago_aplicacion`
--

CREATE TABLE `pago_aplicacion` (
  `id` bigint NOT NULL,
  `pago_id` bigint NOT NULL,
  `cargo_unidad_id` bigint NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `prioridad` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pago_aplicacion`
--

INSERT INTO `pago_aplicacion` (`id`, `pago_id`, `cargo_unidad_id`, `monto`, `prioridad`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 47012.50, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(2, 2, 2, 35259.38, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(3, 3, 4, 17608.00, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(4, 4, 6, 13492.60, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(5, 5, 7, 7496.17, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(6, 6, 8, 98175.00, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(7, 7, 9, 23016.00, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(8, 8, 10, 38556.50, 1, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(9, 2, 3, 11753.12, 2, '2025-09-18 23:24:53', '2025-09-18 23:24:53'),
(10, 5, 5, 7496.16, 2, '2025-09-18 23:24:53', '2025-09-18 23:24:53');

-- --------------------------------------------------------

--
-- Table structure for table `parametros_cobranza`
--

CREATE TABLE `parametros_cobranza` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `dias_gracia` int NOT NULL DEFAULT '0',
  `tasa_mora_mensual` decimal(5,2) NOT NULL DEFAULT '0.00',
  `mora_calculo` enum('diaria','mensual') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'mensual',
  `redondeo` enum('arriba','normal','abajo') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'normal',
  `interes_max_mensual` decimal(5,2) DEFAULT NULL,
  `aplica_interes_sobre` enum('saldo','capital') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'saldo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parametros_cobranza`
--

INSERT INTO `parametros_cobranza` (`id`, `comunidad_id`, `dias_gracia`, `tasa_mora_mensual`, `mora_calculo`, `redondeo`, `interes_max_mensual`, `aplica_interes_sobre`, `created_at`, `updated_at`) VALUES
(1, 1, 10, 1.50, 'mensual', 'normal', 5.00, 'saldo', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(2, 2, 15, 1.20, 'mensual', 'arriba', 4.50, 'capital', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(3, 3, 5, 1.80, 'diaria', 'normal', 6.00, 'saldo', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(4, 4, 7, 2.00, 'mensual', 'abajo', 7.00, 'saldo', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(5, 5, 12, 1.60, 'mensual', 'normal', 5.50, 'capital', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(6, 6, 8, 1.75, 'diaria', 'arriba', 6.50, 'saldo', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(7, 7, 20, 1.40, 'mensual', 'normal', 4.00, 'capital', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(8, 8, 6, 2.20, 'diaria', 'abajo', 8.00, 'saldo', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(9, 9, 14, 1.90, 'mensual', 'normal', 7.50, 'saldo', '2025-09-18 23:20:00', '2025-09-18 23:20:00'),
(10, 10, 11, 1.65, 'mensual', 'arriba', 5.25, 'capital', '2025-09-18 23:20:00', '2025-09-18 23:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

CREATE TABLE `persona` (
  `id` bigint NOT NULL,
  `rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `dv` char(1) COLLATE utf8mb4_general_ci NOT NULL,
  `nombres` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`id`, `rut`, `dv`, `nombres`, `apellidos`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, '15678923', '4', 'Patricio', 'Quintanilla', 'maria.gonzalez@email.com', '+56972386800', 'Las Condes 5678, Depto TN-101', '2025-09-18 22:30:27', '2025-09-18 23:33:26'),
(2, '16789234', '5', 'Carlos Eduardo', 'Rodríguez Silva', 'carlos.rodriguez@email.com', '+56 9 76543210', 'Las Condes 5678, Depto TN-102', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(3, '17890345', '6', 'Ana Beatriz', 'López Fernández', 'ana.lopez@email.com', '+56 9 65432109', 'Apoquindo 1890, Depto TP-1001', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(4, '18901456', '7', 'Pedro Alejandro', 'Martínez Torres', 'pedro.martinez@email.com', '+56 9 54321098', 'Vitacura 2340, Depto BA-101', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(5, '19012567', '8', 'Laura Victoria', 'Silva Morales', 'laura.silva@email.com', '+56 9 43210987', 'Vitacura 2340, Depto BA-102', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(6, '20123678', '9', 'Roberto Andrés', 'Fernández Ruiz', 'roberto.fernandez@email.com', '+56 9 32109876', 'Ñuñoa 876, Depto EP-101', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(7, '21234789', '0', 'Carmen Rosa', 'Torres Vargas', 'carmen.torres@email.com', '+56 9 21098765', 'Ñuñoa 876, Depto EP-102', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(8, '22345890', '1', 'Diego Sebastián', 'Morales Herrera', 'diego.morales@email.com', '+56 9 10987654', 'Maipú 3456, Depto ER-101', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(9, '23456901', '2', 'Patricia Isabel', 'Vargas Castro', 'patricia.vargas@email.com', '+56 9 09876543', 'Maipú 3456, Depto ER-102', '2025-09-18 22:30:27', '2025-09-18 22:30:27'),
(10, '24567012', '3', 'Andrés Felipe', 'Ruiz Mendoza', 'andres.ruiz@email.com', '+56 9 98765432', 'Providencia 2890, Depto TO-301', '2025-09-18 22:30:27', '2025-09-18 22:30:27');

-- --------------------------------------------------------

--
-- Table structure for table `proveedor`
--

CREATE TABLE `proveedor` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `rut` varchar(12) COLLATE utf8mb4_general_ci NOT NULL,
  `dv` char(1) COLLATE utf8mb4_general_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `giro` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proveedor`
--

INSERT INTO `proveedor` (`id`, `comunidad_id`, `rut`, `dv`, `razon_social`, `giro`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, 1, '76123456', '7', 'Empresa de Aseo Limpio S.A.', 'Servicios de Limpieza', 'contacto@aseo.cl', '+56 2 23456789', 'Av. Los Leones 1234, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(2, 1, '77234567', '8', 'Mantención y Servicios Ltda.', 'Mantención de Edificios', 'ventas@mantencion.cl', '+56 2 34567890', 'San Martín 567, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(3, 2, '78345678', '9', 'Seguridad Total S.A.', 'Servicios de Seguridad', 'info@seguridad.cl', '+56 2 45678901', 'Providencia 890, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(4, 3, '79456789', '0', 'Jardinería Verde Ltda.', 'Mantención de Jardines', 'contacto@jardines.cl', '+56 2 56789012', 'Las Condes 234, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(5, 4, '80567890', '1', 'Electricidad y Más S.A.', 'Servicios Eléctricos', 'ventas@electrico.cl', '+56 2 67890123', 'Vitacura 345, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(6, 5, '81678901', '2', 'Gas y Calefacción Ltda.', 'Sistemas de Gas', 'info@gas.cl', '+56 2 78901234', 'Ñuñoa 456, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(7, 6, '82789012', '3', 'Constructora Reparaciones S.A.', 'Reparaciones Generales', 'contacto@construccion.cl', '+56 2 89012345', 'Maipú 567, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(8, 7, '83890123', '4', 'Servicios Integrales Pro', 'Servicios Múltiples', 'info@pro.cl', '+56 2 90123456', 'Providencia 678, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(9, 8, '84901234', '5', 'Limpieza Profesional Ltda.', 'Servicios de Aseo', 'contacto@limpieza.cl', '+56 2 01234567', 'Las Condes 789, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21'),
(10, 9, '85012345', '6', 'Mantención Express S.A.', 'Mantención Rápida', 'ventas@express.cl', '+56 2 12345678', 'Vitacura 890, Santiago', '2025-09-18 22:58:21', '2025-09-18 22:58:21');

-- --------------------------------------------------------

--
-- Table structure for table `reserva_amenidad`
--

CREATE TABLE `reserva_amenidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `amenidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint NOT NULL,
  `inicio` datetime NOT NULL,
  `fin` datetime NOT NULL,
  `estado` enum('solicitada','aprobada','rechazada','cancelada','cumplida') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'solicitada',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reserva_amenidad`
--

INSERT INTO `reserva_amenidad` (`id`, `comunidad_id`, `amenidad_id`, `unidad_id`, `persona_id`, `inicio`, `fin`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, '2025-09-25 18:00:00', '2025-09-25 23:00:00', 'aprobada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(2, 1, 2, 2, 2, '2025-09-20 15:00:00', '2025-09-20 18:00:00', 'cumplida', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(3, 2, 3, 4, 3, '2025-09-22 10:00:00', '2025-09-22 14:00:00', 'aprobada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(4, 3, 4, 6, 4, '2025-09-28 12:00:00', '2025-09-28 20:00:00', 'solicitada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(5, 3, 5, 7, 5, '2025-09-21 16:00:00', '2025-09-21 18:00:00', 'aprobada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(6, 5, 7, 9, 7, '2025-09-30 19:00:00', '2025-09-30 23:00:00', 'solicitada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(7, 6, 8, 10, 8, '2025-09-19 06:00:00', '2025-09-19 08:00:00', 'cumplida', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(8, 1, 1, 3, 9, '2025-10-05 14:00:00', '2025-10-05 18:00:00', 'rechazada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(9, 2, 3, 5, 10, '2025-09-24 09:00:00', '2025-09-24 13:00:00', 'cancelada', '2025-09-18 23:20:10', '2025-09-18 23:20:10'),
(10, 4, 6, 8, 6, '2025-09-26 17:00:00', '2025-09-26 21:00:00', 'aprobada', '2025-09-18 23:20:10', '2025-09-18 23:20:10');

-- --------------------------------------------------------

--
-- Table structure for table `tarifa_consumo`
--

CREATE TABLE `tarifa_consumo` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `tipo` enum('agua','gas','electricidad') COLLATE utf8mb4_general_ci NOT NULL,
  `periodo_desde` char(7) COLLATE utf8mb4_general_ci NOT NULL,
  `periodo_hasta` char(7) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `precio_por_unidad` decimal(12,6) NOT NULL DEFAULT '0.000000',
  `cargo_fijo` decimal(12,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tarifa_consumo`
--

INSERT INTO `tarifa_consumo` (`id`, `comunidad_id`, `tipo`, `periodo_desde`, `periodo_hasta`, `precio_por_unidad`, `cargo_fijo`, `created_at`, `updated_at`) VALUES
(1, 1, 'agua', '2025-01', NULL, 850.500000, 2500.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(2, 1, 'gas', '2025-01', NULL, 1250.750000, 3500.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(3, 2, 'agua', '2025-01', NULL, 920.250000, 2800.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(4, 2, 'electricidad', '2025-01', NULL, 185.450000, 1500.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(5, 3, 'agua', '2025-01', NULL, 780.300000, 2200.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(6, 4, 'gas', '2025-01', NULL, 1180.650000, 3200.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(7, 5, 'electricidad', '2025-01', NULL, 165.850000, 1200.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(8, 6, 'agua', '2025-01', NULL, 890.400000, 2600.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(9, 7, 'gas', '2025-01', NULL, 1320.950000, 3800.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20'),
(10, 8, 'electricidad', '2025-01', NULL, 195.750000, 1600.00, '2025-09-18 23:20:20', '2025-09-18 23:20:20');

-- --------------------------------------------------------

--
-- Table structure for table `tenencia_unidad`
--

CREATE TABLE `tenencia_unidad` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint NOT NULL,
  `tipo` enum('propietario','arrendatario') COLLATE utf8mb4_general_ci NOT NULL,
  `desde` date NOT NULL,
  `hasta` date DEFAULT NULL,
  `porcentaje` decimal(5,2) NOT NULL DEFAULT '100.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenencia_unidad`
--

INSERT INTO `tenencia_unidad` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `tipo`, `desde`, `hasta`, `porcentaje`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'propietario', '2023-01-15', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(2, 1, 2, 2, 'propietario', '2022-08-20', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(3, 2, 4, 3, 'propietario', '2024-03-10', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(4, 3, 6, 4, 'propietario', '2023-11-05', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(5, 3, 7, 5, 'propietario', '2024-01-20', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(6, 4, 8, 6, 'propietario', '2023-07-12', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(7, 5, 9, 7, 'arrendatario', '2025-06-01', '2026-05-31', 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(8, 6, 10, 8, 'propietario', '2024-05-18', NULL, 100.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(9, 1, 3, 9, 'propietario', '2023-09-25', NULL, 50.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28'),
(10, 1, 3, 2, 'propietario', '2023-09-25', NULL, 50.00, '2025-09-18 23:20:28', '2025-09-18 23:20:28');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `categoria` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('abierto','en_progreso','resuelto','cerrado') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'abierto',
  `prioridad` enum('baja','media','alta') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'media',
  `asignado_a` bigint DEFAULT NULL,
  `attachments_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `ticket`
--

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
(10, 3, 7, 'General', 'Solicitud nueva llave', 'Solicitud de copia de llave de bodega', 'cerrado', 'baja', 1, NULL, '2025-09-18 23:20:38', '2025-09-18 23:20:38');

-- --------------------------------------------------------

--
-- Table structure for table `torre`
--

CREATE TABLE `torre` (
  `id` bigint NOT NULL,
  `edificio_id` bigint NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `torre`
--

INSERT INTO `torre` (`id`, `edificio_id`, `nombre`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Torre Poniente', 'TP', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(2, 2, 'Torre Este', 'TE', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(3, 3, 'Torre Oeste', 'TOE', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(4, 4, 'Torre Alpha', 'TA', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(5, 5, 'Torre Beta', 'TB', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(6, 6, 'Torre Gamma', 'TG', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(7, 7, 'Torre Delta', 'TD', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(8, 8, 'Torre Central', 'TC', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(9, 9, 'Torre Auxiliar', 'TAU', '2025-09-18 22:30:17', '2025-09-18 22:30:17'),
(10, 10, 'Torre Anexa', 'TAN', '2025-09-18 22:30:17', '2025-09-18 22:30:17');

-- --------------------------------------------------------

--
-- Table structure for table `uf_valor`
--

CREATE TABLE `uf_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `uf_valor`
--

INSERT INTO `uf_valor` (`fecha`, `valor`) VALUES
('2025-09-01', 37582.45),
('2025-09-02', 37585.12),
('2025-09-03', 37587.78),
('2025-09-04', 37590.45),
('2025-09-05', 37593.11),
('2025-09-06', 37595.78),
('2025-09-07', 37598.44),
('2025-09-08', 37601.11),
('2025-09-09', 37603.77),
('2025-09-10', 37606.44);

-- --------------------------------------------------------

--
-- Table structure for table `unidad`
--

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
-- Dumping data for table `unidad`
--

INSERT INTO `unidad` (`id`, `comunidad_id`, `edificio_id`, `torre_id`, `codigo`, `alicuota`, `m2_utiles`, `m2_terrazas`, `nro_bodega`, `nro_estacionamiento`, `activa`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'TN-101', 0.025000, 68.50, 8.00, 'B01', 'E01', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(2, 1, 1, NULL, 'TN-102', 0.025000, 68.50, 8.00, 'B02', 'E02', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(3, 1, 2, NULL, 'TS-101', 0.025000, 68.50, 8.00, 'B03', 'E03', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(4, 2, 3, NULL, 'TP-1001', 0.020000, 95.00, 15.00, 'B101', 'E101', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(5, 2, 3, NULL, 'TP-1002', 0.020000, 95.00, 15.00, 'B102', 'E102', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(6, 3, 4, NULL, 'BA-101', 0.018000, 52.00, 6.00, 'BA01', 'EA01', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(7, 3, 5, NULL, 'BB-101', 0.020000, 58.00, 8.00, 'BB01', 'EB01', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(8, 4, 6, NULL, 'EP-101', 0.015000, 45.00, 5.00, 'B201', 'E201', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(9, 5, 7, NULL, 'ER-101', 0.035000, 78.00, 10.00, 'B301', 'E301', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37'),
(10, 6, 8, 1, 'TO-301', 0.030000, 85.00, 12.00, 'B401', 'E401', 1, '2025-09-18 22:30:37', '2025-09-18 22:30:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `preferences` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `preferences`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"theme\": \"dark\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"gastos\", \"pagos\", \"multas\"]}, \"notifications\": {\"sms\": false, \"push\": true, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(2, 2, '{\"theme\": \"light\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"resumen\", \"notificaciones\"]}, \"notifications\": {\"sms\": true, \"push\": false, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(3, 3, '{\"theme\": \"auto\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"cargos\", \"amenidades\"]}, \"notifications\": {\"sms\": true, \"push\": true, \"email\": false}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(4, 4, '{\"theme\": \"light\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"todos\"]}, \"notifications\": {\"sms\": false, \"push\": false, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(5, 5, '{\"theme\": \"dark\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"gastos\", \"reportes\"]}, \"notifications\": {\"sms\": true, \"push\": true, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(6, 6, '{\"theme\": \"light\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"resumen\"]}, \"notifications\": {\"sms\": false, \"push\": true, \"email\": false}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(7, 7, '{\"theme\": \"auto\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"pagos\", \"multas\", \"tickets\"]}, \"notifications\": {\"sms\": true, \"push\": false, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(8, 8, '{\"theme\": \"dark\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"amenidades\", \"reservas\"]}, \"notifications\": {\"sms\": false, \"push\": true, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(9, 9, '{\"theme\": \"light\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"notificaciones\", \"documentos\"]}, \"notifications\": {\"sms\": true, \"push\": true, \"email\": false}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00'),
(10, 10, '{\"theme\": \"auto\", \"language\": \"es\", \"dashboard\": {\"widgets\": [\"resumen\", \"gastos\", \"pagos\"]}, \"notifications\": {\"sms\": true, \"push\": true, \"email\": true}}', '2025-09-18 23:21:00', '2025-09-18 23:21:00');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint NOT NULL,
  `persona_id` bigint DEFAULT NULL,
  `username` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `hash_password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_superadmin` tinyint(1) NOT NULL DEFAULT '0',
  `totp_secret` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `totp_enabled` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id`, `persona_id`, `username`, `hash_password`, `email`, `activo`, `created_at`, `updated_at`, `is_superadmin`, `totp_secret`, `totp_enabled`) VALUES
(1, 1, 'patricio.quintanilla', '$2a$12$LCSs2C/r8960uz5TjF554uh/TMlgUxG1LC7eo7LED6qgTukT4FMLe', 'patricio@pquintanilla.cl', 1, '2025-09-18 23:22:02', '2025-09-18 23:32:38', 1, NULL, 0),
(2, 2, 'carlos.rodriguez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'carlos.rodriguez@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:23:43', 1, NULL, 0),
(3, 3, 'ana.lopez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'ana.lopez@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:22:02', 1, 'JBSWY3DPEHPK3PXP', 1),
(4, 4, 'pedro.martinez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'pedro.martinez@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:23:46', 1, NULL, 0),
(5, 5, 'laura.silva', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'laura.silva@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:23:49', 1, NULL, 0),
(6, 6, 'roberto.fernandez', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'roberto.fernandez@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:23:51', 1, NULL, 0),
(7, 7, 'carmen.torres', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'carmen.torres@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:22:02', 0, NULL, 0),
(8, 8, 'diego.morales', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'diego.morales@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:22:02', 0, 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ', 1),
(9, 9, 'patricia.vargas', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'patricia.vargas@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:22:02', 0, NULL, 0),
(10, 10, 'andres.ruiz', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewLs2RWLQVKY/qZW', 'andres.ruiz@email.com', 1, '2025-09-18 23:22:02', '2025-09-18 23:22:02', 1, 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD', 1);

-- --------------------------------------------------------

--
-- Table structure for table `utm_valor`
--

CREATE TABLE `utm_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `utm_valor`
--

INSERT INTO `utm_valor` (`fecha`, `valor`) VALUES
('2025-09-01', 65967.00),
('2025-09-02', 65967.00),
('2025-09-03', 65967.00),
('2025-09-04', 65967.00),
('2025-09-05', 65967.00),
('2025-09-06', 65967.00),
('2025-09-07', 65967.00),
('2025-09-08', 65967.00),
('2025-09-09', 65967.00),
('2025-09-10', 65967.00);

-- --------------------------------------------------------

--
-- Table structure for table `webhook_pago`
--

CREATE TABLE `webhook_pago` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `proveedor` enum('webpay','khipu','otro','transferencia') COLLATE utf8mb4_general_ci NOT NULL,
  `payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `fecha_recepcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `procesado` tinyint(1) NOT NULL DEFAULT '0',
  `pago_id` bigint DEFAULT NULL
) ;

--
-- Dumping data for table `webhook_pago`
--

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
(10, 9, 'webpay', '{\"transaction_id\": \"WP333444555\", \"amount\": 13492, \"status\": \"approved\", \"card_last_4\": \"9999\"}', '2025-09-14 17:50:30', 1, 4);

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
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_preferences` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

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
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bitacora_conserjeria`
--
ALTER TABLE `bitacora_conserjeria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cargo_unidad`
--
ALTER TABLE `cargo_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cargo_unidad_detalle`
--
ALTER TABLE `cargo_unidad_detalle`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `centro_costo`
--
ALTER TABLE `centro_costo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `comunidad`
--
ALTER TABLE `comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `documento`
--
ALTER TABLE `documento`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `documento_compra`
--
ALTER TABLE `documento_compra`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `edificio`
--
ALTER TABLE `edificio`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `emision_gasto_comun`
--
ALTER TABLE `emision_gasto_comun`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `emision_gasto_detalle`
--
ALTER TABLE `emision_gasto_detalle`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gasto`
--
ALTER TABLE `gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `medidor`
--
ALTER TABLE `medidor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `membresia_comunidad`
--
ALTER TABLE `membresia_comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `multa`
--
ALTER TABLE `multa`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pago`
--
ALTER TABLE `pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `persona`
--
ALTER TABLE `persona`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tenencia_unidad`
--
ALTER TABLE `tenencia_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `torre`
--
ALTER TABLE `torre`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `unidad`
--
ALTER TABLE `unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `webhook_pago`
--
ALTER TABLE `webhook_pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

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
