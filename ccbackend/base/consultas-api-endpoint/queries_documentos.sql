-- =========================================
-- CONSULTAS SQL PARA EL MÓDULO DOCUMENTOS
-- Sistema: Cuentas Claras
-- Fecha: 2025-10-13
-- =========================================

-- =========================================
-- 1. LISTADOS BÁSICOS CON FILTROS
-- =========================================

-- 1.1 Listado básico de documentos con filtros
SELECT
    d.id,
    d.nombre,
    d.descripcion,
    d.categoria,
    d.acceso,
    d.nombre_archivo,
    d.tamano_archivo,
    d.version,
    d.es_ultima_version,
    c.razon_social as comunidad,
    u.nombre as subido_por,
    d.fecha_subida,
    d.fecha_modificacion,
    d.fecha_expiracion,
    d.notas,
    d.url_descarga,
    d.contador_descargas,
    d.ultima_descarga,
    -- Información adicional calculada
    CASE
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 'expirado'
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expira_pronto'
        ELSE 'vigente'
    END as estado_vigencia,
    DATEDIFF(CURDATE(), d.fecha_subida) as dias_desde_subida,
    CASE
        WHEN d.contador_descargas > 0 THEN d.contador_descargas
        ELSE 0
    END as popularidad,
    -- Conteos relacionados
    (SELECT COUNT(*) FROM documento_version dv WHERE dv.documento_id = d.id) as num_versiones,
    (SELECT COUNT(*) FROM documento_comentario dc WHERE dc.documento_id = d.id) as num_comentarios
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE
    (:comunidad_id IS NULL OR d.comunidad_id = :comunidad_id) AND
    (:categoria IS NULL OR d.categoria = :categoria) AND
    (:acceso IS NULL OR d.acceso = :acceso) AND
    (:usuario_subio_id IS NULL OR d.usuario_subio_id = :usuario_subio_id) AND
    (:fecha_desde IS NULL OR d.fecha_subida >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR d.fecha_subida <= :fecha_hasta) AND
    (:estado_vigencia IS NULL OR (
        CASE
            WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 'expirado'
            WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expira_pronto'
            ELSE 'vigente'
        END = :estado_vigencia
    ))
ORDER BY
    CASE
        WHEN :ordenar_por = 'fecha' THEN d.fecha_subida
        WHEN :ordenar_por = 'popularidad' THEN d.contador_descargas
        WHEN :ordenar_por = 'vigencia' THEN d.fecha_expiracion
        ELSE d.fecha_subida
    END DESC,
    d.id DESC
LIMIT :limit OFFSET :offset;

-- 1.2 Listado de documentos por comunidad con estadísticas
SELECT
    c.razon_social as comunidad,
    COUNT(d.id) as total_documentos,
    COUNT(CASE WHEN d.categoria = 'legal' THEN 1 END) as documentos_legales,
    COUNT(CASE WHEN d.categoria = 'financial' THEN 1 END) as documentos_financieros,
    COUNT(CASE WHEN d.categoria = 'technical' THEN 1 END) as documentos_tecnicos,
    COUNT(CASE WHEN d.acceso = 'public' THEN 1 END) as documentos_publicos,
    COUNT(CASE WHEN d.acceso = 'residents' THEN 1 END) as documentos_residentes,
    COUNT(CASE WHEN d.acceso = 'owners' THEN 1 END) as documentos_propietarios,
    COUNT(CASE WHEN d.acceso = 'admin' THEN 1 END) as documentos_admin,
    SUM(d.contador_descargas) as total_descargas,
    AVG(d.contador_descargas) as promedio_descargas,
    MAX(d.fecha_subida) as ultimo_documento
FROM comunidad c
LEFT JOIN documento d ON c.id = d.comunidad_id
GROUP BY c.id, c.razon_social
ORDER BY c.razon_social;

-- 1.3 Documentos próximos a expirar (30 días)
SELECT
    d.id,
    d.nombre,
    d.categoria,
    d.acceso,
    c.razon_social as comunidad,
    u.nombre as subido_por,
    d.fecha_expiracion,
    DATEDIFF(d.fecha_expiracion, CURDATE()) as dias_restantes,
    CASE
        WHEN DATEDIFF(d.fecha_expiracion, CURDATE()) <= 0 THEN 'expirado'
        WHEN DATEDIFF(d.fecha_expiracion, CURDATE()) <= 7 THEN 'critico'
        WHEN DATEDIFF(d.fecha_expiracion, CURDATE()) <= 15 THEN 'urgente'
        ELSE 'advertencia'
    END as nivel_urgencia,
    d.contador_descargas,
    d.ultima_descarga
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE d.fecha_expiracion IS NOT NULL
    AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY d.fecha_expiracion ASC;

-- =========================================
-- 2. VISTAS DETALLADAS
-- =========================================

-- 2.1 Vista detallada de un documento específico
SELECT
    d.id,
    d.nombre,
    d.descripcion,
    d.categoria,
    d.acceso,
    d.nombre_archivo,
    d.tamano_archivo,
    d.version,
    d.es_ultima_version,
    c.id as comunidad_id,
    c.razon_social as comunidad_nombre,
    u.id as subido_por_id,
    u.nombre as subido_por_nombre,
    u.email as subido_por_email,
    d.fecha_subida,
    d.fecha_modificacion,
    d.fecha_expiracion,
    d.notas,
    d.url_descarga,
    d.contador_descargas,
    d.ultima_descarga,
    -- Información adicional calculada
    CASE
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 'expirado'
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expira_pronto'
        ELSE 'vigente'
    END as estado_vigencia,
    DATEDIFF(CURDATE(), d.fecha_subida) as antiguedad_dias,
    CASE
        WHEN d.ultima_descarga IS NOT NULL THEN DATEDIFF(CURDATE(), d.ultima_descarga)
        ELSE NULL
    END as dias_sin_descarga,
    -- Conteos relacionados
    (SELECT COUNT(*) FROM documento_version dv WHERE dv.documento_id = d.id) as num_versiones,
    (SELECT COUNT(*) FROM documento_comentario dc WHERE dc.documento_id = d.id) as num_comentarios,
    (SELECT COUNT(*) FROM documento_etiqueta de WHERE de.documento_id = d.id) as num_etiquetas
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE d.id = :documento_id;

-- 2.2 Vista de documentos con información completa para listado
SELECT
    d.id,
    d.nombre,
    d.descripcion,
    d.categoria,
    d.acceso,
    d.version,
    d.es_ultima_version,
    c.razon_social as comunidad,
    u.nombre as subido_por,
    d.fecha_subida,
    d.contador_descargas,
    JSON_OBJECT(
        'documento', JSON_OBJECT(
            'id', d.id,
            'nombre', d.nombre,
            'categoria', d.categoria,
            'acceso', d.acceso,
            'version', d.version
        ),
        'comunidad', JSON_OBJECT(
            'id', c.id,
            'razon_social', c.razon_social
        ),
        'subido_por', CASE
            WHEN u.id IS NOT NULL THEN JSON_OBJECT(
                'id', u.id,
                'nombre', u.nombre,
                'email', u.email
            )
            ELSE NULL
        END,
        'estadisticas', JSON_OBJECT(
            'descargas', d.contador_descargas,
            'ultima_descarga', d.ultima_descarga,
            'versiones', (SELECT COUNT(*) FROM documento_version dv WHERE dv.documento_id = d.id)
        ),
        'etiquetas', (
            SELECT JSON_ARRAYAGG(etiqueta)
            FROM documento_etiqueta de
            WHERE de.documento_id = d.id
        )
    ) as informacion_completa
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
ORDER BY d.fecha_subida DESC;

-- =========================================
-- 3. ESTADÍSTICAS
-- =========================================

-- 3.1 Estadísticas generales de documentos
SELECT
    COUNT(*) as total_documentos,
    COUNT(DISTINCT comunidad_id) as comunidades_con_documentos,
    COUNT(CASE WHEN es_ultima_version = 1 THEN 1 END) as documentos_ultima_version,
    COUNT(CASE WHEN fecha_expiracion IS NOT NULL THEN 1 END) as documentos_con_expiracion,
    COUNT(CASE WHEN fecha_expiracion IS NOT NULL AND fecha_expiracion < CURDATE() THEN 1 END) as documentos_expirados,
    SUM(contador_descargas) as total_descargas,
    AVG(contador_descargas) as promedio_descargas_por_documento,
    MIN(fecha_subida) as primer_documento,
    MAX(fecha_subida) as ultimo_documento,
    ROUND(
        (COUNT(CASE WHEN contador_descargas > 0 THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_documentos_descargados
FROM documento;

-- 3.2 Estadísticas por categoría
SELECT
    categoria,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM documento)), 2
    ) as porcentaje,
    SUM(contador_descargas) as total_descargas,
    AVG(contador_descargas) as promedio_descargas,
    COUNT(CASE WHEN es_ultima_version = 1 THEN 1 END) as versiones_actuales,
    COUNT(CASE WHEN fecha_expiracion IS NOT NULL AND fecha_expiracion < CURDATE() THEN 1 END) as expirados,
    MIN(fecha_subida) as mas_antiguo,
    MAX(fecha_subida) as mas_reciente
FROM documento
GROUP BY categoria
ORDER BY cantidad DESC;

-- 3.3 Estadísticas por nivel de acceso
SELECT
    acceso,
    COUNT(*) as cantidad,
    ROUND(
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM documento)), 2
    ) as porcentaje,
    SUM(contador_descargas) as total_descargas,
    AVG(contador_descargas) as promedio_descargas,
    COUNT(DISTINCT comunidad_id) as comunidades_afectadas,
    CASE acceso
        WHEN 'public' THEN 'Público'
        WHEN 'residents' THEN 'Residentes'
        WHEN 'owners' THEN 'Propietarios'
        WHEN 'admin' THEN 'Administración'
    END as descripcion_acceso
FROM documento
GROUP BY acceso
ORDER BY cantidad DESC;

-- 3.4 Estadísticas mensuales de documentos
SELECT
    YEAR(fecha_subida) as anio,
    MONTH(fecha_subida) as mes,
    COUNT(*) as documentos_subidos,
    COUNT(DISTINCT categoria) as categorias_usadas,
    SUM(contador_descargas) as descargas_mes,
    COUNT(CASE WHEN acceso = 'public' THEN 1 END) as documentos_publicos,
    COUNT(CASE WHEN acceso = 'admin' THEN 1 END) as documentos_admin,
    AVG(contador_descargas) as promedio_descargas
FROM documento
WHERE fecha_subida >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(fecha_subida), MONTH(fecha_subida)
ORDER BY anio DESC, mes DESC;

-- 3.5 Estadísticas de descargas por documento
SELECT
    d.nombre as documento,
    d.categoria,
    d.acceso,
    c.razon_social as comunidad,
    d.contador_descargas,
    d.ultima_descarga,
    DATEDIFF(CURDATE(), d.fecha_subida) as dias_desde_subida,
    CASE
        WHEN d.contador_descargas = 0 THEN 'nunca_descargado'
        WHEN d.contador_descargas <= 5 THEN 'poco_descargado'
        WHEN d.contador_descargas <= 20 THEN 'moderadamente_descargado'
        ELSE 'muy_descargado'
    END as nivel_popularidad,
    RANK() OVER (ORDER BY d.contador_descargas DESC) as ranking_popularidad
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
ORDER BY d.contador_descargas DESC, d.fecha_subida DESC;

-- =========================================
-- 4. BÚSQUEDAS FILTRADAS
-- =========================================

-- 4.1 Búsqueda avanzada de documentos
SELECT
    d.id,
    d.nombre,
    d.descripcion,
    d.categoria,
    d.acceso,
    d.version,
    d.es_ultima_version,
    c.razon_social as comunidad,
    u.nombre as subido_por,
    d.fecha_subida,
    d.contador_descargas,
    d.fecha_expiracion,
    CASE
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 'expirado'
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expira_pronto'
        ELSE 'vigente'
    END as estado_vigencia
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE
    (:busqueda IS NULL OR
     d.nombre LIKE CONCAT('%', :busqueda, '%') OR
     d.descripcion LIKE CONCAT('%', :busqueda, '%') OR
     EXISTS (
         SELECT 1 FROM documento_etiqueta de
         WHERE de.documento_id = d.id AND de.etiqueta LIKE CONCAT('%', :busqueda, '%')
     )) AND
    (:comunidad_id IS NULL OR d.comunidad_id = :comunidad_id) AND
    (:categoria IS NULL OR d.categoria = :categoria) AND
    (:acceso IS NULL OR d.acceso = :acceso) AND
    (:usuario_subio_id IS NULL OR d.usuario_subio_id = :usuario_subio_id) AND
    (:fecha_desde IS NULL OR d.fecha_subida >= :fecha_desde) AND
    (:fecha_hasta IS NULL OR d.fecha_subida <= :fecha_hasta) AND
    (:solo_ultimas_versiones IS NULL OR d.es_ultima_version = :solo_ultimas_versiones) AND
    (:estado_vigencia IS NULL OR (
        CASE
            WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 'expirado'
            WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expira_pronto'
            ELSE 'vigente'
        END = :estado_vigencia
    ))
ORDER BY d.fecha_subida DESC, d.id DESC
LIMIT :limit OFFSET :offset;

-- 4.2 Documentos por usuario que los subió
SELECT
    u.id as usuario_id,
    u.nombre as subido_por,
    u.email,
    COUNT(d.id) as total_documentos,
    COUNT(DISTINCT d.categoria) as categorias_usadas,
    SUM(d.contador_descargas) as total_descargas,
    AVG(d.contador_descargas) as promedio_descargas,
    MAX(d.fecha_subida) as ultimo_documento,
    MIN(d.fecha_subida) as primer_documento,
    COUNT(CASE WHEN d.acceso = 'public' THEN 1 END) as documentos_publicos,
    COUNT(CASE WHEN d.acceso = 'admin' THEN 1 END) as documentos_restringidos
FROM usuario u
LEFT JOIN documento d ON u.id = d.usuario_subio_id
WHERE (:comunidad_id IS NULL OR d.comunidad_id = :comunidad_id)
GROUP BY u.id, u.nombre, u.email
HAVING COUNT(d.id) > 0
ORDER BY total_documentos DESC;

-- 4.3 Documentos más descargados
SELECT
    d.id,
    d.nombre,
    d.categoria,
    d.acceso,
    c.razon_social as comunidad,
    u.nombre as subido_por,
    d.contador_descargas,
    d.ultima_descarga,
    DATEDIFF(CURDATE(), d.fecha_subida) as dias_desde_subida,
    RANK() OVER (ORDER BY d.contador_descargas DESC) as ranking,
    CASE
        WHEN d.contador_descargas >= 50 THEN 'muy_popular'
        WHEN d.contador_descargas >= 20 THEN 'popular'
        WHEN d.contador_descargas >= 5 THEN 'moderado'
        ELSE 'poco_popular'
    END as nivel_popularidad
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE d.contador_descargas > 0
ORDER BY d.contador_descargas DESC, d.ultima_descarga DESC
LIMIT 20;

-- =========================================
-- 5. EXPORTACIONES
-- =========================================

-- 5.1 Exportación completa de documentos para Excel/CSV
SELECT
    d.id as 'ID',
    d.nombre as 'Nombre',
    d.descripcion as 'Descripción',
    d.categoria as 'Categoría',
    d.acceso as 'Acceso',
    d.nombre_archivo as 'Archivo',
    d.tamano_archivo as 'Tamaño',
    d.version as 'Versión',
    CASE WHEN d.es_ultima_version = 1 THEN 'Sí' ELSE 'No' END as 'Es Última Versión',
    c.razon_social as 'Comunidad',
    COALESCE(u.nombre, '') as 'Subido Por',
    DATE_FORMAT(d.fecha_subida, '%Y-%m-%d %H:%i:%s') as 'Fecha Subida',
    DATE_FORMAT(d.fecha_modificacion, '%Y-%m-%d %H:%i:%s') as 'Última Modificación',
    DATE_FORMAT(d.fecha_expiracion, '%Y-%m-%d') as 'Fecha Expiración',
    d.contador_descargas as 'Descargas',
    DATE_FORMAT(d.ultima_descarga, '%Y-%m-%d %H:%i:%s') as 'Última Descarga',
    d.notas as 'Notas'
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
ORDER BY d.fecha_subida DESC;

-- 5.2 Exportación de documentos por categoría
SELECT
    d.categoria as 'Categoría',
    COUNT(*) as 'Cantidad',
    SUM(d.contador_descargas) as 'Total Descargas',
    AVG(d.contador_descargas) as 'Promedio Descargas',
    COUNT(CASE WHEN d.acceso = 'public' THEN 1 END) as 'Públicos',
    COUNT(CASE WHEN d.acceso = 'residents' THEN 1 END) as 'Para Residentes',
    COUNT(CASE WHEN d.acceso = 'owners' THEN 1 END) as 'Para Propietarios',
    COUNT(CASE WHEN d.acceso = 'admin' THEN 1 END) as 'Para Admin',
    MIN(d.fecha_subida) as 'Primer Documento',
    MAX(d.fecha_subida) as 'Último Documento'
FROM documento d
GROUP BY d.categoria
ORDER BY COUNT(*) DESC;

-- 5.3 Exportación de estadísticas de uso
SELECT
    YEAR(d.fecha_subida) as 'Año',
    MONTH(d.fecha_subida) as 'Mes',
    COUNT(*) as 'Documentos Subidos',
    SUM(d.contador_descargas) as 'Total Descargas',
    ROUND(AVG(d.contador_descargas), 2) as 'Promedio Descargas',
    COUNT(DISTINCT d.categoria) as 'Categorías Usadas',
    COUNT(CASE WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 1 END) as 'Documentos Expirados',
    COUNT(CASE WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion >= CURDATE() THEN 1 END) as 'Documentos Vigentes'
FROM documento d
WHERE d.fecha_subida >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY YEAR(d.fecha_subida), MONTH(d.fecha_subida)
ORDER BY YEAR(d.fecha_subida) DESC, MONTH(d.fecha_subida) DESC;

-- =========================================
-- 6. VALIDACIONES
-- =========================================

-- 6.1 Validar integridad de documentos
SELECT
    'Documentos sin comunidad' as validacion,
    COUNT(*) as cantidad
FROM documento d
LEFT JOIN comunidad c ON d.comunidad_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT
    'Documentos sin usuario que los subió' as validacion,
    COUNT(*) as cantidad
FROM documento d
LEFT JOIN usuario u ON d.usuario_subio_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT
    'Documentos con fecha de expiración anterior a subida' as validacion,
    COUNT(*) as cantidad
FROM documento
WHERE fecha_expiracion < fecha_subida
UNION ALL
SELECT
    'Documentos expirados sin marcar como no última versión' as validacion,
    COUNT(*) as cantidad
FROM documento
WHERE fecha_expiracion < CURDATE() AND es_ultima_version = 1
UNION ALL
SELECT
    'Documentos sin nombre de archivo' as validacion,
    COUNT(*) as cantidad
FROM documento
WHERE nombre_archivo IS NULL OR nombre_archivo = '';

-- 6.2 Validar consistencia de versiones
SELECT
    'Documentos con múltiples versiones marcadas como última' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Documento: ', d.nombre, ' (ID: ', d.id, ')')
        SEPARATOR '; '
    ) as detalles
FROM documento d
WHERE (
    SELECT COUNT(*)
    FROM documento d2
    WHERE d2.nombre = d.nombre AND d2.comunidad_id = d.comunidad_id AND d2.es_ultima_version = 1
) > 1;

-- 6.3 Validar estadísticas de descargas
SELECT
    'Documentos con descargas pero sin última descarga' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Documento: ', nombre, ' (', contador_descargas, ' descargas)')
        SEPARATOR '; '
    ) as detalles
FROM documento
WHERE contador_descargas > 0 AND ultima_descarga IS NULL
UNION ALL
SELECT
    'Documentos con última descarga anterior a subida' as validacion,
    COUNT(*) as cantidad_errores,
    GROUP_CONCAT(
        CONCAT('Documento: ', nombre, ' (subida: ', fecha_subida, ', descarga: ', ultima_descarga, ')')
        SEPARATOR '; '
    ) as detalles
FROM documento
WHERE ultima_descarga < fecha_subida;

-- =========================================
-- 7. VISTAS OPTIMIZADAS
-- =========================================

-- 7.1 Vista para listado rápido de documentos
CREATE OR REPLACE VIEW vista_documentos_listado AS
SELECT
    d.id,
    d.nombre,
    d.descripcion,
    d.categoria,
    d.acceso,
    d.version,
    d.es_ultima_version,
    c.razon_social as comunidad,
    u.nombre as subido_por,
    d.fecha_subida,
    d.contador_descargas,
    d.fecha_expiracion,
    CASE
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion < CURDATE() THEN 'expirado'
        WHEN d.fecha_expiracion IS NOT NULL AND d.fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expira_pronto'
        ELSE 'vigente'
    END as estado_vigencia
FROM documento d
JOIN comunidad c ON d.comunidad_id = c.id
LEFT JOIN usuario u ON d.usuario_subio_id = u.id;

-- 7.2 Vista para estadísticas de documentos por comunidad
CREATE OR REPLACE VIEW vista_documentos_estadisticas AS
SELECT
    c.razon_social as comunidad,
    COUNT(d.id) as total_documentos,
    COUNT(CASE WHEN d.categoria = 'legal' THEN 1 END) as documentos_legales,
    COUNT(CASE WHEN d.categoria = 'financial' THEN 1 END) as documentos_financieros,
    COUNT(CASE WHEN d.categoria = 'technical' THEN 1 END) as documentos_tecnicos,
    COUNT(CASE WHEN d.acceso = 'public' THEN 1 END) as documentos_publicos,
    SUM(d.contador_descargas) as total_descargas,
    MAX(d.fecha_subida) as ultimo_documento
FROM comunidad c
LEFT JOIN documento d ON c.id = d.comunidad_id
GROUP BY c.id, c.razon_social;

-- 7.3 Vista para dashboard de documentos
CREATE OR REPLACE VIEW vista_documentos_dashboard AS
SELECT
    'total' as tipo,
    COUNT(*) as valor
FROM documento
UNION ALL
SELECT
    'descargas_totales' as tipo,
    SUM(contador_descargas) as valor
FROM documento
UNION ALL
SELECT
    'expirados' as tipo,
    COUNT(*) as valor
FROM documento
WHERE fecha_expiracion IS NOT NULL AND fecha_expiracion < CURDATE()
UNION ALL
SELECT
    'expiran_pronto' as tipo,
    COUNT(*) as valor
FROM documento
WHERE fecha_expiracion IS NOT NULL AND fecha_expiracion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND fecha_expiracion >= CURDATE()
UNION ALL
SELECT
    'sin_descargas' as tipo,
    COUNT(*) as valor
FROM documento
WHERE contador_descargas = 0;

-- =========================================
-- 8. ÍNDICES RECOMENDADOS
-- =========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_documento_comunidad_id ON documento(comunidad_id);
CREATE INDEX idx_documento_usuario_subio_id ON documento(usuario_subio_id);
CREATE INDEX idx_documento_categoria ON documento(categoria);
CREATE INDEX idx_documento_acceso ON documento(acceso);
CREATE INDEX idx_documento_fecha_subida ON documento(fecha_subida DESC);
CREATE INDEX idx_documento_fecha_expiracion ON documento(fecha_expiracion);
CREATE INDEX idx_documento_es_ultima_version ON documento(es_ultima_version);

-- Índices compuestos para filtros avanzados
CREATE INDEX idx_documento_comunidad_categoria ON documento(comunidad_id, categoria);
CREATE INDEX idx_documento_acceso_fecha ON documento(acceso, fecha_subida DESC);
CREATE INDEX idx_documento_categoria_acceso ON documento(categoria, acceso);
CREATE INDEX idx_documento_fecha_rango ON documento(fecha_subida, fecha_expiracion);

-- Índice para estadísticas mensuales
CREATE INDEX idx_documento_anio_mes ON documento(YEAR(fecha_subida), MONTH(fecha_subida));

-- Índices para búsquedas por nombre y descripción
CREATE INDEX idx_documento_nombre ON documento(nombre(100));
CREATE INDEX idx_documento_descripcion ON documento(descripcion(200));

-- Índices para estadísticas de descargas
CREATE INDEX idx_documento_contador_descargas ON documento(contador_descargas DESC);
CREATE INDEX idx_documento_ultima_descarga ON documento(ultima_descarga DESC);

-- Índices para validaciones
CREATE INDEX idx_documento_fechas_validacion ON documento(fecha_subida, fecha_expiracion, ultima_descarga);

-- Índices para etiquetas (si se busca por etiquetas frecuentemente)
CREATE INDEX idx_documento_etiqueta_documento_id ON documento_etiqueta(documento_id);
CREATE INDEX idx_documento_etiqueta_etiqueta ON documento_etiqueta(etiqueta(50));