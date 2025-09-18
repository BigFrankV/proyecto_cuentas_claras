-- Migración para agregar tabla de preferencias de usuario
-- Ejecutar este script para crear la tabla user_preferences

CREATE TABLE IF NOT EXISTS user_preferences (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    preferences JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_preferences (user_id),
    INDEX idx_user_id (user_id)
);

-- Agregar la foreign key después de crear la tabla
ALTER TABLE user_preferences 
ADD CONSTRAINT fk_user_preferences_user_id 
FOREIGN KEY (user_id) REFERENCES usuario(id) ON DELETE CASCADE;

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

-- ALTERNATIVA: Si hay problemas con UNSIGNED, usar esta versión sin FK:
-- DROP TABLE IF EXISTS user_preferences;
-- CREATE TABLE user_preferences (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     preferences JSON NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     UNIQUE KEY unique_user_preferences (user_id),
--     INDEX idx_user_id (user_id)
-- );

-- Si necesitas verificar el tipo de la tabla usuario, usa:
-- SHOW CREATE TABLE usuario;