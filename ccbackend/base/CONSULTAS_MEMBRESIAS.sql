-- ===========================================
-- CONSULTAS PARA EL MÓDULO DE MEMBRESÍAS
-- Extraído de los endpoints en membresias.js
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
-- Filtros opcionales (descomentar según necesidad):
-- AND urc.usuario_id = 2
AND urc.activo = 1
ORDER BY urc.created_at DESC
LIMIT 20 OFFSET 0;

-- ===========================================
-- 2. CONTAR MEMBRESÍAS TOTALES (para paginación)
-- ===========================================
SELECT COUNT(*) as total
FROM usuario_rol_comunidad urc
WHERE 1=1
-- Filtros opcionales (descomentar según necesidad):
-- AND comunidad_id = ?
-- AND usuario_id = ?
-- AND rol_id = ?
-- AND activo = ?;

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
WHERE urc.id = 1; -- Reemplazar con el ID deseado

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
DESCRIBE usuario_rol_comunidad;
DESCRIBE rol_sistema;
DESCRIBE usuario;
DESCRIBE persona;
DESCRIBE comunidad;

-- Contar registros en cada tabla
SELECT 'usuario_rol_comunidad' as tabla, COUNT(*) as total FROM usuario_rol_comunidad
UNION ALL
SELECT 'rol_sistema' as tabla, COUNT(*) as total FROM rol_sistema
UNION ALL
SELECT 'usuario' as tabla, COUNT(*) as total FROM usuario
UNION ALL
SELECT 'persona' as tabla, COUNT(*) as total FROM persona
UNION ALL
SELECT 'comunidad' as tabla, COUNT(*) as total FROM comunidad;

-- Ver membresías activas por comunidad
SELECT
  c.razon_social AS comunidad,
  COUNT(*) as total_membresias,
  SUM(CASE WHEN urc.activo = 1 THEN 1 ELSE 0 END) as activas,
  SUM(CASE WHEN urc.activo = 0 THEN 1 ELSE 0 END) as inactivas
FROM usuario_rol_comunidad urc
JOIN comunidad c ON urc.comunidad_id = c.id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- Ver distribución de roles
SELECT
  rs.nombre AS rol,
  rs.codigo AS codigo_rol,
  COUNT(*) as cantidad
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
  DATEDIFF(urc.hasta, CURDATE()) as dias_restantes
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
  DATEDIFF(CURDATE(), urc.hasta) as dias_vencidas
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
  1, -- comunidad_id
  2, -- usuario_id  
  7, -- rol_id (residente por defecto)
  CURDATE(), -- desde (hoy)
  NULL, -- hasta (indefinido)
  1 -- activo
);

-- ===========================================
-- 7. ELIMINAR MEMBRESÍA (DELETE /:id)
-- ===========================================
DELETE FROM usuario_rol_comunidad 
WHERE id = 1; -- Reemplazar con el ID deseado

-- ===========================================
-- 8. ACTUALIZAR MEMBRESÍA (PATCH /:id)
-- ===========================================
UPDATE usuario_rol_comunidad
SET rol_id = 6, activo = 1, hasta = '2024-12-31', updated_at = NOW()
WHERE id = 1; -- Reemplazar con el ID deseado

-- Ejemplo completo de actualización (solo campos enviados):
UPDATE usuario_rol_comunidad
SET
  rol_id = CASE WHEN ? IS NOT NULL THEN ? ELSE rol_id END,
  activo = CASE WHEN ? IS NOT NULL THEN ? ELSE activo END,
  hasta = CASE WHEN ? IS NOT NULL THEN ? ELSE hasta END,
  updated_at = NOW()
WHERE id = ?;

-- ===========================================
-- 9. CATÁLOGO DE ESTADOS (GET /catalogos/estados)
-- ===========================================
-- Este endpoint devuelve un array estático: ['activo', 'inactivo']
-- No requiere consulta SQL adicional

-- ===========================================
-- 10. CONSULTAS DE ESTADÍSTICAS PARA DASHBOARD
-- ===========================================

-- Estadísticas generales de membresías
SELECT
  COUNT(*) as total_membresias,
  SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activas,
  SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivas,
  SUM(CASE WHEN hasta IS NOT NULL AND hasta >= CURDATE() AND DATEDIFF(hasta, CURDATE()) <= 30 THEN 1 ELSE 0 END) as vencen_este_mes,
  SUM(CASE WHEN hasta IS NOT NULL AND hasta < CURDATE() THEN 1 ELSE 0 END) as vencidas
FROM usuario_rol_comunidad;

-- Membresías por rol
SELECT
  rs.nombre AS rol,
  rs.codigo AS codigo_rol,
  COUNT(*) as cantidad,
  SUM(CASE WHEN urc.activo = 1 THEN 1 ELSE 0 END) as activas
FROM usuario_rol_comunidad urc
JOIN rol_sistema rs ON urc.rol_id = rs.id
GROUP BY rs.id, rs.nombre, rs.codigo
ORDER BY rs.nivel_acceso;

-- Membresías por comunidad
SELECT
  c.razon_social AS comunidad,
  COUNT(*) as total_membresias,
  SUM(CASE WHEN urc.activo = 1 THEN 1 ELSE 0 END) as activas,
  SUM(CASE WHEN urc.activo = 0 THEN 1 ELSE 0 END) as inactivas
FROM usuario_rol_comunidad urc
JOIN comunidad c ON urc.comunidad_id = c.id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- ===========================================
-- 11. CONSULTAS DE VALIDACIÓN Y VERIFICACIÓN
-- ===========================================

-- Verificar si un usuario ya tiene membresía en una comunidad
SELECT COUNT(*) as existe_membresia
FROM usuario_rol_comunidad
WHERE usuario_id = 2 AND comunidad_id = 1;

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
WHERE urc.usuario_id = 2 AND urc.activo = 1
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
WHERE urc.activo = 1 AND rs.nivel_acceso <= 3 -- Solo roles con alto privilegio
ORDER BY rs.nivel_acceso, c.razon_social;