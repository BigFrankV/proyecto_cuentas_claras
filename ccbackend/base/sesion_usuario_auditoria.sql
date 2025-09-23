-- Agregar tabla de sesiones de usuario (CRÍTICA para manejo de sesiones)
CREATE TABLE `sesion_usuario` (
  `id` varchar(128) NOT NULL,
  `usuario_id` bigint NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_sesion_usuario` (`usuario_id`),
  KEY `ix_sesion_activity` (`last_activity`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Agregar tabla de auditoría (NECESARIA para trazabilidad)
CREATE TABLE `auditoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint DEFAULT NULL,
  `accion` varchar(50) NOT NULL,
  `tabla` varchar(50) NOT NULL,
  `registro_id` bigint DEFAULT NULL,
  `valores_anteriores` json DEFAULT NULL,
  `valores_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_usuario` (`usuario_id`),
  KEY `ix_audit_tabla` (`tabla`, `registro_id`),
  KEY `ix_audit_fecha` (`created_at`),
  CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar algunos registros de ejemplo para la auditoría
INSERT INTO `auditoria` (`usuario_id`, `accion`, `tabla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `ip_address`, `created_at`) VALUES
(1, 'CREATE', 'pago', 1, NULL, '{"monto": 47012.50, "medio": "transferencia", "estado": "aplicado"}', '192.168.1.100', '2025-09-18 20:06:10'),
(1, 'UPDATE', 'persona', 1, '{"nombres": "María José", "email": "maria.gonzalez@email.com"}', '{"nombres": "Patricio", "email": "maria.gonzalez@email.com"}', '192.168.1.100', '2025-09-18 20:33:26'),
(2, 'CREATE', 'multa', 1, NULL, '{"monto": 50000.00, "motivo": "Ruidos molestos", "estado": "pendiente"}', '192.168.1.101', '2025-09-18 20:08:33'),
(3, 'UPDATE', 'cargo_unidad', 2, '{"saldo": 47012.50, "estado": "pendiente"}', '{"saldo": 35259.38, "estado": "parcial"}', '192.168.1.102', '2025-09-18 20:53:26'),
(1, 'DELETE', 'reserva_amenidad', 8, '{"estado": "solicitada", "inicio": "2025-10-05 14:00:00"}', NULL, '192.168.1.100', '2025-09-18 20:20:10');

-- Crear índices adicionales para optimizar consultas de sesiones
CREATE INDEX `ix_sesion_usuario_last_activity` ON `sesion_usuario` (`last_activity`);
CREATE INDEX `ix_sesion_usuario_created` ON `sesion_usuario` (`created_at`);

-- Crear índices adicionales para optimizar consultas de auditoría  
CREATE INDEX `ix_auditoria_accion` ON `auditoria` (`accion`);
CREATE INDEX `ix_auditoria_usuario_fecha` ON `auditoria` (`usuario_id`, `created_at`);

COMMIT;



-- gastos
-- Agregar índices y foreign keys
ALTER TABLE gasto ADD INDEX idx_gasto_estado (estado);
ALTER TABLE gasto ADD INDEX idx_gasto_numero (numero);
ALTER TABLE gasto ADD CONSTRAINT fk_gasto_creado_por FOREIGN KEY (creado_por) REFERENCES persona (id);
ALTER TABLE gasto ADD CONSTRAINT fk_gasto_aprobado_por FOREIGN KEY (aprobado_por) REFERENCES persona (id);

-- Actualizar números de gastos existentes
UPDATE gasto SET 
  numero = CONCAT('G2025-', LPAD(id, 4, '0'))
WHERE numero IS NULL OR numero = '';

-- Actualizar estados de gastos existentes 
UPDATE gasto SET estado = 'aprobado' WHERE estado IS NULL;

-- Actualizar creado_por para gastos existentes (asignar al primer admin)
UPDATE gasto SET creado_por = (
  SELECT p.id FROM persona p 
  JOIN membresia_comunidad mc ON p.id = mc.persona_id 
  WHERE mc.rol IN ('admin', 'superadmin') 
  AND mc.activo = 1 
  LIMIT 1
) WHERE creado_por IS NULL;

-- Crear tabla historial_gasto
CREATE TABLE IF NOT EXISTS historial_gasto (
  id bigint NOT NULL AUTO_INCREMENT,
  gasto_id bigint NOT NULL,
  accion enum('creado','modificado','aprobado','rechazado','pagado','anulado') NOT NULL,
  usuario_id bigint NOT NULL,
  observaciones text,
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY fk_historial_gasto (gasto_id),
  KEY fk_historial_usuario (usuario_id),
  KEY idx_historial_fecha (fecha),
  CONSTRAINT fk_historial_gasto FOREIGN KEY (gasto_id) REFERENCES gasto (id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar historial para gastos existentes
INSERT INTO historial_gasto (gasto_id, accion, usuario_id, observaciones, fecha)
SELECT 
  g.id,
  'creado',
  COALESCE(u.id, 1) as usuario_id,
  'Gasto migrado del sistema anterior',
  g.created_at
FROM gasto g
LEFT JOIN persona p ON g.creado_por = p.id
LEFT JOIN usuario u ON p.id = u.persona_id
WHERE NOT EXISTS (
  SELECT 1 FROM historial_gasto hg 
  WHERE hg.gasto_id = g.id AND hg.accion = 'creado'
);