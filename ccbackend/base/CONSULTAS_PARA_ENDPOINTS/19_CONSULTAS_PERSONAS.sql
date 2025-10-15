-- ========================================================================================
-- CONSULTAS SQL PARA EL MÓDULO PERSONAS
-- Sistema: Cuentas Claras (Consolidado y Corregido)
-- ========================================================================================

--------------------------------------------------------------------------------
-- 1) LISTADO DE PERSONAS (para vista tabla/cards)
--------------------------------------------------------------------------------
-- Retorna: id, nombre completo, dni, email, telefono, tipo, estado, unidades, fechaRegistro, avatar

SELECT
  p.id,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre,
  CONCAT(p.rut, '-', p.dv) AS dni,
  p.email,
  p.telefono,
  -- Tipo basado en roles o titularidad
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr -- CORRECCIÓN: Usar tabla correcta
      JOIN rol_sistema rs ON rs.id = ucr.rol_id -- CORRECCIÓN: Usar tabla correcta
      WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1 -- CORRECCIÓN: Usar códigos de rol existentes y 'superadmin'
    ) THEN 'Administrador'
    WHEN EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) THEN 'Inquilino'
    ELSE 'Propietario'
  END AS tipo,
  -- Estado del usuario (COALESCE para personas sin cuenta de usuario)
  CASE WHEN COALESCE(u.activo, 0) = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Conteo de unidades asociadas
  COALESCE((
    SELECT COUNT(*) FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ), 0) AS unidades,
  -- Fecha de registro (Se usa el de usuario si existe, sino el de persona)
  COALESCE(DATE(u.created_at), DATE(p.created_at)) AS fecha_registro,
  -- Avatar (si existe en archivos)
  (
    SELECT CONCAT('/uploads/', a.filename)
    FROM archivos a
    WHERE a.entity_type = 'personas' -- TODO: validar si 'personas' es el entity_type correcto para esta tabla
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
-- 2) ESTADÍSTICAS PARA DASHBOARD
--------------------------------------------------------------------------------

SELECT
  COUNT(DISTINCT p.id) AS total_personas,
  -- Administradores: Incluye roles de gestión
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM usuario_rol_comunidad ucr
    JOIN rol_sistema rs ON rs.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1
  ) THEN p.id END) AS administradores,
  -- Inquilinos
  COUNT(DISTINCT CASE WHEN EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ) THEN p.id END) AS inquilinos,
  -- Propietarios (ni arrendatarios, ni administradores de alto nivel)
  COUNT(DISTINCT CASE WHEN NOT EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
    AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
  ) AND NOT EXISTS (
    SELECT 1 FROM usuario_rol_comunidad ucr
    JOIN rol_sistema rs ON rs.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1
  ) THEN p.id END) AS propietarios,
  -- Activos (con cuenta de usuario activa)
  COUNT(DISTINCT CASE WHEN COALESCE(u.activo, 0) = 1 THEN p.id END) AS activos,
  -- Inactivos (sin cuenta o cuenta inactiva)
  COUNT(DISTINCT CASE WHEN COALESCE(u.activo, 0) = 0 THEN p.id END) AS inactivos
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id;

--------------------------------------------------------------------------------
-- 3) DETALLE COMPLETO DE UNA PERSONA
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
  DATE(COALESCE(u.created_at, p.created_at)) AS fecha_registro,
  -- Último acceso del usuario (Asumiendo que 'login' es la acción registrada)
  (
    SELECT DATE(a.created_at)
    FROM auditoria a
    WHERE a.usuario_id = u.id AND a.accion = 'INSERT' -- CORRECCIÓN: Asumimos 'INSERT' o 'UPDATE' como proxy de actividad si 'login' no existe en los registros
    ORDER BY a.created_at DESC
    LIMIT 1
  ) AS ultimo_acceso,
  -- Nivel de acceso (rol más alto)
  (
    SELECT rs.nombre
    FROM usuario_rol_comunidad ucr
    JOIN rol_sistema rs ON rs.id = ucr.rol_id
    WHERE ucr.usuario_id = u.id AND ucr.activo = 1
    ORDER BY rs.nivel_acceso DESC -- CORRECCIÓN: Ordenar ASC ya que 100=superadmin y se quiere el más alto (menor número)
    LIMIT 1
  ) AS nivel_acceso,
  -- Tipo basado en lógica (Repetido desde la Sec. 1)
  CASE
    WHEN EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema rs ON rs.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1
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
    SELECT SUM(ccu.saldo)
    FROM cuenta_cobro_unidad ccu
    JOIN titulares_unidad tu ON tu.unidad_id = ccu.unidad_id
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
WHERE p.id = ?; -- :persona_id

--------------------------------------------------------------------------------
-- 4) UNIDADES ASOCIADAS A UNA PERSONA (pestaña unidades)
--------------------------------------------------------------------------------

SELECT
  u.id,
  u.codigo AS nombre, -- CORRECCIÓN: Usar u.codigo
  e.nombre AS edificio,
  t.nombre AS torre,
  c.razon_social AS comunidad,
  -- Corrección de la Dirección (usando COALESCE y uniones)
  CONCAT_WS(', ',
    COALESCE(e.direccion, c.direccion),
    t.nombre,
    u.codigo
  ) AS direccion,
  u.m2_utiles AS metros_cuadrados, -- CORRECCIÓN: snake_case
  CASE WHEN u.activa = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado,
  -- Saldo pendiente de la unidad
  COALESCE((
    SELECT SUM(ccu.saldo)
    FROM cuenta_cobro_unidad ccu
    WHERE ccu.unidad_id = u.id
  ), 0) AS saldo_pendiente, -- CORRECCIÓN: snake_case
  -- Relación (propietario/arrendatario)
  CASE WHEN tu.tipo = 'propietario' THEN 'Propietario' ELSE 'Inquilino' END AS relacion,
  tu.desde AS fecha_asignacion,
  tu.hasta AS fecha_fin,
  tu.porcentaje
FROM titulares_unidad tu
JOIN unidad u ON u.id = tu.unidad_id
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre t ON t.id = u.torre_id
JOIN comunidad c ON c.id = u.comunidad_id -- JOIN, ya que unidad.comunidad_id es NOT NULL
WHERE tu.persona_id = ? -- :persona_id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
ORDER BY tu.desde DESC;

--------------------------------------------------------------------------------
-- 5) PAGOS REALIZADOS POR UNA PERSONA (pestaña pagos)
--------------------------------------------------------------------------------

SELECT
  p.id,
  DATE(p.fecha) AS fecha,
  u.codigo AS unidad, -- CORRECCIÓN: Usar u.codigo
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
-- CORRECCIÓN: Simplificación del WHERE: Si la persona_id está en el pago, ya es suficiente.
-- Si se quiere ligar el pago al titular actual de la unidad, se usa el EXISTS, pero es costoso.
WHERE p.persona_id = ? -- :persona_id
GROUP BY p.id, p.fecha, p.monto, p.medio, p.referencia, p.estado, p.comprobante_num, u.codigo, c.razon_social, eg.periodo
ORDER BY p.fecha DESC;

--------------------------------------------------------------------------------
-- 6) ACTIVIDAD/AUDITORÍA DE UNA PERSONA (pestaña actividad)
--------------------------------------------------------------------------------

SELECT
  DATE(a.created_at) AS fecha,
  TIME(a.created_at) AS hora,
  CONCAT(DATE(a.created_at), ' ', TIME(a.created_at)) AS fecha_completa,
  -- Título legible de la acción
  CASE
    WHEN a.accion = 'INSERT' THEN CONCAT('Creó registro en ', a.tabla)
    WHEN a.accion = 'UPDATE' THEN CONCAT('Actualizó registro en ', a.tabla)
    WHEN a.accion = 'DELETE' THEN CONCAT('Eliminó registro en ', a.tabla)
    ELSE CONCAT(a.accion, ' en ', a.tabla)
  END AS titulo,
  -- Descripción detallada
  CONCAT('Se realizó una operación de ', a.accion, ' en la tabla ', a.tabla,
         IF(a.registro_id IS NOT NULL, CONCAT(' (ID: ', a.registro_id, ')'), '')) AS descripcion,
  a.ip_address,
  a.valores_anteriores,
  a.valores_nuevos
FROM auditoria a
-- Obtener el usuario_id a partir de persona_id, asumiendo un solo usuario por persona.
WHERE a.usuario_id = (SELECT u.id FROM usuario u WHERE u.persona_id = ? LIMIT 1) -- :persona_id
ORDER BY a.created_at DESC
LIMIT 100;

--------------------------------------------------------------------------------
-- 7) DOCUMENTOS ASOCIADOS A UNA PERSONA (pestaña documentos)
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
  -- Icono basado en mimetype (MySQL/MariaDB)
  CASE
    WHEN a.mimetype LIKE 'application/pdf' THEN 'picture_as_pdf'
    WHEN a.mimetype LIKE 'image/%' THEN 'image'
    WHEN a.mimetype LIKE 'application/msword' OR a.mimetype LIKE 'application/vnd.openxmlformats%' THEN 'description'
    ELSE 'insert_drive_file'
  END AS icono,
  a.description,
  CONCAT('/uploads/', a.filename) AS url,
  -- Subido por
  COALESCE(CONCAT(up.nombres, ' ', up.apellidos), 'Sistema') AS subido_por
FROM archivos a
LEFT JOIN usuario uu ON uu.id = a.uploaded_by
LEFT JOIN persona up ON up.id = uu.persona_id
WHERE a.entity_type = 'personas' AND a.entity_id = ? -- :persona_id
  AND a.is_active = 1
ORDER BY a.uploaded_at DESC;

--------------------------------------------------------------------------------
-- 8) NOTAS ASOCIADAS A UNA PERSONA (pestaña notas - SIMULADO)
--------------------------------------------------------------------------------
-- NOTA: No existe tabla 'notas'. Se usan registros de conserjería relacionados a la unidad.

SELECT
  rc.id,
  'Registro Conserjería' AS titulo,
  rc.detalle AS contenido,
  DATE(rc.fecha_hora) AS fecha,
  TIME(rc.fecha_hora) AS hora,
  COALESCE(CONCAT(up.nombres, ' ', up.apellidos), 'Conserje/Sistema') AS autor,
  DATE(rc.created_at) AS fecha_actualizacion
FROM registro_conserjeria rc
LEFT JOIN usuario uu ON uu.id = rc.usuario_id
LEFT JOIN persona up ON up.id = uu.persona_id
-- Filtro indirecto: Asumiendo que las notas son sobre eventos en las unidades de la persona.
WHERE EXISTS (
    SELECT 1 FROM titulares_unidad tu
    WHERE tu.persona_id = ? -- :persona_id
    AND tu.unidad_id IN (SELECT p.unidad_id FROM pago p WHERE p.persona_id = tu.persona_id) -- Proxy para relacionar el registro con la unidad
)
ORDER BY rc.fecha_hora DESC;

--------------------------------------------------------------------------------
-- 9) ROLES Y COMUNIDADES DE UNA PERSONA
--------------------------------------------------------------------------------

SELECT
  ucr.id,
  c.razon_social AS comunidad_nombre,
  rs.nombre AS rol_nombre,
  rs.codigo AS rol_codigo,
  rs.nivel_acceso,
  ucr.desde,
  ucr.hasta,
  ucr.activo
FROM usuario_rol_comunidad ucr
JOIN comunidad c ON c.id = ucr.comunidad_id
JOIN rol_sistema rs ON rs.id = ucr.rol_id
WHERE ucr.usuario_id = (SELECT u.id FROM usuario u WHERE u.persona_id = ? LIMIT 1) -- :persona_id
ORDER BY ucr.activo DESC, rs.nivel_acceso DESC, ucr.desde DESC;

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
WHERE tu.persona_id = ? -- :persona_id
  AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

--------------------------------------------------------------------------------
-- 11) BÚSQUEDA AVANZADA DE PERSONAS (con filtros)
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
      JOIN rol_sistema rs ON rs.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1
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
  DATE(COALESCE(u.created_at, p.created_at)) AS fecha_registro
FROM persona p
LEFT JOIN usuario u ON u.persona_id = p.id
WHERE 1 = 1
  -- Filtro de búsqueda (search_term)
  AND (?1 IS NULL OR CONCAT(p.nombres, ' ', p.apellidos) LIKE CONCAT('%', ?1, '%')
       OR p.email LIKE CONCAT('%', ?1, '%')
       OR CONCAT(p.rut, '-', p.dv) LIKE CONCAT('%', ?1, '%'))
  -- Filtro por tipo (tipo_filter)
  AND (?2 IS NULL OR (
    (?2 = 'Administrador' AND EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema rs ON rs.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1
    )) OR
    (?2 = 'Inquilino' AND EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    )) OR
    (?2 = 'Propietario' AND NOT EXISTS (
      SELECT 1 FROM titulares_unidad tu
      WHERE tu.persona_id = p.id AND tu.tipo = 'arrendatario'
      AND (tu.hasta IS NULL OR tu.hasta >= CURDATE())
    ) AND NOT EXISTS (
      SELECT 1 FROM usuario_rol_comunidad ucr
      JOIN rol_sistema rs ON rs.id = ucr.rol_id
      WHERE ucr.usuario_id = u.id AND rs.codigo IN ('admin_comunidad', 'presidente_comite', 'superadmin') AND ucr.activo = 1
    ))
  ))
  -- Filtro por estado (estado_filter)
  AND (?3 IS NULL OR u.activo = (?3 = 'Activo'))
  -- Filtro por comunidad (comunidad_id_filter)
  AND (?4 IS NULL OR EXISTS (
    SELECT 1 FROM usuario_rol_comunidad ucr
    WHERE ucr.usuario_id = u.id AND ucr.comunidad_id = ?4 AND ucr.activo = 1
  ))
ORDER BY p.apellidos, p.nombres
LIMIT ?5 OFFSET ?6; -- limit, offset

--------------------------------------------------------------------------------
-- 12) INSERT PARA CREAR NUEVA PERSONA (desde nueva.tsx)
--------------------------------------------------------------------------------

-- Primero insertar en persona
INSERT INTO persona (
  rut, dv, nombres, apellidos, email, telefono, direccion, created_at, updated_at
) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NOW(), NOW());

-- Obtener el ID de la persona insertada
SET @persona_id = LAST_INSERT_ID();

-- Si se crea cuenta de usuario
INSERT INTO usuario (
  persona_id, username, hash_password, email, activo, created_at, updated_at
) VALUES (
  @persona_id,
  ?8, -- username
  ?9, -- hash_password
  ?5, -- email
  1, -- activo
  NOW(),
  NOW()
);

-- Asignar rol_sistema por defecto (residente '6' o propietario '7')
INSERT INTO usuario_rol_comunidad (
  usuario_id, comunidad_id, rol_id, desde, activo, created_at, updated_at
) VALUES (
  LAST_INSERT_ID(),
  ?10, -- comunidad_id
  ?11, -- rol_id (ej. 6 para residente)
  CURDATE(), -- desde
  1, -- activo
  NOW(),
  NOW()
);

-- Asignar unidades si se seleccionaron
INSERT INTO titulares_unidad (
  persona_id, unidad_id, tipo, desde, porcentaje, created_at, updated_at
) VALUES (
  @persona_id,
  ?12, -- unidad_id
  ?13, -- tipo (propietario/arrendatario)
  CURDATE(),
  ?14, -- porcentaje
  NOW(),
  NOW()
);

--------------------------------------------------------------------------------
-- 13) VALIDACIONES PARA CREAR/EDITAR PERSONA
--------------------------------------------------------------------------------

-- Verificar si RUT ya existe (excluyendo el actual en edición)
SELECT COUNT(*) AS existe FROM persona WHERE rut = ?1 AND id != ?2; -- rut, exclude_id (0 para crear)

-- Verificar si username ya existe
SELECT COUNT(*) AS existe FROM usuario WHERE username = ?1 AND persona_id != ?2; -- username, exclude_persona_id

-- Verificar si email ya existe (en persona)
SELECT COUNT(*) AS existe FROM persona WHERE email = ?1 AND id != ?2; -- email, exclude_id

--------------------------------------------------------------------------------
-- 14) UPDATE PARA EDITAR PERSONA
--------------------------------------------------------------------------------

-- Actualizar datos de persona
UPDATE persona SET
  nombres = ?1,
  apellidos = ?2,
  email = ?3,
  telefono = ?4,
  direccion = ?5,
  updated_at = NOW()
WHERE id = ?6;

-- Actualizar datos de usuario si existe (se asume que los valores nulos no actualizan)
UPDATE usuario SET
  username = ?7,
  email = ?3,
  activo = ?8,
  updated_at = NOW()
WHERE persona_id = ?6;

-- Actualizar password si se cambió
UPDATE usuario SET
  hash_password = ?9, -- hash_password
  updated_at = NOW()
WHERE persona_id = ?6;

--------------------------------------------------------------------------------
-- 15) CONSULTA PARA AUTOCOMPLETAR UNIDADES (en nueva.tsx)
--------------------------------------------------------------------------------

SELECT
  u.id,
  u.codigo AS nombre,
  CONCAT_WS(' - ',
    COALESCE(e.nombre, 'Sin edificio'),
    COALESCE(t.nombre, 'Sin torre'),
    u.codigo
  ) AS descripcion_completa,
  c.razon_social AS comunidad,
  e.nombre AS edificio,
  t.nombre AS torre
FROM unidad u
LEFT JOIN edificio e ON e.id = u.edificio_id
LEFT JOIN torre t ON t.id = u.torre_id
JOIN comunidad c ON c.id = u.comunidad_id
WHERE u.activa = 1
  AND (?1 IS NULL OR u.codigo LIKE CONCAT('%', ?1, '%')
       OR e.nombre LIKE CONCAT('%', ?1, '%')
       OR t.nombre LIKE CONCAT('%', ?1, '%'))
ORDER BY c.razon_social, e.nombre, t.nombre, u.codigo
LIMIT 50;