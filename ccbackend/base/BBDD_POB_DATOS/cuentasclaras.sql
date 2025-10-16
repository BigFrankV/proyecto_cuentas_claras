-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 16, 2025 at 10:22 PM
-- Server version: 8.0.43
-- PHP Version: 8.3.26

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
(1, 1, 'Salón de Eventos', 'No ruidos después de las 23:00 hrs.', 50, 1, 30000.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(2, 2, 'Quincho Techado', 'Uso máximo 4 horas.', 15, 0, 15000.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(3, 3, 'Gimnasio', 'Solo mayores de 18, uso de toalla.', 20, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(4, 4, 'Piscina Exterior', 'Abierta de 10 a 20 hrs.', 40, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(5, 5, 'Sala Cowork', 'Silencio absoluto.', 10, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(6, 6, 'Sala de Cine', 'Reserva con 48 hrs.', 12, 1, 10000.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(7, 7, 'Lavandería', 'Máximo 2 cargas por día.', 6, 0, 2500.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(8, 8, 'Terraza Panorámica', 'Prohibido parrillas a carbón.', 25, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(9, 9, 'Salón de Yoga', 'Traer mat personal.', 8, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(10, 10, 'Sala de Juegos', 'Niños deben estar acompañados.', 15, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(11, 1, 'Piscina Interior', 'Uso solo con salvavidas.', 30, 0, 0.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(12, 2, 'Cancha Multiuso', 'Reservar con 24 hrs.', 20, 0, 5000.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(13, 3, 'Sala de Reuniones', 'Máximo 10 personas.', 10, 0, 0.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(14, 4, 'Quincho Cerrado', 'Prohibido encender fuego en días de viento.', 12, 1, 18000.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(15, 5, 'Biblioteca', 'Silencio absoluto.', 5, 0, 0.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(16, 6, 'Zona de Mascotas', 'Recoger siempre los desechos.', 15, 0, 0.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(17, 7, 'Sauna', 'Solo mayores de 18.', 4, 1, 4000.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(18, 8, 'Sala de Música', 'Uso de audífonos.', 8, 0, 0.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(19, 9, 'Muro de Escalada', 'Uso de arnés y bajo supervisión.', 5, 1, 12000.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(20, 10, 'Juegos Infantiles', 'Supervisión adulta obligatoria.', 20, 0, 0.00, '2025-10-15 21:10:21', '2025-10-15 21:10:21'),
(21, 1, 'Cancha de Tenis', 'Solo para residentes activos.', 8, 0, 5000.00, '2025-10-17 11:00:00', '2025-10-17 11:00:00'),
(22, 2, 'Parrilla Eléctrica', 'Prohibido carbón.', 4, 0, 2000.00, '2025-10-17 11:00:01', '2025-10-17 11:00:01'),
(23, 3, 'Sala de Música', 'Uso de audífonos después de 20 hrs.', 6, 0, 0.00, '2025-10-17 11:00:02', '2025-10-17 11:00:02'),
(24, 4, 'Área de Picnic', 'Reservar con 1 hora de anticipación.', 20, 0, 0.00, '2025-10-17 11:00:03', '2025-10-17 11:00:03'),
(25, 5, 'Salón Gourmet', 'Limpieza post-evento obligatoria.', 15, 1, 40000.00, '2025-10-17 11:00:04', '2025-10-17 11:00:04'),
(26, 6, 'Piscina Panorámica', 'Solo mayores de 12 años acompañados.', 25, 0, 0.00, '2025-10-17 11:00:05', '2025-10-17 11:00:05'),
(27, 7, 'Muro de Escalada Interior', 'Uso solo con equipo de seguridad.', 5, 1, 8000.00, '2025-10-17 11:00:06', '2025-10-17 11:00:06'),
(28, 8, 'Biblioteca Común', 'Silencio absoluto, no consumir alimentos.', 10, 0, 0.00, '2025-10-17 11:00:07', '2025-10-17 11:00:07'),
(29, 9, 'Sala de Artesanía', 'Reservar mesas con 24 hrs.', 8, 0, 1000.00, '2025-10-17 11:00:08', '2025-10-17 11:00:08'),
(30, 10, 'Sala de Eventos Pequeña', 'Capacidad máxima 20 personas.', 20, 1, 15000.00, '2025-10-17 11:00:09', '2025-10-17 11:00:09'),
(31, 11, 'Sala de Juegos Infantiles', 'Supervisión adulta obligatoria.', 15, 0, 0.00, '2025-10-17 11:18:00', '2025-10-17 11:18:00'),
(32, 12, 'Salón Multiuso', 'Reserva con 48 horas de anticipación.', 50, 1, 25000.00, '2025-10-17 11:18:01', '2025-10-17 11:18:01'),
(33, 13, 'Gimnasio Exterior', 'Horario de 8 a 22 hrs.', 10, 0, 0.00, '2025-10-17 11:18:02', '2025-10-17 11:18:02'),
(34, 14, 'Cancha de Fútbol', 'Solo pasto sintético, no tacones.', 22, 1, 10000.00, '2025-10-17 11:18:03', '2025-10-17 11:18:03'),
(35, 15, 'Sala Cowork Ampliada', 'Incluye café y té.', 20, 0, 0.00, '2025-10-17 11:18:04', '2025-10-17 11:18:04'),
(36, 16, 'Sauna y Spa', 'Reserva de uso privado por 1 hora.', 4, 1, 5000.00, '2025-10-17 11:18:05', '2025-10-17 11:18:05'),
(37, 17, 'Lavandería Automática', 'Máximo 3 ciclos por unidad al día.', 8, 0, 2000.00, '2025-10-17 11:18:06', '2025-10-17 11:18:06'),
(38, 18, 'Terraza Mirador', 'Prohibido encender fuego (solo parrillas a gas).', 30, 0, 0.00, '2025-10-17 11:18:07', '2025-10-17 11:18:07'),
(39, 19, 'Salón de Eventos Grande', 'Control de ruido estricto.', 100, 1, 50000.00, '2025-10-17 11:18:08', '2025-10-17 11:18:08'),
(40, 20, 'Zona de Camping', 'Solo en temporada de verano.', 10, 0, 0.00, '2025-10-17 11:18:09', '2025-10-17 11:18:09');

-- --------------------------------------------------------

--
-- Table structure for table `archivos`
--

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
-- Dumping data for table `archivos`
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
(10, 'Multa_Ruido_C2.pdf', 'multa_ruido_c2.pdf', '/multas/c2/multa_ruido_c2.pdf', 150000, 'application/pdf', 2, 'multa', 2, 'general', NULL, '2025-10-10 18:10:26', 3, 1),
(11, 'Foto_Sauna_C7.jpg', 'foto_sauna_c7.jpg', '/amenidades/c7/foto_sauna.jpg', 1500000, 'image/jpeg', 7, 'reserva_amenidad', 17, 'general', NULL, '2025-10-15 21:13:32', 7, 1),
(12, 'Comprobante_Pago_12.png', 'comp_pago_12.png', '/pagos/c4/comp_pago_12.png', 400000, 'image/png', 4, 'pago', 12, 'general', NULL, '2025-10-15 21:13:32', 14, 1),
(13, 'Reglamento_Ascensores_C1.pdf', 'regl_asc_c1.pdf', '/docs/c1/regl_asc_c1.pdf', 900000, 'application/pdf', 1, 'documento_comunidad', 11, 'reglamento', NULL, '2025-10-15 21:13:32', 1, 1),
(14, 'Factura_Electricidad_C10.pdf', 'fact_elec_c10.pdf', '/docs/c10/fact_elec_c10.pdf', 750000, 'application/pdf', 10, 'documento_compra', 20, 'general', NULL, '2025-10-15 21:13:32', 10, 1),
(15, 'Lectura_13_10.csv', 'lectura_13_10.csv', '/lecturas/c3/lectura_13_10.csv', 12000, 'text/csv', 3, 'lectura_medidor', 13, 'general', NULL, '2025-10-15 21:13:32', 3, 1),
(16, 'Boleta_Vigilancia_C7.pdf', 'bol_vig_c7.pdf', '/docs/c7/bol_vig_c7.pdf', 550000, 'application/pdf', 7, 'documento_compra', 17, 'general', NULL, '2025-10-15 21:13:32', 7, 1),
(17, 'Foto_Jardin_D1002.jpg', 'foto_jardin_c6.jpg', '/multas/c6/foto_jardin.jpg', 1100000, 'image/jpeg', 6, 'multa', 16, 'general', NULL, '2025-10-15 21:13:32', 16, 1),
(18, 'Comp_Webpay_C10.pdf', 'comp_wp_c10.pdf', '/pagos/c10/comp_wp_c10.pdf', 280000, 'application/pdf', 10, 'pago', 15, 'general', NULL, '2025-10-15 21:13:32', 20, 1),
(19, 'Acta_Extra_C7.pdf', 'acta_extra_c7.pdf', '/docs/c7/acta_extra_c7.pdf', 650000, 'application/pdf', 7, 'documento_comunidad', 17, 'general', NULL, '2025-10-15 21:13:32', 7, 1),
(20, 'Multa_Ruido_C5.pdf', 'multa_ruido_c5.pdf', '/multas/c5/multa_ruido_c5.pdf', 180000, 'application/pdf', 5, 'multa', 15, 'general', NULL, '2025-10-15 21:13:32', 16, 1),
(21, 'Foto_Balcón_D401.jpg', 'foto_balcon_c1.jpg', '/multas/c1/foto_balcon.jpg', 950000, 'image/jpeg', 1, 'multa', 23, 'evidencia', 'Evidencia de parrilla en balcón D401.', '2025-10-17 11:09:00', 6, 1),
(22, 'Contrato_Fumigación.pdf', 'contrato_fum_c2.pdf', '/docs/c2/contrato_fum.pdf', 700000, 'application/pdf', 2, 'documento_compra', 37, 'contrato', NULL, '2025-10-17 11:09:01', 2, 1),
(23, 'Informe_Reparacion_Luz.pdf', 'inf_reparacion_c3.pdf', '/tickets/c3/inf_luz.pdf', 450000, 'application/pdf', 3, 'ticket_soporte', 23, 'solucion', 'Informe de reparación de fuga de alcantarillado.', '2025-10-17 11:09:02', 3, 1),
(24, 'Comprobante_Pago_33.png', 'comp_pago_33.png', '/pagos/c3/comp_pago_33.png', 320000, 'image/png', 3, 'pago', 33, 'general', NULL, '2025-10-17 11:09:03', 33, 1),
(25, 'Acta_Asamblea_2025.pdf', 'acta_asm_2025_c4.pdf', '/docs/c4/acta_asm_2025.pdf', 1100000, 'application/pdf', 4, 'documento_comunidad', 27, 'acta', NULL, '2025-10-17 11:09:04', 4, 1),
(26, 'Lectura_D701_10.csv', 'lectura_d701_10.csv', '/lecturas/c5/lectura_d701_10.csv', 15000, 'text/csv', 5, 'lectura_medidor', 25, 'general', NULL, '2025-10-17 11:09:05', 5, 1),
(27, 'Factura_Mantencion_Piscina.pdf', 'fact_piscina_c6.pdf', '/docs/c6/fact_piscina.pdf', 850000, 'application/pdf', 6, 'documento_compra', 41, 'general', NULL, '2025-10-17 11:09:06', 36, 1),
(28, 'Foto_Portón_Grieta.jpg', 'foto_porton_grieta_c8.jpg', '/tickets/c8/foto_porton.jpg', 1400000, 'image/jpeg', 8, 'ticket_soporte', 28, 'general', NULL, '2025-10-17 11:09:07', 8, 1),
(29, 'Comp_Webpay_C9.pdf', 'comp_wp_c9.pdf', '/pagos/c9/comp_wp_c9.pdf', 290000, 'application/pdf', 9, 'pago', 39, 'general', NULL, '2025-10-17 11:09:08', 39, 1),
(30, 'Reglamento_Mascotas_V2.pdf', 'regl_mascotas_v2_c10.pdf', '/docs/c10/regl_mascotas_v2.pdf', 750000, 'application/pdf', 10, 'documento_comunidad', 28, 'reglamento', 'Nueva versión de reglamento de mascotas.', '2025-10-17 11:09:09', 10, 1);

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
(1, 1, 'UPDATE', 'unidad', 1, '{\"alicuota\": \"0.010000\"}', '{\"alicuota\": \"0.015000\"}', '192.168.1.1', '2025-10-10 18:10:29'),
(2, 2, 'INSERT', 'pago', 1, NULL, '{\"medio\": \"transferencia\", \"monto\": 62000}', '192.168.1.2', '2025-10-10 18:10:29'),
(3, 3, 'UPDATE', 'multa', 2, '{\"estado\": \"pendiente\"}', '{\"estado\": \"pagada\"}', '192.168.1.3', '2025-10-10 18:10:29'),
(4, 4, 'INSERT', 'ticket_soporte', 4, NULL, '{\"titulo\": \"Árbol seco\"}', '192.168.1.4', '2025-10-10 18:10:29'),
(5, 5, 'UPDATE', 'emision_gastos_comunes', 5, '{\"estado\": \"borrador\"}', '{\"estado\": \"emitido\"}', '192.168.1.5', '2025-10-10 18:10:29'),
(6, 6, 'INSERT', 'registro_conserjeria', 6, NULL, '{\"evento\": \"visita\"}', '192.168.1.6', '2025-10-10 18:10:29'),
(7, 7, 'UPDATE', 'unidad', 8, '{\"nro_estacionamiento\": \"E105A\"}', '{\"nro_estacionamiento\": \"E152\"}', '192.168.1.7', '2025-10-10 18:10:29'),
(8, 8, 'INSERT', 'gasto', 8, NULL, '{\"monto\": 47600}', '192.168.1.8', '2025-10-10 18:10:29'),
(9, 9, 'UPDATE', 'cuenta_cobro_unidad', 9, '{\"saldo\": \"49000.00\"}', '{\"estado\": \"vencido\"}', '192.168.1.9', '2025-10-10 18:10:29'),
(10, 10, 'INSERT', 'lectura_medidor', 10, NULL, '{\"lectura\": 44.9}', '192.168.1.10', '2025-10-10 18:10:29'),
(11, 11, 'UPDATE', 'unidad', 11, '{\"alicuota\": \"0.015000\"}', '{\"nro_bodega\": \"B11\"}', '192.168.1.11', '2025-10-15 21:13:30'),
(12, 12, 'INSERT', 'pago', 11, NULL, '{\"medio\": \"transferencia\", \"monto\": 65000}', '192.168.1.12', '2025-10-15 21:13:30'),
(13, 13, 'UPDATE', 'multa', 12, '{\"estado\": \"pendiente\"}', '{\"estado\": \"pagada\"}', '192.168.1.13', '2025-10-15 21:13:30'),
(14, 14, 'INSERT', 'ticket_soporte', 14, NULL, '{\"titulo\": \"Fuga de agua Casa B\"}', '192.168.1.14', '2025-10-15 21:13:30'),
(15, 15, 'UPDATE', 'emision_gastos_comunes', 15, '{\"estado\": \"borrador\"}', '{\"estado\": \"emitido\"}', '192.168.1.15', '2025-10-15 21:13:30'),
(16, 16, 'INSERT', 'registro_conserjeria', 16, NULL, '{\"evento\": \"visita\", \"detalle\": \"Abogado por cobranza\"}', '192.168.1.16', '2025-10-15 21:13:30'),
(17, 17, 'UPDATE', 'unidad', 18, '{\"nro_estacionamiento\": \"E153\"}', '{\"nro_estacionamiento\": \"E200\"}', '192.168.1.17', '2025-10-15 21:13:30'),
(18, 18, 'INSERT', 'gasto', 18, NULL, '{\"monto\": 89250}', '192.168.1.18', '2025-10-15 21:13:30'),
(19, 19, 'UPDATE', 'cuenta_cobro_unidad', 19, '{\"saldo\": \"50000.00\"}', '{\"estado\": \"vencido\"}', '192.168.1.19', '2025-10-15 21:13:30'),
(20, 20, 'INSERT', 'lectura_medidor', 20, NULL, '{\"lectura\": 49.9}', '192.168.1.20', '2025-10-15 21:13:30'),
(21, 21, 'INSERT', 'unidad', 21, NULL, '{\"codigo\": \"D301\", \"alicuota\": \"0.016000\"}', '192.168.1.21', '2025-10-16 18:31:00'),
(22, 22, 'INSERT', 'pago', 22, NULL, '{\"medio\": \"webpay\", \"monto\": 70000}', '192.168.1.22', '2025-10-16 18:31:01'),
(23, 23, 'UPDATE', 'multa', 13, '{\"estado\": \"pendiente\"}', '{\"estado\": \"aprobada\"}', '192.168.1.23', '2025-10-16 18:31:02'),
(24, 24, 'INSERT', 'ticket_soporte', 11, NULL, '{\"titulo\": \"Luces quemadas\"}', '192.168.1.24', '2025-10-16 18:31:03'),
(25, 25, 'UPDATE', 'emision_gastos_comunes', 21, '{\"estado\": \"borrador\"}', '{\"estado\": \"emitido\"}', '192.168.1.25', '2025-10-16 18:31:04'),
(26, 26, 'INSERT', 'registro_conserjeria', 21, NULL, '{\"evento\": \"mantencion_rutinaria\"}', '192.168.1.26', '2025-10-16 18:31:05'),
(27, 27, 'UPDATE', 'unidad', 27, '{\"nro_bodega\": null}', '{\"nro_bodega\": \"T16-B\"}', '192.168.1.27', '2025-10-16 18:31:06'),
(28, 28, 'INSERT', 'gasto', 33, NULL, '{\"monto\": 89250}', '192.168.1.28', '2025-10-16 18:31:07'),
(29, 29, 'UPDATE', 'cuenta_cobro_unidad', 29, '{\"saldo\": \"60000.00\"}', '{\"estado\": \"parcial\"}', '192.168.1.29', '2025-10-16 18:31:08'),
(30, 30, 'INSERT', 'lectura_medidor', 20, NULL, '{\"lectura\": 50.0}', '192.168.1.30', '2025-10-16 18:31:09'),
(31, 31, 'INSERT', 'unidad', 31, NULL, '{\"codigo\": \"D401\"}', '192.168.1.31', '2025-10-17 10:21:00'),
(32, 32, 'INSERT', 'pago', 32, NULL, '{\"monto\": 75000}', '192.168.1.32', '2025-10-17 10:21:01'),
(33, 33, 'UPDATE', 'multa', 23, '{\"prioridad\": \"critica\"}', '{\"estado\": \"aprobada\"}', '192.168.1.33', '2025-10-17 10:21:02'),
(34, 34, 'INSERT', 'ticket_soporte', 21, NULL, '{\"titulo\": \"Falta de agua\"}', '192.168.1.34', '2025-10-17 10:21:03'),
(35, 35, 'UPDATE', 'emision_gastos_comunes', 31, '{\"estado\": \"borrador\"}', '{\"estado\": \"emitido\"}', '192.168.1.35', '2025-10-17 10:21:04'),
(36, 36, 'INSERT', 'registro_conserjeria', 31, NULL, '{\"evento\": \"visita_tecnico\"}', '192.168.1.36', '2025-10-17 10:21:05'),
(37, 37, 'UPDATE', 'unidad', 37, '{\"m2_utiles\": 85.0}', '{\"m2_terrazas\": 5.0}', '192.168.1.37', '2025-10-17 10:21:06'),
(38, 38, 'INSERT', 'gasto', 43, NULL, '{\"monto\": 83300}', '192.168.1.38', '2025-10-17 10:21:07'),
(39, 39, 'UPDATE', 'cuenta_cobro_unidad', 39, '{\"saldo\": \"65000.00\"}', '{\"estado\": \"pagado\"}', '192.168.1.39', '2025-10-17 10:21:08'),
(40, 40, 'INSERT', 'lectura_medidor', 30, NULL, '{\"lectura\": 65.0}', '192.168.1.40', '2025-10-17 10:21:09');

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
(1, 1, 'Gasto Común Operacional', 'operacional', 'OP-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(2, 2, 'Fondo de Reserva', 'fondo_reserva', 'FR-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(3, 3, 'Gasto Extraordinario', 'extraordinario', 'EX-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(4, 4, 'Multas por Reglamento', 'multas', 'MT-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(5, 5, 'Consumo Agua Caliente', 'consumo', 'CO-001', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(6, 6, 'Seguros e Impuestos', 'operacional', 'OP-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(7, 7, 'Reparaciones Mayores', 'extraordinario', 'EX-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(8, 8, 'Uso de Amenidades (Ingreso)', 'multas', 'MT-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(9, 9, 'Gasto de Administración', 'operacional', 'OP-003', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(10, 10, 'Consumo Electricidad Común', 'consumo', 'CO-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(11, 1, 'Mantención Eléctrica', 'operacional', 'OP-004', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(12, 2, 'Reparaciones Hidráulicas', 'operacional', 'OP-005', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(13, 3, 'Proyectos de Capital', 'extraordinario', 'EX-003', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(14, 4, 'Penalidades Financieras', 'multas', 'MT-003', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(15, 5, 'Consumo Gas Común', 'consumo', 'CO-003', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(16, 6, 'Contratación Personal', 'operacional', 'OP-006', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(17, 7, 'Servicios de Vigilancia', 'operacional', 'OP-007', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(18, 8, 'Mejoras Estructurales', 'extraordinario', 'EX-004', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(19, 9, 'Fondo de Imprevistos', 'fondo_reserva', 'FR-002', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(20, 10, 'Consumo Agua Común', 'consumo', 'CO-004', 1, '2025-10-15 21:10:23', '2025-10-15 21:10:23'),
(21, 1, 'Seguridad y Vigilancia', 'operacional', 'OP-008', 1, '2025-10-16 18:19:00', '2025-10-16 18:19:00'),
(22, 2, 'Mantención Áreas Verdes', 'operacional', 'OP-009', 1, '2025-10-16 18:19:01', '2025-10-16 18:19:01'),
(23, 3, 'Insumos de Aseo', 'operacional', 'OP-010', 1, '2025-10-16 18:19:02', '2025-10-16 18:19:02'),
(24, 4, 'Honorarios y Asesorías', 'operacional', 'OP-011', 1, '2025-10-16 18:19:03', '2025-10-16 18:19:03'),
(25, 5, 'Gastos de Cobranza', 'extraordinario', 'EX-005', 1, '2025-10-16 18:19:04', '2025-10-16 18:19:04'),
(26, 6, 'Climatización y Calefacción', 'operacional', 'OP-012', 1, '2025-10-16 18:19:05', '2025-10-16 18:19:05'),
(27, 7, 'Capacitación Personal', 'operacional', 'OP-013', 1, '2025-10-16 18:19:06', '2025-10-16 18:19:06'),
(28, 8, 'Mejoras Estéticas', 'extraordinario', 'EX-005', 1, '2025-10-16 18:19:07', '2025-10-16 18:19:07'),
(29, 9, 'Fondo de Mantención', 'fondo_reserva', 'FR-003', 1, '2025-10-16 18:19:08', '2025-10-16 18:19:08'),
(30, 10, 'Inspección Estructural', 'extraordinario', 'EX-006', 1, '2025-10-16 18:19:09', '2025-10-16 18:19:09'),
(31, 1, 'Mantención Ascensores', 'operacional', 'OP-014', 1, '2025-10-17 10:09:00', '2025-10-17 10:09:00'),
(32, 2, 'Control de Plagas', 'operacional', 'OP-015', 1, '2025-10-17 10:09:01', '2025-10-17 10:09:01'),
(33, 3, 'Reparaciones Eléctricas', 'operacional', 'OP-016', 1, '2025-10-17 10:09:02', '2025-10-17 10:09:02'),
(34, 4, 'Comunicación Comunitaria', 'operacional', 'OP-017', 1, '2025-10-17 10:09:03', '2025-10-17 10:09:03'),
(35, 5, 'Servicios de Internet', 'operacional', 'OP-018', 1, '2025-10-17 10:09:04', '2025-10-17 10:09:04'),
(36, 6, 'Mantención Piscinas', 'operacional', 'OP-019', 1, '2025-10-17 10:09:05', '2025-10-17 10:09:05'),
(37, 7, 'Mantenimiento Red Gas', 'operacional', 'OP-020', 1, '2025-10-17 10:09:06', '2025-10-17 10:09:06'),
(38, 8, 'Materiales de Construcción', 'extraordinario', 'EX-007', 1, '2025-10-17 10:09:07', '2025-10-17 10:09:07'),
(39, 9, 'Paisajismo Extraordinario', 'extraordinario', 'EX-008', 1, '2025-10-17 10:09:08', '2025-10-17 10:09:08'),
(40, 10, 'Sistemas de Agua', 'operacional', 'OP-021', 1, '2025-10-17 10:09:09', '2025-10-17 10:09:09'),
(41, 11, 'Servicio de Conserjería', 'operacional', 'OP-022', 1, '2025-10-17 11:19:00', '2025-10-17 11:19:00'),
(42, 12, 'Reparaciones Menores', 'operacional', 'OP-023', 1, '2025-10-17 11:19:01', '2025-10-17 11:19:01'),
(43, 13, 'Fondo de Imprevistos', 'fondo_reserva', 'FR-004', 1, '2025-10-17 11:19:02', '2025-10-17 11:19:02'),
(44, 14, 'Consumo de Agua Individual', 'consumo', 'CO-005', 1, '2025-10-17 11:19:03', '2025-10-17 11:19:03'),
(45, 15, 'Mantenimiento de Bombas', 'operacional', 'OP-024', 1, '2025-10-17 11:19:04', '2025-10-17 11:19:04'),
(46, 16, 'Gastos de Personal Extra', 'extraordinario', 'EX-009', 1, '2025-10-17 11:19:05', '2025-10-17 11:19:05'),
(47, 17, 'Consumo de Gas Común', 'consumo', 'CO-006', 1, '2025-10-17 11:19:06', '2025-10-17 11:19:06'),
(48, 18, 'Multas de Tesorería', 'multas', 'MT-004', 1, '2025-10-17 11:19:07', '2025-10-17 11:19:07'),
(49, 19, 'Gasto de Administración Externa', 'operacional', 'OP-025', 1, '2025-10-17 11:19:08', '2025-10-17 11:19:08'),
(50, 20, 'Reparación de Caminos', 'extraordinario', 'EX-010', 1, '2025-10-17 11:19:09', '2025-10-17 11:19:09');

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
(1, 1, 'Aseo y Limpieza', 'CC001', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(2, 2, 'Seguridad 24H', 'CC002', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(3, 3, 'Mantención General', 'CC003', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(4, 4, 'Áreas Verdes', 'CC004', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(5, 5, 'Suministros', 'CC005', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(6, 6, 'Gastos Fijos', 'CC006', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(7, 7, 'Ascensores y Escaleras', 'CC007', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(8, 8, 'Zonas Comunes', 'CC008', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(9, 9, 'Honorarios', 'CC009', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(10, 10, 'Contabilidad', 'CC010', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(11, 1, 'Electricidad y Clima', 'CC011', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(12, 2, 'Fontanería y Tuberías', 'CC012', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(13, 3, 'Proyectos Mayores', 'CC013', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(14, 4, 'Cobranza y Legal', 'CC014', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(15, 5, 'Gas y Calefacción', 'CC015', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(16, 6, 'Recursos Humanos', 'CC016', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(17, 7, 'Vigilancia y Alarmas', 'CC017', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(18, 8, 'Infraestructura', 'CC018', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(19, 9, 'Fondo Reserva', 'CC019', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(20, 10, 'Suministro de Agua', 'CC020', '2025-10-15 21:10:24', '2025-10-15 21:10:24'),
(21, 1, 'Control de Acceso', 'CC021', '2025-10-16 18:20:00', '2025-10-16 18:20:00'),
(22, 2, 'Jardinería', 'CC022', '2025-10-16 18:20:01', '2025-10-16 18:20:01'),
(23, 3, 'Materiales de Consumo', 'CC023', '2025-10-16 18:20:02', '2025-10-16 18:20:02'),
(24, 4, 'Legal y Asesoría', 'CC024', '2025-10-16 18:20:03', '2025-10-16 18:20:03'),
(25, 5, 'Administración de Sistemas', 'CC025', '2025-10-16 18:20:04', '2025-10-16 18:20:04'),
(26, 6, 'Sistemas de Clima', 'CC026', '2025-10-16 18:20:05', '2025-10-16 18:20:05'),
(27, 7, 'Gestión de Personal', 'CC027', '2025-10-16 18:20:06', '2025-10-16 18:20:06'),
(28, 8, 'Remodelación Interior', 'CC028', '2025-10-16 18:20:07', '2025-10-16 18:20:07'),
(29, 9, 'Fondo Específico', 'CC029', '2025-10-16 18:20:08', '2025-10-16 18:20:08'),
(30, 10, 'Infraestructura Mayor', 'CC030', '2025-10-16 18:20:09', '2025-10-16 18:20:09'),
(31, 1, 'Movilidad Vertical', 'CC031', '2025-10-17 10:10:00', '2025-10-17 10:10:00'),
(32, 2, 'Higiene Ambiental', 'CC032', '2025-10-17 10:10:01', '2025-10-17 10:10:01'),
(33, 3, 'Infraestructura Eléctrica', 'CC033', '2025-10-17 10:10:02', '2025-10-17 10:10:02'),
(34, 4, 'Comunicaciones', 'CC034', '2025-10-17 10:10:03', '2025-10-17 10:10:03'),
(35, 5, 'Tecnología', 'CC035', '2025-10-17 10:10:04', '2025-10-17 10:10:04'),
(36, 6, 'Áreas Acuáticas', 'CC036', '2025-10-17 10:10:05', '2025-10-17 10:10:05'),
(37, 7, 'Suministro de Gas', 'CC037', '2025-10-17 10:10:06', '2025-10-17 10:10:06'),
(38, 8, 'Proyectos de Obra Menor', 'CC038', '2025-10-17 10:10:07', '2025-10-17 10:10:07'),
(39, 9, 'Mejoras de Jardín', 'CC039', '2025-10-17 10:10:08', '2025-10-17 10:10:08'),
(40, 10, 'Bombas y Presurización', 'CC040', '2025-10-17 10:10:09', '2025-10-17 10:10:09'),
(41, 11, 'Recursos Humanos/Turnos', 'CC041', '2025-10-17 11:20:00', '2025-10-17 11:20:00'),
(42, 12, 'Mantención Predictiva', 'CC042', '2025-10-17 11:20:01', '2025-10-17 11:20:01'),
(43, 13, 'Reserva y Contingencia', 'CC043', '2025-10-17 11:20:02', '2025-10-17 11:20:02'),
(44, 14, 'Medidores Individuales', 'CC044', '2025-10-17 11:20:03', '2025-10-17 11:20:03'),
(45, 15, 'Sistemas Hidráulicos', 'CC045', '2025-10-17 11:20:04', '2025-10-17 11:20:04'),
(46, 16, 'Gastos de Verano', 'CC046', '2025-10-17 11:20:05', '2025-10-17 11:20:05'),
(47, 17, 'Consumo de Energía Térmica', 'CC047', '2025-10-17 11:20:06', '2025-10-17 11:20:06'),
(48, 18, 'Cobranza y Penalidades', 'CC048', '2025-10-17 11:20:07', '2025-10-17 11:20:07'),
(49, 19, 'Fee de Administración', 'CC049', '2025-10-17 11:20:08', '2025-10-17 11:20:08'),
(50, 20, 'Vías y Accesos', 'CC050', '2025-10-17 11:20:09', '2025-10-17 11:20:09');

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
(1, 'Condominio Central Providencia', '76543210', '9', NULL, 'Av. Central 1234, Providencia', 'adm@providencia.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(2, 'Residencial Las Condes 500', '98765432', '1', NULL, 'Calle Principal 500, Las Condes', 'admin@lascondes.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(3, 'Edificio Mirador Ñuñoa', '12345678', '9', NULL, 'Pasaje Los Robles 789, Ñuñoa', 'mirador@nunoa.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(4, 'Loteo Maipú Norte', '87654321', '0', NULL, 'Ruta Maipu 100, Maipú', 'loteo@maipu.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(5, 'Parque Estación Central', '23456789', 'K', NULL, 'Alameda 3000, Estación Central', 'parque@central.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(6, 'Condominio Vitacura Hills', '34567890', '1', NULL, 'Av. Kennedy 8000, Vitacura', 'admin@vitacura.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(7, 'Edificio Metro Santiago', '45678901', '2', NULL, 'Calle Bandera 500, Santiago', 'metro@stgo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(8, 'Portal La Florida', '56789012', '3', NULL, 'Av. Vicuña Mackenna 9000, La Florida', 'portal@florida.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(9, 'Condominio Quilpué Sur', '67890123', '4', NULL, 'Calle Marga Marga 50, Quilpué', 'sur@quilpue.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(10, 'Loteo San Miguel', '78901234', '5', NULL, 'Av. Llano Subercaseaux 100, San Miguel', 'admin@sanmiguel.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(11, 'Condominio El Bosque', '89012345', '6', 'Administración de Inmuebles', 'Calle Forestal 150, Ñuñoa', 'admin@bosque.cl', '911112222', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:00', '2025-10-17 11:12:00', NULL, NULL),
(12, 'Residencial Plaza Oeste', '90123456', '7', 'Administración de Inmuebles', 'Av. Central 500, Maipú', 'contacto@plazaOeste.cl', '922223333', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:01', '2025-10-17 11:12:01', NULL, NULL),
(13, 'Edificio Puerto Montt', '91234567', '8', 'Administración de Inmuebles', 'Calle Viento 10, Puerto Montt', 'adm@ptomontt.cl', '933334444', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:02', '2025-10-17 11:12:02', NULL, NULL),
(14, 'Loteo Jardines de Chicureo', '92345678', '9', 'Administración de Inmuebles', 'Ruta Norte 55, Chicureo', 'jardines@chicureo.cl', '944445555', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:03', '2025-10-17 11:12:03', NULL, NULL),
(15, 'Parque Central Iquique', '93456789', 'K', 'Administración de Inmuebles', 'Av. Playa 200, Iquique', 'adm@iquique.cl', '955556666', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:04', '2025-10-17 11:12:04', NULL, NULL),
(16, 'Condominio Viña del Mar', '94567890', '1', 'Administración de Inmuebles', 'Calle Agua Santa 100, Viña del Mar', 'admin@vina.cl', '966667777', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:05', '2025-10-17 11:12:05', NULL, NULL),
(17, 'Edificio Los Aromos', '95678901', '2', 'Administración de Inmuebles', 'Pasaje Los Lagos 700, Concepción', 'aromosedif@gmail.com', '977778888', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:06', '2025-10-17 11:12:06', NULL, NULL),
(18, 'Portal Tobalaba', '96789012', '3', 'Administración de Inmuebles', 'Av. Tobalaba 8500, Peñalolén', 'adm@tobalaba.cl', '988889999', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:07', '2025-10-17 11:12:07', NULL, NULL),
(19, 'Condominio La Serena', '97890123', '4', 'Administración de Inmuebles', 'Calle Mar 10, La Serena', 'admin@laserena.cl', '999990000', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:08', '2025-10-17 11:12:08', NULL, NULL),
(20, 'Loteo Bosque Sur', '98901234', '5', 'Administración de Inmuebles', 'Camino Sur 300, Temuco', 'bosquesur@adm.cl', '900001111', NULL, 'CLP', 'America/Santiago', '2025-10-17 11:12:09', '2025-10-17 11:12:09', NULL, NULL);

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
(1, 2, '2025-10-01', 62000.00, 'Trf 62000 U305', 'TRF-ABC1', 'conciliado', 1, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(2, 4, '2025-10-02', 31000.00, 'Webpay Pago Casa A', 'WP-XYZ2', 'conciliado', 2, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(3, 7, '2025-10-03', 55000.00, 'Depósito efectivo D1502', 'EFE-1233', 'conciliado', 3, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(4, 8, '2025-10-04', 48000.00, 'Transferencia U105', 'TRF-LMN4', 'conciliado', 4, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(5, 10, '2025-10-05', 68000.00, 'Webpay D202', 'WP-QRS5', 'conciliado', 5, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(6, 1, '2025-10-06', 45000.00, 'Transferencia sin identificar', 'TRF-IND6', 'pendiente', 6, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(7, 3, '2025-10-07', 88000.00, 'Pago D402', 'TRF-TUV7', 'pendiente', 7, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(8, 5, '2025-10-08', 73000.00, 'Pago Pendiente D501', 'WP-UVW8', 'pendiente', 8, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(9, 9, '2025-10-09', 49000.00, 'Depósito UQ01', 'EFE-XYZ9', 'pendiente', 9, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(10, 6, '2025-10-10', 95000.00, 'Pago Pendiente D1001', 'TRF-JKL10', 'pendiente', 10, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(11, 2, '2025-10-06', 65000.00, 'Trf 65000 D306', 'TRF-DEF1', 'conciliado', 11, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(12, 4, '2025-10-07', 25000.00, 'Webpay Pago Casa B', 'WP-UVW2', 'conciliado', 12, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(13, 7, '2025-10-08', 60000.00, 'Depósito efectivo D1503', 'EFE-4563', 'conciliado', 13, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(14, 8, '2025-10-09', 40000.00, 'Transferencia D106', 'TRF-PQR4', 'conciliado', 14, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(15, 10, '2025-10-10', 70000.00, 'Webpay D203', 'WP-STU5', 'conciliado', 15, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(16, 1, '2025-10-11', 50000.00, 'Transferencia sin identificar', 'TRF-IND7', 'pendiente', 16, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(17, 3, '2025-10-12', 90000.00, 'Pago D403', 'TRF-WXY7', 'pendiente', 17, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(18, 5, '2025-10-13', 75000.00, 'Pago Pendiente D502', 'WP-ZAB8', 'pendiente', 18, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(19, 9, '2025-10-14', 50000.00, 'Depósito T2', 'EFE-CDE9', 'pendiente', 19, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(20, 6, '2025-10-15', 100000.00, 'Pago Pendiente D1002', 'TRF-FGH10', 'pendiente', 20, NULL, '2025-10-15 21:10:57', '2025-10-15 21:10:57'),
(21, 1, '2025-10-16', 55000.00, 'Trf 55000 D301', 'TRF-P021', 'pendiente', 21, NULL, '2025-10-16 18:36:00', '2025-10-16 18:36:00'),
(22, 2, '2025-10-17', 70000.00, 'Webpay Pago D401', 'WP-P022', 'conciliado', 22, NULL, '2025-10-16 18:36:01', '2025-10-16 18:36:01'),
(23, 3, '2025-10-18', 95000.00, 'Depósito D501', 'EFE-P023', 'pendiente', 23, NULL, '2025-10-16 18:36:02', '2025-10-16 18:36:02'),
(24, 4, '2025-10-19', 30000.00, 'Transferencia Casa C', 'TRF-P024', 'conciliado', 24, NULL, '2025-10-16 18:36:03', '2025-10-16 18:36:03'),
(25, 5, '2025-10-20', 80000.00, 'Webpay D601', 'WP-P025', 'pendiente', 25, NULL, '2025-10-16 18:36:04', '2025-10-16 18:36:04'),
(26, 6, '2025-10-21', 110000.00, 'Depósito D2001', 'EFE-P026', 'conciliado', 26, NULL, '2025-10-16 18:36:05', '2025-10-16 18:36:05'),
(27, 7, '2025-10-22', 65000.00, 'Transferencia D1601', 'TRF-P027', 'pendiente', 27, NULL, '2025-10-16 18:36:06', '2025-10-16 18:36:06'),
(28, 8, '2025-10-23', 85000.00, 'Webpay D201', 'WP-P028', 'conciliado', 28, NULL, '2025-10-16 18:36:07', '2025-10-16 18:36:07'),
(29, 9, '2025-10-24', 60000.00, 'Depósito D30', 'EFE-P029', 'pendiente', 29, NULL, '2025-10-16 18:36:08', '2025-10-16 18:36:08'),
(30, 10, '2025-10-25', 75000.00, 'Transferencia D301', 'TRF-P030', 'conciliado', 30, NULL, '2025-10-16 18:36:09', '2025-10-16 18:36:09'),
(31, 1, '2025-10-26', 60000.00, 'Webpay D401', 'WP-P031', 'conciliado', 31, NULL, '2025-10-17 10:26:00', '2025-10-17 10:26:00'),
(32, 2, '2025-10-27', 75000.00, 'Trf 75000 D501', 'TRF-P032', 'pendiente', 32, NULL, '2025-10-17 10:26:01', '2025-10-17 10:26:01'),
(33, 3, '2025-10-28', 100000.00, 'Webpay D601', 'WP-P033', 'conciliado', 33, NULL, '2025-10-17 10:26:02', '2025-10-17 10:26:02'),
(34, 4, '2025-10-29', 65000.00, 'Depósito Casa D', 'EFE-P034', 'pendiente', 34, NULL, '2025-10-17 10:26:03', '2025-10-17 10:26:03'),
(35, 5, '2025-10-30', 40000.00, 'Transferencia Parcial D701', 'TRF-P035', 'conciliado', 35, NULL, '2025-10-17 10:26:04', '2025-10-17 10:26:04'),
(36, 6, '2025-10-31', 115000.00, 'Webpay D3001', 'WP-P036', 'pendiente', 36, NULL, '2025-10-17 10:26:05', '2025-10-17 10:26:05'),
(37, 7, '2025-11-01', 70000.00, 'Depósito D1701', 'EFE-P037', 'conciliado', 37, NULL, '2025-10-17 10:26:06', '2025-10-17 10:26:06'),
(38, 8, '2025-11-02', 90000.00, 'Transferencia D301', 'TRF-P038', 'pendiente', 38, NULL, '2025-10-17 10:26:07', '2025-10-17 10:26:07'),
(39, 9, '2025-11-03', 65000.00, 'Webpay D40', 'WP-P039', 'conciliado', 39, NULL, '2025-10-17 10:26:08', '2025-10-17 10:26:08'),
(40, 10, '2025-11-04', 80000.00, 'Depósito D401', 'EFE-P040', 'pendiente', 40, NULL, '2025-10-17 10:26:09', '2025-10-17 10:26:09');

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
(1, 1, '2025-01-01', 1.20, 'simple', 2.00, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(2, 2, '2025-01-01', 1.50, 'compuesto', 2.50, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(3, 3, '2025-01-01', 1.00, 'simple', 1.80, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(4, 4, '2025-02-01', 1.10, 'compuesto', 1.90, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(5, 5, '2025-03-01', 1.30, 'simple', 2.10, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(6, 6, '2025-04-01', 1.40, 'compuesto', 2.30, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(7, 7, '2025-05-01', 1.60, 'simple', 2.60, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(8, 8, '2025-06-01', 1.15, 'compuesto', 1.95, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(9, 9, '2025-07-01', 1.25, 'simple', 2.05, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(10, 10, '2025-08-01', 1.55, 'compuesto', 2.45, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(11, 1, '2026-01-01', 1.30, 'compuesto', 2.20, '2025-10-17 11:01:00', '2025-10-17 11:01:00'),
(12, 2, '2026-01-01', 1.60, 'simple', 2.80, '2025-10-17 11:01:01', '2025-10-17 11:01:01'),
(13, 3, '2026-01-01', 1.10, 'compuesto', 1.90, '2025-10-17 11:01:02', '2025-10-17 11:01:02'),
(14, 4, '2026-02-01', 1.20, 'simple', 2.10, '2025-10-17 11:01:03', '2025-10-17 11:01:03'),
(15, 5, '2026-03-01', 1.40, 'compuesto', 2.30, '2025-10-17 11:01:04', '2025-10-17 11:01:04'),
(16, 6, '2026-04-01', 1.50, 'simple', 2.50, '2025-10-17 11:01:05', '2025-10-17 11:01:05'),
(17, 7, '2026-05-01', 1.70, 'compuesto', 2.70, '2025-10-17 11:01:06', '2025-10-17 11:01:06'),
(18, 8, '2026-06-01', 1.25, 'simple', 2.05, '2025-10-17 11:01:07', '2025-10-17 11:01:07'),
(19, 9, '2026-07-01', 1.35, 'compuesto', 2.15, '2025-10-17 11:01:08', '2025-10-17 11:01:08'),
(20, 10, '2026-08-01', 1.65, 'simple', 2.55, '2025-10-17 11:01:09', '2025-10-17 11:01:09'),
(21, 11, '2026-01-01', 1.20, 'simple', 2.00, '2025-10-17 11:14:00', '2025-10-17 11:14:00'),
(22, 12, '2026-01-01', 1.50, 'compuesto', 2.50, '2025-10-17 11:14:01', '2025-10-17 11:14:01'),
(23, 13, '2026-01-01', 1.00, 'simple', 1.80, '2025-10-17 11:14:02', '2025-10-17 11:14:02'),
(24, 14, '2026-02-01', 1.10, 'compuesto', 1.90, '2025-10-17 11:14:03', '2025-10-17 11:14:03'),
(25, 15, '2026-03-01', 1.30, 'simple', 2.10, '2025-10-17 11:14:04', '2025-10-17 11:14:04'),
(26, 16, '2026-04-01', 1.40, 'compuesto', 2.30, '2025-10-17 11:14:05', '2025-10-17 11:14:05'),
(27, 17, '2026-05-01', 1.60, 'simple', 2.60, '2025-10-17 11:14:06', '2025-10-17 11:14:06'),
(28, 18, '2026-06-01', 1.15, 'compuesto', 1.95, '2025-10-17 11:14:07', '2025-10-17 11:14:07'),
(29, 19, '2026-07-01', 1.25, 'simple', 2.05, '2025-10-17 11:14:08', '2025-10-17 11:14:08'),
(30, 20, '2026-08-01', 1.55, 'compuesto', 2.45, '2025-10-17 11:14:09', '2025-10-17 11:14:09');

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
(1, 1, 1, 1, 45000.00, 45000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(2, 2, 2, 3, 62000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(3, 3, 3, 4, 88000.00, 88000.00, 'vencido', 1500.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(4, 4, 4, 5, 51000.00, 20000.00, 'parcial', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(5, 5, 5, 6, 73000.00, 73000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(6, 6, 6, 7, 95000.00, 95000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(7, 7, 7, 8, 55000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(8, 8, 8, 9, 78000.00, 30000.00, 'parcial', 500.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(9, 9, 9, 10, 49000.00, 49000.00, 'vencido', 800.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(10, 10, 10, 10, 68000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(11, 11, 1, 11, 50000.00, 50000.00, 'pendiente', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(12, 12, 2, 13, 65000.00, 0.00, 'pagado', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(13, 13, 3, 14, 90000.00, 90000.00, 'vencido', 1800.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(14, 14, 4, 15, 55000.00, 30000.00, 'parcial', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(15, 15, 5, 16, 75000.00, 75000.00, 'pendiente', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(16, 16, 6, 17, 100000.00, 100000.00, 'pendiente', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(17, 17, 7, 18, 60000.00, 0.00, 'pagado', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(18, 18, 8, 19, 80000.00, 40000.00, 'parcial', 600.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(19, 19, 9, 20, 50000.00, 50000.00, 'vencido', 900.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(20, 20, 10, 10, 70000.00, 0.00, 'pagado', 0.00, '2025-10-15 21:10:52', '2025-10-15 21:10:52'),
(21, 21, 1, 21, 55000.00, 55000.00, 'pendiente', 0.00, '2025-10-16 18:26:00', '2025-10-16 18:26:00'),
(22, 22, 2, 22, 70000.00, 70000.00, 'pendiente', 0.00, '2025-10-16 18:26:01', '2025-10-16 18:26:01'),
(23, 23, 3, 23, 95000.00, 95000.00, 'pendiente', 0.00, '2025-10-16 18:26:02', '2025-10-16 18:26:02'),
(24, 24, 4, 24, 60000.00, 60000.00, 'pendiente', 0.00, '2025-10-16 18:26:03', '2025-10-16 18:26:03'),
(25, 25, 5, 25, 80000.00, 80000.00, 'pendiente', 0.00, '2025-10-16 18:26:04', '2025-10-16 18:26:04'),
(26, 26, 6, 26, 110000.00, 110000.00, 'pendiente', 0.00, '2025-10-16 18:26:05', '2025-10-16 18:26:05'),
(27, 27, 7, 27, 65000.00, 65000.00, 'pendiente', 0.00, '2025-10-16 18:26:06', '2025-10-16 18:26:06'),
(28, 28, 8, 28, 85000.00, 85000.00, 'pendiente', 0.00, '2025-10-16 18:26:07', '2025-10-16 18:26:07'),
(29, 29, 9, 29, 60000.00, 60000.00, 'pendiente', 0.00, '2025-10-16 18:26:08', '2025-10-16 18:26:08'),
(30, 30, 10, 30, 75000.00, 75000.00, 'pendiente', 0.00, '2025-10-16 18:26:09', '2025-10-16 18:26:09'),
(31, 31, 1, 31, 60000.00, 60000.00, 'pendiente', 0.00, '2025-10-17 10:16:00', '2025-10-17 10:16:00'),
(32, 32, 2, 32, 75000.00, 75000.00, 'pendiente', 0.00, '2025-10-17 10:16:01', '2025-10-17 10:16:01'),
(33, 33, 3, 33, 100000.00, 100000.00, 'pendiente', 0.00, '2025-10-17 10:16:02', '2025-10-17 10:16:02'),
(34, 34, 4, 34, 65000.00, 65000.00, 'pendiente', 0.00, '2025-10-17 10:16:03', '2025-10-17 10:16:03'),
(35, 35, 5, 35, 85000.00, 85000.00, 'pendiente', 0.00, '2025-10-17 10:16:04', '2025-10-17 10:16:04'),
(36, 36, 6, 36, 115000.00, 115000.00, 'pendiente', 0.00, '2025-10-17 10:16:05', '2025-10-17 10:16:05'),
(37, 37, 7, 37, 70000.00, 70000.00, 'pendiente', 0.00, '2025-10-17 10:16:06', '2025-10-17 10:16:06'),
(38, 38, 8, 38, 90000.00, 90000.00, 'pendiente', 0.00, '2025-10-17 10:16:07', '2025-10-17 10:16:07'),
(39, 39, 9, 39, 65000.00, 65000.00, 'pendiente', 0.00, '2025-10-17 10:16:08', '2025-10-17 10:16:08'),
(40, 40, 10, 40, 80000.00, 80000.00, 'pendiente', 0.00, '2025-10-17 10:16:09', '2025-10-17 10:16:09');

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
(1, 1, 1, 'Gasto Base Operacional', 45000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(2, 2, 2, 'Aporte Fondo Reserva', 62000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(3, 3, 3, 'Cuota por Gasto Extraordinario', 88000.00, 'ajuste', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(4, 4, 4, 'Multa por Atraso', 10000.00, 'multa', NULL, 0, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(5, 4, 5, 'Consumo Agua Caliente', 41000.00, 'consumo', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(6, 5, 6, 'Gastos Fijos y Seguros', 73000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(7, 6, 7, 'Cuota por Reparación Ascensores', 95000.00, 'ajuste', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(8, 7, 8, 'Recargo uso Amenidades', 55000.00, 'multa', NULL, 0, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(9, 8, 9, 'Gasto de Administración', 78000.00, 'gasto', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(10, 9, 10, 'Consumo Electricidad', 49000.00, 'consumo', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(11, 11, 11, 'Gasto Mantención Eléctrica', 50000.00, 'gasto', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(12, 12, 12, 'Aporte Fondo Hidráulico', 65000.00, 'gasto', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(13, 13, 13, 'Cuota Proyecto Capital', 90000.00, 'ajuste', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(14, 14, 14, 'Multa por Cobranza', 15000.00, 'multa', NULL, 0, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(15, 14, 15, 'Consumo Gas', 40000.00, 'consumo', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(16, 15, 16, 'Gastos de RR.HH.', 75000.00, 'gasto', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(17, 16, 17, 'Cuota Vigilancia', 100000.00, 'ajuste', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(18, 17, 18, 'Recargo uso Sauna', 60000.00, 'multa', NULL, 0, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(19, 18, 19, 'Gasto Infraestructura', 80000.00, 'gasto', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(20, 19, 20, 'Consumo Agua', 50000.00, 'consumo', NULL, 1, '2025-10-15 21:10:53', '2025-10-15 21:10:53'),
(21, 21, 21, 'Gasto Seguridad y Vigilancia', 55000.00, 'gasto', NULL, 1, '2025-10-16 18:27:00', '2025-10-16 18:27:00'),
(22, 22, 22, 'Gasto Mantención Áreas Verdes', 70000.00, 'gasto', NULL, 1, '2025-10-16 18:27:01', '2025-10-16 18:27:01'),
(23, 23, 23, 'Gasto Insumos de Aseo', 95000.00, 'gasto', NULL, 1, '2025-10-16 18:27:02', '2025-10-16 18:27:02'),
(24, 24, 24, 'Gasto Honorarios Contables', 60000.00, 'gasto', NULL, 1, '2025-10-16 18:27:03', '2025-10-16 18:27:03'),
(25, 25, 25, 'Cuota Gasto de Cobranza Legal', 80000.00, 'ajuste', NULL, 1, '2025-10-16 18:27:04', '2025-10-16 18:27:04'),
(26, 26, 26, 'Gasto Climatización y Calefacción', 110000.00, 'gasto', NULL, 1, '2025-10-16 18:27:05', '2025-10-16 18:27:05'),
(27, 27, 27, 'Gasto Capacitación Personal', 65000.00, 'gasto', NULL, 1, '2025-10-16 18:27:06', '2025-10-16 18:27:06'),
(28, 28, 28, 'Cuota Mejoras Estéticas (Pintura)', 85000.00, 'ajuste', NULL, 1, '2025-10-16 18:27:07', '2025-10-16 18:27:07'),
(29, 29, 29, 'Aporte a Fondo de Mantención', 60000.00, 'gasto', NULL, 1, '2025-10-16 18:27:08', '2025-10-16 18:27:08'),
(30, 30, 30, 'Cuota Inspección Estructural', 75000.00, 'ajuste', NULL, 1, '2025-10-16 18:27:09', '2025-10-16 18:27:09'),
(31, 31, 31, 'Cuota Mantención Ascensores', 60000.00, 'gasto', NULL, 1, '2025-10-17 10:17:00', '2025-10-17 10:17:00'),
(32, 32, 32, 'Servicio Control de Plagas', 75000.00, 'gasto', NULL, 1, '2025-10-17 10:17:01', '2025-10-17 10:17:01'),
(33, 33, 33, 'Reparaciones Eléctricas Comunes', 100000.00, 'gasto', NULL, 1, '2025-10-17 10:17:02', '2025-10-17 10:17:02'),
(34, 34, 34, 'Costo Comunicación Comunitaria', 65000.00, 'gasto', NULL, 1, '2025-10-17 10:17:03', '2025-10-17 10:17:03'),
(35, 35, 35, 'Gasto Servicio de Internet', 85000.00, 'gasto', NULL, 1, '2025-10-17 10:17:04', '2025-10-17 10:17:04'),
(36, 36, 36, 'Cuota Mantención de Piscinas', 115000.00, 'gasto', NULL, 1, '2025-10-17 10:17:05', '2025-10-17 10:17:05'),
(37, 37, 37, 'Mantención Red de Gas Común', 70000.00, 'gasto', NULL, 1, '2025-10-17 10:17:06', '2025-10-17 10:17:06'),
(38, 38, 38, 'Aporte Extraordinario Materiales', 90000.00, 'ajuste', NULL, 1, '2025-10-17 10:17:07', '2025-10-17 10:17:07'),
(39, 39, 39, 'Cuota Extraordinaria Paisajismo', 65000.00, 'ajuste', NULL, 1, '2025-10-17 10:17:08', '2025-10-17 10:17:08'),
(40, 40, 40, 'Gasto Reparación Sistemas de Agua', 80000.00, 'gasto', NULL, 1, '2025-10-17 10:17:09', '2025-10-17 10:17:09');

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
(1, 1, 1, 1, 119000.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(2, 2, 2, 2, 59500.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(3, 3, 3, 3, 89250.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(4, 4, 4, 4, 35700.00, 'fijo_por_unidad', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(5, 5, 5, 5, 107100.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(6, 6, 6, 6, 142800.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(7, 7, 7, 7, 95200.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(8, 8, 8, 8, 47600.00, 'fijo_por_unidad', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(9, 9, 9, 9, 178500.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(10, 10, 10, 10, 71400.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(11, 1, 21, 11, 142800.00, 'coeficiente', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(12, 2, 22, 12, 95200.00, 'partes_iguales', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(13, 3, 23, 13, 47600.00, 'coeficiente', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(14, 4, 24, 14, 178500.00, 'fijo_por_unidad', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(15, 5, 25, 15, 71400.00, 'consumo', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(16, 6, 16, 16, 119000.00, 'coeficiente', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(17, 7, 17, 17, 59500.00, 'partes_iguales', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(18, 8, 18, 18, 89250.00, 'fijo_por_unidad', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(19, 9, 19, 19, 35700.00, 'coeficiente', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(20, 10, 20, 20, 107100.00, 'consumo', NULL, '2025-10-15 21:10:30', '2025-10-15 21:10:30'),
(21, 21, 26, 21, 178500.00, 'coeficiente', NULL, '2025-10-16 18:25:00', '2025-10-16 18:25:00'),
(22, 22, 27, 22, 59500.00, 'partes_iguales', NULL, '2025-10-16 18:25:01', '2025-10-16 18:25:01'),
(23, 23, 28, 23, 95200.00, 'coeficiente', NULL, '2025-10-16 18:25:02', '2025-10-16 18:25:02'),
(24, 24, 29, 24, 35700.00, 'fijo_por_unidad', NULL, '2025-10-16 18:25:03', '2025-10-16 18:25:03'),
(25, 25, 30, 25, 142800.00, 'coeficiente', NULL, '2025-10-16 18:25:04', '2025-10-16 18:25:04'),
(26, 26, 31, 26, 119000.00, 'partes_iguales', NULL, '2025-10-16 18:25:05', '2025-10-16 18:25:05'),
(27, 27, 32, 27, 47600.00, 'coeficiente', NULL, '2025-10-16 18:25:06', '2025-10-16 18:25:06'),
(28, 28, 33, 28, 89250.00, 'fijo_por_unidad', NULL, '2025-10-16 18:25:07', '2025-10-16 18:25:07'),
(29, 29, 34, 29, 59500.00, 'coeficiente', NULL, '2025-10-16 18:25:08', '2025-10-16 18:25:08'),
(30, 30, 35, 30, 178500.00, 'partes_iguales', NULL, '2025-10-16 18:25:09', '2025-10-16 18:25:09'),
(31, 31, 36, 31, 107100.00, 'coeficiente', NULL, '2025-10-17 10:15:00', '2025-10-17 10:15:00'),
(32, 32, 37, 32, 47600.00, 'partes_iguales', NULL, '2025-10-17 10:15:01', '2025-10-17 10:15:01'),
(33, 33, 38, 33, 77350.00, 'coeficiente', NULL, '2025-10-17 10:15:02', '2025-10-17 10:15:02'),
(34, 34, 39, 34, 29750.00, 'fijo_por_unidad', NULL, '2025-10-17 10:15:03', '2025-10-17 10:15:03'),
(35, 35, 40, 35, 95200.00, 'coeficiente', NULL, '2025-10-17 10:15:04', '2025-10-17 10:15:04'),
(36, 36, 41, 36, 154700.00, 'partes_iguales', NULL, '2025-10-17 10:15:05', '2025-10-17 10:15:05'),
(37, 37, 42, 37, 53550.00, 'coeficiente', NULL, '2025-10-17 10:15:06', '2025-10-17 10:15:06'),
(38, 38, 43, 38, 83300.00, 'fijo_por_unidad', NULL, '2025-10-17 10:15:07', '2025-10-17 10:15:07'),
(39, 39, 44, 39, 65450.00, 'coeficiente', NULL, '2025-10-17 10:15:08', '2025-10-17 10:15:08'),
(40, 40, 45, 40, 119000.00, 'partes_iguales', NULL, '2025-10-17 10:15:09', '2025-10-17 10:15:09');

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
(1, 1, 1, 'factura', 'F-1001', '2025-09-01', 100000.00, 19000.00, 0.00, 119000.00, 'Servicio de Aseo Septiembre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(2, 2, 2, 'boleta', 'B-2005', '2025-09-02', 50000.00, 9500.00, 0.00, 59500.00, 'Compra de cámara de repuesto', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(3, 3, 3, 'factura', 'F-3010', '2025-09-03', 75000.00, 14250.00, 0.00, 89250.00, 'Mantención Jardines Trimestral', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(4, 4, 4, 'boleta', 'B-4001', '2025-09-04', 30000.00, 5700.00, 0.00, 35700.00, 'Reparación de válvula principal', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(5, 5, 5, 'factura', 'F-5015', '2025-09-05', 90000.00, 17100.00, 0.00, 107100.00, 'Reparación de luminaria exterior', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(6, 6, 6, 'factura', 'F-6002', '2025-09-06', 120000.00, 22800.00, 0.00, 142800.00, 'Honorarios Contables Septiembre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(7, 7, 7, 'factura', 'F-7007', '2025-09-07', 80000.00, 15200.00, 0.00, 95200.00, 'Mantención Ascensores', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(8, 8, 8, 'boleta', 'B-8003', '2025-09-08', 40000.00, 7600.00, 0.00, 47600.00, 'Compra de pintura para pasillos', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(9, 9, 9, 'factura', 'F-9011', '2025-09-09', 150000.00, 28500.00, 0.00, 178500.00, 'Fee Administración Septiembre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(10, 10, 10, 'boleta', 'B-1002', '2025-09-10', 60000.00, 11400.00, 0.00, 71400.00, 'Revisión técnica de red de gas', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(16, 6, 16, 'factura', 'F-6004', '2025-10-10', 100000.00, 19000.00, 0.00, 119000.00, 'Licencia Software Adm.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(17, 7, 17, 'boleta', 'B-7008', '2025-10-11', 50000.00, 9500.00, 0.00, 59500.00, 'Compra de radios portátiles.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(18, 8, 18, 'factura', 'F-8012', '2025-10-12', 75000.00, 14250.00, 0.00, 89250.00, 'Materiales para reparación muro.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(19, 9, 19, 'boleta', 'B-9004', '2025-10-13', 30000.00, 5700.00, 0.00, 35700.00, 'Asesoría por cobro judicial.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(20, 10, 20, 'factura', 'F-1004', '2025-10-14', 90000.00, 17100.00, 0.00, 107100.00, 'Informe financiero trimestral.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(21, 1, 11, 'boleta', 'B-1007', '2025-10-15', 120000.00, 22800.00, 0.00, 142800.00, 'Reparación de iluminación exterior.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(22, 2, 12, 'factura', 'F-2012', '2025-10-16', 80000.00, 15200.00, 0.00, 95200.00, 'Arreglo de bomba de agua.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(23, 3, 13, 'boleta', 'B-3004', '2025-10-17', 40000.00, 7600.00, 0.00, 47600.00, 'Compra de fertilizante.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(24, 4, 14, 'factura', 'F-4012', '2025-10-18', 150000.00, 28500.00, 0.00, 178500.00, 'Reparación de muro perimetral.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(25, 5, 15, 'boleta', 'B-5004', '2025-10-19', 60000.00, 11400.00, 0.00, 71400.00, 'Inspección de ascensor.', '2025-10-15 21:10:27', '2025-10-15 21:10:27'),
(26, 1, 21, 'factura', 'F-1005', '2025-10-15', 150000.00, 28500.00, 0.00, 178500.00, 'Servicios de Vigilancia Octubre', '2025-10-16 18:18:00', '2025-10-16 18:18:00'),
(27, 2, 22, 'boleta', 'B-2015', '2025-10-16', 50000.00, 9500.00, 0.00, 59500.00, 'Fertilizantes y semillas', '2025-10-16 18:18:01', '2025-10-16 18:18:01'),
(28, 3, 23, 'factura', 'F-3011', '2025-10-17', 80000.00, 15200.00, 0.00, 95200.00, 'Insumos de limpieza trimestral', '2025-10-16 18:18:02', '2025-10-16 18:18:02'),
(29, 4, 24, 'boleta', 'B-4005', '2025-10-18', 30000.00, 5700.00, 0.00, 35700.00, 'Honorarios Contables Q3', '2025-10-16 18:18:03', '2025-10-16 18:18:03'),
(30, 5, 25, 'factura', 'F-5016', '2025-10-19', 120000.00, 22800.00, 0.00, 142800.00, 'Asesoría legal por morosos', '2025-10-16 18:18:04', '2025-10-16 18:18:04'),
(31, 6, 26, 'factura', 'F-6005', '2025-10-20', 100000.00, 19000.00, 0.00, 119000.00, 'Mantención Climatización 6 meses', '2025-10-16 18:18:05', '2025-10-16 18:18:05'),
(32, 7, 27, 'boleta', 'B-7009', '2025-10-21', 40000.00, 7600.00, 0.00, 47600.00, 'Capacitación nuevo personal', '2025-10-16 18:18:06', '2025-10-16 18:18:06'),
(33, 8, 28, 'factura', 'F-8013', '2025-10-22', 75000.00, 14250.00, 0.00, 89250.00, 'Pintura para áreas comunes B3', '2025-10-16 18:18:07', '2025-10-16 18:18:07'),
(34, 9, 29, 'boleta', 'B-9005', '2025-10-23', 50000.00, 9500.00, 0.00, 59500.00, 'Informe financiero trimestral', '2025-10-16 18:18:08', '2025-10-16 18:18:08'),
(35, 10, 30, 'factura', 'F-1005', '2025-10-24', 150000.00, 28500.00, 0.00, 178500.00, 'Inspección estructural anual', '2025-10-16 18:18:09', '2025-10-16 18:18:09'),
(36, 1, 31, 'factura', 'F-1006', '2025-11-01', 90000.00, 17100.00, 0.00, 107100.00, 'Mantención Ascensores Noviembre', '2025-10-17 10:08:00', '2025-10-17 10:08:00'),
(37, 2, 32, 'boleta', 'B-2016', '2025-11-02', 40000.00, 7600.00, 0.00, 47600.00, 'Servicio de fumigación general', '2025-10-17 10:08:01', '2025-10-17 10:08:01'),
(38, 3, 33, 'factura', 'F-3012', '2025-11-03', 65000.00, 12350.00, 0.00, 77350.00, 'Reparación circuito eléctrico', '2025-10-17 10:08:02', '2025-10-17 10:08:02'),
(39, 4, 34, 'boleta', 'B-4006', '2025-11-04', 25000.00, 4750.00, 0.00, 29750.00, 'Diseño de encuesta de satisfacción', '2025-10-17 10:08:03', '2025-10-17 10:08:03'),
(40, 5, 35, 'factura', 'F-5017', '2025-11-05', 80000.00, 15200.00, 0.00, 95200.00, 'Servicio de internet áreas comunes', '2025-10-17 10:08:04', '2025-10-17 10:08:04'),
(41, 6, 36, 'factura', 'F-6006', '2025-11-06', 130000.00, 24700.00, 0.00, 154700.00, 'Mantención trimestral de piscina', '2025-10-17 10:08:05', '2025-10-17 10:08:05'),
(42, 7, 37, 'boleta', 'B-7010', '2025-11-07', 45000.00, 8550.00, 0.00, 53550.00, 'Revisión red de gas central', '2025-10-17 10:08:06', '2025-10-17 10:08:06'),
(43, 8, 38, 'factura', 'F-8014', '2025-11-08', 70000.00, 13300.00, 0.00, 83300.00, 'Compra de cemento y arena', '2025-10-17 10:08:07', '2025-10-17 10:08:07'),
(44, 9, 39, 'boleta', 'B-9006', '2025-11-09', 55000.00, 10450.00, 0.00, 65450.00, 'Diseño de nuevo jardín temático', '2025-10-17 10:08:08', '2025-10-17 10:08:08'),
(45, 10, 40, 'factura', 'F-1006', '2025-11-10', 100000.00, 19000.00, 0.00, 119000.00, 'Reparación de bomba de agua N°2', '2025-10-17 10:08:09', '2025-10-17 10:08:09');

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
(1, 1, 'circular', 'Aviso corte de agua', 'https://docs.cc/c1/circular-agua.pdf', '2025-10', 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(2, 2, 'acta', 'Acta Asamblea Anual 2024', 'https://docs.cc/c2/acta-2024.pdf', '2024-12', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(3, 3, 'reglamento', 'Reglamento de Copropiedad', 'https://docs.cc/c3/reglamento.pdf', NULL, 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(4, 4, 'boletin', 'Boletín N°10 Octubre', 'https://docs.cc/c4/boletin-10.pdf', '2025-10', 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(5, 5, 'otro', 'Informe Técnico Ascensores', 'https://docs.cc/c5/informe-asc.pdf', '2025-09', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(6, 6, 'circular', 'Cambio en Horario de Piscina', 'https://docs.cc/c6/circ-piscina.pdf', '2025-10', 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(7, 7, 'acta', 'Acta Reunión Comité', 'https://docs.cc/c7/acta-comite-10.pdf', '2025-10', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(8, 8, 'reglamento', 'Uso de Estacionamientos', 'https://docs.cc/c8/regl-estac.pdf', NULL, 'publico', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(9, 9, 'boletin', 'Resumen Gastos Q3', 'https://docs.cc/c9/resumen-q3.pdf', '2025-09', 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(10, 10, 'otro', 'Certificado Recepción Final', 'https://docs.cc/c10/cert-final.pdf', NULL, 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(11, 1, 'circular', 'Aviso de Mantención de Piscina', 'https://docs.cc/c1/circ-piscina.pdf', '2025-11', 'publico', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(12, 2, 'acta', 'Acta Reunión Comité Nov', 'https://docs.cc/c2/acta-nov.pdf', '2025-11', 'privado', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(13, 3, 'reglamento', 'Reglamento de Sala de Reuniones', 'https://docs.cc/c3/regl-reuniones.pdf', NULL, 'publico', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(14, 4, 'boletin', 'Boletín N°11 Noviembre', 'https://docs.cc/c4/boletin-11.pdf', '2025-11', 'publico', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(15, 5, 'otro', 'Plan de Emergencia', 'https://docs.cc/c5/plan-emerg.pdf', NULL, 'privado', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(16, 6, 'circular', 'Normativa de Zona Mascotas', 'https://docs.cc/c6/circ-mascotas.pdf', '2025-11', 'publico', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(17, 7, 'acta', 'Acta Asamblea Extraordinaria', 'https://docs.cc/c7/acta-extra.pdf', '2025-11', 'privado', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(18, 8, 'reglamento', 'Uso de Sala de Música', 'https://docs.cc/c8/regl-musica.pdf', NULL, 'publico', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(19, 9, 'boletin', 'Resumen Gastos Q4 Proyectado', 'https://docs.cc/c9/resumen-q4.pdf', '2025-11', 'privado', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(20, 10, 'otro', 'Manual de Convivencia', 'https://docs.cc/c10/manual-conv.pdf', NULL, 'publico', '2025-10-15 21:11:41', '2025-10-15 21:11:41'),
(21, 1, 'circular', 'Aviso cambio de administración', 'https://docs.cc/c1/circ-adm.pdf', '2025-11', 'privado', '2025-10-17 11:03:00', '2025-10-17 11:03:00'),
(22, 2, 'acta', 'Acta Reunión Extraordinaria', 'https://docs.cc/c2/acta-extra.pdf', '2025-12', 'privado', '2025-10-17 11:03:01', '2025-10-17 11:03:01'),
(23, 3, 'reglamento', 'Reglamento de Uso de Piscina', 'https://docs.cc/c3/regl-piscina.pdf', NULL, 'publico', '2025-10-17 11:03:02', '2025-10-17 11:03:02'),
(24, 4, 'boletin', 'Boletín N°12 Diciembre', 'https://docs.cc/c4/boletin-12.pdf', '2025-12', 'publico', '2025-10-17 11:03:03', '2025-10-17 11:03:03'),
(25, 5, 'otro', 'Certificado de Habitabilidad', 'https://docs.cc/c5/cert-hab.pdf', NULL, 'privado', '2025-10-17 11:03:04', '2025-10-17 11:03:04'),
(26, 6, 'circular', 'Cierre de Gimnasio por Mantención', 'https://docs.cc/c6/circ-gimnasio.pdf', '2025-11', 'publico', '2025-10-17 11:03:05', '2025-10-17 11:03:05'),
(27, 7, 'acta', 'Acta Asamblea de Propietarios', 'https://docs.cc/c7/acta-prop.pdf', '2025-12', 'privado', '2025-10-17 11:03:06', '2025-10-17 11:03:06'),
(28, 8, 'reglamento', 'Normativa de Mudanzas', 'https://docs.cc/c8/regl-mudanza.pdf', NULL, 'publico', '2025-10-17 11:03:07', '2025-10-17 11:03:07'),
(29, 9, 'boletin', 'Resumen Gastos Anual Proyectado', 'https://docs.cc/c9/resumen-anual.pdf', '2025-12', 'privado', '2025-10-17 11:03:08', '2025-10-17 11:03:08'),
(30, 10, 'otro', 'Plan de Seguridad Comunal', 'https://docs.cc/c10/plan-seguridad.pdf', NULL, 'privado', '2025-10-17 11:03:09', '2025-10-17 11:03:09');

-- --------------------------------------------------------

--
-- Table structure for table `documento_multa`
--

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

--
-- Dumping data for table `documento_multa`
--

INSERT INTO `documento_multa` (`id`, `multa_id`, `nombre_archivo`, `ruta_archivo`, `tipo_archivo`, `tamanio_bytes`, `descripcion`, `subido_por`, `created_at`) VALUES
(11, 1, 'Foto_Mascota_D101.jpg', '/multas/c1/foto_m1.jpg', 'image/jpeg', 850000, 'Evidencia gráfica de la infracción de mascota.', 6, '2025-10-14 10:00:00'),
(12, 3, 'Ticket_Bloqueo_C4.pdf', '/multas/c3/ticket_m3.pdf', 'application/pdf', 120000, 'Ticket de infracción emitido por Conserje.', 6, '2025-10-14 11:30:00');

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
(1, 1, 'Edificio Central A', 'Av. Central 1234', 'A', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(2, 2, 'Edificio Norte B', 'Calle Principal 500', 'B', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(3, 3, 'Edificio Único', 'Pasaje Los Robles 789', 'U', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(4, 4, 'Zona Casas 1', 'Ruta Maipu 100', 'C1', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(5, 5, 'Torre Alameda', 'Alameda 3000', 'TA', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(6, 6, 'Torre Lujo', 'Av. Kennedy 8000', 'TL', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(7, 7, 'Torre Histórica', 'Calle Bandera 500', 'TH', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(8, 8, 'Bloque 1', 'Av. Vicuña Mackenna 9000', 'B1', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(9, 9, 'Torre 1', 'Calle Marga Marga 50', 'T1', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(10, 10, 'Torre El Llano', 'Av. Llano Subercaseaux 100', 'LL', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(11, 1, 'Edificio Central B', 'Av. Central 1234, Providencia', 'B', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(12, 2, 'Edificio Sur C', 'Calle Principal 500, Las Condes', 'C', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(13, 3, 'Torre Nueva Ñuñoa', 'Pasaje Los Robles 789, Ñuñoa', 'TN', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(14, 4, 'Zona Casas 2', 'Ruta Maipu 100', 'C2', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(15, 5, 'Torre República', 'Alameda 3000', 'TR', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(16, 6, 'Torre Premium', 'Av. Kennedy 8000', 'TP', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(17, 7, 'Torre Futuro', 'Calle Bandera 500', 'TF', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(18, 8, 'Bloque 2', 'Av. Vicuña Mackenna 9000', 'B2', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(19, 9, 'Torre 2', 'Calle Marga Marga 50', 'T2', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(20, 10, 'Torre San Miguel', 'Av. Llano Subercaseaux 100', 'TSM', '2025-10-15 21:10:10', '2025-10-15 21:10:10'),
(21, 1, 'Edificio C', 'Av. Central 1234', 'C', '2025-10-16 18:13:00', '2025-10-16 18:13:00'),
(22, 2, 'Edificio Sur A', 'Calle Principal 500', 'SA', '2025-10-16 18:13:01', '2025-10-16 18:13:01'),
(23, 3, 'Torre Antigua Ñuñoa', 'Pasaje Los Robles 789', 'TA', '2025-10-16 18:13:02', '2025-10-16 18:13:02'),
(24, 4, 'Zona Casas 3', 'Ruta Maipu 100', 'C3', '2025-10-16 18:13:03', '2025-10-16 18:13:03'),
(25, 5, 'Torre Europa', 'Alameda 3000', 'TE', '2025-10-16 18:13:04', '2025-10-16 18:13:04'),
(26, 6, 'Torre Master', 'Av. Kennedy 8000', 'TM', '2025-10-16 18:13:05', '2025-10-16 18:13:05'),
(27, 7, 'Torre Moderno', 'Calle Bandera 500', 'TM', '2025-10-16 18:13:06', '2025-10-16 18:13:06'),
(28, 8, 'Bloque 3', 'Av. Vicuña Mackenna 9000', 'B3', '2025-10-16 18:13:07', '2025-10-16 18:13:07'),
(29, 9, 'Torre 3', 'Calle Marga Marga 50', 'T3', '2025-10-16 18:13:08', '2025-10-16 18:13:08'),
(30, 10, 'Torre Sur', 'Av. Llano Subercaseaux 100', 'TS', '2025-10-16 18:13:09', '2025-10-16 18:13:09'),
(31, 1, 'Edificio D', 'Av. Central 1234', 'D', '2025-10-17 10:03:00', '2025-10-17 10:03:00'),
(32, 2, 'Edificio Oeste A', 'Calle Principal 500', 'OA', '2025-10-17 10:03:01', '2025-10-17 10:03:01'),
(33, 3, 'Torre Moderna Ñuñoa', 'Pasaje Los Robles 789', 'TMN', '2025-10-17 10:03:02', '2025-10-17 10:03:02'),
(34, 4, 'Zona Casas 4', 'Ruta Maipu 100', 'C4', '2025-10-17 10:03:03', '2025-10-17 10:03:03'),
(35, 5, 'Torre Asia', 'Alameda 3000', 'TA', '2025-10-17 10:03:04', '2025-10-17 10:03:04'),
(36, 6, 'Torre Jardín', 'Av. Kennedy 8000', 'TJ', '2025-10-17 10:03:05', '2025-10-17 10:03:05'),
(37, 7, 'Torre Río', 'Calle Bandera 500', 'TR', '2025-10-17 10:03:06', '2025-10-17 10:03:06'),
(38, 8, 'Bloque 4', 'Av. Vicuña Mackenna 9000', 'B4', '2025-10-17 10:03:07', '2025-10-17 10:03:07'),
(39, 9, 'Torre 4', 'Calle Marga Marga 50', 'T4', '2025-10-17 10:03:08', '2025-10-17 10:03:08'),
(40, 10, 'Torre Norte', 'Av. Llano Subercaseaux 100', 'TN', '2025-10-17 10:03:09', '2025-10-17 10:03:09'),
(41, 11, 'Torre A Bosque', 'Calle Forestal 150', 'EBA', '2025-10-17 11:15:00', '2025-10-17 11:15:00'),
(42, 12, 'Bloque Principal Oeste', 'Av. Central 500', 'BPO', '2025-10-17 11:15:01', '2025-10-17 11:15:01'),
(43, 13, 'Torre Costanera', 'Calle Viento 10', 'TC', '2025-10-17 11:15:02', '2025-10-17 11:15:02'),
(44, 14, 'Sector Parcelas', 'Ruta Norte 55', 'SP', '2025-10-17 11:15:03', '2025-10-17 11:15:03'),
(45, 15, 'Torre Playa', 'Av. Playa 200', 'TPL', '2025-10-17 11:15:04', '2025-10-17 11:15:04'),
(46, 16, 'Edificio Central Viña', 'Calle Agua Santa 100', 'ECV', '2025-10-17 11:15:05', '2025-10-17 11:15:05'),
(47, 17, 'Bloque Único', 'Pasaje Los Lagos 700', 'BU', '2025-10-17 11:15:06', '2025-10-17 11:15:06'),
(48, 18, 'Torre Este', 'Av. Tobalaba 8500', 'TE', '2025-10-17 11:15:07', '2025-10-17 11:15:07'),
(49, 19, 'Torre Playa A', 'Calle Mar 10', 'TPA', '2025-10-17 11:15:08', '2025-10-17 11:15:08'),
(50, 20, 'Sector Casas', 'Camino Sur 300', 'SC', '2025-10-17 11:15:09', '2025-10-17 11:15:09');

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
(1, 1, '2025-09', '2025-10-05', 'emitido', 'Emisión Septiembre C1', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(2, 2, '2025-09', '2025-10-06', 'emitido', 'Emisión Septiembre C2', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(3, 3, '2025-09', '2025-10-07', 'cerrado', 'Emisión Septiembre C3', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(4, 4, '2025-09', '2025-10-08', 'emitido', 'Emisión Septiembre C4', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(5, 5, '2025-09', '2025-10-09', 'emitido', 'Emisión Septiembre C5', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(6, 6, '2025-09', '2025-10-10', 'borrador', 'Emisión Septiembre C6', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(7, 7, '2025-09', '2025-10-11', 'emitido', 'Emisión Septiembre C7', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(8, 8, '2025-09', '2025-10-12', 'emitido', 'Emisión Septiembre C8', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(9, 9, '2025-09', '2025-10-13', 'cerrado', 'Emisión Septiembre C9', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(10, 10, '2025-09', '2025-10-14', 'emitido', 'Emisión Septiembre C10', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(11, 1, '2025-10', '2025-11-05', 'borrador', 'Emisión Octubre C1', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(12, 2, '2025-10', '2025-11-06', 'emitido', 'Emisión Octubre C2', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(13, 3, '2025-10', '2025-11-07', 'cerrado', 'Emisión Octubre C3', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(14, 4, '2025-10', '2025-11-08', 'emitido', 'Emisión Octubre C4', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(15, 5, '2025-10', '2025-11-09', 'borrador', 'Emisión Octubre C5', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(16, 6, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C6', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(17, 7, '2025-10', '2025-11-11', 'emitido', 'Emisión Octubre C7', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(18, 8, '2025-10', '2025-11-12', 'cerrado', 'Emisión Octubre C8', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(19, 9, '2025-10', '2025-11-13', 'emitido', 'Emisión Octubre C9', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(20, 10, '2025-10', '2025-11-14', 'borrador', 'Emisión Octubre C10', '2025-10-15 21:10:31', '2025-10-15 21:10:31'),
(21, 1, '2025-11', '2025-12-05', 'borrador', 'Emisión Noviembre C1', '2025-10-16 18:24:00', '2025-10-16 18:24:00'),
(22, 2, '2025-11', '2025-12-06', 'borrador', 'Emisión Noviembre C2', '2025-10-16 18:24:01', '2025-10-16 18:24:01'),
(23, 3, '2025-11', '2025-12-07', 'borrador', 'Emisión Noviembre C3', '2025-10-16 18:24:02', '2025-10-16 18:24:02'),
(24, 4, '2025-11', '2025-12-08', 'borrador', 'Emisión Noviembre C4', '2025-10-16 18:24:03', '2025-10-16 18:24:03'),
(25, 5, '2025-11', '2025-12-09', 'borrador', 'Emisión Noviembre C5', '2025-10-16 18:24:04', '2025-10-16 18:24:04'),
(26, 6, '2025-11', '2025-12-10', 'borrador', 'Emisión Noviembre C6', '2025-10-16 18:24:05', '2025-10-16 18:24:05'),
(27, 7, '2025-11', '2025-12-11', 'borrador', 'Emisión Noviembre C7', '2025-10-16 18:24:06', '2025-10-16 18:24:06'),
(28, 8, '2025-11', '2025-12-12', 'borrador', 'Emisión Noviembre C8', '2025-10-16 18:24:07', '2025-10-16 18:24:07'),
(29, 9, '2025-11', '2025-12-13', 'borrador', 'Emisión Noviembre C9', '2025-10-16 18:24:08', '2025-10-16 18:24:08'),
(30, 10, '2025-11', '2025-12-14', 'borrador', 'Emisión Noviembre C10', '2025-10-16 18:24:09', '2025-10-16 18:24:09'),
(31, 1, '2025-12', '2026-01-05', 'borrador', 'Emisión Diciembre C1', '2025-10-17 10:14:00', '2025-10-17 10:14:00'),
(32, 2, '2025-12', '2026-01-06', 'borrador', 'Emisión Diciembre C2', '2025-10-17 10:14:01', '2025-10-17 10:14:01'),
(33, 3, '2025-12', '2026-01-07', 'borrador', 'Emisión Diciembre C3', '2025-10-17 10:14:02', '2025-10-17 10:14:02'),
(34, 4, '2025-12', '2026-01-08', 'borrador', 'Emisión Diciembre C4', '2025-10-17 10:14:03', '2025-10-17 10:14:03'),
(35, 5, '2025-12', '2026-01-09', 'borrador', 'Emisión Diciembre C5', '2025-10-17 10:14:04', '2025-10-17 10:14:04'),
(36, 6, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C6', '2025-10-17 10:14:05', '2025-10-17 10:14:05'),
(37, 7, '2025-12', '2026-01-11', 'borrador', 'Emisión Diciembre C7', '2025-10-17 10:14:06', '2025-10-17 10:14:06'),
(38, 8, '2025-12', '2026-01-12', 'borrador', 'Emisión Diciembre C8', '2025-10-17 10:14:07', '2025-10-17 10:14:07'),
(39, 9, '2025-12', '2026-01-13', 'borrador', 'Emisión Diciembre C9', '2025-10-17 10:14:08', '2025-10-17 10:14:08'),
(40, 10, '2025-12', '2026-01-14', 'borrador', 'Emisión Diciembre C10', '2025-10-17 10:14:09', '2025-10-17 10:14:09');

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
-- Table structure for table `gasto`
--

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
-- Dumping data for table `gasto`
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
(10, '', 10, 10, 10, 10, '2025-09-10', 71400.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Consumo Electricidad Común', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(16, 'G2025-0016', 6, 16, 16, 16, '2025-10-10', 119000.00, 'aprobado', 6, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(17, 'G2025-0017', 7, 17, 17, 17, '2025-10-11', 59500.00, 'pendiente', 7, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(18, 'G2025-0018', 8, 18, 18, 18, '2025-10-12', 89250.00, 'aprobado', 8, NULL, 1, 0, NULL, NULL, NULL, 1, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(19, 'G2025-0019', 9, 19, 19, 19, '2025-10-13', 35700.00, 'pendiente', 9, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(20, 'G2025-0020', 10, 20, 20, 20, '2025-10-14', 107100.00, 'aprobado', 10, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(21, 'G2025-0021', 1, 11, 11, 21, '2025-10-15', 142800.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(22, 'G2025-0022', 2, 12, 12, 22, '2025-10-16', 95200.00, 'aprobado', 2, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(23, 'G2025-0023', 3, 13, 13, 23, '2025-10-17', 47600.00, 'pendiente', 3, NULL, 1, 0, NULL, NULL, NULL, 1, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(24, 'G2025-0024', 4, 14, 14, 24, '2025-10-18', 178500.00, 'aprobado', 4, NULL, 1, 0, NULL, NULL, NULL, 1, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(25, 'G2025-0025', 5, 15, 15, 25, '2025-10-19', 71400.00, 'pendiente', 5, NULL, 1, 0, NULL, NULL, NULL, 0, '2025-10-15 21:10:28', '2025-10-15 21:10:28'),
(26, 'G2025-0026', 1, 21, 21, 26, '2025-10-15', 178500.00, 'aprobado', 1, 1, 1, 1, NULL, NULL, 'Gasto por seguridad perimetral', 0, '2025-10-16 18:21:00', '2025-10-16 18:21:00'),
(27, 'G2025-0027', 2, 22, 22, 27, '2025-10-16', 59500.00, 'pendiente', 2, NULL, 1, 0, NULL, NULL, 'Compra de insumos de jardín', 0, '2025-10-16 18:21:01', '2025-10-16 18:21:01'),
(28, 'G2025-0028', 3, 23, 23, 28, '2025-10-17', 95200.00, 'aprobado', 3, 3, 1, 1, NULL, NULL, 'Compra de cloro y desinfectantes', 0, '2025-10-16 18:21:02', '2025-10-16 18:21:02'),
(29, 'G2025-0029', 4, 24, 24, 29, '2025-10-18', 35700.00, 'pendiente', 4, NULL, 1, 0, NULL, NULL, 'Asesoría contable para balance', 0, '2025-10-16 18:21:03', '2025-10-16 18:21:03'),
(30, 'G2025-0030', 5, 25, 25, 30, '2025-10-19', 142800.00, 'aprobado', 5, 5, 1, 1, NULL, NULL, 'Gasto de abogado por morosidad', 1, '2025-10-16 18:21:04', '2025-10-16 18:21:04'),
(31, 'G2025-0031', 6, 26, 26, 31, '2025-10-20', 119000.00, 'pendiente', 6, NULL, 1, 0, NULL, NULL, 'Mantención semestral de calefacción', 0, '2025-10-16 18:21:05', '2025-10-16 18:21:05'),
(32, 'G2025-0032', 7, 27, 27, 32, '2025-10-21', 47600.00, 'aprobado', 7, 7, 1, 1, NULL, NULL, 'Curso de primeros auxilios conserjes', 0, '2025-10-16 18:21:06', '2025-10-16 18:21:06'),
(33, 'G2025-0033', 8, 28, 28, 33, '2025-10-22', 89250.00, 'pendiente', 8, NULL, 1, 0, NULL, NULL, 'Compra de pintura para mural común', 1, '2025-10-16 18:21:07', '2025-10-16 18:21:07'),
(34, 'G2025-0034', 9, 29, 29, 34, '2025-10-23', 59500.00, 'aprobado', 9, 9, 1, 1, NULL, NULL, 'Aporte a Fondo de Mantención', 0, '2025-10-16 18:21:08', '2025-10-16 18:21:08'),
(35, 'G2025-0035', 10, 30, 30, 35, '2025-10-24', 178500.00, 'pendiente', 10, NULL, 1, 0, NULL, NULL, 'Inspección de daños estructurales', 1, '2025-10-16 18:21:09', '2025-10-16 18:21:09'),
(36, 'G2025-0036', 1, 31, 31, 36, '2025-11-01', 107100.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Mantención mensual de ascensores', 0, '2025-10-17 10:11:00', '2025-10-17 10:11:00'),
(37, 'G2025-0037', 2, 32, 32, 37, '2025-11-02', 47600.00, 'aprobado', 2, 2, 1, 1, NULL, NULL, 'Servicio de control de plagas', 0, '2025-10-17 10:11:01', '2025-10-17 10:11:01'),
(38, 'G2025-0038', 3, 33, 33, 38, '2025-11-03', 77350.00, 'pendiente', 3, NULL, 1, 0, NULL, NULL, 'Reparación de iluminación de emergencia', 0, '2025-10-17 10:11:02', '2025-10-17 10:11:02'),
(39, 'G2025-0039', 4, 34, 34, 39, '2025-11-04', 29750.00, 'aprobado', 4, 4, 1, 1, NULL, NULL, 'Gasto de comunicación vecinal', 0, '2025-10-17 10:11:03', '2025-10-17 10:11:03'),
(40, 'G2025-0040', 5, 35, 35, 40, '2025-11-05', 95200.00, 'pendiente', 5, NULL, 1, 0, NULL, NULL, 'Internet y Wi-Fi comunal', 0, '2025-10-17 10:11:04', '2025-10-17 10:11:04'),
(41, 'G2025-0041', 6, 36, 36, 41, '2025-11-06', 154700.00, 'aprobado', 6, 6, 1, 1, NULL, NULL, 'Mantención de piscinas', 0, '2025-10-17 10:11:05', '2025-10-17 10:11:05'),
(42, 'G2025-0042', 7, 37, 37, 42, '2025-11-07', 53550.00, 'pendiente', 7, NULL, 1, 0, NULL, NULL, 'Inspección de red de gas', 0, '2025-10-17 10:11:06', '2025-10-17 10:11:06'),
(43, 'G2025-0043', 8, 38, 38, 43, '2025-11-08', 83300.00, 'aprobado', 8, 8, 1, 1, NULL, NULL, 'Compra de materiales de construcción', 1, '2025-10-17 10:11:07', '2025-10-17 10:11:07'),
(44, 'G2025-0044', 9, 39, 39, 44, '2025-11-09', 65450.00, 'pendiente', 9, NULL, 1, 0, NULL, NULL, 'Diseño de paisajismo en entrada', 1, '2025-10-17 10:11:08', '2025-10-17 10:11:08'),
(45, 'G2025-0045', 10, 40, 40, 45, '2025-11-10', 119000.00, 'aprobado', 10, 10, 1, 1, NULL, NULL, 'Reparación de bomba de agua', 0, '2025-10-17 10:11:09', '2025-10-17 10:11:09');

-- --------------------------------------------------------

--
-- Table structure for table `gasto_aprobacion`
--

CREATE TABLE `gasto_aprobacion` (
  `id` bigint NOT NULL,
  `gasto_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL COMMENT 'Usuario que aprueba/rechaza',
  `rol_id` int NOT NULL COMMENT 'Rol con el que aprueba',
  `accion` enum('aprobar','rechazar') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gasto_aprobacion`
--

INSERT INTO `gasto_aprobacion` (`id`, `gasto_id`, `usuario_id`, `rol_id`, `accion`, `observaciones`, `created_at`) VALUES
(11, 1, 1, 7, 'aprobar', 'Aprobación del gasto de Aseo Comunal.', '2025-10-14 12:00:00'),
(12, 3, 3, 6, 'aprobar', 'El gasto de jardinería es necesario para la temporada.', '2025-10-14 12:15:00'),
(13, 5, 5, 2, 'aprobar', 'Aprobación final del Admin sobre el consumo de agua.', '2025-10-14 12:30:00'),
(14, 7, 7, 6, 'rechazar', 'El monto de la reparación de ascensor es demasiado alto. Pedir nueva cotización.', '2025-10-14 13:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `historial_gasto`
--

CREATE TABLE `historial_gasto` (
  `id` bigint NOT NULL,
  `gasto_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `campo_modificado` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `valor_anterior` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `valor_nuevo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `historial_gasto`
--

INSERT INTO `historial_gasto` (`id`, `gasto_id`, `usuario_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `created_at`) VALUES
(16, 1, 1, 'estado', 'pendiente', 'aprobado', '2025-10-14 12:00:01'),
(17, 3, 3, 'estado', 'pendiente', 'aprobado', '2025-10-14 12:15:01'),
(18, 7, 7, 'estado', 'pendiente', 'rechazado', '2025-10-14 13:00:01'),
(19, 7, 7, 'glosa', 'Reparación de Motor de Ascensor', 'Reparación de Motor de Ascensor (Rechazado, en cotización)', '2025-10-14 13:00:02');

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
(1, 1, '2025-09-30', 50.500, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(2, 2, '2025-09-30', 120.300, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(3, 3, '2025-09-30', 90.100, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(4, 4, '2025-09-30', 65.800, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(5, 5, '2025-09-30', 150.000, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(6, 6, '2025-09-30', 88.700, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(7, 7, '2025-09-30', 105.200, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(8, 8, '2025-09-30', 130.400, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(9, 9, '2025-09-30', 75.600, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(10, 10, '2025-09-30', 44.900, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58'),
(11, 11, '2025-10-31', 60.120, '2025-10', '2025-10-16 18:23:00', '2025-10-16 18:23:00'),
(12, 12, '2025-10-31', 135.500, '2025-10', '2025-10-16 18:23:01', '2025-10-16 18:23:01'),
(13, 13, '2025-10-31', 100.800, '2025-10', '2025-10-16 18:23:02', '2025-10-16 18:23:02'),
(14, 14, '2025-10-31', 75.200, '2025-10', '2025-10-16 18:23:03', '2025-10-16 18:23:03'),
(15, 15, '2025-10-31', 165.000, '2025-10', '2025-10-16 18:23:04', '2025-10-16 18:23:04'),
(16, 16, '2025-10-31', 95.300, '2025-10', '2025-10-16 18:23:05', '2025-10-16 18:23:05'),
(17, 17, '2025-10-31', 115.100, '2025-10', '2025-10-16 18:23:06', '2025-10-16 18:23:06'),
(18, 18, '2025-10-31', 140.900, '2025-10', '2025-10-16 18:23:07', '2025-10-16 18:23:07'),
(19, 19, '2025-10-31', 80.700, '2025-10', '2025-10-16 18:23:08', '2025-10-16 18:23:08'),
(20, 20, '2025-10-31', 50.000, '2025-10', '2025-10-16 18:23:09', '2025-10-16 18:23:09'),
(21, 21, '2025-10-31', 85.000, '2025-10', '2025-10-17 10:13:00', '2025-10-17 10:13:00'),
(22, 22, '2025-10-31', 110.000, '2025-10', '2025-10-17 10:13:01', '2025-10-17 10:13:01'),
(23, 23, '2025-10-31', 70.000, '2025-10', '2025-10-17 10:13:02', '2025-10-17 10:13:02'),
(24, 24, '2025-10-31', 145.000, '2025-10', '2025-10-17 10:13:03', '2025-10-17 10:13:03'),
(25, 25, '2025-10-31', 60.000, '2025-10', '2025-10-17 10:13:04', '2025-10-17 10:13:04'),
(26, 26, '2025-10-31', 125.000, '2025-10', '2025-10-17 10:13:05', '2025-10-17 10:13:05'),
(27, 27, '2025-10-31', 95.000, '2025-10', '2025-10-17 10:13:06', '2025-10-17 10:13:06'),
(28, 28, '2025-10-31', 75.000, '2025-10', '2025-10-17 10:13:07', '2025-10-17 10:13:07'),
(29, 29, '2025-10-31', 105.000, '2025-10', '2025-10-17 10:13:08', '2025-10-17 10:13:08'),
(30, 30, '2025-10-31', 65.000, '2025-10', '2025-10-17 10:13:09', '2025-10-17 10:13:09');

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
(1, 1, 1, 'agua', 'AGUA-101', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(2, 1, 2, 'electricidad', 'ELEC-201', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(3, 2, 3, 'gas', 'GAS-305', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(4, 3, 4, 'agua', 'AGUA-402', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(5, 4, 5, 'electricidad', 'ELEC-CASA-A', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(6, 5, 6, 'gas', 'GAS-501', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(7, 6, 7, 'agua', 'AGUA-1001', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(8, 7, 8, 'electricidad', 'ELEC-1502', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(9, 8, 9, 'gas', 'GAS-105', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(10, 9, 9, 'agua', 'AGUA-105-C9', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56'),
(11, 1, 21, 'gas', 'GAS-301', 0, '2025-10-16 18:22:00', '2025-10-16 18:22:00'),
(12, 2, 22, 'agua', 'AGUA-401', 0, '2025-10-16 18:22:01', '2025-10-16 18:22:01'),
(13, 3, 23, 'electricidad', 'ELEC-501', 0, '2025-10-16 18:22:02', '2025-10-16 18:22:02'),
(14, 4, 24, 'gas', 'GAS-CASA-C', 0, '2025-10-16 18:22:03', '2025-10-16 18:22:03'),
(15, 5, 25, 'agua', 'AGUA-601', 0, '2025-10-16 18:22:04', '2025-10-16 18:22:04'),
(16, 6, 26, 'electricidad', 'ELEC-2001', 0, '2025-10-16 18:22:05', '2025-10-16 18:22:05'),
(17, 7, 27, 'gas', 'GAS-1601', 0, '2025-10-16 18:22:06', '2025-10-16 18:22:06'),
(18, 8, 28, 'agua', 'AGUA-201', 0, '2025-10-16 18:22:07', '2025-10-16 18:22:07'),
(19, 9, 29, 'electricidad', 'ELEC-30', 0, '2025-10-16 18:22:08', '2025-10-16 18:22:08'),
(20, 10, 30, 'gas', 'GAS-301-C10', 0, '2025-10-16 18:22:09', '2025-10-16 18:22:09'),
(21, 1, 31, 'electricidad', 'ELEC-401', 0, '2025-10-17 10:12:00', '2025-10-17 10:12:00'),
(22, 2, 32, 'gas', 'GAS-501', 0, '2025-10-17 10:12:01', '2025-10-17 10:12:01'),
(23, 3, 33, 'agua', 'AGUA-601', 0, '2025-10-17 10:12:02', '2025-10-17 10:12:02'),
(24, 4, 34, 'electricidad', 'ELEC-CASA-D', 0, '2025-10-17 10:12:03', '2025-10-17 10:12:03'),
(25, 5, 35, 'gas', 'GAS-701', 0, '2025-10-17 10:12:04', '2025-10-17 10:12:04'),
(26, 6, 36, 'agua', 'AGUA-3001', 0, '2025-10-17 10:12:05', '2025-10-17 10:12:05'),
(27, 7, 37, 'electricidad', 'ELEC-1701', 0, '2025-10-17 10:12:06', '2025-10-17 10:12:06'),
(28, 8, 38, 'gas', 'GAS-301', 0, '2025-10-17 10:12:07', '2025-10-17 10:12:07'),
(29, 9, 39, 'agua', 'AGUA-40-C9', 0, '2025-10-17 10:12:08', '2025-10-17 10:12:08'),
(30, 10, 40, 'electricidad', 'ELEC-401-C10', 0, '2025-10-17 10:12:09', '2025-10-17 10:12:09');

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
  `prioridad` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media' COMMENT 'Prioridad de la multa según gravedad',
  `creada_por` bigint NOT NULL COMMENT 'usuario_id',
  `aprobada_por` bigint DEFAULT NULL COMMENT 'usuario_id',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `fecha` date NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `multa`
--

INSERT INTO `multa` (`id`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `descripcion`, `monto`, `estado`, `prioridad`, `creada_por`, `aprobada_por`, `fecha_aprobacion`, `fecha`, `fecha_pago`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'Mascota sin correa', NULL, 5000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-01', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(2, 2, 3, 3, 'Ruido excesivo', NULL, 15000.00, 'pagada', 'media', 1, NULL, NULL, '2025-09-02', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(3, 3, 4, 4, 'Bloqueo de acceso', NULL, 10000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-03', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(4, 4, 5, 5, 'Fumar en áreas comunes', NULL, 20000.00, 'anulada', 'media', 1, NULL, NULL, '2025-09-04', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(5, 5, 6, 6, 'Daño a propiedad común', NULL, 30000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-05', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(6, 6, 7, 7, 'Mascota peligrosa sin bozal', NULL, 12000.00, 'pagada', 'media', 1, NULL, NULL, '2025-09-06', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(7, 7, 8, 8, 'Uso no autorizado de ascensor', NULL, 8000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-07', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(8, 8, 9, 9, 'Dejar basura en pasillo', NULL, 6000.00, 'pagada', 'media', 1, NULL, NULL, '2025-09-08', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(9, 9, 10, 10, 'Instalación de antena sin permiso', NULL, 25000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-09', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(10, 10, 10, 10, 'Fiesta hasta tarde', NULL, 18000.00, 'pagada', 'media', 1, NULL, NULL, '2025-09-10', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15'),
(11, 1, 21, 21, 'Estacionar en zona prohibida', 'Vehículo bloqueando acceso a bodega.', 10000.00, 'pendiente', 'alta', 6, NULL, NULL, '2025-10-15', NULL, '2025-10-16 18:28:00', '2025-10-16 18:28:00'),
(12, 2, 22, 22, 'Tender ropa en balcón', NULL, 5000.00, 'pagada', 'media', 6, NULL, NULL, '2025-10-16', '2025-10-16 21:54:02', '2025-10-16 18:28:01', '2025-10-16 18:28:01'),
(13, 3, 23, 23, 'Uso inadecuado de gimnasio', 'Dejó pesas tiradas y sucio.', 12000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-10-17', NULL, '2025-10-16 18:28:02', '2025-10-16 18:28:02'),
(14, 4, 24, 24, 'Riego excesivo área común', 'Inundó camino peatonal.', 8000.00, 'anulada', 'baja', 6, NULL, NULL, '2025-10-18', NULL, '2025-10-16 18:28:03', '2025-10-16 18:28:03'),
(15, 5, 25, 25, 'Mascota sin identificación', NULL, 3000.00, 'pendiente', 'baja', 6, NULL, NULL, '2025-10-19', NULL, '2025-10-16 18:28:04', '2025-10-16 18:28:04'),
(16, 6, 26, 26, 'Obstrucción de salida de emergencia', NULL, 20000.00, 'pagada', 'critica', 6, NULL, NULL, '2025-10-20', '2025-10-16 21:54:02', '2025-10-16 18:28:05', '2025-10-16 18:28:05'),
(17, 7, 27, 27, 'Instalación no autorizada de aire acondicionado', NULL, 15000.00, 'pendiente', 'alta', 6, NULL, NULL, '2025-10-21', NULL, '2025-10-16 18:28:06', '2025-10-16 18:28:06'),
(18, 8, 28, 28, 'Daño a jardín infantil', 'Rompieron un juego.', 25000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-10-22', NULL, '2025-10-16 18:28:07', '2025-10-16 18:28:07'),
(19, 9, 29, 29, 'Ruido excesivo después de 23h', NULL, 18000.00, 'pendiente', 'alta', 6, NULL, NULL, '2025-10-23', NULL, '2025-10-16 18:28:08', '2025-10-16 18:28:08'),
(20, 10, 30, 30, 'Uso de pirotecnia en balcón', NULL, 30000.00, 'pendiente', 'critica', 6, NULL, NULL, '2025-10-24', NULL, '2025-10-16 18:28:09', '2025-10-16 18:28:09'),
(21, 1, 31, 31, 'Desechar muebles en área común', NULL, 25000.00, 'pendiente', 'alta', 6, NULL, NULL, '2025-10-25', NULL, '2025-10-17 10:18:00', '2025-10-17 10:18:00'),
(22, 2, 32, 32, 'No registrar visita de contratista', NULL, 8000.00, 'pagada', 'media', 6, NULL, NULL, '2025-10-26', '2025-10-16 21:59:03', '2025-10-17 10:18:01', '2025-10-17 10:18:01'),
(23, 3, 33, 33, 'Parrilla en balcón', NULL, 20000.00, 'pendiente', 'critica', 6, NULL, NULL, '2025-10-27', NULL, '2025-10-17 10:18:02', '2025-10-17 10:18:02'),
(24, 4, 34, 34, 'Circulación de mascotas sin correa', NULL, 5000.00, 'anulada', 'baja', 6, NULL, NULL, '2025-10-28', NULL, '2025-10-17 10:18:03', '2025-10-17 10:18:03'),
(25, 5, 35, 35, 'Usar la sala de cine sin reserva', NULL, 10000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-10-29', NULL, '2025-10-17 10:18:04', '2025-10-17 10:18:04'),
(26, 6, 36, 36, 'Modificación de fachada sin permiso', NULL, 30000.00, 'pagada', 'critica', 6, NULL, NULL, '2025-10-30', '2025-10-16 21:59:03', '2025-10-17 10:18:05', '2025-10-17 10:18:05'),
(27, 7, 37, 37, 'Demora en pago de cuota extra', NULL, 4000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-10-31', NULL, '2025-10-17 10:18:06', '2025-10-17 10:18:06'),
(28, 8, 38, 38, 'Uso de áreas verdes para mudanza', NULL, 12000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-11-01', NULL, '2025-10-17 10:18:07', '2025-10-17 10:18:07'),
(29, 9, 39, 39, 'Niños sin supervisión en juegos', NULL, 7000.00, 'pendiente', 'baja', 6, NULL, NULL, '2025-11-02', NULL, '2025-10-17 10:18:08', '2025-10-17 10:18:08'),
(30, 10, 40, 40, 'Incumplimiento de horario de escombros', NULL, 15000.00, 'pendiente', 'alta', 6, NULL, NULL, '2025-11-03', NULL, '2025-10-17 10:18:09', '2025-10-17 10:18:09');

-- --------------------------------------------------------

--
-- Table structure for table `multa_apelacion`
--

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
-- Dumping data for table `multa_apelacion`
--

INSERT INTO `multa_apelacion` (`id`, `multa_id`, `usuario_id`, `persona_id`, `comunidad_id`, `fecha_apelacion`, `motivo_apelacion`, `estado`, `resolucion`, `fecha_resolucion`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, '2025-10-01 10:00:00', 'Mascota es de apoyo emocional, no requiere correa.', 'aceptada', 'Revisión documental exitosa. Multa anulada.', '2025-10-02 15:30:00', '2025-10-01 10:00:00', '2025-10-02 15:30:00'),
(2, 2, 3, 3, 2, '2025-10-02 11:30:00', 'El ruido no provino de mi unidad, sino de la vecina.', 'rechazada', 'Registro de bitácora y evidencia de cámaras confirman la infracción.', '2025-10-04 09:00:00', '2025-10-02 11:30:00', '2025-10-04 09:00:00'),
(3, 3, 4, 4, 3, '2025-10-03 14:00:00', 'El vehículo estaba cargando/descargando, no bloqueando acceso permanente.', 'pendiente', NULL, NULL, '2025-10-03 14:00:00', '2025-10-03 14:00:00'),
(4, 4, 5, 5, 4, '2025-10-04 09:15:00', 'El reglamento de fumar no estaba visible en el área.', 'aceptada', 'Se anula la multa por falta de señalización visible.', '2025-10-05 16:00:00', '2025-10-04 09:15:00', '2025-10-05 16:00:00'),
(5, 5, 6, 6, 5, '2025-10-06 17:45:00', 'El daño fue preexistente, solo lo reporté.', 'pendiente', NULL, NULL, '2025-10-06 17:45:00', '2025-10-06 17:45:00'),
(6, 6, 7, 7, 6, '2025-10-07 10:10:00', 'Mi perro no es peligroso, solo jugaba brusco.', 'rechazada', 'Las fotos del incidente demuestran que el bozal era necesario.', '2025-10-10 11:00:00', '2025-10-07 10:10:00', '2025-10-10 11:00:00'),
(7, 7, 8, 8, 7, '2025-10-08 12:20:00', 'Usé el ascensor de carga con permiso de conserje, fue mal ingresado.', 'aceptada', 'Se verifica permiso, error de categoría en la multa. Aceptada.', '2025-10-08 18:00:00', '2025-10-08 12:20:00', '2025-10-08 18:00:00'),
(8, 8, 9, 9, 8, '2025-09-18 08:30:00', 'La bolsa se cayó por accidente, no fue intencional.', 'pendiente', NULL, NULL, '2025-09-18 08:30:00', '2025-09-18 08:30:00'),
(9, 9, 10, 10, 9, '2025-10-05 15:50:00', 'La antena es removible y no afecta la estética, según normativa interna.', 'rechazada', 'La normativa es clara en que se requiere aprobación previa, la cual no fue solicitada.', '2025-10-10 17:00:00', '2025-10-05 15:50:00', '2025-10-10 17:00:00'),
(10, 10, 10, 10, 10, '2025-10-11 19:30:00', 'La música fue bajada al primer aviso de conserjería.', 'pendiente', NULL, NULL, '2025-10-11 19:30:00', '2025-10-11 19:30:00'),
(11, 1, 2, 1, 1, '2025-10-12 11:00:00', 'Apelo nuevamente, mi mascota es indispensable para mi salud.', 'rechazada', 'Apelación previa fue aceptada, esta multa es nueva y tiene reglamento diferente.', '2025-10-12 18:00:00', '2025-10-12 11:00:00', '2025-10-12 18:00:00'),
(12, 2, 3, 3, 2, '2025-10-13 10:00:00', 'Pido una reducción de la multa por ser primera vez.', 'pendiente', NULL, NULL, '2025-10-13 10:00:00', '2025-10-13 10:00:00'),
(13, 3, 4, 4, 3, '2025-10-14 12:00:00', 'Presento comprobante de carga y descarga de suministros (máximo 15 min).', 'aceptada', 'Se comprueba uso temporal del acceso. Multa retirada.', '2025-10-14 18:00:00', '2025-10-14 12:00:00', '2025-10-14 18:00:00'),
(14, 5, 6, 6, 5, '2025-10-14 14:30:00', 'El daño lo cubrió mi seguro de hogar, adjunto póliza.', 'pendiente', NULL, NULL, '2025-10-14 14:30:00', '2025-10-14 14:30:00'),
(15, 7, 8, 8, 7, '2025-10-14 15:45:00', 'El foco estaba defectuoso antes de que lo reportara.', 'pendiente', NULL, NULL, '2025-10-14 15:45:00', '2025-10-14 15:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `multa_historial`
--

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
-- Dumping data for table `multa_historial`
--

INSERT INTO `multa_historial` (`id`, `multa_id`, `usuario_id`, `accion`, `estado_anterior`, `estado_nuevo`, `observaciones`, `created_at`) VALUES
(1, 1, 1, 'creacion', NULL, 'pendiente', 'Multa creada por mascota sin correa.', '2025-09-01 18:00:00'),
(2, 2, 1, 'cambio_estado', 'pendiente', 'pagada', 'Pago registrado por el sistema.', '2025-10-02 11:30:00');

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
(1, 1, 1, 'alerta', 'Pago Vencido', 'Su gasto común de septiembre está vencido.', 0, 'cuenta_cobro_unidad', 1, '2025-10-10 18:10:22'),
(2, 2, 3, 'info', 'Pago Aplicado', 'Su pago ha sido aplicado con éxito.', 1, 'pago', 1, '2025-10-10 18:10:22'),
(3, 3, 4, 'recordatorio', 'Próxima Votación', 'Vote por el presupuesto del próximo año.', 0, 'documento_comunidad', 7, '2025-10-10 18:10:22'),
(4, 4, 5, 'info', 'Reserva Aprobada', 'Su solicitud de piscina para el 2025-10-25 ha sido aprobada.', 1, 'reserva_amenidad', 5, '2025-10-10 18:10:22'),
(5, 5, 6, 'alerta', 'Ticket Asignado', 'Se le asignó el ticket N°5 de seguridad.', 0, 'ticket_soporte', 5, '2025-10-10 18:10:22'),
(6, 6, 7, 'recordatorio', 'Mantención General', 'Recordatorio de la mantención del ascensor mañana.', 0, 'registro_conserjeria', 6, '2025-10-10 18:10:22'),
(7, 7, 8, 'info', 'Nueva Multa', 'Se ha generado una multa a su unidad.', 0, 'multa', 7, '2025-10-10 18:10:22'),
(8, 8, 9, 'alerta', 'Saldo Pendiente', 'Su saldo parcial tiene intereses acumulados.', 0, 'cuenta_cobro_unidad', 8, '2025-10-10 18:10:22'),
(9, 9, 10, 'recordatorio', 'Entrega de Paquete', 'Tiene un paquete pendiente de retiro en conserjería.', 1, 'registro_conserjeria', 9, '2025-10-10 18:10:22'),
(10, 10, 10, 'info', 'Cierre de Emisión', 'El periodo de gasto común 2025-09 ha sido cerrado.', 1, 'emision_gastos_comunes', 10, '2025-10-10 18:10:22'),
(11, 1, 21, 'alerta', 'Multa de Estacionamiento', 'Se ha generado una multa por estacionar en zona prohibida.', 0, 'multa', 11, '2025-10-16 18:32:00'),
(12, 2, 22, 'info', 'Pago Aplicado con Éxito', 'Su pago de gasto común ha sido procesado.', 1, 'pago', 22, '2025-10-16 18:32:01'),
(13, 3, 23, 'recordatorio', 'Reserva Aprobada', 'Su reserva del gimnasio para el 2025-11-01 ha sido aprobada.', 0, 'reserva_amenidad', 22, '2025-10-16 18:32:02'),
(14, 4, 24, 'info', 'Nuevo Documento', 'Se ha subido el boletín N°12 de Diciembre.', 1, 'documento_comunidad', 21, '2025-10-16 18:32:03'),
(15, 5, 25, 'alerta', 'Gasto Extraordinario', 'Se ha cargado una cuota de gasto extraordinario por cobro legal.', 0, 'cuenta_cobro_unidad', 25, '2025-10-16 18:32:04'),
(16, 6, 26, 'recordatorio', 'Conserjería: Visita Programada', 'Se registró el ingreso de un técnico HVAC a su torre.', 0, 'registro_conserjeria', 26, '2025-10-16 18:32:05'),
(17, 7, 27, 'info', 'Gasto Aprobado', 'El gasto de capacitación para conserjes ha sido aprobado.', 0, 'gasto', 32, '2025-10-16 18:32:06'),
(18, 8, 28, 'alerta', 'Ticket Resuelto', 'Su ticket de soporte sobre la grieta ha sido resuelto.', 0, 'ticket_soporte', 8, '2025-10-16 18:32:07'),
(19, 9, 29, 'recordatorio', 'Fondo de Reserva', 'Se ha cargado un aporte a Fondo de Mantención.', 1, 'detalle_cuenta_unidad', 29, '2025-10-16 18:32:08'),
(20, 10, 30, 'info', 'Emisión Creada', 'La liquidación de gastos comunes de Noviembre está disponible.', 1, 'emision_gastos_comunes', 30, '2025-10-16 18:32:09'),
(21, 1, 31, 'alerta', 'Pago Atrasado', 'Su gasto común de noviembre está pendiente.', 0, 'cuenta_cobro_unidad', 31, '2025-10-17 10:22:00'),
(22, 2, 32, 'info', 'Pago Procesado', 'Se ha aplicado su pago de $75,000.', 1, 'pago', 31, '2025-10-17 10:22:01'),
(23, 3, 33, 'recordatorio', 'Asamblea Extraordinaria', 'Recordatorio de votación para el proyecto eléctrico.', 0, 'documento_comunidad', 23, '2025-10-17 10:22:02'),
(24, 4, 34, 'info', 'Multa Anulada', 'La multa N°24 por mascotas fue anulada.', 1, 'multa', 24, '2025-10-17 10:22:03'),
(25, 5, 35, 'alerta', 'Bloqueo de Servicio', 'Su servicio de Internet será suspendido por saldo vencido.', 0, 'cuenta_cobro_unidad', 35, '2025-10-17 10:22:04'),
(26, 6, 36, 'recordatorio', 'Reserva Aprobada', 'Su reserva de Salón de Eventos para Navidad ha sido aprobada.', 0, 'reserva_amenidad', 26, '2025-10-17 10:22:05'),
(27, 7, 37, 'info', 'Mantenimiento Programado', 'Corte de gas programado para el 2025-11-15.', 0, 'registro_conserjeria', 37, '2025-10-17 10:22:06'),
(28, 8, 38, 'alerta', 'Ticket Crítico', 'Se ha reportado una falla crítica de infraestructura (Ticket 18).', 0, 'ticket_soporte', 18, '2025-10-17 10:22:07'),
(29, 9, 39, 'recordatorio', 'Retiro de Paquete', 'Tiene un paquete grande pendiente en conserjería.', 1, 'registro_conserjeria', 29, '2025-10-17 10:22:08'),
(30, 10, 40, 'info', 'Nuevo Gasto Común', 'Se ha generado la emisión de gastos comunes de Diciembre.', 1, 'emision_gastos_comunes', 40, '2025-10-17 10:22:09');

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
(1, 2, 3, 3, '2025-10-01', 62000.00, 'transferencia', 'REF-P001', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(2, 4, 5, 5, '2025-10-02', 31000.00, 'webpay', 'REF-P002', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(3, 7, 8, 8, '2025-10-03', 55000.00, 'efectivo', 'REF-P003', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(4, 8, 9, 9, '2025-10-04', 48000.00, 'transferencia', 'REF-P004', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(5, 10, 10, 10, '2025-10-05', 68000.00, 'webpay', 'REF-P005', 'aplicado', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(6, 1, 1, 1, '2025-10-06', 45000.00, 'efectivo', 'REF-P006', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(7, 3, 4, 4, '2025-10-07', 88000.00, 'transferencia', 'REF-P007', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(8, 5, 6, 6, '2025-10-08', 73000.00, 'webpay', 'REF-P008', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(9, 9, 10, 10, '2025-10-09', 49000.00, 'efectivo', 'REF-P009', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(10, 6, 7, 7, '2025-10-10', 95000.00, 'transferencia', 'REF-P010', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(11, 2, 13, 13, '2025-10-06', 65000.00, 'transferencia', 'REF-P011', 'aplicado', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(12, 4, 15, 15, '2025-10-07', 25000.00, 'webpay', 'REF-P012', 'aplicado', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(13, 7, 18, 18, '2025-10-08', 60000.00, 'efectivo', 'REF-P013', 'aplicado', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(14, 8, 19, 19, '2025-10-09', 40000.00, 'transferencia', 'REF-P014', 'aplicado', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(15, 10, 10, 20, '2025-10-10', 70000.00, 'webpay', 'REF-P015', 'aplicado', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(16, 1, 11, 11, '2025-10-11', 50000.00, 'efectivo', 'REF-P016', 'pendiente', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(17, 3, 14, 14, '2025-10-12', 90000.00, 'transferencia', 'REF-P017', 'pendiente', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(18, 5, 16, 16, '2025-10-13', 75000.00, 'webpay', 'REF-P018', 'pendiente', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(19, 9, 20, 20, '2025-10-14', 50000.00, 'efectivo', 'REF-P019', 'pendiente', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(20, 6, 17, 17, '2025-10-15', 100000.00, 'transferencia', 'REF-P020', 'pendiente', NULL, '2025-10-15 21:10:54', '2025-10-15 21:10:54'),
(21, 1, 21, 21, '2025-10-16', 55000.00, 'transferencia', 'REF-P021', 'pendiente', NULL, '2025-10-16 18:29:00', '2025-10-16 18:29:00'),
(22, 2, 22, 22, '2025-10-17', 70000.00, 'webpay', 'REF-P022', 'aplicado', NULL, '2025-10-16 18:29:01', '2025-10-16 18:29:01'),
(23, 3, 23, 23, '2025-10-18', 95000.00, 'efectivo', 'REF-P023', 'pendiente', NULL, '2025-10-16 18:29:02', '2025-10-16 18:29:02'),
(24, 4, 24, 24, '2025-10-19', 30000.00, 'transferencia', 'REF-P024', 'aplicado', NULL, '2025-10-16 18:29:03', '2025-10-16 18:29:03'),
(25, 5, 25, 25, '2025-10-20', 80000.00, 'webpay', 'REF-P025', 'pendiente', NULL, '2025-10-16 18:29:04', '2025-10-16 18:29:04'),
(26, 6, 26, 26, '2025-10-21', 110000.00, 'efectivo', 'REF-P026', 'aplicado', NULL, '2025-10-16 18:29:05', '2025-10-16 18:29:05'),
(27, 7, 27, 27, '2025-10-22', 65000.00, 'transferencia', 'REF-P027', 'pendiente', NULL, '2025-10-16 18:29:06', '2025-10-16 18:29:06'),
(28, 8, 28, 28, '2025-10-23', 85000.00, 'webpay', 'REF-P028', 'aplicado', NULL, '2025-10-16 18:29:07', '2025-10-16 18:29:07'),
(29, 9, 29, 29, '2025-10-24', 60000.00, 'efectivo', 'REF-P029', 'pendiente', NULL, '2025-10-16 18:29:08', '2025-10-16 18:29:08'),
(30, 10, 30, 30, '2025-10-25', 75000.00, 'transferencia', 'REF-P030', 'aplicado', NULL, '2025-10-16 18:29:09', '2025-10-16 18:29:09'),
(31, 1, 31, 31, '2025-10-26', 60000.00, 'webpay', 'REF-P031', 'aplicado', NULL, '2025-10-17 10:19:00', '2025-10-17 10:19:00'),
(32, 2, 32, 32, '2025-10-27', 75000.00, 'transferencia', 'REF-P032', 'pendiente', NULL, '2025-10-17 10:19:01', '2025-10-17 10:19:01'),
(33, 3, 33, 33, '2025-10-28', 100000.00, 'webpay', 'REF-P033', 'aplicado', NULL, '2025-10-17 10:19:02', '2025-10-17 10:19:02'),
(34, 4, 34, 34, '2025-10-29', 65000.00, 'efectivo', 'REF-P034', 'pendiente', NULL, '2025-10-17 10:19:03', '2025-10-17 10:19:03'),
(35, 5, 35, 35, '2025-10-30', 40000.00, 'transferencia', 'REF-P035', 'aplicado', NULL, '2025-10-17 10:19:04', '2025-10-17 10:19:04'),
(36, 6, 36, 36, '2025-10-31', 115000.00, 'webpay', 'REF-P036', 'pendiente', NULL, '2025-10-17 10:19:05', '2025-10-17 10:19:05'),
(37, 7, 37, 37, '2025-11-01', 70000.00, 'efectivo', 'REF-P037', 'aplicado', NULL, '2025-10-17 10:19:06', '2025-10-17 10:19:06'),
(38, 8, 38, 38, '2025-11-02', 90000.00, 'transferencia', 'REF-P038', 'pendiente', NULL, '2025-10-17 10:19:07', '2025-10-17 10:19:07'),
(39, 9, 39, 39, '2025-11-03', 65000.00, 'webpay', 'REF-P039', 'aplicado', NULL, '2025-10-17 10:19:08', '2025-10-17 10:19:08'),
(40, 10, 40, 40, '2025-11-04', 80000.00, 'efectivo', 'REF-P040', 'pendiente', NULL, '2025-10-17 10:19:09', '2025-10-17 10:19:09');

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
(1, 1, 2, 62000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(2, 2, 4, 31000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(3, 3, 7, 55000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(4, 4, 8, 48000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(5, 5, 10, 68000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(6, 6, 1, 45000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(7, 7, 3, 88000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(8, 8, 5, 73000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(9, 9, 9, 49000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(10, 10, 6, 95000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(11, 11, 12, 65000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(12, 12, 14, 25000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(13, 13, 17, 60000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(14, 14, 18, 40000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(15, 15, 20, 70000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(16, 16, 11, 50000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(17, 17, 13, 90000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(18, 18, 15, 75000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(19, 19, 19, 50000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56'),
(20, 20, 16, 100000.00, 1, '2025-10-15 21:10:56', '2025-10-15 21:10:56');

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
(1, 1, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(2, 2, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(3, 3, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(4, 4, 3, 1.80, 'diaria', 'normal', 2.20, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(5, 5, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(6, 6, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(7, 7, 4, 1.30, 'mensual', 'normal', NULL, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(8, 8, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(9, 9, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(10, 10, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(21, 11, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-17 11:13:00', '2025-10-17 11:13:00'),
(22, 12, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-17 11:13:01', '2025-10-17 11:13:01'),
(23, 13, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-17 11:13:02', '2025-10-17 11:13:02'),
(24, 14, 3, 1.80, 'diaria', 'normal', 2.20, 'capital', '2025-10-17 11:13:03', '2025-10-17 11:13:03'),
(25, 15, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo', '2025-10-17 11:13:04', '2025-10-17 11:13:04'),
(26, 16, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital', '2025-10-17 11:13:05', '2025-10-17 11:13:05'),
(27, 17, 4, 1.30, 'mensual', 'normal', NULL, 'saldo', '2025-10-17 11:13:06', '2025-10-17 11:13:06'),
(28, 18, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital', '2025-10-17 11:13:07', '2025-10-17 11:13:07'),
(29, 19, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo', '2025-10-17 11:13:08', '2025-10-17 11:13:08'),
(30, 20, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-17 11:13:09', '2025-10-17 11:13:09');

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
(1, '18514420', '8', 'Patricio', 'Quintanilla', 'pat.quintanilla@duocuc.cl', '+56987654321', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(2, '11243882', '3', 'Elisabet', 'Robledo', 'elisabet@email.cl', '+56912345678', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(3, '21141366', '2', 'Dalila', 'Trillo', 'dalila@email.cl', '+56923456789', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(4, '9793463', '0', 'Isidora', 'Sedano', 'isidora@email.cl', '+56934567890', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(5, '2569079', '6', 'Sigfrido', 'Molins', 'sigfrido@email.cl', '+56945678901', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(6, '24317602', '6', 'José', 'Álvaro', 'jose@conserje.cl', '+56956789012', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(7, '21596168', '0', 'Jordi', 'Piñol', 'jordi@email.cl', '+56967890123', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(8, '17147778', '6', 'Flora', 'Olivares', 'flora@admin.cl', '+56978901234', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(9, '9974052', '3', 'Lina', 'Alonso', 'lina@email.cl', '+56989012345', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(10, '11788735', '9', 'Alejandro', 'Barros', 'alejandro@email.cl', '+56990123456', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(11, '23456789', '0', 'Laura', 'Sánchez', 'laura.sanchez@email.cl', '+56901234567', 'Calle Falsa 123', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(12, '24567890', '1', 'Carlos', 'Gómez', 'carlos.gomez@email.cl', '+56912345670', 'Av. Siempre Viva 45', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(13, '25678901', 'K', 'María', 'Fernández', 'maria.fernandez@email.cl', '+56923456701', 'Plaza Central 78', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(14, '26789012', '3', 'Javier', 'Díaz', 'javier.diaz@email.cl', '+56934567012', 'Ruta 5 Norte 90', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(15, '27890123', '4', 'Ana', 'López', 'ana.lopez@email.cl', '+56945670123', 'Las Américas 10', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(16, '28901234', '5', 'Roberto', 'Martínez', 'roberto.martinez@email.cl', '+56956701234', 'El Bosque 20', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(17, '29012345', '6', 'Elena', 'Ruiz', 'elena.ruiz@email.cl', '+56967012345', 'Calle Sol 30', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(18, '30123456', '7', 'Pedro', 'Hernández', 'pedro.hernandez@email.cl', '+56970123456', 'Av. Luna 40', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(19, '31234567', '8', 'Sofía', 'Vargas', 'sofia.vargas@email.cl', '+56901234560', 'Mar del Plata 50', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(20, '32345678', '9', 'Diego', 'Rojas', 'diego.rojas@email.cl', '+56912345611', 'Los Pinos 60', '2025-10-15 21:10:14', '2025-10-15 21:10:14'),
(21, '33456789', '0', 'Gabriel', 'Tapia', 'gabriel.tapia@email.cl', '+56900000001', 'Calle Falsa 123', '2025-10-16 18:10:00', '2025-10-16 18:10:00'),
(22, '34567890', '1', 'Daniela', 'Flores', 'daniela.flores@email.cl', '+56900000002', 'Av. Siempre Viva 45', '2025-10-16 18:10:01', '2025-10-16 18:10:01'),
(23, '35678901', '2', 'Andrés', 'Muñoz', 'andres.munoz@email.cl', '+56900000003', 'Plaza Central 78', '2025-10-16 18:10:02', '2025-10-16 18:10:02'),
(24, '36789012', '3', 'Camila', 'Reyes', 'camila.reyes@email.cl', '+56900000004', 'Ruta 5 Norte 90', '2025-10-16 18:10:03', '2025-10-16 18:10:03'),
(25, '37890123', '4', 'Felipe', 'Morales', 'felipe.morales@email.cl', '+56900000005', 'Las Américas 10', '2025-10-16 18:10:04', '2025-10-16 18:10:04'),
(26, '38901234', '5', 'Valeria', 'Núñez', 'valeria.nunez@email.cl', '+56900000006', 'El Bosque 20', '2025-10-16 18:10:05', '2025-10-16 18:10:05'),
(27, '39012345', '6', 'Ricardo', 'Soto', 'ricardo.soto@email.cl', '+56900000007', 'Calle Sol 30', '2025-10-16 18:10:06', '2025-10-16 18:10:06'),
(28, '40123456', '7', 'Javiera', 'Pérez', 'javiera.perez@email.cl', '+56900000008', 'Av. Luna 40', '2025-10-16 18:10:07', '2025-10-16 18:10:07'),
(29, '41234567', '8', 'Ignacio', 'Herrera', 'ignacio.herrera@email.cl', '+56900000009', 'Mar del Plata 50', '2025-10-16 18:10:08', '2025-10-16 18:10:08'),
(30, '42345678', '9', 'Constanza', 'Díaz', 'constanza.diaz@email.cl', '+56900000010', 'Los Pinos 60', '2025-10-16 18:10:09', '2025-10-16 18:10:09'),
(31, '43456789', '0', 'Manuel', 'Silva', 'manuel.silva@duocuc.cl', '+56900000011', 'Av. Sur 100', '2025-10-17 10:00:00', '2025-10-17 10:00:00'),
(32, '44567890', '1', 'Fernanda', 'Castro', 'fernanda.castro@email.cl', '+56900000012', 'Paseo Norte 200', '2025-10-17 10:00:01', '2025-10-17 10:00:01'),
(33, '45678901', '2', 'Gustavo', 'Pizarro', 'gustavo.pizarro@email.cl', '+56900000013', 'Calle Central 300', '2025-10-17 10:00:02', '2025-10-17 10:00:02'),
(34, '46789012', '3', 'Lorena', 'Vera', 'lorena.vera@email.cl', '+56900000014', 'Ruta 6 Sur 400', '2025-10-17 10:00:03', '2025-10-17 10:00:03'),
(35, '47890123', '4', 'Sebastián', 'Fuentes', 'sebastian.fuentes@email.cl', '+56900000015', 'Plaza Oeste 500', '2025-10-17 10:00:04', '2025-10-17 10:00:04'),
(36, '48901234', '5', 'Claudia', 'Torres', 'claudia.torres@email.cl', '+56900000016', 'Av. Mar 600', '2025-10-17 10:00:05', '2025-10-17 10:00:05'),
(37, '49012345', '6', 'Fabián', 'Sepúlveda', 'fabian.sepulveda@email.cl', '+56900000017', 'Calle Montaña 700', '2025-10-17 10:00:06', '2025-10-17 10:00:06'),
(38, '50123456', '7', 'Jessica', 'Ramos', 'jessica.ramos@email.cl', '+56900000018', 'Pasaje Río 800', '2025-10-17 10:00:07', '2025-10-17 10:00:07'),
(39, '51234567', '8', 'Nicolás', 'Garrido', 'nicolas.garrido@email.cl', '+56900000019', 'Alameda 900', '2025-10-17 10:00:08', '2025-10-17 10:00:08'),
(40, '52345678', '9', 'Andrea', 'León', 'andrea.leon@email.cl', '+56900000020', 'Costanera 1000', '2025-10-17 10:00:09', '2025-10-17 10:00:09');

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
(1, 1, '20123456', '7', 'Aseo Brillante Ltda.', 'Servicios de limpieza', 'aseo@brillante.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(2, 2, '20234567', '8', 'Tecnoseguridad SA', 'Vigilancia y alarmas', 'contacto@tecno.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(3, 3, '20345678', '9', 'Jardín Perfecto SpA', 'Mantención áreas verdes', 'jardin@perfecto.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(4, 4, '20456789', 'K', 'Plomería Rápida', 'Servicios de plomería', 'plomeria@rapida.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(5, 5, '20567890', '1', 'ElectriCity Chile', 'Electricidad y redes', 'electri@city.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(6, 6, '20678901', '2', 'Contadores Asoc.', 'Servicios de contabilidad', 'info@contadores.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(7, 7, '20789012', '3', 'Ascensores Up', 'Mantención de ascensores', 'soporte@ascensoresup.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(8, 8, '20890123', '4', 'Ferretería Maestra', 'Suministro de materiales', 'ventas@ferreteria.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(9, 9, '20901234', '5', 'Administración Total', 'Administración Externa', 'admin@total.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(10, 10, '21012345', '6', 'Servicio Técnico Gas', 'Mantención red de gas', 'gas@servicio.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(11, 1, '21123456', '7', 'Electricistas Ltda.', 'Servicios eléctricos', 'electrico@serv.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(12, 2, '21234567', '8', 'Plomería Rápida', 'Servicios de plomería', 'plomeria@serv.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(13, 3, '21345678', '9', 'Jardinería Fina', 'Mantención áreas verdes', 'jardin@fina.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(14, 4, '21456789', 'K', 'Albañilería Integral', 'Construcción y reparaciones', 'albañileria@serv.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(15, 5, '21567890', '1', 'Mantención Ascensores A', 'Mantenimiento de ascensores', 'ascensores@mant.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(16, 6, '21678901', '2', 'Software de Adm. SAS', 'Servicios de administración', 'software@adm.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(17, 7, '21789012', '3', 'Seguridad Blindada', 'Vigilancia 24/7', 'seguridad@blindada.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(18, 8, '21890123', '4', 'Materiales Constructivos', 'Suministro de materiales', 'ventas@matcons.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(19, 9, '21901234', '5', 'Asesoría Legal', 'Servicios legales y cobranza', 'legal@asesoria.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(20, 10, '22012345', '6', 'Consultoría Financiera', 'Consultoría contable y finanzas', 'consulta@finan.cl', NULL, NULL, 1, '2025-10-15 21:10:20', '2025-10-15 21:10:20'),
(21, 1, '22123456', '8', 'Seguridad Plus Ltda.', 'Vigilancia 24/7', 'seguridad@plus.cl', NULL, NULL, 1, '2025-10-16 18:17:00', '2025-10-16 18:17:00'),
(22, 2, '22234567', '9', 'Jardinería Urbana SpA', 'Mantención áreas verdes', 'jardineria@urbana.cl', NULL, NULL, 1, '2025-10-16 18:17:01', '2025-10-16 18:17:01'),
(23, 3, '22345678', 'K', 'Suministros Aseo Total', 'Venta de insumos de limpieza', 'suministros@aseo.cl', NULL, NULL, 1, '2025-10-16 18:17:02', '2025-10-16 18:17:02'),
(24, 4, '22456789', '1', 'Contabilidad Online', 'Servicios contables', 'contacto@contables.cl', NULL, NULL, 1, '2025-10-16 18:17:03', '2025-10-16 18:17:03'),
(25, 5, '22567890', '2', 'Servicios Legales y Cobranza', 'Asesoría jurídica', 'legal@serv.cl', NULL, NULL, 1, '2025-10-16 18:17:04', '2025-10-16 18:17:04'),
(26, 6, '22678901', '3', 'Mantención HVAC', 'Climatización y ventilación', 'hvac@mant.cl', NULL, NULL, 1, '2025-10-16 18:17:05', '2025-10-16 18:17:05'),
(27, 7, '22789012', '4', 'Recursos Humanos Outsourcing', 'Gestión de personal', 'rrhh@outsource.cl', NULL, NULL, 1, '2025-10-16 18:17:06', '2025-10-16 18:17:06'),
(28, 8, '22890123', '5', 'Tienda de Pinturas', 'Venta de pinturas y revestimientos', 'pinturas@tienda.cl', NULL, NULL, 1, '2025-10-16 18:17:07', '2025-10-16 18:17:07'),
(29, 9, '22901234', '6', 'Consultoría Financiera', 'Asesoría y planificación financiera', 'finanzas@consulta.cl', NULL, NULL, 1, '2025-10-16 18:17:08', '2025-10-16 18:17:08'),
(30, 10, '23012345', '7', 'Ingeniería Estructural', 'Inspección y reparaciones mayores', 'estructural@ing.cl', NULL, NULL, 1, '2025-10-16 18:17:09', '2025-10-16 18:17:09'),
(31, 1, '23123456', '9', 'Mantención Ascensores B', 'Mantenimiento de ascensores', 'ascensores@mantb.cl', NULL, NULL, 1, '2025-10-17 10:07:00', '2025-10-17 10:07:00'),
(32, 2, '23234567', 'K', 'Control de Plagas Chile', 'Servicios de fumigación', 'plagas@control.cl', NULL, NULL, 1, '2025-10-17 10:07:01', '2025-10-17 10:07:01'),
(33, 3, '23345678', '1', 'Electricidad Express', 'Reparaciones eléctricas', 'electricidad@express.cl', NULL, NULL, 1, '2025-10-17 10:07:02', '2025-10-17 10:07:02'),
(34, 4, '23456789', '2', 'Marketing Vecinal SpA', 'Comunicación y encuestas', 'vecinal@marketing.cl', NULL, NULL, 1, '2025-10-17 10:07:03', '2025-10-17 10:07:03'),
(35, 5, '23567890', '3', 'Servicios de Internet Comunal', 'Suministro de red Wi-Fi', 'internet@comunal.cl', NULL, NULL, 1, '2025-10-17 10:07:04', '2025-10-17 10:07:04'),
(36, 6, '23678901', '4', 'Piscina Limpia Ltda.', 'Mantención de piscinas', 'piscina@limpia.cl', NULL, NULL, 1, '2025-10-17 10:07:05', '2025-10-17 10:07:05'),
(37, 7, '23789012', '5', 'Servicio de Gas Central', 'Revisión y mantenimiento de gas', 'gas@central.cl', NULL, NULL, 1, '2025-10-17 10:07:06', '2025-10-17 10:07:06'),
(38, 8, '23890123', '6', 'Materiales de Construcción Z', 'Venta de materiales', 'ventas@matz.cl', NULL, NULL, 1, '2025-10-17 10:07:07', '2025-10-17 10:07:07'),
(39, 9, '23901234', '7', 'Paisajismo Premium', 'Diseño y mantención de jardines', 'paisaje@premium.cl', NULL, NULL, 1, '2025-10-17 10:07:08', '2025-10-17 10:07:08'),
(40, 10, '24012345', '8', 'Sistemas de Bombeo', 'Mantenimiento de bombas de agua', 'bombas@sistemas.cl', NULL, NULL, 1, '2025-10-17 10:07:09', '2025-10-17 10:07:09'),
(41, 11, '24123456', '9', 'RRHH Conserjería Ltda.', 'Suministro de personal', 'rrhh@conserje.cl', NULL, NULL, 1, '2025-10-17 11:21:00', '2025-10-17 11:21:00'),
(42, 12, '24234567', 'K', 'Maestros del Condominio', 'Servicios de reparaciones varias', 'repara@maestros.cl', NULL, NULL, 1, '2025-10-17 11:21:01', '2025-10-17 11:21:01'),
(43, 13, '24345678', '1', 'Fondo Mutuo Inmobiliario', 'Administración de fondos', 'fondo@mutuo.cl', NULL, NULL, 1, '2025-10-17 11:21:02', '2025-10-17 11:21:02'),
(44, 14, '24456789', '2', 'Aguas del Loteo S.A.', 'Suministro de agua potable', 'aguas@loteo.cl', NULL, NULL, 1, '2025-10-17 11:21:03', '2025-10-17 11:21:03'),
(45, 15, '24567890', '3', 'Bombas y Servicios Ltda.', 'Mantenimiento de sistemas de bombeo', 'bombas@servicios.cl', NULL, NULL, 1, '2025-10-17 11:21:04', '2025-10-17 11:21:04'),
(46, 16, '24678901', '4', 'Animación y Eventos Playa', 'Servicios de recreación', 'eventos@playa.cl', NULL, NULL, 1, '2025-10-17 11:21:05', '2025-10-17 11:21:05'),
(47, 17, '24789012', '5', 'Metrogas Concepción', 'Suministro de gas', 'contacto@metrogas.cl', NULL, NULL, 1, '2025-10-17 11:21:06', '2025-10-17 11:21:06'),
(48, 18, '24890123', '6', 'Abogados de Cobranza', 'Asesoría legal y judicial', 'legal@cobranza.cl', NULL, NULL, 1, '2025-10-17 11:21:07', '2025-10-17 11:21:07'),
(49, 19, '24901234', '7', 'Gestión Comunal S.A.', 'Administración Externa', 'gestion@comunal.cl', NULL, NULL, 1, '2025-10-17 11:21:08', '2025-10-17 11:21:08'),
(50, 20, '25012345', '8', 'Constructora Rutas', 'Reparación de caminos y obras civiles', 'obras@rutas.cl', NULL, NULL, 1, '2025-10-17 11:21:09', '2025-10-17 11:21:09');

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
(1, 1, '2025-10-01 08:30:00', 6, 'entrega', 'Paquete grande recibido para D101.', '2025-10-10 18:10:20'),
(2, 2, '2025-10-01 15:45:00', 6, 'visita', 'Ingreso de técnico de ascensores.', '2025-10-10 18:10:20'),
(3, 3, '2025-10-02 10:00:00', 6, 'reporte', 'Fuga de agua menor reportada en piso 1.', '2025-10-10 18:10:20'),
(4, 4, '2025-10-02 19:20:00', 6, 'retiro', 'Unidad Casa A retira llave de piscina.', '2025-10-10 18:10:20'),
(5, 5, '2025-10-03 07:00:00', 6, 'otro', 'Cambio de turno de seguridad B.', '2025-10-10 18:10:20'),
(6, 6, '2025-10-03 13:30:00', 6, 'visita', 'Visita de contratista para Torre Lujo.', '2025-10-10 18:10:20'),
(7, 7, '2025-10-04 11:00:00', 6, 'reporte', 'Alarma de incendio activada por error.', '2025-10-10 18:10:20'),
(8, 8, '2025-10-04 18:40:00', 6, 'entrega', 'Correspondencia certificada para D105.', '2025-10-10 18:10:20'),
(9, 9, '2025-10-05 05:00:00', 6, 'otro', 'Prueba de grupo electrógeno OK.', '2025-10-10 18:10:20'),
(10, 10, '2025-10-05 17:15:00', 6, 'visita', 'Amigo visita a residente de D202.', '2025-10-10 18:10:20'),
(11, 1, '2025-10-06 09:00:00', 6, 'visita', 'Ingreso de técnico de ascensores. Torre 1.', '2025-10-15 21:11:43'),
(12, 2, '2025-10-07 14:30:00', 6, 'entrega', 'Paquete para D306.', '2025-10-15 21:11:43'),
(13, 3, '2025-10-08 11:00:00', 6, 'reporte', 'Vandalismo en área común, se tomó foto.', '2025-10-15 21:11:43'),
(14, 4, '2025-10-09 18:00:00', 6, 'retiro', 'Casa B retira paquete grande.', '2025-10-15 21:11:43'),
(15, 5, '2025-10-10 07:30:00', 6, 'otro', 'Prueba de luces de emergencia OK.', '2025-10-15 21:11:43'),
(16, 6, '2025-10-11 15:00:00', 6, 'visita', 'Abogado por tema de cobranza. D1002', '2025-10-15 21:11:43'),
(17, 7, '2025-10-12 10:30:00', 6, 'entrega', 'Correspondencia certificada para D1503.', '2025-10-15 21:11:43'),
(18, 8, '2025-10-13 17:00:00', 6, 'reporte', 'Falla en portón de acceso.', '2025-10-15 21:11:43'),
(19, 9, '2025-10-14 06:00:00', 6, 'retiro', 'D20 retira llaves de quincho.', '2025-10-15 21:11:43'),
(20, 10, '2025-10-15 13:00:00', 6, 'visita', 'Instalador de fibra óptica. D203.', '2025-10-15 21:11:43'),
(21, 1, '2025-10-16 09:30:00', 6, 'reporte', 'Se reporta mal olor en el conducto de basura de Torre 4.', '2025-10-16 18:33:00'),
(22, 2, '2025-10-16 16:45:00', 6, 'entrega', 'Paquete para D401, se deja en custodia.', '2025-10-16 18:33:01'),
(23, 3, '2025-10-17 11:15:00', 6, 'reporte', 'Persona ajena usando la piscina, se retiró.', '2025-10-16 18:33:02'),
(24, 4, '2025-10-17 20:00:00', 6, 'retiro', 'Casa C retira llave de quincho.', '2025-10-16 18:33:03'),
(25, 5, '2025-10-18 08:00:00', 6, 'otro', 'Revisión periódica de extintores en Torre Europa.', '2025-10-16 18:33:04'),
(26, 6, '2025-10-18 14:00:00', 6, 'visita', 'Técnico de climatización ingresa a D2001.', '2025-10-16 18:33:05'),
(27, 7, '2025-10-19 12:30:00', 6, 'reporte', 'Gato en el tejado, se llamó a control animal.', '2025-10-16 18:33:06'),
(28, 8, '2025-10-19 19:10:00', 6, 'entrega', 'Correspondencia certificada para D201.', '2025-10-16 18:33:07'),
(29, 9, '2025-10-20 06:30:00', 6, 'otro', 'Limpieza profunda de ascensor de Torre 3.', '2025-10-16 18:33:08'),
(30, 10, '2025-10-20 17:30:00', 6, 'visita', 'Instalador de gas para D301.', '2025-10-16 18:33:09'),
(31, 1, '2025-10-21 08:30:00', 6, 'reporte', 'Falla en ascensor de Torre 5, se llamó a Mantención Ascensores B.', '2025-10-17 10:23:00'),
(32, 2, '2025-10-21 16:00:00', 6, 'visita', 'Ingreso de furgón de Control de Plagas Chile.', '2025-10-17 10:23:01'),
(33, 3, '2025-10-22 10:30:00', 6, 'entrega', 'Paquete certificado para D601.', '2025-10-17 10:23:02'),
(34, 4, '2025-10-22 19:30:00', 6, 'otro', 'Se repartió boletín informativo N°12 en buzones.', '2025-10-17 10:23:03'),
(35, 5, '2025-10-23 07:15:00', 6, 'reporte', 'Vandalismo menor en la Sala Cowork. Foto adjunta.', '2025-10-17 10:23:04'),
(36, 6, '2025-10-23 14:30:00', 6, 'retiro', 'D3001 retira llave de Sala de Cine.', '2025-10-17 10:23:05'),
(37, 7, '2025-10-24 11:45:00', 6, 'visita', 'Técnico de Servicio de Gas Central para inspección.', '2025-10-17 10:23:06'),
(38, 8, '2025-10-24 18:30:00', 6, 'reporte', 'Ruidos molestos de taladro en Bloque 4 después de las 18:00 hrs.', '2025-10-17 10:23:07'),
(39, 9, '2025-10-25 05:45:00', 6, 'entrega', 'Correspondencia masiva de la Administración.', '2025-10-17 10:23:08'),
(40, 10, '2025-10-25 17:00:00', 6, 'otro', 'Se repara luz quemada en estacionamiento B41.', '2025-10-17 10:23:09');

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
(1, 1, 1, 1, 1, '2025-10-15 19:00:00', '2025-10-15 22:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(2, 2, 2, 3, 3, '2025-10-16 12:00:00', '2025-10-16 16:00:00', 'solicitada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(3, 3, 3, 4, 4, '2025-10-17 07:00:00', '2025-10-17 08:00:00', 'cumplida', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(4, 4, 4, 5, 5, '2025-10-18 14:00:00', '2025-10-18 18:00:00', 'rechazada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(5, 5, 5, 6, 6, '2025-10-19 09:00:00', '2025-10-19 13:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(6, 6, 6, 7, 7, '2025-10-20 20:00:00', '2025-10-20 23:00:00', 'solicitada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(7, 7, 7, 8, 8, '2025-10-21 10:00:00', '2025-10-21 12:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(8, 8, 8, 9, 9, '2025-10-22 17:00:00', '2025-10-22 21:00:00', 'cumplida', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(9, 9, 9, 10, 10, '2025-10-23 11:00:00', '2025-10-23 12:30:00', 'cancelada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(10, 10, 10, 10, 10, '2025-10-24 16:00:00', '2025-10-24 18:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(11, 1, 11, 11, 11, '2025-11-15 10:00:00', '2025-11-15 12:00:00', 'aprobada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(12, 2, 12, 13, 13, '2025-11-16 14:00:00', '2025-11-16 18:00:00', 'solicitada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(13, 3, 13, 14, 14, '2025-11-17 09:00:00', '2025-11-17 10:30:00', 'cumplida', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(14, 4, 14, 15, 15, '2025-11-18 19:00:00', '2025-11-18 23:00:00', 'rechazada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(15, 5, 15, 16, 16, '2025-11-19 11:00:00', '2025-11-19 14:00:00', 'aprobada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(16, 6, 16, 17, 17, '2025-11-20 16:00:00', '2025-11-20 18:00:00', 'solicitada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(17, 7, 17, 18, 18, '2025-11-21 21:00:00', '2025-11-21 22:00:00', 'aprobada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(18, 8, 18, 19, 19, '2025-11-22 15:00:00', '2025-11-22 17:00:00', 'cumplida', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(19, 9, 19, 20, 20, '2025-11-23 18:00:00', '2025-11-23 19:00:00', 'cancelada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(20, 10, 20, 10, 10, '2025-11-24 10:00:00', '2025-11-24 12:00:00', 'aprobada', '2025-10-15 21:11:40', '2025-10-15 21:11:40'),
(21, 1, 1, 21, 21, '2025-12-01 19:00:00', '2025-12-01 23:00:00', 'solicitada', '2025-10-16 18:34:00', '2025-10-16 18:34:00'),
(22, 2, 2, 22, 22, '2025-12-02 11:00:00', '2025-12-02 15:00:00', 'aprobada', '2025-10-16 18:34:01', '2025-10-16 18:34:01'),
(23, 3, 3, 23, 23, '2025-12-03 06:30:00', '2025-12-03 07:30:00', 'solicitada', '2025-10-16 18:34:02', '2025-10-16 18:34:02'),
(24, 4, 4, 24, 24, '2025-12-04 15:00:00', '2025-12-04 19:00:00', 'aprobada', '2025-10-16 18:34:03', '2025-10-16 18:34:03'),
(25, 5, 5, 25, 25, '2025-12-05 10:00:00', '2025-12-05 12:00:00', 'cumplida', '2025-10-16 18:34:04', '2025-10-16 18:34:04'),
(26, 6, 6, 26, 26, '2025-12-06 20:30:00', '2025-12-06 23:30:00', 'rechazada', '2025-10-16 18:34:05', '2025-10-16 18:34:05'),
(27, 7, 7, 27, 27, '2025-12-07 09:30:00', '2025-12-07 11:30:00', 'solicitada', '2025-10-16 18:34:06', '2025-10-16 18:34:06'),
(28, 8, 8, 28, 28, '2025-12-08 18:00:00', '2025-12-08 22:00:00', 'aprobada', '2025-10-16 18:34:07', '2025-10-16 18:34:07'),
(29, 9, 9, 29, 29, '2025-12-09 13:00:00', '2025-12-09 14:30:00', 'cancelada', '2025-10-16 18:34:08', '2025-10-16 18:34:08'),
(30, 10, 10, 30, 30, '2025-12-10 17:00:00', '2025-12-10 19:00:00', 'solicitada', '2025-10-16 18:34:09', '2025-10-16 18:34:09'),
(31, 1, 1, 31, 31, '2025-12-11 19:00:00', '2025-12-11 22:00:00', 'aprobada', '2025-10-17 10:24:00', '2025-10-17 10:24:00'),
(32, 2, 2, 32, 32, '2025-12-12 12:00:00', '2025-12-12 16:00:00', 'solicitada', '2025-10-17 10:24:01', '2025-10-17 10:24:01'),
(33, 3, 3, 33, 33, '2025-12-13 08:00:00', '2025-12-13 09:00:00', 'cumplida', '2025-10-17 10:24:02', '2025-10-17 10:24:02'),
(34, 4, 4, 34, 34, '2025-12-14 14:00:00', '2025-12-14 18:00:00', 'rechazada', '2025-10-17 10:24:03', '2025-10-17 10:24:03'),
(35, 5, 5, 35, 35, '2025-12-15 09:00:00', '2025-12-15 13:00:00', 'aprobada', '2025-10-17 10:24:04', '2025-10-17 10:24:04'),
(36, 6, 6, 36, 36, '2025-12-16 20:00:00', '2025-12-16 23:00:00', 'solicitada', '2025-10-17 10:24:05', '2025-10-17 10:24:05'),
(37, 7, 7, 37, 37, '2025-12-17 10:00:00', '2025-12-17 12:00:00', 'cumplida', '2025-10-17 10:24:06', '2025-10-17 10:24:06'),
(38, 8, 8, 38, 38, '2025-12-18 17:00:00', '2025-12-18 21:00:00', 'aprobada', '2025-10-17 10:24:07', '2025-10-17 10:24:07'),
(39, 9, 9, 39, 39, '2025-12-19 11:00:00', '2025-12-19 12:30:00', 'cancelada', '2025-10-17 10:24:08', '2025-10-17 10:24:08'),
(40, 10, 10, 40, 40, '2025-12-20 16:00:00', '2025-12-20 18:00:00', 'solicitada', '2025-10-17 10:24:09', '2025-10-17 10:24:09');

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
('SES-01', 1, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-10 17:00:00', '2025-10-10 18:10:23'),
('SES-02', 2, '192.168.1.2', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-10 16:30:00', '2025-10-10 18:10:23'),
('SES-03', 3, '192.168.1.3', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-10 15:50:00', '2025-10-10 18:10:23'),
('SES-04', 4, '192.168.1.4', 'Mozilla/5.0 (Android)', NULL, '2025-10-09 10:00:00', '2025-10-10 18:10:23'),
('SES-05', 5, '192.168.1.5', 'Mozilla/5.0 (Linux)', NULL, '2025-10-10 14:15:00', '2025-10-10 18:10:23'),
('SES-06', 6, '192.168.1.6', 'Mozilla/5.0 (iPad)', NULL, '2025-10-10 13:45:00', '2025-10-10 18:10:23'),
('SES-07', 7, '192.168.1.7', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-08 11:20:00', '2025-10-10 18:10:23'),
('SES-08', 8, '192.168.1.8', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-10 12:05:00', '2025-10-10 18:10:23'),
('SES-09', 9, '192.168.1.9', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-10 11:30:00', '2025-10-10 18:10:23'),
('SES-10', 10, '192.168.1.10', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-10 10:00:00', '2025-10-10 18:10:23'),
('SES-11', 11, '192.168.1.11', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-12', 12, '192.168.1.12', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-13', 13, '192.168.1.13', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-14', 14, '192.168.1.14', 'Mozilla/5.0 (Android)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-15', 15, '192.168.1.15', 'Mozilla/5.0 (Linux)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-16', 16, '192.168.1.16', 'Mozilla/5.0 (iPad)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-17', 17, '192.168.1.17', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-18', 18, '192.168.1.18', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-19', 19, '192.168.1.19', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-20', 20, '192.168.1.20', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-15 21:10:19', '2025-10-15 21:10:19'),
('SES-21', 21, '192.168.1.21', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-17 10:00:00', '2025-10-17 11:08:00'),
('SES-22', 22, '192.168.1.22', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-17 09:30:00', '2025-10-17 11:08:01'),
('SES-23', 23, '192.168.1.23', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-17 08:50:00', '2025-10-17 11:08:02'),
('SES-24', 24, '192.168.1.24', 'Mozilla/5.0 (Android)', NULL, '2025-10-16 23:00:00', '2025-10-17 11:08:03'),
('SES-25', 25, '192.168.1.25', 'Mozilla/5.0 (Linux)', NULL, '2025-10-17 07:15:00', '2025-10-17 11:08:04'),
('SES-26', 26, '192.168.1.26', 'Mozilla/5.0 (iPad)', NULL, '2025-10-17 06:45:00', '2025-10-17 11:08:05'),
('SES-27', 27, '192.168.1.27', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-15 05:20:00', '2025-10-17 11:08:06'),
('SES-28', 28, '192.168.1.28', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-17 05:05:00', '2025-10-17 11:08:07'),
('SES-29', 29, '192.168.1.29', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-17 04:30:00', '2025-10-17 11:08:08'),
('SES-30', 30, '192.168.1.30', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-17 03:00:00', '2025-10-17 11:08:09');

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
(1, 1, 'agua', '2025-09', NULL, 0.650000, 1800.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(2, 2, 'gas', '2025-09', NULL, 1.200000, 2200.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(3, 3, 'electricidad', '2025-09', NULL, 0.950000, 2500.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(4, 4, 'agua', '2025-09', NULL, 0.700000, 1900.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(5, 5, 'gas', '2025-09', NULL, 1.300000, 2000.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(6, 6, 'electricidad', '2025-09', NULL, 1.000000, 2600.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(7, 7, 'agua', '2025-09', NULL, 0.600000, 1700.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(8, 8, 'gas', '2025-09', NULL, 1.250000, 2100.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(9, 9, 'electricidad', '2025-09', NULL, 0.900000, 2400.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(10, 10, 'agua', '2025-09', NULL, 0.680000, 1850.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(11, 1, 'agua', '2025-10', NULL, 0.700000, 1900.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(12, 2, 'gas', '2025-10', NULL, 1.300000, 2300.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(13, 3, 'electricidad', '2025-10', NULL, 0.980000, 2600.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(14, 4, 'agua', '2025-10', NULL, 0.750000, 2000.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(15, 5, 'gas', '2025-10', NULL, 1.400000, 2100.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(16, 6, 'electricidad', '2025-10', NULL, 1.050000, 2700.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(17, 7, 'agua', '2025-10', NULL, 0.650000, 1800.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(18, 8, 'gas', '2025-10', NULL, 1.350000, 2200.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(19, 9, 'electricidad', '2025-10', NULL, 0.930000, 2500.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(20, 10, 'agua', '2025-10', NULL, 0.720000, 1950.00, '2025-10-15 21:10:32', '2025-10-15 21:10:32'),
(21, 1, 'electricidad', '2025-11', NULL, 0.900000, 2400.00, '2025-10-17 11:04:00', '2025-10-17 11:04:00'),
(22, 2, 'electricidad', '2025-11', NULL, 1.050000, 2800.00, '2025-10-17 11:04:01', '2025-10-17 11:04:01'),
(23, 3, 'gas', '2025-11', NULL, 1.350000, 2250.00, '2025-10-17 11:04:02', '2025-10-17 11:04:02'),
(24, 4, 'gas', '2025-11', NULL, 1.450000, 2150.00, '2025-10-17 11:04:03', '2025-10-17 11:04:03'),
(25, 5, 'electricidad', '2025-11', NULL, 1.100000, 2900.00, '2025-10-17 11:04:04', '2025-10-17 11:04:04'),
(26, 6, 'gas', '2025-11', NULL, 1.500000, 2350.00, '2025-10-17 11:04:05', '2025-10-17 11:04:05'),
(27, 7, 'electricidad', '2025-11', NULL, 0.920000, 2550.00, '2025-10-17 11:04:06', '2025-10-17 11:04:06'),
(28, 8, 'gas', '2025-11', NULL, 1.380000, 2280.00, '2025-10-17 11:04:07', '2025-10-17 11:04:07'),
(29, 9, 'electricidad', '2025-11', NULL, 0.950000, 2650.00, '2025-10-17 11:04:08', '2025-10-17 11:04:08'),
(30, 10, 'gas', '2025-11', NULL, 1.420000, 2180.00, '2025-10-17 11:04:09', '2025-10-17 11:04:09');

-- --------------------------------------------------------

--
-- Stand-in structure for view `ticket`
-- (See below for the actual view)
--
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
(1, 1, 1, 'Electricidad', 'Problema con medidor', 'Medidor no marca correctamente.', 'abierto', 'alta', 8, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(2, 2, 3, 'Limpieza', 'Basura en pasillo', 'Basura acumulada cerca del ducto.', 'en_progreso', 'media', 6, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(3, 3, 4, 'Ascensor', 'Ascensor detenido', 'Ascensor principal no funciona.', 'cerrado', 'alta', 7, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(4, 4, 5, 'Jardinería', 'Árbol seco', 'Árbol frontal necesita ser retirado.', 'abierto', 'baja', NULL, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(5, 5, 6, 'Seguridad', 'Cámara apagada', 'Cámara de seguridad N°5 no enciende.', 'en_progreso', 'alta', 2, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(6, 6, 7, 'Mantención', 'Filtración en techo', 'Mancha de humedad en techo de unidad D1001.', 'resuelto', 'media', 1, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(7, 7, 8, 'Iluminación', 'Foco quemado', 'Foco quemado en pasillo piso 15.', 'cerrado', 'media', 5, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(8, 8, 9, 'Infraestructura', 'Grieta en muro exterior', 'Grieta visible en bloque 1.', 'abierto', 'alta', NULL, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(9, 9, 10, 'Ascensor', 'Ruidos extraños', 'Ascensor hace ruidos al frenar.', 'en_progreso', 'alta', 3, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(10, 10, 10, 'Electricidad', 'Cortocircuito', 'Olor a quemado cerca de la sala eléctrica.', 'cerrado', 'alta', 4, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(11, 1, 21, 'Fontanería', 'Fuga de agua en el techo', 'Goteo constante en la cocina de D301.', 'abierto', 'alta', 8, NULL, '2025-10-16 18:35:00', '2025-10-16 18:35:00'),
(12, 2, 22, 'Mantenimiento', 'Pared con hongos', 'Humedad en pared exterior de D401.', 'en_progreso', 'media', 6, NULL, '2025-10-16 18:35:01', '2025-10-16 18:35:01'),
(13, 3, 23, 'Limpieza', 'Basura acumulada', 'Bolsas de basura en área de tránsito.', 'abierto', 'media', 7, NULL, '2025-10-16 18:35:02', '2025-10-16 18:35:02'),
(14, 4, 24, 'Electricidad', 'Foco de acceso quemado', 'Foco de entrada principal a Casa C no enciende.', 'resuelto', 'baja', 1, NULL, '2025-10-16 18:35:03', '2025-10-16 18:35:03'),
(15, 5, 25, 'Seguridad', 'Portón automático averiado', 'Portón de acceso vehicular no cierra correctamente.', 'en_progreso', 'alta', 2, NULL, '2025-10-16 18:35:04', '2025-10-16 18:35:04'),
(16, 6, 26, 'Climatización', 'Aire acondicionado sin funcionar', 'El sistema central de D2001 no enfría.', 'abierto', 'media', 1, NULL, '2025-10-16 18:35:05', '2025-10-16 18:35:05'),
(17, 7, 27, 'Ascensor', 'Botón de piso dañado', 'Botón del piso 16 en Torre Moderno roto.', 'cerrado', 'media', 5, NULL, '2025-10-16 18:35:06', '2025-10-16 18:35:06'),
(18, 8, 28, 'Infraestructura', 'Suelo desnivelado', 'Baldosas levantadas en pasillo exterior de Bloque 3.', 'abierto', 'alta', NULL, NULL, '2025-10-16 18:35:07', '2025-10-16 18:35:07'),
(19, 9, 29, 'Jardinería', 'Poda de árbol requerida', 'Árbol tocando ventana de D30, peligroso con viento.', 'en_progreso', 'baja', 3, NULL, '2025-10-16 18:35:08', '2025-10-16 18:35:08'),
(20, 10, 30, 'Fontanería', 'Inodoro con fuga', 'Fuga de agua en el inodoro de D301.', 'abierto', 'media', 4, NULL, '2025-10-16 18:35:09', '2025-10-16 18:35:09');

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
(1, 1, 1, 1, 'propietario', '2024-01-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(2, 1, 2, 2, 'arrendatario', '2024-02-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(3, 2, 3, 3, 'propietario', '2024-03-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(4, 3, 4, 4, 'arrendatario', '2024-04-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(5, 4, 5, 5, 'propietario', '2024-05-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(6, 5, 6, 6, 'arrendatario', '2024-06-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(7, 6, 7, 7, 'propietario', '2024-07-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(8, 7, 8, 8, 'arrendatario', '2024-08-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(9, 8, 9, 9, 'propietario', '2024-09-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(10, 9, 9, 10, 'arrendatario', '2024-10-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(11, 1, 11, 11, 'propietario', '2025-01-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(12, 1, 12, 12, 'arrendatario', '2025-02-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(13, 2, 13, 13, 'propietario', '2025-03-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(14, 3, 14, 14, 'arrendatario', '2025-04-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(15, 4, 15, 15, 'propietario', '2025-05-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(16, 5, 16, 16, 'arrendatario', '2025-06-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(17, 6, 17, 17, 'propietario', '2025-07-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(18, 7, 18, 18, 'arrendatario', '2025-08-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(19, 8, 19, 19, 'propietario', '2025-09-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(20, 9, 20, 20, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-15 21:11:39', '2025-10-15 21:11:39'),
(21, 1, 21, 21, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:00', '2025-10-16 18:16:00'),
(22, 2, 22, 22, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:01', '2025-10-16 18:16:01'),
(23, 3, 23, 23, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:02', '2025-10-16 18:16:02'),
(24, 4, 24, 24, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:03', '2025-10-16 18:16:03'),
(25, 5, 25, 25, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:04', '2025-10-16 18:16:04'),
(26, 6, 26, 26, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:05', '2025-10-16 18:16:05'),
(27, 7, 27, 27, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:06', '2025-10-16 18:16:06'),
(28, 8, 28, 28, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:07', '2025-10-16 18:16:07'),
(29, 9, 29, 29, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:08', '2025-10-16 18:16:08'),
(30, 10, 30, 30, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-16 18:16:09', '2025-10-16 18:16:09'),
(31, 1, 31, 31, 'arrendatario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:00', '2025-10-17 10:06:00'),
(32, 2, 32, 32, 'propietario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:01', '2025-10-17 10:06:01'),
(33, 3, 33, 33, 'arrendatario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:02', '2025-10-17 10:06:02'),
(34, 4, 34, 34, 'propietario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:03', '2025-10-17 10:06:03'),
(35, 5, 35, 35, 'arrendatario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:04', '2025-10-17 10:06:04'),
(36, 6, 36, 36, 'propietario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:05', '2025-10-17 10:06:05'),
(37, 7, 37, 37, 'arrendatario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:06', '2025-10-17 10:06:06'),
(38, 8, 38, 38, 'propietario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:07', '2025-10-17 10:06:07'),
(39, 9, 39, 39, 'arrendatario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:08', '2025-10-17 10:06:08'),
(40, 10, 40, 40, 'propietario', '2025-10-17', NULL, 100.00, '2025-10-17 10:06:09', '2025-10-17 10:06:09');

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
(1, 1, 'Torre 1', 'T01', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(2, 1, 'Torre 2', 'T02', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(3, 2, 'Torre Norte', 'TN', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(4, 3, 'Única Torre', 'UT', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(5, 4, 'Sector A', 'SA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(6, 5, 'Alameda A', 'AA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(7, 6, 'Luxury A', 'LA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(8, 7, 'Central A', 'CA', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(9, 8, 'Bloque Principal', 'BP', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(10, 10, 'Torre 1', 'T1', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(11, 1, 'Torre 3', 'T03', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(12, 2, 'Torre Sur', 'TS', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(13, 3, 'Torre Este', 'TE', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(14, 4, 'Sector B', 'SB', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(15, 5, 'Alameda B', 'AB', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(16, 6, 'Luxury B', 'LB', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(17, 7, 'Central B', 'CB', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(18, 8, 'Bloque Posterior', 'BP2', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(19, 9, 'Torre 3', 'T3', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(20, 10, 'Torre El Llano B', 'LLB', '2025-10-15 21:10:11', '2025-10-15 21:10:11'),
(21, 21, 'Torre 4', 'T04', '2025-10-16 18:14:00', '2025-10-16 18:14:00'),
(22, 22, 'Torre Oeste', 'TO', '2025-10-16 18:14:01', '2025-10-16 18:14:01'),
(23, 23, 'Torre Central', 'TC', '2025-10-16 18:14:02', '2025-10-16 18:14:02'),
(24, 24, 'Sector C', 'SC', '2025-10-16 18:14:03', '2025-10-16 18:14:03'),
(25, 25, 'Europa A', 'EA', '2025-10-16 18:14:04', '2025-10-16 18:14:04'),
(26, 26, 'Master A', 'MA', '2025-10-16 18:14:05', '2025-10-16 18:14:05'),
(27, 27, 'Moderno A', 'MA', '2025-10-16 18:14:06', '2025-10-16 18:14:06'),
(28, 28, 'Bloque Anexo', 'BA', '2025-10-16 18:14:07', '2025-10-16 18:14:07'),
(29, 29, 'Torre 4', 'T4', '2025-10-16 18:14:08', '2025-10-16 18:14:08'),
(30, 30, 'Torre Sur A', 'TSA', '2025-10-16 18:14:09', '2025-10-16 18:14:09'),
(31, 31, 'Torre 5', 'T05', '2025-10-17 10:04:00', '2025-10-17 10:04:00'),
(32, 32, 'Torre Oeste B', 'OB', '2025-10-17 10:04:01', '2025-10-17 10:04:01'),
(33, 33, 'Torre Sur', 'TS', '2025-10-17 10:04:02', '2025-10-17 10:04:02'),
(34, 34, 'Sector D', 'SD', '2025-10-17 10:04:03', '2025-10-17 10:04:03'),
(35, 35, 'Asia A', 'AA', '2025-10-17 10:04:04', '2025-10-17 10:04:04'),
(36, 36, 'Jardín A', 'JA', '2025-10-17 10:04:05', '2025-10-17 10:04:05'),
(37, 37, 'Río A', 'RA', '2025-10-17 10:04:06', '2025-10-17 10:04:06'),
(38, 38, 'Bloque Céntrico', 'BC', '2025-10-17 10:04:07', '2025-10-17 10:04:07'),
(39, 39, 'Torre 5', 'T5', '2025-10-17 10:04:08', '2025-10-17 10:04:08'),
(40, 40, 'Norte A', 'NA', '2025-10-17 10:04:09', '2025-10-17 10:04:09'),
(41, 41, 'Torre 1', 'T1', '2025-10-17 11:16:00', '2025-10-17 11:16:00'),
(42, 41, 'Torre 2', 'T2', '2025-10-17 11:16:01', '2025-10-17 11:16:01'),
(43, 42, 'Bloque A', 'BA', '2025-10-17 11:16:02', '2025-10-17 11:16:02'),
(44, 43, 'Torre Principal', 'TP', '2025-10-17 11:16:03', '2025-10-17 11:16:03'),
(45, 44, 'Parcela 1', 'P1', '2025-10-17 11:16:04', '2025-10-17 11:16:04'),
(46, 45, 'Torre A', 'TA', '2025-10-17 11:16:05', '2025-10-17 11:16:05'),
(47, 46, 'Edificio Mar', 'EM', '2025-10-17 11:16:06', '2025-10-17 11:16:06'),
(48, 47, 'Torre Norte', 'TN', '2025-10-17 11:16:07', '2025-10-17 11:16:07'),
(49, 48, 'Bloque Alto', 'BA', '2025-10-17 11:16:08', '2025-10-17 11:16:08'),
(50, 49, 'Torre Sol', 'TS', '2025-10-17 11:16:09', '2025-10-17 11:16:09');

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
('2025-10-11', 36575.4554),
('2025-10-12', 36580.7887),
('2025-10-13', 36585.1220),
('2025-10-14', 36590.4553),
('2025-10-15', 36595.7886),
('2025-10-16', 36600.1219),
('2025-10-17', 36605.4552),
('2025-10-18', 36610.7885),
('2025-10-19', 36615.1218),
('2025-10-20', 36620.4551);

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
(1, 1, 1, 1, 'D101', 0.015000, 60.50, NULL, NULL, 'E101', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(2, 1, 1, 2, 'D201', 0.020000, 75.80, NULL, NULL, 'E201', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(3, 2, 2, 3, 'D305', 0.018000, 68.20, NULL, NULL, 'E305', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(4, 3, 3, 4, 'D402', 0.025000, 85.00, NULL, NULL, 'E402', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(5, 4, 4, 5, 'Casa A', 0.030000, 120.00, NULL, NULL, 'CPA', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(6, 5, 5, 6, 'D501', 0.012000, 55.00, NULL, NULL, 'E501', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(7, 6, 6, 7, 'D1001', 0.040000, 150.90, NULL, NULL, 'EL1', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(8, 7, 7, 8, 'D1502', 0.022000, 78.10, NULL, NULL, 'E152', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(9, 8, 8, 9, 'D105', 0.017000, 63.40, NULL, NULL, 'E105', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(10, 10, 10, 10, 'D202', 0.019000, 70.30, NULL, NULL, 'E202', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(11, 1, 1, 11, 'D102', 0.015000, 60.50, 5.00, 'B11', 'E102', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(12, 1, 1, 11, 'D202', 0.020000, 75.80, 8.00, 'B22', 'E202', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(13, 2, 2, 12, 'D306', 0.018000, 68.20, 0.00, NULL, 'E306', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(14, 3, 3, 13, 'D403', 0.025000, 85.00, 10.00, 'B43', 'E403', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(15, 4, 4, 14, 'Casa B', 0.030000, 120.00, 20.00, NULL, 'CPB', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(16, 5, 5, 15, 'D502', 0.012000, 55.00, 4.00, 'B52', 'E502', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(17, 6, 6, 16, 'D1002', 0.040000, 150.90, 30.00, 'EL2', 'EL2', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(18, 7, 7, 17, 'D1503', 0.022000, 78.10, 0.00, NULL, 'E153', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(19, 8, 8, 18, 'D106', 0.017000, 63.40, 6.00, 'B16', 'E106', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(20, 10, 10, 20, 'D203', 0.019000, 70.30, 0.00, NULL, 'E203', 1, '2025-10-15 21:10:13', '2025-10-15 21:10:13'),
(21, 1, 21, 21, 'D301', 0.016000, 65.50, 0.00, 'B31', 'E301', 1, '2025-10-16 18:15:00', '2025-10-16 18:15:00'),
(22, 2, 22, 22, 'D401', 0.019000, 70.00, 4.00, NULL, 'E401', 1, '2025-10-16 18:15:01', '2025-10-16 18:15:01'),
(23, 3, 23, 23, 'D501', 0.026000, 90.00, 12.00, 'B51', 'E501', 1, '2025-10-16 18:15:02', '2025-10-16 18:15:02'),
(24, 4, 24, 24, 'Casa C', 0.035000, 130.00, 25.00, NULL, 'CPC', 1, '2025-10-16 18:15:03', '2025-10-16 18:15:03'),
(25, 5, 25, 25, 'D601', 0.013000, 60.00, 0.00, 'B61', 'E601', 1, '2025-10-16 18:15:04', '2025-10-16 18:15:04'),
(26, 6, 26, 26, 'D2001', 0.045000, 160.00, 40.00, 'EL3', 'EL3', 1, '2025-10-16 18:15:05', '2025-10-16 18:15:05'),
(27, 7, 27, 27, 'D1601', 0.023000, 80.00, 0.00, NULL, 'E161', 1, '2025-10-16 18:15:06', '2025-10-16 18:15:06'),
(28, 8, 28, 28, 'D201', 0.018000, 65.00, 7.00, 'B21', 'E201', 1, '2025-10-16 18:15:07', '2025-10-16 18:15:07'),
(29, 9, 29, 29, 'D30', 0.015000, 58.00, 0.00, NULL, 'E30', 1, '2025-10-16 18:15:08', '2025-10-16 18:15:08'),
(30, 10, 30, 30, 'D301', 0.020000, 75.00, 0.00, 'B31', 'E301', 1, '2025-10-16 18:15:09', '2025-10-16 18:15:09'),
(31, 1, 31, 31, 'D401', 0.017000, 70.00, 8.00, 'B41', 'E401', 1, '2025-10-17 10:05:00', '2025-10-17 10:05:00'),
(32, 2, 32, 32, 'D501', 0.020000, 75.00, 5.00, NULL, 'E501', 1, '2025-10-17 10:05:01', '2025-10-17 10:05:01'),
(33, 3, 33, 33, 'D601', 0.027000, 95.00, 10.00, 'B61', 'E601', 1, '2025-10-17 10:05:02', '2025-10-17 10:05:02'),
(34, 4, 34, 34, 'Casa D', 0.032000, 140.00, 30.00, NULL, 'CPD', 1, '2025-10-17 10:05:03', '2025-10-17 10:05:03'),
(35, 5, 35, 35, 'D701', 0.014000, 65.00, 0.00, 'B71', 'E701', 1, '2025-10-17 10:05:04', '2025-10-17 10:05:04'),
(36, 6, 36, 36, 'D3001', 0.042000, 170.00, 35.00, 'EL4', 'EL4', 1, '2025-10-17 10:05:05', '2025-10-17 10:05:05'),
(37, 7, 37, 37, 'D1701', 0.024000, 85.00, 0.00, NULL, 'E171', 1, '2025-10-17 10:05:06', '2025-10-17 10:05:06'),
(38, 8, 38, 38, 'D301', 0.019000, 70.00, 6.00, 'B31', 'E301', 1, '2025-10-17 10:05:07', '2025-10-17 10:05:07'),
(39, 9, 39, 39, 'D40', 0.016000, 60.00, 0.00, NULL, 'E40', 1, '2025-10-17 10:05:08', '2025-10-17 10:05:08'),
(40, 10, 40, 40, 'D401', 0.021000, 80.00, 0.00, 'B41', 'E401', 1, '2025-10-17 10:05:09', '2025-10-17 10:05:09'),
(41, 11, 41, 41, 'D101', 0.015000, 60.00, 5.00, 'B11', 'E11', 1, '2025-10-17 11:17:00', '2025-10-17 11:17:00'),
(42, 11, 41, 42, 'D201', 0.020000, 75.00, 8.00, 'B21', 'E21', 1, '2025-10-17 11:17:01', '2025-10-17 11:17:01'),
(43, 12, 42, 43, 'D301', 0.018000, 68.00, 0.00, NULL, 'E31', 1, '2025-10-17 11:17:02', '2025-10-17 11:17:02'),
(44, 13, 43, 44, 'D401', 0.025000, 85.00, 10.00, 'B41', 'E41', 1, '2025-10-17 11:17:03', '2025-10-17 11:17:03'),
(45, 14, 44, 45, 'Casa 1', 0.030000, 150.00, 30.00, NULL, 'CP1', 1, '2025-10-17 11:17:04', '2025-10-17 11:17:04'),
(46, 15, 45, 46, 'D501', 0.012000, 55.00, 4.00, 'B51', 'E51', 1, '2025-10-17 11:17:05', '2025-10-17 11:17:05'),
(47, 16, 46, 47, 'D601', 0.040000, 160.00, 35.00, 'EL1', 'EL1', 1, '2025-10-17 11:17:06', '2025-10-17 11:17:06'),
(48, 17, 47, 48, 'D701', 0.022000, 78.00, 0.00, NULL, 'E71', 1, '2025-10-17 11:17:07', '2025-10-17 11:17:07'),
(49, 18, 48, 49, 'D801', 0.017000, 63.00, 6.00, 'B81', 'E81', 1, '2025-10-17 11:17:08', '2025-10-17 11:17:08'),
(50, 19, 49, 50, 'D901', 0.019000, 70.00, 0.00, NULL, 'E91', 1, '2025-10-17 11:17:09', '2025-10-17 11:17:09');

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
(1, 1, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(2, 2, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(3, 3, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(4, 4, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(5, 5, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(6, 6, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(7, 7, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(8, 8, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(9, 9, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(10, 10, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(11, 11, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-17 11:07:00', '2025-10-17 11:07:00'),
(12, 12, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-17 11:07:01', '2025-10-17 11:07:01'),
(13, 13, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-17 11:07:02', '2025-10-17 11:07:02'),
(14, 14, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-17 11:07:03', '2025-10-17 11:07:03'),
(15, 15, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"off\"}', '2025-10-17 11:07:04', '2025-10-17 11:07:04'),
(16, 16, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-17 11:07:05', '2025-10-17 11:07:05'),
(17, 17, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-17 11:07:06', '2025-10-17 11:07:06'),
(18, 18, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-17 11:07:07', '2025-10-17 11:07:07'),
(19, 19, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-17 11:07:08', '2025-10-17 11:07:08'),
(20, 20, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-17 11:07:09', '2025-10-17 11:07:09');

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
(1, 1, 'pquintanilla', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'pat.quintanilla@duocuc.cl', 1, '2025-10-10 18:07:28', '2025-10-16 20:23:45', 1, NULL, 0),
(2, 2, 'erobledo', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'elisabet@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:17', 0, NULL, 0),
(3, 3, 'dtrillo', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'dalila@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(4, 4, 'isedano', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'isidora@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(5, 5, 'smolins', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sigfrido@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(6, 6, 'jconserje', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jose@conserje.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:19', 0, NULL, 0),
(7, 7, 'jpiñol', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jordi@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:19', 0, NULL, 0),
(8, 8, 'fadmin', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'flora@admin.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:23', 0, NULL, 0),
(9, 9, 'lalonsop', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'lina@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:24', 0, NULL, 0),
(10, 10, 'abarros', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'alejandro@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:42', 0, NULL, 0),
(11, 11, 'lauras', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'laura.sanchez@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(12, 12, 'carlosg', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'carlos.gomez@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(13, 13, 'mariaf', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'maria.fernandez@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(14, 14, 'javierd', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'javier.diaz@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(15, 15, 'anal', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ana.lopez@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(16, 16, 'robertom', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'roberto.martinez@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(17, 17, 'elenar', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'elena.ruiz@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(18, 18, 'pedroh', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'pedro.hernandez@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(19, 19, 'sofiav', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sofia.vargas@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(20, 20, 'diegor', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'diego.rojas@email.cl', 1, '2025-10-15 21:10:16', '2025-10-15 21:10:16', 0, NULL, 0),
(21, 21, 'gabrielt', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'gabriel.tapia@email.cl', 1, '2025-10-16 18:11:00', '2025-10-16 18:11:00', 0, NULL, 0),
(22, 22, 'danielaf', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'daniela.flores@email.cl', 1, '2025-10-16 18:11:01', '2025-10-16 18:11:01', 0, NULL, 0),
(23, 23, 'andresm', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'andres.munoz@email.cl', 1, '2025-10-16 18:11:02', '2025-10-16 18:11:02', 0, NULL, 0),
(24, 24, 'camilare', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'camila.reyes@email.cl', 1, '2025-10-16 18:11:03', '2025-10-16 18:11:03', 0, NULL, 0),
(25, 25, 'felipem', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'felipe.morales@email.cl', 1, '2025-10-16 18:11:04', '2025-10-16 18:11:04', 0, NULL, 0),
(26, 26, 'valerian', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'valeria.nunez@email.cl', 1, '2025-10-16 18:11:05', '2025-10-16 18:11:05', 0, NULL, 0),
(27, 27, 'ricardos', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ricardo.soto@email.cl', 1, '2025-10-16 18:11:06', '2025-10-16 18:11:06', 0, NULL, 0),
(28, 28, 'javierap', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'javiera.perez@email.cl', 1, '2025-10-16 18:11:07', '2025-10-16 18:11:07', 0, NULL, 0),
(29, 29, 'ignacioh', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ignacio.herrera@email.cl', 1, '2025-10-16 18:11:08', '2025-10-16 18:11:08', 0, NULL, 0),
(30, 30, 'constanzad', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'constanza.diaz@email.cl', 1, '2025-10-16 18:11:09', '2025-10-16 18:11:09', 0, NULL, 0),
(31, 31, 'manuels', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'manuel.silva@duocuc.cl', 1, '2025-10-17 10:01:00', '2025-10-17 10:01:00', 0, NULL, 0),
(32, 32, 'fernandac', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'fernanda.castro@email.cl', 1, '2025-10-17 10:01:01', '2025-10-17 10:01:01', 0, NULL, 0),
(33, 33, 'gustavop', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'gustavo.pizarro@email.cl', 1, '2025-10-17 10:01:02', '2025-10-17 10:01:02', 0, NULL, 0),
(34, 34, 'lorenav', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'lorena.vera@email.cl', 1, '2025-10-17 10:01:03', '2025-10-17 10:01:03', 0, NULL, 0),
(35, 35, 'sebastianf', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sebastian.fuentes@email.cl', 1, '2025-10-17 10:01:04', '2025-10-17 10:01:04', 0, NULL, 0),
(36, 36, 'claudiat', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'claudia.torres@email.cl', 1, '2025-10-17 10:01:05', '2025-10-17 10:01:05', 0, NULL, 0),
(37, 37, 'fabians', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'fabian.sepulveda@email.cl', 1, '2025-10-17 10:01:06', '2025-10-17 10:01:06', 0, NULL, 0),
(38, 38, 'jessicar', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jessica.ramos@email.cl', 1, '2025-10-17 10:01:07', '2025-10-17 10:01:07', 0, NULL, 0),
(39, 39, 'nicolasg', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'nicolas.garrido@email.cl', 1, '2025-10-17 10:01:08', '2025-10-17 10:01:08', 0, NULL, 0),
(40, 40, 'andreal', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'andrea.leon@email.cl', 1, '2025-10-17 10:01:09', '2025-10-17 10:01:09', 0, NULL, 0);

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
(1, 1, 1, 7, '2024-01-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(2, 2, 2, 8, '2024-02-15', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(3, 3, 3, 6, '2024-03-20', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(4, 4, 4, 7, '2024-04-10', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(5, 5, 5, 2, '2024-05-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(6, 6, 6, 3, '2024-06-25', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(7, 7, 7, 6, '2024-07-07', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(8, 8, 8, 10, '2024-08-18', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(9, 9, 9, 4, '2024-09-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(10, 10, 10, 9, '2024-10-05', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(11, 11, 1, 7, '2025-01-01', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(12, 12, 2, 8, '2025-02-15', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(13, 13, 3, 6, '2025-03-20', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(14, 14, 4, 7, '2025-04-10', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(15, 15, 5, 2, '2025-05-01', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(16, 16, 6, 3, '2025-06-25', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(17, 17, 7, 6, '2025-07-07', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(18, 18, 8, 10, '2025-08-18', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(19, 19, 9, 4, '2025-09-01', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(20, 20, 10, 9, '2025-10-05', NULL, 1, '2025-10-15 21:10:17', '2025-10-15 21:10:17'),
(21, 21, 1, 7, '2025-10-16', NULL, 1, '2025-10-16 18:12:00', '2025-10-16 18:12:00'),
(22, 22, 2, 8, '2025-10-16', NULL, 1, '2025-10-16 18:12:01', '2025-10-16 18:12:01'),
(23, 23, 3, 6, '2025-10-16', NULL, 1, '2025-10-16 18:12:02', '2025-10-16 18:12:02'),
(24, 24, 4, 7, '2025-10-16', NULL, 1, '2025-10-16 18:12:03', '2025-10-16 18:12:03'),
(25, 25, 5, 2, '2025-10-16', NULL, 1, '2025-10-16 18:12:04', '2025-10-16 18:12:04'),
(26, 26, 6, 3, '2025-10-16', NULL, 1, '2025-10-16 18:12:05', '2025-10-16 18:12:05'),
(27, 27, 7, 6, '2025-10-16', NULL, 1, '2025-10-16 18:12:06', '2025-10-16 18:12:06'),
(28, 28, 8, 10, '2025-10-16', NULL, 1, '2025-10-16 18:12:07', '2025-10-16 18:12:07'),
(29, 29, 9, 4, '2025-10-16', NULL, 1, '2025-10-16 18:12:08', '2025-10-16 18:12:08'),
(30, 30, 10, 9, '2025-10-16', NULL, 1, '2025-10-16 18:12:09', '2025-10-16 18:12:09'),
(31, 31, 1, 6, '2025-10-17', NULL, 1, '2025-10-17 10:02:00', '2025-10-17 10:02:00'),
(32, 32, 2, 7, '2025-10-17', NULL, 1, '2025-10-17 10:02:01', '2025-10-17 10:02:01'),
(33, 33, 3, 8, '2025-10-17', NULL, 1, '2025-10-17 10:02:02', '2025-10-17 10:02:02'),
(34, 34, 4, 9, '2025-10-17', NULL, 1, '2025-10-17 10:02:03', '2025-10-17 10:02:03'),
(35, 35, 5, 10, '2025-10-17', NULL, 1, '2025-10-17 10:02:04', '2025-10-17 10:02:04'),
(36, 36, 6, 2, '2025-10-17', NULL, 1, '2025-10-17 10:02:05', '2025-10-17 10:02:05'),
(37, 37, 7, 3, '2025-10-17', NULL, 1, '2025-10-17 10:02:06', '2025-10-17 10:02:06'),
(38, 38, 8, 4, '2025-10-17', NULL, 1, '2025-10-17 10:02:07', '2025-10-17 10:02:07'),
(39, 39, 9, 7, '2025-10-17', NULL, 1, '2025-10-17 10:02:08', '2025-10-17 10:02:08'),
(40, 40, 10, 6, '2025-10-17', NULL, 1, '2025-10-17 10:02:09', '2025-10-17 10:02:09');

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
('2025-10-01', 65344.17),
('2025-10-02', 68148.97),
('2025-10-03', 68736.87),
('2025-10-04', 69106.69),
('2025-10-05', 67311.87),
('2025-10-06', 66974.94),
('2025-10-07', 65985.37),
('2025-10-08', 66620.53),
('2025-10-09', 67012.59),
('2025-10-10', 60880.97),
('2025-10-11', 61200.55),
('2025-10-12', 61505.77),
('2025-10-13', 61810.99),
('2025-10-14', 62116.21),
('2025-10-15', 62421.43),
('2025-10-16', 62726.65),
('2025-10-17', 63031.87),
('2025-10-18', 63337.09),
('2025-10-19', 63642.31),
('2025-10-20', 63947.53);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_apelaciones_dashboard`
-- (See below for the actual view)
--
CREATE TABLE `vista_apelaciones_dashboard` (
`tipo` varchar(24)
,`valor` decimal(21,1)
);

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
(1, 2, 'transferencia', '{\"tx_id\": \"tr1\", \"monto\": 62000}', '2025-10-10 18:10:28', 1, 1),
(2, 4, 'webpay', '{\"tx_id\": \"wp2\", \"monto\": 31000}', '2025-10-10 18:10:28', 1, 2),
(3, 7, 'otro', '{\"detalle\": \"efectivo 55000\"}', '2025-10-10 18:10:28', 1, 3),
(4, 8, 'transferencia', '{\"tx_id\": \"tr4\", \"monto\": 48000}', '2025-10-10 18:10:28', 1, 4),
(5, 10, 'webpay', '{\"tx_id\": \"wp5\", \"monto\": 68000}', '2025-10-10 18:10:28', 1, 5),
(6, 1, 'transferencia', '{\"tx_id\": \"tr6\", \"monto\": 45000}', '2025-10-10 18:10:28', 0, NULL),
(7, 3, 'transferencia', '{\"tx_id\": \"tr7\", \"monto\": 88000}', '2025-10-10 18:10:28', 0, NULL),
(8, 5, 'webpay', '{\"tx_id\": \"wp8\", \"monto\": 73000}', '2025-10-10 18:10:28', 0, NULL),
(9, 9, 'otro', '{\"detalle\": \"efectivo 49000\"}', '2025-10-10 18:10:28', 0, NULL),
(10, 6, 'transferencia', '{\"tx_id\": \"tr10\", \"monto\": 95000}', '2025-10-10 18:10:28', 0, NULL),
(11, 2, 'transferencia', '{\"tx_id\": \"tr11\", \"monto\": 65000}', '2025-10-15 21:10:58', 1, 11),
(12, 4, 'webpay', '{\"tx_id\": \"wp12\", \"monto\": 25000}', '2025-10-15 21:10:58', 1, 12),
(13, 7, 'otro', '{\"detalle\": \"efectivo 60000\"}', '2025-10-15 21:10:58', 1, 13),
(14, 8, 'transferencia', '{\"tx_id\": \"tr14\", \"monto\": 40000}', '2025-10-15 21:10:58', 1, 14),
(15, 10, 'webpay', '{\"tx_id\": \"wp15\", \"monto\": 70000}', '2025-10-15 21:10:58', 1, 15),
(16, 1, 'transferencia', '{\"tx_id\": \"tr16\", \"monto\": 50000}', '2025-10-15 21:10:58', 0, NULL),
(17, 3, 'transferencia', '{\"tx_id\": \"tr17\", \"monto\": 90000}', '2025-10-15 21:10:58', 0, NULL),
(18, 5, 'webpay', '{\"tx_id\": \"wp18\", \"monto\": 75000}', '2025-10-15 21:10:58', 0, NULL),
(19, 9, 'otro', '{\"detalle\": \"efectivo 50000\"}', '2025-10-15 21:10:58', 0, NULL),
(20, 6, 'transferencia', '{\"tx_id\": \"tr20\", \"monto\": 100000}', '2025-10-15 21:10:58', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `amenidad`
--
ALTER TABLE `amenidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_amenidad_comunidad` (`comunidad_id`),
  ADD KEY `idx_comunidad_id` (`comunidad_id`),
  ADD KEY `idx_amenidad_comunidad_id` (`comunidad_id`),
  ADD KEY `idx_amenidad_requiere_aprobacion` (`requiere_aprobacion`),
  ADD KEY `idx_amenidad_capacidad` (`capacidad`),
  ADD KEY `idx_amenidad_tarifa` (`tarifa`),
  ADD KEY `idx_amenidad_created_at` (`created_at` DESC),
  ADD KEY `idx_amenidad_nombre` (`nombre`),
  ADD KEY `idx_amenidad_comunidad_nombre` (`comunidad_id`,`nombre`),
  ADD KEY `idx_amenidad_filtros` (`comunidad_id`,`requiere_aprobacion`,`capacidad`,`tarifa`),
  ADD KEY `idx_amenidad_validaciones` (`comunidad_id`,`nombre`,`capacidad`,`tarifa`);

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
-- Indexes for table `documento_multa`
--
ALTER TABLE `documento_multa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_documento_multa` (`multa_id`),
  ADD KEY `fk_documento_multa_usuario` (`subido_por`);

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
  ADD UNIQUE KEY `uq_gasto_numero_comunidad` (`comunidad_id`,`numero`),
  ADD KEY `fk_gasto_comunidad` (`comunidad_id`),
  ADD KEY `fk_gasto_ccosto` (`centro_costo_id`),
  ADD KEY `fk_gasto_doc` (`documento_compra_id`),
  ADD KEY `ix_gasto_categoria` (`categoria_id`),
  ADD KEY `fk_gasto_anulado_por` (`anulado_por`),
  ADD KEY `fk_gasto_aprobado_por` (`aprobado_por`),
  ADD KEY `fk_gasto_creado_por` (`creado_por`);

--
-- Indexes for table `gasto_aprobacion`
--
ALTER TABLE `gasto_aprobacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_aprobacion_gasto` (`gasto_id`),
  ADD KEY `fk_aprobacion_usuario` (`usuario_id`),
  ADD KEY `fk_aprobacion_rol` (`rol_id`);

--
-- Indexes for table `historial_gasto`
--
ALTER TABLE `historial_gasto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_historial_gasto` (`gasto_id`),
  ADD KEY `fk_historial_usuario` (`usuario_id`);

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
  ADD KEY `ix_multa_estado` (`estado`),
  ADD KEY `fk_multa_creada_por` (`creada_por`),
  ADD KEY `fk_multa_aprobada_por` (`aprobada_por`);

--
-- Indexes for table `multa_apelacion`
--
ALTER TABLE `multa_apelacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_apelacion_multa` (`multa_id`),
  ADD KEY `fk_apelacion_usuario` (`usuario_id`),
  ADD KEY `fk_apelacion_persona` (`persona_id`),
  ADD KEY `fk_apelacion_comunidad` (`comunidad_id`),
  ADD KEY `idx_multa_apelacion_multa_id` (`multa_id`),
  ADD KEY `idx_multa_apelacion_usuario_id` (`usuario_id`),
  ADD KEY `idx_multa_apelacion_estado` (`estado`),
  ADD KEY `idx_multa_apelacion_created_at` (`created_at` DESC),
  ADD KEY `idx_multa_apelacion_fecha_resolucion` (`fecha_resolucion`),
  ADD KEY `idx_multa_apelacion_estado_fecha` (`estado`,`created_at` DESC),
  ADD KEY `idx_multa_apelacion_usuario_estado` (`usuario_id`,`estado`),
  ADD KEY `idx_multa_apelacion_multa_estado` (`multa_id`,`estado`),
  ADD KEY `idx_multa_apelacion_comunidad_id` (`comunidad_id`),
  ADD KEY `idx_multa_apelacion_resolucion` (`created_at`,`fecha_resolucion`);

--
-- Indexes for table `multa_historial`
--
ALTER TABLE `multa_historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_historial_multa` (`multa_id`),
  ADD KEY `fk_historial_multa_usuario` (`usuario_id`);

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

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `emision_gasto_detalle`  AS SELECT `detalle_emision_gastos`.`id` AS `id`, `detalle_emision_gastos`.`emision_id` AS `emision_id`, `detalle_emision_gastos`.`gasto_id` AS `gasto_id`, `detalle_emision_gastos`.`categoria_id` AS `categoria_id`, `detalle_emision_gastos`.`monto` AS `monto`, `detalle_emision_gastos`.`regla_prorrateo` AS `regla_prorrateo`, `detalle_emision_gastos`.`metadata_json` AS `metadata_json`, `detalle_emision_gastos`.`created_at` AS `created_at`, `detalle_emision_gastos`.`updated_at` AS `updated_at` FROM `detalle_emision_gastos` ;

-- --------------------------------------------------------

--
-- Structure for view `ticket`
--
DROP TABLE IF EXISTS `ticket`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `ticket`  AS SELECT `ticket_soporte`.`id` AS `id`, `ticket_soporte`.`comunidad_id` AS `comunidad_id`, `ticket_soporte`.`unidad_id` AS `unidad_id`, `ticket_soporte`.`categoria` AS `categoria`, `ticket_soporte`.`titulo` AS `titulo`, `ticket_soporte`.`descripcion` AS `descripcion`, `ticket_soporte`.`estado` AS `estado`, `ticket_soporte`.`prioridad` AS `prioridad`, `ticket_soporte`.`asignado_a` AS `asignado_a`, `ticket_soporte`.`attachments_json` AS `attachments_json`, `ticket_soporte`.`created_at` AS `created_at`, `ticket_soporte`.`updated_at` AS `updated_at` FROM `ticket_soporte` ;

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

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `usuario_miembro_comunidad`  AS SELECT `urc`.`id` AS `id`, `urc`.`comunidad_id` AS `comunidad_id`, `u`.`persona_id` AS `persona_id`, `r`.`codigo` AS `rol`, `urc`.`desde` AS `desde`, `urc`.`hasta` AS `hasta`, `urc`.`activo` AS `activo`, `urc`.`created_at` AS `created_at`, `urc`.`updated_at` AS `updated_at` FROM ((`usuario_rol_comunidad` `urc` join `usuario` `u` on((`u`.`id` = `urc`.`usuario_id`))) join `rol_sistema` `r` on((`r`.`id` = `urc`.`rol_id`))) ;

-- --------------------------------------------------------

--
-- Structure for view `vista_apelaciones_dashboard`
--
DROP TABLE IF EXISTS `vista_apelaciones_dashboard`;

CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `vista_apelaciones_dashboard`  AS SELECT 'total' AS `tipo`, count(0) AS `valor` FROM `multa_apelacion`union all select 'pendientes' AS `tipo`,count(0) AS `valor` from `multa_apelacion` where (`multa_apelacion`.`estado` = 'pendiente') union all select 'aprobadas' AS `tipo`,count(0) AS `valor` from `multa_apelacion` where (`multa_apelacion`.`estado` = 'aceptada') union all select 'rechazadas' AS `tipo`,count(0) AS `valor` from `multa_apelacion` where (`multa_apelacion`.`estado` = 'rechazada') union all select 'dias_promedio_resolucion' AS `tipo`,round(avg((case when (`multa_apelacion`.`fecha_resolucion` is not null) then (to_days(`multa_apelacion`.`fecha_resolucion`) - to_days(`multa_apelacion`.`created_at`)) end)),1) AS `valor` from `multa_apelacion`  ;

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
  ADD CONSTRAINT `fk_categoria_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

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
  ADD CONSTRAINT `fk_doc_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor` (`id`);

--
-- Constraints for table `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  ADD CONSTRAINT `fk_docrepo_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);

--
-- Constraints for table `documento_multa`
--
ALTER TABLE `documento_multa`
  ADD CONSTRAINT `fk_documento_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documento_multa_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_gasto_anulado_por` FOREIGN KEY (`anulado_por`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_aprobado_por` FOREIGN KEY (`aprobado_por`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_gasto` (`id`),
  ADD CONSTRAINT `fk_gasto_ccosto` FOREIGN KEY (`centro_costo_id`) REFERENCES `centro_costo` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_gasto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_gasto_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_doc` FOREIGN KEY (`documento_compra_id`) REFERENCES `documento_compra` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `gasto_aprobacion`
--
ALTER TABLE `gasto_aprobacion`
  ADD CONSTRAINT `fk_aprobacion_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprobacion_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol_sistema` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprobacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `historial_gasto`
--
ALTER TABLE `historial_gasto`
  ADD CONSTRAINT `fk_historial_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_multa_aprobada_por` FOREIGN KEY (`aprobada_por`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_multa_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_multa_creada_por` FOREIGN KEY (`creada_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_multa_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_multa_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidad` (`id`);

--
-- Constraints for table `multa_apelacion`
--
ALTER TABLE `multa_apelacion`
  ADD CONSTRAINT `fk_apelacion_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apelacion_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apelacion_persona` FOREIGN KEY (`persona_id`) REFERENCES `persona` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_apelacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `multa_historial`
--
ALTER TABLE `multa_historial`
  ADD CONSTRAINT `fk_historial_multa_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_multa_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
