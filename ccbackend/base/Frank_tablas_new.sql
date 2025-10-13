import api from './api'; // Cambio: import por defecto
import type {3: NUEVAS COLUMNAS EN TABLA gasto
  Gasto,=======================================
  CategoriaGasto,
  GastoEstadisticas,a numero
  GastoCreateRequest,
  GastoUpdateRequest,ARCHAR(50) DEFAULT NULL 
  PaginatedResponse
} from '../types/gastos';
-- 2. Agregar columna estado
export interface GastoFilters {
  estado?: string;` ENUM('borrador','aprobado','rechazado','pagado','anulado') NOT NULL DEFAULT 'aprobado' 
  categoria?: number;`;
  fechaDesde?: string;
  fechaHasta?: string;creado_por
  busqueda?: string;
  ordenar?: string;por` BIGINT DEFAULT NULL 
  direccion?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;umna aprobado_por
}LTER TABLE `gasto` 
ADD COLUMN `aprobado_por` BIGINT DEFAULT NULL 
class GastosService {
  private baseUrl = '/gastos';
-- 5. Agregar índices
  /** TABLE `gasto` 
   * Obtener gastos con filtros y paginación
   */NDEX `idx_gasto_numero` (`numero`);
  async getGastos(comunidadId: number, filters: GastoFilters = {}): Promise<PaginatedResponse<Gasto>> {
    const params = new URLSearchParams();
ALTER TABLE `gasto` 
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }ABLE `gasto` 
    });STRAINT `fk_gasto_aprobado_por` 
FOREIGN KEY (`aprobado_por`) REFERENCES `usuario` (`id`);
    const queryString = params.toString();
    const url = `${this.baseUrl}/comunidad/${comunidadId}${queryString ? `?${queryString}` : ''}`;
UPDATE `gasto` 
    const response = await api.get(url); 6, '0'))
    return response.data; `numero` = '';
  }
-- Verificar
  /**T id, numero, estado, creado_por, aprobado_por FROM gasto LIMIT 5;
   * Obtener detalle de un gasto
   */==========================================
  async getGasto(id: number): Promise<Gasto> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }ATE TABLE IF NOT EXISTS `historial_gasto` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  /**sto_id` BIGINT NOT NULL,
   * Crear nuevo gastoo','modificado','aprobado','rechazado','pagado','anulado') NOT NULL,
   */uario_id` BIGINT NOT NULL,
  async createGasto(comunidadId: number, gastoData: GastoCreateRequest): Promise<any> {
    const response = await api.post(`/gastos/comunidad/${comunidadId}`, {
      categoria_id: gastoData.categoria_id,
      proveedor_id: gastoData.proveedor_id || null,  // ← AGREGAR ESTA LÍNEA
      centro_costo_id: gastoData.centro_costo_id || null,
      documento_compra_id: gastoData.documento_compra_id || null,
      fecha: gastoData.fecha,sto` 
      monto: gastoData.monto,REFERENCES `gasto` (`id`) ON DELETE CASCADE,
      glosa: gastoData.glosa,uario` 
      extraordinario: gastoData.extraordinario || false,`)
    });E=InnoDB DEFAULT CHARSET=utf8mb4;

    return response.data;
  }CRIBE historial_gasto;

  /**==========================================
   * Actualizar gasto DE EJEMPLO PARA AUDITORÍA
   */==========================================
  async updateGasto(id: number, gasto: GastoUpdateRequest): Promise<Gasto> {
    const response = await api.put(`${this.baseUrl}/${id}`, gasto);
    return response.data.data;bla`, `registro_id`, `valores_anteriores`, `valores_nuevos`, `ip_address`, `created_at`) 
  }UES
  (1, 'CREATE', 'pago', 1, NULL, '{"monto": 47012.50, "medio": "transferencia", "estado": "aplicado"}', '192.168.1.100', '2025-09-18 20:06:10'),
  /** 'UPDATE', 'persona', 1, '{"nombres": "María José"}', '{"nombres": "Patricio"}', '192.168.1.100', '2025-09-18 20:33:26'),
   * Aprobar gastoulta', 1, NULL, '{"monto": 50000.00, "motivo": "Ruidos molestos"}', '192.168.1.101', '2025-09-18 20:08:33');
   */
  async aprobarGasto(id: number, observaciones?: string): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/aprobar`, { observaciones });al_multa, etc.)
  }============================================

  /**==========================================
   * Rechazar gastoento_multa (adjuntos a multas)
   */==========================================
  async rechazarGasto(id: number, observaciones_rechazo: string): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/rechazar`, { observaciones_rechazo });
  }id` BIGINT NOT NULL AUTO_INCREMENT,
  `multa_id` BIGINT NOT NULL COMMENT 'ID de la multa',
  /**po` ENUM('foto','video','pdf','acta','otros') NOT NULL COMMENT 'Tipo de documento',
   * Enviar gasto para aprobaciónOT NULL COMMENT 'Nombre del archivo',
   */ta_archivo` VARCHAR(500) NOT NULL COMMENT 'Ruta donde está almacenado',
  async enviarAprobacion(id: number): Promise<void> {es',
    await api.put(`${this.baseUrl}/${id}/enviar-aprobacion`);
  }descripcion` TEXT DEFAULT NULL COMMENT 'Descripción del documento',
  `subido_por` BIGINT NOT NULL COMMENT 'Usuario que subió el documento',
  /**eated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   * Eliminar gasto (solo borradores)
   */ `fk_documento_multa` (`multa_id`),
  async deleteGasto(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }ONSTRAINT `fk_documento_multa` 
    FOREIGN KEY (`multa_id`) REFERENCES `multa` (`id`) ON DELETE CASCADE,
  /**STRAINT `fk_documento_usuario` 
   * Obtener estadísticas de gastosRENCES `usuario` (`id`)
   */INE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  async getEstadisticas(comunidadId: number): Promise<GastoEstadisticas> {
    const response = await api.get(`${this.baseUrl}/comunidad/${comunidadId}/stats`);
    return response.data.data;lta y tipo
  }ATE INDEX IF NOT EXISTS `idx_documento_multa_tipo` ON `documento_multa` (`multa_id`, `tipo`);

  /**rificar estructura
   * Obtener categorías de gasto
   */
  async getCategorias(comunidadId: number): Promise<CategoriaGasto[]> {
    const response = await api.get(`/categorias-gasto/comunidad/${comunidadId}`);
    return response.data.data;=================
  }
-- Insertar historial de multas existentes (si hay multas en la BD)
  /**T INTO `historial_multa` 
   * Crear nueva categoríausuario_id`, `monto_nuevo`, `observaciones`, `fecha`)
   */T 
  async createCategoria(comunidadId: number, categoria: Omit<CategoriaGasto, 'id' | 'created_at' | 'updated_at' | 'total_gastos' | 'monto_total'>): Promise<CategoriaGasto> {
    const response = await api.post(`/categorias-gasto/comunidad/${comunidadId}`, categoria);
    return response.data.data;
  }onto,
  CONCAT('Multa creada: ', motivo),
  /**ha_emision
   * Actualizar categoría
   */ NOT EXISTS (
  async updateCategoria(id: number, categoria: Partial<CategoriaGasto>): Promise<CategoriaGasto> {
    const response = await api.put(`/categorias-gasto/${id}`, categoria);
    return response.data.data;
  }
- Ejemplo de documento (solo si no existe)
  async getAprobaciones(gastoId: number): Promise<any[]> {INSERT IGNORE INTO `documento_multa` 
    const resp = await api.get(`/gastos/${gastoId}/aprobaciones`);
    export const gastosService = new GastosService();
    return resp.data;
    const resp = await api.post(`/gastos/${gastoId}/aprobaciones`, body);
  async postAprobacion(gastoId: number, body: { decision: 'aprobado'|'rechazado', observaciones?: string, monto_aprobado?: number }) {
    return resp.data.data || resp.data;
  }
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

-- ============================================
-- FIN - AHORA REINICIA EL BACKEND Y PRUEBA LOGIN
-- ============================================

-- ============================================
-- INICIO - MODIFICAR VIEW MIEMBRO COMUNIDAD PARA INCLUIR MÁS DATOS
-- ============================================
DROP VIEW IF EXISTS usuario_miembro_comunidad;
CREATE OR REPLACE VIEW usuario_miembro_comunidad AS
SELECT
  ucr.id                         AS id,
  ucr.id                         AS membership_id,
  ucr.usuario_id                 AS usuario_id,
  u.persona_id                   AS persona_id,
  ucr.comunidad_id               AS comunidad_id,
  COALESCE(ucr.rol_id, 0)        AS rol_id,
  COALESCE(rs.codigo, ucr.rol)   AS rol_slug,
  COALESCE(rs.nombre, NULL)      AS rol_nombre,
  ucr.desde                      AS desde,
  ucr.hasta                      AS hasta,
  ucr.activo                     AS activo,
  ucr.created_at                 AS created_at,
  ucr.updated_at                 AS updated_at,
  c.razon_social                 AS comunidad_nombre
FROM usuario_rol_comunidad ucr
LEFT JOIN usuario u       ON u.id = ucr.usuario_id
LEFT JOIN rol_sistema rs  ON rs.id = ucr.rol_id
LEFT JOIN comunidad c    ON c.id = ucr.comunidad_id;

--Índices sobre la tabla base, no sobre la vista
ALTER TABLE usuario_rol_comunidad
  ADD INDEX idx_usuario_id_activo (usuario_id, activo),
  ADD INDEX idx_comunidad_id_activo (comunidad_id, activo),
  ADD INDEX idx_usuario_comunidad_activo (usuario_id, comunidad_id, activo),
  ADD INDEX idx_rol_id (rol_id);


-- ============================================
-- FIN - AHORA REINICIA EL BACKEND Y PRUEBA LOGIN
-- ============================================


/*
  MIGRACIÓN: normalizar / asegurar tabla de apelaciones (multa_apelacion)
  - Crea la tabla si no existe (nombre: multa_apelacion)
  - Añade columnas faltantes si es necesario
  - Crea índices si faltan
  - Añade foreign keys si faltan
  - Idempotente: se puede ejecutar varias veces sin duplicar
*/
CREATE TABLE IF NOT EXISTS `multa_apelacion` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `multa_id` BIGINT NOT NULL,
  `usuario_id` BIGINT NOT NULL,
  `persona_id` BIGINT DEFAULT NULL,
  `comunidad_id` BIGINT DEFAULT NULL,
  `motivo` TEXT NOT NULL,
  `documentos_json` JSON DEFAULT NULL,
  `estado` ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
  `resolucion` TEXT DEFAULT NULL,
  `resuelto_por` BIGINT DEFAULT NULL,
  `fecha_apelacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_resolucion` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Apelaciones relacionadas con multas (multa_apelacion)';

-- Crear índices de forma segura (procedimiento temporal)
DELIMITER $$
DROP PROCEDURE IF EXISTS _ensure_idx_multa_apelacion$$
CREATE PROCEDURE _ensure_idx_multa_apelacion()
BEGIN
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND INDEX_NAME = 'idx_apelacion_multa') = 0 THEN
    CREATE INDEX idx_apelacion_multa ON multa_apelacion(multa_id);
  END IF;
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND INDEX_NAME = 'idx_apelacion_usuario') = 0 THEN
    CREATE INDEX idx_apelacion_usuario ON multa_apelacion(usuario_id);
  END IF;
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND INDEX_NAME = 'idx_apelacion_persona') = 0 THEN
    CREATE INDEX idx_apelacion_persona ON multa_apelacion(persona_id);
  END IF;
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND INDEX_NAME = 'idx_apelacion_comunidad') = 0 THEN
    CREATE INDEX idx_apelacion_comunidad ON multa_apelacion(comunidad_id);
  END IF;
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND INDEX_NAME = 'idx_apelacion_estado') = 0 THEN
    CREATE INDEX idx_apelacion_estado ON multa_apelacion(estado);
  END IF;
END$$
CALL _ensure_idx_multa_apelacion()$$
DROP PROCEDURE IF EXISTS _ensure_idx_multa_apelacion$$
DELIMITER ;

-- Añadir foreign keys de forma segura (procedimiento temporal)
DELIMITER $$
DROP PROCEDURE IF EXISTS _ensure_fks_multa_apelacion$$
CREATE PROCEDURE _ensure_fks_multa_apelacion()
BEGIN
  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND CONSTRAINT_NAME = 'fk_multa_apelacion_multa') = 0 THEN
    ALTER TABLE multa_apelacion
      ADD CONSTRAINT fk_multa_apelacion_multa FOREIGN KEY (multa_id) REFERENCES multa(id) ON DELETE CASCADE;
  END IF;

  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND CONSTRAINT_NAME = 'fk_multa_apelacion_usuario') = 0 THEN
    ALTER TABLE multa_apelacion
      ADD CONSTRAINT fk_multa_apelacion_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id);
  END IF;

  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND CONSTRAINT_NAME = 'fk_multa_apelacion_persona') = 0 THEN
    ALTER TABLE multa_apelacion
      ADD CONSTRAINT fk_multa_apelacion_persona FOREIGN KEY (persona_id) REFERENCES persona(id);
  END IF;

  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND CONSTRAINT_NAME = 'fk_multa_apelacion_comunidad') = 0 THEN
    ALTER TABLE multa_apelacion
      ADD CONSTRAINT fk_multa_apelacion_comunidad FOREIGN KEY (comunidad_id) REFERENCES comunidad(id);
  END IF;

  IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'multa_apelacion' AND CONSTRAINT_NAME = 'fk_multa_apelacion_resuelto_por') = 0 THEN
    ALTER TABLE multa_apelacion
      ADD CONSTRAINT fk_multa_apelacion_resuelto_por FOREIGN KEY (resuelto_por) REFERENCES usuario(id);
  END IF;
END$$
CALL _ensure_fks_multa_apelacion()$$
DROP PROCEDURE IF EXISTS _ensure_fks_multa_apelacion$$
DELIMITER ;

-- Datos de ejemplo (solo si no existen)
INSERT INTO multa_apelacion (multa_id, usuario_id, motivo, estado, fecha_apelacion)
SELECT 1, 1, 'Ejemplo de apelación', 'pendiente', NOW()
WHERE NOT EXISTS (SELECT 1 FROM multa_apelacion WHERE multa_id = 1 AND usuario_id = 1 LIMIT 1);

-- FIN DEL ARCHIVO


CREATE TABLE IF NOT EXISTS gasto_aprobacion (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  gasto_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  rol_id INT DEFAULT NULL,
  decision ENUM('aprobado','rechazado') NOT NULL,
  observaciones TEXT DEFAULT NULL,
  monto_aprobado DECIMAL(12,2) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ga_gasto FOREIGN KEY (gasto_id) REFERENCES gasto(id),
  CONSTRAINT fk_ga_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_ga_rol FOREIGN KEY (rol_id) REFERENCES rol_sistema(id)
);

-- Backfill: contar aprobaciones y fijar aprobado_por/aprobado_at si ya cumplen required_aprobaciones
UPDATE gasto g
LEFT JOIN (
  SELECT gasto_id, SUM(decision='aprobado') AS aprobadas
  FROM gasto_aprobacion
  GROUP BY gasto_id
) ga ON ga.gasto_id = g.id
SET g.aprobaciones_count = COALESCE(ga.aprobadas, 0);

-- Para los casos que ya cumplen required_aprobaciones, fijar aprobado_at y aprobado_por (último aprobador)
UPDATE gasto g
SET
  g.aprobado_at = (
    SELECT created_at FROM gasto_aprobacion
    WHERE gasto_id = g.id AND decision = 'aprobado'
    ORDER BY created_at DESC LIMIT 1
  ),
  g.aprobado_por = (
    SELECT usuario_id FROM gasto_aprobacion
    WHERE gasto_id = g.id AND decision = 'aprobado'
    ORDER BY created_at DESC LIMIT 1
  ),
  g.estado = 'aprobado'
WHERE COALESCE(g.aprobaciones_count,0) >= COALESCE(g.required_aprobaciones,1);