-- ============================================================================
-- Script de Verificación de Vistas
-- ============================================================================
-- Usa este script para verificar que todas las vistas existen y funcionan
-- ============================================================================

USE cuentasclaras;

SELECT '=' AS '', '============================================' AS '';
SELECT '=' AS '', '  VERIFICACIÓN DE VISTAS - Cuentas Claras  ' AS '';
SELECT '=' AS '', '============================================' AS '';
SELECT '' AS '', '' AS '';

-- Listar todas las vistas
SELECT '📋 Vistas Existentes:' AS '';
SELECT '' AS '', '' AS '';

SELECT 
    TABLE_NAME AS 'Vista',
    TABLE_ROWS AS 'Filas (aprox)',
    CREATE_TIME AS 'Fecha Creación'
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'cuentasclaras' 
    AND TABLE_TYPE = 'VIEW'
ORDER BY 
    TABLE_NAME;

SELECT '' AS '', '' AS '';
SELECT '=' AS '', '============================================' AS '';
SELECT '' AS '', '' AS '';

-- Verificar cada vista individualmente
SELECT '🔍 Verificando vista: bitacora_conserjeria' AS '';
SELECT COUNT(*) AS 'Registros' FROM bitacora_conserjeria;

SELECT '🔍 Verificando vista: cargo_financiero_unidad' AS '';
SELECT COUNT(*) AS 'Registros' FROM cargo_financiero_unidad;

SELECT '🔍 Verificando vista: detalle_cargo_unidad' AS '';
SELECT COUNT(*) AS 'Registros' FROM detalle_cargo_unidad;

SELECT '🔍 Verificando vista: emision_gasto_comun' AS '';
SELECT COUNT(*) AS 'Registros' FROM emision_gasto_comun;

SELECT '🔍 Verificando vista: emision_gasto_detalle' AS '';
SELECT COUNT(*) AS 'Registros' FROM emision_gasto_detalle;

SELECT '🔍 Verificando vista: ticket' AS '';
SELECT COUNT(*) AS 'Registros' FROM ticket;

SELECT '🔍 Verificando vista: titularidad_unidad' AS '';
SELECT COUNT(*) AS 'Registros' FROM titularidad_unidad;

SELECT '🔍 Verificando vista: usuario_miembro_comunidad' AS '';
SELECT COUNT(*) AS 'Registros' FROM usuario_miembro_comunidad;

SELECT '' AS '', '' AS '';
SELECT '=' AS '', '============================================' AS '';
SELECT '✅ Verificación Completada' AS '';
SELECT '=' AS '', '============================================' AS '';
