-- Tabla para valores de UF
CREATE TABLE IF NOT EXISTS uf_valor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    valor DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha)
);

-- Tabla para valores de UTM
CREATE TABLE IF NOT EXISTS utm_valor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    valor DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha)
);

-- Tabla para otros indicadores (dólar, euro, etc.)
CREATE TABLE IF NOT EXISTS otros_indicadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    valor DECIMAL(15,4) NOT NULL,
    unidad_medida VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_codigo_fecha (codigo, fecha),
    INDEX idx_codigo (codigo),
    INDEX idx_fecha (fecha)
);

-- Tabla para logs de sincronización
CREATE TABLE IF NOT EXISTS sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'manual', 'scheduled', 'initial'
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'partial'
    mensaje TEXT,
    datos_procesados JSON,
    duracion_ms INT,
    error_mensaje TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_status (status),
    INDEX idx_fecha (created_at)
);

-- Insertar algunos datos de ejemplo (opcional)
INSERT IGNORE INTO uf_valor (fecha, valor) VALUES
('2025-09-23', 39485.65),
('2025-09-22', 39475.32),
('2025-09-21', 39465.18);

INSERT IGNORE INTO utm_valor (fecha, valor) VALUES
('2025-09-01', 69265),
('2025-08-01', 68890),
('2025-07-01', 68520);

-- Procedimiento para limpiar datos antiguos
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS LimpiarDatosAntiguos()
BEGIN
    DECLARE fecha_limite DATE;
    SET fecha_limite = DATE_SUB(CURDATE(), INTERVAL 2 YEAR);
    
    DELETE FROM uf_valor WHERE fecha < fecha_limite;
    DELETE FROM utm_valor WHERE fecha < fecha_limite;
    DELETE FROM otros_indicadores WHERE fecha < fecha_limite;
    DELETE FROM sync_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    SELECT 
        CONCAT('Limpieza completada. Datos anteriores a ', fecha_limite, ' eliminados.') as resultado;
END$$
DELIMITER ;