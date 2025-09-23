-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Sep 23, 2025 at 07:45 PM
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
-- Table structure for table `edificio`
--

CREATE TABLE `edificio` (
  `id` bigint NOT NULL,
  `comunidad_id` bigint NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(250) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tipo` enum('residencial','comercial','mixto','oficinas') COLLATE utf8mb4_general_ci DEFAULT 'residencial',
  `numero_torres` int DEFAULT '1',
  `pisos` int DEFAULT NULL,
  `ano_construccion` year DEFAULT NULL,
  `area_comun` decimal(10,2) DEFAULT NULL,
  `area_privada` decimal(10,2) DEFAULT NULL,
  `parqueaderos` int DEFAULT '0',
  `depositos` int DEFAULT '0',
  `administrador` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono_administrador` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email_administrador` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `servicios` json DEFAULT NULL,
  `amenidades` json DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `estado` enum('activo','inactivo','construccion','mantenimiento') COLLATE utf8mb4_general_ci DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edificio`
--

INSERT INTO `edificio` (`id`, `comunidad_id`, `nombre`, `direccion`, `codigo`, `created_at`, `updated_at`, `tipo`, `numero_torres`, `pisos`, `ano_construccion`, `area_comun`, `area_privada`, `parqueaderos`, `depositos`, `administrador`, `telefono_administrador`, `email_administrador`, `servicios`, `amenidades`, `latitud`, `longitud`, `imagen`, `observaciones`, `estado`) VALUES
(1, 1, 'Torre Norte Renovada', 'Av. Las Condes 5679, Las Condes - Actualizado', 'TNR', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 15, '2018', 1250.00, 2800.00, 35, 20, 'María González', '+56 2 29876543', 'maria.gonzalez@torres.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"vigilancia\"]', '[\"piscina\", \"gimnasio\", \"ascensor\", \"porteria\"]', -33.4103000, -70.5398000, '/images/torre-norte.jpg', 'Torre renovada con mejoras en infraestructura y servicios.', 'activo'),
(2, 1, 'Torre Sur', 'Av. Las Condes 5678, Las Condes - Actualizado', 'TS', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 12, '2019', 1100.00, 2600.00, 30, 18, 'Carlos López', '+56 2 29876544', 'carlos.lopez@torres.cl', '[\"agua\", \"electricidad\", \"internet\", \"aseo\"]', '[\"gimnasio\", \"ascensor\", \"porteria\", \"salon_comunal\"]', -33.4115000, -70.5410000, '/images/torre-sur.jpg', 'Torre sur con excelente ubicación y amenidades modernas.', 'activo'),
(3, 2, 'Torre Central Premium', 'Av. Apoquindo 1891, Las Condes', 'TCP', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 20, '2020', 1500.00, 3200.00, 50, 25, 'Ana Martínez', '+56 2 28765432', 'ana.martinez@central.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"tv_cable\", \"vigilancia\"]', '[\"piscina\", \"gimnasio\", \"ascensor\", \"porteria\", \"sauna\", \"terraza\"]', -33.4200000, -70.5500000, '/images/torre-central.jpg', 'Edificio premium con las mejores amenidades de la zona.', 'activo'),
(4, 6, 'Santuario Inconcluso', 'Av. Vitacura 2340, Vitacuras', 'SI', '2025-09-18 22:27:51', '2025-09-23 19:23:05', 'residencial', 1, 15, '2020', 1200.00, 3500.00, 45, 30, 'María González', '+56 2 24321098', 'gerencia@torresdelsol.cl', '[\"cable\", \"luz\", \"telefono\"]', '[\"cancha_deportiva\", \"ascensor\", \"parque_infantil\", \"porteria\"]', -33.4103000, -70.5398000, '/images/bloque-a.jpg', 'Edificio en excelente estado, con mantenimiento regular y buena administración.', 'activo'),
(5, 2, 'Bloque B', 'Av. Vitacura 2340, Vitacura', 'BB', '2025-09-18 22:27:51', '2025-09-23 19:41:29', 'residencial', 1, 10, '2016', 900.00, 2200.00, 28, 16, 'Laura Silva', '+56 2 27654322', 'laura.silva@bloqueb.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"cable\", \"luz\"]', '[\"piscina\", \"ascensor\", \"porteria\", \"quincho\"]', -33.4060000, -70.5210000, '/images/bloque-b.jpg', 'Bloque B con amplias áreas comunes y zona de recreación.', 'activo'),
(6, 4, 'Edificio Principal', 'Av. Ñuñoa 876, Ñuñoa', 'EP', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 6, '2015', 600.00, 1800.00, 20, 12, 'Roberto Herrera', '+56 2 26543210', 'roberto.herrera@principal.cl', '[\"agua\", \"electricidad\", \"internet\", \"aseo\"]', '[\"ascensor\", \"porteria\", \"patio\"]', -33.4500000, -70.6000000, '/images/edificio-principal.jpg', 'Edificio principal con ambiente familiar y tranquilo.', 'activo'),
(7, 5, 'Edificio Residencial', 'Av. Maipú 3456, Maipú', 'ER', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 14, '2021', 1000.00, 2500.00, 40, 22, 'Isabel Torres', '+56 2 25432109', 'isabel.torres@residencial.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"vigilancia\"]', '[\"gimnasio\", \"ascensor\", \"porteria\", \"salon_comunal\", \"zona_bbq\"]', -33.5100000, -70.7500000, '/images/edificio-residencial.jpg', 'Edificio residencial moderno con todas las comodidades.', 'activo'),
(8, 6, 'Torre Oriente', 'Av. Providencia 2890, Providencia', 'TO', '2025-09-18 22:27:51', '2025-09-18 22:27:51', 'residencial', 1, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'activo'),
(9, 7, 'Torre Única', 'Av. Costanera Norte 1567, Las Condes', 'TU', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 25, '2022', 1800.00, 4000.00, 60, 30, 'Francisco Morales', '+56 2 23210987', 'francisco.morales@torre.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"tv_cable\", \"telefono\", \"vigilancia\"]', '[\"piscina\", \"gimnasio\", \"ascensor\", \"porteria\", \"sauna\", \"terraza\", \"cancha_deportiva\"]', -33.3800000, -70.5100000, '/images/torre-unica.jpg', 'Torre única con vista panorámica y amenidades de lujo.', 'activo'),
(10, 8, 'Edificio Central', 'Av. Américo Vespucio 4567, La Florida', 'EC', '2025-09-18 22:27:51', '2025-09-23 19:03:02', 'residencial', 1, 9, '2014', 750.00, 2100.00, 32, 18, 'Claudia Ramírez', '+56 2 22109876', 'claudia.ramirez@central.cl', '[\"agua\", \"electricidad\", \"internet\", \"aseo\"]', '[\"ascensor\", \"porteria\", \"parque_infantil\"]', -33.5500000, -70.6200000, '/images/edificio-central.jpg', 'Edificio central con excelente conectividad y transporte.', 'activo'),
(11, 1, 'Torre Nueva', 'Av. Providencia 1234, Providencia - Actualizado', 'TN', '2025-09-23 18:43:03', '2025-09-23 19:03:02', 'residencial', 1, 18, '2023', 1350.00, 3000.00, 45, 24, 'Andrea Soto', '+56 2 24321098', 'andrea.soto@nueva.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"vigilancia\", \"aseo\"]', '[\"piscina\", \"gimnasio\", \"ascensor\", \"porteria\", \"salon_comunal\"]', -33.4250000, -70.6100000, '/images/torre-nueva.jpg', 'Torre nueva con tecnología de punta y diseño sustentable.', 'activo'),
(12, 2, 'Edificio Moderno', 'Av. Apoquindo 2500, Las Condes', 'EM', '2025-09-23 18:43:03', '2025-09-23 19:10:19', 'residencial', 1, 18, '2018', 850.00, 2800.00, 35, 25, 'Carlos Mendoza', '+56 2 29876543', 'admin@edificiomoderno.cl', '[\"agua_caliente\", \"gas_natural\", \"electricidad\", \"internet_fibra\", \"tv_cable\", \"porteria_24h\"]', '[\"gimnasio\", \"piscina\", \"salon_eventos\", \"cancha_tenis\", \"area_bbq\", \"parque_infantil\"]', -33.4089000, -70.5394000, '/images/edificio-moderno.jpg', 'Edificio de alta gama con acabados modernos, ubicado en zona premium de Las Condes. Incluye sistema de automatización y seguridad avanzada.', 'activo'),
(13, 3, 'Bloque C', 'Av. Vitacura 2340, Vitacura', 'BC', '2025-09-23 18:43:03', '2025-09-23 19:42:22', 'residencial', 1, 7, '2016', 650.00, 1900.00, 22, 14, 'Miguel Vargas', '+56 2 27654323', 'miguel.vargas@bloquec.cl', '[\"agua\", \"electricidad\", \"internet\", \"cable\", \"aseo\", \"telefono\"]', '[\"ascensor\", \"porteria\", \"jardin\", \"quincho\"]', -33.4070000, -70.5220000, '/images/bloque-c.jpg', 'Bloque C con amplios jardines y espacios de esparcimiento adicionales.', 'activo'),
(14, 4, 'Torre Oeste', 'Av. Ñuñoa 876, Ñuñoa', 'TO', '2025-09-23 18:43:03', '2025-09-23 19:03:02', 'residencial', 1, 11, '2019', 950.00, 2300.00, 35, 20, 'Patricia Muñoz', '+56 2 26543211', 'patricia.munoz@oeste.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"aseo\"]', '[\"gimnasio\", \"ascensor\", \"porteria\", \"terraza\"]', -33.4510000, -70.6010000, '/images/torre-oeste.jpg', 'Torre oeste con excelente orientación y luminosidad natural.', 'activo'),
(15, 5, 'Edificio Familiar', 'Av. Maipú 3456, Maipú', 'EF', '2025-09-23 18:43:03', '2025-09-23 19:03:02', 'residencial', 1, 5, '2013', 500.00, 1500.00, 15, 10, 'Carmen Jiménez', '+56 2 25432108', 'carmen.jimenez@familiar.cl', '[\"agua\", \"electricidad\", \"internet\"]', '[\"porteria\", \"patio\", \"parque_infantil\"]', -33.5110000, -70.7510000, '/images/edificio-familiar.jpg', 'Edificio familiar ideal para familias con niños pequeños.', 'activo'),
(16, 1, 'Torre Prueba CRUD', 'Av. Test 123, Santiago', 'TPC', '2025-09-23 18:48:03', '2025-09-23 19:03:02', 'residencial', 1, 15, '2020', 1200.00, 2800.00, 40, 25, 'María González', '+56 2 29876543', 'administracion@test.cl', '[\"agua\", \"electricidad\", \"gas_natural\", \"internet\", \"tv_cable\", \"telefono\", \"vigilancia\", \"aseo\"]', '[\"piscina\", \"gimnasio\", \"salon_comunal\", \"parque_infantil\", \"cancha_deportiva\", \"zona_bbq\", \"porteria\", \"ascensor\", \"citofono\", \"lavanderia\"]', -33.4103000, -70.5398000, '/images/edificio-prueba.jpg', 'Edificio de prueba completo con todos los campos implementados para testing del CRUD.', 'activo'),
(17, 1, 'Torre Prueba CRUD Actualizada', 'Av. Test Actualizado 456, Santiago', 'TPCC', '2025-09-23 18:56:27', '2025-09-23 19:04:20', 'mixto', 3, 15, '2020', 1200.00, 3500.00, 45, 30, 'María González', '+56 2 29876543', 'administracion@losrobles.cl', '[]', '[\"ascensor\", \"cancha_deportiva\"]', -33.4103000, -70.5398000, '/images/edificio-actualizado.jpg', 'Edificio en excelente estado, con mantenimiento regular y buena administración.', 'activo'),
(18, 2, 'Edificio Nuevo CRUD', 'Av. Nueva 456, Las Condes', 'ENC', '2025-09-23 18:56:42', '2025-09-23 19:10:19', 'comercial', 1, 15, '2020', 1200.00, 3500.00, 45, 30, 'María González', '+56 2 28765432', 'contacto@torrecentral.cl', '[\"agua_caliente\", \"gas_natural\", \"electricidad\", \"internet_fibra\", \"ascensores\", \"seguridad_24h\"]', '[\"salon_reuniones\", \"terraza\", \"estacionamiento_visitas\", \"sala_cowork\", \"cafeteria\"]', -33.4103000, -70.5398000, '/images/edificio-nuevo.jpg', 'Edificio en excelente estado, con mantenimiento regular y buena administración.', 'mantenimiento');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `edificio`
--
ALTER TABLE `edificio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_edificio_comunidad` (`comunidad_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `edificio`
--
ALTER TABLE `edificio`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `edificio`
--
ALTER TABLE `edificio`
  ADD CONSTRAINT `fk_edificio_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
