START TRANSACTION;

SET @pw_hash = '$2a$12$QwR.N8eN8AsJqwNP2gNhPeDogFnQBgF07WREUi9onWGb1tc7T9KMS';

-- user21..user39 (19 usuarios)
-- Ajusta rut/dv si lo necesitas; aquí se usan rut únicos ficticios '99900021'..'99900039' y dv '0'
INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900021','0','User21','Prueba','user21@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user21@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user21', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user21@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user21');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900022','0','User22','Prueba','user22@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user22@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user22', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user22@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user22');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900023','0','User23','Prueba','user23@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user23@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user23', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user23@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user23');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900024','0','User24','Prueba','user24@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user24@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user24', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user24@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user24');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900025','0','User25','Prueba','user25@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user25@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user25', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user25@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user25');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900026','0','User26','Prueba','user26@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user26@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user26', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user26@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user26');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900027','0','User27','Prueba','user27@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user27@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user27', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user27@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user27');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900028','0','User28','Prueba','user28@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user28@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user28', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user28@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user28');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900029','0','User29','Prueba','user29@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user29@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user29', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user29@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user29');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900030','0','User30','Prueba','user30@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user30@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user30', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user30@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user30');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900031','0','User31','Prueba','user31@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user31@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user31', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user31@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user31');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900032','0','User32','Prueba','user32@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user32@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user32', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user32@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user32');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900033','0','User33','Prueba','user33@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user33@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user33', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user33@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user33');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900034','0','User34','Prueba','user34@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user34@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user34', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user34@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user34');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900035','0','User35','Prueba','user35@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user35@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user35', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user35@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user35');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900036','0','User36','Prueba','user36@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user36@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user36', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user36@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user36');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900037','0','User37','Prueba','user37@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user37@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user37', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user37@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user37');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900038','0','User38','Prueba','user38@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user38@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user38', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user38@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user38');

INSERT INTO persona (rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at)
SELECT '99900039','0','User39','Prueba','user39@example.test',NULL,NULL,NOW(),NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM persona WHERE email = 'user39@example.test');

INSERT INTO usuario (persona_id, username, hash_password, email, activo, created_at, updated_at)
SELECT p.id, 'user39', @pw_hash, p.email, 1, NOW(), NOW()
FROM persona p
WHERE p.email = 'user39@example.test'
  AND NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'user39');

COMMIT;

--ligo comunidad torre unidad persona rol a los user creados:
-- Script completo para ligar user21..user39 a comunidades, crear unidad U021..U039,
-- asignar rol en usuario_rol_comunidad y crear titulares_unidad (propietario).
-- Ajustado para evitar errores de collation forzando collation_connection y usando COLLATE en comparaciones.

SET NAMES 'utf8mb4';
SET collation_connection = 'utf8mb4_0900_ai_ci';

START TRANSACTION;

-- Helper: obtener ids por usuario N
-- Repetir patrón para usuarios 21..39
-- user21 -> comunidad_id 1, role_id 1, unidad U021
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user21@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user21' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 1;
SELECT t.id INTO @torre_id
FROM torre t
JOIN edificio e ON t.edificio_id = e.id
WHERE e.comunidad_id = @comunidad_id
LIMIT 1;
SET @unidad_codigo = 'U021';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM unidad
  WHERE comunidad_id = @comunidad_id
    AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci
);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 1, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 1
);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario'
);

-- user22
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user22@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user22' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 2;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U022';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 2, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 2);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user23
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user23@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user23' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 3;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U023';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 3, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 3);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user24
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user24@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user24' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 4;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U024';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 4, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 4);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user25
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user25@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user25' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 5;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U025';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 5, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 5);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user26
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user26@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user26' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 6;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U026';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 6, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 6);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user27
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user27@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user27' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 7;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U027';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 7, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 7);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user28
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user28@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user28' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 8;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U028';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 8, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 8);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user29
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user29@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user29' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 9;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U029';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 9, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 9);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user30..user39 (10..19)
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user30@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user30' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 10;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U030';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 10, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 10);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user31
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user31@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user31' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 11;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U031';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 11, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 11);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user32
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user32@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user32' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 12;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U032';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 12, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 12);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user33
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user33@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user33' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 13;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U033';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 13, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 13);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user34
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user34@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user34' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 14;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U034';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 14, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 14);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user35
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user35@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user35' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 15;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U035';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 15, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 15);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user36
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user36@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user36' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 16;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U036';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 16, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 16);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user37
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user37@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user37' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 17;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U037';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 17, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 17);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user38
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user38@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user38' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 18;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U038';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 18, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 18);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

-- user39
SELECT id INTO @persona_id FROM persona WHERE email COLLATE utf8mb4_0900_ai_ci = 'user39@example.test' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SELECT id INTO @usuario_id FROM usuario WHERE username COLLATE utf8mb4_0900_ai_ci = 'user39' COLLATE utf8mb4_0900_ai_ci LIMIT 1;
SET @comunidad_id = 19;
SELECT t.id INTO @torre_id FROM torre t JOIN edificio e ON t.edificio_id = e.id WHERE e.comunidad_id = @comunidad_id LIMIT 1;
SET @unidad_codigo = 'U039';
INSERT INTO unidad (comunidad_id, torre_id, codigo, created_at, updated_at)
SELECT @comunidad_id, @torre_id, @unidad_codigo, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci);
SELECT id INTO @unidad_id FROM unidad WHERE comunidad_id = @comunidad_id AND codigo COLLATE utf8mb4_0900_ai_ci = @unidad_codigo COLLATE utf8mb4_0900_ai_ci LIMIT 1;
INSERT INTO usuario_rol_comunidad (comunidad_id, usuario_id, rol_id, desde, hasta, activo, created_at, updated_at)
SELECT @comunidad_id, @usuario_id, 19, CURDATE(), NULL, 1, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM usuario_rol_comunidad WHERE comunidad_id = @comunidad_id AND usuario_id = @usuario_id AND rol_id = 19);
INSERT INTO titulares_unidad (comunidad_id, unidad_id, persona_id, tipo, desde, porcentaje, created_at, updated_at)
SELECT @comunidad_id, @unidad_id, @persona_id, 'propietario', CURDATE(), 100.00, NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM titulares_unidad WHERE unidad_id = @unidad_id AND persona_id = @persona_id AND tipo = 'propietario');

COMMIT;