-- Script alternativo sin foreign keys para evitar problemas de compatibilidad
-- Usar este script si el anterior da errores

-- Crear tabla sin foreign key constraint
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preferences JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_preferences (user_id),
    INDEX idx_user_id (user_id)
);

-- Insertar preferencias por defecto para usuarios existentes
INSERT IGNORE INTO user_preferences (user_id, preferences)
SELECT 
    id as user_id,
    JSON_OBJECT(
        'notifications', JSON_OBJECT(
            'email_enabled', true,
            'payment_notifications', true,
            'weekly_summaries', true
        ),
        'display', JSON_OBJECT(
            'timezone', 'America/Santiago',
            'date_format', 'DD/MM/YYYY',
            'language', 'es'
        )
    ) as preferences
FROM usuario;

-- Verificar que la tabla se creó correctamente
SELECT COUNT(*) as total_preferences FROM user_preferences;
SELECT COUNT(*) as total_users FROM usuario;