-- CONSULTAS_SQL_GASTOS_CORREGIDAS.sql
--
-- Consultas SQL corregidas para el Módulo de Gastos basadas en la estructura de la base de datos 'cuentasclaras'.
-- Se incluyen datos de prueba para ejecutar las consultas.

-- =================================================================================
-- ⚠️ INSTRUCCIONES DE PRUEBA
-- Las consultas están parametrizadas con variables (@nombreVariable).
-- Para probar, reemplace las variables por un valor de la sección de PRUEBA.
-- Ejemplo: SET @comunidadId = 1;
-- =================================================================================

-- =================================================================================
-- 🧪 PARÁMETROS DE PRUEBA (REEMPLAZAR EN CONSULTAS)
-- =================================================================================

SET @comunidadId = 1;          -- Condominio Central Providencia
SET @gastoId = 1;              -- Gasto Aseo Comunal (C1)
SET @usuarioId = 1;            -- Patricio Quintanilla (Propietario/Superadmin)
SET @rolId = 7;                -- Rol: Propietario (rol_sistema.id)
SET @estado = 'pendiente';     -- Estado de gasto a filtrar
SET @categoriaId = 1;          -- Categoría: Gasto Común Operacional
SET @fechaDesde = '2025-09-01';
SET @fechaHasta = '2025-09-30';
SET @montoMin = 100000.00;
SET @montoMax = 200000.00;
SET @proveedorId = 1;          -- Proveedor: Aseo Brillante Ltda.
SET @centroCostoId = 1;        -- Centro de Costo: Aseo y Limpieza
SET @extraordinario = 0;       -- Gasto no extraordinario
SET @search = 'Aseo';          -- Término de búsqueda
SET @orderBy = 'monto_desc';   -- Orden de los resultados
SET @limit = 10;
SET @offset = 0;
SET @emisionId = 1;            -- Emisión de Gastos Comunes ID
SET @periodo = '2025-10';      -- Periodo para buscar gastos (AAAA-MM)

-- =================================================================================
-- 1. LISTADO DE GASTOS
-- =================================================================================

-- 1.1. Listar Todos los Gastos con Filtros y Paginación (CORREGIDA: JOIN a persona para nombres)
SELECT 
    g.id,
    g.numero,
    g.glosa as description,
    g.fecha as date,
    g.monto as amount,
    g.estado as status,
    g.extraordinario,
    -- Categoría
    cg.nombre as category,
    cg.tipo as categoryType,
    -- Proveedor
    p.razon_social as provider,
    p.rut as providerRut,
    p.email as providerEmail,
    -- Centro de Costo
    cc.nombre as costCenter,
    cc.codigo as costCenterCode,
    -- Documento de Compra
    dc.tipo_doc as documentType,
    dc.folio as documentNumber,
    dc.fecha_emision as documentDate,
    dc.total as documentTotal,
    -- Usuario Creador
    p_creador.nombres as creatorFirstName, -- ⬅️ Corregido: Uso de la tabla persona
    p_creador.apellidos as creatorLastName, -- ⬅️ Corregido: Uso de la tabla persona
    -- Usuario Aprobador
    p_aprobador.nombres as approverFirstName, -- ⬅️ Corregido: Uso de la tabla persona
    p_aprobador.apellidos as approverLastName, -- ⬅️ Corregido: Uso de la tabla persona
    -- Aprobaciones
    g.required_aprobaciones as requiredApprovals,
    g.aprobaciones_count as currentApprovals,
    -- Archivos adjuntos
    (SELECT COUNT(*) 
     FROM archivos a 
     WHERE a.entity_type = 'gasto' 
     AND a.entity_id = g.id 
     AND a.is_active = 1) as attachmentCount,
    -- Fechas
    g.created_at as createdAt,
    g.updated_at as updatedAt,
    g.fecha_anulacion as cancelledAt,
    -- Comunidad
    com.razon_social as communityName
FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN comunidad com ON g.comunidad_id = com.id
LEFT JOIN usuario u_creador ON g.creado_por = u_creador.id
LEFT JOIN persona p_creador ON u_creador.persona_id = p_creador.id -- ⬅️ Nuevo JOIN
LEFT JOIN usuario u_aprobador ON g.aprobado_por = u_aprobador.id
LEFT JOIN persona p_aprobador ON u_aprobador.persona_id = p_aprobador.id -- ⬅️ Nuevo JOIN

WHERE 1=1
    AND (@comunidadId IS NULL OR g.comunidad_id = @comunidadId)
    AND (@estado IS NULL OR g.estado = @estado)
    AND (@categoriaId IS NULL OR g.categoria_id = @categoriaId)
    AND (@fechaDesde IS NULL OR g.fecha >= @fechaDesde)
    AND (@fechaHasta IS NULL OR g.fecha <= @fechaHasta)
    AND (@montoMin IS NULL OR g.monto >= @montoMin)
    AND (@montoMax IS NULL OR g.monto <= @montoMax)
    AND (@proveedorId IS NULL OR dc.proveedor_id = @proveedorId)
    AND (@centroCostoId IS NULL OR g.centro_costo_id = @centroCostoId)
    AND (@extraordinario IS NULL OR g.extraordinario = @extraordinario)
    AND (@search IS NULL OR (
        g.glosa LIKE CONCAT('%', @search, '%') OR
        g.numero LIKE CONCAT('%', @search, '%') OR
        cg.nombre LIKE CONCAT('%', @search, '%') OR
        p.razon_social LIKE CONCAT('%', @search, '%')
    ))

ORDER BY 
    CASE WHEN @orderBy = 'fecha_desc' THEN g.fecha END DESC,
    CASE WHEN @orderBy = 'fecha_asc' THEN g.fecha END ASC,
    CASE WHEN @orderBy = 'monto_desc' THEN g.monto END DESC,
    CASE WHEN @orderBy = 'monto_asc' THEN g.monto END ASC,
    g.created_at DESC
LIMIT @limit OFFSET @offset;


-- 1.2. Contar Total de Gastos (para paginación)
SELECT COUNT(*) as total
FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id

WHERE 1=1
    AND (@comunidadId IS NULL OR g.comunidad_id = @comunidadId)
    AND (@estado IS NULL OR g.estado = @estado)
    AND (@categoriaId IS NULL OR g.categoria_id = @categoriaId)
    AND (@fechaDesde IS NULL OR g.fecha >= @fechaDesde)
    AND (@fechaHasta IS NULL OR g.fecha <= @fechaHasta)
    AND (@montoMin IS NULL OR g.monto >= @montoMin)
    AND (@montoMax IS NULL OR g.monto <= @montoMax)
    AND (@proveedorId IS NULL OR dc.proveedor_id = @proveedorId)
    AND (@centroCostoId IS NULL OR g.centro_costo_id = @centroCostoId)
    AND (@extraordinario IS NULL OR g.extraordinario = @extraordinario)
    AND (@search IS NULL OR (
        g.glosa LIKE CONCAT('%', @search, '%') OR
        g.numero LIKE CONCAT('%', @search, '%') OR
        cg.nombre LIKE CONCAT('%', @search, '%') OR
        p.razon_social LIKE CONCAT('%', @search, '%')
    ));

-- =================================================================================
-- 2. DETALLE DE GASTO
-- =================================================================================

-- 2.1. Obtener Detalle Completo de un Gasto (CORREGIDA: JOIN a persona para nombres)
SELECT 
    g.id,
    g.numero,
    g.glosa as observations,
    g.fecha as date,
    g.monto as amount,
    g.estado as status,
    g.extraordinario as isExtraordinary,
    
    -- Categoría
    g.categoria_id as categoryId,
    cg.nombre as category,
    cg.tipo as categoryType,
    cg.cta_contable as accountCode,
    
    -- Proveedor
    dc.proveedor_id as providerId,
    p.razon_social as provider,
    p.rut as providerRut,
    p.dv as providerDv,
    p.email as providerEmail,
    p.telefono as providerPhone,
    p.direccion as providerAddress,
    
    -- Centro de Costo
    g.centro_costo_id as costCenterId,
    cc.nombre as costCenter,
    cc.codigo as costCenterCode,
    
    -- Documento de Compra
    g.documento_compra_id as documentId,
    dc.tipo_doc as documentType,
    dc.folio as documentNumber,
    dc.fecha_emision as documentDate,
    dc.neto as documentNet,
    dc.iva as documentIva,
    dc.exento as documentExempt,
    dc.total as documentTotal,
    dc.glosa as documentDescription,
    
    -- Aprobaciones
    g.required_aprobaciones as requiredApprovals,
    g.aprobaciones_count as currentApprovals,
    
    -- Usuarios Creador
    g.creado_por as createdById,
    u_creador.username as createdBy,
    p_creador.nombres as creatorFirstName, -- ⬅️ Corregido
    p_creador.apellidos as creatorLastName, -- ⬅️ Corregido
    p_creador.email as creatorEmail, -- ⬅️ Corregido
    
    -- Usuarios Aprobador
    g.aprobado_por as approvedById,
    u_aprobador.username as approvedBy,
    p_aprobador.nombres as approverFirstName, -- ⬅️ Corregido
    p_aprobador.apellidos as approverLastName, -- ⬅️ Corregido
    
    -- Usuarios Anulador
    g.anulado_por as cancelledById,
    u_anulador.username as cancelledBy,
    p_anulador.nombres as cancellerFirstName, -- ⬅️ Corregido
    p_anulador.apellidos as cancellerLastName, -- ⬅️ Corregido
    
    -- Fechas
    g.created_at as createdAt,
    g.updated_at as updatedAt,
    g.fecha_anulacion as cancelledAt,
    
    -- Comunidad
    g.comunidad_id as communityId,
    com.razon_social as communityName,
    
    -- Información adicional
    (SELECT COUNT(*) 
     FROM archivos a 
     WHERE a.entity_type = 'gasto' 
     AND a.entity_id = g.id 
     AND a.is_active = 1) as attachmentCount,
     
    (SELECT COUNT(*) 
     FROM detalle_emision_gastos deg 
     WHERE deg.gasto_id = g.id) as linkedEmissionsCount,
     
    (SELECT COUNT(*) 
     FROM historial_gasto hg 
     WHERE hg.gasto_id = g.id) as historyCount

FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id
LEFT JOIN comunidad com ON g.comunidad_id = com.id

LEFT JOIN usuario u_creador ON g.creado_por = u_creador.id
LEFT JOIN persona p_creador ON u_creador.persona_id = p_creador.id -- ⬅️ Nuevo JOIN
LEFT JOIN usuario u_aprobador ON g.aprobado_por = u_aprobador.id
LEFT JOIN persona p_aprobador ON u_aprobador.persona_id = p_aprobador.id -- ⬅️ Nuevo JOIN
LEFT JOIN usuario u_anulador ON g.anulado_por = u_anulador.id
LEFT JOIN persona p_anulador ON u_anulador.persona_id = p_anulador.id -- ⬅️ Nuevo JOIN

WHERE g.id = @gastoId
LIMIT 1;

-- =================================================================================
-- 3. HISTORIAL DE GASTO
-- =================================================================================

-- 3.1. Obtener Historial de Cambios de un Gasto (CORREGIDA: Nombres de tablas/columnas y JOINS)
SELECT 
    hg.id,
    hg.gasto_id as expenseId,
    hg.campo_modificado as field,
    hg.valor_anterior as oldValue,
    hg.valor_nuevo as newValue,
    hg.created_at as changedAt,
    
    -- Usuario que hizo el cambio
    hg.usuario_id as userId,
    u.username,
    p.nombres as firstName, -- ⬅️ Corregido: Uso de la tabla persona
    p.apellidos as lastName, -- ⬅️ Corregido: Uso de la tabla persona
    p.email, -- ⬅️ Corregido: Uso de la tabla persona
    
    -- Roles del usuario (Limitado a una comunidad para ser más preciso, se omite por simplicidad en el GROUP_CONCAT)
    GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') as userRoles -- ⬅️ Corregido: rol_sistema.nombre

FROM historial_gasto hg
LEFT JOIN usuario u ON hg.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id -- ⬅️ Nuevo JOIN a persona
LEFT JOIN usuario_rol_comunidad urc ON u.id = urc.usuario_id -- ⬅️ Corregido: Nombre de tabla
LEFT JOIN rol_sistema r ON urc.rol_id = r.id -- ⬅️ Corregido: Nombre de tabla

WHERE hg.gasto_id = @gastoId

GROUP BY hg.id, hg.gasto_id, hg.campo_modificado, hg.valor_anterior, 
         hg.valor_nuevo, hg.created_at, hg.usuario_id, u.username, 
         p.nombres, p.apellidos, p.email -- ⬅️ Corregido: Uso de la tabla persona

ORDER BY hg.created_at DESC;

-- =================================================================================
-- 4. APROBACIONES DE GASTO
-- =================================================================================

-- 4.1. Obtener Historial de Aprobaciones de un Gasto (CORREGIDA: Nombres de tablas/columnas y JOINS)
SELECT 
    ga.id,
    ga.gasto_id as expenseId,
    ga.accion as action,
    ga.observaciones as comments,
    ga.created_at as approvalDate,
    
    -- Usuario aprobador
    ga.usuario_id as userId,
    u.username,
    p.nombres as firstName, -- ⬅️ Corregido
    p.apellidos as lastName, -- ⬅️ Corregido
    p.email, -- ⬅️ Corregido
    
    -- Rol con el que aprobó
    ga.rol_id as roleId,
    r.nombre as roleName, -- ⬅️ Corregido: rol_sistema.nombre
    r.descripcion as roleDescription -- ⬅️ Corregido: rol_sistema.descripcion

FROM gasto_aprobacion ga
LEFT JOIN usuario u ON ga.usuario_id = u.id
LEFT JOIN persona p ON u.persona_id = p.id -- ⬅️ Nuevo JOIN
LEFT JOIN rol_sistema r ON ga.rol_id = r.id -- ⬅️ Corregido: rol_sistema

WHERE ga.gasto_id = @gastoId

ORDER BY ga.created_at DESC;

-- 4.2. Verificar si un Usuario Puede Aprobar un Gasto (CORREGIDA: Nombres de tablas/columnas y lógica de permisos)
SELECT 
    g.id as expenseId,
    g.estado as status,
    g.required_aprobaciones as requiredApprovals,
    g.aprobaciones_count as currentApprovals,
    
    -- Verificar si el usuario ya aprobó
    (SELECT COUNT(*) 
     FROM gasto_aprobacion ga 
     WHERE ga.gasto_id = g.id 
     AND ga.usuario_id = @usuarioId 
     AND ga.accion = 'aprobar') as hasApproved,
     
    -- Verificar si el usuario tiene permisos (asumiendo roles de aprobación)
    (SELECT COUNT(*) 
     FROM usuario_rol_comunidad urc -- ⬅️ Corregido
     JOIN rol_sistema r ON urc.rol_id = r.id -- ⬅️ Corregido
     WHERE urc.usuario_id = @usuarioId 
     AND urc.comunidad_id = g.comunidad_id -- Asegura que el rol es para la comunidad del gasto
     AND r.codigo IN ('admin_comunidad', 'presidente_comite', 'tesorero', 'superadmin')) as hasPermission, -- ⬅️ Corregido: Uso de rol_sistema.codigo
     
    -- Necesita más aprobaciones
    CASE 
        WHEN g.aprobaciones_count >= g.required_aprobaciones THEN 0
        ELSE 1
    END as needsMoreApprovals

FROM gasto g
WHERE g.id = @gastoId
LIMIT 1;

-- 4.3. Registrar Aprobación de un Gasto (CORREGIDA: La inserción debe incluir la comunidad del usuario)

-- 1. Insertar la aprobación (asume que @rolId es el rol del usuario para la comunidad del gasto)
INSERT INTO gasto_aprobacion (
    gasto_id,
    usuario_id,
    rol_id,
    accion,
    observaciones,
    created_at
) VALUES (
    @gastoId,
    @usuarioId,
    (SELECT rol_id FROM usuario_rol_comunidad WHERE usuario_id = @usuarioId AND comunidad_id = (SELECT comunidad_id FROM gasto WHERE id = @gastoId) AND activo = 1 LIMIT 1), -- Obtiene el rolId del usuario en esa comunidad
    'aprobar',
    @observaciones,
    NOW()
);

-- 2. Actualizar contador de aprobaciones
UPDATE gasto
SET 
    aprobaciones_count = aprobaciones_count + 1,
    updated_at = NOW()
WHERE id = @gastoId;

-- 3. Si alcanzó las aprobaciones requeridas, cambiar estado
UPDATE gasto
SET 
    estado = 'aprobado',
    aprobado_por = @usuarioId,
    updated_at = NOW()
WHERE id = @gastoId
AND aprobaciones_count >= required_aprobaciones;

-- 4.4. Registrar Rechazo de un Gasto (CORREGIDA: La inserción debe incluir la comunidad del usuario)

-- 1. Insertar el rechazo
INSERT INTO gasto_aprobacion (
    gasto_id,
    usuario_id,
    rol_id,
    accion,
    observaciones,
    created_at
) VALUES (
    @gastoId,
    @usuarioId,
    (SELECT rol_id FROM usuario_rol_comunidad WHERE usuario_id = @usuarioId AND comunidad_id = (SELECT comunidad_id FROM gasto WHERE id = @gastoId) AND activo = 1 LIMIT 1), -- Obtiene el rolId del usuario en esa comunidad
    'rechazar',
    @observaciones,
    NOW()
);

-- 2. Cambiar estado del gasto
UPDATE gasto
SET 
    estado = 'rechazado',
    updated_at = NOW()
WHERE id = @gastoId;


-- =================================================================================
-- 5. DOCUMENTOS ADJUNTOS
-- =================================================================================

-- 5.1. Listar Archivos Adjuntos de un Gasto (CORREGIDA: JOIN a persona para nombres)
SELECT 
    a.id,
    a.original_name as name,
    a.filename as storedName,
    a.file_path as path,
    a.file_size as size,
    a.mimetype as type,
    a.category,
    a.description,
    a.uploaded_at as uploadedAt,
    
    -- Usuario que subió
    a.uploaded_by as uploadedById,
    u.username as uploadedBy,
    p.nombres as uploaderFirstName, -- ⬅️ Corregido
    p.apellidos as uploaderLastName, -- ⬅️ Corregido
    
    a.is_active as isActive

FROM archivos a
LEFT JOIN usuario u ON a.uploaded_by = u.id
LEFT JOIN persona p ON u.persona_id = p.id -- ⬅️ Nuevo JOIN

WHERE a.entity_type = 'gasto'
AND a.entity_id = @gastoId
AND a.is_active = 1

ORDER BY a.uploaded_at DESC;

-- 5.2. Agregar Archivo a un Gasto (Asume @usuarioId y @comunidadId son correctos)
INSERT INTO archivos (
    original_name,
    filename,
    file_path,
    file_size,
    mimetype,
    comunidad_id,
    entity_type,
    entity_id,
    category,
    description,
    uploaded_at,
    uploaded_by,
    is_active
) VALUES (
    @originalName,
    @filename,
    @filePath,
    @fileSize,
    @mimetype,
    @comunidadId,
    'gasto',
    @gastoId,
    @category,
    @description,
    NOW(),
    @usuarioId,
    1
);

-- 5.3. Eliminar Archivo de un Gasto (Soft Delete)
UPDATE archivos
SET 
    is_active = 0,
    -- No existe updated_at en la tabla archivos, se remueve.
    uploaded_at = NOW()
WHERE id = @archivoId
AND entity_type = 'gasto'
AND entity_id = @gastoId;

-- =================================================================================
-- 6. CATEGORÍAS DE GASTO
-- =================================================================================

-- 6.1. Listar Categorías de Gasto de una Comunidad
SELECT 
    cg.id,
    cg.nombre as name,
    cg.tipo as type,
    cg.cta_contable as accountCode,
    cg.activa as isActive,
    cg.created_at as createdAt,
    cg.updated_at as updatedAt,
    
    -- Contar gastos en esta categoría
    (SELECT COUNT(*) 
     FROM gasto g 
     WHERE g.categoria_id = cg.id) as expenseCount,
     
    -- Suma total de gastos
    (SELECT COALESCE(SUM(g.monto), 0) 
     FROM gasto g 
     WHERE g.categoria_id = cg.id) as totalAmount

FROM categoria_gasto cg

WHERE cg.comunidad_id = @comunidadId
AND (@soloActivas IS NULL OR cg.activa = @soloActivas)
AND (@tipo IS NULL OR cg.tipo = @tipo)

ORDER BY cg.nombre ASC;

-- 6.2. Obtener Categoría por ID
SELECT 
    cg.id,
    cg.comunidad_id as communityId,
    cg.nombre as name,
    cg.tipo as type,
    cg.cta_contable as accountCode,
    cg.activa as isActive,
    cg.created_at as createdAt,
    cg.updated_at as updatedAt

FROM categoria_gasto cg

WHERE cg.id = @categoriaId
LIMIT 1;

-- =================================================================================
-- 7. PROVEEDORES
-- =================================================================================

-- 7.1. Listar Proveedores de una Comunidad (CORREGIDA: Eliminación de columnas no existentes)
SELECT 
    p.id,
    p.razon_social as name,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) as fullRut,
    p.giro as businessType,
    p.direccion as address,
    p.email,
    p.telefono as phone,
    -- p.contacto_nombre as contactName, -- ⬅️ Eliminada
    -- p.contacto_email as contactEmail, -- ⬅️ Eliminada
    -- p.contacto_telefono as contactPhone, -- ⬅️ Eliminada
    p.activo as isActive,
    p.created_at as createdAt,
    
    -- Contar documentos del proveedor
    (SELECT COUNT(*) 
     FROM documento_compra dc 
     WHERE dc.proveedor_id = p.id) as documentCount,
     
    -- Contar gastos del proveedor
    (SELECT COUNT(DISTINCT g.id) 
     FROM gasto g 
     JOIN documento_compra dc ON g.documento_compra_id = dc.id 
     WHERE dc.proveedor_id = p.id) as expenseCount,
     
    -- Suma total de compras
    (SELECT COALESCE(SUM(dc.total), 0) 
     FROM documento_compra dc 
     WHERE dc.proveedor_id = p.id) as totalPurchases

FROM proveedor p

WHERE p.comunidad_id = @comunidadId
AND (@soloActivos IS NULL OR p.activo = @soloActivos)
AND (@search IS NULL OR (
    p.razon_social LIKE CONCAT('%', @search, '%') OR
    p.rut LIKE CONCAT('%', @search, '%') OR
    p.email LIKE CONCAT('%', @search, '%')
))

ORDER BY p.razon_social ASC;

-- 7.2. Obtener Proveedor por ID (CORREGIDA: Eliminación de columnas no existentes)
SELECT 
    p.id,
    p.comunidad_id as communityId,
    p.razon_social as name,
    p.rut,
    p.dv,
    CONCAT(p.rut, '-', p.dv) as fullRut,
    p.giro as businessType,
    p.direccion as address,
    p.email,
    p.telefono as phone,
    -- p.contacto_nombre as contactName, -- ⬅️ Eliminada
    -- p.contacto_email as contactEmail, -- ⬅️ Eliminada
    -- p.contacto_telefono as contactPhone, -- ⬅️ Eliminada
    -- p.observaciones as observations, -- ⬅️ Eliminada
    p.activo as isActive,
    p.created_at as createdAt,
    p.updated_at as updatedAt

FROM proveedor p

WHERE p.id = @proveedorId
LIMIT 1;

-- =================================================================================
-- 8. CENTROS DE COSTO
-- =================================================================================

-- 8.1. Listar Centros de Costo de una Comunidad
SELECT 
    cc.id,
    cc.nombre as name,
    cc.codigo as code,
    cc.created_at as createdAt,
    cc.updated_at as updatedAt,
    
    -- Contar gastos en este centro
    (SELECT COUNT(*) 
     FROM gasto g 
     WHERE g.centro_costo_id = cc.id) as expenseCount,
     
    -- Suma total de gastos
    (SELECT COALESCE(SUM(g.monto), 0) 
     FROM gasto g 
     WHERE g.centro_costo_id = cc.id) as totalAmount

FROM centro_costo cc

WHERE cc.comunidad_id = @comunidadId

ORDER BY cc.nombre ASC;

-- 8.2. Obtener Centro de Costo por ID
SELECT 
    cc.id,
    cc.comunidad_id as communityId,
    cc.nombre as name,
    cc.codigo as code,
    cc.created_at as createdAt,
    cc.updated_at as updatedAt

FROM centro_costo cc

WHERE cc.id = @centroCostoId
LIMIT 1;

-- =================================================================================
-- 9. ESTADÍSTICAS Y REPORTES
-- =================================================================================

-- 9.1. Dashboard - Resumen de Gastos
SELECT 
    -- Total general
    COUNT(*) as totalExpenses,
    COALESCE(SUM(g.monto), 0) as totalAmount,
    
    -- Por estado
    SUM(CASE WHEN g.estado = 'pendiente' THEN 1 ELSE 0 END) as pendingCount,
    SUM(CASE WHEN g.estado = 'pendiente' THEN g.monto ELSE 0 END) as pendingAmount,
    
    SUM(CASE WHEN g.estado = 'aprobado' THEN 1 ELSE 0 END) as approvedCount,
    SUM(CASE WHEN g.estado = 'aprobado' THEN g.monto ELSE 0 END) as approvedAmount,
    
    SUM(CASE WHEN g.estado = 'rechazado' THEN 1 ELSE 0 END) as rejectedCount,
    SUM(CASE WHEN g.estado = 'rechazado' THEN g.monto ELSE 0 END) as rejectedAmount,
    
    SUM(CASE WHEN g.estado = 'anulado' THEN 1 ELSE 0 END) as cancelledCount,
    SUM(CASE WHEN g.estado = 'anulado' THEN g.monto ELSE 0 END) as cancelledAmount,
    
    -- Por tipo
    SUM(CASE WHEN g.extraordinario = 1 THEN 1 ELSE 0 END) as extraordinaryCount,
    SUM(CASE WHEN g.extraordinario = 1 THEN g.monto ELSE 0 END) as extraordinaryAmount,
    
    SUM(CASE WHEN g.extraordinario = 0 THEN 1 ELSE 0 END) as regularCount,
    SUM(CASE WHEN g.extraordinario = 0 THEN g.monto ELSE 0 END) as regularAmount,
    
    -- Promedios
    AVG(g.monto) as averageAmount,
    
    -- Mes actual
    SUM(CASE WHEN MONTH(g.fecha) = MONTH(CURRENT_DATE()) 
             AND YEAR(g.fecha) = YEAR(CURRENT_DATE()) 
        THEN 1 ELSE 0 END) as currentMonthCount,
    SUM(CASE WHEN MONTH(g.fecha) = MONTH(CURRENT_DATE()) 
             AND YEAR(g.fecha) = YEAR(CURRENT_DATE()) 
        THEN g.monto ELSE 0 END) as currentMonthAmount

FROM gasto g

WHERE g.comunidad_id = @comunidadId
AND (@fechaDesde IS NULL OR g.fecha >= @fechaDesde)
AND (@fechaHasta IS NULL OR g.fecha <= @fechaHasta);

-- 9.2. Gastos por Categoría
SELECT 
    cg.id as categoryId,
    cg.nombre as categoryName,
    cg.tipo as categoryType,
    
    COUNT(g.id) as expenseCount,
    COALESCE(SUM(g.monto), 0) as totalAmount,
    AVG(g.monto) as averageAmount,
    MIN(g.monto) as minAmount,
    MAX(g.monto) as maxAmount,
    
    -- Porcentaje del total
    ROUND((COALESCE(SUM(g.monto), 0) / 
           (SELECT SUM(monto) FROM gasto WHERE comunidad_id = @comunidadId) * 100), 2) as percentage

FROM categoria_gasto cg
LEFT JOIN gasto g ON cg.id = g.categoria_id 
    AND g.comunidad_id = @comunidadId
    AND (@fechaDesde IS NULL OR g.fecha >= @fechaDesde)
    AND (@fechaHasta IS NULL OR g.fecha <= @fechaHasta)
    AND (@estado IS NULL OR g.estado = @estado)

WHERE cg.comunidad_id = @comunidadId
AND cg.activa = 1

GROUP BY cg.id, cg.nombre, cg.tipo

HAVING expenseCount > 0

ORDER BY totalAmount DESC;

-- 9.3. Gastos por Proveedor
SELECT 
    p.id as providerId,
    p.razon_social as providerName,
    p.rut,
    p.dv,
    
    COUNT(DISTINCT dc.id) as documentCount,
    COUNT(DISTINCT g.id) as expenseCount,
    COALESCE(SUM(dc.total), 0) as totalAmount,
    AVG(dc.total) as averageAmount,
    
    -- Última compra
    MAX(dc.fecha_emision) as lastPurchaseDate,
    
    -- Porcentaje del total
    ROUND((COALESCE(SUM(dc.total), 0) / 
           (SELECT SUM(dc2.total) 
            FROM documento_compra dc2 
            WHERE dc2.comunidad_id = @comunidadId) * 100), 2) as percentage

FROM proveedor p
LEFT JOIN documento_compra dc ON p.id = dc.proveedor_id
    AND dc.comunidad_id = @comunidadId
    AND (@fechaDesde IS NULL OR dc.fecha_emision >= @fechaDesde)
    AND (@fechaHasta IS NULL OR dc.fecha_emision <= @fechaHasta)
LEFT JOIN gasto g ON dc.id = g.documento_compra_id

WHERE p.comunidad_id = @comunidadId
AND p.activo = 1

GROUP BY p.id, p.razon_social, p.rut, p.dv

HAVING documentCount > 0

ORDER BY totalAmount DESC
LIMIT 10;

-- 9.4. Gastos por Centro de Costo
SELECT 
    cc.id as costCenterId,
    cc.nombre as costCenterName,
    cc.codigo as costCenterCode,
    
    COUNT(g.id) as expenseCount,
    COALESCE(SUM(g.monto), 0) as totalAmount,
    AVG(g.monto) as averageAmount,
    
    -- Porcentaje del total
    ROUND((COALESCE(SUM(g.monto), 0) / 
           (SELECT SUM(monto) FROM gasto WHERE comunidad_id = @comunidadId) * 100), 2) as percentage

FROM centro_costo cc
LEFT JOIN gasto g ON cc.id = g.centro_costo_id
    AND g.comunidad_id = @comunidadId
    AND (@fechaDesde IS NULL OR g.fecha >= @fechaDesde)
    AND (@fechaHasta IS NULL OR g.fecha <= @fechaHasta)
    AND (@estado IS NULL OR g.estado = @estado)

WHERE cc.comunidad_id = @comunidadId

GROUP BY cc.id, cc.nombre, cc.codigo

HAVING expenseCount > 0

ORDER BY totalAmount DESC;

-- 9.5. Gastos por Mes (Evolución Temporal)
SELECT 
    DATE_FORMAT(g.fecha, '%Y-%m') as period,
    DATE_FORMAT(g.fecha, '%Y') as year,
    DATE_FORMAT(g.fecha, '%m') as month,
    -- DATE_FORMAT(g.fecha, '%M %Y') as monthName, -- Se comenta por dependencia de idioma del servidor MySQL
    
    COUNT(*) as expenseCount,
    COALESCE(SUM(g.monto), 0) as totalAmount,
    AVG(g.monto) as averageAmount,
    
    -- Por estado
    SUM(CASE WHEN g.estado = 'aprobado' THEN 1 ELSE 0 END) as approvedCount,
    SUM(CASE WHEN g.estado = 'aprobado' THEN g.monto ELSE 0 END) as approvedAmount,
    
    SUM(CASE WHEN g.estado = 'pendiente' THEN 1 ELSE 0 END) as pendingCount,
    SUM(CASE WHEN g.estado = 'pendiente' THEN g.monto ELSE 0 END) as pendingAmount,
    
    -- Por tipo
    SUM(CASE WHEN g.extraordinario = 1 THEN g.monto ELSE 0 END) as extraordinaryAmount,
    SUM(CASE WHEN g.extraordinario = 0 THEN g.monto ELSE 0 END) as regularAmount

FROM gasto g

WHERE g.comunidad_id = @comunidadId
AND g.fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)

GROUP BY 
    DATE_FORMAT(g.fecha, '%Y-%m'),
    DATE_FORMAT(g.fecha, '%Y'),
    DATE_FORMAT(g.fecha, '%m')

ORDER BY period DESC;

-- 9.6. Top 10 Gastos Mayores
SELECT 
    g.id,
    g.numero,
    g.glosa as description,
    g.fecha as date,
    g.monto as amount,
    g.estado as status,
    
    cg.nombre as category,
    p.razon_social as provider,
    cc.nombre as costCenter

FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id

WHERE g.comunidad_id = @comunidadId
AND (@fechaDesde IS NULL OR g.fecha >= @fechaDesde)
AND (@fechaHasta IS NULL OR g.fecha <= @fechaHasta)
AND (@estado IS NULL OR g.estado = @estado)

ORDER BY g.monto DESC
LIMIT 10;

-- 9.7. Gastos Pendientes de Aprobación (CORREGIDA: JOIN a persona para nombres)
SELECT 
    g.id,
    g.numero,
    g.glosa as description,
    g.fecha as date,
    g.monto as amount,
    g.required_aprobaciones as requiredApprovals,
    g.aprobaciones_count as currentApprovals,
    (g.required_aprobaciones - g.aprobaciones_count) as pendingApprovals,
    
    cg.nombre as category,
    p.razon_social as provider,
    
    u.username as createdBy,
    p_creador.nombres as creatorFirstName, -- ⬅️ Corregido
    p_creador.apellidos as creatorLastName, -- ⬅️ Corregido
    
    g.created_at as createdAt,
    DATEDIFF(CURRENT_DATE(), g.created_at) as daysWaiting

FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN usuario u ON g.creado_por = u.id
LEFT JOIN persona p_creador ON u.persona_id = p_creador.id -- ⬅️ Nuevo JOIN

WHERE g.comunidad_id = @comunidadId
AND g.estado = 'pendiente'
AND g.aprobaciones_count < g.required_aprobaciones

ORDER BY daysWaiting DESC, g.monto DESC;

-- =================================================================================
-- 10. GASTOS RELACIONADOS CON EMISIONES
-- =================================================================================

-- 10.1. Listar Gastos Incluidos en una Emisión
SELECT 
    g.id,
    g.numero,
    g.glosa as description,
    g.fecha as date,
    g.monto as amount,
    
    cg.nombre as category,
    p.razon_social as provider,
    
    deg.monto as distributedAmount,
    deg.regla_prorrateo as distributionRule,
    deg.metadata_json as distributionMetadata

FROM detalle_emision_gastos deg
JOIN gasto g ON deg.gasto_id = g.id
LEFT JOIN categoria_gasto cg ON deg.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id

WHERE deg.emision_id = @emisionId

ORDER BY deg.created_at ASC;

-- 10.2. Verificar si un Gasto está en alguna Emisión
SELECT 
    g.id as expenseId,
    
    COUNT(DISTINCT deg.emision_id) as emissionCount,
    
    GROUP_CONCAT(DISTINCT egc.periodo ORDER BY egc.periodo) as periods,
    
    SUM(deg.monto) as totalDistributed,
    
    -- Saldo no distribuido
    (g.monto - COALESCE(SUM(deg.monto), 0)) as remainingAmount

FROM gasto g
LEFT JOIN detalle_emision_gastos deg ON g.id = deg.gasto_id
LEFT JOIN emision_gastos_comunes egc ON deg.emision_id = egc.id

WHERE g.id = @gastoId

GROUP BY g.id, g.monto;

-- 10.3. Gastos Disponibles para Incluir en Emisión
SELECT 
    g.id,
    g.numero,
    g.glosa as description,
    g.fecha as date,
    g.monto as amount,
    g.estado as status,
    
    cg.nombre as category,
    cg.tipo as categoryType,
    p.razon_social as provider,
    cc.nombre as costCenter,
    
    -- Verificar si ya está en emisión del período
    (SELECT COUNT(*) 
     FROM detalle_emision_gastos deg 
     JOIN emision_gastos_comunes egc ON deg.emision_id = egc.id
     WHERE deg.gasto_id = g.id 
     AND egc.periodo = @periodo) as isInPeriodEmission,
     
    -- Saldo disponible
    (g.monto - COALESCE(
        (SELECT SUM(deg2.monto) 
         FROM detalle_emision_gastos deg2 
         WHERE deg2.gasto_id = g.id), 0)
    ) as availableAmount

FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id
LEFT JOIN centro_costo cc ON g.centro_costo_id = cc.id

WHERE g.comunidad_id = @comunidadId
AND g.estado = 'aprobado'
AND g.fecha >= DATE_SUB(STR_TO_DATE(CONCAT(@periodo, '-01'), '%Y-%m-%d'), INTERVAL 3 MONTH)
AND g.fecha <= LAST_DAY(STR_TO_DATE(CONCAT(@periodo, '-01'), '%Y-%m-%d'))

HAVING availableAmount > 0

ORDER BY g.fecha DESC;

-- =================================================================================
-- 11. OPERACIONES CRUD
-- =================================================================================

-- 11.1. Crear Nuevo Gasto
-- *Se requiere rellenar las variables: @numero, @comunidadId, @categoriaId, @centroCostoId, @documentoCompraId, @fecha, @monto, @usuarioId, @requiredAprobaciones, @glosa, @extraordinario.
-- Ejemplo de valores: SET @numero = 'G100'; SET @comunidadId = 1; SET @categoriaId = 1; SET @centroCostoId = 1; SET @documentoCompraId = 1; SET @fecha = '2025-10-15'; SET @monto = 50000; SET @usuarioId = 1; SET @requiredAprobaciones = 1; SET @glosa = 'Gasto de prueba'; SET @extraordinario = 0;

/*
-- 1. Insertar el gasto
INSERT INTO gasto (
    numero,
    comunidad_id,
    categoria_id,
    centro_costo_id,
    documento_compra_id,
    fecha,
    monto,
    estado,
    creado_por,
    required_aprobaciones,
    aprobaciones_count,
    glosa,
    extraordinario,
    created_at,
    updated_at
) VALUES (
    @numero,
    @comunidadId,
    @categoriaId,
    @centroCostoId,
    @documentoCompraId,
    @fecha,
    @monto,
    'pendiente',
    @usuarioId,
    @requiredAprobaciones,
    0,
    @glosa,
    @extraordinario,
    NOW(),
    NOW()
);

-- Obtener el ID del gasto creado
SET @gastoId = LAST_INSERT_ID();

-- 2. Registrar en historial
INSERT INTO historial_gasto (
    gasto_id,
    usuario_id,
    campo_modificado,
    valor_anterior,
    valor_nuevo,
    created_at
) VALUES (
    @gastoId,
    @usuarioId,
    'created',
    NULL,
    'Gasto creado',
    NOW()
);
*/

-- 11.2. Actualizar Gasto
-- *Se requiere rellenar las variables: @gastoId, @usuarioId, y al menos una de las nuevas: @nuevoMonto, @nuevaFecha, etc.
-- Ejemplo: SET @gastoId = 1; SET @usuarioId = 1; SET @nuevoMonto = 120000; SET @glosa = 'Gasto Aseo Comunal Actualizado';
/*
-- 1. Guardar valores anteriores en historial
-- Se usa un PROCEDURE o lógica de aplicación para detectar y registrar cambios en TODOS los campos. Aquí se muestra un ejemplo para 'monto' y 'glosa'.

INSERT INTO historial_gasto (gasto_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo, created_at)
SELECT 
    @gastoId,
    @usuarioId,
    'monto',
    monto,
    @nuevoMonto,
    NOW()
FROM gasto 
WHERE id = @gastoId AND monto != @nuevoMonto AND @nuevoMonto IS NOT NULL; -- Solo si el valor cambió

INSERT INTO historial_gasto (gasto_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo, created_at)
SELECT 
    @gastoId,
    @usuarioId,
    'glosa',
    glosa,
    @glosa,
    NOW()
FROM gasto 
WHERE id = @gastoId AND glosa != @glosa AND @glosa IS NOT NULL; -- Solo si el valor cambió


-- 2. Actualizar el gasto
UPDATE gasto
SET 
    categoria_id = COALESCE(@categoriaId, categoria_id),
    centro_costo_id = COALESCE(@centroCostoId, centro_costo_id),
    fecha = COALESCE(@fecha, fecha),
    monto = COALESCE(@nuevoMonto, monto), -- Usar @nuevoMonto para evitar duplicidad de variables
    glosa = COALESCE(@glosa, glosa),
    extraordinario = COALESCE(@extraordinario, extraordinario),
    updated_at = NOW()
WHERE id = @gastoId;
*/

-- 11.3. Anular Gasto
-- *Se requiere rellenar las variables: @gastoId, @usuarioId.
/*
-- 1. Verificar que el gasto no esté en emisiones cerradas
SELECT COUNT(*) INTO @emisionesCerradas
FROM detalle_emision_gastos deg
JOIN emision_gastos_comunes egc ON deg.emision_id = egc.id
WHERE deg.gasto_id = @gastoId
AND egc.estado IN ('emitido', 'cerrado');

-- Si hay emisiones cerradas, no permitir anulación
-- Esto se maneja mejor en la aplicación o con un TRIGGER/PROCEDURE si la BD lo soporta.
-- En MySQL puro, el IF/SIGNAL requiere un PROCEDURE:
-- IF @emisionesCerradas > 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede anular un gasto incluido en emisiones cerradas'; END IF;

-- 2. Anular el gasto
UPDATE gasto
SET 
    estado = 'anulado',
    anulado_por = @usuarioId,
    fecha_anulacion = NOW(),
    updated_at = NOW()
WHERE id = @gastoId;

-- 3. Registrar en historial
INSERT INTO historial_gasto (
    gasto_id,
    usuario_id,
    campo_modificado,
    valor_anterior,
    valor_nuevo,
    created_at
) VALUES (
    @gastoId,
    @usuarioId,
    'estado',
    (SELECT estado FROM gasto WHERE id = @gastoId), -- Obtenemos el estado anterior antes de la anulación si fuera un PROCEDURE
    'anulado',
    NOW()
);
*/

-- 11.4. Eliminar Gasto (Solo Borradores)
-- *Se requiere rellenar la variable: @gastoId.
/*
-- 1. Verificar estado
SELECT estado INTO @estado FROM gasto WHERE id = @gastoId;

-- Lógica de verificación de estado (requiere PROCEDURE o aplicación)
-- IF @estado != 'borrador' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden eliminar gastos en estado borrador'; END IF;

-- 2. Eliminar archivos relacionados (Soft Delete es más seguro que DELETE)
UPDATE archivos
SET 
    is_active = 0,
    uploaded_at = NOW()
WHERE entity_type = 'gasto' AND entity_id = @gastoId;

-- 3. Eliminar historial (Opcional, se elimina por CASCADE si existe)
DELETE FROM historial_gasto WHERE gasto_id = @gastoId;

-- 4. Eliminar el gasto
DELETE FROM gasto WHERE id = @gastoId;
*/

-- =================================================================================
-- 12. CONSULTAS ADICIONALES ÚTILES
-- =================================================================================

-- 12.1. Buscar Gastos por Texto Completo (Requiere FULLTEXT Index en g.glosa)
-- *Se requiere rellenar la variable: @search.
/*
SELECT 
    g.id,
    g.numero,
    g.glosa as description,
    g.fecha as date,
    g.monto as amount,
    
    cg.nombre as category,
    p.razon_social as provider,
    
    -- Score de relevancia
    MATCH(g.glosa) AGAINST(@search) as relevance

FROM gasto g
LEFT JOIN categoria_gasto cg ON g.categoria_id = cg.id
LEFT JOIN documento_compra dc ON g.documento_compra_id = dc.id
LEFT JOIN proveedor p ON dc.proveedor_id = p.id

WHERE g.comunidad_id = @comunidadId
AND (
    MATCH(g.glosa) AGAINST(@search) OR
    g.numero LIKE CONCAT('%', @search, '%') OR
    cg.nombre LIKE CONCAT('%', @search, '%') OR
    p.razon_social LIKE CONCAT('%', @search, '%')
)

ORDER BY relevance DESC, g.fecha DESC;
*/

-- 12.2. Duplicar Gasto (para gastos recurrentes)
-- *Se requiere rellenar las variables: @gastoOriginalId, @nuevaFecha, @usuarioId.
/*
INSERT INTO gasto (
    numero,
    comunidad_id,
    categoria_id,
    centro_costo_id,
    documento_compra_id,
    fecha,
    monto,
    estado,
    creado_por,
    required_aprobaciones,
    aprobaciones_count,
    glosa,
    extraordinario,
    created_at,
    updated_at
)
SELECT 
    CONCAT(numero, '-COPIA'),
    comunidad_id,
    categoria_id,
    centro_costo_id,
    NULL, -- No duplicar documento
    @nuevaFecha,
    monto,
    'pendiente',
    @usuarioId,
    required_aprobaciones,
    0,
    glosa,
    extraordinario,
    NOW(),
    NOW()
FROM gasto
WHERE id = @gastoOriginalId;
*/

-- 12.3. Gastos que Necesitan Atención (Dashboard)
SELECT 
    'Pendientes de aprobación' as alert_type,
    COUNT(*) as count,
    SUM(g.monto) as total_amount
FROM gasto g
WHERE g.comunidad_id = @comunidadId
AND g.estado = 'pendiente'
AND g.aprobaciones_count < g.required_aprobaciones

UNION ALL

SELECT 
    'Vencidos sin aprobar' as alert_type,
    COUNT(*) as count,
    SUM(g.monto) as total_amount
FROM gasto g
WHERE g.comunidad_id = @comunidadId
AND g.estado = 'pendiente'
AND g.fecha < DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)

UNION ALL

SELECT 
    'Sin documento adjunto' as alert_type,
    COUNT(*) as count,
    SUM(g.monto) as total_amount
FROM gasto g
WHERE g.comunidad_id = @comunidadId
AND g.estado = 'aprobado'
AND NOT EXISTS (
    SELECT 1 FROM archivos a 
    WHERE a.entity_type = 'gasto' 
    AND a.entity_id = g.id 
    AND a.is_active = 1
);