-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DOCUMENTOS
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-15 (Corregido)
-- =========================================
-- NOTA DE CORRECCIÓN: La tabla 'documento' no existe. Se usa 'documento_comunidad' (d)
-- y se complementa con 'archivos' (a_file) para metadatos de tamaño/subida,
-- eliminando columnas inexistentes (versión, descargas, expiración, etc.).

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de documentos con filtros
SELECT
    d.id,
    d.titulo AS nombre, -- CORRECCIÓN: Usar 'titulo'
    d.tipo AS categoria, -- CORRECCIÓN: Usar 'tipo' como categoría
    d.visibilidad AS acceso, -- CORRECCIÓN: Usar 'visibilidad' como acceso
    d.url AS url_descarga,
    c.razon_social AS comunidad,
    COALESCE(u.username, 'Sistema') AS subido_por, -- CORRECCIÓN: Se usa username de usuario
    a_file.uploaded_at AS fecha_subida, -- CORRECCIÓN: Se asume que la fecha de subida es el uploaded_at del archivo
    d.updated_at AS fecha_modificacion,
    -- Columnas inexistentes (Simuladas/Eliminadas)
    NULL AS descripcion,
    NULL AS nombre_archivo,
    0 AS tamano_archivo,
    NULL AS version,
    1 AS es_ultima_version,
    NULL AS fecha_expiracion,
    NULL AS notas,
    0 AS contador_descargas,
    NULL AS ultima_descarga,
    -- Información adicional calculada (SIMULADA O AJUSTADA)
    'vigente' AS estado_vigencia, -- SIMULADO: Sin fecha de expiración
    DATEDIFF(CURDATE(), COALESCE(a_file.uploaded_at, d.created_at)) AS dias_desde_subida,
    0 AS popularidad,
    -- Conteos relacionados (SIMULADOS/INEXISTENTES)
    0 AS num_versiones,
    0 AS num_comentarios
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
JOIN comunidad c ON d.comunidad_id = c.id
-- CORRECCIÓN: Unir a 'archivos' para obtener metadata del archivo y luego a 'usuario'
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id -- Se asume que uploaded_by en 'archivos' es quien subió el documento
WHERE
    (:comunidad_id IS NULL OR d.comunidad_id = :comunidad_id) AND
    (:categoria IS NULL OR d.tipo = :categoria) AND -- CORRECCIÓN: Usar d.tipo
    (:acceso IS NULL OR d.visibilidad = :acceso) AND -- CORRECCIÓN: Usar d.visibilidad
    (:usuario_subio_id IS NULL OR a_file.uploaded_by = :usuario_subio_id) AND -- CORRECCIÓN: Usar a_file.uploaded_by
    (:fecha_desde IS NULL OR d.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR d.created_at <= :fecha_hasta) AND
    -- El filtro por estado_vigencia NO ES SARGABLE ni implementable. Se elimina la condición.
    TRUE
ORDER BY d.created_at DESC, d.id DESC -- CORRECCIÓN: Ordenar por d.created_at
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de documentos por comunidad con estadísticas
SELECT
    c.razon_social AS comunidad,
    COUNT(d.id) AS total_documentos,
    COUNT(CASE WHEN d.tipo = 'reglamento' THEN 1 END) AS documentos_legales, -- CORRECCIÓN: Usar 'reglamento'
    COUNT(CASE WHEN d.tipo = 'acta' THEN 1 END) AS documentos_financieros, -- SIMULADO: Usar 'acta'
    COUNT(CASE WHEN d.tipo = 'otro' THEN 1 END) AS documentos_tecnicos, -- SIMULADO: Usar 'otro'
    COUNT(CASE WHEN d.visibilidad = 'publico' THEN 1 END) AS documentos_publicos, -- CORRECCIÓN: Usar 'publico'
    COUNT(CASE WHEN d.visibilidad = 'privado' THEN 1 END) AS documentos_residentes, -- SIMULADO: 'privado'
    0 AS documentos_propietarios, -- NO IMPLEMENTABLE
    0 AS documentos_admin, -- NO IMPLEMENTABLE
    0 AS total_descargas, -- NO IMPLEMENTABLE
    0 AS promedio_descargas, -- NO IMPLEMENTABLE
    MAX(d.created_at) AS ultimo_documento
FROM comunidad c
LEFT JOIN documento_comunidad d ON c.id = d.comunidad_id -- CORRECCIÓN: Nombre de tabla
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Documentos próximos a expirar (30 días)
-- CORRECCIÓN: No existe la columna 'fecha_expiracion'. Esta consulta NO ES IMPLEMENTABLE.
SELECT
    d.id,
    d.titulo AS nombre,
    d.tipo AS categoria,
    d.visibilidad AS acceso,
    c.razon_social AS comunidad,
    COALESCE(u.username, 'Sistema') AS subido_por,
    d.created_at AS fecha_subida,
    0 AS dias_restantes,
    'vigente' AS nivel_urgencia,
    0 AS contador_descargas,
    NULL AS ultima_descarga
FROM documento_comunidad d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id
WHERE 1=0; -- Consulta dummy ya que el filtro es imposible de aplicar

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de un documento específico
SELECT
    d.id,
    d.titulo AS nombre,
    d.tipo AS categoria,
    d.visibilidad AS acceso,
    d.url AS url_descarga,
    c.id AS comunidad_id,
    c.razon_social AS comunidad_nombre,
    u.id AS subido_por_id,
    COALESCE(u.username, 'Sistema') AS subido_por_nombre, -- CORRECCIÓN: Usar username
    u.email AS subido_por_email,
    d.created_at AS fecha_subida,
    d.updated_at AS fecha_modificacion,
    -- Columnas inexistentes (Simuladas/Eliminadas)
    a_file.file_size AS tamano_archivo, -- CORRECCIÓN: Usar file_size de 'archivos'
    NULL AS descripcion,
    NULL AS nombre_archivo,
    NULL AS version,
    1 AS es_ultima_version,
    NULL AS fecha_expiracion,
    NULL AS notas,
    0 AS contador_descargas,
    NULL AS ultima_descarga,
    -- Información adicional calculada (SIMULADA O AJUSTADA)
    'vigente' AS estado_vigencia, -- SIMULADO
    DATEDIFF(CURDATE(), d.created_at) AS antiguedad_dias,
    NULL AS dias_sin_descarga,
    -- Conteos relacionados (SIMULADOS/INEXISTENTES)
    0 AS num_versiones,
    0 AS num_comentarios,
    0 AS num_etiquetas
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id
WHERE d.id = :documento_id;

-- 2.2 Vista de documentos con información completa para listado
SELECT
    d.id,
    d.titulo AS nombre,
    d.tipo AS categoria,
    d.visibilidad AS acceso,
    d.periodo,
    1 AS es_ultima_version, -- SIMULADO
    c.razon_social AS comunidad,
    COALESCE(u.username, 'Sistema') AS subido_por,
    d.created_at AS fecha_subida,
    0 AS contador_descargas, -- SIMULADO
    NULL AS fecha_expiracion, -- SIMULADO
    JSON_OBJECT(
        'documento', JSON_OBJECT(
            'id', d.id,
            'nombre', d.titulo,
            'categoria', d.tipo,
            'acceso', d.visibilidad,
            'version', '1.0'
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'subido_por', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'nombre', COALESCE(p.nombres, ''),
                'email', u.email
            )
            ELSE NULL
        END,
        'estadisticas', JSON_OBJECT(
            'descargas', 0,
            'ultima_descarga', NULL,
            'versiones', 1
        ),
        -- Las etiquetas no existen en el esquema. Se devuelve un array vacío.
        'etiquetas', JSON_ARRAY()
    ) AS informacion_completa
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id
LEFT JOIN persona p ON u.persona_id = p.id -- Para obtener el nombre de la persona
ORDER BY d.created_at DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de documentos
SELECT
    COUNT(*) AS total_documentos,
    COUNT(DISTINCT comunidad_id) AS comunidades_con_documentos,
    COUNT(*) AS documentos_ultima_version, -- SIMULADO: Todos son última versión
    0 AS documentos_con_expiracion, -- SIMULADO
    0 AS documentos_expirados, -- SIMULADO
    0 AS total_descargas, -- SIMULADO
    0 AS promedio_descargas_por_documento, -- SIMULADO
    MIN(created_at) AS primer_documento,
    MAX(created_at) AS ultimo_documento,
    0 AS porcentaje_documentos_descargados -- SIMULADO
FROM documento_comunidad; -- CORRECCIÓN: Nombre de tabla

-- 3.2 Estadísticas por categoría
SELECT
    tipo AS categoria, -- CORRECCIÓN: Usar 'tipo'
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM documento_comunidad)), 2
    ) AS porcentaje,
    0 AS total_descargas, -- SIMULADO
    0 AS promedio_descargas, -- SIMULADO
    COUNT(*) AS versiones_actuales, -- SIMULADO
    0 AS expirados, -- SIMULADO
    MIN(created_at) AS mas_antiguo,
    MAX(created_at) AS mas_reciente
FROM documento_comunidad -- CORRECCIÓN: Nombre de tabla
GROUP BY tipo
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por nivel de acceso
SELECT
    visibilidad AS acceso, -- CORRECCIÓN: Usar 'visibilidad'
    COUNT(*) AS cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM documento_comunidad)), 2
    ) AS porcentaje,
    0 AS total_descargas, -- SIMULADO
    0 AS promedio_descargas, -- SIMULADO
    COUNT(DISTINCT comunidad_id) AS comunidades_afectadas,
    CASE visibilidad
        WHEN 'publico' THEN 'Público'
        WHEN 'privado' THEN 'Privado'
        ELSE visibilidad
    END AS descripcion_acceso
FROM documento_comunidad -- CORRECCIÓN: Nombre de tabla
GROUP BY visibilidad
ORDER BY cantidad DESC;

-- 3.4 Estadísticas mensuales de documentos
SELECT
    YEAR(created_at) AS anio,
    MONTH(created_at) AS mes,
    COUNT(*) AS documentos_subidos,
    COUNT(DISTINCT tipo) AS categorias_usadas, -- CORRECCIÓN: Usar 'tipo'
    0 AS descargas_mes, -- SIMULADO
    COUNT(CASE WHEN visibilidad = 'publico' THEN 1 END) AS documentos_publicos, -- CORRECCIÓN: Usar 'visibilidad'
    COUNT(CASE WHEN visibilidad = 'privado' THEN 1 END) AS documentos_admin, -- SIMULADO: 'privado'
    0 AS promedio_descargas -- SIMULADO
FROM documento_comunidad -- CORRECCIÓN: Nombre de tabla
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY anio DESC, mes DESC;

-- 3.5 Estadísticas de descargas por documento
-- CORRECCIÓN: No implementable. Se simulan datos básicos.
SELECT
    d.titulo AS documento,
    d.tipo AS categoria,
    d.visibilidad AS acceso,
    c.razon_social AS comunidad,
    0 AS contador_descargas,
    NULL AS ultima_descarga,
    DATEDIFF(CURDATE(), d.created_at) AS dias_desde_subida,
    'nunca_descargado' AS nivel_popularidad,
    RANK() OVER (ORDER BY d.created_at) AS ranking_popularidad -- Ranking por fecha de creación
FROM documento_comunidad d
JOIN comunidad c ON d.comunidad_id = c.id
ORDER BY d.created_at DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de documentos
SELECT
    d.id,
    d.titulo AS nombre, -- CORRECCIÓN: Usar 'titulo'
    d.tipo AS categoria, -- CORRECCIÓN: Usar 'tipo'
    d.visibilidad AS acceso, -- CORRECCIÓN: Usar 'visibilidad'
    1 AS es_ultima_version, -- SIMULADO
    c.razon_social AS comunidad,
    COALESCE(u.username, 'Sistema') AS subido_por,
    d.created_at AS fecha_subida,
    0 AS contador_descargas, -- SIMULADO
    NULL AS fecha_expiracion, -- SIMULADO
    'vigente' AS estado_vigencia -- SIMULADO
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id
WHERE
    (:busqueda IS NULL OR
     d.titulo LIKE CONCAT('%', :busqueda, '%') OR
     d.tipo LIKE CONCAT('%', :busqueda, '%') OR
     d.url LIKE CONCAT('%', :busqueda, '%')) AND -- CORRECCIÓN: Usar campos existentes
    (:comunidad_id IS NULL OR d.comunidad_id = :comunidad_id) AND
    (:categoria IS NULL OR d.tipo = :categoria) AND -- CORRECCIÓN: Usar d.tipo
    (:acceso IS NULL OR d.visibilidad = :acceso) AND -- CORRECCIÓN: Usar d.visibilidad
    (:usuario_subio_id IS NULL OR a_file.uploaded_by = :usuario_subio_id) AND -- CORRECCIÓN: Usar a_file.uploaded_by
    (:fecha_desde IS NULL OR d.created_at >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR d.created_at <= :fecha_hasta) AND
    (:solo_ultimas_versiones IS NULL OR 1 = :solo_ultimas_versiones) AND -- SIMULADO
    (:estado_vigencia IS NULL OR 'vigente' = :estado_vigencia) -- SIMULADO
ORDER BY d.created_at DESC, d.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Documentos por usuario que los subió
SELECT
    u.id AS usuario_id,
    COALESCE(p.nombres, u.username) AS subido_por, -- CORRECCIÓN: Usar nombre de persona si existe
    u.email,
    COUNT(d.id) AS total_documentos,
    COUNT(DISTINCT d.tipo) AS categorias_usadas, -- CORRECCIÓN: Usar d.tipo
    0 AS total_descargas, -- SIMULADO
    0 AS promedio_descargas, -- SIMULADO
    MAX(d.created_at) AS ultimo_documento,
    MIN(d.created_at) AS primer_documento,
    COUNT(CASE WHEN d.visibilidad = 'publico' THEN 1 END) AS documentos_publicos, -- CORRECCIÓN: Usar d.visibilidad
    COUNT(CASE WHEN d.visibilidad = 'privado' THEN 1 END) AS documentos_restringidos -- CORRECCIÓN: Usar d.visibilidad
FROM usuario u
LEFT JOIN persona p ON u.persona_id = p.id
LEFT JOIN archivos a_file ON u.id = a_file.uploaded_by AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN documento_comunidad d ON a_file.entity_id = d.id
WHERE (:comunidad_id IS NULL OR d.comunidad_id = :comunidad_id)
GROUP BY u.id, p.nombres, u.username, u.email
HAVING COUNT(d.id) > 0
ORDER BY total_documentos DESC;

-- 4.3 Documentos más descargados
-- CORRECCIÓN: No implementable. Se simulan datos básicos.
SELECT
    d.id,
    d.titulo AS nombre,
    d.tipo AS categoria,
    d.visibilidad AS acceso,
    c.razon_social AS comunidad,
    COALESCE(u.username, 'Sistema') AS subido_por,
    0 AS contador_descargas,
    NULL AS ultima_descarga,
    DATEDIFF(CURDATE(), d.created_at) AS dias_desde_subida,
    RANK() OVER (ORDER BY d.created_at) AS ranking,
    'poco_popular' AS nivel_popularidad
FROM documento_comunidad d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id
ORDER BY d.created_at DESC
LIMIT 20;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de documentos para Excel/CSV
SELECT
    d.id AS 'ID',
    d.titulo AS 'Nombre', -- CORRECCIÓN: Usar 'titulo'
    d.tipo AS 'Categoría', -- CORRECCIÓN: Usar 'tipo'
    d.visibilidad AS 'Acceso', -- CORRECCIÓN: Usar 'visibilidad'
    COALESCE(a_file.original_name, 'N/A') AS 'Archivo', -- CORRECCIÓN: Usar original_name de archivos
    COALESCE(a_file.file_size, 0) AS 'Tamaño', -- CORRECCIÓN: Usar file_size de archivos
    '1.0' AS 'Versión', -- SIMULADO
    'Sí' AS 'Es Última Versión', -- SIMULADO
    c.razon_social AS 'Comunidad',
    COALESCE(u.username, '') AS 'Subido Por',
    DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') AS 'Fecha Subida',
    DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') AS 'Última Modificación',
    NULL AS 'Fecha Expiración', -- SIMULADO
    0 AS 'Descargas', -- SIMULADO
    NULL AS 'Última Descarga' -- SIMULADO
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id
ORDER BY d.created_at DESC;

-- 5.2 Exportación de documentos por categoría
SELECT
    d.tipo AS 'Categoría', -- CORRECCIÓN: Usar 'tipo'
    COUNT(*) AS 'Cantidad',
    0 AS 'Total Descargas', -- SIMULADO
    0 AS 'Promedio Descargas', -- SIMULADO
    COUNT(CASE WHEN d.visibilidad = 'publico' THEN 1 END) AS 'Públicos',
    COUNT(CASE WHEN d.visibilidad = 'privado' THEN 1 END) AS 'Para Residentes/Propietarios',
    COUNT(CASE WHEN d.visibilidad = 'privado' THEN 1 END) AS 'Para Admin', -- SIMULADO
    MIN(d.created_at) AS 'Primer Documento',
    MAX(d.created_at) AS 'Último Documento'
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
GROUP BY d.tipo
ORDER BY COUNT(*) DESC;

-- 5.3 Exportación de estadísticas de uso
SELECT
    YEAR(created_at) AS 'Año',
    MONTH(created_at) AS 'Mes',
    COUNT(*) AS 'Documentos Subidos',
    0 AS 'Total Descargas', -- SIMULADO
    0 AS 'Promedio Descargas', -- SIMULADO
    COUNT(DISTINCT tipo) AS 'Categorías Usadas', -- CORRECCIÓN: Usar 'tipo'
    0 AS 'Documentos Expirados', -- SIMULADO
    COUNT(*) AS 'Documentos Vigentes' -- SIMULADO
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY 1, 2
ORDER BY 1 DESC, 2 DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de documentos
SELECT
    'Documentos sin comunidad' AS validacion,
    COUNT(*) AS cantidad
FROM documento_comunidad d -- CORRECCIÓN: Nombre de tabla
LEFT JOIN comunidad c ON d.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Documentos sin URL' AS validacion,
    COUNT(*) AS cantidad
FROM documento_comunidad
WHERE url IS NULL OR url = ''
UNION ALL
SELECT
    'Archivos adjuntos sin referencia de entidad' AS validacion,
    COUNT(*) AS cantidad
FROM archivos a
LEFT JOIN documento_comunidad d ON a.entity_id = d.id AND a.entity_type = 'documento_comunidad'
WHERE a.entity_type = 'documento_comunidad' AND d.id IS NULL
UNION ALL
SELECT
    'Documentos duplicados (titulo y comunidad)' AS validacion,
    COUNT(*) AS cantidad
FROM (
    SELECT comunidad_id, titulo, COUNT(*) AS cnt
    FROM documento_comunidad
    GROUP BY comunidad_id, titulo
    HAVING COUNT(*) > 1
) AS duplicados;

-- 6.2 Validar consistencia de versiones (NO IMPLEMENTABLE)
SELECT 'Versiones no se pueden validar, tabla de versiones no existe' AS validacion, 0 AS cantidad_errores, NULL AS detalles FROM DUAL;

-- 6.3 Validar estadísticas de descargas (NO IMPLEMENTABLE)
SELECT 'Descargas no se pueden validar, tabla de descargas no existe' AS validacion, 0 AS cantidad_errores, NULL AS detalles FROM DUAL;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de documentos
CREATE OR REPLACE VIEW vista_documentos_listado AS
SELECT
    d.id,
    d.titulo AS nombre,
    d.tipo AS categoria,
    d.visibilidad AS acceso,
    '1.0' AS version,
    1 AS es_ultima_version,
    c.razon_social AS comunidad,
    COALESCE(u.username, 'Sistema') AS subido_por,
    d.created_at AS fecha_subida,
    0 AS contador_descargas,
    NULL AS fecha_expiracion,
    'vigente' AS estado_vigencia
FROM documento_comunidad d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN archivos a_file ON d.id = a_file.entity_id AND a_file.entity_type = 'documento_comunidad'
LEFT JOIN usuario u ON a_file.uploaded_by = u.id;

-- 7.2 Vista para estadísticas de documentos por comunidad
CREATE OR REPLACE VIEW vista_documentos_estadisticas AS
SELECT
    c.razon_social AS comunidad,
    COUNT(d.id) AS total_documentos,
    COUNT(CASE WHEN d.tipo = 'reglamento' THEN 1 END) AS documentos_legales,
    COUNT(CASE WHEN d.tipo = 'acta' THEN 1 END) AS documentos_financieros,
    COUNT(CASE WHEN d.tipo = 'otro' THEN 1 END) AS documentos_tecnicos,
    COUNT(CASE WHEN d.visibilidad = 'publico' THEN 1 END) AS documentos_publicos,
    0 AS total_descargas,
    MAX(d.created_at) AS ultimo_documento
FROM comunidad c
LEFT JOIN documento_comunidad d ON c.id = d.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de documentos
CREATE OR REPLACE VIEW vista_documentos_dashboard AS
SELECT
    'total' AS tipo,
    COUNT(*) AS valor
FROM documento_comunidad
UNION ALL
SELECT
    'descargas_totales' AS tipo,
    0 AS valor
FROM DUAL -- SIMULADO
UNION ALL
SELECT
    'expirados' AS tipo,
    0 AS valor
FROM DUAL -- SIMULADO
UNION ALL
SELECT
    'expiran_pronto' AS tipo,
    0 AS valor
FROM DUAL -- SIMULADO
UNION ALL
SELECT
    'sin_descargas' AS tipo,
    COUNT(*) AS valor
FROM documento_comunidad; -- SIMULADO

-- =========================================
-- 8. ÍNDICES RECOMENDADOS (AJUSTADOS A LAS TABLAS EXISTENTES)
-- =========================================

-- Índices para búsquedas frecuentes en documento_comunidad
CREATE INDEX idx_documento_comunidad_id ON documento_comunidad(comunidad_id);
CREATE INDEX idx_documento_comunidad_tipo ON documento_comunidad(tipo);
CREATE INDEX idx_documento_comunidad_acceso ON documento_comunidad(visibilidad);
CREATE INDEX idx_documento_comunidad_fecha_subida ON documento_comunidad(created_at DESC);
CREATE INDEX idx_documento_comunidad_titulo ON documento_comunidad(titulo);

-- Índices para Joins a Archivos
CREATE INDEX idx_archivos_entity_doc_comunidad ON archivos(entity_type, entity_id, uploaded_by);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_documento_comunidad_comunidad_tipo ON documento_comunidad(comunidad_id, tipo);
CREATE INDEX idx_documento_comunidad_acceso_fecha ON documento_comunidad(visibilidad, created_at DESC);