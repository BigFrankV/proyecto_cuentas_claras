-- Script: create_superadmin.sql
-- Uso: ejecutar en phpMyAdmin (SQL) para crear un usuario de conexión MySQL con permisos sobre
-- la base de datos `cuentasclaras` y crear una persona + membresía 'admin' en la BD de la app.
-- ADVERTENCIA: Ajusta contraseñas y nombres antes de ejecutar. El script no escribe la contraseña
-- real del usuario de la aplicación (hash bcrypt) por seguridad: ver instrucciones abajo.

-- 1) Variables: personalizar estos valores antes de ejecutar
-- Cambia si quieres otro usuario/contraseña o comunidad/persona
SET @DB_USER = 'api_admin';
SET @DB_PASS = 'S3guraP@ssw0rd!';
SET @DB_HOST = 'localhost'; -- usar '%' para acceso remoto (menos seguro)

-- 2) Crear usuario MySQL y otorgar privilegios sobre la base de datos cuentasclaras
-- (Este bloque debe ejecutarse con un usuario que tenga privilegios para crear usuarios, p.ej. root)
CREATE USER IF NOT EXISTS CONCAT(@DB_USER, '@', @DB_HOST);
-- Nota: algunas instalaciones de phpMyAdmin no aceptan la sintaxis CONCAT en CREATE USER; si falla,
-- reemplaza manualmente @DB_USER y @DB_HOST por los valores concretos.

-- Sentencias alternativas (reemplaza api_admin y localhost si tu phpMyAdmin no soporta variables):
-- CREATE USER 'api_admin'@'localhost' IDENTIFIED BY 'S3guraP@ssw0rd!';
-- GRANT ALL PRIVILEGES ON cuentasclaras.* TO 'api_admin'@'localhost';
-- FLUSH PRIVILEGES;

-- Si tu phpMyAdmin soporta la ejecución de múltiples sentencias con variables, intenta lo siguiente:
SET @create_user_sql = CONCAT("CREATE USER IF NOT EXISTS '", @DB_USER, "'@'", @DB_HOST, "' IDENTIFIED BY '", @DB_PASS, "';");
PREPARE stmt_create_user FROM @create_user_sql;
EXECUTE stmt_create_user;
DEALLOCATE PREPARE stmt_create_user;

SET @grant_sql = CONCAT("GRANT ALL PRIVILEGES ON cuentasclaras.* TO '", @DB_USER, "'@'", @DB_HOST, "';");
PREPARE stmt_grant FROM @grant_sql;
EXECUTE stmt_grant;
DEALLOCATE PREPARE stmt_grant;

FLUSH PRIVILEGES;

-- 3) Crear (si no existe) una comunidad demo y obtener su id
INSERT INTO comunidad (razon_social, rut, dv, moneda)
SELECT 'Comunidad Admin Demo','11111111','1','CLP'
WHERE NOT EXISTS (SELECT 1 FROM comunidad WHERE rut='11111111' AND dv='1');
SET @comunidad_id = (SELECT id FROM comunidad WHERE rut='11111111' AND dv='1' LIMIT 1);

-- 4) Crear persona admin (si no existe)
INSERT INTO persona (rut, dv, nombres, apellidos, email)
SELECT '22222222','2','Super','Admin','admin@example.com'
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE rut='22222222' AND dv='2');
SET @persona_id = (SELECT id FROM persona WHERE rut='22222222' AND dv='2' LIMIT 1);

-- 5) Crear membresía con rol 'admin' para esa persona en la comunidad (si no existe)
INSERT INTO membresia_comunidad (comunidad_id, persona_id, rol, desde, activo)
SELECT @comunidad_id, @persona_id, 'admin', CURDATE(), 1
WHERE NOT EXISTS (
  SELECT 1 FROM membresia_comunidad WHERE comunidad_id = @comunidad_id AND persona_id = @persona_id AND rol = 'admin'
);

-- 6) Opcional: crear fila en tabla usuario (REQUIERE hash bcrypt válido)
-- Por seguridad no establecemos el hash por defecto. Si quieres habilitar login directo desde la app,
-- genera el hash bcrypt y pega el valor en la siguiente sentencia reemplazando REPLACE_WITH_BCRYPT_HASH
-- Cómo generar un hash bcrypt (desde tu máquina con node):
-- node -e "console.log(require('bcryptjs').hashSync('SuperP@ssw0rd!', 10))"
-- Copia la salida (ej: $2a$10$...) y péguela en lugar del valor REPLACE_WITH_BCRYPT_HASH

/* Ejemplo (descomenta y reemplaza HASH_AQUI):
INSERT INTO usuario (persona_id, username, hash_password, email, activo)
VALUES (@persona_id, 'superadmin', 'HASH_AQUI', 'admin@example.com', 1)
ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email);
*/

-- 6b) Añadir columna is_superadmin a la tabla usuario (si no existe) y marcar el usuario como superadmin
-- Esto permite un flag de superadministrador que evita comprobaciones de rol en middleware.
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS is_superadmin TINYINT(1) DEFAULT 0;

-- Opcional: crear el usuario de aplicación con hash y marcarlo superadmin (descomenta y reemplaza HASH_AQUI)
/*
INSERT INTO usuario (persona_id, username, hash_password, email, activo, is_superadmin)
VALUES (@persona_id, 'superadmin', 'HASH_AQUI', 'admin@example.com', 1, 1)
ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email), is_superadmin = 1;
*/

-- Si ya tienes un usuario existente y sólo quieres marcarlo como superadmin, ejecuta:
-- UPDATE usuario SET is_superadmin = 1 WHERE username = 'superadmin';

-- 7) Verificación rápida (muestra ids creados)
SELECT @comunidad_id AS comunidad_id, @persona_id AS persona_id;

-- FIN
