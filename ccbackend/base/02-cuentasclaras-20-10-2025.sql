-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: db
-- Tiempo de generación: 20-10-2025 a las 03:49:01
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

--
-- Índices para tablas volcadas
--

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
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `usuario_rol_comunidad`
--
ALTER TABLE `usuario_rol_comunidad`
  ADD CONSTRAINT `fk_ucr_comunidad` FOREIGN KEY (`comunidad_id`) REFERENCES `comunidad` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ucr_rol` FOREIGN KEY (`rol_id`) REFERENCES `rol_sistema` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ucr_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
