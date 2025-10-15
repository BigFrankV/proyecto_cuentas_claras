-- queries_personas.sql
-- Consultas SQL completas para el módulo "personas".
-- Basado en el análisis del frontend (personas.tsx, nueva.tsx, [id].tsx)
-- y el esquema de base de datos (cuentasclaras.sql)

--------------------------------------------------------------------------------
-- 1) LISTADO de personas (para personas.tsx)
--------------------------------------------------------------------------------
-- Retorna: id, nombre completo, dni, email, telefono, tipo, estado, unidades, fechaRegistro, avatar

SELECT
  p.id,
  p.rut AS dni,
  p.dv,
  p.nombres,
  p.apellidos,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  p.email,
  p.telefono,
  -- Tipo basado en roles o titularidad
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_comunidad_rol ucr
      JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  -- Estado del usuario
  CASE WHEN u.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Conteo de unidades asociadas
  (SELECT COUNT(*) FROM titulares_unidad tu
   WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())) AS unidades,
  -- Fecha de registro
  DATE(u.created_at) AS fechaRegistro,
  -- Avatar (si existe en archivos)
  (SELECT a.filename FROM archivos a
   WHERE a.entity_type = 'personas' AND a.entity_id = p.id
   AND a.category = 'avatar' AND a.is_active = 1
   ORDER BY a.uploaded_at DESC LIMIT 1) AS avatar
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
ORDER BY p.apellidos, p.nombres;

--------------------------------------------------------------------------------
-- 2) ESTADÍSTICAS del módulo personas
--------------------------------------------------------------------------------
-- Retorna: total_personas, propietarios, inquilinos, administradores, activos, inactivos

SELECT
  COUNT(DISTINCT p.id) AS total_personas,
  SUM(CASE WHEN EXISTS (
    SELECT 1 FROM usuario_comunidad_rol ucr
    JOIN rol r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
  ) THEN 1 ELSE 0 END) AS administradores,
  SUM(CASE WHEN EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ) THEN 1 ELSE 0 END) AS inquilinos,
  SUM(CASE WHEN NOT EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ) AND NOT EXISTS (
    SELECT 1 FROM usuario_comunidad_rol ucr
    JOIN rol r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
  ) THEN 1 ELSE 0 END) AS propietarios,
  SUM(CASE WHEN u.activo = 1 THEN 1 ELSE 0 END) AS activos,
  SUM(CASE WHEN u.activo = 0 OR u.activo IS NULL THEN 1 ELSE 0 END) AS inactivos
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id;

--------------------------------------------------------------------------------
-- 3) DETALLE COMPLETO de una persona (para [id].tsx)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: toda la información básica + estadísticas

SELECT
  p.id,
  p.rut AS dni,
  p.dv,
  p.nombres,
  p.apellidos,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  p.email,
  p.telefono,
  p.direccion,
  u.username,
  u.activo AS usuario_activo,
  DATE(u.created_at) AS fechaRegistro,
  -- Último acceso del usuario
  (SELECT DATE(a.created_at)
   FROM auditoria a
   WHERE a.usuario_id = u.id AND a.accion = 'login'
   ORDER BY a.created_at DESC LIMIT 1) AS ultimoAcceso,
  -- Nivel de acceso (rol más alto)
  (SELECT r.nombre
   FROM usuario_comunidad_rol ucr
   JOIN rol r ON r.id = ucr.rol_id
   WHERE ucr.usuario_id = u.id AND ucr.activo = 1
   ORDER BY r.nivel_acceso DESC LIMIT 1) AS nivelAcceso,
  -- Tipo basado en lógica
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_comunidad_rol ucr
      JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  -- Estado
  CASE WHEN u.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Estadísticas
  (SELECT COUNT(*) FROM titulares_unidad tu
   WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())) AS total_unidades,
  COALESCE((
    SELECT SUM(ccu.saldo)
    FROM cuenta_cobro_unidad ccu
    JOIN titulares_unidad tu ON tu.unidad_id = ccu.unidad_id
    WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ), 0) AS saldo_total,
  -- Avatar
  (SELECT CONCAT('/uploads/', a.filename) FROM archivos a
   WHERE a.entity_type = 'personas' AND a.entity_id = p.id
   AND a.category = 'avatar' AND a.is_active = 1
   ORDER BY a.uploaded_at DESC LIMIT 1) AS avatar
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE p.id = ?; -- persona_id

--------------------------------------------------------------------------------
-- 4) UNIDADES ASOCIADAS a una persona (pestaña unidades en [id].tsx)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: id, nombre, edificio, comunidad, direccion, metrosCuadrados, estado, saldoPendiente, relacion

SELECT
  u.id,
  u.codigo AS nombre,
  e.nombre AS edificio,
  c.razon_social AS comunidad,
  CONCAT(
    COALESCE(e.direccion, ''), ', ',
    COALESCE(t.nombre, ''), ', ',
    COALESCE(u.codigo, '')
  ) AS direccion,
  u.m2_utiles AS metrosCuadrados,
  CASE WHEN u.activa = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Saldo pendiente de la unidad
  COALESCE((
    SELECT SUM(ccu.saldo) FROM cuenta_cobro_unidad ccu
    WHERE ccu.unidad_id = u.id
  ), 0) AS saldoPendiente,
  -- Relación (propietario/arrendatario)
  CASE WHEN tu.tipo = 'propietario' THEN 'Propietario' ELSE 'Inquilino' END AS relacion,
  tu.desde AS fecha_asignacion,
  tu.hasta AS fecha_fin,
  tu.porcentaje
FROM titulares_unidad tu
JOIN unidad u ON u.id = tu.unidad_id
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre t ON t.id = u.torre_id
LEFT JOIN comunidad c ON c.id = u.comunidad_id
WHERE tu.persona_id = ? -- persona_id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
ORDER BY tu.desde DESC;

--------------------------------------------------------------------------------
-- 5) PAGOS REALIZADOS por una persona (pestaña pagos en [id].tsx)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: id, fecha, unidad, periodo, importe, metodo, estado

SELECT
  p.id,
  DATE(p.fecha) AS fecha,
  u.codigo AS unidad,
  -- Periodo (del emisión relacionado)
  COALESCE(eg.periodo, 'Sin periodo') AS periodo,
  p.monto AS importe,
  p.medio AS metodo,
  CASE
    WHEN p.estado = 'aplicado' THEN 'Pagado'
    WHEN p.estado = 'pendiente' THEN 'Pendiente'
    ELSE p.estado
  END AS estado,
  p.referencia,
  p.comprobante_num,
  c.razon_social AS comunidad
FROM pago p
JOIN unidad u ON u.id = p.unidad_id
LEFT JOIN comunidad c ON c.id = u.comunidad_id
LEFT JOIN pago_aplicacion pa ON pa.pago_id = p.id
LEFT JOIN cuenta_cobro_unidad ccu ON ccu.id = pa.cuenta_cobro_unidad_id
LEFT JOIN emision_gastos_comunes eg ON eg.id = ccu.emision_id
WHERE EXISTS (
  SELECT 1 FROM titulares_unidad tu
  WHERE tu.persona_id = ? -- persona_id
    AND tu.unidad_id = p.unidad_id
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
)
GROUP BY p.id, p.fecha, p.monto, p.medio, p.referencia, p.estado, p.comprobante_num, u.codigo, c.razon_social, eg.periodo
ORDER BY p.fecha DESC;

--------------------------------------------------------------------------------
-- 6) ACTIVIDAD/AUDITORÍA de una persona (pestaña actividad en [id].tsx)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: fecha, titulo, descripcion

SELECT
  DATE(a.created_at) AS fecha,
  TIME(a.created_at) AS hora,
  CONCAT(DATE(a.created_at), ' ', TIME(a.created_at)) AS fecha_completa,
  -- Título legible de la acción
  CASE
    WHEN a.accion = 'login' THEN 'Inicio de sesión'
    WHEN a.accion = 'logout' THEN 'Cierre de sesión'
    WHEN a.accion = 'insert' THEN CONCAT('Creó registro en ', a.tabla)
    WHEN a.accion = 'update' THEN CONCAT('Actualizó registro en ', a.tabla)
    WHEN a.accion = 'delete' THEN CONCAT('Eliminó registro en ', a.tabla)
    ELSE CONCAT(a.accion, ' en ', a.tabla)
  END AS titulo,
  -- Descripción detallada
  CASE
    WHEN a.accion = 'login' THEN 'El usuario inició sesión en el sistema'
    WHEN a.accion = 'logout' THEN 'El usuario cerró sesión en el sistema'
    WHEN a.accion IN ('insert', 'update', 'delete') THEN
      CONCAT('Se realizó una operación de ', a.accion, ' en la tabla ', a.tabla,
             IF(a.registro_id IS NOT NULL, CONCAT(' (ID: ', a.registro_id, ')'), ''))
    ELSE CONCAT('Acción: ', a.accion, ' en tabla: ', a.tabla)
  END AS descripcion,
  a.ip_address,
  a.valores_anteriores,
  a.valores_nuevos
FROM auditoria a
WHERE a.usuario_id = (SELECT id FROM usuario WHERE persona_id = ?) -- persona_id
ORDER BY a.created_at DESC
LIMIT 100;

--------------------------------------------------------------------------------
-- 7) DOCUMENTOS asociados a una persona (pestaña documentos en [id].tsx)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: id, nombre, tipo, fecha, tamaño, icono

SELECT
  a.id,
  a.original_name AS nombre,
  a.filename,
  a.category AS tipo,
  DATE(a.uploaded_at) AS fecha,
  ROUND(a.file_size / 1024, 1) AS tamaño_kb,
  CASE
    WHEN a.file_size < 1024 THEN CONCAT(a.file_size, ' B')
    WHEN a.file_size < 1048576 THEN CONCAT(ROUND(a.file_size / 1024, 1), ' KB')
    ELSE CONCAT(ROUND(a.file_size / 1048576, 1), ' MB')
  END AS tamaño,
  -- Icono basado en mimetype
  CASE
    WHEN a.mimetype LIKE 'application/pdf' THEN 'picture_as_pdf'
    WHEN a.mimetype LIKE 'image/%' THEN 'image'
    WHEN a.mimetype LIKE 'application/msword' OR a.mimetype LIKE 'application/vnd.openxmlformats%' THEN 'description'
    ELSE 'insert_drive_file'
  END AS icono,
  a.description,
  CONCAT('/uploads/', a.filename) AS url,
  -- Subido por
  CONCAT(up.nombres, ' ', up.apellidos) AS subido_por
FROM archivos a
LEFT JOIN usuario uu ON uu.id = a.uploaded_by
LEFT JOIN persona up ON up.id = uu.persona_id
WHERE a.entity_type = 'personas' AND a.entity_id = ? -- persona_id
  AND a.is_active = 1
ORDER BY a.uploaded_at DESC;

--------------------------------------------------------------------------------
-- 8) NOTAS asociadas a una persona (pestaña notas en [id].tsx)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- NOTA: Esta consulta asume que existe una tabla 'notas' con campos:
-- id, persona_id, titulo, contenido, created_at, created_by, updated_at

-- Si no existe la tabla notas, crear con:
-- CREATE TABLE notas (
--   id BIGINT PRIMARY KEY AUTO_INCREMENT,
--   persona_id BIGINT NOT NULL,
--   titulo VARCHAR(255) NOT NULL,
--   contenido TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   created_by BIGINT,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   FOREIGN KEY (persona_id) REFERENCES persona(id),
--   FOREIGN KEY (created_by) REFERENCES usuario(id)
-- );

SELECT
  n.id,
  n.titulo,
  n.contenido,
  DATE(n.created_at) AS fecha,
  TIME(n.created_at) AS hora,
  CONCAT(up.nombres, ' ', up.apellidos) AS autor,
  DATE(n.updated_at) AS fecha_actualizacion
FROM notas n
LEFT JOIN usuario uu ON uu.id = n.created_by
LEFT JOIN persona up ON up.id = uu.persona_id
WHERE n.persona_id = ? -- persona_id
ORDER BY n.created_at DESC;

--------------------------------------------------------------------------------
-- 9) ROLES Y COMUNIDADES de una persona
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: información de roles asignados

SELECT
  ucr.id,
  c.razon_social AS comunidad_nombre,
  r.nombre AS rol_nombre,
  r.codigo AS rol_codigo,
  r.nivel_acceso,
  ucr.desde,
  ucr.hasta,
  ucr.activo
FROM usuario_comunidad_rol ucr
JOIN comunidad c ON c.id = ucr.comunidad_id
JOIN rol r ON r.id = ucr.rol_id
WHERE ucr.usuario_id = (SELECT id FROM usuario WHERE persona_id = ?) -- persona_id
ORDER BY ucr.activo DESC, r.nivel_acceso DESC, ucr.desde DESC;

--------------------------------------------------------------------------------
-- 10) RESUMEN FINANCIERO de una persona (saldos por comunidad)
--------------------------------------------------------------------------------
-- Parámetro: persona_id
-- Retorna: resumen de saldos pendientes y pagos por comunidad

SELECT
  c.razon_social AS comunidad,
  COUNT(DISTINCT u.id) AS unidades,
  COALESCE(SUM(ccu.saldo), 0) AS saldo_pendiente,
  COALESCE(SUM(CASE WHEN ccu.estado = 'pagado' THEN ccu.monto_total ELSE 0 END), 0) AS total_pagado,
  MAX(CASE WHEN p.fecha IS NOT NULL THEN DATE(p.fecha) END) AS ultimo_pago
FROM titulares_unidad tu
JOIN unidad u ON u.id = tu.unidad_id
JOIN comunidad c ON c.id = u.comunidad_id
LEFT JOIN cuenta_cobro_unidad ccu ON ccu.unidad_id = u.id
LEFT JOIN pago p ON p.unidad_id = u.id AND p.estado = 'aplicado'
WHERE tu.persona_id = ? -- persona_id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

--------------------------------------------------------------------------------
-- 11) BÚSQUEDA AVANZADA de personas (con filtros)
--------------------------------------------------------------------------------
-- Parámetros: search, tipo, estado, comunidad_id, limit, offset

SELECT
  p.id,
  p.rut AS dni,
  p.dv,
  p.nombres,
  p.apellidos,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  p.email,
  p.telefono,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_comunidad_rol ucr
      JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  CASE WHEN u.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  (SELECT COUNT(*) FROM titulares_unidad tu
   WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())) AS unidades,
  DATE(u.created_at) AS fechaRegistro
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE 1 = 1
  -- Filtro de búsqueda
  AND (? IS NULL OR CONCAT(p.nombres, ' ', p.apellidos) LIKE CONCAT('%', ?, '%')
       OR p.email LIKE CONCAT('%', ?, '%') OR p.rut LIKE CONCAT('%', ?, '%'))
  -- Filtro por tipo
  AND (? IS NULL OR (
    (? = 'Administrador' AND EXISTS (
      SELECT 1 FROM usuario_comunidad_rol ucr
      JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
    )) OR
    (? = 'Inquilino' AND EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    )) OR
    (? = 'Propietario' AND NOT EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) AND NOT EXISTS (
      SELECT 1 FROM usuario_comunidad_rol ucr
      JOIN rol r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo = 'admin' AND ucr.activo = 1
    ))
  ))
  -- Filtro por estado
  AND (? IS NULL OR u.activo = (? = 'Activo'))
  -- Filtro por comunidad
  AND (? IS NULL OR EXISTS (
    SELECT 1 FROM usuario_comunidad_rol ucr
    WHERE ucr.usuario_id = u.id AND ucr.comunidad_id = ? AND ucr.activo = 1
  ))
ORDER BY p.apellidos, p.nombres
LIMIT ? OFFSET ?; -- limit, offset

--------------------------------------------------------------------------------
-- 12) VALIDACIÓN de existencia (para crear/editar)
--------------------------------------------------------------------------------
-- Verificar si RUT ya existe (excluyendo el actual en edición)

SELECT COUNT(*) as existe FROM persona WHERE rut = ? AND id != ?; -- rut, exclude_id (0 para crear)