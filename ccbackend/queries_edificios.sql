-- =====================================================
-- QUERIES PARA EL COMPONENTE DE EDIFICIOS
-- Sistema: Cuentas Claras
-- Fecha: 2025-09-22
-- =====================================================

-- =====================================================
-- 1. LISTADO DE EDIFICIOS (Página principal)
-- =====================================================

-- 1.1 Obtener todos los edificios con información básica y estadísticas
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    e.created_at AS fecha_creacion,
    e.updated_at AS fecha_actualizacion,
    c.razon_social AS comunidad_nombre,
    c.id AS comunidad_id,
    -- Estadísticas calculadas
    COUNT(DISTINCT t.id) AS numero_torres,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_activas,
    -- Estado del edificio (basado en unidades activas)
    CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 'construccion'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activo'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactivo'
        ELSE 'mantenimiento'
    END AS estado
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
LEFT JOIN torre t ON e.id = t.edificio_id
LEFT JOIN unidad u ON e.id = u.edificio_id
GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at, c.razon_social, c.id
ORDER BY e.nombre;

-- 1.2 Obtener edificio específico por ID
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    e.created_at AS fecha_creacion,
    e.updated_at AS fecha_actualizacion,
    c.razon_social AS comunidad_nombre,
    c.id AS comunidad_id,
    c.direccion AS comunidad_direccion,
    c.email_contacto AS comunidad_email,
    c.telefono_contacto AS comunidad_telefono,
    -- Estadísticas calculadas
    COUNT(DISTINCT t.id) AS numero_torres,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS total_unidades_ocupadas,
    -- Cálculo de pisos (máximo número en código de unidad)
    COALESCE(MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(u.codigo, '-', -1), '', 1) AS UNSIGNED)), 1) AS pisos,
    -- Estado del edificio
    CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 'construccion'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activo'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactivo'
        ELSE 'mantenimiento'
    END AS estado,
    -- Tipo de edificio (inferido por zona)
    CASE 
        WHEN c.direccion LIKE '%Las Condes%' OR c.direccion LIKE '%Vitacura%' OR c.direccion LIKE '%Providencia%' THEN 'residencial'
        WHEN c.direccion LIKE '%Centro%' THEN 'comercial'
        ELSE 'mixto'
    END AS tipo
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
LEFT JOIN torre t ON e.id = t.edificio_id
LEFT JOIN unidad u ON e.id = u.edificio_id
WHERE e.id = 1
GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at, 
         c.razon_social, c.id, c.direccion, c.email_contacto, c.telefono_contacto;

-- 1.3 Obtener estadísticas generales de edificios
SELECT 
    COUNT(*) AS total_edificios,
    COUNT(CASE WHEN (
        SELECT COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) 
        FROM unidad u WHERE u.edificio_id = e.id
    ) > 0 THEN 1 END) AS edificios_activos,
    SUM((SELECT COUNT(DISTINCT u.id) FROM unidad u WHERE u.edificio_id = e.id)) AS total_unidades,
    SUM((SELECT COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) FROM unidad u WHERE u.edificio_id = e.id)) AS unidades_ocupadas,
    ROUND(
        (SUM((SELECT COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) FROM unidad u WHERE u.edificio_id = e.id)) / 
         NULLIF(SUM((SELECT COUNT(DISTINCT u.id) FROM unidad u WHERE u.edificio_id = e.id)), 0)) * 100, 2
    ) AS ocupacion
FROM edificio e;

-- =====================================================
-- 2. FILTROS Y BÚSQUEDAS
-- =====================================================

-- 2.1 Búsqueda por texto (nombre, código, dirección)
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    c.razon_social AS comunidad_nombre
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
WHERE (
    e.nombre LIKE '%Torre%' OR
    e.codigo LIKE '%Torre%' OR
    e.direccion LIKE '%Torre%' OR
    c.razon_social LIKE '%Torre%'
)
ORDER BY e.nombre;

-- 2.2 Filtrar por comunidad
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    c.razon_social AS comunidad_nombre
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
WHERE c.id = 1
ORDER BY e.nombre;

-- 2.3 Filtrar por rango de fechas
SELECT 
    e.id,
    e.nombre,
    e.created_at AS fecha_creacion
FROM edificio e
WHERE e.created_at BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY e.created_at DESC;

-- =====================================================
-- 3. DETALLE DEL EDIFICIO
-- =====================================================

-- 3.1 Información completa del edificio ID=1
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    e.created_at AS fecha_creacion,
    e.updated_at AS fecha_actualizacion,
    c.id AS comunidad_id,
    c.razon_social AS comunidad_nombre,
    c.direccion AS comunidad_direccion,
    c.email_contacto AS email_administrador,
    c.telefono_contacto AS telefono_administrador,
    'María González' AS administrador, -- Campo inferido
    2020 AS ano_construccion, -- Campo inferido
    -- Estadísticas
    COUNT(DISTINCT t.id) AS numero_torres,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS total_unidades_ocupadas,
    15 AS pisos, -- Campo inferido
    'residencial' AS tipo, -- Campo inferido
    -- Coordenadas aproximadas (Las Condes)
    -33.4103 AS latitud,
    -70.5398 AS longitud,
    '/images/edificio-placeholder.jpg' AS imagen,
    'Edificio en excelente estado, con mantenimiento regular y buena administración.' AS observaciones,
    1200.00 AS area_comun,
    3500.00 AS area_privada,
    45 AS parqueaderos,
    30 AS depositos,
    -- Estado
    CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 'construccion'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activo'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactivo'
        ELSE 'mantenimiento'
    END AS estado
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
LEFT JOIN torre t ON e.id = t.edificio_id
LEFT JOIN unidad u ON e.id = u.edificio_id
WHERE e.id = 1
GROUP BY e.id, e.nombre, e.codigo, e.direccion, e.created_at, e.updated_at,
         c.id, c.razon_social, c.direccion, c.email_contacto, c.telefono_contacto;

-- =====================================================
-- 4. TORRES DEL EDIFICIO
-- =====================================================

-- 4.1 Obtener torres del edificio ID=1
SELECT 
    t.id,
    t.edificio_id,
    t.nombre,
    t.codigo,
    t.created_at AS fecha_creacion,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_ocupadas,
    -- Cálculo de pisos mejorado
    COALESCE(
        NULLIF(
            MAX(
                CASE 
                    WHEN u.codigo REGEXP '^[A-Z]+-[0-9]+$' THEN 
                        CAST(LEFT(SUBSTRING(u.codigo, LOCATE('-', u.codigo) + 1), 1) AS UNSIGNED)
                    ELSE NULL
                END
            ), 0
        ), 1
    ) AS pisos,
    -- Cálculo de unidades por piso con protección contra división por 0
    CASE 
        WHEN COUNT(DISTINCT u.id) > 0 AND COALESCE(
            NULLIF(
                MAX(
                    CASE 
                        WHEN u.codigo REGEXP '^[A-Z]+-[0-9]+$' THEN 
                            CAST(LEFT(SUBSTRING(u.codigo, LOCATE('-', u.codigo) + 1), 1) AS UNSIGNED)
                        ELSE NULL
                    END
                ), 0
            ), 1
        ) > 0 THEN 
            ROUND(
                COUNT(DISTINCT u.id) / 
                COALESCE(
                    NULLIF(
                        MAX(
                            CASE 
                                WHEN u.codigo REGEXP '^[A-Z]+-[0-9]+$' THEN 
                                    CAST(LEFT(SUBSTRING(u.codigo, LOCATE('-', u.codigo) + 1), 1) AS UNSIGNED)
                                ELSE NULL
                            END
                        ), 0
                    ), 1
                )
            )
        ELSE 0
    END AS unidades_por_piso,
    CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 'inactiva'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activa'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactiva'
        ELSE 'mantenimiento'
    END AS estado,
    'Torre principal con vista al parque' AS observaciones
FROM torre t
LEFT JOIN unidad u ON t.id = u.torre_id
WHERE t.edificio_id = 1
GROUP BY t.id, t.edificio_id, t.nombre, t.codigo, t.created_at
ORDER BY t.nombre;

-- 4.1b Versión simplificada de torres (sin cálculos complejos)
SELECT 
    t.id,
    t.edificio_id,
    t.nombre,
    t.codigo,
    t.created_at AS fecha_creacion,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_ocupadas,
    10 AS pisos, -- Valor fijo por ahora
    CASE 
        WHEN COUNT(DISTINCT u.id) > 0 THEN ROUND(COUNT(DISTINCT u.id) / 10)
        ELSE 0
    END AS unidades_por_piso,
    CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 'inactiva'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activa'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactiva'
        ELSE 'mantenimiento'
    END AS estado,
    'Torre principal con vista al parque' AS observaciones
FROM torre t
LEFT JOIN unidad u ON t.id = u.torre_id
WHERE t.edificio_id = 1
GROUP BY t.id, t.edificio_id, t.nombre, t.codigo, t.created_at
ORDER BY t.nombre;

-- =====================================================
-- 5. UNIDADES DEL EDIFICIO
-- =====================================================

-- 5.1 Obtener todas las unidades del edificio ID=1
SELECT 
    u.id,
    u.edificio_id,
    u.torre_id,
    u.codigo AS numero,
    -- Inferir piso del código
    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(u.codigo, '-', -1), '', 1) AS UNSIGNED) AS piso,
    'apartamento' AS tipo,
    CASE 
        WHEN u.activa = 1 THEN 'ocupada'
        ELSE 'vacia'
    END AS estado,
    u.m2_utiles AS area,
    2 AS habitaciones, -- Campo inferido
    2 AS banos, -- Campo inferido
    CASE WHEN u.m2_terrazas > 0 THEN 1 ELSE 0 END AS balcon,
    CASE WHEN u.nro_estacionamiento IS NOT NULL THEN 1 ELSE 0 END AS parqueadero,
    CASE WHEN u.nro_bodega IS NOT NULL THEN 1 ELSE 0 END AS deposito,
    u.nro_estacionamiento,
    u.nro_bodega,
    u.created_at AS fecha_creacion,
    t.nombre AS torre_nombre
FROM unidad u
LEFT JOIN torre t ON u.torre_id = t.id
WHERE u.edificio_id = 1
ORDER BY u.codigo;

-- 5.2 Obtener unidades por torre específica
SELECT 
    u.id,
    u.codigo AS numero,
    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(u.codigo, '-', -1), '', 1) AS UNSIGNED) AS piso,
    CASE 
        WHEN u.activa = 1 THEN 'ocupada'
        ELSE 'vacia'
    END AS estado,
    u.m2_utiles AS area,
    u.m2_terrazas,
    u.nro_estacionamiento,
    u.nro_bodega
FROM unidad u
WHERE u.edificio_id = 1 AND u.torre_id = 1
ORDER BY u.codigo;

-- =====================================================
-- 6. SERVICIOS Y AMENIDADES
-- =====================================================

-- 6.1 Obtener amenidades disponibles para el edificio (por comunidad)
SELECT 
    a.id,
    a.nombre,
    a.capacidad,
    a.tarifa,
    a.reglas,
    a.requiere_aprobacion
FROM amenidad a
INNER JOIN edificio e ON a.comunidad_id = e.comunidad_id
WHERE e.id = 1
ORDER BY a.nombre;

-- 6.2 Lista de servicios disponibles (datos maestros)
SELECT 'agua' AS value, 'Agua Potable' AS label
UNION ALL SELECT 'luz', 'Electricidad'
UNION ALL SELECT 'gas', 'Gas Natural'
UNION ALL SELECT 'internet', 'Internet'
UNION ALL SELECT 'vigilancia', 'Vigilancia 24/7'
UNION ALL SELECT 'ascensor', 'Ascensor'
UNION ALL SELECT 'porteria', 'Portería'
UNION ALL SELECT 'citofono', 'Citófono';

-- 6.3 Lista de amenidades disponibles (datos maestros)
SELECT 'piscina' AS value, 'Piscina' AS label
UNION ALL SELECT 'gimnasio', 'Gimnasio'
UNION ALL SELECT 'salon_comunal', 'Salón Comunal'
UNION ALL SELECT 'salon_eventos', 'Salón de Eventos'
UNION ALL SELECT 'quincho', 'Quincho'
UNION ALL SELECT 'multicancha', 'Multicancha'
UNION ALL SELECT 'cancha_tenis', 'Cancha de Tenis'
UNION ALL SELECT 'playground', 'Área de Juegos'
UNION ALL SELECT 'terraza_bbq', 'Terraza BBQ'
UNION ALL SELECT 'porteria', 'Portería'
UNION ALL SELECT 'ascensor', 'Ascensor'
UNION ALL SELECT 'citofono', 'Citófono';

-- =====================================================
-- 7. QUERIES PARA CREAR EDIFICIO
-- =====================================================

-- 7.1 Insertar nuevo edificio
INSERT INTO edificio (comunidad_id, nombre, direccion, codigo) 
VALUES (1, 'Torre Azul', 'Calle 85 # 15-32, Chapinero', 'TA-001');

-- 7.2 Obtener el ID del edificio recién creado
SELECT LAST_INSERT_ID() AS nuevo_edificio_id;

-- =====================================================
-- 8. QUERIES PARA ACTUALIZAR EDIFICIO
-- =====================================================

-- 8.1 Actualizar información del edificio ID=1
UPDATE edificio 
SET 
    nombre = 'Torre Azul Renovada',
    direccion = 'Calle 85 # 15-32, Chapinero Norte',
    codigo = 'TAR-001',
    updated_at = NOW()
WHERE id = 1;

-- 8.2 Verificar la actualización
SELECT 
    id,
    nombre,
    direccion,
    codigo,
    updated_at
FROM edificio 
WHERE id = 1;

-- =====================================================
-- 9. QUERIES PARA ELIMINAR EDIFICIO
-- =====================================================

-- 9.1 Verificar si el edificio tiene unidades antes de eliminar
SELECT 
    COUNT(*) AS total_unidades,
    COUNT(CASE WHEN activa = 1 THEN 1 END) AS unidades_activas,
    COUNT(CASE WHEN activa = 0 THEN 1 END) AS unidades_inactivas
FROM unidad 
WHERE edificio_id = 1;

-- 9.2 Verificar si el edificio tiene torres antes de eliminar
SELECT COUNT(*) AS total_torres
FROM torre 
WHERE edificio_id = 1;

-- 9.3 Eliminar edificio (solo si no tiene dependencias críticas)
-- NOTA: Ejecutar solo después de verificar dependencias
DELETE FROM edificio WHERE id = 1;

-- =====================================================
-- 10. QUERIES PARA CREAR TORRE
-- =====================================================

-- 10.1 Crear nueva torre en edificio ID=1
INSERT INTO torre (edificio_id, nombre, codigo) 
VALUES (1, 'Torre A', 'TA-A');

-- 10.2 Obtener torres después de la creación
SELECT 
    t.id,
    t.nombre,
    t.codigo,
    t.created_at,
    e.nombre AS edificio_nombre
FROM torre t
INNER JOIN edificio e ON t.edificio_id = e.id
WHERE t.edificio_id = 1
ORDER BY t.created_at DESC;

-- =====================================================
-- 11. QUERIES PARA GESTIÓN DE UNIDADES
-- =====================================================

-- 11.1 Crear nueva unidad en edificio ID=1
INSERT INTO unidad (
    comunidad_id, 
    edificio_id, 
    torre_id, 
    codigo, 
    alicuota, 
    m2_utiles, 
    m2_terrazas, 
    nro_bodega, 
    nro_estacionamiento, 
    activa
) VALUES (
    1, -- comunidad_id del edificio
    1, -- edificio_id
    1, -- torre_id (opcional)
    'TN-201', -- código
    0.025000, -- alicuota
    68.50, -- m2_utiles
    8.00, -- m2_terrazas
    'B51', -- nro_bodega
    'E51', -- nro_estacionamiento
    1 -- activa
);

-- =====================================================
-- 12. QUERIES AUXILIARES Y VALIDACIONES
-- =====================================================

-- 12.1 Obtener lista de comunidades para selects
SELECT 
    id,
    razon_social AS nombre,
    direccion,
    email_contacto,
    telefono_contacto
FROM comunidad
ORDER BY razon_social;

-- 12.2 Validar si un código de edificio ya existe
SELECT COUNT(*) AS existe
FROM edificio 
WHERE codigo = 'TA-001' AND comunidad_id = 1;

-- 12.3 Obtener información resumida para cards de edificios
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    c.razon_social AS comunidad_nombre,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_ocupadas,
    ROUND(
        (COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) / 
         NULLIF(COUNT(DISTINCT u.id), 0)) * 100, 1
    ) AS porcentaje_ocupacion,
    CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 'construccion'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = COUNT(DISTINCT u.id) THEN 'activo'
        WHEN COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) = 0 THEN 'inactivo'
        ELSE 'mantenimiento'
    END AS estado
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
LEFT JOIN unidad u ON e.id = u.edificio_id
GROUP BY e.id, e.nombre, e.codigo, e.direccion, c.razon_social
ORDER BY e.nombre;

-- =====================================================
-- 13. QUERIES PARA DASHBOARD Y REPORTES
-- =====================================================

-- 13.1 Estadísticas de ocupación por edificio
SELECT 
    e.nombre AS edificio,
    COUNT(DISTINCT u.id) AS total_unidades,
    COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) AS unidades_ocupadas,
    ROUND(
        (COUNT(DISTINCT CASE WHEN u.activa = 1 THEN u.id END) / 
         NULLIF(COUNT(DISTINCT u.id), 0)) * 100, 1
    ) AS porcentaje_ocupacion
FROM edificio e
LEFT JOIN unidad u ON e.id = u.edificio_id
GROUP BY e.id, e.nombre
HAVING total_unidades > 0
ORDER BY porcentaje_ocupacion DESC;

-- 13.2 Edificios con mayor cantidad de torres
SELECT 
    e.nombre AS edificio,
    c.razon_social AS comunidad,
    COUNT(DISTINCT t.id) AS numero_torres,
    COUNT(DISTINCT u.id) AS total_unidades
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
LEFT JOIN torre t ON e.id = t.edificio_id
LEFT JOIN unidad u ON e.id = u.edificio_id
GROUP BY e.id, e.nombre, c.razon_social
ORDER BY numero_torres DESC, total_unidades DESC;

-- =====================================================
-- 14. QUERIES DE VALIDACIÓN Y TROUBLESHOOTING
-- =====================================================

-- 14.1 Verificar integridad de datos
SELECT 
    'Edificios sin comunidad' AS problema,
    COUNT(*) AS cantidad
FROM edificio e
LEFT JOIN comunidad c ON e.comunidad_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 
    'Torres sin edificio' AS problema,
    COUNT(*) AS cantidad
FROM torre t
LEFT JOIN edificio e ON t.edificio_id = e.id
WHERE e.id IS NULL

UNION ALL

SELECT 
    'Unidades sin edificio' AS problema,
    COUNT(*) AS cantidad
FROM unidad u
LEFT JOIN edificio e ON u.edificio_id = e.id
WHERE e.id IS NULL;

-- 14.2 Edificios con datos inconsistentes
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    COUNT(DISTINCT u.id) AS unidades_en_tabla,
    COUNT(DISTINCT t.id) AS torres_en_tabla
FROM edificio e
LEFT JOIN unidad u ON e.id = u.edificio_id
LEFT JOIN torre t ON e.id = t.edificio_id
GROUP BY e.id, e.nombre, e.codigo
HAVING torres_en_tabla = 0 AND unidades_en_tabla > 0; -- Unidades sin torres

-- =====================================================
-- 15. QUERIES ALTERNATIVAS SIMPLIFICADAS (SIN ERRORES)
-- =====================================================

-- 15.1 Torres básicas sin cálculos complejos
SELECT 
    t.id,
    t.edificio_id,
    t.nombre,
    t.codigo,
    t.created_at AS fecha_creacion,
    t.updated_at AS fecha_actualizacion
FROM torre t
WHERE t.edificio_id = 1
ORDER BY t.nombre;

-- 15.2 Torres con estadísticas básicas
SELECT 
    t.id,
    t.edificio_id,
    t.nombre,
    t.codigo,
    COUNT(u.id) AS total_unidades,
    SUM(CASE WHEN u.activa = 1 THEN 1 ELSE 0 END) AS unidades_ocupadas,
    SUM(CASE WHEN u.activa = 0 OR u.activa IS NULL THEN 1 ELSE 0 END) AS unidades_vacias
FROM torre t
LEFT JOIN unidad u ON t.id = u.torre_id
WHERE t.edificio_id = 1
GROUP BY t.id, t.edificio_id, t.nombre, t.codigo
ORDER BY t.nombre;

-- 15.3 Unidades básicas sin cálculos de piso
SELECT 
    u.id,
    u.edificio_id,
    u.torre_id,
    u.codigo,
    u.m2_utiles,
    u.m2_terrazas,
    u.nro_bodega,
    u.nro_estacionamiento,
    u.activa,
    t.nombre AS torre_nombre
FROM unidad u
LEFT JOIN torre t ON u.torre_id = t.id
WHERE u.edificio_id = 1
ORDER BY u.codigo;

-- 15.4 Edificio básico sin estadísticas complejas
SELECT 
    e.id,
    e.nombre,
    e.codigo,
    e.direccion,
    e.created_at,
    e.updated_at,
    c.razon_social AS comunidad_nombre,
    c.id AS comunidad_id
FROM edificio e
INNER JOIN comunidad c ON e.comunidad_id = c.id
WHERE e.id = 1;

-- 15.5 Conteos simples por edificio
SELECT 
    e.id AS edificio_id,
    e.nombre AS edificio_nombre,
    (SELECT COUNT(*) FROM torre WHERE edificio_id = e.id) AS total_torres,
    (SELECT COUNT(*) FROM unidad WHERE edificio_id = e.id) AS total_unidades,
    (SELECT COUNT(*) FROM unidad WHERE edificio_id = e.id AND activa = 1) AS unidades_activas
FROM edificio e
WHERE e.id = 1;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN:
-- =====================================================

/*
1. Para el frontend, estas queries proporcionan todos los datos necesarios
   para implementar las funcionalidades de:
   - Listado de edificios con filtros
   - Vista detalle de edificio
   - Gestión de torres y unidades
   - Estadísticas y reportes
   - CRUD completo de edificios

2. Los campos inferidos (como tipo, coordenadas, etc.) deberían
   agregarse como columnas reales en la base de datos en producción

3. Para las imágenes, se recomienda implementar un sistema de
   almacenamiento de archivos y guardar solo las URLs en la BD

4. Las validaciones de negocio (como verificar dependencias antes
   de eliminar) deben implementarse en el backend/API

5. Para mejor rendimiento, considerar agregar índices en:
   - edificio.comunidad_id
   - torre.edificio_id  
   - unidad.edificio_id
   - unidad.torre_id
*/