-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE MEMBRESÍAS
-- Sistema de Cuentas Claras (Basado en el esquema 'usuario_rol_comunidad')
-- ===========================================

-- ===========================================
-- 1. LISTAR MEMBRESÍAS (GET /)
-- Consulta principal para obtener todas las membresías con filtros opcionales
-- ===========================================
SELECT
  urc.id,
  urc.usuario_id,
  u.username,
  p.nombres,
  p.apellidos,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  p.rut,
  p.dv,
  CONCAT(p.rut, '-', p.dv) AS rut_completo,
  c.id AS comunidad_id,
  c.razon_social AS comunidad_nombre,
  rs.id AS rol_id,
  rs.nombre AS rol_nombre,
  rs.codigo AS rol_codigo,
  rs.nivel_acceso,
  urc.desde,
  urc.hasta,
  urc.activo,
  urc.created_at,
  urc.updated_at
FROM usuario_rol_comunidad urc
JOIN usuario u ON urc.usuario_id = u.id
JOIN persona p ON u.persona_id = p.id
JOIN comunidad c ON urc.comunidad_id = c.id
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE 1=1
-- Filtros opcionales (ejemplo de uso de placeholders):
-- AND urc.usuario_id = ? /* :usuario_id */
-- AND urc.comunidad_id = ? /* :comunidad_id */
-- AND urc.rol_id = ? /* :rol_id */
AND urc.activo = 1 /* Filtro por activo por defecto */
ORDER BY urc.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR MEMBRESÍAS TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) AS total
FROM usuario_rol_comunidad urc
WHERE 1=1
-- Filtros opcionales (ejemplo de uso de placeholders):
-- AND urc.comunidad_id = ? /* :comunidad_id */
-- AND urc.usuario_id = ? /* :usuario_id */
-- AND urc.rol_id = ? /* :rol_id */
-- AND urc.activo = ?; /* :activo */

-- ===========================================
-- 3. OBTENER MEMBRESÍA POR ID (GET /:id)
-- ===========================================
SELECT
  urc.id,
  urc.usuario_id,
  u.username,
  p.nombres,
  p.apellidos,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  p.rut,
  p.dv,
  CONCAT(p.rut, '-', p.dv) AS rut_completo,
  c.id AS comunidad_id,
  c.razon_social AS comunidad_nombre,
  rs.id AS rol_id,
  rs.nombre AS rol_nombre,
  rs.codigo AS rol_codigo,
  rs.nivel_acceso,
  urc.desde,
  urc.hasta,
  urc.activo,
  urc.created_at,
  urc.updated_at
FROM usuario_rol_comunidad urc
JOIN usuario u ON urc.usuario_id = u.id
JOIN persona p ON u.persona_id = p.id
JOIN comunidad c ON urc.comunidad_id = c.id
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.id = ?; /* :membresia_id */

-- ===========================================
-- 4. OBTENER CATÁLOGO DE PLANES/ROLES (GET /catalogos/planes)
-- ===========================================
SELECT id, codigo, nombre, nivel_acceso
FROM rol_sistema
ORDER BY nivel_acceso;

-- ===========================================
-- 5. CONSULTAS ADICIONALES PARA TESTING
-- ===========================================

-- Verificar estructura de tablas principales
-- NOTA: Se asume MySQL/MariaDB por la sintaxis DESCRIBE
DESCRIBE usuario_rol_comunidad;
DESCRIBE rol_sistema;
DESCRIBE usuario;
DESCRIBE persona;
DESCRIBE comunidad;

-- Contar registros en cada tabla
SELECT 'usuario_rol_comunidad' AS tabla, COUNT(*) AS total FROM usuario_rol_comunidad
UNION ALL
SELECT 'rol_sistema' AS tabla, COUNT(*) AS total FROM rol_sistema
UNION ALL
SELECT 'usuario' AS tabla, COUNT(*) AS total FROM usuario
UNION ALL
SELECT 'persona' AS tabla, COUNT(*) AS total FROM persona
UNION ALL
SELECT 'comunidad' AS tabla, COUNT(*) AS total FROM comunidad;

-- Ver membresías activas por comunidad
SELECT
  c.razon_social AS comunidad,
  COUNT(*) AS total_membresias,
  SUM(CASE WHEN urc.activo = 1 THEN 1 ELSE 0 END) AS activas,
  SUM(CASE WHEN urc.activo = 0 THEN 1 ELSE 0 END) AS inactivas
FROM usuario_rol_comunidad urc
JOIN comunidad c ON urc.comunidad_id = c.id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- Ver distribución de roles
SELECT
  rs.nombre AS rol,
  rs.codigo AS codigo_rol,
  COUNT(*) AS cantidad
FROM usuario_rol_comunidad urc
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.activo = 1
GROUP BY rs.id, rs.nombre, rs.codigo
ORDER BY rs.nivel_acceso;

-- Ver membresías próximas a vencer (próximos 30 días)
SELECT
  urc.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  c.razon_social AS comunidad,
  rs.nombre AS rol,
  urc.desde,
  urc.hasta,
  DATEDIFF(urc.hasta, CURDATE()) AS dias_restantes
FROM usuario_rol_comunidad urc
JOIN usuario u ON urc.usuario_id = u.id
JOIN persona p ON u.persona_id = p.id
JOIN comunidad c ON urc.comunidad_id = c.id
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.activo = 1
  AND urc.hasta IS NOT NULL
  AND urc.hasta >= CURDATE()
  AND DATEDIFF(urc.hasta, CURDATE()) <= 30
ORDER BY urc.hasta;

-- Ver membresías vencidas
SELECT
  urc.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  c.razon_social AS comunidad,
  rs.nombre AS rol,
  urc.desde,
  urc.hasta,
  DATEDIFF(CURDATE(), urc.hasta) AS dias_vencidas
FROM usuario_rol_comunidad urc
JOIN usuario u ON urc.usuario_id = u.id
JOIN persona p ON u.persona_id = p.id
JOIN comunidad c ON urc.comunidad_id = c.id
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.activo = 1
  AND urc.hasta IS NOT NULL
  AND urc.hasta < CURDATE()
ORDER BY urc.hasta DESC;

-- ===========================================
-- 6. CREAR MEMBRESÍA (POST /)
-- ===========================================
INSERT INTO usuario_rol_comunidad (
  comunidad_id,
  usuario_id,
  rol_id,
  desde,
  hasta,
  activo
) VALUES (
  ?1, -- comunidad_id
  ?2, -- usuario_id
  ?3, -- rol_id
  CURDATE(), -- desde (hoy)
  ?4, -- hasta (NULL si es indefinido)
  1 -- activo (1 por defecto)
);

-- ===========================================
-- 7. ELIMINAR MEMBRESÍA (DELETE /:id)
-- ===========================================
DELETE FROM usuario_rol_comunidad
WHERE id = ?; /* :membresia_id */

-- ===========================================
-- 8. ACTUALIZAR MEMBRESÍA (PATCH /:id)
-- ===========================================
-- Ejemplo completo de actualización (solo campos enviados, usando placeholders posicionales para los valores):
UPDATE usuario_rol_comunidad
SET
  rol_id = CASE WHEN ?1 IS NOT NULL THEN ?1 ELSE rol_id END,
  activo = CASE WHEN ?2 IS NOT NULL THEN ?2 ELSE activo END,
  hasta = CASE WHEN ?3 IS NOT NULL THEN ?3 ELSE hasta END,
  updated_at = NOW()
WHERE id = ?4; /* :membresia_id */

-- ===========================================
-- 9. CATÁLOGO DE ESTADOS (GET /catalogos/estados)
-- ===========================================
-- NOTA: Este endpoint devuelve un array estático: ['activo', 'inactivo']. No requiere consulta SQL.

-- ===========================================
-- 10. CONSULTAS DE ESTADÍSTICAS PARA DASHBOARD
-- ===========================================

-- Estadísticas generales de membresías
SELECT
  COUNT(*) AS total_membresias,
  SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) AS activas,
  SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) AS inactivas,
  -- CORRECCIÓN: Se usa DATEDIFF y CURDATE() para 'vencen_este_mes'
  SUM(CASE WHEN hasta IS NOT NULL AND hasta >= CURDATE() AND DATEDIFF(hasta, CURDATE()) <= 30 THEN 1 ELSE 0 END) AS vencen_este_mes,
  SUM(CASE WHEN hasta IS NOT NULL AND hasta < CURDATE() THEN 1 ELSE 0 END) AS vencidas
FROM usuario_rol_comunidad;

-- Membresías por rol
SELECT
  rs.nombre AS rol,
  rs.codigo AS codigo_rol,
  COUNT(*) AS cantidad,
  SUM(CASE WHEN urc.activo = 1 THEN 1 ELSE 0 END) AS activas
FROM usuario_rol_comunidad urc
JOIN rol_sistema rs ON urc.rol_id = rs.id
GROUP BY rs.id, rs.nombre, rs.codigo, rs.nivel_acceso
ORDER BY rs.nivel_acceso;

-- Membresías por comunidad
SELECT
  c.razon_social AS comunidad,
  COUNT(*) AS total_membresias,
  SUM(CASE WHEN urc.activo = 1 THEN 1 ELSE 0 END) AS activas,
  SUM(CASE WHEN urc.activo = 0 THEN 1 ELSE 0 END) AS inactivas
FROM usuario_rol_comunidad urc
JOIN comunidad c ON urc.comunidad_id = c.id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- ===========================================
-- 11. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- ===========================================

-- Verificar si un usuario ya tiene membresía activa en una comunidad
SELECT COUNT(*) AS existe_membresia
FROM usuario_rol_comunidad
WHERE usuario_id = ?1 /* :usuario_id */ AND comunidad_id = ?2 /* :comunidad_id */ AND activo = 1;

-- Obtener membresías activas de un usuario específico
SELECT
  urc.id,
  c.razon_social AS comunidad,
  rs.nombre AS rol,
  rs.codigo AS codigo_rol,
  urc.desde,
  urc.hasta
FROM usuario_rol_comunidad urc
JOIN comunidad c ON urc.comunidad_id = c.id
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.usuario_id = ? /* :usuario_id */ AND urc.activo = 1
ORDER BY urc.created_at DESC;

-- Verificar jerarquía de roles (usuarios con mayor privilegio)
SELECT
  urc.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  c.razon_social AS comunidad,
  rs.nombre AS rol,
  rs.nivel_acceso
FROM usuario_rol_comunidad urc
JOIN usuario u ON urc.usuario_id = u.id
JOIN persona p ON u.persona_id = p.id
JOIN comunidad c ON urc.comunidad_id = c.id
JOIN rol_sistema rs ON urc.rol_id = rs.id
WHERE urc.activo = 1 AND rs.nivel_acceso <= 3 -- Solo roles con nivel de acceso 1, 2, 3 (alto privilegio)
ORDER BY rs.nivel_acceso, c.razon_social;