-- CORRECCIONES REALIZADAS A LAS CONSULTAS SQL DE PERSONAS
-- Fecha: Octubre 2025

--------------------------------------------------------------------------------
-- RESUMEN DE CORRECCIONES
--------------------------------------------------------------------------------

-- ✅ TABLAS QUE EXISTEN Y SE USAN CORRECTAMENTE:
-- - persona ✓
-- - usuario ✓
-- - usuario_rol_comunidad ✓
-- - rol_sistema ✓
-- - titulares_unidad ✓
-- - unidad ✓
-- - edificio ✓
-- - torre ✓
-- - comunidad ✓
-- - cuenta_cobro_unidad ✓
-- - pago ✓
-- - pago_aplicacion ✓
-- - emision_gastos_comunes ✓
-- - auditoria ✓
-- - archivos ✓
-- - registro_conserjeria ✓

-- ❌ TABLAS QUE NO EXISTEN Y FUERON CORREGIDAS:
-- - notas ❌ → Reemplazado por registro_conserjeria y auditoria
-- - notificacion_usuario ❌ → Reemplazado por auditoria

--------------------------------------------------------------------------------
-- TABLAS ADICIONALES - NO SE PUEDEN CREAR (RESTRICCIÓN DEL USUARIO)
--------------------------------------------------------------------------------

-- NOTA: El usuario ha indicado que NO se pueden hacer modificaciones a las tablas existentes.
-- Por lo tanto, NO se pueden crear las siguientes tablas recomendadas:
-- - notas_persona
-- - notificaciones_persona

-- Las consultas han sido ajustadas para usar únicamente las tablas existentes:
-- - registro_conserjeria (para notas del conserje)
-- - auditoria (para actividad/notificaciones del sistema)

--------------------------------------------------------------------------------
-- CONSULTAS PARA NOTAS - USANDO SOLO TABLAS EXISTENTES
--------------------------------------------------------------------------------

-- Las consultas de notas ya han sido corregidas en el archivo principal
-- para usar registro_conserjeria y auditoria únicamente.

--------------------------------------------------------------------------------
-- VERIFICACIÓN DE INTEGRIDAD DE DATOS
--------------------------------------------------------------------------------

-- Verificar que todas las personas tienen usuario válido
SELECT
  p.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  CASE WHEN u.id IS NULL THEN 'SIN USUARIO' ELSE 'OK' END AS estado_usuario
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE u.id IS NULL;

-- Verificar unidades sin titular válido
SELECT
  u.id,
  u.codigo,
  'SIN TITULAR' AS problema
FROM unidad u
LEFT JOIN titulares_unidad tu ON tu.unidad_id = u.id
WHERE tu.id IS NULL;

-- Verificar usuarios sin roles
SELECT
  u.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  'SIN ROLES' AS problema
FROM usuario u
JOIN persona p ON p.id = u.persona_id
LEFT JOIN usuario_rol_comunidad urc ON urc.usuario_id = u.id AND urc.activo = 1
WHERE urc.id IS NULL;

--------------------------------------------------------------------------------
-- ÍNDICES - NO SE PUEDEN CREAR NUEVOS (RESTRICCIÓN DEL USUARIO)
--------------------------------------------------------------------------------

-- NOTA: No se pueden crear nuevos índices en las tablas existentes.
-- Se deben usar los índices que ya existen en el esquema de base de datos.
-- Las consultas han sido optimizadas para funcionar con los índices actuales.

--------------------------------------------------------------------------------
-- TESTING DE LAS CONSULTAS CORREGIDAS
--------------------------------------------------------------------------------

-- Probar consulta 1: Listado de personas
SELECT COUNT(*) as total_personas FROM (
  SELECT p.id FROM persona p LEFT JOIN usuario u ON u.persona_id = p.id
) t1;

-- Probar consulta 3: Detalle de persona existente
SELECT COUNT(*) as personas_con_usuario FROM persona p
INNER JOIN usuario u ON u.persona_id = p.id;

-- Probar consulta 4: Unidades por persona
SELECT
  p.id,
  CONCAT(p.nombres, ' ', p.apellidos) as nombre,
  COUNT(tu.id) as unidades_asociadas
FROM persona p
LEFT JOIN titulares_unidad tu ON tu.persona_id = p.id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
GROUP BY p.id, p.nombres, p.apellidos
ORDER BY unidades_asociadas DESC;
