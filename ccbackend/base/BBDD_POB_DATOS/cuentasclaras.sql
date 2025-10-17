-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 07, 2025 at 06:28 PM
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
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `reglas` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `capacidad` int DEFAULT NULL,
  `requiere_aprobacion` tinyint(1) NOT NULL DEFAULT '0',
  `tarifa` decimal(12,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `amenidad`
--

INSERT INTO `amenidad` (`id`, `comunidad_id`, `nombre`, `reglas`, `capacidad`, `requiere_aprobacion`, `tarifa`, `created_at`, `updated_at`) VALUES
(1, 2, 'Sala multiuso 1', 'No se permite alcohol.', 11, 1, 5100.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 1, 'Sala multiuso 2', 'No se permite alcohol.', 12, 0, 5200.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 4, 'Sala multiuso 3', 'No se permite alcohol.', 13, 1, 5300.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 3, 'Sala multiuso 4', 'No se permite alcohol.', 14, 0, 5400.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 2, 'Sala multiuso 5', 'No se permite alcohol.', 15, 1, 5500.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(6, 4, 'Sala multiuso 6', 'No se permite alcohol.', 16, 0, 5600.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(7, 2, 'Sala multiuso 7', 'No se permite alcohol.', 17, 1, 5700.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(8, 1, 'Sala multiuso 8', 'No se permite alcohol.', 18, 0, 5800.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(9, 5, 'Sala multiuso 9', 'No se permite alcohol.', 19, 1, 5900.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(10, 1, 'Sala multiuso 10', 'No se permite alcohol.', 20, 0, 6000.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(11, 1, 'Sala de Eventos Principal', 'Prohibido fumar. Uso hasta las 23:00 hrs. Deposito de garantía $50.000. Debe dejar el espacio limpio y ordenado. No se permite música con volumen alto después de las 22:00 hrs.', 80, 1, 45000.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(12, 1, 'Quincho Techado', 'Uso exclusivo residentes. Máximo 6 horas de arriendo. Prohibido fumar en áreas cerradas. Debe traer sus propios implementos de aseo. Depositar basura en contenedores designados.', 30, 1, 25000.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(13, 2, 'Piscina Temperada', 'Uso de gorro obligatorio. Niños menores de 12 años deben estar acompañados. Horario: 08:00 a 21:00 hrs. Prohibido ingresar con alimentos. Ducha obligatoria antes de ingresar.', 40, 0, 0.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(14, 2, 'Gimnasio', 'Uso exclusivo mayores de 16 años. Uso de toalla obligatorio. Devolver implementos a su lugar. Horario: 06:00 a 23:00 hrs. No se permite reservar, uso por orden de llegada.', 15, 0, 0.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(15, 3, 'Cancha de Tenis', 'Uso de calzado deportivo adecuado obligatorio. Reserva máxima 2 horas. Traer su propia raqueta y pelotas. Iluminación nocturna disponible hasta las 22:00 hrs.', 4, 0, 8000.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(16, 3, 'Sala de Juegos Infantil', 'Uso exclusivo niños hasta 12 años. Deben estar acompañados por un adulto responsable. Horario: 09:00 a 20:00 hrs. Prohibido ingresar alimentos. Mantener orden y limpieza.', 20, 0, 0.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(17, 4, 'Sala de Estudio/Cowork', 'Silencio obligatorio. Prohibido consumir alimentos. WiFi disponible. Uso máximo 4 horas continuas. Deben traer sus propios dispositivos y materiales. Horario: 08:00 a 22:00 hrs.', 12, 0, 0.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(18, 5, 'Terraza con Parrillas', 'Reserva con 48 hrs de anticipación. Uso máximo 6 horas. Traer carbón y utensilios propios. Limpiar parrillas después del uso. Prohibido música con amplificación después de las 22:00 hrs.', 25, 1, 15000.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(19, 5, 'Estacionamiento de Visitas', 'Máximo 2 cupos por departamento. Uso máximo 24 horas continuas. Debe registrar patente en conserjería. Sujeto a disponibilidad. No se permite estacionamiento permanente.', 10, 0, 3000.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(20, 6, 'Sala de Cine', 'Capacidad limitada, reservar con anticipación. Uso de sistema de audio/video incluido. Prohibido ingresar alimentos desde exterior. Mantener volumen moderado. Duración máxima 4 horas.', 16, 1, 12000.00, '2025-10-06 18:52:24', '2025-10-06 18:52:24'),
(21, 1, 'Sala de Eventos Principal', 'Prohibido fumar. Uso hasta las 23:00 hrs. Deposito de garantía $50.000. Debe dejar el espacio limpio y ordenado. No se permite música con volumen alto después de las 22:00 hrs.', 80, 1, 45000.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(22, 1, 'Quincho Techado', 'Uso exclusivo residentes. Máximo 6 horas de arriendo. Prohibido fumar en áreas cerradas. Debe traer sus propios implementos de aseo. Depositar basura en contenedores designados.', 30, 1, 25000.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(23, 2, 'Piscina Temperada', 'Uso de gorro obligatorio. Niños menores de 12 años deben estar acompañados. Horario: 08:00 a 21:00 hrs. Prohibido ingresar con alimentos. Ducha obligatoria antes de ingresar.', 40, 0, 0.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(24, 2, 'Gimnasio', 'Uso exclusivo mayores de 16 años. Uso de toalla obligatorio. Devolver implementos a su lugar. Horario: 06:00 a 23:00 hrs. No se permite reservar, uso por orden de llegada.', 15, 0, 0.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(25, 3, 'Cancha de Tenis', 'Uso de calzado deportivo adecuado obligatorio. Reserva máxima 2 horas. Traer su propia raqueta y pelotas. Iluminación nocturna disponible hasta las 22:00 hrs.', 4, 0, 8000.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(26, 3, 'Sala de Juegos Infantil', 'Uso exclusivo niños hasta 12 años. Deben estar acompañados por un adulto responsable. Horario: 09:00 a 20:00 hrs. Prohibido ingresar alimentos. Mantener orden y limpieza.', 20, 0, 0.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(27, 4, 'Sala de Estudio/Cowork', 'Silencio obligatorio. Prohibido consumir alimentos. WiFi disponible. Uso máximo 4 horas continuas. Deben traer sus propios dispositivos y materiales. Horario: 08:00 a 22:00 hrs.', 12, 0, 0.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(28, 5, 'Terraza con Parrillas', 'Reserva con 48 hrs de anticipación. Uso máximo 6 horas. Traer carbón y utensilios propios. Limpiar parrillas después del uso. Prohibido música con amplificación después de las 22:00 hrs.', 25, 1, 15000.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(29, 5, 'Estacionamiento de Visitas', 'Máximo 2 cupos por departamento. Uso máximo 24 horas continuas. Debe registrar patente en conserjería. Sujeto a disponibilidad. No se permite estacionamiento permanente.', 10, 0, 3000.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(30, 6, 'Sala de Cine', 'Capacidad limitada, reservar con anticipación. Uso de sistema de audio/video incluido. Prohibido ingresar alimentos desde exterior. Mantener volumen moderado. Duración máxima 4 horas.', 16, 1, 12000.00, '2025-10-06 18:53:05', '2025-10-06 18:53:05'),
(31, 7, 'Salón de Yoga y Pilates', 'Traer mat propio. Uso de calcetines antideslizantes. Horario: 07:00 a 21:00 hrs. Reserva máxima 90 minutos. Mantener silencio y respeto.', 12, 0, 0.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(32, 8, 'Juegos Infantiles Exterior', 'Uso bajo supervisión de adultos. Horario: 09:00 a 20:00 hrs. Niños hasta 10 años. Prohibido el uso en días de lluvia. Respetar turnos de uso.', 15, 0, 0.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(33, 9, 'Bodega de Almacenamiento', 'Arriendo mensual. No se permiten artículos inflamables o peligrosos. Acceso solo con autorización de administración. Seguro del contenido es responsabilidad del arrendatario.', 1, 1, 25000.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(34, 10, 'Lavandería Común', 'Uso por orden de llegada. Traer su propio detergente. Retirar ropa inmediatamente al finalizar. Horario: 08:00 a 22:00 hrs. Reportar cualquier desperfecto a conserjería.', 6, 0, 2000.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(35, 11, 'Sala de Música', 'Insonorizada. Reserva obligatoria máximo 3 horas. No dañar instrumentos disponibles. Prohibido fumar. Dejar instrumentos ordenados. Horario: 10:00 a 22:00 hrs.', 8, 1, 8000.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(36, 12, 'Cancha Multiuso (Fútbol/Básquet)', 'Uso de calzado deportivo apropiado. Reserva máxima 2 horas. Respetar horarios. Iluminación hasta las 23:00 hrs. Reportar cualquier daño a la infraestructura.', 20, 0, 10000.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(37, 13, 'Sala de Reuniones Corporativa', 'Proyector y pizarra disponibles. WiFi de alta velocidad. Capacidad para videoconferencias. Uso máximo 4 horas. Dejar sala ordenada. Horario: 08:00 a 20:00 hrs.', 10, 1, 15000.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(38, 14, 'Spa y Sauna', 'Uso exclusivo mayores de 18 años. Ducha obligatoria antes de ingresar. Uso de toalla obligatorio. Tiempo máximo 30 minutos. Horario: 09:00 a 21:00 hrs. Prohibido el uso con condiciones médicas específicas.', 8, 0, 5000.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(39, 15, 'Zona de Mascotas (Dog Park)', 'Solo perros vacunados y con chip. Dueños responsables de recoger desechos. Supervisión constante obligatoria. Uso de correa al entrar y salir. Horario: 07:00 a 20:00 hrs.', 15, 0, 0.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02'),
(40, 16, 'Taller de Bicicletas', 'Herramientas básicas disponibles. Uso para reparaciones menores. No se permite lavado de bicicletas. Ordenar herramientas después del uso. Horario: 08:00 a 20:00 hrs.', 4, 0, 0.00, '2025-10-06 19:01:02', '2025-10-06 19:01:02');

-- --------------------------------------------------------

--
-- Table structure for table `archivos`
--

CREATE TABLE `archivos` (
  `id` bigint NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `mimetype` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `description` text COLLATE utf8mb4_unicode_ci,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` bigint DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditoria`
--

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
-- Dumping data for table `auditoria`
--

INSERT INTO `auditoria` (`id`, `usuario_id`, `accion`, `tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `ip_address`, `created_at`) VALUES
(1, 2, 'UPDATE', 'unidad', 1, '{\"campo1\": \"valor anterior\"}', '{\"campo1\": \"valor nuevo\"}', '192.168.0.1', '2025-10-02 18:42:27'),
(2, 3, 'INSERT', 'unidad', 2, NULL, '{\"campo1\": \"valor nuevo\"}', '192.168.0.2', '2025-10-02 18:42:27'),
(3, 4, 'DELETE', 'unidad', 3, '{\"campo1\": \"valor anterior\"}', NULL, '192.168.0.3', '2025-10-02 18:42:27'),
(4, 5, 'UPDATE', 'persona', 4, '{\"nombre\": \"Juan\"}', '{\"nombre\": \"Juan P.\"}', '192.168.0.4', '2025-10-02 18:42:27'),
(5, 6, 'UPDATE', 'gasto', 5, '{\"monto\": 5000}', '{\"monto\": 6000}', '192.168.0.5', '2025-10-02 18:42:27'),
(6, 1, 'INSERT', 'torre', NULL, NULL, '{\"codigo\": \"T101\", \"nombre\": \"Torre Test A\"}', '127.0.0.1', '2025-10-06 18:22:08'),
(7, NULL, 'INSERT', 'torre', NULL, NULL, '{\"codigo\": null, \"nombre\": null}', '127.0.0.1', '2025-10-06 18:37:23');

-- --------------------------------------------------------

--
-- Stand-in structure for view `bitacora_conserjeria`
-- (See below for the actual view)
--
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
-- Stand-in structure for view `cargo_financiero_unidad`
-- (See below for the actual view)
--
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
-- Table structure for table `categoria_gasto`
--

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
-- Dumping data for table `categoria_gasto`
--

INSERT INTO `categoria_gasto` (`id`, `comunidad_id`, `nombre`, `tipo`, `cta_contable`, `activa`, `created_at`, `updated_at`) VALUES
(1, 16, 'Categoría 1', 'multas', '510001', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 14, 'Categoría 2', 'consumo', '510002', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 6, 'Categoría 3', 'consumo', '510003', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 11, 'Categoría 4', 'extraordinario', '510004', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 14, 'Categoría 5', 'consumo', '510005', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 20, 'Categoría 6', 'operacional', '510006', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 16, 'Categoría 7', 'multas', '510007', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 20, 'Categoría 8', 'operacional', '510008', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 7, 'Categoría 9', 'fondo_reserva', '510009', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 3, 'Categoría 10', 'consumo', '510010', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 6, 'Categoría 11', 'multas', '510011', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 7, 'Categoría 12', 'fondo_reserva', '510012', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 7, 'Categoría 13', 'operacional', '510013', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 8, 'Categoría 14', 'operacional', '510014', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 6, 'Categoría 15', 'fondo_reserva', '510015', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 19, 'Categoría 16', 'consumo', '510016', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 11, 'Categoría 17', 'extraordinario', '510017', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 9, 'Categoría 18', 'operacional', '510018', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 5, 'Categoría 19', 'multas', '510019', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 13, 'Categoría 20', 'extraordinario', '510020', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29');

-- --------------------------------------------------------

--
-- Table structure for table `centro_costo`
--

CREATE TABLE `centro_costo` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `centro_costo`
--

INSERT INTO `centro_costo` (`id`, `comunidad_id`, `nombre`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 2, 'Centro 1', 'CC001', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 3, 'Centro 2', 'CC002', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 17, 'Centro 3', 'CC003', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 9, 'Centro 4', 'CC004', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 15, 'Centro 5', 'CC005', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 11, 'Centro 6', 'CC006', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 7, 'Centro 7', 'CC007', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 2, 'Centro 8', 'CC008', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 19, 'Centro 9', 'CC009', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 3, 'Centro 10', 'CC010', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 17, 'Centro 11', 'CC011', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 17, 'Centro 12', 'CC012', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 13, 'Centro 13', 'CC013', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 20, 'Centro 14', 'CC014', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 6, 'Centro 15', 'CC015', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 10, 'Centro 16', 'CC016', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 5, 'Centro 17', 'CC017', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 20, 'Centro 18', 'CC018', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 7, 'Centro 19', 'CC019', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 7, 'Centro 20', 'CC020', '2025-10-02 18:19:29', '2025-10-02 18:19:29');

-- --------------------------------------------------------

--
-- Table structure for table `comunidad`
--

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
-- Dumping data for table `comunidad`
--

INSERT INTO `comunidad` (`id`, `razon_social`, `rut`, `dv`, `giro`, `direccion`, `email_contacto`, `telefono_contacto`, `politica_mora_json`, `moneda`, `tz`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'Comunidad Providencia #1', '10629071', '7', 'Administración de edificios', 'Acceso Remedios Barriga #652, Providencia', 'edelmira15@bueno.es', '+34705 39 27 73', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(2, 'Comunidad Las Condes #2', '10609747', 'K', 'Administración de edificios', 'Rambla de Macario Toro #943, Las Condes', 'kcalderon@duran.com', '+34 742134113', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(3, 'Comunidad Ñuñoa #3', '2869069', 'K', 'Administración de edificios', 'Urbanización de María José Rosselló #576, Ñuñoa', 'ltovar@gmail.com', '+34739 788 839', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(4, 'Comunidad La Florida #4', '18608281', '8', 'Administración de edificios', 'Camino Caridad Aznar #237, La Florida', 'vivianacifuentes@yahoo.com', '+34 808 205 869', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(5, 'Comunidad Maipú #5', '8908658', '2', 'Administración de edificios', 'Plaza de Nando Barreda #909, Maipú', 'marizoraida@gallo.es', '+34 729189931', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(6, 'Comunidad Puente Alto #6', '3825858', '3', 'Administración de edificios', 'Via de Julio César Fuente #319, Puente Alto', 'julian45@gmail.com', '+34617 749 516', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(7, 'Comunidad Recoleta #7', '8665376', '1', 'Administración de edificios', 'Pasaje Cipriano Zabala #513, Recoleta', 'amormartinez@gmail.com', '+34635 66 18 45', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(8, 'Comunidad Independencia #8', '3119699', 'K', 'Administración de edificios', 'Glorieta de Ana Sofía Juan #111, Independencia', 'benavidesurbano@vara.es', '+34744 980 552', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(9, 'Comunidad Macul #9', '5592832', '0', 'Administración de edificios', 'Urbanización Cristian Cabañas #401, Macul', 'teresitamadrigal@cabrero.es', '+34741 860 103', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(10, 'Comunidad San Miguel #10', '21940255', '4', 'Administración de edificios', 'Pasaje Marciano Pareja #677, San Miguel', 'boixjose-maria@yahoo.com', '+34707 821 376', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(11, 'Comunidad Lo Barnechea #11', '2186385', '8', 'Administración de edificios', 'Urbanización Felipe Vilaplana #919, Lo Barnechea', 'felisa53@hotmail.com', '+34600619716', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(12, 'Comunidad Vitacura #12', '7821754', '5', 'Administración de edificios', 'Plaza de Guadalupe Amigó #498, Vitacura', 'vascoduenas@hotmail.com', '+34983 42 13 16', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(13, 'Comunidad Santiago #13', '16700137', '8', 'Administración de edificios', 'Cañada de Ariel Marí #256, Santiago', 'xpablo@hotmail.com', '+34 728 29 59 33', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(14, 'Comunidad Providencia #14', '6694659', '2', 'Administración de edificios', 'Urbanización de Reyes Toro #773, Providencia', 'candelas21@batalla.com', '+34710480690', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(15, 'Comunidad Las Condes #15', '11259073', '0', 'Administración de edificios', 'Cuesta de Estrella Alcalde #148, Las Condes', 'tiradoisaac@collado-bertran.com', '+34 729511574', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(16, 'Comunidad Ñuñoa #16', '11223649', 'K', 'Administración de edificios', 'Glorieta de Lino Real #525, Ñuñoa', 'gamezsusana@costa.es', '+34 823151975', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(17, 'Comunidad La Florida #17', '1271048', '8', 'Administración de edificios', 'Alameda Herberto Solana #466, La Florida', 'muria@aguirre-pomares.com', '+34 629 216 748', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(18, 'Comunidad Maipú #15', '13466150', 'K', 'Administración de edificios', 'C. de Vinicio Salazar #46, Maipú', 'ntena@colom.com', '+34 928 57 50 13', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-06 14:11:01', NULL, NULL),
(19, 'Comunidad Puente Alto #19', '23884158', '5', 'Administración de edificios', 'Callejón Leonor Rodríguez #597, Puente Alto', 'julianbenito@hotmail.com', '+34 728 890 470', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(20, 'Comunidad Recoleta #20', '4164577', '6', 'Administración de edificios', 'Pasaje de Maximiano Alfonso #440, Recoleta', 'angelina85@fabregat-galindo.es', '+34 884 258 433', NULL, 'CLP', 'America/Santiago', '2025-10-02 18:00:09', '2025-10-02 18:00:09', NULL, NULL),
(21, 'Comunidad QA', '99999999', '9', 'Pruebas', 'Av. QA 123', 'qa@demo.cl', '+56 2 12345678', NULL, 'CLP', 'America/Santiago', '2025-10-06 18:35:12', '2025-10-06 18:35:12', NULL, NULL),
(100, 'Comunidad Edificio Los Álamos', '76543210', '9', 'Administración de edificios', 'Av. Apoquindo 4500, Las Condes', 'contacto@losalamos.cl', '+56912345678', NULL, 'CLP', 'America/Santiago', '2025-10-06 18:57:25', '2025-10-06 18:57:25', NULL, NULL),
(101, 'Comunidad Prueba', '76545210', '5', NULL, 'Av. Siempre Viva 123', NULL, NULL, NULL, 'CLP', 'America/Santiago', '2025-10-07 17:02:19', '2025-10-07 17:02:19', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `conciliacion_bancaria`
--

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
-- Dumping data for table `conciliacion_bancaria`
--

INSERT INTO `conciliacion_bancaria` (`id`, `comunidad_id`, `fecha_mov`, `monto`, `glosa`, `referencia`, `estado`, `pago_id`, `extracto_id`, `created_at`, `updated_at`) VALUES
(1, 2, '2025-09-01', 50000.00, 'Pago de GGCC septiembre', 'REF001', 'conciliado', 5, NULL, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 3, '2025-09-03', 75000.00, 'Pago extraordinario', 'REF002', 'pendiente', NULL, NULL, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 1, '2025-09-05', 15000.00, 'Mora por atraso', 'REF003', 'descartado', NULL, NULL, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 2, '2025-09-08', 20000.00, 'Pago parcial GGCC', 'REF004', 'conciliado', 7, NULL, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 4, '2025-09-10', 30000.00, 'Transferencia sin identificar', 'REF005', 'pendiente', NULL, NULL, '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_interes`
--

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
-- Dumping data for table `configuracion_interes`
--

INSERT INTO `configuracion_interes` (`id`, `comunidad_id`, `aplica_desde`, `tasa_mensual`, `metodo`, `tope_mensual`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-01-01', 1.20, 'simple', 2.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 2, '2025-01-01', 1.50, 'compuesto', 2.50, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 3, '2025-01-01', 1.00, 'simple', 1.80, '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `cuenta_cobro_unidad`
--

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
-- Dumping data for table `cuenta_cobro_unidad`
--

INSERT INTO `cuenta_cobro_unidad` (`id`, `emision_id`, `comunidad_id`, `unidad_id`, `monto_total`, `saldo`, `estado`, `interes_acumulado`, `created_at`, `updated_at`) VALUES
(1, 15, 12, 10, 63292.00, 21108.27, 'pagado', 2554.14, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(2, 17, 9, 12, 133550.00, 29706.09, 'pagado', 3896.02, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(3, 8, 10, 3, 76354.00, 29990.36, 'vencido', 742.51, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(4, 11, 10, 9, 114512.00, 114240.48, 'vencido', 808.10, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(5, 6, 11, 18, 109843.00, 88458.11, 'vencido', 4708.44, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(6, 17, 6, 10, 116198.00, 85386.59, 'vencido', 2776.15, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(7, 17, 2, 12, 119183.00, 35370.51, 'vencido', 1134.76, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(8, 8, 11, 9, 116769.00, 107915.67, 'pendiente', 2498.04, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(9, 6, 10, 8, 143831.00, 91550.05, 'pendiente', 1556.19, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(10, 17, 19, 20, 71667.00, 18917.64, 'pendiente', 41.70, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(11, 18, 16, 13, 83194.00, 65086.39, 'pendiente', 1067.18, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(12, 13, 5, 15, 132692.00, 16576.22, 'parcial', 4261.58, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(13, 8, 16, 1, 145107.00, 73559.21, 'vencido', 3677.99, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(14, 14, 2, 20, 51079.00, 22114.73, 'pagado', 2384.07, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(15, 16, 6, 8, 112169.00, 52713.49, 'pendiente', 124.75, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(16, 1, 2, 15, 93793.00, 47761.70, 'parcial', 4354.75, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(17, 18, 11, 12, 133757.00, 77169.94, 'vencido', 1539.94, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(18, 18, 14, 13, 86820.00, 55728.48, 'parcial', 4104.05, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(19, 17, 9, 7, 134807.00, 74813.79, 'parcial', 3713.13, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(20, 20, 1, 20, 55523.00, 50727.97, 'pendiente', 2505.81, '2025-10-02 18:20:48', '2025-10-02 18:20:48');

-- --------------------------------------------------------

--
-- Stand-in structure for view `detalle_cargo_unidad`
-- (See below for the actual view)
--
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
-- Table structure for table `detalle_cuenta_unidad`
--

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
-- Dumping data for table `detalle_cuenta_unidad`
--

INSERT INTO `detalle_cuenta_unidad` (`id`, `cuenta_cobro_unidad_id`, `categoria_id`, `glosa`, `monto`, `origen`, `origen_id`, `iva_incluido`, `created_at`, `updated_at`) VALUES
(1, 1, 19, 'Detalle gasto 1', 36207.00, 'gasto', 8, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(2, 2, 3, 'Detalle gasto 2', 30153.00, 'consumo', 1, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(3, 3, 3, 'Detalle gasto 3', 46011.00, 'multa', 5, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(4, 4, 3, 'Detalle gasto 4', 38502.00, 'gasto', 12, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(5, 5, 7, 'Detalle gasto 5', 36010.00, 'multa', 11, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(6, 6, 10, 'Detalle gasto 6', 23202.00, 'gasto', 6, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(7, 7, 12, 'Detalle gasto 7', 14552.00, 'consumo', 4, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(8, 8, 3, 'Detalle gasto 8', 29917.00, 'gasto', 11, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(9, 9, 4, 'Detalle gasto 9', 16099.00, 'multa', 7, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(10, 10, 14, 'Detalle gasto 10', 22823.00, 'multa', 6, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(11, 11, 10, 'Detalle gasto 11', 26696.00, 'multa', 7, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(12, 12, 2, 'Detalle gasto 12', 29570.00, 'consumo', 11, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(13, 13, 17, 'Detalle gasto 13', 20408.00, 'gasto', 18, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(14, 14, 7, 'Detalle gasto 14', 23192.00, 'gasto', 1, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(15, 15, 8, 'Detalle gasto 15', 47887.00, 'multa', 5, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(16, 16, 12, 'Detalle gasto 16', 49291.00, 'consumo', 15, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(17, 17, 4, 'Detalle gasto 17', 40765.00, 'multa', 16, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(18, 18, 18, 'Detalle gasto 18', 22567.00, 'multa', 14, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(19, 19, 9, 'Detalle gasto 19', 16596.00, 'consumo', 10, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(20, 20, 12, 'Detalle gasto 20', 19810.00, 'consumo', 2, 0, '2025-10-02 18:20:48', '2025-10-02 18:20:48');

-- --------------------------------------------------------

--
-- Table structure for table `detalle_emision_gastos`
--

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
-- Dumping data for table `detalle_emision_gastos`
--

INSERT INTO `detalle_emision_gastos` (`id`, `emision_id`, `gasto_id`, `categoria_id`, `monto`, `regla_prorrateo`, `metadata_json`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 145000.00, 'coeficiente', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 1, 2, 3, 58000.00, 'partes_iguales', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 2, 3, 5, 12000.00, 'consumo', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 2, 4, 4, 33000.00, 'fijo_por_unidad', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 3, 5, 2, 91500.00, 'coeficiente', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(6, 3, 6, 6, 47400.00, 'consumo', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(7, 4, 7, 7, 23800.00, 'partes_iguales', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(8, 4, 8, 3, 9900.00, 'fijo_por_unidad', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(9, 5, 9, 1, 61200.00, 'coeficiente', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(10, 5, 10, 5, 43000.00, 'partes_iguales', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(11, 6, 11, 8, 22000.00, 'consumo', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(12, 6, 12, 4, 37000.00, 'fijo_por_unidad', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(13, 7, 13, 3, 28000.00, 'coeficiente', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(14, 7, 14, 6, 15800.00, 'consumo', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(15, 8, 15, 2, 56000.00, 'fijo_por_unidad', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(16, 8, 16, 9, 49900.00, 'partes_iguales', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(17, 9, 17, 5, 86000.00, 'consumo', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(18, 9, 18, 8, 30000.00, 'coeficiente', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(19, 10, 19, 10, 12000.00, 'partes_iguales', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(20, 10, 20, 7, 18900.00, 'fijo_por_unidad', '{}', '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `documento_compra`
--

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
-- Dumping data for table `documento_compra`
--

INSERT INTO `documento_compra` (`id`, `comunidad_id`, `proveedor_id`, `tipo_doc`, `folio`, `fecha_emision`, `neto`, `iva`, `exento`, `total`, `glosa`, `created_at`, `updated_at`) VALUES
(1, 12, 13, 'factura', '6736', '2025-05-24', 251654.00, 47814.00, 0.00, 299468.00, 'Compra de servicios 1', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 15, 15, 'boleta', '1657', '2025-01-28', 167918.00, 31904.00, 0.00, 199822.00, 'Compra de servicios 2', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 17, 15, 'boleta', '1303', '2025-04-07', 63268.00, 12020.00, 0.00, 75288.00, 'Compra de servicios 3', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 6, 20, 'factura', '4358', '2025-01-02', 242317.00, 46040.00, 0.00, 288357.00, 'Compra de servicios 4', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 8, 20, 'factura', '6620', '2025-05-29', 86610.00, 16455.00, 0.00, 103065.00, 'Compra de servicios 5', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 13, 5, 'boleta', '3679', '2024-10-16', 175225.00, 33292.00, 0.00, 208517.00, 'Compra de servicios 6', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 7, 4, 'factura', '7900', '2025-01-13', 128139.00, 24346.00, 0.00, 152485.00, 'Compra de servicios 7', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 11, 4, 'factura', '5642', '2025-08-28', 94042.00, 17867.00, 0.00, 111909.00, 'Compra de servicios 8', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 1, 20, 'boleta', '1360', '2024-10-14', 157910.00, 30002.00, 0.00, 187912.00, 'Compra de servicios 9', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 4, 3, 'factura', '1851', '2024-10-01', 77420.00, 14709.00, 0.00, 92129.00, 'Compra de servicios 10', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 14, 7, 'factura', '5340', '2024-11-02', 228572.00, 43428.00, 0.00, 272000.00, 'Compra de servicios 11', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 19, 14, 'boleta', '8730', '2025-07-09', 184382.00, 35032.00, 0.00, 219414.00, 'Compra de servicios 12', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 9, 13, 'boleta', '7256', '2025-04-23', 141311.00, 26849.00, 0.00, 168160.00, 'Compra de servicios 13', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 3, 13, 'boleta', '3529', '2025-08-08', 70274.00, 13352.00, 0.00, 83626.00, 'Compra de servicios 14', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 14, 6, 'factura', '2355', '2024-11-08', 140925.00, 26775.00, 0.00, 167700.00, 'Compra de servicios 15', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 11, 20, 'factura', '9673', '2024-12-17', 244206.00, 46399.00, 0.00, 290605.00, 'Compra de servicios 16', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 7, 16, 'boleta', '3630', '2024-10-09', 130343.00, 24765.00, 0.00, 155108.00, 'Compra de servicios 17', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 15, 12, 'boleta', '3095', '2025-07-17', 235971.00, 44834.00, 0.00, 280805.00, 'Compra de servicios 18', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 2, 11, 'boleta', '2352', '2025-05-14', 130337.00, 24764.00, 0.00, 155101.00, 'Compra de servicios 19', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 20, 10, 'factura', '8298', '2025-03-31', 63465.00, 12058.00, 0.00, 75523.00, 'Compra de servicios 20', '2025-10-02 18:19:29', '2025-10-02 18:19:29');

-- --------------------------------------------------------

--
-- Table structure for table `documento_comunidad`
--

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
-- Dumping data for table `documento_comunidad`
--

INSERT INTO `documento_comunidad` (`id`, `comunidad_id`, `tipo`, `titulo`, `url`, `periodo`, `visibilidad`, `created_at`, `updated_at`) VALUES
(1, 1, 'circular', 'Cambio de reglamento', 'https://docs.cuentasclaras.cl/doc1.pdf', '2025-09', 'publico', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 2, 'acta', 'Reunión mensual agosto', 'https://docs.cuentasclaras.cl/doc2.pdf', '2025-08', 'privado', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 3, 'reglamento', 'Reglamento interno', 'https://docs.cuentasclaras.cl/doc3.pdf', NULL, 'publico', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 4, 'boletin', 'Boletín de noticias', 'https://docs.cuentasclaras.cl/doc4.pdf', '2025-10', 'publico', '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `edificio`
--

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
-- Dumping data for table `edificio`
--

INSERT INTO `edificio` (`id`, `comunidad_id`, `nombre`, `direccion`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 10, 'Edificio Via Melchor Mancebo', 'Pasadizo Pilar Rueda 92, Lugo, 92941', 'ED001', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 18, 'Edificio Plaza de Irma Amador', 'Rambla Eugenio Fiol 19 Piso 4 , Ourense, 11742', 'ED002', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 20, 'Edificio Callejón Juan Luis Lledó', 'C. Clemente Miguel 445 Piso 9 , Burgos, 62819', 'ED003', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 9, 'Edificio Cuesta de Raúl Oliver', 'Urbanización Clara Meléndez 56 Piso 3 , Soria, 65663', 'ED004', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 2, 'Edificio Calle Severino Martorell', 'Pasadizo Ruy Serra 85 Apt. 64 , Almería, 45665', 'ED005', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 5, 'Edificio Vial Dolores Avilés', 'Pasadizo de Espiridión Bastida 562, Ciudad, 95436', 'ED006', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 16, 'Edificio C. de Ramona Ferrández', 'Callejón de Plácido Arana 13 Piso 4 , Guipúzcoa, 06886', 'ED007', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 17, 'Edificio Callejón de Brígida Sobrino', 'Urbanización Petrona Amor 26 Piso 9 , Soria, 24102', 'ED008', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 3, 'Edificio C. Pablo Cabañas', 'Pasaje Rosa Tur 30, Cáceres, 70528', 'ED009', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 18, 'Edificio Camino Reyna Bermúdez', 'Ronda de Matías Sevilla 43 Apt. 49 , Jaén, 52397', 'ED010', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 18, 'Edificio Urbanización de Griselda Monreal', 'Via de Benita Ferrer 358, Cáceres, 70444', 'ED011', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 10, 'Edificio Cañada Marina Alcántara', 'Avenida de Alicia Lago 60, Soria, 21412', 'ED012', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 4, 'Edificio Camino Ángela Núñez', 'Callejón de Jacobo Castejón 48 Piso 6 , Murcia, 80033', 'ED013', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 10, 'Edificio Alameda Víctor Llorente', 'Cañada de Virgilio Lobo 794, Albacete, 56269', 'ED014', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 7, 'Edificio Ronda Atilio Figuerola', 'Plaza Rómulo Aguilera 98 Apt. 13 , Ciudad, 66884', 'ED015', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 12, 'Edificio Urbanización de Manuel Alberola', 'Avenida de Elodia Morillo 72, Melilla, 46757', 'ED016', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 18, 'Edificio C. Elisa Ferrándiz', 'Paseo de Yaiza Torrens 76 Puerta 3 , Segovia, 49268', 'ED017', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 15, 'Edificio Ronda Teófila Plana', 'Glorieta Cesar Anguita 5 Puerta 2 , Valladolid, 42780', 'ED018', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 7, 'Edificio Plaza Salvador Chacón', 'Pasaje de Ani Blanch 385 Piso 5 , Teruel, 44033', 'ED019', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 14, 'Edificio C. de Lorenza Hurtado', 'Avenida de Palmira Catalá 8 Piso 9 , Albacete, 17883', 'ED020', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(21, 1, 'Edificio Principal Providencia', 'Av. Providencia 1234', NULL, '2025-10-03 15:35:16', '2025-10-03 15:35:16'),
(22, 1, 'Edificio Central Providencia', 'Av. Providencia 1234', 'EDF-PROV-01', '2025-10-03 15:39:29', '2025-10-03 15:39:29'),
(100, 100, 'Edificio Los Álamos', 'Av. Apoquindo 4500, Las Condes, Santiago', 'ED-ALM-001', '2025-10-06 18:57:28', '2025-10-06 18:57:28'),
(103, 20, 'Edificio Norte', 'Av. Siempre Viva 123 - Torre Norte', NULL, '2025-10-07 17:20:49', '2025-10-07 17:20:49');

-- --------------------------------------------------------

--
-- Table structure for table `emision_gastos_comunes`
--

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
-- Dumping data for table `emision_gastos_comunes`
--

INSERT INTO `emision_gastos_comunes` (`id`, `comunidad_id`, `periodo`, `fecha_vencimiento`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, 15, '2025-01', '2025-01-25', 'emitido', 'Emisión GC comunidad 15, periodo 2025-01', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(2, 12, '2025-03', '2025-03-25', 'emitido', 'Emisión GC comunidad 12, periodo 2025-03', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(3, 6, '2024-12', '2024-12-25', 'borrador', 'Emisión GC comunidad 6, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(4, 3, '2025-02', '2025-02-25', 'borrador', 'Emisión GC comunidad 3, periodo 2025-02', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(5, 10, '2025-02', '2025-02-25', 'cerrado', 'Emisión GC comunidad 10, periodo 2025-02', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(6, 1, '2025-09', '2025-09-25', 'borrador', 'Emisión GC comunidad 1, periodo 2025-09', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(7, 14, '2024-12', '2024-12-25', 'cerrado', 'Emisión GC comunidad 14, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(8, 10, '2024-12', '2024-12-25', 'emitido', 'Emisión GC comunidad 10, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(9, 18, '2025-10', '2025-10-25', 'emitido', 'Emisión GC comunidad 18, periodo 2025-10', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(10, 8, '2025-02', '2025-02-25', 'emitido', 'Emisión GC comunidad 8, periodo 2025-02', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(11, 1, '2025-06', '2025-06-25', 'emitido', 'Emisión GC comunidad 1, periodo 2025-06', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(12, 14, '2025-08', '2025-08-25', 'borrador', 'Emisión GC comunidad 14, periodo 2025-08', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(13, 14, '2025-04', '2025-04-25', 'borrador', 'Emisión GC comunidad 14, periodo 2025-04', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(14, 16, '2025-03', '2025-03-25', 'emitido', 'Emisión GC comunidad 16, periodo 2025-03', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(15, 10, '2025-10', '2025-10-25', 'cerrado', 'Emisión GC comunidad 10, periodo 2025-10', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(16, 3, '2025-07', '2025-07-25', 'emitido', 'Emisión GC comunidad 3, periodo 2025-07', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(17, 1, '2024-12', '2024-12-25', 'cerrado', 'Emisión GC comunidad 1, periodo 2024-12', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(18, 20, '2025-03', '2025-03-25', 'borrador', 'Emisión GC comunidad 20, periodo 2025-03', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(19, 2, '2025-04', '2025-04-25', 'borrador', 'Emisión GC comunidad 2, periodo 2025-04', '2025-10-02 19:03:07', '2025-10-02 19:03:07'),
(20, 7, '2025-08', '2025-08-25', 'emitido', 'Emisión GC comunidad 7, periodo 2025-08', '2025-10-02 19:03:07', '2025-10-02 19:03:07');

-- --------------------------------------------------------

--
-- Stand-in structure for view `emision_gasto_comun`
-- (See below for the actual view)
--
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
-- Stand-in structure for view `emision_gasto_detalle`
-- (See below for the actual view)
--
CREATE TABLE `emision_gasto_detalle` (
);

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
  `glosa` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `extraordinario` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gasto`
--

INSERT INTO `gasto` (`id`, `comunidad_id`, `categoria_id`, `centro_costo_id`, `documento_compra_id`, `fecha`, `monto`, `glosa`, `extraordinario`, `created_at`, `updated_at`) VALUES
(1, 20, 9, 1, 1, '2025-10-01', 460806.00, 'Gasto operativo 1', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 2, 10, 5, 2, '2025-10-01', 250548.00, 'Gasto operativo 2', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 10, 18, 9, 3, '2025-10-01', 182753.00, 'Gasto operativo 3', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 11, 17, 14, 4, '2025-10-01', 332847.00, 'Gasto operativo 4', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 12, 2, 7, 5, '2025-10-01', 303912.00, 'Gasto operativo 5', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 12, 14, 2, 6, '2025-10-01', 491463.00, 'Gasto operativo 6', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 13, 18, 11, 7, '2025-10-01', 299520.00, 'Gasto operativo 7', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 8, 7, 7, 8, '2025-10-01', 149611.00, 'Gasto operativo 8', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 9, 18, 20, 9, '2025-10-01', 117620.00, 'Gasto operativo 9', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 6, 16, 8, 10, '2025-10-01', 204326.00, 'Gasto operativo 10', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 10, 12, 8, 11, '2025-10-01', 447698.00, 'Gasto operativo 11', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 2, 18, 9, 12, '2025-10-01', 206278.00, 'Gasto operativo 12', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 10, 10, 12, 13, '2025-10-01', 326563.00, 'Gasto operativo 13', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 8, 1, 10, 14, '2025-10-01', 476939.00, 'Gasto operativo 14', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 13, 9, 18, 15, '2025-10-01', 95295.00, 'Gasto operativo 15', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 3, 7, 11, 16, '2025-10-01', 194714.00, 'Gasto operativo 16', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 16, 9, 11, 17, '2025-10-01', 311874.00, 'Gasto operativo 17', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 18, 19, 11, 18, '2025-10-01', 193184.00, 'Gasto operativo 18', 0, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 16, 1, 3, 19, '2025-10-01', 245664.00, 'Gasto operativo 19', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 2, 20, 8, 20, '2025-10-01', 433279.00, 'Gasto operativo 20', 1, '2025-10-02 18:19:29', '2025-10-02 18:19:29');

-- --------------------------------------------------------

--
-- Table structure for table `lectura_medidor`
--

CREATE TABLE `lectura_medidor` (
  `id` bigint NOT NULL,
  `medidor_id` bigint NOT NULL,
  `fecha` date NOT NULL,
  `lectura` decimal(12,3) NOT NULL,
  `periodo` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lectura_medidor`
--

INSERT INTO `lectura_medidor` (`id`, `medidor_id`, `fecha`, `lectura`, `periodo`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-09-30', 124.530, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 2, '2025-09-30', 98.270, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 3, '2025-09-30', 143.000, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 4, '2025-09-30', 156.340, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 5, '2025-09-30', 87.150, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(6, 6, '2025-09-30', 74.800, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(7, 7, '2025-09-30', 62.300, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(8, 8, '2025-09-30', 91.550, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(9, 9, '2025-09-30', 120.600, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(10, 10, '2025-09-30', 103.870, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(11, 11, '2025-09-30', 55.900, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(12, 12, '2025-09-30', 66.420, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(13, 13, '2025-09-30', 88.130, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(14, 14, '2025-09-30', 112.800, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(15, 15, '2025-09-30', 99.500, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(16, 16, '2025-09-30', 131.650, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(17, 17, '2025-09-30', 149.200, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(18, 18, '2025-09-30', 76.420, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(19, 19, '2025-09-30', 90.310, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(20, 20, '2025-09-30', 67.000, '2025-09', '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `medidor`
--

CREATE TABLE `medidor` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint DEFAULT NULL,
  `tipo` enum('agua','gas','electricidad') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `es_compartido` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `medidor`
--

INSERT INTO `medidor` (`id`, `comunidad_id`, `unidad_id`, `tipo`, `codigo`, `es_compartido`, `created_at`, `updated_at`) VALUES
(1, 19, 4, 'electricidad', 'MED-001', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 16, 13, 'gas', 'MED-002', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 4, 18, 'electricidad', 'MED-003', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 10, 11, 'electricidad', 'MED-004', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 10, 11, 'agua', 'MED-005', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(6, 5, 10, 'gas', 'MED-006', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(7, 1, 15, 'electricidad', 'MED-007', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(8, 18, 1, 'agua', 'MED-008', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(9, 14, 17, 'gas', 'MED-009', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(10, 8, 7, 'electricidad', 'MED-010', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(11, 13, 2, 'agua', 'MED-011', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(12, 17, 12, 'electricidad', 'MED-012', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(13, 2, 6, 'gas', 'MED-013', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(14, 7, 9, 'agua', 'MED-014', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(15, 6, 5, 'electricidad', 'MED-015', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(16, 15, 3, 'gas', 'MED-016', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(17, 3, 8, 'agua', 'MED-017', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(18, 9, 16, 'electricidad', 'MED-018', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(19, 20, 19, 'gas', 'MED-019', 0, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(20, 11, 14, 'agua', 'MED-020', 1, '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `multa`
--

CREATE TABLE `multa` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `unidad_id` bigint NOT NULL,
  `persona_id` bigint DEFAULT NULL,
  `motivo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','pagada','anulada') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `fecha` date NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `multa`
--

INSERT INTO `multa` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `descripcion`, `monto`, `estado`, `fecha`, `fecha_pago`, `created_at`, `updated_at`) VALUES
(1, 7, 7, 5, 'Infracción 1', 'Descripción de la multa 1', 47953.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(2, 17, 6, 18, 'Infracción 2', 'Descripción de la multa 2', 28418.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(3, 15, 9, 7, 'Infracción 3', 'Descripción de la multa 3', 33945.00, 'pendiente', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(4, 9, 5, 2, 'Infracción 4', 'Descripción de la multa 4', 40177.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(5, 3, 16, 14, 'Infracción 5', 'Descripción de la multa 5', 41843.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(6, 4, 6, 6, 'Infracción 6', 'Descripción de la multa 6', 18771.00, 'pendiente', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(7, 13, 2, 15, 'Infracción 7', 'Descripción de la multa 7', 39377.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(8, 16, 6, 19, 'Infracción 8', 'Descripción de la multa 8', 10075.00, 'pendiente', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(9, 16, 19, 8, 'Infracción 9', 'Descripción de la multa 9', 52550.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(10, 12, 10, 11, 'Infracción 10', 'Descripción de la multa 10', 22113.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(11, 12, 4, 9, 'Infracción 11', 'Descripción de la multa 11', 48335.00, 'pendiente', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(12, 5, 16, 15, 'Infracción 12', 'Descripción de la multa 12', 51374.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(13, 9, 10, 3, 'Infracción 13', 'Descripción de la multa 13', 44744.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(14, 20, 3, 8, 'Infracción 14', 'Descripción de la multa 14', 40828.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(15, 2, 9, 1, 'Infracción 15', 'Descripción de la multa 15', 58139.00, 'anulada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(16, 9, 20, 4, 'Infracción 16', 'Descripción de la multa 16', 10983.00, 'pendiente', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(17, 14, 14, 15, 'Infracción 17', 'Descripción de la multa 17', 45808.00, 'pendiente', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(18, 20, 16, 13, 'Infracción 18', 'Descripción de la multa 18', 56897.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(19, 20, 19, 20, 'Infracción 19', 'Descripción de la multa 19', 14663.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09'),
(20, 3, 15, 12, 'Infracción 20', 'Descripción de la multa 20', 24043.00, 'pagada', '2025-10-01', NULL, '2025-10-02 18:21:09', '2025-10-02 18:21:09');

-- --------------------------------------------------------

--
-- Table structure for table `notificacion_usuario`
--

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
-- Dumping data for table `notificacion_usuario`
--

INSERT INTO `notificacion_usuario` (`id`, `comunidad_id`, `persona_id`, `tipo`, `titulo`, `mensaje`, `leida`, `objeto_tipo`, `objeto_id`, `fecha_creacion`) VALUES
(1, 5, 17, 'alerta', 'Notificación 1', 'Este es el contenido de la notificación 1 para la persona 17.', 1, 'unidad', 11, '2025-10-02 18:42:27'),
(2, 9, 15, 'recordatorio', 'Notificación 2', 'Este es el contenido de la notificación 2 para la persona 15.', 0, 'pago', 14, '2025-10-02 18:42:27'),
(3, 10, 4, 'info', 'Notificación 3', 'Este es el contenido de la notificación 3 para la persona 4.', 0, 'ticket', 1, '2025-10-02 18:42:27'),
(4, 1, 5, 'recordatorio', 'Notificación 4', 'Este es el contenido de la notificación 4 para la persona 5.', 0, 'ticket', 9, '2025-10-02 18:42:27'),
(5, 6, 1, 'recordatorio', 'Notificación 5', 'Este es el contenido de la notificación 5 para la persona 1.', 1, 'soporte', 17, '2025-10-02 18:42:27'),
(6, 3, 13, 'info', 'Notificación 6', 'Este es el contenido de la notificación 6 para la persona 13.', 0, 'soporte', 8, '2025-10-02 18:42:27'),
(7, 2, 3, 'info', 'Notificación 7', 'Este es el contenido de la notificación 7 para la persona 3.', 0, 'unidad', 9, '2025-10-02 18:42:27'),
(8, 3, 18, 'info', 'Notificación 8', 'Este es el contenido de la notificación 8 para la persona 18.', 0, 'pago', 11, '2025-10-02 18:42:27'),
(9, 4, 12, 'info', 'Notificación 9', 'Este es el contenido de la notificación 9 para la persona 12.', 0, 'ticket', 20, '2025-10-02 18:42:27'),
(10, 9, 4, 'info', 'Notificación 10', 'Este es el contenido de la notificación 10 para la persona 4.', 1, 'pago', 14, '2025-10-02 18:42:27'),
(11, 9, 5, 'alerta', 'Notificación 11', 'Este es el contenido de la notificación 11 para la persona 5.', 1, 'pago', 5, '2025-10-02 18:42:27'),
(12, 9, 19, 'recordatorio', 'Notificación 12', 'Este es el contenido de la notificación 12 para la persona 19.', 0, 'soporte', 9, '2025-10-02 18:42:27'),
(13, 2, 17, 'alerta', 'Notificación 13', 'Este es el contenido de la notificación 13 para la persona 17.', 1, 'ticket', 17, '2025-10-02 18:42:27'),
(14, 9, 7, 'recordatorio', 'Notificación 14', 'Este es el contenido de la notificación 14 para la persona 7.', 0, 'pago', 17, '2025-10-02 18:42:27'),
(15, 9, 15, 'recordatorio', 'Notificación 15', 'Este es el contenido de la notificación 15 para la persona 15.', 1, 'soporte', 20, '2025-10-02 18:42:27'),
(16, 6, 3, 'recordatorio', 'Notificación 16', 'Este es el contenido de la notificación 16 para la persona 3.', 1, 'unidad', 16, '2025-10-02 18:42:27'),
(17, 1, 13, 'alerta', 'Notificación 17', 'Este es el contenido de la notificación 17 para la persona 13.', 0, 'unidad', 15, '2025-10-02 18:42:27'),
(18, 6, 6, 'recordatorio', 'Notificación 18', 'Este es el contenido de la notificación 18 para la persona 6.', 1, 'unidad', 3, '2025-10-02 18:42:27'),
(19, 10, 5, 'info', 'Notificación 19', 'Este es el contenido de la notificación 19 para la persona 5.', 1, 'pago', 7, '2025-10-02 18:42:27'),
(20, 8, 3, 'recordatorio', 'Notificación 20', 'Este es el contenido de la notificación 20 para la persona 3.', 0, 'soporte', 9, '2025-10-02 18:42:27');

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
  `medio` enum('transferencia','webpay','khipu','servipag','efectivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `referencia` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `estado` enum('pendiente','aplicado','reversado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pendiente',
  `comprobante_num` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pago`
--

INSERT INTO `pago` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `fecha`, `monto`, `medio`, `referencia`, `estado`, `comprobante_num`, `created_at`, `updated_at`) VALUES
(1, 10, 2, 11, '2025-10-01', 41176.00, 'webpay', 'REF-3506', 'aplicado', 'COMP-8427', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(2, 20, 12, 3, '2025-10-01', 91068.00, 'efectivo', 'REF-2153', 'aplicado', 'COMP-1542', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(3, 13, 2, 2, '2025-10-01', 21663.00, 'transferencia', 'REF-5788', 'aplicado', 'COMP-8853', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(4, 6, 5, 2, '2025-10-01', 77031.00, 'webpay', 'REF-8059', 'pendiente', 'COMP-5875', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(5, 15, 16, 14, '2025-10-01', 76873.00, 'transferencia', 'REF-5265', 'pendiente', 'COMP-4693', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(6, 1, 6, 10, '2025-10-01', 24414.00, 'transferencia', 'REF-9764', 'aplicado', 'COMP-7613', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(7, 1, 11, 15, '2025-10-01', 63021.00, 'webpay', 'REF-7365', 'aplicado', 'COMP-5348', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(8, 18, 18, 13, '2025-10-01', 85989.00, 'webpay', 'REF-1829', 'aplicado', 'COMP-3484', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(9, 1, 18, 2, '2025-10-01', 76226.00, 'transferencia', 'REF-4926', 'aplicado', 'COMP-4976', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(10, 12, 17, 17, '2025-10-01', 70871.00, 'efectivo', 'REF-3537', 'aplicado', 'COMP-4270', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(11, 13, 18, 6, '2025-10-01', 45092.00, 'webpay', 'REF-9479', 'pendiente', 'COMP-6868', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(12, 3, 18, 18, '2025-10-01', 81221.00, 'webpay', 'REF-8996', 'pendiente', 'COMP-7382', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(13, 20, 8, 20, '2025-10-01', 71392.00, 'transferencia', 'REF-1194', 'pendiente', 'COMP-4345', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(14, 13, 10, 1, '2025-10-01', 30685.00, 'transferencia', 'REF-4496', 'pendiente', 'COMP-4496', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(15, 5, 12, 17, '2025-10-01', 88339.00, 'efectivo', 'REF-9485', 'aplicado', 'COMP-6243', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(16, 11, 19, 4, '2025-10-01', 92283.00, 'efectivo', 'REF-1708', 'aplicado', 'COMP-6649', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(17, 7, 4, 17, '2025-10-01', 89551.00, 'transferencia', 'REF-4881', 'aplicado', 'COMP-7680', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(18, 17, 4, 18, '2025-10-01', 31263.00, 'transferencia', 'REF-8889', 'pendiente', 'COMP-8149', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(19, 16, 13, 3, '2025-10-01', 68743.00, 'webpay', 'REF-9784', 'pendiente', 'COMP-5236', '2025-10-02 18:21:25', '2025-10-02 18:21:25'),
(20, 11, 5, 3, '2025-10-01', 40810.00, 'efectivo', 'REF-4823', 'aplicado', 'COMP-6990', '2025-10-02 18:21:25', '2025-10-02 18:21:25');

-- --------------------------------------------------------

--
-- Table structure for table `pago_aplicacion`
--

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
-- Dumping data for table `pago_aplicacion`
--

INSERT INTO `pago_aplicacion` (`id`, `pago_id`, `cuenta_cobro_unidad_id`, `monto`, `prioridad`, `created_at`, `updated_at`) VALUES
(1, 1, 12, 17058.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(2, 2, 4, 26657.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(3, 3, 11, 11616.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(4, 4, 10, 28547.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(5, 5, 2, 15755.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(6, 6, 20, 21222.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(7, 7, 8, 23990.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(8, 8, 19, 22286.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(9, 9, 9, 29346.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(10, 10, 18, 12559.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(11, 11, 6, 13010.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(12, 12, 3, 21486.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(13, 13, 15, 17365.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(14, 14, 18, 20455.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(15, 15, 19, 29705.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(16, 16, 17, 11455.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(17, 17, 9, 22339.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(18, 18, 20, 24222.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(19, 19, 6, 11392.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48'),
(20, 20, 9, 17829.00, 1, '2025-10-02 18:20:48', '2025-10-02 18:20:48');

-- --------------------------------------------------------

--
-- Table structure for table `parametros_cobranza`
--

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
-- Dumping data for table `parametros_cobranza`
--

INSERT INTO `parametros_cobranza` (`id`, `comunidad_id`, `dias_gracia`, `tasa_mora_mensual`, `mora_calculo`, `redondeo`, `interes_max_mensual`, `aplica_interes_sobre`, `created_at`, `updated_at`) VALUES
(1, 1, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 2, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 3, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

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
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`id`, `rut`, `dv`, `nombres`, `apellidos`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, '18514420', '8', 'Patricio', 'Quintanilla', 'pat.quintanilla@duocuc.cl', '+34817829633', 'Rambla Roxana Ortega 5, Zamora, 02237', '2025-10-02 18:00:09', '2025-10-07 12:50:16'),
(2, '11243882', '3', 'Elisabet', 'Robledo', 'marcosblasco@iglesias.es', '+34747 970 941', 'Plaza de Nuria Sosa 66 Puerta 3 , Almería, 85513', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(3, '21141366', '2', 'Dalila', 'Trillo', 'candelarioguardiola@gmail.com', '+34662 265 789', 'Camino de Dolores Álvaro 23 Puerta 6 , Toledo, 78909', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(4, '9793463', '0', 'Isidora', 'Sedano', 'casalsteofilo@requena-bermejo.org', '+34722553671', 'C. Paloma Santiago 72 Piso 1 , Toledo, 04314', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(5, '2569079', '6', 'Sigfrido', 'Molins', 'vinascurro@guillen.com', '+34735 438 670', 'Paseo Lucio Duarte 758 Piso 2 , Lleida, 52993', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(6, '24317602', '6', 'José', 'Álvaro', 'dquiros@cuenca.com', '+34 700 568 329', 'Camino María Pilar Gascón 4 Piso 7 , Ourense, 29204', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(7, '21596168', '0', 'Jordi', 'Piñol', 'graciana71@yahoo.com', '+34 718 30 61 91', 'Callejón Perlita Pérez 92 Piso 8 , Ciudad, 39093', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(8, '17147778', '6', 'Flora', 'Olivares', 'carlosrio@gmail.com', '+34 744255609', 'Plaza de Reynaldo Casanova 4, Salamanca, 60639', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(9, '9974052', '3', 'Lina', 'Alonso', 'elpidio14@yahoo.com', '+34685452794', 'Plaza Gregorio Naranjo 80, Ciudad, 24056', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(10, '11788735', '9', 'Alejandro', 'Barros', 'bguardiola@palomino.com', '+34722 378 565', 'Cañada de Atilio Solana 31, Ciudad, 28746', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(11, '3710552', 'K', 'Almudena', 'Vigil', 'ucolomer@sabater.com', '+34 727175045', 'Urbanización de Mohamed Santiago 57, Jaén, 57332', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(12, '20045825', '7', 'Fortunata', 'Morata', 'dionisia40@ribas-cerda.org', '+34 712 21 98 21', 'Ronda Vilma Pardo 5, Ceuta, 00814', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(13, '4555786', '3', 'Dafne', 'Bertrán', 'chidalgo@ortega-villalba.es', '+34 809763799', 'Rambla de Teodora Águila 307, Navarra, 06990', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(14, '8604517', '6', 'Hernando', 'Español', 'alfonsopinedo@elorza-francisco.com', '+34912 51 64 52', 'Callejón de Susanita Arce 94 Apt. 22 , Barcelona, 60790', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(15, '12651003', '9', 'Lope', 'Conesa', 'acunarosario@barral.es', '+34674 39 47 51', 'Plaza de Manolo Acosta 81 Puerta 6 , Burgos, 28744', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(16, '16222694', '0', 'Ricarda', 'Alvarez', 'domingo91@hotmail.com', '+34 648 983 048', 'Alameda Rufina Ferrán 36 Piso 7 , Vizcaya, 64870', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(17, '14584777', 'K', 'Albino', 'Nicolás', 'salomeduran@hotmail.com', '+34950 315 479', 'Alameda Manu Calatayud 19 Puerta 6 , Albacete, 85684', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(18, '5163812', '3', 'Nidia', 'Santiago', 'xmorata@raya.net', '+34 718 536 165', 'Alameda Elba Torrents 206 Apt. 73 , Zamora, 81227', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(19, '4439658', '0', 'Candelas', 'Berenguer', 'marianela97@acuna.com', '+34994 64 38 76', 'Alameda de Iker Aguirre 31 Puerta 5 , Ávila, 19392', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(20, '13051081', '7', 'Jenny', 'Carnero', 'goyoarias@yahoo.com', '+34 706 33 85 67', 'Urbanización Mohamed Soriano 8, Salamanca, 19993', '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(21, '12345672', '9', 'Juan Carlos', 'Pérez González', 'nuevousuari2o@ejemplo.com', NULL, NULL, '2025-10-03 14:34:33', '2025-10-03 14:34:33'),
(100, '12345678', '9', 'Juan Carlos', 'González Pérez', 'juan.gonzalez@email.com', '+56912345678', 'Calle Principal 123', '2025-10-06 13:28:58', '2025-10-06 13:28:58'),
(101, '23456789', '0', 'María Elena', 'Rodríguez Silva', 'maria.rodriguez@email.com', '+56923456789', 'Avenida Central 456', '2025-10-06 13:28:58', '2025-10-06 13:28:58'),
(102, '34567890', '1', 'Pedro Antonio', 'Martínez López', 'pedro.martinez@email.com', '+56934567890', 'Pasaje Los Robles 789', '2025-10-06 13:28:58', '2025-10-06 13:28:58'),
(103, '45678901', '2', 'Ana Sofía', 'Fernández Torres', 'ana.fernandez@email.com', '+56945678901', 'Calle Las Flores 321', '2025-10-06 13:28:58', '2025-10-06 13:28:58'),
(104, '56789012', '3', 'Luis Alberto', 'Muñoz Vargas', 'luis.munoz@email.com', '+56956789012', 'Avenida Los Pinos 654', '2025-10-06 13:28:58', '2025-10-06 13:28:58'),
(105, '67890123', '4', 'Carmen Gloria', 'Sánchez Rojas', 'carmen.sanchez@email.com', '+56967890123', 'Paseo Las Palmas 987', '2025-10-06 13:29:04', '2025-10-06 13:29:04'),
(106, '78901234', '5', 'Roberto Carlos', 'Díaz Hernández', 'roberto.diaz@email.com', '+56978901234', 'Calle Los Álamos 147', '2025-10-06 13:29:04', '2025-10-06 13:29:04'),
(107, '89012345', '6', 'Patricia Isabel', 'Gómez Castro', 'patricia.gomez@email.com', '+56989012345', 'Avenida Las Acacias 258', '2025-10-06 13:29:04', '2025-10-06 13:29:04'),
(108, '90123456', '7', 'Francisco Javier', 'Ramírez Flores', 'francisco.ramirez@email.com', '+56990123456', 'Pasaje Los Cipreses 369', '2025-10-06 13:29:04', '2025-10-06 13:29:04'),
(109, '11223344', '8', 'Claudia Andrea', 'Morales Espinoza', 'claudia.morales@email.com', '+56911223344', 'Calle Los Naranjos 741', '2025-10-06 13:29:09', '2025-10-06 13:29:09'),
(110, '22334455', '9', 'Andrés Felipe', 'Contreras Vega', 'andres.contreras@email.com', '+56922334455', 'Avenida Los Cerezos 852', '2025-10-06 13:29:09', '2025-10-06 13:29:09'),
(111, '33445566', 'K', 'Gabriela Alejandra', 'Núñez Ponce', 'gabriela.nunez@email.com', '+56933445566', 'Pasaje Los Laureles 963', '2025-10-06 13:29:09', '2025-10-06 13:29:09'),
(112, '55555555', '5', 'Ana', 'Prueba', 'ana.prueba@demo.cl', '+56 9 11111111', 'Calle Falsa 123', '2025-10-06 18:21:40', '2025-10-06 18:21:40'),
(113, '66666666', '6', 'Bruno', 'Demo', 'bruno.demo@demo.cl', '+56 9 22222222', 'Av. Siempre Viva 742', '2025-10-06 18:21:40', '2025-10-06 18:21:40'),
(114, '77777777', '7', 'Carla', 'Test', 'carla.test@demo.cl', '+56 9 33333333', 'Ruta S/N', '2025-10-06 18:21:40', '2025-10-06 18:21:40');

-- --------------------------------------------------------

--
-- Table structure for table `proveedor`
--

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
-- Dumping data for table `proveedor`
--

INSERT INTO `proveedor` (`id`, `comunidad_id`, `rut`, `dv`, `razon_social`, `giro`, `email`, `telefono`, `direccion`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, '1668344', '2', 'Carranza, Izquierdo and Bernal Ltda.', 'Scientist, physiological', 'iaranda@romero.es', '+34731 01 93 99', 'Via Teodora Gilabert 507 Apt. 82 , Burgos, 46465', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(2, 6, '23515615', '6', 'Godoy LLC Ltda.', 'Training and development officer', 'lgomez@ferrando.com', '+34 705 082 873', 'Acceso de Aurelia Landa 12, León, 96566', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(3, 13, '15190837', '3', 'Arroyo-Campillo Ltda.', 'Education officer, community', 'dimas19@cazorla.com', '+34 837 22 10 28', 'Ronda de Álvaro Delgado 10, Murcia, 36699', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(4, 3, '17829130', '0', 'Gracia, Pinto and Tello Ltda.', 'Occupational psychologist', 'goyoquesada@jurado-yanez.com', '+34733254507', 'Pasadizo Ángela Agustí 509 Piso 0 , Cantabria, 32363', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(5, 14, '8745088', '0', 'Lucas-Ibáñez Ltda.', 'Exhibition designer', 'naguilar@bas.com', '+34745 43 45 87', 'Urbanización Esperanza Garrido 90 Puerta 0 , Huelva, 81567', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(6, 9, '21074587', '4', 'Gallo, Egea and Valbuena Ltda.', 'Engineer, energy', 'hectorpatino@lluch.com', '+34 702 322 985', 'Rambla Atilio Grande 683 Apt. 65 , Segovia, 98403', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(7, 18, '16764395', '7', 'Córdoba Ltd Ltda.', 'Garment/textile technologist', 'lara58@calderon.com', '+34730 788 387', 'Avenida Candelaria Gascón 30, Santa Cruz de Tenerife, 87899', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(8, 11, '15494654', '3', 'Luna Ltd Ltda.', 'Tax inspector', 'qrivas@villaverde.net', '+34855650887', 'Glorieta de Íngrid Benítez 145 Apt. 64 , Tarragona, 03296', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(9, 6, '22835711', '1', 'Arnau-Mendoza Ltda.', 'Insurance broker', 'lastraanselmo@nogues.com', '+34737965563', 'Urbanización Beatriz Alfonso 66, Pontevedra, 61350', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(10, 20, '11474595', '2', 'Salamanca Inc Ltda.', 'Commercial/residential surveyor', 'oteroedgar@sastre-munoz.es', '+34933 700 560', 'Cuesta de Rosario Valenzuela 66 Apt. 22 , Navarra, 61669', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(11, 2, '10392877', 'K', 'Oller-Vilaplana Ltda.', 'Ship broker', 'juliavalero@almagro-luna.es', '+34987 27 51 76', 'C. Serafina Borja 1 Piso 3 , Palencia, 22723', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(12, 10, '6298524', '0', 'Trujillo, Leon and Palacio Ltda.', 'Scientist, research (maths)', 'valentinamurillo@guillen.net', '+34719 906 951', 'Calle de Gabriel Salinas 1 Apt. 96 , Baleares, 09978', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(13, 10, '1573846', '4', 'Cabañas, Andrés and Barberá Ltda.', 'Outdoor activities/education manager', 'fuertesbruno@roma.es', '+34 712229870', 'Ronda Andrés Felipe Barreda 900 Puerta 8 , Cuenca, 73860', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(14, 6, '18004790', '5', 'Niño PLC Ltda.', 'Travel agency manager', 'chamorromodesta@villalonga.es', '+34 875057627', 'Cañada de Jimena Alcántara 40 Puerta 0 , La Coruña, 26687', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(15, 17, '5826803', '8', 'Rivas LLC Ltda.', 'Designer, industrial/product', 'anacleto52@trujillo.es', '+34 700 18 98 64', 'Rambla José María Zorrilla 18, Tarragona, 40316', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(16, 16, '5900452', '2', 'Ureña LLC Ltda.', 'Engineer, civil (contracting)', 'gvillalba@sevillano-girona.net', '+34620904969', 'Callejón Che Patiño 3, Cuenca, 40987', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(17, 18, '4754134', '4', 'Ballester LLC Ltda.', 'Claims inspector/assessor', 'yayllon@nogueira.com', '+34 974609521', 'Alameda de Rafael Acuña 319 Apt. 45 , Toledo, 14095', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(18, 20, '14654064', '3', 'Mayoral Ltd Ltda.', 'Scientist, marine', 'wbayona@tapia.com', '+34 905851301', 'Plaza de Juliana Castilla 18 Puerta 3 , Guadalajara, 54238', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(19, 14, '8717061', '6', 'Martorell, Calzada and Gallo Ltda.', 'Tour manager', 'olmoagata@blanes-armas.es', '+34808 85 89 85', 'Alameda de Sabas Artigas 27, Cuenca, 87978', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(20, 8, '23656610', '2', 'Ropero and Sons Ltda.', 'Rural practice surveyor', 'zuritaartemio@manrique-guardiola.org', '+34742 35 81 55', 'Pasaje de Andrés Agullo 1 Piso 7 , Almería, 69938', 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09');

-- --------------------------------------------------------

--
-- Table structure for table `registro_conserjeria`
--

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
-- Dumping data for table `registro_conserjeria`
--

INSERT INTO `registro_conserjeria` (`id`, `comunidad_id`, `fecha_hora`, `usuario_id`, `evento`, `detalle`, `created_at`) VALUES
(1, 3, '2025-09-06 16:42:27', 15, 'entrega', 'Registro 1 de conserjería relacionado al evento entrega.', '2025-10-02 18:42:27'),
(2, 12, '2025-09-28 06:42:27', 17, 'otro', 'Registro 2 de conserjería relacionado al evento otro.', '2025-10-02 18:42:27'),
(3, 20, '2025-09-12 00:42:27', 12, 'visita', 'Registro 3 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(4, 17, '2025-09-21 05:42:27', 6, 'visita', 'Registro 4 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(5, 9, '2025-09-24 16:42:27', 4, 'retiro', 'Registro 5 de conserjería relacionado al evento retiro.', '2025-10-02 18:42:27'),
(6, 18, '2025-09-14 09:42:27', 10, 'otro', 'Registro 6 de conserjería relacionado al evento otro.', '2025-10-02 18:42:27'),
(7, 12, '2025-09-07 16:42:27', 1, 'visita', 'Registro 7 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(8, 8, '2025-09-20 05:42:27', 19, 'visita', 'Registro 8 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(9, 14, '2025-09-04 01:42:27', 19, 'otro', 'Registro 9 de conserjería relacionado al evento otro.', '2025-10-02 18:42:27'),
(10, 13, '2025-09-07 00:42:27', 5, 'visita', 'Registro 10 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(11, 18, '2025-09-12 15:42:27', 8, 'reporte', 'Registro 11 de conserjería relacionado al evento reporte.', '2025-10-02 18:42:27'),
(12, 4, '2025-09-22 13:42:27', 1, 'reporte', 'Registro 12 de conserjería relacionado al evento reporte.', '2025-10-02 18:42:27'),
(13, 4, '2025-09-04 18:42:27', 12, 'visita', 'Registro 13 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(14, 13, '2025-09-17 04:42:27', 18, 'otro', 'Registro 14 de conserjería relacionado al evento otro.', '2025-10-02 18:42:27'),
(15, 11, '2025-09-11 15:42:27', 8, 'visita', 'Registro 15 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(16, 15, '2025-09-29 22:42:27', 7, 'reporte', 'Registro 16 de conserjería relacionado al evento reporte.', '2025-10-02 18:42:27'),
(17, 1, '2025-09-06 04:42:27', 18, 'otro', 'Registro 17 de conserjería relacionado al evento otro.', '2025-10-02 18:42:27'),
(18, 5, '2025-09-20 23:42:27', 7, 'visita', 'Registro 18 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27'),
(19, 1, '2025-09-16 17:42:27', 14, 'reporte', 'Registro 19 de conserjería relacionado al evento reporte.', '2025-10-02 18:42:27'),
(20, 2, '2025-09-16 00:42:27', 4, 'visita', 'Registro 20 de conserjería relacionado al evento visita.', '2025-10-02 18:42:27');

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
  `estado` enum('solicitada','aprobada','rechazada','cancelada','cumplida') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'solicitada',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reserva_amenidad`
--

INSERT INTO `reserva_amenidad` (`id`, `comunidad_id`, `amenidad_id`, `unidad_id`, `persona_id`, `inicio`, `fin`, `estado`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 5, '2025-10-05 15:00:00', '2025-10-05 18:00:00', 'aprobada', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 1, 2, 4, 6, '2025-10-10 10:00:00', '2025-10-10 12:00:00', 'solicitada', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 2, 3, 5, 7, '2025-10-12 20:00:00', '2025-10-12 22:00:00', 'rechazada', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 3, 1, 6, 9, '2025-10-07 17:00:00', '2025-10-07 19:00:00', 'cumplida', '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `rol_sistema`
--

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
-- Dumping data for table `rol_sistema`
--

INSERT INTO `rol_sistema` (`id`, `codigo`, `nombre`, `descripcion`, `nivel_acceso`, `es_rol_sistema`, `created_at`) VALUES
(1, 'superadmin', 'Superadmin', 'Acceso total a toda la plataforma', 100, 1, '2025-10-02 18:53:13'),
(2, 'admin_comunidad', 'Admin Comunidad', 'Administrador de una comunidad específica', 80, 0, '2025-10-02 18:53:13'),
(3, 'conserje', 'Conserje', 'Registro de eventos, visitas y bitácoras', 50, 0, '2025-10-02 18:53:13'),
(4, 'contador', 'Contador', 'Gestión financiera y de gastos comunes', 70, 0, '2025-10-02 18:53:13'),
(5, 'proveedor_servicio', 'Proveedor Servicio', 'Emisión de documentos de compra', 30, 0, '2025-10-02 18:53:13'),
(6, 'residente', 'Residente', 'Acceso a pagos, reservas y notificaciones', 10, 0, '2025-10-02 18:53:13'),
(7, 'propietario', 'Propietario', 'Dueño de una unidad habitacional', 20, 0, '2025-10-02 18:53:13'),
(8, 'inquilino', 'Inquilino', 'Arrendatario registrado', 15, 0, '2025-10-02 18:53:13'),
(9, 'auditor_externo', 'Auditor Externo', 'Acceso de solo lectura a informes', 40, 1, '2025-10-02 18:53:13'),
(10, 'soporte_tecnico', 'Soporte Tecnico', 'Soporte técnico interno', 90, 1, '2025-10-02 18:53:13'),
(11, 'tesorero', 'Tesorero', 'Gestión de cobros y cuentas', 60, 0, '2025-10-02 18:53:13'),
(12, 'moderador_comunidad', 'Moderador Comunidad', 'Modera eventos y publicaciones', 35, 0, '2025-10-02 18:53:13'),
(13, 'secretario', 'Secretario', 'Apoyo documental y comunicacional', 25, 0, '2025-10-02 18:53:13'),
(14, 'presidente_comite', 'Presidente Comite', 'Lidera el comité de administración', 85, 0, '2025-10-02 18:53:13'),
(15, 'revisor_cuentas', 'Revisor Cuentas', 'Revisión de balances y movimientos', 45, 0, '2025-10-02 18:53:13'),
(16, 'coordinador_reservas', 'Coordinador Reservas', 'Gestión de amenidades comunes', 20, 0, '2025-10-02 18:53:13'),
(17, 'sindico', 'Sindico', 'Rol legal según reglamento', 75, 0, '2025-10-02 18:53:13'),
(18, 'admin_externo', 'Admin Externo', 'Administrador contratado', 70, 1, '2025-10-02 18:53:13'),
(19, 'visitante_autorizado', 'Visitante Autorizado', 'Acceso temporal', 5, 0, '2025-10-02 18:53:13'),
(20, 'sistema', 'Sistema', 'Acciones automáticas del sistema', 100, 1, '2025-10-02 18:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `sesion_usuario`
--

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
-- Dumping data for table `sesion_usuario`
--

INSERT INTO `sesion_usuario` (`id`, `usuario_id`, `ip_address`, `user_agent`, `data`, `last_activity`, `created_at`) VALUES
('1', 19, '195.62.237.142', 'Mozilla/5.0 (iPad; CPU iPad OS 3_1_3 like Mac OS X) AppleWebKit/531.1 (KHTML, like Gecko) FxiOS/13.1g4003.0 Mobile/83U012 Safari/531.1', NULL, '2025-10-02 09:45:10', '2025-10-02 18:42:27'),
('2', 6, '172.210.206.43', 'Mozilla/5.0 (compatible; MSIE 6.0; Windows NT 4.0; Trident/4.1)', NULL, '2025-10-02 03:57:00', '2025-10-02 18:42:27'),
('3', 10, '22.136.83.159', 'Mozilla/5.0 (X11; Linux x86_64; rv:1.9.6.20) Gecko/2018-01-07 20:17:03 Firefox/7.0', NULL, '2025-10-02 09:24:22', '2025-10-02 18:42:27'),
('4', 9, '113.11.30.223', 'Mozilla/5.0 (Macintosh; PPC Mac OS X 10_8_5) AppleWebKit/535.0 (KHTML, like Gecko) Chrome/32.0.889.0 Safari/535.0', NULL, '2025-10-01 21:06:11', '2025-10-02 18:42:27'),
('5', 2, '185.233.20.15', 'Mozilla/5.0 (Windows; U; Windows NT 6.0; Trident/3.0; en-US)', NULL, '2025-10-02 07:12:55', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `tarifa_consumo`
--

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
-- Dumping data for table `tarifa_consumo`
--

INSERT INTO `tarifa_consumo` (`id`, `comunidad_id`, `tipo`, `periodo_desde`, `periodo_hasta`, `precio_por_unidad`, `cargo_fijo`, `created_at`, `updated_at`) VALUES
(1, 1, 'agua', '2025-08', NULL, 0.650000, 1800.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 2, 'gas', '2025-08', NULL, 1.200000, 2200.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 3, 'electricidad', '2025-08', NULL, 0.950000, 2500.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 4, 'agua', '2025-08', NULL, 0.700000, 1900.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 5, 'gas', '2025-08', NULL, 1.300000, 2000.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(6, 6, 'electricidad', '2025-08', NULL, 1.000000, 2600.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(7, 7, 'agua', '2025-08', NULL, 0.600000, 1700.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(8, 8, 'gas', '2025-08', NULL, 1.250000, 2100.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(9, 9, 'electricidad', '2025-08', NULL, 0.900000, 2400.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(10, 10, 'agua', '2025-08', NULL, 0.680000, 1850.00, '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Stand-in structure for view `ticket`
-- (See below for the actual view)
--
CREATE TABLE `ticket` (
);

-- --------------------------------------------------------

--
-- Table structure for table `ticket_soporte`
--

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
-- Dumping data for table `ticket_soporte`
--

INSERT INTO `ticket_soporte` (`id`, `comunidad_id`, `unidad_id`, `categoria`, `titulo`, `descripcion`, `estado`, `prioridad`, `asignado_a`, `attachments_json`, `created_at`, `updated_at`) VALUES
(1, 5, 8, 'Mantención', 'Problema con portón eléctrico', 'El portón no abre con el control remoto.', 'abierto', 'alta', 3, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(2, 3, 5, 'Limpieza', 'Basura acumulada', 'Hay basura acumulada en el pasillo del tercer piso.', 'en_progreso', 'media', 7, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(3, 7, 2, 'Ascensor', 'Ascensor detenido', 'El ascensor del edificio B no funciona desde ayer.', 'cerrado', 'alta', 4, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(4, 10, 12, 'Infraestructura', 'Grieta en el muro', 'Se detectó una grieta en el muro del pasillo.', 'abierto', 'baja', NULL, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(5, 2, 3, 'Seguridad', 'Cámara sin funcionamiento', 'La cámara de seguridad de la entrada está apagada.', 'en_progreso', 'alta', 2, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(6, 4, 9, 'Mantención', 'Fuga de agua', 'Se detecta fuga en el estacionamiento.', 'resuelto', 'media', 6, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(7, 6, NULL, 'Iluminación', 'Luces quemadas', 'Pasillos sin luz en torre 2.', 'cerrado', 'media', 5, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(8, 8, 11, 'Jardinería', 'Árbol caído', 'Árbol bloqueando entrada de vehículos.', 'abierto', 'alta', 3, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(9, 1, 4, 'Ascensor', 'Puerta trabada', 'La puerta del ascensor se tranca al cerrar.', 'en_progreso', 'alta', 7, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(10, 2, 5, 'Mantención', 'Pérdida de presión', 'Problemas con presión de agua en el piso 7.', 'cerrado', 'media', 4, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(11, 5, 1, 'Seguridad', 'Reja dañada', 'Reja perimetral fue forzada.', 'resuelto', 'alta', 8, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(12, 9, 13, 'Limpieza', 'Vidrios sucios', 'Los ventanales del primer piso no han sido limpiados.', 'abierto', 'baja', NULL, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(13, 3, NULL, 'Infraestructura', 'Humedad en muro', 'Manchas de humedad en pasillos comunes.', 'en_progreso', 'media', 6, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(14, 7, 7, 'Ascensor', 'Ruidos extraños', 'El ascensor hace ruido al moverse.', 'cerrado', 'baja', 5, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(15, 6, 10, 'Jardinería', 'Plantas secas', 'Falta riego en áreas verdes.', 'resuelto', 'media', 1, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(16, 8, 6, 'Mantención', 'Revisión de gas', 'Solicitud de revisión preventiva de red de gas.', 'abierto', 'alta', NULL, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(17, 10, 2, 'Seguridad', 'Puerta de emergencia abierta', 'Puerta trasera permanece abierta de noche.', 'cerrado', 'alta', 2, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(18, 1, NULL, 'Infraestructura', 'Filtración en techo', 'Gotea en el hall de acceso.', 'en_progreso', 'alta', 3, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(19, 4, 14, 'Iluminación', 'Timbre sin sonido', 'El timbre de conserjería no suena.', 'abierto', 'media', 6, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27'),
(20, 2, 12, 'Ascensor', 'No marca piso', 'Pantalla no muestra el piso actual.', 'resuelto', 'baja', 5, '[]', '2025-10-02 18:42:27', '2025-10-02 18:42:27');

-- --------------------------------------------------------

--
-- Table structure for table `titulares_unidad`
--

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
-- Dumping data for table `titulares_unidad`
--

INSERT INTO `titulares_unidad` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `tipo`, `desde`, `hasta`, `porcentaje`, `created_at`, `updated_at`) VALUES
(1, 12, 1, 8, 'arrendatario', '2020-10-15', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 17, 2, 15, 'arrendatario', '2021-12-03', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 20, 3, 5, 'arrendatario', '2022-05-25', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 12, 4, 3, 'arrendatario', '2021-09-25', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 19, 5, 10, 'propietario', '2022-07-12', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 13, 6, 9, 'arrendatario', '2020-11-24', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 14, 7, 17, 'propietario', '2021-07-20', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 6, 8, 9, 'arrendatario', '2022-11-15', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 6, 9, 18, 'propietario', '2022-08-26', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 18, 10, 6, 'arrendatario', '2023-03-01', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 15, 11, 5, 'arrendatario', '2022-05-06', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 15, 12, 17, 'arrendatario', '2023-02-08', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 16, 13, 3, 'propietario', '2021-01-18', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 15, 14, 20, 'arrendatario', '2022-02-18', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 13, 15, 11, 'arrendatario', '2022-10-04', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 6, 16, 3, 'propietario', '2021-07-17', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 20, 17, 14, 'arrendatario', '2022-02-06', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 10, 18, 18, 'arrendatario', '2022-01-01', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 19, 19, 1, 'propietario', '2021-10-23', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 8, 20, 19, 'arrendatario', '2022-08-19', NULL, 100.00, '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(100, 1, 100, 100, 'propietario', '2023-01-15', NULL, 100.00, '2025-10-06 13:29:35', '2025-10-06 13:29:35'),
(101, 1, 101, 101, 'propietario', '2022-06-01', NULL, 100.00, '2025-10-06 13:29:43', '2025-10-06 13:29:43'),
(102, 1, 101, 102, 'arrendatario', '2024-01-01', NULL, 100.00, '2025-10-06 13:29:43', '2025-10-06 13:29:43'),
(103, 1, 102, 103, 'arrendatario', '2023-03-01', '2024-12-31', 100.00, '2025-10-06 13:29:55', '2025-10-06 13:29:55'),
(104, 1, 103, 104, 'propietario', '2023-08-10', NULL, 50.00, '2025-10-06 13:30:04', '2025-10-06 13:30:04'),
(105, 1, 103, 105, 'propietario', '2023-08-10', NULL, 50.00, '2025-10-06 13:30:04', '2025-10-06 13:30:04'),
(106, 1, 104, 106, 'propietario', '2024-02-20', NULL, 100.00, '2025-10-06 13:30:04', '2025-10-06 13:30:04'),
(107, 2, 105, 105, 'propietario', '2022-11-05', NULL, 100.00, '2025-10-06 13:30:12', '2025-10-06 13:30:12'),
(108, 2, 106, 106, 'arrendatario', '2023-04-12', NULL, 100.00, '2025-10-06 13:30:12', '2025-10-06 13:30:12'),
(109, 2, 107, 107, 'propietario', '2023-09-22', NULL, 100.00, '2025-10-06 13:30:12', '2025-10-06 13:30:12'),
(110, 2, 108, 108, 'arrendatario', '2024-06-01', NULL, 100.00, '2025-10-06 13:30:12', '2025-10-06 13:30:12'),
(111, 3, 109, 109, 'propietario', '2023-05-18', NULL, 100.00, '2025-10-06 13:30:20', '2025-10-06 13:30:20'),
(112, 3, 110, 110, 'arrendatario', '2024-03-10', NULL, 100.00, '2025-10-06 13:30:20', '2025-10-06 13:30:20'),
(113, 3, 111, 111, 'propietario', '2022-12-01', NULL, 100.00, '2025-10-06 13:30:20', '2025-10-06 13:30:20'),
(114, 3, 111, 100, 'arrendatario', '2024-08-15', NULL, 100.00, '2025-10-06 13:30:20', '2025-10-06 13:30:20');

-- --------------------------------------------------------

--
-- Stand-in structure for view `titularidad_unidad`
-- (See below for the actual view)
--
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
-- Table structure for table `torre`
--

CREATE TABLE `torre` (
  `id` bigint NOT NULL,
  `edificio_id` bigint NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `torre`
--

INSERT INTO `torre` (`id`, `edificio_id`, `nombre`, `codigo`, `created_at`, `updated_at`) VALUES
(1, 1, 'Torre B', 'T001', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(2, 2, 'Torre C', 'T002', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(3, 3, 'Torre D', 'T003', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(4, 4, 'Torre E', 'T004', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(5, 5, 'Torre F', 'T005', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(6, 6, 'Torre G', 'T006', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(7, 7, 'Torre H', 'T007', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(8, 8, 'Torre I', 'T008', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(9, 9, 'Torre J', 'T009', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(10, 10, 'Torre K', 'T010', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(11, 11, 'Torre L', 'T011', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(12, 12, 'Torre M', 'T012', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(13, 13, 'Torre N', 'T013', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(14, 14, 'Torre O', 'T014', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(15, 15, 'Torre P', 'T015', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(16, 16, 'Torre Q', 'T016', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(17, 17, 'Torre R', 'T017', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(18, 18, 'Torre S', 'T018', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(19, 19, 'Torre T', 'T019', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(20, 20, 'Torre U', 'T020', '2025-10-02 18:19:29', '2025-10-02 18:19:29'),
(21, 1, 'Torre Test A', 'T101', '2025-10-06 18:23:54', '2025-10-06 18:23:54'),
(100, 100, 'Torre A', 'TA-001', '2025-10-06 18:57:30', '2025-10-06 18:57:30'),
(101, 100, 'Torre B', 'TB-001', '2025-10-06 18:57:30', '2025-10-06 18:57:30'),
(102, 100, 'Torre C', 'TC-001', '2025-10-06 18:57:30', '2025-10-06 18:57:30'),
(103, 100, 'Torre D', 'TD-001', '2025-10-06 18:57:30', '2025-10-06 18:57:30'),
(104, 100, 'Torre E', 'TE-001', '2025-10-06 18:57:30', '2025-10-06 18:57:30'),
(106, 15, 'Torre A', 'TA', '2025-10-07 17:21:11', '2025-10-07 17:21:11');

-- --------------------------------------------------------

--
-- Table structure for table `uf_valor`
--

CREATE TABLE `uf_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `uf_valor`
--

INSERT INTO `uf_valor` (`fecha`, `valor`) VALUES
('2025-09-28', 36500.1234),
('2025-09-29', 36510.5678),
('2025-09-30', 36520.0000),
('2025-10-01', 36525.1234),
('2025-10-02', 36530.4567),
('2025-10-03', 39485.6500);

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
(1, 16, 7, 7, 'U001', 0.021523, 65.88, 7.60, 'B001', 'E001', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(2, 20, 3, 13, 'U002', 0.010362, 70.73, 13.13, 'B002', 'E002', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(3, 15, 18, 2, 'U003', 0.006624, 118.30, 18.93, 'B003', 'E003', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(4, 10, 14, 9, 'U004', 0.017598, 75.79, 9.82, 'B004', 'E004', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(5, 2, 5, 4, 'U005', 0.018412, 58.61, 5.42, 'B005', 'E005', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(6, 2, 5, 13, 'U006', 0.009389, 66.45, 19.46, 'B006', 'E006', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(7, 2, 5, 11, 'U007', 0.017770, 87.06, 14.33, 'B007', 'E007', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(8, 18, 11, 2, 'U008', 0.020005, 74.86, 9.55, 'B008', 'E008', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(9, 4, 13, 6, 'U009', 0.024811, 42.86, 5.36, 'B009', 'E009', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(10, 15, 18, 7, 'U010', 0.023610, 54.17, 14.47, 'B010', 'E010', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(11, 18, 17, 20, 'U011', 0.022403, 45.74, 6.71, 'B011', 'E011', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(12, 2, 5, 16, 'U012', 0.017768, 85.03, 5.80, 'B012', 'E012', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(13, 14, 20, 4, 'U013', 0.020766, 95.13, 8.55, 'B013', 'E013', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(14, 7, 15, 8, 'U014', 0.015158, 64.60, 6.68, 'B014', 'E014', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(15, 18, 11, 7, 'U015', 0.019276, 111.38, 15.99, 'B015', 'E015', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(16, 2, 5, 5, 'U016', 0.005108, 117.70, 15.11, 'B016', 'E016', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(17, 7, 15, 7, 'U017', 0.024073, 98.57, 5.21, 'B017', 'E017', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(18, 18, 10, 14, 'U018', 0.022069, 75.53, 13.53, 'B018', 'E018', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(19, 12, 16, 17, 'U019', 0.013526, 49.13, 14.08, 'B019', 'E019', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(20, 12, 16, 2, 'U020', 0.015334, 63.84, 17.38, 'B020', 'E020', 1, '2025-10-02 18:19:29', '2025-10-03 15:34:14'),
(25, 1, 21, NULL, '101', 0.025000, 65.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(26, 1, 21, NULL, '102', 0.025000, 65.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(27, 1, 21, NULL, '103', 0.025000, 70.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(28, 1, 21, NULL, '201', 0.030000, 80.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(29, 1, 21, NULL, '202', 0.030000, 80.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(30, 1, 21, NULL, '203', 0.030000, 85.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(31, 1, 21, NULL, '301', 0.035000, 90.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(32, 1, 21, NULL, '302', 0.035000, 90.00, NULL, NULL, NULL, 1, '2025-10-03 15:40:30', '2025-10-03 15:42:49'),
(100, 1, 1, 1, 'DEPTO-101', 0.025000, 85.50, 12.00, 'BOD-101', 'EST-101', 1, '2025-10-06 13:29:16', '2025-10-06 13:29:16'),
(101, 1, 1, 1, 'DEPTO-102', 0.025000, 92.30, 15.50, 'BOD-102', 'EST-102', 1, '2025-10-06 13:29:16', '2025-10-06 13:29:16'),
(102, 1, 1, 1, 'DEPTO-103', 0.025000, 78.80, 10.00, 'BOD-103', 'EST-103', 1, '2025-10-06 13:29:16', '2025-10-06 13:29:16'),
(103, 1, 1, 1, 'DEPTO-201', 0.025000, 85.50, 12.00, 'BOD-201', 'EST-201', 1, '2025-10-06 13:29:16', '2025-10-06 13:29:16'),
(104, 1, 1, 1, 'DEPTO-202', 0.025000, 92.30, 15.50, 'BOD-202', 'EST-202', 1, '2025-10-06 13:29:16', '2025-10-06 13:29:16'),
(105, 2, 5, 5, 'CASA-A1', 0.033333, 120.00, 25.00, 'BOD-A1', 'EST-A1', 1, '2025-10-06 13:29:22', '2025-10-06 13:29:22'),
(106, 2, 5, 5, 'CASA-A2', 0.033333, 115.50, 20.00, 'BOD-A2', 'EST-A2', 1, '2025-10-06 13:29:22', '2025-10-06 13:29:22'),
(107, 2, 5, 5, 'CASA-B1', 0.033333, 135.80, 30.00, 'BOD-B1', 'EST-B1', 1, '2025-10-06 13:29:22', '2025-10-06 13:29:22'),
(108, 2, 5, 5, 'CASA-B2', 0.033333, 128.40, 28.00, 'BOD-B2', 'EST-B2', 1, '2025-10-06 13:29:22', '2025-10-06 13:29:22'),
(109, 3, 9, 9, 'TORRE-A-301', 0.020000, 68.90, 8.50, 'BOD-301', 'EST-301', 1, '2025-10-06 13:29:27', '2025-10-06 13:29:27'),
(110, 3, 9, 9, 'TORRE-A-302', 0.020000, 72.40, 9.00, 'BOD-302', 'EST-302', 1, '2025-10-06 13:29:27', '2025-10-06 13:29:27'),
(111, 3, 9, 9, 'TORRE-B-401', 0.020000, 65.30, 7.80, 'BOD-401', 'EST-401', 1, '2025-10-06 13:29:27', '2025-10-06 13:29:27'),
(112, 100, 100, 100, '01-A', 0.025000, 85.50, 12.00, 'B-001', 'E-001', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(113, 100, 100, 100, '02-A', 0.025000, 85.50, 12.00, 'B-002', 'E-002', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(114, 100, 100, 100, '03-A', 0.025000, 85.50, 12.00, 'B-003', 'E-003', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(115, 100, 100, 100, '04-A', 0.025000, 85.50, 12.00, 'B-004', 'E-004', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1004, 100, 100, 101, '01-B', 0.028000, 95.00, 15.00, 'B-005', 'E-005', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1005, 100, 100, 101, '02-B', 0.028000, 95.00, 15.00, 'B-006', 'E-006', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1006, 100, 100, 101, '03-B', 0.028000, 95.00, 15.00, 'B-007', 'E-007', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1007, 100, 100, 101, '04-B', 0.028000, 95.00, 15.00, 'B-008', 'E-008', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1008, 100, 100, 102, '01-C', 0.022000, 75.00, 10.00, 'B-009', 'E-009', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1009, 100, 100, 102, '02-C', 0.022000, 75.00, 10.00, 'B-010', 'E-010', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1010, 100, 100, 102, '03-C', 0.022000, 75.00, 10.00, 'B-011', 'E-011', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1011, 100, 100, 103, '01-D', 0.030000, 110.00, 20.00, 'B-012', 'E-012', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1012, 100, 100, 103, '02-D', 0.030000, 110.00, 20.00, 'B-013', 'E-013', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1013, 100, 100, 104, '01-E', 0.020000, 65.00, 8.00, 'B-014', 'E-014', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53'),
(1014, 100, 100, 104, '02-E', 0.020000, 65.00, 8.00, 'B-015', 'E-015', 1, '2025-10-06 18:59:53', '2025-10-06 18:59:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int UNSIGNED NOT NULL,
  `user_id` bigint NOT NULL,
  `preferences` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `preferences`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(2, 2, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(3, 3, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(4, 4, '{\"tema\": \"claro\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(5, 5, '{\"tema\": \"oscuro\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(6, 6, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(7, 7, '{\"tema\": \"claro\", \"idioma\": \"off\", \"notificaciones\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(8, 8, '{\"tema\": \"claro\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(9, 9, '{}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(10, 10, '{\"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(11, 11, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(12, 12, '{\"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(13, 13, '{\"tema\": \"oscuro\", \"idioma\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(14, 14, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(15, 15, '{\"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(16, 16, '{\"idioma\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(17, 17, '{}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(18, 18, '{\"tema\": \"oscuro\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(19, 19, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"off\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04'),
(20, 20, '{\"tema\": \"claro\", \"notificaciones\": \"on\"}', '2025-10-02 19:15:04', '2025-10-02 19:15:04');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

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
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id`, `persona_id`, `username`, `hash_password`, `email`, `activo`, `created_at`, `updated_at`, `is_superadmin`, `totp_secret`, `totp_enabled`) VALUES
(1, 1, 'Patricio', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'pat.quintanilla@duocuc.cl', 1, '2025-10-02 18:00:09', '2025-10-07 12:49:22', 1, NULL, 0),
(2, 2, 'user2', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'marcosblasco@iglesias.es', 1, '2025-10-02 18:00:09', '2025-10-03 14:25:05', 0, NULL, 0),
(3, 3, 'user3', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'candelarioguardiola@gmail.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:25:10', 0, NULL, 0),
(4, 4, 'user4', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'casalsteofilo@requena-bermejo.org', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(5, 5, 'user5', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'vinascurro@guillen.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(6, 6, 'user6', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'dquiros@cuenca.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(7, 7, 'user7', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'graciana71@yahoo.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(8, 8, 'user8', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'carlosrio@gmail.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(9, 9, 'user9', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'elpidio14@yahoo.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(10, 10, 'user10', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'bguardiola@palomino.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(11, 11, 'user11', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'ucolomer@sabater.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(12, 12, 'user12', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'dionisia40@ribas-cerda.org', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(13, 13, 'user13', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'chidalgo@ortega-villalba.es', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(14, 14, 'user14', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'alfonsopinedo@elorza-francisco.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(15, 15, 'user15', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'acunarosario@barral.es', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(16, 16, 'user16', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'domingo91@hotmail.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(17, 17, 'user17', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'salomeduran@hotmail.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:14', 0, NULL, 0),
(18, 18, 'user18', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'xmorata@raya.net', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:15', 0, NULL, 0),
(19, 19, 'user19', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'marianela97@acuna.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:15', 0, NULL, 0),
(20, 20, 'user20', '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS', 'goyoarias@yahoo.com', 1, '2025-10-02 18:00:09', '2025-10-03 14:26:15', 0, NULL, 0),
(21, 21, 'nuevousuario2', '$2a$10$vySTIzC4F5KD0B107l.3deLwhyK7Of5YMgkZfeIBPlZ6YrpErgCMC', 'nuevousuari2o@ejemplo.com', 1, '2025-10-03 14:34:33', '2025-10-03 14:34:33', 0, NULL, 0);

-- --------------------------------------------------------

--
-- Stand-in structure for view `usuario_miembro_comunidad`
-- (See below for the actual view)
--
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
-- Table structure for table `usuario_rol_comunidad`
--

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
-- Dumping data for table `usuario_rol_comunidad`
--

INSERT INTO `usuario_rol_comunidad` (`id`, `usuario_id`, `comunidad_id`, `rol_id`, `desde`, `hasta`, `activo`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 6, '2023-02-04', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(2, 2, 7, 2, '2023-11-18', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(3, 3, 15, 4, '2023-12-22', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(4, 4, 5, 2, '2024-09-29', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(5, 5, 13, 2, '2023-09-01', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(6, 6, 16, 3, '2023-03-26', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(7, 7, 6, 3, '2023-08-21', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(8, 8, 10, 3, '2023-01-10', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(9, 9, 2, 7, '2023-08-03', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(10, 10, 5, 6, '2024-04-07', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(11, 11, 13, 7, '2024-01-24', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(12, 12, 16, 7, '2024-04-28', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(13, 13, 17, 2, '2022-10-31', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(14, 14, 15, 4, '2022-10-24', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(15, 15, 14, 6, '2023-05-29', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(16, 16, 4, 6, '2023-10-15', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(17, 17, 17, 4, '2024-08-30', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(18, 18, 14, 3, '2024-08-29', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(19, 19, 11, 7, '2024-07-25', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09'),
(20, 20, 13, 2, '2023-01-19', NULL, 1, '2025-10-02 18:00:09', '2025-10-02 18:00:09');

-- --------------------------------------------------------

--
-- Table structure for table `utm_valor`
--

CREATE TABLE `utm_valor` (
  `fecha` date NOT NULL,
  `valor` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `utm_valor`
--

INSERT INTO `utm_valor` (`fecha`, `valor`) VALUES
('2023-01-01', 66016.62),
('2023-01-02', 65824.03);

-- --------------------------------------------------------

--
-- Table structure for table `webhook_pago`
--

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
-- Dumping data for table `webhook_pago`
--

INSERT INTO `webhook_pago` (`id`, `comunidad_id`, `proveedor`, `payload_json`, `fecha_recepcion`, `procesado`, `pago_id`) VALUES
(1, 1, 'webpay', '{\"transaccion_id\": \"abc123\", \"monto\": 45000}', '2025-10-02 18:00:00', 1, 1),
(2, 2, 'khipu', '{\"transaccion_id\": \"xyz789\", \"monto\": 32000}', '2025-10-02 18:05:00', 0, NULL),
(3, 1, 'otro', '{\"detalle\": \"pago manual\"}', '2025-10-02 18:10:00', 1, 2),
(4, 3, 'transferencia', '{\"referencia\": \"TRX456\", \"banco\": \"BancoEstado\"}', '2025-10-02 18:15:00', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenidad`
--
ALTER TABLE `amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_amenidad_comunidad` (`comunidad_id`),
  ADD KEY `idx_comunidad_id` (`comunidad_id`);

--
-- Indexes for table `archivos`
--
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_comunidad_entity` (`comunidad_id`,`entity_type`,`entity_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_uploaded_at` (`uploaded_at`);

--
-- Indexes for table `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_usuario` (`usuario_id`),
  ADD KEY `ix_audit_tabla` (`tabla`,`registro_id`),
  ADD KEY `ix_audit_fecha` (`created_at`),
  ADD KEY `ix_auditoria_accion` (`accion`),
  ADD KEY `ix_auditoria_usuario_fecha` (`usuario_id`,`created_at`);

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
-- Indexes for table `cuenta_cobro_unidad`
--
ALTER TABLE `cuenta_cobro_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargo_emision` (`emision_id`),
  ADD KEY `fk_cargo_comunidad` (`comunidad_id`),
  ADD KEY `ix_cargo_unidad` (`unidad_id`),
  ADD KEY `ix_cargo_estado` (`estado`);

--
-- Indexes for table `detalle_cuenta_unidad`
--
ALTER TABLE `detalle_cuenta_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cargodet_categoria` (`categoria_id`),
  ADD KEY `ix_cargodet_cargo` (`cuenta_cobro_unidad_id`);

--
-- Indexes for table `detalle_emision_gastos`
--
ALTER TABLE `detalle_emision_gastos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_emidet_gasto` (`gasto_id`),
  ADD KEY `fk_emidet_categoria` (`categoria_id`),
  ADD KEY `ix_emidet_emision` (`emision_id`);

--
-- Indexes for table `documento_compra`
--
ALTER TABLE `documento_compra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_doc_compra` (`comunidad_id`,`proveedor_id`,`tipo_doc`,`folio`),
  ADD KEY `fk_doc_comunidad` (`comunidad_id`),
  ADD KEY `ix_doc_proveedor` (`proveedor_id`);

--
-- Indexes for table `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_docrepo_comunidad` (`comunidad_id`);

--
-- Indexes for table `edificio`
--
ALTER TABLE `edificio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_edificio_comunidad` (`comunidad_id`);

--
-- Indexes for table `emision_gastos_comunes`
--
ALTER TABLE `emision_gastos_comunes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_emision_periodo` (`comunidad_id`,`periodo`);

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
-- Indexes for table `multa`
--
ALTER TABLE `multa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_multa_comunidad` (`comunidad_id`),
  ADD KEY `fk_multa_unidad` (`unidad_id`),
  ADD KEY `fk_multa_persona` (`persona_id`),
  ADD KEY `ix_multa_estado` (`estado`);

--
-- Indexes for table `notificacion_usuario`
--
ALTER TABLE `notificacion_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_comunidad` (`comunidad_id`),
  ADD KEY `fk_notif_persona` (`persona_id`),
  ADD KEY `ix_notif_persona_leida` (`persona_id`,`leida`);

--
-- Indexes for table `pago`
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
-- Indexes for table `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_papp` (`pago_id`,`cuenta_cobro_unidad_id`),
  ADD KEY `fk_papp_cargo` (`cuenta_cobro_unidad_id`),
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
-- Indexes for table `registro_conserjeria`
--
ALTER TABLE `registro_conserjeria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bitacora_comunidad` (`comunidad_id`),
  ADD KEY `fk_regconser_usuario` (`usuario_id`);

--
-- Indexes for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resa_comunidad` (`comunidad_id`),
  ADD KEY `fk_resa_amenidad` (`amenidad_id`),
  ADD KEY `fk_resa_unidad` (`unidad_id`),
  ADD KEY `fk_resa_persona` (`persona_id`),
  ADD KEY `ix_reserva_amenidad_rango` (`amenidad_id`,`inicio`,`fin`);

--
-- Indexes for table `rol_sistema`
--
ALTER TABLE `rol_sistema`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_rol_codigo` (`codigo`);

--
-- Indexes for table `sesion_usuario`
--
ALTER TABLE `sesion_usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sesion_usuario` (`usuario_id`),
  ADD KEY `ix_sesion_activity` (`last_activity`),
  ADD KEY `ix_sesion_usuario_created` (`created_at`);

--
-- Indexes for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_tarifa_comunidad` (`comunidad_id`);

--
-- Indexes for table `ticket_soporte`
--
ALTER TABLE `ticket_soporte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ticket_comunidad` (`comunidad_id`),
  ADD KEY `fk_ticket_unidad` (`unidad_id`),
  ADD KEY `fk_solsoporte_asignado` (`asignado_a`);

--
-- Indexes for table `titulares_unidad`
--
ALTER TABLE `titulares_unidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tenencia_comunidad` (`comunidad_id`),
  ADD KEY `ix_tenencia_unidad` (`unidad_id`),
  ADD KEY `ix_tenencia_persona` (`persona_id`);

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
-- Indexes for table `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_comunidad_rol_activo` (`usuario_id`,`comunidad_id`,`rol_id`,`activo`),
  ADD KEY `fk_ucr_usuario` (`usuario_id`),
  ADD KEY `fk_ucr_comunidad` (`comunidad_id`),
  ADD KEY `fk_ucr_rol` (`rol_id`),
  ADD KEY `ix_ucr_activo` (`activo`);

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
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `archivos`
--
ALTER TABLE `archivos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `centro_costo`
--
ALTER TABLE `centro_costo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `comunidad`
--
ALTER TABLE `comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

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
-- AUTO_INCREMENT for table `cuenta_cobro_unidad`
--
ALTER TABLE `cuenta_cobro_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `detalle_cuenta_unidad`
--
ALTER TABLE `detalle_cuenta_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `detalle_emision_gastos`
--
ALTER TABLE `detalle_emision_gastos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `documento_compra`
--
ALTER TABLE `documento_compra`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `edificio`
--
ALTER TABLE `edificio`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `emision_gastos_comunes`
--
ALTER TABLE `emision_gastos_comunes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `gasto`
--
ALTER TABLE `gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `medidor`
--
ALTER TABLE `medidor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `multa`
--
ALTER TABLE `multa`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `notificacion_usuario`
--
ALTER TABLE `notificacion_usuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `pago`
--
ALTER TABLE `pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `persona`
--
ALTER TABLE `persona`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1010;

--
-- AUTO_INCREMENT for table `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `registro_conserjeria`
--
ALTER TABLE `registro_conserjeria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `rol_sistema`
--
ALTER TABLE `rol_sistema`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ticket_soporte`
--
ALTER TABLE `ticket_soporte`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `titulares_unidad`
--
ALTER TABLE `titulares_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `torre`
--
ALTER TABLE `torre`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `unidad`
--
ALTER TABLE `unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT for table `webhook_pago`
--
ALTER TABLE `webhook_pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

-- --------------------------------------------------------

--
-- Structure for view `bitacora_conserjeria`
--
DROP TABLE IF EXISTS `bitacora_conserjeria`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `bitacora_conserjeria`  AS SELECT `registro_conserjeria`.`id` AS `id`, `registro_conserjeria`.`comunidad_id` AS `comunidad_id`, `registro_conserjeria`.`fecha_hora` AS `fecha_hora`, `registro_conserjeria`.`usuario_id` AS `usuario_id`, `registro_conserjeria`.`evento` AS `evento`, `registro_conserjeria`.`detalle` AS `detalle`, `registro_conserjeria`.`created_at` AS `created_at` FROM `registro_conserjeria` ;

-- --------------------------------------------------------

--
-- Structure for view `cargo_financiero_unidad`
--
DROP TABLE IF EXISTS `cargo_financiero_unidad`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `cargo_financiero_unidad`  AS SELECT `cuenta_cobro_unidad`.`id` AS `id`, `cuenta_cobro_unidad`.`emision_id` AS `emision_id`, `cuenta_cobro_unidad`.`comunidad_id` AS `comunidad_id`, `cuenta_cobro_unidad`.`unidad_id` AS `unidad_id`, `cuenta_cobro_unidad`.`monto_total` AS `monto_total`, `cuenta_cobro_unidad`.`saldo` AS `saldo`, `cuenta_cobro_unidad`.`estado` AS `estado`, `cuenta_cobro_unidad`.`interes_acumulado` AS `interes_acumulado`, `cuenta_cobro_unidad`.`created_at` AS `created_at`, `cuenta_cobro_unidad`.`updated_at` AS `updated_at` FROM `cuenta_cobro_unidad` ;

-- --------------------------------------------------------

--
-- Structure for view `detalle_cargo_unidad`
--
DROP TABLE IF EXISTS `detalle_cargo_unidad`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `detalle_cargo_unidad`  AS SELECT `detalle_cuenta_unidad`.`id` AS `id`, `detalle_cuenta_unidad`.`cuenta_cobro_unidad_id` AS `cargo_unidad_id`, `detalle_cuenta_unidad`.`categoria_id` AS `categoria_id`, `detalle_cuenta_unidad`.`glosa` AS `glosa`, `detalle_cuenta_unidad`.`monto` AS `monto`, `detalle_cuenta_unidad`.`origen` AS `origen`, `detalle_cuenta_unidad`.`origen_id` AS `origen_id`, `detalle_cuenta_unidad`.`iva_incluido` AS `iva_incluido`, `detalle_cuenta_unidad`.`created_at` AS `created_at`, `detalle_cuenta_unidad`.`updated_at` AS `updated_at` FROM `detalle_cuenta_unidad` ;

-- --------------------------------------------------------

--
-- Structure for view `emision_gasto_comun`
--
DROP TABLE IF EXISTS `emision_gasto_comun`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `emision_gasto_comun`  AS SELECT `emision_gastos_comunes`.`id` AS `id`, `emision_gastos_comunes`.`comunidad_id` AS `comunidad_id`, `emision_gastos_comunes`.`periodo` AS `periodo`, `emision_gastos_comunes`.`fecha_vencimiento` AS `fecha_vencimiento`, `emision_gastos_comunes`.`estado` AS `estado`, `emision_gastos_comunes`.`observaciones` AS `observaciones`, `emision_gastos_comunes`.`created_at` AS `created_at`, `emision_gastos_comunes`.`updated_at` AS `updated_at` FROM `emision_gastos_comunes` ;

-- --------------------------------------------------------

--
-- Structure for view `emision_gasto_detalle`
--
DROP TABLE IF EXISTS `emision_gasto_detalle`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `emision_gasto_detalle`  AS SELECT `detalle_emision`.`id` AS `id`, `detalle_emision`.`emision_id` AS `emision_id`, `detalle_emision`.`gasto_id` AS `gasto_id`, `detalle_emision`.`categoria_id` AS `categoria_id`, `detalle_emision`.`monto` AS `monto`, `detalle_emision`.`regla_prorrateo` AS `regla_prorrateo`, `detalle_emision`.`metadata_json` AS `metadata_json`, `detalle_emision`.`created_at` AS `created_at`, `detalle_emision`.`updated_at` AS `updated_at` FROM `detalle_emision` ;

-- --------------------------------------------------------

--
-- Structure for view `ticket`
--
DROP TABLE IF EXISTS `ticket`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `ticket`  AS SELECT `solicitud_soporte`.`id` AS `id`, `solicitud_soporte`.`comunidad_id` AS `comunidad_id`, `solicitud_soporte`.`unidad_id` AS `unidad_id`, `solicitud_soporte`.`categoria` AS `categoria`, `solicitud_soporte`.`titulo` AS `titulo`, `solicitud_soporte`.`descripcion` AS `descripcion`, `solicitud_soporte`.`estado` AS `estado`, `solicitud_soporte`.`prioridad` AS `prioridad`, `solicitud_soporte`.`asignado_a` AS `asignado_a`, `solicitud_soporte`.`attachments_json` AS `attachments_json`, `solicitud_soporte`.`created_at` AS `created_at`, `solicitud_soporte`.`updated_at` AS `updated_at` FROM `solicitud_soporte` ;

-- --------------------------------------------------------

--
-- Structure for view `titularidad_unidad`
--
DROP TABLE IF EXISTS `titularidad_unidad`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `titularidad_unidad`  AS SELECT `titulares_unidad`.`id` AS `id`, `titulares_unidad`.`comunidad_id` AS `comunidad_id`, `titulares_unidad`.`unidad_id` AS `unidad_id`, `titulares_unidad`.`persona_id` AS `persona_id`, `titulares_unidad`.`tipo` AS `tipo`, `titulares_unidad`.`desde` AS `desde`, `titulares_unidad`.`hasta` AS `hasta`, `titulares_unidad`.`porcentaje` AS `porcentaje`, `titulares_unidad`.`created_at` AS `created_at`, `titulares_unidad`.`updated_at` AS `updated_at` FROM `titulares_unidad` ;

-- --------------------------------------------------------

--
-- Structure for view `usuario_miembro_comunidad`
--
DROP TABLE IF EXISTS `usuario_miembro_comunidad`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `usuario_miembro_comunidad`  AS SELECT `urc`.`id` AS `id`, `urc`.`comunidad_id` AS `comunidad_id`, `u`.`persona_id` AS `persona_id`, `r`.`codigo` AS `rol`, `urc`.`desde` AS `desde`, `urc`.`hasta` AS `hasta`, `urc`.`activo` AS `activo`, `urc`.`created_at` AS `created_at`, `urc`.`updated_at` AS `updated_at` FROM ((`usuario_rol_comunidad` `urc` join `usuario` `u` on((`u`.`id` = `urc`.`usuario_id`))) join `rol_sistema` `r` on((`r`.`id` = `urc`.`rol_id`))) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `amenidad`
--
ALTER TABLE `amenidad`
  ADD CONSTRAINT `fk_amenidad_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `archivos`
--
ALTER TABLE `archivos`
  ADD CONSTRAINT `archivos_ibfk_1` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  ADD CONSTRAINT `fk_categoria_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_catgasto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `centro_costo`
--
ALTER TABLE `centro_costo`
  ADD CONSTRAINT `fk_ccosto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_centro_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  ADD CONSTRAINT `fk_conc_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_conc_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_conciliacion_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  ADD CONSTRAINT `fk_cint_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_configuracion_interes_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `cuenta_cobro_unidad`
--
ALTER TABLE `cuenta_cobro_unidad`
  ADD CONSTRAINT `fk_cargo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_cargo_emision` FOREIGN KEY (`emision_id`) REFERENCES `emision_gastos_comunes` (`id`),
  ADD CONSTRAINT `fk_cargo_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `detalle_cuenta_unidad`
--
ALTER TABLE `detalle_cuenta_unidad`
  ADD CONSTRAINT `fk_cargodet_cargo` FOREIGN KEY (`cuenta_cobro_unidad_id`) REFERENCES `cuenta_cobro_unidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cargodet_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`);

--
-- Constraints for table `detalle_emision_gastos`
--
ALTER TABLE `detalle_emision_gastos`
  ADD CONSTRAINT `fk_emidet_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`),
  ADD CONSTRAINT `fk_emidet_emision` FOREIGN KEY (`emision_id`) REFERENCES `emision_gastos_comunes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_emidet_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `documento_compra`
--
ALTER TABLE `documento_compra`
  ADD CONSTRAINT `fk_doc_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_doc_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`),
  ADD CONSTRAINT `fk_documento_compra_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  ADD CONSTRAINT `fk_docrepo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_documento_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `edificio`
--
ALTER TABLE `edificio`
  ADD CONSTRAINT `fk_edificio_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `emision_gastos_comunes`
--
ALTER TABLE `emision_gastos_comunes`
  ADD CONSTRAINT `fk_emision_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

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
-- Constraints for table `multa`
--
ALTER TABLE `multa`
  ADD CONSTRAINT `fk_multa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_multa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_multa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `notificacion_usuario`
--
ALTER TABLE `notificacion_usuario`
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
  ADD CONSTRAINT `fk_papp_cargo` FOREIGN KEY (`cuenta_cobro_unidad_id`) REFERENCES `cuenta_cobro_unidad` (`id`),
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
-- Constraints for table `registro_conserjeria`
--
ALTER TABLE `registro_conserjeria`
  ADD CONSTRAINT `fk_bitacora_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_regconser_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  ADD CONSTRAINT `fk_resa_amenidad` FOREIGN KEY (`amenidad_id`) REFERENCES `amenidad` (`id`),
  ADD CONSTRAINT `fk_resa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_resa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_resa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `sesion_usuario`
--
ALTER TABLE `sesion_usuario`
  ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  ADD CONSTRAINT `fk_tarifa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `ticket_soporte`
--
ALTER TABLE `ticket_soporte`
  ADD CONSTRAINT `fk_solsoporte_asignado` FOREIGN KEY (`asignado_a`) REFERENCES `usuario` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ticket_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_ticket_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `titulares_unidad`
--
ALTER TABLE `titulares_unidad`
  ADD CONSTRAINT `fk_tenencia_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_tenencia_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`),
  ADD CONSTRAINT `fk_tenencia_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

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
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `fk_userpref_usuario` FOREIGN KEY (`user_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  ADD CONSTRAINT `fk_ucr_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ucr_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol_sistema` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ucr_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

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
