-- ================================================================
-- MIGRACIÓN: Agregar Sistema de Indicadores Económicos
-- Fecha: 2025-09-23
-- Descripción: Tablas para sincronización con API mindicador.cl
-- ================================================================

USE `cuentasclaras`;

-- Verificar que estamos en la base de datos correcta
SELECT 'Agregando sistema de indicadores económicos a la BD cuentasclaras' as mensaje;

-- --------------------------------------------------------
-- Tabla para valores de UF (Unidad de Fomento)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `uf_valor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Valores históricos de UF';

-- --------------------------------------------------------
-- Tabla para valores de UTM (Unidad Tributaria Mensual)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `utm_valor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Valores históricos de UTM';

-- --------------------------------------------------------
-- Tabla para otros indicadores económicos
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `otros_indicadores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date NOT NULL,
  `valor` decimal(15,4) NOT NULL,
  `unidad_medida` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_codigo_fecha` (`codigo`,`fecha`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Otros indicadores económicos (dólar, euro, etc.)';

-- --------------------------------------------------------
-- Tabla para logs de sincronización
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sync_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'manual, scheduled, initial',
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'success, error, partial',
  `mensaje` text COLLATE utf8mb4_general_ci,
  `datos_procesados` json DEFAULT NULL,
  `duracion_ms` int DEFAULT NULL,
  `error_mensaje` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_status` (`status`),
  KEY `idx_fecha` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Logs del proceso de sincronización';

-- --------------------------------------------------------
-- Insertar datos de ejemplo (valores actuales aproximados)
-- --------------------------------------------------------

INSERT IGNORE INTO `uf_valor` (`fecha`, `valor`) VALUES
('2025-09-23', 39485.65),
('2025-09-22', 39475.32),
('2025-09-21', 39465.18),
('2025-09-20', 39455.89),
('2025-09-19', 39446.15);

INSERT IGNORE INTO `utm_valor` (`fecha`, `valor`) VALUES
('2025-09-01', 69265),
('2025-08-01', 68890),
('2025-07-01', 68520),
('2025-06-01', 68150),
('2025-05-01', 67785);

INSERT IGNORE INTO `otros_indicadores` (`codigo`, `nombre`, `fecha`, `valor`, `unidad_medida`) VALUES
('dolar', 'Dólar observado', '2025-09-23', 954.72, 'Pesos'),
('euro', 'Euro', '2025-09-23', 1125.72, 'Pesos'),
('ipc', 'Indice de Precios al Consumidor (IPC)', '2025-08-01', 0.0, 'Porcentaje'),
('tpm', 'Tasa Política Monetaria (TPM)', '2025-09-23', 4.75, 'Porcentaje');

-- --------------------------------------------------------
-- Procedimiento para limpiar datos antiguos
-- --------------------------------------------------------

DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS `LimpiarDatosAntiguos`()
BEGIN
    DECLARE fecha_limite DATE;
    DECLARE uf_deleted INT DEFAULT 0;
    DECLARE utm_deleted INT DEFAULT 0;
    DECLARE otros_deleted INT DEFAULT 0;
    DECLARE logs_deleted INT DEFAULT 0;
    
    SET fecha_limite = DATE_SUB(CURDATE(), INTERVAL 2 YEAR);
    
    -- Limpiar datos de UF anteriores a 2 años
    DELETE FROM uf_valor WHERE fecha < fecha_limite;
    SET uf_deleted = ROW_COUNT();
    
    -- Limpiar datos de UTM anteriores a 2 años
    DELETE FROM utm_valor WHERE fecha < fecha_limite;
    SET utm_deleted = ROW_COUNT();
    
    -- Limpiar otros indicadores anteriores a 2 años
    DELETE FROM otros_indicadores WHERE fecha < fecha_limite;
    SET otros_deleted = ROW_COUNT();
    
    -- Limpiar logs anteriores a 6 meses
    DELETE FROM sync_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    SET logs_deleted = ROW_COUNT();
    
    -- Insertar log de la limpieza
    INSERT INTO sync_logs (tipo, status, mensaje, datos_procesados) 
    VALUES ('cleanup', 'success', 'Limpieza automática de datos antiguos', 
            JSON_OBJECT(
                'fecha_limite', fecha_limite,
                'uf_eliminados', uf_deleted,
                'utm_eliminados', utm_deleted,
                'otros_eliminados', otros_deleted,
                'logs_eliminados', logs_deleted
            ));
    
    SELECT 
        'Limpieza completada' as resultado,
        fecha_limite,
        uf_deleted as uf_eliminados,
        utm_deleted as utm_eliminados,
        otros_deleted as otros_eliminados,
        logs_deleted as logs_eliminados;
END$$
DELIMITER ;

-- --------------------------------------------------------
-- Verificación de la migración
-- --------------------------------------------------------

SELECT 
    'Migración completada exitosamente' as resultado,
    NOW() as timestamp,
    'Sistema de indicadores económicos instalado' as descripcion;

-- Mostrar resumen de tablas creadas
SELECT 
    TABLE_NAME as tabla,
    TABLE_COMMENT as descripcion,
    TABLE_ROWS as filas_aproximadas
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'cuentasclaras' 
AND TABLE_NAME IN ('uf_valor', 'utm_valor', 'otros_indicadores', 'sync_logs');

SELECT 'Migración de indicadores económicos aplicada correctamente' as mensaje;