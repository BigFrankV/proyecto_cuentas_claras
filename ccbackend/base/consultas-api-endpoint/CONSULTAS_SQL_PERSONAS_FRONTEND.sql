-- CONSULTAS SQL PARA MÓDULO PERSONAS
-- Basado en análisis del frontend (personas.tsx, nueva.tsx, [id].tsx)
-- y esquema de base de datos (SECCION_02_USUARIOS.md)
-- Fecha: Octubre 2025

--------------------------------------------------------------------------------
-- 1) LISTADO DE PERSONAS (para personas.tsx - vista tabla/cards)
--------------------------------------------------------------------------------

SELECT
  p.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  CONCAT(p.rut, '-', p.dv) AS dni,
  p.email,
  p.telefono,
  -- Tipo basado en roles o titularidad
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  -- Estado del usuario
  CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Conteo de unidades asociadas
  COALESCE((
    SELECT COUNT(*) FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ), 0) AS unidades,
  -- Fecha de registro
  COALESCE(DATE(u.created_at), DATE(p.created_at)) AS fechaRegistro,
  -- Avatar (si existe en archivos)
  (
    SELECT CONCAT('/uploads/', a.filename)
    FROM archivos a
    WHERE a.entity_type = 'personas'
      AND a.entity_id = p.id
      AND a.category = 'avatar'
      AND a.is_active = 1
    ORDER BY a.uploaded_at DESC
    LIMIT 1
  ) AS avatar
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
ORDER BY p.apellidos, p.nombres;

--------------------------------------------------------------------------------
-- 2) ESTADÍSTICAS PARA DASHBOARD (PersonStats component)
--------------------------------------------------------------------------------

SELECT
  COUNT(DISTINCT p.id) AS total_personas,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM usuario_rol_comunidad ucr
    JOIN rol_sistema r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
  ) THEN p.id END) AS administradores,
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ) THEN p.id END) AS inquilinos,
  COUNT(DISTINCT CASE WHEN NOT EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ) AND NOT EXISTS (
    SELECT 1 FROM usuario_rol_comunidad ucr
    JOIN rol_sistema r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
  ) THEN p.id END) AS propietarios,
  COUNT(DISTINCT CASE WHEN COALESCE(u.activo, 0) = 1 THEN p.id END) AS activos,
  COUNT(DISTINCT CASE WHEN COALESCE(u.activo, 0) = 0 OR u.activo IS NULL THEN p.id END) AS inactivos
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id;

--------------------------------------------------------------------------------
-- 3) DETALLE COMPLETO DE UNA PERSONA (para [id].tsx)
--------------------------------------------------------------------------------

SELECT
  p.id,
  p.rut,
  p.dv,
  CONCAT(p.rut, '-', p.dv) AS dni_completo,
  p.nombres,
  p.apellidos,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  p.email,
  p.telefono,
  p.direccion,
  u.username,
  COALESCE(u.activo, 0) AS usuario_activo,
  DATE(COALESCE(u.created_at, p.created_at)) AS fechaRegistro,
  -- Último acceso del usuario
  (
    SELECT DATE(a.created_at)
    FROM auditoria a
    WHERE a.usuario_id = u.id AND a.accion = 'login'
    ORDER BY a.created_at DESC
    LIMIT 1
  ) AS ultimoAcceso,
  -- Nivel de acceso (rol más alto)
  (
    SELECT r.nombre
    FROM usuario_rol_comunidad ucr
    JOIN rol_sistema r ON r.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND ucr.activo = 1
    ORDER BY r.nivel_acceso DESC
    LIMIT 1
  ) AS nivelAcceso,
  -- Tipo basado en lógica
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  -- Estado
  CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Estadísticas
  COALESCE((
    SELECT COUNT(*) FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ), 0) AS total_unidades,
  COALESCE((
    SELECT SUM(cu.saldo)
    FROM cuenta_cobro_unidad cu
    JOIN titulares_unidad tu ON tu.unidad_id = cu.unidad_id
    WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ), 0) AS saldo_total,
  -- Avatar
  (
    SELECT CONCAT('/uploads/', a.filename)
    FROM archivos a
    WHERE a.entity_type = 'personas'
      AND a.entity_id = p.id
      AND a.category = 'avatar'
      AND a.is_active = 1
    ORDER BY a.uploaded_at DESC
    LIMIT 1
  ) AS avatar
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE p.id = 1; -- persona_id

--------------------------------------------------------------------------------
-- 4) UNIDADES ASOCIADAS A UNA PERSONA (pestaña unidades en [id].tsx)
--------------------------------------------------------------------------------

SELECT
  u.id,
  u.codigo AS nombre,
  e.nombre AS edificio,
  t.nombre AS torre,
  c.razon_social AS comunidad,
  CONCAT(
    COALESCE(e.direccion, ''),
    CASE WHEN e.direccion IS NOT NULL AND (t.nombre IS NOT NULL OR u.codigo IS NOT NULL) THEN ', ' ELSE '' END,
    COALESCE(t.nombre, ''),
    CASE WHEN t.nombre IS NOT NULL AND u.codigo IS NOT NULL THEN ', ' ELSE '' END,
    COALESCE(u.codigo, '')
  ) AS direccion,
  u.m2_utiles AS metrosCuadrados,
  CASE WHEN u.activa = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Saldo pendiente de la unidad
  COALESCE((
    SELECT SUM(cu.saldo)
    FROM cuenta_cobro_unidad cu
    WHERE cu.unidad_id = u.id
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
WHERE tu.persona_id = 1 -- persona_id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
ORDER BY tu.desde DESC;

--------------------------------------------------------------------------------
-- 5) PAGOS REALIZADOS POR UNA PERSONA (pestaña pagos en [id].tsx)
--------------------------------------------------------------------------------

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
  WHERE tu.persona_id = 1 -- persona_id
    AND tu.unidad_id = p.unidad_id
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
)
GROUP BY p.id, p.fecha, p.monto, p.medio, p.referencia, p.estado, p.comprobante_num, u.codigo, c.razon_social, eg.periodo
ORDER BY p.fecha DESC;

--------------------------------------------------------------------------------
-- 6) ACTIVIDAD/AUDITORÍA DE UNA PERSONA (pestaña actividad en [id].tsx)
--------------------------------------------------------------------------------

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
WHERE a.usuario_id = (SELECT id FROM usuario WHERE persona_id = 1) -- persona_id
ORDER BY a.created_at DESC
LIMIT 100;

--------------------------------------------------------------------------------
-- 7) DOCUMENTOS ASOCIADOS A UNA PERSONA (pestaña documentos en [id].tsx)
--------------------------------------------------------------------------------

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
WHERE a.entity_type = 'personas'
  AND a.entity_id = 10 -- persona_id
  AND a.is_active = 1
ORDER BY a.uploaded_at DESC;

--------------------------------------------------------------------------------
-- 8) NOTAS ASOCIADAS A UNA PERSONA (pestaña notas en [id].tsx)
--------------------------------------------------------------------------------
-- NOTA: No existe tabla 'notas' ni 'notificacion_usuario'
-- Usaremos 'registro_conserjeria' para notas del conserje y 'auditoria' para actividad del sistema
-- Si se necesita una tabla específica de notas, crear:
-- CREATE TABLE notas_persona (
--   id BIGINT PRIMARY KEY AUTO_INCREMENT,
--   persona_id BIGINT NOT NULL,
--   titulo VARCHAR(255) NOT NULL,
--   contenido TEXT,
--   tipo ENUM('nota','recordatorio','observacion') DEFAULT 'nota',
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   created_by BIGINT,
--   FOREIGN KEY (persona_id) REFERENCES persona(id),
--   FOREIGN KEY (created_by) REFERENCES usuario(id)
-- );

-- Opción 1: Usar registro_conserjeria (notas del conserje sobre la persona)
SELECT
  rc.id,
  'Registro Conserjería' AS titulo,
  rc.detalle AS contenido,
  DATE(rc.fecha_hora) AS fecha,
  TIME(rc.fecha_hora) AS hora,
  CONCAT(up.nombres, ' ', up.apellidos) AS autor,
  DATE(rc.created_at) AS fecha_actualizacion
FROM registro_conserjeria rc
LEFT JOIN usuario uu ON uu.id = rc.usuario_id
LEFT JOIN persona up ON up.id = uu.persona_id
WHERE rc.evento LIKE '%nota%' OR rc.evento LIKE '%observacion%'
ORDER BY rc.fecha_hora DESC;

-- Opción 2: Usar auditoria para actividad relacionada con la persona
SELECT
  a.id,
  CONCAT('Actividad: ', a.accion) AS titulo,
  COALESCE(a.valores_anteriores, 'Sin detalles') AS contenido,
  DATE(a.created_at) AS fecha,
  TIME(a.created_at) AS hora,
  CONCAT(up.nombres, ' ', up.apellidos) AS autor,
  DATE(a.created_at) AS fecha_actualizacion
FROM auditoria a
LEFT JOIN usuario uu ON uu.id = a.usuario_id
LEFT JOIN persona up ON up.id = uu.persona_id
WHERE a.tabla = 'persona' AND a.registro_id = ? -- persona_id
ORDER BY a.created_at DESC;

--------------------------------------------------------------------------------
-- 9) ROLES Y COMUNIDADES DE UNA PERSONA
--------------------------------------------------------------------------------

SELECT
  ucr.id,
  c.razon_social AS comunidad_nombre,
  r.nombre AS rol_nombre,
  r.codigo AS rol_codigo,
  r.nivel_acceso,
  ucr.desde,
  ucr.hasta,
  ucr.activo
FROM usuario_rol_comunidad ucr
JOIN comunidad c ON c.id = ucr.comunidad_id
JOIN rol_sistema r ON r.id = ucr.rol_id
WHERE ucr.usuario_id = (SELECT id FROM usuario WHERE persona_id = 1) -- persona_id
ORDER BY ucr.activo DESC, r.nivel_acceso DESC, ucr.desde DESC;

--------------------------------------------------------------------------------
-- 10) RESUMEN FINANCIERO DE UNA PERSONA (saldos por comunidad)
--------------------------------------------------------------------------------

SELECT
  c.razon_social AS comunidad,
  COUNT(DISTINCT u.id) AS unidades,
  COALESCE(SUM(cu.saldo), 0) AS saldo_pendiente,
  COALESCE(SUM(CASE WHEN cu.estado = 'pagado' THEN cu.monto_total ELSE 0 END), 0) AS total_pagado,
  MAX(CASE WHEN p.fecha IS NOT NULL THEN DATE(p.fecha) END) AS ultimo_pago
FROM titulares_unidad tu
JOIN unidad u ON u.id = tu.unidad_id
JOIN comunidad c ON c.id = u.comunidad_id
LEFT JOIN cuenta_cobro_unidad cu ON cu.unidad_id = u.id
LEFT JOIN pago p ON p.unidad_id = u.id AND p.estado = 'aplicado'
WHERE tu.persona_id = 1 -- persona_id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

--------------------------------------------------------------------------------
-- 11) BÚSQUEDA AVANZADA DE PERSONAS (con filtros para PersonaFilters)
--------------------------------------------------------------------------------

SELECT
  p.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  CONCAT(p.rut, '-', p.dv) AS dni,
  p.email,
  p.telefono,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  COALESCE((
    SELECT COUNT(*) FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ), 0) AS unidades,
  DATE(COALESCE(u.created_at, p.created_at)) AS fechaRegistro
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE 1 = 1
  -- Filtro de búsqueda (searchTerm)
  AND (1 IS NULL OR CONCAT(p.nombres, ' ', p.apellidos) LIKE CONCAT('%', 1, '%')
       OR p.email LIKE CONCAT('%', 1, '%')
       OR CONCAT(p.rut, '-', p.dv) LIKE CONCAT('%', 1, '%'))
  -- Filtro por tipo (tipoFilter)
  AND (1 IS NULL OR (
    (? = 'Administrador' AND EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
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
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema r ON r.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND r.codigo IN ('admin', 'superadmin') AND ucr.activo = 1
    ))
  ))
  -- Filtro por estado (estadoFilter)
  AND (1 IS NULL OR u.activo = (? = 'Activo'))
ORDER BY p.apellidos, p.nombres
LIMIT 1 OFFSET 10; -- limit, offset

--------------------------------------------------------------------------------
-- 12) INSERT PARA CREAR NUEVA PERSONA (desde nueva.tsx)
--------------------------------------------------------------------------------

-- Primero insertar en persona
INSERT INTO persona (
  rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW());

-- Obtener el ID de la persona insertada
SET @persona_id = LAST_INSERT_ID();

-- Si se crea cuenta de usuario
INSERT INTO usuario (
  persona_id, username, hash_password, email, activo, created_at, updated_at
) VALUES (
  @persona_id,
  ?,
  ?, -- hash de password
  ?,
  1,
  NOW(),
  NOW()
);

-- Asignar rol_sistema por defecto (usuario estándar)
INSERT INTO usuario_rol_comunidad (
  usuario_id, comunidad_id, rol_id, desde, activo, created_at, updated_at
) VALUES (
  LAST_INSERT_ID(),
  ?, -- comunidad_id
  (SELECT id FROM rol_sistema WHERE codigo = 'usuario_estandar'),
  CURDATE(),
  1,
  NOW(),
  NOW()
);

-- Asignar unidades si se seleccionaron
INSERT INTO titulares_unidad (
  persona_id, unidad_id, tipo, desde, porcentaje, created_at, updated_at
) VALUES (?, ?, ?, CURDATE(), ?, NOW(), NOW());

--------------------------------------------------------------------------------
-- 13) VALIDACIONES PARA CREAR/EDITAR PERSONA
--------------------------------------------------------------------------------

-- Verificar si RUT ya existe (excluyendo el actual en edición)
SELECT COUNT(*) as existe FROM persona WHERE rut = ? AND id != ?; -- rut, exclude_id (0 para crear)

-- Verificar si username ya existe
SELECT COUNT(*) as existe FROM usuario WHERE username = ? AND persona_id != ?; -- username, exclude_persona_id

-- Verificar si email ya existe
SELECT COUNT(*) as existe FROM persona WHERE email = ? AND id != ?; -- email, exclude_id

--------------------------------------------------------------------------------
-- 14) UPDATE PARA EDITAR PERSONA
--------------------------------------------------------------------------------

-- Actualizar datos de persona
UPDATE persona SET
  nombres = ?,
  apellidos = ?,
  email = ?,
  telefono = ?,
  direccion = ?,
  updated_at = NOW()
WHERE id = ?;

-- Actualizar datos de usuario si existe
UPDATE usuario SET
  username = ?,
  email = ?,
  activo = ?,
  updated_at = NOW()
WHERE persona_id = ?;

-- Actualizar password si se cambió
UPDATE usuario SET
  hash_password = ?,
  updated_at = NOW()
WHERE persona_id = ?;

--------------------------------------------------------------------------------
-- 15) CONSULTA PARA AUTOCOMPLETAR UNIDADES (en nueva.tsx)
--------------------------------------------------------------------------------

SELECT
  u.id,
  u.codigo AS nombre,
  CONCAT(
    COALESCE(e.nombre, 'Sin edificio'),
    ' - ',
    COALESCE(t.nombre, 'Sin torre'),
    ' - ',
    u.codigo
  ) AS descripcion_completa,
  c.razon_social AS comunidad,
  e.nombre AS edificio,
  t.nombre AS torre
FROM unidad u
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre t ON t.id = u.torre_id
LEFT JOIN comunidad c ON c.id = u.comunidad_id
WHERE u.activa = 1
  AND (? IS NULL OR u.codigo LIKE CONCAT('%', ?, '%')
       OR e.nombre LIKE CONCAT('%', ?, '%')
       OR t.nombre LIKE CONCAT('%', ?, '%'))
ORDER BY c.razon_social, e.nombre, t.nombre, u.codigo
LIMIT 50;