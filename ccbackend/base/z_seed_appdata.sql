-- Seed: create demo comunidad, persona and admin membership
-- This script runs after schema.sql (named with z_ prefix to run later)

-- Ensure is_superadmin column exists
ALTER TABLE IF EXISTS usuario ADD COLUMN IF NOT EXISTS is_superadmin TINYINT(1) DEFAULT 0;

-- Create demo comunidad
INSERT INTO comunidad (razon_social, rut, dv, moneda)
SELECT 'Comunidad Admin Demo','11111111','1','CLP'
WHERE NOT EXISTS (SELECT 1 FROM comunidad WHERE rut='11111111' AND dv='1');

SET @comunidad_id = (SELECT id FROM comunidad WHERE rut='11111111' AND dv='1' LIMIT 1);

-- Create demo persona
INSERT INTO persona (rut, dv, nombres, apellidos, email)
SELECT '22222222','2','Super','Admin','admin@example.com'
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE rut='22222222' AND dv='2');

SET @persona_id = (SELECT id FROM persona WHERE rut='22222222' AND dv='2' LIMIT 1);

-- Create admin membership for persona in comunidad
INSERT INTO membresia_comunidad (comunidad_id, persona_id, rol, desde, activo)
SELECT @comunidad_id, @persona_id, 'admin', CURDATE(), 1
WHERE NOT EXISTS (
  SELECT 1 FROM membresia_comunidad WHERE comunidad_id = @comunidad_id AND persona_id = @persona_id AND rol = 'admin'
);

-- Note: This seed DOES NOT create a login password for the 'usuario' table. To enable application login,
-- either register a user via POST /auth/register using the persona_id above, or insert a usuario row with a bcrypt hash.

-- Example (run manually or modify below after generating bcrypt hash):
-- INSERT INTO usuario (persona_id, username, hash_password, email, activo, is_superadmin)
-- VALUES (@persona_id, 'superadmin', '$2a$10$REPLACE_WITH_HASH', 'admin@example.com', 1, 1)
-- ON DUPLICATE KEY UPDATE email = VALUES(email), is_superadmin = 1;
