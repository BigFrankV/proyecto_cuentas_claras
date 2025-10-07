
-- ============================================
-- MIGRACIÓN 3: NUEVAS COLUMNAS EN TABLA gasto
-- ============================================

-- 1. Agregar columna numero
ALTER TABLE `gasto` 
ADD COLUMN `numero` VARCHAR(50) DEFAULT NULL 
AFTER `id`;

-- 2. Agregar columna estado
ALTER TABLE `gasto` 
ADD COLUMN `estado` ENUM('borrador','aprobado','rechazado','pagado','anulado') NOT NULL DEFAULT 'aprobado' 
AFTER `extraordinario`;

-- 3. Agregar columna creado_por
ALTER TABLE `gasto` 
ADD COLUMN `creado_por` BIGINT DEFAULT NULL 
AFTER `estado`;

-- 4. Agregar columna aprobado_por
ALTER TABLE `gasto` 
ADD COLUMN `aprobado_por` BIGINT DEFAULT NULL 
AFTER `creado_por`;

-- 5. Agregar índices
ALTER TABLE `gasto` 
ADD INDEX `idx_gasto_estado` (`estado`),
ADD INDEX `idx_gasto_numero` (`numero`);

-- 6. Agregar foreign keys
ALTER TABLE `gasto` 
ADD CONSTRAINT `fk_gasto_creado_por` 
FOREIGN KEY (`creado_por`) REFERENCES `usuario` (`id`);

ALTER TABLE `gasto` 
ADD CONSTRAINT `fk_gasto_aprobado_por` 
FOREIGN KEY (`aprobado_por`) REFERENCES `usuario` (`id`);

-- 7. Actualizar gastos existentes con número
UPDATE `gasto` 
SET `numero` = CONCAT('G2025-', LPAD(id, 6, '0'))
WHERE `numero` IS NULL OR `numero` = '';

-- Verificar
SELECT id, numero, estado, creado_por, aprobado_por FROM gasto LIMIT 5;

-- ============================================
-- MIGRACIÓN 4: TABLA historial_gasto
-- ============================================

CREATE TABLE IF NOT EXISTS `historial_gasto` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `gasto_id` BIGINT NOT NULL,
  `accion` ENUM('creado','modificado','aprobado','rechazado','pagado','anulado') NOT NULL,
  `usuario_id` BIGINT NOT NULL,
  `observaciones` TEXT,
  `fecha` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_historial_gasto` (`gasto_id`),
  KEY `fk_historial_usuario` (`usuario_id`),
  KEY `idx_historial_fecha` (`fecha`),
  CONSTRAINT `fk_historial_gasto` 
    FOREIGN KEY (`gasto_id`) REFERENCES `gasto` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verificar
DESCRIBE historial_gasto;

-- ============================================
-- MIGRACIÓN 5: DATOS DE EJEMPLO PARA AUDITORÍA
-- ============================================

INSERT IGNORE INTO `auditoria` 
  (`usuario_id`, `accion`, `tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `ip_address`, `created_at`) 
VALUES
  (1, 'CREATE', 'pago', 1, NULL, '{"monto": 47012.50, "medio": "transferencia", "estado": "aplicado"}', '192.168.1.100', '2025-09-18 20:06:10'),
  (1, 'UPDATE', 'persona', 1, '{"nombres": "María José"}', '{"nombres": "Patricio"}', '192.168.1.100', '2025-09-18 20:33:26'),
  (2, 'CREATE', 'multa', 1, NULL, '{"monto": 50000.00, "motivo": "Ruidos molestos"}', '192.168.1.101', '2025-09-18 20:08:33');





-- ============================================
-- MIGRACIÓN 3: TABLA apelacion_multa
-- ============================================

CREATE TABLE IF NOT EXISTS `apelacion_multa` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `multa_id` BIGINT NOT NULL COMMENT 'ID de la multa apelada',
  `usuario_id` BIGINT NOT NULL COMMENT 'Usuario que presenta la apelación',
  `motivo` TEXT NOT NULL COMMENT 'Motivo de la apelación',
  `evidencias` JSON DEFAULT NULL COMMENT 'URLs o referencias a archivos de evidencia',
  `estado` ENUM('pendiente','en_revision','aceptada','rechazada') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado de la apelación',
  `respuesta` TEXT DEFAULT NULL COMMENT 'Respuesta del administrador',
  `revisada_por` BIGINT DEFAULT NULL COMMENT 'Usuario que revisó la apelación',
  `fecha_apelacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de presentación',
  `fecha_revision` DATETIME DEFAULT NULL COMMENT 'Fecha de revisión',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_apelacion_multa` (`multa_id`),
  KEY `fk_apelacion_usuario` (`usuario_id`),
  KEY `fk_apelacion_revisada_por` (`revisada_por`),
  KEY `idx_apelacion_estado` (`estado`),
  KEY `idx_apelacion_fecha` (`fecha_apelacion`),
  CONSTRAINT `fk_apelacion_multa` 
    FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_apelacion_usuario` 
    FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `fk_apelacion_revisada_por` 
    FOREIGN KEY (`revisada_por`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Apelaciones presentadas por usuarios contra multas';

-- Índice compuesto para consultas de multas con apelaciones pendientes
CREATE INDEX `idx_apelacion_multa_estado` ON `apelacion_multa` (`multa_id`, `estado`);

-- Verificar estructura
DESCRIBE apelacion_multa;

-- ============================================
-- MIGRACIÓN 4: TABLA documento_multa
-- ============================================

CREATE TABLE IF NOT EXISTS `documento_multa` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `multa_id` BIGINT NOT NULL COMMENT 'ID de la multa',
  `tipo` ENUM('foto','video','pdf','acta','otros') NOT NULL COMMENT 'Tipo de documento',
  `nombre_archivo` VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo',
  `ruta_archivo` VARCHAR(500) NOT NULL COMMENT 'Ruta donde está almacenado',
  `tamano` BIGINT DEFAULT NULL COMMENT 'Tamaño en bytes',
  `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'Tipo MIME',
  `descripcion` TEXT DEFAULT NULL COMMENT 'Descripción del documento',
  `subido_por` BIGINT NOT NULL COMMENT 'Usuario que subió el documento',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_documento_multa` (`multa_id`),
  KEY `fk_documento_usuario` (`subido_por`),
  KEY `idx_documento_tipo` (`tipo`),
  CONSTRAINT `fk_documento_multa` 
    FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_documento_usuario` 
    FOREIGN KEY (`subido_por`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documentos adjuntos a multas (fotos, videos, actas, etc.)';

-- Índice para búsqueda por multa y tipo
CREATE INDEX `idx_documento_multa_tipo` ON `documento_multa` (`multa_id`, `tipo`);

-- Verificar estructura
DESCRIBE documento_multa;

-- ============================================
-- DATOS DE EJEMPLO PARA PRUEBAS
-- ============================================

-- Insertar historial de multas existentes (si hay multas en la BD)
INSERT INTO `historial_multa` 
  (`multa_id`, `accion`, `usuario_id`, `monto_nuevo`, `observaciones`, `fecha`)
SELECT 
  id,
  'creada',
  1,
  monto,
  CONCAT('Multa creada: ', motivo),
  fecha_emision
FROM multa
WHERE NOT EXISTS (
  SELECT 1 FROM historial_multa hm WHERE hm.multa_id = multa.id
)
LIMIT 10;

-- Ejemplo de apelación
INSERT IGNORE INTO `apelacion_multa` 
  (`multa_id`, `usuario_id`, `motivo`, `estado`, `fecha_apelacion`)
VALUES
  (1, 2, 'No me encontraba en la propiedad en la fecha indicada. Adjunto comprobante de viaje.', 'pendiente', NOW());

-- Ejemplo de documento
INSERT IGNORE INTO `documento_multa` 
  (`multa_id`, `tipo`, `nombre_archivo`, `ruta_archivo`, `descripcion`, `subido_por`)
VALUES
  (1, 'foto', 'evidencia_ruido.jpg', '/uploads/multas/2025/evidencia_ruido.jpg', 'Foto del medidor de ruido', 1);

-- ============================================
-- TRIGGERS PARA AUTOMATIZAR HISTORIAL
-- ============================================

-- Trigger: Registrar creación de multa
DELIMITER $$

CREATE TRIGGER `trg_multa_after_insert`
AFTER INSERT ON `multa`
FOR EACH ROW
BEGIN
  INSERT INTO `historial_multa` 
    (`multa_id`, `accion`, `usuario_id`, `monto_nuevo`, `observaciones`)
  VALUES 
    (NEW.id, 'creada', IFNULL(NEW.creada_por, 1), NEW.monto, CONCAT('Multa creada: ', NEW.motivo));
END$$

-- Trigger: Registrar modificación de multa
CREATE TRIGGER `trg_multa_after_update`
AFTER UPDATE ON `multa`
FOR EACH ROW
BEGIN
  DECLARE accion_texto VARCHAR(50);
  
  -- Determinar acción según cambio de estado
  IF NEW.estado != OLD.estado THEN
    CASE NEW.estado
      WHEN 'pagada' THEN SET accion_texto = 'pagada';
      WHEN 'anulada' THEN SET accion_texto = 'anulada';
      WHEN 'condonada' THEN SET accion_texto = 'condonada';
      ELSE SET accion_texto = 'modificada';
    END CASE;
  ELSE
    SET accion_texto = 'modificada';
  END IF;
  
  -- Insertar en historial
  INSERT INTO `historial_multa` 
    (`multa_id`, `accion`, `usuario_id`, `monto_anterior`, `monto_nuevo`, `observaciones`)
  VALUES 
    (NEW.id, accion_texto, IFNULL(NEW.aprobada_por, 1), OLD.monto, NEW.monto, 
     CONCAT('Estado cambiado de ', OLD.estado, ' a ', NEW.estado));
END$$

DELIMITER ;



-- ============================================
-- PASO 1: VERIFICAR QUÉ ES usuario_miembro_comunidad
-- ============================================

SELECT 
  TABLE_NAME,
  TABLE_TYPE,
  ENGINE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'ccdb' 
  AND TABLE_NAME = 'usuario_miembro_comunidad';

-- Resultado esperado:
-- TABLE_NAME: usuario_miembro_comunidad
-- TABLE_TYPE: BASE TABLE (es una tabla física)
-- ENGINE: InnoDB

-- ============================================
-- PASO 2: HACER BACKUP DE LA TABLA (POR SEGURIDAD)
-- ============================================

-- Verificar si tiene datos
SELECT COUNT(*) as registros_en_tabla FROM usuario_miembro_comunidad;

-- Si tiene datos, hacer backup
CREATE TABLE IF NOT EXISTS `usuario_miembro_comunidad_backup_20251005` AS
SELECT * FROM usuario_miembro_comunidad;

-- ============================================
-- PASO 3: ELIMINAR LA TABLA FÍSICA
-- ============================================

DROP TABLE IF EXISTS `usuario_miembro_comunidad`;

-- ============================================
-- PASO 4: CREAR LA VISTA
-- ============================================

CREATE OR REPLACE VIEW `usuario_miembro_comunidad` AS
SELECT 
  urc.id,
  urc.comunidad_id,
  u.persona_id,
  rs.codigo as rol,
  urc.desde,
  urc.hasta,
  urc.activo,
  urc.created_at,
  urc.updated_at
FROM usuario_rol_comunidad urc
INNER JOIN usuario u ON urc.usuario_id = u.id
INNER JOIN rol_sistema rs ON urc.rol_id = rs.id;

-- ============================================
-- PASO 5: VERIFICAR QUE LA VISTA FUNCIONA
-- ============================================

-- Verificar tipo
SELECT 
  TABLE_NAME,
  TABLE_TYPE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'ccdb' 
  AND TABLE_NAME = 'usuario_miembro_comunidad';

-- Resultado esperado:
-- TABLE_NAME: usuario_miembro_comunidad
-- TABLE_TYPE: VIEW ✅

-- Verificar datos
SELECT COUNT(*) as registros_en_vista FROM usuario_miembro_comunidad;

-- Debe mostrar 20 registros (uno por cada usuario_rol_comunidad activo)

-- Ver algunos registros
SELECT * FROM usuario_miembro_comunidad LIMIT 5;

-- ============================================
-- PASO 6: VERIFICAR USUARIO PATRICIO
-- ============================================

SELECT 
  umc.id,
  umc.comunidad_id,
  c.razon_social as comunidad,
  umc.persona_id,
  u.username,
  umc.rol,
  rs.nombre as rol_nombre,
  rs.nivel_acceso,
  umc.activo
FROM usuario_miembro_comunidad umc
INNER JOIN comunidad c ON umc.comunidad_id = c.id
INNER JOIN usuario u ON umc.persona_id = u.persona_id
INNER JOIN rol_sistema rs ON umc.rol = rs.codigo
WHERE umc.persona_id = 1 AND umc.activo = 1;

-- Resultado esperado:
-- id: 1
-- comunidad_id: 6
-- comunidad: "Comunidad Puente Alto #6"
-- persona_id: 1
-- username: "patricio"
-- rol: "superadmin"
-- rol_nombre: "Superadmin"
-- nivel_acceso: 100
-- activo: 1

-- ============================================
-- PASO 7: VERIFICAR LA QUERY EXACTA DEL BACKEND
-- ============================================

SELECT 
  umc.id as membership_id,
  umc.comunidad_id,
  umc.persona_id,
  umc.rol,
  umc.activo,
  c.razon_social as comunidad_nombre,
  rs.id as rol_id,
  rs.nombre as rol_nombre,
  rs.codigo as rol_slug,
  rs.nivel_acceso as nivel,
  rs.es_rol_sistema as es_admin
FROM usuario_miembro_comunidad umc
INNER JOIN comunidad c ON umc.comunidad_id = c.id
INNER JOIN rol_sistema rs ON umc.rol = rs.codigo
WHERE umc.persona_id = 1 AND umc.activo = 1;

-- Si esto devuelve 1 fila, el login funcionará ✅

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 
  '✅ usuario_miembro_comunidad es una VISTA' as resultado
WHERE EXISTS (
  SELECT 1 
  FROM information_schema.VIEWS 
  WHERE TABLE_SCHEMA = 'ccdb' 
    AND TABLE_NAME = 'usuario_miembro_comunidad'
)

UNION ALL

SELECT 
  CONCAT('✅ Vista tiene ', COUNT(*), ' registros')
FROM usuario_miembro_comunidad

UNION ALL

SELECT 
  '✅ Usuario patricio (persona_id=1) tiene roles'
WHERE EXISTS (
  SELECT 1 
  FROM usuario_miembro_comunidad 
  WHERE persona_id = 1 AND activo = 1
);

-- Resultado esperado:
-- ✅ usuario_miembro_comunidad es una VISTA
-- ✅ Vista tiene 20 registros
-- ✅ Usuario patricio (persona_id=1) tiene roles

-- ============================================
-- RESUMEN COMPLETO
-- ============================================

SELECT 
  'Usuario patricio' as item,
  u.id as usuario_id,
  u.persona_id,
  u.username as valor
FROM usuario u
WHERE u.username = 'patricio'

UNION ALL

SELECT 
  'Rol en usuario_rol_comunidad',
  urc.usuario_id,
  NULL,
  CONCAT('Comunidad ', urc.comunidad_id, ', Rol ', rs.nombre)
FROM usuario_rol_comunidad urc
INNER JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.usuario_id = 1 AND urc.activo = 1

UNION ALL

SELECT 
  'Rol en VISTA usuario_miembro_comunidad',
  NULL,
  umc.persona_id,
  CONCAT('Comunidad ', c.razon_social, ', Rol ', umc.rol)
FROM usuario_miembro_comunidad umc
INNER JOIN comunidad c ON umc.comunidad_id = c.id
WHERE umc.persona_id = 1 AND umc.activo = 1;

-- ============================================
-- FIN - AHORA REINICIA EL BACKEND Y PRUEBA LOGIN
-- ============================================
