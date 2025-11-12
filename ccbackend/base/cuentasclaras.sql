-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 12-11-2025 a las 21:54:53
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
(10, 10, 'Sala de Juegos', 'Niños deben estar acompañados.', 15, 0, 0.00, '2025-10-10 18:07:46', '2025-10-10 18:07:46'),
(11, 1, 'Piscina Interior Climatizada', 'Solo uso con salvavidas. Máximo 15 personas.', 15, 1, 5000.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 'Cancha de Pádel', 'Reservar con app. Prohibido calzado de fútbol.', 4, 0, 8000.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 'Salón de Juegos Infantil', 'Niños deben estar bajo supervisión adulta.', 30, 0, 0.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 'Quincho Cerrado 2', 'Uso máximo 6 horas. Se permite música moderada.', 20, 1, 20000.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 'Sala de Lectura', 'Silencio absoluto. No se permite comida.', 8, 0, 0.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 'Gimnasio Exterior', 'Horario de 8:00 a 20:00 hrs.', 10, 0, 0.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 'Sala de Eventos Pequeña', 'Capacidad máxima 20 personas.', 20, 1, 15000.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 'Sala de Música', 'Solo con audífonos. Reserva previa de 1 hora.', 4, 0, 0.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 'Estacionamiento de Visitas', 'Máximo 3 horas.', 10, 0, 0.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 'Lavado de Autos', 'Solo con balde, prohibido manguera.', 2, 0, 0.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 'Salón de Eventos Pequeño', 'Máximo 30 personas.', 30, 1, 25000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 'Sala de Reuniones', 'Uso solo para temas comunitarios.', 10, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 'Área de Juegos Exteriores', 'Solo menores acompañados de un adulto.', 40, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 'Cancha de Tenis', 'Reservar por hora.', 4, 0, 5000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 'Biblioteca Comunitaria', 'No se permite hacer ruido.', 12, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 'Sauna', 'Solo mayores de 18 años.', 6, 1, 8000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 'Mirador', 'Abierto hasta las 22:00 hrs.', 50, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 'Piscina Exterior Niños', 'Solo hasta 1.20m de profundidad.', 15, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 'Quincho Sur', 'Uso máximo 5 horas.', 18, 1, 18000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 'Sala de Pole Dance', 'Solo con zapatos limpios.', 5, 0, 3000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 'Cancha de Baby Fútbol', 'Prohibido tacos de fútbol.', 15, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 'Gimnasio Exterior', 'Solo mayores de 15 años.', 10, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 'Bodega de Bicicletas', 'Máximo 2 bicicletas por unidad.', 50, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 'Plaza Interior', 'No se permite el uso después de las 22:00 hrs.', 60, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 'Zona de Parrillas Eléctricas', 'Uso máximo 3 horas.', 10, 0, 5000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 'Piscina Interior', 'Uso solo con gorro de natación.', 20, 1, 7000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 'Sala de Tareas', 'Espacio para estudio silencioso.', 8, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 'Sala de Estar Conserjería', 'Solo para uso interno.', 5, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 'Taller de Manualidades', 'Dejar limpio al terminar.', 6, 0, 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 'Sala de Cine Privada', 'Reserva con 72 hrs. Capacidad 8 personas.', 8, 1, 12000.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
  `comunidad_id` bigint DEFAULT NULL,
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
(10, 'Multa_Ruido_C2.pdf', 'multa_ruido_c2.pdf', '/multas/c2/multa_ruido_c2.pdf', 150000, 'application/pdf', 2, 'multa', 2, 'general', NULL, '2025-10-10 18:10:26', 3, 1),
(11, 'Contrato_Jardineria_C3.pdf', 'cont_jard_c3.pdf', '/docs/c3/cont_jard_c3.pdf', 900000, 'application/pdf', 3, 'documento_compra', 3, 'legal', 'Contrato de mantención de jardines', '2025-10-10 18:10:27', 4, 1),
(12, 'Foto_Ascensor_D402.jpg', 'foto_asc_d402.jpg', '/tickets/c3/foto_asc_d402.jpg', 1500000, 'image/jpeg', 3, 'ticket_soporte', 3, 'evidencia', 'Foto del ascensor detenido', '2025-10-10 18:10:27', 4, 1),
(13, 'Comprobante_Pago_7.png', 'comp_pago_7.png', '/pagos/c3/comp_pago_7.png', 400000, 'image/png', 3, 'pago', 7, 'recibo', 'Comprobante de pago a cuenta 3', '2025-10-10 18:10:27', 3, 1),
(14, 'Acta_Ordinaria_C5.pdf', 'acta_ord_c5.pdf', '/docs/c5/acta_ord_c5.pdf', 1100000, 'application/pdf', 5, 'documento_comunidad', 5, 'acta', 'Acta de asamblea ordinaria', '2025-10-10 18:10:27', 5, 1),
(15, 'Reporte_Electricidad_C4.csv', 'rep_elec_c4.csv', '/lecturas/c4/rep_elec_c4.csv', 15000, 'text/csv', 4, 'lectura_medidor', 5, 'datos', 'Lectura de medidor de electricidad', '2025-10-10 18:10:27', 5, 1),
(16, 'Factura_Electricidad_C9.pdf', 'fact_elec_c9.pdf', '/docs/c9/fact_elec_c9.pdf', 750000, 'application/pdf', 9, 'documento_compra', 9, 'factura', 'Factura de consumo eléctrico', '2025-10-10 18:10:27', 9, 1),
(17, 'Foto_Lampara_C7.jpg', 'foto_lampara_c7.jpg', '/tickets/c7/foto_lampara_c7.jpg', 800000, 'image/jpeg', 7, 'ticket_soporte', 7, 'evidencia', 'Foco quemado en pasillo', '2025-10-10 18:10:27', 8, 1),
(18, 'Comp_Transf_C6.pdf', 'comp_transf_c6.pdf', '/pagos/c6/comp_transf_c6.pdf', 350000, 'application/pdf', 6, 'pago', 10, 'recibo', 'Comprobante de transferencia', '2025-10-10 18:10:27', 7, 1),
(19, 'Reglamento_Uso_Gimnasio.pdf', 'regl_gym_c3.pdf', '/docs/c3/regl_gym_c3.pdf', 550000, 'application/pdf', 3, 'documento_comunidad', 3, 'reglamento', 'Reglamento de uso de gimnasio', '2025-10-10 18:10:27', 3, 1),
(20, 'Multa_Basura_C2.pdf', 'multa_basura_c2.pdf', '/multas/c2/multa_basura_c2.pdf', 180000, 'application/pdf', 2, 'multa', 2, 'resolucion', 'Resolución de multa por basura', '2025-10-10 18:10:27', 3, 1),
(21, 'Presupuesto_Piscina_C11.pdf', 'presup_piscina_c11.pdf', '/docs/c11/presup_piscina_c11.pdf', 600000, 'application/pdf', 11, 'documento_compra', 11, 'presupuesto', NULL, '2025-10-23 16:35:00', 11, 1),
(22, 'Foto_Porton_C14.jpg', 'foto_porton_c14.jpg', '/tickets/c14/foto_porton.jpg', 1100000, 'image/jpeg', 14, 'ticket_soporte', 14, 'evidencia', NULL, '2025-10-23 16:35:00', 15, 1),
(23, 'Comprobante_Pago_18.png', 'comp_pago_18.png', '/pagos/c8/comp_pago_18.png', 320000, 'image/png', 8, 'pago', 18, 'recibo', NULL, '2025-10-23 16:35:00', 19, 1),
(24, 'Acta_Comite_C16.pdf', 'acta_com_c16.pdf', '/docs/c16/acta_com_c16.pdf', 780000, 'application/pdf', 16, 'documento_comunidad', 16, 'acta', NULL, '2025-10-23 16:35:00', 17, 1),
(25, 'Lectura_D201_10.csv', 'lectura_d201_10.csv', '/lecturas/c10/lectura_d201_10.csv', 11000, 'text/csv', 10, 'lectura_medidor', 20, 'datos', NULL, '2025-10-23 16:35:00', 20, 1),
(26, 'Factura_Electricidad_C12.pdf', 'fact_elec_c12.pdf', '/docs/c12/fact_elec_c12.pdf', 650000, 'application/pdf', 12, 'documento_compra', 12, 'factura', NULL, '2025-10-23 16:35:00', 13, 1),
(27, 'Foto_Gotera_C17.jpg', 'foto_gotera_c17.jpg', '/tickets/c17/foto_gotera.jpg', 950000, 'image/jpeg', 17, 'ticket_soporte', 17, 'evidencia', NULL, '2025-10-23 16:35:00', 18, 1),
(28, 'Comp_Transf_C17.pdf', 'comp_transf_c17.pdf', '/pagos/c17/comp_transf_c17.pdf', 280000, 'application/pdf', 7, 'pago', 17, 'recibo', NULL, '2025-10-23 16:35:00', 8, 1),
(29, 'Reglamento_Cancha.pdf', 'regl_cancha_c4.pdf', '/docs/c4/regl_cancha_c4.pdf', 720000, 'application/pdf', 4, 'documento_comunidad', 4, 'reglamento', NULL, '2025-10-23 16:35:00', 5, 1),
(30, 'Multa_Mascota_C1.pdf', 'multa_mascota_c1.pdf', '/multas/c1/multa_mascota_c1.pdf', 160000, 'application/pdf', 1, 'multa', 11, 'resolucion', NULL, '2025-10-23 16:35:00', 1, 1),
(31, 'Reporte_Mantencion_C15.pdf', 'rep_mant_c15.pdf', '/docs/c15/rep_mant_c15.pdf', 550000, 'application/pdf', 15, 'documento_compra', 15, 'reporte', NULL, '2025-10-23 16:35:00', 16, 1),
(32, 'Foto_Olor_C9.jpg', 'foto_olor_c9.jpg', '/tickets/c9/foto_olor.jpg', 1000000, 'image/jpeg', 9, 'ticket_soporte', 19, 'evidencia', NULL, '2025-10-23 16:35:00', 10, 1),
(33, 'Comprobante_Pago_19.png', 'comp_pago_19.png', '/pagos/c9/comp_pago_19.png', 290000, 'image/png', 9, 'pago', 19, 'recibo', NULL, '2025-10-23 16:35:00', 9, 1),
(34, 'Acta_Ordinaria_C1.pdf', 'acta_ord_c1.pdf', '/docs/c1/acta_ord_c1.pdf', 850000, 'application/pdf', 1, 'documento_comunidad', 1, 'acta', NULL, '2025-10-23 16:35:00', 2, 1),
(35, 'Lectura_ELEC_202_10.csv', 'lectura_elec_202_10.csv', '/lecturas/c10/lectura_elec_202_10.csv', 12000, 'text/csv', 10, 'lectura_medidor', 20, 'datos', NULL, '2025-10-23 16:35:00', 1, 1),
(36, 'Factura_Internet_C7.pdf', 'fact_internet_c7.pdf', '/docs/c7/fact_internet_c7.pdf', 580000, 'application/pdf', 7, 'documento_compra', 17, 'factura', NULL, '2025-10-23 16:35:00', 7, 1),
(37, 'Foto_Enchufe_C2.jpg', 'foto_enchufe_c2.jpg', '/tickets/c2/foto_enchufe.jpg', 880000, 'image/jpeg', 2, 'ticket_soporte', 12, 'evidencia', NULL, '2025-10-23 16:35:00', 3, 1),
(38, 'Comp_Efectivo_C6.pdf', 'comp_efectivo_c6.pdf', '/pagos/c6/comp_efectivo_c6.pdf', 310000, 'application/pdf', 6, 'pago', 16, 'recibo', NULL, '2025-10-23 16:35:00', 6, 1),
(39, 'Reglamento_Mascotas_C18.pdf', 'regl_mascotas_c18.pdf', '/docs/c18/regl_mascotas_c18.pdf', 690000, 'application/pdf', 18, 'documento_comunidad', 18, 'reglamento', NULL, '2025-10-23 16:35:00', 8, 1),
(40, 'Multa_Ruido_C3.pdf', 'multa_ruido_c3.pdf', '/multas/c3/multa_ruido_c3.pdf', 170000, 'application/pdf', 3, 'multa', 13, 'resolucion', NULL, '2025-10-23 16:35:00', 4, 1);

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
(10, 10, 'INSERT', 'lectura_medidor', 10, NULL, '{\"lectura\": 44.9}', '192.168.1.10', '2025-10-10 18:10:29'),
(11, 7, 'INSERT', 'pago_aplicacion', 11, NULL, '{\"monto\": 12000.0, \"cargo_id\": 11}', '192.168.1.11', '2025-10-11 10:00:00'),
(12, 1, 'UPDATE', 'reserva_amenidad', 2, '{\"estado\": \"solicitada\"}', '{\"estado\": \"aprobada\"}', '192.168.1.12', '2025-10-11 10:01:00'),
(13, 3, 'INSERT', 'documento_comunidad', 11, NULL, '{\"titulo\": \"Acta Comité 2025-10\"}', '192.168.1.13', '2025-10-11 10:02:00'),
(14, 4, 'DELETE', 'detalle_cuenta_unidad', 1, '{\"monto\": 45000.0}', NULL, '192.168.1.14', '2025-10-11 10:03:00'),
(15, 5, 'UPDATE', 'gasto', 1, '{\"estado\": \"pendiente\"}', '{\"estado\": \"aprobado\"}', '192.168.1.15', '2025-10-11 10:04:00'),
(16, 6, 'INSERT', 'ticket_soporte', 11, NULL, '{\"titulo\": \"Filtración en Bodega\"}', '192.168.1.16', '2025-10-11 10:05:00'),
(17, 7, 'UPDATE', 'usuario', 7, '{\"activo\": 1}', '{\"activo\": 0}', '192.168.1.17', '2025-10-11 10:06:00'),
(18, 8, 'INSERT', 'proveedor', 11, NULL, '{\"razon_social\": \"Limpieza Rápida\"}', '192.168.1.18', '2025-10-11 10:07:00'),
(19, 9, 'UPDATE', 'unidad', 10, '{\"m2_utiles\": \"70.30\"}', '{\"m2_utiles\": \"72.00\"}', '192.168.1.19', '2025-10-11 10:08:00'),
(20, 10, 'INSERT', 'lectura_medidor', 11, NULL, '{\"lectura\": 51.5}', '192.168.1.20', '2025-10-11 10:09:00'),
(21, 11, 'INSERT', 'reserva_amenidad', 21, NULL, '{\"unidad_id\": 11, \"amenidad_id\": 21}', '192.168.1.21', '2025-10-11 10:10:00'),
(22, 12, 'UPDATE', 'multa', 12, '{\"estado\": \"pendiente\"}', '{\"estado\": \"pagado\"}', '192.168.1.22', '2025-10-11 10:11:00'),
(23, 13, 'INSERT', 'pago', 21, NULL, '{\"monto\": 30000}', '192.168.1.23', '2025-10-11 10:12:00'),
(24, 14, 'UPDATE', 'ticket_soporte', 14, '{\"estado\": \"abierto\"}', '{\"estado\": \"en_progreso\"}', '192.168.1.24', '2025-10-11 10:13:00'),
(25, 15, 'INSERT', 'documento_compra', 21, NULL, '{\"folio\": \"F-11021\"}', '192.168.1.25', '2025-10-11 10:14:00'),
(26, 16, 'UPDATE', 'emision_gastos_comunes', 15, '{\"estado\": \"borrador\"}', '{\"estado\": \"emitido\"}', '192.168.1.26', '2025-10-11 10:15:00'),
(27, 17, 'INSERT', 'registro_conserjeria', 21, NULL, '{\"evento\": \"reporte\", \"detalle\": \"Sin luz en pasillo 5\"}', '192.168.1.27', '2025-10-11 10:16:00'),
(28, 18, 'UPDATE', 'unidad', 13, '{\"m2_utiles\": \"70.00\"}', '{\"m2_utiles\": \"71.50\"}', '192.168.1.28', '2025-10-11 10:17:00'),
(29, 19, 'INSERT', 'gasto', 21, NULL, '{\"monto\": 85000}', '192.168.1.29', '2025-10-11 10:18:00'),
(30, 20, 'UPDATE', 'cuenta_cobro_unidad', 18, '{\"saldo\": \"55000.00\"}', '{\"estado\": \"pagado\"}', '192.168.1.30', '2025-10-11 10:19:00'),
(31, 1, 'INSERT', 'lectura_medidor', 21, NULL, '{\"lectura\": 52.0}', '192.168.1.31', '2025-10-11 10:20:00'),
(32, 2, 'UPDATE', 'proveedor', 11, '{\"activo\": 1}', '{\"activo\": 0}', '192.168.1.32', '2025-10-11 10:21:00'),
(33, 3, 'INSERT', 'documento_comunidad', 21, NULL, '{\"titulo\": \"Circular D306\"}', '192.168.1.33', '2025-10-11 10:22:00'),
(34, 4, 'UPDATE', 'pago', 20, '{\"estado\": \"pendiente\"}', '{\"estado\": \"aplicado\"}', '192.168.1.34', '2025-10-11 10:23:00'),
(35, 5, 'INSERT', 'multa', 21, NULL, '{\"monto\": 10000}', '192.168.1.35', '2025-10-11 10:24:00'),
(36, 6, 'UPDATE', 'reserva_amenidad', 15, '{\"estado\": \"rechazada\"}', '{\"estado\": \"cancelada\"}', '192.168.1.36', '2025-10-11 10:25:00'),
(37, 7, 'INSERT', 'unidad', 21, NULL, '{\"codigo\": \"D103\"}', '192.168.1.37', '2025-10-11 10:26:00'),
(38, 8, 'UPDATE', 'gasto', 15, '{\"estado\": \"pendiente\"}', '{\"estado\": \"aprobado\"}', '192.168.1.38', '2025-10-11 10:27:00'),
(39, 9, 'INSERT', 'pago_aplicacion', 21, NULL, '{\"monto\": 30000, \"pago_id\": 21}', '192.168.1.39', '2025-10-11 10:28:00'),
(40, 10, 'UPDATE', 'ticket_soporte', 10, '{\"estado\": \"abierto\"}', '{\"estado\": \"cerrado\"}', '192.168.1.40', '2025-10-11 10:29:00'),
(41, NULL, 'INSERT', 'documento_compra', 45, NULL, '{\"id\": 45, \"iva\": 72.16, \"neto\": 379.81, \"folio\": \"COMP-1762843517980\", \"glosa\": \"warzone\", \"total\": 451.97, \"exento\": 0, \"tipo_doc\": \"boleta\", \"created_at\": \"2025-11-11T06:45:18.000Z\", \"updated_at\": \"2025-11-11T06:45:18.000Z\", \"comunidad_id\": 5, \"proveedor_id\": 2, \"fecha_emision\": \"2025-11-15T00:00:00.000Z\"}', '::ffff:172.18.0.1', '2025-11-11 06:45:18'),
(42, NULL, 'INSERT', 'documento_compra', 46, NULL, '{\"id\": 46, \"iva\": 720.4, \"neto\": 3791.6, \"folio\": \"COMP-1762844008787\", \"glosa\": \"getUserCommunities\", \"total\": 4512, \"exento\": 0, \"tipo_doc\": \"boleta\", \"created_at\": \"2025-11-11T06:53:29.000Z\", \"updated_at\": \"2025-11-11T06:53:29.000Z\", \"comunidad_id\": 5, \"proveedor_id\": 1, \"fecha_emision\": \"2025-11-13T00:00:00.000Z\"}', '::ffff:172.18.0.1', '2025-11-11 06:53:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora_auditoria`
--

DROP TABLE IF EXISTS `bitacora_auditoria`;
CREATE TABLE `bitacora_auditoria` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `tipo` enum('system','user','security','maintenance','admin','financial') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `prioridad` enum('low','normal','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'normal',
  `titulo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `usuario` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `tags` json DEFAULT NULL,
  `adjuntos` json DEFAULT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ubicacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sistema de auditoría y bitácora avanzada';

--
-- Volcado de datos para la tabla `bitacora_auditoria`
--

INSERT INTO `bitacora_auditoria` (`id`, `comunidad_id`, `tipo`, `prioridad`, `titulo`, `descripcion`, `usuario`, `usuario_id`, `fecha`, `tags`, `adjuntos`, `ip`, `ubicacion`, `created_at`, `updated_at`) VALUES
(1, 1, 'security', 'critical', 'Intento de acceso no autorizado', 'Se detectó un intento de acceso no autorizado al sistema desde una IP desconocida', 'Sistema de Seguridad', NULL, '2025-10-28 10:30:00', '[\"seguridad\", \"acceso\", \"alerta\"]', '[]', '192.168.1.100', 'Admin Panel', '2025-10-28 10:30:00', '2025-10-28 10:30:00'),
(2, 1, 'user', 'normal', 'Usuario modificó configuración', 'El usuario admin modificó la configuración de notificaciones del sistema', 'Administrador', 1, '2025-10-28 09:15:00', '[\"configuración\", \"usuario\"]', '[]', '192.168.1.50', 'Configuración', '2025-10-28 09:15:00', '2025-10-28 09:15:00'),
(3, 1, 'maintenance', 'high', 'Mantenimiento programado ejecutado', 'Se ejecutó el mantenimiento programado de base de datos y limpieza de logs', 'Sistema', NULL, '2025-10-28 08:00:00', '[\"mantenimiento\", \"base de datos\", \"logs\"]', '[{\"id\": \"log_001\", \"name\": \"maintenance_log.txt\", \"size\": 2048}]', NULL, 'Servidor Principal', '2025-10-28 08:00:00', '2025-10-28 08:00:00'),
(4, 1, 'financial', 'normal', 'Pago procesado correctamente', 'Se procesó el pago de gastos comunes para la unidad 301', 'Sistema de Pagos', NULL, '2025-10-28 07:45:00', '[\"pago\", \"gastos comunes\", \"procesado\"]', '[{\"id\": \"recibo_001\", \"name\": \"recibo_pago_301.pdf\", \"size\": 15360}]', NULL, 'Módulo Financiero', '2025-10-28 07:45:00', '2025-10-28 07:45:00'),
(5, 1, 'admin', 'low', 'Nuevo usuario registrado', 'Se registró un nuevo usuario en el sistema: María González', 'Administrador', 1, '2025-10-28 06:30:00', '[\"usuario\", \"registro\", \"nuevo\"]', '[]', '192.168.1.75', 'Panel de Usuarios', '2025-10-28 06:30:00', '2025-10-28 06:30:00'),
(6, 1, 'system', 'normal', 'Backup automático completado', 'Se completó exitosamente el backup automático diario del sistema', 'Sistema', NULL, '2025-10-28 05:00:00', '[\"backup\", \"automático\", \"completado\"]', '[{\"id\": \"backup_001\", \"name\": \"backup_2025-10-28.tar.gz\", \"size\": 1048576}]', NULL, 'Servidor de Respaldo', '2025-10-28 05:00:00', '2025-10-28 05:00:00'),
(7, 1, 'security', 'normal', 'asdfas', 'sadsa', 'Sistema', NULL, '2025-10-28 18:57:00', '[]', '[{\"id\": \"17616776991048t3ju6yzv\", \"name\": \"arquitectura.png\", \"size\": 199, \"type\": \"image/png\"}]', '::ffff:172.18.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-28 18:57:00', '2025-10-28 18:57:00');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `bitacora_conserjeria`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `bitacora_conserjeria`;
CREATE TABLE `bitacora_conserjeria` (
`id` bigint
,`comunidad_id` bigint
,`fecha_hora` datetime
,`usuario_id` bigint
,`evento` varchar(150)
,`detalle` varchar(1000)
,`created_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `cargo_financiero_unidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `cargo_financiero_unidad`;
CREATE TABLE `cargo_financiero_unidad` (
`id` bigint
,`emision_id` bigint
,`comunidad_id` bigint
,`unidad_id` bigint
,`monto_total` decimal(12,2)
,`saldo` decimal(12,2)
,`estado` enum('pendiente','pagado','vencido','parcial')
,`interes_acumulado` decimal(12,2)
,`created_at` datetime
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
(5, 5, 'Consumo Agua', 'extraordinario', 'CO-002', 1, '2025-10-10 18:07:48', '2025-11-11 05:27:42'),
(6, 6, 'Seguros e Impuestos', 'operacional', 'OP-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(7, 7, 'Reparaciones Mayores', 'extraordinario', 'EX-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(8, 8, 'Uso de Amenidades (Ingreso)', 'multas', 'MT-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(9, 9, 'Gasto de Administración', 'operacional', 'OP-003', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(10, 10, 'Consumo Electricidad Común', 'consumo', 'CO-002', 1, '2025-10-10 18:07:48', '2025-10-10 18:07:48'),
(11, 1, 'Mantención Ascensores', 'operacional', 'OP-004', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 'Reparación de Cámaras', 'extraordinario', 'EX-003', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 'Consumo Agua Común', 'consumo', 'CO-003', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 'Fondo de Reserva Maipú', 'fondo_reserva', 'FR-002', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 'Multas por Uso de Mascotas', 'multas', 'MT-003', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 'Gastos de Remodelación', 'extraordinario', 'EX-004', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 'Servicio de Internet Común', 'operacional', 'OP-005', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 'Consumo Gas Común', 'consumo', 'CO-004', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 'Fondo de Imprevistos', 'fondo_reserva', 'FR-003', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 'Gasto de Conserjería', 'operacional', 'OP-006', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 'Gastos de Administración Extra', 'extraordinario', 'EX-005', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 'Consumo de Gas Unidades', 'consumo', 'CO-005', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 'Seguro de Incendio', 'operacional', 'OP-007', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 'Multas de Constructora', 'multas', 'MT-004', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 'Fondo de Maquinaria', 'fondo_reserva', 'FR-004', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 'Mantención Piscina', 'operacional', 'OP-008', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 'Reparación de Bombas', 'extraordinario', 'EX-006', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 'Uso de Estacionamiento', 'multas', 'MT-005', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 'Consumo Electricidad Unidades', 'consumo', 'CO-006', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 'Gastos de Marketing', 'operacional', 'OP-009', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 'Compra de Equipo', 'extraordinario', 'EX-007', 1, '2025-10-23 16:35:00', '2025-11-11 04:41:49'),
(32, 2, 'Consumo Agua Unidades', 'consumo', 'CO-007', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 'Fondo de Emergencia', 'fondo_reserva', 'FR-005', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 'Gastos Legales', 'operacional', 'OP-010', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 'Multas por', 'extraordinario', 'MT-007', 1, '2025-10-23 16:35:00', '2025-11-11 04:50:28'),
(36, 6, 'Consumo Gas Central', 'consumo', 'CO-008', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 'Gasto de Recepción', 'operacional', 'OP-011', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 'Reparación de Techos', 'extraordinario', 'EX-008', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 'Multas por Ruido Nocturno', 'multas', 'MT-007', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 'Fondo de Mantenimiento', 'fondo_reserva', 'FR-006', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 5, 'testtest', 'fondo_reserva', NULL, 1, '2025-11-11 04:40:40', '2025-11-11 04:40:40'),
(42, 19, 'testtest', 'consumo', NULL, 1, '2025-11-11 04:41:11', '2025-11-11 04:41:11'),
(43, 46, 'testtest', 'fondo_reserva', NULL, 1, '2025-11-11 05:24:40', '2025-11-11 05:24:40'),
(45, 5, 'testtestdcsxsd', 'fondo_reserva', NULL, 1, '2025-11-11 05:26:19', '2025-11-11 05:26:19');

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
(10, 10, 'Contabilidad', 'CC010', '2025-10-10 18:07:49', '2025-10-10 18:07:49'),
(11, 1, 'Ascensores', 'CC011', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 'Sistemas de Vigilancia', 'CC012', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 'Consumo de Agua', 'CC013', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 'Fondo de Reserva', 'CC014', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 'Multas y Sanciones', 'CC015', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 'Obras y Remodelaciones', 'CC016', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 'Servicios Comunes', 'CC017', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 'Suministros Básicos', 'CC018', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 'Aportes a Fondos', 'CC019', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 'Personal de Apoyo', 'CC020', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 'Seguridad', 'CC021', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 'Consumo Eléctrico', 'CC022', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 'Seguros', 'CC023', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 'Mantención Redes', 'CC024', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 'Fondos Comunes', 'CC025', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 'Piscina y Spa', 'CC026', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 'Reparaciones', 'CC027', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 'Multas e Ingresos', 'CC028', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 'Consumo de Agua', 'CC029', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 'Gestión y Publicidad', 'CC030', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 'Bodegas y Estacionamientos', 'CC031', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 'Consumos Individuales', 'CC032', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 'Gastos Financieros', 'CC033', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 'Gastos de Oficina', 'CC034', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 'Personal Externo', 'CC035', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 'Suministro de Gas', 'CC036', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 'Recepción y Conserjería', 'CC037', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 'Techos y Cubiertas', 'CC038', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 'Reglamentos y Normas', 'CC039', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 'Reservas y Fondos', 'CC040', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 36, ',', 'ccc412', '2025-11-11 05:15:19', '2025-11-11 05:15:19'),
(42, 16, ',,,,,,,,,,,', 'wxs45623', '2025-11-11 05:17:08', '2025-11-11 05:17:08'),
(43, 28, 'admin_comunidad', 'ddd512', '2025-11-11 05:20:46', '2025-11-11 05:20:46'),
(44, 16, 'admin_comunidad', 'f7', '2025-11-11 05:22:04', '2025-11-11 05:22:04'),
(45, 5, 'twsdtyhb', 'sc452', '2025-11-11 05:23:14', '2025-11-11 05:23:14');

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
(10, 'Loteo San Miguel', '78901234', '5', NULL, 'Av. Llano Subercaseaux 100, San Miguel', 'admin@sanmiguel.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-10 18:07:36', '2025-10-10 18:07:36', NULL, NULL),
(11, 'Residencial Tobalaba', '87654322', '1', NULL, 'Av. Tobalaba 500, Peñalolén', 'adm@tobalaba.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(12, 'Condominio Central Quilín', '13456780', '5', NULL, 'Av. Quilín 7000, Macul', 'admin@quilin.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(13, 'Edificio Los Aromos', '24567890', '9', NULL, 'Calle Los Aromos 123, La Reina', 'losaromos@adm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(14, 'Loteo Casas del Valle', '35678901', '3', NULL, 'Camino al Valle 400, Colina', 'valle@casas.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(15, 'Edificio Plaza Independencia', '46789012', '7', NULL, 'Av. Independencia 100, Independencia', 'plaza@indep.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(16, 'Condominio Mar Egeo', '57890123', '1', NULL, 'Calle Egeo 200, Concón', 'marea@concon.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(17, 'Edificio Los Naranjos', '68901234', '5', NULL, 'Calle Naranjos 300, San Joaquín', 'naranjos@stgo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(18, 'Portal Ñuñoa Sur', '79012345', '9', NULL, 'Av. Irarrázaval 5000, Ñuñoa', 'portal@nunoa.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(19, 'Condominio Los Alerces', '80123456', '2', NULL, 'Ruta Los Alerces 10, Puerto Montt', 'alerces@sur.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(20, 'Edificio El Bosque', '91234567', '6', NULL, 'Av. El Bosque 100, Huechuraba', 'bosque@adm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:30:00', '2025-10-23 16:30:00', NULL, NULL),
(21, 'Condominio Lo Barnechea Este', '10123456', '8', NULL, 'Camino El Huinganal 2000, Lo Barnechea', 'admin@lbe.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(22, 'Edificio San Pedro', '11234567', '2', NULL, 'Calle San Pedro 50, Concepción', 'sanpedro@concep.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(23, 'Loteo Jardín del Mar', '12345678', '3', NULL, 'Av. Costanera 100, Viña del Mar', 'jardin@mar.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(24, 'Condominio Los Nogales', '13456789', '7', NULL, 'Av. Los Nogales 30, Rancagua', 'nogales@adm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(25, 'Edificio Centro Puerto', '14567890', '1', NULL, 'Calle Comercio 50, Puerto Montt', 'centro@puerto.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(26, 'Residencial San Clemente', '15678901', '5', NULL, 'Ruta 5 Sur Km 200, Talca', 'sanclmente@adm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(27, 'Edificio Altos del Valle', '16789012', '9', NULL, 'Av. Principal 10, Copiapó', 'altos@valle.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(28, 'Condominio Los Pinos', '17890123', '3', NULL, 'Calle Pinos 55, Temuco', 'lospinos@temuco.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(29, 'Edificio Torre Mayor', '18901234', '7', NULL, 'Av. Mayor 300, Antofagasta', 'torre@mayor.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(30, 'Loteo El Arrayán', '19012345', '1', NULL, 'Camino El Arrayán 10, Santiago', 'arrayan@loteo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(31, 'Edificio Santa Lucía', '20135791', '0', NULL, 'Alameda 900, Santiago', 'santa@lucia.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(32, 'Condominio Las Acacias', '21246802', '4', NULL, 'Las Acacias 120, La Florida', 'acacias@condo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(33, 'Residencial Plaza Egaña', '22358013', '8', NULL, 'Av. Larrain 8000, Ñuñoa', 'plaza@egana.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(34, 'Edificio Altavista', '23469124', '2', NULL, 'Calle Héroes 500, Valparaíso', 'altavista@valpo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(35, 'Loteo Puerta del Sol', '24580235', '6', NULL, 'Ruta del Sol Km 10, Curacaví', 'puerta@sol.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(36, 'Condominio Bosque Nativo', '25691346', '0', NULL, 'Camino Bosque 10, Puerto Varas', 'bosque@nativo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(37, 'Edificio Central Park', '26802457', '4', NULL, 'Av. Vitacura 9000, Vitacura', 'park@central.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(38, 'Residencial Maipú Centro', '27913568', '8', NULL, 'Av. Pajaritos 50, Maipú', 'maipu@centro.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(39, 'Edificio Alto Las Condes', '28024679', '2', NULL, 'Av. Las Condes 10000, Las Condes', 'alto@lc.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(40, 'Condominio La Dehesa', '29135790', '6', NULL, 'Av. La Dehesa 500, Lo Barnechea', 'dehesa@condo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL),
(41, 'Condominio La Reina Alta', '30246802', '5', NULL, 'Av. La Reina 9000, La Reina', 'adm@lareina.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(42, 'Edificio Central Valpo', '31357913', '9', NULL, 'Calle Condell 500, Valparaíso', 'central@valpo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(43, 'Residencial El Sol Maipu', '32469024', '2', NULL, 'Pajaritos 2000, Maipú', 'elsol@maipu.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(44, 'Loteo Casas del Maule', '33580135', '6', NULL, 'Ruta 5 Sur Km 250, Talca', 'casas@maule.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(45, 'Edificio Mirador Costanera', '34691246', 'K', NULL, 'Av. Costanera 300, Puerto Montt', 'costanera@pm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(46, 'Condominio Chillán Viejo', '35802357', '4', NULL, 'Av. O´Higgins 100, Chillán', 'cviejo@condo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(47, 'Edificio Santiago Centro Sur', '36913468', '8', NULL, 'San Diego 500, Santiago', 'sursanti@adm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(48, 'Residencial Ñuñoa Alto', '38024579', '1', NULL, 'Av. Egaña 100, Ñuñoa', 'nunoa@alto.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(49, 'Condominio El Bosque La Florida', '39135690', '5', NULL, 'Vicuña Mackenna 7000, La Florida', 'bosque@florida.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(50, 'Edificio Concepción Centro', '40246801', '9', NULL, 'Barros Arana 100, Concepción', 'centro@concep.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(51, 'Condominio Las Plazas', '41357912', '2', NULL, 'Los Leones 500, Providencia', 'plazas@adm.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(52, 'Edificio Torre Pacífico', '42469023', '6', NULL, 'Av. Borgoño 800, Concón', 'pacifico@concon.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(53, 'Residencial San Joaquín', '43580134', 'K', NULL, 'Av. Vicuña Mackenna 1000, San Joaquín', 'adm@sjoaquin.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(54, 'Loteo El Valle Central', '44691245', '3', NULL, 'Ruta 68 Km 50, Curacaví', 'valle@central.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(55, 'Edificio Plaza Las Condes', '45802356', '7', NULL, 'Av. Las Condes 9000, Las Condes', 'plaza@lc.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(56, 'Condominio Las Araucarias', '46913467', '1', NULL, 'Calle Las Araucarias 20, Temuco', 'araucarias@temuco.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(57, 'Edificio Centro Santiago', '48024578', '5', NULL, 'Huéspedes 100, Santiago', 'centro@stgo.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(58, 'Residencial Alto Macul', '49135689', '9', NULL, 'Av. Macul 500, Macul', 'alto@macul.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(59, 'Condominio La Serena Norte', '50246800', '2', NULL, 'Ruta 5 Norte Km 400, La Serena', 'norte@serena.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL),
(60, 'Edificio El Golf', '51357911', '6', NULL, 'Av. El Golf 10, Las Condes', 'adm@elgolf.cl', NULL, NULL, 'CLP', 'America/Santiago', '2025-10-23 16:40:00', '2025-10-23 16:40:00', NULL, NULL);

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
(10, 6, '2025-10-10', 95000.00, 'Pago Pendiente D1001', 'TRF-JKL10', 'pendiente', 10, NULL, '2025-10-10 18:10:18', '2025-10-10 18:10:18'),
(11, 1, '2025-10-11', 120000.00, 'Pago Proveedor Limpieza', 'PROV-LIM-11', 'pendiente', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, '2025-10-12', 4500.00, 'Pago Reserva Quincho U301', 'RES-Q-12', 'conciliado', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, '2025-10-13', 75000.00, 'Trf 75000 U402', 'TRF-GHI13', 'pendiente', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, '2025-10-14', 18000.00, 'Webpay Pago Multa Casa B', 'WP-RST14', 'conciliado', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, '2025-10-15', 35000.00, 'Depósito efectivo D502', 'EFE-45615', 'pendiente', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, '2025-10-16', 150000.00, 'Transferencia Gasto Extra', 'TRF-UVW16', 'conciliado', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, '2025-10-17', 25000.00, 'Pago D1501', 'TRF-EFG17', 'pendiente', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, '2025-10-18', 55000.00, 'Pago Pendiente D106', 'WP-KLM18', 'pendiente', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, '2025-10-19', 30000.00, 'Depósito UQ02', 'EFE-NOP19', 'conciliado', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, '2025-10-20', 80000.00, 'Transferencia D201', 'TRF-OPQ20', 'pendiente', NULL, NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(31, 1, '2025-10-21', 150000.00, 'Pago Proveedor Seguridad', 'PROV-SEG-21', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, '2025-10-22', 12000.00, 'Multa U306', 'MUL-306-22', 'conciliado', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, '2025-10-23', 95000.00, 'Trf 95000 D403', 'TRF-JUT23', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, '2025-10-24', 45000.00, 'Webpay Pago Casa C', 'WP-YZA24', 'conciliado', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, '2025-10-25', 55000.00, 'Depósito efectivo D503', 'EFE-78925', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, '2025-10-26', 180000.00, 'Transferencia Gasto Operac', 'TRF-WXY26', 'conciliado', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, '2025-10-27', 35000.00, 'Pago D1503', 'TRF-HIJ27', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, '2025-10-28', 70000.00, 'Pago Pendiente D107', 'WP-MNO28', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, '2025-10-29', 40000.00, 'Depósito UQ03', 'EFE-PQR29', 'conciliado', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, '2025-10-30', 90000.00, 'Transferencia D203', 'TRF-RST30', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 11, '2025-10-31', 65000.00, 'Trf 65000 U102', 'TRF-ABC31', 'conciliado', 21, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(42, 12, '2025-11-01', 32000.00, 'Webpay Pago D201', 'WP-XYZ32', 'conciliado', 22, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(43, 13, '2025-11-02', 48000.00, 'Depósito efectivo D404', 'EFE-12333', 'pendiente', 23, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(44, 14, '2025-11-03', 53000.00, 'Transferencia Casa C', 'TRF-LMN34', 'conciliado', 24, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(45, 15, '2025-11-04', 72000.00, 'Webpay D503', 'WP-QRS35', 'conciliado', 25, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(46, 16, '2025-11-05', 42000.00, 'Transferencia sin identificar', 'TRF-IND36', 'pendiente', 26, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(47, 17, '2025-11-06', 78000.00, 'Pago D1503', 'TRF-TUV37', 'pendiente', 27, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(48, 18, '2025-11-07', 83000.00, 'Pago Pendiente D107', 'WP-UVW38', 'pendiente', 28, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(49, 19, '2025-11-08', 54000.00, 'Depósito UQ03', 'EFE-XYZ39', 'pendiente', 29, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(50, 20, '2025-11-09', 105000.00, 'Pago Pendiente D203', 'TRF-JKL40', 'conciliado', 30, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
(10, 10, '2025-08-01', 1.55, 'compuesto', 2.45, '2025-10-10 18:07:44', '2025-10-10 18:07:44'),
(11, 11, '2025-01-01', 1.05, 'simple', 1.90, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 12, '2025-01-01', 1.45, 'compuesto', 2.40, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 13, '2025-02-01', 1.15, 'simple', 1.70, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 14, '2025-02-01', 1.25, 'compuesto', 2.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 15, '2025-03-01', 1.35, 'simple', 2.15, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 16, '2025-04-01', 1.10, 'compuesto', 2.20, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 17, '2025-05-01', 1.70, 'simple', 2.70, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 18, '2025-06-01', 1.20, 'compuesto', 2.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 19, '2025-07-01', 1.30, 'simple', 2.10, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 20, '2025-08-01', 1.60, 'compuesto', 2.50, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 21, '2025-01-01', 1.28, 'simple', 2.05, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, '2025-01-01', 1.58, 'compuesto', 2.55, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, '2025-02-01', 1.08, 'simple', 1.88, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, '2025-02-01', 1.18, 'compuesto', 1.98, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 25, '2025-03-01', 1.38, 'simple', 2.18, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 26, '2025-04-01', 1.48, 'compuesto', 2.38, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 27, '2025-05-01', 1.68, 'simple', 2.68, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 28, '2025-06-01', 1.23, 'compuesto', 2.03, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 29, '2025-07-01', 1.33, 'simple', 2.13, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 30, '2025-08-01', 1.63, 'compuesto', 2.53, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 31, '2025-01-01', 1.40, 'simple', 2.20, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 32, '2025-01-01', 1.00, 'compuesto', 1.70, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 33, '2025-02-01', 1.50, 'simple', 2.30, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 34, '2025-02-01', 1.10, 'compuesto', 1.80, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 35, '2025-03-01', 1.20, 'simple', 2.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 36, '2025-04-01', 1.30, 'compuesto', 2.10, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 37, '2025-05-01', 1.45, 'simple', 2.25, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 38, '2025-06-01', 1.15, 'compuesto', 1.95, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 39, '2025-07-01', 1.25, 'simple', 2.05, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 40, '2025-08-01', 1.55, 'compuesto', 2.45, '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
(10, 10, 10, 10, 68000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(11, 1, 1, 2, 50000.00, 50000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(12, 2, 2, 3, 15000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(13, 3, 3, 4, 30000.00, 30000.00, 'vencido', 500.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(14, 4, 4, 5, 40000.00, 10000.00, 'parcial', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(15, 5, 5, 6, 60000.00, 60000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(16, 6, 6, 7, 75000.00, 75000.00, 'pendiente', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(17, 7, 7, 8, 25000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(18, 8, 8, 9, 55000.00, 55000.00, 'vencido', 100.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(19, 9, 9, 10, 30000.00, 15000.00, 'parcial', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(20, 10, 10, 10, 80000.00, 0.00, 'pagado', 0.00, '2025-10-10 18:09:44', '2025-10-10 18:09:44'),
(21, 11, 1, 11, 65000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 2, 13, 32000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 3, 14, 48000.00, 48000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 4, 15, 53000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 5, 16, 72000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 6, 17, 42000.00, 42000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 7, 18, 78000.00, 78000.00, 'vencido', 1200.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 8, 19, 83000.00, 50000.00, 'parcial', 200.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 9, 20, 54000.00, 54000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 10, 20, 105000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 1, 12, 55000.00, 55000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 2, 2, 45000.00, 45000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 3, 3, 90000.00, 90000.00, 'vencido', 1800.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 4, 4, 61000.00, 15000.00, 'parcial', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 5, 5, 80000.00, 80000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 6, 6, 98000.00, 98000.00, 'pendiente', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 7, 7, 60000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 8, 8, 88000.00, 35000.00, 'parcial', 800.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 9, 9, 52000.00, 52000.00, 'vencido', 900.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 10, 10, 75000.00, 0.00, 'pagado', 0.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 1, 1, 1, 55000.00, 5000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(42, 11, 1, 2, 60000.00, 60000.00, 'pendiente', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(43, 1, 1, 11, 70000.00, 70000.00, 'vencido', 1050.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(44, 2, 2, 3, 62000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(45, 12, 2, 13, 35000.00, 5000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(46, 2, 2, 2, 50000.00, 50000.00, 'vencido', 1000.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(47, 3, 3, 4, 90000.00, 10000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(48, 13, 3, 14, 52000.00, 52000.00, 'pendiente', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(49, 3, 3, 3, 95000.00, 95000.00, 'vencido', 1425.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(50, 11, 1, 1, 55000.00, 55000.00, 'pendiente', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(51, 12, 2, 3, 62000.00, 62000.00, 'pendiente', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(52, 13, 3, 4, 88000.00, 88000.00, 'pendiente', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(53, 11, 1, 12, 68000.00, 13000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(54, 12, 2, 2, 47000.00, 2000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(55, 13, 3, 3, 91000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(56, 1, 1, 1, 50000.00, 50000.00, 'vencido', 750.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(57, 11, 1, 1, 55000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(58, 12, 2, 3, 62000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(59, 13, 3, 4, 88000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(60, 11, 1, 11, 70000.00, 5000.00, 'parcial', 0.00, '2025-10-29 19:26:26', '2025-10-29 19:26:26'),
(61, 41, 1, 1, 56000.00, 56000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(62, 41, 1, 2, 61000.00, 61000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(63, 41, 1, 11, 71000.00, 71000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(64, 41, 1, 12, 69000.00, 69000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(65, 42, 2, 3, 63000.00, 63000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(66, 42, 2, 13, 36000.00, 36000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(67, 42, 2, 2, 51000.00, 51000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(68, 43, 3, 4, 89000.00, 89000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(69, 43, 3, 14, 53000.00, 53000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(70, 43, 3, 3, 96000.00, 96000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(71, 41, 1, 1, 56000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(72, 42, 2, 3, 63000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(73, 43, 3, 4, 89000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(74, 41, 1, 2, 61000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(75, 42, 2, 13, 36000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(76, 43, 3, 14, 53000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(77, 41, 1, 11, 71000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(78, 42, 2, 2, 51000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(79, 43, 3, 3, 96000.00, 96000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(80, 41, 1, 12, 69000.00, 69000.00, 'pendiente', 0.00, '2025-10-29 19:39:19', '2025-10-29 19:39:19'),
(81, 46, 4, 5, 51000.00, 51000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(82, 47, 5, 6, 73000.00, 73000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(83, 48, 6, 7, 95000.00, 95000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(84, 49, 7, 8, 55000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(85, 50, 8, 9, 78000.00, 78000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(86, 51, 9, 10, 49000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(87, 52, 10, 10, 68000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(88, 53, 11, 11, 70000.00, 5000.00, 'parcial', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(89, 54, 12, 13, 34000.00, 2000.00, 'parcial', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(90, 55, 13, 14, 50000.00, 50000.00, 'vencido', 750.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(91, 56, 14, 15, 54000.00, 1000.00, 'parcial', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(92, 57, 15, 16, 71000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(93, 58, 16, 17, 43000.00, 43000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(94, 59, 17, 18, 79000.00, 79000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(95, 60, 18, 19, 82000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(96, 61, 19, 20, 56000.00, 2000.00, 'parcial', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(97, 62, 20, 20, 106000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(98, 63, 21, 21, 66000.00, 66000.00, 'pendiente', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(99, 64, 22, 22, 33000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(100, 51, 9, 9, 50000.00, 50000.00, 'vencido', 800.00, '2025-10-29 19:43:41', '2025-10-29 19:43:41'),
(101, 65, 36, 36, 98000.00, 98000.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(102, 66, 46, 46, 42000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(103, 67, 49, 49, 50000.00, 50000.00, 'vencido', 750.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(104, 68, 40, 40, 75000.00, 75000.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(105, 69, 41, 41, 60000.00, 10000.00, 'parcial', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(106, 70, 59, 59, 85000.00, 85000.00, 'vencido', 1275.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(107, 71, 32, 32, 47000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(108, 72, 36, 36, 99500.00, 99500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(109, 73, 46, 46, 43500.00, 43500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(110, 74, 49, 49, 51500.00, 51500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(111, 75, 40, 40, 76500.00, 76500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(112, 76, 41, 41, 61500.00, 61500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(113, 77, 59, 59, 86500.00, 86500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(114, 78, 32, 32, 48500.00, 48500.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(115, 65, 36, 76, 65000.00, 65000.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(116, 66, 46, 91, 40000.00, 0.00, 'pagado', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(117, 67, 49, 97, 55000.00, 55000.00, 'vencido', 825.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(118, 68, 40, 80, 78000.00, 78000.00, 'pendiente', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(119, 69, 41, 81, 62000.00, 2000.00, 'parcial', 0.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01'),
(120, 70, 59, 117, 88000.00, 88000.00, 'vencido', 1320.00, '2025-10-29 19:54:01', '2025-10-29 19:54:01');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `detalle_cargo_unidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `detalle_cargo_unidad`;
CREATE TABLE `detalle_cargo_unidad` (
`id` bigint
,`cargo_unidad_id` bigint
,`categoria_id` bigint
,`glosa` varchar(250)
,`monto` decimal(12,2)
,`origen` enum('gasto','multa','consumo','ajuste')
,`origen_id` bigint
,`iva_incluido` tinyint(1)
,`created_at` datetime
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
(10, 9, 10, 'Consumo Electricidad', 49000.00, 'consumo', NULL, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(11, 11, 1, 'Gastos Operacionales Comunes', 50000.00, 'gasto', 1, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(12, 12, 2, 'Aporte Fondo Reserva', 15000.00, 'gasto', 2, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(13, 13, 3, 'Cuota Extraordinaria Mantención', 30000.00, 'ajuste', 3, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(14, 14, 4, 'Multa por Ruido', 10000.00, 'multa', 4, 0, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(15, 14, 5, 'Consumo Gas', 30000.00, 'consumo', 5, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(16, 15, 6, 'Gastos Administrativos', 60000.00, 'gasto', 6, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(17, 16, 7, 'Cuota Remodelación Fachada', 75000.00, 'ajuste', 7, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(18, 17, 8, 'Multa por Fumar en Común', 25000.00, 'multa', 8, 0, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(19, 18, 9, 'Gasto de Conserjería', 55000.00, 'gasto', 9, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(20, 19, 10, 'Consumo Agua', 30000.00, 'consumo', 10, 1, '2025-10-10 18:10:14', '2025-10-10 18:10:14'),
(21, 21, 11, 'Cuota Ascensores', 65000.00, 'gasto', 11, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, 12, 'Reparación de Cámaras', 32000.00, 'gasto', 12, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, 13, 'Consumo Agua Común', 48000.00, 'consumo', 13, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, 14, 'Aporte Fondo Reserva', 15000.00, 'gasto', 14, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 24, 4, 'Multa Mascotas', 10000.00, 'multa', 14, 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 25, 15, 'Multa Basura', 12000.00, 'multa', 15, 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 26, 16, 'Remodelación Fachada', 42000.00, 'ajuste', 16, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 27, 17, 'Internet Común', 78000.00, 'gasto', 17, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 28, 18, 'Consumo Gas Unidad', 33000.00, 'consumo', 18, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 29, 19, 'Fondo Imprevistos', 54000.00, 'gasto', 19, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 30, 20, 'Gasto Conserjería', 105000.00, 'gasto', 20, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 31, 1, 'Gasto Base Operacional', 55000.00, 'gasto', 1, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 32, 2, 'Aporte Fondo Reserva', 45000.00, 'gasto', 2, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 33, 3, 'Cuota Gasto Extraordinario', 90000.00, 'ajuste', 3, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 34, 4, 'Multa por Atraso', 10000.00, 'multa', 4, 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 34, 5, 'Consumo Agua Caliente', 51000.00, 'consumo', 5, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 35, 6, 'Gastos Fijos y Seguros', 80000.00, 'gasto', 6, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 36, 7, 'Cuota por Reparación Ascensores', 98000.00, 'ajuste', 7, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 37, 8, 'Recargo uso Amenidades', 60000.00, 'multa', 8, 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 38, 9, 'Gasto de Administración', 88000.00, 'gasto', 9, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
(10, 10, 10, 10, 71400.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(11, 1, 1, 1, 59500.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(12, 2, 2, 2, 89250.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(13, 3, 3, 3, 35700.00, 'fijo_por_unidad', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(14, 4, 4, 4, 107100.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(15, 5, 5, 5, 142800.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(16, 6, 6, 6, 95200.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(17, 7, 7, 7, 47600.00, 'fijo_por_unidad', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(18, 8, 8, 8, 178500.00, 'consumo', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(19, 9, 9, 9, 71400.00, 'coeficiente', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(20, 10, 10, 10, 119000.00, 'partes_iguales', NULL, '2025-10-10 18:07:54', '2025-10-10 18:07:54'),
(41, 21, 41, 1, 105000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(42, 22, 42, 2, 65000.00, 'partes_iguales', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(43, 23, 43, 3, 95000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(44, 24, 44, 4, 40000.00, 'fijo_por_unidad', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(45, 25, 45, 5, 110000.00, 'consumo', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(46, 26, 46, 6, 150000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(47, 27, 47, 7, 100000.00, 'partes_iguales', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(48, 28, 48, 8, 50000.00, 'fijo_por_unidad', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(49, 29, 49, 9, 185000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(50, 30, 50, 10, 75000.00, 'consumo', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(51, 31, 51, 11, 115000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(52, 32, 52, 12, 70000.00, 'partes_iguales', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(53, 33, 53, 13, 105000.00, 'consumo', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(54, 34, 54, 14, 55000.00, 'fijo_por_unidad', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(55, 35, 55, 15, 125000.00, 'consumo', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(56, 36, 56, 16, 80000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(57, 37, 57, 17, 55000.00, 'fijo_por_unidad', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(58, 38, 58, 18, 150000.00, 'coeficiente', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(59, 39, 59, 19, 60000.00, 'partes_iguales', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(60, 40, 60, 20, 90000.00, 'consumo', NULL, '2025-10-23 16:06:00', '2025-10-23 16:06:00');

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
(10, 10, 10, 'boleta', 'B-1002', '2025-09-10', 60000.00, 11400.00, 0.00, 71400.00, 'Revisión técnica de red de gas', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(11, 1, 1, 'boleta', 'B-1011', '2025-09-11', 50000.00, 9500.00, 0.00, 59500.00, 'Compra de insumos de limpieza', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(12, 2, 2, 'factura', 'F-2012', '2025-09-12', 75000.00, 14250.00, 0.00, 89250.00, 'Servicio de vigilancia Octubre', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(13, 3, 3, 'boleta', 'B-3013', '2025-09-13', 30000.00, 5700.00, 0.00, 35700.00, 'Reparación de bomba de agua', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(14, 4, 4, 'factura', 'F-4014', '2025-09-14', 90000.00, 17100.00, 0.00, 107100.00, 'Compra de materiales de construcción', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(15, 5, 5, 'boleta', 'B-5015', '2025-09-15', 120000.00, 22800.00, 0.00, 142800.00, 'Mantención eléctrica general', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(16, 6, 6, 'factura', 'F-6016', '2025-09-16', 80000.00, 15200.00, 0.00, 95200.00, 'Auditoría externa', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(17, 7, 7, 'boleta', 'B-7017', '2025-09-17', 40000.00, 7600.00, 0.00, 47600.00, 'Reparación menor ascensor', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(18, 8, 8, 'factura', 'F-8018', '2025-09-18', 150000.00, 28500.00, 0.00, 178500.00, 'Compra de mobiliario para salón', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(19, 9, 9, 'boleta', 'B-9019', '2025-09-19', 60000.00, 11400.00, 0.00, 71400.00, 'Capacitación conserjes', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(20, 10, 10, 'factura', 'F-10020', '2025-09-20', 100000.00, 19000.00, 0.00, 119000.00, 'Revisión sistemas de incendio', '2025-10-10 18:07:50', '2025-10-10 18:07:50'),
(21, 11, 11, 'factura', 'F-11021', '2025-10-01', 54621.00, 10378.00, 0.00, 65000.00, 'Servicio de Jardinería Octubre', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 12, 'boleta', 'B-12022', '2025-10-02', 26890.00, 5110.00, 0.00, 32000.00, 'Compra de luces LED', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 13, 'factura', 'F-13023', '2025-10-03', 40336.00, 7664.00, 0.00, 48000.00, 'Reparación de filtración', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 14, 'boleta', 'B-14024', '2025-10-04', 44538.00, 8462.00, 0.00, 53000.00, 'Honorarios Legales', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 15, 'factura', 'F-15025', '2025-10-05', 60504.00, 11496.00, 0.00, 72000.00, 'Servicio de Seguridad 24H', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 16, 'factura', 'F-16026', '2025-10-06', 35294.00, 6706.00, 0.00, 42000.00, 'Remodelación de Hall', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 17, 'boleta', 'B-17027', '2025-10-07', 65546.00, 12454.00, 0.00, 78000.00, 'Internet Comun. Octubre', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 18, 'factura', 'F-18028', '2025-10-08', 69747.00, 13253.00, 0.00, 83000.00, 'Compra de pinturas y rodillos', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 19, 'boleta', 'B-19029', '2025-10-09', 45378.00, 8622.00, 0.00, 54000.00, 'Reparación de bomba de agua', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 20, 'factura', 'F-20030', '2025-10-10', 88235.00, 16765.00, 0.00, 105000.00, 'Honorarios Conserjería Octubre', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 1, 'factura', 'F-10031', '2025-10-11', 110000.00, 20900.00, 0.00, 130900.00, 'Compra de Equipos de Monitoreo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 2, 'boleta', 'B-2032', '2025-10-12', 40000.00, 7600.00, 0.00, 47600.00, 'Reparación de sensores', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 3, 'factura', 'F-3033', '2025-10-13', 80000.00, 15200.00, 0.00, 95200.00, 'Mantención Piscina Anual', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 4, 'boleta', 'B-4034', '2025-10-14', 50000.00, 9500.00, 0.00, 59500.00, 'Compra de Tuberías', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 5, 'factura', 'F-5035', '2025-10-15', 70000.00, 13300.00, 0.00, 83300.00, 'Renovación de Licencias de Software', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 6, 'factura', 'F-6036', '2025-10-16', 100000.00, 19000.00, 0.00, 119000.00, 'Servicios Contables Octubre', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 7, 'factura', 'F-7037', '2025-10-17', 50000.00, 9500.00, 0.00, 59500.00, 'Mano de obra Recepción', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 8, 'boleta', 'B-8038', '2025-10-18', 75000.00, 14250.00, 0.00, 89250.00, 'Compra de Ladrillos para Reparación', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 9, 'factura', 'F-9039', '2025-10-19', 120000.00, 22800.00, 0.00, 142800.00, 'Fee Administración Trimestral', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 10, 'boleta', 'B-10040', '2025-10-20', 65000.00, 12350.00, 0.00, 77350.00, 'Reparación de Medidores de Gas', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 1, 4, 'boleta', 'COMP-1762842740364', '2025-11-12', 12605.04, 2394.96, 0.00, 15000.00, 'ALTER TABLE gasto ADD CONSTRAINT fk_gasto_doc FOREIGN KEY (documento_compra_id) REFERENCES documento_compra(id);', '2025-11-11 06:32:20', '2025-11-11 06:32:20'),
(42, 40, 1, 'factura', 'COMP-1762842808809', '2025-11-13', 252100.84, 47899.16, 0.00, 300000.00, 'Documentación', '2025-11-11 06:33:28', '2025-11-11 06:33:28'),
(43, 5, 1, 'boleta', 'COMP-1762842856551', '2025-11-12', 1260.47, 239.49, 0.00, 1499.96, 'Documentación', '2025-11-11 06:34:16', '2025-11-11 06:34:16'),
(44, 5, 5, 'boleta', 'COMP-1762842896111', '2025-11-29', 8604.97, 1634.95, 0.00, 10239.92, 'DocumentaciónDocumentaciónDocumentación', '2025-11-11 06:34:56', '2025-11-11 06:34:56'),
(45, 5, 2, 'boleta', 'COMP-1762843517980', '2025-11-15', 379.81, 72.16, 0.00, 451.97, 'warzone', '2025-11-11 06:45:18', '2025-11-11 06:45:18'),
(46, 5, 1, 'boleta', 'COMP-1762844008787', '2025-11-13', 3791.60, 720.40, 0.00, 4512.00, 'getUserCommunities', '2025-11-11 06:53:29', '2025-11-11 06:53:29');

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
(10, 10, 'otro', 'Certificado Recepción Final', 'https://docs.cc/c10/cert-final.pdf', NULL, 'privado', '2025-10-10 18:10:17', '2025-10-10 18:10:17'),
(11, 1, 'acta', 'Acta Reunión Comité Octubre', 'https://docs.cc/c1/acta-comite-oct.pdf', '2025-10', 'privado', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 'circular', 'Corte de Luz Programado', 'https://docs.cc/c2/circular-luz.pdf', '2025-10', 'publico', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 'reglamento', 'Manual de Uso de Gimnasio', 'https://docs.cc/c3/manual-gym.pdf', NULL, 'publico', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 'otro', 'Certificado de Urbanización', 'https://docs.cc/c4/cert-urb.pdf', NULL, 'privado', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 'boletin', 'Aviso de Gastos Comunes', 'https://docs.cc/c5/aviso-gc.pdf', '2025-10', 'publico', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 'acta', 'Acta Asamblea Extraordinaria', 'https://docs.cc/c6/acta-ext.pdf', '2025-09', 'privado', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 'circular', 'Reglas Uso Lavandería', 'https://docs.cc/c7/circ-lav.pdf', '2025-10', 'publico', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 'reglamento', 'Reglamento de Terraza', 'https://docs.cc/c8/regl-terraza.pdf', NULL, 'publico', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 'otro', 'Informe de Tuberías', 'https://docs.cc/c9/inf-tub.pdf', '2025-08', 'privado', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 'boletin', 'Resumen de Tesorería', 'https://docs.cc/c10/res-tes.pdf', '2025-09', 'privado', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 'acta', 'Acta N°10 Enero', 'https://docs.cc/c11/acta-10.pdf', '2025-01', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 'circular', 'Aviso Uso de Gimnasio', 'https://docs.cc/c12/circ-gym.pdf', '2025-11', 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 'reglamento', 'Reglamento de Mascotas', 'https://docs.cc/c13/regl-mascotas.pdf', NULL, 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 'boletin', 'Boletín N°11 Noviembre', 'https://docs.cc/c14/boletin-11.pdf', '2025-11', 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 'otro', 'Informe Estructural', 'https://docs.cc/c15/inf-estr.pdf', '2025-10', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 'acta', 'Acta Comité Noviembre', 'https://docs.cc/c16/acta-com-nov.pdf', '2025-11', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 'circular', 'Corte de Agua Emergencia', 'https://docs.cc/c17/circ-agua-emerg.pdf', '2025-11', 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 'reglamento', 'Uso de Bodegas', 'https://docs.cc/c18/regl-bodegas.pdf', NULL, 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 'boletin', 'Resumen Gastos Q4', 'https://docs.cc/c19/resumen-q4.pdf', '2025-12', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 'otro', 'Certificado de Recepción de Obras', 'https://docs.cc/c20/cert-obras.pdf', NULL, 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 'circular', 'Cierre Piscina por Mantención', 'https://docs.cc/c1/circ-piscina-cierre.pdf', '2025-11', 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 'acta', 'Acta de Aprobación de Presupuesto', 'https://docs.cc/c2/acta-presupuesto.pdf', '2025-10', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 'reglamento', 'Reglamento de uso de Quinchos', 'https://docs.cc/c3/regl-quincho.pdf', NULL, 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 'boletin', 'Aviso de Cobranza', 'https://docs.cc/c4/aviso-cobranza.pdf', '2025-10', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 'otro', 'Especificaciones Técnicas Ascensores', 'https://docs.cc/c5/esp-asc.pdf', '2025-08', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 'circular', 'Aviso de Ruido por Obra', 'https://docs.cc/c6/circ-ruido.pdf', '2025-11', 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 'acta', 'Acta Comité Diciembre', 'https://docs.cc/c7/acta-com-dic.pdf', '2025-12', 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 'reglamento', 'Uso de Canchas Deportivas', 'https://docs.cc/c8/regl-cancha.pdf', NULL, 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 'boletin', 'Aviso de Corte de Agua', 'https://docs.cc/c9/aviso-agua.pdf', '2025-11', 'publico', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 'otro', 'Manual de Conserjería', 'https://docs.cc/c10/manual-conserjeria.pdf', NULL, 'privado', '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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

--
-- Volcado de datos para la tabla `documento_multa`
--

INSERT INTO `documento_multa` (`id`, `multa_id`, `nombre_archivo`, `ruta_archivo`, `tipo_archivo`, `tamanio_bytes`, `descripcion`, `subido_por`, `created_at`) VALUES
(1, 1, 'evidencia_multa_1.jpg', '/multas/docs/1/evidencia_1.jpg', 'image/jpeg', 850000, 'Foto de mascota sin correa.', 1, '2025-10-23 16:30:00'),
(2, 2, 'evidencia_multa_2.pdf', '/multas/docs/2/evidencia_2.pdf', 'application/pdf', 300000, 'Reporte de conserjería por ruido.', 6, '2025-10-23 16:30:00'),
(3, 3, 'evidencia_multa_3.jpg', '/multas/docs/3/evidencia_3.jpg', 'image/jpeg', 1200000, 'Foto de auto bloqueando acceso.', 6, '2025-10-23 16:30:00'),
(4, 4, 'evidencia_multa_4.png', '/multas/docs/4/evidencia_4.png', 'image/png', 500000, 'Grabación de cámara de seguridad.', 8, '2025-10-23 16:30:00'),
(5, 5, 'evidencia_multa_5.pdf', '/multas/docs/5/evidencia_5.pdf', 'application/pdf', 450000, 'Presupuesto de reparación de daño.', 2, '2025-10-23 16:30:00'),
(6, 6, 'evidencia_multa_6.jpg', '/multas/docs/6/evidencia_6.jpg', 'image/jpeg', 950000, 'Foto de mascota sin bozal.', 6, '2025-10-23 16:30:00'),
(7, 7, 'evidencia_multa_7.pdf', '/multas/docs/7/evidencia_7.pdf', 'application/pdf', 250000, 'Reporte de uso de ascensor fuera de horario.', 6, '2025-10-23 16:30:00'),
(8, 8, 'evidencia_multa_8.jpg', '/multas/docs/8/evidencia_8.jpg', 'image/jpeg', 700000, 'Foto de basura en pasillo.', 6, '2025-10-23 16:30:00'),
(9, 9, 'evidencia_multa_9.png', '/multas/docs/9/evidencia_9.png', 'image/png', 600000, 'Imagen de antena instalada.', 1, '2025-10-23 16:30:00'),
(10, 10, 'evidencia_multa_10.pdf', '/multas/docs/10/evidencia_10.pdf', 'application/pdf', 350000, 'Testimonio de vecinos por ruidos.', 3, '2025-10-23 16:30:00'),
(11, 7, 'apelacion_multa_7.pdf', '/multas/docs/7/apelacion_7.pdf', 'application/pdf', 150000, 'Documento de apelación del residente.', 8, '2025-10-23 16:30:00'),
(12, 1, 'pago_multa_1.png', '/multas/docs/1/pago_1.png', 'image/png', 200000, 'Comprobante de pago de multa 1.', 1, '2025-10-23 16:30:00'),
(13, 5, 'recibo_reparacion_5.pdf', '/multas/docs/5/recibo_reparacion_5.pdf', 'application/pdf', 400000, 'Recibo de reparación del daño causado.', 6, '2025-10-23 16:30:00'),
(14, 10, 'grabacion_audio_10.mp3', '/multas/docs/10/grabacion_10.mp3', 'audio/mp3', 2500000, 'Audio de la fiesta.', 3, '2025-10-23 16:30:00'),
(15, 2, 'pago_multa_2.png', '/multas/docs/2/pago_2.png', 'image/png', 180000, 'Comprobante de pago de multa 2.', 3, '2025-10-23 16:30:00'),
(16, 9, 'apelacion_multa_9.pdf', '/multas/docs/9/apelacion_9.pdf', 'application/pdf', 220000, 'Documento de apelación por antena.', 10, '2025-10-23 16:30:00'),
(17, 3, 'pago_multa_3.png', '/multas/docs/3/pago_3.png', 'image/png', 150000, 'Comprobante de pago de multa 3.', 4, '2025-10-23 16:30:00'),
(18, 8, 'pago_multa_8.png', '/multas/docs/8/pago_8.png', 'image/png', 210000, 'Comprobante de pago de multa 8.', 9, '2025-10-23 16:30:00'),
(19, 4, 'resolucion_anulacion_4.pdf', '/multas/docs/4/resolucion_4.pdf', 'application/pdf', 100000, 'Resolución de anulación de multa 4.', 1, '2025-10-23 16:30:00'),
(20, 6, 'pago_multa_6.png', '/multas/docs/6/pago_6.png', 'image/png', 190000, 'Comprobante de pago de multa 6.', 7, '2025-10-23 16:30:00'),
(21, 11, 'foto_uso_tarde.jpg', '/multas/docs/11/foto_tarde.jpg', 'image/jpeg', 800000, 'Foto de la gente saliendo del quincho tarde.', 6, '2025-10-23 16:35:00'),
(22, 12, 'reporte_estac_indebido.pdf', '/multas/docs/12/reporte_estac.pdf', 'application/pdf', 310000, 'Reporte de conserjería sobre vehículo.', 6, '2025-10-23 16:35:00'),
(23, 13, 'foto_llave_abierta.jpg', '/multas/docs/13/foto_llave.jpg', 'image/jpeg', 1100000, 'Foto de llave de agua de jardín abierta.', 6, '2025-10-23 16:35:00'),
(24, 14, 'evidencia_basura.png', '/multas/docs/14/evidencia_basura.png', 'image/png', 480000, 'Bolsa de basura dejada en pasillo.', 8, '2025-10-23 16:35:00'),
(25, 15, 'grabacion_audio_cowork.mp3', '/multas/docs/15/audio_cowork.mp3', 'audio/mp3', 2000000, 'Grabación de voz alta en cowork.', 2, '2025-10-23 16:35:00'),
(26, 16, 'foto_cine_sin_reserva.jpg', '/multas/docs/16/foto_cine.jpg', 'image/jpeg', 980000, 'Foto de personas usando sala de cine sin reserva.', 6, '2025-10-23 16:35:00'),
(27, 17, 'foto_toldo_prohibido.jpg', '/multas/docs/17/foto_toldo.jpg', 'image/jpeg', 300000, 'Foto del toldo instalado en el balcón.', 6, '2025-10-23 16:35:00'),
(28, 18, 'evidencia_cortinas.jpg', '/multas/docs/18/evidencia_cortinas.jpg', 'image/jpeg', 750000, 'Foto de las cortinas con el color no autorizado.', 6, '2025-10-23 16:35:00'),
(29, 19, 'foto_comida_yoga.png', '/multas/docs/19/foto_comida.png', 'image/png', 550000, 'Imagen de envases de comida en salón.', 1, '2025-10-23 16:35:00'),
(30, 20, 'reporte_obstruccion.pdf', '/multas/docs/20/reporte_obs.pdf', 'application/pdf', 380000, 'Informe de conserjería de obstrucción.', 3, '2025-10-23 16:35:00'),
(31, 1, 'resolucion_apelacion_1.pdf', '/multas/docs/1/res_apel_1.pdf', 'application/pdf', 120000, 'Resolución de rechazo de apelación 1.', 1, '2025-10-23 16:35:00'),
(32, 13, 'resolucion_anulacion_13.pdf', '/multas/docs/13/res_anul_13.pdf', 'application/pdf', 150000, 'Resolución de anulación de multa 13.', 1, '2025-10-23 16:35:00'),
(33, 16, 'documento_apelacion_16.pdf', '/multas/docs/16/doc_apel_16.pdf', 'application/pdf', 250000, 'Documento de apelación del residente por uso de cine.', 7, '2025-10-23 16:35:00'),
(34, 17, 'resolucion_rechazo_17.pdf', '/multas/docs/17/res_rechazo_17.pdf', 'application/pdf', 100000, 'Resolución de rechazo de apelación 17.', 1, '2025-10-23 16:35:00'),
(35, 19, 'doc_apelacion_19.pdf', '/multas/docs/19/doc_apel_19.pdf', 'application/pdf', 220000, 'Documento de apelación por comida en yoga.', 10, '2025-10-23 16:35:00'),
(36, 4, 'documento_apelacion_4_2.pdf', '/multas/docs/4/doc_apel_4_2.pdf', 'application/pdf', 280000, 'Segundo documento de apelación por fumar.', 5, '2025-10-23 16:35:00'),
(37, 7, 'aclaracion_uso_asc.pdf', '/multas/docs/7/aclaracion_asc.pdf', 'application/pdf', 190000, 'Aclaración de uso de ascensor de carga.', 8, '2025-10-23 16:35:00'),
(38, 9, 'evidencia_antena_2.jpg', '/multas/docs/9/evidencia_antena_2.jpg', 'image/jpeg', 400000, 'Nueva foto de la antena instalada.', 10, '2025-10-23 16:35:00'),
(39, 2, 'carta_disculpa_2.pdf', '/multas/docs/2/carta_disculpa_2.pdf', 'application/pdf', 150000, 'Carta de disculpa del residente por ruido.', 3, '2025-10-23 16:35:00'),
(40, 14, 'documento_apelacion_14.pdf', '/multas/docs/14/doc_apel_14.pdf', 'application/pdf', 210000, 'Documento de apelación por basura.', 5, '2025-10-23 16:35:00');

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
(10, 10, 'Torre El Llano', 'Av. Llano Subercaseaux 100', 'LL', '2025-10-10 18:07:37', '2025-10-10 18:07:37'),
(11, 11, 'Bloque Tobalaba 1', 'Av. Tobalaba 500', 'BT1', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 12, 'Torre Quilín Este', 'Av. Quilín 7000', 'TQE', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 13, 'Bloque Aromos A', 'Calle Los Aromos 123', 'BAA', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 14, 'Sector 2', 'Camino al Valle 400', 'S2', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 15, 'Torre Principal', 'Av. Independencia 100', 'TP', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 16, 'Bloque Mar A', 'Calle Egeo 200', 'BMA', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 17, 'Edificio Naranjos', 'Calle Naranjos 300', 'EN', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 18, 'Torre Sur', 'Av. Irarrázaval 5000', 'TS', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 19, 'Bloque 2', 'Ruta Los Alerces 10', 'B2', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 20, 'Torre El Roble', 'Av. El Bosque 100', 'TER', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 21, 'Torre Arrayán', 'Camino El Huinganal 2000', 'TA', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, 'Bloque Principal', 'Calle San Pedro 50', 'BP', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, 'Torre Poniente', 'Av. Costanera 100', 'TP', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, 'Bloque 1', 'Av. Los Nogales 30', 'B1', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 25, 'Torre 1', 'Calle Comercio 50', 'T1', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 26, 'Sector Casas Sur', 'Ruta 5 Sur Km 200', 'SCS', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 27, 'Torre Única', 'Av. Principal 10', 'TU', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 28, 'Bloque A', 'Calle Pinos 55', 'BA', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 29, 'Torre 3', 'Av. Mayor 300', 'T3', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 30, 'Sector Alto', 'Camino El Arrayán 10', 'SA', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 31, 'Edificio Central', 'Alameda 900', 'EC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 32, 'Torre 1', 'Las Acacias 120', 'T1', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 33, 'Bloque 1', 'Av. Larrain 8000', 'B1', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 34, 'Torre Principal', 'Calle Héroes 500', 'TP', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 35, 'Sector Sur', 'Ruta del Sol Km 10', 'SS', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 36, 'Bloque B', 'Camino Bosque 10', 'BB', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 37, 'Torre Park', 'Av. Vitacura 9000', 'TPA', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 38, 'Bloque C', 'Av. Pajaritos 50', 'BC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 39, 'Torre Oeste', 'Av. Las Condes 10000', 'TO', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 40, 'Sector A', 'Av. La Dehesa 500', 'SA', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 41, 'Torre Principal A', 'Av. La Reina 9000', 'TPA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(42, 42, 'Bloque Histórico', 'Calle Condell 500', 'BH', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(43, 43, 'Torre B', 'Pajaritos 2000', 'TB', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(44, 44, 'Sector 1 - Casas', 'Ruta 5 Sur Km 250', 'S1', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(45, 45, 'Edificio Único PM', 'Av. Costanera 300', 'EUPM', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(46, 46, 'Torre A', 'Av. O´Higgins 100', 'TA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(47, 47, 'Bloque Sur', 'San Diego 500', 'BS', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(48, 48, 'Torre C', 'Av. Egaña 100', 'TC', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(49, 49, 'Bloque Mackenna', 'Vicuña Mackenna 7000', 'BM', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(50, 50, 'Torre Principal', 'Barros Arana 100', 'TP', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(51, 51, 'Bloque Central', 'Los Leones 500', 'BC', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(52, 52, 'Torre Mar Pacífico', 'Av. Borgoño 800', 'TMP', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(53, 53, 'Edificio Único S.J.', 'Av. Vicuña Mackenna 1000', 'EUSJ', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(54, 54, 'Sector 2 - Parcelas', 'Ruta 68 Km 50', 'S2', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(55, 55, 'Torre Las Américas', 'Av. Las Condes 9000', 'TLA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(56, 56, 'Bloque Araucaria A', 'Calle Las Araucarias 20', 'BAA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(57, 57, 'Torre Centro', 'Huéspedes 100', 'TC', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(58, 58, 'Bloque Macul Alto', 'Av. Macul 500', 'BMA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(59, 59, 'Torre La Serena', 'Ruta 5 Norte Km 400', 'TLS', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(60, 60, 'Edificio El Golf', 'Av. El Golf 10', 'EG', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(61, 41, 'Bloque B La Reina', 'Av. La Reina 9000', 'BLRB', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(62, 42, 'Torre Moderna', 'Calle Condell 500', 'TM', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(63, 43, 'Bloque C Pajaritos', 'Pajaritos 2000', 'BCP', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(64, 44, 'Sector 2 - Casas', 'Ruta 5 Sur Km 250', 'S2', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(65, 45, 'Edificio Vista Mar', 'Av. Costanera 300', 'EVM', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(66, 46, 'Torre B', 'Av. O´Higgins 100', 'TB', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(67, 47, 'Bloque Centro', 'San Diego 500', 'BC', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(68, 48, 'Torre D', 'Av. Egaña 100', 'TD', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(69, 49, 'Bloque Sur', 'Vicuña Mackenna 7000', 'BS', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(70, 50, 'Bloque Concep', 'Barros Arana 100', 'BC', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(71, 51, '51', 'Torre 2', 'T2', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(72, 52, '52', 'Torre Atlántico', 'TA', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(73, 53, '53', 'Bloque A San Joaquín', 'BA', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(74, 54, '54', 'Sector 3 - Casas', 'S3', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(75, 55, '55', 'Torre Central', 'TC', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(76, 56, '56', 'Bloque B Araucaria', 'BAB', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(77, 57, '57', 'Bloque B Centro', 'BCB', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(78, 58, '58', 'Torre Austral', 'TA', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(79, 59, '59', 'Bloque Norte La Serena', 'BNLS', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(80, 60, '60', 'Edificio Polo', 'EP', '2025-10-23 16:45:00', '2025-10-23 16:45:00');

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
(10, 10, '2025-09', '2025-10-14', 'emitido', 'Emisión Septiembre C10', '2025-10-10 18:07:53', '2025-10-10 18:07:53'),
(11, 1, '2025-10', '2025-11-05', 'borrador', 'Emisión Octubre C1', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, '2025-10', '2025-11-06', 'emitido', 'Emisión Octubre C2', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, '2025-10', '2025-11-07', 'cerrado', 'Emisión Octubre C3', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, '2025-10', '2025-11-08', 'emitido', 'Emisión Octubre C4', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, '2025-10', '2025-11-09', 'borrador', 'Emisión Octubre C5', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C6', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, '2025-10', '2025-11-11', 'emitido', 'Emisión Octubre C7', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, '2025-10', '2025-11-12', 'cerrado', 'Emisión Octubre C8', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, '2025-10', '2025-11-13', 'emitido', 'Emisión Octubre C9', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, '2025-10', '2025-11-14', 'borrador', 'Emisión Octubre C10', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, '2025-09', '2025-10-05', 'emitido', 'Emisión Septiembre C11', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, '2025-09', '2025-10-06', 'cerrado', 'Emisión Septiembre C12', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, '2025-09', '2025-10-07', 'emitido', 'Emisión Septiembre C13', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, '2025-09', '2025-10-08', 'emitido', 'Emisión Septiembre C14', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, '2025-09', '2025-10-09', 'cerrado', 'Emisión Septiembre C15', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, '2025-09', '2025-10-10', 'borrador', 'Emisión Septiembre C16', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, '2025-09', '2025-10-11', 'emitido', 'Emisión Septiembre C17', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, '2025-09', '2025-10-12', 'emitido', 'Emisión Septiembre C18', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, '2025-09', '2025-10-13', 'cerrado', 'Emisión Septiembre C19', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, '2025-09', '2025-10-14', 'emitido', 'Emisión Septiembre C20', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 11, '2025-10', '2025-11-05', 'borrador', 'Emisión Octubre C11', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 12, '2025-10', '2025-11-06', 'emitido', 'Emisión Octubre C12', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 13, '2025-10', '2025-11-07', 'cerrado', 'Emisión Octubre C13', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 14, '2025-10', '2025-11-08', 'emitido', 'Emisión Octubre C14', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 15, '2025-10', '2025-11-09', 'borrador', 'Emisión Octubre C15', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 16, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C16', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 17, '2025-10', '2025-11-11', 'emitido', 'Emisión Octubre C17', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 18, '2025-10', '2025-11-12', 'cerrado', 'Emisión Octubre C18', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 19, '2025-10', '2025-11-13', 'emitido', 'Emisión Octubre C19', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 20, '2025-10', '2025-11-14', 'borrador', 'Emisión Octubre C20', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 1, '2025-11', '2025-12-05', 'emitido', 'Emisión Noviembre C1', '2025-10-29 19:39:18', '2025-10-29 19:39:18'),
(42, 2, '2025-11', '2025-12-06', 'emitido', 'Emisión Noviembre C2', '2025-10-29 19:39:18', '2025-10-29 19:39:18'),
(43, 3, '2025-11', '2025-12-07', 'emitido', 'Emisión Noviembre C3', '2025-10-29 19:39:18', '2025-10-29 19:39:18'),
(44, 1, '2025-12', '2026-01-05', 'borrador', 'Emisión Diciembre C1 (Borrador)', '2025-10-29 19:39:18', '2025-10-29 19:39:18'),
(45, 2, '2025-12', '2026-01-06', 'borrador', 'Emisión Diciembre C2 (Borrador)', '2025-10-29 19:39:18', '2025-10-29 19:39:18'),
(46, 4, '2025-11', '2025-12-08', 'emitido', 'Emisión Noviembre C4', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(47, 5, '2025-11', '2025-12-09', 'emitido', 'Emisión Noviembre C5', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(48, 6, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C6', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(49, 7, '2025-11', '2025-12-11', 'cerrado', 'Emisión Noviembre C7', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(50, 8, '2025-11', '2025-12-12', 'emitido', 'Emisión Noviembre C8', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(51, 9, '2025-11', '2025-12-13', 'emitido', 'Emisión Noviembre C9', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(52, 10, '2025-11', '2025-12-14', 'cerrado', 'Emisión Noviembre C10', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(53, 11, '2025-11', '2025-12-05', 'emitido', 'Emisión Noviembre C11', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(54, 12, '2025-11', '2025-12-06', 'emitido', 'Emisión Noviembre C12', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(55, 13, '2025-11', '2025-12-07', 'emitido', 'Emisión Noviembre C13', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(56, 14, '2025-11', '2025-12-08', 'emitido', 'Emisión Noviembre C14', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(57, 15, '2025-11', '2025-12-09', 'cerrado', 'Emisión Noviembre C15', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(58, 16, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C16', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(59, 17, '2025-11', '2025-12-11', 'emitido', 'Emisión Noviembre C17', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(60, 18, '2025-11', '2025-12-12', 'emitido', 'Emisión Noviembre C18', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(61, 19, '2025-11', '2025-12-13', 'cerrado', 'Emisión Noviembre C19', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(62, 20, '2025-11', '2025-12-14', 'emitido', 'Emisión Noviembre C20', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(63, 21, '2025-11', '2025-12-05', 'emitido', 'Emisión Noviembre C21', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(64, 22, '2025-11', '2025-12-06', 'cerrado', 'Emisión Noviembre C22', '2025-10-29 19:43:40', '2025-10-29 19:43:40'),
(65, 36, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C36', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(66, 46, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C46', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(67, 49, '2025-10', '2025-11-10', 'cerrado', 'Emisión Octubre C49', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(68, 40, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C40', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(69, 41, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C41', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(70, 59, '2025-10', '2025-11-10', 'cerrado', 'Emisión Octubre C59', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(71, 32, '2025-10', '2025-11-10', 'emitido', 'Emisión Octubre C32', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(72, 36, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C36', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(73, 46, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C46', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(74, 49, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C49', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(75, 40, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C40', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(76, 41, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C41', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(77, 59, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C59', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(78, 32, '2025-11', '2025-12-10', 'emitido', 'Emisión Noviembre C32', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(79, 36, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C36', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(80, 46, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C46', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(81, 49, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C49', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(82, 40, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C40', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(83, 41, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C41', '2025-10-29 19:54:00', '2025-10-29 19:54:00'),
(84, 59, '2025-12', '2026-01-10', 'borrador', 'Emisión Diciembre C59', '2025-10-29 19:54:00', '2025-10-29 19:54:00');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `emision_gasto_comun`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `emision_gasto_comun`;
CREATE TABLE `emision_gasto_comun` (
`id` bigint
,`comunidad_id` bigint
,`periodo` char(7)
,`fecha_vencimiento` date
,`estado` enum('borrador','emitido','cerrado','anulado')
,`observaciones` varchar(500)
,`created_at` datetime
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `emision_gasto_detalle`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `emision_gasto_detalle`;
CREATE TABLE `emision_gasto_detalle` (
`id` bigint
,`emision_id` bigint
,`gasto_id` bigint
,`categoria_id` bigint
,`monto` decimal(12,2)
,`regla_prorrateo` enum('coeficiente','partes_iguales','consumo','fijo_por_unidad')
,`metadata_json` longtext
,`created_at` datetime
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
(10, '', 10, 10, 10, 10, '2025-09-10', 71400.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Consumo Electricidad Común', 0, '2025-10-10 18:07:51', '2025-10-10 18:07:51'),
(21, 'G-2025-0021', 11, 21, 21, 21, '2025-10-01', 65000.00, 'pendiente', 11, NULL, 1, 0, NULL, NULL, 'Gasto de Administración Extraordinario', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 'G-2025-0022', 12, 22, 22, 22, '2025-10-02', 32000.00, 'pendiente', 12, NULL, 1, 0, NULL, NULL, 'Compra de Equipos Eléctricos', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 'G-2025-0023', 13, 23, 23, 23, '2025-10-03', 48000.00, 'pendiente', 13, NULL, 1, 0, NULL, NULL, 'Seguro de Incendio Anual', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 'G-2025-0024', 14, 24, 24, 24, '2025-10-04', 53000.00, 'pendiente', 14, NULL, 1, 0, NULL, NULL, 'Multa de Constructora por Demora', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 'G-2025-0025', 15, 25, 25, 25, '2025-10-05', 72000.00, 'pendiente', 15, NULL, 1, 0, NULL, NULL, 'Aporte a Fondo de Maquinaria', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 'G-2025-0026', 16, 26, 26, 26, '2025-10-06', 42000.00, 'pendiente', 16, NULL, 1, 0, NULL, NULL, 'Mantención Mensual de Piscina', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 'G-2025-0027', 17, 27, 27, 27, '2025-10-07', 78000.00, 'pendiente', 17, NULL, 1, 0, NULL, NULL, 'Reparación de Bomba de Ascensor', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 'G-2025-0028', 18, 28, 28, 28, '2025-10-08', 83000.00, 'pendiente', 18, NULL, 1, 0, NULL, NULL, 'Compra de Insumos para Pintura', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 'G-2025-0029', 19, 29, 29, 29, '2025-10-09', 54000.00, 'pendiente', 19, NULL, 1, 0, NULL, NULL, 'Reparación de filtración de tuberías', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 'G-2025-0030', 20, 30, 30, 30, '2025-10-10', 105000.00, 'pendiente', 20, NULL, 1, 0, NULL, NULL, 'Gasto en Publicidad para Arriendo', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 'G-2025-0031', 1, 31, 31, 31, '2025-10-11', 130900.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Compra de Equipos de Monitoreo', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 'G-2025-0032', 2, 32, 32, 32, '2025-10-12', 47600.00, 'pendiente', 2, NULL, 1, 0, NULL, NULL, 'Reparación de sensores', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 'G-2025-0033', 3, 33, 33, 33, '2025-10-13', 95200.00, 'pendiente', 3, NULL, 1, 0, NULL, NULL, 'Mantención Piscina Anual', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 'G-2025-0034', 4, 34, 34, 34, '2025-10-14', 59500.00, 'pendiente', 4, NULL, 1, 0, NULL, NULL, 'Compra de Tuberías', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 'G-2025-0035', 5, 35, 35, 35, '2025-10-15', 83300.00, 'pendiente', 5, NULL, 1, 0, NULL, NULL, 'Renovación de Licencias de Software', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 'G-2025-0036', 6, 36, 36, 36, '2025-10-16', 119000.00, 'pendiente', 6, NULL, 1, 0, NULL, NULL, 'Servicios Contables Octubre', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 'G-2025-0037', 7, 37, 37, 37, '2025-10-17', 59500.00, 'pendiente', 7, NULL, 1, 0, NULL, NULL, 'Mano de obra Recepción', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 'G-2025-0038', 8, 38, 38, 38, '2025-10-18', 89250.00, 'pendiente', 8, NULL, 1, 0, NULL, NULL, 'Compra de Ladrillos para Reparación', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 'G-2025-0039', 9, 39, 39, 39, '2025-10-19', 142800.00, 'pendiente', 9, NULL, 1, 0, NULL, NULL, 'Fee Administración Trimestral', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 'G-2025-0040', 10, 40, 40, 40, '2025-10-20', 77350.00, 'pendiente', 10, NULL, 1, 0, NULL, NULL, 'Reparación de Medidores de Gas', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 'G-41', 1, 1, 1, 1, '2025-10-01', 105000.00, 'aprobado', 1, NULL, 1, 0, NULL, NULL, 'Gasto Limpieza Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(42, 'G-42', 2, 2, 2, 2, '2025-10-02', 65000.00, 'aprobado', 2, NULL, 1, 0, NULL, NULL, 'Aporte Fondo Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(43, 'G-43', 3, 3, 3, 3, '2025-10-03', 95000.00, 'aprobado', 3, NULL, 1, 0, NULL, NULL, 'Reparación Estructural', 1, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(44, 'G-44', 4, 4, 4, 4, '2025-10-04', 40000.00, 'aprobado', 4, NULL, 1, 0, NULL, NULL, 'Compra de Insumos Jardín', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(45, 'G-45', 5, 5, 5, 5, '2025-10-05', 110000.00, 'aprobado', 5, NULL, 1, 0, NULL, NULL, 'Consumo Agua Común Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(46, 'G-46', 6, 6, 6, 6, '2025-10-06', 150000.00, 'aprobado', 6, NULL, 1, 0, NULL, NULL, 'Honorarios Legales', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(47, 'G-47', 7, 7, 7, 7, '2025-10-07', 100000.00, 'aprobado', 7, NULL, 1, 0, NULL, NULL, 'Mantención Mayor Ascensor', 1, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(48, 'G-48', 8, 8, 8, 8, '2025-10-08', 50000.00, 'aprobado', 8, NULL, 1, 0, NULL, NULL, 'Reparación de Bancas', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(49, 'G-49', 9, 9, 9, 9, '2025-10-09', 185000.00, 'aprobado', 9, NULL, 1, 0, NULL, NULL, 'Fee Administración Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(50, 'G-50', 10, 10, 10, 10, '2025-10-10', 75000.00, 'aprobado', 10, NULL, 1, 0, NULL, NULL, 'Consumo Electricidad Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(51, 'G-51', 11, 11, 11, 11, '2025-10-11', 115000.00, 'aprobado', 11, NULL, 1, 0, NULL, NULL, 'Mantención Anual Piscina', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(52, 'G-52', 12, 12, 12, 12, '2025-10-12', 70000.00, 'aprobado', 12, NULL, 1, 0, NULL, NULL, 'Compra de Cámaras HD', 1, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(53, 'G-53', 13, 13, 13, 13, '2025-10-13', 105000.00, 'aprobado', 13, NULL, 1, 0, NULL, NULL, 'Consumo Agua Común Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(54, 'G-54', 14, 14, 14, 14, '2025-10-14', 55000.00, 'aprobado', 14, NULL, 1, 0, NULL, NULL, 'Aporte Fondo Reserva Talca', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(55, 'G-55', 15, 15, 15, 15, '2025-10-15', 125000.00, 'aprobado', 15, NULL, 1, 0, NULL, NULL, 'Gasto Electricidad Común', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(56, 'G-56', 16, 16, 16, 16, '2025-10-16', 80000.00, 'aprobado', 16, NULL, 1, 0, NULL, NULL, 'Reparación de Calefacción', 1, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(57, 'G-57', 17, 17, 17, 17, '2025-10-17', 55000.00, 'aprobado', 17, NULL, 1, 0, NULL, NULL, 'Servicio de Internet Octubre', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(58, 'G-58', 18, 18, 18, 18, '2025-10-18', 150000.00, 'aprobado', 18, NULL, 1, 0, NULL, NULL, 'Pintura Fachada Torre C', 1, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(59, 'G-59', 19, 19, 19, 19, '2025-10-19', 60000.00, 'aprobado', 19, NULL, 1, 0, NULL, NULL, 'Aporte Fondo Imprevistos', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(60, 'G-60', 20, 20, 20, 20, '2025-10-20', 90000.00, 'aprobado', 20, NULL, 1, 0, NULL, NULL, 'Gasto Conserjería Nocturna', 0, '2025-10-23 16:06:00', '2025-10-23 16:06:00'),
(61, 'G-2025-0061', 1, 11, 11, 31, '2025-10-25', 85000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Mantención Ascensor Torre 1 Oct', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(62, 'G-2025-0062', 1, 1, 1, 32, '2025-10-26', 120000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Servicio Aseo General Octubre', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(63, 'G-2025-0063', 2, 12, 12, 33, '2025-10-27', 45000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Reparación Cámara Entrada Sur', 1, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(64, 'G-2025-0064', 2, 2, 2, 34, '2025-10-28', 60000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Aporte Fondo Reserva Octubre', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(65, 'G-2025-0065', 3, 13, 13, 35, '2025-10-29', 55000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Consumo Agua Común Octubre', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(66, 'G-2025-0066', 3, 3, 3, 36, '2025-10-30', 95000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Pintura Fachada Torre B', 1, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(67, 'G-2025-0067', 1, 6, 6, 37, '2025-11-01', 15000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Seguro Espacios Comunes Nov', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(68, 'G-2025-0068', 2, 9, 9, 38, '2025-11-02', 180000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Honorarios Administración Oct', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(69, 'G-2025-0069', 3, 20, 20, 39, '2025-11-03', 210000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Sueldos Conserjería Octubre', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(70, 'G-2025-0070', 1, 17, 17, 40, '2025-11-04', 35000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Internet Áreas Comunes Nov', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(71, 'G-2025-0071', 1, 26, 26, NULL, '2025-11-05', 48000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Químicos Piscina Temperada', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(72, 'G-2025-0072', 2, 32, 32, NULL, '2025-11-06', 75000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Consumo Agua Unidades Oct (Factura Aguas Andinas)', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(73, 'G-2025-0073', 3, 22, 22, NULL, '2025-11-07', 92000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Consumo Gas Unidades Oct (Factura Metrogas)', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(74, 'G-2025-0074', 1, 34, 34, NULL, '2025-11-08', 25000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Gastos de Oficina Administración', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(75, 'G-2025-0075', 2, 35, 35, NULL, '2025-11-09', 60000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Contratación personal aseo evento', 1, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(76, 'G-2025-0076', 3, 37, 37, NULL, '2025-11-10', 30000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Insumos Recepción (café, azúcar)', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(77, 'G-2025-0077', 1, 1, 1, NULL, '2025-11-11', 115000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Servicio Aseo General Noviembre', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(78, 'G-2025-0078', 2, 2, 2, NULL, '2025-11-12', 61000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Aporte Fondo Reserva Noviembre', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(79, 'G-2025-0079', 3, 3, 3, NULL, '2025-11-13', 95000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Pintura Fachada Torre B (Pago Final)', 1, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(80, 'G-2025-0080', 1, 11, 11, NULL, '2025-11-14', 88000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Mantención Ascensor Torre 2 Nov', 0, '2025-10-29 19:26:28', '2025-10-29 19:26:28'),
(81, 'G-2025-0081', 1, 1, 1, NULL, '2025-11-15', 125000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Servicio Aseo General Noviembre Extra', 1, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(82, 'G-2025-0082', 2, 2, 2, NULL, '2025-11-16', 62000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Aporte Fondo Reserva Noviembre', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(83, 'G-2025-0083', 3, 3, 3, NULL, '2025-11-17', 50000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Reparación techo Gimnasio', 1, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(84, 'G-2025-0084', 1, 11, 11, NULL, '2025-11-18', 87000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Mantención Ascensor T1 Nov', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(85, 'G-2025-0085', 2, 12, 12, NULL, '2025-11-19', 48000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Reemplazo Focos Padel', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(86, 'G-2025-0086', 3, 13, 13, NULL, '2025-11-20', 58000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Consumo Agua Común Noviembre', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(87, 'G-2025-0087', 1, 6, 6, NULL, '2025-11-21', 16000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Seguro Espacios Comunes Dic', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(88, 'G-2025-0088', 2, 9, 9, NULL, '2025-11-22', 182000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Honorarios Administración Nov', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(89, 'G-2025-0089', 3, 20, 20, NULL, '2025-11-23', 215000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Sueldos Conserjería Noviembre', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(90, 'G-2025-0090', 1, 17, 17, NULL, '2025-11-24', 36000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Internet Áreas Comunes Dic', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(91, 'G-2025-0091', 1, 26, 26, NULL, '2025-11-25', 49500.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Cloro y alguicida Piscina', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(92, 'G-2025-0092', 2, 32, 32, NULL, '2025-11-26', 78000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Consumo Agua Unidades Nov (Factura)', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(93, 'G-2025-0093', 3, 22, 22, NULL, '2025-11-27', 95000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Consumo Gas Unidades Nov (Factura)', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(94, 'G-2025-0094', 1, 34, 34, NULL, '2025-11-28', 27000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Artículos de Librería Oficina', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(95, 'G-2025-0095', 2, 35, 35, NULL, '2025-11-29', 63000.00, 'aprobado', 1, 2, 1, 0, NULL, NULL, 'Personal aseo evento (Pago)', 1, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(96, 'G-2025-0096', 3, 37, 37, NULL, '2025-11-30', 32000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Uniformes Conserjería', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(97, 'G-2025-0097', 1, 1, 1, NULL, '2025-12-01', 130000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Servicio Aseo General Diciembre', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(98, 'G-2025-0098', 2, 2, 2, NULL, '2025-12-02', 63000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Aporte Fondo Reserva Diciembre', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(99, 'G-2025-0099', 3, 3, 3, NULL, '2025-12-03', 51000.00, 'aprobado', 1, 3, 1, 0, NULL, NULL, 'Reparación techo Gimnasio (Pago)', 1, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(100, 'G-2025-0100', 1, 11, 11, NULL, '2025-12-04', 89000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Mantención Ascensor T2 Dic', 0, '2025-10-29 19:39:20', '2025-10-29 19:39:20'),
(101, 'G-2025-0101', 4, 4, 4, NULL, '2025-11-15', 38000.00, 'aprobado', 4, 4, 1, 0, NULL, NULL, 'Compra Fertilizante Loteo Maipu', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(102, 'G-2025-0102', 5, 5, 5, NULL, '2025-11-16', 110000.00, 'aprobado', 5, 5, 1, 0, NULL, NULL, 'Reparación Luminaria Parque Central', 1, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(103, 'G-2025-0103', 6, 6, 6, NULL, '2025-11-17', 145000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Honorarios Contables Nov', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(104, 'G-2025-0104', 7, 7, 7, NULL, '2025-11-18', 97000.00, 'aprobado', 7, 7, 1, 0, NULL, NULL, 'Mantención Ascensores Metro Stgo Nov', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(105, 'G-2025-0105', 8, 8, 8, NULL, '2025-11-19', 49000.00, 'aprobado', 8, 8, 1, 0, NULL, NULL, 'Compra Pintura Pasillos Portal Florida', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(106, 'G-2025-0106', 9, 9, 9, NULL, '2025-11-20', 180000.00, 'aprobado', 9, 9, 1, 0, NULL, NULL, 'Fee Administración Quilpué Nov', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(107, 'G-2025-0107', 10, 10, 10, NULL, '2025-11-21', 73000.00, 'aprobado', 10, 10, 1, 0, NULL, NULL, 'Consumo Electricidad San Miguel Nov', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(108, 'G-2025-0108', 11, 11, 11, NULL, '2025-11-22', 86000.00, 'aprobado', 11, 11, 1, 0, NULL, NULL, 'Mantención Piscina Tobalaba', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(109, 'G-2025-0109', 12, 12, 12, NULL, '2025-11-23', 68000.00, 'aprobado', 12, 12, 1, 0, NULL, NULL, 'Compra Cámaras Vigilancia Quilín', 1, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(110, 'G-2025-0110', 13, 13, 13, NULL, '2025-11-24', 108000.00, 'aprobado', 13, 13, 1, 0, NULL, NULL, 'Consumo Agua Los Aromos Nov', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(111, 'G-2025-0111', 14, 14, 14, NULL, '2025-11-25', 56000.00, 'aprobado', 14, 14, 1, 0, NULL, NULL, 'Aporte Fondo Reserva Colina', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(112, 'G-2025-0112', 15, 15, 15, NULL, '2025-11-26', 128000.00, 'aprobado', 15, 15, 1, 0, NULL, NULL, 'Consumo Electricidad Plaza Independencia', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(113, 'G-2025-0113', 16, 16, 16, NULL, '2025-11-27', 82000.00, 'aprobado', 16, 16, 1, 0, NULL, NULL, 'Reparación Calefacción Mar Egeo', 1, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(114, 'G-2025-0114', 17, 17, 17, NULL, '2025-11-28', 57000.00, 'aprobado', 17, 17, 1, 0, NULL, NULL, 'Internet Los Naranjos Dic', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(115, 'G-2025-0115', 18, 18, 18, NULL, '2025-11-29', 155000.00, 'aprobado', 18, 18, 1, 0, NULL, NULL, 'Pintura Portal Ñuñoa Sur', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(116, 'G-2025-0116', 19, 19, 19, NULL, '2025-11-30', 62000.00, 'aprobado', 19, 19, 1, 0, NULL, NULL, 'Fondo Imprevistos Los Alerces', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(117, 'G-2025-0117', 20, 20, 20, NULL, '2025-12-01', 93000.00, 'pendiente', 20, NULL, 1, 0, NULL, NULL, 'Conserjería El Bosque Nov', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(118, 'G-2025-0118', 21, 21, 21, NULL, '2025-12-02', 67000.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'Admin Extra Lo Barnechea Nov', 1, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(119, 'G-2025-0119', 22, 22, 22, NULL, '2025-12-03', 34000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Equipos Eléctricos San Pedro', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(120, 'G-2025-0120', 23, 23, 23, NULL, '2025-12-04', 50000.00, 'aprobado', 1, 1, 1, 0, NULL, NULL, 'Seguro Incendio Jardín del Mar', 0, '2025-10-29 19:43:42', '2025-10-29 19:43:42'),
(121, 'G-2025-0121', 36, 36, 36, NULL, '2025-11-15', 120000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Consumo Gas Central Bosque Nativo Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(122, 'G-2025-0122', 46, 26, 26, NULL, '2025-11-16', 45000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Mantención Piscina Chillán Viejo', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(123, 'G-2025-0123', 49, 1, 1, NULL, '2025-11-17', 130000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Aseo El Bosque La Florida Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(124, 'G-2025-0124', 40, 40, 40, NULL, '2025-11-18', 60000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Fondo Mantención La Dehesa', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(125, 'G-2025-0125', 41, 9, 9, NULL, '2025-11-19', 190000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Admin La Reina Alta Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(126, 'G-2025-0126', 59, 20, 20, NULL, '2025-11-20', 100000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Conserjería La Serena Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(127, 'G-2025-0127', 32, 32, 32, NULL, '2025-11-21', 50000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Consumo Agua Unidades Las Acacias Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(128, 'G-2025-0128', 36, 16, 16, NULL, '2025-11-22', 85000.00, 'pendiente', 6, NULL, 1, 0, NULL, NULL, 'Remodelación Quincho Bosque Nativo', 1, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(129, 'G-2025-0129', 46, 7, 7, NULL, '2025-11-23', 98000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Reparación Ascensor Chillán', 1, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(130, 'G-2025-0130', 49, 17, 17, NULL, '2025-11-24', 40000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Internet Común El Bosque La Florida Dic', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(131, 'G-2025-0131', 40, 23, 23, NULL, '2025-11-25', 18000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Seguro Incendio La Dehesa', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(132, 'G-2025-0132', 41, 31, 31, NULL, '2025-11-26', 75000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Compra Cámaras Seguridad La Reina', 1, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(133, 'G-2025-0133', 59, 11, 11, NULL, '2025-11-27', 90000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Mantención Ascensores La Serena Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(134, 'G-2025-0134', 32, 2, 2, NULL, '2025-11-28', 55000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Fondo Reserva Las Acacias Nov', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(135, 'G-2025-0135', 36, 1, 1, NULL, '2025-11-29', 110000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Aseo Bosque Nativo Nov Extra', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(136, 'G-2025-0136', 46, 26, 26, NULL, '2025-11-30', 47000.00, 'aprobado', 6, 6, 1, 0, NULL, NULL, 'Mantención Piscina Chillán Nov Extra', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(137, 'G-2025-0137', 49, 1, 1, NULL, '2025-12-01', 135000.00, 'pendiente', 6, NULL, 1, 0, NULL, NULL, 'Aseo El Bosque La Florida Dic', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(138, 'G-2025-0138', 40, 40, 40, NULL, '2025-12-02', 62000.00, 'pendiente', 6, NULL, 1, 0, NULL, NULL, 'Fondo Mantención La Dehesa Dic', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(139, 'G-2025-0139', 41, 9, 9, NULL, '2025-12-03', 195000.00, 'pendiente', 6, NULL, 1, 0, NULL, NULL, 'Admin La Reina Alta Dic', 0, '2025-10-29 19:54:03', '2025-10-29 19:54:03'),
(140, 'G-2025-0140', 59, 20, 20, NULL, '2025-12-04', 105000.00, 'aprobado', 6, 1, 1, 1, NULL, NULL, 'Conserjería La Serena Dic', 0, '2025-10-29 19:54:03', '2025-11-08 00:46:12'),
(141, 'G1762833068435-5', 5, 5, 35, NULL, '2025-11-11', 7852.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'REFERENCES gasto(id);', 0, '2025-11-11 03:51:08', '2025-11-11 03:51:08'),
(142, 'G1762833140750-36', 36, 13, 13, NULL, '2025-11-11', 452452.00, 'aprobado', 1, 1, 1, 1, NULL, NULL, 'REFERENCES gasto(id);', 0, '2025-11-11 03:52:20', '2025-11-11 03:52:26'),
(143, 'G1762833170361-12', 12, 14, 9, NULL, '2025-11-11', 45242.00, 'pendiente', 1, NULL, 1, 0, NULL, NULL, 'REFERENCES gasto(id);', 0, '2025-11-11 03:52:50', '2025-11-11 03:52:50');

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

--
-- Volcado de datos para la tabla `gasto_aprobacion`
--

INSERT INTO `gasto_aprobacion` (`id`, `gasto_id`, `usuario_id`, `rol_id`, `accion`, `observaciones`, `created_at`) VALUES
(21, 21, 11, 2, 'aprobar', 'Aprobado por administración C11', '2025-10-23 16:35:00'),
(22, 22, 12, 8, 'aprobar', 'Aprobado por inquilino C12', '2025-10-23 16:35:00'),
(23, 23, 13, 6, 'aprobar', 'Aprobado por residente C13', '2025-10-23 16:35:00'),
(24, 24, 14, 7, 'aprobar', 'Aprobado por propietario C14', '2025-10-23 16:35:00'),
(25, 25, 15, 2, 'aprobar', 'Aprobado por admin C15', '2025-10-23 16:35:00'),
(26, 26, 16, 3, 'aprobar', 'Aprobado por conserje C16', '2025-10-23 16:35:00'),
(27, 27, 17, 6, 'aprobar', 'Aprobado por residente C17', '2025-10-23 16:35:00'),
(28, 28, 18, 10, 'aprobar', 'Aprobado por presidente C18', '2025-10-23 16:35:00'),
(29, 29, 19, 4, 'aprobar', 'Aprobado por contador C19', '2025-10-23 16:35:00'),
(30, 30, 20, 9, 'aprobar', 'Aprobado por tesorero C20', '2025-10-23 16:35:00'),
(31, 31, 1, 1, 'aprobar', 'Aprobado Super Admin', '2025-10-23 16:35:00'),
(32, 32, 2, 2, 'aprobar', 'Aprobado por Admin Comunidad', '2025-10-23 16:35:00'),
(33, 33, 3, 6, 'aprobar', 'Aprobado por Residente', '2025-10-23 16:35:00'),
(34, 34, 4, 7, 'aprobar', 'Aprobado por Propietario', '2025-10-23 16:35:00'),
(35, 35, 5, 2, 'aprobar', 'Aprobado por Admin Comunidad', '2025-10-23 16:35:00'),
(36, 36, 6, 3, 'aprobar', 'Aprobado por Conserje', '2025-10-23 16:35:00'),
(37, 37, 7, 6, 'aprobar', 'Aprobado por Residente', '2025-10-23 16:35:00'),
(38, 38, 8, 10, 'aprobar', 'Aprobado por Presidente Comité', '2025-10-23 16:35:00'),
(39, 39, 9, 4, 'aprobar', 'Aprobado por Contador', '2025-10-23 16:35:00'),
(40, 40, 10, 9, 'aprobar', 'Aprobado por Tesorero', '2025-10-23 16:35:00'),
(41, 140, 1, 1, 'aprobar', 'Aprobado', '2025-11-08 00:46:12'),
(42, 142, 1, 1, 'aprobar', 'Aprobado', '2025-11-11 03:52:26');

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

--
-- Volcado de datos para la tabla `historial_gasto`
--

INSERT INTO `historial_gasto` (`id`, `gasto_id`, `usuario_id`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `created_at`) VALUES
(21, 21, 11, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(22, 22, 12, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(23, 23, 13, 'monto', '48000.00', '50000.00', '2025-10-23 16:35:00'),
(24, 24, 14, 'glosa', 'Multa de Constructora por Demora', 'Multa por entrega tardía', '2025-10-23 16:35:00'),
(25, 25, 15, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(26, 26, 16, 'centro_costo_id', '26', '11', '2025-10-23 16:35:00'),
(27, 27, 17, 'extraordinario', '1', '1', '2025-10-23 16:35:00'),
(28, 28, 18, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(29, 29, 19, 'monto', '54000.00', '55000.00', '2025-10-23 16:35:00'),
(30, 30, 20, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(31, 31, 1, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(32, 32, 2, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(33, 33, 3, 'monto', '95200.00', '96000.00', '2025-10-23 16:35:00'),
(34, 34, 4, 'glosa', 'Compra de Tuberías', 'Compra de Tuberías de Cobre', '2025-10-23 16:35:00'),
(35, 35, 5, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(36, 36, 6, 'centro_costo_id', '36', '6', '2025-10-23 16:35:00'),
(37, 37, 7, 'extraordinario', '0', '0', '2025-10-23 16:35:00'),
(38, 38, 8, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00'),
(39, 39, 9, 'monto', '142800.00', '145000.00', '2025-10-23 16:35:00'),
(40, 40, 10, 'estado', 'pendiente', 'aprobado', '2025-10-23 16:35:00');

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
(10, 10, '2025-09-30', 44.900, '2025-09', '2025-10-10 18:07:58', '2025-10-10 18:07:58', NULL, NULL, NULL, NULL, 'validated'),
(11, 1, '2025-10-31', 51.500, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(12, 2, '2025-10-31', 122.500, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(13, 3, '2025-10-31', 92.200, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(14, 4, '2025-10-31', 67.900, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(15, 5, '2025-10-31', 152.100, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(16, 6, '2025-10-31', 90.800, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(17, 7, '2025-10-31', 107.300, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(18, 8, '2025-10-31', 132.500, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(19, 9, '2025-10-31', 77.700, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(20, 10, '2025-10-31', 46.000, '2025-10', '2025-10-23 16:30:00', '2025-10-23 16:30:00', 6, 'manual', NULL, NULL, 'validated'),
(21, 11, '2025-09-30', 40.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(22, 12, '2025-09-30', 100.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(23, 13, '2025-09-30', 70.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(24, 14, '2025-09-30', 50.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(25, 15, '2025-09-30', 130.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(26, 16, '2025-09-30', 80.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(27, 17, '2025-09-30', 95.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(28, 18, '2025-09-30', 120.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(29, 19, '2025-09-30', 60.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(30, 20, '2025-09-30', 40.000, '2025-09', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', NULL, NULL, 'validated'),
(31, 11, '2025-10-31', 41.500, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(32, 12, '2025-10-31', 101.800, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(33, 13, '2025-10-31', 71.200, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(34, 14, '2025-10-31', 51.700, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(35, 15, '2025-10-31', 132.300, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(36, 16, '2025-10-31', 81.500, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(37, 17, '2025-10-31', 97.100, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(38, 18, '2025-10-31', 121.900, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(39, 19, '2025-10-31', 60.800, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(40, 20, '2025-10-31', 42.100, '2025-10', '2025-10-23 16:35:00', '2025-10-23 16:35:00', 6, 'manual', 'Lectura Octubre', NULL, 'validated'),
(61, 1, '2025-11-30', 60.150, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(62, 2, '2025-11-30', 133.500, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(63, 3, '2025-11-30', 102.800, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(64, 11, '2025-11-30', 48.900, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(65, 12, '2025-11-30', 115.200, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(66, 13, '2025-11-30', 81.700, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(67, 21, '2025-11-30', 45.300, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(68, 22, '2025-11-30', 110.100, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(69, 23, '2025-11-30', 78.500, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(70, 31, '2025-11-30', 47.000, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(71, 32, '2025-11-30', 118.300, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(72, 33, '2025-11-30', 85.400, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(73, 4, '2025-11-30', 75.800, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(74, 5, '2025-11-30', 162.900, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(75, 6, '2025-11-30', 99.100, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(76, 14, '2025-11-30', 57.500, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(77, 15, '2025-11-30', 143.200, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(78, 16, '2025-11-30', 88.000, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(79, 24, '2025-11-30', 58.700, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(80, 25, '2025-11-30', 140.500, '2025-11', '2025-10-29 19:39:22', '2025-10-29 19:39:22', 6, NULL, NULL, NULL, 'validated'),
(81, 17, '2025-11-30', 101.500, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(82, 18, '2025-11-30', 126.800, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(83, 19, '2025-11-30', 63.400, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(84, 20, '2025-11-30', 44.900, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(85, 26, '2025-11-30', 84.700, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(86, 27, '2025-11-30', 100.300, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(87, 28, '2025-11-30', 125.600, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(88, 29, '2025-11-30', 64.100, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(89, 30, '2025-11-30', 43.500, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(90, 34, '2025-11-30', 55.200, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(91, 35, '2025-11-30', 137.800, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(92, 36, '2025-11-30', 88.900, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(93, 37, '2025-11-30', 99.400, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(94, 38, '2025-11-30', 124.700, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(95, 39, '2025-11-30', 62.000, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(96, 40, '2025-11-30', 45.300, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(97, 7, '2025-11-30', 111.900, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(98, 8, '2025-11-30', 137.200, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(99, 9, '2025-11-30', 80.500, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated'),
(100, 10, '2025-11-30', 48.600, '2025-11', '2025-10-29 19:43:45', '2025-10-29 19:43:45', 6, NULL, NULL, NULL, 'validated');

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
(10, 9, 9, 'agua', 'AGUA-105-C9', 0, '2025-10-10 18:07:56', '2025-10-10 18:07:56', NULL, NULL, NULL, 'activo', NULL, 1, NULL),
(11, 1, 2, 'agua', 'AGUA-201', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-011', 'MarcaA', 'Mod1', 'activo', NULL, 1, 1),
(12, 2, 3, 'electricidad', 'ELEC-305', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-012', 'MarcaB', 'Mod2', 'activo', NULL, 1, 1),
(13, 3, 4, 'gas', 'GAS-402', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-013', 'MarcaC', 'Mod3', 'activo', NULL, 1, 1),
(14, 4, 5, 'agua', 'AGUA-CASA-A', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-014', 'MarcaD', 'Mod4', 'activo', NULL, 1, 1),
(15, 5, 6, 'electricidad', 'ELEC-501', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-015', 'MarcaE', 'Mod5', 'activo', NULL, 1, 1),
(16, 6, 7, 'gas', 'GAS-1001', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-016', 'MarcaF', 'Mod6', 'activo', NULL, 1, 1),
(17, 7, 8, 'agua', 'AGUA-1502', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-017', 'MarcaG', 'Mod7', 'activo', NULL, 1, 1),
(18, 8, 9, 'electricidad', 'ELEC-105', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-018', 'MarcaH', 'Mod8', 'activo', NULL, 1, 1),
(19, 9, 10, 'gas', 'GAS-201-C9', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-019', 'MarcaI', 'Mod9', 'activo', NULL, 1, 1),
(20, 10, 10, 'electricidad', 'ELEC-202', 0, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 'S-020', 'MarcaJ', 'Mod10', 'activo', NULL, 1, 1),
(21, 11, 11, 'agua', 'AGUA-102', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-021', 'MarcaK', 'Mod11', 'activo', NULL, 1, 11),
(22, 12, 13, 'electricidad', 'ELEC-306', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-022', 'MarcaL', 'Mod12', 'activo', NULL, 1, 12),
(23, 13, 14, 'gas', 'GAS-403', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-023', 'MarcaM', 'Mod13', 'activo', NULL, 1, 13),
(24, 14, 15, 'agua', 'AGUA-CASA-B', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-024', 'MarcaN', 'Mod14', 'activo', NULL, 1, 14),
(25, 15, 16, 'electricidad', 'ELEC-502', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-025', 'MarcaO', 'Mod15', 'activo', NULL, 1, 15),
(26, 16, 17, 'gas', 'GAS-1002', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-026', 'MarcaP', 'Mod16', 'activo', NULL, 1, 16),
(27, 17, 18, 'agua', 'AGUA-1501', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-027', 'MarcaQ', 'Mod17', 'activo', NULL, 1, 17),
(28, 18, 19, 'electricidad', 'ELEC-106', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-028', 'MarcaR', 'Mod18', 'activo', NULL, 1, 18),
(29, 19, 20, 'gas', 'GAS-202-C9', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-029', 'MarcaS', 'Mod19', 'activo', NULL, 1, 19),
(30, 20, 20, 'electricidad', 'ELEC-203', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-030', 'MarcaT', 'Mod20', 'activo', NULL, 1, 20),
(31, 1, 11, 'gas', 'GAS-102', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-031', 'MarcaU', 'Mod21', 'activo', NULL, 1, 1),
(32, 2, 13, 'agua', 'AGUA-306', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-032', 'MarcaV', 'Mod22', 'activo', NULL, 1, 2),
(33, 3, 14, 'electricidad', 'ELEC-403', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-033', 'MarcaW', 'Mod23', 'activo', NULL, 1, 3),
(34, 4, 15, 'gas', 'GAS-CASA-B', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-034', 'MarcaX', 'Mod24', 'activo', NULL, 1, 4),
(35, 5, 16, 'agua', 'AGUA-502', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-035', 'MarcaY', 'Mod25', 'activo', NULL, 1, 5),
(36, 6, 17, 'electricidad', 'ELEC-1002', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-036', 'MarcaZ', 'Mod26', 'activo', NULL, 1, 6),
(37, 7, 18, 'gas', 'GAS-1501', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-037', 'MarcaAB', 'Mod27', 'activo', NULL, 1, 7),
(38, 8, 19, 'agua', 'AGUA-106', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-038', 'MarcaCD', 'Mod28', 'activo', NULL, 1, 8),
(39, 9, 20, 'electricidad', 'ELEC-201-C9', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-039', 'MarcaEF', 'Mod29', 'activo', NULL, 1, 9),
(40, 10, 10, 'gas', 'GAS-202', 0, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 'S-040', 'MarcaGH', 'Mod30', 'activo', NULL, 1, 10);

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
  `fecha_pago` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `anulado_por` bigint DEFAULT NULL COMMENT 'Usuario que anuló la multa',
  `motivo_anulacion` varchar(500) DEFAULT NULL COMMENT 'Motivo de la anulación',
  `fecha_anulacion` datetime DEFAULT NULL COMMENT 'Fecha y hora de la anulación',
  `pagado_por` bigint DEFAULT NULL COMMENT 'Usuario que registró el pago',
  `tipo_infraccion_id` bigint DEFAULT NULL,
  `fecha_vencimiento` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multa`
--

INSERT INTO `multa` (`id`, `numero`, `comunidad_id`, `unidad_id`, `persona_id`, `motivo`, `descripcion`, `monto`, `estado`, `prioridad`, `creada_por`, `aprobada_por`, `fecha_aprobacion`, `fecha`, `fecha_pago`, `created_at`, `updated_at`, `anulado_por`, `motivo_anulacion`, `fecha_anulacion`, `pagado_por`, `tipo_infraccion_id`, `fecha_vencimiento`) VALUES
(1, 'M-2025-0001', 1, 1, 1, 'Mascota sin correa', 'Infracción por mascota sin correa en áreas comunes.', 5000.00, 'pagado', 'media', 1, NULL, NULL, '2025-11-20', '2025-09-01 00:00:00', '2025-09-25 20:00:00', '2025-10-16 04:17:35', 1, NULL, '2025-10-01 00:45:06', NULL, NULL, NULL),
(2, 'M-2025-0002', 2, 3, 3, 'Ruido excesivo', 'Ruido excesivo generado por fiestas nocturnas.', 15000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-02', '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-17 01:29:55', NULL, NULL, NULL, 1, NULL, NULL),
(3, 'M-2025-0003', 3, 4, 4, 'Bloqueo de acceso', 'Bloqueo de acceso vehicular sin autorización.', 10000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-03', '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-16 05:14:42', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'M-2025-0004', 4, 5, 5, 'Fumar en áreas comunes', 'Fumar en áreas comunes del edificio.', 20000.00, 'apelada', 'media', 1, NULL, NULL, '2025-09-04', '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-17 01:06:55', 1, 'Error en la emisión', '2025-10-14 14:00:00', NULL, NULL, NULL),
(5, 'M-2025-0005', 5, 6, 6, 'Daño a propiedad común', 'Daño a propiedad común (pintura en pared).', 30000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-05', '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-16 05:07:33', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'M-2025-0006', 6, 7, 7, 'Mascota peligrosa sin bozal', 'Mascota peligrosa sin bozal en espacios públicos.', 12000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-06', '2025-10-16 11:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 1, NULL, NULL),
(7, 'M-2025-0007', 7, 8, 8, 'Uso no autorizado de ascensor', 'Uso no autorizado del ascensor de servicio.', 8000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-09-07', NULL, '2025-10-10 18:10:15', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'M-2025-0008', 8, 9, 9, 'Dejar basura en pasillo', 'Dejar basura en pasillo común.', 6000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-08', '2025-10-17 12:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 1, NULL, NULL),
(9, 'M-2025-0009', 9, 10, 10, 'Instalación de antena sin permiso', 'Instalación de antena sin permiso administrativo.', 25000.00, 'apelada', 'media', 1, NULL, NULL, '2025-09-09', NULL, '2025-10-10 18:10:15', '2025-10-16 05:38:29', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'M-2025-0010', 10, 10, 10, 'Fiesta hasta tarde', 'Fiesta hasta tarde generando molestias.', 18000.00, 'pagado', 'media', 1, NULL, NULL, '2025-09-10', '2025-10-18 13:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 1, NULL, NULL),
(11, 'M-2025-0011', 1, 1, 1, 'Uso de quincho fuera de horario', 'Usó el quincho después de las 23:00 hrs.', 15000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-09-11', NULL, '2025-10-10 18:10:15', '2025-10-10 18:10:15', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'M-2025-0012', 2, 3, 3, 'Estacionamiento indebido', 'Vehículo estacionado en zona no permitida.', 8000.00, 'pagado', 'baja', 6, NULL, NULL, '2025-09-12', '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-17 01:29:55', NULL, NULL, NULL, 3, NULL, NULL),
(13, 'M-2025-0013', 3, 4, 4, 'Desperdicio de agua', 'Se dejó llave abierta en zona común.', 10000.00, 'anulada', 'alta', 6, NULL, NULL, '2025-09-13', NULL, '2025-10-10 18:10:15', '2025-10-16 05:14:42', 1, 'Error de identificación de unidad', '2025-10-15 12:00:00', NULL, NULL, NULL),
(14, 'M-2025-0014', 4, 5, 5, 'Incumplimiento reglamento basura', 'Dejar bolsas de basura en el pasillo por más de 1 hr.', 5000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-09-14', NULL, '2025-10-10 18:10:15', '2025-10-17 01:06:55', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'M-2025-0015', 5, 6, 6, 'Ruidos en Cowork', 'Llamada telefónica con volumen alto en sala Cowork.', 12000.00, 'pagado', 'media', 6, NULL, NULL, '2025-09-15', '2025-10-16 00:00:00', '2025-10-10 18:10:15', '2025-10-16 05:07:33', NULL, NULL, NULL, 6, NULL, NULL),
(16, 'M-2025-0016', 6, 7, 7, 'Uso de amenidad sin reserva', 'Uso de sala de cine sin reserva previa.', 10000.00, 'apelada', 'media', 6, NULL, NULL, '2025-09-16', NULL, '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'M-2025-0017', 7, 8, 8, 'Instalación de toldo no permitido', 'Instalación de un toldo en balcón sin permiso.', 20000.00, 'pendiente', 'alta', 6, NULL, NULL, '2025-09-17', NULL, '2025-10-10 18:10:15', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL, NULL),
(18, 'M-2025-0018', 8, 9, 9, 'Modificación de fachada', 'Cambio de color de cortinas exteriores.', 15000.00, 'pagado', 'baja', 6, NULL, NULL, '2025-09-18', '2025-10-17 12:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 9, NULL, NULL),
(19, 'M-2025-0019', 9, 10, 10, 'Uso de Salón de Yoga con comida', 'Consumir alimentos dentro del Salón de Yoga.', 5000.00, 'pendiente', 'media', 6, NULL, NULL, '2025-09-19', NULL, '2025-10-10 18:10:15', '2025-10-16 05:38:29', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'M-2025-0020', 10, 10, 10, 'Obstrucción de acceso de emergencia', 'Dejar bicicleta en el pasillo de emergencia.', 18000.00, 'pagado', 'critica', 6, NULL, NULL, '2025-09-20', '2025-10-18 13:00:00', '2025-10-10 18:10:15', '2025-10-15 03:48:34', NULL, NULL, NULL, 10, NULL, NULL),
(21, 'M-2025-0021', 11, 11, 11, 'Estacionar en zona prohibida', 'Vehículo en estacionamiento de visitas por más de 12 hrs.', 10000.00, 'pendiente', 'media', 11, NULL, NULL, '2025-09-21', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'M-2025-0022', 12, 13, 13, 'Ruido de construcción', 'Ruido de martillo después de las 18:00 hrs.', 8000.00, 'pagado', 'media', 12, NULL, NULL, '2025-09-22', '2025-10-22 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 13, NULL, NULL),
(23, 'M-2025-0023', 13, 14, 14, 'No usar pulsera en piscina', 'Uso de piscina sin identificación de residente.', 5000.00, 'pendiente', 'baja', 13, NULL, NULL, '2025-09-23', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'M-2025-0024', 14, 15, 15, 'Basura voluminosa', 'Dejar sillón viejo en área de basura común.', 15000.00, 'apelada', 'alta', 14, NULL, NULL, '2025-09-24', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(25, 'M-2025-0025', 15, 16, 16, 'Mascota sin permiso', 'Tener mascota sin registro administrativo.', 10000.00, 'pagado', 'media', 15, NULL, NULL, '2025-09-25', '2025-10-21 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 16, NULL, NULL),
(26, 'M-2025-0026', 16, 17, 17, 'Uso de asadera no permitido', 'Usar parrilla a carbón en balcón.', 20000.00, 'pendiente', 'critica', 16, NULL, NULL, '2025-09-26', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(27, 'M-2025-0027', 17, 18, 18, 'Obstrucción de pasillo', 'Cajas de mudanza en pasillo de emergencia.', 8000.00, 'pagado', 'alta', 17, NULL, NULL, '2025-09-27', '2025-10-20 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 18, NULL, NULL),
(28, 'M-2025-0028', 18, 19, 19, 'Mala disposición de escombros', 'Dejar escombros fuera del contenedor autorizado.', 12000.00, 'pendiente', 'media', 18, NULL, NULL, '2025-09-28', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(29, 'M-2025-0029', 19, 20, 20, 'Ruido de motor en la noche', 'Motor de auto encendido por largo tiempo en la noche.', 10000.00, 'anulada', 'media', 19, NULL, NULL, '2025-09-29', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 1, 'Error de registro de unidad', '2025-10-23 10:00:00', NULL, NULL, NULL),
(30, 'M-2025-0030', 20, 20, 20, 'Fiesta en zona común no autorizada', 'Uso de Terraza Panorámica sin permiso.', 30000.00, 'pagado', 'critica', 20, NULL, NULL, '2025-09-30', '2025-10-19 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 20, NULL, NULL),
(31, 'M-2025-0031', 1, 1, 1, 'Mascota sin correa (2da vez)', 'Reincidencia de mascota sin correa.', 10000.00, 'pendiente', 'alta', 1, NULL, NULL, '2025-10-01', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'M-2025-0032', 2, 2, 2, 'Ruido excesivo (2da vez)', 'Reincidencia de ruido nocturno.', 30000.00, 'pagado', 'critica', 2, NULL, NULL, '2025-10-02', '2025-10-21 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 2, NULL, NULL),
(33, 'M-2025-0033', 3, 3, 3, 'Bloqueo de acceso (2da vez)', 'Bloqueo de entrada de servicio.', 20000.00, 'pendiente', 'alta', 3, NULL, NULL, '2025-10-03', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'M-2025-0034', 4, 4, 4, 'Fumar en áreas comunes (2da vez)', 'Fumar en zona de juegos infantiles.', 40000.00, 'apelada', 'critica', 4, NULL, NULL, '2025-10-04', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'M-2025-0035', 5, 5, 5, 'Daño a propiedad común (2da vez)', 'Graffiti en muro de estacionamiento.', 60000.00, 'pagado', 'critica', 5, NULL, NULL, '2025-10-05', '2025-10-18 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 5, NULL, NULL),
(36, 'M-2025-0036', 6, 6, 6, 'Mascota peligrosa sin bozal (2da vez)', 'Perro de raza peligrosa sin control.', 24000.00, 'pendiente', 'critica', 6, NULL, NULL, '2025-10-06', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'M-2025-0037', 7, 7, 7, 'Uso no autorizado de ascensor (2da vez)', 'Uso de ascensor de servicio para mudanza sin aviso.', 16000.00, 'pagado', 'media', 7, NULL, NULL, '2025-10-07', '2025-10-17 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 7, NULL, NULL),
(38, 'M-2025-0038', 8, 8, 8, 'Dejar basura en pasillo (2da vez)', 'Bolsa de basura dejada por más de 1 hora.', 12000.00, 'pendiente', 'media', 8, NULL, NULL, '2025-10-08', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL, NULL),
(39, 'M-2025-0039', 9, 9, 9, 'Instalación de antena sin permiso (2da vez)', 'Reinstalación de antena tras aviso de retiro.', 50000.00, 'anulada', 'alta', 9, NULL, NULL, '2025-10-09', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 1, 'Autorización posterior del comité', '2025-10-23 12:00:00', NULL, NULL, NULL),
(40, 'M-2025-0040', 10, 10, 10, 'Fiesta hasta tarde (2da vez)', 'Ruidos molestos y música alta.', 36000.00, 'pagado', 'critica', 10, NULL, NULL, '2025-10-10', '2025-10-16 00:00:00', '2025-10-23 16:35:00', '2025-10-23 16:35:00', NULL, NULL, NULL, 10, NULL, NULL),
(121, 'M-2025-0041', 44, 47, NULL, 'Falta de limpieza', 'ALTER TABLE multa AUTO_INCREMENT = 1;  -- Ajusta si hay filas existentesALTER TABLE multa MODIFY id bigint NOT NULL AUTO_INCREMENT;\n', 20000.00, 'pendiente', 'media', 1, NULL, NULL, '2025-11-12', NULL, '2025-11-12 21:34:58', '2025-11-12 21:34:58', NULL, NULL, NULL, NULL, 4, NULL),
(122, 'M-2025-0042', 44, 47, NULL, 'Falta de limpieza', 'multa_historial ADD COLUMN valor_anterior TEXT NULL COMMENT \'Valor anterior del campo\'; [ Editar en línea ] [ Editar ] [ Crear código PHP ] MySQL ha devuelto', 20000.00, 'apelada', 'media', 1, NULL, NULL, '2025-11-12', NULL, '2025-11-12 21:42:23', '2025-11-12 21:51:22', NULL, NULL, NULL, NULL, 4, NULL);

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
(9, 2, 1, 3, 2, '2025-10-17 01:28:15', 'test test test test test', 'pendiente', NULL, NULL, '2025-10-17 01:28:15', '2025-10-17 01:28:15'),
(10, 11, 1, 1, 1, '2025-10-17 01:30:00', 'El ruido no provino de mi unidad, sino de la contigua.', 'pendiente', NULL, NULL, '2025-10-17 01:30:00', '2025-10-17 01:30:00'),
(11, 13, 1, 4, 3, '2025-10-17 01:31:00', 'La llave se dejó abierta por un problema de presión de agua no reportado.', 'aceptada', 'Multa anulada por problema de infraestructura.', '2025-10-18 10:00:00', '2025-10-17 01:31:00', '2025-10-18 10:00:00'),
(12, 16, 1, 7, 6, '2025-10-17 01:32:00', 'No se usó la sala de cine, solo se estuvo en la sala de espera.', 'pendiente', NULL, NULL, '2025-10-17 01:32:00', '2025-10-17 01:32:00'),
(13, 17, 1, 8, 7, '2025-10-17 01:33:00', 'El toldo es removible y cumple con las dimensiones permitidas.', 'rechazada', 'El toldo no cumple con la estética definida.', '2025-10-18 11:00:00', '2025-10-17 01:33:00', '2025-10-18 11:00:00'),
(14, 19, 1, 10, 9, '2025-10-17 01:34:00', 'Se consumió solo agua embotellada, no alimentos.', 'pendiente', NULL, NULL, '2025-10-17 01:34:00', '2025-10-17 01:34:00'),
(15, 4, 4, 5, 4, '2025-10-17 10:00:00', 'Apelación por multa por fumar. Se adjuntan pruebas de que se fumó en el balcón.', 'pendiente', NULL, NULL, '2025-10-17 10:00:00', '2025-10-17 10:00:00'),
(16, 1, 1, 1, 1, '2025-10-18 11:00:00', 'La correa se rompió accidentalmente, se procedió a control inmediato.', 'rechazada', 'Incumplimiento al reglamento es irrefutable.', '2025-10-18 15:00:00', '2025-10-18 11:00:00', '2025-10-18 15:00:00'),
(17, 7, 8, 8, 7, '2025-10-19 12:00:00', 'Se aclara que fue el ascensor de carga, no el de servicio.', 'pendiente', NULL, NULL, '2025-10-19 12:00:00', '2025-10-19 12:00:00'),
(18, 9, 10, 10, 9, '2025-10-20 13:00:00', 'La antena es de uso interior, se colocó temporalmente afuera.', 'pendiente', NULL, NULL, '2025-10-20 13:00:00', '2025-10-20 13:00:00'),
(19, 2, 3, 3, 2, '2025-10-21 14:00:00', 'La música se detuvo inmediatamente al ser notificado.', 'pendiente', NULL, NULL, '2025-10-21 14:00:00', '2025-10-21 14:00:00'),
(20, 14, 5, 5, 4, '2025-10-22 15:00:00', 'La recolección de basura se retrasó por la conserjería.', 'pendiente', NULL, NULL, '2025-10-22 15:00:00', '2025-10-22 15:00:00'),
(21, 21, 11, 11, 11, '2025-10-23 16:35:00', 'Se estaba esperando a familiar en el auto.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 23, 13, 14, 13, '2025-10-23 16:35:00', 'No se me entregó la pulsera de identificación.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 24, 14, 15, 14, '2025-10-23 16:35:00', 'El sillón fue dejado a solicitud del conserje para retiro.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 26, 16, 17, 16, '2025-10-23 16:35:00', 'No fue una parrilla a carbón, sino una eléctrica portátil.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 28, 18, 19, 18, '2025-10-23 16:35:00', 'El contenedor estaba lleno, no había otro lugar.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 31, 1, 1, 1, '2025-10-23 16:35:00', 'La mascota se soltó accidentalmente. Se tomaron medidas correctivas.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 33, 3, 3, 3, '2025-10-23 16:35:00', 'El vehículo se detuvo por emergencia médica, no por mal uso.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 34, 4, 4, 4, '2025-10-23 16:35:00', 'Se demostró que se estaba vapeando, no fumando cigarrillos.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 36, 6, 6, 6, '2025-10-23 16:35:00', 'El perro estaba con collar, no con bozal, pero sí controlado.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 38, 8, 8, 8, '2025-10-23 16:35:00', 'Se dejó la bolsa en el horario de recolección permitido.', 'pendiente', NULL, NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 12, 3, 3, 2, '2025-10-23 16:35:00', 'Aclaración de pago realizado por arrendatario.', 'aceptada', 'Pago verificado y aceptado.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(32, 22, 13, 13, 12, '2025-10-23 16:35:00', 'Se informa de la finalización de los trabajos.', 'aceptada', 'Multa pagada, cierre de caso.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(33, 25, 16, 16, 15, '2025-10-23 16:35:00', 'Presentación del certificado de registro de la mascota.', 'aceptada', 'Mascota registrada, multa por atraso de registro.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(34, 27, 18, 18, 17, '2025-10-23 16:35:00', 'Se adjunta evidencia del retiro inmediato de cajas.', 'aceptada', 'Pago verificado, multa por obstrucción resuelta.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(35, 30, 20, 20, 20, '2025-10-23 16:35:00', 'Pago realizado por el uso no autorizado.', 'aceptada', 'Pago verificado, cierre de multa.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(36, 32, 2, 2, 2, '2025-10-23 16:35:00', 'Se compromete a utilizar limitador de volumen.', 'aceptada', 'Pago verificado, se advierte de próxima multa.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(37, 35, 5, 5, 5, '2025-10-23 16:35:00', 'Se presenta recibo de pago por la reparación total.', 'aceptada', 'Pago de reparación verificado, multa pagada.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(38, 37, 7, 7, 7, '2025-10-23 16:35:00', 'Pago realizado para cierre de caso.', 'aceptada', 'Pago verificado, cierre de multa.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(39, 40, 10, 10, 10, '2025-10-23 16:35:00', 'Pago efectuado tras el segundo aviso.', 'aceptada', 'Pago verificado, cierre de multa.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(40, 39, 1, 10, 9, '2025-10-23 16:35:00', 'Anulación por votación del comité.', 'aceptada', 'Multa anulada por aprobación de comité.', '2025-10-23 17:00:00', '2025-10-23 16:35:00', '2025-10-23 17:00:00'),
(41, 122, 1, 1, 44, '2025-11-12 21:51:22', 'multa.comunidad_id || null,\n    motivo,', 'pendiente', NULL, NULL, '2025-11-12 21:51:22', '2025-11-12 21:51:22');

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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `campo_modificado` varchar(255) DEFAULT NULL COMMENT 'Campo modificado (opcional)',
  `valor_anterior` text COMMENT 'Valor anterior del campo',
  `valor_nuevo` text COMMENT 'Valor nuevo del campo',
  `descripcion` text COMMENT 'Descripción del cambio',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Dirección IP del usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `multa_historial`
--

INSERT INTO `multa_historial` (`id`, `multa_id`, `usuario_id`, `accion`, `estado_anterior`, `estado_nuevo`, `observaciones`, `created_at`, `campo_modificado`, `valor_anterior`, `valor_nuevo`, `descripcion`, `ip_address`) VALUES
(1, 1, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(2, 2, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(4, 4, 1, 'Multa creada', NULL, 'anulada', 'Multa emitida y anulada', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(5, 5, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(6, 6, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(7, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(9, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(10, 10, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:44:26', NULL, NULL, NULL, NULL, NULL),
(14, 4, 1, 'Multa creada', NULL, 'anulada', 'Multa emitida y anulada', '2025-10-15 03:46:54', NULL, NULL, NULL, NULL, NULL),
(16, 6, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:46:54', NULL, NULL, NULL, NULL, NULL),
(17, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:46:54', NULL, NULL, NULL, NULL, NULL),
(18, 8, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:46:54', NULL, NULL, NULL, NULL, NULL),
(19, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:46:54', NULL, NULL, NULL, NULL, NULL),
(20, 10, 1, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-15 03:46:54', NULL, NULL, NULL, NULL, NULL),
(25, 4, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(26, 4, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por error administrativo', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(28, 6, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(29, 6, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(30, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(33, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(34, 10, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(35, 10, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:48:34', NULL, NULL, NULL, NULL, NULL),
(40, 4, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(41, 4, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por error administrativo', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(43, 6, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(44, 6, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(45, 7, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(48, 9, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(49, 10, 1, 'Multa creada', NULL, 'pendiente', 'Multa emitida por infracción', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(50, 10, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago realizado por el propietario', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(55, 7, 1, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación por uso de ascensor', '2025-10-15 03:52:57', NULL, NULL, NULL, NULL, NULL),
(56, 11, 6, 'Multa creada', NULL, 'pendiente', 'Multa emitida por uso fuera de horario', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(57, 12, 6, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(58, 13, 6, 'Multa creada', NULL, 'pendiente', 'Multa emitida por desperdicio de agua', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(59, 13, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por error de identificación', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(60, 14, 6, 'Multa creada', NULL, 'pendiente', 'Multa emitida por reglamento de basura', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(61, 15, 6, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(62, 16, 6, 'Multa creada', NULL, 'pendiente', 'Multa emitida por uso sin reserva', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(63, 16, 7, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación de residente', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(64, 17, 6, 'Multa creada', NULL, 'pendiente', 'Multa emitida por instalación no permitida', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(65, 18, 6, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(66, 19, 6, 'Multa creada', NULL, 'pendiente', 'Multa emitida por uso indebido de salón', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(67, 20, 6, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(68, 1, 1, 'Pago registrado', 'pendiente', 'pagado', 'Pago de multa 1', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(69, 3, 4, 'Pago registrado', 'vencido', 'pagado', 'Pago de multa 3', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(70, 5, 6, 'Pago registrado', 'pendiente', 'pagado', 'Pago de multa 5', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(71, 10, 10, 'Pago registrado', 'pendiente', 'pagado', 'Pago de multa 10', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(72, 11, 1, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación presentada', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(73, 17, 8, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación presentada', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(74, 13, 1, 'Resolución apelación', 'apelada', 'anulada', 'Apelación aceptada: error de unidad', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(75, 4, 4, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación por fumar en balcón', '2025-10-23 16:30:00', NULL, NULL, NULL, NULL, NULL),
(76, 21, 11, 'Multa creada', NULL, 'pendiente', 'Multa emitida por estacionamiento indebido', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(77, 22, 12, 'Multa creada', NULL, 'pagado', 'Multa emitida y pagada', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(78, 23, 13, 'Multa creada', NULL, 'pendiente', 'Multa emitida por no usar pulsera', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(79, 24, 14, 'Multa creada', NULL, 'pendiente', 'Multa por basura voluminosa', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(80, 24, 15, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación por basura', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(81, 25, 15, 'Multa creada', NULL, 'pagado', 'Multa por mascota sin permiso', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(82, 26, 16, 'Multa creada', NULL, 'pendiente', 'Multa por parrilla a carbón', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(83, 27, 17, 'Multa creada', NULL, 'pagado', 'Multa por obstrucción de pasillo', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(84, 28, 18, 'Multa creada', NULL, 'pendiente', 'Multa por escombros', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(85, 29, 19, 'Multa creada', NULL, 'pendiente', 'Multa por ruido de motor', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(86, 29, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por error de unidad', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(87, 30, 20, 'Multa creada', NULL, 'pagado', 'Multa por fiesta no autorizada', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(88, 31, 1, 'Multa creada', NULL, 'pendiente', '2da Multa por mascota sin correa', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(89, 32, 2, 'Multa creada', NULL, 'pagado', '2da Multa por ruido excesivo', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(90, 33, 3, 'Multa creada', NULL, 'pendiente', '2da Multa por bloqueo de acceso', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(91, 34, 4, 'Multa creada', NULL, 'pendiente', '2da Multa por fumar en común', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(92, 34, 5, 'Apelación presentada', 'pendiente', 'apelada', 'Apelación por vapeo', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(93, 35, 5, 'Multa creada', NULL, 'pagado', '2da Multa por daño a propiedad', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(94, 39, 9, 'Multa creada', NULL, 'pendiente', '2da Multa por antena', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(95, 39, 1, 'Multa anulada', 'pendiente', 'anulada', 'Anulada por autorización comité', '2025-10-23 16:35:00', NULL, NULL, NULL, NULL, NULL),
(96, 122, 1, 'creada', NULL, 'pendiente', NULL, '2025-11-12 21:42:23', NULL, NULL, NULL, 'Multa M-2025-0042 creada', '::ffff:172.18.0.1'),
(97, 122, 1, 'apelada', 'pendiente', 'apelada', NULL, '2025-11-12 21:51:22', NULL, NULL, NULL, 'Apelación creada para multa M-2025-0042', '::ffff:172.18.0.1');

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
(10, 10, 10, 'info', 'Cierre de Emisión', 'El periodo de gasto común 2025-09 ha sido cerrado.', 1, 'emision_gastos_comunes', 10, '2025-10-10 18:10:22'),
(11, 1, 2, 'info', 'Nuevo Gasto Común', 'Se ha emitido el gasto común de Octubre.', 0, 'emision_gastos_comunes', 11, '2025-10-11 10:00:00'),
(12, 2, 3, 'alerta', 'Multa Registrada', 'Se ha registrado una multa por estacionamiento indebido.', 0, 'multa', 12, '2025-10-11 10:00:00'),
(13, 3, 4, 'info', 'Documento Subido', 'Nuevo reglamento de gimnasio disponible.', 1, 'documento_comunidad', 13, '2025-10-11 10:00:00'),
(14, 4, 5, 'recordatorio', 'Lectura Pendiente', 'Falta registrar la lectura de su medidor de agua.', 0, 'lectura_medidor', 14, '2025-10-11 10:00:00'),
(15, 5, 6, 'info', 'Reserva Aprobada', 'Su reserva de Sala Cowork ha sido aprobada.', 1, 'reserva_amenidad', 5, '2025-10-11 10:00:00'),
(16, 6, 7, 'alerta', 'Pago Parcial', 'Su último pago cubrió solo una parte de su deuda.', 0, 'cuenta_cobro_unidad', 16, '2025-10-11 10:00:00'),
(17, 7, 8, 'recordatorio', 'Revisión de Toldo', 'Su solicitud de toldo será revisada el 2025-10-25.', 0, 'multa', 17, '2025-10-11 10:00:00'),
(18, 8, 9, 'info', 'Ticket Cerrado', 'El ticket de reparación de grieta ha sido resuelto.', 1, 'ticket_soporte', 8, '2025-10-11 10:00:00'),
(19, 9, 10, 'alerta', 'Cobro Vencido', 'El pago parcial de su gasto común está vencido.', 0, 'cuenta_cobro_unidad', 19, '2025-10-11 10:00:00'),
(20, 10, 10, 'info', 'Acceso Otorgado', 'Se ha dado acceso a la plataforma al proveedor de gas.', 1, 'usuario', 10, '2025-10-11 10:00:00'),
(21, 11, 11, 'alerta', 'Pago Vencido', 'Su gasto común de septiembre está vencido.', 0, 'cuenta_cobro_unidad', 21, '2025-10-23 16:35:00'),
(22, 12, 13, 'info', 'Pago Aplicado', 'Su pago ha sido aplicado con éxito.', 1, 'pago', 22, '2025-10-23 16:35:00'),
(23, 13, 14, 'recordatorio', 'Próxima Reunión', 'Reunión de comité el 25/11.', 0, 'documento_comunidad', 23, '2025-10-23 16:35:00'),
(24, 14, 15, 'info', 'Reserva Aprobada', 'Su solicitud de cancha ha sido aprobada.', 1, 'reserva_amenidad', 24, '2025-10-23 16:35:00'),
(25, 15, 16, 'alerta', 'Ticket Asignado', 'Se le asignó el ticket N°15 de limpieza.', 0, 'ticket_soporte', 15, '2025-10-23 16:35:00'),
(26, 16, 17, 'recordatorio', 'Mantención General', 'Recordatorio de la mantención de piscina mañana.', 0, 'registro_conserjeria', 26, '2025-10-23 16:35:00'),
(27, 17, 18, 'info', 'Nueva Multa', 'Se ha generado una multa por toldo.', 0, 'multa', 27, '2025-10-23 16:35:00'),
(28, 18, 19, 'alerta', 'Saldo Pendiente', 'Su saldo parcial tiene intereses.', 0, 'cuenta_cobro_unidad', 28, '2025-10-23 16:35:00'),
(29, 19, 20, 'recordatorio', 'Entrega de Paquete', 'Tiene un paquete en conserjería.', 1, 'registro_conserjeria', 29, '2025-10-23 16:35:00'),
(30, 20, 20, 'info', 'Cierre de Emisión', 'El periodo 2025-09 ha sido cerrado.', 1, 'emision_gastos_comunes', 30, '2025-10-23 16:35:00'),
(31, 1, 1, 'alerta', 'Nueva Multa', 'Se ha generado una segunda multa por mascota.', 0, 'multa', 31, '2025-10-23 16:35:00'),
(32, 2, 2, 'info', 'Pago Aplicado', 'Su pago de la segunda multa ha sido aplicado.', 1, 'pago', 32, '2025-10-23 16:35:00'),
(33, 3, 3, 'recordatorio', 'Próximo Vencimiento', 'El gasto común de Octubre vence pronto.', 0, 'cuenta_cobro_unidad', 33, '2025-10-23 16:35:00'),
(34, 4, 4, 'info', 'Documento Recibido', 'Aviso de cobranza disponible.', 1, 'documento_comunidad', 34, '2025-10-23 16:35:00'),
(35, 5, 5, 'alerta', 'Ticket Resuelto', 'El ticket de seguridad fue resuelto.', 0, 'ticket_soporte', 5, '2025-10-23 16:35:00'),
(36, 6, 6, 'recordatorio', 'Uso de Amenities', 'Recuerde las reglas del sauna.', 0, 'amenidad', 26, '2025-10-23 16:35:00'),
(37, 7, 7, 'info', 'Gasto Pagado', 'Su gasto común de septiembre ha sido pagado.', 1, 'cuenta_cobro_unidad', 37, '2025-10-23 16:35:00'),
(38, 8, 8, 'alerta', 'Interés de Mora', 'Se han aplicado intereses de mora a su saldo.', 0, 'cuenta_cobro_unidad', 38, '2025-10-23 16:35:00'),
(39, 9, 9, 'recordatorio', 'Mantención Programada', 'Aviso de corte de agua el 28/11.', 1, 'documento_comunidad', 39, '2025-10-23 16:35:00'),
(40, 10, 10, 'info', 'Ticket Cerrado', 'El ticket de ascensor fue cerrado.', 1, 'ticket_soporte', 10, '2025-10-23 16:35:00');

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
(10, 6, 7, 7, '2025-10-10', 95000.00, 'transferencia', 'REF-P010', 'pendiente', NULL, '2025-10-10 18:08:52', '2025-10-10 18:08:52'),
(11, 1, 2, 2, '2025-10-11', 50000.00, 'transferencia', 'REF-P011', 'pendiente', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 3, 3, '2025-10-12', 15000.00, 'webpay', 'REF-P012', 'aplicado', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 4, 4, '2025-10-13', 30000.00, 'efectivo', 'REF-P013', 'pendiente', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 5, 5, '2025-10-14', 30000.00, 'transferencia', 'REF-P014', 'aplicado', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 6, 6, '2025-10-15', 60000.00, 'webpay', 'REF-P015', 'pendiente', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 7, 7, '2025-10-16', 75000.00, 'efectivo', 'REF-P016', 'pendiente', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 8, 8, '2025-10-17', 25000.00, 'transferencia', 'REF-P017', 'aplicado', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 9, 9, '2025-10-18', 50000.00, 'webpay', 'REF-P018', 'pendiente', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 10, 10, '2025-10-19', 15000.00, 'efectivo', 'REF-P019', 'aplicado', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 10, 10, '2025-10-20', 80000.00, 'transferencia', 'REF-P020', 'aplicado', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 11, 11, '2025-10-11', 65000.00, 'transferencia', 'REF-P021', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 13, 13, '2025-10-12', 32000.00, 'webpay', 'REF-P022', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 14, 14, '2025-10-13', 48000.00, 'efectivo', 'REF-P023', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 15, 15, '2025-10-14', 53000.00, 'transferencia', 'REF-P024', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 16, 16, '2025-10-15', 72000.00, 'webpay', 'REF-P025', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 17, 17, '2025-10-16', 42000.00, 'efectivo', 'REF-P026', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 18, 18, '2025-10-17', 78000.00, 'transferencia', 'REF-P027', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 19, 19, '2025-10-18', 33000.00, 'webpay', 'REF-P028', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 20, 20, '2025-10-19', 54000.00, 'efectivo', 'REF-P029', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 20, 20, '2025-10-20', 105000.00, 'transferencia', 'REF-P030', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 12, 12, '2025-10-21', 55000.00, 'webpay', 'REF-P031', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 2, 2, '2025-10-22', 45000.00, 'efectivo', 'REF-P032', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 3, 3, '2025-10-23', 90000.00, 'transferencia', 'REF-P033', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 4, 4, '2025-10-24', 46000.00, 'webpay', 'REF-P034', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 5, 5, '2025-10-25', 80000.00, 'efectivo', 'REF-P035', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 6, 6, '2025-10-26', 98000.00, 'transferencia', 'REF-P036', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 7, 7, '2025-10-27', 60000.00, 'webpay', 'REF-P037', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 8, 8, '2025-10-28', 53000.00, 'efectivo', 'REF-P038', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 9, 9, '2025-10-29', 52000.00, 'transferencia', 'REF-P039', 'pendiente', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 10, 10, '2025-10-30', 75000.00, 'webpay', 'REF-P040', 'aplicado', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 1, 11, 11, '2025-11-01', 55000.00, 'transferencia', 'REF-P041', 'aplicado', NULL, '2025-11-01 10:00:00', '2025-11-01 10:00:00'),
(42, 2, 3, 3, '2025-11-02', 35500.00, 'webpay', 'REF-P042', 'aplicado', NULL, '2025-11-02 11:00:00', '2025-11-02 11:00:00'),
(43, 3, 4, 4, '2025-11-03', 90000.00, 'efectivo', 'REF-P043', 'aplicado', NULL, '2025-11-03 12:00:00', '2025-11-03 12:00:00'),
(44, 4, 5, 5, '2025-11-04', 48000.00, 'transferencia', 'REF-P044', 'aplicado', NULL, '2025-11-04 13:00:00', '2025-11-04 13:00:00'),
(45, 5, 6, 6, '2025-11-05', 75000.00, 'webpay', 'REF-P045', 'aplicado', NULL, '2025-11-05 14:00:00', '2025-11-05 14:00:00'),
(46, 6, 7, 7, '2025-11-06', 120000.00, 'efectivo', 'REF-P046', 'aplicado', NULL, '2025-11-06 15:00:00', '2025-11-06 15:00:00'),
(47, 7, 8, 8, '2025-11-07', 59000.00, 'transferencia', 'REF-P047', 'aplicado', NULL, '2025-11-07 16:00:00', '2025-11-07 16:00:00'),
(48, 8, 9, 9, '2025-11-08', 88000.00, 'webpay', 'REF-P048', 'aplicado', NULL, '2025-11-08 17:00:00', '2025-11-08 17:00:00'),
(49, 9, 10, 10, '2025-11-09', 52000.00, 'efectivo', 'REF-P049', 'aplicado', NULL, '2025-11-09 18:00:00', '2025-11-09 18:00:00'),
(50, 10, 10, 10, '2025-11-10', 78000.00, 'transferencia', 'REF-P050', 'aplicado', NULL, '2025-11-10 19:00:00', '2025-11-10 19:00:00'),
(51, 11, 21, 21, '2025-11-11', 60000.00, 'webpay', 'REF-P051', 'aplicado', NULL, '2025-11-11 10:00:00', '2025-11-11 10:00:00'),
(52, 12, 23, 23, '2025-11-12', 40600.00, 'efectivo', 'REF-P052', 'aplicado', NULL, '2025-11-12 11:00:00', '2025-11-12 11:00:00'),
(53, 13, 25, 25, '2025-11-13', 95000.00, 'transferencia', 'REF-P053', 'aplicado', NULL, '2025-11-13 12:00:00', '2025-11-13 12:00:00'),
(54, 14, 27, 27, '2025-11-14', 52000.00, 'webpay', 'REF-P054', 'aplicado', NULL, '2025-11-14 13:00:00', '2025-11-14 13:00:00'),
(55, 15, 29, 29, '2025-11-15', 80000.00, 'efectivo', 'REF-P055', 'aplicado', NULL, '2025-11-15 14:00:00', '2025-11-15 14:00:00'),
(56, 16, 31, 31, '2025-11-16', 125000.00, 'transferencia', 'REF-P056', 'aplicado', NULL, '2025-11-16 15:00:00', '2025-11-16 15:00:00'),
(57, 17, 33, 33, '2025-11-17', 63100.00, 'webpay', 'REF-P057', 'aplicado', NULL, '2025-11-17 16:00:00', '2025-11-17 16:00:00'),
(58, 18, 35, 35, '2025-11-18', 92000.00, 'efectivo', 'REF-P058', 'aplicado', NULL, '2025-11-18 17:00:00', '2025-11-18 17:00:00'),
(59, 19, 37, 37, '2025-11-19', 56000.00, 'transferencia', 'REF-P059', 'aplicado', NULL, '2025-11-19 18:00:00', '2025-11-19 18:00:00'),
(60, 20, 39, 39, '2025-11-20', 82000.00, 'webpay', 'REF-P060', 'aplicado', NULL, '2025-11-20 19:00:00', '2025-11-20 19:00:00'),
(61, 1, 1, 1, '2025-10-28', 50000.00, 'transferencia', 'REF-P101', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(62, 1, 2, 11, '2025-10-29', 45000.00, 'webpay', 'REF-P102', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(63, 2, 3, 13, '2025-10-30', 60000.00, 'efectivo', 'REF-P103', 'pendiente', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(64, 3, 4, 14, '2025-10-31', 80000.00, 'khipu', 'REF-P104', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(65, 1, 11, 1, '2025-11-01', 65000.00, 'servipag', 'REF-P105', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(66, 2, 13, 3, '2025-11-02', 30000.00, 'transferencia', 'REF-P106', 'pendiente', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(67, 3, 14, 4, '2025-11-03', 48000.00, 'webpay', 'REF-P107', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(68, 1, 12, 2, '2025-11-04', 55000.00, 'efectivo', 'REF-P108', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(69, 2, 2, 2, '2025-11-05', 45000.00, 'khipu', 'REF-P109', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(70, 3, 3, 3, '2025-11-06', 90000.00, 'servipag', 'REF-P110', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(71, 1, 1, 1, '2025-11-07', 5000.00, 'transferencia', 'REF-P111', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(72, 2, 3, 3, '2025-11-08', 15000.00, 'webpay', 'REF-P112', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(73, 3, 4, 4, '2025-11-09', 20000.00, 'efectivo', 'REF-P113', 'pendiente', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(74, 1, 11, 1, '2025-11-10', 65000.00, 'khipu', 'REF-P114', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(75, 2, 13, 3, '2025-11-11', 32000.00, 'servipag', 'REF-P115', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(76, 3, 14, 4, '2025-11-12', 48000.00, 'transferencia', 'REF-P116', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(77, 1, 12, 2, '2025-11-13', 55000.00, 'webpay', 'REF-P117', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(78, 2, 2, 2, '2025-11-14', 45000.00, 'efectivo', 'REF-P118', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(79, 3, 3, 3, '2025-11-15', 90000.00, 'khipu', 'REF-P119', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(80, 1, 1, 1, '2025-11-16', 55000.00, 'servipag', 'REF-P120', 'aplicado', NULL, '2025-10-29 19:26:25', '2025-10-29 19:26:25'),
(81, 1, 1, 1, '2025-11-17', 55000.00, 'transferencia', 'REF-P121', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(82, 2, 3, 3, '2025-11-18', 62000.00, 'webpay', 'REF-P122', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(83, 3, 4, 4, '2025-11-19', 88000.00, 'efectivo', 'REF-P123', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(84, 1, 2, 11, '2025-11-20', 60000.00, 'khipu', 'REF-P124', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(85, 2, 13, 13, '2025-11-21', 35000.00, 'servipag', 'REF-P125', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(86, 3, 14, 14, '2025-11-22', 52000.00, 'transferencia', 'REF-P126', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(87, 1, 11, 1, '2025-11-23', 70000.00, 'webpay', 'REF-P127', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(88, 2, 2, 2, '2025-11-24', 50000.00, 'efectivo', 'REF-P128', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(89, 3, 3, 3, '2025-11-25', 95000.00, 'khipu', 'REF-P129', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(90, 1, 12, 2, '2025-11-26', 68000.00, 'servipag', 'REF-P130', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(91, 2, 13, 3, '2025-11-27', 35000.00, 'transferencia', 'REF-P131', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(92, 3, 14, 4, '2025-11-28', 52000.00, 'webpay', 'REF-P132', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(93, 1, 1, 1, '2025-11-29', 55000.00, 'efectivo', 'REF-P133', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(94, 2, 3, 3, '2025-11-30', 62000.00, 'khipu', 'REF-P134', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(95, 3, 4, 4, '2025-12-01', 88000.00, 'servipag', 'REF-P135', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(96, 1, 2, 11, '2025-12-02', 60000.00, 'transferencia', 'REF-P136', 'pendiente', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(97, 2, 13, 13, '2025-12-03', 35000.00, 'webpay', 'REF-P137', 'pendiente', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(98, 3, 14, 14, '2025-12-04', 52000.00, 'efectivo', 'REF-P138', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(99, 1, 11, 1, '2025-12-05', 70000.00, 'khipu', 'REF-P139', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(100, 2, 2, 2, '2025-12-06', 50000.00, 'servipag', 'REF-P140', 'aplicado', NULL, '2025-10-29 19:39:16', '2025-10-29 19:39:16'),
(101, 15, 16, 25, '2025-11-18', 72000.00, 'transferencia', 'REF-P141', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(102, 32, 32, 32, '2025-11-19', 45000.00, 'webpay', 'REF-P142', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(103, 48, 55, 55, '2025-11-20', 80000.00, 'efectivo', 'REF-P143', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(104, 7, 8, 18, '2025-11-21', 59000.00, 'khipu', 'REF-P144', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(105, 55, 69, 49, '2025-11-22', 75000.00, 'servipag', 'REF-P145', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(106, 21, 21, 21, '2025-11-23', 65000.00, 'transferencia', 'REF-P146', 'pendiente', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(107, 39, 39, 39, '2025-11-24', 52000.00, 'webpay', 'REF-P147', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(108, 51, 61, 41, '2025-11-25', 58000.00, 'efectivo', 'REF-P148', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(109, 12, 13, 22, '2025-11-26', 32000.00, 'khipu', 'REF-P149', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(110, 28, 28, 28, '2025-11-27', 83000.00, 'servipag', 'REF-P150', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(111, 44, 47, 47, '2025-11-28', 150000.00, 'transferencia', 'REF-P151', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(112, 59, 77, 57, '2025-11-29', 60000.00, 'webpay', 'REF-P152', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(113, 9, 9, 19, '2025-11-30', 54000.00, 'efectivo', 'REF-P153', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(114, 25, 25, 25, '2025-12-01', 72000.00, 'khipu', 'REF-P154', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(115, 41, 41, 41, '2025-12-02', 60000.00, 'servipag', 'REF-P155', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(116, 56, 71, 51, '2025-12-03', 55000.00, 'transferencia', 'REF-P156', 'pendiente', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(117, 18, 19, 28, '2025-12-04', 83000.00, 'webpay', 'REF-P157', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(118, 34, 34, 34, '2025-12-05', 46000.00, 'efectivo', 'REF-P158', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(119, 50, 59, 59, '2025-12-06', 85000.00, 'khipu', 'REF-P159', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(120, 10, 10, 20, '2025-12-07', 75000.00, 'servipag', 'REF-P160', 'aplicado', NULL, '2025-10-29 19:43:39', '2025-10-29 19:43:39'),
(121, 36, 36, 36, '2025-11-20', 98000.00, 'transferencia', 'REF-P161', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(122, 46, 46, 46, '2025-10-25', 42000.00, 'webpay', 'REF-P162', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(123, 40, 40, 40, '2025-11-21', 75000.00, 'khipu', 'REF-P163', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(124, 41, 41, 41, '2025-11-22', 50000.00, 'servipag', 'REF-P164', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(125, 32, 32, 32, '2025-10-28', 47000.00, 'transferencia', 'REF-P165', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(126, 36, 76, 56, '2025-11-23', 65000.00, 'webpay', 'REF-P166', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(127, 46, 91, 71, '2025-10-29', 40000.00, 'efectivo', 'REF-P167', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(128, 40, 80, 60, '2025-11-24', 78000.00, 'khipu', 'REF-P168', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(129, 41, 81, 61, '2025-11-25', 60000.00, 'servipag', 'REF-P169', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(130, 32, 71, 51, '2025-11-26', 48500.00, 'transferencia', 'REF-P170', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(131, 36, 36, 36, '2025-12-01', 99500.00, 'webpay', 'REF-P171', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(132, 46, 46, 46, '2025-12-02', 43500.00, 'efectivo', 'REF-P172', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(133, 49, 49, 49, '2025-12-03', 51500.00, 'khipu', 'REF-P173', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(134, 40, 40, 40, '2025-12-04', 76500.00, 'servipag', 'REF-P174', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(135, 41, 41, 41, '2025-12-05', 61500.00, 'transferencia', 'REF-P175', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(136, 59, 59, 59, '2025-12-06', 86500.00, 'webpay', 'REF-P176', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(137, 32, 32, 32, '2025-12-07', 48500.00, 'efectivo', 'REF-P177', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(138, 36, 76, 56, '2025-12-08', 65000.00, 'khipu', 'REF-P178', 'pendiente', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(139, 46, 91, 71, '2025-12-09', 40000.00, 'servipag', 'REF-P179', 'pendiente', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02'),
(140, 49, 97, 77, '2025-12-10', 55000.00, 'transferencia', 'REF-P180', 'aplicado', NULL, '2025-10-29 19:54:02', '2025-10-29 19:54:02');

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
(10, 10, 6, 95000.00, 1, '2025-10-10 18:10:12', '2025-10-10 18:10:12'),
(11, 11, 11, 50000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 12, 12, 15000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 13, 13, 30000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 14, 14, 30000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 15, 15, 60000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 16, 16, 75000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 17, 17, 25000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 18, 18, 50000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 19, 19, 15000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 20, 20, 80000.00, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 21, 21, 65000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, 22, 32000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, 23, 48000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, 24, 53000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 25, 25, 72000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 26, 26, 42000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 27, 27, 78000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 28, 28, 33000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 29, 29, 54000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 30, 30, 105000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 31, 31, 55000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 32, 32, 45000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 33, 33, 90000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 34, 34, 46000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 35, 35, 80000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 36, 36, 98000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 37, 37, 60000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 38, 38, 53000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 39, 39, 52000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 40, 40, 75000.00, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
(10, 10, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-10 18:07:42', '2025-10-10 18:07:42'),
(11, 11, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 12, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 13, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 14, 3, 1.80, 'diaria', 'normal', 2.20, 'capital', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 15, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 16, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 17, 4, 1.30, 'mensual', 'normal', NULL, 'saldo', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 18, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 19, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 20, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 21, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, 3, 1.80, 'diaria', 'normal', 2.20, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 25, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 26, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 27, 4, 1.30, 'mensual', 'normal', NULL, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 28, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 29, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 30, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 31, 5, 1.50, 'mensual', 'normal', 2.00, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 32, 7, 2.00, 'diaria', 'abajo', 2.50, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 33, 10, 1.20, 'mensual', 'arriba', NULL, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 34, 3, 1.80, 'diaria', 'normal', 2.20, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 35, 8, 1.00, 'mensual', 'abajo', 1.50, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 36, 6, 1.60, 'diaria', 'arriba', 2.10, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 37, 4, 1.30, 'mensual', 'normal', NULL, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 38, 9, 2.10, 'diaria', 'abajo', 2.80, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 39, 2, 1.70, 'mensual', 'arriba', 1.90, 'saldo', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 40, 11, 2.30, 'diaria', 'normal', 3.00, 'capital', '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
(10, '11788735', '9', 'Alejandro', 'Barros', 'alejandro@email.cl', '+56990123456', NULL, '2025-10-10 18:07:27', '2025-10-10 18:07:27'),
(11, '20514420', '5', 'Carla', 'Ramírez', 'carla@email.cl', '+56911111111', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, '15243882', '2', 'Roberto', 'Fuentes', 'roberto@email.cl', '+56922222222', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, '22141366', 'K', 'Sofía', 'Castro', 'sofia@email.cl', '+56933333333', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, '10793463', '5', 'Felipe', 'Navarro', 'felipe@email.cl', '+56944444444', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, '2169079', '9', 'Claudia', 'Vargas', 'claudia@email.cl', '+56955555555', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, '25317602', '0', 'Andrés', 'Gómez', 'andres@email.cl', '+56966666666', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, '18596168', '1', 'María', 'López', 'maria@email.cl', '+56977777777', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, '19147778', '8', 'Javier', 'Muñoz', 'javier@email.cl', '+56988888888', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, '10974052', '6', 'Elena', 'Díaz', 'elena@email.cl', '+56999999999', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, '12788735', '7', 'Jorge', 'Pérez', 'jorge@email.cl', '+56900000000', NULL, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, '15432101', '9', 'Pedro', 'Guzmán', 'pedro@email.cl', '+56910101010', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, '16543212', '3', 'Laura', 'Soto', 'laura@email.cl', '+56911111111', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, '17654323', '7', 'Miguel', 'Araya', 'miguel@email.cl', '+56912121212', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, '18765434', '1', 'Constanza', 'Díaz', 'constanza@email.cl', '+56913131313', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, '19876545', '5', 'Ricardo', 'Tapia', 'ricardo@email.cl', '+56914141414', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, '20987656', '9', 'Valentina', 'Rojas', 'valentina@email.cl', '+56915151515', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, '21098767', '2', 'Diego', 'Flores', 'diego@email.cl', '+56916161616', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, '22109878', '6', 'Francisca', 'Herrera', 'francisca@email.cl', '+56917171717', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, '23210989', '0', 'Pablo', 'Vidal', 'pablo@email.cl', '+56918181818', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, '24321090', '4', 'Catalina', 'Molina', 'catalina@email.cl', '+56919191919', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, '10011223', '3', 'Mario', 'Navarrete', 'mario@email.cl', '+56920202020', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, '11122334', '7', 'Lucía', 'Pizarro', 'lucia@email.cl', '+56921212121', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, '12233445', '1', 'Benjamín', 'Correa', 'benja@email.cl', '+56922222222', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, '13344556', '5', 'Fernanda', 'Castro', 'fer@email.cl', '+56923232323', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, '14455667', '9', 'Ignacio', 'González', 'ignacio@email.cl', '+56924242424', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, '15566778', '2', 'Camila', 'Reyes', 'camila@email.cl', '+56925252525', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, '16677889', '6', 'Javier', 'Silva', 'javiers@email.cl', '+56926262626', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, '17788990', '0', 'Nicole', 'Pérez', 'nicole@email.cl', '+56927272727', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, '18890101', '4', 'Sebastián', 'Vásquez', 'seba@email.cl', '+56928282828', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, '19901212', '8', 'Andrea', 'Lagos', 'andrea@email.cl', '+56929292929', NULL, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, '25432101', '8', 'Gabriel', 'Núñez', 'gabriel@email.cl', '+56930303030', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(42, '26543212', '1', 'Daniela', 'Sánchez', 'daniela@email.cl', '+56931313131', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(43, '27654323', '5', 'Héctor', 'Ramos', 'hector@email.cl', '+56932323232', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(44, '28765434', '9', 'Tamara', 'Morales', 'tamara@email.cl', '+56933333333', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(45, '29876545', '2', 'Ismael', 'Fuentes', 'ismael@email.cl', '+56934343434', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(46, '30987656', '6', 'Lorena', 'Riquelme', 'lorena@email.cl', '+56935353535', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(47, '31098767', 'K', 'Joaquín', 'Salazar', 'joaquin@email.cl', '+56936363636', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(48, '32109878', '4', 'Natalia', 'Vera', 'natalia@email.cl', '+56937373737', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(49, '33210989', '8', 'Renato', 'Orellana', 'renato@email.cl', '+56938383838', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(50, '34321090', '1', 'Alejandra', 'Méndez', 'alejandra@email.cl', '+56939393939', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(51, '35432101', '5', 'Fabián', 'Cortes', 'fabian@email.cl', '+56940404040', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(52, '36543212', '9', 'Bárbara', 'Ortiz', 'barbara@email.cl', '+56941414141', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(53, '37654323', '3', 'Simón', 'Pizarro', 'simon@email.cl', '+56942424242', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(54, '38765434', '7', 'Emilia', 'Godoy', 'emilia@email.cl', '+56943434343', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(55, '39876545', '0', 'Cristóbal', 'Neira', 'cristobal@email.cl', '+56944444444', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(56, '40987656', '4', 'Martina', 'Contreras', 'martina@email.cl', '+56945454545', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(57, '41098767', '8', 'Vicente', 'Reyes', 'vicente@email.cl', '+56946464646', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(58, '42109878', '1', 'Antonia', 'Maldonado', 'antonia@email.cl', '+56947474747', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(59, '43210989', '5', 'Sergio', 'Zamora', 'sergio@email.cl', '+56948484848', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(60, '44321090', '9', 'Consuelo', 'Jara', 'consuelo@email.cl', '+56949494949', NULL, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(61, '45432101', '2', 'Camilo', 'Godoy', 'camilo.godoy@email.cl', '+56950505050', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(62, '46543212', '6', 'Ignacia', 'Castro', 'ignacia.castro@email.cl', '+56951515151', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(63, '47654323', 'K', 'Esteban', 'Pérez', 'esteban.perez@email.cl', '+56952525252', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(64, '48765434', '3', 'Javiera', 'Lagos', 'javiera.lagos@email.cl', '+56953535353', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(65, '49876545', '7', 'Matías', 'Soto', 'matias.soto@email.cl', '+56954545454', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(66, '50987656', '1', 'Paula', 'Muñoz', 'paula.munoz@email.cl', '+56955555555', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(67, '51098767', '5', 'Andrés', 'Navarro', 'andres.navarro@email.cl', '+56956565656', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(68, '52109878', '9', 'Rocío', 'Gutiérrez', 'rocio.gutierrez@email.cl', '+56957575757', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(69, '53210989', '2', 'Gustavo', 'Vargas', 'gustavo.vargas@email.cl', '+56958585858', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(70, '54321090', '6', 'Diana', 'Reyes', 'diana.reyes@email.cl', '+56959595959', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(71, '55432101', 'K', 'Luis', 'Herrera', 'luis.herrera@email.cl', '+56960606060', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(72, '56543212', '3', 'Carmen', 'Díaz', 'carmen.diaz@email.cl', '+56961616161', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(73, '57654323', '7', 'Javier', 'Fuentes', 'javier.fuentes@email.cl', '+56962626262', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(74, '58765434', '1', 'María', 'Godoy', 'maria.godoy@email.cl', '+56963636363', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(75, '59876545', '5', 'Daniel', 'Neira', 'daniel.neira@email.cl', '+56964646464', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(76, '60987656', '9', 'Sofía', 'Neira', 'sofia.neira@email.cl', '+56965656565', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(77, '61098767', '2', 'Felipe', 'Reyes', 'felipe.reyes@email.cl', '+56966666666', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(78, '62109878', '6', 'Elena', 'Maldonado', 'elena.maldonado@email.cl', '+56967676767', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(79, '63210989', 'K', 'Alfredo', 'Zamora', 'alfredo.zamora@email.cl', '+56968686868', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(80, '64321090', '3', 'Teresa', 'Jara', 'teresa.jara@email.cl', '+56969696969', NULL, '2025-10-23 16:45:00', '2025-10-23 16:45:00');

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
(10, 10, '21012345', '6', 'Servicio Técnico Gas', 'Mantención red de gas', 'gas@servicio.cl', NULL, NULL, 1, '2025-10-10 18:07:45', '2025-10-10 18:07:45'),
(11, 1, '21123456', '7', 'Jardines Sostenibles', 'Servicios de jardinería', 'jardin@sost.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, '21234567', '8', 'Electricidad Express', 'Servicios eléctricos', 'elec@express.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, '21345678', '9', 'Gas & Agua Soluciones', 'Servicios de gasfitería', 'gasagua@sol.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, '21456789', 'K', 'Asesorías Contables Ltda.', 'Servicios de contabilidad', 'contab@asesor.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, '21567890', '1', 'Seguridad Integral 24/7', 'Vigilancia y seguridad', 'seguridad@int.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, '21678901', '2', 'Reparaciones y Obras', 'Servicios de construcción', 'reparos@obras.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, '21789012', '3', 'Internet para Comunidades', 'Servicio de Internet', 'internet@comu.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, '21890123', '4', 'Suministros Industriales', 'Venta de materiales', 'ventas@sind.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, '21901234', '5', 'Mantención General Sur', 'Servicios de mantención', 'manten@sur.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, '22012345', '6', 'Conserjería Profesional', 'Servicios de conserjería', 'conserje@prof.cl', NULL, NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, '22123456', '8', 'Seguridad Tobalaba SpA', 'Vigilancia', 'seg@toba.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, '22234567', '1', 'Electrónica del Sur', 'Suministros electrónicos', 'e@sur.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, '22345678', '5', 'Servicios de Plomería Rápida', 'Plomería', 'serv@plom.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, '22456789', '9', 'Estudio Legal Comunitario', 'Asesoría legal', 'legal@estudio.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, '22567890', '2', 'Aseo y Mantención General', 'Aseo y limpieza', 'aseo@mante.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, '22678901', '6', 'Construcciones y Reformas', 'Construcción', 'const@ref.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, '22789012', 'K', 'Tecnología en Redes', 'Servicio de Internet', 'redes@tecno.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, '22890123', '4', 'Pinturas y Revestimientos', 'Venta de pinturas', 'ventas@pint.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, '22901234', '8', 'Bombas y Servicios', 'Reparación de bombas', 'bombas@serv.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, '23012345', '2', 'Agencia de Publicidad', 'Publicidad y marketing', 'publi@agencia.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, '23123456', '6', 'Equipos de Monitoreo', 'Venta de equipos de seguridad', 'ventas@monit.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, '23234567', '9', 'Sensores y Alarmas', 'Instalación de sensores', 'ventas@sensores.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, '23345678', '3', 'Mantención Piscinas Total', 'Mantención de piscinas', 'mant@piscina.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, '23456789', '7', 'Suministro de Materiales', 'Venta de materiales de construcción', 'ventas@sumin.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, '23567890', '0', 'Software de Gestión', 'Venta de licencias de software', 'soporte@software.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, '23678901', '4', 'Asesoría Tributaria', 'Asesoría contable', 'tributaria@asesor.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, '23789012', '8', 'Personal para Edificios', 'Suministro de personal', 'rrhh@personal.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, '23890123', '1', 'Construcción y Maestranza', 'Servicios de construcción', 'serv@constru.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, '23901234', '5', 'Administración y Cobranza', 'Administración externa', 'cobranza@adm.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, '24012345', '9', 'Mantención Gas Total', 'Mantención de redes de gas', 'mant@gas.cl', NULL, NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 5, '20792994', '8', 'es', 'supplies', NULL, NULL, NULL, 1, '2025-11-11 05:46:29', '2025-11-11 05:46:29'),
(42, 36, '56983447', '3', 'eseseses', 'services', NULL, '+56985349211', NULL, 1, '2025-11-11 05:47:44', '2025-11-11 05:47:44');

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
(10, 10, '2025-10-05 17:15:00', 6, 'visita', 'Amigo visita a residente de D202.', '2025-10-10 18:10:20'),
(11, 1, '2025-10-06 09:30:00', 6, 'visita', 'Técnico de jardinería ingresa al recinto.', '2025-10-23 16:30:00'),
(12, 2, '2025-10-06 14:00:00', 6, 'reporte', 'Unidad D305 solicita revisión de medidor de gas.', '2025-10-23 16:30:00'),
(13, 3, '2025-10-07 11:30:00', 6, 'entrega', 'Paquete para D402 de Amazon.', '2025-10-23 16:30:00'),
(14, 4, '2025-10-07 18:00:00', 6, 'otro', 'Se revisó alarma perimetral en Casa B, sin novedades.', '2025-10-23 16:30:00'),
(15, 5, '2025-10-08 08:45:00', 6, 'visita', 'Administrador de comunidad llega a reunión.', '2025-10-23 16:30:00'),
(16, 6, '2025-10-08 16:10:00', 6, 'retiro', 'Unidad D1001 retira correspondencia certificada.', '2025-10-23 16:30:00'),
(17, 7, '2025-10-09 10:30:00', 6, 'reporte', 'Reporte de luz de pasillo fundida en piso 5.', '2025-10-23 16:30:00'),
(18, 8, '2025-10-09 20:00:00', 6, 'entrega', 'Comida a domicilio para D105.', '2025-10-23 16:30:00'),
(19, 9, '2025-10-10 07:15:00', 6, 'otro', 'Se reporta mal olor en el sector del Salón de Yoga.', '2025-10-23 16:30:00'),
(20, 10, '2025-10-10 16:00:00', 6, 'visita', 'Proveedor de servicios técnicos ingresa a sala eléctrica.', '2025-10-23 16:30:00'),
(21, 11, '2025-10-11 08:00:00', 6, 'visita', 'Técnico de seguridad para revisión de cámaras.', '2025-10-23 16:35:00'),
(22, 12, '2025-10-11 14:30:00', 6, 'reporte', 'Unidad D306 reporta enchufe sin energía.', '2025-10-23 16:35:00'),
(23, 13, '2025-10-12 10:00:00', 6, 'entrega', 'Paquete para D403 (compra online).', '2025-10-23 16:35:00'),
(24, 14, '2025-10-12 19:30:00', 6, 'otro', 'Se dejó nota de aviso a Casa B por exceso de basura.', '2025-10-23 16:35:00'),
(25, 15, '2025-10-13 07:30:00', 6, 'visita', 'Ingreso de proveedor de aseo.', '2025-10-23 16:35:00'),
(26, 16, '2025-10-13 15:00:00', 6, 'retiro', 'Unidad D1002 retira correspondencia.', '2025-10-23 16:35:00'),
(27, 17, '2025-10-14 11:30:00', 6, 'reporte', 'Gotera en pasillo exterior piso 5.', '2025-10-23 16:35:00'),
(28, 18, '2025-10-14 18:00:00', 6, 'entrega', 'Correspondencia certificada para D106.', '2025-10-23 16:35:00'),
(29, 19, '2025-10-15 05:30:00', 6, 'otro', 'Se probó el grupo electrógeno por 15 minutos.', '2025-10-23 16:35:00'),
(30, 20, '2025-10-15 17:30:00', 6, 'visita', 'Técnico de gas para mantención.', '2025-10-23 16:35:00'),
(31, 1, '2025-10-16 09:00:00', 6, 'visita', 'Ingreso de empresa de seguridad para instalación de equipos.', '2025-10-23 16:35:00'),
(32, 2, '2025-10-16 16:00:00', 6, 'reporte', 'Vecino D305 reporta ruido en piscina.', '2025-10-23 16:35:00'),
(33, 3, '2025-10-17 11:00:00', 6, 'entrega', 'Entrega de material de jardinería.', '2025-10-23 16:35:00'),
(34, 4, '2025-10-17 20:00:00', 6, 'otro', 'Cierre de portón por fallas. Contactar técnico.', '2025-10-23 16:35:00'),
(35, 5, '2025-10-18 08:00:00', 6, 'visita', 'Proveedor de software de gestión en reunión con administrador.', '2025-10-23 16:35:00'),
(36, 6, '2025-10-18 14:00:00', 6, 'retiro', 'Retiro de escombros de unidad D1002.', '2025-10-23 16:35:00'),
(37, 7, '2025-10-19 10:00:00', 6, 'reporte', 'Falla en la luz del hall principal.', '2025-10-23 16:35:00'),
(38, 8, '2025-10-19 19:00:00', 6, 'entrega', 'Correspondencia a D105.', '2025-10-23 16:35:00'),
(39, 9, '2025-10-20 06:00:00', 6, 'otro', 'Se revisó la presión de agua de la Torre 2.', '2025-10-23 16:35:00'),
(40, 10, '2025-10-20 16:30:00', 6, 'visita', 'Visita de inspector de ascensores.', '2025-10-23 16:35:00'),
(41, 1, '2025-10-29 09:00:00', 6, 'reporte', 'Residente D201 reporta luz quemada en escalera.', '2025-10-29 19:26:35'),
(42, 1, '2025-10-29 11:30:00', 6, 'entrega', 'Paquete MercadoLibre para D102.', '2025-10-29 19:26:35'),
(43, 2, '2025-10-29 14:00:00', 6, 'visita', 'Técnico de Internet para D306.', '2025-10-29 19:26:35'),
(44, 2, '2025-10-29 17:00:00', 6, 'otro', 'Se realiza ronda de supervisión, sin novedad.', '2025-10-29 19:26:35'),
(45, 3, '2025-10-30 08:15:00', 6, 'reporte', 'Alarma de portón vehicular activada sin motivo aparente.', '2025-10-29 19:26:35'),
(46, 3, '2025-10-30 10:45:00', 6, 'retiro', 'Residente D403 retira encomienda.', '2025-10-29 19:26:35'),
(47, 1, '2025-10-30 15:00:00', 6, 'visita', 'Familiar visita a residente D101.', '2025-10-29 19:26:35'),
(48, 2, '2025-10-31 09:30:00', 6, 'entrega', 'Flores para D305.', '2025-10-29 19:26:35'),
(49, 3, '2025-10-31 12:00:00', 6, 'reporte', 'Niños jugando con pelota en estacionamiento subterráneo.', '2025-10-29 19:26:35'),
(50, 1, '2025-10-31 16:00:00', 6, 'otro', 'Conserje realiza cambio de ampolleta quemada en escalera (Ticket #21).', '2025-10-29 19:26:35'),
(51, 1, '2025-11-01 10:00:00', 6, 'entrega', 'Entrega de correspondencia masiva (cuentas).', '2025-10-29 19:26:35'),
(52, 2, '2025-11-01 14:00:00', 6, 'visita', 'Proveedor de gas revisa medidores.', '2025-10-29 19:26:35'),
(53, 3, '2025-11-02 11:00:00', 6, 'reporte', 'Auto mal estacionado bloquea acceso a bodega B403.', '2025-10-29 19:26:35'),
(54, 1, '2025-11-02 18:00:00', 6, 'retiro', 'Residente D202 retira llaves de sala de eventos.', '2025-10-29 19:26:35'),
(55, 2, '2025-11-03 08:30:00', 6, 'visita', 'Personal de aseo inicia turno.', '2025-10-29 19:26:35'),
(56, 3, '2025-11-03 13:00:00', 6, 'entrega', 'Pedido de supermercado para D402.', '2025-10-29 19:26:35'),
(57, 1, '2025-11-04 10:30:00', 6, 'reporte', 'Falla en citófono D102.', '2025-10-29 19:26:35'),
(58, 2, '2025-11-04 16:45:00', 6, 'otro', 'Se recuerda a residente D306 sobre normativa de ruidos.', '2025-10-29 19:26:35'),
(59, 3, '2025-11-05 09:15:00', 6, 'visita', 'Técnico de ascensores realiza mantención preventiva.', '2025-10-29 19:26:35'),
(60, 1, '2025-11-05 17:00:00', 6, 'entrega', 'Documento certificado para D201.', '2025-10-29 19:26:35'),
(61, 1, '2025-11-06 09:45:00', 6, 'reporte', 'Se informa sobre basurero roto cerca de quincho (Ticket #32).', '2025-10-29 19:39:25'),
(62, 2, '2025-11-06 11:00:00', 6, 'entrega', 'Paquete Falabella para D306.', '2025-10-29 19:39:25'),
(63, 3, '2025-11-07 14:30:00', 6, 'visita', 'Técnico revisa timbre D403 (Ticket #33).', '2025-10-29 19:39:25'),
(64, 1, '2025-11-07 18:00:00', 6, 'otro', 'Se realiza prueba de luces de emergencia.', '2025-10-29 19:39:25'),
(65, 2, '2025-11-08 08:00:00', 6, 'reporte', 'Residente D306 reporta olor a gas (Ticket #35).', '2025-10-29 19:39:25'),
(66, 3, '2025-11-08 10:15:00', 6, 'retiro', 'Residente D402 retira correspondencia.', '2025-10-29 19:39:25'),
(67, 1, '2025-11-09 15:00:00', 6, 'visita', 'Jardinero revisa regador automático (Ticket #36).', '2025-10-29 19:39:25'),
(68, 2, '2025-11-09 19:00:00', 6, 'entrega', 'Comida Uber Eats para D202.', '2025-10-29 19:39:25'),
(69, 3, '2025-11-10 09:00:00', 6, 'reporte', 'Manchas en alfombra pasillo P2 (Ticket #38).', '2025-10-29 19:39:25'),
(70, 1, '2025-11-10 12:30:00', 6, 'otro', 'Administrador deja documentos para D101.', '2025-10-29 19:39:25'),
(71, 1, '2025-11-11 11:00:00', 6, 'visita', 'Técnico revisa puerta ascensor (Ticket #39).', '2025-10-29 19:39:25'),
(72, 2, '2025-11-11 14:00:00', 6, 'reporte', 'Luz bodega B102 no enciende (Ticket #40).', '2025-10-29 19:39:25'),
(73, 3, '2025-11-12 10:00:00', 6, 'entrega', 'Paquete para D403 de Ripley.', '2025-10-29 19:39:25'),
(74, 1, '2025-11-12 17:00:00', 6, 'otro', 'Se coordina revisión de extintores (Ticket #41).', '2025-10-29 19:39:25'),
(75, 2, '2025-11-13 08:45:00', 6, 'visita', 'Maestro revisa ventana D402 (Ticket #42).', '2025-10-29 19:39:25'),
(76, 3, '2025-11-13 16:00:00', 6, 'retiro', 'Residente D403 retira llaves de quincho.', '2025-10-29 19:39:25'),
(77, 1, '2025-11-14 10:00:00', 6, 'reporte', 'Desagüe lavaplatos lento D305 (Ticket #44).', '2025-10-29 19:39:25'),
(78, 2, '2025-11-14 15:30:00', 6, 'entrega', 'Correspondencia certificada para D201.', '2025-10-29 19:39:25'),
(79, 3, '2025-11-15 09:00:00', 6, 'visita', 'Personal de mantención revisa banca (Ticket #45).', '2025-10-29 19:39:25'),
(80, 1, '2025-11-15 14:00:00', 6, 'reporte', 'Enchufe terraza D202 sin energía (Ticket #46).', '2025-10-29 19:39:25'),
(81, 4, '2025-11-06 10:00:00', 6, 'reporte', 'Se reporta pasto seco en Casa A (Ticket #51).', '2025-10-29 19:43:47'),
(82, 5, '2025-11-06 12:00:00', 6, 'visita', 'Técnico de iluminación revisa acceso (Ticket #52).', '2025-10-29 19:43:47'),
(83, 6, '2025-11-07 15:00:00', 6, 'entrega', 'Paquete para D1001.', '2025-10-29 19:43:47'),
(84, 7, '2025-11-07 17:30:00', 6, 'otro', 'Se cambia foco quemado piso 10 (Ticket #54 resuelto).', '2025-10-29 19:43:47'),
(85, 8, '2025-11-08 09:30:00', 6, 'reporte', 'Baldosa suelta en escalera (Ticket #55).', '2025-10-29 19:43:47'),
(86, 9, '2025-11-08 11:45:00', 6, 'retiro', 'Residente D10 retira llaves sala de juegos.', '2025-10-29 19:43:47'),
(87, 10, '2025-11-09 14:00:00', 6, 'visita', 'Técnico revisa enchufe D201 (Ticket #57).', '2025-10-29 19:43:47'),
(88, 11, '2025-11-09 18:00:00', 6, 'reporte', 'Goteo en WC D102 (Ticket #58).', '2025-10-29 19:43:47'),
(89, 12, '2025-11-10 10:30:00', 6, 'reporte', 'Juego infantil roto (Ticket #59).', '2025-10-29 19:43:47'),
(90, 13, '2025-11-10 13:00:00', 6, 'entrega', 'Correspondencia para D403.', '2025-10-29 19:43:47'),
(91, 14, '2025-11-11 11:15:00', 6, 'visita', 'Gasfiter revisa conexión Casa B (Ticket #61).', '2025-10-29 19:43:47'),
(92, 15, '2025-11-11 15:00:00', 6, 'reporte', 'Árbol caído (Ticket #62).', '2025-10-29 19:43:47'),
(93, 16, '2025-11-12 10:00:00', 6, 'reporte', 'Filtración en gimnasio (Ticket #63).', '2025-10-29 19:43:47'),
(94, 17, '2025-11-12 16:30:00', 6, 'otro', 'Se cambia foco intermitente E151 (Ticket #64 resuelto).', '2025-10-29 19:43:47'),
(95, 18, '2025-11-13 09:00:00', 6, 'reporte', 'Pintura descascarada balcón D106 (Ticket #65).', '2025-10-29 19:43:47'),
(96, 19, '2025-11-13 14:00:00', 6, 'entrega', 'Paquete para D802.', '2025-10-29 19:43:47'),
(97, 20, '2025-11-14 11:00:00', 6, 'visita', 'Técnico revisa tablero sala bombas (Ticket #67).', '2025-10-29 19:43:47'),
(98, 21, '2025-11-14 17:00:00', 6, 'reporte', 'Calefont D103 no enciende (Ticket #68).', '2025-10-29 19:43:47'),
(99, 22, '2025-11-15 10:00:00', 6, 'reporte', 'Puerta sala multiuso atascada (Ticket #69).', '2025-10-29 19:43:47'),
(100, 23, '2025-11-15 15:30:00', 6, 'visita', 'Técnico revisa cámara piscina (Ticket #70).', '2025-10-29 19:43:47'),
(101, 36, '2025-11-06 14:00:00', 6, 'reporte', 'Unidad D501 (C36) reporta calefacción baja (Ticket #71).', '2025-10-29 19:54:09'),
(102, 46, '2025-11-07 09:00:00', 6, 'visita', 'Personal de limpieza para unidad D801 (C46).', '2025-10-29 19:54:09'),
(103, 49, '2025-11-07 16:00:00', 6, 'reporte', 'Cámaras piso 5 offline (C49) (Ticket #73).', '2025-10-29 19:54:09'),
(104, 40, '2025-11-08 10:00:00', 6, 'mantencion', 'Se cambia ampolleta quemada en quincho (C40).', '2025-10-29 19:54:09'),
(105, 41, '2025-11-08 15:30:00', 6, 'reporte', 'Enchufe sin corriente D101 (C41) (Ticket #75).', '2025-10-29 19:54:09'),
(106, 59, '2025-11-09 11:00:00', 6, 'mantencion', 'Se coordina corte de pasto sector juegos (C59).', '2025-10-29 19:54:09'),
(107, 32, '2025-11-09 17:00:00', 6, 'reporte', 'Fuga agua medidor D301 (C32) (Ticket #77).', '2025-10-29 19:54:09'),
(108, 36, '2025-11-10 10:00:00', 6, 'visita', 'Técnico revisa botón PB ascensor T1 (C36).', '2025-10-29 19:54:09'),
(109, 46, '2025-11-10 14:00:00', 6, 'entrega', 'Residente D801 (C46) retira copia reglamento.', '2025-10-29 19:54:09'),
(110, 49, '2025-11-11 09:30:00', 6, 'reporte', 'Silla rota en recepción (C49) (Ticket #80).', '2025-10-29 19:54:09'),
(111, 40, '2025-11-11 16:00:00', 6, 'reporte', 'Alarma D900 sonando (C40) (Ticket #81).', '2025-10-29 19:54:09'),
(112, 41, '2025-11-12 10:00:00', 6, 'mantencion', 'Se solicita limpieza mancha aceite E101 (C41).', '2025-10-29 19:54:09'),
(113, 59, '2025-11-12 13:00:00', 6, 'reporte', 'Puerta bodega B2001 atascada (C59) (Ticket #83).', '2025-10-29 19:54:09'),
(114, 32, '2025-11-13 11:00:00', 6, 'reporte', 'Luz parpadeante baño D1301 (C32) (Ticket #84).', '2025-10-29 19:54:09'),
(115, 36, '2025-11-13 15:00:00', 6, 'visita', 'Técnico de gas para revisión Sello Verde D501 (C36).', '2025-10-29 19:54:09'),
(116, 46, '2025-11-14 10:00:00', 6, 'mantencion', 'Se retira arbusto seco de entrada (C46).', '2025-10-29 19:54:09'),
(117, 49, '2025-11-14 14:30:00', 6, 'visita', 'Maestro revisa bisagra puerta T03 (C49).', '2025-10-29 19:54:09'),
(118, 40, '2025-11-15 09:00:00', 6, 'reporte', 'Foco quemado subterráneo -2 (C40) (Ticket #88).', '2025-10-29 19:54:09'),
(119, 41, '2025-11-15 16:00:00', 6, 'reporte', 'Cerámica suelta pasillo piso 5 (C41) (Ticket #89).', '2025-10-29 19:54:09'),
(120, 59, '2025-11-16 10:00:00', 6, 'reporte', 'Tarjeta acceso D2001 no funciona (C59) (Ticket #90).', '2025-10-29 19:54:09');

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
(10, 10, 10, 10, 10, '2025-10-24 16:00:00', '2025-10-24 18:00:00', 'aprobada', '2025-10-10 18:10:16', '2025-10-10 18:10:16'),
(11, 1, 1, 2, 2, '2025-10-25 10:00:00', '2025-10-25 14:00:00', 'solicitada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 2, 3, 3, '2025-10-26 18:00:00', '2025-10-26 22:00:00', 'aprobada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 3, 4, 4, '2025-10-27 15:00:00', '2025-10-27 17:00:00', 'cumplida', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 4, 5, 5, '2025-10-28 11:00:00', '2025-10-28 15:00:00', 'aprobada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 5, 6, 6, '2025-10-29 14:00:00', '2025-10-29 18:00:00', 'rechazada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 6, 7, 7, '2025-10-30 19:00:00', '2025-10-30 22:00:00', 'solicitada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 7, 8, 8, '2025-10-31 09:00:00', '2025-10-31 11:00:00', 'aprobada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 8, 9, 9, '2025-11-01 16:00:00', '2025-11-01 20:00:00', 'cumplida', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 9, 10, 10, '2025-11-02 08:30:00', '2025-11-02 10:00:00', 'cancelada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 10, 10, 10, '2025-11-03 15:00:00', '2025-11-03 17:00:00', 'aprobada', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 21, 11, 11, '2025-11-05 15:00:00', '2025-11-05 20:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 22, 13, 13, '2025-11-06 09:00:00', '2025-11-06 11:00:00', 'solicitada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 23, 14, 14, '2025-11-07 16:00:00', '2025-11-07 19:00:00', 'cumplida', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 24, 15, 15, '2025-11-08 10:00:00', '2025-11-08 11:30:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 25, 16, 16, '2025-11-09 13:00:00', '2025-11-09 17:00:00', 'rechazada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 26, 17, 17, '2025-11-10 18:00:00', '2025-11-10 20:00:00', 'solicitada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 27, 18, 18, '2025-11-11 11:00:00', '2025-11-11 13:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 28, 19, 19, '2025-11-12 16:00:00', '2025-11-12 19:00:00', 'cumplida', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 29, 20, 20, '2025-11-13 12:00:00', '2025-11-13 17:00:00', 'cancelada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 30, 20, 20, '2025-11-14 10:00:00', '2025-11-14 12:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 1, 1, 1, '2025-11-15 20:00:00', '2025-11-15 23:00:00', 'solicitada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 2, 2, 2, '2025-11-16 11:00:00', '2025-11-16 15:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 3, 3, 3, '2025-11-17 08:00:00', '2025-11-17 09:00:00', 'cumplida', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 4, 4, 4, '2025-11-18 15:00:00', '2025-11-18 19:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 5, 5, 5, '2025-11-19 10:00:00', '2025-11-19 14:00:00', 'solicitada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 6, 6, 6, '2025-11-20 21:00:00', '2025-11-20 23:59:00', 'rechazada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 7, 7, 7, '2025-11-21 12:00:00', '2025-11-21 14:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 8, 8, 8, '2025-11-22 18:00:00', '2025-11-22 22:00:00', 'cumplida', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 9, 9, 9, '2025-11-23 10:00:00', '2025-11-23 11:30:00', 'cancelada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 10, 10, 10, '2025-11-24 17:00:00', '2025-11-24 19:00:00', 'aprobada', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 1, 1, 1, 1, '2025-11-05 18:00:00', '2025-11-05 22:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(42, 1, 11, 2, 11, '2025-11-08 10:00:00', '2025-11-08 12:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(43, 2, 2, 3, 13, '2025-11-10 13:00:00', '2025-11-10 17:00:00', 'solicitada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(44, 2, 12, 13, 13, '2025-11-12 19:00:00', '2025-11-12 20:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(45, 3, 3, 4, 14, '2025-11-15 07:00:00', '2025-11-15 08:30:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(46, 3, 13, 14, 14, '2025-11-18 16:00:00', '2025-11-18 19:00:00', 'cumplida', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(47, 1, 31, 1, 1, '2025-11-20 18:00:00', '2025-11-20 20:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(48, 2, 32, 3, 3, '2025-11-22 09:00:00', '2025-11-22 10:00:00', 'cancelada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(49, 3, 33, 4, 4, '2025-11-25 00:00:00', '2025-12-01 00:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(50, 1, 1, 11, 1, '2025-11-28 19:00:00', '2025-11-28 23:00:00', 'solicitada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(51, 1, 11, 1, 1, '2025-11-01 11:00:00', '2025-11-01 13:00:00', 'cumplida', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(52, 2, 2, 3, 3, '2025-11-02 14:00:00', '2025-11-02 18:00:00', 'cumplida', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(53, 3, 3, 4, 4, '2025-11-03 08:00:00', '2025-11-03 09:00:00', 'cumplida', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(54, 1, 1, 1, 1, '2025-11-04 17:00:00', '2025-11-04 21:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(55, 2, 12, 13, 13, '2025-11-06 20:00:00', '2025-11-06 21:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(56, 3, 13, 14, 14, '2025-11-07 15:00:00', '2025-11-07 18:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(57, 1, 31, 2, 11, '2025-11-09 17:00:00', '2025-11-09 19:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(58, 2, 2, 2, 2, '2025-11-13 12:00:00', '2025-11-13 16:00:00', 'solicitada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(59, 3, 3, 3, 3, '2025-11-17 06:30:00', '2025-11-17 08:00:00', 'aprobada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(60, 1, 11, 11, 1, '2025-11-19 10:00:00', '2025-11-19 12:00:00', 'rechazada', '2025-10-29 19:26:29', '2025-10-29 19:26:29'),
(61, 1, 1, 2, 11, '2025-12-01 19:00:00', '2025-12-01 23:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(62, 2, 2, 3, 13, '2025-12-02 12:00:00', '2025-12-02 16:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(63, 3, 3, 4, 14, '2025-12-03 07:30:00', '2025-12-03 08:30:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(64, 1, 11, 1, 1, '2025-12-04 10:00:00', '2025-12-04 12:00:00', 'solicitada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(65, 2, 12, 2, 2, '2025-12-05 18:00:00', '2025-12-05 19:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(66, 3, 13, 3, 3, '2025-12-06 15:00:00', '2025-12-06 18:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(67, 1, 31, 11, 1, '2025-12-07 16:00:00', '2025-12-07 18:00:00', 'solicitada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(68, 2, 32, 13, 3, '2025-12-08 09:00:00', '2025-12-08 10:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(69, 3, 33, 14, 4, '2025-12-09 10:00:00', '2025-12-15 10:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(70, 1, 1, 1, 1, '2025-12-10 18:00:00', '2025-12-10 22:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(71, 2, 2, 2, 2, '2025-12-11 13:00:00', '2025-12-11 17:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(72, 3, 3, 3, 3, '2025-12-12 07:00:00', '2025-12-12 08:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(73, 1, 11, 11, 1, '2025-12-13 11:00:00', '2025-12-13 13:00:00', 'solicitada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(74, 2, 12, 13, 3, '2025-12-14 19:00:00', '2025-12-14 20:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(75, 3, 13, 14, 4, '2025-12-15 16:00:00', '2025-12-15 19:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(76, 1, 31, 1, 1, '2025-12-16 18:00:00', '2025-12-16 20:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(77, 2, 32, 2, 2, '2025-12-17 09:00:00', '2025-12-17 10:00:00', 'cancelada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(78, 3, 33, 3, 3, '2025-12-18 10:00:00', '2025-12-24 10:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(79, 1, 1, 11, 1, '2025-12-19 19:00:00', '2025-12-19 23:00:00', 'solicitada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(80, 2, 2, 13, 3, '2025-12-20 12:00:00', '2025-12-20 16:00:00', 'aprobada', '2025-10-29 19:39:21', '2025-10-29 19:39:21'),
(81, 4, 4, 5, 5, '2025-12-01 14:00:00', '2025-12-01 18:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(82, 5, 5, 6, 6, '2025-12-02 09:00:00', '2025-12-02 12:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(83, 6, 6, 7, 7, '2025-12-03 20:00:00', '2025-12-03 23:00:00', 'solicitada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(84, 7, 7, 8, 8, '2025-12-04 10:00:00', '2025-12-04 11:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(85, 8, 8, 9, 9, '2025-12-05 17:00:00', '2025-12-05 20:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(86, 9, 9, 10, 10, '2025-12-06 11:00:00', '2025-12-06 12:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(87, 10, 10, 10, 10, '2025-12-07 16:00:00', '2025-12-07 18:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(88, 11, 11, 11, 11, '2025-12-08 10:00:00', '2025-12-08 12:00:00', 'solicitada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(89, 12, 12, 13, 13, '2025-12-09 19:00:00', '2025-12-09 20:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(90, 13, 13, 14, 14, '2025-12-10 16:00:00', '2025-12-10 18:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(91, 14, 14, 15, 15, '2025-12-11 11:00:00', '2025-12-11 15:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(92, 15, 15, 16, 16, '2025-12-12 09:00:00', '2025-12-12 12:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(93, 16, 16, 17, 17, '2025-12-13 07:00:00', '2025-12-13 09:00:00', 'solicitada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(94, 17, 17, 18, 18, '2025-12-14 18:00:00', '2025-12-14 21:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(95, 18, 18, 19, 19, '2025-12-15 14:00:00', '2025-12-15 17:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(96, 19, 19, 20, 20, '2025-12-16 10:00:00', '2025-12-16 12:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(97, 20, 20, 20, 20, '2025-12-17 15:00:00', '2025-12-17 18:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(98, 21, 21, 21, 21, '2025-12-18 17:00:00', '2025-12-18 20:00:00', 'solicitada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(99, 22, 22, 22, 22, '2025-12-19 09:00:00', '2025-12-19 11:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(100, 23, 23, 23, 23, '2025-12-20 16:00:00', '2025-12-20 19:00:00', 'aprobada', '2025-10-29 19:43:44', '2025-10-29 19:43:44'),
(101, 36, 36, 36, 36, '2025-12-01 10:00:00', '2025-12-01 12:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(102, 46, 26, 46, 46, '2025-12-02 18:00:00', '2025-12-02 20:00:00', 'solicitada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(103, 49, 1, 49, 49, '2025-12-03 19:00:00', '2025-12-03 23:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(104, 40, 40, 40, 40, '2025-12-04 20:00:00', '2025-12-04 23:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(105, 41, 1, 41, 41, '2025-12-05 18:00:00', '2025-12-05 22:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(106, 59, 19, 59, 59, '2025-12-06 14:00:00', '2025-12-06 17:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(107, 32, 2, 32, 32, '2025-12-07 13:00:00', '2025-12-07 17:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(108, 36, 36, 76, 56, '2025-12-08 11:00:00', '2025-12-08 13:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(109, 46, 26, 91, 71, '2025-12-09 17:00:00', '2025-12-09 19:00:00', 'solicitada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(110, 49, 1, 97, 77, '2025-12-10 18:30:00', '2025-12-10 22:30:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(111, 40, 40, 80, 60, '2025-12-11 19:30:00', '2025-12-11 22:30:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(112, 41, 1, 81, 61, '2025-12-12 17:00:00', '2025-12-12 19:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(113, 59, 19, 117, 77, '2025-12-13 15:00:00', '2025-12-13 18:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(114, 32, 2, 71, 51, '2025-12-14 14:00:00', '2025-12-14 18:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(115, 36, 36, 36, 36, '2025-12-15 09:00:00', '2025-12-15 11:00:00', 'rechazada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(116, 46, 26, 46, 46, '2025-12-16 16:00:00', '2025-12-16 18:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(117, 49, 1, 49, 49, '2025-12-17 20:00:00', '2025-12-17 23:59:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(118, 40, 40, 40, 40, '2025-12-18 21:00:00', '2025-12-18 23:30:00', 'solicitada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(119, 41, 1, 41, 41, '2025-12-19 16:00:00', '2025-12-19 18:00:00', 'aprobada', '2025-10-29 19:54:05', '2025-10-29 19:54:05'),
(120, 59, 19, 59, 59, '2025-12-20 12:00:00', '2025-12-20 15:00:00', 'cancelada', '2025-10-29 19:54:05', '2025-10-29 19:54:05');

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
('SES-10', 10, '192.168.1.10', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-10 10:00:00', '2025-10-10 18:10:23'),
('SES-11', 1, '192.168.1.11', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-23 16:00:00', '2025-10-23 16:30:00'),
('SES-12', 2, '192.168.1.12', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-23 15:30:00', '2025-10-23 16:30:00'),
('SES-13', 3, '192.168.1.13', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-23 14:50:00', '2025-10-23 16:30:00'),
('SES-14', 4, '192.168.1.14', 'Mozilla/5.0 (Android)', NULL, '2025-10-22 09:00:00', '2025-10-23 16:30:00'),
('SES-15', 5, '192.168.1.15', 'Mozilla/5.0 (Linux)', NULL, '2025-10-23 13:15:00', '2025-10-23 16:30:00'),
('SES-16', 6, '192.168.1.16', 'Mozilla/5.0 (iPad)', NULL, '2025-10-23 12:45:00', '2025-10-23 16:30:00'),
('SES-17', 7, '192.168.1.17', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-21 10:20:00', '2025-10-23 16:30:00'),
('SES-18', 8, '192.168.1.18', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-23 11:05:00', '2025-10-23 16:30:00'),
('SES-19', 9, '192.168.1.19', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-23 10:30:00', '2025-10-23 16:30:00'),
('SES-20', 10, '192.168.1.20', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-23 09:00:00', '2025-10-23 16:30:00'),
('SES-21', 11, '192.168.1.21', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-23 15:00:00', '2025-10-23 16:35:00'),
('SES-22', 12, '192.168.1.22', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-23 14:30:00', '2025-10-23 16:35:00'),
('SES-23', 13, '192.168.1.23', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-23 13:50:00', '2025-10-23 16:35:00'),
('SES-24', 14, '192.168.1.24', 'Mozilla/5.0 (Android)', NULL, '2025-10-22 08:00:00', '2025-10-23 16:35:00'),
('SES-25', 15, '192.168.1.25', 'Mozilla/5.0 (Linux)', NULL, '2025-10-23 12:15:00', '2025-10-23 16:35:00'),
('SES-26', 16, '192.168.1.26', 'Mozilla/5.0 (iPad)', NULL, '2025-10-23 11:45:00', '2025-10-23 16:35:00'),
('SES-27', 17, '192.168.1.27', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-21 09:20:00', '2025-10-23 16:35:00'),
('SES-28', 18, '192.168.1.28', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-23 10:05:00', '2025-10-23 16:35:00'),
('SES-29', 19, '192.168.1.29', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-23 09:30:00', '2025-10-23 16:35:00'),
('SES-30', 20, '192.168.1.30', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-23 08:00:00', '2025-10-23 16:35:00'),
('SES-31', 1, '192.168.1.31', 'Mozilla/5.0 (Windows NT 10.0)', NULL, '2025-10-23 17:00:00', '2025-10-23 16:35:00'),
('SES-32', 2, '192.168.1.32', 'Mozilla/5.0 (Macintosh)', NULL, '2025-10-23 16:30:00', '2025-10-23 16:35:00'),
('SES-33', 3, '192.168.1.33', 'Mozilla/5.0 (iPhone)', NULL, '2025-10-23 15:50:00', '2025-10-23 16:35:00'),
('SES-34', 4, '192.168.1.34', 'Mozilla/5.0 (Android)', NULL, '2025-10-22 10:00:00', '2025-10-23 16:35:00'),
('SES-35', 5, '192.168.1.35', 'Mozilla/5.0 (Linux)', NULL, '2025-10-23 14:15:00', '2025-10-23 16:35:00'),
('SES-36', 6, '192.168.1.36', 'Mozilla/5.0 (iPad)', NULL, '2025-10-23 13:45:00', '2025-10-23 16:35:00'),
('SES-37', 7, '192.168.1.37', 'Mozilla/5.0 (Tablet)', NULL, '2025-10-21 11:20:00', '2025-10-23 16:35:00'),
('SES-38', 8, '192.168.1.38', 'Mozilla/5.0 (Smart TV)', NULL, '2025-10-23 12:05:00', '2025-10-23 16:35:00'),
('SES-39', 9, '192.168.1.39', 'Mozilla/5.0 (Windows NT 6.1)', NULL, '2025-10-23 11:30:00', '2025-10-23 16:35:00'),
('SES-40', 10, '192.168.1.40', 'Mozilla/5.0 (Windows NT 5.1)', NULL, '2025-10-23 10:00:00', '2025-10-23 16:35:00');

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
(10, 10, 'agua', '2025-09', NULL, 0.680000, 1850.00, '2025-10-10 18:07:57', '2025-10-10 18:07:57'),
(11, 1, 'electricidad', '2025-09', NULL, 0.900000, 2500.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 'agua', '2025-09', NULL, 0.700000, 1900.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 'gas', '2025-09', NULL, 1.150000, 2100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 'electricidad', '2025-09', NULL, 1.050000, 2700.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 'agua', '2025-09', NULL, 0.620000, 1750.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 'gas', '2025-09', NULL, 1.350000, 2300.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 'electricidad', '2025-09', NULL, 0.980000, 2450.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 'agua', '2025-09', NULL, 0.650000, 1800.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 'gas', '2025-09', NULL, 1.220000, 2250.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 'electricidad', '2025-09', NULL, 0.930000, 2550.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 'agua', '2025-09', NULL, 0.670000, 1820.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 'gas', '2025-09', NULL, 1.210000, 2220.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 'electricidad', '2025-09', NULL, 0.960000, 2520.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 'agua', '2025-09', NULL, 0.710000, 1920.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 'gas', '2025-09', NULL, 1.310000, 2020.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 'electricidad', '2025-09', NULL, 1.010000, 2620.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 'agua', '2025-09', NULL, 0.610000, 1720.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 'gas', '2025-09', NULL, 1.260000, 2120.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 'electricidad', '2025-09', NULL, 0.910000, 2420.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 'agua', '2025-09', NULL, 0.690000, 1870.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 'gas', '2025-10', NULL, 1.220000, 2250.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 'electricidad', '2025-10', NULL, 0.920000, 2550.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 'agua', '2025-10', NULL, 0.630000, 1850.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 'gas', '2025-10', NULL, 1.180000, 2150.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 'electricidad', '2025-10', NULL, 1.070000, 2750.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 'agua', '2025-10', NULL, 0.600000, 1780.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 'gas', '2025-10', NULL, 1.370000, 2350.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 'electricidad', '2025-10', NULL, 1.000000, 2650.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 'agua', '2025-10', NULL, 0.580000, 1680.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 'gas', '2025-10', NULL, 1.280000, 2180.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ticket`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `ticket`;
CREATE TABLE `ticket` (
`id` bigint
,`comunidad_id` bigint
,`unidad_id` bigint
,`categoria` varchar(120)
,`titulo` varchar(200)
,`descripcion` varchar(1000)
,`estado` enum('abierto','en_progreso','resuelto','cerrado')
,`prioridad` enum('baja','media','alta')
,`asignado_a` bigint
,`attachments_json` longtext
,`created_at` datetime
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
(10, 10, 10, 'Electricidad', 'Cortocircuito', 'Olor a quemado cerca de la sala eléctrica.', 'cerrado', 'alta', 4, NULL, '2025-10-10 18:10:21', '2025-10-10 18:10:21'),
(11, 1, 2, 'Mantención', 'Revisión Caldera Noviembre', 'Programar revisión preventiva de caldera para T2.', 'abierto', 'media', 8, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(12, 1, NULL, 'Jardinería', 'Poda árboles sector piscina', 'Realizar poda formativa antes de temporada alta.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(13, 2, 13, 'Electricidad', 'Revisar tablero eléctrico D306', 'Residente reporta cortes intermitentes.', 'en_progreso', 'alta', 2, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(14, 2, NULL, 'Seguridad', 'Cambio batería cámara Padel', 'Batería baja en cámara de cancha de Padel.', 'abierto', 'media', 6, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(15, 3, 14, 'Plomería', 'Revisión bomba agua D403', 'Ruidos extraños al activar bomba de agua de la unidad.', 'abierto', 'media', 7, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(16, 3, NULL, 'Limpieza', 'Limpieza profunda Gimnasio', 'Programar limpieza de máquinas y piso.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(17, 1, NULL, 'Administración', 'Preparar Asamblea Noviembre', 'Coordinar citación y temas para asamblea ordinaria.', 'en_progreso', 'alta', 1, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(18, 2, NULL, 'Mantención', 'Certificación Sello Verde Gas', 'Realizar inspección para renovación de sello verde.', 'abierto', 'alta', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(19, 3, 4, 'Infraestructura', 'Reparar baldosa suelta D403', 'Baldosa suelta en terraza de unidad D403.', 'resuelto', 'baja', 6, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(20, 1, 11, 'Iluminación', 'Instalar luces LED pasillo piso 1', 'Reemplazar focos antiguos por LED en Torre 3 piso 1.', 'abierto', 'media', 8, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(21, 1, NULL, 'Seguridad', 'Revisar control acceso vehicular', 'Barrera de acceso vehicular presenta fallas intermitentes.', 'abierto', 'alta', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(22, 2, 3, 'Limpieza', 'Limpieza ducto basura obstruido', 'Ducto de basura del piso 3 bloqueado.', 'en_progreso', 'alta', 6, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(23, 3, 14, 'Ascensor', 'Botón piso 4 no funciona', 'Botón de llamada del piso 4 no responde.', 'abierto', 'media', 7, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(24, 1, NULL, 'Jardinería', 'Fertilizar áreas verdes comunes', 'Aplicar fertilizante temporada primavera.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(25, 2, 13, 'Seguridad', 'Ajustar sensor movimiento Padel', 'Sensor de luz de cancha Padel no se activa correctamente.', 'abierto', 'media', 2, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(26, 3, NULL, 'Mantención', 'Pintura demarcación estacionamientos', 'Repintar líneas de estacionamientos subterráneos.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(27, 1, 1, 'Administración', 'Actualizar reglamento interno', 'Incorporar nuevas normas aprobadas en asamblea.', 'cerrado', 'baja', 1, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(28, 2, 2, 'Electricidad', 'Revisar enchufe quincho', 'Enchufe cercano a parrilla no funciona.', 'abierto', 'media', 2, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(29, 3, 3, 'Plomería', 'Llave lavaplatos D402 gotea', 'Residente reporta goteo constante en llave de cocina.', 'abierto', 'baja', 7, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(30, 1, NULL, 'Limpieza', 'Limpieza ventanas fachada Torre 1', 'Programar limpieza exterior de ventanas.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:26:32', '2025-10-29 19:26:32'),
(31, 1, 1, 'Plomería', 'Goteo llave baño', 'Llave del lavamanos principal gotea.', 'abierto', 'baja', 7, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(32, 2, NULL, 'Áreas Comunes', 'Basurero roto', 'Basurero exterior cerca de quincho está roto.', 'abierto', 'media', 6, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(33, 3, 14, 'Electricidad', 'Timbre no funciona D403', 'El timbre de la puerta no suena.', 'en_progreso', 'media', 2, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(34, 1, NULL, 'Seguridad', 'Portón vehicular lento', 'Portón de acceso vehicular abre y cierra muy lento.', 'abierto', 'alta', NULL, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(35, 2, 13, 'Gas', 'Olor a gas D306', 'Residente reporta sentir olor a gas en la cocina.', 'abierto', 'alta', 7, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(36, 3, NULL, 'Jardinería', 'Regador automático defectuoso', 'Regador del sector A no se apaga.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(37, 1, 2, 'Administración', 'Consulta sobre gasto común', 'Residente D201 tiene dudas sobre cobro extra.', 'resuelto', 'baja', 1, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(38, 2, NULL, 'Limpieza', 'Manchas en alfombra pasillo P2', 'Alfombra del pasillo del piso 2 necesita limpieza.', 'abierto', 'baja', 6, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(39, 3, 4, 'Ascensor', 'Puerta ascensor no cierra bien', 'Puerta del ascensor a veces queda entreabierta.', 'en_progreso', 'alta', 7, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(40, 1, 11, 'Iluminación', 'Sensor luz bodega B102 no funciona', 'Luz de la bodega no enciende automáticamente.', 'abierto', 'media', 8, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(41, 2, NULL, 'Mantención', 'Revisar extintores', 'Programar revisión anual de extintores.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(42, 3, 3, 'Infraestructura', 'Ventana D402 no cierra', 'Ventana del dormitorio principal no sella bien.', 'abierto', 'media', 6, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(43, 1, NULL, 'Seguridad', 'Aumentar rondas nocturnas', 'Sugerencia de residente por ruidos sospechosos.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(44, 2, 2, 'Plomería', 'Desagüe lavaplatos lento D305', 'Agua del lavaplatos desagua muy lento.', 'abierto', 'baja', 7, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(45, 3, NULL, 'Áreas Comunes', 'Reparar banca plaza interior', 'Una de las bancas de madera está suelta.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(46, 1, 12, 'Electricidad', 'Falta de energía enchufe terraza D202', 'Enchufe exterior de la terraza no tiene corriente.', 'abierto', 'media', 8, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(47, 2, NULL, 'Limpieza', 'Limpieza de vidrios quincho', 'Vidrios del quincho necesitan limpieza post-evento.', 'cerrado', 'baja', 6, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(48, 3, 14, 'Gas', 'Revisión calefont D403', 'Calefont se apaga inesperadamente.', 'abierto', 'media', 7, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(49, 1, NULL, 'Jardinería', 'Plaga de pulgones en rosales', 'Rosales del jardín principal afectados por pulgones.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(50, 2, 13, 'Administración', 'Solicitud certificado residencia D306', 'Residente necesita certificado para trámite.', 'resuelto', 'baja', 1, NULL, '2025-10-29 19:39:23', '2025-10-29 19:39:23'),
(51, 4, 5, 'Jardinería', 'Pasto seco sector Casa A', 'Zona de pasto cerca de la entrada está amarilla.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(52, 5, 6, 'Seguridad', 'Luz quemada acceso Estación Central', 'Foco principal de entrada vehicular apagado.', 'en_progreso', 'alta', 5, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(53, 6, 7, 'Mantención', 'Puerta quincho no cierra', 'Puerta principal del quincho techado no ajusta bien.', 'abierto', 'media', 1, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(54, 7, 8, 'Iluminación', 'Foco pasillo piso 10 quemado', 'Foco en pasillo cerca de D1501 apagado.', 'resuelto', 'media', 5, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(55, 8, 9, 'Infraestructura', 'Baldosa suelta escalera bloque 1', 'Baldosa en descanso de escalera entre piso 1 y 2.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(56, 9, 10, 'Ascensor', 'Ascensor T1 lento', 'Ascensor de la Torre 1 sube más lento de lo normal.', 'en_progreso', 'media', 3, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(57, 10, 10, 'Electricidad', 'Enchufe D201 sin corriente', 'Enchufe de la sala de estar no funciona.', 'abierto', 'media', 4, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(58, 11, 11, 'Plomería', 'WC D102 pierde agua', 'Estanque del WC tiene una fuga constante.', 'abierto', 'media', 7, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(59, 12, 13, 'Áreas Comunes', 'Juego infantil roto', 'Columpio de plaza necesita reparación.', 'abierto', 'alta', NULL, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(60, 13, 14, 'Seguridad', 'Citófono D403 no llama', 'No se puede llamar a la unidad D403 desde conserjería.', 'en_progreso', 'media', 2, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(61, 14, 15, 'Gas', 'Revisión conexión cocina Casa B', 'Residente solicita revisión preventiva.', 'abierto', 'baja', 7, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(62, 15, 16, 'Jardinería', 'Árbol caído por viento', 'Árbol pequeño caído cerca de Plaza Independencia.', 'abierto', 'alta', NULL, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(63, 16, 17, 'Mantención', 'Filtración en gimnasio', 'Mancha de humedad en techo cerca de máquinas.', 'abierto', 'media', 1, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(64, 17, 18, 'Iluminación', 'Luz subterráneo -1 intermitente', 'Foco de estacionamiento E151 parpadea.', 'resuelto', 'baja', 5, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(65, 18, 19, 'Infraestructura', 'Pintura descascarada balcón D106', 'Necesita retoque de pintura exterior.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(66, 19, 20, 'Ascensor', 'Espejo ascensor B2 trizado', 'Espejo interior del ascensor del Bloque 2 está dañado.', 'abierto', 'media', 3, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(67, 20, 20, 'Electricidad', 'Tablero sala bombas con ruido', 'Se escucha un zumbido eléctrico fuerte.', 'abierto', 'alta', 4, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(68, 21, 21, 'Plomería', 'Calefont D103 no enciende', 'Residente no tiene agua caliente.', 'abierto', 'alta', 7, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(69, 22, 22, 'Áreas Comunes', 'Puerta sala multiuso atascada', 'Cuesta abrir la puerta principal.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(70, 23, 23, 'Seguridad', 'Cámara piscina no graba', 'Revisar grabación de cámara sector piscina.', 'en_progreso', 'media', 2, NULL, '2025-10-29 19:43:46', '2025-10-29 19:43:46'),
(71, 36, 36, 'Mantención', 'Revisar calefacción central', 'No calienta lo suficiente.', 'abierto', 'media', 1, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(72, 46, 46, 'Limpieza', 'Limpieza post mudanza D801', 'Unidad D801 desocupada, necesita limpieza.', 'abierto', 'baja', 6, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(73, 49, 49, 'Seguridad', 'Cámaras piso 5 offline', 'Cámaras del pasillo piso 5 no transmiten.', 'en_progreso', 'alta', 2, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(74, 40, 40, 'Áreas Comunes', 'Reposición ampolleta Quincho', 'Ampolleta quemada en quincho principal.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(75, 41, 41, 'Electricidad', 'Enchufe sin corriente D101', 'Enchufe del living no funciona.', 'abierto', 'media', 8, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(76, 59, 59, 'Jardinería', 'Pasto crecido sector juegos', 'Necesita corte de pasto urgente.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(77, 32, 32, 'Plomería', 'Fuga agua medidor D301', 'Se observa goteo en el medidor de agua.', 'abierto', 'alta', 7, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(78, 36, 76, 'Ascensor', 'Botón PB no ilumina', 'Luz del botón de Planta Baja no enciende.', 'abierto', 'baja', 3, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(79, 46, 91, 'Administración', 'Solicitud copia reglamento', 'Residente nuevo solicita copia del reglamento.', 'cerrado', 'baja', 1, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(80, 49, 97, 'Mantención', 'Silla rota sala de espera', 'Una silla de la recepción tiene pata quebrada.', 'abierto', 'baja', NULL, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(81, 40, 80, 'Seguridad', 'Alarma D900 sonando', 'Alarma de departamento suena intermitentemente.', 'en_progreso', 'alta', 2, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(82, 41, 81, 'Limpieza', 'Mancha aceite estacionamiento E101', 'Limpiar mancha de aceite.', 'abierto', 'media', 6, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(83, 59, 117, 'Áreas Comunes', 'Puerta acceso bodega B2001 atascada', 'Cuesta abrir la puerta de la bodega.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(84, 32, 71, 'Electricidad', 'Luz parpadeante baño D1301', 'Luz del baño principal parpadea.', 'abierto', 'baja', 8, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(85, 36, 36, 'Gas', 'Revisión Sello Verde D501', 'Programar inspección para renovación.', 'abierto', 'media', 7, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(86, 46, 46, 'Jardinería', 'Arbusto seco entrada Chillán', 'Retirar arbusto seco.', 'resuelto', 'baja', NULL, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(87, 49, 49, 'Mantención', 'Bisagra suelta puerta acceso T03', 'Puerta principal de Torre C.', 'abierto', 'media', 1, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(88, 40, 40, 'Iluminación', 'Foco quemado subterráneo -2', 'Zona E100 oscura.', 'abierto', 'media', 8, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(89, 41, 41, 'Infraestructura', 'Cerámica suelta pasillo piso 5', 'Cerámica cerca de D501.', 'abierto', 'media', NULL, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07'),
(90, 59, 59, 'Seguridad', 'Problema con tarjeta acceso', 'Tarjeta de residente D2001 no funciona.', 'abierto', 'alta', 2, NULL, '2025-10-29 19:54:07', '2025-10-29 19:54:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_infraccion`
--

DROP TABLE IF EXISTS `tipo_infraccion`;
CREATE TABLE `tipo_infraccion` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint DEFAULT NULL,
  `clave` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `monto_default` decimal(12,2) DEFAULT NULL,
  `prioridad_default` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  `icono` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `tipo_infraccion`
--

INSERT INTO `tipo_infraccion` (`id`, `comunidad_id`, `clave`, `nombre`, `descripcion`, `monto_default`, `prioridad_default`, `icono`, `activo`, `created_at`) VALUES
(1, 1, 'ruido', 'Ruido excesivo', 'Violación de normas de ruido', 50000.00, 'media', 'volume-up', 1, '2025-10-24 01:27:49'),
(2, 2, 'estacionamiento', 'Estacionamiento indebido', 'Vehículo mal estacionado', 35000.00, 'media', 'parking', 1, '2025-10-24 01:27:49'),
(3, 3, 'mascotas', 'Mascotas sin control', 'Mascotas sin correa o supervisión', 25000.00, 'baja', 'paw', 1, '2025-10-24 01:27:49'),
(4, 5, 'limpieza', 'Falta de limpieza', 'Áreas comunes sucias', 20000.00, 'baja', 'broom', 1, '2025-10-24 01:27:49');

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
(10, 9, 9, 10, 'arrendatario', '2024-10-01', NULL, 100.00, '2025-10-10 18:07:55', '2025-10-10 18:07:55'),
(11, 1, 2, 11, 'propietario', '2025-01-01', NULL, 50.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 1, 2, 12, 'propietario', '2025-01-01', NULL, 50.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 2, 3, 13, 'arrendatario', '2025-03-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 3, 4, 14, 'propietario', '2025-04-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 4, 5, 15, 'arrendatario', '2025-05-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 5, 6, 16, 'propietario', '2025-06-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 6, 7, 17, 'arrendatario', '2025-07-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 7, 8, 18, 'propietario', '2025-08-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 8, 9, 19, 'arrendatario', '2025-09-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 9, 10, 20, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 11, 21, 'propietario', '2024-01-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 13, 22, 'arrendatario', '2024-02-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 14, 23, 'propietario', '2024-03-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 15, 24, 'arrendatario', '2024-04-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 16, 25, 'propietario', '2024-05-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 17, 26, 'arrendatario', '2024-06-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 18, 27, 'propietario', '2024-07-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 19, 28, 'arrendatario', '2024-08-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 20, 29, 'propietario', '2024-09-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 20, 30, 'arrendatario', '2024-10-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 1, 1, 1, 'arrendatario', '2025-01-01', '2025-08-31', 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 2, 3, 2, 'propietario', '2025-02-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 3, 4, 3, 'arrendatario', '2025-03-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 4, 5, 4, 'propietario', '2025-04-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 5, 6, 5, 'arrendatario', '2025-05-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 6, 7, 6, 'propietario', '2025-06-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 7, 8, 7, 'arrendatario', '2025-07-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 8, 9, 8, 'propietario', '2025-08-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 9, 10, 9, 'arrendatario', '2025-09-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 10, 10, 10, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 41, 41, 41, 'propietario', '2025-01-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(42, 41, 42, 42, 'arrendatario', '2025-02-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(43, 42, 43, 43, 'propietario', '2025-03-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(44, 42, 44, 44, 'arrendatario', '2025-04-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(45, 43, 45, 45, 'propietario', '2025-05-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(46, 43, 46, 46, 'arrendatario', '2025-06-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(47, 44, 47, 47, 'propietario', '2025-07-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(48, 44, 48, 48, 'arrendatario', '2025-08-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(49, 45, 49, 49, 'propietario', '2025-09-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(50, 45, 50, 50, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(51, 46, 51, 51, 'propietario', '2025-01-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(52, 46, 52, 52, 'arrendatario', '2025-02-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(53, 47, 53, 53, 'propietario', '2025-03-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(54, 47, 54, 54, 'arrendatario', '2025-04-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(55, 48, 55, 55, 'propietario', '2025-05-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(56, 48, 56, 56, 'arrendatario', '2025-06-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(57, 49, 57, 57, 'propietario', '2025-07-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(58, 49, 58, 58, 'arrendatario', '2025-08-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(59, 50, 59, 59, 'propietario', '2025-09-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(60, 50, 60, 60, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(61, 51, 61, 41, 'arrendatario', '2025-01-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(62, 51, 62, 42, 'propietario', '2025-02-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(63, 52, 63, 43, 'arrendatario', '2025-03-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(64, 52, 64, 44, 'propietario', '2025-04-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(65, 53, 65, 45, 'arrendatario', '2025-05-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(66, 53, 66, 46, 'propietario', '2025-06-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(67, 54, 67, 47, 'arrendatario', '2025-07-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(68, 54, 68, 48, 'propietario', '2025-08-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(69, 55, 69, 49, 'arrendatario', '2025-09-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(70, 55, 70, 50, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(71, 56, 71, 51, 'arrendatario', '2025-01-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(72, 56, 72, 52, 'propietario', '2025-02-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(73, 57, 73, 53, 'arrendatario', '2025-03-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(74, 57, 74, 54, 'propietario', '2025-04-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(75, 58, 75, 55, 'arrendatario', '2025-05-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(76, 58, 76, 56, 'propietario', '2025-06-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(77, 59, 77, 57, 'arrendatario', '2025-07-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(78, 59, 78, 58, 'propietario', '2025-08-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(79, 60, 79, 59, 'arrendatario', '2025-09-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(80, 60, 80, 60, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(81, 41, 81, 61, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(82, 41, 82, 62, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(83, 42, 83, 63, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(84, 42, 84, 64, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(85, 43, 85, 65, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(86, 43, 86, 66, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(87, 44, 87, 67, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(88, 44, 88, 68, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(89, 45, 89, 69, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(90, 45, 90, 70, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(91, 46, 91, 71, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(92, 46, 92, 72, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(93, 47, 93, 73, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(94, 47, 94, 74, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(95, 48, 95, 75, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(96, 48, 96, 76, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(97, 49, 97, 77, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(98, 49, 98, 78, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(99, 50, 99, 79, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(100, 50, 100, 80, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(101, 51, 101, 61, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(102, 51, 102, 62, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(103, 52, 103, 63, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(104, 52, 104, 64, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(105, 53, 105, 65, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(106, 53, 106, 66, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(107, 54, 107, 67, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(108, 54, 108, 68, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(109, 55, 109, 69, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(110, 55, 110, 70, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(111, 56, 111, 71, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(112, 56, 112, 72, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(113, 57, 113, 73, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(114, 57, 114, 74, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(115, 58, 115, 75, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(116, 58, 116, 76, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(117, 59, 117, 77, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(118, 59, 118, 78, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(119, 60, 119, 79, 'arrendatario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(120, 60, 120, 80, 'propietario', '2025-10-01', NULL, 100.00, '2025-10-23 16:45:00', '2025-10-23 16:45:00');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `titularidad_unidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `titularidad_unidad`;
CREATE TABLE `titularidad_unidad` (
`id` bigint
,`comunidad_id` bigint
,`unidad_id` bigint
,`persona_id` bigint
,`tipo` enum('propietario','arrendatario')
,`desde` date
,`hasta` date
,`porcentaje` decimal(5,2)
,`created_at` datetime
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
(10, 10, 'Torre 1', 'T1', '2025-10-10 18:07:38', '2025-10-10 18:07:38'),
(11, 1, 'Torre 3', 'T03', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 2, 'Torre Sur', 'TS', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 3, 'Torre B', 'TB', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 4, 'Sector B', 'SB', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 5, 'Torre Central', 'TC', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 6, 'Luxury B', 'LB', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 7, 'Central B', 'CB', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 8, 'Bloque Posterior', 'BPOS', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 9, 'Torre 2', 'T2', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 'Torre 2', 'T2', '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 'Bloque B', 'BB', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 'Bloque C', 'BC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 'Bloque C', 'BC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 'Sector C', 'SC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 'Torre 2', 'T2', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 'Bloque Mar B', 'BMB', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 'Edificio Naranjos II', 'EN2', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 'Torre Norte', 'TN', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 'Bloque 3', 'B3', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 'Torre El Sauce', 'TES', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 11, 'Bloque C', 'BC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 12, 'Bloque D', 'BD', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 13, 'Bloque D', 'BD', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 14, 'Sector D', 'SD', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 15, 'Torre 3', 'T3', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 16, 'Bloque Mar C', 'BMC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 17, 'Edificio Naranjos III', 'EN3', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 18, 'Torre Sur Oeste', 'TSO', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 19, 'Bloque 4', 'B4', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 20, 'Torre El Ciprés', 'TEC', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 41, 'Torre Única', 'T1', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(42, 42, 'Bloque A', 'T01', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(43, 43, 'Torre Única', 'TU', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(44, 44, 'Sector Principal', 'SP', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(45, 45, 'Torre A', 'TA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(46, 46, 'Torre Única', 'T01', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(47, 47, 'Bloque 1', 'B1', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(48, 48, 'Torre Única', 'TU', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(49, 49, 'Bloque Principal', 'BP', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(50, 50, 'Torre Centro', 'TC', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(51, 51, 'Torre 1', 'T1', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(52, 52, 'Torre Pacífico', 'TP', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(53, 53, 'Torre Única', 'TU', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(54, 54, 'Sector Principal', 'SP', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(55, 55, 'Torre Américas', 'TA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(56, 56, 'Bloque A', 'BA', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(57, 57, 'Torre Huéspedes', 'TH', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(58, 58, 'Torre Única', 'TU', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(59, 59, 'Torre 1', 'T01', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(60, 60, 'Torre Golf', 'TG', '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(61, 61, 'Torre B', 'T02', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(62, 62, 'Bloque B', 'B02', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(63, 63, 'Torre 2', 'T02', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(64, 64, 'Sector Sur', 'SS', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(65, 65, 'Torre B', 'TB', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(66, 66, 'Torre Oeste', 'TO', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(67, 67, 'Bloque 2', 'B2', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(68, 68, 'Bloque A', 'BA', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(69, 69, 'Torre C', 'T03', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(70, 70, 'Bloque 2', 'B2', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(71, 71, 'Torre 3', 'T03', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(72, 72, 'Bloque C', 'BC', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(73, 73, 'Bloque B', 'B02', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(74, 74, 'Sector Oeste', 'SO', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(75, 75, 'Torre Pacífico', 'TP', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(76, 76, 'Torre 1', 'T01', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(77, 77, 'Bloque C', 'B03', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(78, 78, 'Bloque Sur', 'BS', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(79, 79, 'Torre 2', 'T02', '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(80, 80, 'Bloque Norte', 'BN', '2025-10-23 16:45:00', '2025-10-23 16:45:00');

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
('2025-10-15', 39516.1700),
('2025-10-16', 39521.2600),
('2025-10-17', 39526.3500),
('2025-10-18', 39531.4400),
('2025-10-19', 39536.5300),
('2025-10-20', 39541.6200),
('2025-10-21', 39546.7100),
('2025-10-22', 39551.8000),
('2025-10-23', 39556.8900),
('2025-10-24', 39561.9800),
('2025-10-25', 39567.0700),
('2025-10-26', 39572.1600),
('2025-10-27', 39577.2500),
('2025-10-28', 39582.3400),
('2025-10-29', 39587.4300),
('2025-10-30', 39592.5200),
('2025-10-31', 39597.6100),
('2025-11-01', 39602.7000),
('2025-11-02', 39607.7900),
('2025-11-03', 39612.8800),
('2025-11-04', 39617.9700),
('2025-11-05', 39623.0600),
('2025-11-06', 39628.1500),
('2025-11-07', 39633.2400),
('2025-11-08', 39638.3300),
('2025-11-09', 39643.4200),
('2025-11-10', 39648.5100),
('2025-11-11', 39653.6000),
('2025-11-12', 39658.6900),
('2025-11-13', 39663.7800),
('2025-11-14', 39668.8700);

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
(10, 10, 10, 10, 'D202', 0.019000, 70.30, NULL, NULL, 'E202', 1, '2025-10-10 18:07:39', '2025-10-10 18:07:39'),
(11, 1, 1, 11, 'D102', 0.010000, 50.00, 5.00, 'B102', 'E102', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 1, 1, 11, 'D202', 0.015000, 65.00, 8.00, 'B202', 'E202', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 2, 2, 12, 'D306', 0.017000, 70.00, NULL, 'B306', 'E306', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 3, 3, 13, 'D403', 0.024000, 80.00, 12.00, 'B403', 'E403', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 4, 4, 14, 'Casa B', 0.025000, 110.00, 50.00, NULL, 'CPB', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 5, 5, 15, 'D502', 0.011000, 50.00, 3.00, 'B502', 'E502', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 6, 6, 16, 'D1002', 0.038000, 140.00, 20.00, 'BL2', 'EL2', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 7, 7, 17, 'D1501', 0.023000, 75.00, NULL, NULL, 'E151', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 8, 8, 18, 'D106', 0.016000, 60.00, 4.00, 'B106', 'E106', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 10, 10, 20, 'D201', 0.020000, 75.00, 10.00, 'B201', 'E201', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 11, 11, 21, 'D103', 0.015000, 60.00, NULL, 'B103', 'E103', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 12, 12, 22, 'D201', 0.018000, 75.00, 8.00, 'B201', 'E201', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 13, 13, 23, 'D305', 0.022000, 85.00, 10.00, 'B305', 'E305', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 14, 14, 24, 'Casa C', 0.028000, 115.00, 45.00, NULL, 'CPC', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 15, 15, 25, 'D401', 0.013000, 58.00, NULL, 'B401', 'E401', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 16, 16, 26, 'D501', 0.035000, 130.00, 15.00, 'BL3', 'EL3', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 17, 17, 27, 'D602', 0.020000, 70.00, NULL, NULL, 'E602', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 18, 18, 28, 'D701', 0.019000, 65.00, 5.00, 'B701', 'E701', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 19, 19, 29, 'D802', 0.016000, 62.00, NULL, 'B802', 'E802', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 20, 20, 30, 'D901', 0.021000, 78.00, 10.00, 'B901', 'E901', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 21, 21, 31, 'D100', 0.014000, 55.00, NULL, 'B100', 'E100', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 22, 22, 32, 'D200', 0.019000, 70.00, 5.00, 'B200', 'E200', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 23, 23, 33, 'D300', 0.023000, 80.00, 12.00, 'B300', 'E300', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 24, 24, 34, 'Casa D', 0.026000, 125.00, 55.00, NULL, 'CPD', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 25, 25, 35, 'D400', 0.012000, 50.00, NULL, 'B400', 'E400', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 26, 26, 36, 'D500', 0.033000, 120.00, 10.00, 'BL4', 'EL4', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 27, 27, 37, 'D600', 0.021000, 72.00, NULL, NULL, 'E600', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 28, 28, 38, 'D700', 0.018000, 68.00, 4.00, 'B700', 'E700', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 29, 29, 39, 'D800', 0.015000, 60.00, NULL, 'B800', 'E800', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 30, 30, 40, 'D900', 0.020000, 75.00, 12.00, 'B900', 'E900', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 41, 41, 41, 'D501', 0.010000, 60.00, 5.00, 'B501', 'E501', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(42, 41, 41, 41, 'D502', 0.012000, 75.00, 8.00, 'B502', 'E502', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(43, 42, 42, 42, 'D401', 0.015000, 80.00, 10.00, 'B401', 'E401', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(44, 42, 42, 42, 'D402', 0.017000, 90.00, 12.00, 'B402', 'E402', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(45, 43, 43, 43, 'D601', 0.011000, 55.00, 3.00, 'B601', 'E601', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(46, 43, 43, 43, 'D602', 0.013000, 65.00, 7.00, 'B602', 'E602', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(47, 44, 44, 44, 'Casa 1', 0.030000, 150.00, 80.00, NULL, 'CP1', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(48, 44, 44, 44, 'Casa 2', 0.035000, 180.00, 100.00, NULL, 'CP2', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(49, 45, 45, 45, 'D701', 0.014000, 70.00, 9.00, 'B701', 'E701', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(50, 45, 45, 45, 'D702', 0.016000, 85.00, 11.00, 'B702', 'E702', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(51, 46, 46, 46, 'D801', 0.011000, 50.00, 4.00, 'B801', 'E801', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(52, 46, 46, 46, 'D802', 0.013000, 60.00, 6.00, 'B802', 'E802', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(53, 47, 47, 47, 'D901', 0.017000, 95.00, NULL, 'B901', 'E901', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(54, 47, 47, 47, 'D902', 0.019000, 105.00, NULL, 'B902', 'E902', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(55, 48, 48, 48, 'D1001', 0.015000, 70.00, 10.00, 'B1001', 'E1001', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(56, 48, 48, 48, 'D1002', 0.017000, 80.00, 12.00, 'B1002', 'E1002', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(57, 49, 49, 49, 'D1101', 0.012000, 60.00, 5.00, 'B1101', 'E1101', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(58, 49, 49, 49, 'D1102', 0.014000, 75.00, 8.00, 'B1102', 'E1102', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(59, 50, 50, 50, 'D1201', 0.015000, 80.00, 10.00, 'B1201', 'E1201', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(60, 50, 50, 50, 'D1202', 0.017000, 90.00, 12.00, 'B1202', 'E1202', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(61, 51, 51, 51, 'D1301', 0.010000, 55.00, 3.00, 'B1301', 'E1301', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(62, 51, 51, 51, 'D1302', 0.012000, 65.00, 7.00, 'B1302', 'E1302', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(63, 52, 52, 52, 'D1401', 0.015000, 80.00, 10.00, 'B1401', 'E1401', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(64, 52, 52, 52, 'D1402', 0.017000, 90.00, 12.00, 'B1402', 'E1402', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(65, 53, 53, 53, 'D1501', 0.011000, 50.00, 4.00, 'B1501', 'E1501', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(66, 53, 53, 53, 'D1502', 0.013000, 60.00, 6.00, 'B1502', 'E1502', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(67, 54, 54, 54, 'Parcela 1', 0.030000, 160.00, 90.00, NULL, 'CP3', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(68, 54, 54, 54, 'Parcela 2', 0.035000, 190.00, 110.00, NULL, 'CP4', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(69, 55, 55, 55, 'D1601', 0.014000, 70.00, 9.00, 'B1601', 'E1601', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(70, 55, 55, 55, 'D1602', 0.016000, 85.00, 11.00, 'B1602', 'E1602', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(71, 56, 56, 56, 'D1701', 0.011000, 50.00, 4.00, 'B1701', 'E1701', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(72, 56, 56, 56, 'D1702', 0.013000, 60.00, 6.00, 'B1702', 'E1702', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(73, 57, 57, 57, 'D1801', 0.017000, 95.00, NULL, 'B1801', 'E1801', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(74, 57, 57, 57, 'D1802', 0.019000, 105.00, NULL, 'B1802', 'E1802', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(75, 58, 58, 58, 'D1901', 0.015000, 70.00, 10.00, 'B1901', 'E1901', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(76, 58, 58, 58, 'D1902', 0.017000, 80.00, 12.00, 'B1902', 'E1902', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(77, 59, 59, 59, 'D2001', 0.012000, 60.00, 5.00, 'B2001', 'E2001', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(78, 59, 59, 59, 'D2002', 0.014000, 75.00, 8.00, 'B2002', 'E2002', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(79, 60, 60, 60, 'D2101', 0.015000, 80.00, 10.00, 'B2101', 'E2101', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(80, 60, 60, 60, 'D2102', 0.017000, 90.00, 12.00, 'B2102', 'E2102', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(81, 41, 61, 61, 'D101', 0.011000, 58.00, 5.00, 'B101', 'E101', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(82, 41, 61, 61, 'D102', 0.013000, 72.00, 8.00, 'B102', 'E102', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(83, 42, 62, 62, 'D201', 0.016000, 85.00, 10.00, 'B201', 'E201', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(84, 42, 62, 62, 'D202', 0.018000, 95.00, 12.00, 'B202', 'E202', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(85, 43, 63, 63, 'D301', 0.010000, 50.00, 3.00, 'B301', 'E301', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(86, 43, 63, 63, 'D302', 0.012000, 60.00, 7.00, 'B302', 'E302', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(87, 44, 64, 64, 'Casa 3', 0.032000, 160.00, 90.00, NULL, 'CP3', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(88, 44, 64, 64, 'Casa 4', 0.037000, 190.00, 110.00, NULL, 'CP4', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(89, 45, 65, 65, 'D401', 0.015000, 75.00, 9.00, 'B401', 'E401', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(90, 45, 65, 65, 'D402', 0.017000, 90.00, 11.00, 'B402', 'E402', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(91, 46, 66, 66, 'D501', 0.010000, 55.00, 4.00, 'B501', 'E501', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(92, 46, 66, 66, 'D502', 0.012000, 65.00, 6.00, 'B502', 'E502', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(93, 47, 67, 67, 'D601', 0.018000, 98.00, NULL, 'B601', 'E601', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(94, 47, 67, 67, 'D602', 0.020000, 108.00, NULL, 'B602', 'E602', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(95, 48, 68, 68, 'D701', 0.016000, 75.00, 10.00, 'B701', 'E701', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(96, 48, 68, 68, 'D702', 0.018000, 85.00, 12.00, 'B702', 'E702', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(97, 49, 69, 69, 'D801', 0.013000, 65.00, 5.00, 'B801', 'E801', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(98, 49, 69, 69, 'D802', 0.015000, 80.00, 8.00, 'B802', 'E802', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(99, 50, 70, 70, 'D901', 0.016000, 85.00, 10.00, 'B901', 'E901', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(100, 50, 70, 70, 'D902', 0.018000, 95.00, 12.00, 'B902', 'E902', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(101, 51, 71, 71, 'D1001', 0.011000, 58.00, 5.00, 'B1001', 'E1001', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(102, 51, 71, 71, 'D1002', 0.013000, 72.00, 8.00, 'B1002', 'E1002', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(103, 52, 72, 72, 'D1101', 0.016000, 85.00, 10.00, 'B1101', 'E1101', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(104, 52, 72, 72, 'D1102', 0.018000, 95.00, 12.00, 'B1102', 'E1102', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(105, 53, 73, 73, 'D1201', 0.010000, 50.00, 3.00, 'B1201', 'E1201', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(106, 53, 73, 73, 'D1202', 0.012000, 60.00, 7.00, 'B1202', 'E1202', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(107, 54, 74, 74, 'Casa 5', 0.032000, 160.00, 90.00, NULL, 'CP5', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(108, 54, 74, 74, 'Casa 6', 0.037000, 190.00, 110.00, NULL, 'CP6', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(109, 55, 75, 75, 'D1301', 0.015000, 75.00, 9.00, 'B1301', 'E1301', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(110, 55, 75, 75, 'D1302', 0.017000, 90.00, 11.00, 'B1302', 'E1302', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(111, 56, 76, 76, 'D1401', 0.010000, 55.00, 4.00, 'B1401', 'E1401', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(112, 56, 76, 76, 'D1402', 0.012000, 65.00, 6.00, 'B1402', 'E1402', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(113, 57, 77, 77, 'D1501', 0.018000, 98.00, NULL, 'B1501', 'E1501', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(114, 57, 77, 77, 'D1502', 0.020000, 108.00, NULL, 'B1502', 'E1502', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(115, 58, 78, 78, 'D1601', 0.016000, 75.00, 10.00, 'B1601', 'E1601', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(116, 58, 78, 78, 'D1602', 0.018000, 85.00, 12.00, 'B1602', 'E1602', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(117, 59, 79, 79, 'D1701', 0.013000, 65.00, 5.00, 'B1701', 'E1701', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(118, 59, 79, 79, 'D1702', 0.015000, 80.00, 8.00, 'B1702', 'E1702', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(119, 60, 80, 80, 'D1801', 0.016000, 85.00, 10.00, 'B1801', 'E1801', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(120, 60, 80, 80, 'D1802', 0.018000, 95.00, 12.00, 'B1802', 'E1802', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00');

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
(10, 10, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-10 18:10:24', '2025-10-10 18:10:24'),
(21, 21, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 25, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 26, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 27, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 28, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 29, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 30, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 31, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 32, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 33, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 34, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 35, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 36, '{\"tema\": \"oscuro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 37, '{\"tema\": \"claro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 38, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"off\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 39, '{\"tema\": \"claro\", \"idioma\": \"en\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 40, '{\"tema\": \"oscuro\", \"idioma\": \"es\", \"notificaciones\": \"on\"}', '2025-10-23 16:35:00', '2025-10-23 16:35:00');

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
(1, 1, 'pquintanilla', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'pat.quintanilla@duocuc.cl', 1, '2025-10-10 18:07:28', '2025-11-07 23:30:23', 1, NULL, 0),
(2, 2, 'erobledo', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'elisabet@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:17', 0, NULL, 0),
(3, 3, 'dtrillo', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'dalila@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(4, 4, 'isedano', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'isidora@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(5, 5, 'smolins', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sigfrido@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:18', 0, NULL, 0),
(6, 6, 'jconserje', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jose@conserje.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:19', 0, NULL, 0),
(7, 7, 'jpiñol', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jordi@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:19', 0, NULL, 0),
(8, 8, 'fadmin', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'flora@admin.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:23', 0, NULL, 0),
(9, 9, 'lalonsop', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'lina@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:24', 0, NULL, 0),
(10, 10, 'abarros', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'alejandro@email.cl', 1, '2025-10-10 18:07:28', '2025-10-10 18:41:42', 0, NULL, 0),
(11, 11, 'cramirez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'carla@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(12, 12, 'rfuentes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'roberto@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(13, 13, 'scastro', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sofia@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(14, 14, 'fnavarro', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'felipe@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(15, 15, 'cvargas', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'claudia@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(16, 16, 'agomez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'andres@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(17, 17, 'mlopez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'maria@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(18, 18, 'jmuñoz', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'javier@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(19, 19, 'ediaz', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'elena@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(20, 20, 'jperez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'jorge@email.cl', 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00', 0, NULL, 0),
(21, 21, 'pguzman', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'pedro@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(22, 22, 'lsoto', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'laura@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(23, 23, 'maraya', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'miguel@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(24, 24, 'cdiaz', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'constanza@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(25, 25, 'rtapia', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ricardo@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(26, 26, 'vrojas', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'valentina@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(27, 27, 'dflores', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'diego@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(28, 28, 'fherrera', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'francisca@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(29, 29, 'pvidal', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'pablo@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(30, 30, 'cmolina', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'catalina@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(31, 31, 'mnavarrete', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'mario@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(32, 32, 'lpizarro', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'lucia@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(33, 33, 'bcorrea', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'benja@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(34, 34, 'fcastro', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'fer@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(35, 35, 'igonzalez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ignacio@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(36, 36, 'creyes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'camila@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(37, 37, 'jsilva', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'javiers@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(38, 38, 'nperez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'nicole@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(39, 39, 'svasquez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'seba@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(40, 40, 'alagos', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'andrea@email.cl', 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00', 0, NULL, 0),
(41, 41, 'gnunez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'gabriel@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(42, 42, 'dsanchez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'daniela@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(43, 43, 'hramos', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'hector@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(44, 44, 'tmorales', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'tamara@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(45, 45, 'ifuentes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ismael@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(46, 46, 'lriquelme', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'lorena@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(47, 47, 'jsalazar', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'joaquin@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(48, 48, 'nvera', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'natalia@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(49, 49, 'rorellana', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'renato@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(50, 50, 'amendez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'alejandra@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(51, 51, 'fcortes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'fabian@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(52, 52, 'bortiz', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'barbara@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(53, 53, 'spizarro', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'simon@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(54, 54, 'egodoy', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'emilia@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(55, 55, 'cneira', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'cristobal@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(56, 56, 'mcontreras', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'martina@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(57, 57, 'vreyes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'vicente@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(58, 58, 'amaldonado', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'antonia@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(59, 59, 'szamora', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sergio@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(60, 60, 'cjara', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'consuelo@email.cl', 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00', 0, NULL, 0),
(61, 61, 'cgodoy', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'camilo.godoy@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(62, 62, 'icastroc', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'ignacia.castro@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(63, 63, 'eperez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'esteban.perez@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(64, 64, 'jlagos', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'javiera.lagos@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(65, 65, 'msoto', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'matias.soto@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(66, 66, 'pmunoz', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'paula.munoz@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(67, 67, 'anavarro', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'andres.navarro@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(68, 68, 'rgutierrez', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'rocio.gutierrez@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(69, 69, 'gvargas', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'gustavo.vargas@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(70, 70, 'dreyes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'diana.reyes@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(71, 71, 'lherrera', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'luis.herrera@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(72, 72, 'cdiazc', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'carmen.diaz@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(73, 73, 'jfuentes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'javier.fuentes@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(74, 74, 'mgodoy', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'maria.godoy@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(75, 75, 'dneira', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'daniel.neira@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(76, 76, 'sneira', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'sofia.neira@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(77, 77, 'freyes', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'felipe.reyes@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(78, 78, 'emaldonado', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'elena.maldonado@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(79, 79, 'azamora', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'alfredo.zamora@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0),
(80, 80, 'tjara', '$2y$10$/jLjFHOPbHFPoC1hv7BgbeNPYeg.qD61uHueljM80kvp0k9PCwmlO', 'teresa.jara@email.cl', 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00', 0, NULL, 0);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `usuario_miembro_comunidad`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `usuario_miembro_comunidad`;
CREATE TABLE `usuario_miembro_comunidad` (
`id` bigint
,`comunidad_id` bigint
,`persona_id` bigint
,`rol` varchar(50)
,`desde` date
,`hasta` date
,`activo` tinyint(1)
,`created_at` datetime
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
(1, 1, 1, 2, '2025-10-27', NULL, 1, '2025-10-27 17:06:56', '2025-10-27 17:06:56'),
(2, 2, 2, 8, '2024-02-15', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(3, 3, 3, 6, '2024-03-20', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(4, 4, 4, 7, '2024-04-10', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(5, 5, 5, 2, '2024-05-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(6, 6, 6, 3, '2024-06-25', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(7, 7, 7, 6, '2024-07-07', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(8, 8, 8, 10, '2024-08-18', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(9, 9, 9, 4, '2024-09-01', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(10, 10, 10, 9, '2024-10-05', NULL, 1, '2025-10-10 18:07:41', '2025-10-10 18:07:41'),
(11, 11, 1, 7, '2025-01-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(12, 12, 1, 7, '2025-01-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(13, 13, 2, 8, '2025-03-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(14, 14, 3, 7, '2025-04-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(15, 15, 4, 8, '2025-05-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(16, 16, 5, 6, '2025-06-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(17, 17, 6, 7, '2025-07-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(18, 18, 7, 8, '2025-08-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(19, 19, 8, 7, '2025-09-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(20, 20, 9, 8, '2025-10-01', NULL, 1, '2025-10-23 16:30:00', '2025-10-23 16:30:00'),
(21, 21, 11, 7, '2025-01-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(22, 22, 12, 8, '2025-02-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(23, 23, 13, 6, '2025-03-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(24, 24, 14, 7, '2025-04-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(25, 25, 15, 2, '2025-05-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(26, 26, 16, 3, '2025-06-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(27, 27, 17, 6, '2025-07-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(28, 28, 18, 10, '2025-08-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(29, 29, 19, 4, '2025-09-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(30, 30, 20, 9, '2025-10-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(31, 31, 21, 7, '2025-01-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(32, 32, 22, 8, '2025-02-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(33, 33, 23, 6, '2025-03-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(34, 34, 24, 7, '2025-04-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(35, 35, 25, 2, '2025-05-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(36, 36, 26, 3, '2025-06-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(37, 37, 27, 6, '2025-07-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(38, 38, 28, 10, '2025-08-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(39, 39, 29, 4, '2025-09-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(40, 40, 30, 9, '2025-10-01', NULL, 1, '2025-10-23 16:35:00', '2025-10-23 16:35:00'),
(41, 41, 41, 7, '2025-01-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(42, 42, 41, 8, '2025-02-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(43, 43, 42, 7, '2025-03-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(44, 44, 42, 8, '2025-04-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(45, 45, 43, 7, '2025-05-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(46, 46, 43, 8, '2025-06-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(47, 47, 44, 7, '2025-07-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(48, 48, 44, 8, '2025-08-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(49, 49, 45, 7, '2025-09-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(50, 50, 45, 8, '2025-10-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(51, 51, 46, 7, '2025-01-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(52, 52, 46, 8, '2025-02-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(53, 53, 47, 7, '2025-03-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(54, 54, 47, 8, '2025-04-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(55, 55, 48, 7, '2025-05-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(56, 56, 48, 8, '2025-06-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(57, 57, 49, 7, '2025-07-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(58, 58, 49, 8, '2025-08-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(59, 59, 50, 7, '2025-09-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(60, 60, 50, 8, '2025-10-01', NULL, 1, '2025-10-23 16:40:00', '2025-10-23 16:40:00'),
(61, 61, 41, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(62, 62, 41, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(63, 63, 42, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(64, 64, 42, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(65, 65, 43, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(66, 66, 43, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(67, 67, 44, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(68, 68, 44, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(69, 69, 45, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(70, 70, 45, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(71, 71, 46, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(72, 72, 46, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(73, 73, 47, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(74, 74, 47, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(75, 75, 48, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(76, 76, 48, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(77, 77, 49, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(78, 78, 49, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(79, 79, 50, 7, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00'),
(80, 80, 50, 8, '2025-10-01', NULL, 1, '2025-10-23 16:45:00', '2025-10-23 16:45:00');

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
('2025-10-10', 60880.97),
('2025-10-11', 61880.97),
('2025-10-12', 62880.97),
('2025-10-13', 63880.97),
('2025-10-14', 64880.97),
('2025-10-15', 65880.97),
('2025-10-16', 66880.97),
('2025-10-17', 67880.97),
('2025-10-18', 68880.97),
('2025-10-19', 69880.97),
('2025-10-20', 70880.97),
('2025-10-21', 71880.97),
('2025-10-22', 72880.97),
('2025-10-23', 73880.97),
('2025-10-24', 74880.97),
('2025-10-25', 75880.97),
('2025-10-26', 76880.97),
('2025-10-27', 77880.97),
('2025-10-28', 78880.97),
('2025-10-29', 79880.97),
('2025-10-30', 80880.97),
('2025-10-31', 81880.97),
('2025-11-01', 82880.97),
('2025-11-02', 83880.97),
('2025-11-03', 84880.97),
('2025-11-04', 85880.97),
('2025-11-05', 86880.97),
('2025-11-06', 87880.97),
('2025-11-07', 88880.97),
('2025-11-08', 89880.97),
('2025-11-09', 90880.97);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_compras`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_compras`;
CREATE TABLE `vista_compras` (
`id` bigint
,`comunidad_id` bigint
,`comunidad_nombre` varchar(200)
,`proveedor_id` bigint
,`proveedor_nombre` varchar(200)
,`tipo_doc` enum('factura','boleta','nota_credito')
,`folio` varchar(50)
,`fecha_emision` date
,`neto` decimal(12,2)
,`iva` decimal(12,2)
,`exento` decimal(12,2)
,`total` decimal(12,2)
,`glosa` varchar(250)
,`created_at` datetime
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_consumos`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_consumos`;
CREATE TABLE `vista_consumos` (
`medidor_id` bigint
,`medidor_codigo` varchar(50)
,`medidor_tipo` enum('agua','gas','electricidad')
,`comunidad_id` bigint
,`comunidad_nombre` varchar(200)
,`periodo` char(7)
,`fecha_inicio_periodo` date
,`fecha_fin_periodo` date
,`consumo` decimal(13,3)
,`lecturas_en_periodo` bigint
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_medidores`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_medidores`;
CREATE TABLE `vista_medidores` (
`id` bigint
,`comunidad_id` bigint
,`comunidad_nombre` varchar(200)
,`unidad_id` bigint
,`unidad_torre_id` bigint
,`unidad_codigo` varchar(50)
,`tipo` enum('agua','gas','electricidad')
,`medidor_codigo` varchar(50)
,`serial_number` varchar(100)
,`es_compartido` tinyint(1)
,`marca` varchar(100)
,`modelo` varchar(100)
,`estado` enum('activo','inactivo','mantenimiento')
,`ubicacion` json
,`activo` tinyint(1)
,`created_by` bigint
,`created_at` datetime
,`updated_at` datetime
,`ultima_lectura` decimal(12,3)
,`fecha_ultima_lectura` date
,`total_lecturas` bigint
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_timeline_general`
-- (Véase abajo para la vista actual)
--
DROP VIEW IF EXISTS `vista_timeline_general`;
CREATE TABLE `vista_timeline_general` (
`id` bigint
,`comunidad_id` bigint
,`tipo` varchar(11)
,`prioridad` varchar(8)
,`titulo` varchar(200)
,`descripcion` mediumtext
,`usuario` varchar(150)
,`usuario_id` bigint
,`fecha` datetime
,`tags` json
,`adjuntos` json
,`ip` varchar(45)
,`ubicacion` varchar(255)
,`created_at` datetime
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
(10, 6, 'transferencia', '{\"tx_id\": \"tr10\", \"monto\": 95000}', '2025-10-10 18:10:28', 0, NULL),
(11, 1, 'transferencia', '{\"tx_id\": \"tr11\", \"monto\": 50000}', '2025-10-23 16:30:00', 0, NULL),
(12, 2, 'webpay', '{\"tx_id\": \"wp12\", \"monto\": 15000}', '2025-10-23 16:30:00', 1, 12),
(13, 3, 'otro', '{\"detalle\": \"efectivo 30000\"}', '2025-10-23 16:30:00', 0, NULL),
(14, 4, 'transferencia', '{\"tx_id\": \"tr14\", \"monto\": 30000}', '2025-10-23 16:30:00', 1, 14),
(15, 5, 'webpay', '{\"tx_id\": \"wp15\", \"monto\": 60000}', '2025-10-23 16:30:00', 0, NULL),
(16, 6, 'transferencia', '{\"tx_id\": \"tr16\", \"monto\": 75000}', '2025-10-23 16:30:00', 0, NULL),
(17, 7, 'webpay', '{\"tx_id\": \"wp17\", \"monto\": 25000}', '2025-10-23 16:30:00', 1, 17),
(18, 8, 'transferencia', '{\"tx_id\": \"tr18\", \"monto\": 50000}', '2025-10-23 16:30:00', 0, NULL),
(19, 9, 'otro', '{\"detalle\": \"efectivo 15000\"}', '2025-10-23 16:30:00', 1, 19),
(20, 10, 'webpay', '{\"tx_id\": \"wp20\", \"monto\": 80000}', '2025-10-23 16:30:00', 1, 20),
(21, 11, 'transferencia', '{\"tx_id\": \"tr21\", \"monto\": 65000}', '2025-10-23 16:35:00', 1, 21),
(22, 12, 'webpay', '{\"tx_id\": \"wp22\", \"monto\": 32000}', '2025-10-23 16:35:00', 1, 22),
(23, 13, 'otro', '{\"detalle\": \"efectivo 48000\"}', '2025-10-23 16:35:00', 0, NULL),
(24, 14, 'transferencia', '{\"tx_id\": \"tr24\", \"monto\": 53000}', '2025-10-23 16:35:00', 1, 24),
(25, 15, 'webpay', '{\"tx_id\": \"wp25\", \"monto\": 72000}', '2025-10-23 16:35:00', 1, 25),
(26, 16, 'transferencia', '{\"tx_id\": \"tr26\", \"monto\": 42000}', '2025-10-23 16:35:00', 0, NULL),
(27, 17, 'webpay', '{\"tx_id\": \"wp27\", \"monto\": 78000}', '2025-10-23 16:35:00', 0, NULL),
(28, 18, 'transferencia', '{\"tx_id\": \"tr28\", \"monto\": 33000}', '2025-10-23 16:35:00', 1, 28),
(29, 19, 'otro', '{\"detalle\": \"efectivo 54000\"}', '2025-10-23 16:35:00', 0, NULL),
(30, 20, 'webpay', '{\"tx_id\": \"wp30\", \"monto\": 105000}', '2025-10-23 16:35:00', 1, 30),
(31, 1, 'transferencia', '{\"tx_id\": \"tr31\", \"monto\": 55000}', '2025-10-23 16:35:00', 0, NULL),
(32, 2, 'otro', '{\"detalle\": \"efectivo 45000\"}', '2025-10-23 16:35:00', 0, NULL),
(33, 3, 'transferencia', '{\"tx_id\": \"tr33\", \"monto\": 90000}', '2025-10-23 16:35:00', 0, NULL),
(34, 4, 'webpay', '{\"tx_id\": \"wp34\", \"monto\": 46000}', '2025-10-23 16:35:00', 1, 34),
(35, 5, 'otro', '{\"detalle\": \"efectivo 80000\"}', '2025-10-23 16:35:00', 0, NULL),
(36, 6, 'transferencia', '{\"tx_id\": \"tr36\", \"monto\": 98000}', '2025-10-23 16:35:00', 0, NULL),
(37, 7, 'webpay', '{\"tx_id\": \"wp37\", \"monto\": 60000}', '2025-10-23 16:35:00', 1, 37),
(38, 8, 'otro', '{\"detalle\": \"efectivo 53000\"}', '2025-10-23 16:35:00', 1, 38),
(39, 9, 'transferencia', '{\"tx_id\": \"tr39\", \"monto\": 52000}', '2025-10-23 16:35:00', 0, NULL),
(40, 10, 'webpay', '{\"tx_id\": \"wp40\", \"monto\": 75000}', '2025-10-23 16:35:00', 1, 40);

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
-- Indices de la tabla `bitacora_auditoria`
--
ALTER TABLE `bitacora_auditoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bitacora_auditoria_comunidad_fecha` (`comunidad_id`,`fecha`),
  ADD KEY `idx_bitacora_auditoria_tipo` (`tipo`),
  ADD KEY `idx_bitacora_auditoria_prioridad` (`prioridad`),
  ADD KEY `idx_bitacora_auditoria_usuario` (`usuario_id`),
  ADD KEY `idx_bitacora_auditoria_ip` (`ip`);

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
  ADD KEY `fk_documento_multa` (`multa_id`),
  ADD KEY `fk_documento_multa_usuario` (`subido_por`);

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
  ADD KEY `fk_multa_pagado_por` (`pagado_por`),
  ADD KEY `fk_multa_tipo_infraccion` (`tipo_infraccion_id`);

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
-- Indices de la tabla `tipo_infraccion`
--
ALTER TABLE `tipo_infraccion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`),
  ADD UNIQUE KEY `uq_tipo_comunidad_clave` (`comunidad_id`,`clave`),
  ADD KEY `idx_tipo_comunidad` (`comunidad_id`);

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
-- AUTO_INCREMENT de la tabla `archivos`
--
ALTER TABLE `archivos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `bitacora_auditoria`
--
ALTER TABLE `bitacora_auditoria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `categoria_gasto`
--
ALTER TABLE `categoria_gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `centro_costo`
--
ALTER TABLE `centro_costo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `conciliacion_bancaria`
--
ALTER TABLE `conciliacion_bancaria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `configuracion_interes`
--
ALTER TABLE `configuracion_interes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `detalle_cuenta_unidad`
--
ALTER TABLE `detalle_cuenta_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `detalle_emision_gastos`
--
ALTER TABLE `detalle_emision_gastos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de la tabla `documento_compra`
--
ALTER TABLE `documento_compra`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de la tabla `documento_comunidad`
--
ALTER TABLE `documento_comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `documento_multa`
--
ALTER TABLE `documento_multa`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `gasto`
--
ALTER TABLE `gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT de la tabla `gasto_aprobacion`
--
ALTER TABLE `gasto_aprobacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `historial_gasto`
--
ALTER TABLE `historial_gasto`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `lectura_medidor`
--
ALTER TABLE `lectura_medidor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT de la tabla `multa`
--
ALTER TABLE `multa`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT de la tabla `multa_apelacion`
--
ALTER TABLE `multa_apelacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `multa_historial`
--
ALTER TABLE `multa_historial`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT de la tabla `notificacion_usuario`
--
ALTER TABLE `notificacion_usuario`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT de la tabla `pago_aplicacion`
--
ALTER TABLE `pago_aplicacion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `parametros_cobranza`
--
ALTER TABLE `parametros_cobranza`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `registro_conserjeria`
--
ALTER TABLE `registro_conserjeria`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de la tabla `reserva_amenidad`
--
ALTER TABLE `reserva_amenidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de la tabla `tarifa_consumo`
--
ALTER TABLE `tarifa_consumo`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `ticket_soporte`
--
ALTER TABLE `ticket_soporte`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT de la tabla `tipo_infraccion`
--
ALTER TABLE `tipo_infraccion`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `titulares_unidad`
--
ALTER TABLE `titulares_unidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de la tabla `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT de la tabla `webhook_pago`
--
ALTER TABLE `webhook_pago`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

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

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_timeline_general`
--
DROP TABLE IF EXISTS `vista_timeline_general`;

DROP VIEW IF EXISTS `vista_timeline_general`;
CREATE ALGORITHM=UNDEFINED DEFINER=`api_admin`@`%` SQL SECURITY DEFINER VIEW `vista_timeline_general`  AS SELECT `ba`.`id` AS `id`, `ba`.`comunidad_id` AS `comunidad_id`, `ba`.`tipo` AS `tipo`, `ba`.`prioridad` AS `prioridad`, `ba`.`titulo` AS `titulo`, `ba`.`descripcion` AS `descripcion`, `ba`.`usuario` AS `usuario`, `ba`.`usuario_id` AS `usuario_id`, `ba`.`fecha` AS `fecha`, `ba`.`tags` AS `tags`, `ba`.`adjuntos` AS `adjuntos`, `ba`.`ip` AS `ip`, `ba`.`ubicacion` AS `ubicacion`, `ba`.`created_at` AS `created_at`, `ba`.`updated_at` AS `updated_at` FROM `bitacora_auditoria` AS `ba`union all select `rc`.`id` AS `id`,`rc`.`comunidad_id` AS `comunidad_id`,'user' AS `tipo`,'normal' AS `prioridad`,`rc`.`evento` AS `titulo`,`rc`.`detalle` AS `descripcion`,(select `usuario`.`username` from `usuario` where (`usuario`.`id` = `rc`.`usuario_id`) limit 1) AS `usuario`,`rc`.`usuario_id` AS `usuario_id`,`rc`.`fecha_hora` AS `fecha`,cast('[]' as json) AS `tags`,cast('[]' as json) AS `adjuntos`,NULL AS `ip`,'Conserjería' AS `ubicacion`,`rc`.`created_at` AS `created_at`,`rc`.`created_at` AS `updated_at` from `registro_conserjeria` `rc`  ;

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
  ADD CONSTRAINT `fk_archivos_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `bitacora_auditoria`
--
ALTER TABLE `bitacora_auditoria`
  ADD CONSTRAINT `fk_bitacora_auditoria_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bitacora_auditoria_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `fk_conc_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`);

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
  ADD CONSTRAINT `fk_emidet_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`);

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
  ADD CONSTRAINT `fk_gasto_ccosto` FOREIGN KEY (`centro_costo_id`) REFERENCES `centro_costo` (`id`),
  ADD CONSTRAINT `fk_gasto_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`),
  ADD CONSTRAINT `fk_gasto_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gasto_doc` FOREIGN KEY (`documento_compra_id`) REFERENCES `documento_compra` (`id`);

--
-- Filtros para la tabla `gasto_aprobacion`
--
ALTER TABLE `gasto_aprobacion`
  ADD CONSTRAINT `fk_aprobacion_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`),
  ADD CONSTRAINT `fk_aprobacion_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol_sistema` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_aprobacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_gasto`
--
ALTER TABLE `historial_gasto`
  ADD CONSTRAINT `fk_historial_gasto` FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`),
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
  ADD CONSTRAINT `fk_multa_tipo_infraccion` FOREIGN KEY (`tipo_infraccion_id`) REFERENCES `tipo_infraccion` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
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
  ADD CONSTRAINT `fk_historial_multa` FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  ADD CONSTRAINT `fk_papp_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`);

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
-- Filtros para la tabla `tipo_infraccion`
--
ALTER TABLE `tipo_infraccion`
  ADD CONSTRAINT `fk_tipo_infraccion_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_wh_pago` FOREIGN KEY (`pago_id`) REFERENCES `pago` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
