-- Migración para agregar soporte de pasarelas de pago
-- Ejecutar: mysql -u usuario -p cuentasclaras < migrations/add_payment_gateways.sql

USE cuentasclaras;

-- Tabla para transacciones de pasarelas de pago
CREATE TABLE IF NOT EXISTS payment_transaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL UNIQUE,
  comunidad_id INT NOT NULL,
  unidad_id INT NULL,
  persona_id INT NULL,
  amount DECIMAL(12,2) NOT NULL,
  gateway ENUM('webpay', 'khipu', 'mercadopago', 'flow', 'culqi') NOT NULL,
  gateway_transaction_id VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled', 'expired') DEFAULT 'pending',
  description TEXT,
  gateway_response JSON,
  payer_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_gateway_transaction (gateway_transaction_id),
  INDEX idx_comunidad (comunidad_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  
  FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE CASCADE,
  FOREIGN KEY (unidad_id) REFERENCES unidad(id) ON DELETE SET NULL,
  FOREIGN KEY (persona_id) REFERENCES persona(id) ON DELETE SET NULL
);

-- Tabla para configuración de pasarelas por comunidad
CREATE TABLE IF NOT EXISTS community_payment_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  comunidad_id INT NOT NULL,
  gateway ENUM('webpay', 'khipu', 'mercadopago', 'flow', 'culqi') NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSON NOT NULL COMMENT 'Configuración específica de la pasarela',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_community_gateway (comunidad_id, gateway),
  FOREIGN KEY (comunidad_id) REFERENCES comunidad(id) ON DELETE CASCADE
);

-- Actualizar tabla pago existente para incluir referencia a transacción de pasarela
ALTER TABLE pago 
ADD COLUMN IF NOT EXISTS gateway_transaction_id VARCHAR(255) NULL AFTER referencia,
ADD INDEX idx_gateway_transaction (gateway_transaction_id);

-- Actualizar tabla webhook_pago para incluir más información
ALTER TABLE webhook_pago 
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255) NULL AFTER payload_json,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP NULL AFTER procesado,
ADD INDEX idx_transaction_id (transaction_id);

-- Tabla para logs de intentos de pago
CREATE TABLE IF NOT EXISTS payment_attempt_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  gateway ENUM('webpay', 'khipu', 'mercadopago', 'flow', 'culqi') NOT NULL,
  action ENUM('create', 'confirm', 'webhook', 'refund') NOT NULL,
  request_data JSON,
  response_data JSON,
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_gateway (gateway),
  INDEX idx_created (created_at)
);

-- Insertar configuraciones por defecto
INSERT IGNORE INTO community_payment_config (comunidad_id, gateway, config, is_active) 
SELECT 
  id as comunidad_id,
  'webpay' as gateway,
  JSON_OBJECT(
    'commerce_code', '597055555532',
    'environment', 'integration',
    'description', 'Webpay Plus - Tarjetas de crédito y débito'
  ) as config,
  true as is_active
FROM comunidad;

-- Agregar índices adicionales para optimización
ALTER TABLE pago 
ADD INDEX IF NOT EXISTS idx_estado_fecha (estado, fecha),
ADD INDEX IF NOT EXISTS idx_comunidad_fecha (comunidad_id, fecha);

-- Crear vista para resumen de pagos por pasarela
CREATE OR REPLACE VIEW payment_gateway_summary AS
SELECT 
  pt.comunidad_id,
  pt.gateway,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN pt.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN pt.status = 'approved' THEN pt.amount ELSE 0 END) as approved_amount,
  SUM(CASE WHEN pt.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN pt.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  DATE(pt.created_at) as transaction_date
FROM payment_transaction pt
GROUP BY pt.comunidad_id, pt.gateway, DATE(pt.created_at);

-- Crear función para generar order_id único
DELIMITER $$
CREATE FUNCTION IF NOT EXISTS generate_order_id(p_comunidad_id INT, p_unidad_id INT)
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
  DECLARE order_id VARCHAR(100);
  DECLARE counter INT DEFAULT 0;
  DECLARE timestamp_val BIGINT;
  
  SET timestamp_val = UNIX_TIMESTAMP();
  SET order_id = CONCAT('CC-', p_comunidad_id, '-', COALESCE(p_unidad_id, 'X'), '-', timestamp_val, '-', FLOOR(RAND() * 1000));
  
  -- Verificar que sea único
  WHILE EXISTS (SELECT 1 FROM payment_transaction WHERE order_id = order_id) DO
    SET counter = counter + 1;
    SET order_id = CONCAT('CC-', p_comunidad_id, '-', COALESCE(p_unidad_id, 'X'), '-', timestamp_val, '-', FLOOR(RAND() * 1000), '-', counter);
  END WHILE;
  
  RETURN order_id;
END$$
DELIMITER ;

-- Crear procedimiento para limpiar transacciones expiradas
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_transactions()
BEGIN
  -- Marcar como expiradas las transacciones pendientes de más de 30 minutos
  UPDATE payment_transaction 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE);
  
  -- Log de limpieza
  INSERT INTO payment_attempt_log (order_id, gateway, action, response_data, created_at)
  SELECT 
    order_id,
    gateway,
    'cleanup' as action,
    JSON_OBJECT('expired_at', NOW(), 'reason', 'timeout') as response_data,
    NOW()
  FROM payment_transaction 
  WHERE status = 'expired' 
    AND updated_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE);
END$$
DELIMITER ;

-- Crear evento para limpieza automática (ejecutar cada 15 minutos)
CREATE EVENT IF NOT EXISTS cleanup_payment_transactions
ON SCHEDULE EVERY 15 MINUTE
STARTS CURRENT_TIMESTAMP
DO CALL cleanup_expired_transactions();

-- Comentarios para documentación
ALTER TABLE payment_transaction COMMENT = 'Transacciones de pasarelas de pago - Estado y seguimiento completo';
ALTER TABLE community_payment_config COMMENT = 'Configuración de pasarelas de pago por comunidad';
ALTER TABLE payment_attempt_log COMMENT = 'Log de intentos y acciones en el proceso de pago';

-- Mostrar resumen de migración
SELECT 'Migración de pasarelas de pago completada exitosamente' as status;
SELECT 
  COUNT(*) as total_communities,
  COUNT(CASE WHEN EXISTS (SELECT 1 FROM community_payment_config cpc WHERE cpc.comunidad_id = c.id) THEN 1 END) as communities_with_payment_config
FROM comunidad c;